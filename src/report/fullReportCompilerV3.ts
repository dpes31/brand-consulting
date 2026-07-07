import {
  buildFullReportHtmlPrompt as buildLegacyPrompt,
  extractCompleteFullReportHtml,
} from './fullReportCompiler';

export { extractCompleteFullReportHtml };

const COUNT = 40;

export async function loadApprovedPilotBaseHtml(brandName: string): Promise<string> {
  const frame = document.createElement('iframe');
  frame.style.cssText = 'position:fixed;left:-20000px;top:0;width:1700px;height:1000px;border:0;opacity:0';
  const url = new URL(window.location.href);
  url.hash = '';
  url.search = '';
  url.searchParams.set('pilot', 'full-integrated');
  url.searchParams.set('brand', brandName);
  url.searchParams.set('phase6-base-capture', '1');
  frame.src = url.toString();
  document.body.appendChild(frame);
  try {
    await new Promise<void>((resolve) => frame.addEventListener('load', () => resolve(), { once: true }));
    const start = Date.now();
    while (Date.now() - start < 30000) {
      const doc = frame.contentDocument;
      if (doc?.documentElement.dataset.phase6PagePlanReady === 'true' && doc.querySelectorAll('.full-slide').length === COUNT) break;
      await new Promise((resolve) => window.setTimeout(resolve, 100));
    }
    const doc = frame.contentDocument;
    const root = doc?.getElementById('root');
    if (!doc || !root || doc.querySelectorAll('.full-slide').length !== COUNT) throw new Error('40-page Pilot unavailable');
    const css: string[] = [];
    Array.from(doc.styleSheets).forEach((sheet) => {
      try { css.push(Array.from(sheet.cssRules).map((rule) => rule.cssText).join('\n')); } catch { /* linked font */ }
    });
    const links = Array.from(doc.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')).map((link) => link.outerHTML).join('\n');
    return `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"><title>${brandName} Strategic Report</title>${links}<style>${css.join('\n')}</style></head><body data-report-version="full-report-v1" data-approved-pilot="full-integrated" data-phase6-page-plan="focus3-main40-no-appendix-v3"><div id="root">${root.innerHTML}</div></body></html>`;
  } finally {
    frame.remove();
  }
}

export function buildFullReportHtmlPrompt(raw: string, brand: string, html: string, creative = ''): string {
  return buildLegacyPrompt(raw, brand, html, creative)
    .replaceAll('48-page', '40-page')
    .replaceAll('48페이지', '40페이지')
    .replaceAll('40 Main Deck slides and 8 Appendix slides: 48', '40 Main Deck slides and 0 Appendix slides: 40')
    .replaceAll('five Deep Dives', 'three Deep Dives')
    .replaceAll('Deep Dive pages 12–16', 'Deep Dive pages 13–15')
    .replaceAll('Product Matrix page 17', 'Product Matrix page 16')
    .replaceAll('Positioning page 18', 'Positioning page 18')
    .replaceAll('Creative History pages 30–34', 'Creative History pages 30–32')
    .replaceAll('Message Trajectory page 35', 'Message Trajectory page 33')
    .replace('[APPROVED 48-PAGE CONTENT MAP]', '[APPROVED 40-PAGE CONTENT MAP]');
}

export function assertApprovedFullReportHtml(html: string, brand: string): void {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const slides = Array.from(doc.querySelectorAll<HTMLElement>('.full-slide'));
  if (slides.length !== COUNT) throw new Error('FULL report page count must be 40.');
  if (slides.some((slide, index) => slide.dataset.page !== String(index + 1) || slide.dataset.zone !== 'main')) throw new Error('FULL report order is invalid.');
  if (!doc.body.textContent?.includes(brand)) throw new Error('Brand name is missing.');
  if (doc.querySelector('#creative-method,[data-zone="appendix"]')) throw new Error('Removed pages remain.');
  for (const selector of ['#comp-landscape','#category-cliche','#creative-insight','#decision-close']) {
    if (!doc.querySelector(selector)) throw new Error(`Missing layout: ${selector}`);
  }
}
