# AGENTS.md

Read `docs/PROJECT_HANDOFF.md`, `docs/phase5b-pilot-spec.md`, `docs/phase5b-gate2a-test-script.md`, `docs/phase5b-html-pilot.md`, and the files under `design/` before changing this repository.

## Safety

- Never commit directly to `main`.
- Never merge without explicit owner approval.
- Keep `backup-production-stable-20260622` untouched.
- Preserve `feature-visual-recipe-pilot-v1` as the completed Gate 2A contract branch.
- Keep `feature-visualization-engine-v1` and Draft PR #6 as the failed Phase 5 audit record.
- Do not replace the production compiler, template, or PDF path during the HTML pilot.

## Product invariants

- Preserve all 23 base wrappers and exact 16:9 output.
- Step 2 locks 2–5 direct competitors.
- Preserve one Deep Dive and one six-year Creative History page per selected competitor.
- Do not invent figures, dates, campaign models, sources, or copy.
- Only verified verbatim copy may use quotation marks.
- Do not expose raw source URLs in final reports.

## Current status

- Current branch: `feature-visual-recipe-html-pilot-v1`.
- Base branch: `feature-visual-recipe-pilot-v1`.
- Gate 2A is complete and passed.
- Owner approved a full 비즈넵 HTML pilot using five validated recipes.
- Implemented pilot recipes:
  - `milestone-timeline`
  - `competitor-threat-system`
  - `feature-matrix`
  - `friction-flow`
  - `choice-architecture`
- The pilot is a fixed 23-page 16:9 review deck exposed through `?pilot=biznup`.
- It does not yet replace or integrate with `geminiCompiler.ts`, `public/template.html`, or the production PDF flow.

## Pilot implementation files

- `src/pages/BiznupHtmlPilot.tsx`
- `src/pages/BiznupHtmlPilot.css`
- `docs/phase5b-html-pilot.md`
- `src/App.tsx`

## Pilot quality rules

- One slide answers one decision question.
- Recipe slides must declare `data-recipe-id` and `data-viz-type`.
- No arbitrary inline colors in recipe markup.
- Equal-hierarchy elements use equal grid tracks.
- The deck must contain 23 slides and five unique validated recipe IDs.
- Runtime audit reports page count, unique recipe count, and slide overflow.
- Print CSS preserves 16:9 browser PDF review.

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

The current HTML pilot validates the visual result before compiler integration. Production compiler integration, template replacement, merge, and deployment remain separate approval boundaries.
