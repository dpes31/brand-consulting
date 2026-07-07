const SLOT_RULES = `[RESEARCH CONTENT SLOT CONTRACT]
- The approved HTML below is a content-neutral layout shell, not a completed report and not an example answer.
- Every token beginning with [[CONTENT: must be replaced with content derived from the supplied Step 0–5 research.
- Do not copy, restore, reconstruct, or guess any wording from a previous Pilot report.
- CSS, structural classes, component hierarchy, slide geometry, page order, and fixed labels such as SO WHAT remain unchanged.
- Titles, conclusions, metrics, competitor names, persona details, campaign history, sources, SWOT, STP, strategy routes, and final choice must all come from the current research.
- Dynamic competitor slide IDs are generic. Fill Deep Dive 1–5 and Creative History 1–5 using the selected Direct Competitors in Step 2, in Threat Ranking order.
- If Step 2 supports fewer than five Direct Competitors, preserve the unused approved page and state the evidence gap. Never invent a competitor.
- Product Matrix, Positioning, and Message Trajectory must use the same selected competitor set, up to five.
- CONTENT slots inside connector elements such as <i> must remain short visual symbols such as → or ≠, not prose.
- CONTENT slots used as stage numbers or index labels must remain short numeric labels such as 01, 02, or A1.
- Persona index 02 and 03 must remain unbroken on one line.
- No [[CONTENT: token may remain in the final HTML.
- A visually correct report with copied sample content is invalid.
- Before returning, verify that Step 0 KPI values and all selected Step 2 Direct Competitors appear in the final HTML.

`;

export function addResearchSlotRules(prompt: string): string {
  const marker = '[IMMUTABLE APPROVED BASE HTML — START]';
  if (!prompt.includes(marker)) throw new Error('승인 레이아웃 HTML 시작 마커를 찾을 수 없습니다.');
  return prompt.replace(marker, `${SLOT_RULES}${marker}`);
}
