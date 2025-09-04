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

// Функция для отображения ошибок
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