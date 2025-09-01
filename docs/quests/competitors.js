document.addEventListener('DOMContentLoaded', () => {
    // Game State
    let gameState = {
        marketShare: 0,
        resources: 100000,
        reputation: 0,
        currentStage: 0,
        eliminatedCompetitors: 0
    };

    // UI Elements
    const screens = {
        loader: document.getElementById('loader'),
        start: document.getElementById('start-screen'),
        game: document.getElementById('game-screen'),
        end: document.getElementById('end-screen')
    };

    const nav = document.getElementById('quest-nav');
    const backBtn = document.getElementById('back-btn');
    const menuBtn = document.getElementById('menu-btn');
    const startBtn = document.getElementById('start-btn');
    const ctaBtn = document.getElementById('cta-btn');

    const stageContainer = document.getElementById('stage-container');
    const actionContainer = document.getElementById('action-container');

    // Stats Elements
    const marketShareEl = document.getElementById('market-share');
    const resourcesEl = document.getElementById('resources');
    const reputationEl = document.getElementById('reputation');
    const progressFill = document.getElementById('progress-fill');

    // Game Data
    const QUEST_DATA = {
        totalStages: 5,
        stages: [
            // Stage 0: Market Research
            {
                type: 'research',
                title: 'Исследование Рынка',
                description: 'Перед вами три конкурента. Проанализируйте их слабые стороны.',
                competitors: [
                    {
                        name: 'TechGiant',
                        icon: '🏢',
                        marketShare: '45%',
                        revenue: '10M',
                        weakness: 'slow-innovation',
                        description: 'Крупная компания, медленно внедряет инновации'
                    },
                    {
                        name: 'FastStartup',
                        icon: '🚀',
                        marketShare: '15%',
                        revenue: '2M',
                        weakness: 'cash-flow',
                        description: 'Быстрый рост, но проблемы с деньгами'
                    },
                    {
                        name: 'QualityFirst',
                        icon: '⭐',
                        marketShare: '30%',
                        revenue: '5M',
                        weakness: 'high-prices',
                        description: 'Высокое качество, но завышенные цены'
                    }
                ],
                tools: [
                    { id: 'market-research', name: 'Анализ рынка', icon: '📊' },
                    { id: 'customer-survey', name: 'Опрос клиентов', icon: '📝' },
                    { id: 'spy', name: 'Шпионаж', icon: '🕵️' }
                ]
            },
            // Stage 1: Resource Allocation
            {
                type: 'strategy',
                title: 'Распределение Ресурсов',
                description: 'Используйте ресурсы для ослабления конкурентов',
                actions: [
                    {
                        name: 'Агрессивная реклама',
                        cost: 20000,
                        effect: { marketShare: 5, reputation: -1 }
                    },
                    {
                        name: 'Снижение цен',
                        cost: 30000,
                        effect: { marketShare: 8, reputation: 1 }
                    },
                    {
                        name: 'Улучшение продукта',
                        cost: 50000,
                        effect: { marketShare: 10, reputation: 2 }
                    }
                ]
            },
            // Stage 2: Market Manipulation
            {
                type: 'manipulation',
                title: 'Манипуляция Рынком',
                description: 'Используйте тактики влияния на рынок',
                tactics: [
                    {
                        name: 'Фейковые отзывы',
                        risk: 'high',
                        effect: { marketShare: 15, reputation: -3 }
                    },
                    {
                        name: 'Черный PR',
                        risk: 'medium',
                        effect: { marketShare: 12, reputation: -2 }
                    },
                    {
                        name: 'Сговор с поставщиками',
                        risk: 'low',
                        effect: { marketShare: 8, reputation: -1 }
                    }
                ]
            },
            // Stage 3: Corporate Espionage
            {
                type: 'espionage',
                title: 'Корпоративный Шпионаж',
                description: 'Соберите секретную информацию о конкурентах',
                targets: [
                    {
                        name: 'База данных клиентов',
                        difficulty: 'hard',
                        reward: { marketShare: 20, resources: 50000 }
                    },
                    {
                        name: 'Финансовые документы',
                        difficulty: 'medium',
                        reward: { marketShare: 15, resources: 30000 }
                    },
                    {
                        name: 'План развития',
                        difficulty: 'easy',
                        reward: { marketShare: 10, resources: 20000 }
                    }
                ]
            },
            // Stage 4: Final Takeover
            {
                type: 'takeover',
                title: 'Захват Рынка',
                description: 'Время нанести последний удар',
                options: [
                    {
                        name: 'Hostile Takeover',
                        cost: 80000,
                        effect: { marketShare: 30, reputation: -5 }
                    },
                    {
                        name: 'Merger Proposal',
                        cost: 60000,
                        effect: { marketShare: 25, reputation: 2 }
                    },
                    {
                        name: 'Market Dominance',
                        cost: 100000,
                        effect: { marketShare: 40, reputation: 0 }
                    }
                ]
            }
        ]
    };

    // Navigation Functions
    function showScreen(screenId) {
        Object.values(screens).forEach(screen => screen.classList.remove('active'));
        screens[screenId].classList.add('active');
        
        if (screenId === 'game') {
            nav.classList.remove('hidden');
            nav.classList.add('visible');
        } else {
            nav.classList.remove('visible');
            nav.classList.add('hidden');
        }
    }

    function updateStats() {
        marketShareEl.textContent = `${gameState.marketShare}%`;
        resourcesEl.textContent = `${(gameState.resources / 1000).toFixed(1)}K`;
        reputationEl.textContent = gameState.reputation;
        
        const progress = (gameState.currentStage / QUEST_DATA.totalStages) * 100;
        progressFill.style.width = `${progress}%`;
    }

    // Stage Loading Functions
    function loadStage(stageIndex) {
        if (stageIndex >= QUEST_DATA.stages.length) {
            endGame();
            return;
        }

        gameState.currentStage = stageIndex;
        const stage = QUEST_DATA.stages[stageIndex];
        updateStats();

        switch (stage.type) {
            case 'research':
                loadResearchStage(stage);
                break;
            case 'strategy':
                loadStrategyStage(stage);
                break;
            case 'manipulation':
                loadManipulationStage(stage);
                break;
            case 'espionage':
                loadEspionageStage(stage);
                break;
            case 'takeover':
                loadTakeoverStage(stage);
                break;
        }
    }

    function loadResearchStage(stage) {
        stageContainer.innerHTML = `
            <h2 class="stage-title fade-in">${stage.title}</h2>
            <p class="stage-description fade-in">${stage.description}</p>
            <div class="competitors-container">
                ${stage.competitors.map(comp => createCompetitorCard(comp)).join('')}
            </div>
        `;

        actionContainer.innerHTML = `
            <div class="action-cards">
                ${stage.tools.map(tool => createActionCard(tool)).join('')}
            </div>
        `;

        setupDragAndDrop();
    }

    function createCompetitorCard(competitor) {
        return `
            <div class="competitor-card fade-in">
                <div class="competitor-header">
                    <div class="competitor-icon">${competitor.icon}</div>
                    <div class="competitor-info">
                        <h3 class="competitor-name">${competitor.name}</h3>
                        <div class="competitor-stats">
                            <span>Доля рынка: ${competitor.marketShare}</span>
                            <span>Выручка: ${competitor.revenue}</span>
                        </div>
                    </div>
                </div>
                <div class="competitor-weakness-zone" data-weakness="${competitor.weakness}">
                    Перетащите инструмент анализа сюда
                </div>
            </div>
        `;
    }

    function createActionCard(tool) {
        return `
            <div class="action-card" draggable="true" data-tool-id="${tool.id}">
                <div class="card-icon">${tool.icon}</div>
                <div class="card-name">${tool.name}</div>
            </div>
        `;
    }

    // Touch-friendly Drag and Drop
    function setupDragAndDrop() {
        const cards = document.querySelectorAll('.action-card');
        const dropZones = document.querySelectorAll('.competitor-weakness-zone');
        let draggedCard = null;
        let ghostCard = null;

        // Mouse Events
        cards.forEach(card => {
            card.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', card.dataset.toolId);
                setTimeout(() => card.classList.add('dragging'), 0);
            });

            card.addEventListener('dragend', () => {
                card.classList.remove('dragging');
            });
        });

        dropZones.forEach(zone => {
            zone.addEventListener('dragover', (e) => {
                e.preventDefault();
                zone.classList.add('hover');
            });

            zone.addEventListener('dragleave', () => {
                zone.classList.remove('hover');
            });

            zone.addEventListener('drop', (e) => {
                e.preventDefault();
                zone.classList.remove('hover');
                const toolId = e.dataTransfer.getData('text/plain');
                handleAnalysisDrop(toolId, zone.dataset.weakness);
            });
        });

        // Touch Events
        cards.forEach(card => {
            card.addEventListener('touchstart', (e) => {
                if (e.touches.length === 1) {
                    draggedCard = card;
                    
                    ghostCard = card.cloneNode(true);
                    ghostCard.classList.add('ghost-card');
                    document.body.appendChild(ghostCard);
                    
                    const touch = e.touches[0];
                    positionGhostCard(touch.pageX, touch.pageY);
                    
                    card.classList.add('dragging');
                }
            }, { passive: true });
        });

        document.addEventListener('touchmove', (e) => {
            if (draggedCard && ghostCard) {
                e.preventDefault();
                const touch = e.touches[0];
                positionGhostCard(touch.pageX, touch.pageY);
                
                // Check for drop zone hover
                const dropZone = findDropZoneAtPoint(touch.clientX, touch.clientY);
                dropZones.forEach(zone => zone.classList.remove('hover'));
                if (dropZone) dropZone.classList.add('hover');
            }
        }, { passive: false });

        document.addEventListener('touchend', (e) => {
            if (draggedCard && ghostCard) {
                const touch = e.changedTouches[0];
                const dropZone = findDropZoneAtPoint(touch.clientX, touch.clientY);
                
                if (dropZone) {
                    handleAnalysisDrop(draggedCard.dataset.toolId, dropZone.dataset.weakness);
                }
                
                cleanup();
            }
        });

        function positionGhostCard(x, y) {
            ghostCard.style.left = `${x - ghostCard.offsetWidth / 2}px`;
            ghostCard.style.top = `${y - ghostCard.offsetHeight / 2}px`;
        }

        function findDropZoneAtPoint(x, y) {
            ghostCard.style.display = 'none';
            const element = document.elementFromPoint(x, y);
            ghostCard.style.display = 'block';
            return element?.closest('.competitor-weakness-zone');
        }

        function cleanup() {
            if (ghostCard) {
                ghostCard.remove();
                ghostCard = null;
            }
            draggedCard?.classList.remove('dragging');
            draggedCard = null;
            dropZones.forEach(zone => zone.classList.remove('hover'));
        }
    }

    function handleAnalysisDrop(toolId, weakness) {
        // Disable further interaction
        const cards = document.querySelectorAll('.action-card');
        cards.forEach(card => {
            card.draggable = false;
            card.style.opacity = '0.5';
        });

        let success = false;
        let feedback = '';

        // Analysis logic
        switch (toolId) {
            case 'market-research':
                success = weakness === 'high-prices';
                feedback = success ? 
                    'Отлично! Вы выявили завышенные цены конкурента.' :
                    'Не совсем то. Рыночные исследования показывают другие проблемы.';
                break;
            case 'customer-survey':
                success = weakness === 'slow-innovation';
                feedback = success ?
                    'В точку! Клиенты недовольны медленным развитием.' :
                    'Клиенты указывают на другие недостатки.';
                break;
            case 'spy':
                success = weakness === 'cash-flow';
                feedback = success ?
                    'Верно! Вы обнаружили финансовые проблемы конкурента.' :
                    'Разведка показывает другие уязвимости.';
                break;
        }

        // Update game state
        if (success) {
            gameState.marketShare += 5;
            gameState.reputation += 1;
            gameState.eliminatedCompetitors += 1;
        } else {
            gameState.resources -= 10000;
        }

        showFeedback(feedback, success);
        updateStats();

        // Progress to next stage after delay
        setTimeout(() => {
            loadStage(gameState.currentStage + 1);
        }, 2000);
    }

    function showFeedback(message, isSuccess) {
        const feedbackEl = document.createElement('div');
        feedbackEl.className = `feedback-popup ${isSuccess ? 'success' : 'failure'}`;
        feedbackEl.textContent = message;
        stageContainer.appendChild(feedbackEl);

        setTimeout(() => {
            feedbackEl.remove();
        }, 1800);
    }

    function endGame() {
        // Update final stats
        document.getElementById('final-market-share').textContent = `${gameState.marketShare}%`;
        document.getElementById('final-reputation').textContent = gameState.reputation;
        document.getElementById('competitors-eliminated').textContent = gameState.eliminatedCompetitors;
        
        showScreen('end');
    }

    // Event Listeners
    startBtn.addEventListener('click', () => {
        showScreen('game');
        loadStage(0);
    });

    backBtn.addEventListener('click', () => {
        if (gameState.currentStage > 0) {
            loadStage(gameState.currentStage - 1);
        }
    });

    menuBtn.addEventListener('click', () => {
        if (window.confirm('Вернуться в главное меню? Прогресс будет потерян.')) {
            window.location.href = '../quests.html';
        }
    });

    ctaBtn.addEventListener('click', () => {
        if (window.Telegram && window.Telegram.WebApp) {
            window.Telegram.WebApp.close();
        }
    });

    // Initial load
    setTimeout(() => {
        showScreen('start');
    }, 1500);
});
