# Brand Consulting Generator — Project Handoff

## Current release transition

- Repository: `dpes31/brand-consulting`
- Final integration branch: `feature-main-full-report-integration-v1`
- Final report PR: #11
- Validated Prompt/Visual Intent integration PR: #12
- Prompt-contract integration merge anchor: `e607e397819b061c4676e3a2bdfb210f9d1b349b`
- Pre-transition production backup: `backup/main-before-full-report-v1-2026-07-01`
- Older production rollback: `backup-production-stable-20260622`
- Both rollback branches are immutable.

## Application structure

### Default product path

- Entry: `src/main.tsx`
- Application shell: `src/App.tsx`
- Default route: `/`
- Main UI: `src/pages/Dashboard.tsx`
- Research prompts: `src/lib/prompts.ts`
- Research execution: `src/lib/gemini.ts`
- HTML compilation: `src/lib/geminiCompiler.ts`
- Production HTML shell: `public/template.html`
- PDF and layout safety:
  - `src/lib/exportReportPdf.ts`
  - `src/lib/installIframePreRepair.ts`
  - `src/lib/installLayoutSafety.ts`
  - `src/lib/installReportViewerUX.ts`

### Approved report reference path

- Preview route: `/?pilot=full-integrated&brand=<exact user-entered brand>`
- Main component: `src/pages/BiznupFullIntegrated.tsx`
- Report data: `src/pages/biznupFullReportData.ts`
- Base styles: `src/pages/BiznupFullIntegrated.css`
- Refinement entry: `src/pages/BiznupFullIntegratedRefinement.css`
- Density/refinement layers: `src/pages/density-v2-*.css` through `density-v5-fixes.css`
- Runtime refinements:
  - `src/pages/full-report-density-v2-runtime.ts`
  - `src/pages/full-report-v4-runtime.ts`
- Report structure: 40-page Main Deck + 8-page Appendix
- Logical canvas: 1280×720, exact 16:9

### Other reference route

- `/?pilot=umbrex-compare`
- Files: `src/pages/UmbrexComparisonPilot.tsx` and `.css`
- Purpose: structural pattern comparison only; not a production dependency.

## Validated development phases

- Phase 1: layout and exact 16:9 PDF safety.
- Phase 2: threat-ranked Competitor Registry; 2–5 direct competitors.
- Phase 3: dynamic 23–40 page Main Deck and Appendix planning.
- Phase 4: six-year Creative History factuality contract.
- Gate 1.5: Visual Intent schema, recipe-selection matrix, and initial recipe schemas.
- Gate 2A: owner validation completed and passed for Steps 0, 2, 3, and 5.

## Step-level Prompt and Recipe status

### Step 0 — Brand Fact Book

- Visual Intent contains exactly one Growth Story Brief.
- Accepted recipe: `milestone-timeline` for event-led chronology.
- Three accepted runs: 100% agreement.

### Step 2 — Competitor Strategy

- Threat Ranking: `rank-scorecard`.
- One independent selected-competitor Deep Dive: `competitor-threat-system` per Registry entry.
- Product Matrix: `feature-matrix`.
- Positioning Map: optional and only with two defensible common axes.
- Complete Metric metadata is mandatory when metrics are present.
- Three accepted runs: 100% required-role agreement.

### Step 3 — Consumer

- Normal analysis retains Trends, Persona, Identity Alignment, JTBD, AIPL, and Unmet Needs.
- Visual Intent contains exactly one core consumer-decision Brief.
- Accepted test recipe: `friction-flow`.
- All Step 3 recipes remain `planned`; `metrics` must be `[]`.
- Three accepted runs: 100% agreement.

### Step 5 — Strategy

- Normal analysis retains SWOT, GAP, Root Cause, three ToT routes, Big IdeaL, Winning Move, Via Negativa, Pre-mortem, and execution sequence.
- Visual Intent contains exactly one final strategy-decision Brief.
- Accepted test recipe: `choice-architecture`.
- All Step 5 recipes remain `planned`; `metrics` must be `[]`.
- Three accepted runs: 100% agreement.

## Approved report template

- Pretendard is the standard typeface; major titles use weight 900.
- The exact user-entered brand name is preserved without automatic translation.
- Korean body copy uses keep-all wrapping and semantic line breaks.
- Body copy normally remains at least page-number size; sources and caveats may be smaller.
- Critical governing phrases and decision implications can use yellow highlighting.
- Use evidence-appropriate structures: timelines, scorecards, matrices, causal flows, consumer friction flows, AS-IS/TO-BE, STP convergence, choice architecture, roadmap, and evidence-gap panels.
- Avoid decorative card walls, unexplained vertical rules, arbitrary box sizes, and prose-only layouts where a structure is available.
- Equal-hierarchy elements require equal tracks and aligned top/bottom rules.
- Creative History preserves six-year coverage, source status, and quotation rules.

## Known limitations and technical debt

1. The approved 40+8 report is currently a React reference route. It is not yet a full replacement for every report generated through `public/template.html` and the compiler.
2. The report refinement is split across several CSS and runtime layers. A later refactor should consolidate tokens and remove redundant overrides without changing approved appearance.
3. Gate 2A validates the manual external-AI response workflow. API-mode acceptance is not governed by the same complete blocking validator.
4. `scripts/report-visual-qa.mjs` exists as a QA utility; its presence does not prove that every future report was visually approved.
5. Navigation and repeat PDF-export behavior must continue to be regression-tested when the production report compiler is changed.

## Excluded experiments

- `feature-visualization-engine-v1` / PR #6: failed heuristic visualization engine; retained only for audit.
- PR #8: superseded report-refinement pilot.
- PR #9: superseded merge-gate visual QA experiment.
- PR #10: superseded visual-QA continuation; reusable QA concepts are represented in the final report branch, but the obsolete branch is not merged as a product implementation.

## Rollback

### Full rollback to pre-transition production

Move `main` back to the commit referenced by:

`backup/main-before-full-report-v1-2026-07-01`

This branch points to the former production `main` commit and must never be rewritten.

### Older stable fallback

Use `backup-production-stable-20260622` only when the newer backup is unsuitable.

### Feature-level rollback

Prefer reverting the relevant merge commit rather than deleting branches. Preserve PR #7, PR #11, PR #12, and all audit branches.

## Next implementation boundary

A future task may connect the approved 40+8 reference component system to the production compiler/template. That work must be separately specified, previewed, and regression-tested across legacy 23-page reports, dynamic reports, Appendix generation, navigation, and PDF export.
