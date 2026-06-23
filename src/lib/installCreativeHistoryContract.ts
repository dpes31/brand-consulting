import { RESEARCH_NODES, getBrandDesignReference } from './prompts';
import { getActiveCompetitorRegistry } from './competitorSelection';
import {
  buildCreativeHistoryCompilerDirective,
  buildCreativeHistoryResearchContract,
  parseCreativeHistoryRegistry,
  validateCreativeHistoryPages,
} from './creativeHistoryContract';
import { buildReportCompilerPrompt } from './dynamicPagePlanner';

let installed = false;

const PHASE_INPUTS_SESSION_KEY = 'brand-consulting:phase-inputs';
const BRAND_SESSION_KEY = 'brand-consulting:brand-name';

function showToast(title: string, message: string, tone: 'success' | 'error' = 'success'): void {
  document.getElementById('creative-history-toast')?.remove();
  const toast = document.createElement('div');
  toast.id = 'creative-history-toast';
  toast.setAttribute('role', 'alert');
  toast.style.cssText = [
    'position:fixed', 'top:22px', 'right:22px', 'z-index:2147483647',
    'width:min(460px,calc(100vw - 44px))', 'padding:16px 18px',
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
  window.setTimeout(() => toast.remove(), tone === 'success' ? 4500 : 8000);
}

function currentStepFromDom(): number | null {
  for (const element of Array.from(document.querySelectorAll<HTMLElement>('p, span, h3'))) {
    const match = element.textContent?.match(/STEP\s*0?([0-5])\s*\/\//i);
    if (match) return Number(match[1]);
  }
  return null;
}

function getBrandName(): string {
  const visible = document.querySelector<HTMLInputElement>('input[placeholder*="Enter brand name"]')?.value.trim();
  if (visible) {
    try { sessionStorage.setItem(BRAND_SESSION_KEY, visible); } catch { /* noop */ }
    return visible;
  }
  try { return sessionStorage.getItem(BRAND_SESSION_KEY)?.trim() || '조사 브랜드'; } catch { return '조사 브랜드'; }
}

function getStepTextarea(button: HTMLButtonElement): HTMLTextAreaElement | null {
  const board = button.closest('section') ?? document;
  return board.querySelector<HTMLTextAreaElement>('textarea');
}

function lockedCompetitorText(): string | null {
  const registry = getActiveCompetitorRegistry();
  if (!registry) return null;
  return registry.selected
    .map((item) => `${item.rank}. ${item.name} — 위협도 ${item.threatScore}/100 — ${item.selectionReason}`)
    .join('\n');
}

function buildStep4Prompt(): string | null {
  const node = RESEARCH_NODES.find((item) => item.step === 4);
  const competitors = lockedCompetitorText();
  if (!node || !competitors) return null;
  const brandName = getBrandName();

  const lockedScope = `[LOCKED COMPETITOR REGISTRY — 변경 금지]\n${competitors}\n\nRegistry 밖 경쟁사를 추가·대체하지 말고 Registry 경쟁사를 누락하지 마십시오.`;
  const contract = buildCreativeHistoryResearchContract(brandName);

  return `[SYSTEM INSTRUCTION]\n${node.systemPrompt}\n\n[USER REQUEST]\n${node.userPromptTemplate.replace('{BRAND_NAME}', brandName)}\n\n${lockedScope}${contract}`;
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

function readPhaseInputs(): Record<number, string> {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(PHASE_INPUTS_SESSION_KEY) || '{}') as Record<string, unknown>;
    return Object.fromEntries(Object.entries(parsed).filter(([, value]) => typeof value === 'string').map(([key, value]) => [Number(key), String(value)]));
  } catch {
    return {};
  }
}

function buildRawResearchData(): string {
  const inputs = readPhaseInputs();
  return RESEARCH_NODES.map((node) => inputs[node.step]?.trim()
    ? `\n\n## 0${node.step}. ${node.title}\n${inputs[node.step].trim()}`
    : '').join('');
}

function augmentCompilerPrompt(basePrompt: string, rawData: string): string {
  const directive = buildCreativeHistoryCompilerDirective(rawData);
  return basePrompt.replace('\n[Brand]\n', `\n${directive}\n\n[Brand]\n`);
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

async function exportCreativeCompilerPrompt(): Promise<void> {
  const rawData = buildRawResearchData();
  if (!parseCreativeHistoryRegistry(rawData)) {
    throw new Error('Step 4 Creative History Registry가 유효하지 않습니다. Step 4를 새 프롬프트로 다시 실행한 뒤 제출해 주세요.');
  }

  const response = await fetch('/template.html?t=' + Date.now());
  if (!response.ok) throw new Error('template.html을 불러올 수 없습니다.');
  let masterHtml = await response.text();
  const brandName = getBrandName();
  const designRef = getBrandDesignReference(brandName);
  const accentColor = designRef.match(/Accent:\s*(#\w+)/i)?.[1] || '#5e6ad2';
  masterHtml = masterHtml.replace(/--hds-brand-accent:\s*#5e6ad2;/g, `--hds-brand-accent: ${accentColor};`);

  const basePrompt = buildReportCompilerPrompt(masterHtml, rawData, brandName);
  const prompt = augmentCompilerPrompt(basePrompt, rawData);
  await copyText(prompt);
  downloadText(prompt, `creative_history_compiler_${brandName || 'export'}.txt`);
}

function handleClick(event: MouseEvent): void {
  const target = event.target;
  if (!(target instanceof Element)) return;
  const button = target.closest<HTMLButtonElement>('button');
  if (!button) return;
  const label = button.textContent?.replace(/\s+/g, ' ').trim() ?? '';
  const step = currentStepFromDom();

  if (label.includes('복사용 AI 프롬프트 가져오기') && step === 4) {
    event.preventDefault();
    event.stopImmediatePropagation();
    const prompt = buildStep4Prompt();
    if (!prompt) {
      showToast('Step 4 프롬프트 생성 실패', 'Step 2 경쟁사 Registry가 없습니다. Step 2 결과를 먼저 정상 제출해 주세요.', 'error');
      return;
    }
    void copyText(prompt).then(() => showToast(
      'Creative History 프롬프트 복사 완료',
      '6개 연도 고정, 실제 카피 검증 상태, 미확인 표준 문구, 브랜드별 Registry JSON 규칙을 포함했습니다.',
    ));
    return;
  }

  if (label.includes('Submit & Continue') && step === 4) {
    const value = getStepTextarea(button)?.value.trim() ?? '';
    if (parseCreativeHistoryRegistry(value)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    showToast(
      'Step 4 제출 중단',
      '유효한 CREATIVE_HISTORY_REGISTRY가 없습니다. 조사 브랜드 1개와 선정 경쟁사 전체에 대해 최근 5개 완료연도 + 현재연도 YTD, 총 6개 연도 데이터가 필요합니다.',
      'error',
    );
    return;
  }

  if (label.includes('프롬프트 추출')) {
    event.preventDefault();
    event.stopImmediatePropagation();
    void exportCreativeCompilerPrompt()
      .then(() => showToast(
        'Creative History 강화 프롬프트 추출 완료',
        '동적 23~40장 구조와 함께 카피 원문 검증·6개년 타임라인·미확인 처리 계약을 포함했습니다.',
      ))
      .catch((error) => showToast('프롬프트 추출 실패', error instanceof Error ? error.message : String(error), 'error'));
  }
}

function validateIframe(iframe: HTMLIFrameElement): void {
  const documentRef = iframe.contentDocument;
  if (!documentRef?.documentElement) return;
  const result = validateCreativeHistoryPages(documentRef);
  if (!result.valid) console.warn('[Creative History Contract]', result.errors);
}

export function installCreativeHistoryContract(): void {
  if (installed || typeof document === 'undefined') return;
  installed = true;

  document.addEventListener('click', handleClick, true);
  const attached = new WeakSet<HTMLIFrameElement>();
  const attach = (iframe: HTMLIFrameElement) => {
    if (attached.has(iframe)) return;
    attached.add(iframe);
    iframe.addEventListener('load', () => validateIframe(iframe));
    if (iframe.contentDocument?.readyState === 'complete') window.setTimeout(() => validateIframe(iframe), 0);
  };
  const scan = (root: ParentNode = document) => root.querySelectorAll<HTMLIFrameElement>('iframe').forEach(attach);
  scan();
  new MutationObserver((mutations) => mutations.forEach((mutation) => mutation.addedNodes.forEach((node) => {
    if (!(node instanceof HTMLElement)) return;
    if (node instanceof HTMLIFrameElement) attach(node);
    scan(node);
  }))).observe(document.documentElement, { childList: true, subtree: true });
}
