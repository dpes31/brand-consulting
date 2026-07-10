# AGENTS.md

Read these before changing the repository:

1. `handoff/PHASE6_MAIN40_SEMANTIC_RENDERER_V4_2026-07-10.md`
2. `handoff/PHASE6_REAL_WORLD_QA_HANDOFF_2026-07-08.md`
3. `handoff/PROJECT_HANDOFF.md`
4. `handoff/WORK_LOG.md`
5. `handoff/DECISION_LOG.md`
6. `docs/REPORT_TEMPLATE_SPEC.md`
7. `docs/PDF_EXPORT_E2E_STANDARD.md`
8. files under `design/`

When documentation and active code conflict, inspect the active branch and code first, state that the document is stale, and update it before completion.

## Safety

- Use Preview-first feature branches.
- Never modify `main` directly.
- Merge only with explicit owner approval.
- Preserve milestone commit history; do not squash unless explicitly approved.
- Never modify, force-update, or delete:
  - `backup-production-stable-20260622`
  - `backup/main-before-full-report-v1-2026-07-01`
- Preserve validated and audit branches.
- `feature-visualization-engine-v1` and PR #6 are failed audit records and must not be merged.
- Do not restore discarded implementations from PR #8, #9, or #10.
- PR #20, PR #21, and PR #22 are failed or superseded Phase 6 audit records and must not be merged.
- Preserve `public/template.html` as the Legacy rollback asset.
- Verified Legacy blob SHA: `22bc6937b3d672e063d4b240c5a39b9c61700fec`.
- A successful build alone is insufficient. Require browser E2E, PDF inspection, actual screen inspection, and owner Preview review.

## Current checkpoint — 2026-07-10

- Repository: `dpes31/brand-consulting`
- Production branch: `main`
- Production commit: `96f12ac5bde92a53a97a12ea01ae9c3db921c7fe`
- Active branch: `fix/phase6-main40-semantic-renderer-v4`
- Draft PR: `#23 Restore Phase 6 40-page semantic renderer and responsive Viewer`
- Validated product-code head: `3c3afdf2f150e46a97e5d15a9ff66bc72ccd7e1f`
- Build: PASS
- Phase 6 Main40 Semantic Renderer E2E: PASS
- Last successful Vercel deployment for the validated product head: Ready
- Stable Preview: `https://brand-consulting-git-fix-phase6-main40-9fff6b-dpes31s-projects.vercel.app/`
- Later documentation/cleanup deployments can show Vercel free-plan daily rate-limit errors. Do not misreport that quota error as a code build failure.
- `main` remains unchanged.
- Keep PR #23 Draft. Do not merge before two actual external-AI responses and owner Preview approval.

## Current product contract

- Final report is exactly **40 Main Deck pages**.
- Appendix count is exactly **0**.
- Page 40 is `Decision Receipt / Close`.
- The historical 40 Main + 8 Appendix Pilot is a visual and consulting-content grammar reference only. It is not the current page-count contract.
- Every stored and PDF slide uses a logical 1280×720 canvas, exact 16:9, with inner scale 1.
- Viewer presentation may scale frames to available width, but this display scale must never be serialized as the stored/PDF geometry.
- Use Pretendard; major titles use weight 900.
- Preserve Korean word units with `word-break: keep-all`.
- Preserve the exact user-entered brand name without translation or romanization.
- Do not invent figures, dates, models, scores, axes, sources, competitors, or copy.
- Only `verified-verbatim` advertising copy may use quotation marks.
- Do not expose raw source URLs in final reports.
- Titles and SO WHAT statements must be decision-ready Korean, not unexplained consulting jargon.
- Never solve density by shrinking ordinary body copy into unreadable text.

## Approved Phase 6 architecture

The durable flow is:

`Step 0–5 research`
→ `external/internal AI returns page-scoped structured content`
→ `exact field and cross-page validation`
→ `Semantic Renderer V4 inserts validated values into the app-owned fixed 40-page DOM/CSS`
→ `standalone HTML`
→ `Viewer / save / reopen / native PDF`

Rules:

- The app owns HTML tags, classes, fixed labels, connectors, rows, columns, navigation, geometry, and print rules.
- AI may populate only approved semantic values.
- Generic DOM-order fields such as `.content1`, `.content2`, or `field1` without a semantic role are prohibited.
- JTBD rows use named roles such as `jobType`, `desiredProgress`, `currentAlternative`, `limitation`, and `brandOpportunity`.
- Structural labels, stage numbers, arrows, table headers, and component labels are app-owned and are not AI fields.
- Complete HTML paste is a secondary sanitized compatibility importer only.
- Never restore arbitrary AI-authored complete HTML as the primary production path.
- The user-facing UI explains a report-writing workflow; it does not present JSON as the product concept.

## User-facing Phase 6 sequence

1. `외부 AI용 보고서 작성 프롬프트 다운로드`
2. attach the downloaded file to the external AI
3. copy the complete response
4. paste the response into Phase 6
5. `결과 검증 후 40페이지 보고서 만들기`

The UI states:

`레이아웃과 페이지 구성은 앱이 고정합니다. 외부 AI는 내용만 작성합니다.`

## Required semantic failure behavior

- P12 Threat Ranking validates each competitor-name field before checking P13–15.
- If the P12 first competitor field contains `1`, the error must identify P12 and the damaged field. It must not blame the P13 title.
- The three P12 interpretation-card names must exactly match the three table names.
- Numeric or structural-label contamination is blocked in Persona, JTBD, AIPL, STP, Four Strategic Directions, and Final Choice.
- P21 target names and P22–24 Persona titles must align.
- P26 keeps Pain / 현재 문제 / Unmet Need / 우선순위 in one record.
- P27 keeps A → I → P1 → P2 → L fixed while action, evidence, and state remain separate semantic values.
- P37 → P38 → P39 → P40 must remain one strategy chain.

## Approved competitor logic

- Page 11 may review up to five evidence-supported Direct Competitor candidates.
- Page 12 selects the core three when three supported candidates exist.
- Pages 13–15, 16, 18, 30–32, and 33 use the same core-three set in ranking order.
- Never invent a fourth or fifth core competitor.
- Unsupported candidates remain evidence gaps.

## Creative History contract

- Target brand and each core competitor keep 2021, 2022, 2023, 2024, 2025, and 2026 YTD.
- Allowed status values are exactly:
  - `verified-verbatim`
  - `source-found-copy-unverified`
  - `not-found`
- Year is renderer-owned metadata and must not be included in status strings.
- A compatibility normalizer may remove an exact expected `YYYY · ` prefix only when the remaining value is allowed.
- Unknown or combined status values remain blocking errors.

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
