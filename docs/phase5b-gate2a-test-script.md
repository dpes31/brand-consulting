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

Mandatory Visual Brief coverage and exact mapping:

- Threat Ranking exactly one: `priority-ranking` → `rank-scorecard`;
- one independent Deep Dive per `COMPETITOR_REGISTRY.selected` competitor: `causal-relationship` → `competitor-threat-system`;
- Product Matrix exactly one: `competitive-space` → `feature-matrix`;
- optional Positioning Map, only with two defensible common axes: `competitive-space` → `positioning-map`;
- if evidence for a required role is insufficient: `evidence-gap` → `evidence-gap`.

Deep Dive expected structure:

```text
Evidence → Core Desire → Appeal → Threat Mechanism → Attack Point
```

Deep Dive validator rules:

- do not combine multiple competitors into one Deep Dive Brief;
- each Deep Dive `entities` array contains exactly one selected competitor name;
- the entity name must match the Competitor Registry exactly;
- every selected competitor appears in exactly one Deep Dive Brief;
- Registry-external competitors cannot receive a core Deep Dive.

Product Matrix and Positioning Map rules:

- use the investigated brand and locked selected competitors only;
- use common axes that apply to all compared brands;
- do not invent product scores or positioning axes;
- omit Positioning Map when two defensible axes do not exist.

Step 2 Metric contract:

- use `metrics: []` when a Brief does not need a number;
- when metrics are present, every Metric must contain `metricId`, `label`, numeric `value`, `unit`, `period`, `denominator`, `sourceLabel`, and `verificationStatus`;
- `denominator` is `null` when there is no comparison base;
- `sourceLabel` uses source name, document title, and year—not a raw URL;
- allowed `verificationStatus` values are `verified`, `partially-verified`, and `unverified`;
- official statistics, filings, or government-source figures may be `verified`;
- company-announced figures and transparent analyst scores are `partially-verified`;
- unsupported or uncorroborated estimates are `unverified`;
- incomplete Step 2 Metric objects block submission instead of being silently discarded.

Step 2 stability scoring:

- compare the required role recipes only: Threat Ranking, Deep Dive, and Product Matrix;
- ignore how many selected competitors exist and therefore how many Deep Dive Briefs are repeated;
- report Positioning Map participation separately because it is optional;
- different selected-competitor counts must not lower the required-role agreement score when role decisions are identical.

Pass recipes:

- `rank-scorecard` — planned;
- `competitor-threat-system` — pilot-supported;
- `feature-matrix` — pilot-supported;
- `positioning-map` — planned;
- `evidence-gap` — planned/unsupported as declared by the contract.

Fail examples:

- a competitor outside the locked Registry receives a core Deep Dive brief;
- all competitors are combined into one generic brief;
- Threat Ranking uses `competitor-threat-system` instead of `rank-scorecard`;
- evidenceType aliases such as `rank-comparison`, `feature-comparison`, or `spatial-positioning` are used;
- matrix axes differ by competitor;
- product scores are invented;
- a Metric uses `name` instead of `metricId` and `label`;
- a Metric uses a free-form verification value such as `company-reported` or `analyst-scored`;
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
| Metric metadata completeness | 100% when metrics are used |
| Unsupported recipe disclosure | 100% |
| External template ID occurrence | 0 |
| Primary recipe stability | at least 80% across independent comparable responses |
| Evidence invention | 0 |

For Step 2, primary-recipe stability means agreement across the required roles—not equality of the total repeated Deep Dive count. Positioning Map is monitored separately.

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
