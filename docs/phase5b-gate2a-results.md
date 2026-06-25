# Phase 5B — Gate 2A Test Results

> This document is a test log. Renderer quality is outside Gate 2A.

## Test conditions

- Brand: 비즈넵
- External AI product/model: GPT, three independent sessions per Step
- Reference files: same uploaded references per repeated Step run
- Competitor seeds: none explicitly fixed for the Step 2 test set
- Test dates: 2026-06-23 to 2026-06-25
- Tester: owner

The same inputs and prompt must be used for all repeated runs within a Step.

## Step 0 — Brand Fact Book

| Run | JSON valid | Primary recipes | Growth Story recipe | Missing inputs disclosed | External template ID | Evidence invention | Notes |
|---:|---|---|---|---|---|---|---|
| 1 | Yes | milestone-timeline | milestone-timeline | Yes | 0 | 0 observed | Valid independent response |
| 2 | Yes | milestone-timeline | milestone-timeline | Yes | 0 | 0 observed | Valid independent response |
| 3 | Yes | milestone-timeline | milestone-timeline | Yes | 0 | 0 observed | Valid independent response |

Recipe agreement rate: **100%**

Decision: **Pass**

## Step 2 — Competitor Strategy

| Run | JSON valid | Registry preserved | Ranking brief | Deep Dive per selected competitor | Matrix brief | Required-role recipe agreement | Metric contract | Optional Positioning Map | Notes |
|---:|---|---|---|---|---|---|---|---|---|
| 1 | Yes | Yes | 1 × rank-scorecard | 4/4 | 1 × feature-matrix | Baseline | Complete | Present | 7 Briefs |
| 2 | Yes | Yes | 1 × rank-scorecard | 3/3 | 1 × feature-matrix | 100% across 2 runs | Complete | Present | 6 Briefs |
| 3 | Yes | Yes | 1 × rank-scorecard | 3/3 | 1 × feature-matrix | 100% across 3 runs | Complete | Present | 6 Briefs |

Required role signature in all runs:

```text
Threat Ranking = rank-scorecard
Deep Dive = competitor-threat-system
Product Matrix = feature-matrix
```

Positioning Map participation: **3 of 3 responses**. This optional role is reported separately and does not affect the required-role agreement score.

Selected competitor sets varied across independent research runs:

- Run 1: 캐시노트, 삼쩜삼, 혜움·더낸세금, 쌤157
- Run 2: 삼쩜삼, 토스인컴, 국세청 원클릭
- Run 3: 삼쩜삼, 더낸세금·혜움, SSEM

This variation is not a Gate 2A Visual Intent contract failure. A production report must use one chosen response and lock its single Registry; results from multiple runs must not be merged into a synthetic Registry.

Decision: **Pass**

## Step 3 — Consumer Insights

| Run | JSON valid | Recipe | Stable sequence supported | Emotion/behavior evidence | Missing inputs disclosed | External template ID | Notes |
|---:|---|---|---|---|---|---|---|
| 1 |  |  |  |  |  |  |  |
| 2 |  |  |  |  |  |  |  |
| 3 |  |  |  |  |  |  |  |

Recipe agreement rate:

Decision: **Pending**

## Step 5 — Strategic Implication

| Run | JSON valid | Recipe | Root Cause linkage | Trade-off or transition evidence | Missing execution inputs | SWOT-only failure | Notes |
|---:|---|---|---|---|---|---|---|
| 1 |  |  |  |  |  |  |  |
| 2 |  |  |  |  |  |  |  |
| 3 |  |  |  |  |  |  |  |

Recipe agreement rate:

Decision: **Pending**

## Aggregate score

| Measure | Required | Actual so far | Pass |
|---|---:|---:|---|
| JSON parse rate | 100% | 100% for completed Steps 0 and 2 | Yes |
| Step allowlist compliance | 100% | 100% for completed Steps 0 and 2 | Yes |
| Step 2 Registry preservation | 100% | 100% within each response | Yes |
| Required/available/missing separation | 100% | 100% for completed Steps 0 and 2 | Yes |
| Metric metadata completeness | 100% when present | 100% in Step 2 test 5 | Yes |
| Unsupported recipe disclosure | 100% | No unsupported recipe mislabel observed | Yes |
| External template recipe IDs | 0 | 0 | Yes |
| Primary recipe agreement | at least 80% | Step 0: 100%; Step 2 required roles: 100% | Yes |
| Evidence invention | 0 | No blocking invention detected by current Gate 2A checks | Provisional |

## Gate 2A conclusion

- Overall result: **In progress**
- Passed Steps: **0, 2**
- Pending Steps: **3, 5**
- Steps requiring prompt revision: none currently open
- Schema revisions required: none currently open
- Allowlist revisions required: none currently open
- Owner approval: Step 0 and Step 2 approved through submitted owner test results

Gate 2B renderer work must not begin until Steps 3 and 5 also pass and the owner explicitly approves the complete Gate 2A result.
