/* ====== OPTIMIZED QUESTS.JS - MINIMAL VERSION ====== */

// Этот файл загружается только для совместимости
// Основная логика теперь находится в quests.html

console.log('Quest system initialized - using inline version');

// Экспортируем основные функции для совместимости
window.questSystem = {
  // Пустые функции для совместимости
  toast: () => {},
  closeModal: () => {},
  startQuest: () => {},
  loadState: () => ({ userId: null, username: null, isSubscribed: true, isAdmin: false })
};

// Экспортируем addRewards для совместимости
window.addRewards = () => {};

console.log('Quest system compatibility layer loaded');
