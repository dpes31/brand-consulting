let installed = false;

function normalized(value: string | null | undefined): string {
  return (value || '').replace(/\s+/g, ' ').trim();
}

function looksLikeLegacyHtml(value: string): boolean {
  return /<!doctype\s+html|<html\b|<style\b|<script\b|class=["'][^"']*slide-wrapper|--hds-brand-accent/i.test(value);
}

function findPhase6Textarea(button: HTMLButtonElement): HTMLTextAreaElement | null {
  const panel = button.closest('div');
  const local = panel?.parentElement?.querySelector<HTMLTextAreaElement>('textarea');
  if (local) return local;

  return Array.from(document.querySelectorAll<HTMLTextAreaElement>('textarea')).find((textarea) => {
    const placeholder = textarea.placeholder || '';
    return placeholder.includes('외부') || placeholder.includes('html') || placeholder.includes('JSON');
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
    const value = textarea?.value.trim() || '';
    if (!looksLikeLegacyHtml(value)) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    window.alert(
      '이 결과는 이전 HTML 생성 프롬프트로 만든 구형 HTML입니다.\n\n' +
      '현재 Phase 6에는 ProductionReportV1 JSON이 필요합니다. ' +
      '앱에서 새 Phase 6 프롬프트를 다시 다운로드한 뒤, 외부 AI가 반환한 ```json ... ``` 전체를 붙여넣어 주세요.',
    );
  }, true);
}
