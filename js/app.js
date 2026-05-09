'use strict';

(function () {
    /* ============================================================
       CONSTANTS
    ============================================================ */
    var FAV_KEY = 'quote-generator-favorites';

    /* ============================================================
       DOM-REFERENZEN
    ============================================================ */
    var quoteCard      = document.getElementById('quoteCard');
    var quoteTextEl    = document.getElementById('quoteText');
    var quoteBadgeEl   = document.getElementById('quoteBadge');
    var authorAvEl     = document.getElementById('authorAvatar');
    var authorNameEl   = document.getElementById('authorName');
    var authorDescEl   = document.getElementById('authorDesc');
    var newQuoteBtn    = document.getElementById('newQuoteBtn');
    var copyBtn        = document.getElementById('copyBtn');
    var shareBtn       = document.getElementById('shareBtn');
    var favBtn         = document.getElementById('favoriteBtn');
    var favIconEl      = document.getElementById('favIcon');
    var favLabelEl     = document.getElementById('favLabel');
    var favToggle      = document.getElementById('favToggle');
    var favPanel       = document.getElementById('favPanel');
    var favEmptyEl     = document.getElementById('favEmpty');
    var favListEl      = document.getElementById('favList');
    var favCountEl     = document.getElementById('favCount');
    var toastEl        = document.getElementById('toast');
    var autoplayBtn    = document.getElementById('autoplayBtn');
    var autoplayIconEl = document.getElementById('autoplayIcon');
    var autoplayLblEl  = document.getElementById('autoplayLabel');
    var autoplayBarEl  = document.getElementById('autoplayBar');
    var categoryFilterEl = document.getElementById('categoryFilter');

    /* ============================================================
       STATE
    ============================================================ */
    var quotes          = [];
    var currentQuote    = null;
    var favorites       = [];
    var activeCategory  = 'alle';
    var autoplayActive  = false;
    var autoplayTimer   = null;
    var AUTOPLAY_MS     = 15000;

    try { favorites = JSON.parse(localStorage.getItem(FAV_KEY)) || []; }
    catch (e) { favorites = []; }

    /* ============================================================
       TOAST
    ============================================================ */
    var toastTimer;

    function showToast(msg) {
        toastEl.textContent = msg;
        toastEl.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () {
            toastEl.classList.remove('show');
        }, 2700);
    }

    /* ============================================================
       HILFSFUNKTIONEN
    ============================================================ */
    function getInitials(name) {
        return name.trim().split(/\s+/).slice(0, 2).map(function (w) {
            return w[0].toUpperCase();
        }).join('');
    }

    function escHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function prefersReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    /* ============================================================
       ZITAT ANZEIGEN
    ============================================================ */
    function renderQuote(quote) {
        currentQuote = quote;
        quoteTextEl.textContent  = quote.text;
        authorNameEl.textContent = quote.author;
        authorDescEl.textContent = quote.description || '';
        authorAvEl.textContent   = getInitials(quote.author);
        quoteBadgeEl.textContent = (quote.lang || 'de').toUpperCase();
        updateFavBtn();
    }

    var quoteAnimTimer;

    function showQuote(quote) {
        clearTimeout(quoteAnimTimer);

        if (prefersReducedMotion()) {
            renderQuote(quote);
            return;
        }

        quoteCard.style.opacity   = '0';
        quoteCard.style.transform = 'translateY(-6px) scale(0.99)';

        quoteAnimTimer = setTimeout(function () {
            renderQuote(quote);
            quoteCard.style.opacity   = '';
            quoteCard.style.transform = '';
        }, 220);
    }

    /* ============================================================
       KATEGORIE-FILTER
    ============================================================ */
    function getFilteredQuotes() {
        if (activeCategory === 'alle') return quotes;
        return quotes.filter(function (q) { return q.category === activeCategory; });
    }

    function initCategoryFilter() {
        var seen = {};
        var cats = [];
        quotes.forEach(function (q) {
            if (q.category && !seen[q.category]) { seen[q.category] = true; cats.push(q.category); }
        });
        cats.sort();

        categoryFilterEl.innerHTML = '';
        ['Alle'].concat(cats).forEach(function (cat) {
            var key = cat === 'Alle' ? 'alle' : cat;
            var btn = document.createElement('button');
            btn.className = 'cat-pill' + (key === activeCategory ? ' active' : '');
            btn.textContent = cat;
            btn.setAttribute('data-cat', key);
            btn.addEventListener('click', function () {
                categoryFilterEl.querySelectorAll('.cat-pill').forEach(function (p) { p.classList.remove('active'); });
                btn.classList.add('active');
                activeCategory = key;
                showRandomQuote();
                if (autoplayActive) resetAutoplayBar();
            });
            categoryFilterEl.appendChild(btn);
        });
    }

    /* ============================================================
       AUTOPLAY
    ============================================================ */
    function resetAutoplayBar() {
        autoplayBarEl.classList.remove('running');
        void autoplayBarEl.offsetWidth;
        autoplayBarEl.classList.add('running');
    }

    function startAutoplay() {
        autoplayActive = true;
        autoplayBtn.classList.add('is-playing');
        autoplayBtn.setAttribute('aria-pressed', 'true');
        autoplayIconEl.textContent = '⏸';
        autoplayLblEl.textContent  = 'Pause';
        resetAutoplayBar();
        autoplayTimer = setInterval(function () {
            showRandomQuote();
            resetAutoplayBar();
        }, AUTOPLAY_MS);
    }

    function stopAutoplay() {
        autoplayActive = false;
        clearInterval(autoplayTimer);
        autoplayTimer = null;
        autoplayBtn.classList.remove('is-playing');
        autoplayBtn.setAttribute('aria-pressed', 'false');
        autoplayIconEl.textContent = '▶';
        autoplayLblEl.textContent  = 'Autoplay';
        autoplayBarEl.classList.remove('running');
    }

    function toggleAutoplay() {
        if (autoplayActive) stopAutoplay(); else startAutoplay();
    }

    document.addEventListener('visibilitychange', function () {
        if (!autoplayActive) return;
        if (document.hidden) {
            clearInterval(autoplayTimer);
            autoplayBarEl.style.animationPlayState = 'paused';
        } else {
            autoplayBarEl.style.animationPlayState = 'running';
            autoplayTimer = setInterval(function () {
                showRandomQuote();
                resetAutoplayBar();
            }, AUTOPLAY_MS);
        }
    });

    function showRandomQuote() {
        var pool = getFilteredQuotes();
        if (!pool.length) return;
        var next;
        if (pool.length > 1) {
            do { next = pool[Math.floor(Math.random() * pool.length)]; } while (next === currentQuote);
        } else {
            next = pool[0];
        }
        showQuote(next);
    }

    /* ============================================================
       FAVORITEN – Persistenz
    ============================================================ */
    function saveFavs() {
        try { localStorage.setItem(FAV_KEY, JSON.stringify(favorites)); }
        catch (e) { /* silent */ }
    }

    function isFav(q) {
        return favorites.some(function (f) {
            return f.text === q.text && f.author === q.author;
        });
    }

    function updateFavBtn() {
        if (!currentQuote) return;
        var active = isFav(currentQuote);
        favBtn.classList.toggle('is-fav', active);
        favBtn.setAttribute('aria-pressed', String(active));
        favIconEl.textContent  = active ? '♥' : '♡';
        favLabelEl.textContent = active ? 'Gespeichert' : 'Favorit';
    }

    function toggleFav() {
        if (!currentQuote) return;
        if (isFav(currentQuote)) {
            favorites = favorites.filter(function (f) {
                return !(f.text === currentQuote.text && f.author === currentQuote.author);
            });
            showToast('Favorit entfernt');
        } else {
            favorites.push({
                text:        currentQuote.text,
                author:      currentQuote.author,
                description: currentQuote.description || '',
                lang:        currentQuote.lang || 'de',
                category:    currentQuote.category || ''
            });
            showToast('Als Favorit gespeichert ♥');
        }
        saveFavs();
        updateFavBtn();
        updateFavCount();
        if (!favPanel.hidden) renderFavList();
    }

    function updateFavCount() {
        favCountEl.textContent = favorites.length;
    }

    /* ============================================================
       FAVORITEN – Liste rendern
    ============================================================ */
    function renderFavList() {
        favListEl.innerHTML = '';

        if (!favorites.length) {
            favEmptyEl.hidden = false;
            return;
        }
        favEmptyEl.hidden = true;

        favorites.forEach(function (fav, index) {
            var item = document.createElement('div');
            item.className = 'fav-item';
            item.setAttribute('role', 'listitem');

            var body = document.createElement('div');
            body.className = 'fav-item-body';
            body.setAttribute('role', 'button');
            body.setAttribute('tabindex', '0');
            body.setAttribute('aria-label', 'Zitat von ' + fav.author + ' anzeigen');
            body.innerHTML =
                '<div class="fav-item-text">' + escHtml(fav.text) + '</div>' +
                '<div class="fav-item-author">— ' + escHtml(fav.author) + '</div>';

            function activateFav() {
                var found = quotes.find(function (q) {
                    return q.text === fav.text && q.author === fav.author;
                }) || fav;
                showQuote(found);
                if (window.innerWidth < 500) {
                    favPanel.hidden = true;
                    favToggle.setAttribute('aria-expanded', 'false');
                }
            }

            body.addEventListener('click', activateFav);
            body.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    activateFav();
                }
            });

            var rmBtn = document.createElement('button');
            rmBtn.className = 'fav-remove';
            rmBtn.setAttribute('aria-label', fav.author + ' aus Favoriten entfernen');
            rmBtn.textContent = '✕';
            rmBtn.addEventListener('click', function () {
                favorites.splice(index, 1);
                saveFavs();
                updateFavBtn();
                updateFavCount();
                renderFavList();
            });

            item.appendChild(body);
            item.appendChild(rmBtn);
            favListEl.appendChild(item);
        });
    }

    /* ============================================================
       FAVORITEN – Panel umschalten
    ============================================================ */
    favToggle.addEventListener('click', function () {
        var open = favPanel.hidden;
        favPanel.hidden = !open;
        favToggle.setAttribute('aria-expanded', String(open));
        if (open) renderFavList();
    });

    /* ============================================================
       KOPIEREN
    ============================================================ */
    function copyToClipboard(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            return navigator.clipboard.writeText(text);
        }
        return new Promise(function (resolve, reject) {
            var ta = document.createElement('textarea');
            ta.value = text;
            ta.style.cssText = 'position:fixed;left:-9999px;opacity:0;pointer-events:none';
            document.body.appendChild(ta);
            ta.focus();
            ta.select();
            try {
                document.execCommand('copy');
                document.body.removeChild(ta);
                resolve();
            } catch (err) {
                document.body.removeChild(ta);
                reject(err);
            }
        });
    }

    function copyQuote() {
        if (!currentQuote) return;
        var text = '„' + currentQuote.text + '" – ' + currentQuote.author;
        copyToClipboard(text)
            .then(function () { showToast('Zitat kopiert ⎘'); })
            .catch(function () { showToast('Kopieren nicht möglich'); });
    }

    /* ============================================================
       TEILEN
    ============================================================ */
    function shareQuote() {
        if (!currentQuote) return;
        var text = '„' + currentQuote.text + '" – ' + currentQuote.author;

        if (navigator.share) {
            navigator.share({ title: 'Inspira', text: text })
                .catch(function (e) {
                    if (e.name !== 'AbortError') showToast('Teilen fehlgeschlagen');
                });
        } else {
            copyToClipboard(text)
                .then(function () { showToast('In Zwischenablage kopiert (Teilen nicht verfügbar)'); })
                .catch(function () { showToast('Teilen nicht möglich'); });
        }
    }

    /* ============================================================
       ZITATE LADEN & INITIALISIERUNG
    ============================================================ */
    function init() {
        fetch('quotes.json')
            .then(function (res) {
                if (!res.ok) throw new Error('HTTP ' + res.status);
                return res.json();
            })
            .then(function (data) {
                quotes = data;
                initCategoryFilter();
                renderQuote(quotes[Math.floor(Math.random() * quotes.length)]);
                updateFavCount();
            })
            .catch(function () {
                quoteTextEl.textContent  = 'Zitate konnten nicht geladen werden.';
                authorNameEl.textContent = '';
                authorDescEl.textContent = '';
            });
    }

    /* ============================================================
       EVENT LISTENER
    ============================================================ */
    newQuoteBtn.addEventListener('click', showRandomQuote);
    copyBtn.addEventListener('click', copyQuote);
    shareBtn.addEventListener('click', shareQuote);
    favBtn.addEventListener('click', toggleFav);
    autoplayBtn.addEventListener('click', toggleAutoplay);

    init();
})();
