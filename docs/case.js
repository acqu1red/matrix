// ====== CASE ROULETTE JAVASCRIPT ======

// Конфигурация призов с точными шансами
const PRIZES_CONFIG = [
  { 
    name: 'Скидка 10% на любую подписку', 
    type: 'discount', 
    value: 10, 
    chance: 40, 
    icon: '💎', 
    action: 'use',
    description: 'Получите скидку 10% на любую подписку'
  },
  { 
    name: 'Скидка 20% на подписку 6 мес.', 
    type: 'discount', 
    value: 20, 
    chance: 25, 
    icon: '💎', 
    action: 'use',
    description: 'Скидка 20% на подписку на 6 месяцев'
  },
  { 
    name: 'Скидка 50% на подписку 12 мес.', 
    type: 'discount', 
    value: 50, 
    chance: 15, 
    icon: '💎', 
    action: 'use',
    description: 'Скидка 50% на подписку на 12 месяцев'
  },
  { 
    name: 'Полная подписка 1 мес.', 
    type: 'subscription', 
    value: 1, 
    chance: 5, 
    icon: '🎫', 
    action: 'activate',
    description: 'Бесплатная подписка на 1 месяц'
  },
  { 
    name: '50 MULACOIN', 
    type: 'mulacoin', 
    value: 50, 
    chance: 40, 
    icon: '🥇', 
    action: 'activate',
    description: 'Получите 50 золотых монет'
  },
  { 
    name: '+1 SPIN', 
    type: 'spin', 
    value: 1, 
    chance: 80, 
    icon: '🎰', 
    action: 'activate',
    description: 'Дополнительный спин в рулетке'
  },
  { 
    name: '10 MULACOIN', 
    type: 'mulacoin', 
    value: 10, 
    chance: 60, 
    icon: '🥇', 
    action: 'activate',
    description: 'Получите 10 золотых монет'
  },
  { 
    name: 'Личная консультация', 
    type: 'consultation', 
    value: 1, 
    chance: 3, 
    icon: '👨‍💼', 
    action: 'use',
    description: 'Персональная консультация от эксперта'
  },
  { 
    name: 'Полное обучение ФРОДУ', 
    type: 'education', 
    value: 1, 
    chance: 1, 
    icon: '📚', 
    action: 'use',
    description: 'Полный курс обучения ФРОДУ'
  }
];

// Состояние игры
let gameState = {
  spinsLeft: 3,
  totalWins: 0,
  mulacoinBalance: 0,
  isSpinning: false,
  userPrizes: [],
  spinHistory: [],
  lastSpinTime: null
};

// Аудио элементы
let spinAudio = null;
let winAudio = null;

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
  initializeGame();
  loadGameState();
  initializeRoulette();
  updateDisplay();
  loadUserPrizes();
  setupEventListeners();
  preloadAudio();
});

// Инициализация игры
function initializeGame() {
  // Проверяем, есть ли сохраненные данные
  const savedData = localStorage.getItem('rouletteGameState');
  if (savedData) {
    try {
      const parsed = JSON.parse(savedData);
      gameState = { ...gameState, ...parsed };
    } catch (e) {
      console.warn('Ошибка загрузки сохраненных данных:', e);
    }
  }
  
  // Инициализируем аудио
  preloadAudio();
}

// Предзагрузка аудио
function preloadAudio() {
  try {
    spinAudio = new Audio('./assets/photovideo/kazik.mp3');
    spinAudio.volume = 0.5;
    spinAudio.preload = 'auto';
  } catch (e) {
    console.warn('Не удалось загрузить аудио:', e);
  }
}

// Настройка обработчиков событий
function setupEventListeners() {
  // Обработка клавиши Escape
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeWinningModal();
    }
  });

  // Обработка клика вне модального окна
  const modal = document.getElementById('winningModal');
  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === this) {
        closeWinningModal();
      }
    });
  }

  // Обработка изменения видимости страницы
  document.addEventListener('visibilitychange', function() {
    if (document.hidden && gameState.isSpinning) {
      // Если страница скрыта во время вращения, останавливаем
      stopRoulette();
    }
  });
}

// Загрузка состояния игры
function loadGameState() {
  const saved = localStorage.getItem('rouletteGameState');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      gameState = { ...gameState, ...parsed };
    } catch (e) {
      console.warn('Ошибка загрузки состояния игры:', e);
    }
  }
}

// Сохранение состояния игры
function saveGameState() {
  try {
    localStorage.setItem('rouletteGameState', JSON.stringify(gameState));
  } catch (e) {
    console.warn('Ошибка сохранения состояния игры:', e);
  }
}

// Инициализация рулетки
function initializeRoulette() {
  const track = document.getElementById('rouletteTrack');
  if (!track) return;

  // Создаем бесконечную ленту призов
  let html = '';
  const totalItems = 100; // Увеличиваем количество элементов для плавности
  
  for (let i = 0; i < totalItems; i++) {
    const prize = PRIZES_CONFIG[Math.floor(Math.random() * PRIZES_CONFIG.length)];
    html += `<div class="roulette-item" data-prize="${prize.type}">${prize.icon} ${prize.name}</div>`;
  }
  
  track.innerHTML = html;
  
  // Добавляем эффект бесконечности
  track.addEventListener('transitionend', function() {
    if (track.classList.contains('slowdown')) {
      // После остановки перемещаем в начальное положение
      setTimeout(() => {
        track.style.transition = 'none';
        track.style.transform = 'translateX(0)';
        setTimeout(() => {
          track.style.transition = 'transform 15s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        }, 10);
      }, 100);
    }
  });
}

// Обновление отображения
function updateDisplay() {
  const spinsLeftEl = document.getElementById('spinsLeft');
  const totalWinsEl = document.getElementById('totalWins');
  const mulacoinBalanceEl = document.getElementById('mulacoinBalance');
  
  if (spinsLeftEl) spinsLeftEl.textContent = gameState.spinsLeft;
  if (totalWinsEl) totalWinsEl.textContent = gameState.totalWins;
  if (mulacoinBalanceEl) mulacoinBalanceEl.textContent = gameState.mulacoinBalance;
  
  const spinBtn = document.getElementById('spinBtn');
  const buySpinBtn = document.getElementById('buySpinBtn');
  
  if (spinBtn) {
    spinBtn.disabled = gameState.isSpinning || gameState.spinsLeft <= 0;
    spinBtn.textContent = gameState.isSpinning ? '🎰 Крутится...' : '🎰 Крутить рулетку';
  }
  
  if (buySpinBtn) {
    buySpinBtn.disabled = gameState.mulacoinBalance < 50;
  }
  
  // Обновляем анимацию для статистики
  animateStats();
}

// Анимация статистики
function animateStats() {
  const statValues = document.querySelectorAll('.stat-value');
  statValues.forEach(el => {
    el.style.animation = 'none';
    setTimeout(() => {
      el.style.animation = 'countUp 0.6s ease-out';
    }, 10);
  });
}

// Кручение рулетки
function spinRoulette() {
  if (gameState.isSpinning || gameState.spinsLeft <= 0) {
    showToast('Нельзя крутить рулетку сейчас!', 'error');
    return;
  }

  // Проверяем время последнего спина (антиспам)
  const now = Date.now();
  if (gameState.lastSpinTime && (now - gameState.lastSpinTime) < 1000) {
    showToast('Подождите немного перед следующим спином!', 'warning');
    return;
  }

  gameState.isSpinning = true;
  gameState.spinsLeft--;
  gameState.lastSpinTime = now;
  
  updateDisplay();

  const track = document.getElementById('rouletteTrack');
  const spinBtn = document.getElementById('spinBtn');
  
  if (!track || !spinBtn) return;
  
  // Блокируем кнопку
  spinBtn.disabled = true;
  spinBtn.textContent = '🎰 Крутится...';

  // Запускаем анимацию
  track.classList.add('spinning');
  
  // Воспроизводим звук
  playSpinSound();

  // Через 10 секунд начинаем замедление
  setTimeout(() => {
    track.classList.remove('spinning');
    track.classList.add('slowdown');
    
    // Плавно замедляем
    track.style.transition = 'transform 5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    
    // Вычисляем финальную позицию
    const finalPosition = calculateFinalPosition();
    track.style.transform = `translateX(${finalPosition}px)`;
    
  }, 10000);

  // Через 15 секунд останавливаемся
  setTimeout(() => {
    stopRoulette();
  }, 15000);
}

// Вычисление финальной позиции
function calculateFinalPosition() {
  // Случайная позиция для остановки
  const basePosition = -Math.random() * 1000 - 500;
  return basePosition;
}

// Остановка рулетки
function stopRoulette() {
  const track = document.getElementById('rouletteTrack');
  if (!track) return;
  
  track.classList.remove('slowdown');
  
  // Определяем выигрышный приз
  const winningPrize = determineWinningPrize();
  
  // Показываем модальное окно
  showWinningModal(winningPrize);
  
  // Обновляем состояние
  gameState.totalWins++;
  gameState.userPrizes.push(winningPrize);
  gameState.spinHistory.push({
    prize: winningPrize,
    timestamp: Date.now()
  });
  
  // Сохраняем состояние
  saveGameState();
  updateDisplay();
  loadUserPrizes();
  
  // Разблокируем кнопку
  gameState.isSpinning = false;
  const spinBtn = document.getElementById('spinBtn');
  if (spinBtn) {
    spinBtn.disabled = false;
    spinBtn.textContent = '🎰 Крутить рулетку';
  }
  
  // Показываем уведомление о выигрыше
  showToast(`🎉 Выигрыш: ${winningPrize.name}!`, 'success');
}

// Определение выигрышного приза
function determineWinningPrize() {
  const random = Math.random() * 100;
  let cumulativeChance = 0;
  
  for (const prize of PRIZES_CONFIG) {
    cumulativeChance += prize.chance;
    if (random <= cumulativeChance) {
      return { ...prize, id: Date.now() + Math.random() };
    }
  }
  
  // Fallback - возвращаем первый приз
  return { ...PRIZES_CONFIG[0], id: Date.now() + Math.random() };
}

// Показ модального окна выигрыша
function showWinningModal(prize) {
  const modal = document.getElementById('winningModal');
  const icon = document.getElementById('winningIcon');
  const title = document.getElementById('winningTitle');
  const description = document.getElementById('winningDescription');
  const actions = document.getElementById('winningActions');

  if (!modal || !icon || !title || !description || !actions) return;

  icon.textContent = prize.icon;
  title.textContent = '🎉 Поздравляем!';
  description.textContent = `Вы выиграли: ${prize.name}`;

  let actionsHtml = '';
  if (prize.action === 'activate') {
    actionsHtml = `<button class="btn btn-primary btn-small" onclick="activatePrize('${prize.id}')">Активировать</button>`;
  } else if (prize.action === 'use') {
    actionsHtml = `<button class="btn btn-secondary btn-small" onclick="usePrize('${prize.id}')">Использовать</button>`;
  }
  
  actionsHtml += `<button class="btn btn-secondary btn-small" onclick="closeWinningModal()">Закрыть</button>`;
  actions.innerHTML = actionsHtml;

  modal.style.display = 'flex';
  
  // Добавляем анимацию появления
  modal.style.animation = 'fadeIn 0.3s ease';
}

// Закрытие модального окна
function closeWinningModal() {
  const modal = document.getElementById('winningModal');
  if (modal) {
    modal.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => {
      modal.style.display = 'none';
    }, 300);
  }
}

// Активация приза
function activatePrize(prizeId) {
  const prize = gameState.userPrizes.find(p => p.id == prizeId);
  if (!prize) return;

  let message = '';
  let success = false;

  switch (prize.type) {
    case 'mulacoin':
      gameState.mulacoinBalance += prize.value;
      message = `Получено ${prize.value} MULACOIN!`;
      success = true;
      break;
    case 'spin':
      gameState.spinsLeft += prize.value;
      message = `Получено ${prize.value} дополнительный спин!`;
      success = true;
      break;
    case 'subscription':
      // Команда для выдачи подписки
      if (window.Telegram && window.Telegram.WebApp) {
        try {
          window.Telegram.WebApp.sendData(JSON.stringify({
            command: '/galdin',
            duration: '1 месяц',
            timestamp: Date.now()
          }));
          message = 'Подписка активирована!';
          success = true;
        } catch (e) {
          message = 'Ошибка активации подписки';
          success = false;
        }
      } else {
        message = 'Подписка активирована!';
        success = true;
      }
      break;
  }

  if (success) {
    // Удаляем приз из списка
    gameState.userPrizes = gameState.userPrizes.filter(p => p.id != prizeId);
    
    saveGameState();
    updateDisplay();
    loadUserPrizes();
    closeWinningModal();
    
    showToast(message, 'success');
  } else {
    showToast(message, 'error');
  }
}

// Использование приза
function usePrize(prizeId) {
  const prize = gameState.userPrizes.find(p => p.id == prizeId);
  if (!prize) return;

  let message = '';
  let originalPrice = '';
  let discountedPrice = '';

  switch (prize.type) {
    case 'discount':
      if (prize.value === 10) {
        originalPrice = 'Любая подписка';
        discountedPrice = 'Скидка 10%';
      } else if (prize.value === 20) {
        originalPrice = 'Подписка 6 мес.';
        discountedPrice = 'Скидка 20%';
      } else if (prize.value === 50) {
        originalPrice = 'Подписка 12 мес.';
        discountedPrice = 'Скидка 50%';
      }
      message = `Хочу активировать промокод: ${prize.name}\n\n${originalPrice}\n${discountedPrice}`;
      break;
    case 'consultation':
      message = 'Хочу получить личную консультацию по промокоду!';
      break;
    case 'education':
      message = 'Хочу активировать промокод на полное обучение ФРОДУ!';
      break;
  }

  // Отправляем сообщение админу
  try {
    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.openTelegramLink(`https://t.me/acqu1red?text=${encodeURIComponent(message)}`);
    } else {
      // Fallback для браузера
      window.open(`https://t.me/acqu1red?text=${encodeURIComponent(message)}`, '_blank');
    }
    
    // Удаляем приз из списка
    gameState.userPrizes = gameState.userPrizes.filter(p => p.id != prizeId);
    
    saveGameState();
    updateDisplay();
    loadUserPrizes();
    closeWinningModal();
    
    showToast('Промокод использован!', 'success');
  } catch (e) {
    showToast('Ошибка отправки сообщения', 'error');
  }
}

// Покупка спина
function buySpin() {
  if (gameState.mulacoinBalance < 50) {
    showToast('Недостаточно MULACOIN!', 'error');
    return;
  }

  gameState.mulacoinBalance -= 50;
  gameState.spinsLeft += 1;
  
  saveGameState();
  updateDisplay();
  showToast('Спин куплен за 50 MULACOIN!', 'success');
}

// Показ призов
function showPrizes() {
  let prizesHtml = '<div style="text-align: center; padding: 20px;">';
  prizesHtml += '<h3 style="color: var(--text-primary); margin-bottom: 20px;">🏆 Доступные призы</h3>';
  
  PRIZES_CONFIG.forEach(prize => {
    prizesHtml += `
      <div style="background: var(--accent-gold); padding: 15px; margin: 10px 0; border-radius: 10px; border: 2px solid var(--bg-primary);">
        <div style="font-size: 24px; margin-bottom: 10px;">${prize.icon}</div>
        <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 5px;">${prize.name}</div>
        <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">${prize.description}</div>
        <div style="font-size: 12px; color: var(--text-secondary);">Шанс: ${prize.chance}%</div>
      </div>
    `;
  });
  
  prizesHtml += '</div>';
  
  // Показываем в модальном окне
  showModal('Призы', prizesHtml);
}

// Загрузка призов пользователя
function loadUserPrizes() {
  const promoGrid = document.getElementById('promoGrid');
  if (!promoGrid) return;

  if (gameState.userPrizes.length === 0) {
    promoGrid.innerHTML = `
      <div style="text-align: center; color: var(--text-secondary); padding: 40px;">
        <div style="font-size: 48px; margin-bottom: 20px;">🎰</div>
        <h3 style="margin-bottom: 15px;">У вас пока нет выигранных призов</h3>
        <p>Крутите рулетку, чтобы получить уникальные призы и промокоды!</p>
      </div>
    `;
    return;
  }

  let html = '';
  gameState.userPrizes.forEach(prize => {
    html += `
      <div class="promo-card">
        <div class="promo-name">${prize.icon} ${prize.name}</div>
        <div class="promo-description">
          ${prize.type === 'discount' ? `Скидка ${prize.value}%` : 
            prize.type === 'mulacoin' ? `${prize.value} MULACOIN` :
            prize.type === 'spin' ? `+${prize.value} спин` :
            prize.type === 'subscription' ? 'Подписка 1 месяц' :
            prize.type === 'consultation' ? 'Личная консультация' :
            'Полное обучение ФРОДУ'}
        </div>
        <div class="promo-actions">
          ${prize.action === 'activate' ? 
            `<button class="btn btn-small btn-activate" onclick="activatePrize('${prize.id}')">Активировать</button>` :
            `<button class="btn btn-small btn-use" onclick="usePrize('${prize.id}')">Использовать</button>`
          }
        </div>
      </div>
    `;
  });

  promoGrid.innerHTML = html;
}

// Воспроизведение звука
function playSpinSound() {
  if (spinAudio) {
    try {
      spinAudio.currentTime = 0;
      spinAudio.play().catch(e => console.log('Не удалось воспроизвести звук:', e));
    } catch (e) {
      console.log('Ошибка воспроизведения звука:', e);
    }
  }
}

// Показ модального окна
function showModal(title, content) {
  const modal = document.getElementById('winningModal');
  const icon = document.getElementById('winningIcon');
  const titleEl = document.getElementById('winningTitle');
  const description = document.getElementById('winningDescription');
  const actions = document.getElementById('winningActions');

  if (!modal || !icon || !titleEl || !description || !actions) return;

  icon.textContent = '🏆';
  titleEl.textContent = title;
  description.innerHTML = content;
  actions.innerHTML = '<button class="btn btn-primary btn-small" onclick="closeWinningModal()">Закрыть</button>';

  modal.style.display = 'flex';
}

// Показ уведомления
function showToast(message, type = 'info') {
  // Удаляем существующие уведомления
  const existingToasts = document.querySelectorAll('.toast-notification');
  existingToasts.forEach(toast => document.body.removeChild(toast));

  // Создаем новое уведомление
  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : type === 'warning' ? '#ff9800' : '#2196F3'};
    color: white;
    padding: 15px 20px;
    border-radius: 10px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    z-index: 10000;
    font-weight: 600;
    max-width: 300px;
    word-wrap: break-word;
    transform: translateX(100%);
    transition: transform 0.3s ease;
  `;
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  // Анимация появления
  setTimeout(() => {
    toast.style.transform = 'translateX(0)';
  }, 100);
  
  // Автоматическое скрытие
  setTimeout(() => {
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 300);
  }, 3000);
}

// Возврат назад
function goBack() {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.href = 'quests.html';
  }
}

// Экспорт функций для использования в HTML
window.spinRoulette = spinRoulette;
window.buySpin = buySpin;
window.showPrizes = showPrizes;
window.activatePrize = activatePrize;
window.usePrize = usePrize;
window.closeWinningModal = closeWinningModal;
window.goBack = goBack;

// Глобальные функции для отладки
window.gameState = gameState;
window.resetGame = function() {
  if (confirm('Сбросить все данные игры?')) {
    localStorage.removeItem('rouletteGameState');
    location.reload();
  }
};
