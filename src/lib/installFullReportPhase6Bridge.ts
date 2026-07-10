import { buildCreativeHistoryCompilerDirective } from './creativeHistoryContract';
import { buildApprovedHtmlCompilationPrompt } from '../report/approvedHtmlPrompt';
import { assertApprovedHtmlCrossPageConsistency } from '../report/approvedHtmlCrossValidation';
import {
  extractCompleteFullReportHtml,
  loadApprovedPilotBaseHtml,
} from '../report/fullReportCompiler';
import {
  assertAllResearchSlotsFilled,
  assertResearchEvidencePresent,
  createResearchOnlyLayoutTemplate,
  finalizeApprovedHtmlFromExternalOutput,
} from '../report/researchContentTemplate';

const PHASE_INPUTS_SESSION_KEY = 'brand-consulting:phase-inputs';
const APPROVED_TEMPLATE_SESSION_PREFIX = 'brand-consulting:phase6-approved-semantic-template';
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

function templateSessionKey(brandName: string): string {
  return `${APPROVED_TEMPLATE_SESSION_PREFIX}:${brandName}`;
}

function cacheSemanticTemplate(brandName: string, html: string): void {
  try {
    sessionStorage.setItem(templateSessionKey(brandName), html);
  } catch (error) {
    console.warn('[Phase 6] semantic template session cache unavailable', error);
  }
}

function readCachedSemanticTemplate(brandName: string): string {
  try {
    return sessionStorage.getItem(templateSessionKey(brandName)) || '';
  } catch {
    return '';
  }
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
  return value.match(/(?:^|\D)([0-5])(?:\D|$)/)?.[1] ?? null;
}

function readResearchSnapshot(): { rawResearch: string; missingSteps: string[] } {
  try {
    const raw = sessionStorage.getItem(PHASE_INPUTS_SESSION_KEY);
    if (!raw) return { rawResearch: '', missingSteps: [...REQUIRED_PHASE_STEPS] };
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const values = new Map<string, string>();
    Object.entries(parsed).forEach(([key, value]) => {
      if (typeof value !== 'string' || !value.trim()) return;
      const step = normalizeStepKey(key);
      if (step) values.set(step, value.trim());
    });
    const missingSteps = REQUIRED_PHASE_STEPS.filter((step) => !values.has(step));
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
  anchor.download = `phase6_approved_html_prompt_${brandName || 'brand'}.txt`;
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
  return document.querySelector<HTMLTextAreaElement>('textarea[data-phase6-input-mode="approved-html"]')
    || Array.from(document.querySelectorAll<HTMLTextAreaElement>('textarea')).find((textarea) => {
      const placeholder = textarea.getAttribute('placeholder') || '';
      return /외부|html/i.test(placeholder);
    })
    || null;
}

function findButtonByText(...labels: string[]): HTMLButtonElement | null {
  return Array.from(document.querySelectorAll<HTMLButtonElement>('button'))
    .find((button) => labels.some((label) => normalizeText(button.textContent).includes(label))) || null;
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
  if (missingSteps.length) {
    window.alert(`Step 0~5 조사 결과가 완전하지 않습니다. 누락 단계: ${missingSteps.join(', ')}`);
    return;
  }

  const originalText = normalizeText(clickedButton.textContent) || '완성 HTML 프롬프트 다운로드';
  clickedButton.disabled = true;
  clickedButton.textContent = '승인 40+8 HTML 양식 준비 중...';
  try {
    const approvedBase = await loadApprovedPilotBaseHtml(brandName);
    const semanticTemplate = createResearchOnlyLayoutTemplate(approvedBase, brandName);
    cacheSemanticTemplate(brandName, semanticTemplate);
    const creativeDirective = buildCreativeHistoryCompilerDirective(rawResearch);
    const prompt = buildApprovedHtmlCompilationPrompt(
      rawResearch,
      brandName,
      semanticTemplate,
      creativeDirective,
    );
    await copyText(prompt);
    downloadPrompt(prompt, brandName);
    window.alert(
      '승인 샘플 40 Main + 8 Appendix 완성 HTML 프롬프트를 복사하고 다운로드했습니다.\n\n'
      + '외부 AI는 JSON이 아니라 완성 HTML을 반환해야 합니다.\n'
      + '각 [[FIELD:...]] 의미 필드의 내용만 바꾸고 레이아웃·라벨·도식 구조는 변경할 수 없습니다.',
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
  const { rawResearch, missingSteps } = readResearchSnapshot();
  if (!textarea?.value.trim()) {
    window.alert('외부 AI가 반환한 완성 HTML 전체를 입력창에 붙여넣거나 .html/.txt 파일을 불러오세요.');
    return;
  }
  if (!brandName) {
    window.alert('브랜드명을 확인할 수 없습니다. Phase 0으로 돌아가 브랜드명을 다시 입력해 주세요.');
    return;
  }
  if (missingSteps.length || !rawResearch.trim()) {
    window.alert('Step 0~5 조사 원문을 확인할 수 없어 내용 반영 여부를 검증할 수 없습니다.');
    return;
  }

  const originalText = normalizeText(clickedButton.textContent) || 'HTML 검증 후 48페이지 보고서 열기';
  clickedButton.disabled = true;
  clickedButton.dataset.fullReportBusy = 'true';
  clickedButton.textContent = '의미 필드·레이아웃·가독성 검증 중...';

  try {
    const cachedTemplate = readCachedSemanticTemplate(brandName);
    const approvedSource = cachedTemplate || await loadApprovedPilotBaseHtml(brandName);
    const extracted = extractCompleteFullReportHtml(textarea.value)
      .replace(/\[cite[:\s]*\d*[\],]*/g, '')
      .replace(/\[cite_start\]/g, '')
      .replace(/\\cite\{[^}]*\}/g, '');
    const html = finalizeApprovedHtmlFromExternalOutput(extracted, approvedSource, brandName);
    assertAllResearchSlotsFilled(html);
    assertApprovedHtmlCrossPageConsistency(html, brandName);
    assertResearchEvidencePresent(html, rawResearch, brandName);

    textarea.dataset.fullReportValidatedHtml = 'true';
    setControlledTextareaValue(textarea, html);
    window.alert('완성 HTML 검증을 통과했습니다. 승인 샘플의 40 Main + 8 Appendix 레이아웃으로 보고서를 엽니다.');

    window.setTimeout(() => {
      const currentButton = findButtonByText('HTML 검증 후 48페이지 보고서 열기', '결과물 뷰어에 렌더링하기') || clickedButton;
      currentButton.disabled = false;
      delete currentButton.dataset.fullReportBusy;
      currentButton.textContent = originalText;
      replayingRenderClick = true;
      currentButton.click();
    }, 100);
  } catch (error) {
    clickedButton.disabled = false;
    delete clickedButton.dataset.fullReportBusy;
    clickedButton.textContent = originalText;
    window.alert(`FULL 보고서 검증 오류: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function refreshPhase6Copy(): void {
  const textarea = findPhase6Textarea();
  if (textarea) {
    textarea.dataset.phase6InputMode = 'approved-html';
    textarea.placeholder = '외부 AI가 반환한 <!DOCTYPE html>부터 </html>까지의 완성 HTML 전체를 붙여넣으세요.';
  }

  document.querySelectorAll<HTMLElement>('div, p').forEach((element) => {
    const text = normalizeText(element.textContent);
    if (text === '외부 AI 수동 렌더링') element.textContent = '외부 AI 완성 HTML 생성';
    if (text === '무료 제미나이 웹을 사용해 렌더링 비용을 없앱니다.') {
      element.textContent = '승인한 40 Main + 8 Appendix 양식은 고정하고 조사 내용만 의미 필드별로 교체합니다.';
    }
    if (text === '수집된 데이터를 바탕으로 04번 보고서 양식 결과물을 생성합니다.') {
      element.textContent = '승인 샘플의 도식·레이아웃·가독성을 유지한 완성 HTML 보고서를 생성합니다.';
    }
  });

  const promptButton = findButtonByText('프롬프트 추출', '완성 HTML 프롬프트 다운로드');
  if (promptButton && normalizeText(promptButton.textContent) !== '완성 HTML 프롬프트 다운로드') {
    promptButton.textContent = '완성 HTML 프롬프트 다운로드';
  }
  const renderButton = findButtonByText('결과물 뷰어에 렌더링하기', 'HTML 검증 후 48페이지 보고서 열기');
  if (renderButton && !renderButton.dataset.fullReportBusy && normalizeText(renderButton.textContent) !== 'HTML 검증 후 48페이지 보고서 열기') {
    renderButton.textContent = 'HTML 검증 후 48페이지 보고서 열기';
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
    if (label.includes('프롬프트 추출') || label.includes('완성 HTML 프롬프트 다운로드')) {
      void handlePromptExport(event, button);
      return;
    }
    if (label.includes('결과물 뷰어에 렌더링하기') || label.includes('HTML 검증 후 48페이지 보고서 열기')) {
      void handleManualRender(event, button);
    }
  }, true);

  const observer = new MutationObserver(refreshPhase6Copy);
  observer.observe(document.documentElement, { subtree: true, childList: true });
  window.addEventListener('DOMContentLoaded', refreshPhase6Copy);
  window.setTimeout(refreshPhase6Copy, 500);
}
