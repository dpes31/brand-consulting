const PAGE_COUNT = 48;
const MAIN_COUNT = 40;
const SLOT_PREFIX = '[[CONTENT:';
const SLOT_PATTERN = /\[\[CONTENT:P\d{2}:[A-Z0-9_-]+:\d{3}\]\]/g;

const DYNAMIC_IDS: Record<number, string> = {
  13: 'deep-dive-1',
  14: 'deep-dive-2',
  15: 'deep-dive-3',
  30: 'creative-history-target',
  31: 'creative-history-1',
  32: 'creative-history-2',
  33: 'creative-history-3',
};

function serialize(documentRef: Document): string {
  return `<!DOCTYPE html>\n${documentRef.documentElement.outerHTML}`;
}

function roleOf(element: Element | null): string {
  const raw = element
    ? Array.from(element.classList).find((name) => !name.startsWith('is-')) || element.tagName
    : 'TEXT';
  return raw.toUpperCase().replace(/[^A-Z0-9_-]+/g, '-').slice(0, 36) || 'TEXT';
}

function keepText(element: Element | null, text: string): boolean {
  if (!element) return false;
  if (element.closest('style,script,noscript')) return true;
  if (element.classList.contains('full-page')) return true;
  if (element.matches('.full-implication > span')) return true;
  return /^SO WHAT$/i.test(text);
}

function neutralizeSlide(documentRef: Document, slide: HTMLElement, page: number): number {
  const walker = documentRef.createTreeWalker(slide, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  let current = walker.nextNode();
  while (current) {
    nodes.push(current as Text);
    current = walker.nextNode();
  }

  let index = 0;
  nodes.forEach((node) => {
    const text = node.nodeValue?.trim() || '';
    if (!text || keepText(node.parentElement, text)) return;
    index += 1;
    const slot = `[[CONTENT:P${String(page).padStart(2, '0')}:${roleOf(node.parentElement)}:${String(index).padStart(3, '0')}]]`;
    node.nodeValue = slot;
  });
  return index;
}

function neutralizeNavigation(documentRef: Document, idMap: Map<string, string>): void {
  documentRef.querySelectorAll<HTMLAnchorElement>('.full-nav a').forEach((link, index) => {
    const oldId = (link.getAttribute('href') || '').replace(/^#/, '');
    const nextId = idMap.get(oldId);
    if (nextId) link.setAttribute('href', `#${nextId}`);
    link.textContent = `PAGE ${String(index + 1).padStart(2, '0')}`;
  });
}

export function createResearchOnlyLayoutTemplate(source: string, brandName: string): string {
  if (typeof DOMParser === 'undefined') throw new Error('HTML 템플릿 변환기를 사용할 수 없습니다.');
  const documentRef = new DOMParser().parseFromString(source, 'text/html');
  const slides = Array.from(documentRef.querySelectorAll<HTMLElement>('.full-slide'));
  if (slides.length !== PAGE_COUNT) throw new Error(`승인 FULL 보고서는 정확히 ${PAGE_COUNT}페이지여야 합니다.`);

  const idMap = new Map<string, string>();
  let slotCount = 0;
  slides.forEach((slide, index) => {
    const page = index + 1;
    slide.dataset.page = String(page);
    slide.dataset.zone = index < MAIN_COUNT ? 'main' : 'appendix';
    const nextId = DYNAMIC_IDS[page];
    if (nextId && slide.id !== nextId) {
      idMap.set(slide.id, nextId);
      slide.id = nextId;
    }
    slotCount += neutralizeSlide(documentRef, slide, page);
  });

  neutralizeNavigation(documentRef, idMap);
  documentRef.querySelectorAll<HTMLElement>('[title],[aria-label],img[alt]').forEach((element) => {
    if (element.hasAttribute('title')) element.setAttribute('title', 'Report element');
    if (element.hasAttribute('aria-label')) element.setAttribute('aria-label', 'Report element');
    if (element instanceof HTMLImageElement) element.alt = 'Report visual';
  });

  const brand = documentRef.querySelector<HTMLElement>('.full-report-brand');
  if (brand) brand.textContent = brandName;
  const toolbar = documentRef.querySelector<HTMLElement>('.full-report-toolbar strong');
  if (toolbar) toolbar.textContent = `${brandName} FULL REPORT`;
  documentRef.title = `${brandName} Strategic Report`;
  documentRef.documentElement.lang = 'ko';
  documentRef.body.dataset.reportVersion = 'full-report-v1';
  documentRef.body.dataset.approvedPilot = 'full-integrated';
  documentRef.body.dataset.contentContract = 'research-slots-v1';
  documentRef.body.dataset.contentSlotCount = String(slotCount);
  documentRef.body.dataset.contentState = 'template';

  if (slotCount < 200) throw new Error(`콘텐츠 중립화 슬롯이 충분하지 않습니다. 현재 ${slotCount}개입니다.`);
  return serialize(documentRef);
}

export function assertAllResearchSlotsFilled(html: string): void {
  const unresolved = html.match(SLOT_PATTERN) || [];
  if (unresolved.length > 0 || html.includes(SLOT_PREFIX)) {
    throw new Error(`조사 내용으로 교체되지 않은 CONTENT SLOT이 ${Math.max(unresolved.length, 1)}개 남아 있습니다.`);
  }

  const documentRef = new DOMParser().parseFromString(html, 'text/html');
  const slides = Array.from(documentRef.querySelectorAll<HTMLElement>('.full-slide'));
  const incomplete: number[] = [];
  slides.forEach((slide, index) => {
    const title = slide.querySelector<HTMLElement>('.full-title-row h2')?.textContent?.trim() || '';
    const implicationNode = slide.querySelector<HTMLElement>('.full-implication > div');
    const implication = implicationNode?.textContent?.trim() || '';
    const text = (slide.textContent || '').replace(/\s+/g, ' ').trim();
    if (title.length < 6 || text.length < 80 || (implicationNode && implication.length < 8)) incomplete.push(index + 1);
  });
  if (incomplete.length) throw new Error(`조사 내용이 충분히 채워지지 않은 페이지: ${incomplete.join(', ')}`);
}

function comparable(value: string): string {
  return value.toLowerCase().replace(/[\s,·'"“”‘’()[\]{}]/g, '');
}

function directCompetitors(raw: string): string[] {
  const step2 = raw.split(/## STEP 2/i)[1]?.split(/## STEP [3-5]/i)[0] || '';
  const names = Array.from(step2.matchAll(/^\s*\d+\.\s*\*\*([^*\n—-]+?)(?:\s*[—-]|\*\*)/gm))
    .map((match) => match[1].trim())
    .filter(Boolean);
  return Array.from(new Set(names)).slice(0, 3);
}

function kpiValues(raw: string): string[] {
  const step0 = raw.split(/## STEP 0/i)[1]?.split(/## STEP [1-5]/i)[0] || '';
  const values = Array.from(step0.matchAll(/\*\*([0-9][0-9,.]*(?:조|억|만)?(?:\s*(?:원|명|사업자))?)\*\*/g))
    .map((match) => match[1].trim())
    .filter(Boolean);
  return Array.from(new Set(values)).slice(0, 5);
}

export function assertResearchEvidencePresent(html: string, rawResearch: string, brandName: string): void {
  const documentRef = new DOMParser().parseFromString(html, 'text/html');
  const text = comparable(documentRef.body.textContent || '');
  if (!text.includes(comparable(brandName))) throw new Error(`조사 브랜드명 "${brandName}"이 보고서에 없습니다.`);

  const competitors = directCompetitors(rawResearch);
  const missing = competitors.filter((name) => !text.includes(comparable(name)));
  if (competitors.length >= 2 && missing.length) {
    throw new Error(`Step 2 핵심 경쟁사가 반영되지 않았습니다: ${missing.join(', ')}`);
  }

  const values = kpiValues(rawResearch);
  const matched = values.filter((value) => text.includes(comparable(value)));
  if (values.length >= 2 && matched.length < 2) throw new Error('Step 0 핵심 KPI가 충분히 반영되지 않았습니다.');
}
