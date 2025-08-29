// Мировое тайное правительство - Расширенные сюжетные линии
class WorldGovernmentStories {
  constructor() {
    this.storyIndex = 0;
    this.currentStory = null;
    this.videoBackgrounds = {
      meting: '../assets/politics/meting.mp4',
      besporyadki: '../assets/politics/besporyadki.mp4',
      razobla4enie: '../assets/politics/razobla4enie.mp4',
      war: '../assets/politics/war.mp4',
      puteshestvie: '../assets/politics/puteshestvie.mp4',
      experement: '../assets/politics/experement.mp4'
    };
  }

  // Генерация вступительных сюжетов
  generateIntroStories() {
    return [
      {
        title: "🌍 Начало глобальной операции",
        content: "Ваше тайное правительство инициировало операцию 'Мировая Тень'. Первые агенты проникли в ключевые институты власти по всему миру. Начинается эпоха тайного управления человечеством.",
        type: "intro",
        video: null
      },
      {
        title: "🏛️ Политический прорыв в США",
        content: "Ваш политический сектор успешно внедрился в Белый дом и Конгресс США. Президент и ключевые сенаторы теперь принимают решения под вашим влиянием. Америка становится вашей первой колонией.",
        type: "intro",
        video: null
      }
    ];
  }

  // Сюжеты для политического сектора
  generatePoliticalStories() {
    return [
      {
        title: "🏛️ Политический триумф в ЕС",
        content: "Ваши политические агенты провели революционные реформы в Европейском Союзе. Брюссель полностью под вашим контролем.",
        type: "success",
        sector: "political",
        video: null
      },
      {
        title: "🌍 Массовые протесты",
        content: "Неправильно назначенный агент спровоцировал массовые протесты против вашей власти. Тысячи людей выходят на улицы.",
        type: "error",
        sector: "political",
        canEliminate: true,
        eliminationRequirement: 3,
        video: "meting"
      }
    ];
  }

  // Сюжеты для военного сектора
  generateMilitaryStories() {
    return [
      {
        title: "⚔️ Военная экспансия",
        content: "Ваши военные агенты установили контроль над стратегическими базами в Тихом океане. Морские пути под вашей защитой.",
        type: "success",
        sector: "military",
        video: null
      },
      {
        title: "🌍 Мировая война",
        content: "Неправильно назначенный военный агент спровоцировал конфликт между крупными державами. Мировая война может уничтожить все ваши планы.",
        type: "error",
        sector: "military",
        canEliminate: true,
        eliminationRequirement: 3,
        video: "war"
      }
    ];
  }

  // Сюжеты для экономического сектора
  generateEconomicStories() {
    return [
      {
        title: "💰 Финансовый контроль",
        content: "Ваши экономические агенты установили контроль над мировыми финансовыми потоками. Деньги работают на вас.",
        type: "success",
        sector: "economic",
        video: null
      },
      {
        title: "🌍 Экономический кризис",
        content: "Неправильные экономические решения привели к глобальному кризису. Мировая экономика на грани краха.",
        type: "error",
        sector: "economic",
        canEliminate: true,
        eliminationRequirement: 3,
        video: "besporyadki"
      }
    ];
  }

  // Сюжеты для исследовательского сектора
  generateResearchStories() {
    return [
      {
        title: "⏰ Машина времени",
        content: "Благодаря исследовательскому штабу создана машина времени за счет миниатюрных WARP двигателей. Теперь возможно путешествовать в будущее.",
        type: "success",
        sector: "research",
        video: "puteshestvie"
      },
      {
        title: "🧠 ИИ в людях",
        content: "Благодаря исследовательскому штабу начались исследования над людьми. В людей начали внедрять ИИ, создавая сверхчеловека.",
        type: "success",
        sector: "research",
        video: "experement"
      }
    ];
  }

  // Сюжеты для пропагандистского сектора
  generatePropagandaStories() {
    return [
      {
        title: "📺 Информационная гегемония",
        content: "Ваши пропагандисты контролируют 90% мировых СМИ. Общественное мнение формируется по вашему сценарию.",
        type: "success",
        sector: "propaganda",
        video: null
      },
      {
        title: "🔓 Утечка компромата",
        content: "Компрометирующая информация о ваших операциях распространяется через контролируемые СМИ.",
        type: "error",
        sector: "propaganda",
        canEliminate: true,
        eliminationRequirement: 2,
        video: "razobla4enie"
      }
    ];
  }

  // Получение сюжета по типу и сектору
  getStoryByTypeAndSector(type, sector) {
    const stories = {
      political: this.generatePoliticalStories(),
      military: this.generateMilitaryStories(),
      economic: this.generateEconomicStories(),
      research: this.generateResearchStories(),
      propaganda: this.generatePropagandaStories()
    };

    const sectorStories = stories[sector] || [];
    const filteredStories = sectorStories.filter(story => story.type === type);
    
    if (filteredStories.length > 0) {
      return filteredStories[Math.floor(Math.random() * filteredStories.length)];
    }

    return null;
  }

  // Генерация полной последовательности сюжетов
  generateFullStorySequence(sectors, incorrectAssignments) {
    const sequence = [];

    // Добавляем вступительные сюжеты
    const introStories = this.generateIntroStories();
    sequence.push(introStories[Math.floor(Math.random() * introStories.length)]);

    // Добавляем сюжеты для каждого сектора
    Object.entries(sectors).forEach(([sectorType, sector]) => {
      if (sector.members.length > 0) {
        // Успешные сюжеты для правильных назначений
        const correctMembers = sector.members.filter(m => m.isCorrect);
        if (correctMembers.length > 0) {
          const successStory = this.getStoryByTypeAndSector('success', sectorType);
          if (successStory) sequence.push(successStory);
        }

        // Проблемные сюжеты для неправильных назначений
        const incorrectMembers = sector.members.filter(m => !m.isCorrect);
        incorrectMembers.forEach(member => {
          const errorStory = this.getStoryByTypeAndSector('error', sectorType);
          if (errorStory) {
            errorStory.member = member;
            sequence.push(errorStory);
          }
        });
      }
    });

    return sequence;
  }

  // Вспомогательная функция для перемешивания массива
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Получение видео фона для сюжета
  getVideoBackground(story) {
    if (story.video && this.videoBackgrounds[story.video]) {
      return this.videoBackgrounds[story.video];
    }
    return null;
  }
}

// Экспорт для использования в основном файле
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WorldGovernmentStories;
}
