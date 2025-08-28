/* ===== WORLD GOVERNMENT STORIES ===== */

// Класс для управления сюжетными линиями
class WorldGovernmentStories {
  constructor() {
    this.storyIndex = 0;
    this.currentStory = null;
    this.stories = [];
    this.videoStories = [];
    
    this.initializeStories();
  }
  
  // Инициализация всех историй
  initializeStories() {
    this.generateIntroStories();
    this.generatePoliticalStories();
    this.generateMilitaryStories();
    this.generateEconomicStories();
    this.generateResearchStories();
    this.generatePropagandaStories();
    this.generateMixedStories();
    this.generateVideoStories();
  }
  
  // Генерация вступительных сюжетов
  generateIntroStories() {
    this.introStories = [
      {
        id: 'intro1',
        title: "🌍 Начало глобальной операции",
        content: "Ваше тайное правительство инициировало операцию 'Мировая Тень'. Первые агенты проникли в ключевые институты власти по всему миру. Начинается эпоха тайного управления человечеством.",
        type: "intro",
        sector: null,
        effects: { stability: 10, influence: 15, control: 10 }
      },
      {
        id: 'intro2',
        title: "🏛️ Политический прорыв в США",
        content: "Ваш политический сектор успешно внедрился в Белый дом и Конгресс США. Президент и ключевые сенаторы теперь принимают решения под вашим влиянием. Америка становится вашей первой колонией.",
        type: "intro",
        sector: "political",
        effects: { stability: 15, influence: 20, control: 15 }
      },
      {
        id: 'intro3',
        title: "⚔️ Военная экспансия в Европе",
        content: "Военный сектор установил контроль над штаб-квартирой НАТО в Брюсселе. Стратегические ядерные объекты и системы противоракетной обороны теперь под вашим командованием. Европа беззащитна.",
        type: "intro",
        sector: "military",
        effects: { power: 20, security: 15, intimidation: 15 }
      },
      {
        id: 'intro4',
        title: "💰 Экономическое порабощение",
        content: "Экономический сектор проник в Федеральную резервную систему США и Европейский центральный банк. Все мировые финансовые потоки теперь проходят через ваши руки. Деньги - это власть.",
        type: "intro",
        sector: "economic",
        effects: { wealth: 25, control: 20, influence: 15 }
      },
      {
        id: 'intro5',
        title: "🔬 Научная революция",
        content: "Исследовательский сектор получил доступ к секретным лабораториям ЦРУ, МИ-6 и ФСБ. Технологии клонирования, искусственного интеллекта и биологического оружия теперь в вашем распоряжении.",
        type: "intro",
        sector: "research",
        effects: { innovation: 25, power: 15, control: 10 }
      },
      {
        id: 'intro6',
        title: "📺 Информационная диктатура",
        content: "Пропагандический сектор захватил контроль над CNN, BBC, RT и всеми крупными СМИ мира. Общественное мнение формируется по вашему сценарию. Правда - это то, что вы говорите.",
        type: "intro",
        sector: "propaganda",
        effects: { influence: 20, control: 15, stability: 10 }
      }
    ];
  }
  
  // Сюжеты для политического сектора
  generatePoliticalStories() {
    this.politicalStories = [
      // Успешные сюжеты
      {
        id: 'political_success1',
        title: "🏛️ Политический триумф в ЕС",
        content: "Ваши политические агенты провели революционные реформы в Европейском Союзе. Брюссель полностью под вашим контролем. Европейский парламент теперь голосует по вашим указаниям.",
        type: "success",
        sector: "political",
        effects: { stability: 25, influence: 30, control: 25 }
      },
      {
        id: 'political_success2',
        title: "🤝 Дипломатическая победа в Азии",
        content: "Ваши дипломаты заключили тайные соглашения с Китаем, Японией и Южной Кореей. Азиатско-Тихоокеанский регион теперь ваша сфера влияния. Пекин и Токио подчиняются вашим приказам.",
        type: "success",
        sector: "political",
        effects: { stability: 20, influence: 35, control: 20 }
      },
      {
        id: 'political_success3',
        title: "⚖️ Конституционная революция",
        content: "Ваши юристы внесли изменения в конституции США, России, Китая и ЕС. Правовая система всего мира теперь работает исключительно в вашу пользу. Закон - это вы.",
        type: "success",
        sector: "political",
        effects: { stability: 30, influence: 25, control: 30 }
      },
      
      // Проблемные сюжеты
      {
        id: 'political_problem1',
        title: "⚔️ Политический переворот",
        content: "Неправильно назначенный агент в политическом секторе организовал тайный заговор против вашей власти. Используя свои лидерские качества и харизму, он подрывает авторитет правительства изнутри.",
        type: "error",
        sector: "political",
        canEliminate: true,
        eliminationRequirement: 2,
        effects: { stability: -25, influence: -20, control: -30 }
      },
      {
        id: 'political_problem2',
        title: "🔀 Фракционная борьба",
        content: "Создана мощная внутренняя фракция 'Новый Порядок', угрожающая единству мирового правительства. Разногласия по вопросам управления подрывают эффективность всех операций.",
        type: "error",
        sector: "political",
        canEliminate: true,
        eliminationRequirement: 3,
        effects: { stability: -30, influence: -25, control: -35 }
      },
      {
        id: 'political_problem3',
        title: "🌍 Международный скандал",
        content: "Ваши политические агенты были разоблачены в ООН. Международное сообщество требует расследования. Репутация мирового правительства под угрозой.",
        type: "error",
        sector: "political",
        canEliminate: false,
        effects: { stability: -20, influence: -35, control: -25 }
      }
    ];
  }
  
  // Сюжеты для военного сектора
  generateMilitaryStories() {
    this.militaryStories = [
      // Успешные сюжеты
      {
        id: 'military_success1',
        title: "⚔️ Военная экспансия в Африке",
        content: "Ваши военные силы установили контроль над стратегическими ресурсами Африки. Континент теперь ваша военная база. Местные правительства полностью подчиняются вашим приказам.",
        type: "success",
        sector: "military",
        effects: { power: 30, security: 25, intimidation: 30 }
      },
      {
        id: 'military_success2',
        title: "🚀 Космическое превосходство",
        content: "Военный сектор захватил контроль над всеми спутниками связи и навигации. Космическое пространство теперь ваша территория. Никто не может общаться без вашего разрешения.",
        type: "success",
        sector: "military",
        effects: { power: 35, security: 30, control: 25 }
      },
      {
        id: 'military_success3',
        title: "🛡️ Система противоракетной обороны",
        content: "Создана глобальная система противоракетной обороны. Все ядерные ракеты мира теперь под вашим контролем. Ядерная война невозможна без вашего приказа.",
        type: "success",
        sector: "military",
        effects: { power: 40, security: 35, intimidation: 25 }
      },
      
      // Проблемные сюжеты
      {
        id: 'military_problem1',
        title: "💥 Военный мятеж",
        content: "Часть военных сил подняла мятеж против мирового правительства. Используя захваченное оружие, мятежники угрожают безопасности всей организации.",
        type: "error",
        sector: "military",
        canEliminate: true,
        eliminationRequirement: 3,
        effects: { power: -30, security: -35, stability: -25 }
      },
      {
        id: 'military_problem2',
        title: "🔫 Утечка оружия",
        content: "Секретное оружие мирового правительства попало в руки террористических организаций. Теперь они могут угрожать вашей безопасности.",
        type: "error",
        sector: "military",
        canEliminate: false,
        effects: { power: -25, security: -30, control: -20 }
      },
      {
        id: 'military_problem3',
        title: "🌊 Военно-морской бунт",
        content: "Экипажи подводных лодок с ядерным оружием отказались подчиняться приказам. Они угрожают применить ядерное оружие против мирового правительства.",
        type: "error",
        sector: "military",
        canEliminate: true,
        eliminationRequirement: 2,
        effects: { power: -35, security: -40, stability: -30 }
      }
    ];
  }
  
  // Сюжеты для экономического сектора
  generateEconomicStories() {
    this.economicStories = [
      // Успешные сюжеты
      {
        id: 'economic_success1',
        title: "💰 Глобальная финансовая система",
        content: "Создана единая мировая валюта под контролем мирового правительства. Все банки мира теперь работают по вашим правилам. Финансовая независимость стран уничтожена.",
        type: "success",
        sector: "economic",
        effects: { wealth: 40, control: 35, influence: 30 }
      },
      {
        id: 'economic_success2',
        title: "🏭 Контроль над ресурсами",
        content: "Установлен контроль над всеми природными ресурсами планеты. Нефть, газ, золото, редкие металлы - все принадлежит мировому правительству.",
        type: "success",
        sector: "economic",
        effects: { wealth: 35, control: 30, power: 25 }
      },
      {
        id: 'economic_success3',
        title: "📊 Мировая биржа",
        content: "Создана единая мировая биржа, где все акции и облигации торгуются под вашим контролем. Рынки полностью подчиняются вашим решениям.",
        type: "success",
        sector: "economic",
        effects: { wealth: 30, control: 35, influence: 25 }
      },
      
      // Проблемные сюжеты
      {
        id: 'economic_problem1',
        title: "💸 Финансовый кризис",
        content: "Неправильная экономическая политика привела к глобальному финансовому кризису. Мировые рынки рухнули, экономика в хаосе.",
        type: "error",
        sector: "economic",
        canEliminate: false,
        effects: { wealth: -30, stability: -25, control: -20 }
      },
      {
        id: 'economic_problem2',
        title: "🏦 Банковский бунт",
        content: "Крупнейшие банки мира объединились против мирового правительства. Они угрожают обрушить всю финансовую систему.",
        type: "error",
        sector: "economic",
        canEliminate: true,
        eliminationRequirement: 2,
        effects: { wealth: -25, control: -30, stability: -20 }
      },
      {
        id: 'economic_problem3',
        title: "🔄 Криптовалютная революция",
        content: "Население начало массово переходить на криптовалюты, избегая контроля мирового правительства. Финансовая власть ускользает.",
        type: "error",
        sector: "economic",
        canEliminate: false,
        effects: { control: -25, influence: -20, wealth: -15 }
      }
    ];
  }
  
  // Сюжеты для исследовательского сектора
  generateResearchStories() {
    this.researchStories = [
      // Успешные сюжеты
      {
        id: 'research_success1',
        title: "🤖 Искусственный интеллект",
        content: "Создан сверхмощный ИИ, способный управлять всеми системами мирового правительства. Технологическое превосходство обеспечено.",
        type: "success",
        sector: "research",
        effects: { innovation: 40, power: 30, control: 25 }
      },
      {
        id: 'research_success2',
        title: "🧬 Генетическое оружие",
        content: "Разработано генетическое оружие, способное избирательно поражать определенные группы населения. Биологическое превосходство достигнуто.",
        type: "success",
        sector: "research",
        effects: { innovation: 35, power: 35, intimidation: 30 }
      },
      {
        id: 'research_success3',
        title: "⏰ Машина времени",
        content: "Создана машина времени с миниатюрными WARP двигателями. Теперь возможно путешествовать в будущее и изменять ход истории.",
        type: "success",
        sector: "research",
        effects: { innovation: 50, power: 40, control: 30 }
      },
      
      // Проблемные сюжеты
      {
        id: 'research_problem1',
        title: "🧪 Эксперимент вышел из-под контроля",
        content: "Научный эксперимент по созданию суперсолдата вышел из-под контроля. Созданное существо угрожает безопасности всего мира.",
        type: "error",
        sector: "research",
        canEliminate: true,
        eliminationRequirement: 3,
        effects: { power: -30, security: -35, stability: -25 }
      },
      {
        id: 'research_problem2',
        title: "🔬 Утечка технологий",
        content: "Секретные технологии мирового правительства попали в руки конкурентов. Теперь они могут создать аналогичные разработки.",
        type: "error",
        sector: "research",
        canEliminate: false,
        effects: { innovation: -25, power: -20, control: -15 }
      },
      {
        id: 'research_problem3',
        title: "🌍 Экологическая катастрофа",
        content: "Научные эксперименты привели к экологической катастрофе. Планета на грани экологического коллапса.",
        type: "error",
        sector: "research",
        canEliminate: false,
        effects: { stability: -30, control: -25, influence: -20 }
      }
    ];
  }
  
  // Сюжеты для пропагандистского сектора
  generatePropagandaStories() {
    this.propagandaStories = [
      // Успешные сюжеты
      {
        id: 'propaganda_success1',
        title: "📺 Полный контроль над СМИ",
        content: "Все средства массовой информации мира теперь под вашим контролем. Общественное мнение формируется исключительно по вашему сценарию.",
        type: "success",
        sector: "propaganda",
        effects: { influence: 40, control: 30, stability: 25 }
      },
      {
        id: 'propaganda_success2',
        title: "🧠 Массовое программирование",
        content: "Разработаны технологии массового программирования сознания. Население планеты теперь полностью подчиняется вашим приказам.",
        type: "success",
        sector: "propaganda",
        effects: { influence: 35, control: 35, stability: 30 }
      },
      {
        id: 'propaganda_success3',
        title: "🌐 Виртуальная реальность",
        content: "Создана глобальная система виртуальной реальности. Большинство людей предпочитают жить в виртуальном мире, полностью под вашим контролем.",
        type: "success",
        sector: "propaganda",
        effects: { influence: 30, control: 40, stability: 25 }
      },
      
      // Проблемные сюжеты
      {
        id: 'propaganda_problem1',
        title: "📱 Социальные сети восстали",
        content: "Социальные сети начали распространять правду о мировом правительстве. Информационная блокада прорвана.",
        type: "error",
        sector: "propaganda",
        canEliminate: false,
        effects: { influence: -30, control: -25, stability: -20 }
      },
      {
        id: 'propaganda_problem2',
        title: "🎭 Пропагандистский провал",
        content: "Ваша пропаганда оказалась слишком очевидной. Население начало сопротивляться манипуляциям.",
        type: "error",
        sector: "propaganda",
        canEliminate: false,
        effects: { influence: -25, control: -20, stability: -15 }
      },
      {
        id: 'propaganda_problem3',
        title: "🔍 Журналисты-расследователи",
        content: "Появилась группа независимых журналистов, расследующих деятельность мирового правительства. Они угрожают раскрыть все секреты.",
        type: "error",
        sector: "propaganda",
        canEliminate: true,
        eliminationRequirement: 2,
        effects: { influence: -35, control: -30, stability: -25 }
      }
    ];
  }
  
  // Смешанные сюжеты
  generateMixedStories() {
    this.mixedStories = [
      {
        id: 'mixed1',
        title: "🌍 Глобальная пандемия",
        content: "Исследовательский сектор создал вирус для контроля населения, но он мутировал и вышел из-под контроля. Мир охвачен паникой.",
        type: "mixed",
        sectors: ["research", "propaganda"],
        effects: { control: 20, stability: -30, power: 15 }
      },
      {
        id: 'mixed2',
        title: "⚔️ Гражданская война",
        content: "Политические разногласия привели к гражданской войне в нескольких странах. Военный сектор вынужден вмешаться для восстановления порядка.",
        type: "mixed",
        sectors: ["political", "military"],
        effects: { power: 25, stability: -25, control: 20 }
      },
      {
        id: 'mixed3',
        title: "💰 Экономическая блокада",
        content: "Экономический сектор ввел санкции против непокорных стран. Политический сектор обеспечивает дипломатическую поддержку.",
        type: "mixed",
        sectors: ["economic", "political"],
        effects: { control: 30, wealth: 20, influence: 15 }
      },
      {
        id: 'mixed4',
        title: "🔬 Технологический прорыв",
        content: "Исследовательский сектор создал революционную технологию. Пропагандистский сектор обеспечивает ее популяризацию.",
        type: "mixed",
        sectors: ["research", "propaganda"],
        effects: { innovation: 35, influence: 25, power: 20 }
      }
    ];
  }
  
  // Видео-сюжеты
  generateVideoStories() {
    this.videoStories = [
      {
        id: 'video_meting',
        title: '🌍 Массовые протесты по всему миру',
        content: 'Население планеты вышло на улицы, протестуя против тайного правительства. Митинги охватили все крупные города. Политический и пропагандистский секторы работают на пределе возможностей.',
        video: 'meting',
        triggers: ['political', 'propaganda'],
        effects: { stability: -20, influence: -15, control: -25 },
        canEliminate: true,
        eliminationRequirement: 2
      },
      
      {
        id: 'video_besporyadki',
        title: '🔥 Массовые беспорядки',
        content: 'Протесты переросли в насилие. Города охвачены хаосом, полиция не справляется с ситуацией. Военный сектор вынужден ввести чрезвычайное положение.',
        video: 'besporyadki',
        triggers: ['military', 'propaganda'],
        effects: { stability: -30, power: -20, control: -35 },
        canEliminate: true,
        eliminationRequirement: 3
      },
      
      {
        id: 'video_razobla4enie',
        title: '🔍 Раскрытие заговора',
        content: 'Журналисты-расследователи начали копать под мировое правительство. Секреты могут быть раскрыты. Пропагандистский сектор работает в режиме кризиса.',
        video: 'razobla4enie',
        triggers: ['propaganda', 'political'],
        effects: { influence: -25, control: -30, stability: -40 },
        canEliminate: true,
        eliminationRequirement: 2
      },
      
      {
        id: 'video_war',
        title: '⚔️ Мировая война инициирована',
        content: 'По требованию мирового правительства началась война для отвлечения населения от других проблем. Военный сектор получает неограниченные полномочия.',
        video: 'war',
        triggers: ['military', 'political'],
        effects: { power: 20, stability: -15, control: 25 },
        canEliminate: false
      },
      
      {
        id: 'video_puteshestvie',
        title: '⏰ Машина времени создана',
        content: 'Благодаря исследовательскому штабу создана машина времени с миниатюрными WARP двигателями. Теперь возможно путешествовать в будущее и изменять ход истории.',
        video: 'puteshestvie',
        triggers: ['research'],
        effects: { innovation: 40, power: 30, control: 20 },
        canEliminate: false
      },
      
      {
        id: 'video_experement',
        title: '🤖 ИИ внедрен в людей',
        content: 'Исследовательский штаб начал эксперименты по внедрению искусственного интеллекта в человеческий мозг. Создаются суперлюди с расширенными возможностями.',
        video: 'experement',
        triggers: ['research'],
        effects: { innovation: 35, power: 25, control: 30 },
        canEliminate: false
      }
    ];
  }
  
  // Получение случайной истории
  getRandomStory(sector = null, type = null) {
    let availableStories = [];
    
    if (sector) {
      // Фильтруем по сектору
      availableStories = availableStories.concat(
        this[`${sector}Stories`] || []
      );
    } else {
      // Все истории
      availableStories = availableStories.concat(
        this.politicalStories,
        this.militaryStories,
        this.economicStories,
        this.researchStories,
        this.propagandaStories,
        this.mixedStories
      );
    }
    
    if (type) {
      availableStories = availableStories.filter(story => story.type === type);
    }
    
    if (availableStories.length === 0) {
      return this.introStories[Math.floor(Math.random() * this.introStories.length)];
    }
    
    return availableStories[Math.floor(Math.random() * availableStories.length)];
  }
  
  // Получение видео-истории
  getVideoStory(triggers = []) {
    let availableVideos = this.videoStories;
    
    if (triggers.length > 0) {
      availableVideos = availableVideos.filter(video => 
        video.triggers.some(trigger => triggers.includes(trigger))
      );
    }
    
    if (availableVideos.length === 0) {
      return this.videoStories[Math.floor(Math.random() * this.videoStories.length)];
    }
    
    return availableVideos[Math.floor(Math.random() * availableVideos.length)];
  }
  
  // Получение истории для сектора
  getSectorStory(sectorId) {
    const sectorStories = this[`${sectorId}Stories`] || [];
    if (sectorStories.length === 0) {
      return this.introStories[0];
    }
    
    return sectorStories[Math.floor(Math.random() * sectorStories.length)];
  }
  
  // Получение проблемной истории для сектора
  getSectorProblem(sectorId) {
    const sectorStories = this[`${sectorId}Stories`] || [];
    const problems = sectorStories.filter(story => story.type === 'error');
    
    if (problems.length === 0) {
      return null;
    }
    
    return problems[Math.floor(Math.random() * problems.length)];
  }
  
  // Получение успешной истории для сектора
  getSectorSuccess(sectorId) {
    const sectorStories = this[`${sectorId}Stories`] || [];
    const successes = sectorStories.filter(story => story.type === 'success');
    
    if (successes.length === 0) {
      return null;
    }
    
    return successes[Math.floor(Math.random() * successes.length)];
  }
  
  // Проверка возможности видео-сюжета
  canTriggerVideo(triggers, sectorMembers) {
    if (!triggers || triggers.length === 0) return true;
    
    return triggers.some(trigger => {
      const sector = sectorMembers[trigger];
      return sector && sector.length > 0;
    });
  }
  
  // Получение всех историй для сектора
  getAllSectorStories(sectorId) {
    return this[`${sectorId}Stories`] || [];
  }
  
  // Получение статистики историй
  getStoriesStats() {
    return {
      total: this.politicalStories.length + this.militaryStories.length + 
             this.economicStories.length + this.researchStories.length + 
             this.propagandaStories.length + this.mixedStories.length + 
             this.videoStories.length,
      political: this.politicalStories.length,
      military: this.militaryStories.length,
      economic: this.economicStories.length,
      research: this.researchStories.length,
      propaganda: this.propagandaStories.length,
      mixed: this.mixedStories.length,
      video: this.videoStories.length
    };
  }
}

// Экспорт класса
window.WorldGovernmentStories = WorldGovernmentStories;
