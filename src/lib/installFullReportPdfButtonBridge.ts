import { exportFullReportPdf } from './installFullReportRuntimeCompatibility';

let installed = false;
let stableExportFrame: HTMLIFrameElement | null = null;
let stableExportSource = '';

type ReportFrameWindow = Window & {
  __REPORT_PREFLIGHT__?: () => { ok: boolean; issues: string[] };
  __FULL_REPORT_RUNTIME__?: {
    version: '1.0.0';
    exportPdf: () => Promise<void>;
  };
};

type FullReportSourceWindow = Window & {
  __FULL_REPORT_SOURCE__?: string;
};

function normalized(value: string | null | undefined): string {
  return (value || '').replace(/\s+/g, ' ').trim();
}

function findExportButton(event: Event): HTMLButtonElement | null {
  const target = event.target;
  if (!(target instanceof Element)) return null;
  const button = target.closest('button');
  if (!(button instanceof HTMLButtonElement)) return null;
  return normalized(button.textContent).includes('Export PDF') ? button : null;
}

function findFullscreenFrame(): HTMLIFrameElement | null {
  return document.getElementById('fullscreen-viewer-iframe') as HTMLIFrameElement | null;
}

function fullSlideCount(iframe: HTMLIFrameElement): number {
  return iframe.contentDocument?.querySelectorAll('.full-slide').length ?? 0;
}

function isFullReportFrame(iframe: HTMLIFrameElement): boolean {
  const documentRef = iframe.contentDocument;
  const windowRef = iframe.contentWindow as ReportFrameWindow | null;
  return Boolean(
    windowRef?.__FULL_REPORT_RUNTIME__
    || documentRef?.body?.dataset.reportVersion === 'full-report-v1'
    || documentRef?.documentElement.dataset.fullReportPageCount === '48'
    || fullSlideCount(iframe) === 48,
  );
}

async function waitForFullReportFrame(iframe: HTMLIFrameElement, timeoutMs = 30000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (isFullReportFrame(iframe) && fullSlideCount(iframe) === 48) return;
    await new Promise((resolve) => window.setTimeout(resolve, 100));
  }
  throw new Error('FULL 보고서 48페이지가 준비되지 않았습니다. 잠시 후 다시 시도해 주세요.');
}

function reportSource(iframe: HTMLIFrameElement): string {
  const retained = (window as FullReportSourceWindow).__FULL_REPORT_SOURCE__ || '';
  if (retained.includes('data-report-version="full-report-v1"')) return retained;
  return iframe.srcdoc || iframe.getAttribute('srcdoc') || '';
}

async function createStableExportFrame(source: string): Promise<HTMLIFrameElement> {
  if (!source.includes('data-report-version="full-report-v1"')) {
    throw new Error('FULL 보고서 원본 HTML을 확인할 수 없습니다.');
  }

  if (stableExportFrame && stableExportSource === source && stableExportFrame.isConnected) {
    await waitForFullReportFrame(stableExportFrame);
    return stableExportFrame;
  }

  stableExportFrame?.remove();
  const iframe = document.createElement('iframe');
  iframe.id = 'full-report-pdf-export-frame';
  iframe.title = 'FULL Report PDF Export';
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.cssText = [
    'position:fixed',
    'left:-20000px',
    'top:0',
    'width:1280px',
    'height:720px',
    'border:0',
    'pointer-events:none',
    'z-index:-1',
  ].join(';');
  iframe.srcdoc = source;
  document.body.appendChild(iframe);
  stableExportFrame = iframe;
  stableExportSource = source;
  await waitForFullReportFrame(iframe);
  return iframe;
}

async function resolveExportFrame(viewerFrame: HTMLIFrameElement): Promise<HTMLIFrameElement> {
  if (isFullReportFrame(viewerFrame) && fullSlideCount(viewerFrame) === 48) return viewerFrame;
  return createStableExportFrame(reportSource(viewerFrame));
}

async function exportFromStableFrame(viewerFrame: HTMLIFrameElement): Promise<void> {
  const iframe = await resolveExportFrame(viewerFrame);
  const frameWindow = iframe.contentWindow as ReportFrameWindow | null;
  if (!frameWindow) throw new Error('FULL 보고서 iframe에 접근할 수 없습니다.');

  const previousPreflight = frameWindow.__REPORT_PREFLIGHT__;
  delete frameWindow.__REPORT_PREFLIGHT__;
  try {
    await exportFullReportPdf(iframe, iframe.contentDocument?.title);
  } finally {
    if (previousPreflight) frameWindow.__REPORT_PREFLIGHT__ = previousPreflight;
  }
}

export function installFullReportPdfButtonBridge(): void {
  if (installed || typeof document === 'undefined') return;
  installed = true;
  document.documentElement.dataset.fullPdfButtonBridge = 'installed';

  window.addEventListener('click', (event) => {
    if (!findExportButton(event)) return;
    const iframe = findFullscreenFrame();
    if (!iframe) return;

    // The visible iframe can briefly reload after project persistence. Always
    // intercept before React reaches iframe.print(), then export from either the
    // ready viewer or a reusable offscreen frame built from the retained srcDoc.
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    void exportFromStableFrame(iframe).catch((error) => {
      const message = error instanceof Error ? error.message : String(error);
      window.alert(`FULL PDF 생성 오류\n\n${message}`);
    });
  }, true);
}
