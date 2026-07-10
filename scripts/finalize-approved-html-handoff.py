from pathlib import Path


def append_once(path: str, marker: str, section: str) -> None:
    file = Path(path)
    text = file.read_text(encoding='utf-8')
    if marker in text:
        return
    file.write_text(text.rstrip() + '\n\n' + section.strip() + '\n', encoding='utf-8')


def prepend_once(path: str, marker: str, section: str) -> None:
    file = Path(path)
    text = file.read_text(encoding='utf-8')
    if marker in text:
        return
    file.write_text(section.strip() + '\n\n' + text, encoding='utf-8')


append_once(
    'handoff/PROJECT_HANDOFF.md',
    'PHASE6_APPROVED_HTML_CURRENT_2026_07_10',
    '''## PHASE6_APPROVED_HTML_CURRENT_2026_07_10 — 최신 우선 기준

- 최신 작업 브랜치: `fix/phase6-approved-html-semantic-contract-v1`
- Draft PR: `#22 Restore Phase 6 approved 40+8 HTML with semantic field locking`
- PR #21의 JSON 사용자 흐름은 폐기·대체됐으며 병합하지 않는다.
- Phase 6 최종 사용자 산출물은 JSON이 아니라 승인 샘플 기반의 완성 HTML이다.
- 기준 화면은 `/?pilot=full-integrated&brand=<exact brand>`이며 40 Main + 8 Appendix다.
- 외부 AI HTML은 Sanitizer와 의미 필드 검증을 통과한 내용만 승인 DOM에 이식한다.
- 현재 자동 검증: build, semantic HTML E2E, 48-page Viewer, save/reopen, PDF 48p 모두 PASS.
- 상세 계약과 남은 사용자 승인 Gate는 `handoff/PHASE6_APPROVED_HTML_SEMANTIC_CONTRACT_2026-07-10.md`를 따른다.''',
)

append_once(
    'handoff/WORK_LOG.md',
    'WORKLOG_PHASE6_APPROVED_HTML_2026_07_10',
    '''## WORKLOG_PHASE6_APPROVED_HTML_2026_07_10

### 완료 작업

- `main`에서 `fix/phase6-approved-html-semantic-contract-v1` 생성.
- Draft PR #22 생성; PR #21 JSON 방향은 미병합 상태로 보존.
- 승인 샘플 40 Main + 8 Appendix 페이지 계획 복원.
- DOM 순번 슬롯을 페이지별 의미 필드 계약으로 교체.
- 외부 AI DOM을 직접 사용하지 않고 승인 DOM에 검증된 field content만 이식.
- Script, inline event, iframe/object/embed/form, 위험 URL 제거.
- P5, P12–18, P19–28, P30–40, A8 구조 및 교차 논리 검증 추가.
- Deep Dive Evidence의 리스트형·요약형 두 승인 DOM 변형 지원.
- 텍스트 길이 제한과 핵심 페이지 가독성 CSS 보정.
- JSON 입력 차단, `.html/.txt` 업로드, 5단계 HTML UX 구현.
- exact exported Semantic Template을 sessionStorage에 고정해 재캡처 비결정성 제거.

### 검증

- `npm run build`: PASS
- Approved HTML semantic E2E: PASS
- 48 pages / Main 40 / Appendix 8 / navigation 48 / overflow 0
- active content 0 / scale(1) / 1280×720
- save → reload → reopen: PASS
- PDF 48p / 960×540pt / embedded Pretendard / raster fallback 0
- 주요 20개 페이지 원본 캡처와 48페이지 Contact Sheet 시각 검수 완료.''',
)

append_once(
    'handoff/DECISION_LOG.md',
    'DECISION_PHASE6_APPROVED_HTML_2026_07_10',
    '''## DECISION_PHASE6_APPROVED_HTML_2026_07_10

### 결정

Phase 6의 사용자-facing 최종 출력과 입력은 완성 HTML로 유지한다. JSON 붙여넣기 방식은 사용하지 않는다.

### 이유

- 사용자가 승인한 기준은 `main`의 40+8 `full-integrated` HTML 샘플이다.
- 기존 실패 원인은 HTML 자체가 아니라 비의미적 DOM 슬롯, AI DOM 신뢰, Sanitizer 부재, scale 누출, 교차 검증 부재였다.
- 의미 필드와 승인 DOM 재조립을 사용하면 HTML 흐름을 유지하면서 레이아웃과 내용 혼합을 동시에 차단할 수 있다.

### 고정 후속 원칙

- PR #21은 Do Not Merge.
- PR #22가 유일한 현재 교정 PR.
- 외부 AI는 완성 HTML을 반환하되 DOM 구조를 결정하지 못한다.
- 앱은 field content만 추출해 승인 DOM에 적용한다.
- 사용자 실제 외부 AI 2회 Preview 검증 후에만 main 병합을 검토한다.''',
)

append_once(
    'docs/REPORT_TEMPLATE_SPEC.md',
    'REPORT_TEMPLATE_APPROVED_HTML_V1_2026_07_10',
    '''## REPORT_TEMPLATE_APPROVED_HTML_V1_2026_07_10 — 최신 Phase 6 계약

이 절은 이전 JSON/40-page-only 또는 five-competitor 변형 설명보다 우선한다.

### Canonical source

- Route: `/?pilot=full-integrated&brand=<exact brand>`
- 40 Main + 8 Appendix, 총 48페이지
- 1280×720, exact 16:9, Pretendard, title weight 900

### Compiler ownership

- 외부 AI 출력: complete HTML
- AI 편집 가능 영역: `data-report-field`가 부여된 의미 콘텐츠
- 앱 소유 영역: DOM, CSS, page IDs/order, navigation, labels, arrows, rows/columns, geometry, print rules
- 최종 조립: AI HTML의 field content → approved sample DOM

### Readability

- body copy를 축소해 overflow를 해결하지 않는다.
- `data-report-max-length`를 넘으면 렌더링을 차단하고 문장을 요약한다.
- P12 ranking, P13–15 Deep Dive, P17 Clichés, Persona, Pain, AIPL, Creative History, Root Cause, STP, Final Choice의 승인 도식과 텍스트 위계를 유지한다.

### Page consistency

- P12가 선택한 핵심 경쟁사 3개는 P13–16, P18, P31–34에서 동일 순서다.
- P21 세그먼트와 P22–24 Persona 제목은 일치한다.
- P26의 네 열과 P27의 다섯 단계는 독립 의미 필드다.
- P37 → P38 → P39 → P40 → A8은 하나의 전략 논리다.''',
)

append_once(
    'docs/PDF_EXPORT_E2E_STANDARD.md',
    'PDF_E2E_APPROVED_HTML_48_2026_07_10',
    '''## PDF_E2E_APPROVED_HTML_48_2026_07_10

최신 Phase 6 PDF Gate:

- source document: approved complete HTML workflow
- exactly 48 `.full-slide`
- Main 40, Appendix 8
- navigation 48
- 1280×720 screen DOM, saved inner scale 1
- exported PDF: exactly 48 pages, 960×540pt
- Pretendard embedded
- zero full-page raster fallback
- zero active script / inline handler
- zero overflow
- Export PDF twice
- Windows Ctrl+P route
- macOS Cmd+P route
- save → reload → reopen → PDF repeat
- PDF Contact Sheet and critical-page screenshot review required before merge''',
)

append_once(
    'handoff/PHASE6_REAL_WORLD_QA_HANDOFF_2026-07-08.md',
    'REAL_WORLD_QA_RESOLUTION_2026_07_10',
    '''## REAL_WORLD_QA_RESOLUTION_2026_07_10

이 문서에 기록된 Script 오류, scale(0.82), Persona/AIPL/STP/Positioning 필드 혼합, 고정 라벨 변형 문제는 PR #22의 승인 HTML 의미 필드 계약으로 교정됐다.

- Script와 active content는 제거 후 검증한다.
- scale은 1, frame은 1280×720으로 정규화한다.
- 외부 AI의 DOM은 최종 레이아웃으로 사용하지 않는다.
- 페이지별 의미 field content만 승인 DOM에 이식한다.
- JSON 사용자 흐름은 사용하지 않는다.

최종 실제 브랜드 검증은 PR #22 Preview에서 수행하며, 상세 절차는 `PHASE6_APPROVED_HTML_SEMANTIC_CONTRACT_2026-07-10.md`를 따른다.''',
)

prepend_once(
    'handoff/PHASE6_EXTERNAL_AI_JSON_WORKFLOW_QA_2026-07-09.md',
    'JSON_WORKFLOW_SUPERSEDED_2026_07_10',
    '''> **JSON_WORKFLOW_SUPERSEDED_2026_07_10**
>
> 이 문서는 PR #21의 폐기된 JSON 사용자 흐름을 기록한 감사 자료다. 현재 제품 기준으로 사용하지 않는다.
> 최신 Phase 6는 PR #22의 승인 40+8 완성 HTML + 의미 필드 잠금 방식이다.
> `handoff/PHASE6_APPROVED_HTML_SEMANTIC_CONTRACT_2026-07-10.md`를 최신 우선 기준으로 사용한다.''',
)
