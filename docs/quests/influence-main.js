/* ===== INFLUENCE EMPIRE MAIN ===== */

// Глобальные переменные
let empireEngine = null;
let empireUI = null;

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Инициализация квеста "Империя влияния"...');
  
  try {
    // Создаем экземпляры движка и UI
    empireEngine = new InfluenceEmpireEngine();
    empireUI = new InfluenceEmpireUI(empireEngine);
    
    // Инициализируем компоненты
    empireEngine.initialize();
    empireUI.initialize();
    
    // Запускаем дополнительные системы
    empireUI.startHintRotation();
    
    console.log('✅ Империя влияния успешно инициализирована');
    
  } catch (error) {
    console.error('❌ Ошибка инициализации квеста:', error);
    showErrorMessage('Произошла ошибка при загрузке квеста. Попробуйте перезагрузить страницу.');
  }
});

// Обработчик ошибок
window.addEventListener('error', function(event) {
  console.error('Глобальная ошибка:', event.error);
  
  if (empireUI) {
    empireUI.showToast('Произошла ошибка. Проверьте консоль для деталей.', 'error');
  }
});

// Обработчик необработанных промисов
window.addEventListener('unhandledrejection', function(event) {
  console.error('Необработанный промис:', event.reason);
  
  if (empireUI) {
    empireUI.showToast('Произошла асинхронная ошибка.', 'error');
  }
});

// Обработчик закрытия страницы
window.addEventListener('beforeunload', function(event) {
  if (empireEngine && empireEngine.getGameState().isRunning) {
    // Сохраняем прогресс перед закрытием
    empireEngine.saveProgress();
    
    // Показываем предупреждение
    event.preventDefault();
    event.returnValue = 'Ваша империя влияния будет потеряна. Вы уверены?';
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
    background: linear-gradient(135deg, #ff4444, #cc3333);
    color: white;
    padding: 24px;
    border-radius: 16px;
    font-size: 16px;
    font-weight: 600;
    z-index: 10000;
    max-width: 400px;
    text-align: center;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
    border: 2px solid rgba(255, 255, 255, 0.2);
  `;
  
  errorDiv.innerHTML = `
    <div style="margin-bottom: 16px; font-size: 32px;">👑💥</div>
    <div style="margin-bottom: 16px; font-size: 18px;">Ошибка империи</div>
    <div style="margin-bottom: 20px; font-weight: 400; line-height: 1.4;">${message}</div>
    <button onclick="location.reload()" style="
      background: white;
      color: #ff4444;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.3s ease;
    " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
      🔄 Перезагрузить империю
    </button>
  `;
  
  document.body.appendChild(errorDiv);
}

// Функции для интеграции с основной системой квестов
function getQuestProgress() {
  if (!empireEngine) return null;
  
  const gameState = empireEngine.getGameState();
  
  return {
    isCompleted: !gameState.isRunning && gameState.currentStage > EMPIRE_CONFIG.stages,
    progress: Math.round((gameState.currentStage - 1) / EMPIRE_CONFIG.stages * 100),
    followers: gameState.metrics.followers,
    revenue: gameState.metrics.revenue,
    influence: gameState.metrics.influence,
    reputation: gameState.metrics.reputation,
    timeSpent: gameState.startTime ? Date.now() - gameState.startTime : 0
  };
}

function getQuestRewards() {
  if (!empireEngine) return null;
  
  const gameState = empireEngine.getGameState();
  
  if (gameState.isRunning || gameState.currentStage <= EMPIRE_CONFIG.stages) {
    return null; // Квест не завершен
  }
  
  const finalMetrics = empireEngine.calculateFinalMetrics();
  return empireEngine.calculateRewards(finalMetrics);
}

// Функции для работы с данными империи
function getEmpireSummary() {
  if (!empireEngine) return null;
  
  return empireEngine.generateEmpireSummary();
}

function getInfluenceAnalytics() {
  if (!empireEngine) return null;
  
  const gameState = empireEngine.getGameState();
  const platformStats = empireEngine.getPlatformStats();
  
  return {
    totalMetrics: gameState.metrics,
    platformBreakdown: platformStats,
    strategiesUsed: gameState.placedStrategies.length,
    eventsExperienced: gameState.events.length,
    stageProgress: gameState.stageProgress,
    recommendations: empireEngine.getRecommendations()
  };
}

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    empireEngine,
    empireUI,
    getQuestProgress,
    getQuestRewards,
    getEmpireSummary,
    getInfluenceAnalytics
  };
}

// Глобальные функции для отладки (только в dev режиме)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  window.debugEmpire = {
    engine: () => empireEngine,
    ui: () => empireUI,
    addFollowers: (count) => {
      if (empireEngine) {
        empireEngine.gameState.metrics.followers += count;
        empireUI.updateEmpireInterface();
      }
    },
    addInfluence: (points) => {
      if (empireEngine) {
        empireEngine.gameState.metrics.influence += points;
        empireUI.updateEmpireInterface();
      }
    },
    triggerEvent: () => {
      if (empireEngine) {
        const event = empireEngine.generateRandomEvent();
        if (event && empireUI) {
          empireUI.showEvent(event);
          empireUI.updateEmpireInterface();
        }
      }
    },
    skipToStage: (stage) => {
      if (empireEngine && empireUI) {
        empireEngine.gameState.currentStage = Math.min(stage, EMPIRE_CONFIG.stages);
        empireUI.loadStrategiesForStage(empireEngine.gameState.currentStage);
        empireUI.updateEmpireInterface();
      }
    },
    completeEmpire: () => {
      if (empireEngine && empireUI) {
        empireEngine.gameState.currentStage = EMPIRE_CONFIG.stages + 1;
        empireUI.completeEmpire();
      }
    },
    getAnalytics: () => getInfluenceAnalytics(),
    maxMetrics: () => {
      if (empireEngine) {
        empireEngine.gameState.metrics.followers = 10000000;
        empireEngine.gameState.metrics.revenue = 1000000;
        empireEngine.gameState.metrics.influence = 100;
        empireEngine.gameState.metrics.reputation = 100;
        empireUI.updateEmpireInterface();
      }
    }
  };
  
  console.log('🔧 Debug функции доступны в window.debugEmpire');
}

// Функции для аналитики и достижений
function trackEmpireStart() {
  console.log('📊 Империя влияния начата');
  // Здесь можно добавить отправку аналитики
}

function trackStrategyPlaced(strategyId, platform) {
  console.log('📊 Стратегия размещена:', { strategyId, platform });
  // Здесь можно отслеживать размещение стратегий
}

function trackEmpireComplete(results) {
  console.log('📊 Империя завершена:', results);
  // Здесь можно добавить отправку результатов
}

// Система достижений
function checkEmpireAchievements(gameState) {
  const achievements = [];
  
  if (gameState.metrics.followers >= 1000000) {
    achievements.push({
      id: 'million-followers',
      name: 'Миллионник',
      description: 'Набрали 1 миллион подписчиков',
      icon: '👥'
    });
  }
  
  if (gameState.metrics.revenue >= 100000) {
    achievements.push({
      id: 'revenue-king',
      name: 'Король доходов',
      description: 'Достигли месячного дохода $100K+',
      icon: '💰'
    });
  }
  
  if (gameState.metrics.influence >= 100) {
    achievements.push({
      id: 'influence-master',
      name: 'Мастер влияния',
      description: 'Достигли максимального уровня влияния',
      icon: '👑'
    });
  }
  
  if (gameState.metrics.reputation >= 90) {
    achievements.push({
      id: 'reputation-saint',
      name: 'Святой репутации',
      description: 'Поддерживали репутацию выше 90%',
      icon: '😇'
    });
  }
  
  const activePlatforms = Object.values(gameState.platforms).filter(p => p.strategy).length;
  if (activePlatforms >= 4) {
    achievements.push({
      id: 'platform-master',
      name: 'Властелин платформ',
      description: 'Активны на всех 4 платформах одновременно',
      icon: '🌐'
    });
  }
  
  return achievements;
}

// Система подсказок для медиа-магнатов
const EMPIRE_HINTS = {
  stage1: [
    'Контент должен вызывать эмоции - равнодушие убивает охват',
    'Постоянство публикаций важнее качества отдельных постов',
    'Изучайте свою аудиторию - создавайте контент для них, а не для себя',
    'Тренды приходят и уходят, но психология остается неизменной'
  ],
  stage2: [
    'Дефицит работает только если аудитория верит в его реальность',
    'Авторитет строится годами, но может быть потерян за минуты',
    'Люди покупают не продукт, а чувства которые он дает',
    'Социальное доказательство сильнее любой рекламы'
  ],
  stage3: [
    'Бесплатное привлекает, но деньги делают на платном',
    'Подписчики - это не клиенты, конверсия требует отдельной работы',
    'Диверсифицируйте доходы - зависимость от одного источника опасна',
    'Цена должна соответствовать воспринимаемой ценности'
  ],
  stage4: [
    'Масштаб требует систем, а не героических усилий',
    'Команда может как ускорить рост, так и его замедлить',
    'Международная аудитория открывает новые возможности монетизации',
    'Автоматизация освобождает время для стратегических решений'
  ],
  stage5: [
    'Кризисы неизбежны - важна скорость и честность реакции',
    'Репутация - это банковский счет: легко потратить, сложно накопить',
    'Конкуренты будут копировать успешные стратегии',
    'Наследие строится не на популярности, а на влиянии на жизни людей'
  ]
};

function showEmpireHint(stage) {
  const hints = EMPIRE_HINTS[`stage${stage}`];
  if (hints && empireUI) {
    const randomHint = hints[Math.floor(Math.random() * hints.length)];
    empireUI.showToast(`💡 Совет магната: ${randomHint}`, 'info');
  }
}

// Автоматические подсказки для новых создателей контента
let empireHintTimer = null;

function startEmpireHintSystem() {
  const isNewUser = !localStorage.getItem('empireQuestCompleted');
  
  if (isNewUser) {
    empireHintTimer = setInterval(() => {
      if (empireEngine && empireEngine.getGameState().isRunning) {
        const currentStage = empireEngine.getGameState().currentStage;
        showEmpireHint(currentStage);
      }
    }, 45000); // Каждые 45 секунд
  }
}

function stopEmpireHintSystem() {
  if (empireHintTimer) {
    clearInterval(empireHintTimer);
    empireHintTimer = null;
  }
}

// Запускаем систему подсказок после инициализации
setTimeout(startEmpireHintSystem, 10000);

// Останавливаем подсказки при закрытии страницы
window.addEventListener('beforeunload', stopEmpireHintSystem);

// Функции для работы с локальным хранилищем
function saveEmpirePreferences(preferences) {
  localStorage.setItem('empireQuestPreferences', JSON.stringify(preferences));
}

function loadEmpirePreferences() {
  const prefs = localStorage.getItem('empireQuestPreferences');
  return prefs ? JSON.parse(prefs) : {
    preferredStrategies: [],
    favoritePlatforms: [],
    completedCount: 0,
    bestScore: 0
  };
}

// Функция для генерации отчета об империи
function generateEmpireReport(gameState) {
  const totalFollowers = gameState.metrics.followers;
  const totalRevenue = gameState.metrics.revenue;
  const influence = gameState.metrics.influence;
  const reputation = gameState.metrics.reputation;
  
  const platformStats = empireEngine.getPlatformStats();
  const mostSuccessful = Object.entries(platformStats).reduce((best, [platform, stats]) => 
    stats.performance > (best.performance || 0) ? { platform, ...stats } : best
  , {});
  
  return {
    summary: {
      totalScore: empireEngine.calculateFinalMetrics().totalScore,
      totalFollowers,
      totalRevenue,
      influence,
      reputation,
      stagesCompleted: Object.values(gameState.stageProgress).filter(s => s.completed).length
    },
    platforms: platformStats,
    mostSuccessfulPlatform: mostSuccessful.platform || 'none',
    strategies: gameState.placedStrategies.length,
    events: gameState.events.length,
    recommendations: empireEngine.getRecommendations(),
    achievements: checkEmpireAchievements(gameState)
  };
}

// Функции для социального шаринга результатов
function generateShareText(results) {
  const score = results.finalMetrics.totalScore;
  const followers = InfluenceDataService.formatNumber(results.finalMetrics.followers);
  const revenue = InfluenceDataService.formatNumber(results.finalMetrics.revenue);
  
  return `🏰 Создал медиа-империю!\n👥 ${followers} подписчиков\n💰 $${revenue}/месяц\n📊 ${score} очков влияния\n\n#ИмперияВлияния #МедиаМагнат`;
}

function shareResults(results) {
  const text = generateShareText(results);
  
  if (navigator.share) {
    navigator.share({
      title: 'Моя империя влияния',
      text: text
    });
  } else {
    // Fallback для браузеров без Web Share API
    navigator.clipboard.writeText(text).then(() => {
      empireUI?.showToast('Результаты скопированы в буфер обмена!', 'success');
    });
  }
}

// Система мотивационных уведомлений
const MOTIVATION_MESSAGES = [
  "🚀 Каждый великий медиа-магнат начинал с первого подписчика",
  "💡 Творческий кризис - это возможность для инноваций", 
  "👑 Влияние измеряется не числами, а изменениями в жизни людей",
  "🎯 Сосредоточьтесь на ценности для аудитории, деньги придут следом",
  "🔥 Постоянство побеждает талант, когда талант не постоянен"
];

function showMotivationalMessage() {
  const message = MOTIVATION_MESSAGES[Math.floor(Math.random() * MOTIVATION_MESSAGES.length)];
  if (empireUI) {
    empireUI.showToast(message, 'info');
  }
}

// Показываем мотивационное сообщение каждые 2 минуты во время игры
setInterval(() => {
  if (empireEngine && empireEngine.getGameState().isRunning) {
    showMotivationalMessage();
  }
}, 120000);

console.log('👑 Квест "Империя влияния" готов к созданию медиа-империи!');
