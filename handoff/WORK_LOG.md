# Work Log

## 2026-06-22 — Production freeze

- Established Preview-first development.
- Preserved `backup-production-stable-20260622`.
- Prohibited direct destructive production work.

## 2026-06-23 to 2026-06-30 — Research contracts and FULL reference

- Added competitor Registry, Creative History factuality, and Visual Intent contracts.
- Rejected heuristic visualization engine PR #6 after audit.
- Validated:
  - Step 0 `milestone-timeline`
  - Step 2 `rank-scorecard` and `feature-matrix`
  - Step 3 `friction-flow`
  - Step 5 `choice-architecture`
- Built and iterated the 40 Main + 8 Appendix FULL reference in PR #11.
- Added Pretendard, 1280×720, keep-all Korean wrapping, semantic highlighting, and report visual QA.

## 2026-07-01 — Production consolidation

- Created `backup/main-before-full-report-v1-2026-07-01`.
- Consolidated valid Phase 1–4 and Gate 2A work.
- Excluded PR #6 and discarded PR #8–#10 implementations.
- Preserved Legacy `public/template.html`.

## 2026-07-06 to 2026-07-07 — Phase 6 integration and PDF runtime

- Connected approved FULL report structure to normal `/` Phase 6.
- Introduced the first neutral content-slot method.
- Added multi-competitor handling, Creative History, save/reopen, Viewer, and PDF.
- Fixed Material Symbols first-paint flash.
- Separated Legacy and FULL PDF runtime ownership.
- Routed Export PDF, Ctrl+P, and Cmd+P to native FULL printing.
- PR #17 merged to `main` at `96f12ac5bde92a53a97a12ea01ae9c3db921c7fe`.

## 2026-07-07 — Main40 contract

- Replaced historical 40+8 output with exactly 40 Main pages and zero Appendix.
- Promoted Decision Receipt / Close to P40.
- Restored Competitive Landscape, Category Clichés, and Creative Insight.
- Defined candidate-five to core-three competitor logic.
- Restored fixed page grammar for Persona, AIPL, Creative History, STP, Four Directions, and Final Choice.
- Validated 40 pages, native PDF, save/reopen, and zero overflow on the superseded PR #20 line.

## 2026-07-20 to 2026-08-03 — Architecture audit

- Audited PR #4 through PR #23 and owner-supplied prompts/results.
- Confirmed JSON was introduced, corrected back to HTML, and later reintroduced.
- Identified PR #21 and PR #23 as JSON-only external workflow failures.
- Confirmed owner had already locked complete standalone HTML output.
- Identified DOM text-order `CONTENT SLOT` mapping as the content-mixing root cause.
- Retained PR #21–#23 as audit records and prohibited merging them.

## 2026-08-03 — PR #24 semantic HTML restoration

- Created `fix/phase6-main40-final-html-semantic-v5` and Draft PR #24.
- Restored Step 0–5 research, complete HTML prompt download, external AI complete 40-page HTML, validation, approved-DOM reassembly, Viewer, persistence, and PDF.
- Removed JSON-only external instructions.
- Moved Step 0–5 research before the large HTML template.
- Replaced text-order slots with stable `data-report-field` keys.
- Added semantic-field-set, DOM fingerprint, cross-page, security, and P18 coordinate validation.
- Added `<mark>` rich text contract, literal token rejection, Creative History normalization, and unused candidate row hiding.

## 2026-08-04 — User Brief / Identity / upload correction

- Added persistent User Brief for target brand, review seeds, strategic opponent, client need, reference note, and attachments.
- Injected Brief into every Step 0–5 prompt and Phase 6.
- Added strategic-opponent separation and immediate UI normalization.
- Added Report Identity Lock across P11–18 and P29–33.
- Added Samsung alias canonicalization and exact target-brand correction.
- Neutralized Biznup sample content and added sample leakage blocking.
- Added executable attachment package and raw-HTML-only output contract.
- Added `.html/.htm/.txt` upload up to 20MB using the same validation path as paste.
- Updated internal API for Brief and Identity parity.
- Removed duplicate inactive implementations.

## 2026-08-04 — External-message timeout experiment

### Reproduction

- Owner repeatedly received `메시지 전송 시간이 초과되었습니다. 다시 시도해 주세요`.
- Measured owner Biznup prompt: 647,215 bytes.
- Fixed visual template: approximately 449,802 bytes.
- Step 0–5 research: approximately 194,109 bytes.

### V6 lightweight workbook attempt

- Added `src/report/semanticHtmlReportV6.ts`.
- Removed final CSS, navigation, visual wrappers, tables, diagrams, and decorative DOM from the external attachment.
- Kept 40 page sections, semantic fields, compact metadata, and P18 coordinates.
- Intended app-side expansion into the approved V5 Renderer.
- Reduced LG fixture prompt to 129,638 bytes.
- Automated Renderer/PDF tests passed because the app expanded the workbook after import.

### Owner round-trip failure

The owner’s external AI returned `LG_퓨리케어_40페이지_전략리포트.html`.

Direct inspection found:

- 40 sections and 757 semantic fields
- CSS 0
- navigation 0
- tables 0
- SVG/images 0
- approved report format absent
- P25 same sentence repeated across 17 fields
- `UNVERIFIED` repeated across 24 status fields
- repeated generic source wording
- raw URLs exposed

The experiment solved payload size by deleting the artifact the owner expected. It was therefore rejected.

## 2026-08-04 — V5 complete styled HTML restoration

### Code restoration

- Restored `src/lib/installFullReportPhase6Bridge.ts` to:
  - `createSemanticHtmlTemplateV5`
  - `buildSemanticHtmlPromptV5`
  - `compileSemanticHtmlReportV5`
- Restored filename `phase6_complete_html_prompt_<brand>.txt`.
- Removed active `경량` labels and workbook instructions.
- Restored internal `src/lib/geminiCompiler.ts` to the same V5 complete styled HTML contract.
- Updated static/runtime contract tests so active V6 workbook references fail CI.
- Strengthened `src/report/phase6PromptPackage.ts` with:
  - Visual Artifact Lock
  - CSS/layout/diagram/table/navigation preservation
  - data-workbook prohibition
  - duplicate generic content prohibition
  - P25 role separation
  - canonical Creative History statuses
  - raw URL and fabrication prohibition
- Added objective runtime blocking for raw URLs and noncanonical Creative History status values.

### Validation

Validated implementation head before documentation updates:

`351c4247c4a9bf713955985c8963d2ddb0eb4257`

- Preview CI run `30888643138`: PASS
- PDF Runtime E2E run `30888643175`: PASS
- complete styled prompt fixture: approximately 493KB
- generated styled HTML fixture: approximately 470KB
- CSS/style structures present
- navigation present
- tables and diagrams present
- 40 pages / 40 navigation links / Appendix 0: PASS
- Viewer / save / reopen / repeated PDF export: PASS
- PDF: 40 pages, 960×540pt: PASS

### Current truth

- The approved report format is restored.
- The V6 lightweight workbook is rejected and must not be reactivated.
- The original large-attachment timeout is not solved.
- A page-batch generation/merge workflow would change the user journey and is not implemented or approved.
- PR #24 remains Draft and unmerged.
- `main`, Legacy template, and protected backup branches remain unchanged.
