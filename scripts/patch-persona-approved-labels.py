from pathlib import Path


def replace_once(path: str, old: str, new: str) -> None:
    file = Path(path)
    text = file.read_text(encoding='utf-8')
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{path}: expected one match, found {count}')
    file.write_text(text.replace(old, new, 1), encoding='utf-8')


replace_once(
    'src/report/approvedHtmlCrossValidation.ts',
    """    const labels = texts(documentRef, `#persona-${index} .persona-label`);
    if (labels.join('|') !== 'SITUATION|REAL JTBD') throw new Error(`P${21 + index} Persona의 SITUATION / REAL JTBD 구조가 변경되었습니다.`);
    const identityLabels = texts(documentRef, `#persona-${index} .identity-shift span`);
    if (identityLabels.join('|') !== 'AS-IS IDENTITY|TO-BE IDENTITY') throw new Error(`P${21 + index} Persona 정체성 구조가 변경되었습니다.`);""",
    """    const labels = texts(documentRef, `#persona-${index} .persona-label`);
    const labelPair = labels.join('|');
    if (!['상황|핵심 Job', 'SITUATION|REAL JTBD'].includes(labelPair)) {
      throw new Error(`P${21 + index} Persona의 상황 / 핵심 Job 구조가 변경되었습니다.`);
    }
    const identityLabels = texts(documentRef, `#persona-${index} .identity-shift span`);
    const identityPair = identityLabels.join('|');
    if (!['현재 정체성|원하는 정체성', 'AS-IS IDENTITY|TO-BE IDENTITY'].includes(identityPair)) {
      throw new Error(`P${21 + index} Persona의 현재 정체성 / 원하는 정체성 구조가 변경되었습니다.`);
    }""",
)

replace_once(
    'src/report/researchContentTemplate.ts',
    """  const brand = documentRef.querySelector<HTMLElement>('.full-report-brand');
  if (brand) brand.textContent = brandName;
  const toolbar = documentRef.querySelector<HTMLElement>('.full-report-toolbar strong');""",
    """  const brand = documentRef.querySelector<HTMLElement>('.full-report-brand');
  if (brand) brand.textContent = brandName;
  documentRef.querySelectorAll<HTMLElement>('.brand-role > span').forEach((label) => {
    label.textContent = `${brandName}의 역할`;
  });
  const toolbar = documentRef.querySelector<HTMLElement>('.full-report-toolbar strong');""",
)

replace_once(
    'src/report/researchSlotPrompt.ts',
    """- Fixed labels include WANT, AVOID, Evidence, Core Desire, Appeal, Threat Mechanism, Attack Point, Pain, 현재 문제, Unmet Need, 우선순위, A, I, P1, P2, L, SITUATION, REAL JTBD, AS-IS IDENTITY, TO-BE IDENTITY, SEGMENTATION, TARGETING, POSITIONING, SO WHAT, and all arrows.""",
    """- Fixed labels include WANT, AVOID, Evidence, Core Desire, Appeal, Threat Mechanism, Attack Point, Pain, 현재 문제, Unmet Need, 우선순위, A, I, P1, P2, L, 상황, 핵심 Job, 현재 정체성, 원하는 정체성, SEGMENTATION, TARGETING, POSITIONING, SO WHAT, and all arrows.""",
)

replace_once(
    'scripts/e2e-phase6-approved-html-semantic.mjs',
    """  assert.deepEqual(await frame.locator('#persona-1 .persona-label').allTextContents(), ['SITUATION', 'REAL JTBD']);""",
    """  assert.deepEqual(await frame.locator('#persona-1 .persona-label').allTextContents(), ['상황', '핵심 Job']);
  assert.deepEqual(await frame.locator('#persona-1 .identity-shift span').allTextContents(), ['현재 정체성', '원하는 정체성']);
  assert.equal((await frame.locator('#persona-1 .brand-role > span').textContent()).trim(), `${brand}의 역할`);""",
)
