# Phase 6 Lightweight HTML Timeout Mitigation — REJECTED AUDIT

## Status

**REJECTED on 2026-08-04 after owner round-trip testing.**

Do not restore this implementation as an active Phase 6 path.

## Original problem

The owner’s Phase 6 attachment repeatedly produced `메시지 전송 시간이 초과되었습니다. 다시 시도해 주세요` in an external AI chat.

Measured previous Biznup package:

- total prompt: 647,215 bytes
- fixed visual template: approximately 449,802 bytes
- Step 0–5 research: approximately 194,109 bytes

## Rejected experiment

The V6 experiment reduced payload by removing application-owned visual assets from the external artifact:

- final CSS
- 1280×720 visual page wrappers
- navigation
- tables and diagrams
- decorative DOM and report chrome

The external AI returned a compact 40-section semantic workbook. The app was expected to expand it into the approved Renderer later.

Implementation identifiers:

- `src/report/semanticHtmlReportV6.ts`
- `createSemanticHtmlWorkbookV6`
- `buildSemanticHtmlPromptV6`
- `compileSemanticHtmlReportV6`
- `phase6_lightweight_html_prompt_<brand>.txt`
- `완성 HTML 프롬프트 다운로드 (경량)`

## Owner test result

The uploaded result `LG_퓨리케어_40페이지_전략리포트.html` was not a finished report.

Observed:

- 40 `.full-slide` sections
- 757 semantic fields
- CSS: 0
- navigation: 0
- tables: 0
- SVG/images: 0
- approved report format absent
- P25 repeated one sentence across 17 fields
- `UNVERIFIED` repeated across Creative History status fields
- raw URLs exposed

The file was an authoring workbook with an `.html` extension, not the owner-approved visual artifact.

## Final decision

The active Phase 6 path is restored to V5 complete styled HTML:

`Step 0–5 research`
→ `phase6_complete_html_prompt_<brand>.txt`
→ `external AI returns one complete styled 40-page HTML`
→ `paste/upload`
→ `security / identity / semantic / DOM / cross-page / P18 validation`
→ `approved DOM reassembly`
→ `Viewer / save / reopen / PDF`

The external file must preserve:

- approved CSS
- 1280×720 page DOM
- visual hierarchy
- tables and diagrams
- navigation
- classes, IDs, and data attributes

It must open directly as the approved report, not as a field list.

## Current technical state

Validated code head before documentation updates:

`351c4247c4a9bf713955985c8963d2ddb0eb4257`

Validation:

- Production Build / Preview CI: PASS
- LG browser/PDF E2E: PASS
- 40 Main pages / 0 Appendix: PASS
- Viewer / save / reopen / native PDF: PASS
- active V6 imports in external and internal Phase 6 paths: removed
- static tests reject active lightweight-workbook references
- raw URLs: blocking validation
- Creative History noncanonical status: blocking validation
- repeated generic field content: explicit prompt-level blocker

## Unresolved timeout

Restoring the correct visual contract restores the larger prompt. Therefore the original external-chat timeout is **not solved** by this correction.

Do not claim otherwise.

A deterministic multi-batch workflow may be considered, but it changes the user journey and must be explicitly approved before implementation. Any future design must preserve the complete visual report contract and must not relabel a content workbook as a finished HTML report.

## Merge gate

PR #24 remains Draft and unmerged. Do not merge to `main` until:

1. the owner approves the restored complete-report Preview flow; and
2. an approved timeout strategy completes a real external-AI round trip without losing the report format.
