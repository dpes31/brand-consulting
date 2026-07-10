const CREATIVE_STATUS = new Set([
  'verified-verbatim',
  'source-found-copy-unverified',
  'not-found',
]);

function clean(value: string | null | undefined): string {
  return (value || '').replace(/\s+/g, ' ').trim();
}

function comparable(value: string): string {
  return clean(value).toLowerCase().replace(/[\s·/()\[\]{}.,'"“”‘’:;-]/g, '');
}

function text(documentRef: Document, selector: string): string {
  return clean(documentRef.querySelector<HTMLElement>(selector)?.textContent);
}

function texts(documentRef: Document, selector: string): string[] {
  return Array.from(documentRef.querySelectorAll<HTMLElement>(selector)).map((node) => clean(node.textContent));
}

function assertUnique(values: string[], label: string): void {
  if (values.some((value) => !value)) throw new Error(`${label}에 빈 값이 있습니다.`);
  if (new Set(values.map(comparable)).size !== values.length) throw new Error(`${label}에 같은 값이 반복되었습니다.`);
}

function includesName(value: string, name: string): boolean {
  return comparable(value).includes(comparable(name));
}

function assertCoreCompetitorConsistency(documentRef: Document, brandName: string): void {
  const core = texts(documentRef, '#comp-ranking .ranking-interpretation > div > b');
  if (core.length !== 3) throw new Error('P12 Threat Ranking은 핵심 경쟁사 3개를 동일 너비로 보여줘야 합니다.');
  assertUnique(core, 'P12 핵심 경쟁사');
  if (core.some((name) => includesName(name, brandName))) throw new Error('P12 핵심 경쟁사에 조사 브랜드가 들어갔습니다.');

  core.forEach((name, index) => {
    const page = 13 + index;
    const deepTitle = text(documentRef, `#deep-dive-${index + 1} .full-title-row h2`);
    if (!includesName(deepTitle, name)) {
      throw new Error(`P${page} Deep Dive 제목에 P12 ${index + 1}위 경쟁사 “${name}”이 반영되지 않았습니다.`);
    }
  });

  const matrixHeaders = texts(documentRef, '#product-matrix .matrix-table thead th');
  if (matrixHeaders.length < 5) throw new Error('P16 Product Matrix의 조사 브랜드 + 핵심 경쟁사 3개 열이 부족합니다.');
  if (!includesName(matrixHeaders[1], brandName)) throw new Error(`P16 Product Matrix 조사 브랜드 열이 “${brandName}”과 일치하지 않습니다.`);
  core.forEach((name, index) => {
    if (!includesName(matrixHeaders[index + 2], name)) {
      throw new Error(`P16 Product Matrix ${index + 1}번째 경쟁사 열이 P12 “${name}”과 일치하지 않습니다.`);
    }
  });

  const mapDots = texts(documentRef, '#positioning .map-dot');
  core.forEach((name) => {
    if (!mapDots.some((dot) => includesName(dot, name))) throw new Error(`P18 Positioning에 핵심 경쟁사 “${name}”이 없습니다.`);
  });
  if (!mapDots.some((dot) => includesName(dot, brandName))) throw new Error(`P18 Positioning에 조사 브랜드 “${brandName}”이 없습니다.`);

  core.forEach((name, index) => {
    const historyTitle = text(documentRef, `#creative-history-${index + 1} .full-title-row h2`);
    if (!includesName(historyTitle, name)) {
      throw new Error(`P${31 + index} Creative History가 P12 경쟁사 “${name}”과 일치하지 않습니다.`);
    }
  });

  const trajectoryNames = texts(documentRef, '#creative-trajectory .trajectory-brand > b');
  if (!trajectoryNames.some((name) => includesName(name, brandName))) throw new Error(`P34 Message Trajectory에 조사 브랜드 “${brandName}”이 없습니다.`);
  core.forEach((name) => {
    if (!trajectoryNames.some((trajectoryName) => includesName(trajectoryName, name))) {
      throw new Error(`P34 Message Trajectory에 핵심 경쟁사 “${name}”이 없습니다.`);
    }
  });
}

function assertPositioning(documentRef: Document, brandName: string): void {
  const axes = texts(documentRef, '#positioning .axis');
  if (axes.length !== 4) throw new Error('P18 Positioning은 좌·우·상·하 4개 축 의미가 필요합니다.');
  const invalidAxis = axes.find((axis) => axis.length < 4 || /^(x|y)\s*(축|axis)?$/i.test(axis));
  if (invalidAxis) throw new Error(`P18 Positioning 축 “${invalidAxis}”은 의미가 없습니다. X축/Y축 대신 소비자가 이해할 수 있는 비교 기준을 입력해야 합니다.`);
  if (axes.some((axis) => includesName(axis, brandName))) throw new Error('P18 Positioning 축에 조사 브랜드명이 들어갔습니다. 축은 비교 기준이어야 합니다.');

  const core = texts(documentRef, '#comp-ranking .ranking-interpretation > div > b');
  core.forEach((name) => {
    if (axes.some((axis) => includesName(axis, name))) throw new Error(`P18 Positioning 축에 경쟁사명 “${name}”이 들어갔습니다.`);
  });
}

function assertPersonaAlignment(documentRef: Document): void {
  const targetNames = texts(documentRef, '#consumer-target .target-spectrum > div > b');
  const personaTitles = [1, 2, 3].map((index) => text(documentRef, `#persona-${index} .full-title-row h2`));
  assertUnique(personaTitles, 'P22~24 Persona 제목');
  personaTitles.forEach((title, index) => {
    if (!targetNames.some((target) => comparable(title) === comparable(target))) {
      throw new Error(`P${22 + index} Persona 제목 “${title}”이 P21 Core Target 세그먼트와 일치하지 않습니다.`);
    }
  });

  [1, 2, 3].forEach((index) => {
    const fixedIndex = text(documentRef, `#persona-${index} .persona-index`);
    if (fixedIndex !== `0${index}`) throw new Error(`P${21 + index} Persona 번호는 0${index}이어야 합니다.`);
    const labels = texts(documentRef, `#persona-${index} .persona-label`);
    const labelPair = labels.join('|');
    if (!['상황|핵심 Job', 'SITUATION|REAL JTBD'].includes(labelPair)) {
      throw new Error(`P${21 + index} Persona의 상황 / 핵심 Job 구조가 변경되었습니다.`);
    }
    const identityLabels = texts(documentRef, `#persona-${index} .identity-shift span`);
    const identityPair = identityLabels.join('|');
    if (!['현재 정체성|원하는 정체성', 'AS-IS IDENTITY|TO-BE IDENTITY'].includes(identityPair)) {
      throw new Error(`P${21 + index} Persona의 현재 정체성 / 원하는 정체성 구조가 변경되었습니다.`);
    }
  });
}

function assertPainRows(documentRef: Document): void {
  const rows = Array.from(documentRef.querySelectorAll<HTMLElement>('#pain-needs .pain-row'));
  if (rows.length < 3) throw new Error('P26 Pain Points & Unmet Needs의 분석 행이 부족합니다.');
  rows.forEach((row, index) => {
    const pain = clean(row.querySelector('b')?.textContent);
    const issue = clean(row.querySelector('p')?.textContent);
    const need = clean(row.querySelector('strong')?.textContent);
    const priority = clean(row.querySelector('em')?.textContent);
    if (!pain || !issue || !need || !priority) throw new Error(`P26 ${index + 1}행에 Pain / 현재 문제 / Unmet Need / 우선순위가 모두 필요합니다.`);
    if (comparable(pain) === comparable(issue) || comparable(issue) === comparable(need) || comparable(pain) === comparable(need)) {
      throw new Error(`P26 ${index + 1}행의 Pain, 현재 문제, Unmet Need가 뒤섞이거나 같은 문장으로 반복됐습니다.`);
    }
    if (priority.length > 12 || /pain|unmet|need|문제/i.test(priority)) {
      throw new Error(`P26 ${index + 1}행 우선순위 “${priority}”에 다른 열의 내용이 섞였습니다.`);
    }
  });
}

function assertAipl(documentRef: Document): void {
  const stages = Array.from(documentRef.querySelectorAll<HTMLElement>('#aipl .aipl-stage'));
  const codes = stages.map((stage) => clean(stage.querySelector('b')?.textContent));
  if (codes.join('|') !== 'A|I|P1|P2|L') throw new Error('P27 AIPL은 A → I → P1 → P2 → L 순서를 유지해야 합니다.');
  stages.forEach((stage, index) => {
    const action = clean(stage.querySelector('strong')?.textContent);
    const description = clean(stage.querySelector('p')?.textContent);
    const state = clean(stage.querySelector('em')?.textContent);
    if (!action || !description || !state) throw new Error(`P27 ${codes[index]} 단계에 행동·설명·상태가 모두 필요합니다.`);
    if (/^[→↔≠]+$/.test(action) || /^[→↔≠]+$/.test(description) || /^[→↔≠]+$/.test(state)) {
      throw new Error(`P27 ${codes[index]} 단계의 내용에 화살표가 잘못 들어갔습니다.`);
    }
    if (comparable(action) === comparable(description)) throw new Error(`P27 ${codes[index]} 단계의 행동과 설명이 같은 문장으로 뒤섞였습니다.`);
  });
}

function assertCreativeHistory(documentRef: Document): void {
  const expectedYears = ['2021', '2022', '2023', '2024', '2025', '2026 YTD'];
  documentRef.querySelectorAll<HTMLElement>('.history-original').forEach((slide) => {
    const cards = Array.from(slide.querySelectorAll<HTMLElement>('.history-card'));
    const years = cards.map((card) => clean(card.querySelector('h3')?.textContent));
    if (years.join('|') !== expectedYears.join('|')) throw new Error(`${slide.id} Creative History는 2021~2025와 2026 YTD 6개년이어야 합니다.`);
    cards.forEach((card, index) => {
      const rawStatus = clean(card.querySelector('.history-status')?.textContent);
      const status = rawStatus.toLowerCase();
      if (!CREATIVE_STATUS.has(status)) throw new Error(`${slide.id} ${expectedYears[index]} 상태 “${rawStatus}”는 허용되지 않습니다.`);
      const copy = clean(card.querySelector('blockquote')?.textContent);
      const hasQuote = /[“”"‘’']/.test(copy);
      if (status === 'verified-verbatim' && copy && !hasQuote) {
        throw new Error(`${slide.id} ${expectedYears[index]} verified-verbatim 카피는 검증된 원문임을 나타내는 따옴표가 필요합니다.`);
      }
      if (status !== 'verified-verbatim' && hasQuote) {
        throw new Error(`${slide.id} ${expectedYears[index]} 미검증 카피에는 따옴표를 사용할 수 없습니다.`);
      }
    });
  });
}

function assertStp(documentRef: Document): void {
  const segmentNames = texts(documentRef, '#stp .stp-segments > div > b');
  const target = text(documentRef, '#stp .stp-target > strong');
  const positioning = text(documentRef, '#stp .stp-position > strong');
  if (!segmentNames.some((segment) => comparable(segment) === comparable(target))) {
    throw new Error(`P38 Targeting “${target}”이 Segmentation의 후보와 연결되지 않습니다.`);
  }
  if (positioning.length < 20 || /^[→↔≠]+$/.test(positioning)) {
    throw new Error('P38 Positioning은 타깃·카테고리·차별점을 포함한 이해 가능한 문장이어야 합니다.');
  }
}

function assertStrategyClose(documentRef: Document): void {
  const rootCause = text(documentRef, '#root-cause .root-core > h3');
  const positioning = text(documentRef, '#stp .stp-position > strong');
  const winningMove = text(documentRef, '#strategy-choice .choice-final h2');
  const principle = text(documentRef, '#appendix-back .back-cover-copy > h1');
  if (rootCause.length < 20) throw new Error('P37 Root Cause가 단일 원인 문장으로 정리되지 않았습니다.');
  if (positioning.length < 20) throw new Error('P38 Positioning이 전략 문장으로 완성되지 않았습니다.');
  if (winningMove.length < 8) throw new Error('P40 Winning Move가 비어 있거나 지나치게 추상적입니다.');
  if (principle.length < 10) throw new Error('A8 Brand Principle이 보고서 전체를 압축한 완결 문장이 아닙니다.');
  if (/찾고[, ]*설명하고[, ]*지킨다/i.test(principle)) {
    throw new Error('A8 Brand Principle이 이전 샘플의 미완성 문구를 복원했습니다. P40 최종 선택을 하나의 명확한 메시지로 압축해야 합니다.');
  }
}

export function assertApprovedHtmlCrossPageConsistency(html: string, brandName: string): void {
  if (typeof DOMParser === 'undefined') throw new Error('HTML 교차 검증기를 사용할 수 없습니다.');
  const documentRef = new DOMParser().parseFromString(html, 'text/html');
  assertCoreCompetitorConsistency(documentRef, brandName);
  assertPositioning(documentRef, brandName);
  assertPersonaAlignment(documentRef);
  assertPainRows(documentRef);
  assertAipl(documentRef);
  assertCreativeHistory(documentRef);
  assertStp(documentRef);
  assertStrategyClose(documentRef);
}
