# FULL Report Template Specification

## Status

Approved production target for the Brand Consulting Generator.

- Reference route: `/?pilot=full-integrated&brand=<exact user-entered brand>`
- Production route: `/`, Phase 6
- Main Deck: exactly 40 pages
- Appendix: exactly 8 pages
- Total: exactly 48 pages
- Canvas: 1280×720
- Aspect ratio: exact 16:9
- Typeface: Pretendard

The approved Pilot is the immutable layout source. Its completed Biznup wording is not a content source. Before prompt export, visible sample text is replaced with neutral `CONTENT SLOT` tokens and must be rebuilt from the current Step 0–5 research.

## Production compilation contract

The normal Phase 6 flow is:

`Step 0–5 research`
→ `approved Pilot DOM/CSS capture`
→ `sample text neutralization`
→ `research-driven slot filling`
→ `blocking validation`
→ `standalone 48-page HTML`
→ `Viewer / save / reopen / PDF`

The following remain fixed:

- CSS declarations and design tokens
- page-specific structural class names
- page order
- navigation shell
- 1280×720 geometry
- approved component hierarchy
- print and PDF rules

The following must come from the current research:

- brand conclusions and titles
- metrics and dates
- competitors and threat ranking
- Persona and consumer analysis
- Creative History and source labels
- SWOT and STP
- strategic routes, Winning Move, and Final Choice

No unresolved `CONTENT SLOT` may remain in the final HTML.

## Blocking validation

Reject the report when any of the following occurs:

- slide count is not 48;
- page IDs or page labels are missing or duplicated;
- approved layouts are missing;
- unresolved content slots remain;
- the exact user-entered brand name is absent;
- Step 0 KPI evidence is not sufficiently represented;
- the top Step 2 direct competitors are absent;
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

## Typography

- Major titles: Pretendard 900.
- Body: Pretendard Medium/SemiBold according to hierarchy.
- Page numbering establishes the practical body-size floor.
- Standard body, table, and diagram text should normally be equal to or larger than page numbering.
- Source labels, status labels, and caveats may be smaller but must remain legible.
- Avoid thin grey body text.
- Do not reduce font size as the first overflow response.

## Korean wrapping

Use:

- `word-break: keep-all`
- `overflow-wrap: break-word`
- strict line breaking
- balanced wrapping for titles
- readable/pretty wrapping for body copy where supported

Do not break Korean words at arbitrary syllables. When a sentence remains too long, revise box width, hierarchy, or content structure before reducing type.

## Brand naming

- Display the exact brand name entered by the user.
- Do not automatically translate, romanize, abbreviate, or reinterpret the brand name.
- The `brand` query parameter remains the reference-route binding.

## Highlighting

- Use yellow highlighting for the governing phrase, decisive evidence, or final implication.
- Combine highlight with bold weight.
- Do not highlight entire paragraphs.
- Generated content may use `<mark>` or `.text-highlight`.
- Automated highlighting should target evidence units and `SO WHAT` conclusions, not arbitrary keywords.

## Layout and density

- Use the full content region; avoid large unassigned blank areas.
- Optically center compact analytical structures between the title area and `SO WHAT` footer.
- Equal-hierarchy columns use equal grid tracks, aligned top/bottom rules, and stable heights.
- Remove decorative vertical bars, empty boxes, and duplicate indices that do not explain meaning.
- A box must communicate a category, state, evidence class, choice, or transition.
- Preserve safe margins around arrows, labels, and timeline endpoints.

## Preferred visual structures

Use the structure that matches the evidence function:

- chronology and inflection → milestone timeline
- ranked importance or threat → scorecard
- common-axis comparison → matrix
- evidence-to-consequence → causal flow
- customer friction → friction flow
- identity change → AS-IS / TO-BE
- segment selection → STP convergence
- alternatives and trade-offs → choice architecture
- execution sequence → roadmap
- missing evidence → evidence-gap panel

Avoid generic four-card walls and prose disguised as diagrams.

## Main Deck structure

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
11. Competitive Landscape
12. Threat Ranking
13. Deep Dive 1
14. Deep Dive 2
15. Deep Dive 3
16. Product Matrix
17. Category Cliché
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
29. Creative Methodology
30. Target Brand Creative History
31. Competitor Creative History 1
32. Competitor Creative History 2
33. Competitor Creative History 3
34. Message Trajectory
35. Creative Insight
36. SWOT
37. GAP & Root Cause
38. STP
39. Four Strategic Directions
40. Final Choice

## Appendix structure

41. Winning Move Specification / conditional competitor slot
42. Via Negativa / conditional Creative History slot
43. Pre-mortem / conditional competitor slot
44. Execution Roadmap / conditional Creative History slot
45. Measurement Plan
46. Evidence Gaps
47. Source Labels
48. Decision Receipt / close

## Dynamic competitor rules

- Step 2 Registry selects 2–5 direct competitors.
- The three highest-ranked competitors use Main Deck Deep Dive pages 13–15 and Creative History pages 31–33.
- Competitors 4–5 may use Appendix pages 41–44 as Deep Dive + Creative History pairs.
- Each selected competitor receives one independent Deep Dive.
- Each selected competitor receives one six-year Creative History page.
- Competitors outside the locked Registry must not be elevated into core analysis.
- Product matrices and positioning maps use only defensible common axes.

## Creative History rules

- Six-year coverage: 2021, 2022, 2023, 2024, 2025, and 2026 YTD.
- Verified verbatim copy may be quoted.
- Source-found but unverified copy must not be reconstructed inside quotation marks.
- Publicly unconfirmed evidence is disclosed as an evidence gap.
- Source labels remain near the relevant evidence.
- Each page retains Message Trajectory and Strategic So What.

## Definitions and notes

- Explain specialist terms such as JTBD and AIPL on pages where the audience may not know them.
- Notes are small, quiet reference text below the title rule; they are not primary callout boxes.
- Use plain Korean labels where an English production term does not help the reader.

## Source treatment

- Do not show raw URLs in the final report.
- Use source name, document/title, and year.
- Attach sources to the relevant evidence structure.
- Unverified data must not drive chart geometry as though it were verified.

## Runtime and QA

Primary implementation files:

- `src/pages/BiznupFullIntegrated.tsx`
- `src/pages/BiznupFullIntegrated.css`
- `src/report/fullReportCompiler.ts`
- `src/report/researchContentTemplate.ts`
- `src/report/researchSlotPrompt.ts`
- `src/lib/installFullReportPhase6Bridge.ts`
- `src/lib/geminiCompiler.ts`
- `src/report/normalizeApprovedFullReportHtml.ts`
- `public/full-report-approved-v1.css`
- `public/full-report-v1.js`
- `public/template-full-report-v1.html`
- `scripts/test-full-report-runtime.mjs`
- `scripts/e2e-phase6-production.mjs`

Minimum QA checks:

- exactly 48 rendered pages
- 48 navigation links
- every canvas 1280×720
- no body overflow or clipping
- no unresolved content slots
- exact brand-name display
- Step 0 KPI presence
- top Step 2 direct-competitor presence
- required Persona, Creative History, SWOT, STP, and Final Choice layouts
- save and reopen
- two consecutive 48-page PDF exports
- no broken timeline/arrow endpoints
- aligned equal-hierarchy rules and boxes
- readable body/table/diagram text
- source proximity
- actual generated-page visual review before declaring visual completion

## Known implementation debt

- The report still uses layered CSS files and some page-specific overrides.
- Some detailed generated pages show color inconsistencies.
- The next task should correct color tokens, contrast, selector conflicts, and print/PDF color consistency in a new preview-first branch from updated `main`.
- That follow-up must not change the Phase 6 content-slot contract, page count, research logic, protected rollback branches, or `public/template.html`.
