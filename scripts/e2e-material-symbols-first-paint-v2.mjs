import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const appUrl = process.env.PREVIEW_URL;
if (!appUrl) throw new Error('PREVIEW_URL is required.');

const artifactDir = path.resolve('phase6-v2-e2e-artifacts');
await mkdir(artifactDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1680, height: 763 } });
const page = await context.newPage();
let delayedMaterialFontRequests = 0;

await page.route('https://fonts.gstatic.com/**', async (route) => {
  const url = route.request().url();
  if (url.includes('/s/materialsymbolsoutlined/')) {
    delayedMaterialFontRequests += 1;
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
  await route.continue();
});

const snapshot = () => page.evaluate(() => {
  const exportButton = Array.from(document.querySelectorAll('button'))
    .find((button) => button.textContent?.includes('Export PDF'));
  const iconNodes = Array.from(document.querySelectorAll('.material-symbols-outlined'));
  const iconBoxes = iconNodes.slice(0, 12).map((node) => {
    const rect = node.getBoundingClientRect();
    const style = getComputedStyle(node);
    return {
      text: node.textContent?.trim() || '',
      visibility: style.visibility,
      width: rect.width,
      height: rect.height,
      fontFamily: style.fontFamily,
    };
  });
  const visibleLigatures = iconBoxes
    .filter((box) => box.visibility !== 'hidden')
    .map((box) => box.text);
  const rect = exportButton?.getBoundingClientRect();
  return {
    state: document.documentElement.dataset.materialSymbolsState,
    iconBoxes,
    visibleLigatures,
    buttonRect: rect ? { x: rect.x, y: rect.y, width: rect.width, height: rect.height } : null,
  };
});

try {
  await page.goto(appUrl, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.locator('.material-symbols-outlined').first().waitFor({ state: 'attached', timeout: 30000 });
  await page.waitForFunction(() => document.documentElement.dataset.materialSymbolsState === 'pending');

  await page.evaluate(async () => {
    await Promise.all([
      document.fonts.load('16px "Public Sans"', 'Export PDF'),
      document.fonts.load('16px "Inter"', 'Export PDF'),
      document.fonts.load('16px "Noto Sans KR"', '브랜드 컨설팅'),
    ]);
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });

  const before = await snapshot();
  assert.equal(before.state, 'pending');
  assert.deepEqual(before.visibleLigatures, []);
  assert.ok(before.iconBoxes.length > 0);
  assert.ok(before.iconBoxes.every((box) => box.visibility === 'hidden'));
  assert.ok(before.iconBoxes.every((box) => box.width > 0 && box.width <= 32));
  assert.ok(before.buttonRect);
  await page.screenshot({ path: path.join(artifactDir, 'material-symbols-pending.png'), fullPage: true });

  await page.waitForFunction(() => document.documentElement.dataset.materialSymbolsState === 'ready', null, { timeout: 30000 });
  await page.waitForFunction(() => document.fonts.check('24px "Material Symbols Outlined"', 'search'));
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));

  const after = await snapshot();
  assert.equal(after.state, 'ready');
  assert.ok(after.iconBoxes.every((box) => box.visibility === 'visible'));
  assert.ok(after.iconBoxes.every((box) => box.fontFamily.includes('Material Symbols Outlined')));
  assert.ok(after.buttonRect);
  assert.ok(Math.abs(after.buttonRect.width - before.buttonRect.width) <= 1);
  assert.ok(Math.abs(after.buttonRect.height - before.buttonRect.height) <= 1);
  assert.ok(after.iconBoxes.every((box, index) => {
    const prior = before.iconBoxes[index];
    return prior && Math.abs(box.width - prior.width) <= 1 && Math.abs(box.height - prior.height) <= 1;
  }));
  assert.ok(delayedMaterialFontRequests > 0);

  const summary = { appUrl, delayedMaterialFontRequests, before, after };
  await writeFile(path.join(artifactDir, 'material-symbols-summary.json'), JSON.stringify(summary, null, 2));
  await page.screenshot({ path: path.join(artifactDir, 'material-symbols-ready.png'), fullPage: true });
  console.log(JSON.stringify(summary, null, 2));
} catch (error) {
  await page.screenshot({ path: path.join(artifactDir, 'material-symbols-failure.png'), fullPage: true }).catch(() => undefined);
  await writeFile(path.join(artifactDir, 'material-symbols-failure.txt'), error instanceof Error ? `${error.stack || error.message}\n` : `${String(error)}\n`);
  throw error;
} finally {
  await browser.close();
}
