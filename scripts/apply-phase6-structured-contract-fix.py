from pathlib import Path

PATH = Path('src/report/structuredReportV3.ts')
text = PATH.read_text(encoding='utf-8')


def replace_once(old: str, new: str) -> None:
    global text
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f'expected one match, found {count}: {old[:100]!r}')
    text = text.replace(old, new, 1)


replace_once(
"""export type StructuredFieldDefinition = {
  key: string;
  page: number;
  pageId: string;
  hint: string;
  maxLength: number;
  kind: StructuredFieldKind;
};""",
"""export type StructuredFieldDefinition = {
  key: string;
  page: number;
  pageId: string;
  hint: string;
  maxLength: number;
  kind: StructuredFieldKind;
  enum?: string[];
  fixedYear?: number | '2026 YTD';
};""",
)

replace_once(
"""const TEXT_CANDIDATE_SELECTOR = 'h1,h2,h3,h4,p,li,strong,b,span,small,blockquote,th,td,em';
const ALLOWED_CREATIVE_STATUS = new Set(['verified-verbatim', 'source-found-copy-unverified', 'not-found']);""",
"""export const CREATIVE_HISTORY_STATUS_VALUES = [
  'verified-verbatim',
  'source-found-copy-unverified',
  'not-found',
] as const;

const TEXT_CANDIDATE_SELECTOR = 'h1,h2,h3,h4,p,li,strong,b,span,small,blockquote,th,td,em';
const ALLOWED_CREATIVE_STATUS = new Set<string>(CREATIVE_HISTORY_STATUS_VALUES);""",
)

replace_once(
"""function registerField(
  element: Element | null,
  key: string,
  hint: string,
  maxLength = 160,
  kind: StructuredFieldKind = 'text',
): void {
  if (!element) return;
  if (element.hasAttribute('data-report-field')) return;
  element.setAttribute('data-report-field', key);
  element.setAttribute('data-report-hint', hint);
  element.setAttribute('data-report-max-length', String(maxLength));
  element.setAttribute('data-report-kind', kind);
}""",
"""function registerField(
  element: Element | null,
  key: string,
  hint: string,
  maxLength = 160,
  kind: StructuredFieldKind = 'text',
  metadata: Pick<StructuredFieldDefinition, 'enum' | 'fixedYear'> = {},
): void {
  if (!element) return;
  if (element.hasAttribute('data-report-field')) return;
  element.setAttribute('data-report-field', key);
  element.setAttribute('data-report-hint', hint);
  element.setAttribute('data-report-max-length', String(maxLength));
  element.setAttribute('data-report-kind', kind);
  if (metadata.enum?.length) element.setAttribute('data-report-enum', metadata.enum.join('|'));
  if (metadata.fixedYear !== undefined) element.setAttribute('data-report-fixed-year', String(metadata.fixedYear));
}""",
)

replace_once(
"""function annotateHistory(slide: HTMLElement): void {
  registerField(slide.querySelector('.history-governing'), `${slide.id}.governing`, 'Creative History evidence rule', 130);
  Array.from(slide.querySelectorAll<HTMLElement>('.history-card')).forEach((card, index) => {
    markFixed(card.querySelector('h3'), String(2021 + index));
    registerField(card.querySelector('.history-status'), `${slide.id}.year${index + 1}.status`, `Creative History ${2021 + index} status`, 36, 'status');
    registerField(card.querySelector('h4'), `${slide.id}.year${index + 1}.campaign`, `Creative History ${2021 + index} campaign`, 70);
    registerField(card.querySelector('blockquote'), `${slide.id}.year${index + 1}.copy`, `Creative History ${2021 + index} verified copy or evidence-gap wording`, 130, 'rich');
    registerField(card.querySelector('.history-detail'), `${slide.id}.year${index + 1}.detail`, `Creative History ${2021 + index} model channel and meaning`, 120);
  });
  const bottoms = slide.querySelectorAll<HTMLElement>('.history-bottom > div');
  markFixed(bottoms[0]?.querySelector('span') || null, 'MESSAGE TRAJECTORY');
  registerField(bottoms[0]?.querySelector('strong') || null, `${slide.id}.trajectory`, 'six-year message trajectory', 200);
  markFixed(bottoms[1]?.querySelector('span') || null, 'STRATEGIC SO WHAT');
  registerField(bottoms[1]?.querySelector('strong') || null, `${slide.id}.strategicSoWhat`, 'Creative History strategic implication', 200, 'rich');
}""",
"""function annotateHistory(slide: HTMLElement): void {
  const fixedYears = [2021, 2022, 2023, 2024, 2025, '2026 YTD'] as const;
  registerField(slide.querySelector('.history-governing'), `${slide.id}.governing`, 'Creative History evidence rule', 130);
  Array.from(slide.querySelectorAll<HTMLElement>('.history-card')).forEach((card, index) => {
    const fixedYear = fixedYears[index];
    if (fixedYear === undefined) return;
    markFixed(card.querySelector('h3'), String(fixedYear));
    registerField(
      card.querySelector('.history-status'),
      `${slide.id}.year${index + 1}.status`,
      `Creative History ${fixedYear} status`,
      36,
      'status',
      { enum: [...CREATIVE_HISTORY_STATUS_VALUES], fixedYear },
    );
    registerField(card.querySelector('h4'), `${slide.id}.year${index + 1}.campaign`, `Creative History ${fixedYear} campaign`, 70);
    registerField(card.querySelector('blockquote'), `${slide.id}.year${index + 1}.copy`, `Creative History ${fixedYear} verified copy or evidence-gap wording`, 130, 'rich');
    registerField(card.querySelector('.history-detail'), `${slide.id}.year${index + 1}.detail`, `Creative History ${fixedYear} model channel and meaning`, 120);
  });
  const bottoms = slide.querySelectorAll<HTMLElement>('.history-bottom > div');
  markFixed(bottoms[0]?.querySelector('span') || null, 'MESSAGE TRAJECTORY');
  registerField(bottoms[0]?.querySelector('strong') || null, `${slide.id}.trajectory`, 'six-year message trajectory', 200);
  markFixed(bottoms[1]?.querySelector('span') || null, 'STRATEGIC SO WHAT');
  registerField(bottoms[1]?.querySelector('strong') || null, `${slide.id}.strategicSoWhat`, 'Creative History strategic implication', 200, 'rich');
}""",
)

replace_once(
"""  documentRef.querySelectorAll('[data-report-field],[data-report-hint],[data-report-max-length],[data-report-kind],[data-report-fixed],[data-report-fixed-leading]').forEach((node) => {
    ['data-report-field', 'data-report-hint', 'data-report-max-length', 'data-report-kind', 'data-report-fixed', 'data-report-fixed-leading'].forEach((name) => node.removeAttribute(name));
  });""",
"""  documentRef.querySelectorAll('[data-report-field],[data-report-hint],[data-report-max-length],[data-report-kind],[data-report-enum],[data-report-fixed-year],[data-report-fixed],[data-report-fixed-leading]').forEach((node) => {
    ['data-report-field', 'data-report-hint', 'data-report-max-length', 'data-report-kind', 'data-report-enum', 'data-report-fixed-year', 'data-report-fixed', 'data-report-fixed-leading'].forEach((name) => node.removeAttribute(name));
  });""",
)

replace_once(
"""    definitions.push({
      key: element.dataset.reportField || '',
      page: Number(slide.dataset.page),
      pageId: slide.id,
      hint: element.dataset.reportHint || '',
      maxLength: Number(element.dataset.reportMaxLength || 140),
      kind: (element.dataset.reportKind || 'text') as StructuredFieldKind,
    });""",
"""    const enumValues = (element.dataset.reportEnum || '').split('|').filter(Boolean);
    const fixedYearRaw = element.dataset.reportFixedYear;
    let fixedYear: StructuredFieldDefinition['fixedYear'];
    if (fixedYearRaw === '2026 YTD') fixedYear = '2026 YTD';
    else if (fixedYearRaw && Number.isFinite(Number(fixedYearRaw))) fixedYear = Number(fixedYearRaw);
    definitions.push({
      key: element.dataset.reportField || '',
      page: Number(slide.dataset.page),
      pageId: slide.id,
      hint: element.dataset.reportHint || '',
      maxLength: Number(element.dataset.reportMaxLength || 140),
      kind: (element.dataset.reportKind || 'text') as StructuredFieldKind,
      ...(enumValues.length ? { enum: enumValues } : {}),
      ...(fixedYear !== undefined ? { fixedYear } : {}),
    });""",
)

replace_once(
"""    fields: pageDefinitions(definitions, id).map(({ key, hint, maxLength, kind }) => ({ key, hint, maxLength, kind })),""",
"""    fields: pageDefinitions(definitions, id).map(({ key, hint, maxLength, kind, enum: enumValues, fixedYear }) => ({
      key,
      hint,
      maxLength,
      kind,
      ...(enumValues?.length ? { enum: enumValues } : {}),
      ...(fixedYear !== undefined ? { fixedYear } : {}),
    })),""",
)

marker = "function validatePersonaTitleConsistency(report: StructuredReportV3, errors: string[]): void {"
if text.count(marker) != 1:
    raise RuntimeError('normalization insertion marker mismatch')
helpers = """export type StructuredNormalizationWarning = {
  page: number;
  pageId: string;
  pageTitle: string;
  fieldKey: string;
  fieldLabel: string;
  inputValue: string;
  normalizedValue: string;
  expectedValues: string[];
  autoRecovered: true;
};

const CREATIVE_HISTORY_PAGE_TITLES: Record<string, string> = {
  'creative-history-target': '타깃 브랜드 Creative History',
  'creative-history-1': '경쟁사 1 Creative History',
  'creative-history-2': '경쟁사 2 Creative History',
  'creative-history-3': '경쟁사 3 Creative History',
};

function pageTitleFor(page: StructuredReportPageV3 | undefined): string {
  if (!page) return '페이지 제목 미확인';
  return page.fields?.[`${page.id}.title`]?.trim()
    || CREATIVE_HISTORY_PAGE_TITLES[page.id]
    || page.id;
}

function statusFieldLabel(definition: StructuredFieldDefinition): string {
  return `${definition.fixedYear ?? '연도 미확인'} 상태`;
}

export function normalizeStructuredReportV3(
  report: StructuredReportV3,
  definitions: StructuredFieldDefinition[],
): { report: StructuredReportV3; warnings: StructuredNormalizationWarning[] } {
  const normalized = JSON.parse(JSON.stringify(report)) as StructuredReportV3;
  const warnings: StructuredNormalizationWarning[] = [];

  definitions.filter((definition) => definition.kind === 'status').forEach((definition) => {
    const page = normalized.pages?.[definition.page - 1];
    const value = page?.fields?.[definition.key];
    if (!page || typeof value !== 'string' || ALLOWED_CREATIVE_STATUS.has(value.trim())) return;
    const expectedValues = definition.enum?.length ? definition.enum : [...CREATIVE_HISTORY_STATUS_VALUES];
    const match = value.match(/^(.*?) · (verified-verbatim|source-found-copy-unverified|not-found)$/);
    if (!match || definition.fixedYear === undefined || match[1] !== String(definition.fixedYear)) return;
    const normalizedValue = match[2];
    if (!expectedValues.includes(normalizedValue)) return;
    page.fields[definition.key] = normalizedValue;
    warnings.push({
      page: definition.page,
      pageId: definition.pageId,
      pageTitle: pageTitleFor(page),
      fieldKey: definition.key,
      fieldLabel: statusFieldLabel(definition),
      inputValue: value,
      normalizedValue,
      expectedValues,
      autoRecovered: true,
    });
  });

  return { report: normalized, warnings };
}

export function formatStructuredNormalizationWarnings(warnings: StructuredNormalizationWarning[]): string {
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

"""
text = text.replace(marker, helpers + marker, 1)

replace_once(
"""        if (definition.kind === 'status' && !ALLOWED_CREATIVE_STATUS.has(value.trim())) errors.push(`${definition.key} has invalid Creative History status`);""",
"""        if (definition.kind === 'status') {
          const expectedValues = definition.enum?.length ? definition.enum : [...CREATIVE_HISTORY_STATUS_VALUES];
          if (!expectedValues.includes(value.trim())) {
            errors.push([
              `P${definition.page} · ${pageTitleFor(page)} · ${statusFieldLabel(definition)}`,
              `입력값: “${value}”`,
              `허용값:\n${expectedValues.map((item) => `- ${item}`).join('\n')}`,
              '처리: 자동 복구할 수 없어 렌더링을 중단했습니다.',
            ].join('\n'));
          }
        }""",
)

PATH.write_text(text, encoding='utf-8')
print('structuredReportV3.ts patched')
