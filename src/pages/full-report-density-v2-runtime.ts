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
  swot?.querySelectorAll<HTMLElement>('.swot-point p').forEach((p) => {
    p.textContent = p.textContent?.replace(/^\s*—\s*/, '') || '';
  });

  const headers = document.querySelectorAll<HTMLTableCellElement>('#consumer-exec .jtbd-mini thead th');
  if (headers[0]) headers[0].textContent = '고객이 원하는 변화';
  if (headers[1]) headers[1].textContent = '제품을 통해 이루려는 진보';

  const addNote = (selector: string) => {
    const body = document.querySelector<HTMLElement>(selector);
    if (!body || body.querySelector('.jtbd-note')) return;
    const note = document.createElement('p');
    note.className = 'jtbd-note';
    note.textContent = 'JTBD(Job To Be Done): 고객이 제품이나 서비스를 통해 실제로 해결하고 싶은 과업과 원하는 변화를 뜻합니다.';
    body.appendChild(note);
  };
  addNote('#consumer-exec .full-slide-body');
  addNote('#jtbd .full-slide-body');

  const map = document.querySelector<HTMLElement>('#positioning .position-map');
  if (map && !map.querySelector('.positioning-arrow-v2')) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'positioning-arrow-v2');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.innerHTML = '<defs><marker id="posArrow" markerWidth="8" markerHeight="8" refX="6.5" refY="3.5" orient="auto"><path d="M0,0 L0,7 L7,3.5 z" fill="currentColor"/></marker></defs><line x1="38" y1="47" x2="79" y2="20" marker-end="url(#posArrow)"/>';
    map.appendChild(svg);
  }

  const slides = Array.from(document.querySelectorAll<HTMLElement>('.full-slide'));
  const exact = slides.filter((slide) => slide.offsetWidth === 1280 && slide.offsetHeight === 720).length;
  const overflow = slides.filter((slide) => {
    const body = slide.querySelector<HTMLElement>('.full-slide-body');
    return body ? body.scrollWidth > body.clientWidth + 3 || body.scrollHeight > body.clientHeight + 3 : false;
  }).length;
  const toolbar = document.querySelector<HTMLElement>('.full-report-toolbar > div:last-child');
  if (toolbar && !toolbar.querySelector('.runtime-qa-badge')) {
    const badge = document.createElement('span');
    badge.className = `runtime-qa-badge ${slides.length === 48 && exact === 48 && overflow === 0 ? 'is-pass' : ''}`;
    badge.textContent = slides.length === 48 && exact === 48 && overflow === 0 ? 'QA 48/48 · 16:9 PASS' : `QA ${exact}/${slides.length} · overflow ${overflow}`;
    toolbar.prepend(badge);
  }
}

window.addEventListener('DOMContentLoaded', () => window.setTimeout(applyFullReportV2, 700));
window.addEventListener('resize', applyFullReportV2);
