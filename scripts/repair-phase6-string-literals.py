from pathlib import Path

path = Path('src/report/structuredReportV3.ts')
text = path.read_text(encoding='utf-8')
original = text
text = text.replace("'\n\n'", "'\\n\\n'")
text = text.replace("'\n'", "'\\n'")
if text == original:
    raise SystemExit('No malformed newline string literals found.')
path.write_text(text, encoding='utf-8')
print('Repaired malformed newline string literals in structuredReportV3.ts')
