const SLOT_RULES = `[SEMANTIC HTML FIELD CONTRACT]
- The approved HTML below is the final 40-page Main Deck + 8-page Appendix layout. It is not a design reference and must not be redesigned.
- Replace every token beginning with [[FIELD: using only the supplied Step 0–5 research.
- Each field already contains data-report-field, data-report-hint, data-report-max-length, and data-report-kind metadata. Use those meanings exactly.
- Do not move a field to another page or section. Do not merge two fields. Do not place one field's content into another field.
- Do not edit tag hierarchy, classes, IDs, data-page, data-zone, navigation, CSS, inline geometry, connectors, arrows, stage codes, fixed labels, table columns, or component order.
- Fixed labels include WANT, AVOID, Evidence, Core Desire, Appeal, Threat Mechanism, Attack Point, Pain, 현재 문제, Unmet Need, 우선순위, A, I, P1, P2, L, 상황, 핵심 Job, 현재 정체성, 원하는 정체성, SEGMENTATION, TARGETING, POSITIONING, SO WHAT, and all arrows.
- Use exactly three core Direct Competitors selected by Threat Ranking. Use the same three and the same order in P12, P13–15, P16, P18, P30–33, and P34.
- P17 CATEGORY CLICHÉS has exactly three columns: 반복 화법 / 현재 역할 / 구조적 한계. Do not restore or add a fourth '새 질문' column.
- P18 POSITIONING requires four meaningful axis names. Never write X축, Y축, X axis, Y axis, or place a brand name in an axis field.
- P22–24 Persona fields must remain separated by situation, surface need, real JTBD, fear, AS-IS identity, TO-BE identity, and brand role.
- P26 must keep Pain, current issue, Unmet Need, and priority in the same row. Do not repeat labels as content.
- P27 must keep A → I → P1 → P2 → L. Put actions, descriptions, and bottleneck states only in their assigned fields.
- P29–33 Creative History must keep 2021, 2022, 2023, 2024, 2025, and 2026 YTD. Only verified-verbatim copy may use quotation marks.
- P37 Root Cause, P38 STP, P39 Four Strategic Directions, P40 Final Choice, and A8 Brand Principle must form one continuous strategic logic. A8 summarizes the chosen strategy and must not introduce a new slogan or unrelated claim.
- Write clear Korean that a decision-maker can understand without decoding consultant jargon. When JTBD, AIPL, STP, Big IdeaL, or Winning Move appears, explain the meaning in plain Korean inside the assigned content field.
- Prefer visual labels, short conclusions, and parallel phrases over long prose. Respect every max-length value. Never shrink text or add CSS to fit more copy.
- Every slide title must be a conclusion, not a topic label. Every SO WHAT field must state the decision or implication.
- Do not copy or restore the previous sample brand's wording, figures, competitors, campaign copy, sources, or strategy.
- Do not invent facts, figures, campaign copy, dates, models, axes, scores, or sources. State an evidence gap when research does not support a claim.
- Do not add script, event handlers, iframe, object, embed, form, external layout framework, or a second style system.
- No [[FIELD: token may remain in the final HTML.
- Return one complete HTML document only. The first line inside the code block must be <!DOCTYPE html> and the last line must be </html>.

`;

export function addResearchSlotRules(prompt: string): string {
  const marker = '[IMMUTABLE APPROVED BASE HTML — START]';
  if (!prompt.includes(marker)) throw new Error('승인 레이아웃 HTML 시작 마커를 찾을 수 없습니다.');
  return prompt.replace(marker, `${SLOT_RULES}${marker}`);
}
