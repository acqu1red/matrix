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
    if (businessEngine && typeof businessEngine.initialize === 'function') {
      businessEngine.initialize();
    }
    if (businessUI && typeof businessUI.initialize === 'function') {
      businessUI.initialize();
    }
    
    // Экспорт в глобал для inline-обработчиков
    window.businessEngine = businessEngine;
    window.businessUI = businessUI;
    
    console.log('✅ Квест инициализирован');
  } catch (err) {
    console.error('❌ Ошибка инициализации квеста:', err);
    showErrorMessage('Произошла ошибка при загрузке квеста. Попробуйте перезагрузить страницу.');
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


/* ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===== */
function showErrorMessage(text) {
  try {
    const modal = document.getElementById('introModal');
    if (modal) {
      modal.classList.add('show');
      modal.style.display = 'block';
      const ph = modal.querySelector('.modalText') || modal.querySelector('.modal-content') || modal;
      const p = document.createElement('p');
      p.style.color = '#ffb3b3';
      p.textContent = text;
      ph.appendChild(p);
    } else {
      alert(text);
    }
  } catch (e) {
    console.warn('Не удалось показать сообщение об ошибке', e);
    alert(text);
  }
}
