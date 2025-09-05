/* ===== TRENDS QUEST ENGINE ===== */

class TrendsQuestEngine {
  constructor() {
    this.gameState = {
      currentStage: 0,
      score: 0,
      accuracy: 0,
      portfolio: 1000,
      reputation: 3,
      isRunning: false,
      startTime: null,
      
      // Прогресс по этапам
      stage1: {
        trendsAnalyzed: 0,
        correctPredictions: 0,
        currentTrendIndex: 0
      },
      stage2: {
        emotionAnalysis: null,
        postsAnalyzed: [],
        timeLeft: 60
      },
      stage3: {
        prediction: [],
        factors: [],
        confidence: 0
      },
      stage4: {
        investments: {},
        daysPassed: 0,
        newsIndex: 0,
        profitHistory: [1000]
      },
      
      // Достижения
      achievements: [],
      
      // История событий
      eventLog: []
    };
    
    // Привязка методов
    this.initialize = this.initialize.bind(this);
    this.startQuest = this.startQuest.bind(this);
    this.nextStage = this.nextStage.bind(this);
    this.completeQuest = this.completeQuest.bind(this);
    this.resetQuest = this.resetQuest.bind(this);
  }
  
  // Инициализация
  initialize() {
    this.loadProgress();
    return this;
  }
  
  // Запуск квеста
  startQuest() {
    this.gameState.isRunning = true;
    this.gameState.startTime = Date.now();
    this.gameState.currentStage = 1;
    this.logEvent('info', 'Квест "Анализ трендов" начат!');
    return this;
  }
  
  // Переход на следующий этап
  nextStage() {
    if (this.gameState.currentStage < QUEST_CONFIG.stages) {
      this.gameState.currentStage++;
      this.logEvent('info', `Переход на этап ${this.gameState.currentStage}`);
      this.saveProgress();
    }
    return this;
  }
  
  // Завершение квеста
  completeQuest() {
    this.gameState.isRunning = false;
    const finalScore = this.calculateFinalScore();
    this.gameState.score = finalScore;
    this.checkAchievements();
    this.logEvent('success', `Квест завершен! Итоговый счет: ${finalScore}`);
    this.saveProgress();
    return this;
  }
  
  // Сброс квеста
  resetQuest() {
    this.gameState = {
      currentStage: 0,
      score: 0,
      accuracy: 0,
      portfolio: 1000,
      reputation: 3,
      isRunning: false,
      startTime: null,
      
      stage1: {
        trendsAnalyzed: 0,
        correctPredictions: 0,
        currentTrendIndex: 0
      },
      stage2: {
        emotionAnalysis: null,
        postsAnalyzed: [],
        timeLeft: 60
      },
      stage3: {
        prediction: [],
        factors: [],
        confidence: 0
      },
      stage4: {
        investments: {},
        daysPassed: 0,
        newsIndex: 0,
        profitHistory: [1000]
      },
      
      achievements: [],
      eventLog: []
    };
    
    this.saveProgress();
    return this;
  }
  
  // STAGE 1: Анализ трендов
  getNextTrend() {
    const trend = TRENDS_DATA[this.gameState.stage1.currentTrendIndex];
    this.gameState.stage1.currentTrendIndex++;
    return trend;
  }
  
  processTrendSwipe(trendId, direction) {
    const trend = TRENDS_DATA.find(t => t.id === trendId);
    if (!trend) return { isCorrect: false, feedback: "Тренд не найден" };
    
    const isCorrect = (direction === 'right' && trend.isCorrect) || 
                     (direction === 'left' && !trend.isCorrect);
    
    if (isCorrect) {
      this.gameState.stage1.correctPredictions++;
      this.gameState.score += 10;
      this.logEvent('success', `Правильно! +10 очков`);
    } else {
      this.gameState.score = Math.max(0, this.gameState.score - 5);
      this.logEvent('error', `Неправильно! -5 очков`);
    }
    
    this.gameState.stage1.trendsAnalyzed++;
    
    // Проверяем завершение этапа
    if (this.gameState.stage1.trendsAnalyzed >= TRENDS_DATA.length) {
      this.nextStage();
    }
    
    return {
      isCorrect,
      feedback: isCorrect ? trend.explanation : `Неправильно. ${trend.explanation}`,
      score: this.gameState.score
    };
  }
  
  // STAGE 2: Эмоциональный анализ
  startEmotionAnalysis() {
    const posts = shuffleArray(SOCIAL_POSTS_DATA).slice(0, 8);
    this.gameState.stage2.emotionAnalysis = {
      posts: posts,
      emotions: {
        fear: 0,
        greed: 0,
        hope: 0,
        doubt: 0
      }
    };
    return posts;
  }
  
  analyzePost(author, emotion) {
    const analysis = this.gameState.stage2.emotionAnalysis;
    if (!analysis) return;
    
    analysis.emotions[emotion]++;
    analysis.postsAnalyzed.push({ author, emotion });
    
    // Бонус за правильный анализ
    this.gameState.score += 5;
    this.logEvent('info', `Проанализирован пост ${author}: ${emotion}`);
  }
  
  calculateMarketSentiment() {
    const analysis = this.gameState.stage2.emotionAnalysis;
    if (!analysis) return null;
    
    const emotions = analysis.emotions;
    const total = Object.values(emotions).reduce((sum, val) => sum + val, 0);
    
    if (total === 0) return null;
    
    const dominant = Object.entries(emotions)
      .sort(([,a], [,b]) => b - a)[0][0];
    const percentage = Math.round((emotions[dominant] / total) * 100);
    
    return { dominant, percentage, total };
  }
  
  // STAGE 3: Прогнозирование (бывший 4-й этап)
  generateTrendFactors() {
    // Выбираем случайные факторы
    const factors = shuffleArray(TREND_FACTORS).slice(0, 4);
    this.gameState.stage3.factors = factors;
    return factors;
  }
  
  analyzePrediction(drawnPoints) {
    if (!drawnPoints || drawnPoints.length < 10) {
      return { score: 0, feedback: "Недостаточно данных для анализа" };
    }
    
    // Анализируем тренд линии
    const trend = this.calculateTrend(drawnPoints);
    const volatility = this.calculateVolatility(drawnPoints);
    
    // Учитываем факторы
    const factorImpact = this.gameState.stage3.factors.reduce((sum, factor) => {
      return sum + (factor.impact === 'positive' ? 1 : -1) * parseInt(factor.value);
    }, 0);
    
    // Оцениваем прогноз
    let predictionScore = 50; // Базовый балл
    
    // Правильный тренд с учетом факторов
    if (factorImpact > 0 && trend > 0.1) predictionScore += 30;
    else if (factorImpact < 0 && trend < -0.1) predictionScore += 30;
    else if (factorImpact === 0 && Math.abs(trend) < 0.1) predictionScore += 20;
    
    // Реалистичная волатильность
    if (volatility > 0.2 && volatility < 0.5) predictionScore += 20;
    
    this.gameState.stage3.confidence = predictionScore;
    this.gameState.score += Math.round(predictionScore / 2);
    
    return {
      score: predictionScore,
      trend: trend > 0 ? 'рост' : trend < 0 ? 'падение' : 'стабильность',
      volatility: volatility,
      feedback: this.getPredictionFeedback(predictionScore)
    };
  }
  
  calculateTrend(points) {
    if (points.length < 2) return 0;
    
    const first = points[0];
    const last = points[points.length - 1];
    return (last.y - first.y) / (last.x - first.x);
  }
  
  calculateVolatility(points) {
    if (points.length < 3) return 0;
    
    let totalDeviation = 0;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const deviation = Math.abs(curr.y - prev.y);
      totalDeviation += deviation;
    }
    
    return totalDeviation / (points.length - 1);
  }
  
  getPredictionFeedback(score) {
    if (score >= 80) return "Отличный прогноз! Учёл все ключевые факторы.";
    if (score >= 60) return "Хороший анализ! Учёл основные факторы.";
    if (score >= 40) return "Неплохо, но можно точнее проанализировать факторы.";
    return "Прогноз требует доработки. Обрати внимание на факторы влияния.";
  }
  
  // STAGE 4: Инвестиции (бывший 5-й этап)
  getAvailableTrends() {
    return INVESTMENT_TRENDS.filter(trend => 
      !this.gameState.stage4.investments[trend.id]
    );
  }
  
  investInTrend(trendId, amount) {
    const trend = INVESTMENT_TRENDS.find(t => t.id === trendId);
    if (!trend) return false;
    
    if (amount > this.gameState.portfolio) return false;
    
    this.gameState.portfolio -= amount;
    this.gameState.stage4.investments[trendId] = {
      amount,
      buyPrice: trend.price,
      buyDay: this.gameState.stage4.daysPassed
    };
    
    this.logEvent('info', `Инвестировано $${amount} в ${trend.name}`);
    return true;
  }
  
  simulateMarketDay() {
    this.gameState.stage4.daysPassed++;
    
    let totalValue = this.gameState.portfolio;
    const events = [];
    
    // Симулируем изменения для каждой инвестиции
    Object.entries(this.gameState.stage4.investments).forEach(([trendId, investment]) => {
      const trend = INVESTMENT_TRENDS.find(t => t.id === trendId);
      if (!trend) return;
      
      // Генерируем изменение цены на основе волатильности
      const change = this.generatePriceChange(trend.volatility, trend.potential);
      const newPrice = investment.buyPrice * (1 + change);
      
      // Обновляем цену тренда
      trend.price = newPrice;
      
      // Рассчитываем прибыль/убыток
      const currentValue = investment.amount * (newPrice / investment.buyPrice);
      const profit = currentValue - investment.amount;
      
      totalValue += currentValue;
      
      events.push({
        trend: trend.name,
        change: change,
        profit: profit,
        newPrice: newPrice
      });
    });
    
    // Обновляем историю прибыли
    this.gameState.stage4.profitHistory.push(totalValue);
    
    return {
      day: this.gameState.stage4.daysPassed,
      totalValue: totalValue,
      events: events
    };
  }
  
  generatePriceChange(volatility, potential) {
    // Базовое изменение на основе потенциала
    const baseChange = (potential - 0.5) * 0.1;
    
    // Случайная волатильность
    const randomChange = (Math.random() - 0.5) * volatility * 2;
    
    return baseChange + randomChange;
  }
  
  // Утилиты
  logEvent(type, message) {
    this.gameState.eventLog.push({
      timestamp: Date.now(),
      type: type,
      message: message
    });
  }
  
  saveProgress() {
    try {
      localStorage.setItem('trendsQuestProgress', JSON.stringify(this.gameState));
    } catch (e) {
      console.warn('Не удалось сохранить прогресс:', e);
    }
  }
  
  loadProgress() {
    try {
      const saved = localStorage.getItem('trendsQuestProgress');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.gameState = { ...this.gameState, ...parsed };
      }
    } catch (e) {
      console.warn('Не удалось загрузить прогресс:', e);
    }
  }
  
  getGameState() {
    return { ...this.gameState };
  }
  
  calculateFinalScore() {
    let score = this.gameState.score;
    
    // Бонус за точность
    const accuracy = this.gameState.stage1.correctPredictions / this.gameState.stage1.trendsAnalyzed;
    score += Math.round(accuracy * 50);
    
    // Бонус за портфель
    const portfolioBonus = Math.max(0, this.gameState.portfolio - 1000);
    score += Math.round(portfolioBonus / 10);
    
    return Math.max(0, score);
  }
  
  checkAchievements() {
    const achievements = [];
    
    // Аналитик
    if (this.gameState.stage1.correctPredictions >= 5) {
      achievements.push('Аналитик');
    }
    
    // Эмоциональный детектив
    if (this.gameState.stage2.emotionAnalysis?.postsAnalyzed.length >= 8) {
      achievements.push('Эмоциональный детектив');
    }
    
    // Пророк
    if (this.gameState.stage3.confidence >= 80) {
      achievements.push('Пророк');
    }
    
    // Инвестор
    if (this.gameState.portfolio > 1500) {
      achievements.push('Инвестор');
    }
    
    this.gameState.achievements = achievements;
  }
  
  calculateRewards() {
    const baseReward = QUEST_CONFIG.rewards.base;
    const scoreMultiplier = Math.max(1, this.gameState.score / 100);
    
    return {
      coins: Math.round(baseReward.coins * scoreMultiplier),
      xp: Math.round(baseReward.xp * scoreMultiplier)
    };
  }
}

// Экспорт класса
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TrendsQuestEngine;
}