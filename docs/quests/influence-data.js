/* ===== INFLUENCE EMPIRE DATA ===== */

// Конфигурация квеста
const EMPIRE_CONFIG = {
  stages: 5,
  maxStrategiesPerStage: 6,
  platforms: ['youtube', 'instagram', 'tiktok', 'telegram'],
  rewards: {
    mulacoin: 50,
    experience: 200
  },
  startingMetrics: {
    followers: 1000,
    revenue: 0,
    influence: 10,
    reputation: 100
  }
};

// Стратегии по этапам
const STRATEGIES_DATA = {
  stage1: [ // Создание контента
    {
      id: 'viral-challenges',
      name: 'Вирусные челленджи',
      type: 'Контент',
      icon: '🔥',
      description: 'Создание заразительных челленджей для массового участия аудитории',
      effects: {
        followers: { min: 500, max: 2000 },
        engagement: { min: 15, max: 35 },
        reputation: { min: -5, max: 10 }
      },
      platforms: ['tiktok', 'instagram'],
      psychologyTrigger: 'Социальное доказательство + FOMO',
      difficulty: 'medium'
    },
    {
      id: 'controversial-takes',
      name: 'Провокационные мнения',
      type: 'Контент',
      icon: '💥',
      description: 'Высказывание спорных мнений для привлечения внимания и дискуссий',
      effects: {
        followers: { min: 200, max: 1500 },
        engagement: { min: 25, max: 50 },
        reputation: { min: -15, max: 5 }
      },
      platforms: ['youtube', 'telegram'],
      psychologyTrigger: 'Эмоциональная поляризация',
      difficulty: 'high'
    },
    {
      id: 'educational-content',
      name: 'Образовательный контент',
      type: 'Контент',
      icon: '🧠',
      description: 'Полезная информация и обучающие материалы для целевой аудитории',
      effects: {
        followers: { min: 300, max: 800 },
        engagement: { min: 20, max: 30 },
        reputation: { min: 5, max: 15 }
      },
      platforms: ['youtube', 'telegram'],
      psychologyTrigger: 'Авторитет + Взаимность',
      difficulty: 'low'
    },
    {
      id: 'lifestyle-content',
      name: 'Лайфстайл контент',
      type: 'Контент',
      icon: '✨',
      description: 'Демонстрация роскошной жизни и успеха для вдохновения подписчиков',
      effects: {
        followers: { min: 400, max: 1200 },
        engagement: { min: 18, max: 28 },
        reputation: { min: 0, max: 8 }
      },
      platforms: ['instagram', 'youtube'],
      psychologyTrigger: 'Зависть + Стремление к статусу',
      difficulty: 'medium'
    },
    {
      id: 'behind-scenes',
      name: 'За кулисами',
      type: 'Контент',
      icon: '🎬',
      description: 'Показ закулисной жизни для создания близости с аудиторией',
      effects: {
        followers: { min: 250, max: 600 },
        engagement: { min: 30, max: 40 },
        reputation: { min: 3, max: 12 }
      },
      platforms: ['instagram', 'tiktok'],
      psychologyTrigger: 'Интимность + Доверие',
      difficulty: 'low'
    },
    {
      id: 'meme-content',
      name: 'Мемный контент',
      type: 'Контент',
      icon: '😂',
      description: 'Создание и адаптация мемов для быстрого распространения',
      effects: {
        followers: { min: 600, max: 1800 },
        engagement: { min: 35, max: 55 },
        reputation: { min: -2, max: 5 }
      },
      platforms: ['tiktok', 'instagram'],
      psychologyTrigger: 'Юмор + Принадлежность к группе',
      difficulty: 'medium'
    }
  ],

  stage2: [ // Психологические триггеры
    {
      id: 'scarcity-tactics',
      name: 'Искусственный дефицит',
      type: 'Психология',
      icon: '⏰',
      description: 'Создание ощущения ограниченности времени и количества для стимуляции действий',
      effects: {
        conversion: { min: 8, max: 18 },
        revenue: { min: 500, max: 2000 },
        reputation: { min: -8, max: 3 }
      },
      platforms: ['telegram', 'youtube'],
      psychologyTrigger: 'Принцип дефицита',
      difficulty: 'high'
    },
    {
      id: 'social-proof',
      name: 'Социальные доказательства',
      type: 'Психология',
      icon: '👥',
      description: 'Демонстрация популярности через отзывы, статистику и толпу подписчиков',
      effects: {
        followers: { min: 800, max: 2500 },
        conversion: { min: 5, max: 12 },
        reputation: { min: 2, max: 10 }
      },
      platforms: ['instagram', 'youtube'],
      psychologyTrigger: 'Социальное доказательство',
      difficulty: 'medium'
    },
    {
      id: 'authority-building',
      name: 'Построение авторитета',
      type: 'Психология',
      icon: '👑',
      description: 'Демонстрация экспертности через достижения, награды и упоминания в СМИ',
      effects: {
        influence: { min: 10, max: 25 },
        conversion: { min: 12, max: 20 },
        reputation: { min: 8, max: 18 }
      },
      platforms: ['youtube', 'telegram'],
      psychologyTrigger: 'Принцип авторитета',
      difficulty: 'high'
    },
    {
      id: 'reciprocity-hooks',
      name: 'Крючки взаимности',
      type: 'Психология',
      icon: '🎁',
      description: 'Предоставление бесплатной ценности для создания чувства долга',
      effects: {
        followers: { min: 400, max: 1000 },
        engagement: { min: 20, max: 35 },
        conversion: { min: 6, max: 14 }
      },
      platforms: ['telegram', 'youtube'],
      psychologyTrigger: 'Принцип взаимности',
      difficulty: 'medium'
    },
    {
      id: 'commitment-consistency',
      name: 'Обязательства и последовательность',
      type: 'Психология',
      icon: '✅',
      description: 'Получение публичных обязательств от аудитории для повышения лояльности',
      effects: {
        engagement: { min: 25, max: 45 },
        conversion: { min: 10, max: 18 },
        reputation: { min: 5, max: 12 }
      },
      platforms: ['instagram', 'tiktok'],
      psychologyTrigger: 'Последовательность',
      difficulty: 'high'
    },
    {
      id: 'emotional-manipulation',
      name: 'Эмоциональные триггеры',
      type: 'Психология',
      icon: '💔',
      description: 'Использование страхов, желаний и болевых точек для мотивации действий',
      effects: {
        engagement: { min: 30, max: 60 },
        conversion: { min: 15, max: 25 },
        reputation: { min: -12, max: 2 }
      },
      platforms: ['youtube', 'telegram'],
      psychologyTrigger: 'Эмоциональное воздействие',
      difficulty: 'very-high'
    }
  ],

  stage3: [ // Монетизация
    {
      id: 'affiliate-marketing',
      name: 'Партнерский маркетинг',
      type: 'Монетизация',
      icon: '🤝',
      description: 'Продвижение товаров и услуг партнеров за комиссию',
      effects: {
        revenue: { min: 1000, max: 5000 },
        reputation: { min: -3, max: 8 },
        conversion: { min: 3, max: 8 }
      },
      platforms: ['youtube', 'telegram'],
      psychologyTrigger: 'Доверие + Рекомендации',
      difficulty: 'medium'
    },
    {
      id: 'own-products',
      name: 'Собственные продукты',
      type: 'Монетизация',
      icon: '📦',
      description: 'Создание и продажа собственных курсов, товаров или услуг',
      effects: {
        revenue: { min: 2000, max: 8000 },
        influence: { min: 5, max: 15 },
        reputation: { min: 0, max: 12 }
      },
      platforms: ['youtube', 'telegram'],
      psychologyTrigger: 'Авторитет + Ценность',
      difficulty: 'high'
    },
    {
      id: 'subscription-model',
      name: 'Подписочная модель',
      type: 'Монетизация',
      icon: '💳',
      description: 'Создание эксклюзивного контента за ежемесячную плату',
      effects: {
        revenue: { min: 1500, max: 6000 },
        engagement: { min: 40, max: 70 },
        reputation: { min: 2, max: 10 }
      },
      platforms: ['telegram', 'youtube'],
      psychologyTrigger: 'Эксклюзивность + Статус',
      difficulty: 'high'
    },
    {
      id: 'sponsored-content',
      name: 'Спонсорский контент',
      type: 'Монетизация',
      icon: '💰',
      description: 'Размещение рекламы брендов в своем контенте',
      effects: {
        revenue: { min: 800, max: 4000 },
        reputation: { min: -5, max: 5 },
        engagement: { min: -10, max: 5 }
      },
      platforms: ['instagram', 'youtube'],
      psychologyTrigger: 'Интеграция + Доверие',
      difficulty: 'medium'
    },
    {
      id: 'live-donations',
      name: 'Донаты и стримы',
      type: 'Монетизация',
      icon: '🎥',
      description: 'Получение денег от аудитории во время прямых эфиров',
      effects: {
        revenue: { min: 500, max: 3000 },
        engagement: { min: 50, max: 80 },
        reputation: { min: -2, max: 8 }
      },
      platforms: ['youtube', 'tiktok'],
      psychologyTrigger: 'Благодарность + Взаимодействие',
      difficulty: 'medium'
    },
    {
      id: 'premium-community',
      name: 'Премиум-сообщество',
      type: 'Монетизация',
      icon: '👥',
      description: 'Создание закрытого сообщества с дополнительными возможностями',
      effects: {
        revenue: { min: 2500, max: 7000 },
        influence: { min: 8, max: 20 },
        engagement: { min: 30, max: 50 }
      },
      platforms: ['telegram', 'youtube'],
      psychologyTrigger: 'Принадлежность + Статус',
      difficulty: 'very-high'
    }
  ],

  stage4: [ // Масштабирование
    {
      id: 'multi-platform',
      name: 'Мультиплатформенность',
      type: 'Масштабирование',
      icon: '🌐',
      description: 'Синхронизация контента между всеми платформами для максимального охвата',
      effects: {
        followers: { min: 2000, max: 8000 },
        reach: { min: 50000, max: 200000 },
        influence: { min: 15, max: 30 }
      },
      platforms: ['all'],
      psychologyTrigger: 'Вездесущность + Авторитет',
      difficulty: 'high'
    },
    {
      id: 'team-building',
      name: 'Создание команды',
      type: 'Масштабирование',
      icon: '👥',
      description: 'Найм редакторов, SMM-менеджеров и других специалистов',
      effects: {
        engagement: { min: 20, max: 40 },
        revenue: { min: 3000, max: 10000 },
        reputation: { min: 5, max: 15 }
      },
      platforms: ['all'],
      psychologyTrigger: 'Профессионализм + Качество',
      difficulty: 'very-high'
    },
    {
      id: 'brand-partnerships',
      name: 'Брендовые партнерства',
      type: 'Масштабирование',
      icon: '🤝',
      description: 'Долгосрочные контракты с крупными брендами',
      effects: {
        revenue: { min: 5000, max: 15000 },
        influence: { min: 10, max: 25 },
        reputation: { min: 0, max: 12 }
      },
      platforms: ['youtube', 'instagram'],
      psychologyTrigger: 'Статус + Доверие брендов',
      difficulty: 'very-high'
    },
    {
      id: 'automation-tools',
      name: 'Автоматизация процессов',
      type: 'Масштабирование',
      icon: '🤖',
      description: 'Внедрение ботов и автоматических систем для управления аудиторией',
      effects: {
        engagement: { min: 15, max: 35 },
        conversion: { min: 8, max: 15 },
        reputation: { min: -5, max: 8 }
      },
      platforms: ['telegram', 'instagram'],
      psychologyTrigger: 'Эффективность + Доступность',
      difficulty: 'high'
    },
    {
      id: 'international-expansion',
      name: 'Международная экспансия',
      type: 'Масштабирование',
      icon: '🌍',
      description: 'Выход на зарубежные рынки с адаптированным контентом',
      effects: {
        followers: { min: 5000, max: 20000 },
        revenue: { min: 4000, max: 12000 },
        influence: { min: 20, max: 40 }
      },
      platforms: ['youtube', 'tiktok'],
      psychologyTrigger: 'Глобальность + Престиж',
      difficulty: 'very-high'
    },
    {
      id: 'media-appearances',
      name: 'Медийные появления',
      type: 'Масштабирование',
      icon: '📺',
      description: 'Участие в телешоу, подкастах и интервью для расширения аудитории',
      effects: {
        followers: { min: 3000, max: 12000 },
        influence: { min: 25, max: 50 },
        reputation: { min: 8, max: 20 }
      },
      platforms: ['youtube'],
      psychologyTrigger: 'Авторитет СМИ + Экспертность',
      difficulty: 'very-high'
    }
  ],

  stage5: [ // Кризис-менеджмент
    {
      id: 'scandal-management',
      name: 'Управление скандалами',
      type: 'Кризис',
      icon: '🔥',
      description: 'Стратегии работы со скандалами и негативными событиями',
      effects: {
        reputation: { min: -20, max: 30 },
        followers: { min: -5000, max: 10000 },
        influence: { min: -10, max: 25 }
      },
      platforms: ['all'],
      psychologyTrigger: 'Кризисные коммуникации',
      difficulty: 'very-high'
    },
    {
      id: 'competitor-warfare',
      name: 'Конкурентная борьба',
      type: 'Кризис',
      icon: '⚔️',
      description: 'Тактики противостояния конкурентам и защиты своей ниши',
      effects: {
        influence: { min: 5, max: 35 },
        reputation: { min: -15, max: 10 },
        followers: { min: -2000, max: 8000 }
      },
      platforms: ['all'],
      psychologyTrigger: 'Конфликт + Лояльность',
      difficulty: 'very-high'
    },
    {
      id: 'platform-changes',
      name: 'Изменения алгоритмов',
      type: 'Кризис',
      icon: '📉',
      description: 'Адаптация к изменениям в алгоритмах социальных сетей',
      effects: {
        engagement: { min: -30, max: 20 },
        reach: { min: -50000, max: 100000 },
        revenue: { min: -3000, max: 5000 }
      },
      platforms: ['all'],
      psychologyTrigger: 'Адаптивность + Устойчивость',
      difficulty: 'high'
    },
    {
      id: 'legal-issues',
      name: 'Правовые вопросы',
      type: 'Кризис',
      icon: '⚖️',
      description: 'Работа с авторскими правами, жалобами и судебными исками',
      effects: {
        reputation: { min: -10, max: 15 },
        revenue: { min: -5000, max: 2000 },
        influence: { min: -5, max: 10 }
      },
      platforms: ['youtube', 'telegram'],
      psychologyTrigger: 'Законность + Прозрачность',
      difficulty: 'very-high'
    },
    {
      id: 'burnout-recovery',
      name: 'Восстановление от выгорания',
      type: 'Кризис',
      icon: '💊',
      description: 'Стратегии восстановления мотивации и энергии создателя контента',
      effects: {
        engagement: { min: -20, max: 40 },
        reputation: { min: 5, max: 20 },
        influence: { min: -5, max: 15 }
      },
      platforms: ['all'],
      psychologyTrigger: 'Человечность + Уязвимость',
      difficulty: 'high'
    },
    {
      id: 'legacy-building',
      name: 'Построение наследия',
      type: 'Кризис',
      icon: '🏛️',
      description: 'Создание долгосрочного влияния и культурного наследия',
      effects: {
        influence: { min: 30, max: 100 },
        reputation: { min: 15, max: 50 },
        revenue: { min: 0, max: 20000 }
      },
      platforms: ['all'],
      psychologyTrigger: 'Наследие + Бессмертие',
      difficulty: 'legendary'
    }
  ]
};

// Случайные события
const RANDOM_EVENTS = [
  {
    id: 'viral-moment',
    name: 'Вирусный момент',
    icon: '🚀',
    description: 'Ваш контент неожиданно стал вирусным!',
    effects: {
      followers: { min: 5000, max: 50000 },
      influence: { min: 10, max: 30 },
      revenue: { min: 1000, max: 10000 }
    },
    probability: 0.1
  },
  {
    id: 'controversy',
    name: 'Скандал',
    icon: '💥',
    description: 'Ваши старые высказывания вызвали скандал',
    effects: {
      followers: { min: -10000, max: 5000 },
      reputation: { min: -30, max: -10 },
      influence: { min: -15, max: 5 }
    },
    probability: 0.15
  },
  {
    id: 'platform-ban',
    name: 'Блокировка платформы',
    icon: '🚫',
    description: 'Одна из платформ временно заблокировала ваш аккаунт',
    effects: {
      followers: { min: -5000, max: -1000 },
      revenue: { min: -3000, max: -500 },
      reputation: { min: -10, max: 5 }
    },
    probability: 0.08
  },
  {
    id: 'collaboration-offer',
    name: 'Предложение о сотрудничестве',
    icon: '🤝',
    description: 'Известный блогер предложил коллаборацию',
    effects: {
      followers: { min: 2000, max: 15000 },
      influence: { min: 5, max: 20 },
      reputation: { min: 5, max: 15 }
    },
    probability: 0.12
  },
  {
    id: 'algorithm-change',
    name: 'Изменение алгоритма',
    icon: '📊',
    description: 'Платформа изменила алгоритм показов',
    effects: {
      engagement: { min: -40, max: 20 },
      reach: { min: -100000, max: 50000 },
      revenue: { min: -2000, max: 3000 }
    },
    probability: 0.18
  },
  {
    id: 'trend-opportunity',
    name: 'Новый тренд',
    icon: '🌟',
    description: 'Появился новый тренд, который идеально подходит вашему контенту',
    effects: {
      followers: { min: 3000, max: 20000 },
      engagement: { min: 20, max: 50 },
      influence: { min: 8, max: 25 }
    },
    probability: 0.14
  }
];

// Психологические подсказки по этапам
const PSYCHOLOGY_HINTS = {
  stage1: [
    "Принцип социального доказательства: люди делают то, что делают другие",
    "FOMO (Fear of Missing Out) заставляет людей действовать быстрее",
    "Эмоциональный контент распространяется в 2 раза быстрее рационального",
    "Визуальный контент получает на 94% больше просмотров"
  ],
  stage2: [
    "Принцип дефицита: ограниченность увеличивает воспринимаемую ценность",
    "Авторитет: люди подчиняются экспертам и авторитетным фигурам",
    "Взаимность: люди чувствуют обязанность отплатить за полученную пользу",
    "Последовательность: люди стремятся быть последовательными в своих действиях"
  ],
  stage3: [
    "Якорение: первая цена становится точкой отсчета для всех последующих",
    "Потеря кажется в 2 раза болезненнее равнозначной прибыли",
    "Бесплатное всегда привлекает внимание, даже если не нужно",
    "Подписочная модель создает предсказуемый доход"
  ],
  stage4: [
    "Эффект сети: ценность растет с количеством пользователей",
    "Профессиональная команда повышает доверие к бренду",
    "Международная аудитория увеличивает влияние в разы",
    "Автоматизация освобождает время для стратегического мышления"
  ],
  stage5: [
    "В кризисе важна скорость реакции - молчание воспринимается как вина",
    "Прозрачность и честность восстанавливают доверие быстрее оправданий",
    "Любой кризис можно превратить в возможность для роста",
    "Наследие строится не на популярности, а на влиянии на людей"
  ]
};

// Функции для работы с данными
const InfluenceDataService = {
  getStrategiesByStage: (stage) => {
    return STRATEGIES_DATA[`stage${stage}`] || [];
  },
  
  getStrategyById: (id) => {
    for (let stage of Object.values(STRATEGIES_DATA)) {
      const strategy = stage.find(s => s.id === id);
      if (strategy) return strategy;
    }
    return null;
  },
  
  getRandomEvent: () => {
    const availableEvents = RANDOM_EVENTS.filter(event => Math.random() < event.probability);
    if (availableEvents.length === 0) return null;
    
    return availableEvents[Math.floor(Math.random() * availableEvents.length)];
  },
  
  getPsychologyHints: (stage) => {
    return PSYCHOLOGY_HINTS[`stage${stage}`] || [];
  },
  
  calculateStrategyEffect: (strategy, platform) => {
    const effects = {};
    
    // Проверяем совместимость с платформой
    const platformMultiplier = strategy.platforms.includes(platform) || strategy.platforms.includes('all') ? 1 : 0.5;
    
    for (let [key, range] of Object.entries(strategy.effects)) {
      const baseValue = range.min + Math.random() * (range.max - range.min);
      effects[key] = Math.round(baseValue * platformMultiplier);
    }
    
    return effects;
  },
  
  calculateEventEffect: (event) => {
    const effects = {};
    
    for (let [key, range] of Object.entries(event.effects)) {
      effects[key] = Math.round(range.min + Math.random() * (range.max - range.min));
    }
    
    return effects;
  },
  
  getStageDescription: (stage) => {
    const descriptions = {
      1: "Создание контента - основа вашей империи влияния",
      2: "Психологические триггеры - инструменты воздействия на аудиторию", 
      3: "Монетизация - превращение влияния в деньги",
      4: "Масштабирование - расширение империи на новые высоты",
      5: "Кризис-менеджмент - управление репутацией и наследием"
    };
    
    return descriptions[stage] || "Неизвестный этап";
  },
  
  getDifficultyColor: (difficulty) => {
    const colors = {
      'low': '#00ff88',
      'medium': '#ffaa00', 
      'high': '#ff6b6b',
      'very-high': '#ff4444',
      'legendary': '#9b59b6'
    };
    
    return colors[difficulty] || '#ffffff';
  },
  
  formatNumber: (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }
};
