const PAGE_COUNT = 40;

const PAGE_PLAN = [
  '01 Cover','02 핵심 진단','03 Brand Identity','04 Facts','05 Category & Target','06 Growth Story','07 Core Inflection','08 Product USP & Best Self','09 Market Context','10 Category Shift',
  '11 Competitive Landscape','12 Threat Ranking','13 Deep Dive 1','14 Deep Dive 2','15 Deep Dive 3','16 Product Matrix','17 Category Clichés','18 Positioning',
  '19 Consumer Executive Conclusion','20 Trends','21 Core Target','22 Persona 1','23 Persona 2','24 Persona 3','25 JTBD & Identity Alignment','26 Pain Points & Unmet Needs','27 AIPL Bottleneck','28 Purchase to Loyalty',
  '29 Target Brand Creative History','30 Competitor Creative History 1','31 Competitor Creative History 2','32 Competitor Creative History 3','33 Message Trajectory','34 Creative Insight',
  '35 SWOT','36 GAP & Root Cause','37 STP','38 Four Strategic Directions','39 Final Choice','40 Decision Receipt / Close',
];

function cleanResearch(raw: string): string {
  return raw.replace(/\[cite.*?\]|\\cite.*?|\[cite_start\]/g, '');
}

function links(documentRef: Document): string {
  return Array.from(documentRef.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')).map((link) => link.outerHTML).join('\n');
}

function css(documentRef: Document): string {
  const blocks: string[] = [];
  Array.from(documentRef.styleSheets).forEach((sheet) => {
    try { blocks.push(Array.from(sheet.cssRules || []).map((rule) => rule.cssText).join('\n')); } catch { /* external font */ }
  });
  return blocks.join('\n\n');
}

function approvedPilotReady(documentRef: Document | null): boolean {
  return Boolean(
    documentRef
    && documentRef.documentElement.dataset.phase6PagePlanReady === 'true'
    && documentRef.documentElement.dataset.fullReportV4Ready === 'true'
    && documentRef.querySelectorAll('.full-slide').length === PAGE_COUNT,
  );
}

export async function loadApprovedPilotBaseHtml(brandName: string): Promise<string> {
  const frame = document.createElement('iframe');
  frame.style.cssText = 'position:fixed;left:-20000px;top:0;width:1700px;height:1000px;border:0;opacity:0;pointer-events:none';
  const url = new URL(window.location.href);
  url.hash = '';
  url.search = '';
  url.searchParams.set('pilot', 'full-integrated');
  url.searchParams.set('brand', brandName);
  url.searchParams.set('phase6-base-capture', '1');
  frame.src = url.toString();
  document.body.appendChild(frame);
  try {
    await new Promise<void>((resolve, reject) => {
      const timer = window.setTimeout(() => reject(new Error('Pilot timeout')), 30000);
      frame.addEventListener('load', () => { window.clearTimeout(timer); resolve(); }, { once: true });
    });
    const start = Date.now();
    while (Date.now() - start < 30000) {
      if (approvedPilotReady(frame.contentDocument)) break;
      await new Promise((resolve) => window.setTimeout(resolve, 100));
    }
    const doc = frame.contentDocument;
    const root = doc?.getElementById('root');
    if (!doc || !root || !approvedPilotReady(doc)) {
      throw new Error('40-page Pilot or V4 visual runtime unavailable');
    }
    return `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${brandName} Strategic Report</title>${links(doc)}<style data-approved-pilot-css="true">${css(doc)}</style></head><body data-report-version="full-report-v1" data-approved-pilot="full-integrated" data-phase6-page-plan="focus3-main40-no-appendix-v3"><div id="root">${root.innerHTML}</div></body></html>`;
  } finally {
    frame.remove();
  }
}

export function buildFullReportHtmlPrompt(rawData: string, brandName: string, approvedBaseHtml: string, creativeDirective = ''): string {
  return `[REPORT COMPILER]\nBrand: ${brandName}\nOutput: one complete HTML document with exactly 40 Main Deck slides and no Appendix.\nKeep the supplied DOM, CSS, IDs, navigation, 1280x720 geometry and print rules.\nFill every content slot only from Step 0-5 research.\nUse decisive Korean declarative writing.\nPage 11 reviews up to five candidates. Page 12 selects the core three. Pages 13-18 and 30-33 use the same core three.\nDo not invent evidence, figures, dates, quotations, competitors, sources or axes.\n\n[PAGE PLAN]\n${PAGE_PLAN.join('\n')}\n\n[CREATIVE HISTORY]\n${creativeDirective}\n\n[IMMUTABLE APPROVED BASE HTML — START]\n${approvedBaseHtml}\n[IMMUTABLE APPROVED BASE HTML — END]\n\n[RAW STEP 0–5 RESEARCH]\n${cleanResearch(rawData)}\n`;
}

export function extractCompleteFullReportHtml(output: string): string {
  let value = output.trim();
  const fenced = value.match(/```html\s*([\s\S]*?)```/i) || value.match(/```\s*(<!doctype[\s\S]*?<\/html>)\s*```/i);
  if (fenced) value = fenced[1].trim();
  const start = value.search(/<!doctype\s+html/i);
  const matches = Array.from(value.matchAll(/<\/html\s*>/ig));
  const end = matches.length ? (matches.at(-1)?.index || 0) + (matches.at(-1)?.[0].length || 0) : -1;
  if (start < 0 || end <= start) throw new Error('Complete HTML not found');
  return value.slice(start, end).trim();
}

export function assertApprovedFullReportHtml(html: string, brandName: string): void {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const slides = Array.from(doc.querySelectorAll<HTMLElement>('.full-slide'));
  if (slides.length !== PAGE_COUNT) throw new Error(`Expected 40 pages, received ${slides.length}`);
  if (slides.some((slide, index) => slide.dataset.page !== String(index + 1) || slide.dataset.zone !== 'main')) throw new Error('Invalid page order or zone');
  if (new Set(slides.map((slide) => slide.id)).size !== PAGE_COUNT) throw new Error('Duplicate or missing slide id');
  for (const selector of ['#comp-landscape','#comp-ranking','#category-cliche','#creative-insight','#strategy-choice','#decision-close','.persona-layout','.stp-layout']) {
    if (!doc.querySelector(selector)) throw new Error(`Missing layout ${selector}`);
  }
  if (doc.querySelector('#creative-method,[data-zone="appendix"]')) throw new Error('Removed page remains');
  if (!doc.body.textContent?.includes(brandName)) throw new Error('Brand name missing');
  if (doc.querySelector('script')) throw new Error('Script is not allowed');
}

export const FULL_REPORT_PAGE_PLAN = PAGE_PLAN;
export const buildFullReportDataPrompt = buildFullReportHtmlPrompt;
export function extractProductionReportJson(): never { throw new Error('JSON report path retired'); }
export function normalizeProductionReport<T>(report: T): T { return report; }
export function assertProductionReport(): void { /* HTML path owns validation */ }
export async function loadFullReportTemplate(): Promise<string> { throw new Error('Template JSON path retired'); }
export function buildFullReportHtml(): never { throw new Error('Template JSON path retired'); }
export async function assembleFullReportHtml(): Promise<never> { throw new Error('Template JSON path retired'); }
