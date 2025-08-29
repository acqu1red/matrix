/* ===== BUSINESS QUEST DATA ===== */

// Конфигурация квеста
const BUSINESS_CONFIG = {
  stages: 4,
  maxEmployees: 6,
  startingCapital: 50000,
  rewards: {
    mulacoin: 3,
    experience: 200
  },
  salaryRanges: {
    tech: [4000, 10000],
    marketing: [3000, 8000],
    operations: [3000, 7500],
    finance: [3500, 8500],
    sales: [2500, 7000],
    creative: [3200, 7500]
  }
};

// Ниши бизнеса (4 основные)
const BUSINESS_NICHES = [
  {
    id: 'marketplace',
    name: 'Онлайн-маркетплейс',
    category: 'E-commerce',
    icon: '🛒',
    description: 'Платформа для продажи товаров различных категорий с комиссией с продаж',
    metrics: {
      startupCost: 25000,
      monthlyRevenue: 15000,
      competition: 'Высокая',
      growth: '+180%',
      difficulty: 'Сложно'
    },
    requiredRoles: ['tech', 'marketing', 'operations'],
    revenueMultiplier: 1.8,
    riskFactor: 0.7
  },
  {
    id: 'restaurant',
    name: 'Ресторан быстрого питания',
    category: 'Общепит',
    icon: '🍔',
    description: 'Заведение быстрого обслуживания с доставкой и самовывозом',
    metrics: {
      startupCost: 35000,
      monthlyRevenue: 12000,
      competition: 'Средняя',
      growth: '+85%',
      difficulty: 'Средне'
    },
    requiredRoles: ['operations', 'marketing', 'finance'],
    revenueMultiplier: 1.2,
    riskFactor: 0.8
  },
  {
    id: 'saas',
    name: 'SaaS платформа',
    category: 'IT',
    icon: '💻',
    description: 'Программное обеспечение как услуга для бизнеса с подписочной моделью',
    metrics: {
      startupCost: 20000,
      monthlyRevenue: 18000,
      competition: 'Высокая',
      growth: '+220%',
      difficulty: 'Очень сложно'
    },
    requiredRoles: ['tech', 'sales', 'marketing'],
    revenueMultiplier: 2.2,
    riskFactor: 0.6
  },
  {
    id: 'agency',
    name: 'Digital-агентство',
    category: 'Маркетинг',
    icon: '📱',
    description: 'Услуги цифрового маркетинга и разработки для клиентов',
    metrics: {
      startupCost: 22000,
      monthlyRevenue: 13000,
      competition: 'Очень высокая',
      growth: '+160%',
      difficulty: 'Сложно'
    },
    requiredRoles: ['marketing', 'creative', 'tech'],
    revenueMultiplier: 1.6,
    riskFactor: 0.6
  }
];

// База данных кандидатов (оптимизированная для 6 должностей)
const CANDIDATES_DATABASE = [
  // Технологи
  {
    id: 'tech_001',
    name: 'Алексей Код',
    avatar: '👨‍💻',
    skills: ['Разработка', 'Инновации', 'Аналитика'],
    experience: 5,
    salary: 8000,
    role: 'tech',
    personality: 'Логичный',
    efficiency: 0.9
  },
  {
    id: 'tech_002',
    name: 'Мария Байт',
    avatar: '👩‍💻',
    skills: ['Программирование', 'Архитектура', 'Тестирование'],
    experience: 3,
    salary: 6000,
    role: 'tech',
    personality: 'Внимательная',
    efficiency: 0.8
  },
  
  // Маркетологи
  {
    id: 'marketing_001',
    name: 'Дмитрий Промо',
    avatar: '👨‍💼',
    skills: ['Креативность', 'Аналитика', 'SMM'],
    experience: 4,
    salary: 5500,
    role: 'marketing',
    personality: 'Креативный',
    efficiency: 0.85
  },
  {
    id: 'marketing_002',
    name: 'Анна Бренд',
    avatar: '👩‍💼',
    skills: ['Брендинг', 'Контент', 'SEO'],
    experience: 6,
    salary: 7000,
    role: 'marketing',
    personality: 'Стратегический',
    efficiency: 0.9
  },
  
  // Операционщики
  {
    id: 'operations_001',
    name: 'Сергей Процесс',
    avatar: '👨‍🏭',
    skills: ['Организация', 'Эффективность', 'Логистика'],
    experience: 7,
    salary: 6500,
    role: 'operations',
    personality: 'Организованный',
    efficiency: 0.9
  },
  {
    id: 'operations_002',
    name: 'Елена Система',
    avatar: '👩‍🏭',
    skills: ['Управление', 'Оптимизация', 'Контроль'],
    experience: 4,
    salary: 5000,
    role: 'operations',
    personality: 'Системный',
    efficiency: 0.8
  },
  
  // Финансисты
  {
    id: 'finance_001',
    name: 'Артем Бюджет',
    avatar: '👨‍💼',
    skills: ['Математика', 'Планирование', 'Анализ'],
    experience: 8,
    salary: 7500,
    role: 'finance',
    personality: 'Точный',
    efficiency: 0.95
  },
  {
    id: 'finance_002',
    name: 'Ольга Капитал',
    avatar: '👩‍💼',
    skills: ['Бухгалтерия', 'Инвестиции', 'Риски'],
    experience: 5,
    salary: 6000,
    role: 'finance',
    personality: 'Осторожная',
    efficiency: 0.85
  },
  
  // Продажники
  {
    id: 'sales_001',
    name: 'Игорь Сделка',
    avatar: '👨‍💼',
    skills: ['Коммуникация', 'Убеждение', 'Переговоры'],
    experience: 6,
    salary: 6000,
    role: 'sales',
    personality: 'Коммуникабельный',
    efficiency: 0.9
  },
  {
    id: 'sales_002',
    name: 'Татьяна Клиент',
    avatar: '👩‍💼',
    skills: ['Работа с клиентами', 'Презентации', 'Закрытие'],
    experience: 4,
    salary: 4500,
    role: 'sales',
    personality: 'Дружелюбная',
    efficiency: 0.8
  },
  
  // Креативщики
  {
    id: 'creative_001',
    name: 'Михаил Дизайн',
    avatar: '👨‍🎨',
    skills: ['Дизайн', 'Идеи', 'Визуализация'],
    experience: 5,
    salary: 6000,
    role: 'creative',
    personality: 'Креативный',
    efficiency: 0.85
  },
  {
    id: 'creative_002',
    name: 'Юлия Арт',
    avatar: '👩‍🎨',
    skills: ['Креатив', 'Брендинг', 'Иллюстрация'],
    experience: 3,
    salary: 4500,
    role: 'creative',
    personality: 'Художественная',
    efficiency: 0.8
  }
];

// Должности для подбора команды
const POSITIONS = [
  {
    id: 'tech',
    title: 'Технолог',
    requirements: ['Разработка', 'Инновации'],
    description: 'Отвечает за техническую реализацию продукта',
    salary: [4000, 10000],
    importance: 0.9
  },
  {
    id: 'marketing',
    title: 'Маркетолог',
    requirements: ['Креативность', 'Аналитика'],
    description: 'Управляет продвижением и брендингом',
    salary: [3000, 8000],
    importance: 0.8
  },
  {
    id: 'operations',
    title: 'Операционщик',
    requirements: ['Организация', 'Эффективность'],
    description: 'Координирует внутренние процессы',
    salary: [3000, 7500],
    importance: 0.7
  },
  {
    id: 'finance',
    title: 'Финансист',
    requirements: ['Математика', 'Планирование'],
    description: 'Управляет бюджетом и финансовым планированием',
    salary: [3500, 8500],
    importance: 0.8
  },
  {
    id: 'sales',
    title: 'Продажник',
    requirements: ['Коммуникация', 'Убеждение'],
    description: 'Привлекает клиентов и закрывает сделки',
    salary: [2500, 7000],
    importance: 0.7
  },
  {
    id: 'creative',
    title: 'Креативщик',
    requirements: ['Дизайн', 'Идеи'],
    description: 'Создает визуальный контент и креативные решения',
    salary: [3200, 7500],
    importance: 0.6
  }
];

// Решения для управления бизнесом
const BUSINESS_DECISIONS = [
  {
    id: 'marketing_boost',
    title: 'Усилить маркетинг',
    description: 'Увеличить рекламный бюджет для привлечения клиентов',
    cost: 5000,
    effect: {
      revenue: 1.3,
      reputation: 1.2,
      risk: 1.1
    },
    category: 'marketing'
  },
  {
    id: 'team_training',
    title: 'Обучение команды',
    description: 'Провести тренинги для повышения квалификации',
    cost: 3000,
    effect: {
      efficiency: 1.25,
      reputation: 1.1,
      cost: 0.9
    },
    category: 'hr'
  },
  {
    id: 'tech_upgrade',
    title: 'Техническое обновление',
    description: 'Модернизировать техническую базу',
    cost: 8000,
    effect: {
      efficiency: 1.4,
      revenue: 1.15,
      cost: 0.95
    },
    category: 'tech'
  },
  {
    id: 'expansion',
    title: 'Расширение бизнеса',
    description: 'Открыть новое направление или филиал',
    cost: 15000,
    effect: {
      revenue: 1.6,
      reputation: 1.3,
      risk: 1.4
    },
    category: 'strategy'
  },
  {
    id: 'cost_reduction',
    title: 'Сокращение расходов',
    description: 'Оптимизировать затраты и процессы',
    cost: 2000,
    effect: {
      cost: 0.8,
      efficiency: 1.1,
      reputation: 0.9
    },
    category: 'finance'
  },
  {
    id: 'partnership',
    title: 'Стратегическое партнерство',
    description: 'Найти партнеров для совместного развития',
    cost: 5000,
    effect: {
      revenue: 1.25,
      reputation: 1.2,
      risk: 0.9
    },
    category: 'strategy'
  }
];

// События для бизнеса
const BUSINESS_EVENTS = [
  {
    id: 'market_boom',
    title: 'Бум на рынке',
    description: 'Рынок показывает неожиданный рост',
    effect: {
      revenue: 1.5,
      reputation: 1.1
    },
    probability: 0.1
  },
  {
    id: 'crisis',
    title: 'Экономический кризис',
    description: 'Сложная экономическая ситуация',
    effect: {
      revenue: 0.7,
      reputation: 0.9,
      cost: 1.2
    },
    probability: 0.15
  },
  {
    id: 'competitor_exit',
    title: 'Выход конкурента',
    description: 'Один из конкурентов покидает рынок',
    effect: {
      revenue: 1.3,
      reputation: 1.05
    },
    probability: 0.08
  },
  {
    id: 'new_regulation',
    title: 'Новые правила',
    description: 'Изменения в законодательстве',
    effect: {
      cost: 1.3,
      efficiency: 0.9
    },
    probability: 0.12
  },
  {
    id: 'viral_marketing',
    title: 'Вирусный маркетинг',
    description: 'Ваша реклама стала вирусной',
    effect: {
      revenue: 2.0,
      reputation: 1.5
    },
    probability: 0.05
  }
];

// Награды и достижения
const ACHIEVEMENTS = [
  {
    id: 'first_employee',
    title: 'Первый сотрудник',
    description: 'Нанять первого сотрудника',
    icon: '👥',
    reward: {
      mulacoin: 1,
      experience: 50
    }
  },
  {
    id: 'first_profit',
    title: 'Первая прибыль',
    description: 'Получить первую прибыль',
    icon: '💰',
    reward: {
      mulacoin: 1,
      experience: 75
    }
  },
  {
    id: 'team_complete',
    title: 'Команда собрана',
    description: 'Заполнить все позиции в команде',
    icon: '🏆',
    reward: {
      mulacoin: 1,
      experience: 100
    }
  },
  {
    id: 'business_growth',
    title: 'Рост бизнеса',
    description: 'Достичь роста выручки на 100%',
    icon: '📈',
    reward: {
      mulacoin: 2,
      experience: 150
    }
  },
  {
    id: 'market_leader',
    title: 'Лидер рынка',
    description: 'Стать лидером в своей нише',
    icon: '👑',
    reward: {
      mulacoin: 3,
      experience: 200
    }
  }
];

// Экспорт данных
window.BUSINESS_DATA = {
  config: BUSINESS_CONFIG,
  niches: BUSINESS_NICHES,
  candidates: CANDIDATES_DATABASE,
  positions: POSITIONS,
  decisions: BUSINESS_DECISIONS,
  events: BUSINESS_EVENTS,
  achievements: ACHIEVEMENTS
};
