/* ===== BUSINESS QUEST UI ===== */

class BusinessQuestUI {
  constructor() {
    this.currentStage = 'niche-selection';
  }

  // Показ уведомлений
  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff'};
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
      z-index: 1000;
      font-weight: 600;
      max-width: 300px;
      word-wrap: break-word;
    `;
    
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // Обновление прогресса
  updateProgress(current, total) {
    const progress = Math.round((current / total) * 100);
    console.log(`📊 Прогресс: ${progress}% (${current}/${total})`);
  }

  // Показ результатов
  showResults(results) {
    console.log('🏆 Результаты квеста:', results);
    
    if (results.success) {
      this.showToast('🎉 Поздравляем! Бизнес успешно создан!', 'success');
    } else {
      this.showToast('💸 Бизнес обанкротился, но вы получили опыт!', 'error');
    }
  }
}

// Инициализация UI при загрузке страницы
window.addEventListener('DOMContentLoaded', () => {
  window.businessUI = new BusinessQuestUI();
});
