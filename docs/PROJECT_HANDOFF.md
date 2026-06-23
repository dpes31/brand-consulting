# Brand Consulting Generator — Project Handoff

> Read this file before changing the repository. The owner is a non-developer and requires preview-first, reversible changes. Never merge to `main` without explicit approval after Preview validation.

## Repository and deployment

- Repository: `dpes31/brand-consulting`
- Production branch: `main`
- Production deployment: Vercel
- Stable rollback branch: `backup-production-stable-20260622`
- Validated development chain:
  1. `feature-layout-safety-v1`
  2. `feature-competitor-selection-v1`
  3. `feature-dynamic-page-planner-v1`
  4. `feature-creative-history-contract-v1`
- Failed Phase 5 audit branch: `feature-visualization-engine-v1`
- Failed Phase 5 Draft PR: #6 — retain for audit; do not merge or overwrite.
- Current specification branch: `feature-visual-recipe-pilot-v1`
- Every implementation phase branches from the latest owner-validated phase, not from `main` or a failed experiment branch.

## Non-negotiable product requirements

1. The base report must retain all 23 approved pages. AI must never reduce the report to a short summary.
2. Main Deck expands from 23 to 40 pages according to research depth. Evidence after page 40 continues in the same HTML/PDF as Appendix.
3. The report body, excluding the web navigation, is 16:9. PDF must be edge-to-edge without clipping or white page margins.
4. The user reviews a Vercel Preview before any merge. `main` is protected operationally by process, even when GitHub branch protection is unavailable.
5. Selected direct competitors are determined by Step 2 threat ranking, limited to 2–5. Indirect competitors are excluded.
6. Every selected competitor receives an independent Deep Dive page and an independent six-year Creative History page.
7. Creative copy is verbatim only when verified. Unverified copy must be explicitly marked and must not be reconstructed inside quotation marks.
8. Reports must become more visual without reducing research substance: quantified evidence should be charted, relationships diagrammed, and repeated text-card walls avoided.
9. Raw source URLs are not displayed in the final report or PDF.
10. External template references inform structural principles only; executable output uses internal recipe IDs and does not copy proprietary slide designs.

## Completed and validated phases

### Phase 0 — Production freeze

- Stable rollback branch created.
- No destructive work is performed directly on `main`.

### Phase 1 — Layout Safety Guard

- 16:9 export and multi-page PDF stabilized.
- Clipping and white-margin failures addressed.
- PDF cache was added, but a regression remains: second export can re-render. Defer final fix to Phase 6 UAT.

### Phase 2 — Competitor Selection Registry

- Step 2 produces `COMPETITOR_REGISTRY_START/END` JSON.
- Threat scoring uses market penetration, growth, use/preference, campaign momentum, inflection relevance, and evidence quality.
- Final direct competitor count is 2–5.

### Phase 3 — Dynamic Page Planner

- Base 23 wrappers remain mandatory.
- One Deep Dive page and one Creative History page are added per selected competitor.
- Main Deck is capped at 40; overflow evidence becomes Appendix.
- Page Manifest and dynamic navigation metadata are generated.

### Phase 4 — Creative History Verbatim Contract

- Step 4 produces `CREATIVE_HISTORY_REGISTRY_START/END` JSON.
- Target brand plus every locked competitor must each contain five completed years plus current-year YTD.
- Copy status values: `verified-verbatim`, `source-found-copy-unverified`, `not-found`.
- Only verified copy may be displayed in quotation marks.
- Phase 4 Preview and 31-page 16:9 PDF were validated by the owner.

## Failed Phase 5 approach

The prompt-only visualization implementation on `feature-visualization-engine-v1` was not accepted.

Observed causes:

- immutable placeholder HTML encouraged the model to fill existing card walls instead of restructuring slides;
- AI was responsible for research interpretation, recipe selection, HTML, CSS, pagination, and PDF safety in one response;
- legacy inline light colors conflicted with dark-theme tokens;
- warning-only audits did not block poor layouts;
- competitor Deep Dive slides had inconsistent hierarchy and overflow;
- Growth Story remained line-broken chronology rather than a real timeline.

Do not advance to Phase 6 from Draft PR #6.

## Current gate — Phase 5B Gate 1.5

Status: **specification complete on `feature-visual-recipe-pilot-v1`; owner review required.**

Gate 1.5 contains documentation and machine-readable specifications only:

- `docs/phase5b-pilot-spec.md`
- `design/DESIGN.md`
- `design/visual-intent.schema.json`
- `design/recipe-selection-matrix.json`
- `design/recipes/milestone-timeline.schema.json`
- `design/recipes/competitor-threat-system.schema.json`
- `design/recipes/feature-matrix.schema.json`
- `design/feature-flags.json`

No renderer, research-prompt modification, Phase 6 compiler modification, runtime Validator, template change, PR, or intentional Vercel deployment is authorized in Gate 1.5.

## Phase 5B target architecture

```text
Research response
→ Step-level Visual Intent Brief
→ Phase 6 Semantic Slide Plan
→ constrained Recipe Router
→ deterministic HTML/CSS/SVG Renderer
→ blocking Validator
→ existing 16:9 PDF Export
```

### Layer responsibilities

1. **Visual Intent Brief**: records the decision question, evidence type, primary/fallback internal recipe, available inputs, missing inputs, and confidence during research.
2. **Semantic Slide Plan**: consolidates step-level briefs, resolves duplicates, and assigns final recipe IDs and page targets.
3. **Recipe Library**: defines required data, item limits, allowed units, overflow policy, and required DOM metadata.
4. **Deterministic Renderer**: eventually renders approved recipes without AI-authored CSS.
5. **Design Tokens**: eventually provide one dark-theme color, typography, spacing, and chart system.
6. **Blocking Validator**: eventually blocks invalid recipe data, contrast failure, overflow, mixed units, unverified chart values, symmetry failure, and missing metadata.

## Gate 1.5 approval boundary

Approval of Gate 1.5 authorizes only **Gate 2A — Visual Intent prompt-contract testing**.

Gate 2A may:

- append the Visual Intent contract to selected Step 0, Step 2, Step 3, and Step 5 research prompts;
- run repeated model tests;
- measure schema validity, recipe stability, evidence-gap detection, and unsupported-recipe behavior.

Gate 2A may not:

- implement a renderer;
- modify `public/template.html`;
- modify PDF Export;
- activate a Vercel Preview without separate owner instruction;
- merge any branch.

Renderer implementation begins only after Gate 2A passes and the owner explicitly approves Gate 2B.

## Feature flag and rollback

Planned flag: `visualRecipePilot`, default `false`.

- Existing reports without a recipe manifest use the Phase 4 legacy path.
- New pilot reports use deterministic rendering only when the flag is enabled and the recipe data passes validation.
- Unsupported or invalid recipes block the new path; they do not silently fall back to a generic card layout.
- Before implementation, deleting or abandoning `feature-visual-recipe-pilot-v1` returns the repository to the validated Phase 4 base.
- During later implementation, setting the flag to `false` restores legacy behavior for existing reports.
- Production rollback remains `backup-production-stable-20260622`.

## Pilot recipes frozen in Gate 1.5

1. `milestone-timeline`
2. `competitor-threat-system`
3. `feature-matrix`

The first implementation must not expand beyond these three recipes without an additional approval gate.

## Pilot acceptance summary

### Gate 2A Visual Intent

- JSON validates against the schema.
- Step allowlist is respected.
- primary/fallback are distinct.
- required/available/missing inputs are separated.
- verified metrics carry unit, period, denominator where applicable, source label, and verification state.
- repeated runs select the same primary recipe for the same evidence pattern at least 80% of the time.
- unsupported recipes are explicit and do not become generic card walls.
- Competitor and Creative History registries remain unchanged.

### Gate 2B Renderer

- pilot wrapper and slide IDs remain intact;
- no AI-authored layout CSS or arbitrary inline colors;
- required `data-recipe-id` and `data-viz-type` exist;
- contrast and overflow are blocking errors;
- equal-hierarchy comparisons use equal tracks;
- only verified, unit-compatible metrics drive visual geometry;
- existing 23-page and dynamic reports remain readable;
- existing 16:9 PDF Export remains unchanged.

## Deferred Phase 6 defects

Do not lose these items:

1. Navigation item click can return to the research start screen instead of scrolling to the target slide.
2. A second PDF export sometimes re-renders instead of downloading immediately from cache.
3. Run full regression across old 23-page reports and new dynamic reports.
4. After owner approval, consolidate stacked PRs and deploy to `main` with rollback verification.

## Workflow for every future session

1. Read this file and `AGENTS.md`.
2. Inspect current open PRs and the latest owner-validated branch.
3. Confirm the current approval gate before writing code.
4. Create implementation branches from `feature-creative-history-contract-v1` until a newer phase is owner-validated.
5. Make only gate-scoped changes.
6. Do not create a Preview, PR, renderer, or deployment when the active gate authorizes specification only.
7. Update this file and `AGENTS.md` whenever the branch, gate, architecture, defects, or acceptance criteria change.
8. Never merge to `main` unless the owner explicitly approves the merge and production deployment.

## Current acceptance baseline

A valid report should have:

- all 23 base wrappers;
- 23–40 Main Deck pages plus optional Appendix;
- 960×540 PDF pages or equivalent exact 16:9 dimensions;
- one selected-competitor Deep Dive per Registry entry;
- one six-year Creative History per selected competitor;
- no clipped content, missing back cover, invented copy, or raw URLs;
- factual gaps labeled rather than filled by inference;
- no unreadable text/background combinations;
- visual structure selected by evidence function, not by placeholder convenience.
