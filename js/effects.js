'use strict';

(function () {
    /* ── Canvas ── */
    var canvas = document.createElement('canvas');
    canvas.id = 'matrixCanvas';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.insertBefore(canvas, document.body.firstChild);
    var ctx = canvas.getContext('2d');

    var rafId      = null;
    var activeEffect = null;

    function isReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    function resize() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
        if (activeEffect === 'matrix')     initMatrix();
        if (activeEffect === 'underwater') initBubbles();
        if (activeEffect === 'sakura')     initSakura();
        if (activeEffect === 'cosmos')     initCosmos();
        if (activeEffect === 'westeros')   initEmbers();
    }

    /* ════════════════════════════════════════
       MATRIX RAIN
    ════════════════════════════════════════ */
    var matrixCols     = [];
    var matrixLastDraw = 0;
    var MATRIX_INTERVAL = 120;
    var MATRIX_CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var MATRIX_SIZE  = 14;

    function initMatrix() {
        var cols = Math.floor(canvas.width / MATRIX_SIZE);
        matrixCols = [];
        for (var i = 0; i < cols; i++) {
            matrixCols.push(Math.random() * -(canvas.height / MATRIX_SIZE) | 0);
        }
    }

    function startMatrix() {
        initMatrix();
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function drawMatrix(ts) {
        if (ts - matrixLastDraw < MATRIX_INTERVAL) return;
        matrixLastDraw = ts;

        ctx.fillStyle = 'rgba(0,0,0,0.04)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#00ff41';
        ctx.font = MATRIX_SIZE + 'px monospace';

        for (var i = 0; i < matrixCols.length; i++) {
            var ch = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
            ctx.fillText(ch, i * MATRIX_SIZE, matrixCols[i] * MATRIX_SIZE);
            if (matrixCols[i] * MATRIX_SIZE > canvas.height && Math.random() > 0.975) {
                matrixCols[i] = 0;
            } else {
                matrixCols[i]++;
            }
        }
    }

    /* ════════════════════════════════════════
       AURORA (Polarlichter)
    ════════════════════════════════════════ */
    var AURORA_BANDS = [
        { yRatio: 0.30, amplitude: 0.07, freq: 0.0030, speed: 0.00025, phase: 0.0, height: 0.18, color: 'rgba(0,229,160,A)',   maxA: 0.55 },
        { yRatio: 0.46, amplitude: 0.09, freq: 0.0020, speed: 0.00018, phase: 2.1, height: 0.22, color: 'rgba(100,80,255,A)',  maxA: 0.40 },
        { yRatio: 0.22, amplitude: 0.05, freq: 0.0040, speed: 0.00030, phase: 4.2, height: 0.14, color: 'rgba(0,180,255,A)',   maxA: 0.32 },
        { yRatio: 0.38, amplitude: 0.06, freq: 0.0025, speed: 0.00020, phase: 1.1, height: 0.16, color: 'rgba(80,255,200,A)',  maxA: 0.28 },
    ];

    function drawAurora(ts) {
        var t = ts * 0.001;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        AURORA_BANDS.forEach(function (band) {
            var W = canvas.width, H = canvas.height;
            var bH = H * band.height;
            var pts = [];

            for (var x = 0; x <= W; x += 5) {
                var wave = Math.sin(x * band.freq + t * band.speed * 1000) * H * band.amplitude
                         + Math.sin(x * band.freq * 1.6 + t * band.speed * 700 + band.phase) * H * band.amplitude * 0.4;
                pts.push({ x: x, y: H * band.yRatio + wave });
            }

            ctx.beginPath();
            ctx.moveTo(pts[0].x, pts[0].y - bH / 2);
            for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y - bH / 2);
            for (var j = pts.length - 1; j >= 0; j--) ctx.lineTo(pts[j].x, pts[j].y + bH / 2);
            ctx.closePath();

            var midY = H * band.yRatio;
            var grad = ctx.createLinearGradient(0, midY - bH / 2, 0, midY + bH / 2);
            grad.addColorStop(0,   band.color.replace('A', '0'));
            grad.addColorStop(0.3, band.color.replace('A', String(band.maxA)));
            grad.addColorStop(0.7, band.color.replace('A', String(band.maxA)));
            grad.addColorStop(1,   band.color.replace('A', '0'));
            ctx.fillStyle = grad;
            ctx.fill();
        });
    }

    /* ════════════════════════════════════════
       UNDERWATER BUBBLES
    ════════════════════════════════════════ */
    var bubbles = [];
    var BUBBLE_COUNT = 30;

    function makeBubble(randomY) {
        return {
            x:         Math.random() * canvas.width,
            y:         randomY ? Math.random() * canvas.height : canvas.height + 20,
            r:         3 + Math.random() * 18,
            speed:     0.22 + Math.random() * 0.6,
            wobble:    Math.random() * Math.PI * 2,
            wobbleSpd: 0.014 + Math.random() * 0.024,
            alpha:     0.08 + Math.random() * 0.22
        };
    }

    function initBubbles() {
        bubbles = [];
        for (var i = 0; i < BUBBLE_COUNT; i++) bubbles.push(makeBubble(true));
    }

    function startUnderwater() { initBubbles(); }

    function drawUnderwater() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        bubbles.forEach(function (b) {
            b.y      -= b.speed;
            b.wobble += b.wobbleSpd;
            var x = b.x + Math.sin(b.wobble) * 3;

            if (b.y + b.r < 0) {
                var fresh = makeBubble(false);
                b.x = fresh.x; b.y = fresh.y; b.r = fresh.r;
                b.speed = fresh.speed; b.wobble = fresh.wobble;
                b.wobbleSpd = fresh.wobbleSpd; b.alpha = fresh.alpha;
            }

            ctx.beginPath();
            ctx.arc(x, b.y, b.r, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(0,194,212,' + b.alpha + ')';
            ctx.lineWidth = 1.2;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.22, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,255,' + (b.alpha * 0.7) + ')';
            ctx.fill();
        });
    }

    /* ════════════════════════════════════════
       SAKURA — FALLING PETALS
    ════════════════════════════════════════ */
    var petals = [];
    var PETAL_COUNT = 48;

    function makePetal(randomY) {
        return {
            x:        Math.random() * canvas.width,
            y:        randomY ? Math.random() * canvas.height : -16,
            size:     5 + Math.random() * 9,
            speedY:   0.35 + Math.random() * 0.7,
            speedX:   (Math.random() - 0.5) * 0.4,
            rotation: Math.random() * Math.PI * 2,
            rotSpd:   (Math.random() - 0.5) * 0.035,
            wobble:   Math.random() * Math.PI * 2,
            wobbleSpd:0.018 + Math.random() * 0.022,
            alpha:    0.45 + Math.random() * 0.45,
            hue:      338 + Math.random() * 18
        };
    }

    function initSakura() {
        petals = [];
        for (var i = 0; i < PETAL_COUNT; i++) petals.push(makePetal(true));
    }

    function drawSakura() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (var i = 0; i < petals.length; i++) {
            var p = petals[i];
            p.y        += p.speedY;
            p.wobble   += p.wobbleSpd;
            p.rotation += p.rotSpd;
            p.x        += p.speedX + Math.sin(p.wobble) * 0.55;

            if (p.y > canvas.height + 20) {
                var n = makePetal(false);
                p.x = n.x; p.y = n.y; p.size = n.size;
                p.speedY = n.speedY; p.speedX = n.speedX;
                p.rotation = n.rotation; p.rotSpd = n.rotSpd;
                p.wobble = n.wobble; p.wobbleSpd = n.wobbleSpd;
                p.alpha = n.alpha; p.hue = n.hue;
            }

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            ctx.globalAlpha = p.alpha;
            ctx.beginPath();
            ctx.ellipse(0, 0, p.size, p.size * 0.58, 0, 0, Math.PI * 2);
            ctx.fillStyle = 'hsl(' + p.hue + ',75%,86%)';
            ctx.fill();
            ctx.restore();
        }
    }

    /* ════════════════════════════════════════
       COSMOS — TWINKLING STARS + NEBULA
    ════════════════════════════════════════ */
    var stars = [];
    var STAR_COUNT = 220;

    function makeStar() {
        var rnd = Math.random();
        return {
            x:     Math.random() * canvas.width,
            y:     Math.random() * canvas.height,
            r:     0.4 + Math.random() * 1.6,
            base:  0.25 + Math.random() * 0.75,
            phase: Math.random() * Math.PI * 2,
            spd:   0.4 + Math.random() * 1.4,
            warm:  rnd > 0.85 ? 1 : (rnd > 0.65 ? 2 : 0) // 0=white 1=warm 2=cool
        };
    }

    function initCosmos() {
        stars = [];
        for (var i = 0; i < STAR_COUNT; i++) stars.push(makeStar());
    }

    var NEBULAS = [
        { xr: 0.18, yr: 0.28, rr: 0.30, c: [80,  40, 200] },
        { xr: 0.82, yr: 0.62, rr: 0.24, c: [180, 40, 150] },
        { xr: 0.50, yr: 0.85, rr: 0.20, c: [40,  80, 200] },
        { xr: 0.68, yr: 0.18, rr: 0.16, c: [100, 20, 180] }
    ];

    function drawCosmos(ts) {
        var t = ts * 0.001;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (var n = 0; n < NEBULAS.length; n++) {
            var nb = NEBULAS[n];
            var nx = canvas.width  * nb.xr;
            var ny = canvas.height * nb.yr;
            var nr = canvas.width  * nb.rr;
            var grad = ctx.createRadialGradient(nx, ny, 0, nx, ny, nr);
            grad.addColorStop(0,   'rgba(' + nb.c[0] + ',' + nb.c[1] + ',' + nb.c[2] + ',0.07)');
            grad.addColorStop(1,   'rgba(' + nb.c[0] + ',' + nb.c[1] + ',' + nb.c[2] + ',0)');
            ctx.beginPath();
            ctx.arc(nx, ny, nr, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.fill();
        }

        for (var i = 0; i < stars.length; i++) {
            var s = stars[i];
            var a = s.base * (0.5 + 0.5 * Math.sin(t * s.spd + s.phase));
            var color = s.warm === 1 ? '255,230,200' : (s.warm === 2 ? '200,220,255' : '255,255,255');
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(' + color + ',' + a + ')';
            ctx.fill();
        }
    }

    /* ════════════════════════════════════════
       WESTEROS — FLOATING EMBERS
    ════════════════════════════════════════ */
    var embers = [];
    var EMBER_COUNT = 55;

    function makeEmber(randomY) {
        return {
            x:        Math.random() * canvas.width,
            y:        randomY ? Math.random() * canvas.height : canvas.height + 8,
            r:        0.8 + Math.random() * 2.2,
            speedY:   0.3 + Math.random() * 0.75,
            speedX:   (Math.random() - 0.5) * 0.38,
            wobble:   Math.random() * Math.PI * 2,
            wobbleSpd:0.022 + Math.random() * 0.038,
            alpha:    0.35 + Math.random() * 0.55,
            hue:      14 + Math.random() * 24
        };
    }

    function initEmbers() {
        embers = [];
        for (var i = 0; i < EMBER_COUNT; i++) embers.push(makeEmber(true));
    }

    function drawWesteros() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (var i = 0; i < embers.length; i++) {
            var e = embers[i];
            e.y       -= e.speedY;
            e.wobble  += e.wobbleSpd;
            e.x       += e.speedX + Math.sin(e.wobble) * 0.55;
            e.alpha   -= 0.0008;

            if (e.y < -10 || e.alpha <= 0.02) {
                var n = makeEmber(false);
                e.x = n.x; e.y = n.y; e.r = n.r;
                e.speedY = n.speedY; e.speedX = n.speedX;
                e.wobble = n.wobble; e.wobbleSpd = n.wobbleSpd;
                e.alpha = n.alpha; e.hue = n.hue;
            }

            var grd = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.r * 3.5);
            grd.addColorStop(0, 'hsla(' + e.hue + ',95%,65%,' + e.alpha + ')');
            grd.addColorStop(1, 'hsla(' + e.hue + ',95%,65%,0)');
            ctx.beginPath();
            ctx.arc(e.x, e.y, e.r * 3.5, 0, Math.PI * 2);
            ctx.fillStyle = grd;
            ctx.fill();

            ctx.beginPath();
            ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
            ctx.fillStyle = 'hsla(' + e.hue + ',100%,88%,' + Math.min(e.alpha * 1.4, 1) + ')';
            ctx.fill();
        }
    }

    /* ════════════════════════════════════════
       ENGINE
    ════════════════════════════════════════ */
    var EFFECTS = {
        matrix:      { start: startMatrix,     draw: drawMatrix,    needsTs: true  },
        polarlichter:{ start: function () {},   draw: drawAurora,    needsTs: true  },
        underwater:  { start: startUnderwater,  draw: drawUnderwater,needsTs: false },
        sakura:      { start: initSakura,       draw: drawSakura,    needsTs: false },
        cosmos:      { start: initCosmos,       draw: drawCosmos,    needsTs: true  },
        westeros:    { start: initEmbers,       draw: drawWesteros,  needsTs: false }
    };

    function stopEffect() {
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        activeEffect = null;
    }

    function startEffect(name) {
        stopEffect();
        if (!EFFECTS[name] || isReducedMotion()) return;
        activeEffect = name;
        resize();
        EFFECTS[name].start();
        (function loop(ts) {
            EFFECTS[name].draw(ts || 0);
            rafId = requestAnimationFrame(loop);
        })();
    }

    function syncToTheme(theme) {
        if (EFFECTS[theme]) startEffect(theme);
        else stopEffect();
    }

    new MutationObserver(function (mutations) {
        mutations.forEach(function (m) {
            if (m.attributeName === 'data-theme') {
                syncToTheme(document.documentElement.getAttribute('data-theme'));
            }
        });
    }).observe(document.documentElement, { attributes: true });

    window.addEventListener('resize', function () { if (activeEffect) resize(); });

    syncToTheme(document.documentElement.getAttribute('data-theme'));
})();
