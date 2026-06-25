# Brand Consulting Generator — Project Handoff

Read this file, `AGENTS.md`, and `docs/biznup-full-content-preservation-matrix.md` before changing the repository. Never merge to `main` without explicit owner approval.

## Repository

- Repo: `dpes31/brand-consulting`
- Production: `main`
- Rollback: `backup-production-stable-20260622`
- Validated Phase 4 base: `feature-creative-history-contract-v1`
- Completed Gate 2A branch: `feature-visual-recipe-pilot-v1`
- Superseded summary pilot: `feature-visual-recipe-html-pilot-v1`, Draft PR #8 — retain as audit, do not merge.
- Corrected FULL visual pilot: `feature-full-report-visual-recipe-v1`
- Failed Phase 5 audit branch: `feature-visualization-engine-v1`, Draft PR #6.

## Gate 2A result

Gate 2A passed:

- Step 0: `milestone-timeline`, 100% agreement;
- Step 2: required-role Recipes, 100% agreement;
- Step 3: `friction-flow`, 100% agreement;
- Step 5: `choice-architecture`, 100% agreement.

## Owner correction after first HTML pilot

The first HTML pilot was rejected because it converted the existing FULL report into a 23-page summary and removed required content.

The corrected rule is:

> Preserve the existing report TOC and Step 0–5 analytical content, then improve only the visual structure. Overflow creates continuation or Appendix pages; it never authorizes deletion.

## Corrected FULL pilot scope

The corrected deck contains:

- 40 Main Deck pages;
- 8 Appendix pages;
- exact 16:9 slide geometry;
- three selected competitor Deep Dives;
- four Creative History pages covering 2021–2025 completed years plus 2026 YTD;
- five validated Recipe structures.

Restored mandatory content includes:

- Brand Identity, category, target, JTBD, KPI, Growth Story, product USP;
- competitive landscape, ranking, all Deep Dives, Product Matrix, category clichés, positioning;
- consumer trends, three detailed Personas, Identity Alignment, JTBD, pain points, unmet needs, AIPL;
- Creative methodology, target and competitor six-period histories, message trajectory, creative opportunity;
- SWOT, GAP, Root Cause, Fact Firewall, STP, four strategic directions, selection criteria, Big IdeaL, Winning Move;
- Tax Decision Receipt detail, Via Negativa, Pre-mortem, execution roadmap, measurement plan, evidence gaps, and source limitations.

## Recipe application

Recipes change only the assigned visualization:

- `milestone-timeline` — Growth Story;
- `competitor-threat-system` — competitor Deep Dives;
- `feature-matrix` — Product Matrix;
- `friction-flow` — purchase bottleneck;
- `choice-architecture` — strategy choice.

## Corrected implementation

- `docs/biznup-full-content-preservation-matrix.md`
- `src/pages/BiznupFullReportLoader.tsx`
- `public/biznup-full-payload-01.js` through `09.js`
- `public/biznup-full-payload-07-fixed.js`
- `src/App.tsx`
- Preview query: `?pilot=full-biznup`

Runtime audit must report:

- Main 40/40;
- Appendix 8/8;
- Recipe 5/5;
- Required Sections 40/40;
- Overflow 0.

## Safety boundary

This Preview does not alter:

- `src/lib/geminiCompiler.ts`;
- `public/template.html`;
- the existing PDF export path;
- `main`, rollback, or validated branches.

Automatic compiler integration, template changes, merging, and production deployment require a separate owner decision after Preview validation.
