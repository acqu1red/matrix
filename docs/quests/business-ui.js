/* ===== BUSINESS QUEST UI - OPTIMIZED FOR MINIAPPS ===== */

// Основной класс UI для бизнес-квеста
class BusinessQuestUI {
  constructor() {
    this.currentStage = 1;
    this.selectedNiche = null;
    this.teamMembers = {};
    this.businessStats = {
      revenue: 0,
      growth: 0,
      teamSize: 0,
      reputation: 0
    };
    
    this.initialize();
  }
  
  // Инициализация UI
  initialize() {
    console.log('🎨 Инициализация UI для бизнес-квеста...');
    
    // Инициализируем все компоненты
    this.initializeIntroModal();
    this.initializeNicheSelection();
    this.initializeTeamSelection();
    this.initializeBusinessManagement();
    this.initializeResults();
    this.initializeProgressBar();
    
    // Показываем вступительное модальное окно
    this.showIntroModal();
    
    console.log('✅ UI для бизнес-квеста инициализирован');
  }
  
  // Инициализация вступительного модального окна
  initializeIntroModal() {
    const startQuestBtn = document.getElementById('startQuest');
    if (startQuestBtn) {
      startQuestBtn.addEventListener('click', () => this.startQuest());
    }
  }
  
  // Инициализация выбора ниши
  initializeNicheSelection() {
    const nicheCards = document.querySelectorAll('.niche-card');
    
    nicheCards.forEach(card => {
      card.addEventListener('click', () => {
        this.selectNiche(card);
      });
    });
    
    const selectNicheBtn = document.getElementById('selectNiche');
    if (selectNicheBtn) {
      selectNicheBtn.addEventListener('click', () => this.confirmNicheSelection());
    }
  }
  
  // Инициализация подбора команды
  initializeTeamSelection() {
    this.initializeCandidates();
    this.initializePositions();
    
    const completeTeamBtn = document.getElementById('completeTeam');
    if (completeTeamBtn) {
      completeTeamBtn.addEventListener('click', () => this.completeTeamSelection());
    }
  }
  
  // Инициализация кандидатов
  initializeCandidates() {
    const candidatesGrid = document.querySelector('.candidates-grid');
    if (!candidatesGrid) return;
    
    // Очищаем сетку
    candidatesGrid.innerHTML = '';
    
    // Создаем кандидатов из данных
    const candidates = window.BUSINESS_QUEST_DATA?.candidates || [
      { id: 'candidate1', name: 'Алексей Петров', skills: 'Лидерство, Организация', avatar: '👨‍💼' },
      { id: 'candidate2', name: 'Мария Сидорова', skills: 'Креативность, Аналитика', avatar: '👩‍🎨' },
      { id: 'candidate3', name: 'Дмитрий Козлов', skills: 'Математика, Планирование', avatar: '👨‍💻' },
      { id: 'candidate4', name: 'Анна Волкова', skills: 'Экспертиза, Опыт', avatar: '👩‍🔬' }
    ];
    
    candidates.forEach(candidate => {
      const candidateCard = this.createCandidateCard(candidate);
      candidatesGrid.appendChild(candidateCard);
    });
  }
  
  // Создание карточки кандидата
  createCandidateCard(candidate) {
    const card = document.createElement('div');
    card.className = 'candidate-card';
    card.dataset.candidateId = candidate.id;
    card.draggable = true;
    
    card.innerHTML = `
      <div class="candidate-avatar">${candidate.avatar}</div>
      <div class="candidate-name">${candidate.name}</div>
      <div class="candidate-skills">${candidate.skills}</div>
    `;
    
    // Добавляем обработчики drag & drop
    card.addEventListener('dragstart', this.handleDragStart.bind(this));
    card.addEventListener('dragend', this.handleDragEnd.bind(this));
    
    return card;
  }
  
  // Инициализация должностей
  initializePositions() {
    const dropZones = document.querySelectorAll('.candidate-drop-zone');
    
    dropZones.forEach(zone => {
      zone.addEventListener('dragover', this.handleDragOver.bind(this));
      zone.addEventListener('drop', this.handleDrop.bind(this));
      zone.addEventListener('dragenter', this.handleDragEnter.bind(this));
      zone.addEventListener('dragleave', this.handleDragLeave.bind(this));
    });
  }
  
  // Инициализация управления бизнесом
  initializeBusinessManagement() {
    this.initializeDecisions();
    
    const nextQuarterBtn = document.getElementById('nextQuarter');
    if (nextQuarterBtn) {
      nextQuarterBtn.addEventListener('click', () => this.nextQuarter());
    }
  }
  
  // Инициализация решений
  initializeDecisions() {
    const decisionsGrid = document.querySelector('.decisions-grid');
    if (!decisionsGrid) return;
    
    // Очищаем сетку
    decisionsGrid.innerHTML = '';
    
    // Создаем решения из данных
    const decisions = window.BUSINESS_QUEST_DATA?.decisions || [
      {
        id: 'decision1',
        title: 'Инвестировать в маркетинг',
        description: 'Увеличить рекламный бюджет для привлечения новых клиентов',
        impact: { revenue: '+15%', risk: 'Средний' }
      },
      {
        id: 'decision2',
        title: 'Расширить команду',
        description: 'Нанять дополнительных специалистов для роста',
        impact: { revenue: '+25%', risk: 'Высокий' }
      },
      {
        id: 'decision3',
        title: 'Оптимизировать процессы',
        description: 'Улучшить внутренние бизнес-процессы',
        impact: { revenue: '+10%', risk: 'Низкий' }
      },
      {
        id: 'decision4',
        title: 'Развивать партнерства',
        description: 'Найти стратегических партнеров',
        impact: { revenue: '+20%', risk: 'Средний' }
      }
    ];
    
    decisions.forEach(decision => {
      const decisionCard = this.createDecisionCard(decision);
      decisionsGrid.appendChild(decisionCard);
    });
  }
  
  // Создание карточки решения
  createDecisionCard(decision) {
    const card = document.createElement('div');
    card.className = 'decision-card';
    card.dataset.decisionId = decision.id;
    
    card.innerHTML = `
      <div class="decision-title">${decision.title}</div>
      <div class="decision-description">${decision.description}</div>
      <div class="decision-impact">
        <span>Доход: ${decision.impact.revenue}</span>
        <span>Риск: ${decision.impact.risk}</span>
      </div>
    `;
    
    card.addEventListener('click', () => {
      this.applyDecision(decision);
      
      // Показываем анимацию
      card.classList.add('success-animation');
      setTimeout(() => card.classList.remove('success-animation'), 600);
    });
    
    return card;
  }
  
  // Инициализация результатов
  initializeResults() {
    const finishQuestBtn = document.getElementById('finishQuest');
    if (finishQuestBtn) {
      finishQuestBtn.addEventListener('click', () => this.finishQuest());
    }
  }
  
  // Инициализация прогресс-бара
  initializeProgressBar() {
    // Скрываем прогресс-бар изначально
    const questProgress = document.querySelector('.quest-progress');
    if (questProgress) {
      questProgress.style.display = 'none';
    }
  }
  
  // Основные функции квеста
  startQuest() {
    // Скрываем вступительное модальное окно
    this.hideIntroModal();
    
    // Показываем основной контент
    const questContent = document.querySelector('.quest-content');
    if (questContent) {
      questContent.style.display = 'block';
    }
    
    // Показываем прогресс-бар
    const questProgress = document.querySelector('.quest-progress');
    if (questProgress) {
      questProgress.style.display = 'block';
    }
    
    // Показываем первый этап
    this.showStage(1);
    
    this.showToast('🚀 Квест начался! Выберите нишу для вашего бизнеса.', 'success');
  }
  
  // Выбор ниши
  selectNiche(card) {
    // Убираем выделение со всех карточек
    const allCards = document.querySelectorAll('.niche-card');
    allCards.forEach(c => c.classList.remove('selected'));
    
    // Выделяем выбранную карточку
    card.classList.add('selected');
    
    // Сохраняем выбранную нишу
    this.selectedNiche = card.dataset.niche;
    
    // Активируем кнопку выбора
    const selectBtn = document.getElementById('selectNiche');
    if (selectBtn) {
      selectBtn.disabled = false;
      selectBtn.classList.add('success-animation');
      setTimeout(() => selectBtn.classList.remove('success-animation'), 600);
    }
    
    // Показываем toast
    const nicheName = card.querySelector('h3').textContent;
    this.showToast(`Выбрана ниша: ${nicheName}`, 'success');
  }
  
  // Подтверждение выбора ниши
  confirmNicheSelection() {
    if (!this.selectedNiche) {
      this.showToast('Сначала выберите нишу!', 'error');
      return;
    }
    
    // Переходим ко второму этапу
    this.showStage(2);
    
    this.showToast('✅ Ниша выбрана! Теперь соберите команду.', 'success');
  }
  
  // Завершение подбора команды
  completeTeamSelection() {
    const dropZones = document.querySelectorAll('.candidate-drop-zone');
    let filledPositions = 0;
    
    dropZones.forEach(zone => {
      if (zone.querySelector('.candidate-card')) {
        filledPositions++;
      }
    });
    
    if (filledPositions < 4) {
      this.showToast('Нужно заполнить все должности!', 'error');
      return;
    }
    
    // Переходим к третьему этапу
    this.showStage(3);
    
    this.showToast('👥 Команда собрана! Теперь управляйте бизнесом.', 'success');
  }
  
  // Следующий квартал
  nextQuarter() {
    // Обновляем статистику
    this.businessStats.revenue += this.businessStats.revenue * 0.1; // +10% к доходу
    this.businessStats.growth += 5; // +5% к росту
    this.businessStats.reputation += 2; // +2 к репутации
    
    // Обновляем отображение
    this.updateBusinessStats();
    
    // Показываем toast
    this.showToast('📈 Квартал завершен! Бизнес растет.', 'success');
    
    // Проверяем, можно ли перейти к результатам
    if (this.businessStats.revenue >= 100000) {
      setTimeout(() => {
        this.showStage(4);
        this.showToast('🏆 Цель достигнута! Переходим к результатам.', 'success');
      }, 1000);
    }
  }
  
  // Завершение квеста
  finishQuest() {
    // Обновляем финальную статистику
    this.updateFinalStats();
    
    // Показываем toast
    this.showToast('🎉 Квест завершен! Поздравляем с успешным бизнесом!', 'success');
    
    // Возвращаемся к основным квестам
    setTimeout(() => {
      this.goBack();
    }, 2000);
  }
  
  // Показать этап
  showStage(stageNumber) {
    // Скрываем все этапы
    const stages = document.querySelectorAll('.quest-stage');
    stages.forEach(stage => stage.classList.remove('active'));
    
    // Показываем нужный этап
    const targetStage = document.getElementById(this.getStageId(stageNumber));
    if (targetStage) {
      targetStage.classList.add('active');
    }
    
    // Обновляем прогресс
    this.updateProgress(stageNumber);
    
    // Обновляем текущий этап
    this.currentStage = stageNumber;
  }
  
  // Получить ID этапа
  getStageId(stageNumber) {
    const stageIds = {
      1: 'nicheSelection',
      2: 'teamSelection',
      3: 'businessManagement',
      4: 'results'
    };
    return stageIds[stageNumber] || 'nicheSelection';
  }
  
  // Обновление прогресса
  updateProgress(stageNumber) {
    const progressFill = document.getElementById('progressFill');
    const steps = document.querySelectorAll('.step');
    
    if (progressFill) {
      progressFill.style.width = `${stageNumber * 25}%`;
    }
    
    steps.forEach((step, index) => {
      const stepNumber = index + 1;
      
      if (stepNumber < stageNumber) {
        step.classList.add('completed');
        step.classList.remove('active');
      } else if (stepNumber === stageNumber) {
        step.classList.add('active');
        step.classList.remove('completed');
      } else {
        step.classList.remove('active', 'completed');
      }
    });
  }
  
  // Обновление бизнес-статистики
  updateBusinessStats() {
    const revenueEl = document.getElementById('revenue');
    const growthEl = document.getElementById('growth');
    const teamSizeEl = document.getElementById('teamSize');
    const reputationEl = document.getElementById('reputation');
    
    if (revenueEl) revenueEl.textContent = `${this.businessStats.revenue.toLocaleString()} ₽`;
    if (growthEl) growthEl.textContent = `${this.businessStats.growth}%`;
    if (teamSizeEl) teamSizeEl.textContent = this.businessStats.teamSize;
    if (reputationEl) reputationEl.textContent = this.businessStats.reputation;
  }
  
  // Обновление финальной статистики
  updateFinalStats() {
    const finalRevenue = document.getElementById('finalRevenue');
    const finalTeamSize = document.getElementById('finalTeamSize');
    const finalReputation = document.getElementById('finalReputation');
    const finalGrowth = document.getElementById('finalGrowth');
    
    if (finalRevenue) finalRevenue.textContent = `${this.businessStats.revenue.toLocaleString()} ₽`;
    if (finalTeamSize) finalTeamSize.textContent = this.businessStats.teamSize;
    if (finalReputation) finalReputation.textContent = this.businessStats.reputation;
    if (finalGrowth) finalGrowth.textContent = `${this.businessStats.growth}%`;
  }
  
  // Применение решения
  applyDecision(decision) {
    // Обновляем статистику на основе решения
    if (decision.impact.revenue.includes('+')) {
      const increase = parseInt(decision.impact.revenue);
      this.businessStats.revenue += this.businessStats.revenue * (increase / 100);
      this.businessStats.growth += increase;
    }
    
    if (decision.impact.risk === 'Низкий') {
      this.businessStats.reputation += 5;
    } else if (decision.impact.risk === 'Средний') {
      this.businessStats.reputation += 3;
    } else {
      this.businessStats.reputation += 1;
    }
    
    // Обновляем отображение
    this.updateBusinessStats();
    
    // Показываем toast
    this.showToast(`Решение применено: ${decision.title}`, 'success');
  }
  
  // Drag & Drop обработчики
  handleDragStart(e) {
    e.target.classList.add('dragging');
    e.dataTransfer.setData('text/plain', e.target.dataset.candidateId);
    e.dataTransfer.effectAllowed = 'move';
  }
  
  handleDragEnd(e) {
    e.target.classList.remove('dragging');
  }
  
  handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }
  
  handleDragEnter(e) {
    e.preventDefault();
    const dropZone = e.target.closest('.candidate-drop-zone');
    if (dropZone) {
      dropZone.classList.add('drag-over');
    }
  }
  
  handleDragLeave(e) {
    const dropZone = e.target.closest('.candidate-drop-zone');
    if (dropZone) {
      dropZone.classList.remove('drag-over');
    }
  }
  
  handleDrop(e) {
    e.preventDefault();
    const dropZone = e.target.closest('.candidate-drop-zone');
    const candidateId = e.dataTransfer.getData('text/plain');
    const candidateCard = document.querySelector(`[data-candidate-id="${candidateId}"]`);
    
    if (dropZone && candidateCard) {
      // Убираем классы drag-over
      dropZone.classList.remove('drag-over');
      
      // Проверяем, что позиция свободна
      if (!dropZone.querySelector('.candidate-card')) {
        // Клонируем карточку кандидата
        const clonedCard = candidateCard.cloneNode(true);
        clonedCard.draggable = false;
        clonedCard.classList.remove('dragging');
        
        // Добавляем кнопку удаления
        const removeBtn = document.createElement('button');
        removeBtn.className = 'btn ghost';
        removeBtn.innerHTML = '❌ Убрать';
        removeBtn.style.fontSize = '12px';
        removeBtn.style.padding = '4px 8px';
        removeBtn.addEventListener('click', () => {
          clonedCard.remove();
          this.updateTeamStatus();
        });
        
        clonedCard.appendChild(removeBtn);
        
        // Очищаем drop zone
        dropZone.innerHTML = '';
        dropZone.appendChild(clonedCard);
        
        // Обновляем статус команды
        this.updateTeamStatus();
        
        // Показываем toast
        const positionTitle = dropZone.closest('.position-slot').querySelector('.position-title').textContent;
        this.showToast(`Кандидат назначен на должность: ${positionTitle}`, 'success');
      } else {
        this.showToast('Эта должность уже занята!', 'error');
      }
    }
  }
  
  // Обновление статуса команды
  updateTeamStatus() {
    const dropZones = document.querySelectorAll('.candidate-drop-zone');
    let filledPositions = 0;
    
    dropZones.forEach(zone => {
      if (zone.querySelector('.candidate-card')) {
        zone.closest('.position-slot').classList.add('filled');
        filledPositions++;
      } else {
        zone.closest('.position-slot').classList.remove('filled');
      }
    });
    
    // Активируем кнопку завершения команды
    const completeTeamBtn = document.getElementById('completeTeam');
    if (completeTeamBtn) {
      completeTeamBtn.disabled = filledPositions < 4;
    }
    
    // Обновляем статистику
    this.businessStats.teamSize = filledPositions;
    this.updateBusinessStats();
  }
  
  // Показать вступительное модальное окно
  showIntroModal() {
    const introModal = document.getElementById('introModal');
    if (introModal) {
      introModal.classList.add('show');
    }
  }
  
  // Скрыть вступительное модальное окно
  hideIntroModal() {
    const introModal = document.getElementById('introModal');
    if (introModal) {
      introModal.classList.remove('show');
    }
  }
  
  // Возврат назад
  goBack() {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '../quests.html';
    }
  }
  
  // Показать toast уведомление
  showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    // Очищаем предыдущее содержимое
    toast.innerHTML = '';
    
    // Добавляем иконку в зависимости от типа
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';
    if (type === 'warning') icon = '⚠️';
    
    // Устанавливаем содержимое
    toast.innerHTML = `${icon} ${message}`;
    
    // Добавляем классы в зависимости от типа
    toast.className = `toast ${type}`;
    
    // Показываем toast
    toast.classList.add('show');
    
    // Скрываем через 3 секунды
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }
  
  // Получить прогресс квеста
  getQuestProgress() {
    return {
      currentStage: this.currentStage,
      selectedNiche: this.selectedNiche,
      teamMembers: this.teamMembers,
      businessStats: this.businessStats,
      isCompleted: this.currentStage === 4
    };
  }
}

// Создаем экземпляр UI при загрузке страницы
let businessUI = null;

document.addEventListener('DOMContentLoaded', function() {
  businessUI = new BusinessQuestUI();
});

// Экспортируем для использования в других модулях
window.BusinessQuestUI = BusinessQuestUI;
window.businessUI = businessUI;

console.log('Business Quest UI system loaded successfully!');
