/* ===== BUSINESS QUEST DATA ===== */

// Данные о нишах бизнеса
const BUSINESS_NICHES = {
  tech: {
    id: 'tech',
    name: 'Технологии',
    description: 'IT-решения, разработка, цифровизация',
    icon: '💻',
    risk: 'Средний',
    potential: 'Высокий',
    startupCost: 200000,
    growthRate: 25,
    marketDemand: 'Высокая',
    competition: 'Высокая',
    advantages: [
      'Высокий потенциал роста',
      'Масштабируемость',
      'Инновационность',
      'Глобальный рынок'
    ],
    challenges: [
      'Быстрое устаревание технологий',
      'Высокая конкуренция',
      'Необходимость постоянных инвестиций',
      'Зависимость от квалификации команды'
    ]
  },
  
  food: {
    id: 'food',
    name: 'Ресторанный бизнес',
    description: 'Кафе, рестораны, доставка еды',
    icon: '🍕',
    risk: 'Низкий',
    potential: 'Средний',
    startupCost: 1500000,
    growthRate: 15,
    marketDemand: 'Стабильная',
    competition: 'Средняя',
    advantages: [
      'Стабильный спрос',
      'Осязаемый продукт',
      'Возможность франшизы',
      'Быстрая окупаемость'
    ],
    challenges: [
      'Высокие операционные расходы',
      'Сезонность',
      'Зависимость от качества персонала',
      'Строгие санитарные требования'
    ]
  },
  
  fashion: {
    id: 'fashion',
    name: 'Мода и стиль',
    description: 'Одежда, аксессуары, стилизация',
    icon: '👗',
    risk: 'Высокий',
    potential: 'Высокий',
    startupCost: 800000,
    growthRate: 30,
    marketDemand: 'Высокая',
    competition: 'Очень высокая',
    advantages: [
      'Высокая маржинальность',
      'Возможность брендинга',
      'Глобальный рынок',
      'Быстрая адаптация к трендам'
    ],
    challenges: [
      'Высокая конкуренция',
      'Быстрая смена трендов',
      'Сезонность',
      'Необходимость больших запасов'
    ]
  },
  
  education: {
    id: 'education',
    name: 'Образование',
    description: 'Курсы, тренинги, онлайн-обучение',
    icon: '📚',
    risk: 'Низкий',
    potential: 'Средний',
    startupCost: 300000,
    growthRate: 20,
    marketDemand: 'Растущая',
    competition: 'Средняя',
    advantages: [
      'Стабильный спрос',
      'Возможность онлайн-масштабирования',
      'Высокая социальная значимость',
      'Разнообразие форматов'
    ],
    challenges: [
      'Необходимость лицензирования',
      'Зависимость от качества контента',
      'Сложность стандартизации',
      'Высокие требования к экспертизе'
    ]
  }
};

// Данные о кандидатах
const CANDIDATES = {
  candidate1: {
    id: 'candidate1',
    name: 'Алексей Петров',
    avatar: '👨‍💼',
    age: 32,
    experience: '8 лет',
    skills: ['Лидерство', 'Организация', 'Стратегическое планирование'],
    strengths: ['Опыт управления командами', 'Аналитическое мышление', 'Коммуникабельность'],
    weaknesses: ['Не всегда гибкий', 'Может быть слишком прямолинейным'],
    salary: 80000,
    motivation: 'Стремление к росту и развитию',
    personality: 'Лидер-организатор',
    compatibility: {
      manager: 95,
      marketer: 60,
      financier: 70,
      specialist: 65
    }
  },
  
  candidate2: {
    id: 'candidate2',
    name: 'Мария Сидорова',
    avatar: '👩‍🎨',
    age: 28,
    experience: '5 лет',
    skills: ['Креативность', 'Аналитика', 'Дизайн'],
    strengths: ['Творческий подход', 'Понимание аудитории', 'Внимание к деталям'],
    weaknesses: ['Может быть перфекционистом', 'Не всегда структурирована'],
    salary: 65000,
    motivation: 'Создание уникального контента',
    personality: 'Творец-аналитик',
    compatibility: {
      manager: 45,
      marketer: 95,
      financier: 40,
      specialist: 75
    }
  },
  
  candidate3: {
    id: 'candidate3',
    name: 'Дмитрий Козлов',
    avatar: '👨‍💻',
    age: 35,
    experience: '10 лет',
    skills: ['Математика', 'Планирование', 'Анализ данных'],
    strengths: ['Точность в расчетах', 'Логическое мышление', 'Опыт в финансах'],
    weaknesses: ['Может быть консервативным', 'Не всегда креативен'],
    salary: 90000,
    motivation: 'Стабильность и порядок',
    personality: 'Аналитик-планировщик',
    compatibility: {
      manager: 55,
      marketer: 35,
      financier: 95,
      specialist: 80
    }
  },
  
  candidate4: {
    id: 'candidate4',
    name: 'Анна Волкова',
    avatar: '👩‍🔬',
    age: 30,
    experience: '6 лет',
    skills: ['Экспертиза', 'Опыт', 'Исследования'],
    strengths: ['Глубокие знания в области', 'Научный подход', 'Внимание к качеству'],
    weaknesses: ['Может быть медленной', 'Не всегда практична'],
    salary: 75000,
    motivation: 'Развитие экспертизы',
    personality: 'Эксперт-исследователь',
    compatibility: {
      manager: 40,
      marketer: 50,
      financier: 60,
      specialist: 95
    }
  },
  
  candidate5: {
    id: 'candidate5',
    name: 'Сергей Морозов',
    avatar: '👨‍💼',
    age: 29,
    experience: '4 года',
    skills: ['Коммуникация', 'Продажи', 'Нетворкинг'],
    strengths: ['Умение убеждать', 'Активность', 'Ориентация на результат'],
    weaknesses: ['Может быть навязчивым', 'Не всегда аналитичен'],
    salary: 60000,
    motivation: 'Высокий доход и признание',
    personality: 'Коммуникатор-продажник',
    compatibility: {
      manager: 70,
      marketer: 85,
      financier: 30,
      specialist: 45
    }
  },
  
  candidate6: {
    id: 'candidate6',
    name: 'Елена Соколова',
    avatar: '👩‍🎨',
    age: 26,
    experience: '3 года',
    skills: ['Дизайн', 'UX/UI', 'Креативность'],
    strengths: ['Современный подход', 'Понимание пользователей', 'Быстрая адаптация'],
    weaknesses: ['Небольшой опыт', 'Может быть нестабильной'],
    salary: 55000,
    motivation: 'Творческая самореализация',
    personality: 'Дизайнер-новатор',
    compatibility: {
      manager: 30,
      marketer: 80,
      financier: 25,
      specialist: 90
    }
  }
};

// Данные о должностях
const POSITIONS = {
  manager: {
    id: 'manager',
    title: 'Менеджер',
    description: 'Руководитель проекта и команды',
    requirements: ['Лидерство', 'Организация', 'Коммуникация'],
    responsibilities: [
      'Управление командой',
      'Планирование и координация',
      'Взаимодействие с клиентами',
      'Контроль качества'
    ],
    salary: 80000,
    importance: 'Критическая',
    impact: {
      revenue: 20,
      growth: 25,
      reputation: 30,
      teamEfficiency: 40
    }
  },
  
  marketer: {
    id: 'marketer',
    title: 'Маркетолог',
    description: 'Специалист по продвижению и рекламе',
    requirements: ['Креативность', 'Аналитика', 'Коммуникация'],
    responsibilities: [
      'Разработка маркетинговых стратегий',
      'Создание рекламных кампаний',
      'Анализ рынка и конкурентов',
      'Управление брендом'
    ],
    salary: 65000,
    importance: 'Высокая',
    impact: {
      revenue: 35,
      growth: 30,
      reputation: 40,
      teamEfficiency: 15
    }
  },
  
  financier: {
    id: 'financier',
    title: 'Финансист',
    description: 'Специалист по финансовому планированию',
    requirements: ['Математика', 'Планирование', 'Аналитика'],
    responsibilities: [
      'Финансовое планирование',
      'Бюджетирование',
      'Анализ эффективности',
      'Управление рисками'
    ],
    salary: 70000,
    importance: 'Высокая',
    impact: {
      revenue: 25,
      growth: 20,
      reputation: 15,
      teamEfficiency: 25
    }
  },
  
  specialist: {
    id: 'specialist',
    title: 'Специалист',
    description: 'Эксперт в основной области бизнеса',
    requirements: ['Экспертиза', 'Опыт', 'Профессионализм'],
    responsibilities: [
      'Выполнение основных задач',
      'Контроль качества',
      'Обучение новичков',
      'Развитие экспертизы'
    ],
    salary: 60000,
    importance: 'Средняя',
    impact: {
      revenue: 20,
      growth: 25,
      reputation: 15,
      teamEfficiency: 20
    }
  }
};

// Данные о бизнес-решениях
const BUSINESS_DECISIONS = {
  marketing: {
    id: 'marketing',
    title: 'Маркетинговая кампания',
    description: 'Инвестировать в рекламу для привлечения клиентов',
    icon: '📢',
    category: 'Маркетинг',
    cost: 50000,
    duration: '1 месяц',
    risk: 'Низкий',
    effect: {
      revenue: 100000,
      growth: 15,
      reputation: 10,
      teamEfficiency: 5
    },
    requirements: {
      teamSize: 2,
      reputation: 0
    },
    successRate: 85,
    alternatives: [
      'Социальные сети',
      'Контекстная реклама',
      'Влиятельные лица'
    ]
  },
  
  training: {
    id: 'training',
    title: 'Обучение команды',
    description: 'Повысить квалификацию сотрудников',
    icon: '🎓',
    category: 'Развитие',
    cost: 30000,
    duration: '2 недели',
    risk: 'Низкий',
    effect: {
      revenue: 50000,
      growth: 15,
      reputation: 5,
      teamEfficiency: 25
    },
    requirements: {
      teamSize: 1,
      reputation: 0
    },
    successRate: 90,
    alternatives: [
      'Онлайн-курсы',
      'Семинары',
      'Коучинг'
    ]
  },
  
  equipment: {
    id: 'equipment',
    title: 'Новое оборудование',
    description: 'Модернизировать производство',
    icon: '⚙️',
    category: 'Инфраструктура',
    cost: 100000,
    duration: '3 месяца',
    risk: 'Средний',
    effect: {
      revenue: 150000,
      growth: 25,
      reputation: 10,
      teamEfficiency: 20
    },
    requirements: {
      teamSize: 3,
      reputation: 10
    },
    successRate: 75,
    alternatives: [
      'Аренда оборудования',
      'Постепенная модернизация',
      'Партнерство с поставщиками'
    ]
  },
  
  partnership: {
    id: 'partnership',
    title: 'Партнерство',
    description: 'Найти стратегических партнеров',
    icon: '🤝',
    category: 'Развитие',
    cost: 20000,
    duration: '1 месяц',
    risk: 'Средний',
    effect: {
      revenue: 80000,
      reputation: 20,
      growth: 10,
      teamEfficiency: 10
    },
    requirements: {
      teamSize: 2,
      reputation: 15
    },
    successRate: 70,
    alternatives: [
      'Франшиза',
      'Лицензирование',
      'Совместные проекты'
    ]
  },
  
  expansion: {
    id: 'expansion',
    title: 'Расширение бизнеса',
    description: 'Открыть новое направление или филиал',
    icon: '🚀',
    category: 'Рост',
    cost: 200000,
    duration: '6 месяцев',
    risk: 'Высокий',
    effect: {
      revenue: 300000,
      growth: 50,
      reputation: 25,
      teamEfficiency: 15
    },
    requirements: {
      teamSize: 4,
      reputation: 25
    },
    successRate: 60,
    alternatives: [
      'Франшиза',
      'Партнерство',
      'Постепенное расширение'
    ]
  },
  
  innovation: {
    id: 'innovation',
    title: 'Инновационный проект',
    description: 'Разработать новый продукт или услугу',
    icon: '💡',
    category: 'Инновации',
    cost: 150000,
    duration: '4 месяца',
    risk: 'Высокий',
    effect: {
      revenue: 250000,
      growth: 40,
      reputation: 30,
      teamEfficiency: 20
    },
    requirements: {
      teamSize: 3,
      reputation: 20
    },
    successRate: 65,
    alternatives: [
      'Адаптация существующих решений',
      'Партнерство с инноваторами',
      'Постепенная разработка'
    ]
  }
};

// Данные о наградах
const REWARDS = {
  completion: {
    mulacoin: 3,
    xp: 200,
    achievement: 'Предприниматель',
    description: 'За успешное создание и развитие бизнеса'
  },
  
  milestones: {
    firstHire: {
      mulacoin: 1,
      xp: 50,
      achievement: 'Первая команда',
      description: 'За найм первого сотрудника'
    },
    
    firstRevenue: {
      mulacoin: 1,
      xp: 75,
      achievement: 'Первые деньги',
      description: 'За получение первой прибыли'
    },
    
    teamComplete: {
      mulacoin: 1,
      xp: 100,
      achievement: 'Команда мечты',
      description: 'За полный набор команды'
    },
    
    businessGrowth: {
      mulacoin: 2,
      xp: 150,
      achievement: 'Растущий бизнес',
      description: 'За достижение значительного роста'
    }
  }
};

// Данные о случайных событиях
const RANDOM_EVENTS = {
  positive: [
    {
      id: 'market_boom',
      title: 'Бум на рынке',
      description: 'Неожиданный рост спроса на ваши услуги!',
      effect: {
        revenue: 100000,
        reputation: 10,
        growth: 15
      },
      probability: 0.15
    },
    {
      id: 'lucky_partnership',
      title: 'Удачное партнерство',
      description: 'Крупная компания предложила сотрудничество!',
      effect: {
        revenue: 150000,
        reputation: 20,
        growth: 25
      },
      probability: 0.10
    },
    {
      id: 'media_attention',
      title: 'Внимание СМИ',
      description: 'Ваш бизнес попал в поле зрения журналистов!',
      effect: {
        revenue: 50000,
        reputation: 30,
        growth: 10
      },
      probability: 0.20
    }
  ],
  
  negative: [
    {
      id: 'market_crisis',
      title: 'Кризис на рынке',
      description: 'Экономический спад повлиял на спрос!',
      effect: {
        revenue: -80000,
        reputation: -5,
        growth: -10
      },
      probability: 0.20
    },
    {
      id: 'competitor_attack',
      title: 'Атака конкурентов',
      description: 'Конкуренты снизили цены!',
      effect: {
        revenue: -60000,
        reputation: -10,
        growth: -15
      },
      probability: 0.15
    },
    {
      id: 'technical_issues',
      title: 'Технические проблемы',
      description: 'Поломка оборудования привела к простоям!',
      effect: {
        revenue: -40000,
        reputation: -5,
        growth: -5
      },
      probability: 0.25
    }
  ]
};

// Экспорт данных
window.BUSINESS_QUEST_DATA = {
  BUSINESS_NICHES,
  CANDIDATES,
  POSITIONS,
  BUSINESS_DECISIONS,
  REWARDS,
  RANDOM_EVENTS
};
