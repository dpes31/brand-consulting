import { RESEARCH_NODES } from './prompts';
import {
  VISUAL_INTENT_BRIEF_END,
  VISUAL_INTENT_BRIEF_START,
  validateVisualIntentBrief,
  type VisualIntentBrief,
} from './visualIntentBrief';

let installed = false;

const STEP5_HEADER = '[VISUAL INTENT BRIEF — GATE 2A TEST]';

const STEP5_RECIPE_TO_EVIDENCE: Record<string, string> = {
  'choice-architecture': 'strategic-choice',
  'as-is-to-be': 'causal-relationship',
  'swot-to-strategy': 'causal-relationship',
  roadmap: 'execution-roadmap',
  'evidence-gap': 'evidence-gap',
};

const STEP5_PROMPT_CONTRACT = `

${STEP5_HEADER}
일반 Strategy 분석에는 SWOT, GAP, Root Cause, 기능적·정서적·문화적 ToT 3개 경로, Big IdeaL, Winning Move, Via Negativa, Pre-mortem, 실행 순서를 모두 유지하십시오. 그 전체 분석을 끝낸 뒤, 최종 전략 의사결정 구조 하나만 Visual Intent JSON으로 작성하십시오.

Visual Intent 작성 규칙:
- visualBriefs 배열에는 Step 5 핵심 Brief를 정확히 1개만 넣으십시오.
- SWOT, GAP, Root Cause, ToT 각 경로, Big IdeaL, Winning Move, Via Negativa, Pre-mortem, 실행 순서별로 별도 Brief를 추가하지 마십시오.
- 다른 Step의 Recipe를 사용하지 마십시오. competitor-threat-system, feature-matrix, rank-scorecard, positioning-map, milestone-timeline, customer-journey, friction-flow, needs-hierarchy는 Step 5에서 금지합니다.
- 전략 대안과 선택 기준·Trade-off가 핵심이면 strategic-choice → choice-architecture를 사용하십시오.
- 현재 상태에서 목표 상태로의 전환이 핵심이면 causal-relationship → as-is-to-be를 사용하십시오.
- SWOT·GAP·Root Cause 진단에서 전략 행동을 도출하는 연결이 핵심이면 causal-relationship → swot-to-strategy를 사용하십시오.
- 검증된 실행 순서와 단계가 핵심이면 execution-roadmap → roadmap을 사용하십시오.
- 전략 근거가 부족하면 evidence-gap → evidence-gap을 사용하십시오.
- Step 5의 모든 Recipe는 implementationStatus를 planned로 기록하십시오.
- Step 5 핵심 Brief의 metrics는 반드시 []로 두십시오. 수치 자료는 일반 분석 본문에 유지하십시오.
- Primary Recipe는 1개, Fallback Recipe는 최대 1개만 선택하십시오.
- requiredInputs, availableInputs, missingInputs를 분리하십시오.
- SWOT 네 칸 자체를 최종 전략 장표로 사용하지 마십시오.
- Winning Move는 Root Cause와 연결돼야 하며, 검증되지 않은 실행 순서나 효과를 만들지 마십시오.
- 분석 본문과 Visual Intent JSON을 포함한 응답 전체를 웹 앱에 붙여 넣으십시오. JSON만 별도로 제출하지 마십시오.
- HTML/CSS/SVG는 작성하지 마십시오.

허용 evidenceType: strategic-choice, causal-relationship, execution-roadmap, evidence-gap
허용 Recipe: choice-architecture, as-is-to-be, swot-to-strategy, roadmap, evidence-gap
출력 순서: 일반 분석 → VISUAL_INTENT_BRIEF

${VISUAL_INTENT_BRIEF_START}
{
  "version": 1,
  "brand": "위에서 지정한 조사 브랜드명",
  "step": 5,
  "visualBriefs": [
    {
      "insightId": "STEP5_CORE_01",
      "section": "V. STRATEGY > Final Strategic Choice",
      "preferredSlideId": "slide-17",
      "decisionQuestion": "조사 브랜드는 어떤 전략을 선택하고 무엇을 포기해야 하는가?",
      "evidenceType": "strategic-choice",
      "coreMessage": "Root Cause와 선택 기준·Trade-off를 통과한 최종 Winning Move",
      "primaryRecipe": { "recipeId": "choice-architecture", "priority": 1 },
      "fallbackRecipe": { "recipeId": "evidence-gap", "priority": 2 },
      "selectionReason": "기능적·정서적·문화적 대안을 비교하고 선택 기준과 Trade-off를 거쳐 하나의 전략을 결정해야 하기 때문",
      "confidence": "medium",
      "requiredInputs": ["SWOT", "GAP", "Root Cause", "전략 대안", "선택 기준", "Trade-off", "Big IdeaL", "Winning Move", "Via Negativa", "Pre-mortem", "실행 순서"],
      "availableInputs": ["앞 단계에서 확보한 시장·경쟁·소비자·크리에이티브 근거"],
      "missingInputs": ["누락된 비용·담당자·실행 시점·효과 검증 근거"],
      "metrics": [],
      "entities": ["위에서 지정한 조사 브랜드명"],
      "timePeriods": ["단기", "중기", "장기"],
      "implementationStatus": "planned"
    }
  ]
}
${VISUAL_INTENT_BRIEF_END}`;

function removeExistingVisualIntentContract(prompt: string): string {
  let result = prompt;

  while (true) {
    const headerIndex = result.indexOf(STEP5_HEADER);
    if (headerIndex < 0) break;

    const endIndex = result.indexOf(VISUAL_INTENT_BRIEF_END, headerIndex);
    if (endIndex < 0) {
      result = result.slice(0, headerIndex).trimEnd();
      break;
    }

    result = `${result.slice(0, headerIndex).trimEnd()}${result.slice(endIndex + VISUAL_INTENT_BRIEF_END.length)}`;
  }

  return result.trimEnd();
}

function ensureStep5PromptContract(): void {
  const node = RESEARCH_NODES.find((item) => item.step === 5);
  if (!node) return;
  node.userPromptTemplate = `${removeExistingVisualIntentContract(node.userPromptTemplate)}${STEP5_PROMPT_CONTRACT}`;
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

function showToast(title: string, message: string): void {
  document.getElementById('step5-visual-intent-toast')?.remove();
  const toast = document.createElement('div');
  toast.id = 'step5-visual-intent-toast';
  toast.setAttribute('role', 'alert');
  toast.style.cssText = [
    'position:fixed', 'top:22px', 'right:22px', 'z-index:2147483647',
    'width:min(520px,calc(100vw - 44px))', 'padding:16px 18px',
    'border-radius:12px', 'background:#111827', 'border:1px solid rgba(248,113,113,.7)',
    'box-shadow:0 18px 60px rgba(0,0,0,.48)',
    'font-family:Inter,Noto Sans KR,sans-serif', 'color:#f8fafc',
  ].join(';');

  const heading = document.createElement('div');
  heading.textContent = title;
  heading.style.cssText = 'font-size:14px;font-weight:800;margin-bottom:6px;color:#fca5a5';

  const body = document.createElement('div');
  body.textContent = message;
  body.style.cssText = 'font-size:12px;line-height:1.55;color:#cbd5e1;white-space:pre-line';

  toast.append(heading, body);
  document.body.appendChild(toast);
  window.setTimeout(() => toast.remove(), 9000);
}

function extractRawVisualBriefs(raw: string): unknown[] | null {
  const start = raw.indexOf(VISUAL_INTENT_BRIEF_START);
  const end = raw.indexOf(VISUAL_INTENT_BRIEF_END, start + VISUAL_INTENT_BRIEF_START.length);
  if (start < 0 || end <= start) return null;

  const block = raw
    .slice(start + VISUAL_INTENT_BRIEF_START.length, end)
    .replace(/```(?:json)?/gi, '')
    .trim();
  const first = block.indexOf('{');
  const last = block.lastIndexOf('}');
  if (first < 0 || last <= first) return null;

  try {
    const parsed = JSON.parse(block.slice(first, last + 1)) as { visualBriefs?: unknown };
    return Array.isArray(parsed.visualBriefs) ? parsed.visualBriefs : null;
  } catch {
    return null;
  }
}

function rawMetricsAreEmpty(rawBriefs: unknown[] | null): boolean {
  if (!rawBriefs || rawBriefs.length !== 1) return false;
  const brief = rawBriefs[0];
  if (typeof brief !== 'object' || brief === null) return false;
  const metrics = (brief as { metrics?: unknown }).metrics;
  return Array.isArray(metrics) && metrics.length === 0;
}

function addStep5Errors(raw: string, briefs: VisualIntentBrief[], errors: string[]): void {
  if (briefs.length !== 1) {
    errors.push(`Step 5 Visual Intent에는 최종 전략 의사결정 구조 Brief가 정확히 1개 필요합니다. 현재 ${briefs.length}개입니다.`);
  }

  briefs.forEach((brief) => {
    const recipe = brief.primaryRecipe.recipeId;
    const expectedEvidence = STEP5_RECIPE_TO_EVIDENCE[recipe];

    if (expectedEvidence && brief.evidenceType !== expectedEvidence) {
      errors.push(`${brief.insightId}: ${recipe}에는 evidenceType "${expectedEvidence}"를 사용해야 합니다.`);
    }

    if (brief.implementationStatus !== 'planned') {
      errors.push(`${brief.insightId}: Step 5 Recipe의 implementationStatus는 planned여야 합니다.`);
    }
  });

  if (!rawMetricsAreEmpty(extractRawVisualBriefs(raw))) {
    errors.push('Step 5 핵심 Brief의 metrics는 정확히 []여야 하며 수치 자료는 일반 분석 본문에 유지해야 합니다.');
  }
}

function handleClick(event: MouseEvent): void {
  const target = event.target;
  if (!(target instanceof Element)) return;
  const button = target.closest<HTMLButtonElement>('button');
  if (!button) return;

  const label = button.textContent?.replace(/\s+/g, ' ').trim() ?? '';
  const step = currentStepFromDom();

  if (step === 5 && label.includes('복사용 AI 프롬프트 가져오기')) {
    ensureStep5PromptContract();
    return;
  }

  if (step !== 5 || !label.includes('Submit & Continue')) return;

  const value = getTextarea(button)?.value.trim() ?? '';
  const result = validateVisualIntentBrief(value, 5);
  const errors = [...result.errors];
  if (result.registry) addStep5Errors(value, result.registry.visualBriefs, errors);

  if (errors.length === 0) return;

  event.preventDefault();
  event.stopImmediatePropagation();
  showToast(
    'Step 5 Visual Intent 제출 중단',
    errors.slice(0, 6).map((error, index) => `${index + 1}. ${error}`).join('\n'),
  );
}

export function installStep5VisualIntentContract(): void {
  if (installed || typeof document === 'undefined') return;
  installed = true;
  ensureStep5PromptContract();
  document.addEventListener('click', handleClick, true);
}
