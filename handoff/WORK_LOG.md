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
- Verified before and after font readiness with zero ligature flash and zero Export PDF button movement.
- Production build and complete E2E passed.
- PR #16 merged with regular merge commit `e22de49396a1ccb3590c5d7eb751b4d0edf759fc`.

## 2026-07-07 — PR #17 Phase 6 PDF runtime routing correction

- Opened branch `fix/phase6-pdf-export-runtime-v1` and PR #17.
- Reproduced `PDF 생성 오류 — 출력할 슬라이드를 찾지 못했습니다.`
- Separated Legacy `.slide-wrapper > .slide` and FULL `.full-slide` runtime ownership.
- Routed the actual `Export PDF` button, Windows `Ctrl+P`, and macOS `Cmd+P` to browser-native FULL printing.
- Added actual-button, repeat-export, and native-PDF checks.
- PR #17 merged to `main` with regular merge commit `96f12ac5bde92a53a97a12ea01ae9c3db921c7fe`.

## 2026-07-07 to 2026-07-08 — PR #20 approved Main40 restoration and real-world failure

- Owner reviewed an actual generated HTML against the original approved reference and approved the recommended structural correction.
- Created branch `fix/phase6-approved-main40-no-appendix-v3` and Draft PR #20.
- Closed superseded PR #18 and PR #19; neither should be merged.
- Changed the final contract from 40 Main + 8 Appendix to exactly 40 Main and zero Appendix.
- Promoted Decision Receipt / Close to page 40.
- Restored Competitive Landscape, Category Clichés, and Creative Insight.
- Removed Creative Methodology and Appendix A1–A7.
- Changed competitor logic to Landscape candidates up to five and core-three downstream analysis.
- Restored fixed labels and page grammar for critical pages.
- Updated native PDF preflight and button routing from 48 to 40 pages.
- Automated browser/PDF E2E passed.
- A fresh owner Step 0–6 run then exposed semantic DOM corruption caused by the model rewriting complete HTML.
- Recorded the failure in `handoff/PHASE6_REAL_WORLD_QA_HANDOFF_2026-07-08.md`.
- PR #20 remains Draft and must not be merged.

## 2026-07-08 — PR #21 app-owned structured Renderer

- Created branch `fix/phase6-structured-report-renderer-v1` and Draft PR #21.
- Added ProductionReportV3 page-scoped JSON.
- Added exact 40-page app-owned DOM/CSS rendering.
- Added structured field definitions, exact key validation, maxLength checks, cross-page brand/competitor consistency, Creative History status checks, and DOM fingerprint checks.
- Routed external-AI prompt export and internal API generation to the same JSON contract.
- Retired AI-authored complete HTML as the primary path.
- Retained complete HTML paste only as a sanitized compatibility importer.
- Added canonical 1280×720 / scale(1) handling.
- Added real-app semantic E2E, sanitizer E2E, persistence, native PDF, repeat export, Ctrl+P, and Cmd+P checks.
- Validated implementation head `8a4601d7a4895e32a521112f467d75af40678b86`:
  - Production build/contracts PASS
  - Phase 6 PDF Runtime E2E PASS
  - Vercel Preview Ready
- PR #21 remains Draft and unmerged.

## 2026-07-09 — External-AI JSON workflow QA

- Owner downloaded `phase6_structured_report_prompt_비즈넵.txt` from Phase 6 and executed it with an external AI.
- External AI returned ProductionReportV3 JSON, not HTML.
- Confirmed JSON is the intended output under PR #21 architecture.
- Rejected the external AI's recommendation to restore AI-authored standalone HTML because it would recreate PR #20 defects.
- Found a real prompt conflict:
  - top-level contract requires JSON only;
  - Creative History section still includes `.timeline-container`, `.timeline-card`, `data-year`, and `data-copy-status` rendering instructions.
- Found the real response fused year and status, for example `2021 · not-found`, while the app requires the exact enum `not-found`.
- Identified the primary remaining product defect as user-flow ambiguity: the app must explicitly explain that the user copies JSON back into Phase 6 and the app generates HTML.
- Added `handoff/PHASE6_EXTERNAL_AI_JSON_WORKFLOW_QA_2026-07-09.md` with:
  - diagnosis;
  - forbidden rollback to AI HTML;
  - required UI wording;
  - Creative History data-contract correction;
  - enum/fixed-year schema requirements;
  - constrained normalization for the owner's current response;
  - actionable validation errors;
  - real external-AI E2E gates;
  - next-session command.
- Updated `AGENTS.md` and `handoff/PROJECT_HANDOFF.md` to point to the new continuation document.
- No product code was changed in this documentation pass.
- `main` remains unchanged.

<!-- PHASE6_EXTERNAL_JSON_COMPLETION_2026-07-09 -->
## 2026-07-09 — Phase 6 external-AI JSON workflow implementation and QA

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

