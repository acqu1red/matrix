// Мировое тайное правительство - Расширенные сюжетные линии
class WorldGovernmentStories {
  constructor() {
    this.storyIndex = 0;
    this.currentStory = null;
    this.storyQueue = [];
    this.isAudioEnabled = true;
    this.currentVideo = null;
  }

  // Включение/выключение аудио
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

  // Воспроизведение видео-фона
  playVideoBackground(videoPath) {
    const videoBg = document.getElementById('story-video-bg');
    const video = document.getElementById('story-video');
    
    if (videoPath) {
      video.src = videoPath;
      videoBg.classList.remove('hidden');
      this.currentVideo = videoPath;
    } else {
      videoBg.classList.add('hidden');
      this.currentVideo = null;
    }
  }

  // Генерация всех сюжетов на основе распределения персонажей
  generateAllStories(assignments) {
    this.storyQueue = [];
    
    // Анализируем распределение персонажей
    const politicalCount = assignments.political?.length || 0;
    const militaryCount = assignments.military?.length || 0;
    const economicCount = assignments.economic?.length || 0;
    const researchCount = assignments.research?.length || 0;
    const propagandaCount = assignments.propaganda?.length || 0;

    // Генерируем сюжеты в зависимости от распределения
    this.generateIntroStories();
    this.generatePoliticalStories(politicalCount);
    this.generateMilitaryStories(militaryCount);
    this.generateEconomicStories(economicCount);
    this.generateResearchStories(researchCount);
    this.generatePropagandaStories(propagandaCount);
    this.generateCrossSectorStories(assignments);
    this.generateCrisisStories(assignments);
    this.generateSuccessStories(assignments);
    this.generateFinalStories(assignments);

    return this.storyQueue;
  }

  // Вступительные сюжеты
  generateIntroStories() {
    const introStories = [
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
      },
      {
        title: "⚔️ Военная экспансия в Европе",
        content: "Военный сектор установил контроль над штаб-квартирой НАТО в Брюсселе. Стратегические ядерные объекты и системы противоракетной обороны теперь под вашим командованием. Европа беззащитна.",
        type: "intro",
        video: null
      }
    ];

    this.storyQueue.push(...introStories);
  }

  // Сюжеты для политического сектора
  generatePoliticalStories(count) {
    const politicalStories = [];

    if (count >= 1) {
      politicalStories.push({
        title: "🏛️ Политический триумф в ЕС",
        content: "Ваши политические агенты провели революционные реформы в Европейском Союзе. Брюссель полностью под вашим контролем. Европейский парламент теперь голосует по вашим указаниям.",
        type: "success",
        sector: "political",
        video: null
      });
    }

    if (count >= 2) {
      politicalStories.push({
        title: "🤝 Дипломатическая победа в Азии",
        content: "Ваши дипломаты заключили тайные соглашения с Китаем, Японией и Южной Кореей. Азиатско-Тихоокеанский регион теперь ваша сфера влияния. Пекин и Токио подчиняются вашим приказам.",
        type: "success",
        sector: "political",
        video: null
      });
    }

    if (count >= 3) {
      politicalStories.push({
        title: "⚖️ Конституционная революция",
        content: "Ваши юристы внесли изменения в конституции США, России, Китая и ЕС. Правовая система всего мира теперь работает исключительно в вашу пользу. Закон - это вы.",
        type: "success",
        sector: "political",
        video: null
      });
    }

    if (count >= 4) {
      politicalStories.push({
        title: "🌍 Мировые санкции",
        content: "Под вашим влиянием ООН ввела тотальные санкции против Ирана, Северной Кореи и Венесуэлы. Мировое сообщество слепо следует вашей повестке. Изоляция - ваше оружие.",
        type: "success",
        sector: "political",
        video: null
      });
    }

    // Проблемные сюжеты при недостатке персонажей
    if (count < 2) {
      politicalStories.push({
        title: "⚔️ Политический переворот",
        content: "Неправильно назначенный агент в политическом секторе организовал тайный заговор против вашей власти. Используя свои лидерские качества и харизму, он подрывает авторитет правительства изнутри.",
        type: "error",
        sector: "political",
        canEliminate: true,
        eliminationRequirement: 2,
        video: null
      });
    }

    if (count < 3) {
      politicalStories.push({
        title: "🔀 Фракционная борьба",
        content: "Создана мощная внутренняя фракция 'Новый Порядок', угрожающая единству мирового правительства. Разногласия по вопросам управления подрывают эффективность всех операций.",
        type: "error",
        sector: "political",
        canEliminate: true,
        eliminationRequirement: 2,
        video: null
      });
    }

    this.storyQueue.push(...politicalStories);
  }

  // Сюжеты для военного сектора
  generateMilitaryStories(count) {
    const militaryStories = [];

    if (count >= 1) {
      militaryStories.push({
        title: "⚔️ Военная экспансия в Европе",
        content: "Ваши военные агенты установили контроль над штаб-квартирой НАТО в Брюсселе. Стратегические ядерные объекты и системы противоракетной обороны теперь под вашим командованием.",
        type: "success",
        sector: "military",
        video: null
      });
    }

    if (count >= 2) {
      militaryStories.push({
        title: "🚀 Космическое господство",
        content: "Военный сектор захватил контроль над всеми космическими спутниками мира. GPS, системы связи и разведки теперь работают исключительно в ваших интересах. Космос - ваша территория.",
        type: "success",
        sector: "military",
        video: null
      });
    }

    if (count >= 3) {
      militaryStories.push({
        title: "🌊 Морское превосходство",
        content: "Ваши агенты проникли в командование всех флотов мира. Авианосцы, подводные лодки и военные корабли теперь под вашим контролем. Океаны - ваши владения.",
        type: "success",
        sector: "military",
        video: null
      });
    }

    // Проблемные сюжеты
    if (count < 2) {
      militaryStories.push({
        title: "💥 Военный мятеж",
        content: "Недостаточно контролируемый военный сектор организовал мятеж. Генералы и адмиралы объявили о неподчинении вашим приказам. Вооруженные силы мира выходят из-под контроля.",
        type: "error",
        sector: "military",
        canEliminate: true,
        eliminationRequirement: 3,
        video: null
      });
    }

    this.storyQueue.push(...militaryStories);
  }

  // Сюжеты для экономического сектора
  generateEconomicStories(count) {
    const economicStories = [];

    if (count >= 1) {
      economicStories.push({
        title: "💰 Экономическое порабощение",
        content: "Экономический сектор проник в Федеральную резервную систему США и Европейский центральный банк. Все мировые финансовые потоки теперь проходят через ваши руки. Деньги - это власть.",
        type: "success",
        sector: "economic",
        video: null
      });
    }

    if (count >= 2) {
      economicStories.push({
        title: "🏦 Глобальная финансовая сеть",
        content: "Ваши агенты контролируют все крупнейшие банки мира. SWIFT, криптовалюты и цифровые платежи теперь под вашим надзором. Финансовая система - ваша игрушка.",
        type: "success",
        sector: "economic",
        video: null
      });
    }

    // Проблемные сюжеты
    if (count < 2) {
      economicStories.push({
        title: "📉 Экономический кризис",
        content: "Недостаточно контролируемая экономика впала в глубокий кризис. Биржи падают, валюты обесцениваются, начинается глобальная рецессия. Финансовая система рушится.",
        type: "error",
        sector: "economic",
        video: null
      });
    }

    this.storyQueue.push(...economicStories);
  }

  // Сюжеты для исследовательского сектора
  generateResearchStories(count) {
    const researchStories = [];

    if (count >= 1) {
      researchStories.push({
        title: "🔬 Научная революция",
        content: "Исследовательский сектор получил доступ к секретным лабораториям ЦРУ, МИ-6 и ФСБ. Технологии клонирования, искусственного интеллекта и биологического оружия теперь в вашем распоряжении.",
        type: "success",
        sector: "research",
        video: null
      });
    }

    if (count >= 2) {
      researchStories.push({
        title: "⏰ Машина времени",
        content: "Благодаря исследовательскому штабу создана машина времени за счет миниатюрных WARP двигателей. Теперь возможно путешествовать в будущее, но это все еще слишком энергозатратно.",
        type: "success",
        sector: "research",
        video: "../../politics/puteshestvie.mp4"
      });
    }

    // Проблемные сюжеты
    if (count < 2) {
      researchStories.push({
        title: "🧪 Опасные эксперименты",
        content: "Благодаря исследовательскому штабу начались исследования над людьми. В людей начали внедрять ИИ, что приводит к непредсказуемым последствиям и угрозе человечеству.",
        type: "error",
        sector: "research",
        video: "../../politics/experement.mp4"
      });
    }

    this.storyQueue.push(...researchStories);
  }

  // Сюжеты для пропагандистского сектора
  generatePropagandaStories(count) {
    const propagandaStories = [];

    if (count >= 1) {
      propagandaStories.push({
        title: "📺 Информационная диктатура",
        content: "Пропагандический сектор захватил контроль над CNN, BBC, RT и всеми крупными СМИ мира. Общественное мнение формируется по вашему сценарию. Правда - это то, что вы говорите.",
        type: "success",
        sector: "propaganda",
        video: null
      });
    }

    if (count >= 2) {
      propagandaStories.push({
        title: "🌐 Социальные сети под контролем",
        content: "Ваши агенты проникли в руководство Facebook, Twitter, TikTok и всех крупных соцсетей. Алгоритмы теперь работают исключительно в ваших интересах. Информация - ваше оружие.",
        type: "success",
        sector: "propaganda",
        video: null
      });
    }

    if (count >= 3) {
      propagandaStories.push({
        title: "🎭 Массовые манипуляции",
        content: "Пропагандический сектор разработал технологии массового гипноза и нейролингвистического программирования. Население планеты теперь полностью поддается вашим внушениям.",
        type: "success",
        sector: "propaganda",
        video: null
      });
    }

    // Проблемные сюжеты
    if (count < 2) {
      propagandaStories.push({
        title: "📰 Утечка информации",
        content: "Недостаточно контролируемые СМИ начали публиковать правду о вашем тайном правительстве. Информация распространяется по всему миру, угрожая раскрытием вашей организации.",
        type: "error",
        sector: "propaganda",
        video: "../../politics/razobla4enie.mp4"
      });
    }

    this.storyQueue.push(...propagandaStories);
  }

  // Межсекторные сюжеты
  generateCrossSectorStories(assignments) {
    const crossSectorStories = [];

    // Политический + Военный
    if ((assignments.political?.length || 0) >= 2 && (assignments.military?.length || 0) >= 2) {
      crossSectorStories.push({
        title: "🌍 Мировое господство",
        content: "Политический и военный секторы объединили усилия для установления полного контроля над миром. Все страны теперь подчиняются вашим приказам. Мировое правительство становится реальностью.",
        type: "success",
        sectors: ["political", "military"],
        video: null
      });
    }

    // Экономический + Пропагандистский
    if ((assignments.economic?.length || 0) >= 1 && (assignments.propaganda?.length || 0) >= 2) {
      crossSectorStories.push({
        title: "💰 Финансовая пропаганда",
        content: "Экономический и пропагандистский секторы создали систему тотального контроля над финансовым сознанием населения. Люди теперь тратят деньги именно так, как вы хотите.",
        type: "success",
        sectors: ["economic", "propaganda"],
        video: null
      });
    }

    // Исследовательский + Военный
    if ((assignments.research?.length || 0) >= 1 && (assignments.military?.length || 0) >= 2) {
      crossSectorStories.push({
        title: "🚀 Технологическое превосходство",
        content: "Исследовательский и военный секторы создали оружие будущего. Лазеры, плазменные пушки и роботы-убийцы теперь в вашем арсенале. Технологии - ваша сила.",
        type: "success",
        sectors: ["research", "military"],
        video: null
      });
    }

    this.storyQueue.push(...crossSectorStories);
  }

  // Кризисные сюжеты
  generateCrisisStories(assignments) {
    const crisisStories = [];

    // Общий недостаток персонажей
    const totalPersonnel = Object.values(assignments).reduce((sum, arr) => sum + (arr?.length || 0), 0);
    
    if (totalPersonnel < 8) {
      crisisStories.push({
        title: "🌪️ Массовые беспорядки",
        content: "Недостаточно контролируемое население начало массовые протесты против власти. Митинги и шествия охватили все крупные города мира. Система начинает давать сбои.",
        type: "crisis",
        video: "../../politics/meting.mp4"
      });

      crisisStories.push({
        title: "🔥 Хаос и анархия",
        content: "Массовые беспорядки переросли в полный хаос. Грабежи, поджоги и насилие охватили весь мир. Ваше тайное правительство теряет контроль над ситуацией.",
        type: "crisis",
        video: "../../politics/besporyadki.mp4"
      });
    }

    // Недостаток в военном секторе
    if ((assignments.military?.length || 0) < 2) {
      crisisStories.push({
        title: "⚔️ Военная угроза",
        content: "Недостаточно контролируемые вооруженные силы некоторых стран начали подготовку к войне против вашего тайного правительства. Военная угроза становится реальной.",
        type: "crisis",
        video: "../../politics/war.mp4"
      });
    }

    // Недостаток в экономическом секторе
    if ((assignments.economic?.length || 0) < 1) {
      crisisStories.push({
        title: "📉 Экономический коллапс",
        content: "Недостаточно контролируемая экономика впала в глубокий кризис. Гиперинфляция, дефолты и банкротства охватили весь мир. Финансовая система рушится.",
        type: "crisis",
        video: null
      });
    }

    this.storyQueue.push(...crisisStories);
  }

  // Сюжеты успеха
  generateSuccessStories(assignments) {
    const successStories = [];

    // Полный контроль над всеми секторами
    const hasFullControl = Object.values(assignments).every(arr => (arr?.length || 0) >= 2);
    
    if (hasFullControl) {
      successStories.push({
        title: "👑 Абсолютная власть",
        content: "Ваше тайное правительство достигло абсолютной власти над миром. Все секторы работают в идеальной гармонии. Человечество полностью под вашим контролем.",
        type: "ultimate_success",
        video: null
      });

      successStories.push({
        title: "🌍 Новый мировой порядок",
        content: "Установлен новый мировой порядок под вашим руководством. Все страны, все ресурсы, все технологии теперь принадлежат вам. Вы стали богом этого мира.",
        type: "ultimate_success",
        video: null
      });
    }

    // Высокий уровень контроля
    const highControl = Object.values(assignments).every(arr => (arr?.length || 0) >= 1);
    
    if (highControl) {
      successStories.push({
        title: "🎯 Стабильный контроль",
        content: "Ваше тайное правительство установило стабильный контроль над миром. Все секторы функционируют эффективно. Система работает как часы.",
        type: "high_success",
        video: null
      });
    }

    this.storyQueue.push(...successStories);
  }

  // Финальные сюжеты
  generateFinalStories(assignments) {
    const finalStories = [];

    // Анализируем общий результат
    const totalPersonnel = Object.values(assignments).reduce((sum, arr) => sum + (arr?.length || 0), 0);
    const hasCrises = this.storyQueue.some(story => story.type === "crisis" || story.type === "error");

    if (totalPersonnel >= 12 && !hasCrises) {
      finalStories.push({
        title: "🏆 Триумф мирового правительства",
        content: "Ваше тайное правительство достигло абсолютного успеха! Мир полностью под вашим контролем, все секторы работают идеально. Вы стали истинным правителем человечества.",
        type: "final_success",
        video: null
      });
    } else if (totalPersonnel >= 8 && !hasCrises) {
      finalStories.push({
        title: "✅ Успешное создание",
        content: "Ваше тайное правительство успешно создано и функционирует. Есть небольшие проблемы, но в целом система работает стабильно. Вы контролируете большую часть мира.",
        type: "final_good",
        video: null
      });
    } else if (totalPersonnel >= 5) {
      finalStories.push({
        title: "⚠️ Частичный успех",
        content: "Ваше тайное правительство создано, но работает нестабильно. Есть серьезные проблемы и кризисы. Контроль над миром частичный и неуверенный.",
        type: "final_partial",
        video: null
      });
    } else {
      finalStories.push({
        title: "❌ Провал операции",
        content: "Создание тайного мирового правительства провалилось. Недостаточно персонала, многочисленные кризисы и ошибки привели к краху всей операции.",
        type: "final_failure",
        video: null
      });
    }

    this.storyQueue.push(...finalStories);
  }

  // Получение следующего сюжета
  getNextStory() {
    if (this.storyIndex < this.storyQueue.length) {
      this.currentStory = this.storyQueue[this.storyIndex];
      this.storyIndex++;
      return this.currentStory;
    }
    return null;
  }

  // Сброс индекса сюжетов
  resetStoryIndex() {
    this.storyIndex = 0;
    this.currentStory = null;
  }

  // Получение текущего сюжета
  getCurrentStory() {
    return this.currentStory;
  }

  // Получение общего количества сюжетов
  getTotalStories() {
    return this.storyQueue.length;
  }

  // Получение прогресса прохождения
  getProgress() {
    return this.storyIndex;
  }
}

// Экспорт класса
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WorldGovernmentStories;
}
