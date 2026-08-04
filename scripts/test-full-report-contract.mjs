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
const semanticHtmlV5 = read('src/report/semanticHtmlReportV5.ts');
const semanticHtmlV6 = read('src/report/semanticHtmlReportV6.ts');
const definitionPolicy = read('src/report/structuredDefinitionPolicy.ts');
const domSafety = read('src/report/reportDomSafety.ts');
const pagePlan = read('src/lib/installPhase6PagePlanV2.ts');
const apiCompiler = read('src/lib/geminiCompiler.ts');
const bridge = read('src/lib/installFullReportPhase6Bridge.ts');
const runtime = read('src/lib/installFullReportRuntimeCompatibility.ts');
const pdfBridge = read('src/lib/installFullReportPdfButtonBridge.ts');
const main = read('src/main.tsx');

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

check(pagePlan.includes('focus3-main40-no-appendix-v3'), '40-page page-plan version missing.');
check(pagePlan.includes("'comp-landscape'"), 'Landscape not retained in page plan.');
check(pagePlan.includes("'category-cliche'"), 'Category Clichés not retained in page plan.');
check(pagePlan.includes("'creative-insight'"), 'Creative Insight not retained in page plan.');
check(pagePlan.includes("'decision-close'"), 'Decision Close not promoted to page 40.');
check(!pagePlan.includes("'creative-method'"), 'Creative Methodology remains in the output plan.');
check(pagePlan.includes("dataset.reportAppendixCount = '0'"), 'Appendix count must be zero.');

check(semanticHtmlV6.includes('Return one complete standalone HTML document, not JSON.'), 'Complete HTML output contract missing.');
check(semanticHtmlV6.includes('[STEP 0–5 RESEARCH — SOURCE OF TRUTH]'), 'Step 0–5 research block missing.');
check(
  semanticHtmlV6.indexOf('[STEP 0–5 RESEARCH — SOURCE OF TRUTH]')
    < semanticHtmlV6.indexOf('${LIGHTWEIGHT_TEMPLATE_START}'),
  'Step 0–5 research must appear before the lightweight HTML workbook.',
);
check(semanticHtmlV6.includes('[[FIELD:${definition.key}]]'), 'Semantic field token generation missing.');
check(semanticHtmlV6.includes('LIGHTWEIGHT_SEMANTIC_HTML_CONTRACT'), 'Lightweight workbook contract missing.');
check(semanticHtmlV6.includes('compileSemanticHtmlReportV6'), 'Lightweight semantic HTML compiler missing.');
check(semanticHtmlV6.includes('compileSemanticHtmlReportV5'), 'Approved V5 validation bridge missing.');
check(semanticHtmlV6.includes('createSemanticHtmlTemplateV5'), 'Approved Renderer expansion missing.');

check(semanticHtmlV5.includes('sanitizeCompatibleFullReportHtml'), 'Active-content sanitizer missing.');
check(semanticHtmlV5.includes('computeReportDomFingerprint'), 'Approved DOM fingerprint validation missing.');
check(semanticHtmlV5.includes('renderSemanticReportV4'), 'Approved DOM reassembly missing.');
check(semanticHtmlV5.includes("dataset.contentContract = 'semantic-html-v5'"), 'Semantic HTML output marker missing.');

check(definitionPolicy.includes('GENERIC_ORDER_FIELD'), 'Generic order field guard missing.');
check(definitionPolicy.includes('jtbd.row'), 'JTBD semantic role mapping missing.');
check(domSafety.includes("querySelectorAll('script,noscript,base')"), 'Script sanitizer missing.');
check(domSafety.includes('FULL_REPORT_PAGE_COUNT = 40'), 'DOM safety page count must be 40.');

for (const source of [apiCompiler, bridge]) {
  check(source.includes('loadApprovedPilotBaseHtml'), 'A Phase 6 path does not load the approved Pilot.');
  check(source.includes('createSemanticHtmlWorkbookV6'), 'A Phase 6 path does not create the lightweight semantic HTML workbook.');
  check(source.includes('buildSemanticHtmlPromptV6'), 'A Phase 6 path does not use the lightweight complete HTML prompt.');
  check(source.includes('compileSemanticHtmlReportV6'), 'A Phase 6 path does not validate and compile returned lightweight HTML.');
  check(!source.includes('createResearchOnlyLayoutTemplate'), 'A Phase 6 path still uses ordinal CONTENT SLOT generation.');
  check(!source.includes('addResearchSlotRules'), 'A Phase 6 path still uses ordinal slot prompt rules.');
  check(!source.includes('extractProductionReportJson'), 'A Phase 6 path exposes JSON as the external result.');
}

check(bridge.includes('완성 HTML 프롬프트 다운로드'), 'User-facing complete HTML action missing.');
check(bridge.includes('phase6_lightweight_html_prompt_'), 'Lightweight HTML prompt filename missing.');
check(bridge.includes('고정 CSS·레이아웃·장식 DOM은 전송 파일에서 제외했다.'), 'Prompt-size mitigation guidance missing.');
check(!bridge.includes('structured-json'), 'JSON input mode remains in the user workflow.');

check(runtime.includes('FULL_REPORT_PAGE_COUNT = 40'), 'Native PDF preflight must use 40 pages.');
check(pdfBridge.includes('FULL_PAGE_COUNT = 40'), 'PDF button bridge must use 40 pages.');
check(main.includes('installFullReportPhase6Bridge()'), 'Phase 6 HTML bridge not installed.');
check(main.includes('installPhase6PagePlanV2()'), 'Restored Phase 6 page plan not installed.');

console.log('FULL report contract PASS: lightweight semantic HTML, 40 Main pages, zero Appendix, approved Renderer reassembly, no ordinal slot or external JSON path.');
