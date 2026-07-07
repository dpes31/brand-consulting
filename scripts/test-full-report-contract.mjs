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
const pagePlan = read('src/lib/installPhase6PagePlanV2.ts');
const researchTemplate = read('src/report/researchContentTemplate.ts');
const slotRules = read('src/report/researchSlotPrompt.ts');
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
check(compiler.includes('IMMUTABLE APPROVED BASE HTML — START'), 'Approved Base HTML marker missing.');
check(compiler.includes('assertApprovedFullReportHtml'), 'HTML validator missing.');

check(pagePlan.includes('focus3-main40-no-appendix-v3'), '40-page page-plan version missing.');
check(pagePlan.includes("'comp-landscape'"), 'Landscape not retained in page plan.');
check(pagePlan.includes("'category-cliche'"), 'Category Clichés not retained in page plan.');
check(pagePlan.includes("'creative-insight'"), 'Creative Insight not retained in page plan.');
check(pagePlan.includes("'decision-close'"), 'Decision Close not promoted to page 40.');
check(!pagePlan.includes("'creative-method'"), 'Creative Methodology remains in the output plan.');
check(pagePlan.includes("dataset.reportAppendixCount = '0'"), 'Appendix count must be zero.');

check(researchTemplate.includes('const PAGE_COUNT = 40'), 'Research template page count must be 40.');
check(researchTemplate.includes("13: 'deep-dive-1'"), 'Core competitor Deep Dive mapping missing.');
check(researchTemplate.includes("32: 'creative-history-3'"), 'Core competitor Creative History mapping missing.');
check(slotRules.includes('Competitive Landscape'), 'Landscape prompt contract missing.');
check(slotRules.includes('top three'), 'Core-three prompt contract missing.');
check(slotRules.includes('~한다'), 'Declarative consulting tone missing.');

for (const source of [apiCompiler, bridge]) {
  check(source.includes('loadApprovedPilotBaseHtml'), 'A Phase 6 path does not load the approved Pilot.');
  check(source.includes('buildFullReportHtmlPrompt'), 'A Phase 6 path does not use the HTML prompt.');
  check(source.includes('extractCompleteFullReportHtml'), 'A Phase 6 path does not import complete HTML.');
  check(source.includes('assertApprovedFullReportHtml'), 'A Phase 6 path does not validate complete HTML.');
  check(!source.includes('assembleFullReportHtml'), 'A Phase 6 path still uses JSON assembly.');
}

check(runtime.includes('FULL_REPORT_PAGE_COUNT = 40'), 'Native PDF preflight must use 40 pages.');
check(pdfBridge.includes('FULL_PAGE_COUNT = 40'), 'PDF button bridge must use 40 pages.');
check(main.includes('installFullReportPhase6Bridge()'), 'Phase 6 HTML bridge not installed.');
check(main.includes('installPhase6PagePlanV2()'), 'Restored Phase 6 page plan not installed.');

console.log('FULL report contract PASS: approved 40-page Main Deck uses Landscape-to-core-three logic and no Appendix.');
