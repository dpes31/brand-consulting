import type { StructuredReportV3 } from './structuredReportV3';

export const THREAT_RANKING_SCORE_MAX = {
  penetration: 25,
  growth: 20,
  preference: 20,
  campaign: 15,
  inflection: 15,
  evidence: 5,
  total: 100,
} as const;

const COMPONENT_ROLES = [
  'penetration',
  'growth',
  'preference',
  'campaign',
  'inflection',
  'evidence',
] as const;

type ComponentRole = typeof COMPONENT_ROLES[number];

function pageField(report: StructuredReportV3, key: string): string {
  const page = report.pages.find((item) => item.id === 'comp-ranking');
  return page?.fields[key]?.trim() || '';
}

function parseCanonicalInteger(
  raw: string,
  key: string,
  max: number,
  errors: string[],
): number | null {
  if (!raw) return null;
  if (!/^(?:0|[1-9]\d*)$/.test(raw)) {
    errors.push(
      `P12 Threat Ranking · ${key}는 설명문·퍼센트·분수 없이 0~${max} 범위의 정수 점수만 허용한다. 현재 “${raw}”이다.`,
    );
    return null;
  }
  const score = Number(raw);
  if (!Number.isInteger(score) || score < 0 || score > max) {
    errors.push(`P12 Threat Ranking · ${key}는 0~${max} 범위여야 한다. 현재 ${raw}점이다.`);
    return null;
  }
  return score;
}

export function validateThreatRankingScoreContract(report: StructuredReportV3): string[] {
  const errors: string[] = [];
  const totals: Array<number | null> = [];

  for (let rank = 1; rank <= 3; rank += 1) {
    const componentScores = {} as Record<ComponentRole, number | null>;
    COMPONENT_ROLES.forEach((role) => {
      const key = `comp-ranking.rank${rank}.${role}`;
      componentScores[role] = parseCanonicalInteger(
        pageField(report, key),
        key,
        THREAT_RANKING_SCORE_MAX[role],
        errors,
      );
    });

    const totalKey = `comp-ranking.rank${rank}.total`;
    const total = parseCanonicalInteger(
      pageField(report, totalKey),
      totalKey,
      THREAT_RANKING_SCORE_MAX.total,
      errors,
    );
    totals.push(total);

    const components = COMPONENT_ROLES.map((role) => componentScores[role]);
    if (total !== null && components.every((score) => score !== null)) {
      const expectedTotal = (components as number[]).reduce((sum, score) => sum + score, 0);
      if (total !== expectedTotal) {
        errors.push(
          `P12 Threat Ranking · ${rank}위 총점은 6개 평가 점수의 합이어야 한다. 현재 ${total}점, 계산값 ${expectedTotal}점이다.`,
        );
      }
    }
  }

  if (totals.every((score) => score !== null)) {
    const [rank1, rank2, rank3] = totals as number[];
    if (rank1 < rank2 || rank2 < rank3) {
      errors.push(
        `P12 Threat Ranking · 순위와 총점이 역전됐다. 1위 ${rank1}점 / 2위 ${rank2}점 / 3위 ${rank3}점이다.`,
      );
    }
  }

  return errors;
}
