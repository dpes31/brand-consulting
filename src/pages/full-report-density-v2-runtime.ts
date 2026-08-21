const JTBD_NOTE = '*JTBD(Job To Be Done): 고객이 제품이나 서비스를 통해 달성하고자 하는 궁극의 목적(Job)';

function addHeaderNote(slideId: string): void {
  const slide = document.querySelector<HTMLElement>(slideId);
  const body = slide?.querySelector<HTMLElement>('.full-slide-body');
  if (!body || body.querySelector('.jtbd-header-note')) return;

  const note = document.createElement('div');
  note.className = 'jtbd-header-note';
  note.textContent = JTBD_NOTE;
  body.prepend(note);
}

function semanticInflectionMarkup(): string {
  const labelStyle = 'color:var(--full-muted);font-size:9px;font-weight:900;letter-spacing:.04em';
  return `
    <div class="inflection-reality">
      <span style="${labelStyle}">PRODUCT</span>
      <strong>환급 → 케어 → SeNa → 종합 세무관리</strong>
    </div>
    <div class="inflection-bridge">
      <div style="color:var(--full-muted);font-size:9px;font-weight:900;letter-spacing:.04em">BRAND GAP · 핵심 간극</div>
      <div style="margin-top:7px;color:var(--full-red);font-size:24px;font-weight:900">≠</div>
    </div>
    <div class="inflection-perception">
      <span style="${labelStyle}">PERCEPTION</span>
      <strong>사장님 세금 환급</strong>
    </div>
  `;
}

function normalizeKpiFlowArrows(): void {
  document.querySelectorAll<HTMLElement>('#kpi .kpi-logic > i[data-report-fixed="true"]').forEach((arrow) => {
    arrow.textContent = '→';
  });
}

function applyFullReportV2(): void {
  if (!new URLSearchParams(window.location.search).get('pilot')?.includes('full-integrated')) return;

  const brand = new URLSearchParams(window.location.search).get('brand')?.trim() || '비즈넵';
  const nav = document.querySelector<HTMLElement>('.full-nav-brand');
  if (nav) nav.innerHTML = `<b class="full-nav-brand-name">${brand}</b><span>FULL REPORT V2</span>`;

  const executive = document.querySelector<HTMLElement>('#executive');
  const executiveBreadcrumb = executive?.querySelector<HTMLElement>('.full-breadcrumb');
  const executiveTag = executive?.querySelector<HTMLElement>('.full-tag');
  if (executiveBreadcrumb) executiveBreadcrumb.textContent = '핵심 진단';
  if (executiveTag) executiveTag.textContent = '핵심 진단';
  executive?.querySelector<HTMLElement>('.report-map')?.remove();

  const swot = document.querySelector<HTMLElement>('#strategy-swot');
  swot?.classList.remove('full-slide--dark');
  swot?.classList.add('swot-light-v2');
  swot?.querySelectorAll<HTMLElement>('.swot-point p').forEach((paragraph) => {
    paragraph.textContent = paragraph.textContent?.replace(/^\s*—\s*/, '') || '';
  });

  document.querySelectorAll<HTMLElement>('.history-status').forEach((status) => {
    const value = status.textContent?.trim();
    if (value === 'VERIFIED-VERBATIM') status.textContent = '검증된 원문';
    if (value === 'SOURCE-FOUND-COPY-UNVERIFIED') status.textContent = '자료 확인 · 원문 미검증';
    if (value === 'NOT-FOUND') status.textContent = '공개 자료 미확인';
  });

  document.querySelectorAll<HTMLElement>('.jtbd-note').forEach((note) => note.remove());
  document.querySelectorAll<HTMLElement>('#comp-landscape .jtbd-header-note, #jtbd .jtbd-header-note').forEach((note) => note.remove());
  ['#consumer-exec', '#persona-1', '#persona-2', '#persona-3'].forEach(addHeaderNote);

  document.querySelector<HTMLElement>('#identity .founding-jtbd-note')?.remove();

  const headers = document.querySelectorAll<HTMLTableCellElement>('#consumer-exec .jtbd-mini thead th');
  if (headers[0]) headers[0].textContent = '고객이 원하는 변화';
  if (headers[1]) headers[1].textContent = '제품을 통해 이루려는 진보';

  const inflectionGap = document.querySelector<HTMLElement>('#inflection .inflection-gap');
  if (inflectionGap && !inflectionGap.classList.contains('is-structured-v3')) {
    inflectionGap.className = 'inflection-gap is-structured-v3';
    inflectionGap.innerHTML = semanticInflectionMarkup();
  }

  document.querySelector<HTMLElement>('#root-cause .root-cause-tree')?.classList.add('root-cause-flow-v3');
  document.querySelector<HTMLElement>('#stp .stp-layout')?.classList.add('stp-convergence-v3');
  document.querySelector<HTMLElement>('#strategy-choice .choice-layout')?.classList.add('choice-layout-v3');
  document.querySelector<HTMLElement>('#consumer-target .target-spectrum')?.classList.add('target-spectrum-v3');
  document.querySelectorAll<HTMLElement>('.persona-index').forEach((index) => index.classList.add('persona-index-v3'));
  document.querySelector<HTMLElement>('#creative-insight .creative-gap-layout')?.classList.add('creative-gap-v3');

  normalizeKpiFlowArrows();

  // P18 movement arrow is owned by the semantic compiler so that the vector
  // is always bound to the returned AS-IS / TO-BE coordinates. The older
  // fixed-position V2 overlay is intentionally retired to avoid duplicate
  // arrows and HTML/PDF drift.
  document.querySelector<HTMLElement>('#positioning .positioning-arrow-v2')?.remove();
}

window.addEventListener('DOMContentLoaded', () => window.setTimeout(applyFullReportV2, 350));
window.addEventListener('load', () => window.setTimeout(applyFullReportV2, 500));
window.addEventListener('resize', applyFullReportV2);
