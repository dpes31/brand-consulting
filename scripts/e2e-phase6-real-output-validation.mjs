import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const appUrl = process.env.PREVIEW_URL;
if (!appUrl) throw new Error('PREVIEW_URL is required.');

const brand = 'QA 생활케어';
const core = ['알파케어', '베타홈', '감마라이프'];
const candidates = [...core, '델타케어', '엡실론홈'];
const targets = ['영유아 가족', '맞벌이 가구', '1인 생활자', '부모 돌봄 가구', '회복 투자층'];
const coordinates = {
  'positioning.competitor1.x': 22,
  'positioning.competitor1.y': 70,
  'positioning.competitor2.x': 55,
  'positioning.competitor2.y': 38,
  'positioning.competitor3.x': 74,
  'positioning.competitor3.y': 76,
  'positioning.targetAsIs.x': 42,
  'positioning.targetAsIs.y': 58,
  'positioning.targetToBe.x': 82,
  'positioning.targetToBe.y': 19,
};
const threatScores = [
  { penetration: 23, growth: 20, preference: 18, campaign: 14, inflection: 13, evidence: 4, total: 92 },
  { penetration: 21, growth: 17, preference: 17, campaign: 11, inflection: 12, evidence: 5, total: 83 },
  { penetration: 18, growth: 19, preference: 17, campaign: 14, inflection: 10, evidence: 2, total: 80 },
];

function valueFor(key) {
  const candidate = key.match(/^comp-landscape\.candidate([1-5])\.name$/);
  if (candidate) return candidates[Number(candidate[1]) - 1];

  const rankName = key.match(/^comp-ranking\.rank([1-3])\.(name|summaryName)$/);
  if (rankName) return core[Number(rankName[1]) - 1];
  const rankScore = key.match(/^comp-ranking\.rank([1-3])\.(penetration|growth|preference|campaign|inflection|evidence|total)$/);
  if (rankScore) return String(threatScores[Number(rankScore[1]) - 1][rankScore[2]]);

  const deepTitle = key.match(/^deep-dive-([1-3])\.title$/);
  if (deepTitle) return `${core[Number(deepTitle[1]) - 1]}가 핵심 위협이다`;

  const matrixName = key.match(/^product-matrix\.column([1-4])\.name$/);
  if (matrixName) {
    const index = Number(matrixName[1]);
    return index === 1 ? brand : core[index - 2];
  }

  const mapName = key.match(/^positioning\.competitor([1-3])\.name$/);
  if (mapName) return core[Number(mapName[1]) - 1];
  if (key === 'positioning.targetAsIs') return `${brand} AS-IS · 기능 중심 인식`;
  if (key === 'positioning.targetToBe') return `${brand} TO-BE · 생활 기준 인식`;
  if (key === 'positioning.axis.xLeft') return '기능 항목 나열';
  if (key === 'positioning.axis.xRight') return '생활 결과 증명';
  if (key === 'positioning.axis.yTop') return '선제적 관리';
  if (key === 'positioning.axis.yBottom') return '사후 대응';

  if (key === 'creative-history-target.title') return `${brand} Creative History`;
  const historyTitle = key.match(/^creative-history-([1-3])\.title$/);
  if (historyTitle) return `${core[Number(historyTitle[1]) - 1]} Creative History`;

  const trajectoryName = key.match(/^creative-trajectory\.brand([1-4])\.name$/);
  if (trajectoryName) {
    const index = Number(trajectoryName[1]);
    return index === 1 ? brand : core[index - 2];
  }
  if (/^creative-trajectory\.brand[1-4]\.meaning$/.test(key)) return '생활관리 언어의 역할';

  const target = key.match(/^consumer-target\.target([1-5])\.name$/);
  if (target) return targets[Number(target[1]) - 1];
  const personaTitle = key.match(/^persona-([1-3])\.title$/);
  if (personaTitle) {
    const targetName = targets[Number(personaTitle[1]) - 1];
    return `${targetName}의 선택 기준을 다시 정의합니다`;
  }

  const segment = key.match(/^stp\.segment([1-3])\.name$/);
  if (segment) return targets[Number(segment[1]) - 1];
  if (key === 'stp.target.name') return targets[0];
  if (key === 'stp.target.description') return '생활관리의 차이를 근거로 확인하는 핵심 가족';
  if (key === 'stp.positioning') return `${targets[0]}에게 관리 결과를 증명하는 ${brand}`;

  if (/\.status$/.test(key)) return 'source-found-copy-unverified';
  if (/^creative-history-(?:target|[1-3])\.year[1-6]\.copy$/.test(key)) return '캠페인 존재는 확인했으나 원문 카피는 미검증';
  if (/\.source(?:\.|$)/.test(key)) return 'QA Fixture · 검증자료 · 2026';

  if (key === 'cover.headline') return `<mark>${brand}</mark>는 관리 결과를 증명한다`;
  if (key === 'decision-close.principle') return `${brand}는 관리 결과를 증명한다`;
  if (key === 'decision-close.support') return '검증 가능한 관리 근거를 선택 이후의 안심으로 연결한다';
  if (key === 'strategy-choice.bigIdeal') return '모든 가족은 관리의 차이를 이해할 권리가 있다';
  if (key === 'strategy-choice.winningMove') return '관리 결과를 증명하다';
  if (key === 'strategy-choice.proof') return `${brand}의 관리 근거를 하나의 생활 결과로 연결한다`;

  if (/^strategy-routes\.route[A-D]\.type$/.test(key)) return '생활관리 포지셔닝';
  if (/^strategy-routes\.route[A-D]\.proposition$/.test(key)) return '관리 언어를 차별적 경험으로 바꾼다';
  if (/^strategy-routes\.route[A-D]\.direction$/.test(key)) return '체감 가능한 관리 근거를 제안한다';
  if (/^strategy-routes\.route[A-D]\.tradeoff$/.test(key)) return '기능 개수보다 장기 기준 자산을 우선한다';
  if (/^strategy-routes\.route[A-D]\.(differentiation|expansion|execution)$/.test(key)) return '상';

  if (/^persona-[1-3]\.situation\d+$/.test(key)) return '가족의 생활환경을 확인하고 선택해야 하는 실제 상황';
  if (/^persona-[1-3]\.(surfaceNeed|realJob|fear1|fear2|asIsIdentity|toBeIdentity)$/.test(key)) {
    return '관리 불안을 줄이고 근거를 확인해 안심하고 선택한다';
  }
  if (/^persona-[1-3]\.brandRole$/.test(key)) return '브랜드가 관리 결과를 먼저 확인해 선택 부담을 줄인다';

  if (/^jtbd\.row\d+\.(jobType|desiredProgress|currentAlternative|limitation|brandOpportunity)$/.test(key)) {
    return '검증 가능한 관리 근거로 더 나은 선택을 완성한다';
  }
  if (/^aipl\.stage\d+\.(action|evidence|state)$/.test(key)) return '관리 근거를 확인하고 다음 행동으로 이동한다';
  if (/^market-context\.force\d+\.type$/.test(key)) return '관리 기준 변화';
  if (/^pain-needs\.row\d+\.priority$/.test(key)) return 'HIGH';
  if (/\.(score|rating|value)$/.test(key)) return '85';
  if (/\.title$/.test(key)) return `${brand}의 핵심 전략 판단입니다`;
  if (/^persona-[1-3]\.soWhat$/.test(key)) return '제품·경험·커뮤니케이션은 선택 전 관리 결과를 증명하는 구조로 달라져야 한다';
  if (/\.soWhat$/.test(key)) return '<b>검증된 관리 근거를 하나의 소비자 결과로 연결해야 합니다</b>';
  if (/\.period$/.test(key)) return '2026';
  if (/\.label$/.test(key)) return '핵심 근거';
  if (/\.name$/.test(key)) return '검증 대상';
  return '현재 조사에서 확인된 핵심 관리 근거와 실행 의미';
}

function fillTemplate(template) {
  return template
    .replace(/\[\[FIELD:([a-z0-9.-]+)\]\]/gi, (_token, key) => valueFor(key))
    .replace(/\[\[POSITION:([a-z0-9.-]+)\]\]/gi, (_token, key) => String(coordinates[key]));
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });

try {
  const pilotUrl = new URL(appUrl);
  pilotUrl.searchParams.set('pilot', 'full-integrated');
  pilotUrl.searchParams.set('brand', brand);
  await page.goto(pilotUrl.toString(), { waitUntil: 'networkidle', timeout: 120000 });
  await page.waitForFunction(() => (
    document.querySelectorAll('.full-slide').length === 40
    && document.body.dataset.fullReportV4Ready === 'true'
  ), null, { timeout: 60000 });

  const approvedBase = await page.evaluate(() => `<!DOCTYPE html>\n${document.documentElement.outerHTML}`);
  await page.addScriptTag({ url: new URL('__phase6-semantic-test.js', appUrl).toString() });
  const template = await page.evaluate(({ approvedBase, brand }) => {
    const api = window.Phase6Semantic;
    if (!api?.createSemanticHtmlTemplateV5) throw new Error('Phase6Semantic template API unavailable.');
    return api.createSemanticHtmlTemplateV5(approvedBase, brand).html;
  }, { approvedBase, brand });
  const validExternal = fillTemplate(template);

  const result = await page.evaluate(({ approvedBase, brand, targets, validExternal }) => {
    const api = window.Phase6Semantic;
    if (!api?.compileSemanticHtmlReportV5) throw new Error('Phase6Semantic compiler API unavailable.');

    const compiled = api.compileSemanticHtmlReportV5(validExternal, approvedBase, brand);
    const compiledDoc = new DOMParser().parseFromString(compiled, 'text/html');

    const targetBreadcrumb = compiledDoc.querySelector('#creative-history-target .full-breadcrumb')?.textContent?.trim() || '';
    const arrow = compiledDoc.querySelector('#positioning .map-arrow-vector .map-arrow-line');
    const recovered = compiledDoc.body.dataset.phase6RecoveredMarkupCount || '0';
    const warningCount = compiledDoc.body.dataset.phase6NonBlockingWarningCount || '0';

    const badDoc = new DOMParser().parseFromString(validExternal, 'text/html');
    const persona3 = badDoc.querySelector('[data-report-field="persona-3.title"]');
    if (!persona3) throw new Error('persona-3 title missing');
    persona3.textContent = `${targets[3]}의 원격 돌봄 기준을 다시 정의합니다`;
    let personaError = '';
    try {
      api.compileSemanticHtmlReportV5(`<!DOCTYPE html>\n${badDoc.documentElement.outerHTML}`, approvedBase, brand);
    } catch (error) {
      personaError = error instanceof Error ? error.message : String(error);
    }

    const unsafeDoc = new DOMParser().parseFromString(validExternal, 'text/html');
    const executiveSoWhat = unsafeDoc.querySelector('[data-report-field="executive.soWhat"]');
    if (!executiveSoWhat) throw new Error('executive.soWhat missing');
    executiveSoWhat.innerHTML = '<span>허용되지 않은 구조 강조</span>';
    let unsafeError = '';
    try {
      api.compileSemanticHtmlReportV5(`<!DOCTYPE html>\n${unsafeDoc.documentElement.outerHTML}`, approvedBase, brand);
    } catch (error) {
      unsafeError = error instanceof Error ? error.message : String(error);
    }

    const scoreDoc = new DOMParser().parseFromString(validExternal, 'text/html');
    const scoreMutations = {
      'comp-ranking.rank1.campaign': '18',
      'comp-ranking.rank1.inflection': '19',
      'comp-ranking.rank1.evidence': '가전 구독 매출 2조4,800억·약 29% 성장',
      'comp-ranking.rank2.evidence': '국내 렌탈 계정 300만 돌파',
      'comp-ranking.rank3.evidence': '출시 초기 구독 판매 비중 30%',
    };
    Object.entries(scoreMutations).forEach(([key, value]) => {
      const element = scoreDoc.querySelector(`[data-report-field="${key}"]`);
      if (!element) throw new Error(`${key} missing`);
      element.textContent = value;
    });
    let scoreError = '';
    try {
      api.compileSemanticHtmlReportV5(`<!DOCTYPE html>\n${scoreDoc.documentElement.outerHTML}`, approvedBase, brand);
    } catch (error) {
      scoreError = error instanceof Error ? error.message : String(error);
    }

    return {
      pageCount: compiledDoc.querySelectorAll('.full-slide').length,
      recovered,
      warningCount,
      targetBreadcrumb,
      arrow: arrow ? {
        x1: arrow.getAttribute('x1'),
        y1: arrow.getAttribute('y1'),
        x2: arrow.getAttribute('x2'),
        y2: arrow.getAttribute('y2'),
      } : null,
      personaError,
      unsafeError,
      scoreError,
    };
  }, { approvedBase, brand, targets, validExternal });

  assert.equal(result.pageCount, 40);
  assert.ok(Number(result.recovered) >= 1, 'Expected b/strong markup to be recovered to mark.');
  assert.ok(Number(result.warningCount) >= 1, 'Expected copy-style warnings to be non-blocking and counted.');
  assert.equal(result.targetBreadcrumb, 'IV. CREATIVE > TARGET BRAND HISTORY');
  assert.deepEqual(result.arrow, { x1: '42', y1: '58', x2: '82', y2: '19' });
  assert.match(result.personaError, /P24 Persona 3/);
  assert.match(result.personaError, new RegExp(targets[3]));
  assert.match(result.unsafeError, /executive\.soWhat/);
  assert.match(result.unsafeError, /<span>/);
  assert.match(result.scoreError, /comp-ranking\.rank1\.campaign/);
  assert.match(result.scoreError, /comp-ranking\.rank1\.inflection/);
  assert.match(result.scoreError, /comp-ranking\.rank1\.evidence/);
  assert.match(result.scoreError, /comp-ranking\.rank2\.evidence/);
  assert.match(result.scoreError, /comp-ranking\.rank3\.evidence/);

  console.log(JSON.stringify(result, null, 2));
} finally {
  await browser.close();
}
