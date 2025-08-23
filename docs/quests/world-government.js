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
      executeButton: document.getElementById('execute-elimination')
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
      'execute-elimination': () => this.executeElimination()
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
    // Теперь показываем информационное окно вместо прямого перехода к игре
    // Логика перехода перенесена в HTML script section
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

  setupDragAndDrop() {
    const characterCard = this.domCache.currentCharacter;
    const sectors = this.domCache.sectors;

    // Оптимизация: используем throttling для touchmove
    let touchMoveThrottle = null;
    let isDragging = false;
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    let originalPosition = null;

    // Drag events для персонажа (PC)
    const dragStartHandler = (e) => {
      this.draggedElement = characterCard;
      characterCard.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    };

    const dragEndHandler = () => {
      characterCard.classList.remove('dragging');
      this.draggedElement = null;
    };

    characterCard.addEventListener('dragstart', dragStartHandler);
    characterCard.addEventListener('dragend', dragEndHandler);

    // Touch events для персонажа (Mobile) - оптимизированные
    const touchStartHandler = (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      touchStartTime = Date.now();
      isDragging = false;
      
      // Сохраняем исходное положение
      const rect = characterCard.getBoundingClientRect();
      originalPosition = { left: rect.left, top: rect.top };
    };

    const touchMoveHandler = (e) => {
      e.preventDefault();
      
      // Throttling для производительности
      if (touchMoveThrottle) return;
      
      touchMoveThrottle = requestAnimationFrame(() => {
        const touch = e.touches[0];
        const deltaX = touch.clientX - touchStartX;
        const deltaY = touch.clientY - touchStartY;
        const touchDuration = Date.now() - touchStartTime;
        
        // Начинаем перетаскивание только если движение достаточно большое или время нажатия достаточное
        if (!isDragging && (Math.abs(deltaX) > 15 || Math.abs(deltaY) > 15 || touchDuration > 300)) {
          isDragging = true;
          characterCard.classList.add('dragging');
          characterCard.style.position = 'fixed';
          characterCard.style.zIndex = '1000';
          characterCard.style.pointerEvents = 'none';
          characterCard.style.transition = 'none';
        }
        
        if (isDragging) {
          characterCard.style.left = (touch.clientX - characterCard.offsetWidth / 2) + 'px';
          characterCard.style.top = (touch.clientY - characterCard.offsetHeight / 2) + 'px';
          
          // Оптимизация: кэшируем elementFromPoint результат
          const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
          const sectorBelow = elementBelow?.closest('.sector');
          
          // Убираем подсветку со всех секторов
          sectors.forEach(s => s.classList.remove('drag-over'));
          
          // Подсвечиваем сектор под пальцем только если он не заполнен
          if (sectorBelow) {
            const sectorType = sectorBelow.dataset.sector;
            const sectorData = this.sectors[sectorType];
            
            if (sectorData.members.length < sectorData.max) {
              sectorBelow.classList.add('drag-over');
            }
          }
        }
        
        touchMoveThrottle = null;
      });
    };

    const touchEndHandler = (e) => {
      e.preventDefault();
      
      if (touchMoveThrottle) {
        cancelAnimationFrame(touchMoveThrottle);
        touchMoveThrottle = null;
      }
      
      const touch = e.changedTouches[0];
      const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
      const sectorBelow = elementBelow?.closest('.sector');
      
      // Убираем подсветку со всех секторов
      sectors.forEach(s => s.classList.remove('drag-over'));
      
      if (isDragging) {
        if (sectorBelow) {
          const sectorType = sectorBelow.dataset.sector;
          const sectorData = this.sectors[sectorType];
          
          if (sectorData.members.length < sectorData.max) {
            // Сбрасываем стили персонажа
            this.resetCharacterStyles(characterCard);
            this.assignCharacterToSector(sectorType);
          } else {
            this.returnCharacterToOriginalPosition(characterCard, originalPosition);
          }
        } else {
          this.returnCharacterToOriginalPosition(characterCard, originalPosition);
        }
      }
      
      isDragging = false;
      originalPosition = null;
    };

    const clickHandler = (e) => {
      if (isDragging) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    characterCard.addEventListener('touchstart', touchStartHandler);
    characterCard.addEventListener('touchmove', touchMoveHandler);
    characterCard.addEventListener('touchend', touchEndHandler);
    characterCard.addEventListener('click', clickHandler);

    // Drop events для секторов (PC) - оптимизированные
    const sectorEventHandlers = {
      dragover: (e) => {
        e.preventDefault();
        const sectorType = e.currentTarget.dataset.sector;
        const sectorData = this.sectors[sectorType];
        
        if (sectorData.members.length < sectorData.max) {
          e.currentTarget.classList.add('drag-over');
        }
      },
      dragleave: (e) => {
        e.currentTarget.classList.remove('drag-over');
      },
      drop: (e) => {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');
        const sectorType = e.currentTarget.dataset.sector;
        const sectorData = this.sectors[sectorType];
        
        if (sectorData.members.length < sectorData.max) {
          this.assignCharacterToSector(sectorType);
        }
      }
    };

    sectors.forEach(sector => {
      Object.entries(sectorEventHandlers).forEach(([event, handler]) => {
        sector.addEventListener(event, handler);
      });
    });

    // Сохраняем ссылки на обработчики для возможности удаления
    this.dragDropHandlers = {
      characterCard: { dragStartHandler, dragEndHandler, touchStartHandler, touchMoveHandler, touchEndHandler, clickHandler },
      sectors: sectorEventHandlers
    };
  }

  assignCharacterToSector(sectorType) {
    const currentCharacter = this.getNextValidCharacter();
    if (!currentCharacter) {
      // Нет подходящих персонажей для размещения
      return;
    }

    const sector = this.sectors[sectorType];

    if (sector.members.length >= sector.max) {
      // Сектор уже заполнен
      return;
    }

    // Проверяем, подходит ли персонаж для этого сектора
    const isCorrect = this.isCharacterCorrectForSector(currentCharacter, sectorType);
    
    sector.members.push({
      ...currentCharacter,
      isCorrect,
      assignedTo: sectorType
    });

    // Оптимизация: группируем обновления DOM
    this.batchDOMUpdates(() => {
      this.updateSectorDisplay(sectorType);
      this.loadNextCharacter();
      this.updateFinishButton();
      this.updateSectorVisibility();
    });
  }

  // Оптимизация: группировка DOM обновлений
  batchDOMUpdates(updates) {
    // Используем requestAnimationFrame для группировки обновлений
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    
    this.animationFrameId = requestAnimationFrame(() => {
      updates();
      this.animationFrameId = null;
    });
  }

  isCharacterCorrectForSector(character, sectorType) {
    // Экономические и исследовательские персонажи взаимозаменяемы
    if (sectorType === 'economic' || sectorType === 'research') {
      return character.correctSector === 'economic' || character.correctSector === 'research';
    }
    return character.correctSector === sectorType;
  }

  updateSectorDisplay(sectorType) {
    const sectorElement = document.querySelector(`[data-sector="${sectorType}"]`);
    const countElement = sectorElement.querySelector('.sector-count');
    const membersElement = sectorElement.querySelector('.sector-members');
    const sector = this.sectors[sectorType];

    countElement.textContent = `${sector.members.length}/${sector.max}`;
    
    // Оптимизация: используем DocumentFragment для группировки DOM операций
    const fragment = document.createDocumentFragment();
    
    if (sector.members.length === 0) {
      membersElement.innerHTML = '';
      return;
    }
    
    if (sector.members.length === 1) {
      const tag = document.createElement('div');
      tag.className = `member-tag ${sector.members[0].isCorrect ? 'correct' : 'incorrect'}`;
      tag.textContent = sector.members[0].name.split(' ')[0];
      tag.title = sector.members[0].name;
      fragment.appendChild(tag);
    } else {
      // Показываем первого и "и другие..."
      const tag = document.createElement('div');
      tag.className = `member-tag ${sector.members[0].isCorrect ? 'correct' : 'incorrect'}`;
      tag.textContent = `${sector.members[0].name.split(' ')[0]} и другие...`;
      tag.title = `Нажмите для просмотра всех ${sector.members.length} персонажей`;
      tag.style.cursor = 'pointer';
      
      // Оптимизация: используем bind для предотвращения создания новых функций
      if (!this.memberClickHandlers) {
        this.memberClickHandlers = new Map();
      }
      
      if (!this.memberClickHandlers.has(sectorType)) {
        this.memberClickHandlers.set(sectorType, () => this.showMembersList(sectorType));
      }
      
      tag.addEventListener('click', this.memberClickHandlers.get(sectorType));
      fragment.appendChild(tag);
    }
    
    // Оптимизация: очищаем и добавляем за одну операцию
    membersElement.innerHTML = '';
    membersElement.appendChild(fragment);
  }

  updateSectorCounts() {
    Object.keys(this.sectors).forEach(sectorType => {
      this.updateSectorDisplay(sectorType);
    });
    this.updateSectorVisibility();
  }

  loadCurrentCharacter() {
    const character = this.getNextValidCharacter();
    const characterCard = this.domCache.currentCharacter;
    
    if (!character) {
      // Если нет подходящих персонажей, показываем сообщение
      characterCard.innerHTML = `
        <div class="character-name">Нет подходящих персонажей</div>
        <div class="character-description">Все доступные секторы заполнены или нет персонажей для оставшихся секторов.</div>
      `;
      characterCard.draggable = false;
      return;
    }

    // Оптимизация: используем template literals для лучшей производительности
    const traitsHTML = character.traits.map(trait => `<span class="trait">${trait}</span>`).join('');
    
    characterCard.innerHTML = `
      <div class="character-name">${character.name}</div>
      <div class="character-traits">${traitsHTML}</div>
      <div class="character-description">${character.description}</div>
    `;
    
    characterCard.draggable = true;
  }

  getNextValidCharacter() {
    // Получаем незаполненные секторы
    const availableSectors = Object.entries(this.sectors).filter(([type, sector]) => 
      sector.members.length < sector.max
    );

    if (availableSectors.length === 0) {
      return null; // Все секторы заполнены
    }

    // Ищем персонажа, который подходит хотя бы к одному из доступных секторов
    let attempts = 0;
    const maxAttempts = this.characters.length * 2; // Максимум 2 полных цикла

    while (attempts < maxAttempts) {
      const character = this.characters[this.currentCharacterIndex];
      
      // Проверяем, подходит ли персонаж к какому-либо из доступных секторов
      for (const [sectorType, sector] of availableSectors) {
        if (this.isCharacterCorrectForSector(character, sectorType)) {
          return character;
        }
      }

      // Если персонаж не подходит, переходим к следующему
      this.currentCharacterIndex++;
      if (this.currentCharacterIndex >= this.characters.length) {
        this.currentCharacterIndex = 0;
      }
      attempts++;
    }

    return null; // Не найден подходящий персонаж
  }

  loadNextCharacter() {
    this.currentCharacterIndex++;
    if (this.currentCharacterIndex >= this.characters.length) {
      this.currentCharacterIndex = 0; // Начинаем сначала
    }
    this.loadCurrentCharacter();
  }

  skipCharacter() {
    this.loadNextCharacter();
  }

  updateFinishButton() {
    const finishButton = document.getElementById('finish-creation');
    const hasMinimumMembers = Object.values(this.sectors).every(sector => 
      sector.members.length >= 2
    );
    
    finishButton.disabled = !hasMinimumMembers;
  }

  startResults() {
    this.generateResults();
    this.currentResultIndex = 0;
    this.showResult();
  }

  generateResults() {
    this.results = [];
    this.failureProbability = 0;

    // Анализируем каждую ошибку для расчета вероятности неудачи
    Object.entries(this.sectors).forEach(([sectorType, sector]) => {
      const incorrectMembers = sector.members.filter(member => !member.isCorrect);
      
      incorrectMembers.forEach(member => {
        const sectorWeight = this.getSectorWeight(sectorType);
        this.failureProbability += sectorWeight * 15;
      });
    });

    // Используем новую систему сюжетов в стиле Эпштейна
    const epsteinStory = this.storySystem.getEpsteinFinaleStory(this.sectors, this.failureProbability);
    
    // Преобразуем фазы в результаты
    if (epsteinStory && epsteinStory.phases) {
      epsteinStory.phases.forEach((phase, index) => {
        this.results.push({
          title: `${epsteinStory.title} - ${phase.title}`,
          content: phase.content,
          rewards: phase.rewards,
          type: index === 0 ? 'main' : 'continuation',
          isEpsteinStory: true
        });
      });
    } else {
      // Fallback на случай если что-то пошло не так
      this.results.push({
        title: "🔺 ОПЕРАЦИЯ ЗАВЕРШЕНА",
        content: `Ваша теневая сеть ${this.failureProbability <= 30 ? 'успешно установила контроль над мировым порядком' : 'столкнулась с серьёзными проблемами'}. 
        
Вероятность провала: ${this.failureProbability}%`,
        rewards: { mulacoin: Math.max(100, 1000 - this.failureProbability * 10), exp: Math.max(200, 2000 - this.failureProbability * 20) },
        type: 'fallback'
      });
    }
  }

  getSectorWeight(sectorType) {
    const weights = {
      political: 1.0,    // Самый важный
      military: 0.8,     // Очень важный
      economic: 0.6,     // Важный
      propaganda: 0.4,   // Средний
      research: 0.2      // Менее важный
    };
    return weights[sectorType] || 0.5;
  }



  showResult() {
    if (this.currentResultIndex >= this.results.length) {
      // Показываем финальный результат
      this.showFinalResult();
      return;
    }

    const result = this.results[this.currentResultIndex];
    const modal = document.getElementById('results-modal');
    const title = document.getElementById('results-title');
    const content = document.getElementById('results-content');
    const nextButton = document.getElementById('next-result');
    const finishButton = document.getElementById('finish-results');
    const probabilityDiv = document.getElementById('failure-probability');

    title.textContent = result.title;
    content.innerHTML = `<p>${result.content}</p>`;

    // Проверяем, можно ли истребить угрозу
    if (result.type === 'error' && result.canEliminate) {
      const correctMembers = this.sectors[result.sector].members.filter(m => m.isCorrect);
      const canEliminate = correctMembers.length >= result.eliminationRequirement;
      
      if (canEliminate) {
        content.innerHTML += `
          <div style="margin-top: 15px;">
            <button class="btn btn-primary" onclick="quest.eliminateThreat('${result.sector}', '${result.member ? result.member.name : 'угроза'}')">
              Истребить угрозу
            </button>
          </div>
        `;
      }
    }

    // Показываем вероятность неудачи
    if (this.failureProbability > 0) {
      probabilityDiv.textContent = `Вероятность неудачи: ${Math.min(this.failureProbability, 100).toFixed(1)}%`;
      probabilityDiv.classList.remove('hidden');
    } else {
      probabilityDiv.classList.add('hidden');
    }

    // Показываем кнопку "Далее" для всех сюжетов кроме финальных
    if (result.type && result.type.startsWith('final_')) {
      nextButton.classList.add('hidden');
      finishButton.classList.remove('hidden');
    } else {
      nextButton.classList.remove('hidden');
      finishButton.classList.add('hidden');
    }
    
    modal.classList.add('active');
  }

  eliminateThreat(sectorType, memberName) {
    // Находим предателя
    const traitor = this.sectors[sectorType].members.find(m => m.name === memberName);
    if (!traitor) return;

    // Находим правильных членов сектора для истребления
    const correctMembers = this.sectors[sectorType].members.filter(m => m.isCorrect);
    
    // Определяем количество требуемых союзников
    const requiredCount = sectorType === 'research' ? 3 : 2;
    
    if (correctMembers.length >= requiredCount) {
      // Показываем окно истребления
      this.showEliminationModal(traitor, correctMembers, requiredCount);
    } else {
      // Недостаточно сил для истребления
      const content = document.getElementById('results-content');
      content.innerHTML = `
        <p style="color: var(--error); font-weight: bold;">❌ Недостаточно сил для истребления!</p>
        <p>Для истребления ${memberName} требуется минимум ${requiredCount} правильных членов в ${this.sectors[sectorType].name} секторе.</p>
        <p>Текущее количество: ${correctMembers.length}</p>
        <p style="color: var(--warning); font-weight: bold;">Угроза остается активной...</p>
      `;
    }
  }

  nextResult() {
    this.currentResultIndex++;
    this.showResult();
  }

  showFailureResult() {
    const modal = document.getElementById('results-modal');
    const title = document.getElementById('results-title');
    const content = document.getElementById('results-content');
    const nextButton = document.getElementById('next-result');
    const finishButton = document.getElementById('finish-results');

    title.textContent = 'Провал миссии!';
    title.style.color = 'var(--error)';
    content.innerHTML = `
      <p style="color: var(--error); font-weight: 600;">
        К сожалению, создать мировое тайное правительство не удалось.
      </p>
      <p>Слишком много ошибок в подборе персонала привело к внутренним конфликтам и развалу организации.</p>
    `;

    nextButton.classList.add('hidden');
    finishButton.classList.remove('hidden');
    
    modal.classList.add('active');
  }

  showFinalResult() {
    const modal = document.getElementById('results-modal');
    const title = document.getElementById('results-title');
    const content = document.getElementById('results-content');
    const nextButton = document.getElementById('next-result');
    const finishButton = document.getElementById('finish-results');

    // Определяем финальный результат
    let finalStory;
    if (this.failureProbability >= 80) {
      finalStory = this.storySystem.generateFinalStories().find(story => story.type === 'final_failure');
    } else {
      const totalCorrect = Object.values(this.sectors).reduce((sum, sector) => 
        sum + sector.members.filter(m => m.isCorrect).length, 0
      );

      if (totalCorrect >= 12) {
        finalStory = this.storySystem.generateFinalStories().find(story => story.type === 'final_success');
      } else if (totalCorrect >= 9) {
        finalStory = this.storySystem.generateFinalStories().find(story => story.type === 'final_partial');
      } else if (totalCorrect >= 6) {
        finalStory = this.storySystem.generateFinalStories().find(story => story.type === 'final_minimal');
      } else {
        finalStory = this.storySystem.generateFinalStories().find(story => story.type === 'final_failure');
      }
    }

    title.textContent = finalStory.title;
    title.style.color = finalStory.type === 'final_failure' ? 'var(--error)' : 'var(--success)';
    
    content.innerHTML = `
      <p>${finalStory.content}</p>
      <div style="margin-top: 20px; padding: 15px; background: var(--bg1); border-radius: var(--radius-sm);">
        <h4>Итоговая статистика:</h4>
        ${Object.entries(this.sectors).map(([type, sector]) => 
          `<div>${sector.name}: ${sector.members.length}/${sector.max} (${sector.members.filter(m => m.isCorrect).length} правильных)</div>`
        ).join('')}
        <div style="margin-top: 10px; font-weight: bold;">
          Вероятность неудачи: ${this.failureProbability.toFixed(1)}%
        </div>
      </div>
    `;

    nextButton.classList.add('hidden');
    finishButton.classList.remove('hidden');
    
    modal.classList.add('active');
  }

  finishQuest() {
    // Выдаем награды
    if (this.failureProbability < 80) {
      this.giveRewards();
    }
    
    // Закрываем модальное окно
    document.getElementById('results-modal').classList.remove('active');
    
    // Можно добавить редирект или другие действия
    // Квест завершен! Награды выданы
  }

  giveRewards() {
    // Здесь должна быть интеграция с системой наград
    // console.log('Выдано: 500 MULACOIN и 1000 опыта');
    // В реальном приложении здесь был бы API вызов
  }

  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  generateCharacters() {
    const characters = [];

    // ПОЛИТИЧЕСКИЙ ШТАБ - 30 персонажей
    // Тип 1: Лидер-организатор (15 персонажей)
    const politicalType1Names = [
      'Билл Клинтон', 'Хиллари Родэм', 'Джордж Буш', 'Барак Обама', 'Дональд Трамп',
      'Джо Байден', 'Нэнси Пелоси', 'Митч Макконнелл', 'Александр Петров', 'Елена Соколова',
      'Михаил Козлов', 'Анна Морозова', 'Дмитрий Волков', 'Мария Новикова', 'Сергей Лебедев'
    ];

    const politicalType1Traits = [
      ['Сверхценная идея', 'Упорядоченность', 'Волевые характеристики', 'Целеустремленность'],
      ['Самопожертвование', 'Самостоятельность', 'Неготовность преступить', 'Низкая эмпатия'],
      ['Психосаморегуляция', 'Ровность настроения', 'Честолюбие', 'Аналитический ум'],
      ['Дисциплинированность', 'Пунктуальность', 'Алгоритмизация', 'Слабая переключаемость'],
      ['Патриотизм', 'Подчинение долгу', 'Понятия чести', 'Громкий голос'],
      ['Быстрый темп речи', 'Конфликтность', 'Агрессивность', 'Средство достижения цели'],
      ['Нарушение корпоративных норм', 'Эмоциональное отвержение', 'Ломка стереотипов', 'Неожиданные поручения'],
      ['Личные просьбы', 'Требования с угрозой', 'Психические нагрузки', 'Спад настроения'],
      ['Крепкое телосложение', 'Активность', 'Энергичность', 'Практичная одежда'],
      ['Строгий стиль', 'Постоянное движение', 'Ровная осанка', 'Уверенность в движениях'],
      ['Средняя пластичность', 'Четкие движения', 'Выверенные действия', 'Готовность к руководству'],
      ['Развитые организаторские способности', 'Требовательность к себе', 'Быстрые решения', 'Стремление доминировать'],
      ['Эгоцентризм', 'Жестокость', 'Нетерпимость', 'Нечувствительность к горю'],
      ['Чрезмерная требовательность', 'Раздражительность', 'Ревность', 'Злопамятность'],
      ['Сутяжничество', 'Оперативное реагирование', 'Слабое планирование', 'Тяга к регламентации']
    ];

    politicalType1Names.forEach((name, index) => {
      const descriptions = [
        'Крепкого телосложения, активный и энергичный. Громкий голос, быстрый ровный темп речи.',
        'Одевается практично и строго. Постоянно в движении с ровной осанкой.',
        'Уверенность в движениях, средняя пластичность. Четкие и выверенные действия.',
        'Готовность к руководству, развитые организаторские способности. Требователен к себе.',
        'Быстро принимает решения, стремится доминировать. Эгоцентричен и жесток.',
        'Нетерпим к инакомыслию, нечувствителен к чужому горю. Чрезмерно требователен.',
        'Раздражителен, ревнив и злопамятен. Склонен к сутяжничеству.',
        'Оперативно реагирует, но слабо планирует. Тяготеет к регламентации.',
        'Холерический темперамент, четкая и громкая речь. Организован и понятен.',
        'Добросовестно выполняет нормы ритуального общения. Не раскрывается в общении.',
        'Стремится познать других, но не понимает эмоционального общения.',
        'В общении либо доминирует, либо подчиняется. Изменяет порядки и ломает правила.',
        'Самостоятелен в принятии решений. Жестко конкурирует с равными по силе.',
        'Ограничивает возможность проявлять авторитет. Критикует действия других.',
        'Насмехается над недостатками. Избегает повседневной работы с длительными усилиями.'
      ];
      
      characters.push({
        name: name,
        traits: politicalType1Traits[index],
        description: descriptions[index],
        correctSector: 'political'
      });
    });

    // Тип 2: Адаптивный последователь (15 персонажей)
    const politicalType2Names = [
      'Ольга Смирнова', 'Андрей Попов', 'Татьяна Соколова', 'Владимир Морозов', 'Ирина Козлова',
      'Николай Волков', 'Светлана Лебедева', 'Павел Новиков', 'Екатерина Смирнова', 'Алексей Попов',
      'Наталья Соколова', 'Игорь Морозов', 'Людмила Козлова', 'Виктор Жуков', 'Анна Романова'
    ];

    const politicalType2Traits = [
      ['Осторожность', 'Неверие в себя', 'Зависимость', 'Высокая адаптация'],
      ['Неспособность постоять за себя', 'Копирование поведения', 'Аналитический потенциал', 'Эмпатийный потенциал'],
      ['Ведомая роль', 'Вопросительные интонации', 'Тихий голос', 'Медленный темп речи'],
      ['Зависимость от собеседника', 'Количество пауз', 'Темп речи', 'Медленный темп'],
      ['Переложение ответственности', 'Критика решений', 'Открытые конфликты', 'Отстаивание точки зрения'],
      ['Быстрая адаптация', 'Сила воли', 'Физическое напряжение', 'Психическое напряжение'],
      ['Диапазон внешности', 'Официальный стиль', 'Спортивный стиль', 'Аккуратность'],
      ['Средняя аккуратность', 'Большая аккуратность', 'Выражение готовности', 'Прислушивание'],
      ['Средняя пластичность', 'Высокая пластичность', 'Неторопливые движения', 'Плавные движения'],
      ['Создание впечатления', 'Готовность к действию', 'Внимательность', 'Реактивность'],
      ['Склонность к подражанию', 'Аналитические способности', 'Эмпатийные способности', 'Адаптивность'],
      ['Неуверенность', 'Зависимость от лидера', 'Копирование поведения', 'Аналитический потенциал'],
      ['Эмпатийный потенциал', 'Ведомость', 'Подчинение', 'Адаптация к группе'],
      ['Быстрое переключение', 'Проявление воли', 'Напряжение', 'Стрессоустойчивость'],
      ['Ответственность', 'Критика', 'Конфликты', 'Адаптация к новому']
    ];

    politicalType2Names.forEach((name, index) => {
      const descriptions = [
        'Диапазон внешности сильно варьируется. Стиль от официального до спортивного.',
        'Аккуратность от средней до большой. На лице выражение готовности.',
        'Создается впечатление, что он прислушивается. Ведомая роль в общении.',
        'Вопросительные интонации даже в утвердительных предложениях. Тихий голос.',
        'Медленный темп речи, зависит от собеседника. Количество пауз варьируется.',
        'Осторожен, не верит в себя. Высокая адаптация к новым условиям.',
        'Неспособен постоять за себя. Копирует поведение лидера.',
        'Значительный аналитический потенциал. Развитые эмпатийные способности.',
        'Средняя пластичность, высокий уровень пластичности. Неторопливые движения.',
        'Плавные движения, создает впечатление готовности к действию.',
        'Внимателен и реактивен. Склонен к подражанию и анализу.',
        'Неуверен в себе, зависим от лидера. Быстро адаптируется к группе.',
        'Проявляет волю в напряженных ситуациях. Стрессоустойчив.',
        'Перекладывает ответственность на других. Критикует уже принятые решения.',
        'Избегает открытых конфликтов. Не отстаивает свою точку зрения.'
      ];
      
      characters.push({
        name: name,
        traits: politicalType2Traits[index],
        description: descriptions[index],
        correctSector: 'political'
      });
    });

    // ВОЕННЫЙ ШТАБ - 30 персонажей
    // Тип 1: Энергичный доминант (15 персонажей)
    const militaryType1Names = [
      'Джордж Паттон', 'Дуайт Эйзенхауэр', 'Дуглас Макартур', 'Норман Шварцкопф', 'Колин Пауэлл',
      'Джеймс Мэттис', 'Майкл Флинн', 'Виктор Жуков', 'Анна Романова', 'Игорь Степанов',
      'Марина Ковалева', 'Алексей Тихонов', 'Елена Федорова', 'Дмитрий Соловьев', 'Ольга Медведева'
    ];

    const militaryType1Traits = [
      ['Психоэнергетический потенциал', 'Высокая активность', 'Экстремальные ситуации', 'Гневливость'],
      ['Взрывчатость', 'Готовность обвинять', 'Придирчивость', 'Злопамятность'],
      ['Мстительность', 'Консервативность', 'Организаторские способности', 'Требовательность'],
      ['Придирчивость к окружающим', 'Придирчивость к себе', 'Случайные знакомства', 'Быстрые решения'],
      ['Стремление доминировать', 'Эгоцентризм', 'Жестокость', 'Нетерпимость к инакомыслию'],
      ['Нечувствительность к горю', 'Чрезмерная требовательность', 'Раздражительность', 'Ревность'],
      ['Сутяжничество', 'Слабая злоба', 'Оперативное реагирование', 'Слабое планирование'],
      ['Тяга к регламентации', 'Холерический темперамент', 'Четкая речь', 'Громкая речь'],
      ['Организованная речь', 'Понятная речь', 'Ритуальное общение', 'Нераскрытие'],
      ['Познание других', 'Эмоциональное общение', 'Доминирование', 'Подчинение'],
      ['Изменение порядков', 'Ломка правил', 'Самостоятельность', 'Жесткая конкуренция'],
      ['Ограничение авторитета', 'Критика действий', 'Насмешки', 'Повседневная работа'],
      ['Длительные усилия', 'Ущемление прав', 'Неподчинение', 'Измена близкого'],
      ['Нормальное телосложение', 'Среднее телосложение', 'Аккуратная одежда', 'Классический стиль'],
      ['Низкая пластичность', 'Резкие движения', 'Порывистые движения', 'Средний уровень активности']
    ];

    militaryType1Names.forEach((name, index) => {
      const descriptions = [
        'Нормального среднего телосложения. Одет аккуратно в классическом стиле.',
        'Говорит четко и громко. Речь хорошо организована и понятна.',
        'Добросовестно выполняет нормы ритуального общения. Не раскрывается.',
        'Стремится познать других, но не понимает эмоционального общения.',
        'В общении либо доминирует, либо подчиняется. Значительный психоэнергетический потенциал.',
        'Высокий уровень активности. Активизируется в экстремальных ситуациях.',
        'Гневлив, взрывоопасен, готов обвинять. Придирчив и злопамятен.',
        'Мстителен, консервативен в отношениях. Развитые организаторские способности.',
        'Требователен к окружающим и себе. Не склонен к случайным знакомствам.',
        'Быстро принимает решения, стремится доминировать. Эгоцентричен и жесток.',
        'Нетерпим к инакомыслию, нечувствителен к чужому горю. Чрезмерно требователен.',
        'Раздражителен из-за отсутствия у других его положительных черт. Ревнив и злопамятен.',
        'Периодические вспышки слабомотивированной злобы. Склонен к сутяжничеству.',
        'Способен к оперативному реагированию. Слабые способности к планированию.',
        'Тяготеет к регламентации. Близок к холерическому типу темперамента.'
      ];
      
      characters.push({
        name: name,
        traits: militaryType1Traits[index],
        description: descriptions[index],
        correctSector: 'military'
      });
    });

    // Тип 2: Фанатичный идеолог (15 персонажей)
    const militaryType2Names = [
      'Сергей Егоров', 'Наталья Лебедева', 'Алексей Соколов', 'Елена Петрова', 'Дмитрий Новиков',
      'Татьяна Лебедева', 'Алексей Соколов', 'Елена Петрова', 'Сергей Морозов', 'Ольга Волкова',
      'Игорь Петров', 'Марина Козлова', 'Сергей Морозов', 'Ольга Волкова', 'Дмитрий Новиков'
    ];

    const militaryType2Traits = [
      ['Сверхценные идеи', 'Волевые характеристики', 'Целеустремленность', 'Пренебрежение интересами'],
      ['Самопожертвование', 'Автономность', 'Самостоятельность', 'Готовность преступить'],
      ['Четкое позиционирование', 'Чужие и свои', 'Жестокость', 'Равнодушие'],
      ['Навязывание точки зрения', 'Бескомпромиссность', 'Фанатичность', 'Агрессивность'],
      ['Раздражительность', 'Склонность к обвинениям', 'Альтруизм', 'Низкая эмпатия'],
      ['Психосаморегуляция', 'Ровность настроения', 'Честолюбие', 'Непоследовательность'],
      ['Вспышки раздражительности', 'Обидчивость', 'Придирчивость', 'Недовольство'],
      ['Грубость', 'Замкнутость', 'Безразличие', 'Громкий тон голоса'],
      ['Ровный тон', 'Средний темп речи', 'Конфликтность', 'Средство достижения цели'],
      ['Агрессивность в общении', 'Корпоративные нормы', 'Эмоциональное отвержение', 'Ломка стереотипов'],
      ['Неожиданные поручения', 'Личные просьбы', 'Требования с угрозой', 'Психические нагрузки'],
      ['Спад настроения', 'Крепкое телосложение', 'Активность', 'Энергичность'],
      ['Практичная одежда', 'Удобная одежда', 'Постоянное движение', 'Целесообразность'],
      ['Внешнее впечатление', 'Средняя пластичность', 'Неторопливые движения', 'Уверенные движения'],
      ['Ориентация на цель', 'Формирование идей', 'Руководство идеями', 'Самопожертвование во имя идеи']
    ];

    militaryType2Names.forEach((name, index) => {
      const descriptions = [
        'Среднего или крепкого телосложения, активный и энергичный. Одевается практично и удобно.',
        'Постоянно в движении. Ориентируется на целесообразность, а не на внешнее впечатление.',
        'Громкий, ровный тон голоса, средний темп речи. Конфликтен в общении на значимые цели.',
        'Общение для него средство достижения цели. Агрессивен в общении с оппонентами.',
        'Склонен к формированию сверхценных идей. Предельно развитые волевые характеристики.',
        'Целеустремлен, пренебрегает интересами окружающих. Способен к самопожертвованию во имя идеи.',
        'Автономен, самостоятелен, готов преступить нормы и законы. Четко позиционирует окружающих.',
        'Разделяет на "чужих" и "своих". Жестокость к чужим, равнодушие ко всему остальному.',
        'Склонен к навязыванию своей точки зрения. Бескомпромиссен и фанатичен.',
        'Агрессивен по отношению к чужим, раздражителен. Склонен к обвинениям.',
        'Альтруистичен по отношению ко всему человечеству. Низкий уровень развития эмпатии.',
        'Навыки психосаморегуляции, ровность настроения. Честолюбив и непоследователен.',
        'Вспышки раздражительности, обидчивости и придирчивости. Проявляет недовольство и грубость.',
        'Замкнут и безразличен. Корпоративные нормы важны для него.',
        'Эмоциональное отвержение со стороны значимых людей. Коренная ломка жизненных стереотипов.'
      ];
      
      characters.push({
        name: name,
        traits: militaryType2Traits[index],
        description: descriptions[index],
        correctSector: 'military'
      });
    });

    // ЭКОНОМИЧЕСКИЙ/ИССЛЕДОВАТЕЛЬСКИЙ ШТАБ - 45 персонажей
    // Тип 1: Меланхолик-пессимист (15 персонажей)
    const economicType1Names = [
      'Джеффри Эпштейн', 'Бернард Мэдофф', 'Уоррен Баффет', 'Джордж Сорос', 'Билл Гейтс',
      'Джефф Безос', 'Артем Борисов', 'Алина Соколова', 'Максим Козлов', 'Дарья Морозова',
      'Роман Волков', 'Ангелина Новикова', 'Кирилл Лебедев', 'Полина Смирнова', 'Андрей Ковалев'
    ];

    const economicType1Traits = [
      ['Слабая энергетичность', 'Быстрая утомляемость', 'Пониженный фон настроения', 'Неустойчивая эмоциональность'],
      ['Ранимость', 'Обидчивость', 'Неудачливость', 'Капризность'],
      ['Плаксивость', 'Вялость', 'Неуверенность в себе', 'Застенчивость'],
      ['Пугливость', 'Неспособность постоять за себя', 'Настороженность', 'Критическая фиксация'],
      ['Отрицательные стороны', 'Меланхолический темперамент', 'Средство изложения жалоб', 'Претензии'],
      ['Невероятные сообщения', 'Тихий голос', 'Медленный темп', 'Средний темп'],
      ['Близкий к медленному', 'Частые паузы', 'Короткие паузы', 'Открытые конфликты'],
      ['Отстаивание точки зрения', 'Насмешки над слабостями', 'Насмешки над ошибками', 'Неумелые действия'],
      ['Активное общение', 'Большое количество людей', 'Быстрое переключение', 'Сила воли'],
      ['Физическое напряжение', 'Психическое напряжение', 'Недостаток информации', 'Нейтральный стиль'],
      ['Средняя аккуратность', 'Недовольство на лице', 'Расстройство', 'Спокойствие'],
      ['Агрессивные эмоции', 'Средняя пластичность', 'Медленные движения', 'Неторопливые движения'],
      ['Склонность к жалобам', 'Потрясание слушателей', 'Невероятные сообщения', 'Тихий голос'],
      ['Медленный темп речи', 'Частые паузы', 'Короткие паузы', 'Эмоциональная неустойчивость'],
      ['Ранимость', 'Обидчивость', 'Неудачливость', 'Меланхолический тип']
    ];

    economicType1Names.forEach((name, index) => {
      const descriptions = [
        'Одевается в нейтральном стиле. Степень аккуратности внешнего вида средняя.',
        'На лице выражение недовольства и расстройства. Не склонен проявлять агрессивные эмоции.',
        'Общение признает как средство изложения жалоб и претензий. Любит потрясать слушающих.',
        'Самый тихий по громкости и медленный по темпу голос. Темп речи средний, ближе к медленному.',
        'Речь отличается частыми, но короткими паузами. Слабая энергетичность.',
        'Быстрая утомляемость, пониженный фон настроения. Неустойчивая эмоциональность.',
        'Раним и обидчив, неудачлив. Капризен и плаксив.',
        'Вял, неуверен в себе, застенчив. Пуглив, неспособен постоять за себя.',
        'Насторожен, критически фиксирует внимание на отрицательных сторонах жизни.',
        'Близок к меланхолическому типу темперамента. Открытые конфликты вызывают стресс.',
        'Насмешки над слабостями и ошибками болезненны. Неумелые действия вызывают дискомфорт.',
        'Вынужденное активное общение с большим количеством людей истощает.',
        'Необходимость быстрого переключения в работе вызывает напряжение. Требует проявления силы воли.',
        'Внезапное или длительное физическое и психическое напряжение непереносимо.',
        'Работа в условиях недостатка исходной информации вызывает тревогу.'
      ];
      
      characters.push({
        name: name,
        traits: economicType1Traits[index],
        description: descriptions[index],
        correctSector: 'economic'
      });
    });

    // Тип 2: Циничный рационалист (15 персонажей)
    const economicType2Names = [
      'Альберт Эйнштейн', 'Никола Тесла', 'Томас Эдисон', 'Исаак Ньютон', 'Чарльз Дарвин',
      'Мария Кюри', 'Дмитрий Менделеев', 'Иван Павлов', 'Сергей Королев', 'Андрей Сахаров',
      'Лев Ландау', 'Петр Капица', 'Владимир Вернадский', 'Александр Попов', 'Михаил Ломоносов'
    ];

    const economicType2Traits = [
      ['Смены фаз', 'Гипертимность', 'Гипотимность', 'Болезненная независимость'],
      ['Цинизм', 'Рациональность', 'Эмоциональная неразвитость', 'Психоэнергетический потенциал'],
      ['Кратковременный потенциал', 'Высокая активность', 'Гневливость', 'Готовность обвинять'],
      ['Дистанционирование', 'Неразвитые организаторские способности', 'Требовательность', 'Случайные знакомства'],
      ['Быстрые решения', 'Стремление понимать', 'Эгоцентризм', 'Равнодушие'],
      ['Терпимость к инакомыслию', 'Нечувствительность к горю', 'Стратегическое планирование', 'Слабая организация'],
      ['Быстрая речь', 'Четкая речь', 'Громкая речь', 'Быстрый темп'],
      ['Средние показатели', 'Организованная речь', 'Понятная речь', 'Ритуальное общение'],
      ['Нераскрытие', 'Познание других', 'Эмоциональное общение', 'Автономность'],
      ['Негативная реакция на давление', 'Сближение', 'Низкий интеллектуальный потенциал', 'Активная деятельность'],
      ['Гипотимная стадия', 'Малоосознаваемый конфликт', 'Среднее телосложение', 'Худощавое телосложение'],
      ['Свободный стиль', 'Слабое чувство вкуса', 'Низкая пластичность', 'Резкие движения'],
      ['Порывистые движения', 'Громкий голос', 'Быстрый темп', 'Изменение показателей'],
      ['Средние показатели', 'Организованность', 'Понятность', 'Трудности с ритуалами'],
      ['Стремление к познанию', 'Непонимание эмоций', 'Автономность в общении', 'Стратегическое мышление']
    ];

    economicType2Names.forEach((name, index) => {
      const descriptions = [
        'Среднего или худощавого телосложения. В одежде предпочитает свободный стиль.',
        'Чувство вкуса в одежде выражено слабо. Уровень пластичности ниже среднего.',
        'Движения резкие и порывистые. Говорит быстро, четко и громко.',
        'Громкий голос и быстрый темп. Часто изменяется на средние показатели.',
        'Речь организована и понятна. С трудом выполняет нормы ритуального общения.',
        'Не раскрывается, стремится глубоко познать других. Не понимает эмоционального общения.',
        'В общении склонен к автономности. Смены фаз гипертимности и гипотимности.',
        'Болезненное стремление к независимости. Циничен и рационален.',
        'Эмоционально неразвит. Значительный, но кратковременный психоэнергетический потенциал.',
        'Высокий уровень активности, гневлив. Готов обвинять и дистанцироваться.',
        'Неразвитые организаторские способности. Требователен к окружающим.',
        'Склонен к случайным знакомствам. Быстро принимает решения.',
        'Стремление понимать как базовое. Эгоцентричен и равнодушен.',
        'Терпим к инакомыслию, нечувствителен к чужому горю. Способен к стратегическому планированию.',
        'Слабые способности к организации деятельности. Негативно реагирует на давление.'
      ];
      
      characters.push({
        name: name,
        traits: economicType2Traits[index],
        description: descriptions[index],
        correctSector: 'research'
      });
    });

    // Тип 3: Интроверт-мыслитель (15 персонажей)
    const economicType3Names = [
      'Стивен Хокинг', 'Ричард Фейнман', 'Пол Дирак', 'Вернер Гейзенберг', 'Нильс Бор',
      'Макс Планк', 'Эрвин Шредингер', 'Вольфганг Паули', 'Энрико Ферми', 'Роберт Оппенгеймер',
      'Андрей Колмогоров', 'Александр Александров', 'Израиль Гельфанд', 'Владимир Арнольд', 'Григорий Перельман'
    ];

    const economicType3Traits = [
      ['Яркая интровертность', 'Мрачность', 'Пессимизм', 'Нелюдимость'],
      ['Богатство внутреннего мира', 'Противодействие манипулированию', 'Самодостаточность', 'Погруженность в мысли'],
      ['Личное мировосприятие', 'Независимость мнения', 'Объективная оценка', 'Низкое социальное взаимодействие'],
      ['Мыслительное начало', 'Познавательное начало', 'Богатство идей', 'Вторичность внешнего мира'],
      ['Нетребовательность к комфорту', 'Хорошая память', 'Слабая энергетичность', 'Эмоциональная бедность'],
      ['Малозависимость эмоций', 'Отсутствие честолюбия', 'Неавторитарность', 'Трудности с общением'],
      ['Замкнутость', 'Эмоциональная холодность', 'Рассудочность', 'Эгоизм'],
      ['Неспособность замечать беду', 'Самолюбие', 'Ранимость при критике', 'Система ценностей'],
      ['Малоактивность', 'Малоэнергетичность', 'Низкий потенциал работоспособности', 'Высокий потенциал эффективности'],
      ['Устоявшиеся связи', 'Неэффективная деятельность', 'Ограниченное время', 'Флегматический темперамент'],
      ['Слабо артикулированная речь', 'Рваная речь', 'Плохо модулированная речь', 'Задержки'],
      ['Паузы', 'Избирательность в общении', 'Богатый словарный запас', 'Низкая сложность речи'],
      ['Ограниченный круг общения', 'Средство вербализации', 'Понимание мира', 'Установление контакта'],
      ['Смена стереотипов', 'Ломка привычек', 'Неформальные контакты', 'Разговор по душам'],
      ['Руководство людьми', 'Интеллектуальная работа', 'Спланированные схемы', 'Групповая деятельность']
    ];

    economicType3Names.forEach((name, index) => {
      const descriptions = [
        'Крепкого телосложения, пассивный и неэнергичный. Внешне замкнут.',
        'Мимика слабовыраженная. На лице выражение замкнутости и погруженности.',
        'Неаккуратен в одежде. В выборе зависит от окружающих.',
        'Предпочитает мешковатый, свободный стиль. Уровень пластичности низкий.',
        'Движения медленные и неловкие. Много и беспорядочно двигается.',
        'Задевает предметы. Ярко выраженная интровертность.',
        'Мрачен, пессимистичен, нелюдим. Богатство внутреннего мира.',
        'Предельно высоко развиты способности противостояния манипулированию. Самодостаточен.',
        'Погружен в свои мысли и личное мировосприятие. Независимость мнения.',
        'Способности к объективной оценке людей. Низкий уровень социального взаимодействия.',
        'Ярко выраженное мыслительное, познавательное начало. Богатство идей.',
        'Вторичность внешнего мира, нетребовательность к комфорту. Хорошая память.',
        'Слабая энергетичность, эмоциональная бедность. Малозависимость от внешних причин.',
        'Отсутствие честолюбия, неавторитарность. Трудности с общением.',
        'Замкнут, эмоционально холоден, рассудочен. Эгоистичен, не замечает чужую беду.'
      ];
      
      characters.push({
        name: name,
        traits: economicType3Traits[index],
        description: descriptions[index],
        correctSector: 'research'
      });
    });

    // ПРОПАГАНДИСТСКИЙ ШТАБ - 45 персонажей
    // Тип 1: Сангвиник-экстраверт (15 персонажей)
    const propagandaType1Names = [
      'Джозеф Геббельс', 'Пол Джозеф Гоббс', 'Эдвард Бернейс', 'Анна Смирнова', 'Игорь Петров',
      'Марина Козлова', 'Сергей Морозов', 'Ольга Волкова', 'Дмитрий Новиков', 'Татьяна Лебедева',
      'Алексей Соколов', 'Елена Петрова', 'Виктор Жуков', 'Анна Романова', 'Игорь Степанов'
    ];

    const propagandaType1Traits = [
      ['Высокая энергетичность', 'Медленная утомляемость', 'Повышенный фон настроения', 'Неустойчивая эмоциональность'],
      ['Легкомысленность', 'Толстокожесть', 'Экстравертные характеристики', 'Коммуникативные способности'],
      ['Сверхобщительность', 'Авантюризм', 'Безответственность', 'Повышенная активность'],
      ['Оптимизм', 'Слабая адаптированность', 'Монотонная деятельность', 'Генератор идей'],
      ['Эффективная деятельность', 'Ограниченное время', 'Неумение делать выводы', 'Слабое планирование'],
      ['Сангвинистический темперамент', 'Повышенная общительность', 'Высокая контактность', 'Быстрый темп речи'],
      ['Короткие паузы', 'Небольшое количество пауз', 'Неравномерная интонация', 'Громкий голос'],
      ['Быстрый темп речи', 'Неконфликтность', 'Редкие конфликты', 'Ограничение активности'],
      ['Монотонная деятельность', 'Изоляция', 'Длительная пассивность', 'Яркий спортивный стиль'],
      ['Смешанный стиль', 'Средняя аккуратность', 'Богатая мимика', 'Положительные эмоции'],
      ['Заразительный смех', 'Радость на лице', 'Веселье', 'Проявление эмоций'],
      ['Средняя пластичность', 'Быстрые движения', 'Размашистые движения', 'Экстраверсия'],
      ['Коммуникативность', 'Общительность', 'Авантюризм', 'Безответственность'],
      ['Активность', 'Оптимизм', 'Генерация идей', 'Эффективность'],
      ['Планирование', 'Предвидение', 'Темперамент', 'Общительность']
    ];

    propagandaType1Names.forEach((name, index) => {
      const descriptions = [
        'Одевается в ярком спортивном или смешанном стиле. Степень аккуратности средняя.',
        'Богатая положительными эмоциями мимика. Заразительный смех.',
        'На лице выражение радости и веселья. Склонность проявлять эмоции вовне.',
        'Уровень пластичности средний. Движения быстрые и размашистые.',
        'Высокая энергетичность, медленная утомляемость. Повышенный фон настроения.',
        'Неустойчивая эмоциональность, легкомысленность. Толстокожесть.',
        'Предельно развитые экстравертные характеристики. Высокоразвитые коммуникативные способности.',
        'Сверхобщительность, авантюризм. Безответственность и повышенная активность.',
        'Оптимизм, слабая адаптированность под монотонную деятельность. Прекрасный генератор идей.',
        'Предельные способности к эффективной деятельности в ограниченное время. Неумение делать выводы.',
        'Слабая способность планирования и предвидения. Близок к сангвинистическому темпераменту.',
        'Повышенная общительность, высокая контактность. Быстрый темп речи.',
        'Короткие паузы в небольшом количестве. Неравномерная интонация.',
        'Самый громкий голос и быстрый темп речи. В целом неконфликтен.',
        'Редкие конфликты возникают при ограничении активности. Монотонная деятельность вызывает дискомфорт.'
      ];
      
      characters.push({
        name: name,
        traits: propagandaType1Traits[index],
        description: descriptions[index],
        correctSector: 'propaganda'
      });
    });

    // Тип 2: Эгоцентрик-манипулятор (15 персонажей)
    const propagandaType2Names = [
      'Марина Ковалева', 'Алексей Тихонов', 'Елена Федорова', 'Дмитрий Соловьев', 'Ольга Медведева',
      'Сергей Егоров', 'Наталья Лебедева', 'Алексей Соколов', 'Елена Петрова', 'Дмитрий Новиков',
      'Татьяна Лебедева', 'Алексей Соколов', 'Елена Петрова', 'Сергей Морозов', 'Ольга Волкова'
    ];

    const propagandaType2Traits = [
      ['Эгоцентризм', 'Центр внимания', 'Тяга к эпатажу', 'Эгоизм'],
      ['Сосредоточенность на себе', 'Собственные желания', 'Завышенная самооценка', 'Напрашивание на комплимент'],
      ['Энергичность', 'Быстрое угасание', 'Чувственное начало', 'Волевое начало'],
      ['Неустойчивость настроения', 'Обидчивость', 'Ранимость', 'Чрезвычайное честолюбие'],
      ['Требования благодарности', 'Вера в исключительность', 'Актерские способности', 'Интриги'],
      ['Демагогия', 'Оппозиционность', 'Игра в вожака', 'Ненадежность'],
      ['Лживость', 'Лицемерие', 'Трусость', 'Необдуманный риск'],
      ['Хвастовство', 'Завышенная самооценка', 'Обидчивость', 'Аффективные реакции'],
      ['Эмоциональная черствость', 'Интриги', 'Выделение', 'Нелюбовь к физическому труду'],
      ['Монологи о себе', 'Публичные формы', 'Восхищение', 'Смена круга общения'],
      ['Демонстрация себя', 'Манипулятивность', 'Уязвление самолюбия', 'Равнодушие окружающих'],
      ['Игнорирование личности', 'Критика достижений', 'Критика способностей', 'Критика таланта'],
      ['Вынужденное одиночество', 'Ограничение общения', 'Поклонники', 'Невозможность проявить себя'],
      ['Отсутствие событий', 'Отсутствие возможностей', 'Удары по эгоцентризму', 'Разоблачение вымыслов'],
      ['Высмеивание', 'Оригинальная прическа', 'Оригинальная одежда', 'Детали костюма']
    ];

    propagandaType2Names.forEach((name, index) => {
      const descriptions = [
        'Оригинальная прическа, одежда, отдельные детали костюма. Любит ярлыки и фирменные знаки.',
        'Шумное, эпатирующее, привлекающее внимание поведение. Артистичен.',
        'Самостоятелен и независим. Уровень пластичности высокий.',
        'Движения вялые и плавные. Эгоцентризм, стремление быть в центре внимания.',
        'Тяга к эпатажу, эгоизм. Сосредоточенность мыслей на себе.',
        'Ориентация только на собственные желания. Завышенная самооценка.',
        'Стремление "напрашиваться на комплимент". Энергичность, быстрое угасание энергии.',
        'Развитие чувственного начала в ущерб волевому. Неустойчивость настроения.',
        'Обидчивость, ранимость. Чрезвычайное честолюбие.',
        'Преувеличенные требования благодарности ближнего. Вера в свою исключительность.',
        'Сильно развитые актерские способности. Склонность к интригам и демагогии.',
        'Оппозиционность при неудовлетворенном эгоцентризме. Игра в вожака вместо лидерства.',
        'Ненадежность, лживость и лицемерие. Трусость, необдуманный риск.',
        'Хвастовство, завышенная самооценка. Обидчивость при задевании личности.',
        'Склонность к острым аффективным реакциям. Эмоциональная черствость.'
      ];
      
      characters.push({
        name: name,
        traits: propagandaType2Traits[index],
        description: descriptions[index],
        correctSector: 'propaganda'
      });
    });

    // Тип 3: Нарцисс-демагог (15 персонажей)
    const propagandaType3Names = [
      'Игорь Петров', 'Марина Козлова', 'Сергей Морозов', 'Ольга Волкова', 'Дмитрий Новиков',
      'Татьяна Лебедева', 'Алексей Соколов', 'Елена Петрова', 'Виктор Жуков', 'Анна Романова',
      'Игорь Степанов', 'Марина Ковалева', 'Алексей Тихонов', 'Елена Федорова', 'Дмитрий Соловьев'
    ];

    const propagandaType3Traits = [
      ['Эгоцентризм', 'Стремление к центру', 'Эпатаж', 'Эгоизм'],
      ['Сосредоточенность мыслей', 'Ориентация на желания', 'Завышенная самооценка', 'Стремление к комплиментам'],
      ['Энергичность', 'Быстрое угасание энергии', 'Чувственное развитие', 'Волевое развитие'],
      ['Неустойчивость настроения', 'Обидчивость', 'Ранимость', 'Чрезвычайное честолюбие'],
      ['Преувеличенные требования', 'Благодарность ближнего', 'Вера в исключительность', 'Актерские способности'],
      ['Склонность к интригам', 'Демагогия', 'Оппозиционность', 'Игра в вожака'],
      ['Ненадежность', 'Лживость', 'Лицемерие', 'Трусость'],
      ['Необдуманный риск', 'Хвастовство', 'Завышенная самооценка', 'Обидчивость'],
      ['Аффективные реакции', 'Эмоциональная черствость', 'Интриги', 'Стремление выделяться'],
      ['Нелюбовь к труду', 'Монологи о себе', 'Публичное общение', 'Восхищение окружающих'],
      ['Смена круга общения', 'Демонстрация себя', 'Манипулятивность', 'Уязвление самолюбия'],
      ['Равнодушие окружающих', 'Игнорирование личности', 'Критика достижений', 'Критика способностей'],
      ['Критика таланта', 'Вынужденное одиночество', 'Ограничение общения', 'Поклонники'],
      ['Невозможность проявить себя', 'Отсутствие событий', 'Отсутствие возможностей', 'Удары по эгоцентризму'],
      ['Разоблачение вымыслов', 'Высмеивание', 'Оригинальность', 'Эпатаж']
    ];

    propagandaType3Names.forEach((name, index) => {
      const descriptions = [
        'Оригинальная прическа, одежда, отдельные детали костюма. Любит ярлыки и фирменные знаки.',
        'Шумное, эпатирующее, привлекающее внимание поведение. Артистичен.',
        'Самостоятелен и независим. Эгоцентризм, стремление к центру внимания.',
        'Эпатаж, эгоизм. Сосредоточенность мыслей на себе.',
        'Ориентация на желания, завышенная самооценка. Стремление к комплиментам.',
        'Энергичность, быстрое угасание энергии. Чувственное развитие в ущерб волевому.',
        'Неустойчивость настроения, обидчивость. Ранимость, чрезвычайное честолюбие.',
        'Преувеличенные требования благодарности ближнего. Вера в исключительность.',
        'Актерские способности, склонность к интригам. Демагогия, оппозиционность.',
        'Игра в вожака вместо настоящего лидерства. Ненадежность, лживость.',
        'Лицемерие, трусость. Необдуманный риск в присутствии зрителей.',
        'Хвастовство, завышенная самооценка. Обидчивость при задевании личности.',
        'Склонность к острым аффективным реакциям. Эмоциональная черствость.',
        'Интриги, стремление выделяться. Нелюбовь к физическому труду.',
        'Монологи о себе, публичное общение. Восхищение окружающих.'
      ];
      
      characters.push({
        name: name,
        traits: propagandaType3Traits[index],
        description: descriptions[index],
        correctSector: 'propaganda'
      });
    });

    return this.shuffleArray(characters);
  }

  showMembersList(sectorType) {
    const sector = this.sectors[sectorType];
    const modal = this.domCache.membersModal;
    const title = document.getElementById('members-title');
    const list = this.domCache.membersList;

    title.textContent = `Персонажи в ${sector.name} штабе`;
    
    // Оптимизация: используем DocumentFragment
    const fragment = document.createDocumentFragment();
    
    sector.members.forEach((member, index) => {
      const item = document.createElement('div');
      item.className = 'member-item';
      
      // Оптимизация: кэшируем HTML для traits
      const traitsHTML = member.traits.map(trait => `<span class="member-item-trait">${trait}</span>`).join('');
      
      item.innerHTML = `
        <div class="member-item-name">${member.name}</div>
        <div class="member-item-traits">${traitsHTML}</div>
      `;
      
      // Оптимизация: используем bind для предотвращения создания новых функций
      if (!this.memberDetailHandlers) {
        this.memberDetailHandlers = new Map();
      }
      
      const memberKey = `${member.name}-${sectorType}`;
      if (!this.memberDetailHandlers.has(memberKey)) {
        this.memberDetailHandlers.set(memberKey, () => this.showCharacterDetails(member));
      }
      
      item.addEventListener('click', this.memberDetailHandlers.get(memberKey));
      fragment.appendChild(item);
    });

    list.innerHTML = '';
    list.appendChild(fragment);
    modal.classList.add('active');
  }

  hideMembersModal() {
    document.getElementById('members-modal').classList.remove('active');
  }

  showCharacterDetails(member) {
    const modal = document.getElementById('character-details-modal');
    const name = document.getElementById('character-details-name');
    const traits = document.getElementById('character-details-traits');
    const description = document.getElementById('character-details-description');

    name.textContent = member.name;
    traits.innerHTML = member.traits.map(trait => 
      `<span class="character-details-trait">${trait}</span>`
    ).join('');
    description.textContent = member.description;

    modal.classList.add('active');
  }

  hideCharacterDetailsModal() {
    document.getElementById('character-details-modal').classList.remove('active');
  }

  // Методы для окна истребления
  showEliminationModal(traitor, allies, requiredCount) {
    this.currentTraitor = traitor;
    this.availableAllies = allies;
    this.requiredAlliesCount = requiredCount;
    this.selectedAllies = [];

    // Отображаем предателя
    const traitorCard = document.getElementById('traitor-card');
    const traitorTraits = traitor.traits.join(', ');
    traitorCard.innerHTML = `
      <div class="character-name">${traitor.name}</div>
      <div class="character-traits">${traitorTraits}</div>
    `;

    // Отображаем доступных союзников
    const alliesContainer = document.getElementById('allies-container');
    
    // Оптимизация: используем DocumentFragment
    const fragment = document.createDocumentFragment();
    
    allies.forEach((ally, index) => {
      const allyCard = document.createElement('div');
      allyCard.className = 'ally-card';
      allyCard.draggable = true;
      allyCard.dataset.allyIndex = index;
      
      const allyTraits = ally.traits.join(', ');
      allyCard.innerHTML = `
        <div class="ally-name">${ally.name}</div>
        <div class="ally-traits">${allyTraits}</div>
      `;

      // Drag events для союзников
      allyCard.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', index);
        allyCard.classList.add('dragging');
      });

      allyCard.addEventListener('dragend', () => {
        allyCard.classList.remove('dragging');
      });

      fragment.appendChild(allyCard);
    });

    alliesContainer.innerHTML = '';
    alliesContainer.appendChild(fragment);

    // Настройка зоны истребления
    const eliminationZone = this.domCache.eliminationZone;
    
    // Оптимизация: кэшируем обработчики событий
    if (!this.eliminationZoneHandlers) {
      this.eliminationZoneHandlers = {
        dragover: (e) => {
          e.preventDefault();
          eliminationZone.style.borderColor = 'var(--accent)';
          eliminationZone.style.background = 'linear-gradient(135deg, rgba(0, 123, 255, 0.2) 0%, rgba(0, 123, 255, 0.1) 100%)';
        },
        dragleave: (e) => {
          eliminationZone.style.borderColor = 'var(--accent)';
          eliminationZone.style.background = 'linear-gradient(135deg, rgba(0, 123, 255, 0.1) 0%, rgba(0, 123, 255, 0.05) 100%)';
        },
        drop: (e) => {
          e.preventDefault();
          const allyIndex = parseInt(e.dataTransfer.getData('text/plain'));
          this.addAllyToElimination(allyIndex);
          
          eliminationZone.style.borderColor = 'var(--accent)';
          eliminationZone.style.background = 'linear-gradient(135deg, rgba(0, 123, 255, 0.1) 0%, rgba(0, 123, 255, 0.05) 100%)';
        }
      };
    }

    eliminationZone.addEventListener('dragover', this.eliminationZoneHandlers.dragover);
    eliminationZone.addEventListener('dragleave', this.eliminationZoneHandlers.dragleave);
    eliminationZone.addEventListener('drop', this.eliminationZoneHandlers.drop);

    // Touch events для мобильных устройств
    this.setupTouchElimination();

    this.domCache.eliminationModal.classList.add('active');
  }

  setupTouchElimination() {
    const allyCards = document.querySelectorAll('.ally-card');
    const eliminationZone = document.getElementById('elimination-zone');

    allyCards.forEach((card, index) => {
      let isDragging = false;
      let startX, startY;
      let originalTransform = '';

      card.addEventListener('touchstart', (e) => {
        e.preventDefault();
        isDragging = true;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        originalTransform = card.style.transform;
        card.classList.add('dragging');
        card.style.transition = 'none';
      });

      card.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        
        const currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;
        
        card.style.transform = `translate(${currentX - startX}px, ${currentY - startY}px)`;
      });

      card.addEventListener('touchend', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        isDragging = false;
        card.classList.remove('dragging');
        card.style.transition = 'all 0.3s ease';

        // Проверяем, попал ли элемент в зону истребления
        const zoneRect = eliminationZone.getBoundingClientRect();
        const cardRect = card.getBoundingClientRect();
        
        if (cardRect.left < zoneRect.right && cardRect.right > zoneRect.left &&
            cardRect.top < zoneRect.bottom && cardRect.bottom > zoneRect.top) {
          this.addAllyToElimination(index);
          card.style.transform = originalTransform;
        } else {
          // Возвращаем в исходное положение
          card.style.transform = originalTransform;
        }
      });

      // Предотвращаем конфликт с обычными кликами
      card.addEventListener('click', (e) => {
        if (isDragging) {
          e.preventDefault();
          e.stopPropagation();
        }
      });
    });
  }

  addAllyToElimination(allyIndex) {
    if (this.selectedAllies.length >= this.requiredAlliesCount) {
      return; // Уже достаточно союзников
    }

    const ally = this.availableAllies[allyIndex];
    if (this.selectedAllies.find(a => a.index === allyIndex)) {
      return; // Союзник уже выбран
    }

    this.selectedAllies.push({ ...ally, index: allyIndex });
    this.updateSelectedAlliesDisplay();
    this.updateEliminationButton();
  }

  removeAllyFromElimination(allyIndex) {
    this.selectedAllies = this.selectedAllies.filter(a => a.index !== allyIndex);
    this.updateSelectedAlliesDisplay();
    this.updateEliminationButton();
  }

  updateSelectedAlliesDisplay() {
    const selectedAlliesContainer = this.domCache.selectedAllies;
    
    // Оптимизация: используем DocumentFragment
    const fragment = document.createDocumentFragment();

    this.selectedAllies.forEach(ally => {
      const allyElement = document.createElement('div');
      allyElement.className = 'selected-ally';
      allyElement.innerHTML = `
        ${ally.name}
        <button class="remove-ally" data-ally-index="${ally.index}">×</button>
      `;
      
      // Оптимизация: используем делегирование событий
      const removeButton = allyElement.querySelector('.remove-ally');
      removeButton.addEventListener('click', () => this.removeAllyFromElimination(ally.index));
      
      fragment.appendChild(allyElement);
    });

    selectedAlliesContainer.innerHTML = '';
    selectedAlliesContainer.appendChild(fragment);
  }

  updateEliminationButton() {
    const executeButton = this.domCache.executeButton;
    const isEnoughAllies = this.selectedAllies.length >= this.requiredAlliesCount;
    
    executeButton.disabled = !isEnoughAllies;
    executeButton.textContent = `Истребить предателя (${this.selectedAllies.length}/${this.requiredAlliesCount})`;
  }

  executeElimination() {
    if (this.selectedAllies.length < this.requiredAlliesCount) {
      return;
    }

    // Удаляем предателя из сектора
    const sectorType = this.findSectorByMember(this.currentTraitor.name);
    if (sectorType) {
      this.sectors[sectorType].members = this.sectors[sectorType].members.filter(
        m => m.name !== this.currentTraitor.name
      );
      this.updateSectorDisplay(sectorType);
    }

    // Уменьшаем вероятность неудачи
    this.failureProbability = Math.max(0, this.failureProbability - 15);
    
    // Скрываем окно истребления
    this.hideEliminationModal();
    
    // Показываем результат истребления
    this.showEliminationResult();
  }

  findSectorByMember(memberName) {
    for (const [sectorType, sector] of Object.entries(this.sectors)) {
      if (sector.members.find(m => m.name === memberName)) {
        return sectorType;
      }
    }
    return null;
  }

  resetCharacterStyles(characterCard) {
    characterCard.classList.remove('dragging');
    characterCard.style.position = '';
    characterCard.style.zIndex = '';
    characterCard.style.left = '';
    characterCard.style.top = '';
    characterCard.style.pointerEvents = '';
    characterCard.style.transition = '';
  }

  returnCharacterToOriginalPosition(characterCard, originalPosition) {
    if (!originalPosition) return;
    
    // Включаем анимации обратно
    characterCard.style.transition = 'all 0.3s ease';
    
    // Возвращаем в исходное положение
    characterCard.style.left = originalPosition.left + 'px';
    characterCard.style.top = originalPosition.top + 'px';
    
    // Через время анимации сбрасываем все стили
    setTimeout(() => {
      this.resetCharacterStyles(characterCard);
    }, 300);
  }

  showEliminationResult() {
    const resultText = `✅ Предатель ${this.currentTraitor.name} успешно истреблен! 
    
Использованные силы:
${this.selectedAllies.map(ally => `• ${ally.name} (${ally.traits.join(', ')})`).join('\n')}

Вероятность неудачи снижена до ${this.failureProbability}%`;

    // Добавляем результат в общий список результатов
    this.results.push({
      type: 'elimination',
      content: resultText,
      title: 'Истребление предателя'
    });

    // Продолжаем показ результатов
    this.nextResult();
  }

  hideEliminationModal() {
    this.domCache.eliminationModal.classList.remove('active');
    
    // Очищаем обработчики событий зоны истребления
    if (this.eliminationZoneHandlers) {
      const eliminationZone = this.domCache.eliminationZone;
      eliminationZone.removeEventListener('dragover', this.eliminationZoneHandlers.dragover);
      eliminationZone.removeEventListener('dragleave', this.eliminationZoneHandlers.dragleave);
      eliminationZone.removeEventListener('drop', this.eliminationZoneHandlers.drop);
    }
    
    this.selectedAllies = [];
    this.currentTraitor = null;
    this.availableAllies = null;
  }

  updateSectorVisibility() {
    // Оптимизация: кэшируем элементы секторов
    if (!this.sectorElements) {
      this.sectorElements = new Map();
      this.domCache.sectors.forEach(sector => {
        this.sectorElements.set(sector.dataset.sector, sector);
      });
    }
    
    Object.entries(this.sectors).forEach(([sectorType, sector]) => {
      const sectorElement = this.sectorElements.get(sectorType);
      if (!sectorElement) return;
      
      if (sector.members.length >= sector.max) {
        // Сектор заполнен - делаем его полупрозрачным и неактивным
        sectorElement.style.opacity = '0.5';
        sectorElement.style.pointerEvents = 'none';
        sectorElement.classList.add('filled');
        
        // Добавляем индикатор заполнения
        const countElement = sectorElement.querySelector('.sector-count');
        if (countElement) {
          countElement.style.color = 'var(--success)';
          countElement.style.fontWeight = 'bold';
        }
      } else {
        // Сектор не заполнен - возвращаем нормальный вид
        sectorElement.style.opacity = '1';
        sectorElement.style.pointerEvents = 'auto';
        sectorElement.classList.remove('filled');
        
        // Возвращаем нормальный вид счетчика
        const countElement = sectorElement.querySelector('.sector-count');
        if (countElement) {
          countElement.style.color = 'var(--glow2)';
          countElement.style.fontWeight = 'normal';
        }
      }
    });
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
