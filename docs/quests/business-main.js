/* ===== BUSINESS QUEST MAIN - OPTIMIZED FOR MINIAPPS ===== */

// Глобальные переменные
let businessEngine = null;
let businessUI = null;
let currentStage = 1;
let selectedNiche = null;
let teamMembers = {};
let businessStats = {
  revenue: 0,
  growth: 0,
  teamSize: 0,
  reputation: 0
};

// Данные для постов канала (заглушка)
const CHANNEL_POSTS = [
  {
    id: 1,
    title: '5 секретов успешного предпринимателя',
    excerpt: 'Узнайте, как построить прибыльный бизнес с нуля и стать лидером в своей нише...',
    date: '2 часа назад',
    views: '1.2K',
    likes: '89'
  },
  {
    id: 2,
    title: 'Инвестиционные стратегии 2024',
    excerpt: 'Анализ лучших инвестиционных возможностей года и стратегии для начинающих инвесторов...',
    date: '5 часов назад',
    views: '856',
    likes: '67'
  },
  {
    id: 3,
    title: 'Как собрать сильную команду',
    excerpt: 'Пошаговое руководство по найму лучших специалистов и созданию эффективной команды...',
    date: '1 день назад',
    views: '2.1K',
    likes: '156'
  },
  {
    id: 4,
    title: 'Маркетинг в цифровую эпоху',
    excerpt: 'Современные методы продвижения бизнеса в интернете и социальных сетях...',
    date: '2 дня назад',
    views: '1.8K',
    likes: '134'
  }
];

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Инициализация квеста "Твой первый бизнес"...');
  
  try {
    // Инициализируем компоненты
    initializeQuest();
    
    console.log('✅ Бизнес-квест успешно инициализирован');
    
  } catch (error) {
    console.error('❌ Ошибка инициализации квеста:', error);
    showErrorMessage('Произошла ошибка при загрузке квеста. Попробуйте перезагрузить страницу.');
  }
});

// Основная инициализация квеста
function initializeQuest() {
  // Инициализируем UI элементы
  initializeUI();
  
  // Инициализируем drag & drop
  initializeDragAndDrop();
  
  // Инициализируем обработчики событий
  initializeEventHandlers();
  
  // Инициализируем ленту активности
  initializeActivityFeed();
  
  // Показываем вступительное модальное окно
  showIntroModal();
}

// Инициализация UI элементов
function initializeUI() {
  // Кнопка "Начать квест"
  const startQuestBtn = document.getElementById('startQuest');
  if (startQuestBtn) {
    startQuestBtn.addEventListener('click', startQuest);
  }
  
  // Кнопка "Назад"
  const backBtn = document.getElementById('btnBack');
  if (backBtn) {
    backBtn.addEventListener('click', goBack);
  }
  
  // Кнопки этапов
  const selectNicheBtn = document.getElementById('selectNiche');
  if (selectNicheBtn) {
    selectNicheBtn.addEventListener('click', confirmNicheSelection);
  }
  
  const completeTeamBtn = document.getElementById('completeTeam');
  if (completeTeamBtn) {
    completeTeamBtn.addEventListener('click', completeTeamSelection);
  }
  
  const nextQuarterBtn = document.getElementById('nextQuarter');
  if (nextQuarterBtn) {
    nextQuarterBtn.addEventListener('click', nextQuarter);
  }
  
  const finishQuestBtn = document.getElementById('finishQuest');
  if (finishQuestBtn) {
    finishQuestBtn.addEventListener('click', finishQuest);
  }
  
  // Инициализируем карточки ниш
  initializeNicheCards();
  
  // Инициализируем кандидатов
  initializeCandidates();
  
  // Инициализируем решения
  initializeDecisions();
  
  // Инициализируем инструменты
  initializeTools();
  
  // Инициализируем достижения
  initializeAchievements();
}

// Инициализация карточек ниш
function initializeNicheCards() {
  const nicheCards = document.querySelectorAll('.niche-card');
  
  nicheCards.forEach(card => {
    card.addEventListener('click', function() {
      // Убираем выделение со всех карточек
      nicheCards.forEach(c => c.classList.remove('selected'));
      
      // Выделяем выбранную карточку
      this.classList.add('selected');
      
      // Сохраняем выбранную нишу
      selectedNiche = this.dataset.niche;
      
      // Активируем кнопку выбора
      const selectBtn = document.getElementById('selectNiche');
      if (selectBtn) {
        selectBtn.disabled = false;
        selectBtn.classList.add('success-animation');
        setTimeout(() => selectBtn.classList.remove('success-animation'), 600);
      }
      
      // Показываем toast
      showToast(`Выбрана ниша: ${this.querySelector('h3').textContent}`, 'success');
    });
  });
}

// Инициализация кандидатов
function initializeCandidates() {
  const candidatesGrid = document.querySelector('.candidates-grid');
  if (!candidatesGrid) return;
  
  // Очищаем сетку
  candidatesGrid.innerHTML = '';
  
  // Создаем кандидатов
  const candidates = [
    { id: 'candidate1', name: 'Алексей Петров', skills: 'Лидерство, Организация', avatar: '👨‍💼' },
    { id: 'candidate2', name: 'Мария Сидорова', skills: 'Креативность, Аналитика', avatar: '👩‍🎨' },
    { id: 'candidate3', name: 'Дмитрий Козлов', skills: 'Математика, Планирование', avatar: '👨‍💻' },
    { id: 'candidate4', name: 'Анна Волкова', skills: 'Экспертиза, Опыт', avatar: '👩‍🔬' }
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

// Инициализация решений
function initializeDecisions() {
  const decisionsGrid = document.querySelector('.decisions-grid');
  if (!decisionsGrid) return;
  
  // Очищаем сетку
  decisionsGrid.innerHTML = '';
  
  // Создаем решения
  const decisions = [
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
    const decisionCard = document.createElement('div');
    decisionCard.className = 'decision-card';
    decisionCard.dataset.decisionId = decision.id;
    
    decisionCard.innerHTML = `
      <div class="decision-title">${decision.title}</div>
      <div class="decision-description">${decision.description}</div>
      <div class="decision-impact">
        <span>Доход: ${decision.impact.revenue}</span>
        <span>Риск: ${decision.impact.risk}</span>
      </div>
    `;
    
    decisionCard.addEventListener('click', function() {
      // Применяем решение
      applyDecision(decision);
      
      // Показываем анимацию
      this.classList.add('success-animation');
      setTimeout(() => this.classList.remove('success-animation'), 600);
    });
    
    decisionsGrid.appendChild(decisionCard);
  });
}

// Инициализация инструментов
function initializeTools() {
  const toolCards = document.querySelectorAll('.tool-card .btn');
  
  toolCards.forEach(btn => {
    btn.addEventListener('click', function() {
      const toolName = this.closest('.tool-card').querySelector('h3').textContent;
      showToast(`Инструмент "${toolName}" будет доступен в полной версии!`, 'info');
    });
  });
}

// Инициализация достижений
function initializeAchievements() {
  // Обновляем прогресс достижений
  updateAchievementsProgress();
}

// Обновление прогресса достижений
function updateAchievementsProgress() {
  // Первый шаг - всегда завершен
  const firstStepProgress = document.querySelector('.achievement-card:nth-child(1) .progress-fill');
  if (firstStepProgress) {
    firstStepProgress.style.width = '100%';
  }
  
  // Командостроитель
  const teamBuilderProgress = document.querySelector('.achievement-card:nth-child(2) .progress-fill');
  const teamBuilderText = document.querySelector('.achievement-card:nth-child(2) .progress-text');
  if (teamBuilderProgress && teamBuilderText) {
    const progress = (businessStats.teamSize / 4) * 100;
    teamBuilderProgress.style.width = `${progress}%`;
    teamBuilderText.textContent = `${businessStats.teamSize}/4`;
  }
  
  // Миллионер
  const millionaireProgress = document.querySelector('.achievement-card:nth-child(3) .progress-fill');
  const millionaireText = document.querySelector('.achievement-card:nth-child(3) .progress-text');
  if (millionaireProgress && millionaireText) {
    const progress = Math.min((businessStats.revenue / 100000) * 100, 100);
    millionaireProgress.style.width = `${progress}%`;
    millionaireText.textContent = `${businessStats.revenue.toLocaleString()}/100,000`;
  }
  
  // Предприниматель
  const entrepreneurProgress = document.querySelector('.achievement-card:nth-child(4) .progress-fill');
  const entrepreneurText = document.querySelector('.achievement-card:nth-child(4) .progress-text');
  if (entrepreneurProgress && entrepreneurText) {
    const progress = (currentStage / 4) * 100;
    entrepreneurProgress.style.width = `${progress}%`;
    entrepreneurText.textContent = `${currentStage}/4 этапа`;
  }
}

// Инициализация ленты активности
function initializeActivityFeed() {
  const joinChannelBtn = document.getElementById('joinChannel');
  
  if (joinChannelBtn) {
    joinChannelBtn.addEventListener('click', joinChannel);
  }
  
  // Загружаем посты
  loadChannelPosts();
}

// Присоединение к каналу
function joinChannel() {
  // Открываем канал в Telegram
  if (window.Telegram && window.Telegram.WebApp) {
    window.Telegram.WebApp.openTelegramLink('https://t.me/+1001928787715');
  } else {
    // Fallback для браузера
    window.open('https://t.me/+1001928787715', '_blank');
  }
  
  showToast('Переходим в канал "Бизнес & Успех"!', 'success');
}

// Загрузка постов канала
function loadChannelPosts() {
  const postsContainer = document.getElementById('postsContainer');
  if (!postsContainer) return;
  
  // Имитируем загрузку
  setTimeout(() => {
    postsContainer.innerHTML = '';
    
    CHANNEL_POSTS.forEach(post => {
      const postCard = createPostCard(post);
      postsContainer.appendChild(postCard);
    });
  }, 1500);
}

// Создание карточки поста
function createPostCard(post) {
  const postCard = document.createElement('div');
  postCard.className = 'post-card glass';
  
  postCard.innerHTML = `
    <div class="post-header">
      <h4>${post.title}</h4>
      <span class="post-date">${post.date}</span>
    </div>
    <p class="post-excerpt">${post.excerpt}</p>
    <div class="post-stats">
      <span class="post-views">👁️ ${post.views}</span>
      <span class="post-likes">❤️ ${post.likes}</span>
    </div>
  `;
  
  postCard.addEventListener('click', () => {
    // Открываем пост в канале
    joinChannel();
  });
  
  return postCard;
}

// Инициализация drag & drop
function initializeDragAndDrop() {
  const candidateCards = document.querySelectorAll('.candidate-card');
  const dropZones = document.querySelectorAll('.candidate-drop-zone');
  
  candidateCards.forEach(card => {
    card.addEventListener('dragstart', handleDragStart);
    card.addEventListener('dragend', handleDragEnd);
  });
  
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
  const dropZone = e.target.closest('.candidate-drop-zone');
  if (dropZone) {
    dropZone.classList.add('drag-over');
  }
}

function handleDragLeave(e) {
  const dropZone = e.target.closest('.candidate-drop-zone');
  if (dropZone) {
    dropZone.classList.remove('drag-over');
  }
}

function handleDrop(e) {
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
      clonedCard.classList.add('assigned-candidate');
      
      // Добавляем кнопку удаления
      const removeBtn = document.createElement('button');
      removeBtn.className = 'btn ghost remove-candidate-btn';
      removeBtn.innerHTML = '❌ Убрать';
      removeBtn.style.fontSize = '12px';
      removeBtn.style.padding = '4px 8px';
      removeBtn.style.marginTop = '10px';
      removeBtn.addEventListener('click', function() {
        clonedCard.remove();
        updateTeamStatus();
      });
      
      // Очищаем drop zone и добавляем кандидата
      dropZone.innerHTML = '';
      dropZone.appendChild(clonedCard);
      dropZone.appendChild(removeBtn);
      
      // Добавляем визуальное подтверждение
      dropZone.classList.add('has-candidate');
      
      // Обновляем статус команды
      updateTeamStatus();
      
      // Показываем toast
      const positionTitle = dropZone.closest('.position-slot').querySelector('.position-title').textContent;
      showToast(`Кандидат назначен на должность: ${positionTitle}`, 'success');
      
      // Добавляем анимацию успеха
      dropZone.style.animation = 'successDrop 0.6s ease-in-out';
      setTimeout(() => {
        dropZone.style.animation = '';
      }, 600);
    } else {
      showToast('Эта должность уже занята!', 'error');
    }
  }
}

// Обновление статуса команды
function updateTeamStatus() {
  const dropZones = document.querySelectorAll('.candidate-drop-zone');
  let filledPositions = 0;
  
  dropZones.forEach(zone => {
    if (zone.querySelector('.candidate-card')) {
      zone.closest('.position-slot').classList.add('filled');
      zone.classList.add('has-candidate');
      filledPositions++;
    } else {
      zone.closest('.position-slot').classList.remove('filled');
      zone.classList.remove('has-candidate');
    }
  });
  
  // Активируем кнопку завершения команды
  const completeTeamBtn = document.getElementById('completeTeam');
  if (completeTeamBtn) {
    completeTeamBtn.disabled = filledPositions < 4;
    
    // Добавляем визуальную обратную связь
    if (filledPositions === 4) {
      completeTeamBtn.classList.add('ready-animation');
      setTimeout(() => completeTeamBtn.classList.remove('ready-animation'), 1000);
    }
  }
  
  // Обновляем статистику
  businessStats.teamSize = filledPositions;
  updateBusinessStats();
  updateAchievementsProgress();
}

// Обновление бизнес-статистики
function updateBusinessStats() {
  const revenueEl = document.getElementById('revenue');
  const growthEl = document.getElementById('growth');
  const teamSizeEl = document.getElementById('teamSize');
  const reputationEl = document.getElementById('reputation');
  
  if (revenueEl) revenueEl.textContent = `${businessStats.revenue.toLocaleString()} ₽`;
  if (growthEl) growthEl.textContent = `${businessStats.growth}%`;
  if (teamSizeEl) teamSizeEl.textContent = businessStats.teamSize;
  if (reputationEl) reputationEl.textContent = businessStats.reputation;
}

// Применение решения
function applyDecision(decision) {
  // Обновляем статистику на основе решения
  if (decision.impact.revenue.includes('+')) {
    const increase = parseInt(decision.impact.revenue);
    businessStats.revenue += businessStats.revenue * (increase / 100);
    businessStats.growth += increase;
  }
  
  if (decision.impact.risk === 'Низкий') {
    businessStats.reputation += 5;
  } else if (decision.impact.risk === 'Средний') {
    businessStats.reputation += 3;
  } else {
    businessStats.reputation += 1;
  }
  
  // Обновляем отображение
  updateBusinessStats();
  updateAchievementsProgress();
  
  // Показываем toast
  showToast(`Решение применено: ${decision.title}`, 'success');
}

// Обработчики событий
function initializeEventHandlers() {
  // Обработчик ошибок
  window.addEventListener('error', function(event) {
    console.error('Глобальная ошибка:', event.error);
    showToast('Произошла ошибка. Проверьте консоль для деталей.', 'error');
  });
  
  // Обработчик необработанных промисов
  window.addEventListener('unhandledrejection', function(event) {
    console.error('Необработанный промис:', event.reason);
    showToast('Произошла асинхронная ошибка.', 'error');
  });
  
  // Обработчики модальных окон
  const closePrizesModal = document.getElementById('closePrizesModal');
  
  if (closePrizesModal) {
    closePrizesModal.addEventListener('click', () => {
      document.getElementById('prizesModal').classList.remove('show');
    });
  }
  
  // Закрытие модалов по клику вне их
  window.addEventListener('click', function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
      if (event.target === modal) {
        modal.classList.remove('show');
      }
    });
  });
}

// Основные функции квеста
function startQuest() {
  // Скрываем вступительное модальное окно
  const introModal = document.getElementById('introModal');
  if (introModal) {
    introModal.classList.remove('show');
  }
  
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
  showStage(1);
  
  showToast('🚀 Квест начался! Выберите нишу для вашего бизнеса.', 'success');
}

function confirmNicheSelection() {
  if (!selectedNiche) {
    showToast('Сначала выберите нишу!', 'error');
    return;
  }
  
  // Переходим ко второму этапу
  showStage(2);
  
  showToast('✅ Ниша выбрана! Теперь соберите команду.', 'success');
}

function completeTeamSelection() {
  const dropZones = document.querySelectorAll('.candidate-drop-zone');
  let filledPositions = 0;
  
  dropZones.forEach(zone => {
    if (zone.querySelector('.candidate-card')) {
      filledPositions++;
    }
  });
  
  if (filledPositions < 4) {
    showToast('Нужно заполнить все должности!', 'error');
    return;
  }
  
  // Переходим к третьему этапу
  showStage(3);
  
  showToast('👥 Команда собрана! Теперь управляйте бизнесом.', 'success');
}

function nextQuarter() {
  // Обновляем статистику
  businessStats.revenue += businessStats.revenue * 0.1; // +10% к доходу
  businessStats.growth += 5; // +5% к росту
  businessStats.reputation += 2; // +2 к репутации
  
  // Обновляем отображение
  updateBusinessStats();
  updateAchievementsProgress();
  
  // Показываем toast
  showToast('📈 Квартал завершен! Бизнес растет.', 'success');
  
  // Проверяем, можно ли перейти к результатам
  if (businessStats.revenue >= 100000) {
    setTimeout(() => {
      showStage(4);
      showToast('🏆 Цель достигнута! Переходим к результатам.', 'success');
    }, 1000);
  }
}

function finishQuest() {
  // Обновляем финальную статистику
  updateFinalStats();
  
  // Показываем toast
  showToast('🎉 Квест завершен! Поздравляем с успешным бизнесом!', 'success');
  
  // Возвращаемся к основным квестам
  setTimeout(() => {
    goBack();
  }, 2000);
}

// Показать этап
function showStage(stageNumber) {
  // Скрываем все этапы
  const stages = document.querySelectorAll('.quest-stage');
  stages.forEach(stage => stage.classList.remove('active'));
  
  // Показываем нужный этап
  const targetStage = document.getElementById(getStageId(stageNumber));
  if (targetStage) {
    targetStage.classList.add('active');
  }
  
  // Обновляем прогресс
  updateProgress(stageNumber);
  
  // Обновляем текущий этап
  currentStage = stageNumber;
  
  // Обновляем достижения
  updateAchievementsProgress();
}

// Получить ID этапа
function getStageId(stageNumber) {
  const stageIds = {
    1: 'nicheSelection',
    2: 'teamSelection',
    3: 'businessManagement',
    4: 'results'
  };
  return stageIds[stageNumber] || 'nicheSelection';
}

// Обновление прогресса
function updateProgress(stageNumber) {
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

// Обновление финальной статистики
function updateFinalStats() {
  const finalRevenue = document.getElementById('finalRevenue');
  const finalTeamSize = document.getElementById('finalTeamSize');
  const finalReputation = document.getElementById('finalReputation');
  const finalGrowth = document.getElementById('finalGrowth');
  
  if (finalRevenue) finalRevenue.textContent = `${businessStats.revenue.toLocaleString()} ₽`;
  if (finalTeamSize) finalTeamSize.textContent = businessStats.teamSize;
  if (finalReputation) finalReputation.textContent = businessStats.reputation;
  if (finalGrowth) finalGrowth.textContent = `${businessStats.growth}%`;
}

// Показать вступительное модальное окно
function showIntroModal() {
  const introModal = document.getElementById('introModal');
  if (introModal) {
    introModal.classList.add('show');
  }
}

// Возврат назад
function goBack() {
  // Здесь можно добавить логику возврата к основным квестам
  if (window.history.length > 1) {
    window.history.back();
  } else {
    // Если нет истории, переходим на главную страницу квестов
    window.location.href = '../quests.html';
  }
}

// Показать toast уведомление
function showToast(message, type = 'info') {
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

// Показать сообщение об ошибке
function showErrorMessage(message) {
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(255, 68, 68, 0.9);
    color: white;
    padding: 20px;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    z-index: 10000;
    max-width: 400px;
    text-align: center;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  `;
  
  errorDiv.innerHTML = `
    <div style="margin-bottom: 16px;">⚠️ Ошибка</div>
    <div style="margin-bottom: 20px; font-weight: 400;">${message}</div>
    <button onclick="location.reload()" style="
      background: white;
      color: #ff4444;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
    ">Перезагрузить</button>
  `;
  
  document.body.appendChild(errorDiv);
}

// Функции для интеграции с основной системой квестов
function getQuestProgress() {
  return {
    currentStage: currentStage,
    selectedNiche: selectedNiche,
    teamMembers: teamMembers,
    businessStats: businessStats,
    isCompleted: currentStage === 4
  };
}

// Экспортируем функции для совместимости
window.businessQuest = {
  getQuestProgress,
  showToast,
  goBack
};

console.log('Business Quest system initialized successfully!');
