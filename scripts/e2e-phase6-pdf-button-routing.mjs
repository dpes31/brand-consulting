import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const appUrl = process.env.PREVIEW_URL;
if (!appUrl) throw new Error('PREVIEW_URL is required.');

const artifactDir = path.resolve('phase6-v2-e2e-artifacts');
await mkdir(artifactDir, { recursive: true });

function buildFullReportFixture() {
  const slides = Array.from({ length: 48 }, (_, index) => {
    const page = index + 1;
    const zone = page <= 40 ? 'main' : 'appendix';
    return `<section id="pdf-fixture-${page}" class="full-slide" data-page="${page}" data-zone="${zone}"><h2>PDF Fixture ${page}</h2></section>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<title>PDF Runtime Fixture</title>
<style>
html,body{margin:0;padding:0;background:#fff}
.full-slide{box-sizing:border-box;width:1280px;height:720px;overflow:hidden;break-after:page;page-break-after:always;background:#fff;color:#111}
@page{size:960pt 540pt;margin:0}
@media print{.full-slide{width:960pt;height:540pt;margin:0}}
</style>
</head>
<body data-report-version="full-report-v1" data-approved-pilot="full-integrated">${slides}</body>
</html>`;
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
const page = await context.newPage();
const dialogs = [];
page.on('dialog', async (dialog) => {
  dialogs.push(dialog.message());
  await dialog.accept();
});

try {
  await page.goto(appUrl, { waitUntil: 'networkidle', timeout: 120000 });

  const exportButton = page.getByRole('button', { name: 'Export PDF' }).first();
  await exportButton.waitFor({ timeout: 30000 });
  await exportButton.click();
  await page.waitForTimeout(200);
  assert.equal(dialogs.length, 1, 'No-report Export PDF should show one guidance alert');
  assert.match(dialogs[0], /PDF로 출력할 FULL 보고서를 먼저 생성하거나 저장된 프로젝트를 열어 주세요/);
  assert.doesNotMatch(dialogs[0], /출력할 슬라이드를 찾지 못했습니다/);

  const fixture = buildFullReportFixture();
  await page.evaluate((srcdoc) => {
    const iframe = document.createElement('iframe');
    iframe.id = 'fullscreen-viewer-iframe';
    iframe.title = 'PDF Runtime Fixture';
    iframe.style.width = '1280px';
    iframe.style.height = '720px';
    iframe.srcdoc = srcdoc;
    document.body.appendChild(iframe);
  }, fixture);

  await page.waitForFunction(() => {
    const iframe = document.getElementById('fullscreen-viewer-iframe');
    const doc = iframe?.contentDocument;
    return doc?.documentElement.dataset.fullReportRuntimeV1 === 'installed'
      && doc?.documentElement.dataset.fullReportPreflight === 'passed';
  }, null, { timeout: 30000 });

  const routingAudit = await page.evaluate(() => {
    const iframe = document.getElementById('fullscreen-viewer-iframe');
    const frameWindow = iframe.contentWindow;
    const doc = iframe.contentDocument;
    return {
      pages: doc.querySelectorAll('.full-slide').length,
      fullRuntime: doc.documentElement.dataset.fullReportRuntimeV1,
      legacyMarker: doc.documentElement.dataset.layoutSafetyV1,
      nativeSource: doc.documentElement.dataset.fullReportNativePrintSource,
      legacyNativeBackupType: typeof frameWindow.__NATIVE_REPORT_PRINT__,
      fullNativeType: typeof frameWindow.__FULL_REPORT_NATIVE_PRINT__,
    };
  });

  assert.deepEqual(routingAudit, {
    pages: 48,
    fullRuntime: 'installed',
    legacyMarker: 'installed',
    nativeSource: 'window-native',
    legacyNativeBackupType: 'undefined',
    fullNativeType: 'function',
  });

  await page.evaluate(() => {
    const iframe = document.getElementById('fullscreen-viewer-iframe');
    const frameWindow = iframe.contentWindow;
    const doc = iframe.contentDocument;
    frameWindow.__FULL_REPORT_NATIVE_PRINT__ = () => {
      const count = Number(doc.documentElement.dataset.nativePrintTestCalls || '0') + 1;
      doc.documentElement.dataset.nativePrintTestCalls = String(count);
    };
  });

  await exportButton.click();
  await page.waitForFunction(() => {
    const iframe = document.getElementById('fullscreen-viewer-iframe');
    return iframe?.contentDocument?.documentElement.dataset.nativePrintTestCalls === '1';
  }, null, { timeout: 30000 });

  await exportButton.click();
  await page.waitForFunction(() => {
    const iframe = document.getElementById('fullscreen-viewer-iframe');
    return iframe?.contentDocument?.documentElement.dataset.nativePrintTestCalls === '2';
  }, null, { timeout: 30000 });

  const exportAudit = await page.evaluate(() => {
    const iframe = document.getElementById('fullscreen-viewer-iframe');
    const doc = iframe.contentDocument;
    return {
      calls: doc.documentElement.dataset.nativePrintTestCalls,
      mode: doc.documentElement.dataset.lastPdfExportMode,
      pages: doc.documentElement.dataset.lastPdfPageCount,
      preflight: doc.documentElement.dataset.fullReportPreflight,
      busy: document.querySelector('button[data-pdf-export-busy="true"]') !== null,
    };
  });

  assert.deepEqual(exportAudit, {
    calls: '2',
    mode: 'native-print',
    pages: '48',
    preflight: 'passed',
    busy: false,
  });
  assert.equal(dialogs.length, 1, `Unexpected PDF error dialogs: ${JSON.stringify(dialogs)}`);

  await page.screenshot({ path: path.join(artifactDir, 'phase6-pdf-button-routing.png'), fullPage: true });
  const summary = { appUrl, dialogs, routingAudit, exportAudit };
  await writeFile(path.join(artifactDir, 'phase6-pdf-button-routing.json'), JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(summary, null, 2));
} catch (error) {
  await page.screenshot({ path: path.join(artifactDir, 'phase6-pdf-button-routing-failure.png'), fullPage: true }).catch(() => undefined);
  await writeFile(
    path.join(artifactDir, 'phase6-pdf-button-routing-failure.txt'),
    error instanceof Error ? `${error.stack || error.message}\n` : `${String(error)}\n`,
  );
  throw error;
} finally {
  await browser.close();
}
