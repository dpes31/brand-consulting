# Brand Consulting Generator — Project Handoff

> Read this file before changing the repository. The owner is a non-developer and requires preview-first, reversible changes. Never merge to `main` without explicit approval after Preview validation.

## Repository and deployment

- Repository: `dpes31/brand-consulting`
- Production branch: `main`
- Production deployment: Vercel
- Stable rollback branch: `backup-production-stable-20260622`
- Current stacked development chain:
  1. `feature-layout-safety-v1`
  2. `feature-competitor-selection-v1`
  3. `feature-dynamic-page-planner-v1`
  4. `feature-creative-history-contract-v1`
- Every new phase branches from the latest validated phase, not from `main`.

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

## Completed phases

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

## Current phase

### Phase 5 — Visualization Engine

Objective: replace generic text-card walls with evidence-appropriate charts, diagrams, matrices, timelines, flows, and visual emphasis while preserving factual density.

Required implementation direction:

- Use pure HTML/CSS/SVG components that remain safe for PDF export. Avoid canvas and cross-origin image dependencies.
- Do not draw charts when data is not comparable or verified.
- Use a visual plan per slide: decision question → evidence → visual form → interpretation → implication.
- Quantitative comparisons should use bars, dot plots, KPI deltas, or matrices rather than prose-only boxes.
- Processes and causal structures should use flows or system diagrams.
- Temporal evidence should use timelines.
- Positioning should use a defined 2x2 map with named axes.
- Symmetric structures must use equal tracks and aligned card heights.
- Add machine-readable `data-viz-type` attributes and a runtime validation report.

## Deferred Phase 6 defects

Do not lose these items:

1. Navigation item click can return to the research start screen instead of scrolling to the target slide.
2. A second PDF export sometimes re-renders instead of downloading immediately from cache.
3. Run full regression across old 23-page reports and new dynamic reports.
4. After owner approval, consolidate stacked PRs and deploy to `main` with rollback verification.

## Workflow for every future session

1. Read this file and `AGENTS.md`.
2. Inspect current open PRs and latest validated branch.
3. Create a new phase branch from the latest validated branch.
4. Make only phase-scoped changes.
5. Confirm Vercel Preview build succeeds.
6. Provide the Preview URL and a concrete acceptance checklist.
7. Wait for owner validation.
8. Never merge to `main` unless the owner explicitly approves the merge and production deployment.

## Current acceptance baseline

A valid report should have:

- all 23 base wrappers;
- 23–40 Main Deck pages plus optional Appendix;
- 960×540 PDF pages or equivalent exact 16:9 dimensions;
- one selected-competitor Deep Dive per Registry entry;
- one six-year Creative History per selected competitor;
- no clipped content, missing back cover, invented copy, or raw URLs;
- factual gaps labeled rather than filled by inference.
