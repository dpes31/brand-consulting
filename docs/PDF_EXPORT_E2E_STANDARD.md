# PDF Export E2E Standard

## Permanent rule

Every future PDF-related change in this repository must be validated through the actual application user journey, not only through PDF helper code or a standalone test document.

## Required E2E path

1. Open the actual application route.
2. Create or reopen a real Phase 6 FULL report.
3. Click the visible `Export PDF` button.
4. Verify that the button resolves the active Viewer iframe.
5. Verify exactly 40 `.full-slide` pages, all in the Main Deck, with zero Appendix pages.
6. Run blocking preflight before print.
7. Use the FULL browser-native print runtime, never the Legacy selector or raster exporter.
8. Complete a first export.
9. Complete a second consecutive export without reloading.
10. Verify Windows `Ctrl+P` and macOS `Cmd+P` use the same FULL Viewer iframe and native-print path.
11. Save the project, reload the app, reopen the report, and export again.

## Acceptance criteria

- The actual app `Export PDF` button is clicked by browser E2E.
- The active Viewer iframe is found.
- Exactly 40 pages are present.
- All pages use `data-zone="main"`; Appendix count is zero.
- Every page retains a logical 1280×720 canvas.
- PDF MediaBox is 960×540pt.
- No clipping or body overflow occurs.
- Viewer and PDF use the same report HTML.
- Font objects remain embedded.
- No full-page JPEG or raster fallback is used.
- First export succeeds.
- Second consecutive export succeeds.
- `Ctrl+P` succeeds.
- `Cmd+P` succeeds.
- Save, reload, reopen, and export succeeds.
- `출력할 슬라이드를 찾지 못했습니다` does not occur.
- Navigation contains exactly 40 valid links.
- Project persistence remains functional.

## Runtime boundary

- Legacy reports use `.slide-wrapper > .slide` and the Legacy exporter.
- Phase 6 FULL reports use `.full-slide` and browser-native print.
- A FULL report must never be passed to the Legacy slide selector.
- Runtime ownership must be verified from the actual Viewer iframe, not inferred from source code alone.
- The browser shortcut and visible button must converge on the same FULL export runtime.

## Invalid shortcuts

The following are not sufficient proof of completion:

- testing only a PDF helper function;
- testing only a standalone HTML fixture;
- confirming only that a print function exists;
- confirming only that Vercel Preview builds;
- exporting only once;
- testing the button but not `Ctrl+P` and `Cmd+P`;
- skipping save/reopen verification;
- generating a separate test document that differs from the Viewer document;
- using html2canvas or full-page JPEG output for FULL reports;
- declaring success without checking page count, dimensions, fonts, and raster structure.

## Current approved report contract

- Main Deck: 40 pages
- Appendix: 0 pages
- Final page: Decision Receipt / Close
- Logical slide canvas: 1280×720
- PDF MediaBox: 960×540pt

## Completion report

Every future PDF task report must include root cause, Viewer iframe resolution path, Legacy/FULL runtime separation, changed files, commit SHA, build result, actual button E2E result, two consecutive export results, `Ctrl+P` result, `Cmd+P` result, save/reopen/export result, PDF page count and MediaBox, embedded font result, raster-image result, Preview URL, remaining risks, and merge status.

<!-- PHASE6_EXTERNAL_JSON_COMPLETION_2026-07-09 -->
## Phase 6 external-JSON PDF regression record — 2026-07-09

- Active branch: `fix/phase6-structured-report-renderer-v1`
- Draft PR: `#21 Replace Phase 6 HTML generation with app-owned structured renderer`
- Validated product-code head: `d3b2ebd104d6bfddb90ba3051f92a9710b3a2a07`
- Vercel Preview: `https://brand-consulting-git-fix-phase6-structu-0fd4b6-dpes31s-projects.vercel.app/`
- `main`: unchanged; PR #21 remains Draft and unmerged.
- `public/template.html` and protected backup branches remain untouched.

Implemented:

- Phase 6 shows the explicit five-step external-AI JSON workflow.
- The primary input accepts raw JSON, fenced JSON, `.json`, and `.txt` responses.
- `기존 완성 HTML 가져오기 — 호환용` is a separate secondary path.
- Creative History uses `[CREATIVE HISTORY DATA CONTRACT]`; AI-facing DOM/class/data-attribute instructions were removed.
- Every Creative History status field exposes the exact enum and fixed year metadata, including `2026 YTD`.
- Only exact `expected year · allowed status` values are normalized; every repair emits a page/field warning and strict validation runs afterward.
- Unknown status, mismatched year, composite status, and arbitrary values remain blocking errors with Korean page/field guidance.
- External manual JSON and internal Gemini API routes use the same ProductionReportV3 schema, normalization, strict validation, cross-page validation, and app-owned Renderer.

Validated at `d3b2ebd104d6bfddb90ba3051f92a9710b3a2a07`:

- `npm run build`: PASS
- FULL report contract test: PASS
- FULL report runtime test: PASS
- Phase 6 structured Renderer E2E: PASS
- external-AI JSON workflow synthetic fixtures: 2 complete 40-page responses PASS
- masked owner-defect fixture: `YYYY · status` normalization PASS; `2022 · unknown` blocking PASS
- HTML Sanitizer compatibility E2E: PASS
- 40 `.full-slide`, 40 navigation links, Appendix 0, 1280×720, scale(1), zero overflow, zero script, save/reload/reopen: PASS
- Export PDF twice, Ctrl+P, Cmd+P: PASS
- PDF: 40 pages, 960×540pt, embedded Pretendard, no full-page raster fallback: PASS
- Vercel Preview: Ready

External-AI verification boundary:

- Actual corrected-prompt calls were not run because this execution environment has no external Gemini/third-party AI credential or invocation tool.
- Two deterministic complete synthetic responses and the masked real defect structure were validated in browser E2E.
- Owner Preview QA with two real external-AI responses remains a pre-merge approval gate.

