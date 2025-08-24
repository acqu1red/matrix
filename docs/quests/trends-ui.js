/* ===== TRENDS QUEST UI MANAGER ===== */

class TrendsQuestUI {
  constructor(engine) {
    this.engine = engine;
    this.elements = {};
    this.currentQuestion = null;
    this.animationQueue = [];
  }

  // Инициализация UI
  initialize() {
    this.cacheElements();
    this.setupEventListeners();
    this.showIntroModal();
  }

  // Кэширование элементов DOM
  cacheElements() {
    this.elements = {
      // Модальные окна
      introModal: document.getElementById('introModal'),
      resultsModal: document.getElementById('resultsModal'),
      
      // Основной интерфейс
      questInterface: document.getElementById('questInterface'),
      
      // Панель статуса
      currentStage: document.getElementById('currentStage'),
      portfolioValue: document.getElementById('portfolioValue'),
      accuracy: document.getElementById('accuracy'),
      reputation: document.getElementById('reputation'),
      timeIndicator: document.getElementById('timeIndicator'),
      stageIndicator: document.getElementById('stageIndicator'),
      
      // Рабочие области
      marketOverview: document.getElementById('marketOverview'),
      chartsContainer: document.getElementById('chartsContainer'),
      newsFeed: document.getElementById('newsFeed'),
      decisionContent: document.getElementById('decisionContent'),
      actionButtons: document.getElementById('actionButtons'),
      
      // Лог событий
      logContent: document.getElementById('logContent'),
      clearLog: document.getElementById('clearLog'),
      
      // Кнопки
      startQuest: document.getElementById('startQuest'),
      btnBack: document.getElementById('btnBack'),
      restartQuest: document.getElementById('restartQuest'),
      exitQuest: document.getElementById('exitQuest'),
      
      // Результаты
      resultsIcon: document.getElementById('resultsIcon'),
      resultsTitle: document.getElementById('resultsTitle'),
      resultsContent: document.getElementById('resultsContent'),
      
      // Toast
      toast: document.getElementById('toast')
    };
  }

  // Настройка обработчиков событий
  setupEventListeners() {
    // Кнопки модального окна
    this.elements.startQuest?.addEventListener('click', () => this.startQuest());
    this.elements.restartQuest?.addEventListener('click', () => this.restartQuest());
    this.elements.exitQuest?.addEventListener('click', () => this.exitQuest());
    this.elements.btnBack?.addEventListener('click', () => this.goBack());
    
    // Очистка лога
    this.elements.clearLog?.addEventListener('click', () => this.clearEventLog());
    
    // Закрытие модальных окон по клику вне них
    this.elements.introModal?.addEventListener('click', (e) => {
      if (e.target === this.elements.introModal) {
        this.hideIntroModal();
      }
    });
    
    this.elements.resultsModal?.addEventListener('click', (e) => {
      if (e.target === this.elements.resultsModal) {
        this.hideResultsModal();
      }
    });

    // Обновление UI каждую секунду
    setInterval(() => this.updateTimeIndicator(), 1000);
  }

  // Показать модальное окно введения
  showIntroModal() {
    this.elements.introModal?.classList.add('show');
  }

  // Скрыть модальное окно введения
  hideIntroModal() {
    this.elements.introModal?.classList.remove('show');
  }

  // Запуск квеста
  startQuest() {
    this.hideIntroModal();
    this.elements.questInterface.style.display = 'flex';
    
    // Запускаем движок
    this.engine.startQuest();
    
    // Инициализируем UI
    this.updateStatusPanel();
    this.updateMarketData();
    this.updateNewsFeed();
    this.loadCurrentQuestion();
    
    this.showToast('Анализ трендов начат!', 'success');
  }

  // Перезапуск квеста
  restartQuest() {
    this.hideResultsModal();
    this.engine.resetGameState();
    this.engine.initialize();
    this.clearEventLog();
    this.startQuest();
  }

  // Выход из квеста
  exitQuest() {
    this.goBack();
  }

  // Возврат на главную
  goBack() {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '../quests.html';
    }
  }

  // Обновление панели статуса
  updateStatusPanel() {
    const gameState = this.engine.getGameState();
    
    if (this.elements.currentStage) {
      this.elements.currentStage.textContent = `${gameState.currentStage}/${QUEST_CONFIG.stages}`;
    }
    
    if (this.elements.portfolioValue) {
      this.elements.portfolioValue.textContent = `$${Math.round(gameState.portfolio / 1000)}K`;
    }
    
    if (this.elements.accuracy) {
      this.elements.accuracy.textContent = `${Math.round(gameState.accuracy)}%`;
    }
    
    if (this.elements.reputation) {
      const stars = '★'.repeat(gameState.reputation) + '☆'.repeat(5 - gameState.reputation);
      this.elements.reputation.textContent = stars;
    }
    
    if (this.elements.stageIndicator) {
      const stageNames = this.engine.getStageNames();
      this.elements.stageIndicator.textContent = stageNames[gameState.currentStage - 1] || 'Завершение';
    }
  }

  // Обновление индикатора времени
  updateTimeIndicator() {
    if (!this.elements.timeIndicator) return;
    
    const now = new Date();
    const timeString = now.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: 'America/New_York'
    });
    
    this.elements.timeIndicator.textContent = `${timeString} NYSE`;
  }

  // Обновление рыночных данных
  updateMarketData() {
    if (!this.elements.marketOverview) return;
    
    const marketData = DataService.getMarketData();
    
    this.elements.marketOverview.innerHTML = '';
    
    marketData.indices.forEach(index => {
      const item = document.createElement('div');
      item.className = 'market-item';
      
      const changeClass = index.changePercent > 0 ? 'positive' : 
                         index.changePercent < 0 ? 'negative' : 'neutral';
      
      item.innerHTML = `
        <div class="market-symbol">${index.symbol}</div>
        <div class="market-price">${index.price.toFixed(2)}</div>
        <div class="market-change ${changeClass}">
          ${index.changePercent > 0 ? '+' : ''}${index.changePercent.toFixed(2)}%
        </div>
      `;
      
      this.elements.marketOverview.appendChild(item);
    });
  }

  // Обновление ленты новостей
  updateNewsFeed() {
    if (!this.elements.newsFeed) return;
    
    const news = DataService.getNewsEvents(4);
    
    this.elements.newsFeed.innerHTML = `
      <div class="news-header">
        <span>📰</span>
        <span>Рыночные новости</span>
      </div>
    `;
    
    news.forEach(newsItem => {
      const item = document.createElement('div');
      item.className = `news-item ${newsItem.type}`;
      
      item.innerHTML = `
        <div class="news-time">${newsItem.time}</div>
        <div class="news-text">${newsItem.content}</div>
      `;
      
      this.elements.newsFeed.appendChild(item);
    });
  }

  // Обновление графиков
  updateCharts(trendId) {
    if (!this.elements.chartsContainer) return;
    
    const trend = DataService.getTrendData(trendId);
    if (!trend) return;
    
    const chartData = DataService.generateChartData(trend);
    
    this.elements.chartsContainer.innerHTML = `
      <div class="chart-title">Тренд: ${trend.name}</div>
      <div class="chart-canvas" id="trendChart"></div>
    `;
    
    this.renderChart('trendChart', chartData);
  }

  // Отрисовка графика
  renderChart(canvasId, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    canvas.innerHTML = '';
    
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    
    // Находим минимальные и максимальные значения
    const minY = Math.min(...data.map(p => p.y));
    const maxY = Math.max(...data.map(p => p.y));
    const rangeY = maxY - minY || 1;
    
    // Создаем линию графика
    let pathData = '';
    
    data.forEach((point, index) => {
      const x = (point.x / 100) * width;
      const y = height - ((point.y - minY) / rangeY) * height;
      
      if (index === 0) {
        pathData += `M ${x} ${y}`;
      } else {
        pathData += ` L ${x} ${y}`;
      }
      
      // Добавляем точки
      if (index % 5 === 0) {
        const pointEl = document.createElement('div');
        pointEl.className = 'chart-point';
        pointEl.style.left = `${x}px`;
        pointEl.style.top = `${y}px`;
        canvas.appendChild(pointEl);
      }
    });
    
    // Создаем SVG для линии
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.style.position = 'absolute';
    svg.style.top = '0';
    svg.style.left = '0';
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.pointerEvents = 'none';
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathData);
    path.setAttribute('stroke', '#ffffff');
    path.setAttribute('stroke-width', '2');
    path.setAttribute('fill', 'none');
    
    svg.appendChild(path);
    canvas.appendChild(svg);
  }

  // Загрузка текущего вопроса
  loadCurrentQuestion() {
    const gameState = this.engine.getGameState();
    const questions = DataService.getQuestionsByStage(gameState.currentStage);
    
    if (gameState.currentQuestion >= questions.length) {
      // Переход к следующему этапу или завершение
      if (gameState.currentStage < QUEST_CONFIG.stages) {
        this.engine.loadStage(gameState.currentStage + 1);
        this.updateStatusPanel();
        this.loadCurrentQuestion();
      } else {
        this.completeQuest();
      }
      return;
    }
    
    this.currentQuestion = questions[gameState.currentQuestion];
    this.renderQuestion(this.currentQuestion);
  }

  // Отрисовка вопроса
  renderQuestion(question) {
    if (!this.elements.decisionContent) return;
    
    this.elements.decisionContent.innerHTML = `
      <div class="decision-question">
        <div class="question-title">${question.title}</div>
        <div class="question-text">${question.question}</div>
        ${question.context ? `<p style="margin-top: 12px; font-size: 12px; color: var(--text-muted); font-style: italic;">${question.context}</p>` : ''}
      </div>
    `;
    
    // Отрисовываем опции в зависимости от типа вопроса
    switch (question.type) {
      case 'multiple-choice':
      case 'scenario-analysis':
      case 'pattern-recognition':
        this.renderMultipleChoiceOptions(question);
        break;
      
      case 'trend-ranking':
        this.renderTrendRankingOptions(question);
        break;
      
      case 'portfolio-allocation':
        this.renderPortfolioAllocationOptions(question);
        break;
      
      default:
        this.elements.decisionContent.innerHTML += '<p>Неизвестный тип вопроса</p>';
    }
    
    this.renderActionButtons();
  }

  // Отрисовка вариантов множественного выбора
  renderMultipleChoiceOptions(question) {
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'options-grid';
    
    const options = question.options || question.patterns || question.strategies;
    
    options.forEach(option => {
      const optionCard = document.createElement('div');
      optionCard.className = 'option-card';
      optionCard.dataset.optionId = option.id;
      
      optionCard.innerHTML = `
        <div class="option-title">${option.title}</div>
        <div class="option-description">${option.description}</div>
        ${option.impact ? `<div class="option-impact">Влияние: ${option.impact}</div>` : ''}
      `;
      
      optionCard.addEventListener('click', () => this.selectOption(option.id));
      optionsContainer.appendChild(optionCard);
    });
    
    this.elements.decisionContent.appendChild(optionsContainer);
  }

  // Отрисовка ранжирования трендов
  renderTrendRankingOptions(question) {
    const rankingContainer = document.createElement('div');
    rankingContainer.className = 'ranking-container';
    rankingContainer.innerHTML = `
      <div style="margin: 16px 0; color: var(--text-muted); font-size: 14px;">
        Перетащите тренды в порядке убывания влияния:
      </div>
    `;
    
    const trendsContainer = document.createElement('div');
    trendsContainer.className = 'trends-ranking';
    trendsContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 8px;
      min-height: 200px;
      padding: 16px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: var(--radius-sm);
      border: 2px dashed rgba(255, 255, 255, 0.2);
    `;
    
    question.trends.forEach((trendId, index) => {
      const trend = DataService.getTrendData(trendId);
      if (!trend) return;
      
      const trendCard = document.createElement('div');
      trendCard.className = 'trend-ranking-card';
      trendCard.dataset.trendId = trendId;
      trendCard.draggable = true;
      trendCard.style.cssText = `
        padding: 12px;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: var(--radius-sm);
        cursor: move;
        transition: all 0.3s ease;
      `;
      
      trendCard.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="font-size: 20px;">${index + 1}</div>
          <div>
            <div style="font-weight: 600; color: var(--text);">${trend.name}</div>
            <div style="font-size: 12px; color: var(--text-muted);">${trend.category}</div>
          </div>
        </div>
      `;
      
      // Добавляем обработчики drag & drop
      this.setupDragAndDrop(trendCard, trendsContainer);
      
      trendsContainer.appendChild(trendCard);
    });
    
    rankingContainer.appendChild(trendsContainer);
    this.elements.decisionContent.appendChild(rankingContainer);
  }

  // Отрисовка распределения портфеля
  renderPortfolioAllocationOptions(question) {
    const allocationContainer = document.createElement('div');
    allocationContainer.className = 'allocation-container';
    
    allocationContainer.innerHTML = `
      <div style="margin: 16px 0; color: var(--text-muted); font-size: 14px;">
        Распределите $${question.budget.toLocaleString()} между секторами:
      </div>
    `;
    
    const sectorsContainer = document.createElement('div');
    sectorsContainer.className = 'sectors-allocation';
    sectorsContainer.style.cssText = `
      display: grid;
      gap: 12px;
      padding: 16px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: var(--radius-sm);
    `;
    
    question.sectors.forEach(sector => {
      const sectorDiv = document.createElement('div');
      sectorDiv.style.cssText = `
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: var(--radius-sm);
      `;
      
      sectorDiv.innerHTML = `
        <div style="flex: 1; font-size: 14px; font-weight: 600; color: var(--text);">
          ${sector.name}
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 12px; color: var(--text-muted);">$</span>
          <input type="number" 
                 id="allocation-${sector.id}" 
                 min="0" 
                 max="${question.budget}" 
                 value="0"
                 style="width: 80px; padding: 4px 8px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; color: var(--text); font-size: 12px;">
        </div>
      `;
      
      sectorsContainer.appendChild(sectorDiv);
    });
    
    // Добавляем индикатор оставшихся средств
    const remainingDiv = document.createElement('div');
    remainingDiv.id = 'remaining-budget';
    remainingDiv.style.cssText = `
      padding: 8px;
      text-align: center;
      font-weight: 600;
      color: var(--text);
      background: rgba(255, 255, 255, 0.1);
      border-radius: var(--radius-sm);
      margin-top: 8px;
    `;
    remainingDiv.textContent = `Остается: $${question.budget.toLocaleString()}`;
    
    sectorsContainer.appendChild(remainingDiv);
    
    // Добавляем обработчики изменения значений
    question.sectors.forEach(sector => {
      const input = sectorsContainer.querySelector(`#allocation-${sector.id}`);
      if (input) {
        input.addEventListener('input', () => this.updateRemainingBudget(question.budget, question.sectors));
      }
    });
    
    allocationContainer.appendChild(sectorsContainer);
    this.elements.decisionContent.appendChild(allocationContainer);
  }

  // Настройка drag & drop для ранжирования
  setupDragAndDrop(card, container) {
    card.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', card.dataset.trendId);
      card.style.opacity = '0.5';
    });
    
    card.addEventListener('dragend', () => {
      card.style.opacity = '1';
    });
    
    container.addEventListener('dragover', (e) => {
      e.preventDefault();
    });
    
    container.addEventListener('drop', (e) => {
      e.preventDefault();
      const draggedId = e.dataTransfer.getData('text/plain');
      const draggedCard = container.querySelector(`[data-trend-id="${draggedId}"]`);
      
      if (draggedCard) {
        // Простая реализация перестановки
        const cards = Array.from(container.children);
        const draggedIndex = cards.indexOf(draggedCard);
        const targetIndex = cards.findIndex(card => {
          const rect = card.getBoundingClientRect();
          return e.clientY < rect.top + rect.height / 2;
        });
        
        if (targetIndex !== -1 && targetIndex !== draggedIndex) {
          if (targetIndex < draggedIndex) {
            container.insertBefore(draggedCard, cards[targetIndex]);
          } else {
            container.insertBefore(draggedCard, cards[targetIndex].nextSibling);
          }
        }
      }
    });
  }

  // Обновление оставшегося бюджета
  updateRemainingBudget(totalBudget, sectors) {
    let allocated = 0;
    
    sectors.forEach(sector => {
      const input = document.getElementById(`allocation-${sector.id}`);
      if (input) {
        allocated += parseInt(input.value) || 0;
      }
    });
    
    const remaining = totalBudget - allocated;
    const remainingDiv = document.getElementById('remaining-budget');
    
    if (remainingDiv) {
      remainingDiv.textContent = `Остается: $${remaining.toLocaleString()}`;
      remainingDiv.style.color = remaining < 0 ? '#ff4444' : 
                                 remaining === 0 ? '#00ff88' : 'var(--text)';
    }
  }

  // Выбор опции
  selectOption(optionId) {
    // Убираем выделение с других опций
    document.querySelectorAll('.option-card').forEach(card => {
      card.classList.remove('selected');
    });
    
    // Выделяем выбранную опцию
    const selectedCard = document.querySelector(`[data-option-id="${optionId}"]`);
    if (selectedCard) {
      selectedCard.classList.add('selected');
    }
    
    // Активируем кнопку ответа
    const submitButton = document.getElementById('submitAnswer');
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.dataset.selectedOption = optionId;
    }
  }

  // Отрисовка кнопок действий
  renderActionButtons() {
    if (!this.elements.actionButtons) return;
    
    this.elements.actionButtons.innerHTML = `
      <button id="submitAnswer" class="btn primary" disabled>
        Подтвердить ответ
      </button>
      <button id="skipQuestion" class="btn secondary">
        Пропустить
      </button>
    `;
    
    // Добавляем обработчики
    const submitButton = document.getElementById('submitAnswer');
    const skipButton = document.getElementById('skipQuestion');
    
    submitButton?.addEventListener('click', () => this.submitAnswer());
    skipButton?.addEventListener('click', () => this.skipQuestion());
  }

  // Отправка ответа
  submitAnswer() {
    if (!this.currentQuestion) return;
    
    let answer = null;
    
    switch (this.currentQuestion.type) {
      case 'multiple-choice':
      case 'scenario-analysis':
      case 'pattern-recognition':
        const submitButton = document.getElementById('submitAnswer');
        answer = submitButton?.dataset.selectedOption;
        break;
      
      case 'trend-ranking':
        const rankingCards = document.querySelectorAll('.trend-ranking-card');
        answer = Array.from(rankingCards).map(card => card.dataset.trendId);
        break;
      
      case 'portfolio-allocation':
        answer = {};
        this.currentQuestion.sectors.forEach(sector => {
          const input = document.getElementById(`allocation-${sector.id}`);
          answer[sector.id] = parseInt(input?.value) || 0;
        });
        break;
    }
    
    if (!answer) {
      this.showToast('Пожалуйста, выберите ответ', 'warning');
      return;
    }
    
    // Отправляем ответ в движок
    const result = this.engine.processAnswer(this.currentQuestion.id, answer);
    
    // Показываем результат
    this.showAnswerResult(result);
    
    // Обновляем статистику
    this.updateStatusPanel();
    
    // Переходим к следующему вопросу через 2 секунды
    setTimeout(() => {
      this.nextQuestion();
    }, 2000);
  }

  // Пропуск вопроса
  skipQuestion() {
    this.showToast('Вопрос пропущен', 'info');
    this.nextQuestion();
  }

  // Переход к следующему вопросу
  nextQuestion() {
    const gameState = this.engine.getGameState();
    this.engine.gameState.currentQuestion++;
    this.loadCurrentQuestion();
  }

  // Показать результат ответа
  showAnswerResult(result) {
    // Подсвечиваем правильные и неправильные ответы
    if (this.currentQuestion.type === 'multiple-choice' || 
        this.currentQuestion.type === 'scenario-analysis' ||
        this.currentQuestion.type === 'pattern-recognition') {
      
      const options = this.currentQuestion.options || this.currentQuestion.patterns || this.currentQuestion.strategies;
      
      options.forEach(option => {
        const card = document.querySelector(`[data-option-id="${option.id}"]`);
        if (card) {
          if (option.correct) {
            card.classList.add('correct');
          } else if (card.classList.contains('selected')) {
            card.classList.add('incorrect');
          }
        }
      });
    }
    
    // Показываем объяснение
    if (result.explanation) {
      this.showToast(result.explanation, result.correct ? 'success' : 'warning');
    }
  }

  // Завершение квеста
  completeQuest() {
    const results = this.engine.completeQuest();
    this.showResultsModal(results);
  }

  // Показать модальное окно результатов
  showResultsModal(results) {
    if (!this.elements.resultsModal) return;
    
    // Устанавливаем иконку и заголовок
    if (this.elements.resultsIcon) {
      this.elements.resultsIcon.textContent = results.accuracy >= 75 ? '🏆' : 
                                             results.accuracy >= 50 ? '🥈' : '📊';
    }
    
    if (this.elements.resultsTitle) {
      this.elements.resultsTitle.textContent = results.accuracy >= 75 ? 'Превосходный анализ!' :
                                               results.accuracy >= 50 ? 'Хорошая работа!' : 'Анализ завершен';
    }
    
    // Заполняем содержимое результатов
    if (this.elements.resultsContent) {
      const completionTimeMinutes = Math.round(results.completionTime / 60000);
      
      this.elements.resultsContent.innerHTML = `
        <div class="result-stat">
          <span class="result-stat-label">Финальный счет</span>
          <span class="result-stat-value">${results.finalScore}</span>
        </div>
        <div class="result-stat">
          <span class="result-stat-label">Точность</span>
          <span class="result-stat-value">${Math.round(results.accuracy)}%</span>
        </div>
        <div class="result-stat">
          <span class="result-stat-label">Репутация</span>
          <span class="result-stat-value">${'★'.repeat(results.reputation)}${'☆'.repeat(5 - results.reputation)}</span>
        </div>
        <div class="result-stat">
          <span class="result-stat-label">Портфель</span>
          <span class="result-stat-value">$${Math.round(results.portfolio / 1000)}K</span>
        </div>
        <div class="result-stat">
          <span class="result-stat-label">Время прохождения</span>
          <span class="result-stat-value">${completionTimeMinutes} мин</span>
        </div>
        <div class="result-stat" style="border-top: 1px solid rgba(255,255,255,0.2); margin-top: 16px; padding-top: 16px;">
          <span class="result-stat-label">MULACOIN</span>
          <span class="result-stat-value" style="color: #ffd700;">+${results.rewards.mulacoin}</span>
        </div>
        <div class="result-stat">
          <span class="result-stat-label">Опыт</span>
          <span class="result-stat-value" style="color: #00ff88;">+${results.rewards.experience}</span>
        </div>
      `;
    }
    
    this.elements.resultsModal.classList.add('show');
  }

  // Скрыть модальное окно результатов
  hideResultsModal() {
    this.elements.resultsModal?.classList.remove('show');
  }

  // Обновление лога событий
  updateEventLog() {
    if (!this.elements.logContent) return;
    
    const events = this.engine.getEventLog();
    
    this.elements.logContent.innerHTML = '';
    
    events.slice(-10).forEach(event => {
      const entry = document.createElement('div');
      entry.className = `log-entry ${event.type}`;
      
      entry.innerHTML = `
        <span class="log-time">${event.timestamp}</span>
        <span class="log-message">${event.message}</span>
      `;
      
      this.elements.logContent.appendChild(entry);
    });
    
    // Автоскролл вниз
    this.elements.logContent.scrollTop = this.elements.logContent.scrollHeight;
  }

  // Очистка лога событий
  clearEventLog() {
    if (this.elements.logContent) {
      this.elements.logContent.innerHTML = '';
    }
  }

  // Показать toast уведомление
  showToast(message, type = 'info') {
    if (!this.elements.toast) return;
    
    this.elements.toast.textContent = message;
    this.elements.toast.className = `toast ${type} show`;
    
    setTimeout(() => {
      this.elements.toast.classList.remove('show');
    }, 3000);
  }

  // Запуск периодических обновлений
  startPeriodicUpdates() {
    // Обновляем лог каждые 2 секунды
    setInterval(() => {
      if (this.engine.getGameState().isRunning) {
        this.updateEventLog();
      }
    }, 2000);
    
    // Обновляем рыночные данные каждые 10 секунд
    setInterval(() => {
      if (this.engine.getGameState().isRunning) {
        this.updateMarketData();
      }
    }, 10000);
  }
}
