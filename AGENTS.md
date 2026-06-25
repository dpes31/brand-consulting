# AGENTS.md

Read `docs/PROJECT_HANDOFF.md`, `docs/phase5b-pilot-spec.md`, `docs/phase5b-gate2a-test-script.md`, and the files under `design/` before changing this repository.

## Safety

- Never commit directly to `main`.
- Never merge without explicit owner approval.
- Keep `backup-production-stable-20260622` untouched.
- Preserve validated branches.
- Keep `feature-visualization-engine-v1` and Draft PR #6 as the failed Phase 5 audit record.
- Do not begin renderer work until the owner explicitly approves Gate 2B.

## Product invariants

- Preserve all 23 base wrappers and exact 16:9 PDF output.
- Main Deck remains 23–40 pages with later evidence in the same HTML/PDF Appendix.
- Step 2 locks 2–5 direct competitors.
- Preserve one Deep Dive and one six-year Creative History page per selected competitor.
- Do not invent figures, dates, campaign models, sources, or copy.
- Only verified verbatim copy may use quotation marks.
- Do not expose raw source URLs in final reports.

## Current status

- Current branch: `feature-visual-recipe-pilot-v1` from `feature-creative-history-contract-v1`.
- Gate 1.5 is approved.
- Gate 2A owner validation is complete and passed.
- Step 0: three valid responses, 100% `milestone-timeline` agreement.
- Step 2: three valid responses, complete Metric metadata, 100% required-role agreement.
- Step 3: three valid responses, 100% `friction-flow` agreement.
- Step 5: three valid responses, 100% `choice-architecture` agreement.
- Gate 2B has not started and requires explicit owner approval.

## Gate 2A contracts

- The user pastes the entire AI response, including the marked Visual Intent JSON block.
- Duplicate responses do not count toward stability.
- Step 0: exactly one Growth Story brief.
- Step 2: one Threat Ranking, one Product Matrix, and one Deep Dive per selected competitor. Positioning Map is optional and reported separately.
- Step 3: exactly one core consumer-decision brief. All Step 3 Recipes are `planned`; `metrics` must be `[]`.
- Step 5: exactly one final strategy-decision brief. All Step 5 Recipes are `planned`; `metrics` must be `[]`.
- Step 3 and Step 5 copy guards re-apply their full contracts immediately before prompt copy.

Relevant files:

- `src/lib/visualIntentBrief.ts`
- `src/lib/installVisualIntentWorkflowGuard.ts`
- `src/lib/installStep3VisualIntentContract.ts`
- `src/lib/installStep5VisualIntentContract.ts`
- `docs/phase5b-gate2a-test-script.md`
- `docs/phase5b-gate2a-results.md`

## Architecture direction

```text
Research
→ Step-level Visual Intent Brief
→ Semantic Slide Plan
→ constrained Recipe Router
→ deterministic HTML/CSS/SVG Renderer
→ blocking Validator
→ existing PDF Export
```

Gate 2A does not authorize renderer, template, compiler, PDF, merge, or production changes.

Update this file and `docs/PROJECT_HANDOFF.md` whenever the active gate or acceptance criteria change.
