export const VISUAL_MANIFEST_ID = 'report-visual-manifest';
export const VISUAL_STYLE_ID = 'report-visualization-engine-styles';

export const VISUALIZATION_TYPES = [
  'kpi-strip',
  'bar-comparison',
  'delta-comparison',
  'dot-plot',
  'timeline',
  'matrix',
  'positioning-map',
  'process-flow',
  'system-map',
  'verbatim-evidence',
  'evidence-gap',
] as const;

export type VisualizationType = typeof VISUALIZATION_TYPES[number];

export interface VisualAuditPage {
  page: number;
  id: string;
  title: string;
  visualizationTypes: string[];
  numericSignals: number;
  textLength: number;
  boxCount: number;
  warnings: string[];
}

export interface VisualAuditManifest {
  version: 1;
  totalPages: number;
  warningCount: number;
  pages: VisualAuditPage[];
}

const VISUAL_SELECTOR = [
  '[data-viz-type]',
  'svg[data-visualization]',
  '.timeline-container',
  '.pos-map',
  '.chart-bar-bg',
  '.viz-kpi-strip',
  '.viz-bars',
  '.viz-dot-plot',
  '.viz-flow',
  '.viz-system-map',
  '.viz-matrix',
  'table',
].join(',');

function cleanText(value: string | null | undefined): string {
  return (value ?? '').replace(/\s+/g, ' ').trim();
}

function inferTitle(wrapper: HTMLElement): string {
  return cleanText(
    wrapper.querySelector<HTMLElement>('.title')?.textContent
    ?? wrapper.querySelector<HTMLElement>('h1, h2, h3')?.textContent
    ?? wrapper.id,
  );
}

function extractNumericSignals(text: string): string[] {
  const signals = text.match(/(?:\d{1,3}(?:,\d{3})+|\d+(?:\.\d+)?)(?:\s*(?:%|배|억|조|만|천|명|건|원|개월|년|점))?/g) ?? [];
  return signals.filter((value) => {
    const year = Number(value.replace(/[^0-9]/g, ''));
    return !(year >= 1900 && year <= 2100 && !/[%,.억조만천명건원배점]/.test(value));
  });
}

function visualTypes(wrapper: HTMLElement): string[] {
  const types = new Set<string>();
  wrapper.querySelectorAll<HTMLElement>('[data-viz-type]').forEach((element) => {
    const type = element.dataset.vizType?.trim();
    if (type) types.add(type);
  });
  if (wrapper.querySelector('.timeline-container')) types.add('timeline');
  if (wrapper.querySelector('.pos-map')) types.add('positioning-map');
  if (wrapper.querySelector('.chart-bar-bg')) types.add('bar-comparison');
  if (wrapper.querySelector('table')) types.add('matrix');
  return [...types];
}

function tagLegacyVisuals(documentRef: Document): void {
  documentRef.querySelectorAll<HTMLElement>('.timeline-container').forEach((element) => {
    element.dataset.vizType ||= 'timeline';
    element.dataset.visualRole ||= 'evidence';
  });
  documentRef.querySelectorAll<HTMLElement>('.pos-map').forEach((element) => {
    element.dataset.vizType ||= 'positioning-map';
    element.dataset.visualRole ||= 'evidence';
  });
  documentRef.querySelectorAll<HTMLElement>('.chart-bar-bg').forEach((element) => {
    element.closest<HTMLElement>('.box')?.setAttribute('data-viz-type', 'bar-comparison');
  });
  documentRef.querySelectorAll<HTMLElement>('table').forEach((element) => {
    element.dataset.vizType ||= 'matrix';
    element.dataset.visualRole ||= 'evidence';
  });
  documentRef.querySelectorAll<HTMLElement>('.stat-box').forEach((element) => {
    element.closest<HTMLElement>('.box')?.setAttribute('data-viz-type', 'kpi-strip');
  });
}

function tagSymmetricGrids(documentRef: Document): void {
  documentRef.querySelectorAll<HTMLElement>('.grid-2, .grid-3, .viz-grid').forEach((grid) => {
    const children = Array.from(grid.children).filter((child): child is HTMLElement => child instanceof HTMLElement);
    if (children.length < 2) return;
    const comparable = children.every((child) => child.classList.contains('box') || child.classList.contains('viz-card'));
    if (!comparable) return;
    grid.dataset.symmetricGrid = 'true';
  });
}

function installVisualizationStyles(documentRef: Document): void {
  if (documentRef.getElementById(VISUAL_STYLE_ID)) return;
  const style = documentRef.createElement('style');
  style.id = VISUAL_STYLE_ID;
  style.textContent = `
    [data-symmetric-grid="true"] { align-items: stretch !important; grid-auto-rows: 1fr; }
    [data-symmetric-grid="true"] > .box,
    [data-symmetric-grid="true"] > .viz-card { height: 100% !important; min-height: 0; }

    .viz-grid { display: grid; gap: 16px; align-items: stretch; }
    .viz-grid.cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .viz-grid.cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .viz-grid.cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
    .viz-card { background: var(--surface-2); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 16px 18px; min-width: 0; }
    .viz-label { color: var(--text-muted); font-size: 10px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
    .viz-value { color: var(--text-main); font-size: 30px; font-weight: 800; line-height: 1.05; letter-spacing: -.04em; }
    .viz-note { color: var(--text-secondary); font-size: 11px; line-height: 1.45; }
    .viz-source { color: var(--text-muted); font-size: 9px; line-height: 1.35; margin-top: 8px; }

    .viz-kpi-strip { display: grid; grid-template-columns: repeat(var(--viz-columns, 3), minmax(0, 1fr)); gap: 12px; }
    .viz-kpi { background: var(--surface-2); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 15px 16px; min-width: 0; }
    .viz-kpi .viz-value { color: var(--hds-brand-accent); margin: 6px 0; }

    .viz-bars { display: grid; gap: 12px; width: 100%; }
    .viz-bar-row { display: grid; grid-template-columns: minmax(100px, .8fr) 2fr minmax(56px, auto); gap: 12px; align-items: center; }
    .viz-bar-label { color: var(--text-secondary); font-size: 11px; line-height: 1.3; }
    .viz-bar-track { position: relative; height: 18px; border-radius: 999px; background: var(--surface-3); overflow: hidden; }
    .viz-bar-fill { height: 100%; width: var(--viz-value, 0%); border-radius: inherit; background: var(--hds-brand-accent); }
    .viz-bar-number { color: var(--text-main); font-size: 12px; font-weight: 700; text-align: right; }

    .viz-dot-plot { position: relative; display: grid; gap: 12px; padding: 8px 0; }
    .viz-dot-row { display: grid; grid-template-columns: minmax(100px, .8fr) 2fr minmax(56px, auto); gap: 12px; align-items: center; }
    .viz-dot-axis { position: relative; height: 2px; background: var(--border-strong); }
    .viz-dot { position: absolute; left: var(--viz-value, 0%); top: 50%; width: 12px; height: 12px; transform: translate(-50%, -50%); border-radius: 50%; background: var(--hds-brand-accent); box-shadow: 0 0 0 4px color-mix(in srgb, var(--hds-brand-accent) 20%, transparent); }

    .viz-flow { display: grid; grid-template-columns: repeat(var(--viz-steps, 3), minmax(0, 1fr)); gap: 24px; align-items: stretch; }
    .viz-flow-step { position: relative; background: var(--surface-2); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 18px; min-width: 0; }
    .viz-flow-step:not(:last-child)::after { content: '→'; position: absolute; right: -20px; top: 50%; transform: translateY(-50%); color: var(--hds-brand-accent); font-size: 22px; font-weight: 800; }
    .viz-step-index { color: var(--hds-brand-accent); font-size: 10px; font-weight: 800; letter-spacing: .1em; }
    .viz-step-title { color: var(--text-main); font-size: 14px; font-weight: 700; margin: 6px 0; }

    .viz-system-map { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); grid-template-areas: 'input engine output'; gap: 18px; align-items: center; }
    .viz-system-node { background: var(--surface-2); border: 1px solid var(--border-subtle); border-radius: 10px; padding: 18px; text-align: center; min-width: 0; }
    .viz-system-node.primary { border-color: var(--hds-brand-accent); background: color-mix(in srgb, var(--hds-brand-accent) 12%, var(--surface-2)); }

    .viz-matrix { width: 100%; border-collapse: separate; border-spacing: 0; overflow: hidden; border-radius: 8px; border: 1px solid var(--border-subtle); }
    .viz-matrix th, .viz-matrix td { padding: 10px 12px; border-right: 1px solid var(--border-subtle); border-bottom: 1px solid var(--border-subtle); font-size: 11px; line-height: 1.35; }
    .viz-matrix th { color: var(--text-main); background: var(--surface-3); font-weight: 700; }
    .viz-matrix td { color: var(--text-secondary); background: var(--surface-2); }
    .viz-matrix tr:last-child td { border-bottom: 0; }
    .viz-matrix th:last-child, .viz-matrix td:last-child { border-right: 0; }

    .viz-interpretation { border-left: 3px solid var(--hds-brand-accent); padding: 10px 14px; background: color-mix(in srgb, var(--hds-brand-accent) 8%, var(--surface-2)); color: var(--text-main); font-size: 12px; line-height: 1.5; border-radius: 0 6px 6px 0; }
    .viz-evidence-gap { border: 1px dashed var(--border-strong); border-radius: 8px; padding: 18px; color: var(--text-muted); font-size: 12px; line-height: 1.5; }

    @media print {
      .viz-card, .viz-kpi, .viz-flow-step, .viz-system-node, .viz-matrix { break-inside: avoid; }
    }
  `;
  documentRef.head.appendChild(style);
}

function auditPage(wrapper: HTMLElement, index: number): VisualAuditPage {
  const text = cleanText(wrapper.textContent);
  const numericSignals = extractNumericSignals(text).length;
  const visuals = visualTypes(wrapper);
  const boxCount = wrapper.querySelectorAll('.box').length;
  const warnings: string[] = [];
  const isCover = wrapper.id === 'wrap-cover' || wrapper.id === 'wrap-back-cover';
  const hasVisual = wrapper.querySelector(VISUAL_SELECTOR) !== null;

  if (!isCover && numericSignals >= 2 && !hasVisual) {
    warnings.push('Comparable numeric evidence has no chart or matrix.');
  }
  if (!isCover && text.length > 950 && !hasVisual) {
    warnings.push('Text-heavy slide has no visual anchor.');
  }
  if (!isCover && boxCount > 4 && !hasVisual) {
    warnings.push('More than four text boxes appear without a primary visualization.');
  }
  wrapper.querySelectorAll<HTMLElement>('[data-viz-type]').forEach((element) => {
    const type = element.dataset.vizType;
    if (type && !VISUALIZATION_TYPES.includes(type as VisualizationType)) {
      warnings.push(`Unknown visualization type: ${type}`);
    }
  });

  wrapper.dataset.visualAudit = warnings.length === 0 ? 'pass' : 'warning';
  if (warnings.length > 0) wrapper.dataset.visualWarnings = warnings.join(' | ');
  else delete wrapper.dataset.visualWarnings;

  return {
    page: index + 1,
    id: wrapper.id,
    title: inferTitle(wrapper),
    visualizationTypes: visuals,
    numericSignals,
    textLength: text.length,
    boxCount,
    warnings,
  };
}

function writeManifest(documentRef: Document, manifest: VisualAuditManifest): void {
  documentRef.getElementById(VISUAL_MANIFEST_ID)?.remove();
  const script = documentRef.createElement('script');
  script.id = VISUAL_MANIFEST_ID;
  script.type = 'application/json';
  script.textContent = JSON.stringify(manifest, null, 2).replace(/<\//g, '<\\/');
  documentRef.body.appendChild(script);
}

export function normalizeVisualizationDocument(documentRef: Document): VisualAuditManifest {
  installVisualizationStyles(documentRef);
  tagLegacyVisuals(documentRef);
  tagSymmetricGrids(documentRef);

  const wrappers = Array.from(documentRef.querySelectorAll<HTMLElement>('.slide-wrapper'));
  const pages = wrappers.map(auditPage);
  const warningCount = pages.reduce((sum, page) => sum + page.warnings.length, 0);
  const manifest: VisualAuditManifest = {
    version: 1,
    totalPages: pages.length,
    warningCount,
    pages,
  };
  writeManifest(documentRef, manifest);
  documentRef.documentElement.dataset.visualizationEngine = 'v1';
  documentRef.documentElement.dataset.visualWarningCount = String(warningCount);
  return manifest;
}

export function buildVisualizationCompilerDirective(): string {
  return `[VISUALIZATION ENGINE CONTRACT — EVIDENCE BEFORE DECORATION]
The report must preserve the full research substance while replacing generic text-card walls with decision-oriented visual structures.

[SLIDE LOGIC]
For every evidence-driven slide, design in this order:
1. Decision Question: what must the reader decide or understand?
2. Evidence: which verified facts answer that question?
3. Visual Form: which visual grammar represents the evidence without distortion?
4. Interpretation: what pattern should the reader notice?
5. Implication: what action or strategic conclusion follows?

[VISUAL SELECTION]
- Two or more comparable numeric values: use bar-comparison, delta-comparison, dot-plot, KPI strip, or matrix.
- Time sequence: use timeline.
- Ordered operational stages: use process-flow.
- Causal relationships or connected roles: use system-map.
- Two explicit strategic dimensions: use positioning-map.
- Feature/brand comparison: use matrix or heatmap-style table.
- Verified advertising language: use verbatim-evidence.
- Insufficient or non-comparable evidence: use evidence-gap rather than inventing data.

[ANTI-DISTORTION]
- Never chart one isolated number as a trend.
- Never put different units or definitions on a shared scale.
- Never infer a missing value to complete a chart.
- Never convert a qualitative judgement into a numeric score unless that score exists in the research.
- Keep exact figures, units, periods, and evidence labels visible.
- Use only pure HTML/CSS/SVG. Do not use canvas, external chart libraries, base64 screenshots, or cross-origin images.

[DENSITY & HIERARCHY]
- Keep one primary visual hierarchy per slide.
- No more than four equal-weight text boxes without a visual anchor.
- A slide may retain substantial text, but the structure must be visual: headline metric, comparison, sequence, relationship, or matrix.
- Use large type only for decision-critical numbers or phrases, not for decoration.
- Separate evidence, interpretation, and implication visually.

[SYMMETRY]
- Symmetric comparisons must use equal grid tracks and equal-height sibling cards.
- Use .viz-grid with cols-2/cols-3/cols-4, or add data-symmetric-grid="true" to comparable grids.
- Do not create visibly unbalanced paired boxes unless one side is intentionally dominant and labelled as such.

[COMPONENT CONTRACT]
Use the injected component classes where applicable:
- .viz-kpi-strip > .viz-kpi
- .viz-bars > .viz-bar-row > .viz-bar-label + .viz-bar-track > .viz-bar-fill + .viz-bar-number
- .viz-dot-plot > .viz-dot-row
- .viz-flow > .viz-flow-step
- .viz-system-map > .viz-system-node
- table.viz-matrix
- .viz-interpretation
- .viz-evidence-gap

Every primary visual must include data-viz-type using one of:
kpi-strip, bar-comparison, delta-comparison, dot-plot, timeline, matrix, positioning-map, process-flow, system-map, verbatim-evidence, evidence-gap.
Use data-visual-role="evidence" on the visual, data-visual-role="interpretation" on the pattern statement, and preserve the implication bar for the final So What.

[PAGE-SPECIFIC EXPECTATIONS]
- Market Overview and Company Growth: promote verified metrics into KPI strips and comparable bars where units align.
- Competitive Threat Landscape and Ranking: visualize threat scores or comparable criteria; do not leave them as prose-only cards.
- Competitor Deep Dive: use a structured system map or 2×2 evidence layout, with one dominant threat mechanism.
- Product Matrix: retain a true comparison matrix, not paragraph boxes.
- Consumer: use journey, needs hierarchy, quote evidence, or friction flow depending on the evidence.
- Creative History: preserve the approved six-year timeline and verbatim-status rules exactly.
- Strategy: use transformation arrows, choice architecture, roadmap, or system diagrams rather than four generic SWOT text boxes alone.

[FAIL-SAFE]
If evidence does not support a chart, show the limitation explicitly with data-viz-type="evidence-gap". Factual honesty outranks visual completeness.`;
}
