from pathlib import Path
import re

path = Path('src/report/structuredReportV3.ts')
text = path.read_text(encoding='utf-8')
original = text

text, double_count = re.subn(r"'\r?\n\r?\n'", "'\\\\n\\\\n'", text)
text, single_count = re.subn(r"'\r?\n'", "'\\\\n'", text)

if text == original:
    raise SystemExit('No malformed LF/CRLF string literals found.')

path.write_text(text, encoding='utf-8')
print(f'Repaired malformed string literals: double={double_count}, single={single_count}')
