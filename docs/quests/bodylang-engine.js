/* ===== BODY LANGUAGE QUEST ENGINE ===== */
// Файл для совместимости - основная логика находится в bodylang-main.js

console.log('🧠 Body Language Quest Engine загружен');

// Экспортируем пустые функции для совместимости
window.BodyLanguageEngine = {
  // Заглушки для совместимости
  init: function() { console.log('Engine init called'); },
  start: function() { console.log('Engine start called'); },
  stop: function() { console.log('Engine stop called'); }
};
