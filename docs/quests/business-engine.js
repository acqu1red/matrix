/* ===== BUSINESS QUEST ENGINE ===== */

class BusinessQuestEngine {
  constructor() {
    this.gameState = {
      currentStage: 0,
      selectedNiche: null,
      hiredTeam: {},
      businessStats: {
        capital: 50000,
        revenue: 0,
        expenses: 0,
        profit: 0,
        month: 1,
        maxMonths: 12
      },
      isRunning: false,
      isCompleted: false
    };
    
    this.stages = [
      'businessNiche',
      'teamHiring', 
      'businessManagement',
      'questResults'
    ];
    
    this.niches = BUSINESS_NICHES;
    this.candidates = CANDIDATES_DATABASE;
    
    this.eventListeners = new Map();
  }

  // Инициализация движка
  initialize() {
    console.log('🚀 Инициализация движка бизнес-квеста...');
    this.loadProgress();
    this.emit('initialized', this.gameState);
  }

  // Получение текущего состояния игры
  getGameState() {
    return { ...this.gameState };
  }

  // Переход к следующему этапу
  nextStage() {
    if (this.gameState.currentStage < this.stages.length - 1) {
      this.gameState.currentStage++;
      this.saveProgress();
      this.emit('stageChanged', this.gameState.currentStage);
      return true;
    }
    return false;
  }

  // Переход к предыдущему этапу
  previousStage() {
    if (this.gameState.currentStage > 0) {
      this.gameState.currentStage--;
      this.saveProgress();
      this.emit('stageChanged', this.gameState.currentStage);
      return true;
    }
    return false;
  }

  // Установка текущего этапа
  setStage(stageIndex) {
    if (stageIndex >= 0 && stageIndex < this.stages.length) {
      this.gameState.currentStage = stageIndex;
      this.saveProgress();
      this.emit('stageChanged', this.gameState.currentStage);
      return true;
    }
    return false;
  }

  // Получение текущего этапа
  getCurrentStage() {
    return this.stages[this.gameState.currentStage];
  }

  // Выбор ниши бизнеса
  selectNiche(nicheId) {
    const niche = this.niches.find(n => n.id === nicheId);
    if (niche) {
      this.gameState.selectedNiche = niche;
      this.gameState.businessStats.capital = niche.metrics.startupCost;
      this.saveProgress();
      this.emit('nicheSelected', niche);
      return true;
    }
    return false;
  }

  // Получение выбранной ниши
  getSelectedNiche() {
    return this.gameState.selectedNiche;
  }

  // Найм кандидата на должность
  hireCandidate(candidateId, positionId) {
    const candidate = this.candidates.find(c => c.id === candidateId);
    const position = this.getPositionById(positionId);
    
    if (candidate && position && this.canHireCandidate(candidate, position)) {
      this.gameState.hiredTeam[positionId] = {
        ...candidate,
        hiredAt: this.gameState.businessStats.month,
        salary: this.calculateSalary(candidate, position)
      };
      
      this.saveProgress();
      this.emit('candidateHired', { candidate, position });
      return true;
    }
    return false;
  }

  // Увольнение кандидата
  fireCandidate(positionId) {
    if (this.gameState.hiredTeam[positionId]) {
      const candidate = this.gameState.hiredTeam[positionId];
      delete this.gameState.hiredTeam[positionId];
      
      this.saveProgress();
      this.emit('candidateFired', { candidate, position: positionId });
      return true;
    }
    return false;
  }

  // Проверка возможности найма кандидата
  canHireCandidate(candidate, position) {
    // Проверяем, что должность свободна
    if (this.gameState.hiredTeam[position.id]) {
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

  // Расчет зарплаты кандидата
  calculateSalary(candidate, position) {
    const baseSalary = BUSINESS_CONFIG.salaryRanges[position.id]?.[0] || 5000;
    const experienceMultiplier = 1 + (candidate.experience / 100);
    const skillMultiplier = 1 + (candidate.skills.length * 0.1);
    
    return Math.round(baseSalary * experienceMultiplier * skillMultiplier);
  }

  // Выполнение бизнес-действия
  performBusinessAction(actionType) {
    if (!this.gameState.isRunning) {
      return false;
    }

    const action = this.getBusinessAction(actionType);
    if (action && this.canPerformAction(action)) {
      // Применяем эффекты действия
      this.applyActionEffects(action);
      
      // Обновляем статистику
      this.updateBusinessStats();
      
      this.saveProgress();
      this.emit('actionPerformed', action);
      return true;
    }
    return false;
  }

  // Получение бизнес-действия
  getBusinessAction(actionType) {
    const actions = {
      marketing: {
        name: 'Маркетинговая кампания',
        cost: 5000,
        effects: { revenue: 15000, reputation: 10 }
      },
      development: {
        name: 'Разработка продукта',
        cost: 8000,
        effects: { quality: 20, revenue: 10000 }
      },
      finance: {
        name: 'Финансовая оптимизация',
        cost: 3000,
        effects: { expenses: -2000, efficiency: 15 }
      },
      operations: {
        name: 'Операционные улучшения',
        cost: 4000,
        effects: { efficiency: 25, expenses: -1000 }
      }
    };
    
    return actions[actionType];
  }

  // Проверка возможности выполнения действия
  canPerformAction(action) {
    return this.gameState.businessStats.capital >= action.cost;
  }

  // Применение эффектов действия
  applyActionEffects(action) {
    this.gameState.businessStats.capital -= action.cost;
    
    if (action.effects.revenue) {
      this.gameState.businessStats.revenue += action.effects.revenue;
    }
    
    if (action.effects.expenses) {
      this.gameState.businessStats.expenses += action.effects.expenses;
    }
  }

  // Обновление бизнес-статистики
  updateBusinessStats() {
    // Расчет расходов на зарплаты
    const salaryExpenses = Object.values(this.gameState.hiredTeam)
      .reduce((total, employee) => total + employee.salary, 0);
    
    this.gameState.businessStats.expenses = salaryExpenses;
    
    // Расчет прибыли
    this.gameState.businessStats.profit = 
      this.gameState.businessStats.revenue - this.gameState.businessStats.expenses;
    
    // Обновление капитала
    this.gameState.businessStats.capital += this.gameState.businessStats.profit;
  }

  // Переход к следующему месяцу
  nextMonth() {
    if (this.gameState.businessStats.month < this.gameState.businessStats.maxMonths) {
      this.gameState.businessStats.month++;
      
      // Генерируем пассивный доход
      this.generatePassiveIncome();
      
      // Обновляем статистику
      this.updateBusinessStats();
      
      this.saveProgress();
      this.emit('monthChanged', this.gameState.businessStats.month);
      
      // Проверяем завершение квеста
      if (this.shouldCompleteQuest()) {
        this.completeQuest();
      }
      
      return true;
    }
    return false;
  }

  // Генерация пассивного дохода
  generatePassiveIncome() {
    if (this.gameState.selectedNiche) {
      const baseIncome = this.gameState.selectedNiche.metrics.monthlyRevenue;
      const teamBonus = Object.keys(this.gameState.hiredTeam).length * 0.2;
      const passiveIncome = Math.round(baseIncome * (1 + teamBonus));
      
      this.gameState.businessStats.revenue += passiveIncome;
    }
  }

  // Проверка завершения квеста
  shouldCompleteQuest() {
    const minTeamSize = 2;
    const minProfit = 10000;
    const minMonths = 6;
    
    return (
      Object.keys(this.gameState.hiredTeam).length >= minTeamSize &&
      this.gameState.businessStats.profit >= minProfit &&
      this.gameState.businessStats.month >= minMonths
    );
  }

  // Завершение квеста
  completeQuest() {
    this.gameState.isCompleted = true;
    this.gameState.isRunning = false;
    
    // Вычисляем финальные результаты
    const finalResults = this.calculateFinalResults();
    
    this.saveProgress();
    this.emit('questCompleted', finalResults);
  }

  // Расчет финальных результатов
  calculateFinalResults() {
    const teamQuality = this.calculateTeamQuality();
    const businessGrowth = this.calculateBusinessGrowth();
    const totalRevenue = this.gameState.businessStats.revenue;
    const finalCapital = this.gameState.businessStats.capital;
    
    return {
      teamQuality,
      businessGrowth,
      totalRevenue,
      finalCapital,
      niche: this.gameState.selectedNiche,
      months: this.gameState.businessStats.month
    };
  }

  // Расчет качества команды
  calculateTeamQuality() {
    if (Object.keys(this.gameState.hiredTeam).length === 0) {
      return 0;
    }
    
    const totalSkills = Object.values(this.gameState.hiredTeam)
      .reduce((total, employee) => total + employee.skills.length, 0);
    
    const avgExperience = Object.values(this.gameState.hiredTeam)
      .reduce((total, employee) => total + employee.experience, 0) / Object.keys(this.gameState.hiredTeam).length;
    
    return Math.round((totalSkills * 10 + avgExperience) / 2);
  }

  // Расчет роста бизнеса
  calculateBusinessGrowth() {
    const initialCapital = this.gameState.selectedNiche?.metrics.startupCost || 50000;
    const currentCapital = this.gameState.businessStats.capital;
    
    return Math.round(((currentCapital - initialCapital) / initialCapital) * 100);
  }

  // Запуск квеста
  startQuest() {
    this.gameState.isRunning = true;
    this.saveProgress();
    this.emit('questStarted');
  }

  // Сброс квеста
  resetQuest() {
    this.gameState = {
      currentStage: 0,
      selectedNiche: null,
      hiredTeam: {},
      businessStats: {
        capital: 50000,
        revenue: 0,
        expenses: 0,
        profit: 0,
        month: 1,
        maxMonths: 12
      },
      isRunning: false,
      isCompleted: false
    };
    
    this.saveProgress();
    this.emit('questReset');
  }

  // Сохранение прогресса
  saveProgress() {
    try {
      localStorage.setItem('businessQuestProgress', JSON.stringify(this.gameState));
    } catch (error) {
      console.error('Ошибка сохранения прогресса:', error);
    }
  }

  // Загрузка прогресса
  loadProgress() {
    try {
      const saved = localStorage.getItem('businessQuestProgress');
      if (saved) {
        const loadedState = JSON.parse(saved);
        this.gameState = { ...this.gameState, ...loadedState };
      }
    } catch (error) {
      console.error('Ошибка загрузки прогресса:', error);
    }
  }

  // Система событий
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  emit(event, data) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Ошибка в обработчике события ${event}:`, error);
        }
      });
    }
  }

  // Получение доступных кандидатов для должности
  getCandidatesForPosition(positionId) {
    const position = this.getPositionById(positionId);
    if (!position) return [];
    
    return this.candidates.filter(candidate => {
      const requiredSkills = position.requiredSkills || [];
      const candidateSkills = candidate.skills || [];
      
      return requiredSkills.every(skill => 
        candidateSkills.includes(skill)
      );
    });
  }

  // Получение статистики команды
  getTeamStats() {
    const teamSize = Object.keys(this.gameState.hiredTeam).length;
    const totalSalary = Object.values(this.gameState.hiredTeam)
      .reduce((total, employee) => total + employee.salary, 0);
    
    const avgExperience = teamSize > 0 
      ? Object.values(this.gameState.hiredTeam)
          .reduce((total, employee) => total + employee.experience, 0) / teamSize
      : 0;
    
    return {
      size: teamSize,
      totalSalary,
      avgExperience: Math.round(avgExperience),
      positions: Object.keys(this.gameState.hiredTeam)
    };
  }

  // Получение прогресса квеста
  getQuestProgress() {
    const totalStages = this.stages.length;
    const completedStages = this.gameState.currentStage;
    
    return {
      current: completedStages + 1,
      total: totalStages,
      percentage: Math.round(((completedStages + 1) / totalStages) * 100)
    };
  }
}

// Экспорт для использования в других модулях
window.BusinessQuestEngine = BusinessQuestEngine;
