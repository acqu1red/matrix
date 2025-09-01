import { QUEST_DATA } from './competitors-data.js';
import { switchScreen, updateProgress, showFeedback, getStageIndexById, navigateToHome } from './competitors-utils.js';

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
    const backBtn = document.getElementById('back-btn');
    const mainMenuBtn = document.getElementById('main-menu-btn');

    // Game UI Elements (referencing them from competitors-utils where they are managed)
    const progressBar = document.getElementById('progress-bar');
    const budgetValueEl = document.getElementById('budget-value');
    const influenceValueEl = document.getElementById('influence-value');
    const finalBudgetEl = document.getElementById('final-budget');
    const finalInfluenceEl = document.getElementById('final-influence');

    // Global game state (moved here from competitors-utils since it's central to game flow)
    let currentStageIndex = 0;
    let userBudget = 1000;
    let userInfluence = 0;
    let stageHistory = []; // To support the back button

    function startGame() {
        currentStageIndex = 0;
        userBudget = 1000;
        userInfluence = 0;
        stageHistory = [];
        switchScreen(loaderScreen); // Show loader initially
        setTimeout(() => {
            switchScreen(gameScreen);
            loadStage(currentStageIndex);
        }, 1000); // Simulate loading
    }

    function loadStage(index) {
        if (index === 'end' || index >= QUEST_DATA.stages.length) {
            endGame();
            return;
        }

        // Save current stage to history for 'Back' button
        if (currentStageIndex !== index) { // Prevent adding same stage twice on initial load
            stageHistory.push(currentStageIndex);
        }
        currentStageIndex = index;

        // Update progress and stats using utility function
        updateProgress(currentStageIndex, QUEST_DATA.totalStages, userBudget, userInfluence, progressBar, budgetValueEl, influenceValueEl);

        const stageData = QUEST_DATA.stages[currentStageIndex];
        stageContainer.innerHTML = '';
        interactionFooter.innerHTML = '';

        // Enable/disable back button
        if (stageHistory.length > 0) {
            backBtn.disabled = false;
        } else {
            backBtn.disabled = true;
        }

        // Apply global stage transition
        gameScreen.classList.add('stage-transition');
        setTimeout(() => {
            gameScreen.classList.remove('stage-transition');
        }, 500); // Duration of the transition

        if (stageData.type === 'dialogue') {
            loadDialogueStage(stageData);
        } else if (stageData.type === 'competitor-analysis') {
            loadCompetitorAnalysisStage(stageData);
        } else if (stageData.type === 'native-ad') {
            loadNativeAdStage(stageData);
        }
    }

    function loadDialogueStage(data) {
        stageContainer.innerHTML = `
            <div class="stage-content character-scene">
                <div class="dialogue-box">
                    <p class="character-name">${data.character.name}</p>
                    <p>${data.dialogue}</p>
                </div>
                <img src="${data.character.portrait}" alt="${data.character.name}" class="character-portrait">
                <p class="objective-text">${data.objective}</p>
            </div>
        `;

        if (data.interaction.type === 'next-button') {
            const nextButton = document.createElement('button');
            nextButton.textContent = data.interaction.buttonText || 'Продолжить';
            nextButton.addEventListener('click', () => {
                loadStage(getStageIndexById(data.interaction.nextStage, QUEST_DATA.stages));
            });
            interactionFooter.appendChild(nextButton);
        } else if (data.interaction.type === 'button-choice') {
            const optionsHTML = data.interaction.options.map(opt => 
                `<button class="option-btn" data-cost="${opt.cost}" data-influence="${opt.influence}" data-feedback="${opt.feedback}" data-correct="${opt.correct}">${opt.text}</button>`
            ).join('');
            const optionsContainer = document.createElement('div');
            optionsContainer.classList.add('options-container');
            optionsContainer.innerHTML = optionsHTML;
            interactionFooter.appendChild(optionsContainer);
            setupButtonChoices(data);
        } else if (data.interaction.type === 'end-game') {
            const endButton = document.createElement('button');
            endButton.textContent = data.interaction.buttonText || 'Завершить';
            endButton.addEventListener('click', () => {
                endGame();
            });
            interactionFooter.appendChild(endButton);
        }
    }

    function loadCompetitorAnalysisStage(data) {
        stageContainer.innerHTML = `
            <div class="stage-content">
                <h3>${data.competitor.name}</h3>
                <p class="objective-text">${data.objective}</p>
                <div class="competitor-drop-zone" data-target-id="${data.competitor.name}">
                    <img src="${data.competitor.logo}" alt="${data.competitor.name} Logo">
                    <p>Перетащите сюда карту слабости</p>
                </div>
            </div>
        `;

        const cardsHTML = data.analysisCards.map(card => `
            <div class="competitor-card" draggable="true" data-card-id="${card.id}" data-cost="${card.cost}">
                <div class="card-icon">${card.icon}</div>
                <div class="card-name">${card.name} ($${card.cost})</div>
            </div>
        `).join('');
        interactionFooter.innerHTML = `<div id="competitor-cards-container">${cardsHTML}</div>`;
        
        setupDragAndDrop(data);
    }

    function loadNativeAdStage(data) {
        const interaction = data.interaction;
        stageContainer.innerHTML = `
            <div class="stage-content ad-builder-screen">
                <h3>Создание нативной рекламы</h3>
                <p class="objective-text">${data.objective}</p>
                <div id="ad-elements-container">
                    <div class="ad-element-column">
                        <h4>Заголовок</h4>
                        ${interaction.elements.headlines.map(e => `<div class="ad-item" draggable="true" data-type="headline" data-value="${e.type}">${e.text}</div>`).join('')}
                    </div>
                    <div class="ad-element-column">
                        <h4>Текст</h4>
                        ${interaction.elements.bodies.map(e => `<div class="ad-item" draggable="true" data-type="body" data-value="${e.type}">${e.text}</div>`).join('')}
                    </div>
                    <div class="ad-element-column">
                        <h4>Призыв к действию</h4>
                        ${interaction.elements.callsToAction.map(e => `<div class="ad-item" draggable="true" data-type="callToAction" data-value="${e.type}">${e.text}</div>`).join('')}
                    </div>
                </div>
                <div id="ad-preview">
                    <h4>Предварительный просмотр:</h4>
                    <div class="ad-dropzone" data-type="headline">Заголовок...</div>
                    <div class="ad-dropzone" data-type="body">Основной текст...</div>
                    <div class="ad-dropzone" data-type="callToAction">Призыв к действию...</div>
                </div>
            </div>
        `;

        interactionFooter.innerHTML = `<button id="launch-ad-btn" disabled>Запустить Рекламу</button>`;
        setupNativeAdInteraction(data);
    }

    function setupDragAndDrop(stageData) {
        const cards = document.querySelectorAll('.competitor-card');
        const dropZone = document.querySelector('.competitor-drop-zone');
        let draggedItem = null;

        // --- MOUSE EVENTS (for desktop) ---
        cards.forEach(card => {
            card.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', card.dataset.cardId);
                setTimeout(() => card.classList.add('dragging'), 0);
            });
    
            card.addEventListener('dragend', () => {
                card.classList.remove('dragging');
                dropZone.classList.remove('hover'); // Ensure hover class is removed
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
            handleDrop(droppedCardId, stageData, cards, dropZone);
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
    
                if (elementUnder && elementUnder.classList.contains('competitor-drop-zone')) {
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
                
                if (elementUnder && elementUnder.classList.contains('competitor-drop-zone')) {
                    const droppedCardId = draggedItem.dataset.cardId;
                    handleDrop(droppedCardId, stageData, cards, dropZone);
                }
                
                // Cleanup
                dropZone.classList.remove('hover');
                draggedItem.classList.remove('dragging');
                document.body.removeChild(ghostEl);
                ghostEl = null;
                draggedItem = null;
            }
        });

        function handleDrop(cardId, stageData, allCards, targetDropZone) {
            const cardCost = parseInt(draggedItem.dataset.cost);

            if (userBudget < cardCost) {
                showFeedback("Недостаточно бюджета для этой операции!", false, gameScreen);
                // Reset card if not enough budget
                draggedItem.classList.remove('dragging');
                if (ghostEl) { document.body.removeChild(ghostEl); ghostEl = null; }
                draggedItem = null;
                return; // Stop if not enough budget
            }

            userBudget -= cardCost;

            const result = stageData.responses[cardId];
            userInfluence += result.influenceChange;
            
            showFeedback(result.feedback, result.influenceChange > 0, gameScreen);
            
            // Animate the card into the drop zone and remove others
            const droppedCardEl = draggedItem;
            droppedCardEl.style.position = 'absolute';
            droppedCardEl.style.transition = 'all 0.5s ease-in-out';

            const dropZoneRect = targetDropZone.getBoundingClientRect();
            const cardRect = droppedCardEl.getBoundingClientRect();

            droppedCardEl.style.left = `${dropZoneRect.left + (dropZoneRect.width / 2) - (cardRect.width / 2)}px`;
            droppedCardEl.style.top = `${dropZoneRect.top + (dropZoneRect.height / 2) - (cardRect.height / 2)}px`;
            droppedCardEl.style.transform = 'scale(0.8)';
            droppedCardEl.style.zIndex = '50';
            droppedCardEl.classList.remove('dragging');
            droppedCardEl.classList.add('dropped');

            // Hide other cards immediately
            allCards.forEach(c => {
                if (c !== droppedCardEl) {
                    c.style.display = 'none';
                }
                c.draggable = false; // Disable dragging for all cards
            });

            // Replace drop zone content with the dropped card visually
            targetDropZone.innerHTML = '';
            targetDropZone.appendChild(droppedCardEl);
            droppedCardEl.style.position = 'relative'; // Reset position after animation
            droppedCardEl.style.left = '0';
            droppedCardEl.style.top = '0';

            setTimeout(() => {
                loadStage(getStageIndexById(result.nextStage, QUEST_DATA.stages));
            }, 2500); // Increased delay for animation
        }
    }

    function setupButtonChoices(stageData) {
        const optionBtns = document.querySelectorAll('.option-btn');
        optionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.currentTarget;
                const cost = parseInt(target.dataset.cost || 0);
                const influence = parseInt(target.dataset.influence || 0);
                const feedback = target.dataset.feedback;
                const isCorrect = target.dataset.correct === 'true';

                if (userBudget >= cost) {
                    userBudget -= cost;
                    userInfluence += influence;
                    showFeedback(feedback, isCorrect, gameScreen); // Pass gameScreen for feedback
                } else {
                    showFeedback("Недостаточно бюджета для этого решения!", false, gameScreen); // Improved feedback
                    return;
                }

                optionBtns.forEach(b => {
                    b.disabled = true;
                    if (b.dataset.correct === 'true') {
                        b.classList.add('correct');
                    } else {
                        b.classList.add('incorrect');
                    }
                });

                setTimeout(() => {
                    loadStage(getStageIndexById(stageData.interaction.nextStage, QUEST_DATA.stages));
                }, 2500);
            });
        });

        // Visual feedback for options: on hover, add a subtle glow
        optionBtns.forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                if (!btn.disabled) {
                    btn.style.boxShadow = '0 0 10px rgba(140, 75, 255, 0.5)';
                }
            });
            btn.addEventListener('mouseleave', () => {
                if (!btn.disabled) {
                    btn.style.boxShadow = 'none';
                }
            });
        });
    }

    function setupNativeAdInteraction(stageData) {
        const items = document.querySelectorAll('.ad-item');
        const dropzones = document.querySelectorAll('.ad-dropzone');
        const launchBtn = document.getElementById('launch-ad-btn');
        let selections = { headline: null, body: null, callToAction: null };

        function updateAdPreview() {
            dropzones.forEach(zone => {
                const type = zone.dataset.type;
                if (selections[type]) {
                    const selectedItem = stageData.interaction.elements[type+'s'].find(e => e.type === selections[type]);
                    zone.innerHTML = `<p>${selectedItem.text}</p>`;
                    zone.classList.add('filled');
                } else {
                    zone.innerHTML = type === 'headline' ? `Заголовок...` : (type === 'body' ? `Основной текст...` : `Призыв к действию...`);
                    zone.classList.remove('filled');
                }
            });
        }

        let ghostAdEl = null;
        items.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', item.dataset.type + ':' + item.dataset.value);
                e.dataTransfer.setData('item-text', item.textContent);
                setTimeout(() => item.style.opacity = '0.5', 0);
            });
            item.addEventListener('dragend', () => {
                item.style.opacity = '1';
            });

            item.addEventListener('touchstart', (e) => {
                if (e.touches.length === 1) {
                    draggedItem = item;
                    ghostAdEl = item.cloneNode(true);
                    ghostAdEl.classList.add('ghost');
                    ghostAdEl.style.width = `${item.offsetWidth}px`;
                    document.body.appendChild(ghostAdEl);
                    const touch = e.touches[0];
                    ghostAdEl.style.left = `${touch.pageX - ghostAdEl.offsetWidth / 2}px`;
                    ghostAdEl.style.top = `${touch.pageY - ghostAdEl.offsetHeight / 2}px`;
                    item.style.opacity = '0.5';
                }
            }, { passive: true });
        });

        document.addEventListener('touchmove', (e) => {
            if (draggedItem && ghostAdEl) {
                e.preventDefault();
                const touch = e.touches[0];
                ghostAdEl.style.left = `${touch.pageX - ghostAdEl.offsetWidth / 2}px`;
                ghostAdEl.style.top = `${touch.pageY - ghostAdEl.offsetHeight / 2}px`;

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
            if (draggedItem && ghostAdEl) {
                const touch = e.changedTouches[0];
                ghostAdEl.remove();
                ghostAdEl = null;
                draggedItem.style.opacity = '1';
                
                let dropped = false;
                dropzones.forEach(zone => {
                    const rect = zone.getBoundingClientRect();
                    if (touch.clientX > rect.left && touch.clientX < rect.right &&
                        touch.clientY > rect.top && touch.clientY < rect.bottom) 
                    {
                        const itemType = draggedItem.dataset.type;
                        const itemValue = draggedItem.dataset.value;
                        const itemText = draggedItem.textContent;

                        if (itemType === zone.dataset.type) {
                            selections[itemType] = itemValue;
                            zone.innerHTML = `<div class="ad-item-dropped">${itemText}</div>`; // New div for styling
                            zone.classList.add('filled');
                            updateAdPreview();
                            dropped = true;
                        }
                    }
                    zone.classList.remove('hover');
                });

                draggedItem = null;

                if (selections.headline && selections.body && selections.callToAction) {
                    launchBtn.disabled = false;
                } else {
                    launchBtn.disabled = true;
                }
            }
        });
        
        dropzones.forEach(zone => {
            zone.addEventListener('dragover', e => e.preventDefault());
            zone.addEventListener('drop', (e) => {
                e.preventDefault();
                const [itemType, itemValue] = e.dataTransfer.getData('text/plain').split(':');
                const itemText = e.dataTransfer.getData('item-text');

                if (itemType === zone.dataset.type) {
                    selections[itemType] = itemValue;
                    zone.innerHTML = `<div class="ad-item-dropped">${itemText}</div>`; // New div for styling
                    zone.classList.add('filled');
                    updateAdPreview();
                }

                if (selections.headline && selections.body && selections.callToAction) {
                    launchBtn.disabled = false;
                }
            });
        });

        launchBtn.addEventListener('click', () => {
            const solution = stageData.interaction.solution;
            const feedbackData = stageData.interaction.feedback;
            const scoreData = stageData.interaction.score;

            let isCorrect = (selections.headline === solution.headlineType && 
                             selections.body === solution.bodyType && 
                             selections.callToAction === solution.callToActionType);

            if (isCorrect) {
                userInfluence += scoreData.success;
                showFeedback(feedbackData.success, true, gameScreen);
            } else {
                userBudget += scoreData.failure; // Negative score is a cost
                showFeedback(feedbackData.failure, false, gameScreen);
            }
            currentStageIndex = getStageIndexById(stageData.interaction.nextStage, QUEST_DATA.stages);
            setTimeout(() => loadStage(currentStageIndex), 2500);
        });
    }

    function endGame() {
        finalBudgetEl.textContent = `$${userBudget}`;
        finalInfluenceEl.textContent = userInfluence;
        switchScreen(endScreen);
    }

    // Event Listeners
    startBtn.addEventListener('click', startGame);
    ctaBtn.addEventListener('click', () => {
        console.log("Redirecting to purchase...");
        if (window.Telegram && window.Telegram.WebApp) {
            window.Telegram.WebApp.close();
        }
    });

    backBtn.addEventListener('click', () => {
        if (stageHistory.length > 0) {
            const prevStageIndex = stageHistory.pop();
            loadStage(prevStageIndex);
        }
    });

    mainMenuBtn.addEventListener('click', () => {
        navigateToHome();
    });

    // Initial load
    setTimeout(() => {
        switchScreen(startScreen);
    }, 1500);
});
