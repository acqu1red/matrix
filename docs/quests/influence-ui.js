/* ===== INFLUENCE EMPIRE UI MANAGER ===== */

class InfluenceEmpireUI {
  constructor(engine) {
    this.engine = engine;
    this.elements = {};
    this.draggedElement = null;
    this.touchStartPos = { x: 0, y: 0 };
    this.isDragging = false;
    this.animationQueue = [];
  }

  // Инициализация UI
  initialize() {
    this.cacheElements();
    this.setupEventListeners();
    this.setupDragAndDrop();
    this.showIntroModal();
    this.startAnimationLoop();
  }

  // Кэширование элементов DOM
  cacheElements() {
    this.elements = {
      // Модальные окна
      introModal: document.getElementById('introModal'),
      resultsModal: document.getElementById('resultsModal'),
      
      // Основной интерфейс
      empireInterface: document.getElementById('empireInterface'),
      
      // Панель статуса
      currentStage: document.getElementById('currentStage'),
      followers: document.getElementById('followers'),
      monthlyRevenue: document.getElementById('monthlyRevenue'),
      influenceScore: document.getElementById('influenceScore'),
      
      // Рабочие области
      strategyTitle: document.getElementById('strategyTitle'),
      stageProgress: document.getElementById('stageProgress'),
      strategyContent: document.getElementById('strategyContent'),
      empireName: document.getElementById('empireName'),
      gameField: document.getElementById('gameField'),
      analyticsPanel: document.getElementById('analyticsPanel'),
      
      // Психологические подсказки
      psychologyHints: document.getElementById('psychologyHints'),
      hintContent: document.getElementById('hintContent'),
      
      // Аналитические метрики
      totalReach: document.getElementById('totalReach'),
      engagement: document.getElementById('engagement'),
      conversion: document.getElementById('conversion'),
      reputation: document.getElementById('reputation'),
      
      // Статистика платформ
      youtubeSubs: document.getElementById('youtube-subs'),
      youtubeRevenue: document.getElementById('youtube-revenue'),
      instagramSubs: document.getElementById('instagram-subs'),
      instagramRevenue: document.getElementById('instagram-revenue'),
      tiktokSubs: document.getElementById('tiktok-subs'),
      tiktokRevenue: document.getElementById('tiktok-revenue'),
      telegramSubs: document.getElementById('telegram-subs'),
      telegramRevenue: document.getElementById('telegram-revenue'),
      
      // События и действия
      currentEvent: document.getElementById('currentEvent'),
      actionButtons: document.getElementById('actionButtons'),
      nextStage: document.getElementById('nextStage'),
      generateEvent: document.getElementById('generateEvent'),
      resetEmpire: document.getElementById('resetEmpire'),
      
      // Кнопки
      startEmpire: document.getElementById('startEmpire'),
      btnBack: document.getElementById('btnBack'),
      restartEmpire: document.getElementById('restartEmpire'),
      exitEmpire: document.getElementById('exitEmpire'),
      
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
    // Кнопки модальных окон
    this.elements.startEmpire?.addEventListener('click', () => this.startEmpire());
    this.elements.restartEmpire?.addEventListener('click', () => this.restartEmpire());
    this.elements.exitEmpire?.addEventListener('click', () => this.exitEmpire());
    this.elements.btnBack?.addEventListener('click', () => this.goBack());
    
    // Кнопки действий
    this.elements.nextStage?.addEventListener('click', () => this.nextStage());
    this.elements.generateEvent?.addEventListener('click', () => this.generateRandomEvent());
    this.elements.resetEmpire?.addEventListener('click', () => this.resetEmpire());
    
    // Закрытие модальных окон
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
  }

  // Настройка drag & drop
  setupDragAndDrop() {
    // Поддержка мыши
    document.addEventListener('mousedown', (e) => this.handleDragStart(e));
    document.addEventListener('mousemove', (e) => this.handleDragMove(e));
    document.addEventListener('mouseup', (e) => this.handleDragEnd(e));
    
    // Touch события для мобильных устройств
    document.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
    document.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
    document.addEventListener('touchend', (e) => this.handleTouchEnd(e));
  }

  // Начало перетаскивания (мышь)
  handleDragStart(e) {
    const strategyCard = e.target.closest('.strategy-card');
    if (strategyCard && !this.isDragging) {
      this.startDrag(strategyCard, e.clientX, e.clientY);
      e.preventDefault();
    }
  }

  // Движение перетаскивания (мышь)
  handleDragMove(e) {
    if (this.isDragging && this.draggedElement) {
      this.updateDragPosition(e.clientX, e.clientY);
      this.updateDropZones(e.clientX, e.clientY);
      e.preventDefault();
    }
  }

  // Окончание перетаскивания (мышь)
  handleDragEnd(e) {
    if (this.isDragging) {
      this.endDrag(e.clientX, e.clientY);
    }
  }

  // Touch события
  handleTouchStart(e) {
    const strategyCard = e.target.closest('.strategy-card');
    if (strategyCard && e.touches.length === 1) {
      const touch = e.touches[0];
      this.touchStartPos = { x: touch.clientX, y: touch.clientY };
      
      this.touchTimeout = setTimeout(() => {
        this.startDrag(strategyCard, touch.clientX, touch.clientY);
        e.preventDefault();
      }, 300);
    }
  }

  handleTouchMove(e) {
    if (this.touchTimeout) {
      clearTimeout(this.touchTimeout);
      this.touchTimeout = null;
    }
    
    if (this.isDragging && e.touches.length === 1) {
      const touch = e.touches[0];
      this.updateDragPosition(touch.clientX, touch.clientY);
      this.updateDropZones(touch.clientX, touch.clientY);
      e.preventDefault();
    }
  }

  handleTouchEnd(e) {
    if (this.touchTimeout) {
      clearTimeout(this.touchTimeout);
      this.touchTimeout = null;
    }
    
    if (this.isDragging) {
      const touch = e.changedTouches[0];
      this.endDrag(touch.clientX, touch.clientY);
    }
  }

  // Начало перетаскивания
  startDrag(element, x, y) {
    this.isDragging = true;
    this.draggedElement = element.cloneNode(true);
    
    // Стилизуем перетаскиваемый элемент
    this.draggedElement.classList.add('dragging');
    this.draggedElement.style.position = 'fixed';
    this.draggedElement.style.zIndex = '1000';
    this.draggedElement.style.pointerEvents = 'none';
    this.draggedElement.style.width = element.offsetWidth + 'px';
    this.draggedElement.style.left = (x - element.offsetWidth / 2) + 'px';
    this.draggedElement.style.top = (y - element.offsetHeight / 2) + 'px';
    
    document.body.appendChild(this.draggedElement);
    
    // Добавляем визуальную обратную связь
    element.style.opacity = '0.5';
    
    // Показываем drop zones
    this.showDropZones();
    
    // Автоматически скроллим к полям "Ваша медиа-империя"
    this.scrollToEmpireFields();
  }

  // Обновление позиции
  updateDragPosition(x, y) {
    if (this.draggedElement) {
      this.draggedElement.style.left = (x - this.draggedElement.offsetWidth / 2) + 'px';
      this.draggedElement.style.top = (y - this.draggedElement.offsetHeight / 2) + 'px';
    }
  }

  // Обновление drop zones
  updateDropZones(x, y) {
    const dropZones = document.querySelectorAll('.platform-slot:not(.has-strategy)');
    
    dropZones.forEach(zone => {
      const rect = zone.getBoundingClientRect();
      const isOver = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
      
      zone.classList.toggle('drag-over', isOver);
      
      // Если курсор над зоной, добавляем дополнительную подсветку
      if (isOver) {
        zone.classList.add('drag-over-highlight');
      } else {
        zone.classList.remove('drag-over-highlight');
      }
    });
  }

  // Показать drop zones
  showDropZones() {
    const dropZones = document.querySelectorAll('.platform-slot:not(.has-strategy)');
    dropZones.forEach(zone => {
      zone.classList.add('available');
    });
  }

  // Скрыть drop zones
  hideDropZones() {
    const dropZones = document.querySelectorAll('.platform-slot');
    dropZones.forEach(zone => {
      zone.classList.remove('drag-over', 'drag-over-highlight', 'available');
    });
  }

  // Автоматический скролл к полям "Ваша медиа-империя"
  scrollToEmpireFields() {
    const empireFields = document.querySelectorAll('.platform-slot:not(.has-strategy)');
    if (empireFields.length === 0) return;
    
    // Находим первую доступную позицию
    const firstAvailableField = empireFields[0];
    if (firstAvailableField) {
      // Добавляем класс для плавного скролла
      document.body.classList.add('scroll-to-empire-fields');
      
      // Плавно скроллим к позиции
      firstAvailableField.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center'
      });
      
      // Добавляем подсветку для привлечения внимания
      firstAvailableField.classList.add('highlighted');
      
      // Убираем подсветку через 2 секунды
      setTimeout(() => {
        if (firstAvailableField) {
          firstAvailableField.classList.remove('highlighted');
        }
        document.body.classList.remove('scroll-to-empire-fields');
      }, 2000);
      
      // Показываем toast уведомление
      this.showToast('📱 Камера автоматически перемещена к полям медиа-империи!', 'info');
    }
  }

  // Окончание перетаскивания
  endDrag(x, y) {
    if (!this.isDragging) return;
    
    this.isDragging = false;
    
    // Находим drop zone
    const dropZone = this.getDropZoneAt(x, y);
    
    if (dropZone && !dropZone.classList.contains('has-strategy')) {
      const platform = dropZone.dataset.platform;
      const strategyId = this.draggedElement.dataset.strategyId;
      
      if (strategyId && this.engine.placeStrategy(strategyId, platform)) {
        this.addPlacementAnimation(dropZone);
        this.updateEmpireInterface();
        this.showToast(`Стратегия размещена на ${platform}!`, 'success');
      } else {
        this.showToast('Не удалось разместить стратегию', 'error');
      }
    }
    
    this.cleanupDrag();
  }

  // Получение drop zone в точке
  getDropZoneAt(x, y) {
    const dropZones = document.querySelectorAll('.platform-slot:not(.has-strategy)');
    
    for (let zone of dropZones) {
      const rect = zone.getBoundingClientRect();
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        return zone;
      }
    }
    
    return null;
  }

  // Очистка после drag
  cleanupDrag() {
    if (this.draggedElement) {
      document.body.removeChild(this.draggedElement);
      this.draggedElement = null;
    }
    
    // Восстанавливаем прозрачность
    const strategyCards = document.querySelectorAll('.strategy-card');
    strategyCards.forEach(card => {
      card.style.opacity = '';
    });
    
    this.hideDropZones();
  }

  // Показать модальное окно введения
  showIntroModal() {
    this.elements.introModal?.classList.add('show');
  }

  // Скрыть модальное окно введения
  hideIntroModal() {
    this.elements.introModal?.classList.remove('show');
  }

  // Запуск империи
  startEmpire() {
    this.hideIntroModal();
    this.elements.empireInterface.style.display = 'flex';
    
    // Запускаем движок
    this.engine.startEmpire();
    
    // Инициализируем UI
    this.updateEmpireInterface();
    this.loadStrategiesForStage(1);
    this.updatePsychologyHints();
    
    this.showToast('Создание империи влияния началось!', 'success');
  }

  // Загрузка стратегий для этапа
  loadStrategiesForStage(stage) {
    if (!this.elements.strategyContent) return;
    
    const strategies = InfluenceDataService.getStrategiesByStage(stage);
    const stageDescription = InfluenceDataService.getStageDescription(stage);
    
    // Обновляем заголовки
    this.elements.strategyTitle.textContent = this.getStageTitle(stage);
    this.elements.stageProgress.textContent = `Этап ${stage}: ${stageDescription}`;
    
    // Генерируем карточки стратегий
    this.elements.strategyContent.innerHTML = `
      <div class="strategies-grid">
        ${strategies.map(strategy => this.createStrategyCard(strategy)).join('')}
      </div>
    `;
    
    // Добавляем анимацию появления
    this.animateStrategiesIn();
  }

  // Получение заголовка этапа
  getStageTitle(stage) {
    const titles = {
      1: '🎯 Контент-стратегии',
      2: '🧠 Психологические триггеры',
      3: '💰 Монетизация',
      4: '🚀 Масштабирование',
      5: '🔥 Кризис-менеджмент'
    };
    
    return titles[stage] || '📊 Стратегии';
  }

  // Создание карточки стратегии
  createStrategyCard(strategy) {
    const difficultyColor = InfluenceDataService.getDifficultyColor(strategy.difficulty);
    
    return `
      <div class="strategy-card fade-in-up" data-strategy-id="${strategy.id}" style="border-left-color: ${difficultyColor};">
        <div class="strategy-header">
          <div class="strategy-icon">${strategy.icon}</div>
          <div class="strategy-info">
            <h5>${strategy.name}</h5>
            <div class="strategy-type">${strategy.type}</div>
          </div>
        </div>
        <div class="strategy-description">${strategy.description}</div>
        <div class="strategy-effects">
          ${Object.entries(strategy.effects).map(([key, range]) => {
            const isPositive = range.max > 0;
            const isNegative = range.min < 0;
            const effectClass = isNegative ? 'effect-negative' : isPositive ? 'effect-positive' : 'effect-neutral';
            const sign = range.max > 0 ? '+' : '';
            return `<div class="effect-item ${effectClass}">${key} ${sign}${range.min}-${range.max}</div>`;
          }).join('')}
        </div>
        <div style="margin-top: 8px; font-size: 10px; color: var(--text-muted); text-align: center;">
          ${strategy.psychologyTrigger}
        </div>
      </div>
    `;
  }

  // Анимация появления стратегий
  animateStrategiesIn() {
    const cards = document.querySelectorAll('.strategy-card');
    cards.forEach((card, index) => {
      setTimeout(() => {
        card.classList.add('slide-in-left');
      }, index * 100);
    });
  }

  // Обновление психологических подсказок
  updatePsychologyHints() {
    if (!this.elements.hintContent) return;
    
    const gameState = this.engine.getGameState();
    const hints = InfluenceDataService.getPsychologyHints(gameState.currentStage);
    
    this.elements.hintContent.innerHTML = hints.map(hint => 
      `<div class="hint-item">${hint}</div>`
    ).join('');
  }

  // Обновление интерфейса империи
  updateEmpireInterface() {
    const gameState = this.engine.getGameState();
    
    // Обновляем статус
    if (this.elements.currentStage) {
      this.elements.currentStage.textContent = `${gameState.currentStage}/${EMPIRE_CONFIG.stages}`;
    }
    
    if (this.elements.followers) {
      this.elements.followers.textContent = InfluenceDataService.formatNumber(gameState.metrics.followers);
    }
    
    if (this.elements.monthlyRevenue) {
      this.elements.monthlyRevenue.textContent = `$${InfluenceDataService.formatNumber(gameState.metrics.revenue)}`;
    }
    
    if (this.elements.influenceScore) {
      this.elements.influenceScore.textContent = gameState.metrics.influence;
    }
    
    // Обновляем аналитику
    this.updateAnalytics();
    
    // Обновляем платформы
    this.updatePlatforms();
    
    // Обновляем кнопки
    this.updateActionButtons();
  }

  // Обновление аналитики
  updateAnalytics() {
    const gameState = this.engine.getGameState();
    
    if (this.elements.totalReach) {
      this.elements.totalReach.textContent = InfluenceDataService.formatNumber(gameState.metrics.reach);
    }
    
    if (this.elements.engagement) {
      this.elements.engagement.textContent = `${Math.round(gameState.metrics.engagement)}%`;
    }
    
    if (this.elements.conversion) {
      this.elements.conversion.textContent = `${Math.round(gameState.metrics.conversion)}%`;
    }
    
    if (this.elements.reputation) {
      this.elements.reputation.textContent = `${Math.round(gameState.metrics.reputation)}%`;
      
      // Меняем цвет в зависимости от репутации
      const reputationColor = gameState.metrics.reputation >= 80 ? '#00ff88' :
                             gameState.metrics.reputation >= 60 ? '#ffaa00' : '#ff4444';
      this.elements.reputation.style.color = reputationColor;
    }
  }

  // Обновление платформ
  updatePlatforms() {
    const gameState = this.engine.getGameState();
    
    for (let [platform, data] of Object.entries(gameState.platforms)) {
      // Обновляем статистику
      const subsElement = this.elements[`${platform}Subs`];
      const revenueElement = this.elements[`${platform}Revenue`];
      
      if (subsElement) {
        subsElement.textContent = InfluenceDataService.formatNumber(data.followers);
      }
      
      if (revenueElement) {
        revenueElement.textContent = `$${InfluenceDataService.formatNumber(data.revenue)}`;
      }
      
      // Обновляем визуальное состояние платформы
      const platformSlot = document.querySelector(`[data-platform="${platform}"]`);
      if (platformSlot) {
        if (data.strategy) {
          platformSlot.classList.add('has-strategy');
          
          // Показываем размещенную стратегию
          const strategySlot = platformSlot.querySelector('.strategy-slot');
          if (strategySlot) {
            strategySlot.classList.add('active');
            strategySlot.innerHTML = `
              <div class="placed-strategy">
                <div class="placed-strategy-icon">${data.strategy.icon}</div>
                <div class="placed-strategy-name">${data.strategy.name}</div>
                <div class="placed-strategy-effect">${data.strategy.psychologyTrigger}</div>
              </div>
            `;
          }
          
          // Скрываем drop zone
          const dropZone = platformSlot.querySelector('.drop-zone');
          if (dropZone) {
            dropZone.style.display = 'none';
          }
        } else {
          platformSlot.classList.remove('has-strategy');
          
          const strategySlot = platformSlot.querySelector('.strategy-slot');
          if (strategySlot) {
            strategySlot.classList.remove('active');
            strategySlot.innerHTML = '';
          }
          
          const dropZone = platformSlot.querySelector('.drop-zone');
          if (dropZone) {
            dropZone.style.display = 'flex';
          }
        }
      }
    }
  }

  // Обновление кнопок действий
  updateActionButtons() {
    const canProceed = this.engine.canProceedToNextStage();
    const gameState = this.engine.getGameState();
    
    if (this.elements.nextStage) {
      this.elements.nextStage.disabled = !canProceed;
      
      if (gameState.currentStage === EMPIRE_CONFIG.stages) {
        this.elements.nextStage.textContent = 'Завершить империю';
      } else {
        this.elements.nextStage.textContent = canProceed ? 'Следующий этап' : 'Разместите стратегии';
      }
    }
  }

  // Переход к следующему этапу
  nextStage() {
    const gameState = this.engine.getGameState();
    
    if (gameState.currentStage === EMPIRE_CONFIG.stages) {
      // Завершаем империю
      this.completeEmpire();
    } else {
      // Переходим к следующему этапу
      this.engine.nextStage();
      const newGameState = this.engine.getGameState();
      
      this.loadStrategiesForStage(newGameState.currentStage);
      this.updatePsychologyHints();
      this.updateEmpireInterface();
      
      this.showToast(`Переход на этап ${newGameState.currentStage}!`, 'success');
      
      // Добавляем анимацию перехода
      this.addStageTransitionAnimation();
    }
  }

  // Генерация случайного события
  generateRandomEvent() {
    const event = this.engine.generateRandomEvent();
    
    if (event) {
      this.showEvent(event);
      this.updateEmpireInterface();
    } else {
      this.showToast('Никаких событий не произошло', 'info');
    }
  }

  // Показать событие
  showEvent(event) {
    if (!this.elements.currentEvent) return;
    
    this.elements.currentEvent.style.display = 'block';
    this.elements.currentEvent.innerHTML = `
      <div class="event-header">
        <div class="event-icon">${event.icon}</div>
        <div class="event-title">${event.name}</div>
      </div>
      <div class="event-description">${event.description}</div>
      <div class="event-effects">
        Влияние на метрики: ${Object.keys(event.effects).join(', ')}
      </div>
    `;
    
    // Добавляем эффект в зависимости от типа события
    if (event.name.includes('Вирусный')) {
      this.elements.currentEvent.classList.add('viral-effect');
    } else if (event.name.includes('Скандал')) {
      this.elements.currentEvent.classList.add('controversy-effect');
    }
    
    // Автоматически скрываем через 5 секунд
    setTimeout(() => {
      this.elements.currentEvent.style.display = 'none';
      this.elements.currentEvent.className = 'current-event';
    }, 5000);
  }

  // Завершение империи
  completeEmpire() {
    const results = this.engine.completeEmpire();
    this.showResultsModal(results);
  }

  // Показать модальное окно результатов
  showResultsModal(results) {
    if (!this.elements.resultsModal) return;
    
    // Устанавливаем иконку и заголовок
    if (this.elements.resultsIcon) {
      const score = results.finalMetrics.totalScore;
      this.elements.resultsIcon.textContent = score >= 5000 ? '👑' : 
                                             score >= 3000 ? '🏆' : 
                                             score >= 1500 ? '🥇' : 
                                             score >= 800 ? '🥈' : '📊';
    }
    
    if (this.elements.resultsTitle) {
      const score = results.finalMetrics.totalScore;
      this.elements.resultsTitle.textContent = score >= 5000 ? 'Легендарная империя!' :
                                               score >= 3000 ? 'Влиятельная империя!' :
                                               score >= 1500 ? 'Успешная империя!' :
                                               score >= 800 ? 'Растущая империя!' : 'Империя создана!';
    }
    
    // Заполняем содержимое результатов
    if (this.elements.resultsContent) {
      const completionTimeMinutes = Math.round(results.completionTime / 60000);
      
      this.elements.resultsContent.innerHTML = `
        <div class="result-stat">
          <span class="result-stat-label">Общий счет</span>
          <span class="result-stat-value">${results.finalMetrics.totalScore}</span>
        </div>
        <div class="result-stat">
          <span class="result-stat-label">Подписчики</span>
          <span class="result-stat-value">${InfluenceDataService.formatNumber(results.finalMetrics.followers)}</span>
        </div>
        <div class="result-stat">
          <span class="result-stat-label">Месячный доход</span>
          <span class="result-stat-value">$${InfluenceDataService.formatNumber(results.finalMetrics.revenue)}</span>
        </div>
        <div class="result-stat">
          <span class="result-stat-label">Влияние</span>
          <span class="result-stat-value">${results.finalMetrics.influence}</span>
        </div>
        <div class="result-stat">
          <span class="result-stat-label">Репутация</span>
          <span class="result-stat-value">${Math.round(results.finalMetrics.reputation)}%</span>
        </div>
        <div class="result-stat">
          <span class="result-stat-label">Время создания</span>
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

  // Перезапуск империи
  restartEmpire() {
    this.hideResultsModal();
    this.engine.resetGameState();
    this.engine.initialize();
    this.startEmpire();
  }

  // Сброс империи
  resetEmpire() {
    this.engine.resetGameState();
    this.engine.initialize();
    this.updateEmpireInterface();
    this.loadStrategiesForStage(1);
    this.updatePsychologyHints();
    this.showToast('Империя сброшена', 'info');
  }

  // Выход из квеста
  exitEmpire() {
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

  // Анимации
  addPlacementAnimation(element) {
    element.classList.add('growth-effect');
    setTimeout(() => {
      element.classList.remove('growth-effect');
    }, 800);
  }

  addStageTransitionAnimation() {
    this.elements.strategyContent?.classList.add('slide-in-right');
    setTimeout(() => {
      this.elements.strategyContent?.classList.remove('slide-in-right');
    }, 600);
  }

  // Цикл анимации
  startAnimationLoop() {
    const animate = () => {
      this.processAnimationQueue();
      requestAnimationFrame(animate);
    };
    animate();
  }

  processAnimationQueue() {
    // Обработка очереди анимаций
    if (this.animationQueue.length > 0) {
      const animation = this.animationQueue.shift();
      animation();
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

  // Добавление эффектов для метрик
  addMetricChangeEffect(metric, change) {
    const element = this.elements[metric];
    if (!element) return;
    
    if (change > 0) {
      element.classList.add('pulse-glow');
      setTimeout(() => element.classList.remove('pulse-glow'), 2000);
    }
  }

  // Получение рекомендаций
  showRecommendations() {
    const recommendations = this.engine.getRecommendations();
    if (recommendations.length > 0) {
      const message = recommendations[0]; // Показываем первую рекомендацию
      this.showToast(message, 'info');
    }
  }

  // Периодическое обновление подсказок
  startHintRotation() {
    setInterval(() => {
      const hint = this.engine.getStageHint();
      if (hint) {
        this.showToast(`💡 ${hint}`, 'info');
      }
    }, 30000); // Каждые 30 секунд
  }
}
