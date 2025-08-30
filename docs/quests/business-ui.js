/* ===== BUSINESS QUEST UI ===== */

class BusinessQuestUI {
  constructor(engine) {
    this.engine = engine;
    this.currentStage = 1;
    this.draggedCandidate = null;
    this.dragOverPosition = null;
    
    // Элементы UI
    this.elements = {
      introModal: null,
      questContent: null,
      progressBar: null,
      progressFill: null,
      progressSteps: null,
      toast: null
    };
    
    // Состояние UI
    this.uiState = {
      isInitialized: false,
      isDragging: false,
      showHints: true
    };
  }
  
  // Инициализация UI
  initialize() {
    console.log('🎨 Инициализация BusinessQuestUI...');
    
    this.cacheElements();
    this.bindEvents();
    this.initializeDragAndDrop();
    this.updateProgress();
    this.showStage(this.currentStage);
    
    this.uiState.isInitialized = true;
    console.log('✅ BusinessQuestUI инициализирован');
  }
  
  // Кэширование элементов
  cacheElements() {
    this.elements.introModal = document.getElementById('introModal');
    this.elements.questContent = document.querySelector('.quest-content');
    this.elements.progressBar = document.querySelector('.quest-progress');
    this.elements.progressFill = document.getElementById('progressFill');
    this.elements.progressSteps = document.querySelectorAll('.progress-steps .step');
    this.elements.toast = document.getElementById('toast');
  }
  
  // Привязка событий
  bindEvents() {
    // Обработчик кнопки "Начать квест"
    const startQuestBtn = document.getElementById('startQuest');
    if (startQuestBtn) {
      startQuestBtn.addEventListener('click', () => this.startQuest());
    }
    
    // Обработчик кнопки "Назад"
    const btnBack = document.getElementById('btnBack');
    if (btnBack) {
      btnBack.addEventListener('click', () => this.goBack());
    }
    
    // Обработчики выбора ниши
    document.querySelectorAll('.niche-card').forEach(card => {
      card.addEventListener('click', (e) => this.handleNicheSelection(e));
    });
    
    // Обработчик кнопки выбора ниши
    const selectNicheBtn = document.getElementById('selectNiche');
    if (selectNicheBtn) {
      selectNicheBtn.addEventListener('click', () => this.handleSelectNiche());
    }
    
    // Обработчик завершения подбора команды
    const completeTeamBtn = document.getElementById('completeTeam');
    if (completeTeamBtn) {
      completeTeamBtn.addEventListener('click', () => this.handleTeamCompletion());
    }
    
    // Обработчик следующего квартала
    const nextQuarterBtn = document.getElementById('nextQuarter');
    if (nextQuarterBtn) {
      nextQuarterBtn.addEventListener('click', () => this.handleNextQuarter());
    }
    
    // Обработчик завершения квеста
    const finishQuestBtn = document.getElementById('finishQuest');
    if (finishQuestBtn) {
      finishQuestBtn.addEventListener('click', () => this.handleQuestCompletion());
    }
    
    // Обработчик кнопки пропуска команды
    const skipTeamBtn = document.getElementById('skipTeam');
    if (skipTeamBtn) {
      skipTeamBtn.addEventListener('click', () => this.handleSkipTeam());
    }
  }
  
  // Инициализация drag & drop
  initializeDragAndDrop() {
    this.setupCandidateCards();
    this.setupDropZones();
    this.setupTouchEvents();
  }
  
  // Настройка карточек кандидатов
  setupCandidateCards() {
    const candidatesGrid = document.querySelector('.candidates-grid');
    if (!candidatesGrid) return;
    
    // Очищаем существующие карточки
    candidatesGrid.innerHTML = '';
    
    // Получаем доступных кандидатов
    const availableCandidates = this.engine.getAvailableCandidates();
    
    // Создаем карточки кандидатов
    availableCandidates.forEach(candidate => {
      const candidateCard = this.createCandidateCard(candidate);
      candidatesGrid.appendChild(candidateCard);
    });
  }
  
  // Создание карточки кандидата
  createCandidateCard(candidate) {
    const card = document.createElement('div');
    card.className = 'candidate-card';
    card.draggable = true;
    card.dataset.candidateId = candidate.id;
    
    card.innerHTML = `
      <div class="candidate-avatar">${candidate.avatar}</div>
      <div class="candidate-name">${candidate.name}</div>
      <div class="candidate-skills">
        ${candidate.skills.map(skill => `<span class="candidate-skill">${skill}</span>`).join('')}
      </div>
    `;
    
    // Добавляем обработчики drag & drop
    card.addEventListener('dragstart', (e) => this.handleDragStart(e, candidate));
    card.addEventListener('dragend', (e) => this.handleDragEnd(e));
    
    return card;
  }
  
  // Настройка зон сброса
  setupDropZones() {
    const dropZones = document.querySelectorAll('.candidate-drop-zone');
    
    dropZones.forEach(zone => {
      zone.addEventListener('dragover', (e) => this.handleDragOver(e, zone));
      zone.addEventListener('dragleave', (e) => this.handleDragLeave(e, zone));
      zone.addEventListener('drop', (e) => this.handleDrop(e, zone));
      
      // Touch события для мобильных устройств
      zone.addEventListener('touchstart', (e) => this.handleTouchStart(e, zone));
      zone.addEventListener('touchend', (e) => this.handleTouchEnd(e, zone));
    });
  }
  
  // Настройка touch событий
  setupTouchEvents() {
    // Добавляем поддержку touch для drag & drop на мобильных
    if ('ontouchstart' in window) {
      document.addEventListener('touchmove', (e) => {
        if (this.uiState.isDragging) {
          e.preventDefault();
        }
      }, { passive: false });
    }
  }
  
  // Обработчик начала перетаскивания
  handleDragStart(e, candidate) {
    this.draggedCandidate = candidate;
    this.uiState.isDragging = true;
    
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', candidate.id);
    
    // Добавляем визуальные эффекты
    e.target.classList.add('dragging');
    
    console.log('🎯 Начато перетаскивание кандидата:', candidate.name);
  }
  
  // Обработчик окончания перетаскивания
  handleDragEnd(e) {
    this.uiState.isDragging = false;
    this.draggedCandidate = null;
    
    // Убираем визуальные эффекты
    e.target.classList.remove('dragging');
    
    console.log('✅ Перетаскивание завершено');
  }
  
  // Обработчик перетаскивания над зоной
  handleDragOver(e, zone) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (this.draggedCandidate) {
      zone.classList.add('drag-over');
      this.dragOverPosition = zone;
    }
  }
  
  // Обработчик выхода из зоны
  handleDragLeave(e, zone) {
    zone.classList.remove('drag-over');
    this.dragOverPosition = null;
  }
  
  // Обработчик сброса
  handleDrop(e, zone) {
    e.preventDefault();
    
    if (this.draggedCandidate) {
      const positionId = zone.dataset.position;
      
      // Проверяем совместимость кандидата и должности
      if (this.draggedCandidate.role === positionId) {
        // Назначаем кандидата на должность
        const success = this.engine.assignCandidate(this.draggedCandidate.id, positionId);
        
        if (success) {
          this.showToast(`Кандидат ${this.draggedCandidate.name} назначен на должность!`, 'success');
          this.updateTeamDisplay();
          this.checkTeamCompletion();
        } else {
          this.showToast('Ошибка назначения кандидата!', 'error');
        }
      } else {
        this.showToast('Кандидат не подходит для этой должности!', 'error');
      }
      
      zone.classList.remove('drag-over');
      this.dragOverPosition = null;
    }
  }
  
  // Touch события для мобильных устройств
  handleTouchStart(e, zone) {
    if (this.uiState.isDragging) {
      zone.classList.add('drag-over');
    }
  }
  
  handleTouchEnd(e, zone) {
    zone.classList.remove('drag-over');
  }
  
  // Обновление отображения команды
  updateTeamDisplay() {
    const team = this.engine.getGameState().team;
    
    // Обновляем все зоны сброса
    document.querySelectorAll('.candidate-drop-zone').forEach(zone => {
      const positionId = zone.dataset.position;
      const assignment = team[positionId];
      
      if (assignment) {
        // Показываем назначенного кандидата
        zone.classList.add('filled');
        zone.innerHTML = `
          <div class="assigned-candidate">
            <div class="candidate-avatar">${assignment.candidate.avatar}</div>
            <div class="candidate-name">${assignment.candidate.name}</div>
            <button class="remove-candidate" onclick="businessUI.removeCandidate('${positionId}')">❌</button>
          </div>
        `;
      } else {
        // Показываем пустую зону
        zone.classList.remove('filled');
        zone.innerHTML = '<div class="drop-hint">Перетащите кандидата сюда</div>';
      }
    });
    
    // Обновляем статистику команды
    this.updateTeamStats();
  }
  
  // Удаление кандидата с должности
  removeCandidate(positionId) {
    const success = this.engine.removeCandidate(positionId);
    
    if (success) {
      this.showToast('Кандидат удален с должности!', 'info');
      this.updateTeamDisplay();
      this.checkTeamCompletion();
    }
  }
  
  // Обновление статистики команды
  updateTeamStats() {
    const teamStats = this.engine.getTeamStats();
    
    // Обновляем отображение статистики если есть
    const statsElement = document.querySelector('.team-stats');
    if (statsElement) {
      statsElement.innerHTML = `
        <div class="stat-item">
          <span class="stat-label">Размер команды</span>
          <span class="stat-value">${teamStats.totalSalary > 0 ? teamStats.totalSalary : 0}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Средний опыт</span>
          <span class="stat-value">${Math.round(teamStats.avgExperience)} лет</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Эффективность</span>
          <span class="stat-value">${Math.round(teamStats.avgEfficiency * 100)}%</span>
        </div>
      `;
    }
  }
  
  // Проверка завершения команды
  checkTeamCompletion() {
    const isComplete = this.engine.isTeamComplete();
    const completeTeamBtn = document.getElementById('completeTeam');
    
    if (completeTeamBtn) {
      completeTeamBtn.disabled = !isComplete;
      
      if (isComplete) {
        completeTeamBtn.classList.add('ready');
        this.showToast('Команда собрана! Можно переходить к следующему этапу.', 'success');
      }
    }
  }
  
  // Обработчик выбора ниши
  handleNicheSelection(e) {
    if (e && e.currentTarget) {
      const nicheCard = e.currentTarget;
      const nicheId = nicheCard.dataset.niche;
      
      // Убираем выделение со всех карточек
      document.querySelectorAll('.niche-card').forEach(card => {
        card.classList.remove('selected');
      });
      
      // Выделяем выбранную карточку
      nicheCard.classList.add('selected');
      
      // Активируем кнопку выбора
      const selectNicheBtn = document.getElementById('selectNiche');
      if (selectNicheBtn) {
        selectNicheBtn.disabled = false;
      }
      
      // Сохраняем выбранную нишу
      this.engine.selectNiche(nicheId);
    }
  }

  // Обработчик нажатия кнопки "Выбрать нишу"
  handleSelectNiche() {
    const selectedNiche = document.querySelector('.niche-card.selected');
    if (selectedNiche) {
      const nicheId = selectedNiche.dataset.niche;
      this.engine.selectNiche(nicheId);
      this.showToast(`Ниша "${nicheId}" выбрана!`, 'success');
      this.nextStage();
    } else {
      this.showToast('Сначала выберите нишу!', 'error');
    }
  }
  
  // Обработчик завершения подбора команды
  handleTeamCompletion() {
    if (this.engine.isTeamComplete()) {
      this.showToast('Команда собрана!', 'success');
      this.nextStage();
    } else {
      this.showToast('Не все позиции заполнены!', 'error');
    }
  }
  
  // Обработчик следующего квартала
  handleNextQuarter() {
    const success = this.engine.nextQuarter();
    
    if (success) {
      this.updateBusinessStats();
      this.showToast('Переход к следующему кварталу!', 'info');
    } else {
      this.showToast('Квест завершен!', 'success');
      this.showFinalResults();
    }
  }
  
  // Обработчик завершения квеста
  handleQuestCompletion() {
    const results = this.engine.getFinalResults();
    this.showFinalResults(results);
  }
  
  // Обработчик пропуска команды
  handleSkipTeam() {
    this.engine.skipTeamSelection();
    this.showToast('Подбор команды пропущен!', 'info');
    this.updateTeamDisplay();
    this.checkTeamCompletion();
  }
  
  // Запуск квеста
  startQuest() {
    console.log('🚀 Запуск квеста...');
    
    // Скрываем модальное окно
    if (this.elements.introModal) {
      this.elements.introModal.style.display = 'none';
      console.log('✅ Модальное окно скрыто');
    }
    
    // Показываем основной контент квеста
    if (this.elements.questContent) {
      this.elements.questContent.style.display = 'block';
      console.log('✅ Контент квеста показан');
    }
    
    // Показываем первый этап квеста
    this.showStage(1);
    
    // Обновляем прогресс
    this.updateProgress();
    
    // Показываем уведомление
    this.showToast('Квест начался! Выберите нишу для бизнеса.', 'success');
    
    console.log('🎯 Квест успешно запущен');
  }
  
  // Переход к следующему этапу
  nextStage() {
    if (this.currentStage < 4) {
      this.currentStage++;
      this.showStage(this.currentStage);
      this.updateProgress();
    }
  }
  
  // Показать этап
  showStage(stageNumber) {
    // Скрываем все этапы
    document.querySelectorAll('.quest-stage').forEach(stage => {
      stage.classList.remove('active');
    });
    
    // Показываем нужный этап
    const targetStage = document.getElementById(this.getStageId(stageNumber));
    if (targetStage) {
      targetStage.classList.add('active');
    }
    
    // Обновляем прогресс
    this.updateProgress();
    
    // Специальная логика для каждого этапа
    switch (stageNumber) {
      case 1:
        this.initializeNicheSelection();
        break;
      case 2:
        this.initializeTeamSelection();
        break;
      case 3:
        this.initializeBusinessManagement();
        break;
      case 4:
        this.initializeResults();
        break;
    }
  }
  
  // Получение ID этапа
  getStageId(stageNumber) {
    const stageIds = {
      1: 'nicheSelection',
      2: 'teamSelection',
      3: 'businessManagement',
      4: 'results'
    };
    return stageIds[stageNumber] || 'nicheSelection';
  }
  
  // Инициализация выбора ниши
  initializeNicheSelection() {
    console.log('🎯 Инициализация выбора ниши');
  }
  
  // Инициализация подбора команды
  initializeTeamSelection() {
    console.log('👥 Инициализация подбора команды');
    this.setupCandidateCards();
    this.updateTeamDisplay();
  }
  
  // Инициализация управления бизнесом
  initializeBusinessManagement() {
    console.log('⚡ Инициализация управления бизнесом');
    this.updateBusinessStats();
  }
  
  // Инициализация результатов
  initializeResults() {
    console.log('🏆 Инициализация результатов');
    const results = this.engine.getFinalResults();
    this.showFinalResults(results);
  }
  
  // Обновление статистики бизнеса
  updateBusinessStats() {
    const stats = this.engine.getGameState().businessStats;
    
    // Обновляем элементы статистики
    const revenueElement = document.getElementById('revenue');
    if (revenueElement) {
      revenueElement.textContent = `${stats.revenue.toLocaleString()} ₽`;
    }
    
    const growthElement = document.getElementById('growth');
    if (growthElement) {
      growthElement.textContent = `${stats.growth}%`;
    }
    
    const teamSizeElement = document.getElementById('teamSize');
    if (teamSizeElement) {
      teamSizeElement.textContent = stats.teamSize;
    }
    
    const reputationElement = document.getElementById('reputation');
    if (reputationElement) {
      reputationElement.textContent = stats.reputation;
    }
  }
  
  // Показать финальные результаты
  showFinalResults(results) {
    // Обновляем элементы результатов
    const finalRevenueElement = document.getElementById('finalRevenue');
    if (finalRevenueElement) {
      finalRevenueElement.textContent = `${results.totalRevenue.toLocaleString()} ₽`;
    }
    
    const finalTeamSizeElement = document.getElementById('finalTeamSize');
    if (finalTeamSizeElement) {
      finalTeamSizeElement.textContent = results.finalTeamSize;
    }
    
    const finalReputationElement = document.getElementById('finalReputation');
    if (finalReputationElement) {
      finalReputationElement.textContent = results.finalReputation;
    }
    
    const finalGrowthElement = document.getElementById('finalGrowth');
    if (finalGrowthElement) {
      finalGrowthElement.textContent = `${results.finalGrowth}%`;
    }
  }
  
  // Обновление прогресса
  updateProgress() {
    const progress = (this.currentStage / 4) * 100;
    
    if (this.elements.progressFill) {
      this.elements.progressFill.style.width = `${progress}%`;
    }
    
    // Обновляем шаги прогресса
    this.elements.progressSteps.forEach((step, index) => {
      const stepNumber = index + 1;
      
      if (stepNumber < this.currentStage) {
        step.classList.add('completed');
        step.classList.remove('active');
      } else if (stepNumber === this.currentStage) {
        step.classList.add('active');
        step.classList.remove('completed');
      } else {
        step.classList.remove('active', 'completed');
      }
    });
  }
  
  // Показать toast уведомление
  showToast(message, type = 'info') {
    if (!this.elements.toast) return;
    
    this.elements.toast.textContent = message;
    this.elements.toast.className = `toast ${type} show`;
    
    // Автоматически скрываем через 3 секунды
    setTimeout(() => {
      this.elements.toast.classList.remove('show');
    }, 3000);
    
    console.log(`📢 Toast: ${message} (${type})`);
  }
  
  // Возврат назад
  goBack() {
    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.close();
    } else {
      window.history.back();
    }
  }
  
  // Обработчик изменения размера экрана
  handleResize() {
    // Пересчитываем размеры и позиции элементов
    this.updateLayout();
  }
  
  // Обновление макета
  updateLayout() {
    // Адаптация под размер экрана
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
      document.body.classList.add('mobile');
    } else {
      document.body.classList.remove('mobile');
    }
  }
  
  // Обновление UI
  refreshUI() {
    this.updateProgress();
    this.updateTeamDisplay();
    this.updateBusinessStats();
  }
  
  // Инициализация анимаций
  initializeAnimations() {
    // Добавляем CSS классы для анимаций
    document.body.classList.add('animations-ready');
    
    // Запускаем анимации появления элементов
    this.animateElements();
  }
  
  // Анимация элементов
  animateElements() {
    const elements = document.querySelectorAll('.quest-stage, .niche-card, .candidate-card, .position-slot');
    
    elements.forEach((element, index) => {
      setTimeout(() => {
        element.classList.add('animate-in');
      }, index * 100);
    });
  }
  
  // Обработчик прокрутки
  handleScroll() {
    // Оптимизация производительности при прокрутке
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }
    
    this.scrollTimeout = setTimeout(() => {
      // Логика обработки прокрутки
    }, 100);
  }
  
  // Обработчик касаний
  handleTouch() {
    // Оптимизация для touch устройств
    if (this.touchTimeout) {
      clearTimeout(this.touchTimeout);
    }
    
    this.touchTimeout = setTimeout(() => {
      // Логика обработки касаний
    }, 100);
  }
}

// Экспорт класса
window.BusinessQuestUI = BusinessQuestUI;
