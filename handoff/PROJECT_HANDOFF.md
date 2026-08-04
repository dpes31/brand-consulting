# Brand Consulting Generator — Project Handoff

## Current checkpoint

- Repository: `dpes31/brand-consulting`
- Production branch: `main`
- Production commit before PR #24: `96f12ac5bde92a53a97a12ea01ae9c3db921c7fe`
- Production URL: `https://brand-consulting.vercel.app/`
- Active branch: `fix/phase6-main40-final-html-semantic-v5`
- Draft PR: `#24 Restore Phase 6 complete HTML output with semantic field locking`
- Validated implementation head before documentation updates: `351c4247c4a9bf713955985c8963d2ddb0eb4257`
- Preview: `https://brand-consulting-git-fix-phase6-main40-c77bea-dpes31s-projects.vercel.app/`
- Preview CI run `30888643138`: PASS
- LG browser/PDF E2E run `30888643175`: PASS
- Vercel: success
- `main`: unchanged and unmerged
- PR #24 remains Draft.
- Protected rollback branches and Legacy `public/template.html` remain untouched.

## Critical current truth

The V6 lightweight semantic-workbook experiment is rejected.

Owner testing produced `LG_퓨리케어_40페이지_전략리포트.html`, which contained 40 sections and semantic fields but no CSS, navigation, tables, diagrams, images, or approved visual report format. It also contained repeated JTBD content, `UNVERIFIED` statuses, and raw URLs.

Do not restore or describe the lightweight workbook as a finished report.

Rejected active identifiers:

- `createSemanticHtmlWorkbookV6`
- `buildSemanticHtmlPromptV6`
- `compileSemanticHtmlReportV6`
- `phase6_lightweight_html_prompt_<brand>.txt`
- `완성 HTML 프롬프트 다운로드 (경량)`

Full audit: `handoff/PHASE6_LIGHTWEIGHT_HTML_TIMEOUT_MITIGATION_2026-08-04.md`.

## Owner-approved output contract

- External AI returns one complete standalone **styled visual HTML report**, not JSON and not a semantic workbook.
- The returned file must directly display the approved report when opened in a browser.
- Preserve approved CSS, 1280×720 page DOM, layout hierarchy, tables, diagrams, navigation, classes, IDs, and data attributes.
- Main Deck: exactly 40 pages.
- Appendix: 0 pages.
- Page 40: Decision Receipt / Close.
- Native PDF: 40 pages, 960×540pt.
- Exact user-entered brand name; no translation or arbitrary abbreviation.
- Raw source URLs prohibited.
- Only `verified-verbatim` advertising copy may use quotation marks.

## Active Phase 6 journey

`Step 0–5 research`
→ `phase6_complete_html_prompt_<brand>.txt`
→ `external AI returns complete styled 40-page HTML`
→ `paste or .html/.htm/.txt upload`
→ `active-content / User Brief / Report Identity / semantic-field / DOM / cross-page / P18 validation`
→ `approved DOM reassembly`
→ `Viewer / save / reopen / Export PDF`

Active implementation uses:

- `createSemanticHtmlTemplateV5`
- `buildSemanticHtmlPromptV5`
- `compileSemanticHtmlReportV5`

External and internal API paths both use this V5 contract.

## Timeout status

The original external-chat timeout is unresolved.

Measured previous owner Biznup prompt:

- total: 647,215 bytes
- approved visual template: approximately 449,802 bytes
- Step 0–5 research: approximately 194,109 bytes

Restoring the correct visual artifact also restores a larger prompt. Do not claim the timeout is solved.

A deterministic page-batch generation and merge workflow is a possible next direction, but it changes the user journey and is not implemented or approved. Do not silently split, remove visual format, restore JSON, or concatenate unvalidated outputs.

## User Brief Lock

The application preserves a brand-keyed Brief containing:

- exact target brand
- mandatory competitor review seeds
- strategic opponent/category convention
- client need/campaign direction
- reference note
- attachment manifest

The Brief is injected into every Step 0–5 prompt and Phase 6, persisted by brand, and restored when the same brand is reopened.

A sentence such as `브랜드가 아니라 위생이라는 단어 자체` is a strategic opponent, not a competitor identity.

## Report Identity Lock

The app owns:

- target brand display name
- core competitor 1–3 ranking order
- canonical names
- display names
- aliases
- Landscape candidates

Apply across P11, P12, P13–16, P18, and P29–33. Aliases such as `삼성전자` and `삼성 비스포크 정수기` resolve to one entity.

## Approved sample leakage protection

The Biznup source supplies layout only.

Neutralize:

- Cover `BIZNUP` → `BRAND REPORT`
- P25 `비즈넵 기회` → `브랜드 기회`
- Persona role label → exact target brand
- navigation, toolbar, title, and errors → exact target brand

Block unapproved sample identities such as 비즈넵/BIZNUP, 삼쩜삼, 더낸세금/혜움, SSEM/쌤157.

## External AI execution package

Current copied execution sentence:

`첨부한 파일은 참고자료가 아니라 실행 지시문입니다. 파일 전체를 읽고 승인된 CSS·레이아웃·도식·표·내비게이션을 그대로 보존한 완성 40페이지 HTML만 즉시 생성하십시오. 계획·설명·확인 질문 없이 바로 작업하고, 결과 파일에는 <!DOCTYPE html>부터 </html>까지의 HTML만 저장하십시오.`

The prompt includes:

- Visual Artifact Lock
- complete-report prohibition against workbook output
- P25 role separation
- duplicate generic filler prohibition
- canonical Creative History status requirement
- raw URL prohibition
- fabrication prohibition

## Semantic and security contract

- Stable `data-report-field` keys replace DOM-order slots.
- `[[CONTENT:Pxx:TAG:nnn]]` and generic `.contentN` are prohibited.
- Every `[[FIELD:semantic.key]]` and `[[POSITION:semantic.key]]` token must be replaced.
- Rich fields allow only `<mark>` and `<br>`.
- Scripts, handlers, JavaScript URLs, redirects, forms, embeds, and autoplay media are removed or rejected.
- Returned field set must match the approved field set.
- Approved DOM fingerprint must remain unchanged.
- Runtime blocks raw URLs and noncanonical Creative History status values.

## Fixed 40-page plan

1. Cover
2. 핵심 진단
3. Brand Identity
4. FACTS
5. Category & Target
6. Growth Story
7. Core Inflection
8. Product USP & Best Self
9. Market Context
10. Category Shift
11. Competitive Landscape
12. Threat Ranking
13–15. Deep Dive 1–3
16. Product Matrix
17. Category Clichés
18. Positioning
19. Consumer Executive Conclusion
20. Trends
21. Core Target
22–24. Persona 1–3
25. JTBD & Identity Alignment
26. Pain Points & Unmet Needs
27. AIPL Bottleneck
28. Purchase to Loyalty
29. Target Brand Creative History
30–32. Competitor Creative History 1–3
33. Message Trajectory
34. Creative Insight
35. SWOT
36. GAP & Root Cause
37. STP
38. Four Strategic Directions
39. Final Choice
40. Decision Receipt / Close

Creative Methodology and Appendix A1–A7 are excluded.

## LG 퓨리케어 regression validation

Fixture:

- target: `LG 퓨리케어 정수기`
- seeds: 코웨이 / 삼성 비스포크 정수기 / SK매직 / 쿠쿠
- Registry core: 코웨이 / 삼성전자 / SK매직
- strategic opponent: `위생이라는 단어 자체`
- client need: `위생의 격이 다른 정수기`

Validated at code head `351c4247c4a9bf713955985c8963d2ddb0eb4257`:

- complete styled prompt path: PASS
- V6 workbook inactive in external/internal paths: PASS
- 40 pages / 40 navigation links / Appendix 0: PASS
- CSS, navigation, tables, and diagrams present: PASS
- User Brief / Identity / alias correction: PASS
- sample leakage: 0
- scripts: 0 after sanitization
- P18 labels, axes, coordinates, movement: PASS
- 1280×720 and overflow 0: PASS
- save → reload → reopen: PASS
- repeated Export PDF / Ctrl+P / Cmd+P: PASS
- native PDF: 40 pages, 960×540pt

The QA fixture copy is not owner content-quality approval.

## Active implementation files

- `src/lib/userBriefContract.ts`
- `src/lib/installUserBriefInputNormalizer.ts`
- `src/report/reportIdentityLock.ts`
- `src/report/phase6PromptPackage.ts`
- `src/report/semanticHtmlReportV5.ts`
- `src/lib/installFullReportPhase6Bridge.ts`
- `src/lib/geminiCompiler.ts`
- `src/report/semanticReportV4.ts`
- `src/report/structuredReportCrossValidation.ts`
- `src/report/reportDomSafety.ts`
- `scripts/test-full-report-contract.mjs`
- `scripts/test-full-report-runtime.mjs`
- `scripts/e2e-phase6-five-competitor-native-print.mjs`

`src/report/semanticHtmlReportV6.ts` may remain only as rejected audit code until an explicit cleanup decision. It must not be imported by active Phase 6 paths.

## Remaining gate

- PR #24 is not approved for merge.
- The correct visual format has been restored.
- The timeout constraint remains unresolved.
- The next architecture decision is whether to approve a deterministic batch-generation workflow that preserves the complete visual artifact.
- Do not merge to `main` without explicit owner approval.
