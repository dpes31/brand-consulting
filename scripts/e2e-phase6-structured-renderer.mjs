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
const artifactDir = path.resolve('phase6-v2-e2e-artifacts');
await mkdir(artifactDir, { recursive: true });

const steps = buildPhase6StepFixtures(brand);
steps[0] += '\n핵심 사실은 **123만 명**과 **456억 원**이다.';
steps[2] += `\n${candidates.map((name, index) => `${index + 1}. **${name} — ${91 - index * 8}점:** 직접 경쟁 후보`).join('\n')}`;

function section(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start + startMarker.length);
  assert.ok(start >= 0 && end > start, `${startMarker} section is missing`);
  return source.slice(start + startMarker.length, end).trim();
}

function fieldValue(definition, variant = 1) {
  const { key, hint, maxLength, kind } = definition;
  const suffix = variant === 1 ? '' : ' 재검증';
  const specific = {
    'cover.headline': `${brand}은 복잡한 판단을 보이게 한다`,
    'cover.subtitle': `${brand}의 현재 조사 결과를 고정 40페이지 구조로 정리한 전략 보고서다`,
    'category-target.want': '사업에 집중하면서 세금 판단을 이해하고 통제한다',
    'category-target.avoid': '정보와 결정권을 잃은 채 결과만 전달받는 상태를 피한다',
    'comp-landscape.categoryJob': '복잡한 업무에서 손실과 오류를 줄이는 신뢰 가능한 판단을 제공한다',
    'product-matrix.column1.name': brand,
    'positioning.axis.xLeft': '일회성 문제 해결',
    'positioning.axis.xRight': '지속 관계 관리',
    'positioning.axis.yTop': '전문가 검증·대행',
    'positioning.axis.yBottom': '사용자 셀프서비스',
    'positioning.targetAsIs': `${brand} AS-IS`,
    'positioning.targetToBe': `${brand} TO-BE 사전 예방`,
    'consumer-target.target1.name': '불안한 성장 사업자',
    'consumer-target.target2.name': '비용 방어형',
    'consumer-target.target3.name': '사후불안형 위임 대표',
    'persona-1.title': '불안한 성장 사업자',
    'persona-2.title': '비용 방어형',
    'persona-3.title': '사후불안형 위임 대표',
    'stp.positioning': '성장 과정의 판단 근거와 책임을 보이게 하는 운영 파트너이다',
    'strategy-choice.bigIdeal': '모든 사업자는 중요한 판단을 이해하고 통제할 권리가 있다',
    'strategy-choice.winningMove': '판단 근거를 남기는 운영 설명서',
    'strategy-choice.proof': '적용·제외·검토·위험·책임을 하나의 기록으로 연결한다',
    'decision-close.principle': '맡겨도 결정의 근거와 통제권은 고객에게 남는다',
    'decision-close.support': `${brand}은 결과와 함께 판단의 이유를 설명한다`,
    'creative-history-target.title': `${brand} Creative History`,
    'creative-trajectory.brand1.name': brand,
  };
  if (specific[key]) return specific[key];

  for (let index = 0; index < candidates.length; index += 1) {
    if (key === `comp-landscape.candidate${index + 1}.name`) return candidates[index];
  }
  for (let index = 0; index < core.length; index += 1) {
    const rank = index + 1;
    if (key === `comp-ranking.rank${rank}.name` || key === `comp-ranking.rank${rank}.summaryName`) return core[index];
    if (key === `product-matrix.column${rank + 1}.name`) return core[index];
    if (key === `positioning.competitor${rank}.name`) return core[index];
    if (key === `deep-dive-${rank}.title`) return `${core[index]}은 선택 메커니즘으로 직접 위협한다`;
    if (key === `creative-history-${rank}.title`) return `${core[index]} Creative History`;
    if (key === `creative-trajectory.brand${rank + 1}.name`) return core[index];
    if (key === `deep-dive-${rank}.score`) return String(91 - index * 8);
  }

  if (kind === 'status') return 'not-found';
  if (kind === 'source') return 'QA Fixture · Phase 6 · 2026';
  if (/\.copy$/.test(key)) return `공개 원문 확인이 필요한 근거 상태다${suffix}`.slice(0, maxLength);
  if (/\.(penetration|growth|preference|campaign|inflection|evidence|total)$/.test(key)) return '4';
  if (/\.(differentiation|expansion|execution)$/.test(key)) return '4/5';
  if (/\.priority$/.test(key)) return 'HIGH';
  if (/\.period$/.test(key)) return '2026';
  if (/\.stage$/.test(key)) return '핵심';
  if (/\.type$/.test(key)) return '전략';
  if (/\.title$/.test(key)) return `${hint.replace(/\d+/g, '').trim()}의 핵심 판단이다${suffix}`.slice(0, maxLength);
  if (/\.soWhat$/.test(key)) return `현재 조사 결과는 다음 실행을 요구한다${suffix}`.slice(0, maxLength);
  if (maxLength <= 10) return '4';
  if (maxLength <= 24) return '핵심';
  if (maxLength <= 45) return `검증 근거${suffix}`.slice(0, maxLength);
  if (maxLength <= 80) return `현재 조사에서 확인된 핵심 판단이다${suffix}`.slice(0, maxLength);
  return `현재 조사에서 확인된 근거를 이 의미 필드에만 정확히 반영한다${suffix}`.slice(0, maxLength);
}

function buildResponse(prompt, variant = 1, prefixStatusWithYear = false) {
  const schema = JSON.parse(section(prompt, '[FIELD SCHEMA]', '[EMPTY JSON SKELETON]'));
  const report = JSON.parse(section(prompt, '[EMPTY JSON SKELETON]', '[STEP 0–5 RESEARCH]'));
  const definitions = new Map();
  schema.forEach((page) => page.fields.forEach((field) => definitions.set(field.key, field)));
  report.generatedAt = variant === 1 ? '2026-07-09T00:00:00.000Z' : '2026-07-09T00:01:00.000Z';
  report.pages.forEach((page) => {
    Object.keys(page.fields).forEach((key) => {
      const definition = definitions.get(key);
      assert.ok(definition, `Missing definition for ${key}`);
      const value = fieldValue(definition, variant);
      page.fields[key] = prefixStatusWithYear && definition.kind === 'status'
        ? `${definition.fixedYear} · ${value}`
        : value;
    });
  });
  return report;
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
  await page.getByText('외부 AI 구조화 JSON 방식', { exact: true }).waitFor({ timeout: 30000 });
  await page.getByText('HTML은 외부 AI가 아니라 앱이 자동 생성합니다.', { exact: true }).waitFor();
  for (const label of [
    '외부 AI용 JSON 프롬프트 다운로드',
    '다운로드 파일을 외부 AI에 첨부',
    'AI가 반환한 JSON 전체 복사',
    'Phase 6 입력창에 JSON 붙여넣기',
    'JSON 검증 후 40페이지 보고서 만들기',
  ]) {
    assert.ok(await page.getByText(label, { exact: true }).count() > 0, `Missing workflow label: ${label}`);
  }
  assert.ok(await page.getByText('기존 완성 HTML 가져오기 — 호환용', { exact: true }).count() > 0);

  const downloadPromise = page.waitForEvent('download', { timeout: 60000 });
  await page.getByRole('button', { name: /외부 AI용 JSON 프롬프트 다운로드/ }).click();
  const download = await downloadPromise;
  const promptPath = path.join(artifactDir, 'phase6-structured-prompt.txt');
  await download.saveAs(promptPath);
  const prompt = await readFile(promptPath, 'utf8');
  assert.match(prompt, /Return JSON only\. Never return HTML/);
  assert.match(prompt, /"version": "3\.0\.0"/);
  assert.match(prompt, /P27 keeps A→I→P1→P2→L/);
  assert.match(prompt, /\[CREATIVE HISTORY DATA CONTRACT\]/);
  assert.doesNotMatch(prompt, /IMMUTABLE APPROVED BASE HTML/);
  assert.doesNotMatch(prompt, /\.timeline-container|\.timeline-card|data-year|data-copy-status/);

  const fieldSchema = JSON.parse(section(prompt, '[FIELD SCHEMA]', '[EMPTY JSON SKELETON]'));
  const statusDefinitions = fieldSchema.flatMap((pageItem) => pageItem.fields).filter((field) => field.kind === 'status');
  assert.equal(statusDefinitions.length, 24);
  assert.ok(statusDefinitions.every((field) => JSON.stringify(field.enum) === JSON.stringify([
    'verified-verbatim',
    'source-found-copy-unverified',
    'not-found',
  ])));
  assert.deepEqual(statusDefinitions.slice(0, 6).map((field) => field.fixedYear), [2021, 2022, 2023, 2024, 2025, '2026 YTD']);

  const response1 = buildResponse(prompt, 1, true);
  const response2 = buildResponse(prompt, 2);
  await writeFile(path.join(artifactDir, 'external-ai-response-1.json'), JSON.stringify(response1, null, 2));
  await writeFile(path.join(artifactDir, 'external-ai-response-2.json'), JSON.stringify(response2, null, 2));

  const input = page.locator('textarea[data-phase6-input-mode="structured-json"]');
  const fileInput = page.locator('input[data-phase6-response-file]');
  const invalid = JSON.parse(JSON.stringify(response2));
  invalid.pages.find((item) => item.id === 'creative-history-target').fields['creative-history-target.year2.status'] = '2022 · unknown';
  await input.fill(JSON.stringify(invalid));
  await page.getByRole('button', { name: 'JSON 검증 후 40페이지 보고서 만들기' }).click();
  await page.waitForTimeout(1000);
  assert.ok(dialogs.some((message) => message.includes('P29')
    && message.includes('2022 상태')
    && message.includes('2022 · unknown')
    && message.includes('자동 복구할 수 없어 렌더링을 중단했습니다.')));

  const fencedResponse = `\`\`\`json\n${JSON.stringify(response1)}\n\`\`\``;
  await fileInput.setInputFiles({
    name: 'external-ai-response.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from(fencedResponse),
  });
  assert.equal(await input.inputValue(), fencedResponse);
  await page.getByRole('button', { name: 'JSON 검증 후 40페이지 보고서 만들기' }).click();
  await page.locator('#fullscreen-viewer-iframe').waitFor({ timeout: 60000 });
  const frame = page.frameLocator('#fullscreen-viewer-iframe');
  await frame.locator('.full-slide').first().waitFor({ timeout: 60000 });

  assert.ok(dialogs.some((message) => message.includes('Creative History 입력 형식 24건')
    && message.includes('자동 정규화했습니다.')));
  assert.equal(await frame.locator('.full-slide').count(), 40);
  assert.equal(await frame.locator('.full-nav a').count(), 40);
  assert.equal(await frame.locator('[data-zone="appendix"]').count(), 0);
  assert.equal(await frame.locator('script').count(), 0);
  assert.deepEqual(await frame.locator('#creative-history-target .history-card h3').allTextContents(), ['2021', '2022', '2023', '2024', '2025', '2026 YTD']);
  assert.equal(await frame.locator('#category-target .target-tension > b').allTextContents().then((items) => items.join('|')), 'WANT|AVOID');
  assert.deepEqual(await frame.locator('#comp-ranking .ranking-interpretation > div > b').allTextContents(), core);
  for (let index = 0; index < 3; index += 1) {
    assert.deepEqual(await frame.locator(`#deep-dive-${index + 1} .deep-node > small`).allTextContents(), ['Evidence', 'Core Desire', 'Appeal', 'Threat Mechanism', 'Attack Point']);
    assert.equal((await frame.locator(`#deep-dive-${index + 1} .deep-dive-score > small`).textContent()).trim(), `위협 ${index + 1}순위`);
  }
  assert.deepEqual(await frame.locator('#category-cliche .cliche-head > *').allTextContents(), ['반복 화법', '현재 역할', '구조적 한계']);
  assert.equal(await frame.locator('#category-cliche .cliche-row > strong').count(), 0);
  assert.deepEqual(await frame.locator('#positioning .axis').allTextContents(), ['일회성 문제 해결', '지속 관계 관리', '전문가 검증·대행', '사용자 셀프서비스']);
  assert.equal(await frame.locator('#consumer-exec .consumer-question-shift > div').count(), 3);
  assert.equal(await frame.locator('#consumer-trends .trend-row').count(), 5);
  assert.deepEqual(await frame.locator('#persona-1 .persona-label').allTextContents(), ['SITUATION', 'REAL JTBD']);
  assert.deepEqual(await frame.locator('#pain-needs .pain-head > *').allTextContents(), ['Pain', '현재 문제', 'Unmet Need', '우선순위']);
  assert.deepEqual(await frame.locator('#aipl .aipl-stage > b').allTextContents(), ['A', 'I', 'P1', 'P2', 'L']);
  assert.deepEqual(await frame.locator('#stp .stp-arrow').allTextContents(), ['→', '→']);
  assert.notEqual((await frame.locator('#stp .stp-position > strong').textContent()).trim(), '→');
  assert.deepEqual((await frame.locator('#strategy-routes .route-row > b').allTextContents()).map((item) => item.trim().charAt(0)), ['A', 'B', 'C', 'D']);
  assert.equal((await frame.locator('#decision-close .back-cover-copy > h1').textContent()).trim(), '맡겨도 결정의 근거와 통제권은 고객에게 남는다');

  const geometry = await frame.locator('.full-slide').evaluateAll((nodes) => nodes.map((node) => ({
    id: node.id,
    width: node.offsetWidth,
    height: node.offsetHeight,
    overflowX: node.scrollWidth - node.clientWidth,
    overflowY: node.scrollHeight - node.clientHeight,
    frameWidth: node.closest('.full-frame')?.style.width,
    frameHeight: node.closest('.full-frame')?.style.height,
    scale: node.closest('.full-frame-inner')?.style.transform,
  })));
  assert.ok(geometry.every((item) => item.width === 1280 && item.height === 720));
  assert.ok(geometry.every((item) => item.frameWidth === '1280px' && item.frameHeight === '720px' && item.scale === 'scale(1)'));
  assert.deepEqual(geometry.filter((item) => item.overflowX > 1 || item.overflowY > 1), []);

  for (const id of ['category-target', 'comp-ranking', 'deep-dive-1', 'category-cliche', 'positioning', 'consumer-exec', 'consumer-trends', 'consumer-target', 'persona-1', 'pain-needs', 'aipl', 'loyalty', 'creative-history-1', 'creative-trajectory', 'creative-insight', 'root-cause', 'stp', 'strategy-routes', 'strategy-choice', 'decision-close']) {
    await frame.locator(`#${id}`).screenshot({ path: path.join(artifactDir, `screen-${id}.png`) });
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

  const transformed = await page.evaluate(() => `<!DOCTYPE html>\n${document.getElementById('fullscreen-viewer-iframe').contentDocument.documentElement.outerHTML}`);
  const printPage = await context.newPage();
  await printPage.setContent(transformed, { waitUntil: 'networkidle' });
  await printPage.emulateMedia({ media: 'print' });
  const pdfPath = path.join(artifactDir, 'structured-report-native-print.pdf');
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
  assert.equal(await reopened.locator('body').getAttribute('data-content-contract'), 'structured-report-v3');

  const summary = {
    appUrl,
    brand,
    candidates,
    core,
    promptContract: 'ProductionReportV3 JSON',
    externalResponsesValidated: 2,
    malformedStatusBlocked: true,
    normalizedStatusCount: 24,
    pages: 40,
    nav: 40,
    geometry,
    pdf: { pages: 40, size: '960x540pt' },
    exports: 4,
    reopened: 40,
    dialogs,
  };
  await writeFile(path.join(artifactDir, 'structured-e2e-summary.json'), JSON.stringify(summary, null, 2));
  await writeFile(path.join(artifactDir, 'pdffonts.txt'), fonts);
  await writeFile(path.join(artifactDir, 'pdfimages.txt'), images);
  console.log(JSON.stringify(summary, null, 2));
} catch (error) {
  await page.screenshot({ path: path.join(artifactDir, 'structured-failure.png'), fullPage: true }).catch(() => undefined);
  await writeFile(path.join(artifactDir, 'structured-failure.txt'), `${error instanceof Error ? error.stack || error.message : String(error)}\n\nDialogs:\n${JSON.stringify(dialogs, null, 2)}\n`);
  throw error;
} finally {
  await browser.close();
}
