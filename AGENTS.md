# AGENTS.md

Read `handoff/PROJECT_HANDOFF.md`, `handoff/WORK_LOG.md`, `handoff/DECISION_LOG.md`, `docs/REPORT_TEMPLATE_SPEC.md`, and `docs/PDF_EXPORT_E2E_STANDARD.md` before changing this repository.

## Safety

- Use Preview-first feature branches. Merge only with explicit owner approval.
- Never modify, force-move, or delete:
  - `backup-production-stable-20260622`
  - `backup/main-before-full-report-v1-2026-07-01`
- Preserve milestone history; do not squash unless explicitly approved.
- Preserve `public/template.html` as the Legacy rollback asset. Verified blob SHA: `22bc6937b3d672e063d4b240c5a39b9c61700fec`.
- Do not merge or restore:
  - `feature-visualization-engine-v1` / PR #6
  - discarded PR #8, #9, #10 implementations
  - superseded PR #18–#23 Phase 6 attempts
  - the rejected V6 lightweight semantic-workbook path introduced inside PR #24
- Successful deployment alone is not completion. Inspect actual Viewer screens and rendered PDF evidence.

## Current checkpoint — 2026-08-21

- Repository: `dpes31/brand-consulting`
- Production branch: `main`
- Current production commit: `d45d7f16b4d5f305d10e28b8f80a158c7073c37b`
- Production URL: `https://brand-consulting.vercel.app/`
- Active branch: `fix/phase6-coway-real-output-validation-v1`
- Draft PR: `#26 Harden Phase 6 real HTML validation and PDF parity`
- Current implementation head before this documentation update: `88d64a4ea6801479e78c54879b81b9234e331355`
- Preview: `https://brand-consulting-git-fix-phase6-coway-r-2e3260-dpes31s-projects.vercel.app`
- Phase 6 Color Correction Preview CI run `32437175392`: PASS
- Phase 6 PDF Runtime E2E run `32437175313`: PASS
- Vercel Preview: Ready
- Owner end-to-end Coway test: PASS
  - same latest Coway HTML re-uploaded without blocking error
  - P4 Viewer `계정 → 매출 → 해외 → 비렉스`: PASS
  - P4 PDF `계정 → 매출 → 해외 → 비렉스`: PASS
- `main` is not yet merged with PR #26.
- PR #26 remains Draft until final documentation/CI review and explicit owner merge approval.

## Owner-approved Phase 6 flow

`Step 0–5 research`
→ `phase6_complete_html_prompt_<brand>.txt`
→ `external AI returns one complete standalone styled 40-page HTML`
→ `paste or .html/.htm/.txt upload`
→ `active-content / User Brief / Report Identity / semantic-field / DOM / cross-page / P12 / Persona / P18 validation`
→ `approved DOM reassembly and app-owned presentation correction`
→ `Viewer / save / reopen / native PDF`

External AI output is HTML, not JSON. The external result must be a directly viewable report, not a data workbook.

## Rejected lightweight-workbook experiment

The V6 timeout experiment removed CSS, final layout wrappers, tables, diagrams, and navigation from the external artifact and asked the app to expand a semantic workbook later. Owner testing produced a 40-section field dump with no visual report format. It also contained repeated JTBD cells, noncanonical statuses, and raw URLs.

Therefore:

- `phase6_lightweight_html_prompt_<brand>.txt` is rejected.
- `완성 HTML 프롬프트 다운로드 (경량)` is rejected.
- `createSemanticHtmlWorkbookV6`, `buildSemanticHtmlPromptV6`, and `compileSemanticHtmlReportV6` must not be active in external or internal Phase 6 paths.
- Do not describe a semantic workbook as a complete HTML report.
- Do not remove approved CSS, 1280×720 page DOM, tables, diagrams, navigation, or decorative structure to reduce attachment size.
- The historical large-message timeout remains a transport risk; do not claim it is architecturally solved unless separately verified.

## Approved-base cache and semantic DOM lock

The approved Phase 6 base is derived application output, not user research.

- Current approved-base cache prefix: `brand-consulting:phase6-semantic-html-v5-p18-vector-v1:`.
- Cache invalidation must not delete Step 0–5 research, User Brief, Competitor Registry, saved projects, or completed reports.
- Capture the hidden Pilot only after:
  - `phase6PagePlanReady === true`
  - `fullReportV4Ready === true`
  - exactly 40 `.full-slide` pages
- Generic `.contentN` fields remain blocking errors. Do not silence the validator to accommodate unowned runtime DOM.
- External AI may write semantic fields and P18 coordinate values only. Approved layout DOM remains app-owned.

## Fixed app-owned presentation corrections

These are not research fields and must be normalized by the app before/after external AI round-trip where applicable.

- P4 FACTS KPI flow: exactly `계정 → 매출 → 해외 → 비렉스`; all three connector glyphs are `→`.
- P11 JOB note: `JOB : 고객이 특정 상황에서 달성하고 싶어 하는 근본적인 목표나 해결하고자 하는 일을 뜻함`.
- P25 JOB note: the same exact sentence immediately above `Job 층위`.
- P18: one app-owned `.map-arrow-vector`; legacy `.positioning-arrow-v2` is prohibited.
- P29 target-brand breadcrumb: `IV. CREATIVE > TARGET BRAND HISTORY`.

P4 must be normalized in approved base sanitization, external HTML normalization, and final identity/presentation policy so older cached/output HTML with `?` cannot reintroduce the defect.

## User Brief Lock

The brand-keyed Brief owns and preserves:

- exact `targetBrand`
- mandatory competitor review seeds
- strategic opponent / category convention
- client need / campaign direction
- reference note
- attachment manifest

Rules:

- Inject the Brief into every Step 0–5 prompt and Phase 6.
- Persist it in session storage and brand-keyed local storage.
- Restore it when the same brand is reopened.
- Strategic opponent is not a competitor brand and must never enter the Registry.
- Client need is a strategy constraint, not evidence to fabricate conclusions.

## Report Identity Lock

The application owns exact visible identity values:

- target brand
- core competitor 1–3 order
- canonical name
- display name
- aliases
- Landscape candidates

Apply the lock to P11, P12, P13–16, P18, P29–33. External AI may write analysis but may not abbreviate, translate, replace, or reorder these identities.

## External AI attachment execution contract

The downloaded file is itself an execution request. On download, copy this chat-level instruction:

`첨부한 파일은 참고자료가 아니라 실행 지시문입니다. 파일 전체를 읽고 승인된 CSS·레이아웃·도식·표·내비게이션을 그대로 보존한 완성 40페이지 HTML만 즉시 생성하십시오. 계획·설명·확인 질문 없이 바로 작업하고, 결과 파일에는 <!DOCTYPE html>부터 </html>까지의 HTML만 저장하십시오.`

The output artifact:

- begins with `<!DOCTYPE html>` and ends with `</html>`;
- includes approved CSS, 1280×720 page DOM, tables, diagrams, navigation, IDs, classes, and visual structure;
- contains exactly 40 `.full-slide` sections in approved ID order;
- contains every required `data-report-field` and P18 coordinate field;
- does not contain prompt instructions, research outside report pages, or analysis notes.

## Semantic HTML and quality contract

- Variable report content uses stable `data-report-field` keys, not DOM text order.
- `[[CONTENT:Pxx:TAG:nnn]]` and generic `.contentN` mappings are prohibited.
- Prompt tokens use `[[FIELD:semantic.key]]`; every token must be replaced before import.
- P18 uses `[[POSITION:semantic.key]]`; every coordinate token must be replaced with an integer 0–100.
- Rich fields allow `<mark>` and `<br>` only. Safe external `<b>/<strong>` may be normalized to `<mark>`; other tags remain blocking.
- Plain text, source, and status fields permit no child markup.
- Literal `[[...]]` is prohibited in returned and compiled HTML.
- External DOM/CSS changes are not trusted. Only validated semantic values and P18 coordinates move into approved DOM.
- Remove or reject scripts, event handlers, JavaScript URLs, redirects, forms, embeds, and autoplay media.
- Do not expose raw URLs. Use `발행처 · 자료명 · 연도`.
- Creative History status is exactly one of:
  - `verified-verbatim`
  - `source-found-copy-unverified`
  - `not-found`
- Do not invent figures, dates, models, scores, axes, coordinates, sources, competitors, or advertising copy.

## P12 Threat Ranking score contract

P12 score fields are numeric scores, never prose.

- `penetration`: integer 0–25
- `growth`: integer 0–20
- `preference`: integer 0–20
- `campaign`: integer 0–15
- `inflection`: integer 0–15
- `evidence`: integer 0–5
- `total`: exact sum, integer 0–100

Validation must collect all detectable blocking score errors rather than stopping after the first one. Do not weaken maxLength/type/range checks to accept prose in score fields.

## Persona cross-page contract

- P21 defines target 1–5.
- P22, P23, P24 must analyze P21 target 1, 2, 3 respectively.
- Persona titles may be conclusion-led, but target 4/5 or another target identity may not be substituted.
- `Brand Role` and `SO WHAT` must perform different jobs; excessive duplicated wording is a quality error.

## P18 Positioning contract

- Axis poles are defensible Step 2 attributes, not literal axis labels.
- Target labels resolve to `<exact brand> AS-IS · ...` and `<exact brand> TO-BE · ...`.
- Ten coordinate values cover core competitors 1–3 and target AS-IS/TO-BE.
- x=0 left, x=100 right; y=0 top, y=100 bottom.
- Coordinates are integers 0–100.
- AS-IS and TO-BE must show meaningful movement.
- One app-owned semantic coordinate-linked SVG vector is rendered; legacy fixed overlay is prohibited.

## Product invariants

- Final report: exactly 40 Main Deck pages.
- Appendix: exactly 0 pages.
- Page 40: Decision Receipt / Close.
- Logical canvas: 1280×720, exact 16:9.
- PDF MediaBox: 960×540pt.
- Typeface: Pretendard; major titles weight 900.
- Korean wrapping: `word-break: keep-all`.
- Preserve exact user-entered brand name without translation or romanization.
- Only `verified-verbatim` copy may use quotation marks.
- Titles and SO WHAT statements should use decisive Korean endings; copy-style variation is non-blocking unless it causes another contract violation.

## Competitor rules

- P11 reviews up to five evidence-supported Direct Competitor candidates.
- P12 selects the core three when three supported candidates exist.
- P13–16, P18, and P30–33 use the same core three in ranking order.
- Do not invent competitors to fill capacity.
- Indirect competitors are not core Deep Dive targets.

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

Creative Methodology and Appendix are excluded.

## PDF acceptance

- Legacy reports use `.slide-wrapper > .slide` and the Legacy exporter.
- Phase 6 FULL uses `.full-slide` and browser-native print.
- Install FULL runtime before Legacy guards.
- `Export PDF`, `Ctrl+P`, and `Cmd+P` target the active FULL Viewer iframe.
- E2E requires two consecutive exports and save → reload → reopen.
- PDF requires 40 pages, 960×540pt, embedded fonts, and no full-page raster fallback.
- Do not declare visual completion without actual Viewer/PDF evidence.

## PR #26 final acceptance evidence

At implementation head `88d64a4ea6801479e78c54879b81b9234e331355`:

- actual Coway external-AI HTML regression: PASS
- synthetic semantic regression: PASS
- P12 score contract regression: PASS
- P18 single vector and coordinate application: PASS
- P29 target breadcrumb correction: PASS
- P4 runtime / legacy cached base / legacy external HTML auto-repair: PASS
- 40 pages / navigation 40 / overflow 0: PASS
- Viewer save → reload → reopen: PASS
- repeated PDF export and keyboard print routing: PASS
- PDF 40 pages / 960×540pt / embedded Pretendard: PASS
- owner final Preview test: HTML upload / P4 Viewer / P4 PDF all PASS

## Required documentation

Update these when architecture, contracts, branch state, validation, or rollback changes:

- `AGENTS.md`
- `handoff/PROJECT_HANDOFF.md`
- `handoff/WORK_LOG.md`
- `handoff/DECISION_LOG.md`
- `docs/REPORT_TEMPLATE_SPEC.md`
- `docs/PDF_EXPORT_E2E_STANDARD.md` when PDF acceptance itself changes
