/* ===== BUSINESS QUEST ENGINE - OPTIMIZED FOR MINIAPPS ===== */

// Основной движок для бизнес-квеста
class BusinessQuestEngine {
  constructor() {
    this.gameState = {
      currentStage: 1,
      selectedNiche: null,
      teamMembers: {},
      businessStats: {
        revenue: 0,
        growth: 0,
        teamSize: 0,
        reputation: 0,
        capital: 100000,
        expenses: 0,
        profit: 0
      },
      decisions: [],
      startTime: Date.now(),
      isRunning: false
    };
    
    this.initialize();
  }
  
  // Инициализация движка
  initialize() {
    console.log('⚙️ Инициализация движка бизнес-квеста...');
    
    // Загружаем сохраненный прогресс
    this.loadProgress();
    
    // Устанавливаем флаг запуска
    this.gameState.isRunning = true;
    
    console.log('✅ Движок бизнес-квеста инициализирован');
  }
  
  // Загрузка прогресса
  loadProgress() {
    try {
      const savedProgress = localStorage.getItem('businessQuestProgress');
      if (savedProgress) {
        const progress = JSON.parse(savedProgress);
        this.gameState = { ...this.gameState, ...progress };
        console.log('📁 Прогресс квеста загружен');
      }
    } catch (error) {
      console.warn('⚠️ Не удалось загрузить прогресс:', error);
    }
  }
  
  // Сохранение прогресса
  saveProgress() {
    try {
      const progressData = {
        currentStage: this.gameState.currentStage,
        selectedNiche: this.gameState.selectedNiche,
        teamMembers: this.gameState.teamMembers,
        businessStats: this.gameState.businessStats,
        decisions: this.gameState.decisions,
        startTime: this.gameState.startTime
      };
      
      localStorage.setItem('businessQuestProgress', JSON.stringify(progressData));
      console.log('💾 Прогресс квеста сохранен');
    } catch (error) {
      console.warn('⚠️ Не удалось сохранить прогресс:', error);
    }
  }
  
  // Получение текущего состояния игры
  getGameState() {
    return { ...this.gameState };
  }
  
  // Обновление состояния игры
  updateGameState(newState) {
    this.gameState = { ...this.gameState, ...newState };
    this.saveProgress();
  }
  
  // Выбор ниши
  selectNiche(nicheId) {
    const niche = this.getNicheById(nicheId);
    if (!niche) {
      throw new Error('Ниша не найдена');
    }
    
    this.gameState.selectedNiche = niche;
    this.gameState.currentStage = 2;
    
    // Обновляем статистику на основе выбранной ниши
    this.updateBusinessStats({
      capital: this.gameState.businessStats.capital - niche.startupCost,
      expenses: niche.startupCost
    });
    
    this.saveProgress();
    
    return {
      success: true,
      message: `Ниша "${niche.name}" выбрана успешно`,
      niche: niche
    };
  }
  
  // Получение ниши по ID
  getNicheById(nicheId) {
    const niches = window.BUSINESS_QUEST_DATA?.niches || [];
    return niches.find(niche => niche.id === nicheId);
  }
  
  // Наем сотрудника
  hireEmployee(candidateId, positionId) {
    const candidate = this.getCandidateById(candidateId);
    const position = this.getPositionById(positionId);
    
    if (!candidate || !position) {
      throw new Error('Кандидат или должность не найдены');
    }
    
    // Проверяем, что должность свободна
    if (this.gameState.teamMembers[positionId]) {
      throw new Error('Должность уже занята');
    }
    
    // Проверяем, что у нас достаточно капитала
    if (this.gameState.businessStats.capital < position.salary) {
      throw new Error('Недостаточно капитала для найма');
    }
    
    // Нанимаем сотрудника
    const employee = {
      id: candidateId,
      name: candidate.name,
      position: positionId,
      salary: position.salary,
      skills: candidate.skills,
      efficiency: candidate.efficiency,
      creativity: candidate.creativity,
      leadership: candidate.leadership,
      hireDate: Date.now()
    };
    
    this.gameState.teamMembers[positionId] = employee;
    
    // Обновляем статистику
    this.updateBusinessStats({
      capital: this.gameState.businessStats.capital - position.salary,
      expenses: this.gameState.businessStats.expenses + position.salary,
      teamSize: Object.keys(this.gameState.teamMembers).length
    });
    
    this.saveProgress();
    
    return {
      success: true,
      message: `${candidate.name} нанят на должность ${position.title}`,
      employee: employee
    };
  }
  
  // Получение кандидата по ID
  getCandidateById(candidateId) {
    const candidates = window.BUSINESS_QUEST_DATA?.candidates || [];
    return candidates.find(candidate => candidate.id === candidateId);
  }
  
  // Получение должности по ID
  getPositionById(positionId) {
    const positions = window.BUSINESS_QUEST_DATA?.positions || [];
    return positions.find(position => position.id === positionId);
  }
  
  // Увольнение сотрудника
  fireEmployee(positionId) {
    const employee = this.gameState.teamMembers[positionId];
    if (!employee) {
      throw new Error('Сотрудник не найден');
    }
    
    // Возвращаем часть зарплаты
    const refund = Math.floor(employee.salary * 0.1);
    
    // Удаляем сотрудника
    delete this.gameState.teamMembers[positionId];
    
    // Обновляем статистику
    this.updateBusinessStats({
      capital: this.gameState.businessStats.capital + refund,
      expenses: this.gameState.businessStats.expenses - employee.salary,
      teamSize: Object.keys(this.gameState.teamMembers).length
    });
    
    this.saveProgress();
    
    return {
      success: true,
      message: `${employee.name} уволен`,
      refund: refund
    };
  }
  
  // Применение решения
  applyDecision(decisionId) {
    const decision = this.getDecisionById(decisionId);
    if (!decision) {
      throw new Error('Решение не найдено');
    }
    
    // Проверяем, что у нас достаточно капитала
    if (this.gameState.businessStats.capital < decision.impact.cost) {
      throw new Error('Недостаточно капитала для применения решения');
    }
    
    // Применяем решение
    const revenueIncrease = this.calculateRevenueIncrease(decision);
    const riskFactor = this.calculateRiskFactor(decision.impact.risk);
    
    // Обновляем статистику
    this.updateBusinessStats({
      capital: this.gameState.businessStats.capital - decision.impact.cost,
      expenses: this.gameState.businessStats.expenses + decision.impact.cost,
      revenue: this.gameState.businessStats.revenue + revenueIncrease,
      growth: this.gameState.businessStats.growth + parseInt(decision.impact.revenue),
      reputation: this.gameState.businessStats.reputation + riskFactor
    });
    
    // Добавляем решение в историю
    this.gameState.decisions.push({
      id: decisionId,
      appliedAt: Date.now(),
      impact: {
        revenue: revenueIncrease,
        reputation: riskFactor
      }
    });
    
    this.saveProgress();
    
    return {
      success: true,
      message: `Решение "${decision.title}" применено`,
      impact: {
        revenue: revenueIncrease,
        reputation: riskFactor
      }
    };
  }
  
  // Получение решения по ID
  getDecisionById(decisionId) {
    const decisions = window.BUSINESS_QUEST_DATA?.decisions || [];
    return decisions.find(decision => decision.id === decisionId);
  }
  
  // Расчет увеличения дохода
  calculateRevenueIncrease(decision) {
    const baseRevenue = this.gameState.businessStats.revenue || 10000;
    const increasePercent = parseInt(decision.impact.revenue);
    return Math.floor(baseRevenue * (increasePercent / 100));
  }
  
  // Расчет фактора риска
  calculateRiskFactor(risk) {
    switch (risk) {
      case 'Низкий': return 5;
      case 'Средний': return 3;
      case 'Высокий': return 1;
      default: return 2;
    }
  }
  
  // Обновление бизнес-статистики
  updateBusinessStats(newStats) {
    this.gameState.businessStats = { ...this.gameState.businessStats, ...newStats };
    
    // Пересчитываем прибыль
    this.gameState.businessStats.profit = 
      this.gameState.businessStats.revenue - this.gameState.businessStats.expenses;
    
    // Проверяем банкротство
    if (this.gameState.businessStats.capital < 0) {
      this.gameState.businessStats.capital = 0;
      this.gameState.businessStats.reputation = Math.max(0, this.gameState.businessStats.reputation - 10);
    }
  }
  
  // Переход к следующему этапу
  nextStage() {
    if (this.gameState.currentStage < 4) {
      this.gameState.currentStage++;
      this.saveProgress();
      
      return {
        success: true,
        message: `Переход к этапу ${this.gameState.currentStage}`,
        newStage: this.gameState.currentStage
      };
    } else {
      throw new Error('Квест уже завершен');
    }
  }
  
  // Проверка завершения квеста
  checkQuestCompletion() {
    const conditions = [
      this.gameState.selectedNiche !== null,
      Object.keys(this.gameState.teamMembers).length >= 4,
      this.gameState.businessStats.revenue >= 100000
    ];
    
    return conditions.every(condition => condition === true);
  }
  
  // Завершение квеста
  completeQuest() {
    if (!this.checkQuestCompletion()) {
      throw new Error('Не все условия завершения выполнены');
    }
    
    this.gameState.isRunning = false;
    this.gameState.currentStage = 4;
    
    // Рассчитываем финальные награды
    const rewards = this.calculateFinalRewards();
    
    this.saveProgress();
    
    return {
      success: true,
      message: 'Квест успешно завершен!',
      rewards: rewards,
      finalStats: this.gameState.businessStats
    };
  }
  
  // Расчет финальных наград
  calculateFinalRewards() {
    const baseRewards = window.BUSINESS_QUEST_DATA?.config?.rewards || {
      mulacoins: 3,
      xp: 200
    };
    
    // Бонусы за достижения
    let bonusMulacoins = 0;
    let bonusXP = 0;
    
    // Бонус за размер команды
    if (Object.keys(this.gameState.teamMembers).length >= 6) {
      bonusMulacoins += 1;
      bonusXP += 50;
    }
    
    // Бонус за высокий доход
    if (this.gameState.businessStats.revenue >= 200000) {
      bonusMulacoins += 1;
      bonusXP += 100;
    }
    
    // Бонус за высокую репутацию
    if (this.gameState.businessStats.reputation >= 50) {
      bonusMulacoins += 1;
      bonusXP += 75;
    }
    
    return {
      mulacoins: baseRewards.mulacoins + bonusMulacoins,
      xp: baseRewards.xp + bonusXP,
      achievement: 'Предприниматель'
    };
  }
  
  // Получение аналитики команды
  getTeamAnalytics() {
    const employees = Object.values(this.gameState.teamMembers);
    
    if (employees.length === 0) {
      return null;
    }
    
    // Аналитика по ролям
    const roleDistribution = {};
    employees.forEach(emp => {
      const position = this.getPositionById(emp.position);
      const role = position ? position.title : 'Неизвестно';
      roleDistribution[role] = (roleDistribution[role] || 0) + 1;
    });
    
    // Средние показатели
    const avgStats = {
      efficiency: employees.reduce((sum, emp) => sum + emp.efficiency, 0) / employees.length,
      creativity: employees.reduce((sum, emp) => sum + emp.creativity, 0) / employees.length,
      leadership: employees.reduce((sum, emp) => sum + emp.leadership, 0) / employees.length
    };
    
    // Зарплатная статистика
    const salaries = employees.map(emp => emp.salary).sort((a, b) => a - b);
    const totalSalaries = salaries.reduce((sum, salary) => sum + salary, 0);
    
    return {
      teamSize: employees.length,
      roleDistribution,
      avgStats,
      salaryStats: {
        total: totalSalaries,
        avg: Math.round(totalSalaries / employees.length),
        min: salaries[0] || 0,
        max: salaries[salaries.length - 1] || 0
      },
      topPerformers: employees
        .sort((a, b) => (a.efficiency + a.creativity + a.leadership) - (b.efficiency + b.creativity + b.leadership))
        .slice(0, 3)
        .map(emp => ({ 
          name: emp.name, 
          position: this.getPositionById(emp.position)?.title || 'Неизвестно',
          performance: Math.round((emp.efficiency + emp.creativity + emp.leadership) / 3)
        }))
    };
  }
  
  // Генерация отчета о бизнесе
  generateBusinessReport() {
    const niche = this.gameState.selectedNiche;
    const employees = Object.values(this.gameState.teamMembers);
    const monthlyProfit = this.gameState.businessStats.revenue - this.gameState.businessStats.expenses;
    
    return {
      summary: {
        niche: niche?.name || 'Не выбрана',
        teamSize: employees.length,
        monthlyRevenue: this.gameState.businessStats.revenue,
        monthlyExpenses: this.gameState.businessStats.expenses,
        monthlyProfit,
        businessAge: Math.floor((Date.now() - this.gameState.startTime) / (1000 * 60 * 60 * 24))
      },
      team: employees.map(emp => ({
        name: emp.name,
        position: this.getPositionById(emp.position)?.title || 'Неизвестно',
        salary: emp.salary,
        performance: Math.round((emp.efficiency + emp.creativity + emp.leadership) / 3),
        experience: emp.experience || 'Не указано'
      })),
      financials: {
        startingCapital: 100000,
        currentCapital: this.gameState.businessStats.capital,
        totalInvested: 100000 - this.gameState.businessStats.capital + (niche?.startupCost || 0),
        breakEvenPoint: monthlyProfit > 0 ? Math.ceil((100000 - this.gameState.businessStats.capital) / monthlyProfit) : null
      },
      recommendations: this.generateBusinessRecommendations()
    };
  }
  
  // Генерация рекомендаций
  generateBusinessRecommendations() {
    const recommendations = [];
    const monthlyProfit = this.gameState.businessStats.revenue - this.gameState.businessStats.expenses;
    
    if (monthlyProfit <= 0) {
      recommendations.push({
        type: 'urgent',
        title: 'Достижение прибыльности',
        description: 'Необходимо срочно оптимизировать расходы или увеличить доходы'
      });
    }
    
    if (Object.keys(this.gameState.teamMembers).length < 5) {
      recommendations.push({
        type: 'growth',
        title: 'Расширение команды',
        description: 'Рассмотрите найм дополнительных специалистов для ускорения роста'
      });
    }
    
    if (this.gameState.businessStats.capital < 10000) {
      recommendations.push({
        type: 'financial',
        title: 'Управление капиталом',
        description: 'Следите за уровнем оборотного капитала для обеспечения стабильности'
      });
    }
    
    return recommendations;
  }
  
  // Сброс квеста
  resetQuest() {
    this.gameState = {
      currentStage: 1,
      selectedNiche: null,
      teamMembers: {},
      businessStats: {
        revenue: 0,
        growth: 0,
        teamSize: 0,
        reputation: 0,
        capital: 100000,
        expenses: 0,
        profit: 0
      },
      decisions: [],
      startTime: Date.now(),
      isRunning: true
    };
    
    // Удаляем сохраненный прогресс
    localStorage.removeItem('businessQuestProgress');
    
    return {
      success: true,
      message: 'Квест сброшен к началу'
    };
  }
  
  // Получение статистики производительности
  getPerformanceStats() {
    const employees = Object.values(this.gameState.teamMembers);
    
    if (employees.length === 0) {
      return null;
    }
    
    const totalEfficiency = employees.reduce((sum, emp) => sum + emp.efficiency, 0);
    const totalCreativity = employees.reduce((sum, emp) => sum + emp.creativity, 0);
    const totalLeadership = employees.reduce((sum, emp) => sum + emp.leadership, 0);
    
    return {
      averageEfficiency: Math.round(totalEfficiency / employees.length),
      averageCreativity: Math.round(totalCreativity / employees.length),
      averageLeadership: Math.round(totalLeadership / employees.length),
      totalPerformance: Math.round((totalEfficiency + totalCreativity + totalLeadership) / employees.length),
      teamSynergy: this.calculateTeamSynergy(employees)
    };
  }
  
  // Расчет синергии команды
  calculateTeamSynergy(employees) {
    if (employees.length < 2) return 0;
    
    let synergy = 0;
    
    // Проверяем разнообразие навыков
    const skillSets = employees.map(emp => ({
      efficiency: emp.efficiency > 70,
      creativity: emp.creativity > 70,
      leadership: emp.leadership > 70
    }));
    
    const hasEfficiency = skillSets.some(set => set.efficiency);
    const hasCreativity = skillSets.some(set => set.creativity);
    const hasLeadership = skillSets.some(set => set.leadership);
    
    if (hasEfficiency && hasCreativity && hasLeadership) {
      synergy += 20; // Полный набор навыков
    } else if ((hasEfficiency && hasCreativity) || (hasEfficiency && hasLeadership) || (hasCreativity && hasLeadership)) {
      synergy += 10; // Частичный набор навыков
    }
    
    // Бонус за размер команды
    if (employees.length >= 4) {
      synergy += 15;
    } else if (employees.length >= 2) {
      synergy += 5;
    }
    
    return Math.min(synergy, 100);
  }
}

// Создаем экземпляр движка при загрузке страницы
let businessEngine = null;

document.addEventListener('DOMContentLoaded', function() {
  businessEngine = new BusinessQuestEngine();
});

// Экспортируем для использования в других модулях
window.BusinessQuestEngine = BusinessQuestEngine;
window.businessEngine = businessEngine;

console.log('Business Quest Engine system loaded successfully!');
