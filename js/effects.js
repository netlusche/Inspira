'use strict';

(function () {
    var canvas = document.createElement('canvas');
    canvas.id = 'matrixCanvas';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.insertBefore(canvas, document.body.firstChild);

    var ctx = canvas.getContext('2d');
    var rafId = null;
    var columns = [];
    var lastDraw = 0;
    var INTERVAL = 120;
    var fontSize = 14;

    var CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    function resize() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
        var cols = Math.floor(canvas.width / fontSize);
        columns = [];
        for (var i = 0; i < cols; i++) {
            columns.push(Math.random() * -canvas.height / fontSize | 0);
        }
    }

    function draw() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#00ff41';
        ctx.font = fontSize + 'px monospace';

        for (var i = 0; i < columns.length; i++) {
            var ch = CHARS[Math.floor(Math.random() * CHARS.length)];
            var x = i * fontSize;
            var y = columns[i] * fontSize;
            ctx.fillText(ch, x, y);

            if (y > canvas.height && Math.random() > 0.975) {
                columns[i] = 0;
            } else {
                columns[i]++;
            }
        }
    }

    function start() {
        if (rafId) return;
        resize();
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        (function loop(ts) {
            if (ts - lastDraw >= INTERVAL) {
                draw();
                lastDraw = ts;
            }
            rafId = requestAnimationFrame(loop);
        })(0);
    }

    function stop() {
        if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function isReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    function syncToTheme(theme) {
        if (theme === 'matrix' && !isReducedMotion()) {
            start();
        } else {
            stop();
        }
    }

    var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (m) {
            if (m.attributeName === 'data-theme') {
                syncToTheme(document.documentElement.getAttribute('data-theme'));
            }
        });
    });
    observer.observe(document.documentElement, { attributes: true });

    window.addEventListener('resize', function () {
        if (rafId) resize();
    });

    syncToTheme(document.documentElement.getAttribute('data-theme'));
})();
