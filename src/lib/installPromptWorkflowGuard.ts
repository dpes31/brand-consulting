import { RESEARCH_NODES, getBrandDesignReference } from './prompts';
import {
  getActiveCompetitorRegistry,
  parseCompetitorRegistry,
} from './competitorSelection';
import { buildReportCompilerPrompt } from './dynamicPagePlanner';

let installed = false;

const SESSION_KEYS = {
  brand: 'brand-consulting:brand-name',
  competitors: 'brand-consulting:competitor-seeds',
  clientNeeds: 'brand-consulting:client-needs',
  referenceNote: 'brand-consulting:reference-note',
  phaseInputs: 'brand-consulting:phase-inputs',
} as const;

function showToast(title: string, message: string, tone: 'success' | 'error' = 'success'): void {
  document.getElementById('brand-consulting-toast')?.remove();

  const toast = document.createElement('div');
  toast.id = 'brand-consulting-toast';
  toast.setAttribute('role', 'alert');
  toast.style.cssText = [
    'position:fixed', 'top:22px', 'right:22px', 'z-index:2147483647',
    'width:min(440px,calc(100vw - 44px))', 'padding:16px 18px',
    'border-radius:12px', 'background:#111827',
    `border:1px solid ${tone === 'success' ? 'rgba(45,212,191,.55)' : 'rgba(248,113,113,.65)'}`,
    'box-shadow:0 18px 60px rgba(0,0,0,.48)',
    'font-family:Inter,Noto Sans KR,sans-serif', 'color:#f8fafc',
  ].join(';');

  const heading = document.createElement('div');
  heading.textContent = title;
  heading.style.cssText = `font-size:14px;font-weight:800;margin-bottom:6px;color:${tone === 'success' ? '#5eead4' : '#fca5a5'}`;

  const body = document.createElement('div');
  body.textContent = message;
  body.style.cssText = 'font-size:12px;line-height:1.55;color:#cbd5e1;white-space:pre-line';

  toast.append(heading, body);
  document.body.appendChild(toast);
  window.setTimeout(() => toast.remove(), tone === 'success' ? 4000 : 7000);
}

function currentStepFromDom(): number | null {
  const candidates = Array.from(document.querySelectorAll<HTMLElement>('p, span, h3'));
  for (const element of candidates) {
    const match = element.textContent?.match(/STEP\s*0?([0-5])\s*\/\//i);
    if (match) return Number(match[1]);
  }
  return null;
}

function safeSessionGet(key: string): string {
  try {
    return window.sessionStorage.getItem(key)?.trim() ?? '';
  } catch {
    return '';
  }
}

function safeSessionSet(key: string, value: string): void {
  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    // Storage can be unavailable in privacy mode. Visible controls remain fallback.
  }
}

function readPhaseInputs(): Record<number, string> {
  try {
    const parsed = JSON.parse(safeSessionGet(SESSION_KEYS.phaseInputs) || '{}') as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries(parsed)
        .filter(([, value]) => typeof value === 'string')
        .map(([key, value]) => [Number(key), String(value)]),
    );
  } catch {
    return {};
  }
}

function writePhaseInput(step: number, value: string): void {
  const inputs = readPhaseInputs();
  inputs[step] = value.trim();
  safeSessionSet(SESSION_KEYS.phaseInputs, JSON.stringify(inputs));
}

function classifyControl(control: HTMLInputElement | HTMLTextAreaElement): string | null {
  const placeholder = control.placeholder ?? '';
  if (placeholder.includes('Enter brand name')) return SESSION_KEYS.brand;
  if (placeholder.includes('삼성카드') || placeholder.includes('검토 후보')) return SESSION_KEYS.competitors;
  if (placeholder.includes('TV CF') || placeholder.includes('캠페인')) return SESSION_KEYS.clientNeeds;
  if (placeholder.includes('RFP 문서') || placeholder.includes('참고 지침')) return SESSION_KEYS.referenceNote;
  return null;
}

function captureControl(control: HTMLInputElement | HTMLTextAreaElement): void {
  const key = classifyControl(control);
  if (key) safeSessionSet(key, control.value.trim());
}

function handleInput(event: Event): void {
  const target = event.target;
  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) captureControl(target);
}

function getBrandName(): string {
  const input = document.querySelector<HTMLInputElement>('input[placeholder*="Enter brand name"]');
  const visibleValue = input?.value.trim() ?? '';
  if (visibleValue) {
    safeSessionSet(SESSION_KEYS.brand, visibleValue);
    return visibleValue;
  }
  return safeSessionGet(SESSION_KEYS.brand) || '조사 브랜드';
}

function findControlByLabel(fragment: string): HTMLInputElement | HTMLTextAreaElement | null {
  const label = Array.from(document.querySelectorAll<HTMLElement>('label'))
    .find((item) => item.textContent?.includes(fragment));
  return label?.parentElement?.querySelector<HTMLInputElement | HTMLTextAreaElement>('input, textarea') ?? null;
}

function getContextValue(labelFragment: string, sessionKey: string): string {
  const visible = findControlByLabel(labelFragment)?.value.trim() ?? '';
  if (visible) {
    safeSessionSet(sessionKey, visible);
    return visible;
  }
  return safeSessionGet(sessionKey);
}

function buildContextAppendix(step: number): string {
  if (step === 0 || step === 1) {
    const note = getContextValue('첨부 참고자료 안내', SESSION_KEYS.referenceNote);
    return note
      ? `\n\n[첨부 참고자료 활용 지침]\n외부 AI에 첨부한 문서를 우선 검토하고 조사에 반영하십시오.\n참고자료 메모: ${note}`
      : '';
  }

  if (step === 2) {
    const seeds = getContextValue('필수 검토 경쟁사', SESSION_KEYS.competitors);
    return seeds
      ? `\n\n[필수 검토 경쟁사 후보 — Mandatory Review Seeds]\n후보군에서 반드시 검토하되 자동 선정하지 마십시오. 시장 위협도 평가에 따라 최종 Top 2~5에서 제외될 수 있으며 Indirect Competitor 분류는 사용하지 않습니다.\n${seeds}`
      : '';
  }

  if (step === 5) {
    const needs = getContextValue('광고주 핵심 니즈', SESSION_KEYS.clientNeeds);
    return needs
      ? `\n\n[광고주 핵심 니즈 / 캠페인 필수 방향]\n아래 내용을 전략 제안의 최우선 Constraint로 적용하고 최종안이 부합하는지 검증하십시오.\n${needs}`
      : '';
  }

  return '';
}

function buildStep4RegistryAppendix(): string | null {
  const registry = getActiveCompetitorRegistry();
  if (!registry) return null;

  const selected = registry.selected
    .map((item) => `${item.rank}. ${item.name} — 위협도 ${item.threatScore}/100 — ${item.selectionReason}`)
    .join('\n');

  return `\n\n[LOCKED COMPETITOR REGISTRY — 변경 금지]\n${selected}\n\n[STEP 4 실행 규칙 — 모두 필수]\n1. 각 경쟁 브랜드를 독립된 Creative History 섹션으로 조사하고 한 페이지·한 표에 압축하지 마십시오.\n2. 최근 5개 완료연도 + 현재연도 YTD를 조사하십시오.\n3. 연도별 모델명, 캠페인명, 실제 카피 원문, 매체/포맷, 소구 전략, 메시지 궤적을 기록하십시오.\n4. 현재연도 캠페인이 확인되지 않으면 '신규 캠페인 공개 미확인'이라고 표시하십시오.\n5. Registry 밖 경쟁사를 추가·대체하지 말고 Registry 경쟁사를 누락하지 마십시오.`;
}

function buildCompletePrompt(step: number): string | null {
  const node = RESEARCH_NODES.find((item) => item.step === step);
  if (!node) return null;

  let userPrompt = node.userPromptTemplate.replace('{BRAND_NAME}', getBrandName());
  userPrompt += buildContextAppendix(step);

  if (step === 4) {
    const appendix = buildStep4RegistryAppendix();
    if (!appendix) return null;
    userPrompt += appendix;
  }

  return `[SYSTEM INSTRUCTION]\n${node.systemPrompt}\n\n[USER REQUEST]\n${userPrompt}`;
}

function buildRawResearchData(): string {
  const inputs = readPhaseInputs();
  return RESEARCH_NODES.map((node) => {
    const data = inputs[node.step]?.trim();
    return data ? `\n\n## 0${node.step}. ${node.title}\n${data}` : '';
  }).join('');
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

function downloadText(text: string, filename: string): void {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function getManualInsightTextarea(button: HTMLButtonElement): HTMLTextAreaElement | null {
  const board = button.closest('section') ?? document;
  return board.querySelector<HTMLTextAreaElement>('textarea[placeholder*="COMPETITOR_REGISTRY"], textarea');
}

async function exportDynamicCompilerPrompt(): Promise<void> {
  const rawData = buildRawResearchData();
  if (!rawData.trim()) {
    throw new Error('저장된 단계별 조사 결과가 없습니다. Step 0~5 결과를 제출한 뒤 다시 시도해 주세요.');
  }

  const response = await fetch('/template.html?t=' + Date.now());
  if (!response.ok) throw new Error('template.html을 불러올 수 없습니다.');
  let masterHtml = await response.text();

  const brandName = getBrandName();
  const designRef = getBrandDesignReference(brandName);
  const accentColor = designRef.match(/Accent:\s*(#\w+)/i)?.[1] || '#5e6ad2';
  masterHtml = masterHtml.replace(/--hds-brand-accent:\s*#5e6ad2;/g, `--hds-brand-accent: ${accentColor};`);

  const prompt = buildReportCompilerPrompt(masterHtml, rawData, brandName);
  await copyText(prompt);
  downloadText(prompt, `dynamic_report_compiler_${brandName || 'export'}.txt`);
}

function handleClick(event: MouseEvent): void {
  const target = event.target;
  if (!(target instanceof Element)) return;
  const button = target.closest<HTMLButtonElement>('button');
  if (!button) return;

  const label = button.textContent?.replace(/\s+/g, ' ').trim() ?? '';
  const step = currentStepFromDom();

  if (label.includes('프롬프트 추출')) {
    event.preventDefault();
    event.stopImmediatePropagation();
    void exportDynamicCompilerPrompt()
      .then(() => showToast(
        '동적 보고서 프롬프트 추출 완료',
        '기본 23장 보존, 경쟁사별 독립 페이지, Main Deck 최대 40장, Appendix 연속 출력 규칙을 포함해 복사·다운로드했습니다.',
      ))
      .catch((error) => showToast('프롬프트 추출 실패', error instanceof Error ? error.message : String(error), 'error'));
    return;
  }

  if (label.includes('복사용 AI 프롬프트 가져오기')) {
    event.preventDefault();
    event.stopImmediatePropagation();

    if (step === null) {
      showToast('프롬프트 복사 실패', '현재 조사 단계를 확인하지 못했습니다.', 'error');
      return;
    }

    const prompt = buildCompletePrompt(step);
    if (!prompt && step === 4) {
      showToast('Step 2 Registry 확인 필요', 'Step 2 결과 마지막의 Registry JSON을 확인한 뒤 다시 제출해 주세요.', 'error');
      return;
    }
    if (!prompt) {
      showToast('프롬프트 복사 실패', '현재 단계의 프롬프트를 생성하지 못했습니다.', 'error');
      return;
    }

    void copyText(prompt).then(() => showToast(
      'AI 프롬프트 복사 완료',
      step === 2
        ? '위협도 100점 평가 기준, 필수 검토 후보, Registry JSON 규칙을 포함했습니다.'
        : step === 4
          ? '확정 경쟁사 명단과 Creative History 5대 규칙을 포함했습니다.'
          : 'System 지침과 현재 단계의 사용자 요청을 함께 복사했습니다.',
    ));
    return;
  }

  if (label.includes('Submit & Continue') && step !== null) {
    const textarea = getManualInsightTextarea(button);
    const value = textarea?.value.trim() ?? '';

    if (step === 2 && !parseCompetitorRegistry(value)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      showToast(
        'Step 2 제출 중단',
        '유효한 Registry가 없습니다. selected 배열에 최종 경쟁사 2~5개를 넣어야 이후 페이지 구조가 경쟁사 수에 맞게 확장됩니다.',
        'error',
      );
      return;
    }

    if (value) writePhaseInput(step, value);
  }
}

export function installPromptWorkflowGuard(): void {
  if (installed || typeof document === 'undefined') return;
  installed = true;
  document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input, textarea').forEach(captureControl);
  document.addEventListener('input', handleInput, true);
  document.addEventListener('click', handleClick, true);
}
