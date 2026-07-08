import { buildCreativeHistoryCompilerDirective } from './creativeHistoryContract';
import { loadApprovedPilotBaseHtml } from '../report/fullReportCompiler';
import {
  parseReportHtml,
  sanitizeCompatibleFullReportHtml,
  serializeReportDocument,
} from '../report/reportDomSafety';
import { findSemanticReportFingerprintMismatches } from '../report/reportSemanticFingerprint';
import { applyStructuredDefinitionPolicy } from '../report/structuredDefinitionPolicy';
import { assertStructuredReportCrossPage } from '../report/structuredReportCrossValidation';
import {
  annotateStructuredReportDocument,
  buildStructuredReportPrompt,
  extractStructuredReportJson,
  prepareStructuredReportBase,
  renderStructuredReportV3,
} from '../report/structuredReportV3';

const PHASE_INPUTS_SESSION_KEY = 'brand-consulting:phase-inputs';
const ACTIVE_BRAND_SESSION_KEYS = [
  'brand-consulting:active-brand',
  'brand-consulting:brand-name',
] as const;
const REQUIRED_PHASE_STEPS = ['0', '1', '2', '3', '4', '5'] as const;

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

function findPhase6Textarea(): HTMLTextAreaElement | null {
  return Array.from(document.querySelectorAll<HTMLTextAreaElement>('textarea'))
    .find((textarea) => /외부|html|json/i.test(textarea.getAttribute('placeholder') || '')) || null;
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

  const originalText = normalizeText(button.textContent) || '프롬프트 추출';
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
      buildCreativeHistoryCompilerDirective(rawResearch),
    );
    await copyText(prompt);
    downloadPrompt(prompt, brandName);
    window.alert(
      '구조화 JSON 프롬프트를 복사하고 파일로 저장했다.\n\n' +
      '외부 AI는 HTML을 작성하지 않는다. 앱이 고정 40페이지 Renderer에 JSON 값만 주입한다.',
    );
  } catch (error) {
    window.alert(`Phase 6 프롬프트 생성 오류: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    button.disabled = false;
    button.textContent = originalText;
  }
}

function assertCompatibleFingerprint(approvedBase: string, sanitizedHtml: string, brandName: string): string {
  const approvedRoundTrip = serializeReportDocument(parseReportHtml(approvedBase));
  const approvedDocument = parseReportHtml(approvedRoundTrip);
  const importedDocument = parseReportHtml(sanitizedHtml);

  annotateStructuredReportDocument(approvedDocument, brandName);
  annotateStructuredReportDocument(importedDocument, brandName);

  const mismatches = findSemanticReportFingerprintMismatches(approvedDocument, importedDocument);
  if (mismatches.length) {
    throw new Error(
      `붙여넣은 HTML이 승인된 의미 구조를 변경했다. 불일치 페이지: ${mismatches.join(', ')}. ` +
      '기존 HTML은 Script 제거만으로 복구할 수 없으며, 구조화 JSON 프롬프트로 다시 생성해야 한다.',
    );
  }

  importedDocument.body.dataset.contentContract = 'legacy-sanitized-html-v1';
  importedDocument.body.dataset.contentState = 'sanitized';
  return serializeReportDocument(importedDocument);
}

async function compileManualInput(value: string, brandName: string): Promise<string> {
  const approvedBase = await loadApprovedPilotBaseHtml(brandName);
  if (looksLikeStructuredJson(value)) {
    const report = extractStructuredReportJson(value);
    assertStructuredReportCrossPage(report);
    return renderStructuredReportV3(approvedBase, report, brandName);
  }
  if (/<!doctype\s+html|<html\b/i.test(value)) {
    const sanitized = sanitizeCompatibleFullReportHtml(value, brandName);
    return assertCompatibleFingerprint(approvedBase, sanitized, brandName);
  }
  throw new Error('구조화 JSON 또는 완전한 HTML 문서를 확인할 수 없다.');
}

async function handleManualRender(event: MouseEvent, button: HTMLButtonElement): Promise<void> {
  if (replayingRender) {
    replayingRender = false;
    return;
  }

  stopReactClick(event);
  const textarea = findPhase6Textarea();
  const brandName = readBrandName();
  const { rawResearch, missingSteps } = readResearchSnapshot();
  if (!textarea?.value.trim()) {
    window.alert('외부 AI가 생성한 구조화 JSON 또는 호환 HTML을 붙여넣어야 한다.');
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

  const originalText = normalizeText(button.textContent) || '결과물 뷰어에 렌더링하기';
  button.disabled = true;
  button.dataset.fullReportBusy = 'true';
  button.textContent = '구조·내용·보안 검증 중...';

  try {
    const html = await compileManualInput(textarea.value, brandName);
    setControlledTextareaValue(textarea, html);
    textarea.dataset.fullReportValidatedHtml = 'true';
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
  const textarea = findPhase6Textarea();
  if (textarea) {
    textarea.placeholder = '권장: 외부 AI가 생성한 ProductionReportV3 구조화 JSON을 붙여넣는다. 기존 완성 HTML은 Sanitizer 호환 경로로만 지원한다.';
  }
  document.querySelectorAll<HTMLElement>('div, p').forEach((element) => {
    const text = normalizeText(element.textContent);
    if (text === '외부 AI 수동 렌더링' || text === '외부 AI 완성 HTML 생성') {
      element.textContent = '외부 AI 구조화 JSON 생성';
    }
    if (text === '무료 제미나이 웹을 사용해 렌더링 비용을 없앱니다.' || text.includes('콘텐츠 슬롯')) {
      element.textContent = '외부 AI는 페이지별 JSON 값만 생성하고, 앱이 승인 레이아웃을 렌더링한다.';
    }
    if (text === '수집된 데이터를 바탕으로 04번 보고서 양식 결과물을 생성합니다.') {
      element.textContent = '40페이지 DOM은 앱이 고정하고, Step 0~5 조사 내용만 구조화해 주입한다.';
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
    if (label.includes('프롬프트 추출')) {
      void handlePromptExport(event, button);
      return;
    }
    if (label.includes('결과물 뷰어에 렌더링하기')) void handleManualRender(event, button);
  }, true);

  const observer = new MutationObserver(refreshPhase6Copy);
  observer.observe(document.documentElement, { subtree: true, childList: true });
  window.addEventListener('DOMContentLoaded', refreshPhase6Copy);
  window.setTimeout(refreshPhase6Copy, 500);
}
