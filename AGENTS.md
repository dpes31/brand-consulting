# AGENTS.md

This repository is maintained through preview-first, reversible AI-assisted development.

## Mandatory first read

Before making changes, read:

- `docs/PROJECT_HANDOFF.md`
- the latest open stacked PRs
- the implementation notes under `docs/phase*.md`

## Branch and deployment rules

- Never commit directly to `main`.
- Never merge to `main` without explicit owner approval after Vercel Preview validation.
- Create each phase branch from the latest owner-validated phase branch.
- Keep the rollback branch `backup-production-stable-20260622` untouched.
- Do not rewrite or force-push validated branches.

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

Phase 4 is validated. Phase 5 implements the Visualization Engine. Deferred Phase 6 issues include navigation click routing and second-export PDF cache regression.

## Change discipline

- Keep changes phase-scoped.
- Prefer additive guards and validation over destructive template rewrites.
- Use pure HTML/CSS/SVG for report visualization; avoid canvas and cross-origin assets that can taint PDF export.
- Preserve backward compatibility with existing 23-page reports.
- Always provide a Vercel Preview URL and acceptance checklist before requesting approval.
