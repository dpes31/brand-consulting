from pathlib import Path

path = Path('scripts/e2e-phase6-approved-html-semantic.mjs')
text = path.read_text(encoding='utf-8')
old = "await page.getByText('외부 AI 완성 HTML 생성', { exact: true }).waitFor({ timeout: 30000 });"
new = "await page.getByRole('heading', { name: '외부 AI 완성 HTML 생성', exact: true }).waitFor({ timeout: 30000 });"
if text.count(old) != 1:
    raise SystemExit(f'Expected one heading locator, found {text.count(old)}')
path.write_text(text.replace(old, new, 1), encoding='utf-8')
