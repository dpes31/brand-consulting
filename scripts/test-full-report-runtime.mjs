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
const legacyGuard = read('src/lib/installPromptWorkflowGuard.ts');
const compiler = read('src/report/fullReportCompiler.ts');
const contract = read('src/report/productionReportContract.ts');
const renderer = read('public/full-report-v1.js');
const css = read('public/full-report-v1.css');
const approvedCss = read('public/full-report-approved-v1.css');
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
assert.match(runtime, /installTemporaryLegacyExportAdapters/);
assert.match(runtime, /data-full-report-export-clone/);
assert.match(runtime, /await exportReportPdf/);
assert.match(runtime, /runFullReportPreflight/);
assert.match(runtime, /windowRef\.print =/);

const inputGuardIndex = main.indexOf('installPhase6InputGuard()');
const bridgeIndex = main.indexOf('installFullReportPhase6Bridge()');
const legacyGuardIndex = main.indexOf('installPromptWorkflowGuard()');
assert.ok(inputGuardIndex >= 0, 'Phase 6 input guard is not installed');
assert.ok(bridgeIndex > inputGuardIndex, 'Phase 6 bridge must run after the HTML input guard');
assert.ok(legacyGuardIndex > bridgeIndex, 'Phase 6 bridge must run before the legacy prompt guard');
assert.match(inputGuard, /looksLikeJson/);
assert.match(inputGuard, /현재 Phase 6는 승인된 48페이지 양식/);
assert.match(inputGuard, /완성 HTML/);
assert.doesNotMatch(inputGuard, /이전 HTML 생성 프롬프트로 만든 구형 HTML/);

assert.match(bridge, /loadApprovedPilotBaseHtml/);
assert.match(bridge, /buildFullReportHtmlPrompt/);
assert.match(bridge, /extractCompleteFullReportHtml/);
assert.match(bridge, /assertApprovedFullReportHtml/);
assert.match(bridge, /```html \.\.\. ``` 전체/);
assert.match(bridge, /REQUIRED_PHASE_STEPS = \['0', '1', '2', '3', '4', '5'\]/);
assert.match(bridge, /missingSteps/);
assert.doesNotMatch(bridge, /assembleFullReportHtml/);
assert.doesNotMatch(bridge, /```json \.\.\. ``` 전체/);
assert.doesNotMatch(bridge, /fetch\('\/template\.html/);
assert.match(legacyGuard, /buildReportCompilerPrompt/);

assert.match(compiler, /The final product is ONE complete standalone HTML document, not JSON/);
assert.match(compiler, /IMMUTABLE APPROVED BASE HTML — START/);
assert.match(compiler, /loadApprovedPilotBaseHtml/);
assert.match(compiler, /querySelectorAll\('\.full-slide'\)\.length === 48/);
assert.match(compiler, /VISUAL INTENT BRIEF INTERPRETATION/);
assert.match(compiler, /It does NOT mean that the final output should be JSON/);
assert.match(compiler, /Return the complete HTML only/);
assert.match(compiler, /Do not return ProductionReportV1 or any other JSON/);
assert.match(compiler, /IMMEDIATE EXECUTION DIRECTIVE — THIS ATTACHMENT IS THE COMPLETE USER REQUEST/);
assert.match(compiler, /may send it with an empty chat message/);
assert.match(compiler, /Do not acknowledge the file/);
assert.match(compiler, /별도 채팅 메시지가 비어 있어도/);
assert.match(compiler, /approved 48-page Base HTML/);
assert.match(compiler, /assertApprovedFullReportHtml/);
assert.match(compiler, /FULL 보고서는 정확히 48페이지/);
assert.match(compiler, /documentRef\.querySelector\('script'\)/);

assert.match(template, /full-report-approved-v1\.css/);
assert.match(template, /class="full-report-app"/);
assert.match(approvedCss, /full-report-approved-v1\/base\.css/);
assert.match(approvedCss, /full-report-approved-v1\/refinement\.css/);
assert.match(approvedCss, /full-report-approved-v1\/density-v5-fixes\.css/);
assert.equal(pilotCss.trim(), "@import url('/full-report-approved-v1.css');", 'Pilot must use the shared approved CSS entrypoint');
assert.match(renderer, /persona-left/);
assert.match(renderer, /history-governing/);
assert.match(renderer, /swot-quadrant/);
assert.match(renderer, /stp-layout/);
assert.match(renderer, /slide\.page !== expectedPage/);
assert.match(renderer, /fullReportRendered/);
assert.match(renderer, /verified-verbatim/);
assert.match(contract, /CreativeCopyStatus = 'verified-verbatim'/);
assert.match(contract, /Slide position \$\{expectedPage\} must use page/);
assert.match(contract, /must contain exactly six years/);
assert.match(contract, /Message Trajectory/);
assert.match(contract, /Strategic So What/);

assert.match(main, /installFullReportRuntimeCompatibility/);
assert.match(main, /installDeploymentStatus/);
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

console.log('FULL report runtime compatibility contract passed.');
