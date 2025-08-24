/* ===== INFLUENCE EMPIRE ENGINE ===== */

class InfluenceEmpireEngine {
  constructor() {
    this.gameState = {
      isRunning: false,
      currentStage: 1,
      metrics: {
        followers: EMPIRE_CONFIG.startingMetrics.followers,
        revenue: EMPIRE_CONFIG.startingMetrics.revenue,
        influence: EMPIRE_CONFIG.startingMetrics.influence,
        reputation: EMPIRE_CONFIG.startingMetrics.reputation,
        engagement: 10,
        conversion: 2,
        reach: 5000
      },
      platforms: {
        youtube: { followers: 0, revenue: 0, strategy: null },
        instagram: { followers: 0, revenue: 0, strategy: null },
        tiktok: { followers: 0, revenue: 0, strategy: null },
        telegram: { followers: 0, revenue: 0, strategy: null }
      },
      placedStrategies: [],
      events: [],
      decisions: [],
      startTime: null,
      stageProgress: {
        1: { completed: false, score: 0 },
        2: { completed: false, score: 0 },
        3: { completed: false, score: 0 },
        4: { completed: false, score: 0 },
        5: { completed: false, score: 0 }
      }
    };
    
    this.eventLog = [];
  }

  // Инициализация движка
  initialize() {
    this.resetGameState();
    this.logEvent('info', 'Империя влияния инициализирована');
  }

  // Сброс состояния игры
  resetGameState() {
    this.gameState = {
      isRunning: false,
      currentStage: 1,
      metrics: {
        followers: EMPIRE_CONFIG.startingMetrics.followers,
        revenue: EMPIRE_CONFIG.startingMetrics.revenue,
        influence: EMPIRE_CONFIG.startingMetrics.influence,
        reputation: EMPIRE_CONFIG.startingMetrics.reputation,
        engagement: 10,
        conversion: 2,
        reach: 5000
      },
      platforms: {
        youtube: { followers: 0, revenue: 0, strategy: null },
        instagram: { followers: 0, revenue: 0, strategy: null },
        tiktok: { followers: 0, revenue: 0, strategy: null },
        telegram: { followers: 0, revenue: 0, strategy: null }
      },
      placedStrategies: [],
      events: [],
      decisions: [],
      startTime: null,
      stageProgress: {
        1: { completed: false, score: 0 },
        2: { completed: false, score: 0 },
        3: { completed: false, score: 0 },
        4: { completed: false, score: 0 },
        5: { completed: false, score: 0 }
      }
    };
    
    this.eventLog = [];
  }

  // Запуск империи
  startEmpire() {
    this.gameState.isRunning = true;
    this.gameState.startTime = Date.now();
    this.logEvent('success', 'Создание медиа-империи началось!');
    return true;
  }

  // Размещение стратегии на платформе
  placeStrategy(strategyId, platform) {
    const strategy = InfluenceDataService.getStrategyById(strategyId);
    if (!strategy) {
      this.logEvent('error', 'Стратегия не найдена');
      return false;
    }

    // Проверяем, не занята ли платформа
    if (this.gameState.platforms[platform].strategy) {
      this.logEvent('warning', 'Платформа уже занята');
      return false;
    }

    // Размещаем стратегию
    this.gameState.platforms[platform].strategy = strategy;
    this.gameState.placedStrategies.push({
      strategyId,
      platform,
      placedAt: Date.now()
    });

    // Применяем эффекты стратегии
    this.applyStrategyEffects(strategy, platform);
    
    this.logEvent('success', `Стратегия "${strategy.name}" размещена на ${platform}`);
    
    // Проверяем возможность перехода к следующему этапу
    this.checkStageCompletion();
    
    return true;
  }

  // Применение эффектов стратегии
  applyStrategyEffects(strategy, platform) {
    const effects = InfluenceDataService.calculateStrategyEffect(strategy, platform);
    
    // Применяем эффекты к общим метрикам
    for (let [metric, value] of Object.entries(effects)) {
      if (this.gameState.metrics.hasOwnProperty(metric)) {
        this.gameState.metrics[metric] = Math.max(0, this.gameState.metrics[metric] + value);
      }
    }
    
    // Применяем эффекты к конкретной платформе
    if (effects.followers) {
      this.gameState.platforms[platform].followers += Math.round(effects.followers * 0.7);
    }
    
    if (effects.revenue) {
      this.gameState.platforms[platform].revenue += effects.revenue;
    }
    
    // Обновляем общие метрики на основе платформ
    this.updateGlobalMetrics();
    
    // Логируем изменения
    this.logEffects(effects, platform);
  }

  // Обновление глобальных метрик
  updateGlobalMetrics() {
    // Подсчитываем общее количество подписчиков
    let totalFollowers = EMPIRE_CONFIG.startingMetrics.followers;
    let totalRevenue = 0;
    
    for (let [platform, data] of Object.entries(this.gameState.platforms)) {
      totalFollowers += data.followers;
      totalRevenue += data.revenue;
    }
    
    this.gameState.metrics.followers = totalFollowers;
    this.gameState.metrics.revenue = totalRevenue;
    
    // Обновляем охват на основе подписчиков
    this.gameState.metrics.reach = Math.round(totalFollowers * (1.5 + this.gameState.metrics.engagement / 100));
    
    // Ограничиваем репутацию
    this.gameState.metrics.reputation = Math.max(0, Math.min(100, this.gameState.metrics.reputation));
  }

  // Логирование эффектов
  logEffects(effects, platform) {
    for (let [metric, value] of Object.entries(effects)) {
      if (value !== 0) {
        const sign = value > 0 ? '+' : '';
        this.logEvent('info', `${platform}: ${metric} ${sign}${value}`);
      }
    }
  }

  // Генерация случайного события
  generateRandomEvent() {
    const event = InfluenceDataService.getRandomEvent();
    if (!event) return null;
    
    const eventData = {
      ...event,
      id: `${event.id}_${Date.now()}`,
      occurredAt: Date.now()
    };
    
    this.gameState.events.push(eventData);
    
    // Применяем эффекты события
    const effects = InfluenceDataService.calculateEventEffect(event);
    this.applyEventEffects(effects);
    
    this.logEvent('warning', `Событие: ${event.name}`);
    
    return eventData;
  }

  // Применение эффектов события
  applyEventEffects(effects) {
    for (let [metric, value] of Object.entries(effects)) {
      if (this.gameState.metrics.hasOwnProperty(metric)) {
        this.gameState.metrics[metric] = Math.max(0, this.gameState.metrics[metric] + value);
      }
    }
    
    // Если событие влияет на подписчиков, распределяем по платформам
    if (effects.followers) {
      const activePlatforms = Object.keys(this.gameState.platforms).filter(
        p => this.gameState.platforms[p].strategy
      );
      
      if (activePlatforms.length > 0) {
        const followersPerPlatform = Math.round(effects.followers / activePlatforms.length);
        activePlatforms.forEach(platform => {
          this.gameState.platforms[platform].followers = Math.max(0, 
            this.gameState.platforms[platform].followers + followersPerPlatform
          );
        });
      }
    }
    
    this.updateGlobalMetrics();
  }

  // Переход к следующему этапу
  nextStage() {
    if (this.gameState.currentStage >= EMPIRE_CONFIG.stages) {
      return this.completeEmpire();
    }

    // Завершаем текущий этап
    this.gameState.stageProgress[this.gameState.currentStage].completed = true;
    this.gameState.stageProgress[this.gameState.currentStage].score = this.calculateStageScore();
    
    this.gameState.currentStage++;
    
    // Очищаем размещенные стратегии для нового этапа
    this.gameState.placedStrategies = [];
    Object.keys(this.gameState.platforms).forEach(platform => {
      this.gameState.platforms[platform].strategy = null;
    });
    
    this.logEvent('info', `Переход на этап ${this.gameState.currentStage}: ${InfluenceDataService.getStageDescription(this.gameState.currentStage)}`);
    
    return true;
  }

  // Расчет очков за этап
  calculateStageScore() {
    let score = 0;
    
    // Очки за размещенные стратегии
    score += this.gameState.placedStrategies.length * 100;
    
    // Очки за метрики
    score += Math.round(this.gameState.metrics.influence * 2);
    score += Math.round(this.gameState.metrics.engagement);
    score += Math.round(this.gameState.metrics.conversion * 10);
    
    // Бонус за репутацию
    if (this.gameState.metrics.reputation >= 80) {
      score += 200;
    } else if (this.gameState.metrics.reputation >= 60) {
      score += 100;
    }
    
    return Math.max(0, score);
  }

  // Проверка завершения этапа
  checkStageCompletion() {
    const requiredStrategies = Math.min(3, EMPIRE_CONFIG.maxStrategiesPerStage);
    const placedStrategies = this.gameState.placedStrategies.length;
    
    return placedStrategies >= requiredStrategies;
  }

  // Можно ли перейти к следующему этапу
  canProceedToNextStage() {
    return this.checkStageCompletion();
  }

  // Завершение создания империи
  completeEmpire() {
    this.gameState.isRunning = false;
    
    const finalMetrics = this.calculateFinalMetrics();
    const rewards = this.calculateRewards(finalMetrics);
    
    this.logEvent('success', `Империя влияния создана! Финальный счет: ${finalMetrics.totalScore}`);
    
    return {
      success: true,
      finalMetrics,
      rewards,
      completionTime: Date.now() - this.gameState.startTime,
      empireSummary: this.generateEmpireSummary()
    };
  }

  // Расчет финальных метрик
  calculateFinalMetrics() {
    let totalScore = 0;
    
    // Очки за каждый этап
    for (let stage of Object.values(this.gameState.stageProgress)) {
      totalScore += stage.score;
    }
    
    // Бонусы за финальные метрики
    const followersBonus = Math.round(this.gameState.metrics.followers / 1000) * 10; // 10 очков за 1K подписчиков
    const revenueBonus = Math.round(this.gameState.metrics.revenue / 100) * 5; // 5 очков за $100 дохода
    const influenceBonus = this.gameState.metrics.influence * 20; // 20 очков за единицу влияния
    
    totalScore += followersBonus + revenueBonus + influenceBonus;
    
    // Штраф за низкую репутацию
    if (this.gameState.metrics.reputation < 50) {
      totalScore = Math.round(totalScore * 0.7);
    }
    
    return {
      totalScore: Math.max(0, totalScore),
      followers: this.gameState.metrics.followers,
      revenue: this.gameState.metrics.revenue,
      influence: this.gameState.metrics.influence,
      reputation: this.gameState.metrics.reputation,
      engagement: this.gameState.metrics.engagement,
      conversion: this.gameState.metrics.conversion,
      reach: this.gameState.metrics.reach,
      stagesCompleted: Object.values(this.gameState.stageProgress).filter(s => s.completed).length,
      eventsHandled: this.gameState.events.length
    };
  }

  // Расчет наград
  calculateRewards(finalMetrics) {
    const baseRewards = EMPIRE_CONFIG.rewards;
    let multiplier = 1;
    
    if (finalMetrics.totalScore >= 5000) {
      multiplier = 2.0; // Легендарная империя
    } else if (finalMetrics.totalScore >= 3000) {
      multiplier = 1.5; // Влиятельная империя
    } else if (finalMetrics.totalScore >= 1500) {
      multiplier = 1.2; // Успешная империя
    } else if (finalMetrics.totalScore >= 800) {
      multiplier = 1.0; // Базовые награды
    } else {
      multiplier = 0.7; // Начинающая империя
    }
    
    // Дополнительный бонус за репутацию
    if (finalMetrics.reputation >= 80) {
      multiplier += 0.2;
    }
    
    return {
      mulacoin: Math.round(baseRewards.mulacoin * multiplier),
      experience: Math.round(baseRewards.experience * multiplier),
      multiplier: Math.round(multiplier * 100) / 100
    };
  }

  // Генерация резюме империи
  generateEmpireSummary() {
    const activePlatforms = Object.keys(this.gameState.platforms).filter(
      platform => this.gameState.platforms[platform].followers > 0
    );
    
    const mostSuccessfulPlatform = activePlatforms.reduce((best, current) => {
      if (!best) return current;
      return this.gameState.platforms[current].followers > this.gameState.platforms[best].followers 
        ? current : best;
    }, null);
    
    return {
      platforms: this.gameState.platforms,
      activePlatforms: activePlatforms.length,
      mostSuccessfulPlatform,
      strategiesUsed: this.gameState.placedStrategies.length,
      eventsExperienced: this.gameState.events.length,
      finalMetrics: this.gameState.metrics,
      completionTime: Date.now() - this.gameState.startTime,
      stageScores: this.gameState.stageProgress
    };
  }

  // Удаление стратегии с платформы
  removeStrategy(platform) {
    if (this.gameState.platforms[platform].strategy) {
      const strategy = this.gameState.platforms[platform].strategy;
      this.gameState.platforms[platform].strategy = null;
      
      // Удаляем из списка размещенных стратегий
      this.gameState.placedStrategies = this.gameState.placedStrategies.filter(
        s => s.platform !== platform
      );
      
      this.logEvent('info', `Стратегия "${strategy.name}" удалена с ${platform}`);
      return true;
    }
    
    return false;
  }

  // Получение подсказки для текущего этапа
  getStageHint() {
    const hints = InfluenceDataService.getPsychologyHints(this.gameState.currentStage);
    if (hints.length === 0) return null;
    
    return hints[Math.floor(Math.random() * hints.length)];
  }

  // Получение рекомендаций для улучшения
  getRecommendations() {
    const recommendations = [];
    
    if (this.gameState.metrics.engagement < 20) {
      recommendations.push("Используйте стратегии для повышения вовлеченности аудитории");
    }
    
    if (this.gameState.metrics.conversion < 5) {
      recommendations.push("Сфокусируйтесь на монетизации - добавьте стратегии конверсии");
    }
    
    if (this.gameState.metrics.reputation < 60) {
      recommendations.push("Будьте осторожны с репутацией - она влияет на финальный счет");
    }
    
    const activePlatforms = Object.keys(this.gameState.platforms).filter(
      p => this.gameState.platforms[p].strategy
    );
    
    if (activePlatforms.length < 2) {
      recommendations.push("Расширьте присутствие на большем количестве платформ");
    }
    
    if (this.gameState.metrics.influence < 50) {
      recommendations.push("Увеличьте влияние через авторитетные стратегии");
    }
    
    return recommendations;
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
    if (this.eventLog.length > 100) {
      this.eventLog.shift();
    }
  }

  // Получение состояния игры
  getGameState() {
    return { ...this.gameState };
  }

  // Получение лога событий
  getEventLog() {
    return [...this.eventLog];
  }

  // Сохранение прогресса
  saveProgress() {
    const saveData = {
      gameState: this.gameState,
      eventLog: this.eventLog,
      timestamp: Date.now()
    };
    
    localStorage.setItem('influenceEmpireProgress', JSON.stringify(saveData));
  }

  // Загрузка прогресса
  loadProgress() {
    const saveData = localStorage.getItem('influenceEmpireProgress');
    if (saveData) {
      try {
        const parsed = JSON.parse(saveData);
        this.gameState = parsed.gameState;
        this.eventLog = parsed.eventLog;
        return true;
      } catch (error) {
        console.error('Ошибка загрузки прогресса:', error);
        return false;
      }
    }
    return false;
  }

  // Получение статистики по платформам
  getPlatformStats() {
    const stats = {};
    
    for (let [platform, data] of Object.entries(this.gameState.platforms)) {
      stats[platform] = {
        followers: data.followers,
        revenue: data.revenue,
        hasStrategy: !!data.strategy,
        strategyName: data.strategy?.name || null,
        performance: this.calculatePlatformPerformance(platform)
      };
    }
    
    return stats;
  }

  // Расчет производительности платформы
  calculatePlatformPerformance(platform) {
    const data = this.gameState.platforms[platform];
    if (!data.strategy) return 0;
    
    let score = 0;
    score += data.followers / 1000; // 1 балл за 1K подписчиков
    score += data.revenue / 100; // 1 балл за $100 дохода
    
    return Math.round(score);
  }

  // Проверка совместимости стратегии с платформой
  isStrategyCompatible(strategyId, platform) {
    const strategy = InfluenceDataService.getStrategyById(strategyId);
    if (!strategy) return false;
    
    return strategy.platforms.includes(platform) || strategy.platforms.includes('all');
  }

  // Получение эффективности стратегии для платформы
  getStrategyEffectiveness(strategyId, platform) {
    if (!this.isStrategyCompatible(strategyId, platform)) return 0.5;
    
    const strategy = InfluenceDataService.getStrategyById(strategyId);
    if (!strategy) return 0;
    
    // Базовая эффективность
    let effectiveness = 1.0;
    
    // Бонус за идеальную совместимость
    if (strategy.platforms.includes(platform)) {
      effectiveness += 0.3;
    }
    
    // Учитываем сложность стратегии
    const difficultyMultipliers = {
      'low': 1.0,
      'medium': 1.1,
      'high': 1.2,
      'very-high': 1.3,
      'legendary': 1.5
    };
    
    effectiveness *= difficultyMultipliers[strategy.difficulty] || 1.0;
    
    return Math.min(2.0, effectiveness); // Максимум 200% эффективности
  }
}
