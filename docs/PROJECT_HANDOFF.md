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
- Current Draft PR: #7 — Gate 2A owner validation only; do not merge.

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

Status: **Visual Intent prompt contract and manual validation support implemented; repeated owner testing in progress.**

Owner validation status:

- Step 0: passed with three independent valid responses and 100% `milestone-timeline` agreement.
- Step 2: first owner run failed because the copied prompt did not expose the exact evidenceType/Recipe mappings and allowed combined Deep Dive Briefs.
- Step 2 correction: implemented and awaiting owner re-test.
- Steps 3 and 5: not yet tested.

Implemented files:

- `src/lib/visualIntentBrief.ts`
- `src/lib/installVisualIntentWorkflowGuard.ts`
- `src/main.tsx`
- `docs/phase5b-gate2a-test-script.md`
- `docs/gate2a-prompts/step0-appendix.txt`
- `docs/gate2a-prompts/step2-appendix.txt`
- `docs/gate2a-prompts/step3-appendix.txt`
- `docs/gate2a-prompts/step5-appendix.txt`
- `docs/phase5b-gate2a-results.md`

Current behavior:

- Steps 0, 2, 3, and 5 request a marked Visual Intent JSON block.
- Step 4 remains unchanged.
- Step 2 output order is analysis → Competitor Registry → Visual Intent Brief.
- The user must paste the complete AI response, not JSON alone.
- Manual submission validates markers, JSON, step allowlists, priorities, input lists, metric metadata, units, and implementation status.
- Invalid manual output is not accepted.
- Valid runs store temporary session audit data and report recent primary-recipe agreement.
- Exact duplicate responses are rejected and do not count as separate runs.

### Gate 2A usability correction after first Step 0 owner test

The first Step 0 test exposed two contract problems:

1. the model produced extra Visual Briefs for Brand Identity/KPI/Product USP, including an evidence type outside the Step 0 pilot scope;
2. non-quantitative briefs included partial Metric objects, which the validator treated as blocking errors.

Corrections on the current branch:

- Step 0 prompt requests exactly one Growth Story Visual Brief.
- Step 0 extra non-Growth briefs are ignored with warnings during the pilot.
- incomplete metrics are warnings and excluded when the brief is not `quantitative-comparison`;
- quantitative comparison remains strict and requires at least two complete, unit-compatible metrics;
- missing `denominator` is normalized to `null` with a warning;
- validation errors explicitly instruct the user to paste the full response;
- duplicate answer submission is blocked to prevent a false stability score.

Step 0 then passed three independent owner runs with 100% primary-recipe agreement.

### Gate 2A usability correction after first Step 2 owner test

The first Step 2 test exposed three contract problems:

1. the copied prompt listed Recipe IDs but did not expose the exact evidenceType → Recipe mapping for each required role;
2. the generic example biased the model toward `competitor-threat-system`, causing Threat Ranking to omit `rank-scorecard`;
3. multiple selected competitors could be combined into one Deep Dive Brief even though later page planning requires one Deep Dive per competitor.

Corrections on the current branch:

- the copied Step 2 prompt now lists all allowed evidenceTypes;
- Threat Ranking is fixed to `priority-ranking` → `rank-scorecard`;
- each selected competitor Deep Dive is fixed to `causal-relationship` → `competitor-threat-system`;
- Product Matrix is fixed to `competitive-space` → `feature-matrix`;
- optional Positioning Map is fixed to `competitive-space` → `positioning-map`;
- missing evidence for a role uses `evidence-gap` → `evidence-gap`;
- the prompt includes separate examples for Threat Ranking, one Deep Dive, and Product Matrix;
- the prompt tells the model to duplicate the Deep Dive object once per selected competitor;
- the validator requires exactly one Threat Ranking and exactly one Product Matrix;
- the validator requires exactly one independent Deep Dive per `COMPETITOR_REGISTRY.selected` competitor;
- every Deep Dive `entities` array must contain exactly one selected competitor name and no Registry-external competitor;
- Positioning Map is optional and limited to one Brief.

Three runs mean three independently generated AI responses from the same unchanged prompt and evidence. They do not mean submitting one identical response three times.

Allowed recipes:

| Step | Recipes |
|---|---|
| 0 | milestone-timeline, growth-trajectory, before-after, evidence-gap |
| 2 | rank-scorecard, competitor-threat-system, feature-matrix, positioning-map, evidence-gap |
| 3 | customer-journey, friction-flow, needs-hierarchy, evidence-gap |
| 5 | choice-architecture, as-is-to-be, swot-to-strategy, roadmap, evidence-gap |

Test procedure: `docs/phase5b-gate2a-test-script.md`.

Gate 2A passes only after Steps 0, 2, 3, and 5 each have three independent valid comparable responses, Registry contracts remain intact, primary-recipe agreement reaches at least 80%, unsupported recipes remain explicit, and the owner approves the outputs.

## Gate 2A limits

- Manual external-AI workflow only.
- API-mode response acceptance is not yet covered by this validator.
- No renderer exists.
- No Phase 6 compiler or PDF change.
- No `template.html` change.
- No merge or production deployment.

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
