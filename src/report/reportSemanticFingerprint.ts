import { FULL_REPORT_PAGE_IDS } from './reportDomSafety';

const DYNAMIC_CLASSES = new Set([
  'is-verified',
  'is-unverified',
  'is-not-found',
  'verified',
  'selected',
  'is-selected',
]);

const STRUCTURE_SELECTORS: Record<string, string[]> = {
  'category-target': ['.category-layout', '.category-rings', '.target-statement', '.target-tension'],
  'comp-ranking': ['.ranking-table', '.ranking-interpretation', '.ranking-interpretation > div'],
  'deep-dive-1': ['.deep-dive-layout', '.deep-dive-score', '.deep-node'],
  'deep-dive-2': ['.deep-dive-layout', '.deep-dive-score', '.deep-node'],
  'deep-dive-3': ['.deep-dive-layout', '.deep-dive-score', '.deep-node'],
  'category-cliche': ['.cliche-table', '.cliche-head > *', '.cliche-row', '.cliche-row > *'],
  positioning: ['.position-map', '.axis', '.map-dot', '.map-arrow'],
  'consumer-exec': ['.consumer-question-shift > div', '.consumer-question-shift > i', '.jtbd-mini tbody tr'],
  'consumer-trends': ['.trend-row', '.trend-row > div'],
  'consumer-target': ['.target-spectrum > div', '.target-profile > *'],
  'persona-1': ['.persona-layout', '.persona-left', '.persona-center', '.persona-right', '.identity-shift > *'],
  'persona-2': ['.persona-layout', '.persona-left', '.persona-center', '.persona-right', '.identity-shift > *'],
  'persona-3': ['.persona-layout', '.persona-left', '.persona-center', '.persona-right', '.identity-shift > *'],
  'pain-needs': ['.pain-head > *', '.pain-row', '.pain-row > *'],
  aipl: ['.aipl-stage', '.aipl-stage > *', '.friction-analysis'],
  loyalty: ['.relationship-loop > div', '.product-principles > *'],
  'creative-history-target': ['.history-card', '.history-bottom > div'],
  'creative-history-1': ['.history-card', '.history-bottom > div'],
  'creative-history-2': ['.history-card', '.history-bottom > div'],
  'creative-history-3': ['.history-card', '.history-bottom > div'],
  'creative-trajectory': ['.trajectory-brand', '.trajectory-brand > *'],
  'creative-insight': ['.current-copy', '.gap-arrow', '.missing-character'],
  'root-cause': ['.root-evidence', '.root-gap', '.root-core', '.root-opportunity'],
  stp: ['.stp-segments', '.stp-arrow', '.stp-target', '.stp-position'],
  'strategy-routes': ['.route-head > *', '.route-row', '.route-row > *'],
  'strategy-choice': ['.choice-criteria', '.choice-final'],
  'decision-close': ['.back-cover-copy'],
};

function stableClasses(element: Element): string {
  return Array.from(element.classList)
    .filter((className) => !DYNAMIC_CLASSES.has(className))
    .sort()
    .join('.');
}

function siblingIndex(element: Element): number {
  const siblings = Array.from(element.parentElement?.children || [])
    .filter((sibling) => sibling.tagName === element.tagName && stableClasses(sibling) === stableClasses(element));
  return Math.max(0, siblings.indexOf(element));
}

function semanticPath(element: Element, slide: Element): string {
  const segments: string[] = [];
  let current: Element | null = element;
  while (current && current !== slide) {
    const classes = stableClasses(current);
    segments.unshift(`${current.tagName.toLowerCase()}${classes ? `.${classes}` : ''}[${siblingIndex(current)}]`);
    current = current.parentElement;
  }
  return segments.join('>');
}

function normalizedFixedText(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function pageFingerprint(slide: Element): string {
  const selectors = STRUCTURE_SELECTORS[slide.id] || [];
  const structures = selectors.map((selector) => `${selector}=${slide.querySelectorAll(selector).length}`);

  const fields = Array.from(slide.querySelectorAll<HTMLElement>('[data-report-field]')).map((element) => {
    const key = element.dataset.reportField || '';
    const kind = element.dataset.reportKind || 'text';
    return `${key}:${kind}@${semanticPath(element, slide)}`;
  });

  const fixed = Array.from(slide.querySelectorAll<HTMLElement>('[data-report-fixed]')).map((element) => {
    return `${normalizedFixedText(element.textContent || '')}@${semanticPath(element, slide)}`;
  });

  const fixedLeading = Array.from(slide.querySelectorAll<HTMLElement>('[data-report-fixed-leading]')).map((element) => {
    return `${element.dataset.reportFixedLeading || ''}@${semanticPath(element, slide)}`;
  });

  return JSON.stringify({ id: slide.id, structures, fields, fixed, fixedLeading });
}

export function computeSemanticReportFingerprint(documentRef: Document): string {
  return FULL_REPORT_PAGE_IDS.map((id) => {
    const slide = documentRef.getElementById(id);
    if (!slide) return JSON.stringify({ id, missing: true });
    return pageFingerprint(slide);
  }).join('\n');
}

export function findSemanticReportFingerprintMismatches(
  approvedDocument: Document,
  importedDocument: Document,
): string[] {
  return FULL_REPORT_PAGE_IDS.filter((id) => {
    const approved = approvedDocument.getElementById(id);
    const imported = importedDocument.getElementById(id);
    if (!approved || !imported) return true;
    return pageFingerprint(approved) !== pageFingerprint(imported);
  });
}
