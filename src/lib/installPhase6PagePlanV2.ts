const PLAN_VERSION = 'focus3-main40-no-appendix-v3';
const SOURCE_PAGE_COUNT = 48;
const MAIN_COUNT = 40;
const JOB_DEFINITION = 'JOB : 고객이 특정 상황에서 달성하고 싶어 하는 근본적인 목표나 해결하고자 하는 일을 뜻함';

const MAIN_IDS = [
  'cover','executive','identity','kpi','category-target','growth','inflection','portfolio',
  'market-context','market-shift',
  'comp-landscape','comp-ranking','deep-삼쩜삼','deep-더낸세금·혜움','deep-SSEM','product-matrix','category-cliche','positioning',
  'consumer-exec','consumer-trends','consumer-target','persona-1','persona-2','persona-3','jtbd','pain-needs','aipl','loyalty',
  'creative-비즈넵','creative-삼쩜삼','creative-더낸세금·혜움','creative-SSEM·쌤157','creative-trajectory','creative-insight',
  'strategy-swot','root-cause','stp','strategy-routes','strategy-choice','decision-close',
] as const;

const NAV_GROUPS = [
  ['0. BRAND FACT BOOK', MAIN_IDS.slice(0, 8)],
  ['I. MARKET', MAIN_IDS.slice(8, 10)],
  ['II. COMPETITOR', MAIN_IDS.slice(10, 18)],
  ['III. CONSUMER', MAIN_IDS.slice(18, 28)],
  ['IV. CREATIVE', MAIN_IDS.slice(28, 34)],
  ['V. STRATEGY', MAIN_IDS.slice(34, 40)],
] as const;

type Meta = { id: string; chapter: string; title?: string; tag?: string };

function getSlide(documentRef: Document, id: string): HTMLElement {
  const node = documentRef.getElementById(id);
  if (!(node instanceof HTMLElement)) throw new Error(`Missing Phase 6 slide: ${id}`);
  return node;
}

function setMeta(target: HTMLElement, meta: Meta): void {
  target.id = meta.id;
  const breadcrumb = target.querySelector<HTMLElement>('.full-breadcrumb');
  const title = target.querySelector<HTMLElement>('.full-title-row h2');
  const tag = target.querySelector<HTMLElement>('.full-tag');
  if (breadcrumb) breadcrumb.textContent = meta.chapter;
  if (title && meta.title) title.textContent = meta.title;
  if (tag && meta.tag) tag.textContent = meta.tag;
}

function restoreApprovedLabels(documentRef: Document): void {
  setMeta(getSlide(documentRef, 'executive'), {
    id: 'executive',
    chapter: 'EXECUTIVE / 핵심 진단',
    tag: '핵심 진단',
  });
  setMeta(getSlide(documentRef, 'kpi'), {
    id: 'kpi',
    chapter: '0. BRAND FACT BOOK / FACTS',
    tag: 'FACTS',
  });
  setMeta(getSlide(documentRef, 'category-target'), {
    id: 'category-target',
    chapter: '0. BRAND FACT BOOK / CATEGORY & TARGET',
  });
  setMeta(getSlide(documentRef, 'market-shift'), {
    id: 'market-shift',
    chapter: 'I. MARKET > CATEGORY SHIFT',
    tag: 'CATEGORY SHIFT',
  });

  documentRef.querySelectorAll<HTMLElement>('#market-shift .ladder-step > span').forEach((label, index) => {
    label.textContent = `LEVEL ${index + 1}`;
    label.style.fontSize = '9px';
    label.style.whiteSpace = 'nowrap';
  });

  ['persona-1', 'persona-2', 'persona-3'].forEach((id) => {
    getSlide(documentRef, id).dataset.personaTitleSource = 'core-target';
  });
}

function ensureJobDefinitionNotes(documentRef: Document): void {
  documentRef.querySelectorAll('#comp-landscape .jtbd-header-note, #jtbd .jtbd-header-note').forEach((node) => node.remove());

  const categoryJob = documentRef.querySelector<HTMLElement>('#comp-landscape .category-job');
  if (categoryJob) {
    const label = categoryJob.querySelector<HTMLElement>(':scope > span');
    if (label) label.textContent = 'CATEGORY JOB';
    let note = categoryJob.querySelector<HTMLElement>(':scope > .job-definition-note--category');
    if (!note) {
      note = documentRef.createElement('div');
      note.className = 'job-definition-note job-definition-note--category';
      categoryJob.appendChild(note);
    }
    note.textContent = JOB_DEFINITION;
    note.style.gridColumn = '1 / -1';
    note.style.marginTop = '2px';
    note.style.paddingTop = '6px';
    note.style.borderTop = '1px solid rgba(91,103,214,.18)';
    note.style.color = 'var(--full-muted)';
    note.style.fontSize = '8px';
    note.style.lineHeight = '1.45';
    note.style.wordBreak = 'keep-all';
  }

  const jtbdBody = documentRef.querySelector<HTMLElement>('#jtbd .full-slide-body');
  const jtbdTable = jtbdBody?.querySelector<HTMLElement>('.jtbd-table');
  if (jtbdBody && jtbdTable) {
    let note = jtbdBody.querySelector<HTMLElement>(':scope > .job-definition-note--table');
    if (!note) {
      note = documentRef.createElement('div');
      note.className = 'job-definition-note job-definition-note--table';
      jtbdBody.insertBefore(note, jtbdTable);
    }
    note.textContent = JOB_DEFINITION;
    note.style.margin = '0 0 7px';
    note.style.color = 'var(--full-muted)';
    note.style.fontSize = '8px';
    note.style.lineHeight = '1.45';
    note.style.wordBreak = 'keep-all';
  }
}

function restoreApprovedVisuals(documentRef: Document): void {
  documentRef.querySelectorAll<HTMLElement>('#market-context .market-force strong').forEach((node) => {
    node.style.fontSize = '12px';
    node.style.lineHeight = '1.5';
  });
  documentRef.querySelectorAll<HTMLElement>('.persona-index').forEach((node) => {
    node.style.minWidth = '62px';
    node.style.whiteSpace = 'nowrap';
    node.style.wordBreak = 'normal';
    node.style.overflowWrap = 'normal';
  });
  documentRef.querySelectorAll('.history-now').forEach((node) => node.remove());
  documentRef.querySelectorAll<HTMLElement>('.history-original .history-card').forEach((node) => {
    node.style.alignItems = 'center';
    node.style.textAlign = 'center';
    node.style.borderRadius = '0';
  });
  const creative = documentRef.querySelector<HTMLElement>('#creative-insight .creative-gap-layout');
  if (creative) creative.style.alignItems = 'center';
  const stp = documentRef.querySelector<HTMLElement>('#stp .stp-layout');
  if (stp) stp.style.alignItems = 'center';
  const choice = documentRef.querySelector<HTMLElement>('#strategy-choice .choice-final');
  if (choice) {
    choice.style.gridColumn = 'auto';
    choice.style.marginTop = '0';
  }
}

function promoteDecisionClose(documentRef: Document): void {
  const close = getSlide(documentRef, 'appendix-back');
  setMeta(close, {
    id: 'decision-close',
    chapter: 'V. STRATEGY > DECISION RECEIPT',
    title: '최종 선택을 브랜드 원칙과 실행 문장으로 고정한다',
    tag: 'DECISION RECEIPT',
  });
  close.classList.remove('appendix-slide');
  close.dataset.reportRole = 'decision-close';
}

function applyLabels(documentRef: Document): void {
  MAIN_IDS.forEach((id, index) => {
    const target = getSlide(documentRef, id);
    target.dataset.page = String(index + 1);
    target.dataset.zone = 'main';
    const page = target.querySelector<HTMLElement>('.full-page');
    if (page) page.textContent = String(index + 1).padStart(2, '0');
  });
}

function reorder(documentRef: Document): void {
  const content = documentRef.querySelector<HTMLElement>('.full-report-content');
  if (!content) throw new Error('Missing Phase 6 report content.');

  const frameFor = (id: string): HTMLElement => {
    const target = getSlide(documentRef, id);
    return target.closest<HTMLElement>('.full-frame') || target;
  };
  const mainFrames = MAIN_IDS.map(frameFor);

  Array.from(content.querySelectorAll<HTMLElement>(':scope > .full-frame')).forEach((frame) => frame.remove());
  const labels = Array.from(content.querySelectorAll<HTMLElement>(':scope > .full-report-section-label'));
  const mainLabel = labels[0] || documentRef.createElement('div');
  mainLabel.className = 'full-report-section-label';
  mainLabel.textContent = 'MAIN DECK · 40 PAGES';
  labels.forEach((label) => label.remove());

  const toolbar = content.querySelector<HTMLElement>('.full-report-toolbar');
  if (toolbar) toolbar.after(mainLabel);
  else content.prepend(mainLabel);
  mainLabel.after(...mainFrames);

  const toolbarText = content.querySelector<HTMLElement>('.full-report-toolbar > div:first-child span');
  if (toolbarText) toolbarText.textContent = '40 Main · Appendix 없음 · 16:9';
  const toolbarStats = content.querySelector<HTMLElement>('.full-report-toolbar > div:last-child');
  if (toolbarStats) {
    Array.from(toolbarStats.querySelectorAll<HTMLElement>('span')).forEach((node) => node.remove());
    const badge = documentRef.createElement('span');
    badge.textContent = 'Main 40/40';
    toolbarStats.prepend(badge);
  }
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
  if (documentRef.body.dataset.phase6PagePlan === PLAN_VERSION) {
    ensureJobDefinitionNotes(documentRef);
    return true;
  }
  const currentCount = documentRef.querySelectorAll('.full-slide').length;
  if (currentCount !== SOURCE_PAGE_COUNT) return false;

  restoreApprovedLabels(documentRef);
  promoteDecisionClose(documentRef);
  applyLabels(documentRef);
  reorder(documentRef);
  rebuildNav(documentRef);
  restoreApprovedVisuals(documentRef);
  ensureJobDefinitionNotes(documentRef);

  if (documentRef.querySelectorAll('.full-slide').length !== MAIN_COUNT) {
    throw new Error('Phase 6 Main Deck must contain exactly 40 slides after restoration.');
  }

  documentRef.body.dataset.phase6PagePlan = PLAN_VERSION;
  documentRef.body.dataset.reportPageCount = String(MAIN_COUNT);
  documentRef.body.dataset.reportAppendixCount = '0';
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
      console.error('[Phase 6 Page Plan V3]', error);
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
