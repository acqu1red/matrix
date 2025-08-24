/* ===== TRENDS QUEST ENGINE ===== */

class TrendsQuestEngine {
  constructor() {
    this.gameState = {
      isRunning: false,
      currentStage: 1,
      currentQuestion: 0,
      score: 0,
      portfolio: 100000,
      accuracy: 0,
      reputation: 3, // из 5 звезд
      startTime: null,
      answers: [],
      decisions: {},
      timeRemaining: QUEST_CONFIG.timeLimit
    };
    
    this.timerId = null;
    this.eventLog = [];
  }

  // Инициализация квеста
  initialize() {
    this.resetGameState();
    this.setupEventListeners();
    this.logEvent('info', 'Система аналитики инициализирована');
  }

  // Сброс состояния игры
  resetGameState() {
    this.gameState = {
      isRunning: false,
      currentStage: 1,
      currentQuestion: 0,
      score: 0,
      portfolio: 100000,
      accuracy: 0,
      reputation: 3,
      startTime: null,
      answers: [],
      decisions: {},
      timeRemaining: QUEST_CONFIG.timeLimit
    };
    this.eventLog = [];
  }

  // Запуск квеста
  startQuest() {
    this.gameState.isRunning = true;
    this.gameState.startTime = Date.now();
    this.startTimer();
    this.loadStage(1);
    this.logEvent('success', 'Анализ трендов начат');
    return true;
  }

  // Загрузка этапа
  loadStage(stageNumber) {
    if (stageNumber > QUEST_CONFIG.stages) {
      this.completeQuest();
      return;
    }

    this.gameState.currentStage = stageNumber;
    this.gameState.currentQuestion = 0;
    
    const stageName = this.getStageNames()[stageNumber - 1];
    this.logEvent('info', `Этап ${stageNumber}: ${stageName}`);
    
    // Обновляем рыночные данные для нового этапа
    this.updateMarketData();
    
    // Загружаем первый вопрос этапа
    this.loadQuestion(0);
  }

  // Загрузка вопроса
  loadQuestion(questionIndex) {
    const questions = DataService.getQuestionsByStage(this.gameState.currentStage);
    
    if (questionIndex >= questions.length) {
      // Переход к следующему этапу
      this.loadStage(this.gameState.currentStage + 1);
      return;
    }

    this.gameState.currentQuestion = questionIndex;
    const question = questions[questionIndex];
    
    this.logEvent('info', `Вопрос ${questionIndex + 1}: ${question.title}`);
    
    return question;
  }

  // Обработка ответа
  processAnswer(questionId, answer) {
    const questions = DataService.getQuestionsByStage(this.gameState.currentStage);
    const question = questions.find(q => q.id === questionId);
    
    if (!question) {
      this.logEvent('error', 'Вопрос не найден');
      return false;
    }

    const result = this.evaluateAnswer(question, answer);
    
    // Сохраняем ответ
    this.gameState.answers.push({
      questionId,
      answer,
      correct: result.correct,
      score: result.score,
      timestamp: Date.now()
    });

    // Обновляем статистику
    this.updateGameStats(result);
    
    // Логируем результат
    if (result.correct) {
      this.logEvent('success', `Правильно! +${result.score} очков`);
    } else {
      this.logEvent('warning', `Неверно. ${result.explanation}`);
    }

    return result;
  }

  // Оценка ответа
  evaluateAnswer(question, answer) {
    let correct = false;
    let score = 0;
    let explanation = '';

    switch (question.type) {
      case 'multiple-choice':
        const selectedOption = question.options.find(opt => opt.id === answer);
        if (selectedOption) {
          correct = selectedOption.correct;
          explanation = selectedOption.explanation;
          score = correct ? this.calculateScore(question.difficulty || 'medium') : 0;
        }
        break;

      case 'trend-ranking':
        const correctOrder = question.correctOrder;
        const similarity = this.calculateOrderSimilarity(answer, correctOrder);
        correct = similarity >= 0.75; // 75% сходство считается правильным
        score = Math.round(similarity * this.calculateScore(question.difficulty || 'medium'));
        explanation = question.explanation;
        break;

      case 'scenario-analysis':
        const scenarioOption = question.options.find(opt => opt.id === answer);
        if (scenarioOption) {
          correct = scenarioOption.correct;
          explanation = scenarioOption.explanation;
          score = correct ? this.calculateScore('hard') : 0; // Сценарные вопросы сложнее
        }
        break;

      case 'pattern-recognition':
        const pattern = question.patterns.find(p => p.id === answer);
        if (pattern) {
          correct = pattern.correct;
          explanation = pattern.explanation;
          score = correct ? this.calculateScore('hard') : 0;
        }
        break;

      case 'portfolio-allocation':
        const allocationScore = this.evaluateAllocation(answer, question.optimalAllocation, question.toleranceRange);
        correct = allocationScore >= 0.8;
        score = Math.round(allocationScore * this.calculateScore('hard'));
        explanation = `Распределение оценено на ${Math.round(allocationScore * 100)}%`;
        break;

      default:
        explanation = 'Неизвестный тип вопроса';
    }

    return { correct, score, explanation };
  }

  // Вычисление схожести порядка (для trend-ranking)
  calculateOrderSimilarity(userOrder, correctOrder) {
    if (userOrder.length !== correctOrder.length) return 0;
    
    let score = 0;
    for (let i = 0; i < userOrder.length; i++) {
      const correctIndex = correctOrder.indexOf(userOrder[i]);
      const penalty = Math.abs(i - correctIndex);
      score += Math.max(0, userOrder.length - penalty);
    }
    
    const maxScore = userOrder.length * userOrder.length;
    return score / maxScore;
  }

  // Оценка распределения портфеля
  evaluateAllocation(userAllocation, optimalAllocation, tolerance) {
    let totalScore = 0;
    let totalWeight = 0;

    for (const [sector, optimalAmount] of Object.entries(optimalAllocation)) {
      const userAmount = userAllocation[sector] || 0;
      const optimalPercent = optimalAmount / 100000; // Предполагаем бюджет 100k
      const userPercent = userAmount / 100000;
      
      const difference = Math.abs(optimalPercent - userPercent);
      const sectorScore = Math.max(0, 1 - (difference / tolerance));
      
      totalScore += sectorScore * optimalAmount;
      totalWeight += optimalAmount;
    }

    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  // Вычисление очков за ответ
  calculateScore(difficulty = 'medium') {
    const baseScore = 100;
    const difficultyMultiplier = QUEST_CONFIG.difficulty[difficulty]?.multiplier || 1;
    const timeBonus = this.calculateTimeBonus();
    
    return Math.round(baseScore * difficultyMultiplier * timeBonus);
  }

  // Бонус за время
  calculateTimeBonus() {
    if (!this.gameState.startTime) return 1;
    
    const elapsed = Date.now() - this.gameState.startTime;
    const remainingPercent = Math.max(0, (QUEST_CONFIG.timeLimit - elapsed) / QUEST_CONFIG.timeLimit);
    
    return 1 + (remainingPercent * 0.5); // До 50% бонуса за скорость
  }

  // Обновление статистики игры
  updateGameStats(result) {
    this.gameState.score += result.score;
    
    // Обновляем точность
    const totalAnswers = this.gameState.answers.length;
    const correctAnswers = this.gameState.answers.filter(a => a.correct).length;
    this.gameState.accuracy = totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0;
    
    // Обновляем репутацию (от 1 до 5 звезд)
    if (this.gameState.accuracy >= 90) {
      this.gameState.reputation = 5;
    } else if (this.gameState.accuracy >= 75) {
      this.gameState.reputation = 4;
    } else if (this.gameState.accuracy >= 60) {
      this.gameState.reputation = 3;
    } else if (this.gameState.accuracy >= 40) {
      this.gameState.reputation = 2;
    } else {
      this.gameState.reputation = 1;
    }
    
    // Обновляем портфель (симуляция влияния решений)
    const portfolioChange = result.correct ? 
      Math.random() * 5000 + 1000 : // +1000-6000 за правильный ответ
      -(Math.random() * 3000 + 500); // -500-3500 за неправильный
    
    this.gameState.portfolio = Math.max(0, this.gameState.portfolio + portfolioChange);
  }

  // Обновление рыночных данных
  updateMarketData() {
    // Симулируем изменения в рыночных данных
    const marketData = DataService.getMarketData();
    
    marketData.indices.forEach(index => {
      const volatility = 0.02; // 2% волатильность
      const change = (Math.random() - 0.5) * volatility * index.price;
      index.price += change;
      index.change = change;
      index.changePercent = (change / (index.price - change)) * 100;
    });

    marketData.sectors.forEach(sector => {
      const volatility = 0.03; // 3% волатильность для секторов
      const change = (Math.random() - 0.5) * volatility * 100;
      sector.performance += change;
    });
  }

  // Завершение квеста
  completeQuest() {
    this.gameState.isRunning = false;
    this.stopTimer();
    
    const finalScore = this.calculateFinalScore();
    const rewards = this.calculateRewards(finalScore);
    
    this.logEvent('success', `Квест завершен! Финальный счет: ${finalScore}`);
    
    return {
      success: true,
      finalScore,
      accuracy: this.gameState.accuracy,
      reputation: this.gameState.reputation,
      portfolio: this.gameState.portfolio,
      rewards,
      completionTime: Date.now() - this.gameState.startTime,
      answers: this.gameState.answers
    };
  }

  // Вычисление финального счета
  calculateFinalScore() {
    let score = this.gameState.score;
    
    // Бонус за точность
    const accuracyBonus = Math.round(this.gameState.accuracy * 10);
    score += accuracyBonus;
    
    // Бонус за репутацию
    const reputationBonus = this.gameState.reputation * 50;
    score += reputationBonus;
    
    // Бонус/штраф за портфель
    const portfolioChange = this.gameState.portfolio - 100000;
    const portfolioBonus = Math.round(portfolioChange * 0.01); // 1% от изменения
    score += portfolioBonus;
    
    return Math.max(0, score);
  }

  // Вычисление наград
  calculateRewards(finalScore) {
    const baseRewards = QUEST_CONFIG.rewards;
    let multiplier = 1;
    
    if (finalScore >= 1500) {
      multiplier = 1.5; // Отличное прохождение
    } else if (finalScore >= 1000) {
      multiplier = 1.2; // Хорошее прохождение
    } else if (finalScore >= 500) {
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

  // Таймер
  startTimer() {
    this.timerId = setInterval(() => {
      this.gameState.timeRemaining -= 1000;
      
      if (this.gameState.timeRemaining <= 0) {
        this.gameState.timeRemaining = 0;
        this.completeQuest();
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
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

  // Получение названий этапов
  getStageNames() {
    return [
      'Анализ данных',
      'Выявление паттернов', 
      'Принятие решений'
    ];
  }

  // Получение текущего состояния
  getGameState() {
    return { ...this.gameState };
  }

  // Получение лога событий
  getEventLog() {
    return [...this.eventLog];
  }

  // Настройка обработчиков событий
  setupEventListeners() {
    // Обработчик закрытия страницы
    window.addEventListener('beforeunload', () => {
      this.stopTimer();
    });
  }

  // Сохранение прогресса (для будущего использования)
  saveProgress() {
    const saveData = {
      gameState: this.gameState,
      eventLog: this.eventLog,
      timestamp: Date.now()
    };
    
    localStorage.setItem('trendsQuestProgress', JSON.stringify(saveData));
  }

  // Загрузка прогресса
  loadProgress() {
    const saveData = localStorage.getItem('trendsQuestProgress');
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
}
