// Квест "Тайное мировое сообщество" - Полностью переписанная версия
class WorldGovernmentQuest {
  constructor() {
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
    this.dragOverElement = null;
    this.storySystem = new WorldGovernmentStories();
    this.audioSystem = new AudioSystem();
    this.videoSystem = new VideoSystem();
    
    // Состояние квеста
    this.questPhase = 'setup'; // 'setup', 'story', 'complete'
    this.currentStoryIndex = 0;
    this.stories = [];
    
    // Анимации
    this.animationFrameId = null;
    this.lastUpdateTime = 0;
    
    this.init();
  }

  init() {
    this.cacheDOMElements();
    this.bindEvents();
    this.setupDragAndDrop();
    this.loadCurrentCharacter();
    this.updateSectorCounts();
    this.audioSystem.init();
    this.videoSystem.init();
  }

  cacheDOMElements() {
    this.domCache = {
      currentCharacter: document.getElementById('current-character'),
      finishButton: document.getElementById('finish-creation'),
      skipButton: document.getElementById('skip-character'),
      sectors: document.querySelectorAll('.sector'),
      storyModal: document.getElementById('story-modal'),
      storyTitle: document.getElementById('story-title'),
      storyText: document.getElementById('story-text'),
      storyActions: document.getElementById('story-actions'),
      soundBtn: document.getElementById('soundBtn')
    };
  }

  bindEvents() {
    const eventHandlers = {
      'start-quest': () => this.hideWarning(),
      'back-to-main': () => this.goToMain(),
      'skip-character': () => this.skipCharacter(),
      'finish-creation': () => this.showFinishModal(),
      'confirm-finish': () => {
        this.hideFinishModal();
        this.startStoryPhase();
      },
      'cancel-finish': () => this.hideFinishModal(),
      'soundBtn': () => this.audioSystem.toggleSound()
    };

    Object.entries(eventHandlers).forEach(([id, handler]) => {
      const element = document.getElementById(id);
      if (element) {
        const boundHandler = handler.bind(this);
        element.addEventListener('click', boundHandler);
        this.eventListeners.set(id, { element, handler: boundHandler });
      }
    });
  }

  setupDragAndDrop() {
    // Drag & Drop для персонажей
    this.domCache.currentCharacter.addEventListener('dragstart', (e) => {
      this.draggedElement = e.target;
      e.target.style.opacity = '0.5';
      e.dataTransfer.effectAllowed = 'move';
    });

    this.domCache.currentCharacter.addEventListener('dragend', (e) => {
      e.target.style.opacity = '1';
      this.draggedElement = null;
    });

    // Обработка секторов
    this.domCache.sectors.forEach(sector => {
      sector.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        this.dragOverElement = sector;
        sector.classList.add('drag-over');
      });

      sector.addEventListener('dragenter', (e) => {
        e.preventDefault();
        sector.classList.add('drag-over');
      });

      sector.addEventListener('dragleave', (e) => {
        if (!sector.contains(e.relatedTarget)) {
          sector.classList.remove('drag-over');
          this.dragOverElement = null;
        }
      });

      sector.addEventListener('drop', (e) => {
        e.preventDefault();
        sector.classList.remove('drag-over');
        this.dragOverElement = null;
        
        if (this.draggedElement) {
          this.assignCharacterToSector(this.draggedElement, sector);
        }
      });

      // Клик по сектору для просмотра членов
      sector.addEventListener('click', () => {
        this.showSectorMembers(sector.dataset.sector);
      });
    });
  }

  assignCharacterToSector(characterElement, sector) {
    const sectorType = sector.dataset.sector;
    const character = this.characters[this.currentCharacterIndex];
    
    if (this.sectors[sectorType].members.length >= this.sectors[sectorType].max) {
      this.showToast('Сектор переполнен!', 'error');
      return;
    }

    // Добавляем персонажа в сектор
    this.sectors[sectorType].members.push(character);
    
    // Обновляем отображение сектора
    this.updateSectorDisplay(sectorType);
    
    // Показываем анимацию успешного назначения
    this.showAssignmentAnimation(sector, character);
    
    // Переходим к следующему персонажу
    this.nextCharacter();
    
    // Проверяем, можно ли завершить создание
    this.checkFinishAvailability();
  }

  showAssignmentAnimation(sector, character) {
    // Создаем анимированный элемент
    const animationElement = document.createElement('div');
    animationElement.className = 'assignment-animation';
    animationElement.innerHTML = `
      <div class="assignment-avatar">${character.avatar}</div>
      <div class="assignment-name">${character.name}</div>
    `;
    
    // Позиционируем относительно сектора
    const sectorRect = sector.getBoundingClientRect();
    animationElement.style.cssText = `
      position: fixed;
      top: ${sectorRect.top}px;
      left: ${sectorRect.left}px;
      z-index: 10000;
      animation: assignmentSuccess 1s ease-out forwards;
    `;
    
    document.body.appendChild(animationElement);
    
    // Удаляем после анимации
    setTimeout(() => {
      document.body.removeChild(animationElement);
    }, 1000);
  }

  updateSectorDisplay(sectorType) {
    const sector = document.querySelector(`[data-sector="${sectorType}"]`);
    const countElement = sector.querySelector('.sector-count');
    const membersElement = sector.querySelector('.sector-members');
    
    // Обновляем счетчик
    countElement.textContent = `${this.sectors[sectorType].members.length}/${this.sectors[sectorType].max}`;
    
    // Обновляем список членов
    membersElement.innerHTML = '';
    this.sectors[sectorType].members.forEach((member, index) => {
      const avatar = document.createElement('div');
      avatar.className = 'member-avatar';
      avatar.textContent = member.avatar;
      avatar.title = `${member.name} - ${member.description}`;
      avatar.style.animationDelay = `${index * 0.1}s`;
      membersElement.appendChild(avatar);
    });
    
    // Анимация сектора при заполнении
    if (this.sectors[sectorType].members.length === this.sectors[sectorType].max) {
      sector.classList.add('full');
      this.showSectorFullAnimation(sector);
    }
  }

  showSectorFullAnimation(sector) {
    sector.style.animation = 'sectorFull 0.6s ease-in-out';
    setTimeout(() => {
      sector.style.animation = '';
    }, 600);
  }

  nextCharacter() {
    this.currentCharacterIndex++;
    if (this.currentCharacterIndex >= this.characters.length) {
      this.currentCharacterIndex = 0; // Зацикливаем персонажей
    }
    this.loadCurrentCharacter();
  }

  loadCurrentCharacter() {
    const character = this.characters[this.currentCharacterIndex];
    const characterCard = this.domCache.currentCharacter;
    
    characterCard.innerHTML = `
      <div class="character-avatar" draggable="true">${character.avatar}</div>
      <div class="character-name">${character.name}</div>
      <div class="character-stats">
        <div class="stat-item">
          <div class="stat-label">Лидерство</div>
          <div class="stat-value">${character.leadership}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Интеллект</div>
          <div class="stat-value">${character.intelligence}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Харизма</div>
          <div class="stat-value">${character.charisma}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Лояльность</div>
          <div class="stat-value">${character.loyalty}</div>
        </div>
      </div>
      <div class="character-description">${character.description}</div>
    `;
    
    // Анимация появления карточки
    characterCard.style.animation = 'cardSlideIn 0.5s ease-out';
    setTimeout(() => {
      characterCard.style.animation = '';
    }, 500);
  }

  skipCharacter() {
    this.nextCharacter();
  }

  updateSectorCounts() {
    Object.keys(this.sectors).forEach(sectorType => {
      this.updateSectorDisplay(sectorType);
    });
  }

  checkFinishAvailability() {
    const totalMembers = Object.values(this.sectors).reduce((sum, sector) => sum + sector.members.length, 0);
    const totalMax = Object.values(this.sectors).reduce((sum, sector) => sum + sector.max, 0);
    
    if (totalMembers >= totalMax * 0.8) { // Можно завершить при 80% заполнения
      this.domCache.finishButton.disabled = false;
      this.domCache.finishButton.style.animation = 'buttonPulse 2s ease-in-out infinite';
    }
  }

  showFinishModal() {
    document.getElementById('finish-modal').classList.add('active');
  }

  hideFinishModal() {
    document.getElementById('finish-modal').classList.remove('active');
  }

  startStoryPhase() {
    this.questPhase = 'story';
    this.audioSystem.playHorrorMusic();
    
    // Генерируем сюжеты на основе состава штабов
    this.stories = this.storySystem.generateStories(this.sectors);
    this.currentStoryIndex = 0;
    
    // Показываем первый сюжет
    this.showNextStory();
  }

  showNextStory() {
    if (this.currentStoryIndex >= this.stories.length) {
      this.completeQuest();
      return;
    }

    const story = this.stories[this.currentStoryIndex];
    
    // Показываем видео фон если есть
    if (story.video) {
      this.videoSystem.showVideoBackground(story.video);
    }
    
    // Обновляем модальное окно
    this.domCache.storyTitle.textContent = story.title;
    this.domCache.storyText.textContent = story.content;
    
    // Создаем кнопки действий
    this.createStoryActions(story);
    
    // Показываем модальное окно
    this.domCache.storyModal.classList.add('active');
  }

  createStoryActions(story) {
    const actionsContainer = this.domCache.storyActions;
    actionsContainer.innerHTML = '';
    
    if (story.actions) {
      story.actions.forEach(action => {
        const button = document.createElement('button');
        button.className = `btn ${action.type === 'danger' ? 'btn-danger' : 'btn-primary'}`;
        button.textContent = action.text;
        button.onclick = () => this.handleStoryAction(action, story);
        actionsContainer.appendChild(button);
      });
    } else {
      // Стандартная кнопка "Продолжить"
      const continueBtn = document.createElement('button');
      continueBtn.className = 'btn btn-primary';
      continueBtn.textContent = 'Продолжить';
      continueBtn.onclick = () => this.continueStory();
      actionsContainer.appendChild(continueBtn);
    }
  }

  handleStoryAction(action, story) {
    if (action.callback) {
      action.callback(this.sectors);
    }
    
    // Скрываем видео фон
    this.videoSystem.hideVideoBackground();
    
    // Переходим к следующему сюжету
    this.currentStoryIndex++;
    this.showNextStory();
  }

  continueStory() {
    // Скрываем видео фон
    this.videoSystem.hideVideoBackground();
    
    // Переходим к следующему сюжету
    this.currentStoryIndex++;
    this.showNextStory();
  }

  completeQuest() {
    this.questPhase = 'complete';
    this.audioSystem.stopHorrorMusic();
    this.videoSystem.hideVideoBackground();
    
    // Показываем финальный сюжет
    this.showFinalStory();
  }

  showFinalStory() {
    const finalStory = this.storySystem.generateFinalStory(this.sectors);
    
    this.domCache.storyTitle.textContent = finalStory.title;
    this.domCache.storyText.textContent = finalStory.content;
    
    // Финальные кнопки
    this.domCache.storyActions.innerHTML = `
      <button class="btn btn-primary" onclick="window.location.href='../quests.html'">Вернуться к квестам</button>
      <button class="btn btn-secondary" onclick="location.reload()">Пройти заново</button>
    `;
    
    this.domCache.storyModal.classList.add('active');
  }

  showSectorMembers(sectorType) {
    const sector = this.sectors[sectorType];
    const members = sector.members;
    
    if (members.length === 0) {
      this.showToast(`${sector.name} штаб пуст`, 'info');
      return;
    }
    
    // Создаем модальное окно со списком членов
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>${sector.name} штаб - ${members.length}/${sector.max} членов</h3>
        </div>
        <div class="modal-body">
          <div class="members-grid">
            ${members.map(member => `
              <div class="member-card">
                <div class="member-avatar-large">${member.avatar}</div>
                <div class="member-name">${member.name}</div>
                <div class="member-stats">
                  <div class="stat">Л: ${member.leadership}</div>
                  <div class="stat">И: ${member.intelligence}</div>
                  <div class="stat">Х: ${member.charisma}</div>
                  <div class="stat">Л: ${member.loyalty}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Закрыть</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
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

  hideWarning() {
    document.getElementById('warning-modal').classList.remove('active');
    document.getElementById('main-interface').classList.remove('hidden');
  }

  goToMain() {
    window.location.href = '../quests.html';
  }

  generateCharacters() {
    return [
      {
        name: "Александр Волков",
        avatar: "👨‍💼",
        leadership: 9,
        intelligence: 7,
        charisma: 8,
        loyalty: 9,
        description: "Бывший генерал ФСБ, мастер манипуляций и стратегического планирования"
      },
      {
        name: "Елена Соколова",
        avatar: "👩‍💼",
        leadership: 8,
        intelligence: 9,
        charisma: 7,
        loyalty: 8,
        description: "Экономист-аналитик, эксперт по мировым финансовым системам"
      },
      {
        name: "Дмитрий Морозов",
        avatar: "👨‍🔬",
        leadership: 6,
        intelligence: 10,
        charisma: 5,
        loyalty: 9,
        description: "Гениальный ученый, специалист по квантовой физике и ИИ"
      },
      {
        name: "Анна Петрова",
        avatar: "👩‍⚖️",
        leadership: 7,
        intelligence: 8,
        charisma: 9,
        loyalty: 7,
        description: "Юрист-международник, мастер дипломатии и переговоров"
      },
      {
        name: "Сергей Козлов",
        avatar: "👨‍✈️",
        leadership: 9,
        intelligence: 6,
        charisma: 8,
        loyalty: 8,
        description: "Бывший командующий ВДВ, эксперт по военным операциям"
      },
      {
        name: "Мария Иванова",
        avatar: "👩‍🎭",
        leadership: 5,
        intelligence: 7,
        charisma: 10,
        loyalty: 6,
        description: "Медиа-магнат, владелица крупнейших СМИ и PR-агентств"
      },
      {
        name: "Виктор Смирнов",
        avatar: "👨‍💻",
        leadership: 6,
        intelligence: 9,
        charisma: 6,
        loyalty: 8,
        description: "Хакер-гений, специалист по кибербезопасности и слежке"
      },
      {
        name: "Ольга Новикова",
        avatar: "👩‍🏫",
        leadership: 7,
        intelligence: 8,
        charisma: 7,
        loyalty: 9,
        description: "Психолог-манипулятор, эксперт по массовому сознанию"
      },
      {
        name: "Игорь Лебедев",
        avatar: "👨‍🔧",
        leadership: 5,
        intelligence: 8,
        charisma: 5,
        loyalty: 10,
        description: "Инженер-конструктор, создатель передовых технологий"
      },
      {
        name: "Татьяна Воробьева",
        avatar: "👩‍⚕️",
        leadership: 6,
        intelligence: 7,
        charisma: 8,
        loyalty: 7,
        description: "Врач-генетик, специалист по биологическому оружию"
      },
      {
        name: "Павел Соколов",
        avatar: "👨‍🌾",
        leadership: 8,
        intelligence: 6,
        charisma: 7,
        loyalty: 8,
        description: "Аграрный магнат, контролирует мировые поставки продовольствия"
      },
      {
        name: "Наталья Морозова",
        avatar: "👩‍🎨",
        leadership: 5,
        intelligence: 6,
        charisma: 9,
        loyalty: 6,
        description: "Культуролог, эксперт по влиянию на общественное мнение"
      },
      {
        name: "Артем Козлов",
        avatar: "👨‍🚀",
        leadership: 7,
        intelligence: 8,
        charisma: 6,
        loyalty: 9,
        description: "Космонавт-исследователь, специалист по космическим технологиям"
      },
      {
        name: "Екатерина Смирнова",
        avatar: "👩‍🏭",
        leadership: 6,
        intelligence: 7,
        charisma: 5,
        loyalty: 8,
        description: "Промышленник, владелица военно-промышленного комплекса"
      }
    ];
  }
}

// Система управления аудио
class AudioSystem {
  constructor() {
    this.horrorAudio = null;
    this.isMuted = false;
  }

  init() {
    this.horrorAudio = document.getElementById('horror-audio');
    this.setupSoundControl();
  }

  setupSoundControl() {
    const soundBtn = document.getElementById('soundBtn');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => this.toggleSound());
    }
  }

  toggleSound() {
    this.isMuted = !this.isMuted;
    const soundBtn = document.getElementById('soundBtn');
    
    if (this.isMuted) {
      soundBtn.textContent = '🔇';
      soundBtn.classList.add('muted');
      this.horrorAudio.muted = true;
    } else {
      soundBtn.textContent = '🔊';
      soundBtn.classList.remove('muted');
      this.horrorAudio.muted = false;
    }
  }

  playHorrorMusic() {
    if (!this.isMuted && this.horrorAudio) {
      this.horrorAudio.play().catch(e => console.log('Автовоспроизведение заблокировано:', e));
    }
  }

  stopHorrorMusic() {
    if (this.horrorAudio) {
      this.horrorAudio.pause();
      this.horrorAudio.currentTime = 0;
    }
  }
}

// Система управления видео
class VideoSystem {
  constructor() {
    this.videos = {};
    this.currentVideo = null;
  }

  init() {
    this.videos = {
      meting: document.getElementById('meting-video'),
      besporyadki: document.getElementById('besporyadki-video'),
      razobla4enie: document.getElementById('razobla4enie-video'),
      war: document.getElementById('war-video'),
      puteshestvie: document.getElementById('puteshestvie-video'),
      experement: document.getElementById('experement-video')
    };
  }

  showVideoBackground(videoType) {
    // Скрываем все видео
    this.hideVideoBackground();
    
    // Показываем нужное видео
    if (this.videos[videoType]) {
      this.currentVideo = this.videos[videoType];
      this.currentVideo.style.display = 'block';
      this.currentVideo.play().catch(e => console.log('Ошибка воспроизведения видео:', e));
      
      // Добавляем класс для модального окна
      document.querySelector('.story-content').classList.add('with-video');
    }
  }

  hideVideoBackground() {
    if (this.currentVideo) {
      this.currentVideo.style.display = 'none';
      this.currentVideo.pause();
      this.currentVideo = null;
    }
    
    // Убираем класс для модального окна
    document.querySelector('.story-content').classList.remove('with-video');
  }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  new WorldGovernmentQuest();
});

// Добавляем CSS для новых элементов
const additionalStyles = `
  @keyframes assignmentSuccess {
    0% { transform: scale(1) rotate(0deg); opacity: 1; }
    50% { transform: scale(1.2) rotate(180deg); opacity: 0.8; }
    100% { transform: scale(0) rotate(360deg); opacity: 0; }
  }

  @keyframes sectorFull {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }

  @keyframes buttonPulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }

  .drag-over {
    background: var(--accent-secondary) !important;
    border-color: var(--accent-primary) !important;
    transform: scale(1.1);
    box-shadow: var(--shadow-heavy);
  }

  .sector.full {
    background: var(--accent-primary) !important;
    border-color: var(--accent-primary) !important;
    color: var(--bg-primary) !important;
  }

  .toast {
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--bg-glass);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 15px 20px;
    color: var(--text-primary);
    font-weight: 600;
    z-index: 10000;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    box-shadow: var(--shadow-medium);
  }

  .toast.show {
    transform: translateX(0);
  }

  .toast-error {
    border-color: #ef4444;
    background: rgba(239, 68, 68, 0.1);
  }

  .toast-info {
    border-color: var(--accent-primary);
    background: rgba(231, 175, 62, 0.1);
  }

  .members-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 15px;
    margin-top: 20px;
  }

  .member-card {
    background: var(--bg-light);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 15px;
    text-align: center;
  }

  .member-avatar-large {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: var(--accent-secondary);
    border: 2px solid var(--border-color);
    margin: 0 auto 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
  }

  .member-name {
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 10px;
  }

  .member-stats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 5px;
    font-size: 12px;
  }

  .stat {
    color: var(--text-secondary);
  }

  .assignment-animation {
    background: var(--bg-glass);
    border: 2px solid var(--border-color);
    border-radius: 15px;
    padding: 15px;
    text-align: center;
    box-shadow: var(--shadow-heavy);
  }

  .assignment-avatar {
    font-size: 32px;
    margin-bottom: 5px;
  }

  .assignment-name {
    font-weight: 700;
    color: var(--text-primary);
    font-size: 14px;
  }
`;

// Добавляем стили на страницу
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);
