import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  aiplStages,
  categoryCliches,
  competitorCandidates,
  consumerTrends,
  creativeHistories,
  decisionReceipt,
  deepDives,
  growthEvents,
  identityRows,
  jtbdRows,
  marketForces,
  measurementPlan,
  metrics,
  missingEvidence,
  painNeeds,
  personas,
  portfolio,
  preMortem,
  productMatrix,
  roadmap,
  strategyRoutes,
  stp,
  swot,
  threatRanking,
  viaNegativa,
  type CreativeYear,
  type DeepDive,
  type Persona,
} from './biznupFullReportData';
import './BiznupFullIntegrated.css';

type SlideProps = {
  id: string;
  page: string;
  chapter: string;
  title: string;
  tag?: string;
  implication?: ReactNode;
  children: ReactNode;
  dark?: boolean;
  className?: string;
};

const MAIN_TOTAL = 40;
const APPENDIX_TOTAL = 8;

function Slide({ id, page, chapter, title, tag, implication, children, dark = false, className = '' }: SlideProps) {
  return (
    <section id={id} className={`full-slide ${dark ? 'full-slide--dark' : ''} ${className}`} data-page={page}>
      <header className="full-slide-header">
        <div className="full-breadcrumb">{chapter}</div>
        <div className="full-title-row">
          <h2>{title}</h2>
          <div className="full-title-meta">
            {tag ? <span className="full-tag">{tag}</span> : null}
            <span className="full-page">{page}</span>
          </div>
        </div>
      </header>
      <div className="full-slide-body">{children}</div>
      {implication ? (
        <footer className="full-implication">
          <span>SO WHAT</span>
          <div>{implication}</div>
        </footer>
      ) : null}
    </section>
  );
}

function Source({ children }: { children: ReactNode }) {
  return <div className="full-source">SOURCE · {children}</div>;
}

function Marker({ children }: { children: ReactNode }) {
  return <mark>{children}</mark>;
}

function MetricStrip() {
  return (
    <div className="metric-strip">
      {metrics.map((metric) => (
        <div className="metric-item" key={metric.label}>
          <span>{metric.label}</span>
          <strong>{metric.value}</strong>
          <small>{metric.period}</small>
          <p>{metric.interpretation}</p>
        </div>
      ))}
    </div>
  );
}

function DeepDiveFlow({ item }: { item: DeepDive }) {
  const nodes = [
    ['Evidence', item.evidence.join(' · ')],
    ['Core Desire', item.desire],
    ['Appeal', item.appeal.join(' · ')],
    ['Threat Mechanism', item.mechanism],
    ['Attack Point', item.attack],
  ];

  return (
    <div className="deep-dive-layout">
      <div className="deep-dive-score">
        <span>THREAT SCORE</span>
        <strong>{item.score}</strong>
        <small>전략 평가점수 · 시장점유율 아님</small>
      </div>
      <div className="deep-dive-flow">
        {nodes.map(([label, text], index) => (
          <div className={`deep-node deep-node--${index + 1}`} key={label}>
            <small>{label}</small>
            <p>{text}</p>
            {index < nodes.length - 1 ? <i>→</i> : null}
          </div>
        ))}
      </div>
      <Source>{item.source}</Source>
    </div>
  );
}

function PersonaLayout({ persona, index }: { persona: Persona; index: number }) {
  return (
    <div className="persona-layout">
      <div className="persona-index">0{index + 1}</div>
      <div className="persona-left">
        <div className="persona-label">SITUATION</div>
        <ul>{persona.situation.map((item) => <li key={item}>{item}</li>)}</ul>
        <div className="persona-quote"><span>표면 욕구</span><strong>“{persona.surfaceNeed}”</strong></div>
      </div>
      <div className="persona-center">
        <div className="persona-label">REAL JTBD</div>
        <h3>{persona.realJob}</h3>
        <div className="persona-fears">
          <span>핵심 두려움</span>
          {persona.fears.map((fear) => <p key={fear}>{fear}</p>)}
        </div>
      </div>
      <div className="persona-right">
        <div className="identity-shift">
          <div><span>AS-IS IDENTITY</span><p>{persona.currentIdentity}</p></div>
          <i>→</i>
          <div className="is-target"><span>TO-BE IDENTITY</span><p>{persona.desiredIdentity}</p></div>
        </div>
        <div className="brand-role"><span>비즈넵의 역할</span><strong>{persona.role}</strong></div>
      </div>
    </div>
  );
}

function StatusLabel({ status }: { status: CreativeYear['status'] }) {
  return <span className={`history-status history-status--${status.toLowerCase()}`}>{status}</span>;
}

function CreativeHistorySlide({ brand, page }: { brand: string; page: string }) {
  const years = creativeHistories[brand];
  const trajectory = brand === '삼쩜삼'
    ? '받아야 할 권리 → 사회적 응원 → 숨은 돈을 끝까지 찾는 집요한 해결자로 확장.'
    : brand === '비즈넵'
      ? '서비스 성장 → 환급 효용 → 플랫폼 확장 → 사업자 세금 환급의 대표성 선언.'
      : brand === '더낸세금·혜움'
        ? '경정청구 전문성 → 전문가 책임 → 기장·재무 AI 에이전트로 관계를 확장.'
        : '저비용 셀프 신고 → 반복 신고 습관 → 사용자가 이해하고 선택하는 통제감으로 확장.';
  const soWhat = brand === '삼쩜삼'
    ? '기능을 브랜드의 행동 성격으로 번역했습니다. 비즈넵은 이 집요함을 모방하지 말고 재발 방지와 판단 가시성을 소유해야 합니다.'
    : brand === '비즈넵'
      ? '타깃과 카테고리 대표성은 명확해졌지만 브랜드가 어떤 방식으로 더 잘 일하는지는 아직 약합니다.'
      : brand === '더낸세금·혜움'
        ? '전문가 책임과 장기관계를 선점합니다. 비즈넵은 추상적 신뢰 대신 실제 판단 흔적을 증거로 제시해야 합니다.'
        : '셀프 통제와 반복 습관을 선점합니다. 비즈넵은 사용자 승인권과 전문가 검증을 동시에 제공해야 합니다.';

  return (
    <Slide
      id={`creative-${brand}`}
      page={page}
      chapter="IV. CREATIVE > COMPETITOR HISTORY"
      title={`${brand} Creative History`}
      tag="2021–2026 YTD"
      dark
      className="history-original"
      implication={null}
    >
      <div className="history-governing">검증된 원문만 따옴표로 표시하고, 미확인 연도는 사실 상태를 그대로 기록했습니다.</div>
      <div className="history-grid">
        {years.map((year, index) => (
          <article className={`history-card ${year.status === 'VERIFIED-VERBATIM' ? 'is-verified' : ''}`} key={year.year}>
            {index === years.length - 1 ? <b className="history-now">NOW</b> : null}
            <h3>{year.year}</h3>
            <StatusLabel status={year.status} />
            <h4>{year.campaign}</h4>
            <blockquote>{year.copy}</blockquote>
            <div className="history-detail">{year.detail}</div>
            <Source>{year.source}</Source>
          </article>
        ))}
      </div>
      <div className="history-bottom">
        <div><span>Message Trajectory</span><strong>{trajectory}</strong></div>
        <div className="is-strategic"><span>Strategic So What</span><strong>{soWhat}</strong></div>
      </div>
    </Slide>
  );
}

function SwotOriginal() {
  const groups = [
    ['Strength (강점)', swot.strengths, 'strength'],
    ['Weakness (약점)', swot.weaknesses, 'weakness'],
    ['Opportunity (기회)', swot.opportunities, 'opportunity'],
    ['Threat (위협)', swot.threats, 'threat'],
  ] as const;

  return (
    <Slide id="strategy-swot" page="36" chapter="V. STRATEGY > SWOT" title="SWOT Analysis" tag="DIAGNOSIS" dark className="swot-original" implication={null}>
      <div className="swot-governing">
        강점은 환급·상담·기장의 연결 가능성이고, 약점은 환급 인식 편중입니다. 외부 무료화와 경쟁 심화는 <Marker>사후 환급에서 사전 관리로의 전환</Marker>을 요구합니다.
      </div>
      <div className="swot-grid">
        {groups.map(([title, items, tone]) => (
          <div className={`swot-quadrant swot-quadrant--${tone}`} key={title}>
            <h3>{title}</h3>
            {items.map(([label, copy]) => <div className="swot-point" key={label}><strong>{label}</strong><p>— {copy}</p></div>)}
          </div>
        ))}
      </div>
    </Slide>
  );
}

function ReportNav() {
  const groups = [
    ['0. BRAND FACT BOOK', ['cover', 'executive', 'identity', 'kpi', 'category-target', 'growth', 'inflection', 'portfolio']],
    ['I. MARKET', ['market-context', 'market-shift']],
    ['II. COMPETITOR', ['comp-landscape', 'comp-ranking', 'deep-삼쩜삼', 'deep-더낸세금·혜움', 'deep-SSEM', 'product-matrix', 'category-cliche', 'positioning']],
    ['III. CONSUMER', ['consumer-exec', 'consumer-trends', 'consumer-target', 'persona-1', 'persona-2', 'persona-3', 'jtbd', 'pain-needs', 'aipl', 'loyalty']],
    ['IV. CREATIVE', ['creative-method', 'creative-비즈넵', 'creative-삼쩜삼', 'creative-더낸세금·혜움', 'creative-SSEM·쌤157', 'creative-trajectory', 'creative-insight']],
    ['V. STRATEGY', ['strategy-swot', 'root-cause', 'stp', 'strategy-routes', 'strategy-choice']],
    ['APPENDIX', ['appendix-receipt', 'appendix-negative', 'appendix-premortem', 'appendix-roadmap', 'appendix-measure', 'appendix-evidence', 'appendix-sources', 'appendix-back']],
  ] as const;

  return (
    <nav className="full-nav">
      <div className="full-nav-brand">BIZNUP <span>FULL REPORT V1</span></div>
      <div className="full-nav-status">MAIN 기반 · 16:9<br />Creative History / SWOT 원본 유지</div>
      {groups.map(([title, ids]) => <div className="full-nav-group" key={title}><strong>{title}</strong>{ids.map((id) => <a href={`#${id}`} key={id}>{id.replace('deep-', '').replace('creative-', '').replace('appendix-', '')}</a>)}</div>)}
    </nav>
  );
}

function Frame({ children, scale }: { children: ReactNode; scale: number }) {
  return <div className="full-frame" style={{ width: 1280 * scale, height: 720 * scale }}><div className="full-frame-inner" style={{ transform: `scale(${scale})` }}>{children}</div></div>;
}

export default function BiznupFullIntegrated() {
  const [scale, setScale] = useState(0.82);

  useEffect(() => {
    const resize = () => {
      const available = Math.max(720, window.innerWidth - 310);
      setScale(Math.min(1, available / 1280));
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  const frames = useMemo(() => {
    const main: ReactNode[] = [];

    main.push(
      <Slide id="cover" page="01" chapter="BRAND STRATEGY CONSULTING REPORT · 2026" title="환급을 넘어, 세무 판단을 보이게 하라" tag="BIZNUP" className="cover-slide" implication={null}>
        <div className="cover-layout">
          <div className="cover-copy">
            <span>FULL REPORT · MAIN-BASED VISUAL INTEGRATION</span>
            <h1>환급을 넘어,<br /><Marker>세무 판단을 보이게 하라</Marker></h1>
            <p>비즈넵의 환급·신고·기장·AI 상담을 하나의 브랜드 원칙으로 연결하는 전략 보고서</p>
          </div>
          <div className="cover-index">
            <b>01</b><span>Brand Fact Book</span>
            <b>02</b><span>Market & Competitor</span>
            <b>03</b><span>Consumer</span>
            <b>04</b><span>Creative History</span>
            <b>05</b><span>Strategy</span>
          </div>
        </div>
      </Slide>,
    );

    main.push(
      <Slide id="executive" page="02" chapter="EXECUTIVE VERDICT" title="제품은 관계형인데, 브랜드 경험은 사건형이다" tag="VERDICT" implication={<>다음 성장은 가입자 수가 아니라 <Marker>환급 고객을 상시 세무관리 관계로 전환하는 능력</Marker>에서 나옵니다.</>}>
        <div className="verdict-layout">
          <div className="verdict-axis">
            <div><span>현재 인식</span><strong>일회성 사업자 환급</strong><p>큰 예상액·간편 신청·사장님 타깃은 보이지만 판단 근거와 책임 과정은 약합니다.</p></div>
            <i>≠</i>
            <div><span>제품 현실</span><strong>환급·상담·기장 통합</strong><p>AI 계산·전문가 검토·반복 관리로 확장할 제품 기반은 이미 존재합니다.</p></div>
            <i>→</i>
            <div className="is-final"><span>전략 과제</span><strong>판단의 블랙박스 제거</strong><p>적용·제외·검토·위험·책임을 보이는 경험으로 카테고리를 재정의합니다.</p></div>
          </div>
          <div className="report-map">
            {['FACTS', 'MARKET', 'COMPETITOR', 'CONSUMER', 'CREATIVE', 'STRATEGY'].map((item, index) => <div key={item}><b>0{index}</b><span>{item}</span></div>)}
          </div>
        </div>
      </Slide>,
    );

    main.push(
      <Slide id="identity" page="03" chapter="0. BRAND FACT BOOK > IDENTITY" title="비즈넵은 세무 정보의 비대칭을 줄이는 사업자 세무관리 플랫폼이다" tag="IDENTITY" implication={<>정체성의 중심은 ‘싸고 편한 세무 앱’이 아니라 <Marker>정보 부족 때문에 발생하는 사업자의 손실과 불안을 줄이는 것</Marker>입니다.</>}>
        <div className="identity-layout">
          <div className="identity-definition">
            <span>ONE-SENTENCE DEFINITION</span>
            <h3>세무 전문가에게 집중돼 있던 정보와 업무를 데이터·자동화로 표준화해, 사업자가 놓친 세금을 찾는 것에서 일상적 관리까지 수행하도록 돕습니다.</h3>
            <div className="identity-origin"><b>브랜드가 출발한 문제</b><p>사업자는 세법의 최종 책임을 부담하지만 공제·감면·신고 규칙을 파악하기 어렵고, 소상공인은 전문 인력과 비용 부족으로 고품질 세무 서비스에서 소외됩니다.</p></div>
          </div>
          <table className="detail-table"><tbody>{identityRows.map(([label, value]) => <tr key={label}><th>{label}</th><td>{value}</td></tr>)}</tbody></table>
          <div className="identity-jtbd"><span>FOUNDING JTBD</span><strong>“사업에 집중하고 싶지만 세법을 몰라 손해 보고 싶지는 않다.”</strong><p>놓친 혜택을 찾고 복잡한 세무를 대신 관리해 줄 신뢰할 만한 방법이 필요합니다.</p></div>
        </div>
      </Slide>,
    );

    main.push(
      <Slide id="kpi" page="04" chapter="0. BRAND FACT BOOK > KPI" title="400만 사업자를 모았지만 다음 과제는 활성과 반복 관계다" tag="FACTS" implication={<>누적 가입과 관리 환급액은 고객획득을 증명하지만, <Marker>MAU·유료 고객·유지율·재구매율</Marker>은 공개자료에서 확인되지 않았습니다.</>}>
        <MetricStrip />
        <div className="kpi-logic"><div><span>가입자</span><b>고객획득 검증</b></div><i>→</i><div><span>환급액</span><b>금전적 효용 검증</b></div><i>→</i><div><span>투자·제품 확장</span><b>관계형 사업 기반</b></div><i>?</i><div className="is-missing"><span>미공개 KPI</span><b>활성·전환·유지·LTV</b></div></div>
      </Slide>,
    );

    main.push(
      <Slide id="category-target" page="05" chapter="0. BRAND FACT BOOK > CATEGORY & TARGET" title="비즈넵의 실질 경쟁은 환급 앱이 아니라 사업자의 세무 의사결정 대안 전체다" tag="CATEGORY" implication={<>핵심 타깃은 단순 환급 추구자가 아니라 <Marker>사업 운영에는 익숙하지만 세무 판단에는 확신이 없는 대표</Marker>입니다.</>}>
        <div className="category-layout">
          <div className="category-rings">
            <div className="ring ring--outer"><span>무대응·방치</span><span>홈택스·직접 신고</span><span>기존 세무사</span><span>환급·신고 플랫폼</span></div>
            <div className="ring ring--mid">사업자 세무 운영</div>
            <div className="ring ring--core">비즈넵<br/><small>환급·상담·기장</small></div>
          </div>
          <div className="target-statement"><span>PRIMARY TARGET</span><h3>매출과 운영에는 익숙하지만, 내부 세무 인력 없이 대표가 판단 책임을 떠안는 개인사업자·소상공인·소규모 법인</h3><div className="target-tension"><b>WANT</b><p>사업에 집중하고 세금을 덜 틀리고 덜 내기</p><b>AVOID</b><p>비용·정보·통제권을 과도하게 잃기</p></div></div>
        </div>
      </Slide>,
    );

    main.push(
      <Slide id="growth" page="06" chapter="0. BRAND FACT BOOK > GROWTH STORY" title="성장은 관리 데이터에서 환급 효용으로, 다시 상시 관리로 확장됐다" tag="2016–2026" implication={<>환급은 가장 강력한 성장 엔진이지만 <Marker>환급 이후 관리 고객으로 전환하지 못하면 일회성 혜택 서비스에 머뭅니다.</Marker></>}>
        <div className="growth-timeline">
          <div className="growth-axis" />
          {growthEvents.map(([date, event, meaning], index) => <div className={`growth-event ${index % 2 ? 'is-down' : 'is-up'} ${index === growthEvents.length - 1 ? 'is-current' : ''}`} style={{ left: `${3 + index * 7.25}%` }} key={`${date}-${event}`}><span className="growth-dot"/><b>{date}</b><strong>{event}</strong><p>{meaning}</p></div>)}
        </div>
      </Slide>,
    );

    main.push(
      <Slide id="inflection" page="07" chapter="0. BRAND FACT BOOK > CORE INFLECTION" title="세 번의 전환이 고객획득은 키웠지만 브랜드 인식은 환급에 고정했다" tag="INFLECTION" implication={<>제품 확장과 인식 확장 사이의 간극이 <Marker>현재 브랜드 전략의 핵심 GAP</Marker>입니다.</>}>
        <div className="inflection-flow">
          <div><span>1</span><small>2016–2021</small><h3>데이터 기반 구축</h3><p>사업자 재무·세무 데이터를 한곳에 모으고 관리 사업장을 확대했습니다.</p><b>자산: 데이터·연결성</b></div>
          <i>→</i>
          <div><span>2</span><small>2022–2024</small><h3>환급 효용 폭발</h3><p>놓친 돈을 되찾는 강한 경제적 보상으로 대규모 가입자를 확보했습니다.</p><b>자산: 금전적 성과</b></div>
          <i>→</i>
          <div><span>3</span><small>2023–2026</small><h3>상시 관리 확장</h3><p>기장·AI 상담·법인 서비스로 세무 전 과정을 연결하려 합니다.</p><b>과제: 관계 이유</b></div>
        </div>
        <div className="inflection-gap"><span>PRODUCT</span><strong>환급 → 케어 → SeNa → 종합 세무관리</strong><i>GAP</i><span>PERCEPTION</span><strong>사장님 세금 환급</strong></div>
      </Slide>,
    );

    main.push(
      <Slide id="portfolio" page="08" chapter="0. BRAND FACT BOOK > PRODUCT USP & BEST SELF" title="기능 묶음이 아니라 세무 판단의 전체 과정을 연결하는 것이 비즈넵의 USP다" tag="PORTFOLIO" implication={<>Brand Best Self는 ‘환급을 잘 찾는 앱’이 아니라 <Marker>사업자의 세금 결정을 이해 가능한 방식으로 관리하는 플랫폼</Marker>입니다.</>}>
        <div className="portfolio-flow">
          {portfolio.map((item, index) => <div className="portfolio-column" key={item.name}><span>0{index + 1}</span><h3>{item.name}</h3><dl><dt>문제</dt><dd>{item.problem}</dd><dt>제공 가치</dt><dd>{item.value}</dd><dt>제품 증거</dt><dd>{item.proof}</dd></dl>{index < portfolio.length - 1 ? <i>+</i> : null}</div>)}
        </div>
        <div className="best-self-line"><span>BRAND BEST SELF</span><strong>세금 결과만 대신 처리하는 서비스가 아니라, 판단 근거와 위험을 보여주고 사업자가 최종 결정을 통제하도록 돕는 운영 파트너</strong></div>
      </Slide>,
    );

    main.push(
      <Slide id="market-context" page="09" chapter="I. MARKET > CONTEXT" title="편의의 평준화 이후 민간 플랫폼은 판단 품질과 책임을 증명해야 한다" tag="MARKET" implication={<>카테고리의 다음 경쟁 기준은 <Marker>얼마를 찾아주는가 → 얼마나 쉽게 처리하는가 → 얼마나 지속적으로 오류를 예방하는가</Marker>로 이동합니다.</>}>
        <div className="market-force-line">{marketForces.map((force, index) => <div className="market-force" key={force.title}><span>{force.period}</span><h3>{force.title}</h3><p>{force.evidence}</p><strong>{force.implication}</strong>{index < marketForces.length - 1 ? <i>→</i> : null}</div>)}</div>
      </Slide>,
    );

    main.push(
      <Slide id="market-shift" page="10" chapter="I. MARKET > CATEGORY SHIFT" title="환급 카테고리의 가치 사다리가 즉시 보상에서 지속 통제로 올라간다" tag="VALUE LADDER" implication={<>비즈넵이 수수료와 반복 이용을 정당화하려면 <Marker>사업 맥락·근거·위험 배제·전문가 검토·사후 대응</Marker>을 하나의 경험으로 제공해야 합니다.</>}>
        <div className="value-ladder">
          <div className="ladder-step step-1"><span>LEVEL 1</span><b>조회 편의</b><p>몇 번의 클릭으로 환급 가능성 확인</p></div>
          <div className="ladder-step step-2"><span>LEVEL 2</span><b>금전적 성과</b><p>놓친 공제·감면과 환급액 발견</p></div>
          <div className="ladder-step step-3"><span>LEVEL 3</span><b>판단 신뢰</b><p>왜 이 결과인지와 위험·책임을 설명</p></div>
          <div className="ladder-step step-4"><span>LEVEL 4</span><b>사전 예방</b><p>다음 신고와 현금 유출을 미리 관리</p></div>
          <div className="ladder-step step-5"><span>LEVEL 5</span><b>경영 통제</b><p>세금 결정을 사업 운영 의사결정에 연결</p></div>
        </div>
      </Slide>,
    );

    main.push(
      <Slide id="comp-landscape" page="11" chapter="II. COMPETITOR > LANDSCAPE" title="경쟁자는 환급액이 아니라 사업자의 세무 진입점을 선점한다" tag="REGISTRY" implication={<>직접 경쟁사는 삼쩜삼·더낸세금/혜움·SSEM이며, 국세청 원클릭은 <Marker>단순 환급 수수료의 지불의사를 낮추는 구조 변수</Marker>입니다.</>}>
        <div className="candidate-table"><div className="candidate-head"><span>후보</span><span>주요 경쟁 영역</span><span>판정</span></div>{competitorCandidates.map(([name, area, result]) => <div className={`candidate-row ${result === '선정' ? 'is-selected' : ''}`} key={name}><b>{name}</b><p>{area}</p><em>{result}</em></div>)}</div>
        <div className="category-job"><span>SHARED JTBD</span><strong>세법을 공부하지 않고도, 세금을 덜 틀리고 덜 내고 싶다.</strong></div>
      </Slide>,
    );

    main.push(
      <Slide id="comp-ranking" page="12" chapter="II. COMPETITOR > THREAT RANKING" title="삼쩜삼은 인지, 혜움은 미래 경로, SSEM은 반복 습관을 장악한다" tag="RANKING" implication={<>점수는 공개 신호에 기반한 전략 평가이며 공인 점유율이 아닙니다. 비즈넵은 <Marker>대중성·책임·통제감 중 어느 것도 그대로 복제해서는 안 됩니다.</Marker></>}>
        <table className="ranking-table"><thead><tr><th>순위</th><th>경쟁사</th><th>침투 25</th><th>성장 20</th><th>선호 20</th><th>캠페인 15</th><th>변곡점 15</th><th>근거 5</th><th>총점</th></tr></thead><tbody>{threatRanking.map((row) => <tr key={row[1]}>{row.map((cell, index) => <td className={index === 8 ? 'is-total' : ''} key={`${row[1]}-${index}`}>{cell}</td>)}</tr>)}</tbody></table>
        <div className="ranking-interpretation"><div><b>삼쩜삼</b><p>세금 환급의 대중적 기본값</p></div><div><b>더낸세금·혜움</b><p>제품·사업모델·AI 확장 경로의 직접 중첩</p></div><div><b>SSEM</b><p>신고 시즌 반복 이용과 셀프 통제</p></div></div>
      </Slide>,
    );

    deepDives.forEach((item, index) => main.push(
      <Slide id={`deep-${item.name}`} page={String(13 + index).padStart(2, '0')} chapter={`II. COMPETITOR > DEEP DIVE ${index + 1}`} title={`${item.name}의 위협은 기능이 아니라 고객 선택을 만드는 메커니즘이다`} tag="DEEP DIVE" implication={<>경쟁사의 강점을 나열하지 않고 <Marker>증거→욕망→소구→위협 메커니즘→공격점</Marker>으로 연결합니다.</>}><DeepDiveFlow item={item} /></Slide>,
    ));

    main.push(
      <Slide id="product-matrix" page="16" chapter="II. COMPETITOR > PRODUCT MATRIX" title="기능은 유사해지고, 차이는 관계 빈도와 통제 방식에서 발생한다" tag="MATRIX" implication={<>비즈넵은 사업자 전문성과 제품 연속성이 강하지만 <Marker>일회성 환급 인식과 판단 과정의 비가시성</Marker>이 취약점입니다.</>}>
        <table className="matrix-table"><thead><tr><th>공통 비교축</th><th className="is-target">비즈넵</th><th>삼쩜삼</th><th>더낸세금·혜움</th><th>SSEM</th></tr></thead><tbody>{productMatrix.map((row) => <tr key={row[0]}>{row.map((cell, index) => <td className={index === 1 ? 'is-target' : ''} key={`${row[0]}-${index}`}>{index === 0 ? <b>{cell}</b> : cell}</td>)}</tr>)}</tbody></table>
      </Slide>,
    );

    main.push(
      <Slide id="category-cliche" page="17" chapter="II. COMPETITOR > CATEGORY CLICHÉS" title="숨은 돈·간편함·최대 환급액·전문가 검토는 더 이상 독점 가능한 언어가 아니다" tag="DE-FAMILIARIZE" implication={<>카테고리의 익숙한 질문인 ‘얼마 받을 수 있습니까?’를 <Marker>‘왜 이 금액이며, 믿어도 되고, 문제가 생기면 누가 책임집니까?’</Marker>로 바꿔야 합니다.</>}>
        <div className="cliche-table"><div className="cliche-head"><span>반복 화법</span><span>현재 역할</span><span>구조적 한계</span><span>새 질문</span></div>{categoryCliches.map(([name, role, limit], index) => <div className="cliche-row" key={name}><b>{name}</b><p>{role}</p><p>{limit}</p><strong>{['무엇을 적용·제외했습니까?', '어디에서 판단 품질이 생깁니까?', '확정 가능액과 위험 금액은 무엇입니까?', '누가 무엇을 검토하고 책임집니까?'][index]}</strong></div>)}</div>
      </Slide>,
    );

    main.push(
      <Slide id="positioning" page="18" chapter="II. COMPETITOR > POSITIONING" title="비즈넵은 사후 환급에서 전문가 검증 기반의 사전 세금 손실 예방으로 이동해야 한다" tag="AS-IS → TO-BE" implication={<>좌표는 인식조사 수치가 아니라 공개 서비스 구조에 기반한 전략 가설이며, <Marker>향후 브랜드 인식조사로 검증</Marker>해야 합니다.</>}>
        <div className="position-map"><span className="axis axis-x-left">일회성 문제 해결</span><span className="axis axis-x-right">지속 세무관리</span><span className="axis axis-y-top">전문가 검증·대행</span><span className="axis axis-y-bottom">사용자 셀프서비스</span><div className="map-grid"/><div className="map-dot sam">삼쩜삼</div><div className="map-dot heum">더낸세금·혜움</div><div className="map-dot ssem">SSEM</div><div className="map-dot biz-as">비즈넵 AS-IS</div><div className="map-arrow">↗</div><div className="map-dot biz-to">비즈넵 TO-BE<br/><small>사전 손실 예방</small></div></div>
      </Slide>,
    );

    main.push(
      <Slide id="consumer-exec" page="19" chapter="III. CONSUMER > EXECUTIVE CONCLUSION" title="소비자가 고용하는 것은 환급 기능이 아니라 세금 위험을 통제한다는 확신이다" tag="CONSUMER" implication={<>가장 치명적인 AIPL 병목은 Interest→Purchase이며, 본질은 편의 부족이 아니라 <Marker>신뢰의 비대칭</Marker>입니다.</>}>
        <div className="consumer-question-shift"><div><span>PAST</span><strong>얼마 받을 수 있습니까?</strong></div><i>→</i><div><span>NOW</span><strong>왜 이 금액이며 믿어도 됩니까?</strong></div><i>→</i><div className="is-future"><span>FUTURE</span><strong>문제가 생기면 누가 책임합니까?</strong></div></div>
        <table className="jtbd-mini"><thead><tr><th>JTBD 층위</th><th>소비자가 원하는 진보</th></tr></thead><tbody><tr><th>기능적</th><td>누락된 공제·환급을 찾고 신고 오류와 추가 납부 위험을 줄인다.</td></tr><tr><th>정서적</th><td>내가 뭔가 잘못 처리했을지 모른다는 만성적 불안을 해소한다.</td></tr><tr><th>사회적</th><td>세무에 끌려다니는 자영업자가 아니라 숫자를 통제하는 경영자가 된다.</td></tr></tbody></table>
      </Slide>,
    );

    main.push(
      <Slide id="consumer-trends" page="20" chapter="III. CONSUMER > TRENDS" title="다섯 변화가 ‘환급 편의’보다 설명·승인·책임의 가치를 키운다" tag="2021–2026" implication={<>자동화율보다 <Marker>설명 가능성·승인권·수정 가능성·책임 과정</Marker>이 다음 제품 가치가 됩니다.</>}>
        <div className="trend-stack">{consumerTrends.map((trend, index) => <div className="trend-row" key={trend.title}><b>0{index + 1}</b><div><h3>{trend.title}</h3><p>{trend.evidence}</p></div><i>→</i><div><span>CHANGE</span><p>{trend.change}</p></div><i>→</i><div className="trend-so"><span>SO WHAT</span><strong>{trend.soWhat}</strong></div></div>)}</div>
      </Slide>,
    );

    main.push(
      <Slide id="consumer-target" page="21" chapter="III. CONSUMER > CORE TARGET" title="최우선 타깃은 사업 성장이 세무 통제력을 추월한 불완전 숙련자다" tag="TARGET" implication={<>완전 초보가 아니라 홈택스·신고 앱·세무사를 경험했지만 <Marker>현재 방식이 정확한지 확신하지 못하는 대표</Marker>입니다.</>}>
        <div className="target-spectrum"><div><span>LOW COMPLEXITY</span><b>환급 기회 추구형</b><p>즉각 보상에는 반응하지만 관계 지속 가능성이 낮음</p></div><div><b>비용 방어형</b><p>셀프 처리와 오류 방지를 동시에 원함</p></div><div className="is-primary"><span>PRIMARY</span><b>불안한 성장 사업자</b><p>매출·거래·인력 복잡성이 내부 세무 역량을 추월</p></div><div><b>사후불안형 위임 대표</b><p>맡겼지만 판단 근거와 책임을 이해하지 못함</p></div><div><span>HIGH COMPLEXITY</span><b>전문 조직 보유 기업</b><p>비즈넵의 현재 우선 타깃과 거리가 큼</p></div></div>
        <div className="target-profile"><span>사업 단계</span><b>매출·거래·인력 증가</b><span>조직</span><b>내부 재무·세무 담당자 부재</b><span>행동</span><b>직접 신고와 전문가 위임 병행</b><span>욕구</span><b>간편함 + 설명 + 최종 통제</b></div>
      </Slide>,
    );

    personas.forEach((persona, index) => main.push(
      <Slide id={`persona-${index + 1}`} page={String(22 + index).padStart(2, '0')} chapter={`III. CONSUMER > PERSONA ${index + 1}`} title={persona.name} tag="PERSONA" implication={<>페르소나는 인구통계가 아니라 <Marker>사업 상태·불안·전환 계기·구매 장애·원하는 정체성</Marker>의 차이로 정의합니다.</>}><PersonaLayout persona={persona} index={index} /></Slide>,
    ));

    main.push(
      <Slide id="jtbd" page="25" chapter="III. CONSUMER > IDENTITY ALIGNMENT & JTBD" title="핵심 Job은 세무 판단 책임을 혼자 떠안지 않으면서 사업 통제권을 유지하는 것이다" tag="JTBD" implication={<>비즈넵은 대행의 편의와 셀프의 통제 사이에서 <Marker>전문가 수준의 판단을 이해하고 승인하는 제3의 선택</Marker>을 만들어야 합니다.</>}>
        <table className="matrix-table jtbd-table"><thead><tr><th>Job 층위</th><th>원하는 진보</th><th>현재 대안</th><th>대안의 한계</th><th className="is-target">비즈넵 기회</th></tr></thead><tbody>{jtbdRows.map((row) => <tr key={row[0]}>{row.map((cell, index) => <td className={index === 4 ? 'is-target' : ''} key={`${row[0]}-${index}`}>{index === 0 ? <b>{cell}</b> : cell}</td>)}</tr>)}</tbody></table>
        <div className="identity-alignment"><span>AS-IS</span><b>세무에 끌려다니는 자영업자</b><i>→</i><span>TO-BE</span><b>숫자와 위험을 이해하고 승인하는 경영자</b></div>
      </Slide>,
    );

    main.push(
      <Slide id="pain-needs" page="26" chapter="III. CONSUMER > PAIN POINTS & UNMET NEEDS" title="구매를 막는 것은 기능 부족이 아니라 판단·책임·관계의 공백이다" tag="PRIORITY" implication={<>가장 높은 우선순위는 <Marker>계산 근거와 책임 범위</Marker>이며, 일회성 관계를 예방 관리로 전환해야 장기 가치가 생깁니다.</>}>
        <div className="pain-table"><div className="pain-head"><span>Pain</span><span>현재 문제</span><span>Unmet Need</span><span>우선순위</span></div>{painNeeds.map(([pain, issue, need, priority]) => <div className="pain-row" key={pain}><b>{pain}</b><p>{issue}</p><strong>{need}</strong><em className={priority === '매우 높음' ? 'is-high' : ''}>{priority}</em></div>)}</div>
      </Slide>,
    );

    main.push(
      <Slide id="aipl" page="27" chapter="III. CONSUMER > AIPL BOTTLENECK" title="관심은 환급액이 만들지만 구매는 설명 부족에서 멈춘다" tag="FRICTION FLOW" implication={<>신청을 재촉하기 전에 <Marker>계산 근거·미확인 항목·위험 수준·AI/고객/전문가의 책임</Marker>을 먼저 보여줘야 합니다.</>}>
        <div className="aipl-layout"><div className="aipl-funnel">{aiplStages.map(([code, phase, action, copy, state], index) => <div className={`aipl-stage ${index === 2 || index === 3 ? 'is-friction' : ''}`} style={{ width: `${100 - index * 10}%` }} key={code}><b>{code}</b><span>{phase}</span><strong>{action}</strong><p>{copy}</p><em>{state}</em></div>)}</div><div className="friction-analysis"><span>INTEREST → PURCHASE</span><h3>신뢰의 비대칭</h3><ul><li>민감한 세무정보 제공</li><li>수수료 지불</li><li>세무대리 동의</li><li>추징·가산세 가능성</li><li>처리 과정 통제권 상실</li></ul></div></div>
      </Slide>,
    );

    main.push(
      <Slide id="loyalty" page="28" chapter="III. CONSUMER > PURCHASE TO LOYALTY" title="환급 결과를 다음 신고·기장·예방 행동으로 연결해야 관계가 지속된다" tag="RELATIONSHIP" implication={<>환급 고객에게 반복 이용을 요구하는 것이 아니라 <Marker>환급 원인이 다시 발생하지 않도록 관리하는 이유</Marker>를 제공해야 합니다.</>}>
        <div className="relationship-loop"><div><span>01</span><b>환급 발견</b><p>놓친 공제·감면과 금전 효용 확인</p></div><i>→</i><div><span>02</span><b>판단 설명</b><p>적용·제외·위험·책임을 이해</p></div><i>→</i><div><span>03</span><b>원인 진단</b><p>왜 누락됐는지 사업 운영 원인 확인</p></div><i>→</i><div><span>04</span><b>예방 행동</b><p>증빙·신고·기장·알림으로 연결</p></div><i>↺</i><div className="is-final"><span>05</span><b>관리 관계</b><p>다음 의사결정과 세금 위험을 상시 관리</p></div></div>
        <div className="product-principles"><b>제품 원칙</b><span>Explain before ask</span><span>Show uncertainty</span><span>Keep approval rights</span><span>Record responsibility</span><span>Prevent recurrence</span></div>
      </Slide>,
    );

    main.push(
      <Slide id="creative-method" page="29" chapter="IV. CREATIVE > METHODOLOGY" title="크리에이티브는 검증된 원문·확인 필요·미확인을 분리해 읽는다" tag="FACTUALITY" implication={<>Creative History는 디자인 개선 대상에서 제외하고 <Marker>현재 원본 카드 구조와 사실 상태 표시를 유지</Marker>합니다.</>}>
        <div className="factuality-system"><div><span>VERIFIED-VERBATIM</span><b>원문 카피</b><p>따옴표 사용 가능. 연도·매체·출처와 함께 기록.</p></div><div><span>SOURCE-FOUND-COPY-UNVERIFIED</span><b>자료는 있으나 카피 미검증</b><p>해석과 사실을 분리하고 따옴표 사용 금지.</p></div><div><span>NOT-FOUND</span><b>공개자료 미확인</b><p>캠페인 부재로 단정하지 않고 미확인 상태 그대로 보존.</p></div></div>
        <div className="history-scope"><span>TIME SCOPE</span><strong>2021 · 2022 · 2023 · 2024 · 2025 · 2026 YTD</strong><span>FIELDS</span><strong>캠페인 · 원문 카피 · 모델 · 매체 · 메시지 역할 · 출처</strong></div>
      </Slide>,
    );

    main.push(<CreativeHistorySlide brand="비즈넵" page="30" />);
    main.push(<CreativeHistorySlide brand="삼쩜삼" page="31" />);
    main.push(<CreativeHistorySlide brand="더낸세금·혜움" page="32" />);
    main.push(<CreativeHistorySlide brand="SSEM·쌤157" page="33" />);

    main.push(
      <Slide id="creative-trajectory" page="34" chapter="IV. CREATIVE > MESSAGE TRAJECTORY" title="네 브랜드는 대표성·집요함·책임·통제감이라는 서로 다른 성격을 만들었다" tag="TRAJECTORY" implication={<>비즈넵의 미점유 영역은 경쟁 성격을 섞는 것이 아니라 <Marker>판단 과정을 공개해 사업자의 알 권리와 승인권을 지키는 태도</Marker>입니다.</>}>
        <div className="trajectory-map"><div className="trajectory-axis"/><div className="trajectory-brand biz"><b>비즈넵</b><span>서비스 성장</span><i>→</i><span>환급 효용</span><i>→</i><span>사업자 환급 대표성</span><strong>?</strong></div><div className="trajectory-brand sam"><b>삼쩜삼</b><span>쉬움</span><i>→</i><span>받을 권리</span><i>→</i><span>응원</span><i>→</i><span>끝까지 찾는 집요함</span></div><div className="trajectory-brand heum"><b>혜움</b><span>경정청구</span><i>→</i><span>전문가 검토</span><i>→</i><span>책임</span><i>→</i><span>AI 장기관리</span></div><div className="trajectory-brand ssem"><b>SSEM</b><span>저비용 신고</span><i>→</i><span>사실 확인</span><i>→</i><span>셀프 통제</span><i>→</i><span>반복 습관</span></div></div>
      </Slide>,
    );

    main.push(
      <Slide id="creative-insight" page="35" chapter="IV. CREATIVE > INSIGHT" title="비즈넵은 카테고리 설명에는 강하지만 브랜드가 일하는 방식은 아직 약하다" tag="CREATIVE GAP" implication={<>새 캠페인은 추상적 신뢰를 선언하지 않고 <Marker>제품이 실제로 판단을 설명하고 책임을 기록하는 행동 증거</Marker>에서 출발해야 합니다.</>}>
        <div className="creative-gap-layout"><div className="current-copy"><span>CURRENT COPY</span><blockquote>“사장님 세금 환급은 비즈넵”</blockquote><div><b>명확한 것</b><p>타깃 · 사장님</p><p>카테고리 · 세금 환급</p><p>브랜드 · 비즈넵</p></div></div><div className="gap-arrow">→</div><div className="missing-character"><span>MISSING CHARACTER</span><h3>어떤 태도로 더 잘 해결하는가?</h3><ul><li>삼쩜삼 · 끝까지 찾는 집요함</li><li>혜움 · 전문가가 책임지는 관계</li><li>SSEM · 사용자가 확인하는 통제</li><li><Marker>비즈넵 · 판단을 보이게 하는 투명성</Marker></li></ul></div></div>
      </Slide>,
    );

    main.push(<SwotOriginal />);

    main.push(
      <Slide id="root-cause" page="37" chapter="V. STRATEGY > GAP & ROOT CAUSE" title="제품은 상시 세무관리로 확장됐지만 브랜드 경험은 환급 사건에 멈춰 있다" tag="ROOT CAUSE" implication={<>치명적 문제는 환급 역량 부족이 아니라 <Marker>결과를 만드는 판단 과정을 소비자가 이해하고 승인할 수 없다는 것</Marker>입니다.</>}>
        <div className="root-cause-tree"><div className="root-evidence"><span>MARKET</span><p>무료 원클릭으로 단순 편의의 지불의사 하락</p><span>COMPETITOR</span><p>집요함·책임·통제감의 브랜드 성격 선점</p><span>CONSUMER</span><p>Interest→Purchase에서 정확성·비용·정보·책임 불안</p><span>CREATIVE</span><p>비즈넵은 타깃·카테고리는 명확하나 행동 원칙은 약함</p></div><i>→</i><div className="root-gap"><small>GAP</small><strong>PRODUCT</strong><p>환급·상담·기장·AI</p><b>≠</b><strong>PERCEPTION</strong><p>사장님 세금 환급</p></div><i>→</i><div className="root-core"><small>ROOT CAUSE</small><h3>세금 결과는 제공하지만, 무엇을 적용·제외했고 누가 책임지는지 보이지 않는다.</h3></div><i>→</i><div className="root-opportunity"><small>STRATEGIC OPPORTUNITY</small><h3>세무 판단을 설명하고 기록하며, 사업자의 최종 승인권을 남긴다.</h3></div></div>
      </Slide>,
    );

    main.push(
      <Slide id="stp" page="38" chapter="V. STRATEGY > STP" title="불안한 성장 사업자를 ‘설명 가능한 세금 통제’로 선점한다" tag="STP" implication={<>포지셔닝은 기능 목록이 아니라 <Marker>누구의 어떤 긴장을 어떤 고유한 원칙으로 해결하는가</Marker>를 고정합니다.</>}>
        <div className="stp-layout"><div className="stp-segments"><span>SEGMENTATION</span>{stp.segments.map(([name, trait, value]) => <div className={name === '불안한 성장 사업자' ? 'is-selected' : ''} key={name}><b>{name}</b><p>{trait}</p><small>{value}</small></div>)}</div><div className="stp-arrow">→</div><div className="stp-target"><span>TARGETING</span><strong>{stp.target}</strong><p>전담 인력은 없지만 사업 복잡성과 세금 위험은 증가하는 대표</p></div><div className="stp-arrow">→</div><div className="stp-position"><span>POSITIONING</span><strong>{stp.position}</strong></div></div>
      </Slide>,
    );

    main.push(
      <Slide id="strategy-routes" page="39" chapter="V. STRATEGY > FOUR STRATEGIC DIRECTIONS" title="네 전략을 동일 기준으로 비교하고 각 전략의 역할과 한계를 남긴다" tag="4 ROUTES" implication={<>최종 선택 외 대안을 삭제하지 않고 <Marker>기능적 예방·정서적 안심·문화적 통제·플랫폼 확장</Marker>의 Trade-off를 보존합니다.</>}>
        <div className="route-table"><div className="route-head"><span>Route</span><span>전략 명제</span><span>핵심 방향</span><span>Trade-off</span><span>차별</span><span>확장</span><span>실행</span></div>{strategyRoutes.map(([id, type, title, direction, tradeoff, d, e, x]) => <div className={`route-row ${id === 'C' ? 'is-selected' : ''}`} key={id}><b>{id}<small>{type}</small></b><strong>{title}</strong><p>{direction}</p><p>{tradeoff}</p><span>{d}/5</span><span>{e}/5</span><span>{x}/5</span></div>)}</div>
      </Slide>,
    );

    main.push(
      <Slide id="strategy-choice" page="40" chapter="V. STRATEGY > FINAL CHOICE" title="‘맡겨도, 알 권리는 남는다’를 브랜드 원칙으로 선택한다" tag="WINNING MOVE" implication={<>기능적 예방과 정서적 안심을 증거로 결합하되, <Marker>문화적 통제권을 장기 브랜드 자산</Marker>으로 선택합니다.</>}>
        <div className="choice-layout"><div className="choice-criteria"><span>SELECTION CRITERIA</span><div><b>차별성</b><p>경쟁사가 직접 소유하지 못한 영역</p></div><div><b>병목 해결</b><p>Interest→Purchase의 신뢰 비대칭 해소</p></div><div><b>제품 연결</b><p>환급·상담·기장·AI를 하나의 원칙으로 통합</p></div><div><b>자산화</b><p>캠페인 문구를 넘어 반복 가능한 브랜드 행동</p></div></div><div className="choice-final"><span>BIG IDEAL</span><h3>모든 사장님은 자기 사업의 세금 결정을 이해하고 통제할 권리가 있다.</h3><span>WINNING MOVE</span><h2>Tax Decision Receipt<br/><Marker>비즈넵 세금설명서</Marker></h2><p>모든 세금 결과에 적용·제외·검토·위험·책임을 기록합니다.</p></div></div>
      </Slide>,
    );

    const appendix: ReactNode[] = [];
    appendix.push(
      <Slide id="appendix-receipt" page="A1" chapter="APPENDIX > WINNING MOVE SPECIFICATION" title="Tax Decision Receipt는 결과가 아니라 판단의 전체 이력을 제품화한다" tag="PRODUCT PROOF" implication={<>캠페인은 이 기능을 약속하는 것이 아니라 <Marker>실제로 구현된 판단 증거를 확대</Marker>해야 합니다.</>}>
        <div className="receipt-flow">{decisionReceipt.map(([code, title, detail], index) => <div key={code}><span>{code}</span><b>{title}</b><p>{detail}</p>{index < decisionReceipt.length - 1 ? <i>→</i> : null}</div>)}</div>
        <div className="receipt-ui"><div><small>예상 환급 가능액</small><strong>확정 가능액 / 검토 필요액 분리</strong></div><div><small>적용·제외 항목</small><strong>근거와 제외 사유 표시</strong></div><div><small>전문가 검토</small><strong>수정·승인 이력 기록</strong></div><div><small>책임·대응</small><strong>오류·추징 시 대응 절차</strong></div></div>
      </Slide>,
    );
    appendix.push(
      <Slide id="appendix-negative" page="A2" chapter="APPENDIX > VIA NEGATIVA" title="더할 전략보다 먼저 제거할 카테고리 습관을 명확히 한다" tag="REMOVE" implication={<>차별화는 새 메시지를 추가하는 것만큼 <Marker>카테고리의 과대 약속과 불투명성을 중단하는 것</Marker>에서 시작합니다.</>}>
        <div className="negative-list">{viaNegativa.map((item, index) => <div key={item}><span>0{index + 1}</span><strong>{item}</strong></div>)}</div>
      </Slide>,
    );
    appendix.push(
      <Slide id="appendix-premortem" page="A3" chapter="APPENDIX > PRE-MORTEM" title="실패 가능성을 실행 전에 가정하고 통제 조건을 설계한다" tag="RISK" implication={<>가장 큰 위험은 디자인·카피 실패가 아니라 <Marker>제품 데이터·책임 정책·운영 프로세스가 전략을 증명하지 못하는 것</Marker>입니다.</>}>
        <div className="premortem-table"><div className="premortem-head"><span>실패 모드</span><span>통제 장치</span></div>{preMortem.map(([risk, control], index) => <div className="premortem-row" key={risk}><b>0{index + 1}</b><strong>{risk}</strong><i>→</i><p>{control}</p></div>)}</div>
      </Slide>,
    );
    appendix.push(
      <Slide id="appendix-roadmap" page="A4" chapter="APPENDIX > EXECUTION ROADMAP" title="Proof Audit에서 브랜드 확장까지 제품 증거를 단계적으로 축적한다" tag="ROADMAP" implication={<>광고 캠페인보다 <Marker>데이터 점검과 Confidence Layer MVP</Marker>가 먼저입니다.</>}>
        <div className="roadmap-line">{roadmap.map(([step, name, period, action, gate], index) => <div className="roadmap-step" key={step}><span>{step}</span><small>{period}</small><h3>{name}</h3><p>{action}</p><strong>GATE · {gate}</strong>{index < roadmap.length - 1 ? <i>→</i> : null}</div>)}</div>
      </Slide>,
    );
    appendix.push(
      <Slide id="appendix-measure" page="A5" chapter="APPENDIX > MEASUREMENT PLAN" title="전환·품질·신뢰·관계·예방을 동시에 측정해야 한다" tag="KPI" implication={<>조회→신청 전환만 개선되더라도 취소·분쟁이 증가하면 실패입니다. <Marker>성과와 위험 지표를 함께 판단</Marker>해야 합니다.</>}>
        <table className="matrix-table measure-table"><thead><tr><th>영역</th><th>지표</th><th>측정 방식</th><th className="is-target">의사결정 기준</th></tr></thead><tbody>{measurementPlan.map((row) => <tr key={row[1]}>{row.map((cell, index) => <td className={index === 3 ? 'is-target' : ''} key={`${row[1]}-${index}`}>{index === 0 ? <b>{cell}</b> : cell}</td>)}</tr>)}</tbody></table>
      </Slide>,
    );
    appendix.push(
      <Slide id="appendix-evidence" page="A6" chapter="APPENDIX > EVIDENCE GAPS" title="전략 확정 전 반드시 채워야 할 데이터 공백을 명시한다" tag="EVIDENCE GAP" implication={<>공개자료 기반 전략은 방향 가설이며, <Marker>전환 데이터·고객 인터뷰·책임 검토·구현 비용</Marker>으로 검증해야 합니다.</>}>
        <div className="evidence-gap-grid">{missingEvidence.map((item, index) => <div key={item}><span>{String(index + 1).padStart(2, '0')}</span><p>{item}</p></div>)}</div>
      </Slide>,
    );
    appendix.push(
      <Slide id="appendix-sources" page="A7" chapter="APPENDIX > SOURCE LABELS" title="공식·정부·기업 발표·언론·자체 스캔의 신뢰도를 구분한다" tag="SOURCES" implication={<>숫자와 카피는 같은 사실 등급으로 취급하지 않으며, <Marker>검증 상태가 낮은 항목은 의사결정 근거에서 분리</Marker>합니다.</>}>
        <div className="source-hierarchy"><div><span>LEVEL 1</span><b>정부·규제기관·공시</b><p>국세청·공정거래위원회·국가데이터처 등</p><em>verified</em></div><div><span>LEVEL 2</span><b>기업 공식 서비스·보도자료</b><p>가입자·투자·서비스 범위·공식 캠페인</p><em>partially verified</em></div><div><span>LEVEL 3</span><b>신뢰 언론·업계 발표</b><p>투자·시장·캠페인 보조 검증</p><em>cross-check</em></div><div><span>LEVEL 4</span><b>자체 스캔·미확인</b><p>not-found 또는 원문 카피 추가 검증 필요</p><em>do not infer</em></div></div>
      </Slide>,
    );
    appendix.push(
      <Slide id="appendix-back" page="A8" chapter="FINAL DIRECTION" title="환급 결과를 말하는 브랜드에서 세금 판단을 보이게 하는 브랜드로" tag="BIZNUP" className="back-cover" implication={null}>
        <div className="back-cover-copy"><span>BRAND PRINCIPLE</span><h1>맡겨도,<br/><Marker>알 권리는 남는다</Marker></h1><p>Tax Decision Receipt · 비즈넵 세금설명서</p></div>
      </Slide>,
    );

    return { main, appendix };
  }, []);

  return (
    <main className="full-report-app">
      <ReportNav />
      <div className="full-report-content">
        <div className="full-report-toolbar">
          <div><strong>비즈넵 FULL REPORT · 1차 통합본</strong><span>40 Main + 8 Appendix · 16:9 · Creative History / SWOT 원본 유지</span></div>
          <div><span>Main {frames.main.length}/{MAIN_TOTAL}</span><span>Appendix {frames.appendix.length}/{APPENDIX_TOTAL}</span><button onClick={() => window.print()}>PDF / Print</button><button onClick={() => { window.location.href = '/'; }}>Dashboard</button></div>
        </div>
        <div className="full-report-section-label">MAIN DECK · 40 PAGES</div>
        {frames.main.map((slide, index) => <Frame scale={scale} key={`main-${index}`}>{slide}</Frame>)}
        <div className="full-report-section-label">APPENDIX · 8 PAGES</div>
        {frames.appendix.map((slide, index) => <Frame scale={scale} key={`appendix-${index}`}>{slide}</Frame>)}
      </div>
    </main>
  );
}
