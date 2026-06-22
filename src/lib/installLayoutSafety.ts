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

.slide-wrapper {
  position: relative !important;
  flex-shrink: 0 !important;
  transform: none !important;
  transform-origin: top left !important;
}

.slide-wrapper > .slide {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  width: ${LOGICAL_SLIDE_WIDTH}px !important;
  height: ${LOGICAL_SLIDE_HEIGHT}px !important;
  transform-origin: top left !important;
}

.slide {
  padding: 30px 48px 70px !important;
}

.slide.slide-full {
  padding-bottom: 28px !important;
}

.slide-header {
  margin-bottom: 18px !important;
  padding-bottom: 12px !important;
}

.slide-body {
  min-height: 0 !important;
  padding-bottom: 4px !important;
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
  left: 48px !important;
  right: 48px !important;
  bottom: 18px !important;
}

.slide.layout-density-1 {
  padding: 24px 42px 62px !important;
}

.slide.layout-density-1 .slide-header {
  margin-bottom: 13px !important;
  padding-bottom: 9px !important;
}

.slide.layout-density-1 .governing-msg {
  padding: 12px 18px !important;
  margin-bottom: 14px !important;
  font-size: 14px !important;
}

.slide.layout-density-1 .box {
  padding: 15px 18px !important;
}

.slide.layout-density-1 .box.compact-box,
.slide.layout-density-1 .box.tight-box {
  padding: 13px 16px !important;
}

.slide.layout-density-1 .grid-2,
.slide.layout-density-1 .grid-3 {
  gap: 14px !important;
}

.slide.layout-density-1 .title {
  font-size: 28px !important;
}

.slide.layout-density-1 dl dt {
  margin-top: 8px !important;
}

.slide.layout-density-1 dl dd {
  margin-bottom: 4px !important;
  line-height: 1.42 !important;
}

.slide.layout-density-2 {
  padding: 20px 38px 58px !important;
}

.slide.layout-density-2 .slide-header {
  margin-bottom: 10px !important;
  padding-bottom: 7px !important;
}

.slide.layout-density-2 .title {
  font-size: 25px !important;
}

.slide.layout-density-2 .breadcrumb {
  font-size: 9px !important;
}

.slide.layout-density-2 .governing-msg {
  padding: 10px 15px !important;
  margin-bottom: 10px !important;
  font-size: 13px !important;
  line-height: 1.4 !important;
}

.slide.layout-density-2 .box,
.slide.layout-density-2 .box.compact-box,
.slide.layout-density-2 .box.tight-box {
  padding: 11px 14px !important;
}

.slide.layout-density-2 .box-title {
  margin-bottom: 7px !important;
  padding-bottom: 6px !important;
  font-size: 13px !important;
}

.slide.layout-density-2 .grid-2,
.slide.layout-density-2 .grid-3 {
  gap: 10px !important;
}

.slide.layout-density-2 dl dt {
  margin-top: 6px !important;
  font-size: 11px !important;
}

.slide.layout-density-2 dl dd {
  margin-bottom: 2px !important;
  font-size: 10px !important;
  line-height: 1.35 !important;
}

.slide[data-layout-overflow='true'] {
  outline: 3px solid #ef4444 !important;
  outline-offset: -3px !important;
}

@page {
  size: 13.333in 7.5in;
  margin: 0;
}

@media print {
  html,
  body {
    width: 13.333in !important;
    min-width: 13.333in !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow: visible !important;
    background: #fff !important;
  }

  nav,
  .print-guide {
    display: none !important;
  }

  main#content {
    width: 13.333in !important;
    min-width: 13.333in !important;
    margin: 0 !important;
    padding: 0 !important;
    display: block !important;
    transform: none !important;
  }

  .slide-wrapper {
    width: 13.333in !important;
    height: 7.5in !important;
    min-width: 13.333in !important;
    min-height: 7.5in !important;
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
    width: 13.333in !important;
    height: 7.5in !important;
    min-width: 13.333in !important;
    min-height: 7.5in !important;
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

/**
 * Browsers recover malformed HTML by nesting the following slide wrappers inside
 * the previous wrapper. Flatten every wrapper back under main#content while
 * preserving its original document order. This specifically protects slide-17,
 * slide-18 and the back cover without hard-coding a destructive replacement.
 */
function flattenSlideWrappers(documentRef: Document): void {
  const main = getMainContent(documentRef);
  if (!main) return;

  const wrappers = Array.from(documentRef.querySelectorAll<HTMLElement>('.slide-wrapper'));
  const printGuide = main.querySelector<HTMLElement>('.print-guide');

  wrappers.forEach((wrapper) => {
    main.insertBefore(wrapper, printGuide);
  });
}

function injectSafetyStyle(documentRef: Document): void {
  if (!documentRef.head || documentRef.getElementById(STYLE_ID)) return;

  const style = documentRef.createElement('style');
  style.id = STYLE_ID;
  style.textContent = LAYOUT_SAFETY_CSS;
  documentRef.head.appendChild(style);
}

function elementOverflows(element: HTMLElement): boolean {
  return (
    element.scrollHeight > element.clientHeight + 2 ||
    element.scrollWidth > element.clientWidth + 2
  );
}

function slideOverflows(slide: HTMLElement): boolean {
  const candidates = [
    slide,
    ...Array.from(
      slide.querySelectorAll<HTMLElement>(
        '.slide-body, .box, .box-content, .timeline-container, .pos-map, table',
      ),
    ),
  ];

  return candidates.some((element) => elementOverflows(element));
}

function fitSlides(documentRef: Document): void {
  const slides = Array.from(documentRef.querySelectorAll<HTMLElement>('.slide-wrapper > .slide'));

  slides.forEach((slide) => {
    slide.classList.remove('layout-density-1', 'layout-density-2');
    delete slide.dataset.layoutOverflow;

    // Force layout before each density step.
    void slide.offsetHeight;
    if (!slideOverflows(slide)) return;

    slide.classList.add('layout-density-1');
    void slide.offsetHeight;
    if (!slideOverflows(slide)) return;

    slide.classList.remove('layout-density-1');
    slide.classList.add('layout-density-2');
    void slide.offsetHeight;

    if (slideOverflows(slide)) {
      slide.dataset.layoutOverflow = 'true';
    }
  });
}

function resizeWebCanvas(documentRef: Document, windowRef: Window): void {
  if (windowRef.matchMedia('print').matches) return;

  const nav = documentRef.querySelector<HTMLElement>('nav');
  const navWidth = nav ? nav.getBoundingClientRect().width : 0;
  const horizontalGutter = 48;
  const availableWidth = Math.max(320, windowRef.innerWidth - navWidth - horizontalGutter);
  const scale = Math.min(1, availableWidth / LOGICAL_SLIDE_WIDTH);

  const wrappers = Array.from(documentRef.querySelectorAll<HTMLElement>('.slide-wrapper'));
  wrappers.forEach((wrapper) => {
    wrapper.style.width = `${LOGICAL_SLIDE_WIDTH * scale}px`;
    wrapper.style.height = `${LOGICAL_SLIDE_HEIGHT * scale}px`;
    wrapper.style.marginBottom = `${Math.max(18, 40 * scale)}px`;

    const slide = wrapper.querySelector<HTMLElement>(':scope > .slide');
    if (!slide) return;
    slide.style.transform = `scale(${scale})`;
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
  if (missingIds.length > 0) {
    issues.push(`필수 슬라이드 누락: ${missingIds.join(', ')}`);
  }

  const main = getMainContent(documentRef);
  const nestedWrappers = wrappers.filter((wrapper) => wrapper.parentElement !== main);
  if (nestedWrappers.length > 0) {
    issues.push(`중첩된 슬라이드 래퍼 ${nestedWrappers.length}개가 남아 있습니다.`);
  }

  const bodyText = documentRef.body?.textContent ?? '';
  if (/\{\{[A-Z0-9_]+\}\}/.test(bodyText)) {
    issues.push('치환되지 않은 {{PLACEHOLDER}}가 남아 있습니다.');
  }

  const overflowSlideIds = Array.from(
    documentRef.querySelectorAll<HTMLElement>(".slide[data-layout-overflow='true']"),
  ).map((slide) => slide.id || '(id 없음)');

  if (overflowSlideIds.length > 0) {
    issues.push(`콘텐츠 오버플로: ${overflowSlideIds.join(', ')}`);
  }

  return {
    ok: issues.length === 0,
    slideCount: wrappers.length,
    issues,
    overflowSlideIds,
  };
}

function installPrintGuard(documentRef: Document, windowRef: FrameWindow): void {
  windowRef.__REPORT_PREFLIGHT__ = () => runPreflight(documentRef);

  if (!windowRef.__NATIVE_REPORT_PRINT__) {
    windowRef.__NATIVE_REPORT_PRINT__ = windowRef.print.bind(windowRef);
  }

  windowRef.print = () => {
    const result = runPreflight(documentRef);
    if (!result.ok) {
      windowRef.alert(
        [
          'PDF 출력을 중단했습니다. 잘림 또는 구조 오류가 감지되었습니다.',
          '',
          ...result.issues.map((issue) => `• ${issue}`),
          '',
          '문제를 수정한 뒤 다시 출력해 주세요.',
        ].join('\n'),
      );
      return;
    }

    windowRef.__NATIVE_REPORT_PRINT__?.();
  };
}

function installIntoFrame(iframe: HTMLIFrameElement): void {
  const documentRef = iframe.contentDocument;
  const windowRef = iframe.contentWindow as FrameWindow | null;
  if (!documentRef || !windowRef || !documentRef.documentElement) return;

  if (documentRef.documentElement.dataset[FRAME_MARKER] === 'installed') {
    resizeWebCanvas(documentRef, windowRef);
    return;
  }

  documentRef.documentElement.dataset[FRAME_MARKER] = 'installed';
  flattenSlideWrappers(documentRef);
  injectSafetyStyle(documentRef);
  installPrintGuard(documentRef, windowRef);

  const finalize = () => {
    flattenSlideWrappers(documentRef);
    fitSlides(documentRef);
    resizeWebCanvas(documentRef, windowRef);
    const result = runPreflight(documentRef);

    if (!result.ok) {
      console.warn('[Layout Safety] Preflight issues', result);
    } else {
      console.info(`[Layout Safety] ${result.slideCount} slides passed preflight.`);
    }
  };

  windowRef.addEventListener('resize', finalize, { passive: true });
  windowRef.addEventListener('beforeprint', () => fitSlides(documentRef));
  windowRef.addEventListener('afterprint', finalize);

  if (documentRef.fonts?.ready) {
    void documentRef.fonts.ready.then(finalize);
  }

  windowRef.requestAnimationFrame(finalize);
}

/**
 * Installs the layout guard once on the React shell and automatically protects
 * every current/future report iframe. The app's production page is untouched;
 * only iframe-rendered consulting reports receive the safety layer.
 */
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

    if (iframe.contentDocument?.readyState === 'complete') {
      window.setTimeout(apply, 0);
    }
  };

  const scan = (root: ParentNode = document) => {
    root.querySelectorAll<HTMLIFrameElement>('iframe').forEach(attach);
  };

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

  return () => {
    observer.disconnect();
    attachedFrames.forEach((iframe) => {
      iframe.replaceWith(iframe.cloneNode(true));
    });
    hostWindow.__IFRAME_LAYOUT_SAFETY_V1__ = false;
  };
}
