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
    
    // Инициализируем систему историй
    this.storySystem.init();
    
    // Начинаем воспроизведение фоновой музыки
    this.storySystem.playHorrorMusic();
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
      soundToggle: document.getElementById('sound-toggle'),
      videoBackground: document.getElementById('video-background'),
      closeVideo: document.getElementById('close-video')
    };
  }

  bindEvents() {
    // Оптимизация: используем делегирование событий и кэшированные элементы
    const eventHandlers = {
      'start-quest': () => this.hideWarning(),
      'start-quest-final': () => this.startQuestFinal(),
      'close-quest-info': () => this.hideQuestInfo(),
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
      'sound-toggle': () => this.toggleSound(),
      'close-video': () => this.storySystem.hideVideoBackground()
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

  // Управление звуком
  toggleSound() {
    const isEnabled = this.storySystem.toggleSound();
    const soundIcon = this.domCache.soundToggle?.querySelector('.sound-icon');
    
    if (soundIcon) {
      soundIcon.textContent = isEnabled ? '🔊' : '🔇';
    }
    
    // Обновляем текст кнопки
    if (this.domCache.soundToggle) {
      this.domCache.soundToggle.title = isEnabled ? 'Отключить звук' : 'Включить звук';
    }
  }

  hideWarning() {
    document.getElementById('warning-modal').classList.remove('active');
    document.getElementById('quest-info-modal').classList.add('active');
  }

  goToMain() {
    // Возвращаемся на главную страницу квестов
    window.location.href = '../quests.html';
  }

  showQuestInfo() {
    document.getElementById('quest-info-modal').classList.add('active');
  }

  hideQuestInfo() {
    document.getElementById('quest-info-modal').classList.remove('active');
  }

  startQuestFinal() {
    this.hideQuestInfo();
    document.getElementById('main-interface').classList.remove('hidden');
  }

  showFinishModal() {
    document.getElementById('finish-modal').classList.add('active');
  }

  hideFinishModal() {
    document.getElementById('finish-modal').classList.remove('active');
  }

  skipCharacter() {
    this.currentCharacterIndex++;
    if (this.currentCharacterIndex >= this.characters.length) {
      this.currentCharacterIndex = 0;
    }
    this.loadCurrentCharacter();
  }

  loadCurrentCharacter() {
    const character = this.characters[this.currentCharacterIndex];
    if (!character || !this.domCache.currentCharacter) return;

    this.domCache.currentCharacter.innerHTML = `
      <div class="character-name">${character.name}</div>
      <div class="character-traits">
        ${character.traits.map(trait => `<span class="trait ${trait.correct ? 'correct' : 'incorrect'}">${trait.name}</span>`).join('')}
      </div>
      <div class="character-description">${character.description}</div>
    `;

    this.domCache.currentCharacter.dataset.characterId = character.id;
    
    // ВАЖНО: Делаем карточку перетаскиваемой
    this.domCache.currentCharacter.draggable = true;
    
    this.updateFinishButton();
  }

  updateFinishButton() {
    if (!this.domCache.finishButton) return;
    
    // Проверяем, заполнены ли ВСЕ штабы
    const allSectorsFilled = Object.values(this.sectors).every(sector => 
      sector.members.length >= sector.max
    );
    
    // Кнопка активна только когда все штабы заполнены
    this.domCache.finishButton.disabled = !allSectorsFilled;
    
    // Обновляем текст кнопки для лучшего UX
    if (this.domCache.finishButton) {
      if (allSectorsFilled) {
        this.domCache.finishButton.textContent = '🚀 Завершить создание';
        this.domCache.finishButton.title = 'Все штабы заполнены! Можно завершать создание мирового правительства.';
      } else {
        const totalMembers = Object.values(this.sectors).reduce((sum, sector) => sum + sector.members.length, 0);
        const totalMax = Object.values(this.sectors).reduce((sum, sector) => sum + sector.max, 0);
        this.domCache.finishButton.textContent = `⏳ Заполните все штабы (${totalMembers}/${totalMax})`;
        this.domCache.finishButton.title = `Необходимо заполнить все штабы. Текущий прогресс: ${totalMembers}/${totalMax}`;
      }
    }
  }

  updateSectorCounts() {
    Object.entries(this.sectors).forEach(([sectorType, sector]) => {
      const sectorElement = document.querySelector(`[data-sector="${sectorType}"]`);
      if (sectorElement) {
        const countElement = sectorElement.querySelector('.sector-count');
        if (countElement) {
          countElement.textContent = `${sector.members.length}/${sector.max}`;
        }
        
        // Обновляем классы сектора
        sectorElement.classList.toggle('filled', sector.members.length >= sector.max);
        
        // Обновляем список членов
        this.updateSectorMembers(sectorType);
      }
    });
    
    // Обновляем состояние кнопки "Завершить создание"
    this.updateFinishButton();
  }

  updateSectorMembers(sectorType) {
    const sectorElement = document.querySelector(`[data-sector="${sectorType}"]`);
    if (!sectorElement) return;

    const membersContainer = sectorElement.querySelector('.sector-members');
    if (!membersContainer) return;

    const sector = this.sectors[sectorType];
    membersContainer.innerHTML = '';

    sector.members.forEach((member, index) => {
      const memberTag = document.createElement('div');
      memberTag.className = 'member-tag';
      memberTag.textContent = member.name.charAt(0);
      memberTag.title = member.name;
      memberTag.dataset.memberIndex = index;
      
      // Добавляем обработчик для показа деталей
      memberTag.addEventListener('click', () => this.showCharacterDetails(member));
      
      membersContainer.appendChild(memberTag);
    });
  }

  showCharacterDetails(character) {
    const modal = document.getElementById('character-details-modal');
    const nameEl = document.getElementById('character-details-name');
    const traitsEl = document.getElementById('character-details-traits');
    const descriptionEl = document.getElementById('character-details-description');

    if (modal && nameEl && traitsEl && descriptionEl) {
      nameEl.textContent = character.name;
      traitsEl.innerHTML = character.traits.map(trait => 
        `<span class="character-details-trait ${trait.correct ? 'correct' : 'incorrect'}">${trait.name}</span>`
      ).join('');
      descriptionEl.textContent = character.description;
      
      modal.classList.add('active');
    }
  }

  hideCharacterDetailsModal() {
    document.getElementById('character-details-modal').classList.remove('active');
  }

  setupDragAndDrop() {
    // Перетаскивание персонажей
    if (this.domCache.currentCharacter) {
      this.domCache.currentCharacter.addEventListener('dragstart', (e) => {
        this.draggedElement = e.target;
        e.target.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', this.currentCharacterIndex);
      });

      this.domCache.currentCharacter.addEventListener('dragend', (e) => {
        e.target.classList.remove('dragging');
        this.draggedElement = null;
      });
    }

    // Обработка перетаскивания над секторами
    this.domCache.sectors.forEach(sector => {
      sector.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        if (this.draggedElement && this.canAddToSector(sector.dataset.sector)) {
          sector.classList.add('drag-over');
        }
      });

      sector.addEventListener('dragleave', (e) => {
        sector.classList.remove('drag-over');
      });

      sector.addEventListener('drop', (e) => {
        e.preventDefault();
        sector.classList.remove('drag-over');
        
        if (this.draggedElement && this.canAddToSector(sector.dataset.sector)) {
          this.addCharacterToSector(sector.dataset.sector);
        }
      });

      // Клик по сектору для просмотра членов
      sector.addEventListener('click', () => {
        this.showSectorMembers(sector.dataset.sector);
      });
    });
  }

  canAddToSector(sectorType) {
    const sector = this.sectors[sectorType];
    return sector && sector.members.length < sector.max;
  }

  addCharacterToSector(sectorType) {
    const character = this.characters[this.currentCharacterIndex];
    if (!character || !this.canAddToSector(sectorType)) return;

    // Добавляем персонажа в сектор
    this.sectors[sectorType].members.push(character);
    
    // Переходим к следующему персонажу
    this.currentCharacterIndex++;
    if (this.currentCharacterIndex >= this.characters.length) {
      this.currentCharacterIndex = 0;
    }
    
    // Обновляем отображение
    this.loadCurrentCharacter();
    this.updateSectorCounts();
    
    // Обновляем состояние кнопки "Завершить создание"
    this.updateFinishButton();
    
    // Показываем уведомление
    this.showToast(`Персонаж ${character.name} добавлен в ${this.sectors[sectorType].name} штаб`, 'success');
  }

  showSectorMembers(sectorType) {
    const sector = this.sectors[sectorType];
    if (!sector || sector.members.length === 0) return;

    const modal = document.getElementById('members-modal');
    const titleEl = document.getElementById('members-title');
    const listEl = document.getElementById('members-list');

    if (modal && titleEl && listEl) {
      titleEl.textContent = `Персонажи в ${sector.name} штабе`;
      
      listEl.innerHTML = sector.members.map(member => `
        <div class="member-item" onclick="this.showCharacterDetails(${JSON.stringify(member)})">
          <div class="member-item-name">${member.name}</div>
          <div class="member-item-traits">
            ${member.traits.map(trait => `<span class="member-item-trait ${trait.correct ? 'correct' : 'incorrect'}">${trait.name}</span>`).join('')}
          </div>
        </div>
      `).join('');
      
      modal.classList.add('active');
    }
  }

  hideMembersModal() {
    document.getElementById('members-modal').classList.remove('active');
  }

  startResults() {
    // Генерируем последовательность историй
    this.results = this.generateResults();
    this.currentResultIndex = 0;
    
    if (this.results.length > 0) {
      this.showResult();
    }
  }

  generateResults() {
    const results = [];
    
    // Добавляем вступительную историю
    const introStory = this.storySystem.getStory([], 'intro');
    results.push({
      type: 'story',
      content: introStory,
      canContinue: true
    });

    // Анализируем каждый сектор и генерируем соответствующие истории
    Object.entries(this.sectors).forEach(([sectorType, sector]) => {
      if (sector.members.length > 0) {
        // Определяем, правильно ли заполнен сектор
        const correctMembers = sector.members.filter(member => 
          member.traits.some(trait => trait.correct && this.isTraitRelevantForSector(trait.name, sectorType))
        );
        
        if (correctMembers.length > 0) {
          // Успешная история для сектора
          const story = this.storySystem.getStory([sectorType], 'random');
          results.push({
            type: 'story',
            content: story,
            sector: sectorType,
            canContinue: true
          });
        } else {
          // Проблемная история для сектора
          const problemStory = this.generateProblemStory(sectorType, sector.members);
          results.push({
            type: 'problem',
            content: problemStory,
            sector: sectorType,
            canContinue: true,
            canEliminate: problemStory.canEliminate,
            eliminationRequirement: problemStory.eliminationRequirement
          });
        }
      }
    });

    // Добавляем финальную историю
    const finalStory = this.generateFinalStory();
    results.push({
      type: 'final',
      content: finalStory,
      canContinue: false
    });

    return results;
  }

  isTraitRelevantForSector(traitName, sectorType) {
    const traitRelevance = {
      political: ['Лидерство', 'Дипломатия', 'Ораторство', 'Харизма', 'Политика'],
      military: ['Стратегия', 'Тактика', 'Командование', 'Храбрость', 'Военное дело'],
      economic: ['Финансы', 'Аналитика', 'Переговоры', 'Инвестиции', 'Экономика'],
      research: ['Интеллект', 'Креативность', 'Логика', 'Инновации', 'Наука', 'Эксперименты'],
      propaganda: ['Креативность', 'Коммуникация', 'Психология', 'Медиа', 'Пропаганда']
    };
    
    return traitRelevance[sectorType]?.includes(traitName) || false;
  }

  generateProblemStory(sectorType, members) {
    const problemStories = {
      political: {
        title: "⚔️ Политический заговор",
        content: `Неправильно назначенные агенты в ${this.sectors[sectorType].name} штабе организовали тайный заговор против вашей власти. Они используют свои навыки для подрыва авторитета правительства изнутри.`,
        canEliminate: true,
        eliminationRequirement: Math.min(members.length, 3)
      },
      military: {
        title: "💥 Военный мятеж",
        content: `Военные лидеры в ${this.sectors[sectorType].name} штабе, недовольные вашими методами, организовали мятеж. Они захватили стратегические объекты и угрожают применить оружие.`,
        canEliminate: true,
        eliminationRequirement: Math.min(members.length, 2)
      },
      economic: {
        title: "💸 Экономический саботаж",
        content: `Агенты в ${this.sectors[sectorType].name} штабе намеренно подрывают финансовую стабильность организации. Они используют свои экономические знания для скрытого саботажа.`,
        canEliminate: true,
        eliminationRequirement: Math.min(members.length, 2)
      },
      research: {
        title: "🔬 Опасные эксперименты",
        content: `Исследователи в ${this.sectors[sectorType].name} штабе проводят опасные эксперименты, которые могут выйти из-под контроля. Их научные амбиции угрожают безопасности всего мира.`,
        canEliminate: true,
        eliminationRequirement: Math.min(members.length, 2)
      },
      propaganda: {
        title: "📢 Информационная диверсия",
        content: `Агенты в ${this.sectors[sectorType].name} штабе распространяют дезинформацию, подрывая доверие к правительству. Они используют СМИ против ваших интересов.`,
        canEliminate: true,
        eliminationRequirement: Math.min(members.length, 2)
      }
    };

    return problemStories[sectorType] || problemStories.political;
  }

  generateFinalStory() {
    // Подсчитываем общую эффективность
    let totalEfficiency = 0;
    let totalSectors = 0;

    Object.entries(this.sectors).forEach(([sectorType, sector]) => {
      if (sector.members.length > 0) {
        totalSectors++;
        const correctMembers = sector.members.filter(member => 
          member.traits.some(trait => trait.correct && this.isTraitRelevantForSector(trait.name, sectorType))
        );
        totalEfficiency += (correctMembers.length / sector.members.length) * 100;
      }
    });

    const averageEfficiency = totalSectors > 0 ? totalEfficiency / totalSectors : 0;

    if (averageEfficiency >= 80) {
      return {
        title: "🌍 Мировое господство достигнуто!",
        content: "Ваше тайное правительство успешно установило контроль над миром! Все секторы работают в идеальной гармонии, агенты выполняют свои задачи безупречно. Мир теперь принадлежит вам, и ничто не может противостоять вашей власти.",
        type: "ultimate_success"
      };
    } else if (averageEfficiency >= 60) {
      return {
        title: "🎯 Значительное влияние",
        content: "Ваше тайное правительство установило значительное влияние в мире. Большинство секторов работают эффективно, хотя есть области для улучшения. Ваша власть прочна и продолжает расширяться.",
        type: "major_success"
      };
    } else if (averageEfficiency >= 40) {
      return {
        title: "⚠️ Частичный контроль",
        content: "Ваше тайное правительство установило частичный контроль над миром. Некоторые секторы работают хорошо, но есть серьезные проблемы, которые требуют решения. Ваша власть нестабильна.",
        type: "partial_success"
      };
    } else {
      return {
        title: "💥 Критическая ситуация",
        content: "Ваше тайное правительство находится в критическом состоянии. Большинство секторов работают неэффективно, агенты не справляются с задачами. Ваша власть под угрозой краха.",
        type: "critical_failure"
      };
    }
  }

  showResult() {
    if (this.currentResultIndex >= this.results.length) {
      this.finishResults();
      return;
    }

    const result = this.results[this.currentResultIndex];
    const modal = this.domCache.resultsModal;
    const titleEl = this.domCache.resultsTitle;
    const contentEl = this.domCache.resultsContent;

    if (!modal || !titleEl || !contentEl) return;

    // Показываем модальное окно
    modal.classList.add('active');

    // Обновляем заголовок
    titleEl.textContent = result.content.title;

    // Обновляем контент
    contentEl.innerHTML = `
      <div class="result-content">
        <p>${result.content.content}</p>
        ${result.type === 'problem' && result.canEliminate ? `
          <div class="elimination-option">
            <p><strong>Для решения проблемы требуется истребление ${result.eliminationRequirement} предателей.</strong></p>
            <button class="btn btn-danger" onclick="this.startElimination('${result.sector}', ${result.eliminationRequirement})">
              Начать истребление
            </button>
          </div>
        ` : ''}
      </div>
    `;

    // Обновляем кнопки
    const nextBtn = document.getElementById('next-result');
    const finishBtn = document.getElementById('finish-results');

    if (nextBtn && finishBtn) {
      if (result.canContinue) {
        nextBtn.style.display = 'inline-flex';
        finishBtn.style.display = 'none';
      } else {
        nextBtn.style.display = 'none';
        finishBtn.style.display = 'inline-flex';
      }
    }
  }

  nextResult() {
    this.currentResultIndex++;
    this.showResult();
  }

  finishResults() {
    this.domCache.resultsModal.classList.remove('active');
    this.showToast('Квест завершен!', 'success');
  }

  startElimination(sectorType, requirement) {
    const sector = this.sectors[sectorType];
    if (!sector || sector.members.length === 0) return;

    // Показываем модальное окно истребления
    this.showEliminationModal(sector.members, requirement);
  }

  showEliminationModal(members, requirement) {
    const modal = this.domCache.eliminationModal;
    const traitorCard = document.getElementById('traitor-card');
    const alliesContainer = document.getElementById('allies-container');

    if (!modal || !traitorCard || !alliesContainer) return;

    // Выбираем случайного предателя
    const traitor = members[Math.floor(Math.random() * members.length)];
    
    // Показываем предателя
    traitorCard.innerHTML = `
      <div class="character-name">${traitor.name}</div>
      <div class="character-traits">
        ${traitor.traits.map(trait => `<span class="trait">${trait.name}</span>`).join('')}
      </div>
    `;

    // Показываем доступных союзников
    alliesContainer.innerHTML = members
      .filter(member => member !== traitor)
      .map(member => `
        <div class="ally-card" draggable="true" data-member-id="${member.id}">
          <div class="ally-name">${member.name}</div>
          <div class="ally-traits">
            ${member.traits.map(trait => `<span class="trait">${trait.name}</span>`).join('')}
          </div>
        </div>
      `).join('');

    // Настраиваем перетаскивание союзников
    this.setupEliminationDragAndDrop();

    // Показываем модальное окно
    modal.classList.add('active');
  }

  setupEliminationDragAndDrop() {
    const allyCards = document.querySelectorAll('.ally-card');
    const eliminationZone = this.domCache.eliminationZone;

    allyCards.forEach(card => {
      card.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', card.dataset.memberId);
        card.classList.add('dragging');
      });

      card.addEventListener('dragend', (e) => {
        card.classList.remove('dragging');
      });
    });

    if (eliminationZone) {
      eliminationZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      });

      eliminationZone.addEventListener('drop', (e) => {
        e.preventDefault();
        const memberId = e.dataTransfer.getData('text/plain');
        this.addAllyToEliminationZone(memberId);
      });
    }
  }

  addAllyToEliminationZone(memberId) {
    const selectedAllies = this.domCache.selectedAllies;
    if (!selectedAllies) return;

    const allyCard = document.querySelector(`[data-member-id="${memberId}"]`);
    if (!allyCard) return;

    const selectedAlly = document.createElement('div');
    selectedAlly.className = 'selected-ally';
    selectedAlly.dataset.memberId = memberId;
    selectedAlly.innerHTML = `
      ${allyCard.querySelector('.ally-name').textContent}
      <button class="remove-ally" onclick="this.removeAllyFromEliminationZone('${memberId}')">×</button>
    `;

    selectedAllies.appendChild(selectedAlly);
    this.updateExecuteButton();
  }

  removeAllyFromEliminationZone(memberId) {
    const selectedAlly = document.querySelector(`[data-member-id="${memberId}"]`);
    if (selectedAlly) {
      selectedAlly.remove();
      this.updateExecuteButton();
    }
  }

  updateExecuteButton() {
    if (!this.domCache.executeButton) return;
    
    const selectedAllies = this.domCache.selectedAllies;
    const requiredCount = parseInt(document.querySelector('.elimination-option .btn-danger')?.textContent.match(/\d+/)?.[0] || 1);
    
    const isEnabled = selectedAllies && selectedAllies.children.length >= requiredCount;
    this.domCache.executeButton.disabled = !isEnabled;
  }

  executeElimination() {
    const selectedAllies = this.domCache.selectedAllies;
    if (!selectedAllies || selectedAllies.children.length === 0) return;

    // Показываем анимацию истребления
    this.showEliminationAnimation(() => {
      // Скрываем модальное окно
      this.hideEliminationModal();
      
      // Показываем уведомление об успехе
      this.showToast('Предатель успешно истреблен!', 'success');
      
      // Продолжаем показ результатов
      this.nextResult();
    });
  }

  showEliminationAnimation(callback) {
    // Простая анимация истребления
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255, 0, 0, 0.8);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 48px;
      font-weight: bold;
    `;
    overlay.textContent = '⚔️ ИСТРЕБЛЕНИЕ ⚔️';
    
    document.body.appendChild(overlay);
    
    setTimeout(() => {
      document.body.removeChild(overlay);
      if (callback) callback();
    }, 2000);
  }

  hideEliminationModal() {
    this.domCache.eliminationModal.classList.remove('active');
    
    // Очищаем зону истребления
    if (this.domCache.selectedAllies) {
      this.domCache.selectedAllies.innerHTML = '';
    }
  }

  finishQuest() {
    // Возвращаемся на главную страницу
    window.location.href = '../quests.html';
  }

  showToast(message, type = 'info') {
    // Создаем простой toast
    const toast = document.createElement('div');
    toast.className = `toast show ${type}`;
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(88, 84, 91, 0.98);
      color: #F6F2F6;
      padding: 12px 20px;
      border-radius: 12px;
      border: 2px solid #F6F2F6;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
      z-index: 10000;
      font-weight: 500;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 3000);
  }

  // Генерация персонажей с правильными характеристиками и принадлежностью к штабам
  generateCharacters() {
    return [
      {
        id: 1,
        name: "Александр Петров",
        traits: [
          { name: "Лидерство", correct: true },
          { name: "Дипломатия", correct: true },
          { name: "Харизма", correct: true }
        ],
        description: "Природный лидер с выдающимися дипломатическими способностями. Идеально подходит для политического сектора.",
        correctSector: "political"
      },
      {
        id: 2,
        name: "Елена Соколова",
        traits: [
          { name: "Интеллект", correct: true },
          { name: "Наука", correct: true },
          { name: "Эксперименты", correct: true }
        ],
        description: "Гениальный ученый с нестандартным мышлением. Отлично подходит для исследовательского сектора.",
        correctSector: "research"
      },
      {
        id: 3,
        name: "Дмитрий Козлов",
        traits: [
          { name: "Финансы", correct: true },
          { name: "Экономика", correct: true },
          { name: "Аналитика", correct: true }
        ],
        description: "Опытный финансист с аналитическим складом ума. Идеально подходит для экономического сектора.",
        correctSector: "economic"
      },
      {
        id: 4,
        name: "Мария Иванова",
        traits: [
          { name: "Креативность", correct: true },
          { name: "Медиа", correct: true },
          { name: "Пропаганда", correct: true }
        ],
        description: "Творческая личность с отличными навыками работы с медиа. Идеальна для пропагандистского сектора.",
        correctSector: "propaganda"
      },
      {
        id: 5,
        name: "Сергей Волков",
        traits: [
          { name: "Стратегия", correct: true },
          { name: "Военное дело", correct: true },
          { name: "Командование", correct: true }
        ],
        description: "Опытный военный стратег с тактическим мышлением. Идеально подходит для военного сектора.",
        correctSector: "military"
      },
      {
        id: 6,
        name: "Анна Морозова",
        traits: [
          { name: "Дипломатия", correct: true },
          { name: "Политика", correct: true },
          { name: "Ораторство", correct: true }
        ],
        description: "Прирожденный дипломат с выдающимися ораторскими способностями. Отлично подходит для политического сектора.",
        correctSector: "political"
      },
      {
        id: 7,
        name: "Виктор Смирнов",
        traits: [
          { name: "Интеллект", correct: true },
          { name: "Инновации", correct: true },
          { name: "Логика", correct: true }
        ],
        description: "Инновационный исследователь с логическим мышлением. Идеален для исследовательского сектора.",
        correctSector: "research"
      },
      {
        id: 8,
        name: "Ольга Новикова",
        traits: [
          { name: "Психология", correct: true },
          { name: "Коммуникация", correct: true },
          { name: "Пропаганда", correct: true }
        ],
        description: "Психолог с пониманием медиа-процессов и коммуникации. Идеальна для пропагандистского сектора.",
        correctSector: "propaganda"
      },
      {
        id: 9,
        name: "Игорь Лебедев",
        traits: [
          { name: "Инвестиции", correct: true },
          { name: "Экономика", correct: true },
          { name: "Финансы", correct: true }
        ],
        description: "Смелый инвестор с глубоким пониманием экономики. Отлично подходит для экономического сектора.",
        correctSector: "economic"
      },
      {
        id: 10,
        name: "Наталья Козлова",
        traits: [
          { name: "Стратегия", correct: true },
          { name: "Тактика", correct: true },
          { name: "Военное дело", correct: true }
        ],
        description: "Стратегический планировщик с отличными тактическими навыками. Идеальна для военного сектора.",
        correctSector: "military"
      },
      {
        id: 11,
        name: "Михаил Соколов",
        traits: [
          { name: "Политика", correct: true },
          { name: "Харизма", correct: true },
          { name: "Лидерство", correct: true }
        ],
        description: "Харизматичный политик с природными лидерскими качествами. Отлично подходит для политического сектора.",
        correctSector: "political"
      },
      {
        id: 12,
        name: "Татьяна Воробьева",
        traits: [
          { name: "Креативность", correct: true },
          { name: "Медиа", correct: true },
          { name: "Коммуникация", correct: true }
        ],
        description: "Креативный медиа-специалист с отличными коммуникативными навыками. Идеальна для пропагандистского сектора.",
        correctSector: "propaganda"
      },
      {
        id: 13,
        name: "Андрей Медведев",
        traits: [
          { name: "Тактика", correct: true },
          { name: "Командование", correct: true },
          { name: "Храбрость", correct: true }
        ],
        description: "Храбрый военный командир с тактическим мышлением. Отлично подходит для военного сектора.",
        correctSector: "military"
      },
      {
        id: 14,
        name: "Екатерина Романова",
        traits: [
          { name: "Наука", correct: true },
          { name: "Эксперименты", correct: true },
          { name: "Креативность", correct: true }
        ],
        description: "Креативный ученый с любовью к экспериментам. Идеальна для исследовательского сектора.",
        correctSector: "research"
      }
    ];
  }
}

// Инициализация квеста при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  new WorldGovernmentQuest();
});
