const V4_JTBD = '*JTBD(Job To Be Done): 고객이 제품이나 서비스를 통해 달성하고자 하는 궁극의 목적(Job)';
const V4_AIPL = '*AIPL(Awareness·Interest·Purchase·Loyalty): 고객이 인지에서 관심·구매·충성으로 이동하는 과정';

function v4Note(slideId: string, text: string, className: string) {
  const body = document.querySelector<HTMLElement>(`${slideId} .full-slide-body`);
  if (!body || body.querySelector(`.${className}`)) return;
  const note = document.createElement('div');
  note.className = className;
  note.textContent = text;
  body.prepend(note);
}

function v4AppendHighlighted(container: HTMLElement, text: string) {
  const pattern = /(\d{4}(?:년|년\s*\d+월)?(?:\s*[~–-]\s*\d{4}(?:년)?)?|\d[\d,.]*(?:%|명|억|조|개|원|개월|건|회))/g;
  let cursor = 0;
  for (const match of text.matchAll(pattern)) {
    const offset = match.index || 0;
    if (offset > cursor) container.append(document.createTextNode(text.slice(cursor, offset)));
    const mark = document.createElement('mark');
    mark.textContent = match[0];
    container.append(mark);
    cursor = offset + match[0].length;
  }
  if (cursor < text.length) container.append(document.createTextNode(text.slice(cursor)));
}

function v4Inflection() {
  const gap = document.querySelector<HTMLElement>('#inflection .inflection-gap');
  if (!gap || gap.dataset.v4 === 'done') return;
  gap.dataset.v4 = 'done';
  gap.className = 'inflection-gap is-structured-v4';
  gap.innerHTML = `
    <div class="inflection-reality-v4">
      <span style="color:var(--full-muted);font-size:9.5px;font-weight:900;letter-spacing:.025em">PRODUCT</span>
      <strong style="display:block;margin-top:12px;font-size:12px;line-height:1.45">환급 → 케어 → SeNa → 종합 세무관리</strong>
    </div>
    <div class="inflection-gap-v4">
      <div style="color:var(--full-muted);font-size:9.5px;font-weight:900;letter-spacing:.025em">BRAND GAP · 핵심 간극</div>
      <div style="margin-top:8px;color:var(--full-red);font-size:24px;font-weight:900">≠</div>
    </div>
    <div class="inflection-perception-v4">
      <span style="color:var(--full-muted);font-size:9.5px;font-weight:900;letter-spacing:.025em">PERCEPTION</span>
      <strong>사장님 세금 환급</strong>
    </div>
  `;
}

function v4DeepDives() {
  document.querySelectorAll<HTMLElement>('.deep-dive-layout').forEach((layout) => {
    const evidence = layout.querySelector<HTMLElement>('.deep-node--1');
    const paragraph = evidence?.querySelector<HTMLElement>('p');
    const source = layout.querySelector<HTMLElement>(':scope > .full-source');
    if (!evidence || !paragraph || evidence.dataset.v4 === 'done') return;
    evidence.dataset.v4 = 'done';
    const items = (paragraph.textContent || '').split(' · ').map((x) => x.trim()).filter(Boolean);
    const list = document.createElement('ul');
    items.forEach((item) => {
      const li = document.createElement('li');
      v4AppendHighlighted(li, item);
      list.append(li);
    });
    paragraph.replaceWith(list);
    if (source) evidence.append(source);
  });
}

function v4SemanticHierarchy() {
  document.querySelectorAll<HTMLElement>('#consumer-trends .trend-so strong, .best-self-line strong, .category-job strong')
    .forEach((node) => node.classList.add('auto-semantic-highlight'));

  document.querySelectorAll<HTMLElement>('#consumer-trends .trend-row > div:nth-of-type(1) p').forEach((node) => {
    if (node.dataset.v4 === 'done') return;
    const text = node.textContent || '';
    node.textContent = '';
    v4AppendHighlighted(node, text);
    node.dataset.v4 = 'done';
  });

  document.querySelectorAll<HTMLElement>('.persona-center .persona-label').forEach((node) => { node.textContent = '핵심 Job'; });
  document.querySelectorAll<HTMLElement>('.persona-left .persona-label').forEach((node) => { node.textContent = '상황'; });
  document.querySelectorAll<HTMLElement>('.identity-shift > div:first-child span').forEach((node) => { node.textContent = '현재 정체성'; });
  document.querySelectorAll<HTMLElement>('.identity-shift > div.is-target span').forEach((node) => { node.textContent = '원하는 정체성'; });
}

function applyFullReportV4() {
  if (!new URLSearchParams(window.location.search).get('pilot')?.includes('full-integrated')) return;
  v4Inflection();
  v4DeepDives();
  v4SemanticHierarchy();
  v4Note('#aipl', V4_AIPL, 'aipl-header-note');
  document.querySelectorAll<HTMLElement>('#comp-landscape .jtbd-header-note, #jtbd .jtbd-header-note').forEach((note) => note.remove());
  ['#consumer-exec', '#persona-1', '#persona-2', '#persona-3'].forEach((id) => {
    const oldNote = document.querySelector<HTMLElement>(`${id} .jtbd-header-note`);
    if (oldNote) oldNote.textContent = V4_JTBD;
    else v4Note(id, V4_JTBD, 'jtbd-header-note');
  });
  document.querySelector<HTMLElement>('#creative-method .history-scope')?.remove();
  document.documentElement.dataset.fullReportV4Ready = 'true';
}

window.addEventListener('DOMContentLoaded', () => window.setTimeout(applyFullReportV4, 520));
window.addEventListener('load', () => window.setTimeout(applyFullReportV4, 700));
window.addEventListener('resize', applyFullReportV4);
