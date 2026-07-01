import './UmbrexComparisonPilot.css';

type SlideShellProps = {
  chapter: string;
  title: string;
  page: string;
  children: React.ReactNode;
  implication: React.ReactNode;
  mode: 'original' | 'improved';
};

const growthEvents = [
  ['2016', 'FOUNDATION', '에멘탈 설립', '사업자 경영 데이터 기술 축적 시작'],
  ['2021', 'SCALE-UP', '지엔터프라이즈 전환', '네이버·네이버파이낸셜 투자와 사업 기반 확대'],
  ['2022', 'CATEGORY ENTRY', '비즈넵 환급 출시', '경영관리 도구에서 세무 문제 해결로 진입'],
  ['2024', 'MASS ADOPTION', '가입자 100만', '환급·케어 통합과 AI 상담 세나 확장'],
  ['2025', 'PLATFORM EXPANSION', '시리즈 C 165억', '가입자 300만·관리 환급액 1조원대 진입'],
  ['2026', 'CURRENT', '가입자 400만', '종합 세무관리 플랫폼으로의 전환 압력'],
] as const;

const threatData = [
  ['Evidence', '누적 신고 고객 720만8,747명과 대규모 브랜드 상기'],
  ['Core Desire', '놓친 돈을 즉시 되찾고 싶다'],
  ['Appeal', '간편 조회와 즉각적인 예상 환급액'],
  ['Threat Mechanism', '대규모 유입과 상기가 세금 앱의 기본값을 강화'],
  ['Attack Point', '사업자에게 설명 가능하고 검증 가능한 판단을 소유'],
] as const;

const matrixRows = [
  ['핵심 고객', '개인·법인 사업자', '프리랜서·근로자·개인사업자', '개인·법인 사업자', '개인사업자'],
  ['대표 진입 상품', '사업자 환급', '종소세 신고·환급', '사업자 경정청구', '부가세·종소세 신고'],
  ['핵심 경험', 'AI 계산 + 전문가 검토', '간편 조회 + 즉각 보상', '전문가 대리 + AI 관리', '저비용 셀프 신고'],
  ['반복 이용 구조', '환급→상담→기장 확장', '생활형 세금·금융 확장', '기장·재무 에이전트 락인', '신고 시즌 반복 방문'],
  ['소유한 가치', '사업자 환급 대표성', '끝까지 찾는 집요함', '전문가 책임', '사용자 통제'],
  ['구조적 취약점', '일회성 환급 인식', '복잡한 사업자 세무 전문성', '소비자 언어가 추상적', '전문가 검증·책임 범위'],
] as const;

const aiplStages = [
  ['Awareness', '광고 노출', '환급 가능성과 예상액이 관심을 만든다.', '유입'],
  ['Interest', '환급 조회', '즉각적 기대편익이 행동을 유도한다.', '관심'],
  ['Purchase', '정보 제공', '개인정보와 세무대리 범위가 불안으로 전환된다.', '핵심 마찰'],
  ['Purchase', '수수료·위험 확인', '계산 근거·추징 가능성·책임 주체가 보이지 않는다.', '최대 이탈'],
  ['Loyalty', '신청 또는 이탈', '설명과 통제권이 부족하면 관심이 구매로 전환되지 않는다.', '결정'],
] as const;

const creativeYears = [
  ['2021', '서비스 성장', '공식 대표 캠페인 확인 필요', '서비스 정체성 탐색기', 'not-found'],
  ['2022', '환급 진입', '사업자 환급 문제 해결', '카테고리 진입 선언', 'partial'],
  ['2023', '환급 확장', '환급 가능성·예상액 중심', '성과 편익 강화', 'partial'],
  ['2024', '통합 관리', '환급·케어·AI 상담 확장', '제품 범위 확대', 'partial'],
  ['2025', '플랫폼화', '사업자 세무관리 플랫폼', '관계형 서비스 전환', 'partial'],
  ['2026 YTD', '환급바다', '“사장님 세금 환급은 비즈넵”', '사업자 환급 대표성 선언', 'verified'],
] as const;

const swot = {
  strengths: ['400만 사업자 기반', '환급·상담·기장 연결', 'AI 계산과 전문가 검토 결합'],
  weaknesses: ['일회성 환급 앱 인식', '판단 근거와 책임 범위가 보이지 않음', '비시즌 재방문 이유가 약함'],
  opportunities: ['무료 원클릭 이후 설명 가능성 경쟁', '사업자 운영 AI 수요 확대', '환급 이후 상시관리 전환 가능'],
  threats: ['삼쩜삼의 대중적 기본값', '혜움의 전문가 책임 언어', 'SSEM의 사용자 통제 경험'],
};

const strategies = [
  ['A', '환급보다 예방', '더 내기 전에 막아주는 상시 세무관리', 3, 5, 2],
  ['B', '맡겨도 안심', '오류·추징·책임 불안을 줄이는 안전망', 2, 4, 4],
  ['C', '맡겨도 알 권리는 남는다', '세무 판단을 이해하고 승인할 권리', 5, 5, 5],
  ['D', '사장님의 세금 운영체제', '환급·신고·기장을 하나의 운영 루프로 통합', 4, 5, 2],
] as const;

function SlideShell({ chapter, title, page, children, implication, mode }: SlideShellProps) {
  return (
    <section className={`cmp-slide cmp-slide--${mode}`}>
      <div className="cmp-slide-header">
        <div className="cmp-breadcrumb">{chapter}</div>
        <div className="cmp-title-row">
          <h2>{title}</h2>
          <span className="cmp-page">{page}</span>
        </div>
      </div>
      <div className="cmp-slide-body">{children}</div>
      <div className="cmp-implication"><span className="cmp-implication-label">SO WHAT</span>{implication}</div>
    </section>
  );
}

function OriginalGrowth() {
  return (
    <div className="legacy-grid legacy-grid--3">
      {growthEvents.map(([year, category, title, desc]) => (
        <div className="legacy-box" key={year}>
          <strong>{year}</strong><small>{category}</small><h4>{title}</h4><p>{desc}</p>
        </div>
      ))}
    </div>
  );
}

function ImprovedGrowth() {
  return (
    <div className="viz-timeline">
      <div className="viz-stage-band"><span>기술·데이터 기반 축적</span><span>환급 카테고리 진입</span><span>플랫폼·관계 확장</span></div>
      <div className="viz-timeline-axis" />
      {growthEvents.map(([year, category, title, desc], index) => (
        <div className={`viz-milestone viz-milestone--${index % 2 ? 'down' : 'up'} ${year === '2026' ? 'is-current' : ''}`} style={{ left: `${7 + index * 18}%` }} key={year}>
          <span className="viz-dot" />
          <strong>{year}</strong><small>{category}</small><h4>{title}</h4><p>{desc}</p>
        </div>
      ))}
    </div>
  );
}

function OriginalThreat() {
  return <div className="legacy-grid legacy-grid--2">{threatData.map(([label, text]) => <div className="legacy-box" key={label}><small>{label}</small><p>{text}</p></div>)}</div>;
}

function ImprovedThreat() {
  return (
    <div className="viz-threat-flow">
      {threatData.map(([label, text], index) => (
        <div className={`viz-threat-step viz-threat-step--${index + 1}`} key={label}>
          <span>{String(index + 1).padStart(2, '0')}</span><small>{label}</small><p>{text}</p>
          {index < threatData.length - 1 && <i aria-hidden="true">→</i>}
        </div>
      ))}
      <div className="viz-threat-summary"><b>경쟁사의 강점</b>을 복제하지 않고, <mark>설명 가능한 판단</mark>이라는 미점유 가치를 공격점으로 전환</div>
    </div>
  );
}

function OriginalMatrix() {
  return <div className="legacy-grid legacy-grid--2">{matrixRows.map((row) => <div className="legacy-box" key={row[0]}><h4>{row[0]}</h4>{row.slice(1).map((v, i) => <p key={v}><b>{['비즈넵', '삼쩜삼', '더낸세금·혜움', 'SSEM'][i]}</b> {v}</p>)}</div>)}</div>;
}

function ImprovedMatrix() {
  return (
    <table className="viz-matrix"><thead><tr><th>공통 비교축</th><th className="is-target">비즈넵</th><th>삼쩜삼</th><th>더낸세금·혜움</th><th>SSEM</th></tr></thead><tbody>
      {matrixRows.map((row) => <tr key={row[0]}>{row.map((cell, i) => <td className={i === 1 ? 'is-target' : ''} key={`${row[0]}-${i}`}>{i === 0 ? <b>{cell}</b> : cell}</td>)}</tr>)}
    </tbody></table>
  );
}

function OriginalAipl() {
  return <div className="legacy-grid legacy-grid--3">{aiplStages.map(([phase, action, copy, state]) => <div className="legacy-box" key={action}><small>{phase} · {state}</small><h4>{action}</h4><p>{copy}</p></div>)}</div>;
}

function ImprovedAipl() {
  return (
    <div className="viz-funnel-wrap">
      <div className="viz-funnel">
        {aiplStages.map(([phase, action, copy, state], index) => <div className={`viz-funnel-stage ${index === 2 || index === 3 ? 'is-friction' : ''}`} style={{ width: `${100 - index * 11}%` }} key={action}><b>{phase}</b><strong>{action}</strong><span>{copy}</span><em>{state}</em></div>)}
      </div>
      <div className="viz-drop-note"><strong>Interest → Purchase 병목</strong><p>예상 환급액은 관심을 만들지만, 개인정보·수수료·추징 위험·책임 주체가 구매 직전에 동시에 불안으로 전환됩니다.</p><mark>신청을 요구하기 전에 계산 근거와 책임 범위를 먼저 설명</mark></div>
    </div>
  );
}

function OriginalHistory() {
  return <div className="legacy-grid legacy-grid--3">{creativeYears.map(([year, category, campaign, meaning, status]) => <div className="legacy-box" key={year}><strong>{year}</strong><small>{category} · {status}</small><h4>{campaign}</h4><p>{meaning}</p></div>)}</div>;
}

function ImprovedHistory() {
  return (
    <div className="viz-history">
      <div className="viz-history-axis" />
      {creativeYears.map(([year, category, campaign, meaning, status], index) => <div className={`viz-history-item ${status === 'verified' ? 'is-verified' : ''}`} key={year}><strong>{year}</strong><span className="viz-history-dot"/><small>{category}</small><h4>{campaign}</h4><p>{meaning}</p><em>{status}</em>{index < creativeYears.length - 1 && <i>→</i>}</div>)}
      <div className="viz-history-message"><span>메시지 궤적</span><b>서비스 탐색 → 환급 성과 → 통합 관리 → 사업자 환급 대표성</b></div>
    </div>
  );
}

function OriginalRootCause() {
  return (
    <div className="legacy-swot">
      <div><h4>Strengths</h4>{swot.strengths.map(v => <p key={v}>{v}</p>)}</div>
      <div><h4>Weaknesses</h4>{swot.weaknesses.map(v => <p key={v}>{v}</p>)}</div>
      <div><h4>Opportunities</h4>{swot.opportunities.map(v => <p key={v}>{v}</p>)}</div>
      <div><h4>Threats</h4>{swot.threats.map(v => <p key={v}>{v}</p>)}</div>
    </div>
  );
}

function ImprovedRootCause() {
  return (
    <div className="viz-root-cause">
      <div className="viz-cause-column"><span>시장·경쟁 증거</span>{[swot.opportunities[0], swot.threats[0], swot.threats[1]].map(v => <p key={v}>{v}</p>)}</div>
      <div className="viz-tree-arrow">→</div>
      <div className="viz-cause-column"><span>내부 구조</span>{[swot.strengths[1], swot.weaknesses[0], swot.weaknesses[1]].map(v => <p key={v}>{v}</p>)}</div>
      <div className="viz-tree-arrow">→</div>
      <div className="viz-root-core"><small>ROOT CAUSE</small><strong>제품은 관계형인데<br/>브랜드 경험은 사건형이다</strong><p>결과는 제공하지만 소비자가 판단을 이해하고 승인하는 과정이 설계되지 않았습니다.</p></div>
      <div className="viz-tree-arrow">→</div>
      <div className="viz-cause-column is-answer"><span>전략 기회</span>{[swot.opportunities[1], swot.opportunities[2], swot.strengths[2]].map(v => <p key={v}>{v}</p>)}</div>
    </div>
  );
}

function OriginalStrategies() {
  return <div className="legacy-grid legacy-grid--2">{strategies.map(([id, title, desc, d, e, x]) => <div className="legacy-box" key={id}><small>ROUTE {id}</small><h4>{title}</h4><p>{desc}</p><p>차별성 {d}/5 · 확장성 {e}/5 · 실행성 {x}/5</p></div>)}</div>;
}

function ImprovedStrategies() {
  return (
    <div className="viz-choice">
      <div className="viz-choice-grid">
        <div className="viz-choice-head"><span>전략 대안</span><span>핵심 명제</span><span>차별성</span><span>확장성</span><span>실행성</span><span>판정</span></div>
        {strategies.map(([id, title, desc, d, e, x]) => <div className={`viz-choice-row ${id === 'C' ? 'is-selected' : ''}`} key={id}><b>{id}. {title}</b><p>{desc}</p><span>{d}/5</span><span>{e}/5</span><span>{x}/5</span><em>{id === 'C' ? 'SELECT' : id === 'D' ? 'FUTURE' : 'SUPPORT'}</em></div>)}
      </div>
      <div className="viz-choice-result"><span>최종 선택</span><strong><mark>맡겨도, 알 권리는 남는다</mark></strong><p>기능적 예방과 정서적 안심을 증거로 결합하고, 문화적 통제권을 브랜드의 중심 원칙으로 선택합니다.</p></div>
    </div>
  );
}

const pairs = [
  { id: 'growth', label: '01 · Growth Story', title: '비즈넵의 성장은 세 번의 구조적 전환으로 만들어졌다', page: 'F02', Original: OriginalGrowth, Improved: ImprovedGrowth, implication: <>기술 축적→환급 진입→플랫폼 확장의 <mark>전환점과 인과</mark>가 한눈에 읽혀야 합니다.</> },
  { id: 'threat', label: '02 · Competitor Deep Dive', title: '삼쩜삼의 위협은 기능이 아니라 고객 선택을 만드는 메커니즘이다', page: '06', Original: OriginalThreat, Improved: ImprovedThreat, implication: <>경쟁사 정보를 나열하지 않고 <mark>Evidence→Desire→Appeal→Threat→Attack</mark>의 인과로 읽습니다.</> },
  { id: 'matrix', label: '03 · Product Matrix', title: '기능 수는 유사해지고, 차이는 고객이 통제하는 방식에서 발생한다', page: '07', Original: OriginalMatrix, Improved: ImprovedMatrix, implication: <>동일 비교축과 타깃 열 강조를 통해 <mark>비즈넵의 차별점과 취약점</mark>을 수평 비교합니다.</> },
  { id: 'aipl', label: '04 · AIPL Bottleneck', title: '관심은 환급액이 만들지만, 구매는 설명 부족에서 멈춘다', page: '12', Original: OriginalAipl, Improved: ImprovedAipl, implication: <>퍼널의 폭과 마찰 표시로 <mark>Interest→Purchase</mark>의 핵심 이탈 구간을 즉시 식별합니다.</> },
  { id: 'history', label: '05 · Creative History', title: '6개년도 메시지는 환급 성과에서 사업자 대표성으로 이동했다', page: '13', Original: OriginalHistory, Improved: ImprovedHistory, implication: <>연도별 사실과 검증 상태를 유지하면서 <mark>메시지 궤적</mark>을 별도 레이어로 읽게 합니다.</> },
  { id: 'root', label: '06 · SWOT / Root Cause', title: '제품은 관계형인데, 브랜드 경험은 사건형이다', page: '16', Original: OriginalRootCause, Improved: ImprovedRootCause, implication: <>SWOT 항목을 버리지 않고 <mark>외부 증거→내부 구조→Root Cause→전략 기회</mark>로 재배열합니다.</> },
  { id: 'strategy', label: '07 · Four Strategies', title: '네 전략 중 통제권만이 차별성·확장성·브랜드 자산을 동시에 만든다', page: '18', Original: OriginalStrategies, Improved: ImprovedStrategies, implication: <>네 대안을 삭제하지 않고 동일 기준으로 비교해 <mark>최종 선택과 Trade-off</mark>를 명시합니다.</> },
] as const;

export default function UmbrexComparisonPilot() {
  return (
    <main className="cmp-app">
      <nav className="cmp-nav">
        <div className="cmp-brand">BIZNUP <span>VISUAL PILOT</span></div>
        <div className="cmp-nav-note">MAIN 양식 보존<br/>Umbrex 구조 참고<br/>동일 콘텐츠 Before / After</div>
        {pairs.map(pair => <a href={`#${pair.id}`} key={pair.id}>{pair.label}</a>)}
      </nav>
      <div className="cmp-content">
        <header className="cmp-intro">
          <span>DESIGN DIRECTION B</span>
          <h1>기존 양식은 유지하고,<br/>본문의 정보 구조만 바꿉니다.</h1>
          <p>왼쪽과 오른쪽은 동일한 내용을 사용합니다. 변경되는 것은 요약 분량이 아니라 문단·축·선·화살표·표·그래프·면 분할의 구조입니다. Umbrex의 템플릿은 시각 스타일이 아니라 정보 구조 선택에만 참고했습니다.</p>
          <div><b>고정</b> 좌측 네비 · 슬라이드 크기/여백 · 제목/챕터/페이지 위치 · 폰트/기본 컬러 · 하단 시사점</div>
        </header>

        {pairs.map(({ id, label, title, page, Original, Improved, implication }) => (
          <section className="cmp-pair" id={id} key={id}>
            <div className="cmp-pair-heading"><div><span>{label}</span><h2>{title}</h2></div><strong>동일 콘텐츠 100%</strong></div>
            <div className="cmp-columns">
              <div className="cmp-column"><div className="cmp-column-label is-before">BEFORE · 기존 박스형 배치</div><div className="cmp-canvas"><SlideShell chapter={label} title={title} page={page} implication={implication} mode="original"><Original /></SlideShell></div></div>
              <div className="cmp-column"><div className="cmp-column-label is-after">AFTER · 구조화 시각화</div><div className="cmp-canvas"><SlideShell chapter={label} title={title} page={page} implication={implication} mode="improved"><Improved /></SlideShell></div></div>
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
