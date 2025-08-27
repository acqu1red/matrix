/* ====== BUSINESS QUEST UI INTERACTIONS ====== */

// UI состояния и анимации
let uiState = {
  isDragging: false,
  dragElement: null,
  hoverElement: null,
  animations: []
};

// Инициализация UI после загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
  initializeUI();
  setupUIAnimations();
});

// Инициализация UI
function initializeUI() {
  console.log('🎨 Инициализация UI квеста "Твой первый бизнес"');
  
  // Добавляем CSS классы для анимаций
  document.body.classList.add('quest-ui-loaded');
  
  // Настраиваем hover эффекты
  setupHoverEffects();
  
  // Настраиваем анимации появления
  setupAppearanceAnimations();
  
  // Настраиваем интерактивные элементы
  setupInteractiveElements();
}

// Настройка hover эффектов
function setupHoverEffects() {
  // Карточки ниш
  const nicheCards = document.querySelectorAll('.niche-card');
  nicheCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-8px) scale(1.02)';
      card.style.boxShadow = '0 16px 80px rgba(209, 138, 57, 0.4)';
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0) scale(1)';
      card.style.boxShadow = '0 8px 25px rgba(209, 138, 57, 0.2)';
    });
  });

  // Карточки кандидатов
  const candidateCards = document.querySelectorAll('.candidate-card');
  candidateCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-3px) scale(1.05)';
      card.style.boxShadow = '0 8px 40px rgba(209, 138, 57, 0.3)';
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0) scale(1)';
      card.style.boxShadow = '0 4px 20px rgba(209, 138, 57, 0.2)';
    });
  });

  // Кнопки
  const buttons = document.querySelectorAll('.btn');
  buttons.forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      btn.style.transform = 'translateY(-3px) scale(1.02)';
      btn.style.boxShadow = '0 8px 40px rgba(209, 138, 57, 0.3)';
    });
    
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translateY(0) scale(1)';
      btn.style.boxShadow = '0 4px 20px rgba(209, 138, 57, 0.2)';
    });
  });
}

// Настройка анимаций появления
function setupAppearanceAnimations() {
  // Анимация появления карточек ниш
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Наблюдаем за карточками ниш
  const nicheCards = document.querySelectorAll('.niche-card');
  nicheCards.forEach(card => observer.observe(card));

  // Наблюдаем за карточками кандидатов
  const candidateCards = document.querySelectorAll('.candidate-card');
  candidateCards.forEach(card => observer.observe(card));
}

// Настройка интерактивных элементов
function setupInteractiveElements() {
  // Анимация нажатия на кнопки
  const buttons = document.querySelectorAll('.btn');
  buttons.forEach(btn => {
    btn.addEventListener('mousedown', () => {
      btn.style.transform = 'translateY(-1px) scale(0.98)';
    });
    
    btn.addEventListener('mouseup', () => {
      btn.style.transform = 'translateY(-3px) scale(1.02)';
    });
    
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translateY(0) scale(1)';
    });
  });

  // Анимация выбора ниши
  setupNicheSelectionAnimations();
  
  // Анимация формирования команды
  setupTeamBuildingAnimations();
  
  // Анимация принятия решений
  setupDecisionAnimations();
}

// Анимации выбора ниши
function setupNicheSelectionAnimations() {
  const nichesGrid = document.querySelector('.niches-grid');
  if (!nichesGrid) return;

  // Добавляем анимацию появления карточек
  const nicheCards = nichesGrid.querySelectorAll('.niche-card');
  nicheCards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    
    setTimeout(() => {
      card.style.transition = 'all 0.6s ease';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, index * 100);
  });
}

// Анимации формирования команды
function setupTeamBuildingAnimations() {
  // Анимация появления кандидатов
  const candidatesGrid = document.getElementById('candidatesGrid');
  if (candidatesGrid) {
    const candidateCards = candidatesGrid.querySelectorAll('.candidate-card');
    candidateCards.forEach((card, index) => {
      card.style.opacity = '0';
      card.style.transform = 'scale(0.8) rotate(5deg)';
      
      setTimeout(() => {
        card.style.transition = 'all 0.5s ease';
        card.style.opacity = '1';
        card.style.transform = 'scale(1) rotate(0deg)';
      }, index * 50);
    });
  }

  // Анимация placeholder команды
  const teamGrid = document.getElementById('teamGrid');
  if (teamGrid) {
    const placeholder = teamGrid.querySelector('.team-placeholder');
    if (placeholder) {
      placeholder.style.opacity = '0';
      placeholder.style.transform = 'scale(0.9)';
      
      setTimeout(() => {
        placeholder.style.transition = 'all 0.8s ease';
        placeholder.style.opacity = '1';
        placeholder.style.transform = 'scale(1)';
      }, 300);
    }
  }
}

// Анимации принятия решений
function setupDecisionAnimations() {
  const decisionCards = document.querySelector('.decision-cards');
  if (!decisionCards) return;

  const cards = decisionCards.querySelectorAll('.decision-card');
  cards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateX(50px)';
    
    setTimeout(() => {
      card.style.transition = 'all 0.6s ease';
      card.style.opacity = '1';
      card.style.transform = 'translateX(0)';
    }, index * 150);
  });
}

// Анимации масштабирования
function setupScalingAnimations() {
  const scalingGrid = document.querySelector('.scaling-grid');
  if (!scalingGrid) return;

  const scalingCards = scalingGrid.querySelectorAll('.scaling-card');
  scalingCards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(40px) rotate(2deg)';
    
    setTimeout(() => {
      card.style.transition = 'all 0.7s ease';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0) rotate(0deg)';
    }, index * 100);
  });
}

// Анимация перехода между этапами
function animateStageTransition(fromStage, toStage) {
  console.log(`🎬 Анимация перехода с этапа ${fromStage} на этап ${toStage}`);
  
  // Скрываем текущий этап с анимацией
  const currentStage = document.getElementById(`stage${fromStage}`);
  if (currentStage) {
    currentStage.style.transition = 'all 0.5s ease';
    currentStage.style.opacity = '0';
    currentStage.style.transform = 'translateX(-50px)';
    
    setTimeout(() => {
      currentStage.style.display = 'none';
      
      // Показываем новый этап с анимацией
      const nextStage = document.getElementById(`stage${toStage}`);
      if (nextStage) {
        nextStage.style.display = 'block';
        nextStage.style.opacity = '0';
        nextStage.style.transform = 'translateX(50px)';
        
        setTimeout(() => {
          nextStage.style.transition = 'all 0.5s ease';
          nextStage.style.opacity = '1';
          nextStage.style.transform = 'translateX(0)';
        }, 50);
      }
    }, 500);
  }
}

// Анимация выбора ниши
function animateNicheSelection(nicheId) {
  const selectedCard = document.querySelector(`[data-niche-id="${nicheId}"]`);
  if (!selectedCard) return;

  // Добавляем эффект выбора
  selectedCard.style.transition = 'all 0.3s ease';
  selectedCard.style.transform = 'scale(1.05)';
  selectedCard.style.boxShadow = '0 20px 60px rgba(209, 138, 57, 0.5)';
  
  // Добавляем пульсацию
  selectedCard.style.animation = 'nicheSelectionPulse 2s ease-in-out infinite';
  
  // Убираем анимацию через 2 секунды
  setTimeout(() => {
    selectedCard.style.animation = 'none';
    selectedCard.style.transform = 'scale(1)';
    selectedCard.style.boxShadow = '0 8px 25px rgba(209, 138, 57, 0.2)';
  }, 2000);
}

// Анимация добавления члена команды
function animateTeamMemberAddition(memberElement) {
  if (!memberElement) return;

  // Начальное состояние
  memberElement.style.opacity = '0';
  memberElement.style.transform = 'scale(0.5) translateY(20px)';
  
  // Анимация появления
  setTimeout(() => {
    memberElement.style.transition = 'all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
    memberElement.style.opacity = '1';
    memberElement.style.transform = 'scale(1) translateY(0)';
  }, 50);
  
  // Добавляем bounce эффект
  setTimeout(() => {
    memberElement.style.transform = 'scale(1.1)';
    setTimeout(() => {
      memberElement.style.transform = 'scale(1)';
    }, 150);
  }, 650);
}

// Анимация удаления члена команды
function animateTeamMemberRemoval(memberElement) {
  if (!memberElement) return;

  memberElement.style.transition = 'all 0.4s ease';
  memberElement.style.opacity = '0';
  memberElement.style.transform = 'scale(0.8) translateX(-50px)';
  
  setTimeout(() => {
    if (memberElement.parentNode) {
      memberElement.parentNode.removeChild(memberElement);
    }
  }, 400);
}

// Анимация выбора опции решения
function animateDecisionOptionSelection(optionElement) {
  if (!optionElement) return;

  // Эффект выбора
  optionElement.style.transition = 'all 0.3s ease';
  optionElement.style.transform = 'scale(1.05)';
  optionElement.style.boxShadow = '0 8px 25px rgba(209, 138, 57, 0.3)';
  
  // Возвращаем к нормальному состоянию
  setTimeout(() => {
    optionElement.style.transform = 'scale(1)';
    optionElement.style.boxShadow = '0 4px 20px rgba(209, 138, 57, 0.2)';
  }, 300);
}

// Анимация выбора масштабирования
function animateScalingSelection(scalingId) {
  const selectedCard = document.querySelector(`[data-scaling-id="${scalingId}"]`);
  if (!selectedCard) return;

  // Эффект выбора
  selectedCard.style.transition = 'all 0.4s ease';
  selectedCard.style.transform = 'scale(1.03) translateY(-5px)';
  selectedCard.style.boxShadow = '0 16px 60px rgba(209, 138, 57, 0.4)';
  
  // Добавляем glow эффект
  selectedCard.style.borderColor = '#D18A39';
  selectedCard.style.boxShadow = '0 0 30px rgba(209, 138, 57, 0.6), 0 16px 60px rgba(209, 138, 57, 0.4)';
}

// Анимация завершения квеста
function animateQuestCompletion() {
  console.log('🎉 Анимация завершения квеста');
  
  // Анимация появления результатов
  const resultsSection = document.getElementById('questResults');
  if (resultsSection) {
    resultsSection.style.opacity = '0';
    resultsSection.style.transform = 'scale(0.8)';
    
    setTimeout(() => {
      resultsSection.style.transition = 'all 1s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
      resultsSection.style.opacity = '1';
      resultsSection.style.transform = 'scale(1)';
    }, 100);
  }

  // Анимация статистики результатов
  const resultStats = document.querySelectorAll('.result-stat');
  resultStats.forEach((stat, index) => {
    stat.style.opacity = '0';
    stat.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
      stat.style.transition = 'all 0.6s ease';
      stat.style.opacity = '1';
      stat.style.transform = 'translateY(0)';
    }, 500 + index * 200);
  });
}

// Анимация статуса бизнеса
function animateBusinessStatusUpdate() {
  const statusItems = document.querySelectorAll('.status-item');
  statusItems.forEach((item, index) => {
    item.style.transition = 'all 0.3s ease';
    item.style.transform = 'scale(1.05)';
    
    setTimeout(() => {
      item.style.transform = 'scale(1)';
    }, 150);
  });
}

// Анимация прогресса
function animateProgress(progressElement, targetValue, duration = 1000) {
  if (!progressElement) return;

  const startValue = 0;
  const startTime = performance.now();
  
  function updateProgress(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    const currentValue = startValue + (targetValue - startValue) * progress;
    progressElement.textContent = Math.round(currentValue);
    
    if (progress < 1) {
      requestAnimationFrame(updateProgress);
    }
  }
  
  requestAnimationFrame(updateProgress);
}

// Анимация счетчика
function animateCounter(counterElement, targetValue, duration = 1000) {
  if (!counterElement) return;

  const startValue = 0;
  const startTime = performance.now();
  
  function updateCounter(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    const currentValue = startValue + (targetValue - startValue) * progress;
    counterElement.textContent = Math.round(currentValue).toLocaleString();
    
    if (progress < 1) {
      requestAnimationFrame(updateCounter);
    }
  }
  
  requestAnimationFrame(updateCounter);
}

// Анимация появления элементов
function animateElementAppearance(element, delay = 0) {
  if (!element) return;

  element.style.opacity = '0';
  element.style.transform = 'translateY(20px)';
  
  setTimeout(() => {
    element.style.transition = 'all 0.6s ease';
    element.style.opacity = '1';
    element.style.transform = 'translateY(0)';
  }, delay);
}

// Анимация исчезновения элементов
function animateElementDisappearance(element, callback) {
  if (!element) return;

  element.style.transition = 'all 0.4s ease';
  element.style.opacity = '0';
  element.style.transform = 'translateY(-20px)';
  
  setTimeout(() => {
    if (callback) callback();
  }, 400);
}

// Анимация shake для ошибок
function animateShake(element) {
  if (!element) return;

  element.style.animation = 'shake 0.5s ease-in-out';
  
  setTimeout(() => {
    element.style.animation = 'none';
  }, 500);
}

// Анимация pulse для успеха
function animatePulse(element) {
  if (!element) return;

  element.style.animation = 'pulse 0.6s ease-in-out';
  
  setTimeout(() => {
    element.style.animation = 'none';
  }, 600);
}

// Анимация bounce для интерактивных элементов
function animateBounce(element) {
  if (!element) return;

  element.style.animation = 'bounce 0.6s ease-in-out';
  
  setTimeout(() => {
    element.style.animation = 'none';
  }, 600);
}

// Добавление CSS анимаций
function addCSSAnimations() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes nicheSelectionPulse {
      0%, 100% { 
        transform: scale(1.05); 
        box-shadow: 0 20px 60px rgba(209, 138, 57, 0.5);
      }
      50% { 
        transform: scale(1.08); 
        box-shadow: 0 25px 70px rgba(209, 138, 57, 0.7);
      }
    }
    
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-5px); }
      75% { transform: translateX(5px); }
    }
    
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
    
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    
    .fade-in {
      animation: fadeIn 0.6s ease-out;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .slide-in-right {
      animation: slideInFromRight 0.6s ease-out;
    }
    
    @keyframes slideInFromRight {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    
    .scale-in {
      animation: scaleIn 0.6s ease-out;
    }
    
    @keyframes scaleIn {
      from { transform: scale(0.8); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
  `;
  
  document.head.appendChild(style);
}

// Инициализация CSS анимаций
addCSSAnimations();

// Экспорт функций для использования в других модулях
window.BusinessQuestUI = {
  animateStageTransition,
  animateNicheSelection,
  animateTeamMemberAddition,
  animateTeamMemberRemoval,
  animateDecisionOptionSelection,
  animateScalingSelection,
  animateQuestCompletion,
  animateBusinessStatusUpdate,
  animateProgress,
  animateCounter,
  animateElementAppearance,
  animateElementDisappearance,
  animateShake,
  animatePulse,
  animateBounce
};
