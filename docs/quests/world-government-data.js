/* ===== WORLD GOVERNMENT QUEST DATA ===== */

// Данные о персонажах для квеста
const WORLD_GOVERNMENT_CHARACTERS = [
  // Политический сектор (4 человека)
  {
    id: 'politician1',
    name: 'Александр Петров',
    traits: 'Бывший генерал ФСБ, мастер манипуляций и стратегического планирования',
    description: 'Опытный политик с глубокими связями в силовых структурах. Способен принимать сложные решения и манипулировать общественным мнением.',
    sector: 'political',
    skills: ['Лидерство', 'Манипуляции', 'Стратегическое планирование'],
    strengths: ['Опыт в силовых структурах', 'Политические связи', 'Харизматичность'],
    weaknesses: ['Может быть слишком прямолинейным', 'Не всегда гибкий'],
    compatibility: {
      political: 95,
      military: 70,
      economic: 60,
      research: 40,
      propaganda: 80
    }
  },
  
  {
    id: 'politician2',
    name: 'Елена Соколова',
    traits: 'Бывший посол РФ в ООН, эксперт по международным отношениям',
    description: 'Дипломат высшего уровня с опытом работы в международных организациях. Мастер переговоров и создания альянсов.',
    sector: 'political',
    skills: ['Дипломатия', 'Международные отношения', 'Переговоры'],
    strengths: ['Международные связи', 'Опыт в ООН', 'Умение договариваться'],
    weaknesses: ['Может быть слишком осторожной', 'Не всегда решительна'],
    compatibility: {
      political: 90,
      military: 50,
      economic: 70,
      research: 45,
      propaganda: 75
    }
  },
  
  {
    id: 'politician3',
    name: 'Дмитрий Козлов',
    traits: 'Бывший министр внутренних дел, специалист по контролю над населением',
    description: 'Эксперт по внутренней политике и контролю над массами. Знает все механизмы управления обществом.',
    sector: 'political',
    skills: ['Внутренняя политика', 'Контроль над массами', 'Управление'],
    strengths: ['Опыт в МВД', 'Понимание общества', 'Организаторские способности'],
    weaknesses: ['Может быть слишком жестким', 'Не всегда креативен'],
    compatibility: {
      political: 85,
      military: 75,
      economic: 55,
      research: 40,
      propaganda: 85
    }
  },
  
  {
    id: 'politician4',
    name: 'Мария Волкова',
    traits: 'Бывший сенатор США, эксперт по конституционному праву',
    description: 'Американский политик с глубоким пониманием демократических институтов. Способна манипулировать правовой системой.',
    sector: 'political',
    skills: ['Конституционное право', 'Политические технологии', 'Лоббирование'],
    strengths: ['Опыт в Сенате США', 'Знание демократических институтов', 'Лоббистские связи'],
    weaknesses: ['Может быть слишком идеалистичной', 'Не всегда понимает авторитаризм'],
    compatibility: {
      political: 80,
      military: 45,
      economic: 65,
      research: 50,
      propaganda: 70
    }
  },

  // Военный сектор (3 человека)
  {
    id: 'military1',
    name: 'Сергей Морозов',
    traits: 'Бывший начальник Генштаба ВС РФ, стратег ядерной войны',
    description: 'Высокопоставленный военный с опытом планирования стратегических операций. Эксперт по ядерному сдерживанию.',
    sector: 'military',
    skills: ['Стратегическое планирование', 'Ядерная война', 'Военное командование'],
    strengths: ['Опыт в Генштабе', 'Знание ядерных стратегий', 'Командные навыки'],
    weaknesses: ['Может быть слишком милитаризованным', 'Не всегда понимает политику'],
    compatibility: {
      political: 70,
      military: 95,
      economic: 50,
      research: 60,
      propaganda: 65
    }
  },
  
  {
    id: 'military2',
    name: 'Анна Сидорова',
    traits: 'Бывший директор ЦРУ, эксперт по разведке и спецоперациям',
    description: 'Разведчик высшего уровня с опытом проведения секретных операций по всему миру.',
    sector: 'military',
    skills: ['Разведка', 'Спецоперации', 'Анализ угроз'],
    strengths: ['Опыт в ЦРУ', 'Международная разведсеть', 'Аналитические способности'],
    weaknesses: ['Может быть слишком подозрительной', 'Не всегда доверяет союзникам'],
    compatibility: {
      political: 75,
      military: 90,
      economic: 55,
      research: 70,
      propaganda: 60
    }
  },
  
  {
    id: 'military3',
    name: 'Виктор Новиков',
    traits: 'Бывший командующий НАТО, эксперт по альянсам и коалициям',
    description: 'Военный лидер с опытом управления многонациональными силами. Знает все о военных альянсах.',
    sector: 'military',
    skills: ['Военные альянсы', 'Коалиционные операции', 'Международное командование'],
    strengths: ['Опыт в НАТО', 'Международные связи', 'Лидерские качества'],
    weaknesses: ['Может быть слишком зависимым от союзников', 'Не всегда независим'],
    compatibility: {
      political: 65,
      military: 85,
      economic: 60,
      research: 55,
      propaganda: 70
    }
  },

  // Экономический сектор (2 человека)
  {
    id: 'economist1',
    name: 'Ольга Медведева',
    traits: 'Бывший председатель Центробанка РФ, эксперт по монетарной политике',
    description: 'Экономист высшего уровня с опытом управления национальной валютой и финансовой системой.',
    sector: 'economic',
    skills: ['Монетарная политика', 'Финансовая система', 'Экономическое планирование'],
    strengths: ['Опыт в Центробанке', 'Знание финансовых механизмов', 'Аналитические способности'],
    weaknesses: ['Может быть слишком консервативной', 'Не всегда понимает политику'],
    compatibility: {
      political: 60,
      military: 45,
      economic: 95,
      research: 70,
      propaganda: 55
    }
  },
  
  {
    id: 'economist2',
    name: 'Михаил Соколов',
    traits: 'Бывший глава МВФ, эксперт по мировым финансам и долгам',
    description: 'Международный экономист с опытом управления мировыми финансовыми потоками.',
    sector: 'economic',
    skills: ['Мировые финансы', 'Долговая политика', 'Международная экономика'],
    strengths: ['Опыт в МВФ', 'Международные связи', 'Знание мировых рынков'],
    weaknesses: ['Может быть слишком зависимым от мировых институтов', 'Не всегда понимает национальные интересы'],
    compatibility: {
      political: 70,
      military: 40,
      economic: 90,
      research: 65,
      propaganda: 60
    }
  },

  // Исследовательский сектор (2 человека)
  {
    id: 'researcher1',
    name: 'Доктор Игорь Лебедев',
    traits: 'Бывший директор Сколково, эксперт по инновациям и технологиям',
    description: 'Ученый-инноватор с опытом создания технологических прорывов. Специалист по искусственному интеллекту.',
    sector: 'research',
    skills: ['Инновации', 'Искусственный интеллект', 'Технологические прорывы'],
    strengths: ['Опыт в Сколково', 'Знание передовых технологий', 'Креативное мышление'],
    weaknesses: ['Может быть слишком увлеченным технологиями', 'Не всегда понимает последствия'],
    compatibility: {
      political: 50,
      military: 60,
      economic: 70,
      research: 95,
      propaganda: 65
    }
  },
  
  {
    id: 'researcher2',
    name: 'Доктор Елена Козлова',
    traits: 'Бывший научный директор DARPA, эксперт по военным технологиям',
    description: 'Ученый с опытом разработки военных технологий будущего. Специалист по биологическому оружию.',
    sector: 'research',
    skills: ['Военные технологии', 'Биологическое оружие', 'Научные исследования'],
    strengths: ['Опыт в DARPA', 'Знание военных технологий', 'Научная экспертиза'],
    weaknesses: ['Может быть слишком увлеченным исследованиями', 'Не всегда понимает этику'],
    compatibility: {
      political: 55,
      military: 80,
      economic: 60,
      research: 90,
      propaganda: 70
    }
  },

  // Пропагандистский сектор (3 человека)
  {
    id: 'propagandist1',
    name: 'Анна Петрова',
    traits: 'Бывший главный редактор RT, эксперт по информационным войнам',
    description: 'Медиа-эксперт с опытом ведения информационных войн и манипуляции общественным мнением.',
    sector: 'propaganda',
    skills: ['Информационные войны', 'Манипуляция СМИ', 'Пропаганда'],
    strengths: ['Опыт в RT', 'Знание медиа-механизмов', 'Мастер манипуляций'],
    weaknesses: ['Может быть слишком агрессивной', 'Не всегда понимает последствия'],
    compatibility: {
      political: 80,
      military: 65,
      economic: 55,
      research: 60,
      propaganda: 95
    }
  },
  
  {
    id: 'propagandist2',
    name: 'Сергей Иванов',
    traits: 'Бывший директор Cambridge Analytica, эксперт по психологическим манипуляциям',
    description: 'Психолог-манипулятор с опытом влияния на выборы и общественное мнение через социальные сети.',
    sector: 'propaganda',
    skills: ['Психологические манипуляции', 'Социальные сети', 'Влияние на выборы'],
    strengths: ['Опыт в Cambridge Analytica', 'Знание психологии масс', 'Технологии влияния'],
    weaknesses: ['Может быть слишком манипулятивным', 'Не всегда понимает границы'],
    compatibility: {
      political: 75,
      military: 55,
      economic: 65,
      research: 70,
      propaganda: 90
    }
  },
  
  {
    id: 'propagandist3',
    name: 'Мария Сидорова',
    traits: 'Бывший директор по коммуникациям Белого дома, эксперт по политическому PR',
    description: 'PR-эксперт с опытом управления имиджем высших политических лидеров.',
    sector: 'propaganda',
    skills: ['Политический PR', 'Управление имиджем', 'Коммуникационные стратегии'],
    strengths: ['Опыт в Белом доме', 'Знание политических механизмов', 'Коммуникационные навыки'],
    weaknesses: ['Может быть слишком зависимой от имиджа', 'Не всегда понимает суть'],
    compatibility: {
      political: 85,
      military: 50,
      economic: 60,
      research: 55,
      propaganda: 85
    }
  }
];

// Данные о секторах
const WORLD_GOVERNMENT_SECTORS = {
  political: {
    id: 'political',
    name: 'Политический штаб',
    maxMembers: 4,
    description: 'Управление политическими процессами и международными отношениями',
    icon: '🏛️',
    color: '#4ecdc4',
    effects: {
      stability: 25,
      influence: 30,
      control: 20
    }
  },
  
  military: {
    id: 'military',
    name: 'Военный штаб',
    maxMembers: 3,
    description: 'Контроль над вооруженными силами и стратегическое планирование',
    icon: '⚔️',
    color: '#ff6b6b',
    effects: {
      power: 30,
      security: 25,
      intimidation: 20
    }
  },
  
  economic: {
    id: 'economic',
    name: 'Экономический штаб',
    maxMembers: 2,
    description: 'Управление мировыми финансами и экономическими процессами',
    icon: '💰',
    color: '#feca57',
    effects: {
      wealth: 30,
      control: 25,
      influence: 20
    }
  },
  
  research: {
    id: 'research',
    name: 'Исследовательский штаб',
    maxMembers: 2,
    description: 'Разработка передовых технологий и научных прорывов',
    icon: '🔬',
    color: '#48dbfb',
    effects: {
      innovation: 30,
      power: 20,
      control: 15
    }
  },
  
  propaganda: {
    id: 'propaganda',
    name: 'Пропагандический штаб',
    maxMembers: 3,
    description: 'Контроль над СМИ и формирование общественного мнения',
    icon: '📺',
    color: '#ff9ff3',
    effects: {
      influence: 25,
      control: 20,
      stability: 15
    }
  }
};

// Данные о возможных исходах
const WORLD_GOVERNMENT_OUTCOMES = {
  success: {
    title: '🌍 Мировое господство достигнуто!',
    description: 'Ваше тайное правительство успешно установило контроль над миром. Все секторы работают идеально, и никаких угроз не предвидится.',
    probability: 0.1,
    rewards: {
      mulacoin: 5,
      xp: 300,
      achievement: 'Мастер мирового заговора'
    }
  },
  
  partialSuccess: {
    title: '⚖️ Частичный успех',
    description: 'Ваше правительство установило значительный контроль, но некоторые области остаются проблемными.',
    probability: 0.3,
    rewards: {
      mulacoin: 3,
      xp: 200,
      achievement: 'Амбициозный заговорщик'
    }
  },
  
  mixed: {
    title: '🔄 Смешанные результаты',
    description: 'Некоторые секторы работают хорошо, другие вызывают проблемы. Стабильность под угрозой.',
    probability: 0.4,
    rewards: {
      mulacoin: 2,
      xp: 150,
      achievement: 'Неуверенный заговорщик'
    }
  },
  
  failure: {
    title: '💥 Полный провал',
    description: 'Ваше тайное правительство потерпело крах. Секреты раскрыты, агенты арестованы.',
    probability: 0.2,
    rewards: {
      mulacoin: 1,
      xp: 100,
      achievement: 'Разоблаченный заговорщик'
    }
  }
};

// Данные о видео-сюжетах
const WORLD_GOVERNMENT_VIDEOS = {
  meting: {
    id: 'meting',
    title: '🌍 Массовые протесты по всему миру',
    description: 'Население планеты вышло на улицы, протестуя против тайного правительства. Митинги охватили все крупные города.',
    video: 'meting-video',
    triggers: ['political', 'propaganda'],
    effects: {
      stability: -20,
      influence: -15,
      control: -25
    }
  },
  
  besporyadki: {
    id: 'besporyadki',
    title: '🔥 Массовые беспорядки',
    description: 'Протесты переросли в насилие. Города охвачены хаосом, полиция не справляется с ситуацией.',
    video: 'besporyadki-video',
    triggers: ['military', 'propaganda'],
    effects: {
      stability: -30,
      power: -20,
      control: -35
    }
  },
  
  razobla4enie: {
    id: 'razobla4enie',
    title: '🔍 Раскрытие заговора',
    description: 'Журналисты-расследователи начали копать под мировое правительство. Секреты могут быть раскрыты.',
    video: 'razobla4enie-video',
    triggers: ['propaganda', 'political'],
    effects: {
      influence: -25,
      control: -30,
      stability: -40
    }
  },
  
  war: {
    id: 'war',
    title: '⚔️ Мировая война инициирована',
    description: 'По требованию мирового правительства началась война для отвлечения населения от других проблем.',
    video: 'war-video',
    triggers: ['military', 'political'],
    effects: {
      power: +20,
      stability: -15,
      control: +25
    }
  },
  
  puteshestvie: {
    id: 'puteshestvie',
    title: '⏰ Машина времени создана',
    description: 'Благодаря исследовательскому штабу создана машина времени с миниатюрными WARP двигателями.',
    video: 'puteshestvie-video',
    triggers: ['research'],
    effects: {
      innovation: +40,
      power: +30,
      control: +20
    }
  },
  
  experement: {
    id: 'experement',
    title: '🤖 ИИ внедрен в людей',
    description: 'Исследовательский штаб начал эксперименты по внедрению искусственного интеллекта в человеческий мозг.',
    video: 'experement-video',
    triggers: ['research'],
    effects: {
      innovation: +35,
      power: +25,
      control: +30
    }
  }
};

// Экспорт данных
window.WORLD_GOVERNMENT_DATA = {
  WORLD_GOVERNMENT_CHARACTERS,
  WORLD_GOVERNMENT_SECTORS,
  WORLD_GOVERNMENT_OUTCOMES,
  WORLD_GOVERNMENT_VIDEOS
};
