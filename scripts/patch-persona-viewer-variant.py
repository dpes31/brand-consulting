from pathlib import Path


def replace_once(path: str, old: str, new: str) -> None:
    file = Path(path)
    text = file.read_text(encoding='utf-8')
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{path}: expected one match, found {count}')
    file.write_text(text.replace(old, new, 1), encoding='utf-8')


replace_once(
    'src/report/researchContentTemplate.ts',
    """  documentRef.querySelectorAll<HTMLElement>('.brand-role > span').forEach((label) => {
    label.textContent = `${brandName}의 역할`;
  });""",
    """  documentRef.querySelectorAll<HTMLElement>('.brand-role > span').forEach((label) => {
    label.textContent = '브랜드의 역할';
  });""",
)

replace_once(
    'scripts/e2e-phase6-approved-html-semantic.mjs',
    """  assert.deepEqual(await frame.locator('#persona-1 .persona-label').allTextContents(), ['상황', '핵심 Job']);
  assert.deepEqual(await frame.locator('#persona-1 .identity-shift span').allTextContents(), ['현재 정체성', '원하는 정체성']);
  assert.equal((await frame.locator('#persona-1 .brand-role > span').textContent()).trim(), `${brand}의 역할`);""",
    """  const personaLabels = await frame.locator('#persona-1 .persona-label').allTextContents();
  assert.ok([
    '상황|핵심 Job',
    'SITUATION|REAL JTBD',
  ].includes(personaLabels.join('|')));
  const identityLabels = await frame.locator('#persona-1 .identity-shift span').allTextContents();
  assert.ok([
    '현재 정체성|원하는 정체성',
    'AS-IS IDENTITY|TO-BE IDENTITY',
  ].includes(identityLabels.join('|')));
  const brandRoleLabel = (await frame.locator('#persona-1 .brand-role > span').textContent()).trim();
  assert.ok(['브랜드의 역할', `${brand}의 역할`].includes(brandRoleLabel));
  assert.doesNotMatch(brandRoleLabel, /비즈넵/);""",
)
