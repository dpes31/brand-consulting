# Phase 5B — Gate 1.5 Pilot Specification

> Status: specification only. No renderer, runtime integration, prompt mutation, PR, or Vercel Preview is authorized in Gate 1.5.

## 1. Purpose

Phase 5B replaces prompt-only visualization with a staged, deterministic slide system. The immediate goal is not to redesign all report pages. The goal is to freeze the data contract, recipe-selection rules, pilot recipe requirements, validation criteria, feature-flag behavior, and rollback path before any renderer code is written.

The owner-approved working principle is:

```text
Research response
→ Step-level Visual Intent Brief
→ Phase 6 Semantic Slide Plan
→ constrained Recipe Router
→ deterministic HTML/CSS/SVG Renderer
→ blocking Validator
→ existing 16:9 PDF Export
```

External reference libraries such as Umbrex and EdrawMax inform structural patterns only. The application uses internal recipe IDs and never depends on an external template name, template number, or copied proprietary artwork.

## 2. Gate 1.5 scope

### Included

- Visual Intent Brief JSON Schema.
- Step-by-step Recipe Selection Matrix.
- Machine-readable schemas for three initial recipes:
  - `milestone-timeline`;
  - `competitor-threat-system`;
  - `feature-matrix`.
- Pilot success and failure criteria.
- Feature-flag contract.
- Backward-compatibility and rollback plan.
- Documentation continuity updates.

### Explicitly excluded

- No renderer implementation.
- No changes to Step 0–5 prompts.
- No Phase 6 compiler changes.
- No modification of `template.html`.
- No runtime Validator implementation.
- No PDF Export changes.
- No Draft PR.
- No intentional Vercel deployment or Preview validation.
- No merge to `main` or any validated feature branch.

## 3. Baseline and branch policy

- Repository: `dpes31/brand-consulting`.
- Validated base branch: `feature-creative-history-contract-v1`.
- Specification branch: `feature-visual-recipe-pilot-v1`.
- The failed Phase 5 branch `feature-visualization-engine-v1` and Draft PR #6 remain untouched for audit and comparison.
- The rollback branch `backup-production-stable-20260622` remains untouched.

## 4. Visual Intent Brief contract

Each research step may eventually append one machine-readable `visualBriefs` collection to its normal analytical response. Gate 1.5 defines the contract only; Gate 2A will test whether models can produce it reliably.

A Visual Intent Brief describes the intended communication structure, not final HTML or CSS.

Required concepts:

- stable `insightId`;
- research step and report section;
- decision question;
- evidence type;
- core message;
- primary internal recipe ID;
- one fallback recipe at most;
- selection reason;
- required, available, and missing inputs;
- evidence confidence;
- verification status of any metrics;
- preferred slide target where known.

The AI must not output external template names as executable instructions. External references may appear only as non-binding pattern notes.

## 5. Step-level recipe constraints

Recipe selection is constrained by research step. The model does not choose from an unrestricted global catalog.

| Step | Primary information function | Allowed primary recipes | Allowed fallback recipes |
|---|---|---|---|
| Step 0 — Brand Fact | time change, growth stages, brand essence | `milestone-timeline`, `growth-trajectory`, `before-after` | `evidence-gap` |
| Step 1 — Market | comparable metrics, inflection, market structure | `kpi-trend-bridge`, `rank-scorecard`, `milestone-timeline`, `system-map` | `evidence-gap` |
| Step 2 — Competitor | threat rank, causal threat, comparison, position | `rank-scorecard`, `competitor-threat-system`, `feature-matrix`, `positioning-map` | `evidence-gap` |
| Step 3 — Consumer | sequential journey, friction, needs | `customer-journey`, `friction-flow`, `needs-hierarchy` | `evidence-gap` |
| Step 4 — Creative | six-year message trajectory | `creative-message-trajectory` | `evidence-gap` |
| Step 5 — Strategy | choice, transformation, execution sequence | `choice-architecture`, `as-is-to-be`, `swot-to-strategy`, `roadmap` | `evidence-gap` |

During the first implementation pilot, only three recipes are renderable. Non-pilot recipe IDs may be recorded as `planned` but must not be silently rendered with a generic card wall.

## 6. Pilot recipe priority

### 6.1 `milestone-timeline`

Use for Brand Fact Book Growth Story when the evidence is event- and inflection-led rather than a consistent quantitative series.

Target problem:

- year-by-year prose;
- no stage distinction;
- weak understanding of inflection points;
- excessive chronology inside a text box.

### 6.2 `competitor-threat-system`

Use for each selected competitor Deep Dive.

Required reading flow:

```text
Evidence → Core Desire → Appeal → Dominant Threat Mechanism → Attack Point
```

Target problem:

- arbitrary box size;
- no visual hierarchy;
- no causal reading path;
- repeated overflow in dynamic competitor slides.

### 6.3 `feature-matrix`

Use for Product Matrix when the comparison axes and cell values are commensurable.

Target problem:

- prose disguised as a table;
- light-surface/dark-theme contrast failures;
- arbitrary brand colors;
- inability to scan row and column patterns.

## 7. Gate 2 sequence after approval

Gate 1.5 approval does not authorize full implementation. The next sequence is:

### Gate 2A — Visual Intent production test

- Add the Visual Intent contract to selected research prompts only.
- Test Step 0, Step 2, Step 3, and Step 5 with the same brand two or three times.
- Measure schema validity, recipe stability, missing-input detection, and unsupported-recipe frequency.
- Do not implement renderers in Gate 2A.

### Gate 2B — Three-recipe deterministic renderer

Only after Gate 2A passes:

- implement `milestone-timeline`;
- implement `competitor-threat-system`;
- implement `feature-matrix`;
- enable them only behind the pilot feature flag;
- retain the existing report shell and PDF Export.

### Gate 2C — Consumer and Strategy expansion

Only after the first three recipes pass owner Preview validation:

- add `customer-journey`;
- add `friction-flow`;
- add `strategy-choice`;
- add `evidence-gap`.

## 8. Pilot acceptance criteria

### 8.1 Visual Intent success

Gate 2A passes only when all conditions are met across repeated tests:

1. JSON parses against `design/visual-intent.schema.json`.
2. Every brief uses an allowed recipe for its step.
3. External template names are not used as executable recipe IDs.
4. Primary and fallback recipes are not identical.
5. Required, available, and missing inputs are explicitly separated.
6. Quantitative evidence records value, unit, period, source label, and verification state.
7. Same evidence pattern selects the same primary recipe in at least 80% of repeated runs.
8. Unsupported recipes are marked `planned` or `unsupported`; they are never mapped to a generic box layout.
9. The Visual Intent does not rewrite or invent research evidence.
10. Existing Competitor and Creative History registries remain intact.

### 8.2 Visual Intent failure

Gate 2A fails when any of the following occurs:

- malformed or incomplete JSON;
- an unrestricted or fabricated external template name is used as `recipeId`;
- a recipe is selected outside the step allowlist;
- missing evidence is represented as verified evidence;
- mixed units are proposed for one chart axis;
- a quantitative recipe is selected with no comparable data;
- repeated runs select materially different primary recipes for the same evidence pattern more than 20% of the time;
- Step 2 competitor names diverge from the locked Registry;
- Step 4 copy-verification status is altered.

### 8.3 Renderer success

Gate 2B passes only when all conditions are met:

1. Pilot slides preserve wrapper and slide IDs.
2. The slide body is rendered by an approved recipe, not AI-authored layout CSS.
3. No arbitrary inline hex, RGB, or HSL colors exist in generated pilot markup.
4. Text contrast meets the blocking threshold.
5. No pilot slide overflows the 1280×720 logical canvas.
6. Equal-hierarchy comparison elements use equal grid tracks.
7. Required `data-recipe-id` and `data-viz-type` attributes exist.
8. Metrics displayed graphically are verified and unit-compatible.
9. Existing 23-page and 31-page reports still open.
10. Existing 960×540 PDF Export remains unchanged and exports every page.

### 8.4 Renderer failure

Gate 2B fails when any of the following occurs:

- legacy generic card wall is used to hide an invalid recipe;
- contrast or overflow errors are downgraded to warnings;
- the renderer modifies competitor selection, Creative History facts, or page-budget rules;
- PDF Export or page count regresses;
- feature flag off does not restore the legacy Phase 4 behavior;
- renderer failure silently falls back for a newly generated recipe report.

## 9. Feature flag contract

The planned runtime flag is:

```text
visualRecipePilot
```

Gate 1.5 defines the behavior but does not implement it.

| Context | Flag state | Expected behavior |
|---|---:|---|
| Existing saved report without recipe manifest | absent/off | Open with Phase 4 legacy rendering |
| New pilot report during owner testing | on | Apply deterministic rendering only to supported pilot slides |
| New report with unsupported recipe | on | Show validation error; do not silently use a generic layout |
| PDF Export with blocking validation error | any | Block export and show page-specific errors |
| Production before owner approval | off | Preserve current production behavior |

The flag must be readable from a single typed configuration source. It must not be inferred from URL fragments, DOM class names, or branch names.

## 10. Backward compatibility

- Existing 23-page report HTML remains readable without conversion.
- Existing dynamic 23–40 page reports retain Page Manifest and Appendix behavior.
- Step 2 Competitor Registry remains the only source for selected competitors.
- Step 4 Creative History Registry remains the only source for verified campaign history.
- The pilot system must not change `public/template.html` in its first implementation.
- Pilot rendering should replace only approved slide-body regions after schema validation.
- Navigation and second-export cache regressions remain Phase 6 defects and are not expanded into Gate 1.5.

## 11. Rollback plan

### Before renderer implementation

Gate 1.5 consists only of documentation and schema files on a branch created from the validated Phase 4 base. Rollback is achieved by deleting or closing the specification branch. No production or validated branch changes are required.

### During Gate 2A

If Visual Intent production is unstable:

- remove or disable only the Visual Intent prompt appendix;
- keep Phase 4 research outputs and registries unchanged;
- do not proceed to renderer implementation.

### During Gate 2B

If renderer validation fails:

- keep `visualRecipePilot` off by default;
- existing reports continue using the Phase 4 path;
- discard the pilot branch or revert its additive commits;
- do not modify or delete the failed Phase 5 branch because it remains an audit reference.

### Production rollback

No Phase 5B code reaches `main` without owner-approved Preview validation and a separate Phase 6 integration decision. Existing production rollback remains `backup-production-stable-20260622`.

## 12. Approval boundary

Approval of this specification authorizes Gate 2A only: prompt-contract testing for Visual Intent Briefs. It does not authorize renderer code, Vercel Preview, PR merge, production deployment, or broad template replacement.
