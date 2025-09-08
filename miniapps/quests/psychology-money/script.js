// Psychology Money Quest - Mobile-First Interactive Game
// Optimized for Telegram MiniApps

class PsychologyMoneyQuest {
    constructor() {
        this.currentScreen = 0;
        this.screens = document.querySelectorAll('.screen');
        this.totalScreens = this.screens.length;
        this.progress = 0;
        this.questData = {
            stage1Completed: false,
            stage2Completed: false,
            stage3Completed: false,
            stage4Completed: false,
            userPsychotype: null,
            correctAnswers: 0
        };
        
        this.init();
    }

    init() {
        console.log('Initializing quest with screens:', this.screens.length);
        this.setupEventListeners();
        this.setupDragAndDrop();
        this.updateProgress();
        this.setupMobileOptimizations();
        
        // Ensure first screen is visible
        if (this.screens.length > 0) {
            this.screens[0].classList.add('active');
            console.log('First screen activated');
        }
    }

    setupEventListeners() {
        // Navigation buttons with error handling
        try {
            const startBtn = document.getElementById('start-quest-btn');
            const stage1Next = document.getElementById('stage-1-next');
            const stage2Next = document.getElementById('stage-2-next');
            const stage3Next = document.getElementById('stage-3-next');
            const stage4Next = document.getElementById('stage-4-next');
            const restartBtn = document.getElementById('restart-quest-btn');
            const toMainMenuBtn = document.getElementById('to-main-menu-btn');
            const backBtn = document.getElementById('back-btn');
            const mainMenuBtn = document.getElementById('main-menu-btn');

            if (startBtn) startBtn.addEventListener('click', () => this.nextScreen());
            if (stage1Next) stage1Next.addEventListener('click', () => this.nextScreen());
            if (stage2Next) stage2Next.addEventListener('click', () => this.nextScreen());
            if (stage3Next) stage3Next.addEventListener('click', () => this.nextScreen());
            if (stage4Next) stage4Next.addEventListener('click', () => this.nextScreen());
            if (restartBtn) restartBtn.addEventListener('click', () => this.restartQuest());
            if (toMainMenuBtn) toMainMenuBtn.addEventListener('click', () => this.goToMainMenu());
            if (backBtn) backBtn.addEventListener('click', () => this.previousScreen());
            if (mainMenuBtn) mainMenuBtn.addEventListener('click', () => this.goToMainMenu());

            console.log('Event listeners setup completed');
        } catch (error) {
            console.error('Error setting up event listeners:', error);
        }

        // Stage 2: Emotion recognition
        this.setupEmotionRecognition();

        // Stage 4: Psychotype test
        this.setupPsychotypeTest();
    }

    setupMobileOptimizations() {
        // Prevent zoom on double tap (only for actual double taps, not regular clicks)
        let lastTouchEnd = 0;
        let lastTarget = null;
        
        document.addEventListener('touchend', (event) => {
            const now = (new Date()).getTime();
            const currentTarget = event.target;
            
            // Only prevent if it's a true double tap on the same element
            if (now - lastTouchEnd <= 300 && currentTarget === lastTarget) {
                event.preventDefault();
            }
            lastTouchEnd = now;
            lastTarget = currentTarget;
        }, false);

        // Add haptic feedback for Telegram
        this.addHapticFeedback();
    }

    addHapticFeedback() {
        if (window.Telegram && window.Telegram.WebApp) {
            const webApp = window.Telegram.WebApp;
            
            // Add haptic feedback to interactive elements
            document.querySelectorAll('.emotion-card, .option-card, .trigger-item, .argument-item').forEach(element => {
                element.addEventListener('touchstart', () => {
                    if (webApp.HapticFeedback) {
                        webApp.HapticFeedback.impactOccurred('light');
                    }
                });
            });
        }
    }

    setupDragAndDrop() {
        this.setupStage1DragDrop();
        this.setupStage3DragDrop();
    }

    // STAGE 1: Psychological Triggers Drag & Drop
    setupStage1DragDrop() {
        const triggers = document.querySelectorAll('#stage-1 .trigger-item');
        const dropZones = document.querySelectorAll('#stage-1 .drop-zone');
        let completedDrops = 0;

        triggers.forEach(trigger => {
            // Desktop drag events
            trigger.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', trigger.dataset.trigger);
                trigger.classList.add('dragging');
            });

            trigger.addEventListener('dragend', () => {
                trigger.classList.remove('dragging');
            });

            // Mobile touch events
            this.addMobileDragSupport(trigger, dropZones, (trigger, dropZone) => {
                const triggerType = trigger.dataset.trigger;
                const dropZoneType = dropZone.dataset.trigger;

                if (triggerType === dropZoneType) {
                    this.handleSuccessfulDrop(trigger, dropZone, 'stage-1');
                    completedDrops++;
                    
                    if (completedDrops === 3) {
                        this.completeStage1();
                    }
                } else {
                    this.showFeedback('stage-1', 'Неправильно! Попробуй еще раз.', 'error');
                    this.returnTriggerToOriginalPosition(trigger);
                }
            });
        });

        dropZones.forEach(zone => {
            zone.addEventListener('dragover', (e) => {
                e.preventDefault();
                zone.classList.add('drag-over');
            });

            zone.addEventListener('dragleave', () => {
                zone.classList.remove('drag-over');
            });

            zone.addEventListener('drop', (e) => {
                e.preventDefault();
                zone.classList.remove('drag-over');
                
                const triggerType = e.dataTransfer.getData('text/plain');
                const dropZoneType = zone.dataset.trigger;
                const trigger = document.querySelector(`#stage-1 .trigger-item[data-trigger="${triggerType}"]`);

                if (triggerType === dropZoneType) {
                    this.handleSuccessfulDrop(trigger, zone, 'stage-1');
                    completedDrops++;
                    
                    if (completedDrops === 3) {
                        this.completeStage1();
                    }
                } else {
                    this.showFeedback('stage-1', 'Неправильно! Попробуй еще раз.', 'error');
                }
            });
        });
    }

    // STAGE 2: Emotion Recognition
    setupEmotionRecognition() {
        const scenarios = [
            {
                text: "Клиент долго изучает товар, часто оглядывается по сторонам, кусает губу и теребит в руках кошелек...",
                correctEmotion: "doubt",
                feedback: "Верно! Это классические признаки сомнения и неуверенности в покупке."
            },
            {
                text: "Покупатель улыбается, активно кивает, часто прикасается к товару и задает вопросы о доставке...",
                correctEmotion: "joy",
                feedback: "Отлично! Радость и заинтересованность - лучшие эмоции для продажи."
            },
            {
                text: "Клиент хмурится, скрещивает руки, отступает назад и задает агрессивные вопросы о цене...",
                correctEmotion: "anger",
                feedback: "Правильно! Злость часто маскирует страх потратить деньги впустую."
            }
        ];

        let currentScenario = 0;
        let correctAnswers = 0;

        const scenarioText = document.getElementById('scenario-text');
        const emotionCards = document.querySelectorAll('#stage-2 .emotion-card');

        const showScenario = (index) => {
            if (index < scenarios.length) {
                scenarioText.textContent = scenarios[index].text;
                emotionCards.forEach(card => {
                    card.classList.remove('selected', 'wrong');
                });
            }
        };

        emotionCards.forEach(card => {
            card.addEventListener('click', () => {
                if (card.classList.contains('selected')) return;

                const selectedEmotion = card.dataset.emotion;
                const correct = selectedEmotion === scenarios[currentScenario].correctEmotion;

                card.classList.add('selected');

                if (correct) {
                    correctAnswers++;
                    this.questData.correctAnswers++;
                    this.showFeedback('stage-2', scenarios[currentScenario].feedback, 'success');
                    
                    setTimeout(() => {
                        currentScenario++;
                        if (currentScenario < scenarios.length) {
                            showScenario(currentScenario);
                            this.showFeedback('stage-2', '', '');
                        } else {
                            this.completeStage2();
                        }
                    }, 2000);
                } else {
                    card.classList.add('wrong');
                    this.showFeedback('stage-2', 'Не совсем! Подумай еще раз.', 'error');
                    
                    setTimeout(() => {
                        card.classList.remove('selected', 'wrong');
                        this.showFeedback('stage-2', '', '');
                    }, 1500);
                }
            });

            // Add mobile touch optimization
            card.addEventListener('touchstart', (e) => {
                e.preventDefault();
                card.style.transform = 'scale(0.95)';
            });

            card.addEventListener('touchend', (e) => {
                e.preventDefault();
                card.style.transform = '';
                card.click();
            });
        });

        showScenario(0);
    }

    // STAGE 3: Persuasion Power Sorting
    setupStage3DragDrop() {
        const argumentItems = document.querySelectorAll('#stage-3 .argument-item');
        const sortSlots = document.querySelectorAll('#stage-3 .sort-slot');
        let completedSorts = 0;

        argumentItems.forEach(argument => {
            // Desktop drag events
            argument.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', argument.dataset.power);
                argument.classList.add('dragging');
            });

            argument.addEventListener('dragend', () => {
                argument.classList.remove('dragging');
            });

            // Mobile touch events for sorting
            this.addMobileDragSupport(argument, sortSlots, (argument, sortSlot) => {
                const argumentPower = parseInt(argument.dataset.power);
                const slotPosition = parseInt(sortSlot.dataset.position);

                if (argumentPower === slotPosition) {
                    this.handleSuccessfulSort(argument, sortSlot);
                    completedSorts++;
                    
                    if (completedSorts === 4) {
                        this.completeStage3();
                    }
                } else {
                    this.showFeedback('stage-3', 'Подумай о силе воздействия этого аргумента!', 'error');
                    this.returnArgumentToOriginalPosition(argument);
                }
            });
        });

        sortSlots.forEach(slot => {
            slot.addEventListener('dragover', (e) => {
                e.preventDefault();
                slot.classList.add('drag-over');
            });

            slot.addEventListener('dragleave', () => {
                slot.classList.remove('drag-over');
            });

            slot.addEventListener('drop', (e) => {
                e.preventDefault();
                slot.classList.remove('drag-over');
                
                const argumentPower = parseInt(e.dataTransfer.getData('text/plain'));
                const slotPosition = parseInt(slot.dataset.position);
                const argument = document.querySelector(`#stage-3 .argument-item[data-power="${argumentPower}"]`);

                if (argumentPower === slotPosition) {
                    this.handleSuccessfulSort(argument, slot);
                    completedSorts++;
                    
                    if (completedSorts === 4) {
                        this.completeStage3();
                    }
                } else {
                    this.showFeedback('stage-3', 'Подумай о силе воздействия этого аргумента!', 'error');
                }
            });
        });
    }

    // STAGE 4: Psychotype Test
    setupPsychotypeTest() {
        const optionCards = document.querySelectorAll('#stage-4 .option-card');
        const resultDiv = document.getElementById('strategy-result');
        const resultContent = document.getElementById('result-content');
        const resultTips = document.getElementById('result-tips');

        const strategies = {
            analyst: {
                title: "📈 Стратегия Аналитика",
                content: "Ты прирожденный исследователь рынка! Твоя сила в анализе данных и поиске закономерностей.",
                tips: "• Изучай статистику и тренды\n• Создавай прогнозы и аналитические отчеты\n• Монетизируй свои исследования через консультации\n• Развивай навыки работы с большими данными"
            },
            creator: {
                title: "🎨 Стратегия Творца",
                content: "Ты можешь создавать уникальный контент, который привлекает и вдохновляет людей!",
                tips: "• Создавай обучающий контент\n• Запусти свой канал или блог\n• Продавай авторские курсы и материалы\n• Сотрудничай с брендами как инфлюенсер"
            },
            communicator: {
                title: "🗣️ Стратегия Коммуникатора",
                content: "Твоя суперсила - умение убеждать и находить общий язык с любыми людьми!",
                tips: "• Развивай навыки продаж\n• Стань переговорщиком или медиатором\n• Создай сообщество единомышленников\n• Монетизируй через личные консультации"
            }
        };

        optionCards.forEach(card => {
            card.addEventListener('click', () => {
                // Remove previous selections
                optionCards.forEach(c => c.classList.remove('selected'));
                
                // Select current card
                card.classList.add('selected');
                
                const psychotype = card.dataset.psychotype;
                this.questData.userPsychotype = psychotype;
                
                // Show strategy result
                const strategy = strategies[psychotype];
                resultContent.innerHTML = `<strong>${strategy.title}</strong><br>${strategy.content}`;
                resultTips.innerHTML = strategy.tips.split('\n').map(tip => `<div>${tip}</div>`).join('');
                
                resultDiv.style.display = 'block';
                
                // Enable next button immediately after selection
                console.log('Psychotype selected:', psychotype, 'Enabling stage-4-next button');
                const stage4NextBtn = document.getElementById('stage-4-next');
                if (stage4NextBtn) {
                    stage4NextBtn.disabled = false;
                    stage4NextBtn.classList.remove('disabled');
                    console.log('Stage 4 next button enabled');
                }
                
                // Show feedback
                this.showFeedback('stage-4', 'Отлично! Ты нашел свой путь к деньгам! 💸', 'success');
            });

            // Add mobile touch optimization
            card.addEventListener('touchstart', (e) => {
                e.preventDefault();
                card.style.transform = 'scale(0.98)';
            });

            card.addEventListener('touchend', (e) => {
                e.preventDefault();
                card.style.transform = '';
            });
        });
    }

    // Mobile Drag Support System
    addMobileDragSupport(dragElement, dropZones, onDrop) {
        let isDragging = false;
        let currentDropZone = null;
        let touchStartX, touchStartY;
        let elementClone = null;
        let originalParent = null;
        let originalIndex = null;

        const touchStart = (e) => {
            if (e.touches.length > 1) return; // Multi-touch gestures
            
            isDragging = true;
            const touch = e.touches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;

            // Store original position
            originalParent = dragElement.parentNode;
            originalIndex = Array.from(originalParent.children).indexOf(dragElement);

            // Create visual clone for dragging
            elementClone = dragElement.cloneNode(true);
            elementClone.style.position = 'fixed';
            elementClone.style.zIndex = '1000';
            elementClone.style.pointerEvents = 'none';
            elementClone.style.opacity = '0.8';
            elementClone.style.transform = 'scale(1.1)';
            elementClone.style.left = (touch.clientX - dragElement.offsetWidth / 2) + 'px';
            elementClone.style.top = (touch.clientY - dragElement.offsetHeight / 2) + 'px';
            document.body.appendChild(elementClone);

            dragElement.style.opacity = '0.3';

            e.preventDefault();
        };

        const touchMove = (e) => {
            if (!isDragging || e.touches.length > 1) return;

            const touch = e.touches[0];
            
            // Update clone position
            if (elementClone) {
                elementClone.style.left = (touch.clientX - dragElement.offsetWidth / 2) + 'px';
                elementClone.style.top = (touch.clientY - dragElement.offsetHeight / 2) + 'px';
            }

            // Check for drop zone collision
            const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
            const dropZone = elementBelow?.closest('.drop-zone, .sort-slot');

            // Remove highlight from all drop zones
            dropZones.forEach(zone => zone.classList.remove('drag-over'));

            if (dropZone && Array.from(dropZones).includes(dropZone)) {
                currentDropZone = dropZone;
                dropZone.classList.add('drag-over');
            } else {
                currentDropZone = null;
            }

            e.preventDefault();
        };

        const touchEnd = (e) => {
            if (!isDragging) return;

            isDragging = false;

            // Clean up visual elements
            if (elementClone) {
                elementClone.remove();
                elementClone = null;
            }

            dragElement.style.opacity = '';

            // Remove all drag-over highlights
            dropZones.forEach(zone => zone.classList.remove('drag-over'));

            // Handle drop
            if (currentDropZone) {
                onDrop(dragElement, currentDropZone);
            } else {
                // Return to original position with animation
                this.animateReturnToPosition(dragElement, originalParent, originalIndex);
            }

            currentDropZone = null;
            e.preventDefault();
        };

        dragElement.addEventListener('touchstart', touchStart, { passive: false });
        document.addEventListener('touchmove', touchMove, { passive: false });
        document.addEventListener('touchend', touchEnd, { passive: false });
    }

    animateReturnToPosition(element, parent, index) {
        element.style.transition = 'all 0.3s ease';
        element.style.transform = 'scale(1)';
        
        setTimeout(() => {
            if (index >= parent.children.length) {
                parent.appendChild(element);
            } else {
                parent.insertBefore(element, parent.children[index]);
            }
            element.style.transition = '';
        }, 300);
    }

    handleSuccessfulDrop(dragElement, dropZone, stage) {
        // Visual feedback
        dropZone.classList.add('filled');
        dropZone.appendChild(dragElement.cloneNode(true));
        dragElement.style.display = 'none';

        // Haptic feedback
        if (window.Telegram?.WebApp?.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
        }

        // Success message
        this.showFeedback(stage, 'Отлично! Правильный выбор! ✨', 'success');
    }

    handleSuccessfulSort(argument, sortSlot) {
        sortSlot.classList.add('filled');
        sortSlot.appendChild(argument);
        
        // Update argument power display
        const powerDisplay = argument.querySelector('.argument-power');
        powerDisplay.textContent = `Сила: ${sortSlot.dataset.position}`;

        // Haptic feedback
        if (window.Telegram?.WebApp?.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
        }
    }

    returnTriggerToOriginalPosition(trigger) {
        trigger.style.transform = 'translateX(-10px)';
        setTimeout(() => {
            trigger.style.transform = '';
        }, 200);
    }

    returnArgumentToOriginalPosition(argument) {
        argument.style.transform = 'translateY(-10px)';
        setTimeout(() => {
            argument.style.transform = '';
        }, 200);
    }

    completeStage1() {
        this.questData.stage1Completed = true;
        this.showFeedback('stage-1', 'Превосходно! Ты понимаешь психологические триггеры! 🎯', 'success');
        setTimeout(() => {
            document.getElementById('stage-1-next').disabled = false;
            document.getElementById('stage-1-next').classList.remove('disabled');
        }, 1000);
    }

    completeStage2() {
        this.questData.stage2Completed = true;
        this.showFeedback('stage-2', 'Потрясающе! Ты умеешь читать эмоции людей! 😊', 'success');
        setTimeout(() => {
            document.getElementById('stage-2-next').disabled = false;
            document.getElementById('stage-2-next').classList.remove('disabled');
        }, 1000);
    }

    completeStage3() {
        this.questData.stage3Completed = true;
        this.showFeedback('stage-3', 'Блестяще! Ты мастер убеждения! 💬', 'success');
        setTimeout(() => {
            document.getElementById('stage-3-next').disabled = false;
            document.getElementById('stage-3-next').classList.remove('disabled');
        }, 1000);
    }

    completeStage4() {
        this.questData.stage4Completed = true;
        console.log('Stage 4 completed, quest data:', this.questData);
    }

    showFeedback(stage, message, type) {
        const feedback = document.getElementById(`${stage}-feedback`);
        feedback.textContent = message;
        feedback.className = `stage-feedback ${type}`;
    }

    nextScreen() {
        console.log('nextScreen called, currentScreen:', this.currentScreen, 'totalScreens:', this.totalScreens);
        if (this.currentScreen < this.totalScreens - 1) {
            // Hide current screen
            this.screens[this.currentScreen].classList.remove('active');
            this.screens[this.currentScreen].classList.add('exiting');
            
            setTimeout(() => {
                this.screens[this.currentScreen].classList.remove('exiting');
                this.currentScreen++;
                console.log('Switching to screen:', this.currentScreen);
                
                // Show next screen
                this.screens[this.currentScreen].classList.add('active');
                this.updateProgress();
                this.updateNavigation();
                
                // Scroll to top of new screen
                this.screens[this.currentScreen].scrollTop = 0;
            }, 300);
        }
    }

    previousScreen() {
        console.log('previousScreen called, currentScreen:', this.currentScreen);
        if (this.currentScreen > 0) {
            this.screens[this.currentScreen].classList.remove('active');
            this.currentScreen--;
            console.log('Switching to screen:', this.currentScreen);
            this.screens[this.currentScreen].classList.add('active');
            this.updateProgress();
            this.updateNavigation();
            
            // Scroll to top of previous screen
            this.screens[this.currentScreen].scrollTop = 0;
        }
    }

    updateProgress() {
        this.progress = (this.currentScreen / (this.totalScreens - 1)) * 100;
        document.getElementById('progress-fill').style.width = `${this.progress}%`;
        document.getElementById('progress-text').textContent = `${Math.round(this.progress)}%`;
    }

    updateNavigation() {
        const backBtn = document.getElementById('back-btn');
        backBtn.disabled = this.currentScreen === 0;
    }

    restartQuest() {
        this.currentScreen = 0;
        this.questData = {
            stage1Completed: false,
            stage2Completed: false,
            stage3Completed: false,
            stage4Completed: false,
            userPsychotype: null,
            correctAnswers: 0
        };

        // Reset all screens
        this.screens.forEach((screen, index) => {
            screen.classList.remove('active', 'exiting');
            if (index === 0) screen.classList.add('active');
        });

        // Reset all interactive elements
        this.resetAllStages();
        this.updateProgress();
        this.updateNavigation();
    }

    resetAllStages() {
        // Reset Stage 1
        document.querySelectorAll('#stage-1 .trigger-item').forEach(trigger => {
            trigger.style.display = '';
        });
        document.querySelectorAll('#stage-1 .drop-zone').forEach(zone => {
            zone.classList.remove('filled');
            zone.innerHTML = '';
        });
        document.getElementById('stage-1-next').disabled = true;
        document.getElementById('stage-1-next').classList.add('disabled');

        // Reset Stage 2
        document.querySelectorAll('#stage-2 .emotion-card').forEach(card => {
            card.classList.remove('selected', 'wrong');
        });
        document.getElementById('stage-2-next').disabled = true;
        document.getElementById('stage-2-next').classList.add('disabled');

        // Reset Stage 3
        document.querySelectorAll('#stage-3 .sort-slot').forEach(slot => {
            slot.classList.remove('filled');
            slot.innerHTML = `
                <span class="slot-number">${slot.dataset.position}</span>
                <span class="slot-label">${['Слабый', 'Средний', 'Сильный', 'Мощный'][slot.dataset.position - 1]}</span>
            `;
        });
        document.getElementById('stage-3-next').disabled = true;
        document.getElementById('stage-3-next').classList.add('disabled');

        // Reset Stage 4
        document.querySelectorAll('#stage-4 .option-card').forEach(card => {
            card.classList.remove('selected');
        });
        document.getElementById('strategy-result').style.display = 'none';
        document.getElementById('stage-4-next').disabled = true;
        document.getElementById('stage-4-next').classList.add('disabled');
    }

    goToMainMenu() {
        // For Telegram MiniApp
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.close();
        } else {
            // Fallback for testing - improved path handling
            try {
                window.location.href = '../../index.html';
            } catch (error) {
                console.error('Navigation error:', error);
                // Alternative fallback
                window.history.back();
            }
        }
    }
}

// Initialize the quest when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing PsychologyMoneyQuest...');
    try {
        const quest = new PsychologyMoneyQuest();
        console.log('Quest initialized successfully:', quest);
        
        // Additional check for start button
        const startBtn = document.getElementById('start-quest-btn');
        console.log('Start button found:', startBtn);
        if (startBtn) {
            console.log('Start button styles:', window.getComputedStyle(startBtn));
        }
    } catch (error) {
        console.error('Error initializing quest:', error);
    }
});

// Telegram WebApp initialization
if (window.Telegram?.WebApp) {
    console.log('Telegram WebApp detected');
    window.Telegram.WebApp.ready();
    window.Telegram.WebApp.expand();
} else {
    console.log('Running in browser mode');
}

// Additional debug info
console.log('Script loaded at:', new Date());
console.log('User agent:', navigator.userAgent);
