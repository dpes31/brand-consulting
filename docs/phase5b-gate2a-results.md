# Phase 5B — Gate 2A Test Results

> This document is a test log. Renderer quality is outside Gate 2A.

## Test conditions

- Brand: 비즈넵
- External AI product/model: GPT, three independent sessions per Step
- Reference files: same uploaded references per repeated Step run
- Test period: 2026-06-23 to 2026-06-25
- Tester: owner

## Step 0 — Brand Fact Book

| Run | JSON valid | Growth Story Recipe | Agreement |
|---:|---|---|---|
| 1 | Yes | milestone-timeline | Baseline |
| 2 | Yes | milestone-timeline | 100% across 2 runs |
| 3 | Yes | milestone-timeline | 100% across 3 runs |

Decision: **Pass**

## Step 2 — Competitor Strategy

| Run | JSON valid | Ranking | Deep Dive coverage | Product Matrix | Metric contract | Required-role agreement |
|---:|---|---|---|---|---|---|
| 1 | Yes | rank-scorecard | 4/4 | feature-matrix | Complete | Baseline |
| 2 | Yes | rank-scorecard | 3/3 | feature-matrix | Complete | 100% across 2 runs |
| 3 | Yes | rank-scorecard | 3/3 | feature-matrix | Complete | 100% across 3 runs |

Positioning Map appeared in all three responses and was reported separately as optional.

Decision: **Pass**

## Step 3 — Consumer Insights

Test 1 failed because downstream prompt rebuilding removed the Visual Intent contract. Those responses are excluded.

### Test 2

| Run | JSON valid | Single core Brief | Primary Recipe | Planned | Metrics empty | Agreement |
|---:|---|---|---|---|---|---|
| 1 | Yes | Yes | friction-flow | Yes | Yes | Baseline |
| 2 | Yes | Yes | friction-flow | Yes | Yes | 100% across 2 runs |
| 3 | Yes | Yes | friction-flow | Yes | Yes | 100% across 3 runs |

Decision: **Pass**

## Step 5 — Strategic Implication

Test 1 failed because Creative History and locked-context rebuilding removed the Visual Intent contract. Those responses are excluded.

### Test 2

| Run | JSON valid | Single final Brief | Evidence Type | Primary Recipe | Planned | Metrics empty | Agreement |
|---:|---|---|---|---|---|---|---|
| 1 | Yes | Yes | strategic-choice | choice-architecture | Yes | Yes | Baseline |
| 2 | Yes | Yes | strategic-choice | choice-architecture | Yes | Yes | 100% across 2 runs |
| 3 | Yes | Yes | strategic-choice | choice-architecture | Yes | Yes | 100% across 3 runs |

All three responses retained SWOT, GAP, Root Cause, three ToT routes, Big IdeaL, Winning Move, Via Negativa, Pre-mortem, and execution sequence in the normal analysis while limiting Visual Intent to one final strategy-decision Brief.

Decision: **Pass**

## Aggregate result

| Measure | Required | Actual | Pass |
|---|---:|---:|---|
| JSON parse | 100% | 100% across accepted runs | Yes |
| Step allowlist compliance | 100% | 100% | Yes |
| Step 2 Registry preservation | 100% | 100% within each response | Yes |
| Required/available/missing separation | 100% | 100% | Yes |
| Metric contract | 100% when present | 100% | Yes |
| Other-Step Recipe occurrence | 0 | 0 in accepted runs | Yes |
| Primary Recipe stability | at least 80% | 100% in Steps 0, 2, 3, and 5 | Yes |
| Evidence invention | 0 | No blocking invention detected | Provisional pass |

## Gate 2A conclusion

- Overall result: **PASS**
- Passed Steps: **0, 2, 3, 5**
- Prompt revisions currently open: none
- Schema revisions currently open: none
- Allowlist revisions currently open: none
- Gate 2B status: **not started**

Gate 2B renderer work requires explicit owner approval and a separately bounded implementation scope. No merge or production deployment is authorized by this result.
