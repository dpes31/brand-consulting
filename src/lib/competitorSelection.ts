import { RESEARCH_NODES } from './prompts';

export const COMPETITOR_REGISTRY_START = '<!-- COMPETITOR_REGISTRY_START -->';
export const COMPETITOR_REGISTRY_END = '<!-- COMPETITOR_REGISTRY_END -->';

export interface SelectedCompetitor {
  rank: number;
  name: string;
  threatScore: number;
  userSpecified: boolean;
  selectionReason: string;
  evidenceSignals: string[];
}

export interface ReviewedCompetitorCandidate {
  name: string;
  userSpecified: boolean;
  selected: boolean;
  threatScore: number;
  decisionReason: string;
}

export interface CompetitorRegistry {
  version: 1;
  selectionPolicy: 'threat-ranked-direct-only';
  selected: SelectedCompetitor[];
  reviewedCandidates: ReviewedCompetitorCandidate[];
}

let installed = false;
let activeRegistry: CompetitorRegistry | null = null;
const downstreamPromptBases = new Map<number, string>();
let uiObserver: MutationObserver | null = null;

const THREAT_SELECTION_POLICY = `

[MANDATORY COMPETITOR SELECTION POLICY — SYSTEM OVERRIDE]
이 단계의 목적은 경쟁사를 많이 나열하는 것이 아니라, 향후 12~36개월 안에 조사 브랜드의 고객·점유율·문화적 주도권을 실제로 빼앗을 가능성이 가장 높은 경쟁사를 고정하는 것입니다.

1. Indirect Competitor 분류는 사용하지 마십시오. 다른 카테고리의 광의적 대체재를 페이지 수 확보용으로 끌어오지 마십시오.
2. 사용자가 입력한 경쟁사 목록은 '필수 검토 후보(Mandatory Review Seeds)'입니다. 반드시 후보군에서 검토하되 최종 선정이 보장되는 명단이 아닙니다.
3. 사용자 입력에 없더라도 시장 조사에서 더 위협적인 업체를 발견하면 반드시 후보군에 추가하십시오.
4. 최종 상세 분석 대상은 최소 2개, 최대 5개입니다. 유효한 경쟁사가 3개면 3개만 선정하고 숫자를 채우기 위해 약한 후보를 포함하지 마십시오.
5. 최종 순위는 다음 위협 신호를 종합해 100점 만점으로 평가하십시오.
   - 시장 침투 위협 25: 점유율, 고객 이동, 거래 규모
   - 성장 모멘텀 20: 최근 성장률, 투자, 서비스 확장
   - 소비자 선호·이용 20: 이용자 증가, 선택률, 검색·후기 반응
   - 캠페인 공격성 15: 광고 집행, 모델, 시즌 점유, 메시지 확장
   - 시장 변곡점 적합성 15: 규제·기술·문화 변화에서의 유리한 위치
   - 근거 신뢰도 5: 공식 자료 및 교차 검증 가능성
6. 현재 점유율이 낮더라도 급격한 성장, 대형 캠페인, 바이럴, 플랫폼 제휴, 규제 수혜 등으로 궤도에 진입한 challenger는 높은 순위를 받을 수 있습니다.
7. 선정된 경쟁사는 이후 Product Matrix, Positioning Map, Creative History, Strategy 단계에서 변경·누락·대체할 수 없는 고정 Registry가 됩니다.
8. 사용자 지정 후보가 제외되면 '검토했으나 제외한 이유'를 명시하십시오.

[MANDATORY MACHINE-READABLE OUTPUT]
일반적인 한국어 분석을 먼저 작성한 뒤, 응답의 맨 마지막에 아래 마커와 동일한 형식의 순수 JSON 블록을 반드시 출력하십시오. 마커·키 이름을 변경하거나 JSON에 주석을 넣지 마십시오.

${COMPETITOR_REGISTRY_START}
{
  "version": 1,
  "selectionPolicy": "threat-ranked-direct-only",
  "selected": [
    {
      "rank": 1,
      "name": "경쟁사명",
      "threatScore": 92,
      "userSpecified": true,
      "selectionReason": "왜 지금 가장 위협적인지 한 문장",
      "evidenceSignals": ["시장 침투 근거", "성장/캠페인/변곡점 근거"]
    }
  ],
  "reviewedCandidates": [
    {
      "name": "후보명",
      "userSpecified": true,
      "selected": false,
      "threatScore": 54,
      "decisionReason": "검토했으나 상세 분석에서 제외한 이유"
    }
  ]
}
${COMPETITOR_REGISTRY_END}`;

const STEP2_USER_POLICY = `

[최종 산출 구조]
A. Competitive Threat Landscape: 사용자 지정 후보와 AI 추가 발견 후보를 함께 검토
B. Threat Ranking & Selection Logic: 시장 침투·성장·선호·캠페인·변곡점 기준 순위
C. Selected Competitor Deep Dive: 최종 2~5개 경쟁사의 성장, Core Desire, 핵심 소구, 위협 메커니즘
D. Product Matrix: 선정 경쟁사만 사용한 기능·사업모델·고객가치 비교
E. Positioning Map: 선정 경쟁사만 사용한 AS-IS → TO-BE
F. 응답 마지막: COMPETITOR_REGISTRY_START/END 마커 사이의 JSON Registry

'필수 포함 경쟁사'라는 레거시 문구가 추가로 보이더라도, 이는 반드시 검토하라는 뜻이지 자동 선정하라는 뜻이 아닙니다.`;

const DOWNSTREAM_RULES: Record<number, string> = {
  3: `[LOCKED COMPETITOR CONTEXT]
아래 Registry는 Step 2에서 시장 위협도 기준으로 확정된 경쟁사입니다. 소비자 선택·이탈·AIPL 병목을 설명할 때 필요한 경우 이 명단만 사용하십시오. 새로운 경쟁사를 임의 추가하거나 선정 결과를 바꾸지 마십시오.`,
  4: `[LOCKED COMPETITOR CREATIVE SCOPE]
아래 Registry의 선정 경쟁사 각각에 대해 최근 5개 완료연도 + 현재연도 YTD의 Creative History를 조사하십시오.
- 경쟁사별 분석을 한 문단이나 한 표로 압축하지 마십시오.
- 각 브랜드마다 연도별 모델, 캠페인명, 실제 카피 원문(Verbatim), 매체/포맷, 소구 전략, 메시지 궤적을 독립적으로 확보하십시오.
- 현재연도 공개 캠페인이 없으면 '신규 캠페인 공개 미확인'이라고 기록하십시오.
- Registry 밖의 경쟁사로 대체하거나 선정 경쟁사를 누락하지 마십시오.`,
  5: `[LOCKED COMPETITOR STRATEGY SCOPE]
SWOT, Root Cause, Winning Move를 도출할 때 아래 Registry의 선정 경쟁사만 핵심 경쟁 구도로 사용하십시오. Step 2의 순위와 선정 근거를 임의 변경하지 마십시오.`,
};

function asObject(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null ? value as Record<string, unknown> : null;
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function asBoolean(value: unknown): boolean {
  return value === true;
}

function asScore(value: unknown): number {
  const score = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map(asString).filter(Boolean).slice(0, 6);
}

function normalizeSelected(value: unknown): SelectedCompetitor[] {
  if (!Array.isArray(value)) return [];

  const deduped = new Map<string, SelectedCompetitor>();
  value.forEach((item, index) => {
    const object = asObject(item);
    if (!object) return;
    const name = asString(object.name);
    if (!name) return;

    const key = name.toLocaleLowerCase('ko-KR');
    if (deduped.has(key)) return;

    deduped.set(key, {
      rank: Number.isFinite(Number(object.rank)) ? Math.max(1, Math.round(Number(object.rank))) : index + 1,
      name,
      threatScore: asScore(object.threatScore ?? object.score),
      userSpecified: asBoolean(object.userSpecified),
      selectionReason: asString(object.selectionReason ?? object.reason),
      evidenceSignals: asStringArray(object.evidenceSignals ?? object.signals),
    });
  });

  return Array.from(deduped.values())
    .sort((a, b) => a.rank - b.rank || b.threatScore - a.threatScore)
    .slice(0, 5)
    .map((item, index) => ({ ...item, rank: index + 1 }));
}

function normalizeCandidates(value: unknown): ReviewedCompetitorCandidate[] {
  if (!Array.isArray(value)) return [];

  const deduped = new Map<string, ReviewedCompetitorCandidate>();
  value.forEach((item) => {
    const object = asObject(item);
    if (!object) return;
    const name = asString(object.name);
    if (!name) return;
    const key = name.toLocaleLowerCase('ko-KR');
    if (deduped.has(key)) return;

    deduped.set(key, {
      name,
      userSpecified: asBoolean(object.userSpecified),
      selected: asBoolean(object.selected),
      threatScore: asScore(object.threatScore ?? object.score),
      decisionReason: asString(object.decisionReason ?? object.reason),
    });
  });

  return Array.from(deduped.values()).slice(0, 20);
}

function extractJsonObject(text: string): string | null {
  const markerStart = text.indexOf(COMPETITOR_REGISTRY_START);
  const markerEnd = text.indexOf(COMPETITOR_REGISTRY_END, markerStart + COMPETITOR_REGISTRY_START.length);

  let block = '';
  if (markerStart >= 0 && markerEnd > markerStart) {
    block = text.slice(markerStart + COMPETITOR_REGISTRY_START.length, markerEnd);
  } else {
    const selectedKey = text.lastIndexOf('"selected"');
    if (selectedKey < 0) return null;
    const objectStart = text.lastIndexOf('{', selectedKey);
    const objectEnd = text.indexOf('}', selectedKey);
    if (objectStart < 0 || objectEnd < 0) return null;
    block = text.slice(objectStart, text.lastIndexOf('}') + 1);
  }

  block = block.replace(/```(?:json)?/gi, '').trim();
  const jsonStart = block.indexOf('{');
  const jsonEnd = block.lastIndexOf('}');
  if (jsonStart < 0 || jsonEnd <= jsonStart) return null;
  return block.slice(jsonStart, jsonEnd + 1);
}

export function parseCompetitorRegistry(text: string | null | undefined): CompetitorRegistry | null {
  if (!text?.trim()) return null;
  const jsonText = extractJsonObject(text);
  if (!jsonText) return null;

  try {
    const parsed = asObject(JSON.parse(jsonText));
    if (!parsed) return null;
    const selected = normalizeSelected(parsed.selected);
    if (selected.length < 2) return null;

    return {
      version: 1,
      selectionPolicy: 'threat-ranked-direct-only',
      selected,
      reviewedCandidates: normalizeCandidates(parsed.reviewedCandidates ?? parsed.candidates),
    };
  } catch (error) {
    console.warn('[Competitor Registry] JSON parse failed', error);
    return null;
  }
}

function registryContext(registry: CompetitorRegistry): string {
  const selectedLines = registry.selected.map((competitor) => {
    const seed = competitor.userSpecified ? '사용자 지정 후보' : 'AI 추가 발견';
    const signals = competitor.evidenceSignals.length > 0
      ? ` | 근거: ${competitor.evidenceSignals.join(' / ')}`
      : '';
    return `${competitor.rank}. ${competitor.name} — 위협도 ${competitor.threatScore}/100 — ${seed} — ${competitor.selectionReason}${signals}`;
  });

  return `${selectedLines.join('\n')}\n\n선정 수: ${registry.selected.length}개 (최소 2, 최대 5)`;
}

function applyRegistryToDownstreamPrompts(registry: CompetitorRegistry | null): void {
  [3, 4, 5].forEach((step) => {
    const node = RESEARCH_NODES.find((item) => item.step === step);
    const base = downstreamPromptBases.get(step);
    if (!node || !base) return;

    node.userPromptTemplate = registry
      ? `${base}\n\n${DOWNSTREAM_RULES[step]}\n${registryContext(registry)}`
      : base;
  });
}

export function syncCompetitorRegistryFromResearch(text: string | null | undefined): CompetitorRegistry | null {
  const parsed = parseCompetitorRegistry(text);
  activeRegistry = parsed;
  applyRegistryToDownstreamPrompts(parsed);

  if (text?.trim() && !parsed) {
    console.warn('[Competitor Registry] Step 2 result has no valid 2~5 competitor registry. Downstream prompts remain unlocked.');
  } else if (parsed) {
    console.info(`[Competitor Registry] Locked ${parsed.selected.length} competitors: ${parsed.selected.map((item) => item.name).join(', ')}`);
  }

  return parsed;
}

export function getActiveCompetitorRegistry(): CompetitorRegistry | null {
  return activeRegistry;
}

function replaceTextNode(root: HTMLElement, from: string, to: string): void {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    if (node.textContent?.includes(from)) node.textContent = node.textContent.replace(from, to);
    node = walker.nextNode();
  }
}

function applyCompetitorUiCopy(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>('label').forEach((label) => {
    if (label.textContent?.includes('필수 포함 경쟁사')) {
      replaceTextNode(label, '필수 포함 경쟁사', '필수 검토 경쟁사');
      label.title = '입력한 업체는 반드시 후보군에서 검토하지만, 시장 위협도 순위에 따라 최종 Top 2~5에서 제외될 수 있습니다.';
    }
  });

  root.querySelectorAll<HTMLInputElement>('input').forEach((input) => {
    if (input.placeholder.includes('삼성카드, 현대카드, 토스뱅크')) {
      input.placeholder = '예: 삼성카드, 현대카드, 토스뱅크 (검토 후보 · 최종 선정은 위협도 순)';
    }
  });
}

export function installCompetitorSelectionPolicy(): void {
  if (installed) return;
  installed = true;

  const step2 = RESEARCH_NODES.find((node) => node.step === 2);
  if (step2) {
    step2.systemPrompt = step2.systemPrompt
      .replace(/간접 경쟁사는[^\n]*\n?/g, '')
      + THREAT_SELECTION_POLICY;

    step2.userPromptTemplate = step2.userPromptTemplate
      .replace(/- Indirect Competitor:[^\n]*\n?/g, '')
      + STEP2_USER_POLICY;

    step2.manualGuide = '사용자 지정 후보와 AI가 추가 발견한 후보를 모두 검토한 뒤, 실제 시장 위협도 기준 Top 2~5를 선정하십시오. 간접 경쟁사는 제외하고, 선정·제외 근거와 Registry JSON을 함께 작성하십시오.';
    step2.manualPlaceholder = 'Competitive Threat Landscape: 사용자 지정 + AI 추가 후보\nThreat Ranking: 시장 침투·성장·선호·캠페인·변곡점 기준 100점 평가\nSelected Competitors: 위협도 Top 2~5와 선정 근거\nProduct Matrix / Positioning Map: 선정 경쟁사만 사용\n마지막에 COMPETITOR_REGISTRY_START/END JSON 블록 필수';
  }

  [3, 4, 5].forEach((step) => {
    const node = RESEARCH_NODES.find((item) => item.step === step);
    if (!node) return;
    downstreamPromptBases.set(step, node.userPromptTemplate);
  });

  if (typeof document !== 'undefined') {
    applyCompetitorUiCopy();
    uiObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) applyCompetitorUiCopy(node);
        });
      });
    });
    uiObserver.observe(document.documentElement, { childList: true, subtree: true });
  }
}

export function uninstallCompetitorSelectionUiObserver(): void {
  uiObserver?.disconnect();
  uiObserver = null;
}
