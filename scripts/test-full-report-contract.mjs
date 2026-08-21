import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const check = (condition, message) => {
  if (!condition) throw new Error(`[FULL REPORT CONTRACT] ${message}`);
};
const blobSha = (content) => createHash('sha1')
  .update(`blob ${Buffer.byteLength(content)}\0`)
  .update(content)
  .digest('hex');

const legacy = read('public/template.html');
const css = read('public/full-report-v1.css');
const approvedCss = read('public/full-report-approved-v1.css');
const pilotCss = read('src/pages/BiznupFullIntegrated.css');
const compiler = read('src/report/fullReportCompilerV3.ts');
const semanticHtml = read('src/report/semanticHtmlReportV5.ts');
const semanticRenderer = read('src/report/semanticReportV4.ts');
const definitionPolicy = read('src/report/structuredDefinitionPolicy.ts');
const domSafety = read('src/report/reportDomSafety.ts');
const pagePlan = read('src/lib/installPhase6PagePlanV2.ts');
const cachePolicy = read('src/lib/installPhase6ApprovedBaseCachePolicy.ts');
const densityV2 = read('src/pages/full-report-density-v2-runtime.ts');
const visualV4 = read('src/pages/full-report-v4-runtime.ts');
const apiCompiler = read('src/lib/geminiCompiler.ts');
const bridge = read('src/lib/installFullReportPhase6Bridge.ts');
const runtime = read('src/lib/installFullReportRuntimeCompatibility.ts');
const pdfBridge = read('src/lib/installFullReportPdfButtonBridge.ts');
const main = read('src/main.tsx');

const jobDefinition = 'JOB : 고객이 특정 상황에서 달성하고 싶어 하는 근본적인 목표나 해결하고자 하는 일을 뜻함';

check(blobSha(legacy) === '22bc6937b3d672e063d4b240c5a39b9c61700fec', 'Legacy template changed.');
check(approvedCss.includes('/full-report-approved-v1/base.css'), 'Approved Pilot CSS missing.');
check(pilotCss.trim() === "@import url('/full-report-approved-v1.css');", 'Pilot CSS entrypoint changed.');
check(css.includes('--slide-w:1280px') && css.includes('--slide-h:720px'), '1280x720 lock missing.');

check(compiler.includes('const PAGE_COUNT = 40'), 'Compiler page count must be 40.');
check(compiler.includes('11 Competitive Landscape'), 'Landscape page missing.');
check(compiler.includes('17 Category Clichés'), 'Category Clichés page missing.');
check(compiler.includes('34 Creative Insight'), 'Creative Insight page missing.');
check(compiler.includes('40 Decision Receipt / Close'), 'Decision Close page missing.');
check(compiler.includes('loadApprovedPilotBaseHtml'), 'Approved 40-page base capture missing.');
check(compiler.includes("dataset.fullReportV4Ready === 'true'"), 'Approved base capture does not wait for V4 visual runtime.');

check(pagePlan.includes('focus3-main40-no-appendix-v3'), '40-page page-plan version missing.');
check(pagePlan.includes("'comp-landscape'"), 'Landscape not retained in page plan.');
check(pagePlan.includes("'category-cliche'"), 'Category Clichés not retained in page plan.');
check(pagePlan.includes("'creative-insight'"), 'Creative Insight not retained in page plan.');
check(pagePlan.includes("'decision-close'"), 'Decision Close not promoted to page 40.');
check(!pagePlan.includes("'creative-method'"), 'Creative Methodology remains in the output plan.');
check(pagePlan.includes("dataset.reportAppendixCount = '0'"), 'Appendix count must be zero.');
check(pagePlan.includes(jobDefinition), 'Required JOB definition note is missing.');
check(pagePlan.includes('job-definition-note--category'), 'P11 CATEGORY JOB note hook is missing.');
check(pagePlan.includes('job-definition-note--table'), 'P25 Job 층위 note hook is missing.');

check(cachePolicy.includes('brand-consulting:phase6-semantic-html-v5:'), 'V5 approved-base cache invalidation is missing.');
check(cachePolicy.includes('sessionStorage.removeItem'), 'Approved-base cache removal is missing.');
check(main.includes('installPhase6ApprovedBaseCachePolicy()'), 'Approved-base cache policy is not installed before Phase 6.');
check(!densityV2.includes("['#comp-landscape', '#consumer-exec'"), 'Density V2 still injects an obsolete P11 JTBD header note.');
check(!densityV2.includes('foundingJtbd.appendChild'), 'Density V2 still injects identity.content1.');
check(visualV4.includes("dataset.fullReportV4Ready = 'true'"), 'V4 runtime readiness marker is missing.');
check(!visualV4.includes("['#comp-landscape', '#consumer-exec'"), 'V4 still overwrites the P11/P25 JOB note.');
check(!visualV4.includes('<small>PRODUCT REALITY'), 'V4 inflection still creates ordinal small-note fields.');

check(semanticHtml.includes('Return one complete standalone HTML document, not JSON.'), 'Complete HTML output contract missing.');
check(semanticHtml.includes('[STEP 0–5 RESEARCH — SOURCE OF TRUTH]'), 'Step 0–5 research block missing.');
check(
  semanticHtml.indexOf('[STEP 0–5 RESEARCH — SOURCE OF TRUTH]')
    < semanticHtml.indexOf('[IMMUTABLE 40-PAGE SEMANTIC HTML TEMPLATE — START]'),
  'Step 0–5 research must appear before the large HTML template.',
);
check(semanticHtml.includes('[[FIELD:${key}]]'), 'Semantic field token generation missing.');
check(semanticHtml.includes('compileSemanticHtmlReportV5'), 'Semantic HTML compiler missing.');
check(semanticHtml.includes('sanitizeCompatibleFullReportHtml'), 'Active-content sanitizer missing.');
check(semanticHtml.includes('computeReportDomFingerprint'), 'Approved DOM fingerprint validation missing.');
check(semanticHtml.includes('renderSemanticReportV4'), 'Approved DOM reassembly missing.');
check(semanticHtml.includes("dataset.contentContract = 'semantic-html-v5'"), 'Semantic HTML output marker missing.');

check(semanticHtml.includes("RECOVERABLE_RICH_TAGS = new Set(['B', 'STRONG'])"), 'Safe b/strong rich-markup recovery missing.');
check(semanticHtml.includes("createElement('mark')"), 'Recovered emphasis is not converted to mark.');
check(semanticHtml.includes('formatBlockingValidationError'), 'Aggregate validation error reporting missing.');
check(semanticHtml.includes('validateStructuredReportCrossPage'), 'Cross-page validation is not aggregated.');
check(semanticHtml.includes('validatePersonaTargetConflicts'), 'Persona target-order conflict guard missing.');
check(semanticHtml.includes('TARGET BRAND HISTORY'), 'Target-brand Creative History breadcrumb correction missing.');
check(semanticHtml.includes('map-arrow-vector'), 'P18 coordinate-bound vector arrow missing.');
check(semanticHtml.includes("line.setAttribute('x1'"), 'P18 vector arrow is not bound to AS-IS coordinates.');
check(semanticHtml.includes("line.setAttribute('x2'"), 'P18 vector arrow is not bound to TO-BE coordinates.');
check(semanticHtml.includes('Titles may be conclusion-led'), 'Persona conclusion-led title contract missing.');
check(semanticHtml.includes('Never use <b>, <strong>, <span>, <em>'), 'External rich-tag prompt guard missing.');
check(semanticRenderer.includes('isNonBlockingAiCopyStyleError'), 'Semantic Renderer still re-blocks AI copy-style warnings.');
check(semanticRenderer.includes('validateSemanticRecords'), 'Semantic record validation must remain strict.');

check(definitionPolicy.includes('GENERIC_ORDER_FIELD'), 'Generic order field guard missing.');
check(definitionPolicy.includes('jtbd.row'), 'JTBD semantic role mapping missing.');
check(domSafety.includes("querySelectorAll('script,noscript,base')"), 'Script sanitizer missing.');
check(domSafety.includes('FULL_REPORT_PAGE_COUNT = 40'), 'DOM safety page count must be 40.');

for (const source of [apiCompiler, bridge]) {
  check(source.includes('loadApprovedPilotBaseHtml'), 'A Phase 6 path does not load the approved Pilot.');
  check(source.includes('createSemanticHtmlTemplateV5'), 'A Phase 6 path does not create the semantic HTML template.');
  check(source.includes('buildSemanticHtmlPromptV5'), 'A Phase 6 path does not use the complete HTML prompt.');
  check(source.includes('compileSemanticHtmlReportV5'), 'A Phase 6 path does not validate and compile returned HTML.');
  check(!source.includes('createSemanticHtmlWorkbookV6'), 'A Phase 6 path still uses the lightweight workbook.');
  check(!source.includes('createResearchOnlyLayoutTemplate'), 'A Phase 6 path still uses ordinal CONTENT SLOT generation.');
  check(!source.includes('addResearchSlotRules'), 'A Phase 6 path still uses ordinal slot prompt rules.');
  check(!source.includes('extractProductionReportJson'), 'A Phase 6 path exposes JSON as the external result.');
}

check(bridge.includes('완성 HTML 프롬프트 다운로드'), 'User-facing complete HTML action missing.');
check(bridge.includes('phase6_complete_html_prompt_'), 'Complete HTML prompt filename missing.');
check(bridge.includes('CSS·레이아웃·도식·내비게이션'), 'Full visual artifact guidance missing.');
check(!bridge.includes('phase6_lightweight_html_prompt_'), 'Lightweight prompt filename remains active.');
check(!bridge.includes('structured-json'), 'JSON input mode remains in the user workflow.');

check(runtime.includes('FULL_REPORT_PAGE_COUNT = 40'), 'Native PDF preflight must use 40 pages.');
check(pdfBridge.includes('FULL_PAGE_COUNT = 40'), 'PDF button bridge must use 40 pages.');
check(main.includes('installFullReportPhase6Bridge()'), 'Phase 6 HTML bridge not installed.');
check(main.includes('installPhase6PagePlanV2()'), 'Restored Phase 6 page plan not installed.');

console.log('FULL report contract PASS: complete styled semantic HTML, real-output markup recovery and aggregate validation, target/persona identity guard, P18 vector PDF parity, target Creative History label, fixed JOB notes, 40 Main pages, zero Appendix.');
