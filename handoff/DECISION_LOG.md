# Decision Log

## D-001 — Reversible production workflow

**Decision:** Production changes require a feature branch, Preview review, explicit owner approval, and a preserved rollback branch.

**Status:** Permanent operating rule.

## D-002 — Backup before FULL report transition

**Decision:** Preserve former `main` at `backup/main-before-full-report-v1-2026-07-01`.

**Rule:** Never modify, force-update, or delete this branch.

## D-003 — Preserve milestone commit history

**Decision:** Use regular merge or fast-forward for milestone integrations; do not squash.

## D-004 — Competitor selection

**Decision:** Step 2 selects 2–5 direct competitors through a threat-ranked Registry.

**Consequences:**

- No indirect competitor in core Deep Dive analysis.
- Each selected competitor gets one independent Deep Dive.
- Each selected competitor gets one six-year Creative History page.

## D-005 — Creative copy factuality

**Decision:** Advertising copy may appear in quotation marks only when verified verbatim.

**Consequences:**

- `verified-verbatim`: quotation permitted.
- `source-found-copy-unverified`: no reconstructed quotation.
- `not-found`: disclose evidence gap.

## D-006 — Dynamic report size

**Decision:** Preserve 23 mandatory legacy wrappers. Main Deck may expand to 40 pages; later evidence continues as Appendix.

**Status:** Historical legacy-generator contract, superseded for current Phase 6 by D-013.

## D-007 — Reject heuristic visualization engine

**Decision:** Do not merge `feature-visualization-engine-v1` / PR #6.

**Status:** Retain as audit evidence.

## D-008 — Visual Intent contract

**Decision:** Models propose constrained information structure before rendering; external template names are not executable Recipe IDs.

## D-009 — Gate 2A accepted mappings

**Decision:** Freeze validated Step contracts.

- Step 0: Growth Story → `milestone-timeline`.
- Step 2: Threat Ranking → `rank-scorecard`; selected competitor Deep Dive → `competitor-threat-system`; Product Matrix → `feature-matrix`; Positioning optional.
- Step 3: one core consumer Brief; `friction-flow`; `implementationStatus: planned`; `metrics: []`.
- Step 5: one final strategy Brief; `choice-architecture`; `implementationStatus: planned`; `metrics: []`.

## D-010 — Approved FULL report reference

**Decision:** Approved design reference is the 40-page Main Deck + 8-page Appendix route at `/?pilot=full-integrated&brand=<brand>`.

**Fixed principles:**

- 1280×720, exact 16:9.
- Pretendard, major titles weight 900.
- Exact user-entered brand name.
- Keep-all Korean wrapping.
- Yellow highlighting for governing phrases and implications.
- Evidence-appropriate diagrams over generic card walls.

## D-011 — Compiler/template boundary

**Decision:** Merging the React reference route did not silently replace `public/template.html` or all compiler outputs.

**Status:** Historical boundary; migration and regression testing completed in PR #14.

## D-012 — Final consolidation source

**Decision:** Integrate `feature-visual-recipe-pilot-v1` into `feature-main-full-report-integration-v1` through regular merge PR #12.

**Excluded:** PR #6 and superseded PRs #8, #9, #10.

**Merge anchor:** `e607e397819b061c4676e3a2bdfb210f9d1b349b`.

## D-013 — Fixed 48-page Phase 6 production contract

**Decision:** Normal `/` Phase 6 uses exactly 40 Main Deck pages and 8 Appendix pages.

**Consequences:**

- Output is one standalone HTML document with exactly 48 `.full-slide` elements.
- Every slide is 1280×720.
- Approved Pilot DOM, CSS, components, order, navigation, and print rules are layout source.
- `public/template.html` remains a protected rollback asset.

## D-014 — Separate approved layout from sample content

**Decision:** Approved Pilot provides layout structure only. Completed Biznup wording is not a generated-report content source.

**Implementation:**

- Visible sample text becomes `CONTENT SLOT` tokens before prompt export.
- Slots are filled from current Step 0–5 research.
- External-AI and internal-API paths use the same contract.
- Unresolved slots block rendering.
- Missing Step 0 KPI evidence and selected Step 2 competitors block rendering.

## D-015 — Visual correction as a separate follow-up

**Decision:** Detailed page color inconsistencies are handled after content-neutral baseline merge.

**Scope:** Preview-first branch and Draft PR, no `main` merge before actual generated-page review.

## D-016 — Merge Phase 6 content-neutral baseline

**Decision:** Merge PR #14 into `main` with a regular merge after owner confirmation and successful verification.

**Record:**

- PR #14
- Head: `22862482059266c1b385a44794575a40ec7327ec`
- Merge commit: `7614e18bf007ad64c398ff3cfc2eb665f3ca341b`

## D-017 — Keep all selected direct competitors in Main Deck analysis

**Decision:** The fixed 40-page Main Deck supports up to five selected direct competitors without moving competitors 4–5 into Appendix.

**Page allocation:**

- 11: Threat Ranking
- 12–16: Deep Dive 1–5
- 17: Product Matrix
- 18: Positioning
- 29: Target Brand Creative History
- 30–34: Competitor Creative History 1–5
- 35: Message Trajectory

**Consequences:**

- The same selected competitor set is used in all competitor and creative comparisons.
- Appendix pages are never competitor overflow slots.
- If fewer than five competitors have defensible evidence, unused approved pages become explicit evidence-gap pages; names or facts are never invented.

**Reason:** Threat Ranking already permitted up to five competitors, but placing competitors 4–5 in Appendix fragmented the report logic and made Matrix, Positioning, and Creative History inconsistent.

## D-018 — Preserve 40+8 through evidence consolidation

**Decision:** Add an Appendix divider while retaining exactly 48 pages by consolidating low-priority support material rather than increasing page count.

**Appendix:**

- A1 Appendix divider
- A2 Winning Move
- A3 Via Negativa
- A4 Pre-mortem
- A5 Roadmap
- A6 Measurement
- A7 Evidence Gaps + Source Labels
- A8 Close

**Reason:** Appendix needs a clear section transition, while total page count and PDF contract remain locked.

## D-019 — Final Choice layout is a fixed brand-decision composition

**Decision:** Page 40 must preserve the approved two-column layout:

- left column: Selection Criteria;
- right column: Big IdeaL and Winning Move.

**Rule:** Legacy generic choice CSS such as `grid-column: 1 / -1` must not collapse or span the final result across both columns.

**Reason:** The user-approved page communicates selection logic and final decision simultaneously; stacked or four-column variants weaken the argument and visibly diverge from the approved template.

## D-020 — Persona numbering is atomic text

**Decision:** Persona indices `02` and `03` are atomic two-digit labels and must render on one line.

**Implementation rule:** `white-space: nowrap`, normal word-break, and sufficient minimum width.

## D-021 — FULL PDF uses native print

**Decision:** FULL reports use Chromium native print after fixed-page preflight rather than converting every slide to a full-page JPEG.

**Acceptance:**

- 48 pages
- 960×540pt
- embedded fonts
- no 2560×1440 full-page raster rows
- same HTML in Viewer, saved project, reopened project, and PDF

## D-022 — Legacy and FULL PDF runtimes are mutually exclusive

**Decision:** The legacy `.slide-wrapper > .slide` PDF runtime must never own or override printing for a Phase 6 FULL report that uses `.full-slide`.

**Implementation:**

- Install the FULL runtime before the legacy iframe layout/PDF guard.
- When a FULL report is detected, mark the legacy guard as handled and retain the real browser-native `window.print` function.
- Route every host `Export PDF` button to the active FULL report iframe or a stable offscreen FULL frame.
- When no FULL report exists, show a clear guidance message instead of falling through to the legacy zero-slide error.

**Reason:** The previous installation order caused the FULL runtime to capture the legacy raster exporter as native print. That exporter searched only for `.slide-wrapper > .slide`, found zero elements in a `.full-slide` report, and raised `출력할 슬라이드를 찾지 못했습니다.`

**Acceptance:**

- Actual host Export PDF button invokes native print for a 48-page FULL report.
- Two consecutive exports remain valid.
- No `출력할 슬라이드를 찾지 못했습니다` alert.
- Legacy reports retain their existing layout/PDF guard.

## DECISION_PHASE6_APPROVED_HTML_2026_07_10

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
- 사용자 실제 외부 AI 2회 Preview 검증 후에만 main 병합을 검토한다.
