export type UserBriefAttachment = {
  name: string;
  size: number;
  type: string;
};

export type UserBriefLock = {
  version: 1;
  targetBrand: string;
  mandatoryReviewSeeds: string[];
  strategicOpponent: string;
  clientNeed: string;
  referenceNote: string;
  attachments: UserBriefAttachment[];
};

const CURRENT_BRIEF_KEY = 'brand-consulting:user-brief-current';
const BRIEF_KEY_PREFIX = 'brand-consulting:user-brief:';
const LEGACY_KEYS = {
  brand: 'brand-consulting:brand-name',
  competitors: 'brand-consulting:competitor-seeds',
  clientNeeds: 'brand-consulting:client-needs',
  referenceNote: 'brand-consulting:reference-note',
} as const;

function safeSessionGet(key: string): string {
  try { return sessionStorage.getItem(key) || ''; } catch { return ''; }
}

function safeSessionSet(key: string, value: string): void {
  try { sessionStorage.setItem(key, value); } catch { /* state remains in the visible controls */ }
}

function safeLocalGet(key: string): string {
  try { return localStorage.getItem(key) || ''; } catch { return ''; }
}

function safeLocalSet(key: string, value: string): void {
  try { localStorage.setItem(key, value); } catch { /* local persistence is best-effort */ }
}

function normalizeLine(value: string): string {
  return value.replace(/^[\s\-•·*\d.)]+/, '').replace(/\s+/g, ' ').trim();
}

function unique(values: string[]): string[] {
  const result: string[] = [];
  const seen = new Set<string>();
  values.forEach((value) => {
    const clean = normalizeLine(value);
    const key = clean.toLocaleLowerCase('ko-KR');
    if (!clean || seen.has(key)) return;
    seen.add(key);
    result.push(clean);
  });
  return result;
}

export function parseCompetitorSetting(raw: string): {
  mandatoryReviewSeeds: string[];
  strategicOpponent: string;
} {
  const source = raw.trim();
  if (!source) return { mandatoryReviewSeeds: [], strategicOpponent: '' };

  const opponentParts: string[] = [];
  let seedSource = source.replace(/\(([^)]*(?:경쟁 상대|브랜드가 아니라|단어 자체|전략적 경쟁)[^)]*)\)/gi, (_match, inner) => {
    opponentParts.push(normalizeLine(inner));
    return ' ';
  });

  const seedParts: string[] = [];
  seedSource.split(/[\n,;]+/).forEach((part) => {
    const clean = normalizeLine(part);
    if (!clean) return;
    if (/(?:경쟁 상대|브랜드가 아니라|단어 자체|전략적 경쟁)/i.test(clean)) opponentParts.push(clean);
    else seedParts.push(clean);
  });

  return {
    mandatoryReviewSeeds: unique(seedParts),
    strategicOpponent: unique(opponentParts).join(' / '),
  };
}

function parseStored(value: string): UserBriefLock | null {
  if (!value.trim()) return null;
  try {
    const parsed = JSON.parse(value) as Partial<UserBriefLock>;
    if (!parsed || parsed.version !== 1) return null;
    return {
      version: 1,
      targetBrand: String(parsed.targetBrand || '').trim(),
      mandatoryReviewSeeds: unique(Array.isArray(parsed.mandatoryReviewSeeds) ? parsed.mandatoryReviewSeeds.map(String) : []),
      strategicOpponent: String(parsed.strategicOpponent || '').trim(),
      clientNeed: String(parsed.clientNeed || '').trim(),
      referenceNote: String(parsed.referenceNote || '').trim(),
      attachments: Array.isArray(parsed.attachments)
        ? parsed.attachments.map((item) => ({
            name: String(item?.name || '').trim(),
            size: Number(item?.size || 0),
            type: String(item?.type || '').trim(),
          })).filter((item) => item.name)
        : [],
    };
  } catch {
    return null;
  }
}

function briefKey(brandName: string): string {
  return `${BRIEF_KEY_PREFIX}${encodeURIComponent(brandName.trim())}`;
}

export function emptyUserBrief(targetBrand = ''): UserBriefLock {
  return {
    version: 1,
    targetBrand: targetBrand.trim(),
    mandatoryReviewSeeds: [],
    strategicOpponent: '',
    clientNeed: '',
    referenceNote: '',
    attachments: [],
  };
}

export function readUserBrief(targetBrand = ''): UserBriefLock {
  const brand = targetBrand.trim() || safeSessionGet(LEGACY_KEYS.brand).trim();
  const local = brand ? parseStored(safeLocalGet(briefKey(brand))) : null;
  const current = parseStored(safeSessionGet(CURRENT_BRIEF_KEY));
  const stored = local || (current?.targetBrand === brand || !brand ? current : null) || emptyUserBrief(brand);

  const legacyCompetitors = parseCompetitorSetting(safeSessionGet(LEGACY_KEYS.competitors));
  return {
    ...stored,
    targetBrand: brand || stored.targetBrand,
    mandatoryReviewSeeds: stored.mandatoryReviewSeeds.length
      ? stored.mandatoryReviewSeeds
      : legacyCompetitors.mandatoryReviewSeeds,
    strategicOpponent: stored.strategicOpponent || legacyCompetitors.strategicOpponent,
    clientNeed: stored.clientNeed || safeSessionGet(LEGACY_KEYS.clientNeeds).trim(),
    referenceNote: stored.referenceNote || safeSessionGet(LEGACY_KEYS.referenceNote).trim(),
  };
}

export function persistUserBrief(brief: UserBriefLock): UserBriefLock {
  const normalized: UserBriefLock = {
    version: 1,
    targetBrand: brief.targetBrand.trim(),
    mandatoryReviewSeeds: unique(brief.mandatoryReviewSeeds),
    strategicOpponent: brief.strategicOpponent.trim(),
    clientNeed: brief.clientNeed.trim(),
    referenceNote: brief.referenceNote.trim(),
    attachments: brief.attachments.filter((item) => item.name).map((item) => ({
      name: item.name.trim(),
      size: Number(item.size || 0),
      type: item.type.trim(),
    })),
  };
  const json = JSON.stringify(normalized);
  safeSessionSet(CURRENT_BRIEF_KEY, json);
  if (normalized.targetBrand) safeLocalSet(briefKey(normalized.targetBrand), json);
  return normalized;
}

export function mergeUserBrief(
  current: UserBriefLock,
  patch: Partial<UserBriefLock>,
): UserBriefLock {
  return persistUserBrief({
    ...current,
    ...patch,
    version: 1,
    mandatoryReviewSeeds: patch.mandatoryReviewSeeds ?? current.mandatoryReviewSeeds,
    attachments: patch.attachments ?? current.attachments,
  });
}

export function buildUserBriefPromptBlock(brief: UserBriefLock, step?: number): string {
  const lines = [
    '[LOCKED USER BRIEF — 사용자 원문 우선]',
    `targetBrand: ${brief.targetBrand || '미입력'}`,
    `mandatoryReviewSeeds: ${brief.mandatoryReviewSeeds.length ? brief.mandatoryReviewSeeds.join(' | ') : '없음'}`,
    `strategicOpponent: ${brief.strategicOpponent || '없음'}`,
    `clientNeed: ${brief.clientNeed || '없음'}`,
    `referenceNote: ${brief.referenceNote || '없음'}`,
    `attachments: ${brief.attachments.length ? brief.attachments.map((item) => item.name).join(' | ') : '없음'}`,
    '',
    '고정 규칙:',
    '1. targetBrand 철자를 모든 단계에서 그대로 유지한다.',
    '2. mandatoryReviewSeeds는 반드시 검토하되 Threat Ranking 결과에 따라 선정 여부를 판단한다.',
    '3. strategicOpponent는 브랜드 후보가 아니라 카테고리 관습·언어·인식 장벽으로 분석한다.',
    '4. clientNeed는 조사 결론을 왜곡하는 답정너가 아니라 최종 전략이 반드시 응답해야 할 과제 Constraint다.',
    '5. referenceNote와 attachment 목록은 이후 단계와 Phase 6에서 삭제하거나 누락하지 않는다.',
  ];

  if (step !== undefined) {
    lines.push('', `[STEP ${step} 적용 우선순위]`);
    if (step <= 1) lines.push('참고자료와 광고주 과제를 Fact Book·시장 조사 설계에 반영한다.');
    if (step === 2) lines.push('필수 후보와 strategicOpponent를 분리하고, 브랜드만 Threat Ranking 후보로 평가한다.');
    if (step === 3) lines.push('광고주 니즈와 strategicOpponent가 소비자 긴장·JTBD·AIPL에 미치는 영향을 검증한다.');
    if (step === 4) lines.push('참고자료에 포함된 광고 문법과 Creative History 근거를 활용하되 미검증 카피를 만들지 않는다.');
    if (step === 5) lines.push('clientNeed에 직접 응답하되 Step 0~4 근거와 충돌하면 caveat를 명시한다.');
  }
  return lines.join('\n');
}

export const EXTERNAL_AI_EXECUTION_MESSAGE = '첨부한 파일은 참고자료가 아니라 실행 지시문입니다. 파일 전체를 읽고 지금 즉시 완성된 40페이지 HTML만 생성하십시오.';
