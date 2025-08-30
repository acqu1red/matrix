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

// Обработчик ошибок (без показа пользователю)
window.addEventListener('error', function(event) {
  console.error('Глобальная ошибка:', event.error);
  // Убираем показ ошибок пользователю
});

// Обработчик необработанных промисов (без показа пользователю)
window.addEventListener('unhandledrejection', function(event) {
  console.error('Необработанный промис:', event.reason);
  // Убираем показ ошибок пользователю
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
  // Убираем показ ошибок пользователю - только логируем в консоль
  console.error('Ошибка квеста:', message);
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


// Надёжный делегированный обработчик (fallback)
document.addEventListener('click', function(ev) {
  const t = ev.target;
  if (t && t.id === 'startQuest' && window.businessUI && typeof window.businessUI.startQuest === 'function') {
    ev.preventDefault();
    window.businessUI.startQuest();
  }
}, { capture: true });
