import { RESEARCH_NODES } from './prompts';

export const VISUAL_INTENT_BRIEF_START = '<!-- VISUAL_INTENT_BRIEF_START -->';
export const VISUAL_INTENT_BRIEF_END = '<!-- VISUAL_INTENT_BRIEF_END -->';

export type VisualIntentStep = 0 | 2 | 3 | 5;
export type VisualIntentImplementationStatus = 'pilot-supported' | 'planned' | 'unsupported';
export type MetricVerificationStatus = 'verified' | 'partially-verified' | 'unverified';

export interface VisualIntentMetric {
  metricId: string;
  label: string;
  value: number;
  unit: string;
  period: string;
  denominator: string | null;
  sourceLabel: string;
  verificationStatus: MetricVerificationStatus;
}

export interface VisualIntentBrief {
  insightId: string;
  section: string;
  preferredSlideId: string | null;
  decisionQuestion: string;
  evidenceType: string;
  coreMessage: string;
  primaryRecipe: { recipeId: string; priority: 1 };
  fallbackRecipe: { recipeId: string; priority: 2 } | null;
  selectionReason: string;
  confidence: 'high' | 'medium' | 'low';
  requiredInputs: string[];
  availableInputs: string[];
  missingInputs: string[];
  metrics: VisualIntentMetric[];
  entities: string[];
  timePeriods: string[];
  implementationStatus: VisualIntentImplementationStatus;
}

export interface VisualIntentRegistry {
  version: 1;
  brand: string;
  step: VisualIntentStep;
  visualBriefs: VisualIntentBrief[];
}

export interface VisualIntentValidationResult {
  valid: boolean;
  registry: VisualIntentRegistry | null;
  errors: string[];
  warnings: string[];
}

interface MetricParseResult {
  metric: VisualIntentMetric | null;
  missingFields: string[];
  denominatorDefaulted: boolean;
}

const PILOT = new Set(['milestone-timeline', 'competitor-threat-system', 'feature-matrix']);
const RECIPES: Record<VisualIntentStep, string[]> = {
  0: ['milestone-timeline', 'growth-trajectory', 'before-after', 'evidence-gap'],
  2: ['rank-scorecard', 'competitor-threat-system', 'feature-matrix', 'positioning-map', 'evidence-gap'],
  3: ['customer-journey', 'friction-flow', 'needs-hierarchy', 'evidence-gap'],
  5: ['choice-architecture', 'as-is-to-be', 'swot-to-strategy', 'roadmap', 'evidence-gap'],
};

const EVIDENCE: Record<VisualIntentStep, string[]> = {
  0: ['time-change', 'causal-relationship', 'evidence-gap'],
  2: ['priority-ranking', 'causal-relationship', 'quantitative-comparison', 'competitive-space', 'evidence-gap'],
  3: ['consumer-journey', 'sequential-process', 'causal-relationship', 'priority-ranking', 'evidence-gap'],
  5: ['strategic-choice', 'causal-relationship', 'execution-roadmap', 'priority-ranking', 'evidence-gap'],
};

const STEP2_EVIDENCE_BY_RECIPE: Record<string, string> = {
  'rank-scorecard': 'priority-ranking',
  'competitor-threat-system': 'causal-relationship',
  'feature-matrix': 'competitive-space',
  'positioning-map': 'competitive-space',
  'evidence-gap': 'evidence-gap',
};

let installed = false;

function obj(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null ? value as Record<string, unknown> : null;
}

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function strings(value: unknown): string[] {
  return Array.isArray(value) ? [...new Set(value.map(text).filter(Boolean))].slice(0, 20) : [];
}

function extract(textValue: string): string | null {
  const start = textValue.indexOf(VISUAL_INTENT_BRIEF_START);
  const end = textValue.indexOf(VISUAL_INTENT_BRIEF_END, start + VISUAL_INTENT_BRIEF_START.length);
  if (start < 0 || end <= start) return null;
  const block = textValue.slice(start + VISUAL_INTENT_BRIEF_START.length, end).replace(/```(?:json)?/gi, '').trim();
  const first = block.indexOf('{');
  const last = block.lastIndexOf('}');
  return first >= 0 && last > first ? block.slice(first, last + 1) : null;
}

function parseMetric(value: unknown): MetricParseResult {
  const item = obj(value);
  if (!item) return { metric: null, missingFields: ['metric object'], denominatorDefaulted: false };

  const missingFields: string[] = [];
  const metricId = text(item.metricId);
  const label = text(item.label);
  const numericValue = Number(item.value);
  const unit = text(item.unit);
  const period = text(item.period);
  const sourceLabel = text(item.sourceLabel);
  const verificationStatus = item.verificationStatus;

  if (!metricId) missingFields.push('metricId');
  if (!label) missingFields.push('label');
  if (!Number.isFinite(numericValue)) missingFields.push('value');
  if (!unit) missingFields.push('unit');
  if (!period) missingFields.push('period');
  if (!sourceLabel) missingFields.push('sourceLabel');
  if (verificationStatus !== 'verified' && verificationStatus !== 'partially-verified' && verificationStatus !== 'unverified') {
    missingFields.push('verificationStatus');
  }

  if (missingFields.length > 0) return { metric: null, missingFields, denominatorDefaulted: false };

  const denominatorDefaulted = !Object.prototype.hasOwnProperty.call(item, 'denominator');
  const denominator = item.denominator === null || denominatorDefaulted
    ? null
    : text(item.denominator) || null;

  return {
    metric: {
      metricId,
      label,
      value: numericValue,
      unit,
      period,
      denominator,
      sourceLabel,
      verificationStatus: verificationStatus as MetricVerificationStatus,
    },
    missingFields: [],
    denominatorDefaulted,
  };
}

function isStep0GrowthBrief(item: Record<string, unknown>, primaryRecipe: string): boolean {
  const haystack = [
    text(item.section),
    text(item.preferredSlideId),
    text(item.decisionQuestion),
    text(item.coreMessage),
  ].join(' ').toLowerCase();

  return primaryRecipe === 'milestone-timeline'
    || primaryRecipe === 'growth-trajectory'
    || primaryRecipe === 'evidence-gap'
    || haystack.includes('slide-f02')
    || /growth|trajectory|timeline|성장|변곡|연혁|타임라인/.test(haystack);
}

export function validateVisualIntentBrief(raw: string | null | undefined, expectedStep?: VisualIntentStep): VisualIntentValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const jsonText = raw ? extract(raw) : null;
  if (!jsonText) {
    return {
      valid: false,
      registry: null,
      errors: ['분석 본문을 포함한 전체 응답에서 VISUAL_INTENT_BRIEF 시작·종료 마커를 찾지 못했습니다. JSON만 붙이지 말고 AI 응답 전체를 붙여 넣어 주세요.'],
      warnings,
    };
  }

  try {
    const root = obj(JSON.parse(jsonText));
    if (!root) return { valid: false, registry: null, errors: ['Visual Intent JSON 최상위 값이 객체가 아닙니다.'], warnings };

    const step = Number(root.step) as VisualIntentStep;
    const brand = text(root.brand);
    const rawBriefs = root.visualBriefs;
    if (Number(root.version) !== 1) errors.push('version은 1이어야 합니다.');
    if (![0, 2, 3, 5].includes(step)) errors.push('step은 0, 2, 3, 5 중 하나여야 합니다.');
    if (expectedStep !== undefined && step !== expectedStep) errors.push(`현재 Step ${expectedStep}와 JSON step이 다릅니다.`);
    if (!brand) errors.push('brand가 비어 있습니다.');
    if (!Array.isArray(rawBriefs) || rawBriefs.length === 0) errors.push('visualBriefs가 비어 있습니다.');
    if (!brand || !Array.isArray(rawBriefs) || ![0, 2, 3, 5].includes(step)) return { valid: false, registry: null, errors, warnings };

    const seen = new Set<string>();
    const briefs: VisualIntentBrief[] = [];

    rawBriefs.slice(0, 20).forEach((value, index) => {
      const item = obj(value);
      if (!item) { errors.push(`visualBriefs[${index}]가 객체가 아닙니다.`); return; }

      const insightId = text(item.insightId);
      const evidenceType = text(item.evidenceType);
      const primaryObject = obj(item.primaryRecipe);
      const fallbackObject = item.fallbackRecipe === null || item.fallbackRecipe === undefined ? null : obj(item.fallbackRecipe);
      const primaryRecipe = text(primaryObject?.recipeId);
      const fallbackRecipe = fallbackObject ? text(fallbackObject.recipeId) : '';
      const implementationStatus = text(item.implementationStatus) as VisualIntentImplementationStatus;

      if (step === 0 && !isStep0GrowthBrief(item, primaryRecipe)) {
        warnings.push(`${insightId || `visualBriefs[${index}]`}: Gate 2A Step 0은 Growth Story만 검증하므로 다른 Brand Fact Brief는 이번 테스트에서 제외했습니다.`);
        return;
      }

      const rawMetrics = Array.isArray(item.metrics) ? item.metrics : [];
      const metricResults = rawMetrics.map(parseMetric);
      const normalizedMetrics = metricResults.flatMap((result) => result.metric ? [result.metric] : []);
      const incompleteMetrics = metricResults.filter((result) => !result.metric);
      const denominatorDefaults = metricResults.filter((result) => result.metric && result.denominatorDefaulted).length;

      if (!insightId || seen.has(insightId)) errors.push(`${insightId || index}: insightId가 없거나 중복됐습니다.`);
      if (insightId) seen.add(insightId);
      if (!text(item.section)) errors.push(`${insightId || index}: section이 비어 있습니다.`);
      if (!EVIDENCE[step].includes(evidenceType)) errors.push(`${insightId || index}: 허용되지 않은 evidenceType입니다.`);
      if (!RECIPES[step].includes(primaryRecipe) || Number(primaryObject?.priority) !== 1) errors.push(`${insightId || index}: primaryRecipe가 유효하지 않습니다.`);
      if (fallbackObject && (!RECIPES[step].includes(fallbackRecipe) || Number(fallbackObject.priority) !== 2)) errors.push(`${insightId || index}: fallbackRecipe가 유효하지 않습니다.`);
      if (primaryRecipe && primaryRecipe === fallbackRecipe) errors.push(`${insightId || index}: primary와 fallback이 동일합니다.`);
      if (/umbrex|edraw|max|mckinsey|bcg|bain/i.test(primaryRecipe + fallbackRecipe)) errors.push(`${insightId || index}: 외부 템플릿 이름을 recipeId로 사용할 수 없습니다.`);
      if (!['high', 'medium', 'low'].includes(text(item.confidence))) errors.push(`${insightId || index}: confidence가 유효하지 않습니다.`);
      if (!['pilot-supported', 'planned', 'unsupported'].includes(implementationStatus)) errors.push(`${insightId || index}: implementationStatus가 유효하지 않습니다.`);
      if (PILOT.has(primaryRecipe) !== (implementationStatus === 'pilot-supported')) errors.push(`${insightId || index}: Recipe와 implementationStatus가 일치하지 않습니다.`);
      if (!Array.isArray(item.requiredInputs) || !Array.isArray(item.availableInputs) || !Array.isArray(item.missingInputs)) errors.push(`${insightId || index}: required/available/missingInputs는 각각 배열이어야 합니다.`);
      if (strings(item.requiredInputs).length === 0) errors.push(`${insightId || index}: requiredInputs가 비어 있습니다.`);
      if (text(item.decisionQuestion).length < 8 || text(item.coreMessage).length < 8 || text(item.selectionReason).length < 8) errors.push(`${insightId || index}: 질문·핵심 메시지·선정 이유가 너무 짧습니다.`);
      if (!Array.isArray(item.metrics)) errors.push(`${insightId || index}: metrics는 배열이어야 합니다.`);

      if (step === 2 && RECIPES[2].includes(primaryRecipe) && EVIDENCE[2].includes(evidenceType)) {
        const expectedEvidence = STEP2_EVIDENCE_BY_RECIPE[primaryRecipe];
        if (expectedEvidence && evidenceType !== expectedEvidence) {
          errors.push(`${insightId || index}: ${primaryRecipe}에는 evidenceType "${expectedEvidence}"를 사용해야 합니다.`);
        }
      }

      if (incompleteMetrics.length > 0) {
        const missing = [...new Set(incompleteMetrics.flatMap((result) => result.missingFields))].join(', ');
        if (evidenceType === 'quantitative-comparison') {
          errors.push(`${insightId || index}: 정량 비교 Metric 필드가 불완전합니다 (${missing}).`);
        } else {
          warnings.push(`${insightId || index}: 시각화에 사용하지 않는 불완전 Metric ${incompleteMetrics.length}개를 제외했습니다 (${missing}).`);
        }
      }
      if (denominatorDefaults > 0) warnings.push(`${insightId || index}: denominator가 없는 Metric ${denominatorDefaults}개를 null로 처리했습니다.`);
      if (normalizedMetrics.some((entry) => /^https?:\/\//i.test(entry.sourceLabel))) warnings.push(`${insightId || index}: sourceLabel에는 URL 대신 출처명·자료명·연도를 권장합니다.`);

      if (evidenceType === 'quantitative-comparison') {
        if (normalizedMetrics.length < 2) errors.push(`${insightId || index}: 정량 비교에는 완전한 Metric 2개 이상이 필요합니다.`);
        if (new Set(normalizedMetrics.map((entry) => entry.unit)).size > 1) errors.push(`${insightId || index}: 서로 다른 단위가 혼합됐습니다.`);
        if (normalizedMetrics.filter((entry) => entry.verificationStatus === 'verified').length < 2 && primaryRecipe !== 'evidence-gap') {
          warnings.push(`${insightId || index}: 검증 Metric이 2개 미만입니다.`);
        }
      }

      briefs.push({
        insightId,
        section: text(item.section),
        preferredSlideId: item.preferredSlideId === null ? null : text(item.preferredSlideId) || null,
        decisionQuestion: text(item.decisionQuestion),
        evidenceType,
        coreMessage: text(item.coreMessage),
        primaryRecipe: { recipeId: primaryRecipe, priority: 1 },
        fallbackRecipe: fallbackObject ? { recipeId: fallbackRecipe, priority: 2 } : null,
        selectionReason: text(item.selectionReason),
        confidence: text(item.confidence) as 'high' | 'medium' | 'low',
        requiredInputs: strings(item.requiredInputs),
        availableInputs: strings(item.availableInputs),
        missingInputs: strings(item.missingInputs),
        metrics: normalizedMetrics,
        entities: strings(item.entities),
        timePeriods: strings(item.timePeriods),
        implementationStatus,
      });
    });

    if (step === 0 && briefs.length === 0) errors.push('Step 0에는 Growth Story용 Visual Brief가 최소 1개 필요합니다.');

    return {
      valid: errors.length === 0,
      registry: { version: 1, brand, step, visualBriefs: briefs },
      errors,
      warnings,
    };
  } catch (error) {
    return { valid: false, registry: null, errors: [`Visual Intent JSON 파싱 실패: ${error instanceof Error ? error.message : String(error)}`], warnings };
  }
}

function stepRules(step: VisualIntentStep): string {
  if (step === 0) return 'visualBriefs에는 Growth Story용 Brief 정확히 1개만 작성하십시오. Brand Identity, KPI Snapshot, Product USP용 Brief는 이번 Gate 2A JSON에 넣지 마십시오. 사건·단계·변곡점 중심이면 milestone-timeline을 우선 검토하십시오. milestone-timeline이면 metrics는 빈 배열([])로 두십시오.';
  if (step === 2) return 'Threat Ranking은 priority-ranking → rank-scorecard로 정확히 1개 작성하십시오. selected 경쟁사마다 causal-relationship → competitor-threat-system Deep Dive를 정확히 1개씩 별도로 작성하고 entities에는 해당 경쟁사명 1개만 넣으십시오. Product Matrix는 competitive-space → feature-matrix로 정확히 1개 작성하십시오. Positioning Map은 근거 있는 공통 축 2개가 있을 때만 competitive-space → positioning-map으로 최대 1개 작성하십시오. 근거가 부족한 역할은 evidence-gap → evidence-gap을 사용하십시오. Deep Dive는 Evidence → Core Desire → Appeal → Threat Mechanism → Attack Point 흐름을 사용하십시오.';
  if (step === 3) return '순차 행동이면 customer-journey, 이탈 마찰이 핵심이면 friction-flow, 욕구 위계가 핵심이면 needs-hierarchy를 선택하십시오.';
  return 'Root Cause, 전략 대안, 선택 기준, Winning Move, 실행 순서를 검토하되 SWOT 네 칸 자체를 최종 Recipe로 선택하지 마십시오.';
}

function defaultBriefExample(step: VisualIntentStep): string {
  return `[
    {
      "insightId": "STEP${step}_INSIGHT_01",
      "section": "해당 섹션",
      "preferredSlideId": ${step === 0 ? '"slide-f02"' : 'null'},
      "decisionQuestion": "독자가 이 장표에서 판단해야 할 질문",
      "evidenceType": "${step === 0 ? 'time-change' : step === 3 ? 'consumer-journey' : 'strategic-choice'}",
      "coreMessage": "근거가 말하는 핵심 결론",
      "primaryRecipe": { "recipeId": "${step === 0 ? 'milestone-timeline' : step === 3 ? 'friction-flow' : 'choice-architecture'}", "priority": 1 },
      "fallbackRecipe": { "recipeId": "evidence-gap", "priority": 2 },
      "selectionReason": "해당 정보 구조에 이 Recipe가 적합한 이유",
      "confidence": "medium",
      "requiredInputs": ["필수 데이터"],
      "availableInputs": ["확보 데이터"],
      "missingInputs": ["누락 데이터"],
      "metrics": [],
      "entities": ["{BRAND_NAME}"],
      "timePeriods": [],
      "implementationStatus": "${step === 0 ? 'pilot-supported' : 'planned'}"
    }
  ]`;
}

function step2BriefExample(): string {
  return `[
    {
      "insightId": "STEP2_RANK_01",
      "section": "B. Threat Ranking & Selection Logic",
      "preferredSlideId": "slide-06",
      "decisionQuestion": "어떤 경쟁사가 가장 큰 실질적 위협인가?",
      "evidenceType": "priority-ranking",
      "coreMessage": "동일한 위협도 기준으로 본 경쟁 우선순위",
      "primaryRecipe": { "recipeId": "rank-scorecard", "priority": 1 },
      "fallbackRecipe": { "recipeId": "evidence-gap", "priority": 2 },
      "selectionReason": "선정 경쟁사를 동일한 위협도 기준으로 비교하기 때문",
      "confidence": "medium",
      "requiredInputs": ["경쟁사명", "위협도 점수", "평가 기준", "선정 사유"],
      "availableInputs": ["COMPETITOR_REGISTRY selected 데이터"],
      "missingInputs": [],
      "metrics": [],
      "entities": ["선정 경쟁사명 1", "선정 경쟁사명 2"],
      "timePeriods": ["현재 평가 시점"],
      "implementationStatus": "planned"
    },
    {
      "insightId": "STEP2_DEEP_01",
      "section": "C. Selected Competitor Deep Dive > 실제 선정 경쟁사명 1",
      "preferredSlideId": null,
      "decisionQuestion": "이 경쟁사는 어떤 메커니즘으로 고객 선택을 빼앗는가?",
      "evidenceType": "causal-relationship",
      "coreMessage": "Evidence에서 Attack Point까지 이어지는 핵심 위협 메커니즘",
      "primaryRecipe": { "recipeId": "competitor-threat-system", "priority": 1 },
      "fallbackRecipe": { "recipeId": "evidence-gap", "priority": 2 },
      "selectionReason": "증거에서 공격 지점까지의 인과 흐름을 보여줘야 하기 때문",
      "confidence": "medium",
      "requiredInputs": ["Evidence", "Core Desire", "Appeal", "Threat Mechanism", "Attack Point"],
      "availableInputs": ["해당 경쟁사의 확보된 근거"],
      "missingInputs": ["누락된 직접 고객 이동 근거"],
      "metrics": [],
      "entities": ["실제 선정 경쟁사명 1"],
      "timePeriods": ["최근 5년 및 현재"],
      "implementationStatus": "pilot-supported"
    },
    {
      "insightId": "STEP2_MATRIX_01",
      "section": "D. Product Matrix",
      "preferredSlideId": "slide-07",
      "decisionQuestion": "공통 비교축에서 브랜드별 차이는 무엇인가?",
      "evidenceType": "competitive-space",
      "coreMessage": "공통 축에서 확인되는 우위와 취약점",
      "primaryRecipe": { "recipeId": "feature-matrix", "priority": 1 },
      "fallbackRecipe": { "recipeId": "evidence-gap", "priority": 2 },
      "selectionReason": "동일한 비교축으로 조사 브랜드와 선정 경쟁사를 비교하기 때문",
      "confidence": "medium",
      "requiredInputs": ["공통 비교축", "브랜드별 평가", "평가 근거", "미확인 셀"],
      "availableInputs": ["확보된 제품·서비스 비교 근거"],
      "missingInputs": ["누락된 비교 근거"],
      "metrics": [],
      "entities": ["{BRAND_NAME}", "선정 경쟁사명 1", "선정 경쟁사명 2"],
      "timePeriods": ["현재 기준"],
      "implementationStatus": "pilot-supported"
    }
  ]`;
}

export function buildVisualIntentPromptContract(step: VisualIntentStep): string {
  const step0Rule = step === 0
    ? '\nStep 0 중요: visualBriefs 배열에는 Growth Story용 객체 정확히 1개만 넣으십시오. 다른 Brand Fact 항목은 일반 분석 본문에만 작성하십시오. milestone-timeline을 선택하면 metrics는 반드시 []로 두십시오.'
    : '';
  const step2Rule = step === 2
    ? '\nStep 2 중요: Threat Ranking 1개, COMPETITOR_REGISTRY selected 경쟁사별 독립 Deep Dive 1개씩, Product Matrix 1개가 필수입니다. Positioning Map은 검증 가능한 공통 축 2개가 있을 때만 최대 1개 추가하십시오. Deep Dive 객체를 경쟁사 여러 개로 합치지 마십시오. 아래 예시의 Deep Dive 객체를 selected 경쟁사 수만큼 복제하고, 각 entities에는 해당 경쟁사명 1개만 넣으십시오.'
    : '';
  const example = step === 2 ? step2BriefExample() : defaultBriefExample(step);

  return `\n\n[VISUAL INTENT BRIEF — GATE 2A TEST]\n일반 분석을 먼저 작성한 뒤 같은 근거를 어떤 장표 구조로 전달할지 계획하십시오. 분석 본문과 Visual Intent JSON을 포함한 응답 전체를 웹 앱에 붙여 넣어야 합니다. JSON만 별도로 제출하지 마십시오. HTML/CSS/SVG는 작성하지 마십시오. 외부 템플릿 이름·번호를 recipeId로 사용하지 마십시오. Primary 1개와 Fallback 최대 1개만 선택하고 requiredInputs, availableInputs, missingInputs를 분리하십시오. 수치는 value/unit/period/denominator/sourceLabel/verificationStatus를 기록하십시오.\n현재 pilot-supported Recipe는 milestone-timeline, competitor-threat-system, feature-matrix입니다. 그 외 Recipe는 planned 또는 unsupported로 기록하십시오.${step0Rule}${step2Rule}\n\n허용 evidenceType: ${EVIDENCE[step].join(', ')}\n허용 Recipe: ${RECIPES[step].join(', ')}\n필수 판단: ${stepRules(step)}\n\n${step === 2 ? '출력 순서: 일반 분석 → COMPETITOR_REGISTRY → VISUAL_INTENT_BRIEF' : '출력 순서: 일반 분석 → VISUAL_INTENT_BRIEF'}\n\n${VISUAL_INTENT_BRIEF_START}\n{\n  "version": 1,\n  "brand": "{BRAND_NAME}",\n  "step": ${step},\n  "visualBriefs": ${example}\n}\n${VISUAL_INTENT_BRIEF_END}`;
}

export function installVisualIntentBriefPolicy(): void {
  if (installed) return;
  installed = true;
  ([0, 2, 3, 5] as VisualIntentStep[]).forEach((step) => {
    const node = RESEARCH_NODES.find((item) => item.step === step);
    if (!node) return;
    const step2OrderOverride = step === 2
      ? '\nStep 2 출력 순서는 일반 분석 → COMPETITOR_REGISTRY → VISUAL_INTENT_BRIEF입니다. 이전의 Registry를 마지막에 두라는 문구보다 이 순서가 우선하며, Visual Intent 블록이 최종 블록입니다.'
      : '';
    node.systemPrompt += `\n\n[GATE 2A]\n기존 사실성·Registry 규칙을 보존하면서 사용자 요청 끝의 Visual Intent Brief 계약을 반드시 따르십시오.${step2OrderOverride}`;
    node.userPromptTemplate += buildVisualIntentPromptContract(step);
  });
}

export function isVisualIntentStep(step: number): step is VisualIntentStep {
  return step === 0 || step === 2 || step === 3 || step === 5;
}
