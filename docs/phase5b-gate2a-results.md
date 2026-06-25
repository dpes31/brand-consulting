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

All three responses produced valid normal Consumer analysis but failed the Visual Intent contract because the copied prompt omitted the contract after downstream Registry rebuilding. Those responses are excluded from stability scoring.

### Test 2 — corrected contract

| Run | JSON valid | Single core Brief | Primary Recipe | Planned status | Metrics empty | Recipe agreement | Notes |
|---:|---|---|---|---|---|---|---|
| 1 | Yes | Yes | friction-flow | Yes | Yes | Baseline | Valid independent response |
| 2 | Yes | Yes | friction-flow | Yes | Yes | 100% across 2 runs | Valid independent response |
| 3 | Yes | Yes | friction-flow | Yes | Yes | 100% across 3 runs | Valid independent response |

Recipe agreement rate: **100%**

Decision: **Pass**

## Step 5 — Strategic Implication

### Test 1 — failed contract exposure

Observed defects:

- the copied prompt omitted the Step 5 Visual Intent contract after Creative History and locked-context prompt rebuilding;
- Run 1 and Run 3 used the Step 2 `competitor-threat-system` Recipe and marked it `planned`;
- Run 2 omitted the Visual Intent start/end markers entirely;
- the three responses are excluded from stability scoring.

Correction deployed:

- re-apply the complete Step 5 contract immediately before prompt copy;
- keep SWOT, GAP, Root Cause, three ToT routes, Big IdeaL, Winning Move, Via Negativa, Pre-mortem, and execution sequence in normal analysis;
- limit Visual Intent to exactly one final strategy-decision Brief;
- enforce exact evidenceType → Recipe mapping;
- require `implementationStatus: planned`;
- require `metrics: []` exactly;
- block other-Step Recipes, invented Recipe IDs, and additional Briefs.

| Run | JSON valid | Single final Brief | Recipe mapping | Planned status | Metrics empty | Notes |
|---:|---|---|---|---|---|---|
| 1 | No | Yes | No | No | Yes | Pre-correction response; excluded |
| 2 | No | No | N/A | N/A | N/A | Marked block missing; excluded |
| 3 | No | Yes | No | No | Yes | Pre-correction response; excluded |

Recipe agreement rate: **Not scored**

Decision: **Revise and re-test**

## Aggregate score

| Measure | Required | Actual so far | Pass |
|---|---:|---:|---|
| JSON parse rate | 100% | 100% for passed Steps 0, 2, and 3; Step 5 re-test pending | Pending |
| Step allowlist compliance | 100% | 100% for passed Steps 0, 2, and 3; Step 5 re-test pending | Pending |
| Step 2 Registry preservation | 100% | 100% within each response | Yes |
| Required/available/missing separation | 100% | 100% for passed Steps | Yes |
| Metric metadata completeness | 100% when present | Step 2 complete; Steps 3 and 5 require empty metrics | Pending |
| Unsupported recipe disclosure | 100% | No mislabel in passed Steps | Pending |
| External template recipe IDs | 0 | 0 in passed Steps | Pending |
| Primary recipe agreement | at least 80% | Step 0: 100%; Step 2: 100%; Step 3: 100%; Step 5 pending | Pending |
| Evidence invention | 0 | No blocking invention detected in passed Steps | Provisional |

## Gate 2A conclusion

- Overall result: **In progress**
- Passed Steps: **0, 2, 3**
- Re-test required: **5**
- Open prompt revision: Step 5 correction deployed, awaiting owner validation
- Schema revisions required: none currently open
- Allowlist revisions required: none currently open
- Owner approval: Steps 0, 2, and 3 approved through submitted owner test results

Gate 2B renderer work must not begin until Step 5 also passes and the owner explicitly approves the complete Gate 2A result.
