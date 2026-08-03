# Decision Log

## D-001 — Reversible production workflow

**Decision:** Production changes require a feature branch, Preview review, explicit owner approval, and a preserved rollback branch.

**Status:** Permanent.

## D-002 — Protected rollback assets

**Decision:** Never modify, force-update, or delete:

- `backup/main-before-full-report-v1-2026-07-01`
- `backup-production-stable-20260622`
- Legacy `public/template.html` with verified blob SHA `22bc6937b3d672e063d4b240c5a39b9c61700fec`

## D-003 — Preserve milestone history

**Decision:** Use regular merge or fast-forward for milestones. Do not squash unless explicitly approved.

## D-004 — Creative copy factuality

**Decision:** Advertising copy may appear in quotation marks only when verified verbatim.

- `verified-verbatim`: quotation permitted
- `source-found-copy-unverified`: no reconstructed quotation
- `not-found`: disclose evidence gap

## D-005 — Reject heuristic visualization engine

**Decision:** Do not merge `feature-visualization-engine-v1` / PR #6.

**Status:** Retain as failed audit evidence.

## D-006 — Validated Visual Intent contracts

**Decision:** Freeze accepted Step mappings.

- Step 0: Growth Story → `milestone-timeline`
- Step 2: Threat Ranking → `rank-scorecard`; Product Matrix → `feature-matrix`; Positioning optional
- Step 3: one core consumer Brief → `friction-flow`; `implementationStatus: planned`; `metrics: []`
- Step 5: one final strategy Brief → `choice-architecture`; `implementationStatus: planned`; `metrics: []`

## D-007 — Approved Pilot owns structure, not sample content

**Decision:** The approved Pilot provides DOM, CSS, component hierarchy, order, navigation, and print structure only. Completed Biznup wording is never a generated-report content source.

**Current implementation:** Variable content is bound to stable semantic `data-report-field` keys. External AI values are validated and reassembled into the approved DOM. Text-node-order `CONTENT SLOT` mapping is superseded and prohibited.

## D-008 — Exact user brand is immutable

**Decision:** Preserve the exact user-entered brand name in navigation, toolbar, report content, saved project, reopened project, and PDF. Never translate or romanize it.

## D-009 — Current report size supersedes the historical 48-page contract

**Decision:** The current Phase 6 product outputs exactly **40 Main Deck pages and zero Appendix pages**.

**Consequences:**

- Page 40 is Decision Receipt / Close.
- Every slide uses logical 1280×720 geometry.
- PDF MediaBox is 960×540pt.
- Historical 40+8 and 48-page rules are superseded.
- Creative Methodology and Appendix A1–A7 are excluded.

## D-010 — Candidate-five to core-three competitor logic

**Decision:** Separate competitor discovery from core analysis.

- Page 11 Competitive Landscape may compare up to five evidence-supported Direct Competitor candidates.
- Page 12 Threat Ranking selects the core three when three supported candidates exist.
- Pages 13–15, 16, 18, 30–32, and 33 use the same core-three set in ranking order.
- Never invent competitors to fill capacity.
- Explicit unused rows may be hidden rather than rendered as a false competitor.

## D-011 — Restore strategic bridge pages

**Decision:** Competitive Landscape, Category Clichés, and Creative Insight remain in the Main Deck.

**Reason:** They preserve the sequence category scan → competitor selection → differentiation → strategy.

## D-012 — Fixed 40-page plan

**Decision:** Use this exact sequence:

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

## D-013 — Page grammar is part of the product contract

**Decision:** AI may fill research content but may not redesign page meaning.

- P2 fixed label `핵심 진단`
- P4 fixed label `FACTS`
- P5 fixed label `CATEGORY & TARGET`
- P10 fixed chapter `CATEGORY SHIFT`, levels `LEVEL 1`–`LEVEL 5`
- Persona uses Situation / JTBD / identity-shift structure and page 21 target names
- Pain Points, AIPL, Creative Insight, STP, Four Directions, and Final Choice retain approved structures
- Persona `02` and `03` are atomic nowrap labels
- Creative History uses centered six-year cards without decorative NOW circles
- Connector glyphs remain short symbols, never prose

## D-014 — Consulting tone is declarative

**Decision:** Titles, conclusions, body judgments, and SO WHAT statements use decisive Korean endings such as `~한다`, `~이다`, `~다`.

## D-015 — Final Choice composition

**Decision:** Page 39 retains the approved two-column composition:

- left: Selection Criteria
- right: Big IdeaL / Winning Move final choice

Generic full-width or stacked choice layouts are invalid.

## D-016 — FULL PDF uses native print

**Decision:** Phase 6 FULL reports use Chromium native print after blocking preflight, not full-page JPEG conversion.

**Acceptance:**

- exactly 40 pages
- all pages `data-zone="main"`
- 960×540pt MediaBox
- embedded font objects
- no full-page 2560×1440 raster rows
- same HTML in Viewer, saved project, reopened project, and PDF

## D-017 — Legacy and FULL PDF runtimes are mutually exclusive

**Decision:** Legacy `.slide-wrapper > .slide` printing never owns a Phase 6 FULL `.full-slide` report.

## D-018 — Actual-button PDF E2E is mandatory

**Decision:** PDF completion requires the actual app journey:

- visible Export PDF button
- active Viewer iframe
- first and second consecutive exports
- `Ctrl+P` and `Cmd+P`
- save → reload → reopen
- page count, dimensions, fonts, raster structure, overflow, navigation, and persistence

Successful deployment or helper-only tests are insufficient.

## D-019 — External AI returns complete HTML, never JSON

**Decision:** The owner-approved external workflow is:

`Step 0–5 → complete HTML prompt → external AI complete 40-page HTML → app validation and approved-DOM reassembly`.

**Consequences:**

- `Return JSON only` and `Never return HTML` are prohibited in the external Phase 6 prompt.
- PR #21 and PR #23 JSON-only external workflows are superseded audit records.
- A JSON workflow may not be hidden behind generic UI labels.
- Internal validation objects do not change the user-facing HTML input/output contract.

## D-020 — Semantic fields replace text-order slots

**Decision:** Variable content uses stable role-based keys, not DOM text order.

Examples:

- `comp-ranking.rank1.name`
- `persona-1.realJob`
- `aipl.stage3.action`
- `strategy-choice.winningMove`

**Rules:**

- `[[FIELD:semantic.key]]` exists only in the exported authoring template.
- Every field token must be replaced before import.
- Returned field set and approved field set must match exactly.
- Generic `.contentN` and `[[CONTENT:Pxx:TAG:nnn]]` mappings are invalid.
- External DOM/CSS is not trusted; validated values are moved into the approved DOM.

## D-021 — Rich text uses safe HTML, not literal bracket notation

**Decision:** Rich fields may contain only `<mark>` and `<br>` descendants. All other fields are plain text.

**Reason:** `[[important phrase]]` was rendered literally in a real external-AI result.

**Blocking rule:** Any unresolved `[[FIELD:...]]`, `[[POSITION:...]]`, or literal `[[...]]` in the compiled report is an error.

## D-022 — P18 Positioning requires semantic coordinates

**Decision:** P18 labels and point geometry are both data-driven.

- Axis poles are defensible Step 2 attributes, not literal axis labels.
- Target labels normalize to `<brand> AS-IS · ...` and `<brand> TO-BE · ...`.
- Ten position values cover core competitors 1–3 and target AS-IS/TO-BE.
- x=0 left, x=100 right; y=0 top, y=100 bottom.
- Coordinates are integers 0–100.
- AS-IS and TO-BE must show meaningful movement.
- Applied positions are stored in DOM data attributes for validation and persistence.

**Reason:** A real result changed axis wording while leaving all points at sample coordinates.

## D-023 — Creative History status codes are canonical

**Decision:** Stored and rendered status values are exactly:

- `verified-verbatim`
- `source-found-copy-unverified`
- `not-found`

**Compatibility:** Common humanized variants such as `VERIFIED`, `COPY UNVERIFIED`, and `NOT FOUND` may be normalized on import, but new prompts demand canonical values.

## D-024 — Current implementation record

**Decision:** Continue only on:

- branch `fix/phase6-main40-final-html-semantic-v5`
- Draft PR #24

**Validated product/E2E head:** `64a80282e82948229392330c055be5404dc90805`

**Validation:** Production build PASS; browser/PDF E2E PASS; Vercel Ready; E2E screenshots and all 40 PDF page renders inspected.

**Preview:** `https://brand-consulting-git-fix-phase6-main40-c77bea-dpes31s-projects.vercel.app/`

**Approval:** Keep Draft and do not merge until explicit owner approval.

**Superseded:** PR #18–#23. Do not merge them.
