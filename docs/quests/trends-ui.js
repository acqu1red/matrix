/* ===== TRENDS QUEST UI ===== */

class TrendsQuestUI {
  constructor(engine) {
    this.engine = engine;
    this.currentScreen = 'welcomeScreen';
    this.elements = {};
    this.uiState = {
      swipeStartX: null,
      swipeStartY: null,
      isDragging: false,
      currentDragElement: null,
      drawingPoints: [],
      isDrawing: false,
      selectedTrendForInvest: null,
      emotionTimer: null,
      selectedPosts: new Set()
    };
  }
  
  initialize() {
    console.log('🎨 Инициализация UI квеста...');
    this.cacheElements();
    this.attachEventListeners();
    this.showScreen('welcomeScreen');
  }

  cacheElements() {
    // Экраны
    this.elements.screens = {
      welcome: document.getElementById('welcomeScreen'),
      stage1: document.getElementById('stage1'),
      stage2: document.getElementById('stage2'),
      stage3: document.getElementById('stage3'),
      stage4: document.getElementById('stage4'),
      stage5: document.getElementById('stage5'),
      results: document.getElementById('resultsScreen')
    };
      
      // Кнопки
    this.elements.btnBack = document.getElementById('btnBack');
    this.elements.startQuest = document.getElementById('startQuest');
    
    // Stage элементы
    this.elements.currentCard = document.getElementById('currentCard');
    this.elements.decisionFeedback = document.getElementById('decisionFeedback');
    this.elements.socialPosts = document.getElementById('socialPosts');
    this.elements.radarCanvas = document.getElementById('radarCanvas');
    this.elements.emotionTimer = document.getElementById('emotionTimer');
    this.elements.confirmEmotion = document.getElementById('confirmEmotion');
    this.elements.dropZones = document.getElementById('dropZones');
    this.elements.eventsPool = document.getElementById('eventsPool');
    this.elements.patternResult = document.getElementById('patternResult');
    this.elements.predictionCanvas = document.getElementById('predictionCanvas');
    this.elements.factorsList = document.getElementById('factorsList');
    this.elements.submitPrediction = document.getElementById('submitPrediction');
    this.elements.portfolioSlots = document.getElementById('portfolioSlots');
    this.elements.newsTicker = document.getElementById('newsTicker');
    this.elements.availableTrends = document.getElementById('availableTrends');
    this.elements.currentBalance = document.getElementById('currentBalance');
    this.elements.simulateDay = document.getElementById('simulateDay');
    this.elements.profitCanvas = document.getElementById('profitCanvas');
    
    // Общие элементы
    this.elements.toast = document.getElementById('toast');
    this.elements.loadingIndicator = document.getElementById('loadingIndicator');
  }
  
  attachEventListeners() {
    // Навигация
    this.elements.btnBack?.addEventListener('click', () => {
      window.location.href = 'quests.html';
    });
    
    this.elements.startQuest?.addEventListener('click', () => {
      this.startQuest();
    });
    
    // Результаты
    document.getElementById('playAgain')?.addEventListener('click', () => {
      this.engine.resetQuest();
      this.resetUI();
      this.showScreen('welcomeScreen');
    });
    
    document.getElementById('exitToMenu')?.addEventListener('click', () => {
      window.location.href = 'quests.html';
    });
  }
  
  // Навигация по экранам
  showScreen(screenName) {
    Object.values(this.elements.screens).forEach(screen => {
      if (screen) screen.classList.remove('active');
    });
    
    const targetScreen = this.elements.screens[screenName.replace('Screen', '')];
    if (targetScreen) {
      targetScreen.classList.add('active');
      this.currentScreen = screenName;
      
      // Инициализация экрана
      this.initializeScreen(screenName);
    }
  }
  
  initializeScreen(screenName) {
    switch (screenName) {
      case 'stage1':
        this.initStage1();
        break;
      case 'stage2':
        this.initStage2();
        break;
      case 'stage3':
        this.initStage3();
        break;
      case 'stage4':
        this.initStage4();
        break;
      case 'stage5':
        this.initStage5();
        break;
      case 'results':
        this.showResults();
        break;
    }
  }
  
  startQuest() {
    this.engine.startQuest();
    this.showScreen('stage1');
  }
  
  // STAGE 1: Swipe механика
  initStage1() {
    this.attachSwipeListeners();
    this.showNextTrend();
  }
  
  attachSwipeListeners() {
    const card = this.elements.currentCard;
    if (!card) return;
    
    // Touch события
    card.addEventListener('touchstart', (e) => this.handleSwipeStart(e), { passive: true });
    card.addEventListener('touchmove', (e) => this.handleSwipeMove(e), { passive: false });
    card.addEventListener('touchend', (e) => this.handleSwipeEnd(e));
    
    // Mouse события для десктопа
    card.addEventListener('mousedown', (e) => this.handleSwipeStart(e));
    card.addEventListener('mousemove', (e) => this.handleSwipeMove(e));
    card.addEventListener('mouseup', (e) => this.handleSwipeEnd(e));
    card.addEventListener('mouseleave', (e) => this.handleSwipeEnd(e));
  }
  
  handleSwipeStart(e) {
    if (this.uiState.isDragging) return;
    
    const touch = e.touches ? e.touches[0] : e;
    this.uiState.swipeStartX = touch.clientX;
    this.uiState.swipeStartY = touch.clientY;
    this.uiState.isDragging = true;
    
    this.elements.currentCard.classList.add('dragging');
  }
  
  handleSwipeMove(e) {
    if (!this.uiState.isDragging) return;
    
    e.preventDefault();
    const touch = e.touches ? e.touches[0] : e;
    const deltaX = touch.clientX - this.uiState.swipeStartX;
    const deltaY = touch.clientY - this.uiState.swipeStartY;
    
    const rotation = deltaX * 0.1;
    this.elements.currentCard.style.transform = `translate(${deltaX}px, ${deltaY}px) rotate(${rotation}deg)`;
    
    // Показываем подсказки
    if (deltaX > 50) {
      this.elements.currentCard.classList.add('tilting-right');
      this.elements.currentCard.classList.remove('tilting-left');
    } else if (deltaX < -50) {
      this.elements.currentCard.classList.add('tilting-left');
      this.elements.currentCard.classList.remove('tilting-right');
    } else {
      this.elements.currentCard.classList.remove('tilting-left', 'tilting-right');
    }
  }
  
  handleSwipeEnd(e) {
    if (!this.uiState.isDragging) return;
    
    this.uiState.isDragging = false;
    this.elements.currentCard.classList.remove('dragging');
    
    const deltaX = e.changedTouches ? 
      e.changedTouches[0].clientX - this.uiState.swipeStartX :
      e.clientX - this.uiState.swipeStartX;
    
    const threshold = 100;
    
    if (Math.abs(deltaX) > threshold) {
      const direction = deltaX > 0 ? 'right' : 'left';
      this.processSwipe(direction);
    } else {
      // Возвращаем карточку на место
      this.elements.currentCard.style.transform = '';
      this.elements.currentCard.classList.remove('tilting-left', 'tilting-right');
    }
  }
  
  processSwipe(direction) {
    const currentIndex = this.engine.getGameState().stage1.currentTrendIndex - 1;
    const trend = TRENDS_DATA[currentIndex];
    if (!trend) return;
    
    // Анимация свайпа
    this.elements.currentCard.classList.add(`swipe-${direction}`);
    
    // Обрабатываем результат
    const result = this.engine.processTrendSwipe(trend.id, direction);
    
    // Показываем фидбек
    this.showDecisionFeedback(result);
    
    // Следующий тренд через анимацию
    setTimeout(() => {
      this.showNextTrend();
    }, 800);
  }
  
  showNextTrend() {
    const trend = this.engine.getNextTrend();
    
    if (!trend) {
      // Переход к следующему этапу
      this.showToast('Отлично! Все тренды проанализированы!', 'success');
      setTimeout(() => {
        this.engine.nextStage();
        this.showScreen('stage2');
      }, 2000);
      return;
    }
    
    // Обновляем карточку
    const card = this.elements.currentCard;
    card.classList.remove('swipe-left', 'swipe-right');
    card.style.transform = '';
    
    card.querySelector('.trend-image').textContent = trend.image;
    card.querySelector('.trend-title').textContent = trend.title;
    card.querySelector('.trend-description').textContent = trend.description;
    
    const stats = card.querySelectorAll('.stat-value');
    stats[0].textContent = trend.stats.audience;
    stats[1].textContent = trend.stats.growth;
    stats[2].textContent = trend.stats.heat;
    
    // Обновляем прогресс
    this.updateStage1Progress();
  }
  
  updateStage1Progress() {
    const state = this.engine.getGameState().stage1;
    const progress = (state.trendsAnalyzed / TRENDS_DATA.length) * 100;
    
    document.querySelector('.progress-fill').style.width = `${progress}%`;
    document.querySelector('.progress-text').textContent = `${state.trendsAnalyzed}/${TRENDS_DATA.length}`;
  }
  
  showDecisionFeedback(result) {
    // Показываем краткое уведомление вверху экрана
    const isCorrect = result.isCorrect;
    const message = isCorrect ? '✅ Правильно!' : '❌ Неверно!';
    this.showTopNotification(message, isCorrect ? 'success' : 'error');
  }
  
  showTopNotification(message, type = 'info') {
    // Создаем или переиспользуем элемент уведомления
    let notification = document.getElementById('topNotification');
    if (!notification) {
      notification = document.createElement('div');
      notification.id = 'topNotification';
      notification.className = 'top-notification';
      document.body.appendChild(notification);
    }
    
    notification.textContent = message;
    notification.className = `top-notification ${type} show`;
    
    setTimeout(() => {
      notification.classList.remove('show');
    }, 1500);
  }
  
  // STAGE 2: Эмоциональный радар
  initStage2() {
    const posts = this.engine.startEmotionAnalysis();
    this.uiState.stage2Posts = posts.slice(0, 8); // Ограничиваем 8 постами
    this.uiState.analyzedPosts = 0;
    this.renderSocialPosts();
    this.initRadar();
    this.startEmotionTimer();
  }
  
  renderSocialPosts() {
    this.elements.socialPosts.innerHTML = '';
    
    this.uiState.stage2Posts.forEach(post => {
      const postEl = document.createElement('div');
      postEl.className = 'social-post';
      postEl.dataset.author = post.author;
      postEl.innerHTML = `
        <div class="post-author">${post.author}</div>
        <div class="post-content">${post.content}</div>
        <div class="post-meta">
          <span>❤️ ${post.likes}</span>
          <span>💬 ${post.comments}</span>
        </div>
      `;
      
      postEl.addEventListener('click', () => this.selectPost(postEl, post));
      this.elements.socialPosts.appendChild(postEl);
    });
  }
  
  selectPost(postEl, post) {
    if (postEl.classList.contains('selected')) {
      postEl.classList.remove('selected');
      this.uiState.selectedPost = null;
    } else {
      // Снимаем выделение с других постов
      document.querySelectorAll('.social-post.selected').forEach(el => {
        el.classList.remove('selected');
      });
      
      postEl.classList.add('selected');
      this.uiState.selectedPost = { element: postEl, data: post };
    }
  }
  
  initRadar() {
    const canvas = this.elements.radarCanvas;
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Рисуем радар
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    
    // Круги
    for (let i = 1; i <= 3; i++) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, (canvas.width / 6) * i, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    // Линии
    const emotions = ['fear', 'greed', 'hope', 'doubt'];
    emotions.forEach((_, index) => {
      const angle = (index * Math.PI * 2) / 4 - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + Math.cos(angle) * (canvas.width / 2 - 10),
        centerY + Math.sin(angle) * (canvas.height / 2 - 10)
      );
      ctx.stroke();
    });
    
    // Обработчики для секторов
    const sectors = document.querySelectorAll('.sector');
    sectors.forEach(sector => {
      sector.addEventListener('click', () => this.selectEmotion(sector.dataset.emotion));
    });
    
    this.elements.confirmEmotion.addEventListener('click', () => this.confirmEmotionAnalysis());
  }
  
  selectEmotion(emotion) {
    if (!this.uiState.selectedPost) {
      this.showToast('Сначала выберите пост!', 'warning');
      return;
    }
    
    // Анализируем выбранный пост
    this.engine.analyzePost(this.uiState.selectedPost.data.author, emotion);
    
    // Визуальный фидбек
    const sector = document.querySelector(`[data-emotion="${emotion}"]`);
    sector.style.transform = 'scale(1.2)';
    setTimeout(() => {
      sector.style.transform = '';
    }, 300);
    
    // Анимируем исчезновение поста
    const postEl = this.uiState.selectedPost.element;
    postEl.style.transform = 'scale(0)';
    postEl.style.opacity = '0';
    
    setTimeout(() => {
      postEl.remove();
      this.uiState.analyzedPosts++;
      
      // Удаляем пост из массива
      this.uiState.stage2Posts = this.uiState.stage2Posts.filter(p => 
        p.author !== this.uiState.selectedPost.data.author
      );
      
      // Проверяем, остались ли посты
      if (this.uiState.stage2Posts.length === 0) {
        this.confirmEmotionAnalysis();
      }
    }, 300);
    
    this.uiState.selectedPost = null;
  }
  
  startEmotionTimer() {
    let timeLeft = 60;
    this.elements.emotionTimer.textContent = timeLeft;
    
    this.uiState.emotionTimer = setInterval(() => {
      timeLeft--;
      this.elements.emotionTimer.textContent = timeLeft;
      
      if (timeLeft <= 10) {
        this.elements.emotionTimer.style.color = '#ff4444';
      }
      
      if (timeLeft <= 0) {
        this.confirmEmotionAnalysis();
      }
    }, 1000);
  }
  
  confirmEmotionAnalysis() {
    clearInterval(this.uiState.emotionTimer);
    
    const sentiment = this.engine.calculateMarketSentiment();
    if (sentiment) {
      this.showToast(`Доминирующая эмоция: ${this.getEmotionName(sentiment.dominant)} (${sentiment.percentage}%)`, 'success');
    }
    
    setTimeout(() => {
      this.engine.nextStage();
      this.showScreen('stage3');
    }, 2000);
  }

  getEmotionName(emotion) {
    const names = {
      fear: 'Страх',
      greed: 'Жадность',
      hope: 'Надежда',
      doubt: 'Сомнение'
    };
    return names[emotion] || emotion;
  }
  
  // Заглушки для остальных этапов
  initStage3() {
    // Рендерим сценарий и настраиваем DnD
    this.renderPatternScenario();
  }
  
  renderPatternScenario() {
    const scenario = this.engine.getPatternScenario();
    if (!scenario) return;
    
    // Рендер drop-зон на таймлайне
    const dropZonesContainer = this.elements.dropZones;
    dropZonesContainer.innerHTML = '';
    for (let i = 1; i <= scenario.events.length; i++) {
      const zone = document.createElement('div');
      zone.className = 'drop-zone';
      zone.dataset.position = String(i);
      zone.innerHTML = `<div class="zone-number">${i}</div>`;
      dropZonesContainer.appendChild(zone);
    }
    
    // Рендер пула событий
    const poolRoot = this.elements.eventsPool;
    const pool = poolRoot.querySelector('.draggable-events') || poolRoot;
    pool.innerHTML = '';
    scenario.events.forEach(ev => {
      const item = document.createElement('div');
      item.className = 'event-item';
      item.dataset.eventId = ev.id;
      item.innerHTML = `
        <span class="event-icon">${ev.icon}</span>
        <span class="event-name">${ev.name}</span>
      `;
      pool.appendChild(item);
      this.attachEventDragHandlers(item);
    });
    
    // Подсказка
    const hintBtn = document.getElementById('showHint');
    if (hintBtn) {
      hintBtn.onclick = () => {
        this.showToast('Подсказка: начало — триггер/изобретение, конец — массовое принятие.', 'info');
      };
    }
    
    // Кнопка далее после успеха
    const nextBtn = document.getElementById('nextFromPattern');
    if (nextBtn) {
      nextBtn.onclick = () => {
        this.elements.patternResult.style.display = 'none';
        this.engine.nextStage();
        this.showScreen('stage4');
      };
    }
  }
  
  attachEventDragHandlers(item) {
    // Touch события
    item.addEventListener('touchstart', (e) => this.handleEventDragStart(e, item), { passive: false });
    item.addEventListener('touchmove', (e) => this.handleEventDragMove(e), { passive: false });
    item.addEventListener('touchend', (e) => this.handleEventDragEnd(e));
    
    // Mouse события
    item.addEventListener('mousedown', (e) => this.handleEventDragStart(e, item));
    
    // Глобальные события только при активном драге
    this.dragMoveHandler = (e) => this.handleEventDragMove(e);
    this.dragEndHandler = (e) => this.handleEventDragEnd(e);
  }
  
  handleEventDragStart(e, item) {
    if (this.uiState.currentDragElement) return;
    
    e.preventDefault();
    const touch = e.touches ? e.touches[0] : e;
    const rect = item.getBoundingClientRect();
    
    this.uiState.currentDragElement = item;
    this.uiState.dragOffsetX = touch.clientX - rect.left;
    this.uiState.dragOffsetY = touch.clientY - rect.top;
    this.uiState.originalParent = item.parentElement;
    this.uiState.startX = touch.clientX;
    this.uiState.startY = touch.clientY;
    
    // Добавляем глобальные слушатели
    document.addEventListener('mousemove', this.dragMoveHandler);
    document.addEventListener('mouseup', this.dragEndHandler);
    
    // Плавная анимация начала
    item.style.transition = 'transform 0.2s ease';
    item.style.transform = 'scale(1.05)';
    
    setTimeout(() => {
      if (this.uiState.currentDragElement === item) {
        item.classList.add('dragging');
        item.style.position = 'fixed';
        item.style.zIndex = '1000';
        item.style.width = rect.width + 'px';
        item.style.left = rect.left + 'px';
        item.style.top = rect.top + 'px';
        item.style.transition = 'none';
        item.style.transform = 'scale(1.05)';
        item.style.pointerEvents = 'none';
      }
    }, 100);
  }
  
  handleEventDragMove(e) {
    const item = this.uiState.currentDragElement;
    if (!item) return;
    
    e.preventDefault();
    const touch = e.touches ? e.touches[0] : e;
    
    // Плавное движение с учетом инерции
    const deltaX = touch.clientX - this.uiState.startX;
    const deltaY = touch.clientY - this.uiState.startY;
    
    // Не начинаем драг пока не сдвинулись достаточно далеко
    if (Math.abs(deltaX) < 5 && Math.abs(deltaY) < 5) return;
    
    const left = touch.clientX - this.uiState.dragOffsetX;
    const top = touch.clientY - this.uiState.dragOffsetY;
    
    // Используем transform для более плавной анимации
    item.style.transform = `translate(${left}px, ${top}px) scale(1.05)`;
    
    // Подсветка зон с улучшенной логикой
    let targetZone = null;
    document.querySelectorAll('.drop-zone').forEach(zone => {
      const r = zone.getBoundingClientRect();
      const centerX = r.left + r.width / 2;
      const centerY = r.top + r.height / 2;
      const distance = Math.sqrt(
        Math.pow(touch.clientX - centerX, 2) + 
        Math.pow(touch.clientY - centerY, 2)
      );
      
      if (distance < 60) { // Радиус активации
        zone.classList.add('drag-over');
        targetZone = zone;
      } else {
        zone.classList.remove('drag-over');
      }
    });
    
    this.uiState.targetZone = targetZone;
  }
  
  handleEventDragEnd(e) {
    const item = this.uiState.currentDragElement;
    if (!item) return;
    
    // Убираем глобальные слушатели
    document.removeEventListener('mousemove', this.dragMoveHandler);
    document.removeEventListener('mouseup', this.dragEndHandler);
    
    document.querySelectorAll('.drop-zone').forEach(z => z.classList.remove('drag-over'));
    
    const zone = this.uiState.targetZone;
    
    if (zone && !zone.querySelector('.event-item')) {
      // Анимация прикрепления к зоне
      const zoneRect = zone.getBoundingClientRect();
      const zoneCenterX = zoneRect.left + zoneRect.width / 2;
      const zoneCenterY = zoneRect.top + zoneRect.height / 2;
      
      item.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
      item.style.transform = `translate(${zoneCenterX - item.offsetWidth/2}px, ${zoneCenterY - item.offsetHeight/2}px) scale(1)`;
      
      setTimeout(() => {
        // Восстанавливаем нормальное позиционирование
        item.style.position = '';
        item.style.left = '';
        item.style.top = '';
        item.style.width = '';
        item.style.zIndex = '';
        item.style.transform = '';
        item.style.transition = '';
        item.style.pointerEvents = '';
        item.classList.remove('dragging');
        
        zone.appendChild(item);
        zone.classList.add('has-item');
        
        // Клик по элементу в зоне возвращает его в пул
        item.onclick = () => {
          zone.classList.remove('has-item');
          const poolRoot = this.elements.eventsPool;
          const pool = poolRoot.querySelector('.draggable-events') || poolRoot;
          pool.appendChild(item);
          item.onclick = null;
          item.style.transform = '';
        };
        
        this.validatePatternIfComplete();
      }, 300);
    } else {
      // Возвращаем в исходное положение
      this.returnDraggedItem(item);
    }
    
    this.uiState.currentDragElement = null;
    this.uiState.targetZone = null;
  }
  
  returnDraggedItem(item) {
    // Плавно возвращаем в исходное положение
    item.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
    item.style.transform = 'scale(1)';
    
    setTimeout(() => {
      item.style.position = '';
      item.style.left = '';
      item.style.top = '';
      item.style.width = '';
      item.style.zIndex = '';
      item.style.transform = '';
      item.style.transition = '';
      item.style.pointerEvents = '';
      item.classList.remove('dragging');
      
      if (this.uiState.originalParent) {
        this.uiState.originalParent.appendChild(item);
      }
    }, 400);
  }
  
  validatePatternIfComplete() {
    const zones = Array.from(this.elements.dropZones.querySelectorAll('.drop-zone'));
    const allFilled = zones.every(z => z.querySelector('.event-item'));
    if (!allFilled) return;
    
    const placedIds = zones.map(z => z.querySelector('.event-item')?.dataset.eventId);
    const result = this.engine.validatePattern(placedIds);
    if (result.isComplete) {
      const res = this.elements.patternResult;
      res.querySelector('.pattern-explanation').textContent = result.explanation || '';
      res.style.display = 'block';
      this.showToast('Паттерн найден! Отличная работа!', 'success');
    } else {
      this.showToast(`Совпадений: ${result.correctCount}/${result.total}. Попробуй переставить элементы.`, 'warning');
    }
  }
  
  initStage4() {
    this.showToast('Этап 4: Прогнозирование', 'info');
  }
  
  initStage5() {
    this.showToast('Этап 5: Инвестиции', 'info');
  }
  
  showResults() {
    this.showToast('Результаты квеста', 'success');
  }
  
  // Общие UI методы
  showToast(message, type = 'info') {
    const toast = this.elements.toast;
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  showLoading(show = true) {
    if (this.elements.loadingIndicator) {
      this.elements.loadingIndicator.style.display = show ? 'flex' : 'none';
    }
  }
  
  resetUI() {
    // Сброс состояния UI
    this.uiState = {
      swipeStartX: null,
      swipeStartY: null,
      isDragging: false,
      currentDragElement: null,
      drawingPoints: [],
      isDrawing: false,
      selectedTrendForInvest: null,
      emotionTimer: null,
      selectedPosts: new Set(),
      selectedPost: null,
      stage2Posts: [],
      analyzedPosts: 0,
      targetZone: null,
      startX: null,
      startY: null,
      dragOffsetX: null,
      dragOffsetY: null,
      originalParent: null
    };
    
    // Очистка таймеров
    if (this.uiState.emotionTimer) {
      clearInterval(this.uiState.emotionTimer);
    }
  }
}

// Экспорт класса
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TrendsQuestUI;
}
