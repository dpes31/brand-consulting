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
  5. `feature-visualization-engine-v1`
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
10. Design references may inform structural patterns, but proprietary slide artwork must not be copied verbatim.

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

Status: **initial implementation complete, owner validation failed, rework required.** Do not advance to Phase 6.

Initial implementation on `feature-visualization-engine-v1` added:

- `VISUALIZATION ENGINE CONTRACT` to API and manual compiler prompts.
- HTML/CSS/SVG component grammar for KPI strips, bars, dot plots, matrices, process flows, system maps, positioning maps, timelines, verbatim evidence, and evidence gaps.
- `data-viz-type` metadata and a warning-only visual audit manifest.
- automatic equal-height treatment for some comparison grids.
- Phase 6 filename `visual_report_compiler_브랜드명.txt`.

### Owner validation result — 2026-06-23

The generated 31-page report preserved the dynamic page count and Creative History structure, but did not meet the visual quality objective.

Observed defects:

1. **Prompt/template conflict** — the prompt requests diagrams, but the immutable base HTML still hard-codes many text boxes, tables, and `<dl>` containers. The model therefore fills existing containers rather than selecting a true visual structure.
2. **Growth Story failure** — chronology is still rendered as line-broken prose inside a box instead of a timeline with milestones, phases, and inflection points.
3. **Low visual coverage** — KPI strips, system maps, positioning maps, and timelines appear only on selected pages; many market, consumer, competitor, and strategy slides remain generic card walls.
4. **Deep Dive hierarchy failure** — competitor pages use uneven blocks and weak spatial hierarchy. Important evidence, mechanism, and attack point do not form a clear reading path.
5. **Color-system regression** — legacy inline light backgrounds (`#fff`, `#f8fafc`, `#f0fdfa`, etc.) and hard-coded colors conflict with dark-theme text tokens, causing unreadable or very low-contrast slides.
6. **PDF preflight warnings** — dynamic competitor Deep Dive slides triggered content-overflow warnings.
7. **Audit weakness** — the current visual audit only records warnings after rendering; it does not prevent a poor layout from being accepted or exported.

### Root cause

Phase 5 relies too heavily on natural-language prompting. A model cannot reliably redesign dozens of fixed HTML pages while also preserving IDs, page counts, factual constraints, PDF safety, and the original template. The system needs deterministic layout selection and rendering.

### Required Phase 5 rework

Implement a slide-recipe architecture rather than adding more instructions to the compiler prompt.

#### Layer 1 — Semantic Slide Plan

AI outputs structured JSON per slide:

- decision question;
- evidence type;
- verified metrics and units;
- entities/time periods;
- narrative relationship;
- selected recipe ID;
- interpretation;
- implication;
- evidence gaps.

#### Layer 2 — Consulting Recipe Library

Create reusable, named recipes. Initial recommended set:

- milestone timeline / growth trajectory;
- KPI + trend bridge;
- before–after / AS-IS–TO-BE;
- issue tree / hypothesis tree;
- competitor threat system;
- rank / scorecard;
- feature matrix / heatmap;
- 2×2 positioning map;
- customer journey / friction flow;
- needs hierarchy;
- funnel / conversion leakage;
- process flow / operating model;
- system map / causal loop;
- waterfall / value bridge;
- roadmap / horizons;
- choice architecture;
- SWOT-to-strategy synthesis;
- creative message trajectory;
- evidence gap / confidence panel.

Each recipe must define required fields, minimum/maximum item counts, allowed units, responsive geometry, and overflow rules.

#### Layer 3 — Deterministic Renderer

Application code renders approved recipes with stable HTML/CSS/SVG components. AI supplies content and recipe selection, but does not freely author layout CSS or arbitrary inline colors.

#### Layer 4 — Design Tokens

Create one source of truth for:

- background and surfaces;
- text hierarchy;
- brand accent;
- risk/opportunity/status colors;
- borders and shadows;
- type scale;
- spacing and grid;
- chart palettes.

No arbitrary inline hex colors are allowed in generated content. Light and dark recipes require explicit contrast-safe token mappings.

#### Layer 5 — Blocking Validation Gate

Block rendering/export when any of the following occurs:

- WCAG contrast failure for text/background pairs;
- content overflow;
- missing required recipe fields;
- unsupported or mixed-unit chart data;
- missing `data-viz-type` or recipe ID;
- asymmetric comparison geometry;
- visual coverage below the required threshold for evidence-driven slides.

### Design-reference policy

A single `DESIGN.md` is useful for principles, tokens, spacing, typography, and usage rules, but it is not sufficient by itself. Pair it with:

- machine-readable recipe schemas (`design/recipes/*.json` or TypeScript definitions);
- deterministic renderer components (`src/report/components/*`);
- example fixtures/screenshots for regression testing;
- a recipe-selection matrix mapping evidence type to layout type.

Reference libraries such as consulting slide collections and diagram tools should be abstracted into reusable structural patterns. Do not scrape or reproduce proprietary slides one-for-one.

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
9. Update `AGENTS.md` and this file whenever phase status, architecture, deferred defects, or acceptance criteria change.

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
- visual structures selected by evidence type rather than by the fixed placeholder layout;
- no Phase 6 transition until Phase 5 owner validation passes.
