import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const previewUrl = process.env.PREVIEW_URL;
const artifactDir = path.resolve('phase6-v2-e2e-artifacts');
await mkdir(artifactDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
const response = await page.goto(previewUrl, { waitUntil: 'networkidle', timeout: 120000 });
const diagnostic = {
  requestedUrl: previewUrl,
  finalUrl: page.url(),
  status: response?.status(),
  title: await page.title(),
  bodyText: (await page.locator('body').innerText()).slice(0, 4000),
  htmlStart: (await page.content()).slice(0, 4000),
};
await page.screenshot({ path: path.join(artifactDir, '00-preview-entry.png'), fullPage: true });
await writeFile(path.join(artifactDir, '00-preview-entry.json'), JSON.stringify(diagnostic, null, 2));
console.log(JSON.stringify(diagnostic, null, 2));
await browser.close();
