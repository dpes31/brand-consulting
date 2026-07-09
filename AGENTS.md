# AGENTS.md

Read these before changing the repository:

1. `handoff/PHASE6_REAL_WORLD_QA_HANDOFF_2026-07-08.md`
2. `handoff/PHASE6_EXTERNAL_AI_JSON_WORKFLOW_QA_2026-07-09.md`
3. `handoff/PROJECT_HANDOFF.md`
4. `handoff/WORK_LOG.md`
5. `handoff/DECISION_LOG.md`
6. `docs/REPORT_TEMPLATE_SPEC.md`
7. `docs/PDF_EXPORT_E2E_STANDARD.md`
8. `docs/phase5b-gate2a-results.md`
9. files under `design/`

When documentation and current PR code conflict, inspect the active branch and code first, state that the document is stale, and update the documentation before completion.

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
- PR #20 is a failed real-world QA record and must not be merged.
- Preserve `public/template.html` as the Legacy rollback asset.
- Verified Legacy blob SHA: `22bc6937b3d672e063d4b240c5a39b9c61700fec`.

## Current checkpoint

- Repository: `dpes31/brand-consulting`
- Production branch: `main`
- Production commit before this work: `96f12ac5bde92a53a97a12ea01ae9c3db921c7fe`
- Active branch: `fix/phase6-structured-report-renderer-v1`
- Draft PR: `#21 Replace Phase 6 HTML generation with app-owned structured renderer`
- Validated Phase 6 external-JSON implementation head: `d3b2ebd104d6bfddb90ba3051f92a9710b3a2a07`
- Production build/contracts: PASS
- Phase 6 structured Renderer, HTML Sanitizer, Viewer persistence, and PDF E2E: PASS
- Vercel Preview: `https://brand-consulting-git-fix-phase6-structu-0fd4b6-dpes31s-projects.vercel.app/`
- Vercel state at validated head: Ready
- `main`: unchanged
- Keep PR #21 Draft. Do not merge before corrected external-AI workflow QA and owner Preview approval.

## Current user QA finding — 2026-07-09

The external AI returning `ProductionReportV3` JSON is expected. It is not a failure and must not be changed back to AI-generated complete HTML.

The current defects are:

1. Phase 6 does not explain the full `download prompt → run external AI → copy JSON → paste into app → app generates HTML` workflow clearly enough.
2. The JSON-only prompt still includes Creative History DOM instructions such as `.timeline-container`, `.timeline-card`, `data-year`, and `data-copy-status`.
3. The real external-AI result fused year and status, for example `2021 · not-found`, which violates the exact status enum.
4. The current owner response needs constrained normalization or clear page/field errors before rendering.

Continue from `handoff/PHASE6_EXTERNAL_AI_JSON_WORKFLOW_QA_2026-07-09.md`.

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
- Titles, body judgments, and SO WHAT statements use decisive Korean declarative endings such as `~한다`, `~이다`, `~다`.

## Approved Phase 6 architecture

The durable flow is:

`Step 0–5 research`
→ `ProductionReportV3 page-scoped JSON`
→ `exact schema and cross-page validation`
→ `app-owned fixed 40-page DOM/CSS Renderer`
→ `standalone HTML`
→ `Viewer / save / reopen / native PDF`

Rules:

- External AI returns JSON only.
- Internal API returns the same JSON contract.
- Both paths use the same validator and Renderer.
- The app owns HTML tags, classes, fixed labels, connectors, rows, columns, navigation, geometry, and print rules.
- AI may populate only approved semantic values.
- Complete HTML paste is a secondary compatibility importer only.
- Compatibility HTML is sanitized, canonicalized to 1280×720 / scale(1), structurally validated, and never executed.
- Never restore arbitrary AI-authored complete HTML as the primary path.
- Never request JSON and HTML together as parallel final deliverables.

## Required external-AI UX correction

The user-facing Phase 6 sequence must be explicit:

1. `외부 AI용 JSON 프롬프트 다운로드`
2. attach the downloaded file to the external AI
3. copy the complete JSON response
4. paste JSON into Phase 6
5. `JSON 검증 후 40페이지 보고서 만들기`

The UI must state: `HTML은 외부 AI가 아니라 앱이 자동 생성합니다.`

Keep existing complete HTML import as a clearly separated compatibility option.

## Creative History JSON contract

The AI-facing prompt must contain data instructions only.

Do not mention DOM classes or attributes in the JSON prompt.

- `year1` is fixed 2021.
- `year2` is fixed 2022.
- `year3` is fixed 2023.
- `year4` is fixed 2024.
- `year5` is fixed 2025.
- `year6` is fixed 2026 YTD.
- Year is Renderer-owned metadata and must not be included in status strings.
- Allowed status values are exactly:
  - `verified-verbatim`
  - `source-found-copy-unverified`
  - `not-found`
- Add machine-readable enum metadata to status field definitions.
- A compatibility normalizer may remove an exact expected `YYYY · ` prefix only when the remaining value is one of the three allowed statuses.
- Every normalization must generate a page/field warning and must be followed by strict validation.
- Unknown or combined status values remain blocking errors.

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
- Page 5 fixed labels include `WANT / AVOID`.
- Page 10 fixed chapter: `CATEGORY SHIFT`; stage labels remain `LEVEL 1`–`LEVEL 5`.
- Page 9 strategic implication type is at least the page-number size.
- Pages 13–15 retain `Evidence / Core Desire / Appeal / Threat Mechanism / Attack Point` and `위협 1순위 / 2순위 / 3순위`.
- Page 17 retains exactly `반복 화법 / 현재 역할 / 구조적 한계`.
- Persona pages retain `SITUATION / REAL JTBD / AS-IS IDENTITY / TO-BE IDENTITY / 브랜드의 역할`.
- Persona titles reuse the three target names stated on page 21 CORE TARGET.
- Persona indices `02` and `03` stay on one line.
- Page 26 retains `Pain / 현재 문제 / Unmet Need / 우선순위`.
- Page 27 retains `A → I → P1 → P2 → L` with separate action/evidence/state values.
- Creative History uses the approved centered six-year system and does not add decorative NOW circles.
- Page 34 retains Current Copy → Missing Character; connector glyphs remain symbols, never prose.
- Page 37 retains `Segmentation → Targeting → Positioning`.
- Page 38 retains A/B/C/D alternatives and the approved 차별/확장/실행 comparison.
- Page 39 retains the approved two-column Selection Criteria / Final Choice composition.
- Page 40 summarizes the selected strategy from page 39 in one governing message.

## Validated Visual Intent contracts

- Step 0: exactly one Growth Story Brief; accepted recipe `milestone-timeline`.
- Step 2: Candidate Landscape → Threat Ranking → core three; Product Matrix uses `feature-matrix`; Positioning is used only when common axes are defensible.
- Step 3: exactly one core consumer-decision Brief; accepted recipe `friction-flow`; `implementationStatus: planned`; `metrics: []`.
- Step 5: exactly one final strategy-decision Brief; accepted recipe `choice-architecture`; `implementationStatus: planned`; `metrics: []`.

## PDF runtime boundary and acceptance

- Legacy reports use `.slide-wrapper > .slide`, `installIframeLayoutSafety`, and the Legacy exporter.
- Phase 6 FULL reports use `.full-slide`, `installFullReportRuntimeCompatibility`, and browser-native print.
- Install the FULL runtime before the Legacy layout/PDF guard.
- Never pass a FULL report to the Legacy selector.
- Visible `Export PDF`, Windows `Ctrl+P`, and macOS `Cmd+P` converge on the same active Viewer iframe and native-print path.
- Preserve actual-button browser E2E with two consecutive exports and save → reload → reopen → export.
- Preflight must pass exactly 40 `.full-slide` pages, all `data-zone="main"`.
- PDF MediaBox is 960×540pt.
- Embedded font objects must be present.
- No full-page 2560×1440 raster rows are allowed.
- Do not declare PDF complete without satisfying `docs/PDF_EXPORT_E2E_STANDARD.md`.

## Documentation

Update these whenever architecture, branch state, prompt contract, report contract, or rollback procedures change:

- `AGENTS.md`
- `handoff/PHASE6_REAL_WORLD_QA_HANDOFF_2026-07-08.md`
- `handoff/PHASE6_EXTERNAL_AI_JSON_WORKFLOW_QA_2026-07-09.md`
- `handoff/PROJECT_HANDOFF.md`
- `handoff/WORK_LOG.md`
- `handoff/DECISION_LOG.md`
- `docs/REPORT_TEMPLATE_SPEC.md`
- `docs/PDF_EXPORT_E2E_STANDARD.md`

<!-- PHASE6_EXTERNAL_JSON_COMPLETION_2026-07-09 -->
## Phase 6 external-AI JSON workflow implementation — 2026-07-09

- Active branch: `fix/phase6-structured-report-renderer-v1`
- Draft PR: `#21 Replace Phase 6 HTML generation with app-owned structured renderer`
- Validated product-code head: `d3b2ebd104d6bfddb90ba3051f92a9710b3a2a07`
- Vercel Preview: `https://brand-consulting-git-fix-phase6-structu-0fd4b6-dpes31s-projects.vercel.app/`
- `main`: unchanged; PR #21 remains Draft and unmerged.
- `public/template.html` and protected backup branches remain untouched.

Implemented:

- Phase 6 shows the explicit five-step external-AI JSON workflow.
- The primary input accepts raw JSON, fenced JSON, `.json`, and `.txt` responses.
- `기존 완성 HTML 가져오기 — 호환용` is a separate secondary path.
- Creative History uses `[CREATIVE HISTORY DATA CONTRACT]`; AI-facing DOM/class/data-attribute instructions were removed.
- Every Creative History status field exposes the exact enum and fixed year metadata, including `2026 YTD`.
- Only exact `expected year · allowed status` values are normalized; every repair emits a page/field warning and strict validation runs afterward.
- Unknown status, mismatched year, composite status, and arbitrary values remain blocking errors with Korean page/field guidance.
- External manual JSON and internal Gemini API routes use the same ProductionReportV3 schema, normalization, strict validation, cross-page validation, and app-owned Renderer.

Validated at `d3b2ebd104d6bfddb90ba3051f92a9710b3a2a07`:

- `npm run build`: PASS
- FULL report contract test: PASS
- FULL report runtime test: PASS
- Phase 6 structured Renderer E2E: PASS
- external-AI JSON workflow synthetic fixtures: 2 complete 40-page responses PASS
- masked owner-defect fixture: `YYYY · status` normalization PASS; `2022 · unknown` blocking PASS
- HTML Sanitizer compatibility E2E: PASS
- 40 `.full-slide`, 40 navigation links, Appendix 0, 1280×720, scale(1), zero overflow, zero script, save/reload/reopen: PASS
- Export PDF twice, Ctrl+P, Cmd+P: PASS
- PDF: 40 pages, 960×540pt, embedded Pretendard, no full-page raster fallback: PASS
- Vercel Preview: Ready

External-AI verification boundary:

- Actual corrected-prompt calls were not run because this execution environment has no external Gemini/third-party AI credential or invocation tool.
- Two deterministic complete synthetic responses and the masked real defect structure were validated in browser E2E.
- Owner Preview QA with two real external-AI responses remains a pre-merge approval gate.

