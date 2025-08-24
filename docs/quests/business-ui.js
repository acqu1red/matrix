/* ===== BUSINESS QUEST UI MANAGER ===== */

class BusinessQuestUI {
  constructor(engine) {
    this.engine = engine;
    this.elements = {};
    this.draggedElement = null;
    this.touchStartPos = { x: 0, y: 0 };
    this.isDragging = false;
  }

  // Инициализация UI
  initialize() {
    this.cacheElements();
    this.setupEventListeners();
    this.setupDragAndDrop();
    this.showIntroModal();
  }

  // Кэширование элементов DOM
  cacheElements() {
    this.elements = {
      // Модальные окна
      introModal: document.getElementById('introModal'),
      resultsModal: document.getElementById('resultsModal'),
      
      // Основной интерфейс
      businessInterface: document.getElementById('businessInterface'),
      
      // Панель статуса
      currentStage: document.getElementById('currentStage'),
      businessCapital: document.getElementById('businessCapital'),
      monthlyRevenue: document.getElementById('monthlyRevenue'),
      teamSize: document.getElementById('teamSize'),
      
      // Рабочие области
      selectionTitle: document.getElementById('selectionTitle'),
      stageProgress: document.getElementById('stageProgress'),
      selectionContent: document.getElementById('selectionContent'),
      businessName: document.getElementById('businessName'),
      orgStructure: document.getElementById('orgStructure'),
      financePanel: document.getElementById('financePanel'),
      
      // Финансовые показатели
      monthlyExpenses: document.getElementById('monthlyExpenses'),
      monthlyProfit: document.getElementById('monthlyProfit'),
      businessROI: document.getElementById('businessROI'),
      
      // Панель действий
      currentCandidate: document.getElementById('currentCandidate'),
      actionButtons: document.getElementById('actionButtons'),
      nextStage: document.getElementById('nextStage'),
      skipCandidate: document.getElementById('skipCandidate'),
      hireCandidate: document.getElementById('hireCandidate'),
      
      // Кнопки
      startBusiness: document.getElementById('startBusiness'),
      btnBack: document.getElementById('btnBack'),
      restartBusiness: document.getElementById('restartBusiness'),
      exitBusiness: document.getElementById('exitBusiness'),
      
      // Результаты
      resultsIcon: document.getElementById('resultsIcon'),
      resultsTitle: document.getElementById('resultsTitle'),
      resultsContent: document.getElementById('resultsContent'),
      
      // Toast
      toast: document.getElementById('toast')
    };
  }

  // Настройка обработчиков событий
  setupEventListeners() {
    // Кнопки модальных окон
    this.elements.startBusiness?.addEventListener('click', () => this.startBusiness());
    this.elements.restartBusiness?.addEventListener('click', () => this.restartBusiness());
    this.elements.exitBusiness?.addEventListener('click', () => this.exitBusiness());
    this.elements.btnBack?.addEventListener('click', () => this.goBack());
    
    // Кнопки действий
    this.elements.nextStage?.addEventListener('click', () => this.nextStage());
    this.elements.skipCandidate?.addEventListener('click', () => this.skipCandidate());
    this.elements.hireCandidate?.addEventListener('click', () => this.hireCurrentCandidate());
    
    // Закрытие модальных окон по клику вне них
    this.elements.introModal?.addEventListener('click', (e) => {
      if (e.target === this.elements.introModal) {
        this.hideIntroModal();
      }
    });
    
    this.elements.resultsModal?.addEventListener('click', (e) => {
      if (e.target === this.elements.resultsModal) {
        this.hideResultsModal();
      }
    });
  }

  // Настройка drag & drop
  setupDragAndDrop() {
    // Поддержка как мыши, так и touch событий
    document.addEventListener('mousedown', (e) => this.handleDragStart(e));
    document.addEventListener('mousemove', (e) => this.handleDragMove(e));
    document.addEventListener('mouseup', (e) => this.handleDragEnd(e));
    
    // Touch события для мобильных устройств
    document.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
    document.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
    document.addEventListener('touchend', (e) => this.handleTouchEnd(e));
  }

  // Начало перетаскивания (мышь)
  handleDragStart(e) {
    const candidateCard = e.target.closest('.candidate-card');
    if (candidateCard && !this.isDragging) {
      this.startDrag(candidateCard, e.clientX, e.clientY);
      e.preventDefault();
    }
  }

  // Движение перетаскивания (мышь)
  handleDragMove(e) {
    if (this.isDragging && this.draggedElement) {
      this.updateDragPosition(e.clientX, e.clientY);
      this.updateDropZones(e.clientX, e.clientY);
      e.preventDefault();
    }
  }

  // Окончание перетаскивания (мышь)
  handleDragEnd(e) {
    if (this.isDragging) {
      this.endDrag(e.clientX, e.clientY);
    }
  }

  // Начало touch
  handleTouchStart(e) {
    const candidateCard = e.target.closest('.candidate-card');
    if (candidateCard && e.touches.length === 1) {
      const touch = e.touches[0];
      this.touchStartPos = { x: touch.clientX, y: touch.clientY };
      
      // Небольшая задержка перед началом drag
      this.touchTimeout = setTimeout(() => {
        this.startDrag(candidateCard, touch.clientX, touch.clientY);
        e.preventDefault();
      }, 200);
    }
  }

  // Движение touch
  handleTouchMove(e) {
    if (this.touchTimeout) {
      clearTimeout(this.touchTimeout);
      this.touchTimeout = null;
    }
    
    if (this.isDragging && e.touches.length === 1) {
      const touch = e.touches[0];
      this.updateDragPosition(touch.clientX, touch.clientY);
      this.updateDropZones(touch.clientX, touch.clientY);
      e.preventDefault();
    } else if (e.touches.length === 1) {
      const touch = e.touches[0];
      const deltaX = Math.abs(touch.clientX - this.touchStartPos.x);
      const deltaY = Math.abs(touch.clientY - this.touchStartPos.y);
      
      // Если движение больше порога, отменяем drag
      if (deltaX > 10 || deltaY > 10) {
        if (this.touchTimeout) {
          clearTimeout(this.touchTimeout);
          this.touchTimeout = null;
        }
      }
    }
  }

  // Окончание touch
  handleTouchEnd(e) {
    if (this.touchTimeout) {
      clearTimeout(this.touchTimeout);
      this.touchTimeout = null;
    }
    
    if (this.isDragging) {
      const touch = e.changedTouches[0];
      this.endDrag(touch.clientX, touch.clientY);
    }
  }

  // Начало перетаскивания
  startDrag(element, x, y) {
    this.isDragging = true;
    this.draggedElement = element.cloneNode(true);
    
    // Стилизуем перетаскиваемый элемент
    this.draggedElement.classList.add('dragging');
    this.draggedElement.style.position = 'fixed';
    this.draggedElement.style.zIndex = '1000';
    this.draggedElement.style.pointerEvents = 'none';
    this.draggedElement.style.width = element.offsetWidth + 'px';
    this.draggedElement.style.left = (x - element.offsetWidth / 2) + 'px';
    this.draggedElement.style.top = (y - element.offsetHeight / 2) + 'px';
    
    document.body.appendChild(this.draggedElement);
    
    // Добавляем визуальную обратную связь
    element.style.opacity = '0.5';
    
    // Показываем drop zones
    this.showDropZones();
  }

  // Обновление позиции перетаскиваемого элемента
  updateDragPosition(x, y) {
    if (this.draggedElement) {
      this.draggedElement.style.left = (x - this.draggedElement.offsetWidth / 2) + 'px';
      this.draggedElement.style.top = (y - this.draggedElement.offsetHeight / 2) + 'px';
    }
  }

  // Обновление drop zones
  updateDropZones(x, y) {
    const dropZones = document.querySelectorAll('.position-slot:not(.occupied)');
    
    dropZones.forEach(zone => {
      const rect = zone.getBoundingClientRect();
      const isOver = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
      
      zone.classList.toggle('drag-over', isOver);
    });
  }

  // Показать drop zones
  showDropZones() {
    const dropZones = document.querySelectorAll('.position-slot:not(.occupied)');
    dropZones.forEach(zone => {
      zone.style.borderColor = 'rgba(255, 255, 255, 0.5)';
      zone.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
    });
  }

  // Скрыть drop zones
  hideDropZones() {
    const dropZones = document.querySelectorAll('.position-slot');
    dropZones.forEach(zone => {
      zone.classList.remove('drag-over');
      zone.style.borderColor = '';
      zone.style.backgroundColor = '';
    });
  }

  // Окончание перетаскивания
  endDrag(x, y) {
    if (!this.isDragging) return;
    
    this.isDragging = false;
    
    // Находим drop zone под курсором
    const dropZone = this.getDropZoneAt(x, y);
    
    if (dropZone && !dropZone.classList.contains('occupied')) {
      const position = dropZone.dataset.position;
      const candidateId = this.engine.getCurrentCandidate()?.id;
      
      if (candidateId && this.engine.hireEmployee(candidateId, position)) {
        this.showToast(`Сотрудник нанят на позицию ${position}!`, 'success');
        this.updateBusinessInterface();
        this.loadNextCandidate();
      } else {
        this.showToast('Не удалось нанять сотрудника', 'error');
      }
    }
    
    // Очистка
    this.cleanupDrag();
  }

  // Получение drop zone в точке
  getDropZoneAt(x, y) {
    const dropZones = document.querySelectorAll('.position-slot:not(.occupied)');
    
    for (let zone of dropZones) {
      const rect = zone.getBoundingClientRect();
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        return zone;
      }
    }
    
    return null;
  }

  // Очистка после drag
  cleanupDrag() {
    if (this.draggedElement) {
      document.body.removeChild(this.draggedElement);
      this.draggedElement = null;
    }
    
    // Восстанавливаем прозрачность оригинального элемента
    const candidateCards = document.querySelectorAll('.candidate-card');
    candidateCards.forEach(card => {
      card.style.opacity = '';
    });
    
    this.hideDropZones();
  }

  // Показать модальное окно введения
  showIntroModal() {
    this.elements.introModal?.classList.add('show');
  }

  // Скрыть модальное окно введения
  hideIntroModal() {
    this.elements.introModal?.classList.remove('show');
  }

  // Запуск бизнеса
  startBusiness() {
    this.hideIntroModal();
    this.elements.businessInterface.style.display = 'flex';
    
    // Запускаем движок
    this.engine.startBusiness();
    
    // Инициализируем UI
    this.updateBusinessInterface();
    this.loadNiches();
    
    this.showToast('Начинаем создание бизнеса!', 'success');
  }

  // Загрузка ниш бизнеса
  loadNiches() {
    if (!this.elements.selectionContent) return;
    
    const niches = BusinessDataService.getNiches();
    
    this.elements.selectionContent.innerHTML = `
      <div class="niches-grid">
        ${niches.map(niche => `
          <div class="niche-card" data-niche-id="${niche.id}">
            <div class="niche-header">
              <div class="niche-icon">${niche.icon}</div>
              <div class="niche-info">
                <h4>${niche.name}</h4>
                <div class="niche-category">${niche.category}</div>
              </div>
            </div>
            <div class="niche-description">${niche.description}</div>
            <div class="niche-metrics">
              <div class="niche-metric">
                <div class="metric-value">$${niche.metrics.startupCost / 1000}K</div>
                <div class="metric-label">Старт</div>
              </div>
              <div class="niche-metric">
                <div class="metric-value">$${niche.metrics.monthlyRevenue / 1000}K</div>
                <div class="metric-label">Доход/мес</div>
              </div>
              <div class="niche-metric">
                <div class="metric-value">${niche.metrics.difficulty}</div>
                <div class="metric-label">Сложность</div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
    
    // Добавляем обработчики клика
    const nicheCards = this.elements.selectionContent.querySelectorAll('.niche-card');
    nicheCards.forEach(card => {
      card.addEventListener('click', () => this.selectNiche(card.dataset.nicheId));
    });
  }

  // Выбор ниши
  selectNiche(nicheId) {
    // Убираем выделение с других карточек
    document.querySelectorAll('.niche-card').forEach(card => {
      card.classList.remove('selected');
    });
    
    // Выделяем выбранную карточку
    const selectedCard = document.querySelector(`[data-niche-id="${nicheId}"]`);
    if (selectedCard) {
      selectedCard.classList.add('selected');
    }
    
    // Выбираем нишу в движке
    if (this.engine.selectNiche(nicheId)) {
      this.updateBusinessInterface();
      this.loadCandidatesInterface();
      this.showToast('Ниша выбрана! Теперь формируйте команду.', 'success');
    }
  }

  // Загрузка интерфейса кандидатов
  loadCandidatesInterface() {
    if (!this.elements.selectionTitle || !this.elements.selectionContent) return;
    
    this.elements.selectionTitle.textContent = '👥 Найм сотрудников';
    this.elements.stageProgress.textContent = 'Этап 2: Формирование команды';
    
    this.loadNextCandidate();
  }

  // Загрузка следующего кандидата
  loadNextCandidate() {
    const candidate = this.engine.getCurrentCandidate();
    
    if (!candidate) {
      this.elements.selectionContent.innerHTML = `
        <div style="text-align: center; padding: 40px; color: var(--text-muted);">
          <h3>Кандидаты закончились</h3>
          <p>Вы можете продолжить с текущей командой</p>
        </div>
      `;
      return;
    }
    
    this.elements.selectionContent.innerHTML = `
      <div class="candidates-list">
        <div class="candidate-card" data-candidate-id="${candidate.id}">
          <div class="candidate-header">
            <div class="candidate-avatar">${candidate.avatar}</div>
            <div class="candidate-info">
              <h5>${candidate.name}</h5>
              <div class="candidate-role">${this.getRoleDisplayName(candidate.role)}</div>
            </div>
          </div>
          <div class="candidate-skills">
            ${candidate.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
          </div>
          <div class="candidate-stats">
            <div class="candidate-stat">
              <div class="stat-value">${candidate.stats.efficiency}</div>
              <div class="stat-label">Эффективность</div>
            </div>
            <div class="candidate-stat">
              <div class="stat-value">${candidate.stats.creativity}</div>
              <div class="stat-label">Креативность</div>
            </div>
            <div class="candidate-stat">
              <div class="stat-value">${candidate.stats.leadership}</div>
              <div class="stat-label">Лидерство</div>
            </div>
          </div>
          <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.1);">
            <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 4px;">
              Опыт: ${candidate.experience} лет • Зарплата: $${candidate.salary}/мес
            </div>
            <div style="font-size: 11px; color: var(--text-muted); line-height: 1.3;">
              ${candidate.background}
            </div>
          </div>
        </div>
      </div>
      
      <div style="margin-top: 20px; padding: 16px; background: rgba(255,255,255,0.05); border-radius: var(--radius-sm); border: 1px solid rgba(255,255,255,0.1);">
        <h4 style="margin-bottom: 8px; color: var(--text);">💡 Как нанять:</h4>
        <p style="font-size: 14px; color: var(--text-muted); margin-bottom: 8px;">
          Перетащите кандидата на нужную позицию в организационной структуре справа
        </p>
        <p style="font-size: 12px; color: var(--text-muted);">
          📱 На мобильном: нажмите и удерживайте кандидата, затем перетащите его на позицию
        </p>
      </div>
    `;
    
    this.updateActionButtons();
  }

  // Получение отображаемого названия роли
  getRoleDisplayName(role) {
    const roleNames = {
      marketing: 'Маркетинг',
      sales: 'Продажи',
      tech: 'IT/Техника',
      finance: 'Финансы',
      operations: 'Операции',
      hr: 'HR',
      legal: 'Юрист',
      creative: 'Креатив',
      analytics: 'Аналитика'
    };
    
    return roleNames[role] || role;
  }

  // Обновление кнопок действий
  updateActionButtons() {
    const candidate = this.engine.getCurrentCandidate();
    const gameState = this.engine.getGameState();
    
    if (candidate) {
      this.elements.skipCandidate.style.display = 'inline-block';
      this.elements.hireCandidate.style.display = 'none'; // Найм только через drag & drop
    } else {
      this.elements.skipCandidate.style.display = 'none';
      this.elements.hireCandidate.style.display = 'none';
    }
    
    // Кнопка перехода к следующему этапу
    const canProceed = this.engine.canProceedToNextStage();
    this.elements.nextStage.disabled = !canProceed;
    
    if (canProceed) {
      this.elements.nextStage.textContent = gameState.currentStage === 4 ? 'Завершить бизнес' : 'Следующий этап';
    } else {
      this.elements.nextStage.textContent = 'Нужно больше сотрудников';
    }
  }

  // Пропуск кандидата
  skipCandidate() {
    this.engine.skipCandidate();
    this.loadNextCandidate();
    this.showToast('Кандидат пропущен', 'info');
  }

  // Найм текущего кандидата (через кнопку - резервный способ)
  hireCurrentCandidate() {
    const candidate = this.engine.getCurrentCandidate();
    if (!candidate) return;
    
    const availablePositions = this.engine.getAvailablePositions();
    if (availablePositions.length === 0) {
      this.showToast('Нет свободных позиций', 'warning');
      return;
    }
    
    // Автоматически назначаем на первую подходящую позицию
    const position = availablePositions.includes(candidate.role) ? 
                   candidate.role : availablePositions[0];
    
    if (this.engine.hireEmployee(candidate.id, position)) {
      this.showToast(`${candidate.name} нанят на позицию ${position}!`, 'success');
      this.updateBusinessInterface();
      this.loadNextCandidate();
    }
  }

  // Переход к следующему этапу
  nextStage() {
    if (this.engine.canProceedToNextStage()) {
      const gameState = this.engine.getGameState();
      
      if (gameState.currentStage === 4) {
        // Завершаем бизнес
        this.completeBusiness();
      } else {
        // Переходим к следующему этапу
        this.engine.nextStage();
        this.updateBusinessInterface();
        this.handleStageTransition();
      }
    }
  }

  // Обработка перехода между этапами
  handleStageTransition() {
    const gameState = this.engine.getGameState();
    
    switch (gameState.currentStage) {
      case 3:
        this.elements.selectionTitle.textContent = '📈 Развитие бизнеса';
        this.elements.stageProgress.textContent = 'Этап 3: Стратегические решения';
        this.loadBusinessDevelopmentInterface();
        break;
      
      case 4:
        this.elements.selectionTitle.textContent = '🚀 Масштабирование';
        this.elements.stageProgress.textContent = 'Этап 4: Рост и оптимизация';
        this.loadScalingInterface();
        break;
    }
  }

  // Интерфейс развития бизнеса
  loadBusinessDevelopmentInterface() {
    this.elements.selectionContent.innerHTML = `
      <div style="padding: 20px;">
        <h3 style="margin-bottom: 16px; color: var(--text);">📊 Аналитика бизнеса</h3>
        
        <div style="display: grid; gap: 16px; margin-bottom: 24px;">
          <div style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: var(--radius-sm); border: 1px solid rgba(255,255,255,0.1);">
            <h4 style="margin-bottom: 8px; color: var(--text);">💰 Финансовые показатели</h4>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
              <div>
                <div style="font-size: 12px; color: var(--text-muted);">Месячная прибыль</div>
                <div style="font-size: 18px; font-weight: 600; color: ${this.getMonthlyProfit() > 0 ? '#00ff88' : '#ff4444'};">
                  $${Math.round(this.getMonthlyProfit()).toLocaleString()}
                </div>
              </div>
              <div>
                <div style="font-size: 12px; color: var(--text-muted);">ROI</div>
                <div style="font-size: 18px; font-weight: 600; color: var(--text);">
                  ${this.calculateROI()}%
                </div>
              </div>
            </div>
          </div>
          
          <div style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: var(--radius-sm); border: 1px solid rgba(255,255,255,0.1);">
            <h4 style="margin-bottom: 8px; color: var(--text);">👥 Команда</h4>
            <div style="font-size: 14px; color: var(--text-muted);">
              Размер команды: ${this.engine.getGameState().employees.length} человек<br>
              Средняя производительность: ${this.calculateTeamPerformance()}%
            </div>
          </div>
        </div>
        
        <div style="background: rgba(255,255,255,0.08); padding: 20px; border-radius: var(--radius-sm); border: 1px solid rgba(255,255,255,0.15);">
          <h4 style="margin-bottom: 12px; color: var(--text);">🎯 Рекомендации</h4>
          <div style="font-size: 14px; color: var(--text-muted); line-height: 1.5;">
            ${this.generateBusinessRecommendations()}
          </div>
        </div>
      </div>
    `;
  }

  // Интерфейс масштабирования
  loadScalingInterface() {
    this.elements.selectionContent.innerHTML = `
      <div style="padding: 20px;">
        <h3 style="margin-bottom: 16px; color: var(--text);">🚀 Готовность к запуску</h3>
        
        <div style="background: rgba(255,255,255,0.08); padding: 20px; border-radius: var(--radius-sm); border: 1px solid rgba(255,255,255,0.15); margin-bottom: 20px;">
          <h4 style="margin-bottom: 12px; color: var(--text);">✅ Чек-лист готовности</h4>
          ${this.generateReadinessChecklist()}
        </div>
        
        <div style="background: rgba(0,255,136,0.1); padding: 20px; border-radius: var(--radius-sm); border: 1px solid rgba(0,255,136,0.3);">
          <h4 style="margin-bottom: 12px; color: #00ff88;">🎉 Поздравляем!</h4>
          <p style="color: var(--text-muted); line-height: 1.5;">
            Ваш бизнес готов к запуску! Вы собрали команду профессионалов и создали жизнеспособную бизнес-модель.
            Нажмите "Завершить бизнес" чтобы увидеть финальные результаты.
          </p>
        </div>
      </div>
    `;
  }

  // Генерация рекомендаций для бизнеса
  generateBusinessRecommendations() {
    const gameState = this.engine.getGameState();
    const recommendations = [];
    
    if (this.getMonthlyProfit() <= 0) {
      recommendations.push('• Оптимизируйте расходы или увеличьте доходы для достижения прибыльности');
    }
    
    if (gameState.employees.length < 5) {
      recommendations.push('• Рассмотрите найм дополнительных специалистов для ускорения роста');
    }
    
    const requiredRoles = gameState.selectedNiche?.requiredRoles || [];
    const currentRoles = gameState.employees.map(emp => emp.role);
    const missingRoles = requiredRoles.filter(role => !currentRoles.includes(role));
    
    if (missingRoles.length > 0) {
      recommendations.push(`• Необходимы специалисты: ${missingRoles.map(role => this.getRoleDisplayName(role)).join(', ')}`);
    }
    
    if (this.calculateTeamPerformance() < 70) {
      recommendations.push('• Инвестируйте в обучение команды для повышения производительности');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('• Отличная работа! Ваш бизнес показывает хорошие результаты');
      recommendations.push('• Продолжайте мониторить ключевые метрики и развивайте команду');
    }
    
    return recommendations.join('<br>');
  }

  // Генерация чек-листа готовности
  generateReadinessChecklist() {
    const gameState = this.engine.getGameState();
    const checklist = [];
    
    // Проверка команды
    const hasTeam = gameState.employees.length >= 2;
    checklist.push(`${hasTeam ? '✅' : '❌'} Собрана команда (${gameState.employees.length}/10)`);
    
    // Проверка ключевых ролей
    const requiredRoles = gameState.selectedNiche?.requiredRoles || [];
    const currentRoles = gameState.employees.map(emp => emp.role);
    const hasRequiredRoles = requiredRoles.every(role => currentRoles.includes(role));
    checklist.push(`${hasRequiredRoles ? '✅' : '❌'} Ключевые роли закрыты`);
    
    // Проверка финансов
    const isProfitable = this.getMonthlyProfit() > 0;
    checklist.push(`${isProfitable ? '✅' : '❌'} Бизнес прибыльный`);
    
    // Проверка капитала
    const hasCapital = gameState.capital > 0;
    checklist.push(`${hasCapital ? '✅' : '❌'} Есть оборотный капитал`);
    
    return checklist.map(item => `<div style="margin-bottom: 8px; font-size: 14px;">${item}</div>`).join('');
  }

  // Завершение бизнеса
  completeBusiness() {
    const results = this.engine.completeBusiness();
    this.showResultsModal(results);
  }

  // Обновление интерфейса бизнеса
  updateBusinessInterface() {
    const gameState = this.engine.getGameState();
    
    // Обновляем статус
    if (this.elements.currentStage) {
      this.elements.currentStage.textContent = `${gameState.currentStage}/${BUSINESS_CONFIG.stages}`;
    }
    
    if (this.elements.businessCapital) {
      this.elements.businessCapital.textContent = `$${Math.round(gameState.capital / 1000)}K`;
    }
    
    if (this.elements.monthlyRevenue) {
      this.elements.monthlyRevenue.textContent = `$${Math.round(gameState.monthlyRevenue / 1000)}K`;
    }
    
    if (this.elements.teamSize) {
      this.elements.teamSize.textContent = `${gameState.employees.length}/${BUSINESS_CONFIG.maxEmployees}`;
    }
    
    // Обновляем название бизнеса
    if (this.elements.businessName && gameState.selectedNiche) {
      this.elements.businessName.textContent = gameState.selectedNiche.name;
    }
    
    // Обновляем организационную структуру
    this.updateOrgStructure();
    
    // Обновляем финансовую панель
    this.updateFinancePanel();
    
    // Обновляем кнопки действий
    this.updateActionButtons();
  }

  // Обновление организационной структуры
  updateOrgStructure() {
    const gameState = this.engine.getGameState();
    const employees = gameState.employees;
    
    // Обновляем позиции с сотрудниками
    const positionSlots = document.querySelectorAll('.position-slot[data-position]');
    
    positionSlots.forEach(slot => {
      const position = slot.dataset.position;
      const employee = employees.find(emp => emp.position === position);
      
      if (employee) {
        slot.classList.add('occupied');
        
        const occupiedDiv = slot.querySelector('.position-occupied');
        if (occupiedDiv) {
          occupiedDiv.innerHTML = `
            <div class="employee-card">
              <div class="employee-avatar">${employee.avatar}</div>
              <div class="employee-name">${employee.name}</div>
              <div class="employee-salary">$${employee.salary}/мес</div>
            </div>
          `;
        }
        
        // Скрываем drop zone
        const dropZone = slot.querySelector('.drop-zone');
        if (dropZone) {
          dropZone.style.display = 'none';
        }
      } else {
        slot.classList.remove('occupied');
        
        // Показываем drop zone
        const dropZone = slot.querySelector('.drop-zone');
        if (dropZone) {
          dropZone.style.display = 'flex';
        }
      }
    });
  }

  // Обновление финансовой панели
  updateFinancePanel() {
    const gameState = this.engine.getGameState();
    
    if (this.elements.monthlyExpenses) {
      this.elements.monthlyExpenses.textContent = `$${gameState.monthlyExpenses.toLocaleString()}`;
    }
    
    if (this.elements.monthlyProfit) {
      const profit = gameState.monthlyRevenue - gameState.monthlyExpenses;
      this.elements.monthlyProfit.textContent = `$${profit.toLocaleString()}`;
      this.elements.monthlyProfit.className = `finance-value ${profit >= 0 ? 'profit' : 'loss'}`;
    }
    
    if (this.elements.businessROI) {
      const roi = this.calculateROI();
      this.elements.businessROI.textContent = `${roi}%`;
    }
  }

  // Расчет месячной прибыли
  getMonthlyProfit() {
    const gameState = this.engine.getGameState();
    return gameState.monthlyRevenue - gameState.monthlyExpenses;
  }

  // Расчет ROI
  calculateROI() {
    const gameState = this.engine.getGameState();
    return BusinessDataService.calculateROI(
      gameState.monthlyRevenue,
      gameState.monthlyExpenses,
      BUSINESS_CONFIG.startingCapital
    );
  }

  // Расчет производительности команды
  calculateTeamPerformance() {
    const gameState = this.engine.getGameState();
    if (gameState.employees.length === 0) return 0;
    
    const totalPerformance = gameState.employees.reduce((sum, emp) => sum + emp.performance, 0);
    return Math.round(totalPerformance / gameState.employees.length);
  }

  // Показать модальное окно результатов
  showResultsModal(results) {
    if (!this.elements.resultsModal) return;
    
    // Устанавливаем иконку и заголовок
    if (this.elements.resultsIcon) {
      this.elements.resultsIcon.textContent = results.finalMetrics.score >= 80 ? '🏆' : 
                                             results.finalMetrics.score >= 60 ? '🥈' : 
                                             results.finalMetrics.score >= 40 ? '🥉' : '📊';
    }
    
    if (this.elements.resultsTitle) {
      this.elements.resultsTitle.textContent = results.finalMetrics.score >= 80 ? 'Выдающийся успех!' :
                                               results.finalMetrics.score >= 60 ? 'Отличный результат!' :
                                               results.finalMetrics.score >= 40 ? 'Хороший старт!' : 'Бизнес создан!';
    }
    
    // Заполняем содержимое результатов
    if (this.elements.resultsContent) {
      const completionTimeMinutes = Math.round(results.completionTime / 60000);
      
      this.elements.resultsContent.innerHTML = `
        <div class="result-stat">
          <span class="result-stat-label">Общая оценка</span>
          <span class="result-stat-value">${results.finalMetrics.score}/100</span>
        </div>
        <div class="result-stat">
          <span class="result-stat-label">Месячная прибыль</span>
          <span class="result-stat-value" style="color: ${results.finalMetrics.monthlyProfit >= 0 ? '#00ff88' : '#ff4444'}">
            $${results.finalMetrics.monthlyProfit.toLocaleString()}
          </span>
        </div>
        <div class="result-stat">
          <span class="result-stat-label">ROI</span>
          <span class="result-stat-value">${results.finalMetrics.roi}%</span>
        </div>
        <div class="result-stat">
          <span class="result-stat-label">Размер команды</span>
          <span class="result-stat-value">${results.finalMetrics.teamSize} человек</span>
        </div>
        <div class="result-stat">
          <span class="result-stat-label">Время создания</span>
          <span class="result-stat-value">${completionTimeMinutes} мин</span>
        </div>
        <div class="result-stat" style="border-top: 1px solid rgba(255,255,255,0.2); margin-top: 16px; padding-top: 16px;">
          <span class="result-stat-label">MULACOIN</span>
          <span class="result-stat-value" style="color: #ffd700;">+${results.rewards.mulacoin}</span>
        </div>
        <div class="result-stat">
          <span class="result-stat-label">Опыт</span>
          <span class="result-stat-value" style="color: #00ff88;">+${results.rewards.experience}</span>
        </div>
      `;
    }
    
    this.elements.resultsModal.classList.add('show');
  }

  // Скрыть модальное окно результатов
  hideResultsModal() {
    this.elements.resultsModal?.classList.remove('show');
  }

  // Перезапуск бизнеса
  restartBusiness() {
    this.hideResultsModal();
    this.engine.resetGameState();
    this.engine.initialize();
    this.startBusiness();
  }

  // Выход из квеста
  exitBusiness() {
    this.goBack();
  }

  // Возврат на главную
  goBack() {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '../quests.html';
    }
  }

  // Показать toast уведомление
  showToast(message, type = 'info') {
    if (!this.elements.toast) return;
    
    this.elements.toast.textContent = message;
    this.elements.toast.className = `toast ${type} show`;
    
    setTimeout(() => {
      this.elements.toast.classList.remove('show');
    }, 3000);
  }
}
