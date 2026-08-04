# AGENTS.md

Read `handoff/PROJECT_HANDOFF.md`, `handoff/WORK_LOG.md`, `handoff/DECISION_LOG.md`, `handoff/PHASE6_USER_BRIEF_IDENTITY_LOCK_2026-08-04.md`, `docs/REPORT_TEMPLATE_SPEC.md`, and `docs/PDF_EXPORT_E2E_STANDARD.md` before changing this repository.

## Safety

- Use Preview-first feature branches. Merge only with explicit owner approval.
- Never modify or delete:
  - `backup-production-stable-20260622`
  - `backup/main-before-full-report-v1-2026-07-01`
- Preserve milestone history; do not squash unless explicitly approved.
- Preserve `public/template.html` as the Legacy rollback asset. Verified blob SHA: `22bc6937b3d672e063d4b240c5a39b9c61700fec`.
- Do not merge or restore:
  - `feature-visualization-engine-v1` / PR #6
  - discarded PR #8, #9, #10 implementations
  - superseded PR #18–#23 Phase 6 attempts
- Successful deployment alone is not completion. Inspect actual Viewer screens and PDF evidence.

## Current checkpoint

- Production branch: `main`
- Production commit before PR #24: `96f12ac5bde92a53a97a12ea01ae9c3db921c7fe`
- Active branch: `fix/phase6-main40-final-html-semantic-v5`
- Draft PR: `#24 Restore Phase 6 complete HTML output with semantic field locking`
- Current documented implementation line: `4b04d494edad25743458626f2b3740abed2a7603`
- Preview: `https://brand-consulting-git-fix-phase6-main40-c77bea-dpes31s-projects.vercel.app/`
- Production build/contracts: PASS
- LG 퓨리케어 browser/PDF E2E: PASS
- Vercel: success
- `main`: unchanged and unmerged
- Keep PR #24 Draft until explicit owner Preview approval.

## Owner-approved Phase 6 flow

`Step 0–5 research`
→ `complete HTML prompt download`
→ `external AI returns one complete standalone 40-page HTML document`
→ `paste or .html/.htm/.txt upload`
→ `active-content sanitization`
→ `User Brief / Report Identity / semantic-field / DOM / cross-page / P18 validation`
→ `approved DOM reassembly`
→ `Viewer / save / reopen / native PDF`

External AI output is HTML, not JSON. Never relabel or restore a JSON-only external workflow.

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
- Separate company competitors from statements such as `브랜드가 아니라 위생이라는 단어 자체`.
- Strategic opponent is not a competitor brand and must never enter the Registry.
- Client need is a final strategy Constraint, not evidence to fabricate conclusions.

## Report Identity Lock

The application owns exact visible identity values:

- target brand
- core competitor 1–3 order
- canonical name
- display name
- aliases
- Landscape candidates

Apply the lock to P11, P12, P13–16, P18, P29–33. External AI may write analysis but may not abbreviate, translate, replace, or reorder these identities.

Merge aliases that represent one entity, for example:

- `삼성전자`
- `삼성 비스포크 정수기`
- `비스포크 정수기`

## Approved sample leakage protection

The approved Biznup report is a layout source only. Final visible text must be neutralized:

- Cover `BIZNUP` → `BRAND REPORT`
- P25 `비즈넵 기회` → `브랜드 기회`
- Persona label → `<exact brand>의 역할`
- navigation, toolbar, and document title → exact target brand
- brand-specific error copy → current target brand

Block unapproved visible sample identities such as `비즈넵/BIZNUP`, `삼쩜삼`, `더낸세금/혜움`, `SSEM/쌤157`. Permit one only when it is legitimately included in the target or Registry/alias lock.

## External AI attachment execution contract

The downloaded file is itself an execution request. On download, copy this chat-level instruction:

`첨부한 파일은 참고자료가 아니라 실행 지시문입니다. 파일 전체를 읽고 지금 즉시 완성된 40페이지 HTML만 생성하십시오. 계획·설명·확인 질문 없이 바로 작업하고, 결과 파일에는 <!DOCTYPE html>부터 </html>까지의 HTML만 저장하십시오.`

The output artifact:

- begins with `<!DOCTYPE html>`;
- ends with `</html>`;
- uses raw HTML without Markdown fences;
- does not contain prompt instructions, Step 0–5 source text outside the report, or analysis notes.

## Semantic HTML contract

- Variable report content uses stable `data-report-field` keys, not DOM text order.
- `[[CONTENT:Pxx:TAG:nnn]]` and generic `.contentN` mappings are prohibited.
- Prompt tokens use `[[FIELD:semantic.key]]`; every token must be replaced before import.
- Rich fields allow only `<mark>` and `<br>` descendants.
- Plain text, source, and status fields permit no child markup.
- Literal `[[...]]` is prohibited in returned and compiled HTML.
- External DOM/CSS changes are not trusted. Only validated semantic values and P18 coordinates move into the approved DOM.
- Remove or reject scripts, event handlers, JavaScript URLs, refresh redirects, forms, embeds, and autoplay media.

## HTML file upload

- Accept `.html`, `.htm`, and `.txt`, maximum 20MB.
- Load file content into the same controlled textarea used by paste.
- Paste and upload must use one identical Sanitizer/Identity/semantic/Viewer/PDF path.
- Do not create a separate relaxed upload renderer.

## Product invariants

- Final report: exactly 40 Main Deck pages.
- Appendix: exactly 0 pages.
- Page 40: Decision Receipt / Close.
- Logical canvas: 1280×720, exact 16:9.
- PDF MediaBox: 960×540pt.
- Typeface: Pretendard; major titles weight 900.
- Korean wrapping: `word-break: keep-all`.
- Preserve the exact user-entered brand name without translation or romanization.
- Do not invent figures, dates, models, scores, axes, coordinates, sources, competitors, or advertising copy.
- Only `verified-verbatim` copy may use quotation marks.
- Do not expose raw URLs.
- Titles and SO WHAT statements use decisive Korean endings: `~한다`, `~이다`, `~다`.

## Competitor rules

- P11 reviews up to five evidence-supported Direct Competitor candidates.
- P12 selects the core three when three supported candidates exist.
- P13–16, P18, and P30–33 use the same core three in ranking order.
- Do not invent competitors to fill capacity.
- Hide explicit unused rows such as `추가 후보 없음`, `없음`, or `not-found`.
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

Creative Methodology and Appendix A1–A7 are excluded.

## Page grammar locks

- P2: `핵심 진단`
- P4: `FACTS`
- P5: `CATEGORY & TARGET`
- P10: `CATEGORY SHIFT`, `LEVEL 1`–`LEVEL 5`
- Persona: `SITUATION / REAL JTBD / AS-IS IDENTITY / TO-BE IDENTITY / <brand>의 역할`
- Persona titles reuse P21 target names; indices `02` and `03` stay on one line.
- P26 retains Pain / current problem / Unmet Need / priority.
- P27 retains the approved AIPL friction-flow.
- Creative History retains centered six-year cards without decorative NOW circles.
- P34 retains Current Copy / Missing Character.
- P37 retains Segmentation → Targeting → Positioning.
- P38 retains A/B/C/D and 차별/확장/실행 comparison.
- P39 retains two-column Selection Criteria / Final Choice.

## P18 Positioning contract

- Axis poles are defensible Step 2 attributes, not literal axis labels.
- Target labels resolve to `<exact brand> AS-IS · ...` and `<exact brand> TO-BE · ...`.
- Ten coordinate values cover core competitors 1–3 and target AS-IS/TO-BE.
- x=0 left, x=100 right; y=0 top, y=100 bottom.
- Coordinates are integers 0–100.
- AS-IS and TO-BE must show meaningful movement.
- Store applied positions in `data-position-x`, `data-position-y`, and `data-positioning-coordinate-contract="semantic-0-100-v1"`.

## Creative History factuality

- Target brand and each core competitor have independent 2021–2026 YTD pages.
- Canonical statuses:
  - `verified-verbatim`
  - `source-found-copy-unverified`
  - `not-found`
- Import may normalize common humanized variants, but new prompts demand canonical codes.
- Preserve Message Trajectory and Strategic So What.

## Validated Visual Intent contracts

- Step 0: one Growth Story Brief, `milestone-timeline`.
- Step 2: `rank-scorecard`; Product Matrix `feature-matrix`; Positioning only with defensible common axes.
- Step 3: one decision Brief, `friction-flow`, `implementationStatus: planned`, `metrics: []`.
- Step 5: one final decision Brief, `choice-architecture`, `implementationStatus: planned`, `metrics: []`.

## PDF acceptance

- Legacy reports use `.slide-wrapper > .slide` and the Legacy exporter.
- Phase 6 FULL uses `.full-slide` and browser-native print.
- Install FULL runtime before Legacy guards.
- `Export PDF`, `Ctrl+P`, and `Cmd+P` target the active FULL Viewer iframe.
- E2E requires two consecutive exports and save → reload → reopen.
- PDF requires 40 pages, 960×540pt, embedded fonts, and zero full-page 2560×1440 raster rows.
- Do not declare visual completion without inspecting screenshots and rendered PDF pages.

## Required documentation

Update these when architecture, contracts, branch state, validation, or rollback changes:

- `AGENTS.md`
- `handoff/PROJECT_HANDOFF.md`
- `handoff/WORK_LOG.md`
- `handoff/DECISION_LOG.md`
- `handoff/PHASE6_USER_BRIEF_IDENTITY_LOCK_2026-08-04.md`
- `docs/REPORT_TEMPLATE_SPEC.md`
- `docs/PDF_EXPORT_E2E_STANDARD.md`
