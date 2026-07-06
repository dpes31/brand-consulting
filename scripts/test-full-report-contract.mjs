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
const template = read('public/template-full-report-v1.html');
const css = read('public/full-report-v1.css');
const approvedCss = read('public/full-report-approved-v1.css');
const pilotCss = read('src/pages/BiznupFullIntegrated.css');
const runtime = read('public/full-report-v1.js');
const contract = read('src/report/productionReportContract.ts');
const compiler = read('src/report/fullReportCompiler.ts');
const apiCompiler = read('src/lib/geminiCompiler.ts');
const bridge = read('src/lib/installFullReportPhase6Bridge.ts');
const inputGuard = read('src/lib/installPhase6InputGuard.ts');
const main = read('src/main.tsx');

check(blobSha(legacy) === '22bc6937b3d672e063d4b240c5a39b9c61700fec', 'Legacy template changed.');
check(template.includes('data-report-version="full-report-v1"'), 'FULL template marker missing.');
check(template.includes('{{REPORT_JSON}}'), 'Compatibility data placeholder missing.');
check(approvedCss.includes('/full-report-approved-v1/base.css'), 'Approved Pilot CSS missing.');
check(pilotCss.trim() === "@import url('/full-report-approved-v1.css');", 'Pilot CSS entrypoint changed.');
check(css.includes('--slide-w:1280px') && css.includes('--slide-h:720px'), '1280x720 lock missing.');
check(runtime.includes('report.mainSlides.length !== 40'), 'Main Deck runtime check missing.');
check(runtime.includes('report.appendixSlides.length !== 8'), 'Appendix runtime check missing.');
check(contract.includes('PRODUCTION_MAIN_PAGE_COUNT = 40'), 'Main contract missing.');
check(contract.includes('PRODUCTION_APPENDIX_PAGE_COUNT = 8'), 'Appendix contract missing.');

const pages = [...compiler.matchAll(/^\s*\[(\d+),\s*'(main|appendix)'/gm)];
check(pages.length === 48, `Page plan has ${pages.length} entries.`);
check(pages.filter(([, , zone]) => zone === 'main').length === 40, 'Main plan must contain 40 pages.');
check(pages.filter(([, , zone]) => zone === 'appendix').length === 8, 'Appendix plan must contain 8 pages.');
check(compiler.includes('ONE complete standalone HTML document, not JSON'), 'Complete HTML output rule missing.');
check(compiler.includes('IMMUTABLE APPROVED BASE HTML — START'), 'Approved Base HTML marker missing.');
check(compiler.includes('VISUAL INTENT BRIEF INTERPRETATION'), 'Visual Intent interpretation missing.');
check(compiler.includes('It does NOT mean that the final output should be JSON.'), 'Visual Intent final-output rule missing.');
check(compiler.includes('loadApprovedPilotBaseHtml'), 'Pilot capture missing.');
check(compiler.includes('assertApprovedFullReportHtml'), 'HTML validator missing.');

for (const source of [apiCompiler, bridge]) {
  check(source.includes('loadApprovedPilotBaseHtml'), 'A Phase 6 path does not load the approved Pilot.');
  check(source.includes('buildFullReportHtmlPrompt'), 'A Phase 6 path does not use the HTML prompt.');
  check(source.includes('extractCompleteFullReportHtml'), 'A Phase 6 path does not import complete HTML.');
  check(source.includes('assertApprovedFullReportHtml'), 'A Phase 6 path does not validate complete HTML.');
  check(!source.includes('assembleFullReportHtml'), 'A Phase 6 path still uses JSON assembly.');
}

check(inputGuard.includes('looksLikeJson'), 'Obsolete JSON guard missing.');
check(inputGuard.includes('완성 HTML'), 'Complete HTML guidance missing.');
check(main.includes('installPhase6InputGuard()'), 'Phase 6 input guard not installed.');
check(main.includes('installFullReportPhase6Bridge()'), 'Phase 6 HTML bridge not installed.');

console.log('FULL report contract PASS: both Phase 6 paths use the approved 48-page HTML.');
