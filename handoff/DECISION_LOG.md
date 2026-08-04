# Decision Log

## D-001 — Reversible production workflow

**Decision:** All production changes use a Preview-first branch, Draft PR, explicit owner approval, and preserved rollback assets.

## D-002 — Protected assets

Never modify, force-update, or delete:

- `backup/main-before-full-report-v1-2026-07-01`
- `backup-production-stable-20260622`
- `public/template.html`, verified blob SHA `22bc6937b3d672e063d4b240c5a39b9c61700fec`

## D-003 — Preserve milestone history

Use regular merge or fast-forward. Do not squash unless explicitly approved.

## D-004 — Creative copy factuality

- `verified-verbatim`: quotation permitted
- `source-found-copy-unverified`: no reconstructed quotation
- `not-found`: disclose evidence gap

## D-005 — Rejected implementations

Do not merge or restore:

- `feature-visualization-engine-v1` / PR #6
- PR #8, #9, #10 experiments
- PR #18–#23 superseded Phase 6 attempts

## D-006 — Validated Visual Intent contracts

- Step 0: `milestone-timeline`
- Step 2: `rank-scorecard`; Product Matrix `feature-matrix`; Positioning optional
- Step 3: one `friction-flow` Brief; `implementationStatus: planned`; `metrics: []`
- Step 5: one `choice-architecture` Brief; `implementationStatus: planned`; `metrics: []`

## D-007 — Approved Pilot owns structure, not sample content

The approved Pilot provides DOM, CSS, hierarchy, order, navigation, and print structure only. Completed Biznup wording is not a generated-report source.

## D-008 — Exact user brand is immutable

Preserve the exact user-entered brand in prompts, report, navigation, toolbar, saved project, reopened project, and PDF. No translation, romanization, or arbitrary abbreviation.

## D-009 — Current report size

The current product is exactly 40 Main Deck pages, zero Appendix. Page 40 is Decision Receipt / Close. Historical 40+8 rules are superseded.

## D-010 — Candidate-five to core-three logic

P11 may review up to five Direct Competitor candidates. P12 selects the core three. P13–16, P18, and P30–33 use the same three in rank order. Do not invent competitors to fill capacity.

## D-011 — Strategic bridge pages remain

Competitive Landscape, Category Clichés, and Creative Insight remain in the Main Deck.

## D-012 — Fixed 40-page plan

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

## D-013 — Page grammar is a product contract

AI fills research content but may not redesign the meaning of Persona, AIPL, Creative History, STP, Four Directions, Final Choice, or Decision Close. Fixed labels and connector glyphs remain app-owned.

## D-014 — Consulting tone

Titles, conclusions, and SO WHAT statements use decisive Korean endings: `~한다`, `~이다`, `~다`.

## D-015 — Final Choice layout

P39 retains left Selection Criteria and right final Big IdeaL / Winning Move.

## D-016 — FULL PDF uses native print

Phase 6 FULL uses Chromium native print, exactly 40 pages, 960×540pt, embedded fonts, and no full-page JPEG raster conversion.

## D-017 — Legacy and FULL runtimes are separate

Legacy `.slide-wrapper > .slide` never owns a Phase 6 FULL `.full-slide` report.

## D-018 — Actual-button PDF E2E is mandatory

Acceptance requires the visible Export PDF button, active Viewer iframe, two consecutive exports, Ctrl+P, Cmd+P, and save → reload → reopen.

## D-019 — External AI returns HTML, never JSON

The owner-approved flow is:

`Step 0–5 → complete HTML prompt → external AI 40-page HTML → app validation and approved visual-DOM reassembly`.

`Return JSON only` and `Never return HTML` are prohibited.

## D-020 — Semantic fields replace text-order slots

Use stable role keys such as `comp-ranking.rank1.name`, not `[[CONTENT:Pxx:TAG:nnn]]`, DOM text order, or generic `.contentN` fields.

## D-021 — Rich text uses safe HTML

Rich fields permit only `<mark>` and `<br>`. Literal `[[...]]`, unresolved field tokens, and unresolved position tokens are blocking errors.

## D-022 — P18 uses semantic axes and coordinates

P18 has meaningful Step 2 axis poles and ten integer 0–100 coordinate values. Target labels include exact brand AS-IS/TO-BE and must show meaningful movement.

## D-023 — Creative History status codes are canonical

Stored and rendered values are exactly:

- `verified-verbatim`
- `source-found-copy-unverified`
- `not-found`

Common humanized variants may be normalized on import.

## D-024 — Active implementation line

Continue only on `fix/phase6-main40-final-html-semantic-v5`, Draft PR #24. Do not merge without explicit owner approval.

## D-025 — User Brief is a persistent project contract

**Decision:** Strategy Settings are not one-time prompt fragments. A brand-keyed User Brief preserves target brand, mandatory competitor review seeds, strategic opponent/category convention, client need/campaign direction, reference note, and attachment manifest.

The Brief is injected into every Step 0–5 prompt and Phase 6, and persists in session and brand-keyed local storage.

## D-026 — Strategic opponent is not a competitor identity

**Decision:** A phrase such as `브랜드가 아니라 위생이라는 단어 자체` is analyzed as a category convention/strategic opponent. It must not enter the Competitor Registry, ranking, matrix, map, or Creative History as a brand.

Mixed user input is split into company candidates and strategic-opponent text.

## D-027 — Report Identity Lock is app-owned

**Decision:** The app owns target brand and core competitor 1–3 display identity across P11–18 and P29–33.

Identity includes canonical name, display name, aliases, and rank order. Aliases such as `삼성전자` and `삼성 비스포크 정수기` are treated as one entity.

## D-028 — Sample-brand leakage is blocking

**Decision:** The approved Biznup source may supply layout but not visible content.

Neutralize Cover `BIZNUP`, P25 `비즈넵 기회`, Persona role labels, navigation, toolbar, title, and errors. Block unapproved visible sample identities.

## D-029 — Attachment execution requires a chat-level command

**Decision:** The prompt file remains self-contained, but the app also copies and displays a short chat-level execution message. The output artifact must be raw HTML from `<!DOCTYPE html>` through `</html>`, without Markdown fences, instructions, research outside pages, or analysis notes.

## D-030 — HTML upload and paste share one path

**Decision:** Phase 6 accepts `.html`, `.htm`, and `.txt` up to 20MB. File upload loads the same controlled textarea and uses the identical Sanitizer, Identity, semantic, Viewer, persistence, and PDF path as paste.

No alternate relaxed upload renderer is allowed.

## D-031 — LG 퓨리케어 is the current non-sample regression fixture

The E2E fixture uses target `LG 퓨리케어 정수기`, seeds 코웨이 / 삼성 비스포크 정수기 / SK매직 / 쿠쿠, Registry core 코웨이 / 삼성전자 / SK매직, strategic opponent `위생이라는 단어 자체`, and client need `위생의 격이 다른 정수기`.

Acceptance includes alias correction, file upload, no Biznup leakage, 40 pages, PDF, and save/reopen.

## D-032 — Large fixed visual payload is not an external-AI responsibility

**Decision:** The application owns the final CSS, visual layout, navigation, decorative DOM, and fixed report chrome. These assets must not be repeatedly transferred to and regenerated by the external AI when the AI only needs to author semantic content.

**Reason:** The measured previous Biznup prompt was 647,215 bytes, including approximately 449,802 bytes of fixed visual template. Repeated external-chat send timeouts were treated as an architecture defect, not a retry-only incident.

## D-033 — External output remains HTML through the timeout mitigation

**Decision:** Reduce payload with a compact semantic HTML workbook, not JSON.

The V6 workbook retains exactly 40 page sections, semantic keys, compact field metadata, P18 coordinate keys, and HTML authoring tokens. The app expands returned values into the approved visual Renderer and invokes the existing V5 validation chain.

This does not restore or reinterpret PR #21 or PR #23.

## D-034 — Compact semantic field metadata

**Decision:** The external workbook may use compact metadata without changing semantic identity:

- `data-k=t`: plain text
- `data-k=r`: rich text
- `data-k=s`: source
- `data-k=c`: Creative History status
- `data-m`: hard maximum length
- optional `data-e`: enum
- optional `data-y`: fixed year

Stable `data-report-field`, `[[FIELD:semantic.key]]`, and `[[POSITION:semantic.key]]` contracts remain mandatory.

## D-035 — Timeout fallback requires a separately approved deterministic merge contract

**Decision:** If the newly downloaded compact prompt still times out in a new external AI chat, preserve the exact file and error evidence. Do not silently revert to JSON, remove research, or manually concatenate unvalidated outputs.

The next fallback is a page-batch semantic HTML workflow with deterministic app-side merge and blocking completeness validation. It is not implemented or approved in the current branch.

## D-036 — Current approval state

- Draft PR: #24
- Validated implementation head before documentation: `eb3ab64398e461b7bafaec6b834d7f1348c50a67`
- Preview: `https://brand-consulting-git-fix-phase6-main40-c77bea-dpes31s-projects.vercel.app/`
- Production build: PASS
- Preview CI run `30883605720`: PASS
- LG browser/PDF E2E run `30883605708`: PASS
- Vercel: success
- `main`: unmodified
- LG fixture prompt: 129,638 bytes
- Same-volume Biznup prompt estimate: approximately 292KB, about 55% smaller than the prior 647KB prompt

Keep Draft and unmerged until the owner successfully sends the newly downloaded compact prompt in a new external AI chat, imports the returned HTML, and explicitly approves.
