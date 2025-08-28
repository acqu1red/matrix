/* ===== BUSINESS QUEST MAIN LOGIC ===== */

// Глобальное состояние приложения
const appState = {
  currentStage: 1,
  selectedNiche: null,
  teamMembers: {},
  businessStats: {
    revenue: 0,
    growth: 0,
    teamSize: 0,
    reputation: 0
  },
  decisions: [],
  isInitialized: false
};

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
});

// Основная инициализация
function initializeApp() {
  if (appState.isInitialized) return;
  
  // Инициализация Telegram WebApp
  if (window.Telegram && window.Telegram.WebApp) {
    window.Telegram.WebApp.expand();
    window.Telegram.WebApp.enableClosingConfirmation();
  }
  
  // Настройка событий
  setupEventListeners();
  
  // Инициализация перетаскивания
  initializeDragAndDrop();
  
  // Загрузка данных
  loadQuestData();
  
  appState.isInitialized = true;
  console.log('Business Quest initialized successfully');
}

// Настройка обработчиков событий
function setupEventListeners() {
  // Кнопка "Назад"
  const btnBack = document.getElementById('btnBack');
  if (btnBack) {
    btnBack.addEventListener('click', goBack);
  }
  
  // Кнопка "Начать квест"
  const startQuest = document.getElementById('startQuest');
  if (startQuest) {
    startQuest.addEventListener('click', startQuestHandler);
  }
  
  // Кнопка "Выбрать нишу"
  const selectNiche = document.getElementById('selectNiche');
  if (selectNiche) {
    selectNiche.addEventListener('click', selectNicheHandler);
  }
  
  // Кнопка "Завершить подбор"
  const completeTeam = document.getElementById('completeTeam');
  if (completeTeam) {
    completeTeam.addEventListener('click', completeTeamHandler);
  }
  
  // Кнопка "Следующий квартал"
  const nextQuarter = document.getElementById('nextQuarter');
  if (nextQuarter) {
    nextQuarter.addEventListener('click', nextQuarterHandler);
  }
  
  // Кнопка "Завершить квест"
  const finishQuest = document.getElementById('finishQuest');
  if (finishQuest) {
    finishQuest.addEventListener('click', finishQuestHandler);
  }
  
  // Обработчики для выбора ниши
  setupNicheSelection();
}

// Настройка выбора ниши
function setupNicheSelection() {
  const nicheCards = document.querySelectorAll('.niche-card');
  nicheCards.forEach(card => {
    card.addEventListener('click', function() {
      // Убираем выделение со всех карточек
      nicheCards.forEach(c => c.classList.remove('selected'));
      
      // Выделяем выбранную
      this.classList.add('selected');
      
      // Сохраняем выбранную нишу
      appState.selectedNiche = this.dataset.niche;
      
      // Активируем кнопку
      const selectNicheBtn = document.getElementById('selectNiche');
      if (selectNicheBtn) {
        selectNicheBtn.disabled = false;
      }
      
      // Анимация выбора
      this.style.animation = 'successPulse 0.5s ease-out';
      setTimeout(() => {
        this.style.animation = '';
      }, 500);
    });
  });
}

// Инициализация drag & drop
function initializeDragAndDrop() {
  // Создаем кандидатов
  createCandidates();
  
  // Настраиваем перетаскивание
  setupDragAndDrop();
}

// Создание кандидатов
function createCandidates() {
  const candidatesGrid = document.querySelector('.candidates-grid');
  if (!candidatesGrid) return;
  
  const candidates = [
    { id: 'candidate1', name: 'Алексей', skills: 'Лидерство, Организация', avatar: '👨‍💼' },
    { id: 'candidate2', name: 'Мария', skills: 'Креативность, Аналитика', avatar: '👩‍🎨' },
    { id: 'candidate3', name: 'Дмитрий', skills: 'Математика, Планирование', avatar: '👨‍💻' },
    { id: 'candidate4', name: 'Анна', skills: 'Экспертиза, Опыт', avatar: '👩‍🔬' },
    { id: 'candidate5', name: 'Сергей', skills: 'Коммуникация, Продажи', avatar: '👨‍💼' },
    { id: 'candidate6', name: 'Елена', skills: 'Дизайн, UX/UI', avatar: '👩‍🎨' }
  ];
  
  candidates.forEach(candidate => {
    const candidateCard = document.createElement('div');
    candidateCard.className = 'candidate-card';
    candidateCard.dataset.candidateId = candidate.id;
    candidateCard.draggable = true;
    
    candidateCard.innerHTML = `
      <div class="candidate-avatar">${candidate.avatar}</div>
      <div class="candidate-name">${candidate.name}</div>
      <div class="candidate-skills">${candidate.skills}</div>
    `;
    
    candidatesGrid.appendChild(candidateCard);
  });
}

// Настройка drag & drop
function setupDragAndDrop() {
  const candidateCards = document.querySelectorAll('.candidate-card');
  const dropZones = document.querySelectorAll('.candidate-drop-zone');
  
  // Обработчики для кандидатов
  candidateCards.forEach(card => {
    card.addEventListener('dragstart', handleDragStart);
    card.addEventListener('dragend', handleDragEnd);
  });
  
  // Обработчики для зон сброса
  dropZones.forEach(zone => {
    zone.addEventListener('dragover', handleDragOver);
    zone.addEventListener('drop', handleDrop);
    zone.addEventListener('dragenter', handleDragEnter);
    zone.addEventListener('dragleave', handleDragLeave);
  });
}

// Обработчики drag & drop
function handleDragStart(e) {
  e.target.classList.add('dragging');
  e.dataTransfer.setData('text/plain', e.target.dataset.candidateId);
  e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(e) {
  e.target.classList.remove('dragging');
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
}

function handleDragEnter(e) {
  e.preventDefault();
  e.target.closest('.candidate-drop-zone').classList.add('drag-over');
}

function handleDragLeave(e) {
  if (!e.target.closest('.candidate-drop-zone')) {
    e.target.closest('.candidate-drop-zone').classList.remove('drag-over');
  }
}

function handleDrop(e) {
  e.preventDefault();
  const dropZone = e.target.closest('.candidate-drop-zone');
  const candidateId = e.dataTransfer.getData('text/plain');
  const candidateCard = document.querySelector(`[data-candidate-id="${candidateId}"]`);
  
  if (dropZone && candidateCard) {
    // Проверяем, не занята ли уже позиция
    if (dropZone.classList.contains('filled')) {
      showToast('Эта позиция уже занята!', 'warning');
      return;
    }
    
    // Размещаем кандидата
    placeCandidate(candidateCard, dropZone);
    
    // Проверяем, можно ли завершить подбор
    checkTeamCompletion();
  }
  
  // Убираем классы drag-over
  document.querySelectorAll('.candidate-drop-zone').forEach(zone => {
    zone.classList.remove('drag-over');
  });
}

// Размещение кандидата на позиции
function placeCandidate(candidateCard, dropZone) {
  const position = dropZone.dataset.position;
  const candidateId = candidateCard.dataset.candidateId;
  
  // Сохраняем в состоянии
  appState.teamMembers[position] = candidateId;
  
  // Обновляем зону сброса
  dropZone.classList.add('filled');
  dropZone.innerHTML = `
    <div class="candidate-in-position">
      <div class="candidate-avatar">${candidateCard.querySelector('.candidate-avatar').textContent}</div>
      <div class="candidate-name">${candidateCard.querySelector('.candidate-name').textContent}</div>
    </div>
  `;
  
  // Скрываем кандидата
  candidateCard.style.display = 'none';
  
  // Анимация успеха
  dropZone.style.animation = 'successPulse 0.5s ease-out';
  setTimeout(() => {
    dropZone.style.animation = '';
  }, 500);
  
  showToast(`Кандидат размещен на позиции "${getPositionTitle(position)}"!`, 'success');
}

// Получение названия позиции
function getPositionTitle(position) {
  const titles = {
    manager: 'Менеджер',
    marketer: 'Маркетолог',
    financier: 'Финансист',
    specialist: 'Специалист'
  };
  return titles[position] || position;
}

// Проверка завершения подбора команды
function checkTeamCompletion() {
  const requiredPositions = ['manager', 'marketer', 'financier', 'specialist'];
  const filledPositions = requiredPositions.filter(pos => appState.teamMembers[pos]);
  
  if (filledPositions.length === requiredPositions.length) {
    const completeTeamBtn = document.getElementById('completeTeam');
    if (completeTeamBtn) {
      completeTeamBtn.disabled = false;
      completeTeamBtn.style.animation = 'successPulse 1s ease-out infinite';
    }
  }
}

// Обработчики кнопок
function startQuestHandler() {
  hideIntroModal();
  showStage(1);
  updateProgress();
}

function selectNicheHandler() {
  if (!appState.selectedNiche) {
    showToast('Сначала выберите нишу!', 'warning');
    return;
  }
  
  showStage(2);
  updateProgress();
  showToast(`Выбрана ниша: ${getNicheTitle(appState.selectedNiche)}!`, 'success');
}

function completeTeamHandler() {
  if (Object.keys(appState.teamMembers).length < 4) {
    showToast('Нужно заполнить все позиции!', 'warning');
    return;
  }
  
  showStage(3);
  updateProgress();
  initializeBusinessManagement();
  showToast('Команда собрана! Теперь управляйте бизнесом!', 'success');
}

function nextQuarterHandler() {
  // Логика управления бизнесом
  processBusinessDecisions();
  updateBusinessStats();
  
  // Проверяем, можно ли перейти к результатам
  if (appState.businessStats.revenue >= 1000000) {
    showStage(4);
    updateProgress();
    showFinalResults();
  } else {
    showToast('Бизнес развивается! Продолжайте принимать решения.', 'info');
  }
}

function finishQuestHandler() {
  // Награды за прохождение
  const rewards = {
    mulacoin: 3,
    xp: 200,
    achievement: 'Предприниматель'
  };
  
  // Здесь можно добавить логику сохранения наград
  showToast(`Поздравляем! Получено ${rewards.mulacoin} MULACOIN и ${rewards.xp} XP!`, 'success');
  
  // Возврат к главной странице
  setTimeout(() => {
    goBack();
  }, 2000);
}

// Показать этап
function showStage(stageNumber) {
  // Скрываем все этапы
  document.querySelectorAll('.quest-stage').forEach(stage => {
    stage.classList.remove('active');
  });
  
  // Показываем нужный этап
  const targetStage = document.getElementById(getStageId(stageNumber));
  if (targetStage) {
    targetStage.classList.add('active');
  }
  
  // Обновляем состояние
  appState.currentStage = stageNumber;
  
  // Обновляем прогресс
  updateProgress();
}

// Получение ID этапа
function getStageId(stageNumber) {
  const stageIds = {
    1: 'nicheSelection',
    2: 'teamSelection',
    3: 'businessManagement',
    4: 'results'
  };
  return stageIds[stageNumber];
}

// Обновление прогресса
function updateProgress() {
  const progressFill = document.getElementById('progressFill');
  const steps = document.querySelectorAll('.step');
  
  if (progressFill) {
    const progress = (appState.currentStage / 4) * 100;
    progressFill.style.width = `${progress}%`;
  }
  
  // Обновляем шаги
  steps.forEach((step, index) => {
    const stepNumber = index + 1;
    step.classList.remove('active', 'completed');
    
    if (stepNumber < appState.currentStage) {
      step.classList.add('completed');
    } else if (stepNumber === appState.currentStage) {
      step.classList.add('active');
    }
  });
}

// Инициализация управления бизнесом
function initializeBusinessManagement() {
  // Создаем карточки решений
  createDecisionCards();
  
  // Обновляем статистику
  updateBusinessStats();
}

// Создание карточек решений
function createDecisionCards() {
  const decisionsGrid = document.querySelector('.decisions-grid');
  if (!decisionsGrid) return;
  
  const decisions = [
    {
      id: 'marketing',
      title: 'Маркетинговая кампания',
      description: 'Инвестировать в рекламу для привлечения клиентов',
      icon: '📢',
      cost: 50000,
      effect: { revenue: 100000, reputation: 10 }
    },
    {
      id: 'training',
      title: 'Обучение команды',
      description: 'Повысить квалификацию сотрудников',
      icon: '🎓',
      cost: 30000,
      effect: { growth: 15, reputation: 5 }
    },
    {
      id: 'equipment',
      title: 'Новое оборудование',
      description: 'Модернизировать производство',
      icon: '⚙️',
      cost: 100000,
      effect: { growth: 25, revenue: 150000 }
    },
    {
      id: 'partnership',
      title: 'Партнерство',
      description: 'Найти стратегических партнеров',
      icon: '🤝',
      cost: 20000,
      effect: { reputation: 20, growth: 10 }
    }
  ];
  
  decisions.forEach(decision => {
    const decisionCard = document.createElement('div');
    decisionCard.className = 'decision-card';
    decisionCard.dataset.decisionId = decision.id;
    
    decisionCard.innerHTML = `
      <div class="decision-icon">${decision.icon}</div>
      <div class="decision-title">${decision.title}</div>
      <div class="decision-description">${decision.description}</div>
      <div class="decision-cost">Стоимость: ${decision.cost.toLocaleString()} ₽</div>
    `;
    
    decisionCard.addEventListener('click', () => selectDecision(decision));
    decisionsGrid.appendChild(decisionCard);
  });
}

// Выбор решения
function selectDecision(decision) {
  // Проверяем, достаточно ли средств
  if (appState.businessStats.revenue < decision.cost) {
    showToast('Недостаточно средств для этого решения!', 'warning');
    return;
  }
  
  // Применяем эффект решения
  appState.businessStats.revenue -= decision.cost;
  appState.businessStats.revenue += decision.effect.revenue || 0;
  appState.businessStats.growth += decision.effect.growth || 0;
  appState.businessStats.reputation += decision.effect.reputation || 0;
  
  // Сохраняем решение
  appState.decisions.push(decision);
  
  // Обновляем отображение
  updateBusinessStats();
  
  // Анимация выбора
  const decisionCard = document.querySelector(`[data-decision-id="${decision.id}"]`);
  if (decisionCard) {
    decisionCard.classList.add('selected');
    decisionCard.style.animation = 'successPulse 0.5s ease-out';
    setTimeout(() => {
      decisionCard.style.animation = '';
    }, 500);
  }
  
  showToast(`Решение "${decision.title}" принято!`, 'success');
}

// Обработка решений бизнеса
function processBusinessDecisions() {
  // Автоматический рост на основе решений
  if (appState.decisions.length > 0) {
    appState.businessStats.growth += 5;
    appState.businessStats.revenue += appState.businessStats.growth * 1000;
    appState.businessStats.reputation += 2;
  }
  
  // Случайные события
  const randomEvent = Math.random();
  if (randomEvent < 0.3) {
    // Положительное событие
    appState.businessStats.revenue += 50000;
    appState.businessStats.reputation += 5;
    showToast('Удачное стечение обстоятельств! +50,000 ₽', 'success');
  } else if (randomEvent < 0.5) {
    // Негативное событие
    appState.businessStats.revenue -= 30000;
    appState.businessStats.reputation -= 3;
    showToast('Неожиданные расходы! -30,000 ₽', 'warning');
  }
}

// Обновление статистики бизнеса
function updateBusinessStats() {
  const revenueEl = document.getElementById('revenue');
  const growthEl = document.getElementById('growth');
  const teamSizeEl = document.getElementById('teamSize');
  const reputationEl = document.getElementById('reputation');
  
  if (revenueEl) revenueEl.textContent = `${appState.businessStats.revenue.toLocaleString()} ₽`;
  if (growthEl) growthEl.textContent = `${appState.businessStats.growth}%`;
  if (teamSizeEl) teamSizeEl.textContent = Object.keys(appState.teamMembers).length;
  if (reputationEl) reputationEl.textContent = appState.businessStats.reputation;
}

// Показать финальные результаты
function showFinalResults() {
  const finalRevenue = document.getElementById('finalRevenue');
  const finalTeamSize = document.getElementById('finalTeamSize');
  const finalReputation = document.getElementById('finalReputation');
  const finalGrowth = document.getElementById('finalGrowth');
  
  if (finalRevenue) finalRevenue.textContent = `${appState.businessStats.revenue.toLocaleString()} ₽`;
  if (finalTeamSize) finalTeamSize.textContent = Object.keys(appState.teamMembers).length;
  if (finalReputation) finalReputation.textContent = appState.businessStats.reputation;
  if (finalGrowth) finalGrowth.textContent = `${appState.businessStats.growth}%`;
}

// Получение названия ниши
function getNicheTitle(niche) {
  const titles = {
    tech: 'Технологии',
    food: 'Ресторанный бизнес',
    fashion: 'Мода и стиль',
    education: 'Образование'
  };
  return titles[niche] || niche;
}

// Скрытие вводного модала
function hideIntroModal() {
  const introModal = document.getElementById('introModal');
  if (introModal) {
    introModal.classList.remove('show');
  }
}

// Показать toast уведомление
function showToast(message, type = 'info') {
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

// Возврат назад
function goBack() {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    // Если нет истории, переходим на главную страницу квестов
    window.location.href = '../quests.html';
  }
}

// Загрузка данных квеста
function loadQuestData() {
  // Здесь можно загрузить данные из localStorage или API
  const savedState = localStorage.getItem('businessQuestState');
  if (savedState) {
    try {
      const parsed = JSON.parse(savedState);
      Object.assign(appState, parsed);
    } catch (e) {
      console.error('Error loading quest state:', e);
    }
  }
}

// Сохранение состояния квеста
function saveQuestState() {
  try {
    localStorage.setItem('businessQuestState', JSON.stringify(appState));
  } catch (e) {
    console.error('Error saving quest state:', e);
  }
}

// Автосохранение при изменении состояния
setInterval(saveQuestState, 5000);

// Экспорт для использования в других файлах
window.businessQuest = {
  appState,
  showStage,
  updateProgress,
  showToast,
  placeCandidate,
  selectDecision
};
