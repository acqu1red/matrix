/* ====== BUSINESS QUEST ENGINE ====== */

// Игровой движок для квеста "Твой первый бизнес"
class BusinessQuestEngine {
  constructor() {
    this.gameState = {
      currentStage: 1,
      selectedNiche: null,
      team: [],
      decisions: {},
      scaling: {},
      finances: {
        capital: 50000,
        monthlyExpenses: 0,
        monthlyRevenue: 0,
        profit: 0
      },
      metrics: {
        teamEfficiency: 0,
        marketPosition: 0,
        innovationLevel: 0,
        customerSatisfaction: 0
      },
      isCompleted: false
    };

    this.config = BUSINESS_CONFIG;
    this.niches = BUSINESS_NICHES;
    this.candidates = CANDIDATES_DATABASE;
    
    this.init();
  }

  // Инициализация движка
  init() {
    console.log('⚙️ Инициализация игрового движка');
    this.setupEventListeners();
    this.updateDisplay();
  }

  // Настройка обработчиков событий
  setupEventListeners() {
    // Обработчики для этапов
    this.setupStageEventListeners();
    
    // Обработчики для взаимодействий
    this.setupInteractionEventListeners();
    
    // Обработчики для анимаций
    this.setupAnimationEventListeners();
  }

  // Настройка обработчиков этапов
  setupStageEventListeners() {
    // Кнопка подтверждения ниши
    const confirmNicheBtn = document.getElementById('confirmNiche');
    if (confirmNicheBtn) {
      confirmNicheBtn.addEventListener('click', () => this.confirmNiche());
    }

    // Кнопка подтверждения команды
    const confirmTeamBtn = document.getElementById('confirmTeam');
    if (confirmTeamBtn) {
      confirmTeamBtn.addEventListener('click', () => this.confirmTeam());
    }

    // Кнопка подтверждения решений
    const confirmDecisionsBtn = document.getElementById('confirmDecisions');
    if (confirmDecisionsBtn) {
      confirmDecisionsBtn.addEventListener('click', () => this.confirmDecisions());
    }

    // Кнопка завершения бизнеса
    const finishBusinessBtn = document.getElementById('finishBusiness');
    if (finishBusinessBtn) {
      finishBusinessBtn.addEventListener('click', () => this.finishBusiness());
    }
  }

  // Настройка обработчиков взаимодействий
  setupInteractionEventListeners() {
    // Обработчики для карточек ниш
    this.setupNicheCardListeners();
    
    // Обработчики для кандидатов
    this.setupCandidateListeners();
    
    // Обработчики для решений
    this.setupDecisionListeners();
    
    // Обработчики для масштабирования
    this.setupScalingListeners();
  }

  // Настройка обработчиков анимаций
  setupAnimationEventListeners() {
    // Анимации при появлении элементов
    this.setupAppearanceAnimations();
    
    // Анимации при взаимодействии
    this.setupInteractionAnimations();
    
    // Анимации переходов
    this.setupTransitionAnimations();
  }

  // Настройка карточек ниш
  setupNicheCardListeners() {
    const nichesGrid = document.querySelector('.niches-grid');
    if (!nichesGrid) return;

    const nicheCards = nichesGrid.querySelectorAll('.niche-card');
    nicheCards.forEach(card => {
      card.addEventListener('click', () => {
        const nicheId = card.dataset.nicheId;
        this.selectNiche(nicheId);
      });
    });
  }

  // Настройка кандидатов
  setupCandidateListeners() {
    const candidatesGrid = document.getElementById('candidatesGrid');
    if (!candidatesGrid) return;

    const candidateCards = candidatesGrid.querySelectorAll('.candidate-card');
    candidateCards.forEach(card => {
      card.addEventListener('click', () => {
        const candidateId = card.dataset.candidateId;
        this.selectCandidate(candidateId);
      });
    });
  }

  // Настройка решений
  setupDecisionListeners() {
    const decisionCards = document.querySelectorAll('.decision-card');
    decisionCards.forEach(card => {
      const options = card.querySelectorAll('.decision-option');
      options.forEach(option => {
        option.addEventListener('click', () => {
          const decisionId = card.dataset.decisionId;
          const optionValue = option.dataset.option;
          this.selectDecisionOption(decisionId, optionValue);
        });
      });
    });
  }

  // Настройка масштабирования
  setupScalingListeners() {
    const scalingCards = document.querySelectorAll('.scaling-card');
    scalingCards.forEach(card => {
      card.addEventListener('click', () => {
        const scalingId = card.dataset.scalingId;
        this.selectScalingOption(scalingId);
      });
    });
  }

  // Настройка анимаций появления
  setupAppearanceAnimations() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Наблюдаем за всеми анимируемыми элементами
    const animatedElements = document.querySelectorAll('.niche-card, .candidate-card, .decision-card, .scaling-card');
    animatedElements.forEach(element => observer.observe(element));
  }

  // Настройка анимаций взаимодействия
  setupInteractionAnimations() {
    // Hover эффекты для карточек
    this.setupHoverEffects();
    
    // Click эффекты для кнопок
    this.setupClickEffects();
    
    // Selection эффекты
    this.setupSelectionEffects();
  }

  // Настройка анимаций переходов
  setupTransitionAnimations() {
    // Анимации между этапами
    this.setupStageTransitionAnimations();
    
    // Анимации появления контента
    this.setupContentAppearanceAnimations();
  }

  // Настройка hover эффектов
  setupHoverEffects() {
    const interactiveElements = document.querySelectorAll('.niche-card, .candidate-card, .decision-card, .scaling-card, .btn');
    
    interactiveElements.forEach(element => {
      element.addEventListener('mouseenter', () => {
        this.addHoverEffect(element);
      });
      
      element.addEventListener('mouseleave', () => {
        this.removeHoverEffect(element);
      });
    });
  }

  // Добавление hover эффекта
  addHoverEffect(element) {
    element.style.transition = 'all 0.3s ease';
    element.style.transform = 'translateY(-5px) scale(1.02)';
    element.style.boxShadow = '0 12px 40px rgba(209, 138, 57, 0.3)';
  }

  // Удаление hover эффекта
  removeHoverEffect(element) {
    element.style.transform = 'translateY(0) scale(1)';
    element.style.boxShadow = '0 4px 20px rgba(209, 138, 57, 0.2)';
  }

  // Настройка click эффектов
  setupClickEffects() {
    const clickableElements = document.querySelectorAll('.btn, .niche-card, .candidate-card, .decision-option, .scaling-card');
    
    clickableElements.forEach(element => {
      element.addEventListener('mousedown', () => {
        this.addClickEffect(element);
      });
      
      element.addEventListener('mouseup', () => {
        this.removeClickEffect(element);
      });
      
      element.addEventListener('mouseleave', () => {
        this.removeClickEffect(element);
      });
    });
  }

  // Добавление click эффекта
  addClickEffect(element) {
    element.style.transform = 'scale(0.98)';
  }

  // Удаление click эффекта
  removeClickEffect(element) {
    element.style.transform = 'scale(1)';
  }

  // Настройка эффектов выбора
  setupSelectionEffects() {
    // Эффекты для выбора ниши
    this.setupNicheSelectionEffects();
    
    // Эффекты для выбора кандидатов
    this.setupCandidateSelectionEffects();
    
    // Эффекты для выбора решений
    this.setupDecisionSelectionEffects();
    
    // Эффекты для выбора масштабирования
    this.setupScalingSelectionEffects();
  }

  // Эффекты выбора ниши
  setupNicheSelectionEffects() {
    const nicheCards = document.querySelectorAll('.niche-card');
    
    nicheCards.forEach(card => {
      card.addEventListener('click', () => {
        // Убираем выделение со всех карточек
        nicheCards.forEach(c => c.classList.remove('selected'));
        
        // Добавляем выделение к выбранной
        card.classList.add('selected');
        
        // Анимация выбора
        this.animateNicheSelection(card);
      });
    });
  }

  // Анимация выбора ниши
  animateNicheSelection(card) {
    card.style.animation = 'nicheSelectionPulse 0.6s ease-in-out';
    
    setTimeout(() => {
      card.style.animation = 'none';
    }, 600);
  }

  // Эффекты выбора кандидатов
  setupCandidateSelectionEffects() {
    const candidateCards = document.querySelectorAll('.candidate-card');
    
    candidateCards.forEach(card => {
      card.addEventListener('click', () => {
        this.animateCandidateSelection(card);
      });
    });
  }

  // Анимация выбора кандидата
  animateCandidateSelection(card) {
    card.style.animation = 'candidateSelectionBounce 0.5s ease-in-out';
    
    setTimeout(() => {
      card.style.animation = 'none';
    }, 500);
  }

  // Эффекты выбора решений
  setupDecisionSelectionEffects() {
    const decisionCards = document.querySelectorAll('.decision-card');
    
    decisionCards.forEach(card => {
      const options = card.querySelectorAll('.decision-option');
      
      options.forEach(option => {
        option.addEventListener('click', () => {
          // Убираем выделение со всех опций в этом решении
          options.forEach(o => o.classList.remove('selected'));
          
          // Добавляем выделение к выбранной
          option.classList.add('selected');
          
          // Анимация выбора
          this.animateDecisionSelection(option);
        });
      });
    });
  }

  // Анимация выбора решения
  animateDecisionSelection(option) {
    option.style.animation = 'decisionSelectionPulse 0.4s ease-in-out';
    
    setTimeout(() => {
      option.style.animation = 'none';
    }, 400);
  }

  // Эффекты выбора масштабирования
  setupScalingSelectionEffects() {
    const scalingCards = document.querySelectorAll('.scaling-card');
    
    scalingCards.forEach(card => {
      card.addEventListener('click', () => {
        // Убираем выделение со всех карточек
        scalingCards.forEach(c => c.classList.remove('selected'));
        
        // Добавляем выделение к выбранной
        card.classList.add('selected');
        
        // Анимация выбора
        this.animateScalingSelection(card);
      });
    });
  }

  // Анимация выбора масштабирования
  animateScalingSelection(card) {
    card.style.animation = 'scalingSelectionGlow 0.8s ease-in-out';
    
    setTimeout(() => {
      card.style.animation = 'none';
    }, 800);
  }

  // Настройка анимаций переходов между этапами
  setupStageTransitionAnimations() {
    // Анимация скрытия текущего этапа
    this.setupStageHideAnimation();
    
    // Анимация показа нового этапа
    this.setupStageShowAnimation();
  }

  // Анимация скрытия этапа
  setupStageHideAnimation() {
    // Логика анимации скрытия
  }

  // Анимация показа этапа
  setupStageShowAnimation() {
    // Логика анимации показа
  }

  // Настройка анимаций появления контента
  setupContentAppearanceAnimations() {
    // Анимации для карточек ниш
    this.setupNicheCardAnimations();
    
    // Анимации для кандидатов
    this.setupCandidateAnimations();
    
    // Анимации для решений
    this.setupDecisionAnimations();
    
    // Анимации для масштабирования
    this.setupScalingAnimations();
  }

  // Анимации карточек ниш
  setupNicheCardAnimations() {
    const nichesGrid = document.querySelector('.niches-grid');
    if (!nichesGrid) return;

    const nicheCards = nichesGrid.querySelectorAll('.niche-card');
    
    nicheCards.forEach((card, index) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(30px)';
      
      setTimeout(() => {
        card.style.transition = 'all 0.6s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, index * 100);
    });
  }

  // Анимации кандидатов
  setupCandidateAnimations() {
    const candidatesGrid = document.getElementById('candidatesGrid');
    if (!candidatesGrid) return;

    const candidateCards = candidatesGrid.querySelectorAll('.candidate-card');
    
    candidateCards.forEach((card, index) => {
      card.style.opacity = '0';
      card.style.transform = 'scale(0.8) rotate(5deg)';
      
      setTimeout(() => {
        card.style.transition = 'all 0.5s ease';
        card.style.opacity = '1';
        card.style.transform = 'scale(1) rotate(0deg)';
      }, index * 50);
    });
  }

  // Анимации решений
  setupDecisionAnimations() {
    const decisionCards = document.querySelectorAll('.decision-card');
    
    decisionCards.forEach((card, index) => {
      card.style.opacity = '0';
      card.style.transform = 'translateX(50px)';
      
      setTimeout(() => {
        card.style.transition = 'all 0.6s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateX(0)';
      }, index * 150);
    });
  }

  // Анимации масштабирования
  setupScalingAnimations() {
    const scalingGrid = document.querySelector('.scaling-grid');
    if (!scalingGrid) return;

    const scalingCards = scalingGrid.querySelectorAll('.scaling-card');
    
    scalingCards.forEach((card, index) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(40px) rotate(2deg)';
      
      setTimeout(() => {
        card.style.transition = 'all 0.7s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0) rotate(0deg)';
      }, index * 100);
    });
  }

  // Выбор ниши
  selectNiche(nicheId) {
    console.log(`🎯 Выбрана ниша: ${nicheId}`);
    
    this.gameState.selectedNiche = nicheId;
    this.updateDisplay();
    
    // Активируем кнопку подтверждения
    const confirmBtn = document.getElementById('confirmNiche');
    if (confirmBtn) {
      confirmBtn.disabled = false;
    }
  }

  // Подтверждение ниши
  confirmNiche() {
    if (!this.gameState.selectedNiche) return;
    
    console.log(`✅ Подтвержден выбор ниши: ${this.gameState.selectedNiche}`);
    
    // Переходим к следующему этапу
    this.nextStage();
  }

  // Выбор кандидата
  selectCandidate(candidateId) {
    console.log(`👥 Выбран кандидат: ${candidateId}`);
    
    // Логика выбора кандидата
    this.addTeamMember(candidateId);
  }

  // Добавление члена команды
  addTeamMember(candidateId) {
    if (this.gameState.team.length >= this.config.maxEmployees) {
      this.showToast('Достигнут лимит сотрудников!', 'warning');
      return;
    }

    const candidate = this.candidates.find(c => c.id === candidateId);
    if (!candidate) return;

    // Проверяем, не нанят ли уже этот кандидат
    if (this.gameState.team.some(member => member.id === candidateId)) {
      this.showToast('Этот кандидат уже в команде!', 'warning');
      return;
    }

    this.gameState.team.push(candidate);
    this.updateDisplay();
    
    // Активируем кнопку подтверждения
    const confirmBtn = document.getElementById('confirmTeam');
    if (confirmBtn) {
      confirmBtn.disabled = this.gameState.team.length === 0;
    }
  }

  // Подтверждение команды
  confirmTeam() {
    if (this.gameState.team.length === 0) return;
    
    console.log(`✅ Подтверждена команда из ${this.gameState.team.length} человек`);
    
    // Переходим к следующему этапу
    this.nextStage();
  }

  // Выбор опции решения
  selectDecisionOption(decisionId, optionValue) {
    console.log(`🎯 Выбрана опция для решения ${decisionId}: ${optionValue}`);
    
    this.gameState.decisions[decisionId] = optionValue;
    this.updateDisplay();
    
    // Проверяем, все ли решения приняты
    this.checkDecisionsComplete();
  }

  // Проверка завершения решений
  checkDecisionsComplete() {
    const decisions = this.generateBusinessDecisions();
    const allDecisionsMade = decisions.every(decision => 
      this.gameState.decisions[decision.id]
    );

    // Активируем кнопку подтверждения
    const confirmBtn = document.getElementById('confirmDecisions');
    if (confirmBtn) {
      confirmBtn.disabled = !allDecisionsMade;
    }
  }

  // Подтверждение решений
  confirmDecisions() {
    console.log('✅ Подтверждены решения по бизнесу');
    
    // Переходим к следующему этапу
    this.nextStage();
  }

  // Выбор опции масштабирования
  selectScalingOption(scalingId) {
    console.log(`📈 Выбрана опция масштабирования: ${scalingId}`);
    
    this.gameState.scaling = scalingId;
    this.updateDisplay();
    
    // Активируем кнопку завершения
    const finishBtn = document.getElementById('finishBusiness');
    if (finishBtn) {
      finishBtn.disabled = false;
    }
  }

  // Завершение бизнеса
  finishBusiness() {
    console.log('🏆 Завершаем бизнес!');
    
    // Рассчитываем результаты
    const results = this.calculateBusinessResults();
    
    // Показываем результаты
    this.showQuestResults(results);
    
    // Отмечаем квест как завершенный
    this.gameState.isCompleted = true;
  }

  // Следующий этап
  nextStage() {
    if (this.gameState.currentStage < this.config.stages) {
      this.gameState.currentStage++;
      this.showStage(this.gameState.currentStage);
    }
  }

  // Показать этап
  showStage(stageNumber) {
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
      targetStage.classList.add('slide-in-right');
      
      setTimeout(() => {
        targetStage.classList.remove('slide-in-right');
      }, 600);
    }

    // Загружаем контент этапа
    this.loadStageContent(stageNumber);
    
    // Обновляем отображение
    this.updateDisplay();
  }

  // Загрузка контента этапа
  loadStageContent(stageNumber) {
    switch (stageNumber) {
      case 1:
        this.loadNicheSelection();
        break;
      case 2:
        this.loadTeamBuilding();
        break;
      case 3:
        this.loadBusinessDecisions();
        break;
      case 4:
        this.loadScalingOptions();
        break;
    }
  }

  // Загрузка выбора ниши
  loadNicheSelection() {
    console.log('🎯 Загружаем выбор ниши');
    
    const nichesGrid = document.querySelector('.niches-grid');
    if (!nichesGrid) return;

    nichesGrid.innerHTML = '';

    this.niches.forEach(niche => {
      const nicheCard = this.createNicheCard(niche);
      nichesGrid.appendChild(nicheCard);
    });
  }

  // Создание карточки ниши
  createNicheCard(niche) {
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
        <div class="metric-label">Конкуренция</div>
        <div class="metric-value">${niche.metrics.competition}</div>
      </div>
      
      <div class="niche-requirements">
        <div class="requirements-title">Требуемые роли:</div>
        <div class="requirements-list">
          ${niche.requiredRoles.map(role => 
            `<span class="requirement-tag">${this.getRoleDisplayName(role)}</span>`
          ).join('')}
        </div>
      </div>
    `;

    // Добавляем обработчик клика
    card.addEventListener('click', () => this.selectNiche(niche.id));
    
    return card;
  }

  // Загрузка формирования команды
  loadTeamBuilding() {
    console.log('👥 Загружаем формирование команды');
    
    const candidatesGrid = document.getElementById('candidatesGrid');
    const teamGrid = document.getElementById('teamGrid');
    
    if (!candidatesGrid || !teamGrid) return;

    candidatesGrid.innerHTML = '';
    teamGrid.innerHTML = `
      <div class="team-placeholder">
        <div class="placeholder-icon">👥</div>
        <div class="placeholder-text">Перетащите сюда сотрудников</div>
      </div>
    `;

    // Добавляем кандидатов
    this.candidates.forEach(candidate => {
      const candidateCard = this.createCandidateCard(candidate);
      candidatesGrid.appendChild(candidateCard);
    });
  }

  // Создание карточки кандидата
  createCandidateCard(candidate) {
    const card = document.createElement('div');
    card.className = 'candidate-card';
    card.dataset.candidateId = candidate.id;
    
    card.innerHTML = `
      <div class="candidate-avatar">${candidate.avatar}</div>
      <div class="candidate-name">${candidate.name}</div>
      <div class="candidate-role">${this.getRoleDisplayName(candidate.role)}</div>
    `;

    return card;
  }

  // Загрузка решений по бизнесу
  loadBusinessDecisions() {
    console.log('🚀 Загружаем решения по бизнесу');
    
    const decisionCards = document.querySelector('.decision-cards');
    if (!decisionCards) return;

    decisionCards.innerHTML = '';

    const decisions = this.generateBusinessDecisions();
    
    decisions.forEach(decision => {
      const decisionCard = this.createDecisionCard(decision);
      decisionCards.appendChild(decisionCard);
    });
  }

  // Создание карточки решения
  createDecisionCard(decision) {
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
      option.addEventListener('click', () => {
        const decisionId = card.dataset.decisionId;
        const optionValue = option.dataset.option;
        this.selectDecisionOption(decisionId, optionValue);
      });
    });

    return card;
  }

  // Загрузка опций масштабирования
  loadScalingOptions() {
    console.log('📈 Загружаем опции масштабирования');
    
    const scalingOptions = document.querySelector('.scaling-options');
    if (!scalingOptions) return;

    scalingOptions.innerHTML = '';

    const scalingGrid = document.createElement('div');
    scalingGrid.className = 'scaling-grid';
    
    const scalingOptionsList = this.generateScalingOptions();
    
    scalingOptionsList.forEach(option => {
      const scalingCard = this.createScalingCard(option);
      scalingGrid.appendChild(scalingCard);
    });

    scalingOptions.appendChild(scalingGrid);
  }

  // Создание карточки масштабирования
  createScalingCard(option) {
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
    card.addEventListener('click', () => this.selectScalingOption(option.id));
    
    return card;
  }

  // Показать результаты квеста
  showQuestResults(results) {
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
  calculateBusinessResults() {
    const niche = this.niches.find(n => n.id === this.gameState.selectedNiche);
    const teamSize = this.gameState.team.length;
    const decisionsCount = Object.keys(this.gameState.decisions).length;
    const scaling = this.gameState.scaling || 'Не выбрано';
    
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

  // Обновление отображения
  updateDisplay() {
    this.updateBusinessStatus();
    this.updateStageDisplay();
  }

  // Обновление статуса бизнеса
  updateBusinessStatus() {
    // Обновляем этап
    const currentStageEl = document.getElementById('currentStage');
    if (currentStageEl) {
      currentStageEl.textContent = `${this.gameState.currentStage}/4`;
    }

    // Обновляем капитал
    const currentCapitalEl = document.getElementById('currentCapital');
    if (currentCapitalEl) {
      currentCapitalEl.textContent = `$${this.gameState.finances.capital.toLocaleString()}`;
    }

    // Обновляем сотрудников
    const currentEmployeesEl = document.getElementById('currentEmployees');
    if (currentEmployeesEl) {
      currentEmployeesEl.textContent = `${this.gameState.team.length}/${this.config.maxEmployees}`;
    }

    // Обновляем доход
    const currentRevenueEl = document.getElementById('currentRevenue');
    if (currentRevenueEl) {
      const revenue = this.calculateMonthlyRevenue();
      currentRevenueEl.textContent = `$${revenue.toLocaleString()}`;
    }
  }

  // Обновление отображения этапа
  updateStageDisplay() {
    // Обновляем заголовок этапа
    const stageHeaders = document.querySelectorAll('.stage-header h2');
    stageHeaders.forEach(header => {
      if (header.closest('.quest-stage.active')) {
        header.style.color = '#D18A39';
      } else {
        header.style.color = '#2C1810';
      }
    });
  }

  // Рассчитать месячный доход
  calculateMonthlyRevenue() {
    if (!this.gameState.selectedNiche || this.gameState.team.length === 0) {
      return 0;
    }

    const niche = this.niches.find(n => n.id === this.gameState.selectedNiche);
    if (!niche) return 0;

    // Базовый доход от ниши
    let revenue = niche.metrics.monthlyRevenue;
    
    // Бонус за команду
    revenue += this.gameState.team.length * 1000;
    
    // Бонус за решения
    const decisionsBonus = Object.keys(this.gameState.decisions).length * 500;
    revenue += decisionsBonus;
    
    return revenue;
  }

  // Генерация решений по бизнесу
  generateBusinessDecisions() {
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

  // Генерация опций масштабирования
  generateScalingOptions() {
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

  // Вспомогательные функции
  getRoleDisplayName(role) {
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

  // Показать toast уведомление
  showToast(message, type = 'info') {
    console.log(`📢 ${message}`);
    // Здесь можно добавить визуальное отображение toast
  }
}

// Создание экземпляра движка при загрузке страницы
let businessQuestEngine;

document.addEventListener('DOMContentLoaded', function() {
  businessQuestEngine = new BusinessQuestEngine();
});

// Экспорт для использования в других модулях
window.BusinessQuestEngine = BusinessQuestEngine;
