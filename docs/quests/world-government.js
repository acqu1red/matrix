// Квест "Мировое тайное правительство"
class WorldGovernmentQuest {
  constructor() {
    this.characters = this.generateCharacters();
    this.currentCharacterIndex = 0;
    this.sectors = {
      political: { max: 4, members: [], name: 'Политический' },
      military: { max: 3, members: [], name: 'Военный' },
      economic: { max: 2, members: [], name: 'Экономический' },
      research: { max: 2, members: [], name: 'Исследовательский' },
      propaganda: { max: 3, members: [], name: 'Пропагандистский' }
    };
    this.draggedElement = null;
    this.results = [];
    this.currentResultIndex = 0;
    this.failureProbability = 0;
    
    this.init();
  }

  init() {
    this.bindEvents();
    this.loadCurrentCharacter();
    this.updateSectorCounts();
  }

  bindEvents() {
    // Кнопка начала квеста
    document.getElementById('start-quest').addEventListener('click', () => {
      this.hideWarning();
    });

    // Кнопка пропуска персонажа
    document.getElementById('skip-character').addEventListener('click', () => {
      this.skipCharacter();
    });

    // Кнопка завершения создания
    document.getElementById('finish-creation').addEventListener('click', () => {
      this.showFinishModal();
    });

    // Модальные окна
    document.getElementById('confirm-finish').addEventListener('click', () => {
      this.hideFinishModal();
      this.startResults();
    });

    document.getElementById('cancel-finish').addEventListener('click', () => {
      this.hideFinishModal();
    });

    document.getElementById('next-result').addEventListener('click', () => {
      this.nextResult();
    });

    document.getElementById('finish-results').addEventListener('click', () => {
      this.finishQuest();
    });

    // Модальные окна персонажей
    document.getElementById('close-members').addEventListener('click', () => {
      this.hideMembersModal();
    });

    document.getElementById('close-character-details').addEventListener('click', () => {
      this.hideCharacterDetailsModal();
    });

    // Перетаскивание
    this.setupDragAndDrop();
  }

  hideWarning() {
    document.getElementById('warning-modal').classList.remove('active');
    document.getElementById('main-interface').classList.remove('hidden');
  }

  showFinishModal() {
    document.getElementById('finish-modal').classList.add('active');
  }

  hideFinishModal() {
    document.getElementById('finish-modal').classList.remove('active');
  }

  setupDragAndDrop() {
    const characterCard = document.getElementById('current-character');
    const sectors = document.querySelectorAll('.sector');

    // Drag events для персонажа (PC)
    characterCard.addEventListener('dragstart', (e) => {
      this.draggedElement = characterCard;
      characterCard.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });

    characterCard.addEventListener('dragend', () => {
      characterCard.classList.remove('dragging');
      this.draggedElement = null;
    });

    // Touch events для персонажа (Mobile)
    let touchStartX = 0;
    let touchStartY = 0;
    let isDragging = false;
    let draggedElement = null;

    characterCard.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      isDragging = false;
      draggedElement = characterCard;
      
      // Добавляем небольшую задержку для определения длительного нажатия
      setTimeout(() => {
        if (draggedElement === characterCard) {
          isDragging = true;
          characterCard.classList.add('dragging');
          characterCard.style.position = 'fixed';
          characterCard.style.zIndex = '1000';
          characterCard.style.pointerEvents = 'none';
        }
      }, 200);
    });

    characterCard.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (!isDragging) return;
      
      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;
      
      // Проверяем, что движение достаточно большое для начала перетаскивания
      if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
        isDragging = true;
        characterCard.classList.add('dragging');
        characterCard.style.position = 'fixed';
        characterCard.style.zIndex = '1000';
        characterCard.style.pointerEvents = 'none';
      }
      
      if (isDragging) {
        characterCard.style.left = (touch.clientX - characterCard.offsetWidth / 2) + 'px';
        characterCard.style.top = (touch.clientY - characterCard.offsetHeight / 2) + 'px';
        
        // Проверяем, над каким сектором находится палец
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
    });

    characterCard.addEventListener('touchend', (e) => {
      e.preventDefault();
      if (!isDragging) return;
      
      const touch = e.changedTouches[0];
      const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
      const sectorBelow = elementBelow?.closest('.sector');
      
      // Убираем подсветку со всех секторов
      sectors.forEach(s => s.classList.remove('drag-over'));
      
      // Сбрасываем стили персонажа
      characterCard.classList.remove('dragging');
      characterCard.style.position = '';
      characterCard.style.zIndex = '';
      characterCard.style.left = '';
      characterCard.style.top = '';
      characterCard.style.pointerEvents = '';
      
      // Если персонаж был отпущен над сектором, назначаем его туда
      if (sectorBelow) {
        const sectorType = sectorBelow.dataset.sector;
        const sectorData = this.sectors[sectorType];
        
        if (sectorData.members.length < sectorData.max) {
          this.assignCharacterToSector(sectorType);
        }
      }
      
      isDragging = false;
      draggedElement = null;
    });

    // Drop events для секторов (PC)
    sectors.forEach(sector => {
      sector.addEventListener('dragover', (e) => {
        e.preventDefault();
        const sectorType = sector.dataset.sector;
        const sectorData = this.sectors[sectorType];
        
        if (sectorData.members.length < sectorData.max) {
          sector.classList.add('drag-over');
        }
      });

      sector.addEventListener('dragleave', () => {
        sector.classList.remove('drag-over');
      });

      sector.addEventListener('drop', (e) => {
        e.preventDefault();
        sector.classList.remove('drag-over');
        const sectorType = sector.dataset.sector;
        const sectorData = this.sectors[sectorType];
        
        if (sectorData.members.length < sectorData.max) {
          this.assignCharacterToSector(sectorType);
        }
      });
    });
  }

  assignCharacterToSector(sectorType) {
    const currentCharacter = this.getNextValidCharacter();
    if (!currentCharacter) {
      alert('Нет подходящих персонажей для размещения!');
      return;
    }

    const sector = this.sectors[sectorType];

    if (sector.members.length >= sector.max) {
      alert(`Сектор ${sector.name} уже заполнен!`);
      return;
    }

    // Проверяем, подходит ли персонаж для этого сектора
    const isCorrect = this.isCharacterCorrectForSector(currentCharacter, sectorType);
    
    sector.members.push({
      ...currentCharacter,
      isCorrect,
      assignedTo: sectorType
    });

    this.updateSectorDisplay(sectorType);
    this.loadNextCharacter();
    this.updateFinishButton();
    this.updateSectorVisibility();
    
    // Принудительное обновление для исправления багов
    setTimeout(() => {
      this.updateSectorVisibility();
      this.updateFinishButton();
    }, 100);
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
    
    // Обновляем отображение членов
    membersElement.innerHTML = '';
    
    if (sector.members.length === 0) {
      return;
    }
    
    if (sector.members.length === 1) {
      const tag = document.createElement('div');
      tag.className = `member-tag ${sector.members[0].isCorrect ? 'correct' : 'incorrect'}`;
      tag.textContent = sector.members[0].name.split(' ')[0];
      tag.title = sector.members[0].name;
      membersElement.appendChild(tag);
    } else {
      // Показываем первого и "и другие..."
      const tag = document.createElement('div');
      tag.className = `member-tag ${sector.members[0].isCorrect ? 'correct' : 'incorrect'}`;
      tag.textContent = `${sector.members[0].name.split(' ')[0]} и другие...`;
      tag.title = `Нажмите для просмотра всех ${sector.members.length} персонажей`;
      tag.style.cursor = 'pointer';
      tag.addEventListener('click', () => this.showMembersList(sectorType));
      membersElement.appendChild(tag);
    }
  }

  updateSectorCounts() {
    Object.keys(this.sectors).forEach(sectorType => {
      this.updateSectorDisplay(sectorType);
    });
    this.updateSectorVisibility();
  }

  loadCurrentCharacter() {
    const character = this.getNextValidCharacter();
    if (!character) {
      // Если нет подходящих персонажей, показываем сообщение
      const characterCard = document.getElementById('current-character');
      characterCard.innerHTML = `
        <div class="character-name">Нет подходящих персонажей</div>
        <div class="character-description">Все доступные секторы заполнены или нет персонажей для оставшихся секторов.</div>
      `;
      characterCard.draggable = false;
      return;
    }

    const characterCard = document.getElementById('current-character');
    
    characterCard.innerHTML = `
      <div class="character-name">${character.name}</div>
      <div class="character-traits">
        ${character.traits.map(trait => `<span class="trait">${trait}</span>`).join('')}
      </div>
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

    // Анализируем каждую ошибку
    Object.entries(this.sectors).forEach(([sectorType, sector]) => {
      const incorrectMembers = sector.members.filter(member => !member.isCorrect);
      
      incorrectMembers.forEach(member => {
        const result = this.generateErrorResult(member, sectorType);
        this.results.push(result);
        
        // Увеличиваем вероятность неудачи
        const sectorWeight = this.getSectorWeight(sectorType);
        this.failureProbability += sectorWeight * 15;
      });
    });

    // Добавляем успешные результаты
    const successResults = this.generateSuccessResults();
    this.results.push(...successResults);

    // Перемешиваем результаты
    this.results = this.shuffleArray(this.results);
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

  generateErrorResult(member, sectorType) {
    const errorScenarios = {
      political: [
        `${member.name} пытается свергнуть власть, используя свои лидерские качества для подрыва авторитета.`,
        `${member.name} создает фракцию внутри политического сектора, что угрожает единству правительства.`,
        `${member.name} использует свое положение для личной выгоды, игнорируя интересы организации.`
      ],
      military: [
        `${member.name} планирует военный переворот, используя доступ к военным ресурсам.`,
        `${member.name} создает тайную армию лоялистов, готовых к мятежу.`,
        `${member.name} подрывает военную дисциплину, распространяя недоверие среди солдат.`
      ],
      economic: [
        `${member.name} ворует средства из казны, используя экономические знания для сокрытия следов.`,
        `${member.name} создает параллельную экономическую систему, подрывая финансовую стабильность.`,
        `${member.name} манипулирует рынками в личных целях, нанося ущерб экономике.`
      ],
      research: [
        `${member.name} разрабатывает опасные технологии, которые могут быть использованы против правительства.`,
        `${member.name} продает секретные исследования конкурентам за личную выгоду.`,
        `${member.name} создает биологическое оружие, угрожающее безопасности всего мира.`
      ],
      propaganda: [
        `${member.name} распространяет дезинформацию, подрывая доверие к правительству.`,
        `${member.name} создает оппозиционные СМИ, разжигающие недовольство среди населения.`,
        `${member.name} манипулирует общественным мнением против интересов организации.`
      ]
    };

    const scenarios = errorScenarios[sectorType] || errorScenarios.political;
    const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    
    // Проверяем, можно ли истребить
    const correctMembers = this.sectors[sectorType].members.filter(m => m.isCorrect);
    const canEliminate = correctMembers.length >= 2;

    return {
      type: 'error',
      title: 'Обнаружена угроза!',
      content: scenario,
      canEliminate,
      sectorType,
      member
    };
  }

  generateSuccessResults() {
    const successResults = [];
    const totalCorrect = Object.values(this.sectors).reduce((sum, sector) => 
      sum + sector.members.filter(m => m.isCorrect).length, 0
    );

    if (totalCorrect >= 12) {
      successResults.push({
        type: 'success',
        title: 'Мировое господство!',
        content: 'Ваше тайное правительство успешно установило контроль над миром. США под вашим влиянием ввела санкции Ирану, Европа приняла ваши экономические реформы, а Китай признал ваше лидерство в технологической сфере.'
      });
    } else if (totalCorrect >= 9) {
      successResults.push({
        type: 'success',
        title: 'Региональное влияние!',
        content: 'Ваше правительство установило контроль над несколькими ключевыми регионами. Европа и Северная Америка находятся под вашим влиянием.'
      });
    } else if (totalCorrect >= 6) {
      successResults.push({
        type: 'success',
        title: 'Локальный контроль!',
        content: 'Ваше правительство контролирует несколько важных стран. Система работает стабильно, но требует расширения.'
      });
    }

    return successResults;
  }

  showResult() {
    if (this.currentResultIndex >= this.results.length) {
      // Показываем все сюжеты, затем проверяем вероятность неудачи
      if (this.failureProbability >= 80) {
        this.showFailureResult();
      } else {
        this.showFinalResult();
      }
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

    if (result.type === 'error' && result.canEliminate) {
      content.innerHTML += `
        <div style="margin-top: 15px;">
          <button class="btn btn-primary" onclick="quest.eliminateThreat('${result.sectorType}', '${result.member.name}')">
            Истребить угрозу
          </button>
        </div>
      `;
    }

    // Показываем вероятность неудачи
    if (this.failureProbability > 0) {
      probabilityDiv.textContent = `Вероятность неудачи: ${Math.min(this.failureProbability, 100).toFixed(1)}%`;
      probabilityDiv.classList.remove('hidden');
    } else {
      probabilityDiv.classList.add('hidden');
    }

    nextButton.classList.remove('hidden');
    finishButton.classList.add('hidden');
    
    modal.classList.add('active');
  }

  eliminateThreat(sectorType, memberName) {
    // Удаляем угрозу
    this.sectors[sectorType].members = this.sectors[sectorType].members.filter(
      m => m.name !== memberName
    );
    
    // Уменьшаем вероятность неудачи
    const sectorWeight = this.getSectorWeight(sectorType);
    this.failureProbability -= sectorWeight * 15;
    
    // Обновляем отображение
    this.updateSectorDisplay(sectorType);
    
    // Показываем сообщение об успешном устранении
    const content = document.getElementById('results-content');
    content.innerHTML = `
      <p style="color: var(--success);">✅ Угроза ${memberName} успешно устранена!</p>
      <p>Вероятность неудачи снижена.</p>
    `;
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

    title.textContent = 'Миссия завершена!';
    content.innerHTML = `
      <p>Анализ результатов завершен. Ваше тайное правительство готово к работе.</p>
      <div style="margin-top: 20px; padding: 15px; background: var(--bg1); border-radius: var(--radius-sm);">
        <h4>Итоговая статистика:</h4>
        ${Object.entries(this.sectors).map(([type, sector]) => 
          `<div>${sector.name}: ${sector.members.length}/${sector.max} (${sector.members.filter(m => m.isCorrect).length} правильных)</div>`
        ).join('')}
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
    alert('Квест завершен! Награды выданы.');
  }

  giveRewards() {
    // Здесь должна быть интеграция с системой наград
    console.log('Выдано: 500 MULACOIN и 1000 опыта');
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
      characters.push({
        name: name,
        traits: politicalType1Traits[index],
        description: 'Человек крепкого телосложения, активный, энергичный. Одевается практично и строго. Постоянно в движении. Ровная осанка и уверенность в движениях. Громкий голос, быстрый ровный темп речи. В общении на значимые цели с оппонентами конфликтен.',
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
      characters.push({
        name: name,
        traits: politicalType2Traits[index],
        description: 'Диапазон внешности сильно варьируется. Стиль – от официального до спортивного. Аккуратность от средней до большой. На лице выражение готовности, создается впечатление, что он прислушивается. Ведомая роль в общении. Вопросительные интонации даже в утвердительных предложениях.',
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
      characters.push({
        name: name,
        traits: militaryType1Traits[index],
        description: 'Человек нормального среднего телосложения. Одет аккуратно: обычно классический стиль одежды. Говорит четко и громко. Речь хорошо организована и понятна. Добросовестно выполняет нормы ритуального общения. В общении или доминирует или подчиняется.',
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
      characters.push({
        name: name,
        traits: militaryType2Traits[index],
        description: 'Человек среднего или крепкого телосложения, активный, энергичный. Одевается практично и удобно. Постоянно в движении. В действиях ориентируется на целесообразность, а не на внешнее впечатление. Громкий, ровный тон голоса, средний темп речи. В общении на значимые цели с оппонентами конфликтен.',
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
      characters.push({
        name: name,
        traits: economicType1Traits[index],
        description: 'Одевается в нейтральном стиле. Степень аккуратности внешнего вида – средняя. На лице - выражение недовольства, расстройства, а не спокойствия. Не склонен проявлять агрессивные эмоции вовне. Общение признает как средство изложения жалоб, претензий. Любит потрясать слушающих его людей невероятными сообщениями.',
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
      characters.push({
        name: name,
        traits: economicType2Traits[index],
        description: 'Человек среднего или худощавого телосложения. В одежде предпочитает свободный стиль. Чувство вкуса в одежде выражено слабо. Говорит быстро, четко и громко. Громкий голос и быстрый темп, часто изменяется на средние показатели за время произнесения устного сообщения. В общении склонен к автономности.',
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
      characters.push({
        name: name,
        traits: economicType3Traits[index],
        description: 'Человек крепкого телосложения, пассивный, неэнергичный. Внешне замкнут, мимика слабовыраженная. На лице - выражение замкнутости, погруженности во внутренний мир. Неаккуратен в одежде. Речь слабо артикулированная, рваная, плохо модулированная, с задержками и паузами. В общении весьма избирателен.',
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
      characters.push({
        name: name,
        traits: propagandaType1Traits[index],
        description: 'Одевается в ярком спортивном или смешанном стиле. Степень аккуратности внешнего вида – средняя. Богатая положительными эмоциями мимика. Заразительный смех. На лице - выражение радости и веселья. Повышенная общительность. Высокая контактность. Быстрый темп речи, соответственно короткие паузы в небольшом количестве.',
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
      characters.push({
        name: name,
        traits: propagandaType2Traits[index],
        description: 'Оригинальная прическа, одежда, отдельные детали костюма. Любит ярлыки и фирменные знаки на одежде. Шумное, эпатирующее, привлекающее внимание поведение. Артистичен. Предпочитает монологи о себе. Любит публичные формы общения. Общается с теми, кто им восхищается. Часто меняет круг общения.',
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
      characters.push({
        name: name,
        traits: propagandaType3Traits[index],
        description: 'Оригинальная прическа, одежда, отдельные детали костюма. Любит ярлыки и фирменные знаки на одежде. Шумное, эпатирующее, привлекающее внимание поведение. Артистичен. Самостоятелен и независим. Предпочитает монологи о себе. Любит публичные формы общения. Общается с теми, кто им восхищается.',
        correctSector: 'propaganda'
      });
    });

    return this.shuffleArray(characters);
  }

  showMembersList(sectorType) {
    const sector = this.sectors[sectorType];
    const modal = document.getElementById('members-modal');
    const title = document.getElementById('members-title');
    const list = document.getElementById('members-list');

    title.textContent = `Персонажи в ${sector.name} штабе`;
    list.innerHTML = '';

    sector.members.forEach((member, index) => {
      const item = document.createElement('div');
      item.className = 'member-item';
      item.innerHTML = `
        <div class="member-item-name">${member.name}</div>
        <div class="member-item-traits">
          ${member.traits.map(trait => `<span class="member-item-trait">${trait}</span>`).join('')}
        </div>
      `;
      
      item.addEventListener('click', () => {
        this.showCharacterDetails(member);
      });
      
      list.appendChild(item);
    });

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

  updateSectorVisibility() {
    Object.entries(this.sectors).forEach(([sectorType, sector]) => {
      const sectorElement = document.querySelector(`[data-sector="${sectorType}"]`);
      
      if (sector.members.length >= sector.max) {
        // Сектор заполнен - делаем его полупрозрачным и неактивным
        sectorElement.style.opacity = '0.5';
        sectorElement.style.pointerEvents = 'none';
        sectorElement.classList.add('filled');
        
        // Добавляем индикатор заполнения
        const countElement = sectorElement.querySelector('.sector-count');
        countElement.style.color = 'var(--success)';
        countElement.style.fontWeight = 'bold';
      } else {
        // Сектор не заполнен - возвращаем нормальный вид
        sectorElement.style.opacity = '1';
        sectorElement.style.pointerEvents = 'auto';
        sectorElement.classList.remove('filled');
        
        // Возвращаем нормальный вид счетчика
        const countElement = sectorElement.querySelector('.sector-count');
        countElement.style.color = 'var(--glow2)';
        countElement.style.fontWeight = 'normal';
      }
    });
  }
}

// Инициализация квеста при загрузке страницы
let quest;
document.addEventListener('DOMContentLoaded', () => {
  quest = new WorldGovernmentQuest();
});
