import { parseCompetitorRegistry } from './competitorSelection';
import type { UserBriefLock } from './userBriefLock';
import {
  extractCompleteHtmlDocument,
  parseReportHtml,
  serializeReportDocument,
} from '../report/reportDomSafety';

export type LockedCompetitorIdentity = {
  rank: number;
  canonicalName: string;
  displayName: string;
  aliases: string[];
};

export type ReportIdentityLock = {
  version: 1;
  targetBrand: string;
  coreCompetitors: LockedCompetitorIdentity[];
};

const TEMPLATE_SAMPLE_TOKENS = ['비즈넵', 'BIZNUP', '삼쩜삼', '더낸세금', '혜움', 'SSEM', '쌤157'] as const;

function normalized(value: string): string {
  return value.toLocaleLowerCase('ko-KR').replace(/[^0-9a-z가-힣]/g, '');
}

function unique(values: string[]): string[] {
  const seen = new Set<string>();
  return values.filter((value) => {
    const key = normalized(value);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function nameAffinity(canonicalName: string, seed: string): number {
  const canonical = normalized(canonicalName);
  const candidate = normalized(seed);
  if (!canonical || !candidate) return 0;
  if (canonical === candidate) return 100;
  if (canonical.includes(candidate) || candidate.includes(canonical)) return 90;

  let prefix = 0;
  while (prefix < canonical.length && prefix < candidate.length && canonical[prefix] === candidate[prefix]) prefix += 1;
  if (prefix >= 3) return 70 + prefix;
  if (prefix >= 2) return 60 + prefix;

  const canonicalChunks = canonicalName.split(/[\s/·,()-]+/).map(normalized).filter((item) => item.length >= 2);
  const seedChunks = seed.split(/[\s/·,()-]+/).map(normalized).filter((item) => item.length >= 2);
  const overlap = canonicalChunks.filter((item) => seedChunks.some((other) => item === other || item.includes(other) || other.includes(item)));
  return overlap.length ? 40 + overlap.length : 0;
}

function bestSeed(canonicalName: string, seeds: string[]): string | null {
  return seeds
    .map((seed) => ({ seed, score: nameAffinity(canonicalName, seed) }))
    .filter((item) => item.score >= 40)
    .sort((a, b) => b.score - a.score || a.seed.length - b.seed.length)[0]?.seed || null;
}

export function buildReportIdentityLock(
  targetBrand: string,
  step2Research: string,
  brief: UserBriefLock,
): ReportIdentityLock {
  const registry = parseCompetitorRegistry(step2Research);
  if (!registry || registry.selected.length < 3) {
    throw new Error('Phase 6 Report Identity Lock을 만들 수 없다. Step 2 Registry에 순위가 확정된 직접 경쟁사 3개가 필요하다.');
  }

  const coreCompetitors = registry.selected.slice(0, 3).map((competitor, index) => {
    const matchedSeed = bestSeed(competitor.name, brief.mandatoryReviewSeeds);
    const aliases = unique([competitor.name, ...(matchedSeed ? [matchedSeed] : [])]);
    return {
      rank: index + 1,
      canonicalName: competitor.name,
      displayName: matchedSeed || competitor.name,
      aliases,
    };
  });

  return {
    version: 1,
    targetBrand: targetBrand.trim(),
    coreCompetitors,
  };
}

export function buildReportIdentityPromptBlock(identity: ReportIdentityLock): string {
  const lines = [
    '[REPORT IDENTITY LOCK — 앱 확정값, 변경 금지]',
    `targetBrand: ${identity.targetBrand}`,
    ...identity.coreCompetitors.flatMap((competitor) => [
      `coreCompetitor${competitor.rank}.canonicalName: ${competitor.canonicalName}`,
      `coreCompetitor${competitor.rank}.displayName: ${competitor.displayName}`,
      `coreCompetitor${competitor.rank}.aliases: ${competitor.aliases.join(' | ')}`,
    ]),
    '',
    '고정 규칙:',
    '1. P12 순위 1~3과 P13~18·P30~33의 경쟁사 순서와 표기는 위 displayName을 그대로 사용한다.',
    '2. targetBrand는 P16 첫 열, P29 제목, P33 첫 브랜드에 정확히 동일하게 사용한다.',
    '3. canonicalName과 aliases는 같은 경쟁 대상을 가리키는 검색·근거 식별용이며 새 경쟁사로 분리하지 않는다.',
    '4. 경쟁사명과 targetBrand를 축약·번역·상위 기업명·제품군명으로 임의 교체하지 않는다.',
  ];
  return lines.join('\n');
}

function setField(documentRef: Document, key: string, value: string): void {
  const node = documentRef.querySelector<HTMLElement>(`[data-report-field="${CSS.escape(key)}"]`);
  if (node) node.textContent = value;
}

function prefixField(documentRef: Document, key: string, prefix: string, aliases: string[]): void {
  const node = documentRef.querySelector<HTMLElement>(`[data-report-field="${CSS.escape(key)}"]`);
  if (!node) return;
  const current = (node.textContent || '').trim();
  if (aliases.some((alias) => normalized(current).includes(normalized(alias)))) return;
  node.textContent = current ? `${prefix} · ${current}` : prefix;
}

export function neutralizeApprovedTemplateBranding(source: string, targetBrand: string): string {
  const documentRef = parseReportHtml(source);
  const coverTag = documentRef.querySelector<HTMLElement>('#cover .full-tag');
  if (coverTag) coverTag.textContent = 'BRAND REPORT';

  const jtbdHeaders = Array.from(documentRef.querySelectorAll<HTMLElement>('#jtbd thead th'));
  const opportunityHeader = jtbdHeaders.at(-1);
  if (opportunityHeader && /비즈넵|BIZNUP/i.test(opportunityHeader.textContent || '')) {
    opportunityHeader.textContent = '브랜드 기회';
  }

  documentRef.querySelectorAll<HTMLElement>('.brand-role > span').forEach((node) => {
    node.textContent = `${targetBrand}의 역할`;
  });
  return serializeReportDocument(documentRef);
}

export function applyReportIdentityLockToExternalHtml(
  externalAiOutput: string,
  identity: ReportIdentityLock,
): string {
  const html = extractCompleteHtmlDocument(externalAiOutput);
  const documentRef = parseReportHtml(html);
  const target = identity.targetBrand;

  setField(documentRef, 'product-matrix.column1.name', target);
  setField(documentRef, 'creative-trajectory.brand1.name', target);
  setField(documentRef, 'creative-history-target.title', `${target} Creative History`);

  identity.coreCompetitors.forEach((competitor) => {
    const rank = competitor.rank;
    const display = competitor.displayName;
    setField(documentRef, `comp-ranking.rank${rank}.name`, display);
    setField(documentRef, `comp-ranking.rank${rank}.summaryName`, display);
    prefixField(documentRef, `deep-dive-${rank}.title`, display, competitor.aliases);
    setField(documentRef, `product-matrix.column${rank + 1}.name`, display);
    setField(documentRef, `positioning.competitor${rank}.name`, display);
    setField(documentRef, `creative-history-${rank}.title`, `${display} Creative History`);
    setField(documentRef, `creative-trajectory.brand${rank + 1}.name`, display);
  });

  return serializeReportDocument(documentRef);
}

function identityAllowsToken(identity: ReportIdentityLock, token: string): boolean {
  const permitted = [
    identity.targetBrand,
    ...identity.coreCompetitors.flatMap((competitor) => [
      competitor.canonicalName,
      competitor.displayName,
      ...competitor.aliases,
    ]),
  ];
  return permitted.some((value) => normalized(value).includes(normalized(token)) || normalized(token).includes(normalized(value)));
}

export function assertNoTemplateBrandLeakage(html: string, identity: ReportIdentityLock): void {
  const documentRef = parseReportHtml(html);
  const visibleText = documentRef.body.textContent || '';
  const leaked = TEMPLATE_SAMPLE_TOKENS.filter((token) => visibleText.includes(token) && !identityAllowsToken(identity, token));
  if (leaked.length) {
    throw new Error(`승인 샘플 브랜드 문구가 최종 보고서에 남았다: ${leaked.join(', ')}. Report Identity Lock에 없는 샘플 문구는 사용할 수 없다.`);
  }
}

export function normalizeIdentityError(error: unknown, targetBrand: string): Error {
  const message = error instanceof Error ? error.message : String(error);
  return new Error(message.replace(/비즈넵 AS-IS와 TO-BE/g, `${targetBrand} AS-IS와 TO-BE`));
}
