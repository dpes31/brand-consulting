import {
  buildStructuredReportPrompt,
  type StructuredFieldDefinition as BaseStructuredFieldDefinition,
  type StructuredReportPageV3,
  type StructuredReportV3,
} from './structuredReportV3';
import { parseReportHtml, serializeReportDocument } from './reportDomSafety';
import { renderSemanticReportV4 } from './semanticReportV4';

export const CREATIVE_HISTORY_STATUS_ENUM = [
  'verified-verbatim',
  'source-found-copy-unverified',
  'not-found',
] as const;

export type CreativeHistoryStatus = typeof CREATIVE_HISTORY_STATUS_ENUM[number];

export type StructuredFieldDefinition = BaseStructuredFieldDefinition & {
  enum?: string[];
  fixedYear?: number | '2026 YTD';
};

export type StructuredNormalizationWarning = {
  page: number;
  pageId: string;
  pageTitle: string;
  fieldKey: string;
  fieldLabel: string;
  inputValue: string;
  normalizedValue: CreativeHistoryStatus;
  expectedValues: string[];
  autoRecovered: true;
};

const STATUS_SET = new Set<string>(CREATIVE_HISTORY_STATUS_ENUM);
const FIXED_YEARS = [2021, 2022, 2023, 2024, 2025, '2026 YTD'] as const;
const STATUS_KEY = /^creative-history-(?:target|[1-3])\.year([1-6])\.status$/;

const DEFAULT_PAGE_TITLES: Record<string, string> = {
  'creative-history-target': '타깃 브랜드 Creative History',
  'creative-history-1': '경쟁사 1 Creative History',
  'creative-history-2': '경쟁사 2 Creative History',
  'creative-history-3': '경쟁사 3 Creative History',
};

function metadataForKey(key: string): Pick<StructuredFieldDefinition, 'enum' | 'fixedYear'> {
  const match = key.match(STATUS_KEY);
  if (!match) return {};
  const fixedYear = FIXED_YEARS[Number(match[1]) - 1];
  return {
    enum: [...CREATIVE_HISTORY_STATUS_ENUM],
    ...(fixedYear !== undefined ? { fixedYear } : {}),
  };
}

export function applyProductionReportV3Metadata(
  definitions: BaseStructuredFieldDefinition[],
): StructuredFieldDefinition[] {
  return definitions.map((definition) => ({
    ...definition,
    ...metadataForKey(definition.key),
  }));
}

function pageTitleFor(page: StructuredReportPageV3 | undefined): string {
  if (!page) return '페이지 제목 미확인';
  return page.fields?.[`${page.id}.title`]?.trim()
    || DEFAULT_PAGE_TITLES[page.id]
    || page.id;
}

function fieldLabel(definition: StructuredFieldDefinition): string {
  return `${definition.fixedYear ?? '연도 미확인'} 상태`;
}

function replaceFieldSchema(prompt: string, definitions: StructuredFieldDefinition[]): string {
  const startMarker = '[FIELD SCHEMA]\n';
  const endMarker = '\n\n[EMPTY JSON SKELETON]';
  const start = prompt.indexOf(startMarker);
  const end = prompt.indexOf(endMarker, start + startMarker.length);
  if (start < 0 || end <= start) throw new Error('Phase 6 FIELD SCHEMA 구간을 확인할 수 없습니다.');

  const schemaStart = start + startMarker.length;
  const schema = JSON.parse(prompt.slice(schemaStart, end)) as Array<{
    page: number;
    id: string;
    fields: Array<Record<string, unknown> & { key: string }>;
  }>;
  const byKey = new Map(definitions.map((definition) => [definition.key, definition]));
  schema.forEach((page) => page.fields.forEach((field) => {
    const definition = byKey.get(field.key);
    if (!definition) return;
    if (definition.enum?.length) field.enum = definition.enum;
    if (definition.fixedYear !== undefined) field.fixedYear = definition.fixedYear;
  }));

  return `${prompt.slice(0, schemaStart)}${JSON.stringify(schema, null, 2)}${prompt.slice(end)}`;
}

export function buildProductionReportV3Prompt(
  rawResearch: string,
  brandName: string,
  baseDefinitions: BaseStructuredFieldDefinition[],
  creativeDirective = '',
): { prompt: string; definitions: StructuredFieldDefinition[] } {
  const definitions = applyProductionReportV3Metadata(baseDefinitions);
  const prompt = replaceFieldSchema(
    buildStructuredReportPrompt(rawResearch, brandName, baseDefinitions, creativeDirective),
    definitions,
  );
  return { prompt, definitions };
}

export function normalizeProductionReportV3(
  report: StructuredReportV3,
  definitions: StructuredFieldDefinition[],
): { report: StructuredReportV3; warnings: StructuredNormalizationWarning[] } {
  const normalized = JSON.parse(JSON.stringify(report)) as StructuredReportV3;
  const warnings: StructuredNormalizationWarning[] = [];

  definitions.filter((definition) => definition.kind === 'status').forEach((definition) => {
    const page = normalized.pages?.[definition.page - 1];
    const value = page?.fields?.[definition.key];
    if (!page || typeof value !== 'string' || STATUS_SET.has(value.trim())) return;

    const match = value.match(/^(.*?) · (verified-verbatim|source-found-copy-unverified|not-found)$/);
    const expectedYear = definition.fixedYear;
    if (!match || expectedYear === undefined || match[1] !== String(expectedYear)) return;

    const normalizedValue = match[2] as CreativeHistoryStatus;
    const expectedValues = definition.enum?.length
      ? definition.enum
      : [...CREATIVE_HISTORY_STATUS_ENUM];
    if (!expectedValues.includes(normalizedValue)) return;

    page.fields[definition.key] = normalizedValue;
    warnings.push({
      page: definition.page,
      pageId: definition.pageId,
      pageTitle: pageTitleFor(page),
      fieldKey: definition.key,
      fieldLabel: fieldLabel(definition),
      inputValue: value,
      normalizedValue,
      expectedValues,
      autoRecovered: true,
    });
  });

  return { report: normalized, warnings };
}

export function assertProductionReportV3Statuses(
  report: StructuredReportV3,
  definitions: StructuredFieldDefinition[],
): void {
  const errors: string[] = [];
  definitions.filter((definition) => definition.kind === 'status').forEach((definition) => {
    const page = report.pages?.[definition.page - 1];
    const value = page?.fields?.[definition.key];
    if (typeof value !== 'string' || !value.trim() || STATUS_SET.has(value.trim())) return;
    const expectedValues = definition.enum?.length
      ? definition.enum
      : [...CREATIVE_HISTORY_STATUS_ENUM];
    errors.push([
      `P${definition.page} · ${pageTitleFor(page)} · ${fieldLabel(definition)}`,
      `입력값: “${value}”`,
      `허용값:\n${expectedValues.map((item) => `- ${item}`).join('\n')}`,
      '처리: 자동 복구할 수 없어 렌더링을 중단했습니다.',
    ].join('\n'));
  });

  if (errors.length) {
    throw new Error(`Creative History 입력 형식 ${errors.length}건을 수정해야 합니다.\n\n${errors.join('\n\n')}`);
  }
}

export function formatProductionReportV3Warnings(
  warnings: StructuredNormalizationWarning[],
): string {
  if (!warnings.length) return '';
  const details = warnings.map((warning) => [
    `P${warning.page} · ${warning.pageTitle}`,
    warning.fieldLabel,
    `입력값: “${warning.inputValue}”`,
    `예상값: “${warning.normalizedValue}”`,
    '처리: 앱이 연도 접두어를 제거하고 자동 정규화했습니다.',
  ].join('\n')).join('\n\n');
  return `Creative History 입력 형식 ${warnings.length}건을 앱이 자동 정규화했습니다.\n\n${details}\n\n연도는 앱이 자동 배치하므로 상태 값에는 넣지 마세요.`;
}

function applyFixedCreativeHistoryYears(html: string): string {
  const documentRef = parseReportHtml(html);
  documentRef.querySelectorAll<HTMLElement>('.full-slide[id^="creative-history"]')
    .forEach((slide) => {
      Array.from(slide.querySelectorAll<HTMLElement>('.history-card')).forEach((card, index) => {
        const year = FIXED_YEARS[index];
        const heading = card.querySelector<HTMLElement>('h3');
        if (heading && year !== undefined) heading.textContent = String(year);
      });
    });
  return serializeReportDocument(documentRef);
}

export function renderProductionReportV3(
  approvedBaseHtml: string,
  report: StructuredReportV3,
  expectedBrand: string,
  definitions: StructuredFieldDefinition[],
): string {
  assertProductionReportV3Statuses(report, definitions);
  const rendered = renderSemanticReportV4(approvedBaseHtml, report, expectedBrand);
  return applyFixedCreativeHistoryYears(rendered);
}
