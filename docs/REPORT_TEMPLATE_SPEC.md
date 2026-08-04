# FULL Report Template Specification

## Status

Approved Phase 6 production target for the Brand Consulting Generator.

- Production route: `/`, Phase 6
- Layout source: `/?pilot=full-integrated&brand=<exact brand>`
- External AI final output: complete standalone HTML, not JSON
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
→ `complete HTML prompt download`
→ `external AI returns one complete 40-page HTML`
→ `paste or HTML file upload`
→ `active-content sanitization`
→ `User Brief / Report Identity / semantic-field / DOM / cross-page / P18 validation`
→ `approved DOM reassembly`
→ `Viewer / save / reopen / native PDF`

The application owns structure. External AI writes content but does not own final DOM/CSS.

## User Brief Lock

A brand-keyed User Brief contains:

- `targetBrand`
- `mandatoryReviewSeeds`
- `strategicOpponent / categoryConvention`
- `clientNeed / campaignDirection`
- `referenceNote`
- attachment manifest

Requirements:

- Inject into every Step 0–5 prompt.
- Repeat in Phase 6.
- Persist in session storage and brand-keyed local storage.
- Restore for the same brand.
- Preserve exact user wording.
- Treat client need as a strategic Constraint, not fabricated evidence.
- Treat strategic opponent as a category convention, not a company competitor.

Mixed input such as:

`코웨이, 삼성 비스포크 정수기, SK매직, 쿠쿠 (브랜드가 아니라 위생이라는 단어 자체)`

must become:

- company review seeds: 코웨이 / 삼성 비스포크 정수기 / SK매직 / 쿠쿠
- strategic opponent: `위생이라는 단어 자체`

## Report Identity Lock

The application owns:

- exact target brand display name
- core competitor 1–3 rank order
- canonical competitor name
- display name
- aliases
- Landscape candidates

Identity is fixed on:

- P11 Competitive Landscape
- P12 Threat Ranking and summary
- P13–15 Deep Dive titles
- P16 Product Matrix columns
- P18 Positioning labels
- P29–32 Creative History titles
- P33 Message Trajectory brand names

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

Reject visible sample identities when absent from the target/Registry/alias lock:

- 비즈넵 / BIZNUP
- 삼쩜삼
- 더낸세금 / 혜움
- SSEM / 쌤157

A sample name may remain only when it is a legitimate selected or reviewed competitor.

## External AI attachment package

The downloaded file must declare itself as the complete execution request. The app copies and displays this chat-level message:

`첨부한 파일은 참고자료가 아니라 실행 지시문입니다. 파일 전체를 읽고 지금 즉시 완성된 40페이지 HTML만 생성하십시오. 계획·설명·확인 질문 없이 바로 작업하고, 결과 파일에는 <!DOCTYPE html>부터 </html>까지의 HTML만 저장하십시오.`

The package must contain explicit boundaries for:

- User Brief Lock
- Report Identity Lock
- compiler instructions
- Step 0–5 research
- immutable semantic template

The generated artifact:

- starts with `<!DOCTYPE html>`;
- ends with `</html>`;
- is raw HTML without Markdown fences;
- excludes prompt instructions, source research outside report pages, and analysis notes.

## HTML file upload

Phase 6 supports:

- `.html`
- `.htm`
- `.txt`
- maximum 20MB

Upload loads file text into the same controlled textarea as paste. Both methods must use one identical:

- complete-document extraction
- Sanitizer
- User Brief/Identity lock
- semantic-field validation
- DOM fingerprint validation
- cross-page validation
- P18 validation
- sample leakage gate
- Viewer/save/reopen/PDF path

A separate relaxed upload renderer is prohibited.

## Semantic field contract

- Variable content uses `data-report-field`.
- Keys describe semantic roles, not DOM order.
- Examples:
  - `comp-ranking.rank1.name`
  - `positioning.axis.xLeft`
  - `persona-1.realJob`
  - `aipl.stage3.action`
  - `strategy-choice.winningMove`
- Returned and approved field sets must match exactly.
- Missing, duplicated, added, or reordered roles block compilation.
- `[[CONTENT:Pxx:TAG:nnn]]`, DOM text order, and generic `.contentN` fields are prohibited.

### Field markup

- `rich`: only `<mark>` and `<br>` descendants
- `text`: plain text
- `source`: plain text; application owns `SOURCE ·`
- `status`: plain text and canonical status code

### Token completion

The compiled report contains none of:

- `[[FIELD:...]]`
- `[[POSITION:...]]`
- literal `[[important phrase]]`
- `[[CONTENT:...]]`

## Approved DOM and security

1. Extract one complete HTML document.
2. Remove scripts, noscript, base, refresh redirects, event handlers, and JavaScript URLs.
3. Reject forms, inputs, embeds, objects, iframes, and autoplay media.
4. Canonicalize to the 40-page contract.
5. Compare the returned DOM fingerprint with the approved fingerprint.
6. Read only validated semantic values and P18 coordinates.
7. Apply User Brief and Report Identity locks.
8. Re-render into the approved base DOM.
9. Run sample leakage validation.

External CSS or DOM changes never become final report structure.

## Blocking validation

Reject when:

- slide count is not 40;
- any page zone is not `main`;
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
- Persona, JTBD, AIPL, STP, routes, or Final Choice contain structural labels instead of meaning;
- P18 labels, axes, coordinates, or movement fail;
- Creative History status is invalid;
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
- Persona titles reuse P21 target names; `02` and `03` stay on one line
- P26 retains Pain / current problem / Unmet Need / priority
- P27 retains approved AIPL friction-flow
- Creative History retains centered six-year cards without NOW circles
- P34 retains Current Copy / Missing Character
- P37 retains Segmentation → Targeting → Positioning
- P38 retains A/B/C/D and 차별/확장/실행
- P39 retains two-column Selection Criteria / Final Choice
- P40 is Decision Receipt / Close

## Competitor rules

- P11 reviews up to five evidence-supported Direct Competitor candidates.
- P12 selects the core three.
- P13–16, P18, and P30–33 use the same core three in rank order.
- Do not invent competitors to fill capacity.
- Hide `추가 후보 없음`, `없음`, and `not-found` rows.
- Strategic opponent/category convention is not a competitor identity.
- Product Matrix and Positioning use defensible common axes only.

## P18 Positioning

### Axis fields

- `positioning.axis.xLeft`
- `positioning.axis.xRight`
- `positioning.axis.yTop`
- `positioning.axis.yBottom`

Poles are meaningful Step 2 attributes. Literal axis names or directional shorthand are invalid.

### Point identity

- locked core competitor 1–3
- `<exact brand> AS-IS · ...`
- `<exact brand> TO-BE · ...`

### Coordinates

- core competitor 1–3 x/y
- target AS-IS x/y
- target TO-BE x/y
- integer 0–100
- x=0 left, x=100 right
- y=0 top, y=100 bottom
- derived from declared axes
- meaningful AS-IS/TO-BE separation
- stored in `data-position-x/y`
- map contract `semantic-0-100-v1`

## Creative History

- Coverage: 2021–2025 plus 2026 YTD.
- Canonical states:
  - `verified-verbatim`
  - `source-found-copy-unverified`
  - `not-found`
- Common humanized variants may normalize on import.
- New output uses canonical states.
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
- `src/lib/installFullReportPhase6Bridge.ts`
- `src/lib/geminiCompiler.ts`
- `src/report/semanticHtmlReportV5.ts`
- `src/report/semanticReportV4.ts`
- `src/report/structuredReportV3.ts`
- `src/report/structuredDefinitionPolicy.ts`
- `src/report/structuredReportCrossValidation.ts`
- `src/report/reportDomSafety.ts`
- `src/lib/installFullReportRuntimeCompatibility.ts`
- `src/lib/installFullReportPdfButtonBridge.ts`
- `scripts/e2e-phase6-five-competitor-native-print.mjs`

## Minimum QA

- exact 40 pages and 40 navigation links
- Appendix 0
- exact page order and IDs
- no legacy content slots or generic fields
- no unresolved tokens or literal brackets
- script and active-content removal
- exact semantic field set and DOM fingerprint
- User Brief present in Step 0–5 and Phase 6
- strategic opponent separated from competitor identities
- exact target and core-three identity across assigned pages
- alias normalization
- sample leakage 0 unless Registry-approved
- file upload and paste share one path
- P18 labels, axes, coordinates, movement
- Creative History status/factuality
- 1280×720 and zero overflow
- exact brand display
- save/reopen
- Export PDF twice, Ctrl+P, Cmd+P
- native 40-page PDF with fonts and no full-page raster rows
- screenshot and all-page PDF inspection

## Current validated evidence

- LG fixture target: `LG 퓨리케어 정수기`
- seeds: 코웨이 / 삼성 비스포크 정수기 / SK매직 / 쿠쿠
- Registry core: 코웨이 / 삼성전자 / SK매직
- strategic opponent: `위생이라는 단어 자체`
- client need: `위생의 격이 다른 정수기`
- Implementation head before documentation: `3f8b42952a7508669be0b3fd88a0db12e15a85cf`
- Preview CI run `30881036772`: PASS
- PDF Runtime E2E run `30881036785`: PASS
- Vercel: success
- Preview: `https://brand-consulting-git-fix-phase6-main40-c77bea-dpes31s-projects.vercel.app/`

## Protected rollback and approval

- `public/template.html` remains untouched.
- Protected branches remain untouched.
- Draft PR #24 remains unmerged.
- Owner Preview approval is required before merge.
