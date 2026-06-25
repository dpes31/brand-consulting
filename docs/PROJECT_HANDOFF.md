# Brand Consulting Generator — Project Handoff

Read this file and `AGENTS.md` before changing the repository. The owner requires reversible, branch-based work. Never merge to `main` without explicit approval.

## Repository

- Repo: `dpes31/brand-consulting`
- Production: `main`
- Rollback: `backup-production-stable-20260622`
- Validated Phase 4 base: `feature-creative-history-contract-v1`
- Completed Gate 2A branch: `feature-visual-recipe-pilot-v1`
- Current HTML pilot branch: `feature-visual-recipe-html-pilot-v1`
- Failed Phase 5 audit branch: `feature-visualization-engine-v1`
- Draft PR #6 remains the failed Phase 5 audit record.
- Draft PR #7 remains the completed Gate 2A contract record.

## Product invariants

- Preserve all 23 base wrappers and exact 16:9 output.
- Step 2 locks 2–5 direct competitors.
- Preserve one Deep Dive and one six-year Creative History page per selected competitor.
- Do not invent figures, dates, models, copy, or sources.
- Only verified verbatim copy may use quotation marks.
- Do not expose raw URLs in final reports.

## Validated work

- Phase 1: layout and 16:9 PDF safety.
- Phase 2: threat-ranked Competitor Registry.
- Phase 3: dynamic 23–40 page planning and Appendix.
- Phase 4: six-year Creative History factuality contract.
- Gate 1.5: Visual Intent and Recipe architecture specification.
- Gate 2A: prompt-contract validation for Steps 0, 2, 3, and 5.

Gate 2A final result: **PASS**

- Step 0: `milestone-timeline`, 100% agreement.
- Step 2: required-role Recipes, 100% agreement.
- Step 3: `friction-flow`, 100% agreement.
- Step 5: `choice-architecture`, 100% agreement.

## Current approved scope — Full 비즈넵 HTML pilot

The owner explicitly approved a full HTML pilot using five validated Recipes:

1. `milestone-timeline`
2. `competitor-threat-system`
3. `feature-matrix`
4. `friction-flow`
5. `choice-architecture`

The pilot is implemented as a fixed 23-page 16:9 React deck exposed through:

```text
/?pilot=biznup
```

Implemented files:

- `src/pages/BiznupHtmlPilot.tsx`
- `src/pages/BiznupHtmlPilot.css`
- `src/App.tsx`
- `docs/phase5b-html-pilot.md`

The pilot uses the consistent locked competitor fixture:

- 삼쩜삼
- 더낸세금·혜움
- SSEM

## Pilot behavior

- Recipe slides use deterministic markup and CSS.
- Each Recipe slide declares `data-recipe-id` and `data-viz-type`.
- Runtime audit reports five unique Recipe IDs, 23 pages, and detected overflow.
- Browser print CSS preserves 16:9 pages for PDF review.
- The deck includes the full strategic narrative from company growth through competitive threat, consumer friction, strategic choice, Winning Move, and execution risk.

## Safety boundary

This pilot does not alter:

- `src/lib/geminiCompiler.ts`;
- `public/template.html`;
- the existing PDF export path;
- saved report compatibility;
- `main` or rollback branches.

The pilot validates visual quality before any Phase 6 compiler integration. Compiler integration, template replacement, automated Recipe routing, merge, and production deployment remain separate approval boundaries.

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

## Next review

Owner reviews the Vercel Preview for:

- information hierarchy;
- copy density;
- five Recipe structures;
- 23-page consistency;
- overflow;
- print/PDF behavior.

Only after owner approval should the project decide whether to integrate the validated pilot structures into the Phase 6 compiler.
