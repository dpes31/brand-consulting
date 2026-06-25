# AGENTS.md

Read `docs/PROJECT_HANDOFF.md`, `docs/phase5b-pilot-spec.md`, `docs/phase5b-gate2a-test-script.md`, and the files under `design/` before changing this repository.

## Safety

- Never commit directly to `main`.
- Never merge without explicit owner approval after Preview validation.
- Keep `backup-production-stable-20260622` untouched.
- Preserve validated branches.
- Keep `feature-visualization-engine-v1` and Draft PR #6 as the audit record of the failed prompt-only Phase 5 approach.
- Do not implement deterministic renderers during Gate 2A.

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
- Step 0 owner validation passed with three independent responses and 100% primary-recipe agreement.
- Step 2 owner validation passed with three independent valid responses, complete Metric metadata, and 100% required-role recipe agreement.
- Step 2 selected-competitor identities may differ across independent research runs; Gate 2A validates contract stability, while an actual report must use one chosen response and lock its single Registry.
- Step 3 owner validation passed on the corrected prompt with three independent valid responses and 100% `friction-flow` agreement.
- Step 5 first owner test failed because the copied prompt omitted the Visual Intent contract and models used a Step 2 Recipe or no marked block.
- Step 5 prompt-copy and validation correction is deployed; a new owner re-test is required.

Gate 2A adds Visual Intent requirements to Steps 0, 2, 3, and 5, validates the marked JSON during the manual workflow, and records temporary repeated-run recipe audit data.

Relevant files:

- `src/lib/visualIntentBrief.ts`
- `src/lib/installVisualIntentWorkflowGuard.ts`
- `src/lib/installStep3VisualIntentContract.ts`
- `src/lib/installStep5VisualIntentContract.ts`
- `docs/phase5b-gate2a-test-script.md`
- `docs/gate2a-prompts/`

## Gate 2A usability rules

- The user pastes the **entire AI response**: normal analysis plus the marked Visual Intent JSON block.
- JSON-only input is intentionally rejected because later research Steps require the normal analysis.
- Step 0 tests Growth Story only. Extra Brand Identity, KPI, or USP Visual Briefs are ignored with warnings; the copied prompt requests exactly one Growth Story brief.
- Three repeated runs mean three independently generated AI responses from the same prompt—not three submissions of one answer.
- Exact duplicate responses are rejected and do not count toward recipe stability.
- Step 2 uses exact role mappings:
  - Threat Ranking: `priority-ranking` → `rank-scorecard`.
  - Each selected competitor Deep Dive: `causal-relationship` → `competitor-threat-system`.
  - Product Matrix: `competitive-space` → `feature-matrix`.
  - Optional Positioning Map: `competitive-space` → `positioning-map`.
  - Missing evidence for a role: `evidence-gap` → `evidence-gap`.
- Step 2 requires exactly one Threat Ranking, exactly one Product Matrix, and exactly one independent Deep Dive per `COMPETITOR_REGISTRY.selected` competitor.
- Each Step 2 Deep Dive `entities` array must contain exactly one selected competitor name and must match the Registry exactly.
- Positioning Map is optional and limited to one Brief when two defensible common axes exist.
- Step 2 Metric objects are strict. If `metrics` is not empty, every item must contain `metricId`, `label`, numeric `value`, `unit`, `period`, `denominator`, `sourceLabel`, and `verificationStatus`.
- Step 2 `verificationStatus` is limited to `verified`, `partially-verified`, and `unverified`.
- Official statistics, filings, or government-source figures may be `verified`; company-announced figures and transparent analyst scores are `partially-verified`; unsupported or uncorroborated estimates are `unverified`.
- Step 2 stability ignores the number of Deep Dive Briefs and compares the required role recipes only: Threat Ranking, Deep Dive, and Product Matrix.
- Positioning Map participation is reported separately and does not lower the required-role stability score.
- The Step 2 audit storage key is versioned so prior pre-fix runs do not contaminate the new stability score.
- Step 3 normal analysis retains Trends, Persona, Identity Alignment, JTBD, AIPL Bottleneck, and Unmet Needs, but the Visual Intent JSON contains exactly one core consumer-decision Brief.
- Step 3 mapping is strict:
  - stable behavior sequence: `consumer-journey` → `customer-journey`;
  - concentrated abandonment, anxiety, delay, or friction: `causal-relationship` → `friction-flow`;
  - verified need priority or hierarchy: `priority-ranking` → `needs-hierarchy`;
  - insufficient behavioral evidence: `evidence-gap` → `evidence-gap`.
- Every Step 3 Recipe uses `implementationStatus: planned`.
- Step 3 Visual Intent metrics must be `[]`; quantitative facts remain in the normal analysis.
- The Step 3 copy guard re-applies the complete contract immediately before prompt copy so downstream Registry locking cannot remove it.
- Step 5 normal analysis retains SWOT, GAP, Root Cause, ToT 3 paths, Big IdeaL, Winning Move, Via Negativa, Pre-mortem, and execution sequence, but the Visual Intent JSON contains exactly one final strategy-decision Brief.
- Step 5 mapping is strict:
  - alternatives and trade-offs: `strategic-choice` → `choice-architecture`;
  - current-to-target transition: `causal-relationship` → `as-is-to-be`;
  - diagnosis-to-action synthesis: `causal-relationship` → `swot-to-strategy`;
  - validated execution order: `execution-roadmap` → `roadmap`;
  - insufficient strategy evidence: `evidence-gap` → `evidence-gap`.
- Every Step 5 Recipe uses `implementationStatus: planned`.
- Step 5 Visual Intent metrics must be exactly `[]`; quantitative evidence remains in the normal analysis.
- The Step 5 copy guard re-applies the complete contract immediately before prompt copy so Creative History and locked-context refreshes cannot remove it.
- Other-Step Recipes and additional Step 5 Visual Briefs are blocked.
- Outside Step 2, incomplete Metric objects on non-quantitative briefs remain warnings and are excluded. Quantitative-comparison briefs remain strict.

Gate 2A does not authorize:

- deterministic renderer work;
- `template.html` changes;
- Phase 6 compiler changes;
- PDF Export changes;
- runtime design-token integration;
- visual/geometry export validators;
- merge or production deployment.

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

Do not start Gate 2B until Steps 0, 2, 3, and 5 each have three independent valid responses, registries remain intact, comparable runs achieve at least 80% primary-recipe agreement, unsupported recipes remain explicit, and the owner approves the outputs.

Update this file and `docs/PROJECT_HANDOFF.md` whenever the active gate, architecture, usability contract, or acceptance criteria change.
