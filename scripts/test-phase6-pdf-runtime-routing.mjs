import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const main = read('src/main.tsx');
const runtime = read('src/lib/installFullReportRuntimeCompatibility.ts');
const bridge = read('src/lib/installFullReportPdfButtonBridge.ts');

assert.ok(
  main.indexOf('installFullReportRuntimeCompatibility()') < main.indexOf('installIframeLayoutSafety()'),
  'FULL report runtime must install before the legacy iframe layout/PDF guard',
);

assert.match(runtime, /const LEGACY_LAYOUT_MARKER = 'layoutSafetyV1'/);
assert.match(runtime, /documentRef\.documentElement\.dataset\[LEGACY_LAYOUT_MARKER\] = 'installed'/);
assert.match(runtime, /windowRef\.__NATIVE_REPORT_PRINT__ \|\| windowRef\.print\.bind\(windowRef\)/);
assert.match(runtime, /fullReportNativePrintSource/);

assert.match(bridge, /function findViewerFrame/);
assert.match(bridge, /full-report-pdf-export-frame/);
assert.match(bridge, /PDF로 출력할 FULL 보고서를 먼저 생성하거나 저장된 프로젝트를 열어 주세요/);
assert.match(bridge, /event\.stopImmediatePropagation\(\)/);
assert.match(bridge, /exportFullReportPdf/);

console.log('Phase 6 PDF runtime routing contract passed.');
