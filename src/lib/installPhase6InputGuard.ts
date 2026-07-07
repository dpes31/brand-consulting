let installed = false;

function normalized(value: string | null | undefined): string {
  return (value || '').replace(/\s+/g, ' ').trim();
}

function looksLikeHtml(value: string): boolean {
  return /<!doctype\s+html|<html\b/i.test(value);
}

function looksLikeJson(value: string): boolean {
  const text = value.trim().replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
  return text.startsWith('{') && /"(?:mainSlides|appendixSlides|version|brand)"\s*:/.test(text);
}

function findPhase6Textarea(button: HTMLButtonElement): HTMLTextAreaElement | null {
  const panel = button.closest('div');
  const local = panel?.parentElement?.querySelector<HTMLTextAreaElement>('textarea');
  if (local) return local;
  return Array.from(document.querySelectorAll<HTMLTextAreaElement>('textarea')).find((textarea) => /외부|html/i.test(textarea.placeholder || '')) || null;
}

export function installPhase6InputGuard(): void {
  if (installed || typeof document === 'undefined') return;
  installed = true;

  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const button = target.closest('button');
    if (!(button instanceof HTMLButtonElement)) return;
    if (!normalized(button.textContent).includes('결과물 뷰어에 렌더링하기')) return;

    const textarea = findPhase6Textarea(button);
    if (textarea?.dataset.fullReportValidatedHtml === 'true') {
      delete textarea.dataset.fullReportValidatedHtml;
      return;
    }

    const value = textarea?.value.trim() || '';
    if (looksLikeJson(value)) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      window.alert('현재 Phase 6는 승인된 40페이지 Main Deck 양식에 조사 내용을 채운 완성 HTML 전체가 필요하다. 최신 Phase 6 프롬프트를 다시 내려받아야 한다.');
      return;
    }

    if (!looksLikeHtml(value)) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      window.alert('완성 HTML 전체를 확인할 수 없다.');
    }
  }, true);
}
