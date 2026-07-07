# Brand Consulting Generator — Project Handoff

## Current checkpoint

- Repository: `dpes31/brand-consulting`
- Production branch: `main`
- Active correction branch: `fix/phase6-report-color-consistency-v1`
- PR: #16 `Finalize Phase 6 report structure and remove icon-font reload flash`
- Production URL: `https://brand-consulting.vercel.app/`
- Owner approved production application after the reload-flash correction.
- Merge method: regular merge only; do not squash.
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
→ `Viewer / save / reopen`

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

## PR #16 corrections

- Restored Page 40 Final Choice to a left Selection Criteria / right Big IdeaL & Winning Move composition.
- Added up-to-five competitor capacity to Threat Ranking, Deep Dive, Product Matrix, Positioning, Creative History, and Message Trajectory.
- Moved competitors 4–5 from Appendix overflow into the Main Deck competitor and creative sections.
- Added an Appendix divider at A1 while preserving exact 40+8 totals.
- Combined Evidence Gaps and Source Labels at A7.
- Prevented Persona indices `02` and `03` from wrapping.
- Preserved dark Creative History color tokens.
- Corrected the app reload FOUC caused by Material Symbols ligature text:
  - fixed 1em icon boxes from first paint;
  - hidden ligature strings until font readiness;
  - Google Fonts preconnect and Material Symbols block loading;
  - font-readiness guard installed before React render.

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

The same content contract applies to manual external-AI and internal API paths.

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

## Verified for PR #16

- Production build and contract tests: PASS
- Five-competitor generated-report E2E: PASS
- Exact page order and 48 navigation links: PASS
- 1280×720 geometry and zero overflow: PASS
- Persona `02`/`03` one-line rendering: PASS
- Page 40 two-column geometry: PASS
- Appendix divider: PASS
- Save/reopen: PASS
- Material Symbols cold-load test with delayed font: PASS
- No visible ligature words before font readiness: PASS
- Export PDF button position and size unchanged before/after icon font load: PASS

## Known deferred issue

The actual app/Preview `Export PDF` action can still show:

`PDF 생성 오류 — 출력할 슬라이드를 찾지 못했습니다.`

The owner explicitly deferred this issue to a separate follow-up after PR #16 production deployment. Do not describe the user-facing PDF button as resolved. The existing local native-print contract and PDF inspection evidence do not supersede the actual app failure report.

## Excluded experiments

- `feature-visualization-engine-v1` / PR #6: failed audit implementation; never merge
- PR #8, #9, #10: superseded experiments; never restore
