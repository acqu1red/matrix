/* eslint-disable no-unused-vars */
const UI = (() => {
    // Cache DOM elements
    const screens = {
        loading: document.getElementById('loading-screen'),
        start: document.getElementById('start-screen'),
        game: document.getElementById('game-screen'),
        end: document.getElementById('end-screen')
    };
    const canvas = document.getElementById('background-canvas');
    const stageContainer = document.getElementById('stage-container');
    const playerHandContainer = document.getElementById('player-hand-container');
    const competitorNameEl = document.getElementById('competitor-name');
    const healthBarEl = document.getElementById('health-bar');
    const finalScoreEl = document.getElementById('final-score');
    const defeatedCompetitorNameEl = document.getElementById('defeated-competitor-name');

    const switchScreen = (screenName) => {
        const activeScreen = document.querySelector('.screen.active');
        const newScreen = screens[screenName];
        
        if (activeScreen) {
            activeScreen.classList.remove('active');
        }
        if (newScreen) {
            newScreen.classList.add('active');
        }
    };

    const showFeedback = (message, isSuccess) => {
        const feedbackEl = document.createElement('div');
        feedbackEl.className = `feedback-popup ${isSuccess ? 'success' : 'failure'}`;
        feedbackEl.textContent = message;
        document.body.appendChild(feedbackEl);
        setTimeout(() => feedbackEl.remove(), 2500);
    };
    
    const updateHealthBar = (health) => {
        healthBarEl.style.width = `${health}%`;
    };

    const renderReconStage = (stage, competitor, onComplete) => {
        competitorNameEl.textContent = competitor.name;
        stageContainer.innerHTML = `
            <div class="stage-intro animate-fade-in">
                <h2>${stage.title}</h2>
                <p>${stage.description}</p>
            </div>
            <div class="documents animate-fade-in" style="animation-delay: 0.3s;">
                <div class="doc" data-weakness="finance">Отличные финансовые показатели, рост +30%</div>
                <div class="doc" data-weakness="tech">Прорывная технология, патенты защищены</div>
                <div class="doc correct" data-weakness="pr">Скандал с CEO, который пытаются скрыть. Репутация под угрозой.</div>
            </div>`;
        playerHandContainer.innerHTML = '';
        
        document.querySelectorAll('.doc').forEach(doc => {
            doc.addEventListener('click', (e) => {
                // Prevent multiple clicks
                document.querySelectorAll('.doc').forEach(d => d.style.pointerEvents = 'none');
                
                e.currentTarget.classList.add('selected');

                if(e.currentTarget.classList.contains('correct')) {
                    showFeedback('Уязвимость найдена! Их репутация - слабое место.', true);
                    onComplete(competitor.weakness);
                } else {
                    showFeedback('Это их сильная сторона. Ищите дальше.', false);
                }
            });
        });
    };
    
    const renderHireStage = (stage, specialists, onComplete) => {
        stageContainer.innerHTML = `
            <div class="stage-intro animate-fade-in">
                <h2>${stage.title}</h2>
                <p>${stage.description}</p>
            </div>
            <div class="specialists-container animate-fade-in" style="animation-delay: 0.3s;">
                ${specialists.map(sp => `
                    <div class="specialist-card" data-id="${sp.id}">
                        <h3>${sp.name}</h3>
                        <p>${sp.description}</p>
                        <span>Нанять</span>
                    </div>
                `).join('')}
            </div>
        `;
        playerHandContainer.innerHTML = '';

        document.querySelectorAll('.specialist-card').forEach(card => {
            card.addEventListener('click', (e) => {
                 document.querySelectorAll('.specialist-card').forEach(c => c.style.pointerEvents = 'none');
                 e.currentTarget.classList.add('selected');
                 showFeedback(`${e.currentTarget.querySelector('h3').textContent} присоединяется к команде.`, true);
                 onComplete(e.currentTarget.dataset.id);
            });
        });
    };

    const renderExploitStage = (stage, competitor, actions, specialist, onComplete) => {
         stageContainer.innerHTML = `
            <div class="stage-intro animate-fade-in">
                <h2>${stage.title}</h2>
                <p>${stage.description}</p>
            </div>
            <div class="competitor-profile drop-zone animate-fade-in" style="animation-delay: 0.3s;" data-competitor-id="${competitor.id}">
                <img src="${competitor.portrait}" alt="${competitor.name}">
                <h3>${competitor.name}</h3>
            </div>
        `;

        let cardsHtml = '';
        for(const actionId in actions) {
            const action = actions[actionId];
            // If player hired a specialist, only show cards of that type
            const is specialistAction = specialist && action.type === specialist.skill;
            if (specialistAction || !specialist) { // Show all if no specialist
                 cardsHtml += `
                    <div class="action-card" draggable="true" data-action="${actionId}">
                        <div class="card-icon">${action.icon}</div>
                        <div class="card-title">${action.name}</div>
                        <div class="card-cost">Стоимость: ${action.cost}</div>
                    </div>
                `;
            }
        }
        playerHandContainer.innerHTML = `<div class="card-hand">${cardsHtml}</div>`;
        
        // Animate cards into view
        document.querySelectorAll('.action-card').forEach((card, index) => {
            card.style.animation = `dealIn 0.5s ease forwards ${index * 0.15}s`;
        });

        setupDragAndDrop(onComplete);
    };

     const renderSabotageStage = (stage, onComplete) => {
        stageContainer.innerHTML = `
            <div class="stage-intro animate-fade-in">
                <h2>${stage.title}</h2>
                <p>${stage.description}</p>
            </div>
            <div class="sabotage-container animate-fade-in" style="animation-delay: 0.3s;">
                <p>Нажмите, чтобы начать финальную атаку!</p>
                <button id="sabotage-btn" class="final-attack-btn">САБОТАЖ</button>
            </div>
        `;
        playerHandContainer.innerHTML = '';

        document.getElementById('sabotage-btn').addEventListener('click', (e) => {
            e.currentTarget.classList.add('activated');
            e.currentTarget.textContent = 'ВЗЛОМ СИСТЕМЫ...';
            e.currentTarget.disabled = true;
            showFeedback('Операция началась!', true);
            onComplete();
        });
    };

    const setupDragAndDrop = (onDrop) => {
        const cards = document.querySelectorAll('.action-card');
        const dropZone = document.querySelector('.drop-zone');
        let draggedItem = null;
        let ghostEl = null;

        // Mouse events
        cards.forEach(card => {
            card.addEventListener('dragstart', e => {
                e.dataTransfer.setData('text/plain', card.dataset.action);
                setTimeout(() => card.classList.add('dragging'), 0);
            });
            card.addEventListener('dragend', () => card.classList.remove('dragging'));
        });
        if (dropZone) {
            dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('hover'); });
            dropZone.addEventListener('dragleave', () => dropZone.classList.remove('hover'));
            dropZone.addEventListener('drop', e => {
                e.preventDefault();
                dropZone.classList.remove('hover');
                onDrop(e.dataTransfer.getData('text/plain'));
                playerHandContainer.innerHTML = ''; // Clear hand after playing a card
            });
        }
        
        // Touch events
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
                if(dropZone) dropZone.classList.remove('hover');
            }
        }, { passive: false });
        
        document.addEventListener('touchend', e => {
            if (!draggedItem || !ghostEl) return;
            const touch = e.changedTouches[0];
            ghostEl.style.display = 'none';
            const elementUnder = document.elementFromPoint(touch.clientX, touch.clientY);
            if (elementUnder && elementUnder.closest('.drop-zone')) {
                onDrop(draggedItem.dataset.action);
                playerHandContainer.innerHTML = ''; // Clear hand after playing a card
            }
            if(dropZone) dropZone.classList.remove('hover');
            draggedItem.classList.remove('dragging');
            document.body.removeChild(ghostEl);
            ghostEl = null;
            draggedItem = null;
        });
    };

    // Public API
    return {
        switchScreen,
        showFeedback,
        updateHealthBar,
        renderReconStage,
        renderHireStage,
        renderExploitStage,
        renderSabotageStage
    };
})();
