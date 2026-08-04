# Phase 6 User Brief / Report Identity Lock Handoff — 2026-08-04

## Status

- Repository: `dpes31/brand-consulting`
- Active branch: `fix/phase6-main40-final-html-semantic-v5`
- Draft PR: `#24 Restore Phase 6 complete HTML output with semantic field locking`
- Validated implementation head before this documentation sequence: `3f8b42952a7508669be0b3fd88a0db12e15a85cf`
- `main`: unchanged and unmerged
- Preview: `https://brand-consulting-git-fix-phase6-main40-c77bea-dpes31s-projects.vercel.app/`
- Production build/contracts: PASS
- LG 퓨리케어 browser/PDF E2E: PASS
- Vercel: success
- Merge gate: explicit owner approval after Preview test

## Owner-reported defects addressed

1. External AI sometimes treated the downloaded prompt as a passive attachment and did not begin HTML generation.
2. External AI sometimes saved prompt instructions, research, and HTML together in a contaminated result file.
3. Copying a large HTML result into the app could take approximately 20 minutes; file upload was required.
4. Strategy settings mixed company competitors with a non-company strategic opponent such as `위생이라는 단어 자체`.
5. Client need and reference guidance were injected only at selected steps and were not a durable project contract.
6. Target brand and competitor identities diverged across P14, P16, P18, P29–33.
7. `삼성전자` and `삼성 비스포크 정수기` were treated as different names.
8. Approved Biznup sample content leaked into another brand report:
   - Cover tag `BIZNUP`
   - P25 header `비즈넵 기회`
   - hardcoded Biznup text in a P18 error message

## Implemented architecture

### User Brief Lock

A brand-keyed persistent Brief now owns:

- exact `targetBrand`
- `mandatoryReviewSeeds`
- `strategicOpponent / categoryConvention`
- `clientNeed / campaignDirection`
- `referenceNote`
- attachment manifest

The Brief is stored in session storage and brand-keyed local storage. It is inserted into all Step 0–5 prompts and again into the Phase 6 compiler package. A separate Strategy Setting field is added for strategic opponent/category convention.

Mixed input such as:

`코웨이, 삼성 비스포크 정수기, SK매직, 쿠쿠 (이 과제의 경쟁 상대는 브랜드가 아니라 '위생'이라는 단어 자체다)`

is normalized into:

- company review seeds: 코웨이 / 삼성 비스포크 정수기 / SK매직 / 쿠쿠
- strategic opponent: 브랜드가 아니라 `위생`이라는 단어 자체

The strategic opponent is prohibited from entering the Competitor Registry as a brand.

### Report Identity Lock

The application, not the external AI, owns:

- exact target brand display name
- core competitor 1–3 ranking order
- canonical competitor name
- display name
- aliases
- Landscape candidates

Identity is forcibly applied to:

- P11 Landscape candidate names
- P12 Threat Ranking and summary names
- P13–15 Deep Dive titles
- P16 Product Matrix brand/competitor columns
- P18 Positioning brand/competitor labels
- P29–32 Creative History titles
- P33 Message Trajectory brand names

Aliases such as `삼성전자` and `삼성 비스포크 정수기` are merged into one identity. The final display follows the Registry canonical display value.

### Approved sample leakage gate

The approved Biznup source remains a layout source, but the visible report is neutralized before prompt generation and after compilation.

Fixed labels:

- Cover `BIZNUP` → `BRAND REPORT`
- P25 `비즈넵 기회` → `브랜드 기회`
- Persona label → `<exact target brand>의 역할`
- Navigation, toolbar, and document title → exact target brand
- error-message Biznup text → current target brand

The final visible report is blocked if an unapproved sample identity remains:

- 비즈넵 / BIZNUP
- 삼쩜삼
- 더낸세금 / 혜움
- SSEM / 쌤157

A sample name is permitted only when it is legitimately present in the target/Registry/alias lock.

### External AI execution package

The downloaded file now states that the attachment itself is a complete execution request. It includes a chat-level execution message:

> 첨부한 파일은 참고자료가 아니라 실행 지시문입니다. 파일 전체를 읽고 지금 즉시 완성된 40페이지 HTML만 생성하십시오. 계획·설명·확인 질문 없이 바로 작업하고, 결과 파일에는 <!DOCTYPE html>부터 </html>까지의 HTML만 저장하십시오.

On download, this short execution message is copied to the clipboard. Phase 6 also displays a dedicated copy button.

The package uses explicit boundaries for:

- User Brief Lock
- Report Identity Lock
- compiler instructions
- Step 0–5 source research
- immutable semantic template

The final artifact must begin with `<!DOCTYPE html>` and end with `</html>`. Markdown fences, prompt instructions, research text, or analysis notes outside the HTML are prohibited.

### HTML file upload

Phase 6 accepts:

- `.html`
- `.htm`
- `.txt`
- maximum 20MB

File content is loaded into the same controlled textarea. Paste and upload therefore use the identical:

- complete-HTML extraction
- active-content sanitization
- User Brief/Identity lock
- semantic-field validation
- DOM fingerprint validation
- cross-page validation
- P18 validation
- sample leakage gate
- Viewer/save/reopen/PDF path

No alternate or less secure upload renderer exists.

## LG 퓨리케어 E2E fixture

The final automated journey uses:

- target brand: `LG 퓨리케어 정수기`
- review seeds: 코웨이 / 삼성 비스포크 정수기 / SK매직 / 쿠쿠
- core Registry: 코웨이 / 삼성전자 / SK매직
- strategic opponent: 브랜드가 아니라 `위생`이라는 단어 자체
- client need: `위생의 격이 다른 정수기` positioning and creative package
- reference guidance: large-appliance advertising grammar

The simulated external HTML deliberately contains:

- target brand alias `LG전자`
- competitor alias `삼성 비스포크 정수기`
- unsafe script
- humanized Creative History status
- brandless P18 AS-IS/TO-BE copy
- custom P18 coordinates

The app must correct or reject these according to the contract.

## Validated results

- Prompt contains User Brief and Identity locks: PASS
- Strategic opponent separated from competitor input: PASS
- HTML file upload: PASS
- Paste/upload use the same validation path: PASS
- exact target brand on P16/P29/P33: PASS
- core-three continuity on P12–18 and P30–33: PASS
- Samsung alias canonicalization: PASS
- Cover tag `BRAND REPORT`: PASS
- P25 header `브랜드 기회`: PASS
- unapproved `비즈넵/BIZNUP` leakage: 0
- unapproved sample competitor leakage: 0
- unresolved `[[...]]`: 0
- scripts in compiled report: 0
- P18 axes and dynamic coordinates: PASS
- exact pages/navigation: 40/40
- Appendix: 0
- logical geometry: 1280×720
- overflow: 0 pages
- native PDF: 40 pages, 960×540pt
- repeated Export PDF / Ctrl+P / Cmd+P: PASS
- save → reload → reopen: PASS

## Active implementation files

- `src/lib/userBriefContract.ts`
- `src/lib/installUserBriefInputNormalizer.ts`
- `src/report/reportIdentityLock.ts`
- `src/report/phase6PromptPackage.ts`
- `src/lib/installFullReportPhase6Bridge.ts`
- `src/lib/geminiCompiler.ts`
- `src/main.tsx`
- `scripts/e2e-phase6-five-competitor-native-print.mjs`

Duplicate inactive implementations were removed before final validation.

## Owner Preview test

1. Open the Preview URL.
2. Enter `LG 퓨리케어 정수기`.
3. In Strategy Settings, enter the company candidates and strategic-opponent sentence together once; confirm they split into separate fields.
4. Confirm client need and reference guidance remain visible.
5. Complete Step 0–5 and download a new Phase 6 prompt.
6. Attach the prompt to the external AI and paste the automatically copied execution sentence.
7. Download the generated `.html` file.
8. Use the new Phase 6 HTML file upload control.
9. Render and check P14, P16, P18, P25, P29, and P33.
10. Confirm no `비즈넵/BIZNUP` remains unless Biznup is a legitimate Registry competitor.
11. Export PDF once and reopen the saved project.

Do not merge PR #24 until the owner explicitly approves this Preview journey.
