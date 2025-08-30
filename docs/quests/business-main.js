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
  const progress = businessEngine.getQuestProgress();
  
  return {
    stage: progress.current,
    totalStages: progress.total,
    percentage: progress.percentage,
    isCompleted: gameState.isCompleted,
    isRunning: gameState.isRunning
  };
}

function getQuestRewards() {
  if (!businessEngine || !businessEngine.gameState.isCompleted) {
    return null;
  }
  
  return {
    mulacoin: 50,
    experience: 200,
    achievement: 'Предприниматель'
  };
}

function resetQuest() {
  if (businessEngine) {
    businessEngine.resetQuest();
    if (businessUI) {
      businessUI.renderCurrentStage();
    }
  }
}

// Глобальные функции для доступа из HTML
window.getQuestProgress = getQuestProgress;
window.getQuestRewards = getQuestRewards;
window.resetQuest = resetQuest;

// Функции для отладки
window.debugQuest = function() {
  if (businessEngine) {
    console.log('🔍 Состояние квеста:', businessEngine.getGameState());
    console.log('📊 Статистика команды:', businessEngine.getTeamStats());
    console.log('📈 Прогресс квеста:', businessEngine.getQuestProgress());
  }
};

window.showQuestState = function() {
  if (businessEngine) {
    const state = businessEngine.getGameState();
    alert(`
Состояние квеста:
- Этап: ${state.currentStage + 1}/4
- Ниша: ${state.selectedNiche?.name || 'Не выбрана'}
- Команда: ${Object.keys(state.hiredTeam).length}/4
- Капитал: ${state.businessStats.capital} ₽
- Доход: ${state.businessStats.revenue} ₽
- Месяц: ${state.businessStats.month}
- Завершен: ${state.isCompleted ? 'Да' : 'Нет'}
    `);
  }
};

// Автоматическое сохранение каждые 30 секунд
setInterval(() => {
  if (businessEngine && businessEngine.getGameState().isRunning) {
    businessEngine.saveProgress();
  }
}, 30000);

// Обработчик изменения размера окна
window.addEventListener('resize', function() {
  // Пересчитываем размеры для адаптивности
  if (businessUI) {
    // Можно добавить логику пересчета размеров
  }
});

// Обработчик видимости страницы
document.addEventListener('visibilitychange', function() {
  if (document.hidden) {
    // Страница скрыта - сохраняем прогресс
    if (businessEngine) {
      businessEngine.saveProgress();
    }
  }
});

console.log('📱 Бизнес-квест готов к работе!');
