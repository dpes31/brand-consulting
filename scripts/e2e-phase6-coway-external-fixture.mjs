import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import zlib from 'node:zlib';
import { chromium } from 'playwright';

const appUrl = process.env.PREVIEW_URL;
if (!appUrl) throw new Error('PREVIEW_URL is required.');

const brand = '코웨이';
const fixtureParts = [0, 1, 2, 3, 4].map((index) => (
  fs.readFileSync(new URL(`./fixtures/coway-real-output-20260820.html.gz.b64.part0${index}`, import.meta.url), 'utf8').trim()
));
const externalHtml = zlib.gunzipSync(Buffer.from(fixtureParts.join(''), 'base64')).toString('utf8');
const fixtureHash = crypto.createHash('sha256').update(externalHtml).digest('hex');
assert.equal(
  fixtureHash,
  '3d789306f8f42506f34b54a79bcccc76949a675bd50f40d38de26323e854cb32',
  'The real Coway fixture changed unexpectedly.',
);

const repairedPersonaSoWhats = {
  'persona-1.soWhat': '보호자의 기억을 요구하지 않는 선제 관리 경험을 브랜드 표준으로 만들어야 한다.',
  'persona-2.soWhat': '다제품 관계를 하나의 운영 화면과 전환 원칙으로 통합해 계약 복잡성을 경쟁장벽으로 바꿔야 한다.',
  'persona-3.soWhat': '설명 가능한 근거와 선택권을 모든 접점의 기본 UX 원칙으로 고정해야 한다.',
};
const sourceTruthByCompetitor = {
  'LG전자': { penetration: '23', growth: '20', preference: '18', campaign: '14', inflection: '13', evidence: '4', total: '92' },
  '쿠쿠홈시스': { penetration: '21', growth: '17', preference: '17', campaign: '11', inflection: '12', evidence: '5', total: '83' },
  '삼성전자': { penetration: '18', growth: '19', preference: '17', campaign: '14', inflection: '10', evidence: '2', total: '80' },
};

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

  const result = await page.evaluate(({ approvedBase, brand, externalHtml, repairedPersonaSoWhats, sourceTruthByCompetitor }) => {
    const api = window.Phase6Semantic;
    if (!api?.compileSemanticHtmlReportV5) throw new Error('Phase6Semantic compiler API unavailable.');

    const rawDoc = new DOMParser().parseFromString(externalHtml, 'text/html');
    const rawBreadcrumb = rawDoc.querySelector('#creative-history-target .full-breadcrumb');
    const rawArrow = rawDoc.querySelector('#positioning .map-arrow-vector .map-arrow-line');
    const coordinate = (key) => rawDoc.querySelector(`data[data-report-coordinate-field="${key}"]`)?.textContent?.trim() || '';

    let rawBlockingError = '';
    try {
      api.compileSemanticHtmlReportV5(externalHtml, approvedBase, brand);
    } catch (error) {
      rawBlockingError = error instanceof Error ? error.message : String(error);
    }

    const repairedDoc = new DOMParser().parseFromString(externalHtml, 'text/html');
    Object.entries(repairedPersonaSoWhats).forEach(([key, value]) => {
      const node = repairedDoc.querySelector(`[data-report-field="${key}"]`);
      if (!node) throw new Error(`Missing fixture field: ${key}`);
      node.textContent = value;
    });
    for (let rank = 1; rank <= 3; rank += 1) {
      const name = repairedDoc.querySelector(`[data-report-field="comp-ranking.rank${rank}.name"]`)?.textContent?.trim() || '';
      const scores = sourceTruthByCompetitor[name];
      if (!scores) throw new Error(`No P12 source-truth score fixture for ${name}`);
      Object.entries(scores).forEach(([role, value]) => {
        const node = repairedDoc.querySelector(`[data-report-field="comp-ranking.rank${rank}.${role}"]`);
        if (!node) throw new Error(`Missing P12 fixture field: rank${rank}.${role}`);
        node.textContent = value;
      });
    }
    const repairedExternalHtml = `<!DOCTYPE html>\n${repairedDoc.documentElement.outerHTML}`;
    const compiled = api.compileSemanticHtmlReportV5(repairedExternalHtml, approvedBase, brand);
    const compiledDoc = new DOMParser().parseFromString(compiled, 'text/html');
    const compiledArrow = compiledDoc.querySelector('#positioning .map-arrow-vector .map-arrow-line');
    const asIs = compiledDoc.querySelector('#positioning .map-dot.biz-as');
    const toBe = compiledDoc.querySelector('#positioning .map-dot.biz-to');

    return {
      raw: {
        pageCount: rawDoc.querySelectorAll('.full-slide').length,
        contentState: rawDoc.body.dataset.contentState || '',
        targetBreadcrumb: rawBreadcrumb?.textContent?.trim() || '',
        targetBreadcrumbFixed: rawBreadcrumb?.getAttribute('data-report-fixed') || '',
        coordinates: {
          asIsX: coordinate('positioning.targetAsIs.x'),
          asIsY: coordinate('positioning.targetAsIs.y'),
          toBeX: coordinate('positioning.targetToBe.x'),
          toBeY: coordinate('positioning.targetToBe.y'),
        },
        arrow: rawArrow ? {
          x1: rawArrow.getAttribute('x1'),
          y1: rawArrow.getAttribute('y1'),
          x2: rawArrow.getAttribute('x2'),
          y2: rawArrow.getAttribute('y2'),
        } : null,
        blockingError: rawBlockingError,
      },
      compiled: {
        pageCount: compiledDoc.querySelectorAll('.full-slide').length,
        contentState: compiledDoc.body.dataset.contentState || '',
        targetBreadcrumb: compiledDoc.querySelector('#creative-history-target .full-breadcrumb')?.textContent?.trim() || '',
        arrowCount: compiledDoc.querySelectorAll('#positioning .map-arrow-vector').length,
        arrow: compiledArrow ? {
          x1: compiledArrow.getAttribute('x1'),
          y1: compiledArrow.getAttribute('y1'),
          x2: compiledArrow.getAttribute('x2'),
          y2: compiledArrow.getAttribute('y2'),
        } : null,
        asIsStyle: { left: asIs?.style.left || '', top: asIs?.style.top || '' },
        toBeStyle: { left: toBe?.style.left || '', top: toBe?.style.top || '' },
        unresolvedToken: /\[\[(?:FIELD|POSITION):/i.test(compiledDoc.body.textContent || ''),
      },
    };
  }, { approvedBase, brand, externalHtml, repairedPersonaSoWhats, sourceTruthByCompetitor });

  assert.equal(result.raw.pageCount, 40);
  assert.equal(result.raw.contentState, 'template');
  assert.equal(result.raw.targetBreadcrumb, 'IV. CREATIVE > COMPETITOR HISTORY');
  assert.equal(result.raw.targetBreadcrumbFixed, 'true');
  assert.deepEqual(result.raw.coordinates, { asIsX: '30', asIsY: '62', toBeX: '86', toBeY: '18' });
  assert.deepEqual(result.raw.arrow, { x1: '36', y1: '47', x2: '82', y2: '17' });
  assert.match(result.raw.blockingError, /Persona 1/);
  assert.match(result.raw.blockingError, /Persona 2/);
  assert.match(result.raw.blockingError, /Persona 3/);
  assert.match(result.raw.blockingError, /Brand Role/);
  assert.match(result.raw.blockingError, /SO WHAT/);

  assert.equal(result.compiled.pageCount, 40);
  assert.equal(result.compiled.contentState, 'compiled');
  assert.equal(result.compiled.targetBreadcrumb, 'IV. CREATIVE > TARGET BRAND HISTORY');
  assert.equal(result.compiled.arrowCount, 1);
  assert.deepEqual(result.compiled.arrow, { x1: '30', y1: '62', x2: '86', y2: '18' });
  assert.deepEqual(result.compiled.asIsStyle, { left: '30%', top: '62%' });
  assert.deepEqual(result.compiled.toBeStyle, { left: '86%', top: '18%' });
  assert.equal(result.compiled.unresolvedToken, false);

  console.log(JSON.stringify({ fixtureHash, ...result }, null, 2));
} finally {
  await browser.close();
}
