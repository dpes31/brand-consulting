# Brand Consulting Generator — Project Handoff

## Current release checkpoint

- Repository: `dpes31/brand-consulting`
- Active branch: `fix-phase6-approved-full-renderer-v2`
- Draft PR: #14 `Separate approved Phase 6 layout from research content`
- PR base: `main`
- Functionally validated head before documentation updates: `4957c168a51549cbe69c33db5be7c687f7467afd`
- Production URL currently used by the owner: `https://brand-consulting.vercel.app/`
- Immutable rollback branches:
  - `backup/main-before-full-report-v1-2026-07-01`
  - `backup-production-stable-20260622`
- `public/template.html` remains the legacy rollback asset. Verified blob SHA: `22bc6937b3d672e063d4b240c5a39b9c61700fec`.

## Current Phase 6 architecture

The normal `/` application flow now targets:

`Step 0–5 research`
→ `approved Pilot DOM/CSS capture`
→ `sample report text neutralized into CONTENT SLOT tokens`
→ `external AI or internal API fills every slot from current research`
→ `blocking validation`
→ `48-page standalone HTML`
→ `Viewer / save / reopen / PDF`

The approved Pilot is a layout source only. Its Biznup conclusions, figures, competitors, personas, Creative History, sources, SWOT, STP, and strategy are removed before the Phase 6 prompt is exported.

## Blocking validation

Phase 6 rejects results when:

- any `CONTENT SLOT` remains unresolved;
- the report does not contain exactly 48 `.full-slide` pages;
- page IDs or page labels are missing or duplicated;
- required approved layouts are missing;
- the exact user-entered brand name is absent;
- Step 0 KPI evidence is not sufficiently reflected;
- the highest-ranked Step 2 direct competitors are missing;
- an unapproved script is included.

The same content contract is applied to the manual external-AI route and the internal API route.

## Fixed report contract

- Main Deck: exactly 40 pages
- Appendix: exactly 8 pages
- Total: exactly 48 pages
- Canvas: 1280×720, exact 16:9
- Typeface: Pretendard
- Major titles: weight 900
- Korean copy: `word-break: keep-all`
- Exact user-entered brand name; no translation or romanization
- Every analytical page retains a conclusion-led title and `SO WHAT` implication where the approved layout provides one
- Raw URLs are not exposed
- Unverified advertising copy is not quoted

## Validated Step contracts

### Step 0

- Exactly one Growth Story Visual Intent Brief
- Accepted recipe: `milestone-timeline`
- Three accepted runs: 100% agreement

### Step 2

- Threat Ranking: `rank-scorecard`
- 2–5 direct competitors selected through the Registry
- Independent Deep Dive per selected competitor
- Product Matrix: `feature-matrix`
- Positioning Map only when common axes are defensible
- Independent six-year Creative History per selected competitor

### Step 3

- Trends, Persona, Identity Alignment, JTBD, AIPL, and Unmet Needs remain in the analysis
- Exactly one core consumer-decision Brief
- Accepted recipe: `friction-flow`
- `implementationStatus: planned`
- `metrics: []`

### Step 5

- SWOT, GAP, Root Cause, three ToT routes, Big IdeaL, Winning Move, Via Negativa, Pre-mortem, and execution sequence remain
- Exactly one final strategy-decision Brief
- Accepted recipe: `choice-architecture`
- `implementationStatus: planned`
- `metrics: []`

## PR #14 verification completed

The following passed on the validated functional head:

- Production build
- Vercel Preview deployment
- Non-Biznup test brand `모노랩`
- Previous Biznup sample wording removed from the Base HTML
- Unresolved 1,453-slot template rejected
- New KPI values `123만 명`, `456억 원` reflected
- New competitors `알파원`, `베타랩`, `감마코` reflected
- 48 pages and 48 navigation links
- 1280×720 geometry
- zero slide overflow
- Persona, Creative History, SWOT, and STP layouts retained
- save and reopen
- two consecutive 48-page PDF exports

## Known visual follow-up

The owner confirmed the Phase 6 content-replacement flow works. Some detailed pages still show color inconsistencies. These are accepted as a separate visual-polish task, not a reason to reopen the content-neutral renderer architecture.

The next visual task should:

- start from updated `main` after PR #14 is merged;
- use a new preview-first branch and Draft PR;
- inspect actual generated report pages, not only the Pilot route;
- correct color tokens, contrast, page-specific overrides, and print/PDF color consistency;
- avoid changing the Phase 6 content-slot contract, page count, or research logic;
- keep `main` unmerged until the owner approves the new Preview.

## Documentation warning

`AGENTS.md` still contains pre-PR #14 architecture language because the current connector could not update that agent-instruction file. Before or immediately after merge, update it to state that the normal `/` Phase 6 path now uses the approved 48-page content-neutral HTML flow. Do not treat its older `23–40 page` and `future migration` language as current truth.

## Excluded experiments

- `feature-visualization-engine-v1` / PR #6: failed audit implementation; never merge
- PR #8, #9, #10: superseded experiments; never restore as product code

## Merge rule

- PR #14 remains Draft until explicit owner approval.
- Use a regular merge or fast-forward; do not squash this milestone.
- Do not delete test, audit, or backup branches.
- Confirm the Production deployment at `https://brand-consulting.vercel.app/` after merge.
