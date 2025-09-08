document.addEventListener('DOMContentLoaded', () => {
    const screens = document.querySelectorAll('.screen');
    const startQuestBtn = document.getElementById('start-quest-btn');

    let currentScreen = 0;
    const userScores = {
        awareness: 0,
        boundaries: 0,
        warmth: 0
    };
    const achievements = new Set();

    function showScreen(screenIndex) {
        screens.forEach((screen, index) => {
            if (index === screenIndex) {
                screen.classList.add('active');
            } else {
                screen.classList.remove('active');
            }
        });
        currentScreen = screenIndex;
    }
    
    startQuestBtn.addEventListener('click', () => {
        showScreen(1);
        initStage1();
    });

    // --- STAGE 1: RADAR ---
    const stage1Data = {
        swipeCards: [
            { text: "Застенчиво отводит взгляд вниз", type: "interest" },
            { text: "Смотрит искоса и быстро отводит взгляд", type: "interest" },
            { text: "Играет с цепочкой или серьгами", type: "interest" },
            { text: "Прячет лицо за меню или книгой, играя в 'ку-ку'", type: "interest" },
            { text: "Подвинулась ближе в ваше личное пространство", type: "interest" },
            { text: "Стоит, скрестив руки на груди", type: "neutral" },
            { text: "Зевает, не прикрывая рот", type: "neutral" },
            { text: "Смотрит в свой телефон, не поднимая головы", type: "neutral" },
            { text: "Отвечает односложно, не задавая встречных вопросов", type: "neutral" },
            { text: "Избегает зрительного контакта", type: "neutral" },
        ],
        quiz: [
            {
                question: "Девушка в кафе улыбается и быстро отводит взгляд. Что это вероятнее всего?",
                options: ["Она вас высмеивает", "Проявление интереса или вежливости", "У нее нервный тик"],
                correct: 1
            },
            {
                question: "Коллега постоянно касается вашей руки во время разговора. Что делать?",
                options: ["Проигнорировать, это ничего не значит", "Сказать прямо, что вам некомфортно", "Ударить в ответ"],
                correct: 1
            },
            {
                question: "Ваша партнерша обиделась и молчит второй день. Это...",
                options: ["Нормальное поведение, ей нужно время", "Пассивная агрессия и манипуляция", "Она просто очень занята"],
                correct: 1
            }
        ]
    };

    function initStage1() {
        const swipeContainer = document.getElementById('swipe-cards-container');
        let currentCardIndex = 0;
        let cards = [];

        function createSwipeCards() {
            swipeContainer.innerHTML = '';
            cards = stage1Data.swipeCards.map((cardData, index) => {
                const cardEl = document.createElement('div');
                cardEl.classList.add('swipe-card');
                cardEl.innerHTML = `<p>${cardData.text}</p><div class="feedback left">Обычно</div><div class="feedback right">Флирт</div>`;
                swipeContainer.appendChild(cardEl);
                return { element: cardEl, data: cardData };
            }).reverse();
            
            cards.forEach(card => addCardListeners(card.element));
            updateCardStack();
        }
        
        function updateCardStack() {
            cards.forEach((card, index) => {
                const zIndex = cards.length - index;
                card.element.style.zIndex = zIndex;

                if (index > 2) {
                    card.element.style.display = 'none';
                } else {
                    card.element.style.display = 'flex';
                }
            });
        }

        function addCardListeners(card) {
            let startPoint = { x: 0, y: 0 };
            let isDragging = false;
            
            const onPointerMove = (e) => {
                if (!isDragging) return;
                const currentPoint = { x: e.clientX, y: e.clientY };
                const deltaX = currentPoint.x - startPoint.x;
                const deltaY = currentPoint.y - startPoint.y;
                const rotate = deltaX * 0.1;

                card.style.transform = `translate(${deltaX}px, ${deltaY}px) rotate(${rotate}deg)`;
                
                // Show feedback
                const feedbackLeft = card.querySelector('.feedback.left');
                const feedbackRight = card.querySelector('.feedback.right');
                
                const opacity = Math.min(Math.abs(deltaX) / 100, 1);
                if (deltaX > 20) {
                    feedbackRight.style.opacity = opacity;
                    feedbackLeft.style.opacity = 0;
                } else if (deltaX < -20) {
                   feedbackLeft.style.opacity = opacity;
                   feedbackRight.style.opacity = 0;
                } else {
                    feedbackLeft.style.opacity = 0;
                    feedbackRight.style.opacity = 0;
                }
            };

            const onPointerUp = (e) => {
                if (!isDragging) return;
                isDragging = false;
                card.classList.remove('dragging');
                
                document.removeEventListener('pointermove', onPointerMove);
                document.removeEventListener('pointerup', onPointerUp);

                const deltaX = e.clientX - startPoint.x;
                if (Math.abs(deltaX) > 100) {
                    const direction = deltaX > 0 ? 1 : -1;
                    card.style.transform = `translate(${direction * 500}px, ${e.clientY - startPoint.y}px) rotate(${direction * 30}deg)`;
                    card.style.opacity = 0;
                    
                    setTimeout(() => {
                        if (card.parentNode) {
                           card.parentNode.removeChild(card);
                        }
                        cards.pop();
                        updateCardStack();
                        if (cards.length === 0) {
                            document.querySelector('.swipe-radar-container').classList.add('hidden');
                            document.getElementById('stage-1-quiz').classList.remove('hidden');
                            initStage1Quiz();
                        }
                    }, 300);

                } else {
                   card.style.transform = '';
                   card.querySelectorAll('.feedback').forEach(f => f.style.opacity = 0);
                }
            };
            
            function onPointerDown(e) {
                isDragging = true;
                card.classList.add('dragging');
                startPoint = { x: e.clientX, y: e.clientY };
                document.addEventListener('pointermove', onPointerMove);
                document.addEventListener('pointerup', onPointerUp);
            }
            
            card.addEventListener('pointerdown', onPointerDown);
        }

        createSwipeCards();
    }

    function initStage1Quiz() {
        const quizContainer = document.getElementById('stage-1-quiz');
        const questionContainer = document.getElementById('quiz-question-container');
        const timerEl = document.getElementById('quiz-timer');
        let currentQuestionIndex = 0;
        let timer;
        let timeLeft = 10;

        function showQuestion(index) {
            clearInterval(timer);
            timeLeft = 10;
            timerEl.textContent = timeLeft;

            const questionData = stage1Data.quiz[index];
            questionContainer.innerHTML = `
                <p class="quiz-question">${questionData.question}</p>
                <div class="quiz-options">
                    ${questionData.options.map((opt, i) => `<button class="quiz-option" data-index="${i}">${opt}</button>`).join('')}
                </div>
            `;
            
            const optionButtons = questionContainer.querySelectorAll('.quiz-option');
            optionButtons.forEach(btn => btn.addEventListener('click', handleOptionClick));
            
            timer = setInterval(() => {
                timeLeft--;
                timerEl.textContent = timeLeft;
                if (timeLeft <= 0) {
                    clearInterval(timer);
                    // Time's up, move to next question or end quiz
                    currentQuestionIndex++;
                    if (currentQuestionIndex < stage1Data.quiz.length) {
                        showQuestion(currentQuestionIndex);
                    } else {
                        // End of quiz, move to next stage
                        showScreen(2);
                        initStage2();
                    }
                }
            }, 1000);
        }

        function handleOptionClick(e) {
            clearInterval(timer);
            const selectedIndex = parseInt(e.target.dataset.index);
            const correctIndex = stage1Data.quiz[currentQuestionIndex].correct;
            
            if (selectedIndex === correctIndex) {
                e.target.classList.add('correct');
                userScores.awareness += 10;
            } else {
                e.target.classList.add('incorrect');
            }

            setTimeout(() => {
                currentQuestionIndex++;
                if (currentQuestionIndex < stage1Data.quiz.length) {
                    showQuestion(currentQuestionIndex);
                } else {
                    // End of quiz
                    showScreen(2);
                    initStage2();
                }
            }, 1000);
        }

        showQuestion(0);
    }
    
    // --- STAGE 2: 7 SITUATIONS ---
    const stage2Data = [
        {
            situation: "Вы на свидании. Девушка смотрит искоса и улыбается.",
            options: [
                { text: "Подойти и сказать: 'Я тебе нравлюсь, признайся'", score: { boundaries: -10, warmth: -5 } },
                { text: "Улыбнуться в ответ и спросить: 'У меня что-то на лице?'", score: { awareness: 5, warmth: 10 } },
                { text: "Проигнорировать, чтобы не показаться навязчивым", score: { awareness: -5 } },
            ],
            feedback: "Хороший ход! Легкий юмор и открытый вопрос — отличный способ прояснить ситуацию без давления."
        },
        {
            situation: "Она играет с украшением, поддерживая с вами прямой зрительный контакт.",
            options: [
                { text: "Спросить: 'Красивое украшение, с ним связана какая-то история?'", score: { awareness: 5, warmth: 10 } },
                { text: "Сделать комплимент ее внешности, игнорируя украшение", score: { warmth: 5 } },
                { text: "Решить, что она точно хочет познакомиться, и сразу предложить поехать к вам", score: { boundaries: -15, warmth: -10 } }
            ],
            feedback: "Отличный выбор. Вы заметили деталь, перевели фокус на нее и задали открытый вопрос. Это приглашает к диалогу без давления."
        },
        {
            situation: "Она 'случайно' подвинулась очень близко, нарушив ваше личное пространство.",
            options: [
                { text: "Сделать шаг назад, чтобы восстановить дистанцию", score: { boundaries: 10 } },
                { text: "Ничего не делать, чтобы ее не обидеть", score: { boundaries: -10 } },
                { text: "Обнять ее в ответ", score: { boundaries: -15, awareness: -10 } }
            ],
            feedback: "Четкое и уважительное действие. Вы без слов обозначили свои границы. Это нормально — защищать свое пространство."
        },
        {
            situation: "После небольшой ссоры она перестала отвечать на сообщения (молчаливое наказание).",
            options: [
                { text: "Завалить ее сообщениями с извинениями, даже если не виноваты", score: { boundaries: -15 } },
                { text: "Написать: 'Я вижу, что ты не отвечаешь. Мне это неприятно. Давай поговорим, когда будешь готова'", score: { boundaries: 10, awareness: 10 } },
                { text: "Игнорировать ее в ответ, пусть первая напишет", score: { warmth: -10 } }
            ],
            feedback: "Это взрослая позиция. Вы назвали ее поведение, выразили свои чувства и предложили конструктивный выход, сохранив самоуважение."
        },
        {
            situation: "Она требует ваш телефон, чтобы 'проверить, с кем ты там переписываешься'.",
            options: [
                { text: "Молча отдать телефон, чтобы доказать, что нечего скрывать", score: { boundaries: -20 } },
                { text: "Сказать: 'Мой телефон — это мое личное пространство. Я не буду его давать, но готов обсудить, что тебя беспокоит'", score: { boundaries: 15, awareness: 10 } },
                { text: "Обвинить ее в недоверии и устроить скандал", score: { warmth: -15 } }
            ],
            feedback: "Браво! Вы четко обозначили границы, отказались от деструктивного действия и перевели диалог в конструктивное русло."
        },
        {
            situation: "В магазине она говорит: 'Если ты меня любишь, купишь мне это платье'.",
            options: [
                { text: "Купить, чтобы не расстраивать ее", score: { boundaries: -10, awareness: -5 } },
                { text: "Сказать: 'Моя любовь не измеряется покупками. Давай обсудим наш бюджет'", score: { boundaries: 10, awareness: 10 } },
                { text: "Сказать: 'А если ты меня любишь, перестанешь манипулировать'", score: { warmth: -10 } }
            ],
            feedback: "Отличный ответ. Вы не поддались на манипуляцию, отделили чувства от денег и предложили рациональное решение."
        },
        {
            situation: "Вам нужно уйти, а она говорит: 'Все ясно, друзья для тебя важнее меня'.",
            options: [
                { text: "Отменить свои планы, чтобы она не обижалась", score: { boundaries: -15 } },
                { text: "Сказать: 'Я хочу провести время с друзьями, и это не значит, что ты мне не важна. Я вернусь в 10'", score: { boundaries: 10, warmth: 5 } },
                { text: "Разозлиться и уйти, хлопнув дверью", score: { warmth: -15 } }
            ],
            feedback: "Идеально. Вы подтвердили ее значимость, но отстояли свое право на личное время и интересы, обозначив четкие рамки."
        }
    ];

    function initStage2() {
        const chatContainer = document.getElementById('chat-container');
        const chatOptionsContainer = document.createElement('div');
        chatOptionsContainer.id = 'chat-options';
        document.getElementById('stage-2-screen').querySelector('.screen-content').appendChild(chatOptionsContainer);
        
        let currentSituationIndex = 0;

        function showSituation(index) {
            const situation = stage2Data[index];
            appendMessage(situation.situation, 'bot');

            chatOptionsContainer.innerHTML = situation.options.map((opt, i) => 
                `<button class="button chat-option" data-index="${i}">${opt.text}</button>`
            ).join('');

            document.querySelectorAll('.chat-option').forEach(btn => btn.addEventListener('click', handleOptionChoice));
        }

        function handleOptionChoice(e) {
            const situation = stage2Data[currentSituationIndex];
            const choiceIndex = parseInt(e.target.dataset.index);
            const choice = situation.options[choiceIndex];

            // Update scores
            for (const key in choice.score) {
                userScores[key] = (userScores[key] || 0) + choice.score[key];
            }

            appendMessage(choice.text, 'user');
            chatOptionsContainer.innerHTML = ''; // Hide options

            setTimeout(() => {
                appendMessage(situation.feedback, 'bot');
                
                setTimeout(() => {
                    currentSituationIndex++;
                    if (currentSituationIndex < stage2Data.length) {
                        showSituation(currentSituationIndex);
                    } else {
                        // End of stage 2
                        showScreen(3);
                        initStage3();
                    }
                }, 2000);

            }, 1000);
        }

        function appendMessage(text, type) {
            const messageEl = document.createElement('div');
            messageEl.classList.add('chat-message', type);
            messageEl.textContent = text;
            chatContainer.appendChild(messageEl);
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }

        showSituation(0);
    }
    
    // --- END STAGE 2 ---

    // --- STAGE 3: ADULT STRATEGY ---
    const stage3Data = [
        {
            scene: "Коллега в пятый раз просит вас доделать за нее отчет, потому что 'ты же в этом лучше разбираешься'.",
            tools: {
                clarify: "Я правильно понимаю, что ты снова просишь меня сделать твою работу?",
                name: "Мне некомфортно, когда на меня перекладывают ответственность.",
                offer: "Я могу помочь тебе разобраться в сложном моменте, но делать отчет за тебя не буду.",
                exit: "Извини, я сейчас занят своим проектом."
            },
            keywords: ["помочь", "разобраться", "свою работу", "не буду делать", "занят"]
        },
        {
            scene: "Она требует ваш телефон, чтобы 'проверить, с кем ты там переписываешься'.",
            tools: {
                clarify: "Я правильно понимаю, что ты снова просишь меня сделать твою работу?",
                name: "Мне некомфортно, когда на меня перекладывают ответственность.",
                offer: "Я могу помочь тебе разобраться в сложном моменте, но делать отчет за тебя не буду.",
                exit: "Извини, я сейчас занят своим проектом."
            },
            keywords: ["помочь", "разобраться", "свою работу", "не буду делать", "занят"]
        },
        {
            scene: "В магазине она говорит: 'Если ты меня любишь, купишь мне это платье'.",
            tools: {
                clarify: "Я правильно понимаю, что ты снова просишь меня сделать твою работу?",
                name: "Мне некомфортно, когда на меня перекладывают ответственность.",
                offer: "Я могу помочь тебе разобраться в сложном моменте, но делать отчет за тебя не буду.",
                exit: "Извини, я сейчас занят своим проектом."
            },
            keywords: ["помочь", "разобраться", "свою работу", "не буду делать", "занят"]
        },
        {
            scene: "Вам нужно уйти, а она говорит: 'Все ясно, друзья для тебя важнее меня'.",
            tools: {
                clarify: "Я правильно понимаю, что ты снова просишь меня сделать твою работу?",
                name: "Мне некомфортно, когда на меня перекладывают ответственность.",
                offer: "Я могу помочь тебе разобраться в сложном моменте, но делать отчет за тебя не буду.",
                exit: "Извини, я сейчас занят своим проектом."
            },
            keywords: ["помочь", "разобраться", "свою работу", "не буду делать", "занят"]
        }
    ];

    function initStage3() {
        const sceneEl = document.getElementById('strategy-scene');
        const optionsEl = document.getElementById('strategy-options');
        const inputEl = document.getElementById('strategy-input');
        const submitBtn = document.getElementById('submit-strategy-btn');
        let currentSceneIndex = 0;
        let timer;

        function showScene(index) {
            const scene = stage3Data[index];
            sceneEl.textContent = `Ситуация: "${scene.scene}"`;
            inputEl.value = '';

            optionsEl.innerHTML = `
                <button class="strategy-option-btn" data-tool="clarify">Проясни</button>
                <button class="strategy-option-btn" data-tool="name">Назови</button>
                <button class="strategy-option-btn" data-tool="offer">Предложи</button>
                <button class="strategy-option-btn" data-tool="exit">Выйди</button>
            `;

            document.querySelectorAll('.strategy-option-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    inputEl.value += scene.tools[btn.dataset.tool] + " ";
                });
            });
            
            // Timer logic will be added here
        }
        
        submitBtn.addEventListener('click', handleSubmit);

        function handleSubmit() {
            const scene = stage3Data[currentSceneIndex];
            const userAnswer = inputEl.value.toLowerCase();
            let score = 0;

            if (userAnswer.length > 5) { // some basic check
                const foundKeywords = scene.keywords.filter(kw => userAnswer.includes(kw));
                score += foundKeywords.length * 5; // Bonus for keywords
                userScores.boundaries += score;
            }
            
            currentSceneIndex++;
            if (currentSceneIndex < stage3Data.length) {
                showScene(currentSceneIndex);
            } else {
                showScreen(4);
                initStage4();
            }
        }
        
        showScene(0);
    }
    
    // In initStage2, when stage ends, call initStage3
    // ... inside handleOptionChoice timeout
    // showScreen(3);
    // initStage3(); // <-- ADD THIS
    
    // --- END STAGE 3 ---

    // --- STAGE 4: BOSS BATTLE ---
    const stage4Data = {
        start: {
            text: "Вы на вечеринке. К вам подходит девушка, с которой вы недавно познакомились. Она выглядит немного расстроенной.",
            options: [
                { text: "Спросить, что случилось.", next: "ask_whats_wrong" },
                { text: "Сделать комплимент, чтобы поднять настроение.", next: "compliment" }
            ]
        },
        ask_whats_wrong: {
            text: "Она говорит: 'Да так... Просто мой бывший тоже здесь. Не смотри на него!'",
            options: [
                { text: "Заверить ее, что вам нет до него дела.", next: "reassure" },
                { text: "Спросить, где он, из любопытства.", next: "look_for_ex" }
            ]
        },
        compliment: {
            text: "Она улыбается: 'Спасибо'. И добавляет: 'Слушай, а мы можем уехать отсюда? Мне тут некомфортно'.",
            options: [
                { text: "Согласиться уехать, чтобы ей было комфортнее.", next: "leave_party" },
                { text: "Предложить найти тихое место здесь же, на вечеринке.", next: "find_quiet_place" }
            ]
        },
        // ... more branches
        reassure: {
            text: "Вы провели отличный вечер, разговаривая и лучше узнавая друг друга. Вы проявили эмпатию и сохранили границы.",
            ending: "good"
        },
        look_for_ex: {
            text: "Ваше любопытство испортило момент. Она замкнулась, и вечер был испорчен. Нужно было сфокусироваться на ней.",
            ending: "bad"
        },
        leave_party: {
            text: "Вы уехали. Возможно, это было то, чего она хотела, но вы поддались на ее сиюминутное желание, не узнав причину.",
            ending: "neutral"
        },
        find_quiet_place: {
             text: "Вы нашли уютный диванчик на балконе и отлично поговорили. Вы предложили компромисс, который устроил обоих.",
             ending: "good"
        }
    };

    function initStage4() {
        const sceneContainer = document.getElementById('boss-battle-scene');
        const timerEl = document.createElement('div');
        timerEl.id = 'boss-timer';
        document.getElementById('stage-4-screen').querySelector('.screen-content').appendChild(timerEl);

        let currentNodeKey = 'start';
        let timer;
        
        function showNode(nodeKey) {
            const node = stage4Data[nodeKey];
            
            if (node.ending) {
                // Handle ending
                let endingText = node.text;
                if(node.ending === 'good') userScores.warmth += 20;
                if(node.ending === 'bad') userScores.warmth -= 10;
                sceneContainer.innerHTML = `<div class="text">${endingText}</div>`;
                setTimeout(showResults, 3000);
                return;
            }

            sceneContainer.innerHTML = `
                <div class="text">${node.text}</div>
                <div id="boss-battle-options">
                    ${node.options.map(opt => `<button class="button boss-option-btn" data-next="${opt.next}">${opt.text}</button>`).join('')}
                </div>
            `;

            document.querySelectorAll('.boss-option-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    clearInterval(timer);
                    showNode(e.target.dataset.next);
                });
            });
            
            // Timer
            let timeLeft = 8;
            timerEl.textContent = timeLeft;
            timer = setInterval(() => {
                timeLeft--;
                timerEl.textContent = timeLeft;
                if (timeLeft <= 0) {
                    clearInterval(timer);
                    // Default/bad ending on timeout
                    showNode('look_for_ex'); 
                }
            }, 1000);
        }

        showNode('start');
    }
    
    // In initStage3, when stage ends, call initStage4
    // ... inside handleSubmit
    // showScreen(4);
    // initStage4(); // <-- ADD THIS

    // ... And finally, the results screen logic
    function showResults() {
        showScreen(5); // Assuming 5 is the results screen index
        
        // Final scores calculation
        const awarenessScore = Math.max(0, Math.min(100, userScores.awareness));
        const boundariesScore = Math.max(0, Math.min(100, userScores.boundaries));
        const warmthScore = Math.max(0, Math.min(100, userScores.warmth));

        document.getElementById('awareness-progress').value = awarenessScore;
        document.getElementById('boundaries-progress').value = boundariesScore;
        document.getElementById('warmth-progress').value = warmthScore;
        
        // Achievements logic
        if (boundariesScore > 70) achievements.add("Границы без драмы");
        if (awarenessScore > 70) achievements.add("Не читаю мысли");
        if (warmthScore > 70) achievements.add("Экологичный отказ");

        const achievementsList = document.getElementById('achievements-list');
        achievementsList.innerHTML = '';
        achievements.forEach(ach => {
            const li = document.createElement('li');
            li.textContent = ach;
            achievementsList.appendChild(li);
        });

        const restartBtn = document.getElementById('restart-quest-btn');
        restartBtn.addEventListener('click', () => {
             // Reset scores and achievements
             userScores.awareness = 0;
             userScores.boundaries = 0;
             userScores.warmth = 0;
             achievements.clear();
             // Restart the quest
             showScreen(0);
        });
    }
    
    // TODO: Инициализировать все этапы
    // initStage1();
    // initStage2();
    // initStage3();
    // initStage4();
    // showResults();
    
    // Показываем первый экран
    showScreen(0);
});
