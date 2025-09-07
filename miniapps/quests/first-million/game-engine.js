/* ===== FIRST MILLION GAME ENGINE ===== */

class FirstMillionEngine {
    constructor() {
        this.gameState = {
            currentStage: 0,
            money: 5000,
            reputation: 50,
            valuation: 100000,
            timeStarted: null,
            
            // Прогресс по этапам
            stage1: {
                selectedElements: { team: [], ideas: [], resources: [] },
                correctSelections: 0,
                completed: false
            },
            stage2: {
                clients: [],
                totalRevenue: 0,
                goodClients: 0,
                badClients: 0,
                completed: false
            },
            stage3: {
                drawnPath: [],
                selectedFactors: [],
                predictionAccuracy: 0,
                marketDirection: null,
                completed: false
            },
            stage4: {
                allocatedBudget: { marketing: 0, development: 0, sales: 0, hr: 0 },
                efficiency: 0,
                totalAllocated: 0,
                completed: false
            },
            stage5: {
                crisisDecisions: [],
                correctDecisions: 0,
                totalDecisions: 0,
                averageTime: 0,
                completed: false
            },
            stage6: {
                slideOrder: [],
                presentationScore: 0,
                investmentAmount: 0,
                completed: false
            },
            stage7: {
                checkedItems: [],
                stockPrice: 10.0,
                ipoSuccess: false,
                finalValuation: 0,
                completed: false
            },
            
            // Достижения и статистика
            achievements: [],
            totalScore: 0,
            perfectStages: 0,
            totalTime: 0,
            randomEvents: []
        };
        
        // Инициализация
        this.touchHandler = null;
        this.currentCrisisTimer = null;
        this.init();
    }
    
    init() {
        this.loadProgress();
        this.setupEventListeners();
        this.initializeTouchHandler();
        this.showSplashScreen();
    }
    
    setupEventListeners() {
        // Мобильные события
        document.addEventListener('mobileDrag', this.handleDragEvent.bind(this));
        document.addEventListener('mobileSwipe', this.handleSwipeEvent.bind(this));
        document.addEventListener('mobileDraw', this.handleDrawEvent.bind(this));
    }
    
    initializeTouchHandler() {
        this.touchHandler = new TouchHandler();
    }
    
    showSplashScreen() {
        const splash = document.getElementById('splashScreen');
        const gameContainer = document.getElementById('gameContainer');
        
        // Запускаем анимацию загрузки
        setTimeout(() => {
            splash.classList.add('fade-out');
            setTimeout(() => {
                splash.classList.add('hidden');
                gameContainer.classList.remove('hidden');
                this.startGame();
            }, 500);
        }, 3000);
    }
    
    startGame() {
        this.gameState.timeStarted = Date.now();
        this.gameState.currentStage = 1;
        this.updateUI();
        this.initializeStage1();
    }
    
    // ===== STAGE 1: GARAGE =====
    initializeStage1() {
        this.updateProgress(1);
        this.generateDraggableElements();
        this.updateActionButton('validateStage1', false);
        
        // Инициализируем обработчик кнопки для этого этапа
        const button = document.getElementById('validateStage1');
        if (button) {
            // Удаляем старый обработчик если есть
            button.removeEventListener('click', this.completeStage1);
            // Добавляем новый
            button.addEventListener('click', () => this.completeStage1());
        }
    }
    
    generateDraggableElements() {
        const container = document.getElementById('draggableItems');
        if (!container) return;
        
        container.innerHTML = '';
        
        // Смешиваем все элементы
        const allElements = [
            ...STARTUP_ELEMENTS.team,
            ...STARTUP_ELEMENTS.ideas,
            ...STARTUP_ELEMENTS.resources
        ].sort(() => Math.random() - 0.5);
        
        allElements.forEach(element => {
            const div = document.createElement('div');
            div.className = 'draggable-item';
            div.dataset.id = element.id;
            div.dataset.type = this.getElementType(element.id);
            div.dataset.value = element.value;
            div.textContent = element.name;
            container.appendChild(div);
        });
    }
    
    getElementType(elementId) {
        if (STARTUP_ELEMENTS.team.find(t => t.id === elementId)) return 'team';
        if (STARTUP_ELEMENTS.ideas.find(i => i.id === elementId)) return 'idea';
        if (STARTUP_ELEMENTS.resources.find(r => r.id === elementId)) return 'resource';
        return 'unknown';
    }
    
    handleDragEvent(e) {
        const { type, element, dropZone, success } = e.detail;
        
        if (type === 'dragend' && success) {
            this.handleSuccessfulDrop(element, dropZone);
        }
    }
    
    handleSuccessfulDrop(element, dropZone) {
        const elementId = element.dataset.id;
        const zoneType = dropZone.dataset.type;
        const elementData = this.findElementData(elementId);
        
        if (!elementData) return;
        
        // Проверяем, не добавлен ли уже этот элемент
        const alreadyAdded = this.gameState.stage1.selectedElements[zoneType].some(el => el.id === elementId);
        if (alreadyAdded) return;
        
        // Добавляем в состояние игры
        this.gameState.stage1.selectedElements[zoneType].push(elementData);
        
        // Проверяем правильность выбора
        if (elementData.correct) {
            this.gameState.stage1.correctSelections++;
            this.updateMoney(elementData.value);
            this.showFeedback('Отличный выбор! +$' + elementData.value, 'success');
        } else {
            this.updateMoney(-elementData.value);
            this.showFeedback('Не лучший выбор... -$' + elementData.value, 'error');
        }
        
        // Скрываем оригинальный элемент
        element.style.display = 'none';
        element.classList.add('used');
        
        // Проверяем завершение этапа
        this.checkStage1Completion();
    }
    
    findElementData(elementId) {
        return [...STARTUP_ELEMENTS.team, ...STARTUP_ELEMENTS.ideas, ...STARTUP_ELEMENTS.resources]
            .find(el => el.id === elementId);
    }
    
    addElementToZone(element, zone) {
        const content = zone.querySelector('.zone-content');
        element.classList.remove('dragging');
        element.classList.add('placed');
        element.style.transform = '';
        element.style.position = 'relative';
        content.appendChild(element);
        zone.classList.add('filled');
    }
    
    checkStage1Completion() {
        const { selectedElements } = this.gameState.stage1;
        
        // Проверяем, что все элементы размещены (по 1 в каждой категории)
        const allElementsPlaced = selectedElements.team.length === 1 && 
                                 selectedElements.ideas.length === 1 && 
                                 selectedElements.resources.length === 1;
        
        // Показываем уведомление о прогрессе
        if (allElementsPlaced) {
            this.showFeedback('🎉 Все готово! Можно запускать стартап!', 'success');
        }
        
        this.updateActionButton('validateStage1', allElementsPlaced);
    }
    
    completeStage1() {
        this.showFeedback('🚀 Стартап запущен! Переходим к поиску клиентов...', 'success');
        this.gameState.stage1.completed = true;
        this.calculateStage1Score();
        this.nextStage();
    }
    
    calculateStage1Score() {
        const { correctSelections } = this.gameState.stage1;
        const score = correctSelections * 50;
        this.gameState.totalScore += score;
        
        if (correctSelections >= 3) {
            this.gameState.perfectStages++;
            this.unlockAchievement('garage_guru');
        }
    }
    
    // ===== STAGE 2: CLIENTS =====
    initializeStage2() {
        this.updateProgress(2);
        this.showCurrentClient();
    }
    
    showCurrentClient() {
        if (this.gameState.stage2.clients.length >= 5) {
            this.completeStage2();
            return;
        }
        
        const remainingClients = POTENTIAL_CLIENTS.filter(client => 
            !this.gameState.stage2.clients.some(c => c.id === client.id)
        );
        
        if (remainingClients.length === 0) {
            this.completeStage2();
            return;
        }
        
        const randomClient = remainingClients[Math.floor(Math.random() * remainingClients.length)];
        this.renderClientCard(randomClient);
    }
    
    renderClientCard(client) {
        const card = document.getElementById('currentClientCard');
        if (!card) return;
        
        card.innerHTML = `
            <div class="client-avatar">${client.avatar}</div>
            <div class="client-name">${client.name}</div>
            <div class="client-budget">${client.budget}</div>
            <div class="client-description">${client.description}</div>
            <div style="margin-top: 15px; font-size: 0.8rem; color: #666;">
                <strong>Тип:</strong> ${client.personality}
            </div>
        `;
        
        card.dataset.clientId = client.id;
    }
    
    handleSwipeEvent(e) {
        const { type, element, direction } = e.detail;
        
        if (type === 'swipe' && this.gameState.currentStage === 2) {
            this.processClientSwipe(element, direction);
        }
    }
    
    processClientSwipe(element, direction) {
        const clientId = element.dataset.clientId;
        const client = POTENTIAL_CLIENTS.find(c => c.id === clientId);
        
        if (!client) return;
        
        const accepted = direction === 'right';
        const isGoodChoice = (accepted && client.correct) || (!accepted && !client.correct);
        
        // Добавляем в историю
        this.gameState.stage2.clients.push({
            ...client,
            accepted,
            isGoodChoice
        });
        
        if (accepted) {
            if (client.correct) {
                this.gameState.stage2.goodClients++;
                this.gameState.stage2.totalRevenue += client.value;
                this.updateMoney(client.value * 0.1); // 10% предоплата
                this.showFeedback(`Отлично! Клиент принят. +$${client.value * 0.1}`, 'success');
            } else {
                this.gameState.stage2.badClients++;
                this.updateMoney(-1000);
                this.showFeedback('Проблемный клиент... -$1000', 'error');
            }
        } else {
            if (!client.correct) {
                this.showFeedback('Мудро отклонили!', 'success');
            } else {
                this.showFeedback('Упустили хорошего клиента...', 'warning');
            }
        }
        
        this.updateClientStats();
        
        // Показываем следующего клиента через короткую задержку
        setTimeout(() => {
            this.showCurrentClient();
        }, 500);
    }
    
    updateClientStats() {
        const clientCountEl = document.getElementById('clientCount');
        const revenueCountEl = document.getElementById('revenueCount');
        
        if (clientCountEl) {
            clientCountEl.textContent = this.gameState.stage2.goodClients;
        }
        
        if (revenueCountEl) {
            revenueCountEl.textContent = '$' + this.gameState.stage2.totalRevenue.toLocaleString();
        }
    }
    
    completeStage2() {
        this.gameState.stage2.completed = true;
        this.calculateStage2Score();
        
        if (this.gameState.stage2.goodClients >= 5) {
            this.unlockAchievement('client_whisperer');
        }
        
        this.nextStage();
    }
    
    calculateStage2Score() {
        const { goodClients, badClients } = this.gameState.stage2;
        const score = (goodClients * 100) - (badClients * 50);
        this.gameState.totalScore += Math.max(0, score);
        
        if (goodClients >= 4 && badClients === 0) {
            this.gameState.perfectStages++;
        }
    }
    
    // ===== STAGE 3: MARKET ANALYSIS =====
    initializeStage3() {
        this.updateProgress(3);
        this.setupMarketChart();
        this.generateMarketFactors();
        this.updateActionButton('analyzeMarket', false);
        
        // Инициализируем обработчик кнопки
        const button = document.getElementById('analyzeMarket');
        if (button) {
            button.removeEventListener('click', this.completeStage3);
            button.addEventListener('click', () => this.completeStage3());
        }
    }
    
    setupMarketChart() {
        const canvas = document.getElementById('marketChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // Настраиваем размеры canvas
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * window.devicePixelRatio;
        canvas.height = rect.height * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        
        // Рисуем оси
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 1;
        ctx.beginPath();
        
        // Горизонтальные линии
        for (let i = 0; i <= 4; i++) {
            const y = (rect.height / 4) * i;
            ctx.moveTo(0, y);
            ctx.lineTo(rect.width, y);
        }
        
        // Вертикальные линии
        for (let i = 0; i <= 6; i++) {
            const x = (rect.width / 6) * i;
            ctx.moveTo(x, 0);
            ctx.lineTo(x, rect.height);
        }
        
        ctx.stroke();
    }
    
    generateMarketFactors() {
        const container = document.getElementById('factorsGrid');
        if (!container) return;
        
        // Выбираем 4 случайных фактора
        const selectedFactors = MARKET_FACTORS
            .sort(() => Math.random() - 0.5)
            .slice(0, 4);
        
        container.innerHTML = '';
        
        selectedFactors.forEach(factor => {
            const div = document.createElement('div');
            div.className = `factor-item ${factor.impact}`;
            div.innerHTML = `
                <span class="factor-name">${factor.name}</span>
                <span class="factor-impact ${factor.impact}">${factor.value}</span>
            `;
            container.appendChild(div);
        });
        
        this.gameState.stage3.selectedFactors = selectedFactors;
    }
    
    handleDrawEvent(e) {
        const { type, path } = e.detail;
        
        if (type === 'draw_complete' && this.gameState.currentStage === 3) {
            this.gameState.stage3.drawnPath = path;
            this.analyzeDrawnPrediction();
            this.updateActionButton('analyzeMarket', true);
        }
    }
    
    analyzeDrawnPrediction() {
        const path = this.gameState.stage3.drawnPath;
        if (path.length < 5) return;
        
        // Анализируем тренд
        const startY = path[0].y;
        const endY = path[path.length - 1].y;
        const trend = startY > endY ? 'up' : startY < endY ? 'down' : 'stable';
        
        // Анализируем факторы
        const factors = this.gameState.stage3.selectedFactors;
        const positiveImpact = factors.filter(f => f.impact === 'positive').length;
        const negativeImpact = factors.filter(f => f.impact === 'negative').length;
        
        let expectedTrend = 'stable';
        if (positiveImpact > negativeImpact) expectedTrend = 'up';
        else if (negativeImpact > positiveImpact) expectedTrend = 'down';
        
        // Рассчитываем точность
        const accuracy = trend === expectedTrend ? 85 + Math.random() * 15 : 30 + Math.random() * 40;
        this.gameState.stage3.predictionAccuracy = Math.round(accuracy);
        this.gameState.stage3.marketDirection = trend;
        
        // Обновляем отображение
        const overlay = document.querySelector('.chart-overlay .chart-instruction');
        if (overlay) {
            overlay.textContent = `Прогноз: ${trend === 'up' ? '📈 Рост' : trend === 'down' ? '📉 Падение' : '➡️ Стабильность'}`;
        }
    }
    
    completeStage3() {
        this.gameState.stage3.completed = true;
        this.calculateStage3Score();
        
        if (this.gameState.stage3.predictionAccuracy >= 80) {
            this.unlockAchievement('market_prophet');
        }
        
        this.nextStage();
    }
    
    calculateStage3Score() {
        const { predictionAccuracy } = this.gameState.stage3;
        const score = predictionAccuracy * 2;
        this.gameState.totalScore += score;
        
        if (predictionAccuracy >= 85) {
            this.gameState.perfectStages++;
        }
    }
    
    // ===== STAGE 4: RESOURCE ALLOCATION =====
    initializeStage4() {
        this.updateProgress(4);
        this.generateMoneyItems();
        this.updateActionButton('allocateResources', false);
        
        // Инициализируем обработчик кнопки
        const button = document.getElementById('allocateResources');
        if (button) {
            button.removeEventListener('click', this.completeStage4);
            button.addEventListener('click', () => this.completeStage4());
        }
    }
    
    generateMoneyItems() {
        const container = document.getElementById('moneyStack');
        if (!container) return;
        
        container.innerHTML = '';
        
        // Создаем 10 элементов по $10K каждый
        for (let i = 0; i < 10; i++) {
            const div = document.createElement('div');
            div.className = 'money-item';
            div.dataset.value = '10000';
            div.textContent = '$10K';
            container.appendChild(div);
        }
        
        this.updateBudgetDisplay();
    }
    
    updateBudgetDisplay() {
        const available = 100000 - this.gameState.stage4.totalAllocated;
        const budgetEl = document.getElementById('availableBudget');
        if (budgetEl) {
            budgetEl.textContent = available.toLocaleString();
        }
    }
    
    // Логика распределения бюджета обрабатывается в handleDragEvent
    
    completeStage4() {
        this.gameState.stage4.completed = true;
        this.calculateStage4Score();
        
        if (this.gameState.stage4.efficiency >= 90) {
            this.unlockAchievement('resource_master');
        }
        
        this.nextStage();
    }
    
    calculateStage4Score() {
        const { efficiency } = this.gameState.stage4;
        const score = efficiency * 3;
        this.gameState.totalScore += score;
        
        if (efficiency >= 95) {
            this.gameState.perfectStages++;
        }
    }
    
    // ===== STAGE 5: CRISIS MANAGEMENT =====
    initializeStage5() {
        this.updateProgress(5);
        this.startCrisisScenario();
    }
    
    startCrisisScenario() {
        if (this.gameState.stage5.totalDecisions >= 5) {
            this.completeStage5();
            return;
        }
        
        const availableScenarios = CRISIS_SCENARIOS.filter(scenario => 
            !this.gameState.stage5.crisisDecisions.some(d => d.scenarioId === scenario.id)
        );
        
        if (availableScenarios.length === 0) {
            this.completeStage5();
            return;
        }
        
        const scenario = availableScenarios[Math.floor(Math.random() * availableScenarios.length)];
        this.showCrisisScenario(scenario);
    }
    
    showCrisisScenario(scenario) {
        const container = document.getElementById('crisisScenario');
        const buttonsContainer = document.getElementById('decisionButtons');
        
        if (!container || !buttonsContainer) return;
        
        container.innerHTML = `
            <div class="crisis-title">${scenario.title}</div>
            <div class="crisis-description">${scenario.description}</div>
        `;
        
        buttonsContainer.innerHTML = '';
        
        scenario.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'decision-btn';
            button.textContent = option.text;
            button.addEventListener('click', () => this.selectCrisisOption(scenario, option, index));
            buttonsContainer.appendChild(button);
        });
        
        this.startCrisisTimer(scenario.timeLimit);
    }
    
    startCrisisTimer(timeLimit) {
        const timerEl = document.getElementById('crisisTimer');
        let timeLeft = timeLimit;
        
        this.currentCrisisTimer = setInterval(() => {
            if (timerEl) {
                timerEl.textContent = timeLeft;
            }
            
            timeLeft--;
            
            if (timeLeft < 0) {
                this.handleCrisisTimeout();
                clearInterval(this.currentCrisisTimer);
            }
        }, 1000);
    }
    
    selectCrisisOption(scenario, option, optionIndex) {
        if (this.currentCrisisTimer) {
            clearInterval(this.currentCrisisTimer);
        }
        
        const decision = {
            scenarioId: scenario.id,
            optionIndex,
            option,
            correct: option.correct,
            timeSpent: scenario.timeLimit - parseInt(document.getElementById('crisisTimer').textContent)
        };
        
        this.gameState.stage5.crisisDecisions.push(decision);
        this.gameState.stage5.totalDecisions++;
        
        if (option.correct) {
            this.gameState.stage5.correctDecisions++;
        }
        
        // Применяем эффекты решения
        this.applyDecisionEffects(option);
        
        this.updateCrisisStats();
        
        // Показываем результат и переходим к следующему кризису
        this.showDecisionResult(option, () => {
            setTimeout(() => this.startCrisisScenario(), 1000);
        });
    }
    
    handleCrisisTimeout() {
        // Автоматически выбираем худший вариант при тайм-ауте
        this.showFeedback('Время вышло! Кризис обострился...', 'error');
        this.updateMoney(-5000);
        this.gameState.stage5.totalDecisions++;
        
        setTimeout(() => this.startCrisisScenario(), 2000);
    }
    
    applyDecisionEffects(option) {
        if (option.impact.money) {
            this.updateMoney(option.impact.money);
        }
        if (option.impact.reputation) {
            this.gameState.reputation = Math.max(0, Math.min(100, this.gameState.reputation + option.impact.reputation));
        }
    }
    
    showDecisionResult(option, callback) {
        const result = option.correct ? 'Отличное решение!' : 'Можно было лучше...';
        const type = option.correct ? 'success' : 'warning';
        
        this.showFeedback(result, type);
        
        if (callback) callback();
    }
    
    updateCrisisStats() {
        const decisionsEl = document.getElementById('decisionsCount');
        const accuracyEl = document.getElementById('accuracyScore');
        
        if (decisionsEl) {
            decisionsEl.textContent = `${this.gameState.stage5.totalDecisions}/5`;
        }
        
        if (accuracyEl) {
            const accuracy = this.gameState.stage5.totalDecisions > 0 
                ? Math.round((this.gameState.stage5.correctDecisions / this.gameState.stage5.totalDecisions) * 100)
                : 0;
            accuracyEl.textContent = `${accuracy}%`;
        }
    }
    
    completeStage5() {
        this.gameState.stage5.completed = true;
        this.calculateStage5Score();
        
        if (this.gameState.stage5.correctDecisions >= 4) {
            this.unlockAchievement('crisis_manager');
        }
        
        this.nextStage();
    }
    
    calculateStage5Score() {
        const { correctDecisions, totalDecisions } = this.gameState.stage5;
        const accuracy = totalDecisions > 0 ? correctDecisions / totalDecisions : 0;
        const score = accuracy * 200;
        this.gameState.totalScore += score;
        
        if (accuracy >= 0.8) {
            this.gameState.perfectStages++;
        }
    }
    
    // ===== STAGE 6: INVESTOR PITCH =====
    initializeStage6() {
        this.updateProgress(6);
        this.generateSlideTemplates();
        this.updateActionButton('presentPitch', false);
        
        // Инициализируем обработчик кнопки
        const button = document.getElementById('presentPitch');
        if (button) {
            button.removeEventListener('click', this.completeStage6);
            button.addEventListener('click', () => this.completeStage6());
        }
    }
    
    generateSlideTemplates() {
        const container = document.getElementById('slideTemplates');
        if (!container) return;
        
        container.innerHTML = '';
        
        // Перемешиваем слайды
        const shuffledSlides = [...PITCH_SLIDES].sort(() => Math.random() - 0.5);
        
        shuffledSlides.forEach(slide => {
            const div = document.createElement('div');
            div.className = 'slide-template';
            div.dataset.slideId = slide.id;
            div.dataset.position = slide.position;
            div.innerHTML = `
                <div class="slide-icon">${slide.icon}</div>
                <div class="slide-title">${slide.title}</div>
            `;
            container.appendChild(div);
        });
    }
    
    // Логика слайдов обрабатывается в handleDragEvent
    
    completeStage6() {
        this.gameState.stage6.completed = true;
        this.calculateStage6Score();
        
        if (this.gameState.stage6.slideOrder === 'perfect') {
            this.unlockAchievement('pitch_perfect');
        }
        
        this.nextStage();
    }
    
    calculateStage6Score() {
        const { presentationScore } = this.gameState.stage6;
        const score = presentationScore * 2;
        this.gameState.totalScore += score;
        
        if (presentationScore >= 90) {
            this.gameState.perfectStages++;
        }
    }
    
    // ===== STAGE 7: IPO =====
    initializeStage7() {
        this.updateProgress(7);
        this.generateIPOChecklist();
        this.updateCompanyMetrics();
        
        // Инициализируем обработчики кнопок
        const launchButton = document.getElementById('launchIPO');
        if (launchButton) {
            launchButton.removeEventListener('click', this.completeStage7);
            launchButton.addEventListener('click', () => this.completeStage7());
        }
        
        // IPO controls
        document.querySelectorAll('.price-btn').forEach(btn => {
            btn.removeEventListener('click', this.adjustStockPrice);
            btn.addEventListener('click', (e) => this.adjustStockPrice(e.target.dataset.action));
        });
        
        // Checklist items
        document.addEventListener('click', (e) => {
            if (e.target.closest('.checklist-item')) {
                this.toggleChecklistItem(e.target.closest('.checklist-item'));
            }
        });
    }
    
    generateIPOChecklist() {
        const container = document.getElementById('ipoChecklist');
        if (!container) return;
        
        container.innerHTML = '';
        
        IPO_CHECKLIST.forEach(item => {
            const div = document.createElement('div');
            div.className = 'checklist-item';
            div.dataset.itemId = item.id;
            div.innerHTML = `
                <div class="checklist-checkbox">✓</div>
                <div class="checklist-text">${item.text}</div>
            `;
            container.appendChild(div);
        });
    }
    
    toggleChecklistItem(item) {
        const itemId = item.dataset.itemId;
        const isCompleted = item.classList.contains('completed');
        
        if (!isCompleted) {
            item.classList.add('completed');
            this.gameState.stage7.checkedItems.push(itemId);
            
            const itemData = IPO_CHECKLIST.find(i => i.id === itemId);
            if (itemData) {
                this.gameState.valuation += itemData.impact.valuation;
                this.updateCompanyMetrics();
            }
        }
        
        this.checkIPOReadiness();
    }
    
    adjustStockPrice(action) {
        const priceEl = document.getElementById('stockPrice');
        if (!priceEl) return;
        
        let currentPrice = this.gameState.stage7.stockPrice;
        
        if (action === 'increase') {
            currentPrice = Math.min(50, currentPrice + 0.5);
        } else {
            currentPrice = Math.max(1, currentPrice - 0.5);
        }
        
        this.gameState.stage7.stockPrice = currentPrice;
        priceEl.textContent = '$' + currentPrice.toFixed(2);
    }
    
    updateCompanyMetrics() {
        const valuationEl = document.getElementById('companyValuation');
        const employeeEl = document.getElementById('employeeCount');
        const revenueEl = document.getElementById('monthlyRevenue');
        
        if (valuationEl) {
            valuationEl.textContent = '$' + (this.gameState.valuation / 1000000).toFixed(1) + 'M';
        }
        
        if (employeeEl) {
            const employees = 10 + Math.floor(this.gameState.valuation / 100000);
            employeeEl.textContent = employees;
        }
        
        if (revenueEl) {
            const revenue = Math.floor(this.gameState.valuation * 0.05 / 1000);
            revenueEl.textContent = '$' + revenue + 'K';
        }
    }
    
    checkIPOReadiness() {
        const checkedItems = this.gameState.stage7.checkedItems.length;
        const totalItems = IPO_CHECKLIST.length;
        const readiness = checkedItems >= totalItems * 0.75; // 75% готовности
        
        this.updateActionButton('launchIPO', readiness);
    }
    
    completeStage7() {
        this.gameState.stage7.completed = true;
        this.gameState.stage7.finalValuation = this.gameState.valuation;
        this.gameState.stage7.ipoSuccess = this.gameState.stage7.checkedItems.length >= 6;
        
        this.calculateStage7Score();
        
        if (this.gameState.stage7.ipoSuccess) {
            this.unlockAchievement('ipo_champion');
        }
        
        if (this.gameState.valuation >= 1000000) {
            this.unlockAchievement('first_million');
        }
        
        this.showVictoryScreen();
    }
    
    calculateStage7Score() {
        const checkedItems = this.gameState.stage7.checkedItems.length;
        const score = checkedItems * 50;
        this.gameState.totalScore += score;
        
        if (checkedItems >= 7) {
            this.gameState.perfectStages++;
        }
    }
    
    // ===== UTILITY METHODS =====
    nextStage() {
        this.gameState.currentStage++;
        
        // Скрываем текущий этап
        document.querySelectorAll('.game-stage').forEach(stage => {
            stage.classList.remove('active');
        });
        
        // Показываем следующий этап
        const nextStage = document.getElementById(`stage${this.gameState.currentStage}`);
        if (nextStage) {
            nextStage.classList.add('active');
            this[`initializeStage${this.gameState.currentStage}`]();
        }
        
        this.saveProgress();
    }
    
    updateProgress(stage) {
        const progressFill = document.getElementById('progressFill');
        const stageIndicator = document.getElementById('stageIndicator');
        
        if (progressFill) {
            progressFill.style.width = `${(stage / 7) * 100}%`;
        }
        
        if (stageIndicator) {
            const stageNames = [
                '', 'Гараж', 'Клиенты', 'Анализ рынка', 
                'Масштабирование', 'Кризис', 'Инвестиции', 'IPO'
            ];
            stageIndicator.textContent = `Этап ${stage}/7: ${stageNames[stage]}`;
        }
    }
    
    updateMoney(amount) {
        this.gameState.money += amount;
        const moneyEl = document.getElementById('moneyAmount');
        if (moneyEl) {
            moneyEl.textContent = this.gameState.money.toLocaleString();
        }
    }
    
    updateActionButton(buttonId, enabled) {
        const button = document.getElementById(buttonId);
        if (button) {
            button.disabled = !enabled;
            // Добавляем визуальную обратную связь
            if (enabled) {
                button.style.opacity = '1';
                button.style.transform = 'scale(1)';
            } else {
                button.style.opacity = '0.6';
                button.style.transform = 'scale(0.98)';
            }
        }
    }
    
    showFeedback(message, type = 'info') {
        // Создаем временное уведомление
        const feedback = document.createElement('div');
        feedback.className = `feedback-toast ${type}`;
        feedback.textContent = message;
        feedback.style.cssText = `
            position: fixed;
            top: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#ff9800'};
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            z-index: 10000;
            font-weight: bold;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            animation: slideUp 0.3s ease-out;
        `;
        
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            feedback.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => feedback.remove(), 300);
        }, 2000);
    }
    
    unlockAchievement(achievementId) {
        if (this.gameState.achievements.includes(achievementId)) return;
        
        this.gameState.achievements.push(achievementId);
        const achievement = ACHIEVEMENTS[achievementId];
        
        if (achievement) {
            this.showFeedback(`🏆 ${achievement.name}`, 'success');
        }
    }
    
    showVictoryScreen() {
        this.gameState.totalTime = Date.now() - this.gameState.timeStarted;
        
        // Проверяем достижение скорости
        if (this.gameState.totalTime < 900000) { // 15 минут
            this.unlockAchievement('speed_demon');
        }
        
        // Проверяем достижение перфекциониста
        if (this.gameState.perfectStages >= 6) {
            this.unlockAchievement('perfectionist');
        }
        
        this.updateVictoryScreenData();
        
        const victoryScreen = document.getElementById('victoryScreen');
        if (victoryScreen) {
            victoryScreen.classList.remove('hidden');
        }
        
        this.saveProgress();
    }
    
    updateVictoryScreenData() {
        const finalValuationEl = document.getElementById('finalValuation');
        const ownershipEl = document.getElementById('ownershipShare');
        const wealthEl = document.getElementById('personalWealth');
        const achievementsEl = document.getElementById('achievements');
        
        if (finalValuationEl) {
            finalValuationEl.textContent = '$' + (this.gameState.valuation / 1000000).toFixed(1) + 'M';
        }
        
        const ownership = Math.max(10, 100 - (this.gameState.currentStage * 10));
        if (ownershipEl) {
            ownershipEl.textContent = ownership + '%';
        }
        
        const personalWealth = this.gameState.valuation * (ownership / 100);
        if (wealthEl) {
            wealthEl.textContent = '$' + (personalWealth / 1000000).toFixed(1) + 'M';
        }
        
        if (achievementsEl) {
            achievementsEl.innerHTML = '';
            this.gameState.achievements.forEach(achievementId => {
                const achievement = ACHIEVEMENTS[achievementId];
                if (achievement) {
                    const badge = document.createElement('div');
                    badge.className = 'achievement-badge';
                    badge.textContent = achievement.name;
                    achievementsEl.appendChild(badge);
                }
            });
        }
    }
    
    saveProgress() {
        try {
            localStorage.setItem('firstMillionProgress', JSON.stringify(this.gameState));
        } catch (e) {
            console.warn('Не удалось сохранить прогресс:', e);
        }
    }
    
    loadProgress() {
        try {
            const saved = localStorage.getItem('firstMillionProgress');
            if (saved) {
                const parsed = JSON.parse(saved);
                this.gameState = { ...this.gameState, ...parsed };
            }
        } catch (e) {
            console.warn('Не удалось загрузить прогресс:', e);
        }
    }
    
    updateUI() {
        this.updateMoney(0); // Обновить отображение без изменения значения
        this.updateProgress(this.gameState.currentStage);
    }
}

// Глобальные функции для кнопок
function goBack() {
    // Проверяем, находимся ли мы в Telegram WebApp
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.close();
    } else {
        // Обычная навигация
        window.location.href = '../../../index.html';
    }
}

function shareResults() {
    if (navigator.share) {
        navigator.share({
            title: 'Первый Миллион - Результат',
            text: `Я прошел путь от гаража до IPO! Оценка компании: $${(window.gameEngine.gameState.valuation / 1000000).toFixed(1)}M`,
            url: window.location.href
        });
    } else {
        // Fallback для устройств без Web Share API
        const text = `Я прошел путь от гаража до IPO! Оценка компании: $${(window.gameEngine.gameState.valuation / 1000000).toFixed(1)}M`;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text);
            alert('Результат скопирован в буфер обмена!');
        }
    }
}

function playAgain() {
    localStorage.removeItem('firstMillionProgress');
    window.location.reload();
}

// Экспорт класса
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FirstMillionEngine;
}
