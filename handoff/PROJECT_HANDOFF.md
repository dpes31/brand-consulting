# Brand Consulting Generator — Project Handoff

## Current checkpoint

- Repository: `dpes31/brand-consulting`
- Production branch: `main`
- Production commit before this work: `96f12ac5bde92a53a97a12ea01ae9c3db921c7fe`
- Production URL: `https://brand-consulting.vercel.app/`
- Active branch: `fix/phase6-structured-report-renderer-v1`
- Draft PR: #21 `Replace Phase 6 HTML generation with app-owned structured renderer`
- Validated Phase 6 external-JSON implementation head: `d3b2ebd104d6bfddb90ba3051f92a9710b3a2a07`
- CI at validated implementation head:
  - `Phase 6 Color Correction Preview CI`: PASS
  - `Phase 6 PDF Runtime E2E`: PASS
- Vercel Preview: `https://brand-consulting-git-fix-phase6-structu-0fd4b6-dpes31s-projects.vercel.app/`
- Vercel state at validated implementation head: Ready
- `main`: unchanged
- Keep PR #21 Draft. Do not merge without corrected external-AI workflow QA and explicit owner approval.
- PR #20 remains the failed real-world QA record and must not be merged.
- Immutable rollback branches:
  - `backup/main-before-full-report-v1-2026-07-01`
  - `backup-production-stable-20260622`
- `public/template.html` remains the Legacy rollback asset.
- Verified Legacy blob SHA: `22bc6937b3d672e063d4b240c5a39b9c61700fec`.

## Immediate continuation document

Read first:

`handoff/PHASE6_EXTERNAL_AI_JSON_WORKFLOW_QA_2026-07-09.md`

The owner downloaded the new Phase 6 structured prompt and ran it through an external AI. The AI returned JSON rather than HTML. That response type is correct under the current architecture. The remaining failure is user-flow ambiguity and a mixed Creative History prompt contract.

## Executive diagnosis — 2026-07-09

The product must not return to AI-authored complete HTML.

The correct architecture is:

`Step 0–5 research`
→ `ProductionReportV3 structured JSON`
→ `exact schema and cross-page validation`
→ `app-owned fixed 40-page Renderer`
→ `standalone HTML`
→ `Viewer / save / reopen / Export PDF`

The owner-facing workflow is currently unclear. A non-developer can reasonably assume that uploading the downloaded prompt to an external AI should produce the final HTML. The UI must instead explain that the external AI returns JSON and the application creates the HTML.

The downloaded prompt also contains an internal conflict:

- top-level contract: JSON only; never HTML;
- Creative History contract: references `.timeline-container`, `.timeline-card`, `data-year`, and `data-copy-status`.

Those DOM instructions belong only in the app Renderer. They caused the real external-AI response to combine fixed year and status values, for example:

```json
"creative-history-target.year1.status": "2021 · not-found"
```

The current validator requires exact status values and rejects this string.

## Required next implementation

### 1. Make the five-step external-AI flow explicit

Visible Phase 6 sequence:

1. `외부 AI용 JSON 프롬프트 다운로드`
2. attach the file to the external AI
3. copy the complete JSON response
4. paste JSON into Phase 6
5. `JSON 검증 후 40페이지 보고서 만들기`

Required fixed notice:

`HTML은 외부 AI가 아니라 앱이 자동 생성합니다.`

Keep `기존 완성 HTML 가져오기` as a separate secondary compatibility option.

### 2. Replace Creative History rendering instructions with data instructions

Remove from the external-AI prompt:

- `.timeline-container`
- `.timeline-card`
- `data-year`
- `data-copy-status`
- all HTML class/attribute directions

Use a data contract only:

- `year1` = 2021
- `year2` = 2022
- `year3` = 2023
- `year4` = 2024
- `year5` = 2025
- `year6` = 2026 YTD
- status values exactly:
  - `verified-verbatim`
  - `source-found-copy-unverified`
  - `not-found`
- year is app-owned metadata and must not appear inside the status string

### 3. Add machine-readable status enums

Extend field definitions with enum and fixed-year metadata. The prompt should show the allowed status values as an actual enum, not only prose.

### 4. Recover the owner's current response safely

Allow a constrained compatibility normalization only when:

- the prefix year matches the field's fixed year;
- the suffix is exactly one allowed status.

Examples:

- `2021 · not-found` → `not-found`
- `2022 · verified-verbatim` → `verified-verbatim`
- `2026 YTD · not-found` → `not-found`

Generate a non-blocking page/field warning, then run strict validation again. Reject every other unknown or combined value.

### 5. Improve validation messages

Errors must show:

- page number;
- page title;
- Korean field label;
- received value;
- expected enum or format;
- whether automatic repair is available.

## Owner-approved output contract

- Main Deck: exactly 40 pages
- Appendix: 0 pages
- Page 40: Decision Receipt / Close
- Logical canvas: 1280×720, exact 16:9
- PDF MediaBox: 960×540pt
- Pretendard; major titles weight 900
- Korean `word-break: keep-all`
- Exact user-entered brand name; no translation or romanization
- Decisive consulting tone: `~한다`, `~이다`, `~다`
- Raw source URLs are not exposed
- Unverified advertising copy is not quoted

## Approved candidate-five to core-three competitor flow

- Page 11 Competitive Landscape may compare up to five evidence-supported Direct Competitor candidates.
- Page 12 Threat Ranking selects the core three when three supported candidates exist.
- The same core three, in ranking order, appear in:
  - pages 13–15 Deep Dive 1–3
  - page 16 Product Matrix
  - page 18 Positioning
  - pages 30–32 Competitor Creative History 1–3
  - page 33 Message Trajectory
- A fourth or fifth core competitor is never invented.

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

Removed from output:

- Creative Methodology
- Appendix A1–A7
- competitor 4–5 Deep Dive pages
- competitor 4–5 Creative History pages

## Page-specific locks

- P5: WANT / AVOID
- P12: three equal rank interpretation blocks
- P13–15: Evidence / Core Desire / Appeal / Threat Mechanism / Attack Point and threat rank 1–3
- P17: exactly 반복 화법 / 현재 역할 / 구조적 한계
- P18: meaningful evidence-based axes, target AS-IS/TO-BE, same core three
- P19: approved three-step consumer question shift and JTBD table
- P20: fixed trend-row records
- P21: target records remain one card each
- P22–24: Persona titles reuse P21 target names; fixed labels and index
- P26: Pain / 현재 문제 / Unmet Need / 우선순위
- P27: A → I → P1 → P2 → L with separate action/evidence/state values
- P28: journey and Product Principles remain separate
- P29–32: independent six-year Creative History
- P33: one independent trajectory row per target/core competitor
- P34: Current Copy → Missing Character
- P36: causal Root Cause flow
- P37: Segmentation → Targeting → Positioning
- P38: A/B/C/D routes
- P39: Selection Criteria / Final Choice two-column composition
- P40: one governing principle summarizing P39

## Blocking validation

Reject or repair before Viewer when:

- report is not version 3.0.0;
- page count is not exactly 40;
- page IDs or order differ;
- exact required fields are missing or unknown fields are present;
- field maxLength is exceeded;
- a field contains HTML or raw URLs;
- exact brand name differs;
- core-three consistency fails;
- Persona titles differ from P21 target names;
- Positioning axes are placeholders;
- STP Positioning is a connector;
- Creative History status is not one of the three exact enums;
- unverified Creative History copy uses quotation marks;
- P40 principle and support duplicate each other;
- app-owned DOM fingerprint changes during rendering.

Known compatibility normalization for the current owner response must be narrow, warned, and followed by the same strict validator.

## Required QA

### External-AI workflow

- Corrected prompt generated from the actual app.
- Real external AI response, not only synthetic filler.
- Two independent runs.
- Output begins with `{` and ends with `}`.
- No commentary, Markdown fence, HTML class, or data attribute.
- Exact 40 pages and exact field keys.
- Exact Creative History enum values.

### App rendering

- Paste current owner JSON and verify constrained normalization.
- App generates HTML without asking the external AI for HTML.
- 40 slides, 40 navigation links, zero Appendix.
- 1280×720 and scale(1).
- exact DOM grammar and zero overflow.
- save → reload → reopen preserves content and structure.

### PDF

- actual Export PDF button;
- second consecutive export;
- Ctrl+P;
- Cmd+P;
- 40 pages, 960×540pt;
- embedded Pretendard;
- no full-page raster rows;
- visual inspection of all pages.

## Creative History factuality

- Target brand and each core competitor retain independent 2021–2026 pages.
- Allowed statuses:
  - `verified-verbatim`
  - `source-found-copy-unverified`
  - `not-found`
- Only verified-verbatim copy may use quotation marks.
- Message Trajectory and Strategic So What remain mandatory.

## PDF runtime boundary

Two report systems coexist and remain separated:

- Legacy: `.slide-wrapper > .slide`, `installIframeLayoutSafety`, Legacy exporter
- Phase 6 FULL: `.full-slide`, `installFullReportRuntimeCompatibility`, browser-native print

A FULL report never enters the Legacy selector. Visible `Export PDF`, `Ctrl+P`, and `Cmd+P` target the active FULL Viewer iframe.

## Excluded experiments

- `feature-visualization-engine-v1` / PR #6: failed audit implementation; never merge
- PR #8, #9, #10: superseded experiments; never restore
- PR #18 and PR #19: superseded branch-transfer attempts; do not merge
- PR #20: failed real-world QA record; do not merge

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

