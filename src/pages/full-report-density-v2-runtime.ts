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
  ['#comp-landscape', '#consumer-exec', '#persona-1', '#persona-2', '#persona-3', '#jtbd'].forEach(addHeaderNote);

  const foundingJtbd = document.querySelector<HTMLElement>('#identity .identity-jtbd');
  if (foundingJtbd && !foundingJtbd.querySelector('.founding-jtbd-note')) {
    const note = document.createElement('small');
    note.className = 'founding-jtbd-note';
    note.textContent = '사업자는 세법의 최종 책임을 부담하지만 공제·감면·신고 규칙을 파악하기 어렵고';
    foundingJtbd.appendChild(note);
  }

  const headers = document.querySelectorAll<HTMLTableCellElement>('#consumer-exec .jtbd-mini thead th');
  if (headers[0]) headers[0].textContent = '고객이 원하는 변화';
  if (headers[1]) headers[1].textContent = '제품을 통해 이루려는 진보';

  const inflectionGap = document.querySelector<HTMLElement>('#inflection .inflection-gap');
  if (inflectionGap && !inflectionGap.classList.contains('is-structured-v3')) {
    inflectionGap.classList.add('is-structured-v3');
    inflectionGap.innerHTML = `
      <div class="inflection-reality">
        <small>PRODUCT REALITY · 실제 제품 진화</small>
        <strong>환급 → 케어 → SeNa → 종합 세무관리</strong>
      </div>
      <div class="inflection-bridge">
        <small>BRAND GAP · 핵심 간극</small>
        <strong>제품은 확장됐지만<br />소비자 인식은 환급에 고정</strong>
        <i>→</i>
      </div>
      <div class="inflection-perception">
        <small>CURRENT PERCEPTION · 현재 인식</small>
        <strong>사장님 세금 환급</strong>
      </div>
    `;
  }

  document.querySelector<HTMLElement>('#root-cause .root-cause-tree')?.classList.add('root-cause-flow-v3');
  document.querySelector<HTMLElement>('#stp .stp-layout')?.classList.add('stp-convergence-v3');
  document.querySelector<HTMLElement>('#strategy-choice .choice-layout')?.classList.add('choice-layout-v3');
  document.querySelector<HTMLElement>('#consumer-target .target-spectrum')?.classList.add('target-spectrum-v3');
  document.querySelectorAll<HTMLElement>('.persona-index').forEach((index) => index.classList.add('persona-index-v3'));
  document.querySelector<HTMLElement>('#creative-insight .creative-gap-layout')?.classList.add('creative-gap-v3');

  const map = document.querySelector<HTMLElement>('#positioning .position-map');
  if (map && !map.querySelector('.positioning-arrow-v2')) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'positioning-arrow-v2');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.innerHTML = '<defs><marker id="posArrow" markerWidth="8" markerHeight="8" refX="6.5" refY="3.5" orient="auto"><path d="M0,0 L0,7 L7,3.5 z" fill="currentColor"/></marker></defs><line x1="38" y1="47" x2="79" y2="20" marker-end="url(#posArrow)"/>';
    map.appendChild(svg);
  }
}

window.addEventListener('DOMContentLoaded', () => window.setTimeout(applyFullReportV2, 350));
window.addEventListener('load', () => window.setTimeout(applyFullReportV2, 500));
window.addEventListener('resize', applyFullReportV2);
