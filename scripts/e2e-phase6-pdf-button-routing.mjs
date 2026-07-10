import assert from 'node:assert/strict';
import { chromium } from 'playwright';
const appUrl = process.env.PREVIEW_URL;
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const dialogs = [];
page.on('dialog', async (dialog) => { dialogs.push(dialog.message()); await dialog.accept(); });
try {
  await page.goto(appUrl, { waitUntil: 'networkidle' });
  const button = page.getByRole('button', { name: 'Export PDF' }).first();
  const slides = Array.from({ length: 40 }, (_, index) => `<section id="p${index + 1}" class="full-slide" data-page="${index + 1}" data-zone="main"></section>`).join('');
  await page.evaluate((html) => {
    const frame = document.createElement('iframe');
    frame.id = 'fullscreen-viewer-iframe';
    frame.srcdoc = `<!doctype html><html><head><style>.full-slide{width:1280px;height:720px}</style></head><body data-report-version="full-report-v1">${html}</body></html>`;
    document.body.appendChild(frame);
  }, slides);
  await page.waitForFunction(() => document.getElementById('fullscreen-viewer-iframe')?.contentDocument?.documentElement.dataset.fullReportPreflight === 'passed');
  await page.evaluate(() => {
    const frame = document.getElementById('fullscreen-viewer-iframe');
    frame.contentWindow.__FULL_REPORT_NATIVE_PRINT__ = () => {
      const root = frame.contentDocument.documentElement;
      root.dataset.calls = String(Number(root.dataset.calls || '0') + 1);
    };
  });
  await button.click();
  await page.waitForFunction(() => document.getElementById('fullscreen-viewer-iframe')?.contentDocument?.documentElement.dataset.calls === '1');
  await button.click();
  await page.waitForFunction(() => document.getElementById('fullscreen-viewer-iframe')?.contentDocument?.documentElement.dataset.calls === '2');
  const result = await page.evaluate(() => {
    const doc = document.getElementById('fullscreen-viewer-iframe').contentDocument;
    return { pages: doc.querySelectorAll('.full-slide').length, calls: doc.documentElement.dataset.calls, mode: doc.documentElement.dataset.lastPdfExportMode };
  });
  assert.deepEqual(result, { pages: 40, calls: '2', mode: 'native-print' });
  assert.equal(dialogs.length, 0);
  console.log(JSON.stringify(result));
} finally { await browser.close(); }
