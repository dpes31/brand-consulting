import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const previewUrl = process.env.PREVIEW_URL;
if (!previewUrl) throw new Error('PREVIEW_URL is required.');

const brand = '모노랩';
const artifactDir = path.resolve('phase6-v2-e2e-artifacts');
await mkdir(artifactDir, { recursive: true });

const source = [{ publisher: 'QA Fixture', title: 'Phase 6 V2 E2E', year: '2026' }];
const base = (page, recipe, title) => ({
  id: `qa-page-${String(page).padStart(2, '0')}`,
  page,
  zone: page <= 40 ? 'main' : 'appendix',
  chapter: page <= 8 ? '0. BRAND FACT BOOK' : page <= 10 ? 'I. MARKET' : page <= 18 ? 'II. COMPETITOR' : page <= 29 ? 'III. CONSUMER' : page <= 36 ? 'IV. CREATIVE' : page <= 40 ? 'V. STRATEGY' : 'APPENDIX',
  title,
  recipe,
  implication: page === 1 ? undefined : `QA 검증 결과, [[${title}의 의사결정 의미]]를 확인합니다.`,
  sources: source,
});

const structured = (page, title) => ({ ...base(page, 'structured-summary', title), sections: [
  { label: 'CONTEXT', headline: `${title}의 핵심 맥락`, bullets: ['검증 문장 1', '검증 문장 2', '한국어 줄바꿈과 정보 위계를 확인합니다.'] },
  { label: 'EVIDENCE', headline: '구조화된 근거', bullets: ['출처 근접성', '결론형 제목', '1280×720 밀도'] },
  { label: 'DECISION', headline: '실행 판단', bullets: ['So What 유지', '노란 형광펜 유지'] },
] });
const flow = (page, recipe, title) => ({ ...base(page, recipe, title), nodes: Array.from({ length: 5 }, (_, index) => ({ label: `STEP ${index + 1}`, headline: `${title} ${index + 1}`, detail: '원인과 결과를 한 단계씩 연결합니다.', tone: index === 3 ? 'risk' : index === 4 ? 'target' : 'neutral' })) });
const matrix = (page, recipe, title) => ({ ...base(page, recipe, title), columns: ['모노랩', '알파원', '베타랩'], rows: Array.from({ length: 5 }, (_, index) => ({ label: `비교축 ${index + 1}`, cells: ['강점', '보통', '차이'], emphasis: index === 1 })) });
const persona = (page, number) => ({ ...base(page, 'persona', `Persona ${number}`), persona: { number: `0${number}`, situation: ['업무가 복잡해졌습니다.', '정보는 많지만 판단이 어렵습니다.', '실패 비용을 줄이고 싶습니다.'], surfaceNeed: '쉽고 빠르게 결정하고 싶다', realJob: '근거를 이해하고 확신 있게 선택한다', fears: ['잘못된 선택', '숨은 비용', '책임 불명확'], currentIdentity: '정보에 끌려가는 사용자', desiredIdentity: '판단을 통제하는 사용자', brandRole: '복잡한 근거를 설명하고 최종 선택권을 남기는 파트너' } });
const creative = (page, historyBrand) => ({ ...base(page, 'creative-history', `${historyBrand} Creative History`), brand: historyBrand, years: ['2021','2022','2023','2024','2025','2026'].map((year, index) => ({ year, campaign: index === 5 ? '2026 YTD 신규 캠페인 공개 미확인' : `${year} QA 캠페인`, copy: index === 0 ? '“QA 검증 카피”' : '카피 원문 미확인', detail: '모델·매체·소구 전략의 배치와 가독성을 확인합니다.', status: index === 0 ? 'verified-verbatim' : index === 5 ? 'not-found' : 'source-found-copy-unverified', source: { publisher: 'QA Fixture', title: `${historyBrand} Creative History`, year } })), trajectory: '기능 설명에서 판단 근거와 브랜드 역할로 메시지가 확장됩니다.', strategicSoWhat: '카피보다 일관된 브랜드 행동과 증거 구조를 자산화해야 합니다.' });

const slides = [];
slides.push({ ...base(1, 'cover', `${brand} Strategic Consulting Report`), kicker: '2026 STRATEGIC REPORT', subtitle: 'Phase 6 Approved FULL Renderer E2E Fixture' });
slides.push(structured(2, 'Executive Summary'));
slides.push(structured(3, 'Brand Identity'));
slides.push({ ...base(4, 'metric-strip', 'KPI Snapshot'), metrics: Array.from({ length: 4 }, (_, index) => ({ label: `KPI ${index + 1}`, value: `${(index + 1) * 25}%`, period: '2026 QA', interpretation: '수치·기간·해석의 위계를 확인합니다.' })) });
slides.push(structured(5, 'Category & Core Target'));
slides.push({ ...base(6, 'milestone-timeline', 'Growth Story'), events: ['2021','2022','2023','2024','2025','2026'].map((period, index) => ({ period, title: `변곡점 ${index + 1}`, detail: '성장 사건과 전략적 의미를 시간 순서로 보여줍니다.', verified: true })) });
slides.push(flow(7, 'causal-flow', 'Core Inflection'));
slides.push(structured(8, 'Product USP & Brand Best Self'));
slides.push(structured(9, 'Market Context'));
slides.push(flow(10, 'causal-flow', 'Category Value Shift'));
slides.push(structured(11, 'Competitive Landscape'));
slides.push(matrix(12, 'rank-scorecard', 'Threat Ranking'));
slides.push(flow(13, 'causal-flow', 'Competitor Deep Dive 1'));
slides.push(flow(14, 'causal-flow', 'Competitor Deep Dive 2'));
slides.push(flow(15, 'causal-flow', 'Competitor Deep Dive 3'));
slides.push(matrix(16, 'feature-matrix', 'Product Matrix'));
slides.push(structured(17, 'Category Cliché'));
slides.push(flow(18, 'as-is-to-be', 'Positioning'));
slides.push(structured(19, 'Consumer Executive Conclusion'));
slides.push(structured(20, 'Consumer Trends'));
slides.push(structured(21, 'Core Target'));
slides.push(persona(22, 1));
slides.push(persona(23, 2));
slides.push(persona(24, 3));
slides.push(flow(25, 'as-is-to-be', 'Identity Alignment'));
slides.push(structured(26, 'JTBD'));
slides.push(structured(27, 'Pain Points & Unmet Needs'));
slides.push(flow(28, 'friction-flow', 'AIPL Bottleneck'));
slides.push(flow(29, 'causal-flow', 'Purchase to Loyalty'));
slides.push(structured(30, 'Creative Methodology'));
slides.push(creative(31, brand));
slides.push(creative(32, '알파원'));
slides.push(creative(33, '베타랩'));
slides.push(creative(34, '감마코'));
slides.push({ ...base(35, 'milestone-timeline', 'Message Trajectory'), events: ['2021','2022','2023','2024','2025','2026'].map((period, index) => ({ period, title: `메시지 ${index + 1}`, detail: '메시지 변화와 의미를 연결합니다.', verified: true })) });
slides.push(flow(36, 'causal-flow', 'Creative Insight'));
slides.push({ ...base(37, 'swot', 'SWOT'), strength: ['데이터 연결성', '설명 가능한 구조'], weakness: ['인지 편중', '증거 부족'], opportunity: ['시장 전환', '새로운 기준'], threat: ['무료화', '경쟁 심화'] });
slides.push(flow(38, 'root-cause-flow', 'GAP & Root Cause'));
slides.push({ ...base(39, 'stp-convergence', 'STP'), segments: [{ name: '핵심 사용자', description: '판단 책임이 커지는 고객', selected: true }, { name: '보조 사용자', description: '편의 중심 고객' }], target: { name: '불안한 성장 사용자', description: '복잡성은 증가하지만 내부 전문 인력은 부족합니다.' }, positioning: { statement: '설명 가능한 판단 플랫폼', proof: ['근거 표시', '선택권 보존', '책임 구조'] } });
slides.push({ ...base(40, 'choice-architecture', 'Strategic Directions & Final Choice'), options: [{ name: '기능', rationale: '편의 강화', score: '3/5' }, { name: '안심', rationale: '불안 완화', score: '4/5' }, { name: '통제', rationale: '판단권 강화', score: '5/5', selected: true }, { name: '확장', rationale: '플랫폼화', score: '4/5' }], finalChoice: { name: '설명 가능한 통제', statement: '맡겨도 알 권리는 남깁니다.', reasons: ['차별성', '병목 해결', '제품 연결'] } });
slides.push(structured(41, 'Winning Move Specification'));
slides.push(structured(42, 'Via Negativa'));
slides.push(structured(43, 'Pre-mortem'));
slides.push({ ...base(44, 'roadmap', 'Execution Roadmap'), items: Array.from({ length: 4 }, (_, index) => ({ label: `0${index + 1}`, headline: `실행 ${index + 1}`, detail: '단계별 실행과 승인 조건을 확인합니다.' })) });
slides.push(matrix(45, 'feature-matrix', 'Measurement Plan'));
slides.push({ ...base(46, 'evidence-gap', 'Evidence Gaps'), items: Array.from({ length: 4 }, (_, index) => ({ label: `GAP ${index + 1}`, headline: '추가 검증 필요', detail: '의사결정 전 채워야 할 데이터 공백입니다.', tone: 'risk' })) });
slides.push({ ...base(47, 'evidence-list', 'Source Labels'), items: Array.from({ length: 4 }, (_, index) => ({ label: `SOURCE ${index + 1}`, headline: 'QA Fixture', detail: '출처명·자료명·연도만 표시합니다.' })) });
slides.push(structured(48, 'Decision Receipt / Close'));

assert.equal(slides.length, 48);
const report = { version: '1.0.0', brand, generatedAt: '2026-07-06', mainSlides: slides.slice(0, 40), appendixSlides: slides.slice(40) };

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ acceptDownloads: true, viewport: { width: 1600, height: 1000 } });
await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: new URL(previewUrl).origin });
const page = await context.newPage();
const dialogs = [];
page.on('dialog', async (dialog) => { dialogs.push(dialog.message()); await dialog.accept(); });

await page.goto(previewUrl, { waitUntil: 'networkidle', timeout: 120000 });
await page.getByPlaceholder('Enter brand name for deep-dive analysis...').fill(brand);
await page.getByRole('button', { name: 'Start Engine' }).click();

const registry = `Step 2 경쟁사 분석 QA 결과입니다.\n<!-- COMPETITOR_REGISTRY_START -->\n${JSON.stringify({ version: 1, selectionPolicy: 'threat-ranked-direct-only', selected: [
  { rank: 1, name: '알파원', threatScore: 91, userSpecified: false, selectionReason: '시장 침투 위협', evidenceSignals: ['성장', '캠페인'] },
  { rank: 2, name: '베타랩', threatScore: 83, userSpecified: false, selectionReason: '플랫폼 위협', evidenceSignals: ['유통', '선호'] },
  { rank: 3, name: '감마코', threatScore: 76, userSpecified: false, selectionReason: '전문성 위협', evidenceSignals: ['제품', '신뢰'] },
], reviewedCandidates: [] }, null, 2)}\n<!-- COMPETITOR_REGISTRY_END -->`;
const stepText = [
  'Step 0 QA 조사 결과입니다. 브랜드 정체성, 핵심 수치, 성장 변곡점과 Product USP를 충분한 길이의 문장으로 기록해 Phase 6 입력 저장을 검증합니다.',
  'Step 1 QA 시장 조사 결과입니다. 시장 변화와 소비자 가치 이동, 정책 및 경제 요인을 결론형 문장과 근거 구조로 정리해 단계 저장을 검증합니다.',
  registry,
  'Step 3 QA 소비자 조사 결과입니다. Trends, Persona, Identity Alignment, JTBD, AIPL, Unmet Needs와 friction-flow 결론을 포함해 저장을 검증합니다.',
  'Step 4 QA Creative History 결과입니다. 조사 브랜드와 선정 경쟁사 각각 2021년부터 2026년까지 상태값, Message Trajectory, Strategic So What을 기록합니다.',
  'Step 5 QA 전략 결과입니다. SWOT, GAP, Root Cause, 네 전략 방향, Big IdeaL, Winning Move, Via Negativa, Pre-mortem과 실행 순서를 포함합니다.',
];

for (const text of stepText) {
  const textarea = page.locator('textarea:visible').last();
  await textarea.fill(text);
  await page.getByRole('button', { name: 'Submit & Continue' }).click();
}

await page.getByText('브리핑 종료 및 포맷팅 (Phase 6)').waitFor({ timeout: 30000 });
await page.screenshot({ path: path.join(artifactDir, '01-phase6-screen.png'), fullPage: true });

const promptDownloadPromise = page.waitForEvent('download', { timeout: 30000 });
await page.getByRole('button', { name: /프롬프트 추출/ }).click();
const promptDownload = await promptDownloadPromise;
const promptPath = path.join(artifactDir, 'phase6-prompt.txt');
await promptDownload.saveAs(promptPath);
const promptText = await readFile(promptPath, 'utf8');
assert.match(promptText, /Return JSON only/);
assert.match(promptText, /ProductionReportV1 JSON only/);
assert.doesNotMatch(promptText, /<!DOCTYPE html>/i);
assert.doesNotMatch(promptText, /slide-wrapper/);
assert.doesNotMatch(promptText, /Immutable Base HTML Code/);

const phase6Input = page.locator('textarea:visible').last();
await phase6Input.fill('<!DOCTYPE html><html><style>:root{--hds-brand-accent:#000}</style><body><div class="slide-wrapper"></div></body></html>');
await page.getByRole('button', { name: '결과물 뷰어에 렌더링하기' }).click();
await page.waitForTimeout(500);
assert.ok(dialogs.some((message) => message.includes('이전 HTML 생성 프롬프트로 만든 구형 HTML')));

await phase6Input.fill(`\`\`\`json\n${JSON.stringify(report)}\n\`\`\``);
await page.getByRole('button', { name: '결과물 뷰어에 렌더링하기' }).click();
await page.locator('#fullscreen-viewer-iframe').waitFor({ timeout: 60000 });
const frame = page.frameLocator('#fullscreen-viewer-iframe');
await frame.locator('.full-slide').first().waitFor({ timeout: 60000 });
assert.equal(await frame.locator('.full-slide').count(), 48);
assert.equal(await frame.locator('.nav-item').count(), 48);
assert.equal(await frame.locator('.persona-layout').count(), 3);
assert.equal(await frame.locator('.history-grid').count(), 4);
assert.ok((await frame.locator('.history-bottom').count()) >= 4);
assert.equal(await frame.locator('.swot-grid').count(), 1);
assert.equal(await frame.locator('.stp-layout').count(), 1);
assert.ok((await frame.locator('mark').count()) > 20);

const geometry = await frame.locator('.full-slide').evaluateAll((elements) => elements.map((element) => ({
  width: element.getBoundingClientRect().width,
  height: element.getBoundingClientRect().height,
  overflowX: element.scrollWidth - element.clientWidth,
  overflowY: element.scrollHeight - element.clientHeight,
})));
assert.ok(geometry.every((item) => Math.round(item.width) === 1280 && Math.round(item.height) === 720));
assert.ok(geometry.every((item) => item.overflowX <= 1 && item.overflowY <= 1));

await frame.locator('#qa-page-22').screenshot({ path: path.join(artifactDir, '02-persona.png') });
await frame.locator('#qa-page-31').screenshot({ path: path.join(artifactDir, '03-creative-history.png') });
await frame.locator('#qa-page-37').screenshot({ path: path.join(artifactDir, '04-swot.png') });
await frame.locator('#qa-page-39').screenshot({ path: path.join(artifactDir, '05-stp.png') });

await frame.locator('.nav-item').last().click();
await page.waitForTimeout(300);
assert.equal(await frame.locator('html').evaluate(() => location.hash), '#qa-page-48');

const exportButton = page.getByRole('button', { name: 'Export PDF' }).last();
const firstPdfPromise = page.waitForEvent('download', { timeout: 360000 });
await exportButton.click();
const firstPdf = await firstPdfPromise;
const firstPdfPath = path.join(artifactDir, 'mono-lab-report-1.pdf');
await firstPdf.saveAs(firstPdfPath);
const firstBytes = await readFile(firstPdfPath);
assert.equal((firstBytes.toString('latin1').match(/\/Type\s*\/Page\b/g) || []).length, 48);
assert.match(firstBytes.toString('latin1'), /\/MediaBox \[0 0 960 540\]/);

const secondPdfPromise = page.waitForEvent('download', { timeout: 120000 });
await exportButton.click();
const secondPdf = await secondPdfPromise;
const secondPdfPath = path.join(artifactDir, 'mono-lab-report-2.pdf');
await secondPdf.saveAs(secondPdfPath);
const secondBytes = await readFile(secondPdfPath);
assert.equal((secondBytes.toString('latin1').match(/\/Type\s*\/Page\b/g) || []).length, 48);

await page.waitForTimeout(1200);
await page.reload({ waitUntil: 'networkidle', timeout: 120000 });
await page.getByText(brand, { exact: true }).first().click();
await page.locator('#fullscreen-viewer-iframe').waitFor({ timeout: 60000 });
const reopened = page.frameLocator('#fullscreen-viewer-iframe');
await reopened.locator('.full-slide').first().waitFor({ timeout: 60000 });
assert.equal(await reopened.locator('.full-slide').count(), 48);
assert.equal(await reopened.locator('#qa-page-31 .history-bottom').count(), 1);

const summary = {
  previewUrl,
  brand,
  promptJsonOnly: true,
  legacyHtmlRejected: true,
  renderedPages: 48,
  navigationLinks: 48,
  personaPages: 3,
  creativeHistoryPages: 4,
  pdfExports: 2,
  pdfPageCount: 48,
  saveReopenPages: 48,
  geometry,
  dialogs,
};
await writeFile(path.join(artifactDir, 'e2e-summary.json'), JSON.stringify(summary, null, 2));
await browser.close();
console.log(JSON.stringify(summary, null, 2));
