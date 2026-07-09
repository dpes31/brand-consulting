let installed = false;
let refreshing = false;

const WORKFLOW_ID = 'phase6-external-json-workflow';
const COMPATIBILITY_ID = 'phase6-compatibility-html';
const PROMPT_LABEL = '외부 AI용 JSON 프롬프트 다운로드';
const RENDER_LABEL = 'JSON 검증 후 40페이지 보고서 만들기';

function normalized(value: string | null | undefined): string {
  return (value || '').replace(/\s+/g, ' ').trim();
}

function findButton(matcher: (label: string) => boolean): HTMLButtonElement | null {
  return Array.from(document.querySelectorAll<HTMLButtonElement>('button'))
    .find((button) => matcher(normalized(button.textContent))) || null;
}

function findLegacyPhase6Textarea(): HTMLTextAreaElement | null {
  return Array.from(document.querySelectorAll<HTMLTextAreaElement>('textarea'))
    .find((textarea) => {
      const placeholder = textarea.placeholder || '';
      return /외부 제미나이|<html|ProductionReportV3|구조화 JSON/i.test(placeholder);
    }) || null;
}

function commonAncestor(first: Element, second: Element): HTMLElement | null {
  let node: HTMLElement | null = first instanceof HTMLElement ? first : first.parentElement;
  while (node && !node.contains(second)) node = node.parentElement;
  return node;
}

function makeStep(index: number, copy: string): HTMLLIElement {
  const item = document.createElement('li');
  item.className = 'rounded-lg border border-[#2DD4BF]/20 bg-black/20 px-2.5 py-2 text-[10px] leading-snug text-slate-300';
  const number = document.createElement('b');
  number.className = 'mr-1 text-[#2DD4BF]';
  number.textContent = `${index}.`;
  item.append(number, document.createTextNode(copy));
  return item;
}

function setControlledTextareaValue(textarea: HTMLTextAreaElement, value: string): void {
  const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set;
  if (!setter) return;
  setter.call(textarea, value);
  textarea.dispatchEvent(new Event('input', { bubbles: true }));
  textarea.dispatchEvent(new Event('change', { bubbles: true }));
}

function installResponseFileInput(container: HTMLElement, textarea: HTMLTextAreaElement): void {
  if (container.querySelector('[data-phase6-response-file]')) return;
  const row = document.createElement('div');
  row.className = 'flex items-center justify-between gap-3';

  const label = document.createElement('label');
  label.className = 'text-xs font-bold text-slate-200';
  label.textContent = '외부 AI가 반환한 JSON 붙여넣기';

  const upload = document.createElement('label');
  upload.className = 'cursor-pointer rounded-md border border-[#2DD4BF]/30 px-2.5 py-1.5 text-[10px] font-bold text-[#2DD4BF] hover:bg-[#2DD4BF]/10';
  upload.textContent = '.json / .txt 응답 파일 불러오기';
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json,.txt,application/json,text/plain';
  input.hidden = true;
  input.dataset.phase6ResponseFile = 'true';
  input.addEventListener('change', async () => {
    const file = input.files?.[0];
    if (!file) return;
    setControlledTextareaValue(textarea, await file.text());
    input.value = '';
  });
  upload.appendChild(input);
  row.append(label, upload);
  container.appendChild(row);
}

function installCompatibilityArea(panel: HTMLElement, primaryButton: HTMLButtonElement): void {
  if (panel.querySelector(`#${COMPATIBILITY_ID}`)) return;
  const details = document.createElement('details');
  details.id = COMPATIBILITY_ID;
  details.dataset.phase6Panel = 'true';
  details.className = 'rounded-lg border border-white/10 bg-black/20 p-3 text-left';

  const summary = document.createElement('summary');
  summary.className = 'cursor-pointer text-xs font-bold text-slate-400';
  summary.textContent = '기존 완성 HTML 가져오기 — 호환용';

  const note = document.createElement('p');
  note.className = 'mt-2 text-[10px] leading-relaxed text-slate-500';
  note.textContent = '기존 결과물 복구를 위한 보조 경로입니다. 새 보고서는 위 구조화 JSON 방식을 사용하세요.';

  const textarea = document.createElement('textarea');
  textarea.dataset.phase6InputMode = 'compat-html';
  textarea.className = 'mt-2 w-full min-h-[90px] p-3 bg-black/40 border border-white/10 rounded-lg text-xs outline-none focus:border-slate-500 resize-y text-slate-300 placeholder:text-slate-600';
  textarea.placeholder = '기존 완성 HTML 문서를 붙여넣으세요.';

  const button = document.createElement('button');
  button.type = 'button';
  button.dataset.phase6Action = 'compat-html';
  button.dataset.phase6PrimaryButtonId = primaryButton.id || 'phase6-primary-json-render';
  button.className = 'mt-2 w-full py-2 border border-white/15 text-slate-300 font-bold rounded-lg hover:bg-white/5 text-xs disabled:opacity-40 transition';
  button.textContent = '호환 HTML 검증 후 가져오기';

  details.append(summary, note, textarea, button);
  panel.appendChild(details);
}

function refresh(): void {
  if (refreshing) return;
  refreshing = true;
  try {
    const promptButton = findButton((label) => label.includes('프롬프트 추출') || label.includes(PROMPT_LABEL));
    const renderButton = findButton((label) => label.includes('결과물 뷰어에 렌더링하기') || label.includes(RENDER_LABEL));
    const textarea = findLegacyPhase6Textarea()
      || document.querySelector<HTMLTextAreaElement>('textarea[data-phase6-input-mode="structured-json"]');
    if (!promptButton || !renderButton || !textarea) return;

    promptButton.dataset.phase6Action = 'prompt-download';
    if (normalized(promptButton.textContent) !== PROMPT_LABEL) promptButton.textContent = PROMPT_LABEL;
    renderButton.dataset.phase6Action = 'structured-json';
    renderButton.id = 'phase6-primary-json-render';
    if (normalized(renderButton.textContent) !== RENDER_LABEL) renderButton.textContent = RENDER_LABEL;
    textarea.dataset.phase6InputMode = 'structured-json';
    textarea.placeholder = '외부 AI가 반환한 ProductionReportV3 JSON 전체를 붙여넣으세요. Raw JSON과 ```json 코드펜스를 지원합니다.';

    const panel = commonAncestor(promptButton, renderButton);
    if (!panel) return;
    panel.dataset.phase6Panel = 'true';

    const title = Array.from(panel.querySelectorAll<HTMLElement>('div'))
      .find((element) => ['외부 AI 수동 렌더링', '외부 AI 완성 HTML 생성', '외부 AI 구조화 JSON 생성'].includes(normalized(element.textContent)));
    if (title) title.textContent = '외부 AI 구조화 JSON 방식';

    const subtitle = Array.from(panel.querySelectorAll<HTMLElement>('div'))
      .find((element) => normalized(element.textContent).includes('무료 제미나이 웹')
        || normalized(element.textContent).includes('페이지별 JSON 값만'));
    if (subtitle) subtitle.textContent = '외부 AI는 JSON 값만 생성하고 앱이 승인된 40페이지 HTML을 렌더링합니다.';

    let workflow = panel.querySelector<HTMLElement>(`#${WORKFLOW_ID}`);
    if (!workflow) {
      workflow = document.createElement('section');
      workflow.id = WORKFLOW_ID;
      workflow.className = 'w-full flex flex-col gap-3 text-left';

      const steps = document.createElement('ol');
      steps.className = 'grid grid-cols-1 sm:grid-cols-5 gap-2';
      [
        PROMPT_LABEL,
        '다운로드 파일을 외부 AI에 첨부',
        'AI가 반환한 JSON 전체 복사',
        'Phase 6 입력창에 JSON 붙여넣기',
        RENDER_LABEL,
      ].forEach((copy, index) => steps.appendChild(makeStep(index + 1, copy)));

      const notice = document.createElement('div');
      notice.className = 'rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs font-bold text-amber-200';
      notice.textContent = 'HTML은 외부 AI가 아니라 앱이 자동 생성합니다.';

      workflow.append(steps, notice);
      textarea.parentElement?.insertBefore(workflow, textarea);
    }

    const inputContainer = textarea.parentElement;
    if (inputContainer) installResponseFileInput(inputContainer, textarea);
    installCompatibilityArea(panel, renderButton);
  } finally {
    refreshing = false;
  }
}

export function installPhase6ExternalJsonWorkflowUX(): void {
  if (installed || typeof document === 'undefined') return;
  installed = true;
  const observer = new MutationObserver(refresh);
  observer.observe(document.documentElement, { subtree: true, childList: true });
  window.addEventListener('DOMContentLoaded', refresh);
  window.setTimeout(refresh, 300);
}
