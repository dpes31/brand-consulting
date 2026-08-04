import { RESEARCH_NODES } from './prompts';

export interface UserBriefAttachment {
  name: string;
  type: string;
  size: number;
}

export interface UserBriefLock {
  version: 1;
  targetBrand: string;
  mandatoryReviewSeeds: string[];
  mandatoryReviewRaw: string;
  strategicOpponent: string;
  clientNeed: string;
  referenceNote: string;
  attachments: UserBriefAttachment[];
  updatedAt: string;
}

const ACTIVE_BRIEF_KEY = 'brand-consulting:user-brief:active';
const BRIEF_KEY_PREFIX = 'brand-consulting:user-brief:';
const BRIEF_START = '[USER BRIEF LOCK — START]';
const BRIEF_END = '[USER BRIEF LOCK — END]';
const STRATEGIC_FIELD_ID = 'brand-consulting-strategic-opponent';
const STRATEGIC_PATTERN = /(경쟁\s*(?:상대|대상|자는?)|브랜드가\s*아니라|단어\s*자체|카테고리\s*(?:관습|문법|클리셰)|전략적\s*(?:상대|장벽))/i;

let installed = false;
let refreshing = false;
let lastPromptSignature = '';
let lastRestoredBrand = '';

function clean(value: string | null | undefined): string {
  return (value || '').replace(/\r\n/g, '\n').trim();
}

function normalizeBrandKey(value: string): string {
  return encodeURIComponent(clean(value).toLocaleLowerCase('ko-KR'));
}

function briefStorageKey(brandName: string): string {
  return `${BRIEF_KEY_PREFIX}${normalizeBrandKey(brandName)}`;
}

function safeSessionGet(key: string): string {
  try { return sessionStorage.getItem(key) || ''; } catch { return ''; }
}

function safeSessionSet(key: string, value: string): void {
  try { sessionStorage.setItem(key, value); } catch { /* visible state remains available */ }
}

function safeLocalGet(key: string): string {
  try { return localStorage.getItem(key) || ''; } catch { return ''; }
}

function safeLocalSet(key: string, value: string): void {
  try { localStorage.setItem(key, value); } catch { /* session state remains available */ }
}

function parseBrief(raw: string): UserBriefLock | null {
  if (!raw.trim()) return null;
  try {
    const value = JSON.parse(raw) as Partial<UserBriefLock>;
    if (!value.targetBrand?.trim()) return null;
    return {
      version: 1,
      targetBrand: clean(value.targetBrand),
      mandatoryReviewSeeds: Array.isArray(value.mandatoryReviewSeeds)
        ? value.mandatoryReviewSeeds.map((item) => clean(String(item))).filter(Boolean)
        : [],
      mandatoryReviewRaw: clean(value.mandatoryReviewRaw),
      strategicOpponent: clean(value.strategicOpponent),
      clientNeed: clean(value.clientNeed),
      referenceNote: clean(value.referenceNote),
      attachments: Array.isArray(value.attachments)
        ? value.attachments.map((item) => ({
            name: clean(item?.name),
            type: clean(item?.type),
            size: Number(item?.size) || 0,
          })).filter((item) => item.name)
        : [],
      updatedAt: clean(value.updatedAt) || new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

function saveBrief(brief: UserBriefLock): void {
  const raw = JSON.stringify(brief);
  safeSessionSet(ACTIVE_BRIEF_KEY, raw);
  safeLocalSet(briefStorageKey(brief.targetBrand), raw);
}

function findBrandInput(): HTMLInputElement | null {
  if (typeof document === 'undefined') return null;
  return document.querySelector<HTMLInputElement>('input[placeholder*="Enter brand name"]');
}

function findControlByLabel(fragment: string): HTMLInputElement | HTMLTextAreaElement | null {
  if (typeof document === 'undefined') return null;
  const label = Array.from(document.querySelectorAll<HTMLElement>('label'))
    .find((item) => clean(item.textContent).includes(fragment));
  return label?.parentElement?.querySelector<HTMLInputElement | HTMLTextAreaElement>('input, textarea') || null;
}

function findCompetitorControl(): HTMLInputElement | HTMLTextAreaElement | null {
  return findControlByLabel('필수 포함 경쟁사')
    || findControlByLabel('필수 검토 경쟁사')
    || document.querySelector<HTMLInputElement>('input[placeholder*="삼성카드"]');
}

function findClientNeedControl(): HTMLInputElement | HTMLTextAreaElement | null {
  return findControlByLabel('광고주 핵심 니즈')
    || document.querySelector<HTMLTextAreaElement>('textarea[placeholder*="TV CF"]');
}

function findReferenceControl(): HTMLInputElement | HTMLTextAreaElement | null {
  return findControlByLabel('첨부 참고자료 안내')
    || document.querySelector<HTMLTextAreaElement>('textarea[placeholder*="RFP 문서"]');
}

function findStrategicControl(): HTMLTextAreaElement | null {
  if (typeof document === 'undefined') return null;
  return document.getElementById(STRATEGIC_FIELD_ID) as HTMLTextAreaElement | null;
}

function setControlledValue(control: HTMLInputElement | HTMLTextAreaElement, value: string): void {
  const prototype = control instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
  if (setter) setter.call(control, value);
  else control.value = value;
  control.dispatchEvent(new Event('input', { bubbles: true }));
  control.dispatchEvent(new Event('change', { bubbles: true }));
}

function dedupe(values: string[]): string[] {
  const seen = new Set<string>();
  return values.filter((value) => {
    const key = value.toLocaleLowerCase('ko-KR').replace(/\s+/g, '');
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function splitCompetitorAndStrategicOpponent(
  rawInput: string,
  explicitStrategicOpponent = '',
): { seeds: string[]; strategicOpponent: string; cleanedCompetitorText: string } {
  let source = clean(rawInput)
    .replace(/^\s*[-•·]?\s*필수\s*(?:포함|검토)?\s*경쟁사\s*[:：-]?\s*/i, '');
  const extracted: string[] = [];

  source = source.replace(/\(([^)]*)\)/g, (full, inside: string) => {
    if (STRATEGIC_PATTERN.test(inside)) {
      extracted.push(clean(inside));
      return '';
    }
    return full;
  });

  const competitorParts: string[] = [];
  source.split(/\n|,|;/).forEach((part) => {
    const value = clean(part).replace(/^[-•·\d.)\s]+/, '').trim();
    if (!value) return;
    if (STRATEGIC_PATTERN.test(value)) extracted.push(value);
    else competitorParts.push(value);
  });

  const seeds = dedupe(competitorParts);
  const strategicOpponent = clean(explicitStrategicOpponent) || dedupe(extracted).join(' / ');
  return { seeds, strategicOpponent, cleanedCompetitorText: seeds.join(', ') };
}

function readAttachmentManifest(previous: UserBriefLock | null): UserBriefAttachment[] {
  if (typeof document === 'undefined') return previous?.attachments || [];
  const files = Array.from(document.querySelectorAll<HTMLInputElement>('input[type="file"]'))
    .flatMap((input) => Array.from(input.files || []));
  if (!files.length) return previous?.attachments || [];
  return files.map((file) => ({ name: file.name, type: file.type, size: file.size }));
}

function currentBrandName(fallback = ''): string {
  return clean(findBrandInput()?.value) || clean(fallback);
}

export function captureActiveUserBrief(fallbackBrand = ''): UserBriefLock {
  const targetBrand = currentBrandName(fallbackBrand);
  const previous = getStoredUserBrief(targetBrand);
  const competitorRaw = clean(findCompetitorControl()?.value) || previous?.mandatoryReviewRaw || '';
  const explicitStrategic = clean(findStrategicControl()?.value) || previous?.strategicOpponent || '';
  const parsed = splitCompetitorAndStrategicOpponent(competitorRaw, explicitStrategic);

  const brief: UserBriefLock = {
    version: 1,
    targetBrand,
    mandatoryReviewSeeds: parsed.seeds.length ? parsed.seeds : previous?.mandatoryReviewSeeds || [],
    mandatoryReviewRaw: parsed.cleanedCompetitorText || previous?.mandatoryReviewRaw || '',
    strategicOpponent: parsed.strategicOpponent,
    clientNeed: clean(findClientNeedControl()?.value) || previous?.clientNeed || '',
    referenceNote: clean(findReferenceControl()?.value) || previous?.referenceNote || '',
    attachments: readAttachmentManifest(previous),
    updatedAt: new Date().toISOString(),
  };

  if (brief.targetBrand) saveBrief(brief);
  applyBriefToResearchPrompts(brief);
  return brief;
}

export function getStoredUserBrief(brandName: string): UserBriefLock | null {
  const brand = clean(brandName);
  if (!brand) return parseBrief(safeSessionGet(ACTIVE_BRIEF_KEY));
  const active = parseBrief(safeSessionGet(ACTIVE_BRIEF_KEY));
  if (active && active.targetBrand === brand) return active;
  return parseBrief(safeLocalGet(briefStorageKey(brand)));
}

export function getActiveUserBrief(brandName = ''): UserBriefLock {
  const brand = clean(brandName) || currentBrandName();
  const visibleBrand = currentBrandName();
  if (typeof document !== 'undefined' && visibleBrand && (!brand || brand === visibleBrand)) {
    return captureActiveUserBrief(brand);
  }
  return getStoredUserBrief(brand) || {
    version: 1,
    targetBrand: brand,
    mandatoryReviewSeeds: [],
    mandatoryReviewRaw: '',
    strategicOpponent: '',
    clientNeed: '',
    referenceNote: '',
    attachments: [],
    updatedAt: new Date().toISOString(),
  };
}

function attachmentLines(brief: UserBriefLock): string {
  if (!brief.attachments.length) return '- 없음 또는 외부 AI에서 별도 첨부';
  return brief.attachments.map((item) => `- ${item.name} · ${item.type || 'unknown'} · ${item.size} bytes`).join('\n');
}

export function buildUserBriefPromptBlock(brief: UserBriefLock, step?: number): string {
  const stepFocus = step === undefined
    ? 'Step 0~5 전체와 Phase 6에서 동일하게 유지하십시오.'
    : `Step ${step} 분석에서도 원문을 삭제·축약하지 말고 관련 항목을 우선 Constraint로 적용하십시오.`;
  return `${BRIEF_START}
이 블록은 사용자가 직접 입력한 과제 Brief입니다. AI가 재해석해 삭제하거나 다른 브랜드 정보로 대체할 수 없습니다.
- targetBrand: ${brief.targetBrand || '미입력'}
- mandatoryReviewSeeds: ${brief.mandatoryReviewSeeds.length ? brief.mandatoryReviewSeeds.join(' | ') : '미입력'}
- strategicOpponent / categoryConvention: ${brief.strategicOpponent || '미입력'}
- clientNeed / campaignDirection: ${brief.clientNeed || '미입력'}
- referenceNote: ${brief.referenceNote || '미입력'}
- attachmentManifest:
${attachmentLines(brief)}

적용 규칙:
1. mandatoryReviewSeeds는 반드시 검토할 후보이며 자동 최종 선정 명단이 아닙니다.
2. strategicOpponent는 기업명이 아니므로 Competitor Registry의 브랜드명으로 넣지 마십시오.
3. clientNeed는 조사 결론을 왜곡하는 가짜 사실이 아니라 최종 전략이 충족해야 할 광고주 Constraint입니다.
4. referenceNote와 첨부자료에서 확인되지 않은 사실은 만들지 마십시오.
5. ${stepFocus}
${BRIEF_END}`;
}

function stripBriefBlock(source: string): string {
  const escapedStart = BRIEF_START.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const escapedEnd = BRIEF_END.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return source.replace(new RegExp(`\\n*${escapedStart}[\\s\\S]*?${escapedEnd}`, 'g'), '').trimEnd();
}

export function applyBriefToResearchPrompts(brief: UserBriefLock): void {
  if (!brief.targetBrand) return;
  const signature = JSON.stringify(brief);
  if (signature === lastPromptSignature) return;
  lastPromptSignature = signature;
  RESEARCH_NODES.forEach((node) => {
    node.userPromptTemplate = `${stripBriefBlock(node.userPromptTemplate)}\n\n${buildUserBriefPromptBlock(brief, node.step)}`;
  });
}

function ensureStrategicOpponentControl(): void {
  if (typeof document === 'undefined' || findStrategicControl()) return;
  const competitor = findCompetitorControl();
  const container = competitor?.parentElement;
  if (!competitor || !container?.parentElement) return;

  const wrapper = document.createElement('div');
  wrapper.className = 'space-y-1.5';
  wrapper.dataset.userBriefStrategicOpponent = 'true';

  const label = document.createElement('label');
  label.className = 'flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest';
  label.htmlFor = STRATEGIC_FIELD_ID;
  label.innerHTML = '<span class="h-4 w-4 bg-amber-500/20 text-amber-300 rounded text-[9px] flex items-center justify-center font-black">!</span>전략적 경쟁 상대 / 카테고리 관습<span class="text-slate-600 font-normal normal-case">— 기업 경쟁사와 분리해 전 단계에 유지</span>';

  const textarea = document.createElement('textarea');
  textarea.id = STRATEGIC_FIELD_ID;
  textarea.rows = 2;
  textarea.className = 'w-full px-3 py-2.5 bg-white/5 border border-amber-400/30 rounded-lg text-sm outline-none focus:border-amber-300/70 placeholder:text-slate-600 resize-none transition-colors';
  textarea.placeholder = "예: 이 과제의 경쟁 상대는 브랜드가 아니라 '위생'이라는 단어 자체다";

  wrapper.append(label, textarea);
  container.parentElement.insertBefore(wrapper, container.nextSibling);

  const parsed = splitCompetitorAndStrategicOpponent(competitor.value, '');
  if (parsed.strategicOpponent) {
    textarea.value = parsed.strategicOpponent;
    if (parsed.cleanedCompetitorText && parsed.cleanedCompetitorText !== competitor.value) {
      setControlledValue(competitor, parsed.cleanedCompetitorText);
    }
  }
}

function restoreBriefToVisibleControls(): void {
  const brand = currentBrandName();
  if (!brand || brand === lastRestoredBrand) return;
  const brief = getStoredUserBrief(brand);
  lastRestoredBrand = brand;
  if (!brief) return;

  const competitor = findCompetitorControl();
  const clientNeed = findClientNeedControl();
  const reference = findReferenceControl();
  const strategic = findStrategicControl();
  if (competitor && !clean(competitor.value)) setControlledValue(competitor, brief.mandatoryReviewRaw);
  if (clientNeed && !clean(clientNeed.value)) setControlledValue(clientNeed, brief.clientNeed);
  if (reference && !clean(reference.value)) setControlledValue(reference, brief.referenceNote);
  if (strategic && !clean(strategic.value)) setControlledValue(strategic, brief.strategicOpponent);
  applyBriefToResearchPrompts(brief);
}

function refresh(): void {
  if (refreshing || typeof document === 'undefined') return;
  refreshing = true;
  try {
    ensureStrategicOpponentControl();
    restoreBriefToVisibleControls();
  } finally {
    refreshing = false;
  }
}

function handleInput(event: Event): void {
  const target = event.target;
  if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return;
  if (target === findBrandInput()) lastRestoredBrand = '';
  if (
    target === findBrandInput()
    || target === findCompetitorControl()
    || target === findClientNeedControl()
    || target === findReferenceControl()
    || target === findStrategicControl()
    || target.type === 'file'
  ) {
    window.setTimeout(() => captureActiveUserBrief(), 0);
  }
}

function handleClick(event: MouseEvent): void {
  const target = event.target;
  if (!(target instanceof Element)) return;
  const button = target.closest('button');
  if (!button) return;
  const label = clean(button.textContent);
  if (label.includes('Start Engine') || label.includes('복사용 AI 프롬프트') || label.includes('완성 HTML 프롬프트')) {
    captureActiveUserBrief();
  }
}

export function installUserBriefContract(): void {
  if (installed || typeof document === 'undefined') return;
  installed = true;
  document.addEventListener('input', handleInput, true);
  document.addEventListener('change', handleInput, true);
  document.addEventListener('click', handleClick, true);
  const observer = new MutationObserver(refresh);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('DOMContentLoaded', refresh);
  window.setInterval(() => {
    refresh();
    const active = getStoredUserBrief(currentBrandName());
    if (active) applyBriefToResearchPrompts(active);
  }, 750);
  window.setTimeout(refresh, 150);
}
