# AGENTS.md

Read `handoff/PROJECT_HANDOFF.md`, `handoff/DECISION_LOG.md`, `docs/REPORT_TEMPLATE_SPEC.md`, `docs/phase5b-gate2a-results.md`, and the files under `design/` before changing this repository.

## Safety

- Use preview-first feature branches. Merge only with explicit owner approval.
- Preserve commit history; do not squash milestone integrations unless explicitly approved.
- Never modify or delete `backup-production-stable-20260622` or `backup/main-before-full-report-v1-2026-07-01`.
- Preserve validated and audit branches.
- `feature-visualization-engine-v1` and PR #6 are failed audit records and must not be merged.

## Product invariants

- Preserve the 23 mandatory legacy wrappers and exact 16:9 PDF behavior.
- The production generator supports a 23–40 page Main Deck plus Appendix.
- Step 2 locks 2–5 direct competitors.
- Preserve one Deep Dive and one six-year Creative History page per selected competitor.
- Do not invent figures, dates, models, scores, axes, sources, or copy.
- Only verified verbatim copy may use quotation marks.
- Do not expose raw source URLs in final reports.

## Validated Visual Intent contracts

- Step 0: exactly one Growth Story Brief; `milestone-timeline` reached 100% agreement across three accepted runs.
- Step 2: one Threat Ranking, one Product Matrix, and one independent Deep Dive per selected competitor; Positioning Map is optional; Metric metadata must be complete.
- Step 3: exactly one core consumer-decision Brief; `friction-flow` reached 100% agreement; all recipes are `planned`; `metrics` is `[]`.
- Step 5: exactly one final strategy-decision Brief; `choice-architecture` reached 100% agreement; all recipes are `planned`; `metrics` is `[]`.
- Step 3 and Step 5 prompt-copy guards must restore the complete contract immediately before prompt copy.

## Approved report reference

- Route: `/?pilot=full-integrated&brand=<exact user-entered brand>`.
- Structure: 40-page Main Deck plus 8-page Appendix, 1280×720.
- Typography: Pretendard; major titles use weight 900.
- Preserve Korean word units with `word-break: keep-all`.
- Body text normally remains at least page-number size; source labels and caveats are exceptions.
- Use yellow highlighting for governing phrases and decision implications.
- Prefer timelines, matrices, causal flows, convergence diagrams, and choice architecture over prose card walls.
- Equal-hierarchy elements use equal tracks and aligned geometry.
- Preserve the exact user-entered brand name without automatic translation.

## Architecture boundary

The repository contains the production research/prompt/compiler path and the approved 40+8 React reference report route. The reference route does not by itself mean every `public/template.html`-generated report uses the same component system. Any full compiler/template migration requires separate implementation and regression testing.

## Documentation

Update these whenever architecture, branch state, contracts, or rollback procedures change:

- `handoff/PROJECT_HANDOFF.md`
- `handoff/WORK_LOG.md`
- `handoff/DECISION_LOG.md`
- `docs/REPORT_TEMPLATE_SPEC.md`
