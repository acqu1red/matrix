/* ===== BUSINESS QUEST UI ===== */

// Класс для управления пользовательским интерфейсом
class BusinessQuestUI {
  constructor() {
    this.currentView = 'intro';
    this.animations = new Map();
    this.modals = new Map();
    
    this.initialize();
  }
  
  // Инициализация UI
  initialize() {
    this.setupAnimations();
    this.setupModals();
    this.setupResponsive();
    this.setupAccessibility();
    
    console.log('Business Quest UI initialized');
  }
  
  // Настройка анимаций
  setupAnimations() {
    // Анимация появления карточек
    this.animations.set('cardAppear', {
      keyframes: [
        { opacity: 0, transform: 'translateY(30px) scale(0.9)' },
        { opacity: 1, transform: 'translateY(0) scale(1)' }
      ],
      options: {
        duration: 600,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        fill: 'forwards'
      }
    });
    
    // Анимация успеха
    this.animations.set('success', {
      keyframes: [
        { transform: 'scale(1)' },
        { transform: 'scale(1.1)' },
        { transform: 'scale(1)' }
      ],
      options: {
        duration: 500,
        easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
      }
    });
    
    // Анимация ошибки
    this.animations.set('error', {
      keyframes: [
        { transform: 'translateX(0)' },
        { transform: 'translateX(-10px)' },
        { transform: 'translateX(10px)' },
        { transform: 'translateX(0)' }
      ],
      options: {
        duration: 400,
        easing: 'ease-in-out'
      }
    });
    
    // Анимация загрузки
    this.animations.set('loading', {
      keyframes: [
        { transform: 'rotate(0deg)' },
        { transform: 'rotate(360deg)' }
      ],
      options: {
        duration: 1000,
        iterations: Infinity,
        easing: 'linear'
      }
    });
  }
  
  // Настройка модалов
  setupModals() {
    // Модал информации о кандидате
    this.modals.set('candidateInfo', {
      template: (candidate) => `
        <div class="modal show">
          <div class="modalContent glass candidate-modal">
            <div class="modal-header">
              <h3>${candidate.avatar} ${candidate.name}</h3>
              <button class="close-btn" onclick="this.closest('.modal').remove()">×</button>
            </div>
            
            <div class="candidate-details">
              <div class="detail-section">
                <h4>📊 Основная информация</h4>
                <div class="info-grid">
                  <div class="info-item">
                    <span class="info-label">Возраст:</span>
                    <span class="info-value">${candidate.age} лет</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Опыт:</span>
                    <span class="info-value">${candidate.experience}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Зарплата:</span>
                    <span class="info-value salary">${candidate.salary.toLocaleString()} ₽</span>
                  </div>
                </div>
              </div>
              
              <div class="detail-section">
                <h4>🎯 Навыки</h4>
                <div class="skills-list">
                  ${candidate.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                </div>
              </div>
              
              <div class="detail-section">
                <h4>✅ Сильные стороны</h4>
                <ul class="strengths-list">
                  ${candidate.strengths.map(strength => `<li>${strength}</li>`).join('')}
                </ul>
              </div>
              
              <div class="detail-section">
                <h4>⚠️ Области для развития</h4>
                <ul class="weaknesses-list">
                  ${candidate.weaknesses.map(weakness => `<li>${weakness}</li>`).join('')}
                </ul>
              </div>
              
              <div class="detail-section">
                <h4>🎭 Личность</h4>
                <p class="personality">${candidate.personality}</p>
              </div>
              
              <div class="detail-section">
                <h4>💡 Мотивация</h4>
                <p class="motivation">${candidate.motivation}</p>
              </div>
              
              <div class="detail-section">
                <h4>🔗 Совместимость с позициями</h4>
                <div class="compatibility-grid">
                  ${Object.entries(candidate.compatibility).map(([pos, comp]) => `
                    <div class="compatibility-item">
                      <span class="position-name">${this.getPositionTitle(pos)}</span>
                      <div class="compatibility-bar">
                        <div class="compatibility-fill" style="width: ${comp}%"></div>
                      </div>
                      <span class="compatibility-score ${this.getCompatibilityClass(comp)}">${comp}%</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
            
            <div class="modal-actions">
              <button class="btn primary" onclick="this.closest('.modal').remove()">Понятно</button>
            </div>
          </div>
        </div>
      `
    });
    
    // Модал информации о нише
    this.modals.set('nicheInfo', {
      template: (niche) => `
        <div class="modal show">
          <div class="modalContent glass niche-modal">
            <div class="modal-header">
              <h3>${niche.icon} ${niche.name}</h3>
              <button class="close-btn" onclick="this.closest('.modal').remove()">×</button>
            </div>
            
            <div class="niche-details">
              <div class="detail-section">
                <h4>📝 Описание</h4>
                <p class="description">${niche.description}</p>
              </div>
              
              <div class="detail-section">
                <h4>📊 Характеристики</h4>
                <div class="characteristics-grid">
                  <div class="characteristic-item">
                    <span class="characteristic-label">Риск:</span>
                    <span class="characteristic-value risk-${niche.risk.toLowerCase()}">${niche.risk}</span>
                  </div>
                  <div class="characteristic-item">
                    <span class="characteristic-label">Потенциал:</span>
                    <span class="characteristic-value potential-${niche.potential.toLowerCase()}">${niche.potential}</span>
                  </div>
                  <div class="characteristic-item">
                    <span class="characteristic-label">Стартовые затраты:</span>
                    <span class="characteristic-value">${niche.startupCost.toLocaleString()} ₽</span>
                  </div>
                  <div class="characteristic-item">
                    <span class="characteristic-label">Темп роста:</span>
                    <span class="characteristic-value">${niche.growthRate}%</span>
                  </div>
                  <div class="characteristic-item">
                    <span class="characteristic-label">Спрос на рынке:</span>
                    <span class="characteristic-value">${niche.marketDemand}</span>
                  </div>
                  <div class="characteristic-item">
                    <span class="characteristic-label">Конкуренция:</span>
                    <span class="characteristic-value">${niche.competition}</span>
                  </div>
                </div>
              </div>
              
              <div class="detail-section">
                <h4>✅ Преимущества</h4>
                <ul class="advantages-list">
                  ${niche.advantages.map(advantage => `<li>${advantage}</li>`).join('')}
                </ul>
              </div>
              
              <div class="detail-section">
                <h4>⚠️ Вызовы</h4>
                <ul class="challenges-list">
                  ${niche.challenges.map(challenge => `<li>${challenge}</li>`).join('')}
                </ul>
              </div>
            </div>
            
            <div class="modal-actions">
              <button class="btn primary" onclick="this.closest('.modal').remove()">Понятно</button>
            </div>
          </div>
        </div>
      `
    });
    
    // Модал информации о позиции
    this.modals.set('positionInfo', {
      template: (position) => `
        <div class="modal show">
          <div class="modalContent glass position-modal">
            <div class="modal-header">
              <h3>${position.title}</h3>
              <button class="close-btn" onclick="this.closest('.modal').remove()">×</button>
            </div>
            
            <div class="position-details">
              <div class="detail-section">
                <h4>📝 Описание</h4>
                <p class="description">${position.description}</p>
              </div>
              
              <div class="detail-section">
                <h4>🎯 Требования</h4>
                <div class="requirements-list">
                  ${position.requirements.map(req => `<span class="requirement-tag">${req}</span>`).join('')}
                </div>
              </div>
              
              <div class="detail-section">
                <h4>📋 Обязанности</h4>
                <ul class="responsibilities-list">
                  ${position.responsibilities.map(resp => `<li>${resp}</li>`).join('')}
                </ul>
              </div>
              
              <div class="detail-section">
                <h4>💰 Зарплата</h4>
                <p class="salary">${position.salary.toLocaleString()} ₽</p>
              </div>
              
              <div class="detail-section">
                <h4>⭐ Важность</h4>
                <p class="importance">${position.importance}</p>
              </div>
              
              <div class="detail-section">
                <h4>📈 Влияние на бизнес</h4>
                <div class="impact-grid">
                  <div class="impact-item">
                    <span class="impact-label">Доход:</span>
                    <div class="impact-bar">
                      <div class="impact-fill" style="width: ${position.impact.revenue}%"></div>
                    </div>
                    <span class="impact-value">${position.impact.revenue}%</span>
                  </div>
                  <div class="impact-item">
                    <span class="impact-label">Рост:</span>
                    <div class="impact-bar">
                      <div class="impact-fill" style="width: ${position.impact.growth}%"></div>
                    </div>
                    <span class="impact-value">${position.impact.growth}%</span>
                  </div>
                  <div class="impact-item">
                    <span class="impact-label">Репутация:</span>
                    <div class="impact-bar">
                      <div class="impact-fill" style="width: ${position.impact.reputation}%"></div>
                    </div>
                    <span class="impact-value">${position.impact.reputation}%</span>
                  </div>
                  <div class="impact-item">
                    <span class="impact-label">Эффективность команды:</span>
                    <div class="impact-bar">
                      <div class="impact-fill" style="width: ${position.impact.teamEfficiency}%"></div>
                    </div>
                    <span class="impact-value">${position.impact.teamEfficiency}%</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="modal-actions">
              <button class="btn primary" onclick="this.closest('.modal').remove()">Понятно</button>
            </div>
          </div>
        </div>
      `
    });
  }
  
  // Настройка адаптивности
  setupResponsive() {
    // Обработчик изменения размера окна
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.handleResize();
      }, 250);
    });
    
    // Обработчик изменения ориентации
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.handleResize();
      }, 100);
    });
  }
  
  // Настройка доступности
  setupAccessibility() {
    // Поддержка клавиатуры
    document.addEventListener('keydown', (e) => {
      this.handleKeyboardNavigation(e);
    });
    
    // Поддержка скринридеров
    this.setupScreenReaderSupport();
    
    // Поддержка высокого контраста
    this.setupHighContrast();
  }
  
  // Обработка изменения размера окна
  handleResize() {
    const isMobile = window.innerWidth <= 768;
    const isTablet = window.innerWidth <= 1024 && window.innerWidth > 768;
    
    // Обновляем классы для адаптивности
    document.body.classList.toggle('mobile', isMobile);
    document.body.classList.toggle('tablet', isTablet);
    
    // Пересчитываем размеры элементов
    this.recalculateLayout();
    
    // Обновляем позиции элементов
    this.updateElementPositions();
  }
  
  // Пересчет макета
  recalculateLayout() {
    // Обновляем размеры сеток
    this.updateGridLayouts();
    
    // Обновляем размеры модалов
    this.updateModalSizes();
    
    // Обновляем размеры карточек
    this.updateCardSizes();
  }
  
  // Обновление макетов сеток
  updateGridLayouts() {
    const isMobile = window.innerWidth <= 768;
    
    // Сетка ниш
    const nicheGrid = document.querySelector('.niche-grid');
    if (nicheGrid) {
      nicheGrid.style.gridTemplateColumns = isMobile ? '1fr' : 'repeat(2, 1fr)';
    }
    
    // Сетка команды
    const teamContainer = document.querySelector('.team-selection-container');
    if (teamContainer) {
      teamContainer.style.gridTemplateColumns = isMobile ? '1fr' : '1fr 1fr';
    }
    
    // Сетка кандидатов
    const candidatesGrid = document.querySelector('.candidates-grid');
    if (candidatesGrid) {
      candidatesGrid.style.gridTemplateColumns = isMobile ? '1fr' : 'repeat(2, 1fr)';
    }
    
    // Сетка позиций
    const positionsGrid = document.querySelector('.positions-grid');
    if (positionsGrid) {
      positionsGrid.style.gridTemplateColumns = isMobile ? '1fr' : 'repeat(2, 1fr)';
    }
    
    // Сетка статистики
    const businessStats = document.querySelector('.business-stats');
    if (businessStats) {
      businessStats.style.gridTemplateColumns = isMobile ? '1fr' : 'repeat(2, 1fr)';
    }
    
    // Сетка решений
    const decisionsGrid = document.querySelector('.decisions-grid');
    if (decisionsGrid) {
      decisionsGrid.style.gridTemplateColumns = isMobile ? '1fr' : 'repeat(2, 1fr)';
    }
  }
  
  // Обновление размеров модалов
  updateModalSizes() {
    const modals = document.querySelectorAll('.modalContent');
    modals.forEach(modal => {
      if (window.innerWidth <= 768) {
        modal.style.maxWidth = '95%';
        modal.style.maxHeight = '90%';
        modal.style.padding = '20px';
      } else {
        modal.style.maxWidth = '90%';
        modal.style.maxHeight = '90%';
        modal.style.padding = '48px';
      }
    });
  }
  
  // Обновление размеров карточек
  updateCardSizes() {
    const isMobile = window.innerWidth <= 768;
    const isTablet = window.innerWidth <= 1024 && window.innerWidth > 768;
    
    // Карточки ниш
    const nicheCards = document.querySelectorAll('.niche-card');
    nicheCards.forEach(card => {
      if (isMobile) {
        card.style.padding = '16px';
        card.style.fontSize = '14px';
      } else if (isTablet) {
        card.style.padding = '20px';
        card.style.fontSize = '16px';
      } else {
        card.style.padding = '24px';
        card.style.fontSize = '18px';
      }
    });
    
    // Карточки кандидатов
    const candidateCards = document.querySelectorAll('.candidate-card');
    candidateCards.forEach(card => {
      if (isMobile) {
        card.style.padding = '12px';
      } else {
        card.style.padding = '16px';
      }
    });
    
    // Слоты позиций
    const positionSlots = document.querySelectorAll('.position-slot');
    positionSlots.forEach(slot => {
      if (isMobile) {
        slot.style.padding = '12px';
        slot.style.minHeight = '100px';
      } else {
        slot.style.padding = '16px';
        slot.style.minHeight = '120px';
      }
    });
  }
  
  // Обновление позиций элементов
  updateElementPositions() {
    // Обновляем позицию прогресс-бара
    const progressBar = document.querySelector('.quest-progress');
    if (progressBar) {
      if (window.innerWidth <= 768) {
        progressBar.style.bottom = '10px';
        progressBar.style.padding = '8px 16px';
      } else {
        progressBar.style.bottom = '20px';
        progressBar.style.padding = '16px 24px';
      }
    }
    
    // Обновляем позицию toast
    const toast = document.getElementById('toast');
    if (toast) {
      if (window.innerWidth <= 768) {
        toast.style.bottom = '80px';
      } else {
        toast.style.bottom = '100px';
      }
    }
  }
  
  // Обработка навигации с клавиатуры
  handleKeyboardNavigation(e) {
    switch (e.key) {
      case 'Escape':
        this.closeAllModals();
        break;
      case 'Enter':
        this.handleEnterKey(e);
        break;
      case 'Tab':
        this.handleTabKey(e);
        break;
      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
        this.handleArrowKeys(e);
        break;
    }
  }
  
  // Закрытие всех модалов
  closeAllModals() {
    const modals = document.querySelectorAll('.modal.show');
    modals.forEach(modal => modal.remove());
  }
  
  // Обработка клавиши Enter
  handleEnterKey(e) {
    const target = e.target;
    
    if (target.classList.contains('niche-card')) {
      target.click();
    } else if (target.classList.contains('candidate-card')) {
      target.click();
    } else if (target.classList.contains('decision-card')) {
      target.click();
    } else if (target.classList.contains('btn')) {
      target.click();
    }
  }
  
  // Обработка клавиши Tab
  handleTabKey(e) {
    // Ограничиваем навигацию внутри модала
    if (e.target.closest('.modal')) {
      const focusableElements = e.target.closest('.modal').querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      
      if (e.shiftKey && e.target === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && e.target === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }
  
  // Обработка стрелочных клавиш
  handleArrowKeys(e) {
    const target = e.target;
    
    if (target.classList.contains('niche-card')) {
      this.navigateCards(e.key, '.niche-card');
    } else if (target.classList.contains('candidate-card')) {
      this.navigateCards(e.key, '.candidate-card');
    } else if (target.classList.contains('decision-card')) {
      this.navigateCards(e.key, '.decision-card');
    }
  }
  
  // Навигация по карточкам
  navigateCards(direction, selector) {
    const cards = Array.from(document.querySelectorAll(selector));
    const currentIndex = cards.findIndex(card => card === document.activeElement);
    
    let nextIndex;
    switch (direction) {
      case 'ArrowRight':
        nextIndex = (currentIndex + 1) % cards.length;
        break;
      case 'ArrowLeft':
        nextIndex = currentIndex === 0 ? cards.length - 1 : currentIndex - 1;
        break;
      case 'ArrowDown':
        nextIndex = (currentIndex + 2) % cards.length;
        break;
      case 'ArrowUp':
        nextIndex = currentIndex < 2 ? cards.length - 2 + currentIndex : currentIndex - 2;
        break;
    }
    
    if (nextIndex >= 0 && nextIndex < cards.length) {
      cards[nextIndex].focus();
    }
  }
  
  // Настройка поддержки скринридеров
  setupScreenReaderSupport() {
    // Добавляем ARIA-атрибуты
    this.addAriaAttributes();
    
    // Добавляем live regions для динамического контента
    this.addLiveRegions();
    
    // Добавляем skip links
    this.addSkipLinks();
  }
  
  // Добавление ARIA-атрибутов
  addAriaAttributes() {
    // Карточки ниш
    const nicheCards = document.querySelectorAll('.niche-card');
    nicheCards.forEach((card, index) => {
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', `Выбрать нишу: ${card.querySelector('h3').textContent}`);
      card.setAttribute('aria-describedby', `niche-description-${index}`);
    });
    
    // Карточки кандидатов
    const candidateCards = document.querySelectorAll('.candidate-card');
    candidateCards.forEach((card, index) => {
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', `Кандидат: ${card.querySelector('.candidate-name').textContent}`);
      card.setAttribute('aria-describedby', `candidate-description-${index}`);
    });
    
    // Слоты позиций
    const positionSlots = document.querySelectorAll('.position-slot');
    positionSlots.forEach((slot, index) => {
      slot.setAttribute('role', 'region');
      slot.setAttribute('aria-label', `Позиция: ${slot.querySelector('.position-title').textContent}`);
    });
    
    // Зоны сброса
    const dropZones = document.querySelectorAll('.candidate-drop-zone');
    dropZones.forEach((zone, index) => {
      zone.setAttribute('role', 'button');
      zone.setAttribute('tabindex', '0');
      zone.setAttribute('aria-label', `Зона для размещения кандидата на позиции ${zone.dataset.position}`);
    });
  }
  
  // Добавление live regions
  addLiveRegions() {
    // Создаем live region для уведомлений
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.id = 'live-region';
    document.body.appendChild(liveRegion);
    
    // Создаем live region для прогресса
    const progressRegion = document.createElement('div');
    progressRegion.setAttribute('aria-live', 'polite');
    progressRegion.setAttribute('aria-atomic', 'false');
    progressRegion.className = 'sr-only';
    progressRegion.id = 'progress-region';
    document.body.appendChild(progressRegion);
  }
  
  // Добавление skip links
  addSkipLinks() {
    const skipLinks = document.createElement('nav');
    skipLinks.className = 'skip-links';
    skipLinks.setAttribute('aria-label', 'Пропустить навигацию');
    
    skipLinks.innerHTML = `
      <a href="#main-content" class="skip-link">Перейти к основному содержанию</a>
      <a href="#quest-progress" class="skip-link">Перейти к прогрессу</a>
    `;
    
    document.body.insertBefore(skipLinks, document.body.firstChild);
  }
  
  // Настройка высокого контраста
  setupHighContrast() {
    // Проверяем предпочтения пользователя
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    
    if (prefersHighContrast) {
      document.body.classList.add('high-contrast');
    }
    
    // Слушаем изменения
    window.matchMedia('(prefers-contrast: high)').addEventListener('change', (e) => {
      document.body.classList.toggle('high-contrast', e.matches);
    });
  }
  
  // Показать модал
  showModal(type, data) {
    const modalTemplate = this.modals.get(type);
    if (!modalTemplate) {
      console.error(`Modal template not found: ${type}`);
      return;
    }
    
    const modalHTML = modalTemplate.template(data);
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Фокусируемся на первом элементе модала
    const modal = document.querySelector('.modal.show');
    if (modal) {
      const firstFocusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (firstFocusable) {
        firstFocusable.focus();
      }
    }
  }
  
  // Показать анимацию
  playAnimation(element, animationName) {
    const animation = this.animations.get(animationName);
    if (!animation) {
      console.error(`Animation not found: ${animationName}`);
      return;
    }
    
    element.animate(animation.keyframes, animation.options);
  }
  
  // Показать toast уведомление
  showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    // Убираем предыдущие классы
    toast.className = 'toast';
    
    // Добавляем тип
    toast.classList.add(type);
    
    // Устанавливаем сообщение
    toast.textContent = message;
    
    // Показываем
    toast.classList.add('show');
    
    // Обновляем live region для скринридеров
    const liveRegion = document.getElementById('live-region');
    if (liveRegion) {
      liveRegion.textContent = message;
    }
    
    // Скрываем через 3 секунды
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }
  
  // Обновить прогресс
  updateProgress(currentStage, totalStages) {
    const progressFill = document.getElementById('progressFill');
    const steps = document.querySelectorAll('.step');
    
    if (progressFill) {
      const progress = (currentStage / totalStages) * 100;
      progressFill.style.width = `${progress}%`;
    }
    
    // Обновляем шаги
    steps.forEach((step, index) => {
      const stepNumber = index + 1;
      step.classList.remove('active', 'completed');
      
      if (stepNumber < currentStage) {
        step.classList.add('completed');
      } else if (stepNumber === currentStage) {
        step.classList.add('active');
      }
    });
    
    // Обновляем live region для скринридеров
    const progressRegion = document.getElementById('progress-region');
    if (progressRegion) {
      progressRegion.textContent = `Этап ${currentStage} из ${totalStages}`;
    }
  }
  
  // Вспомогательные методы
  getPositionTitle(position) {
    const titles = {
      manager: 'Менеджер',
      marketer: 'Маркетолог',
      financier: 'Финансист',
      specialist: 'Специалист'
    };
    return titles[position] || position;
  }
  
  getCompatibilityClass(score) {
    if (score >= 80) return 'high';
    if (score >= 60) return 'medium';
    return 'low';
  }
  
  // Очистка ресурсов
  destroy() {
    // Очищаем анимации
    this.animations.clear();
    
    // Очищаем модалы
    this.modals.clear();
    
    // Убираем обработчики событий
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('orientationchange', this.handleResize);
  }
}

// Создание экземпляра UI
let businessQuestUI = null;

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  businessQuestUI = new BusinessQuestUI();
});

// Экспорт для использования в других файлах
window.businessQuestUI = businessQuestUI;
