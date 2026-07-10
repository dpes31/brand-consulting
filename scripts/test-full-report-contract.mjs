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
const compiler = read('src/report/fullReportCompiler.ts');
const safety = read('src/report/reportDomSafety.ts');
const structured = read('src/report/structuredReportV3.ts');
const semanticV4 = read('src/report/semanticReportV4.ts');
const productionContract = read('src/report/productionReportV3Contract.ts');
const definitionPolicy = read('src/report/structuredDefinitionPolicy.ts');
const crossValidation = read('src/report/structuredReportCrossValidation.ts');
const pagePlan = read('src/lib/installPhase6PagePlanV2.ts');
const creativeHistory = read('src/lib/creativeHistoryContract.ts');
const apiCompiler = read('src/lib/geminiCompiler.ts');
const bridge = read('src/lib/installFullReportPhase6Bridge.ts');
const workflowUx = read('src/lib/installPhase6ExternalJsonWorkflowUX.ts');
const inputGuard = read('src/lib/installPhase6InputGuard.ts');
const runtime = read('src/lib/installFullReportRuntimeCompatibility.ts');
const pdfBridge = read('src/lib/installFullReportPdfButtonBridge.ts');
const structuredE2e = read('scripts/e2e-phase6-structured-renderer.mjs');
const sanitizerE2e = read('scripts/e2e-phase6-html-sanitizer.mjs');
const workflow = read('.github/workflows/phase6-v2-preview-e2e.yml');
const main = read('src/main.tsx');

check(blobSha(legacy) === '22bc6937b3d672e063d4b240c5a39b9c61700fec', 'Legacy template changed.');
check(approvedCss.includes('/full-report-approved-v1/base.css'), 'Approved Pilot CSS missing.');
check(pilotCss.trim() === "@import url('/full-report-approved-v1.css');", 'Pilot CSS entrypoint changed.');
check(css.includes('--slide-w:1280px') && css.includes('--slide-h:720px'), '1280x720 lock missing.');

check(compiler.includes('const PAGE_COUNT = 40'), 'Compiler page count must be 40.');
check(compiler.includes('canonicalizeReportDocument'), 'Pilot capture must canonicalize responsive scale.');
check(compiler.includes('Complete HTML generation is retired'), 'AI-authored HTML must be retired.');
check(compiler.includes('structured-report-v3-template'), 'Structured template contract missing.');

check(safety.includes('FULL_REPORT_PAGE_COUNT = 40'), 'DOM safety page count must be 40.');
check(safety.includes("querySelectorAll('script,noscript,base')"), 'Script sanitizer missing.');
check(safety.includes("name.startsWith('on')"), 'Inline event sanitizer missing.');
check(safety.includes('javascript:'), 'JavaScript URL sanitizer missing.');
check(safety.includes("inner.style.transform = 'scale(1)'"), 'Canonical scale(1) missing.');
check(safety.includes('canonicalizePageIds'), 'Dynamic Pilot ID canonicalization missing.');
check(safety.includes('computeReportDomFingerprint'), 'Renderer DOM fingerprint missing.');

check(structured.includes("STRUCTURED_REPORT_VERSION = '3.0.0'"), 'ProductionReportV3 version missing.');
check(structured.includes('buildStructuredReportPrompt'), 'Base structured prompt missing.');
check(structured.includes('validateStructuredReportV3'), 'Structured validation missing.');
check(structured.includes('Persona title must exactly match P21 target'), 'Persona target-title lock missing.');
check(structured.includes('positioning.axis'), 'Positioning semantic fields missing.');
check(structured.includes('Evidence, Core Desire, Appeal, Threat Mechanism, Attack Point'), 'Deep Dive semantic headings missing.');
check(structured.includes("markFixed(labels[0] || null, 'WANT')"), 'WANT fixed label missing.');
check(structured.includes("markFixed(labels[1] || null, 'AVOID')"), 'AVOID fixed label missing.');
check(structured.includes("head.slice(3).forEach((node) => node.remove())"), 'Category Clichés fourth column removal missing.');
check(structured.includes("markFixed(slide.querySelector('.gap-arrow'), '→')"), 'Creative Insight connector lock missing.');

check(definitionPolicy.includes('isGenericOrderField'), 'Generic DOM-order field blocker missing.');
check(definitionPolicy.includes('mapStructuredFieldKey'), 'Semantic field mapping policy missing.');
check(definitionPolicy.includes('jtbd.row'), 'JTBD role mapping missing.');
check(definitionPolicy.includes('consumer-target\\.target'), 'Core-target structural label policy missing.');

check(semanticV4.includes('renderSemanticReportV4'), 'Semantic Renderer V4 missing.');
check(semanticV4.includes('beforeFingerprint !== afterFingerprint'), 'Semantic renderer DOM immutability check missing.');
check(semanticV4.includes('P12 Threat Ranking'), 'P12 field-local semantic validation missing.');
check(semanticV4.includes('P27 AIPL'), 'AIPL field contamination validation missing.');
check(semanticV4.includes("dataset.reportAppendixCount = '0'"), 'Semantic renderer Appendix zero marker missing.');

check(productionContract.includes("enum?: string[]"), 'ProductionReportV3 enum metadata missing.');
check(productionContract.includes("fixedYear?: number | '2026 YTD'"), 'ProductionReportV3 fixed-year metadata missing.');
check(productionContract.includes('buildProductionReportV3Prompt'), 'Prompt schema metadata adapter missing.');
check(productionContract.includes('normalizeProductionReportV3'), 'Constrained Creative History normalizer missing.');
check(productionContract.includes('/^(.*?) · (verified-verbatim|source-found-copy-unverified|not-found)$/'), 'Exact status normalization pattern missing.');
check(productionContract.includes("match[1] !== String(expectedYear)"), 'Expected-year match guard missing.');
check(productionContract.includes('자동 복구할 수 없어 렌더링을 중단했습니다.'), 'Korean field-level blocking error missing.');
check(productionContract.includes('renderSemanticReportV4'), 'Production output is not routed through Semantic Renderer V4.');
check(productionContract.includes("'2026 YTD'"), '2026 YTD renderer metadata missing.');

check(creativeHistory.includes('[CREATIVE HISTORY DATA CONTRACT]'), 'Creative History data contract missing.');
check(!creativeHistory.includes('[CREATIVE HISTORY RENDERING CONTRACT]'), 'Renderer contract leaked into the AI prompt.');
check(!creativeHistory.includes('.timeline-container') && !creativeHistory.includes('data-copy-status'), 'DOM details remain in the Creative History AI directive.');

check(crossValidation.includes('경쟁사명이 아닌'), 'P12 invalid competitor-name validation missing.');
check(crossValidation.includes('핵심 직접 경쟁사 3개'), 'Core-three uniqueness validation missing.');
check(crossValidation.includes('P11 Competitive Landscape 후보'), 'Landscape-to-ranking validation missing.');
check(crossValidation.includes('P16 Product Matrix'), 'Core-three matrix consistency missing.');
check(crossValidation.includes('P18 Positioning'), 'Core-three positioning consistency missing.');
check(crossValidation.includes('P33 Message Trajectory'), 'Core-three trajectory consistency missing.');

check(pagePlan.includes('focus3-main40-no-appendix-v3'), '40-page page-plan version missing.');
check(pagePlan.includes("'comp-landscape'"), 'Landscape not retained in page plan.');
check(pagePlan.includes("'category-cliche'"), 'Category Clichés not retained in page plan.');
check(pagePlan.includes("'creative-insight'"), 'Creative Insight not retained in page plan.');
check(pagePlan.includes("'decision-close'"), 'Decision Close not promoted to page 40.');
check(!pagePlan.includes("'creative-method'"), 'Creative Methodology remains in the output plan.');
check(pagePlan.includes("dataset.reportAppendixCount = '0'"), 'Appendix count must be zero.');

for (const source of [apiCompiler, bridge]) {
  check(source.includes('loadApprovedPilotBaseHtml'), 'A Phase 6 path does not load the approved Pilot.');
  check(source.includes('buildProductionReportV3Prompt'), 'A Phase 6 path does not use the shared ProductionReportV3 prompt contract.');
  check(source.includes('normalizeProductionReportV3'), 'A Phase 6 path does not use constrained normalization.');
  check(source.includes('renderProductionReportV3'), 'A Phase 6 path does not use the app-owned renderer adapter.');
  check(source.includes('assertStructuredReportCrossPage'), 'A Phase 6 path does not enforce cross-page consistency.');
  check(source.includes('applyStructuredDefinitionPolicy'), 'A Phase 6 path does not apply semantic field policy.');
  check(!source.includes('createResearchOnlyLayoutTemplate'), 'Legacy text-node slots remain in an active Phase 6 path.');
}
check(bridge.includes('sanitizeCompatibleFullReportHtml'), 'HTML compatibility sanitizer is not connected.');
check(bridge.includes("compatibilityValidation = 'semantic-skeleton'"), 'HTML compatibility semantic-skeleton validation is not connected.');
check(bridge.includes('formatProductionReportV3Warnings'), 'Normalization warnings are not surfaced.');
check(inputGuard.includes('looksLikeStructuredJson'), 'Input guard does not accept the internal structured response.');

for (const copy of [
  '외부 AI 보고서 작성 방식',
  '외부 AI용 보고서 작성 프롬프트 다운로드',
  '외부 AI가 반환한 결과 붙여넣기',
  '결과 검증 후 40페이지 보고서 만들기',
  '레이아웃과 페이지 구성은 앱이 고정합니다. 외부 AI는 내용만 작성합니다.',
  '기존 완성 HTML 가져오기 — 호환용',
]) check(workflowUx.includes(copy), `Phase 6 UX copy missing: ${copy}`);
check(workflowUx.includes("input.accept = '.json,.txt,application/json,text/plain'"), 'TXT/JSON response file input missing.');

check(structuredE2e.includes('external-ai-response-1.json'), 'First complete external-response fixture missing.');
check(structuredE2e.includes('external-ai-response-2.json'), 'Second complete external-response fixture missing.');
check(structuredE2e.includes("page.keyboard.press('Control+P')"), 'Ctrl+P structured E2E missing.');
check(structuredE2e.includes("page.keyboard.press('Meta+P')"), 'Cmd+P structured E2E missing.');
check(sanitizerE2e.includes("textContent.trim()==='PDF / Print'"), 'Exact user print-script regression missing.');
check(sanitizerE2e.includes('scale(0.82)'), 'Leaked scale regression missing.');
check(sanitizerE2e.includes('Malformed fixture mutation failed'), 'Malformed DOM rejection regression missing.');
check(workflow.includes('e2e-phase6-structured-renderer.mjs'), 'Structured renderer E2E is not in CI.');
check(workflow.includes('e2e-phase6-html-sanitizer.mjs'), 'HTML sanitizer E2E is not in CI.');

check(runtime.includes('FULL_REPORT_PAGE_COUNT = 40'), 'Native PDF preflight must use 40 pages.');
check(runtime.includes('__FULL_REPORT_VIEWER_FIT__'), 'Viewer-only responsive fit missing.');
check(runtime.includes("windowRef.addEventListener('beforeprint', state.reset)"), 'Print scale reset missing.');
check(runtime.includes("windowRef.addEventListener('afterprint', state.fit)"), 'Post-print Viewer refit missing.');
check(runtime.includes('__FULL_REPORT_NATIVE_PRINT__'), 'Native print backup missing.');
check(pdfBridge.includes('exportFullReportPdf'), 'PDF button does not use native FULL report export.');
check(main.includes('installPhase6ExternalJsonWorkflowUX'), 'Phase 6 workflow UX is not installed.');

console.log('[FULL REPORT CONTRACT] PASS');
