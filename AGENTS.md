# AGENTS.md

This repository is maintained through preview-first, reversible AI-assisted development.

## Mandatory first read

Before making changes, read:

- `docs/PROJECT_HANDOFF.md`
- the latest open stacked PRs
- the implementation notes under `docs/phase*.md`
- `docs/phase5b-pilot-spec.md` when working on visualization architecture
- `design/DESIGN.md` and the machine-readable files under `design/`

## Branch and deployment rules

- Never commit directly to `main`.
- Never merge to `main` without explicit owner approval after Vercel Preview validation.
- Create each phase branch from the latest owner-validated phase branch.
- Keep the rollback branch `backup-production-stable-20260622` untouched.
- Do not rewrite or force-push validated branches.
- Do not delete or overwrite `feature-visualization-engine-v1` or Draft PR #6; they remain the audit record of the failed prompt-only Phase 5 approach.

## Product invariants

- Preserve all 23 approved base report wrappers.
- Main Deck: 23–40 pages; overflow evidence continues as Appendix in the same HTML/PDF.
- Report canvas: exact 16:9, excluding the web navigation.
- PDF: all pages, no clipping, no white outer margins.
- Direct competitors: threat-ranked 2–5; no Indirect Competitor section.
- Every selected competitor gets an independent Deep Dive and six-year Creative History page.
- Do not invent figures, campaign models, dates, or copy.
- Only verified verbatim advertising copy may use quotation marks.
- Final reports do not expose raw source URLs.

## Current work

Phase 4 is validated.

Phase 5 prompt-only visualization on `feature-visualization-engine-v1` failed owner quality validation and is not approved.

Current branch: `feature-visual-recipe-pilot-v1`, created from validated `feature-creative-history-contract-v1`.

Current gate: **Gate 1.5 specification only**.

Authorized work in Gate 1.5:

- Visual Intent Brief Schema;
- Step-level Recipe Selection Matrix;
- schemas for `milestone-timeline`, `competitor-threat-system`, and `feature-matrix`;
- success/failure criteria;
- feature-flag and rollback specification;
- continuity documentation.

Not authorized until explicit owner approval:

- research prompt changes;
- renderer code;
- `template.html` changes;
- runtime Validator code;
- Phase 6 compiler changes;
- Draft PR creation;
- intentional Vercel deployment or Preview;
- any merge.

Approval of Gate 1.5 authorizes Gate 2A prompt-contract testing only. It does not authorize deterministic renderer implementation.

## Phase 5B architecture direction

Use the following staged system:

```text
Research response
→ Step-level Visual Intent Brief
→ Phase 6 Semantic Slide Plan
→ constrained Recipe Router
→ deterministic HTML/CSS/SVG Renderer
→ blocking Validator
→ existing 16:9 PDF Export
```

External template libraries inform abstract information patterns only. Executable output must use internal recipe IDs.

## Change discipline

- Keep changes phase-scoped.
- Prefer additive guards and validation over destructive template rewrites.
- Use pure HTML/CSS/SVG for future report visualization; avoid canvas and cross-origin assets that can taint PDF export.
- Preserve backward compatibility with existing 23-page reports.
- Update `AGENTS.md` and `docs/PROJECT_HANDOFF.md` whenever the gate, branch, architecture, deferred defect, or acceptance criteria change.
