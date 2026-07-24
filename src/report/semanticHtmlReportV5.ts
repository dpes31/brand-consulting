import {
  STRUCTURED_REPORT_VERSION,
  annotateStructuredReportDocument,
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
import { assertStructuredReportCrossPage } from './structuredReportCrossValidation';
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

function cleanResearch(raw: string): string {
  return raw.replace(/\[cite.*?\]|\\cite.*?|\[cite_start\]/g, '');
}

function removeFieldAttributes(element: HTMLElement): void {
  FIELD_ATTRIBUTES.forEach((attribute) => element.removeAttribute(attribute));
}

function prepareSemanticDocument(
  documentRef: Document,
  brandName: string,
): StructuredFieldDefinition[] {
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
- Replace only the text token inside each element marked data-report-field.
- Every [[FIELD:semantic.key]] token must be replaced with the content for that exact semantic role.
- Never move content between fields, create a new field, remove a field, merge fields, or place prose in numbers, labels, arrows, axes, or table headings.
- Return the complete HTML from <!DOCTYPE html> through </html> in one \`\`\`html code block.

[STEP 0–5 RESEARCH — SOURCE OF TRUTH]
${cleanResearch(rawResearch)}

[STRATEGIC WRITING RULES]
- Use only the Step 0–5 research above. Do not invent facts, figures, dates, quotations, competitors, scores, axes, models, or sources.
- Titles and SO WHAT statements use decisive Korean consulting language: ~한다, ~이다, ~다.
- Preserve the page logic: Brand Fact → Market/Competitor → Consumer tension → Creative gap → Root Cause → STP → Four Routes → Final Choice → Decision Close.
- P11 reviews up to five evidence-supported direct competitors. P12 selects the core three.
- P13–18 and P30–33 must use the same three competitors in the same ranking order.
- P22–24 Persona titles must exactly match the first three target names on P21.
- P27 keeps A → I → P1 → P2 → L and keeps action, evidence, and state separate.
- P37 keeps Segmentation → Targeting → Positioning.
- P38 keeps A/B/C/D route boundaries. P39 is the final choice. P40 compresses P39 into one governing decision.
- Use [[important phrase]] only inside a field value for a short highlight. Do not add HTML tags inside field values.
- Respect each data-report-max-length as a hard limit. Summarize instead of shrinking type.
- Raw URLs are prohibited. Use publisher · material title · year.

[CREATIVE HISTORY FACTUALITY]
${creativeDirective || 'Use verified-verbatim / source-found-copy-unverified / not-found exactly. Keep 2021–2025 and 2026 YTD. Only verified-verbatim copy may use quotation marks.'}

[IMMUTABLE 40-PAGE SEMANTIC HTML TEMPLATE — START]
${semanticTemplateHtml}
[IMMUTABLE 40-PAGE SEMANTIC HTML TEMPLATE — END]

[FINAL CHECK]
Confirm that every [[FIELD:...]] token is replaced, no structure is changed, and the result contains exactly 40 .full-slide elements and no Appendix. Return the complete HTML now.`;
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

function fieldValue(element: HTMLElement, kind: StructuredFieldKind): string {
  if (kind === 'rich') return richTextValue(element);
  const value = (element.textContent || '').replace(/\s+/g, ' ').trim();
  if (kind === 'source') return value.replace(/^SOURCE\s*·\s*/i, '').trim();
  return value;
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
): StructuredReportV3 {
  const byKey = assertFieldSetsMatch(returnedDocument, definitions);
  const values = new Map<string, string>();

  definitions.forEach((definition) => {
    const element = byKey.get(definition.key);
    if (!element) throw new Error(`의미 필드를 읽을 수 없다: ${definition.key}`);
    const value = fieldValue(element, definition.kind);
    if (FIELD_TOKEN.test(value) || UNRESOLVED_FIELD_TOKEN.test(value)) {
      throw new Error(`조사 내용으로 교체되지 않은 의미 필드가 남았다: ${definition.key}`);
    }
    values.set(definition.key, value);
  });

  return {
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
  };
}

export function compileSemanticHtmlReportV5(
  externalAiOutput: string,
  approvedBaseHtml: string,
  brandName: string,
): string {
  const approvedDocument = parseReportHtml(approvedBaseHtml);
  const approvedDefinitions = prepareSemanticDocument(approvedDocument, brandName);
  const approvedFingerprint = computeReportDomFingerprint(approvedDocument);

  const sanitizedReturnedHtml = sanitizeCompatibleFullReportHtml(externalAiOutput, brandName);
  const returnedDocument = parseReportHtml(sanitizedReturnedHtml);
  const returnedDefinitions = prepareSemanticDocument(returnedDocument, brandName);
  const returnedFingerprint = computeReportDomFingerprint(returnedDocument);

  if (approvedFingerprint !== returnedFingerprint) {
    throw new Error('외부 AI가 승인된 40페이지 DOM·컴포넌트 구조를 변경했다. 텍스트 필드만 작성해야 한다.');
  }
  if (
    approvedDefinitions.length !== returnedDefinitions.length
    || approvedDefinitions.some((definition, index) => definition.key !== returnedDefinitions[index]?.key)
  ) {
    throw new Error('외부 HTML의 의미 필드 순서 또는 역할이 승인 템플릿과 다르다.');
  }

  const report = reportFromReturnedHtml(returnedDocument, approvedDefinitions, brandName);
  assertStructuredReportCrossPage(report);
  const finalHtml = renderSemanticReportV4(approvedBaseHtml, report, brandName);
  const finalDocument = parseReportHtml(finalHtml);
  finalDocument.body.dataset.contentContract = 'semantic-html-v5';
  finalDocument.body.dataset.contentState = 'compiled';
  finalDocument.body.dataset.reportAppendixCount = '0';
  return serializeReportDocument(finalDocument);
}
