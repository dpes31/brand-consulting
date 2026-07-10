import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const read = (path) => readFileSync(resolve(root, path), 'utf8');
const gitBlobSha = (content) => createHash('sha1')
  .update(`blob ${Buffer.byteLength(content)}\0`)
  .update(content)
  .digest('hex');

const runtime = read('src/lib/installFullReportRuntimeCompatibility.ts');
const deploymentStatus = read('src/lib/installDeploymentStatus.ts');
const inputGuard = read('src/lib/installPhase6InputGuard.ts');
const main = read('src/main.tsx');
const viteConfig = read('vite.config.ts');
const bridge = read('src/lib/installFullReportPhase6Bridge.ts');
const workflowUx = read('src/lib/installPhase6ApprovedHtmlWorkflowUX.ts');
const pagePlan = read('src/lib/installPhase6PagePlanV2.ts');
const legacyGuard = read('src/lib/installPromptWorkflowGuard.ts');
const compiler = read('src/report/fullReportCompiler.ts');
const approvedPrompt = read('src/report/approvedHtmlPrompt.ts');
const researchTemplate = read('src/report/researchContentTemplate.ts');
const researchPrompt = read('src/report/researchSlotPrompt.ts');
const apiCompiler = read('src/lib/geminiCompiler.ts');
const css = read('public/full-report-v1.css');
const approvedCss = read('public/full-report-approved-v1.css');
const pilotCss = read('src/pages/BiznupFullIntegrated.css');
const packageJson = JSON.parse(read('package.json'));
const legacyTemplate = read('public/template.html');

assert.equal(
  gitBlobSha(legacyTemplate),
  '22bc6937b3d672e063d4b240c5a39b9c61700fec',
  'Legacy public/template.html SHA changed',
);

assert.match(runtime, /FULL_REPORT_PAGE_COUNT = 48/);
assert.match(runtime, /MAIN_DECK_PAGE_COUNT = 40/);
assert.match(runtime, /SLIDE_WIDTH_PX = 1280/);
assert.match(runtime, /SLIDE_HEIGHT_PX = 720/);
assert.match(runtime, /__FULL_REPORT_NATIVE_PRINT__/);
assert.match(runtime, /lastPdfExportMode = 'native-print'/);

const inputGuardIndex = main.indexOf('installPhase6InputGuard()');
const bridgeIndex = main.indexOf('installFullReportPhase6Bridge()');
const workflowIndex = main.indexOf('installPhase6ApprovedHtmlWorkflowUX()');
const legacyGuardIndex = main.indexOf('installPromptWorkflowGuard()');
const pagePlanIndex = main.indexOf('installPhase6PagePlanV2()');
assert.ok(inputGuardIndex >= 0, 'Phase 6 input guard is not installed');
assert.ok(bridgeIndex > inputGuardIndex, 'Phase 6 bridge must run after the HTML input guard');
assert.ok(workflowIndex > bridgeIndex, 'Approved HTML workflow UX must run after the bridge');
assert.ok(legacyGuardIndex > workflowIndex, 'Approved HTML workflow must run before the legacy prompt guard');
assert.ok(pagePlanIndex > legacyGuardIndex, 'Approved sample page plan must be installed');

assert.match(inputGuard, /looksLikeHtml/);
assert.match(inputGuard, /looksLikeJson/);
assert.match(inputGuard, /승인 샘플 40 Main \+ 8 Appendix의 완성 HTML/);
assert.match(inputGuard, /HTML 검증 후 48페이지 보고서 열기/);

for (const source of [bridge, apiCompiler]) {
  assert.match(source, /loadApprovedPilotBaseHtml/);
  assert.match(source, /createResearchOnlyLayoutTemplate/);
  assert.match(source, /buildApprovedHtmlCompilationPrompt/);
  assert.match(source, /extractCompleteFullReportHtml/);
  assert.match(source, /finalizeApprovedHtmlFromExternalOutput/);
  assert.match(source, /assertAllResearchSlotsFilled/);
  assert.match(source, /assertResearchEvidencePresent/);
  assert.doesNotMatch(source, /assembleFullReportHtml/);
}
assert.match(bridge, /REQUIRED_PHASE_STEPS = \['0', '1', '2', '3', '4', '5'\]/);
assert.match(bridge, /완성 HTML 프롬프트 다운로드/);
assert.match(bridge, /HTML 검증 후 48페이지 보고서 열기/);
assert.match(workflowUx, /phase6-approved-html-workflow/);
assert.match(workflowUx, /\.html \/ \.txt 파일 불러오기/);
assert.match(workflowUx, /JSON이 아닙니다/);
assert.match(legacyGuard, /buildReportCompilerPrompt/);

assert.match(pagePlan, /approved-sample-main40-appendix8-html-v1/);
assert.match(pagePlan, /const MAIN_COUNT = 40/);
assert.match(pagePlan, /const APPENDIX_COUNT = 8/);
assert.match(pagePlan, /'comp-landscape'/);
assert.match(pagePlan, /'category-cliche'/);
assert.match(pagePlan, /'creative-insight'/);
assert.match(pagePlan, /'appendix-back'/);
assert.doesNotMatch(pagePlan, /deep-dive-4|creative-history-5/);
assert.match(pagePlan, /위협 \$\{index \+ 1\}순위/);
assert.match(pagePlan, /phase6-approved-readability-v1/);
assert.match(pagePlan, /grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
assert.match(pagePlan, /#category-cliche \.cliche-head,#category-cliche \.cliche-row/);

assert.match(researchTemplate, /semantic-html-fields-v1/);
assert.match(researchTemplate, /\[\[FIELD:/);
assert.match(researchTemplate, /data-report-field/);
assert.match(researchTemplate, /finalizeApprovedHtmlFromExternalOutput/);
assert.match(researchTemplate, /sanitizedInlineFragment/);
assert.match(researchTemplate, /script,noscript,base,iframe,object,embed,form/);
assert.match(researchTemplate, /frame\.style\.width = '1280px'/);
assert.match(researchTemplate, /inner\.style\.transform = 'scale\(1\)'/);
assert.match(researchTemplate, /P5 CATEGORY & TARGET의 WANT \/ AVOID/);
assert.match(researchTemplate, /P12 Threat Ranking 하단은 핵심 경쟁사 3개/);
assert.match(researchTemplate, /P18 Positioning 축에는 X축\/Y축이 아니라/);
assert.match(researchTemplate, /P27 AIPL 단계는 A → I → P1 → P2 → L/);
assert.match(researchTemplate, /P38 STP Positioning 문장이 비어 있거나 화살표와 뒤섞였습니다/);
assert.match(researchTemplate, /A8 Brand Principle은 보고서 전체를 압축/);
assert.match(researchTemplate, /slice\(0, 3\)/);
assert.match(researchTemplate, /Step 2 핵심 경쟁사가 반영되지 않았습니다/);
assert.match(researchTemplate, /Step 0 핵심 KPI가 충분히 반영되지 않았습니다/);

assert.match(researchPrompt, /SEMANTIC HTML FIELD CONTRACT/);
assert.match(researchPrompt, /Use exactly three core Direct Competitors/);
assert.match(researchPrompt, /P17 CATEGORY CLICHÉS has exactly three columns/);
assert.match(researchPrompt, /P26 must keep Pain, current issue, Unmet Need, and priority in the same row/);
assert.match(researchPrompt, /P27 must keep A → I → P1 → P2 → L/);
assert.match(researchPrompt, /Write clear Korean/);
assert.match(researchPrompt, /Never shrink text/);
assert.match(researchPrompt, /No \[\[FIELD: token may remain/);

assert.match(approvedPrompt, /Return one complete standalone HTML report, not JSON/);
assert.match(approvedPrompt, /Main Deck: exactly 40 pages/);
assert.match(approvedPrompt, /Appendix: exactly 8 pages/);
assert.match(approvedPrompt, /12 Threat Ranking — core three/);
assert.match(approvedPrompt, /40 Final Choice/);
assert.match(approvedPrompt, /A8 Brand Principle \/ Close/);
assert.match(approvedPrompt, /IMMUTABLE APPROVED BASE HTML — START/);
assert.match(approvedPrompt, /Avoid unexplained jargon/);

assert.match(compiler, /loadApprovedPilotBaseHtml/);
assert.match(compiler, /querySelectorAll\('\.full-slide'\)\.length === 48/);
assert.match(pilotCss, /full-report-approved-v1\.css/);
assert.match(approvedCss, /@page\{size:13\.333in 7\.5in;margin:0\}/);
assert.match(css, /--slide-w:1280px/);
assert.match(css, /--slide-h:720px/);

assert.match(main, /installFullReportRuntimeCompatibility/);
assert.match(main, /installDeploymentStatus/);
assert.match(main, /installPhase6ApprovedHtmlWorkflowUX/);
assert.match(main, /installPhase6PagePlanV2/);
assert.match(viteConfig, /VERCEL_GIT_COMMIT_SHA/);
assert.match(viteConfig, /VERCEL_ENV/);
assert.match(deploymentStatus, /Updated :/);
assert.match(deploymentStatus, /Asia\/Seoul/);
assert.equal(packageJson.scripts['test:full-report-runtime'], 'node scripts/test-full-report-runtime.mjs');
assert.match(packageJson.scripts.build, /test:full-report-runtime/);

console.log('FULL report runtime compatibility passed for the approved 40+8 semantic HTML workflow.');
