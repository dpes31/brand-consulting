from pathlib import Path

VALIDATED_HEAD = 'd3b2ebd104d6bfddb90ba3051f92a9710b3a2a07'
PREVIEW = 'https://brand-consulting-git-fix-phase6-structu-0fd4b6-dpes31s-projects.vercel.app/'
MARKER = '<!-- PHASE6_EXTERNAL_JSON_COMPLETION_2026-07-09 -->'

COMMON = f'''\n\n{MARKER}\n## Phase 6 external-AI JSON workflow implementation — 2026-07-09\n\n- Active branch: `fix/phase6-structured-report-renderer-v1`\n- Draft PR: `#21 Replace Phase 6 HTML generation with app-owned structured renderer`\n- Validated product-code head: `{VALIDATED_HEAD}`\n- Vercel Preview: `{PREVIEW}`\n- `main`: unchanged; PR #21 remains Draft and unmerged.\n- `public/template.html` and protected backup branches remain untouched.\n\nImplemented:\n\n- Phase 6 shows the explicit five-step external-AI JSON workflow.\n- The primary input accepts raw JSON, fenced JSON, `.json`, and `.txt` responses.\n- `기존 완성 HTML 가져오기 — 호환용` is a separate secondary path.\n- Creative History uses `[CREATIVE HISTORY DATA CONTRACT]`; AI-facing DOM/class/data-attribute instructions were removed.\n- Every Creative History status field exposes the exact enum and fixed year metadata, including `2026 YTD`.\n- Only exact `expected year · allowed status` values are normalized; every repair emits a page/field warning and strict validation runs afterward.\n- Unknown status, mismatched year, composite status, and arbitrary values remain blocking errors with Korean page/field guidance.\n- External manual JSON and internal Gemini API routes use the same ProductionReportV3 schema, normalization, strict validation, cross-page validation, and app-owned Renderer.\n\nValidated at `{VALIDATED_HEAD}`:\n\n- `npm run build`: PASS\n- FULL report contract test: PASS\n- FULL report runtime test: PASS\n- Phase 6 structured Renderer E2E: PASS\n- external-AI JSON workflow synthetic fixtures: 2 complete 40-page responses PASS\n- masked owner-defect fixture: `YYYY · status` normalization PASS; `2022 · unknown` blocking PASS\n- HTML Sanitizer compatibility E2E: PASS\n- 40 `.full-slide`, 40 navigation links, Appendix 0, 1280×720, scale(1), zero overflow, zero script, save/reload/reopen: PASS\n- Export PDF twice, Ctrl+P, Cmd+P: PASS\n- PDF: 40 pages, 960×540pt, embedded Pretendard, no full-page raster fallback: PASS\n- Vercel Preview: Ready\n\nExternal-AI verification boundary:\n\n- Actual corrected-prompt calls were not run because this execution environment has no external Gemini/third-party AI credential or invocation tool.\n- Two deterministic complete synthetic responses and the masked real defect structure were validated in browser E2E.\n- Owner Preview QA with two real external-AI responses remains a pre-merge approval gate.\n'''


def append_once(path: str, block: str = COMMON) -> None:
    file = Path(path)
    text = file.read_text(encoding='utf-8')
    if MARKER not in text:
        file.write_text(text.rstrip() + block + '\n', encoding='utf-8')


def replace_if_present(path: str, old: str, new: str) -> None:
    file = Path(path)
    text = file.read_text(encoding='utf-8')
    if old in text:
        file.write_text(text.replace(old, new, 1), encoding='utf-8')

replace_if_present(
    'AGENTS.md',
    '- Validated implementation head before the latest handoff-only update: `8a4601d7a4895e32a521112f467d75af40678b86`\n- Latest handoff commit: `7a86313edee9ee64dcb9d79b9f5d954a7bc45604`\n- Production build/contracts at validated head: PASS\n- Phase 6 browser/PDF E2E at validated head: PASS',
    f'- Validated Phase 6 external-JSON implementation head: `{VALIDATED_HEAD}`\n- Production build/contracts: PASS\n- Phase 6 structured Renderer, HTML Sanitizer, Viewer persistence, and PDF E2E: PASS',
)
append_once('AGENTS.md')

replace_if_present(
    'handoff/PROJECT_HANDOFF.md',
    '- Validated implementation head before the latest handoff-only commits: `8a4601d7a4895e32a521112f467d75af40678b86`\n- Latest handoff commits:\n  - `7a86313edee9ee64dcb9d79b9f5d954a7bc45604`\n  - `6798cc75949c1aee29a2d13226e8d3b00815c25a`',
    f'- Validated Phase 6 external-JSON implementation head: `{VALIDATED_HEAD}`',
)
append_once('handoff/PROJECT_HANDOFF.md')
append_once('handoff/PHASE6_REAL_WORLD_QA_HANDOFF_2026-07-08.md')
append_once('handoff/PHASE6_EXTERNAL_AI_JSON_WORKFLOW_QA_2026-07-09.md')

WORK_LOG_BLOCK = COMMON.replace(
    '## Phase 6 external-AI JSON workflow implementation — 2026-07-09',
    '## 2026-07-09 — Phase 6 external-AI JSON workflow implementation and QA',
)
append_once('handoff/WORK_LOG.md', WORK_LOG_BLOCK)

DECISION_BLOCK = f'''\n\n{MARKER}\n## D-025 — Phase 6 external-AI JSON workflow is implemented and code-validated\n\n**Decision:** Keep ProductionReportV3 JSON as the sole AI-authored production contract. The application owns the fixed 40-page HTML/CSS Renderer.\n\n**Implementation:**\n\n- explicit five-step external-AI JSON UX;\n- data-only Creative History prompt;\n- exact status enum and fixed-year metadata;\n- constrained `expected year · exact enum` compatibility normalization;\n- Korean page/field warnings and blocking errors;\n- one shared manual/API contract and Renderer;\n- complete-HTML import isolated as sanitized compatibility only.\n\n**Validated product-code head:** `{VALIDATED_HEAD}`.\n\n**Automated gates:** build/contracts, structured Renderer, masked owner-defect normalization, invalid-status rejection, HTML Sanitizer, persistence, native PDF, repeated export, Ctrl+P, Cmd+P all PASS.\n\n**Remaining gate:** two owner-run real external-AI responses and owner Preview approval. PR #21 stays Draft; `main` remains unchanged.\n'''
append_once('handoff/DECISION_LOG.md', DECISION_BLOCK)

replace_if_present(
    'docs/REPORT_TEMPLATE_SPEC.md',
    '''The approved Pilot is the layout source only. Its completed Biznup wording is not a valid content source. Before prompt export, every variable sample-content unit becomes a neutral `[[CONTENT:...]]` slot rebuilt from current Step 0–5 research.\n\n## Production compilation contract\n\nThe normal Phase 6 flow is:\n\n`Step 0–5 research`\n→ `approved Pilot DOM/CSS capture after Main40 transform`\n→ `sample-content neutralization`\n→ `research-driven slot filling`\n→ `blocking validation`\n→ `standalone 40-page HTML`\n→ `Viewer / save / reopen / native PDF`''',
    '''The approved Pilot is the layout source only. Its completed Biznup wording is not a valid content source. AI never authors the report DOM.\n\n## Production compilation contract\n\nThe normal Phase 6 flow is:\n\n`Step 0–5 research`\n→ `external AI or internal API returns ProductionReportV3 page-scoped JSON`\n→ `enum, fixed-year, maxLength, factuality, and cross-page validation`\n→ `app-owned fixed 40-page DOM/CSS Renderer`\n→ `standalone 40-page HTML`\n→ `Viewer / save / reopen / native PDF`''',
)
replace_if_present('docs/REPORT_TEMPLATE_SPEC.md', 'No unresolved `CONTENT SLOT` may remain.', 'No unknown field, unresolved required value, invalid enum, raw URL, or model-authored HTML may pass validation.')
append_once('docs/REPORT_TEMPLATE_SPEC.md')

PDF_BLOCK = COMMON.replace(
    '## Phase 6 external-AI JSON workflow implementation — 2026-07-09',
    '## Phase 6 external-JSON PDF regression record — 2026-07-09',
)
append_once('docs/PDF_EXPORT_E2E_STANDARD.md', PDF_BLOCK)

error_log = Path('phase6-apply-error.txt')
if error_log.exists():
    error_log.unlink()

print('Phase 6 documentation finalized')
