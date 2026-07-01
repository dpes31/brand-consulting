# Phase 3 — Dynamic Page Planner

## Objective

The report must expand in proportion to validated research depth, not by filler and not by compressing every topic into one page.

## Page contract

- Main Deck: minimum 23 pages, maximum 40 pages.
- Evidence Appendix: page 41 onward in the same HTML/PDF.
- Existing 23 base wrappers remain mandatory and backward compatible.
- Appendix does not repeat the strategy narrative; it contains evidence, verbatim copy lists, detailed tables, and verification notes.
- Raw URLs are not displayed in the report or PDF.

## Variable page rules

### II. Competitor

- `slide-05`: Competitive Threat Landscape.
- `slide-06`: Threat Ranking & Selection Logic. Indirect Competitor is removed.
- One independent Deep Dive page per selected Registry competitor (2–5).
- Product Matrix and Positioning Map continue only when the comparison logic cannot be read on one page.

### IV. Creative

- `slide-14`: competitive creative So What comparison.
- One independent Creative History page per selected Registry competitor.
- Each page uses five completed years plus current-year YTD.

## Anti-filler rule

Pages may be added only when they answer a distinct decision question, preserve an independent competitor history, or prevent a meaningful analytical structure from being clipped. Definitions, generic advice, duplicated summaries, and decorative prose cannot justify additional pages.

## Runtime safeguards

- Every wrapper and slide ID is normalized to be unique.
- The first 40 Main Deck pages are tagged `data-report-zone="main"`.
- Overflow/evidence pages are tagged `data-report-zone="appendix"`.
- A machine-readable `report-page-manifest` JSON script records every page.
- Dynamic navigation links are generated only for slide IDs that exist.
- The 16:9 PDF exporter continues to export every wrapper, including Appendix pages.

## Acceptance criteria

1. A Registry with two competitors produces at least 27 meaningful Main Deck pages when Step 4 evidence exists.
2. A Registry with five competitors can produce up to 33 pages before conditional continuations.
3. Each selected competitor receives one Deep Dive page and one Creative History page.
4. No Indirect Competitor page remains in the generated narrative.
5. Main Deck never exceeds 40 pages; additional evidence is Appendix.
6. PDF page count equals total slide-wrapper count.
7. Existing 23-page projects still open and export normally.
8. Repeated PDF export still uses the Phase 1 session cache when the report has not changed.
