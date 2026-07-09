import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const read = (path) => readFileSync(resolve(process.cwd(), path), 'utf8');
const gitBlobSha = (content) => createHash('sha1').update(`blob ${Buffer.byteLength(content)}\0`).update(content).digest('hex');

const runtime = read('src/lib/installFullReportRuntimeCompatibility.ts');
const pdfBridge = read('src/lib/installFullReportPdfButtonBridge.ts');
const compiler = read('src/report/fullReportCompiler.ts');
const safety = read('src/report/reportDomSafety.ts');
const structured = read('src/report/structuredReportV3.ts');
const productionContract = read('src/report/productionReportV3Contract.ts');
const pagePlan = read('src/lib/installPhase6PagePlanV2.ts');
const apiCompiler = read('src/lib/geminiCompiler.ts');
const bridge = read('src/lib/installFullReportPhase6Bridge.ts');
const workflowUx = read('src/lib/installPhase6ExternalJsonWorkflowUX.ts');
const inputGuard = read('src/lib/installPhase6InputGuard.ts');
const main = read('src/main.tsx');
const legacyTemplate = read('public/template.html');
const packageJson = JSON.parse(read('package.json'));

assert.equal(gitBlobSha(legacyTemplate), '22bc6937b3d672e063d4b240c5a39b9c61700fec');

assert.match(runtime, /FULL_REPORT_PAGE_COUNT = 40/);
assert.doesNotMatch(runtime, /MAIN_DECK_PAGE_COUNT/);
assert.match(runtime, /slide\.dataset\.zone !== 'main'/);
assert.match(runtime, /SLIDE_WIDTH_PX = 1280/);
assert.match(runtime, /SLIDE_HEIGHT_PX = 720/);
assert.match(runtime, /__FULL_REPORT_NATIVE_PRINT__/);
assert.match(runtime, /lastPdfExportMode = 'native-print'/);
assert.match(runtime, /40 pages passed preflight/);
assert.doesNotMatch(runtime, /await exportReportPdf/);
assert.match(pdfBridge, /FULL_PAGE_COUNT = 40/);
assert.match(pdfBridge, /fullSlideCount\(iframe\) === FULL_PAGE_COUNT/);
assert.match(pdfBridge, /exportFullReportPdf/);

assert.match(pagePlan, /focus3-main40-no-appendix-v3/);
for (const id of ['comp-landscape','comp-ranking','category-cliche','creative-insight','strategy-choice','decision-close']) {
  assert.match(pagePlan, new RegExp(id));
}
assert.doesNotMatch(pagePlan, /deep-dive-4|deep-dive-5|creative-history-4|creative-history-5/);
assert.match(pagePlan, /reportAppendixCount = '0'/);

assert.match(compiler, /canonicalizeReportDocument/);
assert.match(compiler, /structured-report-v3-template/);
assert.match(safety, /sanitizeCompatibleFullReportHtml/);
assert.match(safety, /computeReportDomFingerprint/);
assert.match(safety, /scale\(1\)/);
assert.match(structured, /STRUCTURED_REPORT_VERSION = '3\.0\.0'/);
assert.match(structured, /buildStructuredReportPrompt/);
assert.match(structured, /renderStructuredReportV3/);
assert.match(structured, /validateStructuredReportV3/);
assert.match(structured, /beforeFingerprint !== afterFingerprint/);

assert.match(productionContract, /buildProductionReportV3Prompt/);
assert.match(productionContract, /normalizeProductionReportV3/);
assert.match(productionContract, /renderProductionReportV3/);
assert.match(productionContract, /enum\?: string\[\]/);
assert.match(productionContract, /fixedYear\?: number \| '2026 YTD'/);
assert.match(productionContract, /자동 복구할 수 없어 렌더링을 중단했습니다/);

for (const source of [apiCompiler, bridge]) {
  assert.match(source, /loadApprovedPilotBaseHtml/);
  assert.match(source, /buildProductionReportV3Prompt/);
  assert.match(source, /normalizeProductionReportV3/);
  assert.match(source, /renderProductionReportV3/);
  assert.doesNotMatch(source, /createResearchOnlyLayoutTemplate/);
  assert.doesNotMatch(source, /buildFullReportHtmlPrompt/);
}
assert.match(bridge, /sanitizeCompatibleFullReportHtml/);
assert.match(bridge, /validateCompatibleStructure/);
assert.match(bridge, /compatibilityValidation = 'semantic-skeleton'/);
assert.match(bridge, /formatProductionReportV3Warnings/);
assert.match(workflowUx, /외부 AI 구조화 JSON 방식/);
assert.match(workflowUx, /기존 완성 HTML 가져오기 — 호환용/);
assert.match(inputGuard, /looksLikeStructuredJson/);
assert.match(main, /installFullReportRuntimeCompatibility/);
assert.match(main, /installFullReportPhase6Bridge/);
assert.match(main, /installPhase6ExternalJsonWorkflowUX/);
assert.match(main, /installPhase6PagePlanV2/);
assert.equal(packageJson.scripts['test:full-report-runtime'], 'node scripts/test-full-report-runtime.mjs');

console.log('FULL report runtime compatibility passed for the shared ProductionReportV3 40-page renderer.');
