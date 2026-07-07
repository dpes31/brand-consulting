const MATERIAL_SYMBOLS_FONT = 'Material Symbols Outlined';
const READY_CLASS = 'material-symbols-ready';
const PENDING_CLASS = 'material-symbols-pending';

function markReady(): void {
  const root = document.documentElement;
  root.classList.remove(PENDING_CLASS);
  root.classList.add(READY_CLASS);
  root.dataset.materialSymbolsState = 'ready';
  document.dispatchEvent(new CustomEvent('material-symbols-ready'));
}

function markPending(): void {
  const root = document.documentElement;
  root.classList.remove(READY_CLASS);
  root.classList.add(PENDING_CLASS);
  root.dataset.materialSymbolsState = 'pending';
}

export function installMaterialSymbolsReady(): () => void {
  if (typeof document === 'undefined') return () => undefined;

  markPending();
  let cancelled = false;
  let retryTimer = 0;

  const verify = async (): Promise<void> => {
    if (cancelled) return;

    if (!document.fonts) {
      window.addEventListener('load', markReady, { once: true });
      return;
    }

    try {
      await document.fonts.load(`24px "${MATERIAL_SYMBOLS_FONT}"`, 'search');
      if (cancelled) return;

      if (document.fonts.check(`24px "${MATERIAL_SYMBOLS_FONT}"`, 'search')) {
        markReady();
        return;
      }
    } catch {
      // Keep ligature text hidden and retry below. Showing a blank icon is safer
      // than exposing words such as "search" or "picture_as_pdf" during failure.
    }

    retryTimer = window.setTimeout(() => {
      void verify();
    }, 500);
  };

  void verify();

  return () => {
    cancelled = true;
    window.clearTimeout(retryTimer);
  };
}
