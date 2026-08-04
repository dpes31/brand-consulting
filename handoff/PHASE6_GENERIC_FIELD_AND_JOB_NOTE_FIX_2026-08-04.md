# Phase 6 Generic Field and JOB Note Fix — 2026-08-04

## Owner-reported failure

Phase 6 prompt generation failed with:

`페이지 의미가 없는 순번 기반 필드가 남아 있다: identity.content1, inflection.content1, inflection.content2, inflection.content3`

The owner also requested the same explanatory footnote on P11 and P25:

`JOB : 고객이 특정 상황에서 달성하고 싶어 하는 근본적인 목표나 해결하고자 하는 일을 뜻함`

## Root cause

The failure was not caused by Step 0–5 research.

1. `src/pages/full-report-density-v2-runtime.ts` appended `.founding-jtbd-note` inside P3 Brand Identity. The semantic annotator did not own that node, so it became `identity.content1`.
2. P7 Core Inflection was rewritten asynchronously by the V2/V4 visual runtimes. Three unowned `<small>` captions were interpreted as `inflection.content1~3`.
3. `loadApprovedPilotBaseHtml` could capture the hidden Pilot after Page Plan completion but before or after the delayed V4 rewrite. The approved-base DOM therefore depended on timing.
4. The old captured DOM was stored in session storage under `brand-consulting:phase6-semantic-html-v5:<brand>`. A fresh E2E browser passed while an existing owner tab could keep reusing the incompatible DOM.

## Implemented correction

### Approved-base cache policy

Added `src/lib/installPhase6ApprovedBaseCachePolicy.ts`.

- Removes only derived Phase 6 approved-base HTML cache keys.
- Does not remove Step 0–5 research, User Brief, Competitor Registry, saved projects, or completed reports.
- Runs before `installFullReportPhase6Bridge()`.

### Deterministic approved-base capture

Updated `src/report/fullReportCompilerV3.ts`.

The hidden Pilot is captured only when all conditions are true:

- `phase6PagePlanReady === true`
- `fullReportV4Ready === true`
- exactly 40 `.full-slide` pages

### P3 and P7 semantic DOM correction

Updated:

- `src/pages/full-report-density-v2-runtime.ts`
- `src/pages/full-report-v4-runtime.ts`

Corrections:

- Removed `.founding-jtbd-note` injection from P3.
- Rebuilt P7 V2/V4 runtime DOM so the semantic annotator sees exactly:
  - PRODUCT fixed label
  - product reality field
  - PERCEPTION fixed label
  - perception reality field
- BRAND GAP caption and `≠` remain fixed visual DOM rather than ordinal content fields.
- Added `fullReportV4Ready` runtime marker.
- Stopped P11 and P25 from receiving the obsolete generic `.jtbd-header-note`.

### P11 and P25 JOB definition

Updated `src/lib/installPhase6PagePlanV2.ts`.

- P11: label is fixed to `CATEGORY JOB`; the requested definition appears below the CATEGORY JOB statement.
- P25: the same definition appears immediately above the table whose first header is `Job 층위`.
- Both notes are fixed explanatory DOM, not external-AI writing fields.
- Both use `word-break: keep-all` and source/caveat-scale typography.

## Regression lock

Updated `scripts/test-full-report-contract.mjs` to block removal of:

- obsolete approved-base cache invalidation
- V4-ready capture gate
- P11/P25 exact JOB definition
- P11 and P25 placement hooks
- P3 founding-note removal
- P7 ordinal-caption removal

## Validation

Validated implementation Head before this documentation commit:

`d52f7019dc8a5ecf0b8f19bb4ca02afc8202d677`

GitHub Actions:

- Preview CI run `30892298028`: PASS
- PDF Runtime E2E run `30892301416`: PASS

Artifact and screen inspection:

- P11 exact JOB definition count: 1
- P25 exact JOB definition count: 1
- total exact definition count: 2
- generic `.contentN` report fields: 0
- `.founding-jtbd-note`: 0
- obsolete P11/P25 `.jtbd-header-note`: 0
- P11 logical geometry: 1280×720, overflow 0
- P25 logical geometry: 1280×720, overflow 0
- P11 note is below CATEGORY JOB.
- P25 note is above Job 층위.
- Full Phase 0→6 prompt download, HTML import, Viewer, save/reopen, repeated PDF export, Ctrl+P, and Cmd+P: PASS.
- Native PDF: 40 pages, 960×540pt.

## Safety and approval state

- Active branch: `fix/phase6-main40-final-html-semantic-v5`
- Draft PR: #24
- `main`: unchanged and unmerged
- `public/template.html`: unchanged
- protected backup branches: unchanged
- Keep PR #24 Draft until owner Preview approval.
