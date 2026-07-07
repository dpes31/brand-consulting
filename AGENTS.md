# AGENTS.md

Read `handoff/PROJECT_HANDOFF.md`, `handoff/WORK_LOG.md`, `handoff/DECISION_LOG.md`, `docs/REPORT_TEMPLATE_SPEC.md`, `docs/PDF_EXPORT_E2E_STANDARD.md`, `docs/phase5b-gate2a-results.md`, and the files under `design/` before changing this repository.

## Safety

- Use Preview-first feature branches. Merge only with explicit owner approval.
- Preserve milestone commit history; do not squash unless explicitly approved.
- Never modify or delete:
  - `backup-production-stable-20260622`
  - `backup/main-before-full-report-v1-2026-07-01`
- Preserve validated and audit branches.
- `feature-visualization-engine-v1` and PR #6 are failed audit records and must not be merged.
- Do not restore discarded implementations from PR #8, #9, or #10.
- Preserve `public/template.html` as the Legacy rollback asset. Verified blob SHA: `22bc6937b3d672e063d4b240c5a39b9c61700fec`.

## Current checkpoint

- Production branch: `main`
- Production commit before this work: `96f12ac5bde92a53a97a12ea01ae9c3db921c7fe`
- Active branch: `fix/phase6-approved-main40-no-appendix-v3`
- Draft PR: `#20 Restore approved 40-page report structure without Appendix`
- Current validated head: `7d94b1895c47e9db7268c9d181060e0a735c1d9b`
- Production build/contracts: PASS
- Phase 6 browser/PDF E2E: PASS
- Vercel deployment for the current head is temporarily blocked by the account build-rate limit, not by a product build failure.
- Keep PR #20 Draft and do not merge to `main` before owner Preview approval.

## Product invariants

- Final report is exactly **40 Main Deck pages**.
- Appendix count is exactly **0**.
- Page 40 is `Decision Receipt / Close`.
- Every slide uses a logical 1280×720 canvas, exact 16:9.
- Use Pretendard; major titles use weight 900.
- Preserve Korean word units with `word-break: keep-all`.
- Preserve the exact user-entered brand name without translation or romanization.
- Do not invent figures, dates, models, scores, axes, sources, competitors, or copy.
- Only `verified-verbatim` advertising copy may use quotation marks.
- Do not expose raw source URLs in final reports.
- Titles, body judgments, and SO WHAT statements use decisive Korean declarative endings such as `~한다`, `~이다`, `~다`; avoid explanatory polite endings except verified quotations or fixed UI labels.

## Approved competitor logic

- Page 11 Competitive Landscape may review up to five evidence-supported Direct Competitor candidates.
- Page 12 Threat Ranking selects the core three when three supported candidates exist.
- Pages 13–15 Deep Dive, page 16 Product Matrix, page 18 Positioning, pages 30–32 Competitor Creative History, and page 33 Message Trajectory use the same core-three set in ranking order.
- Never invent a fourth or fifth core competitor.
- Unsupported candidates remain evidence gaps.

## Fixed 40-page plan

1. Cover
2. 핵심 진단
3. Brand Identity
4. FACTS
5. Category & Target
6. Growth Story
7. Core Inflection
8. Product USP & Best Self
9. Market Context
10. Category Shift
11. Competitive Landscape
12. Threat Ranking
13–15. Deep Dive 1–3
16. Product Matrix
17. Category Clichés
18. Positioning
19. Consumer Executive Conclusion
20. Trends
21. Core Target
22–24. Persona 1–3
25. JTBD & Identity Alignment
26. Pain Points & Unmet Needs
27. AIPL Bottleneck
28. Purchase to Loyalty
29. Target Brand Creative History
30–32. Competitor Creative History 1–3
33. Message Trajectory
34. Creative Insight
35. SWOT
36. GAP & Root Cause
37. STP
38. Four Strategic Directions
39. Final Choice
40. Decision Receipt / Close

Creative Methodology and Appendix A1–A7 are not part of the approved output.

## Page grammar locks

- Page 2 fixed label: `핵심 진단`.
- Page 4 fixed label: `FACTS`.
- Page 5 fixed label: `CATEGORY & TARGET`.
- Page 10 fixed chapter: `CATEGORY SHIFT`; stage labels remain `LEVEL 1`–`LEVEL 5`.
- Page 9 strategic implication type is at least the page-number size.
- Persona pages retain `SITUATION / REAL JTBD / AS-IS IDENTITY / TO-BE IDENTITY / 브랜드의 역할`.
- Persona titles reuse the three target names stated on page 21 CORE TARGET.
- Persona indices `02` and `03` stay on one line.
- Page 26 retains `Pain / 현재 문제 / Unmet Need / 우선순위`.
- Page 27 retains the approved AIPL friction-flow and avoids unnecessary English.
- Creative History uses the approved centered six-year system and does not add decorative NOW circles.
- Page 34 retains the approved Current Copy / Missing Character Creative Insight comparison; connector glyphs remain symbols, never prose.
- Page 37 retains `Segmentation → Targeting → Positioning`.
- Page 38 retains four alternatives labelled A/B/C/D and the approved 차별/확장/실행 comparison.
- Page 39 retains the approved two-column Selection Criteria / Final Choice composition.

## Validated Visual Intent contracts

- Step 0: exactly one Growth Story Brief; accepted recipe `milestone-timeline`.
- Step 2: Candidate Landscape → Threat Ranking → core three; Product Matrix uses `feature-matrix`; Positioning is used only when common axes are defensible.
- Step 3: exactly one core consumer-decision Brief; accepted recipe `friction-flow`; `implementationStatus: planned`; `metrics: []`.
- Step 5: exactly one final strategy-decision Brief; accepted recipe `choice-architecture`; `implementationStatus: planned`; `metrics: []`.
- Step 3 and Step 5 prompt-copy guards restore the complete contract immediately before prompt copy.

## Approved report architecture

- Route: `/?pilot=full-integrated&brand=<exact user-entered brand>`.
- Phase 6 captures the approved Pilot after the 40-page transform is ready.
- Sample report text is neutralized into `[[CONTENT:...]]` slots.
- External AI or the internal API fills slots only from current Step 0–5 research.
- External AI returns one complete standalone HTML document, not JSON.
- Connector slots are locked to short visual symbols.
- Viewer, saved project, reopened project, and PDF use the same FULL HTML.

Production flow:

`Step 0–5 research → approved Pilot DOM capture → research-only CONTENT SLOT shell → complete 40-page HTML → blocking validation → Viewer / save / reopen / Export PDF`

## Creative History factuality

- Target brand and each of the core three competitors retain independent 2021–2026 Creative History pages.
- Allowed statuses:
  - `verified-verbatim`
  - `source-found-copy-unverified`
  - `not-found`
- Preserve Message Trajectory and Strategic So What.
- Dark Creative History pages retain dark paper and readable foreground.

## Material Symbols first-paint rule

- Material Symbols ligature strings must never appear before the icon font loads.
- Reserve a fixed icon box from first paint.
- Keep `.material-symbols-outlined` hidden until `document.fonts.check(...)` confirms readiness.
- Install the readiness guard before React renders.
- Preserve the cold-load E2E that delays the icon font and verifies zero ligature flash and zero button movement.

## PDF runtime boundary and acceptance

- Legacy reports use `.slide-wrapper > .slide`, `installIframeLayoutSafety`, and the Legacy exporter.
- Phase 6 FULL reports use `.full-slide`, `installFullReportRuntimeCompatibility`, and browser-native print.
- Install the FULL runtime before the Legacy layout/PDF guard.
- Never pass a FULL report to the Legacy selector.
- The visible `Export PDF` button, Windows `Ctrl+P`, and macOS `Cmd+P` converge on the same active Viewer iframe and native-print path.
- Preserve actual-button browser E2E with two consecutive exports and save → reload → reopen → export.
- Preflight must pass exactly 40 `.full-slide` pages, all `data-zone="main"`.
- PDF MediaBox is 960×540pt.
- Embedded font objects must be present.
- No full-page 2560×1440 raster rows are allowed.
- Do not declare a PDF task complete without satisfying `docs/PDF_EXPORT_E2E_STANDARD.md`.

## Documentation

Update these whenever architecture, branch state, report contracts, or rollback procedures change:

- `AGENTS.md`
- `handoff/PROJECT_HANDOFF.md`
- `handoff/WORK_LOG.md`
- `handoff/DECISION_LOG.md`
- `docs/REPORT_TEMPLATE_SPEC.md`
- `docs/PDF_EXPORT_E2E_STANDARD.md`
