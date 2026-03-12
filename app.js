/* ============================================================
   彩绘心灵 — App Logic  (3D Cartoon World Edition)
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    initRobotPanel();
    initNavigation();
    initColorWheel();
    initCardWall();
    initCanvas();
    initCompanionDrawer();
    initSmartDock();
    initDashboardHoverSound();
    initRobotClickAnimations();
    initStatsCountUp();
    initSlideTabsCursor();
    initBentoReveal();
});

/* ============================================================
   0a-1. Slide Tabs Cursor — animated pill follows hover
   ============================================================ */
function initSlideTabsCursor() {
    const nav = document.getElementById('dash-topnav');
    const cursor = document.getElementById('dash-nav-cursor');
    if (!nav || !cursor) return;

    const items = nav.querySelectorAll('.dash-nav-item');

    // Position cursor on hovered tab + flip text color
    items.forEach(item => {
        item.addEventListener('mouseenter', () => {
            const { offsetLeft, offsetWidth } = item;
            cursor.style.left = offsetLeft + 'px';
            cursor.style.width = offsetWidth + 'px';
            cursor.style.opacity = '1';
            // Flip text: white on hovered, reset others
            items.forEach(i => i.classList.remove('nav-hovered'));
            item.classList.add('nav-hovered');
        });
    });

    // Mouse leaves nav: snap back to active
    nav.addEventListener('mouseleave', () => {
        items.forEach(i => i.classList.remove('nav-hovered'));
        const active = nav.querySelector('.dash-nav-item.active');
        if (active) {
            cursor.style.left = active.offsetLeft + 'px';
            cursor.style.width = active.offsetWidth + 'px';
            cursor.style.opacity = '1';
        } else {
            cursor.style.opacity = '0';
        }
    });

    // Initialize on active tab
    const active = nav.querySelector('.dash-nav-item.active');
    if (active) {
        cursor.style.left = active.offsetLeft + 'px';
        cursor.style.width = active.offsetWidth + 'px';
        cursor.style.opacity = '1';
    }
}

/* ============================================================
   0a-2. Bento Reveal — stagger reveal-i index for animation
   ============================================================ */
function initBentoReveal() {
    const blocks = document.querySelectorAll(
        '#page-home .swiss-card, #page-home .swiss-hero'
    );
    blocks.forEach((el, i) => {
        el.style.setProperty('--reveal-i', i);
    });
}

/* ============================================================
   0b. Stats Counter — hover-triggered count-up animation
   ============================================================ */
function initStatsCountUp() {
    const hero = document.querySelector('.swiss-hero');
    if (!hero) return;
    const nums = hero.querySelectorAll('.swiss-stat-num[data-target]');
    let animating = false;

    hero.addEventListener('mouseenter', () => {
        if (animating) return;
        animating = true;
        nums.forEach(el => {
            const target = parseFloat(el.dataset.target);
            const suffix = el.dataset.suffix || '';
            const duration = 1200;
            const start = performance.now();
            const tick = (now) => {
                const elapsed = now - start;
                const progress = Math.min(elapsed / duration, 1);
                const ease = 1 - Math.pow(1 - progress, 3);
                const current = Math.round(target * ease);
                el.textContent = current + suffix;
                if (progress < 1) {
                    requestAnimationFrame(tick);
                } else {
                    el.textContent = target + suffix;
                }
            };
            requestAnimationFrame(tick);
        });
    });

    hero.addEventListener('mouseleave', () => {
        setTimeout(() => {
            nums.forEach(el => el.textContent = '0');
            animating = false;
        }, 300);
    });

    // Also auto-trigger count-up on page load after 1s
    setTimeout(() => {
        if (!animating) {
            animating = true;
            nums.forEach(el => {
                const target = parseFloat(el.dataset.target);
                const suffix = el.dataset.suffix || '';
                const duration = 1200;
                const start = performance.now();
                const tick = (now) => {
                    const elapsed = now - start;
                    const progress = Math.min(elapsed / duration, 1);
                    const ease = 1 - Math.pow(1 - progress, 3);
                    const current = Math.round(target * ease);
                    el.textContent = current + suffix;
                    if (progress < 1) requestAnimationFrame(tick);
                    else el.textContent = target + suffix;
                };
                requestAnimationFrame(tick);
            });
        }
    }, 1000);

    // Return-to-splash button
    const splashBtn = document.getElementById('return-to-splash');
    if (splashBtn) {
        splashBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const splash = document.getElementById('splash-page');
            if (splash) {
                splash.style.display = '';
                splash.style.opacity = '1';
                splash.style.transition = 'none';
                const split = document.getElementById('ipad-split');
                if (split) split.style.display = 'none';
            }
        });
    }
}

/* ============================================================
   0c. Bubble "Goober" Sound — Web Audio API
   ============================================================ */
let audioCtx = null;
function playBubbleSound() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.15);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
}

/* ============================================================
   0d. Dashboard Hover Sound — bubble on module hover
   ============================================================ */
function initDashboardHoverSound() {
    const hoverTargets = document.querySelectorAll('.swiss-card, .dash-block, .dash-tile, .dash-portfolio-item');
    hoverTargets.forEach(el => {
        el.addEventListener('mouseenter', () => {
            playBubbleSound();
        });
    });
}

/* ============================================================
   0e. Robot Click Animations — random expressions & motions
   ============================================================ */
function initRobotClickAnimations() {
    // All robot avatar areas (sidebar + companion panel)
    const robotAvatars = document.querySelectorAll('.robot-avatar-3d');
    const expressions = ['happy', 'shy', 'excited'];
    const motions = ['sway', 'bounce', 'shake', 'excited'];

    robotAvatars.forEach(avatar => {
        avatar.style.cursor = 'pointer';
        avatar.addEventListener('click', () => {
            // Pick random expression and motion
            const expr = expressions[Math.floor(Math.random() * expressions.length)];
            const motion = motions[Math.floor(Math.random() * motions.length)];

            // Apply motion animation
            avatar.classList.remove('anim-sway', 'anim-bounce', 'anim-shake', 'anim-excited');
            void avatar.offsetWidth; // force reflow
            avatar.classList.add(`anim-${motion}`);

            // Apply expression to eyes
            const eyes = avatar.querySelectorAll('.robot-eye');
            eyes.forEach(eye => {
                eye.classList.remove('expr-happy', 'expr-shy', 'expr-excited');
                eye.classList.add(`expr-${expr}`);
            });

            // Show mouth for happy/excited
            const mouth = avatar.querySelector('.robot-mouth');
            const robotBody = avatar.querySelector('.robot-body');
            if (robotBody) {
                if (expr === 'happy') robotBody.setAttribute('data-mouth', 'smile');
                else if (expr === 'excited') robotBody.setAttribute('data-mouth', 'open');
                else robotBody.setAttribute('data-mouth', '');
            }

            // Play bubble sound
            playBubbleSound();

            // Remove after animation completes
            setTimeout(() => {
                avatar.classList.remove(`anim-${motion}`);
                eyes.forEach(eye => eye.classList.remove(`expr-${expr}`));
                if (robotBody) robotBody.removeAttribute('data-mouth');
                // Restore default float
                avatar.style.animation = '';
            }, 700);
        });
    });
}

/* ============================================================
   0a. Companion Drawer — slide-out toggle
   ============================================================ */
function initCompanionDrawer() {
    const shell = document.getElementById('iphone-shell');
    const toggleBtn = document.getElementById('companion-toggle');
    if (!shell || !toggleBtn) return;
    toggleBtn.addEventListener('click', () => {
        shell.classList.toggle('open');
    });
}

/* ============================================================
   0b. Smart Dock — auto-show on scroll to bottom
   ============================================================ */
function initSmartDock() {
    const tabBar = document.getElementById('main-tab-bar');
    const contentPanel = document.querySelector('.ipad-content-panel');
    if (!tabBar || !contentPanel) return;

    // Show dock on page-home by default
    const activePage = document.querySelector('.page.active');
    if (activePage && activePage.id === 'page-home') {
        tabBar.classList.add('visible');
    }

    // Hover-to-reveal: show dock when mouse enters bottom 60px zone
    let hoverTimer = null;
    contentPanel.addEventListener('mousemove', (e) => {
        const page = document.querySelector('.page.active');
        if (page && page.id === 'page-home') return; // always visible on home
        const rect = contentPanel.getBoundingClientRect();
        const mouseY = e.clientY - rect.top;
        const nearBottom = mouseY > rect.height - 60;
        if (nearBottom) {
            tabBar.classList.add('visible');
            clearTimeout(hoverTimer);
        } else {
            clearTimeout(hoverTimer);
            hoverTimer = setTimeout(() => tabBar.classList.remove('visible'), 600);
        }
    });
    contentPanel.addEventListener('mouseleave', () => {
        const page = document.querySelector('.page.active');
        if (page && page.id === 'page-home') return;
        hoverTimer = setTimeout(() => tabBar.classList.remove('visible'), 600);
    });
}

// Update dock visibility on page transitions
function updateDockVisibility(pageId) {
    const tabBar = document.getElementById('main-tab-bar');
    if (!tabBar) return;
    if (pageId === 'page-home') {
        tabBar.classList.add('visible');
    } else {
        tabBar.classList.remove('visible');
    }
}

/* ============================================================
   1. Robot Panel — hooks into RobotServiceMock + Voice
   ============================================================ */
function initRobotPanel() {
    const toggle = document.getElementById('robot-toggle');
    const panel = document.getElementById('robot-panel');

    if (toggle && panel) {
        toggle.addEventListener('click', () => panel.classList.toggle('collapsed'));
    }

    // Listen to state changes
    robotService.onStateChange((state, old, expr) => updateRobotUI(state, expr));

    // Initial UI
    updateRobotUI(robotService.state, robotService.getExpression());
}

function updateRobotUI(state, expr) {
    // Update all robot bodies (iPad chat + iPhone)
    document.querySelectorAll('.robot-body').forEach(body => {
        body.setAttribute('data-eyes', expr.eyes);
        body.setAttribute('data-wings', expr.wings);
        if (!robotService.isSpeaking) {
            body.setAttribute('data-mouth', expr.mouth);
        }
    });

    // Update all status indicators
    document.querySelectorAll('.status-led').forEach(led => {
        led.style.background = expr.color;
        led.style.boxShadow = `0 0 6px ${expr.color}`;
    });
    document.querySelectorAll('[id^="status-text"]').forEach(el => {
        el.textContent = `${expr.emoji} ${expr.label}`;
    });
    document.querySelectorAll('.robot-status-badge').forEach(badge => {
        badge.style.background = expr.bgColor;
        badge.style.color = expr.color;
    });
}

/** Say something with voice + mouth animation */
function robotSay(msg, onEnd) {
    robotService.speak(msg, onEnd);

    // Push chat bubble to iPad chat panel
    const chatBubbles = document.getElementById('chat-bubbles');
    if (chatBubbles) {
        const bubble = document.createElement('div');
        bubble.className = 'chat-bubble bot';
        bubble.textContent = msg;
        chatBubbles.appendChild(bubble);
        chatBubbles.scrollTop = chatBubbles.scrollHeight;
    }
}

/* ============================================================
   2. Navigation
   ============================================================ */
let selectedColorData = null;

function initNavigation() {
    document.querySelectorAll('[data-target]').forEach(btn => {
        btn.addEventListener('click', () => navigateTo(btn.dataset.target));
    });

    const startBtn = document.getElementById('btn-start-course');
    if (startBtn) {
        const startHandler = () => {
            console.log('[NAV] Start course clicked');
            robotService.startCourseSequence({
                onTeaching() { /* state machine handles speech */ },
                onWaitingInput() { /* state machine handles speech */ },
                onDone() { /* state machine handles speech */ }
            });
            setTimeout(() => navigateTo('page-stage1'), 1200);
        };
        startBtn.addEventListener('click', startHandler);
    }

    // Shape course start (homepage + basic page)
    document.querySelectorAll('#btn-start-shape, #btn-start-shape-basic').forEach(btn => {
        btn.addEventListener('click', () => {
            console.log('[NAV] Shape course clicked');
            robotSay('好的！让我们一起来探索形状的秘密吧～ 🔺⚪▢');
            setTimeout(() => navigateTo('page-shape1'), 1200);
        });
    });

    // Basic page color course button
    const basicCourseBtn = document.getElementById('btn-start-course-basic');
    if (basicCourseBtn) {
        basicCourseBtn.addEventListener('click', () => {
            robotService.startCourseSequence({
                onTeaching() { },
                onWaitingInput() { },
                onDone() { }
            });
            setTimeout(() => navigateTo('page-stage1'), 1200);
        });
    }

    document.getElementById('btn-submit')?.addEventListener('click', () => submitArtwork());
    document.getElementById('btn-share')?.addEventListener('click', () => generateShareCard());

    // Universal tab map (tab name → page ID)
    const tabMap = {
        home: 'page-home',
        basic: 'page-basic',
        theme: 'page-theme',
        wiki: 'page-wiki',
        profile: 'page-profile',
        portfolio: 'page-profile',
        community: 'page-profile'
    };

    // Bottom tab bar
    document.querySelectorAll('#main-tab-bar .tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tabMap[tab.dataset.tab];
            if (target) navigateTo(target);
        });
    });

    // All dashboard [data-tab] elements (top nav, tiles, blocks, banners)
    document.querySelectorAll('[data-tab]').forEach(el => {
        if (el.closest('#main-tab-bar')) return; // skip bottom tabs (already handled)
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            const target = tabMap[el.dataset.tab];
            if (target) navigateTo(target);
        });
    });
}

function navigateTo(pageId) {
    const current = document.querySelector('.page.active');
    const next = document.getElementById(pageId);
    if (!next || current === next) return;

    current.classList.add('exit-left');
    current.classList.remove('active');

    setTimeout(() => {
        current.classList.remove('exit-left');
        next.classList.add('active');
        next.scrollTo(0, 0);

        // Sync tab bar active state
        const tabMap = {
            'page-home': 'home',
            'page-basic': 'basic',
            'page-theme': 'theme',
            'page-wiki': 'wiki',
            'page-profile': 'profile'
        };
        const tabName = tabMap[pageId];
        if (tabName) {
            document.querySelectorAll('#main-tab-bar .tab').forEach(t => t.classList.remove('active'));
            const activeTab = document.querySelector(`#main-tab-bar .tab[data-tab="${tabName}"]`);
            if (activeTab) activeTab.classList.add('active');
        }

        // Update dock visibility for this page
        updateDockVisibility(pageId);

        if (pageId === 'page-stage5') {
            setTimeout(() => drawRadarChart(), 300);
        }
    }, 250);
}

/* ============================================================
   3. Stage 1 — Color Wheel
   ============================================================ */
const colorData = [
    { name: '红色', color: '#D94F4F', emoji: '❤️', emotions: '热情 / 力量 / 兴奋', robot: '你选了红色！感觉今天充满热情和能量呢！红色就像燃烧的火焰～' },
    { name: '橙色', color: '#E88A3E', emoji: '🧡', emotions: '温暖 / 活力 / 快乐', robot: '橙色代表温暖和快乐！看来你今天心情不错呀～' },
    { name: '黄色', color: '#E8C83E', emoji: '💛', emotions: '明亮 / 开心 / 希望', robot: '黄色像阳光一样明亮！你今天一定很开朗吧～' },
    { name: '绿色', color: '#5E9E6E', emoji: '💚', emotions: '平和 / 自然 / 生长', robot: '绿色好治愈呀！像森林和草地的颜色～' },
    { name: '蓝色', color: '#4F7FBF', emoji: '💙', emotions: '安静 / 沉思 / 宁静', robot: '你选了蓝色！蓝色让人想到天空和大海，真美呀～' },
    { name: '紫色', color: '#8B6FBF', emoji: '💜', emotions: '神秘 / 想象 / 梦幻', robot: '紫色好梦幻！你是不是在想一些很有创意的事情呢？' },
    { name: '粉红', color: '#D97FAE', emoji: '💗', emotions: '甜蜜 / 柔和 / 关爱', robot: '粉色代表温柔和爱！你的心一定很温暖哦～' },
    { name: '青色', color: '#4FB0A2', emoji: '💎', emotions: '清新 / 自由 / 灵动', robot: '青色像清澈的溪流！让人感到自由和清爽呢～' },
    { name: '珊瑚', color: '#E8736C', emoji: '🌺', emotions: '温馨 / 浪漫 / 热烈', robot: '珊瑚色好浪漫！充满了温馨的气息呢～' },
    { name: '靛蓝', color: '#3D5A99', emoji: '🔮', emotions: '深沉 / 智慧 / 宇宙', robot: '靛蓝色很有深度！你一定是个很有智慧的小朋友～' },
    { name: '薄荷', color: '#7ECFB3', emoji: '🍃', emotions: '清凉 / 舒适 / 纯净', robot: '薄荷绿好清爽！让人感到身心舒适呢～' },
    { name: '琥珀', color: '#FFBF00', emoji: '✨', emotions: '珍贵 / 光辉 / 温暖', robot: '琥珀色散发着温暖的光辉！像宝石一样珍贵呢～' },
];

function initColorWheel() {
    const container = document.getElementById('fibonacci-spiral');
    if (!container) return;

    colorData.forEach((d, i) => {
        const block = document.createElement('div');
        block.className = 'fib-block';
        block.style.background = `linear-gradient(180deg, ${d.color}, ${adjustColorBrightness(d.color, -35)})`;

        block.innerHTML = `<span class="fib-emoji">${d.emoji}</span><span class="fib-name">${d.name}</span>`;

        // Staggered entrance from center outward
        const centerIdx = Math.floor(colorData.length / 2);
        const distFromCenter = Math.abs(i - centerIdx);
        const delay = distFromCenter * 80 + 100;

        // Click handler
        block.addEventListener('click', () => {
            selectedColorData = d;
            showColorFeedback(d);
            robotService.transitionTo('waiting_input');
            robotSay(d.robot);
        });

        container.appendChild(block);

        // Trigger entrance
        setTimeout(() => {
            block.style.animation = `fibSpiralIn 0.6s cubic-bezier(0.25, 1, 0.5, 1) ${delay}ms both`;
            setTimeout(() => block.classList.add('visible'), delay + 600);
        }, 50);
    });
}

// Helper for color darkening in spiral blocks
function adjustColorBrightness(hex, amount) {
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);
    r = Math.max(0, Math.min(255, r + amount));
    g = Math.max(0, Math.min(255, g + amount));
    b = Math.max(0, Math.min(255, b + amount));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function showColorFeedback(d) {
    const fb = document.getElementById('color-feedback');
    document.getElementById('cf-swatch').style.background = d.color;
    document.getElementById('cf-name').textContent = `${d.emoji} ${d.name} — ${d.emotions}`;
    document.getElementById('cf-desc').textContent = d.robot;
    fb.style.display = 'block';

    document.getElementById('btn-to-s2').style.display = 'block';
    const face = document.getElementById('s1-face');
    if (face) face.textContent = '🥰';
}

/* ============================================================
   4. Stage 2 — Card Wall & Quiz (with Famous Paintings)
   ============================================================ */
const cardInfo = [
    {
        name: '红色', bg: '#D94F4F', emoji: '🔴',
        emo: '热情与力量',
        painting: 'painting-red.png',
        artTitle: '罗斯科《红色色域》',
        desc: '马克·罗斯科用大面积的深红和猩红色块，表达内心炽热的激情。看到满眼的红色，你是不是也感觉心跳加速了呢？',
        voice: '这是罗斯科的红色色域画！看，整幅画都是火焰一样的红色、深红和鲜红。红色是最有力量的颜色，看到它会让人心跳加速，充满能量！'
    },
    {
        name: '黄色', bg: '#E8C83E', emoji: '🟡',
        emo: '快乐与希望',
        painting: 'painting-yellow.png',
        artTitle: '克里姆特风格《金色旋涡》',
        desc: '灵感来自克里姆特的黄金时期，金色的螺旋和温暖的琥珀色交织出阳光般的快乐和希望。',
        voice: '看这幅金灿灿的画！它的灵感来自克里姆特的黄金时期。满满的金色螺旋，就像温暖的阳光把快乐撒满了整个画面！黄色让人感到开心和充满希望。'
    },
    {
        name: '蓝色', bg: '#4F7FBF', emoji: '🔵',
        emo: '宁静与沉思',
        painting: 'painting-blue.png',
        artTitle: '梵高《星月夜》风格',
        desc: '灵感来自梵高的《星月夜》，深邃的蓝色旋涡和夜空中微弱的星光，让人沉浸在宁静和沉思之中。',
        voice: '这幅画的灵感来自梵高的星月夜！看那深蓝色的漩涡和闪烁的星光。蓝色让人想到夜空和大海，是一种安静、沉思的颜色，让心慢慢平静下来。'
    },
    {
        name: '绿色', bg: '#5E9E6E', emoji: '🟢',
        emo: '自然与和谐',
        painting: 'painting-green.png',
        artTitle: '莫奈《睡莲》风格',
        desc: '灵感来自莫奈的睡莲系列，翠绿的池塘、粉色的莲花和倒映的柳荫，散发着大自然的和谐之美。',
        voice: '看，这是莫奈睡莲风格的画！满眼的绿色，有翠绿的荷叶、粉色的莲花，还有水面上柳树的倒影。绿色代表大自然和生命，让人感到放松和平静。'
    },
    {
        name: '紫色', bg: '#8B6FBF', emoji: '🟣',
        emo: '神秘与想象',
        painting: 'painting-purple.png',
        artTitle: '康定斯基风格《紫色幻想》',
        desc: '灵感来自康定斯基的抽象作品和莫奈的紫藤，紫色和薰衣草色的流动形态，如同梦境般神秘而富有想象力。',
        voice: '哇，好梦幻的紫色！这幅画灵感来自康定斯基的抽象画。薰衣草和深紫色交织在一起，像是走进了一个神秘的梦境。紫色能激发我们的想象力呢！'
    },
    {
        name: '粉红', bg: '#D97FAE', emoji: '💗',
        emo: '温柔与甜蜜',
        painting: 'painting-pink.png',
        artTitle: '奥基弗风格《玫瑰花瓣》',
        desc: '灵感来自奥基弗的花朵特写，粉色和玫瑰色的柔美花瓣层层叠叠，传递温柔与甜蜜的情感。',
        voice: '多美的粉色花朵呀！这幅画灵感来自奥基弗的玫瑰花特写。柔柔的粉色花瓣一层一层，就像温柔的拥抱。粉色代表甜蜜和关爱呢！'
    },
];

let flippedCount = 0;

function initCardWall() {
    const wall = document.getElementById('card-wall');
    if (!wall) return;

    cardInfo.forEach(c => {
        const card = document.createElement('div');
        card.className = 'color-card';
        // Glassmorphism card inspired by Uiverse.io design
        card.innerHTML = `
            <div class="card-inner">
                <div class="card-front">
                    <!-- Layer 1: Colored background shape -->
                    <div class="glass-bg-layer" style="background:${c.bg}">
                        <div class="glass-bg-shape" style="background:#222"></div>
                    </div>
                    <!-- Layer 2: Spinning gradient + backdrop blur -->
                    <div class="glass-blur-layer">
                        <div class="glass-spinner" style="background:linear-gradient(135deg, ${c.bg}, ${c.bg}88, #ffd17055)"></div>
                    </div>
                    <!-- Layer 3: Glassmorphic text overlay -->
                    <div class="glass-overlay">
                        <div class="glass-info-panel">
                            <span class="glass-title">${c.name}</span>
                            <span class="glass-sub">${c.emo}</span>
                            <div class="glass-hint">点击翻转 ✨</div>
                        </div>
                        <div class="glass-side">
                            <span class="glass-emoji">${c.emoji}</span>
                            <div class="glass-arrow-btn">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" width="16" height="16">
                                    <path d="M4.646 2.146a.5.5 0 0 0 0 .708L7.793 6L4.646 9.146a.5.5 0 1 0 .708.708l3.5-3.5a.5.5 0 0 0 0-.708l-3.5-3.5a.5.5 0 0 0-.708 0z" fill="currentColor"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="card-back">
                    <div class="card-painting">
                        <img src="${c.painting}" alt="${c.artTitle}">
                    </div>
                    <div class="card-art-info">
                        <h4>${c.artTitle}</h4>
                        <p class="card-emo-tag" style="color:${c.bg}">${c.emo}</p>
                        <p class="card-desc">${c.desc}</p>
                    </div>
                </div>
            </div>`;
        card.addEventListener('click', () => {
            if (!card.classList.contains('flipped')) {
                card.classList.add('flipped');
                flippedCount++;
                // Every card flip triggers voice narration!
                robotSay(c.voice);
                if (flippedCount >= 4) setTimeout(showQuiz, 3000);
            }
        });
        wall.appendChild(card);
    });
}

function showQuiz() {
    const q = document.getElementById('quiz-section');
    if (q.style.display === 'block') return;
    q.style.display = 'block';
    q.scrollIntoView({ behavior: 'smooth' });

    document.getElementById('quiz-art').textContent = '🌙';
    document.getElementById('quiz-q').textContent = '你觉得这幅画表达了什么情绪？';

    const opts = [
        { text: '😄 快乐和兴奋', correct: false },
        { text: '🌙 宁静与忧郁', correct: true },
        { text: '😡 愤怒和激动', correct: false },
    ];

    const container = document.getElementById('quiz-opts');
    container.innerHTML = '';
    opts.forEach(o => {
        const btn = document.createElement('button');
        btn.className = 'quiz-opt';
        btn.textContent = o.text;
        btn.addEventListener('click', () => handleQuizAnswer(btn, o.correct));
        container.appendChild(btn);
    });

    robotSay('来玩个猜猜看吧！看看星月夜表达了什么情绪？');
}

function handleQuizAnswer(btn, correct) {
    document.querySelectorAll('.quiz-opt').forEach(b => b.style.pointerEvents = 'none');

    if (correct) {
        btn.classList.add('correct');
        document.getElementById('quiz-result').style.display = 'block';
        document.getElementById('quiz-result').textContent =
            '太棒了！🎉 梵高的《星月夜》用深蓝色的旋涡表达了他内心的宁静与忧郁，那些流动的星光就像安静夜晚的低语～';
        launchConfetti();
        document.getElementById('btn-to-s3').style.display = 'block';
        robotService.transitionTo('done');
        robotSay('答对啦！你已经开始理解色彩的情绪了！太棒了！');
    } else {
        btn.classList.add('wrong');
        robotSay('再想想看哦，深蓝色通常让人感到什么呢？');
    }
}

/* ============================================================
   5. Stage 3 — Drawing Canvas
   ============================================================ */
const paletteColors = ['#D94F4F', '#E88A3E', '#E8C83E', '#5E9E6E', '#4FB0A2', '#4F7FBF', '#8B6FBF', '#D97FAE', '#2a2623', '#FFFFFF'];
const inspirations = [
    '⭐ 用黄色画出闪闪发光的星星',
    '🌊 用蓝色画一片安静的海洋',
    '🌿 用绿色画一片生机盎然的森林',
    '🌅 用橙色画一个温暖的夕阳',
    '🌸 用粉色画你最喜欢的花',
];

let isDrawing = false, currentColor = '#D94F4F', brushSize = 8, tool = 'brush';
let drawHistory = [], currentPath = [];

function initCanvas() {
    const canvas = document.getElementById('drawing-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Palette
    const pal = document.getElementById('palette');
    paletteColors.forEach((c, i) => {
        const dot = document.createElement('div');
        dot.className = 'pal-dot' + (i === 0 ? ' active' : '');
        dot.style.background = c;
        if (c === '#FFFFFF') dot.style.border = '3px solid #ddd';
        dot.addEventListener('click', () => {
            document.querySelectorAll('.pal-dot').forEach(d => d.classList.remove('active'));
            dot.classList.add('active');
            currentColor = c;
            tool = 'brush';
            document.getElementById('t-brush').classList.add('active');
            document.getElementById('t-eraser').classList.remove('active');
        });
        pal.appendChild(dot);
    });

    // Inspirations
    const chips = document.getElementById('inspo-chips');
    inspirations.forEach(text => {
        const chip = document.createElement('span');
        chip.className = 'inspo-chip';
        chip.textContent = text;
        chips.appendChild(chip);
    });

    // Brush size
    const sizeSlider = document.getElementById('brush-size');
    sizeSlider.addEventListener('input', () => {
        brushSize = parseInt(sizeSlider.value);
        document.getElementById('size-label').textContent = brushSize + 'px';
    });

    // Tools
    document.getElementById('t-brush').addEventListener('click', () => {
        tool = 'brush';
        document.getElementById('t-brush').classList.add('active');
        document.getElementById('t-eraser').classList.remove('active');
    });

    document.getElementById('t-eraser').addEventListener('click', () => {
        tool = 'eraser';
        document.getElementById('t-eraser').classList.add('active');
        document.getElementById('t-brush').classList.remove('active');
    });

    document.getElementById('t-undo').addEventListener('click', undo);
    document.getElementById('t-clear').addEventListener('click', clearCanvas);

    // Resize
    const ro = new ResizeObserver(() => {
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        redrawHistory(ctx, canvas);
    });
    ro.observe(canvas.parentElement);

    // Drawing events
    canvas.addEventListener('mousedown', e => startDraw(e, canvas, ctx));
    canvas.addEventListener('mousemove', e => draw(e, canvas, ctx));
    canvas.addEventListener('mouseup', () => endDraw());
    canvas.addEventListener('mouseleave', () => endDraw());

    canvas.addEventListener('touchstart', e => { e.preventDefault(); startDraw(e.touches[0], canvas, ctx); }, { passive: false });
    canvas.addEventListener('touchmove', e => { e.preventDefault(); draw(e.touches[0], canvas, ctx); }, { passive: false });
    canvas.addEventListener('touchend', () => endDraw());
}

function getPos(e, canvas) {
    const r = canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left) * (canvas.width / r.width), y: (e.clientY - r.top) * (canvas.height / r.height) };
}

function startDraw(e, canvas, ctx) {
    isDrawing = true;
    currentPath = [];
    const p = getPos(e, canvas);
    currentPath.push(p);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
}

function draw(e, canvas, ctx) {
    if (!isDrawing) return;
    const p = getPos(e, canvas);
    currentPath.push(p);
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = tool === 'eraser' ? '#FFFFFF' : currentColor;
    ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
}

function endDraw() {
    if (!isDrawing) return;
    isDrawing = false;
    if (currentPath.length > 0) {
        drawHistory.push({ path: [...currentPath], color: currentColor, size: brushSize, tool });
    }
    currentPath = [];
}

function redrawHistory(ctx, canvas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawHistory.forEach(h => {
        ctx.beginPath();
        ctx.lineWidth = h.size;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = h.tool === 'eraser' ? '#FFFFFF' : h.color;
        ctx.globalCompositeOperation = h.tool === 'eraser' ? 'destination-out' : 'source-over';
        h.path.forEach((p, i) => { i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y); });
        ctx.stroke();
    });
    ctx.globalCompositeOperation = 'source-over';
}

function undo() {
    drawHistory.pop();
    const canvas = document.getElementById('drawing-canvas');
    redrawHistory(canvas.getContext('2d'), canvas);
}

function clearCanvas() {
    drawHistory = [];
    const canvas = document.getElementById('drawing-canvas');
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
}

/* ============================================================
   6. Stage 4 — Submit & AI Review
   ============================================================ */
function submitArtwork() {
    navigateTo('page-stage4');
    robotService.transitionTo('teaching');
    robotSay('让我仔细分析你的作品，请稍等一下哦！');

    const canvas = document.getElementById('drawing-canvas');
    const scan = document.getElementById('scan-art');
    scan.innerHTML = '';
    const img = new Image();
    img.src = canvas.toDataURL();
    img.style.maxWidth = '100%';
    img.style.maxHeight = '100%';
    scan.appendChild(img);

    setTimeout(() => {
        document.getElementById('scan-zone').style.display = 'none';
        const rv = document.getElementById('review-zone');
        rv.style.display = 'block';

        const ra = document.getElementById('review-art');
        ra.innerHTML = '';
        const img2 = img.cloneNode();
        img2.style.maxWidth = '100%';
        img2.style.maxHeight = '100%';
        ra.appendChild(img2);

        fillReview();
        robotService.transitionTo('done');
        robotSay('哇！你的作品太棒了！看看我的发现吧！');

        setTimeout(() => {
            document.getElementById('btn-animate-art').style.display = 'block';
            document.getElementById('btn-to-s5').style.display = 'block';
        }, 1500);
    }, 3000);
}

function analyzeColors() {
    const canvas = document.getElementById('drawing-canvas');
    const ctx = canvas.getContext('2d');
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let warm = 0, cool = 0, purple = 0, neutral = 0, total = 0;
    for (let i = 0; i < data.length; i += 16) {
        const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
        if (a < 50) continue;
        total++;
        if (r > 150 && g < 130 && b < 130) warm++;
        else if (b > 140 && r < 140) cool++;
        else if (r > 100 && b > 100 && g < 120) purple++;
        else neutral++;
    }
    if (total === 0) total = 1;
    return { warm: warm / total, cool: cool / total, purple: purple / total, neutral: neutral / total };
}

function fillReview() {
    const ca = analyzeColors();

    const chart = document.getElementById('rv-chart');
    chart.innerHTML = '';
    const bars = [
        { w: Math.max(ca.warm * 100, 5), color: '#D94F4F' },
        { w: Math.max(ca.cool * 100, 5), color: '#4F7FBF' },
        { w: Math.max(ca.purple * 100, 5), color: '#8B6FBF' },
        { w: Math.max(ca.neutral * 100, 5), color: '#ccc' },
    ];
    bars.forEach(b => {
        const bar = document.createElement('div');
        bar.className = 'rv-bar';
        bar.style.width = b.w + '%';
        bar.style.background = b.color;
        chart.appendChild(bar);
    });

    let dominant = '暖色';
    if (ca.cool > ca.warm && ca.cool > ca.purple) dominant = '冷色';
    else if (ca.purple > ca.warm && ca.purple > ca.cool) dominant = '紫色';
    document.getElementById('rv-color-t').textContent =
        `你使用了很多${dominant}调，画面${dominant === '暖色' ? '充满了活力和热情' : '充满了梦幻和温柔的气息'}！`;

    const tags = document.getElementById('rv-tags');
    const emotionTags = selectedColorData ? selectedColorData.emotions.split(' / ') : ['安静', '自由', '想象'];
    tags.innerHTML = '';
    const tagColors = ['var(--candy-peach)', 'var(--candy-sky)', 'var(--candy-lilac)', 'var(--candy-pink)'];
    emotionTags.forEach((t, i) => {
        const span = document.createElement('span');
        span.className = 'rv-tag';
        span.textContent = t;
        span.style.background = tagColors[i % tagColors.length];
        span.style.color = '#fff';
        tags.appendChild(span);
    });
    document.getElementById('rv-emo-t').textContent =
        `从你的画作中，AI 感受到了${emotionTags.join('和')}的情绪。你用色彩成功地表达了自己的内心感受，非常棒！`;

    document.getElementById('rv-stars').textContent = '⭐⭐⭐⭐⭐';
    document.getElementById('rv-cre-t').textContent = '你的色彩搭配非常独特有创意！大胆的用色展现了你丰富的想象力～';

    const badges = document.getElementById('rv-badges');
    badges.innerHTML = '';
    ['🎨 色彩感知力 +1', '🧠 情感表达力 +1'].forEach(t => {
        const b = document.createElement('span');
        b.className = 'rv-badge-item';
        b.textContent = t;
        badges.appendChild(b);
    });
    document.getElementById('rv-think-t').textContent =
        '你不仅学会了色彩与情绪的关系，还能有意识地选择颜色来表达自己的感受，这就是设计思维的第一步！';
}

/* ============================================================
   6b. Artwork 3D Animation — Post AI Review
   Takes the drawing and renders it in a rotating 3D canvas
   + syncs to robot screen
   ============================================================ */
document.getElementById('btn-animate-art')?.addEventListener('click', animateArtwork3D);

let art3DAnimId = null;

function animateArtwork3D() {
    const srcCanvas = document.getElementById('drawing-canvas');
    if (!srcCanvas) return;

    // Show container
    const container = document.getElementById('artwork-3d-container');
    container.style.display = 'block';
    container.scrollIntoView({ behavior: 'smooth' });

    const canvas = document.getElementById('artwork-3d-canvas');
    const ctx = canvas.getContext('2d');

    // Set canvas size
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Capture artwork as image
    const artImg = new Image();
    artImg.src = srcCanvas.toDataURL();

    // Particles around artwork
    const sparkles = [];
    const colors = ['#F47B7B', '#F9A87C', '#F7E06B', '#8DD88C', '#7DD8C2', '#7BBDE8', '#B8A0E8', '#F78CA8'];
    for (let i = 0; i < 30; i++) {
        sparkles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: 2 + Math.random() * 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            vx: (Math.random() - 0.5) * 1.5,
            vy: (Math.random() - 0.5) * 1.5,
            phase: Math.random() * Math.PI * 2,
        });
    }

    // Mouse parallax
    let mouseX = 0, mouseY = 0;
    container.addEventListener('mousemove', e => {
        const r = container.getBoundingClientRect();
        mouseX = (e.clientX - r.left - r.width / 2) / r.width;
        mouseY = (e.clientY - r.top - r.height / 2) / r.height;
    });

    let t = 0;
    robotSay('噗噗把你的画变成3D动画啦！看看有多炫酷！');

    // Sync to robot screen
    const robotFace = document.querySelector('.robot-face-screen');

    function render() {
        t += 0.015;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Background gradient
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const bg = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2);
        bg.addColorStop(0, isDark ? '#1a1a2e' : '#f5f0e8');
        bg.addColorStop(1, isDark ? '#0f0f19' : '#e8e0d4');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Floating sparkles (background)
        sparkles.forEach(s => {
            s.x += s.vx;
            s.y += s.vy;
            if (s.x < 0 || s.x > canvas.width) s.vx *= -1;
            if (s.y < 0 || s.y > canvas.height) s.vy *= -1;
            const alpha = 0.4 + 0.3 * Math.sin(t * 3 + s.phase);
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            ctx.fillStyle = s.color;
            ctx.fill();
        });
        ctx.globalAlpha = 1;

        // 3D rotated artwork
        const artW = canvas.width * 0.55;
        const artH = canvas.height * 0.7;
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;

        // Rotation angles
        const rotY = Math.sin(t * 0.8) * 15 + mouseX * 20; // degrees
        const rotX = Math.cos(t * 0.6) * 8 + mouseY * 15;
        const floatY = Math.sin(t * 1.2) * 8;

        ctx.save();
        ctx.translate(cx, cy + floatY);

        // Simulate 3D perspective with skew
        const scaleX = Math.cos(rotY * Math.PI / 180);
        const skewY = Math.sin(rotY * Math.PI / 180) * 0.15;
        const scaleY = Math.cos(rotX * Math.PI / 180);
        const skewX = Math.sin(rotX * Math.PI / 180) * 0.1;

        ctx.transform(scaleX, skewX, skewY, scaleY, 0, 0);

        // Shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
        ctx.shadowBlur = 30;
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 15;

        // Draw artwork with rounded corners
        const rx = -artW / 2, ry = -artH / 2;
        const cr = 16;
        ctx.beginPath();
        ctx.moveTo(rx + cr, ry);
        ctx.lineTo(rx + artW - cr, ry);
        ctx.quadraticCurveTo(rx + artW, ry, rx + artW, ry + cr);
        ctx.lineTo(rx + artW, ry + artH - cr);
        ctx.quadraticCurveTo(rx + artW, ry + artH, rx + artW - cr, ry + artH);
        ctx.lineTo(rx + cr, ry + artH);
        ctx.quadraticCurveTo(rx, ry + artH, rx, ry + artH - cr);
        ctx.lineTo(rx, ry + cr);
        ctx.quadraticCurveTo(rx, ry, rx + cr, ry);
        ctx.closePath();
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.clip();

        // Draw the actual artwork
        if (artImg.complete) {
            ctx.drawImage(artImg, rx + 4, ry + 4, artW - 8, artH - 8);
        }

        // Glossy overlay
        const gloss = ctx.createLinearGradient(rx, ry, rx, ry + artH);
        gloss.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
        gloss.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
        gloss.addColorStop(1, 'rgba(0, 0, 0, 0.05)');
        ctx.fillStyle = gloss;
        ctx.fillRect(rx, ry, artW, artH);

        ctx.restore();

        // Sync miniature to robot screen
        if (robotFace) {
            const miniCanvas = document.createElement('canvas');
            miniCanvas.width = 60;
            miniCanvas.height = 60;
            const mctx = miniCanvas.getContext('2d');
            mctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, 60, 60);
            robotFace.style.backgroundImage = `url(${miniCanvas.toDataURL()})`;
            robotFace.style.backgroundSize = 'cover';
        }

        art3DAnimId = requestAnimationFrame(render);
    }

    // Cancel any existing animation
    if (art3DAnimId) cancelAnimationFrame(art3DAnimId);
    render();

    // Hide button after click
    document.getElementById('btn-animate-art').style.display = 'none';
}

/* ============================================================
   7. Stage 5 — Radar Chart & Share
   ============================================================ */
function drawRadarChart() {
    const canvas = document.getElementById('radar-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    const cx = w / 2, cy = h / 2, maxR = Math.min(w, h) / 2 - 40;

    ctx.clearRect(0, 0, w, h);

    const labels = ['色彩感知', '造型能力', '创意思维', '观察力', '表达力'];
    const base = [0.45, 0.35, 0.4, 0.3, 0.38];
    const after = [0.85, 0.55, 0.75, 0.6, 0.8];
    const n = labels.length;

    // Grid
    for (let lv = 1; lv <= 4; lv++) {
        ctx.beginPath();
        const r = maxR * (lv / 4);
        for (let i = 0; i <= n; i++) {
            const a = (i / n) * Math.PI * 2 - Math.PI / 2;
            const x = cx + r * Math.cos(a), y = cy + r * Math.sin(a);
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.strokeStyle = 'rgba(125,216,194,0.25)';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    // Axes
    labels.forEach((l, i) => {
        const a = (i / n) * Math.PI * 2 - Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + maxR * Math.cos(a), cy + maxR * Math.sin(a));
        ctx.strokeStyle = 'rgba(125,216,194,0.15)';
        ctx.stroke();

        const lx = cx + (maxR + 22) * Math.cos(a), ly = cy + (maxR + 22) * Math.sin(a);
        ctx.font = 'bold 11px "Noto Sans SC"';
        ctx.fillStyle = '#5A5047';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(l, lx, ly);
    });

    function drawPoly(vals, fill, stroke) {
        ctx.beginPath();
        vals.forEach((v, i) => {
            const a = (i / n) * Math.PI * 2 - Math.PI / 2;
            const x = cx + maxR * v * Math.cos(a), y = cy + maxR * v * Math.sin(a);
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    drawPoly(base, 'rgba(200,190,180,0.15)', 'rgba(200,190,180,0.4)');
    drawPoly(after, 'rgba(125,216,194,0.25)', 'rgba(91,196,168,0.7)');

    // Dots
    after.forEach((v, i) => {
        const a = (i / n) * Math.PI * 2 - Math.PI / 2;
        ctx.beginPath();
        ctx.arc(cx + maxR * v * Math.cos(a), cy + maxR * v * Math.sin(a), 4, 0, Math.PI * 2);
        ctx.fillStyle = '#5BC4A8';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
    });
}

function generateShareCard() {
    const canvas = document.getElementById('drawing-canvas');
    const art = document.getElementById('share-art');
    art.innerHTML = '';
    if (canvas) {
        const img = new Image();
        img.src = canvas.toDataURL();
        img.style.maxWidth = '100%';
        img.style.maxHeight = '100%';
        art.appendChild(img);
    }

    const color = selectedColorData || colorData[4];
    document.getElementById('share-quote').textContent =
        `"${color.name}让我感到${color.emotions.split(' / ')[0]}" —— 来自小艺术家的色彩日记`;

    launchConfetti();
    robotSay('分享卡片生成成功！快给爸爸妈妈看看吧！');
}

/* ============================================================
   8. Confetti — Candy Colored
   ============================================================ */
function launchConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const candyColors = ['#7DD8C2', '#F9A87C', '#F7E06B', '#7BBDE8', '#B8A0E8', '#F78CA8', '#8DD88C', '#F47B7B'];
    const pieces = Array.from({ length: 80 }, () => ({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * 100,
        w: 6 + Math.random() * 6,
        h: 4 + Math.random() * 4,
        color: candyColors[Math.floor(Math.random() * candyColors.length)],
        vx: (Math.random() - 0.5) * 3,
        vy: 2 + Math.random() * 3,
        rot: Math.random() * 360,
        rv: (Math.random() - 0.5) * 8,
    }));

    let frame = 0;
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        pieces.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.rot += p.rv;
            p.vy += 0.05;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot * Math.PI / 180);
            ctx.fillStyle = p.color;
            // Mix shapes: rect and circle
            if (Math.random() > 0.5) {
                ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            } else {
                ctx.beginPath();
                ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        });
        frame++;
        if (frame < 120) requestAnimationFrame(animate);
        else ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    animate();
}

/* ============================================================
   9. Rainbow Cursor Trail + Click Sparkles ✨
   ============================================================ */
(function initMagicEffects() {
    // Create overlay canvas for trail + sparkles
    const magicCanvas = document.createElement('canvas');
    magicCanvas.id = 'magic-canvas';
    magicCanvas.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        pointer-events: none; z-index: 9999;
    `;
    document.body.appendChild(magicCanvas);
    const ctx = magicCanvas.getContext('2d');

    function resize() {
        magicCanvas.width = window.innerWidth;
        magicCanvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // === Rainbow Trail ===
    const rainbowColors = [
        '#F47B7B', '#F9A87C', '#F7E06B', '#8DD88C',
        '#7DD8C2', '#7BBDE8', '#B8A0E8', '#F78CA8'
    ];
    const trail = []; // { x, y, age, colorIdx }
    let mouseX = -100, mouseY = -100;
    let colorIdx = 0;

    document.addEventListener('mousemove', e => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        trail.push({
            x: mouseX, y: mouseY,
            age: 0,
            color: rainbowColors[colorIdx % rainbowColors.length],
            size: 6 + Math.random() * 4
        });
        colorIdx++;
        // Keep trail manageable
        if (trail.length > 50) trail.shift();
    });

    // Touch support
    document.addEventListener('touchmove', e => {
        const t = e.touches[0];
        mouseX = t.clientX;
        mouseY = t.clientY;
        trail.push({
            x: mouseX, y: mouseY,
            age: 0,
            color: rainbowColors[colorIdx % rainbowColors.length],
            size: 6 + Math.random() * 4
        });
        colorIdx++;
        if (trail.length > 50) trail.shift();
    }, { passive: true });

    // === Click Sparkles ===
    const sparkles = []; // { x, y, vx, vy, age, type, color, char, size }
    const starChars = ['⭐', '✨', '🌟', '💫', '⭐'];

    document.addEventListener('click', e => {
        const cx = e.clientX, cy = e.clientY;
        // Spawn 12 stars + 20 confetti ribbons
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
            const speed = 3 + Math.random() * 5;
            sparkles.push({
                x: cx, y: cy,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 2,
                age: 0,
                maxAge: 40 + Math.random() * 30,
                type: 'star',
                char: starChars[Math.floor(Math.random() * starChars.length)],
                size: 12 + Math.random() * 10,
                rot: Math.random() * 360,
                rv: (Math.random() - 0.5) * 12,
            });
        }
        for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 6;
            sparkles.push({
                x: cx, y: cy,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 3,
                age: 0,
                maxAge: 50 + Math.random() * 30,
                type: 'ribbon',
                color: rainbowColors[Math.floor(Math.random() * rainbowColors.length)],
                w: 4 + Math.random() * 4,
                h: 8 + Math.random() * 8,
                rot: Math.random() * 360,
                rv: (Math.random() - 0.5) * 15,
            });
        }
    });

    // Touch click
    document.addEventListener('touchstart', e => {
        const t = e.touches[0];
        document.dispatchEvent(new MouseEvent('click', {
            clientX: t.clientX, clientY: t.clientY
        }));
    }, { passive: true });

    // === Animation Loop ===
    function animate() {
        ctx.clearRect(0, 0, magicCanvas.width, magicCanvas.height);

        // Draw rainbow trail
        for (let i = trail.length - 1; i >= 0; i--) {
            const p = trail[i];
            p.age++;
            const alpha = 1 - p.age / 30;
            if (alpha <= 0) { trail.splice(i, 1); continue; }
            const sz = p.size * alpha;
            ctx.beginPath();
            ctx.arc(p.x, p.y, sz, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = alpha * 0.6;
            ctx.fill();
            // Glow
            ctx.beginPath();
            ctx.arc(p.x, p.y, sz * 1.5, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = alpha * 0.15;
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Draw sparkles
        for (let i = sparkles.length - 1; i >= 0; i--) {
            const s = sparkles[i];
            s.age++;
            s.x += s.vx;
            s.y += s.vy;
            s.vy += 0.15; // gravity
            s.vx *= 0.98;
            s.rot += s.rv;

            const life = 1 - s.age / s.maxAge;
            if (life <= 0) { sparkles.splice(i, 1); continue; }

            ctx.save();
            ctx.translate(s.x, s.y);
            ctx.rotate(s.rot * Math.PI / 180);
            ctx.globalAlpha = life;

            if (s.type === 'star') {
                ctx.font = `${s.size * life}px serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(s.char, 0, 0);
            } else {
                // Ribbon
                ctx.fillStyle = s.color;
                ctx.fillRect(-s.w / 2, -s.h / 2, s.w, s.h * life);
            }
            ctx.restore();
        }
        ctx.globalAlpha = 1;

        requestAnimationFrame(animate);
    }
    animate();
})();
