/* ===== BUSINESS QUEST MAIN ===== */

// Глобальные переменные
let businessEngine = null;
let businessUI = null;

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Инициализация квеста "Твой первый бизнес"...');
  
  try {
    // Создаем экземпляры движка и UI
    businessEngine = new BusinessQuestEngine();
    businessUI = new BusinessQuestUI(businessEngine);
    
    // Инициализируем компоненты
    businessEngine.initialize();
    businessUI.initialize();
    
    console.log('✅ Бизнес-квест успешно инициализирован');
    
  } catch (error) {
    console.error('❌ Ошибка инициализации квеста:', error);
    showErrorMessage('Произошла ошибка при загрузке квеста. Попробуйте перезагрузить страницу.');
  }
});

// Обработчик ошибок
window.addEventListener('error', function(event) {
  console.error('Глобальная ошибка:', event.error);
  
  if (businessUI) {
    businessUI.showToast('Произошла ошибка. Проверьте консоль для деталей.', 'error');
  }
});

// Обработчик необработанных промисов
window.addEventListener('unhandledrejection', function(event) {
  console.error('Необработанный промис:', event.reason);
  
  if (businessUI) {
    businessUI.showToast('Произошла асинхронная ошибка.', 'error');
  }
});

// Обработчик закрытия страницы
window.addEventListener('beforeunload', function(event) {
  if (businessEngine && businessEngine.getGameState().isRunning) {
    // Сохраняем прогресс перед закрытием
    businessEngine.saveProgress();
    
    // Показываем предупреждение
    event.preventDefault();
    event.returnValue = 'Ваш прогресс создания бизнеса будет потерян. Вы уверены?';
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
  if (!businessEngine) return null;
  
  const gameState = businessEngine.getGameState();
  
  return {
    isCompleted: !gameState.isRunning && gameState.currentStage > BUSINESS_CONFIG.stages,
    progress: Math.round((gameState.currentStage - 1) / BUSINESS_CONFIG.stages * 100),
    teamSize: gameState.employees.length,
    monthlyProfit: gameState.monthlyRevenue - gameState.monthlyExpenses,
    timeSpent: gameState.startTime ? Date.now() - gameState.startTime : 0
  };
}

function getQuestRewards() {
  if (!businessEngine) return null;
  
  const gameState = businessEngine.getGameState();
  
  if (gameState.isRunning || gameState.currentStage <= BUSINESS_CONFIG.stages) {
    return null; // Квест не завершен
  }
  
  const finalMetrics = businessEngine.calculateFinalMetrics();
  return businessEngine.calculateRewards(finalMetrics);
}

// Функции для работы с бизнес-данными
function getBusinessSummary() {
  if (!businessEngine) return null;
  
  return businessEngine.generateBusinessSummary();
}

function getTeamAnalytics() {
  if (!businessEngine) return null;
  
  const gameState = businessEngine.getGameState();
  const employees = gameState.employees;
  
  if (employees.length === 0) return null;
  
  // Аналитика по ролям
  const roleDistribution = {};
  employees.forEach(emp => {
    roleDistribution[emp.role] = (roleDistribution[emp.role] || 0) + 1;
  });
  
  // Средние показатели
  const avgStats = {
    efficiency: employees.reduce((sum, emp) => sum + emp.stats.efficiency, 0) / employees.length,
    creativity: employees.reduce((sum, emp) => sum + emp.stats.creativity, 0) / employees.length,
    leadership: employees.reduce((sum, emp) => sum + emp.stats.leadership, 0) / employees.length
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
      .sort((a, b) => b.performance - a.performance)
      .slice(0, 3)
      .map(emp => ({ name: emp.name, role: emp.role, performance: emp.performance }))
  };
}

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    businessEngine,
    businessUI,
    getQuestProgress,
    getQuestRewards,
    getBusinessSummary,
    getTeamAnalytics
  };
}

// Глобальные функции для отладки (только в dev режиме)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  window.debugBusiness = {
    engine: () => businessEngine,
    ui: () => businessUI,
    addMoney: (amount) => {
      if (businessEngine) {
        businessEngine.gameState.capital += amount;
        businessUI.updateBusinessInterface();
      }
    },
    hireRandomEmployee: () => {
      if (businessEngine) {
        const candidate = businessEngine.getCurrentCandidate();
        if (candidate) {
          const availablePositions = businessEngine.getAvailablePositions();
          if (availablePositions.length > 0) {
            const position = availablePositions.includes(candidate.role) ? 
                           candidate.role : availablePositions[0];
            businessEngine.hireEmployee(candidate.id, position);
            businessUI.updateBusinessInterface();
            businessUI.loadNextCandidate();
          }
        }
      }
    },
    skipToStage: (stage) => {
      if (businessEngine) {
        businessEngine.gameState.currentStage = Math.min(stage, BUSINESS_CONFIG.stages);
        businessUI.updateBusinessInterface();
      }
    },
    completeBusiness: () => {
      if (businessEngine) {
        businessEngine.gameState.currentStage = BUSINESS_CONFIG.stages + 1;
        businessUI.completeBusiness();
      }
    },
    getAnalytics: () => getTeamAnalytics()
  };
  
  console.log('🔧 Debug функции доступны в window.debugBusiness');
}

// Функции для аналитики и достижений
function trackBusinessStart(nicheId) {
  console.log('📊 Бизнес начат:', nicheId);
  // Здесь можно добавить отправку аналитики
}

function trackEmployeeHired(employee, position) {
  console.log('📊 Сотрудник нанят:', { employee: employee.name, position, salary: employee.salary });
  // Здесь можно отслеживать найм сотрудников
}

function trackBusinessComplete(results) {
  console.log('📊 Бизнес завершен:', results);
  // Здесь можно добавить отправку результатов
}

// Система достижений
function checkBusinessAchievements(gameState) {
  const achievements = [];
  
  if (gameState.employees.length >= 8) {
    achievements.push({
      id: 'team-builder',
      name: 'Командный игрок',
      description: 'Собрали команду из 8+ человек',
      icon: '👥'
    });
  }
  
  const monthlyProfit = gameState.monthlyRevenue - gameState.monthlyExpenses;
  if (monthlyProfit >= 20000) {
    achievements.push({
      id: 'profit-master',
      name: 'Мастер прибыли',
      description: 'Достигли месячной прибыли $20K+',
      icon: '💰'
    });
  }
  
  if (gameState.capital >= 100000) {
    achievements.push({
      id: 'capital-accumulator',
      name: 'Накопитель капитала',
      description: 'Накопили $100K+ капитала',
      icon: '🏦'
    });
  }
  
  const uniqueRoles = [...new Set(gameState.employees.map(emp => emp.role))];
  if (uniqueRoles.length >= 6) {
    achievements.push({
      id: 'diversity-champion',
      name: 'Чемпион разнообразия',
      description: 'Наняли специалистов 6+ различных ролей',
      icon: '🌟'
    });
  }
  
  return achievements;
}

// Система подсказок для предпринимателей
const BUSINESS_HINTS = {
  stage1: [
    'Выбирайте нишу исходя из соотношения прибыльности и сложности',
    'Обращайте внимание на стартовые затраты - они влияют на ваш капитал',
    'Некоторые ниши требуют определенных специалистов для успеха'
  ],
  stage2: [
    'Нанимайте сотрудников с высокими показателями эффективности',
    'Баланс между зарплатой и навыками - ключ к успешному найму',
    'Используйте drag & drop для найма сотрудников на конкретные позиции'
  ],
  stage3: [
    'Убедитесь, что у вас есть все ключевые роли для вашей ниши',
    'Следите за соотношением доходов и расходов',
    'Инвестируйте в команду для долгосрочного успеха'
  ],
  stage4: [
    'Оптимизируйте команду для достижения максимальной прибыльности',
    'Рассмотрите возможность найма дополнительных специалистов',
    'Готовьтесь к масштабированию бизнеса'
  ]
};

function showBusinessHint(stage) {
  const hints = BUSINESS_HINTS[`stage${stage}`];
  if (hints && businessUI) {
    const randomHint = hints[Math.floor(Math.random() * hints.length)];
    businessUI.showToast(`💡 Совет: ${randomHint}`, 'info');
  }
}

// Автоматические подсказки для новых предпринимателей
let businessHintTimer = null;

function startBusinessHintSystem() {
  const isNewUser = !localStorage.getItem('businessQuestCompleted');
  
  if (isNewUser) {
    businessHintTimer = setInterval(() => {
      if (businessEngine && businessEngine.getGameState().isRunning) {
        const currentStage = businessEngine.getGameState().currentStage;
        showBusinessHint(currentStage);
      }
    }, 45000); // Каждые 45 секунд
  }
}

function stopBusinessHintSystem() {
  if (businessHintTimer) {
    clearInterval(businessHintTimer);
    businessHintTimer = null;
  }
}

// Запускаем систему подсказок после инициализации
setTimeout(startBusinessHintSystem, 10000);

// Останавливаем подсказки при закрытии страницы
window.addEventListener('beforeunload', stopBusinessHintSystem);

// Функции для работы с локальным хранилищем
function saveBusinessPreferences(preferences) {
  localStorage.setItem('businessQuestPreferences', JSON.stringify(preferences));
}

function loadBusinessPreferences() {
  const prefs = localStorage.getItem('businessQuestPreferences');
  return prefs ? JSON.parse(prefs) : {
    preferredNiches: [],
    favoriteRoles: [],
    completedCount: 0
  };
}

// Функция для генерации отчета о бизнесе
function generateBusinessReport(gameState) {
  const employees = gameState.employees;
  const monthlyProfit = gameState.monthlyRevenue - gameState.monthlyExpenses;
  const roi = BusinessDataService.calculateROI(
    gameState.monthlyRevenue,
    gameState.monthlyExpenses,
    BUSINESS_CONFIG.startingCapital
  );
  
  return {
    summary: {
      niche: gameState.selectedNiche?.name || 'Не выбрана',
      teamSize: employees.length,
      monthlyRevenue: gameState.monthlyRevenue,
      monthlyExpenses: gameState.monthlyExpenses,
      monthlyProfit,
      roi,
      businessAge: gameState.businessAge
    },
    team: employees.map(emp => ({
      name: emp.name,
      role: emp.role,
      position: emp.position,
      salary: emp.salary,
      performance: emp.performance,
      experience: emp.experience
    })),
    financials: {
      startingCapital: BUSINESS_CONFIG.startingCapital,
      currentCapital: gameState.capital,
      totalInvested: BUSINESS_CONFIG.startingCapital - gameState.capital + gameState.selectedNiche?.metrics.startupCost || 0,
      breakEvenPoint: monthlyProfit > 0 ? Math.ceil((BUSINESS_CONFIG.startingCapital - gameState.capital) / monthlyProfit) : null
    },
    recommendations: generateBusinessRecommendations(gameState)
  };
}

function generateBusinessRecommendations(gameState) {
  const recommendations = [];
  const monthlyProfit = gameState.monthlyRevenue - gameState.monthlyExpenses;
  
  if (monthlyProfit <= 0) {
    recommendations.push({
      type: 'urgent',
      title: 'Достижение прибыльности',
      description: 'Необходимо срочно оптимизировать расходы или увеличить доходы'
    });
  }
  
  if (gameState.employees.length < 5) {
    recommendations.push({
      type: 'growth',
      title: 'Расширение команды',
      description: 'Рассмотрите найм дополнительных специалистов для ускорения роста'
    });
  }
  
  if (gameState.capital < 10000) {
    recommendations.push({
      type: 'financial',
      title: 'Управление капиталом',
      description: 'Следите за уровнем оборотного капитала для обеспечения стабильности'
    });
  }
  
  return recommendations;
}

console.log('🎮 Квест "Твой первый бизнес" готов к запуску!');
