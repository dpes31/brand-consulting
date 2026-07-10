# Owner Failure Fixture

The user-provided failed report showed these mandatory regression cases:

- P12 rank name became `1`, causing a misleading P13 title error.
- Persona situation fields contained `1`, `2`, `3`, `4`.
- AIPL codes and stage labels shifted into action/evidence/state fields.
- JTBD and matrix records shifted by DOM text-node order.
- Viewer clipped the slide on the right at common desktop widths.
- The report regressed from 40 pages to the historical 40+8 version.

The product must fail locally at the damaged field, not at a downstream page, and must keep the current 40-page zero-Appendix contract.
