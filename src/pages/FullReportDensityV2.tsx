import { useEffect } from 'react';

type AuditResult = {
  slides: number;
  exact169: number;
  horizontalOverflow: string[];
  verticalOverflow: string[];
};

const SELECTOR_EXCEPTIONS = [
  '.full-source',
  '.full-breadcrumb',
  '.full-page',
  '.full-tag',
  '.history-status',
  '.history-now',
];

function syncBrandName(): void {
  const query = new URLSearchParams(window.location.search);
  const brandName = query.get('brand')?.trim() || '비즈넵';
  const navBrand = document.querySelector<HTMLElement>('.full-nav-brand');
  if (navBrand) {
    navBrand.innerHTML = `<b class="full-nav-brand-name"></b><span>FULL REPORT V2</span>`;
    const name = navBrand.querySelector<HTMLElement>('.full-nav-brand-name');
    if (name) name.textContent = brandName;
  }
  document.documentElement.style.setProperty('--report-brand-name', JSON.stringify(brandName));
}

function improveTerminology(): void {
  const consumerTableHeaders = document.querySelectorAll<HTMLTableCellElement>('#consumer-exec .jtbd-mini thead th');
  if (consumerTableHeaders[0]) consumerTableHeaders[0].textContent = '고객이 원하는 변화';
  if (consumerTableHeaders[1]) consumerTableHeaders[1].textContent = '제품을 통해 이루려는 진보';

  const executiveBody = document.querySelector<HTMLElement>('#consumer-exec .full-slide-body');
  if (executiveBody && !executiveBody.querySelector('.jtbd-note')) {
    const note = document.createElement('p');
    note.className = 'jtbd-note';
    note.textContent = 'JTBD(Job To Be Done): 고객이 제품이나 서비스를 통해 실제로 해결하고 싶은 과업과 원하는 변화를 뜻합니다.';
    executiveBody.appendChild(note);
  }

  const jtbdSlide = document.querySelector<HTMLElement>('#jtbd .full-slide-body');
  if (jtbdSlide && !jtbdSlide.querySelector('.jtbd-note')) {
    const note = document.createElement('p');
    note.className = 'jtbd-note';
    note.textContent = 'JTBD(Job To Be Done): 고객이 제품이나 서비스를 통해 실제로 해결하고 싶은 과업과 원하는 변화를 뜻합니다.';
    jtbdSlide.appendChild(note);
  }
}

function convertSwotToLight(): void {
  const slide = document.querySelector<HTMLElement>('#strategy-swot');
  if (!slide) return;
  slide.classList.remove('full-slide--dark');
  slide.classList.add('swot-light-v2');

  slide.querySelectorAll<HTMLElement>('.swot-point p').forEach((paragraph) => {
    paragraph.textContent = paragraph.textContent?.replace(/^\s*—\s*/, '') || '';
  });
}

function isVisible(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element);
  return style.display !== 'none' && style.visibility !== 'hidden' && element.getClientRects().length > 0;
}

function runAudit(): AuditResult {
  const slides = Array.from(document.querySelectorAll<HTMLElement>('.full-slide'));
  const horizontalOverflow: string[] = [];
  const verticalOverflow: string[] = [];
  let exact169 = 0;

  slides.forEach((slide) => {
    const id = slide.id || slide.dataset.page || 'unknown';
    if (slide.offsetWidth === 1280 && slide.offsetHeight === 720) exact169 += 1;

    const body = slide.querySelector<HTMLElement>('.full-slide-body');
    if (body) {
      if (body.scrollWidth > body.clientWidth + 3) horizontalOverflow.push(id);
      if (body.scrollHeight > body.clientHeight + 3) verticalOverflow.push(id);
    }

    slide.querySelectorAll<HTMLElement>('p, li, td, dd, blockquote, strong').forEach((node) => {
      if (!isVisible(node) || SELECTOR_EXCEPTIONS.some((selector) => node.matches(selector) || node.closest(selector))) return;
      const size = Number.parseFloat(window.getComputedStyle(node).fontSize);
      if (size < 12) node.classList.add('qa-font-floor-warning');
    });
  });

  return { slides: slides.length, exact169, horizontalOverflow, verticalOverflow };
}

function renderAuditBadge(result: AuditResult): void {
  const toolbar = document.querySelector<HTMLElement>('.full-report-toolbar > div:last-child');
  if (!toolbar) return;

  toolbar.querySelector('.runtime-qa-badge')?.remove();
  const badge = document.createElement('span');
  badge.className = 'runtime-qa-badge';
  const dimensionsPass = result.slides === 48 && result.exact169 === 48;
  const overflowPass = result.horizontalOverflow.length === 0 && result.verticalOverflow.length === 0;
  badge.classList.toggle('is-pass', dimensionsPass && overflowPass);
  badge.textContent = dimensionsPass && overflowPass
    ? 'QA 48/48 · 16:9 PASS'
    : `QA ${result.exact169}/${result.slides} · overflow ${result.horizontalOverflow.length + result.verticalOverflow.length}`;
  badge.title = JSON.stringify(result, null, 2);
  toolbar.prepend(badge);

  window.__BIZNUP_REPORT_QA__ = result;
}

declare global {
  interface Window {
    __BIZNUP_REPORT_QA__?: AuditResult;
  }
}

export default function FullReportDensityV2() {
  useEffect(() => {
    const apply = () => {
      syncBrandName();
      improveTerminology();
      convertSwotToLight();
      window.requestAnimationFrame(() => renderAuditBadge(runAudit()));
    };

    const timer = window.setTimeout(apply, 500);
    window.addEventListener('resize', apply);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('resize', apply);
    };
  }, []);

  return null;
}
