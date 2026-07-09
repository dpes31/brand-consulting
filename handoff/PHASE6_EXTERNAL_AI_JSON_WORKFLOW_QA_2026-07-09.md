# Phase 6 External-AI JSON Workflow QA Handoff — 2026-07-09

## 0. Executive decision

The external AI returning JSON is **not** the defect. It is the intended output of the current app-owned Renderer architecture.

The defect is the combination of:

1. the Phase 6 UI does not make the JSON → app → HTML sequence explicit enough for a non-developer;
2. the downloaded JSON-only prompt still contains HTML/DOM-oriented Creative History rendering instructions;
3. the real external-AI response followed those mixed instructions and produced values that violate the app schema;
4. the current user flow does not clearly tell the user to copy the returned JSON back into Phase 6 and let the application generate the HTML.

Do **not** change the durable architecture back to AI-authored standalone HTML. That would restore the exact failure already documented in PR #20: arbitrary DOM mutation, field shifting, script insertion, viewport-scale leakage, and broken page semantics.

The correct product flow remains:

`Step 0–5 research → external/internal AI returns ProductionReportV3 JSON → app validates JSON → app-owned 40-page Renderer creates HTML → Viewer / save / reopen / PDF`

## 1. Repository checkpoint

- Repository: `dpes31/brand-consulting`
- Production branch: `main`
- Production commit before this work: `96f12ac5bde92a53a97a12ea01ae9c3db921c7fe`
- Active branch: `fix/phase6-structured-report-renderer-v1`
- Draft PR: #21 `Replace Phase 6 HTML generation with app-owned structured renderer`
- Current validated head before this handoff update: `8a4601d7a4895e32a521112f467d75af40678b86`
- CI at that head:
  - `Phase 6 Color Correction Preview CI`: PASS
  - `Phase 6 PDF Runtime E2E`: PASS
- Vercel Preview: `https://brand-consulting-git-fix-phase6-structu-0fd4b6-dpes31s-projects.vercel.app/`
- Vercel state: Ready
- `main`: unchanged
- PR #20 remains the failed real-world QA record and must not be merged.
- PR #21 remains Draft and must not be merged without a new owner Preview approval.
- Protected `public/template.html` and backup branches remain untouched.

## 2. Owner artifacts inspected

The owner supplied:

- `phase6_structured_report_prompt_비즈넵.txt`
- `html 요청 후 결과.txt`
- the external AI's explanation of why it returned JSON instead of HTML

The downloaded prompt explicitly states:

- `The application, not you, owns the complete 40-page HTML/CSS renderer.`
- `Return JSON only. Never return HTML, CSS, JavaScript, Markdown, or code fences.`

Therefore the external AI was correct to return JSON.

However, the same prompt also includes a Creative History section that instructs the model to use:

- `.timeline-container`
- `.timeline-card`
- `data-year`
- `data-copy-status`

Those are DOM implementation details. They belong in the app Renderer specification, not in a JSON-only AI prompt.

## 3. Direct diagnosis of the real external-AI response

The response begins as a valid-looking ProductionReportV3 object:

```json
{
  "version": "3.0.0",
  "brand": "비즈넵",
  "pages": [ ... ]
}
```

This is the expected response category. It should be pasted back into Phase 6, not converted into HTML by the external model.

The response is nevertheless not guaranteed to pass the current validator.

### 3.1 Creative History status values violate the current enum

The current schema and renderer require each Creative History status value to be exactly one of:

- `verified-verbatim`
- `source-found-copy-unverified`
- `not-found`

The real external response instead contains values such as:

```json
"creative-history-target.year1.status": "2021 · not-found"
"creative-history-target.year2.status": "2022 · verified-verbatim"
```

This happened because the prompt simultaneously said:

- output JSON only;
- include the year in every card;
- apply `data-year` and `data-copy-status` to DOM cards;
- use the exact supplied field keys.

There is no separate editable `year` field in the page JSON because the years are fixed by the app-owned Renderer. The model therefore fused year and status into one string.

Current `validateStructuredReportV3()` rejects this as `invalid Creative History status`.

### 3.2 The prompt mixes content grammar with Renderer grammar

The external model should receive only content semantics:

- campaign
- copy status
- verified copy or evidence-gap wording
- model
- media/format
- appeal
- source label
- Message Trajectory
- Strategic So What

The app should own:

- six fixed year cards
- card order
- `.timeline-container`
- `.timeline-card`
- `data-year`
- `data-copy-status`
- visual status classes
- quotation rendering

Mixing both layers makes the output contract internally contradictory even though the top-level JSON instruction is clear.

### 3.3 The user workflow is not explicit enough

The app currently shows an alert saying the external AI returns JSON and the app owns the Renderer, but it does not give a complete operational sequence in the interface.

A non-developer can reasonably assume:

1. download the prompt;
2. upload it to an external AI;
3. receive the final report file.

The intended fourth and fifth steps are not prominent enough:

4. copy the complete JSON response;
5. paste it into Phase 6 and click the app render button.

This is a product UX defect, not a reason to return to AI-authored HTML.

## 4. The external AI's suggested HTML correction must not be adopted

The external AI suggested replacing the contract with:

`The assistant, not the application, must generate the complete standalone 40-page HTML/CSS report.`

That direction is forbidden for this project.

It would reintroduce:

- AI-controlled DOM hierarchy;
- arbitrary class and node changes;
- field content moving into labels or connectors;
- script insertion;
- scale leakage;
- page-specific layout corruption;
- divergence between external and internal AI paths;
- unreliable save/reopen/PDF behavior.

Do not ask for JSON and HTML together either. A dual deliverable increases response length, parsing ambiguity, and drift between the JSON and the HTML.

## 5. Required product corrections

### 5.1 Make the external-AI workflow explicit in Phase 6 UI

Replace ambiguous copy with a numbered workflow visible before and after prompt download:

1. `외부 AI용 구조화 JSON 프롬프트 다운로드`
2. `다운로드 파일을 외부 AI에 첨부`
3. `AI가 반환한 JSON 전체를 복사`
4. `아래 입력창에 JSON 붙여넣기`
5. `JSON 검증 후 40페이지 보고서 만들기`

Required UI changes:

- Rename `프롬프트 추출` to `외부 AI용 JSON 프롬프트 다운로드`.
- Rename the section to `외부 AI 구조화 JSON 방식`.
- Label the textarea `외부 AI가 반환한 JSON 붙여넣기`.
- Rename `결과물 뷰어에 렌더링하기` to `JSON 검증 후 40페이지 보고서 만들기`.
- Add a fixed notice: `HTML은 외부 AI가 아니라 앱이 자동 생성합니다.`
- Keep `기존 완성 HTML 가져오기` as a visually separated secondary compatibility option.
- Support pasting raw JSON, fenced JSON, and uploading `.json` or `.txt` response files.
- After successful JSON validation, open the Viewer and state that the app generated the HTML.

### 5.2 Remove DOM instructions from the AI-facing Creative History prompt

Replace `[CREATIVE HISTORY RENDERING CONTRACT]` with `[CREATIVE HISTORY DATA CONTRACT]`.

The AI-facing contract must not mention:

- `.timeline-container`
- `.timeline-card`
- `data-year`
- `data-copy-status`
- HTML classes or attributes

Required wording:

```text
- year1 always represents 2021, year2 represents 2022, ... year6 represents 2026 YTD.
- Do not include the year inside any status value.
- Each *.status value must be exactly one of:
  verified-verbatim | source-found-copy-unverified | not-found
- Do not output HTML attributes, class names, or rendering instructions.
- The application assigns fixed years, data-year, data-copy-status, card classes, and quotation styling.
```

### 5.3 Make Creative History schema machine-readable

`StructuredFieldDefinition` currently exposes only `kind: "status"`.

Add explicit enum metadata, for example:

```ts
type StructuredFieldDefinition = {
  key: string;
  page: number;
  pageId: string;
  hint: string;
  maxLength: number;
  kind: StructuredFieldKind;
  enum?: string[];
  fixedYear?: number;
};
```

For every `*.yearN.status` field:

```json
{
  "kind": "status",
  "enum": [
    "verified-verbatim",
    "source-found-copy-unverified",
    "not-found"
  ],
  "fixedYear": 2021
}
```

The year remains Renderer-owned. It is metadata, not model-authored content.

### 5.4 Add constrained recovery for the owner's current response

Do not silently accept arbitrary malformed statuses.

Before strict validation, allow only the following known compatibility normalization:

```text
2021 · not-found → not-found
2022 · verified-verbatim → verified-verbatim
2023 · source-found-copy-unverified → source-found-copy-unverified
2026 YTD · not-found → not-found
```

Rules:

- accept only a fixed expected year matching the field index;
- normalize only the exact three allowed statuses;
- record a non-blocking warning with page and field;
- run the complete strict validator after normalization;
- reject every other combined or unknown value.

This recovery path allows the owner to test the already-generated response without weakening the durable contract.

### 5.5 Improve validation errors for non-developers

Replace a long generic error list with grouped guidance:

```text
Creative History 입력 형식 8건을 수정해야 합니다.
P29 · 2021 상태: "2021 · not-found" → "not-found"
P29 · 2022 상태: "2022 · verified-verbatim" → "verified-verbatim"
...

연도는 앱이 자동 배치하므로 상태 값에는 넣지 마세요.
```

Add:

- page number;
- page title;
- field label in Korean;
- received value;
- expected value or enum;
- whether the app can repair it automatically.

## 6. Required QA fixtures and E2E

The repository is public. Do not commit the owner's complete research response unless explicitly approved.

Use one of these methods:

1. private/local fixture containing the exact owner artifact; or
2. redacted fixture retaining the same 40-page/key/status structure; plus
3. minimal committed regression fixtures for each contract violation.

Required tests:

### Gate A — workflow comprehension

- Phase 6 visibly states that external AI returns JSON.
- The UI visibly states that the app creates HTML.
- A first-time non-developer can complete the five-step workflow without asking the model for HTML.

### Gate B — current owner response

- Paste the supplied real external-AI JSON.
- Detect all `YYYY · status` values.
- Apply only the constrained compatibility normalization.
- Validate exact 40 pages and exact keys.
- Generate the app-owned 40-page HTML.
- Open Viewer successfully.

### Gate C — corrected real external-AI output

Run the corrected downloaded prompt against a real external AI at least twice:

- output starts with `{` and ends with `}`;
- no commentary or code fence;
- exactly 40 pages;
- exact field keys;
- Creative History status values are exact enums;
- no DOM classes, attributes, or HTML fragments;
- same core-three competitors across P12–18 and P30–33;
- Persona titles equal P21 target names;
- all maxLength constraints pass.

### Gate D — app-owned rendering

- JSON creates exactly 40 `.full-slide` pages.
- Appendix count is zero.
- Fixed page grammar and DOM fingerprints pass.
- 1280×720 and scale(1) remain canonical.
- zero script and active content.
- save → reload → reopen preserves the same JSON-derived HTML.

### Gate E — PDF regression

- visible Export PDF button;
- second consecutive export;
- Ctrl+P;
- Cmd+P;
- 40 pages;
- 960×540pt;
- embedded Pretendard;
- no full-page raster fallback;
- visual review of all 40 pages.

## 7. Documentation that must be updated with the implementation

The current branch code uses ProductionReportV3 JSON, but several documents still describe the superseded CONTENT SLOT / external complete-HTML architecture.

Update together:

- `AGENTS.md`
- `handoff/PROJECT_HANDOFF.md`
- `handoff/WORK_LOG.md`
- `handoff/DECISION_LOG.md`
- `docs/REPORT_TEMPLATE_SPEC.md`
- PR #21 body and validation comment

The code and PR #21 architecture take precedence until those documents are corrected.

## 8. Completion criteria

Do not declare PR #21 complete merely because JSON was returned.

PR #21 is ready for owner review only when:

1. the UI explains JSON → app → HTML without ambiguity;
2. Creative History prompt contains data instructions only;
3. status enum metadata is present in the schema;
4. the current owner JSON can be safely normalized or receives actionable field errors;
5. two corrected real external-AI responses pass;
6. Viewer/save/reopen/PDF regression passes;
7. all documentation reflects the same architecture;
8. a new Vercel Preview is Ready;
9. the owner completes the workflow on Preview.

## 9. Next-session copy command

```text
PR #21의 Phase 6 외부 AI JSON 사용자 흐름 교정을 이어서 진행해주세요.

작업 시작 전 다음 순서로 현재 상태를 확인하세요.
1. 현재 GitHub 브랜치와 최신 Commit
2. Draft PR #21과 Vercel Preview/CI 상태
3. AGENTS.md
4. handoff/PHASE6_REAL_WORLD_QA_HANDOFF_2026-07-08.md
5. handoff/PHASE6_EXTERNAL_AI_JSON_WORKFLOW_QA_2026-07-09.md
6. handoff/PROJECT_HANDOFF.md, WORK_LOG.md, DECISION_LOG.md
7. docs/REPORT_TEMPLATE_SPEC.md, docs/PDF_EXPORT_E2E_STANDARD.md
8. 관련 코드와 테스트

현재 외부 AI가 JSON을 반환한 것은 정상입니다. AI에게 완성 HTML을 다시 작성시키지 마세요. 제품 문제는 사용자가 JSON을 다시 앱에 붙여넣어야 한다는 흐름이 충분히 명확하지 않고, JSON-only 프롬프트의 Creative History 섹션에 .timeline-container, .timeline-card, data-year, data-copy-status 같은 DOM 지시가 섞여 있다는 점입니다.

다음 작업을 구현하세요.
- Phase 6 UI를 `JSON 프롬프트 다운로드 → 외부 AI 실행 → JSON 복사 → 앱에 붙여넣기 → 앱이 40페이지 HTML 생성`의 5단계로 명확히 표시합니다.
- `프롬프트 추출`을 `외부 AI용 JSON 프롬프트 다운로드`로 변경합니다.
- 입력창과 실행 버튼을 JSON 기준으로 명확히 이름 붙입니다.
- `HTML은 외부 AI가 아니라 앱이 자동 생성합니다`를 고정 안내합니다.
- buildCreativeHistoryCompilerDirective의 HTML/DOM 지시를 제거하고 Creative History DATA CONTRACT로 교체합니다.
- year1~year6은 앱이 고정한 2021~2026 YTD로 처리합니다.
- status는 verified-verbatim, source-found-copy-unverified, not-found 중 하나만 허용하고 schema에 enum을 포함합니다.
- 사용자가 제공한 실제 결과의 `2021 · not-found` 같은 값은 예상 연도와 enum이 정확히 맞는 경우에만 경고와 함께 정규화한 뒤 재검증합니다.
- 임의 상태나 다른 필드 오류는 페이지·필드·입력값·예상값을 한국어로 보여주고 차단합니다.
- 외부 AI 프롬프트에는 HTML 클래스, data-* 속성, Renderer 구현을 넣지 않습니다.
- 외부 AI와 내부 API는 동일한 ProductionReportV3 검증과 앱 Renderer를 사용합니다.

검증하세요.
- 사용자가 제공한 실제 JSON 또는 비공개/마스킹 등가 fixture
- 수정된 실제 외부 AI 응답 2회
- Creative History exact enum
- exact 40 pages / exact keys / maxLength / core-three / Persona consistency
- 1280×720 / scale(1) / DOM fingerprint / zero overflow
- save·reload·reopen
- Export PDF 연속 2회, Ctrl+P, Cmd+P
- 40페이지 960×540pt, embedded fonts, no full-page raster
- 전체 페이지 실제 화면 검수

Preview-first로 PR #21 브랜치에서 진행하고 main에는 병합하지 마세요. public/template.html과 보호 브랜치는 변경하지 마세요. 완료 후 변경 파일, Commit SHA, 테스트, Preview URL, 남은 위험, 사용자 승인 항목을 보고하세요.
```
