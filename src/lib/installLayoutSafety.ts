import { exportReportPdf } from './exportReportPdf';

const LOGICAL_SLIDE_WIDTH = 1280;
const LOGICAL_SLIDE_HEIGHT = 720;
const MIN_REQUIRED_SLIDES = 23;

const REQUIRED_SLIDE_IDS = [
  'wrap-cover',
  'wrap-slide-f01',
  'wrap-slide-f02',
  'wrap-slide-f03',
  ...Array.from({ length: 18 }, (_, index) => `wrap-slide-${String(index + 1).padStart(2, '0')}`),
  'wrap-back-cover',
] as const;

const STYLE_ID = 'layout-safety-v1-style';
const FRAME_MARKER = 'layoutSafetyV1';

type FrameWindow = Window & {
  __REPORT_PREFLIGHT__?: () => LayoutPreflightResult;
  __NATIVE_REPORT_PRINT__?: () => void;
};

export interface LayoutPreflightResult {
  ok: boolean;
  slideCount: number;
  issues: string[];
  overflowSlideIds: string[];
}

const LAYOUT_SAFETY_CSS = `
:root {
  --slide-w: ${LOGICAL_SLIDE_WIDTH}px !important;
  --slide-h: ${LOGICAL_SLIDE_HEIGHT}px !important;
}

html,
body {
  overflow-x: hidden !important;
}

.slide-wrapper {
  position: relative !important;
  flex-shrink: 0 !important;
  transform: none !important;
  transform-origin: top left !important;
  overflow: hidden !important;
}

.slide-wrapper > .slide {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  width: ${LOGICAL_SLIDE_WIDTH}px !important;
  height: ${LOGICAL_SLIDE_HEIGHT}px !important;
  min-width: ${LOGICAL_SLIDE_WIDTH}px !important;
  min-height: ${LOGICAL_SLIDE_HEIGHT}px !important;
  transform-origin: top left !important;
  overflow: hidden !important;
}

.slide {
  padding: 28px 44px 66px !important;
}

.slide.slide-full {
  padding-bottom: 24px !important;
}

.slide-header {
  margin-bottom: 16px !important;
  padding-bottom: 10px !important;
}

.slide-body {
  min-height: 0 !important;
  padding-bottom: 3px !important;
  transform-origin: top left !important;
}

.grid-2,
.grid-3 {
  align-items: stretch !important;
  grid-auto-rows: minmax(0, 1fr) !important;
}

.grid-2 > .box,
.grid-3 > .box {
  height: 100% !important;
  min-height: 0 !important;
}

.box-content {
  min-height: 0 !important;
}

.implication-bar {
  left: 44px !important;
  right: 44px !important;
  bottom: 16px !important;
}

.slide.layout-density-1 {
  padding: 23px 38px 58px !important;
}

.slide.layout-density-1 .slide-header {
  margin-bottom: 12px !important;
  padding-bottom: 8px !important;
}

.slide.layout-density-1 .title {
  font-size: 27px !important;
}

.slide.layout-density-1 .governing-msg {
  padding: 11px 16px !important;
  margin-bottom: 12px !important;
  font-size: 13px !important;
  line-height: 1.4 !important;
}

.slide.layout-density-1 .box,
.slide.layout-density-1 .box.compact-box,
.slide.layout-density-1 .box.tight-box {
  padding: 12px 15px !important;
}

.slide.layout-density-1 .box-title {
  margin-bottom: 8px !important;
  padding-bottom: 7px !important;
}

.slide.layout-density-1 .grid-2,
.slide.layout-density-1 .grid-3 {
  gap: 12px !important;
}

.slide.layout-density-1 dl dt {
  margin-top: 7px !important;
}

.slide.layout-density-1 dl dd {
  margin-bottom: 3px !important;
  line-height: 1.38 !important;
}

.slide.layout-density-2 {
  padding: 18px 34px 50px !important;
}

.slide.layout-density-2 .slide-header {
  margin-bottom: 8px !important;
  padding-bottom: 6px !important;
}

.slide.layout-density-2 .title {
  font-size: 23px !important;
}

.slide.layout-density-2 .breadcrumb {
  font-size: 8px !important;
}

.slide.layout-density-2 .governing-msg {
  padding: 8px 12px !important;
  margin-bottom: 8px !important;
  font-size: 11px !important;
  line-height: 1.34 !important;
}

.slide.layout-density-2 .box,
.slide.layout-density-2 .box.compact-box,
.slide.layout-density-2 .box.tight-box {
  padding: 9px 12px !important;
}

.slide.layout-density-2 .box-title {
  margin-bottom: 5px !important;
  padding-bottom: 5px !important;
  font-size: 12px !important;
}

.slide.layout-density-2 .grid-2,
.slide.layout-density-2 .grid-3 {
  gap: 8px !important;
}

.slide.layout-density-2 dl dt {
  margin-top: 4px !important;
  font-size: 10px !important;
}

.slide.layout-density-2 dl dd {
  margin-bottom: 1px !important;
  font-size: 9px !important;
  line-height: 1.28 !important;
}

.slide[data-layout-overflow='true'] {
  outline: 3px solid #ef4444 !important;
  outline-offset: -3px !important;
}

@page {
  size: 960pt 540pt;
  margin: 0;
}

@media print {
  html,
  body,
  main#content {
    width: 960pt !important;
    min-width: 960pt !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow: visible !important;
    background: #fff !important;
  }

  nav,
  .print-guide {
    display: none !important;
  }

  .slide-wrapper {
    width: 960pt !important;
    height: 540pt !important;
    min-width: 960pt !important;
    min-height: 540pt !important;
    margin: 0 !important;
    overflow: hidden !important;
    break-after: page !important;
    page-break-after: always !important;
  }

  .slide-wrapper:last-of-type {
    break-after: auto !important;
    page-break-after: auto !important;
  }

  .slide-wrapper > .slide {
    position: relative !important;
    width: 960pt !important;
    height: 540pt !important;
    min-width: 960pt !important;
    min-height: 540pt !important;
    transform: none !important;
    border: 0 !important;
    border-radius: 0 !important;
    box-shadow: none !important;
  }

  .slide[data-layout-overflow='true'] {
    outline: none !important;
  }
}
`;

function getMainContent(documentRef: Document): HTMLElement | null {
  return documentRef.querySelector<HTMLElement>('main#content') ?? documentRef.body;
}

function flattenSlideWrappers(documentRef: Document): void {
  const main = getMainContent(documentRef);
  if (!main) return;

  const wrappers = Array.from(documentRef.querySelectorAll<HTMLElement>('.slide-wrapper'));
  if (wrappers.length === 0) return;

  const sentinel = documentRef.createComment('layout-safety-slide-sentinel');
  main.appendChild(sentinel);
  wrappers.forEach((wrapper) => main.insertBefore(wrapper, sentinel));
  sentinel.remove();
}

function injectSafetyStyle(documentRef: Document): void {
  if (!documentRef.head || documentRef.getElementById(STYLE_ID)) return;
  const style = documentRef.createElement('style');
  style.id = STYLE_ID;
  style.textContent = LAYOUT_SAFETY_CSS;
  documentRef.head.appendChild(style);
}

function parsePixel(value: string): number {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function resetBodyFit(slide: HTMLElement): void {
  const body = slide.querySelector<HTMLElement>('.slide-body');
  if (!body) return;
  body.style.removeProperty('transform');
  body.style.removeProperty('width');
  body.style.removeProperty('height');
  body.removeAttribute('data-body-fit-scale');
}

function descendantExceedsSlide(slide: HTMLElement): boolean {
  const slideRect = slide.getBoundingClientRect();
  if (slideRect.width < 1 || slideRect.height < 1) return false;

  const style = slide.ownerDocument.defaultView?.getComputedStyle(slide);
  const paddingRight = style ? parsePixel(style.paddingRight) : 0;
  const paddingBottom = style ? parsePixel(style.paddingBottom) : 0;
  const rightLimit = slideRect.right - Math.max(2, paddingRight * (slideRect.width / slide.offsetWidth) * 0.15);
  const bottomLimit = slideRect.bottom - Math.max(2, paddingBottom * (slideRect.height / slide.offsetHeight) * 0.12);

  const descendants = Array.from(slide.querySelectorAll<HTMLElement>('*'));
  return descendants.some((element) => {
    const elementStyle = element.ownerDocument.defaultView?.getComputedStyle(element);
    if (!elementStyle || elementStyle.display === 'none' || elementStyle.visibility === 'hidden') return false;
    if (element.tagName === 'SCRIPT' || element.tagName === 'STYLE') return false;

    const rect = element.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return false;
    return rect.right > rightLimit + 2 || rect.bottom > bottomLimit + 2;
  });
}

function elementHasScrollOverflow(element: HTMLElement): boolean {
  return element.scrollHeight > element.clientHeight + 2 || element.scrollWidth > element.clientWidth + 2;
}

function slideOverflows(slide: HTMLElement): boolean {
  const scrollCandidates = [
    slide,
    ...Array.from(slide.querySelectorAll<HTMLElement>('.slide-body, .box, .box-content, .timeline-container, .pos-map, table')),
  ];

  return scrollCandidates.some(elementHasScrollOverflow) || descendantExceedsSlide(slide);
}

function scaleSlideBodyToFit(slide: HTMLElement): void {
  const body = slide.querySelector<HTMLElement>('.slide-body');
  if (!body) return;

  resetBodyFit(slide);
  void slide.offsetHeight;

  const slideRect = slide.getBoundingClientRect();
  const bodyRect = body.getBoundingClientRect();
  const scaleY = slideRect.height / Math.max(1, slide.offsetHeight);
  const scaleX = slideRect.width / Math.max(1, slide.offsetWidth);

  const slideStyle = slide.ownerDocument.defaultView?.getComputedStyle(slide);
  const bottomPadding = slideStyle ? parsePixel(slideStyle.paddingBottom) * scaleY : 0;
  const rightPadding = slideStyle ? parsePixel(slideStyle.paddingRight) * scaleX : 0;
  const availableHeight = Math.max(1, slideRect.bottom - bottomPadding - bodyRect.top);
  const availableWidth = Math.max(1, slideRect.right - rightPadding - bodyRect.left);

  let contentBottom = bodyRect.top;
  let contentRight = bodyRect.left;
  Array.from(body.querySelectorAll<HTMLElement>('*')).forEach((element) => {
    const style = element.ownerDocument.defaultView?.getComputedStyle(element);
    if (!style || style.display === 'none' || style.visibility === 'hidden') return;
    const rect = element.getBoundingClientRect();
    contentBottom = Math.max(contentBottom, rect.bottom);
    contentRight = Math.max(contentRight, rect.right);
  });

  const visualHeight = Math.max(body.scrollHeight * scaleY, contentBottom - bodyRect.top);
  const visualWidth = Math.max(body.scrollWidth * scaleX, contentRight - bodyRect.left);
  const requiredScale = Math.min(1, availableHeight / Math.max(1, visualHeight), availableWidth / Math.max(1, visualWidth));
  const fitScale = Math.max(0.72, Math.min(0.99, requiredScale * 0.985));

  if (fitScale < 0.995) {
    body.style.transform = `scale(${fitScale})`;
    body.style.transformOrigin = 'top left';
    body.style.width = `${100 / fitScale}%`;
    body.style.height = `${100 / fitScale}%`;
    body.dataset.bodyFitScale = fitScale.toFixed(4);
  }
}

function fitSlides(documentRef: Document): void {
  const slides = Array.from(documentRef.querySelectorAll<HTMLElement>('.slide-wrapper > .slide'));

  slides.forEach((slide) => {
    slide.classList.remove('layout-density-1', 'layout-density-2');
    delete slide.dataset.layoutOverflow;
    resetBodyFit(slide);

    void slide.offsetHeight;
    if (!slideOverflows(slide)) return;

    slide.classList.add('layout-density-1');
    void slide.offsetHeight;
    if (!slideOverflows(slide)) return;

    slide.classList.remove('layout-density-1');
    slide.classList.add('layout-density-2');
    void slide.offsetHeight;
    if (!slideOverflows(slide)) return;

    scaleSlideBodyToFit(slide);
    void slide.offsetHeight;
    if (slideOverflows(slide)) slide.dataset.layoutOverflow = 'true';
  });
}

function resizeWebCanvas(documentRef: Document, windowRef: Window): void {
  if (windowRef.matchMedia('print').matches) return;

  const main = getMainContent(documentRef);
  if (!main) return;

  const mainStyle = windowRef.getComputedStyle(main);
  const availableWidth = Math.max(
    320,
    main.clientWidth - parsePixel(mainStyle.paddingLeft) - parsePixel(mainStyle.paddingRight) - 2,
  );
  const scale = Math.min(1, availableWidth / LOGICAL_SLIDE_WIDTH);

  const wrappers = Array.from(documentRef.querySelectorAll<HTMLElement>('.slide-wrapper'));
  wrappers.forEach((wrapper) => {
    wrapper.style.width = `${LOGICAL_SLIDE_WIDTH * scale}px`;
    wrapper.style.height = `${LOGICAL_SLIDE_HEIGHT * scale}px`;
    wrapper.style.marginBottom = `${Math.max(16, 32 * scale)}px`;

    const slide = wrapper.querySelector<HTMLElement>(':scope > .slide');
    if (slide) slide.style.transform = `scale(${scale})`;
  });
}

function runPreflight(documentRef: Document): LayoutPreflightResult {
  fitSlides(documentRef);

  const wrappers = Array.from(documentRef.querySelectorAll<HTMLElement>('.slide-wrapper'));
  const issues: string[] = [];

  if (wrappers.length < MIN_REQUIRED_SLIDES) {
    issues.push(`기본 슬라이드가 ${wrappers.length}장입니다. 최소 ${MIN_REQUIRED_SLIDES}장이 필요합니다.`);
  }

  const missingIds = REQUIRED_SLIDE_IDS.filter((id) => !documentRef.getElementById(id));
  if (missingIds.length > 0) issues.push(`필수 슬라이드 누락: ${missingIds.join(', ')}`);

  const main = getMainContent(documentRef);
  const nestedWrappers = wrappers.filter((wrapper) => wrapper.parentElement !== main);
  if (nestedWrappers.length > 0) issues.push(`중첩된 슬라이드 래퍼 ${nestedWrappers.length}개가 남아 있습니다.`);

  if (/\{\{[A-Z0-9_]+\}\}/.test(documentRef.body?.textContent ?? '')) {
    issues.push('치환되지 않은 {{PLACEHOLDER}}가 남아 있습니다.');
  }

  const overflowSlideIds = Array.from(documentRef.querySelectorAll<HTMLElement>(".slide[data-layout-overflow='true']"))
    .map((slide) => slide.id || '(id 없음)');
  if (overflowSlideIds.length > 0) issues.push(`콘텐츠 오버플로: ${overflowSlideIds.join(', ')}`);

  return { ok: issues.length === 0, slideCount: wrappers.length, issues, overflowSlideIds };
}

async function exportExactPdf(iframe: HTMLIFrameElement): Promise<void> {
  try {
    const title = iframe.contentDocument?.title || 'Brand Consulting';
    await exportReportPdf(iframe, title);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    window.alert(`PDF 생성 오류\n\n${message}`);
  }
}

function installPrintGuard(
  iframe: HTMLIFrameElement,
  documentRef: Document,
  windowRef: FrameWindow,
): void {
  windowRef.__REPORT_PREFLIGHT__ = () => runPreflight(documentRef);
  if (!windowRef.__NATIVE_REPORT_PRINT__) windowRef.__NATIVE_REPORT_PRINT__ = windowRef.print.bind(windowRef);

  // The app's Export PDF button calls iframe.contentWindow.print(). Replace that
  // call with a deterministic PDF download whose MediaBox is exactly 960 x 540pt.
  windowRef.print = () => {
    void exportExactPdf(iframe);
  };

  windowRef.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'p') {
      event.preventDefault();
      event.stopPropagation();
      void exportExactPdf(iframe);
    }
  });
}

function installIntoFrame(iframe: HTMLIFrameElement): void {
  const documentRef = iframe.contentDocument;
  const windowRef = iframe.contentWindow as FrameWindow | null;
  if (!documentRef || !windowRef || !documentRef.documentElement) return;

  if (documentRef.documentElement.dataset[FRAME_MARKER] === 'installed') {
    fitSlides(documentRef);
    resizeWebCanvas(documentRef, windowRef);
    return;
  }

  documentRef.documentElement.dataset[FRAME_MARKER] = 'installed';
  flattenSlideWrappers(documentRef);
  injectSafetyStyle(documentRef);
  installPrintGuard(iframe, documentRef, windowRef);

  const finalize = () => {
    flattenSlideWrappers(documentRef);
    fitSlides(documentRef);
    resizeWebCanvas(documentRef, windowRef);
    const result = runPreflight(documentRef);
    if (!result.ok) console.warn('[Layout Safety] Preflight issues', result);
    else console.info(`[Layout Safety] ${result.slideCount} slides passed preflight.`);
  };

  windowRef.addEventListener('resize', finalize, { passive: true });
  windowRef.addEventListener('afterprint', finalize);
  if (documentRef.fonts?.ready) void documentRef.fonts.ready.then(finalize);
  windowRef.requestAnimationFrame(finalize);
}

export function installIframeLayoutSafety(): () => void {
  const hostWindow = window as Window & { __IFRAME_LAYOUT_SAFETY_V1__?: boolean };
  if (hostWindow.__IFRAME_LAYOUT_SAFETY_V1__) return () => undefined;
  hostWindow.__IFRAME_LAYOUT_SAFETY_V1__ = true;

  const attachedFrames = new Set<HTMLIFrameElement>();

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
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof HTMLElement)) return;
        if (node instanceof HTMLIFrameElement) attach(node);
        scan(node);
      });
    });
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });

  const handleHostPrintShortcut = (event: KeyboardEvent) => {
    if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 'p') return;
    const iframe = document.getElementById('fullscreen-viewer-iframe') as HTMLIFrameElement | null;
    if (!iframe || !iframe.offsetParent) return;
    event.preventDefault();
    event.stopPropagation();
    void exportExactPdf(iframe);
  };
  document.addEventListener('keydown', handleHostPrintShortcut, true);

  return () => {
    observer.disconnect();
    document.removeEventListener('keydown', handleHostPrintShortcut, true);
    hostWindow.__IFRAME_LAYOUT_SAFETY_V1__ = false;
  };
}
