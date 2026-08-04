import {
  mergeUserBrief,
  parseCompetitorSetting,
  persistUserBrief,
  readUserBrief,
  type UserBriefLock,
} from './userBriefLock';

let installed = false;
let refreshing = false;
let lastBrand = '';

function normalize(value: string | null | undefined): string {
  return (value || '').replace(/\s+/g, ' ').trim();
}

function nativeSet(control: HTMLInputElement | HTMLTextAreaElement, value: string): void {
  const prototype = control instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
  if (!setter) return;
  setter.call(control, value);
  control.dispatchEvent(new Event('input', { bubbles: true }));
  control.dispatchEvent(new Event('change', { bubbles: true }));
}

function brandControl(): HTMLInputElement | null {
  return document.querySelector<HTMLInputElement>('input[placeholder*="Enter brand name"]');
}

function findControlByLabel(fragment: string): HTMLInputElement | HTMLTextAreaElement | null {
  const label = Array.from(document.querySelectorAll<HTMLElement>('label'))
    .find((item) => normalize(item.textContent).includes(fragment));
  return label?.parentElement?.querySelector<HTMLInputElement | HTMLTextAreaElement>('input,textarea') || null;
}

function strategicControl(): HTMLTextAreaElement | null {
  return document.querySelector<HTMLTextAreaElement>('textarea[data-user-brief-strategic-opponent="true"]');
}

function installStrategicOpponentControl(): void {
  if (strategicControl()) return;
  const competitor = findControlByLabel('필수 포함 경쟁사') || findControlByLabel('필수 검토 경쟁사');
  const wrapper = competitor?.parentElement;
  if (!competitor || !wrapper) return;

  const box = document.createElement('div');
  box.dataset.userBriefStrategicOpponentBox = 'true';
  box.className = 'mt-3 space-y-1.5';

  const label = document.createElement('label');
  label.className = 'flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest';
  label.textContent = '전략적 경쟁 프레임';

  const hint = document.createElement('span');
  hint.className = 'text-slate-600 font-normal normal-case';
  hint.textContent = '— 브랜드 후보와 분리해 카테고리 관습·언어 장벽으로 분석';
  label.appendChild(hint);

  const textarea = document.createElement('textarea');
  textarea.rows = 2;
  textarea.dataset.userBriefStrategicOpponent = 'true';
  textarea.className = 'w-full px-3 py-2.5 bg-white/5 border border-amber-400/30 rounded-lg text-sm outline-none focus:border-amber-300/60 placeholder:text-slate-600 resize-none transition-colors';
  textarea.placeholder = "예: 이 과제의 경쟁 상대는 브랜드가 아니라 '위생'이라는 단어 자체다";

  const note = document.createElement('p');
  note.className = 'text-[10px] text-slate-600 px-1';
  note.textContent = '경쟁사 입력란에 괄호로 함께 작성한 전략 문장도 자동 분리해 보존합니다.';

  box.append(label, textarea, note);
  wrapper.appendChild(box);
}

function visibleBrief(): UserBriefLock {
  const brand = brandControl()?.value.trim() || readUserBrief().targetBrand;
  const stored = readUserBrief(brand);
  const competitorRaw = (findControlByLabel('필수 포함 경쟁사') || findControlByLabel('필수 검토 경쟁사'))?.value || '';
  const parsed = parseCompetitorSetting(competitorRaw);
  const explicitOpponent = strategicControl()?.value.trim() || '';
  return {
    ...stored,
    targetBrand: brand,
    mandatoryReviewSeeds: parsed.mandatoryReviewSeeds.length ? parsed.mandatoryReviewSeeds : stored.mandatoryReviewSeeds,
    strategicOpponent: explicitOpponent || parsed.strategicOpponent || stored.strategicOpponent,
    clientNeed: findControlByLabel('광고주 핵심 니즈')?.value.trim() || stored.clientNeed,
    referenceNote: findControlByLabel('첨부 참고자료 안내')?.value.trim() || stored.referenceNote,
  };
}

function hydrate(brief: UserBriefLock): void {
  const competitor = findControlByLabel('필수 포함 경쟁사') || findControlByLabel('필수 검토 경쟁사');
  const client = findControlByLabel('광고주 핵심 니즈');
  const reference = findControlByLabel('첨부 참고자료 안내');
  const strategic = strategicControl();

  if (competitor && !competitor.value.trim() && brief.mandatoryReviewSeeds.length) {
    nativeSet(competitor, brief.mandatoryReviewSeeds.join(', '));
  }
  if (client && !client.value.trim() && brief.clientNeed) nativeSet(client, brief.clientNeed);
  if (reference && !reference.value.trim() && brief.referenceNote) nativeSet(reference, brief.referenceNote);
  if (strategic && !strategic.value.trim() && brief.strategicOpponent) nativeSet(strategic, brief.strategicOpponent);
}

function refresh(): void {
  if (refreshing) return;
  refreshing = true;
  try {
    installStrategicOpponentControl();
    const brand = brandControl()?.value.trim() || '';
    if (brand && brand !== lastBrand) {
      lastBrand = brand;
      hydrate(readUserBrief(brand));
    } else if (brand) {
      const strategic = strategicControl();
      if (strategic && !strategic.value.trim()) hydrate(readUserBrief(brand));
    }
  } finally {
    refreshing = false;
  }
}

function captureAttachments(input: HTMLInputElement): void {
  const files = Array.from(input.files || []);
  if (!files.length) return;
  const brief = visibleBrief();
  mergeUserBrief(brief, {
    attachments: files.map((file) => ({ name: file.name, size: file.size, type: file.type })),
  });
}

function handleInput(event: Event): void {
  const target = event.target;
  if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return;
  if (target.type === 'file') return;
  if (
    target === brandControl()
    || target === strategicControl()
    || target === findControlByLabel('필수 포함 경쟁사')
    || target === findControlByLabel('필수 검토 경쟁사')
    || target === findControlByLabel('광고주 핵심 니즈')
    || target === findControlByLabel('첨부 참고자료 안내')
  ) {
    persistUserBrief(visibleBrief());
  }
}

function handleChange(event: Event): void {
  const target = event.target;
  if (!(target instanceof HTMLInputElement) || target.type !== 'file') return;
  const label = target.closest('label')?.textContent || '';
  if (/RFP|참고 파일|첨부/.test(label)) captureAttachments(target);
}

export function installUserBriefLock(): void {
  if (installed || typeof document === 'undefined') return;
  installed = true;
  document.addEventListener('input', handleInput, true);
  document.addEventListener('change', handleChange, true);
  document.addEventListener('click', (event) => {
    const button = event.target instanceof Element ? event.target.closest('button') : null;
    if (button && /Start Engine|Submit & Continue/.test(normalize(button.textContent))) {
      persistUserBrief(visibleBrief());
    }
  }, true);
  const observer = new MutationObserver(refresh);
  observer.observe(document.documentElement, { subtree: true, childList: true });
  window.addEventListener('DOMContentLoaded', refresh);
  window.setTimeout(refresh, 350);
}
