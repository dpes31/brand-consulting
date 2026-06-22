# Phase 4 — Creative History Verbatim Contract

## Root problem

A six-column timeline can look structurally complete while still mixing verified campaign copy, paraphrased messages, and inferred slogans. Phase 4 separates these states so that visual completeness cannot disguise evidentiary weakness.

## Research contract

Step 4 must end with a `CREATIVE_HISTORY_REGISTRY` JSON block covering:

- the target brand exactly once;
- every competitor locked by Step 2;
- five completed years plus current-year YTD;
- exactly six entries per brand.

Each entry contains:

- year;
- campaign name;
- model;
- verbatim key copy;
- copy verification status;
- media/format;
- appeal strategy;
- source label without raw URL.

## Verification states

- `verified-verbatim`: the exact copy was confirmed in an official video, release, or brand channel.
- `source-found-copy-unverified`: the campaign exists, but exact copy was not confirmed.
- `not-found`: the campaign itself was not confirmed.

Only `verified-verbatim` copy may be presented in quotation marks. Unverified years must state `원문 카피 공개 미확인`; current-year absence must state `신규 캠페인 공개 미확인`.

## Rendering contract

- Target brand and every competitor page contains six year cards.
- Each card exposes `data-year` and `data-copy-status`.
- Each competitor retains an independent page.
- Message Trajectory and Strategic So What are separate fields.
- URLs never appear in the report or PDF.

## Safety

- Step 4 submission is blocked when the registry is missing or incomplete.
- Phase 6 prompt extraction is blocked until Step 4 passes the registry contract.
- Existing reports without the new attributes still open; viewer validation produces a warning rather than deleting or rewriting content.
- Phase 1 PDF and Phase 3 page-planning behavior remain unchanged.

## Acceptance criteria

1. Step 4 copied prompt contains `CREATIVE_HISTORY_REGISTRY_START/END`.
2. The prompt lists the target brand and exact locked competitors.
3. A missing year or missing competitor blocks Step 4 submission.
4. The Phase 6 file name starts with `creative_history_compiler_`.
5. The compiler prompt contains `CREATIVE HISTORY RENDERING CONTRACT`.
6. Every competitor page has six year cards after rendering.
7. Unverified copy is not displayed as a quotation.
8. PDF remains 16:9 and includes all dynamic pages.
