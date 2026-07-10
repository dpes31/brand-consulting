import { addResearchSlotRules } from './researchSlotPrompt';

const PAGE_MAP = [
  '01 Cover',
  '02 Executive Verdict',
  '03 Brand Identity',
  '04 Brand Facts',
  '05 Category & Target',
  '06 Growth Story',
  '07 Core Inflection',
  '08 Product USP & Brand Best Self',
  '09 Market Context',
  '10 Category Shift',
  '11 Competitive Landscape',
  '12 Threat Ranking — core three',
  '13 Deep Dive 1',
  '14 Deep Dive 2',
  '15 Deep Dive 3',
  '16 Product Matrix',
  '17 Category Clichés',
  '18 Positioning',
  '19 Consumer Executive Conclusion',
  '20 Consumer Trends',
  '21 Core Target',
  '22 Persona 1',
  '23 Persona 2',
  '24 Persona 3',
  '25 Identity Alignment & JTBD',
  '26 Pain Points & Unmet Needs',
  '27 AIPL Bottleneck',
  '28 Purchase to Loyalty',
  '29 Creative History Method',
  '30 Target Brand Creative History',
  '31 Competitor Creative History 1',
  '32 Competitor Creative History 2',
  '33 Competitor Creative History 3',
  '34 Message Trajectory',
  '35 Creative Insight',
  '36 SWOT',
  '37 GAP & Root Cause',
  '38 STP',
  '39 Four Strategic Directions',
  '40 Final Choice',
  'A1 Winning Move Specification',
  'A2 Via Negativa',
  'A3 Pre-mortem',
  'A4 Execution Roadmap',
  'A5 Measurement Plan',
  'A6 Evidence Gaps',
  'A7 Source Labels',
  'A8 Brand Principle / Close',
] as const;

function cleanResearch(rawData: string): string {
  return rawData.replace(/\[cite.*?\]|\\cite.*?|\[cite_start\]/g, '');
}

export function buildApprovedHtmlCompilationPrompt(
  rawData: string,
  brandName: string,
  semanticTemplateHtml: string,
  creativeDirective = '',
): string {
  const prompt = `[IMMEDIATE EXECUTION DIRECTIVE]
This file is the complete user request. Start immediately. Do not acknowledge, summarize, plan, or ask a question.
Your first visible characters must be \`\`\`html and nothing may appear after the closing code fence.

[ROLE]
You are a senior strategy consultant and a strict HTML content compiler.
You are not a designer. The application already owns the approved consulting layout.

[FINAL PRODUCT]
Return one complete standalone HTML report, not JSON.
The user will paste this HTML into Phase 6, where the application will sanitize it, verify every semantic field, preserve the approved layout, save it, reopen it, and export PDF.

[APPROVED PRODUCT CONTRACT]
- Exact brand spelling: ${brandName}
- Main Deck: exactly 40 pages
- Appendix: exactly 8 pages
- Total: exactly 48 .full-slide elements
- Slide canvas: 1280×720, exact 16:9
- Approved sample DOM, CSS, IDs, classes, navigation, tables, diagrams, fixed labels, and page order are immutable.
- Do not add, remove, merge, reorder, redesign, or rebuild a page.
- Do not convert the approved consulting diagrams into generic cards or prose blocks.
- Keep body copy readable. Summarize to the field max length instead of shrinking text.

[APPROVED PAGE MAP]
${PAGE_MAP.join('\n')}

[STRATEGIC QUALITY]
- Define the actual business problem before proposing language.
- Build one logic chain: Brand Fact → Market/Competitor → Consumer tension → Creative gap → Root Cause → STP → Four Routes → Final Choice → Brand Principle.
- Use plain, decision-ready Korean. Avoid unexplained jargon, translated-sounding phrases, and decorative abstractions.
- Every page title must state a judgment. Every SO WHAT must state the decision, consequence, or required action.
- Prefer parallel visual phrases and clear relationships over long paragraphs.
- Do not invent facts, numbers, campaign copy, dates, models, scores, axes, or sources.
- Only verified-verbatim advertising copy may use quotation marks.
- Raw URLs are prohibited. Use publisher · material title · year.

[CREATIVE HISTORY FACTUALITY]
${creativeDirective || 'Use verified-verbatim / source-found-copy-unverified / not-found exactly. Keep 2021–2025 and 2026 YTD.'}

[IMMUTABLE APPROVED BASE HTML — START]
${semanticTemplateHtml}
[IMMUTABLE APPROVED BASE HTML — END]

[RAW STEP 0–5 RESEARCH]
${cleanResearch(rawData)}

[FINAL EXECUTION]
Replace every semantic [[FIELD:...]] token with current research content.
Return the complete finalized HTML in one \`\`\`html code block. Begin now.`;

  return addResearchSlotRules(prompt);
}
