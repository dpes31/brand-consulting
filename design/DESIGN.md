# Deterministic Slide Design System

## 1. Purpose

This document defines design principles for Phase 5B. It is descriptive, not executable. Machine-readable behavior is defined separately in JSON Schemas and recipe-selection files.

The system must translate verified research into consulting-grade visual structures without asking a model to freely author slide CSS.

## 2. Core principle

One slide should answer one decision question.

The slide hierarchy is:

```text
Decision Question
→ Governing Message
→ Evidence Structure
→ Interpretation
→ Implication / Decision
```

The slide is not a storage container for all available prose. Research substance is preserved through prioritization, continuation pages, and Appendix evidence—not by shrinking every sentence into one page.

## 3. Visual grammar

Use visual structures according to evidence function:

- Time change → timeline or growth trajectory.
- Comparable numbers → scorecard, matrix, bar, dot plot, bridge, or waterfall.
- Priority → rank scorecard or choice architecture.
- Cause and effect → threat system, issue tree, or system map.
- Sequential work → process flow or journey.
- Friction and abandonment → friction flow or funnel leakage.
- Competitive space → feature matrix or positioning map.
- Strategic transition → AS-IS / TO-BE, strategy choice, or roadmap.
- Missing evidence → evidence-gap panel.

Do not use an external template name as a recipe ID. Umbrex, EdrawMax, and other references inform only the abstract information pattern.

## 4. Layout rules

- Logical canvas: 1280×720.
- PDF page: exact 16:9, 960×540pt equivalent.
- A slide may contain one primary visual structure and one supporting interpretation area.
- Repeated equal-hierarchy items must use equal grid tracks.
- A central mechanism or decision must occupy the strongest spatial hierarchy.
- Decorative boxes are not considered a visual structure.
- Overflow is solved through prioritization or continuation pages, not indiscriminate font reduction.

## 5. Typography hierarchy

The final token values will be implemented later. Gate 1.5 freezes the semantic levels:

- `display`: cover or major section statement.
- `title`: slide decision question or governing title.
- `message`: one-sentence governing message.
- `section-label`: phase, category, or axis label.
- `body`: supporting evidence.
- `caption`: source label, definition, or caveat.
- `metric`: verified quantitative evidence.

No renderer may invent additional typography scales through inline styles.

## 6. Color principles

- Dark theme is the initial pilot theme.
- Every color is referenced by a semantic token.
- Generated recipe markup must not contain inline hex, RGB, HSL, or named CSS colors.
- Target brand emphasis uses the brand-accent token.
- Competitors do not receive arbitrary brand colors.
- Risk, opportunity, warning, and evidence confidence use shared semantic tokens.
- Color is never the sole carrier of meaning; labels, symbols, or patterns must accompany it.

Planned token families:

- background;
- surface-1, surface-2, surface-3;
- text-primary, text-secondary, text-muted;
- accent;
- risk;
- opportunity;
- warning;
- evidence-high, evidence-medium, evidence-low;
- border-subtle, border-strong;
- chart-1 through chart-6.

## 7. Evidence integrity

- Only verified metrics may drive chart geometry.
- Units, periods, denominators, and source labels must travel with a metric.
- Mixed units cannot share one visual axis.
- Missing values are never inferred or interpolated by the renderer.
- Unverified campaign copy is not rendered as a quotation.
- Evidence gaps remain visible rather than being converted into generic claims.

## 8. Recipe-selection discipline

A recipe is selected through three layers:

1. Research Step Allowlist.
2. Evidence Type Compatibility.
3. Required Input Availability.

The model may propose one primary and one fallback recipe. The Phase 6 router makes the final decision. Unsupported recipes are recorded as planned or unsupported, never silently replaced with a generic card wall.

## 9. Pilot recipes

Gate 1.5 freezes three initial recipe contracts:

- `milestone-timeline`;
- `competitor-threat-system`;
- `feature-matrix`.

Renderer implementation is outside Gate 1.5.

## 10. Blocking quality rules

Future implementation must block rendering or PDF export for:

- invalid recipe ID;
- required-field omission;
- contrast failure;
- slide overflow;
- arbitrary inline color;
- mixed-unit chart data;
- unverified chart metric;
- asymmetrical equal-hierarchy comparison geometry;
- missing `data-recipe-id` or `data-viz-type`;
- evidence-driven slide rendered only as generic text cards.

## 11. Reference-use policy

Reference libraries are used to identify reusable information patterns such as milestones, issue trees, journeys, matrices, and strategic choices. The system must not:

- copy a proprietary slide one-for-one;
- depend on an external template number or file;
- reproduce external artwork, iconography, or layout details verbatim;
- allow a model to claim it used a specific external template without verified access.

## 12. Backward compatibility

Existing report HTML remains readable through the Phase 4 legacy path. Recipe rendering applies only when a valid recipe manifest exists and the pilot feature flag is enabled.
