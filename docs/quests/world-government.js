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
    const sectorTraits = {
      political: ['лидерство', 'дисциплина', 'патриотизм', 'честь', 'аналитика'],
      military: ['агрессивность', 'фанатизм', 'жестокость', 'автономность', 'бескомпромиссность'],
      economic: ['эгоцентризм', 'честолюбие', 'самолюбие', 'талант', 'способности'],
      research: ['интеллект', 'аналитика', 'исследования', 'наука', 'открытия'],
      propaganda: ['эмпатия', 'актерство', 'интриги', 'манипуляции', 'влияние']
    };

    return character.traits.some(trait => 
      sectorTraits[sectorType].some(sectorTrait => 
        trait.toLowerCase().includes(sectorTrait.toLowerCase())
      )
    );
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
    
    // Политические персонажи (20)
    const politicalTraits = [
      ['Лидерство', 'Дисциплина', 'Патриотизм'],
      ['Честь', 'Аналитика', 'Пунктуальность'],
      ['Подчинение долгу', 'Волевые качества', 'Целеустремленность'],
      ['Самостоятельность', 'Нормы и законы', 'Психосаморегуляция'],
      ['Ровность настроения', 'Честолюбие', 'Алгоритмизация'],
      ['Слабая переключаемость', 'Патриотизм', 'Долг'],
      ['Развитые понятия чести', 'Корпоративные нормы', 'Эмоциональное отвержение'],
      ['Ломка стереотипов', 'Неожиданные поручения', 'Психические нагрузки'],
      ['Уязвление самолюбия', 'Равнодушие окружающих', 'Критика достижений'],
      ['Ограничение общения', 'Отсутствие событий', 'Удары по эгоцентризму'],
      ['Сверхценная идея', 'Упорядоченность', 'Самопожертвование'],
      ['Неготовность преступить', 'Низкая эмпатия', 'Аналитический ум'],
      ['Предельные способности', 'Слабая переключаемость', 'Подчинение долгу'],
      ['Развитые понятия чести', 'Корпоративные нормы', 'Эмоциональное отвержение'],
      ['Ломка жизненных стереотипов', 'Неожиданные поручения', 'Психические нагрузки'],
      ['Уязвление самолюбия', 'Равнодушие окружающих', 'Критика достижений'],
      ['Ограничение круга общения', 'Отсутствие ярких событий', 'Удары по эгоцентризму'],
      ['Сверхценная идея', 'Упорядоченность', 'Самопожертвование'],
      ['Неготовность преступить', 'Низкая эмпатия', 'Аналитический ум'],
      ['Предельные способности', 'Слабая переключаемость', 'Подчинение долгу'],
      ['Низкий уровень эмпатии', 'Навыки психосаморегуляции', 'Честолюбие'],
      ['Аналитический тип ума', 'Дисциплинированность', 'Пунктуальность']
    ];

    const politicalNames = [
      'Билл Клинтон', 'Хиллари Родэм', 'Джордж Буш', 'Барак Обама', 'Дональд Трамп',
      'Джо Байден', 'Нэнси Пелоси', 'Митч Макконнелл', 'Александр Петров', 'Елена Соколова',
      'Михаил Козлов', 'Анна Морозова', 'Дмитрий Волков', 'Мария Новикова', 'Сергей Лебедев',
      'Ольга Смирнова', 'Андрей Попов', 'Татьяна Соколова', 'Владимир Морозов', 'Ирина Козлова'
    ];

    politicalTraits.forEach((traits, index) => {
      characters.push({
        name: politicalNames[index],
        traits: traits,
        description: 'Склонен к руководству сверхценной идеей, развитые волевые характеристики, целеустремлен. Способен к самопожертвованию во имя долга, самостоятелен, неготовность преступить нормы и законы.',
        correctSector: 'political'
      });
    });

    // Военные персонажи (16)
    const militaryTraits = [
      ['Агрессивность', 'Фанатизм', 'Жестокость'],
      ['Автономность', 'Бескомпромиссность', 'Навязывание мнения'],
      ['Сверхценная идея', 'Волевые характеристики', 'Целеустремленность'],
      ['Пренебрежение интересами', 'Самопожертвование', 'Готовность преступить'],
      ['Четкое позиционирование', 'Равнодушие', 'Альтруизм'],
      ['Низкая эмпатия', 'Психосаморегуляция', 'Ровность настроения'],
      ['Непоследовательность', 'Вспышки раздражительности', 'Замкнутость'],
      ['Корпоративные нормы', 'Эмоциональное отвержение', 'Ломка стереотипов'],
      ['Уязвление самолюбия', 'Равнодушие окружающих', 'Критика достижений'],
      ['Ограничение общения', 'Отсутствие событий', 'Удары по эгоцентризму'],
      ['Сверхценная идея', 'Волевые характеристики', 'Целеустремленность'],
      ['Пренебрежение интересами', 'Самопожертвование', 'Готовность преступить'],
      ['Четкое позиционирование', 'Равнодушие', 'Альтруизм'],
      ['Низкая эмпатия', 'Психосаморегуляция', 'Ровность настроения'],
      ['Непоследовательность', 'Вспышки раздражительности', 'Замкнутость'],
      ['Корпоративные нормы', 'Эмоциональное отвержение', 'Ломка стереотипов'],
      ['Готовность преступить нормы', 'Четкое позиционирование', 'Жестокость к чужим'],
      ['Равнодушие ко всему', 'Альтруизм к человечеству', 'Низкая эмпатия']
    ];

    const militaryNames = [
      'Джордж Паттон', 'Дуайт Эйзенхауэр', 'Дуглас Макартур', 'Норман Шварцкопф', 'Колин Пауэлл',
      'Джеймс Мэттис', 'Майкл Флинн', 'Виктор Жуков', 'Анна Романова', 'Игорь Степанов',
      'Марина Ковалева', 'Алексей Тихонов', 'Елена Федорова', 'Дмитрий Соловьев', 'Ольга Медведева',
      'Сергей Егоров'
    ];

    militaryTraits.forEach((traits, index) => {
      characters.push({
        name: militaryNames[index],
        traits: traits,
        description: 'Склонен к формированию и руководству сверхценными идеями, предельно развитые волевые характеристики, целеустремлен. Пренебрегает интересами окружающих во имя цели, способен к самопожертвованию во имя идеи.',
        correctSector: 'military'
      });
    });

    // Экономические персонажи (12)
    const economicTraits = [
      ['Эгоцентризм', 'Честолюбие', 'Самолюбие'],
      ['Талант', 'Способности', 'Достижения'],
      ['Уязвление самолюбия', 'Равнодушие окружающих', 'Критика достижений'],
      ['Ограничение общения', 'Отсутствие событий', 'Удары по эгоцентризму'],
      ['Эгоцентризм', 'Честолюбие', 'Самолюбие'],
      ['Талант', 'Способности', 'Достижения'],
      ['Уязвление самолюбия', 'Равнодушие окружающих', 'Критика достижений'],
      ['Ограничение общения', 'Отсутствие событий', 'Удары по эгоцентризму'],
      ['Эгоцентризм', 'Честолюбие', 'Самолюбие'],
      ['Талант', 'Способности', 'Достижения'],
      ['Уязвление самолюбия', 'Равнодушие окружающих', 'Критика достижений'],
      ['Ограничение общения', 'Отсутствие событий', 'Удары по эгоцентризму'],
      ['Стремление быть в центре', 'Тяга к эпатажу', 'Эгоизм'],
      ['Сосредоточенность на себе', 'Ориентация на желания', 'Завышенная самооценка']
    ];

    const economicNames = [
      'Джеффри Эпштейн', 'Бернард Мэдофф', 'Уоррен Баффет', 'Джордж Сорос', 'Билл Гейтс',
      'Джефф Безос', 'Артем Борисов', 'Алина Соколова', 'Максим Козлов', 'Дарья Морозова',
      'Роман Волков', 'Ангелина Новикова', 'Кирилл Лебедев', 'Полина Смирнова'
    ];

    economicTraits.forEach((traits, index) => {
      characters.push({
        name: economicNames[index],
        traits: traits,
        description: 'Эгоцентризм - стремление быть в центре внимания, тяга к эпатажу, эгоизм, сосредоточенность мыслей на себе, ориентация только на собственные желания, завышенная самооценка.',
        correctSector: 'economic'
      });
    });

    // Исследовательские персонажи (4)
    const researchTraits = [
      ['Интеллект', 'Аналитика', 'Исследования'],
      ['Наука', 'Открытия', 'Эксперименты'],
      ['Уязвление самолюбия', 'Равнодушие окружающих', 'Критика достижений'],
      ['Ограничение общения', 'Отсутствие событий', 'Удары по эгоцентризму']
    ];

    const researchNames = [
      'Альберт Эйнштейн', 'Никола Тесла', 'Дмитрий Иванов', 'Елена Петрова'
    ];

    researchTraits.forEach((traits, index) => {
      characters.push({
        name: researchNames[index],
        traits: traits,
        description: 'Вольное или невольное уязвление самолюбия, равнодушие со стороны окружающих, критика достижений, способностей и таланта, вынужденное одиночество.',
        correctSector: 'research'
      });
    });

    // Пропагандистские персонажи (8)
    const propagandaTraits = [
      ['Эмпатия', 'Актерство', 'Интриги'],
      ['Манипуляции', 'Влияние', 'Тревожность'],
      ['Мнительность', 'Страх', 'Некоммуникабельность'],
      ['Доброта', 'Отзывчивость', 'Деликатность'],
      ['Нетребовательность', 'Неспособность противостоять', 'Повышенная ранимость'],
      ['Стыдливость', 'Стеснительность', 'Предупредительность'],
      ['Исполнительность', 'Преданность', 'Мнительность'],
      ['Пугливость', 'Замкнутость', 'Самобичевание'],
      ['Тревожность', 'Мнительность', 'Страх'],
      ['Некоммуникабельность', 'Эмпатия', 'Доброта'],
      ['Отзывчивость', 'Деликатность', 'Умение быть благодарным'],
      ['Нетребовательность к людям', 'Неспособность противостоять', 'Повышенная ранимость']
    ];

    const propagandaNames = [
      'Джозеф Геббельс', 'Пол Джозеф Гоббс', 'Эдвард Бернейс', 'Анна Смирнова',
      'Игорь Петров', 'Марина Козлова', 'Сергей Морозов', 'Ольга Волкова',
      'Дмитрий Новиков', 'Татьяна Лебедева', 'Алексей Соколов', 'Елена Петрова'
    ];

    propagandaTraits.forEach((traits, index) => {
      characters.push({
        name: propagandaNames[index],
        traits: traits,
        description: 'Тревожность, мнительность, страх, некоммуникабельность, эмпатия, доброта и отзывчивость, деликатность и умение быть благодарным, нетребовательность к людям.',
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
