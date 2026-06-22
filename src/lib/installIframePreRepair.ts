function repairIframeStructure(iframe: HTMLIFrameElement): void {
  const documentRef = iframe.contentDocument;
  if (!documentRef) return;

  const main = documentRef.querySelector<HTMLElement>('main#content') ?? documentRef.body;
  if (!main) return;

  const wrappers = Array.from(documentRef.querySelectorAll<HTMLElement>('.slide-wrapper'));
  if (wrappers.length === 0) return;

  // Use a guaranteed direct-child sentinel. The existing print guide can itself
  // be trapped inside a malformed slide wrapper, so it is unsafe as insertBefore's
  // reference node until the wrapper tree has been repaired.
  const sentinel = documentRef.createComment('layout-safety-wrapper-sentinel');
  main.appendChild(sentinel);

  wrappers.forEach((wrapper) => {
    main.insertBefore(wrapper, sentinel);
  });

  sentinel.remove();
}

/**
 * Registers before the main layout guard so malformed template HTML is repaired
 * first. This protects the known slide-17 → slide-18 nesting defect without
 * changing main or the immutable report template during Phase 1.
 */
export function installIframePreRepair(): void {
  const hostWindow = window as Window & { __IFRAME_PRE_REPAIR_V1__?: boolean };
  if (hostWindow.__IFRAME_PRE_REPAIR_V1__) return;
  hostWindow.__IFRAME_PRE_REPAIR_V1__ = true;

  const attachedFrames = new WeakSet<HTMLIFrameElement>();

  const attach = (iframe: HTMLIFrameElement) => {
    if (attachedFrames.has(iframe)) return;
    attachedFrames.add(iframe);

    const repair = () => repairIframeStructure(iframe);
    iframe.addEventListener('load', repair);

    if (iframe.contentDocument?.readyState === 'complete') {
      window.setTimeout(repair, 0);
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
}
