/**
 * RobotServiceMock — 3D Cartoon World Edition
 * 状态机: idle → teaching → waiting_input → done
 * + 表情反馈 + 嘴巴动画 + Web Speech API 语音
 */
class RobotServiceMock {
    static STATES = {
        IDLE: 'idle',
        TEACHING: 'teaching',
        WAITING_INPUT: 'waiting_input',
        DONE: 'done'
    };

    static EXPRESSIONS = {
        idle: { emoji: '😊', label: '待机中', eyes: 'normal', mouth: 'smile', wings: 'idle', color: '#7DD8C2', bgColor: '#E8FFF5' },
        teaching: { emoji: '📖', label: '授课中', eyes: 'wide', mouth: 'open', wings: 'flap', color: '#F9A87C', bgColor: '#FFF3EC' },
        waiting_input: { emoji: '🤔', label: '等待输入', eyes: 'blink', mouth: 'smile', wings: 'wave', color: '#F7E06B', bgColor: '#FFFDE8' },
        done: { emoji: '🎉', label: '完成！', eyes: 'happy', mouth: 'happy', wings: 'celebrate', color: '#8DD88C', bgColor: '#EDFAED' },
    };

    constructor() {
        this.state = RobotServiceMock.STATES.IDLE;
        this.listeners = [];
        this.stateHistory = [];
        this.isSpeaking = false;
        this._initSpeech();
        this._logEntry('RobotServiceMock v2.0 (噗噗版) 初始化完成');
        this._logEntry(`状态: ${this.state}`);
    }

    /** 初始化 Web Speech API — 蓝精灵风格声音 */
    _initSpeech() {
        this.synth = window.speechSynthesis || null;
        this.voiceReady = false;
        this.selectedVoiceName = '';
        if (this.synth) {
            const loadVoices = () => {
                this.voices = this.synth.getVoices();
                // 优先选择最像蓝精灵的声音：高音女童声
                // macOS优先: Tingting(甜美童音) > Sinji(粤语高音) > 任意zh-CN
                const preferred = ['Tingting', 'Ting-Ting', 'Meijia', 'Sinji'];
                let best = null;
                for (const name of preferred) {
                    best = this.voices.find(v => v.name.includes(name));
                    if (best) break;
                }
                if (!best) best = this.voices.find(v => v.lang === 'zh-CN');
                if (!best) best = this.voices.find(v => v.lang.startsWith('zh'));
                this.zhVoice = best || null;
                this.selectedVoiceName = best ? best.name : '默认';
                if (this.voices.length > 0) this.voiceReady = true;
                this._logEntry(`🔊 声音引擎: ${this.selectedVoiceName} (蓝精灵模式)`);
            };
            loadVoices();
            this.synth.addEventListener('voiceschanged', loadVoices);
        }
    }

    /** 注册状态变化监听器 */
    onStateChange(fn) { this.listeners.push(fn); }

    /** 获取当前表情数据 */
    getExpression() { return RobotServiceMock.EXPRESSIONS[this.state]; }

    /** 切换状态 */
    setState(newState) {
        const old = this.state;
        this.state = newState;
        const expr = this.getExpression();
        this.stateHistory.push({ from: old, to: newState, time: Date.now() });
        this._logEntry(`状态切换: ${old} → ${newState} [${expr.label}]`);
        this.listeners.forEach(fn => fn(newState, old, expr));
    }

    /**
     * 语音说话 + 嘴巴动画
     * @param {string} text - 要说的文字
     * @param {function} onEnd - 说完后的回调
     */
    speak(text, onEnd) {
        // 更新 speech bubble
        const speechEl = document.getElementById('robot-speech');
        if (speechEl) speechEl.querySelector('p').textContent = text;

        // 嘴巴动画: 开始说话
        const body = document.querySelector('.robot-body');
        if (body) body.setAttribute('data-mouth', 'open');

        const voiceIndicator = document.getElementById('voice-indicator');
        if (voiceIndicator) voiceIndicator.classList.remove('silent');

        this.isSpeaking = true;

        if (this.synth && this.voiceReady) {
            // 取消之前的语音
            this.synth.cancel();

            const utter = new SpeechSynthesisUtterance(text);
            utter.lang = 'zh-CN';
            utter.rate = 0.95;  // 正常小男孩说话语速
            utter.pitch = 1.4;  // 偏高音调，小男孩自然童声
            utter.volume = 0.9;
            if (this.zhVoice) utter.voice = this.zhVoice;

            utter.onend = () => {
                this.isSpeaking = false;
                this._stopMouth();
                if (onEnd) onEnd();
            };

            utter.onerror = () => {
                this.isSpeaking = false;
                this._stopMouth();
                if (onEnd) onEnd();
            };

            this.synth.speak(utter);
            this._logEntry(`🗣️ 语音输出: "${text.substring(0, 20)}..."`);
        } else {
            // 无语音引擎时，用定时器模拟
            this._logEntry(`💬 文字输出 (无语音): "${text.substring(0, 20)}..."`);
            setTimeout(() => {
                this.isSpeaking = false;
                this._stopMouth();
                if (onEnd) onEnd();
            }, Math.min(text.length * 120, 4000));
        }
    }

    _stopMouth() {
        const body = document.querySelector('.robot-body');
        const expr = this.getExpression();
        if (body) body.setAttribute('data-mouth', expr.mouth);

        const voiceIndicator = document.getElementById('voice-indicator');
        if (voiceIndicator) voiceIndicator.classList.add('silent');
    }

    /**
     * 启动课程状态自动流转
     * idle → teaching(1.5s) → waiting_input(2s) → done(1.5s)
     */
    startCourseSequence(callbacks = {}) {
        this.setState(RobotServiceMock.STATES.TEACHING);
        this._logEntry('📡 STEP_STARTED: teaching');

        this.speak('噗噗正在为你准备色彩的情绪课程，稍等一下哦！', () => {
            if (callbacks.onTeaching) callbacks.onTeaching();

            setTimeout(() => {
                this._logEntry('✅ STEP_DONE: teaching complete');
                this.setState(RobotServiceMock.STATES.WAITING_INPUT);
                this._logEntry('📡 STEP_STARTED: waiting_input');

                this.speak('准备好啦！选一个你喜欢的颜色，告诉噗噗你今天的心情吧！', () => {
                    if (callbacks.onWaitingInput) callbacks.onWaitingInput();

                    setTimeout(() => {
                        this._logEntry('✅ STEP_DONE: input received');
                        this.setState(RobotServiceMock.STATES.DONE);
                        this._logEntry('📡 STEP_DONE: course_ready 🎉');

                        this.speak('噗噗准备好啦！我们一起来探索色彩的奇妙世界吧！', () => {
                            if (callbacks.onDone) callbacks.onDone();
                        });
                    }, 800);
                });
            }, 500);
        });
    }

    /** 快速切换到指定状态 */
    transitionTo(state, delayMs = 0) {
        if (delayMs > 0) {
            setTimeout(() => this.setState(state), delayMs);
        } else {
            this.setState(state);
        }
    }

    /** 重置 */
    reset() {
        if (this.synth) this.synth.cancel();
        this.setState(RobotServiceMock.STATES.IDLE);
        this._logEntry('🔄 RobotService 已重置');
    }

    _logEntry(msg) {
        const now = new Date();
        const t = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
        console.log(`[Robot ${t}] ${msg}`);

        const logEl = document.getElementById('robot-log');
        if (logEl) {
            const div = document.createElement('div');
            div.className = 'log-entry new';
            div.innerHTML = `<span class="log-time">${t}</span> <span class="log-msg">${msg}</span>`;
            logEl.prepend(div);
            while (logEl.children.length > 15) logEl.removeChild(logEl.lastChild);
        }
    }
}

// 全局实例
window.robotService = new RobotServiceMock();
