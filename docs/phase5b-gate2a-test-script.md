# Phase 5B — Gate 2A Visual Intent Test Script

> This gate tests research-stage planning only. It does not test or authorize a deterministic renderer, template modification, PDF changes, PR merge, or production deployment.

## 1. Objective

Determine whether the same research evidence produces a valid and reasonably stable Visual Intent Brief before renderer development begins.

The test covers:

- Step 0 — Brand Fact Book;
- Step 2 — Competitor Strategy;
- Step 3 — Consumer Insights;
- Step 5 — Strategic Implication.

Step 4 is excluded because the Creative History Registry already has a validated six-year structure.

## 2. What to paste into the web app

Paste the **entire AI response** into the Step textarea:

```text
normal research analysis
...
<!-- VISUAL_INTENT_BRIEF_START -->
{ valid JSON }
<!-- VISUAL_INTENT_BRIEF_END -->
```

Do not paste only the JSON. The application needs the normal analysis for later research Steps and needs the start/end markers to locate the machine-readable block.

Step 2 must retain both blocks in this order:

```text
normal analysis
→ COMPETITOR_REGISTRY
→ VISUAL_INTENT_BRIEF
```

## 3. Meaning of three repeated runs

Three runs mean **three independently generated AI responses** from the same prompt and evidence conditions.

They do not mean clicking `Submit & Continue` three times with one identical response.

Correct procedure:

1. Copy the same Step prompt.
2. Ask the external AI to generate Response A.
3. Start a fresh generation or regenerate with the same prompt to obtain Response B.
4. Generate Response C in the same way.
5. Keep all three complete responses as separate TXT files.

The Preview validator rejects an exact duplicate response so that one answer cannot create a false 100% stability score.

Submitting all three through the application is optional when Step navigation makes repetition inconvenient. At least one response should pass the Preview validator; all three complete TXT responses can be provided for comparison and manual stability scoring.

## 4. Test setup

Use the same:

- brand;
- uploaded references;
- competitor seeds;
- external AI product/model;
- copied prompt.

Recommended initial brand: 비즈넵.

For each tested Step:

1. Copy the Step prompt from the Preview.
2. Run it in the same external AI product and model.
3. Paste the complete response into the application.
4. Click `Submit & Continue` once.
5. Record the validation toast.
6. Save the complete response as a TXT file.
7. Generate two additional independent responses with the unchanged prompt.

## 5. Step 0 acceptance check

Gate 2A Step 0 validates **Growth Story only**. The Visual Intent JSON should contain exactly one Growth Story brief. Brand Identity, KPI Snapshot, and Product USP remain in the normal research analysis but should not create additional Step 0 Visual Brief objects.

Mandatory Visual Brief:

- a Growth Story decision question;
- evidence type `time-change` when the evidence is event-led;
- primary recipe `milestone-timeline` when no continuous comparable KPI series exists;
- required inputs include year, event, business meaning, stage, and inflection point;
- missing time-series values are recorded rather than invented;
- `metrics` is `[]` when using `milestone-timeline`.

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

## 6. Step 2 acceptance check

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

## 7. Step 3 acceptance check

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

## 8. Step 5 acceptance check

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

## 9. Gate 2A scoring

For each Step and run, record:

| Measure | Pass rule |
|---|---|
| JSON parse | 100% |
| Step allowlist compliance | 100% |
| Registry preservation | 100% for Step 2 |
| Required/available/missing separation | 100% |
| Metric metadata completeness | 100% when metrics are used for quantitative comparison |
| Unsupported recipe disclosure | 100% |
| External template ID occurrence | 0 |
| Primary recipe stability | at least 80% across independent comparable responses |
| Evidence invention | 0 |

## 10. Gate decision

### Gate 2A pass

Proceed to Gate 2B only when:

- every tested Step has three independent valid responses;
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

## 11. Current limitations

- API-mode response acceptance is not yet blocked by the Gate 2A validator; the owner test path is the manual external-AI workflow.
- Session audit is temporary and resets with browser session storage.
- No report HTML or PDF should be generated to evaluate Gate 2A.
- No visual quality conclusion can be drawn until Gate 2B renderer work is separately approved.
