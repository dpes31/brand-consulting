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
const pagePlan = read('src/lib/installPhase6PagePlanV2.ts');
const legacyGuard = read('src/lib/installPromptWorkflowGuard.ts');
const compiler = read('src/report/fullReportCompiler.ts');
const researchTemplate = read('src/report/researchContentTemplate.ts');
const researchPrompt = read('src/report/researchSlotPrompt.ts');
const apiCompiler = read('src/lib/geminiCompiler.ts');
const contract = read('src/report/productionReportContract.ts');
const renderer = read('public/full-report-v1.js');
const css = read('public/full-report-v1.css');
const approvedCss = read('public/full-report-approved-v1.css');
const colorFixes = read('public/full-report-approved-v1/color-consistency-v1.css');
const pilotCss = read('src/pages/BiznupFullIntegrated.css');
const template = read('public/template-full-report-v1.html');
const packageJson = JSON.parse(read('package.json'));
const legacyTemplate = read('public/template.html');

assert.equal(
  gitBlobSha(legacyTemplate),
  '22bc6937b3d672e063d4b240c5a39b9c61700fec',
  'Legacy public/template.html SHA changed',
);

assert.match(runtime, /FULL_REPORT_SELECTOR = '\.full-slide/);
assert.match(runtime, /FULL_REPORT_PAGE_COUNT = 48/);
assert.match(runtime, /MAIN_DECK_PAGE_COUNT = 40/);
assert.match(runtime, /SLIDE_WIDTH_PX = 1280/);
assert.match(runtime, /SLIDE_HEIGHT_PX = 720/);
assert.match(runtime, /runFullReportPreflight/);
assert.match(runtime, /__FULL_REPORT_NATIVE_PRINT__/);
assert.match(runtime, /lastPdfExportMode = 'native-print'/);
assert.match(runtime, /Native PDF print is ready/);
assert.match(runtime, /windowRef\.print =/);
assert.doesNotMatch(runtime, /installTemporaryLegacyExportAdapters/);
assert.doesNotMatch(runtime, /await exportReportPdf/);

const inputGuardIndex = main.indexOf('installPhase6InputGuard()');
const bridgeIndex = main.indexOf('installFullReportPhase6Bridge()');
const legacyGuardIndex = main.indexOf('installPromptWorkflowGuard()');
const pagePlanIndex = main.indexOf('installPhase6PagePlanV2()');
assert.ok(inputGuardIndex >= 0, 'Phase 6 input guard is not installed');
assert.ok(bridgeIndex > inputGuardIndex, 'Phase 6 bridge must run after the HTML input guard');
assert.ok(legacyGuardIndex > bridgeIndex, 'Phase 6 bridge must run before the legacy prompt guard');
assert.ok(pagePlanIndex > legacyGuardIndex, 'Five-competitor page plan must be installed before React renders');
assert.match(inputGuard, /looksLikeJson/);
assert.match(inputGuard, /현재 Phase 6는 승인된 48페이지 양식/);
assert.match(inputGuard, /완성 HTML/);
assert.doesNotMatch(inputGuard, /이전 HTML 생성 프롬프트로 만든 구형 HTML/);

assert.match(bridge, /loadApprovedPilotBaseHtml/);
assert.match(bridge, /buildFullReportHtmlPrompt/);
assert.match(bridge, /extractCompleteFullReportHtml/);
assert.match(bridge, /assertApprovedFullReportHtml/);
assert.match(bridge, /createResearchOnlyLayoutTemplate/);
assert.match(bridge, /addResearchSlotRules/);
assert.match(bridge, /assertAllResearchSlotsFilled/);
assert.match(bridge, /assertResearchEvidencePresent/);
assert.match(bridge, /CONTENT SLOT/);
assert.match(bridge, /REQUIRED_PHASE_STEPS = \['0', '1', '2', '3', '4', '5'\]/);
assert.match(bridge, /missingSteps/);
assert.doesNotMatch(bridge, /assembleFullReportHtml/);
assert.doesNotMatch(bridge, /```json \.\.\. ``` 전체/);
assert.doesNotMatch(bridge, /fetch\('\/template\.html/);
assert.match(legacyGuard, /buildReportCompilerPrompt/);

assert.match(apiCompiler, /createResearchOnlyLayoutTemplate/);
assert.match(apiCompiler, /addResearchSlotRules/);
assert.match(apiCompiler, /assertAllResearchSlotsFilled/);
assert.match(apiCompiler, /assertResearchEvidencePresent/);

assert.match(pagePlan, /competitor5-main40-appendix8-v2/);
assert.match(pagePlan, /deep-dive-5/);
assert.match(pagePlan, /creative-history-5/);
assert.match(pagePlan, /appendix-divider-layout/);
assert.match(pagePlan, /appendix-evidence-sources/);

assert.match(researchTemplate, /research-slots-v1/);
assert.match(researchTemplate, /\[\[CONTENT:/);
assert.match(researchTemplate, /deep-dive-1/);
assert.match(researchTemplate, /deep-dive-5/);
assert.match(researchTemplate, /creative-history-target/);
assert.match(researchTemplate, /creative-history-5/);
assert.match(researchTemplate, /slice\(0, 5\)/);
assert.match(researchTemplate, /Step 2 핵심 경쟁사가 반영되지 않았습니다/);
assert.match(researchTemplate, /Step 0 핵심 KPI가 충분히 반영되지 않았습니다/);
assert.match(researchPrompt, /RESEARCH CONTENT SLOT CONTRACT/);
assert.match(researchPrompt, /Deep Dive 1–5 and Creative History 1–5/);
assert.match(researchPrompt, /Never invent a competitor/);
assert.match(researchPrompt, /Persona index 02 and 03 must remain unbroken/);
assert.match(researchPrompt, /Do not copy, restore, reconstruct, or guess any wording from a previous Pilot report/);
assert.match(researchPrompt, /A visually correct report with copied sample content is invalid/);
assert.match(researchPrompt, /No \[\[CONTENT: token may remain/);

assert.match(compiler, /The final product is ONE complete standalone HTML document, not JSON/);
assert.match(compiler, /IMMUTABLE APPROVED BASE HTML — START/);
assert.match(compiler, /loadApprovedPilotBaseHtml/);
assert.match(compiler, /querySelectorAll\('\.full-slide'\)\.length === 48/);
assert.match(compiler, /VISUAL INTENT BRIEF INTERPRETATION/);
assert.ok(
  /It does NOT mean that the final output should be JSON/.test(compiler) ||
  /Visual Intent Brief JSON is an intermediate assignment brief, not the final output format/.test(compiler),
  'Visual Intent final-output rule missing',
);
assert.match(compiler, /Return the complete HTML only/);
assert.match(compiler, /Do not return ProductionReportV1 or any other JSON/);
assert.match(compiler, /IMMEDIATE EXECUTION DIRECTIVE — THIS ATTACHMENT IS THE COMPLETE USER REQUEST/);
assert.match(compiler, /may send it with an empty chat message/);
assert.match(compiler, /Do not acknowledge the file/);
assert.match(compiler, /별도 채팅 메시지가 비어 있어도/);
assert.ok(
  /approved 48-page Base HTML/.test(compiler) ||
  /approved 48-page HTML\/CSS layout/.test(compiler),
  'Approved 48-page layout instruction missing',
);
assert.match(compiler, /Deep Dive pages 12–16/);
assert.match(compiler, /Appendix pages are never competitor overflow slots/);
assert.match(compiler, /approved two-column choice-layout/);
assert.match(compiler, /assertApprovedFullReportHtml/);
assert.match(compiler, /FULL 보고서는 정확히 48페이지/);
assert.match(compiler, /documentRef\.querySelector\('script'\)/);

assert.match(template, /full-report-approved-v1\.css/);
assert.match(template, /class="full-report-app"/);
assert.match(approvedCss, /full-report-approved-v1\/base\.css/);
assert.match(approvedCss, /full-report-approved-v1\/refinement\.css/);
assert.match(approvedCss, /full-report-approved-v1\/density-v5-fixes\.css/);
assert.match(approvedCss, /full-report-approved-v1\/color-consistency-v1\.css/);
assert.match(approvedCss, /\.full-frame \.full-slide\{break-after:auto!important/);
assert.equal(pilotCss.trim(), "@import url('/full-report-approved-v1.css');", 'Pilot must use the shared approved CSS entrypoint');

assert.match(colorFixes, /--full-paper: #090a0c/);
assert.match(colorFixes, /#strategy-choice \.choice-layout/);
assert.match(colorFixes, /grid-template-columns: minmax\(0, \.8fr\) minmax\(0, 1\.2fr\)/);
assert.match(colorFixes, /\.persona-index/);
assert.match(colorFixes, /white-space: nowrap !important/);
assert.match(colorFixes, /\.appendix-divider-layout/);
assert.match(colorFixes, /\.appendix-evidence-source-layout/);
assert.match(colorFixes, /#identity \.founding-jtbd-note/);

assert.match(renderer, /persona-left/);
assert.match(renderer, /history-governing/);
assert.match(renderer, /swot-quadrant/);
assert.match(renderer, /stp-layout/);
assert.match(renderer, /slide\.page !== expectedPage/);
assert.match(renderer, /fullReportRendered/);
assert.match(renderer, /verified-verbatim/);
assert.match(contract, /CreativeCopyStatus = 'verified-verbatim'/);
assert.match(contract, /\[34, 'creative-history'\]/);
assert.match(contract, /Slide position \$\{expectedPage\} must use page/);
assert.match(contract, /must contain exactly six years/);
assert.match(contract, /Message Trajectory/);
assert.match(contract, /Strategic So What/);

assert.match(main, /installFullReportRuntimeCompatibility/);
assert.match(main, /installDeploymentStatus/);
assert.match(main, /installPhase6PagePlanV2/);
assert.match(viteConfig, /VERCEL_GIT_COMMIT_SHA/);
assert.match(viteConfig, /VERCEL_ENV/);
assert.match(viteConfig, /__BUILD_META__/);
assert.match(deploymentStatus, /Updated :/);
assert.match(deploymentStatus, /Asia\/Seoul/);
assert.match(css, /--slide-w:1280px/);
assert.match(css, /--slide-h:720px/);
assert.match(approvedCss, /@page\{size:13\.333in 7\.5in;margin:0\}/);

assert.equal(packageJson.scripts['test:full-report-runtime'], 'node scripts/test-full-report-runtime.mjs');
assert.match(packageJson.scripts.build, /test:full-report-runtime/);

console.log('FULL report runtime compatibility contract passed for the five-competitor 40+8 plan.');
