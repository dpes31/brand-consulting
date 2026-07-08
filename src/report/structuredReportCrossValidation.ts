import type { StructuredReportV3 } from './structuredReportV3';

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

export function validateStructuredReportCrossPage(report: StructuredReportV3): string[] {
  const errors: string[] = [];
  const candidates = [1, 2, 3, 4, 5]
    .map((index) => value(report, 'comp-landscape', `comp-landscape.candidate${index}.name`))
    .filter(Boolean);
  const core = [1, 2, 3].map((index) => value(report, 'comp-ranking', `comp-ranking.rank${index}.name`));

  if (new Set(core.map(normalized)).size !== 3) errors.push('P12 Threat Ranking must select three unique core competitors.');
  core.forEach((name, index) => {
    if (!candidates.some((candidate) => normalized(candidate) === normalized(name))) {
      errors.push(`P12 rank ${index + 1} competitor must come from P11 Competitive Landscape.`);
    }
  });

  core.forEach((name, index) => {
    const deepId = `deep-dive-${index + 1}`;
    if (!includesName(value(report, deepId, `${deepId}.title`), name)) {
      errors.push(`P${13 + index} title must contain P12 rank ${index + 1} competitor ${name}.`);
    }
    const matrixName = value(report, 'product-matrix', `product-matrix.column${index + 2}.name`);
    if (normalized(matrixName) !== normalized(name)) {
      errors.push(`P16 matrix core competitor ${index + 1} must equal ${name}.`);
    }
    const mapName = value(report, 'positioning', `positioning.competitor${index + 1}.name`);
    if (normalized(mapName) !== normalized(name)) {
      errors.push(`P18 map competitor ${index + 1} must equal ${name}.`);
    }
    const historyId = `creative-history-${index + 1}`;
    if (!includesName(value(report, historyId, `${historyId}.title`), name)) {
      errors.push(`P${30 + index} Creative History title must contain ${name}.`);
    }
    const trajectoryName = value(report, 'creative-trajectory', `creative-trajectory.brand${index + 2}.name`);
    if (normalized(trajectoryName) !== normalized(name)) {
      errors.push(`P33 trajectory competitor ${index + 1} must equal ${name}.`);
    }
  });

  const matrixBrand = value(report, 'product-matrix', 'product-matrix.column1.name');
  if (normalized(matrixBrand) !== normalized(report.brand)) errors.push('P16 first brand column must be the exact target brand.');
  const targetHistoryTitle = value(report, 'creative-history-target', 'creative-history-target.title');
  if (!includesName(targetHistoryTitle, report.brand)) errors.push('P29 Target Brand Creative History title must contain the exact brand name.');
  const trajectoryTarget = value(report, 'creative-trajectory', 'creative-trajectory.brand1.name');
  if (normalized(trajectoryTarget) !== normalized(report.brand)) errors.push('P33 first trajectory row must be the exact target brand.');

  const targetAsIs = value(report, 'positioning', 'positioning.targetAsIs');
  const targetToBe = value(report, 'positioning', 'positioning.targetToBe');
  if (!includesName(targetAsIs, report.brand) || !/AS[-\s]?IS/i.test(targetAsIs)) errors.push('P18 target AS-IS label must contain the exact brand and AS-IS.');
  if (!includesName(targetToBe, report.brand) || !/TO[-\s]?BE/i.test(targetToBe)) errors.push('P18 target TO-BE label must contain the exact brand and TO-BE.');

  const routeIds = ['A', 'B', 'C', 'D'];
  routeIds.forEach((route) => {
    const proposition = value(report, 'strategy-routes', `strategy-routes.route${route}.proposition`);
    if (!proposition) errors.push(`P38 route ${route} proposition is required.`);
  });

  return errors;
}

export function assertStructuredReportCrossPage(report: StructuredReportV3): void {
  const errors = validateStructuredReportCrossPage(report);
  if (errors.length) {
    throw new Error(`페이지 간 일관성 검증 오류\n${errors.join('\n')}`);
  }
}
