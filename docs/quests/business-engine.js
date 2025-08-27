/* ===== BUSINESS QUEST ENGINE ===== */

class BusinessQuestEngine {
  constructor() {
    this.currentStage = 'niche-selection';
    this.selectedNiche = null;
    this.hiredCandidates = [];
    this.scenarios = [];
    this.completedScenarios = 0;
    this.totalScenarios = 8;
    this.businessSuccess = true;
    this.workerAssignments = {};
    this.businessSuccessRate = 0; // Шкала успешности 0-350%
    this.assignedWorkersCount = 0; // Количество назначенных работников
    this.totalWorkersNeeded = 9; // Всего нужно назначить работников
    this.dailyWorkerEvents = []; // События с работниками (увольнения, болезни)
    
    this.initializeEventListeners();
    this.initializeDragAndDrop();
    this.initializeDailyWorkerSystem();
  }

  initializeEventListeners() {
    // Выбор ниши
    document.querySelectorAll('.niche-button').forEach(button => {
      button.addEventListener('click', (e) => {
        this.selectNiche(e.target.dataset.niche);
      });
    });

    // Продолжить к бизнесу
    document.getElementById('continueBtn')?.addEventListener('click', () => {
      this.startBusinessScenarios();
    });

    // Финальные опции
    document.getElementById('sellBusiness')?.addEventListener('click', () => {
      this.sellBusiness();
    });

    document.getElementById('keepBusiness')?.addEventListener('click', () => {
      this.keepBusiness();
    });

    // Система уведомлений
    document.getElementById('notificationAccept')?.addEventListener('click', () => {
      this.hideNotification();
    });

    document.getElementById('notificationSkip')?.addEventListener('click', () => {
      this.hideNotification();
    });
  }

  initializeDragAndDrop() {
    let draggedElement = null;
    let originalSlot = null;

    // Создаем плавающий элемент для drag & drop
    const floatingCandidate = document.createElement('div');
    floatingCandidate.id = 'floatingCandidate';
    floatingCandidate.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 90px;
      height: 55px;
      background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
      border-radius: 12px;
      display: none;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      z-index: 1000;
      pointer-events: none;
      box-shadow: 0 12px 35px rgba(0, 0, 0, 0.6), 0 0 20px rgba(255, 255, 255, 0.2);
      border: 2px solid rgba(255, 255, 255, 0.4);
      transition: all 0.1s ease-out;
      backdrop-filter: blur(10px);
    `;
    document.body.appendChild(floatingCandidate);

    // Обработка касаний для мобильных устройств
    document.addEventListener('touchstart', (e) => {
      if (e.target.classList.contains('candidate-slot') && e.target.classList.contains('filled')) {
        draggedElement = e.target;
        originalSlot = e.target;
        const rect = e.target.getBoundingClientRect();
        
        // Создаем копию содержимого для перетаскивания
        const content = e.target.innerHTML;
        floatingCandidate.innerHTML = content;
        floatingCandidate.style.display = 'flex';
        floatingCandidate.style.left = (rect.left + rect.width / 2 - 50) + 'px';
        floatingCandidate.style.top = (rect.top + rect.height / 2 - 30) + 'px';
        
        // Добавляем визуальный эффект с плавной анимацией
        e.target.style.transition = 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        e.target.style.opacity = '0.6';
        e.target.style.transform = 'scale(0.92)';
        
        // Показываем подсказку
        this.showToast('📱 Перетащите работника в нужный слот', 'info');
      }
    });

    document.addEventListener('touchmove', (e) => {
      if (draggedElement) {
        e.preventDefault();
        const touch = e.touches[0];
        
        // Плавное перемещение плавающего элемента
        const targetX = touch.clientX - 45;
        const targetY = touch.clientY - 27.5;
        
        // Используем requestAnimationFrame для плавной анимации
        requestAnimationFrame(() => {
          floatingCandidate.style.left = targetX + 'px';
          floatingCandidate.style.top = targetY + 'px';
        });
        
        // Подсвечиваем возможные слоты назначения
        this.highlightDropZones(touch.clientX, touch.clientY);
      }
    });

    document.addEventListener('touchend', (e) => {
      if (draggedElement) {
        const touch = e.changedTouches[0];
        const targetSlot = this.getDropZoneAt(touch.clientX, touch.clientY);
        
        if (targetSlot && targetSlot !== originalSlot) {
          this.assignWorkerToSlot(draggedElement, targetSlot);
          this.showToast('✅ Работник перемещен!', 'success');
        }
        
        // Восстанавливаем оригинальный слот с плавной анимацией
        if (originalSlot) {
          originalSlot.style.transition = 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
          originalSlot.style.opacity = '';
          originalSlot.style.transform = '';
          
          // Убираем transition после анимации
          setTimeout(() => {
            if (originalSlot) {
              originalSlot.style.transition = '';
            }
          }, 400);
        }
        
        // Очистка
        draggedElement = null;
        originalSlot = null;
        floatingCandidate.style.display = 'none';
        this.clearDropZoneHighlights();
      }
    });
  }

  highlightDropZones(x, y) {
    const dropZones = document.querySelectorAll('.candidate-slot:not([data-assigned])');
    
    dropZones.forEach(zone => {
      const rect = zone.getBoundingClientRect();
      const isOver = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
      
      if (isOver) {
        // Добавляем класс для CSS анимации
        zone.classList.add('drag-over');
      } else {
        // Убираем класс для плавного возврата к исходному состоянию
        zone.classList.remove('drag-over');
      }
    });
  }

  clearDropZoneHighlights() {
    const dropZones = document.querySelectorAll('.candidate-slot');
    
    dropZones.forEach(zone => {
      // Убираем класс для плавного возврата к исходному состоянию
      zone.classList.remove('drag-over');
    });
  }

  getDropZoneAt(x, y) {
    const dropZones = document.querySelectorAll('.candidate-slot:not([data-assigned])');
    
    for (let zone of dropZones) {
      const rect = zone.getBoundingClientRect();
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        return zone;
      }
    }
    
      return null;
    }

  selectNiche(nicheId) {
    this.selectedNiche = BusinessDataService.getNicheById(nicheId);
    
    // Скрываем выбор ниши и показываем выбор кандидатов
    document.getElementById('nicheSelection').style.display = 'none';
    document.getElementById('candidateSelection').style.display = 'block';
    
    // Инициализируем шкалу успешности
    this.businessSuccessRate = 0;
    this.updateSuccessRateDisplay();
    
    // Показываем заголовок с выбранной нишей
    const title = document.querySelector('#candidateSelection h2');
    title.textContent = `Выберите кандидатов для: ${this.selectedNiche.name}`;
    
    // Генерируем случайных кандидатов для показа
    this.generateRandomCandidates();
  }

  generateRandomCandidates() {
    // Показываем только одного случайного кандидата
    this.showNextCandidate();
    
    // Добавляем дополнительную проверку через небольшую задержку
    setTimeout(() => {
      const currentCandidate = document.getElementById('currentCandidate');
      if (currentCandidate && currentCandidate.children.length === 0) {
        this.showNextCandidate();
      }
    }, 100);
  }

  showNextCandidate() {
    // Проверяем, есть ли свободные слоты
    const filledSlots = document.querySelectorAll('.candidate-slot[data-assigned]').length;
    if (filledSlots >= 9) {
      // Все позиции заполнены, не показываем новых кандидатов
      const currentCandidate = document.getElementById('currentCandidate');
      if (currentCandidate) {
        currentCandidate.innerHTML = '<div style="text-align: center; padding: 20px; color: #28a745; font-weight: 600;">🎉 Все позиции заполнены!</div>';
      }
      return;
    }
    
    // Получаем все доступные роли из базы кандидатов
    const availableRoles = ['marketing', 'sales', 'tech', 'finance', 'operations', 'creative', 'hr', 'legal', 'analytics'];
    if (availableRoles.length === 0) {
      console.error('Нет доступных ролей в базе кандидатов');
      return;
    }
    
    // Пробуем найти кандидата для случайной роли
    let attempts = 0;
    const maxAttempts = availableRoles.length * 2;
    
    while (attempts < maxAttempts) {
      const randomRole = availableRoles[Math.floor(Math.random() * availableRoles.length)];
      const candidate = BusinessDataService.getRandomCandidate(randomRole);
      
      if (candidate) {
        this.displaySingleCandidate(candidate);
        return;
      }
      
      attempts++;
    }
    
    // Если не удалось найти кандидата, показываем сообщение об ошибке
    console.error('Не удалось найти подходящего кандидата после', attempts, 'попыток');
    const currentCandidate = document.getElementById('currentCandidate');
    if (currentCandidate) {
      currentCandidate.innerHTML = '<div style="text-align: center; padding: 20px; color: #dc3545; font-weight: 600;">⚠️ Ошибка загрузки кандидатов</div>';
    }
  }

  displaySingleCandidate(candidate) {
    const currentCandidate = document.getElementById('currentCandidate');
    if (!currentCandidate) {
      console.error('Элемент currentCandidate не найден');
      return;
    }
    
    if (!candidate) {
      console.error('Кандидат не передан в displaySingleCandidate');
      return;
    }
    
    // Очищаем список и показываем только одного кандидата
    currentCandidate.innerHTML = '';
    
    const candidateButton = this.createCandidateButton(candidate);
    if (candidateButton) {
      currentCandidate.appendChild(candidateButton);
    } else {
      console.error('Не удалось создать кнопку кандидата');
    }
  }

  createCandidateButton(candidate) {
    if (!candidate || !candidate.id || !candidate.name || !candidate.role || !candidate.stats) {
      console.error('Некорректные данные кандидата:', candidate);
      return null;
    }
    
    const button = document.createElement('div');
    button.className = 'candidate-button';
    button.dataset.candidateId = candidate.id;
    
    button.innerHTML = `
      <div class="candidate-header">
        <div class="candidate-avatar">${candidate.avatar || '👤'}</div>
        <div class="candidate-info">
          <div class="candidate-name">${candidate.name}</div>
          <div class="candidate-role">${this.getRoleDisplayName(candidate.role)}</div>
        </div>
      </div>
      <div class="candidate-stats">
        <div class="stat-item">
          <span class="stat-value">${candidate.stats.efficiency || 0}</span>
          <span class="stat-label">Эффективность</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">${candidate.stats.creativity || 0}</span>
          <span class="stat-label">Креативность</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">${candidate.stats.leadership || 0}</span>
          <span class="stat-label">Лидерство</span>
        </div>
      </div>
    `;
    
    // Добавляем обработчики для drag & drop
    this.addDragAndDropHandlers(button, candidate);
    
    return button;
  }

  addDragAndDropHandlers(button, candidate) {
    if (!button || !candidate) {
      console.error('Некорректные параметры для addDragAndDropHandlers:', { button, candidate });
      return;
    }
    
    let isDragging = false;
    let startX, startY;
    let originalTransform;
    let dragThreshold = 10; // Порог для начала перетаскивания
    
    // Touch события для мобильных устройств
    button.addEventListener('touchstart', (e) => {
      e.preventDefault();
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      originalTransform = button.style.transform;
      
      // НЕ уменьшаем кнопку при зажатии, только при перетаскивании
      isDragging = false;
    });
    
    button.addEventListener('touchmove', (e) => {
      if (!startX || !startY) return;
      e.preventDefault();
      
      const touch = e.touches[0];
      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;
      
      // Если движение достаточно большое, начинаем drag
      if (!isDragging && (Math.abs(deltaX) > dragThreshold || Math.abs(deltaY) > dragThreshold)) {
        isDragging = true;
        
        // ТОЛЬКО СЕЙЧАС уменьшаем кнопку с плавной анимацией
        button.classList.add('dragging');
        button.style.transition = 'all 0.2s ease';
        button.style.transform = 'scale(0.9)';
        
        // Начинаем перетаскивание
        this.startDrag(button, candidate, touch.clientX, touch.clientY);
      }
    });
    
    button.addEventListener('touchend', (e) => {
      if (isDragging) {
        // Восстанавливаем оригинальное состояние
        button.classList.remove('dragging');
        button.style.transform = originalTransform;
        button.style.transition = '';
      }
      isDragging = false;
      startX = null;
      startY = null;
    });
    
    // Mouse события для десктопа
    button.addEventListener('mousedown', (e) => {
      e.preventDefault();
      startX = e.clientX;
      startY = e.clientY;
      originalTransform = button.style.transform;
      
      // НЕ уменьшаем кнопку при зажатии, только при перетаскивании
      isDragging = false;
    });
    
    button.addEventListener('mousemove', (e) => {
      if (!startX || !startY) return;
      e.preventDefault();
      
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      // Если движение достаточно большое, начинаем drag
      if (!isDragging && (Math.abs(deltaX) > dragThreshold || Math.abs(deltaY) > dragThreshold)) {
        isDragging = true;
        
        // ТОЛЬКО СЕЙЧАС уменьшаем кнопку с плавной анимацией
        button.classList.add('dragging');
        button.style.transition = 'all 0.2s ease';
        button.style.transform = 'scale(0.9)';
        
        // Начинаем перетаскивание
        this.startDrag(button, candidate, e.clientX, e.clientY);
      }
    });
    
    button.addEventListener('mouseup', (e) => {
      if (isDragging) {
        button.classList.remove('dragging');
        button.style.transform = originalTransform;
        button.style.transition = '';
      }
      isDragging = false;
      startX = null;
      startY = null;
    });
  }

  startDrag(button, candidate, x, y) {
    if (!button || !candidate || typeof x !== 'number' || typeof y !== 'number') {
      console.error('Некорректные параметры для startDrag:', { button, candidate, x, y });
      return;
    }
    
    // Создаем плавающий элемент для drag с упрощенной информацией
    const floatingElement = document.createElement('div');
    floatingElement.className = 'floating-candidate';
    
    // Упрощенная информация без характеристик
    floatingElement.innerHTML = `
      <div style="text-align: center; padding: 10px;">
        <div style="font-size: 32px; margin-bottom: 8px; filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.5));">${candidate.avatar}</div>
        <div style="font-size: 14px; font-weight: 600; color: #ffffff; text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);">${candidate.name}</div>
        <div style="font-size: 12px; color: rgba(255, 255, 255, 0.8); text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);">${this.getRoleDisplayName(candidate.role)}</div>
      </div>
    `;
    
    floatingElement.style.cssText = `
      position: fixed;
      top: ${y - 40}px;
      left: ${x - 100}px;
      width: 150px;
      background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
      border: 2px solid rgba(255, 255, 255, 0.4);
      border-radius: 12px;
      padding: 15px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6), 0 0 20px rgba(255, 255, 255, 0.2);
      z-index: 1000;
      pointer-events: none;
      opacity: 0.95;
    `;
    
    document.body.appendChild(floatingElement);
    
    // Скрываем оригинальную кнопку
    button.style.opacity = '0.3';
    
    // Добавляем обработчики для drag
    this.handleDrag(floatingElement, candidate, button);
  }

  handleDrag(floatingElement, candidate, originalButton) {
    let isDragging = true;
    
    const moveHandler = (e) => {
      if (!isDragging) return;
      
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      
      floatingElement.style.left = (clientX - 100) + 'px';
      floatingElement.style.top = (clientY - 40) + 'px';
      
      // Подсвечиваем возможные слоты назначения
      this.highlightDropZones(clientX, clientY);
    };
    
    const endHandler = (e) => {
      if (!isDragging) return;
      
      const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
      const clientY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
      
      const targetSlot = this.getDropZoneAt(clientX, clientY);
      
      if (targetSlot && !targetSlot.dataset.assigned) {
        this.assignCandidateToSlot(candidate, targetSlot);
        this.showToast(`✅ ${candidate.name} назначен на позицию ${parseInt(targetSlot.dataset.slot) + 1}!`, 'success');
      }
      
      // Очистка
      this.cleanupDrag(floatingElement, originalButton);
      isDragging = false;
    };
    
    // Добавляем обработчики
    document.addEventListener('touchmove', moveHandler, { passive: false });
    document.addEventListener('touchend', endHandler);
    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('mouseup', endHandler);
    
    // Автоматически скрываем через 10 секунд
    setTimeout(() => {
      if (isDragging) {
        this.cleanupDrag(floatingElement, originalButton);
        isDragging = false;
      }
    }, 10000);
  }

  cleanupDrag(floatingElement, originalButton) {
    // Удаляем плавающий элемент
    if (floatingElement && floatingElement.parentNode) {
      floatingElement.parentNode.removeChild(floatingElement);
    }
    
    // Восстанавливаем оригинальную кнопку
    if (originalButton) {
      originalButton.style.opacity = '';
      originalButton.classList.remove('dragging');
      originalButton.style.transform = '';
      originalButton.style.transition = '';
    }
    
    // Очищаем подсветку слотов
    this.clearDropZoneHighlights();
  }

  getRoleDisplayName(role) {
    const roleNames = {
      'marketing': 'Маркетолог',
      'sales': 'Продажник',
      'tech': 'IT-специалист',
      'finance': 'Финансист',
      'operations': 'Операционщик'
    };
    return roleNames[role] || role;
  }

  showCandidateSelection(slotId) {
    // Эта функция больше не нужна
    console.log('showCandidateSelection больше не используется');
  }

  assignCandidateToSlot(candidate, slot) {
    // Проверяем, что slot - это DOM элемент
    if (typeof slot === 'string') {
      slot = document.querySelector(`[data-slot="${slot}"]`);
      if (!slot) return;
    }
    
    if (slot.dataset.assigned) {
      // Слот уже занят, добавляем второго работника
      const firstWorker = this.hiredCandidates.find(w => w.id === slot.dataset.assigned);
      slot.innerHTML = `
        <div class="slot-workers">
          <div class="worker-1">${firstWorker.avatar}</div>
          <div class="worker-2">${candidate.avatar}</div>
        </div>
        <div class="slot-info">
          <div>${firstWorker.name}</div>
          <div>${candidate.name}</div>
        </div>
      `;
      slot.dataset.assigned2 = candidate.id;
    } else {
      // Первый работник в слот
      slot.innerHTML = `
        <div class="worker-avatar">${candidate.avatar}</div>
        <div class="worker-name">${candidate.name}</div>
        <div class="worker-role">${this.getRoleDisplayName(candidate.role)}</div>
      `;
      slot.dataset.assigned = candidate.id;
    }
    
    // Добавляем кандидата в список нанятых
    this.hiredCandidates.push(candidate);
    this.assignedWorkersCount++;
    
    // Проверяем, можно ли продолжить
    this.checkContinueButton();
    
    // Показываем следующего кандидата
    this.showNextCandidate();
  }

  assignWorkerToSlot(worker, slot) {
    if (slot.dataset.assigned) {
      // Слот уже занят, добавляем второго работника
      const firstWorker = this.hiredCandidates.find(w => w.id === slot.dataset.assigned);
      slot.innerHTML = `
        <div class="slot-workers">
          <div class="worker-1">${firstWorker.avatar}</div>
          <div class="worker-2">${worker.avatar}</div>
        </div>
        <div class="slot-info">
          <div>${firstWorker.name}</div>
          <div>${worker.name}</div>
        </div>
      `;
      slot.dataset.assigned2 = worker.id;
    } else {
      // Первый работник в слот
      slot.innerHTML = `
        <div class="worker-avatar">${worker.avatar}</div>
        <div class="worker-name">${worker.name}</div>
        <div class="worker-role">${this.getRoleDisplayName(worker.role)}</div>
      `;
      slot.dataset.assigned = worker.id;
    }
    
    // Обновляем счетчик назначенных работников
    this.assignedWorkersCount = this.countAssignedWorkers();
    
    // Проверяем, можно ли продолжить
    this.checkContinueButton();
  }

  countAssignedWorkers() {
    let count = 0;
    const slots = document.querySelectorAll('.candidate-slot');
    slots.forEach(slot => {
      if (slot.dataset.assigned) count++;
    });
    return count;
  }

  checkContinueButton() {
    const continueBtn = document.getElementById('continueBtn');
    if (!continueBtn) return;
    
    // Проверяем, что все слоты заполнены (минимум 1 работник в каждом)
    const slots = document.querySelectorAll('.candidate-slot');
    const allSlotsFilled = Array.from(slots).every(slot => slot.dataset.assigned);
    
    if (allSlotsFilled) {
      continueBtn.style.display = 'block';
      continueBtn.textContent = 'Продолжить';
      continueBtn.disabled = false;
    } else {
      continueBtn.style.display = 'none';
    }
  }

  startBusinessScenarios() {
    document.getElementById('candidateSelection').style.display = 'none';
    document.getElementById('businessScenarios').style.display = 'block';
    
    this.showToast('🚀 Бизнес запущен! Начинаем работу с задачами', 'success');
    this.updateProgress(0, this.totalScenarios);
    
    this.generateBusinessScenarios();
    this.showNextScenario();
  }

  generateBusinessScenarios() {
    const scenarios = [
      {
        id: 'urgent_order',
        title: 'Срочный заказ',
        description: 'Клиент требует выполнить заказ в 2 раза быстрее обычного. Нужно назначить работника, который справится с повышенной нагрузкой.',
        priority: 'Срочно',
        requiredSkills: ['efficiency'],
        difficulty: 60,
        icon: '🚨',
        role: 'operations'
      },
      {
        id: 'creative_campaign',
        title: 'Креативная кампания',
        description: 'Нужно создать вирусную маркетинговую кампанию. Требуется креативный подход и нестандартное мышление.',
        priority: 'Важно',
        requiredSkills: ['creativity'],
        difficulty: 65,
        icon: '🎨',
        role: 'marketing'
      },
      {
        id: 'technical_issue',
        title: 'Техническая проблема',
        description: 'Сервер упал, клиенты не могут пользоваться сервисом. Нужен быстрый и эффективный специалист.',
        priority: 'Критично',
        requiredSkills: ['efficiency'],
        difficulty: 70,
        icon: '💻',
        role: 'tech'
      },
      {
        id: 'client_negotiation',
        title: 'Сложные переговоры',
        description: 'Крупный клиент хочет скидку 30%. Нужен опытный переговорщик с лидерскими качествами.',
        priority: 'Важно',
        requiredSkills: ['leadership'],
        difficulty: 65,
        icon: '🤝',
        role: 'sales'
      },
      {
        id: 'financial_planning',
        title: 'Финансовое планирование',
        description: 'Нужно составить детальный финансовый план на год. Требуется аналитический склад ума.',
        priority: 'Важно',
        requiredSkills: ['efficiency'],
        difficulty: 55,
        icon: '💰',
        role: 'finance'
      },
      {
        id: 'team_motivation',
        title: 'Мотивация команды',
        description: 'Команда демотивирована после неудачного проекта. Нужен лидер, который поднимет дух.',
        priority: 'Срочно',
        requiredSkills: ['leadership'],
        difficulty: 60,
        icon: '💪',
        role: 'operations'
      },
      {
        id: 'market_research',
        title: 'Исследование рынка',
        description: 'Нужно провести глубокий анализ конкурентов и найти новые возможности для роста.',
        priority: 'Важно',
        requiredSkills: ['creativity'],
        difficulty: 55,
        icon: '🔍',
        role: 'marketing'
      },
      {
        id: 'crisis_management',
        title: 'Управление кризисом',
        description: 'В СМИ появились негативные отзывы. Нужен специалист, который быстро исправит ситуацию.',
        priority: 'Критично',
        requiredSkills: ['leadership', 'efficiency'],
        difficulty: 75,
        icon: '🔥',
        role: 'operations'
      },
      {
        id: 'product_launch',
        title: 'Запуск продукта',
        description: 'Новый продукт готов к запуску. Нужен специалист для координации всех процессов.',
        priority: 'Важно',
        requiredSkills: ['leadership'],
        difficulty: 60,
        icon: '🚀',
        role: 'operations'
      },
      {
        id: 'quality_control',
        title: 'Контроль качества',
        description: 'Клиенты жалуются на качество. Нужен специалист для внедрения системы контроля.',
        priority: 'Срочно',
        requiredSkills: ['efficiency'],
        difficulty: 55,
        icon: '✅',
        role: 'operations'
      }
    ];

    this.scenarios = scenarios;
    this.totalScenarios = scenarios.length;
    this.currentScenarioIndex = 0;
  }

  showNextScenario() {
    if (this.currentScenarioIndex >= this.scenarios.length) {
      // Все сценарии завершены - показываем результат
      this.showFinalResults();
      return;
    }

    // Сбрасываем состояние для нового сценария
    this.resetScenarioState();
    
    const scenario = this.scenarios[this.currentScenarioIndex];
    this.displaySingleScenario(scenario);
  }
  
  resetScenarioState() {
    // Скрываем все результаты предыдущих задач
    const container = document.getElementById('scenariosContainer');
    if (container) {
      const results = container.querySelectorAll('.scenario-result');
      results.forEach(result => {
        result.style.display = 'none';
      });
    }
    
    // Удаляем кнопку "Следующая задача" если она есть
    const nextButton = container?.querySelector('.next-task-button');
    if (nextButton) {
      nextButton.remove();
    }
  }

  showFinalResults() {
    const container = document.getElementById('scenariosContainer');
    if (!container) return;
    
    container.innerHTML = `
      <div class="final-results">
        <h3>🏁 Бизнес завершен!</h3>
        <div class="success-rate-display">
          <div class="success-rate-bar">
            <div class="success-rate-fill" style="width: ${this.businessSuccessRate}%"></div>
          </div>
          <div class="success-rate-text">${this.businessSuccessRate}% успешности</div>
        </div>
        <div class="results-summary">
          <p>Завершено задач: ${this.completedScenarios} из ${this.totalScenarios}</p>
          <p>Общая успешность: ${this.businessSuccessRate}%</p>
        </div>
        <div class="final-actions">
          <button class="btn-primary" onclick="businessEngine.showFinalOptions()">Показать финальные опции</button>
        </div>
      </div>
    `;
    
    // Обновляем заголовок
    const title = document.querySelector('#businessScenarios h2');
    if (title) {
      title.textContent = 'Результаты бизнеса';
    }
  }

  displaySingleScenario(scenario) {
    const container = document.getElementById('scenariosContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    const scenarioElement = this.createScenarioElement(scenario, this.currentScenarioIndex);
    container.appendChild(scenarioElement);
    
    // Обновляем заголовок
    const title = document.querySelector('#businessScenarios h2');
    if (title) {
      title.textContent = `Задача ${this.currentScenarioIndex + 1} из ${this.totalScenarios}: ${scenario.title}`;
    }
  }

  createScenarioElement(scenario, index) {
    const div = document.createElement('div');
    div.className = 'scenario-card';
    div.innerHTML = `
      <div class="scenario-header">
        <div class="scenario-title">
          <span class="scenario-icon">${scenario.icon}</span>
          ${scenario.title}
        </div>
        <div class="scenario-priority">${scenario.priority}</div>
      </div>
      <div class="scenario-description">${scenario.description}</div>
      <div class="scenario-difficulty">
        <span class="difficulty-label">Сложность:</span>
        <span class="difficulty-bar">
          <span class="difficulty-fill" style="width: ${scenario.difficulty}%"></span>
        </span>
        <span class="difficulty-value">${scenario.difficulty}%</span>
      </div>
      <div class="worker-assignment">
        <div class="worker-slot" data-scenario="${scenario.id}" data-index="${index}">
          <div style="font-size: 12px; text-align: center; color: #aaaaaa;">
            Назначить<br>работника
          </div>
        </div>
        <div class="assigned-worker" id="assigned-${scenario.id}" style="display: none;">
          <div class="worker-avatar" id="avatar-${scenario.id}"></div>
          <div class="worker-details">
            <div class="worker-name" id="name-${scenario.id}"></div>
            <div class="worker-role" id="role-${scenario.id}"></div>
          </div>
        </div>
      </div>
      <div class="scenario-result" id="result-${scenario.id}" style="display: none;"></div>
    `;

    // Добавляем обработчик для назначения работника
    const workerSlot = div.querySelector('.worker-slot');
    workerSlot.addEventListener('click', () => {
      this.showWorkerSelection(scenario.id, index);
    });

    return div;
  }

  showWorkerSelection(scenarioId, scenarioIndex) {
    // Показываем модальное окно выбора работника
    const availableWorkers = this.hiredCandidates.filter(candidate => 
      !Object.values(this.workerAssignments).includes(candidate.id)
    );

    if (availableWorkers.length === 0) {
      alert('Все работники уже назначены на задачи!');
      return;
    }

    // Создаем простое модальное окно
    const modal = document.createElement('div');
    modal.className = 'worker-selection-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    `;

    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
      background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
      padding: 20px;
      border-radius: 12px;
      max-width: 400px;
      max-height: 80vh;
      overflow-y: auto;
      border: 2px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.6);
    `;

    modalContent.innerHTML = `
      <h3 style="color: #cccccc; margin-bottom: 20px; text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);">Выберите работника для задачи</h3>
      <div style="margin: 20px 0;">
        ${availableWorkers.map(worker => `
          <div style="
            padding: 15px;
            border: 2px solid rgba(170, 170, 170, 0.4);
            border-radius: 8px;
            margin-bottom: 10px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 15px;
            background: linear-gradient(135deg, #3a3a3a 0%, #2a2a2a 100%);
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
          " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 25px rgba(0, 0, 0, 0.6)'" onmouseout="this.style.transform=''; this.style.boxShadow='0 4px 15px rgba(0, 0, 0, 0.4)'" onclick="window.businessEngine.assignWorkerToScenario('${scenarioId}', ${worker.id})">
            <div style="font-size: 24px; filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.5));">${worker.avatar}</div>
            <div>
              <div style="font-weight: 600; color: #cccccc; text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);">${worker.name}</div>
              <div style="color: rgba(170, 170, 170, 0.9); text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);">${this.getRoleDisplayName(worker.role)}</div>
              <div style="font-size: 12px; color: rgba(170, 170, 170, 0.8); text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);">
                Эфф: ${worker.stats.efficiency} | Креатив: ${worker.stats.creativity} | Лидер: ${worker.stats.leadership}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
      <button onclick="this.parentElement.parentElement.remove()" style="
        background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
        color: #cccccc;
        border: none;
        padding: 10px 20px;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
      " onmouseover="this.style.transform='translateY(-1px)'" onmouseout="this.style.transform=''">Отмена</button>
    `;

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // Закрытие по клику вне модального окна
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  assignWorkerToScenario(scenarioId, workerId) {
    const worker = this.hiredCandidates.find(c => c.id === workerId);
    const scenario = this.scenarios.find(s => s.id === scenarioId);
    
    if (worker && scenario) {
      this.workerAssignments[scenarioId] = workerId;
      
      // Обновляем отображение
      this.updateWorkerAssignment(scenarioId, worker);
      
      // Проверяем результат выполнения задачи
      this.checkScenarioResult(scenarioId, worker, scenario);
      
      // Закрываем модальное окно выбора работника
      const modal = document.querySelector('.worker-selection-modal, [style*="position: fixed"]');
      if (modal) {
        modal.remove();
      }
      
      // Проверяем, завершены ли все сценарии
      this.checkAllScenariosCompleted();
    }
  }

  updateWorkerAssignment(scenarioId, worker) {
    const assignedWorkerDiv = document.getElementById(`assigned-${scenarioId}`);
    const workerSlot = document.querySelector(`[data-scenario="${scenarioId}"]`);
    
    assignedWorkerDiv.style.display = 'flex';
    document.getElementById(`avatar-${scenarioId}`).textContent = worker.avatar;
    document.getElementById(`name-${scenarioId}`).textContent = worker.name;
    document.getElementById(`role-${scenarioId}`).textContent = this.getRoleDisplayName(worker.role);
    
    workerSlot.style.display = 'none';
  }

  checkScenarioResult(scenarioId, worker, scenario) {
    // Рассчитываем успешность выполнения задачи с учетом роли и навыков
    const success = this.calculateTaskSuccess(worker, scenario);
    
    // Обновляем шкалу успешности бизнеса
    this.updateBusinessSuccessRate(success);
    
    // Показываем результат
    const resultDiv = document.getElementById(`result-${scenarioId}`);
    resultDiv.style.display = 'block';
    
    if (success) {
      resultDiv.className = 'scenario-result scenario-success';
      resultDiv.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
          <span style="font-size: 20px;">✅</span>
          <span style="font-weight: 600; color: #cccccc; text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);">Задача выполнена успешно!</span>
        </div>
        <div style="font-size: 12px; color: #28a745; margin-bottom: 15px; text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);">
          ${worker.name} отлично справился с задачей! +3% к успешности
        </div>
        <button class="btn-close-result" style="
          background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
        " onmouseover="this.style.transform='translateY(-1px)'" onmouseout="this.style.transform=''">Закрыть</button>
      `;
      
      this.showToast(`🎉 ${worker.name} успешно справился с задачей! +3%`, 'success');
      this.showNotification(`Отличная работа! ${worker.name} показал высокий результат!`, 'success');
    } else {
      resultDiv.className = 'scenario-result scenario-failure';
      resultDiv.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
          <span style="font-size: 20px;">❌</span>
          <span style="font-weight: 600; color: #cccccc; text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);">Задача провалена. Бизнес несет убытки.</span>
        </div>
        <div style="font-size: 12px; color: #dc3545; margin-bottom: 15px; text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);">
          ${worker.name} не справился с задачей. -2% к успешности
        </div>
        <button class="btn-close-result" style="
          background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(220, 53, 69, 0.3);
        " onmouseover="this.style.transform='translateY(-1px)'" onmouseout="this.style.transform=''">Закрыть</button>
      `;
      
      this.showToast(`💸 ${worker.name} не справился с задачей. -2%`, 'error');
      this.showNotification(`Проблема! ${worker.name} не справился с задачей.`, 'error');
      this.businessSuccess = false;
    }
    
    this.completedScenarios++;
    this.updateProgress(this.completedScenarios, this.totalScenarios);
    
    // Добавляем обработчик для кнопки "Закрыть"
    setTimeout(() => {
      const closeBtn = resultDiv.querySelector('.btn-close-result');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          resultDiv.style.display = 'none';
          // Показываем кнопку "Следующая задача" или переходим к финалу
          this.showNextTaskButton();
        });
      }
    }, 100);
  }

  calculateTaskSuccess(worker, scenario) {
    // Базовый шанс успеха зависит от сложности задачи
    let baseChance = 100 - scenario.difficulty;
    
    // Бонус за соответствие роли
    if (worker.role === scenario.role) {
      baseChance += 25; // +25% за соответствие роли
    }
    
    // Бонус за навыки
    const requiredSkills = scenario.requiredSkills;
    let skillBonus = 0;
    
    requiredSkills.forEach(skill => {
      let skillValue = 0;
      if (skill === 'efficiency') skillValue = worker.stats.efficiency;
      if (skill === 'creativity') skillValue = worker.stats.creativity;
      if (skill === 'leadership') skillValue = worker.stats.leadership;
      
      // Если навык выше 70, даем бонус
      if (skillValue >= 70) skillBonus += 15;
      // Если навык выше 80, даем дополнительный бонус
      if (skillValue >= 80) skillBonus += 10;
    });
    
    // Итоговый шанс успеха
    const finalChance = Math.min(95, baseChance + skillBonus); // Максимум 95%
    
    // Генерируем случайное число и сравниваем с шансом
    return Math.random() * 100 < finalChance;
  }

  showNextTaskButton() {
    const container = document.getElementById('scenariosContainer');
    if (!container) return;
    
    // Удаляем существующую кнопку, если она есть
    const existingButton = container.querySelector('.next-task-button');
    if (existingButton) {
      existingButton.remove();
    }
    
    // Проверяем, есть ли открытые результаты задач
    const openResults = container.querySelectorAll('.scenario-result[style*="display: block"]');
    if (openResults.length > 0) {
      // Есть открытые результаты, не показываем кнопку
      return;
    }
    
    if (this.currentScenarioIndex < this.scenarios.length - 1) {
      // Показываем кнопку "Следующая задача"
      const nextButton = document.createElement('button');
      nextButton.className = 'btn primary large next-task-button';
      nextButton.style.cssText = `
        margin: 20px auto;
        display: block;
        padding: 15px 30px;
        font-size: 18px;
        font-weight: 600;
        background: linear-gradient(135deg, #28a745, #20c997);
        border: none;
        border-radius: 25px;
        color: white;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
      `;
      nextButton.textContent = 'Следующая задача';
      
      nextButton.addEventListener('click', () => {
        this.currentScenarioIndex++;
        this.showNextScenario();
      });
      
      container.appendChild(nextButton);
    } else {
      // Все задачи завершены, показываем финальные опции
      setTimeout(() => {
        this.showFinalOptions();
      }, 2000);
    }
  }

  checkAllScenariosCompleted() {
    if (this.completedScenarios >= this.totalScenarios) {
      this.showFinalOptions();
    }
  }

  showFinalOptions() {
    // Скрываем сценарии и показываем финальные опции
    const scenariosContainer = document.getElementById('businessScenarios');
    const finalOptionsContainer = document.getElementById('finalOptions');
    
    if (scenariosContainer) scenariosContainer.style.display = 'none';
    if (finalOptionsContainer) finalOptionsContainer.style.display = 'block';
    
    if (!finalOptionsContainer) return;
    
    if (this.businessSuccessRate >= 350) {
      // Максимальный успех
      finalOptionsContainer.innerHTML = `
        <div class="max-success" style="
          background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
          border: 2px solid rgba(255, 215, 0, 0.5);
          border-radius: 20px;
          padding: 40px;
          text-align: center;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.6);
        ">
          <h2 style="color: #ffd700; font-size: 2.5rem; margin-bottom: 30px; text-shadow: 0 4px 15px rgba(255, 215, 0, 0.5);">🏆 МАКСИМАЛЬНЫЙ УСПЕХ!</h2>
          <div class="success-rate-display" style="margin-bottom: 30px;">
            <div class="success-rate-bar" style="
              width: 100%;
              height: 20px;
              background: rgba(0, 0, 0, 0.3);
              border-radius: 10px;
              overflow: hidden;
              border: 2px solid rgba(255, 215, 0, 0.3);
            ">
              <div class="success-rate-fill" style="
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, #ffd700, #ffed4e);
                border-radius: 8px;
              "></div>
            </div>
            <div class="success-rate-text" style="
              color: #ffd700;
              font-size: 1.5rem;
              font-weight: 600;
              margin-top: 15px;
              text-shadow: 0 2px 8px rgba(255, 215, 0, 0.5);
            ">350% успешности!</div>
          </div>
          <div class="rewards" style="margin-bottom: 40px;">
            <h3 style="color: #ffffff; font-size: 1.8rem; margin-bottom: 20px; text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);">Максимальные награды:</h3>
            <div class="reward-item" style="
              display: flex;
              align-items: center;
              gap: 15px;
              background: linear-gradient(135deg, #3a3a3a 0%, #2a2a2a 100%);
              border: 1px solid rgba(255, 215, 0, 0.3);
              border-radius: 15px;
              padding: 20px;
              margin-bottom: 15px;
              box-shadow: 0 5px 15px rgba(0, 0, 0, 0.4);
            ">
              <span class="reward-icon" style="font-size: 2rem;">💰</span>
              <span class="reward-text" style="color: #ffffff; font-size: 1.2rem; text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);">500 MULACOIN в день</span>
            </div>
            <div class="reward-item" style="
              display: flex;
              align-items: center;
              gap: 15px;
              background: linear-gradient(135deg, #3a3a3a 0%, #2a2a2a 100%);
              border: 1px solid rgba(255, 215, 0, 0.3);
              border-radius: 15px;
              padding: 20px;
              box-shadow: 0 5px 15px rgba(0, 0, 0, 0.4);
            ">
              <span class="reward-icon" style="font-size: 2rem;">⭐</span>
              <span class="reward-text" style="color: #ffffff; font-size: 1.2rem; text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);">500 опыта в день</span>
            </div>
          </div>
          <div class="final-actions" style="display: flex; gap: 20px; justify-content: center;">
            <button class="btn-primary" onclick="businessEngine.sellBusiness()" style="
              background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
              color: white;
              border: none;
              padding: 15px 30px;
              border-radius: 25px;
              font-size: 1.1rem;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.3s ease;
              box-shadow: 0 8px 25px rgba(40, 167, 69, 0.3);
            " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform=''">Продать бизнес</button>
            <button class="btn-secondary" onclick="businessEngine.keepBusiness()" style="
              background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
              color: white;
              border: none;
              padding: 15px 30px;
              border-radius: 25px;
              font-size: 1.1rem;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.3s ease;
              box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
            " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform=''">Оставить бизнес</button>
          </div>
        </div>
      `;
    } else if (this.businessSuccessRate === 0) {
      // Банкротство
      container.innerHTML = `
        <div class="bankruptcy">
          <h2>💸 БАНКРОТСТВО!</h2>
          <div class="success-rate-display">
            <div class="success-rate-bar">
              <div class="success-rate-fill" style="width: 0%"></div>
            </div>
            <div class="success-rate-text">0% успешности</div>
          </div>
          <div class="bankruptcy-message">
            <p>Ваш бизнес обанкротился!</p>
            <p>Вы получаете только опыт за участие.</p>
          </div>
          <div class="final-actions">
            <button class="btn-primary" onclick="businessEngine.resetQuest()">Начать сначала</button>
          </div>
        </div>
      `;
    } else if (this.businessSuccessRate <= 10) {
      // На пороге банкротства
      container.innerHTML = `
        <div class="near-bankruptcy">
          <h2>⚠️ На пороге банкротства</h2>
          <div class="success-rate-display">
            <div class="success-rate-bar">
              <div class="success-rate-fill" style="width: ${this.businessSuccessRate}%"></div>
            </div>
            <div class="success-rate-text">${this.businessSuccessRate}% успешности</div>
          </div>
          <div class="warning-message">
            <p>Ваш бизнес находится в критическом состоянии!</p>
            <p>Рекомендуется продать бизнес или начать сначала.</p>
          </div>
          <div class="final-actions">
            <button class="btn-primary" onclick="businessEngine.sellBusiness()">Продать бизнес</button>
            <button class="btn-secondary" onclick="businessEngine.resetQuest()">Начать сначала</button>
          </div>
        </div>
      `;
    } else {
      // Обычный результат
      container.innerHTML = `
        <div class="normal-result">
          <h2>📊 Результаты бизнеса</h2>
          <div class="success-rate-display">
            <div class="success-rate-bar">
              <div class="success-rate-fill" style="width: ${this.businessSuccessRate}%"></div>
            </div>
            <div class="success-rate-text">${this.businessSuccessRate}% успешности</div>
          </div>
          <div class="rewards">
            <h3>Ваши награды:</h3>
            <div class="reward-item">
              <span class="reward-icon">💰</span>
              <span class="reward-text">150 MULACOIN сразу</span>
            </div>
            <div class="reward-item">
              <span class="reward-icon">⭐</span>
              <span class="reward-text">${this.completedScenarios * 50} опыта</span>
            </div>
          </div>
          <div class="final-actions">
            <button class="btn-primary" onclick="businessEngine.sellBusiness()">Продать бизнес</button>
            <button class="btn-secondary" onclick="businessEngine.keepBusiness()">Оставить бизнес</button>
          </div>
        </div>
      `;
    }
  }

  sellBusiness() {
    // Логика продажи бизнеса
    const optionsDiv = document.getElementById('finalOptions');
    optionsDiv.innerHTML = `
      <h2>💰 Бизнес продан!</h2>
      <div style="margin: 20px 0; padding: 20px; background: #d4edda; border-radius: 8px; color: #155724;">
        <strong>Результат сделки:</strong><br>
        • Получено: 150 MULACOIN<br>
        • Опыт: +200 XP<br>
        • Статус: Бизнес успешно продан
      </div>
      <div style="margin: 20px 0; padding: 20px; background: #e3f2fd; border-radius: 8px; color: #0c5460;">
        <strong>Достижения:</strong><br>
        • Предприниматель: Создал и продал бизнес<br>
        • Стратег: Успешно развил компанию<br>
        • Инвестор: Получил отличную прибыль
      </div>
      <button onclick="window.location.reload()" class="option-button">
        🔄 Создать новый бизнес
      </button>
    `;
    
    this.showToast('🎉 Поздравляем! Вы продали бизнес за 150 MULACOIN!', 'success');
  }

  keepBusiness() {
    // Логика сохранения бизнеса
    const optionsDiv = document.getElementById('finalOptions');
    optionsDiv.innerHTML = `
      <h2>🚀 Бизнес сохранен!</h2>
      <div style="margin: 20px 0; padding: 20px; background: #d4edda; border-radius: 8px; color: #155724;">
        <strong>Ежедневные награды:</strong><br>
        • MULACOIN: +10/день<br>
        • Опыт: +50 XP/день<br>
        • Статус: Активный бизнес
      </div>
      <div style="margin: 20px 0; padding: 20px; background: #fff3cd; border-radius: 8px; color: #856404;">
        <strong>Долгосрочные преимущества:</strong><br>
        • Пассивный доход<br>
        • Постоянный опыт<br>
        • Возможность масштабирования
      </div>
      <button onclick="window.location.reload()" class="option-button">
        🔄 Создать новый бизнес
      </button>
    `;
    
    this.showToast('🚀 Отлично! Теперь вы будете получать 10 MULACOIN каждый день!', 'success');
  }

  showNotification(message, type = 'info') {
    const notificationSystem = document.getElementById('notificationSystem');
    const notificationMessage = document.getElementById('notificationMessage');
    const notificationIcon = document.querySelector('.notification-icon');
    const notificationTitle = document.querySelector('.notification-title');
    
    if (notificationMessage) {
      notificationMessage.textContent = message;
    }
    
    // Настраиваем иконку и заголовок в зависимости от типа
    if (notificationIcon && notificationTitle) {
      switch (type) {
        case 'success':
          notificationIcon.textContent = '🎉';
          notificationTitle.textContent = 'Отлично!';
          break;
        case 'warning':
          notificationIcon.textContent = '⚠️';
          notificationTitle.textContent = 'Внимание!';
          break;
        case 'error':
          notificationIcon.textContent = '💸';
          notificationTitle.textContent = 'Проблема!';
          break;
        default:
          notificationIcon.textContent = '🎯';
          notificationTitle.textContent = 'Новая задача!';
      }
    }
    
    if (notificationSystem) {
      notificationSystem.style.display = 'block';
    }
    
    // Автоматически скрываем через 5 секунд
    setTimeout(() => {
      this.hideNotification();
    }, 5000);
  }
  
  hideNotification() {
    const notificationSystem = document.getElementById('notificationSystem');
    if (notificationSystem) {
      notificationSystem.style.display = 'none';
    }
  }
  
  updateProgress(current, total) {
    const progressBar = document.getElementById('progressBar');
    const progressFill = document.querySelector('.progress-fill');
    const progressPercent = document.getElementById('progressPercent');
    
    if (progressBar && progressFill && progressPercent) {
      const percentage = Math.round((current / total) * 100);
      progressFill.style.width = percentage + '%';
      progressPercent.textContent = percentage + '%';
      
      if (percentage > 0) {
        progressBar.style.display = 'block';
      }
    }
  }
  
  showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (toast) {
      toast.textContent = message;
      toast.className = `toast toast-${type}`;
      toast.classList.add('show');
      
      setTimeout(() => {
        toast.classList.remove('show');
      }, 3000);
    }
  }

  initializeDailyWorkerSystem() {
    // Система ежедневных событий с работниками
    setInterval(() => {
      this.checkDailyWorkerEvents();
    }, 30000); // Проверяем каждые 30 секунд (для демо)
  }

  checkDailyWorkerEvents() {
    if (this.hiredCandidates.length === 0) return;
    
    // 30-40% вероятность события с работником
    if (Math.random() < 0.35) {
      this.triggerWorkerEvent();
    }
  }

  triggerWorkerEvent() {
    const availableWorkers = this.hiredCandidates.filter(worker => 
      !this.dailyWorkerEvents.some(event => event.workerId === worker.id)
    );
    
    if (availableWorkers.length === 0) return;
    
    const randomWorker = availableWorkers[Math.floor(Math.random() * availableWorkers.length)];
    const eventTypes = [
      { type: 'quit', text: 'уволился', icon: '🚪' },
      { type: 'sick', text: 'заболел', icon: '🤒' },
      { type: 'died', text: 'умер', icon: '💀' }
    ];
    
    const event = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    
    this.dailyWorkerEvents.push({
      workerId: randomWorker.id,
      type: event.type,
      text: event.text,
      icon: event.icon
    });
    
    this.showWorkerEventNotification(randomWorker, event);
  }

  showWorkerEventNotification(worker, event) {
    const notification = document.createElement('div');
    notification.className = 'worker-event-notification';
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="font-size: 20px;">${event.icon}</span>
        <span style="color: #cccccc;">${worker.name} ${event.text}!</span>
        <button class="btn-replace" style="margin-left: auto; padding: 5px 10px; background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: #cccccc; border: none; border-radius: 5px; cursor: pointer; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3); transition: all 0.3s ease;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">Заменить</button>
      </div>
    `;
    
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
      border: 2px solid rgba(170, 170, 170, 0.4);
      border-radius: 8px;
      padding: 15px 20px;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.6);
      z-index: 1000;
      max-width: 400px;
      width: 90%;
      color: #cccccc;
    `;
    
    document.body.appendChild(notification);
    
    // Обработчик кнопки "Заменить"
    const replaceBtn = notification.querySelector('.btn-replace');
    if (replaceBtn) {
      replaceBtn.addEventListener('click', () => {
        this.showWorkerReplacement(worker, event);
        notification.remove();
      });
    }
    
    // Автоматически убираем через 10 секунд
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 10000);
  }

  showWorkerReplacement(oldWorker, event) {
    // Показываем модальное окно замены работника
    const modal = document.createElement('div');
    modal.className = 'worker-replacement-modal';
    modal.innerHTML = `
      <div class="modal-content" style="
        background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
        padding: 25px;
        border-radius: 15px;
        border: 2px solid rgba(170, 170, 170, 0.3);
        box-shadow: 0 15px 35px rgba(0, 0, 0, 0.6);
        max-width: 500px;
        width: 90%;
        color: #cccccc;
      ">
        <h3 style="color: #cccccc; margin-bottom: 15px; text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);">${event.icon} ${oldWorker.name} ${event.text}!</h3>
        <p style="color: rgba(170, 170, 170, 0.9); margin-bottom: 20px; text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);">Выберите нового работника на замену:</p>
        <div id="replacementCandidates"></div>
        <div class="modal-actions" style="display: flex; gap: 15px; margin-top: 20px;">
          <button class="btn-skip" style="
            flex: 1;
            padding: 10px 20px;
            background: linear-gradient(135deg, #ffc107 0%, #ff8f00 100%);
            color: #212529;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(255, 193, 7, 0.3);
          " onmouseover="this.style.transform='translateY(-1px)'" onmouseout="this.style.transform=''">Пропустить</button>
          <button class="btn-close" style="
            flex: 1;
            padding: 10px 20px;
            background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
            color: #cccccc;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
          " onmouseover="this.style.transform='translateY(-1px)'" onmouseout="this.style.transform=''">Закрыть</button>
        </div>
      </div>
    `;
    
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1001;
    `;
    
    document.body.appendChild(modal);
    
    this.showNextReplacementCandidate(modal, oldWorker);
    
    // Обработчики кнопок
    const skipBtn = modal.querySelector('.btn-skip');
    const closeBtn = modal.querySelector('.btn-close');
    
    if (skipBtn) {
      skipBtn.addEventListener('click', () => {
        this.showNextReplacementCandidate(modal, oldWorker);
      });
    }
    
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        modal.remove();
      });
    }
  }

  generateRandomCandidate() {
    const roles = ['marketing', 'sales', 'tech', 'finance', 'operations'];
    const randomRole = roles[Math.floor(Math.random() * roles.length)];
    return BusinessDataService.getRandomCandidate(randomRole);
  }

  showNextReplacementCandidate(modal, oldWorker) {
    const container = modal.querySelector('#replacementCandidates');
    const newCandidate = this.generateRandomCandidate();
    
    container.innerHTML = `
      <div class="replacement-candidate" style="
        background: linear-gradient(135deg, #3a3a3a 0%, #2a2a2a 100%);
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
      ">
        <div style="font-size: 48px; text-align: center; margin-bottom: 15px; filter: drop-shadow(0 4px 15px rgba(255, 255, 255, 0.2));">${newCandidate.avatar}</div>
        <div style="text-align: center; margin-bottom: 20px;">
          <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px; color: #ffffff; text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);">${newCandidate.name}</div>
          <div style="font-size: 14px; color: rgba(255, 255, 255, 0.8); margin-bottom: 15px; text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);">${this.getRoleDisplayName(newCandidate.role)}</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 20px;">
            <div style="text-align: center;">
              <div style="font-size: 12px; color: rgba(255, 255, 255, 0.7); text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);">Эффективность</div>
              <div style="font-size: 16px; font-weight: 600; color: #ffffff; text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);">${newCandidate.stats.efficiency}</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 12px; color: rgba(255, 255, 255, 0.7); text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);">Креативность</div>
              <div style="font-size: 16px; font-weight: 600; color: #ffffff; text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);">${newCandidate.stats.creativity}</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 12px; color: rgba(255, 255, 255, 0.7); text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);">Лидерство</div>
              <div style="font-size: 16px; font-weight: 600; color: #ffffff; text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);">${newCandidate.stats.leadership}</div>
            </div>
          </div>
        </div>
        <button class="btn-hire" style="
          width: 100%; 
          padding: 12px; 
          background: linear-gradient(135deg, #28a745 0%, #20c997 100%); 
          color: white; 
          border: none; 
          border-radius: 8px; 
          font-size: 16px; 
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
        " onmouseover="this.style.transform='translateY(-1px)'" onmouseout="this.style.transform=''">Нанять</button>
      </div>
    `;
    
    const hireBtn = container.querySelector('.btn-hire');
    if (hireBtn) {
      hireBtn.addEventListener('click', () => {
        this.replaceWorker(oldWorker, newCandidate);
        modal.remove();
      });
    }
  }

  replaceWorker(oldWorker, newWorker) {
    // Заменяем старого работника новым
    const index = this.hiredCandidates.findIndex(w => w.id === oldWorker.id);
    if (index !== -1) {
      this.hiredCandidates[index] = newWorker;
      
      // Обновляем назначения если работник был назначен на задачу
      Object.keys(this.workerAssignments).forEach(scenarioId => {
        if (this.workerAssignments[scenarioId] === oldWorker.id) {
          this.workerAssignments[scenarioId] = newWorker.id;
        }
      });
      
      this.showToast(`✅ ${oldWorker.name} заменен на ${newWorker.name}`, 'success');
    }
  }

  updateBusinessSuccessRate(success) {
    if (success) {
      this.businessSuccessRate += 3; // +3% за успешную задачу
    } else {
      this.businessSuccessRate -= 2; // -2% за неуспешную задачу
    }
    
    // Ограничиваем от 0 до 350%
    this.businessSuccessRate = Math.max(0, Math.min(350, this.businessSuccessRate));
    
    // Обновляем отображение шкалы
    this.updateSuccessRateDisplay();
    
    // Проверяем особые условия
    this.checkSpecialConditions();
  }

  updateSuccessRateDisplay() {
    // Обновляем шкалу в начале квеста
    const successBar = document.getElementById('businessSuccessBar');
    if (successBar) {
      const fill = successBar.querySelector('.success-fill');
      const text = successBar.querySelector('.success-text');
      
      if (fill) {
        fill.style.width = `${this.businessSuccessRate}%`;
      }
      
      if (text) {
        let statusText = '';
        let statusColor = '';
        
        if (this.businessSuccessRate === 0) {
          statusText = 'БАНКРОТСТВО!';
          statusColor = '#dc3545';
        } else if (this.businessSuccessRate <= 5) {
          statusText = 'На краю банкротства';
          statusColor = '#fd7e14';
        } else if (this.businessSuccessRate <= 10) {
          statusText = 'На пороге банкротства';
          statusColor = '#ffc107';
        } else if (this.businessSuccessRate >= 350) {
          statusText = 'МАКСИМАЛЬНЫЙ УСПЕХ!';
          statusColor = '#28a745';
        } else {
          statusText = `${this.businessSuccessRate}% успешности`;
          statusColor = '#007bff';
        }
        
        text.textContent = statusText;
        text.style.color = statusColor;
      }
    }
  }

  checkSpecialConditions() {
    if (this.businessSuccessRate === 0) {
      // Банкротство - начинаем сначала
      this.showBankruptcyMessage();
    } else if (this.businessSuccessRate >= 350) {
      // Максимальный успех
      this.showMaxSuccessMessage();
    }
  }

  showBankruptcyMessage() {
    this.showNotification('💸 Бизнес обанкротился! Начинаем сначала...', 'error');
    setTimeout(() => {
      this.resetQuest();
    }, 3000);
  }

  showMaxSuccessMessage() {
    this.showNotification('🏆 Достигнут максимальный успех! Максимальные бонусы!', 'success');
  }

  resetQuest() {
    // Сброс квеста к началу
    this.currentStage = 'niche';
    this.selectedNiche = null;
    this.hiredCandidates = [];
    this.scenarios = [];
    this.completedScenarios = 0;
    this.businessSuccess = true;
    this.workerAssignments = {};
    this.businessSuccessRate = 0;
    this.assignedWorkersCount = 0;
    this.dailyWorkerEvents = [];
    
    // Показываем начальный экран
    document.getElementById('nicheSelection').style.display = 'block';
    document.getElementById('candidateSelection').style.display = 'none';
    document.getElementById('businessScenarios').style.display = 'none';
    document.getElementById('finalOptions').style.display = 'none';
    
    this.showToast('🔄 Квест сброшен. Начинаем сначала!', 'info');
  }
}

// Инициализация движка при загрузке страницы
window.addEventListener('DOMContentLoaded', () => {
  window.businessEngine = new BusinessQuestEngine();
});
