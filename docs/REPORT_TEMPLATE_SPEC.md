# FULL Report Template Specification

## Status — 2026-08-21

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

Current validated hardening line:

- branch: `fix/phase6-coway-real-output-validation-v1`
- Draft PR: #26
- implementation head before final documentation commits: `88d64a4ea6801479e78c54879b81b9234e331355`
- Preview: `https://brand-consulting-git-fix-phase6-coway-r-2e3260-dpes31s-projects.vercel.app`

## Phase 6 production journey

`Step 0–5 research`
→ `phase6_complete_html_prompt_<brand>.txt`
→ `external AI returns one complete styled 40-page HTML`
→ `paste or HTML file upload`
→ `active-content / User Brief / Report Identity / semantic-field / DOM / cross-page / P12 / Persona / P18 validation`
→ `approved DOM reassembly and app-owned presentation normalization`
→ `Viewer / save / reopen / native PDF`

Active functions include:

- `createSemanticHtmlTemplateV5`
- `buildSemanticHtmlPromptV5`
- `compileSemanticHtmlReportV5`

The external file must open directly as the approved visual report. A field list with an `.html` extension is not accepted.

## Rejected lightweight-workbook path

The V6 compact semantic workbook is rejected after owner round-trip testing. Do not activate:

- `createSemanticHtmlWorkbookV6`
- `buildSemanticHtmlPromptV6`
- `compileSemanticHtmlReportV6`
- `phase6_lightweight_html_prompt_<brand>.txt`
- `완성 HTML 프롬프트 다운로드 (경량)`

The historical large-message timeout remains a transport risk and is not a reason to remove the visual artifact, revert to JSON, or weaken validation.

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

- starts with `<!DOCTYPE html>` and ends with `</html>`;
- contains exactly 40 `.full-slide` sections in approved ID order;
- contains all required `data-report-field` and P18 coordinate fields;
- contains no explanatory text outside the HTML;
- displays the approved report when opened directly in a browser.

## User Brief and Report Identity Lock

The app owns and preserves:

- exact target brand
- mandatory competitor review seeds
- strategic opponent/category convention
- client need/campaign direction
- attachment context
- core competitor 1–3 order
- canonical competitor names / display names / aliases
- Landscape candidates

External AI may write analysis but may not translate, abbreviate, replace, duplicate, or reorder locked identities.

Strategic opponent/category convention is not a competitor brand.

## HTML upload

Phase 6 supports `.html`, `.htm`, and `.txt`, up to 20MB.

Upload and paste use one identical path:

- complete-document extraction
- active-content sanitization
- User Brief / Identity lock
- semantic-field validation
- approved DOM fingerprint
- cross-page validation
- P12 score validation
- Persona validation
- P18 validation
- sample leakage gate
- app-owned fixed presentation normalization
- Viewer / save / reopen / PDF

A separate relaxed renderer is prohibited.

## Semantic field contract

- Variable content uses stable `data-report-field` keys.
- Keys describe semantic roles, not DOM order.
- `[[CONTENT:Pxx:TAG:nnn]]`, DOM text order, and generic `.contentN` fields are prohibited.
- Returned and approved field sets must match exactly.
- Missing, duplicated, added, or moved roles block compilation.
- `[[FIELD:semantic.key]]` and `[[POSITION:semantic.key]]` tokens must all be replaced.
- Final rich fields allow only `<mark>` and `<br>`.
- Safe external `<b>/<strong>` may be normalized to `<mark>`.
- Other rich tags remain blocking.
- Plain text, source, and status fields allow no child markup.
- Literal `[[...]]` is rejected.
- Raw URLs are prohibited in semantic fields.

## Blocking-error collection

Where validation can safely continue, collect all detectable blocking errors rather than stopping at the first field. The user should receive the actionable error set in one cycle.

Do not weaken a valid type/range/semantic rule merely to make an old external HTML pass.

## P12 Threat Ranking score contract

P12 ranking score cells contain integers only:

- `penetration`: 0–25
- `growth`: 0–20
- `preference`: 0–20
- `campaign`: 0–15
- `inflection`: 0–15
- `evidence`: 0–5
- `total`: exact sum of the six components, 0–100

`evidence` means evidence-confidence score. Evidence prose belongs elsewhere and must not be inserted into the score cell.

## Persona contract

- P21 defines targets 1–5.
- P22 analyzes target 1.
- P23 analyzes target 2.
- P24 analyzes target 3.
- Conclusion-led Persona titles are permitted if the underlying target identity remains correct.
- Target 4/5 substitution or another target identity is blocking.
- `Brand Role` and `SO WHAT` must perform distinct strategic roles; excessive near-duplicate filler is rejected.

## Approved DOM and security

1. Extract one complete HTML document.
2. Remove scripts, noscript, base, refresh redirects, event handlers, and JavaScript URLs.
3. Reject forms, inputs, embeds, objects, iframes, and autoplay media.
4. Canonicalize to the 40-page contract.
5. Normalize app-owned fixed presentation elements that are allowed to self-heal.
6. Compare returned DOM fingerprint with the approved fingerprint.
7. Read only validated semantic values and P18 coordinates.
8. Apply User Brief and Report Identity locks.
9. Re-render into the approved base DOM.
10. Run cross-page, P12, Persona, P18, factuality, raw-URL, status, and sample-leakage validation.

External structural changes never become final report structure.

## App-owned fixed presentation

### P4 FACTS

The fixed KPI flow is exactly:

`계정 → 매출 → 해외 → 비렉스`

All three connector glyphs are `→`. Legacy `?` is automatically normalized in approved base, cached base, external HTML normalization, and final output. Regenerating otherwise valid research HTML is not required for this fixed defect.

### P11 / P25 JOB note

Exact note:

`JOB : 고객이 특정 상황에서 달성하고 싶어 하는 근본적인 목표나 해결하고자 하는 일을 뜻함`

It appears exactly twice: below P11 `CATEGORY JOB` and immediately above P25 `Job 층위`.

### P18 Positioning vector

P18 uses one app-owned `.map-arrow-vector` connected to semantic target AS-IS/TO-BE coordinates. Legacy `.positioning-arrow-v2` must not exist.

### P29 Creative History breadcrumb

Target brand page uses:

`IV. CREATIVE > TARGET BRAND HISTORY`

P30–32 remain competitor history pages.

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

Creative Methodology and Appendix are excluded.

## Competitor rules

- P11 reviews up to five evidence-supported Direct Competitor candidates.
- P12 selects the core three.
- P13–16, P18, and P30–33 use the same core three in rank order.
- Do not invent competitors to fill capacity.
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
- Viewer, saved HTML, reopened project, and PDF use the same report.
- Export PDF, Ctrl+P, and Cmd+P target the active FULL Viewer iframe.

## Current validation evidence

At implementation head `88d64a4ea6801479e78c54879b81b9234e331355`:

- Phase 6 Color Correction Preview CI run `32437175392`: PASS
- Phase 6 PDF Runtime E2E run `32437175313`: PASS
- actual Coway external-output regression: PASS
- latest Coway semantic fixture: PASS
- synthetic semantic regression: PASS
- P12 numeric/range/total regression: PASS
- Persona target-order and role-duplication regression: PASS
- P18 single vector / P29 target breadcrumb: PASS
- P4 runtime / legacy cached base / external HTML auto-repair: PASS
- 40 pages / 40 navigation links / overflow 0: PASS
- save → reload → reopen: PASS
- repeated PDF export / Ctrl+P / Cmd+P: PASS
- PDF 40 pages / 960×540pt / embedded Pretendard: PASS
- Vercel Preview: Ready
- owner final Preview re-test: same HTML upload / P4 Viewer / P4 PDF all PASS

PR #26 remains Draft and unmerged pending final documentation CI and explicit owner `main` merge approval.
