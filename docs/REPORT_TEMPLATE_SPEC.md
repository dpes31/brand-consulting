# FULL Report Template Specification

## Status

Approved reference template for the Brand Consulting Generator.

- Route: `/?pilot=full-integrated&brand=<exact user-entered brand>`
- Main Deck: 40 pages
- Appendix: 8 pages
- Canvas: 1280×720
- Aspect ratio: exact 16:9
- Typeface: Pretendard

This document specifies the approved visual and information-design target. The React reference route and the production `public/template.html` compiler path remain distinct until a separate migration is implemented and regression-tested.

## Information hierarchy

Every analytical page should answer one decision question through this order:

1. Section / breadcrumb
2. Conclusion-led page title
3. Governing visual structure
4. Evidence or comparison
5. Interpretation
6. `SO WHAT` implication
7. Source or caveat

A page is not a container for all prose. Preserve substance through prioritization, continuation pages, and Appendix evidence rather than shrinking text.

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
- The `brand` query parameter is the current reference-route binding.

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
- A box must communicate a category, state, evidence class, choice, or transition; decorative containment is not sufficient.
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

### 0. Brand Fact Book

- Executive / core diagnosis
- Identity
- KPI
- Category and target
- Growth Story
- Core Inflection
- Product USP and Brand Best Self

### I. Market

- Context
- Category/value shift

### II. Competitor

- Landscape / Registry
- Threat Ranking
- One Deep Dive per selected competitor
- Product Matrix
- Category Clichés
- Positioning

### III. Consumer

- Executive Conclusion
- Trends
- Core Target
- Persona 1–3
- Identity Alignment and JTBD
- Pain Points and Unmet Needs
- AIPL Bottleneck
- Purchase to Loyalty

### IV. Creative

- Methodology
- Target-brand Creative History
- One Creative History page per selected competitor
- Message Trajectory
- Creative Insight

### V. Strategy

- SWOT
- GAP and Root Cause
- STP
- Four Strategic Directions
- Final Choice

## Appendix structure

1. Winning Move Specification
2. Via Negativa
3. Pre-mortem
4. Execution Roadmap
5. Measurement Plan
6. Evidence Gaps
7. Source Labels
8. Final Direction / close

## Dynamic competitor rules

- Step 2 Registry selects 2–5 direct competitors.
- Each selected competitor receives one independent Deep Dive.
- Each selected competitor receives one six-year Creative History page.
- Competitors outside the locked Registry must not be elevated into core analysis.
- Product matrices and positioning maps use only defensible common axes.

## Creative History rules

- Six-year coverage: five completed years plus current-year YTD.
- Status language should be understandable to non-specialists.
- Verified verbatim copy may be quoted.
- Source-found but unverified copy must not be reconstructed inside quotation marks.
- Publicly unconfirmed evidence is disclosed as an evidence gap.
- Source labels remain near the relevant evidence.

## Definitions and notes

- Explain specialist terms such as JTBD and AIPL on every page where the acronym is used and the audience may not know it.
- Notes are small, quiet reference text below the title rule; they are not primary callout boxes.
- Use plain Korean labels where an English production term does not help the reader.

## Source treatment

- Do not show raw URLs in the final report.
- Use source name, document/title, and year.
- Attach sources to the relevant evidence structure rather than leaving them visually detached.
- Unverified data must not drive chart geometry as though it were verified.

## Runtime and QA

Reference implementation files:

- `src/pages/BiznupFullIntegrated.tsx`
- `src/pages/BiznupFullIntegrated.css`
- `src/pages/BiznupFullIntegratedRefinement.css`
- `src/pages/density-v2-*.css`
- `src/pages/density-v3-final.css`
- `src/pages/density-v4-contextual.css`
- `src/pages/density-v5-fixes.css`
- `src/pages/full-report-density-v2-runtime.ts`
- `src/pages/full-report-v4-runtime.ts`
- `scripts/report-visual-qa.mjs`

Minimum QA checks:

- 48 rendered pages
- every canvas 1280×720
- no body overflow or clipping
- no broken timeline/arrow endpoints
- aligned equal-hierarchy rules and boxes
- no unexplained blank regions
- readable body/table/diagram text
- exact brand-name display
- source proximity
- visual hierarchy makes the page's argument identifiable within seconds

## Known implementation debt

The reference report currently uses layered refinement CSS and runtime DOM transformations. The next refactor should consolidate repeated overrides into shared components and tokens, but must preserve approved output and remain reversible.
