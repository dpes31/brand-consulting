# Phase 6 Main40 Semantic Renderer V4 — 2026-07-10

## 0. Executive decision

PR #23 is the only current Phase 6 correction line.

The product contract is:

`40 Main pages / Appendix 0 / app-owned fixed Renderer / structured content / responsive Viewer display / 1280×720 stored and PDF output`

The historical 40+8 Pilot remains a visual and consulting-content grammar reference only. PR #20, PR #21, and PR #22 are failed or superseded audit records and must not be merged.

## 1. Repository checkpoint

- Repository: `dpes31/brand-consulting`
- Production branch: `main`
- Production commit: `96f12ac5bde92a53a97a12ea01ae9c3db921c7fe`
- Active branch: `fix/phase6-main40-semantic-renderer-v4`
- Draft PR: #23 `Restore Phase 6 40-page semantic renderer and responsive Viewer`
- Validated product-code head: `3c3afdf2f150e46a97e5d15a9ff66bc72ccd7e1f`
- Build workflow run: `29073367250` — PASS
- E2E workflow run: `29073367276` — PASS
- E2E artifact: `8219743885`
- Stable Preview from the validated product head: `https://brand-consulting-git-fix-phase6-main40-9fff6b-dpes31s-projects.vercel.app/`
- `main`: unchanged
- PR #23 remains Draft.

Vercel later refused additional documentation/cleanup deployments because the free-plan daily deployment limit was exceeded. This quota error is not a code build failure. The stable Preview above was Ready for the validated product head.

## 2. User defect reproduced

The user-provided failed report contained the following semantic corruption:

- P12 first competitor-name field became `1`.
- The old validator then compared the P13 title with competitor name `1` and reported a misleading P13 error.
- Persona situation fields contained `1`, `2`, `3`, and `4`.
- JTBD cells, AIPL stage values, STP labels, strategy routes, and Final Choice values shifted by DOM text-node order.
- The Viewer showed the 1280px slide at scale 1 inside a narrower desktop viewport, clipping the right side.
- The output regressed to the historical 40+8 page structure.

The provided failure is now represented by explicit browser E2E cases rather than only a synthetic happy path.

## 3. Implemented architecture

### Semantic Renderer V4

`src/report/semanticReportV4.ts`:

- annotates the current 40-page app-owned base;
- removes non-semantic and structural labels from the AI-editable contract;
- rejects generic order fields such as `.content1`;
- validates page-specific semantic records;
- inserts only validated content values;
- verifies the DOM fingerprint before and after rendering;
- outputs `data-content-contract="semantic-report-v4"`;
- outputs Appendix count 0.

### Semantic field policy

`src/report/structuredDefinitionPolicy.ts`:

- blocks generic DOM-order fields;
- converts JTBD `field1..5` into named roles;
- removes target-stage labels, journey numbers, and similar app-owned structure from the AI contract;
- preserves field-length limits without shrinking copy.

### Failure-local validation

`src/report/structuredReportCrossValidation.ts`:

- validates P12 competitor names before P13–15;
- rejects numbers, arrows, table labels, and evaluation headings as competitor names;
- verifies the three P12 summary cards against the ranking table;
- only performs downstream consistency checks after P12 is valid.

The owner defect now produces a P12 field error and never a misleading P13 title error.

### Viewer-only responsive fit

`src/lib/installFullReportRuntimeCompatibility.ts`:

- keeps the stored slide canvas at 1280×720;
- calculates a Viewer-only scale from the actual available width;
- prevents horizontal document overflow;
- resets to scale 1 before PDF/print;
- restores Viewer fit after print.

At 1366px viewport the validated scale was `0.8297`, the rightmost report edge was `1333px`, and horizontal overflow was 0.

### User-facing workflow

The screen now uses:

1. `외부 AI용 보고서 작성 프롬프트 다운로드`
2. attach the downloaded file to the external AI
3. copy the returned result
4. paste the result into Phase 6
5. `결과 검증 후 40페이지 보고서 만들기`

The visible notice is:

`레이아웃과 페이지 구성은 앱이 고정합니다. 외부 AI는 내용만 작성합니다.`

The internal structured transport remains an implementation detail, not the product concept shown to the user.

## 4. Browser E2E results

Validated at product-code head `3c3afdf2f150e46a97e5d15a9ff66bc72ccd7e1f`:

- build and contract tests: PASS
- generic order fields: 0
- exactly 40 slides: PASS
- Appendix: 0
- navigation links: 40
- P12 rank name `1` blocked at P12: PASS
- misleading P13 error absent: PASS
- Persona situation `1` blocked: PASS
- malformed Creative History status blocked: PASS
- exact Creative History years: PASS
- P12 core-three card/table consistency: PASS
- Deep Dive five-stage labels and rank labels: PASS
- Category Clichés three-column structure: PASS
- Positioning axis names: PASS
- AIPL A → I → P1 → P2 → L structure: PASS
- STP arrows and Positioning field: PASS
- 1366px Viewer right clipping: 0
- 1366px horizontal overflow: 0
- all slides logical size: 1280×720
- all slide content overflow: 0
- save → reload → reopen: 40 pages
- Export PDF twice: PASS
- Ctrl+P / Cmd+P routing: PASS

## 5. PDF and visual inspection

Generated PDF:

- 40 pages
- 960×540pt
- JavaScript: none
- embedded Pretendard Black, Regular, Bold, ExtraBold, and SemiBold
- no 2560×1440 full-page raster fallback

All 40 pages were rendered to PNG and reviewed in four 10-page contact sheets. Critical full-size screenshots were reviewed for:

- Threat Ranking
- Deep Dive
- Category Clichés
- Positioning
- Consumer Executive
- Core Target and Persona
- Pain / AIPL / Loyalty
- Creative History
- Message Trajectory and Creative Insight
- SWOT / Root Cause / STP
- Four Strategic Directions / Final Choice / Close

No clipping, layout collapse, or semantic field shifting was observed in the validated fixture. The fixture copy is intentionally generic test content and is not evidence of final consulting-copy quality.

## 6. Validation boundary

The execution environment has no external third-party AI credential or invocation tool. Therefore two deterministic full structured responses were tested, but two actual external-AI responses were not generated here.

Required pre-merge owner gate:

1. use a non-Biznup brand;
2. run the downloaded prompt through an actual external AI;
3. paste the returned result;
4. repeat with a second independent response;
5. inspect P12–18, P19–28, P29–40;
6. save, reload, reopen;
7. export PDF twice;
8. approve the Preview.

Do not mark PR #23 Ready and do not merge before this owner gate passes.
