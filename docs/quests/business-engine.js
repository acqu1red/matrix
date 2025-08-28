/* ===== BUSINESS QUEST ENGINE ===== */

// Движок для управления логикой квеста
class BusinessQuestEngine {
  constructor() {
    this.state = {
      currentStage: 1,
      selectedNiche: null,
      teamMembers: {},
      businessStats: {
        revenue: 0,
        growth: 0,
        teamSize: 0,
        reputation: 0,
        expenses: 0,
        profit: 0
      },
      decisions: [],
      events: [],
      gameTime: 0,
      isGameOver: false
    };
    
    this.gameLoop = null;
    this.eventQueue = [];
    
    this.initialize();
  }
  
  // Инициализация движка
  initialize() {
    this.loadState();
    this.setupGameLoop();
    this.bindEvents();
    console.log('Business Quest Engine initialized');
  }
  
  // Загрузка состояния
  loadState() {
    try {
      const savedState = localStorage.getItem('businessQuestState');
      if (savedState) {
        const parsed = JSON.parse(savedState);
        this.state = { ...this.state, ...parsed };
      }
    } catch (e) {
      console.error('Error loading quest state:', e);
    }
  }
  
  // Сохранение состояния
  saveState() {
    try {
      localStorage.setItem('businessQuestState', JSON.stringify(this.state));
    } catch (e) {
      console.error('Error saving quest state:', e);
    }
  }
  
  // Настройка игрового цикла
  setupGameLoop() {
    this.gameLoop = setInterval(() => {
      this.updateGame();
    }, 1000); // Обновление каждую секунду
  }
  
  // Привязка событий
  bindEvents() {
    // События для перетаскивания
    this.setupDragAndDrop();
    
    // События для кнопок
    this.setupButtonEvents();
    
    // События для модалов
    this.setupModalEvents();
  }
  
  // Настройка drag & drop
  setupDragAndDrop() {
    document.addEventListener('DOMContentLoaded', () => {
      this.initializeDragAndDrop();
    });
  }
  
  // Инициализация drag & drop
  initializeDragAndDrop() {
    const candidateCards = document.querySelectorAll('.candidate-card');
    const dropZones = document.querySelectorAll('.candidate-drop-zone');
    
    if (!candidateCards.length || !dropZones.length) {
      return;
    }
    
    // Обработчики для кандидатов
    candidateCards.forEach(card => {
      card.addEventListener('dragstart', this.handleDragStart.bind(this));
      card.addEventListener('dragend', this.handleDragEnd.bind(this));
      card.addEventListener('click', this.handleCandidateClick.bind(this));
    });
    
    // Обработчики для зон сброса
    dropZones.forEach(zone => {
      zone.addEventListener('dragover', this.handleDragOver.bind(this));
      zone.addEventListener('drop', this.handleDrop.bind(this));
      zone.addEventListener('dragenter', this.handleDragEnter.bind(this));
      zone.addEventListener('dragleave', this.handleDragLeave.bind(this));
    });
  }
  
  // Обработчик начала перетаскивания
  handleDragStart(e) {
    e.target.classList.add('dragging');
    e.dataTransfer.setData('text/plain', e.target.dataset.candidateId);
    e.dataTransfer.effectAllowed = 'move';
    
    // Добавляем визуальный эффект
    e.target.style.opacity = '0.5';
    e.target.style.transform = 'rotate(5deg) scale(1.05)';
  }
  
  // Обработчик окончания перетаскивания
  handleDragEnd(e) {
    e.target.classList.remove('dragging');
    e.target.style.opacity = '1';
    e.target.style.transform = 'rotate(0deg) scale(1)';
  }
  
  // Обработчик перетаскивания над зоной
  handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }
  
  // Обработчик входа в зону сброса
  handleDragEnter(e) {
    e.preventDefault();
    const dropZone = e.target.closest('.candidate-drop-zone');
    if (dropZone) {
      dropZone.classList.add('drag-over');
      dropZone.style.transform = 'scale(1.05)';
      dropZone.style.borderColor = 'var(--accent-primary)';
    }
  }
  
  // Обработчик выхода из зоны сброса
  handleDragLeave(e) {
    const dropZone = e.target.closest('.candidate-drop-zone');
    if (dropZone && !dropZone.contains(e.relatedTarget)) {
      dropZone.classList.remove('drag-over');
      dropZone.style.transform = 'scale(1)';
      dropZone.style.borderColor = 'var(--border-color)';
    }
  }
  
  // Обработчик сброса
  handleDrop(e) {
    e.preventDefault();
    const dropZone = e.target.closest('.candidate-drop-zone');
    const candidateId = e.dataTransfer.getData('text/plain');
    
    if (dropZone && candidateId) {
      this.placeCandidate(candidateId, dropZone);
    }
    
    // Убираем все эффекты drag-over
    document.querySelectorAll('.candidate-drop-zone').forEach(zone => {
      zone.classList.remove('drag-over');
      zone.style.transform = 'scale(1)';
      zone.style.borderColor = 'var(--border-color)';
    });
  }
  
  // Размещение кандидата
  placeCandidate(candidateId, dropZone) {
    const position = dropZone.dataset.position;
    const candidate = window.BUSINESS_QUEST_DATA?.CANDIDATES?.[candidateId];
    
    if (!candidate) {
      this.showToast('Ошибка: кандидат не найден', 'error');
      return;
    }
    
    // Проверяем, не занята ли позиция
    if (this.state.teamMembers[position]) {
      this.showToast('Эта позиция уже занята!', 'warning');
      return;
    }
    
    // Проверяем совместимость
    const compatibility = candidate.compatibility[position] || 0;
    if (compatibility < 50) {
      this.showToast(`Низкая совместимость: ${compatibility}%`, 'warning');
    }
    
    // Размещаем кандидата
    this.state.teamMembers[position] = candidateId;
    
    // Обновляем зону сброса
    this.updateDropZone(dropZone, candidate);
    
    // Обновляем статистику
    this.updateBusinessStats();
    
    // Проверяем завершение подбора
    this.checkTeamCompletion();
    
    // Сохраняем состояние
    this.saveState();
    
    // Показываем уведомление
    this.showToast(`Кандидат ${candidate.name} размещен на позиции ${this.getPositionTitle(position)}!`, 'success');
  }
  
  // Обновление зоны сброса
  updateDropZone(dropZone, candidate) {
    dropZone.classList.add('filled');
    dropZone.innerHTML = `
      <div class="candidate-in-position">
        <div class="candidate-avatar">${candidate.avatar}</div>
        <div class="candidate-name">${candidate.name}</div>
        <div class="candidate-compatibility">Совместимость: ${candidate.compatibility[dropZone.dataset.position] || 0}%</div>
      </div>
    `;
    
    // Анимация успеха
    dropZone.style.animation = 'successPulse 0.5s ease-out';
    setTimeout(() => {
      dropZone.style.animation = '';
    }, 500);
  }
  
  // Обработчик клика по кандидату (для мобильных устройств)
  handleCandidateClick(e) {
    const candidateId = e.currentTarget.dataset.candidateId;
    const candidate = window.BUSINESS_QUEST_DATA?.CANDIDATES?.[candidateId];
    
    if (!candidate) return;
    
    // Показываем информацию о кандидате
    this.showCandidateInfo(candidate);
  }
  
  // Показать информацию о кандидате
  showCandidateInfo(candidate) {
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `
      <div class="modalContent glass">
        <div class="modal-header">
          <h3>${candidate.avatar} ${candidate.name}</h3>
          <p>Возраст: ${candidate.age}, Опыт: ${candidate.experience}</p>
        </div>
        
        <div class="candidate-details">
          <div class="detail-section">
            <h4>Навыки</h4>
            <div class="skills-list">
              ${candidate.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
            </div>
          </div>
          
          <div class="detail-section">
            <h4>Сильные стороны</h4>
            <ul>
              ${candidate.strengths.map(strength => `<li>${strength}</li>`).join('')}
            </ul>
          </div>
          
          <div class="detail-section">
            <h4>Слабые стороны</h4>
            <ul>
              ${candidate.weaknesses.map(weakness => `<li>${weakness}</li>`).join('')}
            </ul>
          </div>
          
          <div class="detail-section">
            <h4>Совместимость с позициями</h4>
            <div class="compatibility-grid">
              ${Object.entries(candidate.compatibility).map(([pos, comp]) => `
                <div class="compatibility-item">
                  <span class="position-name">${this.getPositionTitle(pos)}</span>
                  <span class="compatibility-score ${comp >= 80 ? 'high' : comp >= 60 ? 'medium' : 'low'}">${comp}%</span>
                </div>
              `).join('')}
            </div>
          </div>
          
          <div class="detail-section">
            <h4>Мотивация</h4>
            <p>${candidate.motivation}</p>
          </div>
          
          <div class="detail-section">
            <h4>Зарплата</h4>
            <p class="salary">${candidate.salary.toLocaleString()} ₽</p>
          </div>
        </div>
        
        <div class="modal-actions">
          <button class="btn ghost" onclick="this.closest('.modal').remove()">Закрыть</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
  }
  
  // Настройка событий кнопок
  setupButtonEvents() {
    // Кнопка "Начать квест"
    const startQuestBtn = document.getElementById('startQuest');
    if (startQuestBtn) {
      startQuestBtn.addEventListener('click', () => this.startQuest());
    }
    
    // Кнопка "Выбрать нишу"
    const selectNicheBtn = document.getElementById('selectNiche');
    if (selectNicheBtn) {
      selectNicheBtn.addEventListener('click', () => this.selectNiche());
    }
    
    // Кнопка "Завершить подбор"
    const completeTeamBtn = document.getElementById('completeTeam');
    if (completeTeamBtn) {
      completeTeamBtn.addEventListener('click', () => this.completeTeam());
    }
    
    // Кнопка "Следующий квартал"
    const nextQuarterBtn = document.getElementById('nextQuarter');
    if (nextQuarterBtn) {
      nextQuarterBtn.addEventListener('click', () => this.nextQuarter());
    }
    
    // Кнопка "Завершить квест"
    const finishQuestBtn = document.getElementById('finishQuest');
    if (finishQuestBtn) {
      finishQuestBtn.addEventListener('click', () => this.finishQuest());
    }
  }
  
  // Настройка событий модалов
  setupModalEvents() {
    // Закрытие модалов по клику вне
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal')) {
        e.target.remove();
      }
    });
    
    // Закрытие модалов по Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const modals = document.querySelectorAll('.modal.show');
        modals.forEach(modal => modal.remove());
      }
    });
  }
  
  // Обновление игры
  updateGame() {
    this.state.gameTime++;
    
    // Автоматические события каждые 30 секунд
    if (this.state.gameTime % 30 === 0) {
      this.processRandomEvents();
    }
    
    // Автосохранение каждые 60 секунд
    if (this.state.gameTime % 60 === 0) {
      this.saveState();
    }
  }
  
  // Обработка случайных событий
  processRandomEvents() {
    const events = window.BUSINESS_QUEST_DATA?.RANDOM_EVENTS;
    if (!events) return;
    
    // Положительные события
    events.positive.forEach(event => {
      if (Math.random() < event.probability) {
        this.applyEventEffect(event);
        this.showToast(event.description, 'success');
      }
    });
    
    // Негативные события
    events.negative.forEach(event => {
      if (Math.random() < event.probability) {
        this.applyEventEffect(event);
        this.showToast(event.description, 'warning');
      }
    });
  }
  
  // Применение эффекта события
  applyEventEffect(event) {
    Object.entries(event.effect).forEach(([stat, value]) => {
      if (this.state.businessStats[stat] !== undefined) {
        this.state.businessStats[stat] += value;
      }
    });
    
    // Добавляем событие в историю
    this.state.events.push({
      ...event,
      timestamp: Date.now()
    });
    
    // Обновляем отображение
    this.updateBusinessStats();
  }
  
  // Обновление статистики бизнеса
  updateBusinessStats() {
    // Обновляем размер команды
    this.state.businessStats.teamSize = Object.keys(this.state.teamMembers).length;
    
    // Рассчитываем прибыль
    this.state.businessStats.profit = this.state.businessStats.revenue - this.state.businessStats.expenses;
    
    // Обновляем отображение
    this.updateStatsDisplay();
  }
  
  // Обновление отображения статистики
  updateStatsDisplay() {
    const stats = this.state.businessStats;
    
    // Обновляем элементы на странице
    const revenueEl = document.getElementById('revenue');
    if (revenueEl) revenueEl.textContent = `${stats.revenue.toLocaleString()} ₽`;
    
    const growthEl = document.getElementById('growth');
    if (growthEl) growthEl.textContent = `${stats.growth}%`;
    
    const teamSizeEl = document.getElementById('teamSize');
    if (teamSizeEl) teamSizeEl.textContent = stats.teamSize;
    
    const reputationEl = document.getElementById('reputation');
    if (reputationEl) reputationEl.textContent = stats.reputation;
  }
  
  // Проверка завершения подбора команды
  checkTeamCompletion() {
    const requiredPositions = ['manager', 'marketer', 'financier', 'specialist'];
    const filledPositions = requiredPositions.filter(pos => this.state.teamMembers[pos]);
    
    if (filledPositions.length === requiredPositions.length) {
      const completeTeamBtn = document.getElementById('completeTeam');
      if (completeTeamBtn) {
        completeTeamBtn.disabled = false;
        completeTeamBtn.style.animation = 'successPulse 1s ease-out infinite';
      }
      
      this.showToast('Команда полностью укомплектована!', 'success');
    }
  }
  
  // Получение названия позиции
  getPositionTitle(position) {
    const titles = {
      manager: 'Менеджер',
      marketer: 'Маркетолог',
      financier: 'Финансист',
      specialist: 'Специалист'
    };
    return titles[position] || position;
  }
  
  // Показать toast уведомление
  showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    // Убираем предыдущие классы
    toast.className = 'toast';
    
    // Добавляем тип
    toast.classList.add(type);
    
    // Устанавливаем сообщение
    toast.textContent = message;
    
    // Показываем
    toast.classList.add('show');
    
    // Скрываем через 3 секунды
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }
  
  // Основные методы квеста
  startQuest() {
    this.hideIntroModal();
    this.showStage(1);
    this.updateProgress();
  }
  
  selectNiche() {
    if (!this.state.selectedNiche) {
      this.showToast('Сначала выберите нишу!', 'warning');
      return;
    }
    
    this.showStage(2);
    this.updateProgress();
    this.showToast(`Выбрана ниша: ${this.getNicheTitle(this.state.selectedNiche)}!`, 'success');
  }
  
  completeTeam() {
    if (Object.keys(this.state.teamMembers).length < 4) {
      this.showToast('Нужно заполнить все позиции!', 'warning');
      return;
    }
    
    this.showStage(3);
    this.updateProgress();
    this.initializeBusinessManagement();
    this.showToast('Команда собрана! Теперь управляйте бизнесом!', 'success');
  }
  
  nextQuarter() {
    this.processBusinessDecisions();
    this.updateBusinessStats();
    
    // Проверяем, можно ли перейти к результатам
    if (this.state.businessStats.revenue >= 1000000) {
      this.showStage(4);
      this.updateProgress();
      this.showFinalResults();
    } else {
      this.showToast('Бизнес развивается! Продолжайте принимать решения.', 'info');
    }
  }
  
  finishQuest() {
    // Награды за прохождение
    const rewards = window.BUSINESS_QUEST_DATA?.REWARDS?.completion || {
      mulacoin: 3,
      xp: 200,
      achievement: 'Предприниматель'
    };
    
    this.showToast(`Поздравляем! Получено ${rewards.mulacoin} MULACOIN и ${rewards.xp} XP!`, 'success');
    
    // Возврат к главной странице
    setTimeout(() => {
      this.goBack();
    }, 2000);
  }
  
  // Вспомогательные методы
  hideIntroModal() {
    const introModal = document.getElementById('introModal');
    if (introModal) {
      introModal.classList.remove('show');
    }
  }
  
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
    
    // Обновляем состояние
    this.state.currentStage = stageNumber;
    
    // Обновляем прогресс
    this.updateProgress();
  }
  
  getStageId(stageNumber) {
    const stageIds = {
      1: 'nicheSelection',
      2: 'teamSelection',
      3: 'businessManagement',
      4: 'results'
    };
    return stageIds[stageNumber];
  }
  
  updateProgress() {
    const progressFill = document.getElementById('progressFill');
    const steps = document.querySelectorAll('.step');
    
    if (progressFill) {
      const progress = (this.state.currentStage / 4) * 100;
      progressFill.style.width = `${progress}%`;
    }
    
    // Обновляем шаги
    steps.forEach((step, index) => {
      const stepNumber = index + 1;
      step.classList.remove('active', 'completed');
      
      if (stepNumber < this.state.currentStage) {
        step.classList.add('completed');
      } else if (stepNumber === this.state.currentStage) {
        step.classList.add('active');
      }
    });
  }
  
  getNicheTitle(niche) {
    const niches = window.BUSINESS_QUEST_DATA?.BUSINESS_NICHES;
    if (niches && niches[niche]) {
      return niches[niche].name;
    }
    return niche;
  }
  
  goBack() {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '../quests.html';
    }
  }
  
  // Инициализация управления бизнесом
  initializeBusinessManagement() {
    this.createDecisionCards();
    this.updateBusinessStats();
  }
  
  // Создание карточек решений
  createDecisionCards() {
    const decisionsGrid = document.querySelector('.decisions-grid');
    if (!decisionsGrid) return;
    
    const decisions = window.BUSINESS_QUEST_DATA?.BUSINESS_DECISIONS;
    if (!decisions) return;
    
    Object.values(decisions).forEach(decision => {
      const decisionCard = document.createElement('div');
      decisionCard.className = 'decision-card';
      decisionCard.dataset.decisionId = decision.id;
      
      decisionCard.innerHTML = `
        <div class="decision-icon">${decision.icon}</div>
        <div class="decision-title">${decision.title}</div>
        <div class="decision-description">${decision.description}</div>
        <div class="decision-cost">Стоимость: ${decision.cost.toLocaleString()} ₽</div>
        <div class="decision-risk">Риск: ${decision.risk}</div>
      `;
      
      decisionCard.addEventListener('click', () => this.selectDecision(decision));
      decisionsGrid.appendChild(decisionCard);
    });
  }
  
  // Выбор решения
  selectDecision(decision) {
    // Проверяем, достаточно ли средств
    if (this.state.businessStats.revenue < decision.cost) {
      this.showToast('Недостаточно средств для этого решения!', 'warning');
      return;
    }
    
    // Применяем эффект решения
    this.state.businessStats.revenue -= decision.cost;
    this.state.businessStats.expenses += decision.cost;
    
    Object.entries(decision.effect).forEach(([stat, value]) => {
      if (this.state.businessStats[stat] !== undefined) {
        this.state.businessStats[stat] += value;
      }
    });
    
    // Сохраняем решение
    this.state.decisions.push({
      ...decision,
      timestamp: Date.now()
    });
    
    // Обновляем отображение
    this.updateBusinessStats();
    
    // Анимация выбора
    const decisionCard = document.querySelector(`[data-decision-id="${decision.id}"]`);
    if (decisionCard) {
      decisionCard.classList.add('selected');
      decisionCard.style.animation = 'successPulse 0.5s ease-out';
      setTimeout(() => {
        decisionCard.style.animation = '';
      }, 500);
    }
    
    this.showToast(`Решение "${decision.title}" принято!`, 'success');
  }
  
  // Обработка решений бизнеса
  processBusinessDecisions() {
    // Автоматический рост на основе решений
    if (this.state.decisions.length > 0) {
      this.state.businessStats.growth += 5;
      this.state.businessStats.revenue += this.state.businessStats.growth * 1000;
      this.state.businessStats.reputation += 2;
    }
  }
  
  // Показать финальные результаты
  showFinalResults() {
    const finalRevenue = document.getElementById('finalRevenue');
    const finalTeamSize = document.getElementById('finalTeamSize');
    const finalReputation = document.getElementById('finalReputation');
    const finalGrowth = document.getElementById('finalGrowth');
    
    if (finalRevenue) finalRevenue.textContent = `${this.state.businessStats.revenue.toLocaleString()} ₽`;
    if (finalTeamSize) finalTeamSize.textContent = this.state.businessStats.teamSize;
    if (finalReputation) finalReputation.textContent = this.state.businessStats.reputation;
    if (finalGrowth) finalGrowth.textContent = `${this.state.businessStats.growth}%`;
  }
  
  // Очистка ресурсов
  destroy() {
    if (this.gameLoop) {
      clearInterval(this.gameLoop);
    }
    this.saveState();
  }
}

// Создание экземпляра движка
let businessQuestEngine = null;

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  businessQuestEngine = new BusinessQuestEngine();
});

// Экспорт для использования в других файлах
window.businessQuestEngine = businessQuestEngine;
