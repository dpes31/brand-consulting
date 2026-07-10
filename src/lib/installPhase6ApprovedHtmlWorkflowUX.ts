let installed = false;
let refreshing = false;

const WORKFLOW_ID = 'phase6-approved-html-workflow';
const PROMPT_LABEL = '완성 HTML 프롬프트 다운로드';
const RENDER_LABEL = 'HTML 검증 후 48페이지 보고서 열기';
const INPUT_PLACEHOLDER = '외부 AI가 반환한 <!DOCTYPE html>부터 </html>까지의 완성 HTML 전체를 붙여넣으세요.';

function normalized(value: string | null | undefined): string {
  return (value || '').replace(/\s+/g, ' ').trim();
}

function findButton(labels: string[]): HTMLButtonElement | null {
  return Array.from(document.querySelectorAll<HTMLButtonElement>('button'))
    .find((button) => labels.some((label) => normalized(button.textContent).includes(label))) || null;
}

function findTextarea(): HTMLTextAreaElement | null {
  return document.querySelector<HTMLTextAreaElement>('textarea[data-phase6-input-mode="approved-html"]')
    || Array.from(document.querySelectorAll<HTMLTextAreaElement>('textarea')).find((textarea) => /외부|html/i.test(textarea.placeholder || ''))
    || null;
}

function commonAncestor(first: Element, second: Element): HTMLElement | null {
  let node: HTMLElement | null = first instanceof HTMLElement ? first : first.parentElement;
  while (node && !node.contains(second)) node = node.parentElement;
  return node;
}

function setControlledTextareaValue(textarea: HTMLTextAreaElement, value: string): void {
  const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set;
  if (!setter) return;
  setter.call(textarea, value);
  textarea.dispatchEvent(new Event('input', { bubbles: true }));
  textarea.dispatchEvent(new Event('change', { bubbles: true }));
}

function makeStep(index: number, copy: string): HTMLLIElement {
  const item = document.createElement('li');
  item.className = 'rounded-lg border border-[#2DD4BF]/20 bg-black/20 px-3 py-2 text-[10px] leading-snug text-slate-300';
  const number = document.createElement('b');
  number.className = 'mr-1 text-[#2DD4BF]';
  number.textContent = `${index}.`;
  item.append(number, document.createTextNode(copy));
  return item;
}

function makeHeader(): HTMLElement {
  const header = document.createElement('div');
  header.className = 'flex items-start justify-between gap-4 border-b border-[#2DD4BF]/20 pb-3';

  const copy = document.createElement('div');
  const title = document.createElement('h4');
  title.className = 'text-base font-black text-[#2DD4BF]';
  title.textContent = '외부 AI 완성 HTML 생성';
  const subtitle = document.createElement('p');
  subtitle.className = 'mt-1 text-[11px] leading-relaxed text-slate-400';
  subtitle.textContent = '승인한 40 Main + 8 Appendix 양식은 고정하고, 조사 내용만 의미 필드별로 교체합니다.';
  copy.append(title, subtitle);

  const button = document.createElement('button');
  button.type = 'button';
  button.dataset.phase6ApprovedPrompt = 'true';
  button.className = 'shrink-0 rounded-lg border border-[#2DD4BF]/40 bg-[#2DD4BF]/15 px-4 py-2 text-xs font-black text-[#2DD4BF] hover:bg-[#2DD4BF]/25';
  button.textContent = PROMPT_LABEL;

  header.append(copy, button);
  return header;
}

function installFileInput(container: HTMLElement, textarea: HTMLTextAreaElement): void {
  if (container.querySelector('[data-phase6-html-file]')) return;
  const row = document.createElement('div');
  row.className = 'flex items-center justify-between gap-3 mb-2';

  const label = document.createElement('label');
  label.className = 'text-xs font-bold text-slate-200';
  label.textContent = '외부 AI가 반환한 완성 HTML 붙여넣기';

  const upload = document.createElement('label');
  upload.className = 'cursor-pointer rounded-md border border-[#2DD4BF]/30 px-2.5 py-1.5 text-[10px] font-bold text-[#2DD4BF] hover:bg-[#2DD4BF]/10';
  upload.textContent = '.html / .txt 파일 불러오기';
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.html,.htm,.txt,text/html,text/plain';
  input.hidden = true;
  input.dataset.phase6HtmlFile = 'true';
  input.addEventListener('change', async () => {
    const file = input.files?.[0];
    if (!file) return;
    setControlledTextareaValue(textarea, await file.text());
    input.value = '';
  });
  upload.appendChild(input);
  row.append(label, upload);
  container.insertBefore(row, textarea);
}

function hideLegacyHeader(panel: HTMLElement, originalPromptButton: HTMLButtonElement): void {
  const promptContainer = originalPromptButton.parentElement;
  if (promptContainer && promptContainer.style.display !== 'none') promptContainer.style.display = 'none';

  Array.from(panel.querySelectorAll<HTMLElement>('div,p')).forEach((element) => {
    if (element.closest(`#${WORKFLOW_ID}`)) return;
    const value = normalized(element.textContent);
    if (value === '외부 AI 완성 HTML 생성'
      || value === '외부 AI 수동 렌더링'
      || value === '승인한 40 Main + 8 Appendix 양식은 고정하고 조사 내용만 의미 필드별로 교체합니다.'
      || value === '승인한 40 Main + 8 Appendix 양식은 고정하고, 조사 내용만 의미 필드별로 교체합니다.') {
      element.style.display = 'none';
    }
  });
}

function refresh(): void {
  if (refreshing) return;
  refreshing = true;
  try {
    const originalPromptButton = findButton(['프롬프트 추출', PROMPT_LABEL]);
    const renderButton = findButton(['결과물 뷰어에 렌더링하기', RENDER_LABEL]);
    const textarea = findTextarea();
    if (!originalPromptButton || !renderButton || !textarea) return;

    if (normalized(renderButton.textContent) !== RENDER_LABEL && !renderButton.dataset.fullReportBusy) {
      renderButton.textContent = RENDER_LABEL;
    }
    if (textarea.dataset.phase6InputMode !== 'approved-html') textarea.dataset.phase6InputMode = 'approved-html';
    if (textarea.placeholder !== INPUT_PLACEHOLDER) textarea.placeholder = INPUT_PLACEHOLDER;

    const panel = commonAncestor(originalPromptButton, renderButton);
    if (!panel) return;
    if (panel.dataset.phase6Panel !== 'approved-html') panel.dataset.phase6Panel = 'approved-html';

    hideLegacyHeader(panel, originalPromptButton);

    if (!panel.querySelector(`#${WORKFLOW_ID}`)) {
      const workflow = document.createElement('section');
      workflow.id = WORKFLOW_ID;
      workflow.className = 'w-full flex flex-col gap-3 text-left';
      workflow.appendChild(makeHeader());

      const steps = document.createElement('ol');
      steps.className = 'grid grid-cols-1 sm:grid-cols-5 gap-2';
      [
        '완성 HTML 프롬프트 다운로드',
        '다운로드 파일을 외부 AI에 첨부',
        'AI가 반환한 HTML 전체 복사',
        'Phase 6 입력창에 HTML 붙여넣기',
        'HTML 검증 후 48페이지 보고서 열기',
      ].forEach((copy, index) => steps.appendChild(makeStep(index + 1, copy)));

      const notice = document.createElement('div');
      notice.className = 'rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs font-bold text-amber-200';
      notice.textContent = 'JSON이 아닙니다. 외부 AI는 승인 양식의 완성 HTML을 반환합니다.';

      const lock = document.createElement('p');
      lock.className = 'text-[10px] leading-relaxed text-slate-400';
      lock.textContent = '앱은 Script를 제거하고, 48페이지 구조·페이지별 의미 필드·고정 라벨·1280×720·텍스트 길이를 검증한 뒤 승인 샘플 레이아웃에 내용만 적용합니다.';

      workflow.append(steps, notice, lock);
      textarea.parentElement?.insertBefore(workflow, textarea);
    }

    const inputContainer = textarea.parentElement;
    if (inputContainer) installFileInput(inputContainer, textarea);
  } finally {
    refreshing = false;
  }
}

export function installPhase6ApprovedHtmlWorkflowUX(): void {
  if (installed || typeof document === 'undefined') return;
  installed = true;
  const observer = new MutationObserver(refresh);
  observer.observe(document.documentElement, { subtree: true, childList: true });
  window.addEventListener('DOMContentLoaded', refresh);
  window.setTimeout(refresh, 350);
}
