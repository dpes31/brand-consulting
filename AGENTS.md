# AGENTS.md

Read `handoff/PROJECT_HANDOFF.md`, `handoff/WORK_LOG.md`, `handoff/DECISION_LOG.md`, `docs/REPORT_TEMPLATE_SPEC.md`, `docs/phase5b-gate2a-results.md`, and the files under `design/` before changing this repository.

## Safety

- Use preview-first feature branches. Merge only with explicit owner approval.
- Preserve commit history; do not squash milestone integrations unless explicitly approved.
- Never modify or delete `backup-production-stable-20260622` or `backup/main-before-full-report-v1-2026-07-01`.
- Preserve validated and audit branches.
- `feature-visualization-engine-v1` and PR #6 are failed audit records and must not be merged.
- Do not restore discarded implementations from PR #8, #9, or #10.
- Preserve `public/template.html` as the legacy rollback asset. Verified blob SHA: `22bc6937b3d672e063d4b240c5a39b9c61700fec`.

## Current Phase 6 correction

- Branch: `fix/phase6-report-color-consistency-v1`
- Draft PR: `#16`
- Scope: Phase 6 five-competitor page plan, Final Choice layout restoration, Persona index wrapping, Appendix divider, and native PDF fidelity.
- Keep the PR in Draft until Viewer, save/reopen, and native PDF evidence pass.
- Do not merge to `main` without explicit owner approval.

## Product invariants

- Final report is exactly 48 slides: 40-page Main Deck + 8-page Appendix.
- Every slide is exactly 1280×720, 16:9.
- Use Pretendard; major titles use weight 900.
- Preserve Korean word units with `word-break: keep-all`.
- Preserve the exact user-entered brand name without translation or romanization.
- Step 2 locks 2–5 direct competitors. Five is the maximum, not a mandatory invented count.
- Preserve one independent Deep Dive and one independent six-year Creative History per selected direct competitor.
- Do not invent figures, dates, models, scores, axes, sources, or copy.
- Only `verified-verbatim` copy may use quotation marks.
- Do not expose raw source URLs in final reports.

## Fixed five-competitor page plan

Main Deck:

- 11: Threat Ranking, up to five direct competitors.
- 12–16: Deep Dive 1–5 in Threat Ranking order.
- 17: Product Matrix, target brand + up to five direct competitors.
- 18: Positioning, target brand + up to five direct competitors.
- 19–28: Consumer section.
- 29: Target Brand Creative History.
- 30–34: Competitor Creative History 1–5.
- 35: Message Trajectory, target brand + up to five direct competitors.
- 36–40: SWOT, GAP & Root Cause, STP, Four Strategic Directions, Final Choice.

Appendix:

- A1: Appendix divider.
- A2: Winning Move Specification.
- A3: Via Negativa.
- A4: Pre-mortem.
- A5: Execution Roadmap.
- A6: Measurement Plan.
- A7: Evidence Gaps + Source Labels.
- A8: Decision Receipt / Close.

Appendix pages are never competitor overflow slots. If Step 2 supports fewer than five direct competitors, preserve unused approved pages as explicit evidence gaps; never invent a competitor.

## Validated Visual Intent contracts

- Step 0: exactly one Growth Story Brief; `milestone-timeline` reached 100% agreement across three accepted runs.
- Step 2: one Threat Ranking, one Product Matrix, and one independent Deep Dive per selected competitor; Positioning Map is optional; Metric metadata must be complete.
- Step 3: exactly one core consumer-decision Brief; `friction-flow` reached 100% agreement; all recipes are `planned`; `metrics` is `[]`.
- Step 5: exactly one final strategy-decision Brief; `choice-architecture` reached 100% agreement; all recipes are `planned`; `metrics` is `[]`.
- Step 3 and Step 5 prompt-copy guards must restore the complete contract immediately before prompt copy.

## Approved report reference

- Route: `/?pilot=full-integrated&brand=<exact user-entered brand>`.
- The Phase 6 prompt captures this route after the five-competitor page-plan transform is complete.
- The captured DOM is neutralized into `[[CONTENT:...]]` slots and then filled only from current Step 0–5 research.
- External AI returns one complete standalone HTML document, not JSON.
- Final Choice must retain the approved two-column selection-criteria / final-choice composition.
- Persona indices `02` and `03` must remain on one line.
- Use yellow highlighting for governing phrases and decision implications.
- Prefer timelines, matrices, causal flows, convergence diagrams, and choice architecture over prose card walls.
- Equal-hierarchy elements use equal tracks and aligned geometry.

## Creative History factuality

- Target brand and every selected direct competitor require an independent 2021–2026 Creative History.
- Allowed statuses:
  - `verified-verbatim`
  - `source-found-copy-unverified`
  - `not-found`
- Preserve Message Trajectory and Strategic So What.
- Dark Creative History pages must retain dark paper and readable foreground.

## PDF contract

- FULL report PDF uses Chromium native print, not full-page html2canvas JPEG rasterization.
- Output must remain exactly 48 pages at 960×540pt.
- Embedded font objects must be present.
- No 2560×1440 full-page image rows are allowed.
- Viewer, PDF, save, and reopen must use the same 48-page HTML.

## Architecture boundary

The production Phase 6 flow is:

`Step 0–5 research → captured approved Pilot DOM → research-only CONTENT SLOT template → complete standalone HTML → Viewer / save / reopen / native PDF`.

The legacy `public/template.html` remains a protected rollback asset and must not be overwritten or deleted.

## Documentation

Update these whenever architecture, branch state, contracts, or rollback procedures change:

- `handoff/PROJECT_HANDOFF.md`
- `handoff/WORK_LOG.md`
- `handoff/DECISION_LOG.md`
- `docs/REPORT_TEMPLATE_SPEC.md`
