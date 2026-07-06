# Phase 6 Approved FULL Renderer V2 — Correction Plan

## Objective

Unify Phase 6 around one production contract:

`Step 0–5 research → ProductionReportV1 JSON → approved FULL React renderer → viewer / save / reopen / PDF`

## Root causes

1. The legacy Phase 6 HTML compiler handler intercepts the same `프롬프트 추출` action before the new JSON handler.
2. The app downloads an HTML-generation prompt but the new renderer expects JSON.
3. The approved `/?pilot=full-integrated` React layout is not the production renderer's single visual source.
4. DOM text interception and MutationObserver patching make the workflow order-dependent and difficult to test.

## Implementation sequence

### 1. Single Phase 6 contract
- Remove legacy HTML prompt generation from the normal Phase 6 path.
- Call `buildFullReportDataPrompt` and `assembleFullReportHtml` directly from React.
- Detect legacy HTML input and show a specific migration message instead of attempting JSON parsing.

### 2. Approved renderer reuse
- Extract reusable report shell, slide primitives, navigation, and approved styles from `BiznupFullIntegrated`.
- Make both the pilot fixture and production `ProductionReportV1` route use the same renderer components.
- Preserve the approved 1280×720 layout and visual hierarchy.

### 3. Contract hardening
- Keep exact 40 Main + 8 Appendix validation.
- Add selected-competitor and Creative History coverage checks where the data contract supports them.
- Add regression checks proving the exported prompt contains JSON-only instructions and no legacy HTML template.

### 4. End-to-end verification
- Test a non-Biznup fixture through prompt export, JSON import, render, save/reopen, navigation, and repeat PDF export.
- Inspect Persona, Creative History, SWOT, STP, sources, highlighting, Korean wrapping, and overflow.

## Protected assets

Do not modify:
- `public/template.html`
- Legacy blob `22bc6937b3d672e063d4b240c5a39b9c61700fec`
- `backup/main-before-full-report-v1-2026-07-01`
- `backup-production-stable-20260622`

## Merge rule

Keep the PR Draft. Do not merge to `main` until Preview and PDF verification are complete and the owner explicitly approves.
