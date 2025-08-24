/* ===== TRENDS QUEST MAIN ===== */

// Глобальные переменные
let questEngine = null;
let questUI = null;

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Инициализация квеста "Анализ трендов"...');
  
  try {
    // Создаем экземпляры движка и UI
    questEngine = new TrendsQuestEngine();
    questUI = new TrendsQuestUI(questEngine);
    
    // Инициализируем компоненты
    questEngine.initialize();
    questUI.initialize();
    
    // Запускаем периодические обновления
    questUI.startPeriodicUpdates();
    
    console.log('✅ Квест успешно инициализирован');
    
  } catch (error) {
    console.error('❌ Ошибка инициализации квеста:', error);
    showErrorMessage('Произошла ошибка при загрузке квеста. Попробуйте перезагрузить страницу.');
  }
});

// Обработчик ошибок
window.addEventListener('error', function(event) {
  console.error('Глобальная ошибка:', event.error);
  
  if (questUI) {
    questUI.showToast('Произошла ошибка. Проверьте консоль для деталей.', 'error');
  }
});

// Обработчик необработанных промисов
window.addEventListener('unhandledrejection', function(event) {
  console.error('Необработанный промис:', event.reason);
  
  if (questUI) {
    questUI.showToast('Произошла асинхронная ошибка.', 'error');
  }
});

// Обработчик закрытия страницы
window.addEventListener('beforeunload', function(event) {
  if (questEngine && questEngine.getGameState().isRunning) {
    // Сохраняем прогресс перед закрытием
    questEngine.saveProgress();
    
    // Показываем предупреждение
    event.preventDefault();
    event.returnValue = 'Ваш прогресс будет потерян. Вы уверены?';
    return event.returnValue;
  }
});

// Утилитарные функции
function showErrorMessage(message) {
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(255, 68, 68, 0.9);
    color: white;
    padding: 20px;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    z-index: 10000;
    max-width: 400px;
    text-align: center;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  `;
  
  errorDiv.innerHTML = `
    <div style="margin-bottom: 16px;">⚠️ Ошибка</div>
    <div style="margin-bottom: 20px; font-weight: 400;">${message}</div>
    <button onclick="location.reload()" style="
      background: white;
      color: #ff4444;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
    ">Перезагрузить</button>
  `;
  
  document.body.appendChild(errorDiv);
}

// Функции для интеграции с основной системой квестов
function getQuestProgress() {
  if (!questEngine) return null;
  
  const gameState = questEngine.getGameState();
  
  return {
    isCompleted: !gameState.isRunning && gameState.currentStage > QUEST_CONFIG.stages,
    progress: Math.round((gameState.currentStage - 1) / QUEST_CONFIG.stages * 100),
    score: gameState.score,
    accuracy: gameState.accuracy,
    timeSpent: gameState.startTime ? Date.now() - gameState.startTime : 0
  };
}

function getQuestRewards() {
  if (!questEngine) return null;
  
  const gameState = questEngine.getGameState();
  
  if (gameState.isRunning || gameState.currentStage <= QUEST_CONFIG.stages) {
    return null; // Квест не завершен
  }
  
  const finalScore = questEngine.calculateFinalScore();
  return questEngine.calculateRewards(finalScore);
}

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    questEngine,
    questUI,
    getQuestProgress,
    getQuestRewards
  };
}

// Глобальные функции для отладки (только в dev режиме)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  window.debugQuest = {
    engine: () => questEngine,
    ui: () => questUI,
    completeQuest: () => {
      if (questEngine) {
        questEngine.gameState.currentStage = QUEST_CONFIG.stages + 1;
        questUI.completeQuest();
      }
    },
    addScore: (points) => {
      if (questEngine) {
        questEngine.gameState.score += points;
        questUI.updateStatusPanel();
      }
    },
    setAccuracy: (percent) => {
      if (questEngine) {
        questEngine.gameState.accuracy = Math.max(0, Math.min(100, percent));
        questUI.updateStatusPanel();
      }
    },
    logEvent: (type, message) => {
      if (questEngine) {
        questEngine.logEvent(type, message);
        questUI.updateEventLog();
      }
    }
  };
  
  console.log('🔧 Debug функции доступны в window.debugQuest');
}

// Функции для аналитики (заглушки для будущего использования)
function trackQuestStart() {
  // Здесь можно добавить отправку аналитики
  console.log('📊 Квест начат');
}

function trackQuestComplete(results) {
  // Здесь можно добавить отправку результатов
  console.log('📊 Квест завершен:', results);
}

function trackAnswerGiven(questionId, answer, correct) {
  // Здесь можно отслеживать ответы пользователей
  console.log('📊 Ответ дан:', { questionId, answer, correct });
}

// Интеграция с системой достижений (заглушка)
function checkAchievements(gameState) {
  const achievements = [];
  
  if (gameState.accuracy >= 90) {
    achievements.push({
      id: 'perfect-analyst',
      name: 'Идеальный аналитик',
      description: 'Достигнута точность 90% или выше',
      icon: '🎯'
    });
  }
  
  if (gameState.portfolio >= 150000) {
    achievements.push({
      id: 'portfolio-master',
      name: 'Мастер портфеля',
      description: 'Увеличен портфель на 50% или больше',
      icon: '💰'
    });
  }
  
  if (gameState.reputation >= 5) {
    achievements.push({
      id: 'five-star-analyst',
      name: 'Пятизвездочный аналитик',
      description: 'Достигнута максимальная репутация',
      icon: '⭐'
    });
  }
  
  return achievements;
}

// Система подсказок для новых игроков
const HINTS = {
  stage1: [
    'Обращайте внимание на объемы торгов - они показывают интерес инвесторов',
    'Высокая производительность сектора не всегда означает низкий риск',
    'Новости могут дать важные подсказки о будущих движениях рынка'
  ],
  stage2: [
    'Ищите корреляции между разными трендами и секторами',
    'Аномалии в данных часто предвещают важные изменения',
    'Сильные тренды обычно имеют высокий импульс и большие инвестиции'
  ],
  stage3: [
    'Диверсификация помогает снизить риски портфеля',
    'При росте волатильности стоит принимать защитные меры',
    'Долгосрочная стратегия должна учитывать мегатренды'
  ]
};

function showHint(stage) {
  const hints = HINTS[`stage${stage}`];
  if (hints && questUI) {
    const randomHint = hints[Math.floor(Math.random() * hints.length)];
    questUI.showToast(`💡 Подсказка: ${randomHint}`, 'info');
  }
}

// Автоматические подсказки для новых пользователей
let hintTimer = null;

function startHintSystem() {
  // Показываем подсказки каждые 60 секунд для новых пользователей
  const isNewUser = !localStorage.getItem('trendsQuestCompleted');
  
  if (isNewUser) {
    hintTimer = setInterval(() => {
      if (questEngine && questEngine.getGameState().isRunning) {
        const currentStage = questEngine.getGameState().currentStage;
        showHint(currentStage);
      }
    }, 60000); // Каждую минуту
  }
}

function stopHintSystem() {
  if (hintTimer) {
    clearInterval(hintTimer);
    hintTimer = null;
  }
}

// Запускаем систему подсказок после инициализации
setTimeout(startHintSystem, 5000);

// Останавливаем подсказки при закрытии страницы
window.addEventListener('beforeunload', stopHintSystem);

console.log('🎮 Квест "Анализ трендов" готов к запуску!');
