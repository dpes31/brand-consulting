const SLOT_RULES = `[RESEARCH CONTENT SLOT CONTRACT]
- The approved HTML below is a content-neutral layout shell, not a completed report and not an example answer.
- Every token beginning with [[CONTENT: must be replaced with content derived from the supplied Step 0–5 research.
- Do not copy, restore, reconstruct, or guess any wording from a previous Pilot report.
- CSS, structural classes, component hierarchy, slide geometry, page order, and fixed labels such as SO WHAT remain unchanged.
- Titles, conclusions, metrics, competitor names, persona details, campaign history, sources, SWOT, STP, strategy routes, and final choice must all come from the current research.
- Dynamic competitor slide IDs are generic. Fill Deep Dive 1–3 and Creative History 1–3 using the highest-ranked Direct Competitors in Step 2.
- No [[CONTENT: token may remain in the final HTML.
- A visually correct report with copied sample content is invalid.
- Before returning, verify that Step 0 KPI values and the top Step 2 Direct Competitors appear in the final HTML.

`;

export function addResearchSlotRules(prompt: string): string {
  const marker = '[IMMUTABLE APPROVED BASE HTML — START]';
  if (!prompt.includes(marker)) throw new Error('승인 레이아웃 HTML 시작 마커를 찾을 수 없습니다.');
  return prompt.replace(marker, `${SLOT_RULES}${marker}`);
}
