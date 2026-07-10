let installed = false;

function normalized(value: string | null | undefined): string {
  return (value || '').replace(/\s+/g, ' ').trim();
}

function looksLikeHtml(value: string): boolean {
  return /<!doctype\s+html|<html\b/i.test(value);
}

function looksLikeStructuredJson(value: string): boolean {
  const text = value.trim().replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
  return text.startsWith('{')
    && /"version"\s*:\s*"3\.0\.0"/.test(text)
    && /"pages"\s*:/.test(text);
}

function findPhase6Textarea(
  button: HTMLButtonElement,
  mode: 'structured-json' | 'compat-html',
): HTMLTextAreaElement | null {
  return button.closest<HTMLElement>('[data-phase6-panel]')
    ?.querySelector<HTMLTextAreaElement>(`textarea[data-phase6-input-mode="${mode}"]`)
    || document.querySelector<HTMLTextAreaElement>(`textarea[data-phase6-input-mode="${mode}"]`)
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
    const action = button.dataset.phase6Action;
    const mode = action === 'compat-html' || label.includes('호환 HTML 검증 후 가져오기')
      ? 'compat-html'
      : action === 'structured-json'
        || label.includes('JSON 검증 후 40페이지 보고서 만들기')
        || label.includes('결과물 뷰어에 렌더링하기')
        ? 'structured-json'
        : null;
    if (!mode) return;

    const textarea = findPhase6Textarea(button, mode);
    if (textarea?.dataset.fullReportValidatedHtml === 'true') {
      delete textarea.dataset.fullReportValidatedHtml;
      return;
    }

    const value = textarea?.value.trim() || '';
    const valid = mode === 'structured-json' ? looksLikeStructuredJson(value) : looksLikeHtml(value);
    if (valid) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    window.alert(mode === 'structured-json'
      ? 'ProductionReportV3 JSON을 확인할 수 없습니다. JSON 전체를 붙여넣거나 .json/.txt 파일을 불러오세요.'
      : '호환용 완성 HTML 문서를 확인할 수 없습니다.');
  }, true);
}
