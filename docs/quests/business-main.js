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
    background: rgba(244, 67, 54, 0.9);
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
      color: #f44336;
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
    stage: gameState.currentStage,
    progress: gameState.progress,
    completed: gameState.isCompleted
  };
}

function completeQuest() {
  if (!businessEngine) return false;
  
  try {
    businessEngine.completeQuest();
    return true;
  } catch (error) {
    console.error('Ошибка завершения квеста:', error);
    return false;
  }
}

// Экспорт функций для внешнего использования
window.BusinessQuest = {
  getProgress: getQuestProgress,
  complete: completeQuest,
  getEngine: () => businessEngine,
  getUI: () => businessUI
};

// Обработчик кнопки "Назад"
document.addEventListener('DOMContentLoaded', function() {
  const btnBack = document.getElementById('btnBack');
  if (btnBack) {
    btnBack.addEventListener('click', function() {
      // Возвращаемся к главной странице квестов
      if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.close();
      } else {
        window.history.back();
      }
    });
  }
});

// Обработчик кнопки "Начать квест"
document.addEventListener('DOMContentLoaded', function() {
  const startQuestBtn = document.getElementById('startQuest');
  if (startQuestBtn) {
    startQuestBtn.addEventListener('click', function() {
      if (businessUI) {
        businessUI.startQuest();
      }
    });
  }
});

// Обработчик кнопки "Пропустить команду"
document.addEventListener('DOMContentLoaded', function() {
  const skipTeamBtn = document.getElementById('skipTeam');
  if (skipTeamBtn) {
    skipTeamBtn.addEventListener('click', function() {
      if (businessEngine) {
        businessEngine.skipTeamSelection();
        if (businessUI) {
          businessUI.showToast('Подбор команды пропущен!', 'info');
          businessUI.nextStage();
        }
      }
    });
  }
});

// Обработчик выбора ниши
document.addEventListener('DOMContentLoaded', function() {
  const nicheCards = document.querySelectorAll('.niche-card');
  const selectNicheBtn = document.getElementById('selectNiche');
  
  nicheCards.forEach(card => {
    card.addEventListener('click', function() {
      // Убираем выделение со всех карточек
      nicheCards.forEach(c => c.classList.remove('selected'));
      
      // Выделяем выбранную карточку
      this.classList.add('selected');
      
      // Активируем кнопку выбора
      if (selectNicheBtn) {
        selectNicheBtn.disabled = false;
      }
      
      // Сохраняем выбранную нишу
      const nicheId = this.dataset.niche;
      if (businessEngine) {
        businessEngine.selectNiche(nicheId);
      }
    });
  });
  
  // Обработчик кнопки выбора ниши
  if (selectNicheBtn) {
    selectNicheBtn.addEventListener('click', function() {
      if (businessEngine) {
        const selectedNiche = businessEngine.getSelectedNiche();
        if (selectedNiche) {
          if (businessUI) {
            businessUI.showToast(`Выбрана ниша: ${selectedNiche.name}`, 'success');
            businessUI.nextStage();
          }
        }
      }
    });
  }
});

// Обработчик завершения подбора команды
document.addEventListener('DOMContentLoaded', function() {
  const completeTeamBtn = document.getElementById('completeTeam');
  if (completeTeamBtn) {
    completeTeamBtn.addEventListener('click', function() {
      if (businessEngine) {
        const teamComplete = businessEngine.isTeamComplete();
        if (teamComplete) {
          if (businessUI) {
            businessUI.showToast('Команда собрана!', 'success');
            businessUI.nextStage();
          }
        } else {
          if (businessUI) {
            businessUI.showToast('Не все позиции заполнены!', 'error');
          }
        }
      }
    });
  }
});

// Обработчик следующего квартала
document.addEventListener('DOMContentLoaded', function() {
  const nextQuarterBtn = document.getElementById('nextQuarter');
  if (nextQuarterBtn) {
    nextQuarterBtn.addEventListener('click', function() {
      if (businessEngine) {
        businessEngine.nextQuarter();
        if (businessUI) {
          businessUI.updateBusinessStats();
          businessUI.showToast('Переход к следующему кварталу!', 'info');
        }
      }
    });
  }
});

// Обработчик завершения квеста
document.addEventListener('DOMContentLoaded', function() {
  const finishQuestBtn = document.getElementById('finishQuest');
  if (finishQuestBtn) {
    finishQuestBtn.addEventListener('click', function() {
      if (businessEngine) {
        const results = businessEngine.getFinalResults();
        if (businessUI) {
          businessUI.showFinalResults(results);
          businessUI.showToast('Квест завершен!', 'success');
        }
      }
    });
  }
});

// Инициализация Telegram WebApp
document.addEventListener('DOMContentLoaded', function() {
  if (window.Telegram && window.Telegram.WebApp) {
    try {
      // Инициализируем Telegram WebApp
      window.Telegram.WebApp.ready();
      
      // Расширяем на весь экран
      window.Telegram.WebApp.expand();
      
      // Устанавливаем основной цвет
      window.Telegram.WebApp.setHeaderColor('#1C252C');
      
      // Устанавливаем цвет фона
      window.Telegram.WebApp.setBackgroundColor('#1C252C');
      
      console.log('✅ Telegram WebApp инициализирован');
      
    } catch (error) {
      console.error('❌ Ошибка инициализации Telegram WebApp:', error);
    }
  }
});

// Оптимизация для мобильных устройств
document.addEventListener('DOMContentLoaded', function() {
  // Отключаем масштабирование на мобильных
  const viewport = document.querySelector('meta[name="viewport"]');
  if (viewport) {
    viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover');
  }
  
  // Оптимизация касаний
  document.addEventListener('touchstart', function() {}, {passive: true});
  document.addEventListener('touchmove', function() {}, {passive: true});
  
  // Предотвращение двойного касания
  let lastTouchEnd = 0;
  document.addEventListener('touchend', function(event) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
      event.preventDefault();
    }
    lastTouchEnd = now;
  }, false);
});

// Обработчик изменения размера экрана
window.addEventListener('resize', function() {
  if (businessUI) {
    businessUI.handleResize();
  }
});

// Обработчик изменения ориентации
window.addEventListener('orientationchange', function() {
  setTimeout(() => {
    if (businessUI) {
      businessUI.handleResize();
    }
  }, 100);
});

// Обработчик видимости страницы
document.addEventListener('visibilitychange', function() {
  if (document.hidden) {
    // Страница скрыта - сохраняем прогресс
    if (businessEngine) {
      businessEngine.saveProgress();
    }
  } else {
    // Страница видна - восстанавливаем состояние
    if (businessUI) {
      businessUI.refreshUI();
    }
  }
});

// Обработчик онлайн/офлайн статуса
window.addEventListener('online', function() {
  if (businessUI) {
    businessUI.showToast('Соединение восстановлено!', 'success');
  }
});

window.addEventListener('offline', function() {
  if (businessUI) {
    businessUI.showToast('Соединение потеряно!', 'error');
  }
});

// Обработчик ошибок загрузки ресурсов
window.addEventListener('error', function(event) {
  if (event.target.tagName === 'IMG' || event.target.tagName === 'VIDEO') {
    console.warn('Ошибка загрузки медиа:', event.target.src);
    // Заменяем на заглушку
    if (event.target.tagName === 'IMG') {
      event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjNTg1NDVCIi8+Cjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPj8/PC90ZXh0Pgo8L3N2Zz4K';
    }
  }
}, true);

// Обработчик завершения загрузки страницы
window.addEventListener('load', function() {
  console.log('🚀 Страница полностью загружена');
  
  // Скрываем индикатор загрузки если есть
  const loader = document.querySelector('.loader');
  if (loader) {
    loader.style.display = 'none';
  }
  
  // Показываем основной контент
  const app = document.getElementById('app');
  if (app) {
    app.style.opacity = '1';
  }
  
  // Инициализируем анимации
  if (businessUI) {
    businessUI.initializeAnimations();
  }
});

// Обработчик прокрутки для оптимизации
let scrollTimeout;
window.addEventListener('scroll', function() {
  if (scrollTimeout) {
    clearTimeout(scrollTimeout);
  }
  
  scrollTimeout = setTimeout(() => {
    if (businessUI) {
      businessUI.handleScroll();
    }
  }, 100);
}, {passive: true});

// Обработчик касаний для оптимизации
let touchTimeout;
document.addEventListener('touchstart', function() {
  if (touchTimeout) {
    clearTimeout(touchTimeout);
  }
  
  touchTimeout = setTimeout(() => {
    if (businessUI) {
      businessUI.handleTouch();
    }
  }, 100);
}, {passive: true});

// Экспорт для отладки
window.debugBusinessQuest = {
  engine: () => businessEngine,
  ui: () => businessUI,
  state: () => businessEngine ? businessEngine.getGameState() : null,
  reset: () => {
    if (businessEngine) {
      businessEngine.reset();
    }
    if (businessUI) {
      businessUI.refreshUI();
    }
  }
};
