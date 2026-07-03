import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const read = (path) => readFileSync(resolve(root, path), 'utf8');

const runtime = read('src/lib/installFullReportRuntimeCompatibility.ts');
const deploymentStatus = read('src/lib/installDeploymentStatus.ts');
const main = read('src/main.tsx');
const viteConfig = read('vite.config.ts');
const bridge = read('src/lib/installFullReportPhase6Bridge.ts');
const renderer = read('public/full-report-v1.js');
const css = read('public/full-report-v1.css');
const packageJson = JSON.parse(read('package.json'));
const legacyTemplate = read('public/template.html');

assert.equal(
  createHash('sha1').update(legacyTemplate).digest('hex'),
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

assert.match(main, /installFullReportRuntimeCompatibility/);
assert.match(main, /installDeploymentStatus/);
assert.match(viteConfig, /VERCEL_GIT_COMMIT_SHA/);
assert.match(viteConfig, /VERCEL_ENV/);
assert.match(viteConfig, /__BUILD_META__/);
assert.match(deploymentStatus, /Updated :/);
assert.match(deploymentStatus, /Asia\/Seoul/);

assert.match(bridge, /REQUIRED_PHASE_STEPS = \['0', '1', '2', '3', '4', '5'\]/);
assert.match(bridge, /missingSteps/);
assert.match(renderer, /slide\.page !== expectedPage/);
assert.match(renderer, /fullReportRendered/);
assert.match(renderer, /verified-verbatim/);
assert.match(css, /--slide-w:1280px/);
assert.match(css, /--slide-h:720px/);
assert.match(css, /@page\{size:13\.333in 7\.5in;margin:0\}/);

assert.equal(packageJson.scripts['test:full-report-runtime'], 'node scripts/test-full-report-runtime.mjs');
assert.match(packageJson.scripts.build, /test:full-report-runtime/);

console.log('FULL report runtime compatibility contract passed.');
