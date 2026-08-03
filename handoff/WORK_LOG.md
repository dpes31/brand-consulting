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

## 2026-07-07 — PR #20 approved Main40 restoration

- Owner reviewed an actual generated HTML against the original approved reference and approved the recommended structural correction.
- Created active branch `fix/phase6-approved-main40-no-appendix-v3` and Draft PR #20.
- Closed superseded PR #18 and PR #19; neither should be merged.
- Changed the final contract from 40 Main + 8 Appendix to exactly 40 Main and zero Appendix.
- Promoted Decision Receipt / Close to page 40.
- Restored Competitive Landscape, Category Clichés, and Creative Insight.
- Removed Creative Methodology and Appendix A1–A7.
- Changed competitor logic:
  - Landscape reviews up to five candidates;
  - Threat Ranking selects the core three;
  - Deep Dive, Matrix, Positioning, Creative History, and Trajectory use the same core three.
- Restored fixed labels and page grammar for pages 2, 4, 5, 9, 10, Persona, Pain Points, AIPL, Creative History, STP, Four Directions, Final Choice, and Decision Close.
- Added decisive Korean consulting-tone rules.
- Corrected manual render validation so the original React click owns Viewer opening and save state.
- Replaced raw-regex page counting with DOM-based exact `.full-slide` counting.
- Preserved the exact user-entered brand in report navigation and toolbar.
- Locked connector glyphs, including Creative Insight comparison arrows, so prose cannot enter them.
- Updated native PDF preflight and button routing from 48 to 40 pages.
- Validated head `7d94b1895c47e9db7268c9d181060e0a735c1d9b` with non-Biznup brand `모노랩`:
  - five Landscape candidates and the same top-three downstream set;
  - 40 pages and 40 navigation links;
  - zero Appendix pages;
  - exact 1280×720 logical geometry;
  - zero overflow;
  - Page 9 text 12px vs page number 12px;
  - Persona 02/03 nowrap;
  - no decorative History NOW elements;
  - actual Export PDF, second consecutive export, Ctrl+P, and Cmd+P;
  - native PDF 40 pages, 960×540pt;
  - six embedded Pretendard font objects;
  - zero full-page raster rows;
  - save/reload/reopen at 40 pages;
  - Material Symbols cold-load regression.
- Production build/contracts and Phase 6 browser/PDF E2E both passed.
- PR #20 remained Draft and was later superseded by the complete-HTML semantic correction.

## 2026-07-20 to 2026-08-03 — HTML/JSON architecture audit

- Audited PR #4 through PR #23 and the owner’s downloaded Phase 6 prompts and generated HTML files.
- Confirmed that JSON had been introduced, corrected back to complete HTML, and later reintroduced.
- Identified PR #21 as the explicit JSON-only architecture shift and PR #23 as a 40-page JSON-only recurrence hidden behind generic UI labels.
- Confirmed the owner had already locked the desired flow as complete standalone HTML.
- Identified the content-mixing root cause as tag-order `CONTENT SLOT` mapping rather than missing research.
- Retained PR #21–#23 as failure audit records and prohibited merging them.

## 2026-08-03 — PR #24 Phase 6 complete HTML semantic correction

- Created `fix/phase6-main40-final-html-semantic-v5` and Draft PR #24 from the approved Main40 work line.
- Restored the owner-approved external workflow:
  - Step 0–5 research
  - complete HTML prompt download
  - external AI complete 40-page HTML
  - Phase 6 import
  - validation and approved-DOM reassembly
  - Viewer / save / reopen / PDF
- Removed JSON-only instructions from the external prompt.
- Moved Step 0–5 research before the large HTML template.
- Replaced tag-order content mapping with stable semantic field keys.
- Added exact field-set and approved-DOM fingerprint validation.
- Added sanitization for scripts, event handlers, JavaScript URLs, refresh redirects, forms, embeds, and autoplay media.
- Added cross-page validation for:
  - P11 candidate set
  - P12 core-three ranking
  - P13–18 and P30–33 competitor continuity
  - exact user brand
  - Persona/JTBD/AIPL/STP/route/Final Choice meaning boundaries
- The owner supplied a real Biznup prompt, generated 40-page HTML, and screenshot showing P18 validation failure.
- Full audit of that result found:
  - P18 AS-IS/TO-BE descriptions lacked the exact brand/state prefixes;
  - 44 literal `[[...]]` highlight strings remained;
  - P18 axes changed while map dots stayed at sample coordinates;
  - Creative History used humanized status labels;
  - `추가 후보 없음` appeared as a visible candidate row.
- Corrected the prompt and compiler:
  - rich fields use `<mark>` and `<br>` only;
  - final literal `[[...]]` is blocked;
  - P18 target labels normalize to exact brand AS-IS/TO-BE labels;
  - ten semantic coordinate values drive the three competitors and target AS-IS/TO-BE;
  - axis poles, coordinate ranges, and movement are validated;
  - common humanized status labels normalize to canonical status codes;
  - explicit unused candidate rows are hidden.
- Strengthened `scripts/e2e-phase6-five-competitor-native-print.mjs` to reproduce the owner-reported defects rather than checking stale prompt copy.
- E2E fixture deliberately included:
  - an unsafe script;
  - `<mark>` rich text;
  - humanized `COPY UNVERIFIED` status values;
  - brandless AS-IS/TO-BE descriptions;
  - custom P18 coordinate values.
- Validated product/E2E head: `64a80282e82948229392330c055be5404dc90805`.
- Results:
  - Production build/contracts: PASS
  - Browser/PDF E2E: PASS
  - 40 pages / 40 navigation links / Appendix 0
  - Script removal PASS
  - unresolved `[[...]]` 0
  - semantic field and DOM fingerprint PASS
  - P18 labels, axes, coordinates, and movement PASS
  - Creative History status normalization PASS
  - 1280×720 geometry and overflow 0
  - actual Export PDF, second export, Ctrl+P, Cmd+P PASS
  - save/reload/reopen PASS
  - PDF 40 pages, 960×540pt, embedded fonts, no full-page raster rows
  - PDF preflight warnings 0
  - E2E screenshots inspected
  - all 40 PDF pages rendered and visually inspected
- Workflow run: `30799168241`.
- Evidence artifact: `phase6-pdf-runtime-evidence`, ID `8850131424`.
- Vercel deployment `GNQ2CvgR72wcmtuHDc1JrWft4hHS`: Ready.
- Preview: `https://brand-consulting-git-fix-phase6-main40-c77bea-dpes31s-projects.vercel.app/`.
- Updated AGENTS, Project Handoff, Decision Log, Work Log, and Report Template Specification to remove stale PR #20 / CONTENT SLOT architecture.
- PR #24 remains Draft and unmerged pending explicit owner Preview approval.
