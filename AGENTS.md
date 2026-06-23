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

Phase 4 is validated. Phase 5 initial implementation exists on `feature-visualization-engine-v1`, but owner validation failed and Phase 5 is **not complete**.

Observed Phase 5 failures:

- The compiler prompt requests visualization, but the immutable HTML still hard-codes many text-box and `<dl>` layouts, so the model usually fills the existing containers instead of restructuring the slide.
- The Growth Story page still renders chronology as line-broken prose instead of a true visual timeline.
- Many fixed baseline slides remain generic card walls; visualization is concentrated in only a subset of dynamic pages.
- Hard-coded light backgrounds and legacy colors conflict with the dark theme, producing unreadable or low-contrast text.
- Competitor Deep Dive pages have inconsistent spatial hierarchy and triggered PDF preflight overflow warnings.
- The current runtime visual audit is warning-only and cannot guarantee that the generated HTML actually uses the correct visual recipe.

Do not advance to Phase 6 until Phase 5 rework passes owner validation.

## Required Phase 5 rework architecture

A prompt-only approach is insufficient. Implement a deterministic slide system:

1. **Semantic Slide Plan** — AI outputs structured JSON containing decision question, evidence type, content blocks, and selected recipe.
2. **Recipe Library** — reusable consulting slide recipes such as timeline, metric bridge, issue tree, comparison matrix, system map, customer journey, waterfall, roadmap, and choice architecture.
3. **Deterministic Renderer** — application code renders the selected recipe using approved HTML/CSS/SVG components; AI should not freely rewrite layout CSS.
4. **Design Tokens** — one token source for dark/light surfaces, text, accent, risk, opportunity, borders, spacing, and typography. No arbitrary inline hex colors.
5. **Validation Gate** — block export on contrast failure, overflow, missing visual role, invalid recipe structure, or asymmetric comparison grids.

A `DESIGN.md` file may document principles and tokens, but it must be paired with machine-readable recipe schemas and renderer components. Do not treat reference template screenshots as a substitute for implementation.

## Change discipline

- Keep changes phase-scoped.
- Prefer additive guards and validation over destructive template rewrites.
- Use pure HTML/CSS/SVG for report visualization; avoid canvas and cross-origin assets that can taint PDF export.
- Preserve backward compatibility with existing 23-page reports.
- Always provide a Vercel Preview URL and acceptance checklist before requesting approval.
- Update `AGENTS.md` and `docs/PROJECT_HANDOFF.md` whenever phase status, architecture, deferred defects, or acceptance criteria change.
