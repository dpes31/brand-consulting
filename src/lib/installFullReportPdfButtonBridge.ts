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

function armFullReportPrint(iframe: HTMLIFrameElement): boolean {
  if (!isFullReportFrame(iframe)) return false;
  const frameWindow = iframe.contentWindow as ReportFrameWindow | null;
  if (!frameWindow) return false;

  frameWindow.print = () => {
    const previousPreflight = frameWindow.__REPORT_PREFLIGHT__;
    delete frameWindow.__REPORT_PREFLIGHT__;
    const exportPromise = frameWindow.__FULL_REPORT_RUNTIME__?.exportPdf()
      ?? exportFullReportPdf(iframe, iframe.contentDocument?.title);
    void exportPromise
      .catch((error) => {
        const message = error instanceof Error ? error.message : String(error);
        window.alert(`FULL PDF 생성 오류\n\n${message}`);
      })
      .finally(() => {
        if (previousPreflight) frameWindow.__REPORT_PREFLIGHT__ = previousPreflight;
      });
  };
  return true;
}

export function installFullReportPdfButtonBridge(): void {
  if (installed || typeof document === 'undefined') return;
  installed = true;
  document.documentElement.dataset.fullPdfButtonBridge = 'installed';

  const armFromEvent = (event: Event) => {
    if (!findExportButton(event)) return;
    const iframe = findFullscreenFrame();
    if (iframe) armFullReportPrint(iframe);
  };

  // React's onClick calls iframe.contentWindow.print(). Arm that function on
  // pointer-down first so the later React click cannot reach the Legacy path.
  window.addEventListener('pointerdown', armFromEvent, true);
  window.addEventListener('mousedown', armFromEvent, true);

  window.addEventListener('click', (event) => {
    if (!findExportButton(event)) return;
    const iframe = findFullscreenFrame();
    if (!iframe || !armFullReportPrint(iframe)) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    iframe.contentWindow?.print();
  }, true);
}
