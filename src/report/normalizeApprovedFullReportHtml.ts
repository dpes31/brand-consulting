const FULL_REPORT_PAGE_COUNT = 48;
const MAIN_DECK_PAGE_COUNT = 40;

export function normalizeApprovedFullReportHtml(source: string): string {
  if (typeof DOMParser === 'undefined') throw new Error('HTML 정규화기를 사용할 수 없습니다.');

  const documentRef = new DOMParser().parseFromString(source, 'text/html');
  const slides = Array.from(documentRef.querySelectorAll<HTMLElement>('.full-slide'));
  if (slides.length !== FULL_REPORT_PAGE_COUNT) {
    throw new Error(`승인 FULL 보고서는 정확히 ${FULL_REPORT_PAGE_COUNT}페이지여야 합니다. 현재 ${slides.length}페이지입니다.`);
  }

  slides.forEach((slide, index) => {
    slide.dataset.page = String(index + 1);
    slide.dataset.zone = index < MAIN_DECK_PAGE_COUNT ? 'main' : 'appendix';
  });

  documentRef.body.dataset.reportVersion = 'full-report-v1';
  documentRef.body.dataset.approvedPilot = 'full-integrated';
  documentRef.documentElement.lang = documentRef.documentElement.lang || 'ko';

  return `<!DOCTYPE html>\n${documentRef.documentElement.outerHTML}`;
}
