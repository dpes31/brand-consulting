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

**Future requirement:** Validate legacy 23-page reports, dynamic pages, Appendix, navigation, source handling, and PDF before adopting the 40+8 component system as the universal generated-report renderer.

## D-012 — Final consolidation source

**Decision:** Integrate `feature-visual-recipe-pilot-v1` into `feature-main-full-report-integration-v1` through regular merge PR #12.

**Included:** cumulative Phase 1–4 work, Gate 1.5 specifications, Gate 2A prompt contracts and validators.

**Excluded:** failed PR #6 and superseded report experiments PR #8, #9, and #10.

**Merge anchor:** `e607e397819b061c4676e3a2bdfb210f9d1b349b`.
