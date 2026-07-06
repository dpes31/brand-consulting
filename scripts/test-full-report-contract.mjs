import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const assert = (condition, message) => {
  if (!condition) throw new Error(`[FULL REPORT CONTRACT] ${message}`);
};
const gitBlobSha = (content) => createHash('sha1')
  .update(`blob ${Buffer.byteLength(content)}\0`)
  .update(content)
  .digest('hex');

const legacyTemplate = read('public/template.html');
const fullTemplate = read('public/template-full-report-v1.html');
const fullCss = read('public/full-report-v1.css');
const approvedCss = read('public/full-report-approved-v1.css');
const pilotCss = read('src/pages/BiznupFullIntegrated.css');
const enhancementCss = read('public/full-report-v1-enhancements.css');
const fullRuntime = read('public/full-report-v1.js');
const contract = read('src/report/productionReportContract.ts');
const compiler = read('src/report/fullReportCompiler.ts');
const apiCompiler = read('src/lib/geminiCompiler.ts');
const bridge = read('src/lib/installFullReportPhase6Bridge.ts');
const mainEntry = read('src/main.tsx');

assert(
  gitBlobSha(legacyTemplate) === '22bc6937b3d672e063d4b240c5a39b9c61700fec',
  'Legacy public/template.html changed. Restore it from the immutable backup before continuing.',
);
assert(fullTemplate.includes('data-report-version="full-report-v1"'), 'FULL template version marker is missing.');
assert(fullTemplate.includes('{{REPORT_JSON}}'), 'FULL template data placeholder is missing.');
assert(fullTemplate.includes('/full-report-approved-v1.css'), 'FULL template does not load the shared approved stylesheet.');
assert(approvedCss.includes("@import url('/full-report-v1.css')"), 'Approved stylesheet does not retain the deterministic recipe base.');
assert(approvedCss.includes('/full-report-approved-v1/base.css'), 'Approved stylesheet does not include the approved Pilot base.');
assert(pilotCss.trim() === "@import url('/full-report-approved-v1.css');", 'Pilot and Production do not share the same approved stylesheet entrypoint.');
assert(fullTemplate.includes('/full-report-v1-enhancements.css'), 'FULL template does not load its refinement stylesheet.');
assert(fullTemplate.includes('/full-report-v1.js'), 'FULL template does not load its deterministic renderer.');
assert(fullCss.includes('--slide-w:1280px') && fullCss.includes('--slide-h:720px'), 'FULL template is not locked to 1280×720.');
assert(enhancementCss.includes('.history-bottom'), 'Creative History conclusion layout is missing.');
assert(fullRuntime.includes('report.mainSlides.length !== 40'), 'Runtime Main Deck validator is missing.');
assert(fullRuntime.includes('report.appendixSlides.length !== 8'), 'Runtime Appendix validator is missing.');
assert(fullRuntime.includes("style.setProperty('--accent'"), 'Dynamic brand accent binding is missing.');
assert(fullRuntime.includes("style.setProperty('--full-accent'"), 'Approved Pilot accent binding is missing.');
assert(contract.includes('PRODUCTION_MAIN_PAGE_COUNT = 40'), 'TypeScript Main Deck contract is not 40 pages.');
assert(contract.includes('PRODUCTION_APPENDIX_PAGE_COUNT = 8'), 'TypeScript Appendix contract is not 8 pages.');

const pageRows = [...compiler.matchAll(/^\s*\[(\d+),\s*'(main|appendix)'/gm)];
assert(pageRows.length === 48, `Phase 6 page plan has ${pageRows.length} entries instead of 48.`);
assert(pageRows.filter(([, , zone]) => zone === 'main').length === 40, 'Phase 6 page plan must contain 40 Main Deck entries.');
assert(pageRows.filter(([, , zone]) => zone === 'appendix').length === 8, 'Phase 6 page plan must contain 8 Appendix entries.');
assert(compiler.includes('The application, not the AI, owns the final HTML/CSS renderer.'), 'Phase 6 prompt still lets the AI own HTML layout.');
assert(compiler.includes('Step 0–5 research'), 'Phase 6 prompt does not explicitly consolidate all research steps.');
assert(!apiCompiler.includes("fetch('/template.html"), 'API compiler still loads the legacy template.');
assert(apiCompiler.includes('buildFullReportDataPrompt'), 'API compiler is not wired to the FULL Phase 6 prompt.');
assert(apiCompiler.includes('assembleFullReportHtml'), 'API compiler is not wired to deterministic HTML assembly.');
assert(bridge.includes('buildFullReportDataPrompt'), 'Manual Phase 6 prompt extraction is not wired to the FULL contract.');
assert(bridge.includes('assembleFullReportHtml'), 'Manual Phase 6 result import is not wired to deterministic HTML assembly.');
assert(mainEntry.includes('installPhase6InputGuard()'), 'The normal app does not reject legacy HTML before JSON parsing.');
assert(mainEntry.includes('installFullReportPhase6Bridge()'), 'The normal app does not install the Phase 6 FULL report bridge.');

console.log('FULL report contract PASS: legacy backup preserved, Phase 6 uses one JSON contract, and Pilot/Production share the approved renderer source.');
