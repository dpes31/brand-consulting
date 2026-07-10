# AGENTS.md

Read `handoff/PROJECT_HANDOFF.md`, `handoff/WORK_LOG.md`, `handoff/DECISION_LOG.md`, `docs/REPORT_TEMPLATE_SPEC.md`, `docs/PDF_EXPORT_E2E_STANDARD.md`, and the files under `design/` before changing this repository.

## Safety

- Use Preview-first feature branches. Merge only with explicit owner approval.
- Preserve commit history; do not squash milestone integrations unless explicitly approved.
- Never modify, force-move, or delete `backup-production-stable-20260622` or `backup/main-before-full-report-v1-2026-07-01`.
- Preserve validated and audit branches.
- `feature-visualization-engine-v1` and PR #6 are failed audit records and must not be merged.
- Do not restore discarded implementations from PR #8, #9, or #10.
- PR #20 and PR #21 are failed/superseded Phase 6 records and must not be merged.
- Preserve `public/template.html` as the legacy rollback asset. Verified blob SHA: `22bc6937b3d672e063d4b240c5a39b9c61700fec`.
- A successful Vercel build is not sufficient. Require browser E2E, PDF inspection, and actual screen review.

## Current Phase 6 correction — 2026-07-10

- Branch: `fix/phase6-approved-html-semantic-contract-v1`
- Draft PR: `#22 Restore Phase 6 approved 40+8 HTML with semantic field locking`
- Base: `main`
- Current validated head: `538d1c2d5382cd83fee0fd35716fddc7b7d6a895`
- `main` remains unchanged.
- Keep PR #22 Draft and do not merge without explicit owner Preview approval.

### Correct user workflow

`Step 0–5 research`
→ `download approved complete-HTML prompt`
→ `external AI returns one complete HTML document`
→ `paste or upload .html/.txt in Phase 6`
→ `sanitize active content`
→ `validate semantic fields and cross-page logic`
→ `graft validated content into the approved 40+8 DOM`
→ `Viewer / save / reopen / PDF`

- The user-facing output is complete HTML, not JSON.
- JSON input is explicitly blocked in Phase 6.
- The app never trusts the external AI DOM as the final layout. It copies only validated semantic-field content into the approved sample DOM.
- The exact semantic template used in the downloaded prompt is cached and reused for validation; do not recapture a different template during the same workflow.

## Approved report source

- Canonical reference route: `/?pilot=full-integrated&brand=<exact user-entered brand>`.
- This route is the single visual and structural source for Phase 6.
- Final report is exactly 48 slides: 40-page Main Deck + 8-page Appendix.
- Every slide is exactly 1280×720, 16:9, with saved inner scale `1`.
- Use Pretendard; major titles use weight 900.
- Preserve Korean word units with `word-break: keep-all`.
- Preserve the exact user-entered brand name without translation or romanization.
- Do not invent figures, dates, models, scores, axes, sources, or advertising copy.
- Only `verified-verbatim` copy may use quotation marks.
- Do not expose raw source URLs in final reports.
- Solve density by editing and field-length limits, never by shrinking body copy into unreadable text.

## Approved 40+8 page plan

Main Deck:

1. Cover
2. Executive Verdict
3. Brand Identity
4. Brand Facts
5. Category & Target
6. Growth Story
7. Core Inflection
8. Product USP & Brand Best Self
9. Market Context
10. Category Shift
11. Competitive Landscape — up to five candidates
12. Threat Ranking — exactly three core direct competitors selected
13–15. Independent Deep Dive 1–3 in P12 order
16. Product Matrix — target brand + the same core three
17. Category Clichés — exactly three columns: 반복 화법 / 현재 역할 / 구조적 한계
18. Positioning — meaningful four-axis names; no `X축`/`Y축`
19. Consumer Executive Conclusion
20. Consumer Trends
21. Core Target
22–24. Persona 1–3
25. Identity Alignment & JTBD
26. Pain Points & Unmet Needs
27. AIPL Bottleneck — A → I → P1 → P2 → L
28. Purchase to Loyalty
29. Creative History Method
30. Target Brand Creative History
31–33. Core Competitor Creative History 1–3 in P12 order
34. Message Trajectory — target brand + the same core three
35. Creative Insight
36. SWOT
37. GAP & Root Cause
38. STP
39. Four Strategic Directions
40. Final Choice

Appendix:

- A1 Winning Move Specification
- A2 Via Negativa
- A3 Pre-mortem
- A4 Execution Roadmap
- A5 Measurement Plan
- A6 Evidence Gaps
- A7 Source Labels
- A8 Brand Principle / Close

## Semantic-field and layout locks

- Replace generic DOM-order slots with `data-report-field`, `data-report-hint`, `data-report-max-length`, and `data-report-kind`.
- Never move a semantic field to another page or component.
- Fixed labels, arrows, table columns, page IDs, navigation, CSS classes, and visual hierarchy are app-owned.
- P5 keeps `WANT / AVOID`.
- P12 keeps three equal-width interpretation cards.
- P13–15 keep `Evidence / Core Desire / Appeal / Threat Mechanism / Attack Point` and `위협 N순위`.
- Both approved Evidence DOM variants are supported: three evidence list items or one evidence summary paragraph.
- P17 never restores the discarded fourth `새 질문` column.
- P18 axes must be decision-relevant meanings; brand names cannot appear in axis fields.
- P21 Persona titles and P22–24 titles must align.
- P26 keeps Pain / 현재 문제 / Unmet Need / 우선순위 in the same row.
- P27 actions, descriptions, and states are separate fields; arrows and stage codes are fixed.
- Creative History keeps 2021–2025 plus 2026 YTD and exact factuality statuses.
- P37 → P38 → P39 → P40 → A8 must form one continuous strategy chain.
- A8 must summarize the final strategy and may not restore the rejected phrase `찾고, 설명하고, 지킨다`.

## HTML safety and runtime

- Remove `script`, `noscript`, `base`, `iframe`, `object`, `embed`, and `form`.
- Remove inline `on*` handlers and `javascript:` / `data:text/html` URLs.
- Canonicalize frames to 1280×720 and `.full-frame-inner` to `scale(1)`.
- Reject changed page IDs/order, missing fields, moved fields, unresolved `[[FIELD:...]]`, invalid fixed labels, and over-length copy.
- Viewer, storage, reopening, Export PDF, Ctrl+P, and Cmd+P must all use the same approved document.

## Validated Visual Intent contracts

- Step 0: exactly one Growth Story Brief; recipe `milestone-timeline`.
- Step 2: Threat Ranking, independent Deep Dive, Product Matrix, and optional Positioning Map; Metric metadata must be complete.
- Step 3: exactly one core consumer-decision Brief; recipe `friction-flow`; `implementationStatus: planned`; `metrics: []`.
- Step 5: exactly one final strategy-decision Brief; recipe `choice-architecture`; `implementationStatus: planned`; `metrics: []`.
- Step 3 and Step 5 prompt-copy guards must restore the complete contract immediately before prompt copy.
