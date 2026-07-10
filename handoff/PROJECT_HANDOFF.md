# Brand Consulting Generator — Project Handoff

## Current checkpoint

- Repository: `dpes31/brand-consulting`
- Production branch: `main`
- Production commit before this PR: `e22de49396a1ccb3590c5d7eb751b4d0edf759fc`
- Active branch: `fix/phase6-pdf-export-runtime-v1`
- Draft PR: #17 `Fix Phase 6 PDF export runtime routing`
- Production URL: `https://brand-consulting.vercel.app/`
- Preview URL: `https://brand-consulting-git-fix-phase6-pdf-exp-e3547f-dpes31s-projects.vercel.app/`
- Preview-first only; do not merge PR #17 without explicit owner approval.
- Immutable rollback branches:
  - `backup/main-before-full-report-v1-2026-07-01`
  - `backup-production-stable-20260622`
- `public/template.html` remains the legacy rollback asset. Verified blob SHA: `22bc6937b3d672e063d4b240c5a39b9c61700fec`.

## Current Phase 6 architecture

The normal `/` application flow is:

`Step 0–5 research`
→ `approved Pilot DOM/CSS capture after Page Plan V2 is ready`
→ `sample report text neutralized into CONTENT SLOT tokens`
→ `external AI or internal API fills every slot from current research`
→ `blocking validation`
→ `48-page standalone HTML`
→ `Viewer / save / reopen / Export PDF`

The approved Pilot is a layout source only. Its Biznup conclusions, figures, competitors, personas, Creative History, sources, SWOT, STP, and strategy are removed before the Phase 6 prompt is exported.

## Fixed report contract

- Main Deck: exactly 40 pages
- Appendix: exactly 8 pages
- Total: exactly 48 pages
- Canvas: 1280×720, exact 16:9
- Typeface: Pretendard
- Major titles: weight 900
- Korean copy: `word-break: keep-all`
- Exact user-entered brand name; no translation or romanization
- Raw URLs are not exposed
- Unverified advertising copy is not quoted

## Five-competitor Page Plan V2

Step 2 selects 2–5 direct competitors. Five is maximum capacity and must never be filled through invention.

Main Deck:

- 11: Threat Ranking, up to five direct competitors
- 12–16: Deep Dive 1–5
- 17: Product Matrix, target + up to five competitors
- 18: Positioning, target + up to five competitors
- 19–28: Consumer
- 29: Target Brand Creative History
- 30–34: Competitor Creative History 1–5
- 35: Message Trajectory, target + up to five competitors
- 36–40: SWOT, Root Cause, STP, Four Directions, Final Choice

Appendix:

- A1: Appendix divider
- A2: Winning Move Specification
- A3: Via Negativa
- A4: Pre-mortem
- A5: Execution Roadmap
- A6: Measurement Plan
- A7: Evidence Gaps + Source Labels
- A8: Decision Receipt / Close

Appendix is not competitor overflow. If fewer than five direct competitors are supported, unused approved competitor pages disclose evidence gaps.

## PR #17 — PDF error root cause

The actual app showed:

`PDF 생성 오류 — 출력할 슬라이드를 찾지 못했습니다.`

Confirmed cause:

1. The legacy iframe layout/PDF runtime installed before the FULL report runtime.
2. The legacy runtime replaced `iframe.contentWindow.print()` with a raster exporter that searches only `.slide-wrapper > .slide`.
3. The FULL runtime then captured that already-overridden function as if it were browser-native print.
4. Phase 6 FULL reports use `.full-slide`, so the legacy exporter found zero slides.

## PR #17 correction

- Install `installFullReportRuntimeCompatibility()` before the legacy `installIframeLayoutSafety()` guard.
- On a FULL document, mark the legacy layout/PDF runtime as already handled.
- Retain the real browser-native print function from `window.print` or the legacy native backup.
- Route every host `Export PDF` button to:
  1. the active fullscreen FULL report iframe;
  2. another active FULL report iframe;
  3. a stable offscreen iframe rebuilt from retained FULL HTML.
- Prevent the React button handler and legacy exporter from also firing.
- When no FULL report exists, show a clear instruction instead of a zero-slide error.
- Disable the clicked button while export is being prepared, then restore it.

## PDF runtime boundary

Two report systems coexist and must remain separated:

- Legacy reports: `.slide-wrapper > .slide`, handled by `installIframeLayoutSafety` and `exportReportPdf`.
- Phase 6 FULL reports: `.full-slide`, handled by `installFullReportRuntimeCompatibility` and browser-native print.

A FULL report must never be passed to the legacy slide selector.

## PR #17 verification

Automated build and browser tests passed:

- Production build and report contracts: PASS
- Actual app `Export PDF` button with no report: clear guidance, no zero-slide error
- Actual app `Export PDF` button with a 48-page FULL report: PASS
- Two consecutive native-print invocations: PASS
- FULL runtime ownership: PASS
- Legacy runtime did not override FULL print: PASS
- 48-page preflight: PASS
- Five-competitor Phase 6 regression: PASS
- 48 navigation links: PASS
- 1280×720 geometry and zero overflow: PASS
- Save/reopen: 48 pages PASS
- Native PDF: 48 pages, 960×540pt, embedded fonts, zero full-page raster rows
- Vercel Preview: Ready

## Blocking validation

Phase 6 rejects results when:

- any `CONTENT SLOT` remains unresolved;
- the report does not contain exactly 48 `.full-slide` pages;
- Main/Appendix count is not 40/8;
- page IDs or labels are missing or duplicated;
- required approved layouts are missing;
- the exact user-entered brand name is absent;
- Step 0 KPI evidence is insufficient;
- any selected Step 2 direct competitor is missing;
- an unapproved script is included.

## Validated Step contracts

### Step 0

- Exactly one Growth Story Visual Intent Brief
- Accepted recipe: `milestone-timeline`
- Three accepted runs: 100% agreement

### Step 2

- Threat Ranking: `rank-scorecard`
- 2–5 direct competitors selected through Registry/Threat Ranking
- Independent Deep Dive per selected competitor
- Product Matrix: `feature-matrix`
- Positioning Map only when common axes are defensible
- Independent six-year Creative History per selected competitor

### Step 3

- Trends, Persona, Identity Alignment, JTBD, AIPL, and Unmet Needs remain
- Exactly one core consumer-decision Brief
- Accepted recipe: `friction-flow`
- `implementationStatus: planned`
- `metrics: []`

### Step 5

- SWOT, GAP, Root Cause, three ToT routes, Big IdeaL, Winning Move, Via Negativa, Pre-mortem, and execution sequence remain
- Exactly one final strategy-decision Brief
- Accepted recipe: `choice-architecture`
- `implementationStatus: planned`
- `metrics: []`

## Creative History factuality

- Target brand and every selected competitor retain independent 2021–2026 pages.
- Allowed statuses:
  - `verified-verbatim`
  - `source-found-copy-unverified`
  - `not-found`
- Only verified-verbatim copy may use quotation marks.
- Message Trajectory and Strategic So What remain mandatory.

## Excluded experiments

- `feature-visualization-engine-v1` / PR #6: failed audit implementation; never merge
- PR #8, #9, #10: superseded experiments; never restore

## PHASE6_APPROVED_HTML_CURRENT_2026_07_10 — 최신 우선 기준

- 최신 작업 브랜치: `fix/phase6-approved-html-semantic-contract-v1`
- Draft PR: `#22 Restore Phase 6 approved 40+8 HTML with semantic field locking`
- PR #21의 JSON 사용자 흐름은 폐기·대체됐으며 병합하지 않는다.
- Phase 6 최종 사용자 산출물은 JSON이 아니라 승인 샘플 기반의 완성 HTML이다.
- 기준 화면은 `/?pilot=full-integrated&brand=<exact brand>`이며 40 Main + 8 Appendix다.
- 외부 AI HTML은 Sanitizer와 의미 필드 검증을 통과한 내용만 승인 DOM에 이식한다.
- 현재 자동 검증: build, semantic HTML E2E, 48-page Viewer, save/reopen, PDF 48p 모두 PASS.
- 상세 계약과 남은 사용자 승인 Gate는 `handoff/PHASE6_APPROVED_HTML_SEMANTIC_CONTRACT_2026-07-10.md`를 따른다.
