import { useEffect, useState, type ReactNode } from 'react';
import './BiznupHtmlPilot.css';

const PILOT_RECIPES = [
  'milestone-timeline',
  'competitor-threat-system',
  'feature-matrix',
  'friction-flow',
  'choice-architecture',
] as const;

type SlideProps = {
  page: number;
  kicker: string;
  title: string;
  message?: ReactNode;
  source?: string;
  children: ReactNode;
  recipeId?: typeof PILOT_RECIPES[number];
  vizType?: string;
  className?: string;
};

function Slide({ page, kicker, title, message, source, children, recipeId, vizType, className = '' }: SlideProps) {
  return (
    <section
      className={`biz-pilot-slide ${className}`}
      data-page-number={page}
      {...(recipeId ? { 'data-recipe-id': recipeId } : {})}
      {...(vizType ? { 'data-viz-type': vizType } : {})}
    >
      <header>
        <div className="biz-slide-kicker">{kicker}</div>
        <h2 className="biz-slide-title">{title}</h2>
        {message ? <p className="biz-slide-message">{message}</p> : null}
      </header>
      <div className="biz-slide-body">{children}</div>
      <footer className="biz-slide-footer">
        <span>{source || '비즈넵 통합 리서치 · Gate 2A 검증 결과'}</span>
        <span className="biz-slide-number">{String(page).padStart(2, '0')} / 23</span>
      </footer>
    </section>
  );
}

const timeline = [
  { year: '2016', event: '에멘탈 설립', meaning: '사업자 경영 데이터 기술 축적 시작' },
  { year: '2021', event: '지엔터프라이즈 전환', meaning: '네이버·네이버파이낸셜 투자와 사업 기반 확대' },
  { year: '2022', event: '비즈넵 환급 출시', meaning: '경영관리 도구에서 세무 문제 해결로 진입' },
  { year: '2024', event: '100만 가입자', meaning: '환급·케어 통합과 AI 상담 세나 확장' },
  { year: '2025', event: '시리즈 C 165억', meaning: '가입자 300만, 관리 환급액 1조원대 진입' },
  { year: '2026', event: '400만 가입자', meaning: '종합 세무관리 플랫폼으로의 전환 압력' },
];

const competitors = [
  {
    name: '삼쩜삼',
    score: 91,
    evidence: '누적 신고 고객 720만8,747명',
    desire: '놓친 돈을 즉시 되찾고 싶다',
    appeal: '간편 조회·즉각적 예상 환급액',
    mechanism: '대규모 유입과 상기가 세금 앱의 기본값을 강화',
    attack: '사업자에게 설명 가능하고 검증 가능한 판단을 소유',
    source: '삼쩜삼 공식 서비스 통계, 2026년 · 검증상태 partially-verified',
  },
  {
    name: '더낸세금·혜움',
    score: 85,
    evidence: '202만 사업자 선택 · 2025년 시리즈B 105억원',
    desire: '세무·재무 업무가 알아서 관리되길 바란다',
    appeal: '사업자 특화·세무사 검토·AI 에이전트',
    mechanism: '경정청구 유입을 기장과 재무 데이터 락인으로 전환',
    attack: '추상적 AI보다 일상적 세금 위험을 먼저 알려주는 언어',
    source: '더낸세금 공식 페이지·혜움 투자 발표, 2025~2026년 · partially-verified',
  },
  {
    name: 'SSEM',
    score: 73,
    evidence: '2023년 말 가입자 80만명 · 신고 21만건',
    desire: '세무사 없이도 신고를 끝내고 싶다',
    appeal: '저비용 셀프신고·반복 시즌 접점',
    mechanism: '반복 신고 경험이 이용 습관과 세무 데이터를 축적',
    attack: '셀프 계산 부담 없이도 최종 승인권을 주는 검증 구조',
    source: '널리소프트 투자 발표·머니투데이, 2024년 · partially-verified',
  },
];

const matrixRows = [
  ['핵심 고객', '개인·법인 사업자', '프리랜서·근로자·개인사업자', '개인·법인 사업자', '개인사업자'],
  ['대표 진입상품', '사업자 환급', '종소세 신고·환급', '사업자 경정청구', '부가세·종소세 신고'],
  ['핵심 경험', 'AI 계산 + 전문가 검토', '간편 조회 + 즉각 보상', '전문가 대리 + AI 관리', '저비용 셀프신고'],
  ['반복 이용 구조', '환급→상담→기장 확장 가능', '생활형 세금·금융 확장', '기장·재무 에이전트 락인', '신고 시즌 반복 방문'],
  ['소유한 가치', '사업자 환급 대표성', '끝까지 찾는 집요함', '전문가 책임', '사용자 통제'],
  ['구조적 취약점', '일회성 환급 인식', '복잡한 사업자 세무 전문성', '소비자 언어가 추상적', '전문가 검증·책임 범위'],
];

const frictionSteps = [
  { title: '광고 노출', copy: '환급 가능성과 예상액이 관심을 만든다.', tag: 'Trigger' },
  { title: '환급 조회', copy: '즉각적 기대편익이 행동을 유도한다.', tag: 'Action' },
  { title: '정보 제공', copy: '개인정보와 세무대리 범위가 불안으로 전환된다.', tag: 'Friction', drop: true },
  { title: '수수료·위험 확인', copy: '계산 근거·추징 가능성·책임 주체가 보이지 않는다.', tag: 'Drop-off', drop: true },
  { title: '신청 또는 이탈', copy: '설명과 통제권이 부족하면 관심이 구매로 전환되지 않는다.', tag: 'Decision' },
];

const choices = [
  {
    badge: 'Route A · Functional',
    title: '환급보다 예방',
    copy: '더 내기 전에 막아주는 상시 세무관리. 제품 확장성은 높지만 사전 예측 증거와 복제 방어가 필요하다.',
    scores: [['차별성', '3/5'], ['확장성', '5/5'], ['실행성', '2/5']],
  },
  {
    badge: 'Route B · Emotional',
    title: '맡겨도 안심',
    copy: '오류·추징·책임 불안을 줄이는 정서적 안전망. 구매 병목에는 유효하지만 혜움의 책임 언어와 중첩된다.',
    scores: [['차별성', '2/5'], ['병목해결', '4/5'], ['실행성', '4/5']],
  },
  {
    badge: 'Route C · Cultural · Selected',
    title: '맡겨도, 알 권리는 남는다',
    copy: '세무 판단을 이해하고 승인할 권리를 제공한다. 편의·전문성·통제감을 하나의 원칙으로 결합한다.',
    scores: [['차별성', '5/5'], ['확장성', '5/5'], ['자산화', '5/5']],
    selected: true,
  },
];

function ThreatSystem({ competitor }: { competitor: typeof competitors[number] }) {
  return (
    <>
      <div className="biz-threat-system">
        <div className="biz-threat-node"><h4>Evidence</h4><p>{competitor.evidence}</p></div>
        <div className="biz-threat-node"><h4>Core Desire</h4><p>{competitor.desire}</p></div>
        <div className="biz-threat-node"><h4>Appeal</h4><p>{competitor.appeal}</p></div>
        <div className="biz-threat-node is-mechanism"><h4>Threat Mechanism</h4><p>{competitor.mechanism}</p></div>
        <div className="biz-threat-node is-attack"><h4>Attack Point</h4><p>{competitor.attack}</p></div>
      </div>
      <div className="biz-evidence-strip">
        <div className="biz-evidence-item">위협도 평가 <strong>{competitor.score}/100</strong> · 전략 평가점수, 공인 점유율 아님</div>
        <div className="biz-evidence-item">Primary Recipe · competitor-threat-system</div>
        <div className="biz-evidence-item">{competitor.source}</div>
      </div>
    </>
  );
}

export default function BiznupHtmlPilot() {
  const [validation, setValidation] = useState({ recipes: 0, pages: 0, overflow: 0 });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const root = document.querySelector('.biz-pilot-deck');
      if (!root) return;
      const slides = Array.from(root.querySelectorAll<HTMLElement>('.biz-pilot-slide'));
      const uniqueRecipes = new Set(
        Array.from(root.querySelectorAll<HTMLElement>('[data-recipe-id]'))
          .map((node) => node.dataset.recipeId)
          .filter(Boolean),
      );
      const overflow = slides.filter((slide) => slide.scrollHeight > slide.clientHeight + 2 || slide.scrollWidth > slide.clientWidth + 2).length;
      setValidation({ recipes: uniqueRecipes.size, pages: slides.length, overflow });
    }, 350);
    return () => window.clearTimeout(timer);
  }, []);

  const isPass = validation.recipes === PILOT_RECIPES.length && validation.pages === 23 && validation.overflow === 0;

  return (
    <main className="biz-pilot" id="biznup-pilot">
      <div className="biz-pilot-toolbar">
        <div className="biz-pilot-brand">
          <div className="biz-pilot-brand-mark">B</div>
          <div><strong>비즈넵 HTML Pilot</strong><br /><span>5 validated recipes · 23-page strategic deck</span></div>
        </div>
        <div className="biz-pilot-actions">
          <span className={`biz-pilot-chip ${isPass ? 'is-pass' : ''}`}>{isPass ? 'VALIDATION PASS' : 'VALIDATING'}</span>
          <span className="biz-pilot-chip">Recipe {validation.recipes}/5</span>
          <span className="biz-pilot-chip">Pages {validation.pages}/23</span>
          <span className="biz-pilot-chip">Overflow {validation.overflow}</span>
          <button className="biz-pilot-button" onClick={() => window.print()}>PDF / Print</button>
          <button className="biz-pilot-button" onClick={() => { window.location.href = '/'; }}>Dashboard</button>
        </div>
      </div>

      <div className="biz-pilot-deck">
        <section className="biz-pilot-slide biz-cover" data-page-number="1">
          <div className="biz-slide-kicker">Brand Strategy Consulting Report · 2026</div>
          <h1 className="biz-cover-title">환급을 넘어,<br />세무 판단을 보이게 하라</h1>
          <p className="biz-cover-sub">비즈넵의 환급·신고·기장·AI 상담을 하나의 브랜드 원칙으로 연결하는 전략 보고서. 검증된 5개 Visual Recipe를 결정론적 HTML 구조로 적용했습니다.</p>
          <div className="biz-cover-meta"><span>Target · 비즈넵</span><span>Locked Competitors · 삼쩜삼 / 더낸세금·혜움 / SSEM</span><span>Gate 2A · PASS</span></div>
        </section>

        <Slide page={2} kicker="Executive Verdict" title="제품은 관계형인데, 브랜드는 사건형이다" message={<>비즈넵은 환급에서 상시 세무관리로 확장됐지만 소비자 기억은 여전히 <strong>‘사장님 세금 환급’</strong>에 머뭅니다.</>}>
          <div className="biz-grid-3">
            <div className="biz-card is-risk"><div className="biz-card-label">Current Perception</div><div className="biz-card-value">일회성 환급 앱</div><div className="biz-card-copy">큰 예상액과 간편 신청은 보이지만, 왜 이 금액인지와 누가 책임지는지는 약합니다.</div></div>
            <div className="biz-card"><div className="biz-card-label">Product Reality</div><div className="biz-card-value">지속 세무관리 구조</div><div className="biz-card-copy">환급·AI 상담·기장·전문가 검토를 연결할 제품 기반은 이미 존재합니다.</div></div>
            <div className="biz-card is-emphasis"><div className="biz-card-label">Strategic Task</div><div className="biz-card-value">판단의 블랙박스 제거</div><div className="biz-card-copy">결과의 크기가 아니라 판단 근거·위험·책임을 보이게 만들어야 합니다.</div></div>
          </div>
        </Slide>

        <Slide page={3} kicker="Company Snapshot" title="400만 사업자를 모았지만, 다음 성장은 관계의 질에서 나온다" message="환급은 강력한 유입 상품이지만 장기 브랜드 자산은 환급 이후의 지속적 판단 지원에서 만들어집니다." source="비즈넵 공개 성장자료, 2024~2026년 · 수치는 기업 발표 기준">
          <div className="biz-grid-4">
            <div className="biz-card"><div className="biz-card-label">가입자</div><div className="biz-card-value">400만</div><div className="biz-card-copy">2026년 3월 공개 기준</div></div>
            <div className="biz-card"><div className="biz-card-label">관리 환급액</div><div className="biz-card-value">1.8조+</div><div className="biz-card-copy">실제 지급 완료액과 구분 필요</div></div>
            <div className="biz-card"><div className="biz-card-label">제품 범위</div><div className="biz-card-value">환급·상담·기장</div><div className="biz-card-copy">단일 사건에서 지속 관리로 확장</div></div>
            <div className="biz-card is-emphasis"><div className="biz-card-label">Next KPI</div><div className="biz-card-value">재방문·전환</div><div className="biz-card-copy">환급 고객의 상담·기장 전환율과 비시즌 활성률</div></div>
          </div>
        </Slide>

        <Slide page={4} kicker="I. Company · Growth Story" title="비즈넵의 성장은 세 번의 구조적 전환으로 만들어졌다" message="경영 데이터 기술 축적 → 환급의 대중적 문제 해결 → 종합 세무관리 플랫폼 통합" recipeId="milestone-timeline" vizType="timeline">
          <div className="biz-timeline">
            {timeline.map((item) => <div className="biz-timeline-item" key={item.year}><span className="biz-timeline-dot" /><div className="biz-timeline-year">{item.year}</div><div className="biz-timeline-event">{item.event}</div><div className="biz-timeline-meaning">{item.meaning}</div></div>)}
          </div>
          <div className="biz-stage-band"><span>기술·데이터 기반 축적</span><span>환급 진입</span><span>플랫폼 통합과 관계 확장</span></div>
        </Slide>

        <Slide page={5} kicker="I. Market Inflection" title="세금 플랫폼의 경쟁 기준이 ‘찾는 금액’에서 ‘예방하는 확신’으로 이동한다" message="무료화·AI 평준화·광고 불신이 동시에 진행되면서 단순 환급 편의는 더 이상 충분한 수수료 근거가 아닙니다.">
          <div className="biz-grid-3">
            <div className="biz-card"><div className="biz-card-label">2021–2022</div><div className="biz-card-value">비대면화</div><div className="biz-card-copy">앱 기반 환급과 셀프신고가 세무서비스의 진입장벽을 낮췄습니다.</div></div>
            <div className="biz-card"><div className="biz-card-label">2023–2024</div><div className="biz-card-value">환급 경쟁 폭발</div><div className="biz-card-copy">예상액·대상자 메시지가 표준화되며 개인정보·정확성 논란도 커졌습니다.</div></div>
            <div className="biz-card is-emphasis"><div className="biz-card-label">2025–2026</div><div className="biz-card-value">사업 운영 AI</div><div className="biz-card-copy">무료 원클릭과 AI 확장 이후 경쟁은 상시관리·설명 가능성·예방 가치로 이동합니다.</div></div>
          </div>
        </Slide>

        <Slide page={6} kicker="II. Competitor · Threat Ranking" title="세 경쟁자는 서로 다른 선택 관문을 장악한다" message="점수는 동일한 6개 기준에 따른 전략 평가이며 공인 시장점유율이 아닙니다.">
          <div className="biz-rank-list">
            {competitors.map((c, index) => <div className="biz-rank" key={c.name}><div className="biz-rank-top"><span className="biz-rank-position">RANK {index + 1}</span><span className="biz-rank-score">{c.score}</span></div><h4>{c.name}</h4><p>{index === 0 ? '규모와 브랜드 언어로 대중적 세금 진입점을 선점' : index === 1 ? '환급에서 기장·금융 AI로 확장하며 사업모델이 직접 중첩' : '반복 신고 접점으로 이용 습관과 데이터를 선점'}</p></div>)}
          </div>
        </Slide>

        {competitors.map((competitor, index) => (
          <Slide key={competitor.name} page={7 + index} kicker={`II. Competitor · Deep Dive ${index + 1}`} title={`${competitor.name}의 위협은 기능이 아니라 고객 선택을 만드는 메커니즘이다`} message={index === 0 ? '대중적 기본값' : index === 1 ? '장기 관계 락인' : '반복 이용 습관'} recipeId="competitor-threat-system" vizType="causal-system">
            <ThreatSystem competitor={competitor} />
          </Slide>
        ))}

        <Slide page={10} kicker="II. Competitor · Product Matrix" title="기능 수는 유사해지고, 차이는 고객이 통제하는 방식에서 발생한다" message="비즈넵은 AI·전문가 결합을 보유하지만 현재 소비자 인식에서는 그 판단 과정이 충분히 보이지 않습니다." recipeId="feature-matrix" vizType="comparison-matrix">
          <div className="biz-matrix-wrap"><table className="biz-matrix"><thead><tr><th>공통 비교축</th><th className="is-target">비즈넵</th><th>삼쩜삼</th><th>더낸세금·혜움</th><th>SSEM</th></tr></thead><tbody>{matrixRows.map((row) => <tr key={row[0]}>{row.map((cell, i) => <td className={i === 1 ? 'is-target' : ''} key={`${row[0]}-${i}`}><span className={`biz-cell-state ${i === 1 ? 'is-strong' : row[0] === '구조적 취약점' ? 'is-risk' : ''}`}>{cell}</span></td>)}</tr>)}</tbody></table></div>
        </Slide>

        <Slide page={11} kicker="II. Competitor · Positioning" title="비즈넵은 ‘사후 환급’에서 ‘사전 세금 손실 예방’으로 이동해야 한다" message="축은 일회성 해결↔지속관리, 셀프서비스↔전문가 검증입니다. 좌표는 정량 인식조사가 아닌 공개 서비스 구조에 기반한 전략적 위치입니다.">
          <div className="biz-axis-map"><span className="biz-axis-label is-x-left">일회성 문제 해결</span><span className="biz-axis-label is-x-right">지속적 세무관리</span><span className="biz-axis-label is-y-top">전문가 검증·대행</span><span className="biz-axis-label is-y-bottom">사용자 셀프서비스</span><span className="biz-map-dot sam">삼쩜삼</span><span className="biz-map-dot heum">더낸세금·혜움</span><span className="biz-map-dot ssem">SSEM</span><span className="biz-map-dot biz-as-is">비즈넵 AS-IS</span><span className="biz-map-dot biz-to-be is-target">비즈넵 TO-BE · 세금 손실 예방</span></div>
        </Slide>

        <Slide page={12} kicker="III. Consumer · Core Target" title="세무를 맡기고 싶지만, 자기 사업의 숫자를 모르는 상태는 원하지 않는다" message="전담 재무·세무 인력이 없는 개인사업자와 소규모 법인 대표의 핵심 JTBD는 ‘세법을 공부하지 않고도 덜 틀리고 덜 내는 것’입니다.">
          <div className="biz-grid-3">
            <div className="biz-card"><div className="biz-card-label">Functional Job</div><div className="biz-card-value">빠르고 정확하게</div><div className="biz-card-copy">환급·신고·기장을 최소한의 시간과 오류로 처리하고 싶다.</div></div>
            <div className="biz-card"><div className="biz-card-label">Emotional Job</div><div className="biz-card-value">나중에 문제없게</div><div className="biz-card-copy">추징·가산세·누락이 뒤늦게 발견되는 불안을 줄이고 싶다.</div></div>
            <div className="biz-card is-emphasis"><div className="biz-card-label">Identity Job</div><div className="biz-card-value">통제하는 대표</div><div className="biz-card-copy">세무전문가는 아니어도 내 사업의 돈이 왜 결정됐는지는 알고 싶다.</div></div>
          </div>
        </Slide>

        <Slide page={13} kicker="III. Consumer · Purchase Friction" title="관심은 환급액이 만들지만, 구매는 설명 부족에서 멈춘다" message="개인정보·수수료·추징 위험·책임 주체가 동시에 현실화되는 신청 직전이 핵심 병목입니다." recipeId="friction-flow" vizType="journey-friction">
          <div className="biz-friction-flow">{frictionSteps.map((step, index) => <div className={`biz-friction-step ${step.drop ? 'is-drop' : ''}`} key={step.title}><span className="biz-friction-index">0{index + 1}</span><h4>{step.title}</h4><p>{step.copy}</p><span className="biz-friction-tag">{step.tag}</span></div>)}</div>
          <div className="biz-friction-answer"><strong>Opportunity:</strong> 신청을 재촉하기 전에 계산 근거·미확인 항목·위험 수준·AI/고객/전문가의 책임 범위를 먼저 보여준다.</div>
        </Slide>

        <Slide page={14} kicker="III. Consumer · Strategic Opportunity" title="Explain Before Ask: 동의를 요구하기 전에 판단을 설명하라" message="설명 가능성은 부가 콘텐츠가 아니라 구매 직전의 Confidence Layer가 되어야 합니다.">
          <div className="biz-grid-3">
            <div className="biz-card"><div className="biz-card-label">Explain</div><div className="biz-card-value">왜 이 금액인가</div><div className="biz-card-copy">적용 공제·감면과 계산 근거를 이해 가능한 언어로 번역합니다.</div></div>
            <div className="biz-card"><div className="biz-card-label">Verify</div><div className="biz-card-value">무엇이 불확실한가</div><div className="biz-card-copy">미확인 증빙·제외 항목·위험 수준을 숨기지 않습니다.</div></div>
            <div className="biz-card is-emphasis"><div className="biz-card-label">Responsibility</div><div className="biz-card-value">누가 무엇을 책임지는가</div><div className="biz-card-copy">자동 계산, 고객 확인, 전문가 검토, 오류 대응 범위를 분리합니다.</div></div>
          </div>
        </Slide>

        <Slide page={15} kicker="IV. Creative · History" title="비즈넵은 2026년에 처음으로 ‘사업자 환급 대표성’을 대중적으로 선언했다" message="검증 가능한 대표 캠페인 원문은 2026년 ‘환급바다’이며, 2021~2025년은 공개자료에서 연속 캠페인 궤적을 확정하기 어렵습니다." source="비즈넵 Creative History · 2021~2025 not-found / 2026 verified-verbatim">
          <div className="biz-grid-2">
            <div className="biz-card"><div className="biz-card-label">2021–2025</div><div className="biz-card-value">공개 대표 캠페인 미확인</div><div className="biz-card-copy">서비스 성장 메시지와 광고 캠페인 카피를 구분했습니다. not-found는 캠페인 부재를 의미하지 않습니다.</div></div>
            <div className="biz-card is-emphasis"><div className="biz-card-label">2026 · 환급바다</div><div className="biz-card-value">“사장님 세금 환급은 비즈넵”</div><div className="biz-card-copy">류승룡 모델, 사업자 직접 호명, 환급의 대중화와 친근한 언어유희.</div></div>
          </div>
        </Slide>

        <Slide page={16} kicker="IV. Creative · Competitive Meaning" title="경쟁사는 기능을 성격으로 바꿨고, 비즈넵은 아직 카테고리를 설명한다" message="차별화는 더 많은 기능이 아니라 일관되게 반복할 브랜드 행동 원칙에서 나옵니다.">
          <div className="biz-grid-4">
            <div className="biz-card"><div className="biz-card-label">삼쩜삼</div><div className="biz-card-value">집요함</div><div className="biz-card-copy">“숨은 돈, 끝까지 찾는다”</div></div>
            <div className="biz-card"><div className="biz-card-label">더낸세금·혜움</div><div className="biz-card-value">책임</div><div className="biz-card-copy">전문가 조직과 세무법인의 대리 책임</div></div>
            <div className="biz-card"><div className="biz-card-label">SSEM</div><div className="biz-card-value">통제</div><div className="biz-card-copy">사용자가 직접 확인하고 선택하는 셀프신고</div></div>
            <div className="biz-card is-risk"><div className="biz-card-label">비즈넵 AS-IS</div><div className="biz-card-value">사업자 환급</div><div className="biz-card-copy">타깃과 카테고리는 명확하지만 행동 원칙이 약함</div></div>
          </div>
        </Slide>

        <Slide page={17} kicker="V. Strategy · Root Cause" title="비즈넵은 결과를 만들지만, 소비자가 결과를 승인하는 과정은 설계하지 않았다" message="경쟁 상대는 다른 환급 앱이 아니라 세금이 계산·검토·제출되는 과정을 보이지 않게 만드는 ‘세무 판단의 블랙박스’입니다.">
          <div className="biz-grid-3">
            <div className="biz-card"><div className="biz-card-label">Surface</div><div className="biz-card-value">환급 인지도 경쟁</div><div className="biz-card-copy">더 큰 금액과 더 쉬운 신청을 반복하며 카테고리 언어에 갇힙니다.</div></div>
            <div className="biz-card"><div className="biz-card-label">Direct Cause</div><div className="biz-card-value">확신 부족</div><div className="biz-card-copy">예상액·수수료·개인정보·책임 범위가 구매 직전에 동시에 불안해집니다.</div></div>
            <div className="biz-card is-emphasis"><div className="biz-card-label">Root Cause</div><div className="biz-card-value">판단 과정 부재</div><div className="biz-card-copy">무엇을 적용·제외했고 누가 판단했는지 소비자가 이해하고 승인할 구조가 없습니다.</div></div>
          </div>
        </Slide>

        <Slide page={18} kicker="V. Strategy · Final Choice" title="세 대안 중 ‘알 권리와 통제권’만이 차별성·확장성·브랜드 자산을 동시에 만든다" message="기능적 예방과 정서적 안심은 증거로 결합하되, 문화적 통제권을 중심 전략으로 선택합니다." recipeId="choice-architecture" vizType="strategic-choice">
          <div className="biz-choice-grid">{choices.map((choice) => <div className={`biz-choice ${choice.selected ? 'is-selected' : ''}`} key={choice.title}><span className="biz-choice-badge">{choice.badge}</span><h4>{choice.title}</h4><p>{choice.copy}</p><div className="biz-choice-score">{choice.scores.map(([label, score]) => <span key={label}>{label}<strong>{score}</strong></span>)}</div></div>)}</div>
          <div className="biz-choice-decision"><div>포기: 최대 환급액만 앞세우는 단기 전환 경쟁</div><span>→</span><div className="is-final">선택: “맡겨도 알 권리는 남는다” + Tax Decision Receipt</div></div>
        </Slide>

        <Slide page={19} kicker="V. Strategy · Big IdeaL" title="모든 사장님은 자기 사업의 세금 결정을 이해하고 통제할 권리가 있다" message="세법을 직접 공부하게 만드는 것이 아니라 전문가의 판단을 이해 가능한 형태로 번역하고, 확인하고, 승인하게 합니다.">
          <div className="biz-quote">“직접 하면 불안하고, 맡기면 알 수 없다.”<small>비즈넵은 편의 × 전문성 × 통제감을 동시에 제공하는 제3의 선택을 만들어야 합니다.</small></div>
        </Slide>

        <Slide page={20} kicker="V. Strategy · Winning Move" title="Tax Decision Receipt: 모든 세금 결과에 ‘판단 영수증’을 발급하라" message="환급액뿐 아니라 적용·제외·위험·검토·책임을 한 화면에서 보여주는 제품이 곧 브랜드의 증거가 됩니다.">
          <div className="biz-grid-4">
            <div className="biz-card"><div className="biz-card-label">Applied</div><div className="biz-card-value">적용 항목</div><div className="biz-card-copy">공제·감면명, 적용 근거, 반영 금액, 필요 증빙</div></div>
            <div className="biz-card is-warning"><div className="biz-card-label">Excluded</div><div className="biz-card-value">제외 항목</div><div className="biz-card-copy">발견됐지만 신청하지 않은 금액과 제외 이유</div></div>
            <div className="biz-card"><div className="biz-card-label">Reviewed</div><div className="biz-card-value">판단 이력</div><div className="biz-card-copy">AI 계산, 고객 확인, 전문가 수정과 승인 기록</div></div>
            <div className="biz-card is-emphasis"><div className="biz-card-label">Responsible</div><div className="biz-card-value">책임 범위</div><div className="biz-card-copy">오류·추징·문의 발생 시 대응 주체와 절차</div></div>
          </div>
        </Slide>

        <Slide page={21} kicker="V. Strategy · Product Proof" title="광고보다 먼저, 판단을 보여주는 제품 경험을 만든다" message="캠페인은 제품 증거를 확대해야 하며 제품에 없는 책임과 확신을 먼저 약속해서는 안 됩니다.">
          <div className="biz-grid-3">
            <div className="biz-card"><div className="biz-card-label">Before Application</div><div className="biz-card-value">Confidence Layer</div><div className="biz-card-copy">예상액의 근거, 미확인 항목, 수수료, 위험 수준을 신청 전에 공개합니다.</div></div>
            <div className="biz-card"><div className="biz-card-label">During Review</div><div className="biz-card-value">Decision Trace</div><div className="biz-card-copy">AI와 전문가가 무엇을 검토·수정했는지 기록합니다.</div></div>
            <div className="biz-card is-emphasis"><div className="biz-card-label">After Result</div><div className="biz-card-value">Prevention Loop</div><div className="biz-card-copy">환급 원인을 다음 증빙·신고·기장 관리로 연결해 재발을 줄입니다.</div></div>
          </div>
        </Slide>

        <Slide page={22} kicker="V. Strategy · Risk & Execution" title="성공 조건은 ‘설명 카피’가 아니라 운영 구조의 변화다" message="Via Negativa로 과대 약속을 제거하고, 제품 실험으로 전환·취소·분쟁·상시관리 전환을 검증합니다.">
          <div className="biz-grid-3">
            <div className="biz-card is-risk"><div className="biz-card-label">Via Negativa</div><ul className="biz-list"><li>최대 환급액만 전면에 세우기</li><li>AI라는 단어로 판단을 감추기</li><li>책임 범위를 모호하게 약속하기</li><li>미확인 사실을 확정 결과처럼 표현하기</li></ul></div>
            <div className="biz-card is-warning"><div className="biz-card-label">Pre-mortem</div><ul className="biz-list"><li>설명이 길어져 신청이 더 어려워질 수 있음</li><li>전문가 수정 사유가 구조화되지 않을 수 있음</li><li>법무·세무·CS 책임 정의가 충돌할 수 있음</li><li>광고만 바뀌고 제품이 따라오지 않을 수 있음</li></ul></div>
            <div className="biz-card is-emphasis"><div className="biz-card-label">Execution Sequence</div><ul className="biz-list"><li>1단계: 계산 근거·미확인 항목 표시</li><li>2단계: 전문가 검토 이력과 승인권</li><li>3단계: 환급 원인 기반 재발 방지</li><li>4단계: 제품 증거를 캠페인 자산으로 확장</li></ul></div>
          </div>
        </Slide>

        <section className="biz-pilot-slide biz-back-cover" data-page-number="23">
          <div className="biz-slide-kicker">Final Strategic Direction</div>
          <h2>환급 결과를 말하는 브랜드에서<br />세금 판단을 보이게 하는 브랜드로</h2>
          <p>비즈넵 · Tax Decision Receipt · HTML Visual Recipe Pilot</p>
        </section>
      </div>
    </main>
  );
}
