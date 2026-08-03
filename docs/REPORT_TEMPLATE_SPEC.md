# FULL Report Template Specification

## Status

Approved Phase 6 production target for the Brand Consulting Generator.

- Reference route: `/?pilot=full-integrated&brand=<exact user-entered brand>`
- Production route: `/`, Phase 6
- External AI final output: complete standalone HTML, not JSON
- Main Deck: exactly 40 pages
- Appendix: exactly 0 pages
- Final page: Decision Receipt / Close
- Canvas: logical 1280×720, exact 16:9
- PDF MediaBox: 960×540pt
- Typeface: Pretendard
- Major titles: weight 900
- Korean wrapping: `word-break: keep-all`

The approved Pilot is the layout source only. Its completed Biznup wording is not a valid content source. Variable content is exposed through stable semantic fields and is reconstructed only from the current Step 0–5 research.

## Production compilation contract

The normal Phase 6 flow is:

`Step 0–5 research`
→ `complete HTML writing prompt download`
→ `external AI replaces semantic field and P18 coordinate tokens`
→ `one complete standalone 40-page HTML return`
→ `active-content sanitization`
→ `field-set, DOM fingerprint, cross-page, and P18 validation`
→ `approved DOM reassembly`
→ `Viewer / save / reopen / native PDF`

Fixed by the application:

- exactly 40 Main pages and zero Appendix pages;
- page-specific structural classes and approved component hierarchy;
- logical 1280×720 geometry;
- navigation shell;
- page order;
- print and PDF rules;
- connector glyphs and fixed structural labels.

Generated from current research:

- exact user-entered brand name;
- conclusions and titles;
- metrics and dates;
- competitor candidates and core-three ranking;
- Persona and consumer analysis;
- Creative History and source labels;
- P18 axis poles and point coordinates;
- SWOT and STP;
- strategic routes, Winning Move, and Final Choice.

## External HTML prompt contract

The exported prompt must:

- state `Return one complete standalone HTML document, not JSON`;
- preserve the exact brand spelling;
- require exactly 40 `.full-slide` pages and zero Appendix;
- place Step 0–5 research before the large immutable HTML template;
- retain all supplied DOM, CSS, IDs, classes, data attributes, navigation, and page order;
- permit replacement only of `[[FIELD:semantic.key]]` and `[[POSITION:semantic.key]]` tokens;
- prohibit raw URLs, fabricated evidence, fabricated axes, fabricated coordinates, and fabricated Creative History copy;
- require canonical Creative History statuses;
- require `<mark>` rather than literal `[[...]]` for rich-text highlights;
- return the document from `<!DOCTYPE html>` through `</html>` in one HTML code block.

The external prompt must not include `Return JSON only`, `Never return HTML`, or `[[CONTENT:Pxx:TAG:nnn]]`.

## Semantic field contract

- Variable text is marked with `data-report-field`.
- Keys describe semantic roles, not DOM order.
- Examples:
  - `comp-ranking.rank1.name`
  - `positioning.axis.xLeft`
  - `persona-1.realJob`
  - `aipl.stage3.action`
  - `strategy-choice.winningMove`
- Returned fields must exactly match the approved field set.
- Missing, duplicated, added, or reordered semantic roles block compilation.
- Generic `.contentN` fields are prohibited.
- Text-node-order content mapping is prohibited.

### Field markup

- `rich`: only `<mark>` and `<br>` descendants are allowed.
- `text`: plain text only.
- `source`: plain text only; application owns the `SOURCE ·` prefix.
- `status`: plain text only and normalized to an approved status code.
- Script, style injection inside fields, nested layout markup, and event handlers are invalid.

### Token completion

The compiled report must contain none of the following:

- `[[FIELD:...]]`
- `[[POSITION:...]]`
- literal `[[important phrase]]`
- legacy `[[CONTENT:...]]`

## Approved DOM and security contract

The application does not trust external HTML as the final DOM.

1. Extract one complete HTML document.
2. Remove scripts, noscript, base, refresh redirects, event handlers, and JavaScript URLs.
3. Reject forms, inputs, embeds, objects, iframes, and autoplay media.
4. Canonicalize the report to the 40-page contract.
5. Compare the returned DOM fingerprint with the approved DOM fingerprint.
6. Read only validated semantic values and P18 coordinates.
7. Re-render those values into the approved base DOM.

External CSS or DOM changes never become the final report structure.

## Blocking validation

Reject the report when:

- slide count is not 40;
- any page zone is not `main`;
- any Appendix page remains;
- page IDs, order, or required structures differ;
- Competitive Landscape, Category Clichés, Creative Insight, Final Choice, or Decision Close is missing;
- Creative Methodology remains;
- any unresolved field, position, bracket-highlight, or legacy content token remains;
- the semantic field set differs from the approved set;
- a field contains disallowed markup;
- the approved DOM fingerprint changes;
- the exact user-entered brand name is absent;
- core competitors are invalid, duplicated, or inconsistent across assigned pages;
- Persona, JTBD, AIPL, STP, route, or Final Choice fields contain structural labels instead of meaning;
- P18 axis poles, target labels, coordinates, or movement fail validation;
- Creative History status is invalid;
- an unapproved active element is included;
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
- Avoid polite explanatory endings except verified quotations or fixed UI labels.
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
- P18 target labels normalize to `<brand> AS-IS · ...` and `<brand> TO-BE · ...`.

## Highlighting

- Use yellow highlighting for governing phrases, decisive evidence, or final implications.
- Rich fields use `<mark>important phrase</mark>`.
- Do not use literal `[[important phrase]]`.
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
- The same core-three set, in ranking order, appears on pages 13–16, 18, and 30–33.
- Never invent competitors to fill capacity.
- Competitors outside the supported candidate Registry are not elevated into core analysis.
- Explicit non-candidates such as `추가 후보 없음`, `없음`, and `not-found` are hidden rather than presented as brands.
- Product Matrix and Positioning use only defensible common axes.

## P18 Positioning specification

### Axis labels

- `positioning.axis.xLeft`
- `positioning.axis.xRight`
- `positioning.axis.yTop`
- `positioning.axis.yBottom`

Each pole must be a meaningful Step 2 attribute. Opposing poles must differ. Literal axis names or directional shorthand are invalid.

### Point labels

- `positioning.competitor1.name`
- `positioning.competitor2.name`
- `positioning.competitor3.name`
- `positioning.targetAsIs`
- `positioning.targetToBe`

Target state labels include the exact brand plus `AS-IS` or `TO-BE`.

### Coordinate fields

- `positioning.competitor1.x/y`
- `positioning.competitor2.x/y`
- `positioning.competitor3.x/y`
- `positioning.targetAsIs.x/y`
- `positioning.targetToBe.x/y`

Coordinate rules:

- integer 0–100;
- x=0 left, x=100 right;
- y=0 top, y=100 bottom;
- derived from the declared axis logic;
- AS-IS and TO-BE must have a meaningful Euclidean separation;
- applied as `left/top` percentages and stored in `data-position-x/y`;
- map stores `data-positioning-coordinate-contract="semantic-0-100-v1"`.

## Page-specific semantic rules

- Page 2 fixed label: `핵심 진단`.
- Page 4 fixed label: `FACTS`.
- Page 5 fixed label: `CATEGORY & TARGET`.
- Page 10 fixed chapter: `CATEGORY SHIFT`; levels remain `LEVEL 1`–`LEVEL 5`.
- Persona pages retain `SITUATION / REAL JTBD / AS-IS IDENTITY / TO-BE IDENTITY / 브랜드의 역할`.
- Persona page titles reuse the three target names stated on page 21 CORE TARGET.
- Page 26 retains `Pain / 현재 문제 / Unmet Need / 우선순위`.
- Page 27 retains the approved AIPL friction-flow.
- Creative History uses a centered six-year system without decorative NOW circles.
- Page 34 retains Current Copy / Missing Character; its connector remains a symbol.
- Page 37 retains `Segmentation → Targeting → Positioning`.
- Page 38 retains A/B/C/D alternatives and 차별/확장/실행 comparison.
- Page 39 retains the approved two-column Selection Criteria / Final Choice layout.
- Page 40 is Decision Receipt / Close, not Appendix.

## Creative History rules

- Six-year coverage: 2021, 2022, 2023, 2024, 2025, and 2026 YTD.
- Canonical states:
  - `verified-verbatim`
  - `source-found-copy-unverified`
  - `not-found`
- Import compatibility may normalize `VERIFIED`, `COPY UNVERIFIED`, and `NOT FOUND`.
- New prompt output must use the canonical states.
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
- Never pass FULL into the Legacy selector.
- Visible `Export PDF`, Windows `Ctrl+P`, and macOS `Cmd+P` resolve the active FULL Viewer iframe.
- Consecutive export remains valid.

## Runtime and QA

Primary implementation files:

- `src/pages/BiznupFullIntegrated.tsx`
- `src/pages/BiznupFullIntegrated.css`
- `src/lib/installPhase6PagePlanV2.ts`
- `src/lib/installFullReportPhase6Bridge.ts`
- `src/report/semanticHtmlReportV5.ts`
- `src/report/semanticReportV4.ts`
- `src/report/structuredReportV3.ts`
- `src/report/structuredDefinitionPolicy.ts`
- `src/report/structuredReportCrossValidation.ts`
- `src/report/reportDomSafety.ts`
- `src/lib/installFullReportRuntimeCompatibility.ts`
- `src/lib/installFullReportPdfButtonBridge.ts`
- `src/lib/geminiCompiler.ts`
- `public/full-report-approved-v1.css`
- `scripts/test-full-report-contract.mjs`
- `scripts/test-full-report-runtime.mjs`
- `scripts/e2e-phase6-pdf-button-routing.mjs`
- `scripts/e2e-phase6-five-competitor-native-print.mjs`

Minimum QA:

- exactly 40 pages and 40 navigation links;
- zero Appendix pages;
- exact page order and IDs;
- no generic order fields or legacy content tokens;
- no unresolved field, coordinate, or literal highlight tokens;
- Script and active-content removal;
- exact semantic field set and approved DOM fingerprint;
- candidate-five Landscape and consistent core-three analysis;
- P18 brand labels, meaningful axes, dynamic coordinates, and movement;
- Creative History status normalization and factuality;
- logical 1280×720 canvases;
- zero body overflow or clipping;
- exact brand-name display;
- Persona 02/03 nowrap;
- Page 9 type floor;
- save and reopen;
- actual Export PDF button;
- second consecutive export;
- `Ctrl+P` and `Cmd+P`;
- native 40-page PDF with embedded fonts and no full-page raster rows;
- PDF preflight without warnings;
- E2E screenshot inspection and render inspection of all 40 PDF pages before visual completion.

## Current validated evidence

- Product/E2E head: `64a80282e82948229392330c055be5404dc90805`
- Browser/PDF E2E: PASS
- Vercel: Ready
- Preview: `https://brand-consulting-git-fix-phase6-main40-c77bea-dpes31s-projects.vercel.app/`
- Workflow run: `30799168241`
- Evidence artifact ID: `8850131424`
- E2E screens inspected: P17, P18, P29, P39, P40
- PDF: all 40 pages rendered and inspected; preflight warnings 0

## Protected rollback assets

- `public/template.html` remains untouched.
- Verified Legacy blob SHA: `22bc6937b3d672e063d4b240c5a39b9c61700fec`.
- Never modify or delete:
  - `backup/main-before-full-report-v1-2026-07-01`
  - `backup-production-stable-20260622`
