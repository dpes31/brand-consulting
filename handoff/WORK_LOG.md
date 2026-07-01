# Work Log

## 2026-06-22 — Production freeze and reversible workflow

- Established preview-first development.
- Created and preserved `backup-production-stable-20260622`.
- Confirmed no direct destructive work on production.

## Phase 1 — Layout and PDF safety

- Added iframe pre-repair and layout-safety guards.
- Stabilized exact 16:9 report and PDF handling.
- Added report viewer UX and export support.
- Recorded remaining repeat-export/navigation regression risks.

## Phase 2 — Competitor Registry

- Added threat-ranked direct-competitor selection.
- Locked 2–5 selected competitors.
- Added Registry parsing and validation.
- Excluded indirect competitors from core Deep Dive generation.

## Phase 3 — Dynamic page planning

- Preserved 23 mandatory base wrappers.
- Added dynamic selected-competitor Deep Dive and Creative History pages.
- Defined 23–40 Main Deck range and Appendix overflow behavior.
- Added navigation/page-manifest support.

## Phase 4 — Creative History factuality

- Added six-year history contract for the target brand and each selected competitor.
- Added status distinctions for verified verbatim, source found but copy unverified, and public source not found.
- Prohibited invented copy and quotation marks around unverified copy.

## Phase 5 audit

- Built `feature-visualization-engine-v1` / PR #6.
- Audit determined the heuristic renderer was not reliable enough for production.
- Branch and PR retained as failed evidence; implementation excluded from final integration.

## Gate 1.5 — Visual Recipe specification

- Added `design/DESIGN.md`.
- Added Visual Intent JSON Schema.
- Added recipe-selection matrix and feature-flag contract.
- Added schemas for:
  - `milestone-timeline`
  - `competitor-threat-system`
  - `feature-matrix`

## Gate 2A — Prompt-contract tests

- Added Visual Intent appendices for Steps 0, 2, 3, and 5.
- Added parsing, allowlists, Metric validation, Registry coverage checks, duplicate-response checks, and Step 3/5 copy guards.
- Owner repeated each accepted Step three times.
- Final results:
  - Step 0: PASS, 100% `milestone-timeline` agreement.
  - Step 2: PASS, complete Metric metadata and 100% required-role agreement.
  - Step 3: PASS, 100% `friction-flow` agreement.
  - Step 5: PASS, 100% `choice-architecture` agreement.

## 2026-06-29 to 2026-06-30 — FULL report reference

- Created `feature-main-full-report-integration-v1` and Draft PR #11 from production `main`.
- Added a 40-page Main Deck and 8-page Appendix reference report.
- Added Pretendard typography, high-density report rules, keep-all Korean wrapping, semantic highlighting, exact brand-name binding, and 1280×720 canvases.
- Added/refined Growth Story, Core Inflection, Positioning, Consumer, Persona, Creative History, SWOT, Root Cause, STP, Strategy Choice, and Appendix layouts.
- Added `scripts/report-visual-qa.mjs` as a geometry/overflow inspection utility.
- User completed iterative Preview review and ended the template test cycle.

## 2026-07-01 — Production consolidation

- Created immutable backup branch:
  - `backup/main-before-full-report-v1-2026-07-01`
  - source commit: `3e57eb8ca1d309fa3d4a39ef62ae84b4f2ad7139`
- Audited PRs and test branches.
- Selected `feature-visual-recipe-pilot-v1` as the valid cumulative Phase 1–4 + Gate 2A source.
- Excluded the failed visualization engine and superseded PRs #8–#10.
- Opened PR #12 from `feature-visual-recipe-pilot-v1` into `feature-main-full-report-integration-v1`.
- Merged PR #12 with a regular merge, preserving both branch histories.
- Integration merge commit: `e607e397819b061c4676e3a2bdfb210f9d1b349b`.
- Updated `AGENTS.md` and created the consolidated handoff documents.
- Final step: merge PR #11 into `main` after documentation and final diff review.
