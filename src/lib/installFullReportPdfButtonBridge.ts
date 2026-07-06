import { exportFullReportPdf } from './installFullReportRuntimeCompatibility';

let installed = false;

type ReportFrameWindow = Window & {
  __REPORT_PREFLIGHT__?: () => { ok: boolean; issues: string[] };
  __FULL_REPORT_RUNTIME__?: {
    version: '1.0.0';
    exportPdf: () => Promise<void>;
  };
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

function isFullReportFrame(iframe: HTMLIFrameElement): boolean {
  const documentRef = iframe.contentDocument;
  const windowRef = iframe.contentWindow as ReportFrameWindow | null;
  return Boolean(
    windowRef?.__FULL_REPORT_RUNTIME__
    || documentRef?.body?.dataset.reportVersion === 'full-report-v1'
    || documentRef?.documentElement.dataset.fullReportPageCount === '48'
    || documentRef?.querySelectorAll('.full-slide').length === 48,
  );
}

async function waitForFullReportFrame(iframe: HTMLIFrameElement, timeoutMs = 15000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (isFullReportFrame(iframe)) return;
    await new Promise((resolve) => window.setTimeout(resolve, 100));
  }
  throw new Error('FULL 보고서 Viewer가 아직 준비되지 않았습니다. 잠시 후 다시 시도해 주세요.');
}

async function exportFromStableFrame(iframe: HTMLIFrameElement): Promise<void> {
  await waitForFullReportFrame(iframe);
  const frameWindow = iframe.contentWindow as ReportFrameWindow | null;
  if (!frameWindow) throw new Error('FULL 보고서 iframe에 접근할 수 없습니다.');

  const previousPreflight = frameWindow.__REPORT_PREFLIGHT__;
  delete frameWindow.__REPORT_PREFLIGHT__;
  try {
    if (frameWindow.__FULL_REPORT_RUNTIME__) {
      await frameWindow.__FULL_REPORT_RUNTIME__.exportPdf();
    } else {
      await exportFullReportPdf(iframe, iframe.contentDocument?.title);
    }
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

    // Never allow the old React handler to call iframe.print() for the FULL viewer.
    // The frame can be briefly blank while React saves/re-renders the project, so
    // wait for the 48-page document instead of falling back to the Legacy path.
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    void exportFromStableFrame(iframe).catch((error) => {
      const message = error instanceof Error ? error.message : String(error);
      window.alert(`FULL PDF 생성 오류\n\n${message}`);
    });
  }, true);
}
