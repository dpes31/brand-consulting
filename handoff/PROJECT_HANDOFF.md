# Brand Consulting Generator — Project Handoff

## Current checkpoint

- Repository: `dpes31/brand-consulting`
- Production branch: `main`
- Production commit before this work: `96f12ac5bde92a53a97a12ea01ae9c3db921c7fe`
- Production URL: `https://brand-consulting.vercel.app/`
- Active branch: `fix/phase6-approved-main40-no-appendix-v3`
- Draft PR: #20 `Restore approved 40-page report structure without Appendix`
- Current validated head: `7d94b1895c47e9db7268c9d181060e0a735c1d9b`
- Production build/contracts: PASS
- Phase 6 browser/PDF E2E: PASS
- Current Vercel deployment is blocked only by the account build-rate limit. A new Preview URL is not yet available for this head.
- Preview-first only. Do not merge PR #20 without explicit owner approval after authenticated Preview review.
- Immutable rollback branches:
  - `backup/main-before-full-report-v1-2026-07-01`
  - `backup-production-stable-20260622`
- `public/template.html` remains the Legacy rollback asset. Verified blob SHA: `22bc6937b3d672e063d4b240c5a39b9c61700fec`.

## Owner-approved output contract

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
→ `approved Pilot DOM/CSS capture after the 40-page transform is ready`
→ `sample content neutralized into CONTENT SLOT tokens`
→ `external AI or internal API fills every slot from current research`
→ `blocking validation`
→ `40-page standalone HTML`
→ `Viewer / save / reopen / Export PDF`

The Pilot is a layout source only. Its Biznup conclusions, figures, competitors, personas, Creative History, sources, SWOT, STP, and strategy are removed before the Phase 6 prompt is exported. Connector glyphs remain fixed symbols and are not content slots.

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

Removed from the output:

- Creative Methodology
- Appendix A1–A7
- competitor 4–5 Deep Dive pages
- competitor 4–5 Creative History pages

## Page-specific locks

- Page 2 label: `핵심 진단`
- Page 4 label: `FACTS`
- Page 5 label: `CATEGORY & TARGET`
- Page 9 strategic implication type is at least the page-number size
- Page 10 chapter: `CATEGORY SHIFT`; levels: `LEVEL 1`–`LEVEL 5`
- Persona pages retain the approved Situation / JTBD / identity-shift grammar and reuse page 21 target names
- Persona indices `02` and `03` stay on one line
- Pain Points, AIPL, Creative Insight, STP, and Four Strategic Directions retain the approved structures
- Creative History uses the centered six-year system without decorative NOW circles
- Page 39 retains the two-column Selection Criteria / Final Choice composition

## Blocking validation

Phase 6 rejects a report when:

- any `CONTENT SLOT` remains unresolved;
- the report does not contain exactly 40 `.full-slide` pages;
- any page uses a zone other than `main`;
- any Appendix page remains;
- page IDs or labels are missing or duplicated;
- Competitive Landscape, Category Clichés, Creative Insight, Final Choice, or Decision Close is missing;
- Creative Methodology remains;
- the exact user-entered brand name is absent;
- Step 0 FACTS evidence is insufficient;
- Landscape candidates or the Threat Ranking core three are missing from their assigned pages;
- an unapproved script is included.

## Current validation evidence

Validated against a non-Biznup brand `모노랩` with five candidates and three selected core competitors.

- Production build and report contracts: PASS
- Exact pages: 40
- Navigation links: 40
- Appendix pages: 0
- Required order and IDs: PASS
- Candidate-five Landscape: PASS
- Same core-three downstream set: PASS
- Exact user brand in navigation and report: PASS
- Page 9 type-size requirement: 12px vs 12px PASS
- Persona 02/03 nowrap: PASS
- History decorative NOW elements: 0
- Logical geometry: all pages 1280×720
- Overflow: 0 pages
- Actual `Export PDF` button: PASS
- Consecutive second export: PASS
- Windows `Ctrl+P`: PASS
- macOS `Cmd+P`: PASS
- Native PDF: 40 pages, 960×540pt
- Embedded Pretendard font objects: 6
- Full-page raster rows: 0
- Save → reload → reopen: 40 pages PASS
- Material Symbols cold-load regression: PASS

Evidence artifact for head `7d94b1895c47e9db7268c9d181060e0a735c1d9b`:

- Workflow: `Phase 6 PDF Runtime E2E` run 261
- Artifact: `phase6-pdf-runtime-evidence` ID `8140150404`

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
- Allowed statuses:
  - `verified-verbatim`
  - `source-found-copy-unverified`
  - `not-found`
- Only verified-verbatim copy may use quotation marks.
- Message Trajectory and Strategic So What remain mandatory.

## Excluded experiments

- `feature-visualization-engine-v1` / PR #6: failed audit implementation; never merge
- PR #8, #9, #10: superseded experiments; never restore
- PR #18 and PR #19: superseded branch-transfer attempts for this Main40 task; do not merge
