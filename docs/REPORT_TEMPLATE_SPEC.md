# FULL Report Template Specification

## Status

Approved Phase 6 production target for the Brand Consulting Generator.

- Reference route: `/?pilot=full-integrated&brand=<exact user-entered brand>`
- Production route: `/`, Phase 6
- Main Deck: exactly 40 pages
- Appendix: exactly 8 pages
- Total: exactly 48 pages
- Canvas: 1280×720, exact 16:9
- Typeface: Pretendard
- Major titles: weight 900
- Korean wrapping: `word-break: keep-all`

The approved Pilot is the layout source only. Its completed Biznup wording is not a valid content source. Before prompt export, every visible sample-content unit is converted into a neutral `[[CONTENT:...]]` slot and must be rebuilt from the current Step 0–5 research.

## Production compilation contract

The normal Phase 6 flow is:

`Step 0–5 research`
→ `approved Pilot DOM/CSS capture after Page Plan V2 is ready`
→ `sample-content neutralization`
→ `research-driven slot filling`
→ `blocking validation`
→ `standalone 48-page HTML`
→ `Viewer / save / reopen / native PDF`

The following remain fixed:

- exactly 40 Main + 8 Appendix pages;
- page-specific structural classes and approved component hierarchy;
- 1280×720 geometry;
- navigation shell;
- page order defined below;
- print and PDF rules;
- exact user-entered brand name.

The following must come from current research:

- conclusions and titles;
- metrics and dates;
- selected competitors and ranking;
- Persona and consumer analysis;
- Creative History and source labels;
- SWOT and STP;
- strategic routes, Winning Move, and Final Choice.

No unresolved `CONTENT SLOT` may remain in final HTML.

## Blocking validation

Reject the report when any of the following occurs:

- slide count is not 48;
- Main/Appendix count is not 40/8;
- page IDs or labels are missing or duplicated;
- approved layouts are missing;
- unresolved content slots remain;
- the exact user-entered brand name is absent;
- Step 0 KPI evidence is not sufficiently represented;
- any selected Step 2 direct competitor is absent;
- an unapproved script is included;
- 1280×720 CSS is missing.

## Information hierarchy

Every analytical page should answer one decision question through this order:

1. Section / breadcrumb
2. Conclusion-led page title
3. Governing visual structure
4. Evidence or comparison
5. Interpretation
6. `SO WHAT` implication
7. Source or caveat

A page is not a container for all prose. Preserve substance through prioritization and Appendix evidence rather than shrinking text.

## Typography and wrapping

- Major titles: Pretendard 900.
- Body: Pretendard Medium/SemiBold according to hierarchy.
- Page numbering establishes the practical body-size floor.
- Source labels, status labels, and caveats may be smaller but must remain legible.
- Do not reduce font size as the first overflow response.
- Use `word-break: keep-all` and `overflow-wrap: break-word`.
- Persona indices `02` and `03` must remain on one line.

## Brand naming

- Display the exact brand name entered by the user.
- Do not translate, romanize, abbreviate, or reinterpret it.
- The `brand` query parameter remains the reference-route binding.

## Highlighting

- Use yellow highlighting for the governing phrase, decisive evidence, or final implication.
- Combine highlight with bold weight.
- Do not highlight entire paragraphs.
- Generated content may use `<mark>` or `.text-highlight`.

## Layout and density

- Use the full content region; avoid large unassigned blank areas.
- Optically center compact analytical structures between title and `SO WHAT` footer.
- Equal-hierarchy columns use equal tracks, aligned rules, and stable heights.
- A box must communicate a category, state, evidence class, choice, or transition.
- Prefer timelines, scorecards, matrices, causal flows, friction flows, STP convergence, choice architecture, roadmaps, and evidence-gap panels over prose card walls.

## Fixed Main Deck structure

1. Cover
2. Executive Verdict
3. Brand Identity
4. KPI Snapshot
5. Category & Core Target
6. Growth Story
7. Core Inflection
8. Product USP & Brand Best Self
9. Market Context
10. Category / Value Shift
11. Threat Ranking — up to five direct competitors
12. Deep Dive 1
13. Deep Dive 2
14. Deep Dive 3
15. Deep Dive 4
16. Deep Dive 5
17. Product Matrix — target brand + up to five direct competitors
18. Positioning — target brand + up to five direct competitors
19. Consumer Executive Conclusion
20. Trends
21. Core Target
22. Persona 1
23. Persona 2
24. Persona 3
25. JTBD & Identity Alignment
26. Pain Points & Unmet Needs
27. AIPL Bottleneck
28. Purchase to Loyalty
29. Target Brand Creative History
30. Competitor Creative History 1
31. Competitor Creative History 2
32. Competitor Creative History 3
33. Competitor Creative History 4
34. Competitor Creative History 5
35. Message Trajectory — target brand + up to five direct competitors
36. SWOT
37. GAP & Root Cause
38. STP
39. Four Strategic Directions
40. Final Choice — approved two-column criteria/result layout

## Fixed Appendix structure

41. A1 — Appendix Divider
42. A2 — Winning Move Specification
43. A3 — Via Negativa
44. A4 — Pre-mortem
45. A5 — Execution Roadmap
46. A6 — Measurement Plan
47. A7 — Evidence Gaps + Source Labels
48. A8 — Decision Receipt / Close

Appendix pages are never competitor overflow slots.

## Dynamic competitor rules

- Step 2 selects 2–5 direct competitors through Threat Ranking.
- Five is maximum capacity, not a mandatory count.
- Selected competitors use Main Deck Deep Dive pages 12–16 in ranking order.
- The same selected set appears on Product Matrix page 17, Positioning page 18, Creative History pages 30–34, and Message Trajectory page 35.
- Each selected competitor receives one independent Deep Dive and one independent six-year Creative History.
- If fewer than five competitors have defensible evidence, preserve unused approved pages as explicit evidence gaps. Never invent names or facts.
- Competitors outside the locked Registry must not be elevated into core analysis.
- Product matrices and positioning maps use only defensible common axes.

## Creative History rules

- Six-year coverage: 2021, 2022, 2023, 2024, 2025, and 2026 YTD.
- Allowed states:
  - `verified-verbatim`
  - `source-found-copy-unverified`
  - `not-found`
- Only verified-verbatim copy may be quoted.
- Source-found but unverified copy must not be reconstructed.
- Publicly unconfirmed evidence is disclosed as an evidence gap.
- Each brand has an independent page with Message Trajectory and Strategic So What.
- Dark Creative History pages retain dark paper and readable foreground.

## Final Choice rule

Page 40 retains the approved composition:

- left: Selection Criteria;
- right: Big IdeaL and Winning Move;
- two independent columns with no spanning or stacked collapse;
- one governing phrase highlighted in yellow;
- `SO WHAT` retained below.

## Source treatment

- Do not show raw URLs in final reports.
- Use publisher, document/title, and year.
- Attach sources to relevant evidence.
- Unverified data must not drive chart geometry as though verified.

## Native PDF contract

- FULL report PDF uses Chromium native print, not full-page html2canvas JPEG rasterization.
- Output is exactly 48 pages.
- PDF page size is 960×540pt, corresponding to 1280×720 CSS pixels.
- Embedded font objects must exist.
- No 2560×1440 full-page image rows are allowed.
- Viewer, saved HTML, reopened project, and PDF must use the same report document.

## PDF runtime separation

Two runtime families coexist and must be mutually exclusive:

### Legacy report runtime

- DOM selector: `.slide-wrapper > .slide`
- Guard: `installIframeLayoutSafety`
- Exporter: `exportReportPdf`
- Used only for legacy report documents.

### Phase 6 FULL report runtime

- DOM selector: `.full-slide`
- Guard: `installFullReportRuntimeCompatibility`
- Exporter: Chromium browser-native print
- Used for normal Phase 6 FULL reports.

Rules:

- Install the FULL runtime before the legacy layout/PDF guard.
- A FULL document marks the legacy guard as handled before the legacy load listener can replace `window.print`.
- Retain the real native print function from `window.print` or the legacy native backup.
- Never pass a FULL report into the legacy `.slide-wrapper > .slide` selector.
- Every host `Export PDF` button must resolve the fullscreen FULL iframe, another active FULL iframe, or a stable offscreen FULL iframe rebuilt from retained HTML.
- When no FULL report exists, show a clear instruction instead of `출력할 슬라이드를 찾지 못했습니다`.
- Repeated export must remain valid.

## Runtime and QA

Primary implementation files:

- `src/pages/BiznupFullIntegrated.tsx`
- `src/pages/BiznupFullIntegrated.css`
- `src/lib/installPhase6PagePlanV2.ts`
- `src/report/fullReportCompiler.ts`
- `src/report/researchContentTemplate.ts`
- `src/report/researchSlotPrompt.ts`
- `src/report/productionReportContract.ts`
- `src/lib/installFullReportPhase6Bridge.ts`
- `src/lib/installFullReportRuntimeCompatibility.ts`
- `src/lib/installFullReportPdfButtonBridge.ts`
- `src/lib/installLayoutSafety.ts`
- `src/lib/geminiCompiler.ts`
- `public/full-report-approved-v1.css`
- `public/full-report-approved-v1/color-consistency-v1.css`
- `public/full-report-v1.js`
- `public/template-full-report-v1.html`
- `scripts/test-full-report-contract.mjs`
- `scripts/test-full-report-runtime.mjs`
- `scripts/test-phase6-pdf-runtime-routing.mjs`
- `scripts/e2e-phase6-pdf-button-routing.mjs`
- `scripts/e2e-phase6-five-competitor-native-print.mjs`

Minimum QA checks:

- exactly 48 rendered pages and 48 navigation links;
- exact 40 Main + 8 Appendix order;
- five-competitor capacity across ranking, Deep Dive, Matrix, Positioning, Creative History, and Trajectory;
- every canvas 1280×720;
- zero body overflow or clipping;
- no unresolved content slots;
- exact brand-name display;
- Step 0 KPI presence;
- all selected Step 2 competitor presence;
- Persona `02`/`03` single-line rendering;
- page 40 two-column Final Choice geometry;
- Appendix divider presence;
- Creative History dark-page contrast;
- save and reopen;
- actual host Export PDF button invocation;
- two consecutive FULL native-print invocations;
- no legacy zero-slide alert;
- native 48-page PDF with embedded fonts and no full-page raster rows;
- actual Viewer and PDF screenshots before declaring visual completion.

## Protected rollback assets

- `public/template.html` remains untouched.
- Verified legacy blob SHA: `22bc6937b3d672e063d4b240c5a39b9c61700fec`.
- Never modify or delete:
  - `backup/main-before-full-report-v1-2026-07-01`
  - `backup-production-stable-20260622`
