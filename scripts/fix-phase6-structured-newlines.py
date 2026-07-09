from pathlib import Path
import re

path = Path('src/report/structuredReportV3.ts')
text = path.read_text(encoding='utf-8')

warning_pattern = re.compile(
    r"export function formatStructuredNormalizationWarnings\(warnings: StructuredNormalizationWarning\[\]\): string \{.*?\n\}\n\nfunction validatePersonaTitleConsistency",
    re.S,
)
warning_replacement = r'''export function formatStructuredNormalizationWarnings(warnings: StructuredNormalizationWarning[]): string {
  if (!warnings.length) return '';
  const details = warnings.map((warning) => [
    `P${warning.page} · ${warning.pageTitle}`,
    warning.fieldLabel,
    `입력값: “${warning.inputValue}”`,
    `예상값: “${warning.normalizedValue}”`,
    '처리: 앱이 연도 접두어를 제거하고 자동 정규화했습니다.',
  ].join('\n')).join('\n\n');
  return `Creative History 입력 형식 ${warnings.length}건을 앱이 자동 정규화했습니다.\n\n${details}\n\n연도는 앱이 자동 배치하므로 상태 값에는 넣지 마세요.`;
}

function validatePersonaTitleConsistency'''
text, count = warning_pattern.subn(warning_replacement, text, count=1)
if count != 1:
    raise SystemExit(f'warning function replacement count: {count}')

status_pattern = re.compile(
    r"if \(definition\.kind === 'status'\) \{\n\s+const expectedValues = definition\.enum\?\.length \? definition\.enum : \[\.\.\.CREATIVE_HISTORY_STATUS_VALUES\];\n\s+if \(!expectedValues\.includes\(value\.trim\(\)\)\) \{\n\s+errors\.push\(\[.*?\n\s+\}\n\s+\}",
    re.S,
)
status_replacement = r'''if (definition.kind === 'status') {
          const expectedValues = definition.enum?.length ? definition.enum : [...CREATIVE_HISTORY_STATUS_VALUES];
          if (!expectedValues.includes(value.trim())) {
            errors.push([
              `P${definition.page} · ${pageTitleFor(page)} · ${statusFieldLabel(definition)}`,
              `입력값: “${value}”`,
              `허용값:\n${expectedValues.map((item) => `- ${item}`).join('\n')}`,
              '처리: 자동 복구할 수 없어 렌더링을 중단했습니다.',
            ].join('\n'));
          }
        }'''
text, count = status_pattern.subn(status_replacement, text, count=1)
if count != 1:
    raise SystemExit(f'status block replacement count: {count}')

path.write_text(text, encoding='utf-8')
print('fixed structuredReportV3 newline literals')
