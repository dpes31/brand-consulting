import {
  annotateStructuredReportDocument,
  validateStructuredReportV3,
  type StructuredFieldDefinition,
  type StructuredFieldKind,
  type StructuredReportPageV3,
  type StructuredReportV3,
} from './structuredReportV3';
import {
  canonicalizeReportDocument,
  computeReportDomFingerprint,
  parseReportHtml,
  serializeReportDocument,
} from './reportDomSafety';
import {
  applyStructuredDefinitionPolicy,
  isGenericOrderField,
  mapStructuredFieldKey,
} from './structuredDefinitionPolicy';

const FIELD_ATTRIBUTES = [
  'data-report-field',
  'data-report-hint',
  'data-report-max-length',
  'data-report-kind',
  'data-report-enum',
  'data-report-fixed-year',
] as const;

const STRUCTURAL_ONLY_VALUES = new Set([
  '1', '2', '3', '4', '5', '01', '02', '03', '04', '05',
  'A', 'B', 'C', 'D', 'I', 'L', 'P1', 'P2',
  'PRIMARY', 'SECONDARY', 'OPPORTUNITY', 'LOW COMPLEXITY', 'HIGH COMPLEXITY',
  'EVIDENCE', 'CORE DESIRE', 'APPEAL', 'THREAT MECHANISM', 'ATTACK POINT',
  'SITUATION', 'REAL JTBD', 'AS-IS IDENTITY', 'TO-BE IDENTITY',
  'PAIN', 'UNMET NEED', 'SEGMENTATION', 'TARGETING', 'POSITIONING',
  'BIG IDEAL', 'WINNING MOVE', 'VIA NEGATIVA', 'DECISION', 'CHANGE', 'SO WHAT',
  'FUNCTIONAL', 'EMOTIONAL', 'SOCIAL',
]);

function normalizedToken(value: string | undefined): string {
  return (value || '').replace(/\s+/g, ' ').trim();
}

function isStructuralOnly(value: string | undefined): boolean {
  const token = normalizedToken(value);
  return !token
    || /^\d+$/.test(token)
    || /^[→↗⇒≠+?]+$/.test(token)
    || STRUCTURAL_ONLY_VALUES.has(token.toUpperCase());
}

function page(report: StructuredReportV3, id: string): StructuredReportPageV3 | undefined {
  return report.pages?.find((item) => item.id === id);
}

function field(report: StructuredReportV3, pageId: string, key: string): string {
  return normalizedToken(page(report, pageId)?.fields?.[key]);
}

function assertMeaningful(
  report: StructuredReportV3,
  pageId: string,
  key: string,
  label: string,
  errors: string[],
): void {
  const value = field(report, pageId, key);
  if (isStructuralOnly(value)) {
    errors.push(`${label}에 숫자·화살표·표 머리말 같은 구조값 “${value || '빈 값'}”이 들어갔다.`);
  }
}

function validateSemanticRecords(report: StructuredReportV3, expectedBrand: string): string[] {
  const errors: string[] = [];

  const ranking = page(report, 'comp-ranking');
  const names = [1, 2, 3].map((rank) => field(report, 'comp-ranking', `comp-ranking.rank${rank}.name`));
  names.forEach((name, index) => {
    const rank = index + 1;
    if (isStructuralOnly(name)) {
      errors.push(
        `P12 Threat Ranking · ${rank}위 경쟁사명 필드에 경쟁사명이 아닌 “${name || '빈 값'}”이 들어갔다. `
        + '순위 숫자·평가 항목·설명 문구가 아니라 실제 경쟁사명을 입력해야 한다.',
      );
      return;
    }
    const summary = normalizedToken(ranking?.fields?.[`comp-ranking.rank${rank}.summaryName`]);
    if (summary !== name) {
      errors.push(`P12 Threat Ranking · ${rank}위 하단 카드의 경쟁사명 “${summary || '빈 값'}”이 표의 경쟁사명 “${name}”과 다르다.`);
    }
  });
  if (new Set(names.filter(Boolean)).size !== names.filter(Boolean).length) {
    errors.push('P12 Threat Ranking · 핵심 경쟁사 3개의 이름이 중복됐다.');
  }

  const matrixBrand = field(report, 'product-matrix', 'product-matrix.column1.name');
  if (matrixBrand !== expectedBrand.trim()) {
    errors.push(`P16 Product Matrix · 첫 번째 브랜드 열은 입력 브랜드명 “${expectedBrand.trim()}”이어야 한다.`);
  }

  [1, 2, 3].forEach((index) => {
    const targetName = field(report, 'consumer-target', `consumer-target.target${index}.name`);
    if (isStructuralOnly(targetName)) {
      errors.push(`P21 Core Target · 타깃 ${index} 이름에 역할 라벨이나 숫자 “${targetName || '빈 값'}”을 사용할 수 없다.`);
    }
    const personaId = `persona-${index}`;
    [1, 2, 3, 4].forEach((itemIndex) => {
      const key = `${personaId}.situation${itemIndex}`;
      const value = field(report, personaId, key);
      if (value && isStructuralOnly(value)) {
        errors.push(`P${21 + index} Persona · 상황 ${itemIndex}에 실제 상황 문장 대신 “${value}”이 들어갔다.`);
      }
    });
    ['surfaceNeed', 'realJob', 'fear1', 'asIsIdentity', 'toBeIdentity', 'brandRole'].forEach((role) => {
      assertMeaningful(report, personaId, `${personaId}.${role}`, `P${21 + index} Persona · ${role}`, errors);
    });
  });

  [1, 2, 3].forEach((row) => {
    ['jobType', 'desiredProgress', 'currentAlternative', 'limitation', 'brandOpportunity'].forEach((role) => {
      assertMeaningful(report, 'jtbd', `jtbd.row${row}.${role}`, `P25 JTBD · ${row}행 ${role}`, errors);
    });
  });

  [1, 2, 3, 4, 5].forEach((index) => {
    ['action', 'evidence', 'state'].forEach((role) => {
      assertMeaningful(report, 'aipl', `aipl.stage${index}.${role}`, `P27 AIPL · ${index}단계 ${role}`, errors);
    });
  });

  ['stp.target.name', 'stp.target.description', 'stp.positioning'].forEach((key) => {
    assertMeaningful(report, 'stp', key, `P37 STP · ${key}`, errors);
  });

  ['A', 'B', 'C', 'D'].forEach((route) => {
    ['type', 'proposition', 'direction', 'tradeoff'].forEach((role) => {
      assertMeaningful(
        report,
        'strategy-routes',
        `strategy-routes.route${route}.${role}`,
        `P38 Four Strategic Directions · ${route}안 ${role}`,
        errors,
      );
    });
  });

  ['strategy-choice.bigIdeal', 'strategy-choice.winningMove', 'strategy-choice.proof'].forEach((key) => {
    assertMeaningful(report, 'strategy-choice', key, `P39 Final Choice · ${key}`, errors);
  });

  return errors;
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
    element.dataset.reportMaxLength = String(definition.maxLength);
  });

  const renderedKeys = Array.from(documentRef.querySelectorAll<HTMLElement>('[data-report-field]'))
    .map((element) => element.dataset.reportField || '');
  const expectedKeys = definitions.map((definition) => definition.key);
  if (renderedKeys.length !== expectedKeys.length || new Set(renderedKeys).size !== renderedKeys.length) {
    throw new Error('40페이지 Renderer의 의미 필드 수 또는 키가 일치하지 않는다.');
  }

  return definitions;
}

function appendSafeRichText(documentRef: Document, element: Element, value: string): void {
  element.replaceChildren();
  value.split(/(\[\[[\s\S]*?\]\]|\n)/g).filter(Boolean).forEach((part) => {
    if (part === '\n') {
      element.appendChild(documentRef.createElement('br'));
      return;
    }
    const highlight = part.match(/^\[\[([\s\S]*?)\]\]$/);
    if (highlight) {
      const mark = documentRef.createElement('mark');
      mark.textContent = highlight[1];
      element.appendChild(mark);
    } else {
      element.appendChild(documentRef.createTextNode(part));
    }
  });
}

function applyValue(
  documentRef: Document,
  element: HTMLElement,
  value: string,
  kind: StructuredFieldKind,
): void {
  if (kind === 'rich') appendSafeRichText(documentRef, element, value);
  else if (kind === 'source') element.textContent = `SOURCE · ${value}`;
  else element.textContent = value;

  if (kind === 'status') {
    const status = value.trim();
    element.className = `history-status history-status--${status}`;
    const card = element.closest<HTMLElement>('.history-card');
    if (card) {
      card.dataset.copyStatus = status;
      card.classList.toggle('is-verified', status === 'verified-verbatim');
    }
  }
}

function restoreFixedLeadingText(element: HTMLElement): void {
  const value = element.dataset.reportFixedLeading;
  if (value === undefined) return;
  const firstText = Array.from(element.childNodes).find((node) => node.nodeType === Node.TEXT_NODE);
  if (firstText) firstText.nodeValue = value;
  else element.insertBefore(element.ownerDocument.createTextNode(value), element.firstChild);
}

export function renderSemanticReportV4(
  approvedBaseHtml: string,
  report: StructuredReportV3,
  expectedBrand: string,
): string {
  const documentRef = parseReportHtml(approvedBaseHtml);
  const definitions = prepareSemanticDocument(documentRef, expectedBrand);
  const beforeFingerprint = computeReportDomFingerprint(documentRef);
  const errors = [
    ...validateStructuredReportV3(report, definitions, expectedBrand),
    ...validateSemanticRecords(report, expectedBrand),
  ];
  if (errors.length) {
    throw new Error(`40페이지 의미 검증 오류\n${errors.slice(0, 30).join('\n')}${errors.length > 30 ? `\n외 ${errors.length - 30}건` : ''}`);
  }

  const values = new Map<string, string>();
  report.pages.forEach((reportPage) => {
    Object.entries(reportPage.fields).forEach(([key, value]) => values.set(key, value));
  });
  const definitionByKey = new Map(definitions.map((definition) => [definition.key, definition]));

  documentRef.querySelectorAll<HTMLElement>('[data-report-field]').forEach((element) => {
    const key = element.dataset.reportField || '';
    const definition = definitionByKey.get(key);
    const value = values.get(key);
    if (!definition || value === undefined) throw new Error(`렌더링 의미 필드가 누락됐다: ${key}`);
    applyValue(documentRef, element, value, definition.kind);
  });
  documentRef.querySelectorAll<HTMLElement>('[data-report-fixed-leading]').forEach(restoreFixedLeadingText);

  canonicalizeReportDocument(documentRef, expectedBrand);
  documentRef.body.dataset.contentContract = 'semantic-report-v4';
  documentRef.body.dataset.contentState = 'compiled';
  documentRef.body.dataset.reportAppendixCount = '0';
  const afterFingerprint = computeReportDomFingerprint(documentRef);
  if (beforeFingerprint !== afterFingerprint) {
    throw new Error('앱 소유 40페이지 DOM 구조가 렌더링 중 변경됐다.');
  }
  return serializeReportDocument(documentRef);
}
