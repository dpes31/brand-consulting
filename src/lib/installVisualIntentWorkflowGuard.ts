import { parseCompetitorRegistry } from './competitorSelection';
import {
  isVisualIntentStep,
  validateVisualIntentBrief,
  type VisualIntentBrief,
  type VisualIntentRegistry,
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
  responseFingerprint?: string;
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
    'width:min(500px,calc(100vw - 44px))', 'padding:16px 18px',
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
  window.setTimeout(() => toast.remove(), tone === 'error' ? 9000 : 7000);
}

function readAudit(): VisualIntentAuditEntry[] {
  try {
    const value = JSON.parse(sessionStorage.getItem(AUDIT_KEY) || '[]');
    return Array.isArray(value) ? value as VisualIntentAuditEntry[] : [];
  } catch {
    return [];
  }
}

function writeAudit(entries: VisualIntentAuditEntry[]): void {
  try {
    sessionStorage.setItem(AUDIT_KEY, JSON.stringify(entries.slice(-30)));
  } catch {
    // Validation still works when storage is unavailable.
  }
}

function normalizeForFingerprint(value: string): string {
  return value.replace(/\r\n/g, '\n').replace(/[ \t]+/g, ' ').trim();
}

function responseFingerprint(value: string): string {
  const normalized = normalizeForFingerprint(value);
  let hash = 2166136261;
  for (let index = 0; index < normalized.length; index += 1) {
    hash ^= normalized.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

function recipeSignature(entry: VisualIntentAuditEntry): string {
  return [...entry.primaryRecipes].sort().join('|');
}

function stabilitySummary(audit: VisualIntentAuditEntry[], entry: VisualIntentAuditEntry): string {
  const comparable = [...audit.filter((item) => item.valid && item.step === entry.step), entry].slice(-3);
  if (comparable.length < 2) return '반복 안정성: 첫 번째 서로 다른 AI 응답';
  const currentSignature = recipeSignature(entry);
  const matches = comparable.filter((item) => recipeSignature(item) === currentSignature).length;
  const rate = Math.round((matches / comparable.length) * 100);
  return `최근 ${comparable.length}개 서로 다른 AI 응답의 Recipe 일치율: ${rate}%`;
}

function briefText(brief: VisualIntentBrief): string {
  return [
    brief.section,
    brief.preferredSlideId ?? '',
    brief.decisionQuestion,
    brief.coreMessage,
    brief.selectionReason,
    ...brief.requiredInputs,
  ].join(' ').toLowerCase();
}

function isThreatRankingBrief(brief: VisualIntentBrief): boolean {
  const recipe = brief.primaryRecipe.recipeId;
  const haystack = briefText(brief);
  return recipe === 'rank-scorecard'
    || (recipe === 'evidence-gap' && /threat.*rank|rank.*threat|위협.*순위|순위.*위협|위협도/.test(haystack));
}

function isProductMatrixBrief(brief: VisualIntentBrief): boolean {
  const recipe = brief.primaryRecipe.recipeId;
  const haystack = briefText(brief);
  return recipe === 'feature-matrix'
    || (recipe === 'evidence-gap' && /product matrix|feature matrix|제품.*매트릭스|기능.*매트릭스|공통.*비교축/.test(haystack));
}

function isPositioningMapBrief(brief: VisualIntentBrief): boolean {
  const recipe = brief.primaryRecipe.recipeId;
  const haystack = briefText(brief);
  return recipe === 'positioning-map'
    || (recipe === 'evidence-gap' && /positioning|포지셔닝/.test(haystack));
}

function isCompetitorDeepDiveBrief(brief: VisualIntentBrief): boolean {
  const recipe = brief.primaryRecipe.recipeId;
  const haystack = briefText(brief);
  return recipe === 'competitor-threat-system'
    || (recipe === 'evidence-gap' && /deep dive|deep-dive|딥다이브|core desire|threat mechanism|attack point|위협 메커니즘|공격 지점/.test(haystack));
}

function addStep2CoverageErrors(
  raw: string,
  registry: VisualIntentRegistry,
  errors: string[],
): void {
  const competitorRegistry = parseCompetitorRegistry(raw);
  if (!competitorRegistry) return;

  const selectedNames = competitorRegistry.selected.map((competitor) => competitor.name);
  const selectedSet = new Set(selectedNames);
  const rankingBriefs = registry.visualBriefs.filter(isThreatRankingBrief);
  const matrixBriefs = registry.visualBriefs.filter(isProductMatrixBrief);
  const positioningBriefs = registry.visualBriefs.filter(isPositioningMapBrief);
  const deepDiveBriefs = registry.visualBriefs.filter(isCompetitorDeepDiveBrief);

  if (rankingBriefs.length !== 1) {
    errors.push(`Step 2에는 Threat Ranking용 rank-scorecard 또는 evidence-gap Brief가 정확히 1개 필요합니다. 현재 ${rankingBriefs.length}개입니다.`);
  }

  if (matrixBriefs.length !== 1) {
    errors.push(`Step 2에는 Product Matrix용 feature-matrix 또는 evidence-gap Brief가 정확히 1개 필요합니다. 현재 ${matrixBriefs.length}개입니다.`);
  }

  if (positioningBriefs.length > 1) {
    errors.push(`Step 2 Positioning Map Brief는 최대 1개만 허용됩니다. 현재 ${positioningBriefs.length}개입니다.`);
  }

  deepDiveBriefs.forEach((brief) => {
    const matchedSelected = brief.entities.filter((entity) => selectedSet.has(entity));
    if (matchedSelected.length !== 1) {
      errors.push(`${brief.insightId}: Deep Dive entities에는 COMPETITOR_REGISTRY selected 경쟁사명 정확히 1개만 넣어야 합니다.`);
    }
  });

  selectedNames.forEach((competitorName) => {
    const matches = deepDiveBriefs.filter((brief) => brief.entities.includes(competitorName));
    if (matches.length === 0) {
      errors.push(`Step 2 Deep Dive에서 선정 경쟁사 '${competitorName}'가 누락됐습니다.`);
    } else if (matches.length > 1) {
      errors.push(`Step 2 Deep Dive에서 선정 경쟁사 '${competitorName}'가 ${matches.length}개 Brief에 중복됐습니다. 경쟁사별 정확히 1개만 작성해야 합니다.`);
    }
  });

  const unknownDeepDiveEntities = deepDiveBriefs
    .flatMap((brief) => brief.entities)
    .filter((entity) => entity && !selectedSet.has(entity));
  if (unknownDeepDiveEntities.length > 0) {
    errors.push(`Step 2 Deep Dive에 Registry 밖의 경쟁사가 포함됐습니다: ${[...new Set(unknownDeepDiveEntities)].join(', ')}`);
  }
}

function addCoverageErrors(step: VisualIntentStep, raw: string, registry: VisualIntentRegistry | null, errors: string[]): void {
  if (!registry) return;
  const recipes = registry.visualBriefs.map((brief) => brief.primaryRecipe.recipeId);

  if (step === 0 && !recipes.some((recipe) => recipe === 'milestone-timeline' || recipe === 'growth-trajectory' || recipe === 'evidence-gap')) {
    errors.push('Step 0에는 Growth Story용 milestone-timeline, growth-trajectory 또는 evidence-gap Brief가 필요합니다.');
  }

  if (step === 2) addStep2CoverageErrors(raw, registry, errors);
}

function handleClick(event: MouseEvent): void {
  const target = event.target;
  if (!(target instanceof Element)) return;
  const button = target.closest<HTMLButtonElement>('button');
  if (!button || !button.textContent?.includes('Submit & Continue')) return;

  const step = currentStepFromDom();
  if (step === null || !isVisualIntentStep(step)) return;
  const value = getTextarea(button)?.value.trim() ?? '';
  const fingerprint = responseFingerprint(value);
  const audit = readAudit();

  const duplicate = audit.find((item) => item.step === step && item.responseFingerprint === fingerprint);
  if (duplicate) {
    event.preventDefault();
    event.stopImmediatePropagation();
    showToast(
      `Step ${step} 동일 응답 재제출`,
      '같은 AI 답변을 여러 번 Submit하는 것은 반복 테스트로 계산하지 않습니다.\n같은 프롬프트를 AI에 다시 실행해 새 응답을 받은 뒤, 새 응답 전체를 붙여 넣어 주세요.',
      'warning',
    );
    return;
  }

  const result = validateVisualIntentBrief(value, step);
  addCoverageErrors(step, value, result.registry, result.errors);
  result.valid = result.errors.length === 0;

  const entry: VisualIntentAuditEntry = {
    timestamp: new Date().toISOString(),
    step,
    valid: result.valid,
    briefCount: result.registry?.visualBriefs.length ?? 0,
    primaryRecipes: result.registry?.visualBriefs.map((brief) => brief.primaryRecipe.recipeId) ?? [],
    warnings: result.warnings,
    errors: result.errors,
    responseFingerprint: fingerprint,
  };
  const stability = result.valid ? stabilitySummary(audit, entry) : '';
  writeAudit([...audit, entry]);

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
      `Step ${step} Visual Intent 통과 — 참고 경고`,
      `Brief ${entry.briefCount}개가 유효합니다.\n${stability}\n${result.warnings.slice(0, 3).join('\n')}`,
      'warning',
    );
    return;
  }

  showToast(
    `Step ${step} Visual Intent 검증 통과`,
    `Brief ${entry.briefCount}개 · Primary Recipe: ${entry.primaryRecipes.join(', ')}\n${stability}`,
    'success',
  );
}

export function installVisualIntentWorkflowGuard(): void {
  if (installed || typeof document === 'undefined') return;
  installed = true;
  document.addEventListener('click', handleClick, true);
}
