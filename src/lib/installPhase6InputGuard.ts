let installed = false;

function normalized(value: string | null | undefined): string {
  return (value || '').replace(/\s+/g, ' ').trim();
}

function looksLikeHtml(value: string): boolean {
  const text = value.trim().replace(/^```html\s*/i, '').replace(/```\s*$/i, '').trim();
  return /<!doctype\s+html/i.test(text) && /<html\b/i.test(text) && /<\/html\s*>/i.test(text);
}

function looksLikeJson(value: string): boolean {
  const text = value.trim().replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
  return text.startsWith('{') && /"(?:mainSlides|appendixSlides|version|brand|pages)"\s*:/.test(text);
}

function findPhase6Textarea(button: HTMLButtonElement): HTMLTextAreaElement | null {
  const local = button.closest<HTMLElement>('[data-phase6-panel]')
    ?.querySelector<HTMLTextAreaElement>('textarea[data-phase6-input-mode="approved-html"]');
  if (local) return local;
  return document.querySelector<HTMLTextAreaElement>('textarea[data-phase6-input-mode="approved-html"]')
    || Array.from(document.querySelectorAll<HTMLTextAreaElement>('textarea')).find((textarea) => /외부|html/i.test(textarea.placeholder || ''))
    || null;
}

export function installPhase6InputGuard(): void {
  if (installed || typeof document === 'undefined') return;
  installed = true;

  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const button = target.closest('button');
    if (!(button instanceof HTMLButtonElement)) return;

    const label = normalized(button.textContent);
    if (!label.includes('결과물 뷰어에 렌더링하기') && !label.includes('HTML 검증 후 48페이지 보고서 열기')) return;

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
      window.alert(
        'JSON 결과를 붙여넣으셨습니다.\n\n'
        + '현재 Phase 6의 주 경로는 승인 샘플 40 Main + 8 Appendix의 완성 HTML입니다. '
        + '완성 HTML 프롬프트를 외부 AI에 첨부하고, 반환된 ```html ... ``` 전체를 붙여넣어 주세요.',
      );
      return;
    }

    if (!looksLikeHtml(value)) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      window.alert('완성 HTML을 확인할 수 없습니다. <!DOCTYPE html>부터 </html>까지 포함된 전체 결과를 붙여넣거나 .html/.txt 파일을 불러오세요.');
    }
  }, true);
}
