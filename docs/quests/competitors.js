document.addEventListener('DOMContentLoaded', () => {
    // Screens & Containers
    const loaderScreen = document.getElementById('loader');
    const startScreen = document.getElementById('start-screen');
    const gameScreen = document.getElementById('game-screen');
    const endScreen = document.getElementById('end-screen');
    const stageContainer = document.getElementById('stage-container');
    const interactionFooter = document.getElementById('interaction-footer');

    // Buttons
    const startBtn = document.getElementById('start-btn');
    const ctaBtn = document.getElementById('cta-btn');
    const restartBtn = document.getElementById('restart-btn');
    const backBtn = document.getElementById('back-btn');
    const mainMenuBtn = document.getElementById('main-menu-btn');

    // Game UI Elements
    const progressBar = document.getElementById('progress-bar');
    const influenceValueEl = document.getElementById('influence-value');
    const moneyValueEl = document.getElementById('money-value');
    const finalInfluenceEl = document.getElementById('final-influence');
    const finalMoneyEl = document.getElementById('final-money');

    let currentStageIndex = 0;
    let influence = 0;
    let money = 0;
    let previousStageStack = []; // For 'Back' button navigation
    
    // --- GAME DATA ---
    const GAME_DATA = {
        totalStages: 5, // Placeholder, will be dynamic
        stages: [
            // --- STAGE 0: Introduction ---
            {
                id: 'intro',
                type: 'narrative',
                text: "Добро пожаловать в мир безжалостной конкуренции. Вы - начинающий предприниматель, готовый бросить вызов гигантам рынка. Ваша цель - выявить их слабые стороны и занять лидирующую позицию.",
                buttonText: "Начать Анализ",
                nextStage: 'competitor_1_analysis'
            },
            // --- STAGE 1: Competitor 1 Analysis (Drag & Drop) ---
            {
                id: 'competitor_1_analysis',
                type: 'dialogue',
                character: {
                    name: 'Аналитик Олег',
                    portrait: '../assets/photovideo/kazik.mp3' // Placeholder
                },
                dialogue: "Наш первый противник - крупная, но неповоротливая корпорация 'Монолит'. Их главное слабое место...",
                objective: "Выберите стратегию, чтобы выявить слабость 'Монолита'.",
                interaction: {
                    type: 'drag-drop',
                    prompt: "Перетащите стратегию на 'Монолит':",
                    cards: [
                        { id: 'market_research', name: 'Исследование рынка', icon: '📈' },
                        { id: 'insider_info', name: 'Инсайдерская инфа', icon: '🕵️' },
                        { id: 'price_dumping', name: 'Демпинг цен', icon: '📉' }
                    ],
                    dropTarget: 'Монолит', // Text on the image / character portrait
                    correctCard: 'insider_info',
                    responses: {
                        insider_info: { influence: 50, money: -20, feedback: "Успех! Мы получили конфиденциальные данные о их устаревшем оборудовании. Их слабость в технологиях.", nextStage: 'competitor_1_takedown' },
                        market_research: { influence: 10, money: -5, feedback: "Неплохо, но недостаточно глубоко. Мы узнали лишь общие данные.", nextStage: 'competitor_1_takedown' },
                        price_dumping: { influence: -30, money: -50, feedback: "Провал. Демпинг без анализа привел лишь к потере наших средств. Монолит не пострадал.", nextStage: 'competitor_1_takedown' }
                    }
                }
            },
            // --- STAGE 2: Competitor 1 Takedown (Button Choice) ---
            {
                id: 'competitor_1_takedown',
                type: 'dialogue',
                character: {
                    name: 'Маркетолог Светлана',
                    portrait: '../assets/photovideo/music.mp3' // Placeholder
                },
                dialogue: "Теперь, когда мы знаем их слабость в технологиях, как лучше всего нанести удар по репутации 'Монолита'?",
                objective: "Выберите лучший способ подорвать доверие к 'Монолиту'.",
                interaction: {
                    type: 'button-choice',
                    options: [
                        { text: "Запустить вирусную кампанию, высмеивающую их устаревшие технологии.", correct: false, influence: -10, money: -10, feedback: "Слишком прямолинейно, это вызвало лишь сочувствие к ним." },
                        { text: "Опубликовать аналитическую статью, демонстрирующую превосходство наших технологий над их устаревшими решениями.", correct: true, influence: 70, money: -30, feedback: "Гениально! Мы не критикуем напрямую, а показываем свое превосходство. Это умно и эффективно." },
                        { text: "Попытаться переманить их ключевых инженеров.", correct: false, influence: 20, money: -40, feedback: "Дорого и рискованно. Они быстро найдут замену, а мы потеряем деньги." }
                    ],
                    nextStage: 'hiring_agents'
                }
            },
            // --- STAGE 3: Hiring Agents (Mini-Game) ---
            {
                id: 'hiring_agents',
                type: 'hiring_agents',
                objective: "Наймите агентов, чтобы они распространяли слухи и подрывали репутацию конкурентов.",
                interaction: {
                    agents: [
                        { id: 'agent_smm', name: 'SMM-менеджер', cost: 50, effectiveness: 30, perk: "Усиливает слухи в соцсетях" },
                        { id: 'agent_journalist', name: 'Журналист', cost: 80, effectiveness: 50, perk: "Публикует компромат в СМИ" },
                        { id: 'agent_blogger', name: 'Блогер-миллионник', cost: 120, effectiveness: 70, perk: "Создает вирусные мемы и обзоры" }
                    ],
                    targetInfluence: 150, // Influence needed to pass this stage
                    nextStage: 'native_advertising'
                }
            },
            // --- STAGE 4: Native Advertising (Mini-Game) ---
            {
                id: 'native_advertising',
                type: 'native_advertising',
                objective: "Запустите нативную рекламную кампанию, чтобы переманить их клиентов.",
                interaction: {
                    elements: {
                        headlines: [
                            { text: "Устали от старых решений?", type: 'negative' },
                            { text: "Будущее уже здесь: наши инновации!", type: 'positive' },
                            { text: "Экономия и качество - выбор очевиден!", type: 'positive' }
                        ],
                        visuals: [
                            { src: '../assets/photovideo/ruletka.png', type: 'positive' }, // Placeholder
                            { src: '../assets/photovideo/strelka.png', type: 'negative' }  // Placeholder
                        ],
                        platforms: [
                            { name: 'Новостной портал', type: 'official' },
                            { name: 'Блог лидера мнений', type: 'influencer' }
                        ]
                    },
                    solution: {
                        headlineType: 'positive',
                        visualType: 'positive',
                        platformType: 'influencer'
                    },
                    feedback: {
                        success: "Ваша нативная реклама сработала! Клиенты переходят на нашу сторону.",
                        failure: "Реклама не достигла цели. Потери средств."
                    },
                    rewards: { successInfluence: 100, successMoney: 50, failureInfluence: -30, failureMoney: -30 },
                    nextStage: 'end'
                }
            }
        ]
    };

    function switchScreen(screen) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        screen.classList.add('active');
    }

    function updateUI() {
        const progress = (currentStageIndex / GAME_DATA.totalStages) * 100;
        progressBar.style.width = `${progress}%`;
        influenceValueEl.textContent = influence;
        moneyValueEl.textContent = money;
    }

    function startGame() {
        currentStageIndex = 0;
        influence = 100; // Starting influence
        money = 200;    // Starting money
        previousStageStack = [];
        switchScreen(gameScreen);
        loadStage(currentStageIndex);
    }

    function loadStage(stageIndex) {
        if (stageIndex === 'end' || stageIndex >= GAME_DATA.totalStages) {
            endGame();
            return;
        }

        // Save current stage to stack for 'Back' button, unless it's the first stage or re-loading current stage
        if (currentStageIndex !== stageIndex && stageIndex !== 0) {
            previousStageStack.push(currentStageIndex);
        }
        currentStageIndex = stageIndex;
        updateUI();

        const stageData = GAME_DATA.stages[stageIndex];
        stageContainer.innerHTML = '';
        interactionFooter.innerHTML = '';

        switch (stageData.type) {
            case 'narrative':
                loadNarrativeStage(stageData);
                break;
            case 'dialogue':
                loadDialogueStage(stageData);
                break;
            case 'hiring_agents':
                loadHiringAgentsStage(stageData);
                break;
            case 'native_advertising':
                loadNativeAdvertisingStage(stageData);
                break;
            default:
                console.error('Unknown stage type:', stageData.type);
                endGame();
        }
    }

    function loadNarrativeStage(data) {
        stageContainer.innerHTML = `
            <div class="narrative-scene">
                <p>${data.text}</p>
                <button id="narrative-next-btn">${data.buttonText || 'Продолжить'}</button>
            </div>
        `;
        document.getElementById('narrative-next-btn').addEventListener('click', () => {
            loadStage(data.nextStage);
        });
    }

    function loadDialogueStage(data) {
        stageContainer.innerHTML = `
            <div class="character-scene">
                <img src="${data.character.portrait}" alt="${data.character.name}" class="character-portrait ${data.interaction.type === 'drag-drop' ? 'drop-zone' : ''}" data-drop-target="${data.interaction.dropTarget || ''}">
                <div class="dialogue-box">
                    <p class="character-name">${data.character.name}</p>
                    <p>${data.dialogue}</p>
                </div>
                <p class="objective-text">${data.objective}</p>
            </div>
        `;

        if (data.interaction.type === 'drag-drop') {
            const cardsHTML = data.interaction.cards.map(card => `
                <div class="strategy-card" draggable="true" data-card-id="${card.id}">
                    <div class="card-icon">${card.icon}</div>
                    <div class="card-name">${card.name}</div>
                </div>
            `).join('');
            
            interactionFooter.innerHTML = `<div id="strategy-cards-container">${cardsHTML}</div>`;
            setupDragAndDrop(data);
        } else if (data.interaction.type === 'button-choice') {
            const optionsHTML = data.interaction.options.map(opt => 
                `<button class="option-btn" data-influence="${opt.influence || 0}" data-money="${opt.money || 0}" data-feedback="${opt.feedback}" data-correct="${opt.correct}">${opt.text}</button>`
            ).join('');
            interactionFooter.innerHTML = `<div class="options-container">${optionsHTML}</div>`;
            setupButtonChoices(data);
        }
    }

    function setupButtonChoices(stageData) {
        const optionBtns = document.querySelectorAll('.option-btn');
        optionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.currentTarget;
                const influenceChange = parseInt(target.dataset.influence);
                const moneyChange = parseInt(target.dataset.money);
                const feedback = target.dataset.feedback;
                const isCorrect = target.dataset.correct === 'true';

                influence += influenceChange;
                money += moneyChange;
                
                showFeedback(feedback, isCorrect);

                // Visual feedback on buttons
                optionBtns.forEach(b => {
                    b.disabled = true;
                    if (b.dataset.correct === 'true') {
                        b.classList.add('correct');
                    } else {
                        b.classList.add('incorrect');
                    }
                });

                setTimeout(() => {
                    loadStage(stageData.interaction.nextStage);
                }, 2500);
            });
        });
    }

    function setupDragAndDrop(stageData) {
        const cards = document.querySelectorAll('.strategy-card');
        const dropZone = document.querySelector('.drop-zone');
        let draggedItem = null;

        // --- MOUSE EVENTS (for desktop) ---
        cards.forEach(card => {
            card.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', card.dataset.cardId);
                setTimeout(() => card.classList.add('dragging'), 0);
            });
    
            card.addEventListener('dragend', () => {
                card.classList.remove('dragging');
            });
        });
    
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('hover');
        });
    
        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('hover');
        });
    
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('hover');
            const droppedCardId = e.dataTransfer.getData('text/plain');
            handleDrop(droppedCardId, stageData);
        });

        // --- TOUCH EVENTS (for mobile) ---
        let ghostEl = null;

        cards.forEach(card => {
            card.addEventListener('touchstart', (e) => {
                if (e.touches.length === 1) {
                    draggedItem = card;
                    
                    // Create and position ghost element
                    ghostEl = card.cloneNode(true);
                    ghostEl.classList.add('ghost');
                    document.body.appendChild(ghostEl);
                    const touch = e.touches[0];
                    ghostEl.style.left = `${touch.pageX - ghostEl.offsetWidth / 2}px`;
                    ghostEl.style.top = `${touch.pageY - ghostEl.offsetHeight / 2}px`;
    
                    card.classList.add('dragging');
                }
            }, { passive: true });
        });

        document.addEventListener('touchmove', (e) => {
            if (draggedItem && ghostEl) {
                e.preventDefault();
                const touch = e.touches[0];
                
                // Move ghost
                ghostEl.style.left = `${touch.pageX - ghostEl.offsetWidth / 2}px`;
                ghostEl.style.top = `${touch.pageY - ghostEl.offsetHeight / 2}px`;
                
                // Check for dropzone hover
                ghostEl.style.display = 'none';
                const elementUnder = document.elementFromPoint(touch.clientX, touch.clientY);
                ghostEl.style.display = 'flex';
    
                if (elementUnder && elementUnder.classList.contains('drop-zone')) {
                    dropZone.classList.add('hover');
                } else {
                    dropZone.classList.remove('hover');
                }
            }
        }, { passive: false });

        document.addEventListener('touchend', (e) => {
            if (draggedItem && ghostEl) {
                ghostEl.style.display = 'none';
                const elementUnder = document.elementFromPoint(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
                
                if (elementUnder && elementUnder.classList.contains('drop-zone')) {
                    const droppedCardId = draggedItem.dataset.cardId;
                    handleDrop(droppedCardId, stageData);
                }
                
                // Cleanup
                dropZone.classList.remove('hover');
                draggedItem.classList.remove('dragging');
                document.body.removeChild(ghostEl);
                ghostEl = null;
                draggedItem = null;
            }
        });

        function handleDrop(cardId, stageData) {
            // Disable further interaction to prevent multiple triggers
            cards.forEach(c => c.draggable = false); // Disable mouse drag
            // For touch, prevent new touches by removing listeners if necessary

            const result = stageData.interaction.responses[cardId];
            influence += result.influence;
            money += result.money;
            
            showFeedback(result.feedback, result.influence > 0 || result.money > 0);
            
            setTimeout(() => {
                loadStage(stageData.interaction.nextStage);
            }, 2500);
        }
    }

    function loadHiringAgentsStage(data) {
        stageContainer.innerHTML = `
            <div class="hiring-agents-screen">
                <h2>${data.objective}</h2>
                <div id="agents-pool">
                    ${data.interaction.agents.map(agent => `
                        <div class="agent-card" data-agent-id="${agent.id}" data-cost="${agent.cost}" data-effectiveness="${agent.effectiveness}">
                            <h3>${agent.name}</h3>
                            <p>Стоимость: ${agent.cost}₽</p>
                            <p>Эффективность: +${agent.effectiveness} влияния</p>
                            <p class="agent-perk">${agent.perk}</p>
                            <button class="hire-btn" ${money < agent.cost ? 'disabled' : ''}>Нанять</button>
                        </div>
                    `).join('')}
                </div>
                <p id="hiring-feedback" class="objective-text"></p>
                <button id="continue-hiring-btn" disabled class="secondary-btn">Продолжить</button>
            </div>
        `;

        const hireButtons = document.querySelectorAll('.hire-btn');
        const hiringFeedbackEl = document.getElementById('hiring-feedback');
        const continueHiringBtn = document.getElementById('continue-hiring-btn');

        let hiredAgentsInfluence = 0;

        hireButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const agentCard = e.target.closest('.agent-card');
                const cost = parseInt(agentCard.dataset.cost);
                const effectiveness = parseInt(agentCard.dataset.effectiveness);

                if (money >= cost) {
                    money -= cost;
                    influence += effectiveness;
                    hiredAgentsInfluence += effectiveness;
                    updateUI();
                    e.target.disabled = true;
                    e.target.textContent = 'Нанят!';
                    hiringFeedbackEl.textContent = `Вы наняли ${agentCard.querySelector('h3').textContent}. Влияние: +${effectiveness}, Деньги: -${cost}₽`;
                    showFeedback(`Нанят: ${agentCard.querySelector('h3').textContent}`, true);

                    if (hiredAgentsInfluence >= data.interaction.targetInfluence) {
                        continueHiringBtn.disabled = false;
                        hiringFeedbackEl.textContent = "Достаточно агентов для продолжения!";
                    }

                    // Disable other hire buttons if not enough money
                    hireButtons.forEach(b => {
                        const btnCost = parseInt(b.closest('.agent-card').dataset.cost);
                        if (money < btnCost) {
                            b.disabled = true;
                        }
                    });

                } else {
                    hiringFeedbackEl.textContent = 'Недостаточно денег!';
                    showFeedback('Недостаточно денег!', false);
                }
            });
        });

        continueHiringBtn.addEventListener('click', () => {
            loadStage(data.interaction.nextStage);
        });
    }

    function loadNativeAdvertisingStage(data) {
        stageContainer.innerHTML = `
            <div class="ad-builder-screen">
                <h2>${data.objective}</h2>
                <div id="ad-elements-pool">
                    <div class="ad-column" id="headlines-pool">
                        <h3>Заголовки</h3>
                        ${data.interaction.elements.headlines.map(h => `<div class="ad-item" draggable="true" data-type="headline" data-value="${h.type}">${h.text}</div>`).join('')}
                    </div>
                    <div class="ad-column" id="visuals-pool">
                        <h3>Визуал</h3>
                        ${data.interaction.elements.visuals.map(v => `<div class="ad-item image-item" draggable="true" data-type="visual" data-value="${v.type}"><img src="${v.src}" /></div>`).join('')}
                    </div>
                    <div class="ad-column" id="platforms-pool">
                        <h3>Платформа</h3>
                        ${data.interaction.elements.platforms.map(p => `<div class="ad-item" draggable="true" data-type="platform" data-value="${p.type}">${p.name}</div>`).join('')}
                    </div>
                </div>
                <div id="ad-preview-canvas">
                    <h3>Предпросмотр:</h3>
                    <div class="ad-dropzone" data-type="headline">Перетащите сюда заголовок</div>
                    <div class="ad-dropzone" data-type="visual">Перетащите сюда визуал</div>
                    <div class="ad-dropzone" data-type="platform">Перетащите сюда платформу</div>
                </div>
            </div>
        `;

        interactionFooter.innerHTML = `<button id="launch-ad-btn" disabled>Запустить Рекламу</button>`;
        setupNativeAdvertisingInteraction(data);
    }

    function setupNativeAdvertisingInteraction(stageData) {
        const items = document.querySelectorAll('.ad-item');
        const dropzones = document.querySelectorAll('.ad-dropzone');
        const launchBtn = document.getElementById('launch-ad-btn');
        let selections = { headline: null, visual: null, platform: null };

        // --- MOUSE EVENTS (for desktop) ---
        items.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', item.outerHTML);
                e.dataTransfer.setData('item-type', item.dataset.type);
                e.dataTransfer.setData('item-value', item.dataset.value);
                setTimeout(() => item.classList.add('dragging'), 0);
            });
            item.addEventListener('dragend', () => {
                item.classList.remove('dragging');
                // Restore display of original item after drop
                if (item.parentNode.classList.contains('ad-column')) {
                    item.style.display = 'flex';
                }
            });
        });

        dropzones.forEach(zone => {
            zone.addEventListener('dragover', e => e.preventDefault());
            zone.addEventListener('dragleave', () => zone.classList.remove('hover'));
            zone.addEventListener('drop', (e) => {
                e.preventDefault();
                const itemType = e.dataTransfer.getData('item-type');
                if (itemType === zone.dataset.type) {
                    const itemHTML = e.dataTransfer.getData('text/plain');
                    zone.innerHTML = itemHTML;
                    zone.classList.add('filled');
                    selections[itemType] = e.dataTransfer.getData('item-value');

                    if (selections.headline && selections.visual && selections.platform) {
                        launchBtn.disabled = false;
                    }
                }
            });
        });

        // --- TOUCH EVENTS (for mobile) ---
        let ghostEl = null;
        let currentDraggedAdItem = null;

        items.forEach(item => {
            item.addEventListener('touchstart', (e) => {
                if (e.touches.length === 1) {
                    currentDraggedAdItem = item;
                    
                    ghostEl = item.cloneNode(true);
                    ghostEl.classList.add('ghost');
                    document.body.appendChild(ghostEl);
                    const touch = e.touches[0];
                    ghostEl.style.left = `${touch.pageX - ghostEl.offsetWidth / 2}px`;
                    ghostEl.style.top = `${touch.pageY - ghostEl.offsetHeight / 2}px`;
    
                    item.classList.add('dragging');
                    item.style.visibility = 'hidden'; // Hide original
                }
            }, { passive: true });
        });

        document.addEventListener('touchmove', (e) => {
            if (currentDraggedAdItem && ghostEl) {
                e.preventDefault();
                const touch = e.touches[0];
                
                ghostEl.style.left = `${touch.pageX - ghostEl.offsetWidth / 2}px`;
                ghostEl.style.top = `${touch.pageY - ghostEl.offsetHeight / 2}px`;
                
                dropzones.forEach(zone => {
                    const rect = zone.getBoundingClientRect();
                    if (touch.clientX > rect.left && touch.clientX < rect.right &&
                        touch.clientY > rect.top && touch.clientY < rect.bottom) {
                        zone.classList.add('hover');
                    } else {
                        zone.classList.remove('hover');
                    }
                });
            }
        }, { passive: false });

        document.addEventListener('touchend', (e) => {
            if (currentDraggedAdItem && ghostEl) {
                ghostEl.style.display = 'none';
                const touch = e.changedTouches[0];
                const elementUnder = document.elementFromPoint(touch.clientX, touch.clientY);
                
                let droppedInZone = false;
                dropzones.forEach(zone => {
                    if (zone.classList.contains('hover') && zone.dataset.type === currentDraggedAdItem.dataset.type) {
                        zone.innerHTML = currentDraggedAdItem.cloneNode(true).outerHTML;
                        zone.querySelector('.ad-item').classList.remove('dragging', 'ghost'); // Clean up classes
                        zone.classList.add('filled');
                        selections[zone.dataset.type] = currentDraggedAdItem.dataset.value;
                        droppedInZone = true;
                    }
                    zone.classList.remove('hover');
                });

                if (droppedInZone) {
                    currentDraggedAdItem.style.display = 'none'; // Hide original item from pool
                } else {
                    currentDraggedAdItem.style.visibility = 'visible'; // Restore original item visibility
                }
                currentDraggedAdItem.classList.remove('dragging');
                document.body.removeChild(ghostEl);
                ghostEl = null;
                currentDraggedAdItem = null;

                if (selections.headline && selections.visual && selections.platform) {
                    launchBtn.disabled = false;
                }
            }
        });

        launchBtn.addEventListener('click', () => {
            const solution = stageData.interaction.solution;
            const feedbackData = stageData.interaction.feedback;
            const rewardsData = stageData.interaction.rewards;

            if (selections.headline === solution.headlineType && 
                selections.visual === solution.visualType && 
                selections.platform === solution.platformType) 
            {
                influence += rewardsData.successInfluence;
                money += rewardsData.successMoney;
                showFeedback(feedbackData.success, true);
            } else {
                influence += rewardsData.failureInfluence;
                money += rewardsData.failureMoney;
                showFeedback(feedbackData.failure, false);
            }
            setTimeout(() => loadStage(stageData.interaction.nextStage), 2500);
        });
    }


    function showFeedback(message, isSuccess) {
        const feedbackEl = document.createElement('div');
        feedbackEl.className = `feedback-popup ${isSuccess ? 'success' : 'failure'}`;
        feedbackEl.textContent = message;
        gameScreen.appendChild(feedbackEl); // Append to gameScreen to stay within bounds

        setTimeout(() => {
            feedbackEl.remove();
        }, 2000);
    }


    function endGame() {
        finalInfluenceEl.textContent = influence;
        finalMoneyEl.textContent = money;
        switchScreen(endScreen);
    }

    // --- Event Listeners ---
    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', startGame);
    ctaBtn.addEventListener('click', () => {
        console.log("Redirecting to purchase...");
        if (window.Telegram && window.Telegram.WebApp) {
            window.Telegram.WebApp.close();
        }
    });

    backBtn.addEventListener('click', () => {
        if (previousStageStack.length > 0) {
            const previousStage = previousStageStack.pop();
            loadStage(previousStage);
        } else {
            // If no previous stage, go to start screen or main menu
            switchScreen(startScreen);
        }
    });

    mainMenuBtn.addEventListener('click', () => {
        // Assuming main menu is quests.html one level up
        window.location.href = '../quests.html';
    });


    // Initial load
    setTimeout(() => {
        // Set total stages dynamically based on GAME_DATA
        GAME_DATA.totalStages = GAME_DATA.stages.length;
        switchScreen(startScreen);
    }, 1500);
});
