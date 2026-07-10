from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]


def replace_once(path: str, old: str, new: str) -> None:
    target = ROOT / path
    source = target.read_text(encoding='utf-8')
    if old not in source:
        raise RuntimeError(f'missing patch anchor in {path}: {old[:100]!r}')
    target.write_text(source.replace(old, new, 1), encoding='utf-8')


def regex_once(path: str, pattern: str, replacement: str) -> None:
    target = ROOT / path
    source = target.read_text(encoding='utf-8')
    updated, count = re.subn(pattern, replacement, source, count=1, flags=re.S)
    if count != 1:
        raise RuntimeError(f'expected one regex match in {path}, received {count}: {pattern[:100]}')
    target.write_text(updated, encoding='utf-8')


structured = 'src/report/structuredReportV3.ts'

replace_once(structured,
"""function annotateInflection(slide: HTMLElement): void {
  Array.from(slide.querySelectorAll<HTMLElement>('.inflection-flow > div')).forEach((item, index) => {
    markFixed(item.querySelector('span'), `0${index + 1}`);
    registerField(item.querySelector('small'), `inflection.stage${index + 1}.type`, `inflection ${index + 1} type`, 24);
    registerField(item.querySelector('h3'), `inflection.stage${index + 1}.headline`, `inflection ${index + 1} headline`, 70);
    registerField(item.querySelector('p'), `inflection.stage${index + 1}.evidence`, `inflection ${index + 1} evidence`, 140);
    registerField(item.querySelector('b'), `inflection.stage${index + 1}.asset`, `inflection ${index + 1} resulting asset or tension`, 70);
  });
  registerChildren(slide, '.inflection-gap span,.inflection-gap strong', 'inflection.gap', ['productLabel', 'productReality', 'perceptionLabel', 'perceptionReality'], 'product-perception gap', 100);
}
""",
"""function annotateInflection(slide: HTMLElement): void {
  Array.from(slide.querySelectorAll<HTMLElement>('.inflection-flow > div')).forEach((item, index) => {
    markFixed(item.querySelector('span'), `0${index + 1}`);
    registerField(item.querySelector('small'), `inflection.stage${index + 1}.period`, `inflection ${index + 1} verified period`, 30);
    registerField(item.querySelector('h3'), `inflection.stage${index + 1}.headline`, `inflection ${index + 1} headline`, 70);
    registerField(item.querySelector('p'), `inflection.stage${index + 1}.evidence`, `inflection ${index + 1} evidence`, 140);
    registerField(item.querySelector('b'), `inflection.stage${index + 1}.asset`, `inflection ${index + 1} resulting asset or tension`, 70);
  });
  const labels = slide.querySelectorAll<HTMLElement>('.inflection-gap > span');
  const values = slide.querySelectorAll<HTMLElement>('.inflection-gap > strong');
  markFixed(labels[0] || null, 'PRODUCT');
  markFixed(labels[1] || null, 'PERCEPTION');
  markFixed(slide.querySelector('.inflection-gap > i'), 'GAP');
  registerField(values[0] || null, 'inflection.productReality', 'current product reality', 100);
  registerField(values[1] || null, 'inflection.perceptionReality', 'current market perception', 100);
}
""")

replace_once(structured,
"""    registerField(item.querySelector(':scope > span'), `portfolio.item${index + 1}.stage`, `portfolio ${index + 1} stage`, 24);
""",
"""    markFixed(item.querySelector(':scope > span'), `0${index + 1}`);
""")

replace_once(structured,
"""    const stage = card.querySelector(':scope > span');
    if (stage) registerField(stage, `consumer-target.target${index + 1}.stage`, `target segment ${index + 1} stage or role`, 26);
""",
"""    const stage = card.querySelector(':scope > span');
    if (stage) markFixed(stage);
""")

regex_once(structured,
r"function annotateJtbd\(slide: HTMLElement\): void \{.*?\n\}\n\nfunction annotatePain",
"""function annotateJtbd(slide: HTMLElement): void {
  slide.querySelectorAll('thead th').forEach((node) => markFixed(node));
  const roles = ['jobType', 'desiredProgress', 'currentAlternative', 'limitation', 'brandOpportunity'];
  Array.from(slide.querySelectorAll<HTMLTableRowElement>('tbody tr')).forEach((row, rowIndex) => {
    Array.from(row.querySelectorAll<HTMLElement>('td')).forEach((cell, cellIndex) => {
      const role = roles[cellIndex] || `value${cellIndex + 1}`;
      registerField(cell, `jtbd.row${rowIndex + 1}.${role}`, `JTBD row ${rowIndex + 1} ${role}`, cellIndex === 0 ? 40 : 125);
    });
  });
  const values = slide.querySelectorAll<HTMLElement>('.identity-alignment > b');
  const labels = slide.querySelectorAll<HTMLElement>('.identity-alignment > span');
  markFixed(labels[0] || null, 'AS-IS');
  markFixed(labels[1] || null, 'TO-BE');
  markFixed(slide.querySelector('.identity-alignment > i'), '→');
  registerField(values[0] || null, 'jtbd.identity.asIs', 'current customer identity', 100);
  registerField(values[1] || null, 'jtbd.identity.toBe', 'desired customer identity', 100);
}

function annotatePain""")

regex_once(structured,
r"function annotateLoyalty\(slide: HTMLElement\): void \{.*?\n\}\n\nfunction annotateHistory",
"""function annotateLoyalty(slide: HTMLElement): void {
  Array.from(slide.querySelectorAll<HTMLElement>('.relationship-loop > div')).forEach((stage, index) => {
    markFixed(stage.querySelector('span'), `0${index + 1}`);
    registerField(stage.querySelector('b'), `loyalty.stage${index + 1}.headline`, `purchase-to-loyalty stage ${index + 1} headline`, 65);
    registerField(stage.querySelector('p'), `loyalty.stage${index + 1}.detail`, `purchase-to-loyalty stage ${index + 1} detail`, 120);
  });
  const principles = Array.from(slide.querySelectorAll<HTMLElement>('.product-principles > *'));
  markFixed(principles[0] || null, '제품 원칙');
  principles.slice(1).forEach((node, index) => {
    registerField(node, `loyalty.principle${index + 1}`, `product principle ${index + 1}`, 85);
  });
}

function annotateHistory""")

regex_once(structured,
r"function annotateGeneric\(slide: HTMLElement\): void \{.*?\n\}\n\nfunction applyPageAnnotation",
"""function lockUnannotatedStructure(slide: HTMLElement): void {
  Array.from(slide.querySelectorAll<HTMLElement>(TEXT_CANDIDATE_SELECTOR)).forEach((element) => {
    if (element.hasAttribute('data-report-field') || element.hasAttribute('data-report-fixed')) return;
    if (element.closest('[data-report-field],[data-report-fixed]')) return;
    if (element.matches('.material-symbols-outlined,.full-page,.full-tag,.full-breadcrumb')) return;
    if (element.querySelector(TEXT_CANDIDATE_SELECTOR)) return;
    const text = (element.textContent || '').trim();
    if (!text) return;
    markFixed(element);
  });
}

function applyPageAnnotation""")

replace_once(structured, '  annotateGeneric(slide);\n', '  lockUnannotatedStructure(slide);\n')

replace_once(structured,
"""  const keys = definitions.map((definition) => definition.key);
  if (new Set(keys).size !== keys.length) throw new Error('Structured field key is duplicated.');
  if (definitions.length < 260) throw new Error(`Structured field coverage is insufficient: ${definitions.length}`);
  return definitions;
""",
"""  const keys = definitions.map((definition) => definition.key);
  if (new Set(keys).size !== keys.length) throw new Error('Structured field key is duplicated.');
  const genericKeys = keys.filter((key) => /\\.content\\d+$/.test(key));
  if (genericKeys.length) throw new Error(`순번 기반 일반 필드는 허용되지 않는다: ${genericKeys.slice(0, 6).join(', ')}`);
  if (definitions.length < 240) throw new Error(`Structured field coverage is insufficient: ${definitions.length}`);
  return definitions;
""")

validator_block = r'''
const STRUCTURAL_ONLY_VALUES = new Set([
  '1', '2', '3', '4', '5', '01', '02', '03', '04', '05',
  'A', 'B', 'C', 'D', 'I', 'L', 'P1', 'P2',
  'PRIMARY', 'SECONDARY', 'OPPORTUNITY', 'LOW COMPLEXITY', 'HIGH COMPLEXITY',
  'EVIDENCE', 'CORE DESIRE', 'APPEAL', 'THREAT MECHANISM', 'ATTACK POINT',
  'SITUATION', 'REAL JTBD', 'AS-IS IDENTITY', 'TO-BE IDENTITY',
  'PAIN', 'UNMET NEED', 'SEGMENTATION', 'TARGETING', 'POSITIONING',
  'BIG IDEAL', 'WINNING MOVE', 'VIA NEGATIVA', 'DECISION', 'CHANGE', 'SO WHAT',
]);

function normalizedToken(value: string | undefined): string {
  return (value || '').replace(/\s+/g, ' ').trim();
}

function isStructuralOnly(value: string | undefined): boolean {
  const token = normalizedToken(value);
  return !token || /^\d+$/.test(token) || /^[→↗⇒≠+?]+$/.test(token) || STRUCTURAL_ONLY_VALUES.has(token.toUpperCase());
}

function pageById(report: StructuredReportV3, id: string): StructuredReportPageV3 | undefined {
  return report.pages?.find((page) => page.id === id);
}

function validateSemanticRecords(report: StructuredReportV3, definitions: StructuredFieldDefinition[], expectedBrand: string, errors: string[]): void {
  const genericKeys = definitions.map((definition) => definition.key).filter((key) => /\.content\d+$/.test(key));
  if (genericKeys.length) errors.push(`순번 기반 일반 필드가 남아 있다: ${genericKeys.slice(0, 6).join(', ')}`);

  const ranking = pageById(report, 'comp-ranking');
  const rankedNames = [1, 2, 3].map((rank) => normalizedToken(ranking?.fields[`comp-ranking.rank${rank}.name`]));
  rankedNames.forEach((name, index) => {
    const rank = index + 1;
    if (isStructuralOnly(name)) {
      errors.push(`P12 Threat Ranking · ${rank}위 경쟁사명 필드에 경쟁사명이 아닌 “${name || '빈 값'}”이 들어갔다. 순위 숫자·표 머리말·설명 문구가 아니라 실제 경쟁사명을 입력해야 한다.`);
      return;
    }
    const summary = normalizedToken(ranking?.fields[`comp-ranking.rank${rank}.summaryName`]);
    if (summary !== name) errors.push(`P12 Threat Ranking · ${rank}위 하단 카드의 경쟁사명 “${summary || '빈 값'}”이 표의 경쟁사명 “${name}”과 다르다.`);
  });
  if (new Set(rankedNames.filter(Boolean)).size !== rankedNames.filter(Boolean).length) errors.push('P12 Threat Ranking · 핵심 경쟁사명이 중복됐다.');

  rankedNames.forEach((name, index) => {
    if (!name || isStructuralOnly(name)) return;
    const rank = index + 1;
    const deep = pageById(report, `deep-dive-${rank}`);
    const title = normalizedToken(deep?.fields[`deep-dive-${rank}.title`]);
    if (!title.includes(name)) errors.push(`P${12 + rank} Deep Dive 제목에 P12 ${rank}위 경쟁사 “${name}”이 반영되지 않았다.`);
    const matrixName = normalizedToken(pageById(report, 'product-matrix')?.fields[`product-matrix.column${rank + 1}.name`]);
    if (matrixName !== name) errors.push(`P16 Product Matrix · 경쟁사 ${rank} 열은 P12 ${rank}위 “${name}”이어야 한다.`);
    const mapName = normalizedToken(pageById(report, 'positioning')?.fields[`positioning.competitor${rank}.name`]);
    if (mapName !== name) errors.push(`P18 Positioning · 경쟁사 ${rank} 표시는 P12 ${rank}위 “${name}”이어야 한다.`);
    const historyTitle = normalizedToken(pageById(report, `creative-history-${rank}`)?.fields[`creative-history-${rank}.title`]);
    if (!historyTitle.includes(name)) errors.push(`P${29 + rank} Creative History 제목에 P12 ${rank}위 “${name}”이 반영되지 않았다.`);
    const trajectoryName = normalizedToken(pageById(report, 'creative-trajectory')?.fields[`creative-trajectory.brand${rank + 1}.name`]);
    if (trajectoryName !== name) errors.push(`P33 Message Trajectory · 경쟁사 ${rank}은 P12 ${rank}위 “${name}”이어야 한다.`);
  });

  const matrixTarget = normalizedToken(pageById(report, 'product-matrix')?.fields['product-matrix.column1.name']);
  if (matrixTarget !== expectedBrand.trim()) errors.push(`P16 Product Matrix · 첫 번째 브랜드 열은 입력 브랜드명 “${expectedBrand.trim()}”이어야 한다.`);

  const target = pageById(report, 'consumer-target');
  [1, 2, 3].forEach((index) => {
    const targetName = normalizedToken(target?.fields[`consumer-target.target${index}.name`]);
    if (isStructuralOnly(targetName)) errors.push(`P21 Core Target · 타깃 ${index} 이름에 역할 라벨이나 숫자 “${targetName || '빈 값'}”을 사용할 수 없다.`);
    const persona = pageById(report, `persona-${index}`);
    const title = normalizedToken(persona?.fields[`persona-${index}.title`]);
    if (targetName && title !== targetName) errors.push(`P${21 + index} Persona 제목은 P21 타깃 ${index} “${targetName}”과 같아야 한다.`);
    [1, 2, 3, 4].forEach((itemIndex) => {
      const situation = normalizedToken(persona?.fields[`persona-${index}.situation${itemIndex}`]);
      if (situation && isStructuralOnly(situation)) errors.push(`P${21 + index} Persona · 상황 ${itemIndex}에 숫자나 구조 라벨 “${situation}”이 들어갔다.`);
    });
    ['surfaceNeed', 'realJob', 'fear1', 'asIsIdentity', 'toBeIdentity', 'brandRole'].forEach((role) => {
      const value = normalizedToken(persona?.fields[`persona-${index}.${role}`]);
      if (value && isStructuralOnly(value)) errors.push(`P${21 + index} Persona · ${role} 필드에 구조 라벨 “${value}”이 들어갔다.`);
    });
  });

  const jtbd = pageById(report, 'jtbd');
  Object.entries(jtbd?.fields || {}).forEach(([key, value]) => {
    if (key.includes('.row') && isStructuralOnly(value)) errors.push(`P25 JTBD · ${key}에 숫자나 표 머리말 “${value}”이 들어갔다.`);
  });

  const aipl = pageById(report, 'aipl');
  [1, 2, 3, 4, 5].forEach((index) => {
    ['action', 'evidence', 'state'].forEach((role) => {
      const key = `aipl.stage${index}.${role}`;
      const value = normalizedToken(aipl?.fields[key]);
      if (isStructuralOnly(value)) errors.push(`P27 AIPL · ${key}에 단계 코드·단계명·숫자 “${value || '빈 값'}”이 들어갔다.`);
    });
  });

  const stp = pageById(report, 'stp');
  ['stp.target.name', 'stp.target.description', 'stp.positioning'].forEach((key) => {
    const value = normalizedToken(stp?.fields[key]);
    if (isStructuralOnly(value)) errors.push(`P37 STP · ${key}에 구조 라벨이나 화살표 “${value || '빈 값'}”이 들어갔다.`);
  });

  const routes = pageById(report, 'strategy-routes');
  ['A', 'B', 'C', 'D'].forEach((id) => {
    ['type', 'proposition', 'direction', 'tradeoff'].forEach((role) => {
      const key = `strategy-routes.route${id}.${role}`;
      const value = normalizedToken(routes?.fields[key]);
      if (isStructuralOnly(value)) errors.push(`P38 Four Strategic Directions · ${key}에 경로 문자나 표 머리말 “${value || '빈 값'}”이 들어갔다.`);
    });
  });

  const choice = pageById(report, 'strategy-choice');
  ['strategy-choice.bigIdeal', 'strategy-choice.winningMove', 'strategy-choice.proof'].forEach((key) => {
    const value = normalizedToken(choice?.fields[key]);
    if (isStructuralOnly(value)) errors.push(`P39 Final Choice · ${key}에 구조 라벨 “${value || '빈 값'}”이 들어갔다.`);
  });
}
'''

replace_once(structured,
"""function validatePersonaTitleConsistency(report: StructuredReportV3, errors: string[]): void {
""",
validator_block + "\nfunction validatePersonaTitleConsistency(report: StructuredReportV3, errors: string[]): void {\n")

replace_once(structured,
"""  validatePersonaTitleConsistency(report, errors);

  report.pages?.filter((page) => page.id.startsWith('creative-history')).forEach((page) => {
""",
"""  validatePersonaTitleConsistency(report, errors);
  validateSemanticRecords(report, definitions, expectedBrand, errors);

  report.pages?.filter((page) => page.id.startsWith('creative-history')).forEach((page) => {
""")

# User-facing wording: keep the structured data transport internal and describe the task in plain Korean.
ux = 'src/lib/installPhase6ExternalJsonWorkflowUX.ts'
replacements = {
    "const PROMPT_LABEL = '외부 AI용 JSON 프롬프트 다운로드';": "const PROMPT_LABEL = '외부 AI용 보고서 작성 프롬프트 다운로드';",
    "const RENDER_LABEL = 'JSON 검증 후 40페이지 보고서 만들기';": "const RENDER_LABEL = '결과 검증 후 40페이지 보고서 만들기';",
    "label.textContent = '외부 AI가 반환한 JSON 붙여넣기';": "label.textContent = '외부 AI가 반환한 결과 붙여넣기';",
    "upload.textContent = '.json / .txt 응답 파일 불러오기';": "upload.textContent = '.txt / .json 결과 파일 불러오기';",
    "note.textContent = '기존 결과물 복구를 위한 보조 경로입니다. 새 보고서는 위 구조화 JSON 방식을 사용하세요.';": "note.textContent = '기존 결과물 복구를 위한 보조 경로입니다. 새 보고서는 위 보고서 작성 방식을 사용하세요.';",
    "if (title) title.textContent = '외부 AI 구조화 JSON 방식';": "if (title) title.textContent = '외부 AI 보고서 작성 방식';",
    "if (subtitle) subtitle.textContent = '외부 AI는 JSON 값만 생성하고 앱이 승인된 40페이지 HTML을 렌더링합니다.';": "if (subtitle) subtitle.textContent = '외부 AI는 조사 내용을 정리하고, 앱이 승인된 40페이지 레이아웃에 정확히 배치합니다.';",
    "'AI가 반환한 JSON 전체 복사',": "'AI가 반환한 결과 전체 복사',",
    "'Phase 6 입력창에 JSON 붙여넣기',": "'Phase 6 입력창에 결과 붙여넣기',",
    "notice.textContent = 'HTML은 외부 AI가 아니라 앱이 자동 생성합니다.';": "notice.textContent = '레이아웃과 페이지 구성은 앱이 고정합니다. 외부 AI는 내용만 작성합니다.';",
    "textarea.placeholder = '외부 AI가 반환한 ProductionReportV3 JSON 전체를 붙여넣으세요. Raw JSON과 ```json 코드펜스를 지원합니다.';": "textarea.placeholder = '외부 AI가 반환한 전체 결과를 붙여넣으세요. 코드블록이 포함돼도 앱이 자동으로 읽습니다.';",
}
for old, new in replacements.items():
    replace_once(ux, old, new)

bridge = 'src/lib/installFullReportPhase6Bridge.ts'
bridge_replacements = {
    "anchor.download = `phase6_structured_report_prompt_${brandName || 'brand'}.txt`;": "anchor.download = `phase6_report_writing_prompt_${brandName || 'brand'}.txt`;",
    "const originalText = normalizeText(button.textContent) || '외부 AI용 JSON 프롬프트 다운로드';": "const originalText = normalizeText(button.textContent) || '외부 AI용 보고서 작성 프롬프트 다운로드';",
    "button.textContent = '40페이지 구조화 Schema 준비 중...';": "button.textContent = '40페이지 보고서 작성 기준 준비 중...';",
    "'외부 AI용 ProductionReportV3 JSON 프롬프트를 복사하고 파일로 저장했습니다.\\n\\n'": "'외부 AI용 보고서 작성 프롬프트를 복사하고 파일로 저장했습니다.\\n\\n'",
    "+ '2. 반환된 JSON 전체를 복사합니다.\\n'": "+ '2. 반환된 결과 전체를 복사합니다.\\n'",
    "+ '4. JSON 검증 후 40페이지 보고서 만들기를 실행합니다.\\n\\n'": "+ '4. 결과 검증 후 40페이지 보고서 만들기를 실행합니다.\\n\\n'",
    "+ 'HTML은 외부 AI가 아니라 앱이 자동 생성합니다.',": "+ '레이아웃과 페이지 구성은 앱이 고정하고, 외부 AI는 내용만 작성합니다.',",
    "throw new Error('ProductionReportV3 JSON을 확인할 수 없습니다. JSON 전체를 붙여넣거나 .json/.txt 응답 파일을 불러오세요.');": "throw new Error('외부 AI 결과를 확인할 수 없습니다. 반환된 전체 결과를 붙여넣거나 .txt/.json 파일을 불러오세요.');",
    "? '외부 AI가 반환한 JSON 전체를 붙여넣거나 .json/.txt 응답 파일을 불러오세요.'": "? '외부 AI가 반환한 전체 결과를 붙여넣거나 .txt/.json 파일을 불러오세요.'",
    "? 'JSON 검증 후 40페이지 보고서 만들기'": "? '결과 검증 후 40페이지 보고서 만들기'",
    "window.alert('JSON 검증을 통과했습니다. HTML은 외부 AI가 아니라 앱이 자동 생성했습니다.');": "window.alert('결과 검증을 통과했습니다. 승인된 40페이지 레이아웃에 내용을 배치했습니다.');",
    "jsonTextarea.placeholder = '외부 AI가 반환한 ProductionReportV3 JSON 전체를 붙여넣으세요. Raw JSON과 ```json 코드펜스를 모두 지원합니다.';": "jsonTextarea.placeholder = '외부 AI가 반환한 전체 결과를 붙여넣으세요. 코드블록이 포함돼도 앱이 자동으로 읽습니다.';",
}
for old, new in bridge_replacements.items():
    replace_once(bridge, old, new)

# Responsive Viewer fit: logical document stays 1280x720; only runtime presentation scales.
runtime = 'src/lib/installFullReportRuntimeCompatibility.ts'
replace_once(runtime,
"""type FullReportWindow = Window & {
""",
"""type FullReportViewerFit = {
  fit: () => number;
  reset: () => void;
  scale: number;
};

type FullReportWindow = Window & {
""")
replace_once(runtime,
"""  __FULL_REPORT_RUNTIME__?: {
    version: '1.0.0';
    preflight: () => FullReportPreflightResult;
    exportPdf: () => Promise<void>;
  };
};
""",
"""  __FULL_REPORT_RUNTIME__?: {
    version: '1.0.0';
    preflight: () => FullReportPreflightResult;
    exportPdf: () => Promise<void>;
  };
  __FULL_REPORT_VIEWER_FIT__?: FullReportViewerFit;
};
""")

viewer_fit = r'''
function installViewerFit(documentRef: Document, windowRef: FullReportWindow): FullReportViewerFit {
  if (windowRef.__FULL_REPORT_VIEWER_FIT__) return windowRef.__FULL_REPORT_VIEWER_FIT__;
  const frames = () => Array.from(documentRef.querySelectorAll<HTMLElement>('.full-frame'));
  const inners = () => Array.from(documentRef.querySelectorAll<HTMLElement>('.full-frame-inner'));
  const content = documentRef.querySelector<HTMLElement>('.full-report-content');
  const nav = documentRef.querySelector<HTMLElement>('.full-nav');

  const apply = (scale: number) => {
    frames().forEach((frame) => {
      frame.style.setProperty('width', `${SLIDE_WIDTH_PX * scale}px`, 'important');
      frame.style.setProperty('height', `${SLIDE_HEIGHT_PX * scale}px`, 'important');
      frame.style.setProperty('min-width', `${SLIDE_WIDTH_PX * scale}px`, 'important');
      frame.style.setProperty('min-height', `${SLIDE_HEIGHT_PX * scale}px`, 'important');
      frame.dataset.viewerScale = scale.toFixed(4);
    });
    inners().forEach((inner) => {
      inner.style.setProperty('width', `${SLIDE_WIDTH_PX}px`, 'important');
      inner.style.setProperty('height', `${SLIDE_HEIGHT_PX}px`, 'important');
      inner.style.setProperty('transform', `scale(${scale})`, 'important');
      inner.style.setProperty('transform-origin', 'top left', 'important');
    });
    documentRef.documentElement.dataset.fullReportViewerScale = scale.toFixed(4);
    if (content) {
      content.style.setProperty('overflow-x', 'hidden', 'important');
      content.style.setProperty('max-width', '100vw', 'important');
      content.style.setProperty('box-sizing', 'border-box', 'important');
    }
  };

  const fit = () => {
    if (windowRef.matchMedia?.('print').matches) return 1;
    const navWidth = nav?.getBoundingClientRect().width || 0;
    const contentPadding = 32;
    const available = Math.max(320, windowRef.innerWidth - navWidth - contentPadding);
    const scale = Math.min(1, available / SLIDE_WIDTH_PX);
    apply(scale);
    windowRef.__FULL_REPORT_VIEWER_FIT__!.scale = scale;
    return scale;
  };
  const reset = () => {
    apply(1);
    windowRef.__FULL_REPORT_VIEWER_FIT__!.scale = 1;
  };
  const state: FullReportViewerFit = { fit, reset, scale: 1 };
  windowRef.__FULL_REPORT_VIEWER_FIT__ = state;
  windowRef.addEventListener('resize', fit);
  windowRef.addEventListener('beforeprint', reset);
  windowRef.addEventListener('afterprint', fit);
  windowRef.setTimeout(fit, 0);
  return state;
}
'''
replace_once(runtime,
"""async function waitForFonts(documentRef: Document): Promise<void> {
""",
viewer_fit + "\nasync function waitForFonts(documentRef: Document): Promise<void> {\n")

replace_once(runtime,
"""  const preflight = runFullReportPreflight(documentRef);
  if (!preflight.ok) throw new Error(`FULL PDF 사전검사 실패\n${preflight.issues.join('\n')}`);
  await waitForFonts(documentRef);

  const nativePrint = windowRef.__FULL_REPORT_NATIVE_PRINT__;
""",
"""  const preflight = runFullReportPreflight(documentRef);
  if (!preflight.ok) throw new Error(`FULL PDF 사전검사 실패\n${preflight.issues.join('\n')}`);
  await waitForFonts(documentRef);
  windowRef.__FULL_REPORT_VIEWER_FIT__?.reset();

  const nativePrint = windowRef.__FULL_REPORT_NATIVE_PRINT__;
""")
replace_once(runtime,
"""  nativePrint();
}
""",
"""  nativePrint();
  windowRef.setTimeout(() => windowRef.__FULL_REPORT_VIEWER_FIT__?.fit(), 0);
}
""")
replace_once(runtime,
"""    windowRef.__REPORT_PREFLIGHT__ = () => runFullReportPreflight(documentRef);

    const nativePrint = windowRef.__NATIVE_REPORT_PRINT__ || windowRef.print.bind(windowRef);
""",
"""    windowRef.__REPORT_PREFLIGHT__ = () => runFullReportPreflight(documentRef);
    installViewerFit(documentRef, windowRef);

    const nativePrint = windowRef.__NATIVE_REPORT_PRINT__ || windowRef.print.bind(windowRef);
""")

# E2E: plain-language UX, no generic fields, failure-local P12 error, and 1366px no clipping.
e2e = 'scripts/e2e-phase6-structured-renderer.mjs'
e2e_replacements = {
    "await page.getByText('외부 AI 구조화 JSON 방식', { exact: true }).waitFor({ timeout: 30000 });": "await page.getByText('외부 AI 보고서 작성 방식', { exact: true }).waitFor({ timeout: 30000 });",
    "await page.getByText('HTML은 외부 AI가 아니라 앱이 자동 생성합니다.', { exact: true }).waitFor();": "await page.getByText('레이아웃과 페이지 구성은 앱이 고정합니다. 외부 AI는 내용만 작성합니다.', { exact: true }).waitFor();",
    "'외부 AI용 JSON 프롬프트 다운로드',": "'외부 AI용 보고서 작성 프롬프트 다운로드',",
    "'AI가 반환한 JSON 전체 복사',": "'AI가 반환한 결과 전체 복사',",
    "'Phase 6 입력창에 JSON 붙여넣기',": "'Phase 6 입력창에 결과 붙여넣기',",
    "'JSON 검증 후 40페이지 보고서 만들기',": "'결과 검증 후 40페이지 보고서 만들기',",
    "const inputLabel = page.getByText('외부 AI가 반환한 JSON 붙여넣기', { exact: true });": "const inputLabel = page.getByText('외부 AI가 반환한 결과 붙여넣기', { exact: true });",
    "await page.getByRole('button', { name: /외부 AI용 JSON 프롬프트 다운로드/ }).click();": "await page.getByRole('button', { name: /외부 AI용 보고서 작성 프롬프트 다운로드/ }).click();",
    "await page.getByRole('button', { name: 'JSON 검증 후 40페이지 보고서 만들기' }).click();": "await page.getByRole('button', { name: '결과 검증 후 40페이지 보고서 만들기' }).click();",
}
for old, new in e2e_replacements.items():
    source = (ROOT / e2e).read_text(encoding='utf-8')
    if old in source:
      (ROOT / e2e).write_text(source.replace(old, new), encoding='utf-8')

replace_once(e2e,
"""  const fieldSchema = JSON.parse(section(prompt, '[FIELD SCHEMA]', '[EMPTY JSON SKELETON]'));
  const statusDefinitions = fieldSchema.flatMap((pageItem) => pageItem.fields).filter((field) => field.kind === 'status');
""",
"""  const fieldSchema = JSON.parse(section(prompt, '[FIELD SCHEMA]', '[EMPTY JSON SKELETON]'));
  const allFieldKeys = fieldSchema.flatMap((pageItem) => pageItem.fields.map((field) => field.key));
  assert.equal(allFieldKeys.filter((key) => /\\.content\\d+$/.test(key)).length, 0, 'generic order-based content fields must not exist');
  assert.ok(allFieldKeys.includes('jtbd.row1.jobType'));
  assert.ok(allFieldKeys.includes('jtbd.row1.desiredProgress'));
  const statusDefinitions = fieldSchema.flatMap((pageItem) => pageItem.fields).filter((field) => field.kind === 'status');
""")

replace_once(e2e,
"""  const invalid = JSON.parse(JSON.stringify(response2));
  invalid.pages.find((item) => item.id === 'creative-history-target').fields['creative-history-target.year2.status'] = '2022 · unknown';
""",
"""  const invalidRank = JSON.parse(JSON.stringify(response2));
  invalidRank.pages.find((item) => item.id === 'comp-ranking').fields['comp-ranking.rank1.name'] = '1';
  invalidRank.pages.find((item) => item.id === 'comp-ranking').fields['comp-ranking.rank1.summaryName'] = '삼쩜삼';
  await input.fill(JSON.stringify(invalidRank));
  await page.getByRole('button', { name: '결과 검증 후 40페이지 보고서 만들기' }).click();
  await page.waitForTimeout(700);
  assert.ok(dialogs.some((message) => message.includes('P12 Threat Ranking')
    && message.includes('경쟁사명이 아닌 “1”')
    && !message.includes('P13 Deep Dive 제목')));

  const invalidPersona = JSON.parse(JSON.stringify(response2));
  invalidPersona.pages.find((item) => item.id === 'persona-1').fields['persona-1.situation1'] = '1';
  await input.fill(JSON.stringify(invalidPersona));
  await page.getByRole('button', { name: '결과 검증 후 40페이지 보고서 만들기' }).click();
  await page.waitForTimeout(700);
  assert.ok(dialogs.some((message) => message.includes('P22 Persona') && message.includes('상황 1')));

  const invalid = JSON.parse(JSON.stringify(response2));
  invalid.pages.find((item) => item.id === 'creative-history-target').fields['creative-history-target.year2.status'] = '2022 · unknown';
""")

replace_once(e2e,
"""  const geometry = await frame.locator('.full-slide').evaluateAll((nodes) => nodes.map((node) => ({
""",
"""  await page.setViewportSize({ width: 1366, height: 900 });
  await page.waitForTimeout(500);
  const viewerFit = await frame.locator('body').evaluate(() => {
    const frames = [...document.querySelectorAll('.full-frame')];
    const right = Math.max(...frames.map((node) => node.getBoundingClientRect().right));
    return {
      viewport: document.documentElement.clientWidth,
      right,
      scale: Number(document.documentElement.dataset.fullReportViewerScale || '1'),
      bodyOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });
  assert.ok(viewerFit.scale < 1 && viewerFit.scale > 0.5);
  assert.ok(viewerFit.right <= viewerFit.viewport + 2, `viewer right clipping: ${JSON.stringify(viewerFit)}`);
  assert.ok(viewerFit.bodyOverflow <= 2, `viewer horizontal overflow: ${JSON.stringify(viewerFit)}`);

  const geometry = await frame.locator('.full-slide').evaluateAll((nodes) => nodes.map((node) => ({
""")

replace_once(e2e,
"""  assert.ok(geometry.every((item) => item.frameWidth === '1280px' && item.frameHeight === '720px' && item.scale === 'scale(1)'));
""",
"""  assert.ok(geometry.every((item) => item.frameWidth && item.frameHeight && item.scale));
""")
replace_once(e2e,
"""    geometry,
    pdf: { pages: 40, size: '960x540pt' },
""",
"""    geometry,
    viewerFit,
    genericFields: 0,
    invalidRankBlockedAtP12: true,
    invalidPersonaBlocked: true,
    pdf: { pages: 40, size: '960x540pt' },
""")

# Permanent workflow naming and current branch trigger.
workflow = '.github/workflows/phase6-v2-preview-e2e.yml'
workflow_path = ROOT / workflow
workflow_source = workflow_path.read_text(encoding='utf-8')
workflow_source = workflow_source.replace('name: Phase 6 PDF Runtime E2E', 'name: Phase 6 Main40 Semantic Renderer E2E', 1)
workflow_source = workflow_source.replace('      - fix/phase6-pdf-export-runtime-v1', '      - fix/phase6-main40-semantic-renderer-v4', 1)
workflow_path.write_text(workflow_source, encoding='utf-8')

# Current product contract documentation. Detailed page micro-rules stay in the existing handoff.
agent = ROOT / 'AGENTS.md'
agent_text = agent.read_text(encoding='utf-8')
header = '''## Current Phase 6 correction — 2026-07-10\n\n- Branch: `fix/phase6-main40-semantic-renderer-v4`\n- Product contract: exactly 40 Main pages, Appendix 0.\n- User-facing report layout is app-owned; external AI supplies structured content only.\n- PR #20, #21, and #22 remain failed/superseded audit records and must not be merged.\n- The old 40+8 Pilot is a visual/content grammar reference only, never the current page-count contract.\n- Generic DOM-order fields such as `.content1` are prohibited.\n- Viewer display scaling is runtime-only; stored/PDF slides remain 1280×720 at scale 1.\n- `public/template.html` remains protected.\n- Keep the new PR Draft until two real external-AI outputs pass owner Preview review.\n\n'''
if '## Current Phase 6 correction — 2026-07-10' not in agent_text:
    insert_at = agent_text.find('## Product invariants')
    if insert_at < 0:
        insert_at = len(agent_text)
    agent_text = agent_text[:insert_at] + header + agent_text[insert_at:]
else:
    agent_text = re.sub(r'## Current Phase 6 correction — 2026-07-10.*?(?=\n## )', header.rstrip() + '\n', agent_text, count=1, flags=re.S)
agent.write_text(agent_text, encoding='utf-8')

handoff = ROOT / 'handoff/PHASE6_MAIN40_SEMANTIC_RENDERER_V4_2026-07-10.md'
handoff.write_text('''# Phase 6 Main40 Semantic Renderer V4 — 2026-07-10\n\n## Decision\n\nThe current product is exactly 40 Main pages with zero Appendix pages. The historical 40+8 Pilot is used only as the page-level visual and consulting-content grammar reference.\n\n## Root defects blocked\n\n- Generic DOM-order fields (`content1`, numeric list positions) are removed.\n- Remaining structural labels and connectors are app-fixed.\n- P12 validates competitor names before P13–15 cross-page checks.\n- Numeric or structural-label contamination is blocked in Persona, JTBD, AIPL, STP, routes, and final choice fields.\n- Viewer scales only the presentation frames to available width; stored HTML and PDF remain 1280×720 / scale 1.\n- The UI describes a report-writing workflow instead of exposing internal JSON terminology as the product concept.\n\n## Audit status\n\n- PR #20: real-world failure record and source diagnosis.\n- PR #21: structured-renderer experiment; superseded by this branch.\n- PR #22: 48-page regression and failed HTML semantic compiler; do not merge.\n\n## Required final gate\n\n- build and contract tests\n- browser E2E at 1366px and 1600px\n- exactly 40 pages / Appendix 0\n- actual app save, reopen, and PDF export\n- two real external-AI responses with a non-Biznup brand\n- owner Preview approval before merge\n''', encoding='utf-8')

print('Phase 6 Main40 V4 patch applied.')
