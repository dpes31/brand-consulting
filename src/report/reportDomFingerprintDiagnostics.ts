import { FULL_REPORT_PAGE_IDS } from './reportDomSafety';

const DYNAMIC_CLASSES = new Set([
  'is-verified',
  'is-unverified',
  'is-not-found',
  'verified',
  'selected',
  'is-selected',
]);

function fingerprintNode(node: Element): string {
  const field = node.getAttribute('data-report-field') || '';
  const classes = field
    ? ''
    : Array.from(node.classList)
        .filter((className) => !DYNAMIC_CLASSES.has(className))
        .sort()
        .join('.');
  const children = field ? '' : Array.from(node.children).map(fingerprintNode).join('');
  return `<${node.tagName.toLowerCase()}#${node.id}.${classes}[${field}]>${children}</${node.tagName.toLowerCase()}>`;
}

export function findReportDomFingerprintMismatches(
  approvedDocument: Document,
  importedDocument: Document,
): string[] {
  return FULL_REPORT_PAGE_IDS.filter((id) => {
    const approved = approvedDocument.getElementById(id);
    const imported = importedDocument.getElementById(id);
    if (!approved || !imported) return true;
    return fingerprintNode(approved) !== fingerprintNode(imported);
  });
}
