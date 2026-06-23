# AGENTS.md

Read `docs/PROJECT_HANDOFF.md`, `docs/phase5b-pilot-spec.md`, `docs/phase5b-gate2a-test-script.md`, and the files under `design/` before changing this repository.

## Safety

- Never commit directly to `main`.
- Never merge without explicit owner approval after Preview validation.
- Keep `backup-production-stable-20260622` untouched.
- Preserve validated branches.
- Keep `feature-visualization-engine-v1` and Draft PR #6 as the audit record of the failed prompt-only Phase 5 approach.
- Do not intentionally run or inspect Vercel Preview during Gate 2A unless separately authorized.

## Product invariants

- Preserve all 23 base wrappers.
- Main Deck remains 23–40 pages, with later evidence in the same HTML/PDF Appendix.
- Preserve exact 16:9 PDF output.
- Final direct competitors remain the locked Step 2 Registry of 2–5 brands.
- Preserve one Deep Dive and one six-year Creative History page per selected competitor.
- Do not invent figures, dates, campaign models, sources, or copy.
- Only verified verbatim copy may use quotation marks.
- Do not expose raw source URLs in final reports.

## Current status

- Phase 4 is owner-validated.
- The initial Phase 5 visualization approach failed quality review.
- Current branch: `feature-visual-recipe-pilot-v1` from `feature-creative-history-contract-v1`.
- Gate 1.5 specification is approved.
- Active gate: **Gate 2A — Visual Intent Brief prompt-contract testing**.

Gate 2A currently adds Visual Intent requirements to Steps 0, 2, 3, and 5, validates the marked JSON during the manual workflow, and records temporary repeated-run recipe audit data.

Relevant files:

- `src/lib/visualIntentBrief.ts`
- `src/lib/installVisualIntentWorkflowGuard.ts`
- `docs/phase5b-gate2a-test-script.md`

Gate 2A does not authorize:

- deterministic renderer work;
- `template.html` changes;
- Phase 6 compiler changes;
- PDF Export changes;
- runtime design-token integration;
- visual/geometry export validators;
- Draft PR creation;
- intentional Vercel Preview;
- merge or deployment.

The manual external-AI path is the approved test path. API-mode acceptance is not yet governed by the Gate 2A validator.

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

External reference libraries inform structural patterns only. Runtime output uses internal recipe IDs.

## Gate 2A pass condition

Do not start Gate 2B until Steps 0, 2, 3, and 5 each complete three valid repeated runs, registries remain intact, comparable runs achieve at least 80% primary-recipe agreement, unsupported recipes remain explicit, and the owner approves the outputs.

Update this file and `docs/PROJECT_HANDOFF.md` whenever the active gate, architecture, or acceptance criteria change.
