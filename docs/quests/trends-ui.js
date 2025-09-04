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
    const feedback = this.elements.decisionFeedback;
    feedback.querySelector('.feedback-content').textContent = result.feedback;
    feedback.classList.add('show');
    
    setTimeout(() => {
      feedback.classList.remove('show');
    }, 2000);
  }
  
  // STAGE 2: Эмоциональный радар
  initStage2() {
    const posts = this.engine.startEmotionAnalysis();
    this.renderSocialPosts(posts);
    this.initRadar();
    this.startEmotionTimer();
  }
  
  renderSocialPosts(posts) {
    this.elements.socialPosts.innerHTML = '';
    
    posts.slice(0, 5).forEach(post => {
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
      
      postEl.addEventListener('click', () => this.selectPost(postEl));
      this.elements.socialPosts.appendChild(postEl);
    });
  }
  
  selectPost(postEl) {
    if (postEl.classList.contains('selected')) {
      postEl.classList.remove('selected');
      this.uiState.selectedPosts.delete(postEl.dataset.author);
    } else {
      postEl.classList.add('selected');
      this.uiState.selectedPosts.add(postEl.dataset.author);
    }
    
    // Активируем кнопку если выбрано достаточно постов
    this.elements.confirmEmotion.disabled = this.uiState.selectedPosts.size < 3;
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
    // Анализируем выбранные посты с этой эмоцией
    this.uiState.selectedPosts.forEach(author => {
      this.engine.analyzePost(author, emotion);
    });
    
    // Визуальный фидбек
    const sector = document.querySelector(`[data-emotion="${emotion}"]`);
    sector.style.transform = 'scale(1.2)';
    setTimeout(() => {
      sector.style.transform = '';
    }, 300);
    
    // Очищаем выбор
    this.uiState.selectedPosts.clear();
    document.querySelectorAll('.social-post.selected').forEach(el => {
      el.classList.remove('selected');
    });
    
    // Показываем новые посты
    const posts = shuffleArray(SOCIAL_POSTS_DATA);
    this.renderSocialPosts(posts);
    
    this.elements.confirmEmotion.disabled = true;
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
    const onStart = (e) => this.handleEventDragStart(e, item);
    const onMove = (e) => this.handleEventDragMove(e);
    const onEnd = (e) => this.handleEventDragEnd(e);
    
    // Touch
    item.addEventListener('touchstart', onStart, { passive: true });
    item.addEventListener('touchmove', onMove, { passive: false });
    item.addEventListener('touchend', onEnd);
    
    // Mouse
    item.addEventListener('mousedown', onStart);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onEnd);
  }
  
  handleEventDragStart(e, item) {
    if (this.uiState.currentDragElement) return;
    const touch = e.touches ? e.touches[0] : e;
    const rect = item.getBoundingClientRect();
    
    this.uiState.currentDragElement = item;
    this.uiState.dragOffsetX = touch.clientX - rect.left;
    this.uiState.dragOffsetY = touch.clientY - rect.top;
    this.uiState.originalParent = item.parentElement;
    
    item.classList.add('dragging');
    item.style.position = 'fixed';
    item.style.zIndex = '1000';
    item.style.width = rect.width + 'px';
    item.style.left = rect.left + 'px';
    item.style.top = rect.top + 'px';
  }
  
  handleEventDragMove(e) {
    const item = this.uiState.currentDragElement;
    if (!item) return;
    
    e.preventDefault();
    const touch = e.touches ? e.touches[0] : e;
    const left = touch.clientX - this.uiState.dragOffsetX;
    const top = touch.clientY - this.uiState.dragOffsetY;
    item.style.left = left + 'px';
    item.style.top = top + 'px';
    
    // Подсветка зон
    document.querySelectorAll('.drop-zone').forEach(zone => {
      const r = zone.getBoundingClientRect();
      if (touch.clientX >= r.left && touch.clientX <= r.right && touch.clientY >= r.top && touch.clientY <= r.bottom) {
        zone.classList.add('drag-over');
      } else {
        zone.classList.remove('drag-over');
      }
    });
  }
  
  handleEventDragEnd(e) {
    const item = this.uiState.currentDragElement;
    if (!item) return;
    
    const touch = e.changedTouches ? e.changedTouches[0] : e;
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    const zone = el && (el.closest ? el.closest('.drop-zone') : null);
    
    document.querySelectorAll('.drop-zone').forEach(z => z.classList.remove('drag-over'));
    
    if (zone) {
      // Проверяем, свободна ли зона
      if (!zone.querySelector('.event-item')) {
        item.style.position = '';
        item.style.left = '';
        item.style.top = '';
        item.style.width = '';
        item.style.zIndex = '';
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
        };
        
        this.validatePatternIfComplete();
      } else {
        // Зона занята — возвращаем
        this.returnDraggedItem(item);
      }
    } else {
      // Не на зоне — возвращаем
      this.returnDraggedItem(item);
    }
    
    this.uiState.currentDragElement = null;
  }
  
  returnDraggedItem(item) {
    item.style.position = '';
    item.style.left = '';
    item.style.top = '';
    item.style.width = '';
    item.style.zIndex = '';
    item.classList.remove('dragging');
    if (this.uiState.originalParent) {
      this.uiState.originalParent.appendChild(item);
    }
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
      selectedPosts: new Set()
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
