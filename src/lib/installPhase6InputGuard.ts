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

  return Array.from(document.querySelectorAll<HTMLTextAreaElement>('textarea')).find((textarea) => {
    const placeholder = textarea.placeholder || '';
    return placeholder.includes('외부') || placeholder.includes('html') || placeholder.includes('HTML');
  }) || null;
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
    if (!label.includes('결과물 뷰어에 렌더링하기')) return;

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
        '이 결과는 이전 Phase 6의 ProductionReportV1 JSON입니다.\n\n' +
        '현재 Phase 6는 승인된 48페이지 양식에 조사 내용을 채운 완성 HTML 전체가 필요합니다. ' +
        '앱에서 Phase 6 프롬프트를 다시 다운로드한 뒤, 외부 AI가 반환한 ```html ... ``` 전체를 붙여넣어 주세요.',
      );
      return;
    }

    if (!looksLikeHtml(value)) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      window.alert('완성 HTML을 확인할 수 없습니다. <!DOCTYPE html>부터 </html>까지 포함된 전체 결과를 붙여넣어 주세요.');
    }
  }, true);
}
