import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const read = (path) => readFileSync(resolve(process.cwd(), path), 'utf8');
const gitBlobSha = (content) => createHash('sha1').update(`blob ${Buffer.byteLength(content)}\0`).update(content).digest('hex');

const runtime = read('src/lib/installFullReportRuntimeCompatibility.ts');
const pdfBridge = read('src/lib/installFullReportPdfButtonBridge.ts');
const compiler = read('src/report/fullReportCompilerV3.ts');
const semanticHtml = read('src/report/semanticHtmlReportV5.ts');
const semanticRenderer = read('src/report/semanticReportV4.ts');
const definitionPolicy = read('src/report/structuredDefinitionPolicy.ts');
const domSafety = read('src/report/reportDomSafety.ts');
const pagePlan = read('src/lib/installPhase6PagePlanV2.ts');
const apiCompiler = read('src/lib/geminiCompiler.ts');
const bridge = read('src/lib/installFullReportPhase6Bridge.ts');
const normalizer = read('src/report/normalizeApprovedFullReportHtml.ts');
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

assert.match(compiler, /const PAGE_COUNT = 40/);
assert.match(compiler, /11 Competitive Landscape/);
assert.match(compiler, /17 Category Clichés/);
assert.match(compiler, /34 Creative Insight/);
assert.match(compiler, /40 Decision Receipt \/ Close/);
assert.match(compiler, /loadApprovedPilotBaseHtml/);

assert.match(semanticHtml, /createSemanticHtmlTemplateV5/);
assert.match(semanticHtml, /buildSemanticHtmlPromptV5/);
assert.match(semanticHtml, /compileSemanticHtmlReportV5/);
assert.match(semanticHtml, /Return one complete standalone HTML document, not JSON/);
assert.match(semanticHtml, /\[STEP 0–5 RESEARCH — SOURCE OF TRUTH\]/);
assert.match(semanticHtml, /\[IMMUTABLE 40-PAGE SEMANTIC HTML TEMPLATE — START\]/);
assert.match(semanticHtml, /sanitizeCompatibleFullReportHtml/);
assert.match(semanticHtml, /computeReportDomFingerprint/);
assert.match(semanticHtml, /validateStructuredReportCrossPage/);
assert.match(semanticHtml, /formatBlockingValidationError/);
assert.match(semanticHtml, /validatePersonaTargetConflicts/);
assert.match(semanticHtml, /RECOVERABLE_RICH_TAGS/);
assert.match(semanticHtml, /map-arrow-vector/);
assert.match(semanticHtml, /TARGET BRAND HISTORY/);
assert.match(semanticHtml, /renderSemanticReportV4/);
assert.match(semanticHtml, /semantic-html-v5/);
assert.doesNotMatch(semanticHtml, /Return JSON only/);
assert.doesNotMatch(semanticHtml, /CONTENT:P\d/);
assert.match(semanticRenderer, /isNonBlockingAiCopyStyleError/);
assert.match(semanticRenderer, /validateSemanticRecords/);

assert.match(definitionPolicy, /GENERIC_ORDER_FIELD/);
assert.match(definitionPolicy, /jtbd\.row/);
assert.match(domSafety, /FULL_REPORT_PAGE_COUNT = 40/);
assert.match(domSafety, /querySelectorAll\('script,noscript,base'\)/);
assert.match(domSafety, /computeReportDomFingerprint/);

for (const source of [apiCompiler, bridge]) {
  assert.match(source, /loadApprovedPilotBaseHtml/);
  assert.match(source, /createSemanticHtmlTemplateV5/);
  assert.match(source, /buildSemanticHtmlPromptV5/);
  assert.match(source, /compileSemanticHtmlReportV5/);
  assert.doesNotMatch(source, /createSemanticHtmlWorkbookV6/);
  assert.doesNotMatch(source, /createResearchOnlyLayoutTemplate/);
  assert.doesNotMatch(source, /addResearchSlotRules/);
  assert.doesNotMatch(source, /extractProductionReportJson/);
}
assert.match(bridge, /완성 HTML 프롬프트 다운로드/);
assert.match(bridge, /phase6_complete_html_prompt_/);
assert.match(bridge, /CSS·레이아웃·도식·내비게이션/);
assert.doesNotMatch(bridge, /phase6_lightweight_html_prompt_/);
assert.doesNotMatch(bridge, /structured-json/);

assert.match(normalizer, /FULL_REPORT_PAGE_COUNT = 40/);
assert.match(normalizer, /querySelectorAll<HTMLElement>\('\.full-slide'\)/);
assert.match(main, /installFullReportRuntimeCompatibility/);
assert.match(main, /installFullReportPhase6Bridge/);
assert.match(main, /installPhase6PagePlanV2/);
assert.equal(packageJson.scripts['test:full-report-runtime'], 'node scripts/test-full-report-runtime.mjs');
console.log('FULL report runtime compatibility passed for complete styled semantic HTML, aggregate real-output validation, 40 pages, and no Appendix.');
