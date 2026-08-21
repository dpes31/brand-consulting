import {
  STRUCTURED_REPORT_VERSION,
  annotateStructuredReportDocument,
  validateStructuredReportV3,
  type StructuredFieldDefinition,
  type StructuredFieldKind,
  type StructuredReportV3,
} from './structuredReportV3';
import {
  applyStructuredDefinitionPolicy,
  isGenericOrderField,
  mapStructuredFieldKey,
} from './structuredDefinitionPolicy';
import {
  FULL_REPORT_PAGE_IDS,
  computeReportDomFingerprint,
  parseReportHtml,
  sanitizeCompatibleFullReportHtml,
  serializeReportDocument,
} from './reportDomSafety';
import { validateStructuredReportCrossPage } from './structuredReportCrossValidation';
import { renderSemanticReportV4 } from './semanticReportV4';

const FIELD_ATTRIBUTES = [
  'data-report-field',
  'data-report-hint',
  'data-report-max-length',
  'data-report-kind',
  'data-report-enum',
  'data-report-fixed-year',
] as const;

const FIELD_TOKEN = /^\[\[FIELD:([a-z0-9.-]+)\]\]$/i;
const UNRESOLVED_FIELD_TOKEN = /\[\[FIELD:[a-z0-9.-]+\]\]/i;
const POSITION_TOKEN = /^\[\[POSITION:([a-z0-9.-]+)\]\]$/i;
const UNRESOLVED_POSITION_TOKEN = /\[\[POSITION:[a-z0-9.-]+\]\]/i;
const LITERAL_HIGHLIGHT = /\[\[[\s\S]*?\]\]/;
const SVG_NS = 'http://www.w3.org/2000/svg';
const TARGET_HISTORY_BREADCRUMB = 'IV. CREATIVE > TARGET BRAND HISTORY';
const RECOVERABLE_RICH_TAGS = new Set(['B', 'STRONG']);

const POSITIONING_COORDINATES = [
  { key: 'positioning.competitor1.x', defaultValue: 24 },
  { key: 'positioning.competitor1.y', defaultValue: 68 },
  { key: 'positioning.competitor2.x', defaultValue: 60 },
  { key: 'positioning.competitor2.y', defaultValue: 32 },
  { key: 'positioning.competitor3.x', defaultValue: 80 },
  { key: 'positioning.competitor3.y', defaultValue: 76 },
  { key: 'positioning.targetAsIs.x', defaultValue: 36 },
  { key: 'positioning.targetAsIs.y', defaultValue: 47 },
  { key: 'positioning.targetToBe.x', defaultValue: 82 },
  { key: 'positioning.targetToBe.y', defaultValue: 17 },
] as const;

type PositioningCoordinateKey = typeof POSITIONING_COORDINATES[number]['key'];
type PositioningCoordinates = Record<PositioningCoordinateKey, number>;

type ReportExtraction = {
  report: StructuredReportV3;
  errors: string[];
  recoveredMarkupCount: number;
};

type PositioningReadResult = {
  coordinates: PositioningCoordinates;
  errors: string[];
};

const POSITIONING_POINTS = [
  { selector: '.map-dot.sam', x: 'positioning.competitor1.x', y: 'positioning.competitor1.y' },
  { selector: '.map-dot.heum', x: 'positioning.competitor2.x', y: 'positioning.competitor2.y' },
  { selector: '.map-dot.ssem', x: 'positioning.competitor3.x', y: 'positioning.competitor3.y' },
  { selector: '.map-dot.biz-as', x: 'positioning.targetAsIs.x', y: 'positioning.targetAsIs.y' },
  { selector: '.map-dot.biz-to', x: 'positioning.targetToBe.x', y: 'positioning.targetToBe.y' },
] as const;

const CREATIVE_STATUS_ALIASES = new Map<string, string>([
  ['verified', 'verified-verbatim'],
  ['verified-verbatim', 'verified-verbatim'],
  ['verifiedverbatim', 'verified-verbatim'],
  ['copy-unverified', 'source-found-copy-unverified'],
  ['copyunverified', 'source-found-copy-unverified'],
  ['source-found-copy-unverified', 'source-found-copy-unverified'],
  ['sourcefoundcopyunverified', 'source-found-copy-unverified'],
  ['not-found', 'not-found'],
  ['notfound', 'not-found'],
]);

function cleanResearch(raw: string): string {
  return raw.replace(/\[cite.*?\]|\\cite.*?|\[cite_start\]/g, '');
}

function ensurePositioningVectorArrow(documentRef: Document): void {
  const map = documentRef.querySelector<HTMLElement>('#positioning .position-map');
  if (!map) return;

  map.querySelectorAll('.map-arrow,.map-arrow-vector').forEach((node) => node.remove());

  const defaults = Object.fromEntries(
    POSITIONING_COORDINATES.map(({ key, defaultValue }) => [key, defaultValue]),
  ) as PositioningCoordinates;
  const svg = documentRef.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', 'map-arrow-vector');
  svg.setAttribute('viewBox', '0 0 100 100');
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('data-report-fixed', 'true');
  svg.setAttribute(
    'style',
    'position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none;color:var(--full-accent);',
  );

  const defs = documentRef.createElementNS(SVG_NS, 'defs');
  const marker = documentRef.createElementNS(SVG_NS, 'marker');
  marker.setAttribute('id', 'phase6-positioning-arrowhead');
  marker.setAttribute('markerWidth', '7');
  marker.setAttribute('markerHeight', '7');
  marker.setAttribute('refX', '6');
  marker.setAttribute('refY', '3.5');
  marker.setAttribute('orient', 'auto');
  marker.setAttribute('markerUnits', 'strokeWidth');
  const markerPath = documentRef.createElementNS(SVG_NS, 'path');
  markerPath.setAttribute('d', 'M0,0 L7,3.5 L0,7 Z');
  markerPath.setAttribute('fill', 'currentColor');
  marker.appendChild(markerPath);
  defs.appendChild(marker);

  const line = documentRef.createElementNS(SVG_NS, 'line');
  line.setAttribute('class', 'map-arrow-line');
  line.setAttribute('x1', String(defaults['positioning.targetAsIs.x']));
  line.setAttribute('y1', String(defaults['positioning.targetAsIs.y']));
  line.setAttribute('x2', String(defaults['positioning.targetToBe.x']));
  line.setAttribute('y2', String(defaults['positioning.targetToBe.y']));
  line.setAttribute('stroke', 'currentColor');
  line.setAttribute('stroke-width', '2');
  line.setAttribute('vector-effect', 'non-scaling-stroke');
  line.setAttribute('marker-end', 'url(#phase6-positioning-arrowhead)');
  svg.append(defs, line);
  map.appendChild(svg);
}

function applyFixedPresentationCorrections(documentRef: Document): void {
  const targetHistoryBreadcrumb = documentRef.querySelector<HTMLElement>(
    '#creative-history-target .full-breadcrumb',
  );
  if (targetHistoryBreadcrumb) targetHistoryBreadcrumb.textContent = TARGET_HISTORY_BREADCRUMB;
  ensurePositioningVectorArrow(documentRef);
}

function removeFieldAttributes(element: HTMLElement): void {
  FIELD_ATTRIBUTES.forEach((attribute) => element.removeAttribute(attribute));
}

function prepareSemanticDocument(
  documentRef: Document,
  brandName: string,
): StructuredFieldDefinition[] {
  applyFixedPresentationCorrections(documentRef);
  const rawDefinitions = annotateStructuredReportDocument(documentRef, brandName);
  const generic = rawDefinitions.filter((definition) => isGenericOrderField(definition.key));
  if (generic.length) {
    throw new Error(
      `페이지 의미가 없는 순번 기반 필드가 남아 있다: ${generic
        .slice(0, 8)
        .map((definition) => definition.key)
        .join(', ')}`,
    );
  }

  const definitions = applyStructuredDefinitionPolicy(rawDefinitions);
  const byKey = new Map(definitions.map((definition) => [definition.key, definition]));

  documentRef.querySelectorAll<HTMLElement>('[data-report-field]').forEach((element) => {
    const originalKey = element.dataset.reportField || '';
    const nextKey = mapStructuredFieldKey(originalKey);
    if (!nextKey) {
      removeFieldAttributes(element);
      element.dataset.reportFixed = 'true';
      return;
    }

    const definition = byKey.get(nextKey);
    if (!definition) throw new Error(`의미 필드 정책과 DOM이 일치하지 않는다: ${originalKey} → ${nextKey}`);
    element.dataset.reportField = nextKey;
    element.dataset.reportHint = definition.hint;
    element.dataset.reportMaxLength = String(definition.maxLength);
    element.dataset.reportKind = definition.kind;
  });

  const renderedKeys = Array.from(documentRef.querySelectorAll<HTMLElement>('[data-report-field]'))
    .map((element) => element.dataset.reportField || '');
  const expectedKeys = definitions.map((definition) => definition.key);
  if (
    renderedKeys.length !== expectedKeys.length
    || new Set(renderedKeys).size !== renderedKeys.length
    || renderedKeys.some((key) => !byKey.has(key))
  ) {
    throw new Error('40페이지 Renderer의 의미 필드 수 또는 키가 일치하지 않는다.');
  }

  return definitions;
}

function fieldToken(key: string): string {
  return `[[FIELD:${key}]]`;
}

function positionToken(key: PositioningCoordinateKey): string {
  return `[[POSITION:${key}]]`;
}

function ensurePositioningCoordinateNodes(documentRef: Document, tokenized: boolean): void {
  const map = documentRef.querySelector<HTMLElement>('#positioning .position-map');
  if (!map) throw new Error('P18 Positioning Map 구조를 확인할 수 없다.');

  POSITIONING_COORDINATES.forEach(({ key, defaultValue }) => {
    let node = map.querySelector<HTMLElement>(`data[data-report-coordinate-field="${key}"]`);
    if (!node) {
      node = documentRef.createElement('data');
      node.hidden = true;
      node.dataset.reportCoordinateField = key;
      map.appendChild(node);
    }
    if (tokenized) node.textContent = positionToken(key);
    else if (!(node.textContent || '').trim()) node.textContent = String(defaultValue);
  });
}

export function createSemanticHtmlTemplateV5(
  approvedBaseHtml: string,
  brandName: string,
): { html: string; definitions: StructuredFieldDefinition[] } {
  const documentRef = parseReportHtml(approvedBaseHtml);
  const definitions = prepareSemanticDocument(documentRef, brandName);

  documentRef.querySelectorAll<HTMLElement>('[data-report-field]').forEach((element) => {
    const key = element.dataset.reportField || '';
    element.replaceChildren(documentRef.createTextNode(fieldToken(key)));
    element.dataset.reportTemplateToken = key;
  });
  ensurePositioningCoordinateNodes(documentRef, true);

  documentRef.body.dataset.contentContract = 'semantic-html-v5-template';
  documentRef.body.dataset.contentState = 'template';
  documentRef.body.dataset.reportAppendixCount = '0';
  return { html: serializeReportDocument(documentRef), definitions };
}

export function buildSemanticHtmlPromptV5(
  rawResearch: string,
  brandName: string,
  semanticTemplateHtml: string,
  creativeDirective = '',
): string {
  return `[IMMEDIATE EXECUTION DIRECTIVE]
This file is the complete request. Start the report immediately. Do not acknowledge, summarize, plan, or ask a question.
Your first visible characters must be \`\`\`html. Nothing may appear after the closing code fence.

[FINAL OUTPUT CONTRACT]
- Return one complete standalone HTML document, not JSON.
- Preserve the exact brand spelling: ${brandName}
- Main Deck: exactly 40 pages.
- Appendix: 0 pages.
- Keep all supplied DOM, CSS, IDs, classes, data attributes, tables, diagrams, navigation, page order, and 1280×720 geometry unchanged.
- Replace only the [[FIELD:semantic.key]] token inside each element marked data-report-field.
- Replace every [[POSITION:semantic.key]] token inside data-report-coordinate-field elements with one integer from 0 to 100.
- Never move content between fields, create a new field, remove a field, merge fields, or place prose in numbers, labels, arrows, axes, coordinates, or table headings.
- Return the complete HTML from <!DOCTYPE html> through </html> in one \`\`\`html code block.

[STEP 0–5 RESEARCH — SOURCE OF TRUTH]
${cleanResearch(rawResearch)}

[STRATEGIC WRITING RULES]
- Use only the Step 0–5 research above. Do not invent facts, figures, dates, quotations, competitors, scores, axes, models, coordinates, or sources.
- Titles and SO WHAT statements use decisive Korean consulting language: ~한다, ~이다, ~다.
- Preserve the page logic: Brand Fact → Market/Competitor → Consumer tension → Creative gap → Root Cause → STP → Four Routes → Final Choice → Decision Close.
- P11 reviews up to five evidence-supported direct competitors. P12 selects the core three.
- P13–18 and P30–33 must use the same three competitors in the same ranking order.
- P18 positioning.targetAsIs must start exactly with “${brandName} AS-IS · ”.
- P18 positioning.targetToBe must start exactly with “${brandName} TO-BE · ”.
- P18 axis poles must be meaningful, mutually distinct attributes grounded in Step 2. Never write literal X축 or Y축.
- P18 coordinate values use x=0 at the left pole, x=100 at the right pole, y=0 at the top pole, and y=100 at the bottom pole. Place every brand from the stated axis logic, not from the sample position.
- P22–24 must analyze P21 target 1, 2, and 3 in that exact order. Titles may be conclusion-led, but never substitute target 4/5 or another target identity.
- P27 keeps A → I → P1 → P2 → L and keeps action, evidence, and state separate.
- P37 keeps Segmentation → Targeting → Positioning.
- P38 keeps A/B/C/D route boundaries. P39 is the final choice. P40 compresses P39 into one governing decision.
- In data-report-kind="rich" fields, use only <mark>important phrase</mark> and <br>. Never use <b>, <strong>, <span>, <em>, or literal [[important phrase]].
- In text, source, and status fields, use plain text only. Do not add HTML tags.
- Respect each data-report-max-length as a hard limit. Summarize instead of shrinking type.
- Raw URLs are prohibited. Use publisher · material title · year.

[CREATIVE HISTORY FACTUALITY]
${creativeDirective || 'Use verified-verbatim / source-found-copy-unverified / not-found exactly. Keep 2021–2025 and 2026 YTD. Only verified-verbatim copy may use quotation marks.'}
- Every Creative History status field must contain exactly one of: verified-verbatim, source-found-copy-unverified, not-found.
- Do not humanize those codes as VERIFIED, COPY UNVERIFIED, or NOT FOUND.

[IMMUTABLE 40-PAGE SEMANTIC HTML TEMPLATE — START]
${semanticTemplateHtml}
[IMMUTABLE 40-PAGE SEMANTIC HTML TEMPLATE — END]

[FINAL CHECK]
Confirm that every [[FIELD:...]] and [[POSITION:...]] token is replaced, no literal [[...]] highlight syntax remains, no structure is changed, P22–24 use P21 targets 1–3 in order, and the result contains exactly 40 .full-slide elements and no Appendix. Return the complete HTML now.`;
}

function richTextValue(element: HTMLElement): string {
  const visit = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) return node.nodeValue || '';
    if (!(node instanceof HTMLElement)) return '';
    if (node.tagName === 'BR') return '\n';
    if (node.tagName === 'MARK') return `[[${node.textContent || ''}]]`;
    return Array.from(node.childNodes).map(visit).join('');
  };
  return Array.from(element.childNodes).map(visit).join('').replace(/\n{3,}/g, '\n\n').trim();
}

function normalizeRecoverableFieldMarkup(
  element: HTMLElement,
  definition: StructuredFieldDefinition,
): { recovered: number; errors: string[] } {
  if (definition.kind !== 'rich') {
    const descendants = Array.from(element.querySelectorAll<HTMLElement>('*'));
    if (!descendants.length) return { recovered: 0, errors: [] };
    const tags = [...new Set(descendants.map((node) => node.tagName.toLowerCase()))];
    return {
      recovered: 0,
      errors: [`${definition.key} 일반 텍스트 필드에 허용되지 않은 태그가 들어갔다: ${tags.map((tag) => `<${tag}>`).join(', ')}`],
    };
  }

  let recovered = 0;
  Array.from(element.querySelectorAll<HTMLElement>('b,strong')).forEach((node) => {
    if (!RECOVERABLE_RICH_TAGS.has(node.tagName)) return;
    const mark = element.ownerDocument.createElement('mark');
    while (node.firstChild) mark.appendChild(node.firstChild);
    node.replaceWith(mark);
    recovered += 1;
  });

  const invalid = Array.from(element.querySelectorAll<HTMLElement>('*'))
    .filter((node) => node.tagName !== 'MARK' && node.tagName !== 'BR');
  if (!invalid.length) return { recovered, errors: [] };
  const tags = [...new Set(invalid.map((node) => node.tagName.toLowerCase()))];
  return {
    recovered,
    errors: [
      `${definition.key} rich 필드에 허용되지 않은 태그가 들어갔다: ${tags.map((tag) => `<${tag}>`).join(', ')}. `
      + 'rich 필드는 mark와 br만 허용한다.',
    ],
  };
}

function fieldValue(element: HTMLElement, kind: StructuredFieldKind): string {
  if (kind === 'rich') return richTextValue(element);
  const value = (element.textContent || '').replace(/\s+/g, ' ').trim();
  if (kind === 'source') return value.replace(/^SOURCE\s*·\s*/i, '').trim();
  return value;
}

function normalizeCreativeStatus(value: string): string {
  const key = value.toLowerCase().trim().replace(/[\s_]+/g, '-').replace(/[^a-z-]/g, '');
  return CREATIVE_STATUS_ALIASES.get(key)
    || CREATIVE_STATUS_ALIASES.get(key.replace(/-/g, ''))
    || value.trim();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizePositioningTargetLabel(key: string, value: string, brandName: string): string {
  const brand = brandName.trim();
  const mode = key === 'positioning.targetAsIs' ? 'AS-IS' : 'TO-BE';
  const required = `${brand} ${mode}`;
  if (value.toLowerCase().includes(brand.toLowerCase()) && new RegExp(mode.replace('-', '[-\\s]?'), 'i').test(value)) {
    return value.trim();
  }

  const stripped = value
    .replace(new RegExp(`^${escapeRegExp(brand)}\\s*`, 'i'), '')
    .replace(new RegExp(`^${mode.replace('-', '[-\\s]?')}\\s*[·:—-]*\\s*`, 'i'), '')
    .trim();
  return `${required} · ${stripped}`;
}

function assertFieldSetsMatch(
  returnedDocument: Document,
  definitions: StructuredFieldDefinition[],
): Map<string, HTMLElement> {
  const elements = Array.from(returnedDocument.querySelectorAll<HTMLElement>('[data-report-field]'));
  const returnedByKey = new Map(elements.map((element) => [element.dataset.reportField || '', element]));
  const expected = new Set(definitions.map((definition) => definition.key));

  if (returnedByKey.size !== definitions.length || elements.length !== definitions.length) {
    throw new Error(`의미 필드 수가 변경됐다. expected ${definitions.length}, received ${elements.length}`);
  }
  for (const key of expected) {
    if (!returnedByKey.has(key)) throw new Error(`외부 HTML에서 의미 필드가 누락됐다: ${key}`);
  }
  for (const key of returnedByKey.keys()) {
    if (!expected.has(key)) throw new Error(`외부 HTML에 승인되지 않은 의미 필드가 추가됐다: ${key}`);
  }
  return returnedByKey;
}

function reportFromReturnedHtml(
  returnedDocument: Document,
  definitions: StructuredFieldDefinition[],
  brandName: string,
): ReportExtraction {
  const byKey = assertFieldSetsMatch(returnedDocument, definitions);
  const values = new Map<string, string>();
  const errors: string[] = [];
  let recoveredMarkupCount = 0;

  definitions.forEach((definition) => {
    const element = byKey.get(definition.key);
    if (!element) {
      errors.push(`의미 필드를 읽을 수 없다: ${definition.key}`);
      return;
    }
    const markup = normalizeRecoverableFieldMarkup(element, definition);
    recoveredMarkupCount += markup.recovered;
    errors.push(...markup.errors);

    let value = fieldValue(element, definition.kind);
    if (FIELD_TOKEN.test(value) || UNRESOLVED_FIELD_TOKEN.test(value)) {
      errors.push(`조사 내용으로 교체되지 않은 의미 필드가 남았다: ${definition.key}`);
    }
    if (definition.kind !== 'rich' && LITERAL_HIGHLIGHT.test(value)) {
      errors.push(`${definition.key} 일반 텍스트 필드에 [[...]] 표기가 남았다.`);
    }
    if (definition.kind === 'status') value = normalizeCreativeStatus(value);
    if (definition.key === 'positioning.targetAsIs' || definition.key === 'positioning.targetToBe') {
      value = normalizePositioningTargetLabel(definition.key, value, brandName);
    }
    values.set(definition.key, value);
  });

  return {
    report: {
      version: STRUCTURED_REPORT_VERSION,
      brand: brandName,
      generatedAt: new Date().toISOString(),
      pages: FULL_REPORT_PAGE_IDS.map((id, index) => ({
        page: index + 1,
        id,
        fields: Object.fromEntries(
          definitions
            .filter((definition) => definition.pageId === id)
            .map((definition) => [definition.key, values.get(definition.key) || '']),
        ),
      })),
    },
    errors,
    recoveredMarkupCount,
  };
}

function readPositioningCoordinates(documentRef: Document): PositioningReadResult {
  const coordinates = {} as PositioningCoordinates;
  const errors: string[] = [];

  POSITIONING_COORDINATES.forEach(({ key, defaultValue }) => {
    const node = documentRef.querySelector<HTMLElement>(`data[data-report-coordinate-field="${key}"]`);
    const raw = (node?.textContent || String(defaultValue)).trim();
    if (POSITION_TOKEN.test(raw) || UNRESOLVED_POSITION_TOKEN.test(raw)) {
      errors.push(`P18 Positioning · 좌표 ${key}가 교체되지 않았다.`);
      coordinates[key] = defaultValue;
      return;
    }
    if (!/^(?:100|\d{1,2})$/.test(raw)) {
      errors.push(`P18 Positioning · 좌표 ${key}는 0~100 정수여야 한다. 현재 “${raw}”이다.`);
      coordinates[key] = defaultValue;
      return;
    }
    coordinates[key] = Number(raw);
  });

  return { coordinates, errors };
}

function reportValue(report: StructuredReportV3, pageId: string, key: string): string {
  return report.pages.find((item) => item.id === pageId)?.fields[key]?.trim() || '';
}

function validatePositioningContract(
  report: StructuredReportV3,
  coordinates: PositioningCoordinates,
  brandName: string,
): string[] {
  const errors: string[] = [];
  const axes = [
    ['positioning.axis.xLeft', reportValue(report, 'positioning', 'positioning.axis.xLeft')],
    ['positioning.axis.xRight', reportValue(report, 'positioning', 'positioning.axis.xRight')],
    ['positioning.axis.yTop', reportValue(report, 'positioning', 'positioning.axis.yTop')],
    ['positioning.axis.yBottom', reportValue(report, 'positioning', 'positioning.axis.yBottom')],
  ] as const;
  axes.forEach(([key, axis]) => {
    if (!axis || /^(?:x축|y축|좌|우|상|하)$/i.test(axis.replace(/\s+/g, ''))) {
      errors.push(`P18 Positioning · ${key}에 실제 속성 극점이 필요하다.`);
    }
  });
  if (axes[0][1] === axes[1][1]) errors.push('P18 Positioning · X축 양 극점이 동일하다.');
  if (axes[2][1] === axes[3][1]) errors.push('P18 Positioning · Y축 양 극점이 동일하다.');

  const dx = coordinates['positioning.targetToBe.x'] - coordinates['positioning.targetAsIs.x'];
  const dy = coordinates['positioning.targetToBe.y'] - coordinates['positioning.targetAsIs.y'];
  if (Math.hypot(dx, dy) < 12) {
    errors.push(`P18 Positioning · ${brandName} AS-IS와 TO-BE 좌표가 사실상 동일하다. 전략적 이동 거리를 확보해야 한다.`);
  }

  return errors;
}

function normalizeIdentityToken(value: string): string {
  return value.toLowerCase().replace(/[\s·,.'"“”‘’()[\]{}\-_/]/g, '');
}

function validatePersonaTargetConflicts(report: StructuredReportV3): string[] {
  const targetPage = report.pages.find((page) => page.id === 'consumer-target');
  if (!targetPage) return [];
  const targets = [1, 2, 3, 4, 5].map((index) => (
    targetPage.fields[`consumer-target.target${index}.name`]?.trim() || ''
  ));
  const errors: string[] = [];

  [1, 2, 3].forEach((index) => {
    const persona = report.pages.find((page) => page.id === `persona-${index}`);
    if (!persona) return;
    const title = persona.fields[`persona-${index}.title`]?.trim() || '';
    const normalizedTitle = normalizeIdentityToken(title);
    targets.forEach((targetName, targetIndex) => {
      if (!targetName || targetIndex === index - 1) return;
      const normalizedTarget = normalizeIdentityToken(targetName);
      if (normalizedTarget.length < 3 || !normalizedTitle.includes(normalizedTarget)) return;
      errors.push(
        `P${21 + index} Persona ${index}가 P21 ${index}순위 “${targets[index - 1] || '미확인'}” 대신 `
        + `${targetIndex + 1}순위 “${targetName}” 정체성을 사용한다. 타깃 순서를 바꿀 수 없다.`,
      );
    });
  });

  return errors;
}

function isNonBlockingStructuredError(error: string): boolean {
  return error.endsWith('must use declarative consulting tone')
    || /Persona title must exactly match P21 target \d\.$/.test(error);
}

function formatBlockingValidationError(errors: string[]): Error {
  const unique = [...new Set(errors.filter(Boolean))];
  const shown = unique.slice(0, 80);
  return new Error(
    `검증에서 ${unique.length}건의 수정 필요 항목을 확인했다.\n`
    + shown.map((error, index) => `${index + 1}. ${error}`).join('\n')
    + (unique.length > shown.length ? `\n외 ${unique.length - shown.length}건` : ''),
  );
}

function applyPositioningCoordinates(documentRef: Document, coordinates: PositioningCoordinates): void {
  POSITIONING_POINTS.forEach(({ selector, x, y }) => {
    const node = documentRef.querySelector<HTMLElement>(`#positioning ${selector}`);
    if (!node) return;
    node.style.left = `${coordinates[x]}%`;
    node.style.top = `${coordinates[y]}%`;
    node.dataset.positionX = String(coordinates[x]);
    node.dataset.positionY = String(coordinates[y]);
  });

  const line = documentRef.querySelector<SVGLineElement>('#positioning .map-arrow-vector .map-arrow-line');
  if (line) {
    line.setAttribute('x1', String(coordinates['positioning.targetAsIs.x']));
    line.setAttribute('y1', String(coordinates['positioning.targetAsIs.y']));
    line.setAttribute('x2', String(coordinates['positioning.targetToBe.x']));
    line.setAttribute('y2', String(coordinates['positioning.targetToBe.y']));
  }

  const map = documentRef.querySelector<HTMLElement>('#positioning .position-map');
  if (map) map.dataset.positioningCoordinateContract = 'semantic-0-100-v1';
}

function hideUnusedLandscapeRows(documentRef: Document): void {
  documentRef.querySelectorAll<HTMLElement>('#comp-landscape .candidate-row').forEach((row) => {
    const name = (row.querySelector<HTMLElement>('[data-report-field$=".name"]')?.textContent || '').trim();
    if (/^(?:추가 후보 없음|없음|not-found)$/i.test(name)) row.hidden = true;
  });
}

export function compileSemanticHtmlReportV5(
  externalAiOutput: string,
  approvedBaseHtml: string,
  brandName: string,
): string {
  const approvedDocument = parseReportHtml(approvedBaseHtml);
  const approvedDefinitions = prepareSemanticDocument(approvedDocument, brandName);
  ensurePositioningCoordinateNodes(approvedDocument, false);
  const approvedFingerprint = computeReportDomFingerprint(approvedDocument);

  const sanitizedReturnedHtml = sanitizeCompatibleFullReportHtml(externalAiOutput, brandName);
  const returnedDocument = parseReportHtml(sanitizedReturnedHtml);
  const returnedDefinitions = prepareSemanticDocument(returnedDocument, brandName);
  ensurePositioningCoordinateNodes(returnedDocument, false);
  const returnedFingerprint = computeReportDomFingerprint(returnedDocument);

  if (approvedFingerprint !== returnedFingerprint) {
    throw new Error('외부 AI가 승인된 40페이지 DOM·컴포넌트 구조를 변경했다. 의미 필드와 P18 좌표만 작성해야 한다.');
  }
  if (
    approvedDefinitions.length !== returnedDefinitions.length
    || approvedDefinitions.some((definition, index) => definition.key !== returnedDefinitions[index]?.key)
  ) {
    throw new Error('외부 HTML의 의미 필드 순서 또는 역할이 승인 템플릿과 다르다.');
  }

  const extraction = reportFromReturnedHtml(returnedDocument, approvedDefinitions, brandName);
  const positioning = readPositioningCoordinates(returnedDocument);
  const structuredValidation = validateStructuredReportV3(extraction.report, approvedDefinitions, brandName);
  const nonBlockingWarnings = structuredValidation.filter(isNonBlockingStructuredError);
  const blockingErrors = [
    ...extraction.errors,
    ...positioning.errors,
    ...structuredValidation.filter((error) => !isNonBlockingStructuredError(error)),
    ...validateStructuredReportCrossPage(extraction.report),
    ...validatePersonaTargetConflicts(extraction.report),
    ...validatePositioningContract(extraction.report, positioning.coordinates, brandName),
  ];
  if (blockingErrors.length) throw formatBlockingValidationError(blockingErrors);

  const finalHtml = renderSemanticReportV4(approvedBaseHtml, extraction.report, brandName);
  const finalDocument = parseReportHtml(finalHtml);
  applyFixedPresentationCorrections(finalDocument);
  applyPositioningCoordinates(finalDocument, positioning.coordinates);
  hideUnusedLandscapeRows(finalDocument);
  finalDocument.body.dataset.contentContract = 'semantic-html-v5';
  finalDocument.body.dataset.contentState = 'compiled';
  finalDocument.body.dataset.reportAppendixCount = '0';
  finalDocument.body.dataset.phase6RecoveredMarkupCount = String(extraction.recoveredMarkupCount);
  finalDocument.body.dataset.phase6NonBlockingWarningCount = String(nonBlockingWarnings.length);

  const finalText = finalDocument.body.textContent || '';
  if (UNRESOLVED_FIELD_TOKEN.test(finalText) || UNRESOLVED_POSITION_TOKEN.test(finalText) || LITERAL_HIGHLIGHT.test(finalText)) {
    throw new Error('최종 보고서에 [[...]] 미변환 표기가 남았다.');
  }
  return serializeReportDocument(finalDocument);
}
