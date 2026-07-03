# Production Report Integration Correction

## Problem

The approved 40-page Main Deck + 8-page Appendix report was merged as a separate React reference route, while the production report generator still compiles `public/template.html`. This does not satisfy the owner requirement that every newly researched brand use the approved report system.

## Correct target

The production path must be:

Research Steps 0–5
→ validated Visual Intent contracts
→ structured report payload
→ approved 40+8 report component system
→ viewer / save / PDF

The production path must not require `?pilot=full-integrated` and must not fall back to the legacy dark 22/23-page template for newly generated reports.

## Acceptance criteria

1. `compileReportToHTML` no longer uses the legacy visual template as the final report format.
2. API rendering and external-AI manual rendering both use the same approved report contract.
3. A newly researched brand opens the approved report in the normal Dashboard viewer.
4. Brand name, competitors, evidence, Creative History, Persona, SWOT, STP, Root Cause, strategy choice, and Appendix are populated from that project's research rather than Biznup hardcoded data.
5. Saved projects reopen the same approved output.
6. PDF export uses the approved 16:9 report.
7. The legacy production template remains available only as rollback material.
8. Regression tests cover the normal `/` workflow, not only a pilot query route.

## Safety

Implement on a corrective feature branch. Do not overwrite backup branches. Do not claim Production completion until Vercel successfully deploys and a new non-Biznup brand completes the end-to-end workflow.
