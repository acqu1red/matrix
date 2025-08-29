/* ===== BUSINESS QUEST ENGINE ===== */

class BusinessQuestEngine {
  constructor() {
    this.gameState = {
      currentStage: 1,
      progress: 0,
      isRunning: false,
      isCompleted: false,
      selectedNiche: null,
      team: {},
      businessStats: {
        revenue: 0,
        growth: 0,
        teamSize: 0,
        reputation: 0,
        efficiency: 1.0,
        cost: 0
      },
      quarter: 1,
      totalQuarters: 4,
      achievements: [],
      decisions: [],
      events: []
    };
    
    this.candidates = [];
    this.positions = [];
    this.niches = [];
    this.decisions = [];
    this.events = [];
    
    this.initializeData();
  }
  
  // Инициализация данных
  initializeData() {
    try {
      if (window.BUSINESS_DATA) {
        this.candidates = window.BUSINESS_DATA.candidates || [];
        this.positions = window.BUSINESS_DATA.positions || [];
        this.niches = window.BUSINESS_DATA.niches || [];
        this.decisions = window.BUSINESS_DATA.decisions || [];
        this.events = window.BUSINESS_DATA.events || [];
      } else {
        console.warn('BUSINESS_DATA не найден, используем встроенные данные');
        this.loadFallbackData();
      }
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      this.loadFallbackData();
    }
  }
  
  // Запасные данные
  loadFallbackData() {
    this.candidates = CANDIDATES_DATABASE || [];
    this.positions = POSITIONS || [];
    this.niches = BUSINESS_NICHES || [];
    this.decisions = BUSINESS_DECISIONS || [];
    this.events = BUSINESS_EVENTS || [];
  }
  
  // Инициализация движка
  initialize() {
    console.log('🚀 Инициализация BusinessQuestEngine...');
    
    this.gameState.isRunning = true;
    this.loadProgress();
    
    console.log('✅ BusinessQuestEngine инициализирован');
  }
  
  // Загрузка прогресса
  loadProgress() {
    try {
      const savedProgress = localStorage.getItem('businessQuestProgress');
      if (savedProgress) {
        const parsed = JSON.parse(savedProgress);
        this.gameState = { ...this.gameState, ...parsed };
        console.log('📁 Прогресс загружен:', this.gameState);
      }
    } catch (error) {
      console.error('Ошибка загрузки прогресса:', error);
    }
  }
  
  // Сохранение прогресса
  saveProgress() {
    try {
      const progressData = {
        currentStage: this.gameState.currentStage,
        progress: this.gameState.progress,
        selectedNiche: this.gameState.selectedNiche,
        team: this.gameState.team,
        businessStats: this.gameState.businessStats,
        quarter: this.gameState.quarter,
        achievements: this.gameState.achievements,
        decisions: this.gameState.decisions,
        events: this.gameState.events
      };
      
      localStorage.setItem('businessQuestProgress', JSON.stringify(progressData));
      console.log('💾 Прогресс сохранен');
    } catch (error) {
      console.error('Ошибка сохранения прогресса:', error);
    }
  }
  
  // Выбор ниши
  selectNiche(nicheId) {
    const niche = this.niches.find(n => n.id === nicheId);
    if (niche) {
      this.gameState.selectedNiche = niche;
      this.gameState.businessStats.revenue = niche.metrics.monthlyRevenue;
      this.gameState.businessStats.growth = parseFloat(niche.metrics.growth);
      this.gameState.businessStats.cost = niche.metrics.startupCost;
      
      console.log('🎯 Выбрана ниша:', niche.name);
      this.saveProgress();
      return true;
    }
    return false;
  }
  
  // Получение выбранной ниши
  getSelectedNiche() {
    return this.gameState.selectedNiche;
  }
  
  // Подбор кандидата на должность
  assignCandidate(candidateId, positionId) {
    const candidate = this.candidates.find(c => c.id === candidateId);
    const position = this.positions.find(p => p.id === positionId);
    
    if (candidate && position && candidate.role === positionId) {
      this.gameState.team[positionId] = {
        candidate: candidate,
        position: position,
        assignedAt: new Date().toISOString()
      };
      
      // Обновляем статистику бизнеса
      this.updateBusinessStats();
      
      console.log(`👥 Кандидат ${candidate.name} назначен на должность ${position.title}`);
      this.saveProgress();
      return true;
    }
    
    return false;
  }
  
  // Удаление кандидата с должности
  removeCandidate(positionId) {
    if (this.gameState.team[positionId]) {
      delete this.gameState.team[positionId];
      this.updateBusinessStats();
      this.saveProgress();
      return true;
    }
    return false;
  }
  
  // Проверка завершения команды
  isTeamComplete() {
    const requiredPositions = this.gameState.selectedNiche?.requiredRoles || [];
    const filledPositions = Object.keys(this.gameState.team);
    
    return requiredPositions.every(position => filledPositions.includes(position));
  }
  
  // Пропуск подбора команды
  skipTeamSelection() {
    // Автоматически заполняем минимально необходимые позиции
    const requiredPositions = this.gameState.selectedNiche?.requiredRoles || [];
    
    requiredPositions.forEach(positionId => {
      if (!this.gameState.team[positionId]) {
        const availableCandidates = this.candidates.filter(c => c.role === positionId);
        if (availableCandidates.length > 0) {
          const randomCandidate = availableCandidates[Math.floor(Math.random() * availableCandidates.length)];
          this.assignCandidate(randomCandidate.id, positionId);
        }
      }
    });
    
    console.log('⏭️ Подбор команды пропущен, позиции заполнены автоматически');
  }
  
  // Обновление статистики бизнеса
  updateBusinessStats() {
    const teamSize = Object.keys(this.gameState.team).length;
    const totalEfficiency = Object.values(this.gameState.team).reduce((sum, assignment) => {
      return sum + (assignment.candidate.efficiency || 0.8);
    }, 0);
    
    const avgEfficiency = teamSize > 0 ? totalEfficiency / teamSize : 1.0;
    const baseRevenue = this.gameState.selectedNiche?.metrics.monthlyRevenue || 10000;
    
    this.gameState.businessStats = {
      ...this.gameState.businessStats,
      teamSize: teamSize,
      efficiency: avgEfficiency,
      revenue: Math.round(baseRevenue * avgEfficiency * (1 + this.gameState.growth / 100)),
      growth: this.gameState.businessStats.growth + (avgEfficiency > 0.8 ? 5 : 0)
    };
  }
  
  // Следующий квартал
  nextQuarter() {
    if (this.gameState.quarter < this.gameState.totalQuarters) {
      this.gameState.quarter++;
      
      // Применяем эффекты решений
      this.applyDecisionsEffects();
      
      // Генерируем случайные события
      this.generateRandomEvent();
      
      // Обновляем статистику
      this.updateBusinessStats();
      
      // Проверяем достижения
      this.checkAchievements();
      
      console.log(`📅 Переход к кварталу ${this.gameState.quarter}`);
      this.saveProgress();
      
      return true;
    } else {
      this.completeQuest();
      return false;
    }
  }
  
  // Применение эффектов решений
  applyDecisionsEffects() {
    this.gameState.decisions.forEach(decision => {
      if (decision.effect) {
        Object.entries(decision.effect).forEach(([stat, multiplier]) => {
          if (this.gameState.businessStats[stat] !== undefined) {
            this.gameState.businessStats[stat] *= multiplier;
          }
        });
      }
    });
  }
  
  // Генерация случайного события
  generateRandomEvent() {
    const randomEvent = this.events.find(event => {
      return Math.random() < event.probability;
    });
    
    if (randomEvent) {
      this.gameState.events.push({
        ...randomEvent,
        occurredAt: new Date().toISOString()
      });
      
      // Применяем эффекты события
      if (randomEvent.effect) {
        Object.entries(randomEvent.effect).forEach(([stat, multiplier]) => {
          if (this.gameState.businessStats[stat] !== undefined) {
            this.gameState.businessStats[stat] *= multiplier;
          }
        });
      }
      
      console.log('🎲 Произошло событие:', randomEvent.title);
    }
  }
  
  // Принятие решения
  makeDecision(decisionId) {
    const decision = this.decisions.find(d => d.id === decisionId);
    
    if (decision && this.gameState.businessStats.revenue >= decision.cost) {
      this.gameState.businessStats.revenue -= decision.cost;
      this.gameState.decisions.push({
        ...decision,
        madeAt: new Date().toISOString()
      });
      
      console.log('🎯 Принято решение:', decision.title);
      this.saveProgress();
      return true;
    }
    
    return false;
  }
  
  // Проверка достижений
  checkAchievements() {
    const achievements = window.BUSINESS_DATA?.achievements || [];
    
    achievements.forEach(achievement => {
      if (!this.gameState.achievements.includes(achievement.id)) {
        let earned = false;
        
        switch (achievement.id) {
          case 'first_employee':
            earned = this.gameState.businessStats.teamSize >= 1;
            break;
          case 'first_profit':
            earned = this.gameState.businessStats.revenue > 0;
            break;
          case 'team_complete':
            earned = this.isTeamComplete();
            break;
          case 'business_growth':
            earned = this.gameState.businessStats.growth >= 100;
            break;
          case 'market_leader':
            earned = this.gameState.businessStats.reputation >= 80;
            break;
        }
        
        if (earned) {
          this.gameState.achievements.push(achievement.id);
          console.log('🏆 Получено достижение:', achievement.title);
        }
      }
    });
  }
  
  // Получение финальных результатов
  getFinalResults() {
    const totalRevenue = this.gameState.businessStats.revenue * this.gameState.quarter;
    const finalGrowth = this.gameState.businessStats.growth;
    const finalTeamSize = this.gameState.businessStats.teamSize;
    const finalReputation = this.gameState.businessStats.reputation;
    
    // Рассчитываем финальный балл
    const revenueScore = Math.min(totalRevenue / 100000, 1) * 100;
    const growthScore = Math.min(finalGrowth / 200, 1) * 100;
    const teamScore = Math.min(finalTeamSize / 6, 1) * 100;
    const reputationScore = Math.min(finalReputation / 100, 1) * 100;
    
    const finalScore = Math.round((revenueScore + growthScore + teamScore + reputationScore) / 4);
    
    return {
      totalRevenue: totalRevenue,
      finalGrowth: finalGrowth,
      finalTeamSize: finalTeamSize,
      finalReputation: finalReputation,
      finalScore: finalScore,
      achievements: this.gameState.achievements.length,
      decisions: this.gameState.decisions.length,
      events: this.gameState.events.length
    };
  }
  
  // Завершение квеста
  completeQuest() {
    this.gameState.isCompleted = true;
    this.gameState.isRunning = false;
    this.gameState.progress = 100;
    
    console.log('🏆 Квест завершен!');
    this.saveProgress();
    
    // Возвращаем награды
    return {
      mulacoin: 3,
      experience: 200,
      achievements: this.gameState.achievements.length
    };
  }
  
  // Сброс квеста
  reset() {
    this.gameState = {
      currentStage: 1,
      progress: 0,
      isRunning: false,
      isCompleted: false,
      selectedNiche: null,
      team: {},
      businessStats: {
        revenue: 0,
        growth: 0,
        teamSize: 0,
        reputation: 0,
        efficiency: 1.0,
        cost: 0
      },
      quarter: 1,
      totalQuarters: 4,
      achievements: [],
      decisions: [],
      events: []
    };
    
    localStorage.removeItem('businessQuestProgress');
    console.log('🔄 Квест сброшен');
  }
  
  // Получение состояния игры
  getGameState() {
    return { ...this.gameState };
  }
  
  // Получение доступных кандидатов
  getAvailableCandidates() {
    return this.candidates.filter(candidate => {
      // Исключаем уже назначенных кандидатов
      return !Object.values(this.gameState.team).some(assignment => 
        assignment.candidate.id === candidate.id
      );
    });
  }
  
  // Получение доступных должностей
  getAvailablePositions() {
    return this.positions.filter(position => {
      // Показываем только незаполненные должности
      return !this.gameState.team[position.id];
    });
  }
  
  // Получение статистики команды
  getTeamStats() {
    const teamStats = {
      totalSalary: 0,
      avgExperience: 0,
      avgEfficiency: 0,
      skills: []
    };
    
    const assignments = Object.values(this.gameState.team);
    
    if (assignments.length > 0) {
      teamStats.totalSalary = assignments.reduce((sum, assignment) => 
        sum + assignment.candidate.salary, 0
      );
      
      teamStats.avgExperience = assignments.reduce((sum, assignment) => 
        sum + assignment.candidate.experience, 0
      ) / assignments.length;
      
      teamStats.avgEfficiency = assignments.reduce((sum, assignment) => 
        sum + assignment.candidate.efficiency, 0
      ) / assignments.length;
      
      // Собираем все навыки команды
      assignments.forEach(assignment => {
        teamStats.skills.push(...assignment.candidate.skills);
      });
      
      teamStats.skills = [...new Set(teamStats.skills)]; // Убираем дубликаты
    }
    
    return teamStats;
  }
  
  // Получение рекомендаций
  getRecommendations() {
    const recommendations = [];
    
    // Рекомендации по команде
    if (this.gameState.businessStats.teamSize < 3) {
      recommendations.push({
        type: 'team',
        priority: 'high',
        message: 'Рекомендуется расширить команду для повышения эффективности',
        action: 'hire_more'
      });
    }
    
    // Рекомендации по финансам
    if (this.gameState.businessStats.revenue < 10000) {
      recommendations.push({
        type: 'finance',
        priority: 'medium',
        message: 'Рассмотрите возможность увеличения доходов',
        action: 'increase_revenue'
      });
    }
    
    // Рекомендации по росту
    if (this.gameState.businessStats.growth < 50) {
      recommendations.push({
        type: 'growth',
        priority: 'medium',
        message: 'Фокус на стратегиях роста бизнеса',
        action: 'focus_growth'
      });
    }
    
    return recommendations;
  }
  
  // Экспорт для отладки
  debug() {
    return {
      gameState: this.gameState,
      candidates: this.candidates.length,
      positions: this.positions.length,
      niches: this.niches.length,
      decisions: this.decisions.length,
      events: this.events.length
    };
  }
}

// Экспорт класса
window.BusinessQuestEngine = BusinessQuestEngine;
