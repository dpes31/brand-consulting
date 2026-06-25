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
- Current Draft PR: #7 — do not merge.

## Product invariants

- Preserve all 23 base wrappers and exact 16:9 PDF output.
- Main Deck remains 23–40 pages with later evidence in the same HTML/PDF Appendix.
- Step 2 locks 2–5 direct competitors.
- Preserve one Deep Dive and one six-year Creative History page per selected competitor.
- Do not invent figures, dates, models, copy, or sources.
- Only verified verbatim copy may use quotation marks.
- Do not expose raw URLs in final reports.

## Validated phases

- Phase 1: layout and 16:9 PDF safety.
- Phase 2: threat-ranked Competitor Registry.
- Phase 3: dynamic 23–40 page planning and Appendix.
- Phase 4: six-year Creative History factuality contract.
- Gate 1.5: Phase 5B architecture and three frozen pilot Recipes approved.

## Gate 2A — completed

Overall result: **PASS**

Owner validation:

- Step 0: three independent valid responses; 100% `milestone-timeline` agreement.
- Step 2: three independent valid responses; complete Metric metadata; 100% required-role agreement.
- Step 3: three independent valid responses; exactly one core Brief; 100% `friction-flow` agreement.
- Step 5: three independent valid responses; exactly one final strategy Brief; 100% `choice-architecture` agreement.

Step 5 test 2 specifically confirmed:

- full Step 5 contract present in the copied prompt;
- `strategic-choice` → `choice-architecture` in all three responses;
- `implementationStatus: planned` in all three responses;
- `metrics: []` in all three responses;
- one Visual Intent Brief only;
- no other-Step Recipe use;
- 100% stability across three distinct responses.

## Implemented Gate 2A files

- `src/lib/visualIntentBrief.ts`
- `src/lib/installVisualIntentWorkflowGuard.ts`
- `src/lib/installStep3VisualIntentContract.ts`
- `src/lib/installStep5VisualIntentContract.ts`
- `src/main.tsx`
- `docs/phase5b-gate2a-test-script.md`
- `docs/gate2a-prompts/step0-appendix.txt`
- `docs/gate2a-prompts/step2-appendix.txt`
- `docs/gate2a-prompts/step3-appendix.txt`
- `docs/gate2a-prompts/step5-appendix.txt`
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

## Gate boundary

Gate 2B has **not** started.

Do not implement deterministic renderers, template changes, compiler changes, PDF changes, feature-flag rollout, merge, or production deployment until the owner explicitly approves Gate 2B and its exact scope.

## Known limitation

The Gate 2A validator covers the approved manual external-AI workflow. API-mode response acceptance is not yet governed by the same blocking validator.
