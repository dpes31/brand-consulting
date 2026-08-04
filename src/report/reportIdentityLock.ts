import type { CompetitorRegistry, SelectedCompetitor } from '../lib/competitorSelection';
import type { UserBriefLock } from '../lib/userBriefContract';
import {
  extractCompleteHtmlDocument,
  parseReportHtml,
  serializeReportDocument,
} from './reportDomSafety';

export interface ReportIdentityEntity {
  canonicalName: string;
  displayName: string;
  aliases: string[];
}

export interface ReportIdentityLock {
  version: 1;
  targetBrand: ReportIdentityEntity;
  coreCompetitors: [ReportIdentityEntity, ReportIdentityEntity, ReportIdentityEntity];
  landscapeCandidates: ReportIdentityEntity[];
  reviewedNames: string[];
  strategicOpponent: string;
}

const SAMPLE_IDENTITIES = [
  '비즈넵',
  'BIZNUP',
  '삼쩜삼',
  '더낸세금',
  '혜움',
  'SSEM',
  '쌤157',
] as const;

function clean(value: string | null | undefined): string {
  return (value || '').replace(/\s+/g, ' ').trim();
}

function normalized(value: string): string {
  return clean(value).toLocaleLowerCase('ko-KR').replace(/[^a-z0-9가-힣]/g, '');
}

function dedupe(values: string[]): string[] {
  const seen = new Set<string>();
  return values.map(clean).filter((value) => {
    const key = normalized(value);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function longestCommonPrefix(first: string, second: string): number {
  const a = normalized(first);
  const b = normalized(second);
  let index = 0;
  while (index < a.length && index < b.length && a[index] === b[index]) index += 1;
  return index;
}

function looksLikeSameEntity(first: string, second: string): boolean {
  const a = normalized(first);
  const b = normalized(second);
  if (!a || !b) return false;
  if (a === b || a.includes(b) || b.includes(a)) return true;
  return longestCommonPrefix(first, second) >= 2;
}

function selectedAliases(
  competitor: SelectedCompetitor,
  mandatorySeeds: string[],
): string[] {
  const sourceAliases = Array.isArray((competitor as SelectedCompetitor & { aliases?: unknown }).aliases)
    ? ((competitor as SelectedCompetitor & { aliases?: string[] }).aliases || [])
    : [];
  const matchedSeeds = mandatorySeeds.filter((seed) => looksLikeSameEntity(seed, competitor.name));
  return dedupe([competitor.name, ...sourceAliases, ...matchedSeeds]);
}

function entityFromSelected(
  competitor: SelectedCompetitor,
  mandatorySeeds: string[],
): ReportIdentityEntity {
  return {
    canonicalName: clean(competitor.name),
    displayName: clean(competitor.name),
    aliases: selectedAliases(competitor, mandatorySeeds),
  };
}

function entityFromSeed(name: string): ReportIdentityEntity {
  const value = clean(name);
  return { canonicalName: value, displayName: value, aliases: [value] };
}

export function buildReportIdentityLock(
  targetBrand: string,
  registry: CompetitorRegistry | null,
  brief: UserBriefLock,
): ReportIdentityLock {
  const brand = clean(targetBrand || brief.targetBrand);
  if (!brand) throw new Error('Report Identity Lock을 만들 수 없다. 입력 브랜드명이 비어 있다.');

  const selected = registry?.selected || [];
  const fallback = brief.mandatoryReviewSeeds.map((name, index) => ({
    rank: index + 1,
    name,
    threatScore: 0,
    userSpecified: true,
    selectionReason: '사용자 지정 필수 검토 후보',
    evidenceSignals: [],
  } satisfies SelectedCompetitor));
  const identitySource = selected.length >= 3 ? selected : fallback;
  if (identitySource.length < 3) {
    throw new Error('Phase 6 Report Identity Lock에는 Step 2에서 확정된 핵심 직접 경쟁사 3개가 필요하다.');
  }

  const selectedEntities = identitySource.slice(0, 5)
    .map((item) => entityFromSelected(item, brief.mandatoryReviewSeeds));
  const reviewedEntities = (registry?.reviewedCandidates || [])
    .map((item) => entityFromSeed(item.name));
  const seedEntities = brief.mandatoryReviewSeeds.map(entityFromSeed);
  const candidateMap = new Map<string, ReportIdentityEntity>();
  [...selectedEntities, ...reviewedEntities, ...seedEntities].forEach((entity) => {
    const key = normalized(entity.canonicalName);
    if (key && !candidateMap.has(key)) candidateMap.set(key, entity);
  });

  const core = selectedEntities.slice(0, 3);
  return {
    version: 1,
    targetBrand: {
      canonicalName: brand,
      displayName: brand,
      aliases: [brand],
    },
    coreCompetitors: [core[0], core[1], core[2]],
    landscapeCandidates: Array.from(candidateMap.values()).slice(0, 5),
    reviewedNames: dedupe([
      brand,
      ...selectedEntities.flatMap((item) => item.aliases),
      ...reviewedEntities.flatMap((item) => item.aliases),
      ...seedEntities.flatMap((item) => item.aliases),
    ]),
    strategicOpponent: clean(brief.strategicOpponent),
  };
}

export function buildReportIdentityPromptBlock(lock: ReportIdentityLock): string {
  const competitors = lock.coreCompetitors.map((entity, index) => (
    `${index + 1}. displayName=${entity.displayName} | canonicalName=${entity.canonicalName} | aliases=${entity.aliases.join(' / ')}`
  )).join('\n');
  return `[REPORT IDENTITY LOCK — START]
이 블록의 브랜드·경쟁사 식별값은 앱이 소유하는 고정값입니다. 외부 AI가 축약·번역·대체할 수 없습니다.
- targetBrand.displayName: ${lock.targetBrand.displayName}
- targetBrand.canonicalName: ${lock.targetBrand.canonicalName}
- targetBrand.aliases: ${lock.targetBrand.aliases.join(' / ')}
- coreCompetitors in fixed rank order:
${competitors}
- strategicOpponent / categoryConvention: ${lock.strategicOpponent || '미입력'}

고정 적용 페이지:
- P11 후보 1~3
- P12 Threat Ranking 1~3위
- P13~15 Deep Dive 제목
- P16 Product Matrix 브랜드·경쟁사 열
- P18 Positioning 브랜드·경쟁사 표시
- P29~32 Creative History 제목
- P33 Message Trajectory 브랜드명

별칭은 동일 대상을 이해하기 위한 참조일 뿐, 최종 표시에는 displayName을 정확히 사용하십시오.
strategicOpponent는 기업 경쟁사명이 아니므로 Registry나 브랜드 열에 넣지 마십시오.
[REPORT IDENTITY LOCK — END]`;
}

function setField(documentRef: Document, key: string, value: string): void {
  const element = documentRef.querySelector<HTMLElement>(`[data-report-field="${CSS.escape(key)}"]`);
  if (element) element.textContent = value;
}

function fieldText(documentRef: Document, key: string): string {
  return clean(documentRef.querySelector<HTMLElement>(`[data-report-field="${CSS.escape(key)}"]`)?.textContent);
}

function replaceKnownAlias(value: string, entity: ReportIdentityEntity): string {
  let result = clean(value);
  for (const alias of entity.aliases.sort((a, b) => b.length - a.length)) {
    if (!alias) continue;
    const index = result.toLocaleLowerCase('ko-KR').indexOf(alias.toLocaleLowerCase('ko-KR'));
    if (index >= 0) {
      result = `${result.slice(0, index)}${entity.displayName}${result.slice(index + alias.length)}`;
      return result;
    }
  }
  return result;
}

function lockedTitle(value: string, entity: ReportIdentityEntity, fallbackSuffix: string): string {
  const replaced = replaceKnownAlias(value, entity);
  if (entity.aliases.some((alias) => normalized(replaced).includes(normalized(alias)))) return replaced;
  return replaced ? `${entity.displayName} · ${replaced}` : `${entity.displayName} ${fallbackSuffix}`;
}

function normalizePositioningLabel(value: string, brand: string, mode: 'AS-IS' | 'TO-BE'): string {
  const required = `${brand} ${mode}`;
  const raw = clean(value);
  const withoutPrefix = raw
    .replace(new RegExp(`^${brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*`, 'i'), '')
    .replace(new RegExp(`^${mode.replace('-', '[-\\s]?')}\\s*[·:—-]*\\s*`, 'i'), '')
    .trim();
  return withoutPrefix ? `${required} · ${withoutPrefix}` : required;
}

function applyIdentityFields(documentRef: Document, lock: ReportIdentityLock): void {
  const brand = lock.targetBrand.displayName;
  setField(documentRef, 'product-matrix.column1.name', brand);
  setField(documentRef, 'creative-history-target.title', `${brand} Creative History`);
  setField(documentRef, 'creative-trajectory.brand1.name', brand);
  setField(
    documentRef,
    'positioning.targetAsIs',
    normalizePositioningLabel(fieldText(documentRef, 'positioning.targetAsIs'), brand, 'AS-IS'),
  );
  setField(
    documentRef,
    'positioning.targetToBe',
    normalizePositioningLabel(fieldText(documentRef, 'positioning.targetToBe'), brand, 'TO-BE'),
  );

  lock.landscapeCandidates.slice(0, 5).forEach((entity, index) => {
    setField(documentRef, `comp-landscape.candidate${index + 1}.name`, entity.displayName);
  });
  for (let index = lock.landscapeCandidates.length; index < 5; index += 1) {
    setField(documentRef, `comp-landscape.candidate${index + 1}.name`, '추가 후보 없음');
  }

  lock.coreCompetitors.forEach((entity, index) => {
    const rank = index + 1;
    setField(documentRef, `comp-ranking.rank${rank}.name`, entity.displayName);
    setField(documentRef, `comp-ranking.rank${rank}.summaryName`, entity.displayName);
    setField(
      documentRef,
      `deep-dive-${rank}.title`,
      lockedTitle(fieldText(documentRef, `deep-dive-${rank}.title`), entity, 'Deep Dive'),
    );
    setField(documentRef, `product-matrix.column${rank + 1}.name`, entity.displayName);
    setField(documentRef, `positioning.competitor${rank}.name`, entity.displayName);
    setField(documentRef, `creative-history-${rank}.title`, `${entity.displayName} Creative History`);
    setField(documentRef, `creative-trajectory.brand${rank + 1}.name`, entity.displayName);
  });
}

function neutralizeFixedSampleLabels(documentRef: Document, brandName: string): void {
  const coverTag = documentRef.querySelector<HTMLElement>('#cover .full-tag');
  if (coverTag) coverTag.textContent = 'BRAND REPORT';
  const jtbdOpportunity = documentRef.querySelector<HTMLElement>('#jtbd thead th:last-child');
  if (jtbdOpportunity) jtbdOpportunity.textContent = '브랜드 기회';
  documentRef.querySelectorAll<HTMLElement>('.brand-role > span').forEach((node) => {
    node.textContent = `${brandName}의 역할`;
  });
  const navBrand = documentRef.querySelector<HTMLElement>('.full-nav-brand');
  if (navBrand) {
    navBrand.replaceChildren(documentRef.createTextNode(brandName));
    const version = documentRef.createElement('span');
    version.textContent = 'FULL REPORT V3';
    navBrand.appendChild(version);
  }
  const toolbar = documentRef.querySelector<HTMLElement>('.full-report-toolbar strong');
  if (toolbar) toolbar.textContent = `${brandName} FULL REPORT`;
  documentRef.title = `${brandName} Strategic Report`;
}

export function sanitizeApprovedSampleBaseHtml(
  approvedBaseHtml: string,
  brandName: string,
): string {
  const documentRef = parseReportHtml(approvedBaseHtml);
  neutralizeFixedSampleLabels(documentRef, brandName);
  return serializeReportDocument(documentRef);
}

export function applyReportIdentityLockToExternalHtml(
  externalAiOutput: string,
  lock: ReportIdentityLock,
): string {
  const html = extractCompleteHtmlDocument(externalAiOutput);
  const documentRef = parseReportHtml(html);
  neutralizeFixedSampleLabels(documentRef, lock.targetBrand.displayName);
  applyIdentityFields(documentRef, lock);
  return serializeReportDocument(documentRef);
}

function identityAllowsSample(lock: ReportIdentityLock, sample: string): boolean {
  const names = [
    lock.targetBrand.displayName,
    ...lock.targetBrand.aliases,
    ...lock.coreCompetitors.flatMap((entity) => [entity.displayName, ...entity.aliases]),
    ...lock.reviewedNames,
  ];
  if (sample === 'BIZNUP' && names.some((name) => normalized(name).includes(normalized('비즈넵')))) return true;
  return names.some((name) => {
    const left = normalized(name);
    const right = normalized(sample);
    return left === right || left.includes(right) || right.includes(left);
  });
}

export function assertNoTemplateIdentityLeakage(
  documentRef: Document,
  lock: ReportIdentityLock,
): void {
  const visibleText = clean(documentRef.body.textContent);
  const leaked = SAMPLE_IDENTITIES.filter((sample) => {
    if (identityAllowsSample(lock, sample)) return false;
    return visibleText.toLocaleLowerCase('ko-KR').includes(sample.toLocaleLowerCase('ko-KR'));
  });
  if (leaked.length) {
    throw new Error(`승인 샘플 브랜드가 최종 보고서에 남았다: ${leaked.join(', ')}`);
  }
}

export function applyFinalReportIdentityPolicy(
  compiledHtml: string,
  lock: ReportIdentityLock,
): string {
  const documentRef = parseReportHtml(extractCompleteHtmlDocument(compiledHtml));
  neutralizeFixedSampleLabels(documentRef, lock.targetBrand.displayName);
  applyIdentityFields(documentRef, lock);
  assertNoTemplateIdentityLeakage(documentRef, lock);
  documentRef.body.dataset.reportIdentityLock = 'v1';
  return serializeReportDocument(documentRef);
}
