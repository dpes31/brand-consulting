import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const appUrl = process.env.PREVIEW_URL;
if (!appUrl) throw new Error('PREVIEW_URL is required.');

const brand = 'QA P4 생활케어';
const expectedArrows = ['→', '→', '→'];

function identity(name) {
  return { canonicalName: name, displayName: name, aliases: [name] };
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

  const runtimeArrows = await page.$$eval(
    '#kpi .kpi-logic > i[data-report-fixed="true"]',
    (nodes) => nodes.map((node) => (node.textContent || '').trim()),
  );
  assert.deepEqual(runtimeArrows, expectedArrows, 'Approved pilot P4 KPI flow must use three arrows.');

  const approvedBase = await page.evaluate(() => `<!DOCTYPE html>\n${document.documentElement.outerHTML}`);
  const legacyBase = await page.evaluate((html) => {
    const documentRef = new DOMParser().parseFromString(html, 'text/html');
    const arrows = documentRef.querySelectorAll('#kpi .kpi-logic > i[data-report-fixed="true"]');
    if (arrows.length !== 3) throw new Error(`Expected 3 P4 KPI arrows, found ${arrows.length}`);
    arrows[2].textContent = '?';
    return `<!DOCTYPE html>\n${documentRef.documentElement.outerHTML}`;
  }, approvedBase);

  await page.addScriptTag({ url: new URL('__phase6-identity-test.js', appUrl).toString() });
  const repaired = await page.evaluate(({ legacyBase, brand }) => {
    const api = window.Phase6Identity;
    if (!api?.sanitizeApprovedSampleBaseHtml || !api?.applyReportIdentityLockToExternalHtml) {
      throw new Error('Phase6Identity test API unavailable.');
    }

    const readArrows = (html) => {
      const documentRef = new DOMParser().parseFromString(html, 'text/html');
      return Array.from(documentRef.querySelectorAll('#kpi .kpi-logic > i[data-report-fixed="true"]'))
        .map((node) => (node.textContent || '').trim());
    };

    const sanitized = api.sanitizeApprovedSampleBaseHtml(legacyBase, brand);
    const lock = {
      version: 1,
      targetBrand: { canonicalName: brand, displayName: brand, aliases: [brand] },
      coreCompetitors: [
        { canonicalName: '알파케어', displayName: '알파케어', aliases: ['알파케어'] },
        { canonicalName: '베타홈', displayName: '베타홈', aliases: ['베타홈'] },
        { canonicalName: '감마라이프', displayName: '감마라이프', aliases: ['감마라이프'] },
      ],
      landscapeCandidates: [
        { canonicalName: '알파케어', displayName: '알파케어', aliases: ['알파케어'] },
        { canonicalName: '베타홈', displayName: '베타홈', aliases: ['베타홈'] },
        { canonicalName: '감마라이프', displayName: '감마라이프', aliases: ['감마라이프'] },
      ],
      reviewedNames: [brand, '알파케어', '베타홈', '감마라이프'],
      strategicOpponent: '관리 결과 비가시성',
    };
    const externalNormalized = api.applyReportIdentityLockToExternalHtml(legacyBase, lock);

    return {
      sanitizedArrows: readArrows(sanitized),
      externalArrows: readArrows(externalNormalized),
    };
  }, { legacyBase, brand });

  assert.deepEqual(repaired.sanitizedArrows, expectedArrows, 'Stored/cached approved base must auto-repair legacy P4 ? arrow.');
  assert.deepEqual(repaired.externalArrows, expectedArrows, 'External AI HTML must auto-repair legacy P4 ? arrow before DOM validation.');

  console.log(JSON.stringify({
    runtimeArrows,
    sanitizedArrows: repaired.sanitizedArrows,
    externalArrows: repaired.externalArrows,
  }, null, 2));
} finally {
  await browser.close();
}
