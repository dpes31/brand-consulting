from pathlib import Path

path = Path('scripts/e2e-phase6-approved-html-semantic.mjs')
text = path.read_text(encoding='utf-8')
old = "set('#strategy-choice .choice-final h2', '판단 설명서');"
new = "set('#strategy-choice .choice-final h2', '판단 근거·책임 설명서');"
if text.count(old) != 1:
    raise SystemExit(f'Expected one Winning Move fixture, found {text.count(old)}')
path.write_text(text.replace(old, new, 1), encoding='utf-8')
