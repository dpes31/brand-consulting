import { EXTERNAL_AI_EXECUTION_MESSAGE } from './userBriefLock';

let installed = false;
let refreshing = false;

function normalize(value: string | null | undefined): string {
  return (value || '').replace(/\s+/g, ' ').trim();
}

function findPhase6Textarea(): HTMLTextAreaElement | null {
  return Array.from(document.querySelectorAll<HTMLTextAreaElement>('textarea')).find((textarea) => {
    const placeholder = textarea.placeholder || '';
    return /외부 AI|완성 HTML|40페이지/.test(placeholder);
  }) || null;
}

function setControlledValue(textarea: HTMLTextAreaElement, value: string): void {
  const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set;
  if (!setter) throw new Error('Phase 6 입력창을 갱신할 수 없다.');
  setter.call(textarea, value);
  textarea.dispatchEvent(new Event('input', { bubbles: true }));
  textarea.dispatchEvent(new Event('change', { bubbles: true }));
}

async function copyExecutionMessage(): Promise<void> {
  try {
    await navigator.clipboard.writeText(EXTERNAL_AI_EXECUTION_MESSAGE);
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = EXTERNAL_AI_EXECUTION_MESSAGE;
    textarea.style.cssText = 'position:fixed;left:-9999px;top:0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
  }
}

function statusNode(panel: HTMLElement): HTMLElement {
  let status = panel.querySelector<HTMLElement>('[data-phase6-upload-status="true"]');
  if (!status) {
    status = document.createElement('p');
    status.dataset.phase6UploadStatus = 'true';
    status.className = 'text-[10px] text-slate-500';
    status.textContent = '붙여넣기와 파일 업로드는 동일한 Sanitizer·의미 필드·Identity 검증 경로를 사용합니다.';
    panel.appendChild(status);
  }
  return status;
}

function installPanel(textarea: HTMLTextAreaElement): void {
  const parent = textarea.parentElement;
  if (!parent || parent.querySelector('[data-phase6-html-upload-panel="true"]')) return;

  const panel = document.createElement('section');
  panel.dataset.phase6HtmlUploadPanel = 'true';
  panel.className = 'mb-3 rounded-xl border border-[#2DD4BF]/25 bg-black/20 p-3 space-y-3';

  const commandRow = document.createElement('div');
  commandRow.className = 'flex items-start justify-between gap-3';
  const commandCopy = document.createElement('div');
  const commandLabel = document.createElement('strong');
  commandLabel.className = 'block text-[11px] font-black text-[#2DD4BF]';
  commandLabel.textContent = '외부 AI에 파일과 함께 보낼 실행문';
  const commandText = document.createElement('p');
  commandText.className = 'mt-1 text-[11px] leading-relaxed text-slate-300';
  commandText.textContent = EXTERNAL_AI_EXECUTION_MESSAGE;
  commandCopy.append(commandLabel, commandText);

  const copyButton = document.createElement('button');
  copyButton.type = 'button';
  copyButton.className = 'shrink-0 rounded-lg border border-[#2DD4BF]/40 px-3 py-2 text-[10px] font-black text-[#2DD4BF] hover:bg-[#2DD4BF]/10';
  copyButton.textContent = '실행문 복사';
  copyButton.addEventListener('click', async () => {
    await copyExecutionMessage();
    copyButton.textContent = '복사 완료';
    window.setTimeout(() => { copyButton.textContent = '실행문 복사'; }, 1500);
  });
  commandRow.append(commandCopy, copyButton);

  const uploadRow = document.createElement('div');
  uploadRow.className = 'flex items-center gap-3 border-t border-white/10 pt-3';
  const uploadLabel = document.createElement('label');
  uploadLabel.className = 'cursor-pointer rounded-lg bg-[#2DD4BF]/15 border border-[#2DD4BF]/35 px-4 py-2 text-xs font-black text-[#2DD4BF] hover:bg-[#2DD4BF]/25';
  uploadLabel.textContent = 'HTML 파일 불러오기';
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.html,.htm,.txt,text/html,text/plain';
  input.hidden = true;
  input.dataset.phase6HtmlFile = 'true';
  uploadLabel.appendChild(input);

  const description = document.createElement('p');
  description.className = 'text-[11px] text-slate-400';
  description.textContent = '.html / .htm / .txt · 최대 20MB';
  uploadRow.append(uploadLabel, description);
  panel.append(commandRow, uploadRow);
  const status = statusNode(panel);

  input.addEventListener('change', async () => {
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      status.textContent = `파일이 20MB를 초과합니다: ${(file.size / 1024 / 1024).toFixed(1)}MB`;
      status.className = 'text-[10px] text-red-400';
      return;
    }
    if (!/\.(?:html?|txt)$/i.test(file.name)) {
      status.textContent = '지원 형식은 .html, .htm, .txt입니다.';
      status.className = 'text-[10px] text-red-400';
      return;
    }
    try {
      const content = await file.text();
      if (!/<!doctype\s+html|<html\b/i.test(content)) throw new Error('완전한 HTML 문서를 확인할 수 없습니다.');
      setControlledValue(textarea, content);
      status.textContent = `${file.name} · ${(file.size / 1024).toFixed(0)}KB를 입력창에 불러왔습니다. 아래 렌더링 버튼으로 동일 검증을 실행하십시오.`;
      status.className = 'text-[10px] text-[#2DD4BF]';
    } catch (error) {
      status.textContent = error instanceof Error ? error.message : String(error);
      status.className = 'text-[10px] text-red-400';
    }
  });

  parent.insertBefore(panel, textarea);
}

function refresh(): void {
  if (refreshing) return;
  refreshing = true;
  try {
    const textarea = findPhase6Textarea();
    if (textarea) installPanel(textarea);
    const promptButton = Array.from(document.querySelectorAll<HTMLButtonElement>('button'))
      .find((button) => normalize(button.textContent).includes('완성 HTML 프롬프트 다운로드'));
    if (promptButton) promptButton.title = '프롬프트 파일 다운로드 후 실행문을 외부 AI 메시지에 함께 전송하십시오.';
  } finally {
    refreshing = false;
  }
}

export function installPhase6HtmlUpload(): void {
  if (installed || typeof document === 'undefined') return;
  installed = true;
  const observer = new MutationObserver(refresh);
  observer.observe(document.documentElement, { subtree: true, childList: true });
  window.addEventListener('DOMContentLoaded', refresh);
  window.setTimeout(refresh, 500);
}
