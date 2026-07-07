const PLAN_VERSION = 'competitor5-main40-appendix8-v2';
const MAIN_COUNT = 40;

const MAIN_IDS = [
  'cover','executive','identity','kpi','category-target','growth','inflection','portfolio',
  'market-context','market-shift','comp-ranking',
  'deep-삼쩜삼','deep-더낸세금·혜움','deep-SSEM','deep-dive-4','deep-dive-5',
  'product-matrix','positioning',
  'consumer-exec','consumer-trends','consumer-target','persona-1','persona-2','persona-3',
  'jtbd','pain-needs','aipl','loyalty',
  'creative-비즈넵','creative-삼쩜삼','creative-더낸세금·혜움','creative-SSEM·쌤157',
  'creative-history-4','creative-history-5','creative-trajectory',
  'strategy-swot','root-cause','stp','strategy-routes','strategy-choice',
] as const;

const APPENDIX_IDS = [
  'appendix-cover','appendix-receipt','appendix-negative','appendix-premortem',
  'appendix-roadmap','appendix-measure','appendix-evidence-sources','appendix-back',
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

type Meta = { id: string; chapter: string; title: string; tag: string };

function slide(documentRef: Document, id: string): HTMLElement {
  const node = documentRef.getElementById(id);
  if (!(node instanceof HTMLElement)) throw new Error(`Missing Phase 6 slide: ${id}`);
  return node;
}

function clone(documentRef: Document, id: string): HTMLElement {
  return slide(documentRef, id).cloneNode(true) as HTMLElement;
}

function copy(source: HTMLElement, target: HTMLElement): void {
  target.className = source.className;
  target.innerHTML = source.innerHTML;
  Array.from(target.attributes)
    .filter((attribute) => attribute.name.startsWith('data-'))
    .forEach((attribute) => target.removeAttribute(attribute.name));
}

function setMeta(target: HTMLElement, meta: Meta): void {
  target.id = meta.id;
  const breadcrumb = target.querySelector<HTMLElement>('.full-breadcrumb');
  const title = target.querySelector<HTMLElement>('.full-title-row h2');
  const tag = target.querySelector<HTMLElement>('.full-tag');
  if (breadcrumb) breadcrumb.textContent = meta.chapter;
  if (title) title.textContent = meta.title;
  if (tag) tag.textContent = meta.tag;
}

function makeAppendixCover(target: HTMLElement): void {
  target.id = 'appendix-cover';
  target.className = 'full-slide full-slide--dark appendix-divider';
  target.innerHTML = `
    <header class="full-slide-header">
      <div class="full-breadcrumb">APPENDIX</div>
      <div class="full-title-row"><h2>전략을 실행 가능한 증거와 통제 장치로 전환합니다</h2><div class="full-title-meta"><span class="full-tag">APPENDIX</span><span class="full-page">A1</span></div></div>
    </header>
    <div class="full-slide-body">
      <div class="appendix-divider-layout">
        <span>STRATEGIC EVIDENCE & EXECUTION PACK</span>
        <h3>APPENDIX</h3>
        <p>Winning Move · Via Negativa · Pre-mortem · Roadmap · Measurement · Evidence & Sources</p>
        <div class="appendix-divider-index"><b>01</b><span>PRODUCT PROOF</span><b>02</b><span>RISK CONTROL</span><b>03</b><span>EXECUTION & KPI</span><b>04</b><span>EVIDENCE REGISTER</span></div>
      </div>
    </div>`;
}

function addRankingCapacity(documentRef: Document): void {
  const table = documentRef.querySelector<HTMLTableElement>('#comp-ranking .ranking-table');
  const body = table?.tBodies.item(0);
  const sourceRow = body?.rows.item(Math.max(0, (body?.rows.length || 1) - 1));
  if (body && sourceRow) {
    while (body.rows.length < 5) {
      const row = sourceRow.cloneNode(true) as HTMLTableRowElement;
      const rank = body.rows.length + 1;
      Array.from(row.cells).forEach((cell, index) => {
        if (index === 0) cell.textContent = String(rank);
        else if (index === 1) cell.textContent = `DIRECT COMPETITOR ${rank}`;
        else if (index === row.cells.length - 1) cell.textContent = '—';
        else cell.textContent = 'N/A';
      });
      body.appendChild(row);
    }
  }

  const interpretation = documentRef.querySelector<HTMLElement>('#comp-ranking .ranking-interpretation');
  const sourceCard = interpretation?.lastElementChild;
  if (interpretation && sourceCard) {
    while (interpretation.children.length < 5) {
      const card = sourceCard.cloneNode(true) as HTMLElement;
      const index = interpretation.children.length + 1;
      const name = card.querySelector<HTMLElement>('b');
      const copyNode = card.querySelector<HTMLElement>('p');
      if (name) name.textContent = `DIRECT COMPETITOR ${index}`;
      if (copyNode) copyNode.textContent = '선택 메커니즘과 위협 구조를 독립 검증';
      interpretation.appendChild(card);
    }
  }
}

function addMatrixCapacity(documentRef: Document): void {
  const table = documentRef.querySelector<HTMLTableElement>('#product-matrix .matrix-table');
  const header = table?.tHead?.rows.item(0);
  if (!table || !header) return;
  while (header.cells.length < 7) {
    const cell = documentRef.createElement('th');
    cell.textContent = `DIRECT ${header.cells.length - 1}`;
    header.appendChild(cell);
  }
  Array.from(table.tBodies.item(0)?.rows || []).forEach((row) => {
    while (row.cells.length < 7) {
      const source = row.cells.item(Math.max(1, row.cells.length - 1));
      const cell = source ? source.cloneNode(true) as HTMLTableCellElement : documentRef.createElement('td');
      cell.classList.remove('is-target');
      cell.textContent = '조사 근거 입력';
      row.appendChild(cell);
    }
  });
}

function addPositioningCapacity(documentRef: Document): void {
  const map = documentRef.querySelector<HTMLElement>('#positioning .position-map');
  if (!map || map.querySelector('.map-dot.comp4')) return;
  ['comp4','comp5'].forEach((className, index) => {
    const dot = documentRef.createElement('div');
    dot.className = `map-dot ${className}`;
    dot.textContent = `DIRECT ${index + 4}`;
    map.appendChild(dot);
  });
}

function addTrajectoryCapacity(documentRef: Document): void {
  const map = documentRef.querySelector<HTMLElement>('#creative-trajectory .trajectory-map');
  const source = map?.querySelector<HTMLElement>('.trajectory-brand.ssem');
  if (!map || !source || map.querySelector('.trajectory-brand.comp4')) return;
  ['comp4','comp5'].forEach((className, index) => {
    const row = source.cloneNode(true) as HTMLElement;
    row.className = `trajectory-brand ${className}`;
    const brand = row.querySelector<HTMLElement>('b');
    if (brand) brand.textContent = `DIRECT COMPETITOR ${index + 4}`;
    map.appendChild(row);
  });
}

function combineEvidenceSources(documentRef: Document, evidenceTemplate: HTMLElement, sourcesTemplate: HTMLElement, target: HTMLElement): void {
  copy(evidenceTemplate, target);
  setMeta(target, {
    id: 'appendix-evidence-sources',
    chapter: 'APPENDIX > EVIDENCE & SOURCE REGISTER',
    title: '증거 공백과 출처 등급을 한 장에서 관리합니다',
    tag: 'EVIDENCE REGISTER',
  });
  const body = target.querySelector<HTMLElement>('.full-slide-body');
  const evidence = evidenceTemplate.querySelector<HTMLElement>('.evidence-gap-grid')?.cloneNode(true) as HTMLElement | undefined;
  const sources = sourcesTemplate.querySelector<HTMLElement>('.source-hierarchy')?.cloneNode(true) as HTMLElement | undefined;
  if (!body || !evidence || !sources) return;
  const layout = documentRef.createElement('div');
  layout.className = 'appendix-evidence-source-layout';
  const left = documentRef.createElement('section');
  left.className = 'appendix-register-panel appendix-register-panel--evidence';
  left.innerHTML = '<span class="appendix-register-label">EVIDENCE GAPS</span>';
  left.appendChild(evidence);
  const right = documentRef.createElement('section');
  right.className = 'appendix-register-panel appendix-register-panel--sources';
  right.innerHTML = '<span class="appendix-register-label">SOURCE LABELS</span>';
  right.appendChild(sources);
  layout.append(left, right);
  body.replaceChildren(layout);
}

function applyLabels(documentRef: Document): void {
  [...MAIN_IDS, ...APPENDIX_IDS].forEach((id, index) => {
    const target = slide(documentRef, id);
    const main = index < MAIN_COUNT;
    target.dataset.page = String(index + 1);
    target.dataset.zone = main ? 'main' : 'appendix';
    const page = target.querySelector<HTMLElement>('.full-page');
    if (page) page.textContent = main ? String(index + 1).padStart(2, '0') : `A${index - MAIN_COUNT + 1}`;
  });
}

function reorder(documentRef: Document): void {
  const content = documentRef.querySelector<HTMLElement>('.full-report-content');
  if (!content) throw new Error('Missing Phase 6 report content.');
  const labels = Array.from(content.querySelectorAll<HTMLElement>(':scope > .full-report-section-label'));
  const mainLabel = labels[0];
  const appendixLabel = labels[1];
  if (!mainLabel || !appendixLabel) throw new Error('Missing Phase 6 section labels.');
  const frameFor = (id: string): HTMLElement => slide(documentRef, id).closest<HTMLElement>('.full-frame') || slide(documentRef, id);
  Array.from(content.querySelectorAll<HTMLElement>(':scope > .full-frame')).forEach((frame) => frame.remove());
  mainLabel.textContent = 'MAIN DECK · 40 PAGES';
  appendixLabel.textContent = 'APPENDIX · 8 PAGES';
  mainLabel.after(...MAIN_IDS.map(frameFor));
  appendixLabel.after(...APPENDIX_IDS.map(frameFor));
}

function rebuildNav(documentRef: Document): void {
  const nav = documentRef.querySelector<HTMLElement>('.full-nav');
  if (!nav) return;
  nav.querySelectorAll('.full-nav-group').forEach((group) => group.remove());
  let index = 0;
  NAV_GROUPS.forEach(([title, ids]) => {
    const group = documentRef.createElement('div');
    group.className = 'full-nav-group';
    const heading = documentRef.createElement('strong');
    heading.textContent = title;
    group.appendChild(heading);
    ids.forEach((id) => {
      index += 1;
      const anchor = documentRef.createElement('a');
      anchor.href = `#${id}`;
      anchor.textContent = `PAGE ${String(index).padStart(2, '0')}`;
      group.appendChild(anchor);
    });
    nav.appendChild(group);
  });
}

function transform(documentRef: Document): boolean {
  if (documentRef.body.dataset.phase6PagePlan === PLAN_VERSION) return true;
  if (documentRef.querySelectorAll('.full-slide').length !== 48) return false;

  const deepTemplate = clone(documentRef, 'deep-SSEM');
  const historyTemplate = clone(documentRef, 'creative-SSEM·쌤157');
  const receiptTemplate = clone(documentRef, 'appendix-receipt');
  const negativeTemplate = clone(documentRef, 'appendix-negative');
  const premortemTemplate = clone(documentRef, 'appendix-premortem');
  const roadmapTemplate = clone(documentRef, 'appendix-roadmap');
  const measureTemplate = clone(documentRef, 'appendix-measure');
  const evidenceTemplate = clone(documentRef, 'appendix-evidence');
  const sourcesTemplate = clone(documentRef, 'appendix-sources');

  const deep4 = slide(documentRef, 'appendix-receipt');
  copy(deepTemplate, deep4);
  setMeta(deep4, { id: 'deep-dive-4', chapter: 'II. COMPETITOR > DEEP DIVE 4', title: '네 번째 직접 경쟁사의 선택 메커니즘을 독립 검증합니다', tag: 'DEEP DIVE' });

  const deep5 = slide(documentRef, 'appendix-premortem');
  copy(deepTemplate, deep5);
  setMeta(deep5, { id: 'deep-dive-5', chapter: 'II. COMPETITOR > DEEP DIVE 5', title: '다섯 번째 직접 경쟁사의 선택 메커니즘을 독립 검증합니다', tag: 'DEEP DIVE' });

  const history4 = slide(documentRef, 'appendix-negative');
  copy(historyTemplate, history4);
  setMeta(history4, { id: 'creative-history-4', chapter: 'IV. CREATIVE > COMPETITOR HISTORY 4', title: '네 번째 직접 경쟁사의 6개년 메시지 이동을 검증합니다', tag: '2021–2026 YTD' });

  const history5 = slide(documentRef, 'appendix-roadmap');
  copy(historyTemplate, history5);
  setMeta(history5, { id: 'creative-history-5', chapter: 'IV. CREATIVE > COMPETITOR HISTORY 5', title: '다섯 번째 직접 경쟁사의 6개년 메시지 이동을 검증합니다', tag: '2021–2026 YTD' });

  makeAppendixCover(slide(documentRef, 'comp-landscape'));

  const appendixReceipt = slide(documentRef, 'category-cliche');
  copy(receiptTemplate, appendixReceipt);
  setMeta(appendixReceipt, { id: 'appendix-receipt', chapter: 'APPENDIX > WINNING MOVE SPECIFICATION', title: 'Winning Move를 실제 제품 증거의 구조로 전환합니다', tag: 'PRODUCT PROOF' });

  const appendixNegative = slide(documentRef, 'creative-method');
  copy(negativeTemplate, appendixNegative);
  setMeta(appendixNegative, { id: 'appendix-negative', chapter: 'APPENDIX > VIA NEGATIVA', title: '새 표현보다 먼저 중단해야 할 카테고리 습관을 명시합니다', tag: 'REMOVE' });

  const appendixPremortem = slide(documentRef, 'creative-insight');
  copy(premortemTemplate, appendixPremortem);
  setMeta(appendixPremortem, { id: 'appendix-premortem', chapter: 'APPENDIX > PRE-MORTEM', title: '실패 가능성을 실행 전에 가정하고 통제 조건을 설계합니다', tag: 'RISK' });

  const appendixRoadmap = slide(documentRef, 'appendix-measure');
  copy(roadmapTemplate, appendixRoadmap);
  setMeta(appendixRoadmap, { id: 'appendix-roadmap', chapter: 'APPENDIX > EXECUTION ROADMAP', title: '제품 증거부터 브랜드 확장까지 실행 순서를 고정합니다', tag: 'ROADMAP' });

  const appendixMeasure = slide(documentRef, 'appendix-evidence');
  copy(measureTemplate, appendixMeasure);
  setMeta(appendixMeasure, { id: 'appendix-measure', chapter: 'APPENDIX > MEASUREMENT PLAN', title: '성과와 위험 지표를 함께 측정합니다', tag: 'KPI' });

  combineEvidenceSources(documentRef, evidenceTemplate, sourcesTemplate, slide(documentRef, 'appendix-sources'));
  addRankingCapacity(documentRef);
  addMatrixCapacity(documentRef);
  addPositioningCapacity(documentRef);
  addTrajectoryCapacity(documentRef);
  applyLabels(documentRef);
  reorder(documentRef);
  rebuildNav(documentRef);
  documentRef.body.dataset.phase6PagePlan = PLAN_VERSION;
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
      console.error('[Phase 6 Page Plan V2]', error);
      document.documentElement.dataset.phase6PagePlanReady = 'failed';
      return false;
    }
  };
  if (apply()) return () => { installed = false; };
  const observer = new MutationObserver(() => {
    if (apply()) observer.disconnect();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  return () => { observer.disconnect(); installed = false; };
}
