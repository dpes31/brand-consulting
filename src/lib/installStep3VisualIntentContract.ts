import { RESEARCH_NODES } from './prompts';
import {
  VISUAL_INTENT_BRIEF_END,
  VISUAL_INTENT_BRIEF_START,
  validateVisualIntentBrief,
  type VisualIntentBrief,
} from './visualIntentBrief';

let installed = false;

const STEP3_HEADER = '[VISUAL INTENT BRIEF — GATE 2A TEST]';

const STEP3_RECIPE_TO_EVIDENCE: Record<string, string> = {
  'customer-journey': 'consumer-journey',
  'friction-flow': 'causal-relationship',
  'needs-hierarchy': 'priority-ranking',
  'evidence-gap': 'evidence-gap',
};

const STEP3_PROMPT_CONTRACT = `

${STEP3_HEADER}
일반 Consumer 분석에는 Trends, Persona, Identity Alignment, JTBD, AIPL Bottleneck, Unmet Needs를 모두 유지하십시오. 그 전체 분석을 끝낸 뒤, 가장 중요한 소비자 의사결정 구조 하나만 Visual Intent JSON으로 작성하십시오.

Visual Intent 작성 규칙:
- visualBriefs 배열에는 Step 3 핵심 Brief를 정확히 1개만 넣으십시오.
- Trend, Persona, JTBD, Identity Alignment, AIPL, Unmet Needs별로 별도 Brief를 추가하지 마십시오.
- 다른 Step의 Recipe를 사용하지 마십시오.
- 행동 순서가 핵심이면 consumer-journey → customer-journey를 사용하십시오.
- 특정 단계의 이탈·불안·지연·마찰이 핵심이면 causal-relationship → friction-flow를 사용하십시오.
- 검증된 욕구의 우선순위·위계가 핵심이면 priority-ranking → needs-hierarchy를 사용하십시오.
- 행동 근거가 부족하면 evidence-gap → evidence-gap을 사용하십시오.
- Step 3의 모든 Recipe는 implementationStatus를 planned로 기록하십시오.
- Step 3 핵심 Brief의 metrics는 반드시 []로 두십시오. 수치 자료는 일반 분석 본문에 유지하고 Visual Intent 안에서 서로 다른 단위를 혼합하지 마십시오.
- Primary Recipe는 1개, Fallback Recipe는 최대 1개만 선택하십시오.
- requiredInputs, availableInputs, missingInputs를 분리하십시오.
- 감정·행동·병목을 근거 없이 만들지 마십시오.
- 분석 본문과 Visual Intent JSON을 포함한 응답 전체를 웹 앱에 붙여 넣으십시오. JSON만 별도로 제출하지 마십시오.
- HTML/CSS/SVG는 작성하지 마십시오.

허용 evidenceType: consumer-journey, causal-relationship, priority-ranking, evidence-gap
허용 Recipe: customer-journey, friction-flow, needs-hierarchy, evidence-gap
출력 순서: 일반 분석 → VISUAL_INTENT_BRIEF

${VISUAL_INTENT_BRIEF_START}
{
  "version": 1,
  "brand": "위에서 지정한 조사 브랜드명",
  "step": 3,
  "visualBriefs": [
    {
      "insightId": "STEP3_CORE_01",
      "section": "III. CONSUMER > Core Decision Structure",
      "preferredSlideId": "slide-12",
      "decisionQuestion": "소비자는 어떤 단계에서 가장 크게 막히고 왜 구매로 전환하지 못하는가?",
      "evidenceType": "causal-relationship",
      "coreMessage": "검증된 소비자 행동과 마찰이 말하는 가장 중요한 전환 병목",
      "primaryRecipe": { "recipeId": "friction-flow", "priority": 1 },
      "fallbackRecipe": { "recipeId": "evidence-gap", "priority": 2 },
      "selectionReason": "AIPL 전환 과정에서 특정 단계의 불안과 마찰이 구매 중단으로 이어지는 인과 구조를 보여줘야 하기 때문",
      "confidence": "medium",
      "requiredInputs": ["Trigger", "Action", "Friction", "Evidence", "Current Coping", "Opportunity"],
      "availableInputs": ["확보된 VOC 및 행동 근거"],
      "missingInputs": ["누락된 단계별 행동 근거"],
      "metrics": [],
      "entities": ["핵심 타겟"],
      "timePeriods": ["인지부터 충성까지"],
      "implementationStatus": "planned"
    }
  ]
}
${VISUAL_INTENT_BRIEF_END}`;

function removeExistingVisualIntentContract(prompt: string): string {
  let result = prompt;

  while (true) {
    const headerIndex = result.indexOf(STEP3_HEADER);
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

function ensureStep3PromptContract(): void {
  const node = RESEARCH_NODES.find((item) => item.step === 3);
  if (!node) return;
  node.userPromptTemplate = `${removeExistingVisualIntentContract(node.userPromptTemplate)}${STEP3_PROMPT_CONTRACT}`;
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
  document.getElementById('step3-visual-intent-toast')?.remove();
  const toast = document.createElement('div');
  toast.id = 'step3-visual-intent-toast';
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

function addStep3Errors(briefs: VisualIntentBrief[], errors: string[]): void {
  if (briefs.length !== 1) {
    errors.push(`Step 3 Visual Intent에는 핵심 소비자 의사결정 구조 Brief가 정확히 1개 필요합니다. 현재 ${briefs.length}개입니다.`);
  }

  briefs.forEach((brief) => {
    const recipe = brief.primaryRecipe.recipeId;
    const expectedEvidence = STEP3_RECIPE_TO_EVIDENCE[recipe];

    if (expectedEvidence && brief.evidenceType !== expectedEvidence) {
      errors.push(`${brief.insightId}: ${recipe}에는 evidenceType "${expectedEvidence}"를 사용해야 합니다.`);
    }

    if (brief.implementationStatus !== 'planned') {
      errors.push(`${brief.insightId}: Step 3 Recipe의 implementationStatus는 planned여야 합니다.`);
    }

    if (brief.metrics.length > 0) {
      errors.push(`${brief.insightId}: Step 3 핵심 Brief의 metrics는 []로 두고 수치 자료는 일반 분석 본문에 유지해야 합니다.`);
    }
  });
}

function handleClick(event: MouseEvent): void {
  const target = event.target;
  if (!(target instanceof Element)) return;
  const button = target.closest<HTMLButtonElement>('button');
  if (!button) return;

  const label = button.textContent?.replace(/\s+/g, ' ').trim() ?? '';
  const step = currentStepFromDom();

  if (step === 3 && label.includes('복사용 AI 프롬프트 가져오기')) {
    ensureStep3PromptContract();
    return;
  }

  if (step !== 3 || !label.includes('Submit & Continue')) return;

  const value = getTextarea(button)?.value.trim() ?? '';
  const result = validateVisualIntentBrief(value, 3);
  const errors = [...result.errors];
  if (result.registry) addStep3Errors(result.registry.visualBriefs, errors);

  if (errors.length === 0) return;

  event.preventDefault();
  event.stopImmediatePropagation();
  showToast(
    'Step 3 Visual Intent 제출 중단',
    errors.slice(0, 6).map((error, index) => `${index + 1}. ${error}`).join('\n'),
  );
}

export function installStep3VisualIntentContract(): void {
  if (installed || typeof document === 'undefined') return;
  installed = true;
  ensureStep3PromptContract();
  document.addEventListener('click', handleClick, true);
}
