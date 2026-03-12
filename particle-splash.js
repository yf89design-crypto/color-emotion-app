/* ============================================================
   Particle Splash Page — Multi-Mode Playground
   4 interactive visual effects with Playground button to cycle
   ============================================================ */

(function () {
    const splash = document.getElementById('splash-page');
    const canvas = document.getElementById('particle-canvas');
    if (!canvas || !splash) return;
    const ctx = canvas.getContext('2d');

    let W, H, mouse = { x: -9999, y: -9999 }, animId;
    let exploded = false, entering = false;

    const isDark = () => document.documentElement.getAttribute('data-theme') === 'dark';

    const COLORS = [
        '#F47B7B', '#F9A87C', '#F7E06B', '#8DD88C',
        '#7DD8C2', '#7BBDE8', '#B8A0E8', '#F78CA8',
        '#FF6B9D', '#C084FC', '#67E8F9', '#FDE68A'
    ];

    const MODES = [
        { name: 'Particle Text', icon: '✦', build: buildMode1, draw: drawMode1 },
        { name: 'Wave Field', icon: '〰', build: buildMode2, draw: drawMode2 },
        { name: 'Falling Text', icon: '⬇', build: buildMode3, draw: drawMode3 },
        { name: 'Color Tetris', icon: '▦', build: buildMode4, draw: drawMode4 },
        { name: '3D Physics', icon: '⬢', build: buildMode5, draw: drawMode5 },
        { name: 'Matrix Rain', icon: '☂', build: buildMode6, draw: drawMode6 },
    ];
    let currentMode = 0;
    let modeState = {};

    function resize() {
        const rect = canvas.parentElement.getBoundingClientRect();
        W = canvas.width = rect.width;
        H = canvas.height = rect.height;
        clearCanvas();
        MODES[currentMode].build();
    }

    function clearCanvas() {
        ctx.fillStyle = isDark() ? '#0f0f19' : '#0d0d1a';
        ctx.fillRect(0, 0, W, H);
    }

    canvas.addEventListener('mousemove', e => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left; mouse.y = e.clientY - rect.top;
    });
    canvas.addEventListener('touchmove', e => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.touches[0].clientX - rect.left; mouse.y = e.touches[0].clientY - rect.top;
    }, { passive: true });
    canvas.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });

    canvas.addEventListener('click', handleSplashClick);
    canvas.addEventListener('touchend', handleSplashClick);

    function handleSplashClick(e) {
        if (entering) return;
        if (e.target.closest && e.target.closest('.playground-btn')) return;
        if (!exploded) {
            exploded = true; entering = true;
            setTimeout(() => {
                splash.style.transition = 'opacity 0.8s ease';
                splash.style.opacity = '0';
                setTimeout(() => {
                    splash.style.display = 'none';
                    const split = document.getElementById('ipad-split');
                    if (split) { split.style.display = ''; split.style.animation = 'fadeInUp 0.8s ease'; }
                }, 800);
            }, 200);
        }
    }

    const pgBtn = document.getElementById('playground-btn');
    const pgLabel = document.getElementById('playground-label');
    if (pgBtn) {
        pgBtn.addEventListener('click', e => {
            e.stopPropagation(); e.preventDefault();
            currentMode = (currentMode + 1) % MODES.length;
            pgLabel.textContent = MODES[currentMode].name;
            exploded = false; entering = false;
            clearCanvas(); MODES[currentMode].build();
        });
        pgBtn.addEventListener('touchend', e => { e.stopPropagation(); e.preventDefault(); });
    }

    function animate() {
        MODES[currentMode].draw();
        if (!entering || splash.style.display !== 'none') animId = requestAnimationFrame(animate);
    }

    // ==========================================
    //  MODE 1 — Particle Text
    // ==========================================
    function buildMode1() {
        modeState.textParticles = []; modeState.bgParticles = [];
        const off = document.createElement('canvas');
        const octx = off.getContext('2d');
        off.width = W; off.height = H;
        const fontSize = Math.min(W / 8, 120) * 1.6;
        octx.font = `300 ${fontSize}px "Outfit", sans-serif`;
        octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.fillStyle = '#fff';
        const totalH = fontSize + fontSize * 0.85;
        const startY = (H - totalH) / 2 + fontSize / 2;
        octx.fillText('ART &', W / 2, startY);
        octx.font = `300 ${fontSize * 0.85}px "Outfit", sans-serif`;
        octx.fillText('Design', W / 2, startY + fontSize * 0.85);
        const data = octx.getImageData(0, 0, W, H).data;
        for (let y = 0; y < H; y += 4) {
            for (let x = 0; x < W; x += 4) {
                if (data[(y * W + x) * 4 + 3] > 128) {
                    modeState.textParticles.push({
                        originX: x, originY: y,
                        x: W / 2 + (Math.random() - 0.5) * W, y: H / 2 + (Math.random() - 0.5) * H,
                        vx: 0, vy: 0, color: COLORS[Math.floor(Math.random() * COLORS.length)],
                        size: 2 + Math.random() * 2, friction: 0.85 + Math.random() * 0.1,
                        spring: 0.02 + Math.random() * 0.03,
                    });
                }
            }
        }
        const count = Math.floor((W * H) / 6000);
        for (let i = 0; i < count; i++) {
            modeState.bgParticles.push({
                x: Math.random() * W, y: Math.random() * H,
                vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5,
                size: 1 + Math.random() * 3, color: COLORS[Math.floor(Math.random() * COLORS.length)],
                alpha: 0.2 + Math.random() * 0.5,
            });
        }
    }

    function drawMode1() {
        ctx.fillStyle = 'rgba(15, 15, 25, 0.15)'; ctx.fillRect(0, 0, W, H);
        modeState.bgParticles.forEach(p => {
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color; ctx.globalAlpha = p.alpha * 0.4; ctx.fill();
        });
        ctx.globalAlpha = 1;
        modeState.textParticles.forEach(p => {
            const dx = p.originX - p.x, dy = p.originY - p.y;
            p.vx += dx * p.spring; p.vy += dy * p.spring;
            const mx = p.x - mouse.x, my = p.y - mouse.y;
            const md = Math.sqrt(mx * mx + my * my);
            if (md < 160) { const f = (160 - md) / 160 * 12; p.vx += (mx / md) * f; p.vy += (my / md) * f; }
            p.vx *= p.friction; p.vy *= p.friction; p.x += p.vx; p.y += p.vy;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color; ctx.globalAlpha = 0.9; ctx.fill();
        });
        ctx.globalAlpha = 1;
    }

    // ==========================================
    //  MODE 2 — Wave Field (vertical lines, text reveal)
    // ==========================================
    function buildMode2() {
        modeState.waveTime = 0; modeState.waveCols = 120;
        const off = document.createElement('canvas');
        const octx = off.getContext('2d');
        off.width = W; off.height = H;
        const fontSize = Math.min(W / 7, 140) * 1.4;
        octx.font = `900 ${fontSize}px "Outfit", sans-serif`;
        octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.fillStyle = '#fff';
        const tH = fontSize + fontSize * 0.85;
        const sY = (H - tH) / 2 + fontSize / 2;
        octx.fillText('ART &', W / 2, sY);
        octx.font = `900 ${fontSize * 0.85}px "Outfit", sans-serif`;
        octx.fillText('Design', W / 2, sY + fontSize * 0.85);
        modeState.textMask = octx.getImageData(0, 0, W, H).data;
    }

    function drawMode2() {
        ctx.fillStyle = 'rgba(13, 13, 26, 0.12)'; ctx.fillRect(0, 0, W, H);
        modeState.waveTime += 0.012;
        const cols = modeState.waveCols, spacing = W / cols, mask = modeState.textMask;
        for (let i = 0; i <= cols; i++) {
            const baseX = i * spacing;
            const colDx = Math.abs(mouse.x - baseX);
            const mp = Math.max(0, 1 - colDx / 200);
            ctx.beginPath();
            for (let j = 0; j <= 80; j++) {
                const y = (H / 80) * j;
                const mx2 = Math.floor(baseX), my2 = Math.floor(y);
                let inText = false;
                if (mx2 >= 0 && mx2 < W && my2 >= 0 && my2 < H) inText = mask[(my2 * W + mx2) * 4 + 3] > 128;
                const dy = mouse.y - y, dist = Math.sqrt(colDx * colDx + dy * dy) || 1;
                const mw = Math.max(0, 1 - dist / 180) * 35;
                let waveX = Math.sin(y * 0.02 + modeState.waveTime * 2 + i * 0.3) * 6 + Math.sin(y * 0.008 + modeState.waveTime * 0.8) * 4;
                waveX += mw * Math.sin(dist * 0.05 + modeState.waveTime * 3);
                if (inText && mp > 0.05) waveX += (baseX < W / 2 ? -1 : 1) * mp * 18;
                const x = baseX + waveX;
                if (j === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
            const hue = (i * 3 + modeState.waveTime * 40) % 360;
            ctx.strokeStyle = `hsla(${hue}, 70%, 65%, ${0.25 + mp * 0.55})`;
            ctx.lineWidth = 1.2 + mp * 1.5; ctx.stroke();
            if (mp > 0.2) { ctx.strokeStyle = `hsla(${hue}, 80%, 70%, ${mp * 0.12})`; ctx.lineWidth = 6; ctx.stroke(); }
        }
        ctx.save();
        const fontSize = Math.min(W / 7, 140) * 1.4;
        ctx.font = `900 ${fontSize}px "Outfit", sans-serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = 'rgba(255,255,255,0.03)';
        const tH = fontSize + fontSize * 0.85, sY = (H - tH) / 2 + fontSize / 2;
        ctx.fillText('ART &', W / 2, sY);
        ctx.font = `900 ${fontSize * 0.85}px "Outfit", sans-serif`;
        ctx.fillText('Design', W / 2, sY + fontSize * 0.85);
        ctx.restore();
    }

    // ==========================================
    //  MODE 3 — Falling Text (stack up, then fireworks explosion)
    // ==========================================
    const FALLING_TEXTS = [
        { text: '艺术与设计', lang: 'CN' },
        { text: 'ART & Design', lang: 'EN' },
        { text: '아트 & 디자인', lang: 'KR' },
        { text: 'アート＆デザイン', lang: 'JP' },
    ];

    function buildMode3() {
        modeState.fallingChars = [];
        modeState.settledChars = [];   // characters that have landed and stacked
        modeState.fireworks = [];       // explosion particles
        modeState.fallTimer = 0;
        modeState.fallDelay = 10;
        modeState.phase3 = 'falling';   // 'falling' | 'exploding' | 'cooldown'
        modeState.cooldownTimer = 0;
        modeState.charQueue = [];
        for (let t = 0; t < FALLING_TEXTS.length; t++) {
            const entry = FALLING_TEXTS[t];
            const chars = Array.from(entry.text);
            for (let c = 0; c < chars.length; c++) {
                modeState.charQueue.push({ char: chars[c], lang: entry.lang, seqInWord: c, wordLen: chars.length });
            }
        }
        modeState.queueIndex = 0;
        // Build column heights for stacking
        modeState.stackCols = 20;
        modeState.colWidth = W / modeState.stackCols;
        modeState.colHeights = new Array(modeState.stackCols).fill(H); // bottom starts at H
    }

    function spawnFallingChar3() {
        const q = modeState.charQueue[modeState.queueIndex % modeState.charQueue.length];
        const fontSize = 28 + Math.random() * 30;
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        const col = Math.floor(Math.random() * modeState.stackCols);
        const x = col * modeState.colWidth + modeState.colWidth / 2;

        modeState.fallingChars.push({
            char: q.char, lang: q.lang, col,
            x, y: -fontSize - Math.random() * 40,
            vy: 2 + Math.random() * 2, fontSize, color,
            rotation: (Math.random() - 0.5) * 0.3,
            alpha: 1,
        });
        modeState.queueIndex++;
    }

    function triggerFireworks() {
        modeState.phase3 = 'exploding';
        // Turn every settled char into firework particles
        modeState.settledChars.forEach(c => {
            const count = 6 + Math.floor(Math.random() * 6);
            for (let i = 0; i < count; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 3 + Math.random() * 8;
                modeState.fireworks.push({
                    x: c.x, y: c.y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed - Math.random() * 4,
                    color: c.color,
                    size: 2 + Math.random() * 4,
                    life: 1,
                    gravity: 0.05 + Math.random() * 0.05,
                    char: Math.random() < 0.3 ? c.char : null, // some particles keep the char
                    fontSize: c.fontSize * 0.6,
                    rotation: Math.random() * Math.PI * 2,
                    rotSpeed: (Math.random() - 0.5) * 0.1,
                });
            }
        });
        // Also add some big sparkle bursts at random positions
        for (let b = 0; b < 8; b++) {
            const bx = Math.random() * W, by = Math.random() * H;
            const burstColor = COLORS[Math.floor(Math.random() * COLORS.length)];
            for (let i = 0; i < 20; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 4 + Math.random() * 10;
                modeState.fireworks.push({
                    x: bx, y: by,
                    vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
                    color: burstColor, size: 1.5 + Math.random() * 3,
                    life: 1, gravity: 0.03 + Math.random() * 0.04,
                    char: null, fontSize: 0, rotation: 0, rotSpeed: 0,
                });
            }
        }
        modeState.settledChars = [];
        modeState.fallingChars = [];
    }

    function drawMode3() {
        ctx.fillStyle = 'rgba(13, 13, 26, 0.08)';
        ctx.fillRect(0, 0, W, H);

        if (modeState.phase3 === 'falling') {
            // Spawn characters
            modeState.fallTimer++;
            if (modeState.fallTimer >= modeState.fallDelay) {
                modeState.fallTimer = 0;
                spawnFallingChar3();
            }

            // Update falling chars
            modeState.fallingChars.forEach(c => {
                c.y += c.vy;
                const landY = modeState.colHeights[c.col] - c.fontSize;
                if (c.y >= landY) {
                    c.y = landY;
                    modeState.colHeights[c.col] = landY; // raise the stack
                    modeState.settledChars.push(c);
                    c.landed = true;
                }
            });
            modeState.fallingChars = modeState.fallingChars.filter(c => !c.landed);

            // Check if stacked to top → explode
            const minHeight = Math.min(...modeState.colHeights);
            if (minHeight <= 50 || modeState.settledChars.length > 150) {
                triggerFireworks();
            }

            // Draw settled characters
            modeState.settledChars.forEach(c => {
                ctx.save();
                ctx.translate(c.x, c.y + c.fontSize / 2);
                ctx.rotate(c.rotation);
                ctx.globalAlpha = 0.9;
                ctx.shadowColor = c.color; ctx.shadowBlur = 8;
                const ff = c.lang === 'EN' ? '"Outfit", sans-serif' : '"Noto Sans SC", sans-serif';
                ctx.font = `700 ${c.fontSize}px ${ff}`;
                ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.fillStyle = c.color; ctx.fillText(c.char, 0, 0);
                ctx.shadowBlur = 0; ctx.restore();
            });

            // Draw falling characters
            modeState.fallingChars.forEach(c => {
                ctx.save();
                ctx.translate(c.x, c.y + c.fontSize / 2);
                ctx.rotate(c.rotation);
                ctx.globalAlpha = c.alpha;
                ctx.shadowColor = c.color; ctx.shadowBlur = 10;
                const ff = c.lang === 'EN' ? '"Outfit", sans-serif' : '"Noto Sans SC", sans-serif';
                ctx.font = `700 ${c.fontSize}px ${ff}`;
                ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.fillStyle = c.color; ctx.fillText(c.char, 0, 0);
                ctx.shadowBlur = 0; ctx.restore();
            });

        } else if (modeState.phase3 === 'exploding') {
            // Full clear for clean explosion
            ctx.fillStyle = isDark() ? '#0f0f19' : '#0d0d1a';
            ctx.fillRect(0, 0, W, H);

            // Update and draw firework particles
            let alive = 0;
            modeState.fireworks.forEach(p => {
                p.vy += p.gravity;
                p.x += p.vx; p.y += p.vy;
                p.vx *= 0.985; p.vy *= 0.985;
                p.life -= 0.012;
                p.rotation += p.rotSpeed;
                if (p.life <= 0) return;
                alive++;

                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.globalAlpha = Math.max(0, p.life);

                if (p.char) {
                    // Draw as character
                    ctx.rotate(p.rotation);
                    ctx.shadowColor = p.color; ctx.shadowBlur = 12;
                    ctx.font = `700 ${p.fontSize}px "Noto Sans SC", sans-serif`;
                    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                    ctx.fillStyle = p.color; ctx.fillText(p.char, 0, 0);
                } else {
                    // Draw as glowing dot
                    ctx.shadowColor = p.color; ctx.shadowBlur = 8;
                    ctx.beginPath(); ctx.arc(0, 0, p.size * p.life, 0, Math.PI * 2);
                    ctx.fillStyle = p.color; ctx.fill();
                }
                ctx.shadowBlur = 0;
                ctx.restore();
            });
            ctx.globalAlpha = 1;

            if (alive === 0) {
                modeState.phase3 = 'cooldown';
                modeState.cooldownTimer = 0;
            }

        } else if (modeState.phase3 === 'cooldown') {
            ctx.fillStyle = isDark() ? '#0f0f19' : '#0d0d1a';
            ctx.fillRect(0, 0, W, H);
            modeState.cooldownTimer++;
            if (modeState.cooldownTimer >= 40) {
                // Restart the cycle
                buildMode3();
            }
        }
    }

    // ==========================================
    //  MODE 4 — Color Tetris (AI auto-play)
    // ==========================================
    const COLOR_NAMES = [
        { name: '红', color: '#F47B7B' }, { name: '橙', color: '#F9A87C' },
        { name: '黄', color: '#F7E06B' }, { name: '绿', color: '#8DD88C' },
        { name: '青', color: '#7DD8C2' }, { name: '蓝', color: '#7BBDE8' },
        { name: '紫', color: '#B8A0E8' }, { name: '粉', color: '#F78CA8' },
        { name: '玫', color: '#FF6B9D' }, { name: '金', color: '#FDE68A' },
    ];

    const TETRIS_SHAPES = [
        [[0, 0], [1, 0], [2, 0], [3, 0]],  // I
        [[0, 0], [1, 0], [0, 1], [1, 1]],  // O
        [[0, 0], [1, 0], [2, 0], [1, 1]],  // T
        [[0, 0], [1, 0], [1, 1], [2, 1]],  // S
        [[1, 0], [2, 0], [0, 1], [1, 1]],  // Z
        [[0, 0], [0, 1], [1, 1], [2, 1]],  // L
        [[2, 0], [0, 1], [1, 1], [2, 1]],  // J
    ];

    function buildMode4() {
        const cellSize = 36;
        const cols = Math.floor(W / cellSize);
        const rows = Math.floor(H / cellSize);
        modeState.cellSize = cellSize;
        modeState.cols = cols; modeState.rows = rows;
        modeState.grid = [];
        for (let r = 0; r < rows; r++) modeState.grid[r] = new Array(cols).fill(null);
        modeState.activePiece = null;
        modeState.dropTimer = 0; modeState.dropSpeed = 2;
        modeState.moveTimer = 0; modeState.moveSpeed = 3;
        modeState.phase = 'filling';
        modeState.clearRow = rows - 1; modeState.clearTimer = 0;
        modeState.revealAlpha = 0;
        modeState.revealText = '艺术设计思维';

        const off = document.createElement('canvas');
        const octx = off.getContext('2d');
        off.width = W; off.height = H;
        const fontSize = Math.min(W / 6, 130);
        octx.font = `900 ${fontSize}px "Noto Sans SC", sans-serif`;
        octx.textAlign = 'center'; octx.textBaseline = 'middle'; octx.fillStyle = '#fff';
        octx.fillText(modeState.revealText, W / 2, H / 2);
        modeState.revealMask = octx.getImageData(0, 0, W, H).data;
    }

    function spawnTetrisPiece() {
        const shape = TETRIS_SHAPES[Math.floor(Math.random() * TETRIS_SHAPES.length)];
        const cn = COLOR_NAMES[Math.floor(Math.random() * COLOR_NAMES.length)];
        const spawnCol = Math.floor(Math.random() * (modeState.cols - 3));
        const piece = {
            shape, blocks: shape.map(([dx, dy]) => ({ col: spawnCol + dx, row: -2 + dy })),
            name: cn.name, color: cn.color,
            targetCol: spawnCol,
        };
        piece.targetCol = findBestColumn(shape);
        modeState.activePiece = piece;
    }

    function findBestColumn(shape) {
        const { cols, rows, grid } = modeState;
        let bestCol = 0, bestScore = -Infinity;
        const maxDx = Math.max(...shape.map(s => s[0]));
        for (let tryCol = 0; tryCol + maxDx < cols; tryCol++) {
            const testBlocks = shape.map(([dx, dy]) => ({ col: tryCol + dx, row: dy }));
            let dropR = 0, canDrop = true;
            while (canDrop) {
                for (const b of testBlocks) {
                    const nr = b.row + dropR + 1;
                    if (nr >= rows) { canDrop = false; break; }
                    if (nr >= 0 && grid[nr] && grid[nr][b.col]) { canDrop = false; break; }
                }
                if (canDrop) dropR++;
                if (dropR > rows + 5) break;
            }
            let score = dropR * 10;
            for (const b of testBlocks) {
                const lr = b.row + dropR;
                if (lr < 0 || lr >= rows) continue;
                if (lr + 1 >= rows) score += 5;
                else if (grid[lr + 1] && grid[lr + 1][b.col]) score += 3;
                if (b.col > 0 && grid[lr] && grid[lr][b.col - 1]) score += 2;
                if (b.col < cols - 1 && grid[lr] && grid[lr][b.col + 1]) score += 2;
            }
            for (const b of testBlocks) {
                const lr = b.row + dropR;
                for (let below = lr + 1; below < rows; below++) {
                    if (grid[below] && !grid[below][b.col]) score -= 4;
                }
            }
            if (score > bestScore) { bestScore = score; bestCol = tryCol; }
        }
        return bestCol;
    }

    function canMoveT(blocks, dr, dc) {
        for (const b of blocks) {
            const nr = b.row + dr, nc = b.col + dc;
            if (nc < 0 || nc >= modeState.cols) return false;
            if (nr >= modeState.rows) return false;
            if (nr >= 0 && modeState.grid[nr][nc]) return false;
        }
        return true;
    }

    function lockPiece() {
        const p = modeState.activePiece;
        for (const b of p.blocks) {
            if (b.row >= 0 && b.row < modeState.rows) {
                modeState.grid[b.row][b.col] = { name: p.name, color: p.color, alpha: 1 };
            }
        }
        modeState.activePiece = null;
        if (modeState.grid[1] && modeState.grid[1].some(cell => cell !== null)) {
            modeState.phase = 'clearing';
            modeState.clearRow = modeState.rows - 1;
            modeState.clearTimer = 0;
        }
    }

    function drawCell(x, y, cellSize, color, name, alpha) {
        ctx.fillStyle = color; ctx.globalAlpha = alpha * 0.85;
        ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.fillRect(x + 1, y + 1, cellSize - 2, 3);
        ctx.fillRect(x + 1, y + 1, 3, cellSize - 2);
        ctx.globalAlpha = alpha * 0.9;
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.font = `700 ${cellSize * 0.55}px "Noto Sans SC", sans-serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(name, x + cellSize / 2, y + cellSize / 2);
    }

    function drawMode4() {
        ctx.fillStyle = isDark() ? '#0f0f19' : '#0d0d1a';
        ctx.fillRect(0, 0, W, H);
        const { cellSize, cols, rows, grid } = modeState;
        const offsetX = (W - cols * cellSize) / 2;
        const offsetY = (H - rows * cellSize) / 2;

        // Subtle grid
        ctx.strokeStyle = 'rgba(255,255,255,0.03)'; ctx.lineWidth = 0.5;
        for (let c = 0; c <= cols; c++) {
            ctx.beginPath(); ctx.moveTo(offsetX + c * cellSize, offsetY);
            ctx.lineTo(offsetX + c * cellSize, offsetY + rows * cellSize); ctx.stroke();
        }
        for (let r = 0; r <= rows; r++) {
            ctx.beginPath(); ctx.moveTo(offsetX, offsetY + r * cellSize);
            ctx.lineTo(offsetX + cols * cellSize, offsetY + r * cellSize); ctx.stroke();
        }

        if (modeState.phase === 'filling') {
            if (!modeState.activePiece) spawnTetrisPiece();

            // Horizontal AI movement
            const p = modeState.activePiece;
            modeState.moveTimer++;
            if (modeState.moveTimer >= modeState.moveSpeed) {
                modeState.moveTimer = 0;
                const currentCol = Math.min(...p.blocks.map(b => b.col));
                const targetBaseCol = p.targetCol;
                if (currentCol < targetBaseCol && canMoveT(p.blocks, 0, 1)) {
                    p.blocks.forEach(b => b.col++);
                } else if (currentCol > targetBaseCol && canMoveT(p.blocks, 0, -1)) {
                    p.blocks.forEach(b => b.col--);
                }
            }

            // Drop
            modeState.dropTimer++;
            if (modeState.dropTimer >= modeState.dropSpeed) {
                modeState.dropTimer = 0;
                if (canMoveT(p.blocks, 1, 0)) {
                    p.blocks.forEach(b => b.row++);
                } else {
                    lockPiece();
                }
            }

            // Draw grid
            for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
                const cell = grid[r][c];
                if (cell) drawCell(offsetX + c * cellSize, offsetY + r * cellSize, cellSize, cell.color, cell.name, 1);
            }

            // Draw active piece
            if (modeState.activePiece) {
                modeState.activePiece.blocks.forEach(b => {
                    if (b.row >= 0) drawCell(offsetX + b.col * cellSize, offsetY + b.row * cellSize, cellSize, modeState.activePiece.color, modeState.activePiece.name, 1);
                });
            }
            ctx.globalAlpha = 1;

        } else if (modeState.phase === 'clearing') {
            for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
                const cell = grid[r][c];
                if (cell) drawCell(offsetX + c * cellSize, offsetY + r * cellSize, cellSize, cell.color, cell.name, cell.alpha);
            }
            ctx.globalAlpha = 1;

            modeState.clearTimer++;
            if (modeState.clearTimer >= 5) {
                modeState.clearTimer = 0;
                if (modeState.clearRow >= 0) {
                    for (let c = 0; c < cols; c++) grid[modeState.clearRow][c] = null;
                    modeState.clearRow--;
                } else { modeState.phase = 'reveal'; }
            }
            const clearedRatio = 1 - (modeState.clearRow + 1) / rows;
            drawRevealText(clearedRatio);

        } else if (modeState.phase === 'reveal') {
            modeState.revealAlpha = Math.min(1, modeState.revealAlpha + 0.008);
            drawRevealText(modeState.revealAlpha);
            if (modeState.revealAlpha >= 1) {
                modeState.clearTimer++;
                if (modeState.clearTimer >= 180) buildMode4();
            }
        }
    }

    function drawRevealText(alpha) {
        if (alpha <= 0) return;
        const fontSize = Math.min(W / 6, 130);
        ctx.save(); ctx.globalAlpha = alpha * 0.3;
        ctx.shadowColor = '#C084FC'; ctx.shadowBlur = 40;
        ctx.font = `900 ${fontSize}px "Noto Sans SC", sans-serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = '#C084FC'; ctx.fillText(modeState.revealText, W / 2, H / 2);
        ctx.restore();
        ctx.save(); ctx.globalAlpha = alpha;
        const grad = ctx.createLinearGradient(W / 2 - fontSize * 2, 0, W / 2 + fontSize * 2, 0);
        grad.addColorStop(0, '#F47B7B'); grad.addColorStop(0.25, '#F7E06B');
        grad.addColorStop(0.5, '#7DD8C2'); grad.addColorStop(0.75, '#7BBDE8');
        grad.addColorStop(1, '#C084FC');
        ctx.font = `900 ${fontSize}px "Noto Sans SC", sans-serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = grad; ctx.fillText(modeState.revealText, W / 2, H / 2);
        ctx.restore();
    }

    // ==========================================
    //  MODE 5 — 3D Gravity Physics (ART & DESIGN)
    //  Premium rendering: multi-face blocks, metallic edges, grid textures
    // ==========================================
    const PHYS_LETTERS = ['A', 'R', 'T', '&', 'D', 'E', 'S', 'I', 'G', 'N'];

    // Each letter gets 3 face colors (top, right-side, front) + edge color
    const PHYS_FACES = [
        { top: '#ffd200', side: '#4facfe', front: '#1a1a2e', edge: ['#f7971e', '#ffd200', '#00d2ff'] },
        { top: '#ff5858', side: '#4facfe', front: '#1a1a2e', edge: ['#ff5858', '#ffd200', '#4facfe'] },
        { top: '#00c9ff', side: '#f093fb', front: '#222', edge: ['#00c9ff', '#ffd200', '#f093fb'] },
        { top: '#ffd200', side: '#ff6b9d', front: '#1a1a2e', edge: ['#f7971e', '#43e97b', '#6a82fb'] },
        { top: '#f093fb', side: '#ffd200', front: '#222', edge: ['#f093fb', '#ff5858', '#ffd200'] },
        { top: '#43e97b', side: '#fa709a', front: '#1a1a2e', edge: ['#43e97b', '#ffd200', '#fa709a'] },
        { top: '#4facfe', side: '#f5576c', front: '#222', edge: ['#4facfe', '#ffd200', '#ff5858'] },
        { top: '#e8e8e8', side: '#ff6b9d', front: '#1a1a2e', edge: ['#fff', '#ffd200', '#ff6b9d'] },
        { top: '#ffd200', side: '#43e97b', front: '#222', edge: ['#f7971e', '#00c9ff', '#43e97b'] },
        { top: '#fc5c7d', side: '#00c9ff', front: '#1a1a2e', edge: ['#fc5c7d', '#ffd200', '#00c9ff'] },
    ];

    function buildMode5() {
        modeState.phys = {
            letters: [],
            depth: 18,
            time: 0,
        };
        // Spawn all letters immediately in a clustered arrangement around center
        for (let i = 0; i < PHYS_LETTERS.length; i++) {
            const ch = PHYS_LETTERS[i];
            const faces = PHYS_FACES[i];
            const fontSize = Math.min(W / 9, 100) + Math.random() * 15;
            ctx.font = `900 ${fontSize}px "Helvetica Neue", "Arial Black", sans-serif`;
            const lw = ctx.measureText(ch).width;
            const lh = fontSize * 0.85;

            // Arrange in a loose cluster around center
            const angle = (i / PHYS_LETTERS.length) * Math.PI * 2 + Math.random() * 0.3;
            const radius = 60 + Math.random() * Math.min(W, H) * 0.22;

            modeState.phys.letters.push({
                char: ch,
                x: W / 2 + Math.cos(angle) * radius,
                y: H / 2 + Math.sin(angle) * radius,
                baseX: W / 2 + Math.cos(angle) * radius,
                baseY: H / 2 + Math.sin(angle) * radius,
                angle: (Math.random() - 0.5) * 0.5,
                angVel: (Math.random() - 0.5) * 0.008,
                bobPhase: Math.random() * Math.PI * 2,
                bobSpeed: 0.008 + Math.random() * 0.008,
                bobAmp: 5 + Math.random() * 10,
                w: lw, h: lh, fontSize, faces,
                scale: 0, // start at 0 for entrance animation
                targetScale: 1,
                spawnDelay: i * 12, // staggered entrance
            });
        }
    }

    function drawMode5() {
        ctx.fillStyle = '#0a0a12';
        ctx.fillRect(0, 0, W, H);

        const ps = modeState.phys;
        const depth = ps.depth;
        ps.time++;

        // Update letters (floating, bobbing)
        ps.letters.forEach(L => {
            // Entrance animation
            if (ps.time > L.spawnDelay) {
                L.scale += (L.targetScale - L.scale) * 0.06;
            }
            // Gentle bobbing
            L.bobPhase += L.bobSpeed;
            L.x = L.baseX + Math.sin(L.bobPhase) * L.bobAmp;
            L.y = L.baseY + Math.cos(L.bobPhase * 0.7 + 1) * L.bobAmp * 0.6;

            // Slow rotation
            L.angle += L.angVel;

            // Mouse interaction — push away gently
            const mx = L.x - mouse.x, my = L.y - mouse.y;
            const md = Math.sqrt(mx * mx + my * my);
            if (md < 120 && md > 0) {
                const push = (120 - md) / 120 * 15;
                L.baseX += (mx / md) * push * 0.05;
                L.baseY += (my / md) * push * 0.05;
                L.angVel += (Math.random() - 0.5) * 0.003;
            }
            // Slowly drift back toward original orbit
            const origAngle = (PHYS_LETTERS.indexOf(L.char) / PHYS_LETTERS.length) * Math.PI * 2;
            const origR = 60 + Math.min(W, H) * 0.18;
            const targX = W / 2 + Math.cos(origAngle + ps.time * 0.002) * origR;
            const targY = H / 2 + Math.sin(origAngle + ps.time * 0.002) * origR;
            L.baseX += (targX - L.baseX) * 0.003;
            L.baseY += (targY - L.baseY) * 0.003;
        });

        // Sort by scale/distance for depth
        const sorted = [...ps.letters].sort((a, b) => a.scale - b.scale);

        sorted.forEach(L => {
            if (L.scale < 0.02) return;
            const fs = L.fontSize * L.scale;
            const f = L.faces;
            const fontStr = `900 ${fs}px "Helvetica Neue", "Arial Black", sans-serif`;
            const scaledDepth = Math.floor(depth * L.scale);

            // Soft glow shadow beneath
            ctx.save();
            ctx.translate(L.x + 4, L.y + 8);
            ctx.scale(1, 0.3);
            ctx.font = fontStr; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.filter = 'blur(8px)';
            ctx.fillText(L.char, 0, 0);
            ctx.filter = 'none';
            ctx.restore();

            ctx.save();
            ctx.translate(L.x, L.y);
            ctx.rotate(L.angle);
            ctx.font = fontStr; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';

            const sw = L.w * L.scale;
            const sh = L.h * L.scale;

            // LAYER 1: Deep back face
            for (let d = scaledDepth; d >= 1; d--) {
                const ox = d * 0.8, oy = d * 1.0;
                const t = d / scaledDepth;
                ctx.globalAlpha = 0.2 + t * 0.35;
                ctx.fillStyle = f.front;
                ctx.fillText(L.char, ox, oy);
            }

            // LAYER 2: Side face color
            for (let d = scaledDepth; d >= Math.floor(scaledDepth * 0.3); d--) {
                const ox = d * 0.8, oy = d * 1.0;
                const t = (d - scaledDepth * 0.3) / (scaledDepth * 0.7);
                ctx.globalAlpha = t * 0.5;
                ctx.fillStyle = f.side;
                ctx.fillText(L.char, ox, oy);
            }

            // LAYER 3: Metallic rainbow edge on extrusion
            for (let d = scaledDepth; d >= 1; d -= 2) {
                const ox = d * 0.8, oy = d * 1.0;
                const t = d / scaledDepth;
                const edgeIdx = Math.floor(t * (f.edge.length - 1));
                ctx.strokeStyle = f.edge[edgeIdx];
                ctx.lineWidth = 1.8 + (1 - t) * 1.5;
                ctx.globalAlpha = 0.3 + (1 - t) * 0.4;
                ctx.strokeText(L.char, ox, oy);
            }

            // LAYER 4: Top face
            ctx.globalAlpha = 1;
            const topGrad = ctx.createLinearGradient(-sw * 0.6, -sh * 0.6, sw * 0.6, sh * 0.6);
            topGrad.addColorStop(0, f.top);
            topGrad.addColorStop(1, adjustBrightness(f.top, -30));
            ctx.fillStyle = topGrad;
            ctx.fillText(L.char, 0, 0);

            // LAYER 5: Grid texture
            ctx.globalAlpha = 0.08;
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 0.5;
            ctx.strokeText(L.char, 0, 0);
            ctx.globalAlpha = 0.04; ctx.lineWidth = 0.3;
            ctx.strokeText(L.char, 0.8, 0.8);
            ctx.strokeText(L.char, -0.8, -0.8);

            // LAYER 6: Metallic gold edge
            ctx.globalAlpha = 0.85;
            const edgeGrad = ctx.createLinearGradient(-sw * 0.6, -sh, sw * 0.6, sh);
            edgeGrad.addColorStop(0, '#ffd700');
            edgeGrad.addColorStop(0.2, f.edge[0]);
            edgeGrad.addColorStop(0.5, '#ffd700');
            edgeGrad.addColorStop(0.8, f.edge[2]);
            edgeGrad.addColorStop(1, '#ffd700');
            ctx.strokeStyle = edgeGrad; ctx.lineWidth = 2.5;
            ctx.strokeText(L.char, 0, 0);

            ctx.globalAlpha = 0.35; ctx.strokeStyle = '#fff'; ctx.lineWidth = 0.8;
            ctx.strokeText(L.char, 0, 0);

            // LAYER 7: Specular
            ctx.globalAlpha = 0.55;
            const hlGrad = ctx.createLinearGradient(-sw * 0.5, -sh * 0.6, sw * 0.2, sh * 0.2);
            hlGrad.addColorStop(0, 'rgba(255,255,255,0.6)');
            hlGrad.addColorStop(0.25, 'rgba(255,255,255,0.15)');
            hlGrad.addColorStop(0.6, 'transparent');
            hlGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = hlGrad;
            ctx.fillText(L.char, 0, 0);

            // LAYER 8: Chromatic aberration
            ctx.globalAlpha = 0.12;
            ctx.fillStyle = '#00ffff'; ctx.fillText(L.char, -1.2, -0.5);
            ctx.fillStyle = '#ff0066'; ctx.fillText(L.char, 1.2, 0.5);

            ctx.globalAlpha = 1;
            ctx.restore();
        });

        // Ambient glow
        const ambGrad = ctx.createRadialGradient(W * 0.85, -50, 0, W * 0.85, -50, W * 0.6);
        ambGrad.addColorStop(0, 'rgba(255, 200, 100, 0.05)');
        ambGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = ambGrad;
        ctx.fillRect(0, 0, W, H);

        // Vignette
        const vig = ctx.createRadialGradient(W / 2, H / 2, W * 0.2, W / 2, H / 2, W * 0.7);
        vig.addColorStop(0, 'transparent');
        vig.addColorStop(1, 'rgba(0,0,0,0.4)');
        ctx.fillStyle = vig;
        ctx.fillRect(0, 0, W, H);
    }

    // ==========================================
    //  MODE 6 — Matrix Rain
    //  "Art & Design Thinking" characters fall
    //  Mouse creates square avoidance zone
    // ==========================================
    function buildMode6() {
        const TEXT = 'ArtDesignThinking';
        const colW = 22;
        const cols = Math.ceil(W / colW);
        modeState.matrixCols = [];
        for (let i = 0; i < cols; i++) {
            modeState.matrixCols.push({
                x: i * colW,
                y: Math.random() * H * 2 - H,
                speed: 1.5 + Math.random() * 3,
                chars: [],
                length: 10 + Math.floor(Math.random() * 25)
            });
            // Pre-fill chars from the text
            const col = modeState.matrixCols[i];
            for (let j = 0; j < col.length; j++) {
                col.chars.push(TEXT[Math.floor(Math.random() * TEXT.length)]);
            }
        }
        modeState.matrixAvoidR = 120; // square half-size
    }

    function drawMode6() {
        // Semi-transparent black overlay for trail effect
        ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
        ctx.fillRect(0, 0, W, H);

        const avoidR = modeState.matrixAvoidR;
        const mx = mouse.x, my = mouse.y;
        const fontSize = 18;

        modeState.matrixCols.forEach(col => {
            // Check if column is inside mouse avoidance square
            const inAvoid = mx > -1000 &&
                col.x > mx - avoidR && col.x < mx + avoidR;

            col.y += col.speed;

            // Reset when column falls off screen
            if (col.y - col.length * fontSize > H) {
                col.y = -col.length * fontSize * Math.random();
                col.speed = 1.5 + Math.random() * 3;
            }

            for (let j = 0; j < col.length; j++) {
                const cy = col.y - j * fontSize;
                if (cy < -fontSize || cy > H + fontSize) continue;

                // Square avoidance: hide chars in mouse zone
                if (inAvoid && cy > my - avoidR && cy < my + avoidR) continue;

                // Green gradient: head is bright white/green, tail fades
                const ratio = j / col.length;
                let alpha, r, g, b;
                if (j === 0) {
                    // Head: bright white
                    r = 255; g = 255; b = 255; alpha = 1;
                } else if (ratio < 0.15) {
                    // Near head: bright green
                    r = 0; g = 255; b = 65; alpha = 1;
                } else if (ratio < 0.4) {
                    r = 0; g = 220; b = 50; alpha = 0.85;
                } else if (ratio < 0.7) {
                    r = 0; g = 170; b = 30; alpha = 0.6;
                } else {
                    r = 0; g = 100; b = 20; alpha = 0.3;
                }

                ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
                ctx.font = `bold ${fontSize}px monospace`;
                ctx.fillText(col.chars[j], col.x, cy);

                // Randomly change some chars for flickering effect
                if (Math.random() < 0.02) {
                    const TEXT = 'ArtDesignThinking';
                    col.chars[j] = TEXT[Math.floor(Math.random() * TEXT.length)];
                }
            }
        });
    }

    // Helper: darken/lighten a hex color
    function adjustBrightness(hex, amount) {
        let r = parseInt(hex.slice(1, 3), 16);
        let g = parseInt(hex.slice(3, 5), 16);
        let b = parseInt(hex.slice(5, 7), 16);
        r = Math.max(0, Math.min(255, r + amount));
        g = Math.max(0, Math.min(255, g + amount));
        b = Math.max(0, Math.min(255, b + amount));
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    // ==========================================
    //  THEME TOGGLE
    // ==========================================
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        themeBtn.addEventListener('click', e => {
            e.stopPropagation();
            const html = document.documentElement;
            const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            html.setAttribute('data-theme', next);
            themeBtn.querySelector('.theme-icon').textContent = next === 'dark' ? '☀️' : '🌙';
            clearCanvas();
        });
    }

    // ==========================================
    //  INIT
    // ==========================================
    resize();
    window.addEventListener('resize', resize);
    clearCanvas();
    animate();
})();

const style = document.createElement('style');
style.textContent = `@keyframes fadeInUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }`;
document.head.appendChild(style);
