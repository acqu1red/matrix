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
        currentScenario: null,
        placedEvents: [],
        attempts: 0
      },
      stage4: {
        prediction: [],
        factors: [],
        confidence: 0
      },
      stage5: {
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
  }
  
  initialize() {
    console.log('🎮 Инициализация движка квеста...');
    this.loadProgress();
  }
  
  startQuest() {
    this.gameState.isRunning = true;
    this.gameState.startTime = Date.now();
    this.gameState.currentStage = 1;
    this.logEvent('info', 'Квест начат! Удачи в предсказании трендов!');
  }
  
  // Этап 1: Логика свайпов
  processTrendSwipe(trendId, direction) {
    const trend = TRENDS_DATA.find(t => t.id === trendId);
    if (!trend) return null;
    
    const isCorrect = (direction === 'right' && trend.willSucceed) || 
                     (direction === 'left' && !trend.willSucceed);
    
    this.gameState.stage1.trendsAnalyzed++;
    if (isCorrect) {
      this.gameState.stage1.correctPredictions++;
      this.gameState.score += 10;
      this.gameState.accuracy = Math.round((this.gameState.stage1.correctPredictions / this.gameState.stage1.trendsAnalyzed) * 100);
    }
    
    const feedback = isCorrect ? trend.feedback.correct : trend.feedback.incorrect;
    
    this.logEvent(isCorrect ? 'success' : 'error', feedback);
    
    return {
      isCorrect,
      feedback,
      score: this.gameState.score,
      accuracy: this.gameState.accuracy
    };
  }
  
  getNextTrend() {
    const index = this.gameState.stage1.currentTrendIndex;
    if (index >= TRENDS_DATA.length) return null;
    
    this.gameState.stage1.currentTrendIndex++;
    return TRENDS_DATA[index];
  }
  
  // Этап 2: Анализ эмоций
  startEmotionAnalysis() {
    this.gameState.stage2.timeLeft = 60;
    this.gameState.stage2.postsAnalyzed = [];
    
    // Возвращаем перемешанные посты
    return shuffleArray(SOCIAL_POSTS_DATA);
  }
  
  analyzePost(postId, selectedEmotion) {
    const post = SOCIAL_POSTS_DATA.find(p => p.author === postId);
    if (!post) return false;
    
    const isCorrect = post.emotion === selectedEmotion;
    
    this.gameState.stage2.postsAnalyzed.push({
      postId,
      selectedEmotion,
      correctEmotion: post.emotion,
      isCorrect
    });
    
    if (isCorrect) {
      this.gameState.score += 5;
    }
    
    return isCorrect;
  }
  
  calculateMarketSentiment() {
    const emotions = {
      fear: 0,
      greed: 0,
      hope: 0,
      doubt: 0
    };
    
    this.gameState.stage2.postsAnalyzed.forEach(analysis => {
      if (analysis.isCorrect) {
        emotions[analysis.correctEmotion]++;
      }
    });
    
    const total = Object.values(emotions).reduce((sum, val) => sum + val, 0);
    if (total === 0) return null;
    
    // Находим доминирующую эмоцию
    const dominant = Object.entries(emotions)
      .sort((a, b) => b[1] - a[1])[0];
    
    this.gameState.stage2.emotionAnalysis = {
      dominant: dominant[0],
      percentage: Math.round((dominant[1] / total) * 100),
      breakdown: emotions
    };
    
    // Бонус за правильный анализ
    if (this.gameState.stage2.postsAnalyzed.filter(a => a.isCorrect).length >= 7) {
      this.gameState.score += 20;
      this.logEvent('success', 'Отличный анализ эмоций рынка!');
    }
    
    return this.gameState.stage2.emotionAnalysis;
  }
  
  // Этап 3: Поиск паттернов
  getPatternScenario() {
    const scenario = getRandomElement(PATTERN_SCENARIOS);
    this.gameState.stage3.currentScenario = scenario;
    
    // Перемешиваем события
    const shuffledEvents = shuffleArray(scenario.events);
    return {
      ...scenario,
      events: shuffledEvents
    };
  }
  
  checkEventPlacement(eventId, position) {
    const scenario = this.gameState.stage3.currentScenario;
    if (!scenario) return false;
    
    const event = scenario.events.find(e => e.id === eventId);
    if (!event) return false;
    
    return event.order === position;
  }
  
  validatePattern(placedEvents) {
    const scenario = this.gameState.stage3.currentScenario;
    if (!scenario) return false;
    
    this.gameState.stage3.attempts++;
    
    // Проверяем, все ли события на своих местах
    let correctCount = 0;
    placedEvents.forEach((eventId, index) => {
      const event = scenario.events.find(e => e.id === eventId);
      if (event && event.order === index + 1) {
        correctCount++;
      }
    });
    
    const isComplete = correctCount === scenario.events.length;
    
    if (isComplete) {
      const bonus = Math.max(30 - (this.gameState.stage3.attempts - 1) * 5, 10);
      this.gameState.score += bonus;
      this.logEvent('success', `Паттерн найден! +${bonus} очков`);
    }
    
    return {
      isComplete,
      correctCount,
      total: scenario.events.length,
      explanation: isComplete ? scenario.explanation : null
    };
  }
  
  // Этап 4: Прогнозирование
  generateTrendFactors() {
    // Выбираем случайные факторы
    const factors = shuffleArray(TREND_FACTORS).slice(0, 4);
    this.gameState.stage4.factors = factors;
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
    const factorImpact = this.gameState.stage4.factors.reduce((sum, factor) => {
      return sum + (factor.impact === 'positive' ? 1 : -1) * parseInt(factor.value);
    }, 0);
    
    // Оцениваем прогноз
    let predictionScore = 50; // Базовый балл
    
    // Правильный тренд с учетом факторов
    if (factorImpact > 0 && trend > 0) predictionScore += 30;
    else if (factorImpact < 0 && trend < 0) predictionScore += 30;
    else if (factorImpact === 0 && Math.abs(trend) < 0.1) predictionScore += 20;
    
    // Реалистичная волатильность
    if (volatility > 0.2 && volatility < 0.5) predictionScore += 20;
    
    this.gameState.stage4.confidence = predictionScore;
    this.gameState.score += Math.round(predictionScore / 2);
    
    return {
      score: predictionScore,
      trend: trend > 0 ? 'рост' : trend < 0 ? 'падение' : 'стабильность',
      volatility: volatility > 0.5 ? 'высокая' : volatility > 0.2 ? 'средняя' : 'низкая',
      feedback: this.getPredictionFeedback(predictionScore)
    };
  }
  
  calculateTrend(points) {
    if (points.length < 2) return 0;
    
    const firstY = points[0].y;
    const lastY = points[points.length - 1].y;
    
    return (lastY - firstY) / firstY;
  }
  
  calculateVolatility(points) {
    if (points.length < 3) return 0;
    
    let totalDeviation = 0;
    for (let i = 1; i < points.length - 1; i++) {
      const expected = (points[i-1].y + points[i+1].y) / 2;
      const deviation = Math.abs(points[i].y - expected) / expected;
      totalDeviation += deviation;
    }
    
    return totalDeviation / (points.length - 2);
  }
  
  getPredictionFeedback(score) {
    if (score >= 80) return "Отличный прогноз! Ты настоящий визионер!";
    if (score >= 60) return "Хороший анализ! Учёл основные факторы.";
    if (score >= 40) return "Неплохо, но можно точнее проанализировать факторы.";
    return "Прогноз требует доработки. Обрати внимание на факторы влияния.";
  }
  
  // Этап 5: Инвестиции
  getAvailableTrends() {
    return INVESTMENT_TRENDS.filter(trend => 
      !this.gameState.stage5.investments[trend.id]
    );
  }
  
  investInTrend(trendId, amount) {
    const trend = INVESTMENT_TRENDS.find(t => t.id === trendId);
    if (!trend) return false;
    
    if (amount > this.gameState.portfolio) return false;
    
    this.gameState.portfolio -= amount;
    this.gameState.stage5.investments[trendId] = {
      amount,
      buyPrice: trend.price,
      buyDay: this.gameState.stage5.daysPassed
    };
    
    this.logEvent('info', `Инвестировано $${amount} в ${trend.name}`);
    return true;
  }
  
  simulateMarketDay() {
    this.gameState.stage5.daysPassed++;
    
    let totalValue = this.gameState.portfolio;
    const events = [];
    
    // Симулируем изменения для каждой инвестиции
    Object.entries(this.gameState.stage5.investments).forEach(([trendId, investment]) => {
      const trend = INVESTMENT_TRENDS.find(t => t.id === trendId);
      if (!trend) return;
      
      // Генерируем изменение цены на основе волатильности
      const change = this.generatePriceChange(trend.volatility, trend.potential);
      const newPrice = Math.max(1, trend.price * (1 + change));
      trend.price = newPrice;
      
      const currentValue = (newPrice / investment.buyPrice) * investment.amount;
      totalValue += currentValue;
      
      // Генерируем новости
      if (Math.random() < 0.3 && trend.news.length > 0) {
        const news = getRandomElement(trend.news);
        events.push({
          type: change > 0 ? 'positive' : 'negative',
          message: `${trend.name}: ${news}`
        });
      }
    });
    
    this.gameState.stage5.profitHistory.push(totalValue);
    
    return {
      portfolio: totalValue,
      daysPassed: this.gameState.stage5.daysPassed,
      events
    };
  }
  
  generatePriceChange(volatility, potential) {
    const volatilityFactors = {
      low: 0.05,
      medium: 0.1,
      high: 0.15,
      very_high: 0.25
    };
    
    const potentialFactors = {
      low: -0.02,
      medium: 0.01,
      high: 0.03,
      very_high: 0.05,
      extreme: 0.08
    };
    
    const v = volatilityFactors[volatility] || 0.1;
    const p = potentialFactors[potential] || 0.01;
    
    // Случайное изменение с учетом волатильности и потенциала
    const random = (Math.random() - 0.5) * 2 * v;
    return random + p;
  }
  
  // Общие методы
  nextStage() {
    if (this.gameState.currentStage < QUEST_CONFIG.stages) {
      this.gameState.currentStage++;
      this.logEvent('info', `Переход к этапу ${this.gameState.currentStage}`);
      return true;
    }
    return false;
  }
  
  logEvent(type, message) {
    this.gameState.eventLog.push({
      type,
      message,
      timestamp: Date.now()
    });
    
    // Ограничиваем размер лога
    if (this.gameState.eventLog.length > 50) {
      this.gameState.eventLog.shift();
    }
  }
  
  saveProgress() {
    try {
      localStorage.setItem('trendsQuestState', JSON.stringify(this.gameState));
      localStorage.setItem('trendsQuestCompleted', 'true');
    } catch (e) {
      console.error('Ошибка сохранения прогресса:', e);
    }
  }
  
  loadProgress() {
    try {
      const saved = localStorage.getItem('trendsQuestState');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Не загружаем, если квест был завершен
        if (!parsed.isRunning && parsed.currentStage > QUEST_CONFIG.stages) {
          return;
        }
        this.gameState = { ...this.gameState, ...parsed };
      }
    } catch (e) {
      console.error('Ошибка загрузки прогресса:', e);
    }
  }
  
  getGameState() {
    return this.gameState;
  }
  
  completeQuest() {
    this.gameState.isRunning = false;
    const finalScore = this.calculateFinalScore();
    
    // Проверяем достижения
    this.checkAchievements();
    
    // Сохраняем прогресс
    this.saveProgress();
    
    return {
      score: finalScore,
      accuracy: this.gameState.accuracy,
      profit: Math.round(this.gameState.stage5.profitHistory[this.gameState.stage5.profitHistory.length - 1] - 1000),
      trendsFound: this.gameState.stage1.correctPredictions,
      achievements: this.gameState.achievements,
      rewards: this.calculateRewards(finalScore)
    };
  }
  
  calculateFinalScore() {
    let score = this.gameState.score;
    
    // Бонусы за точность
    if (this.gameState.accuracy >= 90) score *= 1.5;
    else if (this.gameState.accuracy >= 75) score *= 1.2;
    
    // Бонус за прибыль
    const profit = this.gameState.stage5.profitHistory[this.gameState.stage5.profitHistory.length - 1] - 1000;
    if (profit > 2000) score += 100;
    else if (profit > 1000) score += 50;
    else if (profit > 500) score += 25;
    
    return Math.round(score);
  }
  
  checkAchievements() {
    const achievements = [];
    
    if (this.gameState.stage1.correctPredictions >= 8) {
      achievements.push(ACHIEVEMENTS.find(a => a.id === 'trend_hunter'));
    }
    
    if (this.gameState.stage2.postsAnalyzed.filter(a => a.isCorrect).length >= 8) {
      achievements.push(ACHIEVEMENTS.find(a => a.id === 'emotion_reader'));
    }
    
    if (this.gameState.stage3.attempts === 1) {
      achievements.push(ACHIEVEMENTS.find(a => a.id === 'pattern_master'));
    }
    
    const finalProfit = this.gameState.stage5.profitHistory[this.gameState.stage5.profitHistory.length - 1];
    if (finalProfit >= 4000) {
      achievements.push(ACHIEVEMENTS.find(a => a.id === 'profit_prophet'));
    }
    
    if (this.gameState.accuracy >= 90) {
      achievements.push(ACHIEVEMENTS.find(a => a.id === 'perfect_predictor'));
    }
    
    this.gameState.achievements = achievements.filter(a => a);
  }
  
  calculateRewards(finalScore) {
    let multiplier = 'normal';
    
    if (finalScore >= 500) multiplier = 'perfect';
    else if (finalScore >= 350) multiplier = 'excellent';
    else if (finalScore >= 200) multiplier = 'good';
    
    const mult = QUEST_CONFIG.rewards.multipliers[multiplier];
    
    return {
      coins: Math.round(QUEST_CONFIG.rewards.base.coins * mult),
      xp: Math.round(QUEST_CONFIG.rewards.base.xp * mult),
      multiplier
    };
  }
  
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
        currentScenario: null,
        placedEvents: [],
        attempts: 0
      },
      stage4: {
        prediction: [],
        factors: [],
        confidence: 0
      },
      stage5: {
        investments: {},
        daysPassed: 0,
        newsIndex: 0,
        profitHistory: [1000]
      },
      achievements: [],
      eventLog: []
    };
    
    localStorage.removeItem('trendsQuestState');
  }
}

// Экспорт класса
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TrendsQuestEngine;
}