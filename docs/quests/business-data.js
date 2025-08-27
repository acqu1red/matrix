/* ===== BUSINESS QUEST DATA - OPTIMIZED FOR MINIAPPS ===== */

// Конфигурация квеста
const BUSINESS_QUEST_CONFIG = {
  name: 'Твой первый бизнес',
  description: 'Создайте успешный бизнес с нуля и станьте миллионером!',
  stages: 4,
  rewards: {
    mulacoins: 3,
    xp: 200,
    achievement: 'Предприниматель'
  },
  requirements: {
    minLevel: 1,
    timeEstimate: '15-20 минут'
  }
};

// Данные о нишах бизнеса
const BUSINESS_NICHES = [
  {
    id: 'tech',
    name: 'Технологии',
    description: 'IT-решения, разработка, цифровизация',
    icon: '💻',
    risk: 'Средний',
    potential: 'Высокий',
    startupCost: 50000,
    growthRate: 0.15,
    marketSize: 'Большой'
  },
  {
    id: 'food',
    name: 'Ресторанный бизнес',
    description: 'Кафе, рестораны, доставка еды',
    icon: '🍕',
    risk: 'Низкий',
    potential: 'Средний',
    startupCost: 30000,
    growthRate: 0.08,
    marketSize: 'Средний'
  },
  {
    id: 'fashion',
    name: 'Мода и стиль',
    description: 'Одежда, аксессуары, стилизация',
    icon: '👗',
    risk: 'Высокий',
    potential: 'Высокий',
    startupCost: 40000,
    growthRate: 0.12,
    marketSize: 'Большой'
  },
  {
    id: 'education',
    name: 'Образование',
    description: 'Курсы, тренинги, онлайн-обучение',
    icon: '📚',
    risk: 'Низкий',
    potential: 'Средний',
    startupCost: 25000,
    growthRate: 0.10,
    marketSize: 'Средний'
  }
];

// Данные о кандидатах
const CANDIDATES_DATA = [
  {
    id: 'candidate1',
    name: 'Алексей Петров',
    avatar: '👨‍💼',
    skills: ['Лидерство', 'Организация', 'Стратегическое планирование'],
    experience: '8 лет',
    salary: 80000,
    efficiency: 85,
    creativity: 70,
    leadership: 95
  },
  {
    id: 'candidate2',
    name: 'Мария Сидорова',
    avatar: '👩‍🎨',
    skills: ['Креативность', 'Аналитика', 'Маркетинг'],
    experience: '6 лет',
    salary: 70000,
    efficiency: 80,
    creativity: 95,
    leadership: 65
  },
  {
    id: 'candidate3',
    name: 'Дмитрий Козлов',
    avatar: '👨‍💻',
    skills: ['Математика', 'Планирование', 'Финансы'],
    experience: '7 лет',
    salary: 75000,
    efficiency: 90,
    creativity: 60,
    leadership: 70
  },
  {
    id: 'candidate4',
    name: 'Анна Волкова',
    avatar: '👩‍🔬',
    skills: ['Экспертиза', 'Опыт', 'Исследования'],
    experience: '10 лет',
    salary: 90000,
    efficiency: 95,
    creativity: 75,
    leadership: 80
  }
];

// Данные о должностях
const POSITIONS_DATA = [
  {
    id: 'manager',
    title: 'Менеджер',
    description: 'Руководитель проекта и команды',
    requirements: ['Лидерство', 'Организация'],
    salary: 80000,
    importance: 'Критическая',
    skills: ['Управление', 'Коммуникация', 'Планирование']
  },
  {
    id: 'marketer',
    title: 'Маркетолог',
    description: 'Специалист по продвижению и рекламе',
    requirements: ['Креативность', 'Аналитика'],
    salary: 70000,
    importance: 'Высокая',
    skills: ['Маркетинг', 'Анализ', 'Креативность']
  },
  {
    id: 'financier',
    title: 'Финансист',
    description: 'Специалист по финансам и планированию',
    requirements: ['Математика', 'Планирование'],
    salary: 75000,
    importance: 'Высокая',
    skills: ['Финансы', 'Анализ', 'Планирование']
  },
  {
    id: 'specialist',
    title: 'Специалист',
    description: 'Эксперт в выбранной области',
    requirements: ['Экспертиза', 'Опыт'],
    salary: 90000,
    importance: 'Средняя',
    skills: ['Экспертиза', 'Опыт', 'Анализ']
  }
];

// Данные о решениях
const DECISIONS_DATA = [
  {
    id: 'decision1',
    title: 'Инвестировать в маркетинг',
    description: 'Увеличить рекламный бюджет для привлечения новых клиентов',
    impact: {
      revenue: '+15%',
      risk: 'Средний',
      cost: 20000,
      timeToEffect: '1-2 месяца'
    },
    category: 'Маркетинг',
    successRate: 0.75
  },
  {
    id: 'decision2',
    title: 'Расширить команду',
    description: 'Нанять дополнительных специалистов для роста',
    impact: {
      revenue: '+25%',
      risk: 'Высокий',
      cost: 150000,
      timeToEffect: '3-6 месяцев'
    },
    category: 'Персонал',
    successRate: 0.60
  },
  {
    id: 'decision3',
    title: 'Оптимизировать процессы',
    description: 'Улучшить внутренние бизнес-процессы',
    impact: {
      revenue: '+10%',
      risk: 'Низкий',
      cost: 10000,
      timeToEffect: '1 месяц'
    },
    category: 'Операции',
    successRate: 0.85
  },
  {
    id: 'decision4',
    title: 'Развивать партнерства',
    description: 'Найти стратегических партнеров',
    impact: {
      revenue: '+20%',
      risk: 'Средний',
      cost: 50000,
      timeToEffect: '2-4 месяца'
    },
    category: 'Партнерства',
    successRate: 0.70
  }
];

// Начальные бизнес-статистики
const INITIAL_BUSINESS_STATS = {
  revenue: 0,
  growth: 0,
  teamSize: 0,
  reputation: 0,
  capital: 100000,
  expenses: 0,
  profit: 0
};

// Цели для завершения квеста
const QUEST_OBJECTIVES = {
  stage1: {
    name: 'Выбор ниши',
    description: 'Выберите направление для вашего бизнеса',
    requirements: ['Выбрать одну из 4 ниш'],
    rewards: { xp: 50 }
  },
  stage2: {
    name: 'Подбор команды',
    description: 'Соберите команду из 4 специалистов',
    requirements: ['Заполнить все 4 должности'],
    rewards: { xp: 50 }
  },
  stage3: {
    name: 'Управление бизнесом',
    description: 'Принимайте решения и развивайте бизнес',
    requirements: ['Достичь дохода 100,000 ₽'],
    rewards: { xp: 50 }
  },
  stage4: {
    name: 'Результаты',
    description: 'Подведите итоги и получите награды',
    requirements: ['Завершить все этапы'],
    rewards: { xp: 50, mulacoins: 3, achievement: 'Предприниматель' }
  }
};

// Система достижений
const ACHIEVEMENTS = [
  {
    id: 'first-business',
    name: 'Первый бизнес',
    description: 'Завершите квест "Твой первый бизнес"',
    icon: '🏢',
    rarity: 'common'
  },
  {
    id: 'team-builder',
    name: 'Строитель команды',
    description: 'Соберите полную команду из 4 специалистов',
    icon: '👥',
    rarity: 'uncommon'
  },
  {
    id: 'profit-master',
    name: 'Мастер прибыли',
    description: 'Достигните дохода 100,000 ₽',
    icon: '💰',
    rarity: 'rare'
  },
  {
    id: 'entrepreneur',
    name: 'Предприниматель',
    description: 'Успешно завершите весь квест',
    icon: '🏆',
    rarity: 'epic'
  }
];

// Советы для игроков
const BUSINESS_TIPS = {
  stage1: [
    'Выбирайте нишу исходя из соотношения прибыльности и сложности',
    'Обращайте внимание на стартовые затраты - они влияют на ваш капитал',
    'Некоторые ниши требуют определенных специалистов для успеха'
  ],
  stage2: [
    'Нанимайте сотрудников с высокими показателями эффективности',
    'Баланс между зарплатой и навыками - ключ к успешному найму',
    'Используйте drag & drop для найма сотрудников на конкретные позиции'
  ],
  stage3: [
    'Убедитесь, что у вас есть все ключевые роли для вашей ниши',
    'Следите за соотношением доходов и расходов',
    'Инвестируйте в команду для долгосрочного успеха'
  ],
  stage4: [
    'Оптимизируйте команду для достижения максимальной прибыльности',
    'Рассмотрите возможность найма дополнительных специалистов',
    'Готовьтесь к масштабированию бизнеса'
  ]
};

// Экспорт данных
window.BUSINESS_QUEST_DATA = {
  config: BUSINESS_QUEST_CONFIG,
  niches: BUSINESS_NICHES,
  candidates: CANDIDATES_DATA,
  positions: POSITIONS_DATA,
  decisions: DECISIONS_DATA,
  initialStats: INITIAL_BUSINESS_STATS,
  objectives: QUEST_OBJECTIVES,
  achievements: ACHIEVEMENTS,
  tips: BUSINESS_TIPS
};

console.log('Business Quest data loaded successfully!');
