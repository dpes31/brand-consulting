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

## D-007 — Approved Pilot is structure, not sample content

**Decision:** The approved Pilot provides DOM, CSS, component, order, navigation, and print structure only. Completed Biznup wording is never a generated-report content source.

**Current implementation:** ProductionReportV3 semantic values are injected into the app-owned Pilot DOM. Historical generic `CONTENT SLOT` filling is superseded as the primary path.

## D-008 — Exact user brand is immutable

**Decision:** Preserve the exact user-entered brand name in navigation, toolbar, report content, saved project, reopened project, and PDF. Never translate or romanize it.

## D-009 — Current report size supersedes the historical 48-page contract

**Decision:** The current Phase 6 product outputs exactly **40 Main Deck pages and zero Appendix pages**.

**Consequences:**

- Page 40 is Decision Receipt / Close.
- Every slide uses logical 1280×720 geometry.
- PDF MediaBox is 960×540pt.
- Historical 40+8 and 48-page rules are superseded.
- Creative Methodology and Appendix A1–A7 are excluded from the approved output.

## D-010 — Candidate-five to core-three competitor logic

**Decision:** Separate competitor discovery from core analysis.

- Page 11 Competitive Landscape may compare up to five evidence-supported Direct Competitor candidates.
- Page 12 Threat Ranking selects the core three when three supported candidates exist.
- Pages 13–15, 16, 18, 30–32, and 33 use the same core-three set in ranking order.
- Never invent competitors to fill capacity.

**Reason:** A broad Landscape supports defensible selection, while three core competitors preserve report focus and restore the approved logic.

## D-011 — Restore the missing strategic bridge pages

**Decision:** Restore these pages to the Main Deck:

- Competitive Landscape
- Category Clichés
- Creative Insight

**Reason:** Removing them to accommodate competitors 4–5 broke the logical sequence from category scan → selection → differentiation → strategy.

## D-012 — Fixed 40-page plan

**Decision:** Use the following exact sequence:

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
- P5 fixed WANT / AVOID
- P10 fixed chapter `CATEGORY SHIFT`, levels `LEVEL 1`–`LEVEL 5`
- P13–15 fixed Deep Dive headings and threat-rank labels
- P17 fixed three-column cliché structure
- Persona uses Situation / JTBD / identity-shift structure and page 21 target names
- Pain Points, AIPL, Loyalty, Creative Insight, STP, Four Directions, and Final Choice retain approved structures
- Persona `02` and `03` are atomic nowrap labels
- Creative History uses centered six-year cards without decorative NOW circles
- Connector glyphs remain short symbols, never prose

## D-014 — Consulting tone is declarative

**Decision:** Titles, conclusions, body judgments, and SO WHAT statements use decisive Korean endings such as `~한다`, `~이다`, `~다`.

**Rule:** Avoid `~합니다`, `~입니다`, `~됩니다`, and `~해야 합니다` except verified quotations or fixed UI labels.

## D-015 — Final Choice composition

**Decision:** Page 39 retains the approved two-column composition:

- left: Selection Criteria
- right: Big IdeaL / Winning Move final choice

Generic full-width or stacked choice layouts are invalid.

## D-016 — FULL PDF uses native print

**Decision:** Phase 6 FULL reports use Chromium native print after blocking preflight, not full-page JPEG conversion.

**Current acceptance:**

- exactly 40 pages
- all pages `data-zone="main"`
- 960×540pt MediaBox
- embedded Pretendard fonts
- no full-page 2560×1440 raster rows
- same HTML in Viewer, saved project, reopened project, and PDF

## D-017 — Legacy and FULL PDF runtimes are mutually exclusive

**Decision:** Legacy `.slide-wrapper > .slide` printing never owns a Phase 6 FULL `.full-slide` report.

**Implementation:**

- install FULL runtime before Legacy guard
- retain browser-native print
- route visible `Export PDF`, Windows `Ctrl+P`, and macOS `Cmd+P` to the active FULL Viewer iframe
- show clear guidance when no FULL report exists

## D-018 — Actual-button PDF E2E is mandatory

**Decision:** PDF completion requires the actual app journey:

- visible Export PDF button
- active Viewer iframe
- first export
- second consecutive export
- `Ctrl+P`
- `Cmd+P`
- save → reload → reopen → export
- page count, dimensions, fonts, raster structure, overflow, navigation, persistence

Helper tests, standalone HTML, or successful deployment alone are insufficient.

## D-019 — PR #20 is a failed real-world QA record

**Decision:** Do not merge PR #20.

**Reason:** Automated runtime/PDF tests passed, but a real external-AI complete-HTML run changed semantic DOM, moved content into wrong fields, inserted script, and persisted viewport scale.

**Reference:** `handoff/PHASE6_REAL_WORLD_QA_HANDOFF_2026-07-08.md`.

## D-020 — App owns the Renderer; AI owns structured values only

**Decision:** Production Phase 6 uses one shared ProductionReportV3 JSON contract for external AI and internal API.

**Implementation boundary:**

- AI returns page-scoped JSON values only.
- The application owns all HTML, CSS, fixed labels, rows, columns, connectors, page order, navigation, geometry, and print rules.
- The application validates exact pages, keys, maxLength, cross-page consistency, Creative History factuality, and DOM fingerprint before rendering.
- Complete HTML generation by AI is not a production path.
- Complete HTML paste remains only as a sanitized compatibility importer.

**Status:** Permanent unless explicitly reversed by the owner after a new architecture review.

## D-021 — JSON output is the expected external-AI deliverable

**Decision:** A downloaded Phase 6 prompt must instruct the external AI to return JSON, not HTML.

**Consequences:**

- Do not adopt `The assistant, not the application, must generate the complete standalone HTML`.
- Do not request JSON and HTML as two final deliverables.
- The UI must explicitly explain that the user copies JSON back into Phase 6 and the app generates the final HTML.
- A JSON response alone is not a failure; schema violations inside that JSON remain failures.

## D-022 — AI prompts contain data contracts, not Renderer contracts

**Decision:** External-AI prompts must not expose DOM implementation instructions.

**Creative History rule:**

- remove `.timeline-container`, `.timeline-card`, `data-year`, and `data-copy-status` from the AI-facing prompt;
- keep fixed years in Renderer metadata;
- expose status as an exact machine-readable enum;
- let the app assign classes, attributes, and quotation styling.

**Reason:** Mixing JSON-only output with DOM instructions caused the real external-AI response to emit invalid values such as `2021 · not-found`.

## D-023 — Constrained compatibility normalization

**Decision:** The app may repair only a narrowly defined, lossless status format from the owner's current response.

Allowed example:

- expected 2021 field + `2021 · not-found` → `not-found`

Requirements:

- prefix year must match the field's fixed year;
- suffix must equal one approved status;
- repair emits a page/field warning;
- strict validation runs after repair;
- all other malformed values remain blocking errors.

## D-024 — Current implementation record

**Decision:** Continue only on:

- branch `fix/phase6-structured-report-renderer-v1`
- Draft PR #21

**Validated implementation head before handoff-only updates:** `8a4601d7a4895e32a521112f467d75af40678b86`

**Validation:** Production build PASS; Phase 6 browser/PDF E2E PASS; Vercel Preview Ready.

**Remaining approval gates:**

- explicit five-step JSON workflow UX;
- Creative History data-only prompt;
- enum/fixed-year schema metadata;
- safe normalization or actionable errors for the owner's current response;
- two corrected real external-AI runs;
- owner Preview review.

<!-- PHASE6_EXTERNAL_JSON_COMPLETION_2026-07-09 -->
## D-025 — Phase 6 external-AI JSON workflow is implemented and code-validated

**Decision:** Keep ProductionReportV3 JSON as the sole AI-authored production contract. The application owns the fixed 40-page HTML/CSS Renderer.

**Implementation:**

- explicit five-step external-AI JSON UX;
- data-only Creative History prompt;
- exact status enum and fixed-year metadata;
- constrained `expected year · exact enum` compatibility normalization;
- Korean page/field warnings and blocking errors;
- one shared manual/API contract and Renderer;
- complete-HTML import isolated as sanitized compatibility only.

**Validated product-code head:** `d3b2ebd104d6bfddb90ba3051f92a9710b3a2a07`.

**Automated gates:** build/contracts, structured Renderer, masked owner-defect normalization, invalid-status rejection, HTML Sanitizer, persistence, native PDF, repeated export, Ctrl+P, Cmd+P all PASS.

**Remaining gate:** two owner-run real external-AI responses and owner Preview approval. PR #21 stays Draft; `main` remains unchanged.

