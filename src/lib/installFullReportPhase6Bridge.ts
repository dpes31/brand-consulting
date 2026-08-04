import { buildCreativeHistoryCompilerDirective } from './creativeHistoryContract';
import {
  getActiveCompetitorRegistry,
  parseCompetitorRegistry,
} from './competitorSelection';
import { getActiveUserBrief } from './userBriefContract';
import { loadApprovedPilotBaseHtml } from '../report/fullReportCompilerV3';
import {
  buildSemanticHtmlPromptV6,
  compileSemanticHtmlReportV6,
  createSemanticHtmlWorkbookV6,
} from '../report/semanticHtmlReportV6';
import {
  applyFinalReportIdentityPolicy,
  applyReportIdentityLockToExternalHtml,
  buildReportIdentityLock,
  sanitizeApprovedSampleBaseHtml,
} from '../report/reportIdentityLock';
import {
  buildPhase6PromptPackage,
  EXTERNAL_AI_EXECUTION_MESSAGE,
  normalizePhase6Error,
} from '../report/phase6PromptPackage';

const PHASE_INPUTS_SESSION_KEY = 'brand-consulting:phase-inputs';
const ACTIVE_BRAND_SESSION_KEYS = [
  'brand-consulting:active-brand',
  'brand-consulting:brand-name',
] as const;
const REQUIRED_PHASE_STEPS = ['0', '1', '2', '3', '4', '5'] as const;
const BASE_KEY_PREFIX = 'brand-consulting:phase6-semantic-html-v6:';
const MAX_HTML_FILE_BYTES = 20 * 1024 * 1024;

let installed = false;
let refreshing = false;

function normalizeText(value: string | null | undefined): string {
  return (value || '').replace(/\s+/g, ' ').trim();
}

function readBrandName(): string {
  const visible = document.querySelector<HTMLInputElement>('input[placeholder*="Enter brand name"]')?.value.trim();
  if (visible) return visible;
  try {
    for (const key of ACTIVE_BRAND_SESSION_KEYS) {
      const value = sessionStorage.getItem(key)?.trim();
      if (value) return value;
    }
  } catch {
    // Visible input remains the fallback.
  }
  return '';
}

function normalizeStepKey(value: string): string | null {
  const match = value.match(/(?:^|\D)([0-5])(?:\D|$)/);
  return match?.[1] ?? null;
}

type ResearchSnapshot = {
  rawResearch: string;
  missingSteps: string[];
  phaseInputs: Record<string, string>;
};

function readResearchSnapshot(): ResearchSnapshot {
  try {
    const raw = sessionStorage.getItem(PHASE_INPUTS_SESSION_KEY);
    if (!raw) return { rawResearch: '', missingSteps: [...REQUIRED_PHASE_STEPS], phaseInputs: {} };
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const values = new Map<string, string>();
    Object.entries(parsed).forEach(([key, value]) => {
      if (typeof value !== 'string' || !value.trim()) return;
      const normalizedKey = normalizeStepKey(key);
      if (normalizedKey) values.set(normalizedKey, value.trim());
    });
    const missingSteps = REQUIRED_PHASE_STEPS.filter((step) => !values.get(step));
    const rawResearch = REQUIRED_PHASE_STEPS
      .filter((step) => values.has(step))
      .map((step) => `\n\n## STEP ${step}\n${values.get(step)}`)
      .join('');
    return {
      rawResearch,
      missingSteps,
      phaseInputs: Object.fromEntries(values.entries()),
    };
  } catch {
    return { rawResearch: '', missingSteps: [...REQUIRED_PHASE_STEPS], phaseInputs: {} };
  }
}

function baseStorageKey(brandName: string): string {
  return `${BASE_KEY_PREFIX}${brandName.trim()}`;
}

async function loadExactApprovedBase(brandName: string): Promise<string> {
  try {
    const stored = sessionStorage.getItem(baseStorageKey(brandName));
    if (stored?.trim()) return sanitizeApprovedSampleBaseHtml(stored, brandName);
  } catch {
    // Recapture below.
  }
  const rawBase = await loadApprovedPilotBaseHtml(brandName);
  const base = sanitizeApprovedSampleBaseHtml(rawBase, brandName);
  try {
    sessionStorage.setItem(baseStorageKey(brandName), base);
  } catch {
    // The current operation can still use the in-memory base.
  }
  return base;
}

function downloadPrompt(prompt: string, brandName: string): number {
  const blob = new Blob([prompt], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `phase6_lightweight_html_prompt_${brandName || 'brand'}.txt`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
  return blob.size;
}

async function copyText(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.cssText = 'position:fixed;left:-9999px;top:0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
  }
}

function findPhase6Textarea(): HTMLTextAreaElement | null {
  return Array.from(document.querySelectorAll<HTMLTextAreaElement>('textarea')).find((textarea) => {
    const placeholder = textarea.getAttribute('placeholder') || '';
    return /외부|html|HTML|완성 보고서/.test(placeholder);
  }) || null;
}

function setControlledTextareaValue(textarea: HTMLTextAreaElement, value: string): void {
  const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set;
  if (!setter) throw new Error('Phase 6 입력창을 갱신할 수 없다.');
  setter.call(textarea, value);
  textarea.dispatchEvent(new Event('input', { bubbles: true }));
  textarea.dispatchEvent(new Event('change', { bubbles: true }));
}

function stopReactClick(event: MouseEvent): void {
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
}

function resolveIdentityContext(
  brandName: string,
  phaseInputs: Record<string, string>,
) {
  const brief = getActiveUserBrief(brandName);
  const registry = getActiveCompetitorRegistry() || parseCompetitorRegistry(phaseInputs['2']);
  const identityLock = buildReportIdentityLock(brandName, registry, brief);
  return { brief, identityLock };
}

async function handlePromptExport(event: MouseEvent, button: HTMLButtonElement): Promise<void> {
  stopReactClick(event);
  const brandName = readBrandName();
  const { rawResearch, missingSteps, phaseInputs } = readResearchSnapshot();
  if (!brandName) {
    window.alert('브랜드명을 확인할 수 없다. Phase 0에서 브랜드명을 다시 입력해야 한다.');
    return;
  }
  if (missingSteps.length || !rawResearch.trim()) {
    window.alert(`Step 0~5 조사 결과가 완전하지 않다. 누락 단계: ${missingSteps.join(', ') || '조사 원문'}`);
    return;
  }

  const originalText = normalizeText(button.textContent) || '프롬프트 추출';
  button.disabled = true;
  button.textContent = '경량 HTML·Identity Lock 준비 중...';
  try {
    const { brief, identityLock } = resolveIdentityContext(brandName, phaseInputs);
    const approvedBase = await loadExactApprovedBase(brandName);
    const semanticWorkbook = createSemanticHtmlWorkbookV6(approvedBase, brandName);
    const compilerPrompt = buildSemanticHtmlPromptV6(
      rawResearch,
      brandName,
      semanticWorkbook.html,
      buildCreativeHistoryCompilerDirective(rawResearch),
    );
    const prompt = buildPhase6PromptPackage(compilerPrompt, brief, identityLock);
    await copyText(EXTERNAL_AI_EXECUTION_MESSAGE);
    const promptBytes = downloadPrompt(prompt, brandName);
    const promptKilobytes = Math.ceil(promptBytes / 1024);
    window.alert(
      `경량 HTML 작성 프롬프트를 저장했다. (${promptKilobytes}KB)\n\n`
      + '고정 CSS·레이아웃·장식 DOM은 전송 파일에서 제외했다.\n'
      + '외부 AI 채팅에 파일을 첨부하고 클립보드의 실행 문장을 전송하십시오.\n'
      + '외부 AI 결과는 40페이지 의미 필드 HTML이며, 앱이 승인된 최종 Renderer로 조립합니다.',
    );
  } catch (error) {
    window.alert(`Phase 6 프롬프트 생성 오류: ${normalizePhase6Error(error, brandName).message}`);
  } finally {
    button.disabled = false;
    button.textContent = originalText;
  }
}

async function handleManualRender(
  event: MouseEvent,
  button: HTMLButtonElement,
  textarea: HTMLTextAreaElement,
): Promise<void> {
  if (textarea.dataset.phase6CompiledHtmlV6 === 'true') {
    delete textarea.dataset.phase6CompiledHtmlV6;
    return;
  }

  stopReactClick(event);
  const brandName = readBrandName();
  const { rawResearch, missingSteps, phaseInputs } = readResearchSnapshot();
  if (!textarea.value.trim()) {
    window.alert('외부 AI가 생성한 40페이지 HTML 전체를 붙여넣거나 .html 파일을 불러와야 한다.');
    return;
  }
  if (!brandName) {
    window.alert('브랜드명을 확인할 수 없다. Phase 0에서 브랜드명을 다시 입력해야 한다.');
    return;
  }
  if (missingSteps.length || !rawResearch.trim()) {
    window.alert('Step 0~5 조사 원문을 확인할 수 없어 보고서 내용의 일관성을 검증할 수 없다.');
    return;
  }

  const originalText = normalizeText(button.textContent) || '결과물 뷰어에 렌더링하기';
  button.disabled = true;
  button.textContent = 'Brief·Identity·경량 HTML 검증 중...';
  try {
    const { identityLock } = resolveIdentityContext(brandName, phaseInputs);
    const approvedBase = await loadExactApprovedBase(brandName);
    const identityLockedOutput = applyReportIdentityLockToExternalHtml(textarea.value, identityLock);
    const compiled = compileSemanticHtmlReportV6(identityLockedOutput, approvedBase, brandName)
      .replace(/\[cite[:\s]*\d*[\],]*/g, '')
      .replace(/\[cite_start\]/g, '')
      .replace(/\\cite\{[^}]*\}/g, '');
    const compiledHtml = applyFinalReportIdentityPolicy(compiled, identityLock);

    setControlledTextareaValue(textarea, compiledHtml);
    textarea.dataset.phase6CompiledHtmlV6 = 'true';
    window.setTimeout(() => button.click(), 0);
  } catch (error) {
    window.alert(`FULL 보고서 검증 오류: ${normalizePhase6Error(error, brandName).message}`);
  } finally {
    button.disabled = false;
    button.textContent = originalText;
  }
}

function ensureExecutionCommand(textarea: HTMLTextAreaElement): void {
  const parent = textarea.parentElement;
  if (!parent || parent.querySelector('[data-phase6-execution-command]')) return;
  const panel = document.createElement('div');
  panel.dataset.phase6ExecutionCommand = 'true';
  panel.className = 'mb-3 rounded-lg border border-amber-400/30 bg-amber-400/10 p-3 text-left';

  const heading = document.createElement('div');
  heading.className = 'mb-1 text-[11px] font-black text-amber-200';
  heading.textContent = '외부 AI에 파일과 함께 전송할 실행 문장';
  const copy = document.createElement('p');
  copy.className = 'text-[10px] leading-relaxed text-slate-300';
  copy.textContent = EXTERNAL_AI_EXECUTION_MESSAGE;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'mt-2 rounded-md border border-amber-300/30 px-2.5 py-1.5 text-[10px] font-bold text-amber-200 hover:bg-amber-300/10';
  button.textContent = '실행 문장 복사';
  button.addEventListener('click', () => {
    void copyText(EXTERNAL_AI_EXECUTION_MESSAGE).then(() => {
      button.textContent = '복사 완료';
      window.setTimeout(() => { button.textContent = '실행 문장 복사'; }, 1500);
    });
  });
  panel.append(heading, copy, button);
  parent.insertBefore(panel, textarea);
}

function ensureHtmlFileUpload(textarea: HTMLTextAreaElement): void {
  const parent = textarea.parentElement;
  if (!parent || parent.querySelector('[data-phase6-html-upload-row]')) return;
  const row = document.createElement('div');
  row.dataset.phase6HtmlUploadRow = 'true';
  row.className = 'mb-2 flex items-center justify-between gap-3';

  const status = document.createElement('span');
  status.className = 'min-w-0 flex-1 truncate text-[10px] text-slate-400';
  status.textContent = '경량 HTML 코드 붙여넣기 또는 파일 업로드';

  const label = document.createElement('label');
  label.className = 'shrink-0 cursor-pointer rounded-md border border-[#2DD4BF]/35 px-3 py-1.5 text-[10px] font-bold text-[#2DD4BF] hover:bg-[#2DD4BF]/10';
  label.textContent = '.html / .htm / .txt 불러오기';

  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.html,.htm,.txt,text/html,text/plain';
  input.hidden = true;
  input.dataset.phase6HtmlUpload = 'true';
  input.addEventListener('change', async () => {
    const file = input.files?.[0];
    if (!file) return;
    try {
      if (file.size > MAX_HTML_FILE_BYTES) {
        throw new Error(`파일이 너무 크다. 최대 ${MAX_HTML_FILE_BYTES / 1024 / 1024}MB까지 지원한다.`);
      }
      const value = await file.text();
      if (!value.trim()) throw new Error('선택한 파일이 비어 있다.');
      setControlledTextareaValue(textarea, value);
      textarea.dataset.phase6UploadName = file.name;
      status.textContent = `${file.name} · ${(file.size / 1024).toFixed(0)}KB 불러오기 완료`;
      status.className = 'min-w-0 flex-1 truncate text-[10px] font-bold text-[#2DD4BF]';
    } catch (error) {
      status.textContent = error instanceof Error ? error.message : String(error);
      status.className = 'min-w-0 flex-1 truncate text-[10px] font-bold text-red-400';
    } finally {
      input.value = '';
    }
  });

  label.appendChild(input);
  row.append(status, label);
  parent.insertBefore(row, textarea);
}

function refreshPhase6Copy(): void {
  if (refreshing) return;
  refreshing = true;
  try {
    const textarea = findPhase6Textarea();
    if (textarea) {
      textarea.placeholder = '외부 AI가 반환한 경량 40페이지 HTML을 붙여넣거나 파일로 불러오세요. 앱이 승인된 시각 Renderer에 조립하고 검증합니다.';
      ensureExecutionCommand(textarea);
      ensureHtmlFileUpload(textarea);
    }
    document.querySelectorAll<HTMLElement>('div, p').forEach((element) => {
      const text = normalizeText(element.textContent);
      if (text === '외부 AI 수동 렌더링') element.textContent = '외부 AI 40페이지 HTML 생성';
      if (text === '무료 제미나이 웹을 사용해 렌더링 비용을 없앱니다.') {
        element.textContent = '외부 AI는 경량 의미 필드 HTML을 작성하고, 앱은 승인된 최종 시각 Renderer로 조립합니다.';
      }
      if (text === '수집된 데이터를 바탕으로 04번 보고서 양식 결과물을 생성합니다.') {
        element.textContent = 'Step 0~5 조사와 User Brief를 40페이지 HTML 보고서로 완성합니다.';
      }
    });
    const promptButton = Array.from(document.querySelectorAll<HTMLButtonElement>('button'))
      .find((candidate) => normalizeText(candidate.textContent).includes('프롬프트 추출'));
    if (promptButton) promptButton.textContent = '완성 HTML 프롬프트 다운로드 (경량)';
  } finally {
    refreshing = false;
  }
}

export function installFullReportPhase6Bridge(): void {
  if (installed || typeof document === 'undefined') return;
  installed = true;

  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const button = target.closest('button');
    if (!(button instanceof HTMLButtonElement)) return;
    const label = normalizeText(button.textContent);

    if (label.includes('프롬프트 추출') || label.includes('HTML 프롬프트')) {
      void handlePromptExport(event, button);
      return;
    }
    if (label.includes('결과물 뷰어에 렌더링하기') || label.includes('40페이지 보고서 만들기')) {
      const textarea = findPhase6Textarea();
      if (textarea) void handleManualRender(event, button, textarea);
    }
  }, true);

  const observer = new MutationObserver(refreshPhase6Copy);
  observer.observe(document.documentElement, { subtree: true, childList: true });
  window.addEventListener('DOMContentLoaded', refreshPhase6Copy);
  window.setTimeout(refreshPhase6Copy, 500);
}
