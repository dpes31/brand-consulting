# Phase 6 Real-World QA Handoff — 2026-07-08

## 0. Executive decision

PR #20 must remain Draft and must not be merged.

The automated build, Viewer, persistence, and PDF checks passed, but the owner's real Step 0–6 run exposed a separate and more serious defect: **the current external-AI path lets the model rewrite the report's semantic DOM and place valid research text into the wrong visual fields.**

The next session must not continue with another prompt-only patch or a page-by-page cosmetic fix. The durable correction is:

1. the app owns the exact 40-page DOM/CSS and page grammar;
2. AI returns page-scoped structured content only;
3. the app injects content into fixed semantic fields;
4. pasted HTML is sanitized and supported only as a compatibility path;
5. real external-AI output is used in E2E, not only synthetic slot filler.

## 1. Repository checkpoint

- Repository: `dpes31/brand-consulting`
- Active branch: `fix/phase6-approved-main40-no-appendix-v3`
- Draft PR: #20 `Restore approved 40-page report structure without Appendix`
- Base: `main`
- Production commit before this work: `96f12ac5bde92a53a97a12ea01ae9c3db921c7fe`
- Preview before this handoff: `https://brand-consulting-git-fix-phase6-approve-1dd31d-dpes31s-projects.vercel.app`
- `main`: unchanged
- Protected Legacy asset: `public/template.html`
- Protected Legacy blob SHA: `22bc6937b3d672e063d4b240c5a39b9c61700fec`
- Protected backup branches remain untouched.

## 2. Owner QA artifacts inspected

The owner completed a new Step 0–6 run and supplied:

- `비즈넵 테스트 HTML_v1.txt`
- `비즈넵_Strategic_Report_40slides.html`
- positioning screenshots comparing the generated report and the approved reference

Measured facts:

- The two uploaded files decode to the **same 261,847-character HTML**.
- The only file-level difference is line endings: TXT uses CRLF, HTML uses LF.
- Both contain exactly 40 `.full-slide` elements and 40 `.full-frame` elements.
- Both declare zero Appendix pages.
- Both contain exactly one inline `<script>`:

```js
document.addEventListener('click',e=>{if(e.target&&e.target.textContent.trim()==='PDF / Print')window.print();});
```

- All 40 outer frames are serialized as `1049.6 × 590.4` with inner `scale(0.82)`, rather than canonical `1280 × 720` / `scale(1)`.
- The HTML contains no iframe, object, embed, form, or inline event attributes.

## 3. Why `Script is not allowed` occurs

### Current code path

`assertApprovedFullReportHtml()` rejects any `<script>` after parsing:

```ts
if (doc.querySelector('script')) throw new Error('Script is not allowed');
```

The external model added a harmless PDF/Print listener that is not required by the app. The downloaded file opens because a browser accepts the script; paste-to-app fails because the app rejects every script.

### Required correction

Sanitize before validation:

1. parse the complete HTML;
2. remove every `script` and `noscript` node;
3. remove all `on*` attributes;
4. remove `javascript:` URLs;
5. reject `iframe`, `object`, `embed`, `form`, and other active-content elements;
6. canonicalize frame dimensions;
7. run structural and semantic validation;
8. persist the sanitized document.

The report needs no JavaScript. Therefore scripts should be removed, not executed and not treated as a user-facing blocking error.

Add a regression fixture containing the exact print-listener script and verify that paste → sanitize → Viewer succeeds.

## 4. The primary architectural defect

### 4.1 AI is still editing the complete HTML

`buildFullReportHtmlPrompt()` asks the model to return one complete HTML document. The prompt says the DOM is immutable, but that is only an instruction. The model can still add nodes, remove nodes, rename field content, and move text between elements.

Observed examples:

- P19 adds `CONSUMER TRUTH`, replaces the approved three-step question flow with `BUT / CORE JOB`, and corrupts the JTBD table.
- P20 collapses several trend rows into one paragraph and repeats fallback content in later rows.
- P21 distributes target names, descriptions, and common needs into the wrong cards.
- P22–24 place full sentences inside the persona index and move `SITUATION`, `REAL JTBD`, identity labels, and role content into unrelated fields.
- P26 splits one logical pain row across two rendered rows.
- P27 puts arrows and phase labels into action, copy, and state fields.
- P28 duplicates journey content inside Product Principles.
- P37 moves explanatory text into the STP arrow and leaves Positioning as `→`.

### 4.2 The slot model is text-node based, not semantic-field based

`neutralizeSlide()` walks every text node and creates generic slots based on tag/class:

```ts
[[CONTENT:P27:STRONG:...]]
[[CONTENT:P27:P:...]]
[[CONTENT:P27:EM:...]]
```

This does not tell the model that a specific P27 `strong` is an action, the following `p` is evidence, and the following `em` is the state. Every text node becomes an independent completion target.

Consequences:

- fields can shift left or right;
- labels can become prose;
- prose can become connectors;
- repeated components can receive duplicate content;
- one semantic record can be split across multiple rows;
- valid content can appear on the wrong page or in the wrong field.

### 4.3 Fixed labels are incomplete

`FIXED_TEXT_SELECTORS` preserves some labels but not the full page grammar.

Missing or insufficiently locked examples:

- P5 `.target-tension b`: WANT / AVOID
- P13–15 `.deep-node > small`: Evidence / Core Desire / Appeal / Threat Mechanism / Attack Point
- P13–15 score interpretation/rank label
- P17 first-column cliché names and column count
- P18 axis names and dot roles
- P19 JTBD table headers and row labels
- P20 row schema
- P21 target-card field roles
- P22–24 persona index and all semantic field boundaries
- P26 pain-row field boundaries
- P27 action/copy/state boundaries
- P28 journey stages vs Product Principles
- P33 trajectory row structure
- P34 current-copy vs missing-character fields
- P36 root-cause field roles
- P37 STP arrows and Positioning field
- P40 final-message grammar

### 4.4 Validation checks presence, not immutability

`assertApprovedFullReportHtml()` currently verifies only:

- 40 pages;
- page order/zone;
- unique IDs;
- existence of a small number of broad selectors;
- removed pages absent;
- brand present;
- script absent.

It does **not** verify:

- exact child-node order;
- exact class list or component count per page;
- fixed labels;
- table dimensions;
- axis labels;
- per-page field mapping;
- duplication;
- content placed in connectors;
- source/status consistency;
- exact approved DOM fingerprint.

`assertAllResearchSlotsFilled()` checks only unresolved tokens and minimum text length. A corrupted page with enough text passes.

`assertResearchEvidencePresent()` checks brand, candidate names, top-three names in broad downstream sections, and a small KPI sample. It does not verify that each item is in the correct field.

## 5. Why the previous E2E passed

The previous E2E proved runtime integrity, not semantic compilation integrity.

It used deterministic synthetic filler that replaced slots according to generic role names. It verified:

- 40 pages;
- navigation;
- IDs/order;
- logical slide dimensions;
- overflow;
- Viewer/save/reopen;
- Export PDF, repeat export, Ctrl+P, Cmd+P;
- PDF page count, MediaBox, fonts, and raster structure.

It did not use a real external-AI response and did not compare each page against the canonical semantic DOM. Therefore it could not detect:

- slot shifting;
- label replacement;
- duplicated conclusions;
- corrupted rows;
- wrong axis names;
- AI-added nodes;
- malformed final message.

The real owner run is the missing semantic E2E and supersedes the previous completion claim.

## 6. Scale leakage and unreadably small text

The canonical Pilot uses React state to scale frames to the current browser width. `loadApprovedPilotBaseHtml()` serializes `root.innerHTML` from that live viewport, including inline frame styles.

In the owner output every frame became:

```html
<div class="full-frame" style="width: 1049.6px; height: 590.4px;">
  <div class="full-frame-inner" style="transform: scale(0.82);">
```

Thus nominal 12px text renders at approximately 9.84px. Existing 9–10px labels render around 7.4–8.2px. This directly explains the repeated complaint that body copy and sublabels are unreadably small.

Required correction:

- Before serializing the canonical Base HTML, force every `.full-frame` to `1280px × 720px`.
- Force every `.full-frame-inner` to `transform: scale(1)`.
- Do not persist viewport-dependent scale values.
- Viewer may apply an external presentation transform, but the stored report document remains canonical.
- Add a contract test that rejects serialized outer frames below 1280×720 or inner scale other than 1.

Recommended logical type floor:

- ordinary body/evidence: at least 12.5–13px;
- strategic conclusion/subheading: at least 14px;
- structural labels: at least 11px;
- source/status/caveat only: 9.5–10px exception;
- never solve density by globally reducing type.

## 7. Required page corrections

### P05 — CATEGORY & TARGET

- Keep the approved category-rings layout.
- Fixed labels must be exactly `WANT` and `AVOID`.
- Do not allow `상황`, `긴장`, or other substitutions.
- Enlarge target-statement and tension copy according to the type floor.

### P12 — THREAT RANKING

- Keep the approved ranking table.
- The three interpretation blocks below the table must be equal-width, centered, and evenly distributed.
- The blocks must correspond exactly to rank 1, 2, and 3.
- Add DOM/count checks: exactly three children and equal grid tracks.

### P13–15 — DEEP DIVE 1–3

- Fixed semantic headings:
  - Evidence
  - Core Desire
  - Appeal
  - Threat Mechanism
  - Attack Point
- Every heading remains a visible subheading inside its original node.
- A content record may not move to the next node.
- Replace `/100` under the numeric score with:
  - P13: `위협 1순위`
  - P14: `위협 2순위`
  - P15: `위협 3순위`
- The score itself remains a strategic score, not market share.
- Sources remain in the source region, not inside a deep-node.

### P17 — CATEGORY CLICHÉS

- First column contains research-derived core cliché wording, not `01–04`.
- Expected examples are category-specific phrases such as 숨은 돈, 간편함, 최대 환급액, 전문가 검토; use current research rather than hard-coding Biznup examples.
- Remove the `새 질문` column entirely.
- Expand the remaining three columns: 반복 화법 / 현재 역할 / 구조적 한계.
- Increase row copy size and vertical spacing.
- Update the canonical DOM and CSS, not only generated content.

### P18 — POSITIONING

- Never display literal `X축` or `Y축` in the final map.
- Required fields:
  - x-left axis name;
  - x-right axis name;
  - y-top axis name;
  - y-bottom axis name;
  - target-brand AS-IS dot;
  - target-brand TO-BE dot;
  - three ranked competitor dots;
  - optional movement arrow.
- Axis names must be supported by common comparison evidence. If common axes are not defensible, render an Evidence Gap state instead of inventing axes.
- Dot names and axis names require separate JSON fields and separate validators.

### P19 — CONSUMER EXECUTIVE CONCLUSION

- Restore the exact approved layout and hierarchy.
- Do not add `CONSUMER TRUTH`, `BUT`, `CORE JOB`, or `IDENTITY` unless those are fixed parts of the approved source layout.
- Use the approved three-step question shift and approved JTBD table fields only.
- No duplicated title text in SO WHAT.

### P20 — TRENDS

- Preserve exactly the approved number of trend rows.
- Each row has fixed fields: index / trend / evidence / change / SO WHAT.
- No row may absorb the next row's index or content.
- No fallback repetition such as `핵심 판단 / 전략 근거 / 세금 결정권` across remaining rows.

### P21 — CORE TARGET

- Preserve the approved target-spectrum card structure.
- One target record maps to one card: name / situation / need.
- Page 21's three named target groups become the immutable title source for Persona 1–3.
- Common target profile fields remain in the profile strip and may not spill into cards.

### P22–24 — PERSONA 1–3

- Preserve exact approved layout.
- Fixed labels:
  - SITUATION
  - REAL JTBD
  - AS-IS IDENTITY
  - TO-BE IDENTITY
  - 브랜드의 역할
- Persona index is fixed `01`, `02`, or `03`, never prose.
- Persona title equals the corresponding P21 target name verbatim.
- Situation, surface need, real job, fears, current identity, desired identity, and brand role are separate required fields.
- Connectors remain arrows only.

### P26 — PAIN POINTS & UNMET NEEDS

- Preserve four columns: Pain / 현재 문제 / Unmet Need / 우선순위.
- One research record equals one rendered row.
- Prevent the current defect where labels themselves become data and one record is split across two rows.
- Validate row count and non-empty values for every column.

### P27 — AIPL BOTTLENECK

- Fixed stage codes and labels:
  - A / Awareness
  - I / Interest
  - P1 / Permission or approved first purchase substage
  - P2 / Purchase or approved second purchase substage
  - L / Loyalty
- Each stage has separate action / evidence / state fields.
- Arrows are fixed connectors and can never enter action, evidence, or state fields.
- Friction analysis has fixed title, bottleneck statement, and bullet list fields.
- Validate the A→I→P1→P2→L order.

### P28 — PURCHASE TO LOYALTY

- Preserve the approved journey flow.
- One stage equals one record.
- Product Principles remain a separate fixed component and may not duplicate journey-stage content.
- Validate stage names, connectors, and final relationship state separately.

### P30–32 — COMPETITOR CREATIVE HISTORY

- Preserve the exact centered six-year layout.
- Keep 2021–2026 YTD columns aligned.
- No decorative NOW circles.
- Preserve independent campaign, copy status, source, detail, Message Trajectory, and Strategic So What fields.
- Enforce copy-status rules before quotation marks.

### P33 — MESSAGE TRAJECTORY

- Preserve one independent trajectory row per target brand/core competitor.
- Each row maintains brand name and ordered message stages.
- Do not merge brands or move stage text between rows.

### P34 — CREATIVE INSIGHT

- Preserve approved Current Copy → Missing Character comparison.
- Connector remains a symbol.
- Remove duplicated `MISSING CHARACTER` heading.
- Current copy, diagnosis, missing character, and strategic conclusion are separate fields.

### P36 — GAP & ROOT CAUSE

- Preserve the approved causal-flow DOM.
- Market / Competitor / Consumer / Creative evidence, GAP, ROOT CAUSE, and STRATEGIC OPPORTUNITY remain separate fields.
- Do not reinterpret the page into another four-box sequence unless the canonical layout is intentionally changed in app code and approved.

### P37 — STP

- Preserve `Segmentation → Targeting → Positioning`.
- Arrows remain arrows.
- Targeting description may not enter the arrow field.
- Positioning statement may not become `→`.
- Segment records, selected target, and positioning statement require separate schema fields.

### P38 — FOUR STRATEGIC DIRECTIONS

- Preserve A/B/C/D rows.
- Each route has separate type / proposition / direction / trade-off / differentiation / expansion / execution fields.
- Ratings use one consistent representation; do not mix numeric scores and prose labels in the same contract.
- Final selection must be consistent with P39.

### P40 — DECISION RECEIPT / CLOSE

- This page must end the report with one governing summary message.
- Do not produce disconnected phrases such as `비즈넵은 찾고, 설명하고, 지킨다` unless it is explicitly approved as the final brand principle.
- Required fields:
  - final principle headline;
  - one short supporting line;
  - optional exact brand signature.
- Prohibit repeated fragments, multiple competing slogans, or unexplained operational verbs.
- The final message must summarize the chosen strategy from P39, not invent a new message.

## 8. Durable implementation direction

### 8.1 Restore app-owned rendering

Create a new structured contract, for example `ProductionReportV3`, with one schema per page.

Example:

```ts
type PositioningPage = {
  title: string;
  xAxis: { left: string; right: string; evidence: SourceRef[] };
  yAxis: { bottom: string; top: string; evidence: SourceRef[] };
  targetAsIs: PositionPoint;
  targetToBe: PositionPoint;
  competitors: [PositionPoint, PositionPoint, PositionPoint];
  soWhat: string;
};
```

The renderer owns all HTML tags, classes, row counts, connectors, fixed labels, and CSS. AI can only populate values allowed by the page schema.

### 8.2 External and internal AI use the same contract

- External path: prompt download → structured JSON paste → app validation → app renderer.
- Internal API path: structured JSON generation → same validation → same renderer.
- Do not maintain separate HTML and JSON logic.
- Retire complete-HTML generation as the primary production path.

### 8.3 DOM fingerprint

For every page, store and validate:

- required root ID;
- required component classes;
- direct-child order;
- exact fixed labels;
- expected row/card counts;
- connector count/type;
- forbidden nodes;
- semantic field binding.

A report that changes the approved DOM hierarchy must fail before Viewer rendering with a page-specific error.

### 8.4 Compatibility HTML importer

To avoid breaking existing user workflows while the JSON path is restored:

- accept pasted complete HTML;
- sanitize active content;
- canonicalize scale;
- validate exact DOM fingerprint;
- if fingerprint differs, show a page-specific message such as:
  - `P27 AIPL 구조가 변경되었습니다: stage 3 action field missing`;
- never silently accept malformed HTML.

## 9. Required QA gates

### Gate A — sanitizer

- Paste the supplied 40-page HTML containing the print-listener script.
- Script is removed.
- Viewer opens.
- Stored/reopened HTML contains zero scripts and zero event handlers.

### Gate B — canonical geometry and typography

- Every stored `.full-frame`: 1280×720.
- Every `.full-frame-inner`: scale(1).
- Every `.full-slide`: 1280×720.
- No body overflow.
- Type-floor assertions pass.

### Gate C — exact semantic DOM

Snapshot/fingerprint checks for at least:

- P5, P12–18;
- P19–28;
- P30–40.

Verify exact child order, fixed labels, row counts, and connector fields.

### Gate D — real external-AI run

Do not use only generic slot filler.

1. Complete Step 0–5 with a non-Biznup brand.
2. Download the actual external-AI prompt.
3. Generate a real model response.
4. Paste it into the app.
5. Verify all page schemas and visual snapshots.
6. Repeat with Biznup research to reproduce the owner's scenario.

### Gate E — persistence and PDF

After semantic validation passes:

- Viewer navigation: 40 links;
- save → reload → reopen: identical content and DOM;
- actual Export PDF button;
- second consecutive export;
- Ctrl+P;
- Cmd+P;
- 40-page 960×540pt PDF;
- embedded fonts;
- no full-page raster fallback;
- visual review of every page before completion claim.

## 10. Forbidden shortcuts

- Do not fix only the prompt wording.
- Do not add more generic `FIXED_TEXT_SELECTORS` and declare completion without structured fields.
- Do not allow the model to return arbitrary complete HTML as the durable architecture.
- Do not shrink text to resolve density.
- Do not validate only page count, IDs, or selector existence.
- Do not use only synthetic E2E filler.
- Do not merge PR #20 before the owner's new real-world Preview test passes.
- Do not modify `public/template.html` or protected backup branches.

## 11. Recommended implementation sequence

1. Freeze PR #20 as Draft and record real-world QA failure.
2. Add the supplied HTML as a private/local regression fixture or create an equivalent sanitized fixture with the exact malformed structures.
3. Implement sanitize-before-validate.
4. Canonicalize 1280×720/scale(1) during Pilot capture and persistence.
5. Define page-scoped `ProductionReportV3` schemas.
6. Move external/internal generation to the same structured JSON contract.
7. Render with app-owned canonical 40-page components.
8. Add DOM fingerprint and semantic validators.
9. Add page-specific visual snapshots and semantic tests.
10. Run real external-AI E2E twice.
11. Run persistence/PDF regression.
12. Deploy Preview and wait for owner approval.

## 12. Next-session copy command

```text
PR #20의 실제 사용자 Phase 6 QA 실패 교정을 진행해주세요.

작업 시작 전 다음 순서로 현재 상태를 확인하세요.
1. 현재 GitHub 브랜치와 최신 Commit
2. Draft PR #20과 Vercel Preview/CI 상태
3. AGENTS.md
4. handoff/PHASE6_REAL_WORLD_QA_HANDOFF_2026-07-08.md
5. handoff/PROJECT_HANDOFF.md, WORK_LOG.md, DECISION_LOG.md
6. docs/REPORT_TEMPLATE_SPEC.md, docs/PDF_EXPORT_E2E_STANDARD.md
7. 관련 코드와 테스트

핵심 원인은 AI가 완성 HTML의 text node를 직접 채우면서 승인 DOM과 의미 필드가 변형되는 구조입니다. 프롬프트 문구만 추가하거나 FIXED_TEXT_SELECTORS만 늘리는 방식으로 끝내지 마세요.

다음 원칙으로 교정하세요.
- 앱이 정확한 40페이지 DOM/CSS/고정 라벨/연결자/행·열 구조를 소유합니다.
- 외부 AI와 내부 API는 동일한 page-scoped structured JSON만 생성합니다.
- AI가 임의의 완성 HTML을 작성하는 경로는 주 경로에서 제거합니다.
- 기존 HTML 붙여넣기는 sanitizer + DOM fingerprint를 거치는 호환 경로로만 유지합니다.
- script/noscript/on* 속성/javascript URL은 제거하고 active content는 차단합니다.
- 저장되는 모든 frame은 1280×720, inner scale은 1로 canonicalize합니다.
- P5, P12–18, P19–28, P30–40의 고정 구조와 의미 필드를 handoff 문서대로 구현합니다.
- 특히 WANT/AVOID, Deep Dive 5개 소제목, 위협 1~3순위, Category Clichés 3열, Positioning 축명, Persona, Pain, AIPL, Loyalty, Creative History, Trajectory, Insight, Root Cause, STP, A/B/C/D, 최종 메시지를 잠급니다.
- 본문을 작은 글씨로 축소하지 말고 type floor를 적용합니다.

검증은 실제 앱에서 진행하세요.
- 사용자가 제공한 Script 포함 HTML의 paste → sanitize → Viewer
- canonical 1280×720/scale(1)
- 페이지별 DOM fingerprint와 의미 필드
- 실제 외부 AI 결과 2회
- 저장·재열기
- Export PDF 버튼, 연속 2회, Ctrl+P, Cmd+P
- 40페이지 960×540pt, embedded fonts, no full-page raster
- 전 페이지 실제 화면 검수

Preview-first로 새 작업 브랜치와 Draft PR에서 진행하고 main에는 병합하지 마세요. public/template.html과 보호 브랜치는 변경하지 마세요. 완료 후 변경 파일, Commit SHA, 테스트, Preview URL, 남은 위험, 사용자 승인 항목을 보고하세요.
```

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

