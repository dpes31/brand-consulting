# Phase 6 V2 Acceptance Checklist

- [ ] Prompt export produces ProductionReportV1 JSON instructions only.
- [ ] Prompt export does not embed `public/template.html`, `<!DOCTYPE html>`, or `.slide-wrapper`.
- [ ] Legacy HTML input receives a specific migration message and is not sent to `JSON.parse`.
- [ ] External JSON and internal API use the same report assembly path.
- [ ] Pilot fixture and production report share the approved renderer components and CSS.
- [ ] Exactly 40 Main pages and 8 Appendix pages render at 1280×720.
- [ ] Persona, six-year Creative History, Message Trajectory, Strategic So What, SWOT, STP, sources, highlighting, Korean wrapping, and overflow pass visual review.
- [ ] Save and reopen preserves the same FULL report.
- [ ] Navigation works across pages 1–48.
- [ ] Two consecutive PDF exports produce complete 48-page reports without style loss or trailing blank pages.
- [ ] Legacy template SHA remains `22bc6937b3d672e063d4b240c5a39b9c61700fec`.
- [ ] Preview approved by owner before merge.
