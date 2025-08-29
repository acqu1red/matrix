// Мировое тайное правительство - Основная логика
class WorldGovernmentQuest {
  constructor() {
    this.stories = new WorldGovernmentStories();
    this.currentStory = null;
    this.storyIndex = 0;
    this.isAudioEnabled = true;
    this.currentVideo = null;
    this.storyQueue = [];
    this.assignments = {};
    
    this.initializeEventListeners();
    this.loadCharacters();
  }

  // Инициализация обработчиков событий
  initializeEventListeners() {
    // Кнопка начала квеста
    document.getElementById('start-quest').addEventListener('click', () => {
      this.startQuest();
    });

    // Кнопка возврата на главную
    document.getElementById('back-to-main').addEventListener('click', () => {
      this.returnToMain();
    });

    // Кнопка завершения создания
    document.getElementById('finish-creation').addEventListener('click', () => {
      this.showFinishModal();
    });

    // Подтверждение завершения
    document.getElementById('confirm-finish').addEventListener('click', () => {
      this.finishCreation();
    });

    // Отмена завершения
    document.getElementById('cancel-finish').addEventListener('click', () => {
      this.hideFinishModal();
    });

    // Переключение звука
    document.getElementById('toggle-sound').addEventListener('click', () => {
      this.toggleAudio();
    });

    // Обработчики для секторов
    this.initializeSectorEventListeners();
    
    // Обработчики для модального окна сюжетов
    document.getElementById('continue-story').addEventListener('click', () => {
      this.hideStory();
      this.showNextStory();
    });
    
    document.getElementById('skip-story').addEventListener('click', () => {
      this.hideStory();
      this.showNextStory();
    });

    // Обработчики для модальных окон
    document.getElementById('close-members').addEventListener('click', () => {
      document.getElementById('members-modal').classList.remove('active');
    });

    document.getElementById('close-character-details').addEventListener('click', () => {
      document.getElementById('character-details-modal').classList.remove('active');
    });
  }

  // Инициализация обработчиков для секторов
  initializeSectorEventListeners() {
    const sectors = document.querySelectorAll('.sector');
    sectors.forEach(sector => {
      sector.addEventListener('click', () => {
        this.showSectorMembers(sector.dataset.sector);
      });
    });
  }

  // Начало квеста
  startQuest() {
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

  // Показ сюжета с видео фоном
  showStoryWithVideo(story) {
    const storyModal = document.getElementById('story-modal');
    const storyTitle = document.getElementById('story-title');
    const storyText = document.getElementById('story-text');
    const videoBackground = document.getElementById('story-video-background');
    
    // Устанавливаем заголовок и текст
    storyTitle.textContent = story.title;
    storyText.textContent = story.content;
    
    // Настраиваем видео фон
    if (story.video && this.stories.getVideoBackground(story)) {
      const video = document.createElement('video');
      video.src = this.stories.getVideoBackground(story);
      video.autoplay = true;
      video.muted = true;
      video.loop = true;
      video.style.width = '100%';
      video.style.height = '100%';
      video.style.objectFit = 'cover';
      
      // Очищаем предыдущее видео
      videoBackground.innerHTML = '';
      videoBackground.appendChild(video);
      videoBackground.style.display = 'block';
    } else {
      videoBackground.style.display = 'none';
    }
    
    // Показываем модальное окно
    storyModal.classList.add('show');
    
    // Останавливаем фоновую музыку на время показа сюжета
    if (this.isAudioEnabled) {
      const audio = document.getElementById('horror-audio');
      if (audio) {
        audio.pause();
      }
    }
  }

  // Скрытие сюжета
  hideStory() {
    const storyModal = document.getElementById('story-modal');
    storyModal.classList.remove('show');
    
    // Возобновляем фоновую музыку
    if (this.isAudioEnabled) {
      const audio = document.getElementById('horror-audio');
      if (audio) {
        audio.play().catch(e => console.log('Аудио не может быть воспроизведено:', e));
      }
    }
  }

  // Показ следующего сюжета
  showNextStory() {
    if (this.storyQueue.length > 0) {
      const nextStory = this.storyQueue.shift();
      this.showStoryWithVideo(nextStory);
    } else {
      // Все сюжеты показаны, показываем финальные результаты
      this.showFinalResults();
    }
  }

  // Показ финальных результатов
  showFinalResults() {
    // Здесь можно добавить логику для показа финальных результатов
    console.log('Все сюжеты показаны, показываем финальные результаты');
  }

  // Получение данных секторов
  getSectorsData() {
    const sectors = {};
    const sectorElements = document.querySelectorAll('.sector');
    
    sectorElements.forEach(sector => {
      const sectorType = sector.dataset.sector;
      const members = Array.from(sector.querySelectorAll('.sector-member')).map(member => {
        return {
          name: member.dataset.name,
          isCorrect: member.dataset.isCorrect === 'true'
        };
      });
      
      sectors[sectorType] = { members };
    });
    
    return sectors;
  }

  // Загрузка персонажей
  loadCharacters() {
    this.characters = this.getDefaultCharacters();
    this.currentCharacterIndex = 0;
    this.showCurrentCharacter();
  }

  // Получение персонажей по умолчанию
  getDefaultCharacters() {
    return [
      {
        name: "Александр Петров",
        traits: ["Лидерство", "Харизма", "Стратегическое мышление"],
        description: "Опытный политик с харизмой лидера. Идеально подходит для политического сектора.",
        correctSector: "political"
      },
      {
        name: "Мария Сидорова",
        traits: ["Аналитика", "Логика", "Внимание к деталям"],
        description: "Блестящий аналитик с опытом работы в спецслужбах. Отлично подходит для исследовательского сектора.",
        correctSector: "research"
      },
      {
        name: "Дмитрий Козлов",
        traits: ["Финансы", "Экономика", "Переговоры"],
        description: "Эксперт по международным финансам. Идеален для экономического сектора.",
        correctSector: "economic"
      },
      {
        name: "Елена Воробьева",
        traits: ["Пропаганда", "Психология", "Манипуляции"],
        description: "Мастер пропаганды и психологических манипуляций. Подходит для пропагандистского сектора.",
        correctSector: "propaganda"
      },
      {
        name: "Сергей Морозов",
        traits: ["Военная стратегия", "Тактика", "Командование"],
        description: "Опытный военный стратег с опытом спецопераций. Идеален для военного сектора.",
        correctSector: "military"
      },
      {
        name: "Анна Ковалева",
        traits: ["Дипломатия", "Международные отношения", "Языки"],
        description: "Дипломат высокого уровня с обширными международными связями. Подходит для политического сектора.",
        correctSector: "political"
      },
      {
        name: "Виктор Соколов",
        traits: ["Кибербезопасность", "Программирование", "Анализ данных"],
        description: "Эксперт по кибербезопасности и информационным технологиям. Идеален для исследовательского сектора.",
        correctSector: "research"
      },
      {
        name: "Ирина Медведева",
        traits: ["Маркетинг", "Брендинг", "Социальные сети"],
        description: "Специалист по маркетингу и управлению общественным мнением. Подходит для пропагандистского сектора.",
        correctSector: "propaganda"
      },
      {
        name: "Павел Волков",
        traits: ["Логистика", "Снабжение", "Операции"],
        description: "Опытный специалист по логистике и операционному управлению. Идеален для военного сектора.",
        correctSector: "military"
      },
      {
        name: "Ольга Новикова",
        traits: ["Банковское дело", "Инвестиции", "Риск-менеджмент"],
        description: "Финансовый эксперт с опытом работы в крупнейших банках мира. Подходит для экономического сектора.",
        correctSector: "economic"
      }
    ];
  }

  // Показать текущего персонажа
  showCurrentCharacter() {
    if (this.currentCharacterIndex < this.characters.length) {
      const character = this.characters[this.currentCharacterIndex];
      const characterCard = document.getElementById('current-character');
      
      characterCard.innerHTML = `
        <div class="character-name">${character.name}</div>
        <div class="character-traits">
          ${character.traits.map(trait => `<span class="trait">${trait}</span>`).join('')}
        </div>
        <div class="character-description">${character.description}</div>
        <div class="character-actions">
          <button class="btn btn-secondary" onclick="quest.assignToSector('${character.correctSector}')">
            Назначить в ${this.getSectorName(character.correctSector)}
          </button>
        </div>
      `;
    } else {
      // Все персонажи назначены
      document.getElementById('finish-creation').disabled = false;
    }
  }

  // Получение названия сектора
  getSectorName(sector) {
    const names = {
      political: "Политический штаб",
      military: "Военный штаб",
      economic: "Экономический штаб",
      research: "Исследовательский штаб",
      propaganda: "Пропагандический штаб"
    };
    return names[sector] || sector;
  }

  // Назначение персонажа в сектор
  assignToSector(sector) {
    if (this.currentCharacterIndex < this.characters.length) {
      const character = this.characters[this.currentCharacterIndex];
      
      // Добавляем персонажа в сектор
      if (!this.assignments[sector]) this.assignments[sector] = [];
      
      this.assignments[sector].push(character);
      
      // Обновляем отображение сектора
      this.updateSectorDisplay(sector);
      
      // Переходим к следующему персонажу
      this.currentCharacterIndex++;
      this.showCurrentCharacter();
    }
  }

  // Обновление отображения сектора
  updateSectorDisplay(sector) {
    const sectorElement = document.querySelector(`[data-sector="${sector}"]`);
    const countElement = sectorElement.querySelector('.sector-count');
    const membersElement = sectorElement.querySelector('.sector-members');
    
    const count = this.assignments[sector].length;
    const maxCount = this.getMaxSectorCount(sector);
    
    countElement.textContent = `${count}/${maxCount}`;
    
    // Показываем имена персонажей
    membersElement.innerHTML = this.assignments[sector]
      .map(char => `<div class="sector-member" data-name="${char.name}" data-is-correct="true">${char.name}</div>`)
      .join('');
  }

  // Получение максимального количества персонажей для сектора
  getMaxSectorCount(sector) {
    const maxCounts = {
      political: 4,
      military: 3,
      economic: 2,
      research: 2,
      propaganda: 3
    };
    return maxCounts[sector] || 0;
  }

  // Показать модальное окно завершения
  showFinishModal() {
    document.getElementById('finish-modal').classList.add('active');
  }

  // Скрыть модальное окно завершения
  hideFinishModal() {
    document.getElementById('finish-modal').classList.remove('active');
  }

  // Завершение создания
  finishCreation() {
    this.hideFinishModal();
    
    // Генерируем последовательность сюжетов
    const sectors = this.getSectorsData();
    this.storyQueue = this.stories.generateFullStorySequence(sectors, this.assignments);
    
    // Показываем первый сюжет
    if (this.storyQueue.length > 0) {
      const firstStory = this.storyQueue.shift();
      this.showStoryWithVideo(firstStory);
    }
  }

  // Начало последовательности сюжетов
  startStorySequence() {
    this.storyIndex = 0;
    
    // Показываем первый сюжет
    this.showNextStory();
  }

  // Показать следующий сюжет
  showNextStory() {
    if (this.storyIndex < this.storyQueue.length) {
      const story = this.storyQueue[this.storyIndex];
      this.currentStory = story;
      this.showStoryModal(story);
    } else {
      // Все сюжеты показаны, показываем финальные результаты
      this.showFinalResults();
    }
  }

  // Показать модальное окно сюжета
  showStoryModal(story) {
    const storyModal = document.getElementById('story-modal');
    const storyTitle = document.getElementById('story-title');
    const storyText = document.getElementById('story-text');
    
    storyTitle.textContent = story.title;
    storyText.innerHTML = story.content;
    
    // Воспроизводим видео-фон если есть
    if (story.video) {
      this.playVideoBackground(story.video);
      storyModal.classList.add('with-video');
    } else {
      this.stopVideoBackground();
      storyModal.classList.remove('with-video');
    }
    
    storyModal.classList.add('active');
  }

  // Воспроизведение видео-фона
  playVideoBackground(videoPath) {
    const videoBackground = document.getElementById('video-background');
    const video = document.getElementById('background-video');
    
    video.src = videoPath;
    video.play().catch(e => console.log('Видео не может быть воспроизведено'));
    
    videoBackground.classList.remove('hidden');
    videoBackground.classList.add('active');
  }

  // Остановка видео-фона
  stopVideoBackground() {
    const videoBackground = document.getElementById('video-background');
    const video = document.getElementById('background-video');
    
    video.pause();
    videoBackground.classList.add('hidden');
    videoBackground.classList.remove('active');
  }

  // Продолжить сюжет
  continueStory() {
    const storyModal = document.getElementById('story-modal');
    storyModal.classList.remove('active');
    
    // Если сюжет требует действия, показываем модальное окно действия
    if (this.currentStory.requiresAction) {
      this.showActionModal(this.currentStory);
    } else {
      // Переходим к следующему сюжету
      this.storyIndex++;
      this.showNextStory();
    }
  }

  // Показать модальное окно действия
  showActionModal(story) {
    const actionModal = document.getElementById('action-modal');
    const actionTitle = document.getElementById('action-title');
    const actionText = document.getElementById('action-text');
    const actionOptions = document.getElementById('action-options');
    
    actionTitle.textContent = story.actionTitle || 'Требуется действие';
    actionText.innerHTML = story.actionText || story.content;
    
    // Генерируем опции действий
    if (story.actionOptions) {
      actionOptions.innerHTML = story.actionOptions.map(option => `
        <div class="action-option">
          <input type="radio" name="action" value="${option.value}" id="option-${option.value}">
          <label for="option-${option.value}">${option.label}</label>
        </div>
      `).join('');
    } else {
      actionOptions.innerHTML = `
        <div class="action-option">
          <input type="radio" name="action" value="confirm" id="option-confirm" checked>
          <label for="option-confirm">Подтвердить</label>
        </div>
      `;
    }
    
    actionModal.classList.add('active');
  }

  // Скрыть модальное окно действия
  hideActionModal() {
    document.getElementById('action-modal').classList.remove('active');
  }

  // Подтвердить действие
  confirmAction() {
    const selectedAction = document.querySelector('input[name="action"]:checked');
    
    if (selectedAction) {
      const actionValue = selectedAction.value;
      this.processAction(actionValue);
    }
    
    this.hideActionModal();
  }

  // Обработка действия
  processAction(actionValue) {
    // Генерируем результат действия
    const result = this.generateActionResult(actionValue);
    
    // Показываем результат
    this.showActionResult(result);
  }

  // Генерация результата действия
  generateActionResult(actionValue) {
    const story = this.currentStory;
    
    if (actionValue === 'eliminate' && story.canEliminate) {
      return {
        title: 'Предатель устранен',
        content: 'Ваши агенты успешно устранили угрозу. Организация спасена от внутреннего раскола.',
        type: 'success'
      };
    } else if (actionValue === 'negotiate') {
      return {
        title: 'Переговоры проведены',
        content: 'Вам удалось договориться с оппозицией. Кризис разрешен мирным путем.',
        type: 'success'
      };
    } else {
      return {
        title: 'Действие выполнено',
        content: 'Ваше решение принято и выполнено. Последствия будут видны в ближайшее время.',
        type: 'neutral'
      };
    }
  }

  // Показать результат действия
  showActionResult(result) {
    const resultModal = document.getElementById('result-modal');
    const resultTitle = document.getElementById('result-title');
    const resultText = document.getElementById('result-text');
    
    resultTitle.textContent = result.title;
    resultText.innerHTML = result.content;
    
    resultModal.classList.add('active');
  }

  // Показать следующий результат действия
  showNextResultAction() {
    const resultModal = document.getElementById('result-modal');
    resultModal.classList.remove('active');
    
    // Переходим к следующему сюжету
    this.storyIndex++;
    this.showNextStory();
  }

  // Показать финальные результаты
  showFinalResults() {
    const finalModal = document.getElementById('final-results-modal');
    const finalSummary = document.getElementById('final-summary');
    const finalStats = document.getElementById('final-stats');
    const finalRewards = document.getElementById('final-rewards');
    
    // Анализируем результаты
    const totalPersonnel = Object.values(this.assignments).reduce((sum, arr) => sum + (arr?.length || 0), 0);
    const hasCrises = this.storyQueue.some(story => story.type === "error");
    
    let resultType, resultText, rewards;
    
    if (totalPersonnel >= 12 && !hasCrises) {
      resultType = "Триумф";
      resultText = "Ваше тайное правительство достигло абсолютного успеха!";
      rewards = "Опыт: +1000, MULACOIN: +500";
    } else if (totalPersonnel >= 8 && !hasCrises) {
      resultType = "Успех";
      resultText = "Ваше тайное правительство успешно создано!";
      rewards = "Опыт: +500, MULACOIN: +250";
    } else if (totalPersonnel >= 5) {
      resultType = "Частичный успех";
      resultText = "Ваше тайное правительство создано, но есть проблемы.";
      rewards = "Опыт: +200, MULACOIN: +100";
    } else {
      resultType = "Провал";
      resultText = "Создание тайного правительства провалилось.";
      rewards = "Опыт: +50, MULACOIN: +25";
    }
    
    finalSummary.innerHTML = `
      <h3>${resultType}</h3>
      <p>${resultText}</p>
    `;
    
    finalStats.innerHTML = `
      <div class="stat">
        <span class="stat-label">Всего персонала:</span>
        <span class="stat-value">${totalPersonnel}</span>
      </div>
      <div class="stat">
        <span class="stat-label">Кризисы:</span>
        <span class="stat-value">${hasCrises ? 'Да' : 'Нет'}</span>
      </div>
    `;
    
    finalRewards.innerHTML = `
      <h4>Награды:</h4>
      <p>${rewards}</p>
    `;
    
    finalModal.classList.add('active');
  }

  // Показать членов сектора
  showSectorMembers(sector) {
    const membersModal = document.getElementById('members-modal');
    const membersTitle = document.getElementById('members-title');
    const membersList = document.getElementById('members-list');
    
    membersTitle.textContent = `Персонажи в ${this.getSectorName(sector)}`;
    
    if (this.assignments && this.assignments[sector]) {
      membersList.innerHTML = this.assignments[sector]
        .map(char => `
          <div class="member-item">
            <div class="member-name">${char.name}</div>
            <div class="member-traits">
              ${char.traits.map(trait => `<span class="trait">${trait}</span>`).join('')}
            </div>
          </div>
        `)
        .join('');
    } else {
      membersList.innerHTML = '<p>В этом секторе пока нет персонажей</p>';
    }
    
    membersModal.classList.add('active');
  }

  // Возврат на главную
  returnToMain() {
    // Останавливаем аудио
    const audio = document.getElementById('horror-audio');
    if (audio) audio.pause();
    
    window.location.href = '../quests.html';
  }
}

// Инициализация квеста при загрузке страницы
let quest;
document.addEventListener('DOMContentLoaded', () => {
  quest = new WorldGovernmentQuest();
});

// Глобальные функции для вызова из HTML
function assignToSector(sector) {
  if (quest) {
    quest.assignToSector(sector);
  }
}

function showSectorMembers(sector) {
  if (quest) {
    quest.showSectorMembers(sector);
  }
}
