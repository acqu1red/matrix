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
    // Снимаем выделение со всех карточек и выделяем выбранную
    document.querySelectorAll('.niche-card').forEach(c => c.classList.remove('selected'));
    const card = document.querySelector('[data-niche="' + nicheId + '"]');
    if (card) { card.classList.add('selected'); }

    // Сохраняем выбор ниши и сразу переходим на следующий этап
    if (this.engine && typeof this.engine.selectNiche === 'function' && this.engine.selectNiche(nicheId)) {
      // Скрыть кнопку подтверждения, если есть
      if (this.elements && this.elements.buttons && this.elements.buttons.confirmNiche) {
        this.elements.buttons.confirmNiche.style.display = 'none';
      }
      // Переход к следующему шагу и перерисовка
      if (this.engine && typeof this.engine.nextStage === 'function') {
        this.engine.nextStage();
      }
      if (typeof this.renderCurrentStage === 'function') {
        this.renderCurrentStage();
      }
      return true;
    }
    return false;
  }

}

// Экспорт для использования в других модулях
window.BusinessQuestUI = BusinessQuestUI;

