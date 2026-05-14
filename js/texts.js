(function () {
  'use strict';

  /* ================================================================
     STATE
  ================================================================ */
  let allTexts        = [];
  let activeCategories = [];
  let currentTextId   = null;

  /* ================================================================
     DOM REFS — gesetzt nach DOMContentLoaded
  ================================================================ */
  let sectionQuotes, sectionTexts, textsLibrary, textsReader,
      textsGrid, textsFilter, readerCard, readerBack, featuredText;

  /* ================================================================
     SECTION SWITCHER
  ================================================================ */
  function initSectionNav() {
    document.querySelectorAll('.section-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const target = pill.dataset.section;
        showSection(target);
      });
    });
  }

  function showSection(name) {
    const pills = document.querySelectorAll('.section-pill');
    pills.forEach(p => {
      const active = p.dataset.section === name;
      p.classList.toggle('active', active);
      p.setAttribute('aria-selected', active);
    });

    if (name === 'quotes') {
      sectionQuotes.hidden = false;
      sectionTexts.hidden  = true;
    } else {
      sectionQuotes.hidden = true;
      sectionTexts.hidden  = false;
      // Reader schließen wenn man zurückwechselt
      closeReader(false);
    }
  }

  /* ================================================================
     KATEGORIE-FILTER (Texte)
  ================================================================ */
  function buildCategories() {
    const cats = [...new Set(allTexts.map(t => t.category).filter(Boolean))].sort();
    textsFilter.innerHTML = '';
    cats.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = 'cat-pill';
      btn.textContent = cat;
      btn.setAttribute('role', 'checkbox');
      btn.setAttribute('aria-checked', 'false');
      btn.addEventListener('click', () => toggleCategory(cat, btn));
      textsFilter.appendChild(btn);
    });
  }

  function toggleCategory(cat, btn) {
    const idx = activeCategories.indexOf(cat);
    if (idx === -1) {
      activeCategories.push(cat);
      btn.classList.add('active');
      btn.setAttribute('aria-checked', 'true');
    } else {
      activeCategories.splice(idx, 1);
      btn.classList.remove('active');
      btn.setAttribute('aria-checked', 'false');
    }
    renderGrid();
  }

  function filteredTexts() {
    if (!activeCategories.length) return allTexts;
    return allTexts.filter(t => activeCategories.includes(t.category));
  }

  /* ================================================================
     FEATURED TEXT (Zitate-Section)
  ================================================================ */
  function renderFeaturedText() {
    if (!featuredText || !allTexts.length) return;
    const t = allTexts[Math.floor(Math.random() * allTexts.length)];

    const langBadge = t.lang === 'de'
      ? '<span class="text-lang-badge">DE</span>'
      : '<span class="text-lang-badge text-lang-en">EN</span>';

    featuredText.innerHTML = `
      <div class="featured-text-card" role="button" tabindex="0"
           aria-label="${t.title} von ${t.author} lesen">
        <p class="featured-text-label">Aus der Bibliothek</p>
        <div class="featured-text-meta">
          ${langBadge}
          ${t.category ? `<span class="text-cat-badge">${t.category}</span>` : ''}
        </div>
        <h3 class="featured-text-title">${t.title}</h3>
        <p class="featured-text-author">${t.author}</p>
        <p class="featured-text-teaser">${t.description || ''}</p>
        <span class="featured-text-cta">Lesen →</span>
      </div>
    `;

    const card = featuredText.querySelector('.featured-text-card');
    const open = () => { showSection('texts'); openReader(t); };
    card.addEventListener('click', open);
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
    });
  }

  /* ================================================================
     BIBLIOTHEK — GRID
  ================================================================ */
  function renderGrid() {
    const list = filteredTexts();
    textsGrid.innerHTML = '';

    if (!list.length) {
      textsGrid.innerHTML = '<p class="texts-empty">Keine Texte in dieser Kategorie.</p>';
      return;
    }

    list.forEach(t => {
      const card = document.createElement('article');
      card.className = 'text-card';
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', `${t.title} von ${t.author} öffnen`);

      const langBadge = t.lang === 'de'
        ? '<span class="text-lang-badge">DE</span>'
        : '<span class="text-lang-badge text-lang-en">EN</span>';

      card.innerHTML = `
        <div class="text-card-top">
          ${langBadge}
          <span class="text-cat-badge">${t.category || ''}</span>
        </div>
        <h3 class="text-card-title">${t.title}</h3>
        <p class="text-card-author">${t.author}</p>
        <p class="text-card-teaser">${t.description || ''}</p>
      `;

      card.addEventListener('click', () => openReader(t));
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openReader(t); }
      });
      textsGrid.appendChild(card);
    });
  }

  /* ================================================================
     READER
  ================================================================ */
  async function openReader(textMeta) {
    currentTextId = textMeta.id;
    textsLibrary.hidden = true;
    textsReader.hidden  = false;

    readerCard.innerHTML = `
      <div class="reader-header">
        <h2 class="reader-title">${textMeta.title}</h2>
        <p class="reader-author">${textMeta.author}</p>
        ${textMeta.category ? `<span class="text-cat-badge reader-cat">${textMeta.category}</span>` : ''}
      </div>
      <div class="reader-body reader-loading">Lädt…</div>
    `;

    try {
      const raw = await fetch(textMeta.file).then(r => r.text());
      const html = parseMarkdown(raw);
      readerCard.querySelector('.reader-body').outerHTML;
      readerCard.querySelector('.reader-body').className = 'reader-body';
      readerCard.querySelector('.reader-body').innerHTML = html;
    } catch (e) {
      readerCard.querySelector('.reader-body').innerHTML =
        '<p class="reader-error">Text konnte nicht geladen werden.</p>';
    }

    readerCard.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    readerBack.focus();
  }

  function closeReader(renderLib = true) {
    currentTextId = null;
    textsReader.hidden  = true;
    textsLibrary.hidden = false;
    if (renderLib) renderGrid();
  }

  /* ================================================================
     MINI MARKDOWN PARSER
  ================================================================ */
  function parseMarkdown(raw) {
    // 1. Frontmatter entfernen
    let md = raw.replace(/^---[\s\S]*?---\s*\n/, '').trim();

    const lines  = md.split('\n');
    const output = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // Leerzeile
      if (line.trim() === '') { i++; continue; }

      // Horizontale Linie
      if (/^---+$/.test(line.trim())) {
        output.push('<hr>');
        i++;
        continue;
      }

      // Überschriften
      const h2 = line.match(/^##\s+(.+)/);
      if (h2) { output.push(`<h2>${escape(h2[1])}</h2>`); i++; continue; }

      const h3 = line.match(/^###\s+(.+)/);
      if (h3) { output.push(`<h3>${escape(h3[1])}</h3>`); i++; continue; }

      const h1 = line.match(/^#\s+(.+)/);
      if (h1) { output.push(`<h2>${escape(h1[1])}</h2>`); i++; continue; }

      // Kursiv-Block (*text* allein auf einer Zeile)
      const italic = line.match(/^\*([^*]+)\*$/);
      if (italic) { output.push(`<p class="reader-italic">${escape(italic[1])}</p>`); i++; continue; }

      // Absatz: sammle zusammenhängende Zeilen
      const para = [];
      while (i < lines.length && lines[i].trim() !== '' &&
             !lines[i].match(/^#{1,3}\s/) &&
             !lines[i].match(/^---+$/) &&
             !lines[i].match(/^\*[^*]+\*$/)) {
        para.push(lines[i]);
        i++;
      }
      if (para.length) {
        const text = inlineFormat(para.join(' '));
        output.push(`<p>${text}</p>`);
      }
    }

    return output.join('\n');
  }

  function escape(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function inlineFormat(s) {
    return escape(s)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>');
  }

  /* ================================================================
     INIT
  ================================================================ */
  async function init() {
    sectionQuotes = document.getElementById('sectionQuotes');
    sectionTexts  = document.getElementById('sectionTexts');
    textsLibrary  = document.getElementById('textsLibrary');
    textsReader   = document.getElementById('textsReader');
    textsGrid     = document.getElementById('textsGrid');
    textsFilter   = document.getElementById('textsFilter');
    readerCard    = document.getElementById('readerCard');
    readerBack    = document.getElementById('readerBack');
    featuredText  = document.getElementById('featuredText');

    if (!sectionTexts) return;

    readerBack.addEventListener('click', () => closeReader(true));

    const brandHome = document.getElementById('brandHome');
    if (brandHome) brandHome.addEventListener('click', () => showSection('quotes'));

    try {
      const res = await fetch('texts.json');
      allTexts = await res.json();
    } catch (e) {
      console.error('texts.json konnte nicht geladen werden', e);
      return;
    }

    buildCategories();
    renderGrid();
    renderFeaturedText();
    initSectionNav();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
