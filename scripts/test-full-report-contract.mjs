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
const prompt = read('src/report/approvedHtmlPrompt.ts');
const semantic = read('src/report/researchContentTemplate.ts');
const slotRules = read('src/report/researchSlotPrompt.ts');
const apiCompiler = read('src/lib/geminiCompiler.ts');
const bridge = read('src/lib/installFullReportPhase6Bridge.ts');
const workflowUx = read('src/lib/installPhase6ApprovedHtmlWorkflowUX.ts');
const inputGuard = read('src/lib/installPhase6InputGuard.ts');
const pagePlan = read('src/lib/installPhase6PagePlanV2.ts');
const main = read('src/main.tsx');

check(blobSha(legacy) === '22bc6937b3d672e063d4b240c5a39b9c61700fec', 'Legacy template changed.');
check(approvedCss.includes('/full-report-approved-v1/base.css'), 'Approved Pilot CSS missing.');
check(pilotCss.trim() === "@import url('/full-report-approved-v1.css');", 'Pilot CSS entrypoint changed.');
check(css.includes('--slide-w:1280px') && css.includes('--slide-h:720px'), '1280x720 lock missing.');

check(prompt.includes('Return one complete standalone HTML report, not JSON'), 'Complete HTML output rule missing.');
check(prompt.includes('Main Deck: exactly 40 pages'), '40-page Main Deck prompt rule missing.');
check(prompt.includes('Appendix: exactly 8 pages'), '8-page Appendix prompt rule missing.');
check(prompt.includes('P12') || prompt.includes('12 Threat Ranking'), 'Threat Ranking page contract missing.');
check(prompt.includes('40 Final Choice'), 'Final Choice page contract missing.');
check(prompt.includes('A8 Brand Principle'), 'A8 Brand Principle contract missing.');
check(prompt.includes('IMMUTABLE APPROVED BASE HTML — START'), 'Approved HTML marker missing.');

check(semantic.includes("contentContract = 'semantic-html-fields-v1'"), 'Semantic HTML field contract marker missing.');
check(semantic.includes('data-report-field'), 'Semantic field metadata missing.');
check(semantic.includes('finalizeApprovedHtmlFromExternalOutput'), 'Approved HTML content graft missing.');
check(semantic.includes("script,noscript,base,iframe,object,embed,form"), 'Active-content sanitizer missing.');
check(semantic.includes("frame.style.width = '1280px'"), 'Canonical 1280px frame width missing.');
check(semantic.includes("inner.style.transform = 'scale(1)'"), 'Canonical scale(1) missing.');
check(semantic.includes('P5 CATEGORY & TARGET의 WANT / AVOID'), 'P5 fixed-label validation missing.');
check(semantic.includes('Threat Ranking 하단은 핵심 경쟁사 3개'), 'P12 core-three validation missing.');
check(semantic.includes('Evidence|Core Desire|Appeal|Threat Mechanism|Attack Point'), 'Deep Dive semantic headings missing.');
check(semantic.includes('Category Clichés는 3열 구조'), 'Category Clichés three-column validation missing.');
check(semantic.includes('Positioning 축에는 X축/Y축이 아니라'), 'Positioning axis validation missing.');
check(semantic.includes("A|I|P1|P2|L"), 'AIPL stage validation missing.');
check(semantic.includes('Pain|현재 문제|Unmet Need|우선순위'), 'Pain/Unmet Need row validation missing.');
check(semantic.includes('Brand Principle은 보고서 전체를 압축'), 'A8 Brand Principle validation missing.');

check(slotRules.includes('[SEMANTIC HTML FIELD CONTRACT]'), 'Semantic field prompt rules missing.');
check(slotRules.includes('Use exactly three core Direct Competitors'), 'Core-three prompt rule missing.');
check(slotRules.includes('P17 CATEGORY CLICHÉS has exactly three columns'), 'P17 page rule missing.');
check(slotRules.includes('P27 must keep A → I → P1 → P2 → L'), 'P27 AIPL rule missing.');
check(slotRules.includes('clear Korean'), 'Plain-Korean quality rule missing.');
check(slotRules.includes('Never shrink text'), 'Readability rule missing.');

for (const source of [apiCompiler, bridge]) {
  check(source.includes('loadApprovedPilotBaseHtml'), 'A Phase 6 path does not load the approved Pilot.');
  check(source.includes('buildApprovedHtmlCompilationPrompt'), 'A Phase 6 path does not use the approved HTML prompt.');
  check(source.includes('extractCompleteFullReportHtml'), 'A Phase 6 path does not import complete HTML.');
  check(source.includes('finalizeApprovedHtmlFromExternalOutput'), 'A Phase 6 path does not graft validated content into the approved HTML.');
  check(source.includes('assertAllResearchSlotsFilled'), 'A Phase 6 path does not verify all semantic fields.');
  check(source.includes('assertResearchEvidencePresent'), 'A Phase 6 path does not verify research evidence.');
  check(!source.includes('assembleFullReportHtml'), 'A Phase 6 path still uses JSON assembly.');
}

check(pagePlan.includes('approved-sample-main40-appendix8-html-v1'), 'Approved sample 40+8 page plan missing.');
check(pagePlan.includes("'comp-landscape'"), 'Competitive Landscape page missing.');
check(pagePlan.includes("'category-cliche'"), 'Category Clichés page missing.');
check(pagePlan.includes("'creative-insight'"), 'Creative Insight page missing.');
check(pagePlan.includes("'appendix-back'"), 'A8 close page missing.');
check(!pagePlan.includes('deep-dive-4') && !pagePlan.includes('creative-history-5'), 'Five-competitor replacement pages remain in the approved sample plan.');
check(pagePlan.includes('phase6-approved-readability-v1'), 'Targeted readability rules missing.');

check(workflowUx.includes('외부 AI 완성 HTML 생성'), 'Approved HTML workflow title missing.');
check(workflowUx.includes('완성 HTML 프롬프트 다운로드'), 'Approved HTML prompt action missing.');
check(workflowUx.includes('HTML 검증 후 48페이지 보고서 열기'), 'Approved HTML render action missing.');
check(workflowUx.includes('JSON이 아닙니다.'), 'HTML-vs-JSON guidance missing.');
check(workflowUx.includes("input.accept = '.html,.htm,.txt,text/html,text/plain'"), 'HTML/TXT file input missing.');
check(inputGuard.includes('looksLikeJson'), 'JSON input guard missing.');
check(inputGuard.includes('현재 Phase 6의 주 경로는 승인 샘플 40 Main + 8 Appendix의 완성 HTML'), 'Approved HTML input guidance missing.');
check(main.includes('installPhase6ApprovedHtmlWorkflowUX()'), 'Approved HTML workflow UX is not installed.');
check(main.includes('installPhase6PagePlanV2()'), 'Approved 40+8 page plan is not installed.');

console.log('FULL report contract PASS: approved 40+8 HTML, semantic field locking, sanitizer, readability, and page-specific validation are connected.');
