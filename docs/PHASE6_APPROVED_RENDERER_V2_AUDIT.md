# Phase 6 V2 Audit Baseline

- Base branch: `main`
- Base commit: `7856624cc805fcedfaa6f60e7e7a0773ee60d492`
- Correction branch: `fix-phase6-approved-full-renderer-v2`
- Legacy template blob: `22bc6937b3d672e063d4b240c5a39b9c61700fec`

## Confirmed defects

1. `installPromptWorkflowGuard` intercepts `프롬프트 추출`, calls `stopImmediatePropagation`, loads `/template.html`, and exports a complete HTML-generation prompt.
2. `installFullReportPhase6Bridge` expects the same control to export JSON-only instructions and expects the result input to be `ProductionReportV1` JSON.
3. Installation order places the legacy workflow guard before the new bridge.
4. The approved `BiznupFullIntegrated` route and production `public/full-report-v1.*` renderer are separate visual implementations.

## Blocking acceptance conditions

- Normal Phase 6 exports JSON-only prompt text.
- Legacy HTML input is explicitly rejected before JSON parsing.
- Pilot and Production use the same approved renderer source.
- 48-page contract, save/reopen, navigation, and repeat PDF export pass in Preview.
