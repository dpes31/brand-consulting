const SLOT_RULES = `[PHASE 6 REPORT CONTRACT]
- Output structure: 40 Main Deck slides, zero Appendix slides.
- Every [[CONTENT:...]] token is filled only from the supplied Step 0–5 research.
- CSS, structural classes, component hierarchy, slide geometry, page order, and fixed labels remain unchanged.
- Sample-brand wording is excluded from generated content.

[COMPETITOR FLOW]
- Page 11 Competitive Landscape compares up to five evidence-supported Direct Competitor candidates.
- Page 12 Threat Ranking selects the top three core Direct Competitors when three supported candidates exist.
- Pages 13–15, 16, 18, 30–32, and 33 use the same top-three set in ranking order.
- Page 17 Category Clichés remains between Product Matrix and Positioning.
- Unsupported competitors are represented as evidence gaps rather than invented entries.

[PAGE GRAMMAR]
- Page 2 fixed label: 핵심 진단.
- Page 4 fixed label: FACTS.
- Page 5 fixed label: CATEGORY & TARGET.
- Page 10 fixed chapter: CATEGORY SHIFT; stages remain LEVEL 1–LEVEL 5.
- Persona pages retain SITUATION / REAL JTBD / AS-IS IDENTITY / TO-BE IDENTITY / 브랜드의 역할.
- Persona 1–3 titles reuse three target names stated verbatim on page 21 CORE TARGET.
- Page 26 retains Pain / 현재 문제 / Unmet Need / 우선순위.
- Page 27 retains the approved AIPL friction-flow and avoids unnecessary English terminology.
- Page 34 retains the Creative Insight current-copy / missing-character comparison.
- Page 37 retains Segmentation → Targeting → Positioning.
- Page 38 retains four alternatives labelled A / B / C / D and the approved 차별 / 확장 / 실행 comparison.
- Page 39 retains the approved two-column Final Choice.
- Page 40 is Decision Receipt / Close.

[CONSULTING TONE]
- Korean titles, conclusions, body judgments, and SO WHAT statements use decisive declarative endings: ~한다, ~이다, ~다.
- Explanatory polite endings such as ~합니다, ~입니다, ~됩니다, ~해야 합니다 are excluded except in verified quotations or fixed UI labels.
- Every title states a conclusion rather than introducing a topic.

[VALIDATION]
- Connector elements such as <i> contain short visual symbols such as → or ≠.
- Stage numbers and indices remain compact numeric labels.
- Persona indices 02 and 03 remain unbroken.
- No [[CONTENT: token remains.
- Step 0 FACTS, all Landscape candidates, and the Threat Ranking top three appear on their assigned pages.

`;

export function addResearchSlotRules(prompt: string): string {
  const marker = '[IMMUTABLE APPROVED BASE HTML — START]';
  if (!prompt.includes(marker)) throw new Error('승인 레이아웃 HTML 시작 마커를 찾을 수 없습니다.');
  return prompt.replace(marker, `${SLOT_RULES}${marker}`);
}
