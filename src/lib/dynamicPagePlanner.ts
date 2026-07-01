import { parseCompetitorRegistry } from './competitorSelection';

export const MIN_MAIN_DECK_PAGES = 23;
export const MAX_MAIN_DECK_PAGES = 40;
export const PAGE_MANIFEST_ID = 'report-page-manifest';

export interface PageManifestEntry {
  page: number;
  id: string;
  title: string;
  section: string;
  zone: 'main' | 'appendix';
  kind: string;
  competitor?: string;
}

export interface PageManifest {
  version: 1;
  minimumMainPages: number;
  maximumMainPages: number;
  mainPageCount: number;
  appendixPageCount: number;
  totalPageCount: number;
  pages: PageManifestEntry[];
}

const REQUIRED_BASE_WRAPPER_IDS = [
  'wrap-cover',
  'wrap-slide-f01',
  'wrap-slide-f02',
  'wrap-slide-f03',
  ...Array.from({ length: 18 }, (_, index) => `wrap-slide-${String(index + 1).padStart(2, '0')}`),
  'wrap-back-cover',
] as const;

function cleanText(value: string | null | undefined): string {
  return (value ?? '').replace(/\s+/g, ' ').trim();
}

function slugify(value: string): string {
  const slug = value
    .toLocaleLowerCase('ko-KR')
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
  return slug || 'page';
}

function uniqueId(base: string, used: Set<string>): string {
  let id = base;
  let suffix = 2;
  while (used.has(id)) {
    id = `${base}-${suffix}`;
    suffix += 1;
  }
  used.add(id);
  return id;
}

function selectedCompetitorNames(rawData: string): string[] {
  return parseCompetitorRegistry(rawData)?.selected.map((item) => item.name) ?? [];
}

export function buildDynamicPagePlannerDirective(rawData: string): string {
  const competitors = selectedCompetitorNames(rawData);
  const competitorList = competitors.length > 0
    ? competitors.map((name, index) => `${index + 1}. ${name}`).join('\n')
    : 'Step 2의 COMPETITOR_REGISTRY에서 선정된 2~5개 브랜드를 사용하십시오.';

  const expectedFloor = Math.min(
    MAX_MAIN_DECK_PAGES,
    MIN_MAIN_DECK_PAGES + competitors.length * 2,
  );

  return `[DYNAMIC PAGE PLANNER — EVIDENCE-DRIVEN EXPANSION]
이 보고서는 고정 23장을 억지로 채우는 문서도, 모든 내용을 한 장에 압축하는 문서도 아닙니다. 조사 깊이에 비례해 구조가 확장되어야 합니다.

[PAGE BUDGET]
- Main Deck 최소 ${MIN_MAIN_DECK_PAGES}장, 최대 ${MAX_MAIN_DECK_PAGES}장.
- 현재 Registry 기준 권장 Main Deck 하한: ${expectedFloor}장. 단, 근거가 부족한 내용을 만들어 이 숫자를 채우지 마십시오.
- 40장을 넘는 근거·원문·상세표는 같은 HTML의 Evidence Appendix로 이어서 배치하십시오.
- Appendix는 페이지 수 제한이 없지만 새로운 전략 주장이나 본문 반복을 넣지 마십시오.
- 화면과 PDF에 원문 URL을 노출하지 말고, 출처명·문서명·연도만 표시하십시오.

[FIXED BASELINE]
- 기존 23개 wrapper(표지 + Brand Fact Book 3장 + slide-01~18 + 후면 표지)는 모두 보존하십시오.
- slide-05는 Competitive Threat Landscape, slide-06은 Threat Ranking & Selection Logic으로 사용하십시오. Indirect Competitor 페이지를 만들지 마십시오.
- slide-14는 개별 경쟁사를 압축하는 페이지가 아니라 전체 경쟁 Creative 구도의 So What 비교 장표로 사용하십시오.

[MANDATORY VARIABLE PAGES]
다음 선정 경쟁사를 절대 누락하거나 다른 브랜드로 대체하지 마십시오.
${competitorList}

1. II. COMPETITOR / Deep Dive
- 선정 경쟁사마다 독립된 1페이지를 추가하십시오. 한 페이지에 최대 1개 브랜드를 원칙으로 합니다.
- 각 페이지에는 성장·시장 침투·Core Desire·핵심 소구·위협 메커니즘·조사 브랜드에 대한 공격 지점을 포함하십시오.
- wrapper에 class="slide-wrapper dynamic-page"와 data-page-kind="competitor-deep-dive", data-competitor="브랜드명"을 부여하십시오.

2. IV. CREATIVE / Competitor History
- 선정 경쟁사마다 독립된 1페이지를 추가하십시오.
- 최근 5개 완료연도 + 현재연도 YTD 타임라인, 모델, 캠페인명, 실제 카피 원문, 매체/포맷, 소구 전략, 메시지 궤적을 담으십시오.
- 현재연도 공개 캠페인이 없으면 마지막 칸에 '신규 캠페인 공개 미확인'이라고 표시하십시오.
- wrapper에 class="slide-wrapper dynamic-page"와 data-page-kind="competitor-creative-history", data-competitor="브랜드명"을 부여하십시오.

[CONDITIONAL CONTINUATION RULES]
- Product Matrix: 비교 축이 6개를 넘거나 의미 있는 비교 셀이 12개를 넘을 때만 연속 페이지를 추가하십시오.
- Positioning Map: 서로 다른 축·시장 국면을 2개 이상 설명해야 할 때만 연속 페이지를 추가하십시오.
- Consumer/Strategy: 한 장에 넣으면 핵심 논리가 잘리거나 서로 다른 질문을 다룰 때만 연속 페이지를 추가하십시오.
- 단순 문장 수가 많다는 이유만으로 페이지를 추가하지 말고, 독자가 한 장에서 하나의 결론에 도달하도록 논리 단위로 분리하십시오.
- 연속 페이지는 class="slide-wrapper dynamic-page"와 data-page-kind="continuation"을 사용하십시오.

[NO FILLER / NO COMPRESSION]
- 페이지 수를 맞추기 위한 일반론, 정의, 반복 요약, 장식용 문장을 금지합니다.
- 반대로 선정 경쟁사 2~5개를 한 장의 작은 카드로 압축하는 것도 금지합니다.
- 내용이 부족하면 '근거 미확인'을 명시하고, 거짓 사례나 카피를 생성하지 마십시오.

[APPENDIX]
- Main Deck이 40장을 넘게 될 경우 41장 이후 wrapper에 class="slide-wrapper appendix-page"와 data-report-zone="appendix"를 부여하십시오.
- Appendix에는 원문 카피 목록, 근거표, 상세 연도표, 검증 메모만 배치하십시오.

[STRUCTURE CONTRACT]
- 모든 wrapper ID는 유일해야 합니다.
- 동적 페이지 ID 예시: wrap-dynamic-competitor-브랜드-slug, wrap-dynamic-creative-브랜드-slug.
- 각 동적 slide에는 고유 id와 .slide-header, .slide-body를 유지하십시오.
- 네비게이션 링크는 실제 존재하는 slide id만 가리켜야 합니다.
- 최종 HTML은 단일 <!DOCTYPE html> ... </html> 문서여야 합니다.`;
}

export function buildReportCompilerPrompt(
  masterHtml: string,
  rawData: string,
  brandName: string,
): string {
  const cleanRawData = rawData.replace(/\[cite.*?\]|\\cite.*?|\[cite_start\]/g, '');
  const pageDirective = buildDynamicPagePlannerDirective(cleanRawData);

  return `[Role & Identity]
You are a "Master Strategic Compiler", a "Strict HTML Molder", and an evidence-driven "Report Page Planner".
Your task is to transform the research into a complete strategic consulting report while preserving the approved design system.

[Directives]
1. Read all Raw Research Data. Correct logical leaps and accumulate facts toward a clear So What.
2. Replace every remaining {{PLACEHOLDER}} with professional Korean content grounded in the research.
3. Preserve the complete base template and expand it only under the Dynamic Page Planner rules below.
4. Use full professional sentences. Use <span class="highlight"> only for decision-critical phrases.
5. Do not output [cite], [source], markdown citations, or raw URLs.
6. Never invent campaign copy, model names, dates, market shares, or sources. Mark unverified facts explicitly.
7. Output the entire HTML from <!DOCTYPE html> through </html> in one response. Do not truncate or split it.

[HTML STRUCTURE INTEGRITY]
8. Preserve all ${MIN_MAIN_DECK_PAGES} required base slide-wrapper blocks. Do not remove, merge, or rename their wrapper IDs.
9. Every opened element must be closed. The back cover must remain present.
10. Dynamic pages must use unique IDs and the data attributes specified below.
11. Main Deck must contain ${MIN_MAIN_DECK_PAGES}~${MAX_MAIN_DECK_PAGES} pages. Evidence Appendix may continue after page ${MAX_MAIN_DECK_PAGES} in the same HTML.
12. The output must end with </main></body></html> or an equivalent valid closure.

${pageDirective}

[Brand]
${brandName}

[Immutable Base HTML Code]
${masterHtml}

[Raw Research Data]
${cleanRawData}

================
Execute the compilation now. Return only the finalized HTML enclosed in a single \`\`\`html code block.`;
}

function inferTitle(wrapper: HTMLElement): string {
  return cleanText(
    wrapper.querySelector<HTMLElement>('.title')?.textContent
    ?? wrapper.querySelector<HTMLElement>('h1, h2, h3')?.textContent
    ?? wrapper.dataset.competitor
    ?? wrapper.id,
  );
}

function inferSection(wrapper: HTMLElement): string {
  const breadcrumb = cleanText(wrapper.querySelector<HTMLElement>('.breadcrumb')?.textContent);
  if (breadcrumb) return breadcrumb.split('>')[0].trim();
  if (wrapper.dataset.pageKind?.includes('creative')) return 'IV. CREATIVE';
  if (wrapper.dataset.pageKind?.includes('competitor')) return 'II. COMPETITOR';
  if (wrapper.classList.contains('appendix-page')) return 'APPENDIX';
  return 'REPORT';
}

function inferKind(wrapper: HTMLElement): string {
  if (wrapper.dataset.pageKind) return wrapper.dataset.pageKind;
  if (wrapper.id === 'wrap-cover') return 'cover';
  if (wrapper.id === 'wrap-back-cover') return 'back-cover';
  if (wrapper.id.startsWith('wrap-slide-f')) return 'brand-fact';
  if (wrapper.id.startsWith('wrap-slide-')) return 'base';
  return 'dynamic';
}

function ensureUniqueWrapperIds(wrappers: HTMLElement[]): void {
  const used = new Set<string>();
  wrappers.forEach((wrapper, index) => {
    const preferred = cleanText(wrapper.id) || `wrap-dynamic-page-${index + 1}`;
    wrapper.id = uniqueId(slugify(preferred).startsWith('wrap-') ? slugify(preferred) : `wrap-${slugify(preferred)}`, used);
  });
}

function ensureSlideIds(wrappers: HTMLElement[]): void {
  const used = new Set<string>();
  wrappers.forEach((wrapper, index) => {
    const slide = wrapper.querySelector<HTMLElement>(':scope > .slide') ?? wrapper.querySelector<HTMLElement>('.slide');
    if (!slide) return;
    const preferred = cleanText(slide.id) || wrapper.id.replace(/^wrap-/, '') || `slide-dynamic-${index + 1}`;
    slide.id = uniqueId(slugify(preferred).startsWith('slide-') || preferred === 'cover' ? slugify(preferred) : `slide-${slugify(preferred)}`, used);
  });
}

function flattenWrappers(documentRef: Document): HTMLElement[] {
  const main = documentRef.querySelector<HTMLElement>('main#content');
  if (!main) return [];
  const wrappers = Array.from(documentRef.querySelectorAll<HTMLElement>('.slide-wrapper'));
  const sentinel = documentRef.createComment('dynamic-page-planner-sentinel');
  main.appendChild(sentinel);
  wrappers.forEach((wrapper) => main.insertBefore(wrapper, sentinel));
  sentinel.remove();
  return wrappers;
}

function assignZones(wrappers: HTMLElement[]): void {
  let mainCount = 0;
  wrappers.forEach((wrapper) => {
    const explicitAppendix = wrapper.classList.contains('appendix-page') || wrapper.dataset.reportZone === 'appendix';
    const zone: 'main' | 'appendix' = explicitAppendix || mainCount >= MAX_MAIN_DECK_PAGES ? 'appendix' : 'main';
    wrapper.dataset.reportZone = zone;
    wrapper.classList.toggle('appendix-page', zone === 'appendix');
    if (zone === 'main') mainCount += 1;
  });
}

function ensureDynamicNavigation(documentRef: Document, wrappers: HTMLElement[]): void {
  const nav = documentRef.querySelector<HTMLElement>('nav#navbar, nav');
  if (!nav) return;

  nav.querySelectorAll<HTMLAnchorElement>('a.nav-item[href^="#"]').forEach((anchor) => {
    const targetId = anchor.getAttribute('href')?.slice(1);
    if (!targetId || !documentRef.getElementById(targetId)) anchor.remove();
  });

  const getOrCreateGroup = (title: string): HTMLElement => {
    const groups = Array.from(nav.querySelectorAll<HTMLElement>('.nav-group'));
    const existing = groups.find((group) => cleanText(group.querySelector('.nav-title')?.textContent) === title);
    if (existing) return existing;
    const group = documentRef.createElement('div');
    group.className = 'nav-group dynamic-nav-group';
    const heading = documentRef.createElement('div');
    heading.className = 'nav-title';
    heading.textContent = title;
    group.appendChild(heading);
    nav.appendChild(group);
    return group;
  };

  wrappers.forEach((wrapper) => {
    if (!wrapper.classList.contains('dynamic-page') && !wrapper.classList.contains('appendix-page')) return;
    const slide = wrapper.querySelector<HTMLElement>(':scope > .slide') ?? wrapper.querySelector<HTMLElement>('.slide');
    if (!slide?.id || nav.querySelector(`a.nav-item[href="#${CSS.escape(slide.id)}"]`)) return;

    const kind = inferKind(wrapper);
    const groupTitle = wrapper.dataset.reportZone === 'appendix'
      ? 'APPENDIX'
      : kind.includes('creative')
        ? 'IV. CREATIVE'
        : kind.includes('competitor')
          ? 'II. COMPETITOR'
          : 'CONTINUATION';
    const group = getOrCreateGroup(groupTitle);
    const anchor = documentRef.createElement('a');
    anchor.className = 'nav-item dynamic-nav-item';
    anchor.href = `#${slide.id}`;
    anchor.textContent = inferTitle(wrapper);
    group.appendChild(anchor);
  });
}

function createManifest(wrappers: HTMLElement[]): PageManifest {
  let mainPageCount = 0;
  let appendixPageCount = 0;
  const pages = wrappers.map<PageManifestEntry>((wrapper, index) => {
    const zone = wrapper.dataset.reportZone === 'appendix' ? 'appendix' : 'main';
    if (zone === 'main') mainPageCount += 1;
    else appendixPageCount += 1;
    wrapper.dataset.pageNumber = String(index + 1);

    return {
      page: index + 1,
      id: wrapper.id,
      title: inferTitle(wrapper),
      section: inferSection(wrapper),
      zone,
      kind: inferKind(wrapper),
      ...(wrapper.dataset.competitor ? { competitor: wrapper.dataset.competitor } : {}),
    };
  });

  return {
    version: 1,
    minimumMainPages: MIN_MAIN_DECK_PAGES,
    maximumMainPages: MAX_MAIN_DECK_PAGES,
    mainPageCount,
    appendixPageCount,
    totalPageCount: wrappers.length,
    pages,
  };
}

function writeManifest(documentRef: Document, manifest: PageManifest): void {
  documentRef.getElementById(PAGE_MANIFEST_ID)?.remove();
  const script = documentRef.createElement('script');
  script.id = PAGE_MANIFEST_ID;
  script.type = 'application/json';
  script.textContent = JSON.stringify(manifest, null, 2).replace(/<\//g, '<\\/');
  documentRef.body.appendChild(script);
}

export function normalizeDynamicReportDocument(documentRef: Document): PageManifest {
  const wrappers = flattenWrappers(documentRef);
  if (wrappers.length < MIN_MAIN_DECK_PAGES) {
    throw new Error(`보고서 기본 페이지가 ${wrappers.length}장입니다. 최소 ${MIN_MAIN_DECK_PAGES}장이 필요합니다.`);
  }

  const missingBaseIds = REQUIRED_BASE_WRAPPER_IDS.filter((id) => !documentRef.getElementById(id));
  if (missingBaseIds.length > 0) {
    throw new Error(`필수 기본 페이지 누락: ${missingBaseIds.join(', ')}`);
  }

  ensureUniqueWrapperIds(wrappers);
  ensureSlideIds(wrappers);
  assignZones(wrappers);
  ensureDynamicNavigation(documentRef, wrappers);
  const manifest = createManifest(wrappers);
  writeManifest(documentRef, manifest);
  documentRef.documentElement.dataset.dynamicPagePlanner = 'v1';
  return manifest;
}

export function normalizeDynamicReportHtml(html: string): string {
  if (typeof DOMParser === 'undefined') return html;
  const parser = new DOMParser();
  const documentRef = parser.parseFromString(html, 'text/html');
  normalizeDynamicReportDocument(documentRef);
  return `<!DOCTYPE html>\n${documentRef.documentElement.outerHTML}`;
}
