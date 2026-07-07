import { buildCreativeHistoryCompilerDirective } from './creativeHistoryContract';
import {
  assertApprovedFullReportHtml,
  buildFullReportHtmlPrompt,
  extractCompleteFullReportHtml,
  loadApprovedPilotBaseHtml,
} from '../report/fullReportCompiler';
import { normalizeApprovedFullReportHtml } from '../report/normalizeApprovedFullReportHtml';
import {
  assertAllResearchSlotsFilled,
  assertResearchEvidencePresent,
  createResearchOnlyLayoutTemplate,
} from '../report/researchContentTemplate';
import { addResearchSlotRules } from '../report/researchSlotPrompt';

const PHASE_INPUTS_SESSION_KEY = 'brand-consulting:phase-inputs';
const ACTIVE_BRAND_SESSION_KEYS = [
  'brand-consulting:active-brand',
  'brand-consulting:brand-name',
] as const;
const REQUIRED_PHASE_STEPS = ['0', '1', '2', '3', '4', '5'] as const;

let installed = false;

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

function findPhase6Textarea(): HTMLTextAreaElement | null {
  return Array.from(document.querySelectorAll<HTMLTextAreaElement>('textarea')).find((textarea) => {
    const placeholder = textarea.getAttribute('placeholder') || '';
    return placeholder.includes('외부') || placeholder.includes('html') || placeholder.includes('HTML');
  }) || null;
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
    window.alert('브랜드명을 확인할 수 없다. Phase 0에서 브랜드명을 다시 입력해야 한다.');
    return;
  }
  if (missingSteps.length > 0) {
    window.alert(`Step 0~5 조사 결과가 완전하지 않다. 누락 단계: ${missingSteps.join(', ')}`);
    return;
  }
  if (!rawResearch.trim()) {
    window.alert('Step 0~5 조사 결과가 없다. 각 단계의 조사 결과를 먼저 저장해야 한다.');
    return;
  }

  const originalText = normalizeText(clickedButton.textContent) || '프롬프트 추출';
  clickedButton.disabled = true;
  clickedButton.textContent = '40페이지 레이아웃 중립화 중...';
  try {
    const capturedPilot = await loadApprovedPilotBaseHtml(brandName);
    const researchOnlyTemplate = createResearchOnlyLayoutTemplate(capturedPilot, brandName);
    const creativeDirective = buildCreativeHistoryCompilerDirective(rawResearch);
    const prompt = addResearchSlotRules(
      buildFullReportHtmlPrompt(rawResearch, brandName, researchOnlyTemplate, creativeDirective),
    );
    await copyText(prompt);
    downloadPrompt(prompt, brandName);
    window.alert(
      '40페이지 Main Deck 프롬프트를 복사하고 파일로 저장했다.\n\n' +
      '기존 샘플 결론·수치·경쟁사명은 제거되고 Step 0~5 조사 결과만 사용한다.',
    );
  } catch (error) {
    window.alert(`Phase 6 프롬프트 생성 오류: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    clickedButton.disabled = false;
    clickedButton.textContent = originalText;
  }
}

function validateManualRender(event: MouseEvent): void {
  const textarea = findPhase6Textarea();
  const brandName = readBrandName();
  const { rawResearch, missingSteps } = readResearchSnapshot();

  try {
    if (!textarea || !textarea.value.trim()) throw new Error('외부 AI가 생성한 완성 HTML 전체를 입력창에 붙여넣어야 한다.');
    if (!brandName) throw new Error('브랜드명을 확인할 수 없다. Phase 0에서 브랜드명을 다시 입력해야 한다.');
    if (missingSteps.length > 0 || !rawResearch.trim()) throw new Error('Step 0~5 조사 원문을 확인할 수 없어 내용 반영 여부를 검증할 수 없다.');

    let html = normalizeApprovedFullReportHtml(extractCompleteFullReportHtml(textarea.value));
    html = html
      .replace(/\[cite[:\s]*\d*[\],]*/g, '')
      .replace(/\[cite_start\]/g, '')
      .replace(/\\cite\{[^}]*\}/g, '');
    assertApprovedFullReportHtml(html, brandName);
    assertAllResearchSlotsFilled(html);
    assertResearchEvidencePresent(html, rawResearch, brandName);

    // Validation succeeded. Do not replay or mutate the controlled textarea.
    // Let this original click continue into Dashboard's React onClick handler,
    // which owns fenced-HTML extraction, state update, Viewer opening and save.
    textarea.dataset.fullReportValidatedHtml = 'true';
  } catch (error) {
    stopReactClick(event);
    window.alert(`FULL 보고서 검증 오류: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function refreshPhase6Copy(): void {
  const textarea = findPhase6Textarea();
  if (textarea) {
    textarea.placeholder = '외부 AI가 모든 CONTENT SLOT을 조사 내용으로 채운 40페이지 완성 HTML 전체를 붙여넣는다.';
  }
  document.querySelectorAll<HTMLElement>('div, p').forEach((element) => {
    const text = normalizeText(element.textContent);
    if (text === '외부 AI 수동 렌더링') element.textContent = '외부 AI 완성 HTML 생성';
    if (text === '무료 제미나이 웹을 사용해 렌더링 비용을 없앱니다.') {
      element.textContent = '승인 레이아웃의 콘텐츠 슬롯을 Step 0~5 조사 내용으로 채운다.';
    }
    if (text === '수집된 데이터를 바탕으로 04번 보고서 양식 결과물을 생성합니다.') {
      element.textContent = '레이아웃은 고정하고 결론·수치·경쟁사·전략은 현재 조사 결과로 교체한다.';
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
    if (label.includes('결과물 뷰어에 렌더링하기')) validateManualRender(event);
  }, true);

  const observer = new MutationObserver(refreshPhase6Copy);
  observer.observe(document.documentElement, { subtree: true, childList: true });
  window.addEventListener('DOMContentLoaded', refreshPhase6Copy);
  window.setTimeout(refreshPhase6Copy, 500);
}
