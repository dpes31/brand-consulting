export const FULL_REPORT_PAGE_COUNT = 40;

export const FULL_REPORT_PAGE_IDS = [
  'cover', 'executive', 'identity', 'kpi', 'category-target', 'growth', 'inflection', 'portfolio',
  'market-context', 'market-shift', 'comp-landscape', 'comp-ranking', 'deep-dive-1', 'deep-dive-2',
  'deep-dive-3', 'product-matrix', 'category-cliche', 'positioning', 'consumer-exec',
  'consumer-trends', 'consumer-target', 'persona-1', 'persona-2', 'persona-3', 'jtbd', 'pain-needs',
  'aipl', 'loyalty', 'creative-history-target', 'creative-history-1', 'creative-history-2',
  'creative-history-3', 'creative-trajectory', 'creative-insight', 'strategy-swot', 'root-cause', 'stp',
  'strategy-routes', 'strategy-choice', 'decision-close',
] as const;

const REQUIRED_PAGE_STRUCTURES: Record<string, string[]> = {
  'category-target': ['.category-layout', '.category-rings', '.target-statement', '.target-tension'],
  'comp-ranking': ['.ranking-table', '.ranking-interpretation'],
  'deep-dive-1': ['.deep-dive-layout', '.deep-dive-score', '.deep-dive-flow'],
  'deep-dive-2': ['.deep-dive-layout', '.deep-dive-score', '.deep-dive-flow'],
  'deep-dive-3': ['.deep-dive-layout', '.deep-dive-score', '.deep-dive-flow'],
  'category-cliche': ['.cliche-table', '.cliche-head', '.cliche-row'],
  positioning: ['.position-map', '.axis-x-left', '.axis-x-right', '.axis-y-top', '.axis-y-bottom'],
  'consumer-exec': ['.consumer-question-shift', '.jtbd-mini'],
  'consumer-trends': ['.trend-stack', '.trend-row'],
  'consumer-target': ['.target-spectrum', '.target-profile'],
  'persona-1': ['.persona-layout', '.persona-index', '.persona-left', '.persona-center', '.persona-right'],
  'persona-2': ['.persona-layout', '.persona-index', '.persona-left', '.persona-center', '.persona-right'],
  'persona-3': ['.persona-layout', '.persona-index', '.persona-left', '.persona-center', '.persona-right'],
  'pain-needs': ['.pain-table', '.pain-head', '.pain-row'],
  aipl: ['.aipl-layout', '.aipl-funnel', '.aipl-stage', '.friction-analysis'],
  loyalty: ['.relationship-loop', '.product-principles'],
  'creative-history-target': ['.history-grid', '.history-card', '.history-bottom'],
  'creative-history-1': ['.history-grid', '.history-card', '.history-bottom'],
  'creative-history-2': ['.history-grid', '.history-card', '.history-bottom'],
  'creative-history-3': ['.history-grid', '.history-card', '.history-bottom'],
  'creative-trajectory': ['.trajectory-map', '.trajectory-brand'],
  'creative-insight': ['.creative-gap-layout', '.current-copy', '.missing-character'],
  'root-cause': ['.root-cause-tree', '.root-evidence', '.root-gap', '.root-core', '.root-opportunity'],
  stp: ['.stp-layout', '.stp-segments', '.stp-target', '.stp-position'],
  'strategy-routes': ['.route-table', '.route-head', '.route-row'],
  'strategy-choice': ['.choice-layout', '.choice-criteria', '.choice-final'],
  'decision-close': ['.back-cover-copy'],
};

const FORBIDDEN_ACTIVE_SELECTOR = 'iframe,object,embed,form,input,textarea,select,option,button[formaction],audio[autoplay],video[autoplay]';
const URL_ATTRIBUTES = ['href', 'src', 'xlink:href', 'formaction', 'action'];

function parseHtml(source: string): Document {
  if (typeof DOMParser === 'undefined') throw new Error('HTML parser is unavailable.');
  return new DOMParser().parseFromString(source, 'text/html');
}

export function serializeReportDocument(documentRef: Document): string {
  return `<!DOCTYPE html>\n${documentRef.documentElement.outerHTML}`;
}

function setBrand(documentRef: Document, brandName?: string): void {
  if (!brandName?.trim()) return;
  const brand = documentRef.querySelector<HTMLElement>('.full-nav-brand, .report-brand');
  if (brand) {
    brand.replaceChildren(documentRef.createTextNode(brandName.trim()));
    const version = documentRef.createElement('span');
    version.textContent = 'FULL REPORT V3';
    brand.appendChild(version);
  }
  const toolbar = documentRef.querySelector<HTMLElement>('.full-report-toolbar strong');
  if (toolbar) toolbar.textContent = `${brandName.trim()} FULL REPORT`;
  documentRef.title = `${brandName.trim()} Strategic Report`;
}

function canonicalizePageIds(documentRef: Document, slides: HTMLElement[]): void {
  const idMap = new Map<string, string>();
  slides.forEach((slide, index) => {
    const expected = FULL_REPORT_PAGE_IDS[index];
    if (!expected) return;
    if (slide.id && slide.id !== expected) idMap.set(slide.id, expected);
    slide.id = expected;
  });

  documentRef.querySelectorAll<HTMLAnchorElement>('.full-nav a[href^="#"]').forEach((anchor) => {
    const oldId = (anchor.getAttribute('href') || '').slice(1);
    const nextId = idMap.get(oldId);
    if (nextId) anchor.setAttribute('href', `#${nextId}`);
  });

  if (idMap.size > 0) {
    documentRef.querySelectorAll<HTMLStyleElement>('style').forEach((style) => {
      let source = style.textContent || '';
      idMap.forEach((nextId, oldId) => {
        source = source.split(`#${oldId}`).join(`#${nextId}`);
      });
      style.textContent = source;
    });
  }
}

function ensureCanonicalStyle(documentRef: Document): void {
  const previous = documentRef.querySelector('style[data-structured-report-canonical="true"]');
  previous?.remove();
  const style = documentRef.createElement('style');
  style.dataset.structuredReportCanonical = 'true';
  style.textContent = `
body[data-content-contract="structured-report-v3"] .full-frame,
body[data-content-contract="legacy-sanitized-html-v1"] .full-frame{width:1280px!important;height:720px!important;min-width:1280px!important;min-height:720px!important}
body[data-content-contract="structured-report-v3"] .full-frame-inner,
body[data-content-contract="legacy-sanitized-html-v1"] .full-frame-inner{width:1280px!important;height:720px!important;transform:scale(1)!important;transform-origin:top left!important}
#category-target .target-statement h3{font-size:16px!important;line-height:1.48!important}
#category-target .target-tension b{font-size:11px!important;letter-spacing:.08em}
#category-target .target-tension p{font-size:13px!important;line-height:1.48!important}
#comp-ranking .ranking-interpretation{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:18px!important;width:100%!important}
#comp-ranking .ranking-interpretation>div{text-align:center!important;min-width:0!important}
#category-cliche .cliche-head,#category-cliche .cliche-row{grid-template-columns:1.05fr 1.35fr 1.6fr!important;gap:20px!important}
#category-cliche .cliche-row{min-height:86px!important;padding:14px 16px!important}
#category-cliche .cliche-row b{font-size:13px!important;line-height:1.42!important}
#category-cliche .cliche-row p,#category-cliche .cliche-row strong{font-size:12px!important;line-height:1.5!important}
#consumer-exec .consumer-question-shift strong,#consumer-exec .jtbd-mini th,#consumer-exec .jtbd-mini td,
#consumer-trends .trend-row p,#consumer-trends .trend-row strong,#consumer-target .target-spectrum p,
.persona-left li,.persona-fears p,.identity-shift p,.brand-role strong,#pain-needs .pain-row b,
#pain-needs .pain-row p,#pain-needs .pain-row strong,#aipl .aipl-stage strong,#aipl .aipl-stage p,
#loyalty .relationship-loop p,#creative-trajectory .trajectory-brand span,#root-cause .root-cause-tree p,
#stp .stp-layout p,#strategy-routes .route-row p{font-size:12px!important;line-height:1.48!important}
.persona-label,#pain-needs .pain-head,#aipl .aipl-stage span,#creative-insight .current-copy>span,
#creative-insight .missing-character>span,#stp .stp-layout>div>span{font-size:11px!important}
#market-context .market-force strong{font-size:12px!important;line-height:1.5!important}
.persona-index{white-space:nowrap!important;word-break:normal!important;overflow-wrap:normal!important}
@media print{.full-frame{width:1280px!important;height:720px!important}.full-frame-inner{transform:none!important}}
`;
  documentRef.head.appendChild(style);
}

export function canonicalizeReportDocument(documentRef: Document, brandName?: string): void {
  const slides = Array.from(documentRef.querySelectorAll<HTMLElement>('.full-slide'));
  canonicalizePageIds(documentRef, slides);
  slides.forEach((slide, index) => {
    slide.dataset.page = String(index + 1);
    slide.dataset.zone = 'main';
    slide.style.width = '1280px';
    slide.style.height = '720px';
    slide.style.minWidth = '1280px';
    slide.style.minHeight = '720px';
    const frame = slide.closest<HTMLElement>('.full-frame');
    if (frame) {
      frame.style.width = '1280px';
      frame.style.height = '720px';
      frame.style.minWidth = '1280px';
      frame.style.minHeight = '720px';
    }
    const inner = slide.closest<HTMLElement>('.full-frame-inner');
    if (inner) {
      inner.style.width = '1280px';
      inner.style.height = '720px';
      inner.style.transform = 'scale(1)';
      inner.style.transformOrigin = 'top left';
    }
  });

  const content = documentRef.querySelector<HTMLElement>('.full-report-content');
  if (content) {
    content.style.setProperty('--report-logical-width', '1280px');
    content.style.setProperty('--report-logical-height', '720px');
  }

  documentRef.body.dataset.reportVersion = 'full-report-v1';
  documentRef.body.dataset.phase6PagePlan = 'focus3-main40-no-appendix-v3';
  documentRef.body.dataset.reportPageCount = String(FULL_REPORT_PAGE_COUNT);
  documentRef.body.dataset.reportAppendixCount = '0';
  documentRef.documentElement.lang = 'ko';
  setBrand(documentRef, brandName);
  ensureCanonicalStyle(documentRef);
}

export function assertReportSkeleton(documentRef: Document): void {
  const slides = Array.from(documentRef.querySelectorAll<HTMLElement>('.full-slide'));
  if (slides.length !== FULL_REPORT_PAGE_COUNT) {
    throw new Error(`FULL 보고서는 정확히 ${FULL_REPORT_PAGE_COUNT}페이지여야 한다. 현재 ${slides.length}페이지다.`);
  }
  const ids = slides.map((slide) => slide.id);
  FULL_REPORT_PAGE_IDS.forEach((id, index) => {
    if (ids[index] !== id) throw new Error(`P${String(index + 1).padStart(2, '0')} 구조 오류: expected #${id}, received #${ids[index] || 'missing'}`);
  });
  if (new Set(ids).size !== FULL_REPORT_PAGE_COUNT) throw new Error('슬라이드 ID가 누락되거나 중복됐다.');
  if (documentRef.querySelector('#creative-method,[data-zone="appendix"]')) throw new Error('삭제 대상 Methodology 또는 Appendix가 남아 있다.');

  Object.entries(REQUIRED_PAGE_STRUCTURES).forEach(([id, selectors]) => {
    const slide = documentRef.getElementById(id);
    if (!slide) throw new Error(`필수 페이지 #${id}가 없다.`);
    selectors.forEach((selector) => {
      if (!slide.querySelector(selector)) throw new Error(`#${id} 구조 오류: ${selector}가 없다.`);
    });
  });
}

function sanitizeActiveContent(documentRef: Document): void {
  documentRef.querySelectorAll('script,noscript,base').forEach((node) => node.remove());
  documentRef.querySelectorAll('meta[http-equiv]').forEach((node) => {
    if ((node.getAttribute('http-equiv') || '').toLowerCase() === 'refresh') node.remove();
  });

  documentRef.querySelectorAll<HTMLElement>('*').forEach((element) => {
    Array.from(element.attributes).forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      const value = attribute.value.trim();
      if (name.startsWith('on')) element.removeAttribute(attribute.name);
      if (URL_ATTRIBUTES.includes(name) && /^\s*javascript:/i.test(value)) element.removeAttribute(attribute.name);
    });
  });

  const forbidden = documentRef.querySelector(FORBIDDEN_ACTIVE_SELECTOR);
  if (forbidden) throw new Error(`허용되지 않은 능동 콘텐츠가 포함됐다: <${forbidden.tagName.toLowerCase()}>`);
}

export function extractCompleteHtmlDocument(output: string): string {
  let value = output.trim();
  const fenced = value.match(/```html\s*([\s\S]*?)```/i) || value.match(/```\s*(<!doctype[\s\S]*?<\/html>)\s*```/i);
  if (fenced) value = fenced[1].trim();
  const start = value.search(/<!doctype\s+html/i);
  const matches = Array.from(value.matchAll(/<\/html\s*>/ig));
  const end = matches.length ? (matches.at(-1)?.index || 0) + (matches.at(-1)?.[0].length || 0) : -1;
  if (start < 0 || end <= start) throw new Error('완전한 HTML 문서를 확인할 수 없다.');
  return value.slice(start, end).trim();
}

export function sanitizeCompatibleFullReportHtml(source: string, brandName?: string): string {
  const html = extractCompleteHtmlDocument(source);
  const documentRef = parseHtml(html);
  sanitizeActiveContent(documentRef);
  canonicalizeReportDocument(documentRef, brandName);
  assertReportSkeleton(documentRef);
  documentRef.body.dataset.contentContract = 'legacy-sanitized-html-v1';
  documentRef.body.dataset.contentState = 'sanitized';
  return serializeReportDocument(documentRef);
}

function fingerprintNode(node: Element): string {
  const field = node.getAttribute('data-report-field') || '';
  // Field containers may change text, inline highlighting, and approved status
  // classes. The fingerprint locks the field key and every component outside it.
  const classes = field ? '' : Array.from(node.classList).sort().join('.');
  const children = field ? '' : Array.from(node.children).map(fingerprintNode).join('');
  return `<${node.tagName.toLowerCase()}#${node.id}.${classes}[${field}]>${children}</${node.tagName.toLowerCase()}>`;
}

export function computeReportDomFingerprint(documentRef: Document): string {
  return FULL_REPORT_PAGE_IDS.map((id) => {
    const slide = documentRef.getElementById(id);
    if (!slide) throw new Error(`DOM fingerprint 실패: #${id}가 없다.`);
    return fingerprintNode(slide);
  }).join('|');
}

export function parseReportHtml(source: string): Document {
  return parseHtml(source);
}
