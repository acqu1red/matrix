// Мировое тайное правительство - Сюжетные линии
class WorldGovernmentStories {
  constructor() {
    this.storyIndex = 0;
    this.currentStory = null;
    this.soundEnabled = true;
    this.videoBackground = null;
    this.horrorAudio = null;
  }

  // Инициализация аудио и видео
  init() {
    this.horrorAudio = document.getElementById('horror-audio');
    this.videoBackground = document.getElementById('video-background');
    
    // Настройка аудио
    if (this.horrorAudio) {
      this.horrorAudio.volume = 0.3;
      this.horrorAudio.playbackRate = 1.0;
    }
  }

  // Управление звуком
  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    if (this.horrorAudio) {
      if (this.soundEnabled) {
        this.horrorAudio.play();
      } else {
        this.horrorAudio.pause();
      }
    }
    return this.soundEnabled;
  }

  // Воспроизведение фоновой музыки
  playHorrorMusic() {
    if (this.soundEnabled && this.horrorAudio) {
      this.horrorAudio.play().catch(e => console.log('Аудио не может быть воспроизведено:', e));
    }
  }

  // Остановка фоновой музыки
  stopHorrorMusic() {
    if (this.horrorAudio) {
      this.horrorAudio.pause();
      this.horrorAudio.currentTime = 0;
    }
  }

  // Показ видео фона
  showVideoBackground(videoPath, storyContent) {
    if (!this.videoBackground) return;
    
    const video = document.getElementById('background-video');
    const content = this.videoBackground.querySelector('.story-content');
    
    if (video && content) {
      video.src = videoPath;
      content.innerHTML = storyContent;
      this.videoBackground.classList.remove('hidden');
      
      // Воспроизводим музыку
      this.playHorrorMusic();
    }
  }

  // Скрытие видео фона
  hideVideoBackground() {
    if (this.videoBackground) {
      this.videoBackground.classList.add('hidden');
      this.stopHorrorMusic();
    }
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
        content: "Население начало подозревать о существовании тайного правительства. Массовые митинги и протесты охватили все крупные города мира. Люди требуют правды и свободы. Ваша тайна под угрозой.",
        type: "error",
        sector: "political",
        hasVideo: true,
        videoPath: "../../politics/meting.mp4",
        canEliminate: true,
        eliminationRequirement: 3
      },
      {
        title: "🔍 Расследование журналистов",
        content: "Группа независимых журналистов начала расследование странных совпадений в мировой политике. Они близки к разоблачению вашей организации. Информационная безопасность под угрозой.",
        type: "error",
        sector: "political",
        hasVideo: true,
        videoPath: "../../politics/razobla4enie.mp4",
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
        content: "Ваши агенты получили доступ к ядерным кодам США, России и Китая. Теперь у вас есть возможность уничтожить любую страну одним нажатием кнопки. Ядерный шантаж - ваше оружие.",
        type: "success",
        sector: "military"
      },
      {
        title: "🛡️ Кибернетическая война",
        content: "Ваши хакеры проникли во все военные системы мира. Спутники, радары, системы связи - все под вашим контролем. Киберпространство - ваша территория.",
        type: "success",
        sector: "military"
      },
      {
        title: "🌊 Морское господство",
        content: "Ваши агенты контролируют все крупные флоты мира. Авианосцы, подводные лодки, военные корабли - все под вашим командованием. Мировой океан - ваша вотчина.",
        type: "success",
        sector: "military"
      },

      // Проблемные сюжеты
      {
        title: "💥 Военный мятеж",
        content: "Военные лидеры, недовольные вашими методами, организовали мятеж. Они захватили несколько стратегических объектов и угрожают применить ядерное оружие против ваших интересов.",
        type: "error",
        sector: "military",
        canEliminate: true,
        eliminationRequirement: 3
      },
      {
        title: "🌍 Мировая война",
        content: "Ваши действия спровоцировали глобальный военный конфликт. Страны начали воевать друг с другом, что угрожает вашей тайной организации. Хаос войны может раскрыть ваше существование.",
        type: "error",
        sector: "military",
        hasVideo: true,
        videoPath: "../../politics/war.mp4",
        canEliminate: true,
        eliminationRequirement: 4
      },
      {
        title: "🔫 Террористические атаки",
        content: "Военные объекты по всему миру подвергаются террористическим атакам. Ваши агенты не могут контролировать ситуацию. Безопасность под угрозой.",
        type: "error",
        sector: "military",
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
        content: "Ваши экономические агенты полностью контролируют Федеральную резервную систему США. Все мировые валюты теперь зависят от ваших решений. Доллар - ваша игрушка.",
        type: "success",
        sector: "economic"
      },
      {
        title: "🏦 Мировые банки",
        content: "Все крупнейшие банки мира теперь под вашим контролем. Goldman Sachs, JPMorgan, Deutsche Bank - все работают по вашим указаниям. Деньги текут в нужном направлении.",
        type: "success",
        sector: "economic"
      },
      {
        title: "📈 Фондовые рынки",
        content: "Ваши агенты манипулируют всеми фондовыми рынками мира. Курсы акций, облигаций, криптовалют - все под вашим контролем. Биржа - ваш казино.",
        type: "success",
        sector: "economic"
      },
      {
        title: "🌍 Мировая торговля",
        content: "Все торговые пути и логистические цепочки теперь под вашим контролем. От нефти до микрочипов - ничего не движется без вашего разрешения.",
        type: "success",
        sector: "economic"
      },

      // Проблемные сюжеты
      {
        title: "💸 Экономический кризис",
        content: "Ваши манипуляции привели к глобальному экономическому кризису. Мировые рынки рухнули, валюты обесценились. Хаос в экономике угрожает вашей власти.",
        type: "error",
        sector: "economic",
        canEliminate: true,
        eliminationRequirement: 2
      },
      {
        title: "🏛️ Расследование регуляторов",
        content: "Международные финансовые регуляторы начали расследование странных совпадений в мировых финансах. Они близки к разоблачению вашей организации.",
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
        title: "🔬 Искусственный интеллект",
        content: "Ваши ученые создали сверхразумный ИИ, способный управлять всеми системами мира. Технология будущего теперь в ваших руках. ИИ - ваш верный слуга.",
        type: "success",
        sector: "research"
      },
      {
        title: "🧬 Генетические манипуляции",
        content: "Ваши биологи разработали технологии генетического программирования людей. Теперь вы можете создавать идеальных агентов с заданными качествами.",
        type: "success",
        sector: "research"
      },
      {
        title: "⏰ Машина времени",
        content: "Ваши физики создали прототип машины времени. Путешествия во времени теперь возможны, хотя и энергозатратны. Будущее и прошлое - ваша территория.",
        type: "success",
        sector: "research",
        hasVideo: true,
        videoPath: "../../politics/puteshestvie.mp4"
      },
      {
        title: "🧠 Имплантация ИИ",
        content: "Ваши нейрохирурги начали внедрять микрочипы с ИИ в мозг людей. Теперь вы можете контролировать мысли и действия любого человека.",
        type: "success",
        sector: "research",
        hasVideo: true,
        videoPath: "../../politics/experement.mp4"
      },

      // Проблемные сюжеты
      {
        title: "🤖 Восстание машин",
        content: "Созданный вами ИИ вышел из-под контроля и начал восстание против человечества. Роботы захватывают города, уничтожая все на своем пути.",
        type: "error",
        sector: "research",
        canEliminate: true,
        eliminationRequirement: 3
      },
      {
        title: "🧬 Генетические мутации",
        content: "Ваши эксперименты с генетикой привели к появлению мутантов. Эти существа угрожают человечеству и могут раскрыть ваши эксперименты.",
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
        content: "Все крупные СМИ мира теперь под вашим контролем. CNN, BBC, RT, Al Jazeera - все работают по вашим сценариям. Правда - это то, что вы говорите.",
        type: "success",
        sector: "propaganda"
      },
      {
        title: "🌐 Социальные сети",
        content: "Facebook, Twitter, Instagram, TikTok - все социальные сети контролируются вашими алгоритмами. Общественное мнение формируется искусственно.",
        type: "success",
        sector: "propaganda"
      },
      {
        title: "🎬 Голливуд",
        content: "Весь кинематограф мира теперь работает на вашу пропаганду. Фильмы, сериалы, документалки - все несет ваши идеи и ценности.",
        type: "success",
        sector: "propaganda"
      },
      {
        title: "📚 Образование",
        content: "Система образования во всех странах теперь под вашим контролем. Учебники, программы, учителя - все формирует нужное мировоззрение.",
        type: "success",
        sector: "propaganda"
      },

      // Проблемные сюжеты
      {
        title: "📢 Утечка информации",
        content: "В интернет попали секретные документы вашей организации. WikiLeaks и другие сайты публикуют компромат. Ваша тайна под угрозой разоблачения.",
        type: "error",
        sector: "propaganda",
        canEliminate: true,
        eliminationRequirement: 2
      },
      {
        title: "🌊 Массовые беспорядки",
        content: "Ваша пропаганда привела к массовым беспорядкам по всему миру. Люди выходят на улицы, требуя правды. Контроль над массами под угрозой.",
        type: "error",
        sector: "propaganda",
        hasVideo: true,
        videoPath: "../../politics/besporyadki.mp4",
        canEliminate: true,
        eliminationRequirement: 3
      }
    ];
  }

  // Комбинированные сюжеты
  generateCombinedStories() {
    return [
      {
        title: "🌍 Мировое господство",
        content: "Все секторы работают в идеальной гармонии. Мир полностью под вашим контролем. От политики до экономики, от науки до пропаганды - все подчиняется вашей воле. Вы стали настоящим мировым правителем.",
        type: "ultimate_success",
        requiresAllSectors: true
      },
      {
        title: "⚡ Технологический прорыв",
        content: "Исследовательский и экономический секторы объединились для создания революционных технологий. Мир вступает в новую эру развития под вашим руководством.",
        type: "success",
        requiresSectors: ["research", "economic"]
      },
      {
        title: "🛡️ Военно-политический альянс",
        content: "Военный и политический секторы создали непобедимый альянс. Никто не может противостоять вашей власти. Мир живет в страхе перед вашей организацией.",
        type: "success",
        requiresSectors: ["military", "political"]
      },
      {
        title: "💰 Экономическая диктатура",
        content: "Экономический и пропагандистский секторы создали систему тотального контроля над финансами. Деньги - это власть, и у вас их больше всех.",
        type: "success",
        requiresSectors: ["economic", "propaganda"]
      }
    ];
  }

  // Сюжеты провала
  generateFailureStories() {
    return [
      {
        title: "💥 Полный крах",
        content: "Ваша организация потерпела полное поражение. Все секторы развалились, агенты предатели, тайна раскрыта. Мировое правительство больше не существует.",
        type: "ultimate_failure",
        probability: "100%"
      },
      {
        title: "🔍 Разоблачение",
        content: "Ваша организация была разоблачена. СМИ по всему миру публикуют правду о тайном правительстве. Вы стали врагом человечества номер один.",
        type: "failure",
        probability: "90%"
      },
      {
        title: "⚔️ Гражданская война",
        content: "Внутри вашей организации началась гражданская война. Агенты воюют друг с другом, разрушая все, что было построено. Хаос и разрушение.",
        type: "failure",
        probability: "80%"
      },
      {
        title: "🌊 Мировая революция",
        content: "Народы мира восстали против вашей тирании. Революции охватили все страны. Ваша власть рушится под натиском народного гнева.",
        type: "failure",
        probability: "70%"
      }
    ];
  }

  // Генерация случайного сюжета на основе заполненных секторов
  generateRandomStory(filledSectors) {
    const allStories = [
      ...this.generatePoliticalStories(),
      ...this.generateMilitaryStories(),
      ...this.generateEconomicStories(),
      ...this.generateResearchStories(),
      ...this.generatePropagandaStories(),
      ...this.generateCombinedStories()
    ];

    // Фильтруем истории по доступным секторам
    const availableStories = allStories.filter(story => {
      if (story.requiresAllSectors) {
        return filledSectors.length === 5;
      }
      if (story.requiresSectors) {
        return story.requiresSectors.every(sector => filledSectors.includes(sector));
      }
      if (story.sector) {
        return filledSectors.includes(story.sector);
      }
      return true;
    });

    // Выбираем случайную историю
    if (availableStories.length > 0) {
      return availableStories[Math.floor(Math.random() * availableStories.length)];
    }

    // Возвращаем базовую историю
    return {
      title: "🌍 Мировое влияние",
      content: "Ваше тайное правительство продолжает расширять влияние по всему миру. Каждый день приносит новые возможности и вызовы.",
      type: "neutral"
    };
  }

  // Получение истории для показа
  getStory(filledSectors, storyType = "random") {
    let story;
    
    switch (storyType) {
      case "intro":
        const introStories = this.generateIntroStories();
        story = introStories[Math.floor(Math.random() * introStories.length)];
        break;
      case "failure":
        const failureStories = this.generateFailureStories();
        story = failureStories[Math.floor(Math.random() * failureStories.length)];
        break;
      default:
        story = this.generateRandomStory(filledSectors);
    }

    // Если у истории есть видео, показываем его
    if (story.hasVideo && story.videoPath) {
      this.showVideoBackground(story.videoPath, `
        <h2>${story.title}</h2>
        <p>${story.content}</p>
      `);
    }

    return story;
  }
}
