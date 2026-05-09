'use strict';

(function () {
    var THEME_KEY   = 'quote-generator-theme';
    var themeSelect = document.getElementById('themeSelect');

    function applyTheme(t) {
        document.documentElement.setAttribute('data-theme', t);
        themeSelect.value = t;
    }

    function initTheme() {
        var saved = localStorage.getItem(THEME_KEY) || 'dunkel';
        applyTheme(saved);
    }

    themeSelect.addEventListener('change', function () {
        var t = this.value;
        document.documentElement.setAttribute('data-theme', t);
        try { localStorage.setItem(THEME_KEY, t); } catch (e) { /* silent */ }
    });

    initTheme();
})();
