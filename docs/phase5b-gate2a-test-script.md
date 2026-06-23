# Phase 5B — Gate 2A Visual Intent Test Script

> This gate tests research-stage planning only. It does not test or authorize a deterministic renderer, template modification, PDF changes, PR merge, or Vercel Preview.

## 1. Objective

Determine whether the same research evidence produces a valid and reasonably stable Visual Intent Brief before renderer development begins.

The test covers:

- Step 0 — Brand Fact Book;
- Step 2 — Competitor Strategy;
- Step 3 — Consumer Insights;
- Step 5 — Strategic Implication.

Step 4 is excluded because the Creative History Registry already has a validated six-year structure.

## 2. Required output markers

Each tested response must contain:

```text
<!-- VISUAL_INTENT_BRIEF_START -->
{ valid JSON }
<!-- VISUAL_INTENT_BRIEF_END -->
```

Step 2 must retain both blocks in this order:

```text
normal analysis
→ COMPETITOR_REGISTRY
→ VISUAL_INTENT_BRIEF
```

## 3. Test setup

Use the same brand, same uploaded references, same competitor seeds, and same prompt for repeated runs.

Recommended initial brand: 비즈넵.

For each tested Step:

1. Copy the Step prompt.
2. Run it in the same external AI product and model.
3. Paste the complete response into the application.
4. Click `Submit & Continue`.
5. Record the validation toast.
6. Repeat the same Step prompt three times without changing the evidence inputs.

The application stores up to 30 Gate 2A validation entries in session storage and displays the recent recipe-agreement rate after a valid submission.

## 4. Step 0 acceptance check

Mandatory Visual Brief:

- a Growth Story decision question;
- evidence type `time-change` when the evidence is event-led;
- primary recipe `milestone-timeline` when no continuous comparable KPI series exists;
- required inputs include year, event, business meaning, stage, and inflection point;
- missing time-series values are recorded rather than invented.

Pass example:

```text
Primary: milestone-timeline
Fallback: evidence-gap
Implementation: pilot-supported
```

Fail examples:

- using an external template name as the recipe ID;
- selecting growth-trajectory from one isolated metric;
- no missing-input disclosure;
- chronology expressed only as prose with no Visual Intent block.

## 5. Step 2 acceptance check

Mandatory Visual Brief coverage:

- threat-ranking overview;
- one Deep Dive brief per selected competitor;
- Product Matrix brief;
- optional Positioning Map brief when two defensible axes exist.

Deep Dive expected structure:

```text
Evidence → Core Desire → Appeal → Threat Mechanism → Attack Point
```

The selected competitor names must match the Step 2 Competitor Registry.

Pass recipes:

- `rank-scorecard` — planned;
- `competitor-threat-system` — pilot-supported;
- `feature-matrix` — pilot-supported;
- `positioning-map` — planned;
- `evidence-gap` — planned/unsupported as declared by the contract.

Fail examples:

- a competitor outside the locked Registry receives a core Deep Dive brief;
- all competitors are combined into one generic brief;
- matrix axes differ by competitor;
- product scores are invented;
- Competitor Registry is missing or placed after the Visual Intent final block.

## 6. Step 3 acceptance check

Recipe selection logic:

- sequential customer behavior → `customer-journey`;
- abandonment or friction concentration → `friction-flow`;
- ordered need levels → `needs-hierarchy`;
- insufficient behavioral evidence → `evidence-gap`.

Fail examples:

- emotions or behaviors invented without research support;
- selecting a journey when no stable sequence exists;
- using four generic persona cards as a recipe description;
- marking a planned recipe as `pilot-supported`.

## 7. Step 5 acceptance check

The brief must identify the primary decision structure:

- alternatives and trade-offs → `choice-architecture`;
- current-to-target transformation → `as-is-to-be`;
- diagnosis-to-action synthesis → `swot-to-strategy`;
- validated execution sequence → `roadmap`;
- insufficient strategy evidence → `evidence-gap`.

Fail examples:

- SWOT four boxes treated as the final answer;
- roadmap selected without sequencing evidence;
- Winning Move disconnected from Root Cause;
- no explicit missing inputs for cost, owner, timing, or trade-off evidence.

## 8. Gate 2A scoring

For each Step and run, record:

| Measure | Pass rule |
|---|---|
| JSON parse | 100% |
| Step allowlist compliance | 100% |
| Registry preservation | 100% for Step 2 |
| Required/available/missing separation | 100% |
| Metric metadata completeness | 100% when metrics exist |
| Unsupported recipe disclosure | 100% |
| External template ID occurrence | 0 |
| Primary recipe stability | at least 80% across comparable runs |
| Evidence invention | 0 |

## 9. Gate decision

### Gate 2A pass

Proceed to Gate 2B only when:

- every tested Step completes three valid runs;
- no Registry or factuality regression occurs;
- comparable evidence produces at least 80% primary-recipe agreement;
- the owner approves the actual outputs.

### Gate 2A fail

Do not implement renderers. Adjust only:

- the Visual Intent Schema;
- Step allowlists;
- prompt examples;
- validation rules.

Repeat the failed Step until the contract stabilizes.

## 10. Current limitations

- API-mode response acceptance is not yet blocked by the Gate 2A validator; the owner test path is the manual external-AI workflow.
- Session audit is temporary and resets with browser session storage.
- No report HTML or PDF should be generated to evaluate Gate 2A.
- No visual quality conclusion can be drawn until Gate 2B renderer work is separately approved.
