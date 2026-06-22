import { normalizeVisualizationDocument } from './visualizationEngine';

let installed = false;

function applyVisualizationEngine(iframe: HTMLIFrameElement): void {
  const documentRef = iframe.contentDocument;
  if (!documentRef?.documentElement) return;

  try {
    const manifest = normalizeVisualizationDocument(documentRef);
    if (manifest.warningCount > 0) {
      console.warn(
        '[Visualization Engine] Audit warnings:',
        manifest.pages.filter((page) => page.warnings.length > 0),
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    documentRef.documentElement.dataset.visualizationError = message;
    console.warn('[Visualization Engine] Runtime audit skipped:', message);
  }
}

export function installVisualizationEngine(): void {
  if (installed || typeof document === 'undefined') return;
  installed = true;

  const attached = new WeakSet<HTMLIFrameElement>();

  const attach = (iframe: HTMLIFrameElement) => {
    if (attached.has(iframe)) return;
    attached.add(iframe);
    const apply = () => applyVisualizationEngine(iframe);
    iframe.addEventListener('load', apply);
    if (iframe.contentDocument?.readyState === 'complete') window.setTimeout(apply, 0);
  };

  const scan = (root: ParentNode = document) => {
    root.querySelectorAll<HTMLIFrameElement>('iframe').forEach(attach);
  };

  scan();
  new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof HTMLElement)) return;
        if (node instanceof HTMLIFrameElement) attach(node);
        scan(node);
      });
    });
  }).observe(document.documentElement, { childList: true, subtree: true });
}
