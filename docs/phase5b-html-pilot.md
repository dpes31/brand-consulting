# Phase 5B — Biznup Full HTML Pilot

## Scope

This branch implements an owner-reviewable 23-page HTML pilot for 비즈넵 using the five recipes validated in Gate 2A:

1. `milestone-timeline`
2. `competitor-threat-system`
3. `feature-matrix`
4. `friction-flow`
5. `choice-architecture`

The pilot is available through `?pilot=biznup` and does not replace the production report compiler.

## Architecture

- React renders a fixed 23-page 16:9 deck.
- Recipe slides use deterministic markup and CSS.
- Every recipe slide declares `data-recipe-id` and `data-viz-type`.
- The page performs a lightweight runtime audit for page count, unique recipe count, and slide overflow.
- Print CSS preserves 16:9 pages for browser PDF review.

## Evidence fixture

The pilot uses one consistent locked competitor set:

- 삼쩜삼
- 더낸세금·혜움
- SSEM

It uses the accepted Gate 2A response set for 비즈넵. Strategic evaluation scores are displayed as evaluation scores, not official market share. Company-announced figures retain their evidence caveat.

## Safety boundary

- Base branch preserved: `feature-visual-recipe-pilot-v1`
- New branch: `feature-visual-recipe-html-pilot-v1`
- `main`, rollback, validated Phase 4 branches, existing compiler, template, and PDF code remain unchanged.
- This pilot does not merge the new recipes into the Phase 6 compiler.
- Production deployment is not authorized.

## Review criteria

Owner review should focus on:

- information hierarchy;
- whether each slide answers one decision question;
- scanability of the five recipe structures;
- copy density and overflow;
- consistency across 23 pages;
- 16:9 print/PDF behavior.
