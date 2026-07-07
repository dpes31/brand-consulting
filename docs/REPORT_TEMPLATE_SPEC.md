# FULL Report Template Specification

## Status

Approved Phase 6 production target for the Brand Consulting Generator.

- Reference route: `/?pilot=full-integrated&brand=<exact user-entered brand>`
- Production route: `/`, Phase 6
- Main Deck: exactly 40 pages
- Appendix: exactly 0 pages
- Final page: Decision Receipt / Close
- Canvas: logical 1280×720, exact 16:9
- PDF MediaBox: 960×540pt
- Typeface: Pretendard
- Major titles: weight 900
- Korean wrapping: `word-break: keep-all`

The approved Pilot is the layout source only. Its completed Biznup wording is not a valid content source. Before prompt export, every variable sample-content unit becomes a neutral `[[CONTENT:...]]` slot rebuilt from current Step 0–5 research.

## Production compilation contract

The normal Phase 6 flow is:

`Step 0–5 research`
→ `approved Pilot DOM/CSS capture after Main40 transform`
→ `sample-content neutralization`
→ `research-driven slot filling`
→ `blocking validation`
→ `standalone 40-page HTML`
→ `Viewer / save / reopen / native PDF`

Fixed:

- exactly 40 Main pages and zero Appendix pages;
- page-specific structural classes and approved component hierarchy;
- logical 1280×720 geometry;
- navigation shell;
- page order defined below;
- print and PDF rules;
- exact user-entered brand name;
- connector glyphs such as arrows and comparison symbols.

Generated from current research:

- conclusions and titles;
- metrics and dates;
- competitor candidates and top-three ranking;
- Persona and consumer analysis;
- Creative History and source labels;
- SWOT and STP;
- strategic routes, Winning Move, and Final Choice.

No unresolved `CONTENT SLOT` may remain.

## Blocking validation

Reject the report when:

- slide count is not 40;
- any page zone is not `main`;
- any Appendix page remains;
- page IDs or labels are missing or duplicated;
- Competitive Landscape, Category Clichés, Creative Insight, Final Choice, or Decision Close is missing;
- Creative Methodology remains;
- unresolved content slots remain;
- the exact user-entered brand name is absent;
- Step 0 FACTS evidence is insufficient;
- Landscape candidates or top-three core competitors are absent from assigned pages;
- an unapproved script is included;
- logical 1280×720 CSS is missing.

## Information hierarchy

Every analytical page follows:

1. Section / breadcrumb
2. Conclusion-led page title
3. Governing visual structure
4. Evidence or comparison
5. Interpretation
6. `SO WHAT` implication
7. Source or caveat

A page is not a container for all prose. Preserve substance through prioritization, not smaller type.

## Consulting tone

- Titles, conclusions, body judgments, and SO WHAT statements use decisive Korean declarative endings: `~한다`, `~이다`, `~다`.
- Avoid `~합니다`, `~입니다`, `~됩니다`, and `~해야 합니다` except verified quotations or fixed UI labels.
- Every title states a judgment, not merely a topic.

## Typography and wrapping

- Major titles: Pretendard 900.
- Body: Pretendard Medium/SemiBold according to hierarchy.
- Page numbering establishes the practical body-size floor.
- Page 9 strategic implication copy is at least the page-number size.
- Source labels, status labels, and caveats may be smaller but remain legible.
- Do not reduce font size as the first overflow response.
- Use `word-break: keep-all` and `overflow-wrap: break-word`.
- Persona indices `02` and `03` remain on one line.

## Brand naming

- Display the exact brand name entered by the user.
- Do not translate, romanize, abbreviate, or reinterpret it.
- Bind it in navigation, toolbar, report content, saved project, reopened project, and PDF.

## Highlighting

- Use yellow highlighting for governing phrases, decisive evidence, or final implications.
- Combine highlight with bold weight.
- Do not highlight entire paragraphs.

## Layout and density

- Use the full content region; avoid unassigned blank areas.
- Optically center compact analytical structures between title and SO WHAT footer.
- Equal-hierarchy columns use equal tracks, aligned rules, and stable heights.
- A box must communicate a category, state, evidence class, choice, or transition.
- Prefer timelines, scorecards, matrices, causal flows, friction flows, STP convergence, and choice architecture over prose card walls.

## Fixed Main Deck structure

1. Cover
2. 핵심 진단
3. Brand Identity
4. FACTS
5. Category & Target
6. Growth Story
7. Core Inflection
8. Product USP & Brand Best Self
9. Market Context
10. Category Shift
11. Competitive Landscape
12. Threat Ranking
13. Deep Dive 1
14. Deep Dive 2
15. Deep Dive 3
16. Product Matrix
17. Category Clichés
18. Positioning
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
33. Message Trajectory
34. Creative Insight
35. SWOT
36. GAP & Root Cause
37. STP
38. Four Strategic Directions
39. Final Choice
40. Decision Receipt / Close

Creative Methodology and Appendix A1–A7 are excluded.

## Competitor rules

- Page 11 Landscape reviews up to five evidence-supported Direct Competitor candidates.
- Page 12 Threat Ranking selects the core three when three supported candidates exist.
- The same core-three set, in ranking order, appears on:
  - pages 13–15 Deep Dive;
  - page 16 Product Matrix;
  - page 18 Positioning;
  - pages 30–32 Competitor Creative History;
  - page 33 Message Trajectory.
- Never invent competitors to fill capacity.
- Competitors outside the supported candidate Registry are not elevated into core analysis.
- Product matrices and positioning maps use only defensible common axes.

## Page-specific semantic rules

- Page 2 fixed label: `핵심 진단`.
- Page 4 fixed label: `FACTS`.
- Page 5 fixed label: `CATEGORY & TARGET`.
- Page 10 fixed chapter: `CATEGORY SHIFT`; levels remain `LEVEL 1`–`LEVEL 5`.
- Persona pages retain `SITUATION / REAL JTBD / AS-IS IDENTITY / TO-BE IDENTITY / 브랜드의 역할`.
- Persona page titles reuse the three target names stated on page 21 CORE TARGET.
- Page 26 retains `Pain / 현재 문제 / Unmet Need / 우선순위`.
- Page 27 retains the approved AIPL friction-flow and avoids unnecessary English.
- Creative History uses a centered six-year system without decorative NOW circles.
- Page 34 retains the approved Current Copy / Missing Character comparison; its connector remains a symbol, never prose.
- Page 37 retains `Segmentation → Targeting → Positioning`.
- Page 38 retains A/B/C/D alternatives and the approved 차별/확장/실행 comparison.
- Page 39 retains the approved two-column Selection Criteria / Final Choice layout.
- Page 40 is Decision Receipt / Close, not Appendix.

## Creative History rules

- Six-year coverage: 2021, 2022, 2023, 2024, 2025, and 2026 YTD.
- Allowed states:
  - `verified-verbatim`
  - `source-found-copy-unverified`
  - `not-found`
- Only verified-verbatim copy may be quoted.
- Source-found but unverified copy must not be reconstructed.
- Publicly unconfirmed evidence is disclosed as an evidence gap.
- Target brand and each core competitor have an independent page with Message Trajectory and Strategic So What.
- Dark Creative History pages retain dark paper and readable foreground.

## Source treatment

- Do not show raw URLs.
- Use publisher, document/title, and year.
- Attach sources to relevant evidence.
- Unverified data does not drive chart geometry as if verified.

## Native PDF contract

- FULL PDF uses Chromium native print, not full-page html2canvas JPEG rasterization.
- Output is exactly 40 pages.
- Every page is Main Deck.
- PDF page size is 960×540pt.
- Embedded font objects exist.
- No 2560×1440 full-page image rows are allowed.
- Viewer, saved HTML, reopened project, and PDF use the same report document.

## PDF runtime separation

### Legacy runtime

- DOM selector: `.slide-wrapper > .slide`
- Guard: `installIframeLayoutSafety`
- Exporter: Legacy exporter

### Phase 6 FULL runtime

- DOM selector: `.full-slide`
- Guard: `installFullReportRuntimeCompatibility`
- Exporter: Chromium browser-native print

Rules:

- Install FULL runtime before Legacy guard.
- A FULL document marks the Legacy guard handled before the Legacy listener can replace `window.print`.
- Never pass FULL into the Legacy selector.
- Visible `Export PDF`, Windows `Ctrl+P`, and macOS `Cmd+P` resolve the active FULL Viewer iframe.
- When no FULL report exists, show clear guidance instead of `출력할 슬라이드를 찾지 못했습니다`.
- Consecutive export remains valid.

## Runtime and QA

Primary implementation files:

- `src/pages/BiznupFullIntegrated.tsx`
- `src/pages/BiznupFullIntegrated.css`
- `src/lib/installPhase6PagePlanV2.ts`
- `src/report/fullReportCompiler.ts`
- `src/report/researchContentTemplate.ts`
- `src/report/researchSlotPrompt.ts`
- `src/lib/installFullReportPhase6Bridge.ts`
- `src/lib/installFullReportRuntimeCompatibility.ts`
- `src/lib/installFullReportPdfButtonBridge.ts`
- `src/lib/installLayoutSafety.ts`
- `src/lib/geminiCompiler.ts`
- `public/full-report-approved-v1.css`
- `scripts/test-full-report-contract.mjs`
- `scripts/test-full-report-runtime.mjs`
- `scripts/test-phase6-pdf-runtime-routing.mjs`
- `scripts/e2e-phase6-pdf-button-routing.mjs`
- `scripts/e2e-phase6-five-competitor-native-print.mjs`

Minimum QA:

- exactly 40 pages and 40 navigation links;
- zero Appendix pages;
- exact page order and IDs;
- candidate-five Landscape and consistent core-three analysis;
- logical 1280×720 canvases;
- zero body overflow or clipping;
- no unresolved content slots;
- exact brand-name display;
- Step 0 FACTS presence;
- Persona 02/03 nowrap;
- Page 9 type floor;
- restored Landscape, Category Clichés, Creative Insight, STP, Four Directions, Final Choice, and Decision Close;
- save and reopen;
- actual Export PDF button;
- second consecutive export;
- `Ctrl+P` and `Cmd+P`;
- no Legacy zero-slide alert;
- native 40-page PDF with embedded fonts and no full-page raster rows;
- Viewer and PDF screenshots before visual completion.

## Protected rollback assets

- `public/template.html` remains untouched.
- Verified Legacy blob SHA: `22bc6937b3d672e063d4b240c5a39b9c61700fec`.
- Never modify or delete:
  - `backup/main-before-full-report-v1-2026-07-01`
  - `backup-production-stable-20260622`
