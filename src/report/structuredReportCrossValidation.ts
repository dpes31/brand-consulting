import type { StructuredReportV3 } from './structuredReportV3';

const STRUCTURAL_COMPETITOR_VALUES = new Set([
  'COMPETITOR',
  'RANK',
  'RANKING',
  'TOTAL',
  'SCORE',
  'PENETRATION',
  'GROWTH',
  'PREFERENCE',
  'CAMPAIGN',
  'INFLECTION',
  'EVIDENCE',
  '규모와 인지도',
  '평가 항목',
  '경쟁사',
  '순위',
  '총점',
]);

const CREATIVE_HISTORY_STATUS_VALUES = new Set([
  'verified-verbatim',
  'source-found-copy-unverified',
  'not-found',
]);

const RAW_URL_PATTERN = /(?:https?:\/\/|www\.)/i;

function page(report: StructuredReportV3, id: string) {
  return report.pages.find((item) => item.id === id);
}

function value(report: StructuredReportV3, pageId: string, key: string): string {
  return page(report, pageId)?.fields[key]?.trim() || '';
}

function normalized(input: string): string {
  return input.toLowerCase().replace(/[\s·,.'"“”‘’()[\]{}\-_/]/g, '');
}

function includesName(input: string, name: string): boolean {
  return Boolean(name) && normalized(input).includes(normalized(name));
}

function invalidCompetitorName(name: string): boolean {
  const token = name.replace(/\s+/g, ' ').trim();
  return !token
    || /^\d+(?:위|점)?$/.test(token)
    || /^[→↗⇒]+$/.test(token)
    || STRUCTURAL_COMPETITOR_VALUES.has(token.toUpperCase())
    || STRUCTURAL_COMPETITOR_VALUES.has(token);
}

function validateObjectiveFieldQuality(report: StructuredReportV3): string[] {
  const errors: string[] = [];

  report.pages.forEach((reportPage) => {
    Object.entries(reportPage.fields).forEach(([key, fieldValue]) => {
      const text = fieldValue.trim();
      if (!text) return;

      if (RAW_URL_PATTERN.test(text)) {
        errors.push(
          `P${reportPage.page} ${reportPage.id} · ${key}에 raw URL이 들어갔다. `
          + '발행처 · 자료명 · 연도 형식으로 바꿔야 한다.',
        );
      }

      if (key.endsWith('.status') && !CREATIVE_HISTORY_STATUS_VALUES.has(text)) {
        errors.push(
          `P${reportPage.page} ${reportPage.id} · ${key} 상태값 “${text}”은 허용되지 않는다. `
          + 'verified-verbatim / source-found-copy-unverified / not-found 중 하나여야 한다.',
        );
      }
    });
  });

  return errors;
}

export function validateStructuredReportCrossPage(report: StructuredReportV3): string[] {
  const errors: string[] = [...validateObjectiveFieldQuality(report)];
  const candidates = [1, 2, 3, 4, 5]
    .map((index) => value(report, 'comp-landscape', `comp-landscape.candidate${index}.name`))
    .filter(Boolean);
  const core = [1, 2, 3].map((index) => value(report, 'comp-ranking', `comp-ranking.rank${index}.name`));

  let rankingDamaged = false;
  core.forEach((name, index) => {
    const rank = index + 1;
    if (invalidCompetitorName(name)) {
      rankingDamaged = true;
      errors.push(
        `P12 Threat Ranking · ${rank}위 경쟁사명 필드에 경쟁사명이 아닌 “${name || '빈 값'}”이 들어갔다. `
        + '순위 숫자·평가 항목·설명 문구가 아니라 실제 경쟁사명을 입력해야 한다.',
      );
      return;
    }

    const summaryName = value(report, 'comp-ranking', `comp-ranking.rank${rank}.summaryName`);
    if (normalized(summaryName) !== normalized(name)) {
      rankingDamaged = true;
      errors.push(
        `P12 Threat Ranking · ${rank}위 하단 카드의 경쟁사명 “${summaryName || '빈 값'}”이 `
        + `표의 경쟁사명 “${name}”과 다르다.`,
      );
    }
  });

  if (rankingDamaged) return errors;

  if (new Set(core.map(normalized)).size !== 3) {
    errors.push('P12 Threat Ranking · 서로 다른 핵심 직접 경쟁사 3개를 선택해야 한다.');
  }
  core.forEach((name, index) => {
    if (!candidates.some((candidate) => normalized(candidate) === normalized(name))) {
      errors.push(`P12 Threat Ranking · ${index + 1}위 “${name}”은 P11 Competitive Landscape 후보에서 선택해야 한다.`);
    }
  });

  core.forEach((name, index) => {
    const rank = index + 1;
    const deepId = `deep-dive-${rank}`;
    if (!includesName(value(report, deepId, `${deepId}.title`), name)) {
      errors.push(`P${12 + rank} Deep Dive 제목에 P12 ${rank}위 경쟁사 “${name}”이 반영되지 않았다.`);
    }
    const matrixName = value(report, 'product-matrix', `product-matrix.column${rank + 1}.name`);
    if (normalized(matrixName) !== normalized(name)) {
      errors.push(`P16 Product Matrix · 경쟁사 ${rank} 열은 P12 ${rank}위 “${name}”이어야 한다.`);
    }
    const mapName = value(report, 'positioning', `positioning.competitor${rank}.name`);
    if (normalized(mapName) !== normalized(name)) {
      errors.push(`P18 Positioning · 경쟁사 ${rank} 표시는 P12 ${rank}위 “${name}”이어야 한다.`);
    }
    const historyId = `creative-history-${rank}`;
    if (!includesName(value(report, historyId, `${historyId}.title`), name)) {
      errors.push(`P${29 + rank} Creative History 제목에 P12 ${rank}위 “${name}”이 반영되지 않았다.`);
    }
    const trajectoryName = value(report, 'creative-trajectory', `creative-trajectory.brand${rank + 1}.name`);
    if (normalized(trajectoryName) !== normalized(name)) {
      errors.push(`P33 Message Trajectory · 경쟁사 ${rank}은 P12 ${rank}위 “${name}”이어야 한다.`);
    }
  });

  const matrixBrand = value(report, 'product-matrix', 'product-matrix.column1.name');
  if (normalized(matrixBrand) !== normalized(report.brand)) {
    errors.push(`P16 Product Matrix · 첫 번째 브랜드 열은 입력 브랜드명 “${report.brand}”이어야 한다.`);
  }
  const targetHistoryTitle = value(report, 'creative-history-target', 'creative-history-target.title');
  if (!includesName(targetHistoryTitle, report.brand)) {
    errors.push(`P29 Target Brand Creative History 제목에 입력 브랜드명 “${report.brand}”이 반영되지 않았다.`);
  }
  const trajectoryTarget = value(report, 'creative-trajectory', 'creative-trajectory.brand1.name');
  if (normalized(trajectoryTarget) !== normalized(report.brand)) {
    errors.push(`P33 Message Trajectory · 첫 번째 브랜드는 입력 브랜드명 “${report.brand}”이어야 한다.`);
  }

  [1, 2, 3, 4].forEach((index) => {
    const meaning = value(report, 'creative-trajectory', `creative-trajectory.brand${index}.meaning`);
    if (meaning.length > 22) errors.push(`P33 Message Trajectory · 브랜드 ${index}의 전략 의미는 22자 이하여야 한다.`);
  });

  const targetAsIs = value(report, 'positioning', 'positioning.targetAsIs');
  const targetToBe = value(report, 'positioning', 'positioning.targetToBe');
  if (!includesName(targetAsIs, report.brand) || !/AS[-\s]?IS/i.test(targetAsIs)) {
    errors.push(`P18 Positioning · 현재 위치 표시에 “${report.brand} AS-IS”가 포함돼야 한다.`);
  }
  if (!includesName(targetToBe, report.brand) || !/TO[-\s]?BE/i.test(targetToBe)) {
    errors.push(`P18 Positioning · 목표 위치 표시에 “${report.brand} TO-BE”가 포함돼야 한다.`);
  }

  ['A', 'B', 'C', 'D'].forEach((route) => {
    const proposition = value(report, 'strategy-routes', `strategy-routes.route${route}.proposition`);
    if (!proposition) errors.push(`P38 Four Strategic Directions · ${route}안의 전략 명제가 필요하다.`);
  });

  return errors;
}

export function assertStructuredReportCrossPage(report: StructuredReportV3): void {
  const errors = validateStructuredReportCrossPage(report);
  if (errors.length) {
    throw new Error(`페이지 간 일관성 검증 오류\n${errors.join('\n')}`);
  }
}
