import {
  FULL_REPORT_PAGE_COUNT,
  FULL_REPORT_PAGE_IDS,
  assertReportSkeleton,
  canonicalizeReportDocument,
  computeReportDomFingerprint,
  parseReportHtml,
  serializeReportDocument,
} from './reportDomSafety';

export const STRUCTURED_REPORT_VERSION = '3.0.0' as const;

export type StructuredFieldKind = 'text' | 'rich' | 'source' | 'status';

export type StructuredFieldDefinition = {
  key: string;
  page: number;
  pageId: string;
  hint: string;
  maxLength: number;
  kind: StructuredFieldKind;
  enum?: string[];
  fixedYear?: number | '2026 YTD';
};

export type StructuredReportPageV3 = {
  page: number;
  id: string;
  fields: Record<string, string>;
};

export type StructuredReportV3 = {
  version: typeof STRUCTURED_REPORT_VERSION;
  brand: string;
  generatedAt: string;
  pages: StructuredReportPageV3[];
};

export const CREATIVE_HISTORY_STATUS_VALUES = [
  'verified-verbatim',
  'source-found-copy-unverified',
  'not-found',
] as const;

const TEXT_CANDIDATE_SELECTOR = 'h1,h2,h3,h4,p,li,strong,b,span,small,blockquote,th,td,em';
const ALLOWED_CREATIVE_STATUS = new Set<string>(CREATIVE_HISTORY_STATUS_VALUES);
const POLITE_ENDING = /(습니다|입니다|됩니다|합니다|해야 합니다)(?:[.!?]|$)/;
const RAW_URL = /(?:https?:\/\/|www\.)/i;

function directChildren<T extends Element>(root: Element, selector: string): T[] {
  return Array.from(root.querySelectorAll<T>(`:scope > ${selector}`));
}

function setLeadingText(element: Element, value: string): void {
  const first = Array.from(element.childNodes).find((node) => node.nodeType === Node.TEXT_NODE);
  if (first) first.nodeValue = value;
  else element.insertBefore(element.ownerDocument.createTextNode(value), element.firstChild);
}

function markFixed(element: Element | null, value?: string): void {
  if (!element) return;
  element.setAttribute('data-report-fixed', 'true');
  if (value !== undefined) element.textContent = value;
}

function registerField(
  element: Element | null,
  key: string,
  hint: string,
  maxLength = 160,
  kind: StructuredFieldKind = 'text',
  metadata: Pick<StructuredFieldDefinition, 'enum' | 'fixedYear'> = {},
): void {
  if (!element) return;
  if (element.hasAttribute('data-report-field')) return;
  element.setAttribute('data-report-field', key);
  element.setAttribute('data-report-hint', hint);
  element.setAttribute('data-report-max-length', String(maxLength));
  element.setAttribute('data-report-kind', kind);
  if (metadata.enum?.length) element.setAttribute('data-report-enum', metadata.enum.join('|'));
  if (metadata.fixedYear !== undefined) element.setAttribute('data-report-fixed-year', String(metadata.fixedYear));
}

function registerChildren(
  root: ParentNode,
  selector: string,
  prefix: string,
  roles: string[],
  hintPrefix: string,
  maxLength = 140,
): void {
  Array.from(root.querySelectorAll<HTMLElement>(selector)).forEach((element, index) => {
    const role = roles[index] || `value${index + 1}`;
    registerField(element, `${prefix}.${role}`, `${hintPrefix} ${role}`, maxLength, role.includes('source') ? 'source' : 'text');
  });
}

function fixCommonStructure(slide: HTMLElement): void {
  markFixed(slide.querySelector('.full-breadcrumb'));
  markFixed(slide.querySelector('.full-tag'));
  markFixed(slide.querySelector('.full-page'));
  markFixed(slide.querySelector('.full-implication > span'), 'SO WHAT');
  slide.querySelectorAll('i').forEach((node) => markFixed(node));
}

function annotateCommon(slide: HTMLElement): void {
  registerField(slide.querySelector('.full-title-row h2'), `${slide.id}.title`, `${slide.id} conclusion-led page title`, 90, 'rich');
  registerField(slide.querySelector('.full-implication > div'), `${slide.id}.soWhat`, `${slide.id} strategic implication`, 220, 'rich');
  slide.querySelectorAll<HTMLElement>('.full-source').forEach((node, index) => {
    registerField(node, `${slide.id}.source.${index + 1}`, `${slide.id} source label without raw URL`, 180, 'source');
  });
}

function annotateCover(slide: HTMLElement): void {
  markFixed(slide.querySelector('.cover-index'));
  registerField(slide.querySelector('.cover-copy > span'), 'cover.kicker', 'report scope kicker', 80);
  registerField(slide.querySelector('.cover-copy > h1'), 'cover.headline', 'single governing cover headline', 90, 'rich');
  registerField(slide.querySelector('.cover-copy > p'), 'cover.subtitle', 'one-sentence report purpose', 160);
}

function annotateExecutive(slide: HTMLElement): void {
  const blocks = Array.from(slide.querySelectorAll<HTMLElement>('.verdict-axis > div'));
  blocks.forEach((block, index) => {
    registerField(block.querySelector('span'), `executive.step${index + 1}.label`, `executive diagnostic step ${index + 1} label`, 24);
    registerField(block.querySelector('strong'), `executive.step${index + 1}.headline`, `executive diagnostic step ${index + 1} conclusion`, 70, 'rich');
    registerField(block.querySelector('p'), `executive.step${index + 1}.detail`, `executive diagnostic step ${index + 1} evidence`, 150);
  });
  markFixed(slide.querySelector('.report-map'));
}

function annotateIdentity(slide: HTMLElement): void {
  markFixed(slide.querySelector('.identity-definition > span'), 'ONE-SENTENCE DEFINITION');
  registerField(slide.querySelector('.identity-definition > h3'), 'identity.definition', 'one-sentence brand definition', 210);
  markFixed(slide.querySelector('.identity-origin > b'), '브랜드가 출발한 문제');
  registerField(slide.querySelector('.identity-origin > p'), 'identity.origin', 'founding problem and information asymmetry', 240);
  Array.from(slide.querySelectorAll<HTMLTableRowElement>('.detail-table tr')).forEach((row, index) => {
    registerField(row.querySelector('th'), `identity.fact${index + 1}.label`, `identity fact ${index + 1} label`, 30);
    registerField(row.querySelector('td'), `identity.fact${index + 1}.value`, `identity fact ${index + 1} verified value`, 100);
  });
  markFixed(slide.querySelector('.identity-jtbd > span'), 'FOUNDING JTBD');
  registerField(slide.querySelector('.identity-jtbd > strong'), 'identity.foundingJtbd', 'founding customer job', 140, 'rich');
  registerField(slide.querySelector('.identity-jtbd > p'), 'identity.foundingMeaning', 'meaning of founding job', 180);
}

function annotateMetrics(slide: HTMLElement): void {
  Array.from(slide.querySelectorAll<HTMLElement>('.metric-item')).forEach((item, index) => {
    registerField(item.querySelector('span'), `kpi.metric${index + 1}.label`, `verified metric ${index + 1} label`, 40);
    registerField(item.querySelector('strong'), `kpi.metric${index + 1}.value`, `verified metric ${index + 1} value`, 32);
    registerField(item.querySelector('small'), `kpi.metric${index + 1}.period`, `metric ${index + 1} period or provenance`, 60);
    registerField(item.querySelector('p'), `kpi.metric${index + 1}.meaning`, `metric ${index + 1} interpretation`, 120);
  });
  Array.from(slide.querySelectorAll<HTMLElement>('.kpi-logic > div')).forEach((item, index) => {
    registerField(item.querySelector('span'), `kpi.logic${index + 1}.label`, `KPI logic ${index + 1} label`, 20);
    registerField(item.querySelector('b'), `kpi.logic${index + 1}.meaning`, `KPI logic ${index + 1} meaning`, 70);
  });
}

function annotateCategoryTarget(slide: HTMLElement): void {
  registerChildren(slide, '.ring--outer > span', 'category-target.alternative', ['1', '2', '3', '4'], 'category alternative', 36);
  registerField(slide.querySelector('.ring--mid'), 'category-target.category', 'defined competitive category', 60);
  registerField(slide.querySelector('.ring--core'), 'category-target.brandRole', 'target brand role in category', 80, 'rich');
  markFixed(slide.querySelector('.target-statement > span'), 'CORE TARGET');
  registerField(slide.querySelector('.target-statement > h3'), 'category-target.target', 'primary target definition', 170);
  const labels = slide.querySelectorAll('.target-tension > b');
  markFixed(labels[0] || null, 'WANT');
  markFixed(labels[1] || null, 'AVOID');
  const values = slide.querySelectorAll('.target-tension > p');
  registerField(values[0] || null, 'category-target.want', 'what the target wants', 130);
  registerField(values[1] || null, 'category-target.avoid', 'what the target refuses or fears', 130);
}

function annotateGrowth(slide: HTMLElement): void {
  Array.from(slide.querySelectorAll<HTMLElement>('.growth-event')).forEach((event, index) => {
    registerField(event.querySelector('b'), `growth.event${index + 1}.period`, `milestone ${index + 1} verified date or period`, 30);
    registerField(event.querySelector('strong'), `growth.event${index + 1}.title`, `milestone ${index + 1} event`, 70);
    registerField(event.querySelector('p'), `growth.event${index + 1}.meaning`, `milestone ${index + 1} strategic meaning`, 100);
  });
}

function annotateInflection(slide: HTMLElement): void {
  Array.from(slide.querySelectorAll<HTMLElement>('.inflection-flow > div')).forEach((item, index) => {
    markFixed(item.querySelector('span'), `0${index + 1}`);
    registerField(item.querySelector('small'), `inflection.stage${index + 1}.type`, `inflection ${index + 1} type`, 24);
    registerField(item.querySelector('h3'), `inflection.stage${index + 1}.headline`, `inflection ${index + 1} headline`, 70);
    registerField(item.querySelector('p'), `inflection.stage${index + 1}.evidence`, `inflection ${index + 1} evidence`, 140);
    registerField(item.querySelector('b'), `inflection.stage${index + 1}.asset`, `inflection ${index + 1} resulting asset or tension`, 70);
  });
  registerChildren(slide, '.inflection-gap span,.inflection-gap strong', 'inflection.gap', ['productLabel', 'productReality', 'perceptionLabel', 'perceptionReality'], 'product-perception gap', 100);
}

function annotatePortfolio(slide: HTMLElement): void {
  Array.from(slide.querySelectorAll<HTMLElement>('.portfolio-column')).forEach((item, index) => {
    registerField(item.querySelector(':scope > span'), `portfolio.item${index + 1}.stage`, `portfolio ${index + 1} stage`, 24);
    registerField(item.querySelector('h3'), `portfolio.item${index + 1}.name`, `portfolio ${index + 1} product or role`, 50);
    Array.from(item.querySelectorAll('dd')).forEach((value, valueIndex) => {
      registerField(value, `portfolio.item${index + 1}.${['job', 'value', 'proof'][valueIndex] || `value${valueIndex + 1}`}`, `portfolio ${index + 1} ${['job', 'value', 'proof'][valueIndex] || 'detail'}`, 110);
    });
    item.querySelectorAll('dt').forEach((node) => markFixed(node));
  });
  markFixed(slide.querySelector('.best-self-line > span'), 'BRAND BEST SELF');
  registerField(slide.querySelector('.best-self-line > strong'), 'portfolio.bestSelf', 'brand best self', 210, 'rich');
}

function annotateMarket(slide: HTMLElement): void {
  Array.from(slide.querySelectorAll<HTMLElement>('.market-force')).forEach((item, index) => {
    registerField(item.querySelector('span'), `market-context.force${index + 1}.type`, `market force ${index + 1} type`, 24);
    registerField(item.querySelector('h3'), `market-context.force${index + 1}.headline`, `market force ${index + 1} headline`, 70);
    registerField(item.querySelector('p'), `market-context.force${index + 1}.evidence`, `market force ${index + 1} evidence`, 130);
    registerField(item.querySelector('strong'), `market-context.force${index + 1}.implication`, `market force ${index + 1} implication`, 80);
  });
}

function annotateValueLadder(slide: HTMLElement): void {
  Array.from(slide.querySelectorAll<HTMLElement>('.ladder-step')).forEach((item, index) => {
    markFixed(item.querySelector('span'), `LEVEL ${index + 1}`);
    registerField(item.querySelector('b'), `market-shift.level${index + 1}.headline`, `category shift level ${index + 1} headline`, 55);
    registerField(item.querySelector('p'), `market-shift.level${index + 1}.detail`, `category shift level ${index + 1} behavior`, 100);
  });
}

function annotateLandscape(slide: HTMLElement): void {
  slide.querySelectorAll('.candidate-head span').forEach((node) => markFixed(node));
  Array.from(slide.querySelectorAll<HTMLElement>('.candidate-row')).forEach((item, index) => {
    registerField(item.querySelector('b'), `comp-landscape.candidate${index + 1}.name`, `direct competitor candidate ${index + 1} name`, 50);
    registerField(item.querySelector('p'), `comp-landscape.candidate${index + 1}.scope`, `candidate ${index + 1} competitive scope`, 120);
    registerField(item.querySelector('em'), `comp-landscape.candidate${index + 1}.verdict`, `candidate ${index + 1} selection verdict and score`, 38);
  });
  markFixed(slide.querySelector('.category-job > span'), 'CATEGORY JOB');
  registerField(slide.querySelector('.category-job > strong'), 'comp-landscape.categoryJob', 'common category job', 150, 'rich');
}

function annotateRanking(slide: HTMLElement): void {
  slide.querySelectorAll('thead th').forEach((node) => markFixed(node));
  Array.from(slide.querySelectorAll<HTMLTableRowElement>('tbody tr')).forEach((row, index) => {
    const cells = Array.from(row.querySelectorAll<HTMLElement>('td'));
    markFixed(cells[0] || null, String(index + 1));
    ['name', 'penetration', 'growth', 'preference', 'campaign', 'inflection', 'evidence', 'total'].forEach((role, roleIndex) => {
      registerField(cells[roleIndex + 1] || null, `comp-ranking.rank${index + 1}.${role}`, `rank ${index + 1} ${role}`, role === 'name' ? 50 : 18);
    });
  });
  Array.from(slide.querySelectorAll<HTMLElement>('.ranking-interpretation > div')).forEach((item, index) => {
    registerField(item.querySelector('b'), `comp-ranking.rank${index + 1}.summaryName`, `rank ${index + 1} competitor summary name`, 50);
    registerField(item.querySelector('p'), `comp-ranking.rank${index + 1}.meaning`, `rank ${index + 1} strategic meaning`, 110);
  });
}

function annotateDeepDive(slide: HTMLElement, rank: number): void {
  markFixed(slide.querySelector('.deep-dive-score > span'), 'THREAT SCORE');
  registerField(slide.querySelector('.deep-dive-score > strong'), `${slide.id}.score`, `core competitor ${rank} threat score`, 8);
  markFixed(slide.querySelector('.deep-dive-score > small'), `위협 ${rank}순위`);
  const labels = ['Evidence', 'Core Desire', 'Appeal', 'Threat Mechanism', 'Attack Point'];
  Array.from(slide.querySelectorAll<HTMLElement>('.deep-node')).forEach((node, index) => {
    markFixed(node.querySelector('small'), labels[index] || `Step ${index + 1}`);
    const content = node.querySelector<HTMLElement>('p,ul');
    registerField(content, `${slide.id}.${['evidence', 'coreDesire', 'appeal', 'threatMechanism', 'attackPoint'][index] || `step${index + 1}`}`, `core competitor ${rank} ${labels[index] || 'analysis'}`, index === 0 ? 220 : 170, 'rich');
  });
}

function annotateMatrix(slide: HTMLElement): void {
  const header = Array.from(slide.querySelectorAll<HTMLElement>('thead th'));
  markFixed(header[0] || null, '공통 비교축');
  header.slice(1).forEach((cell, index) => registerField(cell, `product-matrix.column${index + 1}.name`, `matrix brand ${index + 1} name`, 50));
  Array.from(slide.querySelectorAll<HTMLTableRowElement>('tbody tr')).forEach((row, rowIndex) => {
    Array.from(row.querySelectorAll<HTMLElement>('td')).forEach((cell, cellIndex) => {
      registerField(cell, `product-matrix.row${rowIndex + 1}.${cellIndex === 0 ? 'axis' : `brand${cellIndex}`}`, `product matrix row ${rowIndex + 1} ${cellIndex === 0 ? 'comparison axis' : `brand ${cellIndex} value`}`, cellIndex === 0 ? 50 : 70);
    });
  });
}

function canonicalizeCliche(slide: HTMLElement): void {
  const head = Array.from(slide.querySelectorAll<HTMLElement>('.cliche-head > *'));
  ['반복 화법', '현재 역할', '구조적 한계'].forEach((label, index) => markFixed(head[index] || null, label));
  head.slice(3).forEach((node) => node.remove());
  Array.from(slide.querySelectorAll<HTMLElement>('.cliche-row')).forEach((row) => {
    const strong = row.querySelector(':scope > strong');
    strong?.remove();
  });
}

function annotateCliche(slide: HTMLElement): void {
  canonicalizeCliche(slide);
  Array.from(slide.querySelectorAll<HTMLElement>('.cliche-row')).forEach((row, index) => {
    const cells = Array.from(row.children) as HTMLElement[];
    registerField(cells[0] || null, `category-cliche.row${index + 1}.phrase`, `category cliché ${index + 1} core phrase`, 45);
    registerField(cells[1] || null, `category-cliche.row${index + 1}.role`, `category cliché ${index + 1} current role`, 110);
    registerField(cells[2] || null, `category-cliche.row${index + 1}.limit`, `category cliché ${index + 1} structural limit`, 120);
  });
}

function annotatePositioning(slide: HTMLElement): void {
  registerField(slide.querySelector('.axis-x-left'), 'positioning.axis.xLeft', 'positioning x-axis left pole; never literal X축', 55);
  registerField(slide.querySelector('.axis-x-right'), 'positioning.axis.xRight', 'positioning x-axis right pole; never literal X축', 55);
  registerField(slide.querySelector('.axis-y-top'), 'positioning.axis.yTop', 'positioning y-axis top pole; never literal Y축', 55);
  registerField(slide.querySelector('.axis-y-bottom'), 'positioning.axis.yBottom', 'positioning y-axis bottom pole; never literal Y축', 55);
  const competitors = Array.from(slide.querySelectorAll<HTMLElement>('.map-dot:not(.biz-as):not(.biz-to)'));
  competitors.slice(0, 3).forEach((node, index) => registerField(node, `positioning.competitor${index + 1}.name`, `ranked competitor ${index + 1} map label`, 50));
  registerField(slide.querySelector('.map-dot.biz-as'), 'positioning.targetAsIs', 'exact target brand AS-IS label', 55);
  registerField(slide.querySelector('.map-dot.biz-to'), 'positioning.targetToBe', 'exact target brand TO-BE label and short descriptor', 80, 'rich');
  markFixed(slide.querySelector('.map-arrow'), '↗');
}

function annotateConsumerExecutive(slide: HTMLElement): void {
  slide.querySelector('.jtbd-header-note')?.remove();
  Array.from(slide.querySelectorAll<HTMLElement>('.consumer-question-shift > div')).forEach((item, index) => {
    registerField(item.querySelector('span'), `consumer-exec.shift${index + 1}.stage`, `consumer decision shift ${index + 1} stage label`, 24);
    registerField(item.querySelector('strong'), `consumer-exec.shift${index + 1}.question`, `consumer decision shift ${index + 1} question or desired change`, 100);
  });
  slide.querySelectorAll('.consumer-question-shift > i').forEach((node) => markFixed(node, '→'));
  const rows = Array.from(slide.querySelectorAll<HTMLTableRowElement>('.jtbd-mini tbody tr'));
  const fixedLabels = ['기능적', '정서적', '사회적'];
  rows.forEach((row, index) => {
    markFixed(row.querySelector('th'), fixedLabels[index] || `JTBD ${index + 1}`);
    registerField(row.querySelector('td'), `consumer-exec.jtbd${index + 1}`, `${fixedLabels[index] || 'JTBD'} desired progress`, 170);
  });
  slide.querySelectorAll('.jtbd-mini thead th').forEach((node) => markFixed(node));
}

function annotateTrends(slide: HTMLElement): void {
  Array.from(slide.querySelectorAll<HTMLElement>('.trend-row')).forEach((row, index) => {
    markFixed(row.querySelector(':scope > b'), `0${index + 1}`);
    const groups = directChildren<HTMLElement>(row, 'div');
    registerField(groups[0]?.querySelector('h3') || null, `consumer-trends.trend${index + 1}.name`, `trend ${index + 1} name`, 60);
    registerField(groups[0]?.querySelector('p') || null, `consumer-trends.trend${index + 1}.evidence`, `trend ${index + 1} evidence`, 140);
    markFixed(groups[1]?.querySelector('span') || null, 'CHANGE');
    registerField(groups[1]?.querySelector('p') || null, `consumer-trends.trend${index + 1}.change`, `trend ${index + 1} behavioral change`, 120);
    markFixed(groups[2]?.querySelector('span') || null, 'SO WHAT');
    registerField(groups[2]?.querySelector('strong') || null, `consumer-trends.trend${index + 1}.soWhat`, `trend ${index + 1} strategic implication`, 100, 'rich');
  });
}

function annotateTarget(slide: HTMLElement): void {
  Array.from(slide.querySelectorAll<HTMLElement>('.target-spectrum > div')).forEach((card, index) => {
    const stage = card.querySelector(':scope > span');
    if (stage) registerField(stage, `consumer-target.target${index + 1}.stage`, `target segment ${index + 1} stage or role`, 26);
    registerField(card.querySelector(':scope > b'), `consumer-target.target${index + 1}.name`, `target segment ${index + 1} exact name`, 55);
    registerField(card.querySelector(':scope > p'), `consumer-target.target${index + 1}.need`, `target segment ${index + 1} situation and need`, 125);
  });
  const profile = Array.from(slide.querySelectorAll<HTMLElement>('.target-profile > *'));
  for (let index = 0; index < profile.length; index += 2) {
    registerField(profile[index] || null, `consumer-target.profile${index / 2 + 1}.label`, `core target profile ${index / 2 + 1} label`, 24);
    registerField(profile[index + 1] || null, `consumer-target.profile${index / 2 + 1}.value`, `core target profile ${index / 2 + 1} value`, 70);
  }
}

function annotatePersona(slide: HTMLElement, index: number, brandName: string): void {
  slide.querySelector('.jtbd-header-note')?.remove();
  markFixed(slide.querySelector('.persona-index'), `0${index}`);
  const labels = slide.querySelectorAll('.persona-label');
  markFixed(labels[0] || null, 'SITUATION');
  markFixed(labels[1] || null, 'REAL JTBD');
  Array.from(slide.querySelectorAll<HTMLElement>('.persona-left li')).forEach((node, itemIndex) => {
    registerField(node, `${slide.id}.situation${itemIndex + 1}`, `persona ${index} situation ${itemIndex + 1}`, 100);
  });
  markFixed(slide.querySelector('.persona-quote > span'), '표면 욕구');
  registerField(slide.querySelector('.persona-quote > strong'), `${slide.id}.surfaceNeed`, `persona ${index} surface need`, 110, 'rich');
  registerField(slide.querySelector('.persona-center > h3'), `${slide.id}.realJob`, `persona ${index} real job to be done`, 150, 'rich');
  markFixed(slide.querySelector('.persona-fears > span'), '핵심 두려움');
  Array.from(slide.querySelectorAll<HTMLElement>('.persona-fears > p')).forEach((node, fearIndex) => {
    registerField(node, `${slide.id}.fear${fearIndex + 1}`, `persona ${index} core fear ${fearIndex + 1}`, 95);
  });
  const identityBlocks = slide.querySelectorAll<HTMLElement>('.identity-shift > div');
  markFixed(identityBlocks[0]?.querySelector('span') || null, 'AS-IS IDENTITY');
  registerField(identityBlocks[0]?.querySelector('p') || null, `${slide.id}.asIsIdentity`, `persona ${index} current identity`, 110);
  markFixed(slide.querySelector('.identity-shift > i'), '→');
  markFixed(identityBlocks[1]?.querySelector('span') || null, 'TO-BE IDENTITY');
  registerField(identityBlocks[1]?.querySelector('p') || null, `${slide.id}.toBeIdentity`, `persona ${index} desired identity`, 110);
  markFixed(slide.querySelector('.brand-role > span'), `${brandName}의 역할`);
  registerField(slide.querySelector('.brand-role > strong'), `${slide.id}.brandRole`, `persona ${index} brand role`, 130, 'rich');
}

function annotateJtbd(slide: HTMLElement): void {
  slide.querySelectorAll('thead th').forEach((node) => markFixed(node));
  Array.from(slide.querySelectorAll<HTMLTableRowElement>('tbody tr')).forEach((row, rowIndex) => {
    Array.from(row.querySelectorAll<HTMLElement>('td')).forEach((cell, cellIndex) => {
      registerField(cell, `jtbd.row${rowIndex + 1}.field${cellIndex + 1}`, `JTBD row ${rowIndex + 1} field ${cellIndex + 1}`, 125);
    });
  });
  const values = slide.querySelectorAll<HTMLElement>('.identity-alignment > b');
  const labels = slide.querySelectorAll<HTMLElement>('.identity-alignment > span');
  markFixed(labels[0] || null, 'AS-IS');
  markFixed(labels[1] || null, 'TO-BE');
  markFixed(slide.querySelector('.identity-alignment > i'), '→');
  registerField(values[0] || null, 'jtbd.identity.asIs', 'current customer identity', 100);
  registerField(values[1] || null, 'jtbd.identity.toBe', 'desired customer identity', 100);
}

function annotatePain(slide: HTMLElement): void {
  ['Pain', '현재 문제', 'Unmet Need', '우선순위'].forEach((label, index) => markFixed(slide.querySelectorAll('.pain-head > *')[index] || null, label));
  Array.from(slide.querySelectorAll<HTMLElement>('.pain-row')).forEach((row, index) => {
    registerField(row.querySelector('b'), `pain-needs.row${index + 1}.pain`, `pain ${index + 1}`, 65);
    registerField(row.querySelector('p'), `pain-needs.row${index + 1}.currentProblem`, `pain ${index + 1} current problem`, 120);
    registerField(row.querySelector('strong'), `pain-needs.row${index + 1}.unmetNeed`, `pain ${index + 1} unmet need`, 110);
    registerField(row.querySelector('em'), `pain-needs.row${index + 1}.priority`, `pain ${index + 1} priority`, 24);
  });
}

function annotateAipl(slide: HTMLElement): void {
  slide.querySelector('.aipl-header-note')?.remove();
  const stageCodes = ['A', 'I', 'P1', 'P2', 'L'];
  const stageLabels = ['Awareness', 'Interest', 'Permission', 'Purchase', 'Loyalty'];
  Array.from(slide.querySelectorAll<HTMLElement>('.aipl-stage')).forEach((stage, index) => {
    markFixed(stage.querySelector('b'), stageCodes[index] || `S${index + 1}`);
    markFixed(stage.querySelector('span'), stageLabels[index] || `Stage ${index + 1}`);
    registerField(stage.querySelector('strong'), `aipl.stage${index + 1}.action`, `${stageLabels[index] || 'AIPL'} action`, 85);
    registerField(stage.querySelector('p'), `aipl.stage${index + 1}.evidence`, `${stageLabels[index] || 'AIPL'} evidence or behavior`, 120);
    registerField(stage.querySelector('em'), `aipl.stage${index + 1}.state`, `${stageLabels[index] || 'AIPL'} transition state`, 65);
  });
  markFixed(slide.querySelector('.friction-analysis > span'), 'INTEREST → PURCHASE');
  registerField(slide.querySelector('.friction-analysis > h3'), 'aipl.bottleneck', 'single core AIPL bottleneck', 75, 'rich');
  Array.from(slide.querySelectorAll<HTMLElement>('.friction-analysis li')).forEach((node, index) => {
    registerField(node, `aipl.reason${index + 1}`, `AIPL bottleneck reason ${index + 1}`, 100);
  });
}

function annotateLoyalty(slide: HTMLElement): void {
  Array.from(slide.querySelectorAll<HTMLElement>('.relationship-loop > div')).forEach((stage, index) => {
    registerField(stage.querySelector('span'), `loyalty.stage${index + 1}.stage`, `purchase-to-loyalty stage ${index + 1} label`, 24);
    registerField(stage.querySelector('b'), `loyalty.stage${index + 1}.headline`, `purchase-to-loyalty stage ${index + 1} headline`, 65);
    registerField(stage.querySelector('p'), `loyalty.stage${index + 1}.detail`, `purchase-to-loyalty stage ${index + 1} detail`, 120);
  });
  Array.from(slide.querySelectorAll<HTMLElement>('.product-principles > *')).forEach((node, index) => {
    registerField(node, `loyalty.principle${index + 1}`, `product principle ${index + 1}`, 85);
  });
}

function annotateHistory(slide: HTMLElement): void {
  const fixedYears = [2021, 2022, 2023, 2024, 2025, '2026 YTD'] as const;
  registerField(slide.querySelector('.history-governing'), `${slide.id}.governing`, 'Creative History evidence rule', 130);
  Array.from(slide.querySelectorAll<HTMLElement>('.history-card')).forEach((card, index) => {
    const fixedYear = fixedYears[index];
    if (fixedYear === undefined) return;
    markFixed(card.querySelector('h3'), String(fixedYear));
    registerField(
      card.querySelector('.history-status'),
      `${slide.id}.year${index + 1}.status`,
      `Creative History ${fixedYear} status`,
      36,
      'status',
      { enum: [...CREATIVE_HISTORY_STATUS_VALUES], fixedYear },
    );
    registerField(card.querySelector('h4'), `${slide.id}.year${index + 1}.campaign`, `Creative History ${fixedYear} campaign`, 70);
    registerField(card.querySelector('blockquote'), `${slide.id}.year${index + 1}.copy`, `Creative History ${fixedYear} verified copy or evidence-gap wording`, 130, 'rich');
    registerField(card.querySelector('.history-detail'), `${slide.id}.year${index + 1}.detail`, `Creative History ${fixedYear} model channel and meaning`, 120);
  });
  const bottoms = slide.querySelectorAll<HTMLElement>('.history-bottom > div');
  markFixed(bottoms[0]?.querySelector('span') || null, 'MESSAGE TRAJECTORY');
  registerField(bottoms[0]?.querySelector('strong') || null, `${slide.id}.trajectory`, 'six-year message trajectory', 200);
  markFixed(bottoms[1]?.querySelector('span') || null, 'STRATEGIC SO WHAT');
  registerField(bottoms[1]?.querySelector('strong') || null, `${slide.id}.strategicSoWhat`, 'Creative History strategic implication', 200, 'rich');
}

function annotateTrajectory(slide: HTMLElement): void {
  Array.from(slide.querySelectorAll<HTMLElement>('.trajectory-brand')).forEach((row, index) => {
    registerField(row.querySelector('b'), `creative-trajectory.brand${index + 1}.name`, `trajectory brand ${index + 1} name`, 45);
    Array.from(row.querySelectorAll<HTMLElement>('span')).forEach((node, stageIndex) => {
      registerField(node, `creative-trajectory.brand${index + 1}.stage${stageIndex + 1}`, `trajectory brand ${index + 1} message stage ${stageIndex + 1}`, 70);
    });
    registerField(row.querySelector('strong'), `creative-trajectory.brand${index + 1}.meaning`, `trajectory brand ${index + 1} strategic meaning`, 110);
  });
}

function annotateCreativeInsight(slide: HTMLElement): void {
  markFixed(slide.querySelector('.current-copy > span'), 'CURRENT COPY');
  registerField(slide.querySelector('.current-copy > blockquote'), 'creative-insight.currentCopy', 'current verified or safely paraphrased copy', 120, 'rich');
  registerField(slide.querySelector('.current-copy > div > b'), 'creative-insight.currentLabel', 'current communication diagnosis label', 45);
  Array.from(slide.querySelectorAll<HTMLElement>('.current-copy > div > p')).forEach((node, index) => {
    registerField(node, `creative-insight.currentIssue${index + 1}`, `current communication issue ${index + 1}`, 100);
  });
  markFixed(slide.querySelector('.gap-arrow'), '→');
  markFixed(slide.querySelector('.missing-character > span'), 'MISSING CHARACTER');
  registerField(slide.querySelector('.missing-character > h3'), 'creative-insight.missingHeadline', 'single missing brand character headline', 75);
  Array.from(slide.querySelectorAll<HTMLElement>('.missing-character li')).forEach((node, index) => {
    registerField(node, `creative-insight.missingPoint${index + 1}`, `missing brand character point ${index + 1}`, 105, 'rich');
  });
}

function annotateSwot(slide: HTMLElement): void {
  registerField(slide.querySelector('.swot-governing'), 'strategy-swot.governing', 'governing SWOT judgment', 180, 'rich');
  Array.from(slide.querySelectorAll<HTMLElement>('.swot-quadrant')).forEach((group, groupIndex) => {
    markFixed(group.querySelector('h3'));
    Array.from(group.querySelectorAll<HTMLElement>('.swot-point')).forEach((point, pointIndex) => {
      registerField(point.querySelector('strong'), `strategy-swot.group${groupIndex + 1}.point${pointIndex + 1}.label`, `SWOT group ${groupIndex + 1} point ${pointIndex + 1} label`, 55);
      registerField(point.querySelector('p'), `strategy-swot.group${groupIndex + 1}.point${pointIndex + 1}.detail`, `SWOT group ${groupIndex + 1} point ${pointIndex + 1} evidence`, 115);
    });
  });
}

function annotateRootCause(slide: HTMLElement): void {
  const evidence = Array.from(slide.querySelectorAll<HTMLElement>('.root-evidence > *'));
  for (let index = 0; index < evidence.length; index += 2) {
    markFixed(evidence[index] || null);
    registerField(evidence[index + 1] || null, `root-cause.evidence${index / 2 + 1}`, `root-cause evidence ${index / 2 + 1}`, 120);
  }
  markFixed(slide.querySelector('.root-gap > small'), 'GAP');
  const gapStrong = slide.querySelectorAll<HTMLElement>('.root-gap > strong');
  const gapP = slide.querySelectorAll<HTMLElement>('.root-gap > p');
  registerField(gapStrong[0] || null, 'root-cause.productLabel', 'product reality label', 30);
  registerField(gapP[0] || null, 'root-cause.productReality', 'product reality', 90);
  markFixed(slide.querySelector('.root-gap > b'), '≠');
  registerField(gapStrong[1] || null, 'root-cause.perceptionLabel', 'market perception label', 30);
  registerField(gapP[1] || null, 'root-cause.perceptionReality', 'market perception reality', 90);
  markFixed(slide.querySelector('.root-core > small'), 'ROOT CAUSE');
  registerField(slide.querySelector('.root-core > h3'), 'root-cause.rootCause', 'single root cause', 170, 'rich');
  markFixed(slide.querySelector('.root-opportunity > small'), 'STRATEGIC OPPORTUNITY');
  registerField(slide.querySelector('.root-opportunity > h3'), 'root-cause.opportunity', 'strategic opportunity', 170, 'rich');
}

function annotateStp(slide: HTMLElement): void {
  markFixed(slide.querySelector('.stp-segments > span'), 'SEGMENTATION');
  Array.from(slide.querySelectorAll<HTMLElement>('.stp-segments > div')).forEach((segment, index) => {
    registerField(segment.querySelector('b'), `stp.segment${index + 1}.name`, `segment ${index + 1} name`, 55);
    registerField(segment.querySelector('p'), `stp.segment${index + 1}.trait`, `segment ${index + 1} trait`, 105);
    registerField(segment.querySelector('small'), `stp.segment${index + 1}.value`, `segment ${index + 1} value or role`, 65);
  });
  slide.querySelectorAll('.stp-arrow').forEach((node) => markFixed(node, '→'));
  markFixed(slide.querySelector('.stp-target > span'), 'TARGETING');
  registerField(slide.querySelector('.stp-target > strong'), 'stp.target.name', 'selected target name', 75);
  registerField(slide.querySelector('.stp-target > p'), 'stp.target.description', 'selected target description', 120);
  markFixed(slide.querySelector('.stp-position > span'), 'POSITIONING');
  registerField(slide.querySelector('.stp-position > strong'), 'stp.positioning', 'one-sentence positioning statement', 170, 'rich');
}

function annotateRoutes(slide: HTMLElement): void {
  slide.querySelectorAll('.route-head > *').forEach((node) => markFixed(node));
  Array.from(slide.querySelectorAll<HTMLElement>('.route-row')).forEach((row, index) => {
    const id = ['A', 'B', 'C', 'D'][index] || String(index + 1);
    const badge = row.querySelector('b');
    if (badge) {
      setLeadingText(badge, id);
      badge.setAttribute('data-report-fixed-leading', id);
      registerField(badge.querySelector('small'), `strategy-routes.route${id}.type`, `route ${id} strategy type`, 35);
    }
    registerField(row.querySelector('strong'), `strategy-routes.route${id}.proposition`, `route ${id} proposition`, 75);
    const paragraphs = row.querySelectorAll<HTMLElement>('p');
    registerField(paragraphs[0] || null, `strategy-routes.route${id}.direction`, `route ${id} direction`, 120);
    registerField(paragraphs[1] || null, `strategy-routes.route${id}.tradeoff`, `route ${id} trade-off`, 120);
    const scores = row.querySelectorAll<HTMLElement>(':scope > span');
    ['differentiation', 'expansion', 'execution'].forEach((role, scoreIndex) => {
      registerField(scores[scoreIndex] || null, `strategy-routes.route${id}.${role}`, `route ${id} ${role} rating`, 24);
    });
  });
}

function annotateChoice(slide: HTMLElement): void {
  markFixed(slide.querySelector('.choice-criteria > span'), 'SELECTION CRITERIA');
  Array.from(slide.querySelectorAll<HTMLElement>('.choice-criteria > div')).forEach((item, index) => {
    registerField(item.querySelector('b'), `strategy-choice.criterion${index + 1}.name`, `selection criterion ${index + 1} name`, 45);
    registerField(item.querySelector('p'), `strategy-choice.criterion${index + 1}.detail`, `selection criterion ${index + 1} detail`, 105);
  });
  const labels = slide.querySelectorAll<HTMLElement>('.choice-final > span');
  markFixed(labels[0] || null, 'BIG IDEAL');
  markFixed(labels[1] || null, 'WINNING MOVE');
  registerField(slide.querySelector('.choice-final > h3'), 'strategy-choice.bigIdeal', 'Big IdeaL belief statement', 170, 'rich');
  registerField(slide.querySelector('.choice-final > h2'), 'strategy-choice.winningMove', 'Winning Move name', 100, 'rich');
  registerField(slide.querySelector('.choice-final > p'), 'strategy-choice.proof', 'Winning Move product proof', 150);
}

function annotateClose(slide: HTMLElement): void {
  markFixed(slide.querySelector('.back-cover-copy > span'), 'BRAND PRINCIPLE');
  registerField(slide.querySelector('.back-cover-copy > h1'), 'decision-close.principle', 'one governing final brand principle that summarizes page 39', 110, 'rich');
  registerField(slide.querySelector('.back-cover-copy > p'), 'decision-close.support', 'one short supporting line; no disconnected slogan fragments', 120);
}

function annotateGeneric(slide: HTMLElement): void {
  let index = 0;
  Array.from(slide.querySelectorAll<HTMLElement>(TEXT_CANDIDATE_SELECTOR)).forEach((element) => {
    if (element.hasAttribute('data-report-field') || element.hasAttribute('data-report-fixed')) return;
    if (element.closest('[data-report-field],[data-report-fixed]')) return;
    if (element.matches('.material-symbols-outlined,.full-page,.full-tag,.full-breadcrumb')) return;
    if (element.querySelector(TEXT_CANDIDATE_SELECTOR)) return;
    const text = (element.textContent || '').trim();
    if (!text) return;
    index += 1;
    const role = Array.from(element.classList)[0] || element.tagName.toLowerCase();
    registerField(element, `${slide.id}.content${index}`, `${slide.id} ${role} content ${index}`, 140, element.tagName === 'BLOCKQUOTE' ? 'rich' : 'text');
  });
}

function applyPageAnnotation(slide: HTMLElement, brandName: string): void {
  fixCommonStructure(slide);
  annotateCommon(slide);
  switch (slide.id) {
    case 'cover': annotateCover(slide); break;
    case 'executive': annotateExecutive(slide); break;
    case 'identity': annotateIdentity(slide); break;
    case 'kpi': annotateMetrics(slide); break;
    case 'category-target': annotateCategoryTarget(slide); break;
    case 'growth': annotateGrowth(slide); break;
    case 'inflection': annotateInflection(slide); break;
    case 'portfolio': annotatePortfolio(slide); break;
    case 'market-context': annotateMarket(slide); break;
    case 'market-shift': annotateValueLadder(slide); break;
    case 'comp-landscape': annotateLandscape(slide); break;
    case 'comp-ranking': annotateRanking(slide); break;
    case 'deep-dive-1': annotateDeepDive(slide, 1); break;
    case 'deep-dive-2': annotateDeepDive(slide, 2); break;
    case 'deep-dive-3': annotateDeepDive(slide, 3); break;
    case 'product-matrix': annotateMatrix(slide); break;
    case 'category-cliche': annotateCliche(slide); break;
    case 'positioning': annotatePositioning(slide); break;
    case 'consumer-exec': annotateConsumerExecutive(slide); break;
    case 'consumer-trends': annotateTrends(slide); break;
    case 'consumer-target': annotateTarget(slide); break;
    case 'persona-1': annotatePersona(slide, 1, brandName); break;
    case 'persona-2': annotatePersona(slide, 2, brandName); break;
    case 'persona-3': annotatePersona(slide, 3, brandName); break;
    case 'jtbd': annotateJtbd(slide); break;
    case 'pain-needs': annotatePain(slide); break;
    case 'aipl': annotateAipl(slide); break;
    case 'loyalty': annotateLoyalty(slide); break;
    case 'creative-history-target':
    case 'creative-history-1':
    case 'creative-history-2':
    case 'creative-history-3': annotateHistory(slide); break;
    case 'creative-trajectory': annotateTrajectory(slide); break;
    case 'creative-insight': annotateCreativeInsight(slide); break;
    case 'strategy-swot': annotateSwot(slide); break;
    case 'root-cause': annotateRootCause(slide); break;
    case 'stp': annotateStp(slide); break;
    case 'strategy-routes': annotateRoutes(slide); break;
    case 'strategy-choice': annotateChoice(slide); break;
    case 'decision-close': annotateClose(slide); break;
    default: break;
  }
  annotateGeneric(slide);
}

export function annotateStructuredReportDocument(documentRef: Document, brandName: string): StructuredFieldDefinition[] {
  canonicalizeReportDocument(documentRef, brandName);
  assertReportSkeleton(documentRef);
  documentRef.querySelectorAll('[data-report-field],[data-report-hint],[data-report-max-length],[data-report-kind],[data-report-enum],[data-report-fixed-year],[data-report-fixed],[data-report-fixed-leading]').forEach((node) => {
    ['data-report-field', 'data-report-hint', 'data-report-max-length', 'data-report-kind', 'data-report-enum', 'data-report-fixed-year', 'data-report-fixed', 'data-report-fixed-leading'].forEach((name) => node.removeAttribute(name));
  });
  FULL_REPORT_PAGE_IDS.forEach((id) => {
    const slide = documentRef.getElementById(id);
    if (!(slide instanceof HTMLElement)) throw new Error(`Structured report page missing: ${id}`);
    applyPageAnnotation(slide, brandName);
  });

  const definitions: StructuredFieldDefinition[] = [];
  documentRef.querySelectorAll<HTMLElement>('[data-report-field]').forEach((element) => {
    const slide = element.closest<HTMLElement>('.full-slide');
    if (!slide) return;
    const enumValues = (element.dataset.reportEnum || '').split('|').filter(Boolean);
    const fixedYearRaw = element.dataset.reportFixedYear;
    let fixedYear: StructuredFieldDefinition['fixedYear'];
    if (fixedYearRaw === '2026 YTD') fixedYear = '2026 YTD';
    else if (fixedYearRaw && Number.isFinite(Number(fixedYearRaw))) fixedYear = Number(fixedYearRaw);
    definitions.push({
      key: element.dataset.reportField || '',
      page: Number(slide.dataset.page),
      pageId: slide.id,
      hint: element.dataset.reportHint || '',
      maxLength: Number(element.dataset.reportMaxLength || 140),
      kind: (element.dataset.reportKind || 'text') as StructuredFieldKind,
      ...(enumValues.length ? { enum: enumValues } : {}),
      ...(fixedYear !== undefined ? { fixedYear } : {}),
    });
  });

  const keys = definitions.map((definition) => definition.key);
  if (new Set(keys).size !== keys.length) throw new Error('Structured field key is duplicated.');
  if (definitions.length < 260) throw new Error(`Structured field coverage is insufficient: ${definitions.length}`);
  return definitions;
}

function pageDefinitions(definitions: StructuredFieldDefinition[], pageId: string): StructuredFieldDefinition[] {
  return definitions.filter((definition) => definition.pageId === pageId);
}

export function createStructuredReportSkeleton(brandName: string, definitions: StructuredFieldDefinition[]): StructuredReportV3 {
  return {
    version: STRUCTURED_REPORT_VERSION,
    brand: brandName,
    generatedAt: new Date().toISOString(),
    pages: FULL_REPORT_PAGE_IDS.map((id, index) => ({
      page: index + 1,
      id,
      fields: Object.fromEntries(pageDefinitions(definitions, id).map((definition) => [definition.key, ''])),
    })),
  };
}

export function buildStructuredReportPrompt(
  rawResearch: string,
  brandName: string,
  definitions: StructuredFieldDefinition[],
  creativeDirective = '',
): string {
  const schema = FULL_REPORT_PAGE_IDS.map((id, index) => ({
    page: index + 1,
    id,
    fields: pageDefinitions(definitions, id).map(({ key, hint, maxLength, kind, enum: enumValues, fixedYear }) => ({
      key,
      hint,
      maxLength,
      kind,
      ...(enumValues?.length ? { enum: enumValues } : {}),
      ...(fixedYear !== undefined ? { fixedYear } : {}),
    })),
  }));
  const skeleton = createStructuredReportSkeleton(brandName, definitions);
  return `[ROLE]\nYou are a strategic content compiler. The application, not you, owns the complete 40-page HTML/CSS renderer.\n\n[OUTPUT CONTRACT]\n- Return JSON only. Never return HTML, CSS, JavaScript, Markdown, or code fences.\n- Use version \"${STRUCTURED_REPORT_VERSION}\".\n- Preserve the exact brand name: ${brandName}\n- Return exactly 40 pages in the supplied order and exactly the supplied field keys.\n- Fill each field only from Step 0–5 research.\n- Never move one field's content into another field.\n- Never invent figures, dates, sources, copy, competitors, scores, axes, or evidence.\n- Never output raw URLs. Use publisher · title · year source labels.\n- Titles, judgments, and SO WHAT use decisive Korean endings: ~한다, ~이다, ~다.\n- Use [[important phrase]] only for a short highlight. Do not use HTML tags.\n- Respect maxLength as a hard character limit.\n\n[COMPETITOR CONTRACT]\n- P11 reviews up to five evidence-supported candidates.\n- P12 selects the core three.\n- P13–18 and P30–33 use the same core three in ranking order.\n- P18 axis values must be meaningful attribute poles, never literal X축 or Y축.\n\n[PAGE GRAMMAR]\n- P5 fixed labels are WANT and AVOID.\n- P13–15 fields map to Evidence, Core Desire, Appeal, Threat Mechanism, Attack Point.\n- P17 has only 반복 화법 / 현재 역할 / 구조적 한계.\n- P22–24 Persona titles must equal the first three target names on P21.\n- P26 keeps Pain / 현재 문제 / Unmet Need / 우선순위 in one record.\n- P27 keeps A→I→P1→P2→L field boundaries.\n- P37 keeps Segmentation → Targeting → Positioning.\n- P38 keeps A/B/C/D route boundaries.\n- P40 summarizes P39 in one governing message.\n\n[CREATIVE HISTORY]\n${creativeDirective}\n\n[FIELD SCHEMA]\n${JSON.stringify(schema, null, 2)}\n\n[EMPTY JSON SKELETON]\n${JSON.stringify(skeleton, null, 2)}\n\n[STEP 0–5 RESEARCH]\n${rawResearch.replace(/\[cite.*?\]|\\cite.*?|\[cite_start\]/g, '')}\n`;
}

export function extractStructuredReportJson(output: string): StructuredReportV3 {
  let value = output.trim();
  const fenced = value.match(/```json\s*([\s\S]*?)```/i) || value.match(/```\s*([\s\S]*?)```/i);
  if (fenced) value = fenced[1].trim();
  const start = value.indexOf('{');
  const end = value.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error('구조화 JSON을 확인할 수 없다.');
  try {
    return JSON.parse(value.slice(start, end + 1)) as StructuredReportV3;
  } catch (error) {
    throw new Error(`구조화 JSON 파싱 오류: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export type StructuredNormalizationWarning = {
  page: number;
  pageId: string;
  pageTitle: string;
  fieldKey: string;
  fieldLabel: string;
  inputValue: string;
  normalizedValue: string;
  expectedValues: string[];
  autoRecovered: true;
};

const CREATIVE_HISTORY_PAGE_TITLES: Record<string, string> = {
  'creative-history-target': '타깃 브랜드 Creative History',
  'creative-history-1': '경쟁사 1 Creative History',
  'creative-history-2': '경쟁사 2 Creative History',
  'creative-history-3': '경쟁사 3 Creative History',
};

function pageTitleFor(page: StructuredReportPageV3 | undefined): string {
  if (!page) return '페이지 제목 미확인';
  return page.fields?.[`${page.id}.title`]?.trim()
    || CREATIVE_HISTORY_PAGE_TITLES[page.id]
    || page.id;
}

function statusFieldLabel(definition: StructuredFieldDefinition): string {
  return `${definition.fixedYear ?? '연도 미확인'} 상태`;
}

export function normalizeStructuredReportV3(
  report: StructuredReportV3,
  definitions: StructuredFieldDefinition[],
): { report: StructuredReportV3; warnings: StructuredNormalizationWarning[] } {
  const normalized = JSON.parse(JSON.stringify(report)) as StructuredReportV3;
  const warnings: StructuredNormalizationWarning[] = [];

  definitions.filter((definition) => definition.kind === 'status').forEach((definition) => {
    const page = normalized.pages?.[definition.page - 1];
    const value = page?.fields?.[definition.key];
    if (!page || typeof value !== 'string' || ALLOWED_CREATIVE_STATUS.has(value.trim())) return;
    const expectedValues = definition.enum?.length ? definition.enum : [...CREATIVE_HISTORY_STATUS_VALUES];
    const match = value.match(/^(.*?) · (verified-verbatim|source-found-copy-unverified|not-found)$/);
    if (!match || definition.fixedYear === undefined || match[1] !== String(definition.fixedYear)) return;
    const normalizedValue = match[2];
    if (!expectedValues.includes(normalizedValue)) return;
    page.fields[definition.key] = normalizedValue;
    warnings.push({
      page: definition.page,
      pageId: definition.pageId,
      pageTitle: pageTitleFor(page),
      fieldKey: definition.key,
      fieldLabel: statusFieldLabel(definition),
      inputValue: value,
      normalizedValue,
      expectedValues,
      autoRecovered: true,
    });
  });

  return { report: normalized, warnings };
}

export function formatStructuredNormalizationWarnings(warnings: StructuredNormalizationWarning[]): string {
  if (!warnings.length) return '';
  const details = warnings.map((warning) => [
    `P${warning.page} · ${warning.pageTitle}`,
    warning.fieldLabel,
    `입력값: “${warning.inputValue}”`,
    `예상값: “${warning.normalizedValue}”`,
    '처리: 앱이 연도 접두어를 제거하고 자동 정규화했습니다.',
  ].join('
')).join('

');
  return `Creative History 입력 형식 ${warnings.length}건을 앱이 자동 정규화했습니다.

${details}

연도는 앱이 자동 배치하므로 상태 값에는 넣지 마세요.`;
}

function validatePersonaTitleConsistency(report: StructuredReportV3, errors: string[]): void {
  const target = report.pages.find((page) => page.id === 'consumer-target');
  if (!target) return;
  const names = [1, 2, 3].map((index) => target.fields[`consumer-target.target${index}.name`]?.trim());
  [1, 2, 3].forEach((index) => {
    const persona = report.pages.find((page) => page.id === `persona-${index}`);
    const title = persona?.fields[`persona-${index}.title`]?.trim();
    if (names[index - 1] && title !== names[index - 1]) errors.push(`P${21 + index} Persona title must exactly match P21 target ${index}.`);
  });
}

export function validateStructuredReportV3(
  report: StructuredReportV3,
  definitions: StructuredFieldDefinition[],
  expectedBrand: string,
): string[] {
  const errors: string[] = [];
  if (report.version !== STRUCTURED_REPORT_VERSION) errors.push(`version must be ${STRUCTURED_REPORT_VERSION}`);
  if (report.brand?.trim() !== expectedBrand.trim()) errors.push(`brand must exactly equal ${expectedBrand}`);
  if (!Array.isArray(report.pages) || report.pages.length !== FULL_REPORT_PAGE_COUNT) errors.push('pages must contain exactly 40 items');

  FULL_REPORT_PAGE_IDS.forEach((id, index) => {
    const page = report.pages?.[index];
    if (!page || page.page !== index + 1 || page.id !== id) {
      errors.push(`P${String(index + 1).padStart(2, '0')} must use id ${id}`);
      return;
    }
    if (!page.fields || typeof page.fields !== 'object' || Array.isArray(page.fields)) {
      errors.push(`${id}.fields must be an object`);
      return;
    }
    const expected = pageDefinitions(definitions, id);
    const expectedKeys = new Set(expected.map((definition) => definition.key));
    const actualKeys = Object.keys(page.fields);
    expected.forEach((definition) => {
      const value = page.fields[definition.key];
      if (typeof value !== 'string' || !value.trim()) errors.push(`${definition.key} is required`);
      else {
        if (value.length > definition.maxLength) errors.push(`${definition.key} exceeds maxLength ${definition.maxLength}`);
        if (/<\/?[a-z][^>]*>/i.test(value)) errors.push(`${definition.key} must not contain HTML`);
        if (RAW_URL.test(value)) errors.push(`${definition.key} must not contain a raw URL`);
        if ((definition.key.endsWith('.title') || definition.key.endsWith('.soWhat')) && POLITE_ENDING.test(value)) errors.push(`${definition.key} must use declarative consulting tone`);
        if (definition.kind === 'status') {
          const expectedValues = definition.enum?.length ? definition.enum : [...CREATIVE_HISTORY_STATUS_VALUES];
          if (!expectedValues.includes(value.trim())) {
            errors.push([
              `P${definition.page} · ${pageTitleFor(page)} · ${statusFieldLabel(definition)}`,
              `입력값: “${value}”`,
              `허용값:
${expectedValues.map((item) => `- ${item}`).join('
')}`,
              '처리: 자동 복구할 수 없어 렌더링을 중단했습니다.',
            ].join('
'));
          }
        }
      }
    });
    actualKeys.filter((key) => !expectedKeys.has(key)).forEach((key) => errors.push(`${id} contains unknown field ${key}`));
  });

  const positioning = report.pages.find((page) => page.id === 'positioning');
  ['xLeft', 'xRight', 'yTop', 'yBottom'].forEach((axis) => {
    const value = positioning?.fields[`positioning.axis.${axis}`] || '';
    if (/^[XY]축$/i.test(value.trim()) || /^(x|y)\s*axis$/i.test(value.trim())) errors.push(`positioning.axis.${axis} must contain an evidence-based axis name`);
  });
  const stpPosition = report.pages.find((page) => page.id === 'stp')?.fields['stp.positioning'] || '';
  if (/^[→↗⇒]+$/.test(stpPosition.trim())) errors.push('stp.positioning cannot be a connector');
  const close = report.pages.find((page) => page.id === 'decision-close');
  if ((close?.fields['decision-close.principle'] || '').trim() === (close?.fields['decision-close.support'] || '').trim()) errors.push('P40 principle and support must not duplicate each other');
  validatePersonaTitleConsistency(report, errors);

  report.pages?.filter((page) => page.id.startsWith('creative-history')).forEach((page) => {
    for (let index = 1; index <= 6; index += 1) {
      const status = page.fields[`${page.id}.year${index}.status`];
      const copy = page.fields[`${page.id}.year${index}.copy`] || '';
      if (status !== 'verified-verbatim' && /[“”\"]/g.test(copy)) errors.push(`${page.id}.year${index}.copy may use quotation marks only when verified-verbatim`);
    }
  });

  return errors;
}

function appendSafeRichText(documentRef: Document, element: Element, value: string): void {
  element.replaceChildren();
  const parts = value.split(/(\[\[[\s\S]*?\]\]|\n)/g).filter(Boolean);
  parts.forEach((part) => {
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

function applyFieldValue(documentRef: Document, element: HTMLElement, value: string, kind: StructuredFieldKind): void {
  if (kind === 'rich') appendSafeRichText(documentRef, element, value);
  else if (kind === 'source') element.textContent = `SOURCE · ${value}`;
  else element.textContent = value;

  if (kind === 'status') {
    const normalized = value.trim();
    element.className = `history-status history-status--${normalized}`;
    const card = element.closest<HTMLElement>('.history-card');
    if (card) {
      card.dataset.copyStatus = normalized;
      card.classList.toggle('is-verified', normalized === 'verified-verbatim');
    }
  }
}

export function renderStructuredReportV3(
  approvedBaseHtml: string,
  report: StructuredReportV3,
  expectedBrand: string,
): string {
  const documentRef = parseReportHtml(approvedBaseHtml);
  const definitions = annotateStructuredReportDocument(documentRef, expectedBrand);
  const beforeFingerprint = computeReportDomFingerprint(documentRef);
  const errors = validateStructuredReportV3(report, definitions, expectedBrand);
  if (errors.length) throw new Error(`구조화 보고서 검증 오류\n${errors.slice(0, 24).join('\n')}${errors.length > 24 ? `\n외 ${errors.length - 24}건` : ''}`);

  const values = new Map<string, string>();
  report.pages.forEach((page) => Object.entries(page.fields).forEach(([key, value]) => values.set(key, value)));
  documentRef.querySelectorAll<HTMLElement>('[data-report-field]').forEach((element) => {
    const key = element.dataset.reportField || '';
    const value = values.get(key);
    if (value === undefined) throw new Error(`렌더링 필드가 누락됐다: ${key}`);
    applyFieldValue(documentRef, element, value, (element.dataset.reportKind || 'text') as StructuredFieldKind);
  });

  documentRef.querySelectorAll<HTMLElement>('[data-report-fixed-leading]').forEach((element) => {
    setLeadingText(element, element.dataset.reportFixedLeading || '');
  });
  canonicalizeReportDocument(documentRef, expectedBrand);
  documentRef.body.dataset.contentContract = 'structured-report-v3';
  documentRef.body.dataset.contentState = 'compiled';
  documentRef.body.dataset.structuredReportVersion = STRUCTURED_REPORT_VERSION;
  const afterFingerprint = computeReportDomFingerprint(documentRef);
  if (beforeFingerprint !== afterFingerprint) throw new Error('앱 소유 DOM 구조가 렌더링 중 변경됐다.');
  return serializeReportDocument(documentRef);
}

export function prepareStructuredReportBase(approvedBaseHtml: string, brandName: string): {
  html: string;
  definitions: StructuredFieldDefinition[];
} {
  const documentRef = parseReportHtml(approvedBaseHtml);
  const definitions = annotateStructuredReportDocument(documentRef, brandName);
  documentRef.body.dataset.contentContract = 'structured-report-v3-template';
  documentRef.body.dataset.contentState = 'template';
  return { html: serializeReportDocument(documentRef), definitions };
}
