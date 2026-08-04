# FULL Report Template Specification

## Status

Approved Phase 6 production target for the Brand Consulting Generator.

- Production route: `/`, Phase 6
- Layout source: `/?pilot=full-integrated&brand=<exact brand>`
- External AI final output: one complete standalone styled visual HTML report, not JSON and not a semantic workbook
- Main Deck: exactly 40 pages
- Appendix: 0 pages
- Final page: Decision Receipt / Close
- Logical canvas: 1280×720, exact 16:9
- Native PDF: 960×540pt
- Typeface: Pretendard
- Major titles: weight 900
- Korean wrapping: `word-break: keep-all`

The approved Biznup Pilot supplies layout only. Its sample wording is not a valid content source.

## Phase 6 production journey

`Step 0–5 research`
→ `phase6_complete_html_prompt_<brand>.txt`
→ `external AI returns one complete styled 40-page HTML`
→ `paste or HTML file upload`
→ `active-content / User Brief / Report Identity / semantic-field / DOM / cross-page / P18 validation`
→ `approved DOM reassembly`
→ `Viewer / save / reopen / native PDF`

Active functions:

- `createSemanticHtmlTemplateV5`
- `buildSemanticHtmlPromptV5`
- `compileSemanticHtmlReportV5`

The external file must open directly as the approved visual report. A field list with an `.html` extension is not accepted.

## Rejected lightweight-workbook path

The V6 compact semantic workbook is rejected after owner round-trip testing.

The rejected result contained 40 sections and semantic fields but no CSS, navigation, tables, diagrams, images, or approved report format. It also contained repeated JTBD content, `UNVERIFIED` statuses, and raw URLs.

The following must not be active:

- `createSemanticHtmlWorkbookV6`
- `buildSemanticHtmlPromptV6`
- `compileSemanticHtmlReportV6`
- `phase6_lightweight_html_prompt_<brand>.txt`
- `완성 HTML 프롬프트 다운로드 (경량)`

`src/report/semanticHtmlReportV6.ts` may remain only as rejected audit code until an explicit cleanup decision.

## Timeout status

Measured previous owner Biznup prompt:

- total: 647,215 bytes
- fixed visual template: approximately 449,802 bytes
- Step 0–5 research: approximately 194,109 bytes

The attachment timeout remains unresolved. Do not solve it by deleting the output format, reverting to JSON, removing research, or manually concatenating unvalidated outputs.

A deterministic page-batch workflow may be considered only after explicit owner approval because it changes the user journey.

## Complete visual artifact contract

The external HTML must preserve:

- approved CSS
- 1280×720 `.full-slide` page DOM
- visual hierarchy and spacing
- tables, matrices, timelines, maps, causal flows, Persona, SWOT, STP, and Choice Architecture structures
- navigation and page links
- approved classes, IDs, and data attributes
- print CSS and report geometry

The file:

- starts with `<!DOCTYPE html>`;
- ends with `</html>`;
- contains exactly 40 `.full-slide` sections in approved ID order;
- contains all required `data-report-field` and P18 coordinate fields;
- contains no Markdown fences or explanatory text outside the HTML;
- displays the approved report when opened directly in a browser.

## User Brief Lock

A brand-keyed User Brief contains:

- `targetBrand`
- `mandatoryReviewSeeds`
- `strategicOpponent / categoryConvention`
- `clientNeed / campaignDirection`
- `referenceNote`
- attachment manifest

Requirements:

- Inject into every Step 0–5 prompt and Phase 6.
- Persist in session storage and brand-keyed local storage.
- Restore for the same brand.
- Preserve exact user wording.
- Treat client need as a strategic constraint, not fabricated evidence.
- Treat strategic opponent as a category convention, not a company competitor.

## Report Identity Lock

The application owns:

- exact target brand display name
- core competitor 1–3 rank order
- canonical competitor name
- display name
- aliases
- Landscape candidates

Identity is fixed on P11, P12, P13–16, P18, and P29–33.

Aliases representing one entity must be merged. Example:

- canonical: `삼성전자`
- aliases: `삼성 비스포크 정수기`, `비스포크 정수기`

External AI may not abbreviate, translate, replace, duplicate, or reorder locked identities.

## Approved sample leakage policy

Neutralize fixed sample labels before prompt generation and after compilation:

- Cover `BIZNUP` → `BRAND REPORT`
- P25 `비즈넵 기회` → `브랜드 기회`
- Persona role label → `<exact brand>의 역할`
- navigation, toolbar, and title → exact target brand
- brand-specific error copy → current target brand

Reject unapproved visible sample identities such as 비즈넵/BIZNUP, 삼쩜삼, 더낸세금/혜움, SSEM/쌤157.

## External AI attachment package

Current copied execution message:

`첨부한 파일은 참고자료가 아니라 실행 지시문입니다. 파일 전체를 읽고 승인된 CSS·레이아웃·도식·표·내비게이션을 그대로 보존한 완성 40페이지 HTML만 즉시 생성하십시오. 계획·설명·확인 질문 없이 바로 작업하고, 결과 파일에는 <!DOCTYPE html>부터 </html>까지의 HTML만 저장하십시오.`

The package contains:

- User Brief Lock
- Report Identity Lock
- compiler instructions
- Step 0–5 research
- immutable complete 40-page semantic HTML template
- Visual Artifact Lock
- output quality blockers

Output quality blockers:

- Do not return a data workbook or flattened field list.
- Do not delete CSS, layout, diagrams, tables, navigation, IDs, classes, or page wrappers.
- Do not copy one generic sentence into distinct semantic fields.
- P25 Job Type / Desired Progress / Current Alternative / Limitation / Brand Opportunity must answer different questions.
- Creative History status must be exactly `verified-verbatim`, `source-found-copy-unverified`, or `not-found`.
- Do not expose raw URLs; use `발행처 · 자료명 · 연도`.
- Do not invent facts, figures, dates, models, scores, campaigns, copy, axes, coordinates, or sources.

## HTML file upload

Phase 6 supports `.html`, `.htm`, and `.txt`, up to 20MB.

Upload and paste use one identical path:

- complete-document extraction
- active-content sanitization
- User Brief / Identity lock
- semantic-field validation
- approved DOM fingerprint
- cross-page validation
- P18 validation
- sample leakage gate
- Viewer / save / reopen / PDF

A separate relaxed renderer is prohibited.

## Semantic field contract

- Variable content uses stable `data-report-field` keys.
- Keys describe semantic roles, not DOM order.
- `[[CONTENT:Pxx:TAG:nnn]]`, DOM text order, and generic `.contentN` fields are prohibited.
- Returned and approved field sets must match exactly.
- Missing, duplicated, added, or moved roles block compilation.
- `[[FIELD:semantic.key]]` and `[[POSITION:semantic.key]]` tokens must all be replaced.
- Rich fields allow only `<mark>` and `<br>`.
- Plain text, source, and status fields allow no child markup.
- Literal `[[...]]` is rejected.

## Approved DOM and security

1. Extract one complete HTML document.
2. Remove scripts, noscript, base, refresh redirects, event handlers, and JavaScript URLs.
3. Reject forms, inputs, embeds, objects, iframes, and autoplay media.
4. Canonicalize to the 40-page contract.
5. Compare the returned DOM fingerprint with the approved fingerprint.
6. Read only validated semantic values and P18 coordinates.
7. Apply User Brief and Report Identity locks.
8. Re-render into the approved base DOM.
9. Run cross-page, P18, factuality, raw-URL, status, and sample-leakage validation.

External structural changes never become final report structure.

## Blocking validation

Reject when:

- slide count is not 40;
- any Appendix or Creative Methodology page remains;
- page IDs, order, or required structures differ;
- any unresolved field, position, literal bracket, or legacy content token remains;
- field set differs from the approved set;
- a field contains disallowed markup;
- approved DOM fingerprint changes;
- exact target brand is absent or altered;
- locked competitor identity/order is inconsistent;
- a strategic opponent is used as a competitor brand;
- unapproved sample-brand text remains;
- P18 labels, axes, coordinates, or movement fail;
- Creative History status is invalid;
- raw URLs remain;
- active content remains;
- logical 1280×720 geometry is missing.

## Fixed Main Deck

1. Cover
2. 핵심 진단
3. Brand Identity
4. FACTS
5. Category & Target
6. Growth Story
7. Core Inflection
8. Product USP & Brand Best Self
9. Market Context
10. Category Shift
11. Competitive Landscape
12. Threat Ranking
13. Deep Dive 1
14. Deep Dive 2
15. Deep Dive 3
16. Product Matrix
17. Category Clichés
18. Positioning
19. Consumer Executive Conclusion
20. Trends
21. Core Target
22. Persona 1
23. Persona 2
24. Persona 3
25. JTBD & Identity Alignment
26. Pain Points & Unmet Needs
27. AIPL Bottleneck
28. Purchase to Loyalty
29. Target Brand Creative History
30. Competitor Creative History 1
31. Competitor Creative History 2
32. Competitor Creative History 3
33. Message Trajectory
34. Creative Insight
35. SWOT
36. GAP & Root Cause
37. STP
38. Four Strategic Directions
39. Final Choice
40. Decision Receipt / Close

Creative Methodology and Appendix A1–A7 are excluded.

## Page grammar

- P2: `핵심 진단`
- P4: `FACTS`
- P5: `CATEGORY & TARGET`
- P10: `CATEGORY SHIFT`, `LEVEL 1`–`LEVEL 5`
- Persona: Situation / JTBD / identity shift / exact-brand role
- P26: Pain / current problem / Unmet Need / priority
- P27: approved AIPL friction-flow
- Creative History: centered six-year cards without NOW circles
- P34: Current Copy / Missing Character
- P37: Segmentation → Targeting → Positioning
- P38: A/B/C/D and 차별/확장/실행
- P39: two-column Selection Criteria / Final Choice
- P40: Decision Receipt / Close

## Competitor rules

- P11 reviews up to five evidence-supported Direct Competitor candidates.
- P12 selects the core three.
- P13–16, P18, and P30–33 use the same core three in rank order.
- Do not invent competitors to fill capacity.
- Strategic opponent/category convention is not a competitor identity.
- Product Matrix and Positioning use defensible common axes only.

## P18 Positioning

- Axis fields: `positioning.axis.xLeft`, `xRight`, `yTop`, `yBottom`.
- Point identity: locked core competitor 1–3 and exact-brand AS-IS/TO-BE.
- Ten coordinate values are integers 0–100.
- x=0 left, x=100 right; y=0 top, y=100 bottom.
- AS-IS and TO-BE require meaningful separation.
- Applied positions persist in `data-position-x/y`.
- Map contract: `semantic-0-100-v1`.

## Creative History

- Coverage: 2021–2025 plus 2026 YTD.
- Canonical states:
  - `verified-verbatim`
  - `source-found-copy-unverified`
  - `not-found`
- Only verified-verbatim copy may be quoted.
- Preserve independent target/core-competitor pages, Message Trajectory, and Strategic So What.

## Native PDF

- Chromium native print, not full-page JPEG conversion.
- Exactly 40 pages, all Main Deck.
- MediaBox: 960×540pt.
- Embedded font objects required.
- No 2560×1440 full-page image rows.
- Viewer, saved HTML, reopened project, and PDF use the same report.
- Export PDF, Ctrl+P, and Cmd+P target the active FULL Viewer iframe.

## Active implementation

- `src/lib/userBriefContract.ts`
- `src/lib/installUserBriefInputNormalizer.ts`
- `src/report/reportIdentityLock.ts`
- `src/report/phase6PromptPackage.ts`
- `src/report/semanticHtmlReportV5.ts`
- `src/lib/installFullReportPhase6Bridge.ts`
- `src/lib/geminiCompiler.ts`
- `src/report/semanticReportV4.ts`
- `src/report/structuredDefinitionPolicy.ts`
- `src/report/structuredReportCrossValidation.ts`
- `src/report/reportDomSafety.ts`
- `src/lib/installFullReportRuntimeCompatibility.ts`
- `src/lib/installFullReportPdfButtonBridge.ts`
- `scripts/test-full-report-contract.mjs`
- `scripts/test-full-report-runtime.mjs`
- `scripts/e2e-phase6-five-competitor-native-print.mjs`

## Current validation evidence

Validated implementation head before documentation updates:

`351c4247c4a9bf713955985c8963d2ddb0eb4257`

- Preview CI run `30888643138`: PASS
- PDF Runtime E2E run `30888643175`: PASS
- V5 complete styled prompt path: PASS
- active V6 workbook imports: absent
- CSS, navigation, tables, and diagrams present: PASS
- 40 pages / 40 navigation links / Appendix 0: PASS
- 1280×720 / overflow 0: PASS
- save / reopen / repeated PDF export: PASS
- PDF: 40 pages, 960×540pt

PR #24 remains Draft and unmerged. The visual contract is restored; the attachment-timeout strategy is not approved or solved.
