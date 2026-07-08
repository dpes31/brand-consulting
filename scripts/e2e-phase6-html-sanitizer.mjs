import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { buildPhase6StepFixtures } from './phase6-e2e-fixtures.mjs';

const appUrl = process.env.PREVIEW_URL;
if (!appUrl) throw new Error('PREVIEW_URL is required.');

const brand = '모노랩';
const artifactDir = path.resolve('phase6-v2-e2e-artifacts');
await mkdir(artifactDir, { recursive: true });

const exactUserPrintScript = `<script>document.addEventListener('click',e=>{if(e.target&&e.target.textContent.trim()==='PDF / Print')window.print();});</script>`;
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
const page = await context.newPage();
const dialogs = [];
page.on('dialog', async (dialog) => {
  dialogs.push(dialog.message());
  await dialog.accept();
});

async function completeResearchPipeline(targetPage) {
  const steps = buildPhase6StepFixtures(brand);
  await targetPage.getByPlaceholder('Enter brand name for deep-dive analysis...').fill(brand);
  await targetPage.getByRole('button', { name: 'Start Engine' }).click();
  for (let step = 0; step < steps.length; step += 1) {
    const area = targetPage.locator('textarea:visible').last();
    await area.fill(steps[step]);
    await targetPage.getByRole('button', { name: 'Submit & Continue' }).click();
    if (step < 5) {
      await targetPage.waitForFunction((submitted) => {
        const current = [...document.querySelectorAll('textarea')].find((node) => node.offsetParent !== null);
        return current?.value !== submitted;
      }, steps[step]);
    }
  }
  await targetPage.getByText('브리핑 종료 및 포맷팅 (Phase 6)').waitFor({ timeout: 30000 });
}

try {
  const pilotUrl = new URL(appUrl);
  pilotUrl.searchParams.set('pilot', 'full-integrated');
  pilotUrl.searchParams.set('brand', brand);
  await page.goto(pilotUrl.toString(), { waitUntil: 'networkidle', timeout: 120000 });
  await page.waitForFunction(() => document.documentElement.dataset.phase6PagePlanReady === 'true' && document.querySelectorAll('.full-slide').length === 40, null, { timeout: 60000 });

  const compatibilityHtml = await page.evaluate((printScript) => {
    document.querySelectorAll('.full-frame').forEach((frame) => {
      frame.setAttribute('style', 'width: 1049.6px; height: 590.4px;');
    });
    document.querySelectorAll('.full-frame-inner').forEach((inner) => {
      inner.setAttribute('style', 'transform: scale(0.82); transform-origin: top left;');
    });
    document.body.insertAdjacentHTML('beforeend', printScript);
    return `<!DOCTYPE html>\n${document.documentElement.outerHTML}`;
  }, exactUserPrintScript);

  assert.match(compatibilityHtml, /scale\(0\.82\)/);
  assert.match(compatibilityHtml, /PDF \/ Print/);
  await writeFile(path.join(artifactDir, 'user-defect-compatible-input.html'), compatibilityHtml);

  await page.goto(appUrl, { waitUntil: 'networkidle', timeout: 120000 });
  await completeResearchPipeline(page);
  const input = page.locator('textarea:visible').last();
  await input.fill(`\`\`\`html\n${compatibilityHtml}\n\`\`\``);
  await page.getByRole('button', { name: '결과물 뷰어에 렌더링하기' }).click();
  await page.locator('#fullscreen-viewer-iframe').waitFor({ timeout: 60000 });
  const frame = page.frameLocator('#fullscreen-viewer-iframe');
  await frame.locator('.full-slide').first().waitFor({ timeout: 60000 });

  const sanitized = await frame.locator('html').evaluate((root) => ({
    scripts: root.querySelectorAll('script,noscript').length,
    inlineHandlers: [...root.querySelectorAll('*')].flatMap((element) => [...element.attributes]).filter((attribute) => attribute.name.toLowerCase().startsWith('on')).length,
    pages: root.querySelectorAll('.full-slide').length,
    appendix: root.querySelectorAll('[data-zone="appendix"]').length,
    frameWidths: [...root.querySelectorAll('.full-frame')].map((node) => node.style.width),
    frameHeights: [...root.querySelectorAll('.full-frame')].map((node) => node.style.height),
    scales: [...root.querySelectorAll('.full-frame-inner')].map((node) => node.style.transform),
    contract: root.querySelector('body')?.dataset.contentContract,
  }));

  assert.equal(sanitized.scripts, 0);
  assert.equal(sanitized.inlineHandlers, 0);
  assert.equal(sanitized.pages, 40);
  assert.equal(sanitized.appendix, 0);
  assert.ok(sanitized.frameWidths.every((value) => value === '1280px'));
  assert.ok(sanitized.frameHeights.every((value) => value === '720px'));
  assert.ok(sanitized.scales.every((value) => value === 'scale(1)'));
  assert.equal(sanitized.contract, 'legacy-sanitized-html-v1');
  await frame.locator('#positioning').screenshot({ path: path.join(artifactDir, 'sanitized-positioning.png') });

  await page.getByRole('button', { name: 'Phase 6으로 돌아가기' }).click();
  await page.locator('#fullscreen-viewer-iframe').waitFor({ state: 'detached', timeout: 30000 });

  const malformedHtml = compatibilityHtml.replace('class="stp-position"', 'class="stp-position-removed"');
  assert.notEqual(malformedHtml, compatibilityHtml, 'Malformed fixture mutation failed');
  await input.fill(`\`\`\`html\n${malformedHtml}\n\`\`\``);
  const beforeMalformed = dialogs.length;
  await page.getByRole('button', { name: '결과물 뷰어에 렌더링하기' }).click();
  await page.waitForTimeout(500);
  assert.equal(await page.locator('#fullscreen-viewer-iframe').count(), 0);
  assert.ok(dialogs.slice(beforeMalformed).some((message) => /stp-position|승인된 페이지 구조/.test(message)));
  assert.ok(dialogs.slice(beforeMalformed).every((message) => !/Script is not allowed/.test(message)));

  const summary = {
    appUrl,
    exactScriptRemoved: true,
    leakedScaleInput: '0.82 / 1049.6×590.4',
    canonicalOutput: 'scale(1) / 1280×720',
    pages: sanitized.pages,
    scripts: sanitized.scripts,
    inlineHandlers: sanitized.inlineHandlers,
    malformedDomRejected: true,
    dialogs,
  };
  await writeFile(path.join(artifactDir, 'html-sanitizer-e2e-summary.json'), JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(summary, null, 2));
} catch (error) {
  await page.screenshot({ path: path.join(artifactDir, 'html-sanitizer-failure.png'), fullPage: true }).catch(() => undefined);
  await writeFile(path.join(artifactDir, 'html-sanitizer-failure.txt'), `${error instanceof Error ? error.stack || error.message : String(error)}\n\nDialogs:\n${JSON.stringify(dialogs, null, 2)}\n`);
  throw error;
} finally {
  await browser.close();
}
