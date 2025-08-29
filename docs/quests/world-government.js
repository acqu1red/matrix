// Квест "Мировое тайное правительство"
class WorldGovernmentQuest {
  constructor() {
    // Кэшируем DOM элементы для оптимизации
    this.domCache = {};
    this.eventListeners = new Map();
    
    this.characters = this.generateCharacters();
    this.currentCharacterIndex = 0;
    this.sectors = {
      political: { max: 4, members: [], name: 'Политический' },
      military: { max: 3, members: [], name: 'Военный' },
      economic: { max: 2, members: [], name: 'Экономический' },
      research: { max: 2, members: [], name: 'Исследовательский' },
      propaganda: { max: 3, members: [], name: 'Пропагандический' }
    };
    this.draggedElement = null;
    this.results = [];
    this.currentResultIndex = 0;
    this.failureProbability = 0;
    this.storySystem = new WorldGovernmentStories();
    
    // Аудио система
    this.isAudioEnabled = true;
    this.audioStarted = false;
    
    // Оптимизация: используем requestAnimationFrame для плавных анимаций
    this.animationFrameId = null;
    this.lastUpdateTime = 0;
    
    this.init();
  }

  init() {
    this.cacheDOMElements();
    this.bindEvents();
    this.loadCurrentCharacter();
    this.updateSectorCounts();
  }

  cacheDOMElements() {
    // Кэшируем часто используемые DOM элементы
    this.domCache = {
      currentCharacter: document.getElementById('current-character'),
      finishButton: document.getElementById('finish-creation'),
      skipButton: document.getElementById('skip-character'),
      sectors: document.querySelectorAll('.sector'),
      resultsModal: document.getElementById('results-modal'),
      resultsTitle: document.getElementById('results-title'),
      resultsContent: document.getElementById('results-content'),
      membersModal: document.getElementById('members-modal'),
      membersList: document.getElementById('members-list'),
      eliminationModal: document.getElementById('elimination-modal'),
      eliminationZone: document.getElementById('elimination-zone'),
      selectedAllies: document.getElementById('selected-allies'),
      executeButton: document.getElementById('execute-elimination'),
      storyModal: document.getElementById('story-modal'),
      storyTitle: document.getElementById('story-title'),
      storyContent: document.getElementById('story-content'),
      toggleAudio: document.getElementById('toggle-audio')
    };
  }

  bindEvents() {
    // Оптимизация: используем делегирование событий и кэшированные элементы
    const eventHandlers = {
      'start-quest': () => this.hideWarning(),
      'back-to-main': () => this.goToMain(),
      'skip-character': () => this.skipCharacter(),
      'finish-creation': () => this.showFinishModal(),
      'confirm-finish': () => {
        this.hideFinishModal();
        this.startResults();
      },
      'cancel-finish': () => this.hideFinishModal(),
      'next-result': () => this.nextResult(),
      'finish-results': () => this.finishQuest(),
      'close-members': () => this.hideMembersModal(),
      'close-character-details': () => this.hideCharacterDetailsModal(),
      'cancel-elimination': () => this.hideEliminationModal(),
      'execute-elimination': () => this.executeElimination(),
      'toggle-audio': () => this.storySystem.toggleAudio(),
      'toggle-sound': () => this.toggleAudio(),
      'story-next': () => this.nextStory(),
      'close-story': () => this.closeStory()
    };

    // Привязываем события с сохранением ссылок для возможности удаления
    Object.entries(eventHandlers).forEach(([id, handler]) => {
      const element = document.getElementById(id);
      if (element) {
        const boundHandler = handler.bind(this);
        element.addEventListener('click', boundHandler);
        this.eventListeners.set(id, { element, handler: boundHandler });
      }
    });

    // Перетаскивание
    this.setupDragAndDrop();
  }

  hideWarning() {
    document.getElementById('warning-modal').classList.remove('active');
    document.getElementById('main-interface').classList.remove('hidden');
    
    // Включаем фоновую музыку
    this.startBackgroundAudio();
  }

  // Включение фоновой музыки
  startBackgroundAudio() {
    const audio = document.getElementById('horror-audio');
    if (audio && this.isAudioEnabled) {
      audio.volume = 0.3;
      audio.play().catch(e => console.log('Аудио не может быть воспроизведено:', e));
      
      // Автоматический перезапуск при окончании
      audio.addEventListener('ended', () => {
        if (this.isAudioEnabled) {
          audio.currentTime = 0;
          audio.play().catch(e => console.log('Аудио не может быть воспроизведено:', e));
        }
      });
    }
  }

  // Переключение звука
  toggleAudio() {
    this.isAudioEnabled = !this.isAudioEnabled;
    const audio = document.getElementById('horror-audio');
    const soundBtn = document.getElementById('toggle-sound');
    const soundIcon = soundBtn.querySelector('.sound-icon');
    const soundText = soundBtn.querySelector('.sound-text');
    
    if (this.isAudioEnabled) {
      soundIcon.textContent = '🔊';
      soundText.textContent = 'Звук ВКЛ';
      if (audio) {
        audio.volume = 0.3;
        audio.play().catch(e => console.log('Аудио не может быть воспроизведено:', e));
      }
    } else {
      soundIcon.textContent = '🔇';
      soundText.textContent = 'Звук ВЫКЛ';
      if (audio) {
        audio.pause();
      }
    }
  }

  goToMain() {
    // Возвращаемся на главную страницу квестов
    window.location.href = '../quests.html';
  }

  showFinishModal() {
    document.getElementById('finish-modal').classList.add('active');
  }

  hideFinishModal() {
    document.getElementById('finish-modal').classList.remove('active');
  }

  startResults() {
    this.generateResults();
    this.showResultsModal();
  }

  generateResults() {
    this.results = [];
    this.currentResultIndex = 0;
    
    // Генерируем сюжеты для каждого сектора
    Object.entries(this.sectors).forEach(([sectorType, sector]) => {
      if (sector.members.length > 0) {
        // Успешные сюжеты для правильных назначений
        const correctMembers = sector.members.filter(m => m.isCorrect);
        if (correctMembers.length > 0) {
          const successStory = this.storySystem.getRandomStory(sectorType);
          if (successStory) {
            successStory.sector = sectorType;
            this.results.push(successStory);
          }
        }

        // Проблемные сюжеты для неправильных назначений
        const incorrectMembers = sector.members.filter(m => !m.isCorrect);
        incorrectMembers.forEach(member => {
          const errorStory = this.storySystem.getRandomStory(sectorType);
          if (errorStory) {
            errorStory.sector = sectorType;
            errorStory.member = member;
            this.results.push(errorStory);
          }
        });
      }
    });

    // Добавляем комбинированные сюжеты
    const combinationStories = this.storySystem.getStoriesByType('success');
    combinationStories.forEach(story => {
      if (story.sectors && story.sectors.length > 1) {
        const hasMembers = story.sectors.some(sector => 
          this.sectors[sector] && this.sectors[sector].members.length > 0
        );
        if (hasMembers) {
          this.results.push(story);
        }
      }
    });

    // Перемешиваем результаты
    this.results = this.shuffleArray(this.results);
    
    // Вычисляем вероятность неудачи
    this.calculateFailureProbability();
  }

  calculateFailureProbability() {
    let totalErrors = 0;
    let totalMembers = 0;
    
    Object.values(this.sectors).forEach(sector => {
      totalMembers += sector.members.length;
      const incorrectMembers = sector.members.filter(m => !m.isCorrect);
      totalErrors += incorrectMembers.length;
    });
    
    if (totalMembers > 0) {
      this.failureProbability = Math.round((totalErrors / totalMembers) * 100);
    } else {
      this.failureProbability = 0;
    }
  }

  showResultsModal() {
    if (this.results.length === 0) {
      this.finishQuest();
      return;
    }
    
    this.showCurrentResult();
    document.getElementById('results-modal').classList.add('active');
  }

  showCurrentResult() {
    const currentResult = this.results[this.currentResultIndex];
    if (!currentResult) return;
    
    const title = document.getElementById('results-title');
    const content = document.getElementById('results-content');
    const failureProb = document.getElementById('failure-probability');
    
    // Показываем вероятность неудачи
    if (this.failureProbability > 0) {
      failureProb.textContent = `Вероятность неудачи: ${this.failureProbability}%`;
      failureProb.classList.remove('hidden');
    } else {
      failureProb.classList.add('hidden');
    }
    
    // Формируем заголовок
    let titleText = currentResult.title;
    if (currentResult.sector) {
      const sectorName = this.sectors[currentResult.sector].name;
      titleText += ` - ${sectorName} сектор`;
    }
    title.textContent = titleText;
    
    // Формируем содержимое
    let contentHTML = `<div class="story-content">`;
    contentHTML += `<h4>${currentResult.title}</h4>`;
    contentHTML += `<p>${currentResult.content}</p>`;
    
    if (currentResult.member) {
      contentHTML += `<div class="member-info">`;
      contentHTML += `<strong>Проблемный агент:</strong> ${currentResult.member.name}`;
      contentHTML += `<div class="member-traits">`;
      currentResult.member.traits.forEach(trait => {
        contentHTML += `<span class="trait incorrect">${trait}</span>`;
      });
      contentHTML += `</div>`;
      contentHTML += `</div>`;
    }
    
    if (currentResult.canEliminate) {
      contentHTML += `<div class="elimination-info">`;
      contentHTML += `<p><strong>Возможность устранения:</strong> Требуется ${currentResult.eliminationRequirement} агента для устранения угрозы.</p>`;
      contentHTML += `<button class="btn btn-danger" onclick="quest.eliminateThreat('${currentResult.sector}')">Устранить угрозу</button>`;
      contentHTML += `</div>`;
    }
    
    contentHTML += `</div>`;
    content.innerHTML = contentHTML;
    
    // Показываем/скрываем кнопки
    const nextBtn = document.getElementById('next-result');
    const finishBtn = document.getElementById('finish-results');
    
    if (this.currentResultIndex < this.results.length - 1) {
      nextBtn.classList.remove('hidden');
      finishBtn.classList.add('hidden');
    } else {
      nextBtn.classList.add('hidden');
      finishBtn.classList.remove('hidden');
    }
  }

  nextResult() {
    this.currentResultIndex++;
    if (this.currentResultIndex < this.results.length) {
      this.showCurrentResult();
    } else {
      this.finishResults();
    }
  }

  finishResults() {
    this.hideResultsModal();
    this.showFinalSummary();
  }

  showFinalSummary() {
    const summary = this.generateFinalSummary();
    
    const content = `
      <div class="final-summary">
        <h3>🎯 Итоги создания мирового правительства</h3>
        <div class="summary-content">
          ${summary.content}
        </div>
        <div class="summary-stats">
          <div class="stat">
            <span class="stat-label">Общая численность:</span>
            <span class="stat-value">${summary.totalMembers}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Правильные назначения:</span>
            <span class="stat-value">${summary.correctMembers}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Ошибки:</span>
            <span class="stat-value">${summary.incorrectMembers}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Вероятность неудачи:</span>
            <span class="stat-value">${this.failureProbability}%</span>
          </div>
        </div>
        <div class="summary-rating">
          <span class="rating-label">Общий рейтинг:</span>
          <span class="rating-value ${summary.ratingClass}">${summary.rating}</span>
        </div>
      </div>
    `;
    
    this.showStoryModal(summary.title, content);
  }

  generateFinalSummary() {
    let totalMembers = 0;
    let correctMembers = 0;
    let incorrectMembers = 0;
    
    Object.values(this.sectors).forEach(sector => {
      totalMembers += sector.members.length;
      correctMembers += sector.members.filter(m => m.isCorrect).length;
      incorrectMembers += sector.members.filter(m => !m.isCorrect).length;
    });
    
    let rating, ratingClass, content;
    
    if (incorrectMembers === 0 && totalMembers > 0) {
      rating = "S+ - Идеально";
      ratingClass = "rating-perfect";
      content = `
        <p>🎉 Поздравляем! Вы создали идеальное мировое правительство. Все агенты назначены на правильные позиции, 
        система работает безупречно. Мир полностью под вашим контролем.</p>
        <p>🌟 Ваши достижения:</p>
        <ul>
          <li>100% эффективность всех секторов</li>
          <li>Полный контроль над мировой политикой, экономикой и вооруженными силами</li>
          <li>Технологическое превосходство</li>
          <li>Информационная монополия</li>
        </ul>
      `;
    } else if (incorrectMembers <= 2) {
      rating = "A - Отлично";
      ratingClass = "rating-excellent";
      content = `
        <p>🏆 Отличный результат! Ваше мировое правительство работает очень эффективно. 
        Несколько мелких ошибок не влияют на общую эффективность системы.</p>
        <p>✅ Ваши достижения:</p>
        <ul>
          <li>Высокая эффективность всех секторов</li>
          <li>Стабильный контроль над миром</li>
          <li>Минимальные риски</li>
        </ul>
      `;
    } else if (incorrectMembers <= 5) {
      rating = "B - Хорошо";
      ratingClass = "rating-good";
      content = `
        <p>👍 Хороший результат! Ваше мировое правительство функционирует, но есть области для улучшения. 
        Система стабильна, но требует внимания.</p>
        <p>⚠️ Рекомендации:</p>
        <ul>
          <li>Улучшить подбор кадров</li>
          <li>Усилить контроль над проблемными секторами</li>
          <li>Провести реорганизацию</li>
        </ul>
      `;
    } else {
      rating = "C - Удовлетворительно";
      ratingClass = "rating-satisfactory";
      content = `
        <p>⚠️ Удовлетворительный результат. Ваше мировое правительство работает нестабильно. 
        Требуются серьезные изменения для улучшения ситуации.</p>
        <p>🔧 Необходимые действия:</p>
        <ul>
          <li>Полная реорганизация структуры</li>
          <li>Замена неэффективных агентов</li>
          <li>Усиление системы контроля</li>
        </ul>
      `;
    }
    
    return {
      title: "🏛️ Итоги создания мирового правительства",
      content,
      totalMembers,
      correctMembers,
      incorrectMembers,
      rating,
      ratingClass
    };
  }

  showStoryModal(title, content) {
    this.storySystem.playAudio();
    
    // Проверяем, есть ли видео в контенте
    const hasVideo = content.includes('video:');
    if (hasVideo) {
      // Извлекаем название видео из контента
      const videoMatch = content.match(/video:(\w+)/);
      if (videoMatch) {
        const videoId = this.storySystem.getVideoForStory({ video: videoMatch[1] });
        if (videoId) {
          this.storySystem.showVideoBackground(videoId);
        }
      }
    }
    
    document.getElementById('story-title').textContent = title;
    document.getElementById('story-content').innerHTML = content;
    document.getElementById('story-modal').classList.add('active');
  }

  closeStory() {
    document.getElementById('story-modal').classList.remove('active');
    this.storySystem.hideVideoBackground();
    this.storySystem.stopAudio();
  }

  nextStory() {
    // Здесь можно добавить логику для следующего сюжета
    this.closeStory();
  }

  hideResultsModal() {
    document.getElementById('results-modal').classList.remove('active');
  }

  finishQuest() {
    // Возвращаемся на главную страницу квестов
    window.location.href = '../quests.html';
  }

  // Методы для работы с персонажами
  loadCurrentCharacter() {
    if (this.currentCharacterIndex >= this.characters.length) {
      this.currentCharacterIndex = 0;
    }
    
    const character = this.characters[this.currentCharacterIndex];
    if (!character) return;
    
    const characterCard = this.domCache.currentCharacter;
    characterCard.innerHTML = `
      <div class="character-name">${character.name}</div>
      <div class="character-traits">
        ${character.traits.map(trait => `<span class="trait">${trait}</span>`).join('')}
      </div>
      <div class="character-description">${character.description}</div>
    `;
    
    characterCard.setAttribute('data-character-id', character.id);
    characterCard.draggable = true;
    
    this.updateFinishButton();
  }

  skipCharacter() {
    this.currentCharacterIndex++;
    if (this.currentCharacterIndex >= this.characters.length) {
      this.currentCharacterIndex = 0;
    }
    this.loadCurrentCharacter();
  }

  updateFinishButton() {
    const totalMembers = Object.values(this.sectors).reduce((sum, sector) => sum + sector.members.length, 0);
    const totalMax = Object.values(this.sectors).reduce((sum, sector) => sum + sector.max, 0);
    
    this.domCache.finishButton.disabled = totalMembers < totalMax;
  }

  updateSectorCounts() {
    Object.entries(this.sectors).forEach(([sectorType, sector]) => {
      const sectorElement = document.querySelector(`[data-sector="${sectorType}"]`);
      if (sectorElement) {
        const countElement = sectorElement.querySelector('.sector-count');
        if (countElement) {
          countElement.textContent = `${sector.members.length}/${sector.max}`;
        }
        
        // Обновляем список членов
        const membersElement = sectorElement.querySelector('.sector-members');
        if (membersElement) {
          membersElement.innerHTML = sector.members.map(member => 
            `<div class="member-tag" data-member-id="${member.id}">${member.name}</div>`
          ).join('');
        }
        
        // Обновляем стили
        if (sector.members.length >= sector.max) {
          sectorElement.classList.add('filled');
        } else {
          sectorElement.classList.remove('filled');
        }
      }
    });
  }

  // Методы для drag & drop
  setupDragAndDrop() {
    const characterCard = this.domCache.currentCharacter;
    if (!characterCard) return;
    
    this.dragDropHandlers = {
      characterCard: {
        dragStartHandler: (e) => this.handleDragStart(e),
        dragEndHandler: (e) => this.handleDragEnd(e),
        touchStartHandler: (e) => this.handleTouchStart(e),
        touchMoveHandler: (e) => this.handleTouchMove(e),
        touchEndHandler: (e) => this.handleTouchEnd(e),
        clickHandler: (e) => this.handleCharacterClick(e)
      }
    };
    
    // Добавляем обработчики для drag & drop
    characterCard.addEventListener('dragstart', this.dragDropHandlers.characterCard.dragStartHandler);
    characterCard.addEventListener('dragend', this.dragDropHandlers.characterCard.dragEndHandler);
    
    // Добавляем обработчики для touch устройств
    characterCard.addEventListener('touchstart', this.dragDropHandlers.characterCard.touchStartHandler, { passive: false });
    characterCard.addEventListener('touchmove', this.dragDropHandlers.characterCard.touchMoveHandler, { passive: false });
    characterCard.addEventListener('touchend', this.dragDropHandlers.characterCard.touchEndHandler);
    
    // Добавляем обработчик клика для показа деталей
    characterCard.addEventListener('click', this.dragDropHandlers.characterCard.clickHandler);
    
    // Добавляем обработчики для секторов
    this.domCache.sectors.forEach(sector => {
      sector.addEventListener('dragover', (e) => this.handleDragOver(e));
      sector.addEventListener('drop', (e) => this.handleDrop(e));
      sector.addEventListener('dragenter', (e) => this.handleDragEnter(e));
      sector.addEventListener('dragleave', (e) => this.handleDragLeave(e));
      
      // Добавляем touch обработчики для секторов
      sector.addEventListener('touchstart', (e) => this.handleSectorTouchStart(e));
      sector.addEventListener('touchmove', (e) => this.handleSectorTouchMove(e), { passive: false });
      sector.addEventListener('touchend', (e) => this.handleSectorTouchEnd(e));
      
      // Добавляем обработчик клика для показа списка членов
      sector.addEventListener('click', (e) => this.handleSectorClick(e));
    });
  }

  handleDragStart(e) {
    this.draggedElement = e.target;
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
  }

  handleDragEnd(e) {
    e.target.classList.remove('dragging');
    this.draggedElement = null;
  }

  handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  handleDrop(e) {
    e.preventDefault();
    
    if (!this.draggedElement) return;
    
    const sector = e.currentTarget;
    const sectorType = sector.getAttribute('data-sector');
    const characterId = this.draggedElement.getAttribute('data-character-id');
    
    if (sectorType && characterId) {
      this.assignCharacterToSector(characterId, sectorType);
    }
  }

  handleDragEnter(e) {
    e.currentTarget.classList.add('drag-over');
  }

  handleDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
  }

  handleTouchStart(e) {
    e.preventDefault();
    this.touchStartX = e.touches[0].clientX;
    this.touchStartY = e.touches[0].clientY;
    this.touchStartTime = Date.now();
    this.isDragging = false;
    
    // Добавляем класс для визуальной обратной связи
    e.currentTarget.classList.add('touch-active');
  }

  handleTouchMove(e) {
    if (!this.touchStartX) return;
    
    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;
    const deltaX = touchX - this.touchStartX;
    const deltaY = touchY - this.touchStartY;
    
    // Если движение достаточно большое, считаем это drag операцией
    if (Math.abs(deltaX) > 15 || Math.abs(deltaY) > 15) {
      e.preventDefault();
      this.isDragging = true;
      this.draggedElement = e.currentTarget;
      e.currentTarget.classList.add('dragging');
      
      // Показываем визуальную обратную связь
      e.currentTarget.style.transform = 'scale(1.1) rotate(5deg)';
      e.currentTarget.style.opacity = '0.8';
    }
  }

  handleTouchEnd(e) {
    if (!this.draggedElement) return;
    
    const touchEndTime = Date.now();
    const touchDuration = touchEndTime - this.touchStartTime;
    
    // Убираем визуальные эффекты
    e.currentTarget.classList.remove('touch-active', 'dragging');
    e.currentTarget.style.transform = '';
    e.currentTarget.style.opacity = '';
    
    // Если это был drag, а не клик
    if (this.isDragging) {
      // Находим сектор под пальцем
      const touch = e.changedTouches[0];
      const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
      const sector = elementBelow?.closest('.sector');
      
      if (sector) {
        const sectorType = sector.getAttribute('data-sector');
        const characterId = this.draggedElement.getAttribute('data-character-id');
        
        if (sectorType && characterId) {
          this.assignCharacterToSector(characterId, sectorType);
        }
      }
    } else if (touchDuration < 200) {
      // Если касание было коротким, это клик
      this.handleCharacterClick(e);
    }
    
    // Сбрасываем состояние
    this.draggedElement = null;
    this.touchStartX = null;
    this.touchStartY = null;
    this.touchStartTime = null;
    this.isDragging = false;
  }

  // Touch обработчики для секторов
  handleSectorTouchStart(e) {
    e.preventDefault();
    this.sectorTouchStartX = e.touches[0].clientX;
    this.sectorTouchStartY = e.touches[0].clientY;
    this.sectorTouchStartTime = Date.now();
  }

  handleSectorTouchMove(e) {
    if (!this.sectorTouchStartX) return;
    
    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;
    const deltaX = touchX - this.sectorTouchStartX;
    const deltaY = touchY - this.sectorTouchStartY;
    
    // Если движение достаточно большое, предотвращаем скролл
    if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
      e.preventDefault();
    }
  }

  handleSectorTouchEnd(e) {
    const touchEndTime = Date.now();
    const touchDuration = touchEndTime - this.sectorTouchStartTime;
    
    // Если касание было коротким, это клик
    if (touchDuration < 200) {
      this.handleSectorClick(e);
    }
    
    // Сбрасываем состояние
    this.sectorTouchStartX = null;
    this.sectorTouchStartY = null;
    this.sectorTouchStartTime = null;
  }

  handleCharacterClick(e) {
    const characterId = e.currentTarget.getAttribute('data-character-id');
    if (characterId) {
      this.showCharacterDetails(characterId);
    }
  }

  handleSectorClick(e) {
    const sectorType = e.currentTarget.getAttribute('data-sector');
    if (sectorType) {
      this.showSectorMembers(sectorType);
    }
  }

  assignCharacterToSector(characterId, sectorType) {
    const character = this.characters.find(c => c.id === characterId);
    const sector = this.sectors[sectorType];
    
    if (!character || !sector) return;
    
    // Проверяем, не превышен ли лимит сектора
    if (sector.members.length >= sector.max) {
      alert(`Сектор ${sector.name} уже заполнен!`);
      return;
    }
    
    // Проверяем, не назначен ли уже этот персонаж
    const isAlreadyAssigned = Object.values(this.sectors).some(s => 
      s.members.some(m => m.id === characterId)
    );
    
    if (isAlreadyAssigned) {
      alert('Этот персонаж уже назначен в другой сектор!');
      return;
    }
    
    // Определяем, правильно ли назначен персонаж
    const isCorrect = this.isCharacterCorrectForSector(character, sectorType);
    
    // Добавляем персонажа в сектор
    sector.members.push({
      ...character,
      isCorrect,
      assignedSector: sectorType
    });
    
    // Обновляем отображение
    this.updateSectorCounts();
    this.updateFinishButton();
    
    // Загружаем следующего персонажа
    this.skipCharacter();
    
    // Показываем уведомление
    this.showAssignmentNotification(character, sector, isCorrect);
  }

  isCharacterCorrectForSector(character, sectorType) {
    // Логика определения правильности назначения
    const sectorRequirements = {
      political: ['Лидерство', 'Дипломатия', 'Харизма'],
      military: ['Стратегия', 'Тактика', 'Дисциплина'],
      economic: ['Финансы', 'Аналитика', 'Планирование'],
      research: ['Интеллект', 'Креативность', 'Логика'],
      propaganda: ['Коммуникация', 'Психология', 'Творчество']
    };
    
    const requirements = sectorRequirements[sectorType] || [];
    const characterTraits = character.traits.map(t => t.toLowerCase());
    
    return requirements.some(req => 
      characterTraits.some(trait => 
        trait.includes(req.toLowerCase()) || req.toLowerCase().includes(trait)
      )
    );
  }

  showAssignmentNotification(character, sector, isCorrect) {
    const message = isCorrect 
      ? `✅ ${character.name} успешно назначен в ${sector.name} сектор!`
      : `⚠️ ${character.name} назначен в ${sector.name} сектор, но это может быть ошибкой.`;
    
    this.showToast(message, isCorrect ? 'success' : 'warning');
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  }

  // Методы для модальных окон
  showCharacterDetails(characterId) {
    const character = this.characters.find(c => c.id === characterId);
    if (!character) return;
    
    document.getElementById('character-details-name').textContent = character.name;
    document.getElementById('character-details-traits').innerHTML = 
      character.traits.map(trait => `<span class="character-details-trait">${trait}</span>`).join('');
    document.getElementById('character-details-description').textContent = character.description;
    
    document.getElementById('character-details-modal').classList.add('active');
  }

  hideCharacterDetailsModal() {
    document.getElementById('character-details-modal').classList.remove('active');
  }

  showSectorMembers(sectorType) {
    const sector = this.sectors[sectorType];
    if (!sector) return;
    
    document.getElementById('members-title').textContent = `Персонажи в ${sector.name} секторе`;
    
    const membersList = document.getElementById('members-list');
    if (sector.members.length === 0) {
      membersList.innerHTML = '<p>В этом секторе пока нет персонажей.</p>';
    } else {
      membersList.innerHTML = sector.members.map(member => `
        <div class="member-item" data-member-id="${member.id}">
          <div class="member-item-name">${member.name}</div>
          <div class="member-item-traits">
            ${member.traits.map(trait => `<span class="member-item-trait">${trait}</span>`).join('')}
          </div>
        </div>
      `).join('');
    }
    
    document.getElementById('members-modal').classList.add('active');
  }

  hideMembersModal() {
    document.getElementById('members-modal').classList.remove('active');
  }

  // Методы для истребления предателей
  eliminateThreat(sectorType) {
    const sector = this.sectors[sectorType];
    if (!sector) return;
    
    // Находим предателя
    const traitor = sector.members.find(m => !m.isCorrect);
    if (!traitor) return;
    
    // Показываем модальное окно истребления
    this.showEliminationModal(traitor, sectorType);
  }

  showEliminationModal(traitor, sectorType) {
    // Заполняем информацию о предателе
    const traitorCard = document.getElementById('traitor-card');
    traitorCard.innerHTML = `
      <div class="character-name">${traitor.name}</div>
      <div class="character-traits">
        ${traitor.traits.map(trait => `<span class="trait">${trait}</span>`).join('')}
      </div>
    `;
    
    // Заполняем список доступных союзников
    const alliesContainer = document.getElementById('allies-container');
    const availableAllies = Object.values(this.sectors)
      .flatMap(s => s.members)
      .filter(m => m.isCorrect && m.id !== traitor.id);
    
    alliesContainer.innerHTML = availableAllies.map(ally => `
      <div class="ally-card" data-ally-id="${ally.id}" draggable="true">
        <div class="ally-name">${ally.name}</div>
        <div class="ally-traits">
          ${ally.traits.map(trait => `<span class="trait">${trait}</span>`).join('')}
        </div>
      </div>
    `).join('');
    
    // Добавляем обработчики для союзников
    alliesContainer.querySelectorAll('.ally-card').forEach(allyCard => {
      allyCard.addEventListener('dragstart', (e) => this.handleAllyDragStart(e));
      allyCard.addEventListener('dragend', (e) => this.handleAllyDragEnd(e));
    });
    
    // Показываем модальное окно
    document.getElementById('elimination-modal').classList.add('active');
    
    // Сохраняем контекст
    this.currentElimination = { traitor, sectorType, allies: [] };
  }

  hideEliminationModal() {
    document.getElementById('elimination-modal').classList.remove('active');
    this.currentElimination = null;
  }

  handleAllyDragStart(e) {
    e.dataTransfer.setData('text/plain', e.currentTarget.getAttribute('data-ally-id'));
  }

  handleAllyDragEnd(e) {
    // Обработка завершения перетаскивания
  }

  executeElimination() {
    if (!this.currentElimination) return;
    
    const { traitor, sectorType, allies } = this.currentElimination;
    
    // Удаляем предателя из сектора
    const sector = this.sectors[sectorType];
    const traitorIndex = sector.members.findIndex(m => m.id === traitor.id);
    if (traitorIndex !== -1) {
      sector.members.splice(traitorIndex, 1);
    }
    
    // Обновляем отображение
    this.updateSectorCounts();
    this.updateFinishButton();
    
    // Скрываем модальное окно
    this.hideEliminationModal();
    
    // Показываем уведомление
    this.showToast(`✅ Предатель ${traitor.name} успешно устранен!`, 'success');
  }

  // Вспомогательные методы
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  generateCharacters() {
    return [
      {
        id: 'char1',
        name: 'Александр Волков',
        traits: ['Лидерство', 'Стратегия', 'Харизма'],
        description: 'Опытный политик с военным прошлым. Обладает природным авторитетом и способностью принимать сложные решения.'
      },
      {
        id: 'char2',
        name: 'Елена Соколова',
        traits: ['Интеллект', 'Аналитика', 'Логика'],
        description: 'Гениальный ученый-исследователь. Специализируется на квантовой физике и искусственном интеллекте.'
      },
      {
        id: 'char3',
        name: 'Дмитрий Козлов',
        traits: ['Финансы', 'Планирование', 'Аналитика'],
        description: 'Финансовый гений с опытом работы в крупнейших банках мира. Мастер манипуляций на финансовых рынках.'
      },
      {
        id: 'char4',
        name: 'Мария Петрова',
        traits: ['Коммуникация', 'Психология', 'Творчество'],
        description: 'Эксперт по массовым коммуникациям и психологическому воздействию. Создает эффективные пропагандистские кампании.'
      },
      {
        id: 'char5',
        name: 'Сергей Иванов',
        traits: ['Тактика', 'Дисциплина', 'Стратегия'],
        description: 'Высокопоставленный военный офицер с опытом спецопераций. Мастер военной стратегии и тактики.'
      },
      {
        id: 'char6',
        name: 'Анна Сидорова',
        traits: ['Дипломатия', 'Харизма', 'Коммуникация'],
        description: 'Дипломат международного класса. Умеет находить общий язык с любыми лидерами и вести сложные переговоры.'
      },
      {
        id: 'char7',
        name: 'Виктор Морозов',
        traits: ['Креативность', 'Интеллект', 'Логика'],
        description: 'Инновационный исследователь в области биотехнологий. Создает революционные научные решения.'
      },
      {
        id: 'char8',
        name: 'Ольга Новикова',
        traits: ['Психология', 'Творчество', 'Коммуникация'],
        description: 'Эксперт по социальной психологии и массовому сознанию. Специализируется на управлении общественным мнением.'
      },
      {
        id: 'char9',
        name: 'Игорь Лебедев',
        traits: ['Стратегия', 'Лидерство', 'Дисциплина'],
        description: 'Бывший генерал спецслужб. Обладает уникальными навыками в области разведки и контрразведки.'
      },
      {
        id: 'char10',
        name: 'Наталья Воробьева',
        traits: ['Аналитика', 'Планирование', 'Логика'],
        description: 'Экономист-аналитик с глубоким пониманием мировой экономики. Специалист по экономическому планированию.'
      },
      {
        id: 'char11',
        name: 'Артем Соловьев',
        traits: ['Тактика', 'Дисциплина', 'Стратегия'],
        description: 'Командир элитного подразделения спецназа. Мастер проведения сложных военных операций.'
      },
      {
        id: 'char12',
        name: 'Юлия Климова',
        traits: ['Креативность', 'Интеллект', 'Творчество'],
        description: 'Гениальный изобретатель и инженер. Создает технологии будущего, опережающие время на десятилетия.'
      },
      {
        id: 'char13',
        name: 'Роман Соколов',
        traits: ['Финансы', 'Аналитика', 'Стратегия'],
        description: 'Инвестиционный банкир с глобальным мышлением. Специалист по международным финансовым операциям.'
      },
      {
        id: 'char14',
        name: 'Татьяна Морозова',
        traits: ['Психология', 'Коммуникация', 'Харизма'],
        description: 'Эксперт по нейролингвистическому программированию. Мастер манипуляции сознанием и подсознанием.'
      },
      {
        id: 'char15',
        name: 'Андрей Волков',
        traits: ['Лидерство', 'Дипломатия', 'Стратегия'],
        description: 'Бывший посол в ООН. Обладает уникальными связями в международных организациях и дипломатических кругах.'
      }
    ];
  }
}

// Инициализация квеста при загрузке страницы
let quest;
document.addEventListener('DOMContentLoaded', () => {
  quest = new WorldGovernmentQuest();
});

// Оптимизация: очистка ресурсов при уходе со страницы
window.addEventListener('beforeunload', () => {
  if (quest) {
    // Очищаем все обработчики событий
    if (quest.eventListeners) {
      quest.eventListeners.forEach(({ element, handler }) => {
        element.removeEventListener('click', handler);
      });
    }
    
    // Очищаем анимации
    if (quest.animationFrameId) {
      cancelAnimationFrame(quest.animationFrameId);
    }
    
    // Очищаем drag & drop обработчики
    if (quest.dragDropHandlers) {
      const characterCard = quest.domCache.currentCharacter;
      if (characterCard) {
        characterCard.removeEventListener('dragstart', quest.dragDropHandlers.characterCard.dragStartHandler);
        characterCard.removeEventListener('dragend', quest.dragDropHandlers.characterCard.dragEndHandler);
        characterCard.removeEventListener('touchstart', quest.dragDropHandlers.characterCard.touchStartHandler);
        characterCard.removeEventListener('touchmove', quest.dragDropHandlers.characterCard.touchMoveHandler);
        characterCard.removeEventListener('touchend', quest.dragDropHandlers.characterCard.touchEndHandler);
        characterCard.removeEventListener('click', quest.dragDropHandlers.characterCard.clickHandler);
      }
    }
  }
});
