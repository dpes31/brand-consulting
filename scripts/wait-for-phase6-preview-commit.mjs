import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const previewUrl = process.env.PREVIEW_URL;
const expectedSha = process.env.EXPECTED_SHA;
if (!previewUrl) throw new Error('PREVIEW_URL is required.');
if (!expectedSha) throw new Error('EXPECTED_SHA is required.');

const expectedShort = expectedSha.slice(0, 7);
const artifactDir = path.resolve('phase6-v2-e2e-artifacts');
await mkdir(artifactDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
const deadline = Date.now() + 8 * 60 * 1000;
let observed = '';
let lastError = '';

try {
  while (Date.now() < deadline) {
    try {
      await page.goto(`${previewUrl}?deployment-check=${Date.now()}`, {
        waitUntil: 'networkidle',
        timeout: 90000,
      });
      await page.waitForFunction(() => Boolean(document.documentElement.dataset.deploymentCommit), undefined, { timeout: 30000 });
      observed = await page.locator('html').getAttribute('data-deployment-commit') || '';
      if (observed === expectedShort) {
        await page.screenshot({ path: path.join(artifactDir, '00-vercel-preview-entry.png'), fullPage: true });
        console.log(JSON.stringify({ previewUrl, expectedShort, observed, ready: true }, null, 2));
        process.exitCode = 0;
        break;
      }
      lastError = `Preview commit is ${observed}; waiting for ${expectedShort}`;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
    await page.waitForTimeout(10000);
  }

  if (observed !== expectedShort) {
    await page.screenshot({ path: path.join(artifactDir, '00-vercel-preview-timeout.png'), fullPage: true }).catch(() => undefined);
    throw new Error(`Vercel Preview did not reach commit ${expectedShort}. Last observed: ${observed || 'none'}. ${lastError}`);
  }
} finally {
  await browser.close();
}
