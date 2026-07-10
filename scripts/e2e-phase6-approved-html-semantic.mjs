import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { buildPhase6StepFixtures } from './phase6-e2e-fixtures.mjs';

const appUrl = process.env.PREVIEW_URL;
if (!appUrl) throw new Error('PREVIEW_URL is required.');

const brand = '모노랩';
const core = ['알파원', '베타랩', '감마코'];
const personaNames = ['비용 방어형', '성장 불안형', '위임 불안형'];
const artifactDir = path.resolve('phase6-v2-e2e-artifacts');
await mkdir(artifactDir, { recursive: true });

const steps = buildPhase6StepFixtures(brand);
steps[0] += '\n핵심 KPI는 **123만 명**과 **456억 원**입니다.';
steps[2] += `\n${core.map((name, index) => `${index + 1}. **${name} — ${91 - index * 7}점:** 직접 경쟁 위협`).join('\n')}`;

const BASE_START = '[IMMUTABLE APPROVED BASE HTML — START]';
const BASE_END = '[IMMUTABLE APPROVED BASE HTML — END]';

function command(name, args) {
  return execFileSync(name, args, { encoding: 'utf8' });
}

function extractBase(prompt) {
  const start = prompt.indexOf(BASE_START);
  const end = prompt.indexOf(BASE_END, start + BASE_START.length);
  assert.ok(start >= 0 && end > start, 'Approved Base HTML markers are missing');
  return prompt.slice(start + BASE_START.length, end).trim();
}

async function buildExternalHtml(context, baseHtml) {
  const external = await context.newPage();
  await external.setContent(baseHtml, { waitUntil: 'domcontentloaded' });
  const html = await external.evaluate(({ brandName, competitors, personas }) => {
    const set = (selector, value) => {
      const node = document.querySelector(selector);
      if (!node) throw new Error(`Missing fixture selector: ${selector}`);
      node.textContent = value;
    };
    const setAll = (selector, values) => {
      const nodes = [...document.querySelectorAll(selector)];
      if (nodes.length < values.length) throw new Error(`Missing fixture nodes: ${selector}`);
      values.forEach((value, index) => { nodes[index].textContent = value; });
    };

    document.querySelectorAll('[data-report-field]').forEach((node) => {
      const key = node.dataset.reportField || '';
      const kind = node.dataset.reportKind || 'text';
      const max = Number(node.dataset.reportMaxLength || 120);
      let value = '현재 조사에서 확인된 핵심 근거입니다';
      if (kind === 'number') value = '4';
      else if (kind === 'source') value = '공식 자료 · QA 검증 · 2026';
      else if (kind === 'status') value = 'not-found';
      else if (key.endsWith('.title')) value = `${brandName}의 핵심 판단을 명확히 정리합니다`;
      else if (key.endsWith('.soWhat')) value = '이 결과는 다음 의사결정을 요구합니다';
      else if (key.includes('.copy')) value = '원문 카피 공개 미확인';
      node.textContent = value.slice(0, max);
    });

    set('#cover .full-title-row h2', `${brandName}은 복잡한 판단을 이해 가능한 선택으로 바꿉니다`);
    set('#cover .cover-copy h1', `${brandName}의 판단을 보이게 하라`);
    set('#cover .cover-copy p', `${brandName}의 조사 결과를 시장·소비자·전략으로 연결한 보고서`);
    set('#executive .full-title-row h2', '제품의 강점은 있지만 고객이 선택할 명확한 이유는 아직 부족합니다');

    const kpiValues = [...document.querySelectorAll('#kpi strong')];
    if (kpiValues.length < 2) throw new Error('KPI fixture fields are missing');
    kpiValues[0].textContent = '123만 명';
    kpiValues[1].textContent = '456억 원';

    set('#category-target .target-statement h3', '사업은 성장했지만 전문 인력 없이 중요한 판단을 직접 책임지는 대표');
    setAll('#category-target .target-tension > p', ['사업에 집중하면서 판단 근거와 통제권을 확보하기', '비용과 정보를 잃은 채 결과만 통보받는 상태']);

    const rankingRows = [...document.querySelectorAll('#comp-ranking .ranking-table tbody tr')];
    competitors.forEach((name, index) => {
      const cells = rankingRows[index].querySelectorAll('td');
      cells[1].textContent = name;
      for (let cell = 2; cell < cells.length; cell += 1) cells[cell].textContent = String(Math.max(4, 9 - index));
    });
    setAll('#comp-ranking .ranking-interpretation > div > b', competitors);
    setAll('#comp-ranking .ranking-interpretation > div > p', [
      '대중적 인지와 빠른 진입을 장악합니다',
      '전문 검토와 장기 관계를 선점합니다',
      '반복 사용과 셀프 통제감을 만듭니다',
    ]);

    competitors.forEach((name, index) => {
      const id = `#deep-dive-${index + 1}`;
      set(`${id} .full-title-row h2`, `${name}의 위협은 기능이 아니라 고객 선택을 만드는 방식입니다`);
      set(`${id} .deep-dive-score > strong`, String(91 - index * 7));
      const evidenceNodes = [...document.querySelectorAll(`${id} .deep-node--1 li, ${id} .deep-node--1 > p`)];
      if (evidenceNodes.length === 1) {
        evidenceNodes[0].textContent = `${name}의 공식 활동·제품·커뮤니케이션 증거`;
      } else if (evidenceNodes.length >= 3) {
        [`${name}의 공식 활동 근거`, `${name}의 제품·서비스 증거`, `${name}의 커뮤니케이션 증거`]
          .forEach((value, evidenceIndex) => { evidenceNodes[evidenceIndex].textContent = value; });
      } else {
        throw new Error(`Missing Evidence nodes: ${id}`);
      }
      setAll(`${id} .deep-node--2 > p, ${id} .deep-node--3 > p, ${id} .deep-node--4 > p, ${id} .deep-node--5 > p`, [
        '고객이 실제로 원하는 진보',
        '고객을 움직이는 핵심 소구',
        '선택을 만드는 구조적 메커니즘',
        `${brandName}이 피하고 공략할 빈틈`,
      ]);
    });

    const matrixHeaders = [...document.querySelectorAll('#product-matrix .matrix-table thead th')];
    matrixHeaders[1].textContent = brandName;
    competitors.forEach((name, index) => { matrixHeaders[index + 2].textContent = name; });

    setAll('#category-cliche .cliche-row > b', ['숨은 혜택', '간편 처리', '최대 성과', '전문가 검토']);
    setAll('#category-cliche .cliche-row > p:nth-of-type(1)', [
      '즉각적인 관심을 만듭니다', '사용 장벽을 낮춥니다', '경제적 보상을 강조합니다', '안전하다는 인상을 줍니다',
    ]);
    setAll('#category-cliche .cliche-row > p:nth-of-type(2)', [
      '경쟁사가 모두 사용하는 표현입니다', '과정의 품질을 설명하지 못합니다', '과장과 불신을 만들 수 있습니다', '책임 범위가 보이지 않습니다',
    ]);

    setAll('#positioning .axis', ['일회성 문제 해결', '지속적 운영 관리', '전문가 검증 중심', '사용자 직접 통제']);
    const dots = [...document.querySelectorAll('#positioning .map-dot')];
    competitors.forEach((name, index) => { dots[index].textContent = name; });
    dots[3].textContent = `${brandName} AS-IS`;
    dots[4].textContent = `${brandName} TO-BE`;

    setAll('#consumer-target .target-spectrum > div > b', ['초기 탐색형', ...personas, '전문 조직형']);
    personas.forEach((name, index) => {
      const id = `#persona-${index + 1}`;
      set(`${id} .full-title-row h2`, name);
      setAll(`${id} .persona-left li`, ['사업 복잡성이 빠르게 증가합니다', '전담 인력이 부족합니다']);
      set(`${id} .persona-quote strong`, '결과를 맡기되 이유는 알고 싶습니다');
      set(`${id} .persona-center > h3`, '전문가 수준의 판단을 이해하고 최종 선택을 통제합니다');
      setAll(`${id} .persona-fears > p`, ['잘못된 판단의 비용', '책임 소재의 불명확성']);
      setAll(`${id} .identity-shift p`, ['결과를 기다리는 대표', '근거를 이해하고 승인하는 대표']);
      set(`${id} .brand-role strong`, `${brandName}은 판단 근거와 다음 행동을 명확히 보여줍니다`);
    });

    [...document.querySelectorAll('#pain-needs .pain-row')].forEach((row, index) => {
      row.querySelector('b').textContent = `판단 공백 ${index + 1}`;
      row.querySelector('p').textContent = `현재 과정에서 중요한 근거 ${index + 1}을 확인하기 어렵습니다`;
      row.querySelector('strong').textContent = `적용·제외 이유와 책임 범위를 한 화면에서 이해하기`;
      row.querySelector('em').textContent = index < 2 ? '매우 높음' : '높음';
    });

    const stages = [...document.querySelectorAll('#aipl .aipl-stage')];
    const actions = ['문제를 인지합니다', '대안을 비교합니다', '신뢰를 검증합니다', '서비스를 선택합니다', '다음 행동을 반복합니다'];
    const descriptions = ['광고와 검색으로 필요를 발견', '성과와 비용을 탐색', '근거·위험·책임을 확인', '정보 제공과 결제를 결정', '관리 가치가 있으면 재이용'];
    const states = ['유입', '관심', '핵심 병목', '구매', '관계'];
    stages.forEach((stage, index) => {
      stage.querySelector('strong').textContent = actions[index];
      stage.querySelector('p').textContent = descriptions[index];
      stage.querySelector('em').textContent = states[index];
    });
    set('#aipl .friction-analysis > h3', '판단 근거가 보이지 않는 신뢰 공백');
    setAll('#aipl .friction-analysis li', ['민감한 정보 제공', '비용 지불', '검토 범위 확인', '오류 가능성 판단', '책임 주체 확인']);

    [...document.querySelectorAll('#loyalty .relationship-loop > div')].forEach((step, index) => {
      step.querySelector('b').textContent = ['문제 발견', '근거 설명', '결정 승인', '예방 행동', '관리 관계'][index];
      step.querySelector('p').textContent = ['필요와 손실을 확인', '판단 이유를 이해', '고객이 최종 선택', '같은 문제를 예방', '다음 의사결정을 지원'][index];
    });

    set('#creative-history-target .full-title-row h2', `${brandName} Creative History`);
    competitors.forEach((name, index) => set(`#creative-history-${index + 1} .full-title-row h2`, `${name} Creative History`));
    document.querySelectorAll('.history-card').forEach((card) => {
      card.querySelector('.history-status').textContent = 'not-found';
      card.querySelector('h4').textContent = '공개 캠페인 확인 필요';
      card.querySelector('blockquote').textContent = '원문 카피 공개 미확인';
      card.querySelector('.history-detail').textContent = '모델·매체·전략 의미 추가 검증 필요';
      const source = card.querySelector('.full-source span') || card.querySelector('.full-source');
      source.textContent = '공개 자료 추가 검증 필요 · 2026';
    });
    const trajectoryNames = [...document.querySelectorAll('#creative-trajectory .trajectory-brand > b')];
    trajectoryNames[0].textContent = brandName;
    competitors.forEach((name, index) => { trajectoryNames[index + 1].textContent = name; });

    set('#root-cause .root-core > h3', '결과는 제공하지만 어떤 판단을 했고 누가 책임지는지 고객이 이해하기 어렵습니다');
    set('#root-cause .root-opportunity > h3', '판단 근거와 책임을 보이게 만들어 고객이 최종 결정을 통제하도록 합니다');

    const stpSegments = [...document.querySelectorAll('#stp .stp-segments > div > b')];
    const segmentValues = ['초기 탐색형', ...personas];
    segmentValues.forEach((value, index) => { if (stpSegments[index]) stpSegments[index].textContent = value; });
    set('#stp .stp-target > strong', personas[1]);
    set('#stp .stp-target > p', '사업 복잡성은 커졌지만 전담 인력 없이 중요한 판단을 직접 책임지는 대표');
    set('#stp .stp-position > strong', `${brandName}은 성장 불안형 대표에게 판단 근거와 책임을 보여주는 운영 파트너입니다`);

    [...document.querySelectorAll('#strategy-routes .route-row')].forEach((row, index) => {
      const children = [...row.children];
      children[1].textContent = ['예방 기능 강화', '안심 경험 강화', '판단 통제권 선점', '운영 플랫폼 확장'][index];
      children[2].textContent = ['문제를 미리 줄입니다', '불안을 낮춥니다', '근거와 승인권을 남깁니다', '관계를 넓힙니다'][index];
      children[3].textContent = ['기능 모방 위험', '추상적 신뢰 위험', '운영 증거 필요', '복잡성 증가'][index];
      children[4].textContent = String([3, 3, 5, 4][index]);
      children[5].textContent = String([3, 4, 5, 5][index]);
      children[6].textContent = String([5, 4, 4, 2][index]);
    });

    set('#strategy-choice .choice-final h3', '모든 대표는 중요한 판단의 이유를 이해하고 최종 결정을 통제할 권리가 있습니다');
    set('#strategy-choice .choice-final h2', '판단 설명서');
    set('#strategy-choice .choice-final > p', '모든 결과에 적용·제외·위험·검토·책임을 기록해 선택의 근거를 남깁니다');
    set('#appendix-back .back-cover-copy > h1', '맡겨도 판단의 근거와 결정권은 고객에게 남습니다');
    set('#appendix-back .back-cover-copy > p', `${brandName}은 결과를 대신 말하는 데서 그치지 않고 결정의 이유를 보이게 합니다`);

    document.querySelectorAll('.full-frame').forEach((frame) => frame.setAttribute('style', 'width:1049.6px;height:590.4px'));
    document.querySelectorAll('.full-frame-inner').forEach((inner) => inner.setAttribute('style', 'transform:scale(0.82)'));
    document.body.setAttribute('onclick', 'window.print()');
    document.body.insertAdjacentHTML('beforeend', '<script>document.addEventListener("click",()=>window.print())</script>');
    return `<!DOCTYPE html>\n${document.documentElement.outerHTML}`;
  }, { brandName: brand, competitors: core, personas: personaNames });
  await external.close();
  return html;
}

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
    const input = page.locator('textarea:visible').last();
    await input.fill(steps[step]);
    await page.getByRole('button', { name: 'Submit & Continue' }).click();
    if (step < 5) {
      await page.waitForFunction((submitted) => {
        const current = [...document.querySelectorAll('textarea')].find((node) => node.offsetParent !== null);
        return current?.value !== submitted;
      }, steps[step]);
    }
  }

  await page.getByText('브리핑 종료 및 포맷팅 (Phase 6)').waitFor({ timeout: 30000 });
  await page.getByRole('heading', { name: '외부 AI 완성 HTML 생성', exact: true }).waitFor({ timeout: 30000 });
  await page.getByText('JSON이 아닙니다. 외부 AI는 승인 양식의 완성 HTML을 반환합니다.', { exact: true }).waitFor();
  const workflowSteps = await page.locator('#phase6-approved-html-workflow li').allTextContents();
  assert.equal(workflowSteps.length, 5);
  for (const copy of ['완성 HTML 프롬프트 다운로드', '외부 AI에 첨부', 'HTML 전체 복사', 'HTML 붙여넣기', '48페이지 보고서 열기']) {
    assert.ok(workflowSteps.some((step) => step.includes(copy)), `Missing workflow step: ${copy}`);
  }

  const downloadPromise = page.waitForEvent('download', { timeout: 60000 });
  await page.getByRole('button', { name: '완성 HTML 프롬프트 다운로드' }).click();
  const download = await downloadPromise;
  const promptPath = path.join(artifactDir, 'approved-html-prompt.txt');
  await download.saveAs(promptPath);
  const prompt = await readFile(promptPath, 'utf8');
  assert.match(prompt, /Return one complete standalone HTML report, not JSON/);
  assert.match(prompt, /Main Deck: exactly 40 pages/);
  assert.match(prompt, /Appendix: exactly 8 pages/);
  assert.match(prompt, /\[SEMANTIC HTML FIELD CONTRACT\]/);
  assert.match(prompt, /P27 must keep A → I → P1 → P2 → L/);
  assert.doesNotMatch(prompt, /ProductionReportV3 JSON/);

  const baseHtml = extractBase(prompt);
  const externalHtml = await buildExternalHtml(context, baseHtml);
  await writeFile(path.join(artifactDir, 'external-ai-complete-report.html'), externalHtml);
  assert.match(externalHtml, /<script>/);
  assert.match(externalHtml, /scale\(0\.82\)/);
  assert.doesNotMatch(externalHtml, /\[\[FIELD:/);

  const htmlInput = page.locator('textarea[data-phase6-input-mode="approved-html"]');
  const renderButton = page.getByRole('button', { name: 'HTML 검증 후 48페이지 보고서 열기' });

  const beforeJson = dialogs.length;
  await htmlInput.fill('{"version":"3.0.0","pages":[]}');
  await renderButton.click();
  await page.waitForTimeout(300);
  assert.ok(dialogs.slice(beforeJson).some((message) => message.includes('JSON 결과를 붙여넣으셨습니다')));
  assert.equal(await page.locator('#fullscreen-viewer-iframe').count(), 0);

  const invalidAxisHtml = externalHtml.replace('>일회성 문제 해결<', '>X축<');
  const beforeAxis = dialogs.length;
  await htmlInput.fill(invalidAxisHtml);
  await renderButton.click();
  await page.waitForTimeout(500);
  assert.ok(dialogs.slice(beforeAxis).some((message) => message.includes('P18 Positioning 축')));
  assert.equal(await page.locator('#fullscreen-viewer-iframe').count(), 0);

  const fileInput = page.locator('input[data-phase6-html-file]');
  await fileInput.setInputFiles({
    name: 'external-ai-response.html',
    mimeType: 'text/html',
    buffer: Buffer.from(externalHtml),
  });
  assert.match(await htmlInput.inputValue(), /<!DOCTYPE html>/i);
  await renderButton.click();

  await page.locator('#fullscreen-viewer-iframe').waitFor({ timeout: 60000 });
  const frame = page.frameLocator('#fullscreen-viewer-iframe');
  await frame.locator('.full-slide').first().waitFor({ timeout: 60000 });

  assert.equal(await frame.locator('.full-slide').count(), 48);
  assert.equal(await frame.locator('.full-slide[data-zone="main"]').count(), 40);
  assert.equal(await frame.locator('.full-slide[data-zone="appendix"]').count(), 8);
  assert.equal(await frame.locator('.full-nav a').count(), 48);
  assert.equal(await frame.locator('script,noscript,iframe,object,embed').count(), 0);
  assert.equal(await frame.locator('[onclick],[onload],[onerror]').count(), 0);

  const orderedIds = await frame.locator('.full-slide').evaluateAll((slides) => slides.map((slide) => slide.id));
  assert.deepEqual(orderedIds.slice(10, 18), ['comp-landscape', 'comp-ranking', 'deep-dive-1', 'deep-dive-2', 'deep-dive-3', 'product-matrix', 'category-cliche', 'positioning']);
  assert.deepEqual(orderedIds.slice(28, 35), ['creative-method', 'creative-history-target', 'creative-history-1', 'creative-history-2', 'creative-history-3', 'creative-trajectory', 'creative-insight']);
  assert.deepEqual(orderedIds.slice(40), ['appendix-receipt', 'appendix-negative', 'appendix-premortem', 'appendix-roadmap', 'appendix-measure', 'appendix-evidence', 'appendix-sources', 'appendix-back']);

  assert.deepEqual(await frame.locator('#category-target .target-tension > b').allTextContents(), ['WANT', 'AVOID']);
  assert.deepEqual(await frame.locator('#comp-ranking .ranking-interpretation > div > b').allTextContents(), core);
  assert.deepEqual(await frame.locator('#deep-dive-1 .deep-node > small').allTextContents(), ['Evidence', 'Core Desire', 'Appeal', 'Threat Mechanism', 'Attack Point']);
  assert.equal(await frame.locator('#category-cliche .cliche-head > *').count(), 3);
  assert.equal(await frame.locator('#category-cliche .cliche-row > strong').count(), 0);
  assert.deepEqual(await frame.locator('#positioning .axis').allTextContents(), ['일회성 문제 해결', '지속적 운영 관리', '전문가 검증 중심', '사용자 직접 통제']);
  assert.deepEqual(await frame.locator('#aipl .aipl-stage > b').allTextContents(), ['A', 'I', 'P1', 'P2', 'L']);
  assert.deepEqual(await frame.locator('#pain-needs .pain-head > *').allTextContents(), ['Pain', '현재 문제', 'Unmet Need', '우선순위']);
  assert.deepEqual(await frame.locator('#persona-1 .persona-label').allTextContents(), ['상황', '핵심 Job']);
  assert.deepEqual(await frame.locator('#persona-1 .identity-shift span').allTextContents(), ['현재 정체성', '원하는 정체성']);
  assert.equal((await frame.locator('#persona-1 .brand-role > span').textContent()).trim(), `${brand}의 역할`);
  assert.deepEqual(await frame.locator('#creative-history-target .history-card > h3').allTextContents(), ['2021', '2022', '2023', '2024', '2025', '2026 YTD']);
  assert.deepEqual(await frame.locator('#stp .stp-arrow').allTextContents(), ['→', '→']);
  assert.equal((await frame.locator('#appendix-back .back-cover-copy > h1').textContent()).replace(/\s+/g, ' ').trim(), '맡겨도 판단의 근거와 결정권은 고객에게 남습니다');

  const geometry = await frame.locator('.full-slide').evaluateAll((slides) => slides.map((slide) => ({
    id: slide.id,
    width: slide.offsetWidth,
    height: slide.offsetHeight,
    overflowX: slide.scrollWidth - slide.clientWidth,
    overflowY: slide.scrollHeight - slide.clientHeight,
    frameWidth: slide.closest('.full-frame')?.style.width,
    frameHeight: slide.closest('.full-frame')?.style.height,
    scale: slide.closest('.full-frame-inner')?.style.transform,
  })));
  assert.ok(geometry.every((item) => item.width === 1280 && item.height === 720));
  assert.ok(geometry.every((item) => item.frameWidth === '1280px' && item.frameHeight === '720px' && item.scale === 'scale(1)'));
  assert.deepEqual(geometry.filter((item) => item.overflowX > 1 || item.overflowY > 1), []);

  const readability = await frame.locator('#category-target .target-tension p').first().evaluate((node) => Number.parseFloat(getComputedStyle(node).fontSize));
  const personaFont = await frame.locator('#persona-1 .persona-left li').first().evaluate((node) => Number.parseFloat(getComputedStyle(node).fontSize));
  assert.ok(readability >= 13, `P5 text remains too small: ${readability}px`);
  assert.ok(personaFont >= 12, `Persona text remains too small: ${personaFont}px`);

  for (const id of ['category-target', 'comp-ranking', 'deep-dive-1', 'category-cliche', 'positioning', 'consumer-exec', 'consumer-trends', 'consumer-target', 'persona-1', 'pain-needs', 'aipl', 'loyalty', 'creative-history-target', 'creative-trajectory', 'creative-insight', 'root-cause', 'stp', 'strategy-routes', 'strategy-choice', 'appendix-back']) {
    await frame.locator(`#${id}`).screenshot({ path: path.join(artifactDir, `approved-${id}.png`) });
  }

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

  const printable = await page.evaluate(() => `<!DOCTYPE html>\n${document.getElementById('fullscreen-viewer-iframe').contentDocument.documentElement.outerHTML}`);
  const printPage = await context.newPage();
  await printPage.setContent(printable, { waitUntil: 'networkidle' });
  await printPage.emulateMedia({ media: 'print' });
  const pdfPath = path.join(artifactDir, 'approved-semantic-report.pdf');
  await printPage.pdf({ path: pdfPath, printBackground: true, preferCSSPageSize: true });
  await printPage.close();
  const pdfInfo = command('pdfinfo', [pdfPath]);
  assert.match(pdfInfo, /Pages:\s+48\b/);
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
  assert.equal(await reopened.locator('.full-slide').count(), 48);
  assert.equal(await reopened.locator('.full-slide[data-zone="appendix"]').count(), 8);

  const summary = {
    appUrl,
    brand,
    core,
    workflow: 'approved complete HTML',
    jsonBlocked: true,
    invalidAxisBlocked: true,
    activeContentRemoved: true,
    leakedScaleRepaired: true,
    pages: 48,
    main: 40,
    appendix: 8,
    exports: 4,
    pdf: { pages: 48, size: '960x540pt' },
    reopened: 48,
    dialogs,
  };
  await writeFile(path.join(artifactDir, 'approved-html-semantic-summary.json'), JSON.stringify(summary, null, 2));
  await writeFile(path.join(artifactDir, 'pdffonts-approved.txt'), fonts);
  await writeFile(path.join(artifactDir, 'pdfimages-approved.txt'), images);
  console.log(JSON.stringify(summary, null, 2));
} catch (error) {
  await page.screenshot({ path: path.join(artifactDir, 'approved-html-semantic-failure.png'), fullPage: true }).catch(() => undefined);
  await writeFile(path.join(artifactDir, 'approved-html-semantic-failure.txt'), `${error instanceof Error ? error.stack || error.message : String(error)}\n\nDialogs:\n${JSON.stringify(dialogs, null, 2)}\n`);
  throw error;
} finally {
  await browser.close();
}
