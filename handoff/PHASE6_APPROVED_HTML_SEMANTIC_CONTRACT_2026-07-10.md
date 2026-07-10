# Phase 6 승인 HTML 의미 필드 계약 — 2026-07-10

## 1. 결론

Phase 6의 사용자 최종 출력은 JSON이 아니라 **승인 샘플 기반의 완성 HTML**이다.

최신 고정 흐름:

`Step 0~5 조사`
→ `완성 HTML 프롬프트 다운로드`
→ `외부 AI가 40 Main + 8 Appendix 완성 HTML 반환`
→ `Phase 6에 HTML 붙여넣기 또는 .html/.txt 업로드`
→ `Script·활성 콘텐츠 제거`
→ `페이지별 의미 필드 및 교차 논리 검증`
→ `승인 샘플 DOM에 검증된 내용만 이식`
→ `Viewer / 저장 / 재열기 / PDF`

PR #21의 JSON 사용자 흐름은 이 결정으로 대체됐다. PR #21은 병합하지 않는다.

## 2. 현재 Git 상태

- Repository: `dpes31/brand-consulting`
- Base: `main`
- Working branch: `fix/phase6-approved-html-semantic-contract-v1`
- Draft PR: `#22 Restore Phase 6 approved 40+8 HTML with semantic field locking`
- 검증 Head: `6bbe7406a98e62774dfa591f28c5e03e1b5d155b`
- `main`: 미변경
- PR #22: Draft 유지, 사용자 승인 전 Ready/merge 금지

## 3. 승인 기준

Canonical reference:

`/?pilot=full-integrated&brand=<사용자 입력 브랜드명>`

고정 조건:

- Main Deck: 40페이지
- Appendix: 8페이지
- 총 48페이지
- 1280×720, exact 16:9
- 저장 HTML의 inner scale: `1`
- Pretendard
- 주요 제목 weight 900
- 사용자 입력 브랜드명 그대로 유지
- 자동 번역·로마자 변환 금지
- raw URL 노출 금지
- 검증되지 않은 숫자·광고 카피·날짜·모델·출처 생성 금지
- 작은 글씨로 정보량을 해결하지 않음

## 4. 문제의 실제 원인

기존 실패는 HTML 출력 자체가 원인이 아니었다.

1. 승인 샘플과 Phase 6 프롬프트가 서로 다른 템플릿을 사용했다.
2. 일반 DOM 순서 기반 슬롯이 의미를 설명하지 못해 Persona·AIPL·STP·Pain/Unmet Need 등이 뒤섞였다.
3. AI가 반환한 DOM 전체를 최종 결과로 신뢰해 클래스·라벨·행·열·연결선이 변형됐다.
4. 화면 축소값 `scale(0.82)`와 `1049.6×590.4`가 저장 HTML에 누출됐다.
5. AI가 삽입한 Script를 앱이 정화하지 않고 즉시 차단했다.
6. 문장 길이를 통제하지 않아 작은 글씨와 줄글 중심 결과가 발생했다.
7. 페이지 간 동일 경쟁사·타깃·전략 논리를 교차 검증하지 않았다.

## 5. 구현된 해결 구조

### 5.1 의미 필드

일반 순번 슬롯 대신 다음 metadata를 사용한다.

- `data-report-field`
- `data-report-hint`
- `data-report-max-length`
- `data-report-kind`

외부 AI는 각 `[[FIELD:...]]`에 현재 조사 내용만 채운다.

### 5.2 승인 DOM 재조립

외부 AI의 최종 DOM을 그대로 쓰지 않는다.

1. 다운로드 프롬프트에 사용한 정확한 Semantic Template을 세션에 캐시한다.
2. 외부 AI HTML에서 같은 field key의 내용만 추출한다.
3. 필드 누락·중복·페이지 이동·길이 초과를 차단한다.
4. 허용된 inline 표현만 보존한다.
5. 승인 Template의 원래 DOM·CSS·라벨·도식에 내용만 이식한다.

### 5.3 Sanitizer

다음을 제거한다.

- `script`
- `noscript`
- `base`
- `iframe`
- `object`
- `embed`
- `form`
- 모든 inline `on*` handler
- `javascript:` URL
- `data:text/html` URL

### 5.4 Geometry

- `.full-frame`: 1280×720
- `.full-frame-inner`: 1280×720, `scale(1)`
- PDF: 960×540pt

## 6. 페이지별 구조 계약

### P5 Category & Target

- Category 도식 유지
- `PRIMARY TARGET`
- `WANT`
- `AVOID`
- WANT와 AVOID 내용은 독립 필드

### P12 Threat Ranking

- 핵심 경쟁사 3개
- 하단 3개 해석 카드는 동일 너비
- P13~16, P18, P31~34와 같은 순서 사용

### P13~15 Deep Dive

고정 흐름:

`Evidence → Core Desire → Appeal → Threat Mechanism → Attack Point`

- `위협 1순위 / 2순위 / 3순위`
- Evidence는 승인 샘플의 두 변형을 모두 지원:
  - 근거 3개 리스트
  - 근거 1개 요약 문단
- 이후 4개 의미 필드는 절대 한 칸씩 밀리지 않음

### P17 Category Clichés

정확히 3열:

- 반복 화법
- 현재 역할
- 구조적 한계

폐기된 `새 질문` 4열 복원 금지.

### P18 Positioning

- 좌·우·상·하 4개 의미 축
- `X축`, `Y축`, `X axis`, `Y axis` 금지
- 축 필드에 브랜드명 금지
- 조사 브랜드 + 핵심 경쟁사 3개 일치

### P19~28 Consumer

- P19 질문 변화와 JTBD 3층 분리
- P20 Trend / Evidence / Change / So What 분리
- P21 타깃 스펙트럼과 Persona 제목 연동
- P22~24 Situation / 핵심 Job / Fear / Identity / Brand Role 분리
- P26 Pain / 현재 문제 / Unmet Need / 우선순위를 같은 행에서 검증
- P27 A → I → P1 → P2 → L 고정
- P28 구매 후 관계 5단계 유지

### P29~34 Creative

- P29 사실성 방법론 유지
- P30~33 각 브랜드 2021~2025 + 2026 YTD
- 상태:
  - `verified-verbatim`
  - `source-found-copy-unverified`
  - `not-found`
- `verified-verbatim`만 따옴표 허용
- P34 조사 브랜드 + 동일 핵심 경쟁사 3개 순서 유지

### P35~40 Strategy

- P35 Creative Gap
- P36 SWOT
- P37 Evidence → GAP → Root Cause → Strategic Opportunity
- P38 Segmentation → Targeting → Positioning
- P39 A/B/C/D 전략 비교
- P40 Big IdeaL + Winning Move + Proof

### A8 Brand Principle

- P37 → P38 → P39 → P40의 최종 압축 문장
- 새로운 논리나 무관한 슬로건 추가 금지
- 폐기 문구 `찾고, 설명하고, 지킨다` 복원 금지

## 7. 가독성 원칙

- 핵심 페이지 본문 크기 상향
- P12 3개 카드 균등 배치
- P13~15 소제목을 시각적 타이틀로 유지
- P17 3열 폭 확대
- Persona·Pain·AIPL·History·Strategy 본문 line-height 보정
- 긴 문장을 허용하지 않고 field maxLength에서 차단
- 텍스트 축소나 추가 CSS로 밀도를 숨기지 않음

## 8. 검증 결과

검증 Head `6bbe7406a98e62774dfa591f28c5e03e1b5d155b` 기준:

- `npm run build`: PASS
- FULL report contract: PASS
- FULL report runtime: PASS
- Material Symbols first paint: PASS
- PDF routing: PASS
- Approved HTML semantic E2E: PASS
- JSON 입력 차단: PASS
- `X축` Positioning 오류 차단: PASS
- Script / inline handler 제거: PASS
- `scale(0.82)` → `scale(1)` 복구: PASS
- 48페이지 / Main 40 / Appendix 8: PASS
- navigation 48: PASS
- overflow 0: PASS
- save → reload → reopen 48페이지: PASS
- Export PDF 2회: PASS
- Ctrl+P / Cmd+P routing: PASS
- PDF 48페이지 / 960×540pt: PASS
- Pretendard embedded: PASS
- full-page raster fallback 0: PASS

## 9. 시각 검수

48페이지 PDF를 4개 Contact Sheet로 검수했다.

추가 원본 캡처 검수:

- P5 Category & Target
- P12 Threat Ranking
- P13 Deep Dive
- P17 Category Clichés
- P18 Positioning
- P19 Consumer Executive
- P20 Trends
- P21 Core Target
- P22 Persona
- P26 Pain & Unmet Needs
- P27 AIPL
- P28 Loyalty
- P30 Creative History
- P34 Message Trajectory
- P35 Creative Insight
- P37 Root Cause
- P38 STP
- P39 Strategic Routes
- P40 Final Choice
- A8 Brand Principle

확인 결과:

- 구조 붕괴 없음
- 페이지 잘림 없음
- 의미 필드 혼합 없음
- 핵심 도식 위계 유지
- 주요 본문 가독성 개선

Synthetic fixture 문구는 구조 검증용 범용 내용이며, 실제 외부 AI 응답의 전략 품질을 의미하지 않는다.

## 10. 남은 사용자 승인 Gate

1. Preview에서 실제 신규 브랜드로 Step 0~5 진행
2. 다운로드 프롬프트를 실제 외부 AI에 첨부
3. 실제 완성 HTML 응답 최소 2회 입력
4. 48페이지 내용 품질과 페이지별 배치 검수
5. 저장·재열기 확인
6. 실제 Windows Ctrl+P / macOS Cmd+P 확인
7. 실제 PDF 시각 검수
8. 사용자 승인 후에만 PR #22 Ready 및 `main` 병합
