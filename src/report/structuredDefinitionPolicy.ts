import type { StructuredFieldDefinition } from './structuredReportV3';

const GENERIC_ORDER_FIELD = /\.content\d+$/;

const APP_OWNED_FIELD_PATTERNS = [
  /^consumer-exec\.shift\d+\.stage$/,
  /^consumer-target\.target\d+\.stage$/,
  /^consumer-target\.profile\d+\.label$/,
  /^portfolio\.item\d+\.stage$/,
  /^loyalty\.stage\d+\.stage$/,
  /^loyalty\.principle1$/,
  /^inflection\.gap\.(productLabel|perceptionLabel)$/,
] as const;

const MAX_LENGTH_OVERRIDES: Array<[RegExp, number]> = [
  [/^creative-trajectory\.brand\d+\.meaning$/, 22],
  [/^creative-trajectory\.brand\d+\.stage\d+$/, 52],
  [/^decision-close\.principle$/, 84],
  [/^decision-close\.support$/, 96],
  [/^jtbd\.row\d+\.(jobType|desiredProgress|currentAlternative|limitation|brandOpportunity)$/, 118],
];

const JTBD_ROLE_BY_INDEX = [
  'jobType',
  'desiredProgress',
  'currentAlternative',
  'limitation',
  'brandOpportunity',
] as const;

export function isGenericOrderField(key: string): boolean {
  return GENERIC_ORDER_FIELD.test(key);
}

export function mapStructuredFieldKey(key: string): string | null {
  if (isGenericOrderField(key)) return null;
  if (APP_OWNED_FIELD_PATTERNS.some((pattern) => pattern.test(key))) return null;

  const jtbd = key.match(/^jtbd\.row(\d+)\.field([1-5])$/);
  if (jtbd) {
    const role = JTBD_ROLE_BY_INDEX[Number(jtbd[2]) - 1];
    return role ? `jtbd.row${jtbd[1]}.${role}` : null;
  }

  const loyaltyPrinciple = key.match(/^loyalty\.principle([2-6])$/);
  if (loyaltyPrinciple) return `loyalty.principle${Number(loyaltyPrinciple[1]) - 1}`;

  const inflectionPeriod = key.match(/^inflection\.stage(\d+)\.type$/);
  if (inflectionPeriod) return `inflection.stage${inflectionPeriod[1]}.period`;

  return key;
}

function applyLengthPolicy(definition: StructuredFieldDefinition): StructuredFieldDefinition {
  const override = MAX_LENGTH_OVERRIDES.find(([pattern]) => pattern.test(definition.key));
  return override
    ? { ...definition, maxLength: Math.min(definition.maxLength, override[1]) }
    : definition;
}

export function applyStructuredDefinitionPolicy(
  definitions: StructuredFieldDefinition[],
): StructuredFieldDefinition[] {
  const generic = definitions.filter((definition) => isGenericOrderField(definition.key));
  if (generic.length) {
    throw new Error(
      `순번 기반 일반 필드는 Phase 6에서 허용되지 않는다: ${generic
        .slice(0, 8)
        .map((definition) => definition.key)
        .join(', ')}`,
    );
  }

  const mapped = definitions.flatMap((definition) => {
    const key = mapStructuredFieldKey(definition.key);
    if (!key) return [];
    return [applyLengthPolicy({ ...definition, key })];
  });

  const keys = mapped.map((definition) => definition.key);
  if (new Set(keys).size !== keys.length) {
    throw new Error('Phase 6 의미 필드 정책 적용 후 중복 키가 발생했다.');
  }

  return mapped;
}
