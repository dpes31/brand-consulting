import type { ProductionReportV1 } from './productionReportContract';
import { validateProductionReport } from './productionReportContract';

export const FULL_REPORT_TEMPLATE_PATH = '/template-full-report-v1.html';

export const FULL_REPORT_PAGE_PLAN = [
  [1, 'main', 'REPORT', 'Cover', 'cover'],
  [2, 'main', '0. BRAND FACT BOOK', 'Executive Summary', 'structured-summary'],
  [3, 'main', '0. BRAND FACT BOOK', 'Brand Identity', 'structured-summary'],
  [4, 'main', '0. BRAND FACT BOOK', 'KPI Snapshot', 'metric-strip'],
  [5, 'main', '0. BRAND FACT BOOK', 'Category & Core Target', 'structured-summary'],
  [6, 'main', '0. BRAND FACT BOOK', 'Growth Story', 'milestone-timeline'],
  [7, 'main', '0. BRAND FACT BOOK', 'Core Inflection', 'causal-flow'],
  [8, 'main', '0. BRAND FACT BOOK', 'Product USP & Brand Best Self', 'structured-summary'],
  [9, 'main', 'I. MARKET', 'Market Context', 'structured-summary'],
  [10, 'main', 'I. MARKET', 'Category / Value Shift', 'causal-flow'],
  [11, 'main', 'II. COMPETITOR', 'Competitive Landscape', 'structured-summary'],
  [12, 'main', 'II. COMPETITOR', 'Threat Ranking', 'rank-scorecard'],
  [13, 'main', 'II. COMPETITOR', 'Deep Dive 1', 'causal-flow'],
  [14, 'main', 'II. COMPETITOR', 'Deep Dive 2', 'causal-flow'],
  [15, 'main', 'II. COMPETITOR', 'Deep Dive 3', 'causal-flow'],
  [16, 'main', 'II. COMPETITOR', 'Product Matrix', 'feature-matrix'],
  [17, 'main', 'II. COMPETITOR', 'Category Cliché', 'structured-summary'],
  [18, 'main', 'II. COMPETITOR', 'Positioning', 'as-is-to-be'],
  [19, 'main', 'III. CONSUMER', 'Consumer Executive Conclusion', 'structured-summary'],
  [20, 'main', 'III. CONSUMER', 'Trends', 'structured-summary'],
  [21, 'main', 'III. CONSUMER', 'Core Target', 'structured-summary'],
  [22, 'main', 'III. CONSUMER', 'Persona 1', 'persona'],
  [23, 'main', 'III. CONSUMER', 'Persona 2', 'persona'],
  [24, 'main', 'III. CONSUMER', 'Persona 3', 'persona'],
  [25, 'main', 'III. CONSUMER', 'Identity Alignment', 'as-is-to-be'],
  [26, 'main', 'III. CONSUMER', 'JTBD', 'structured-summary'],
  [27, 'main', 'III. CONSUMER', 'Pain Points & Unmet Needs', 'structured-summary'],
  [28, 'main', 'III. CONSUMER', 'AIPL Bottleneck', 'friction-flow'],
  [29, 'main', 'III. CONSUMER', 'Purchase to Loyalty', 'causal-flow'],
  [30, 'main', 'IV. CREATIVE', 'Methodology', 'structured-summary'],
  [31, 'main', 'IV. CREATIVE', 'Target Brand Creative History', 'creative-history'],
  [32, 'main', 'IV. CREATIVE', 'Competitor Creative History 1', 'creative-history'],
  [33, 'main', 'IV. CREATIVE', 'Competitor Creative History 2', 'creative-history'],
  [34, 'main', 'IV. CREATIVE', 'Competitor Creative History 3', 'creative-history'],
  [35, 'main', 'IV. CREATIVE', 'Message Trajectory', 'milestone-timeline'],
  [36, 'main', 'IV. CREATIVE', 'Creative Insight', 'causal-flow'],
  [37, 'main', 'V. STRATEGY', 'SWOT', 'swot'],
  [38, 'main', 'V. STRATEGY', 'GAP & Root Cause', 'root-cause-flow'],
  [39, 'main', 'V. STRATEGY', 'STP', 'stp-convergence'],
  [40, 'main', 'V. STRATEGY', 'Strategic Directions & Final Choice', 'choice-architecture'],
  [41, 'appendix', 'APPENDIX', 'Conditional Slot A', 'structured-summary'],
  [42, 'appendix', 'APPENDIX', 'Conditional Slot B', 'structured-summary'],
  [43, 'appendix', 'APPENDIX', 'Conditional Slot C', 'structured-summary'],
  [44, 'appendix', 'APPENDIX', 'Conditional Slot D', 'structured-summary'],
  [45, 'appendix', 'APPENDIX', 'Measurement Plan', 'feature-matrix'],
  [46, 'appendix', 'APPENDIX', 'Evidence Gaps', 'evidence-gap'],
  [47, 'appendix', 'APPENDIX', 'Source Labels', 'evidence-list'],
  [48, 'appendix', 'APPENDIX', 'Decision Receipt / Close', 'structured-summary'],
] as const;

const RECIPE_CONTRACT = `
[RECIPE DATA SHAPES]
- cover: kicker, subtitle
- structured-summary: sections[{label,headline,bullets[],tone?}]
- metric-strip: metrics[{label,value,period?,interpretation}]
- milestone-timeline: events[{period,title,detail,verified?}]
- causal-flow / friction-flow / as-is-to-be / root-cause-flow: nodes[{label,headline,detail?,tone?}]
- feature-matrix / rank-scorecard: columns[], rows[{label,cells[],emphasis?}]
- persona: persona{number,situation[],surfaceNeed,realJob,fears[],currentIdentity,desiredIdentity,brandRole}
- creative-history: brand, years[{year,campaign,copy,detail,status,source{publisher,title?,year?,status?}}], trajectory, strategicSoWhat
- swot: strength[], weakness[], opportunity[], threat[]
- stp-convergence: segments[{name,description,selected?}], target{name,description}, positioning{statement,proof[]}
- choice-architecture: options[{name,rationale,score?,selected?}], finalChoice{name,statement,reasons[]}
- roadmap / evidence-list / evidence-gap: items[{label,headline,detail?,status?,tone?}]
`;

export function buildFullReportDataPrompt(
  rawData: string,
  brandName: string,
  creativeDirective = '',
): string {
  const pagePlan = FULL_REPORT_PAGE_PLAN
    .map(([page, zone, chapter, title, recipe]) => `${page}. ${zone} | ${chapter} | ${title} | ${recipe}`)
    .join('\n');

  return `[ROLE]
You are the Phase 6 Strategic Report Compiler. Convert the complete Step 0–5 research into ONE validated JSON payload. The application, not the AI, owns the final HTML/CSS renderer.

[NON-NEGOTIABLE OUTPUT]
1. Return JSON only, enclosed in one \`\`\`json code block.
2. version must be "1.0.0".
3. brand must be exactly "${brandName}". Do not translate or romanize it.
4. mainSlides must contain exactly 40 slides, pages 1–40, zone "main".
5. appendixSlides must contain exactly 8 slides, pages 41–48, zone "appendix".
6. Every slide needs unique id, page, zone, chapter, title, recipe, implication, and sources[].
7. Use [[double brackets]] only around the one governing phrase that deserves yellow highlighting.
8. Never output raw URLs. Use publisher, document/title, and year.
9. Never invent figures, campaign copy, models, dates, sources, axes, or quotations. Expose evidence gaps.
10. Only verified verbatim advertising copy may be quoted.
11. Every page must state a clear conclusion and answer “So What?”. Avoid prose-only card walls when a timeline, matrix, causal flow, persona, STP, or choice structure is appropriate.
12. Keep body content concise enough for 1280×720. Do not solve density by shrinking text.

[COMPETITOR CAPACITY]
- The three highest-ranked selected competitors use Main Deck Deep Dive pages 13–15 and Creative History pages 32–34.
- If Step 2 selected competitor 4 and/or 5, use Appendix pages 41–44 as independent Deep Dive + Creative History pairs. Do not omit them.
- Any unused Appendix conditional slots become Winning Move, Via Negativa, Pre-mortem, or Execution Roadmap pages.

[PAGE PLAN]
${pagePlan}

${RECIPE_CONTRACT}

[CREATIVE HISTORY FACTUALITY]
${creativeDirective || 'Apply the verified-verbatim / source-found-copy-unverified / not-found status contract from the research.'}

[RAW STEP 0–5 RESEARCH]
${rawData.replace(/\[cite.*?\]|\\cite.*?|\[cite_start\]/g, '')}

Now return the complete ProductionReportV1 JSON only.`;
}

export function extractProductionReportJson(output: string): ProductionReportV1 {
  let text = output.trim();
  const scriptMatch = text.match(/<script[^>]+id=["']report-data["'][^>]*>([\s\S]*?)<\/script>/i);
  if (scriptMatch) text = scriptMatch[1].trim();
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) text = fenced[1].trim();
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace >= 0 && lastBrace > firstBrace) text = text.slice(firstBrace, lastBrace + 1);

  let parsed: ProductionReportV1;
  try {
    parsed = JSON.parse(text) as ProductionReportV1;
  } catch (error) {
    throw new Error(`Phase 6 결과의 JSON을 읽을 수 없습니다: ${error instanceof Error ? error.message : String(error)}`);
  }
  return parsed;
}

export function normalizeProductionReport(
  report: ProductionReportV1,
  brandName: string,
  accentColor?: string,
): ProductionReportV1 & { accentColor?: string } {
  return {
    ...report,
    brand: brandName.trim(),
    generatedAt: report.generatedAt || new Date().toISOString().slice(0, 10),
    ...(accentColor ? { accentColor } : {}),
  };
}

export function assertProductionReport(report: ProductionReportV1, brandName: string): void {
  const validation = validateProductionReport(report, brandName);
  if (!validation.ok) {
    throw new Error(`Phase 6 보고서 계약 위반:\n- ${validation.errors.join('\n- ')}`);
  }
}

export async function loadFullReportTemplate(): Promise<string> {
  const response = await fetch(`${FULL_REPORT_TEMPLATE_PATH}?t=${Date.now()}`);
  if (!response.ok) throw new Error('새 FULL 보고서 템플릿을 불러올 수 없습니다.');
  const template = await response.text();
  if (!template.includes('{{REPORT_JSON}}') || !template.includes('full-report-v1')) {
    throw new Error('FULL 보고서 템플릿 계약이 손상되었습니다.');
  }
  return template;
}

export function buildFullReportHtml(template: string, report: ProductionReportV1 & { accentColor?: string }): string {
  assertProductionReport(report, report.brand);
  const safeJson = JSON.stringify(report)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
  const html = template.replace('{{REPORT_JSON}}', safeJson);
  if (html.includes('{{REPORT_JSON}}')) throw new Error('FULL 보고서 데이터 주입에 실패했습니다.');
  return html;
}

export async function assembleFullReportHtml(
  output: string,
  brandName: string,
  accentColor?: string,
): Promise<string> {
  const parsed = extractProductionReportJson(output);
  const report = normalizeProductionReport(parsed, brandName, accentColor);
  assertProductionReport(report, brandName);
  const template = await loadFullReportTemplate();
  return buildFullReportHtml(template, report);
}
