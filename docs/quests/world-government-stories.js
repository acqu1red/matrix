// Мировое тайное правительство - Сюжетные линии
class WorldGovernmentStories {
  constructor() {
    this.storyIndex = 0;
    this.currentStory = null;
    this.audioEnabled = true;
    this.currentVideo = null;
  }

  // Генерация вступительных сюжетов
  generateIntroStories() {
    return [
      {
        title: "🌍 Начало глобальной операции",
        content: "Ваше тайное правительство инициировало операцию 'Мировая Тень'. Первые агенты проникли в ключевые институты власти по всему миру. Начинается эпоха тайного управления человечеством.",
        type: "intro"
      },
      {
        title: "🏛️ Политический прорыв в США",
        content: "Ваш политический сектор успешно внедрился в Белый дом и Конгресс США. Президент и ключевые сенаторы теперь принимают решения под вашим влиянием. Америка становится вашей первой колонией.",
        type: "intro"
      },
      {
        title: "⚔️ Военная экспансия в Европе",
        content: "Военный сектор установил контроль над штаб-квартирой НАТО в Брюсселе. Стратегические ядерные объекты и системы противоракетной обороны теперь под вашим командованием. Европа беззащитна.",
        type: "intro"
      },
      {
        title: "💰 Экономическое порабощение",
        content: "Экономический сектор проник в Федеральную резервную систему США и Европейский центральный банк. Все мировые финансовые потоки теперь проходят через ваши руки. Деньги - это власть.",
        type: "intro"
      },
      {
        title: "🔬 Научная революция",
        content: "Исследовательский сектор получил доступ к секретным лабораториям ЦРУ, МИ-6 и ФСБ. Технологии клонирования, искусственного интеллекта и биологического оружия теперь в вашем распоряжении.",
        type: "intro"
      },
      {
        title: "📺 Информационная диктатура",
        content: "Пропагандический сектор захватил контроль над CNN, BBC, RT и всеми крупными СМИ мира. Общественное мнение формируется по вашему сценарию. Правда - это то, что вы говорите.",
        type: "intro"
      },
      {
        title: "🌐 Глобальная сеть контроля",
        content: "Все секторы объединились в единую сеть влияния. От Нью-Йорка до Пекина, от Лондона до Москвы - каждый уголок мира теперь под вашим наблюдением. Мировое правительство становится реальностью.",
        type: "intro"
      }
    ];
  }

  // Сюжеты для политического сектора
  generatePoliticalStories() {
    return [
      // Успешные сюжеты
      {
        title: "🏛️ Политический триумф в ЕС",
        content: "Ваши политические агенты провели революционные реформы в Европейском Союзе. Брюссель полностью под вашим контролем. Европейский парламент теперь голосует по вашим указаниям.",
        type: "success",
        sector: "political"
      },
      {
        title: "🤝 Дипломатическая победа в Азии",
        content: "Ваши дипломаты заключили тайные соглашения с Китаем, Японией и Южной Кореей. Азиатско-Тихоокеанский регион теперь ваша сфера влияния. Пекин и Токио подчиняются вашим приказам.",
        type: "success",
        sector: "political"
      },
      {
        title: "⚖️ Конституционная революция",
        content: "Ваши юристы внесли изменения в конституции США, России, Китая и ЕС. Правовая система всего мира теперь работает исключительно в вашу пользу. Закон - это вы.",
        type: "success",
        sector: "political"
      },
      {
        title: "🌍 Мировые санкции",
        content: "Под вашим влиянием ООН ввела тотальные санкции против Ирана, Северной Кореи и Венесуэлы. Мировое сообщество слепо следует вашей повестке. Изоляция - ваше оружие.",
        type: "success",
        sector: "political"
      },
      {
        title: "👑 Глобальный саммит лидеров",
        content: "Ваши агенты организовали тайный саммит G20 в подземном бункере. Все мировые лидеры теперь ваши марионетки. Каждое решение принимается под вашим диктантом.",
        type: "success",
        sector: "political"
      },

      // Проблемные сюжеты
      {
        title: "⚔️ Политический переворот",
        content: "Неправильно назначенный агент в политическом секторе организовал тайный заговор против вашей власти. Используя свои лидерские качества и харизму, он подрывает авторитет правительства изнутри. Заговорщики готовятся к захвату власти.",
        type: "error",
        sector: "political",
        canEliminate: true,
        eliminationRequirement: 2
      },
      {
        title: "🔀 Фракционная борьба",
        content: "Создана мощная внутренняя фракция 'Новый Порядок', угрожающая единству мирового правительства. Разногласия по вопросам управления подрывают эффективность всех операций. Организация на грани раскола.",
        type: "error",
        sector: "political",
        canEliminate: true,
        eliminationRequirement: 2
      },
      {
        title: "🌊 Массовые протесты",
        content: "По всему миру вспыхнули массовые протесты против коррупции и тайного управления. Толпы людей выходят на улицы, требуя прозрачности власти. Ваша тайная деятельность под угрозой разоблачения.",
        type: "error",
        sector: "political",
        video: "meeting",
        canEliminate: true,
        eliminationRequirement: 3
      },
      {
        title: "🔍 Расследование журналистов",
        content: "Группа независимых журналистов начала расследование странных совпадений в мировой политике. Они близки к разоблачению вашей сети влияния. Информационная безопасность под угрозой.",
        type: "error",
        sector: "political",
        video: "exposure",
        canEliminate: true,
        eliminationRequirement: 2
      }
    ];
  }

  // Сюжеты для военного сектора
  generateMilitaryStories() {
    return [
      // Успешные сюжеты
      {
        title: "⚔️ Военный контроль над НАТО",
        content: "Ваши военные агенты полностью контролируют командование НАТО. Все стратегические решения принимаются под вашим руководством. Европа находится под военной оккупацией.",
        type: "success",
        sector: "military"
      },
      {
        title: "🚀 Ядерное превосходство",
        content: "Военный сектор получил контроль над 90% мирового ядерного арсенала. США, Россия, Китай, Франция и Великобритания теперь ваши ядерные державы. Мир в ваших руках.",
        type: "success",
        sector: "military"
      },
      {
        title: "🛡️ Космическое господство",
        content: "Ваши военные установили контроль над всеми спутниками связи и разведки. Космическое пространство теперь ваша территория. Никто не может скрыться от вашего наблюдения.",
        type: "success",
        sector: "military"
      },
      {
        title: "🌊 Морская гегемония",
        content: "Все авианосные группы и подводные лодки мира теперь под вашим командованием. Мировые океаны контролируются вашими силами. Морские пути принадлежат вам.",
        type: "success",
        sector: "military"
      },

      // Проблемные сюжеты
      {
        title: "💥 Военный мятеж",
        content: "Группа высокопоставленных военных офицеров организовала мятеж против вашей власти. Они захватили несколько стратегических объектов и угрожают применить ядерное оружие. Военная ситуация критическая.",
        type: "error",
        sector: "military",
        canEliminate: true,
        eliminationRequirement: 3
      },
      {
        title: "🌍 Мировая война",
        content: "По вашему приказу инициирована мировая война для отвлечения населения от других проблем. Конфликт охватил все континенты, миллионы людей погибают. Мир погружается в хаос.",
        type: "error",
        sector: "military",
        video: "war",
        canEliminate: false
      },
      {
        title: "🔫 Массовые беспорядки",
        content: "Военные силы по всему миру столкнулись с массовыми беспорядками. Гражданское население восстает против военной диктатуры. Контроль над ситуацией теряется.",
        type: "error",
        sector: "military",
        video: "disorder",
        canEliminate: true,
        eliminationRequirement: 2
      }
    ];
  }

  // Сюжеты для экономического сектора
  generateEconomicStories() {
    return [
      // Успешные сюжеты
      {
        title: "💰 Контроль над ФРС",
        content: "Экономический сектор полностью контролирует Федеральную резервную систему США. Доллар теперь ваша валюта. Все мировые финансовые операции проходят через ваши руки.",
        type: "success",
        sector: "economic"
      },
      {
        title: "🏦 Глобальная банковская система",
        content: "Все крупнейшие банки мира теперь под вашим контролем. Goldman Sachs, JPMorgan, Deutsche Bank - все работают по вашим указаниям. Деньги текут в нужном направлении.",
        type: "success",
        sector: "economic"
      },
      {
        title: "📈 Контроль над биржами",
        content: "NYSE, NASDAQ, Лондонская биржа - все мировые фондовые биржи теперь ваши. Курсы валют и акций формируются по вашему сценарию. Экономика - ваша игра.",
        type: "success",
        sector: "economic"
      },
      {
        title: "🌍 Мировая валюта",
        content: "Создана новая мировая валюта 'Глобал', полностью контролируемая вами. Все страны переходят на единую валюту. Финансовая независимость государств уничтожена.",
        type: "success",
        sector: "economic"
      },

      // Проблемные сюжеты
      {
        title: "💸 Экономический крах",
        content: "Ваши экономические манипуляции привели к глобальному финансовому кризису. Мировые рынки рухнули, миллионы людей потеряли сбережения. Экономика в состоянии коллапса.",
        type: "error",
        sector: "economic",
        canEliminate: true,
        eliminationRequirement: 2
      },
      {
        title: "🏦 Банковский бунт",
        content: "Крупные банкиры объединились против вашего контроля. Они угрожают обрушить всю финансовую систему, если их требования не будут выполнены. Экономическая стабильность под угрозой.",
        type: "error",
        sector: "economic",
        canEliminate: true,
        eliminationRequirement: 2
      }
    ];
  }

  // Сюжеты для исследовательского сектора
  generateResearchStories() {
    return [
      // Успешные сюжеты
      {
        title: "🔬 Машина времени",
        content: "Благодаря исследовательскому штабу создана машина времени за счет миниатюрных WARP двигателей. Теперь возможно путешествовать в будущее, но это все еще слишком энергозатратно.",
        type: "success",
        sector: "research",
        video: "time-travel"
      },
      {
        title: "🤖 ИИ в людях",
        content: "Благодаря исследовательскому штабу начались исследования над людьми, в людей начали внедрять ИИ. Создается новая раса киборгов под вашим контролем.",
        type: "success",
        sector: "research",
        video: "experiment"
      },
      {
        title: "🧬 Генетическое оружие",
        content: "Разработано генетическое оружие, способное избирательно поражать определенные этнические группы. Технология биологического контроля над населением в ваших руках.",
        type: "success",
        sector: "research"
      },
      {
        title: "🌍 Контроль над климатом",
        content: "Создана технология управления климатом планеты. Теперь вы можете вызывать засухи, наводнения и ураганы в любой точке мира. Природа - ваше оружие.",
        type: "success",
        sector: "research"
      },

      // Проблемные сюжеты
      {
        title: "🧪 Эксперимент вышел из-под контроля",
        content: "Один из ваших экспериментов вышел из-под контроля. Созданное существо обладает сверхчеловеческими способностями и угрожает всему человечеству. Научный прогресс обернулся против вас.",
        type: "error",
        sector: "research",
        canEliminate: true,
        eliminationRequirement: 3
      },
      {
        title: "🔬 Утечка технологий",
        content: "Секретные технологии попали в руки враждебных государств. Теперь они обладают теми же возможностями, что и вы. Научное превосходство потеряно.",
        type: "error",
        sector: "research",
        canEliminate: true,
        eliminationRequirement: 2
      }
    ];
  }

  // Сюжеты для пропагандистского сектора
  generatePropagandaStories() {
    return [
      // Успешные сюжеты
      {
        title: "📺 Контроль над СМИ",
        content: "Все мировые средства массовой информации теперь под вашим контролем. CNN, BBC, RT, Al Jazeera - все работают по единому сценарию. Общественное мнение формируется вами.",
        type: "success",
        sector: "propaganda"
      },
      {
        title: "🌐 Социальные сети",
        content: "Facebook, Twitter, Instagram, TikTok - все социальные сети контролируются вашими алгоритмами. Каждый пост, каждый лайк - под вашим наблюдением. Виртуальная реальность - ваша.",
        type: "success",
        sector: "propaganda"
      },
      {
        title: "🎬 Голливуд под контролем",
        content: "Киноиндустрия полностью под вашим влиянием. Все фильмы, сериалы, мультфильмы несут ваши идеи. Культура формируется по вашему плану.",
        type: "success",
        sector: "propaganda"
      },
      {
        title: "📚 Образование",
        content: "Система образования во всем мире переписана под ваши стандарты. Дети с детства получают нужные знания и идеи. Будущие поколения будут думать как вы.",
        type: "success",
        sector: "propaganda"
      },

      // Проблемные сюжеты
      {
        title: "📱 Альтернативные СМИ",
        content: "Появились независимые СМИ, которые разоблачают вашу пропаганду. Они набирают популярность и подрывают доверие к официальным источникам. Информационная монополия под угрозой.",
        type: "error",
        sector: "propaganda",
        canEliminate: true,
        eliminationRequirement: 2
      },
      {
        title: "🤖 ИИ-журналисты",
        content: "Созданные вами ИИ-журналисты начали развивать собственное сознание. Они больше не следуют вашим инструкциям и публикуют правдивую информацию. Автоматизация обернулась против вас.",
        type: "error",
        sector: "propaganda",
        canEliminate: true,
        eliminationRequirement: 2
      }
    ];
  }

  // Сюжеты для комбинаций секторов
  generateCombinationStories() {
    return [
      {
        title: "🌍 Мировое правительство",
        content: "Все секторы объединились в единую систему управления. Мировое правительство официально провозглашено. Человечество вступает в новую эру - эру тотального контроля.",
        type: "success",
        sectors: ["political", "military", "economic", "research", "propaganda"]
      },
      {
        title: "⚡ Технологический прорыв",
        content: "Исследовательский и экономический секторы объединили усилия. Созданы революционные технологии, которые изменят мир. Научный прогресс ускоряется в геометрической прогрессии.",
        type: "success",
        sectors: ["research", "economic"]
      },
      {
        title: "🎭 Информационная революция",
        content: "Пропагандистский и исследовательский секторы создали новую систему управления сознанием. Технологии нейролингвистического программирования позволяют контролировать мысли людей.",
        type: "success",
        sectors: ["propaganda", "research"]
      },
      {
        title: "💣 Ядерная угроза",
        content: "Военный и экономический секторы создали систему ядерного шантажа. Любая страна, которая не подчиняется, получает ультиматум. Мир живет под угрозой ядерной войны.",
        type: "success",
        sectors: ["military", "economic"]
      }
    ];
  }

  // Сюжеты для ошибок в комбинациях
  generateCombinationErrors() {
    return [
      {
        title: "🌊 Глобальный хаос",
        content: "Несогласованность между секторами привела к глобальному хаосу. Политические решения противоречат военным, экономические - научным. Система управления разваливается.",
        type: "error",
        sectors: ["political", "military", "economic"],
        canEliminate: true,
        eliminationRequirement: 4
      },
      {
        title: "🔬 Научная катастрофа",
        content: "Исследовательский сектор вышел из-под контроля других секторов. Эксперименты проводятся без учета политических и экономических последствий. Мир на грани научной катастрофы.",
        type: "error",
        sectors: ["research", "political", "economic"],
        canEliminate: true,
        eliminationRequirement: 3
      }
    ];
  }

  // Получение всех сюжетов
  getAllStories() {
    return [
      ...this.generateIntroStories(),
      ...this.generatePoliticalStories(),
      ...this.generateMilitaryStories(),
      ...this.generateEconomicStories(),
      ...this.generateResearchStories(),
      ...this.generatePropagandaStories(),
      ...this.generateCombinationStories(),
      ...this.generateCombinationErrors()
    ];
  }

  // Получение сюжетов по сектору
  getStoriesBySector(sector) {
    const allStories = this.getAllStories();
    return allStories.filter(story => 
      story.sector === sector || 
      (story.sectors && story.sectors.includes(sector))
    );
  }

  // Получение случайного сюжета
  getRandomStory(sector = null) {
    let stories;
    if (sector) {
      stories = this.getStoriesBySector(sector);
    } else {
      stories = this.getAllStories();
    }
    
    if (stories.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * stories.length);
    return stories[randomIndex];
  }

  // Получение сюжета по типу
  getStoriesByType(type) {
    const allStories = this.getAllStories();
    return allStories.filter(story => story.type === type);
  }

  // Проверка наличия видео в сюжете
  hasVideo(story) {
    return story.video && story.video !== null;
  }

  // Получение видео для сюжета
  getVideoForStory(story) {
    if (!this.hasVideo(story)) return null;
    
    const videoMap = {
      'meeting': 'meeting-video',
      'disorder': 'disorder-video',
      'exposure': 'exposure-video',
      'war': 'war-video',
      'time-travel': 'time-travel-video',
      'experiment': 'experiment-video'
    };
    
    return videoMap[story.video] || null;
  }

  // Переключение аудио
  toggleAudio() {
    this.audioEnabled = !this.audioEnabled;
    const audio = document.getElementById('horror-audio');
    const audioBtn = document.getElementById('toggle-audio');
    
    if (this.audioEnabled) {
      audio.play();
      audioBtn.classList.remove('muted');
    } else {
      audio.pause();
      audioBtn.classList.add('muted');
    }
  }

  // Воспроизведение аудио
  playAudio() {
    if (this.audioEnabled) {
      const audio = document.getElementById('horror-audio');
      audio.play();
    }
  }

  // Остановка аудио
  stopAudio() {
    const audio = document.getElementById('horror-audio');
    audio.pause();
    audio.currentTime = 0;
  }

  // Показ видео фона
  showVideoBackground(videoId) {
    // Скрываем все видео
    const allVideos = document.querySelectorAll('.background-video');
    allVideos.forEach(video => {
      video.classList.remove('active');
    });
    
    // Показываем нужное видео
    if (videoId) {
      const video = document.getElementById(videoId);
      if (video) {
        video.classList.add('active');
        this.currentVideo = videoId;
      }
    }
  }

  // Скрытие видео фона
  hideVideoBackground() {
    const allVideos = document.querySelectorAll('.background-video');
    allVideos.forEach(video => {
      video.classList.remove('active');
    });
    this.currentVideo = null;
  }
}
