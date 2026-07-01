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
      <small>PRODUCT REALITY · 실제 제품 진화</small>
      <div class="product-evolution"><span>환급</span><i>→</i><span>케어</span><i>→</i><span>SeNa</span><i>→</i><span>종합 세무관리</span></div>
    </div>
    <div class="inflection-gap-v4"><small>BRAND GAP · 핵심 간극</small><strong>제품은 확장됐지만<br>소비자 인식은 환급에 고정</strong></div>
    <div class="inflection-perception-v4"><small>CURRENT PERCEPTION · 현재 인식</small><strong>사장님 세금 환급</strong></div>
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
  ['#comp-landscape', '#consumer-exec', '#persona-1', '#persona-2', '#persona-3', '#jtbd'].forEach((id) => {
    const oldNote = document.querySelector<HTMLElement>(`${id} .jtbd-header-note`);
    if (oldNote) oldNote.textContent = V4_JTBD;
    else v4Note(id, V4_JTBD, 'jtbd-header-note');
  });
  document.querySelector<HTMLElement>('#creative-method .history-scope')?.remove();
}

window.addEventListener('DOMContentLoaded', () => window.setTimeout(applyFullReportV4, 520));
window.addEventListener('load', () => window.setTimeout(applyFullReportV4, 700));
window.addEventListener('resize', applyFullReportV4);
