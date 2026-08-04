import { splitCompetitorAndStrategicOpponent } from './userBriefContract';

const STRATEGIC_FIELD_ID = 'brand-consulting-strategic-opponent';
let installed = false;
let applying = false;

function clean(value: string | null | undefined): string {
  return (value || '').replace(/\s+/g, ' ').trim();
}

function findCompetitorControl(): HTMLInputElement | HTMLTextAreaElement | null {
  const label = Array.from(document.querySelectorAll<HTMLElement>('label'))
    .find((item) => /필수 (?:포함|검토) 경쟁사/.test(clean(item.textContent)));
  return label?.parentElement?.querySelector<HTMLInputElement | HTMLTextAreaElement>('input, textarea')
    || document.querySelector<HTMLInputElement>('input[placeholder*="삼성카드"]');
}

function findStrategicControl(): HTMLTextAreaElement | null {
  return document.getElementById(STRATEGIC_FIELD_ID) as HTMLTextAreaElement | null;
}

function setNativeValue(control: HTMLInputElement | HTMLTextAreaElement, value: string): void {
  if (control.value === value) return;
  const prototype = control instanceof HTMLTextAreaElement
    ? HTMLTextAreaElement.prototype
    : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
  if (setter) setter.call(control, value);
  else control.value = value;
  control.dispatchEvent(new Event('input', { bubbles: true }));
  control.dispatchEvent(new Event('change', { bubbles: true }));
}

function normalizeVisibleBrief(): void {
  if (applying) return;
  const competitor = findCompetitorControl();
  const strategic = findStrategicControl();
  if (!competitor || !strategic) return;

  const parsed = splitCompetitorAndStrategicOpponent(competitor.value, strategic.value);
  const containsStrategicText = parsed.strategicOpponent
    && parsed.cleanedCompetitorText !== clean(competitor.value);
  if (!containsStrategicText) return;

  applying = true;
  try {
    if (!clean(strategic.value)) setNativeValue(strategic, parsed.strategicOpponent);
    if (parsed.cleanedCompetitorText) setNativeValue(competitor, parsed.cleanedCompetitorText);
  } finally {
    applying = false;
  }
}

function stabilizePhase6UploadInput(): void {
  const input = document.querySelector<HTMLInputElement>('input[data-phase6-html-upload]');
  if (!input || input.dataset.accessibleFileInput === 'true') return;
  input.hidden = false;
  input.tabIndex = -1;
  input.setAttribute('aria-hidden', 'true');
  input.style.cssText = [
    'position:absolute',
    'width:1px',
    'height:1px',
    'opacity:0',
    'overflow:hidden',
    'pointer-events:none',
  ].join(';');
  input.dataset.accessibleFileInput = 'true';
}

function refresh(): void {
  normalizeVisibleBrief();
  stabilizePhase6UploadInput();
}

export function installUserBriefInputNormalizer(): void {
  if (installed || typeof document === 'undefined') return;
  installed = true;
  document.addEventListener('input', (event) => {
    if (event.target === findCompetitorControl()) window.setTimeout(normalizeVisibleBrief, 0);
  }, true);
  document.addEventListener('change', (event) => {
    if (event.target === findCompetitorControl()) window.setTimeout(normalizeVisibleBrief, 0);
  }, true);
  const observer = new MutationObserver(refresh);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.setInterval(refresh, 500);
  window.setTimeout(refresh, 150);
}
