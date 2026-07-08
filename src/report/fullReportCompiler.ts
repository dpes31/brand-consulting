import {
  assertReportSkeleton,
  canonicalizeReportDocument,
  extractCompleteHtmlDocument,
  parseReportHtml,
} from './reportDomSafety';

const PAGE_COUNT = 40;

const PAGE_PLAN = [
  '01 Cover','02 핵심 진단','03 Brand Identity','04 Facts','05 Category & Target','06 Growth Story','07 Core Inflection','08 Product USP & Best Self','09 Market Context','10 Category Shift',
  '11 Competitive Landscape','12 Threat Ranking','13 Deep Dive 1','14 Deep Dive 2','15 Deep Dive 3','16 Product Matrix','17 Category Clichés','18 Positioning',
  '19 Consumer Executive Conclusion','20 Trends','21 Core Target','22 Persona 1','23 Persona 2','24 Persona 3','25 JTBD & Identity Alignment','26 Pain Points & Unmet Needs','27 AIPL Bottleneck','28 Purchase to Loyalty',
  '29 Target Brand Creative History','30 Competitor Creative History 1','31 Competitor Creative History 2','32 Competitor Creative History 3','33 Message Trajectory','34 Creative Insight',
  '35 SWOT','36 GAP & Root Cause','37 STP','38 Four Strategic Directions','39 Final Choice','40 Decision Receipt / Close',
];

function links(documentRef: Document): string {
  return Array.from(documentRef.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'))
    .map((link) => link.outerHTML)
    .join('\n');
}

function css(documentRef: Document): string {
  const blocks: string[] = [];
  Array.from(documentRef.styleSheets).forEach((sheet) => {
    try {
      blocks.push(Array.from(sheet.cssRules || []).map((rule) => rule.cssText).join('\n'));
    } catch {
      // Cross-origin font resources stay linked.
    }
  });
  return blocks.join('\n\n');
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
      const timer = window.setTimeout(() => reject(new Error('승인 Pilot 로딩 시간이 초과됐다.')), 30000);
      frame.addEventListener('load', () => {
        window.clearTimeout(timer);
        resolve();
      }, { once: true });
    });

    const started = Date.now();
    while (Date.now() - started < 30000) {
      const documentRef = frame.contentDocument;
      if (
        documentRef?.documentElement.dataset.phase6PagePlanReady === 'true'
        && documentRef.querySelectorAll('.full-slide').length === PAGE_COUNT
      ) break;
      await new Promise((resolve) => window.setTimeout(resolve, 100));
    }

    const documentRef = frame.contentDocument;
    const root = documentRef?.getElementById('root');
    if (!documentRef || !root || documentRef.querySelectorAll('.full-slide').length !== PAGE_COUNT) {
      throw new Error('승인 Pilot 40페이지를 확인하지 못했다.');
    }

    // The hidden Pilot may be visually scaled to the viewport. The stored
    // production shell must never inherit that responsive scale.
    canonicalizeReportDocument(documentRef, brandName);
    assertReportSkeleton(documentRef);

    return `<!DOCTYPE html>\n<html lang="ko"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${brandName} Strategic Report</title>${links(documentRef)}<style data-approved-pilot-css="true">${css(documentRef)}</style></head><body data-report-version="full-report-v1" data-approved-pilot="full-integrated" data-content-contract="structured-report-v3-template" data-content-state="template" data-phase6-page-plan="focus3-main40-no-appendix-v3" data-report-page-count="40" data-report-appendix-count="0"><div id="root">${root.innerHTML}</div></body></html>`;
  } finally {
    frame.remove();
  }
}

/**
 * Complete-HTML generation is retired as the primary Phase 6 contract.
 * Kept only to fail loudly when stale callers remain.
 */
export function buildFullReportHtmlPrompt(): never {
  throw new Error('Complete HTML generation is retired. Use ProductionReportV3 structured JSON.');
}

export function extractCompleteFullReportHtml(output: string): string {
  return extractCompleteHtmlDocument(output);
}

export function assertApprovedFullReportHtml(html: string, brandName: string): void {
  const documentRef = parseReportHtml(html);
  assertReportSkeleton(documentRef);
  if (!documentRef.body.textContent?.includes(brandName)) throw new Error(`브랜드명 ${brandName}이 보고서에 없다.`);
  if (documentRef.querySelector('script,noscript')) throw new Error('Script is not allowed');
}

export const FULL_REPORT_PAGE_PLAN = PAGE_PLAN;
export function buildFullReportDataPrompt(): never { throw new Error('Use buildStructuredReportPrompt.'); }
export function extractProductionReportJson(): never { throw new Error('Use extractStructuredReportJson.'); }
export function normalizeProductionReport<T>(report: T): T { return report; }
export function assertProductionReport(): void { /* StructuredReportV3 owns validation. */ }
export async function loadFullReportTemplate(): Promise<string> { throw new Error('Use loadApprovedPilotBaseHtml.'); }
export function buildFullReportHtml(): never { throw new Error('Use renderStructuredReportV3.'); }
export async function assembleFullReportHtml(): Promise<never> { throw new Error('Use renderStructuredReportV3.'); }
