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

    // Game UI Elements
    const progressBar = document.getElementById('progress-bar');
    const scoreValueEl = document.getElementById('score-value');
    const finalScoreEl = document.getElementById('final-score');

    let currentStage = 0;
    let score = 0;
    
    // --- STORY DATA ---
    const QUEST_DATA = {
        totalStages: 3,
        stages: [
            // --- STAGE 0: The Intern ---
            {
                type: 'dialogue',
                character: {
                    name: 'Марк, амбициозный стажер',
                    portrait: '../assets/photovideo/mulacoin.png' // Placeholder image
                },
                dialogue: "Я не уверен, что стоит передавать этот отчет начальству. Он слишком смелый, нас могут уволить. Лучше просто сделаем, как обычно.",
                objective: "Убедите Марка рискнуть, используя правильный метод влияния.",
                interaction: {
                    type: 'drag-drop',
                    prompt: "Перетащите карту на стажера:",
                    cards: [
                        { id: 'logic', name: 'Логика', icon: '🧠' },
                        { id: 'flattery', name: 'Лесть', icon: '🏆' },
                        { id: 'threat', name: 'Угроза', icon: '😡' }
                    ],
                    correctCard: 'flattery',
                    responses: {
                        flattery: { score: 50, feedback: "Верно! Вы подчеркнули его уникальность. Теперь он ваш союзник.", nextStage: 1 },
                        logic: { score: -10, feedback: "Ошибка. Логика не работает, когда доминирует страх.", nextStage: 1 },
                        threat: { score: -30, feedback: "Провал. Угрозы порождают лишь врагов.", nextStage: 1 }
                    }
                }
            },
            // --- STAGE 1: The Rival ---
            {
                type: 'dialogue',
                character: {
                    name: 'Елена, опытный менеджер',
                    portrait: '../assets/photovideo/ostrov.png' // Placeholder image
                },
                dialogue: "Ваша идея интересна, но у меня уже есть свой утвержденный план. Я не вижу причин что-то менять.",
                objective: "Завербуйте Елену на свою сторону, показав ей личную выгоду.",
                interaction: {
                    type: 'button-choice',
                    options: [
                        { text: "Сказать, что ваш план принесет ей повышение.", correct: true, score: 70, feedback: "Отлично! Вы сыграли на ее амбициях." },
                        { text: "Раскритиковать ее план и показать его недостатки.", correct: false, score: -20, feedback: "Неудачно. Прямая критика вызвала только защитную реакцию." },
                        { text: "Предложить объединить ваши планы.", correct: false, score: 10, feedback: "Неплохо, но компромисс не всегда лучший путь к власти." }
                    ],
                    nextStage: 2
                }
            },
            // --- STAGE 2: Propaganda ---
            {
                type: 'propaganda',
                objective: "Создайте вирусный пост, чтобы склонить мнение сотрудников на свою сторону.",
                interaction: {
                    elements: {
                        slogans: [
                            { text: "Вместе к инновациям!", type: 'positive' },
                            { text: "Хватит бояться перемен!", type: 'negative' },
                            { text: "Новый курс - новые возможности!", type: 'positive' }
                        ],
                        images: [
                            { src: '../assets/photovideo/prise.png', type: 'positive' }, // Placeholder
                            { src: '../assets/photovideo/wtf.png', type: 'negative' }  // Placeholder
                        ],
                        channels: [
                            { name: 'Рабочий чат', type: 'official' },
                            { name: 'Анонимный форум', type: 'unofficial' }
                        ]
                    },
                    solution: {
                        sloganType: 'positive',
                        imageType: 'positive',
                        channelType: 'official'
                    },
                    feedback: {
                        success: "Превосходно! Ваш пост вдохновил коллег и укрепил ваши позиции.",
                        failure: "Кампания провалилась. Сообщение было воспринято негативно."
                    },
                    score: { success: 100, failure: -50 },
                    nextStage: 'end'
                }
            }
        ]
    };

    function switchScreen(screen) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        screen.classList.add('active');
    }

    function updateProgress() {
        const progress = (currentStage / QUEST_DATA.totalStages) * 100;
        progressBar.style.width = `${progress}%`;
        scoreValueEl.textContent = score;
    }

    function startGame() {
        currentStage = 0;
        score = 0;
        switchScreen(gameScreen);
        loadStage(currentStage);
    }
    
    function loadStage(stageIndex) {
        if (stageIndex === 'end' || stageIndex >= QUEST_DATA.stages.length) {
            endGame();
            return;
        }
        
        updateProgress();
        const stageData = QUEST_DATA.stages[stageIndex];
        stageContainer.innerHTML = '';
        interactionFooter.innerHTML = '';

        if (stageData.type === 'dialogue') {
            loadDialogueStage(stageData);
        } else if (stageData.type === 'propaganda') {
            loadPropagandaStage(stageData);
        }
    }
    
    function loadDialogueStage(data) {
        // 1. Create Character Scene
        stageContainer.innerHTML = `
            <div class="character-scene">
                <div class="dialogue-box">
                    <p class="character-name">${data.character.name}</p>
                    <p>${data.dialogue}</p>
                </div>
                <img src="${data.character.portrait}" alt="${data.character.name}" class="character-portrait drop-zone">
                 <p class="objective-text">${data.objective}</p>
            </div>
        `;

        // 2. Create Interaction
        if (data.interaction.type === 'drag-drop') {
            const cardsHTML = data.interaction.cards.map(card => `
                <div class="influence-card" draggable="true" data-card-id="${card.id}">
                    <div class="card-icon">${card.icon}</div>
                    <div class="card-name">${card.name}</div>
                </div>
            `).join('');
            
            interactionFooter.innerHTML = `<div id="influence-cards-container">${cardsHTML}</div>`;
            setupDragAndDrop(data);
        } else if (data.interaction.type === 'button-choice') {
            const optionsHTML = data.interaction.options.map(opt => 
                `<button class="option-btn" data-score="${opt.score}" data-feedback="${opt.feedback}" data-correct="${opt.correct}">${opt.text}</button>`
            ).join('');
            interactionFooter.innerHTML = `<div class="options-container">${optionsHTML}</div>`;
            setupButtonChoices(data);
        }
    }

    function loadPropagandaStage(stageData) {
        const interaction = stageData.interaction;
        stageContainer.innerHTML = `
            <div class="propaganda-screen">
                <h2>Создание Кампании</h2>
                <p>${stageData.objective}</p>
                <div id="propaganda-builder">
                    <div class="propaganda-column" id="slogans-pool">
                        <h3>Слоганы</h3>
                        ${interaction.elements.slogans.map(s => `<div class="propaganda-item" draggable="true" data-type="slogan" data-value="${s.type}">${s.text}</div>`).join('')}
                    </div>
                    <div class="propaganda-column" id="images-pool">
                        <h3>Визуал</h3>
                        ${interaction.elements.images.map(i => `<div class="propaganda-item image-item" draggable="true" data-type="image" data-value="${i.type}"><img src="${i.src}" /></div>`).join('')}
                    </div>
                    <div class="propaganda-column" id="channels-pool">
                        <h3>Канал</h3>
                        ${interaction.elements.channels.map(c => `<div class="propaganda-item" draggable="true" data-type="channel" data-value="${c.type}">${c.name}</div>`).join('')}
                    </div>
                </div>
                <div id="propaganda-canvas">
                    <h3>Пост:</h3>
                    <div class="propaganda-dropzone" data-type="slogan">Перетащите сюда слоган</div>
                    <div class="propaganda-dropzone" data-type="image">Перетащите сюда визуал</div>
                    <div class="propaganda-dropzone" data-type="channel">Перетащите сюда канал</div>
                </div>
            </div>
        `;

        interactionFooter.innerHTML = `<button id="launch-propaganda-btn" disabled>Запустить Кампанию</button>`;
        setupPropagandaInteraction(stageData);
    }

    function setupPropagandaInteraction(stageData) {
        const items = document.querySelectorAll('.propaganda-item');
        const dropzones = document.querySelectorAll('.propaganda-dropzone');
        const launchBtn = document.getElementById('launch-propaganda-btn');
        let selections = { slogan: null, image: null, channel: null };

        items.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', item.outerHTML);
                e.dataTransfer.setData('item-type', item.dataset.type);
                e.dataTransfer.setData('item-value', item.dataset.value);
                setTimeout(() => item.style.display = 'none', 0);
            });
            item.addEventListener('dragend', () => {
                setTimeout(() => item.style.display = 'flex', 0);
            });
        });

        dropzones.forEach(zone => {
            zone.addEventListener('dragover', e => e.preventDefault());
            zone.addEventListener('drop', (e) => {
                e.preventDefault();
                const itemType = e.dataTransfer.getData('item-type');
                if (itemType === zone.dataset.type) {
                    const itemHTML = e.dataTransfer.getData('text/plain');
                    zone.innerHTML = itemHTML;
                    zone.classList.add('filled');
                    selections[itemType] = e.dataTransfer.getData('item-value');

                    if (selections.slogan && selections.image && selections.channel) {
                        launchBtn.disabled = false;
                    }
                }
            });
        });

        launchBtn.addEventListener('click', () => {
            const solution = stageData.interaction.solution;
            const feedbackData = stageData.interaction.feedback;
            const scoreData = stageData.interaction.score;

            if (selections.slogan === solution.sloganType && 
                selections.image === solution.imageType && 
                selections.channel === solution.channelType) 
            {
                score += scoreData.success;
                showFeedback(feedbackData.success, true);
            } else {
                score += scoreData.failure;
                showFeedback(feedbackData.failure, false);
            }
            currentStage = stageData.interaction.nextStage;
            setTimeout(() => loadStage(currentStage), 2500);
        });
    }

    function setupButtonChoices(stageData) {
        const optionBtns = document.querySelectorAll('.option-btn');
        optionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.currentTarget;
                const scoreChange = parseInt(target.dataset.score);
                const feedback = target.dataset.feedback;
                const isCorrect = target.dataset.correct === 'true';

                score += scoreChange;
                currentStage = stageData.interaction.nextStage;
                
                showFeedback(feedback, isCorrect);

                // Визуальная обратная связь на кнопках
                optionBtns.forEach(b => {
                    b.disabled = true;
                    if (b.dataset.correct === 'true') {
                        b.classList.add('correct');
                    } else {
                        b.classList.add('incorrect');
                    }
                });

                setTimeout(() => {
                    loadStage(currentStage);
                }, 2500);
            });
        });
    }

    function setupDragAndDrop(stageData) {
        const cards = document.querySelectorAll('.influence-card');
        const dropZone = document.querySelector('.drop-zone');

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
            
            // Handle result
            const result = stageData.interaction.responses[droppedCardId];
            score += result.score;
            currentStage = result.nextStage;
            
            // Show feedback
            showFeedback(result.feedback, result.score > 0);
            
            setTimeout(() => {
                loadStage(currentStage);
            }, 2500);
        });
    }

    function showFeedback(message, isSuccess) {
        const feedbackEl = document.createElement('div');
        feedbackEl.className = `feedback-popup ${isSuccess ? 'success' : 'failure'}`;
        feedbackEl.textContent = message;
        stageContainer.appendChild(feedbackEl);

        setTimeout(() => {
            feedbackEl.remove();
        }, 2000);
    }

    function endGame() {
        finalScoreEl.textContent = score;
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

    // Initial load
    setTimeout(() => {
        switchScreen(startScreen);
    }, 1500);
});
