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
    await new Promise((resolve) => setTimeout(resolve, 1800));
  }
  await route.continue();
});

try {
  await page.goto(appUrl, { waitUntil: 'domcontentloaded', timeout: 120000 });
  const icons = page.locator('.material-symbols-outlined');
  await icons.first().waitFor({ state: 'attached', timeout: 30000 });
  await page.waitForFunction(() => document.documentElement.dataset.materialSymbolsState === 'pending', null, { timeout: 10000 });

  const before = await page.evaluate(() => {
    const exportButton = Array.from(document.querySelectorAll('button')).find((button) => button.textContent?.includes('Export PDF'));
    const iconNodes = Array.from(document.querySelectorAll('.material-symbols-outlined'));
    const visibleLigatures = iconNodes.filter((node) => {
      const style = getComputedStyle(node);
      return style.visibility !== 'hidden' && style.display !== 'none' && node.getBoundingClientRect().width > 0;
    });
    const iconBoxes = iconNodes.slice(0, 12).map((node) => {
      const rect = node.getBoundingClientRect();
      const style = getComputedStyle(node);
      return {
        text: node.textContent?.trim() || '',
        visibility: style.visibility,
        width: rect.width,
        height: rect.height,
      };
    });
    const buttonRect = exportButton?.getBoundingClientRect();
    return {
      state: document.documentElement.dataset.materialSymbolsState,
      visibleLigatures: visibleLigatures.map((node) => node.textContent?.trim()),
      iconBoxes,
      buttonRect: buttonRect ? { x: buttonRect.x, y: buttonRect.y, width: buttonRect.width, height: buttonRect.height } : null,
    };
  });

  assert.equal(before.state, 'pending');
  assert.deepEqual(before.visibleLigatures, [], 'Ligature words were visible before the icon font loaded');
  assert.ok(before.iconBoxes.length > 0, 'No Material Symbols icons were found');
  assert.ok(before.iconBoxes.every((box) => box.visibility === 'hidden'), 'Pending icons must remain hidden');
  assert.ok(before.iconBoxes.every((box) => box.width > 0 && box.width <= 32), 'Pending icons must reserve a fixed compact box');
  assert.ok(before.buttonRect, 'Export PDF button was not found');
  await page.screenshot({ path: path.join(artifactDir, 'material-symbols-pending.png'), fullPage: true });

  await page.waitForFunction(() => document.documentElement.dataset.materialSymbolsState === 'ready', null, { timeout: 30000 });
  await page.waitForFunction(() => document.fonts.check('24px "Material Symbols Outlined"', 'search'), null, { timeout: 30000 });

  const after = await page.evaluate(() => {
    const exportButton = Array.from(document.querySelectorAll('button')).find((button) => button.textContent?.includes('Export PDF'));
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
    const buttonRect = exportButton?.getBoundingClientRect();
    return {
      state: document.documentElement.dataset.materialSymbolsState,
      iconBoxes,
      buttonRect: buttonRect ? { x: buttonRect.x, y: buttonRect.y, width: buttonRect.width, height: buttonRect.height } : null,
    };
  });

  assert.equal(after.state, 'ready');
  assert.ok(after.iconBoxes.every((box) => box.visibility === 'visible'), 'Icons were not revealed after font readiness');
  assert.ok(after.iconBoxes.every((box) => box.fontFamily.includes('Material Symbols Outlined')), 'Material Symbols font was not applied');
  assert.ok(after.buttonRect, 'Export PDF button disappeared after font load');
  assert.ok(Math.abs(after.buttonRect.x - before.buttonRect.x) <= 1, 'Export button shifted horizontally during icon load');
  assert.ok(Math.abs(after.buttonRect.y - before.buttonRect.y) <= 1, 'Export button shifted vertically during icon load');
  assert.ok(Math.abs(after.buttonRect.width - before.buttonRect.width) <= 1, 'Export button width changed during icon load');
  assert.ok(Math.abs(after.buttonRect.height - before.buttonRect.height) <= 1, 'Export button height changed during icon load');
  assert.ok(delayedMaterialFontRequests > 0, 'Material Symbols font request was not intercepted');

  await page.screenshot({ path: path.join(artifactDir, 'material-symbols-ready.png'), fullPage: true });
  const summary = { appUrl, delayedMaterialFontRequests, before, after };
  await writeFile(path.join(artifactDir, 'material-symbols-summary.json'), JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(summary, null, 2));
} catch (error) {
  await page.screenshot({ path: path.join(artifactDir, 'material-symbols-failure.png'), fullPage: true }).catch(() => undefined);
  await writeFile(
    path.join(artifactDir, 'material-symbols-failure.txt'),
    error instanceof Error ? `${error.stack || error.message}\n` : `${String(error)}\n`,
  );
  throw error;
} finally {
  await browser.close();
}
