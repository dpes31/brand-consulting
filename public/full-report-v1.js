(() => {
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char]);

  const rich = (value) => escapeHtml(value).replace(/\[\[(.+?)\]\]/g, '<mark>$1</mark>');
  const list = (items = []) => `<ul>${items.map((item) => `<li>${rich(item)}</li>`).join('')}</ul>`;
  const sourceLabel = (items = []) => items
    .map((item) => [item.publisher, item.title, item.year].filter(Boolean).map(escapeHtml).join(' · '))
    .join(' / ');

  function renderApprovedFlow(slide) {
    const nodes = slide.nodes || [];
    const isCompetitorDeepDive = slide.chapter?.includes('COMPETITOR') && slide.page >= 13 && slide.page <= 15;
    if (!isCompetitorDeepDive) {
      return `<div class="flow">${nodes.map((node) => `
        <article class="flow-node ${escapeHtml(node.tone || '')}"><small>${rich(node.label)}</small><h3>${rich(node.headline)}</h3><p>${rich(node.detail || '')}</p></article>`).join('')}</div>`;
    }

    return `<div class="deep-dive-layout">
      <div class="deep-dive-score"><span>THREAT SYSTEM</span><strong>${String(slide.page - 12).padStart(2, '0')}</strong><small>선정 경쟁사 독립 분석</small></div>
      <div class="deep-dive-flow">${nodes.map((node, index) => `
        <div class="deep-node deep-node--${index + 1}"><small>${rich(node.label)}</small><h3>${rich(node.headline)}</h3><p>${rich(node.detail || '')}</p>${index < nodes.length - 1 ? '<i>→</i>' : ''}</div>`).join('')}</div>
    </div>`;
  }

  function renderApprovedPersona(slide) {
    const persona = slide.persona || {};
    return `<div class="persona-layout">
      <div class="persona-index">${rich(persona.number || '')}</div>
      <div class="persona-left">
        <div class="persona-label">SITUATION</div>
        ${list(persona.situation || [])}
        <div class="persona-quote"><span>표면 욕구</span><strong>${rich(persona.surfaceNeed || '')}</strong></div>
      </div>
      <div class="persona-center">
        <div class="persona-label">REAL JTBD</div>
        <h3>${rich(persona.realJob || '')}</h3>
        <div class="persona-fears"><span>핵심 두려움</span>${(persona.fears || []).map((fear) => `<p>${rich(fear)}</p>`).join('')}</div>
      </div>
      <div class="persona-right">
        <div class="identity-shift"><div><span>AS-IS IDENTITY</span><p>${rich(persona.currentIdentity || '')}</p></div><i>→</i><div class="is-target"><span>TO-BE IDENTITY</span><p>${rich(persona.desiredIdentity || '')}</p></div></div>
        <div class="brand-role"><span>브랜드의 역할</span><strong>${rich(persona.brandRole || '')}</strong></div>
      </div>
    </div>`;
  }

  function renderApprovedCreativeHistory(slide) {
    return `<div class="history-governing">검증된 원문만 인용하고, 확인되지 않은 연도는 근거 상태를 그대로 표시했습니다.</div>
      <div class="history-grid">${(slide.years || []).map((year, index) => `
        <article class="history-card ${year.status === 'verified-verbatim' || year.status === 'verified' ? 'is-verified verified' : ''}">
          ${index === (slide.years || []).length - 1 ? '<b class="history-now">NOW</b>' : ''}
          <h3>${rich(year.year)}</h3><span class="history-status history-status--${escapeHtml(year.status)}">${rich(year.status)}</span>
          <h4>${rich(year.campaign)}</h4><blockquote>${rich(year.copy)}</blockquote><div class="history-detail">${rich(year.detail)}</div>
          <div class="t-evidence">${sourceLabel(year.source ? [year.source] : [])}</div>
        </article>`).join('')}</div>
      <div class="history-bottom"><div><span>Message Trajectory</span><strong>${rich(slide.trajectory || '')}</strong></div><div class="is-strategic history-strategy"><span>Strategic So What</span><strong>${rich(slide.strategicSoWhat || '')}</strong></div></div>`;
  }

  function renderApprovedSwot(slide) {
    const groups = [
      ['Strength (강점)', slide.strength || [], 'strength'],
      ['Weakness (약점)', slide.weakness || [], 'weakness'],
      ['Opportunity (기회)', slide.opportunity || [], 'opportunity'],
      ['Threat (위협)', slide.threat || [], 'threat'],
    ];
    return `<div class="swot-governing">${rich(slide.implication || '')}</div><div class="swot-grid">${groups.map(([title, items, tone]) => `
      <div class="swot-quadrant swot-quadrant--${tone} swot-box ${tone}"><h3>${rich(title)}</h3>${items.map((item) => `<div class="swot-point"><p>— ${rich(item)}</p></div>`).join('')}</div>`).join('')}</div>`;
  }

  function renderApprovedStp(slide) {
    return `<div class="stp-layout">
      <div class="stp-segments"><span>SEGMENTATION</span>${(slide.segments || []).map((segment) => `<div class="${segment.selected ? 'is-selected' : ''}"><b>${rich(segment.name)}</b><p>${rich(segment.description)}</p></div>`).join('')}</div>
      <div class="stp-arrow">→</div>
      <div class="stp-target"><span>TARGETING</span><strong>${rich(slide.target?.name || '')}</strong><p>${rich(slide.target?.description || '')}</p></div>
      <div class="stp-arrow">→</div>
      <div class="stp-position"><span>POSITIONING</span><strong>${rich(slide.positioning?.statement || '')}</strong>${list(slide.positioning?.proof || [])}</div>
    </div>`;
  }

  function renderSlideBody(slide) {
    switch (slide.recipe) {
      case 'cover':
        return `<div class="cover-kicker">${rich(slide.kicker || 'STRATEGIC CONSULTING REPORT')}</div><h1>${rich(slide.title)}</h1><p class="cover-subtitle">${rich(slide.subtitle || '')}</p><div class="cover-meta"><span>${rich(window.REPORT.brand)}</span><span>${rich(window.REPORT.generatedAt || '')}</span></div>`;
      case 'metric-strip':
        return `<div class="metric-strip">${(slide.metrics || []).map((metric) => `<div class="metric-item"><span>${rich(metric.label)}</span><strong>${rich(metric.value)}</strong><small>${rich(metric.period || '')}</small><p>${rich(metric.interpretation)}</p></div>`).join('')}</div>`;
      case 'milestone-timeline':
        return `<div class="timeline">${(slide.events || []).map((event) => `<article class="timeline-card"><b>${rich(event.period)}</b><h3>${rich(event.title)}</h3><p>${rich(event.detail)}</p></article>`).join('')}</div>`;
      case 'causal-flow':
      case 'friction-flow':
      case 'as-is-to-be':
      case 'root-cause-flow':
        return renderApprovedFlow(slide);
      case 'feature-matrix':
      case 'rank-scorecard':
        return `<table class="matrix matrix-table"><thead><tr><th></th>${(slide.columns || []).map((column) => `<th>${rich(column)}</th>`).join('')}</tr></thead><tbody>${(slide.rows || []).map((row) => `<tr class="${row.emphasis ? 'emphasis is-target' : ''}"><td>${rich(row.label)}</td>${(row.cells || []).map((cell) => `<td>${rich(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
      case 'persona': return renderApprovedPersona(slide);
      case 'creative-history': return renderApprovedCreativeHistory(slide);
      case 'swot': return renderApprovedSwot(slide);
      case 'stp-convergence': return renderApprovedStp(slide);
      case 'choice-architecture':
        return `<div class="choice-layout">${(slide.options || []).map((option) => `<section class="choice-option ${option.selected ? 'selected is-selected' : ''}"><small>${rich(option.score || '')}</small><h3>${rich(option.name)}</h3><p>${rich(option.rationale)}</p></section>`).join('')}<section class="choice-final"><span>FINAL CHOICE</span><h3>${rich(slide.finalChoice?.name || '')}</h3><p>${rich(slide.finalChoice?.statement || '')}</p>${list(slide.finalChoice?.reasons || [])}</section></div>`;
      case 'roadmap':
        return `<div class="roadmap roadmap-line">${(slide.items || []).map((item, index) => `<section class="roadmap-step"><span>${String(index + 1).padStart(2, '0')}</span><b>${rich(item.label)}</b><h3>${rich(item.headline)}</h3><p>${rich(item.detail || '')}</p>${index < (slide.items || []).length - 1 ? '<i>→</i>' : ''}</section>`).join('')}</div>`;
      case 'evidence-list':
      case 'evidence-gap':
        return `<div class="evidence-list evidence-gap-grid">${(slide.items || []).map((item, index) => `<section class="evidence-item ${escapeHtml(item.tone || '')}"><span>${String(index + 1).padStart(2, '0')}</span><small>${rich(item.label)}</small><h3>${rich(item.headline)}</h3><p>${rich(item.detail || '')}</p></section>`).join('')}</div>`;
      default:
        return `<div class="card-grid">${(slide.sections || []).map((section) => `<section class="card ${escapeHtml(section.tone || '')}"><div class="eyebrow">${rich(section.label)}</div><h3>${rich(section.headline)}</h3>${list(section.bullets || [])}</section>`).join('')}</div>`;
    }
  }

  function fail(message) {
    document.body.innerHTML = `<div class="fatal">${escapeHtml(message)}</div>`;
    throw new Error(message);
  }

  let report;
  try {
    report = JSON.parse(document.getElementById('report-data')?.textContent || '');
  } catch (error) {
    fail(`보고서 JSON을 읽을 수 없습니다: ${error.message}`);
  }

  if (!report || report.version !== '1.0.0') fail('지원하지 않는 보고서 버전입니다.');
  if (!Array.isArray(report.mainSlides) || report.mainSlides.length !== 40) fail('Main Deck은 정확히 40페이지여야 합니다.');
  if (!Array.isArray(report.appendixSlides) || report.appendixSlides.length !== 8) fail('Appendix는 정확히 8페이지여야 합니다.');

  const slides = [...report.mainSlides, ...report.appendixSlides];
  const ids = new Set();
  const pages = new Set();
  slides.forEach((slide, index) => {
    const expectedPage = index + 1;
    if (!slide.id || ids.has(slide.id)) fail(`페이지 ${expectedPage}의 ID가 없거나 중복되었습니다.`);
    if (!Number.isInteger(slide.page) || pages.has(slide.page)) fail(`페이지 번호 ${slide.page}가 없거나 중복되었습니다.`);
    if (slide.page !== expectedPage) fail(`페이지 순서 오류: 위치 ${expectedPage}에 페이지 ${slide.page}가 있습니다.`);
    ids.add(slide.id);
    pages.add(slide.page);
    const expectedZone = index < 40 ? 'main' : 'appendix';
    if (slide.zone !== expectedZone) fail(`페이지 ${slide.page}의 zone은 ${expectedZone}이어야 합니다.`);
  });

  window.REPORT = report;
  const accent = typeof report.accentColor === 'string' && /^#[0-9a-f]{6}$/i.test(report.accentColor) ? report.accentColor : null;
  if (accent) {
    document.documentElement.style.setProperty('--accent', accent);
    document.documentElement.style.setProperty('--full-accent', accent);
  }

  document.title = `${report.brand} Strategic Consulting Report`;
  const reportBrand = document.getElementById('report-brand');
  if (reportBrand) reportBrand.innerHTML = `${rich(report.brand)}<span>FULL REPORT V1</span>`;
  const content = document.getElementById('content');
  const nav = document.getElementById('report-nav-groups');
  if (!content || !nav) fail('FULL 보고서 Renderer의 필수 DOM이 없습니다.');
  let currentChapter = '';

  slides.forEach((slide) => {
    if (slide.chapter !== currentChapter) {
      currentChapter = slide.chapter;
      nav.insertAdjacentHTML('beforeend', `<div class="nav-group full-nav-group"><div class="nav-title">${rich(currentChapter)}</div><div data-chapter="${escapeHtml(currentChapter)}"></div></div>`);
    }
    nav.lastElementChild.lastElementChild.insertAdjacentHTML('beforeend', `<a class="nav-item" href="#${escapeHtml(slide.id)}"><span>${String(slide.page).padStart(2, '0')}</span>${rich(slide.title)}</a>`);

    const isCover = slide.recipe === 'cover';
    const slideHtml = isCover
      ? `<section id="${escapeHtml(slide.id)}" class="full-slide full-slide--cover" data-page="${slide.page}" data-zone="${escapeHtml(slide.zone)}" data-recipe="cover">${renderSlideBody(slide)}</section>`
      : `<section id="${escapeHtml(slide.id)}" class="full-slide" data-page="${slide.page}" data-zone="${escapeHtml(slide.zone)}" data-recipe="${escapeHtml(slide.recipe)}"><header class="full-slide-header"><div class="full-breadcrumb">${rich(slide.chapter)}</div><div class="full-title-row"><h2>${rich(slide.title)}</h2><div class="full-title-meta">${slide.tag ? `<span class="full-tag">${rich(slide.tag)}</span>` : ''}<span class="full-page">${String(slide.page).padStart(2, '0')}</span></div></div><div class="full-note">${rich(slide.note || '')}</div></header><div class="full-slide-body">${renderSlideBody(slide)}</div><footer class="full-implication"><span>SO WHAT</span><div>${rich(slide.implication || '')}</div></footer><div class="full-source">${sourceLabel(slide.sources || [])}</div></section>`;
    content.insertAdjacentHTML('beforeend', slideHtml);
  });

  document.documentElement.dataset.fullReportRendered = String(slides.length);
  const links = [...document.querySelectorAll('.nav-item')];
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (entry.isIntersecting) links.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
  }), { rootMargin: '-35% 0px -55% 0px' });
  document.querySelectorAll('.full-slide').forEach((slide) => observer.observe(slide));
})();
