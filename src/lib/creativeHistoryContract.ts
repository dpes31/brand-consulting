import { getActiveCompetitorRegistry } from './competitorSelection';

export const CREATIVE_HISTORY_START = '<!-- CREATIVE_HISTORY_REGISTRY_START -->';
export const CREATIVE_HISTORY_END = '<!-- CREATIVE_HISTORY_REGISTRY_END -->';

export type CopyVerificationStatus = 'verified-verbatim' | 'source-found-copy-unverified' | 'not-found';

export interface CreativeHistoryEntry {
  year: number;
  campaignName: string;
  model: string;
  keyCopyVerbatim: string;
  copyStatus: CopyVerificationStatus;
  mediaFormat: string;
  appealStrategy: string;
  evidenceLabel: string;
}

export interface BrandCreativeHistory {
  brand: string;
  role: 'target' | 'competitor';
  entries: CreativeHistoryEntry[];
  messageTrajectory: string;
  strategicSoWhat: string;
}

export interface CreativeHistoryRegistry {
  version: 1;
  period: { startYear: number; endYear: number; currentYearYtd: number };
  brands: BrandCreativeHistory[];
}

function asObject(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null ? value as Record<string, unknown> : null;
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeStatus(value: unknown): CopyVerificationStatus {
  const status = asString(value);
  if (status === 'verified-verbatim' || status === 'source-found-copy-unverified' || status === 'not-found') return status;
  return 'not-found';
}

function extractRegistryBlock(text: string): string | null {
  const start = text.indexOf(CREATIVE_HISTORY_START);
  const end = text.indexOf(CREATIVE_HISTORY_END, start + CREATIVE_HISTORY_START.length);
  if (start < 0 || end <= start) return null;
  const block = text.slice(start + CREATIVE_HISTORY_START.length, end).replace(/```(?:json)?/gi, '').trim();
  const jsonStart = block.indexOf('{');
  const jsonEnd = block.lastIndexOf('}');
  if (jsonStart < 0 || jsonEnd <= jsonStart) return null;
  return block.slice(jsonStart, jsonEnd + 1);
}

export function expectedCreativeYears(currentYear = new Date().getFullYear()): number[] {
  return Array.from({ length: 6 }, (_, index) => currentYear - 5 + index);
}

function normalizeEntries(value: unknown, currentYear: number): CreativeHistoryEntry[] {
  if (!Array.isArray(value)) return [];
  const expected = new Set(expectedCreativeYears(currentYear));
  const byYear = new Map<number, CreativeHistoryEntry>();

  value.forEach((item) => {
    const object = asObject(item);
    if (!object) return;
    const year = Math.round(Number(object.year));
    if (!expected.has(year) || byYear.has(year)) return;

    byYear.set(year, {
      year,
      campaignName: asString(object.campaignName) || '캠페인명 공개 미확인',
      model: asString(object.model) || '모델 공개 미확인',
      keyCopyVerbatim: asString(object.keyCopyVerbatim) || (year === currentYear ? '신규 캠페인 공개 미확인' : '원문 카피 공개 미확인'),
      copyStatus: normalizeStatus(object.copyStatus),
      mediaFormat: asString(object.mediaFormat) || '매체/포맷 공개 미확인',
      appealStrategy: asString(object.appealStrategy) || '소구 전략 근거 미확인',
      evidenceLabel: asString(object.evidenceLabel) || '근거 미확인',
    });
  });

  return expectedCreativeYears(currentYear).map((year) => byYear.get(year)).filter(Boolean) as CreativeHistoryEntry[];
}

export function parseCreativeHistoryRegistry(text: string | null | undefined): CreativeHistoryRegistry | null {
  if (!text?.trim()) return null;
  const jsonText = extractRegistryBlock(text);
  if (!jsonText) return null;

  try {
    const parsed = asObject(JSON.parse(jsonText));
    const period = asObject(parsed?.period);
    const currentYear = Math.round(Number(period?.currentYearYtd || new Date().getFullYear()));
    if (!parsed || !Array.isArray(parsed.brands)) return null;

    const brands = parsed.brands.map((item) => {
      const object = asObject(item);
      if (!object) return null;
      const brand = asString(object.brand);
      const role = object.role === 'target' ? 'target' : object.role === 'competitor' ? 'competitor' : null;
      if (!brand || !role) return null;
      const entries = normalizeEntries(object.entries, currentYear);
      if (entries.length !== 6) return null;
      return {
        brand,
        role,
        entries,
        messageTrajectory: asString(object.messageTrajectory),
        strategicSoWhat: asString(object.strategicSoWhat),
      } satisfies BrandCreativeHistory;
    }).filter(Boolean) as BrandCreativeHistory[];

    const targetCount = brands.filter((item) => item.role === 'target').length;
    const competitorNames = getActiveCompetitorRegistry()?.selected.map((item) => item.name) ?? [];
    const historyCompetitors = brands.filter((item) => item.role === 'competitor').map((item) => item.brand);
    const allLockedCompetitorsPresent = competitorNames.length === 0
      || competitorNames.every((name) => historyCompetitors.includes(name));

    if (targetCount !== 1 || !allLockedCompetitorsPresent) return null;

    return {
      version: 1,
      period: {
        startYear: currentYear - 5,
        endYear: currentYear - 1,
        currentYearYtd: currentYear,
      },
      brands,
    };
  } catch (error) {
    console.warn('[Creative History Registry] parse failed', error);
    return null;
  }
}

export function buildCreativeHistoryResearchContract(targetBrand: string): string {
  const currentYear = new Date().getFullYear();
  const years = expectedCreativeYears(currentYear);
  const competitors = getActiveCompetitorRegistry()?.selected.map((item) => item.name) ?? [];
  const brands = [targetBrand, ...competitors];

  return `

[CREATIVE HISTORY DATA CONTRACT — 필수]
조사 대상 브랜드: ${brands.join(', ')}
조사 기간: ${years[0]}~${currentYear - 1} 완료연도 + ${currentYear} YTD

1. 각 브랜드별로 위 6개 연도를 빠짐없이 생성하십시오. 캠페인이 확인되지 않아도 연도 행을 삭제하지 마십시오.
2. keyCopyVerbatim에는 공식 영상·보도자료·브랜드 채널에서 실제 문구를 확인한 경우에만 정확한 원문을 입력하십시오.
3. 정확한 원문을 확인하지 못한 문구를 따옴표로 재구성하지 마십시오.
4. copyStatus 기준:
   - verified-verbatim: 실제 원문을 확인함
   - source-found-copy-unverified: 캠페인 존재는 확인했지만 정확한 카피 원문은 미확인
   - not-found: 캠페인 자체를 확인하지 못함
5. copyStatus가 verified-verbatim이 아니면 keyCopyVerbatim은 각각 '원문 카피 공개 미확인' 또는 '${currentYear} YTD 신규 캠페인 공개 미확인'처럼 사실 상태만 기록하십시오.
6. 모델명도 공식 근거가 없으면 '모델 공개 미확인'이라고 기록하십시오.
7. evidenceLabel에는 URL이 아니라 출처명·문서/영상명·연도만 기록하십시오.
8. 일반 분석을 먼저 작성한 뒤, 응답 맨 마지막에 아래 JSON을 출력하십시오.

${CREATIVE_HISTORY_START}
{
  "version": 1,
  "period": { "startYear": ${years[0]}, "endYear": ${currentYear - 1}, "currentYearYtd": ${currentYear} },
  "brands": [
    {
      "brand": "${targetBrand}",
      "role": "target",
      "entries": [
        {
          "year": ${years[0]},
          "campaignName": "캠페인명 또는 캠페인명 공개 미확인",
          "model": "모델명 또는 모델 공개 미확인",
          "keyCopyVerbatim": "실제 카피 원문 또는 원문 카피 공개 미확인",
          "copyStatus": "verified-verbatim",
          "mediaFormat": "TVC/OOH/디지털 등",
          "appealStrategy": "해당 연도의 소구 전략",
          "evidenceLabel": "출처명 · 자료명 · 연도"
        }
      ],
      "messageTrajectory": "6개년 메시지 변화",
      "strategicSoWhat": "조사 브랜드가 배워야 하거나 피해야 할 핵심"
    }
  ]
}
${CREATIVE_HISTORY_END}`;
}

export function buildCreativeHistoryDataDirective(rawData: string): string {
  const registry = parseCreativeHistoryRegistry(rawData);
  const currentYear = registry?.period.currentYearYtd ?? new Date().getFullYear();

  return `[CREATIVE HISTORY DATA CONTRACT]
- Step 4의 CREATIVE_HISTORY_REGISTRY를 Creative History 페이지의 유일한 사실 원천으로 사용하십시오.
- year1은 2021, year2는 2022, year3은 2023, year4는 2024, year5는 2025, year6은 2026 YTD를 의미합니다.
- 각 *.status 값은 verified-verbatim, source-found-copy-unverified, not-found 중 정확히 하나만 반환하십시오.
- status 값 안에 연도를 포함하지 마십시오. 예: "not-found"는 허용하지만 "2021 · not-found"는 허용하지 않습니다.
- HTML, CSS, 클래스명, 속성명, data-* 속성, 페이지 구조 또는 렌더링 구현 지시를 반환하지 마십시오.
- 각 연도에는 캠페인명, 모델, 실제 카피 원문 또는 미확인 문구, 매체/포맷, 소구 전략을 해당 field key에만 기록하십시오.
- verified-verbatim인 카피만 따옴표를 사용할 수 있습니다. source-found-copy-unverified와 not-found는 따옴표 없이 사실 상태만 기록하십시오.
- 현재연도 캠페인이 확인되지 않으면 '${currentYear} YTD 신규 캠페인 공개 미확인'을 사용하십시오.
- Message Trajectory와 Strategic So What은 지정된 별도 field에 각각 기록하십시오.
- URL은 노출하지 말고 evidenceLabel의 출처명·자료명·연도만 기록하십시오.
- 연도, 카드 순서, 상태별 표현과 따옴표 스타일은 애플리케이션 Renderer가 고정합니다.`;
}

export const buildCreativeHistoryCompilerDirective = buildCreativeHistoryDataDirective;

export interface CreativeHistoryValidation {
  valid: boolean;
  errors: string[];
}

export function validateCreativeHistoryPages(documentRef: Document): CreativeHistoryValidation {
  const errors: string[] = [];
  const currentYear = new Date().getFullYear();
  const expectedYears = expectedCreativeYears(currentYear).map(String);
  const pages = Array.from(documentRef.querySelectorAll<HTMLElement>('[data-page-kind="competitor-creative-history"]'));
  const lockedCompetitors = getActiveCompetitorRegistry()?.selected.map((item) => item.name) ?? [];

  lockedCompetitors.forEach((name) => {
    const page = pages.find((item) => item.dataset.competitor === name);
    if (!page) {
      errors.push(`${name}: Creative History 페이지 누락`);
      return;
    }
    const years = Array.from(page.querySelectorAll<HTMLElement>('[data-year]')).map((item) => item.dataset.year || '');
    expectedYears.forEach((year) => {
      if (!years.includes(year)) errors.push(`${name}: ${year} 연도 카드 누락`);
    });
  });

  pages.forEach((page) => {
    const cards = page.querySelectorAll<HTMLElement>('[data-year]');
    if (cards.length !== 6) errors.push(`${page.dataset.competitor || page.id}: 연도 카드 ${cards.length}개 (필수 6개)`);
    cards.forEach((card) => {
      const status = card.dataset.copyStatus;
      if (!status) errors.push(`${page.dataset.competitor || page.id}: ${card.dataset.year} copy-status 누락`);
    });
  });

  documentRef.documentElement.dataset.creativeHistoryValidation = errors.length === 0 ? 'valid' : 'warning';
  if (errors.length > 0) documentRef.documentElement.dataset.creativeHistoryErrors = errors.join(' | ');
  return { valid: errors.length === 0, errors };
}
