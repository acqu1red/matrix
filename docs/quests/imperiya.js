// --- 
// --- Глобальные переменные и константы ---
// ---

const TWebApp = window.Telegram?.WebApp;
const SAVE_KEY = 'empire-save-v1';
const TOTAL_STEPS = 4; // Не считая приветствие и финал

const DOM = {
    container: document.querySelector('.game-container'),
    screens: document.getElementById('game-screens'),
    allScreens: document.querySelectorAll('.game-screen'),
    nav: {
        prev: document.getElementById('prev-step'),
        next: document.getElementById('next-step'),
    },
    topBar: {
        progress: document.querySelector('.progress-bar'),
        influence: document.getElementById('influence-score'),
        trust: document.getElementById('trust-score'),
        backButton: document.querySelector('.back-button'),
    },
    welcome: {
        startNew: document.getElementById('start-new-game'),
        continueGame: document.getElementById('continue-game'),
    },
    final: {
        canvas: document.getElementById('confetti-canvas'),
        influence: document.getElementById('final-influence'),
        trust: document.getElementById('final-trust'),
        revenue: document.getElementById('final-revenue'),
        restart: document.getElementById('restart-game'),
        share: document.getElementById('share-results'),
    },
    toasts: document.getElementById('toast-container'),
    tooltip: document.getElementById('tooltip-overlay'),
};

// ---
// --- Состояние игры (State Machine) ---
// ---

let gameState = {};

function getDefaultState() {
    return {
        currentStep: 0,
        scores: {
            influence: 0,
            trust: 50,
        },
        resources: {
            time: 10,
            ideas: 5,
            energy: 8,
            budget: 1000,
            totalRevenue: 0,
        },
        stage1: {
            audience: null,
            platform: null,
            value: null,
        },
        stage2: {
            triggers: [],
            hook: '',
        },
        stage3: {
            headline: 'Вот как получить [результат] за [срок] без [боль]',
            techniques: {
                authority: 'manipulative',
                scarcity: 'manipulative',
                social_proof: 'manipulative',
            },
        },
        stage4: {
            investments: {
                subscriptions: [],
                partnerships: [],
                product: [],
            },
        },
        sessionSeed: getSessionSeed(),
    };
}

// ---
// --- Логика игры по этапам ---
// ---
const GameLogic = {
    // Этап 1: Ядро империи
    stage1: {
        cards: {
            audience: [
                { id: 'newbies', text: 'Новички-фрилансеры' },
                { id: 'entrepreneurs', text: 'Молодые предприниматели' },
                { id: 'students', text: 'Студенты-креаторы' },
                { id: 'experts', text: 'Эксперты без блога' },
            ],
            platform: [
                { id: 'shorts', text: 'Shorts/Reels' },
                { id: 'telegram', text: 'Telegram-канал' },
                { id: 'longreads', text: 'Треды/лонгриды' },
                { id: 'video', text: 'Лонгформ-видео' },
            ],
            value: [
                { id: 'quick-tips', text: 'Быстрые фишки' },
                { id: 'deep-dives', text: 'Глубокие разборы' },
                { id: 'case-studies', text: 'Кейсы с цифрами' },
                { id: 'templates', text: 'Шаблоны для старта' },
            ],
        },
        synergy: {
            'newbies-shorts-quick-tips': { influence: 8, trust: 5 },
            'entrepreneurs-telegram-case-studies': { influence: 10, trust: 7 },
            'students-shorts-templates': { influence: 7, trust: 6 },
            'experts-longreads-deep-dives': { influence: 12, trust: 8 },
        },
        init() {
            const palette = document.getElementById('card-palette');
            palette.innerHTML = '';
            // Очищаем дроп-зоны при ре-инициализации
            document.querySelectorAll('#screen-1 .drop-zone').forEach(dz => {
                const label = dz.querySelector('.drop-zone-label');
                dz.innerHTML = '';
                dz.appendChild(label);
            });
            
            Object.entries(this.cards).forEach(([category, items]) => {
                items.forEach(item => {
                    const card = createDraggable('card', item.id, item.text);
                    card.dataset.category = category;
                    palette.appendChild(card);
                });
            });
            this.setupDropzones();
        },
        setupDropzones() {
            const dropzones = document.querySelectorAll('#screen-1 .drop-zone');
            dropzones.forEach(dz => {
                dz.ondragover = (e) => e.preventDefault();
                dz.ondragenter = () => dz.classList.add('drag-over');
                dz.ondragleave = () => dz.classList.remove('drag-over');
                dz.ondrop = (e) => {
                    e.preventDefault();
                    dz.classList.remove('drag-over');
                    const cardId = e.dataTransfer.getData('text/plain');
                    const card = document.getElementById(cardId);
                    if (card.dataset.category === dz.dataset.category) {
                        if (dz.querySelector('.draggable-card')) {
                            // Возвращаем старую карточку
                            document.getElementById('card-palette').appendChild(dz.querySelector('.draggable-card'));
                        }
                        dz.appendChild(card);
                        gameState.stage1[card.dataset.category] = card.dataset.id;
                        card.classList.add('dropped');
                        this.checkCompletion();
                    }
                };
            });
        },
        checkCompletion() {
            const { audience, platform, value } = gameState.stage1;
            if (audience && platform && value) {
                const key = `${audience}-${platform}-${value}`;
                const bonus = this.synergy[key] || { influence: 2, trust: 1 };
                
                updateScore('influence', bonus.influence);
                updateScore('trust', bonus.trust);
                showToast(`Синергия поймана! ✨ +${bonus.influence} влияния, +${bonus.trust} доверия.`);
                
                DOM.nav.next.disabled = false;
            }
        }
    },
    // Этап 2: Вирусная лаборатория
    stage2: {
        triggers: [
            { id: 'awe', text: 'Восхищение', score: 1.5 },
            { id: 'utility', text: 'Полезность', score: 1.8 },
            { id: 'insight', text: 'Инсайт', score: 2.0 },
            { id: 'conflict', text: 'Лёгкий конфликт', score: 1.2 },
            { id: 'novelty', text: 'Новизна', score: 1.6 },
            { id: 'ugc', text: 'Соучастие', score: 1.7 },
        ],
        hookTemplates: [
            "Как X сделать Y за Z", "3 ошибки, из-за которых...", "Этот простой способ [сделать что-то] изменил всё"
        ],
        init() {
            const palette = document.getElementById('trigger-palette');
            palette.innerHTML = '';
            this.triggers.forEach(t => {
                const chip = createDraggable('chip trigger-chip', t.id, t.text);
                chip.dataset.score = t.score;
                palette.appendChild(chip);
            });
            const dropzone = document.getElementById('trigger-dropzone');
            const label = dropzone.querySelector('.drop-zone-label');
            dropzone.innerHTML = '';
            dropzone.appendChild(label);
            
            this.setupDropzone();
            const hookInput = document.getElementById('hook-input');
            hookInput.placeholder = this.hookTemplates[Math.floor(seededRandom() * this.hookTemplates.length)];
            hookInput.oninput = () => {
                gameState.stage2.hook = hookInput.value;
                this.runABTest();
            };
        },
        setupDropzone() {
            const dz = document.getElementById('trigger-dropzone');
            dz.ondragover = (e) => e.preventDefault();
            dz.ondragenter = () => dz.classList.add('drag-over');
            dz.ondragleave = () => dz.classList.remove('drag-over');
            dz.ondrop = (e) => {
                e.preventDefault();
                dz.classList.remove('drag-over');
                const chipId = e.dataTransfer.getData('text/plain');
                const chip = document.getElementById(chipId);
                if (gameState.stage2.triggers.length < 3) {
                    dz.appendChild(chip);
                    gameState.stage2.triggers.push({id: chip.dataset.id, score: chip.dataset.score});
                    chip.classList.add('dropped');
                    this.runABTest();
                } else {
                    showToast('Достаточно 2-3 триггеров для старта!');
                }
            };
        },
        runABTest() {
            const hook = gameState.stage2.hook;
            const triggers = gameState.stage2.triggers;
            if (hook.length < 10 || triggers.length < 1) {
                DOM.nav.next.disabled = true;
                return;
            }

            const baseViews = 1000;
            const triggerMultiplier = triggers.reduce((acc, t) => acc * parseFloat(t.score), 1);

            // Вариант А (текущий)
            const clarityA = Math.min(1, hook.length / 50);
            const viewsA = baseViews * triggerMultiplier * (0.8 + seededRandom() * 0.4);
            const ctrA = clarityA * 0.05 * (0.8 + seededRandom() * 0.4);
            const savesA = (triggers.some(t => t.id === 'utility' || t.id === 'insight') ? 0.1 : 0.02) * (0.8 + seededRandom() * 0.4);
            
            // Вариант Б (улучшенный)
            const hookB = hook.split(' ').length > 5 ? hook.split(' ').slice(0, 5).join(' ') + '...' : hook;
            const clarityB = Math.min(1, hookB.length / 40);
            const viewsB = viewsA * (1 + seededRandom() * 0.2); // slight novelty boost
            const ctrB = ctrA * (1.1 + seededRandom() * 0.2);
            const savesB = savesA * (1 + seededRandom() * 0.1);

            document.getElementById('variant-a-text').textContent = hook;
            document.getElementById('variant-b-text').textContent = hookB;
            
            this.renderChart('chart-a', { views: viewsA, ctr: ctrA * 100, saves: savesA * 100 });
            this.renderChart('chart-b', { views: viewsB, ctr: ctrB * 100, saves: savesB * 100 });

            const influenceBonus = Math.round((ctrB - ctrA) * 100 + triggers.length);
            updateScore('influence', influenceBonus);
            showToast(`Тест завершен! +${influenceBonus} влияния.`);
            DOM.nav.next.disabled = false;
        },
        renderChart(containerId, data) {
            const container = document.getElementById(containerId);
            container.innerHTML = `
                <div class="metric-bar">
                    <span class="bar-label">Просмотры</span>
                    <div class="bar-bg"><div class="bar-fill" style="width: ${Math.min(100, data.views / 20)}%;"></div></div>
                </div>
                <div class="metric-bar">
                    <span class="bar-label">CTR</span>
                    <div class="bar-bg"><div class="bar-fill" style="width: ${Math.min(100, data.ctr * 10)}%;"></div></div>
                </div>
                 <div class="metric-bar">
                    <span class="bar-label">Сохранения</span>
                    <div class="bar-bg"><div class="bar-fill" style="width: ${Math.min(100, data.saves * 20)}%;"></div></div>
                </div>
            `;
        }
    },
    // Этап 3: Приёмы и границы
    stage3: {
        techniques: {
            authority: { name: 'Авторитет', ethical: 'Ссылаться на реальный опыт', manipulative: 'Давить статусом' },
            scarcity: { name: 'Дефицит', ethical: 'Честно указать на ограничение', manipulative: 'Создать ложный ажиотаж' },
            social_proof: { name: 'Соц. док-ва', ethical: 'Показать реальные отзывы', manipulative: 'Использовать ботов' },
        },
        init() {
            const grid = document.getElementById('techniques-grid');
            grid.innerHTML = '';
            Object.entries(this.techniques).forEach(([id, tech]) => {
                const card = document.createElement('div');
                card.id = `tech-${id}`;
                card.className = 'technique-card';
                card.textContent = tech.name;
                card.onclick = () => this.toggleTechnique(id);
                grid.appendChild(card);
                this.updateCard(id);
            });
            const headlineInput = document.getElementById('headline-input');
            headlineInput.value = gameState.stage3.headline;
            headlineInput.oninput = () => {
                gameState.stage3.headline = headlineInput.value;
                this.evaluateHeadline();
            };
            this.evaluateHeadline();
        },
        toggleTechnique(id) {
            gameState.stage3.techniques[id] = gameState.stage3.techniques[id] === 'ethical' ? 'manipulative' : 'ethical';
            this.updateCard(id);
            this.evaluateHeadline();
        },
        updateCard(id) {
            const card = document.getElementById(`tech-${id}`);
            const state = gameState.stage3.techniques[id];
            card.classList.toggle('ethical', state === 'ethical');
            card.classList.toggle('manipulative', state === 'manipulative');
            card.title = this.techniques[id][state];
        },
        evaluateHeadline() {
            const text = gameState.stage3.headline.toLowerCase();
            const badWords = ['шок', 'гарантированно', 'сенсация', 'только сегодня', 'успей'];
            
            let clarity = Math.max(0, 100 - Math.abs(text.length - 80));
            let honesty = 100;
            badWords.forEach(word => {
                if (text.includes(word)) honesty -= 25;
            });
            let power = text.split(' ').filter(w => w.length > 4).length * 5;

            // Влияние этики приемов
            const ethicalCount = Object.values(gameState.stage3.techniques).filter(v => v === 'ethical').length;
            honesty += ethicalCount * 10;
            
            clarity = Math.min(100, clarity);
            honesty = Math.min(100, honesty);
            power = Math.min(100, power);
            
            document.getElementById('clarity-score').textContent = Math.round(clarity);
            document.getElementById('honesty-score').textContent = Math.round(honesty);
            document.getElementById('power-score').textContent = Math.round(power);
            
            const indicator = document.getElementById('ethics-indicator');
            if (honesty > 80) indicator.style.backgroundColor = 'var(--ethics-good)';
            else if (honesty > 50) indicator.style.backgroundColor = 'var(--ethics-warn)';
            else indicator.style.backgroundColor = 'var(--ethics-bad)';
            
            if (clarity > 50 && power > 30) {
                DOM.nav.next.disabled = false;
                const trustChange = Math.round((honesty - 70) / 10);
                updateScore('trust', trustChange);
                if (trustChange !== 0) {
                    showToast(`${trustChange > 0 ? '👍' : '👎'} ${trustChange} доверия`);
                }
            } else {
                 DOM.nav.next.disabled = true;
            }
        }
    },
    // Этап 4: Монетизация и сеть
    stage4: {
        resources: [
            { id: 'time', emoji: '⏳' }, { id: 'ideas', emoji: '💡' }, { id: 'energy', emoji: '⚡️' }
        ],
        init() {
            const tokensContainer = document.getElementById('resource-tokens');
            tokensContainer.innerHTML = '';
            this.resources.forEach(res => {
                const token = createDraggable('token resource-token', res.id, res.emoji);
                tokensContainer.appendChild(token);
            });
            this.setupDropzones();
            document.getElementById('simulate-week').onclick = () => this.simulate();
        },
        setupDropzones() {
             const dropzones = document.querySelectorAll('#screen-4 .drop-zone');
             dropzones.forEach(dz => {
                dz.innerHTML = ''; // Очистка
                dz.ondragover = (e) => e.preventDefault();
                dz.ondrop = (e) => {
                    e.preventDefault();
                    const tokenId = e.dataTransfer.getData('text/plain');
                    const token = document.getElementById(tokenId);
                    dz.appendChild(token);
                    this.updateInvestments();
                };
             });
        },
        updateInvestments() {
             const channels = document.querySelectorAll('.monetization-channel');
             channels.forEach(ch => {
                 const channelId = ch.dataset.channel;
                 const tokens = Array.from(ch.querySelectorAll('.resource-token')).map(t => t.id.split('-')[1]);
                 gameState.stage4.investments[channelId] = tokens;
             });
             const totalInvested = Object.values(gameState.stage4.investments).flat().length;
             DOM.nav.next.disabled = totalInvested !== this.resources.length;
        },
        simulate() {
            const { trust, influence } = gameState.scores;
            const { investments } = gameState.stage4;
            
            // Коэффициенты (упрощенно)
            const subEffort = investments.subscriptions.length * 1.2;
            const partnerEffort = investments.partnerships.length * 1.5;
            const prodEffort = investments.product.length * 1.0;

            const subsRevenue = 100 * (trust / 100) * subEffort * (influence / 100);
            const partnerRevenue = (influence * 10) * 0.05 * 0.1 * 1000 * partnerEffort;
            const prodRevenue = (influence * 5) * (trust / 120) * 2000 * prodEffort;
            
            const totalRevenue = Math.round(subsRevenue + partnerRevenue + prodRevenue);
            const newFollowers = Math.round(influence * (trust / 50) * (subEffort + partnerEffort + prodEffort));
            
            gameState.resources.totalRevenue += totalRevenue;
            
            document.getElementById('revenue-total').textContent = totalRevenue;
            document.getElementById('new-followers').textContent = newFollowers;
            
            showToast(`Неделя прошла! Доход: ${totalRevenue} ₽`);
            updateScore('influence', Math.round(newFollowers / 100));
            DOM.nav.next.disabled = false;
        }
    },
    // Финал
    final: {
        init() {
            DOM.final.influence.textContent = gameState.scores.influence;
            DOM.final.trust.textContent = gameState.scores.trust;
            DOM.final.revenue.textContent = gameState.resources.totalRevenue;
            
            if (gameState.scores.influence >= 80 && gameState.scores.trust >= 70) {
                this.runConfetti();
            } else {
                 document.querySelector('#screen-5 h2').textContent = "Неплохой старт! Попробуй еще.";
            }
            
            if (TWebApp) {
                DOM.final.share.style.display = 'block';
                DOM.final.share.onclick = () => {
                    TWebApp.openTelegramLink(`https://t.me/share/url?url=${window.location.href}&text=Я построил свою Империю Влияния! Мой счет: ${gameState.scores.influence} влияния и ${gameState.scores.trust} доверия.`);
                };
                TWebApp.MainButton.setText('Начать заново');
                TWebApp.MainButton.show();
                TWebApp.MainButton.onClick(() => {
                    this.restartGame();
                    TWebApp.MainButton.hide();
                });
            }
            DOM.final.restart.onclick = () => this.restartGame();
        },
        restartGame() {
            gameState = getDefaultState();
            navigateToStep(0);
        },
        runConfetti() {
            const canvas = DOM.final.canvas;
            const ctx = canvas.getContext('2d');
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;

            const particles = [];
            const particleCount = 100;
            const colors = ["#0EA5E9", "#F59E0B", "#FFFFFF", "#22c55e"];

            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height - canvas.height,
                    size: Math.random() * 5 + 2,
                    speed: Math.random() * 3 + 2,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    angle: Math.random() * 360,
                    spin: (Math.random() - 0.5) * 10
                });
            }
            
            let frame = 0;
            function animate() {
                if (frame > 150) { // 2.5 seconds at 60fps
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    return;
                }
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                particles.forEach(p => {
                    p.y += p.speed;
                    p.angle += p.spin;
                    if (p.y > canvas.height) {
                        p.y = -p.size;
                        p.x = Math.random() * canvas.width;
                    }
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.rotate(p.angle * Math.PI / 180);
                    ctx.fillStyle = p.color;
                    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                    ctx.restore();
                });
                frame++;
                requestAnimationFrame(animate);
            }
            animate();
        }
    }
};

// ---
// --- Управление UI и рендеринг ---
// ---

function navigateToStep(step) {
    if (step < 0 || step > TOTAL_STEPS + 1) return;
    gameState.currentStep = step;
    
    DOM.allScreens.forEach(screen => screen.classList.remove('active'));
    document.getElementById(`screen-${step}`).classList.add('active');

    updateUI();
    saveState();
}

function updateUI() {
    // Обновление прогресс-бара
    const progress = (gameState.currentStep > 0 && gameState.currentStep <= TOTAL_STEPS)
        ? (gameState.currentStep - 1) / TOTAL_STEPS * 100
        : (gameState.currentStep > TOTAL_STEPS ? 100 : 0);
    DOM.topBar.progress.style.width = `${progress}%`;
    
    // Обновление очков
    DOM.topBar.influence.textContent = gameState.scores.influence;
    DOM.topBar.trust.textContent = gameState.scores.trust;

    // Кнопки навигации
    DOM.nav.prev.disabled = gameState.currentStep <= 0;
    DOM.nav.next.disabled = true; // Блокируется по умолчанию для каждого шага
    
    // Логика по шагам
    if (gameState.currentStep > 0 && gameState.currentStep <= TOTAL_STEPS) {
         GameLogic[`stage${gameState.currentStep}`]?.checkCompletion?.();
    }
}

function showToast(message, duration = 3000) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    DOM.toasts.appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, duration);
}


// ---
// --- Утилиты и вспомогательные функции ---
// ---

let random = seedRandom(getSessionSeed());

function seededRandom() {
    let x = Math.sin(random++) * 10000;
    return x - Math.floor(x);
}

function getSessionSeed() {
    const d = new Date();
    let seed = d.getUTCFullYear() * 10000 + (d.getUTCMonth() + 1) * 100 + d.getUTCDate();
    return seed;
}

function seedRandom(seed) {
    return function() {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
    };
}

function createDraggable(type, id, text) {
    const el = document.createElement('div');
    el.id = `${type}-${id}`;
    el.className = `draggable-${type}`;
    el.textContent = text;
    el.draggable = true;
    el.ondragstart = (e) => {
        e.dataTransfer.setData('text/plain', el.id);
        el.classList.add('dragging');
    };
    el.ondragend = () => {
        el.classList.remove('dragging');
    };
    return el;
}

function updateScore(type, value) {
    gameState.scores[type] = Math.max(0, Math.min(100, gameState.scores[type] + value));
    updateUI();
}


// ---
// --- Инициализация и управление состоянием ---
// ---

function saveState() {
    try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(gameState));
    } catch (e) {
        console.error("Failed to save state:", e);
    }
}

function loadState() {
    try {
        const savedState = localStorage.getItem(SAVE_KEY);
        if (savedState) {
            gameState = JSON.parse(savedState);
            return true;
        }
    } catch (e) {
        console.error("Failed to load state:", e);
    }
    return false;
}

function initTelegram() {
    if (!TWebApp) return;
    TWebApp.ready();
    
    // Тема
    if (TWebApp.colorScheme === 'dark') {
        DOM.container.classList.add('dark-theme');
    }
    TWebApp.onEvent('themeChanged', () => {
        DOM.container.classList.toggle('dark-theme', TWebApp.colorScheme === 'dark');
    });

    // Кнопки
    TWebApp.BackButton.onClick(() => window.history.back());
    TWebApp.BackButton.show();
}

function init() {
    // Попытка загрузить сохранение
    if (loadState() && gameState.currentStep > 0) {
        DOM.welcome.continueGame.style.display = 'block';
    } else {
        gameState = getDefaultState();
    }

    // Обработчики событий
    DOM.welcome.startNew.addEventListener('click', () => {
        gameState = getDefaultState();
        navigateToStep(1);
        GameLogic.stage1.init();
    });
    DOM.welcome.continueGame.addEventListener('click', () => {
        navigateToStep(gameState.currentStep);
        // Тут нужна логика для восстановления состояния каждого этапа
    });
    
    DOM.nav.next.addEventListener('click', () => {
        const currentStep = gameState.currentStep;
        if (currentStep > 0 && currentStep <= TOTAL_STEPS) {
            // "Фиксируем" результат этапа
            const influenceBonus = Math.floor(seededRandom() * 5 + 2);
            updateScore('influence', influenceBonus);
        }

        navigateToStep(currentStep + 1);
        const nextStage = `stage${gameState.currentStep}` || (gameState.currentStep === TOTAL_STEPS + 1 ? 'final' : null);
        
        if (GameLogic[nextStage]) {
            GameLogic[nextStage].init();
        }
    });
    DOM.nav.prev.addEventListener('click', () => navigateToStep(gameState.currentStep - 1));
    DOM.topBar.backButton.addEventListener('click', () => {
        // Предполагается, что quests.html на уровень выше
        window.location.href = '../quests.html'; 
    });

    initTelegram();
    navigateToStep(gameState.currentStep);
}

// Запуск игры
document.addEventListener('DOMContentLoaded', init);
