export const PRODUCTION_REPORT_VERSION = '1.0.0' as const;
export const PRODUCTION_MAIN_PAGE_COUNT = 40;
export const PRODUCTION_APPENDIX_PAGE_COUNT = 8;

export type ReportZone = 'main' | 'appendix';
export type Tone = 'neutral' | 'risk' | 'opportunity' | 'target';

export type SourceLabel = {
  publisher: string;
  title?: string;
  year?: string;
  status?: 'verified' | 'source-found-copy-unverified' | 'not-found';
};

export type BaseSlide = {
  id: string;
  page: number;
  zone: ReportZone;
  chapter: string;
  title: string;
  tag?: string;
  note?: string;
  implication?: string;
  sources?: SourceLabel[];
};

export type CoverSlide = BaseSlide & {
  recipe: 'cover';
  kicker: string;
  subtitle: string;
};

export type MetricStripSlide = BaseSlide & {
  recipe: 'metric-strip';
  metrics: Array<{ label: string; value: string; period?: string; interpretation: string }>;
};

export type TimelineSlide = BaseSlide & {
  recipe: 'milestone-timeline';
  events: Array<{ period: string; title: string; detail: string; verified?: boolean }>;
};

export type FlowSlide = BaseSlide & {
  recipe: 'causal-flow' | 'friction-flow' | 'as-is-to-be' | 'root-cause-flow';
  nodes: Array<{ label: string; headline: string; detail?: string; tone?: Tone }>;
};

export type MatrixSlide = BaseSlide & {
  recipe: 'feature-matrix' | 'rank-scorecard';
  columns: string[];
  rows: Array<{ label: string; cells: string[]; emphasis?: boolean }>;
};

export type PersonaSlide = BaseSlide & {
  recipe: 'persona';
  persona: {
    number: string;
    situation: string[];
    surfaceNeed: string;
    realJob: string;
    fears: string[];
    currentIdentity: string;
    desiredIdentity: string;
    brandRole: string;
  };
};

export type SwotSlide = BaseSlide & {
  recipe: 'swot';
  strength: string[];
  weakness: string[];
  opportunity: string[];
  threat: string[];
};

export type StpSlide = BaseSlide & {
  recipe: 'stp-convergence';
  segments: Array<{ name: string; description: string; selected?: boolean }>;
  target: { name: string; description: string };
  positioning: { statement: string; proof: string[] };
};

export type ChoiceSlide = BaseSlide & {
  recipe: 'choice-architecture';
  options: Array<{ name: string; rationale: string; score?: string; selected?: boolean }>;
  finalChoice: { name: string; statement: string; reasons: string[] };
};

export type CreativeHistorySlide = BaseSlide & {
  recipe: 'creative-history';
  brand: string;
  years: Array<{
    year: string;
    campaign: string;
    copy: string;
    detail: string;
    status: 'verified' | 'source-found-copy-unverified' | 'not-found';
    source: SourceLabel;
  }>;
  trajectory: string;
  strategicSoWhat: string;
};

export type EvidenceSlide = BaseSlide & {
  recipe: 'evidence-list' | 'evidence-gap' | 'roadmap';
  items: Array<{ label: string; headline: string; detail?: string; status?: string; tone?: Tone }>;
};

export type GenericSlide = BaseSlide & {
  recipe: 'structured-summary';
  sections: Array<{ label: string; headline: string; bullets: string[]; tone?: Tone }>;
};

export type ProductionReportSlide =
  | CoverSlide
  | MetricStripSlide
  | TimelineSlide
  | FlowSlide
  | MatrixSlide
  | PersonaSlide
  | SwotSlide
  | StpSlide
  | ChoiceSlide
  | CreativeHistorySlide
  | EvidenceSlide
  | GenericSlide;

export type ProductionReportV1 = {
  version: typeof PRODUCTION_REPORT_VERSION;
  brand: string;
  generatedAt: string;
  mainSlides: ProductionReportSlide[];
  appendixSlides: ProductionReportSlide[];
};

export type ProductionReportValidation = { ok: boolean; errors: string[] };

export function validateProductionReport(
  report: ProductionReportV1,
  expectedBrand?: string,
): ProductionReportValidation {
  const errors: string[] = [];
  if (report.version !== PRODUCTION_REPORT_VERSION) errors.push(`Unsupported report version: ${String(report.version)}`);
  if (!report.brand?.trim()) errors.push('Brand name is required.');
  if (expectedBrand && report.brand?.trim() !== expectedBrand.trim()) {
    errors.push(`Brand mismatch: expected "${expectedBrand}", received "${report.brand}".`);
  }
  if (!Array.isArray(report.mainSlides) || report.mainSlides.length !== PRODUCTION_MAIN_PAGE_COUNT) {
    errors.push(`Main Deck must contain exactly ${PRODUCTION_MAIN_PAGE_COUNT} slides.`);
  }
  if (!Array.isArray(report.appendixSlides) || report.appendixSlides.length !== PRODUCTION_APPENDIX_PAGE_COUNT) {
    errors.push(`Appendix must contain exactly ${PRODUCTION_APPENDIX_PAGE_COUNT} slides.`);
  }

  const slides = [...(report.mainSlides || []), ...(report.appendixSlides || [])];
  const ids = new Set<string>();
  const pages = new Set<number>();

  slides.forEach((slide, index) => {
    if (!slide.id?.trim()) errors.push(`Slide ${index + 1} has no id.`);
    if (ids.has(slide.id)) errors.push(`Duplicate slide id: ${slide.id}`);
    ids.add(slide.id);
    if (pages.has(slide.page)) errors.push(`Duplicate page number: ${slide.page}`);
    pages.add(slide.page);
    const expectedZone: ReportZone = index < PRODUCTION_MAIN_PAGE_COUNT ? 'main' : 'appendix';
    if (slide.zone !== expectedZone) errors.push(`Slide ${slide.id} must use zone "${expectedZone}".`);
    if (!slide.title?.trim()) errors.push(`Slide ${slide.id} has no title.`);
    if (!slide.chapter?.trim()) errors.push(`Slide ${slide.id} has no chapter.`);
  });

  const cover = report.mainSlides?.[0];
  if (cover?.recipe !== 'cover') errors.push('Main Deck page 1 must use the cover recipe.');

  return { ok: errors.length === 0, errors };
}
