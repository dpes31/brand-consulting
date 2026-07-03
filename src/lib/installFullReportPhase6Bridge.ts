import { buildCreativeHistoryCompilerDirective } from './creativeHistoryContract';
import { getBrandDesignReference } from './prompts';
import {
  assembleFullReportHtml,
  buildFullReportDataPrompt,
} from '../report/fullReportCompiler';

const PHASE_INPUTS_SESSION_KEY = 'brand-consulting:phase-inputs';
const ACTIVE_BRAND_SESSION_KEY = 'brand-consulting:active-brand';

let installed = false;
let replayingRenderClick = false;

function normalizeText(value: string | null | undefined): string {
  return (value || '').replace(/\s+/g, ' ').trim();
}

function readBrandName(): string {
  try {
    return sessionStorage.getItem(ACTIVE_BRAND_SESSION_KEY)?.trim() || '';
  } catch {
    return '';
  }
}

function readRawResearch(): string {
  try {
    const raw = sessionStorage.getItem(PHASE_INPUTS_SESSION_KEY);
    if (!raw) return '';
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return Object.entries(parsed)
      .filter(([, value]) => typeof value === 'string' && value.trim())
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([step, value]) => `\n\n## STEP ${step}\n${String(value)}`)
      .join('');
  } catch {
    return '';
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
    return placeholder.includes('외부') || placeholder.includes('html') || placeholder.includes('제미나이');
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

async function handlePromptExport(event: MouseEvent): Promise<void> {
  stopReactClick(event);
  const brandName = readBrandName();
  const rawResearch = readRawResearch();
  if (!brandName) {
    window.alert('브랜드명을 확인할 수 없습니다. Phase 0으로 돌아가 브랜드명을 다시 입력해 주세요.');
    return;
  }
  if (!rawResearch.trim()) {
    window.alert('Step 0~5 조사 결과가 없습니다. 각 단계의 조사 결과를 먼저 저장해 주세요.');
    return;
  }

  const creativeDirective = buildCreativeHistoryCompilerDirective(rawResearch);
  const prompt = buildFullReportDataPrompt(rawResearch, brandName, creativeDirective);
  await navigator.clipboard.writeText(prompt);
  downloadPrompt(prompt, brandName);
  window.alert(
    'FULL 보고서 Phase 6 프롬프트를 복사하고 파일로 저장했습니다.\n\n외부 AI 결과의 ```json ... ``` 전체를 아래 입력창에 붙여넣으세요. 앱이 승인된 40페이지 Main Deck + 8페이지 Appendix HTML로 변환합니다.',
  );
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
    window.alert('외부 AI가 생성한 Phase 6 JSON 결과를 입력창에 붙여넣어 주세요.');
    return;
  }
  if (!brandName) {
    window.alert('브랜드명을 확인할 수 없습니다. Phase 0으로 돌아가 브랜드명을 다시 입력해 주세요.');
    return;
  }

  const originalText = normalizeText(clickedButton.textContent);
  clickedButton.disabled = true;
  clickedButton.dataset.fullReportBusy = 'true';
  clickedButton.textContent = 'FULL 보고서 조립 중...';

  try {
    const designRef = getBrandDesignReference(brandName);
    const accentColor = designRef.match(/Accent:\s*(#\w+)/i)?.[1] || '#5e6ad2';
    const html = await assembleFullReportHtml(textarea.value, brandName, accentColor);
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
    window.alert(`FULL 보고서 생성 오류: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function refreshPhase6Copy(): void {
  const textarea = findPhase6Textarea();
  if (textarea) {
    textarea.placeholder = '외부 AI가 반환한 ```json ... ``` 전체를 붙여넣으세요. 앱이 승인된 FULL HTML 양식으로 조립합니다.';
  }

  document.querySelectorAll<HTMLElement>('div, p').forEach((element) => {
    const text = normalizeText(element.textContent);
    if (text === '외부 AI 수동 렌더링') element.textContent = '외부 AI FULL 보고서 생성';
    if (text === '무료 제미나이 웹을 사용해 렌더링 비용을 없앱니다.') {
      element.textContent = '외부 AI는 구조화 데이터만 생성하고, HTML 양식은 앱이 고정 적용합니다.';
    }
    if (text === '수집된 데이터를 바탕으로 04번 보고서 양식 결과물을 생성합니다.') {
      element.textContent = 'Step 0~5 조사 결과를 승인된 40페이지 Main Deck + 8페이지 Appendix 양식으로 생성합니다.';
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
      void handlePromptExport(event);
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
