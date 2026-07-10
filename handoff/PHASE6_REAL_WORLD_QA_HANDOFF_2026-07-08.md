

## REAL_WORLD_QA_RESOLUTION_2026_07_10

이 문서에 기록된 Script 오류, scale(0.82), Persona/AIPL/STP/Positioning 필드 혼합, 고정 라벨 변형 문제는 PR #22의 승인 HTML 의미 필드 계약으로 교정됐다.

- Script와 active content는 제거 후 검증한다.
- scale은 1, frame은 1280×720으로 정규화한다.
- 외부 AI의 DOM은 최종 레이아웃으로 사용하지 않는다.
- 페이지별 의미 field content만 승인 DOM에 이식한다.
- JSON 사용자 흐름은 사용하지 않는다.

최종 실제 브랜드 검증은 PR #22 Preview에서 수행하며, 상세 절차는 `PHASE6_APPROVED_HTML_SEMANTIC_CONTRACT_2026-07-10.md`를 따른다.
