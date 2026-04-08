// ============================================================
// LADDER TO KITTY — Pythagorean Theorem Game
// ============================================================

(function () {
    'use strict';

    // ─── CONFIG ────────────────────────────────────────────
    const TRIPLETS = [
        [3, 4, 5],
        [5, 12, 13],
        [8, 15, 17],
        [7, 24, 25],
        [6, 8, 10],
        [9, 12, 15],
        [12, 16, 20],
    ];

    const THEMES = {
        light: {
            bgTop: '#e8ecf8',
            bgBottom: '#f5f6fb',
            bg: '#f0f2f8',
            gridLine: 'rgba(45,49,66,0.04)',
            ground: '#b8bdd4',
            cliff: '#c8cbe0',
            cliffShadow: '#a8adc8',
            cliffFace: '#d8dae8',
            baseLine: '#3d4260',
            heightLine: '#3d4260',
            dottedLine: '#8890b5',
            triangle: '#5b6abf',
            triangleGlow: 'rgba(91,106,191,0.15)',
            labelBg: 'rgba(255,255,255,0.92)',
            label: '#3d4260',
            question: '#5b6abf',
            dialogBg: '#ffffff',
            dialogBorder: '#e0e3ef',
            dialogText: '#3d4260'
        },
        dark: {
            bgTop: '#151624',
            bgBottom: '#1a1b2e',
            bg: '#1a1b2e',
            gridLine: 'rgba(255,255,255,0.04)',
            ground: '#34385e',
            cliff: '#3b406a',
            cliffShadow: '#282b4a',
            cliffFace: '#4a5084',
            baseLine: '#a5abc9',
            heightLine: '#a5abc9',
            dottedLine: '#7a81ab',
            triangle: '#7c8cf5',
            triangleGlow: 'rgba(124, 140, 245, 0.15)',
            labelBg: 'rgba(36,37,64,0.92)',
            label: '#e4e6f0',
            question: '#7c8cf5',
            dialogBg: '#242540',
            dialogBorder: 'rgba(255,255,255,0.1)',
            dialogText: '#e4e6f0'
        }
    };

    const COMMON_COLORS = {
        ladderWood: '#c5903a',
        ladderRung: '#daa852',
        ladderShadow: 'rgba(150, 100, 40, 0.3)',
        success: '#34c759',
        danger: '#ff3b5c',
        boyShirt: '#4a8af5',
        boyPants: '#2d3a6e',
        boySkin: '#f5d0a9',
        boyHair: '#2c2c3a',
        boyShoe: '#f5f5f5',
        kittenBody: '#f5e6d3',
        kittenEar: '#f0b8a8',
        kittenNose: '#f0958a',
        bush: '#5cb85c',
        bushDark: '#408040',
        rock: '#8a90aa',
        plant: '#4caf50',
        plantDark: '#357a38'
    };

    let COLORS = { ...THEMES.light, ...COMMON_COLORS };

    // ─── STATE ─────────────────────────────────────────────
    let state = {
        triplet: null,
        base: 0,
        height: 0,
        hypotenuse: 0,
        options: [],
        selectedAnswer: null,
        gameState: 'idle',
        lives: 1,
        level: 1,
        ladderProgress: 0,
        climbProgress: 0,
        fallProgress: 0,
        showFormula: false,
        lastUsedTripletIdx: -1,
    };

    // ─── DOM ───────────────────────────────────────────────
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const optionsRow = document.getElementById('options-row');
    const livesCount = document.getElementById('lives-count');
    const feedbackOverlay = document.getElementById('feedback-overlay');
    const feedbackCard = document.getElementById('feedback-card');
    const gameoverOverlay = document.getElementById('gameover-overlay');
    const successOverlay = document.getElementById('success-overlay');
    const successCard = document.getElementById('success-card');
    const tryAgainBtn = document.getElementById('try-again-btn');
    const restartBtn = document.getElementById('restart-btn');
    const confettiCanvas = document.getElementById('confetti-canvas');
    const confettiCtx = confettiCanvas.getContext('2d');
    const infoBtn = document.getElementById('info-btn');
    const infoTooltip = document.getElementById('info-tooltip');
    const darkModeBtn = document.getElementById('dark-mode-btn');

    // Info tooltip toggle
    infoBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        infoTooltip.classList.toggle('visible');
    });
    document.addEventListener('click', () => {
        infoTooltip.classList.remove('visible');
    });

    // Dark Mode toggle
    let isDarkMode = false;
    darkModeBtn.addEventListener('click', () => {
        isDarkMode = !isDarkMode;
        if (isDarkMode) {
            document.documentElement.setAttribute('data-theme', 'dark');
            COLORS = { ...THEMES.dark, ...COMMON_COLORS };
            darkModeBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
        } else {
            document.documentElement.removeAttribute('data-theme');
            COLORS = { ...THEMES.light, ...COMMON_COLORS };
            darkModeBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
        }
        render(); // redraw the canvas with new colors
    });

    // ─── AUDIO ─────────────────────────────────────────────
    let soundEnabled = true;

    function playTone(freq, duration, type = 'sine', vol = 0.12) {
        if (!soundEnabled) return;
        try {
            const actx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = actx.createOscillator();
            const gain = actx.createGain();
            osc.type = type;
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(vol, actx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + duration);
            osc.connect(gain).connect(actx.destination);
            osc.start();
            osc.stop(actx.currentTime + duration);
        } catch (e) { }
    }

    function playSuccess() {
        playTone(523, 0.15, 'sine', 0.1);
        setTimeout(() => playTone(659, 0.15, 'sine', 0.1), 100);
        setTimeout(() => playTone(784, 0.3, 'sine', 0.12), 200);
    }

    function playError() {
        playTone(280, 0.3, 'sawtooth', 0.06);
        setTimeout(() => playTone(220, 0.4, 'sawtooth', 0.06), 150);
    }

    function playClick() {
        playTone(660, 0.08, 'sine', 0.06);
    }

    document.getElementById('sound-btn').addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        const btn = document.getElementById('sound-btn');
        btn.style.opacity = soundEnabled ? '1' : '0.4';
    });

    // ─── CANVAS SIZING ─────────────────────────────────────
    let W, H, dpr;

    function resizeCanvas() {
        const container = document.getElementById('canvas-container');
        dpr = window.devicePixelRatio || 1;
        W = container.clientWidth;
        H = container.clientHeight;
        canvas.width = W * dpr;
        canvas.height = H * dpr;
        canvas.style.width = W + 'px';
        canvas.style.height = H + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        confettiCanvas.width = window.innerWidth * dpr;
        confettiCanvas.height = window.innerHeight * dpr;
        confettiCanvas.style.width = window.innerWidth + 'px';
        confettiCanvas.style.height = window.innerHeight + 'px';
        confettiCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    window.addEventListener('resize', () => {
        resizeCanvas();
        draw();
    });

    // ─── GEOMETRY HELPERS ──────────────────────────────────
    function getLayout() {
        let topMargin = 100;   // space for kitten + speech bubble
        let bottomPad = 50;   // space below ground for base label
        let leftPad = 80;
        // Cliff visual width
        const cliffWidth = Math.max(40, Math.min(60, W * 0.05));
        let rightPad = cliffWidth + 80;   // cliff + arrow + height label

        if (W < 500) {
            topMargin = 80;
            bottomPad = 40;
            leftPad = 40;
            rightPad = cliffWidth + 50;
        }

        const groundY = H - bottomPad;

        // Available horizontal and vertical space for the triangle
        const maxTriWidth = W - leftPad - rightPad;
        const maxTriHeight = groundY - topMargin;

        // Scale so the triangle fits both horizontally and vertically
        const scaleByWidth = maxTriWidth / state.base;
        const scaleByHeight = maxTriHeight / state.height;
        const scaleFactor = Math.min(scaleByWidth, scaleByHeight);

        const triBasePixels = state.base * scaleFactor;
        const triHeightPixels = state.height * scaleFactor;

        // Center the triangle horizontally in the available space
        const triStartX = leftPad + (maxTriWidth - triBasePixels) / 2;
        const boyX = triStartX;
        const cliffX = triStartX + triBasePixels;
        const cliffTopY = groundY - triHeightPixels;

        return {
            groundY,
            cliffX,
            cliffTopY,
            cliffWidth,
            boyX,
            boyY: groundY,
            kittenX: cliffX + cliffWidth * 0.3,
            kittenY: cliffTopY - 20,
            triBasePixels,
            triHeightPixels,
            scaleFactor,
        };
    }

    // ─── DRAWING ───────────────────────────────────────────

    function drawBackground() {
        if (COLORS.bgTop && COLORS.bgBottom) {
            const grd = ctx.createLinearGradient(0, 0, 0, H);
            grd.addColorStop(0, COLORS.bgTop);
            grd.addColorStop(1, COLORS.bgBottom);
            ctx.fillStyle = grd;
        } else {
            ctx.fillStyle = COLORS.bg;
        }
        ctx.fillRect(0, 0, W, H);

        ctx.strokeStyle = COLORS.gridLine;
        ctx.lineWidth = 1;
        const gridSize = 40;
        for (let x = 0; x < W; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, H);
            ctx.stroke();
        }
        for (let y = 0; y < H; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(W, y);
            ctx.stroke();
        }
    }

    function drawGround(layout) {
        const { groundY } = layout;
        ctx.fillStyle = '#e2e5f0';
        ctx.fillRect(0, groundY, W, H - groundY);

        ctx.strokeStyle = COLORS.ground;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, groundY);
        ctx.lineTo(W, groundY);
        ctx.stroke();
    }

    function drawCliff(layout) {
        const { cliffX, cliffTopY, cliffWidth, groundY } = layout;
        const cliffHeight = groundY - cliffTopY;

        // Main cliff body
        ctx.fillStyle = COLORS.cliffFace;
        ctx.beginPath();
        ctx.roundRect(cliffX, cliffTopY, cliffWidth, cliffHeight, [4, 4, 0, 0]);
        ctx.fill();

        // Cliff shadow edge
        ctx.fillStyle = COLORS.cliffShadow;
        ctx.fillRect(cliffX, cliffTopY, 4, cliffHeight);

        // Cliff top cap
        ctx.fillStyle = '#aab0d0';
        ctx.fillRect(cliffX - 2, cliffTopY, cliffWidth + 4, 5);

        // Window details
        const winW = 12, winH = 14, winGapY = 20;
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        for (let wy = cliffTopY + 25; wy < groundY - winH - 10; wy += winGapY + winH) {
            ctx.fillRect(cliffX + cliffWidth / 2 - winW / 2, wy, winW, winH);
        }

        // Bush at base
        drawBush(cliffX + cliffWidth - 2, groundY, 18, 13);
        drawBush(cliffX + cliffWidth + 10, groundY, 14, 10);

        // Small rock
        ctx.fillStyle = COLORS.rock;
        ctx.beginPath();
        ctx.ellipse(cliffX + cliffWidth + 4, groundY - 3, 6, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Plant on cliff top
        drawSmallPlant(cliffX + cliffWidth - 4, cliffTopY);
    }

    function drawBush(x, groundY, w, h) {
        ctx.fillStyle = COLORS.bush;
        ctx.beginPath();
        ctx.ellipse(x, groundY - h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = COLORS.bushDark;
        ctx.beginPath();
        ctx.ellipse(x - w * 0.2, groundY - h / 2 - 2, w * 0.25, h * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    function drawSmallPlant(x, y) {
        ctx.strokeStyle = COLORS.plant;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        for (let i = -1; i <= 1; i++) {
            ctx.beginPath();
            ctx.moveTo(x + i * 3, y);
            ctx.quadraticCurveTo(x + i * 5, y - 10, x + i * 7, y - 15);
            ctx.stroke();
        }
        ctx.fillStyle = COLORS.plant;
        for (let i = -1; i <= 1; i++) {
            ctx.beginPath();
            ctx.ellipse(x + i * 7, y - 15, 3, 2.5, i * 0.3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function drawTriangle(layout) {
        const { boyX, groundY, cliffX, cliffTopY, cliffWidth } = layout;

        // Triangle glow fill on success
        if (state.gameState === 'success') {
            ctx.fillStyle = COLORS.triangleGlow;
            ctx.beginPath();
            ctx.moveTo(boyX, groundY);
            ctx.lineTo(cliffX, groundY);
            ctx.lineTo(cliffX, cliffTopY);
            ctx.closePath();
            ctx.fill();
        }

        // Base line (solid)
        ctx.strokeStyle = COLORS.baseLine;
        ctx.lineWidth = 2.5;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(boyX, groundY);
        ctx.lineTo(cliffX, groundY);
        ctx.stroke();

        // Height line (solid)
        ctx.beginPath();
        ctx.moveTo(cliffX, groundY);
        ctx.lineTo(cliffX, cliffTopY);
        ctx.stroke();

        // Height arrow + dimension line (to the right of the cliff building)
        const arrowX = cliffX + cliffWidth + 16;
        drawArrowHead(arrowX, cliffTopY + 5, 'up');
        drawArrowHead(arrowX, groundY - 5, 'down');
        ctx.strokeStyle = COLORS.baseLine;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(arrowX, cliffTopY + 8);
        ctx.lineTo(arrowX, groundY - 8);
        ctx.stroke();

        // Hypotenuse (dotted) — only in idle
        if (state.gameState === 'idle') {
            ctx.strokeStyle = COLORS.dottedLine;
            ctx.lineWidth = 2;
            ctx.setLineDash([8, 6]);
            ctx.beginPath();
            ctx.moveTo(boyX, groundY);
            ctx.lineTo(cliffX, cliffTopY);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // Right angle marker
        const sq = 12;
        ctx.strokeStyle = COLORS.baseLine;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(cliffX - sq, groundY);
        ctx.lineTo(cliffX - sq, groundY - sq);
        ctx.lineTo(cliffX, groundY - sq);
        ctx.stroke();

        // Vertex dots
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = COLORS.baseLine;
        ctx.lineWidth = 2;
        for (const [px, py] of [[boyX, groundY], [cliffX, groundY], [cliffX, cliffTopY]]) {
            ctx.beginPath();
            ctx.arc(px, py, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }

        // Base label
        const baseMid = (boyX + cliffX) / 2;
        const fontSize = W < 500 ? 13 : 16;
        drawLabel(`${state.base} m`, baseMid, groundY + (W < 500 ? 18 : 24), fontSize, COLORS.label);

        // Height label (to the right of the cliff building)
        const heightMid = (groundY + cliffTopY) / 2;
        drawLabel(`${state.height} m`, cliffX + cliffWidth + (W < 500 ? 25 : 40), heightMid, fontSize, COLORS.label);

        // Question mark on hypotenuse
        if (state.gameState === 'idle') {
            const qx = (boyX + cliffX) / 2 - (W < 500 ? 15 : 30);
            const qy = (groundY + cliffTopY) / 2 - 10;
            ctx.font = `700 ${W < 500 ? 20 : 28}px Nunito`;
            ctx.fillStyle = COLORS.question;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('?', qx, qy);
        }
    }

    function drawArrowHead(x, y, dir) {
        const s = 5;
        ctx.fillStyle = COLORS.baseLine;
        ctx.beginPath();
        if (dir === 'up') {
            ctx.moveTo(x, y);
            ctx.lineTo(x - s, y + s * 1.5);
            ctx.lineTo(x + s, y + s * 1.5);
        } else {
            ctx.moveTo(x, y);
            ctx.lineTo(x - s, y - s * 1.5);
            ctx.lineTo(x + s, y - s * 1.5);
        }
        ctx.closePath();
        ctx.fill();
    }

    function drawLabel(text, x, y, size, color) {
        ctx.font = `700 ${size}px Nunito`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const metrics = ctx.measureText(text);
        const pad = 7;
        const lw = metrics.width + pad * 2;
        const lh = size + pad * 1.4;

        ctx.fillStyle = COLORS.labelBg;
        ctx.beginPath();
        ctx.roundRect(x - lw / 2, y - lh / 2, lw, lh, 5);
        ctx.fill();

        ctx.fillStyle = color;
        ctx.fillText(text, x, y);
    }

    // ─── BOY CHARACTER ─────────────────────────────────────
    function drawBoy(layout) {
        const { boyX, boyY, cliffX, cliffTopY } = layout;
        let x = boyX;
        let y = boyY;
        let expression = 'idle';

        if (state.gameState === 'success' && state.climbProgress > 0) {
            expression = 'climbing';
            const t = state.climbProgress;
            x = boyX + (cliffX - boyX) * t;
            y = boyY + (cliffTopY - boyY) * t;
        } else if (state.gameState === 'success') {
            expression = 'happy';
        } else if (state.gameState === 'fail' || state.gameState === 'gameover') {
            expression = 'sad';
        }

        const scale = 1.0;
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);

        if (expression === 'climbing') {
            const angle = Math.atan2(cliffTopY - boyY, cliffX - boyX);
            ctx.rotate(angle);
            ctx.translate(0, -12);
        }

        // Shadow
        if (expression !== 'climbing') {
            ctx.fillStyle = 'rgba(0,0,0,0.07)';
            ctx.beginPath();
            ctx.ellipse(0, -2, 22, 6, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        // Legs
        ctx.fillStyle = COLORS.boyPants;
        ctx.beginPath();
        ctx.roundRect(-11, -40, 9, 22, 2);
        ctx.fill();
        ctx.beginPath();
        ctx.roundRect(2, -40, 9, 22, 2);
        ctx.fill();

        // Shoes
        ctx.fillStyle = COLORS.boyShoe;
        ctx.beginPath();
        ctx.roundRect(-13, -20, 13, 7, [0, 0, 3, 3]);
        ctx.fill();
        ctx.beginPath();
        ctx.roundRect(0, -20, 13, 7, [0, 0, 3, 3]);
        ctx.fill();
        // Shoe detail line
        ctx.fillStyle = '#ccc';
        ctx.fillRect(-13, -16, 13, 1.5);
        ctx.fillRect(0, -16, 13, 1.5);

        // Body / Shirt
        ctx.fillStyle = COLORS.boyShirt;
        ctx.beginPath();
        ctx.roundRect(-16, -72, 32, 34, 5);
        ctx.fill();

        // Collar V
        ctx.fillStyle = '#3a72d8';
        ctx.beginPath();
        ctx.moveTo(-7, -72);
        ctx.lineTo(0, -63);
        ctx.lineTo(7, -72);
        ctx.closePath();
        ctx.fill();

        // Arms
        ctx.strokeStyle = COLORS.boyShirt;
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';

        if (expression === 'climbing') {
            ctx.beginPath(); ctx.moveTo(-16, -60); ctx.lineTo(-24, -76); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(16, -60); ctx.lineTo(24, -76); ctx.stroke();
            ctx.fillStyle = COLORS.boySkin;
            ctx.beginPath(); ctx.arc(-24, -76, 5, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(24, -76, 5, 0, Math.PI * 2); ctx.fill();
        } else if (expression === 'idle' || expression === 'sad') {
            // Praying/folded hands
            ctx.beginPath(); ctx.moveTo(-16, -60); ctx.lineTo(-8, -48); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(16, -60); ctx.lineTo(8, -48); ctx.stroke();
            ctx.fillStyle = COLORS.boySkin;
            ctx.beginPath(); ctx.arc(0, -45, 6, 0, Math.PI * 2); ctx.fill();
        } else {
            // Happy — arms raised
            ctx.beginPath(); ctx.moveTo(-16, -60); ctx.lineTo(-28, -78); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(16, -60); ctx.lineTo(28, -78); ctx.stroke();
            ctx.fillStyle = COLORS.boySkin;
            ctx.beginPath(); ctx.arc(-28, -78, 5, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(28, -78, 5, 0, Math.PI * 2); ctx.fill();
        }

        // Head
        ctx.fillStyle = COLORS.boySkin;
        ctx.beginPath();
        ctx.arc(0, -86, 18, 0, Math.PI * 2);
        ctx.fill();

        // Hair
        ctx.fillStyle = COLORS.boyHair;
        ctx.beginPath();
        ctx.arc(0, -90, 18, Math.PI, 0);
        ctx.fill();
        // Hair fringe
        ctx.beginPath();
        ctx.ellipse(-6, -100, 12, 6, -0.2, 0, Math.PI * 2);
        ctx.fill();

        // Face expressions
        if (expression === 'sad') {
            // Sad eyes
            ctx.fillStyle = '#2c2c3a';
            ctx.beginPath(); ctx.arc(-6, -86, 2.5, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(6, -86, 2.5, 0, Math.PI * 2); ctx.fill();
            // Sad mouth (frown)
            ctx.strokeStyle = '#c5605a';
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.arc(0, -74, 5, Math.PI * 1.2, Math.PI * 1.8);
            ctx.stroke();
            // Tear
            ctx.fillStyle = '#8ac4f8';
            ctx.beginPath();
            ctx.moveTo(9, -84);
            ctx.quadraticCurveTo(11, -79, 9, -77);
            ctx.quadraticCurveTo(7, -79, 9, -84);
            ctx.fill();
        } else if (expression === 'happy' || expression === 'climbing') {
            // Happy closed eyes
            ctx.strokeStyle = '#2c2c3a';
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(-6, -86, 3, Math.PI, 0); ctx.stroke();
            ctx.beginPath(); ctx.arc(6, -86, 3, Math.PI, 0); ctx.stroke();
            // Big smile
            ctx.strokeStyle = '#c5605a';
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.arc(0, -80, 6, 0.15, Math.PI - 0.15);
            ctx.stroke();
            // Blush
            ctx.fillStyle = 'rgba(255,150,150,0.3)';
            ctx.beginPath(); ctx.ellipse(-12, -82, 4, 2.5, 0, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.ellipse(12, -82, 4, 2.5, 0, 0, Math.PI * 2); ctx.fill();
        } else {
            // Worried / idle
            ctx.fillStyle = '#2c2c3a';
            ctx.beginPath(); ctx.arc(-6, -86, 3, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(6, -86, 3, 0, Math.PI * 2); ctx.fill();
            // Eye whites
            ctx.fillStyle = '#fff';
            ctx.beginPath(); ctx.arc(-5, -87, 1, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(7, -87, 1, 0, Math.PI * 2); ctx.fill();
            // Worried brows
            ctx.strokeStyle = '#2c2c3a';
            ctx.lineWidth = 1.8;
            ctx.beginPath(); ctx.moveTo(-10, -93); ctx.lineTo(-3, -92); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(10, -93); ctx.lineTo(3, -92); ctx.stroke();
            // Small 'o' mouth
            ctx.strokeStyle = '#c5605a';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(0, -78, 3.5, 0.2, Math.PI - 0.2);
            ctx.stroke();
        }

        ctx.restore();

        // Speech bubble (only in idle)
        if (state.gameState === 'idle' && expression !== 'climbing') {
            drawSpeechBubble(boyX - 5, boyY - 115, "Oh! Please help\nme save the kitty!");
        }
    }

    function drawSpeechBubble(x, y, text) {
        const padding = 14;
        const lineHeight = 20;
        const lines = text.split('\n');

        ctx.font = '700 14px Nunito';
        let maxW = 0;
        for (const l of lines) maxW = Math.max(maxW, ctx.measureText(l).width);

        const bw = maxW + padding * 2;
        const bh = lines.length * lineHeight + padding * 1.5;
        let bx = x - bw / 2;
        if (bx < 10) bx = 10;
        if (bx + bw > W - 10) bx = W - 10 - bw;
        const by = y - bh;

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.05)';
        ctx.beginPath();
        ctx.roundRect(bx + 2, by + 3, bw, bh, 12);
        ctx.fill();

        // Bubble
        ctx.fillStyle = COLORS.dialogBg;
        ctx.strokeStyle = COLORS.dialogBorder;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(bx, by, bw, bh, 12);
        ctx.fill();
        ctx.stroke();

        // Tail
        ctx.fillStyle = COLORS.dialogBg;
        ctx.beginPath();
        ctx.moveTo(x - 8, by + bh - 1);
        ctx.lineTo(x - 2, by + bh + 12);
        ctx.lineTo(x + 6, by + bh - 1);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = COLORS.dialogBorder;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x - 8, by + bh);
        ctx.lineTo(x - 2, by + bh + 12);
        ctx.lineTo(x + 6, by + bh);
        ctx.stroke();
        // Cover tail join
        ctx.fillStyle = COLORS.dialogBg;
        ctx.fillRect(x - 9, by + bh - 3, 16, 4);

        // Text
        ctx.fillStyle = COLORS.dialogText;
        ctx.font = '700 14px Nunito';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        for (let i = 0; i < lines.length; i++) {
            ctx.fillText(lines[i], bx + bw / 2, by + padding + i * lineHeight);
        }
    }

    // ─── KITTEN ────────────────────────────────────────────
    function drawKitten(layout) {
        const { cliffX, cliffTopY, cliffWidth } = layout;
        const kx = cliffX + cliffWidth / 2;
        const ky = cliffTopY - 4;
        const isHappy = state.gameState === 'success' && state.climbProgress >= 0.95;

        ctx.save();
        ctx.translate(kx, ky);

        // Body
        ctx.fillStyle = COLORS.kittenBody;
        ctx.beginPath();
        ctx.ellipse(0, -14, 14, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.beginPath();
        ctx.arc(0, -30, 13, 0, Math.PI * 2);
        ctx.fill();

        // Ears
        ctx.fillStyle = COLORS.kittenBody;
        ctx.beginPath();
        ctx.moveTo(-10, -40); ctx.lineTo(-6, -50); ctx.lineTo(-2, -40); ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(2, -40); ctx.lineTo(6, -50); ctx.lineTo(10, -40); ctx.closePath();
        ctx.fill();

        // Inner ears
        ctx.fillStyle = COLORS.kittenEar;
        ctx.beginPath();
        ctx.moveTo(-8, -40); ctx.lineTo(-6, -46); ctx.lineTo(-3, -40); ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(3, -40); ctx.lineTo(6, -46); ctx.lineTo(8, -40); ctx.closePath();
        ctx.fill();

        // Eyes
        if (isHappy) {
            ctx.strokeStyle = '#2c2c3a';
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(-5, -31, 3, Math.PI, 0); ctx.stroke();
            ctx.beginPath(); ctx.arc(5, -31, 3, Math.PI, 0); ctx.stroke();
        } else {
            ctx.fillStyle = '#2c2c3a';
            ctx.beginPath(); ctx.arc(-5, -31, 3, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(5, -31, 3, 0, Math.PI * 2); ctx.fill();
            // Sparkle
            ctx.fillStyle = 'rgba(255,255,255,0.85)';
            ctx.beginPath(); ctx.arc(-4, -32, 1.2, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(6, -32, 1.2, 0, Math.PI * 2); ctx.fill();
        }

        // Nose
        ctx.fillStyle = COLORS.kittenNose;
        ctx.beginPath();
        ctx.moveTo(0, -28); ctx.lineTo(-2.5, -25.5); ctx.lineTo(2.5, -25.5); ctx.closePath();
        ctx.fill();

        // Mouth
        ctx.strokeStyle = '#c0968a';
        ctx.lineWidth = 1.2;
        if (isHappy) {
            ctx.beginPath(); ctx.arc(0, -24, 3.5, 0.1, Math.PI - 0.1); ctx.stroke();
        } else {
            ctx.beginPath();
            ctx.moveTo(-3, -24); ctx.lineTo(0, -25.5); ctx.lineTo(3, -24);
            ctx.stroke();
        }

        // Whiskers
        ctx.strokeStyle = '#c0b0a0';
        ctx.lineWidth = 0.8;
        for (const side of [-1, 1]) {
            for (const ang of [-0.15, 0, 0.15]) {
                ctx.beginPath();
                ctx.moveTo(side * 7, -26 + ang * 10);
                ctx.lineTo(side * 20, -27 + ang * 18);
                ctx.stroke();
            }
        }

        // Tail (animated wave)
        ctx.strokeStyle = COLORS.kittenBody;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(13, -8);
        const tailWave = Math.sin(Date.now() / 400) * 5;
        ctx.quadraticCurveTo(24, -20 + tailWave, 20, -32 + tailWave);
        ctx.stroke();

        // Collar
        ctx.strokeStyle = '#f0a030';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, -20, 9, 0.3, Math.PI - 0.3);
        ctx.stroke();
        // Bell
        ctx.fillStyle = '#f0c030';
        ctx.beginPath();
        ctx.arc(0, -13, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#d4a020';
        ctx.beginPath();
        ctx.arc(0, -12.5, 1, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    // ─── LADDER ────────────────────────────────────────────
    function drawLadder(layout) {
        if (state.gameState === 'idle') return;

        const { boyX, boyY, cliffX, cliffTopY, triHeightPixels, triBasePixels, scaleFactor } = layout;
        const answer = state.selectedAnswer;
        const correct = state.hypotenuse;

        const ladderPixelLen = answer * scaleFactor;
        const angle = Math.atan2(triHeightPixels, triBasePixels);

        // Fall animation for wrong answers
        let fallAngle = 0;
        if (state.gameState === 'fail' && state.fallProgress > 0) {
            if (answer < correct) {
                fallAngle = state.fallProgress * 0.6;
            } else {
                fallAngle = -state.fallProgress * 0.35;
            }
        }

        ctx.save();
        ctx.translate(boyX, boyY);
        const ladderAngle = -angle + fallAngle;
        ctx.rotate(ladderAngle);

        const len = ladderPixelLen * state.ladderProgress;
        const ladderW = 16;

        // Shadow behind ladder
        ctx.strokeStyle = COLORS.ladderShadow;
        ctx.lineWidth = ladderW + 6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(2, 3);
        ctx.lineTo(len + 2, 3);
        ctx.stroke();

        // Draw ladder rails
        ctx.strokeStyle = COLORS.ladderWood;
        ctx.lineWidth = 3.5;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(0, -ladderW / 2);
        ctx.lineTo(len, -ladderW / 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, ladderW / 2);
        ctx.lineTo(len, ladderW / 2);
        ctx.stroke();

        // Draw rungs
        ctx.strokeStyle = COLORS.ladderRung;
        ctx.lineWidth = 2.5;
        const rungSpacing = 20;
        for (let d = rungSpacing; d < len; d += rungSpacing) {
            ctx.beginPath();
            ctx.moveTo(d, -ladderW / 2 + 1);
            ctx.lineTo(d, ladderW / 2 - 1);
            ctx.stroke();
        }

        ctx.restore();
    }

    // ─── Canvas Feedback Text ──────────────────────────────
    function drawCanvasFeedback(layout) {
        if (state.gameState !== 'fail') return;

        const { cliffX, cliffTopY, cliffWidth } = layout;
        const answer = state.selectedAnswer;
        const correct = state.hypotenuse;

        const text = answer < correct ? 'Too short!' : 'Too long!';
        const alpha = Math.min(1, state.fallProgress * 2.5);

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.font = '800 22px Nunito';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const tx = cliffX + cliffWidth + 50;
        const ty = cliffTopY + 30;
        const tw = ctx.measureText(text).width + 28;
        const th = 36;

        // Pill bg
        ctx.fillStyle = 'rgba(255,59,92,0.12)';
        ctx.beginPath();
        ctx.roundRect(tx - tw / 2, ty - th / 2, tw, th, 18);
        ctx.fill();

        ctx.fillStyle = COLORS.danger;
        ctx.fillText(text, tx, ty);
        ctx.restore();
    }

    // ─── Small decoration plants near boy ──────────────────
    function drawGroundPlants(layout) {
        const { boyX, boyY } = layout;
        ctx.fillStyle = COLORS.plant;
        ctx.beginPath();
        ctx.ellipse(boyX - 38, boyY - 5, 8, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(boyX - 42, boyY - 9, 5, 4, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = COLORS.plantDark;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(boyX - 38, boyY);
        ctx.lineTo(boyX - 38, boyY - 5);
        ctx.stroke();
    }

    // ─── MAIN DRAW ─────────────────────────────────────────
    function draw() {
        if (!state.triplet) return;
        ctx.clearRect(0, 0, W, H);
        const layout = getLayout();

        drawBackground();
        drawGround(layout);
        drawTriangle(layout);
        drawCliff(layout);
        drawGroundPlants(layout);
        drawLadder(layout);
        drawBoy(layout);
        drawKitten(layout);
        drawCanvasFeedback(layout);
    }

    // ─── OPTIONS UI ────────────────────────────────────────
    const optionColors = ['color-blue', 'color-purple', 'color-amber'];

    function renderOptions() {
        optionsRow.innerHTML = '';
        state.options.forEach((val, i) => {
            const btn = document.createElement('button');
            btn.className = `option-btn ${optionColors[i % 3]}`;
            btn.id = `option-${i}`;
            btn.innerHTML = `${val}<span class="unit-label"> m</span>`;
            btn.addEventListener('click', () => handleAnswer(val, btn));
            optionsRow.appendChild(btn);
        });
    }

    function disableOptions() {
        document.querySelectorAll('.option-btn').forEach(b => b.classList.add('disabled'));
    }

    // ─── GAME LOGIC ────────────────────────────────────────
    function newRound() {
        let idx;
        do {
            idx = Math.floor(Math.random() * TRIPLETS.length);
        } while (idx === state.lastUsedTripletIdx && TRIPLETS.length > 1);
        state.lastUsedTripletIdx = idx;

        const [a, b, c] = TRIPLETS[idx];

        // Randomly swap base and height
        if (Math.random() > 0.5) {
            state.base = a;
            state.height = b;
        } else {
            state.base = b;
            state.height = a;
        }
        state.hypotenuse = c;
        state.triplet = [a, b, c];

        // Generate wrong options
        const wrong1 = c - Math.ceil(Math.random() * 2); // too short
        const wrong2 = c + Math.ceil(Math.random() * 2); // too long

        let opts = [c, wrong1, wrong2];
        const unique = new Set(opts);
        while (unique.size < 3) {
            unique.add(c + unique.size + 1);
        }
        opts = [...unique];

        // Shuffle
        for (let i = opts.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [opts[i], opts[j]] = [opts[j], opts[i]];
        }
        state.options = opts;

        // Reset state
        state.selectedAnswer = null;
        state.gameState = 'idle';
        state.ladderProgress = 0;
        state.climbProgress = 0;
        state.fallProgress = 0;
        state.showFormula = false;

        // Update UI
        livesCount.textContent = state.lives;

        feedbackOverlay.classList.remove('visible');
        gameoverOverlay.classList.remove('visible');
        successOverlay.classList.remove('visible');
        renderOptions();
        resizeCanvas();
        draw();
    }

    function handleAnswer(value, btnEl) {
        if (state.gameState !== 'idle') return;
        playClick();

        state.selectedAnswer = value;
        state.gameState = 'animating';
        disableOptions();

        if (value === state.hypotenuse) {
            btnEl.classList.add('selected-correct');
        } else {
            btnEl.classList.add('selected-wrong');
        }

        // Animate ladder extending
        animateLadder(() => {
            if (value === state.hypotenuse) {
                state.gameState = 'success';
                playSuccess();
                animateClimb(() => {
                    showSuccessOverlay();
                    fireConfetti();
                });
            } else {
                state.gameState = 'fail';
                playError();
                animateFall(() => {
                    if (state.lives > 0) {
                        // First wrong attempt: lose a life, retry same question
                        state.lives--;
                        livesCount.textContent = state.lives;
                        showFeedbackOverlay(value, /* retry */ true);
                    } else {
                        // Second wrong attempt: game over
                        state.gameState = 'gameover';
                        setTimeout(() => {
                            gameoverOverlay.classList.add('visible');
                        }, 600);
                    }
                });
            }
        });
    }

    // Reset the current round for a retry (same triplet, re-enable options)
    function retryRound() {
        state.selectedAnswer = null;
        state.gameState = 'idle';
        state.ladderProgress = 0;
        state.climbProgress = 0;
        state.fallProgress = 0;

        livesCount.textContent = state.lives;
        feedbackOverlay.classList.remove('visible');
        renderOptions();
        draw();
    }

    // ─── ANIMATIONS ────────────────────────────────────────
    function animateLadder(cb) {
        const duration = 450;
        const start = performance.now();
        function step(ts) {
            const elapsed = ts - start;
            let t = Math.min(1, elapsed / duration);
            state.ladderProgress = 1 - Math.pow(1 - t, 3); // ease-out
            draw();
            if (elapsed < duration) {
                requestAnimationFrame(step);
            } else {
                state.ladderProgress = 1;
                draw();
                cb();
            }
        }
        requestAnimationFrame(step);
    }

    function animateClimb(cb) {
        const duration = 900;
        const start = performance.now();
        function step(ts) {
            const elapsed = ts - start;
            let t = Math.min(1, elapsed / duration);
            state.climbProgress = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
            draw();
            if (elapsed < duration) {
                requestAnimationFrame(step);
            } else {
                state.climbProgress = 1;
                draw();
                cb();
            }
        }
        requestAnimationFrame(step);
    }

    function animateFall(cb) {
        const duration = 550;
        const start = performance.now();
        function step(ts) {
            const elapsed = ts - start;
            state.fallProgress = Math.min(1, elapsed / duration);
            draw();
            if (elapsed < duration) {
                requestAnimationFrame(step);
            } else {
                state.fallProgress = 1;
                draw();
                cb();
            }
        }
        requestAnimationFrame(step);
    }

    // ─── OVERLAYS ──────────────────────────────────────────
    function showFeedbackOverlay(value, retry) {
        const isShort = value < state.hypotenuse;
        feedbackCard.innerHTML = `
            <div class="fb-emoji">${isShort ? '📏' : '📐'}</div>
            <div class="fb-title error">${isShort ? 'Too Short!' : 'Too Long!'}</div>
            <div class="fb-subtitle">${isShort
                ? "The ladder isn't long enough to reach the kitty."
                : "The ladder goes past the top of the cliff!"
            }</div>
            ${retry ? '<div class="fb-subtitle" style="margin-top:6px;font-weight:700;">Try again — one more chance!</div>' : ''}
        `;
        setTimeout(() => {
            feedbackOverlay.classList.add('visible');
            setTimeout(() => {
                feedbackOverlay.classList.remove('visible');
                if (retry) {
                    // Same question, let them try again
                    retryRound();
                } else {
                    state.gameState = 'gameover';
                    gameoverOverlay.classList.add('visible');
                }
            }, 1800);
        }, 500);
    }

    function showSuccessOverlay() {
        const [a, b, c] = state.triplet;
        successCard.innerHTML = `
            <div class="sc-emoji">🐱</div>
            <div class="sc-title">Kitty Saved! 🎉</div>
            <div class="sc-subtitle">You found the perfect ladder length!</div>
            <div class="formula-box">
                <div class="formula-line">${a}<sup>2</sup> + ${b}<sup>2</sup> = ${c}<sup>2</sup></div>
                <div class="formula-result">${a * a} + ${b * b} = ${c * c}</div>
            </div>
            <button class="next-btn" id="next-level-btn">Next Level →</button>
        `;
        setTimeout(() => {
            successOverlay.classList.add('visible');
            document.getElementById('next-level-btn').addEventListener('click', () => {
                successOverlay.classList.remove('visible');
                state.level++;
                state.lives = 1;
                newRound();
            });
        }, 400);
    }

    // ─── CONFETTI ──────────────────────────────────────────
    let confettiParticles = [];
    let confettiAnimating = false;

    function fireConfetti() {
        confettiParticles = [];
        const colors = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff', '#5f27cd', '#01a3a4', '#f368e0'];
        for (let i = 0; i < 120; i++) {
            confettiParticles.push({
                x: window.innerWidth / 2 + (Math.random() - 0.5) * 300,
                y: window.innerHeight / 2 - 100,
                vx: (Math.random() - 0.5) * 14,
                vy: -(Math.random() * 10 + 5),
                w: Math.random() * 10 + 4,
                h: Math.random() * 7 + 3,
                color: colors[Math.floor(Math.random() * colors.length)],
                rot: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.25,
                gravity: 0.18 + Math.random() * 0.1,
                alpha: 1,
            });
        }
        if (!confettiAnimating) {
            confettiAnimating = true;
            animateConfetti();
        }
    }

    function animateConfetti() {
        confettiCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        let alive = false;
        for (const p of confettiParticles) {
            if (p.alpha <= 0) continue;
            alive = true;
            p.x += p.vx;
            p.vy += p.gravity;
            p.y += p.vy;
            p.rot += p.rotSpeed;
            p.alpha -= 0.005;
            if (p.alpha < 0) p.alpha = 0;

            confettiCtx.save();
            confettiCtx.translate(p.x, p.y);
            confettiCtx.rotate(p.rot);
            confettiCtx.globalAlpha = p.alpha;
            confettiCtx.fillStyle = p.color;
            confettiCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            confettiCtx.restore();
        }
        if (alive) {
            requestAnimationFrame(animateConfetti);
        } else {
            confettiAnimating = false;
            confettiCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        }
    }

    // ─── EVENT LISTENERS ───────────────────────────────────
    restartBtn.addEventListener('click', () => {
        state.level = 1;
        state.lives = 1;
        newRound();
    });

    tryAgainBtn.addEventListener('click', () => {
        gameoverOverlay.classList.remove('visible');
        state.lives = 1;
        newRound(); // Loads a new question
    });

    // ─── IDLE ANIMATION LOOP (kitten tail wag) ────────────
    function idleLoop() {
        if (state.gameState === 'idle') {
            draw();
        }
        requestAnimationFrame(idleLoop);
    }

    // ─── INIT ──────────────────────────────────────────────
    resizeCanvas();
    newRound();
    idleLoop();

})();
