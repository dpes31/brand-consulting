# AGENTS.md

Read `handoff/PROJECT_HANDOFF.md`, `handoff/WORK_LOG.md`, `handoff/DECISION_LOG.md`, `docs/REPORT_TEMPLATE_SPEC.md`, `docs/PDF_EXPORT_E2E_STANDARD.md`, `docs/phase5b-gate2a-results.md`, and the files under `design/` before changing this repository.

## Safety

- Use Preview-first feature branches. Merge only with explicit owner approval.
- Preserve milestone commit history; do not squash unless explicitly approved.
- Never modify or delete:
  - `backup-production-stable-20260622`
  - `backup/main-before-full-report-v1-2026-07-01`
- Preserve validated and audit branches.
- `feature-visualization-engine-v1` and PR #6 are failed audit records and must not be merged.
- Do not restore discarded implementations from PR #8, #9, or #10.
- PR #21, #22, and #23 are superseded Phase 6 audit records. Do not merge or restore their JSON-only external workflow.
- Preserve `public/template.html` as the Legacy rollback asset. Verified blob SHA: `22bc6937b3d672e063d4b240c5a39b9c61700fec`.

## Current checkpoint

- Production branch: `main`
- Production commit before this work: `96f12ac5bde92a53a97a12ea01ae9c3db921c7fe`
- Active branch: `fix/phase6-main40-final-html-semantic-v5`
- Draft PR: `#24 Restore Phase 6 complete HTML output with semantic field locking`
- Current validated head before documentation: `64a80282e82948229392330c055be5404dc90805`
- Production build/contracts: PASS
- Phase 6 browser/PDF E2E: PASS
- Vercel Preview: `https://brand-consulting-git-fix-phase6-main40-c77bea-dpes31s-projects.vercel.app/`
- Vercel deployment status: Ready
- Keep PR #24 Draft. Do not merge to `main` before explicit owner Preview approval.

## Owner-approved Phase 6 flow

`Step 0–5 research`
→ `complete HTML writing prompt download`
→ `external AI returns one complete standalone 40-page HTML document`
→ `Phase 6 paste`
→ `active-content sanitization`
→ `semantic-field, cross-page, positioning, and approved-DOM validation`
→ `approved DOM reassembly`
→ `Viewer / save / reopen / native PDF`

External AI output is HTML, not JSON. Do not relabel a JSON workflow as HTML.

## Semantic HTML contract

- Variable report content uses stable `data-report-field` keys such as `comp-ranking.rank1.name`, not text-node order or `[[CONTENT:Pxx:TAG:nnn]]` slots.
- Prompt template tokens use `[[FIELD:semantic.key]]` only as authoring placeholders. Every token must be replaced before import.
- Rich fields permit only `<mark>` and `<br>` descendants. Plain text, source, and status fields permit no child HTML.
- Literal `[[...]]` highlight syntax is prohibited in the returned or compiled HTML.
- External CSS, DOM changes, IDs, classes, navigation changes, and page reordering are not trusted. Only validated semantic values and P18 coordinates are transferred into the approved DOM.
- Scripts, event handlers, JavaScript URLs, refresh redirects, and active form/media content are removed or rejected.

## Product invariants

- Final report is exactly **40 Main Deck pages**.
- Appendix count is exactly **0**.
- Page 40 is `Decision Receipt / Close`.
- Every slide uses a logical 1280×720 canvas, exact 16:9.
- Use Pretendard; major titles use weight 900.
- Preserve Korean word units with `word-break: keep-all`.
- Preserve the exact user-entered brand name without translation or romanization.
- Do not invent figures, dates, models, scores, axes, coordinates, sources, competitors, or copy.
- Only `verified-verbatim` advertising copy may use quotation marks.
- Do not expose raw source URLs in final reports.
- Titles, judgments, and SO WHAT statements use decisive Korean endings such as `~한다`, `~이다`, `~다`.

## Approved competitor logic

- Page 11 Competitive Landscape may review up to five evidence-supported Direct Competitor candidates.
- Page 12 Threat Ranking selects the core three when three supported candidates exist.
- Pages 13–15 Deep Dive, page 16 Product Matrix, page 18 Positioning, pages 30–32 Competitor Creative History, and page 33 Message Trajectory use the same core-three set in ranking order.
- Never invent a fourth or fifth core competitor.
- If an unused candidate row is explicitly `추가 후보 없음`, `없음`, or `not-found`, hide it in the compiled report.

## Fixed 40-page plan

1. Cover
2. 핵심 진단
3. Brand Identity
4. FACTS
5. Category & Target
6. Growth Story
7. Core Inflection
8. Product USP & Best Self
9. Market Context
10. Category Shift
11. Competitive Landscape
12. Threat Ranking
13–15. Deep Dive 1–3
16. Product Matrix
17. Category Clichés
18. Positioning
19. Consumer Executive Conclusion
20. Trends
21. Core Target
22–24. Persona 1–3
25. JTBD & Identity Alignment
26. Pain Points & Unmet Needs
27. AIPL Bottleneck
28. Purchase to Loyalty
29. Target Brand Creative History
30–32. Competitor Creative History 1–3
33. Message Trajectory
34. Creative Insight
35. SWOT
36. GAP & Root Cause
37. STP
38. Four Strategic Directions
39. Final Choice
40. Decision Receipt / Close

Creative Methodology and Appendix A1–A7 are excluded.

## Page grammar locks

- Page 2 fixed label: `핵심 진단`.
- Page 4 fixed label: `FACTS`.
- Page 5 fixed label: `CATEGORY & TARGET`.
- Page 10 fixed chapter: `CATEGORY SHIFT`; stage labels remain `LEVEL 1`–`LEVEL 5`.
- Page 9 strategic implication type is at least the page-number size.
- Persona pages retain `SITUATION / REAL JTBD / AS-IS IDENTITY / TO-BE IDENTITY / 브랜드의 역할`.
- Persona titles reuse the three target names stated on page 21 CORE TARGET.
- Persona indices `02` and `03` stay on one line.
- Page 26 retains `Pain / 현재 문제 / Unmet Need / 우선순위`.
- Page 27 retains the approved AIPL friction-flow.
- Creative History uses the approved centered six-year system without decorative NOW circles.
- Page 34 retains Current Copy / Missing Character; connector glyphs remain symbols.
- Page 37 retains `Segmentation → Targeting → Positioning`.
- Page 38 retains A/B/C/D and 차별/확장/실행 comparison.
- Page 39 retains the two-column Selection Criteria / Final Choice composition.

## P18 Positioning contract

- Axis poles are generated from defensible Step 2 attributes, never literal `X축`, `Y축`, `좌`, `우`, `상`, or `하`.
- `positioning.targetAsIs` must resolve to `<exact brand> AS-IS · <description>`.
- `positioning.targetToBe` must resolve to `<exact brand> TO-BE · <description>`.
- Position tokens use ten `[[POSITION:...]]` values for the core three, target AS-IS, and target TO-BE.
- Coordinate system: x=0 left, x=100 right, y=0 top, y=100 bottom.
- Coordinates must be integers from 0 through 100.
- Target AS-IS and TO-BE must have a meaningful visual movement distance.
- The compiled DOM stores the applied values in `data-position-x`, `data-position-y`, and `data-positioning-coordinate-contract="semantic-0-100-v1"`.

## Creative History factuality

- Target brand and each core competitor retain independent 2021–2026 pages.
- Canonical statuses:
  - `verified-verbatim`
  - `source-found-copy-unverified`
  - `not-found`
- Import compatibility normalizes `VERIFIED`, `COPY UNVERIFIED`, and `NOT FOUND` to the canonical values.
- Only verified-verbatim copy may use quotation marks.
- Preserve Message Trajectory and Strategic So What.
- Dark Creative History pages retain dark paper and readable foreground.

## Validated Visual Intent contracts

- Step 0: exactly one Growth Story Brief; accepted recipe `milestone-timeline`.
- Step 2: Candidate Landscape → Threat Ranking → core three; Product Matrix uses `feature-matrix`; Positioning is used only when common axes are defensible.
- Step 3: exactly one core consumer-decision Brief; accepted recipe `friction-flow`; `implementationStatus: planned`; `metrics: []`.
- Step 5: exactly one final strategy-decision Brief; accepted recipe `choice-architecture`; `implementationStatus: planned`; `metrics: []`.

## PDF runtime boundary and acceptance

- Legacy reports use `.slide-wrapper > .slide`, `installIframeLayoutSafety`, and the Legacy exporter.
- Phase 6 FULL reports use `.full-slide`, `installFullReportRuntimeCompatibility`, and browser-native print.
- Install the FULL runtime before the Legacy layout/PDF guard.
- Never pass a FULL report to the Legacy selector.
- Visible `Export PDF`, Windows `Ctrl+P`, and macOS `Cmd+P` converge on the active Viewer iframe and native-print path.
- Preserve actual-button browser E2E with two consecutive exports and save → reload → reopen.
- Preflight requires exactly 40 `.full-slide` pages, all `data-zone="main"`.
- PDF MediaBox is 960×540pt.
- Embedded font objects must be present.
- No full-page 2560×1440 raster rows are allowed.
- Do not declare visual completion without inspecting E2E screenshots and rendered PDF pages.

## Documentation

Update these whenever architecture, branch state, report contracts, validation, or rollback procedures change:

- `AGENTS.md`
- `handoff/PROJECT_HANDOFF.md`
- `handoff/WORK_LOG.md`
- `handoff/DECISION_LOG.md`
- `docs/REPORT_TEMPLATE_SPEC.md`
- `docs/PDF_EXPORT_E2E_STANDARD.md`
