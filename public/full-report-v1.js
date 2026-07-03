(() => {
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char]);

  const rich = (value) => escapeHtml(value).replace(/\[\[(.+?)\]\]/g, '<mark>$1</mark>');
  const list = (items = []) => `<ul>${items.map((item) => `<li>${rich(item)}</li>`).join('')}</ul>`;
  const sourceLabel = (items = []) => items
    .map((item) => [item.publisher, item.title, item.year].filter(Boolean).map(escapeHtml).join(' · '))
    .join(' / ');

  function renderSlideBody(slide) {
    switch (slide.recipe) {
      case 'cover':
        return `<div class="cover-kicker">${rich(slide.kicker || 'STRATEGIC CONSULTING REPORT')}</div>
          <h1>${rich(slide.title)}</h1>
          <p class="cover-subtitle">${rich(slide.subtitle || '')}</p>
          <div class="cover-meta"><span>${rich(window.REPORT.brand)}</span><span>${rich(window.REPORT.generatedAt || '')}</span></div>`;
      case 'metric-strip':
        return `<div class="metric-strip">${(slide.metrics || []).map((metric) => `
          <div class="metric-item"><span>${rich(metric.label)}</span><strong>${rich(metric.value)}</strong><small>${rich(metric.period || '')}</small><p>${rich(metric.interpretation)}</p></div>`).join('')}</div>`;
      case 'milestone-timeline':
        return `<div class="timeline">${(slide.events || []).map((event) => `
          <article class="timeline-card"><b>${rich(event.period)}</b><h3>${rich(event.title)}</h3><p>${rich(event.detail)}</p></article>`).join('')}</div>`;
      case 'causal-flow':
      case 'friction-flow':
      case 'as-is-to-be':
      case 'root-cause-flow':
        return `<div class="flow">${(slide.nodes || []).map((node) => `
          <article class="flow-node ${escapeHtml(node.tone || '')}"><small>${rich(node.label)}</small><h3>${rich(node.headline)}</h3><p>${rich(node.detail || '')}</p></article>`).join('')}</div>`;
      case 'feature-matrix':
      case 'rank-scorecard':
        return `<table class="matrix"><thead><tr><th></th>${(slide.columns || []).map((column) => `<th>${rich(column)}</th>`).join('')}</tr></thead><tbody>${(slide.rows || []).map((row) => `
          <tr class="${row.emphasis ? 'emphasis' : ''}"><td>${rich(row.label)}</td>${(row.cells || []).map((cell) => `<td>${rich(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
      case 'persona': {
        const persona = slide.persona || {};
        return `<div class="persona-layout">
          <div class="persona-index">${rich(persona.number || '')}</div>
          <section class="persona-panel"><small>상황</small>${list(persona.situation || [])}<h3>${rich(persona.surfaceNeed || '')}</h3></section>
          <section class="persona-panel persona-job"><small>핵심 Job</small><h3>${rich(persona.realJob || '')}</h3><div class="persona-fears">${(persona.fears || []).map((fear) => `<p>${rich(fear)}</p>`).join('')}</div></section>
          <section class="persona-panel"><div class="identity-shift"><div class="identity-box"><small>현재 정체성</small><p>${rich(persona.currentIdentity || '')}</p></div><div class="stp-arrow">→</div><div class="identity-box target"><small>원하는 정체성</small><p>${rich(persona.desiredIdentity || '')}</p></div></div><div class="brand-role"><small>브랜드의 역할</small><h3>${rich(persona.brandRole || '')}</h3></div></section>
        </div>`;
      }
      case 'creative-history':
        return `<div class="history-grid">${(slide.years || []).map((year) => `
          <article class="history-card ${year.status === 'verified' ? 'verified' : ''}"><h3>${rich(year.year)}</h3><span class="history-status">${rich(year.status)}</span><h4>${rich(year.campaign)}</h4><blockquote>${rich(year.copy)}</blockquote><p>${rich(year.detail)}</p></article>`).join('')}</div>
          <div class="history-bottom"><div><span>MESSAGE TRAJECTORY</span><strong>${rich(slide.trajectory || '')}</strong></div><div class="history-strategy"><span>STRATEGIC SO WHAT</span><strong>${rich(slide.strategicSoWhat || '')}</strong></div></div>`;
      case 'swot':
        return `<div class="swot-grid">${['strength', 'weakness', 'opportunity', 'threat'].map((key) => `
          <section class="swot-box ${key}"><h3>${key.toUpperCase()}</h3>${list(slide[key] || [])}</section>`).join('')}</div>`;
      case 'stp-convergence':
        return `<div class="stp-grid"><section class="stp-panel"><small>SEGMENT</small>${(slide.segments || []).map((segment) => `<h3>${rich(segment.name)}</h3><p>${rich(segment.description)}</p>`).join('')}</section><div class="stp-arrow">→</div><section class="stp-panel target"><small>TARGET</small><h3>${rich(slide.target?.name || '')}</h3><p>${rich(slide.target?.description || '')}</p></section><div class="stp-arrow">→</div><section class="stp-panel positioning"><small>POSITIONING</small><h3>${rich(slide.positioning?.statement || '')}</h3>${list(slide.positioning?.proof || [])}</section></div>`;
      case 'choice-architecture':
        return `<div class="choice-layout">${(slide.options || []).map((option) => `
          <section class="choice-option ${option.selected ? 'selected' : ''}"><small>${rich(option.score || '')}</small><h3>${rich(option.name)}</h3><p>${rich(option.rationale)}</p></section>`).join('')}<section class="choice-final"><h3>${rich(slide.finalChoice?.name || '')}</h3><p>${rich(slide.finalChoice?.statement || '')}</p>${list(slide.finalChoice?.reasons || [])}</section></div>`;
      case 'roadmap':
        return `<div class="roadmap">${(slide.items || []).map((item) => `
          <section class="roadmap-step"><b>${rich(item.label)}</b><h3>${rich(item.headline)}</h3><p>${rich(item.detail || '')}</p></section>`).join('')}</div>`;
      case 'evidence-list':
      case 'evidence-gap':
        return `<div class="evidence-list">${(slide.items || []).map((item) => `
          <section class="evidence-item ${escapeHtml(item.tone || '')}"><small>${rich(item.label)}</small><h3>${rich(item.headline)}</h3><p>${rich(item.detail || '')}</p></section>`).join('')}</div>`;
      default:
        return `<div class="card-grid">${(slide.sections || []).map((section) => `
          <section class="card ${escapeHtml(section.tone || '')}"><div class="eyebrow">${rich(section.label)}</div><h3>${rich(section.headline)}</h3>${list(section.bullets || [])}</section>`).join('')}</div>`;
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
    if (!slide.id || ids.has(slide.id)) fail(`페이지 ${index + 1}의 ID가 없거나 중복되었습니다.`);
    if (!Number.isInteger(slide.page) || pages.has(slide.page)) fail(`페이지 번호 ${slide.page}가 없거나 중복되었습니다.`);
    ids.add(slide.id);
    pages.add(slide.page);
    const expectedZone = index < 40 ? 'main' : 'appendix';
    if (slide.zone !== expectedZone) fail(`페이지 ${slide.page}의 zone은 ${expectedZone}이어야 합니다.`);
  });

  window.REPORT = report;
  const accent = typeof report.accentColor === 'string' && /^#[0-9a-f]{6}$/i.test(report.accentColor)
    ? report.accentColor
    : null;
  if (accent) document.documentElement.style.setProperty('--accent', accent);

  document.title = `${report.brand} Strategic Consulting Report`;
  document.getElementById('report-brand').textContent = report.brand;
  const content = document.getElementById('content');
  const nav = document.getElementById('report-nav-groups');
  let currentChapter = '';

  slides.forEach((slide) => {
    if (slide.chapter !== currentChapter) {
      currentChapter = slide.chapter;
      nav.insertAdjacentHTML('beforeend', `<div class="nav-group"><div class="nav-title">${rich(currentChapter)}</div><div data-chapter="${escapeHtml(currentChapter)}"></div></div>`);
    }
    nav.lastElementChild.lastElementChild.insertAdjacentHTML('beforeend', `<a class="nav-item" href="#${escapeHtml(slide.id)}"><span>${String(slide.page).padStart(2, '0')}</span>${rich(slide.title)}</a>`);

    const isCover = slide.recipe === 'cover';
    const slideHtml = isCover
      ? `<section id="${escapeHtml(slide.id)}" class="full-slide full-slide--cover" data-page="${slide.page}" data-zone="${escapeHtml(slide.zone)}" data-recipe="cover">${renderSlideBody(slide)}</section>`
      : `<section id="${escapeHtml(slide.id)}" class="full-slide" data-page="${slide.page}" data-zone="${escapeHtml(slide.zone)}" data-recipe="${escapeHtml(slide.recipe)}"><header class="full-slide-header"><div class="full-breadcrumb">${rich(slide.chapter)}</div><div class="full-title-row"><h2>${rich(slide.title)}</h2><div class="full-title-meta">${slide.tag ? `<span class="full-tag">${rich(slide.tag)}</span>` : ''}<span class="full-page">${String(slide.page).padStart(2, '0')}</span></div></div><div class="full-note">${rich(slide.note || '')}</div></header><div class="full-slide-body">${renderSlideBody(slide)}</div><footer class="full-implication"><span>SO WHAT</span><div>${rich(slide.implication || '')}</div></footer><div class="full-source">${sourceLabel(slide.sources || [])}</div></section>`;
    content.insertAdjacentHTML('beforeend', slideHtml);
  });

  const links = [...document.querySelectorAll('.nav-item')];
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (entry.isIntersecting) {
      links.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
    }
  }), { rootMargin: '-35% 0px -55% 0px' });
  document.querySelectorAll('.full-slide').forEach((slide) => observer.observe(slide));
})();
