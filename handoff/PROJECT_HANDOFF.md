# Brand Consulting Generator — Project Handoff

## Current release checkpoint

- Repository: `dpes31/brand-consulting`
- Production branch: `main`
- Phase 6 integration PR: #14 `Separate approved Phase 6 layout from research content`
- PR #14 status: merged
- PR #14 head: `22862482059266c1b385a44794575a40ec7327ec`
- Main merge commit: `7614e18bf007ad64c398ff3cfc2eb665f3ca341b`
- Production URL: `https://brand-consulting.vercel.app/`
- Vercel status for the merge commit: success
- Immutable rollback branches:
  - `backup/main-before-full-report-v1-2026-07-01`
  - `backup-production-stable-20260622`
- `public/template.html` remains the legacy rollback asset. Verified blob SHA: `22bc6937b3d672e063d4b240c5a39b9c61700fec`.

## Current Phase 6 architecture

The normal `/` application flow now uses:

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

- Production build passed
- Phase 6 Preview E2E passed
- Vercel deployment passed
- Non-Biznup brand replacement passed
- Previous Biznup sample wording removal passed
- Unresolved 1,453-slot template rejection passed
- 48 pages and 48 navigation links passed
- 1280×720 geometry and zero overflow passed
- Persona, Creative History, SWOT, and STP layouts passed
- save/reopen passed
- two consecutive 48-page PDF exports passed

## Known visual follow-up

Some detailed generated pages show color inconsistencies. This is the next separate visual task.

Recommended next branch: `fix/phase6-report-color-consistency-v1`.

The next task starts from updated `main`, uses a new Draft PR, inspects actual generated report pages, and limits changes to color tokens, contrast, selector conflicts, brand Accent behavior, and screen/PDF color consistency.

## Documentation note

`AGENTS.md` still contains pre-PR #14 architecture language because the connected repository tool blocks writes to that agent-instruction file. Use this handoff and `docs/REPORT_TEMPLATE_SPEC.md` as the current Phase 6 architecture reference.

## Excluded experiments

- `feature-visualization-engine-v1` / PR #6: failed audit implementation; never merge
- PR #8, #9, #10: superseded experiments; never restore as product code
