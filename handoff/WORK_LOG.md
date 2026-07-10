# Work Log

## 2026-06-22 — Production freeze and reversible workflow

- Established preview-first development.
- Created and preserved `backup-production-stable-20260622`.
- Confirmed no direct destructive work on production.

## Phase 1 — Layout and PDF safety

- Added iframe pre-repair and layout-safety guards.
- Stabilized exact 16:9 report and PDF handling.
- Added report viewer UX and export support.
- Recorded remaining repeat-export/navigation regression risks.

## Phase 2 — Competitor Registry

- Added threat-ranked direct-competitor selection.
- Locked 2–5 selected competitors.
- Added Registry parsing and validation.
- Excluded indirect competitors from core Deep Dive generation.

## Phase 3 — Dynamic page planning

- Preserved 23 mandatory base wrappers.
- Added dynamic selected-competitor Deep Dive and Creative History pages.
- Defined 23–40 Main Deck range and Appendix overflow behavior.
- Added navigation/page-manifest support.

## Phase 4 — Creative History factuality

- Added six-year history contract for the target brand and each selected competitor.
- Added status distinctions for verified verbatim, source found but copy unverified, and public source not found.
- Prohibited invented copy and quotation marks around unverified copy.

## Phase 5 audit

- Built `feature-visualization-engine-v1` / PR #6.
- Audit determined the heuristic renderer was not reliable enough for production.
- Branch and PR retained as failed evidence; implementation excluded from final integration.

## Gate 1.5 — Visual Recipe specification

- Added `design/DESIGN.md`.
- Added Visual Intent JSON Schema.
- Added recipe-selection matrix and feature-flag contract.
- Added schemas for `milestone-timeline`, `competitor-threat-system`, and `feature-matrix`.

## Gate 2A — Prompt-contract tests

- Added Visual Intent appendices for Steps 0, 2, 3, and 5.
- Added parsing, allowlists, Metric validation, Registry coverage checks, duplicate-response checks, and Step 3/5 copy guards.
- Owner repeated each accepted Step three times.
- Final results:
  - Step 0: PASS, 100% `milestone-timeline` agreement.
  - Step 2: PASS, complete Metric metadata and 100% required-role agreement.
  - Step 3: PASS, 100% `friction-flow` agreement.
  - Step 5: PASS, 100% `choice-architecture` agreement.

## 2026-06-29 to 2026-06-30 — FULL report reference

- Created `feature-main-full-report-integration-v1` and Draft PR #11 from production `main`.
- Added a 40-page Main Deck and 8-page Appendix reference report.
- Added Pretendard typography, high-density report rules, keep-all Korean wrapping, semantic highlighting, exact brand-name binding, and 1280×720 canvases.
- Added/refined Growth Story, Core Inflection, Positioning, Consumer, Persona, Creative History, SWOT, Root Cause, STP, Strategy Choice, and Appendix layouts.
- Added `scripts/report-visual-qa.mjs` as a geometry/overflow inspection utility.
- User completed iterative Preview review and ended the template test cycle.

## 2026-07-01 — Production consolidation

- Created immutable backup branch:
  - `backup/main-before-full-report-v1-2026-07-01`
  - source commit: `3e57eb8ca1d309fa3d4a39ef62ae84b4f2ad7139`
- Audited PRs and test branches.
- Selected `feature-visual-recipe-pilot-v1` as the valid cumulative Phase 1–4 + Gate 2A source.
- Excluded the failed visualization engine and superseded PRs #8–#10.
- Opened PR #12 from `feature-visual-recipe-pilot-v1` into `feature-main-full-report-integration-v1`.
- Merged PR #12 with a regular merge, preserving both branch histories.
- Integration merge commit: `e607e397819b061c4676e3a2bdfb210f9d1b349b`.
- Updated `AGENTS.md` and created consolidated handoff documents.

## 2026-07-06 — Phase 6 approved renderer correction

- Continued on `fix-phase6-approved-full-renderer-v2` with PR #14.
- Confirmed approved Pilot design worked in normal Phase 6 but found completed Biznup report HTML embedded as immutable Base HTML.
- Replaced visible Pilot content with more than 1,400 neutral `CONTENT SLOT` tokens before prompt export.
- Generalized competitor-dependent IDs and CSS selectors.
- Added the same content contract to manual external-AI and internal API paths.
- Added blocking validation for unresolved slots, missing brand name, missing Step 0 KPI evidence, and missing top Step 2 direct competitors.
- Reworked E2E so copying the neutral template fails and only research-filled HTML succeeds.
- Verified with non-Biznup brand `모노랩`:
  - KPI values `123만 명`, `456억 원`
  - competitors `알파원`, `베타랩`, `감마코`
  - 48 slides and 48 navigation links
  - 1280×720 geometry
  - zero overflow
  - Persona, Creative History, SWOT, and STP layouts
  - save/reopen
  - two consecutive 48-page PDF exports
- Functional validation head: `4957c168a51549cbe69c33db5be7c687f7467afd`.
- Final PR head after documentation: `22862482059266c1b385a44794575a40ec7327ec`.
- PR #14 merged to `main` with regular merge commit `7614e18bf007ad64c398ff3cfc2eb665f3ca341b`.
- Owner confirmed the Phase 6 flow works in actual use.

## 2026-07-06 to 2026-07-07 — PR #16 report correction

- Opened PR #16 on `fix/phase6-report-color-consistency-v1`.
- Corrected Page 3 FOUNDING JTBD source-note overlap.
- Restored dark-paper tokens for target and competitor Creative History pages.
- Added local native-print PDF implementation and inspection checks.
- User reviewed an actual Phase 6-generated Biznup HTML and requested four additional corrections:
  1. Restore Final Choice to the approved left-criteria/right-final-choice layout.
  2. Support up to five selected direct competitors consistently through Threat Ranking, Deep Dive, Product Matrix, Positioning, Creative History, and Message Trajectory.
  3. Add an Appendix divider while retaining exact 40 Main + 8 Appendix.
  4. Keep Persona indices `02` and `03` on one line.
- Added `installPhase6PagePlanV2` to transform the approved Pilot before Phase 6 capture.
- Reallocated the fixed 48 pages so competitors 4–5 remain in Main Deck sections rather than Appendix overflow.
- Added Deep Dive 4–5, Creative History 4–5, five-row ranking capacity, target-plus-five matrix capacity, positioning dots, and trajectory rows.
- Added A1 Appendix divider and consolidated Evidence Gaps + Source Labels at A7.
- Updated Page Plan, Prompt contract, research-slot mapping, production report contract, runtime contract, and repository documentation.
- Added `scripts/e2e-phase6-five-competitor-native-print.mjs` with a five-competitor non-Biznup fixture.
- E2E found a legacy `grid-column: 1 / -1` rule that made Final Choice span both columns; corrected it with `grid-column: auto !important`.

## 2026-07-07 — Reload icon-font stabilization and production approval

- Diagnosed the reload defect as a Material Symbols FOUC: ligature source strings such as `insights`, `search`, and `picture_as_pdf` were painted before the icon font loaded.
- Added `installMaterialSymbolsReady` before React render.
- Added fixed 1em icon boxes and hidden ligature text until verified font readiness.
- Added Google Fonts preconnect and changed Material Symbols loading to `display=block`.
- Added `test-material-symbols-stability.mjs` to the production build.
- Added `e2e-material-symbols-first-paint.mjs` with an intentionally delayed Material Symbols font request.
- Verified before font readiness:
  - zero visible ligature words;
  - ten sampled icon boxes fixed at 24×24;
  - Export PDF button at x 1491, y 9.5, width 157, height 44.
- Verified after font readiness:
  - Material Symbols font applied;
  - identical icon dimensions;
  - identical Export PDF button position and dimensions.
- Production build and the complete five-competitor E2E passed.
- Vercel Preview deployment passed.
- Owner approved applying PR #16 to production after this correction.
- PR #16 merged with regular merge commit `e22de49396a1ccb3590c5d7eb751b4d0edf759fc`.

## 2026-07-07 — PR #17 Phase 6 PDF runtime routing correction

- Opened branch `fix/phase6-pdf-export-runtime-v1` and Draft PR #17.
- Reproduced the actual user-facing error `PDF 생성 오류 — 출력할 슬라이드를 찾지 못했습니다.`
- Confirmed the root cause:
  - legacy layout runtime installed first;
  - legacy runtime replaced `iframe.contentWindow.print()` with a raster exporter that searches only `.slide-wrapper > .slide`;
  - FULL report runtime then captured that legacy function as if it were browser-native print;
  - Phase 6 FULL reports contain `.full-slide`, so the legacy selector returned zero slides.
- Corrected runtime ownership:
  - FULL runtime now installs before the legacy layout/PDF guard;
  - FULL documents mark the legacy guard as handled;
  - real native print is retained from `window.print` or the legacy native backup;
  - all host `Export PDF` buttons resolve the active FULL iframe or a stable offscreen FULL frame.
- Replaced the zero-slide fallback with a clear no-report message when no FULL report exists.
- Added build contract `scripts/test-phase6-pdf-runtime-routing.mjs`.
- Added browser E2E `scripts/e2e-phase6-pdf-button-routing.mjs` that clicks the actual app button twice.
- Verification passed:
  - production build and all report contracts;
  - actual Export PDF button routing;
  - two consecutive native-print calls;
  - 48-page preflight;
  - complete five-competitor Phase 6 regression;
  - native PDF: 48 pages, 960×540pt, embedded fonts, zero full-page raster rows;
  - save/reopen: 48 pages.
- Vercel Preview deployment reached Ready.
- PR remains Draft and unmerged pending owner Preview approval.

## WORKLOG_PHASE6_APPROVED_HTML_2026_07_10

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
- 주요 20개 페이지 원본 캡처와 48페이지 Contact Sheet 시각 검수 완료.
