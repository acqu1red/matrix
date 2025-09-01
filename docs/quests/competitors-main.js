document.addEventListener('DOMContentLoaded', () => {
    // --- Canvas Background Animation ---
    const canvas = document.getElementById('background-canvas');
    if(canvas) {
        const ctx = canvas.getContext('2d');
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        let particles = [];
        const particleCount = 70;

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 1;
                this.speedX = Math.random() * 1 - 0.5;
                this.speedY = Math.random() * 1 - 0.5;
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                if (this.size > 0.1) this.size -= 0.01;
            }
            draw() {
                ctx.fillStyle = 'rgba(0, 245, 212, 0.8)';
                ctx.strokeStyle = 'rgba(155, 93, 229, 0.8)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fill();
            }
        }

        function initParticles() {
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        }

        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();
                if (particles[i].size <= 0.1) {
                    particles.splice(i, 1);
                    i--;
                    particles.push(new Particle());
                }
            }
            requestAnimationFrame(animateParticles);
        }
        initParticles();
        animateParticles();
        window.addEventListener('resize', () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            initParticles();
        });
    }

    // --- Game Logic ---
    // Screens
    const screens = {
        loading: document.getElementById('loading-screen'),
        start: document.getElementById('start-screen'),
        game: document.getElementById('game-screen'),
        end: document.getElementById('end-screen')
    };
    
    // Buttons
    const startBtn = document.getElementById('start-btn');
    const ctaBtn = document.getElementById('cta-btn');
    const backBtn = document.getElementById('back-btn');
    const menuBtn = document.getElementById('menu-btn');
    
    // UI Elements
    const stageContainer = document.getElementById('stage-container');
    const playerHandContainer = document.getElementById('player-hand-container');
    const competitorNameEl = document.getElementById('competitor-name');
    const healthBarEl = document.getElementById('health-bar');
    const finalScoreEl = document.getElementById('final-score');
    const defeatedCompetitorNameEl = document.getElementById('defeated-competitor-name');

    // Game State
    let gameState = {};

    const QUEST_DATA = {
        competitors: [
            {
                id: 'innovatech',
                name: 'InnovaTech', 
                health: 100, 
                weakness: 'pr', // 'pr', 'finance', 'tech'
                portrait: '../assets/photovideo/prise.png' // placeholder
            }
        ],
                stages: [
                    {
                id: 'recon',
                title: 'Разведка',
                setup: (state) => {
                    const competitor = state.competitor;
                    competitorNameEl.textContent = competitor.name;
                    stageContainer.innerHTML = `
                        <div class="recon-stage">
                            <h3>Анализ данных</h3>
                            <p>Вы получили доступ к внутренним документам InnovaTech. Найдите их уязвимость.</p>
                            <div class="documents">
                                <div class="doc" data-weakness="finance">Отличные финансовые показатели, рост +30%</div>
                                <div class="doc" data-weakness="tech">Прорывная технология, патенты защищены</div>
                                <div class="doc correct" data-weakness="pr">Скандал с CEO, который пытаются скрыть. Репутация под угрозой.</div>
                            </div>
                        </div>`;
                    playerHandContainer.innerHTML = '';
                    
                    document.querySelectorAll('.doc').forEach(doc => {
                        doc.addEventListener('click', () => {
                            if(doc.classList.contains('correct')) {
                                showFeedback('Уязвимость найдена! Их репутация - слабое место.', true);
                                gameState.knownWeakness = competitor.weakness;
                                setTimeout(() => loadStage('exploit'), 1500);
                            } else {
                                showFeedback('Это их сильная сторона. Ищите дальше.', false);
                            }
                        });
                    });
                }
            },
            {
                id: 'exploit',
                title: 'Эксплуатация',
                setup: (state) => {
                    const competitor = state.competitor;
                    stageContainer.innerHTML = `
                        <div class="competitor-profile drop-zone" data-competitor-id="${competitor.id}">
                            <img src="${competitor.portrait}" alt="${competitor.name}">
                            <h3>${competitor.name}</h3>
                            <p>Примените правильную стратегию для атаки</p>
                        </div>
                    `;

                    let cardsHtml = '';
                    for(const actionId in QUEST_DATA.actions) {
                        const action = QUEST_DATA.actions[actionId];
                        cardsHtml += `
                            <div class="action-card" draggable="true" data-action="${actionId}">
                                <div class="card-icon">${action.icon}</div>
                                <div class="card-title">${action.name}</div>
                                <div class="card-cost">Стоимость: ${action.cost}</div>
                            </div>
                        `;
                    }
                    playerHandContainer.innerHTML = cardsHtml;
                    
                    // Setup D&D
                    setupDragAndDrop(state);
                }
            }
            // More stages...
        ],
        actions: {
            'pr_campaign': { name: 'PR Кампания', cost: 10, icon: '📢', type: 'pr' },
            'tech_sabotage': { name: 'Тех. Саботаж', cost: 20, icon: '💥', type: 'tech' },
            'price_war': { name: 'Ценовая Война', cost: 15, icon: '💸', type: 'finance' }
        }
    };
    
    function switchScreen(screenName) {
        Object.values(screens).forEach(s => s.classList.remove('active'));
        screens[screenName].classList.add('active');
    }
    
    function initGame() {
        gameState = {
            currentStageId: 'recon',
            history: [],
            playerCapital: 1000,
            competitor: { ...QUEST_DATA.competitors[0] }
        };
        loadStage('recon');
        switchScreen('game');
    }
    
    function loadStage(stageId) {
        const stage = QUEST_DATA.stages.find(s => s.id === stageId);
        if (stage) {
            gameState.history.push(gameState.currentStageId);
            gameState.currentStageId = stageId;
            stage.setup(gameState);
        }
    }

    function goBack() {
        const lastStageId = gameState.history.pop();
        if(lastStageId) {
            loadStage(lastStageId);
        }
    }

    function updateHealth(newHealth) {
        gameState.competitor.health = Math.max(0, newHealth);
        healthBarEl.style.width = `${gameState.competitor.health}%`;
        if (gameState.competitor.health <= 0) {
            endGame(true);
        }
    }

    function endGame(isWin) {
        if(isWin) {
            defeatedCompetitorNameEl.textContent = gameState.competitor.name;
            finalScoreEl.textContent = gameState.playerCapital;
        }
        switchScreen('end');
    }
    
    function showFeedback(message, isSuccess) {
        const feedbackEl = document.createElement('div');
        feedbackEl.className = `feedback-popup ${isSuccess ? 'success' : 'failure'}`;
        feedbackEl.textContent = message;
        document.body.appendChild(feedbackEl);
        setTimeout(() => feedbackEl.remove(), 2500);
    }

    // --- Drag and Drop (Mobile and Desktop) ---
    function setupDragAndDrop(state) {
        const cards = document.querySelectorAll('.action-card');
        const dropZone = document.querySelector('.drop-zone');
        let draggedItem = null;
        let ghostEl = null;

        function handleDrop(actionId) {
            if (!actionId) return;

            const action = QUEST_DATA.actions[actionId];
            const competitor = state.competitor;

            if (state.knownWeakness === action.type) {
                showFeedback('Критический удар! Вы попали в уязвимость.', true);
                updateHealth(competitor.health - 50); 
            } else {
                showFeedback('Неэффективно. Удар пришелся по сильной стороне.', false);
                updateHealth(competitor.health - 10);
            }

            // Simple logic for now: one hit ends the game.
            setTimeout(() => endGame(gameState.competitor.health <= 0), 1500);
        }

        // --- MOUSE EVENTS ---
        cards.forEach(card => {
            card.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', card.dataset.action);
                setTimeout(() => card.classList.add('dragging'), 0);
            });
            card.addEventListener('dragend', () => card.classList.remove('dragging'));
        });

        dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('hover'); });
        dropZone.addEventListener('dragleave', () => dropZone.classList.remove('hover'));
        dropZone.addEventListener('drop', e => {
                e.preventDefault();
            dropZone.classList.remove('hover');
                const actionId = e.dataTransfer.getData('text/plain');
            handleDrop(actionId);
        });
        
        // --- TOUCH EVENTS ---
        cards.forEach(card => {
            card.addEventListener('touchstart', e => {
                if (e.touches.length !== 1) return;
                    draggedItem = card;
                
                    ghostEl = card.cloneNode(true);
                    ghostEl.classList.add('ghost');
                    document.body.appendChild(ghostEl);
                
                    const touch = e.touches[0];
                ghostEl.style.left = `${touch.pageX - ghostEl.offsetWidth / 2}px`;
                ghostEl.style.top = `${touch.pageY - ghostEl.offsetHeight / 2}px`;
                
                    card.classList.add('dragging');
            }, { passive: true });
        });

        document.addEventListener('touchmove', e => {
            if (!draggedItem || !ghostEl) return;
                e.preventDefault();
            
                const touch = e.touches[0];
            ghostEl.style.left = `${touch.pageX - ghostEl.offsetWidth / 2}px`;
            ghostEl.style.top = `${touch.pageY - ghostEl.offsetHeight / 2}px`;

                ghostEl.style.display = 'none';
                const elementUnder = document.elementFromPoint(touch.clientX, touch.clientY);
                ghostEl.style.display = 'flex';

            if (elementUnder && elementUnder.closest('.drop-zone')) {
                dropZone.classList.add('hover');
            } else {
                dropZone.classList.remove('hover');
            }
        }, { passive: false });

        document.addEventListener('touchend', e => {
            if (!draggedItem || !ghostEl) return;

            const touch = e.changedTouches[0];
                ghostEl.style.display = 'none';
            const elementUnder = document.elementFromPoint(touch.clientX, touch.clientY);
                
            if (elementUnder && elementUnder.closest('.drop-zone')) {
                handleDrop(draggedItem.dataset.action);
                }
                
            dropZone.classList.remove('hover');
                draggedItem.classList.remove('dragging');
                document.body.removeChild(ghostEl);
                ghostEl = null;
                draggedItem = null;
        });
    }

    // --- Event Listeners ---
    startBtn.addEventListener('click', initGame);
    backBtn.addEventListener('click', goBack);
    menuBtn.addEventListener('click', () => window.location.href = '../quests.html');
    ctaBtn.addEventListener('click', () => {
        // Handle CTA
    });

    // Initial load
    setTimeout(() => switchScreen('start'), 1000);
});
