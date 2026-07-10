const PAGE_COUNT = 48;
const MAIN_COUNT = 40;
const FIELD_PREFIX = '[[FIELD:';
const FIELD_PATTERN = /\[\[FIELD:[A-Za-z0-9._-]+\]\]/g;
const ALLOWED_INLINE_TAGS = new Set(['BR', 'MARK', 'STRONG', 'B', 'EM', 'SPAN']);

export type ReportFieldKind = 'text' | 'rich' | 'number' | 'source' | 'status';

export type ReportFieldDefinition = {
  key: string;
  page: number;
  pageId: string;
  hint: string;
  maxLength: number;
  kind: ReportFieldKind;
};

const DYNAMIC_IDS: Record<number, string> = {
  13: 'deep-dive-1',
  14: 'deep-dive-2',
  15: 'deep-dive-3',
  30: 'creative-history-target',
  31: 'creative-history-1',
  32: 'creative-history-2',
  33: 'creative-history-3',
};

const FIXED_SELECTORS = [
  '.full-page', '.full-breadcrumb', '.full-tag', '.full-implication > span',
  '.full-nav', '.full-report-toolbar', '.full-report-section-label',
  '#category-target .target-statement > span', '#category-target .target-tension > b',
  '#comp-ranking thead',
  '.deep-dive-score > span', '.deep-dive-score > small', '.deep-node > small', '.deep-node > i',
  '#category-cliche .cliche-head',
  '#consumer-exec .consumer-question-shift span', '#consumer-exec .consumer-question-shift i',
  '#consumer-target .target-spectrum > div > span', '#consumer-target .target-profile > span',
  '.persona-index', '.persona-label', '.persona-quote > span', '.persona-fears > span',
  '.identity-shift span', '.identity-shift i', '.brand-role > span',
  '#pain-needs .pain-head',
  '#aipl .aipl-stage > b', '#aipl .aipl-stage > span',
  '#loyalty .relationship-loop > div > span', '#loyalty .relationship-loop > i', '#loyalty .product-principles > b',
  '.history-card > h3', '.history-bottom span',
  '#strategy-swot .swot-quadrant > h3',
  '#root-cause .root-cause-tree small', '#root-cause .root-cause-tree > i',
  '#stp .stp-layout > .stp-arrow', '#stp .stp-layout > div > span',
  '#strategy-routes .route-head', '#strategy-routes .route-row > b',
  '#strategy-choice .choice-criteria > span', '#strategy-choice .choice-final > span',
  '#appendix-back .back-cover-copy > span',
].join(',');

function serialize(documentRef: Document): string {
  return `<!DOCTYPE html>\n${documentRef.documentElement.outerHTML}`;
}

function fieldPlaceholder(key: string): string {
  return `[[FIELD:${key}]]`;
}

function pageNumber(slide: HTMLElement): number {
  return Number(slide.dataset.page || 0);
}

function isFixed(element: Element): boolean {
  return Boolean(element.closest(FIXED_SELECTORS));
}

function normalizeKeyPart(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9가-힣]+/g, '-').replace(/^-|-$/g, '').slice(0, 36) || 'field';
}

function registerField(
  element: Element | null,
  key: string,
  hint: string,
  maxLength = 160,
  kind: ReportFieldKind = 'text',
): void {
  if (!(element instanceof HTMLElement)) return;
  if (element.hasAttribute('data-report-field')) return;
  element.setAttribute('data-report-field', key);
  element.setAttribute('data-report-hint', hint);
  element.setAttribute('data-report-max-length', String(maxLength));
  element.setAttribute('data-report-kind', kind);
  element.replaceChildren(element.ownerDocument.createTextNode(fieldPlaceholder(key)));
}

function registerSource(element: Element | null, key: string, hint: string): void {
  if (!(element instanceof HTMLElement)) return;
  const span = element.ownerDocument.createElement('span');
  span.setAttribute('data-report-field', key);
  span.setAttribute('data-report-hint', hint);
  span.setAttribute('data-report-max-length', '120');
  span.setAttribute('data-report-kind', 'source');
  span.textContent = fieldPlaceholder(key);
  element.replaceChildren(element.ownerDocument.createTextNode('SOURCE · '), span);
}

function registerIndexed(
  root: ParentNode,
  selector: string,
  keyPrefix: string,
  hint: string,
  maxLength = 140,
  kind: ReportFieldKind = 'text',
): void {
  Array.from(root.querySelectorAll(selector)).forEach((element, index) => {
    registerField(element, `${keyPrefix}.${index + 1}`, `${hint} ${index + 1}`, maxLength, kind);
  });
}

function annotateRanking(slide: HTMLElement): void {
  const rows = Array.from(slide.querySelectorAll<HTMLTableRowElement>('.ranking-table tbody tr')).slice(0, 3);
  const columns = ['rank', 'competitor', 'penetration', 'growth', 'preference', 'campaign', 'inflection', 'evidence', 'total'];
  rows.forEach((row, rowIndex) => {
    Array.from(row.cells).forEach((cell, columnIndex) => {
      if (columnIndex === 0) return;
      const kind: ReportFieldKind = columnIndex >= 2 ? 'number' : 'text';
      registerField(
        cell,
        `comp-ranking.rank${rowIndex + 1}.${columns[columnIndex] || `column${columnIndex + 1}`}`,
        `Threat Ranking ${rowIndex + 1}위 ${columns[columnIndex] || '평가값'}`,
        columnIndex === 1 ? 40 : 12,
        kind,
      );
    });
  });
  Array.from(slide.querySelectorAll<HTMLElement>('.ranking-interpretation > div')).slice(0, 3).forEach((card, index) => {
    registerField(card.querySelector('b'), `comp-ranking.summary${index + 1}.name`, `${index + 1}위 핵심 경쟁사명`, 40);
    registerField(card.querySelector('p'), `comp-ranking.summary${index + 1}.meaning`, `${index + 1}위 경쟁사의 위협 의미`, 90, 'rich');
  });
}

function annotateDeepDive(slide: HTMLElement, index: number): void {
  registerField(slide.querySelector('.deep-dive-score > strong'), `deep-dive-${index}.score`, `핵심 경쟁사 ${index} 위협 점수`, 4, 'number');
  registerIndexed(
    slide,
    '.deep-node--1 li',
    `deep-dive-${index}.evidence`,
    `Deep Dive ${index} Evidence 근거`,
    72,
    'rich',
  );
  const parts = ['coreDesire', 'appeal', 'threatMechanism', 'attackPoint'];
  const paragraphs = slide.querySelectorAll<HTMLElement>(
    '.deep-node--2 > p, .deep-node--3 > p, .deep-node--4 > p, .deep-node--5 > p',
  );
  Array.from(paragraphs).forEach((node, partIndex) => {
    const part = parts[partIndex] || `part${partIndex + 1}`;
    registerField(node, `deep-dive-${index}.${part}`, `Deep Dive ${index} ${part}`, 150, 'rich');
  });
  registerSource(slide.querySelector('.full-source'), `deep-dive-${index}.source`, `Deep Dive ${index} 출처명 · 자료명 · 연도`);
}

function annotateCategoryCliches(slide: HTMLElement): void {
  Array.from(slide.querySelectorAll<HTMLElement>('.cliche-row')).forEach((row, index) => {
    registerField(row.querySelector('b'), `category-cliche.row${index + 1}.phrase`, `반복 화법 핵심 워딩 ${index + 1}`, 36);
    const paragraphs = row.querySelectorAll('p');
    registerField(paragraphs[0], `category-cliche.row${index + 1}.role`, `반복 화법 ${index + 1}의 현재 역할`, 90, 'rich');
    registerField(paragraphs[1], `category-cliche.row${index + 1}.limit`, `반복 화법 ${index + 1}의 구조적 한계`, 110, 'rich');
  });
}

function annotatePositioning(slide: HTMLElement): void {
  const axes = ['xLeft', 'xRight', 'yTop', 'yBottom'];
  Array.from(slide.querySelectorAll<HTMLElement>('.position-map > .axis')).forEach((axis, index) => {
    registerField(axis, `positioning.axis.${axes[index] || index + 1}`, `포지셔닝 축의 실제 의미 ${axes[index] || index + 1}; X축/Y축 같은 일반명 금지`, 36);
  });
  Array.from(slide.querySelectorAll<HTMLElement>('.position-map > .map-dot')).forEach((dot, index) => {
    registerField(dot, `positioning.point.${index + 1}`, `포지셔닝 맵 브랜드 또는 목표 위치 ${index + 1}`, 48, 'rich');
  });
}

function annotateConsumerExecutive(slide: HTMLElement): void {
  registerIndexed(slide, '.consumer-question-shift strong', 'consumer-exec.question', '소비자 질문 변화', 70, 'rich');
  Array.from(slide.querySelectorAll<HTMLTableRowElement>('.jtbd-mini tbody tr')).forEach((row, index) => {
    registerField(row.cells.item(1), `consumer-exec.jtbd.${['functional', 'emotional', 'social'][index] || index + 1}`, `소비자 JTBD ${index + 1}의 원하는 진보`, 150, 'rich');
  });
}

function annotateTrends(slide: HTMLElement): void {
  Array.from(slide.querySelectorAll<HTMLElement>('.trend-row')).forEach((row, index) => {
    registerField(row.querySelector('h3'), `consumer-trends.trend${index + 1}.title`, `소비자 트렌드 ${index + 1} 제목`, 50);
    const paragraphs = row.querySelectorAll('p');
    registerField(paragraphs[0], `consumer-trends.trend${index + 1}.evidence`, `트렌드 ${index + 1} 근거`, 105, 'rich');
    registerField(paragraphs[1], `consumer-trends.trend${index + 1}.change`, `트렌드 ${index + 1}가 만드는 변화`, 90, 'rich');
    registerField(row.querySelector('.trend-so strong'), `consumer-trends.trend${index + 1}.soWhat`, `트렌드 ${index + 1} 전략적 함의`, 105, 'rich');
  });
}

function annotateCoreTarget(slide: HTMLElement): void {
  Array.from(slide.querySelectorAll<HTMLElement>('.target-spectrum > div')).forEach((card, index) => {
    registerField(card.querySelector('b'), `consumer-target.segment${index + 1}.name`, `타깃 스펙트럼 ${index + 1} 세그먼트명`, 42);
    registerField(card.querySelector('p'), `consumer-target.segment${index + 1}.description`, `타깃 스펙트럼 ${index + 1} 설명`, 90, 'rich');
  });
  Array.from(slide.querySelectorAll<HTMLElement>('.target-profile > b')).forEach((value, index) => {
    registerField(value, `consumer-target.profile.${index + 1}`, `핵심 타깃 프로필 값 ${index + 1}`, 54);
  });
}

function annotatePersona(slide: HTMLElement, index: number): void {
  registerIndexed(slide, '.persona-left li', `persona-${index}.situation`, `Persona ${index} 상황`, 72, 'rich');
  registerField(slide.querySelector('.persona-quote strong'), `persona-${index}.surfaceNeed`, `Persona ${index} 표면 욕구`, 90, 'rich');
  registerField(slide.querySelector('.persona-center > h3'), `persona-${index}.realJob`, `Persona ${index} 실제 JTBD`, 110, 'rich');
  registerIndexed(slide, '.persona-fears > p', `persona-${index}.fear`, `Persona ${index} 핵심 두려움`, 64, 'rich');
  const identities = slide.querySelectorAll<HTMLElement>('.identity-shift p');
  registerField(identities[0], `persona-${index}.asIsIdentity`, `Persona ${index} 현재 정체성`, 65, 'rich');
  registerField(identities[1], `persona-${index}.toBeIdentity`, `Persona ${index} 원하는 정체성`, 65, 'rich');
  registerField(slide.querySelector('.brand-role strong'), `persona-${index}.brandRole`, `브랜드가 Persona ${index}에게 수행할 역할`, 105, 'rich');
}

function annotatePainNeeds(slide: HTMLElement): void {
  Array.from(slide.querySelectorAll<HTMLElement>('.pain-row')).forEach((row, index) => {
    registerField(row.querySelector('b'), `pain-needs.row${index + 1}.pain`, `Pain ${index + 1} 이름`, 42);
    const paragraphs = row.querySelectorAll('p');
    registerField(paragraphs[0], `pain-needs.row${index + 1}.issue`, `Pain ${index + 1}의 현재 문제`, 90, 'rich');
    registerField(row.querySelector('strong'), `pain-needs.row${index + 1}.unmetNeed`, `Pain ${index + 1}에 대응하는 Unmet Need`, 90, 'rich');
    registerField(row.querySelector('em'), `pain-needs.row${index + 1}.priority`, `Pain ${index + 1} 우선순위`, 12);
  });
}

function annotateAipl(slide: HTMLElement): void {
  const stages = ['A', 'I', 'P1', 'P2', 'L'];
  Array.from(slide.querySelectorAll<HTMLElement>('.aipl-stage')).forEach((stage, index) => {
    registerField(stage.querySelector('strong'), `aipl.${stages[index] || index + 1}.action`, `AIPL ${stages[index] || index + 1} 단계 소비자 행동`, 55);
    registerField(stage.querySelector('p'), `aipl.${stages[index] || index + 1}.description`, `AIPL ${stages[index] || index + 1} 단계 설명`, 90, 'rich');
    registerField(stage.querySelector('em'), `aipl.${stages[index] || index + 1}.state`, `AIPL ${stages[index] || index + 1} 상태 또는 병목`, 32);
  });
  registerField(slide.querySelector('.friction-analysis > h3'), 'aipl.bottleneck.title', 'AIPL 핵심 병목의 명확한 이름', 42);
  registerIndexed(slide, '.friction-analysis li', 'aipl.bottleneck.reason', 'AIPL 핵심 병목 이유', 58, 'rich');
}

function annotateLoyalty(slide: HTMLElement): void {
  Array.from(slide.querySelectorAll<HTMLElement>('.relationship-loop > div')).forEach((step, index) => {
    registerField(step.querySelector('b'), `loyalty.step${index + 1}.name`, `구매 후 관계 단계 ${index + 1} 이름`, 36);
    registerField(step.querySelector('p'), `loyalty.step${index + 1}.description`, `구매 후 관계 단계 ${index + 1} 행동`, 72, 'rich');
  });
  registerIndexed(slide, '.product-principles > span', 'loyalty.principle', '구매 후 관계를 만드는 제품 원칙', 38);
}

function annotateHistory(slide: HTMLElement, prefix: string): void {
  registerField(slide.querySelector('.history-governing'), `${prefix}.governing`, 'Creative History 사실성 원칙', 120, 'rich');
  Array.from(slide.querySelectorAll<HTMLElement>('.history-card')).forEach((card, index) => {
    registerField(card.querySelector('.history-status'), `${prefix}.year${index + 1}.status`, `Creative History ${2021 + index} 검증 상태`, 36, 'status');
    registerField(card.querySelector('h4'), `${prefix}.year${index + 1}.campaign`, `Creative History ${2021 + index} 캠페인명`, 54);
    registerField(card.querySelector('blockquote'), `${prefix}.year${index + 1}.copy`, `Creative History ${2021 + index} 원문 카피 또는 미확인 문구`, 105, 'rich');
    registerField(card.querySelector('.history-detail'), `${prefix}.year${index + 1}.detail`, `Creative History ${2021 + index} 모델·매체·전략 의미`, 96, 'rich');
    registerSource(card.querySelector('.full-source'), `${prefix}.year${index + 1}.source`, `Creative History ${2021 + index} 출처명 · 자료명 · 연도`);
  });
  const bottom = slide.querySelectorAll<HTMLElement>('.history-bottom strong');
  registerField(bottom[0], `${prefix}.trajectory`, '6개년 Message Trajectory', 165, 'rich');
  registerField(bottom[1], `${prefix}.strategicSoWhat`, 'Creative History의 전략적 함의', 165, 'rich');
}

function annotateRootCause(slide: HTMLElement): void {
  registerIndexed(slide, '.root-evidence > p', 'root-cause.evidence', '시장·경쟁사·소비자·크리에이티브 근거', 78, 'rich');
  registerIndexed(slide, '.root-gap > p', 'root-cause.gap', '제품과 인식의 GAP', 58, 'rich');
  registerField(slide.querySelector('.root-core > h3'), 'root-cause.core', '단일 Root Cause 문장', 130, 'rich');
  registerField(slide.querySelector('.root-opportunity > h3'), 'root-cause.opportunity', 'Root Cause에서 도출된 전략 기회', 130, 'rich');
}

function annotateStp(slide: HTMLElement): void {
  Array.from(slide.querySelectorAll<HTMLElement>('.stp-segments > div')).forEach((segment, index) => {
    registerField(segment.querySelector('b'), `stp.segment${index + 1}.name`, `STP 세그먼트 ${index + 1} 이름`, 42);
    registerField(segment.querySelector('p'), `stp.segment${index + 1}.trait`, `STP 세그먼트 ${index + 1} 특성`, 72, 'rich');
    registerField(segment.querySelector('small'), `stp.segment${index + 1}.value`, `STP 세그먼트 ${index + 1} 전략 가치`, 48);
  });
  registerField(slide.querySelector('.stp-target > strong'), 'stp.target.name', '최우선 Target 이름', 58, 'rich');
  registerField(slide.querySelector('.stp-target > p'), 'stp.target.reason', '최우선 Target 선정 이유', 105, 'rich');
  registerField(slide.querySelector('.stp-position > strong'), 'stp.positioning', 'Positioning 문장; 화살표나 단어 나열 금지', 150, 'rich');
}

function annotateRoutes(slide: HTMLElement): void {
  Array.from(slide.querySelectorAll<HTMLElement>('.route-row')).forEach((row, index) => {
    const children = Array.from(row.children);
    registerField(children[1], `strategy-routes.route${index + 1}.proposition`, `전략 방향 ${index + 1} 명제`, 60, 'rich');
    registerField(children[2], `strategy-routes.route${index + 1}.direction`, `전략 방향 ${index + 1} 핵심 방향`, 90, 'rich');
    registerField(children[3], `strategy-routes.route${index + 1}.tradeoff`, `전략 방향 ${index + 1} Trade-off`, 85, 'rich');
    registerField(children[4], `strategy-routes.route${index + 1}.differentiation`, `전략 방향 ${index + 1} 차별 점수`, 4, 'number');
    registerField(children[5], `strategy-routes.route${index + 1}.expansion`, `전략 방향 ${index + 1} 확장 점수`, 4, 'number');
    registerField(children[6], `strategy-routes.route${index + 1}.execution`, `전략 방향 ${index + 1} 실행 점수`, 4, 'number');
  });
}

function annotateFinalChoice(slide: HTMLElement): void {
  Array.from(slide.querySelectorAll<HTMLElement>('.choice-criteria > div')).forEach((criterion, index) => {
    registerField(criterion.querySelector('b'), `strategy-choice.criterion${index + 1}.name`, `최종 선택 기준 ${index + 1}`, 32);
    registerField(criterion.querySelector('p'), `strategy-choice.criterion${index + 1}.meaning`, `최종 선택 기준 ${index + 1}의 판단 근거`, 72, 'rich');
  });
  const headings = slide.querySelectorAll<HTMLElement>('.choice-final h3,.choice-final h2');
  registerField(headings[0], 'strategy-choice.bigIdeal', 'Big IdeaL; 브랜드가 지키려는 권리 또는 이상', 120, 'rich');
  registerField(headings[1], 'strategy-choice.winningMove', 'Winning Move; 시장에서 이길 고유한 실행 이름과 정의', 90, 'rich');
  registerField(slide.querySelector('.choice-final > p'), 'strategy-choice.proof', 'Winning Move가 제품과 행동으로 증명되는 방식', 125, 'rich');
}

function annotateCriticalPages(documentRef: Document): void {
  const category = documentRef.getElementById('category-target');
  if (category) {
    registerIndexed(category, '.ring--outer > span', 'category-target.alternative', '소비자가 선택하는 세무 의사결정 대안', 32);
    registerField(category.querySelector('.ring--mid'), 'category-target.category', '브랜드가 속한 실질 카테고리', 42);
    registerField(category.querySelector('.ring--core'), 'category-target.brandRole', '브랜드와 핵심 제공 범위', 58, 'rich');
    registerField(category.querySelector('.target-statement > h3'), 'category-target.primaryTarget', 'PRIMARY TARGET 정의', 150, 'rich');
    const tension = category.querySelectorAll('.target-tension > p');
    registerField(tension[0], 'category-target.want', '타깃이 원하는 진보 WANT', 80, 'rich');
    registerField(tension[1], 'category-target.avoid', '타깃이 피하려는 손실 AVOID', 80, 'rich');
  }

  const ranking = documentRef.getElementById('comp-ranking');
  if (ranking) annotateRanking(ranking);
  ['deep-dive-1', 'deep-dive-2', 'deep-dive-3'].forEach((id, index) => {
    const slide = documentRef.getElementById(id);
    if (slide) annotateDeepDive(slide, index + 1);
  });
  const cliches = documentRef.getElementById('category-cliche');
  if (cliches) annotateCategoryCliches(cliches);
  const positioning = documentRef.getElementById('positioning');
  if (positioning) annotatePositioning(positioning);
  const consumerExecutive = documentRef.getElementById('consumer-exec');
  if (consumerExecutive) annotateConsumerExecutive(consumerExecutive);
  const trends = documentRef.getElementById('consumer-trends');
  if (trends) annotateTrends(trends);
  const target = documentRef.getElementById('consumer-target');
  if (target) annotateCoreTarget(target);
  [1, 2, 3].forEach((index) => {
    const persona = documentRef.getElementById(`persona-${index}`);
    if (persona) annotatePersona(persona, index);
  });
  const pain = documentRef.getElementById('pain-needs');
  if (pain) annotatePainNeeds(pain);
  const aipl = documentRef.getElementById('aipl');
  if (aipl) annotateAipl(aipl);
  const loyalty = documentRef.getElementById('loyalty');
  if (loyalty) annotateLoyalty(loyalty);
  ['creative-history-target', 'creative-history-1', 'creative-history-2', 'creative-history-3'].forEach((id) => {
    const history = documentRef.getElementById(id);
    if (history) annotateHistory(history, id);
  });
  const root = documentRef.getElementById('root-cause');
  if (root) annotateRootCause(root);
  const stp = documentRef.getElementById('stp');
  if (stp) annotateStp(stp);
  const routes = documentRef.getElementById('strategy-routes');
  if (routes) annotateRoutes(routes);
  const choice = documentRef.getElementById('strategy-choice');
  if (choice) annotateFinalChoice(choice);
  const back = documentRef.getElementById('appendix-back');
  if (back) {
    registerField(back.querySelector('.back-cover-copy > h1'), 'appendix-back.brandPrinciple', '보고서 전체를 압축한 단일 Brand Principle; 새로운 논리 추가 금지', 90, 'rich');
    registerField(back.querySelector('.back-cover-copy > p'), 'appendix-back.closingProof', 'Brand Principle을 뒷받침하는 한 문장', 105, 'rich');
  }
}

function annotateGenericFields(documentRef: Document): ReportFieldDefinition[] {
  const definitions: ReportFieldDefinition[] = [];
  const slides = Array.from(documentRef.querySelectorAll<HTMLElement>('.full-slide'));
  slides.forEach((slide) => {
    const page = pageNumber(slide);
    registerField(slide.querySelector('.full-title-row > h2'), `${slide.id}.title`, `${page}페이지 결론형 제목`, 105, 'rich');
    registerField(slide.querySelector('.full-implication > div'), `${slide.id}.soWhat`, `${page}페이지 전략적 함의 SO WHAT`, 145, 'rich');

    let autoIndex = 0;
    const candidates = Array.from(slide.querySelectorAll<HTMLElement>('h1,h2,h3,h4,p,li,strong,b,blockquote,td,th,em,small,span'));
    candidates.forEach((element) => {
      if (element.hasAttribute('data-report-field')) return;
      if (element.closest('[data-report-field]')) return;
      if (isFixed(element)) return;
      if (!element.textContent?.trim()) return;
      const childElements = Array.from(element.children);
      if (childElements.some((child) => !['BR', 'MARK'].includes(child.tagName))) return;
      autoIndex += 1;
      const role = normalizeKeyPart(Array.from(element.classList).join('-') || element.tagName);
      registerField(
        element,
        `${slide.id}.content.${role}.${autoIndex}`,
        `${page}페이지 ${slide.id}의 ${role} 의미 콘텐츠 ${autoIndex}`,
        element.matches('h1,h2,h3,h4,strong,b') ? 90 : 150,
        childElements.length ? 'rich' : 'text',
      );
    });
  });

  documentRef.querySelectorAll<HTMLElement>('[data-report-field]').forEach((element) => {
    const slide = element.closest<HTMLElement>('.full-slide');
    if (!slide) return;
    definitions.push({
      key: element.dataset.reportField || '',
      page: pageNumber(slide),
      pageId: slide.id,
      hint: element.dataset.reportHint || '',
      maxLength: Number(element.dataset.reportMaxLength || 140),
      kind: (element.dataset.reportKind || 'text') as ReportFieldKind,
    });
  });
  return definitions;
}

function canonicalizeIds(documentRef: Document): void {
  const slides = Array.from(documentRef.querySelectorAll<HTMLElement>('.full-slide'));
  const idMap = new Map<string, string>();
  slides.forEach((slide, index) => {
    const nextId = DYNAMIC_IDS[index + 1];
    if (nextId && slide.id !== nextId) {
      idMap.set(slide.id, nextId);
      slide.id = nextId;
    }
  });
  documentRef.querySelectorAll<HTMLAnchorElement>('.full-nav a').forEach((link) => {
    const oldId = (link.getAttribute('href') || '').replace(/^#/, '');
    const nextId = idMap.get(oldId);
    if (nextId) link.setAttribute('href', `#${nextId}`);
  });
  documentRef.querySelectorAll<HTMLStyleElement>('style').forEach((style) => {
    let css = style.textContent || '';
    idMap.forEach((nextId, oldId) => {
      css = css.split(`#${oldId}`).join(`#${nextId}`);
    });
    style.textContent = css;
  });
}

export function createResearchOnlyLayoutTemplate(source: string, brandName: string): string {
  if (typeof DOMParser === 'undefined') throw new Error('HTML 템플릿 변환기를 사용할 수 없습니다.');
  const documentRef = new DOMParser().parseFromString(source, 'text/html');
  const slides = Array.from(documentRef.querySelectorAll<HTMLElement>('.full-slide'));
  if (slides.length !== PAGE_COUNT) throw new Error(`승인 FULL 보고서는 정확히 ${PAGE_COUNT}페이지여야 합니다.`);

  canonicalizeIds(documentRef);
  slides.forEach((slide, index) => {
    slide.dataset.page = String(index + 1);
    slide.dataset.zone = index < MAIN_COUNT ? 'main' : 'appendix';
  });
  annotateCriticalPages(documentRef);
  const definitions = annotateGenericFields(documentRef);

  const brand = documentRef.querySelector<HTMLElement>('.full-report-brand');
  if (brand) brand.textContent = brandName;
  const toolbar = documentRef.querySelector<HTMLElement>('.full-report-toolbar strong');
  if (toolbar) toolbar.textContent = `${brandName} FULL REPORT`;
  documentRef.title = `${brandName} Strategic Report`;
  documentRef.documentElement.lang = 'ko';
  documentRef.body.dataset.reportVersion = 'full-report-v1';
  documentRef.body.dataset.approvedPilot = 'full-integrated';
  documentRef.body.dataset.contentContract = 'semantic-html-fields-v1';
  documentRef.body.dataset.contentFieldCount = String(definitions.length);
  documentRef.body.dataset.contentState = 'template';
  documentRef.body.dataset.phase6PagePlan = 'approved-sample-main40-appendix8-html-v1';

  if (definitions.length < 220) throw new Error(`의미 기반 콘텐츠 필드가 충분하지 않습니다. 현재 ${definitions.length}개입니다.`);
  return serialize(documentRef);
}

function sanitizeDocument(documentRef: Document): void {
  documentRef.querySelectorAll('script,noscript,base,iframe,object,embed,form').forEach((node) => node.remove());
  documentRef.querySelectorAll<HTMLElement>('*').forEach((element) => {
    Array.from(element.attributes).forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      const value = attribute.value.trim().toLowerCase();
      if (name.startsWith('on')) element.removeAttribute(attribute.name);
      if ((name === 'href' || name === 'src' || name === 'action') && (value.startsWith('javascript:') || value.startsWith('data:text/html'))) {
        element.removeAttribute(attribute.name);
      }
    });
  });
}

function sanitizedInlineFragment(source: HTMLElement, targetDocument: Document): DocumentFragment {
  const fragment = targetDocument.createDocumentFragment();
  const append = (node: Node, parent: Node): void => {
    if (node.nodeType === Node.TEXT_NODE) {
      parent.appendChild(targetDocument.createTextNode(node.nodeValue || ''));
      return;
    }
    if (!(node instanceof Element)) return;
    if (ALLOWED_INLINE_TAGS.has(node.tagName)) {
      const clone = targetDocument.createElement(node.tagName.toLowerCase());
      Array.from(node.childNodes).forEach((child) => append(child, clone));
      parent.appendChild(clone);
      return;
    }
    Array.from(node.childNodes).forEach((child) => append(child, parent));
  };
  Array.from(source.childNodes).forEach((node) => append(node, fragment));
  return fragment;
}

function getFieldMap(documentRef: Document): Map<string, HTMLElement> {
  const map = new Map<string, HTMLElement>();
  documentRef.querySelectorAll<HTMLElement>('[data-report-field]').forEach((element) => {
    const key = element.dataset.reportField || '';
    if (!key || map.has(key)) throw new Error(`중복되거나 비어 있는 의미 필드가 있습니다: ${key || 'unknown'}`);
    map.set(key, element);
  });
  return map;
}

function canonicalizeFrames(documentRef: Document): void {
  documentRef.querySelectorAll<HTMLElement>('.full-frame').forEach((frame) => {
    frame.style.width = '1280px';
    frame.style.height = '720px';
  });
  documentRef.querySelectorAll<HTMLElement>('.full-frame-inner').forEach((inner) => {
    inner.style.width = '1280px';
    inner.style.height = '720px';
    inner.style.transform = 'scale(1)';
    inner.style.transformOrigin = 'top left';
  });
}

function stripContractMetadata(documentRef: Document): void {
  documentRef.querySelectorAll<HTMLElement>('[data-report-field]').forEach((element) => {
    element.removeAttribute('data-report-field');
    element.removeAttribute('data-report-hint');
    element.removeAttribute('data-report-max-length');
    element.removeAttribute('data-report-kind');
  });
}

function assertFixedSemanticStructure(documentRef: Document): void {
  const expectedSlideCount = PAGE_COUNT;
  const slides = Array.from(documentRef.querySelectorAll<HTMLElement>('.full-slide'));
  if (slides.length !== expectedSlideCount) throw new Error(`완성 HTML은 정확히 ${expectedSlideCount}페이지여야 합니다. 현재 ${slides.length}페이지입니다.`);
  if (slides.filter((slide) => slide.dataset.zone === 'main').length !== MAIN_COUNT) throw new Error('Main Deck은 정확히 40페이지여야 합니다.');
  if (slides.filter((slide) => slide.dataset.zone === 'appendix').length !== 8) throw new Error('Appendix는 정확히 8페이지여야 합니다.');
  if (documentRef.querySelector('script,noscript,iframe,object,embed')) throw new Error('활성 콘텐츠가 제거되지 않았습니다.');

  const wantAvoid = Array.from(documentRef.querySelectorAll<HTMLElement>('#category-target .target-tension > b')).map((node) => node.textContent?.trim());
  if (wantAvoid.join('|') !== 'WANT|AVOID') throw new Error('P5 CATEGORY & TARGET의 WANT / AVOID 고정 라벨이 변경되었습니다.');

  if (documentRef.querySelectorAll('#comp-ranking .ranking-interpretation > div').length !== 3) throw new Error('P12 Threat Ranking 하단은 핵심 경쟁사 3개 카드여야 합니다.');
  ['deep-dive-1', 'deep-dive-2', 'deep-dive-3'].forEach((id, index) => {
    const slide = documentRef.getElementById(id);
    if (!slide) throw new Error(`P${13 + index} Deep Dive가 누락되었습니다.`);
    const labels = Array.from(slide.querySelectorAll<HTMLElement>('.deep-node > small')).map((node) => node.textContent?.trim());
    if (labels.join('|') !== 'Evidence|Core Desire|Appeal|Threat Mechanism|Attack Point') throw new Error(`P${13 + index} Deep Dive 소제목 구조가 변경되었습니다.`);
    if (slide.querySelector('.deep-dive-score > small')?.textContent?.trim() !== `위협 ${index + 1}순위`) throw new Error(`P${13 + index} 위협 순위 라벨이 변경되었습니다.`);
  });

  if (documentRef.querySelectorAll('#category-cliche .cliche-head > *').length !== 3) throw new Error('P17 Category Clichés는 3열 구조여야 합니다.');
  if (documentRef.querySelector('#category-cliche .cliche-row > strong')) throw new Error('P17 Category Clichés의 폐기된 새 질문 열이 남아 있습니다.');

  const axes = Array.from(documentRef.querySelectorAll<HTMLElement>('#positioning .axis')).map((node) => (node.textContent || '').trim());
  if (axes.length !== 4 || axes.some((axis) => axis.length < 4 || /^[xy]\s*축?$/i.test(axis) || /^(x|y)\s*axis$/i.test(axis))) {
    throw new Error('P18 Positioning 축에는 X축/Y축이 아니라 의미 있는 축 이름 4개가 필요합니다.');
  }

  const personaIndexes = Array.from(documentRef.querySelectorAll<HTMLElement>('.persona-index')).map((node) => node.textContent?.trim());
  if (personaIndexes.join('|') !== '01|02|03') throw new Error('P22~24 Persona 번호 구조가 변경되었습니다.');
  const aiplCodes = Array.from(documentRef.querySelectorAll<HTMLElement>('#aipl .aipl-stage > b')).map((node) => node.textContent?.trim());
  if (aiplCodes.join('|') !== 'A|I|P1|P2|L') throw new Error('P27 AIPL 단계는 A → I → P1 → P2 → L 순서를 유지해야 합니다.');
  const painHead = Array.from(documentRef.querySelectorAll<HTMLElement>('#pain-needs .pain-head > *')).map((node) => node.textContent?.trim());
  if (painHead.join('|') !== 'Pain|현재 문제|Unmet Need|우선순위') throw new Error('P26 Pain / 현재 문제 / Unmet Need / 우선순위 구조가 변경되었습니다.');

  const historyYears = ['2021', '2022', '2023', '2024', '2025', '2026 YTD'];
  documentRef.querySelectorAll<HTMLElement>('.history-original').forEach((slide) => {
    const years = Array.from(slide.querySelectorAll<HTMLElement>('.history-card > h3')).map((node) => node.textContent?.trim());
    if (years.join('|') !== historyYears.join('|')) throw new Error(`${slide.id}의 6개년도 Creative History 구조가 변경되었습니다.`);
  });

  const stpArrows = Array.from(documentRef.querySelectorAll<HTMLElement>('#stp .stp-arrow')).map((node) => node.textContent?.trim());
  if (stpArrows.join('|') !== '→|→') throw new Error('P38 STP 연결 구조가 변경되었습니다.');
  const positioning = documentRef.querySelector<HTMLElement>('#stp .stp-position > strong')?.textContent?.trim() || '';
  if (!positioning || positioning === '→') throw new Error('P38 STP Positioning 문장이 비어 있거나 화살표와 뒤섞였습니다.');

  const brandPrinciple = documentRef.querySelector<HTMLElement>('#appendix-back .back-cover-copy > h1')?.textContent?.replace(/\s+/g, ' ').trim() || '';
  if (brandPrinciple.length < 10) throw new Error('A8 Brand Principle은 보고서 전체를 압축한 하나의 완결된 메시지여야 합니다.');
}

export function finalizeApprovedHtmlFromExternalOutput(
  outputHtml: string,
  approvedBaseHtml: string,
  brandName: string,
): string {
  if (typeof DOMParser === 'undefined') throw new Error('HTML 검증기를 사용할 수 없습니다.');
  const templateHtml = createResearchOnlyLayoutTemplate(approvedBaseHtml, brandName);
  const templateDocument = new DOMParser().parseFromString(templateHtml, 'text/html');
  const outputDocument = new DOMParser().parseFromString(outputHtml, 'text/html');
  sanitizeDocument(outputDocument);

  const templateSlides = Array.from(templateDocument.querySelectorAll<HTMLElement>('.full-slide')).map((slide) => slide.id);
  const outputSlides = Array.from(outputDocument.querySelectorAll<HTMLElement>('.full-slide')).map((slide) => slide.id);
  if (templateSlides.join('|') !== outputSlides.join('|')) throw new Error('승인 샘플의 48페이지 ID·순서가 변경되었습니다. 레이아웃을 다시 생성하지 말고 의미 필드의 내용만 교체해야 합니다.');

  const templateFields = getFieldMap(templateDocument);
  const outputFields = getFieldMap(outputDocument);
  if (templateFields.size !== outputFields.size) throw new Error(`의미 필드 수가 변경되었습니다. 승인 ${templateFields.size}개 / 입력 ${outputFields.size}개`);

  templateFields.forEach((target, key) => {
    const source = outputFields.get(key);
    if (!source) throw new Error(`누락된 의미 필드: ${key}`);
    const targetSlide = target.closest<HTMLElement>('.full-slide')?.id;
    const sourceSlide = source.closest<HTMLElement>('.full-slide')?.id;
    if (targetSlide !== sourceSlide) throw new Error(`의미 필드가 다른 페이지로 이동했습니다: ${key}`);
    const value = (source.textContent || '').replace(/\s+/g, ' ').trim();
    if (!value || value.includes(FIELD_PREFIX)) throw new Error(`조사 내용으로 채워지지 않은 의미 필드: ${key}`);
    const maxLength = Number(target.dataset.reportMaxLength || 140);
    if (value.length > maxLength) throw new Error(`${key} 내용이 너무 깁니다. ${value.length}자 / 최대 ${maxLength}자. 작은 글씨로 축소하지 말고 핵심만 요약해야 합니다.`);
    target.replaceChildren(sanitizedInlineFragment(source, templateDocument));
  });

  templateDocument.querySelectorAll('style,link[rel="stylesheet"]').forEach((node) => {
    if (node.closest('body')) node.remove();
  });
  canonicalizeFrames(templateDocument);
  stripContractMetadata(templateDocument);
  templateDocument.body.dataset.contentState = 'final';
  templateDocument.body.dataset.contentContract = 'semantic-html-fields-v1';
  templateDocument.title = `${brandName} Strategic Report`;
  assertFixedSemanticStructure(templateDocument);
  return serialize(templateDocument);
}

export function assertAllResearchSlotsFilled(html: string): void {
  const unresolved = html.match(FIELD_PATTERN) || [];
  if (unresolved.length > 0 || html.includes(FIELD_PREFIX)) {
    throw new Error(`조사 내용으로 교체되지 않은 의미 필드가 ${Math.max(unresolved.length, 1)}개 남아 있습니다.`);
  }
  const documentRef = new DOMParser().parseFromString(html, 'text/html');
  assertFixedSemanticStructure(documentRef);
}

function comparable(value: string): string {
  return value.toLowerCase().replace(/[\s,·'"“”‘’()[\]{}]/g, '');
}

function directCompetitors(raw: string): string[] {
  const step2 = raw.split(/## STEP 2/i)[1]?.split(/## STEP [3-5]/i)[0] || '';
  const names = Array.from(step2.matchAll(/^\s*\d+\.\s*\*\*([^*\n—-]+?)(?:\s*[—-]|\*\*)/gm))
    .map((match) => match[1].trim())
    .filter(Boolean);
  return Array.from(new Set(names)).slice(0, 3);
}

function kpiValues(raw: string): string[] {
  const step0 = raw.split(/## STEP 0/i)[1]?.split(/## STEP [1-5]/i)[0] || '';
  const values = Array.from(step0.matchAll(/\*\*([0-9][0-9,.]*(?:조|억|만)?(?:\s*(?:원|명|사업자))?)\*\*/g))
    .map((match) => match[1].trim())
    .filter(Boolean);
  return Array.from(new Set(values)).slice(0, 5);
}

export function assertResearchEvidencePresent(html: string, rawResearch: string, brandName: string): void {
  const documentRef = new DOMParser().parseFromString(html, 'text/html');
  const text = comparable(documentRef.body.textContent || '');
  if (!text.includes(comparable(brandName))) throw new Error(`조사 브랜드명 "${brandName}"이 보고서에 없습니다.`);

  const competitors = directCompetitors(rawResearch);
  const missing = competitors.filter((name) => !text.includes(comparable(name)));
  if (competitors.length >= 2 && missing.length) throw new Error(`Step 2 핵심 경쟁사가 반영되지 않았습니다: ${missing.join(', ')}`);

  const values = kpiValues(rawResearch);
  const matched = values.filter((value) => text.includes(comparable(value)));
  if (values.length >= 2 && matched.length < 2) throw new Error('Step 0 핵심 KPI가 충분히 반영되지 않았습니다.');
}
