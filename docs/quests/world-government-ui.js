/* ===== WORLD GOVERNMENT UI ===== */

// UI контроллер для квеста "Тайное мировое сообщество"
class WorldGovernmentUI {
  constructor(engine) {
    this.engine = engine;
    this.draggedElement = null;
    this.dragOverElement = null;
    this.currentModal = null;
    
    this.initializeUI();
  }
  
  // Инициализация UI
  initializeUI() {
    this.setupEventListeners();
    this.renderSectors();
    this.renderCharacters();
    this.updateSectorCounts();
    this.updateGameStats();
    
    console.log('🌍 World Government UI initialized');
  }
  
  // Настройка обработчиков событий
  setupEventListeners() {
    // Drag and Drop события
    document.addEventListener('dragstart', this.handleDragStart.bind(this));
    document.addEventListener('dragend', this.handleDragEnd.bind(this));
    document.addEventListener('dragover', this.handleDragOver.bind(this));
    document.addEventListener('drop', this.handleDrop.bind(this));
    document.addEventListener('dragenter', this.handleDragEnter.bind(this));
    document.addEventListener('dragleave', this.handleDragLeave.bind(this));
    
    // Клики по кнопкам
    document.addEventListener('click', this.handleClick.bind(this));
    
    // Звук
    const soundToggle = document.querySelector('.toggle-sound');
    if (soundToggle) {
      soundToggle.addEventListener('click', this.toggleSound.bind(this));
    }
    
    // Кнопка возврата
    const backButton = document.querySelector('.back-to-main');
    if (backButton) {
      backButton.addEventListener('click', this.goBackToMain.bind(this));
    }
    
    // Кнопка завершения
    const finishButton = document.querySelector('.finish-creation');
    if (finishButton) {
      finishButton.addEventListener('click', this.finishQuest.bind(this));
    }
  }
  
  // Обработка начала перетаскивания
  handleDragStart(event) {
    if (event.target.classList.contains('character-card')) {
      this.draggedElement = event.target;
      event.target.classList.add('dragging');
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/html', event.target.outerHTML);
    }
  }
  
  // Обработка окончания перетаскивания
  handleDragEnd(event) {
    if (event.target.classList.contains('character-card')) {
      event.target.classList.remove('dragging');
      this.draggedElement = null;
    }
  }
  
  // Обработка перетаскивания над элементом
  handleDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }
  
  // Обработка входа в зону перетаскивания
  handleDragEnter(event) {
    if (event.target.classList.contains('sector') || 
        event.target.classList.contains('candidate-drop-zone')) {
      event.target.classList.add('drag-over');
      this.dragOverElement = event.target;
    }
  }
  
  // Обработка выхода из зоны перетаскивания
  handleDragLeave(event) {
    if (event.target.classList.contains('sector') || 
        event.target.classList.contains('candidate-drop-zone')) {
      event.target.classList.remove('drag-over');
      this.dragOverElement = null;
    }
  }
  
  // Обработка сброса
  handleDrop(event) {
    event.preventDefault();
    
    if (this.draggedElement && this.dragOverElement) {
      const characterId = this.draggedElement.dataset.characterId;
      let targetSectorId = null;
      
      // Определяем целевой сектор
      if (this.dragOverElement.classList.contains('sector')) {
        targetSectorId = this.dragOverElement.dataset.sectorId;
      } else if (this.dragOverElement.classList.contains('candidate-drop-zone')) {
        targetSectorId = this.dragOverElement.dataset.sectorId;
      }
      
      if (targetSectorId) {
        // Удаляем персонажа из текущего сектора
        this.engine.removeCharacterFromAllSectors(characterId);
        
        // Добавляем в новый сектор
        if (this.engine.addCharacterToSector(characterId, targetSectorId)) {
          this.renderSectors();
          this.renderCharacters();
          this.updateSectorCounts();
          this.updateGameStats();
          
          // Анимация успешного добавления
          this.showSuccessAnimation(this.dragOverElement);
        } else {
          // Анимация ошибки
          this.showErrorAnimation(this.dragOverElement);
        }
      }
    }
    
    // Убираем классы drag-over
    if (this.dragOverElement) {
      this.dragOverElement.classList.remove('drag-over');
      this.dragOverElement = null;
    }
  }
  
  // Обработка кликов
  handleClick(event) {
    const target = event.target;
    
    // Клик по персонажу для просмотра деталей
    if (target.classList.contains('character-card') || 
        target.closest('.character-card')) {
      const characterCard = target.classList.contains('character-card') ? 
        target : target.closest('.character-card');
      const characterId = characterCard.dataset.characterId;
      this.showCharacterDetails(characterId);
    }
    
    // Клик по сектору для просмотра членов
    if (target.classList.contains('sector') || 
        target.closest('.sector')) {
      const sector = target.classList.contains('sector') ? 
        target : target.closest('.sector');
      const sectorId = sector.dataset.sectorId;
      this.showSectorMembers(sectorId);
    }
    
    // Клик по кнопке закрытия модала
    if (target.classList.contains('close') || 
        target.classList.contains('modal-close')) {
      this.closeCurrentModal();
    }
    
    // Клик по кнопке завершения
    if (target.classList.contains('finish-creation')) {
      this.finishQuest();
    }
  }
  
  // Переключение звука
  toggleSound() {
    const isMuted = this.engine.audioController.toggleMute();
    const soundToggle = document.querySelector('.toggle-sound');
    
    if (soundToggle) {
      if (isMuted) {
        soundToggle.innerHTML = '🔇';
        soundToggle.title = 'Включить звук';
      } else {
        soundToggle.innerHTML = '🔊';
        soundToggle.title = 'Отключить звук';
      }
    }
  }
  
  // Возврат на главную
  goBackToMain() {
    if (confirm('Вы уверены, что хотите вернуться на главную? Все несохраненные изменения будут потеряны.')) {
      window.location.href = '../quests.html';
    }
  }
  
  // Завершение квеста
  finishQuest() {
    if (!this.engine.canFinishQuest()) {
      this.showModal('warning', {
        title: '⚠️ Недостаточно персонажей',
        content: 'Для завершения квеста необходимо назначить минимум 6 персонажей в 3 различных сектора.',
        buttons: [{ text: 'Понятно', class: 'btn primary' }]
      });
      return;
    }
    
    // Генерируем результаты
    const results = this.engine.generateQuestResults();
    
    // Показываем результаты
    this.showQuestResults(results);
  }
  
  // Рендеринг секторов
  renderSectors() {
    const islandContainer = document.querySelector('.island-container');
    if (!islandContainer) return;
    
    // Очищаем существующие секторы
    const existingSectors = islandContainer.querySelectorAll('.sector');
    existingSectors.forEach(sector => sector.remove());
    
    // Создаем новые секторы
    Object.entries(this.engine.sectors).forEach(([sectorId, sector]) => {
      const sectorElement = this.createSectorElement(sectorId, sector);
      islandContainer.appendChild(sectorElement);
    });
  }
  
  // Создание элемента сектора
  createSectorElement(sectorId, sector) {
    const sectorDiv = document.createElement('div');
    sectorDiv.className = `sector ${sectorId}-sector`;
    sectorDiv.dataset.sectorId = sectorId;
    sectorDiv.style.left = this.getSectorPosition(sectorId).left;
    sectorDiv.style.top = this.getSectorPosition(sectorId).top;
    
    sectorDiv.innerHTML = `
      <div class="sector-label">${sector.icon} ${sector.name}</div>
      <div class="sector-count">${sector.members.length}/${sector.maxMembers}</div>
      <div class="sector-members">
        ${sector.members.map(member => `
          <div class="sector-member" data-character-id="${member.id}">
            ${member.name}
          </div>
        `).join('')}
      </div>
    `;
    
    return sectorDiv;
  }
  
  // Получение позиции сектора
  getSectorPosition(sectorId) {
    const positions = {
      political: { left: '20%', top: '15%' },
      military: { left: '70%', top: '25%' },
      economic: { left: '45%', top: '60%' },
      research: { left: '15%', top: '70%' },
      propaganda: { left: '75%', top: '65%' }
    };
    
    return positions[sectorId] || { left: '50%', top: '50%' };
  }
  
  // Рендеринг персонажей
  renderCharacters() {
    const characterContainer = document.querySelector('.character-container');
    if (!characterContainer) return;
    
    // Очищаем существующих персонажей
    characterContainer.innerHTML = '';
    
    // Получаем доступных персонажей
    const availableCharacters = this.engine.characters.filter(char => {
      // Проверяем, не назначен ли персонаж уже в сектор
      return !Object.values(this.engine.sectors).some(sector => 
        sector.members.some(member => member.id === char.id)
      );
    });
    
    // Создаем карточки персонажей
    availableCharacters.forEach(character => {
      const characterCard = this.createCharacterCard(character);
      characterContainer.appendChild(characterCard);
    });
  }
  
  // Создание карточки персонажа
  createCharacterCard(character) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'character-card';
    cardDiv.dataset.characterId = character.id;
    cardDiv.draggable = true;
    
    cardDiv.innerHTML = `
      <div class="character-avatar">${character.sector === 'political' ? '🏛️' : 
                                      character.sector === 'military' ? '⚔️' : 
                                      character.sector === 'economic' ? '💰' : 
                                      character.sector === 'research' ? '🔬' : '📺'}</div>
      <div class="character-name">${character.name}</div>
      <div class="character-traits">${character.traits}</div>
      <div class="character-description">${character.description}</div>
    `;
    
    return cardDiv;
  }
  
  // Обновление счетчиков секторов
  updateSectorCounts() {
    Object.entries(this.engine.sectors).forEach(([sectorId, sector]) => {
      const sectorElement = document.querySelector(`[data-sector-id="${sectorId}"]`);
      if (sectorElement) {
        const countElement = sectorElement.querySelector('.sector-count');
        if (countElement) {
          countElement.textContent = `${sector.members.length}/${sector.maxMembers}`;
        }
      }
    });
  }
  
  // Обновление игровой статистики
  updateGameStats() {
    const stats = this.engine.getGameStats();
    
    // Обновляем общий счет
    const overallScore = document.querySelector('.overall-score');
    if (overallScore) {
      overallScore.textContent = stats.overall;
    }
    
    // Обновляем детали секторов
    stats.sectors.forEach(sector => {
      const sectorElement = document.querySelector(`[data-sector-id="${sector.id}"]`);
      if (sectorElement) {
        // Обновляем цвет в зависимости от статуса
        if (sector.status === 'active') {
          sectorElement.style.borderColor = this.engine.sectors[sector.id].color;
        } else {
          sectorElement.style.borderColor = '#666';
        }
      }
    });
  }
  
  // Показ деталей персонажа
  showCharacterDetails(characterId) {
    const character = this.engine.characters.find(c => c.id === characterId);
    if (!character) return;
    
    const modal = this.createModal('character-details', {
      title: `👤 ${character.name}`,
      content: `
        <div class="character-details-content">
          <div class="character-details-name">${character.name}</div>
          <div class="character-details-traits">${character.traits}</div>
          <div class="character-details-description">${character.description}</div>
          <div class="character-details-skills">
            <h4>Навыки:</h4>
            <ul>
              ${character.skills.map(skill => `<li>${skill}</li>`).join('')}
            </ul>
          </div>
          <div class="character-details-strengths">
            <h4>Сильные стороны:</h4>
            <ul>
              ${character.strengths.map(strength => `<li>${strength}</li>`).join('')}
            </ul>
          </div>
          <div class="character-details-weaknesses">
            <h4>Слабые стороны:</h4>
            <ul>
              ${character.weaknesses.map(weakness => `<li>${weakness}</li>`).join('')}
            </ul>
          </div>
          <div class="character-details-compatibility">
            <h4>Совместимость с секторами:</h4>
            <div class="compatibility-grid">
              ${Object.entries(character.compatibility).map(([sectorId, value]) => `
                <div class="compatibility-item">
                  <span class="sector-name">${this.engine.sectors[sectorId]?.name || sectorId}</span>
                  <span class="compatibility-value">${value}%</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `,
      buttons: [
        { text: 'Закрыть', class: 'btn secondary' }
      ]
    });
    
    this.showModal(modal);
  }
  
  // Показ членов сектора
  showSectorMembers(sectorId) {
    const sector = this.engine.sectors[sectorId];
    if (!sector) return;
    
    const modal = this.createModal('sector-members', {
      title: `${sector.icon} ${sector.name}`,
      content: `
        <div class="sector-members-content">
          <div class="sector-description">${sector.description}</div>
          <div class="sector-stats">
            <div class="sector-stat">
              <span class="stat-label">Членов:</span>
              <span class="stat-value">${sector.members.length}/${sector.maxMembers}</span>
            </div>
            <div class="sector-stat">
              <span class="stat-label">Эффективность:</span>
              <span class="stat-value">${this.engine.getSectorScore(sectorId)}%</span>
            </div>
          </div>
          <div class="members-list">
            <h4>Назначенные персонажи:</h4>
            ${sector.members.length > 0 ? 
              sector.members.map(member => `
                <div class="member-item">
                  <span class="member-name">${member.name}</span>
                  <span class="member-traits">${member.traits}</span>
                  <button class="btn danger small" onclick="worldGovernmentUI.removeCharacterFromSector('${member.id}', '${sectorId}')">
                    Убрать
                  </button>
                </div>
              `).join('') : 
              '<p class="no-members">Нет назначенных персонажей</p>'
            }
          </div>
        </div>
      `,
      buttons: [
        { text: 'Закрыть', class: 'btn secondary' }
      ]
    });
    
    this.showModal(modal);
  }
  
  // Удаление персонажа из сектора
  removeCharacterFromSector(characterId, sectorId) {
    if (this.engine.removeCharacterFromSector(characterId, sectorId)) {
      this.renderSectors();
      this.renderCharacters();
      this.updateSectorCounts();
      this.updateGameStats();
      this.closeCurrentModal();
    }
  }
  
  // Показ результатов квеста
  showQuestResults(results) {
    // Генерируем сюжетную последовательность
    const storySequence = this.engine.generateStorySequence();
    
    // Показываем результаты
    const modal = this.createModal('quest-results', {
      title: results.title,
      content: `
        <div class="quest-results-content">
          <div class="result-description">${results.description}</div>
          <div class="result-stats">
            <h4>Статистика по секторам:</h4>
            ${Object.entries(results.sectorDetails).map(([sectorId, details]) => `
              <div class="sector-result">
                <span class="sector-name">${details.name}</span>
                <span class="sector-score">${details.score}%</span>
                <span class="sector-status ${details.status}">${details.status === 'active' ? 'Активен' : 'Неактивен'}</span>
              </div>
            `).join('')}
          </div>
          <div class="result-rewards">
            <h4>Награды:</h4>
            <div class="rewards-list">
              <div class="reward-item">
                <span class="reward-icon">🥇</span>
                <span class="reward-label">MULACOIN:</span>
                <span class="reward-value">+${results.rewards.mulacoin}</span>
              </div>
              <div class="reward-item">
                <span class="reward-icon">⭐</span>
                <span class="reward-label">Опыт:</span>
                <span class="reward-value">+${results.rewards.exp}</span>
              </div>
              <div class="reward-item">
                <span class="reward-icon">📈</span>
                <span class="reward-label">Уровень:</span>
                <span class="reward-value">+${results.rewards.level}</span>
              </div>
            </div>
          </div>
        </div>
      `,
      buttons: [
        { text: 'Показать сюжет', class: 'btn primary', action: () => this.showStorySequence(storySequence) },
        { text: 'Завершить', class: 'btn secondary', action: () => this.completeQuest(results) }
      ]
    });
    
    this.showModal(modal);
  }
  
  // Показ сюжетной последовательности
  showStorySequence(storySequence) {
    let currentIndex = 0;
    
    const showNextStory = () => {
      if (currentIndex >= storySequence.length) {
        this.closeCurrentModal();
        return;
      }
      
      const story = storySequence[currentIndex];
      
      // Проверяем, есть ли видео
      if (story.video) {
        this.engine.videoController.playVideo(story.video);
      }
      
      const modal = this.createModal('story-sequence', {
        title: story.title,
        content: `
          <div class="story-content">
            <p>${story.content}</p>
            ${story.video ? '<div class="video-playing">🎬 Видео воспроизводится на фоне</div>' : ''}
          </div>
        `,
        buttons: [
          { text: 'Следующая история', class: 'btn primary', action: () => {
            if (story.video) {
              this.engine.videoController.stopVideo(story.video);
            }
            currentIndex++;
            showNextStory();
          }},
          { text: 'Пропустить', class: 'btn secondary', action: () => {
            if (story.video) {
              this.engine.videoController.stopVideo(story.video);
            }
            currentIndex++;
            showNextStory();
          }}
        ]
      });
      
      this.showModal(modal);
    };
    
    showNextStory();
  }
  
  // Завершение квеста
  completeQuest(results) {
    // Здесь можно добавить логику сохранения результатов
    // и возврата на главную страницу
    
    this.showModal('quest-complete', {
      title: '🎉 Квест завершен!',
      content: `
        <div class="quest-complete-content">
          <p>Поздравляем! Вы успешно завершили квест "Тайное мировое сообщество".</p>
          <p>Ваш результат: <strong>${results.title}</strong></p>
          <p>Награды будут добавлены к вашему аккаунту.</p>
        </div>
      `,
      buttons: [
        { text: 'Вернуться на главную', class: 'btn primary', action: () => {
          window.location.href = '../quests.html';
        }}
      ]
    });
  }
  
  // Создание модального окна
  createModal(type, options) {
    const modal = document.createElement('div');
    modal.className = `modal ${type}-modal`;
    modal.dataset.modalType = type;
    
    modal.innerHTML = `
      <div class="modalContent glass">
        <div class="modal-header">
          <h3>${options.title}</h3>
          <button class="close modal-close">&times;</button>
        </div>
        <div class="modal-body">
          ${options.content}
        </div>
        <div class="modal-footer">
          ${options.buttons.map(button => `
            <button class="btn ${button.class}" ${button.action ? 'data-action="true"' : ''}>
              ${button.text}
            </button>
          `).join('')}
        </div>
      </div>
    `;
    
    // Добавляем обработчики для кнопок с действиями
    const actionButtons = modal.querySelectorAll('[data-action="true"]');
    actionButtons.forEach((button, index) => {
      if (options.buttons[index] && options.buttons[index].action) {
        button.addEventListener('click', options.buttons[index].action);
      }
    });
    
    return modal;
  }
  
  // Показ модального окна
  showModal(modal) {
    // Закрываем предыдущий модал
    this.closeCurrentModal();
    
    // Показываем новый
    document.body.appendChild(modal);
    modal.classList.add('active');
    this.currentModal = modal;
    
    // Добавляем обработчик для закрытия по клику вне модала
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeCurrentModal();
      }
    });
  }
  
  // Закрытие текущего модального окна
  closeCurrentModal() {
    if (this.currentModal) {
      this.currentModal.classList.remove('active');
      setTimeout(() => {
        if (this.currentModal && this.currentModal.parentNode) {
          this.currentModal.parentNode.removeChild(this.currentModal);
        }
        this.currentModal = null;
      }, 300);
    }
  }
  
  // Показ анимации успеха
  showSuccessAnimation(element) {
    element.classList.add('success-animation');
    setTimeout(() => {
      element.classList.remove('success-animation');
    }, 1000);
  }
  
  // Показ анимации ошибки
  showErrorAnimation(element) {
    element.classList.add('error-animation');
    setTimeout(() => {
      element.classList.remove('error-animation');
    }, 1000);
  }
  
  // Обновление UI
  updateUI() {
    this.renderSectors();
    this.renderCharacters();
    this.updateSectorCounts();
    this.updateGameStats();
  }
  
  // Сброс UI
  resetUI() {
    this.closeCurrentModal();
    this.updateUI();
  }
}

// Экспорт класса
window.WorldGovernmentUI = WorldGovernmentUI;
