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

## 2026-07-20 to 2026-08-03 — Architecture audit

- Audited PR #4 through PR #23 and owner-supplied prompts/results.
- Confirmed JSON was introduced, corrected back to HTML, and later reintroduced.
- Identified PR #21 and PR #23 as JSON-only external workflow failures.
- Confirmed owner had already locked complete standalone HTML output.
- Identified DOM text-order `CONTENT SLOT` mapping as the content-mixing root cause.
- Retained PR #21–#23 as audit records and prohibited merging them.

## 2026-08-03 to 2026-08-04 — PR #24 semantic HTML restoration

- Created `fix/phase6-main40-final-html-semantic-v5` and PR #24.
- Restored Step 0–5 research → complete HTML prompt → external AI complete 40-page HTML → validation → approved-DOM reassembly → Viewer → persistence → PDF.
- Removed JSON-only external instructions.
- Replaced text-order slots with stable `data-report-field` keys.
- Added semantic-field-set, DOM fingerprint, cross-page, security, and P18 coordinate validation.
- Added User Brief, Report Identity Lock, sample leakage blocking, executable attachment package, and `.html/.htm/.txt` upload.
- Rejected the V6 lightweight semantic workbook after owner testing showed a field-list artifact without approved visual format.
- Restored V5 complete styled HTML as the active contract.

## 2026-08-04 — PR #24 completed and merged

- PR #24 was later owner-approved and merged to `main` with preserved history.
- Current production baseline after PR #24: `d45d7f16b4d5f305d10e28b8f80a158c7073c37b`.
- Known P18/P29 parity items remained tracked for later hardening.

## 2026-08-18 to 2026-08-21 — PR #26 real Coway output hardening

### Trigger

A real Coway external-AI 40-page HTML exposed defects that synthetic tests had not fully covered:

- rich SO WHAT fields used `<b>` although the contract allowed only `<mark>/<br>`;
- Persona target identity could drift across P21 → P22–24;
- Persona Brand Role and SO WHAT could duplicate the same sentence;
- P18 still had legacy fixed-arrow ownership conflicts;
- P29 target-brand Creative History breadcrumb could remain `COMPETITOR HISTORY` in raw external HTML;
- P12 Threat Ranking score cells could contain out-of-range values or prose instead of numeric scores;
- the approved P4 FACTS flow contained a fixed `?` connector that survived into PDF.

### Branch / PR

- Created/continued `fix/phase6-coway-real-output-validation-v1`.
- Draft PR #26: `Harden Phase 6 real HTML validation and PDF parity`.
- Kept `main` untouched during correction.

### Validation architecture correction

- Changed relevant validation from first-error fail-fast to collect multiple blocking errors where practical.
- Added safe normalization of `<b>/<strong>` in rich fields to `<mark>`.
- Kept unsupported rich tags blocking.
- Added actual Coway external-AI output regression fixtures rather than relying only on synthetic token filling.
- Preserved the approved DOM fingerprint and app-owned reassembly model.

### P12 Threat Ranking correction

Locked score semantics:

- penetration 0–25
- growth 0–20
- preference 0–20
- campaign 0–15
- inflection 0–15
- evidence 0–5
- total exact sum, 0–100

Prompt and validator now agree that `evidence` is a 0–5 evidence-confidence score, not evidence prose.

### Persona correction

- P22 / P23 / P24 must analyze P21 target 1 / 2 / 3 respectively.
- Conclusion-led Persona titles are allowed.
- Target 4/5 substitution remains blocking.
- Added Brand Role ↔ SO WHAT duplication detection.

### P18 / P29 correction

- Removed legacy fixed `positioning-arrow-v2` overlay.
- P18 now uses one app-owned `.map-arrow-vector` bound to semantic AS-IS/TO-BE coordinates.
- P29 target-brand breadcrumb is normalized to `IV. CREATIVE > TARGET BRAND HISTORY`.
- DOM fingerprint handling treats app-owned P18 vector consistently.

### P4 fixed connector correction

Owner PDF inspection found:

`계정 → 매출 → 해외 ? 비렉스`

This was a fixed template/runtime defect, not an external-AI semantic-field error.

Implemented normalization to:

`계정 → 매출 → 해외 → 비렉스`

The correction applies to:

- approved Pilot runtime;
- sanitized/cached approved base;
- external HTML normalization before compile;
- final identity/presentation policy.

Added `scripts/e2e-phase6-p4-kpi-arrow.mjs` to verify current runtime and legacy `?` auto-repair paths.

### Real Coway owner round-trip

The owner reused the same Step 0–5 research, generated a new HTML from the latest Phase 6 prompt, uploaded it to Preview, opened Viewer, and exported PDF.

Verified:

- exactly 40 pages;
- 757 semantic fields, duplicate 0;
- unresolved token 0;
- `.contentN` 0;
- P12 LG전자 92 / 쿠쿠홈시스 83 / 삼성전자 80 with valid score ranges/totals;
- P21 → P22–24 Persona mapping correct;
- P18 single semantic coordinate-linked connector;
- P29 final Viewer/PDF target breadcrumb correct;
- PDF 40 pages / 960×540pt / Pretendard.

After P4 correction, the owner re-uploaded the exact same HTML and confirmed all three requested checks:

1. Viewer opened without a blocking validation error.
2. P4 Viewer displayed `계정 → 매출 → 해외 → 비렉스`.
3. P4 PDF displayed the same flow.

### Automated evidence at implementation head `88d64a4ea6801479e78c54879b81b9234e331355`

- Phase 6 Color Correction Preview CI `32437175392`: PASS
- Phase 6 PDF Runtime E2E `32437175313`: PASS
- actual Coway external fixture: PASS
- latest Coway semantic fixture: PASS
- synthetic semantic regression: PASS
- P4 runtime / cached legacy base / legacy external HTML repair: PASS
- Viewer save → reload → reopen: PASS
- repeated PDF export: PASS
- Ctrl+P / Cmd+P: PASS
- PDF 40 pages / 960×540pt / embedded Pretendard: PASS
- Vercel Preview: Ready

### Current state after owner validation

- PR #26 is technically and user-validated.
- Documentation is being updated on the PR branch before merge approval.
- PR remains Draft and unmerged until final documentation CI is green and the owner explicitly approves `main` merge.
- `main`, `public/template.html`, and protected backup branches remain unchanged.
