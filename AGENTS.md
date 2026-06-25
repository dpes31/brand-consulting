# AGENTS.md

Read `docs/PROJECT_HANDOFF.md`, `docs/biznup-full-content-preservation-matrix.md`, `docs/phase5b-pilot-spec.md`, and the files under `design/` before changing this repository.

## Safety

- Never commit directly to `main`.
- Never merge without explicit owner approval.
- Keep `backup-production-stable-20260622` untouched.
- Preserve `feature-visual-recipe-pilot-v1` as the completed Gate 2A branch.
- Preserve `feature-visual-recipe-html-pilot-v1` and Draft PR #8 as the superseded summary-pilot record; do not merge it.
- Keep `feature-visualization-engine-v1` and Draft PR #6 as the failed Phase 5 audit record.
- Do not alter `geminiCompiler.ts`, `public/template.html`, or the production PDF path during this visual Preview.

## Product invariants

- The task is a visual revision of the existing FULL report, not an executive-summary rewrite.
- Preserve the original report sections and Step 0–5 analytical substance.
- Dense content creates continuation or Appendix pages; it does not justify deletion.
- Preserve exact 16:9 slide geometry.
- Preserve one Deep Dive and one six-period Creative History for every selected competitor.
- Creative History covers 2021–2025 completed years plus 2026 YTD.
- Do not invent figures, dates, campaign models, sources, or copy.
- Only verified verbatim copy may use quotation marks.
- Do not expose raw source URLs in final report pages.

## Current status

- Active branch: `feature-full-report-visual-recipe-v1`.
- Base branch: `feature-visual-recipe-pilot-v1`.
- Gate 2A passed.
- The owner rejected the first 23-page summary pilot because it deleted required content.
- The corrected Preview is defined as 40 Main Deck pages plus 8 Appendix pages.
- The corrected deck restores Identity, KPI, all competitor detail, three Personas, JTBD, all four six-period Creative Histories, SWOT, STP, four strategy directions, Big IdeaL, Winning Move, Via Negativa, Pre-mortem, roadmap, evidence gaps, and sources.

## Visual Recipe scope

The five validated Recipes replace only the visual structure of assigned pages:

- `milestone-timeline` — Growth Story;
- `competitor-threat-system` — each selected competitor Deep Dive;
- `feature-matrix` — Product Matrix;
- `friction-flow` — AIPL purchase bottleneck;
- `choice-architecture` — strategy trade-off and final choice.

They must not replace or delete the surrounding report sections.

## Blocking Preview checks

The Preview is incomplete if any preservation-matrix item is absent. Runtime audit must report:

- Main 40 / 40;
- Appendix 8 / 8;
- Recipe 5 / 5;
- Required Sections 40 / 40;
- Overflow 0.

## Current implementation

- `src/pages/BiznupFullReportLoader.tsx`
- `public/biznup-full-payload-01.js` through `09.js`
- `public/biznup-full-payload-07-fixed.js`
- `docs/biznup-full-content-preservation-matrix.md`
- Preview query: `?pilot=full-biznup`

Compiler integration, template replacement, merge, and production deployment remain separate approval boundaries.
