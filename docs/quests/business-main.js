/* ===== BUSINESS QUEST MAIN ===== */

// Основная логика запуска квеста
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Квест "Твой первый бизнес" загружен');
  
  // Инициализация движка
  if (window.businessEngine) {
    console.log('✅ Движок квеста инициализирован');
  }
  
  // Обработка кнопки "Назад"
  document.getElementById('btnBack').addEventListener('click', () => {
    // Возврат к списку квестов
    window.history.back();
  });
  
  // Добавляем звуковые эффекты (опционально)
  initializeSoundEffects();
  
  // Добавляем анимации загрузки
  initializeLoadingAnimations();
});

// Инициализация звуковых эффектов
function initializeSoundEffects() {
  // Здесь можно добавить звуковые эффекты для квеста
  console.log('🔊 Звуковые эффекты готовы');
}

// Инициализация анимаций загрузки
function initializeLoadingAnimations() {
  // Анимация появления элементов
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  });
  
  // Наблюдаем за всеми карточками
  document.querySelectorAll('.niche-button, .candidate-slot, .scenario-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'all 0.6s ease';
    observer.observe(el);
  });
}

// Глобальные функции для взаимодействия с движком
window.assignWorkerToScenario = function(scenarioId, workerId) {
  if (window.businessEngine) {
    window.businessEngine.assignWorkerToScenario(scenarioId, workerId);
  }
};

// Функция для тестирования (можно удалить в продакшене)
window.testQuest = function() {
  console.log('🧪 Тестовый режим квеста');
  console.log('Выбранная ниша:', window.businessEngine?.selectedNiche);
  console.log('Нанятые кандидаты:', window.businessEngine?.hiredCandidates);
  console.log('Назначения работников:', window.businessEngine?.workerAssignments);
};

// Функция для быстрого прохождения квеста (только для разработки)
window.quickComplete = function() {
  if (window.businessEngine) {
    // Автоматически заполняем все слоты
    for (let i = 0; i < 9; i++) {
      const slot = document.querySelector(`[data-slot="${i}"]`);
      if (slot && !slot.classList.contains('filled')) {
        // Создаем случайного кандидата
        const roles = ['marketing', 'sales', 'tech', 'finance', 'operations'];
        const randomRole = roles[Math.floor(Math.random() * roles.length)];
        const candidate = BusinessDataService.getRandomCandidate(randomRole);
        
        if (candidate) {
          window.businessEngine.assignCandidateToSlot(candidate, i.toString());
        }
      }
    }
    
    // Показываем кнопку продолжить
    document.getElementById('continueToBusiness').disabled = false;
    
    console.log('⚡ Квест быстро завершен для тестирования');
  }
};

// Функция для сброса прогресса
window.resetQuest = function() {
  if (confirm('Сбросить прогресс квеста?')) {
    window.location.reload();
  }
};

// Функция для показа статистики
window.showStats = function() {
  if (window.businessEngine) {
    const stats = {
      'Текущий этап': window.businessEngine.currentStage,
      'Выбранная ниша': window.businessEngine.selectedNiche?.name || 'Не выбрана',
      'Нанятые кандидаты': window.businessEngine.hiredCandidates.length,
      'Завершенные сценарии': window.businessEngine.completedScenarios,
      'Успешность бизнеса': window.businessEngine.businessSuccess ? 'Успешно' : 'Провал'
    };
    
    console.table(stats);
    alert('Статистика выведена в консоль');
  }
};

// Добавляем глобальные функции в консоль
console.log('🎮 Доступные функции:');
console.log('• testQuest() - показать текущее состояние');
console.log('• quickComplete() - быстро завершить квест (для тестирования)');
console.log('• resetQuest() - сбросить прогресс');
console.log('• showStats() - показать статистику');

console.log('🎯 Квест "Твой первый бизнес" готов к использованию!');
