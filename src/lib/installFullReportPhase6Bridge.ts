import { buildCreativeHistoryCompilerDirective } from './creativeHistoryContract';
import { loadApprovedPilotBaseHtml } from '../report/fullReportCompilerV3';
import {
  buildSemanticHtmlPromptV5,
  compileSemanticHtmlReportV5,
  createSemanticHtmlTemplateV5,
} from '../report/semanticHtmlReportV5';

const PHASE_INPUTS_SESSION_KEY = 'brand-consulting:phase-inputs';
const ACTIVE_BRAND_SESSION_KEYS = [
  'brand-consulting:active-brand',
  'brand-consulting:brand-name',
] as const;
const REQUIRED_PHASE_STEPS = ['0', '1', '2', '3', '4', '5'] as const;
const BASE_KEY_PREFIX = 'brand-consulting:phase6-semantic-html-v5:';

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

function readResearchSnapshot(): { rawResearch: string; missingSteps: string[] } {
  try {
    const raw = sessionStorage.getItem(PHASE_INPUTS_SESSION_KEY);
    if (!raw) return { rawResearch: '', missingSteps: [...REQUIRED_PHASE_STEPS] };
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
    return { rawResearch, missingSteps };
  } catch {
    return { rawResearch: '', missingSteps: [...REQUIRED_PHASE_STEPS] };
  }
}

function baseStorageKey(brandName: string): string {
  return `${BASE_KEY_PREFIX}${brandName.trim()}`;
}

async function loadExactApprovedBase(brandName: string): Promise<string> {
  try {
    const stored = sessionStorage.getItem(baseStorageKey(brandName));
    if (stored?.trim()) return stored;
  } catch {
    // Recapture below.
  }
  const base = await loadApprovedPilotBaseHtml(brandName);
  try {
    sessionStorage.setItem(baseStorageKey(brandName), base);
  } catch {
    // The current operation can still use the in-memory base.
  }
  return base;
}

function downloadPrompt(prompt: string, brandName: string): void {
  const blob = new Blob([prompt], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `phase6_complete_html_prompt_${brandName || 'brand'}.txt`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
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

async function handlePromptExport(event: MouseEvent, button: HTMLButtonElement): Promise<void> {
  stopReactClick(event);
  const brandName = readBrandName();
  const { rawResearch, missingSteps } = readResearchSnapshot();
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
  button.textContent = '40페이지 의미 필드 준비 중...';
  try {
    const approvedBase = await loadApprovedPilotBaseHtml(brandName);
    try {
      sessionStorage.setItem(baseStorageKey(brandName), approvedBase);
    } catch {
      // Continue with the current in-memory base.
    }
    const semanticTemplate = createSemanticHtmlTemplateV5(approvedBase, brandName);
    const prompt = buildSemanticHtmlPromptV5(
      rawResearch,
      brandName,
      semanticTemplate.html,
      buildCreativeHistoryCompilerDirective(rawResearch),
    );
    await copyText(prompt);
    downloadPrompt(prompt, brandName);
    window.alert(
      '완성 HTML 작성 프롬프트를 복사하고 파일로 저장했다.\n\n'
      + '외부 AI는 Step 0~5 조사 내용을 의미 필드에 작성하고, 최종 결과로 40페이지 HTML 전체를 반환한다.',
    );
  } catch (error) {
    window.alert(`Phase 6 프롬프트 생성 오류: ${error instanceof Error ? error.message : String(error)}`);
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
  if (textarea.dataset.phase6CompiledHtmlV5 === 'true') {
    delete textarea.dataset.phase6CompiledHtmlV5;
    return;
  }

  stopReactClick(event);
  const brandName = readBrandName();
  const { rawResearch, missingSteps } = readResearchSnapshot();
  if (!textarea.value.trim()) {
    window.alert('외부 AI가 생성한 완성 HTML 전체를 입력창에 붙여넣어야 한다.');
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
  button.textContent = 'HTML 의미 필드 검증 중...';
  try {
    const approvedBase = await loadExactApprovedBase(brandName);
    const compiledHtml = compileSemanticHtmlReportV5(textarea.value, approvedBase, brandName)
      .replace(/\[cite[:\s]*\d*[\],]*/g, '')
      .replace(/\[cite_start\]/g, '')
      .replace(/\\cite\{[^}]*\}/g, '');

    setControlledTextareaValue(textarea, compiledHtml);
    textarea.dataset.phase6CompiledHtmlV5 = 'true';
    window.setTimeout(() => button.click(), 0);
  } catch (error) {
    window.alert(`FULL 보고서 검증 오류: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    button.disabled = false;
    button.textContent = originalText;
  }
}

function refreshPhase6Copy(): void {
  if (refreshing) return;
  refreshing = true;
  try {
    const textarea = findPhase6Textarea();
    if (textarea) {
      textarea.placeholder = '외부 AI가 반환한 40페이지 완성 HTML 전체를 붙여넣으세요. 앱이 Script를 제거하고 의미 필드와 승인 DOM을 검증합니다.';
    }
    document.querySelectorAll<HTMLElement>('div, p').forEach((element) => {
      const text = normalizeText(element.textContent);
      if (text === '외부 AI 수동 렌더링') element.textContent = '외부 AI 완성 HTML 생성';
      if (text.includes('무료 제미나이 웹을 사용해 렌더링 비용을 없앱니다.')) {
        element.textContent = '외부 AI는 완성 HTML을 작성하고, 앱은 승인된 40페이지 구조와 의미 필드를 검증합니다.';
      }
      if (text === '수집된 데이터를 바탕으로 04번 보고서 양식 결과물을 생성합니다.') {
        element.textContent = 'Step 0~5 조사 내용을 승인된 40페이지 HTML 보고서로 완성합니다.';
      }
    });
    const promptButton = Array.from(document.querySelectorAll<HTMLButtonElement>('button'))
      .find((candidate) => normalizeText(candidate.textContent).includes('프롬프트 추출'));
    if (promptButton) promptButton.textContent = '완성 HTML 프롬프트 다운로드';
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

    if (label.includes('프롬프트 추출') || label.includes('완성 HTML 프롬프트')) {
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
