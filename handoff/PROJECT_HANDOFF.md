# Brand Consulting Generator — Project Handoff

## Current checkpoint — 2026-08-21

- Repository: `dpes31/brand-consulting`
- Production branch: `main`
- Current production commit: `d45d7f16b4d5f305d10e28b8f80a158c7073c37b`
- Production URL: `https://brand-consulting.vercel.app/`
- Active branch: `fix/phase6-coway-real-output-validation-v1`
- Draft PR: `#26 Harden Phase 6 real HTML validation and PDF parity`
- Implementation head before final documentation commits: `88d64a4ea6801479e78c54879b81b9234e331355`
- Preview: `https://brand-consulting-git-fix-phase6-coway-r-2e3260-dpes31s-projects.vercel.app`
- Phase 6 Color Correction Preview CI run `32437175392`: PASS
- Phase 6 PDF Runtime E2E run `32437175313`: PASS
- Vercel Preview: Ready
- Owner final Coway Preview test: PASS
  - same latest Coway HTML uploaded without blocking error
  - P4 Viewer: `계정 → 매출 → 해외 → 비렉스`
  - P4 PDF: same output
- PR #26 is open, mergeable, Draft, and unmerged.
- `main`, protected backup branches, and Legacy `public/template.html` remain untouched.

## Critical current truth

The Phase 6 architecture is no longer the old PR #24-only checkpoint described in older handoff entries. Production `main` already contains PR #24 at `d45d7f...`; PR #26 is the active hardening line.

Current product contract:

`Step 0–5 research`
→ `complete styled 40-page HTML prompt`
→ `external AI returns one complete standalone styled 40-page HTML`
→ `paste/upload`
→ `sanitization + identity + semantic + DOM + cross-page validation`
→ `app-owned fixed presentation correction`
→ `Viewer / save / reopen / native PDF`

External AI output is HTML, not JSON and not a semantic workbook.

## What PR #26 fixes

PR #26 was created after real Coway external-AI output exposed sequential hidden failures that synthetic tests alone did not cover.

Implemented corrections:

- safe rich-markup recovery: external `<b>/<strong>` → `<mark>`;
- disallowed rich tags such as `<span>` remain blocking;
- possible blocking errors are collected instead of first-error fail-fast where practical;
- P12 Threat Ranking score fields are typed/ranged and totalled explicitly;
- Persona P22–24 must match P21 target 1–3 in order;
- Persona `Brand Role` and `SO WHAT` excessive duplication is rejected;
- P18 uses one app-owned semantic coordinate-linked SVG vector;
- legacy `positioning-arrow-v2` overlay is removed;
- P29 target Creative History breadcrumb is app-owned as `IV. CREATIVE > TARGET BRAND HISTORY`;
- P4 FACTS fixed connector defect is normalized to `계정 → 매출 → 해외 → 비렉스` across approved base, cached base, external HTML, and final output;
- actual Coway external-output fixtures are part of regression testing instead of relying only on synthetic fill-template tests.

## P12 Threat Ranking score contract

The score fields are numeric scores, not evidence prose:

- penetration 0–25
- growth 0–20
- preference 0–20
- campaign 0–15
- inflection 0–15
- evidence 0–5
- total = exact sum, 0–100

A prior Coway output put prose such as subscription sales evidence into `evidence`; that must remain blocking rather than being silently coerced.

## Persona contract

- P21 defines target 1–5.
- P22 = target 1, P23 = target 2, P24 = target 3.
- Conclusion-led titles are allowed.
- Substituting target 4/5 or another target identity is blocking.
- `Brand Role` answers what the brand does for the Persona.
- `SO WHAT` answers how product/experience/communication strategy should change; near-duplicate copy across these roles is a quality error.

## P18 Positioning contract

- External AI writes only ten semantic coordinates and semantic labels/axes.
- Coordinates are integer 0–100.
- The app creates one `.map-arrow-vector` and binds it to target AS-IS / TO-BE coordinates.
- `.positioning-arrow-v2` must not be restored.
- HTML and PDF use the same vector/positions.

## P29 Creative History contract

The target-brand page breadcrumb is app-owned:

`IV. CREATIVE > TARGET BRAND HISTORY`

Competitor history remains separate on P30–32.

## P4 fixed presentation contract

P4 FACTS KPI flow must render:

`계정 → 매출 → 해외 → 비렉스`

This is fixed DOM, not AI-authored research content. Legacy `?` must be auto-repaired in:

- approved Pilot/base sanitization;
- previously cached approved bases;
- external HTML normalization;
- final identity/presentation pass.

## Real Coway end-to-end validation

The owner reused the same Step 0–5 research, downloaded the latest Phase 6 prompt, generated a new Coway HTML, uploaded it to Preview, opened Viewer, and exported PDF.

Verified on the real output:

- exactly 40 pages;
- 757 semantic fields, duplicate 0;
- unresolved token 0;
- generic `.contentN` 0;
- P12 score values valid and totals correct: LG전자 92 / 쿠쿠홈시스 83 / 삼성전자 80;
- P21 → P22–24 Persona order correct;
- P18 one coordinate-linked connector;
- P29 final Viewer/PDF target breadcrumb correct;
- PDF 40 pages, 960×540pt, Pretendard;
- final P4 correction re-test in Viewer and PDF: PASS.

This is the acceptance evidence for PR #26. Do not demand another full 40-page user round-trip unless a later code change touches the report contract or a regression appears.

## Automated acceptance evidence

At implementation head `88d64a4ea6801479e78c54879b81b9234e331355`:

- Phase 6 Color Correction Preview CI `32437175392`: PASS
- Phase 6 PDF Runtime E2E `32437175313`: PASS
- actual Coway external fixture regression: PASS
- latest Coway semantic fixture regression: PASS
- synthetic semantic regression: PASS
- P12 score error regression: PASS
- P4 approved runtime / legacy cached base / legacy external output auto-repair: PASS
- Viewer save → reload → reopen: PASS
- repeated Export PDF: PASS
- Ctrl+P / Cmd+P routing: PASS
- PDF 40 pages / 960×540pt / embedded Pretendard: PASS
- P18 / P29 regression: PASS

## Owner-approved output contract

- One complete standalone styled visual HTML report.
- Exactly 40 Main Deck pages, zero Appendix.
- Page 40: Decision Receipt / Close.
- Logical canvas 1280×720.
- Native PDF 960×540pt.
- Exact target brand spelling.
- No raw URLs in final semantic fields.
- Creative History state is one of:
  - `verified-verbatim`
  - `source-found-copy-unverified`
  - `not-found`
- Only `verified-verbatim` copy may be quoted.

## Active implementation

Core files include:

- `src/lib/installFullReportPhase6Bridge.ts`
- `src/report/semanticHtmlReportV5.ts`
- `src/report/semanticReportV4.ts`
- `src/report/structuredReportCrossValidation.ts`
- `src/report/threatRankingScoreContract.ts`
- `src/report/reportIdentityLock.ts`
- `src/report/reportDomSafety.ts`
- `src/report/phase6PromptPackage.ts`
- `src/pages/full-report-density-v2-runtime.ts`
- `src/pages/full-report-v4-runtime.ts`
- `scripts/e2e-phase6-coway-latest-semantic-fixture.mjs`
- `scripts/e2e-phase6-coway-external-fixture.mjs`
- `scripts/e2e-phase6-real-output-validation.mjs`
- `scripts/e2e-phase6-p4-kpi-arrow.mjs`
- `scripts/e2e-phase6-five-competitor-native-print.mjs`

## Rejected paths that must stay rejected

- JSON-only Phase 6 external workflow
- V6 lightweight semantic workbook
- `feature-visualization-engine-v1` / PR #6
- discarded PR #8, #9, #10
- superseded PR #18–#23 product implementations

The historical large attachment/message timeout remains a known transport risk. It is not a reason to remove the approved visual artifact or restore JSON/workbook output.

## Merge gate

PR #26 is technically and user-validated, but it must remain unmerged until the owner explicitly approves `main` merge after final documentation CI is green.

When approval is given:

1. confirm PR #26 head has not moved unexpectedly;
2. confirm both CI workflows and Vercel are green at that head;
3. use regular merge, not squash;
4. verify the resulting `main` merge commit;
5. verify Production `https://brand-consulting.vercel.app/` deploys successfully;
6. do not delete the test/audit branch unless separately approved.
