import { exportReportPdf } from './exportReportPdf';

const FULL_REPORT_SELECTOR = '.full-slide:not([data-full-report-export-clone="true"])';
const FULL_REPORT_PAGE_COUNT = 48;
const MAIN_DECK_PAGE_COUNT = 40;
const SLIDE_WIDTH_PX = 1280;
const SLIDE_HEIGHT_PX = 720;
const FRAME_MARKER = 'fullReportRuntimeV1';

export interface FullReportPreflightResult {
  ok: boolean;
  slideCount: number;
  issues: string[];
  overflowSlideIds: string[];
}

type FullReportWindow = Window & {
  __REPORT_PREFLIGHT__?: () => FullReportPreflightResult;
  __FULL_REPORT_NATIVE_PRINT__?: () => void;
  __FULL_REPORT_RUNTIME__?: {
    version: '1.0.0';
    preflight: () => FullReportPreflightResult;
    exportPdf: () => Promise<void>;
  };
};

let installed = false;

function isFullReportDocument(documentRef: Document): boolean {
  return documentRef.body?.dataset.reportVersion === 'full-report-v1'
    || Boolean(documentRef.querySelector(FULL_REPORT_SELECTOR));
}

function getFullReportSlides(documentRef: Document): HTMLElement[] {
  return Array.from(documentRef.querySelectorAll<HTMLElement>(FULL_REPORT_SELECTOR));
}

function slideBodyOverflows(slide: HTMLElement): boolean {
  const body = slide.querySelector<HTMLElement>('.full-slide-body');
  if (!body) return false;
  return body.scrollHeight > body.clientHeight + 2 || body.scrollWidth > body.clientWidth + 2;
}

export function runFullReportPreflight(documentRef: Document): FullReportPreflightResult {
  const slides = getFullReportSlides(documentRef);
  const issues: string[] = [];
  const overflowSlideIds: string[] = [];
  const ids = new Set<string>();
  const pages = new Set<number>();

  if (slides.length !== FULL_REPORT_PAGE_COUNT) {
    issues.push(`FULL 보고서는 정확히 ${FULL_REPORT_PAGE_COUNT}페이지여야 합니다. 현재 ${slides.length}페이지입니다.`);
  }

  slides.forEach((slide, index) => {
    delete slide.dataset.layoutOverflow;
    const expectedPage = index + 1;
    const page = Number(slide.dataset.page);
    const expectedZone = index < MAIN_DECK_PAGE_COUNT ? 'main' : 'appendix';

    if (!slide.id) issues.push(`페이지 ${expectedPage}의 ID가 없습니다.`);
    else if (ids.has(slide.id)) issues.push(`중복 슬라이드 ID: ${slide.id}`);
    else ids.add(slide.id);

    if (!Number.isInteger(page)) issues.push(`페이지 ${expectedPage}의 data-page가 올바르지 않습니다.`);
    else {
      if (pages.has(page)) issues.push(`중복 페이지 번호: ${page}`);
      pages.add(page);
      if (page !== expectedPage) issues.push(`페이지 순서 오류: 위치 ${expectedPage}에 data-page=${page}가 있습니다.`);
    }

    if (slide.dataset.zone !== expectedZone) {
      issues.push(`페이지 ${expectedPage}의 zone은 ${expectedZone}이어야 합니다.`);
    }

    if (slide.offsetWidth > 0 && Math.abs(slide.offsetWidth - SLIDE_WIDTH_PX) > 1) {
      issues.push(`페이지 ${expectedPage}의 너비가 ${slide.offsetWidth}px입니다. ${SLIDE_WIDTH_PX}px이어야 합니다.`);
    }
    if (slide.offsetHeight > 0 && Math.abs(slide.offsetHeight - SLIDE_HEIGHT_PX) > 1) {
      issues.push(`페이지 ${expectedPage}의 높이가 ${slide.offsetHeight}px입니다. ${SLIDE_HEIGHT_PX}px이어야 합니다.`);
    }

    if (slideBodyOverflows(slide)) {
      slide.dataset.layoutOverflow = 'true';
      overflowSlideIds.push(slide.id || `page-${expectedPage}`);
    }
  });

  if (overflowSlideIds.length > 0) issues.push(`콘텐츠 오버플로: ${overflowSlideIds.join(', ')}`);
  if (/\{\{[A-Z0-9_]+\}\}/.test(documentRef.body?.textContent ?? '')) {
    issues.push('치환되지 않은 {{PLACEHOLDER}}가 남아 있습니다.');
  }

  const result = {
    ok: issues.length === 0,
    slideCount: slides.length,
    issues,
    overflowSlideIds,
  };
  documentRef.documentElement.dataset.fullReportPreflight = result.ok ? 'passed' : 'failed';
  documentRef.documentElement.dataset.fullReportPageCount = String(slides.length);
  return result;
}

function copyComputedBoxStyles(source: HTMLElement, target: HTMLElement, windowRef: Window): void {
  const style = windowRef.getComputedStyle(source);
  [
    'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
    'background-color', 'background-image', 'color', 'border-radius',
  ].forEach((property) => target.style.setProperty(property, style.getPropertyValue(property), 'important'));
  target.style.setProperty('width', `${SLIDE_WIDTH_PX}px`, 'important');
  target.style.setProperty('height', `${SLIDE_HEIGHT_PX}px`, 'important');
  target.style.setProperty('min-width', `${SLIDE_WIDTH_PX}px`, 'important');
  target.style.setProperty('min-height', `${SLIDE_HEIGHT_PX}px`, 'important');
  target.style.setProperty('margin', '0', 'important');
  target.style.setProperty('transform', 'none', 'important');
  target.style.setProperty('box-shadow', 'none', 'important');
  target.style.setProperty('overflow', 'hidden', 'important');
}

function installTemporaryLegacyExportAdapters(
  documentRef: Document,
  windowRef: Window,
): HTMLElement[] {
  const slides = getFullReportSlides(documentRef);
  return slides.map((slide, index) => {
    const wrapper = documentRef.createElement('div');
    wrapper.className = 'slide-wrapper full-report-export-adapter';
    wrapper.dataset.fullReportExportAdapter = 'true';
    wrapper.style.setProperty('position', 'fixed', 'important');
    wrapper.style.setProperty('left', '-30000px', 'important');
    wrapper.style.setProperty('top', '0', 'important');
    wrapper.style.setProperty('width', `${SLIDE_WIDTH_PX}px`, 'important');
    wrapper.style.setProperty('height', `${SLIDE_HEIGHT_PX}px`, 'important');
    wrapper.style.setProperty('overflow', 'hidden', 'important');
    wrapper.style.setProperty('pointer-events', 'none', 'important');
    wrapper.style.setProperty('z-index', '-2147483647', 'important');

    const clone = slide.cloneNode(true) as HTMLElement;
    clone.id = `${slide.id || `page-${index + 1}`}-pdf-clone`;
    clone.classList.add('slide');
    clone.dataset.fullReportExportClone = 'true';
    delete clone.dataset.layoutOverflow;
    copyComputedBoxStyles(slide, clone, windowRef);
    clone.querySelectorAll<HTMLImageElement>('img').forEach((image) => {
      image.crossOrigin = 'anonymous';
      image.referrerPolicy = 'no-referrer';
    });

    wrapper.appendChild(clone);
    documentRef.body.appendChild(wrapper);
    return wrapper;
  });
}

export async function exportFullReportPdf(
  iframe: HTMLIFrameElement,
  filename?: string,
): Promise<void> {
  const documentRef = iframe.contentDocument;
  const windowRef = iframe.contentWindow;
  if (!documentRef || !windowRef) throw new Error('FULL 보고서 iframe에 접근할 수 없습니다.');

  const preflight = runFullReportPreflight(documentRef);
  if (!preflight.ok) throw new Error(`FULL PDF 사전검사 실패\n${preflight.issues.join('\n')}`);

  const adapters = installTemporaryLegacyExportAdapters(documentRef, windowRef);
  try {
    await exportReportPdf(iframe, filename || documentRef.title || 'Brand Consulting FULL Report');
    documentRef.documentElement.dataset.lastPdfPageCount = String(FULL_REPORT_PAGE_COUNT);
    documentRef.documentElement.dataset.lastPdfExportAt = new Date().toISOString();
  } finally {
    adapters.forEach((adapter) => adapter.remove());
  }
}

async function exportWithAlert(iframe: HTMLIFrameElement): Promise<void> {
  try {
    await exportFullReportPdf(iframe, iframe.contentDocument?.title);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    window.alert(`FULL PDF 생성 오류\n\n${message}`);
  }
}

function installIntoFrame(iframe: HTMLIFrameElement): void {
  const documentRef = iframe.contentDocument;
  const windowRef = iframe.contentWindow as FullReportWindow | null;
  if (!documentRef?.documentElement || !windowRef || !isFullReportDocument(documentRef)) return;

  const activate = () => {
    if (getFullReportSlides(documentRef).length === 0) return false;
    windowRef.__REPORT_PREFLIGHT__ = () => runFullReportPreflight(documentRef);
    if (documentRef.documentElement.dataset[FRAME_MARKER] === 'installed') return true;

    documentRef.documentElement.dataset[FRAME_MARKER] = 'installed';
    if (!windowRef.__FULL_REPORT_NATIVE_PRINT__) windowRef.__FULL_REPORT_NATIVE_PRINT__ = windowRef.print.bind(windowRef);
    windowRef.__FULL_REPORT_RUNTIME__ = {
      version: '1.0.0',
      preflight: () => runFullReportPreflight(documentRef),
      exportPdf: () => exportFullReportPdf(iframe, documentRef.title),
    };
    windowRef.print = () => { void exportWithAlert(iframe); };
    windowRef.addEventListener('keydown', (event) => {
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 'p') return;
      event.preventDefault();
      event.stopImmediatePropagation();
      void exportWithAlert(iframe);
    }, true);

    const result = runFullReportPreflight(documentRef);
    if (!result.ok) console.warn('[FULL Report Runtime] Preflight issues', result);
    else console.info('[FULL Report Runtime] 48 pages passed preflight.');
    return true;
  };

  if (activate()) return;
  const observer = new MutationObserver(() => {
    if (activate()) observer.disconnect();
  });
  observer.observe(documentRef.documentElement, { childList: true, subtree: true });
}

export function installFullReportRuntimeCompatibility(): () => void {
  if (installed || typeof document === 'undefined') return () => undefined;
  installed = true;
  const attachedFrames = new WeakSet<HTMLIFrameElement>();
  const attach = (iframe: HTMLIFrameElement) => {
    if (attachedFrames.has(iframe)) return;
    attachedFrames.add(iframe);
    const apply = () => installIntoFrame(iframe);
    iframe.addEventListener('load', apply);
    if (iframe.contentDocument?.readyState === 'complete') window.setTimeout(apply, 0);
  };
  const scan = (root: ParentNode = document) => root.querySelectorAll<HTMLIFrameElement>('iframe').forEach(attach);
  scan();
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => mutation.addedNodes.forEach((node) => {
      if (!(node instanceof HTMLElement)) return;
      if (node instanceof HTMLIFrameElement) attach(node);
      scan(node);
    }));
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  return () => {
    observer.disconnect();
    installed = false;
  };
}
