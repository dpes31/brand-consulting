import type { StructuredFieldDefinition, StructuredFieldKind } from './structuredReportV3';
import {
  FULL_REPORT_PAGE_IDS,
  extractCompleteHtmlDocument,
  parseReportHtml,
  serializeReportDocument,
} from './reportDomSafety';
import {
  compileSemanticHtmlReportV5,
  createSemanticHtmlTemplateV5,
} from './semanticHtmlReportV5';

export const LIGHTWEIGHT_SEMANTIC_HTML_CONTRACT = 'semantic-html-v6-workbook';
export const LIGHTWEIGHT_TEMPLATE_START = '[IMMUTABLE 40-PAGE SEMANTIC HTML TEMPLATE — START]';
export const LIGHTWEIGHT_TEMPLATE_END = '[IMMUTABLE 40-PAGE SEMANTIC HTML TEMPLATE — END]';

const LEGACY_FIELD_TOKEN = /\[\[FIELD:([a-z0-9.-]+)\]\]/i;
const LEGACY_POSITION_TOKEN = /\[\[POSITION:([a-z0-9.-]+)\]\]/i;
const COMPACT_FIELD_TOKEN = /\[\[F\]\]/i;
const COMPACT_POSITION_TOKEN = /\[\[P\]\]/i;
const POSITIONING_COORDINATE_KEYS = [
  'positioning.competitor1.x',
  'positioning.competitor1.y',
  'positioning.competitor2.x',
  'positioning.competitor2.y',
  'positioning.competitor3.x',
  'positioning.competitor3.y',
  'positioning.targetAsIs.x',
  'positioning.targetAsIs.y',
  'positioning.targetToBe.x',
  'positioning.targetToBe.y',
] as const;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function cleanResearch(raw: string): string {
  return raw
    .replace(/\[cite.*?\]|\\cite.*?|\[cite_start\]/g, '')
    .replace(/\n{4,}/g, '\n\n\n')
    .trim();
}

function compactKind(kind: StructuredFieldKind): string {
  if (kind === 'rich') return 'r';
  if (kind === 'source') return 's';
  if (kind === 'status') return 'c';
  return 't';
}

function fieldMarkup(definition: StructuredFieldDefinition): string {
  const attributes = [
    `data-report-field="${escapeHtml(definition.key)}"`,
    `data-k="${compactKind(definition.kind)}"`,
    `data-m="${definition.maxLength}"`,
  ];
  if (definition.enum?.length) attributes.push(`data-e="${escapeHtml(definition.enum.join('|'))}"`);
  if (definition.fixedYear !== undefined) attributes.push(`data-y="${escapeHtml(String(definition.fixedYear))}"`);
  return `<div ${attributes.join(' ')}>[[F]]</div>`;
}

function coordinateMarkup(): string {
  return POSITIONING_COORDINATE_KEYS
    .map((key) => `<data data-report-coordinate-field="${key}" hidden>[[P]]</data>`)
    .join('');
}

export function createSemanticHtmlWorkbookV6(
  approvedBaseHtml: string,
  brandName: string,
): { html: string; definitions: StructuredFieldDefinition[] } {
  const { definitions } = createSemanticHtmlTemplateV5(approvedBaseHtml, brandName);
  const pages = FULL_REPORT_PAGE_IDS.map((pageId, index) => {
    const fields = definitions
      .filter((definition) => definition.pageId === pageId)
      .map(fieldMarkup)
      .join('');
    const coordinates = pageId === 'positioning' ? coordinateMarkup() : '';
    return `<section class="full-slide" id="${pageId}" data-page="${index + 1}" data-zone="main">${fields}${coordinates}</section>`;
  }).join('');

  const html = `<!DOCTYPE html>\n<html lang="ko"><head><meta charset="UTF-8"><title>${escapeHtml(brandName)} Phase 6 Workbook</title></head><body data-content-contract="${LIGHTWEIGHT_SEMANTIC_HTML_CONTRACT}" data-report-page-count="40" data-report-appendix-count="0">${pages}</body></html>`;
  return { html, definitions };
}

export function buildSemanticHtmlPromptV6(
  rawResearch: string,
  brandName: string,
  semanticWorkbookHtml: string,
  creativeDirective = '',
): string {
  return `[IMMEDIATE EXECUTION DIRECTIVE]
This file is the complete request. Start immediately. Do not acknowledge, summarize, plan, or ask a question.
Your first visible characters must be <!DOCTYPE html>. Your last visible characters must be </html>.

[FINAL OUTPUT CONTRACT]
- Return one complete standalone HTML document, not JSON.
- Preserve the exact brand spelling: ${brandName}
- Main Deck: exactly 40 pages. Appendix: 0 pages.
- This is a compact semantic workbook. The application owns the final visual CSS and approved Renderer.
- Keep all 40 .full-slide sections, IDs, data attributes, field elements, and page order unchanged.
- Replace each [[F]] inside a data-report-field element with that semantic key's content.
- Field metadata: data-k=t plain text, r rich text, s source, c Creative History status; data-m is the hard character limit; data-e is the allowed enum; data-y is the fixed year.
- Replace each [[P]] inside a data-report-coordinate-field element with one integer from 0 to 100.
- Do not add CSS, scripts, navigation, diagrams, tables, wrapper elements, or explanatory text.
- Never move content between fields, create/remove/merge fields, or place prose in numbers, labels, axes, coordinates, or headings.
- Return raw HTML only from <!DOCTYPE html> through </html>. Do not use Markdown code fences.

[STEP 0–5 RESEARCH — SOURCE OF TRUTH]
${cleanResearch(rawResearch)}

[STRATEGIC WRITING RULES]
- Use only the Step 0–5 research above. Do not invent facts, figures, dates, quotations, competitors, scores, axes, models, coordinates, or sources.
- Titles and SO WHAT statements use decisive Korean consulting language: ~한다, ~이다, ~다.
- Preserve the logic: Brand Fact → Market/Competitor → Consumer tension → Creative gap → Root Cause → STP → Four Routes → Final Choice → Decision Close.
- P11 reviews up to five evidence-supported direct competitors. P12 selects the core three.
- P13–18 and P30–33 use the same three competitors in the same ranking order.
- P18 positioning.targetAsIs starts exactly with “${brandName} AS-IS · ”; positioning.targetToBe starts exactly with “${brandName} TO-BE · ”.
- P18 axis poles are meaningful, distinct Step 2 attributes. Never write literal X축 or Y축.
- P18 coordinates use x=0 left, x=100 right, y=0 top, y=100 bottom and follow the declared axis logic.
- P22–24 Persona titles exactly match the first three target names on P21.
- P27 keeps A → I → P1 → P2 → L and separates action, evidence, and state.
- P37 keeps Segmentation → Targeting → Positioning. P38 keeps A/B/C/D. P39 is Final Choice. P40 is Decision Close.
- In data-k="r" fields, use <mark>important phrase</mark> for one short highlight. Never output literal [[important phrase]].
- In data-k="t", "s", or "c" fields, use plain text only. Respect every data-m limit.
- Raw URLs are prohibited. Use publisher · material title · year.

[CREATIVE HISTORY FACTUALITY]
${creativeDirective || 'Use verified-verbatim / source-found-copy-unverified / not-found exactly. Keep 2021–2025 and 2026 YTD. Only verified-verbatim copy may use quotation marks.'}
- Every Creative History status field contains exactly one of: verified-verbatim, source-found-copy-unverified, not-found.

${LIGHTWEIGHT_TEMPLATE_START}
${semanticWorkbookHtml}
${LIGHTWEIGHT_TEMPLATE_END}

[FINAL CHECK]
Replace every [[F]] and [[P]], leave no literal [[...]], retain exactly 40 .full-slide sections, and include no Appendix. Return the raw complete HTML now.`;
}

function fieldSelector(key: string): string {
  return `[data-report-field="${key.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"]`;
}

function assertWorkbookSkeleton(documentRef: Document): void {
  const slides = Array.from(documentRef.querySelectorAll<HTMLElement>('.full-slide'));
  if (slides.length !== FULL_REPORT_PAGE_IDS.length) {
    throw new Error(`경량 HTML 작업문서는 정확히 40페이지여야 한다. 현재 ${slides.length}페이지다.`);
  }
  slides.forEach((slide, index) => {
    const expected = FULL_REPORT_PAGE_IDS[index];
    if (slide.id !== expected) {
      throw new Error(`경량 HTML P${String(index + 1).padStart(2, '0')} 순서 오류: expected #${expected}, received #${slide.id || 'missing'}`);
    }
  });
  if (documentRef.querySelector('[data-zone="appendix"],#creative-method')) {
    throw new Error('경량 HTML 작업문서에 Appendix 또는 Creative Methodology가 포함됐다.');
  }
}

function assertAllowedFieldMarkup(element: HTMLElement, kind: StructuredFieldKind, key: string): void {
  const descendants = Array.from(element.querySelectorAll<HTMLElement>('*'));
  const invalid = descendants.find((node) => kind !== 'rich' || (node.tagName !== 'MARK' && node.tagName !== 'BR'));
  if (invalid) {
    throw new Error(`${key} 필드에 허용되지 않은 <${invalid.tagName.toLowerCase()}> 태그가 들어갔다.`);
  }
}

function returnedFields(
  documentRef: Document,
  definitions: StructuredFieldDefinition[],
): Map<string, HTMLElement> {
  const elements = Array.from(documentRef.querySelectorAll<HTMLElement>('[data-report-field]'));
  const map = new Map<string, HTMLElement>();
  elements.forEach((element) => {
    const key = element.dataset.reportField || '';
    if (!key) throw new Error('data-report-field 키가 비어 있다.');
    if (map.has(key)) throw new Error(`외부 HTML에 중복 의미 필드가 있다: ${key}`);
    map.set(key, element);
  });
  if (elements.length !== definitions.length) {
    throw new Error(`의미 필드 수가 변경됐다. expected ${definitions.length}, received ${elements.length}`);
  }
  definitions.forEach((definition) => {
    const element = map.get(definition.key);
    if (!element) throw new Error(`외부 HTML에서 의미 필드가 누락됐다: ${definition.key}`);
    const page = element.closest<HTMLElement>('.full-slide');
    if (page?.id !== definition.pageId) {
      throw new Error(`${definition.key} 필드가 승인 페이지 #${definition.pageId} 밖으로 이동했다.`);
    }
    const value = element.textContent || '';
    if (COMPACT_FIELD_TOKEN.test(value) || LEGACY_FIELD_TOKEN.test(value)) {
      throw new Error(`조사 내용으로 교체되지 않은 의미 필드가 남았다: ${definition.key}`);
    }
    assertAllowedFieldMarkup(element, definition.kind, definition.key);
  });
  for (const key of map.keys()) {
    if (!definitions.some((definition) => definition.key === key)) {
      throw new Error(`외부 HTML에 승인되지 않은 의미 필드가 추가됐다: ${key}`);
    }
  }
  return map;
}

function copyFieldValue(source: HTMLElement, target: HTMLElement, kind: StructuredFieldKind): void {
  if (kind === 'rich') {
    target.replaceChildren(...Array.from(source.childNodes).map((node) => node.cloneNode(true)));
    return;
  }
  target.textContent = source.textContent || '';
}

export function compileSemanticHtmlReportV6(
  externalAiOutput: string,
  approvedBaseHtml: string,
  brandName: string,
): string {
  const workbookHtml = extractCompleteHtmlDocument(externalAiOutput);
  const workbookDocument = parseReportHtml(workbookHtml);
  assertWorkbookSkeleton(workbookDocument);

  const fullTemplate = createSemanticHtmlTemplateV5(approvedBaseHtml, brandName);
  const fields = returnedFields(workbookDocument, fullTemplate.definitions);
  const expandedDocument = parseReportHtml(fullTemplate.html);

  fullTemplate.definitions.forEach((definition) => {
    const source = fields.get(definition.key);
    const target = expandedDocument.querySelector<HTMLElement>(fieldSelector(definition.key));
    if (!source || !target) throw new Error(`승인 Renderer에 의미 필드를 이식할 수 없다: ${definition.key}`);
    copyFieldValue(source, target, definition.kind);
  });

  const returnedCoordinateNodes = Array.from(
    workbookDocument.querySelectorAll<HTMLElement>('data[data-report-coordinate-field]'),
  );
  if (returnedCoordinateNodes.length !== POSITIONING_COORDINATE_KEYS.length) {
    throw new Error(`P18 좌표 필드 수가 변경됐다. expected ${POSITIONING_COORDINATE_KEYS.length}, received ${returnedCoordinateNodes.length}`);
  }
  POSITIONING_COORDINATE_KEYS.forEach((key) => {
    const source = workbookDocument.querySelector<HTMLElement>(`data[data-report-coordinate-field="${key}"]`);
    const target = expandedDocument.querySelector<HTMLElement>(`data[data-report-coordinate-field="${key}"]`);
    if (!source || !target) throw new Error(`P18 좌표 필드가 누락됐다: ${key}`);
    const value = (source.textContent || '').trim();
    if (COMPACT_POSITION_TOKEN.test(value) || LEGACY_POSITION_TOKEN.test(value)) {
      throw new Error(`P18 좌표 필드가 교체되지 않았다: ${key}`);
    }
    target.textContent = value;
  });

  return compileSemanticHtmlReportV5(
    serializeReportDocument(expandedDocument),
    approvedBaseHtml,
    brandName,
  );
}
