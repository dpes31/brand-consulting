const FULL_REPORT_PAGE_COUNT = 40;

export function normalizeApprovedFullReportHtml(source: string): string {
  if (typeof DOMParser === 'undefined') throw new Error('HTML 정규화기를 사용할 수 없다.');

  const documentRef = new DOMParser().parseFromString(source, 'text/html');
  const slides = Array.from(documentRef.querySelectorAll<HTMLElement>('.full-slide'));
  if (slides.length !== FULL_REPORT_PAGE_COUNT) {
    throw new Error(`승인 FULL 보고서는 정확히 ${FULL_REPORT_PAGE_COUNT}페이지여야 한다. 현재 ${slides.length}페이지다.`);
  }

  slides.forEach((slide, index) => {
    slide.dataset.page = String(index + 1);
    slide.dataset.zone = 'main';
  });

  documentRef.body.dataset.reportVersion = 'full-report-v1';
  documentRef.body.dataset.approvedPilot = 'full-integrated';
  documentRef.body.dataset.phase6PagePlan = 'focus3-main40-no-appendix-v3';
  documentRef.body.dataset.reportPageCount = String(FULL_REPORT_PAGE_COUNT);
  documentRef.body.dataset.reportAppendixCount = '0';
  documentRef.documentElement.lang = documentRef.documentElement.lang || 'ko';

  return `<!DOCTYPE html>\n${documentRef.documentElement.outerHTML}`;
}
