import { normalizeDynamicReportDocument } from './dynamicPagePlanner';

let installed = false;

function removePrintTip(documentRef: Document): void {
  documentRef.querySelectorAll<HTMLElement>('.print-guide').forEach((element) => element.remove());

  const candidates = Array.from(documentRef.querySelectorAll<HTMLElement>('div, aside, section'));
  candidates.forEach((element) => {
    const text = element.textContent?.replace(/\s+/g, ' ').trim() ?? '';
    if (!text.includes('PDF 인쇄 최적화 팁')) return;
    const removable = element.closest<HTMLElement>('.print-guide') ?? element;
    removable.remove();
  });
}

function installInternalNavigation(documentRef: Document): void {
  const nav = documentRef.querySelector<HTMLElement>('nav#navbar, nav');
  if (!nav || nav.dataset.reportNavigationInstalled === 'true') return;
  nav.dataset.reportNavigationInstalled = 'true';

  nav.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const anchor = target.closest<HTMLAnchorElement>('a.nav-item[href^="#"]');
    if (!anchor) return;

    event.preventDefault();
    event.stopPropagation();

    const targetId = anchor.getAttribute('href')?.slice(1);
    if (!targetId) return;

    const slide = documentRef.getElementById(targetId);
    const wrapper = slide?.closest<HTMLElement>('.slide-wrapper') ?? slide;
    if (!wrapper) return;

    documentRef.querySelectorAll<HTMLElement>('.nav-item.active').forEach((item) => item.classList.remove('active'));
    anchor.classList.add('active');
    wrapper.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
  });
}

function simplifyLivePreview(iframe: HTMLIFrameElement, documentRef: Document): void {
  if (iframe.id === 'fullscreen-viewer-iframe') return;

  const nav = documentRef.querySelector<HTMLElement>('nav#navbar, nav');
  if (nav) nav.style.setProperty('display', 'none', 'important');

  const main = documentRef.querySelector<HTMLElement>('main#content');
  if (main) {
    main.style.setProperty('margin-left', '0', 'important');
    main.style.setProperty('width', '100%', 'important');
    main.style.setProperty('min-width', '100%', 'important');
  }

  documentRef.documentElement.style.setProperty('--nav-w', '0px');
}

function applyViewerUx(iframe: HTMLIFrameElement): void {
  const documentRef = iframe.contentDocument;
  if (!documentRef?.documentElement) return;

  try {
    const manifest = normalizeDynamicReportDocument(documentRef);
    documentRef.documentElement.dataset.mainDeckPages = String(manifest.mainPageCount);
    documentRef.documentElement.dataset.appendixPages = String(manifest.appendixPageCount);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    documentRef.documentElement.dataset.pagePlanError = message;
    console.warn('[Dynamic Page Planner] Runtime normalization skipped:', message);
  }

  removePrintTip(documentRef);
  simplifyLivePreview(iframe, documentRef);
  installInternalNavigation(documentRef);
}

export function installReportViewerUX(): void {
  if (installed || typeof document === 'undefined') return;
  installed = true;

  const attached = new WeakSet<HTMLIFrameElement>();

  const attach = (iframe: HTMLIFrameElement) => {
    if (attached.has(iframe)) return;
    attached.add(iframe);

    const apply = () => applyViewerUx(iframe);
    iframe.addEventListener('load', apply);
    if (iframe.contentDocument?.readyState === 'complete') window.setTimeout(apply, 0);
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
}
