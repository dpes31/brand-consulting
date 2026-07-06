const VISUAL_START = '<!-- VISUAL_INTENT_BRIEF_START -->';
const VISUAL_END = '<!-- VISUAL_INTENT_BRIEF_END -->';
const COMPETITOR_START = '<!-- COMPETITOR_REGISTRY_START -->';
const COMPETITOR_END = '<!-- COMPETITOR_REGISTRY_END -->';
const CREATIVE_START = '<!-- CREATIVE_HISTORY_REGISTRY_START -->';
const CREATIVE_END = '<!-- CREATIVE_HISTORY_REGISTRY_END -->';

const competitors = ['알파원', '베타랩', '감마코'];

function visualBrief({ insightId, step, recipeId, evidenceType, implementationStatus, entities, section, question, message }) {
  return {
    insightId,
    section,
    preferredSlideId: `qa-step-${step}`,
    decisionQuestion: question,
    evidenceType,
    coreMessage: message,
    primaryRecipe: { recipeId, priority: 1 },
    fallbackRecipe: { recipeId: 'evidence-gap', priority: 2 },
    selectionReason: '확보된 조사 근거를 의사결정 가능한 시각 구조로 연결하기 위한 QA 선정 이유입니다.',
    confidence: 'medium',
    requiredInputs: ['핵심 근거', '의사결정 질문', '전략적 함의'],
    availableInputs: ['QA 검증용 구조화 근거'],
    missingInputs: ['실제 운영 데이터 검증'],
    metrics: [],
    entities,
    timePeriods: ['2021', '2022', '2023', '2024', '2025', '2026'],
    implementationStatus,
  };
}

function visualRegistry(brand, step, visualBriefs) {
  return `${VISUAL_START}\n${JSON.stringify({ version: 1, brand, step, visualBriefs }, null, 2)}\n${VISUAL_END}`;
}

function step2Fixture(brand) {
  const selected = competitors.map((name, index) => ({
    rank: index + 1,
    name,
    threatScore: 91 - index * 8,
    userSpecified: false,
    selectionReason: `${name}은 시장 침투·성장·메시지 확장 관점에서 직접 위협입니다.`,
    evidenceSignals: ['시장 침투', '성장 모멘텀'],
  }));
  const registry = { version: 1, selectionPolicy: 'threat-ranked-direct-only', selected, reviewedCandidates: [] };
  const briefs = [
    visualBrief({
      insightId: 'STEP2_RANK_01', step: 2, recipeId: 'rank-scorecard', evidenceType: 'priority-ranking', implementationStatus: 'planned', entities: competitors,
      section: 'II. COMPETITOR > Threat Ranking', question: '어떤 경쟁사가 향후 고객과 문화적 주도권을 가장 크게 위협하는가?', message: '세 경쟁사의 위협을 공통 기준으로 평가해 우선순위를 확정합니다.',
    }),
    ...competitors.map((name, index) => visualBrief({
      insightId: `STEP2_DEEP_${index + 1}`, step: 2, recipeId: 'competitor-threat-system', evidenceType: 'causal-relationship', implementationStatus: 'pilot-supported', entities: [name],
      section: `II. COMPETITOR > ${name} Deep Dive`, question: `${name}은 어떤 메커니즘으로 ${brand}의 고객 선택을 빼앗는가?`, message: `${name}의 성장 근거부터 Core Desire와 공격 지점까지 독립적으로 연결합니다.`,
    })),
    visualBrief({
      insightId: 'STEP2_MATRIX_01', step: 2, recipeId: 'feature-matrix', evidenceType: 'competitive-space', implementationStatus: 'pilot-supported', entities: [brand, ...competitors],
      section: 'II. COMPETITOR > Product Matrix', question: '공통 비교축에서 조사 브랜드와 선정 경쟁사의 차이는 무엇인가?', message: '제품·서비스·고객가치의 공통 비교축을 통해 차별화 공백을 확인합니다.',
    }),
  ];
  return `Step 2 QA 경쟁 분석입니다. Threat Ranking, 경쟁사별 Deep Dive, Product Matrix를 포함합니다.\n${COMPETITOR_START}\n${JSON.stringify(registry, null, 2)}\n${COMPETITOR_END}\n${visualRegistry(brand, 2, briefs)}`;
}

function creativeFixture(brand) {
  const makeHistory = (name, role) => ({
    brand: name,
    role,
    entries: [2021, 2022, 2023, 2024, 2025, 2026].map((year) => ({
      year,
      campaignName: year === 2026 ? '신규 캠페인 공개 미확인' : '캠페인명 공개 미확인',
      model: '모델 공개 미확인',
      keyCopyVerbatim: year === 2026 ? '신규 캠페인 공개 미확인' : '원문 카피 공개 미확인',
      copyStatus: 'not-found',
      mediaFormat: '매체/포맷 공개 미확인',
      appealStrategy: '소구 전략 근거 미확인',
      evidenceLabel: `QA Fixture · ${name} Creative History · ${year}`,
    })),
    messageTrajectory: '공개 근거가 부족한 연도는 추정하지 않고 검증 상태를 유지합니다.',
    strategicSoWhat: '확인되지 않은 카피를 만들지 않고 향후 확보해야 할 근거를 명확히 남깁니다.',
  });
  const registry = {
    version: 1,
    period: { startYear: 2021, endYear: 2025, currentYearYtd: 2026 },
    brands: [makeHistory(brand, 'target'), ...competitors.map((name) => makeHistory(name, 'competitor'))],
  };
  return `Step 4 QA Creative History입니다. 조사 브랜드와 선정 경쟁사 전체의 2021~2026 상태를 기록합니다.\n${CREATIVE_START}\n${JSON.stringify(registry, null, 2)}\n${CREATIVE_END}`;
}

export function buildPhase6StepFixtures(brand = '모노랩') {
  const step0 = `Step 0 QA Brand Fact Book입니다. 브랜드 정체성, 성장 사건, Product USP와 Best Self를 분석합니다.\n${visualRegistry(brand, 0, [visualBrief({
    insightId: 'STEP0_GROWTH_01', step: 0, recipeId: 'milestone-timeline', evidenceType: 'time-change', implementationStatus: 'pilot-supported', entities: [brand],
    section: '0-2. Growth Story & Core Inflection', question: `${brand}의 성장 엔진은 어떤 사건을 거치며 변화했는가?`, message: '2021년부터 2026년까지의 핵심 사건과 성장 엔진 전환을 시간 순서로 연결합니다.',
  })])}`;
  const step1 = 'Step 1 QA 시장 분석입니다. 정책·경제·기술 변화가 카테고리 가치와 소비자 선택 기준을 어떻게 바꾸는지 50자 이상의 결론형 문장으로 정리합니다.';
  const step3 = `Step 3 QA 소비자 분석입니다. Trends, Persona, Identity Alignment, JTBD, AIPL, Unmet Needs를 유지합니다.\n${visualRegistry(brand, 3, [visualBrief({
    insightId: 'STEP3_CORE_01', step: 3, recipeId: 'friction-flow', evidenceType: 'causal-relationship', implementationStatus: 'planned', entities: ['핵심 타깃'],
    section: 'III. CONSUMER > Core Decision Structure', question: '소비자는 어떤 단계에서 가장 크게 막히고 왜 구매로 전환하지 못하는가?', message: '정보 탐색 이후 판단 불안이 행동 중단으로 이어지는 핵심 마찰 구조를 보여줍니다.',
  })])}`;
  const step5 = `Step 5 QA 전략 분석입니다. SWOT, GAP, Root Cause, 세 전략 경로, Big IdeaL, Winning Move, Via Negativa, Pre-mortem과 실행 순서를 유지합니다.\n${visualRegistry(brand, 5, [visualBrief({
    insightId: 'STEP5_CORE_01', step: 5, recipeId: 'choice-architecture', evidenceType: 'strategic-choice', implementationStatus: 'planned', entities: [brand],
    section: 'V. STRATEGY > Final Strategic Choice', question: `${brand}은 어떤 전략을 선택하고 무엇을 포기해야 하는가?`, message: '전략 대안의 기준과 Trade-off를 비교해 최종 Winning Move를 선택합니다.',
  })])}`;
  return [step0, step1, step2Fixture(brand), step3, creativeFixture(brand), step5];
}

export function buildProductionReportFixture(brand = '모노랩') {
  const source = [{ publisher: 'QA Fixture', title: 'Phase 6 V2 E2E', year: '2026' }];
  const base = (page, recipe, title) => ({
    id: `qa-page-${String(page).padStart(2, '0')}`, page, zone: page <= 40 ? 'main' : 'appendix',
    chapter: page <= 8 ? '0. BRAND FACT BOOK' : page <= 10 ? 'I. MARKET' : page <= 18 ? 'II. COMPETITOR' : page <= 29 ? 'III. CONSUMER' : page <= 36 ? 'IV. CREATIVE' : page <= 40 ? 'V. STRATEGY' : 'APPENDIX',
    title, recipe, implication: page === 1 ? undefined : `QA 검증 결과, [[${title}의 의사결정 의미]]를 확인합니다.`, sources: source,
  });
  const structured = (page, title) => ({ ...base(page, 'structured-summary', title), sections: [
    { label: 'CONTEXT', headline: `${title}의 핵심 맥락`, bullets: ['검증 문장 1', '검증 문장 2', '한국어 줄바꿈과 정보 위계를 확인합니다.'] },
    { label: 'EVIDENCE', headline: '구조화된 근거', bullets: ['출처 근접성', '결론형 제목', '1280×720 밀도'] },
    { label: 'DECISION', headline: '실행 판단', bullets: ['So What 유지', '노란 형광펜 유지'] },
  ] });
  const flow = (page, recipe, title) => ({ ...base(page, recipe, title), nodes: Array.from({ length: 5 }, (_, index) => ({ label: `STEP ${index + 1}`, headline: `${title} ${index + 1}`, detail: '원인과 결과를 한 단계씩 연결합니다.', tone: index === 3 ? 'risk' : index === 4 ? 'target' : 'neutral' })) });
  const matrix = (page, recipe, title) => ({ ...base(page, recipe, title), columns: [brand, '알파원', '베타랩'], rows: Array.from({ length: 5 }, (_, index) => ({ label: `비교축 ${index + 1}`, cells: ['강점', '보통', '차이'], emphasis: index === 1 })) });
  const persona = (page, number) => ({ ...base(page, 'persona', `Persona ${number}`), persona: { number: `0${number}`, situation: ['업무가 복잡해졌습니다.', '정보는 많지만 판단이 어렵습니다.', '실패 비용을 줄이고 싶습니다.'], surfaceNeed: '쉽고 빠르게 결정하고 싶다', realJob: '근거를 이해하고 확신 있게 선택한다', fears: ['잘못된 선택', '숨은 비용', '책임 불명확'], currentIdentity: '정보에 끌려가는 사용자', desiredIdentity: '판단을 통제하는 사용자', brandRole: '복잡한 근거를 설명하고 최종 선택권을 남기는 파트너' } });
  const creative = (page, historyBrand) => ({ ...base(page, 'creative-history', `${historyBrand} Creative History`), brand: historyBrand, years: ['2021','2022','2023','2024','2025','2026'].map((year, index) => ({ year, campaign: index === 5 ? '2026 YTD 신규 캠페인 공개 미확인' : `${year} QA 캠페인`, copy: index === 0 ? '“QA 검증 카피”' : '카피 원문 미확인', detail: '모델·매체·소구 전략의 배치와 가독성을 확인합니다.', status: index === 0 ? 'verified-verbatim' : index === 5 ? 'not-found' : 'source-found-copy-unverified', source: { publisher: 'QA Fixture', title: `${historyBrand} Creative History`, year } })), trajectory: '기능 설명에서 판단 근거와 브랜드 역할로 메시지가 확장됩니다.', strategicSoWhat: '카피보다 일관된 브랜드 행동과 증거 구조를 자산화해야 합니다.' });

  const slides = [
    { ...base(1, 'cover', `${brand} Strategic Consulting Report`), kicker: '2026 STRATEGIC REPORT', subtitle: 'Phase 6 Approved FULL Renderer E2E Fixture' },
    structured(2, 'Executive Summary'), structured(3, 'Brand Identity'),
    { ...base(4, 'metric-strip', 'KPI Snapshot'), metrics: Array.from({ length: 4 }, (_, index) => ({ label: `KPI ${index + 1}`, value: `${(index + 1) * 25}%`, period: '2026 QA', interpretation: '수치·기간·해석의 위계를 확인합니다.' })) },
    structured(5, 'Category & Core Target'),
    { ...base(6, 'milestone-timeline', 'Growth Story'), events: ['2021','2022','2023','2024','2025','2026'].map((period, index) => ({ period, title: `변곡점 ${index + 1}`, detail: '성장 사건과 전략적 의미를 시간 순서로 보여줍니다.', verified: true })) },
    flow(7, 'causal-flow', 'Core Inflection'), structured(8, 'Product USP & Brand Best Self'), structured(9, 'Market Context'), flow(10, 'causal-flow', 'Category Value Shift'),
    structured(11, 'Competitive Landscape'), matrix(12, 'rank-scorecard', 'Threat Ranking'), flow(13, 'causal-flow', 'Competitor Deep Dive 1'), flow(14, 'causal-flow', 'Competitor Deep Dive 2'), flow(15, 'causal-flow', 'Competitor Deep Dive 3'), matrix(16, 'feature-matrix', 'Product Matrix'), structured(17, 'Category Cliché'), flow(18, 'as-is-to-be', 'Positioning'),
    structured(19, 'Consumer Executive Conclusion'), structured(20, 'Consumer Trends'), structured(21, 'Core Target'), persona(22, 1), persona(23, 2), persona(24, 3), flow(25, 'as-is-to-be', 'Identity Alignment'), structured(26, 'JTBD'), structured(27, 'Pain Points & Unmet Needs'), flow(28, 'friction-flow', 'AIPL Bottleneck'), flow(29, 'causal-flow', 'Purchase to Loyalty'),
    structured(30, 'Creative Methodology'), creative(31, brand), creative(32, '알파원'), creative(33, '베타랩'), creative(34, '감마코'),
    { ...base(35, 'milestone-timeline', 'Message Trajectory'), events: ['2021','2022','2023','2024','2025','2026'].map((period, index) => ({ period, title: `메시지 ${index + 1}`, detail: '메시지 변화와 의미를 연결합니다.', verified: true })) },
    flow(36, 'causal-flow', 'Creative Insight'),
    { ...base(37, 'swot', 'SWOT'), strength: ['데이터 연결성', '설명 가능한 구조'], weakness: ['인지 편중', '증거 부족'], opportunity: ['시장 전환', '새로운 기준'], threat: ['무료화', '경쟁 심화'] },
    flow(38, 'root-cause-flow', 'GAP & Root Cause'),
    { ...base(39, 'stp-convergence', 'STP'), segments: [{ name: '핵심 사용자', description: '판단 책임이 커지는 고객', selected: true }, { name: '보조 사용자', description: '편의 중심 고객' }], target: { name: '불안한 성장 사용자', description: '복잡성은 증가하지만 내부 전문 인력은 부족합니다.' }, positioning: { statement: '설명 가능한 판단 플랫폼', proof: ['근거 표시', '선택권 보존', '책임 구조'] } },
    { ...base(40, 'choice-architecture', 'Strategic Directions & Final Choice'), options: [{ name: '기능', rationale: '편의 강화', score: '3/5' }, { name: '안심', rationale: '불안 완화', score: '4/5' }, { name: '통제', rationale: '판단권 강화', score: '5/5', selected: true }, { name: '확장', rationale: '플랫폼화', score: '4/5' }], finalChoice: { name: '설명 가능한 통제', statement: '맡겨도 알 권리는 남깁니다.', reasons: ['차별성', '병목 해결', '제품 연결'] } },
    structured(41, 'Winning Move Specification'), structured(42, 'Via Negativa'), structured(43, 'Pre-mortem'),
    { ...base(44, 'roadmap', 'Execution Roadmap'), items: Array.from({ length: 4 }, (_, index) => ({ label: `0${index + 1}`, headline: `실행 ${index + 1}`, detail: '단계별 실행과 승인 조건을 확인합니다.' })) },
    matrix(45, 'feature-matrix', 'Measurement Plan'),
    { ...base(46, 'evidence-gap', 'Evidence Gaps'), items: Array.from({ length: 4 }, (_, index) => ({ label: `GAP ${index + 1}`, headline: '추가 검증 필요', detail: '의사결정 전 채워야 할 데이터 공백입니다.', tone: 'risk' })) },
    { ...base(47, 'evidence-list', 'Source Labels'), items: Array.from({ length: 4 }, (_, index) => ({ label: `SOURCE ${index + 1}`, headline: 'QA Fixture', detail: '출처명·자료명·연도만 표시합니다.' })) },
    structured(48, 'Decision Receipt / Close'),
  ];
  if (slides.length !== 48) throw new Error(`Fixture page count ${slides.length}`);
  return { version: '1.0.0', brand, generatedAt: '2026-07-06', mainSlides: slides.slice(0, 40), appendixSlides: slides.slice(40) };
}
