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
const targetNames = ['실행형 사업자', '검증형 사업자', '성장형 사업자'];
const artifactDir = path.resolve('phase6-v2-e2e-artifacts');
await mkdir(artifactDir, { recursive: true });

const steps = buildPhase6StepFixtures(brand);
steps[0] += '\n핵심 사실은 **123만 명**과 **456억 원**이다.';
steps[2] += `\n${candidates.map((name, index) => `${index + 1}. **${name} — ${91 - index * 8}점:** 직접 경쟁 후보`).join('\n')}`;

const startMarker = '[IMMUTABLE 40-PAGE SEMANTIC HTML TEMPLATE — START]';
const endMarker = '[IMMUTABLE 40-PAGE SEMANTIC HTML TEMPLATE — END]';
const tokenPattern = /\[\[FIELD:([a-z0-9.-]+)\]\]/gi;
const positionPattern = /\[\[POSITION:([a-z0-9.-]+)\]\]/gi;
const coordinates = {
  'positioning.competitor1.x': 20,
  'positioning.competitor1.y': 72,
  'positioning.competitor2.x': 58,
  'positioning.competitor2.y': 42,
  'positioning.competitor3.x': 74,
  'positioning.competitor3.y': 78,
  'positioning.targetAsIs.x': 38,
  'positioning.targetAsIs.y': 55,
  'positioning.targetToBe.x': 85,
  'positioning.targetToBe.y': 18,
};

function semanticValue(key) {
  const candidate = key.match(/^comp-landscape\.candidate([1-5])\.name$/);
  if (candidate) return candidates[Number(candidate[1]) - 1];

  const rankName = key.match(/^comp-ranking\.rank([1-3])\.(name|summaryName)$/);
  if (rankName) return core[Number(rankName[1]) - 1];

  const deepTitle = key.match(/^deep-dive-([1-3])\.title$/);
  if (deepTitle) return `${core[Number(deepTitle[1]) - 1]}이 핵심 위협이다`;

  const matrixName = key.match(/^product-matrix\.column([1-4])\.name$/);
  if (matrixName) return Number(matrixName[1]) === 1 ? brand : core[Number(matrixName[1]) - 2];

  const mapName = key.match(/^positioning\.competitor([1-3])\.name$/);
  if (mapName) return core[Number(mapName[1]) - 1];
  if (key === 'positioning.targetAsIs') return '현재의 환급 중심 인식';
  if (key === 'positioning.targetToBe') return '선제적 사업 안전망';
  if (key === 'positioning.axis.xLeft') return '수동 확인 중심';
  if (key === 'positioning.axis.xRight') return '자동 실행 중심';
  if (key === 'positioning.axis.yTop') return '전략 판단 강화';
  if (key === 'positioning.axis.yBottom') return '단순 정보 제공';

  if (key === 'creative-history-target.title') return `${brand} Creative History`;
  const historyTitle = key.match(/^creative-history-([1-3])\.title$/);
  if (historyTitle) return `${core[Number(historyTitle[1]) - 1]} Creative History`;

  const trajectoryName = key.match(/^creative-trajectory\.brand([1-4])\.name$/);
  if (trajectoryName) return Number(trajectoryName[1]) === 1 ? brand : core[Number(trajectoryName[1]) - 2];
  if (/^creative-trajectory\.brand[1-4]\.meaning$/.test(key)) return '전략 역할 검증';

  const target = key.match(/^consumer-target\.target([1-3])\.name$/);
  if (target) return targetNames[Number(target[1]) - 1];
  const personaTitle = key.match(/^persona-([1-3])\.title$/);
  if (personaTitle) return targetNames[Number(personaTitle[1]) - 1];

  const segment = key.match(/^stp\.segment([1-3])\.name$/);
  if (segment) return targetNames[Number(segment[1]) - 1];
  if (key === 'stp.target.name') return targetNames[0];
  if (key === 'stp.target.description') return '검증 후 바로 실행하려는 핵심 사업자';
  if (key === 'stp.positioning') return `${targetNames[0]}에게 판단과 실행을 연결하는 ${brand}의 차별적 포지셔닝`;

  if (/\.status$/.test(key)) return 'COPY UNVERIFIED';
  if (/^creative-history-(?:target|[1-3])\.year[1-6]\.copy$/.test(key)) return '출처에서 캠페인 존재를 확인했으나 원문 카피는 미검증';
  if (/\.source(?:\.|$)/.test(key)) return 'QA Fixture · Step 0–5 · 2026';

  if (key === 'cover.headline') return `<mark>${brand}</mark>은 판단을 실행으로 바꾼다`;
  if (key === 'decision-close.principle') return `${brand}은 판단을 실행으로 바꾼다`;
  if (key === 'decision-close.support') return '검증된 근거가 다음 행동까지 이어지게 한다';
  if (key === 'strategy-choice.bigIdeal') return '더 나은 판단은 더 빠른 실행을 만든다';
  if (key === 'strategy-choice.winningMove') return '판단에서 실행까지';
  if (key === 'strategy-choice.proof') return `${brand}의 데이터와 실행 기능이 한 흐름으로 연결된다`;

  if (/^strategy-routes\.route[A-D]\.type$/.test(key)) return '성장 전략';
  if (/^strategy-routes\.route[A-D]\.proposition$/.test(key)) return `${key.match(/route([A-D])/)[1]}안은 판단과 실행의 간극을 줄인다`;
  if (/^strategy-routes\.route[A-D]\.direction$/.test(key)) return '핵심 고객의 실제 행동 장벽을 직접 해결한다';
  if (/^strategy-routes\.route[A-D]\.tradeoff$/.test(key)) return '단기 주목보다 장기 브랜드 자산을 우선한다';
  if (/^strategy-routes\.route[A-D]\.(differentiation|expansion|execution)$/.test(key)) return '상';

  if (/^persona-[1-3]\.situation\d+$/.test(key)) return '정보를 확인한 뒤 바로 행동해야 하는 실제 상황';
  if (/^persona-[1-3]\.(surfaceNeed|realJob|fear1|fear2|asIsIdentity|toBeIdentity|brandRole)$/.test(key)) {
    return '불확실성을 줄이고 확신 있게 다음 행동으로 이동한다';
  }

  if (/^jtbd\.row\d+\.(jobType|desiredProgress|currentAlternative|limitation|brandOpportunity)$/.test(key)) {
    return '검증된 근거로 더 나은 판단과 실행을 완성한다';
  }

  if (/^aipl\.stage\d+\.(action|evidence|state)$/.test(key)) return '근거를 확인하고 다음 행동으로 이동한다';
  if (/^comp-ranking\.rank[1-3]\.evidence$/.test(key)) return '공식자료·외부DB';
  if (/^comp-ranking\.rank[1-3]\.(penetration|growth|preference|campaign|inflection|total)$/.test(key)) return '85';
  if (/\.(score|rating|value)$/.test(key)) return '85';
  if (/\.title$/.test(key)) return `${brand}의 핵심 전략 판단`;
  if (/\.soWhat$/.test(key)) return '검증된 근거를 하나의 선택과 실행으로 연결해야 한다';
  if (/\.period$/.test(key)) return '2026';
  if (/\.label$/.test(key)) return '핵심 근거';
  if (/\.name$/.test(key)) return '검증 대상';
  return '현재 조사에서 확인된 핵심 근거와 실행 의미';
}

function fillSemanticFields(template) {
  const result = template
    .replace(tokenPattern, (_token, key) => semanticValue(key))
    .replace(positionPattern, (_token, key) => String(coordinates[key]));
  assert.doesNotMatch(result, /\[\[(?:FIELD|POSITION):/);
  return result.replace('</body>', '<script>document.addEventListener("click",()=>window.print())</script></body>');
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
  await page.getByRole('button', { name: /완성 HTML 프롬프트 다운로드/ }).click();
  const download = await downloadPromise;
  const promptPath = path.join(artifactDir, 'phase6-prompt.txt');
  await download.saveAs(promptPath);
  const prompt = await readFile(promptPath, 'utf8');

  assert.match(prompt, /Return one complete standalone HTML document, not JSON/);
  assert.match(prompt, /Main Deck: exactly 40 pages/);
  assert.match(prompt, /Appendix: 0 pages/);
  assert.match(prompt, /P12 selects the core three/);
  assert.match(prompt, /P18 positioning\.targetAsIs must start exactly/);
  assert.match(prompt, /Replace every \[\[POSITION:semantic\.key\]\]/);
  assert.match(prompt, /<mark>important phrase<\/mark>/);
  assert.match(prompt, /Decision Close/);
  assert.match(prompt, /~한다/);
  assert.doesNotMatch(prompt, /Return JSON only|Never return HTML|\[\[CONTENT:/);
  assert.ok(prompt.indexOf('[STEP 0–5 RESEARCH — SOURCE OF TRUTH]') < prompt.indexOf(startMarker));

  const start = prompt.indexOf(startMarker);
  const end = prompt.indexOf(endMarker);
  assert.ok(start >= 0 && end > start, 'Semantic HTML template markers are missing');
  const html = fillSemanticFields(prompt.slice(start + startMarker.length, end).trim());
  await writeFile(path.join(artifactDir, 'generated-report.html'), html);

  const phase6Input = page.locator('textarea:visible').last();
  await phase6Input.fill(`\`\`\`html\n${html}\n\`\`\``);
  const dialogsBeforeRender = dialogs.length;
  await page.getByRole('button', { name: '결과물 뷰어에 렌더링하기' }).click();
  await page.waitForTimeout(1200);
  if ((await page.locator('#fullscreen-viewer-iframe').count()) === 0) {
    throw new Error(`Viewer did not open. New dialogs: ${JSON.stringify(dialogs.slice(dialogsBeforeRender))}`);
  }

  const frame = page.frameLocator('#fullscreen-viewer-iframe');
  await frame.locator('.full-slide').first().waitFor({ timeout: 60000 });

  assert.equal(await frame.locator('.full-slide').count(), 40);
  assert.equal(await frame.locator('.full-nav a').count(), 40);
  assert.equal(await frame.locator('[data-zone="appendix"]').count(), 0);
  assert.equal(await frame.locator('#creative-method').count(), 0);
  assert.equal(await frame.locator('script').count(), 0);
  assert.equal(await frame.locator('[data-report-field$=".content1"]').count(), 0);

  const ids = await frame.locator('.full-slide').evaluateAll((nodes) => nodes.map((node) => node.id));
  assert.deepEqual(ids.slice(10, 18), [
    'comp-landscape','comp-ranking','deep-dive-1','deep-dive-2','deep-dive-3','product-matrix','category-cliche','positioning',
  ]);
  assert.deepEqual(ids.slice(28, 34), [
    'creative-history-target','creative-history-1','creative-history-2','creative-history-3','creative-trajectory','creative-insight',
  ]);
  assert.deepEqual(ids.slice(34), [
    'strategy-swot','root-cause','stp','strategy-routes','strategy-choice','decision-close',
  ]);

  const navBrand = (await frame.locator('.full-nav-brand').textContent())?.replace(/FULL REPORT V\d/g, '').trim();
  assert.equal(navBrand, brand);
  assert.match(await frame.locator('#executive .full-breadcrumb').textContent(), /핵심 진단/);
  assert.match(await frame.locator('#kpi .full-breadcrumb').textContent(), /FACTS/);
  assert.match(await frame.locator('#category-target .full-breadcrumb').textContent(), /CATEGORY & TARGET/);
  assert.match(await frame.locator('#market-shift .full-breadcrumb').textContent(), /CATEGORY SHIFT/);
  assert.deepEqual(await frame.locator('#market-shift .ladder-step > span').allTextContents(), ['LEVEL 1','LEVEL 2','LEVEL 3','LEVEL 4','LEVEL 5']);

  const allText = await frame.locator('body').innerText();
  assert.doesNotMatch(allText, /\[\[/);
  candidates.forEach((name) => assert.match(allText, new RegExp(name)));
  for (let index = 0; index < core.length; index += 1) {
    assert.match(await frame.locator(`#deep-dive-${index + 1}`).innerText(), new RegExp(core[index]));
  }

  assert.equal(await frame.locator('#cover mark').count(), 1);
  const statusTexts = await frame.locator('.history-status').allTextContents();
  assert.ok(statusTexts.length >= 24);
  assert.ok(statusTexts.every((value) => value.trim() === 'source-found-copy-unverified'));

  const positioning = await frame.locator('#positioning').evaluate((slide) => {
    const point = (selector) => {
      const node = slide.querySelector(selector);
      return {
        text: node?.textContent?.trim() || '',
        x: node?.dataset.positionX || '',
        y: node?.dataset.positionY || '',
        left: node?.style.left || '',
        top: node?.style.top || '',
      };
    };
    return {
      contract: slide.querySelector('.position-map')?.dataset.positioningCoordinateContract || '',
      asIs: point('.map-dot.biz-as'),
      toBe: point('.map-dot.biz-to'),
      competitor1: point('.map-dot.sam'),
      axes: [
        slide.querySelector('.axis-x-left')?.textContent?.trim(),
        slide.querySelector('.axis-x-right')?.textContent?.trim(),
        slide.querySelector('.axis-y-top')?.textContent?.trim(),
        slide.querySelector('.axis-y-bottom')?.textContent?.trim(),
      ],
    };
  });
  assert.equal(positioning.contract, 'semantic-0-100-v1');
  assert.match(positioning.asIs.text, new RegExp(`${brand} AS-IS`));
  assert.match(positioning.toBe.text, new RegExp(`${brand} TO-BE`));
  assert.deepEqual(
    [positioning.asIs.x, positioning.asIs.y, positioning.toBe.x, positioning.toBe.y],
    ['38', '55', '85', '18'],
  );
  assert.deepEqual(
    [positioning.asIs.left, positioning.asIs.top, positioning.toBe.left, positioning.toBe.top],
    ['38%', '55%', '85%', '18%'],
  );
  assert.deepEqual(positioning.axes, ['수동 확인 중심', '자동 실행 중심', '전략 판단 강화', '단순 정보 제공']);

  const marketType = await frame.locator('#market-context').evaluate((slide) => ({
    implication: Number.parseFloat(getComputedStyle(slide.querySelector('.market-force strong')).fontSize),
    pageNumber: Number.parseFloat(getComputedStyle(slide.querySelector('.full-page')).fontSize),
  }));
  assert.ok(marketType.implication >= marketType.pageNumber);

  for (const id of ['persona-2','persona-3']) {
    const persona = await frame.locator(`#${id} .persona-index`).evaluate((node) => ({
      text: node.textContent.trim(),
      whiteSpace: getComputedStyle(node).whiteSpace,
    }));
    assert.match(persona.text, /^0[23]$/);
    assert.equal(persona.whiteSpace, 'nowrap');
  }

  assert.equal(await frame.locator('.history-now').count(), 0);
  const routeLabels = await frame.locator('#strategy-routes .route-row > b').allTextContents();
  assert.deepEqual(routeLabels.map((label) => label.trim().charAt(0)), ['A','B','C','D']);

  const geometry = await frame.locator('.full-slide').evaluateAll((nodes) => nodes.map((node) => {
    const rect = node.getBoundingClientRect();
    return {
      id: node.id,
      logicalWidth: node.offsetWidth,
      logicalHeight: node.offsetHeight,
      renderedWidth: rect.width,
      renderedHeight: rect.height,
      scale: rect.width / node.offsetWidth,
      overflowX: node.scrollWidth - node.clientWidth,
      overflowY: node.scrollHeight - node.clientHeight,
    };
  }));
  assert.ok(geometry.every((item) => item.logicalWidth === 1280 && item.logicalHeight === 720));
  assert.ok(geometry.every((item) => item.scale > 0 && item.scale <= 1.01));
  assert.deepEqual(geometry.filter((item) => item.overflowX > 1 || item.overflowY > 1), []);

  await frame.locator('#positioning').screenshot({ path: path.join(artifactDir, 'screen-positioning.png') });
  await frame.locator('#category-cliche').screenshot({ path: path.join(artifactDir, 'screen-category-cliches.png') });
  await frame.locator('#creative-history-target').screenshot({ path: path.join(artifactDir, 'screen-creative-history.png') });
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
  await page.keyboard.press('Control+P');
  await page.waitForFunction(() => document.getElementById('fullscreen-viewer-iframe')?.contentDocument?.documentElement.dataset.calls === '3');
  await page.keyboard.press('Meta+P');
  await page.waitForFunction(() => document.getElementById('fullscreen-viewer-iframe')?.contentDocument?.documentElement.dataset.calls === '4');

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
  assert.match(await reopened.locator('#positioning .map-dot.biz-to').textContent(), new RegExp(`${brand} TO-BE`));

  const summary = {
    appUrl,
    brand,
    candidates,
    core,
    pages: 40,
    nav: 40,
    ids,
    marketType,
    positioning,
    routeLabels,
    geometry,
    pdf: { pages: 40, size: '960x540pt' },
    exports: 4,
    reopened: 40,
    dialogs,
  };
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