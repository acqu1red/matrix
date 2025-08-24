/* ===== BUSINESS QUEST ENGINE ===== */

class BusinessQuestEngine {
  constructor() {
    this.gameState = {
      isRunning: false,
      currentStage: 1,
      selectedNiche: null,
      capital: BUSINESS_CONFIG.startingCapital,
      monthlyRevenue: 0,
      monthlyExpenses: 0,
      employees: [],
      businessAge: 0,
      decisions: [],
      events: [],
      startTime: null
    };
    
    this.availableCandidates = [];
    this.currentCandidate = null;
    this.eventLog = [];
  }

  // Инициализация движка
  initialize() {
    this.resetGameState();
    this.logEvent('info', 'Бизнес-симулятор инициализирован');
  }

  // Сброс состояния игры
  resetGameState() {
    this.gameState = {
      isRunning: false,
      currentStage: 1,
      selectedNiche: null,
      capital: BUSINESS_CONFIG.startingCapital,
      monthlyRevenue: 0,
      monthlyExpenses: 0,
      employees: [],
      businessAge: 0,
      decisions: [],
      events: [],
      startTime: null
    };
    
    this.availableCandidates = [];
    this.currentCandidate = null;
    this.eventLog = [];
  }

  // Запуск квеста
  startBusiness() {
    this.gameState.isRunning = true;
    this.gameState.startTime = Date.now();
    this.logEvent('success', 'Создание бизнеса началось!');
    return true;
  }

  // Выбор ниши бизнеса
  selectNiche(nicheId) {
    const niche = BusinessDataService.getNicheById(nicheId);
    if (!niche) {
      this.logEvent('error', 'Неверная ниша бизнеса');
      return false;
    }

    this.gameState.selectedNiche = niche;
    this.gameState.capital -= niche.metrics.startupCost;
    this.gameState.currentStage = 2;
    
    // Инициализируем кандидатов для найма
    this.initializeCandidates();
    
    this.logEvent('success', `Выбрана ниша: ${niche.name}. Потрачено: $${niche.metrics.startupCost}`);
    this.calculateBusinessMetrics();
    
    return true;
  }

  // Инициализация кандидатов
  initializeCandidates() {
    this.availableCandidates = [...CANDIDATES_DATABASE];
    this.shuffleCandidates();
    this.loadNextCandidate();
  }

  // Перемешивание кандидатов
  shuffleCandidates() {
    for (let i = this.availableCandidates.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.availableCandidates[i], this.availableCandidates[j]] = 
      [this.availableCandidates[j], this.availableCandidates[i]];
    }
  }

  // Загрузка следующего кандидата
  loadNextCandidate() {
    if (this.availableCandidates.length === 0) {
      this.currentCandidate = null;
      this.logEvent('warning', 'Кандидаты закончились');
      return null;
    }

    this.currentCandidate = this.availableCandidates.shift();
    this.logEvent('info', `Новый кандидат: ${this.currentCandidate.name} (${this.currentCandidate.role})`);
    
    return this.currentCandidate;
  }

  // Найм сотрудника
  hireEmployee(candidateId, position) {
    const candidate = BusinessDataService.getCandidateById(candidateId);
    if (!candidate) {
      this.logEvent('error', 'Кандидат не найден');
      return false;
    }

    if (this.gameState.employees.length >= BUSINESS_CONFIG.maxEmployees) {
      this.logEvent('warning', 'Достигнут максимум сотрудников');
      return false;
    }

    if (this.gameState.capital < candidate.salary * 2) { // Нужно 2 месяца зарплаты
      this.logEvent('warning', 'Недостаточно капитала для найма');
      return false;
    }

    // Проверяем, не занята ли позиция
    const positionOccupied = this.gameState.employees.some(emp => emp.position === position);
    if (positionOccupied) {
      this.logEvent('warning', 'Позиция уже занята');
      return false;
    }

    // Нанимаем сотрудника
    const employee = {
      ...candidate,
      position,
      hiredDate: Date.now(),
      performance: this.calculateInitialPerformance(candidate)
    };

    this.gameState.employees.push(employee);
    this.gameState.capital -= candidate.salary * 2; // Первоначальные расходы
    
    this.logEvent('success', `Нанят: ${candidate.name} на позицию ${position} ($${candidate.salary}/мес)`);
    this.calculateBusinessMetrics();
    
    // Загружаем следующего кандидата
    this.loadNextCandidate();
    
    return true;
  }

  // Пропуск кандидата
  skipCandidate() {
    if (this.currentCandidate) {
      this.logEvent('info', `Пропущен кандидат: ${this.currentCandidate.name}`);
      this.loadNextCandidate();
      return true;
    }
    return false;
  }

  // Расчет начальной производительности сотрудника
  calculateInitialPerformance(candidate) {
    const basePerformance = (candidate.stats.efficiency + candidate.stats.creativity + candidate.stats.leadership) / 3;
    const experienceBonus = Math.min(candidate.experience * 2, 20); // до +20 за опыт
    const randomFactor = 0.9 + Math.random() * 0.2; // 90%-110%
    
    return Math.round(basePerformance * (1 + experienceBonus / 100) * randomFactor);
  }

  // Расчет метрик бизнеса
  calculateBusinessMetrics() {
    if (!this.gameState.selectedNiche) return;

    // Расчет месячных расходов
    this.gameState.monthlyExpenses = BusinessDataService.calculateMonthlyCosts(this.gameState.employees);
    
    // Расчет месячного дохода
    this.gameState.monthlyRevenue = BusinessDataService.calculateMonthlyRevenue(
      this.gameState.selectedNiche,
      this.gameState.employees,
      this.gameState.businessAge
    );

    // Проверяем обязательные роли для ниши
    this.checkRequiredRoles();
  }

  // Проверка обязательных ролей
  checkRequiredRoles() {
    if (!this.gameState.selectedNiche) return;

    const requiredRoles = this.gameState.selectedNiche.requiredRoles;
    const currentRoles = this.gameState.employees.map(emp => emp.role);
    
    const missingRoles = requiredRoles.filter(role => !currentRoles.includes(role));
    
    if (missingRoles.length > 0) {
      this.logEvent('warning', `Нужны специалисты: ${missingRoles.join(', ')}`);
    }
  }

  // Переход к следующему этапу
  nextStage() {
    if (this.gameState.currentStage >= BUSINESS_CONFIG.stages) {
      return this.completeBusiness();
    }

    this.gameState.currentStage++;
    this.gameState.businessAge++;
    
    // Пересчитываем метрики
    this.calculateBusinessMetrics();
    
    // Генерируем случайное событие
    this.generateRandomEvent();
    
    this.logEvent('info', `Переход на этап ${this.gameState.currentStage}`);
    
    return true;
  }

  // Генерация случайного события
  generateRandomEvent() {
    const event = BusinessDataService.generateRandomEvent();
    if (event) {
      this.gameState.events.push({
        ...event,
        occurredAt: Date.now()
      });
      
      // Применяем влияние события
      this.applyEventImpact(event);
      
      this.logEvent('warning', `Событие: ${event.name}`);
    }
  }

  // Применение влияния события
  applyEventImpact(event) {
    if (event.impact.revenue !== 0) {
      this.gameState.monthlyRevenue *= (1 + event.impact.revenue);
    }
    
    if (event.impact.costs !== 0) {
      this.gameState.monthlyExpenses *= (1 + event.impact.costs);
    }
    
    this.gameState.monthlyRevenue = Math.round(this.gameState.monthlyRevenue);
    this.gameState.monthlyExpenses = Math.round(this.gameState.monthlyExpenses);
  }

  // Принятие стратегического решения
  makeDecision(decisionId, option) {
    const decision = {
      id: decisionId,
      option,
      timestamp: Date.now(),
      stage: this.gameState.currentStage
    };
    
    this.gameState.decisions.push(decision);
    
    // Применяем влияние решения
    this.applyDecisionImpact(decisionId, option);
    
    this.logEvent('info', `Принято решение: ${decisionId} - ${option}`);
  }

  // Применение влияния решения
  applyDecisionImpact(decisionId, option) {
    // Здесь можно добавить логику влияния различных решений
    switch (decisionId) {
      case 'marketing_budget':
        if (option === 'increase') {
          this.gameState.monthlyExpenses += 2000;
          this.gameState.monthlyRevenue *= 1.2;
        }
        break;
      
      case 'team_expansion':
        if (option === 'expand') {
          // Логика расширения команды
        }
        break;
      
      default:
        // Базовое влияние
        break;
    }
    
    this.calculateBusinessMetrics();
  }

  // Завершение создания бизнеса
  completeBusiness() {
    this.gameState.isRunning = false;
    
    const finalMetrics = this.calculateFinalMetrics();
    const rewards = this.calculateRewards(finalMetrics);
    
    this.logEvent('success', `Бизнес создан! Оценка: ${finalMetrics.score}`);
    
    return {
      success: true,
      finalMetrics,
      rewards,
      completionTime: Date.now() - this.gameState.startTime,
      businessSummary: this.generateBusinessSummary()
    };
  }

  // Расчет финальных метрик
  calculateFinalMetrics() {
    const monthlyProfit = this.gameState.monthlyRevenue - this.gameState.monthlyExpenses;
    const roi = BusinessDataService.calculateROI(
      this.gameState.monthlyRevenue,
      this.gameState.monthlyExpenses,
      BUSINESS_CONFIG.startingCapital
    );
    
    // Оценка команды
    const teamScore = this.calculateTeamScore();
    
    // Оценка финансов
    const financialScore = this.calculateFinancialScore(monthlyProfit, roi);
    
    // Оценка стратегии
    const strategyScore = this.calculateStrategyScore();
    
    // Общая оценка
    const totalScore = Math.round((teamScore + financialScore + strategyScore) / 3);
    
    return {
      score: totalScore,
      monthlyProfit,
      roi,
      teamSize: this.gameState.employees.length,
      teamScore,
      financialScore,
      strategyScore,
      businessAge: this.gameState.businessAge
    };
  }

  // Оценка команды
  calculateTeamScore() {
    if (this.gameState.employees.length === 0) return 0;
    
    const avgPerformance = this.gameState.employees.reduce((sum, emp) => sum + emp.performance, 0) / this.gameState.employees.length;
    const teamDiversity = this.calculateTeamDiversity();
    const requiredRolesCovered = this.calculateRequiredRolesCoverage();
    
    return Math.round((avgPerformance * 0.4 + teamDiversity * 0.3 + requiredRolesCovered * 0.3));
  }

  // Разнообразие команды
  calculateTeamDiversity() {
    const roles = [...new Set(this.gameState.employees.map(emp => emp.role))];
    return Math.min(roles.length * 20, 100); // 20 очков за каждую уникальную роль
  }

  // Покрытие обязательных ролей
  calculateRequiredRolesCoverage() {
    if (!this.gameState.selectedNiche) return 0;
    
    const requiredRoles = this.gameState.selectedNiche.requiredRoles;
    const currentRoles = this.gameState.employees.map(emp => emp.role);
    const coveredRoles = requiredRoles.filter(role => currentRoles.includes(role));
    
    return (coveredRoles.length / requiredRoles.length) * 100;
  }

  // Оценка финансов
  calculateFinancialScore(monthlyProfit, roi) {
    let score = 0;
    
    // Очки за прибыльность
    if (monthlyProfit > 0) {
      score += Math.min(monthlyProfit / 1000 * 10, 50); // до 50 очков
    }
    
    // Очки за ROI
    if (roi > 0) {
      score += Math.min(roi / 10, 50); // до 50 очков
    }
    
    return Math.round(score);
  }

  // Оценка стратегии
  calculateStrategyScore() {
    let score = 50; // Базовые очки
    
    // Очки за принятые решения
    score += this.gameState.decisions.length * 5;
    
    // Очки за управление событиями
    score += this.gameState.events.length * 3;
    
    // Очки за время создания бизнеса
    const completionTime = Date.now() - this.gameState.startTime;
    const timeBonus = Math.max(0, 30 - Math.floor(completionTime / 60000)); // Бонус за скорость
    score += timeBonus;
    
    return Math.min(Math.round(score), 100);
  }

  // Расчет наград
  calculateRewards(finalMetrics) {
    const baseRewards = BUSINESS_CONFIG.rewards;
    let multiplier = 1;
    
    if (finalMetrics.score >= 90) {
      multiplier = 1.5; // Отличный результат
    } else if (finalMetrics.score >= 70) {
      multiplier = 1.2; // Хороший результат
    } else if (finalMetrics.score >= 50) {
      multiplier = 1.0; // Базовые награды
    } else {
      multiplier = 0.7; // Сниженные награды
    }
    
    return {
      mulacoin: Math.round(baseRewards.mulacoin * multiplier),
      experience: Math.round(baseRewards.experience * multiplier),
      multiplier
    };
  }

  // Генерация резюме бизнеса
  generateBusinessSummary() {
    return {
      niche: this.gameState.selectedNiche,
      team: this.gameState.employees,
      financials: {
        startingCapital: BUSINESS_CONFIG.startingCapital,
        currentCapital: this.gameState.capital,
        monthlyRevenue: this.gameState.monthlyRevenue,
        monthlyExpenses: this.gameState.monthlyExpenses,
        monthlyProfit: this.gameState.monthlyRevenue - this.gameState.monthlyExpenses
      },
      events: this.gameState.events,
      decisions: this.gameState.decisions,
      businessAge: this.gameState.businessAge
    };
  }

  // Проверка возможности найма
  canHireEmployee(candidate) {
    return {
      canHire: this.gameState.employees.length < BUSINESS_CONFIG.maxEmployees &&
               this.gameState.capital >= candidate.salary * 2,
      reason: this.gameState.employees.length >= BUSINESS_CONFIG.maxEmployees ? 
              'Достигнут максимум сотрудников' :
              this.gameState.capital < candidate.salary * 2 ?
              'Недостаточно капитала' : ''
    };
  }

  // Получение доступных позиций
  getAvailablePositions() {
    const allPositions = ['marketing', 'sales', 'tech', 'finance', 'operations', 'hr', 'legal', 'creative', 'analytics'];
    const occupiedPositions = this.gameState.employees.map(emp => emp.position);
    
    return allPositions.filter(pos => !occupiedPositions.includes(pos));
  }

  // Логирование событий
  logEvent(type, message) {
    const timestamp = new Date().toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
    
    this.eventLog.push({
      timestamp,
      type,
      message
    });
    
    // Ограничиваем размер лога
    if (this.eventLog.length > 50) {
      this.eventLog.shift();
    }
  }

  // Получение состояния игры
  getGameState() {
    return { ...this.gameState };
  }

  // Получение текущего кандидата
  getCurrentCandidate() {
    return this.currentCandidate;
  }

  // Получение лога событий
  getEventLog() {
    return [...this.eventLog];
  }

  // Сохранение прогресса
  saveProgress() {
    const saveData = {
      gameState: this.gameState,
      availableCandidates: this.availableCandidates,
      currentCandidate: this.currentCandidate,
      eventLog: this.eventLog,
      timestamp: Date.now()
    };
    
    localStorage.setItem('businessQuestProgress', JSON.stringify(saveData));
  }

  // Загрузка прогресса
  loadProgress() {
    const saveData = localStorage.getItem('businessQuestProgress');
    if (saveData) {
      try {
        const parsed = JSON.parse(saveData);
        this.gameState = parsed.gameState;
        this.availableCandidates = parsed.availableCandidates;
        this.currentCandidate = parsed.currentCandidate;
        this.eventLog = parsed.eventLog;
        return true;
      } catch (error) {
        console.error('Ошибка загрузки прогресса:', error);
        return false;
      }
    }
    return false;
  }

  // Проверка готовности к следующему этапу
  canProceedToNextStage() {
    switch (this.gameState.currentStage) {
      case 1:
        return this.gameState.selectedNiche !== null;
      
      case 2:
        return this.gameState.employees.length >= 2; // Минимум 2 сотрудника
      
      case 3:
        const requiredRoles = this.gameState.selectedNiche?.requiredRoles || [];
        const currentRoles = this.gameState.employees.map(emp => emp.role);
        const hasRequiredRoles = requiredRoles.every(role => currentRoles.includes(role));
        return hasRequiredRoles && this.gameState.employees.length >= 3;
      
      case 4:
        return this.gameState.monthlyRevenue > this.gameState.monthlyExpenses;
      
      default:
        return false;
    }
  }

  // Получение подсказки для текущего этапа
  getStageHint() {
    switch (this.gameState.currentStage) {
      case 1:
        return 'Выберите нишу бизнеса, которая соответствует вашим интересам и рыночным возможностям';
      
      case 2:
        return 'Наймите ключевых сотрудников. Обращайте внимание на их навыки и зарплатные ожидания';
      
      case 3:
        return 'Убедитесь, что у вас есть все необходимые специалисты для выбранной ниши';
      
      case 4:
        return 'Оптимизируйте бизнес для достижения прибыльности';
      
      default:
        return 'Продолжайте развивать свой бизнес';
    }
  }
}
