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
        
        if(stage.type === 'recon') {
            loadReconStage(stage);
        } else if (stage.type === 'strategy') {
            loadStrategyStage(stage);
        }
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
                    document.getElementById('interaction-footer').innerHTML = `<button id="evaluate-btn">Оценить Стратегию</button>`;
                    document.getElementById('evaluate-btn').addEventListener('click', evaluateStrategy);
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
            } else {
                slot.style.borderColor = 'var(--error-color)';
            }
        });

        if(correctMoves === slots.length) {
            alert("Гениальная стратегия! Конкурент несет убытки.");
            // Advance to end screen for now
            setTimeout(() => {
                // Update company stats before finishing
                document.getElementById('player-capital').textContent = '10,000,000';
                document.getElementById('target-capital').textContent = '500,000';
                switchScreen(endScreen)
            }, 2000);
        } else {
            alert(`Стратегия провальна! ${correctMoves} из ${slots.length} ходов верны. Попробуйте еще раз.`);
            // For now, we'll just show the result. A reset mechanic could be added here.
            loadStage(); // Reload the stage
        }
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
    
    startBtn.addEventListener('click', initGame);

    // Initial Load
    setTimeout(() => {
        switchScreen(startScreen);
    }, 1000);

});
