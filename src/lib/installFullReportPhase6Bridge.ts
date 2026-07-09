import { buildCreativeHistoryDataDirective } from './creativeHistoryContract';
import { loadApprovedPilotBaseHtml } from '../report/fullReportCompiler';
import {
  parseReportHtml,
  sanitizeCompatibleFullReportHtml,
  serializeReportDocument,
} from '../report/reportDomSafety';
import { applyStructuredDefinitionPolicy } from '../report/structuredDefinitionPolicy';
import { assertStructuredReportCrossPage } from '../report/structuredReportCrossValidation';
import {
  annotateStructuredReportDocument,
  buildStructuredReportPrompt,
  extractStructuredReportJson,
  formatStructuredNormalizationWarnings,
  normalizeStructuredReportV3,
  prepareStructuredReportBase,
  renderStructuredReportV3,
  type StructuredNormalizationWarning,
} from '../report/structuredReportV3';

const PHASE_INPUTS_SESSION_KEY = 'brand-consulting:phase-inputs';
const ACTIVE_BRAND_SESSION_KEYS = [
  'brand-consulting:active-brand',
  'brand-consulting:brand-name',
] as const;
const REQUIRED_PHASE_STEPS = ['0', '1', '2', '3', '4', '5'] as const;

type ManualInputMode = 'structured-json' | 'compat-html';

type ManualCompileResult = {
  html: string;
  warnings: StructuredNormalizationWarning[];
  inputKind: ManualInputMode;
};

let installed = false;
let replayingRender = false;

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
  anchor.download = `phase6_structured_report_prompt_${brandName || 'brand'}.txt`;
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

function findPhase6Textarea(mode: ManualInputMode, button?: HTMLButtonElement): HTMLTextAreaElement | null {
  const local = button?.closest<HTMLElement>('[data-phase6-panel]')
    ?.querySelector<HTMLTextAreaElement>(`textarea[data-phase6-input-mode="${mode}"]`);
  if (local) return local;
  return document.querySelector<HTMLTextAreaElement>(`textarea[data-phase6-input-mode="${mode}"]`)
    || Array.from(document.querySelectorAll<HTMLTextAreaElement>('textarea'))
      .find((textarea) => /외부|html|json/i.test(textarea.getAttribute('placeholder') || ''))
    || null;
}

function setControlledTextareaValue(textarea: HTMLTextAreaElement, value: string): void {
  const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set;
  if (!setter) throw new Error('결과 입력창을 갱신할 수 없다.');
  setter.call(textarea, value);
  textarea.dispatchEvent(new Event('input', { bubbles: true }));
  textarea.dispatchEvent(new Event('change', { bubbles: true }));
}

function stopReactClick(event: MouseEvent): void {
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
}

function looksLikeStructuredJson(value: string): boolean {
  const normalized = value.trim().replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
  return normalized.startsWith('{')
    && /"version"\s*:\s*"3\.0\.0"/.test(normalized)
    && /"pages"\s*:/.test(normalized);
}

async function handlePromptExport(event: MouseEvent, button: HTMLButtonElement): Promise<void> {
  stopReactClick(event);
  const brandName = readBrandName();
  const { rawResearch, missingSteps } = readResearchSnapshot();
  if (!brandName) {
    window.alert('브랜드명을 확인할 수 없다. Phase 0에서 브랜드명을 다시 입력해야 한다.');
    return;
  }
  if (missingSteps.length) {
    window.alert(`Step 0~5 조사 결과가 완전하지 않다. 누락 단계: ${missingSteps.join(', ')}`);
    return;
  }

  const originalText = normalizeText(button.textContent) || '외부 AI용 JSON 프롬프트 다운로드';
  button.disabled = true;
  button.textContent = '40페이지 구조화 Schema 준비 중...';
  try {
    const approvedBase = await loadApprovedPilotBaseHtml(brandName);
    const prepared = prepareStructuredReportBase(approvedBase, brandName);
    const definitions = applyStructuredDefinitionPolicy(prepared.definitions);
    const prompt = buildStructuredReportPrompt(
      rawResearch,
      brandName,
      definitions,
      buildCreativeHistoryDataDirective(rawResearch),
    );
    await copyText(prompt);
    downloadPrompt(prompt, brandName);
    window.alert(
      '외부 AI용 ProductionReportV3 JSON 프롬프트를 복사하고 파일로 저장했습니다.\n\n'
      + '1. 파일을 외부 AI에 첨부합니다.\n'
      + '2. 반환된 JSON 전체를 복사합니다.\n'
      + '3. Phase 6 입력창에 붙여넣습니다.\n'
      + '4. JSON 검증 후 40페이지 보고서 만들기를 실행합니다.\n\n'
      + 'HTML은 외부 AI가 아니라 앱이 자동 생성합니다.',
    );
  } catch (error) {
    window.alert(`Phase 6 프롬프트 생성 오류: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    button.disabled = false;
    button.textContent = originalText;
  }
}

function validateCompatibleStructure(sanitizedHtml: string, brandName: string): string {
  const importedDocument = parseReportHtml(sanitizedHtml);
  const definitions = annotateStructuredReportDocument(importedDocument, brandName);
  if (definitions.length < 260) {
    throw new Error(`붙여넣은 HTML의 의미 필드가 부족하다. 현재 ${definitions.length}개다.`);
  }

  importedDocument.body.dataset.contentContract = 'legacy-sanitized-html-v1';
  importedDocument.body.dataset.contentState = 'sanitized';
  importedDocument.body.dataset.compatibilityValidation = 'semantic-skeleton';
  return serializeReportDocument(importedDocument);
}

async function compileManualInput(
  value: string,
  brandName: string,
  mode: ManualInputMode,
): Promise<ManualCompileResult> {
  if (mode === 'structured-json') {
    if (!looksLikeStructuredJson(value)) {
      throw new Error('ProductionReportV3 JSON을 확인할 수 없습니다. JSON 전체를 붙여넣거나 .json/.txt 응답 파일을 불러오세요.');
    }
    const approvedBase = await loadApprovedPilotBaseHtml(brandName);
    const prepared = prepareStructuredReportBase(approvedBase, brandName);
    const definitions = applyStructuredDefinitionPolicy(prepared.definitions);
    const extracted = extractStructuredReportJson(value);
    const normalized = normalizeStructuredReportV3(extracted, definitions);
    assertStructuredReportCrossPage(normalized.report);
    return {
      html: renderStructuredReportV3(approvedBase, normalized.report, brandName),
      warnings: normalized.warnings,
      inputKind: mode,
    };
  }

  if (/<!doctype\s+html|<html\b/i.test(value)) {
    const sanitized = sanitizeCompatibleFullReportHtml(value, brandName);
    return {
      html: validateCompatibleStructure(sanitized, brandName),
      warnings: [],
      inputKind: mode,
    };
  }
  throw new Error('호환용 완성 HTML 문서를 확인할 수 없습니다.');
}

async function handleManualRender(event: MouseEvent, button: HTMLButtonElement): Promise<void> {
  if (replayingRender) {
    replayingRender = false;
    return;
  }

  stopReactClick(event);
  const mode: ManualInputMode = button.dataset.phase6Action === 'compat-html'
    ? 'compat-html'
    : 'structured-json';
  const textarea = findPhase6Textarea(mode, button);
  const brandName = readBrandName();
  const { rawResearch, missingSteps } = readResearchSnapshot();
  if (!textarea?.value.trim()) {
    window.alert(mode === 'structured-json'
      ? '외부 AI가 반환한 JSON 전체를 붙여넣거나 .json/.txt 응답 파일을 불러오세요.'
      : '기존 완성 HTML 문서를 호환용 입력창에 붙여넣으세요.');
    return;
  }
  if (!brandName) {
    window.alert('브랜드명을 확인할 수 없다. Phase 0에서 브랜드명을 다시 입력해야 한다.');
    return;
  }
  if (missingSteps.length || !rawResearch.trim()) {
    window.alert('Step 0~5 조사 원문을 확인할 수 없어 결과를 검증할 수 없다.');
    return;
  }

  const originalText = normalizeText(button.textContent) || (mode === 'structured-json'
    ? 'JSON 검증 후 40페이지 보고서 만들기'
    : '호환 HTML 검증 후 가져오기');
  button.disabled = true;
  button.dataset.fullReportBusy = 'true';
  button.textContent = '구조·내용·보안 검증 중...';

  try {
    const result = await compileManualInput(textarea.value, brandName, mode);
    setControlledTextareaValue(textarea, result.html);
    textarea.dataset.fullReportValidatedHtml = 'true';
    if (result.warnings.length) {
      window.alert(formatStructuredNormalizationWarnings(result.warnings));
    } else if (result.inputKind === 'structured-json') {
      window.alert('JSON 검증을 통과했습니다. HTML은 외부 AI가 아니라 앱이 자동 생성했습니다.');
    }
    window.setTimeout(() => {
      button.disabled = false;
      delete button.dataset.fullReportBusy;
      button.textContent = originalText;
      replayingRender = true;
      button.click();
    }, 120);
  } catch (error) {
    button.disabled = false;
    delete button.dataset.fullReportBusy;
    button.textContent = originalText;
    window.alert(`FULL 보고서 검증 오류: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function refreshPhase6Copy(): void {
  const jsonTextarea = findPhase6Textarea('structured-json');
  if (jsonTextarea) {
    jsonTextarea.placeholder = '외부 AI가 반환한 ProductionReportV3 JSON 전체를 붙여넣으세요. Raw JSON과 ```json 코드펜스를 모두 지원합니다.';
  }
  const compatTextarea = findPhase6Textarea('compat-html');
  if (compatTextarea) {
    compatTextarea.placeholder = '기존 완성 HTML 문서만 입력하세요. Sanitizer와 고정 구조 검증 후 호환용으로 가져옵니다.';
  }
  document.querySelectorAll<HTMLElement>('div, p').forEach((element) => {
    const text = normalizeText(element.textContent);
    if (text === '외부 AI 수동 렌더링' || text === '외부 AI 완성 HTML 생성') {
      element.textContent = '외부 AI 구조화 JSON 방식';
    }
    if (text === '무료 제미나이 웹을 사용해 렌더링 비용을 없앱니다.' || text.includes('콘텐츠 슬롯')) {
      element.textContent = '외부 AI는 JSON 값만 생성하고 앱이 승인된 40페이지 HTML을 렌더링합니다.';
    }
    if (text === '수집된 데이터를 바탕으로 04번 보고서 양식 결과물을 생성합니다.') {
      element.textContent = 'Step 0~5 조사 결과를 ProductionReportV3 JSON으로 검증한 뒤 앱이 40페이지 보고서를 생성합니다.';
    }
  });
}

export function installFullReportPhase6Bridge(): void {
  if (installed || typeof document === 'undefined') return;
  installed = true;

  document.addEventListener('click', (event) => {
    const button = event.target instanceof Element ? event.target.closest('button') : null;
    if (!(button instanceof HTMLButtonElement)) return;
    const label = normalizeText(button.textContent);
    if (button.dataset.phase6Action === 'prompt-download'
      || label.includes('외부 AI용 JSON 프롬프트 다운로드')
      || label.includes('프롬프트 추출')) {
      void handlePromptExport(event, button);
      return;
    }
    if (button.dataset.phase6Action === 'structured-json'
      || button.dataset.phase6Action === 'compat-html'
      || label.includes('JSON 검증 후 40페이지 보고서 만들기')
      || label.includes('호환 HTML 검증 후 가져오기')
      || label.includes('결과물 뷰어에 렌더링하기')) {
      void handleManualRender(event, button);
    }
  }, true);

  const observer = new MutationObserver(refreshPhase6Copy);
  observer.observe(document.documentElement, { subtree: true, childList: true });
  window.addEventListener('DOMContentLoaded', refreshPhase6Copy);
  window.setTimeout(refreshPhase6Copy, 500);
}
