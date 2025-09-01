document.addEventListener('DOMContentLoaded', () => {
    // Screens & Containers
    const startScreen = document.getElementById('start-screen');
    const gameScreen = document.getElementById('game-screen');
    const endScreen = document.getElementById('end-screen');
    const stageContainer = document.getElementById('stage-container');
    
    // Buttons
    const startBtn = document.getElementById('start-btn');
    const backBtn = document.getElementById('back-btn');
    const mainMenuBtn = document.getElementById('main-menu-btn');
    const ctaBtn = document.getElementById('cta-btn');

    // Game State
    let gameState = {};

    const QUEST_DATA = {
        competitors: [
            {
                id: 'innovate-inc',
                name: 'Innovate Inc.',
                capital: 5000000,
                stages: [
                    {
                        type: 'recon',
                        title: 'Этап 1: Сбор данных',
                        objective: 'Найдите 3 уязвимости в годовом отчете Innovate Inc.',
                        document: `Годовой отчет Innovate Inc. ... Мы гордимся нашим ростом, хотя <span class="clue" data-clue-id="1">затраты на маркетинг выросли вдвое</span>, что сильно давит на бюджет. Наш новый продукт, "Synapse 2.0", готов к запуску, но мы полагаемся на <span class="clue" data-clue-id="2">единственного поставщика ключевых компонентов</span>. Наш ведущий разработчик, Доктор Авангард, является незаменимым, и <span class="clue" data-clue-id="3">его контракт истекает через два месяца</span>. ...`,
                        clues: [
                            { id: '1', text: 'Высокие затраты на маркетинг' },
                            { id: '2', text: 'Зависимость от одного поставщика' },
                            { id: '3', text: 'Риск ухода ключевого сотрудника' }
                        ]
                    },
                    {
                        type: 'strategy',
                        title: 'Этап 2: Разработка стратегии',
                        objective: 'Сопоставьте ваши действия с уязвимостями конкурента.',
                        actions: [
                            { id: 'price-war', text: 'Ценовая война', icon: '💸' },
                            { id: 'poach-employee', text: 'Переманить сотрудника', icon: ' poaching' },
                            { id: 'disrupt-supply', text: 'Сорвать поставки', icon: '🤝' }
                        ]
                    },
                    {
                        type: 'execution',
                        title: 'Этап 3: Исполнение',
                        report: 'СТРАТЕГИЯ В ДЕЙСТВИИ! Акции Innovate Inc. обвалились на 40%! Инвесторы в панике.',
                        capitalChange: { player: 500000, target: -2000000 }
                    },
                    {
                        type: 'crisis',
                        title: 'Этап 4: Ответный удар',
                        scenario: 'Innovate Inc. наносит ответный удар! Они запустили слух о проблемах с вашим флагманским продуктом. Ваши акции начинают падать. Что делать?',
                        options: [
                            { text: 'Опровергнуть публично (+/-)', score: -500000 },
                            { text: 'Запустить ответную PR-кампанию (-)', score: -1000000 },
                            { text: 'Игнорировать (---)', score: -2500000 }
                        ]
                    },
                    {
                        type: 'final-blow',
                        title: 'Этап 5: Финальный удар',
                        objective: 'У вас есть компромат на CEO Innovate Inc. Какой канал использовать для утечки, чтобы нанести максимальный ущерб?',
                        options: [
                            { text: 'Крупное новостное агентство', score: 3000000 },
                            { text: 'Анонимный техно-блог', score: 1500000 },
                            { text: 'Слив в социальные сети', score: 2000000 }
                        ]
                    }
                ]
            }
            // ... more competitors
        ]
    };

    function switchScreen(screen) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        screen.classList.add('active');
    }
    
    function initGame() {
        gameState = {
            playerCapital: 1000000,
            currentTarget: 0,
            currentStage: 0,
            foundClues: [],
            solution: { '1': 'price-war', '2': 'disrupt-supply', '3': 'poach-employee' } // Correct pairings
        };
        switchScreen(gameScreen);
        loadStage();
    }
    
    function loadStage() {
        const competitor = QUEST_DATA.competitors[gameState.currentTarget];
        const stage = competitor.stages[gameState.currentStage];
        
        backBtn.classList.toggle('hidden', gameState.currentStage === 0);

        if(stage.type === 'recon') {
            loadReconStage(stage);
        } else if (stage.type === 'strategy') {
            loadStrategyStage(stage);
        } else if (stage.type === 'execution') {
            loadExecutionStage(stage);
        } else if (stage.type === 'crisis' || stage.type === 'final-blow') {
            loadChoiceStage(stage);
        }
    }
    
    function loadExecutionStage(stageData) {
        stageContainer.innerHTML = `
            <div class="execution-stage">
                <h2>${stageData.title}</h2>
                <div class="news-ticker"><p>${stageData.report}</p></div>
            </div>
        `;
        interactionFooter.innerHTML = '';

        // Animate capital change
        setTimeout(() => {
            updateCapital(stageData.capitalChange.player, stageData.capitalChange.target);
            gameState.currentStage++;
            setTimeout(loadStage, 3000); // Wait for animation and reading
        }, 1000);
    }
    
    function loadChoiceStage(stageData) {
        stageContainer.innerHTML = `
            <div class="crisis-stage">
                <h2>${stageData.title}</h2>
                <p>${stageData.scenario || stageData.objective}</p>
            </div>
        `;
        const optionsHTML = stageData.options.map(opt => 
            `<button class="option-btn" data-score="${opt.score}">${opt.text}</button>`
        ).join('');
        interactionFooter.innerHTML = `<div class="options-container">${optionsHTML}</div>`;

        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const scoreChange = parseInt(btn.dataset.score);
                updateCapital(scoreChange, -scoreChange); // Assuming counter-effect on target
                
                gameState.currentStage++;
                if (gameState.currentStage >= QUEST_DATA.competitors[gameState.currentTarget].stages.length) {
                    setTimeout(() => switchScreen(endScreen), 1500);
                } else {
                    loadStage();
                }
            });
        });
    }

    function updateCapital(playerChange, targetChange) {
        const playerEl = document.getElementById('player-capital');
        const targetEl = document.getElementById('target-capital');
        
        const startPlayerCapital = gameState.playerCapital;
        const startTargetCapital = QUEST_DATA.competitors[gameState.currentTarget].capital;

        gameState.playerCapital += playerChange;
        QUEST_DATA.competitors[gameState.currentTarget].capital += targetChange;

        const endPlayerCapital = gameState.playerCapital;
        const endTargetCapital = QUEST_DATA.competitors[gameState.currentTarget].capital;

        animateValue(playerEl, startPlayerCapital, endPlayerCapital, 1500);
        animateValue(targetEl, startTargetCapital, endTargetCapital, 1500);
        
        // Add some visual feedback
        playerEl.style.color = playerChange >= 0 ? 'var(--success-color)' : 'var(--error-color)';
        targetEl.style.color = targetChange >= 0 ? 'var(--success-color)' : 'var(--error-color)'; // Note: logic might need adjustment based on desired effect
        setTimeout(() => {
            playerEl.style.color = 'var(--success-color)';
            targetEl.style.color = 'var(--primary-text)';
        }, 1600);
    }

    function animateValue(element, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const currentValue = Math.floor(progress * (end - start) + start);
            element.textContent = currentValue.toLocaleString();
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    function loadStrategyStage(stageData) {
        stageContainer.innerHTML = `
            <div class="strategy-stage">
                <h2>${stageData.title}</h2>
                <p>${stageData.objective}</p>
                <div class="strategy-board">
                    <div class="weaknesses-column">
                        <h3>Найденные уязвимости:</h3>
                        ${gameState.foundClues.map(clue => `<div class="weakness-slot" data-correct-action="${gameState.solution[clue.id]}" data-clue-id="${clue.id}">${clue.text}</div>`).join('')}
                    </div>
                    <div class="actions-column">
                        <h3>Доступные действия:</h3>
                        ${stageData.actions.map(action => `<div class="action-card" draggable="true" data-action-id="${action.id}">${action.icon} ${action.text}</div>`).join('')}
                    </div>
                </div>
            </div>
        `;
        setupDragAndDropForStrategy(stageData);
    }

    function setupDragAndDropForStrategy(stageData) {
        const cards = document.querySelectorAll('.action-card');
        const slots = document.querySelectorAll('.weakness-slot');
        let draggedItem = null; // Used for touch events

        // --- MOUSE EVENTS (for desktop) ---
        cards.forEach(card => {
            card.addEventListener('dragstart', e => {
                e.dataTransfer.setData('text/plain', card.dataset.actionId);
                setTimeout(() => card.classList.add('dragging'), 0);
            });
            card.addEventListener('dragend', () => {
                card.classList.remove('dragging');
            });
        });

        slots.forEach(slot => {
            slot.addEventListener('dragover', e => {
                e.preventDefault();
                slot.classList.add('hover');
            });
            slot.addEventListener('dragleave', () => {
                slot.classList.remove('hover');
            });
            slot.addEventListener('drop', e => {
                e.preventDefault();
                const actionId = e.dataTransfer.getData('text/plain');
                const draggedCard = document.querySelector(`[data-action-id="${actionId}"]`);
                handleDrop(slot, draggedCard);
            });
        });
        
        // --- TOUCH EVENTS (for mobile) ---
        let ghostEl = null;

        cards.forEach(card => {
            card.addEventListener('touchstart', e => {
                if (e.touches.length === 1) {
                    draggedItem = card;
                    ghostEl = card.cloneNode(true);
                    ghostEl.classList.add('ghost');
                    document.body.appendChild(ghostEl);
                    const touch = e.touches[0];
                    moveGhost(touch.pageX, touch.pageY);
                    card.classList.add('dragging');
                }
            }, { passive: true });
        });

        document.addEventListener('touchmove', e => {
            if (draggedItem && ghostEl) {
                e.preventDefault();
                const touch = e.touches[0];
                moveGhost(touch.pageX, touch.pageY);

                ghostEl.style.display = 'none';
                const elementUnder = document.elementFromPoint(touch.clientX, touch.clientY);
                ghostEl.style.display = 'flex';

                slots.forEach(s => s.classList.remove('hover'));
                if (elementUnder && elementUnder.classList.contains('weakness-slot') && !elementUnder.querySelector('.action-card')) {
                    elementUnder.classList.add('hover');
                }
            }
        }, { passive: false });

        document.addEventListener('touchend', e => {
            if (draggedItem && ghostEl) {
                ghostEl.style.display = 'none';
                const elementUnder = document.elementFromPoint(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
                
                if (elementUnder && elementUnder.classList.contains('weakness-slot')) {
                    handleDrop(elementUnder, draggedItem);
                }
                
                // Cleanup
                slots.forEach(s => s.classList.remove('hover'));
                draggedItem.classList.remove('dragging');
                document.body.removeChild(ghostEl);
                ghostEl = null;
                draggedItem = null;
            }
        });

        function moveGhost(x, y) {
            if(ghostEl) {
                ghostEl.style.left = `${x - ghostEl.offsetWidth / 2}px`;
                ghostEl.style.top = `${y - ghostEl.offsetHeight / 2}px`;
            }
        }
        
        function handleDrop(slot, card) {
            if (card && !slot.querySelector('.action-card')) {
                slot.innerHTML = ''; // Clear the "Перетащите сюда" text
                slot.appendChild(card);
                slot.classList.add('filled');
                slot.classList.remove('hover');

                const allFilled = [...slots].every(s => s.querySelector('.action-card'));
                if (allFilled) {
                    const footer = document.getElementById('interaction-footer');
                    footer.innerHTML = `<button id="evaluate-btn" class="evaluate-button">Оценить Стратегию</button>`;
                    footer.querySelector('#evaluate-btn').addEventListener('click', evaluateStrategy);
                }
            }
        }
    }

    function evaluateStrategy() {
        const slots = document.querySelectorAll('.weakness-slot');
        let correctMoves = 0;
        slots.forEach(slot => {
            const placedCard = slot.querySelector('.action-card');
            const correctAction = slot.dataset.correctAction;
            if(placedCard && placedCard.dataset.actionId === correctAction) {
                correctMoves++;
                slot.style.borderColor = 'var(--success-color)';
                placedCard.style.filter = 'brightness(1.2)';
            } else {
                slot.style.borderColor = 'var(--error-color)';
                if(placedCard) placedCard.style.opacity = '0.5';
            }
        });

        const allSlots = slots.length;

        // Disable button after clicking
        const evalBtn = document.getElementById('evaluate-btn');
        if(evalBtn) evalBtn.disabled = true;

        setTimeout(() => {
            if(correctMoves === allSlots) {
                // Perfect strategy
                updateCapital(1000000, -1500000); // Reward for success
                gameState.currentStage++;
                loadStage();
            } else {
                alert(`Стратегия не сработала. Верных ходов: ${correctMoves} из ${allSlots}. Анализируйте лучше.`);
                updateCapital(-250000, 0); // Penalty for failure
                loadStage(); // Reload the stage to let user try again
            }
        }, 2000);
    }

    function loadReconStage(stageData) {
        stageContainer.innerHTML = `
            <div class="recon-stage">
                <h2>${stageData.title}</h2>
                <p>${stageData.objective}</p>
                <div class="document-viewer">${stageData.document}</div>
                <p id="clues-found">Найдено уязвимостей: 0 / ${stageData.clues.length}</p>
            </div>
        `;

        const clues = document.querySelectorAll('.clue');
        clues.forEach(clueEl => {
            clueEl.addEventListener('click', () => {
                if(!clueEl.classList.contains('found')) {
                    clueEl.classList.add('found');
                    const clueId = clueEl.dataset.clueId;
                    const foundClue = stageData.clues.find(c => c.id === clueId);
                    gameState.foundClues.push(foundClue);
                    
                    document.getElementById('clues-found').textContent = `Найдено уязвимостей: ${gameState.foundClues.length} / ${stageData.clues.length}`;

                    if(gameState.foundClues.length === stageData.clues.length) {
                        // Advance to next stage
                        setTimeout(() => {
                            gameState.currentStage++;
                            loadStage();
                        }, 1000);
                    }
                }
            });
        });
    }

    // Navigation Listeners
    mainMenuBtn.addEventListener('click', () => {
        window.location.href = '../quests.html'; 
    });
    
    backBtn.addEventListener('click', () => {
        if (gameState.currentStage > 0) {
            gameState.currentStage--;
            loadStage();
        }
    });

    startBtn.addEventListener('click', initGame);

    // Initial Load
    setTimeout(() => {
        switchScreen(startScreen);
    }, 1000);

});
