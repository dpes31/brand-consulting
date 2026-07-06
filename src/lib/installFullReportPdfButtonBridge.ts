import { exportFullReportPdf } from './installFullReportRuntimeCompatibility';

let installed = false;

function normalized(value: string | null | undefined): string {
  return (value || '').replace(/\s+/g, ' ').trim();
}

function findFullscreenFrame(): HTMLIFrameElement | null {
  return document.getElementById('fullscreen-viewer-iframe') as HTMLIFrameElement | null;
}

function isFullReportFrame(iframe: HTMLIFrameElement): boolean {
  const documentRef = iframe.contentDocument;
  return Boolean(
    documentRef?.body?.dataset.reportVersion === 'full-report-v1'
    || documentRef?.querySelector('.full-slide'),
  );
}

export function installFullReportPdfButtonBridge(): void {
  if (installed || typeof document === 'undefined') return;
  installed = true;

  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const button = target.closest('button');
    if (!(button instanceof HTMLButtonElement)) return;
    if (!normalized(button.textContent).includes('Export PDF')) return;

    const iframe = findFullscreenFrame();
    if (!iframe || !isFullReportFrame(iframe)) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    void exportFullReportPdf(iframe, iframe.contentDocument?.title).catch((error) => {
      const message = error instanceof Error ? error.message : String(error);
      window.alert(`FULL PDF 생성 오류\n\n${message}`);
    });
  }, true);
}
