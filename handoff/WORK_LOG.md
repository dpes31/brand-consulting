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
- Added brand-keyed persistence for:
  - target brand
  - mandatory review seeds
  - strategic opponent/category convention
  - client need/campaign direction
  - reference note
  - attachment manifest
- Injected User Brief into every Step 0–5 prompt and Phase 6.
- Added a separate strategic-opponent field.
- Added automatic mixed-input separation.
- Added `src/lib/installUserBriefInputNormalizer.ts` for immediate React/UI synchronization.

### Report Identity Lock

- Added `src/report/reportIdentityLock.ts`.
- App now owns target brand, core-three order, canonical names, display names, aliases, and Landscape candidates.
- Applied identity to P11, P12, P13–16, P18, P29–33.
- Merged Samsung parent/product aliases as one entity.
- Corrected target alias drift such as `LG전자` back to the exact target `LG 퓨리케어 정수기`.

### Sample leakage prevention

- Cover `BIZNUP` → `BRAND REPORT`.
- P25 `비즈넵 기회` → `브랜드 기회`.
- Persona role label → exact target brand.
- Navigation, toolbar, and title → exact target brand.
- Hardcoded brand error copy → current target brand.
- Added a blocking gate for unapproved Biznup and sample-competitor text.

### External AI execution package

- Added `src/report/phase6PromptPackage.ts`.
- Added an automatically copied chat-level execution message.
- Added explicit User Brief, Identity, compiler, research, and template boundaries.
- Standardized output to raw HTML only:
  - first bytes `<!DOCTYPE html>`
  - last bytes `</html>`
  - no Markdown fences
  - no instruction/research contamination outside the report

### HTML file upload

- Added `.html/.htm/.txt` upload, maximum 20MB.
- File content is loaded into the existing controlled textarea.
- Upload and paste share exactly one Sanitizer, Identity, semantic, Viewer, save, and PDF path.

### Internal API parity

- Updated `src/lib/geminiCompiler.ts` so internal Gemini compilation uses the same User Brief and Identity locks as the external workflow.

### LG 퓨리케어 E2E

Updated `scripts/e2e-phase6-five-competitor-native-print.mjs` to use:

- target `LG 퓨리케어 정수기`
- seeds 코웨이 / 삼성 비스포크 정수기 / SK매직 / 쿠쿠
- Registry core 코웨이 / 삼성전자 / SK매직
- strategic opponent `위생이라는 단어 자체`
- client need `위생의 격이 다른 정수기`
- reference guidance on large-appliance advertising grammar

The simulated external HTML deliberately contained:

- target alias `LG전자`
- competitor alias `삼성 비스포크 정수기`
- unsafe script
- humanized Creative History status
- brandless P18 labels
- custom P18 coordinates

### Final validated results before documentation cleanup

- Implementation head: `3f8b42952a7508669be0b3fd88a0db12e15a85cf`
- Production build/contracts: PASS
- Phase 6 PDF Runtime E2E run `30881036785`: PASS
- Phase 6 Preview CI run `30881036772`: PASS
- Vercel: success
- HTML file upload: PASS
- User Brief in prompt: PASS
- strategic opponent separation: PASS
- exact P16/P29/P33 target identity: PASS
- core-three P12–18/P30–33: PASS
- Samsung alias canonicalization: PASS
- unapproved sample leakage: 0
- unresolved `[[...]]`: 0
- scripts: 0
- pages/navigation: 40/40
- Appendix: 0
- logical geometry: 1280×720
- overflow: 0
- P18 axes/coordinates: PASS
- PDF: 40 pages, 960×540pt
- repeat Export PDF / Ctrl+P / Cmd+P: PASS
- save → reload → reopen: PASS

### Cleanup

- Removed four duplicate inactive implementations that could have caused future contract divergence:
  - `src/lib/installPhase6HtmlUpload.ts`
  - `src/lib/installUserBriefLock.ts`
  - `src/lib/reportIdentityLock.ts`
  - `src/lib/userBriefLock.ts`
- Kept one active implementation path only.

### Current gate

- Draft PR #24 remains open and unmerged.
- Preview: `https://brand-consulting-git-fix-phase6-main40-c77bea-dpes31s-projects.vercel.app/`
- Owner Preview test and explicit approval are required before merge.
