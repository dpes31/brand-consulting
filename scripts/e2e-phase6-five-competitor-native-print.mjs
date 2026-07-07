import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { buildPhase6StepFixtures } from './phase6-e2e-fixtures.mjs';

const appUrl = process.env.PREVIEW_URL;
if (!appUrl) throw new Error('PREVIEW_URL is required.');

const brand = '모노랩';
const candidates = ['알파원', '베타랩', '감마코', '델타택스', '엡실론'];
const core = candidates.slice(0, 3);
const artifactDir = path.resolve('phase6-v2-e2e-artifacts');
await mkdir(artifactDir, { recursive: true });

const steps = buildPhase6StepFixtures(brand);
steps[0] += '\n핵심 사실은 **123만 명**과 **456억 원**이다.';
steps[2] += `\n${candidates.map((name, index) => `${index + 1}. **${name} — ${91 - index * 8}점:** 직접 경쟁 후보`).join('\n')}`;

const startMarker = '[IMMUTABLE APPROVED BASE HTML — START]';
const endMarker = '[IMMUTABLE APPROVED BASE HTML — END]';
const slotPattern = /\[\[CONTENT:P(\d{2}):([A-Z0-9_-]+):(\d{3})\]\]/g;

function fillSlots(template) {
  let result = template;
  const inject = (page, value) => {
    result = result.replace(new RegExp(`\\[\\[CONTENT:P${page}:[^\\]]+\\]\\]`), value);
  };
  inject('04', `${brand} 이용자 123만 명`);
  inject('04', `${brand} 관리 규모 456억 원`);
  candidates.forEach((name) => inject('11', `${name} 경쟁 후보`));
  core.forEach((name, index) => inject(String(13 + index).padStart(2, '0'), `${name} 핵심 경쟁사`));

  return result.replace(slotPattern, (_slot, page, role, index) => {
    if (role === 'I') return Number(index) % 2 ? '→' : '≠';
    if (role === 'B') return String((Number(index) % 4) + 1).padStart(2, '0');
    if (role.includes('PERSONA-INDEX')) return page === '23' ? '02' : page === '24' ? '03' : '01';
    if (role === 'H1') return `${brand} 전략 보고서`;
    if (role === 'H2') return `${brand} P${page} 핵심 결론`;
    if (role.includes('FULL-SOURCE')) return 'QA Fixture · Step 0–5 · 2026';
    if (role === 'STRONG') return '핵심 판단';
    if (role === 'SMALL') return '검증 근거';
    if (role === 'SPAN') return '조사 항목';
    if (role === 'P') return '현재 조사에서 확인된 핵심 근거와 실행 의미다.';
    return `${brand} 조사 근거 ${page}-${index}`;
  });
}

const command = (name, args) => execFileSync(name, args, { encoding: 'utf8' });
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ acceptDownloads: true, viewport: { width: 1600, height: 1000 } });
await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: new URL(appUrl).origin });
const page = await context.newPage();
const dialogs = [];
page.on('dialog', async (dialog) => {
  dialogs.push(dialog.message());
  await dialog.accept();
});

try {
  await page.goto(appUrl, { waitUntil: 'networkidle', timeout: 120000 });
  await page.getByPlaceholder('Enter brand name for deep-dive analysis...').fill(brand);
  await page.getByRole('button', { name: 'Start Engine' }).click();

  for (let step = 0; step < steps.length; step += 1) {
    const area = page.locator('textarea:visible').last();
    await area.fill(steps[step]);
    await page.getByRole('button', { name: 'Submit & Continue' }).click();
    if (step < 5) {
      await page.waitForFunction((submitted) => {
        const current = [...document.querySelectorAll('textarea')].find((node) => node.offsetParent !== null);
        return current?.value !== submitted;
      }, steps[step]);
    }
  }

  await page.getByText('브리핑 종료 및 포맷팅 (Phase 6)').waitFor({ timeout: 30000 });
  const downloadPromise = page.waitForEvent('download', { timeout: 60000 });
  await page.getByRole('button', { name: /프롬프트 추출/ }).click();
  const download = await downloadPromise;
  const promptPath = path.join(artifactDir, 'phase6-prompt.txt');
  await download.saveAs(promptPath);
  const prompt = await readFile(promptPath, 'utf8');

  assert.match(prompt, /40 Main Deck slides, zero Appendix slides/);
  assert.match(prompt, /top three core Direct Competitors/);
  assert.match(prompt, /Category Clichés/);
  assert.match(prompt, /Decision Receipt \/ Close/);

  const start = prompt.indexOf(startMarker);
  const end = prompt.indexOf(endMarker);
  assert.ok(start >= 0 && end > start, 'Approved Base HTML markers are missing');
  const html = fillSlots(prompt.slice(start + startMarker.length, end).trim());
  assert.doesNotMatch(html, /\[\[CONTENT:/);
  await writeFile(path.join(artifactDir, 'generated-report.html'), html);

  const phase6Input = page.locator('textarea:visible').last();
  await phase6Input.fill(`\`\`\`html\n${html}\n\`\`\``);
  const dialogsBeforeRender = dialogs.length;
  await page.getByRole('button', { name: '결과물 뷰어에 렌더링하기' }).click();
  await page.waitForTimeout(1200);
  if ((await page.locator('#fullscreen-viewer-iframe').count()) === 0) {
    const validationState = await page.evaluate(() => ({
      validated: document.querySelector('textarea[data-full-report-validated-html="true"]') !== null,
      buttonText: [...document.querySelectorAll('button')].map((button) => button.textContent?.replace(/\s+/g, ' ').trim()).find((value) => value?.includes('결과물 뷰어에 렌더링하기')) || '',
    }));
    throw new Error(`Viewer did not open. New dialogs: ${JSON.stringify(dialogs.slice(dialogsBeforeRender))}. State: ${JSON.stringify(validationState)}`);
  }

  await page.locator('#fullscreen-viewer-iframe').waitFor({ timeout: 30000 });
  const frame = page.frameLocator('#fullscreen-viewer-iframe');
  await frame.locator('.full-slide').first().waitFor({ timeout: 60000 });

  assert.equal(await frame.locator('.full-slide').count(), 40);
  assert.equal(await frame.locator('.full-nav a').count(), 40);
  assert.equal(await frame.locator('[data-zone="appendix"]').count(), 0);
  assert.equal(await frame.locator('#creative-method').count(), 0);

  const ids = await frame.locator('.full-slide').evaluateAll((nodes) => nodes.map((node) => node.id));
  assert.deepEqual(ids.slice(10, 18), ['comp-landscape','comp-ranking','deep-dive-1','deep-dive-2','deep-dive-3','product-matrix','category-cliche','positioning']);
  assert.deepEqual(ids.slice(28, 34), ['creative-history-target','creative-history-1','creative-history-2','creative-history-3','creative-trajectory','creative-insight']);
  assert.deepEqual(ids.slice(34), ['strategy-swot','root-cause','stp','strategy-routes','strategy-choice','decision-close']);

  assert.match(await frame.locator('#executive .full-breadcrumb').textContent(), /핵심 진단/);
  assert.match(await frame.locator('#kpi .full-breadcrumb').textContent(), /FACTS/);
  assert.match(await frame.locator('#category-target .full-breadcrumb').textContent(), /CATEGORY & TARGET/);
  assert.match(await frame.locator('#market-shift .full-breadcrumb').textContent(), /CATEGORY SHIFT/);
  assert.deepEqual(await frame.locator('#market-shift .ladder-step > span').allTextContents(), ['LEVEL 1','LEVEL 2','LEVEL 3','LEVEL 4','LEVEL 5']);

  const allText = await frame.locator('body').innerText();
  candidates.forEach((name) => assert.match(allText, new RegExp(name)));
  for (let index = 0; index < core.length; index += 1) assert.match(await frame.locator(`#deep-dive-${index + 1}`).innerText(), new RegExp(core[index]));

  for (const id of ['persona-2','persona-3']) {
    const persona = await frame.locator(`#${id} .persona-index`).evaluate((node) => ({ text: node.textContent.trim(), whiteSpace: getComputedStyle(node).whiteSpace }));
    assert.match(persona.text, /^0[23]$/);
    assert.equal(persona.whiteSpace, 'nowrap');
  }

  const geometry = await frame.locator('.full-slide').evaluateAll((nodes) => nodes.map((node) => ({
    id: node.id,
    width: node.getBoundingClientRect().width,
    height: node.getBoundingClientRect().height,
    overflowX: node.scrollWidth - node.clientWidth,
    overflowY: node.scrollHeight - node.clientHeight,
  })));
  assert.ok(geometry.every((item) => Math.round(item.width) === 1280 && Math.round(item.height) === 720));
  assert.deepEqual(geometry.filter((item) => item.overflowX > 1 || item.overflowY > 1), []);

  await frame.locator('#comp-landscape').screenshot({ path: path.join(artifactDir, 'screen-landscape.png') });
  await frame.locator('#category-cliche').screenshot({ path: path.join(artifactDir, 'screen-category-cliches.png') });
  await frame.locator('#creative-insight').screenshot({ path: path.join(artifactDir, 'screen-creative-insight.png') });
  await frame.locator('#strategy-choice').screenshot({ path: path.join(artifactDir, 'screen-final-choice.png') });
  await frame.locator('#decision-close').screenshot({ path: path.join(artifactDir, 'screen-decision-close.png') });

  await page.evaluate(() => {
    const iframe = document.getElementById('fullscreen-viewer-iframe');
    iframe.contentWindow.__FULL_REPORT_NATIVE_PRINT__ = () => {
      const root = iframe.contentDocument.documentElement;
      root.dataset.calls = String(Number(root.dataset.calls || '0') + 1);
    };
  });

  const exportButton = page.getByRole('button', { name: 'Export PDF' }).last();
  await exportButton.click();
  await page.waitForFunction(() => document.getElementById('fullscreen-viewer-iframe')?.contentDocument?.documentElement.dataset.calls === '1');
  await exportButton.click();
  await page.waitForFunction(() => document.getElementById('fullscreen-viewer-iframe')?.contentDocument?.documentElement.dataset.calls === '2');

  const transformed = await page.evaluate(() => `<!DOCTYPE html>\n${document.getElementById('fullscreen-viewer-iframe').contentDocument.documentElement.outerHTML}`);
  const printPage = await context.newPage();
  await printPage.setContent(transformed, { waitUntil: 'networkidle' });
  await printPage.emulateMedia({ media: 'print' });
  const pdfPath = path.join(artifactDir, 'mono-lab-native-print.pdf');
  await printPage.pdf({ path: pdfPath, printBackground: true, preferCSSPageSize: true });
  await printPage.close();

  const pdfInfo = command('pdfinfo', [pdfPath]);
  assert.match(pdfInfo, /Pages:\s+40\b/);
  assert.match(pdfInfo, /Page size:\s+960 x 540 pts/);
  const fonts = command('pdffonts', [pdfPath]);
  assert.ok(fonts.split('\n').some((line) => /Type 0|TrueType|CID/.test(line)));
  const images = command('pdfimages', ['-list', pdfPath]);
  assert.equal(images.split('\n').filter((line) => /\s2560\s+1440\s/.test(line)).length, 0);

  await page.reload({ waitUntil: 'networkidle' });
  await page.getByText(brand, { exact: true }).first().click();
  await page.locator('#fullscreen-viewer-iframe').waitFor({ timeout: 60000 });
  const reopened = page.frameLocator('#fullscreen-viewer-iframe');
  await reopened.locator('.full-slide').first().waitFor();
  assert.equal(await reopened.locator('.full-slide').count(), 40);
  assert.equal(await reopened.locator('#decision-close').count(), 1);

  const summary = { appUrl, brand, candidates, core, pages: 40, nav: 40, ids, geometry, pdf: { pages: 40, size: '960x540pt' }, exports: 2, reopened: 40, dialogs };
  await writeFile(path.join(artifactDir, 'e2e-summary.json'), JSON.stringify(summary, null, 2));
  await writeFile(path.join(artifactDir, 'pdffonts.txt'), fonts);
  await writeFile(path.join(artifactDir, 'pdfimages.txt'), images);
  console.log(JSON.stringify(summary, null, 2));
} catch (error) {
  await page.screenshot({ path: path.join(artifactDir, '99-failure.png'), fullPage: true }).catch(() => undefined);
  await writeFile(path.join(artifactDir, '99-failure.txt'), `${error instanceof Error ? error.stack || error.message : String(error)}\n\nDialogs:\n${JSON.stringify(dialogs, null, 2)}\n`);
  throw error;
} finally {
  await browser.close();
}
