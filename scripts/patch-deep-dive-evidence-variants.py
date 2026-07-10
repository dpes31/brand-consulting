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
    """function annotateDeepDive(slide: HTMLElement, index: number): void {
  registerField(slide.querySelector('.deep-dive-score > strong'), `deep-dive-${index}.score`, `핵심 경쟁사 ${index} 위협 점수`, 4, 'number');
  registerIndexed(
    slide,
    '.deep-node--1 li',
    `deep-dive-${index}.evidence`,
    `Deep Dive ${index} Evidence 근거`,
    72,
    'rich',
  );
  const parts = ['coreDesire', 'appeal', 'threatMechanism', 'attackPoint'];
  const paragraphs = slide.querySelectorAll<HTMLElement>(
    '.deep-node--2 > p, .deep-node--3 > p, .deep-node--4 > p, .deep-node--5 > p',
  );
  Array.from(paragraphs).forEach((node, partIndex) => {
    const part = parts[partIndex] || `part${partIndex + 1}`;
    registerField(node, `deep-dive-${index}.${part}`, `Deep Dive ${index} ${part}`, 150, 'rich');
  });
  registerSource(slide.querySelector('.full-source'), `deep-dive-${index}.source`, `Deep Dive ${index} 출처명 · 자료명 · 연도`);
}""",
    """function annotateDeepDive(slide: HTMLElement, index: number): void {
  registerField(slide.querySelector('.deep-dive-score > strong'), `deep-dive-${index}.score`, `핵심 경쟁사 ${index} 위협 점수`, 4, 'number');
  const evidenceItems = slide.querySelectorAll<HTMLElement>('.deep-node--1 li');
  if (evidenceItems.length > 0) {
    Array.from(evidenceItems).forEach((item, evidenceIndex) => {
      registerField(
        item,
        `deep-dive-${index}.evidence.${evidenceIndex + 1}`,
        `Deep Dive ${index} Evidence 근거 ${evidenceIndex + 1}`,
        72,
        'rich',
      );
    });
  } else {
    registerField(
      slide.querySelector('.deep-node--1 > p'),
      `deep-dive-${index}.evidence.summary`,
      `Deep Dive ${index} Evidence 요약`,
      150,
      'rich',
    );
  }
  const parts = ['coreDesire', 'appeal', 'threatMechanism', 'attackPoint'];
  const paragraphs = slide.querySelectorAll<HTMLElement>(
    '.deep-node--2 > p, .deep-node--3 > p, .deep-node--4 > p, .deep-node--5 > p',
  );
  Array.from(paragraphs).forEach((node, partIndex) => {
    const part = parts[partIndex] || `part${partIndex + 1}`;
    registerField(node, `deep-dive-${index}.${part}`, `Deep Dive ${index} ${part}`, 150, 'rich');
  });
  registerSource(slide.querySelector('.full-source'), `deep-dive-${index}.source`, `Deep Dive ${index} 출처명 · 자료명 · 연도`);
}""",
)

replace_once(
    'scripts/e2e-phase6-approved-html-semantic.mjs',
    """      setAll(`${id} .deep-node--1 li`, [
        `${name}의 공식 활동 근거`,
        `${name}의 제품·서비스 증거`,
        `${name}의 커뮤니케이션 증거`,
      ]);
      setAll(`${id} .deep-node--2 > p, ${id} .deep-node--3 > p, ${id} .deep-node--4 > p, ${id} .deep-node--5 > p`, [
        '고객이 실제로 원하는 진보',
        '고객을 움직이는 핵심 소구',
        '선택을 만드는 구조적 메커니즘',
        `${brandName}이 피하고 공략할 빈틈`,
      ]);""",
    """      const evidenceNodes = [...document.querySelectorAll(`${id} .deep-node--1 li, ${id} .deep-node--1 > p`)];
      if (evidenceNodes.length === 1) {
        evidenceNodes[0].textContent = `${name}의 공식 활동·제품·커뮤니케이션 증거`;
      } else if (evidenceNodes.length >= 3) {
        [`${name}의 공식 활동 근거`, `${name}의 제품·서비스 증거`, `${name}의 커뮤니케이션 증거`]
          .forEach((value, evidenceIndex) => { evidenceNodes[evidenceIndex].textContent = value; });
      } else {
        throw new Error(`Missing Evidence nodes: ${id}`);
      }
      setAll(`${id} .deep-node--2 > p, ${id} .deep-node--3 > p, ${id} .deep-node--4 > p, ${id} .deep-node--5 > p`, [
        '고객이 실제로 원하는 진보',
        '고객을 움직이는 핵심 소구',
        '선택을 만드는 구조적 메커니즘',
        `${brandName}이 피하고 공략할 빈틈`,
      ]);""",
)
