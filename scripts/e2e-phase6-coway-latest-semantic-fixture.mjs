import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { gunzipSync } from 'node:zlib';
import { readFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const appUrl = process.env.PREVIEW_URL;
if (!appUrl) throw new Error('PREVIEW_URL is required.');

const rawBase64 = await readFile(
  new URL('./fixtures/coway-latest-output-20260820.html.gz.b64.part00', import.meta.url),
  'utf8',
);
const latestRawHtml = gunzipSync(Buffer.from(rawBase64.trim(), 'base64')).toString('utf8');
const latestRawBytes = Buffer.byteLength(latestRawHtml, 'utf8');
const latestRawSha256 = createHash('sha256').update(latestRawHtml).digest('hex');
assert.equal(latestRawSha256, 'b72089734283abcb1a7c132d8192fc7524f75ec60288e8e68323e53b79f02125');
assert.equal(latestRawBytes, 457661);

// These are deterministic QA values used only to prove that a contract-compliant P12
// can travel through the compiler. They are not substituted into owner content.
const canonicalQaScores = [
  { penetration: '23', growth: '20', preference: '18', campaign: '14', inflection: '13', evidence: '4', total: '92' },
  { penetration: '21', growth: '17', preference: '17', campaign: '11', inflection: '12', evidence: '5', total: '83' },
  { penetration: '18', growth: '19', preference: '17', campaign: '14', inflection: '10', evidence: '2', total: '80' },
];

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

  const regressionResult = await page.evaluate(({
    latestRawHtml,
    approvedBase,
    canonicalQaScores,
  }) => {
    const api = window.Phase6Semantic;
    if (!api?.compileSemanticHtmlReportV5 || !api?.createSemanticHtmlTemplateV5) {
      throw new Error('Phase6Semantic compiler/template API unavailable.');
    }

    const rawDoc = new DOMParser().parseFromString(latestRawHtml, 'text/html');
    const rawFieldNodes = [...rawDoc.querySelectorAll('[data-report-field]')];
    const rawFieldKeys = rawFieldNodes.map((node) => node.getAttribute('data-report-field') || '');
    const rawCoordinate = (key) => rawDoc.querySelector(
      `data[data-report-coordinate-field="${key}"]`,
    )?.textContent?.trim() || '';
    const rawArrow = rawDoc.querySelector('#positioning .map-arrow-vector .map-arrow-line');
    const rawBreadcrumb = rawDoc.querySelector('#creative-history-target .full-breadcrumb')?.textContent?.trim() || '';

    assert(rawDoc.querySelectorAll('.full-slide').length === 40, 'Latest Coway raw fixture must have 40 pages.');
    assert(rawFieldKeys.length === 757, 'Latest Coway raw fixture must have 757 semantic fields.');
    assert(new Set(rawFieldKeys).size === 757, 'Latest Coway raw fixture semantic keys must be unique.');

    // Rebase only the externally supplied semantic values on today's immutable DOM.
    // This preserves strict DOM fingerprinting while testing the exact owner-supplied content.
    const currentTemplate = api.createSemanticHtmlTemplateV5(approvedBase, '코웨이').html;
    const currentDoc = new DOMParser().parseFromString(currentTemplate, 'text/html');
    const missingFields = [];
    currentDoc.querySelectorAll('[data-report-field]').forEach((node) => {
      const key = node.getAttribute('data-report-field') || '';
      const rawNode = rawDoc.querySelector(`[data-report-field="${key}"]`);
      if (!rawNode) {
        missingFields.push(key);
        return;
      }
      node.innerHTML = rawNode.innerHTML;
    });
    if (missingFields.length) throw new Error(`Latest Coway raw fixture missing fields: ${missingFields.slice(0, 8).join(', ')}`);

    currentDoc.querySelectorAll('data[data-report-coordinate-field]').forEach((node) => {
      const key = node.getAttribute('data-report-coordinate-field') || '';
      const value = rawCoordinate(key);
      if (!value) throw new Error(`Latest Coway coordinate missing: ${key}`);
      node.textContent = value;
    });

    // The real app applies Report Identity Lock before compilation. For this fixture the
    // only content-level normalization needed to mirror that stage is summaryName=name.
    for (let rank = 1; rank <= 3; rank += 1) {
      const name = currentDoc.querySelector(`[data-report-field="comp-ranking.rank${rank}.name"]`)?.textContent?.trim();
      const summary = currentDoc.querySelector(`[data-report-field="comp-ranking.rank${rank}.summaryName"]`);
      if (name && summary) summary.textContent = name;
    }

    const breadcrumb = currentDoc.querySelector('#creative-history-target .full-breadcrumb');
    if (breadcrumb) breadcrumb.textContent = rawBreadcrumb;
    const line = currentDoc.querySelector('#positioning .map-arrow-vector .map-arrow-line');
    if (line && rawArrow) {
      ['x1', 'y1', 'x2', 'y2'].forEach((attribute) => {
        const value = rawArrow.getAttribute(attribute);
        if (value !== null) line.setAttribute(attribute, value);
      });
    }

    const actualExternal = `<!DOCTYPE html>\n${currentDoc.documentElement.outerHTML}`;
    let rawError = '';
    try {
      api.compileSemanticHtmlReportV5(actualExternal, approvedBase, '코웨이');
    } catch (error) {
      rawError = error instanceof Error ? error.message : String(error);
    }

    // Do not infer owner scores. Patch deterministic QA-only values after confirming the
    // real pre-fix output is rejected, solely to exercise the downstream compiler path.
    canonicalQaScores.forEach((scores, rankIndex) => {
      const rank = rankIndex + 1;
      Object.entries(scores).forEach(([role, value]) => {
        const node = currentDoc.querySelector(`[data-report-field="comp-ranking.rank${rank}.${role}"]`);
        if (!node) throw new Error(`P12 QA repair field missing: rank${rank}.${role}`);
        node.textContent = value;
      });
    });

    const repairedExternal = `<!DOCTYPE html>\n${currentDoc.documentElement.outerHTML}`;
    const compiled = api.compileSemanticHtmlReportV5(repairedExternal, approvedBase, '코웨이');
    const compiledDoc = new DOMParser().parseFromString(compiled, 'text/html');
    const compiledFieldKeys = [...compiledDoc.querySelectorAll('[data-report-field]')]
      .map((element) => element.getAttribute('data-report-field') || '');
    const compiledArrow = compiledDoc.querySelector('#positioning .map-arrow-vector .map-arrow-line');

    return {
      raw: {
        pageCount: rawDoc.querySelectorAll('.full-slide').length,
        semanticFieldCount: rawFieldKeys.length,
        semanticUniqueCount: new Set(rawFieldKeys).size,
        p29Breadcrumb: rawBreadcrumb,
        p18Arrow: rawArrow ? {
          x1: rawArrow.getAttribute('x1'),
          y1: rawArrow.getAttribute('y1'),
          x2: rawArrow.getAttribute('x2'),
          y2: rawArrow.getAttribute('y2'),
        } : null,
        rawError,
      },
      compiled: {
        pageCount: compiledDoc.querySelectorAll('.full-slide').length,
        semanticFieldCount: compiledFieldKeys.length,
        semanticUniqueCount: new Set(compiledFieldKeys).size,
        unresolvedCount: (compiled.match(/\[\[(?:FIELD|POSITION):/g) || []).length,
        genericContentCount: compiledFieldKeys.filter((key) => /\.content\d+$/i.test(key)).length,
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
      },
    };
  }, { latestRawHtml, approvedBase, canonicalQaScores });

  assert.equal(regressionResult.raw.pageCount, 40);
  assert.equal(regressionResult.raw.semanticFieldCount, 757);
  assert.equal(regressionResult.raw.semanticUniqueCount, 757);
  assert.equal(regressionResult.raw.p29Breadcrumb, 'IV. CREATIVE > COMPETITOR HISTORY');
  assert.deepEqual(regressionResult.raw.p18Arrow, { x1: '36', y1: '47', x2: '82', y2: '17' });
  assert.match(regressionResult.raw.rawError, /검증에서 7건의 수정 필요 항목/);
  assert.match(regressionResult.raw.rawError, /comp-ranking\.rank1\.campaign/);
  assert.match(regressionResult.raw.rawError, /comp-ranking\.rank1\.inflection/);
  assert.match(regressionResult.raw.rawError, /comp-ranking\.rank1\.evidence/);
  assert.match(regressionResult.raw.rawError, /comp-ranking\.rank2\.inflection/);
  assert.match(regressionResult.raw.rawError, /comp-ranking\.rank2\.evidence/);
  assert.match(regressionResult.raw.rawError, /comp-ranking\.rank3\.evidence/);

  assert.equal(regressionResult.compiled.pageCount, 40);
  assert.equal(regressionResult.compiled.semanticFieldCount, 757);
  assert.equal(regressionResult.compiled.semanticUniqueCount, 757);
  assert.equal(regressionResult.compiled.unresolvedCount, 0);
  assert.equal(regressionResult.compiled.genericContentCount, 0);
  assert.equal(regressionResult.compiled.contentState, 'compiled');
  assert.equal(regressionResult.compiled.p29Breadcrumb, 'IV. CREATIVE > TARGET BRAND HISTORY');
  assert.deepEqual(regressionResult.compiled.p18Arrow, { x1: '38', y1: '46', x2: '48', y2: '84' });

  console.log(JSON.stringify({
    fixture: {
      sourceSha256: latestRawSha256,
      sourceBytes: latestRawBytes,
      pageCount: regressionResult.raw.pageCount,
      semanticFieldCount: regressionResult.raw.semanticFieldCount,
    },
    regressionResult,
  }, null, 2));
} finally {
  await browser.close();
}
