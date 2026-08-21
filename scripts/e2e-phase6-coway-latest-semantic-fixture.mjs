import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { gunzipSync } from 'node:zlib';
import { readFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const appUrl = process.env.PREVIEW_URL;
if (!appUrl) throw new Error('PREVIEW_URL is required.');

// Deterministic extraction from the owner-supplied external HTML.
// The source attachment itself is locked by filename, byte size, and SHA-256 below.
// We intentionally replay its exact 757 semantic values + P18 coordinates against the
// current app-owned DOM because external fixed DOM is never trusted by the production compiler.
const fixturePartUrls = [0, 1, 2, 3].map((index) => new URL(
  `./fixtures/coway-latest-semantic-20260820.json.gz.b64.part${String(index).padStart(2, '0')}`,
  import.meta.url,
));
const fixtureBase64 = (await Promise.all(fixturePartUrls.map((url) => readFile(url, 'utf8')))).join('');
const fixtureJson = gunzipSync(Buffer.from(fixtureBase64, 'base64'));
const fixture = JSON.parse(fixtureJson.toString('utf8'));

assert.equal(fixture.sourceFile, '코웨이_40페이지_전략보고서(1).html');
assert.equal(fixture.sourceSha256, 'b72089734283abcb1a7c132d8192fc7524f75ec60288e8e68323e53b79f02125');
assert.equal(fixture.sourceBytes, 457661);
assert.equal(fixture.pageCount, 40);
assert.equal(fixture.semanticFieldCount, 757);
assert.equal(Object.keys(fixture.fields).length, 757);
assert.equal(new Set(Object.keys(fixture.fields)).size, 757);
assert.equal(fixture.criticalFixed.p29Breadcrumb, 'IV. CREATIVE > COMPETITOR HISTORY');
assert.deepEqual(fixture.criticalFixed.p18RawArrow, { x1: '36', y1: '47', x2: '82', y2: '17' });
assert.deepEqual(fixture.coordinates, {
  'positioning.competitor1.x': '72',
  'positioning.competitor1.y': '68',
  'positioning.competitor2.x': '30',
  'positioning.competitor2.y': '32',
  'positioning.competitor3.x': '83',
  'positioning.competitor3.y': '58',
  'positioning.targetAsIs.x': '38',
  'positioning.targetAsIs.y': '46',
  'positioning.targetToBe.x': '48',
  'positioning.targetToBe.y': '84',
});

// Test-only values used to prove that a contract-compliant P12 continues through the
// downstream compiler. They are not owner research and are never substituted into production.
const sourceTruthScores = [
  { penetration: '23', growth: '20', preference: '18', campaign: '14', inflection: '13', evidence: '4', total: '92' },
  { penetration: '21', growth: '17', preference: '17', campaign: '11', inflection: '12', evidence: '5', total: '83' },
  { penetration: '18', growth: '19', preference: '17', campaign: '14', inflection: '10', evidence: '2', total: '80' },
];

function fillLatestSemanticValues(template) {
  const missingFields = [];
  const filled = template
    .replace(/\[\[FIELD:([a-z0-9.-]+)\]\]/gi, (_token, key) => {
      if (!(key in fixture.fields)) {
        missingFields.push(key);
        return _token;
      }
      return fixture.fields[key];
    })
    .replace(/\[\[POSITION:([a-z0-9.-]+)\]\]/gi, (_token, key) => {
      if (!(key in fixture.coordinates)) throw new Error(`Latest Coway coordinate fixture missing ${key}`);
      return fixture.coordinates[key];
    });
  assert.deepEqual(missingFields, []);
  assert.doesNotMatch(filled, /\[\[(?:FIELD|POSITION):/);
  return filled;
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });

try {
  const pilotUrl = new URL(appUrl);
  pilotUrl.searchParams.set('pilot', 'full-integrated');
  pilotUrl.searchParams.set('brand', '코웨이');
  await page.goto(pilotUrl.toString(), { waitUntil: 'networkidle', timeout: 120000 });
  await page.waitForFunction(() => (
    document.querySelectorAll('.full-slide').length === 40
    && document.body.dataset.fullReportV4Ready === 'true'
  ), null, { timeout: 60000 });

  const approvedBase = await page.evaluate(() => `<!DOCTYPE html>\n${document.documentElement.outerHTML}`);
  await page.addScriptTag({ url: new URL('__phase6-semantic-test.js', appUrl).toString() });
  const semanticTemplate = await page.evaluate(({ approvedBase }) => {
    const api = window.Phase6Semantic;
    if (!api?.createSemanticHtmlTemplateV5) throw new Error('Phase6Semantic template API unavailable.');
    return api.createSemanticHtmlTemplateV5(approvedBase, '코웨이').html;
  }, { approvedBase });

  const latestExternal = fillLatestSemanticValues(semanticTemplate);
  const regressionResult = await page.evaluate(({
    latestExternal,
    approvedBase,
    sourceTruthScores,
    rawBreadcrumb,
    rawArrow,
  }) => {
    const api = window.Phase6Semantic;
    if (!api?.compileSemanticHtmlReportV5) throw new Error('Phase6Semantic compiler API unavailable.');

    const actualDoc = new DOMParser().parseFromString(latestExternal, 'text/html');
    // Mirror the actual app Report Identity Lock stage for rank summary names.
    for (let rank = 1; rank <= 3; rank += 1) {
      const name = actualDoc.querySelector(`[data-report-field="comp-ranking.rank${rank}.name"]`)?.textContent?.trim();
      const summary = actualDoc.querySelector(`[data-report-field="comp-ranking.rank${rank}.summaryName"]`);
      if (name && summary) summary.textContent = name;
    }
    const breadcrumb = actualDoc.querySelector('#creative-history-target .full-breadcrumb');
    if (breadcrumb) breadcrumb.textContent = rawBreadcrumb;
    const rawLine = actualDoc.querySelector('#positioning .map-arrow-line');
    if (rawLine) Object.entries(rawArrow).forEach(([key, value]) => rawLine.setAttribute(key, value));
    const actualExternal = `<!DOCTYPE html>\n${actualDoc.documentElement.outerHTML}`;

    let rawError = '';
    try {
      api.compileSemanticHtmlReportV5(actualExternal, approvedBase, '코웨이');
    } catch (error) {
      rawError = error instanceof Error ? error.message : String(error);
    }

    // Do not infer missing owner scores. Test-only valid values are inserted only after
    // confirming the real output is rejected with the complete error set.
    sourceTruthScores.forEach((scores, rankIndex) => {
      const rank = rankIndex + 1;
      Object.entries(scores).forEach(([role, value]) => {
        const element = actualDoc.querySelector(`[data-report-field="comp-ranking.rank${rank}.${role}"]`);
        if (!element) throw new Error(`P12 repair field missing: rank${rank}.${role}`);
        element.textContent = value;
      });
    });

    const repairedExternal = `<!DOCTYPE html>\n${actualDoc.documentElement.outerHTML}`;
    const compiled = api.compileSemanticHtmlReportV5(repairedExternal, approvedBase, '코웨이');
    const compiledDoc = new DOMParser().parseFromString(compiled, 'text/html');
    const compiledArrow = compiledDoc.querySelector('#positioning .map-arrow-vector .map-arrow-line');
    const fieldKeys = [...compiledDoc.querySelectorAll('[data-report-field]')].map((element) => element.getAttribute('data-report-field'));

    return {
      rawError,
      pageCount: compiledDoc.querySelectorAll('.full-slide').length,
      semanticFieldCount: fieldKeys.length,
      semanticUniqueCount: new Set(fieldKeys).size,
      unresolvedCount: (compiled.match(/\[\[(?:FIELD|POSITION):/g) || []).length,
      genericContentCount: fieldKeys.filter((key) => /\.content\d+$/i.test(key || '')).length,
      contentState: compiledDoc.body.dataset.contentState || '',
      p29Breadcrumb: compiledDoc.querySelector('#creative-history-target .full-breadcrumb')?.textContent?.trim() || '',
      p18Arrow: compiledArrow ? {
        x1: compiledArrow.getAttribute('x1'),
        y1: compiledArrow.getAttribute('y1'),
        x2: compiledArrow.getAttribute('x2'),
        y2: compiledArrow.getAttribute('y2'),
      } : null,
      recoveredMarkupCount: Number(compiledDoc.body.dataset.phase6RecoveredMarkupCount || '0'),
      nonBlockingWarningCount: Number(compiledDoc.body.dataset.phase6NonBlockingWarningCount || '0'),
    };
  }, {
    latestExternal,
    approvedBase,
    sourceTruthScores,
    rawBreadcrumb: fixture.criticalFixed.p29Breadcrumb,
    rawArrow: fixture.criticalFixed.p18RawArrow,
  });

  assert.match(regressionResult.rawError, /검증에서 7건의 수정 필요 항목/);
  assert.match(regressionResult.rawError, /comp-ranking\.rank1\.campaign/);
  assert.match(regressionResult.rawError, /comp-ranking\.rank1\.inflection/);
  assert.match(regressionResult.rawError, /comp-ranking\.rank1\.evidence/);
  assert.match(regressionResult.rawError, /comp-ranking\.rank2\.inflection/);
  assert.match(regressionResult.rawError, /comp-ranking\.rank2\.evidence/);
  assert.match(regressionResult.rawError, /comp-ranking\.rank3\.evidence/);
  assert.equal(regressionResult.pageCount, 40);
  assert.equal(regressionResult.semanticFieldCount, 757);
  assert.equal(regressionResult.semanticUniqueCount, 757);
  assert.equal(regressionResult.unresolvedCount, 0);
  assert.equal(regressionResult.genericContentCount, 0);
  assert.equal(regressionResult.contentState, 'compiled');
  assert.equal(regressionResult.p29Breadcrumb, 'IV. CREATIVE > TARGET BRAND HISTORY');
  assert.deepEqual(regressionResult.p18Arrow, { x1: '38', y1: '46', x2: '48', y2: '84' });

  console.log(JSON.stringify({
    fixture: {
      sourceSha256: fixture.sourceSha256,
      sourceBytes: fixture.sourceBytes,
      pageCount: fixture.pageCount,
      semanticFieldCount: fixture.semanticFieldCount,
      semanticSnapshotSha256: createHash('sha256').update(fixtureJson).digest('hex'),
    },
    regressionResult,
  }, null, 2));
} finally {
  await browser.close();
}
