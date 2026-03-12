/* ============================================================
   形状的力量 — Shape Course Logic
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    initShapeMatchGame();
    initShapeFlipCards();
    initShapeCanvas();
    initShapeReview();
});

/* ============================================================
   Stage 1: Shape Hunter — Drag & Drop Matching
   ============================================================ */
function initShapeMatchGame() {
    const objects = document.querySelectorAll('.shape-obj');
    const targets = document.querySelectorAll('.shape-target');
    const scoreEl = document.getElementById('match-score');
    let matched = 0;

    objects.forEach(obj => {
        obj.addEventListener('dragstart', e => {
            e.dataTransfer.setData('text/plain', obj.dataset.shape);
            obj.classList.add('dragging');
        });
        obj.addEventListener('dragend', () => obj.classList.remove('dragging'));

        // Touch support
        let touchClone = null;
        obj.addEventListener('touchstart', e => {
            const touch = e.touches[0];
            touchClone = obj.cloneNode(true);
            touchClone.style.cssText = `position:fixed;z-index:9999;pointer-events:none;opacity:0.7;transform:scale(1.1);left:${touch.clientX - 30}px;top:${touch.clientY - 30}px;`;
            document.body.appendChild(touchClone);
            obj._shape = obj.dataset.shape;
        }, { passive: true });
        obj.addEventListener('touchmove', e => {
            if (!touchClone) return;
            const touch = e.touches[0];
            touchClone.style.left = (touch.clientX - 30) + 'px';
            touchClone.style.top = (touch.clientY - 30) + 'px';
            targets.forEach(t => {
                const r = t.getBoundingClientRect();
                if (touch.clientX >= r.left && touch.clientX <= r.right && touch.clientY >= r.top && touch.clientY <= r.bottom) {
                    t.classList.add('over');
                } else {
                    t.classList.remove('over');
                }
            });
        }, { passive: true });
        obj.addEventListener('touchend', e => {
            if (!touchClone) return;
            const touch = e.changedTouches[0];
            document.body.removeChild(touchClone);
            touchClone = null;
            targets.forEach(t => {
                t.classList.remove('over');
                const r = t.getBoundingClientRect();
                if (touch.clientX >= r.left && touch.clientX <= r.right &&
                    touch.clientY >= r.top && touch.clientY <= r.bottom &&
                    t.dataset.shape === obj._shape && !t.classList.contains('correct')) {
                    handleMatch(obj, t);
                }
            });
        });
    });

    targets.forEach(target => {
        target.addEventListener('dragover', e => {
            e.preventDefault();
            target.classList.add('over');
        });
        target.addEventListener('dragleave', () => target.classList.remove('over'));
        target.addEventListener('drop', e => {
            e.preventDefault();
            target.classList.remove('over');
            const shape = e.dataTransfer.getData('text/plain');
            const obj = document.querySelector(`.shape-obj.dragging`);
            if (shape === target.dataset.shape && obj && !target.classList.contains('correct')) {
                handleMatch(obj, target);
            }
        });
    });

    function handleMatch(obj, target) {
        matched++;
        obj.classList.add('matched');
        target.classList.add('correct');
        scoreEl.textContent = `匹配: ${matched}/3`;

        if (typeof robotSay === 'function') {
            const msgs = {
                circle: '太棒了！杯子确实是圆形的！🎯',
                triangle: '没错！屋顶就是三角形！🏠',
                square: '很好！书本就是方形的！📖'
            };
            robotSay(msgs[obj.dataset.shape] || '匹配正确！');
        }

        if (matched >= 3) {
            scoreEl.textContent = '🎉 全部匹配！太厉害了！';
            scoreEl.style.color = 'var(--mint)';
            const btn = document.getElementById('btn-to-shape2');
            if (btn) {
                btn.style.display = 'block';
                btn.style.animation = 'bubbleIn 0.4s ease-out';
            }
            if (typeof robotSay === 'function') {
                robotSay('哇！你全都找对了！你已经是一个小小形状猎人了！让我们继续探索形状的秘密吧～');
            }
        }
    }
}

/* ============================================================
   Stage 2: Shape Flip Cards
   ============================================================ */
function initShapeFlipCards() {
    const cards = document.querySelectorAll('.shape-flip-card');
    const hint = document.getElementById('shape-cards-hint');
    let flippedCount = 0;

    cards.forEach(card => {
        card.addEventListener('click', () => {
            card.classList.toggle('flipped');
            if (card.classList.contains('flipped')) {
                flippedCount++;
                const shape = card.dataset.shape;
                if (typeof robotSay === 'function') {
                    const msgs = {
                        circle: '圆形就像妈妈的拥抱，暖暖的，没有尖角～🤗',
                        triangle: '三角形尖尖的，充满力量！就像超人的披风！⚡',
                        square: '方形稳稳当当的，就像坚固的城堡，让人感到安全可靠～🏛️'
                    };
                    robotSay(msgs[shape] || '');
                }
            }

            if (flippedCount >= 3 && hint) {
                hint.style.opacity = '0';
                const btn = document.getElementById('btn-to-shape3');
                if (btn) {
                    btn.style.display = 'block';
                    btn.style.animation = 'bubbleIn 0.4s ease-out';
                }
                if (typeof robotSay === 'function') {
                    robotSay('你已经了解了三种形状的情绪语言！现在让我们用形状来创作吧！🎨');
                }
            }
        });
    });
}

/* ============================================================
   Stage 3: Shape Collage Canvas (SVG-based)
   ============================================================ */
function initShapeCanvas() {
    const svgCanvas = document.getElementById('shape-canvas');
    if (!svgCanvas) return;

    const svgNS = 'http://www.w3.org/2000/svg';
    let currentShape = 'circle';
    let currentColor = '#FFB5B5';
    let shapeSize = 60;
    let shapes = [];
    let selectedShapeEl = null;
    let isDragging = false;
    let dragOffset = { x: 0, y: 0 };

    // Shape tool selection
    document.querySelectorAll('.shape-tool-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.shape-tool-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentShape = btn.dataset.addShape;
        });
    });

    // Color selection
    document.querySelectorAll('.scp').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.scp').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentColor = btn.dataset.color;
        });
    });

    // Size slider
    const sizeSlider = document.getElementById('shape-size');
    if (sizeSlider) {
        sizeSlider.addEventListener('input', e => { shapeSize = parseInt(e.target.value); });
    }

    // Click to add shape
    svgCanvas.addEventListener('click', e => {
        if (isDragging) return;
        const rect = svgCanvas.getBoundingClientRect();
        const svgVB = svgCanvas.viewBox.baseVal;
        const scaleX = svgVB.width / rect.width;
        const scaleY = svgVB.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        addShape(x, y, currentShape, currentColor, shapeSize);
    });

    function addShape(x, y, type, color, size) {
        let el;
        const halfSize = size / 2;

        switch (type) {
            case 'circle':
                el = document.createElementNS(svgNS, 'circle');
                el.setAttribute('cx', x);
                el.setAttribute('cy', y);
                el.setAttribute('r', halfSize);
                el.setAttribute('fill', color);
                break;
            case 'triangle': {
                const pts = `${x},${y - halfSize} ${x + halfSize},${y + halfSize} ${x - halfSize},${y + halfSize}`;
                el = document.createElementNS(svgNS, 'polygon');
                el.setAttribute('points', pts);
                el.setAttribute('fill', color);
                break;
            }
            case 'square':
                el = document.createElementNS(svgNS, 'rect');
                el.setAttribute('x', x - halfSize);
                el.setAttribute('y', y - halfSize);
                el.setAttribute('width', size);
                el.setAttribute('height', size);
                el.setAttribute('rx', size * 0.1);
                el.setAttribute('fill', color);
                break;
            case 'star': {
                const points = [];
                for (let i = 0; i < 10; i++) {
                    const angle = (Math.PI / 5) * i - Math.PI / 2;
                    const r = i % 2 === 0 ? halfSize : halfSize * 0.45;
                    points.push(`${x + r * Math.cos(angle)},${y + r * Math.sin(angle)}`);
                }
                el = document.createElementNS(svgNS, 'polygon');
                el.setAttribute('points', points.join(' '));
                el.setAttribute('fill', color);
                break;
            }
        }

        if (el) {
            el.style.cursor = 'move';
            el.setAttribute('data-type', type);
            el.setAttribute('filter', 'drop-shadow(2px 3px 3px rgba(0,0,0,0.12))');
            el.addEventListener('mousedown', startDragShape);
            svgCanvas.appendChild(el);
            shapes.push({ el, type, color, x, y, size });
        }
    }

    function startDragShape(e) {
        e.stopPropagation();
        selectedShapeEl = e.target;
        isDragging = true;
        const rect = svgCanvas.getBoundingClientRect();
        const svgVB = svgCanvas.viewBox.baseVal;
        const scaleX = svgVB.width / rect.width;
        const scaleY = svgVB.height / rect.height;
        dragOffset.x = (e.clientX - rect.left) * scaleX;
        dragOffset.y = (e.clientY - rect.top) * scaleY;

        const moveHandler = ev => {
            if (!isDragging || !selectedShapeEl) return;
            const mx = (ev.clientX - rect.left) * scaleX;
            const my = (ev.clientY - rect.top) * scaleY;
            const dx = mx - dragOffset.x;
            const dy = my - dragOffset.y;
            selectedShapeEl.setAttribute('transform', `translate(${dx},${dy})`);
        };

        const upHandler = () => {
            isDragging = false;
            selectedShapeEl = null;
            document.removeEventListener('mousemove', moveHandler);
            document.removeEventListener('mouseup', upHandler);
            setTimeout(() => isDragging = false, 50);
        };

        document.addEventListener('mousemove', moveHandler);
        document.addEventListener('mouseup', upHandler);
    }

    // Undo
    document.getElementById('shape-undo')?.addEventListener('click', () => {
        if (shapes.length > 0) {
            const last = shapes.pop();
            last.el.remove();
        }
    });

    // Clear
    document.getElementById('shape-clear')?.addEventListener('click', () => {
        shapes.forEach(s => s.el.remove());
        shapes = [];
    });

    // Submit
    document.getElementById('btn-shape-submit')?.addEventListener('click', () => {
        if (shapes.length < 2) {
            if (typeof robotSay === 'function') robotSay('再多加几个形状吧！至少用2个形状来组合～');
            return;
        }
        // Count shapes by type
        const counts = {};
        shapes.forEach(s => { counts[s.type] = (counts[s.type] || 0) + 1; });
        window._shapeCounts = counts;
        window._shapeTotal = shapes.length;

        if (typeof robotSay === 'function') {
            robotSay(`太棒了！你用了 ${shapes.length} 个形状来创作！让噗噗来分析一下～`);
        }
        setTimeout(() => navigateTo('page-shape4'), 1500);
    });
}

/* ============================================================
   Stage 4: Shape AI Review
   ============================================================ */
function initShapeReview() {
    // Watch for page-shape4 becoming active
    const observer = new MutationObserver(mutations => {
        mutations.forEach(m => {
            if (m.target.id === 'page-shape4' && m.target.classList.contains('active')) {
                runShapeReview();
            }
        });
    });

    const page = document.getElementById('page-shape4');
    if (page) observer.observe(page, { attributes: true, attributeFilter: ['class'] });
}

function runShapeReview() {
    const scanZone = document.getElementById('shape-scan-zone');
    const reviewZone = document.getElementById('shape-review-zone');

    // Simulate scanning for 2.5s
    setTimeout(() => {
        if (scanZone) scanZone.style.display = 'none';
        if (reviewZone) reviewZone.style.display = 'block';

        const counts = window._shapeCounts || { circle: 2, triangle: 1, square: 1 };
        const total = window._shapeTotal || 4;

        // Build ratio chart
        const chartEl = document.getElementById('shape-ratio-chart');
        if (chartEl) {
            chartEl.innerHTML = '';
            const colors = { circle: '#FFB5B5', triangle: '#FFD93D', square: '#7DD8C2', star: '#C4B5FD' };
            const labels = { circle: '⚪', triangle: '△', square: '▢', star: '⭐' };
            Object.entries(counts).forEach(([type, count]) => {
                const pct = Math.round((count / total) * 100);
                const bar = document.createElement('div');
                bar.className = 'shape-bar';
                bar.innerHTML = `
                    <div class="shape-bar-fill" style="height:0;background:${colors[type] || '#ccc'}"></div>
                    <div class="shape-bar-label">${labels[type] || type} ${pct}%</div>`;
                chartEl.appendChild(bar);
                setTimeout(() => {
                    bar.querySelector('.shape-bar-fill').style.height = `${pct}%`;
                }, 300);
            });
        }

        // Shape personality
        const personalityEl = document.getElementById('shape-personality');
        const personalityText = document.getElementById('shape-personality-text');
        if (personalityEl) {
            const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
            const personalities = {
                circle: { emoji: '🤗', label: '温柔型创作者', desc: '你偏好圆形，说明你是一个温暖善良的小艺术家，作品充满亲和力～' },
                triangle: { emoji: '⚡', label: '冒险型创作者', desc: '你喜欢三角形！说明你是一个勇敢有力量的小创作者！' },
                square: { emoji: '🏛️', label: '理性型创作者', desc: '方形用得最多，说明你是一个有条理、稳重的小设计师！' },
                star: { emoji: '✨', label: '梦幻型创作者', desc: '星形最多！你是一个充满想象力的小天才！' }
            };
            const p = personalities[dominant] || personalities.circle;
            personalityEl.innerHTML = `<div class="sp-type">${p.emoji}</div><div class="sp-label">${p.label}</div>`;
            if (personalityText) personalityText.textContent = p.desc;
        }

        // Creativity score
        const starsEl = document.getElementById('shape-stars');
        const creativityText = document.getElementById('shape-creativity-text');
        if (starsEl) {
            const uniqueTypes = Object.keys(counts).length;
            const score = Math.min(5, Math.max(3, uniqueTypes + (total > 5 ? 1 : 0)));
            starsEl.innerHTML = '⭐'.repeat(score) + '☆'.repeat(5 - score);
            starsEl.style.fontSize = '24px';
        }
        if (creativityText) {
            creativityText.textContent = total > 5
                ? '你使用了丰富的形状组合，创作热情满满！'
                : '不错的开始！下次试试用更多形状来创作吧～';
        }

        // Show next button
        setTimeout(() => {
            const btn = document.getElementById('btn-to-shape5');
            if (btn) {
                btn.style.display = 'block';
                btn.style.animation = 'bubbleIn 0.4s ease-out';
            }
        }, 2000);

        // Robot feedback
        if (typeof robotSay === 'function') {
            setTimeout(() => robotSay('分析完成！你的形状作品太有创意了！恭喜获得"形状组合大师"徽章！🏅'), 1500);
        }
    }, 2500);
}
