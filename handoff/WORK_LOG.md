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
- Restored:
  - Step 0–5 research
  - complete HTML prompt download
  - external AI complete 40-page HTML
  - app validation and approved-DOM reassembly
  - Viewer / save / reopen / PDF
- Removed JSON-only external instructions.
- Moved Step 0–5 research before the large HTML template.
- Replaced text-order slots with stable `data-report-field` keys.
- Added exact semantic-field-set, DOM fingerprint, cross-page, and security validation.
- Added P18 semantic axes and ten coordinate values.
- Added `<mark>` rich text contract and literal `[[...]]` rejection.
- Added Creative History status normalization.
- Hid explicit unused candidate rows.
- Validated 40 pages, 40 navigation links, Appendix 0, PDF, persistence, and visual evidence.

## 2026-08-04 — User Brief / Identity / upload correction

### Owner-reported issues

- External AI sometimes treated the Phase 6 prompt as a passive attachment.
- First output could contain instructions, research, and HTML in one contaminated file.
- Large HTML copying was too slow; file upload was needed.
- Strategy Settings mixed company competitors and `위생이라는 단어 자체`.
- Client need and reference guidance were not a durable project contract.
- Target brand and competitor names diverged across P14, P16, P18, P29–33.
- `삼성전자` and `삼성 비스포크 정수기` required alias normalization.
- Non-Biznup reports retained `BIZNUP` and `비즈넵 기회`.

### User Brief Lock

- Added `src/lib/userBriefContract.ts`.
- Added brand-keyed persistence for target brand, review seeds, strategic opponent, client need, reference note, and attachment manifest.
- Injected User Brief into every Step 0–5 prompt and Phase 6.
- Added a separate strategic-opponent field and automatic mixed-input separation.
- Added `src/lib/installUserBriefInputNormalizer.ts` for immediate React/UI synchronization.

### Report Identity Lock

- Added `src/report/reportIdentityLock.ts`.
- App now owns target brand, core-three order, canonical names, display names, aliases, and Landscape candidates.
- Applied identity to P11, P12, P13–16, P18, P29–33.
- Merged Samsung parent/product aliases as one entity.
- Corrected target alias drift such as `LG전자` back to `LG 퓨리케어 정수기`.

### Sample leakage prevention

- Cover `BIZNUP` → `BRAND REPORT`.
- P25 `비즈넵 기회` → `브랜드 기회`.
- Persona role label, navigation, toolbar, title, and errors use the exact target brand.
- Added blocking gates for unapproved sample text.

### External AI execution package and HTML upload

- Added `src/report/phase6PromptPackage.ts`.
- Added an automatically copied chat-level execution message.
- Standardized output to raw HTML only from `<!DOCTYPE html>` through `</html>`.
- Added `.html/.htm/.txt` upload, maximum 20MB.
- Upload and paste share one Sanitizer, Identity, semantic, Viewer, save, and PDF path.
- Updated `src/lib/geminiCompiler.ts` for internal API parity.

### Initial LG 퓨리케어 validation

- Target: `LG 퓨리케어 정수기`.
- Seeds: 코웨이 / 삼성 비스포크 정수기 / SK매직 / 쿠쿠.
- Registry core: 코웨이 / 삼성전자 / SK매직.
- Strategic opponent: `위생이라는 단어 자체`.
- Client need: `위생의 격이 다른 정수기`.
- Validated file upload, identity correction, no sample leakage, 40 pages, PDF, and persistence.

### Cleanup

- Removed duplicate inactive implementations:
  - `src/lib/installPhase6HtmlUpload.ts`
  - `src/lib/installUserBriefLock.ts`
  - `src/lib/reportIdentityLock.ts`
  - `src/lib/userBriefLock.ts`

## 2026-08-04 — Phase 6 external-message timeout mitigation

### Reproduction and measurement

Owner repeatedly received `메시지 전송 시간이 초과되었습니다. 다시 시도해 주세요` when sending the downloaded Phase 6 prompt to an external AI chat.

Measured previous owner Biznup prompt:

- total file: 647,215 bytes
- fixed visual template: approximately 449,802 bytes
- Step 0–5 research: approximately 194,109 bytes

The package duplicated application-owned CSS, layout, navigation, decorative DOM, and fixed report chrome. Retrying the same file was not considered a sufficient correction.

### V6 compact semantic HTML workbook

- Added `src/report/semanticHtmlReportV6.ts`.
- Kept external output as HTML, not JSON.
- Replaced the full visual template in the attachment with exactly 40 compact semantic page sections.
- Retained:
  - approved page IDs and order
  - stable `data-report-field` keys
  - compact `data-k`, `data-m`, optional `data-e`, `data-y`
  - P18 coordinate fields
  - `[[FIELD:semantic.key]]` and `[[POSITION:semantic.key]]` tokens
- Removed from external transfer:
  - final CSS
  - navigation markup
  - decorative DOM
  - fixed layout wrappers not needed for writing
  - sample brand content
- `compileSemanticHtmlReportV6` expands returned values into the approved V5 visual semantic template, then runs the existing V5 sanitizer, DOM fingerprint, cross-page, Identity, and P18 validation chain.

### Runtime conversion

Updated:

- `src/lib/installFullReportPhase6Bridge.ts`
- `src/lib/geminiCompiler.ts`
- `src/report/phase6PromptPackage.ts`
- `scripts/test-full-report-contract.mjs`
- `scripts/test-full-report-runtime.mjs`
- `scripts/e2e-phase6-five-competitor-native-print.mjs`

New user-facing artifacts:

- action: `완성 HTML 프롬프트 다운로드 (경량)`
- filename: `phase6_lightweight_html_prompt_<brand>.txt`
- download alert displays generated KB and explains removed fixed visual payload.

### Size results

At implementation head `eb3ab64398e461b7bafaec6b834d7f1348c50a67`:

- LG fixture prompt: 129,638 bytes
- LG returned compact HTML fixture: 106,997 bytes
- native PDF: 462,487 bytes
- estimated same-volume Biznup prompt: approximately 292KB
- estimated reduction versus previous 647KB prompt: about 55%

### Final validation

- Preview CI run `30883605720`: PASS
- PDF Runtime E2E run `30883605708`: PASS
- Vercel: success
- compact HTML upload → approved visual Renderer: PASS
- 40 pages / 40 navigation links / Appendix 0: PASS
- User Brief / Identity / alias correction: PASS
- sample leakage: 0
- unresolved tokens: 0
- script removal: PASS
- P18 axes, labels, coordinates, movement: PASS
- Creative History status normalization: PASS
- 1280×720 and overflow 0: PASS
- PDF 40 pages, 960×540pt: PASS
- repeated export, Ctrl+P, Cmd+P, save/reopen: PASS

Visual evidence inspected:

- P17 Category Clichés
- P18 Positioning
- P29 Creative History
- P39 Final Choice
- P40 Decision Close

No clipping or overflow was observed in the inspected evidence. Repetitive fixture text is not content-quality approval.

### Current gate

- Draft PR #24 remains open and unmerged.
- Preview: `https://brand-consulting-git-fix-phase6-main40-c77bea-dpes31s-projects.vercel.app/`
- Owner must download the new compact prompt, use a new external AI chat, complete the return-HTML import, and explicitly approve before merge.
- If the compact prompt still times out, preserve the exact file and error. Deterministic page-batch merge is the next fallback but is not implemented or approved.
