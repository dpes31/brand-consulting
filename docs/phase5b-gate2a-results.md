# Phase 5B — Gate 2A Test Results

> This document is a test log. Renderer quality is outside Gate 2A.

## Test conditions

- Brand: 비즈넵
- External AI product/model: GPT, three independent sessions per Step
- Reference files: same uploaded references per repeated Step run
- Competitor seeds: none explicitly fixed for the Step 2 test set
- Test dates: 2026-06-23 onward
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

### Test 1 — failed contract exposure

All three responses produced valid normal Consumer analysis but failed the Visual Intent contract.

Observed defects:

- the copied prompt ended after the locked Step 2 Competitor Registry and omitted the Step 3 Visual Intent contract;
- models created multiple Briefs for Trend, Persona, JTBD, AIPL, Unmet Needs, and Identity Alignment;
- responses used Step 0/2 Recipes or invented Recipe IDs such as persona, JTBD, funnel, and identity-map variants;
- one response mixed different metric units inside a quantitative comparison;
- the test cannot be used for stability scoring.

Correction deployed:

- the complete Step 3 contract is re-applied immediately before prompt copy, after downstream Registry locking;
- normal analysis retains Trends, Persona, Identity Alignment, JTBD, AIPL Bottleneck, and Unmet Needs;
- Visual Intent is limited to exactly one core consumer-decision Brief;
- strict mapping:
  - `consumer-journey` → `customer-journey`;
  - `causal-relationship` → `friction-flow`;
  - `priority-ranking` → `needs-hierarchy`;
  - `evidence-gap` → `evidence-gap`;
- every Step 3 Recipe must use `implementationStatus: planned`;
- Step 3 Visual Intent metrics must be `[]`;
- extra Briefs and other-Step Recipes block submission.

| Run | JSON valid | Single core Brief | Recipe mapping | Planned status | Metrics empty | Notes |
|---:|---|---|---|---|---|---|
| 1 | No | No | No | No | No | Pre-correction response; excluded |
| 2 | No | No | No | Mixed | No | Pre-correction response; excluded |
| 3 | No | No | No | Mixed | Mixed | Pre-correction response; excluded |

Recipe agreement rate: **Not scored**

Decision: **Revise and re-test**

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
| JSON parse rate | 100% | 100% for completed Steps 0 and 2; Step 3 re-test pending | Pending |
| Step allowlist compliance | 100% | 100% for Steps 0 and 2; Step 3 re-test pending | Pending |
| Step 2 Registry preservation | 100% | 100% within each response | Yes |
| Required/available/missing separation | 100% | 100% for completed Steps 0 and 2 | Yes |
| Metric metadata completeness | 100% when present | 100% in Step 2 test 5; Step 3 now requires empty metrics | Pending |
| Unsupported recipe disclosure | 100% | No unsupported recipe mislabel in passed Steps | Pending |
| External template recipe IDs | 0 | 0 in passed Steps | Pending |
| Primary recipe agreement | at least 80% | Step 0: 100%; Step 2 required roles: 100%; Step 3 pending | Pending |
| Evidence invention | 0 | No blocking invention detected in passed Steps | Provisional |

## Gate 2A conclusion

- Overall result: **In progress**
- Passed Steps: **0, 2**
- Re-test required: **3**
- Pending Step: **5**
- Open prompt revision: Step 3 correction deployed, awaiting owner validation
- Schema revisions required: none currently open
- Allowlist revisions required: none currently open
- Owner approval: Step 0 and Step 2 approved through submitted owner test results

Gate 2B renderer work must not begin until Steps 3 and 5 also pass and the owner explicitly approves the complete Gate 2A result.
