/* ===== BUSINESS QUEST UI ===== */

class BusinessQuestUI {
  constructor(engine) {
    this.engine = engine;
    this.currentStage = 0;
    this.draggedCandidate = null;
    this.dragOverPosition = null;
    
    // DOM элементы
    this.elements = {
      introModal: null,
      questContent: null,
      stages: {},
      buttons: {},
      modals: {}
    };
    
    // Привязываем методы к контексту
    this.handleStageChange = this.handleStageChange.bind(this);
    this.handleNicheSelection = this.handleNicheSelection.bind(this);
    this.handleCandidateHired = this.handleCandidateHired.bind(this);
    this.handleQuestCompleted = this.handleQuestCompleted.bind(this);
    
    this.initializeEventListeners();
  }

  // Инициализация UI
  initialize() {
    console.log('🎨 Инициализация UI бизнес-квеста...');
    
    this.cacheElements();
    this.setupEventListeners();
    // Fallback на случай, если слушатель инициализировался до появления DOM
    const startBtn = document.getElementById('startQuest');
    if (startBtn) {
      startBtn.addEventListener('click', (e) => { e.preventDefault(); this.startQuest(); });
    }

    this.renderCurrentStage();
    
    // Подписываемся на события движка
    this.engine.on('stageChanged', this.handleStageChange);
    this.engine.on('nicheSelected', this.handleNicheSelection);
    this.engine.on('candidateHired', this.handleCandidateHired);
    this.engine.on('questCompleted', this.handleQuestCompleted);
    
    console.log('✅ UI бизнес-квеста инициализирован');
  }

  // Кэширование DOM элементов
  cacheElements() {
    this.elements.introModal = document.getElementById('introModal');
    this.elements.questContent = document.querySelector('.quest-content');
    
    // Кнопки
    this.elements.buttons = {
      startQuest: document.getElementById('startQuest'),
      back: document.getElementById('btnBack'),
      confirmNiche: document.getElementById('confirmNiche'),
      confirmTeam: document.getElementById('confirmTeam'),
      nextMonth: document.getElementById('nextMonth'),
      finishQuest: document.getElementById('finishQuest')
    };
    
    // Этапы
    this.elements.stages = {
      businessNiche: document.getElementById('businessNiche'),
      teamHiring: document.getElementById('teamHiring'),
      businessManagement: document.getElementById('businessManagement'),
      questResults: document.getElementById('questResults')
    };
  }

  // Настройка обработчиков событий
  setupEventListeners() {
    // Кнопка "Начать квест"
    if (this.elements.buttons.startQuest) {
      this.elements.buttons.startQuest.addEventListener('click', () => {
        this.startQuest();
      });
    }
    
    // Кнопка "Назад"
    if (this.elements.buttons.back) {
      this.elements.buttons.back.addEventListener('click', () => {
        this.goBack();
      });
    }
    
    // Кнопка подтверждения ниши
    if (this.elements.buttons.confirmNiche) {
      this.elements.buttons.confirmNiche.addEventListener('click', () => {
        this.confirmNicheSelection();
      });
    }
    
    // Кнопка "Пропустить кандидата"
    const skipCandidateBtn = document.getElementById('skipCandidate');
    if (skipCandidateBtn) {
      skipCandidateBtn.addEventListener('click', () => {
        this.skipCandidate();
      });
    }
    
    // Кнопка "Запустить бизнес"
    const launchBusinessBtn = document.getElementById('launchBusiness');
    if (launchBusinessBtn) {
      launchBusinessBtn.addEventListener('click', () => {
        this.launchBusiness();
      });
    }
    
    // Кнопка следующего месяца
    if (this.elements.buttons.nextMonth) {
      this.elements.buttons.nextMonth.addEventListener('click', () => {
        this.nextMonth();
      });
    }
    
    // Кнопка завершения квеста
    if (this.elements.buttons.finishQuest) {
      this.elements.buttons.finishQuest.addEventListener('click', () => {
        this.finishQuest();
      });
    }
    
    // Выбор ниши
    this.setupNicheSelection();
    
    // Бизнес-действия
    this.setupBusinessActions();
  
    // Запуск по Enter, когда модалка активна
    document.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter') {
        const modal = this.elements.introModal || document.getElementById('introModal');
        if (modal && modal.style.display !== 'none') {
          const btn = this.elements.buttons.startQuest || document.getElementById('startQuest');
          if (btn) { ev.preventDefault(); this.startQuest(); }
        }
      }
    });
}

  // Настройка выбора ниши
  setupNicheSelection() {
    const nicheCards = document.querySelectorAll('.niche-card');
    
    nicheCards.forEach(card => {
      card.addEventListener('click', () => {
        const nicheId = card.dataset.niche;
        this.selectNiche(nicheId);
      });
    });
  }

  // Настройка Drag & Drop
  setupDragAndDrop() {
    // Создаем кандидатов
    this.renderCandidates();
    
    // Настраиваем drag & drop
    this.setupCandidateDrag();
    this.setupPositionDrop();
  }

  // Настройка перетаскивания кандидатов
  setupCandidateDrag() {
    const candidateCards = document.querySelectorAll('.candidate-card');
    
    candidateCards.forEach(card => {
      card.addEventListener('dragstart', (e) => {
        this.handleDragStart(e, card);
      });
      
      card.addEventListener('dragend', (e) => {
        this.handleDragEnd(e);
      });
    });
  }

  // Настройка drag & drop для текущего кандидата
  setupCurrentCandidateDrag() {
    const currentCandidateCard = document.querySelector('.current-candidate .candidate-card');
    if (!currentCandidateCard) return;
    
    currentCandidateCard.addEventListener('dragstart', (e) => {
      this.handleDragStart(e, currentCandidateCard);
    });
    
    currentCandidateCard.addEventListener('dragend', (e) => {
      this.handleDragEnd(e);
    });
  }

  // Настройка drop зон для должностей
  setupPositionDrop() {
    const positionSlots = document.querySelectorAll('.position-slot');
    
    positionSlots.forEach(slot => {
      slot.addEventListener('dragover', (e) => {
        this.handleDragOver(e, slot);
      });
      
      slot.addEventListener('drop', (e) => {
        this.handleDrop(e, slot);
      });
      
      slot.addEventListener('dragleave', (e) => {
        this.handleDragLeave(e, slot);
      });
    });
  }

  // Настройка бизнес-действий
  setupBusinessActions() {
    const actionButtons = document.querySelectorAll('.action-btn');
    
    actionButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const actionType = btn.dataset.action;
        this.performBusinessAction(actionType);
      });
    });
  }

  // Обработка начала перетаскивания
  handleDragStart(e, candidateCard) {
    this.draggedCandidate = candidateCard;
    candidateCard.classList.add('dragging');
    
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', candidateCard.outerHTML);
    
    // Автоматическое перемещение камеры к блокам должностей
    this.scrollToPositions();
  }

  // Обработка перетаскивания над drop зоной
  handleDragOver(e, positionSlot) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (this.draggedCandidate && positionSlot.dataset.occupied !== 'true') {
      positionSlot.classList.add('drag-over');
      this.dragOverPosition = positionSlot;
      
      // Показываем красивое уведомление вверху экрана
      this.showDragNotification('Отпустите для найма кандидата');
    }
  }

  // Обработка drop
  handleDrop(e, positionSlot) {
    e.preventDefault();
    
    if (this.draggedCandidate && this.dragOverPosition === positionSlot) {
      const candidateId = this.draggedCandidate.dataset.candidateId;
      const positionId = positionSlot.dataset.position;
      
      // Проверяем, что позиция свободна
      if (positionSlot.dataset.occupied === 'false') {
        // Нанимаем кандидата
        if (this.hireCandidate(candidateId, positionId)) {
          // Обновляем позицию как занятую
          positionSlot.dataset.occupied = 'true';
          this.updateConfirmTeamButton();
          this.showNextCandidate(); // Показываем следующего кандидата
          this.showToast('Кандидат успешно нанят!', 'success');
        } else {
          this.showToast('Не удалось нанять кандидата', 'error');
        }
      } else {
        this.showToast('Эта позиция уже занята', 'warning');
      }
    }
    
    this.cleanupDragState();
  }

  // Обработка окончания перетаскивания
  handleDragEnd(e) {
    this.cleanupDragState();
  }

  // Обработка выхода из drop зоны
  handleDragLeave(e, positionSlot) {
    if (this.dragOverPosition === positionSlot) {
      positionSlot.classList.remove('drag-over');
      this.dragOverPosition = null;
    }
  }

  // Очистка состояния перетаскивания
  cleanupDragState() {
    if (this.draggedCandidate) {
      this.draggedCandidate.classList.remove('dragging');
      this.draggedCandidate = null;
    }
    
    if (this.dragOverPosition) {
      this.dragOverPosition.classList.remove('drag-over');
      this.dragOverPosition = null;
    }
    
    // Скрываем уведомление о перетаскивании
    this.hideDragNotification();
  }

  // Показать уведомление о перетаскивании
  showDragNotification(message) {
    // Удаляем предыдущее уведомление если есть
    this.hideDragNotification();
    
    const notification = document.createElement('div');
    notification.className = 'drag-notification';
    notification.textContent = message;
    notification.id = 'dragNotification';
    
    document.body.appendChild(notification);
  }

  // Скрыть уведомление о перетаскивании
  hideDragNotification() {
    const notification = document.getElementById('dragNotification');
    if (notification) {
      notification.remove();
    }
  }

  // Автоматическое перемещение камеры к блокам должностей
  scrollToPositions() {
    const positionsSection = document.querySelector('.positions-section');
    if (positionsSection) {
      positionsSection.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center',
        inline: 'center'
      });
    }
  }

  // Рендер нанятого кандидата
  renderHiredCandidate(positionSlot, candidateCard) {
    const candidateData = this.getCandidateData(candidateCard.dataset.candidateId);
    
    positionSlot.dataset.occupied = 'true';
    positionSlot.innerHTML = `
      <div class="hired-candidate">
        <div class="candidate-avatar">${candidateData.avatar || '👤'}</div>
        <div class="candidate-info">
          <h4>${candidateData.name}</h4>
          <p>${candidateData.specialty}</p>
          <div class="candidate-salary">${candidateData.salary} ₽/мес</div>
        </div>
        <button class="fire-btn" onclick="businessUI.fireCandidate('${positionSlot.dataset.position}')">🔥</button>
      </div>
    `;
  }

  // Увольнение кандидата
  fireCandidate(positionId) {
    if (this.engine.fireCandidate(positionId)) {
      const positionSlot = document.querySelector(`[data-position="${positionId}"]`);
      this.resetPositionSlot(positionSlot);
      this.updateConfirmTeamButton();
    }
  }

  // Сброс слота должности
  resetPositionSlot(positionSlot) {
    positionSlot.dataset.occupied = 'false';
    positionSlot.innerHTML = `
      <div class="position-icon">${this.getPositionIcon(positionSlot.dataset.position)}</div>
      <div class="position-info">
        <h4>${this.getPositionName(positionSlot.dataset.position)}</h4>
        <p>${this.getPositionDescription(positionSlot.dataset.position)}</p>
      </div>
      <div class="candidate-placeholder">Перетащите кандидата</div>
    `;
  }

  // Получение иконки должности
  getPositionIcon(positionId) {
    const icons = {
      tech: '💻',
      marketing: '📢',
      finance: '💰',
      operations: '⚙️'
    };
    return icons[positionId] || '👤';
  }

  // Получение названия должности
  getPositionName(positionId) {
    const names = {
      tech: 'Технический директор',
      marketing: 'Маркетинг-директор',
      finance: 'Финансовый директор',
      operations: 'Операционный директор'
    };
    return names[positionId] || 'Должность';
  }

  // Получение описания должности
  getPositionDescription(positionId) {
    const descriptions = {
      tech: 'Управление разработкой и IT',
      marketing: 'Продвижение и реклама',
      finance: 'Управление финансами',
      operations: 'Управление процессами'
    };
    return descriptions[positionId] || 'Описание должности';
  }

  // Рендер кандидатов
  renderCandidates() {
    const candidatesGrid = document.querySelector('.candidates-grid');
    if (!candidatesGrid) return;
    
    // Получаем доступных кандидатов
    const availableCandidates = this.getAvailableCandidates();
    
    candidatesGrid.innerHTML = availableCandidates.map(candidate => `
      <div class="candidate-card" 
           data-candidate-id="${candidate.id}" 
           draggable="true">
        <div class="candidate-avatar">${candidate.avatar || '👤'}</div>
        <div class="candidate-name">${candidate.name}</div>
        <div class="candidate-specialty">${candidate.specialty}</div>
        <div class="candidate-stats">
          <div class="candidate-stat">
            <span class="stat-label">Опыт</span>
            <span class="stat-value">${candidate.experience}</span>
          </div>
          <div class="candidate-stat">
            <span class="stat-label">Навыки</span>
            <span class="stat-value">${candidate.skills.length}</span>
          </div>
        </div>
      </div>
    `).join('');
    
    // Перенастраиваем drag & drop для новых кандидатов
    this.setupCandidateDrag();
  }

  // Получение доступных кандидатов
  getAvailableCandidates() {
    // Фильтруем кандидатов, которые уже наняты
    const hiredCandidateIds = Object.values(this.engine.gameState.hiredTeam)
      .map(employee => employee.id);
    
    return this.engine.candidates.filter(candidate => 
      !hiredCandidateIds.includes(candidate.id)
    );
  }

  // Получение данных кандидата
  getCandidateData(candidateId) {
    return this.engine.candidates.find(c => c.id === candidateId) || {};
  }

  // Выбор ниши
  selectNiche(nicheId) {
    // Убираем выделение со всех карточек
    document.querySelectorAll('.niche-card').forEach(card => {
      card.classList.remove('selected');
    });
    
    // Выделяем выбранную карточку
    const selectedCard = document.querySelector(`[data-niche="${nicheId}"]`);
    if (selectedCard) {
      selectedCard.classList.add('selected');
    }
    
    // Активируем кнопку подтверждения
    if (this.elements.buttons.confirmNiche) {
      this.elements.buttons.confirmNiche.disabled = false;
    }
  }

  // Подтверждение выбора ниши
  confirmNicheSelection() {
    const selectedCard = document.querySelector('.niche-card.selected');
    if (!selectedCard) return;
    
    const nicheId = selectedCard.dataset.niche;
    
    if (this.engine.selectNiche(nicheId)) {
      this.engine.nextStage();
      this.renderCurrentStage();
    }
  }

  // Пропуск кандидата
  skipCandidate() {
    this.showNextCandidate();
  }

  // Запуск бизнеса
  launchBusiness() {
    const teamSize = Object.keys(this.engine.gameState.hiredTeam).length;
    
    if (teamSize >= 2) {
      this.engine.nextStage();
      this.renderCurrentStage();
    } else {
      this.showToast('Нужно нанять минимум 2 сотрудника', 'warning');
    }
  }

  // Показ следующего кандидата
  showNextCandidate() {
    const currentCandidate = this.getNextCandidate();
    if (currentCandidate) {
      this.renderCurrentCandidate(currentCandidate);
      this.showToast('Новый кандидат готов к рассмотрению', 'info');
    } else {
      // Если нет доступных кандидатов, показываем случайного из всех 50
      const randomCandidate = this.getRandomCandidate();
      if (randomCandidate) {
        this.renderCurrentCandidate(randomCandidate);
        this.showToast('Показываем случайного кандидата', 'info');
      } else {
        this.showToast('Нет доступных кандидатов', 'warning');
      }
    }
  }

  // Получение следующего кандидата
  getNextCandidate() {
    const availableCandidates = this.getAvailableCandidates();
    
    // Если нет доступных кандидатов, возвращаем случайного из всех 50
    if (availableCandidates.length === 0) {
      return this.getRandomCandidate();
    }
    
    // Увеличиваем индекс кандидата
    if (!this.currentCandidateIndex) {
      this.currentCandidateIndex = 0;
    } else {
      this.currentCandidateIndex = (this.currentCandidateIndex + 1) % availableCandidates.length;
    }
    
    return availableCandidates[this.currentCandidateIndex];
  }

  // Получение случайного кандидата из всех 50
  getRandomCandidate() {
    const allCandidates = this.engine.candidates;
    if (allCandidates.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * allCandidates.length);
    return allCandidates[randomIndex];
  }

  // Рендер текущего кандидата
  renderCurrentCandidate(candidate) {
    const currentCandidateContainer = document.querySelector('.current-candidate');
    if (!currentCandidateContainer) return;
    
    currentCandidateContainer.innerHTML = `
      <div class="candidate-card" data-candidate-id="${candidate.id}" draggable="true">
        <div class="candidate-avatar">${candidate.avatar || '👤'}</div>
        <div class="candidate-name">${candidate.name || 'Неизвестный'}</div>
        <div class="candidate-specialty">${candidate.specialty || 'Специалист'}</div>
        <div class="candidate-stats">
          <div class="candidate-stat">
            <span class="stat-label">Опыт</span>
            <span class="stat-value">${candidate.experience || 0} лет</span>
          </div>
          <div class="candidate-stat">
            <span class="stat-label">Зарплата</span>
            <span class="stat-value">${(candidate.salary || 5000).toLocaleString()} ₽</span>
          </div>
        </div>
        <div class="candidate-description">${candidate.description || 'Опытный специалист'}</div>
        <div class="candidate-skills">
          ${(candidate.skills || []).map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
        </div>
      </div>
    `;
    
    // Настраиваем drag & drop для текущего кандидата
    this.setupCurrentCandidateDrag();
    
    // Обновляем кнопки
    this.updateCandidateButtons();
  }

  // Обновление кнопок кандидата
  updateCandidateButtons() {
    const skipBtn = document.getElementById('skipCandidate');
    const launchBtn = document.getElementById('launchBusiness');
    
    if (skipBtn && launchBtn) {
      const teamSize = Object.keys(this.engine.gameState.hiredTeam).length;
      
      if (teamSize >= 4) {
        // Все должности заполнены
        skipBtn.style.display = 'none';
        launchBtn.style.display = 'block';
      } else {
        // Есть свободные должности
        skipBtn.style.display = 'block';
        launchBtn.style.display = 'none';
      }
    }
  }

  // Следующий месяц
  nextMonth() {
    if (this.engine.nextMonth()) {
      this.updateBusinessStats();
      this.checkQuestCompletion();
    }
  }

  // Обновление бизнес-статистики
  updateBusinessStats() {
    const stats = this.engine.gameState.businessStats;
    
    // Обновляем отображение статистики
    const capitalElement = document.getElementById('capitalValue');
    const revenueElement = document.getElementById('revenueValue');
    const teamSizeElement = document.getElementById('teamSize');
    const progressElement = document.getElementById('progressValue');
    
    if (capitalElement) capitalElement.textContent = `${stats.capital.toLocaleString()} ₽`;
    if (revenueElement) revenueElement.textContent = `${stats.revenue.toLocaleString()} ₽`;
    if (teamSizeElement) teamSizeElement.textContent = `${Object.keys(this.engine.gameState.hiredTeam).length}/4`;
    if (progressElement) progressElement.textContent = `${this.engine.getQuestProgress().percentage}%`;
  }

  // Проверка завершения квеста
  checkQuestCompletion() {
    if (this.engine.gameState.isCompleted) {
      this.engine.nextStage();
    }
  }

  // Выполнение бизнес-действия
  performBusinessAction(actionType) {
    if (this.engine.performBusinessAction(actionType)) {
      this.updateBusinessStats();
      this.showToast(`Действие "${this.getActionName(actionType)}" выполнено!`, 'success');
    } else {
      this.showToast('Недостаточно средств для выполнения действия', 'error');
    }
  }

  // Получение названия действия
  getActionName(actionType) {
    const names = {
      marketing: 'Маркетинговая кампания',
      development: 'Разработка продукта',
      finance: 'Финансовая оптимизация',
      operations: 'Операционные улучшения'
    };
    return names[actionType] || 'Действие';
  }

  // Запуск квеста
  startQuest() {
    this.engine.startQuest();
    
    // Скрываем модальное окно
    if (this.elements.introModal) {
      this.elements.introModal.classList.remove('show');
      this.elements.introModal.style.display = 'none';
    }
    
    // Показываем контент квеста
    if (this.elements.questContent) {
      this.elements.questContent.style.display = 'block';
      this.elements.questContent.classList.add('show');
    }
    
    // Переходим к первому этапу
    this.engine.setStage(0);
    
    // Обновляем UI
    this.renderCurrentStage();
    
    console.log('🚀 Квест запущен!');
  }

  // Возврат назад
  goBack() {
    if (this.engine.previousStage()) {
      // Обновляем UI
    } else {
      // Возвращаемся к главному меню
      window.history.back();
    }
  }

  // Завершение квеста
  finishQuest() {
    // Здесь можно добавить логику возврата к главному меню
    // или показа результатов
    this.showToast('Квест завершен! Получены награды!', 'success');
  }

  // Обработка изменения этапа
  handleStageChange(stageIndex) {
    this.currentStage = stageIndex;
    this.renderCurrentStage();
  }

  // Обработка выбора ниши
  handleNicheSelection(niche) {
    console.log('🎯 Выбрана ниша:', niche.name);
  }

  // Обработка найма кандидата
  handleCandidateHired(data) {
    console.log('👥 Нанят кандидат:', data.candidate.name, 'на должность:', data.position.name);
    this.updateConfirmTeamButton();
  }

  // Обработка завершения квеста
  handleQuestCompleted(results) {
    console.log('🏆 Квест завершен!', results);
    this.renderFinalResults(results);
  }

  // Рендер текущего этапа
  renderCurrentStage() {
    const currentStageId = this.engine.getCurrentStage();
    
    // Скрываем все этапы
    Object.values(this.elements.stages).forEach(stage => {
      if (stage) {
        stage.classList.remove('active');
      }
    });
    
    // Показываем текущий этап
    if (this.elements.stages[currentStageId]) {
      this.elements.stages[currentStageId].classList.add('active');
    }
    
    // Если это этап найма команды, показываем первого кандидата
    if (currentStageId === 'teamHiring') {
      this.initializeTeamHiring();
    }
    
    // Обновляем кнопки и состояние
    this.updateStageElements();
  }

  // Инициализация этапа найма команды
  initializeTeamHiring() {
    // Инициализируем индекс кандидата
    if (!this.currentCandidateIndex) {
      this.currentCandidateIndex = 0;
    }
    
    // Показываем первого кандидата
    this.showNextCandidate();
    
    // Настраиваем drag & drop для позиций
    this.setupPositionDrop();
  }

  // Найм кандидата на должность
  hireCandidate(candidateId, positionId) {
    const candidate = this.engine.candidates.find(c => c.id === candidateId);
    const position = this.getPositionById(positionId);
    
    if (candidate && position && this.canHireCandidate(candidate, position)) {
      this.engine.gameState.hiredTeam[positionId] = {
        ...candidate,
        hiredAt: this.engine.gameState.businessStats.month,
        salary: this.calculateSalary(candidate, position)
      };
      
      this.engine.saveProgress();
      
      // Обновляем UI
      this.updateCandidateButtons();
      this.renderHiredCandidate(positionId, candidate);
      
      return true;
    }
    return false;
  }

  // Рендер нанятого кандидата
  renderHiredCandidate(positionId, candidate) {
    const positionSlot = document.querySelector(`[data-position="${positionId}"]`);
    if (!positionSlot) return;
    
    positionSlot.dataset.occupied = 'true';
    positionSlot.innerHTML = `
      <div class="hired-candidate">
        <div class="candidate-avatar">${candidate.avatar || '👤'}</div>
        <div class="candidate-info">
          <h4>${candidate.name || 'Неизвестный'}</h4>
          <p>${candidate.specialty || 'Специалист'}</p>
          <div class="candidate-salary">${candidate.salary || 0} ₽/мес</div>
        </div>
        <button class="fire-btn" onclick="businessUI.fireCandidate('${positionId}')">🔥</button>
      </div>
    `;
  }

  // Увольнение кандидата
  fireCandidate(positionId) {
    if (this.engine.fireCandidate(positionId)) {
      const positionSlot = document.querySelector(`[data-position="${positionId}"]`);
      this.resetPositionSlot(positionSlot);
      this.updateCandidateButtons();
    }
  }

  // Сброс слота должности
  resetPositionSlot(positionSlot) {
    if (!positionSlot) return;
    
    positionSlot.dataset.occupied = 'false';
    positionSlot.innerHTML = `
      <div class="position-icon">${this.getPositionIcon(positionSlot.dataset.position)}</div>
      <div class="position-info">
        <h4>${this.getPositionName(positionSlot.dataset.position)}</h4>
        <p>${this.getPositionDescription(positionSlot.dataset.position)}</p>
      </div>
      <div class="candidate-placeholder">Перетащите кандидата</div>
    `;
  }

  // Получение иконки должности
  getPositionIcon(positionId) {
    const icons = {
      tech: '💻',
      marketing: '📢',
      finance: '💰',
      operations: '⚙️'
    };
    return icons[positionId] || '👤';
  }

  // Получение названия должности
  getPositionName(positionId) {
    const names = {
      tech: 'Технический директор',
      marketing: 'Маркетинг-директор',
      finance: 'Финансовый директор',
      operations: 'Операционный директор'
    };
    return names[positionId] || 'Должность';
  }

  // Получение описания должности
  getPositionDescription(positionId) {
    const descriptions = {
      tech: 'Управление разработкой и IT',
      marketing: 'Продвижение и реклама',
      finance: 'Управление финансами',
      operations: 'Управление процессами'
    };
    return descriptions[positionId] || 'Описание должности';
  }

  // Расчет зарплаты кандидата
  calculateSalary(candidate, position) {
    const baseSalary = 5000; // Базовая зарплата
    const experienceMultiplier = 1 + (candidate.experience / 100);
    const skillMultiplier = 1 + (candidate.skills.length * 0.1);
    
    return Math.round(baseSalary * experienceMultiplier * skillMultiplier);
  }

  // Проверка возможности найма кандидата
  canHireCandidate(candidate, position) {
    // Проверяем, что должность свободна
    if (this.engine.gameState.hiredTeam[position.id]) {
      return false;
    }
    
    // Проверяем, что у кандидата есть нужные навыки
    const requiredSkills = position.requiredSkills || [];
    const candidateSkills = candidate.skills || [];
    
    return requiredSkills.every(skill => 
      candidateSkills.includes(skill)
    );
  }

  // Получение должности по ID
  getPositionById(positionId) {
    const positions = [
      { id: 'tech', name: 'Технический директор', requiredSkills: ['tech', 'leadership'] },
      { id: 'marketing', name: 'Маркетинг-директор', requiredSkills: ['marketing', 'leadership'] },
      { id: 'finance', name: 'Финансовый директор', requiredSkills: ['finance', 'leadership'] },
      { id: 'operations', name: 'Операционный директор', requiredSkills: ['operations', 'leadership'] }
    ];
    
    return positions.find(p => p.id === positionId);
  }

  // Обновление элементов этапа
  updateStageElements() {
    const currentStageId = this.engine.getCurrentStage();
    
    switch (currentStageId) {
      case 'businessNiche':
        this.updateNicheStage();
        break;
      case 'teamHiring':
        this.updateTeamStage();
        break;
      case 'businessManagement':
        this.updateBusinessStage();
        break;
      case 'questResults':
        this.updateResultsStage();
        break;
    }
  }

  // Обновление этапа выбора ниши
  updateNicheStage() {
    // Кнопка подтверждения активна только при выборе ниши
    if (this.elements.buttons.confirmNiche) {
      this.elements.buttons.confirmNiche.disabled = !this.engine.gameState.selectedNiche;
    }
  }

  // Обновление этапа найма команды
  updateTeamStage() {
    this.updateConfirmTeamButton();
  }

  // Обновление этапа управления бизнесом
  updateBusinessStage() {
    this.updateBusinessStats();
  }

  // Обновление этапа результатов
  updateResultsStage() {
    const results = this.engine.calculateFinalResults();
    this.renderFinalResults(results);
  }

  // Обновление кнопки подтверждения команды
  updateConfirmTeamButton() {
    if (this.elements.buttons.confirmTeam) {
      const teamSize = Object.keys(this.engine.gameState.hiredTeam).length;
      this.elements.buttons.confirmTeam.disabled = teamSize < 2;
    }
  }

  // Рендер финальных результатов
  renderFinalResults(results) {
    // Обновляем элементы результатов
    const finalCapitalElement = document.getElementById('finalCapital');
    const totalRevenueElement = document.getElementById('totalRevenue');
    const businessGrowthElement = document.getElementById('businessGrowth');
    const teamQualityElement = document.getElementById('teamQuality');
    
    if (finalCapitalElement) finalCapitalElement.textContent = `${results.finalCapital.toLocaleString()} ₽`;
    if (totalRevenueElement) totalRevenueElement.textContent = `${results.totalRevenue.toLocaleString()} ₽`;
    if (businessGrowthElement) businessGrowthElement.textContent = `${results.businessGrowth}%`;
    if (teamQualityElement) teamQualityElement.textContent = `${results.teamQuality}%`;
    
    // Обновляем историю завершения
    this.renderEndingStory(results);
    
    // Обновляем награды
    this.renderRewards(results.rewards);
    
    // Начисляем награды пользователю
    this.awardRewards(results.rewards);
  }

  // Рендер истории завершения
  renderEndingStory(results) {
    const resultCard = document.querySelector('.result-card');
    if (resultCard && results.story) {
      resultCard.innerHTML = `
        <div class="result-icon">${this.getEndingIcon(results.endingType)}</div>
        <h3>${results.story.title}</h3>
        <p>${results.story.description}</p>
        <div class="story-details">
          <h4>Достижения:</h4>
          <ul>
            ${results.story.details.map(detail => `<li>${detail}</li>`).join('')}
          </ul>
        </div>
      `;
    }
  }

  // Получение иконки для типа завершения
  getEndingIcon(endingType) {
    const icons = {
      legendary: '🏆',
      successful: '🎉',
      moderate: '📈',
      average: '⚖️',
      failure: '💔'
    };
    return icons[endingType] || '🎯';
  }

  // Рендер наград
  renderRewards(rewards) {
    const rewardsSection = document.querySelector('.rewards-section');
    if (rewardsSection && rewards) {
      rewardsSection.innerHTML = `
        <h3>🎁 Награды за прохождение</h3>
        <div class="rewards-list">
          <div class="reward-item">
            <span class="reward-icon">🪙</span>
            <span class="reward-text">+${rewards.mulacoin} MULACOIN</span>
          </div>
          <div class="reward-item">
            <span class="reward-icon">⭐</span>
            <span class="reward-text">+${rewards.experience} XP</span>
          </div>
          <div class="reward-item">
            <span class="reward-icon">🏆</span>
            <span class="reward-text">Достижение "${rewards.achievement}"</span>
          </div>
        </div>
      `;
    }
  }

  // Начисление наград пользователю
  awardRewards(rewards) {
    if (!rewards) return;
    
    // Получаем текущие данные пользователя
    let userData = JSON.parse(localStorage.getItem('userData') || '{"mulacoin": 0, "exp": 0, "level": 1}');
    
    // Начисляем награды
    userData.mulacoin += rewards.mulacoin;
    userData.exp += rewards.experience;
    
    // Проверяем повышение уровня
    const newLevel = Math.floor(userData.exp / 100) + 1;
    if (newLevel > userData.level) {
      userData.level = newLevel;
      this.showToast(`🎉 Поздравляем! Вы достигли ${newLevel} уровня!`, 'success');
    }
    
    // Сохраняем обновленные данные
    localStorage.setItem('userData', JSON.stringify(userData));
    
    // Показываем уведомление о наградах
    this.showToast(`🎁 Получено: ${rewards.mulacoin} MULACOIN и ${rewards.experience} XP!`, 'success');
  }

  // Показ toast уведомления
  showToast(message, type = 'info') {
    // Создаем toast элемент
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // Добавляем в DOM
    document.body.appendChild(toast);
    
    // Показываем
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Скрываем через 3 секунды
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
  }

  // Инициализация обработчиков событий движка
  initializeEventListeners() {
    // Обработчики уже привязаны в конструкторе
  }
}

// Экспорт для использования в других модулях
window.BusinessQuestUI = BusinessQuestUI;

