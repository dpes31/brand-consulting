const PLAN_VERSION = 'approved-sample-main40-appendix8-html-v1';
const MAIN_COUNT = 40;
const APPENDIX_COUNT = 8;

const MAIN_IDS = [
  'cover','executive','identity','kpi','category-target','growth','inflection','portfolio',
  'market-context','market-shift','comp-landscape','comp-ranking',
  'deep-삼쩜삼','deep-더낸세금·혜움','deep-SSEM','product-matrix','category-cliche','positioning',
  'consumer-exec','consumer-trends','consumer-target','persona-1','persona-2','persona-3',
  'jtbd','pain-needs','aipl','loyalty',
  'creative-method','creative-비즈넵','creative-삼쩜삼','creative-더낸세금·혜움','creative-SSEM·쌤157',
  'creative-trajectory','creative-insight',
  'strategy-swot','root-cause','stp','strategy-routes','strategy-choice',
] as const;

const APPENDIX_IDS = [
  'appendix-receipt','appendix-negative','appendix-premortem','appendix-roadmap',
  'appendix-measure','appendix-evidence','appendix-sources','appendix-back',
] as const;

const NAV_GROUPS = [
  ['0. BRAND FACT BOOK', MAIN_IDS.slice(0, 8)],
  ['I. MARKET', MAIN_IDS.slice(8, 10)],
  ['II. COMPETITOR', MAIN_IDS.slice(10, 18)],
  ['III. CONSUMER', MAIN_IDS.slice(18, 28)],
  ['IV. CREATIVE', MAIN_IDS.slice(28, 35)],
  ['V. STRATEGY', MAIN_IDS.slice(35, 40)],
  ['APPENDIX', APPENDIX_IDS],
] as const;

function getSlide(documentRef: Document, id: string): HTMLElement {
  const node = documentRef.getElementById(id);
  if (!(node instanceof HTMLElement)) throw new Error(`Missing approved Phase 6 slide: ${id}`);
  return node;
}

function restoreApprovedLabels(documentRef: Document): void {
  const tensionLabels = documentRef.querySelectorAll<HTMLElement>('#category-target .target-tension > b');
  if (tensionLabels[0]) tensionLabels[0].textContent = 'WANT';
  if (tensionLabels[1]) tensionLabels[1].textContent = 'AVOID';

  const deepSlides = ['deep-삼쩜삼', 'deep-더낸세금·혜움', 'deep-SSEM'];
  deepSlides.forEach((id, index) => {
    const slide = getSlide(documentRef, id);
    const scoreLabel = slide.querySelector<HTMLElement>('.deep-dive-score > small');
    if (scoreLabel) scoreLabel.textContent = `위협 ${index + 1}순위`;
    const labels = Array.from(slide.querySelectorAll<HTMLElement>('.deep-node > small'));
    ['Evidence', 'Core Desire', 'Appeal', 'Threat Mechanism', 'Attack Point'].forEach((copy, labelIndex) => {
      if (labels[labelIndex]) labels[labelIndex].textContent = copy;
    });
  });

  const clicheHead = documentRef.querySelector<HTMLElement>('#category-cliche .cliche-head');
  const fourthHead = clicheHead?.children.item(3);
  if (fourthHead) fourthHead.remove();
  documentRef.querySelectorAll('#category-cliche .cliche-row > strong').forEach((node) => node.remove());

  const historyYears = ['2021', '2022', '2023', '2024', '2025', '2026 YTD'];
  documentRef.querySelectorAll<HTMLElement>('.history-original').forEach((slide) => {
    Array.from(slide.querySelectorAll<HTMLElement>('.history-card > h3')).forEach((heading, index) => {
      if (historyYears[index]) heading.textContent = historyYears[index];
    });
  });
}

function applyPageMetadata(documentRef: Document): void {
  [...MAIN_IDS, ...APPENDIX_IDS].forEach((id, index) => {
    const slide = getSlide(documentRef, id);
    const isMain = index < MAIN_COUNT;
    slide.dataset.page = String(index + 1);
    slide.dataset.zone = isMain ? 'main' : 'appendix';
    const page = slide.querySelector<HTMLElement>('.full-page');
    if (page) page.textContent = isMain
      ? String(index + 1).padStart(2, '0')
      : `A${index - MAIN_COUNT + 1}`;
  });
}

function rebuildNavigation(documentRef: Document): void {
  const nav = documentRef.querySelector<HTMLElement>('.full-nav');
  if (!nav) return;
  nav.querySelectorAll('.full-nav-group').forEach((group) => group.remove());
  let pageNumber = 0;
  NAV_GROUPS.forEach(([title, ids]) => {
    const group = documentRef.createElement('div');
    group.className = 'full-nav-group';
    const heading = documentRef.createElement('strong');
    heading.textContent = title;
    group.appendChild(heading);
    ids.forEach((id) => {
      pageNumber += 1;
      const anchor = documentRef.createElement('a');
      anchor.href = `#${id}`;
      anchor.textContent = pageNumber <= MAIN_COUNT
        ? `PAGE ${String(pageNumber).padStart(2, '0')}`
        : `APPENDIX A${pageNumber - MAIN_COUNT}`;
      group.appendChild(anchor);
    });
    nav.appendChild(group);
  });
}

function installReadabilityRules(documentRef: Document): void {
  if (documentRef.getElementById('phase6-approved-readability-v1')) return;
  const style = documentRef.createElement('style');
  style.id = 'phase6-approved-readability-v1';
  style.textContent = `
    #category-target .target-statement h3{font-size:17px!important;line-height:1.48!important}
    #category-target .target-tension p{font-size:13px!important;line-height:1.5!important}
    #comp-ranking .ranking-interpretation{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:14px!important}
    #comp-ranking .ranking-interpretation>div{min-width:0!important;text-align:center!important}
    #comp-ranking .ranking-interpretation b{font-size:13px!important}
    #comp-ranking .ranking-interpretation p{font-size:11.5px!important;line-height:1.45!important}
    .deep-node>small{display:block!important;font-size:10px!important;font-weight:900!important;letter-spacing:.06em!important}
    .deep-node>p{font-size:12px!important;line-height:1.48!important}
    #category-cliche .cliche-head,#category-cliche .cliche-row{grid-template-columns:1.1fr 1.35fr 1.55fr!important}
    #category-cliche .cliche-row>b,#category-cliche .cliche-row>p{font-size:12px!important;line-height:1.48!important}
    #consumer-exec .jtbd-mini td,#consumer-exec .jtbd-mini th{font-size:12px!important;line-height:1.5!important}
    #consumer-trends .trend-row p,#consumer-trends .trend-row strong{font-size:11.5px!important;line-height:1.45!important}
    .persona-layout li,.persona-layout p,.persona-layout strong{font-size:12px!important;line-height:1.5!important}
    #pain-needs .pain-row>*{font-size:11.5px!important;line-height:1.45!important}
    #aipl .aipl-stage strong,#aipl .aipl-stage p,#aipl .aipl-stage em{font-size:11px!important;line-height:1.42!important}
    #loyalty .relationship-loop p{font-size:11.5px!important;line-height:1.45!important}
    .history-card h4,.history-card blockquote,.history-card .history-detail{font-size:10.5px!important;line-height:1.42!important}
    #creative-trajectory .trajectory-brand span,#creative-trajectory .trajectory-brand strong{font-size:11px!important;line-height:1.4!important}
    #root-cause .root-cause-tree p,#root-cause .root-cause-tree h3{font-size:11.5px!important;line-height:1.45!important}
    #stp .stp-layout p,#stp .stp-layout strong{font-size:11.5px!important;line-height:1.45!important}
    #strategy-routes .route-row>*{font-size:10.8px!important;line-height:1.42!important}
    #strategy-choice .choice-criteria p,#strategy-choice .choice-final p{font-size:11.5px!important;line-height:1.45!important}
  `;
  documentRef.head.appendChild(style);
}

function transform(documentRef: Document): boolean {
  if (documentRef.body.dataset.phase6PagePlan === PLAN_VERSION) return true;
  const slides = documentRef.querySelectorAll('.full-slide');
  if (slides.length !== MAIN_COUNT + APPENDIX_COUNT) return false;

  MAIN_IDS.forEach((id) => getSlide(documentRef, id));
  APPENDIX_IDS.forEach((id) => getSlide(documentRef, id));

  restoreApprovedLabels(documentRef);
  applyPageMetadata(documentRef);
  rebuildNavigation(documentRef);
  installReadabilityRules(documentRef);

  documentRef.body.dataset.phase6PagePlan = PLAN_VERSION;
  documentRef.body.dataset.reportPageCount = String(MAIN_COUNT + APPENDIX_COUNT);
  documentRef.body.dataset.reportMainCount = String(MAIN_COUNT);
  documentRef.body.dataset.reportAppendixCount = String(APPENDIX_COUNT);
  documentRef.documentElement.dataset.phase6PagePlanReady = 'true';
  documentRef.dispatchEvent(new CustomEvent('phase6-page-plan-ready'));
  return true;
}

let installed = false;

export function installPhase6PagePlanV2(): () => void {
  if (installed || typeof document === 'undefined') return () => undefined;
  if (new URLSearchParams(window.location.search).get('pilot') !== 'full-integrated') return () => undefined;
  installed = true;

  const apply = () => {
    try {
      return transform(document);
    } catch (error) {
      console.error('[Phase 6 Approved HTML Page Plan]', error);
      document.documentElement.dataset.phase6PagePlanReady = 'failed';
      return false;
    }
  };

  if (apply()) return () => { installed = false; };
  const observer = new MutationObserver(() => {
    if (apply()) observer.disconnect();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  return () => {
    observer.disconnect();
    installed = false;
  };
}
