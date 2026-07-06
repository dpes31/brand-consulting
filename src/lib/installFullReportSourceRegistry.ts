let installed = false;

type FullReportSourceWindow = Window & {
  __FULL_REPORT_SOURCE__?: string;
};

function isFullReportSource(value: string): boolean {
  return value.includes('data-report-version="full-report-v1"')
    && value.includes('id="report-data"')
    && value.includes('/full-report-v1.js');
}

function remember(value: string | null | undefined): void {
  if (!value || !isFullReportSource(value)) return;
  (window as FullReportSourceWindow).__FULL_REPORT_SOURCE__ = value;
}

function captureTarget(target: EventTarget | null): void {
  if (target instanceof HTMLTextAreaElement) remember(target.value);
  if (target instanceof HTMLIFrameElement) remember(target.srcdoc || target.getAttribute('srcdoc'));
}

function scan(root: ParentNode = document): void {
  root.querySelectorAll<HTMLTextAreaElement>('textarea').forEach((textarea) => remember(textarea.value));
  root.querySelectorAll<HTMLIFrameElement>('iframe').forEach((iframe) => remember(iframe.srcdoc || iframe.getAttribute('srcdoc')));
}

export function installFullReportSourceRegistry(): void {
  if (installed || typeof document === 'undefined') return;
  installed = true;
  document.documentElement.dataset.fullReportSourceRegistry = 'installed';

  document.addEventListener('input', (event) => captureTarget(event.target), true);
  document.addEventListener('change', (event) => captureTarget(event.target), true);
  scan();

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.target instanceof HTMLIFrameElement) {
        captureTarget(mutation.target);
      }
      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof HTMLElement)) return;
        if (node instanceof HTMLIFrameElement) captureTarget(node);
        if (node instanceof HTMLTextAreaElement) remember(node.value);
        scan(node);
      });
    });
  });
  observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['srcdoc'],
  });
}
