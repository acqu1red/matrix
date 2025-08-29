// Мировое тайное правительство - Основная логика
class WorldGovernmentQuest {
  constructor() {
    this.stories = new WorldGovernmentStories();
    this.currentStory = null;
    this.storyIndex = 0;
    this.isAudioEnabled = true;
    this.currentVideo = null;
    
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

    // Кнопка продолжения в результатах
    document.getElementById('next-result').addEventListener('click', () => {
      this.showNextResult();
    });

    // Завершение результатов
    document.getElementById('finish-results').addEventListener('click', () => {
      this.finishResults();
    });

    // Кнопка продолжения в сюжете
    document.getElementById('continue-story').addEventListener('click', () => {
      this.continueStory();
    });

    // Переключение звука
    document.getElementById('toggle-sound').addEventListener('click', () => {
      this.toggleAudio();
    });

    // Подтверждение действия
    document.getElementById('confirm-action').addEventListener('click', () => {
      this.confirmAction();
    });

    // Отмена действия
    document.getElementById('cancel-action').addEventListener('click', () => {
      this.hideActionModal();
    });

    // Следующий результат действия
    document.getElementById('next-result-action').addEventListener('click', () => {
      this.showNextResultAction();
    });

    // Возврат на главную из финальных результатов
    document.getElementById('return-to-main').addEventListener('click', () => {
      this.returnToMain();
    });

    // Обработчики для секторов
    this.initializeSectorEventListeners();
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
      audio.play().catch(e => console.log('Автовоспроизведение заблокировано'));
    }
  }

  // Переключение аудио
  toggleAudio() {
    this.isAudioEnabled = !this.isAudioEnabled;
    const audio = document.getElementById('horror-audio');
    const soundIcon = document.querySelector('.sound-icon');
    
    if (this.isAudioEnabled) {
      audio.play();
      soundIcon.textContent = '🔊';
    } else {
      audio.pause();
      soundIcon.textContent = '🔇';
    }
  }

  // Загрузка персонажей
  loadCharacters() {
    // Здесь должна быть логика загрузки персонажей
    // Пока используем заглушку
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
      if (!this.assignments) this.assignments = {};
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
      .map(char => `<div class="member-name">${char.name}</div>`)
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
    
    // Генерируем все сюжеты
    const allStories = this.stories.generateAllStories(this.assignments);
    
    // Начинаем показ сюжетов
    this.startStorySequence(allStories);
  }

  // Начало последовательности сюжетов
  startStorySequence(stories) {
    this.storyIndex = 0;
    this.stories.resetStoryIndex();
    
    // Показываем первый сюжет
    this.showNextStory();
  }

  // Показать следующий сюжет
  showNextStory() {
    const story = this.stories.getNextStory();
    
    if (story) {
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
      this.stories.playVideoBackground(story.video);
    } else {
      this.stories.playVideoBackground(null);
    }
    
    storyModal.classList.add('active');
  }

  // Продолжить сюжет
  continueStory() {
    const storyModal = document.getElementById('story-modal');
    storyModal.classList.remove('active');
    
    // Показываем следующий сюжет
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
    const hasCrises = this.stories.storyQueue.some(story => story.type === "crisis" || story.type === "error");
    
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
    window.location.href = '../quests.html';
  }

  // Скрыть модальное окно действия
  hideActionModal() {
    document.getElementById('action-modal').classList.remove('active');
  }

  // Подтвердить действие
  confirmAction() {
    // Логика подтверждения действия
    this.hideActionModal();
  }

  // Показать следующий результат действия
  showNextResultAction() {
    // Логика показа следующего результата
    document.getElementById('result-modal').classList.remove('active');
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
