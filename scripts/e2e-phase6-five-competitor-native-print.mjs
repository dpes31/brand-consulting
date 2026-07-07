import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { buildPhase6StepFixtures } from './phase6-e2e-fixtures.mjs';

const appUrl = process.env.PREVIEW_URL;
if (!appUrl) throw new Error('PREVIEW_URL is required.');

const brand = '모노랩';
const competitors = ['알파원', '베타랩', '감마코', '델타택스', '엡실론'];
const artifactDir = path.resolve('phase6-v2-e2e-artifacts');
await mkdir(artifactDir, { recursive: true });

const stepFixtures = buildPhase6StepFixtures(brand);
stepFixtures[0] += '\n핵심 KPI는 **123만 명**과 **456억 원**입니다.';
stepFixtures[2] += `\n${competitors.map((name, index) => `${index + 1}. **${name} — ${91 - index * 8}점:** 직접 경쟁 위협`).join('\n')}`;

const baseStartMarker = '[IMMUTABLE APPROVED BASE HTML — START]';
const baseEndMarker = '[IMMUTABLE APPROVED BASE HTML — END]';
const slotPattern = /\[\[CONTENT:P(\d{2}):([A-Z0-9_-]+):(\d{3})\]\]/g;

function fillResearchSlots(template) {
  let filled = template;
  const inject = (pageNumber, text) => {
    const pattern = new RegExp(`\\[\\[CONTENT:P${pageNumber}:[^\\]]+\\]\\]`);
    filled = filled.replace(pattern, text);
  };
  inject('04', `${brand} KPI 123만 명`);
  inject('04', `${brand} 관리 규모 456억 원`);
  competitors.forEach((name, index) => inject(String(12 + index).padStart(2, '0'), `${name} 직접 경쟁 위협`));

  return filled.replace(slotPattern, (_slot, pageNumber, role, index) => {
    if (role === 'I') return Number(index) % 2 === 0 ? '→' : '≠';
    if (role === 'B') return String((Number(index) % 5) + 1).padStart(2, '0');
    if (role.includes('PERSONA-INDEX')) return pageNumber === '23' ? '02' : pageNumber === '24' ? '03' : '01';
    if (role === 'H1') return `${brand} 조사 전략`;
    if (role === 'H2') return `${brand} P${pageNumber} 조사 결론`;
    if (role.includes('FULL-BREADCRUMB')) return `STEP ${pageNumber} RESEARCH`;
    if (role.includes('FULL-TAG')) return 'RESEARCH';
    if (role.includes('FULL-SOURCE')) return 'QA Fixture · Step 0–5 · 2026';
    if (role === 'STRONG') return '핵심 판단';
    if (role === 'SMALL') return '검증 근거';
    if (role === 'SPAN') return '조사 항목';
    if (role === 'P') return '현재 조사에서 확인된 핵심 근거와 실행 의미';
    return `${brand} 조사 근거 ${pageNumber}-${index}`;
  });
}

function command(name, args) {
  return execFileSync(name, args, { encoding: 'utf8' });
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ acceptDownloads: true, viewport: { width: 1600, height: 1000 } });
await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: new URL(appUrl).origin });
const page = await context.newPage();
const dialogs = [];
page.on('dialog', async (dialog) => { dialogs.push(dialog.message()); await dialog.accept(); });

try {
  await page.goto(appUrl, { waitUntil: 'networkidle', timeout: 120000 });
  await page.getByPlaceholder('Enter brand name for deep-dive analysis...').fill(brand);
  await page.getByRole('button', { name: 'Start Engine' }).click();

  for (let step = 0; step < stepFixtures.length; step += 1) {
    const textarea = page.locator('textarea:visible').last();
    await textarea.waitFor({ timeout: 30000 });
    await textarea.fill(stepFixtures[step]);
    await page.getByRole('button', { name: 'Submit & Continue' }).click();
    if (step < 5) {
      await page.waitForFunction((submitted) => {
        const area = [...document.querySelectorAll('textarea')].find((element) => element.offsetParent !== null);
        return area && area.value !== submitted;
      }, stepFixtures[step], { timeout: 30000 });
    }
  }

  await page.getByText('브리핑 종료 및 포맷팅 (Phase 6)').waitFor({ timeout: 30000 });
  const promptDownloadPromise = page.waitForEvent('download', { timeout: 60000 });
  await page.getByRole('button', { name: /프롬프트 추출/ }).click();
  const promptDownload = await promptDownloadPromise;
  const promptPath = path.join(artifactDir, 'phase6-prompt.txt');
  await promptDownload.saveAs(promptPath);
  const promptText = await readFile(promptPath, 'utf8');

  assert.match(promptText, /Place all selected Direct Competitors in Main Deck Deep Dive pages 12–16/);
  assert.match(promptText, /Appendix pages are never competitor overflow slots/);
  const start = promptText.indexOf(baseStartMarker);
  const end = promptText.indexOf(baseEndMarker);
  assert.ok(start >= 0 && end > start, 'Approved Base HTML markers are missing');
  const approvedBaseHtml = promptText.slice(start + baseStartMarker.length, end).trim();
  const simulatedExternalHtml = fillResearchSlots(approvedBaseHtml);
  assert.doesNotMatch(simulatedExternalHtml, /\[\[CONTENT:/);
  await writeFile(path.join(artifactDir, 'generated-report.html'), simulatedExternalHtml);

  const phase6Input = page.locator('textarea:visible').last();
  await phase6Input.fill(`\`\`\`html\n${simulatedExternalHtml}\n\`\`\``);
  await page.getByRole('button', { name: '결과물 뷰어에 렌더링하기' }).click();
  await page.locator('#fullscreen-viewer-iframe').waitFor({ timeout: 60000 });
  const frame = page.frameLocator('#fullscreen-viewer-iframe');
  await frame.locator('.full-slide').first().waitFor({ timeout: 60000 });

  assert.equal(await frame.locator('.full-slide').count(), 48);
  assert.equal(await frame.locator('.full-nav a').count(), 48);

  const orderedIds = await frame.locator('.full-slide').evaluateAll((slides) => slides.map((slide) => slide.id));
  assert.deepEqual(orderedIds.slice(10, 18), [
    'comp-ranking','deep-dive-1','deep-dive-2','deep-dive-3','deep-dive-4','deep-dive-5','product-matrix','positioning',
  ]);
  assert.deepEqual(orderedIds.slice(28, 35), [
    'creative-history-target','creative-history-1','creative-history-2','creative-history-3','creative-history-4','creative-history-5','creative-trajectory',
  ]);
  assert.deepEqual(orderedIds.slice(40), [
    'appendix-cover','appendix-receipt','appendix-negative','appendix-premortem','appendix-roadmap','appendix-measure','appendix-evidence-sources','appendix-back',
  ]);

  assert.equal(await frame.locator('#comp-ranking .ranking-table tbody tr').count(), 5);
  assert.equal(await frame.locator('#product-matrix .matrix-table thead th').count(), 7);
  assert.equal(await frame.locator('#positioning .map-dot.comp4').count(), 1);
  assert.equal(await frame.locator('#positioning .map-dot.comp5').count(), 1);
  assert.equal(await frame.locator('#creative-trajectory .trajectory-brand.comp4').count(), 1);
  assert.equal(await frame.locator('#creative-trajectory .trajectory-brand.comp5').count(), 1);

  const personaAudit = {};
  for (const id of ['persona-2', 'persona-3']) {
    const result = await frame.locator(`#${id} .persona-index`).evaluate((element) => {
      const style = getComputedStyle(element);
      const lineHeight = Number.parseFloat(style.lineHeight);
      const height = element.getBoundingClientRect().height;
      return { text: element.textContent.trim(), whiteSpace: style.whiteSpace, lines: Math.round(height / lineHeight) };
    });
    personaAudit[id] = result;
    assert.match(result.text, /^0[23]$/);
    assert.equal(result.whiteSpace, 'nowrap');
    assert.ok(result.lines <= 1, `${id} index wrapped: ${JSON.stringify(result)}`);
  }

  const choiceAudit = await frame.locator('#strategy-choice .choice-layout').evaluate((element) => {
    const criteria = element.querySelector('.choice-criteria').getBoundingClientRect();
    const finalChoice = element.querySelector('.choice-final').getBoundingClientRect();
    return {
      columns: getComputedStyle(element).gridTemplateColumns,
      criteriaRight: criteria.right,
      finalLeft: finalChoice.left,
      finalBackground: getComputedStyle(element.querySelector('.choice-final')).backgroundColor,
      finalColor: getComputedStyle(element.querySelector('.choice-final')).color,
    };
  });
  assert.ok(choiceAudit.criteriaRight < choiceAudit.finalLeft, 'Final Choice did not retain the approved two-column layout');
  assert.notEqual(choiceAudit.finalBackground, choiceAudit.finalColor);

  const geometry = await frame.locator('.full-slide').evaluateAll((elements) => elements.map((element) => ({
    id: element.id,
    width: element.getBoundingClientRect().width,
    height: element.getBoundingClientRect().height,
    overflowX: element.scrollWidth - element.clientWidth,
    overflowY: element.scrollHeight - element.clientHeight,
  })));
  assert.ok(geometry.every((item) => Math.round(item.width) === 1280 && Math.round(item.height) === 720));
  const overflow = geometry.filter((item) => item.overflowX > 1 || item.overflowY > 1);
  assert.deepEqual(overflow, []);

  const darkIds = ['creative-history-target','creative-history-1','creative-history-2','creative-history-3','creative-history-4','creative-history-5'];
  const darkAudit = {};
  for (const id of darkIds) {
    const result = await frame.locator(`#${id}`).evaluate((element) => ({
      background: getComputedStyle(element).backgroundColor,
      title: getComputedStyle(element.querySelector('.full-title-row h2')).color,
    }));
    darkAudit[id] = result;
    assert.equal(result.background, 'rgb(9, 10, 12)', `${id} dark background was lost`);
    assert.notEqual(result.title, result.background, `${id} title has no contrast`);
  }

  await frame.locator('#strategy-choice').screenshot({ path: path.join(artifactDir, 'screen-final-choice.png') });
  await frame.locator('#appendix-cover').screenshot({ path: path.join(artifactDir, 'screen-appendix-cover.png') });
  await frame.locator('#persona-2').screenshot({ path: path.join(artifactDir, 'screen-persona-2.png') });

  await page.evaluate(() => {
    const iframe = document.getElementById('fullscreen-viewer-iframe');
    const windowRef = iframe.contentWindow;
    const documentRef = iframe.contentDocument;
    windowRef.__FULL_REPORT_NATIVE_PRINT__ = () => {
      const count = Number(documentRef.documentElement.dataset.nativePrintTestCalls || '0') + 1;
      documentRef.documentElement.dataset.nativePrintTestCalls = String(count);
    };
  });
  await page.getByRole('button', { name: 'Export PDF' }).last().click();
  await page.waitForFunction(() => {
    const iframe = document.getElementById('fullscreen-viewer-iframe');
    return iframe?.contentDocument?.documentElement.dataset.nativePrintTestCalls === '1';
  }, { timeout: 30000 });

  const nativeRuntimeAudit = await page.evaluate(() => {
    const iframe = document.getElementById('fullscreen-viewer-iframe');
    const documentRef = iframe.contentDocument;
    return {
      calls: documentRef.documentElement.dataset.nativePrintTestCalls,
      mode: documentRef.documentElement.dataset.lastPdfExportMode,
      pages: documentRef.documentElement.dataset.lastPdfPageCount,
      preflight: documentRef.documentElement.dataset.fullReportPreflight,
    };
  });
  assert.deepEqual(nativeRuntimeAudit, { calls: '1', mode: 'native-print', pages: '48', preflight: 'passed' });

  const transformedHtml = await page.evaluate(() => {
    const iframe = document.getElementById('fullscreen-viewer-iframe');
    return `<!DOCTYPE html>\n${iframe.contentDocument.documentElement.outerHTML}`;
  });
  const printPage = await context.newPage();
  await printPage.setViewportSize({ width: 1280, height: 720 });
  await printPage.setContent(transformedHtml, { waitUntil: 'networkidle', timeout: 120000 });
  await printPage.waitForFunction(() => document.querySelectorAll('.full-slide').length === 48, { timeout: 60000 });
  await printPage.evaluate(async () => { if (document.fonts?.ready) await document.fonts.ready; });
  await printPage.emulateMedia({ media: 'print' });
  const nativePdfPath = path.join(artifactDir, 'mono-lab-native-print.pdf');
  await printPage.pdf({ path: nativePdfPath, printBackground: true, preferCSSPageSize: true, margin: { top: '0', right: '0', bottom: '0', left: '0' } });
  await printPage.close();

  const pdfInfo = command('pdfinfo', [nativePdfPath]);
  assert.match(pdfInfo, /Pages:\s+48\b/);
  assert.match(pdfInfo, /Page size:\s+960 x 540 pts/);
  const pdfFonts = command('pdffonts', [nativePdfPath]);
  const fontRows = pdfFonts.split('\n').filter((line) => /Type 0|TrueType|CID/.test(line));
  assert.ok(fontRows.length > 0, 'Native PDF contains no embedded font objects');
  const pdfImages = command('pdfimages', ['-list', nativePdfPath]);
  const fullPageRasterRows = pdfImages.split('\n').filter((line) => /\s2560\s+1440\s/.test(line));
  assert.equal(fullPageRasterRows.length, 0, 'Native PDF regressed to full-page JPEG images');

  for (const pageNumber of [12, 15, 16, 23, 24, 33, 34, 40, 41, 47]) {
    const prefix = path.join(artifactDir, `pdf-page-${String(pageNumber).padStart(2, '0')}`);
    command('pdftoppm', ['-f', String(pageNumber), '-l', String(pageNumber), '-singlefile', '-png', '-r', '120', nativePdfPath, prefix]);
  }

  await page.waitForTimeout(700);
  await page.reload({ waitUntil: 'networkidle', timeout: 120000 });
  await page.getByText(brand, { exact: true }).first().click();
  await page.locator('#fullscreen-viewer-iframe').waitFor({ timeout: 60000 });
  const reopened = page.frameLocator('#fullscreen-viewer-iframe');
  await reopened.locator('.full-slide').first().waitFor({ timeout: 60000 });
  assert.equal(await reopened.locator('.full-slide').count(), 48);
  assert.equal(await reopened.locator('#appendix-cover').count(), 1);
  assert.equal(await reopened.getByText('123만 명', { exact: false }).count() > 0, true);

  const summary = {
    appUrl,
    brand,
    competitors,
    renderedPages: 48,
    navigationLinks: 48,
    orderedIds,
    geometry,
    overflowPages: overflow,
    personaAudit,
    choiceAudit,
    darkAudit,
    nativeRuntimeAudit,
    nativePdf: { pageCount: 48, mediaBox: '960×540pt', embeddedFontRows: fontRows.length, fullPageRasterRows: fullPageRasterRows.length },
    saveReopenPages: 48,
    dialogs,
  };
  await writeFile(path.join(artifactDir, 'e2e-summary.json'), JSON.stringify(summary, null, 2));
  await writeFile(path.join(artifactDir, 'pdffonts.txt'), pdfFonts);
  await writeFile(path.join(artifactDir, 'pdfimages.txt'), pdfImages);
  console.log(JSON.stringify(summary, null, 2));
} catch (error) {
  await page.screenshot({ path: path.join(artifactDir, '99-failure.png'), fullPage: true }).catch(() => undefined);
  await writeFile(path.join(artifactDir, '99-failure.txt'), error instanceof Error ? `${error.stack || error.message}\n` : `${String(error)}\n`);
  throw error;
} finally {
  await browser.close();
}
