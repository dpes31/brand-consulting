import { buildCreativeHistoryCompilerDirective } from './creativeHistoryContract';
import {
  assertApprovedFullReportHtml,
  buildFullReportHtmlPrompt,
  extractCompleteFullReportHtml,
  loadApprovedPilotBaseHtml,
} from '../report/fullReportCompiler';

const PHASE_INPUTS_SESSION_KEY = 'brand-consulting:phase-inputs';
const ACTIVE_BRAND_SESSION_KEYS = [
  'brand-consulting:active-brand',
  'brand-consulting:brand-name',
] as const;
const REQUIRED_PHASE_STEPS = ['0', '1', '2', '3', '4', '5'] as const;

let installed = false;
let replayingRenderClick = false;

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
    // Visible input remains the fallback when storage is unavailable.
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

function downloadPrompt(prompt: string, brandName: string): void {
  const blob = new Blob([prompt], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `full_report_phase6_prompt_${brandName || 'brand'}.txt`;
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

function setControlledTextareaValue(textarea: HTMLTextAreaElement, value: string): void {
  const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set;
  if (!setter) throw new Error('결과 입력창을 갱신할 수 없습니다.');
  setter.call(textarea, value);
  textarea.dispatchEvent(new Event('input', { bubbles: true }));
  textarea.dispatchEvent(new Event('change', { bubbles: true }));
}

function findPhase6Textarea(): HTMLTextAreaElement | null {
  const textareas = Array.from(document.querySelectorAll<HTMLTextAreaElement>('textarea'));
  return textareas.find((textarea) => {
    const placeholder = textarea.getAttribute('placeholder') || '';
    return placeholder.includes('외부') || placeholder.includes('html') || placeholder.includes('HTML');
  }) || null;
}

function findButtonByText(text: string): HTMLButtonElement | null {
  return Array.from(document.querySelectorAll<HTMLButtonElement>('button'))
    .find((button) => normalizeText(button.textContent).includes(text)) || null;
}

function stopReactClick(event: MouseEvent): void {
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
}

async function handlePromptExport(event: MouseEvent, clickedButton: HTMLButtonElement): Promise<void> {
  stopReactClick(event);
  const brandName = readBrandName();
  const { rawResearch, missingSteps } = readResearchSnapshot();
  if (!brandName) {
    window.alert('브랜드명을 확인할 수 없습니다. Phase 0으로 돌아가 브랜드명을 다시 입력해 주세요.');
    return;
  }
  if (missingSteps.length > 0) {
    window.alert(`Step 0~5 조사 결과가 완전하지 않습니다. 누락 단계: ${missingSteps.join(', ')}\n\n누락된 단계의 조사 결과를 저장한 뒤 다시 추출해 주세요.`);
    return;
  }
  if (!rawResearch.trim()) {
    window.alert('Step 0~5 조사 결과가 없습니다. 각 단계의 조사 결과를 먼저 저장해 주세요.');
    return;
  }

  const originalText = normalizeText(clickedButton.textContent) || '프롬프트 추출';
  clickedButton.disabled = true;
  clickedButton.textContent = '승인 48페이지 양식 포함 중...';

  try {
    const approvedBaseHtml = await loadApprovedPilotBaseHtml(brandName);
    const creativeDirective = buildCreativeHistoryCompilerDirective(rawResearch);
    const prompt = buildFullReportHtmlPrompt(rawResearch, brandName, approvedBaseHtml, creativeDirective);
    await copyText(prompt);
    downloadPrompt(prompt, brandName);
    window.alert(
      'FULL 보고서 Phase 6 프롬프트를 복사하고 파일로 저장했습니다.\n\n' +
      '승인된 Pilot의 48페이지 HTML/CSS와 Step 0~5 조사 결과가 모두 포함됐습니다. ' +
      '외부 AI가 반환한 ```html ... ``` 전체를 아래 입력창에 붙여넣으세요. 앱은 레이아웃을 재조립하지 않고 완성 HTML을 그대로 검증·저장·출력합니다.',
    );
  } catch (error) {
    window.alert(`Phase 6 프롬프트 생성 오류: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    clickedButton.disabled = false;
    clickedButton.textContent = originalText;
  }
}

async function handleManualRender(event: MouseEvent, clickedButton: HTMLButtonElement): Promise<void> {
  if (replayingRenderClick) {
    replayingRenderClick = false;
    return;
  }

  stopReactClick(event);
  const textarea = findPhase6Textarea();
  const brandName = readBrandName();
  if (!textarea || !textarea.value.trim()) {
    window.alert('외부 AI가 생성한 완성 HTML 전체를 입력창에 붙여넣어 주세요.');
    return;
  }
  if (!brandName) {
    window.alert('브랜드명을 확인할 수 없습니다. Phase 0으로 돌아가 브랜드명을 다시 입력해 주세요.');
    return;
  }

  const originalText = normalizeText(clickedButton.textContent);
  clickedButton.disabled = true;
  clickedButton.dataset.fullReportBusy = 'true';
  clickedButton.textContent = '48페이지 HTML 검증 중...';

  try {
    let html = extractCompleteFullReportHtml(textarea.value);
    html = html
      .replace(/\[cite[:\s]*\d*[\],]*/g, '')
      .replace(/\[cite_start\]/g, '')
      .replace(/\\cite\{[^}]*\}/g, '');
    assertApprovedFullReportHtml(html, brandName);

    textarea.dataset.fullReportValidatedHtml = 'true';
    setControlledTextareaValue(textarea, html);

    window.setTimeout(() => {
      const currentButton = findButtonByText('결과물 뷰어에 렌더링하기') || clickedButton;
      currentButton.disabled = false;
      delete currentButton.dataset.fullReportBusy;
      currentButton.textContent = originalText || '결과물 뷰어에 렌더링하기';
      replayingRenderClick = true;
      currentButton.click();
    }, 80);
  } catch (error) {
    clickedButton.disabled = false;
    delete clickedButton.dataset.fullReportBusy;
    clickedButton.textContent = originalText || '결과물 뷰어에 렌더링하기';
    window.alert(`FULL 보고서 HTML 검증 오류: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function refreshPhase6Copy(): void {
  const textarea = findPhase6Textarea();
  if (textarea) {
    textarea.placeholder = '외부 AI가 반환한 ```html ... ``` 전체를 붙여넣으세요. 승인된 48페이지 HTML을 그대로 검증·저장합니다.';
  }

  document.querySelectorAll<HTMLElement>('div, p').forEach((element) => {
    const text = normalizeText(element.textContent);
    if (text === '외부 AI 수동 렌더링') element.textContent = '외부 AI 완성 HTML 생성';
    if (text === '무료 제미나이 웹을 사용해 렌더링 비용을 없앱니다.') {
      element.textContent = '외부 AI가 승인된 48페이지 양식에 조사 내용을 채운 완성 HTML을 생성합니다.';
    }
    if (text === '수집된 데이터를 바탕으로 04번 보고서 양식 결과물을 생성합니다.') {
      element.textContent = 'Step 0~5 조사 결과를 승인된 40페이지 Main Deck + 8페이지 Appendix HTML로 생성합니다.';
    }
  });
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
    if (label.includes('프롬프트 추출')) {
      void handlePromptExport(event, button);
      return;
    }
    if (label.includes('결과물 뷰어에 렌더링하기')) {
      void handleManualRender(event, button);
    }
  }, true);

  const observer = new MutationObserver(refreshPhase6Copy);
  observer.observe(document.documentElement, { subtree: true, childList: true });
  window.addEventListener('DOMContentLoaded', refreshPhase6Copy);
  window.setTimeout(refreshPhase6Copy, 500);
}
