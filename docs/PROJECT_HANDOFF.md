# Brand Consulting Generator — Project Handoff

Read this file and `AGENTS.md` before changing the repository. The owner requires reversible, gate-based work. Never merge to `main` without explicit approval.

## Repository

- Repo: `dpes31/brand-consulting`
- Production: `main`
- Rollback: `backup-production-stable-20260622`
- Validated base: `feature-creative-history-contract-v1`
- Failed Phase 5 audit branch: `feature-visualization-engine-v1`
- Failed Draft PR: #6 — retain for audit, do not merge.
- Current branch: `feature-visual-recipe-pilot-v1`

## Product invariants

- Preserve all 23 base wrappers.
- Main Deck remains 23–40 pages; later evidence remains in the same HTML/PDF Appendix.
- Preserve exact 16:9 PDF output.
- Step 2 locks 2–5 direct competitors; no Indirect Competitor section.
- Preserve one Deep Dive and one six-year Creative History page per selected competitor.
- Do not invent figures, dates, models, copy, or sources.
- Only verified verbatim copy may use quotation marks.
- Do not expose raw URLs in final reports.

## Validated phases

- Phase 1: layout and 16:9 PDF safety.
- Phase 2: threat-ranked Competitor Registry.
- Phase 3: dynamic 23–40 page planning and Appendix.
- Phase 4: six-year Creative History factuality contract.

The prompt-only Phase 5 visualization experiment failed owner quality review because fixed placeholders still produced card walls, colors conflicted, hierarchy was inconsistent, and warning-only checks did not prevent weak output.

## Phase 5B architecture

```text
Research
→ Step-level Visual Intent Brief
→ Semantic Slide Plan
→ constrained Recipe Router
→ deterministic HTML/CSS/SVG Renderer
→ blocking Validator
→ existing PDF Export
```

External reference libraries inform structural patterns only. Runtime output uses internal recipe IDs.

## Gate 1.5 — approved

Specification files:

- `docs/phase5b-pilot-spec.md`
- `design/DESIGN.md`
- `design/visual-intent.schema.json`
- `design/recipe-selection-matrix.json`
- `design/recipes/milestone-timeline.schema.json`
- `design/recipes/competitor-threat-system.schema.json`
- `design/recipes/feature-matrix.schema.json`
- `design/feature-flags.json`

Frozen pilot recipes:

1. `milestone-timeline`
2. `competitor-threat-system`
3. `feature-matrix`

Planned flag: `visualRecipePilot`, default `false`. It is not implemented yet.

## Current gate — Gate 2A

Status: **Visual Intent prompt contract and manual validation support implemented; repeated owner testing pending.**

Implemented files:

- `src/lib/visualIntentBrief.ts`
- `src/lib/installVisualIntentWorkflowGuard.ts`
- `src/main.tsx`
- `docs/phase5b-gate2a-test-script.md`

Current behavior:

- Steps 0, 2, 3, and 5 request a marked Visual Intent JSON block.
- Step 4 remains unchanged.
- Step 2 output order is analysis → Competitor Registry → Visual Intent Brief.
- Manual submission validates markers, JSON, step allowlists, priorities, input lists, metric metadata, units, and implementation status.
- Invalid manual output is not accepted.
- Valid runs store temporary session audit data and report recent primary-recipe agreement.

Allowed recipes:

| Step | Recipes |
|---|---|
| 0 | milestone-timeline, growth-trajectory, before-after, evidence-gap |
| 2 | rank-scorecard, competitor-threat-system, feature-matrix, positioning-map, evidence-gap |
| 3 | customer-journey, friction-flow, needs-hierarchy, evidence-gap |
| 5 | choice-architecture, as-is-to-be, swot-to-strategy, roadmap, evidence-gap |

Test procedure: `docs/phase5b-gate2a-test-script.md`.

Gate 2A passes only after Steps 0, 2, 3, and 5 each complete three valid comparable runs, Registry contracts remain intact, primary-recipe agreement reaches at least 80%, unsupported recipes remain explicit, and the owner approves the outputs.

## Gate 2A limits

- Manual external-AI workflow only.
- API-mode response acceptance is not yet covered by this validator.
- No renderer exists.
- No Phase 6 compiler or PDF change.
- No `template.html` change.
- No intentional Vercel Preview was authorized or inspected.
- No Draft PR or merge.

## Next approval boundary

Gate 2B begins only after explicit owner approval of Gate 2A results. It will be limited to deterministic rendering of the three frozen pilot recipes behind the planned feature flag.

## Deferred Phase 6 defects

1. Navigation may return to the research start screen.
2. Second PDF export may re-render instead of using cache.
3. Regress old 23-page and new dynamic reports.
4. Consolidate and deploy only after explicit approval.

## Future-session workflow

1. Read this file and `AGENTS.md`.
2. Confirm the active gate.
3. Keep work gate-scoped.
4. Do not begin renderer work until the owner approves Gate 2A outputs.
5. Update handoff documents whenever status changes.
6. Never merge to `main` without explicit approval.
