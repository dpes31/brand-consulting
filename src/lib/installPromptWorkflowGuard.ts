import { RESEARCH_NODES } from './prompts';
import {
  getActiveCompetitorRegistry,
  parseCompetitorRegistry,
} from './competitorSelection';

let installed = false;

const SESSION_KEYS = {
  brand: 'brand-consulting:brand-name',
  competitors: 'brand-consulting:competitor-seeds',
  clientNeeds: 'brand-consulting:client-needs',
  referenceNote: 'brand-consulting:reference-note',
} as const;

function showToast(title: string, message: string, tone: 'success' | 'error' = 'success'): void {
  document.getElementById('brand-consulting-toast')?.remove();

  const toast = document.createElement('div');
  toast.id = 'brand-consulting-toast';
  toast.setAttribute('role', 'alert');
  toast.style.cssText = [
    'position:fixed',
    'top:22px',
    'right:22px',
    'z-index:2147483647',
    'width:min(420px,calc(100vw - 44px))',
    'padding:16px 18px',
    'border-radius:12px',
    'background:#111827',
    `border:1px solid ${tone === 'success' ? 'rgba(45,212,191,.55)' : 'rgba(248,113,113,.65)'}`,
    'box-shadow:0 18px 60px rgba(0,0,0,.48)',
    'font-family:Inter,Noto Sans KR,sans-serif',
    'color:#f8fafc',
  ].join(';');

  const heading = document.createElement('div');
  heading.textContent = title;
  heading.style.cssText = `font-size:14px;font-weight:800;margin-bottom:6px;color:${tone === 'success' ? '#5eead4' : '#fca5a5'}`;

  const body = document.createElement('div');
  body.textContent = message;
  body.style.cssText = 'font-size:12px;line-height:1.55;color:#cbd5e1;white-space:pre-line';

  toast.append(heading, body);
  document.body.appendChild(toast);

  window.setTimeout(() => toast.remove(), tone === 'success' ? 3500 : 6500);
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
    // Session storage may be disabled. The visible form remains the fallback.
  }
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
  const labels = Array.from(document.querySelectorAll<HTMLElement>('label'));
  const label = labels.find((item) => item.textContent?.includes(fragment));
  if (!label) return null;
  const container = label.parentElement;
  return container?.querySelector<HTMLInputElement | HTMLTextAreaElement>('input, textarea') ?? null;
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
    if (!note) return '';
    return `\n\n[첨부 참고자료 활용 지침]\n외부 AI에 첨부한 문서가 있다면 해당 자료를 우선 검토하고 조사에 반영하십시오.\n참고자료 메모: ${note}`;
  }

  if (step === 2) {
    const seeds = getContextValue('필수 검토 경쟁사', SESSION_KEYS.competitors);
    if (!seeds) return '';
    return `\n\n[필수 검토 경쟁사 후보 — Mandatory Review Seeds]\n아래 업체는 후보군에서 반드시 검토하십시오. 단, 자동 선정 명단이 아니며 시장 위협도 평가 결과에 따라 최종 Top 2~5에서 제외될 수 있습니다. Indirect Competitor 분류는 사용하지 마십시오.\n${seeds}`;
  }

  if (step === 5) {
    const needs = getContextValue('광고주 핵심 니즈', SESSION_KEYS.clientNeeds);
    if (!needs) return '';
    return `\n\n[광고주 핵심 니즈 / 캠페인 필수 방향]\n아래 내용을 전략 제안의 최우선 Constraint로 적용하고 최종안이 부합하는지 검증하십시오.\n${needs}`;
  }

  return '';
}

function buildStep4RegistryAppendix(): string | null {
  const registry = getActiveCompetitorRegistry();
  if (!registry) return null;

  const selected = registry.selected
    .map((item) => `${item.rank}. ${item.name} — 위협도 ${item.threatScore}/100 — ${item.selectionReason}`)
    .join('\n');

  return `\n\n[LOCKED COMPETITOR REGISTRY — 변경 금지]\n${selected}\n\n[STEP 4 실행 규칙 — 모두 필수]\n1. 위 Registry의 각 경쟁 브랜드를 독립된 Creative History 섹션으로 조사하고, 한 페이지·한 표에 전체 브랜드를 압축하지 마십시오.\n2. 조사 기간은 최근 5개 완료연도 + 현재연도 YTD입니다.\n3. 각 연도별로 모델명, 캠페인명, 실제 카피 원문(Verbatim), 매체/포맷, 소구 전략, 메시지 궤적을 기록하십시오.\n4. 현재연도 공개 캠페인이 확인되지 않으면 마지막 칸에 '신규 캠페인 공개 미확인'이라고 표시하십시오.\n5. Registry 밖의 경쟁사를 임의 추가·대체하지 말고, Registry 안의 경쟁사를 누락하지 마십시오.`;
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

function getManualInsightTextarea(button: HTMLButtonElement): HTMLTextAreaElement | null {
  const board = button.closest('section') ?? document;
  return board.querySelector<HTMLTextAreaElement>('textarea[placeholder*="COMPETITOR_REGISTRY"], textarea');
}

function handleClick(event: MouseEvent): void {
  const target = event.target;
  if (!(target instanceof Element)) return;
  const button = target.closest<HTMLButtonElement>('button');
  if (!button) return;

  const label = button.textContent?.replace(/\s+/g, ' ').trim() ?? '';
  const step = currentStepFromDom();

  if (label.includes('복사용 AI 프롬프트 가져오기')) {
    event.preventDefault();
    event.stopImmediatePropagation();

    if (step === null) {
      showToast('프롬프트 복사 실패', '현재 조사 단계를 확인하지 못했습니다.', 'error');
      return;
    }

    const prompt = buildCompletePrompt(step);
    if (!prompt && step === 4) {
      showToast(
        'Step 2 Registry 확인 필요',
        'Step 4 경쟁사 명단을 잠글 수 없습니다. Step 2 결과 마지막에 COMPETITOR_REGISTRY_START/END JSON 블록이 포함됐는지 확인한 뒤 다시 제출해 주세요.',
        'error',
      );
      return;
    }
    if (!prompt) {
      showToast('프롬프트 복사 실패', '현재 단계의 프롬프트를 생성하지 못했습니다.', 'error');
      return;
    }

    void copyText(prompt).then(() => {
      showToast(
        'AI 프롬프트 복사 완료',
        step === 2
          ? 'System 지침, 위협도 100점 평가 기준, 필수 검토 후보, Registry JSON 규칙을 모두 포함했습니다.'
          : step === 4
            ? 'Step 2에서 확정한 경쟁사 명단과 Creative History 5대 규칙을 포함했습니다.'
            : 'System 지침과 현재 단계의 사용자 요청을 함께 복사했습니다.',
      );
    });
    return;
  }

  if (label.includes('Submit & Continue') && step === 2) {
    const textarea = getManualInsightTextarea(button);
    const registry = parseCompetitorRegistry(textarea?.value);
    if (registry) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    showToast(
      'Step 2 제출 중단',
      '유효한 경쟁사 Registry가 없습니다. 결과 마지막에 마커와 JSON을 포함하고, selected 배열에 최종 경쟁사 2~5개를 넣어야 합니다. 이 검증을 통과해야 Step 4에서 동일 경쟁사 명단이 자동 잠금됩니다.',
      'error',
    );
  }
}

export function installPromptWorkflowGuard(): void {
  if (installed || typeof document === 'undefined') return;
  installed = true;

  document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input, textarea').forEach(captureControl);
  document.addEventListener('input', handleInput, true);
  document.addEventListener('click', handleClick, true);
}
