# Decision Log

## D-001 — Reversible production workflow

**Decision:** Production changes require a feature branch, Preview review, explicit owner approval, and a preserved rollback branch.

**Status:** Permanent operating rule.

## D-002 — Backup before FULL report transition

**Decision:** Preserve the former `main` at `backup/main-before-full-report-v1-2026-07-01`.

**Reason:** The owner must be able to restore the application to the state before the FULL report and Visual Intent integration.

**Rule:** Never modify, force-update, or delete this branch.

## D-003 — Preserve milestone commit history

**Decision:** Use regular merge or fast-forward for milestone integrations; do not squash.

**Reason:** Phase and report-development history must remain auditable.

## D-004 — Competitor selection

**Decision:** Step 2 selects 2–5 direct competitors through a threat-ranked Registry.

**Consequences:**

- No indirect-competitor section in the core report.
- Each selected competitor gets one independent Deep Dive.
- Each selected competitor gets one six-year Creative History page.

## D-005 — Creative copy factuality

**Decision:** Advertising copy may appear in quotation marks only when verified verbatim.

**Consequences:**

- `verified-verbatim`: quotation permitted.
- `source-found-copy-unverified`: describe without reconstructing quotation.
- `not-found`: disclose the evidence gap.

## D-006 — Dynamic report size

**Decision:** Preserve 23 mandatory legacy wrappers. Main Deck may expand to 40 pages; later evidence continues in the same report as Appendix.

**Status:** Historical contract for the legacy generator. Superseded for the current Phase 6 production target by D-013.

## D-007 — Reject heuristic visualization engine

**Decision:** Do not merge `feature-visualization-engine-v1` / PR #6.

**Reason:** The heuristic engine did not reliably preserve information structure and visual quality.

**Status:** Retain branch and PR as audit evidence.

## D-008 — Visual Intent contract

**Decision:** Models propose a constrained information structure before rendering; external template names are not executable Recipe IDs.

**Architecture:**

Research → Visual Intent Brief → Semantic Slide Plan → constrained Recipe Router → deterministic renderer → blocking validator → PDF.

## D-009 — Gate 2A accepted mappings

**Decision:** Freeze the validated Step contracts.

- Step 0: event-led Growth Story → `milestone-timeline`.
- Step 2: Threat Ranking → `rank-scorecard`; selected competitor Deep Dive → `competitor-threat-system`; Product Matrix → `feature-matrix`; Positioning Map optional.
- Step 3: one core consumer Brief; accepted test result `friction-flow`; `implementationStatus: planned`; `metrics: []`.
- Step 5: one final strategy Brief; accepted test result `choice-architecture`; `implementationStatus: planned`; `metrics: []`.

## D-010 — Approved FULL report reference

**Decision:** The approved design reference is the 40-page Main Deck + 8-page Appendix React route at `/?pilot=full-integrated&brand=<brand>`.

**Fixed design principles:**

- 1280×720, exact 16:9.
- Pretendard; major title weight 900.
- Exact user-entered brand name.
- Keep-all Korean wrapping.
- Body copy normally no smaller than page numbering, except sources/caveats.
- Yellow highlighting for governing phrases and decision implications.
- Evidence-appropriate diagrams over generic prose card walls.
- Equal tracks and aligned geometry for equal-hierarchy items.

## D-011 — Compiler/template boundary

**Decision:** Merging the React reference route does not silently replace `public/template.html` or all compiler outputs.

**Reason:** The generator's production HTML/PDF path requires separate migration and regression testing.

**Status:** Historical boundary. The separate migration and regression testing were completed in PR #14; see D-013 and D-014.

## D-012 — Final consolidation source

**Decision:** Integrate `feature-visual-recipe-pilot-v1` into `feature-main-full-report-integration-v1` through regular merge PR #12.

**Included:** cumulative Phase 1–4 work, Gate 1.5 specifications, Gate 2A prompt contracts and validators.

**Excluded:** failed PR #6 and superseded report experiments PR #8, #9, and #10.

**Merge anchor:** `e607e397819b061c4676e3a2bdfb210f9d1b349b`.

## D-013 — Fixed 48-page Phase 6 production contract

**Decision:** The normal `/` Phase 6 product path uses exactly 40 Main Deck pages and 8 Appendix pages.

**Consequences:**

- Production output is one standalone HTML document with exactly 48 `.full-slide` elements.
- Every slide remains 1280×720.
- The approved Pilot page-specific DOM, CSS, components, page order, navigation, and print rules are the layout source.
- `public/template.html` remains a protected rollback asset and is not overwritten.

## D-014 — Separate approved layout from sample content

**Decision:** The approved Pilot may provide layout structure only. Its completed Biznup report wording is not a valid content source for generated reports.

**Implementation:**

- Visible sample text is neutralized into `CONTENT SLOT` tokens before prompt export.
- All slots are filled from the current Step 0–5 research.
- External-AI and internal-API paths use the same content contract.
- Unresolved slots block rendering.
- Missing Step 0 KPI evidence and missing top Step 2 direct competitors block rendering.

**Reason:** Embedding completed sample content caused external models to reproduce the Pilot's Biznup conclusions even when the research differed.

## D-015 — Visual color correction is a separate follow-up

**Decision:** Known color inconsistencies on detailed pages are handled after the Phase 6 content-neutral baseline is merged.

**Scope boundary:**

- Use a new preview-first branch and Draft PR from updated `main`.
- Correct color tokens, contrast, page-specific overrides, and PDF color consistency.
- Do not alter the 48-page contract, content-slot validation, Step 0–5 research logic, or protected legacy template.
- Merge only after actual generated-page review and explicit owner approval.
