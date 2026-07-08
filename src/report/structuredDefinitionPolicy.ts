import type { StructuredFieldDefinition } from './structuredReportV3';

const MAX_LENGTH_OVERRIDES: Array<[RegExp, number]> = [
  [/^creative-trajectory\.brand\d+\.meaning$/, 48],
  [/^creative-trajectory\.brand\d+\.stage\d+$/, 52],
  [/^decision-close\.principle$/, 84],
  [/^decision-close\.support$/, 96],
];

export function applyStructuredDefinitionPolicy(
  definitions: StructuredFieldDefinition[],
): StructuredFieldDefinition[] {
  return definitions.map((definition) => {
    const override = MAX_LENGTH_OVERRIDES.find(([pattern]) => pattern.test(definition.key));
    return override
      ? { ...definition, maxLength: Math.min(definition.maxLength, override[1]) }
      : definition;
  });
}
