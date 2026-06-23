import {
  isVisualIntentStep,
  validateVisualIntentBrief,
  type VisualIntentStep,
} from './visualIntentBrief';

let installed = false;
const AUDIT_KEY = 'brand-consulting:visual-intent-audit';

interface VisualIntentAuditEntry {
  timestamp: string;
  step: VisualIntentStep;
  valid: boolean;
  briefCount: number;
  primaryRecipes: string[];
  warnings: string[];
  errors: string[];
}

function currentStepFromDom(): number | null {
  for (const element of Array.from(document.querySelectorAll<HTMLElement>('p, span, h3'))) {
    const match = element.textContent?.match(/STEP\s*0?([0-5])\s*\/\//i);
    if (match) return Number(match[1]);
  }
  return null;
}

function getTextarea(button: HTMLButtonElement): HTMLTextAreaElement | null {
  const board = button.closest('section') ?? document;
  return board.querySelector<HTMLTextAreaElement>('textarea');
}

function showToast(title: string, message: string, tone: 'success' | 'warning' | 'error'): void {
  document.getElementById('visual-intent-toast')?.remove();
  const toast = document.createElement('div');
  toast.id = 'visual-intent-toast';
  toast.setAttribute('role', 'alert');
  const border = tone === 'success' ? 'rgba(45,212,191,.6)' : tone === 'warning' ? 'rgba(251,191,36,.65)' : 'rgba(248,113,113,.7)';
  const heading = tone === 'success' ? '#5eead4' : tone === 'warning' ? '#fde68a' : '#fca5a5';
  toast.style.cssText = [
    'position:fixed', 'top:22px', 'right:22px', 'z-index:2147483647',
    'width:min(480px,calc(100vw - 44px))', 'padding:16px 18px',
    'border-radius:12px', 'background:#111827', `border:1px solid ${border}`,
    'box-shadow:0 18px 60px rgba(0,0,0,.48)',
    'font-family:Inter,Noto Sans KR,sans-serif', 'color:#f8fafc',
  ].join(';');
  const titleElement = document.createElement('div');
  titleElement.textContent = title;
  titleElement.style.cssText = `font-size:14px;font-weight:800;margin-bottom:6px;color:${heading}`;
  const body = document.createElement('div');
  body.textContent = message;
  body.style.cssText = 'font-size:12px;line-height:1.55;color:#cbd5e1;white-space:pre-line';
  toast.append(titleElement, body);
  document.body.appendChild(toast);
  window.setTimeout(() => toast.remove(), tone === 'error' ? 9000 : 5500);
}

function readAudit(): VisualIntentAuditEntry[] {
  try {
    const value = JSON.parse(sessionStorage.getItem(AUDIT_KEY) || '[]');
    return Array.isArray(value) ? value as VisualIntentAuditEntry[] : [];
  } catch {
    return [];
  }
}

function writeAudit(entry: VisualIntentAuditEntry): void {
  try {
    const audit = [...readAudit(), entry].slice(-30);
    sessionStorage.setItem(AUDIT_KEY, JSON.stringify(audit));
  } catch {
    // Validation still works when storage is unavailable.
  }
}

function handleClick(event: MouseEvent): void {
  const target = event.target;
  if (!(target instanceof Element)) return;
  const button = target.closest<HTMLButtonElement>('button');
  if (!button || !button.textContent?.includes('Submit & Continue')) return;

  const step = currentStepFromDom();
  if (step === null || !isVisualIntentStep(step)) return;
  const value = getTextarea(button)?.value.trim() ?? '';
  const result = validateVisualIntentBrief(value, step);
  const entry: VisualIntentAuditEntry = {
    timestamp: new Date().toISOString(),
    step,
    valid: result.valid,
    briefCount: result.registry?.visualBriefs.length ?? 0,
    primaryRecipes: result.registry?.visualBriefs.map((brief) => brief.primaryRecipe.recipeId) ?? [],
    warnings: result.warnings,
    errors: result.errors,
  };
  writeAudit(entry);

  if (!result.valid) {
    event.preventDefault();
    event.stopImmediatePropagation();
    showToast(
      `Step ${step} Visual Intent 제출 중단`,
      result.errors.slice(0, 5).map((error, index) => `${index + 1}. ${error}`).join('\n'),
      'error',
    );
    return;
  }

  if (result.warnings.length > 0) {
    showToast(
      `Step ${step} Visual Intent 통과 — 확인 필요`,
      `Brief ${entry.briefCount}개가 유효합니다.\n${result.warnings.slice(0, 3).join('\n')}`,
      'warning',
    );
    return;
  }

  showToast(
    `Step ${step} Visual Intent 검증 통과`,
    `Brief ${entry.briefCount}개 · Primary Recipe: ${entry.primaryRecipes.join(', ')}`,
    'success',
  );
}

export function installVisualIntentWorkflowGuard(): void {
  if (installed || typeof document === 'undefined') return;
  installed = true;
  document.addEventListener('click', handleClick, true);
}
