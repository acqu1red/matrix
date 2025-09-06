/* ===== BUSINESS QUEST UI (fixed, complete) ===== */

class BusinessQuestUI {
  constructor(engine) {
    this.engine = engine;
    this.currentStage = 0;
    this.draggedCandidate = null;
    this.dragOverPosition = null;
    this.candidateIndex = 0;

    // DOM элементы
    this.elements = {
      introModal: null,
      questContent: null,
      stages: {},
      buttons: {},
      modals: {}
    };

    // Привязываем методы к контексту
    this.handleStageChange = this.handleStageChange.bind(this);
    this.handleNicheSelection = this.handleNicheSelection.bind(this);
    this.handleCandidateHired = this.handleCandidateHired.bind(this);
    this.handleQuestCompleted = this.handleQuestCompleted.bind(this);
  }

  // Инициализация UI
  initialize() {
    console.log('🎨 Инициализация UI бизнес-квеста...');

    // Пробуем подхватить данные из business-data.js, если движок пустой
    try {
      if (this.engine && (!Array.isArray(this.engine.candidates) || this.engine.candidates.length === 0)) {
        if (typeof CANDIDATES_DATABASE !== 'undefined') {
          this.engine.candidates = CANDIDATES_DATABASE.slice();
        }
      }
      if (this.engine && (!Array.isArray(this.engine.niches) || this.engine.niches.length < 4)) {
        if (typeof BUSINESS_NICHES !== 'undefined') {
          this.engine.niches = BUSINESS_NICHES.slice();
        }
      }
    } catch (e) {
      console.warn('Не удалось подхватить данные кандидатов/ниш:', e);
    }

    this.cacheElements();
    this.setupEventListeners();
    this.renderCurrentStage();

    // Подписываемся на события движка
    this.engine.on('stageChanged', this.handleStageChange);
    this.engine.on('nicheSelected', this.handleNicheSelection);
    this.engine.on('candidateHired', this.handleCandidateHired);
    this.engine.on('questCompleted', this.handleQuestCompleted);

    // Экспорт в глобал для inline-обработчиков
    window.businessUI = this;

    console.log('✅ UI бизнес-квеста инициализирован');
  }

  /* ===== Кэширование DOM ===== */
  cacheElements() {
    this.elements.introModal = document.getElementById('introModal');
    this.elements.questContent = document.querySelector('.quest-content');

    // Кнопки
    this.elements.buttons = {
      startQuest: document.getElementById('startQuest'),
      back: document.getElementById('btnBack'),
      confirmNiche: document.getElementById('confirmNiche'),
      confirmTeam: document.getElementById('confirmTeam'),
      nextMonth: document.getElementById('nextMonth'),
      finishQuest: document.getElementById('finishQuest'),
      sellBusiness: document.getElementById('sellBusiness'),
      passiveBusiness: document.getElementById('passiveBusiness'),
      myBusiness: document.getElementById('btnMyBusiness')
    };

    // Этапы
    this.elements.stages = {
      businessNiche: document.getElementById('businessNiche'),
      teamHiring: document.getElementById('teamHiring'),
      businessManagement: document.getElementById('businessManagement'),
      questResults: document.getElementById('questResults'),
      myBusiness: document.getElementById('myBusiness')
    };
  }

  /* ===== Настройка обработчиков ===== */
  setupEventListeners() {
    // Кнопка "Начать квест"
    if (this.elements.buttons.startQuest) {
      this.elements.buttons.startQuest.addEventListener('click', () => this.startQuest());
    }

    // Кнопка "Назад"
    if (this.elements.buttons.back) {
      this.elements.buttons.back.addEventListener('click', () => this.goBack());
    }

    // Кнопка подтверждения ниши (оставляем для совместимости)
    if (this.elements.buttons.confirmNiche) {
      this.elements.buttons.confirmNiche.addEventListener('click', () => this.confirmNicheSelection());
    }

    // Кнопка "Пропустить кандидата"
    const skipCandidateBtn = document.getElementById('skipCandidate');
    if (skipCandidateBtn) {
      skipCandidateBtn.addEventListener('click', () => this.skipCandidate());
    }

    // Кнопка "Запустить бизнес"
    const launchBusinessBtn = document.getElementById('launchBusiness');
    if (launchBusinessBtn) {
      launchBusinessBtn.addEventListener('click', () => this.launchBusiness());
    }

    // Следующий месяц
    if (this.elements.buttons.nextMonth) {
      this.elements.buttons.nextMonth.addEventListener('click', () => this.nextMonth());
    }

    // Завершение квеста
    if (this.elements.buttons.finishQuest) {
      this.elements.buttons.finishQuest.addEventListener('click', () => this.finishQuest());
    }

    // Продажа / Пассив
    if (this.elements.buttons.sellBusiness) {
      this.elements.buttons.sellBusiness.addEventListener('click', () => this.sellBusiness());
    }
    if (this.elements.buttons.passiveBusiness) {
      this.elements.buttons.passiveBusiness.addEventListener('click', () => this.enablePassiveBusiness());
    }

    // "Мой бизнес"
    if (this.elements.buttons.myBusiness) {
      this.elements.buttons.myBusiness.addEventListener('click', () => this.showMyBusiness());
    }

    // Выбор ниши карточками
    this.setupNicheSelection();

    // Действия в управлении
    this.setupBusinessActions();
  }

  /* ===== Рендер / Стадии ===== */
  renderCurrentStage() {
    const stageId = this.engine.getCurrentStage();
    Object.keys(this.elements.stages).forEach(id => {
      const el = this.elements.stages[id];
      if (!el) return;
      el.classList.toggle('active', id === stageId);
    });

    if (stageId === 'businessNiche') {
      this.setupNicheSelection();
    } else if (stageId === 'teamHiring') {
      // Рисуем кандидата и слоты
      this.setupDragAndDrop();
      this.renderCurrentCandidate();
      this.updateConfirmTeamButton();
    } else if (stageId === 'businessManagement') {
      this.updateManagementUI();
    } else if (stageId === 'questResults') {
      // пока ничего, будет по finishQuest
    } else if (stageId === 'myBusiness') {
      this.updateMyBusinessUI();
    }
  }

  handleStageChange() {
    this.renderCurrentStage();
  }

  handleNicheSelection() {
    // можно показать подсказку / лог
    console.log('✅ Ниша выбрана:', this.engine.getSelectedNiche());
  }

  handleCandidateHired() {
    this.updateConfirmTeamButton();
  }

  handleQuestCompleted() {
    // Показ финального экрана уже делаем в finishQuest
  }

  /* ===== Ниша ===== */
  setupNicheSelection() {
    const nicheCards = document.querySelectorAll('.niche-card');
    nicheCards.forEach(card => {
      if (card.__nicheBound) return; // защита от двойного биндинга
      card.__nicheBound = true;
      card.addEventListener('click', () => {
        const nicheId = card.dataset.niche;
        this.selectNiche(nicheId);
      });
    });
  }

  selectNiche(nicheId) {
    // Визуальное выделение
    document.querySelectorAll('.niche-card').forEach(c => c.classList.remove('selected'));
    const card = document.querySelector('[data-niche="' + nicheId + '"]');
    if (card) card.classList.add('selected');

    // Сохраняем и переходим на следующий этап
    if (this.engine && typeof this.engine.selectNiche === 'function' && this.engine.selectNiche(nicheId)) {
      if (this.elements?.buttons?.confirmNiche) {
        this.elements.buttons.confirmNiche.style.display = 'none';
      }
      if (typeof this.engine.nextStage === 'function') this.engine.nextStage();
      this.renderCurrentStage();
      return true;
    }
    return false;
  }

  confirmNicheSelection() {
    if (this.engine.getSelectedNiche()) {
      if (typeof this.engine.nextStage === 'function') this.engine.nextStage();
      this.renderCurrentStage();
    } else {
      this.showToast('Сначала выберите нишу', 'warning');
    }
  }

  /* ===== Старт / Навигация ===== */
  startQuest() {
    if (this.elements.introModal) {
      this.elements.introModal.classList.remove('show');
      this.elements.introModal.style.display = 'none';
    }
    if (this.engine && typeof this.engine.startQuest === 'function') {
      this.engine.startQuest();
    }
    this.renderCurrentStage();
  }

  goBack() {
    if (this.engine.previousStage()) {
      this.renderCurrentStage();
    }
  }

  /* ===== Drag & Drop / Найм ===== */
  setupDragAndDrop() {
    // Настраиваем слоты
    this.setupPositionDrop();
    // Настраиваем перетаскивание текущего кандидата
    this.setupCurrentCandidateDrag();
  }

  setupCandidateDrag() {
    const candidateCards = document.querySelectorAll('.candidate-card');
    candidateCards.forEach(card => {
      if (card.__dragBound) return;
      card.__dragBound = true;
      card.addEventListener('dragstart', (e) => this.handleDragStart(e, card));
      card.addEventListener('dragend', (e) => this.handleDragEnd(e));
    });
  }

  setupCurrentCandidateDrag() {
    const currentCandidateCard = document.querySelector('.current-candidate .candidate-card');
    if (!currentCandidateCard || currentCandidateCard.__dragBound) return;
    currentCandidateCard.__dragBound = true;
    currentCandidateCard.addEventListener('dragstart', (e) => this.handleDragStart(e, currentCandidateCard));
    currentCandidateCard.addEventListener('dragend', (e) => this.handleDragEnd(e));
  }

  setupPositionDrop() {
    const positionSlots = document.querySelectorAll('.position-slot');
    positionSlots.forEach(slot => {
      if (slot.__dropBound) return;
      slot.__dropBound = true;
      slot.addEventListener('dragover', (e) => this.handleDragOver(e, slot));
      slot.addEventListener('drop', (e) => this.handleDrop(e, slot));
      slot.addEventListener('dragleave', (e) => this.handleDragLeave(e, slot));
    });
  }

  handleDragStart(e, candidateCard) {
    this.draggedCandidate = candidateCard;
    candidateCard.classList.add('dragging');

    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', candidateCard.dataset.candidateId);

    // Скролл к позициям
    this.scrollToPositions();
  }

  handleDragOver(e, positionSlot) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (this.draggedCandidate && positionSlot.dataset.occupied !== 'true') {
      positionSlot.classList.add('drag-over');
      this.dragOverPosition = positionSlot;
      // Показ уведомления ТОЛЬКО над слотом
      this.showDragNotification('Отпустите для найма кандидата', positionSlot);
    }
  }

  handleDrop(e, positionSlot) {
    e.preventDefault();
    const dataId = e.dataTransfer.getData('text/plain');
    const candidateId = dataId || (this.draggedCandidate && this.draggedCandidate.dataset.candidateId);
    if (!candidateId) return;

    if (this.draggedCandidate && this.dragOverPosition === positionSlot) {
      const positionId = positionSlot.dataset.position;
      if (positionSlot.dataset.occupied === 'false') {
        if (this.hireCandidate(candidateId, positionId)) {
          positionSlot.dataset.occupied = 'true';
          this.renderHiredCandidate(positionSlot, candidateId);
          this.updateConfirmTeamButton();
          this.showNextCandidate(); // следующий кандидат
          this.showToast('Кандидат успешно нанят!', 'success');
        } else {
          this.showToast('Не удалось нанять кандидата', 'error');
        }
      } else {
        this.showToast('Эта позиция уже занята', 'warning');
      }
    }
    this.cleanupDragState();
  }

  handleDragEnd() {
    this.cleanupDragState();
  }

  handleDragLeave(e, positionSlot) {
    if (this.dragOverPosition === positionSlot) {
      positionSlot.classList.remove('drag-over');
      this.dragOverPosition = null;
      this.hideDragNotification();
    }
  }

  cleanupDragState() {
    if (this.draggedCandidate) {
      this.draggedCandidate.classList.remove('dragging');
      this.draggedCandidate = null;
    }
    if (this.dragOverPosition) {
      this.dragOverPosition.classList.remove('drag-over');
      this.dragOverPosition = null;
    }
    this.hideDragNotification();
  }

  showDragNotification(message, anchorEl) {
    this.hideDragNotification();
    const notification = document.createElement('div');
    notification.className = 'drag-notification';
    notification.textContent = message;
    notification.id = 'dragNotification';
    if (anchorEl) {
      const rect = anchorEl.getBoundingClientRect();
      notification.style.position = 'fixed';
      notification.style.left = (rect.left + rect.width / 2) + 'px';
      notification.style.top = (rect.top - 14) + 'px';
      notification.style.transform = 'translateX(-50%)';
    }
    document.body.appendChild(notification);
  }

  hideDragNotification() {
    const notification = document.getElementById('dragNotification');
    if (notification) notification.remove();
  }

  scrollToPositions() {
    const positionsSection = document.querySelector('.positions-section');
    if (positionsSection) {
      positionsSection.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    }
  }

  hireCandidate(candidateId, positionId) {
    const cid = isNaN(candidateId) ? candidateId : Number(candidateId);
    return this.engine.hireCandidate(cid, positionId);
  }

  renderHiredCandidate(positionSlot, candidateId) {
    const candidateData = this.getCandidateData(candidateId) || {};
    const salary = candidateData.salary || (candidateData.stats ? (3000 + Math.floor((candidateData.stats.efficiency || 50) * 20)) : 4000);
    positionSlot.innerHTML = `
      <div class="hired-candidate">
        <div class="candidate-avatar">${candidateData.avatar || '👤'}</div>
        <div class="candidate-info">
          <h4>${candidateData.name || 'Сотрудник'}</h4>
          <p>${candidateData.specialty || this.getPositionName(positionSlot.dataset.position)}</p>
          <div class="candidate-salary">${salary} ₽/мес</div>
        </div>
        <button class="fire-btn" onclick="businessUI.fireCandidate('${positionSlot.dataset.position}')">🔥</button>
      </div>
    `;
  }

  fireCandidate(positionId) {
    if (this.engine.fireCandidate(positionId)) {
      const slot = document.querySelector(`[data-position="${positionId}"]`);
      if (slot) this.resetPositionSlot(slot);
      this.updateConfirmTeamButton();
      this.showToast('Сотрудник уволен', 'info');
    }
  }

  resetPositionSlot(positionSlot) {
    positionSlot.dataset.occupied = 'false';
    positionSlot.innerHTML = `
      <div class="position-icon">${this.getPositionIcon(positionSlot.dataset.position)}</div>
      <div class="position-info">
        <h4>${this.getPositionName(positionSlot.dataset.position)}</h4>
        <p>${this.getPositionDescription(positionSlot.dataset.position)}</p>
      </div>
      <div class="candidate-placeholder">Перетащите кандидата</div>
    `;
  }

  getPositionIcon(positionId) {
    const icons = { tech: '💻', marketing: '📢', finance: '💰', operations: '⚙️' };
    return icons[positionId] || '👤';
  }
  getPositionName(positionId) {
    const names = { tech: 'Технический директор', marketing: 'Маркетинг-директор', finance: 'Финансовый директор', operations: 'Операционный директор' };
    return names[positionId] || 'Должность';
  }
  getPositionDescription(positionId) {
    const descriptions = { tech: 'Управление разработкой и IT', marketing: 'Продвижение и реклама', finance: 'Управление финансами', operations: 'Управление процессами' };
    return descriptions[positionId] || 'Описание должности';
  }

  /* ===== Кандидаты (текущий) ===== */
  getAvailableCandidates() {
    const hiredIds = Object.values(this.engine.gameState.hiredTeam).map(e => e.id);
    return this.engine.candidates.filter(c => hiredIds.indexOf(c.id) === -1);
  }

  getCandidateData(candidateId) {
    const cid = isNaN(candidateId) ? candidateId : Number(candidateId);
    return this.engine.candidates.find(c => c.id === cid) || {};
  }

  renderCurrentCandidate() {
    const container = document.getElementById('currentCandidateContainer');
    if (!container) return;

    const list = this.getAvailableCandidates();
    if (list.length === 0) {
      container.innerHTML = '<div class="empty">Все кандидаты уже наняты. Вы можете уволить кого‑то и нанять другого.</div>';
      return;
    }
    if (this.candidateIndex >= list.length) this.candidateIndex = 0;
    const c = list[this.candidateIndex];

    // формат навыков с пробелами
    const skillsText = Array.isArray(c.skills) ? c.skills.join(', ') : '';

    container.innerHTML = `
      <div class="candidate-card" data-candidate-id="${c.id}" draggable="true">
        <div class="candidate-avatar">${c.avatar || '👤'}</div>
        <div class="candidate-name">${c.name}</div>
        <div class="candidate-specialty">${c.specialty || 'Специалист'}</div>
        <div class="candidate-stats">
          <div class="candidate-stat"><span class="stat-label">Опыт</span><span class="stat-value">${c.experience || 0}</span></div>
          <div class="candidate-stat"><span class="stat-label">Навыки</span><span class="stat-value">${skillsText}</span></div>
        </div>
        <div class="hint">Перетащите карточку на должность</div>
      </div>
    `;

    this.setupCurrentCandidateDrag();
  }

  showNextCandidate() {
    const list = this.getAvailableCandidates();
    if (list.length === 0) return;
    this.candidateIndex = (this.candidateIndex + 1) % list.length;
    this.renderCurrentCandidate();
  }

  skipCandidate() {
    this.showNextCandidate();
  }

  updateConfirmTeamButton() {
    const launchBtn = document.getElementById('launchBusiness');
    if (!launchBtn) return;
    const required = ['tech', 'marketing', 'finance', 'operations'];
    const team = this.engine.gameState.hiredTeam || {};
    const filled = required.every(r => !!team[r]);
    launchBtn.style.display = filled ? 'inline-flex' : 'none';
  }

  /* ===== Управление бизнесом ===== */
  setupBusinessActions() {
    const actionButtons = document.querySelectorAll('.action-btn');
    actionButtons.forEach(btn => {
      if (btn.__actionBound) return;
      btn.__actionBound = true;
      btn.addEventListener('click', () => {
        const actionType = btn.dataset.action;
        this.performBusinessAction(actionType);
      });
    });
  }

  performBusinessAction(actionType) {
    if (!this.engine.gameState.isRunning) {
      this.showToast('Сначала запустите бизнес', 'warning');
      return;
    }
    this.engine.performBusinessAction(actionType);
    this.updateManagementUI();
  }

  launchBusiness() {
    this.engine.startBusiness();
    // Переход на этап управления
    if (typeof this.engine.setStage === 'function') this.engine.setStage(2);
    this.renderCurrentStage();
    this.showToast('Бизнес запущен!', 'success');
  }

  nextMonth() {
    if (this.engine.nextMonth()) {
      this.updateManagementUI();
      // Генерируем событие месяца (сюжет)
      const ev = this.engine.generateMonthlyEvent();
      if (ev) {
        // Простейший вывод
        this.showToast(ev.title + ': ' + ev.description, ev.negative ? 'warning' : 'info');
      }
    }
  }

  updateManagementUI() {
    const s = this.engine.gameState.businessStats;
    const teamSizeEl = document.getElementById('teamSize');
    const capitalEl = document.getElementById('capitalValue');
    const revenueEl = document.getElementById('revenueValue');
    const progressEl = document.getElementById('progressValue');
    if (teamSizeEl) teamSizeEl.textContent = `${Object.keys(this.engine.gameState.hiredTeam).length}/4`;
    if (capitalEl) capitalEl.textContent = (s.capital || 0).toLocaleString('ru-RU') + ' ₽';
    if (revenueEl) revenueEl.textContent = (s.revenue || 0).toLocaleString('ru-RU') + ' ₽';
    if (progressEl) {
      const pg = this.engine.getQuestProgress();
      const pct = Math.round((pg.current - 1) / (pg.total - 1) * 100);
      progressEl.textContent = pct + '%';
    }
  }

  finishQuest() {
    // Рассчитываем финал и показываем результаты
    const res = this.engine.calculateFinalResults();
    if (typeof this.engine.setStage === 'function') this.engine.setStage(3);
    this.renderCurrentStage();
    // Подстановка значений
    const fc = document.getElementById('finalCapital');
    const tr = document.getElementById('totalRevenue');
    const tq = document.getElementById('teamQuality');
    const bg = document.getElementById('businessGrowth');
    if (fc) fc.textContent = (res.capital || 0).toLocaleString('ru-RU') + ' ₽';
    if (tr) tr.textContent = (res.revenue || 0).toLocaleString('ru-RU') + ' ₽';
    if (tq) {
      const compat = Math.max(0, Math.min(100, (this.engine.evaluateTeamCompatibility() + 4) * 12.5));
      tq.textContent = Math.round(compat) + '%';
    }
    if (bg) {
      const growth = Math.max(-100, Math.min(300, Math.round((res.revenue - res.expenses) / 1000)));
      bg.textContent = growth + '%';
    }
  }

  sellBusiness() {
    const price = this.engine.calculateSalePrice();
    this.engine.completeSale(price);
    this.showToast(`Бизнес продан за ${price} MULACOIN`, 'success');
  }

  enablePassiveBusiness() {
    this.engine.enablePassiveBusiness();
    this.showToast('Пассивный доход включен (+10 MULACOIN/день)', 'info');
    this.showMyBusiness();
  }

  showMyBusiness() {
    if (typeof this.engine.setStage === 'function') this.engine.setStage(4); // нет в списке, отрисуем вручную
    // Скрываем все и показываем myBusiness
    Object.keys(this.elements.stages).forEach(id => {
      const el = this.elements.stages[id];
      if (el) el.classList.remove('active');
    });
    const mb = this.elements.stages.myBusiness;
    if (mb) mb.classList.add('active');
    this.updateMyBusinessUI();
  }

  updateMyBusinessUI() {
    const pb = this.engine.gameState.passiveBusiness;
    const totalEl = document.getElementById('passiveTotal');
    const daysEl = document.getElementById('passiveDays');
    const statusEl = document.getElementById('passiveStatus');
    const issuesEl = document.getElementById('passiveIssues');
    if (!pb) {
      if (statusEl) statusEl.textContent = 'Не активен';
      return;
    }
    const days = Math.floor((Date.now() - (new Date(pb.startedAt)).getTime()) / (1000*60*60*24));
    if (totalEl) totalEl.textContent = (pb.totalEarned || (days * (pb.perDay || 10))) + ' MULACOIN';
    if (daysEl) daysEl.textContent = String(days);
    if (statusEl) statusEl.textContent = pb.isInCrisis ? 'Кризис' : 'Активен';
    if (issuesEl) {
      issuesEl.innerHTML = (pb.issues || []).map(i => `<li>${new Date(i.when).toLocaleDateString('ru-RU')} — ${i.text}</li>`).join('');
    }
  }

  /* ===== Утилиты ===== */
  showToast(text, type) {
    // простой тост
    const el = document.createElement('div');
    el.className = 'toast ' + (type || 'info');
    el.textContent = text;
    Object.assign(el.style, {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      padding: '12px 16px',
      borderRadius: '12px',
      background: 'rgba(0,0,0,0.75)',
      color: '#fff',
      zIndex: 9999
    });
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2500);
  }
}

// Экспорт
window.BusinessQuestUI = BusinessQuestUI;
