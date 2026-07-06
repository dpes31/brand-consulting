import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { buildPhase6StepFixtures } from './phase6-e2e-fixtures.mjs';

const appUrl = process.env.PREVIEW_URL;
if (!appUrl) throw new Error('PREVIEW_URL is required.');
const brand = '모노랩';
const artifactDir = path.resolve('phase6-v2-e2e-artifacts');
await mkdir(artifactDir, { recursive: true });
const stepFixtures = buildPhase6StepFixtures(brand);
const baseStartMarker = '[IMMUTABLE APPROVED BASE HTML — START]';
const baseEndMarker = '[IMMUTABLE APPROVED BASE HTML — END]';

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
  await page.screenshot({ path: path.join(artifactDir, '01-phase6-screen.png'), fullPage: true });

  const promptDownloadPromise = page.waitForEvent('download', { timeout: 60000 });
  await page.getByRole('button', { name: /프롬프트 추출/ }).click();
  const promptDownload = await promptDownloadPromise;
  const promptPath = path.join(artifactDir, 'phase6-prompt.txt');
  await promptDownload.saveAs(promptPath);
  const promptText = await readFile(promptPath, 'utf8');

  assert.match(promptText, /The final product is ONE complete standalone HTML document, not JSON/);
  assert.match(promptText, /Return the complete HTML only/);
  assert.match(promptText, /VISUAL INTENT BRIEF INTERPRETATION/);
  assert.match(promptText, /It does NOT mean that the final output should be JSON/);
  assert.match(promptText, /## STEP 0/);
  assert.match(promptText, /## STEP 5/);
  assert.match(promptText, /<!DOCTYPE html>/i);
  assert.match(promptText, /class="full-slide/);
  assert.match(promptText, /class="growth-timeline/);
  assert.match(promptText, /class="persona-layout/);
  assert.match(promptText, /class="history-grid/);
  assert.match(promptText, /class="swot-grid/);
  assert.match(promptText, /class="stp-layout/);
  assert.doesNotMatch(promptText, /Return JSON only/);
  assert.doesNotMatch(promptText, /ProductionReportV1 JSON only/);

  const start = promptText.indexOf(baseStartMarker);
  const end = promptText.indexOf(baseEndMarker);
  assert.ok(start >= 0 && end > start, 'Approved Base HTML markers are missing');
  const approvedBaseHtml = promptText.slice(start + baseStartMarker.length, end).trim();
  assert.equal((approvedBaseHtml.match(/class="full-slide/g) || []).length, 48);

  const phase6Input = page.locator('textarea:visible').last();
  await phase6Input.fill('```json\n{"version":"1.0.0","brand":"모노랩","mainSlides":[],"appendixSlides":[]}\n```');
  await page.getByRole('button', { name: '결과물 뷰어에 렌더링하기' }).click();
  await page.waitForTimeout(500);
  assert.ok(dialogs.some((message) => message.includes('이전 Phase 6의 ProductionReportV1 JSON')));

  const simulatedExternalHtml = approvedBaseHtml
    .replaceAll('비즈넵', brand)
    .replaceAll('BIZNUP', brand)
    .replaceAll('Biznup', brand);
  await phase6Input.fill(`\`\`\`html\n${simulatedExternalHtml}\n\`\`\``);
  await page.getByRole('button', { name: '결과물 뷰어에 렌더링하기' }).click();
  await page.waitForTimeout(1800);
  await writeFile(path.join(artifactDir, 'render-dialogs.json'), JSON.stringify(dialogs, null, 2));

  if (await page.locator('#fullscreen-viewer-iframe').count() === 0) {
    throw new Error(`Phase 6 viewer did not open. Dialogs: ${JSON.stringify(dialogs)}`);
  }
  await page.locator('#fullscreen-viewer-iframe').waitFor({ timeout: 60000 });
  const frame = page.frameLocator('#fullscreen-viewer-iframe');
  await frame.locator('.full-slide').first().waitFor({ timeout: 60000 });

  assert.equal(await frame.locator('.full-slide').count(), 48);
  assert.equal(await frame.locator('.full-nav a').count(), 48);
  assert.equal(await frame.locator('.persona-layout').count(), 3);
  assert.equal(await frame.locator('.history-grid').count(), 4);
  assert.equal(await frame.locator('.history-bottom').count(), 4);
  assert.equal(await frame.locator('.swot-grid').count(), 1);
  assert.equal(await frame.locator('.stp-layout').count(), 1);
  assert.ok((await frame.locator('mark').count()) > 20);

  const geometry = await frame.locator('.full-slide').evaluateAll((elements) => elements.map((element) => ({
    page: element.getAttribute('data-page'),
    width: element.getBoundingClientRect().width,
    height: element.getBoundingClientRect().height,
    overflowX: element.scrollWidth - element.clientWidth,
    overflowY: element.scrollHeight - element.clientHeight,
  })));
  assert.ok(geometry.every((item) => Math.round(item.width) === 1280 && Math.round(item.height) === 720));
  const overflow = geometry.filter((item) => item.overflowX > 1 || item.overflowY > 1);
  assert.deepEqual(overflow, []);

  await frame.locator('#persona-1').screenshot({ path: path.join(artifactDir, '02-persona.png') });
  await frame.locator(`#creative-${brand}`).screenshot({ path: path.join(artifactDir, '03-creative-history.png') });
  await frame.locator('#strategy-swot').screenshot({ path: path.join(artifactDir, '04-swot.png') });
  await frame.locator('#stp').screenshot({ path: path.join(artifactDir, '05-stp.png') });

  await frame.locator('.full-nav a').last().click();
  await page.waitForTimeout(300);
  assert.equal(await frame.locator('html').evaluate(() => location.hash), '#appendix-back');

  const pdfRuntimeState = await page.evaluate(() => {
    const iframe = document.getElementById('fullscreen-viewer-iframe');
    const documentRef = iframe?.contentDocument;
    const windowRef = iframe?.contentWindow;
    return {
      bridgeMarker: document.documentElement.dataset.fullPdfButtonBridge || null,
      frameExists: Boolean(iframe),
      bodyReportVersion: documentRef?.body?.dataset.reportVersion || null,
      fullSlideCount: documentRef?.querySelectorAll('.full-slide').length || 0,
      fullReportPageCount: documentRef?.documentElement.dataset.fullReportPageCount || null,
      fullRuntime: Boolean(windowRef?.__FULL_REPORT_RUNTIME__),
      fullRuntimeVersion: windowRef?.__FULL_REPORT_RUNTIME__?.version || null,
      preflightFunction: String(windowRef?.__REPORT_PREFLIGHT__ || '').slice(0, 300),
      printFunction: String(windowRef?.print || '').slice(0, 300),
    };
  });
  await writeFile(path.join(artifactDir, 'pdf-runtime-state.json'), JSON.stringify(pdfRuntimeState, null, 2));
  assert.equal(pdfRuntimeState.bridgeMarker, 'installed');

  const exportButton = page.getByRole('button', { name: 'Export PDF' }).last();
  const firstPdfPromise = page.waitForEvent('download', { timeout: 360000 });
  await exportButton.click();
  const firstPdf = await firstPdfPromise;
  const firstPdfPath = path.join(artifactDir, 'mono-lab-report-1.pdf');
  await firstPdf.saveAs(firstPdfPath);
  const firstBytes = await readFile(firstPdfPath);
  const firstText = firstBytes.toString('latin1');
  assert.equal((firstText.match(/\/Type\s*\/Page\b/g) || []).length, 48);
  assert.match(firstText, /\/MediaBox \[0 0 960 540\]/);

  const secondPdfPromise = page.waitForEvent('download', { timeout: 180000 });
  await exportButton.click();
  const secondPdf = await secondPdfPromise;
  const secondPdfPath = path.join(artifactDir, 'mono-lab-report-2.pdf');
  await secondPdf.saveAs(secondPdfPath);
  const secondBytes = await readFile(secondPdfPath);
  assert.equal((secondBytes.toString('latin1').match(/\/Type\s*\/Page\b/g) || []).length, 48);

  await page.waitForTimeout(1200);
  await page.reload({ waitUntil: 'networkidle', timeout: 120000 });
  await page.getByText(brand, { exact: true }).first().click();
  await page.locator('#fullscreen-viewer-iframe').waitFor({ timeout: 60000 });
  const reopened = page.frameLocator('#fullscreen-viewer-iframe');
  await reopened.locator('.full-slide').first().waitFor({ timeout: 60000 });
  assert.equal(await reopened.locator('.full-slide').count(), 48);
  assert.equal(await reopened.locator(`#creative-${brand} .history-bottom`).count(), 1);

  const summary = {
    appUrl,
    brand,
    promptCompleteHtml: true,
    promptContainsApprovedPilotHtml: true,
    promptContainsSteps0To5: true,
    jsonInputRejected: true,
    renderedPages: 48,
    navigationLinks: 48,
    personaPages: 3,
    creativeHistoryPages: 4,
    swotPages: 1,
    stpPages: 1,
    pdfExports: 2,
    pdfPageCount: 48,
    pdfMediaBox: '960×540pt (1280×720 CSS px at 96dpi)',
    saveReopenPages: 48,
    overflowPages: overflow,
    geometry,
    dialogs,
    pdfRuntimeState,
  };
  await writeFile(path.join(artifactDir, 'e2e-summary.json'), JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(summary, null, 2));
} catch (error) {
  await page.screenshot({ path: path.join(artifactDir, '99-failure.png'), fullPage: true }).catch(() => undefined);
  await writeFile(path.join(artifactDir, 'render-dialogs.json'), JSON.stringify(dialogs, null, 2));
  await writeFile(path.join(artifactDir, '99-failure.txt'), error instanceof Error ? `${error.stack || error.message}\n` : `${String(error)}\n`);
  throw error;
} finally {
  await browser.close();
}
