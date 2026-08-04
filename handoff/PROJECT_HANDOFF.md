# Brand Consulting Generator — Project Handoff

## Current checkpoint

- Repository: `dpes31/brand-consulting`
- Production branch: `main`
- Production commit before PR #24: `96f12ac5bde92a53a97a12ea01ae9c3db921c7fe`
- Production URL: `https://brand-consulting.vercel.app/`
- Active branch: `fix/phase6-main40-final-html-semantic-v5`
- Draft PR: `#24 Restore Phase 6 complete HTML output with semantic field locking`
- Current documentation sequence: begins at `4b04d494edad25743458626f2b3740abed2a7603`
- Preview: `https://brand-consulting-git-fix-phase6-main40-c77bea-dpes31s-projects.vercel.app/`
- Production build/contracts: PASS
- LG 퓨리케어 browser/PDF E2E: PASS
- Vercel: success
- `main`: unchanged and unmerged
- Merge gate: explicit owner approval after Preview test
- Protected rollback branches:
  - `backup/main-before-full-report-v1-2026-07-01`
  - `backup-production-stable-20260622`
- Legacy `public/template.html` remains untouched. Verified blob SHA: `22bc6937b3d672e063d4b240c5a39b9c61700fec`.

## Owner-approved output contract

- External AI returns one complete standalone HTML document, not JSON.
- Main Deck: exactly 40 pages.
- Appendix: 0 pages.
- Page 40: Decision Receipt / Close.
- Canvas: 1280×720, exact 16:9.
- Native PDF: 960×540pt.
- Pretendard; major titles weight 900.
- Korean `word-break: keep-all`.
- Exact user-entered brand name; no translation, romanization, or arbitrary abbreviation.
- Decisive Korean consulting tone.
- Raw source URLs prohibited.
- Only verified-verbatim advertising copy may be quoted.

## Current Phase 6 journey

`Step 0–5 research`
→ `complete HTML prompt download`
→ `external AI returns complete 40-page HTML`
→ `paste or HTML file upload`
→ `active-content sanitization`
→ `User Brief / Report Identity / semantic-field / DOM / cross-page / P18 validation`
→ `approved DOM reassembly`
→ `Viewer / save / reopen / Export PDF`

The Pilot owns visual structure only. External HTML DOM/CSS changes are never trusted as final output.

## User Brief Lock

The application preserves a brand-keyed Brief containing:

- exact target brand
- mandatory competitor review seeds
- strategic opponent/category convention
- client need/campaign direction
- reference note
- attachment manifest

The Brief is:

- injected into every Step 0–5 prompt;
- repeated in Phase 6;
- stored in session storage and brand-keyed local storage;
- restored for the same brand;
- separated from Competitor Registry identity.

A sentence such as `브랜드가 아니라 위생이라는 단어 자체` is treated as a strategic opponent, not a competitor brand.

## Report Identity Lock

The app fixes:

- target brand display name;
- core competitor 1–3 ranking order;
- canonical names;
- display names;
- aliases;
- Landscape candidates.

The lock applies to:

- P11 Landscape
- P12 Threat Ranking
- P13–15 Deep Dive
- P16 Product Matrix
- P18 Positioning
- P29–32 Creative History
- P33 Message Trajectory

Aliases representing the same entity are merged. The validated LG fixture treats `삼성전자` and `삼성 비스포크 정수기` as one competitor.

## Approved sample leakage protection

The approved Biznup report remains a layout source. Visible sample branding is neutralized:

- Cover `BIZNUP` → `BRAND REPORT`
- P25 `비즈넵 기회` → `브랜드 기회`
- Persona role label → `<exact brand>의 역할`
- nav/toolbar/title → exact target brand
- hardcoded brand error copy → current target brand

The final report is rejected when an unapproved sample identity remains, including `비즈넵/BIZNUP`, `삼쩜삼`, `더낸세금/혜움`, or `SSEM/쌤157`. Legitimate Registry competitors are allowed.

## External AI execution package

The downloaded file explicitly declares itself an executable request. On download, the app copies this chat-level message:

`첨부한 파일은 참고자료가 아니라 실행 지시문입니다. 파일 전체를 읽고 지금 즉시 완성된 40페이지 HTML만 생성하십시오. 계획·설명·확인 질문 없이 바로 작업하고, 결과 파일에는 <!DOCTYPE html>부터 </html>까지의 HTML만 저장하십시오.`

The output must:

- begin with `<!DOCTYPE html>`;
- end with `</html>`;
- use raw HTML without Markdown fences;
- exclude prompt instructions, source research outside report pages, and analysis notes.

## HTML file upload

Phase 6 supports `.html`, `.htm`, and `.txt`, up to 20MB.

Upload and paste both feed the same controlled textarea and use the same:

- complete-document extraction;
- active-content sanitization;
- User Brief/Identity lock;
- semantic-field validation;
- approved DOM fingerprint;
- cross-page validation;
- P18 validation;
- sample leakage gate;
- Viewer/save/reopen/PDF path.

## Semantic and security contract

- Variable content uses stable `data-report-field` keys.
- `[[CONTENT:Pxx:TAG:nnn]]`, text-node order, and generic `.contentN` are prohibited.
- `[[FIELD:semantic.key]]` and `[[POSITION:semantic.key]]` exist only in the authoring template and must all be replaced.
- Rich fields allow only `<mark>` and `<br>`.
- Other fields are plain text.
- Literal `[[...]]` is rejected.
- Scripts, handlers, JavaScript URLs, refresh redirects, forms, embeds, and autoplay media are removed or rejected.
- Returned field set and approved field set must match exactly.
- Approved DOM fingerprint must not change.

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

## Competitor flow

- P11 reviews up to five evidence-supported Direct Competitor candidates.
- P12 selects the core three when three supported candidates exist.
- P13–16, P18, and P30–33 use the same core three in ranking order.
- Do not invent a fourth or fifth core competitor.
- Hide explicit unused rows.
- Strategic opponent/category convention never becomes a competitor brand.

## P18 contract

- Axis poles are meaningful Step 2 attributes.
- Target labels normalize to `<brand> AS-IS · ...` and `<brand> TO-BE · ...`.
- Ten integer 0–100 coordinates cover three competitors and target AS-IS/TO-BE.
- x=0 left, x=100 right; y=0 top, y=100 bottom.
- AS-IS and TO-BE require meaningful separation.
- Applied positions persist in DOM data attributes.

## Creative History factuality

Canonical statuses:

- `verified-verbatim`
- `source-found-copy-unverified`
- `not-found`

Common humanized variants may be normalized on import. Only verified-verbatim copy may be quoted. Preserve independent six-year histories, Message Trajectory, and Strategic So What.

## LG 퓨리케어 validated journey

Fixture:

- target: `LG 퓨리케어 정수기`
- review seeds: 코웨이 / 삼성 비스포크 정수기 / SK매직 / 쿠쿠
- Registry core: 코웨이 / 삼성전자 / SK매직
- strategic opponent: 브랜드가 아니라 `위생`이라는 단어 자체
- client need: `위생의 격이 다른 정수기` positioning and creative package
- reference guidance: appliance advertising grammar

Deliberate external-output defects:

- target alias `LG전자`
- competitor alias `삼성 비스포크 정수기`
- unsafe script
- humanized Creative History statuses
- brandless P18 state descriptions
- custom P18 coordinates

Validated:

- User Brief in Step/Phase 6 prompt: PASS
- strategic opponent separation: PASS
- HTML file upload: PASS
- exact target identity P16/P29/P33: PASS
- core-three identity P12–18/P30–33: PASS
- Samsung alias canonicalization: PASS
- Cover `BRAND REPORT`: PASS
- P25 `브랜드 기회`: PASS
- unapproved sample identity leakage: 0
- unresolved bracket tokens: 0
- scripts: 0
- pages/navigation: 40/40
- Appendix: 0
- geometry: 1280×720
- overflow: 0
- native PDF: 40 pages, 960×540pt
- repeat export / Ctrl+P / Cmd+P: PASS
- save → reload → reopen: PASS

## Active implementation files

- `src/lib/userBriefContract.ts`
- `src/lib/installUserBriefInputNormalizer.ts`
- `src/report/reportIdentityLock.ts`
- `src/report/phase6PromptPackage.ts`
- `src/lib/installFullReportPhase6Bridge.ts`
- `src/lib/geminiCompiler.ts`
- `src/report/semanticHtmlReportV5.ts`
- `src/report/semanticReportV4.ts`
- `src/report/structuredReportCrossValidation.ts`
- `src/report/reportDomSafety.ts`
- `scripts/e2e-phase6-five-competitor-native-print.mjs`

## Superseded implementations

- PR #6: failed heuristic visualization engine
- PR #8–#10: discarded report experiments
- PR #18–#20: superseded Main40 attempts
- PR #21: JSON-only external workflow
- PR #22: obsolete 48-page HTML restoration
- PR #23: JSON-only external workflow hidden behind generic labels

## Remaining gate

Technical implementation and LG automated/visual QA are complete on the Draft branch. The remaining gate is owner testing of the Preview. Do not merge PR #24 until the owner explicitly approves.
