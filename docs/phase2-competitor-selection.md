# Phase 2 — Competitor Selection Pipeline

## Locked policy

- User-entered competitors are mandatory review seeds, not automatic selections.
- AI must also discover overlooked market threats.
- Indirect competitor classification is removed.
- Final detailed competitors: minimum 2, maximum 5.
- Do not fill five slots when only two or three threats are valid.
- Ranking criteria: market penetration 25, growth 20, consumer preference/usage 20, campaign aggression 15, inflection-point fit 15, evidence confidence 5.

## Registry contract

Step 2 must end with a JSON block between:

- `<!-- COMPETITOR_REGISTRY_START -->`
- `<!-- COMPETITOR_REGISTRY_END -->`

The registry locks the selected competitor names and ranking for Consumer, Creative History, and Strategy prompts.

## Backward compatibility

- Existing projects without a Registry remain readable.
- Loading or resetting a project with no Registry restores legacy downstream prompts.
- No stored project schema migration is required in Phase 2.

## Acceptance criteria

1. UI label reads `필수 검토 경쟁사`.
2. Step 2 prompt removes Indirect Competitor and explains threat-ranked Top 2~5 selection.
3. User-specified candidates may be excluded with a reason.
4. AI-discovered candidates may outrank user-specified candidates.
5. Step 4 prompt contains the exact locked selected list from Step 2.
6. Step 4 cannot silently omit, replace, or add core competitors.
7. Existing projects open without errors.
8. Phase 1 16:9 PDF and layout safety remain intact.
