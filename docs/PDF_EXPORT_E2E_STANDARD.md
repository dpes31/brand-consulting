# PDF Export E2E Standard

## Permanent rule

Every future PDF-related change in this repository must be validated through the actual application user journey, not only through PDF helper code or a standalone test document.

## Required E2E path

1. Open the actual application route.
2. Create or reopen a real Phase 6 FULL report.
3. Click the visible `Export PDF` button.
4. Verify that the button resolves the active Viewer iframe.
5. Verify exactly 48 `.full-slide` pages: 40 Main Deck + 8 Appendix.
6. Run blocking preflight before print.
7. Use the FULL browser-native print runtime, never the Legacy selector or raster exporter.
8. Complete a first export.
9. Complete a second consecutive export without reloading.
10. Save the project, reload the app, reopen the report, and export again from the same visible button.

## Acceptance criteria

- Actual app `Export PDF` button is clicked by browser E2E.
- Active Viewer iframe is found.
- Exactly 48 pages are present.
- Every page remains 1280×720.
- PDF MediaBox is 960×540pt.
- No clipping or body overflow occurs.
- Viewer and PDF use the same report HTML.
- Font objects remain embedded.
- No full-page JPEG or raster fallback is used.
- First export succeeds.
- Second consecutive export succeeds.
- Save, reload, reopen, and export succeeds.
- `출력할 슬라이드를 찾지 못했습니다` does not occur.
- Navigation and project persistence remain functional.

## Runtime boundary

- Legacy reports use `.slide-wrapper > .slide` and the Legacy exporter.
- Phase 6 FULL reports use `.full-slide` and browser-native print.
- A FULL report must never be passed to the Legacy slide selector.
- Runtime ownership must be verified from the actual Viewer iframe, not inferred from source code alone.

## Invalid shortcuts

The following are not sufficient proof of completion:

- testing only a PDF helper function;
- testing only a standalone HTML fixture;
- confirming only that a print function exists;
- confirming only that Vercel Preview builds;
- exporting only once;
- skipping save/reopen verification;
- generating a separate test document that differs from the Viewer document;
- using html2canvas or full-page JPEG output for FULL reports;
- declaring success without checking page count, dimensions, fonts, and raster structure.

## Completion report

Every future PDF task report must include root cause, Viewer iframe resolution path, Legacy/FULL runtime separation, changed files, commit SHA, build result, actual button E2E result, two consecutive export results, save/reopen/export result, PDF page count and MediaBox, embedded font result, raster-image result, Preview URL, remaining risks, and merge status.
