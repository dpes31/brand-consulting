# Phase 5 — Visualization Engine

## Objective

Convert evidence-heavy report pages from generic text-card walls into decision-oriented visual structures without reducing research substance or inventing data.

## Core principle

Visualization is not decoration. Each slide must express:

1. the decision question;
2. the evidence;
3. the correct visual form;
4. the interpretation;
5. the implication.

## Allowed visual grammar

Use pure HTML/CSS/SVG only. Canvas and cross-origin visual assets are prohibited because they can break PDF export.

- KPI strip: 1–4 headline metrics with labels and evidence notes.
- Horizontal bars: comparable values on a common scale.
- Delta bars: before/after or company/benchmark differences.
- Dot plot: many entities with one comparable metric.
- Timeline: verified temporal progression.
- Matrix or heatmap: feature/brand comparison.
- 2×2 positioning map: two explicit strategic axes.
- Process flow: ordered operational steps.
- System map: causal or relational structure.
- Quote evidence: short verbatim statement with source label.

## Selection rules

- Do not chart a single isolated number as if it were a trend.
- Do not compare values with different units or definitions on one scale.
- Do not infer missing values to complete a chart.
- When comparable data are insufficient, use a qualitative diagram or explicitly label the evidence gap.
- A slide with two or more comparable numeric values should normally include a chart.
- A slide explaining sequence, causality, or role relationships should normally include a flow or system map.
- Creative History keeps the approved six-year timeline contract.

## Density and symmetry rules

- One primary visual hierarchy per slide.
- No more than four equal-weight text boxes without a visual anchor.
- Symmetric comparisons use equal grid tracks and stretched card heights.
- Large decision numbers should be visually dominant; explanatory text remains secondary.
- Every visual includes a concise interpretation and source/evidence label.

## Machine-readable contract

Visual components use `data-viz-type` with one of:

- `kpi-strip`
- `bar-comparison`
- `delta-comparison`
- `dot-plot`
- `timeline`
- `matrix`
- `positioning-map`
- `process-flow`
- `system-map`
- `verbatim-evidence`
- `evidence-gap`

Each evidence-driven slide should expose `data-visual-role` values such as `decision`, `evidence`, `interpretation`, and `implication`.

## Validation

The viewer performs warning-only validation for:

- quantitative slides without a recognized visual;
- text-heavy slides with no visual anchor;
- more than four text boxes without an evidence graphic;
- missing `data-viz-type` on dynamic visual components;
- visibly asymmetric sibling boxes in comparison grids.

Warnings never delete or rewrite report content.

## Acceptance criteria

1. Phase 6 compiler prompt contains `VISUALIZATION ENGINE CONTRACT`.
2. Quantitative market and competitor pages use chartable structures when evidence supports them.
3. Process and strategy pages use flows or system maps rather than prose-only card grids.
4. Creative History pages remain six-year timelines.
5. No canvas is introduced.
6. PDF remains exact 16:9 with all pages present.
7. Existing 23-page reports remain readable.
8. Runtime validation records warnings without blocking rendering or export.
