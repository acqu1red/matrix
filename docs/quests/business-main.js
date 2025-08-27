/* ====== BUSINESS QUEST MAIN LOGIC ====== */

// Состояние квеста
let questState = {
  currentStage: 1,
  selectedNiche: null,
  team: [],
  decisions: {},
  scaling: {},
  isCompleted: false
};

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
  initializeQuest();
  setupEventListeners();
});

// Инициализация квеста
function initializeQuest() {
  console.log('🏢 Инициализация квеста "Твой первый бизнес"');
  
  // Показываем первый этап
  showStage(1);
  
  // Обновляем статус
  updateBusinessStatus();
}

// Настройка обработчиков событий
function setupEventListeners() {
  // Кнопка "Начать бизнес"
  const startBusinessBtn = document.getElementById('startBusiness');
  if (startBusinessBtn) {
    startBusinessBtn.addEventListener('click', startBusiness);
  }

  // Кнопка "Назад"
  const backBtn = document.getElementById('btnBack');
  if (backBtn) {
    backBtn.addEventListener('click', goBack);
  }

  // Кнопки подтверждения этапов
  const confirmNicheBtn = document.getElementById('confirmNiche');
  if (confirmNicheBtn) {
    confirmNicheBtn.addEventListener('click', confirmNiche);
  }

  const confirmTeamBtn = document.getElementById('confirmTeam');
  if (confirmTeamBtn) {
    confirmTeamBtn.addEventListener('click', confirmTeam);
  }

  const confirmDecisionsBtn = document.getElementById('confirmDecisions');
  if (confirmDecisionsBtn) {
    confirmDecisionsBtn.addEventListener('click', confirmDecisions);
  }

  const finishBusinessBtn = document.getElementById('finishBusiness');
  if (finishBusinessBtn) {
    finishBusinessBtn.addEventListener('click', finishBusiness);
  }

  // Кнопка возврата к квестам
  const backToQuestsBtn = document.getElementById('backToQuests');
  if (backToQuestsBtn) {
    backToQuestsBtn.addEventListener('click', backToQuests);
  }
}

// Начать бизнес
function startBusiness() {
  console.log('🚀 Начинаем бизнес!');
  
  // Скрываем модал введения
  const introModal = document.getElementById('introModal');
  if (introModal) {
    introModal.classList.remove('show');
  }

  // Показываем основной интерфейс
  const businessInterface = document.getElementById('businessInterface');
  if (businessInterface) {
    businessInterface.style.display = 'block';
  }

  // Показываем первый этап
  showStage(1);
  
  // Обновляем статус
  updateBusinessStatus();
}

// Показать этап
function showStage(stageNumber) {
  console.log(`📋 Показываем этап ${stageNumber}`);
  
  // Скрываем все этапы
  const stages = document.querySelectorAll('.quest-stage');
  stages.forEach(stage => {
    stage.classList.remove('active');
  });

  // Показываем нужный этап
  const targetStage = document.getElementById(`stage${stageNumber}`);
  if (targetStage) {
    targetStage.classList.add('active');
    
    // Добавляем анимацию появления
    targetStage.classList.add('slide-in-right');
    setTimeout(() => {
      targetStage.classList.remove('slide-in-right');
    }, 600);
  }

  // Обновляем состояние
  questState.currentStage = stageNumber;
  updateBusinessStatus();

  // Загружаем контент этапа
  loadStageContent(stageNumber);
}

// Загрузить контент этапа
function loadStageContent(stageNumber) {
  switch (stageNumber) {
    case 1:
      loadNicheSelection();
      break;
    case 2:
      loadTeamBuilding();
      break;
    case 3:
      loadBusinessDecisions();
      break;
    case 4:
      loadScalingOptions();
      break;
  }
}

// Этап 1: Выбор ниши
function loadNicheSelection() {
  console.log('🎯 Загружаем выбор ниши');
  
  const nichesGrid = document.querySelector('.niches-grid');
  if (!nichesGrid) return;

  // Очищаем сетку
  nichesGrid.innerHTML = '';

  // Добавляем карточки ниш
  BUSINESS_NICHES.forEach(niche => {
    const nicheCard = createNicheCard(niche);
    nichesGrid.appendChild(nicheCard);
  });
}

// Создать карточку ниши
function createNicheCard(niche) {
  const card = document.createElement('div');
  card.className = 'niche-card';
  card.dataset.nicheId = niche.id;
  
  card.innerHTML = `
    <div class="niche-header">
      <div class="niche-icon">${niche.icon}</div>
      <div class="niche-info">
        <h3>${niche.name}</h3>
        <div class="niche-category">${niche.category}</div>
      </div>
    </div>
    
    <div class="niche-description">${niche.description}</div>
    
    <div class="niche-metrics">
      <div class="metric-item">
        <div class="metric-label">Стартовые затраты</div>
        <div class="metric-value">$${niche.metrics.startupCost.toLocaleString()}</div>
      </div>
      <div class="metric-item">
        <div class="metric-label">Доход/мес</div>
        <div class="metric-value">$${niche.metrics.monthlyRevenue.toLocaleString()}</div>
      </div>
      <div class="metric-item">
        <div class="metric-label">Конкуренция</div>
        <div class="metric-value">${niche.metrics.competition}</div>
      </div>
      <div class="metric-item">
        <div class="metric-label">Рост</div>
        <div class="metric-value">${niche.metrics.growth}</div>
      </div>
    </div>
    
    <div class="niche-requirements">
      <div class="requirements-title">Требуемые роли:</div>
      <div class="requirements-list">
        ${niche.requiredRoles.map(role => 
          `<span class="requirement-tag">${getRoleDisplayName(role)}</span>`
        ).join('')}
      </div>
    </div>
  `;

  // Добавляем обработчик клика
  card.addEventListener('click', () => selectNiche(niche.id));
  
  return card;
}

// Выбрать нишу
function selectNiche(nicheId) {
  console.log(`🎯 Выбрана ниша: ${nicheId}`);
  
  // Убираем выделение со всех карточек
  const allCards = document.querySelectorAll('.niche-card');
  allCards.forEach(card => card.classList.remove('selected'));
  
  // Выделяем выбранную карточку
  const selectedCard = document.querySelector(`[data-niche-id="${nicheId}"]`);
  if (selectedCard) {
    selectedCard.classList.add('selected');
    
    // Добавляем анимацию выбора
    selectedCard.classList.add('scale-in');
    setTimeout(() => {
      selectedCard.classList.remove('scale-in');
    }, 600);
  }

  // Сохраняем выбор
  questState.selectedNiche = nicheId;
  
  // Активируем кнопку подтверждения
  const confirmBtn = document.getElementById('confirmNiche');
  if (confirmBtn) {
    confirmBtn.disabled = false;
  }
}

// Подтвердить выбор ниши
function confirmNiche() {
  if (!questState.selectedNiche) return;
  
  console.log(`✅ Подтвержден выбор ниши: ${questState.selectedNiche}`);
  
  // Переходим к следующему этапу
  showStage(2);
}

// Этап 2: Формирование команды
function loadTeamBuilding() {
  console.log('👥 Загружаем формирование команды');
  
  const candidatesGrid = document.getElementById('candidatesGrid');
  const teamGrid = document.getElementById('teamGrid');
  
  if (!candidatesGrid || !teamGrid) return;

  // Очищаем сетки
  candidatesGrid.innerHTML = '';
  teamGrid.innerHTML = '';

  // Добавляем placeholder для команды
  teamGrid.innerHTML = `
    <div class="team-placeholder">
      <div class="placeholder-icon">👥</div>
      <div class="placeholder-text">Перетащите сюда сотрудников</div>
    </div>
  `;

  // Добавляем кандидатов
  CANDIDATES_DATABASE.forEach(candidate => {
    const candidateCard = createCandidateCard(candidate);
    candidatesGrid.appendChild(candidateCard);
  });

  // Настраиваем drag & drop
  setupDragAndDrop();
}

// Создать карточку кандидата
function createCandidateCard(candidate) {
  const card = document.createElement('div');
  card.className = 'candidate-card';
  card.dataset.candidateId = candidate.id;
  card.draggable = true;
  
  card.innerHTML = `
    <div class="candidate-avatar">${candidate.avatar}</div>
    <div class="candidate-name">${candidate.name}</div>
    <div class="candidate-role">${getRoleDisplayName(candidate.role)}</div>
  `;

  return card;
}

// Настроить drag & drop
function setupDragAndDrop() {
  const candidateCards = document.querySelectorAll('.candidate-card');
  const teamGrid = document.getElementById('teamGrid');

  candidateCards.forEach(card => {
    card.addEventListener('dragstart', handleDragStart);
    card.addEventListener('dragend', handleDragEnd);
  });

  if (teamGrid) {
    teamGrid.addEventListener('dragover', handleDragOver);
    teamGrid.addEventListener('drop', handleDrop);
  }
}

// Обработчики drag & drop
function handleDragStart(e) {
  e.dataTransfer.setData('text/plain', e.target.dataset.candidateId);
  e.target.classList.add('dragging');
}

function handleDragEnd(e) {
  e.target.classList.remove('dragging');
}

function handleDragOver(e) {
  e.preventDefault();
  e.currentTarget.classList.add('drag-over');
}

function handleDrop(e) {
  e.preventDefault();
  e.currentTarget.classList.remove('drag-over');
  
  const candidateId = e.dataTransfer.getData('text/plain');
  const candidate = CANDIDATES_DATABASE.find(c => c.id === candidateId);
  
  if (candidate && questState.team.length < BUSINESS_CONFIG.maxEmployees) {
    addTeamMember(candidate);
  }
}

// Добавить члена команды
function addTeamMember(candidate) {
  if (questState.team.length >= BUSINESS_CONFIG.maxEmployees) {
    showToast('Достигнут лимит сотрудников!', 'warning');
    return;
  }

  // Проверяем, не нанят ли уже этот кандидат
  if (questState.team.some(member => member.id === candidate.id)) {
    showToast('Этот кандидат уже в команде!', 'warning');
    return;
  }

  console.log(`👥 Добавляем в команду: ${candidate.name}`);
  
  questState.team.push(candidate);
  
  // Обновляем отображение команды
  updateTeamDisplay();
  
  // Обновляем статус
  updateBusinessStatus();
  
  // Активируем кнопку подтверждения, если команда не пустая
  const confirmBtn = document.getElementById('confirmTeam');
  if (confirmBtn) {
    confirmBtn.disabled = questState.team.length === 0;
  }
}

// Обновить отображение команды
function updateTeamDisplay() {
  const teamGrid = document.getElementById('teamGrid');
  if (!teamGrid) return;

  // Очищаем команду
  teamGrid.innerHTML = '';

  if (questState.team.length === 0) {
    // Показываем placeholder
    teamGrid.innerHTML = `
      <div class="team-placeholder">
        <div class="placeholder-icon">👥</div>
        <div class="placeholder-text">Перетащите сюда сотрудников</div>
      </div>
    `;
    return;
  }

  // Добавляем членов команды
  questState.team.forEach(member => {
    const memberElement = createTeamMemberElement(member);
    teamGrid.appendChild(memberElement);
  });
}

// Создать элемент члена команды
function createTeamMemberElement(member) {
  const element = document.createElement('div');
  element.className = 'team-member';
  
  element.innerHTML = `
    <div class="team-member-avatar">${member.avatar}</div>
    <div class="team-member-info">
      <div class="team-member-name">${member.name}</div>
      <div class="team-member-role">${getRoleDisplayName(member.role)}</div>
    </div>
    <button class="team-member-remove" onclick="removeTeamMember('${member.id}')">✕</button>
  `;

  return element;
}

// Убрать члена команды
function removeTeamMember(memberId) {
  const memberIndex = questState.team.findIndex(m => m.id === memberId);
  if (memberIndex === -1) return;

  const removedMember = questState.team.splice(memberIndex, 1)[0];
  console.log(`❌ Убираем из команды: ${removedMember.name}`);
  
  // Обновляем отображение
  updateTeamDisplay();
  
  // Обновляем статус
  updateBusinessStatus();
  
  // Деактивируем кнопку подтверждения, если команда пустая
  const confirmBtn = document.getElementById('confirmTeam');
  if (confirmBtn) {
    confirmBtn.disabled = questState.team.length === 0;
  }
}

// Подтвердить команду
function confirmTeam() {
  if (questState.team.length === 0) return;
  
  console.log(`✅ Подтверждена команда из ${questState.team.length} человек`);
  
  // Переходим к следующему этапу
  showStage(3);
}

// Этап 3: Решения по бизнесу
function loadBusinessDecisions() {
  console.log('🚀 Загружаем решения по бизнесу');
  
  const decisionCards = document.querySelector('.decision-cards');
  if (!decisionCards) return;

  // Очищаем карточки
  decisionCards.innerHTML = '';

  // Создаем карточки решений
  const decisions = generateBusinessDecisions();
  
  decisions.forEach(decision => {
    const decisionCard = createDecisionCard(decision);
    decisionCards.appendChild(decisionCard);
  });
}

// Создать карточку решения
function createDecisionCard(decision) {
  const card = document.createElement('div');
  card.className = 'decision-card';
  card.dataset.decisionId = decision.id;
  
  card.innerHTML = `
    <div class="decision-header">
      <div class="decision-icon">${decision.icon}</div>
      <div class="decision-title">${decision.title}</div>
    </div>
    
    <div class="decision-description">${decision.description}</div>
    
    <div class="decision-options">
      ${decision.options.map(option => `
        <div class="decision-option" data-option="${option.value}">
          ${option.label}
        </div>
      `).join('')}
    </div>
  `;

  // Добавляем обработчики для опций
  const options = card.querySelectorAll('.decision-option');
  options.forEach(option => {
    option.addEventListener('click', () => selectDecisionOption(decision.id, option.dataset.option));
  });

  return card;
}

// Выбрать опцию решения
function selectDecisionOption(decisionId, optionValue) {
  console.log(`🎯 Выбрана опция для решения ${decisionId}: ${optionValue}`);
  
  // Убираем выделение со всех опций в этом решении
  const decisionCard = document.querySelector(`[data-decision-id="${decisionId}"]`);
  if (decisionCard) {
    const options = decisionCard.querySelectorAll('.decision-option');
    options.forEach(opt => opt.classList.remove('selected'));
    
    // Выделяем выбранную опцию
    const selectedOption = decisionCard.querySelector(`[data-option="${optionValue}"]`);
    if (selectedOption) {
      selectedOption.classList.add('selected');
    }
  }

  // Сохраняем выбор
  questState.decisions[decisionId] = optionValue;
  
  // Проверяем, все ли решения приняты
  checkDecisionsComplete();
}

// Проверить, все ли решения приняты
function checkDecisionsComplete() {
  const decisions = generateBusinessDecisions();
  const allDecisionsMade = decisions.every(decision => 
    questState.decisions[decision.id]
  );

  // Активируем кнопку подтверждения
  const confirmBtn = document.getElementById('confirmDecisions');
  if (confirmBtn) {
    confirmBtn.disabled = !allDecisionsMade;
  }
}

// Подтвердить решения
function confirmDecisions() {
  console.log('✅ Подтверждены решения по бизнесу');
  
  // Переходим к следующему этапу
  showStage(4);
}

// Этап 4: Масштабирование
function loadScalingOptions() {
  console.log('📈 Загружаем опции масштабирования');
  
  const scalingOptions = document.querySelector('.scaling-options');
  if (!scalingOptions) return;

  // Очищаем опции
  scalingOptions.innerHTML = '';

  // Создаем сетку опций
  const scalingGrid = document.createElement('div');
  scalingGrid.className = 'scaling-grid';
  
  const scalingOptionsList = generateScalingOptions();
  
  scalingOptionsList.forEach(option => {
    const scalingCard = createScalingCard(option);
    scalingGrid.appendChild(scalingCard);
  });

  scalingOptions.appendChild(scalingGrid);
}

// Создать карточку масштабирования
function createScalingCard(option) {
  const card = document.createElement('div');
  card.className = 'scaling-card';
  card.dataset.scalingId = option.id;
  
  card.innerHTML = `
    <div class="scaling-header">
      <div class="scaling-icon">${option.icon}</div>
      <div class="scaling-title">${option.title}</div>
    </div>
    
    <div class="scaling-description">${option.description}</div>
    
    <div class="scaling-cost">
      <div class="cost-label">Стоимость:</div>
      <div class="cost-value">$${option.cost.toLocaleString()}</div>
    </div>
  `;

  // Добавляем обработчик клика
  card.addEventListener('click', () => selectScalingOption(option.id));
  
  return card;
}

// Выбрать опцию масштабирования
function selectScalingOption(scalingId) {
  console.log(`📈 Выбрана опция масштабирования: ${scalingId}`);
  
  // Убираем выделение со всех карточек
  const allCards = document.querySelectorAll('.scaling-card');
  allCards.forEach(card => card.classList.remove('selected'));
  
  // Выделяем выбранную карточку
  const selectedCard = document.querySelector(`[data-scaling-id="${scalingId}"]`);
  if (selectedCard) {
    selectedCard.classList.add('selected');
  }

  // Сохраняем выбор
  questState.scaling = scalingId;
  
  // Активируем кнопку завершения
  const finishBtn = document.getElementById('finishBusiness');
  if (finishBtn) {
    finishBtn.disabled = false;
  }
}

// Завершить бизнес
function finishBusiness() {
  console.log('🏆 Завершаем бизнес!');
  
  // Рассчитываем результаты
  const results = calculateBusinessResults();
  
  // Показываем результаты
  showQuestResults(results);
  
  // Отмечаем квест как завершенный
  questState.isCompleted = true;
}

// Показать результаты квеста
function showQuestResults(results) {
  // Скрываем все этапы
  const stages = document.querySelectorAll('.quest-stage');
  stages.forEach(stage => stage.style.display = 'none');
  
  // Показываем результаты
  const resultsSection = document.getElementById('questResults');
  if (resultsSection) {
    resultsSection.style.display = 'block';
    
    // Заполняем результаты
    const resultsSummary = resultsSection.querySelector('.results-summary');
    if (resultsSummary) {
      resultsSummary.innerHTML = `
        <div class="results-stats">
          <div class="result-stat">
            <div class="result-label">Выбранная ниша:</div>
            <div class="result-value">${results.niche}</div>
          </div>
          <div class="result-stat">
            <div class="result-label">Размер команды:</div>
            <div class="result-value">${results.teamSize} человек</div>
          </div>
          <div class="result-stat">
            <div class="result-label">Принятые решения:</div>
            <div class="result-value">${results.decisionsCount}</div>
          </div>
          <div class="result-stat">
            <div class="result-label">Масштабирование:</div>
            <div class="result-value">${results.scaling}</div>
          </div>
          <div class="result-stat">
            <div class="result-label">Итоговая оценка:</div>
            <div class="result-value">${results.finalScore}/100</div>
          </div>
        </div>
      `;
    }
  }
}

// Рассчитать результаты бизнеса
function calculateBusinessResults() {
  const niche = BUSINESS_NICHES.find(n => n.id === questState.selectedNiche);
  const teamSize = questState.team.length;
  const decisionsCount = Object.keys(questState.decisions).length;
  const scaling = questState.scaling || 'Не выбрано';
  
  // Простая формула оценки
  let score = 50; // Базовый балл
  
  // Бонус за размер команды
  score += teamSize * 5;
  
  // Бонус за принятые решения
  score += decisionsCount * 10;
  
  // Бонус за масштабирование
  if (scaling !== 'Не выбрано') {
    score += 20;
  }
  
  // Ограничиваем максимальным баллом
  score = Math.min(score, 100);
  
  return {
    niche: niche ? niche.name : 'Не выбрано',
    teamSize,
    decisionsCount,
    scaling,
    finalScore: score
  };
}

// Обновить статус бизнеса
function updateBusinessStatus() {
  // Обновляем этап
  const currentStageEl = document.getElementById('currentStage');
  if (currentStageEl) {
    currentStageEl.textContent = `${questState.currentStage}/4`;
  }

  // Обновляем капитал
  const currentCapitalEl = document.getElementById('currentCapital');
  if (currentCapitalEl) {
    const capital = BUSINESS_CONFIG.startingCapital;
    currentCapitalEl.textContent = `$${capital.toLocaleString()}`;
  }

  // Обновляем сотрудников
  const currentEmployeesEl = document.getElementById('currentEmployees');
  if (currentEmployeesEl) {
    currentEmployeesEl.textContent = `${questState.team.length}/${BUSINESS_CONFIG.maxEmployees}`;
  }

  // Обновляем доход
  const currentRevenueEl = document.getElementById('currentRevenue');
  if (currentRevenueEl) {
    const revenue = calculateMonthlyRevenue();
    currentRevenueEl.textContent = `$${revenue.toLocaleString()}`;
  }
}

// Рассчитать месячный доход
function calculateMonthlyRevenue() {
  if (!questState.selectedNiche || questState.team.length === 0) {
    return 0;
  }

  const niche = BUSINESS_NICHES.find(n => n.id === questState.selectedNiche);
  if (!niche) return 0;

  // Базовый доход от ниши
  let revenue = niche.metrics.monthlyRevenue;
  
  // Бонус за команду
  revenue += questState.team.length * 1000;
  
  // Бонус за решения
  const decisionsBonus = Object.keys(questState.decisions).length * 500;
  revenue += decisionsBonus;
  
  return revenue;
}

// Вспомогательные функции
function getRoleDisplayName(role) {
  const roleNames = {
    'marketing': 'Маркетинг',
    'sales': 'Продажи',
    'tech': 'IT/Техника',
    'finance': 'Финансы',
    'operations': 'Операции',
    'hr': 'HR',
    'legal': 'Юридический отдел',
    'creative': 'Креатив',
    'analytics': 'Аналитика'
  };
  
  return roleNames[role] || role;
}

function generateBusinessDecisions() {
  return [
    {
      id: 'marketing_strategy',
      icon: '📢',
      title: 'Маркетинговая стратегия',
      description: 'Выберите основной канал привлечения клиентов для вашего бизнеса.',
      options: [
        { value: 'social_media', label: 'Социальные сети' },
        { value: 'google_ads', label: 'Google Ads' },
        { value: 'content_marketing', label: 'Контент-маркетинг' },
        { value: 'influencers', label: 'Работа с инфлюенсерами' }
      ]
    },
    {
      id: 'pricing_model',
      icon: '💰',
      title: 'Ценовая политика',
      description: 'Определите стратегию ценообразования для ваших продуктов/услуг.',
      options: [
        { value: 'premium', label: 'Премиум цены' },
        { value: 'competitive', label: 'Конкурентные цены' },
        { value: 'penetration', label: 'Цены проникновения' },
        { value: 'dynamic', label: 'Динамическое ценообразование' }
      ]
    },
    {
      id: 'customer_service',
      icon: '🎧',
      title: 'Обслуживание клиентов',
      description: 'Выберите подход к работе с клиентами и их поддержке.',
      options: [
        { value: '24_7', label: '24/7 поддержка' },
        { value: 'business_hours', label: 'В рабочее время' },
        { value: 'chatbot', label: 'Чат-бот + люди' },
        { value: 'self_service', label: 'Самообслуживание' }
      ]
    }
  ];
}

function generateScalingOptions() {
  return [
    {
      id: 'new_markets',
      icon: '🌍',
      title: 'Выход на новые рынки',
      description: 'Расширение бизнеса в другие города или страны.',
      cost: 50000
    },
    {
      id: 'product_line',
      icon: '📦',
      title: 'Расширение продуктовой линейки',
      description: 'Добавление новых продуктов или услуг к существующему портфелю.',
      cost: 30000
    },
    {
      id: 'technology_upgrade',
      icon: '⚡',
      title: 'Технологическое обновление',
      description: 'Внедрение новых технологий для повышения эффективности.',
      cost: 40000
    },
    {
      id: 'acquisition',
      icon: '🏢',
      title: 'Поглощение конкурентов',
      description: 'Приобретение других компаний для быстрого роста.',
      cost: 100000
    }
  ];
}

// Навигация
function goBack() {
  if (questState.currentStage > 1) {
    showStage(questState.currentStage - 1);
  } else {
    // Возвращаемся к введению
    const introModal = document.getElementById('introModal');
    const businessInterface = document.getElementById('businessInterface');
    
    if (introModal) introModal.classList.add('show');
    if (businessInterface) businessInterface.style.display = 'none';
  }
}

function backToQuests() {
  window.location.href = '../quests.html';
}

// Утилиты
function showToast(message, type = 'info') {
  console.log(`📢 ${message}`);
  // Здесь можно добавить визуальное отображение toast
}

// Экспорт для использования в других модулях
window.BusinessQuest = {
  questState,
  showStage,
  selectNiche,
  addTeamMember,
  removeTeamMember,
  selectDecisionOption,
  selectScalingOption
};
