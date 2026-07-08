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
const crossValidation = read('src/report/structuredReportCrossValidation.ts');
const pagePlan = read('src/lib/installPhase6PagePlanV2.ts');
const apiCompiler = read('src/lib/geminiCompiler.ts');
const bridge = read('src/lib/installFullReportPhase6Bridge.ts');
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
check(safety.includes('computeReportDomFingerprint'), 'DOM fingerprint missing.');

check(structured.includes("STRUCTURED_REPORT_VERSION = '3.0.0'"), 'ProductionReportV3 version missing.');
check(structured.includes('buildStructuredReportPrompt'), 'Structured JSON prompt missing.');
check(structured.includes('renderStructuredReportV3'), 'App-owned renderer missing.');
check(structured.includes('validateStructuredReportV3'), 'Structured validation missing.');
check(structured.includes('Persona title must exactly match P21 target'), 'Persona target-title lock missing.');
check(structured.includes('positioning.axis'), 'Positioning semantic fields missing.');
check(structured.includes('Evidence, Core Desire, Appeal, Threat Mechanism, Attack Point'), 'Deep Dive semantic headings missing.');
check(structured.includes("markFixed(labels[0] || null, 'WANT')"), 'WANT fixed label missing.');
check(structured.includes("markFixed(labels[1] || null, 'AVOID')"), 'AVOID fixed label missing.');
check(structured.includes("head.slice(3).forEach((node) => node.remove())"), 'Category Clichés fourth column removal missing.');
check(structured.includes("markFixed(slide.querySelector('.gap-arrow'), '→')"), 'Creative Insight connector lock missing.');
check(structured.includes('beforeFingerprint !== afterFingerprint'), 'Renderer DOM immutability check missing.');

check(crossValidation.includes('P12 Threat Ranking must select three unique core competitors'), 'Core-three uniqueness validation missing.');
check(crossValidation.includes('must come from P11 Competitive Landscape'), 'Landscape-to-ranking validation missing.');
check(crossValidation.includes('P16 matrix core competitor'), 'Core-three matrix consistency missing.');
check(crossValidation.includes('P18 map competitor'), 'Core-three positioning consistency missing.');
check(crossValidation.includes('P33 trajectory competitor'), 'Core-three trajectory consistency missing.');

check(pagePlan.includes('focus3-main40-no-appendix-v3'), '40-page page-plan version missing.');
check(pagePlan.includes("'comp-landscape'"), 'Landscape not retained in page plan.');
check(pagePlan.includes("'category-cliche'"), 'Category Clichés not retained in page plan.');
check(pagePlan.includes("'creative-insight'"), 'Creative Insight not retained in page plan.');
check(pagePlan.includes("'decision-close'"), 'Decision Close not promoted to page 40.');
check(!pagePlan.includes("'creative-method'"), 'Creative Methodology remains in the output plan.');
check(pagePlan.includes("dataset.reportAppendixCount = '0'"), 'Appendix count must be zero.');

for (const source of [apiCompiler, bridge]) {
  check(source.includes('loadApprovedPilotBaseHtml'), 'A Phase 6 path does not load the approved Pilot.');
  check(source.includes('buildStructuredReportPrompt'), 'A Phase 6 path does not use structured JSON.');
  check(source.includes('renderStructuredReportV3'), 'A Phase 6 path does not use the app-owned renderer.');
  check(source.includes('assertStructuredReportCrossPage'), 'A Phase 6 path does not enforce cross-page consistency.');
  check(!source.includes('createResearchOnlyLayoutTemplate'), 'Legacy text-node slots remain in an active Phase 6 path.');
}
check(bridge.includes('sanitizeCompatibleFullReportHtml'), 'HTML compatibility sanitizer is not connected.');
check(bridge.includes('computeReportDomFingerprint'), 'Compatibility DOM fingerprint is not connected.');
check(inputGuard.includes('looksLikeStructuredJson'), 'Input guard does not accept ProductionReportV3 JSON.');

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
check(pdfBridge.includes('FULL_PAGE_COUNT = 40'), 'PDF button bridge must use 40 pages.');
check(main.includes('installFullReportPhase6Bridge()'), 'Structured Phase 6 bridge not installed.');
check(main.includes('installPhase6PagePlanV2()'), 'Restored Phase 6 page plan not installed.');

console.log('FULL report contract PASS: app-owned 40-page structured renderer, sanitizer, cross-page validation, semantic E2E, and PDF runtime are connected.');
