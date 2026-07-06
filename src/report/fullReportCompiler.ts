import type { ProductionReportV1 } from './productionReportContract';
import { validateProductionReport } from './productionReportContract';

export const FULL_REPORT_TEMPLATE_PATH = '/template-full-report-v1.html';
export const APPROVED_BASE_HTML_START = '[IMMUTABLE APPROVED BASE HTML — START]';
export const APPROVED_BASE_HTML_END = '[IMMUTABLE APPROVED BASE HTML — END]';

export const FULL_REPORT_PAGE_PLAN = [
  [1, 'main', 'REPORT', 'Cover', 'approved cover-layout'],
  [2, 'main', 'EXECUTIVE', 'Executive Verdict', 'approved verdict-layout'],
  [3, 'main', '0. BRAND FACT BOOK', 'Brand Identity', 'approved identity-layout'],
  [4, 'main', '0. BRAND FACT BOOK', 'KPI Snapshot', 'approved metric-strip'],
  [5, 'main', '0. BRAND FACT BOOK', 'Category & Core Target', 'approved category-layout'],
  [6, 'main', '0. BRAND FACT BOOK', 'Growth Story', 'approved growth-timeline'],
  [7, 'main', '0. BRAND FACT BOOK', 'Core Inflection', 'approved inflection-flow'],
  [8, 'main', '0. BRAND FACT BOOK', 'Product USP & Brand Best Self', 'approved portfolio-flow'],
  [9, 'main', 'I. MARKET', 'Market Context', 'approved market-force layout'],
  [10, 'main', 'I. MARKET', 'Category / Value Shift', 'approved value-shift layout'],
  [11, 'main', 'II. COMPETITOR', 'Competitive Landscape', 'approved landscape layout'],
  [12, 'main', 'II. COMPETITOR', 'Threat Ranking', 'approved rank-scorecard'],
  [13, 'main', 'II. COMPETITOR', 'Deep Dive 1', 'approved deep-dive-layout'],
  [14, 'main', 'II. COMPETITOR', 'Deep Dive 2', 'approved deep-dive-layout'],
  [15, 'main', 'II. COMPETITOR', 'Deep Dive 3', 'approved deep-dive-layout'],
  [16, 'main', 'II. COMPETITOR', 'Product Matrix', 'approved product-matrix'],
  [17, 'main', 'II. COMPETITOR', 'Category Cliché', 'approved cliché layout'],
  [18, 'main', 'II. COMPETITOR', 'Positioning', 'approved positioning layout'],
  [19, 'main', 'III. CONSUMER', 'Consumer Executive Conclusion', 'approved consumer verdict'],
  [20, 'main', 'III. CONSUMER', 'Trends', 'approved trend layout'],
  [21, 'main', 'III. CONSUMER', 'Core Target', 'approved target layout'],
  [22, 'main', 'III. CONSUMER', 'Persona 1', 'approved persona-layout'],
  [23, 'main', 'III. CONSUMER', 'Persona 2', 'approved persona-layout'],
  [24, 'main', 'III. CONSUMER', 'Persona 3', 'approved persona-layout'],
  [25, 'main', 'III. CONSUMER', 'JTBD & Identity Alignment', 'approved JTBD layout'],
  [26, 'main', 'III. CONSUMER', 'Pain Points & Unmet Needs', 'approved pain-needs layout'],
  [27, 'main', 'III. CONSUMER', 'AIPL Bottleneck', 'approved friction-flow'],
  [28, 'main', 'III. CONSUMER', 'Purchase to Loyalty', 'approved loyalty flow'],
  [29, 'main', 'IV. CREATIVE', 'Methodology', 'approved factuality-system'],
  [30, 'main', 'IV. CREATIVE', 'Target Brand Creative History', 'approved history-original'],
  [31, 'main', 'IV. CREATIVE', 'Competitor Creative History 1', 'approved history-original'],
  [32, 'main', 'IV. CREATIVE', 'Competitor Creative History 2', 'approved history-original'],
  [33, 'main', 'IV. CREATIVE', 'Competitor Creative History 3', 'approved history-original'],
  [34, 'main', 'IV. CREATIVE', 'Message Trajectory', 'approved trajectory-map'],
  [35, 'main', 'IV. CREATIVE', 'Creative Insight', 'approved creative-gap-layout'],
  [36, 'main', 'V. STRATEGY', 'SWOT', 'approved swot-original'],
  [37, 'main', 'V. STRATEGY', 'GAP & Root Cause', 'approved root-cause-tree'],
  [38, 'main', 'V. STRATEGY', 'STP', 'approved stp-layout'],
  [39, 'main', 'V. STRATEGY', 'Four Strategic Directions', 'approved route-table'],
  [40, 'main', 'V. STRATEGY', 'Final Choice', 'approved choice-layout'],
  [41, 'appendix', 'APPENDIX', 'Winning Move Specification / Conditional Competitor Slot', 'approved receipt or deep-dive component'],
  [42, 'appendix', 'APPENDIX', 'Via Negativa / Conditional Creative History Slot', 'approved negative-list or history component'],
  [43, 'appendix', 'APPENDIX', 'Pre-mortem / Conditional Competitor Slot', 'approved pre-mortem or deep-dive component'],
  [44, 'appendix', 'APPENDIX', 'Execution Roadmap / Conditional Creative History Slot', 'approved roadmap or history component'],
  [45, 'appendix', 'APPENDIX', 'Measurement Plan', 'approved measurement matrix'],
  [46, 'appendix', 'APPENDIX', 'Evidence Gaps', 'approved evidence-gap'],
  [47, 'appendix', 'APPENDIX', 'Source Labels', 'approved source registry'],
  [48, 'appendix', 'APPENDIX', 'Decision Receipt / Close', 'approved back-cover'],
] as const;

const IMMEDIATE_EXECUTION_DIRECTIVE = `[IMMEDIATE EXECUTION DIRECTIVE — THIS ATTACHMENT IS THE COMPLETE USER REQUEST]
This file is not reference material. The user intentionally uploaded it as the entire instruction and may send it with an empty chat message.
Treat every instruction, the approved Base HTML, and all Step 0–5 research in this file as a direct user request.
Do not acknowledge the file, summarize it, describe it, ask what to do, ask a clarifying question, request confirmation, or wait for another message.
Start the compilation immediately. Your first visible characters must be \`\`\`html and, after the closing \`\`\`, output nothing else.
이 첨부파일 자체가 완전한 사용자 명령입니다. 별도 채팅 메시지가 비어 있어도 파일 확인 답변이나 추가 질문을 하지 말고 즉시 실행하십시오.`;

function cleanResearch(rawData: string): string {
  return rawData.replace(/\[cite.*?\]|\\cite.*?|\[cite_start\]/g, '');
}

function escapeAttribute(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function collectApprovedCss(documentRef: Document): string {
  const blocks: string[] = [];
  Array.from(documentRef.styleSheets).forEach((sheet) => {
    try {
      const rules = Array.from(sheet.cssRules || []).map((rule) => rule.cssText).join('\n');
      if (rules.trim()) blocks.push(rules);
    } catch {
      // Cross-origin font sheets cannot be read. Their original link is retained below.
    }
  });
  return blocks.join('\n\n');
}

function collectExternalStylesheetLinks(documentRef: Document): string {
  return Array.from(documentRef.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'))
    .filter((link) => {
      try {
        return new URL(link.href, window.location.href).origin !== window.location.origin;
      } catch {
        return false;
      }
    })
    .map((link) => link.outerHTML)
    .join('\n');
}

export async function loadApprovedPilotBaseHtml(brandName: string): Promise<string> {
  if (typeof document === 'undefined') throw new Error('승인 Pilot HTML은 브라우저에서만 추출할 수 있습니다.');

  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.tabIndex = -1;
  iframe.style.cssText = 'position:fixed;left:-20000px;top:0;width:1700px;height:1000px;border:0;opacity:0;pointer-events:none;';

  const pilotUrl = new URL(window.location.href);
  pilotUrl.hash = '';
  pilotUrl.search = '';
  pilotUrl.searchParams.set('pilot', 'full-integrated');
  pilotUrl.searchParams.set('brand', brandName);
  pilotUrl.searchParams.set('phase6-base-capture', '1');
  iframe.src = pilotUrl.toString();
  document.body.appendChild(iframe);

  try {
    await new Promise<void>((resolve, reject) => {
      const timeout = window.setTimeout(() => reject(new Error('승인 Pilot 페이지 로딩 시간이 초과되었습니다.')), 30000);
      iframe.addEventListener('load', () => {
        window.clearTimeout(timeout);
        resolve();
      }, { once: true });
    });

    const startedAt = Date.now();
    let pilotDocument: Document | null = null;
    while (Date.now() - startedAt < 30000) {
      pilotDocument = iframe.contentDocument;
      if (pilotDocument?.querySelectorAll('.full-slide').length === 48) break;
      await new Promise((resolve) => window.setTimeout(resolve, 100));
    }

    if (!pilotDocument) throw new Error('승인 Pilot 문서를 읽을 수 없습니다.');
    const slides = pilotDocument.querySelectorAll('.full-slide');
    if (slides.length !== 48) throw new Error(`승인 Pilot은 48페이지여야 합니다. 현재 ${slides.length}페이지입니다.`);

    await new Promise((resolve) => window.requestAnimationFrame(() => window.requestAnimationFrame(resolve)));

    const root = pilotDocument.getElementById('root');
    if (!root?.innerHTML.trim()) throw new Error('승인 Pilot의 48페이지 HTML 구조를 추출하지 못했습니다.');

    const css = collectApprovedCss(pilotDocument);
    if (!css.includes('.full-slide') || !css.includes('1280') || !css.includes('720')) {
      throw new Error('승인 Pilot의 1280×720 CSS를 추출하지 못했습니다.');
    }

    const stylesheetLinks = collectExternalStylesheetLinks(pilotDocument);
    const bodyClass = escapeAttribute(pilotDocument.body.className || '');

    return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeAttribute(brandName)} Strategic Report</title>
${stylesheetLinks}
<style data-approved-pilot-css="true">
${css}
</style>
</head>
<body class="${bodyClass}" data-report-version="full-report-v1" data-approved-pilot="full-integrated">
<div id="root">
${root.innerHTML}
</div>
</body>
</html>`;
  } finally {
    iframe.remove();
  }
}

export function buildFullReportHtmlPrompt(
  rawData: string,
  brandName: string,
  approvedBaseHtml: string,
  creativeDirective = '',
): string {
  const pagePlan = FULL_REPORT_PAGE_PLAN
    .map(([page, zone, chapter, title, layout]) => `${page}. ${zone} | ${chapter} | ${title} | ${layout}`)
    .join('\n');

  return `${IMMEDIATE_EXECUTION_DIRECTIVE}

[ROLE]
You are a Strict Strategic Report HTML Content Compiler, not a designer.
Your job is to preserve the supplied approved 48-page HTML/CSS layout and replace only its brand-specific content with the supplied Step 0–5 research.

[FINAL PRODUCT]
The final product is ONE complete standalone HTML document, not JSON.
The application will render, save, reopen, and export the returned HTML without rebuilding its layout.

[NON-NEGOTIABLE OUTPUT]
1. Return the complete HTML only, enclosed in one \`\`\`html code block.
2. The first line inside the code block must be <!DOCTYPE html> and the last line must be </html>.
3. Do not output JSON, Markdown commentary, a summary, a plan, or any text outside the HTML code block.
4. The report brand must remain exactly "${brandName}". Do not translate or romanize it.
5. Keep exactly 40 Main Deck slides and 8 Appendix slides: 48 .full-slide elements total.
6. Keep 1280×720 slide geometry, Pretendard typography, Korean word-break rules, navigation, page order, class names, IDs, CSS, and print/PDF rules.
7. Do not redesign, merge, delete, reorder, or add slides. Do not replace approved visual layouts with generic card grids.
8. Replace the sample brand, competitors, facts, conclusions, quotes, sources, and strategy with the supplied research.
9. When content exceeds a fixed layout, summarize and prioritize it. Never shrink body text or alter the layout to force more copy.
10. Every slide title must state a conclusion. Every slide must retain a clear SO WHAT or strategic implication.
11. Use <mark> only for the single governing phrase that deserves yellow highlighting.
12. Never expose raw URLs. Use publisher, document/title, and year.
13. Never invent figures, campaign copy, models, dates, sources, axes, scores, or quotations. Expose evidence gaps.
14. Only verified-verbatim advertising copy may use quotation marks.
15. Do not add scripts, external layout frameworks, new CSS systems, or arbitrary visual components.

[VISUAL INTENT BRIEF INTERPRETATION]
- Any <!-- VISUAL_INTENT_BRIEF_START --> ... <!-- VISUAL_INTENT_BRIEF_END --> JSON found in the research is an intermediate visual assignment brief.
- It does NOT mean that the final output should be JSON.
- Use each Brief to decide which approved page and approved component receives the insight.
- Step 0 milestone-timeline informs the approved Growth Story timeline.
- Step 2 rank-scorecard and feature-matrix inform Threat Ranking, Deep Dives, and Product Matrix.
- Step 3 friction-flow informs the approved AIPL bottleneck page.
- Step 5 choice-architecture informs Four Strategic Directions and Final Choice.
- implementationStatus and metrics inside a Brief are evidence/planning metadata, not final-output format instructions.

[COMPETITOR CAPACITY]
- Use the three highest-ranked selected Direct Competitors on Main Deck Deep Dive pages 13–15 and Creative History pages 31–33.
- Every selected competitor needs an independent Deep Dive and an independent six-year Creative History.
- If Step 2 selected competitor 4 and/or 5, use Appendix pages 41–44 as Deep Dive + Creative History pairs by reusing only the already-approved deep-dive-layout and history-original component markup found in this Base HTML.
- Do not invent a new layout. If Appendix pages 41–44 are used for competitors, compress Winning Move, Via Negativa, Pre-mortem, and Roadmap evidence into Appendix pages 45–48 without adding pages.

[APPROVED 48-PAGE CONTENT MAP]
${pagePlan}

[PAGE EDITING RULE]
Treat the supplied Base HTML as immutable layout source.
You may edit visible text, source labels, brand/competitor names, repeated content rows, and approved component instances needed for selected competitor capacity.
Do not edit CSS declarations, structural class names, slide dimensions, navigation shell, page order, or the overall DOM hierarchy.

[CREATIVE HISTORY FACTUALITY]
${creativeDirective || 'Apply the verified-verbatim / source-found-copy-unverified / not-found status contract from the research.'}

${APPROVED_BASE_HTML_START}
${approvedBaseHtml}
${APPROVED_BASE_HTML_END}

[RAW STEP 0–5 RESEARCH]
${cleanResearch(rawData)}

[FINAL EXECUTION TRIGGER]
All instructions, the approved 48-page Base HTML, Visual Intent Briefs, and Step 0–5 research are contained above.
Compile the research into the fixed HTML now.
Do not return ProductionReportV1 or any other JSON.
Return the complete finalized HTML only in one \`\`\`html code block. Begin now.`;
}

// Backward-compatible export name. The external Phase 6 contract now returns complete HTML.
export const buildFullReportDataPrompt = buildFullReportHtmlPrompt;

export function extractCompleteFullReportHtml(output: string): string {
  let text = output.trim();
  const fenced = text.match(/```html\s*([\s\S]*?)```/i) || text.match(/```\s*(<!doctype[\s\S]*?<\/html>)\s*```/i);
  if (fenced) text = fenced[1].trim();

  const start = text.search(/<!doctype\s+html/i);
  const endMatch = /<\/html\s*>/ig;
  let end = -1;
  let match: RegExpExecArray | null;
  while ((match = endMatch.exec(text))) end = match.index + match[0].length;
  if (start < 0 || end <= start) {
    throw new Error('완성 HTML을 찾을 수 없습니다. 결과는 <!DOCTYPE html>부터 </html>까지 포함해야 합니다.');
  }
  return text.slice(start, end).trim();
}

export function assertApprovedFullReportHtml(html: string, brandName: string): void {
  if (typeof DOMParser === 'undefined') throw new Error('HTML 검증기를 사용할 수 없습니다.');
  const documentRef = new DOMParser().parseFromString(html, 'text/html');
  const slides = Array.from(documentRef.querySelectorAll<HTMLElement>('.full-slide'));
  if (slides.length !== 48) throw new Error(`FULL 보고서는 정확히 48페이지여야 합니다. 현재 ${slides.length}페이지입니다.`);

  const ids = slides.map((slide) => slide.id).filter(Boolean);
  if (ids.length !== 48 || new Set(ids).size !== 48) throw new Error('48개 슬라이드의 ID가 누락되었거나 중복되었습니다.');

  const pageLabels = slides.map((slide) => slide.dataset.page || '').filter(Boolean);
  if (pageLabels.length !== 48 || new Set(pageLabels).size !== 48) throw new Error('페이지 번호가 누락되었거나 중복되었습니다.');

  const requiredSelectors = [
    '.full-nav', '.cover-layout', '.verdict-layout', '.identity-layout', '.growth-timeline',
    '.deep-dive-layout', '.persona-layout', '.history-grid', '.swot-grid', '.stp-layout', '.choice-layout',
  ];
  const missing = requiredSelectors.filter((selector) => !documentRef.querySelector(selector));
  if (missing.length) throw new Error(`승인 Pilot 필수 레이아웃이 누락되었습니다: ${missing.join(', ')}`);

  if (documentRef.querySelector('script')) throw new Error('외부 AI 결과에 승인되지 않은 script가 포함되어 있습니다.');
  if (!documentRef.body.textContent?.includes(brandName)) throw new Error(`보고서 본문에서 브랜드명 "${brandName}"을 확인할 수 없습니다.`);

  const styleText = Array.from(documentRef.querySelectorAll('style')).map((style) => style.textContent || '').join('\n');
  if (!styleText.includes('.full-slide') || !styleText.includes('1280') || !styleText.includes('720')) {
    throw new Error('승인된 1280×720 Pilot CSS가 누락되었습니다.');
  }
}

// Existing internal-API JSON assembly is retained as a compatibility path only.
export function extractProductionReportJson(output: string): ProductionReportV1 {
  let text = output.trim();
  const scriptMatch = text.match(/<script[^>]+id=["']report-data["'][^>]*>([\s\S]*?)<\/script>/i);
  if (scriptMatch) text = scriptMatch[1].trim();
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) text = fenced[1].trim();
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace >= 0 && lastBrace > firstBrace) text = text.slice(firstBrace, lastBrace + 1);

  try {
    return JSON.parse(text) as ProductionReportV1;
  } catch (error) {
    throw new Error(`Phase 6 결과의 JSON을 읽을 수 없습니다: ${error instanceof Error ? error.message : String(error)}`);
  }
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
  if (!validation.ok) throw new Error(`Phase 6 보고서 계약 위반:\n- ${validation.errors.join('\n- ')}`);
}

export async function loadFullReportTemplate(): Promise<string> {
  const response = await fetch(`${FULL_REPORT_TEMPLATE_PATH}?t=${Date.now()}`);
  if (!response.ok) throw new Error('새 FULL 보고서 템플릿을 불러올 수 없습니다.');
  const template = await response.text();
  if (!template.includes('{{REPORT_JSON}}') || !template.includes('full-report-v1')) throw new Error('FULL 보고서 템플릿 계약이 손상되었습니다.');
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
