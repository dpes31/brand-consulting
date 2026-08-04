# Phase 6 Lightweight HTML Timeout Mitigation — 2026-08-04

## Problem

The external AI chat repeatedly returned `메시지 전송 시간이 초과되었습니다. 다시 시도해 주세요` when the Phase 6 prompt attachment was sent.

This was treated as a product-architecture defect rather than a retry-only incident.

Measured owner file:

- previous Biznup Phase 6 prompt: 647,215 bytes
- embedded approved visual template: approximately 449,802 bytes
- Step 0–5 research: approximately 194,109 bytes

The previous external package transferred the application-owned CSS, layout, navigation, decorative DOM, and semantic authoring fields together. The external AI was then asked to return that entire visual document again. This duplicated hundreds of kilobytes that the application already owned.

## Decision

Keep the user-facing external result as HTML, but replace the large visual authoring document with a compact 40-page semantic HTML workbook.

This is not JSON and does not restore PR #21 or PR #23.

New flow:

`Step 0–5 research`
→ `compact semantic HTML prompt`
→ `external AI returns compact 40-page HTML`
→ `app validates field identity and page order`
→ `app expands values into the approved visual Renderer`
→ `existing V5 Sanitizer / DOM fingerprint / cross-page / P18 validation`
→ `Viewer / save / reopen / PDF`

## V6 compact workbook contract

Implementation: `src/report/semanticHtmlReportV6.ts`

The workbook retains:

- exactly 40 `.full-slide` sections
- approved page IDs and order
- stable `data-report-field` semantic keys
- P18 `data-report-coordinate-field` keys
- per-field compact metadata:
  - `data-k=t`: plain text
  - `data-k=r`: rich text, only `<mark>` and `<br>`
  - `data-k=s`: source
  - `data-k=c`: Creative History status
  - `data-m`: hard maximum length
  - `data-e`: allowed enum when applicable
  - `data-y`: fixed year when applicable
- `[[FIELD:semantic.key]]` authoring tokens
- `[[POSITION:semantic.key]]` P18 coordinate tokens

The workbook excludes:

- final CSS
- navigation markup
- decorative DOM
- visual layout wrappers not needed for writing
- fixed report chrome
- sample brand content

The application reconstructs the approved visual document from the returned semantic values. External DOM/CSS remains untrusted.

## Runtime integration

Updated:

- `src/lib/installFullReportPhase6Bridge.ts`
- `src/lib/geminiCompiler.ts`
- `src/report/phase6PromptPackage.ts`
- `scripts/test-full-report-contract.mjs`
- `scripts/test-full-report-runtime.mjs`
- `scripts/e2e-phase6-five-competitor-native-print.mjs`

External download filename:

`phase6_lightweight_html_prompt_<brand>.txt`

Phase 6 action label:

`완성 HTML 프롬프트 다운로드 (경량)`

The download alert displays the generated file size and states that fixed CSS, layout, and decorative DOM were excluded.

## Size evidence

Latest LG fixture evidence at commit `eb3ab64398e461b7bafaec6b834d7f1348c50a67`:

- compact prompt: 129,638 bytes
- returned compact HTML fixture: 106,997 bytes
- native PDF: 462,487 bytes

For the owner’s previous Biznup research volume, replacing the approximately 449,802-byte visual template with the compact workbook yields an estimated prompt size of approximately 292KB, about 55% smaller than the previous 647KB package.

The exact owner-project size is displayed by the app after the new prompt is downloaded.

## Validation

Latest Head: `eb3ab64398e461b7bafaec6b834d7f1348c50a67`

- Production Build / contracts: PASS
- Preview CI run `30883605720`: PASS
- Browser/PDF E2E run `30883605708`: PASS
- Vercel: success
- 40 Main pages / 0 Appendix: PASS
- compact HTML upload → approved Renderer: PASS
- User Brief / Identity Lock: PASS
- P18 labels, axes, coordinates, movement: PASS
- Creative History status normalization: PASS
- script removal and unresolved token gate: PASS
- save → reload → reopen: PASS
- Export PDF, second export, Ctrl+P, Cmd+P: PASS
- PDF 40 pages, 960×540pt: PASS

Visual evidence inspected:

- P17 Category Clichés
- P18 Positioning
- P29 Target Creative History
- P39 Final Choice
- P40 Decision Close

No clipping or overflow was observed in the inspected evidence. The fixture uses repetitive QA text and is not a content-quality approval.

## Owner test protocol

1. Open the latest branch Preview and hard-refresh.
2. In Phase 6 click `완성 HTML 프롬프트 다운로드 (경량)`.
3. Confirm the filename starts with `phase6_lightweight_html_prompt_`.
4. Use a new external AI chat; do not reuse the chat that repeatedly timed out with the old attachment.
5. Attach the new file and paste the automatically copied execution sentence.
6. Send once and wait for the compact 40-page HTML result.
7. Upload the returned `.html` file into Phase 6.
8. Validate Viewer, save/reopen, and PDF.

Do not use the old `phase6_complete_html_prompt_...` or prior large prompt file.

## Remaining risk and fallback

The compact package materially reduces the application-controlled payload, but the external AI platform’s own attachment-processing limits remain outside this repository.

If the newly downloaded compact file still times out in a new chat, preserve that exact file and error evidence. The next fallback is a multi-batch semantic HTML workflow with deterministic application-side merge. That fallback is not implemented or approved in the current branch.

## Merge gate

PR #24 remains Draft and unmerged. Do not merge to `main` until the owner confirms that the newly downloaded compact prompt sends successfully and the returned HTML completes the actual Phase 6 round trip.
