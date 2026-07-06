# Draft PR Body

## Objective
Unify Phase 6 around one JSON contract and make the approved FULL Pilot component system the production renderer source.

## Confirmed defects
- Legacy HTML prompt handler intercepts the same Phase 6 button before the JSON handler.
- The exported prompt requests complete HTML while the renderer expects ProductionReportV1 JSON.
- The approved Pilot and production renderer are separate implementations.

## Safety
- Preview-first.
- Draft until actual non-Biznup E2E and PDF verification.
- No changes to `public/template.html` or protected backup branches.
- No merge without explicit owner approval.
