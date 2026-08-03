# Brand Consulting Generator — Project Handoff

## Current checkpoint

- Repository: `dpes31/brand-consulting`
- Production branch: `main`
- Production commit before this work: `96f12ac5bde92a53a97a12ea01ae9c3db921c7fe`
- Production URL: `https://brand-consulting.vercel.app/`
- Active branch: `fix/phase6-main40-final-html-semantic-v5`
- Draft PR: #24 `Restore Phase 6 complete HTML output with semantic field locking`
- Validated product/E2E head before documentation: `64a80282e82948229392330c055be5404dc90805`
- Latest documentation sequence begins at `c05868dcc194eda701da515d08516ef69295ab6a`
- Production build/contracts: PASS
- Phase 6 browser/PDF E2E: PASS
- Vercel deployment: Ready
- Preview URL: `https://brand-consulting-git-fix-phase6-main40-c77bea-dpes31s-projects.vercel.app/`
- Preview-first only. Keep PR #24 Draft and do not merge without explicit owner approval.
- Immutable rollback branches:
  - `backup/main-before-full-report-v1-2026-07-01`
  - `backup-production-stable-20260622`
- `public/template.html` remains the Legacy rollback asset. Verified blob SHA: `22bc6937b3d672e063d4b240c5a39b9c61700fec`.

## Owner-approved output contract

- External AI final output: one complete standalone HTML document, not JSON
- Main Deck: exactly 40 pages
- Appendix: 0 pages
- Page 40: Decision Receipt / Close
- Logical canvas: 1280×720, exact 16:9
- PDF MediaBox: 960×540pt
- Pretendard; major titles weight 900
- Korean `word-break: keep-all`
- Exact user-entered brand name; no translation or romanization
- Decisive consulting tone: `~한다`, `~이다`, `~다`
- Raw source URLs are not exposed
- Unverified advertising copy is not quoted

## Current Phase 6 architecture

The normal `/` application flow is:

`Step 0–5 research`
→ `complete HTML writing prompt download`
→ `external AI fills stable semantic fields and P18 coordinates`
→ `external AI returns one complete 40-page HTML`
→ `Phase 6 paste`
→ `active-content sanitization`
→ `approved-DOM fingerprint and semantic validation`
→ `cross-page competitor/brand/persona validation`
→ `P18 axis and coordinate validation`
→ `validated values reassembled into the approved DOM`
→ `Viewer / save / reopen / Export PDF`

The Pilot is a layout source only. External AI DOM/CSS changes are never trusted as final structure. The app reads validated semantic values from the returned HTML, then reconstructs the report in the approved 40-page DOM.

## Semantic field contract

- Stable content keys use `data-report-field`, for example:
  - `comp-ranking.rank1.name`
  - `persona-1.realJob`
  - `aipl.stage3.action`
  - `strategy-choice.winningMove`
- Text-node-order fields and `[[CONTENT:Pxx:TAG:nnn]]` are forbidden in the current workflow.
- Prompt placeholders use `[[FIELD:semantic.key]]`; all must be replaced before import.
- Rich fields permit only `<mark>` and `<br>`.
- Plain text, source, and status fields permit no child markup.
- Literal `[[...]]` highlight notation is rejected.
- Scripts, event handlers, JavaScript URLs, refresh redirects, forms, embeds, and autoplay media are removed or rejected.
- The final DOM fingerprint must match the approved 40-page component structure.

## P18 Positioning contract

P18 is now data-driven rather than sample-position-driven.

- Axis labels are semantic fields grounded in Step 2.
- Axis poles must be meaningful, distinct attributes; literal `X축`, `Y축`, `좌`, `우`, `상`, and `하` are invalid.
- Target labels are normalized to:
  - `<brand> AS-IS · <description>`
  - `<brand> TO-BE · <description>`
- Ten coordinate tokens are included for:
  - core competitors 1–3 x/y
  - target AS-IS x/y
  - target TO-BE x/y
- Coordinate system:
  - x=0 left, x=100 right
  - y=0 top, y=100 bottom
- All values are integers from 0 to 100.
- AS-IS and TO-BE must show a meaningful visual movement.
- Compiled positions are stored as inline `left/top`, `data-position-x/y`, and `data-positioning-coordinate-contract="semantic-0-100-v1"`.

## Approved candidate-five to core-three competitor flow

- Page 11 Competitive Landscape may compare up to five evidence-supported Direct Competitor candidates.
- Page 12 Threat Ranking selects the core three when three supported candidates exist.
- The same core three, in ranking order, appear in:
  - pages 13–15 Deep Dive 1–3
  - page 16 Product Matrix
  - page 18 Positioning
  - pages 30–32 Competitor Creative History 1–3
  - page 33 Message Trajectory
- A fourth or fifth core competitor is never invented.
- Explicit unused rows such as `추가 후보 없음` are hidden in the compiled report.

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

Excluded:

- Creative Methodology
- Appendix A1–A7
- competitor 4–5 Deep Dive pages
- competitor 4–5 Creative History pages

## Blocking validation

Phase 6 rejects a report when:

- any `[[FIELD:...]]` or `[[POSITION:...]]` token remains;
- literal `[[...]]` highlight syntax remains;
- a field contains disallowed child HTML;
- the returned semantic-field set differs from the approved set;
- the approved DOM fingerprint changes;
- the report does not contain exactly 40 `.full-slide` pages;
- any page uses a zone other than `main`;
- any Appendix or Creative Methodology page remains;
- page IDs, order, or required structures differ;
- the exact user-entered brand name is absent;
- P12 core competitor names are invalid, duplicated, or inconsistent downstream;
- Persona, JTBD, AIPL, STP, routes, or Final Choice contain structural labels instead of meaning;
- P18 target labels, axes, coordinates, or movement are invalid;
- Creative History status is outside the canonical values;
- an unapproved script or active element is included.

## Real-world defects closed in PR #24

The owner-provided Biznup external-AI result exposed these defects; all are now regression-covered:

1. P18 AS-IS/TO-BE descriptions omitted the exact brand and state labels.
2. `[[important phrase]]` appeared literally in rendered pages.
3. P18 axis labels changed but brand dots remained at sample coordinates.
4. Creative History statuses were humanized as `VERIFIED`, `COPY UNVERIFIED`, and `NOT FOUND`.
5. `추가 후보 없음` appeared as a visible competitor row.
6. Earlier E2E asserted stale prompt copy instead of the actual HTML workflow.

Corrections:

- automatic brand/state normalization for P18;
- `<mark>` authoring contract and final literal-bracket rejection;
- ten semantic P18 coordinate values and applied map positions;
- status normalization to canonical codes;
- unused candidate-row hiding;
- E2E coverage of the exact failure modes.

## Current validation evidence

Validated with non-Biznup brand `모노랩`, five Landscape candidates, three selected core competitors, deliberate unsafe script injection, humanized Creative History statuses, a rich-text `<mark>`, and custom P18 coordinates.

- Production build/contracts: PASS
- Browser/PDF E2E: PASS
- Exact pages: 40
- Navigation links: 40
- Appendix pages: 0
- Required order and IDs: PASS
- No generic order fields: PASS
- No unresolved `[[...]]`: PASS
- Script removal: PASS
- Exact user brand: PASS
- Candidate-five / core-three propagation: PASS
- P18 axis contract: PASS
- P18 custom coordinates applied: PASS
- P18 AS-IS/TO-BE brand labels normalized: PASS
- Creative History status normalization: PASS
- `<mark>` highlight rendered: PASS
- Logical geometry: all pages 1280×720
- Overflow: 0 pages
- Actual `Export PDF` button: PASS
- Consecutive second export: PASS
- Windows `Ctrl+P`: PASS
- macOS `Cmd+P`: PASS
- Native PDF: 40 pages, 960×540pt
- Embedded font objects: PASS
- Full-page raster rows: 0
- Save → reload → reopen: 40 pages PASS
- Material Symbols cold-load regression: PASS
- PDF preflight: no warnings
- E2E screenshots and all 40 rendered PDF pages visually inspected

Evidence:

- Product/E2E head: `64a80282e82948229392330c055be5404dc90805`
- Workflow: `Phase 6 PDF Runtime E2E` run `30799168241`
- Artifact: `phase6-pdf-runtime-evidence` ID `8850131424`
- Vercel deployment: `GNQ2CvgR72wcmtuHDc1JrWft4hHS`

## PDF runtime boundary

Two report systems coexist and remain separated:

- Legacy: `.slide-wrapper > .slide`, `installIframeLayoutSafety`, Legacy exporter
- Phase 6 FULL: `.full-slide`, `installFullReportRuntimeCompatibility`, browser-native print

A FULL report never enters the Legacy selector. The visible `Export PDF` button, `Ctrl+P`, and `Cmd+P` all target the active FULL Viewer iframe.

## Validated Step contracts

### Step 0

- Exactly one Growth Story Visual Intent Brief
- Accepted recipe: `milestone-timeline`

### Step 2

- Candidate Landscape up to five
- Threat Ranking: `rank-scorecard`
- Core three selected for downstream analysis
- Product Matrix: `feature-matrix`
- Positioning only when common axes are defensible
- Independent six-year Creative History per core competitor

### Step 3

- Trends, Persona, Identity Alignment, JTBD, AIPL, and Unmet Needs remain
- Exactly one core consumer-decision Brief
- Accepted recipe: `friction-flow`
- `implementationStatus: planned`
- `metrics: []`

### Step 5

- SWOT, GAP, Root Cause, three ToT routes, Big IdeaL, Winning Move, Via Negativa, Pre-mortem, and execution sequence remain in research
- Final report presents SWOT, Root Cause, STP, Four Directions, Final Choice, and Decision Receipt
- Exactly one final strategy-decision Brief
- Accepted recipe: `choice-architecture`
- `implementationStatus: planned`
- `metrics: []`

## Creative History factuality

- Target brand and each core competitor retain independent 2021–2026 pages.
- Canonical statuses:
  - `verified-verbatim`
  - `source-found-copy-unverified`
  - `not-found`
- Import compatibility normalizes common humanized variants.
- Only verified-verbatim copy may use quotation marks.
- Message Trajectory and Strategic So What remain mandatory.

## Excluded or superseded implementations

- `feature-visualization-engine-v1` / PR #6: failed audit implementation; never merge
- PR #8, #9, #10: superseded experiments; never restore
- PR #18, #19, #20: superseded Main40 branch attempts; do not merge
- PR #21: JSON-only external workflow; superseded
- PR #22: HTML restoration with obsolete 48-page contract; superseded
- PR #23: 40-page but JSON-only external workflow hidden behind generic labels; superseded

## Remaining approval gate

Technical implementation and automated/visual QA are complete on the Draft branch. The only remaining gate is owner review of the Ready Vercel Preview. Do not merge `main` until the owner explicitly approves.
