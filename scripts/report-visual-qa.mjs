import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const baseUrl = process.env.REPORT_URL || 'http://127.0.0.1:4173/?pilot=full-integrated&brand=%EB%B9%84%EC%A6%88%EB%84%B5';
const outDir = path.resolve('artifacts/report-visual-qa');
await fs.rm(outDir, { recursive: true, force: true });
await fs.mkdir(path.join(outDir, 'pages'), { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1680, height: 1000 }, deviceScaleFactor: 1 });
await page.goto(baseUrl, { waitUntil: 'networkidle' });
await page.evaluate(async () => { await document.fonts.ready; });
await page.waitForTimeout(1200);

const slides = page.locator('.full-slide');
const count = await slides.count();
const metrics = [];

for (let index = 0; index < count; index += 1) {
  const slide = slides.nth(index);
  const id = (await slide.getAttribute('id')) || `page-${String(index + 1).padStart(2, '0')}`;
  const pageNo = (await slide.getAttribute('data-page')) || String(index + 1).padStart(2, '0');
  await slide.screenshot({ path: path.join(outDir, 'pages', `${String(index + 1).padStart(2, '0')}-${id}.png`) });

  const result = await slide.evaluate((node) => {
    const body = node.querySelector('.full-slide-body');
    const rect = node.getBoundingClientRect();
    const bodyRect = body?.getBoundingClientRect();
    const contentNodes = Array.from(node.querySelectorAll('.full-slide-body p, .full-slide-body li, .full-slide-body td, .full-slide-body dd, .full-slide-body blockquote'));
    const fontSizes = contentNodes
      .filter((el) => !el.closest('.full-source'))
      .map((el) => Number.parseFloat(getComputedStyle(el).fontSize))
      .filter(Number.isFinite);
    const topRules = Array.from(node.querySelectorAll('.persona-left, .persona-center, .identity-shift > div, .target-spectrum > div'))
      .map((el) => Math.round(el.getBoundingClientRect().top - rect.top));
    return {
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      bodyScrollWidth: body?.scrollWidth ?? 0,
      bodyClientWidth: body?.clientWidth ?? 0,
      bodyScrollHeight: body?.scrollHeight ?? 0,
      bodyClientHeight: body?.clientHeight ?? 0,
      bodyTop: bodyRect ? Math.round(bodyRect.top - rect.top) : null,
      bodyBottom: bodyRect ? Math.round(rect.bottom - bodyRect.bottom) : null,
      minBodyFont: fontSizes.length ? Math.min(...fontSizes) : null,
      topRules,
    };
  });

  metrics.push({ index: index + 1, page: pageNo, id, ...result });
}

await page.screenshot({ path: path.join(outDir, 'full-report.png'), fullPage: true });
await fs.writeFile(path.join(outDir, 'metrics.json'), JSON.stringify({ url: baseUrl, count, metrics }, null, 2));
await browser.close();

const failures = metrics.filter((item) =>
  item.width !== 1280 ||
  item.height !== 720 ||
  item.bodyScrollWidth > item.bodyClientWidth + 3 ||
  item.bodyScrollHeight > item.bodyClientHeight + 3 ||
  (item.minBodyFont !== null && item.minBodyFont < 12)
);

if (count !== 48 || failures.length > 0) {
  console.error(JSON.stringify({ count, failures }, null, 2));
  process.exitCode = 1;
}
