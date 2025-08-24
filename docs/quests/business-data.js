/* ===== BUSINESS QUEST DATA ===== */

// Конфигурация квеста
const BUSINESS_CONFIG = {
  stages: 4,
  maxEmployees: 10,
  startingCapital: 50000,
  rewards: {
    mulacoin: 50,
    experience: 200
  },
  salaryRanges: {
    marketing: [3000, 8000],
    sales: [2500, 7000],
    tech: [4000, 10000],
    finance: [3500, 8500],
    operations: [3000, 7500],
    hr: [2800, 6500],
    legal: [4500, 12000],
    creative: [3200, 7500],
    analytics: [3800, 9000]
  }
};

// Ниши бизнеса
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
    id: 'dropshipping',
    name: 'Дропшиппинг',
    category: 'E-commerce',
    icon: '📦',
    description: 'Продажа товаров без складских запасов через поставщиков',
    metrics: {
      startupCost: 10000,
      monthlyRevenue: 8000,
      competition: 'Очень высокая',
      growth: '+120%',
      difficulty: 'Легко'
    },
    requiredRoles: ['marketing', 'sales'],
    revenueMultiplier: 1.2,
    riskFactor: 0.9
  },
  {
    id: 'consulting',
    name: 'Консалтинговое агентство',
    category: 'Услуги',
    icon: '💼',
    description: 'Предоставление экспертных консультаций для бизнеса',
    metrics: {
      startupCost: 15000,
      monthlyRevenue: 14000,
      competition: 'Средняя',
      growth: '+95%',
      difficulty: 'Средне'
    },
    requiredRoles: ['sales', 'marketing', 'analytics'],
    revenueMultiplier: 1.4,
    riskFactor: 0.7
  },
  {
    id: 'logistics',
    name: 'Логистическая компания',
    category: 'Логистика',
    icon: '🚛',
    description: 'Услуги доставки и складирования для других компаний',
    metrics: {
      startupCost: 40000,
      monthlyRevenue: 16000,
      competition: 'Средняя',
      growth: '+75%',
      difficulty: 'Сложно'
    },
    requiredRoles: ['operations', 'finance', 'tech'],
    revenueMultiplier: 1.1,
    riskFactor: 0.8
  },
  {
    id: 'education',
    name: 'Онлайн-школа',
    category: 'Образование',
    icon: '🎓',
    description: 'Платформа для онлайн-обучения с курсами и вебинарами',
    metrics: {
      startupCost: 18000,
      monthlyRevenue: 11000,
      competition: 'Высокая',
      growth: '+140%',
      difficulty: 'Средне'
    },
    requiredRoles: ['marketing', 'tech', 'creative'],
    revenueMultiplier: 1.5,
    riskFactor: 0.7
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

// База данных кандидатов (50+ человек)
const CANDIDATES_DATABASE = [
  // Маркетинг специалисты
  {
    id: 1,
    name: 'Анна Петрова',
    role: 'marketing',
    avatar: '👩‍💼',
    experience: 5,
    salary: 6000,
    skills: ['SMM', 'Контент', 'Аналитика', 'SEO'],
    stats: { efficiency: 85, creativity: 90, leadership: 70 },
    personality: 'Креативная, амбициозная, коммуникабельная',
    background: 'Ex-маркетолог в крупном e-commerce, запускала кампании с ROI 300%'
  },
  {
    id: 2,
    name: 'Дмитрий Козлов',
    role: 'marketing',
    avatar: '👨‍💻',
    experience: 3,
    salary: 4500,
    skills: ['PPC', 'Facebook Ads', 'Google Ads', 'Аналитика'],
    stats: { efficiency: 80, creativity: 75, leadership: 60 },
    personality: 'Аналитический склад ума, перфекционист',
    background: 'Специалист по контекстной рекламе, средний ROAS 250%'
  },
  {
    id: 3,
    name: 'Мария Сидорова',
    role: 'marketing',
    avatar: '👩‍🎨',
    experience: 4,
    salary: 5200,
    skills: ['Брендинг', 'PR', 'Контент', 'Инфлюенсеры'],
    stats: { efficiency: 75, creativity: 95, leadership: 80 },
    personality: 'Творческая личность с деловой хваткой',
    background: 'Бренд-менеджер, увеличила узнаваемость бренда на 400%'
  },
  
  // Продажи
  {
    id: 4,
    name: 'Алексей Иванов',
    role: 'sales',
    avatar: '👨‍💼',
    experience: 7,
    salary: 6500,
    skills: ['B2B продажи', 'CRM', 'Переговоры', 'Лидогенерация'],
    stats: { efficiency: 90, creativity: 60, leadership: 85 },
    personality: 'Харизматичный, настойчивый, результативный',
    background: 'Топ-менеджер по продажам, конверсия лидов 45%'
  },
  {
    id: 5,
    name: 'Елена Морозова',
    role: 'sales',
    avatar: '👩‍💼',
    experience: 4,
    salary: 4800,
    skills: ['B2C продажи', 'Клиентский сервис', 'Телефония', 'Email'],
    stats: { efficiency: 85, creativity: 70, leadership: 75 },
    personality: 'Эмпатичная, терпеливая, клиентоориентированная',
    background: 'Менеджер по работе с клиентами, NPS 9.2/10'
  },
  {
    id: 6,
    name: 'Сергей Волков',
    role: 'sales',
    avatar: '👨‍🏢',
    experience: 6,
    salary: 5900,
    skills: ['Корпоративные продажи', 'Презентации', 'Договоры'],
    stats: { efficiency: 88, creativity: 65, leadership: 80 },
    personality: 'Профессионал высокого класса, стратег',
    background: 'Региональный менеджер, средний чек сделки $50K'
  },
  
  // IT/Техника
  {
    id: 7,
    name: 'Игорь Петров',
    role: 'tech',
    avatar: '👨‍💻',
    experience: 8,
    salary: 9000,
    skills: ['Full-stack', 'React', 'Node.js', 'DevOps'],
    stats: { efficiency: 95, creativity: 80, leadership: 70 },
    personality: 'Технический гуру, любит сложные задачи',
    background: 'Senior разработчик, создал 5 успешных проектов'
  },
  {
    id: 8,
    name: 'Ольга Белова',
    role: 'tech',
    avatar: '👩‍💻',
    experience: 5,
    salary: 7200,
    skills: ['Frontend', 'UI/UX', 'Vue.js', 'Design'],
    stats: { efficiency: 85, creativity: 90, leadership: 65 },
    personality: 'Креативный технарь с чувством прекрасного',
    background: 'Frontend-разработчик с дизайнерскими навыками'
  },
  {
    id: 9,
    name: 'Максим Орлов',
    role: 'tech',
    avatar: '👨‍🔧',
    experience: 6,
    salary: 8100,
    skills: ['Backend', 'Python', 'PostgreSQL', 'API'],
    stats: { efficiency: 90, creativity: 70, leadership: 75 },
    personality: 'Надежный, системный, любит оптимизацию',
    background: 'Backend-разработчик, оптимизировал нагрузку на 300%'
  },
  
  // Финансы
  {
    id: 10,
    name: 'Татьяна Смирнова',
    role: 'finance',
    avatar: '👩‍💼',
    experience: 9,
    salary: 7800,
    skills: ['Бюджетирование', 'Налоги', 'Отчетность', 'Инвестиции'],
    stats: { efficiency: 95, creativity: 60, leadership: 80 },
    personality: 'Дисциплинированная, внимательная к деталям',
    background: 'CFO в стартапе, привлекла $2M инвестиций'
  },
  {
    id: 11,
    name: 'Андрей Лебедев',
    role: 'finance',
    avatar: '👨‍💼',
    experience: 4,
    salary: 5500,
    skills: ['Бухучет', '1С', 'Excel', 'Аналитика'],
    stats: { efficiency: 80, creativity: 55, leadership: 60 },
    personality: 'Аккуратный, ответственный, пунктуальный',
    background: 'Главный бухгалтер, всегда сдает отчеты вовремя'
  },
  {
    id: 12,
    name: 'Виктория Новикова',
    role: 'finance',
    avatar: '👩‍💻',
    experience: 6,
    salary: 6800,
    skills: ['Финансовый анализ', 'Планирование', 'Риски'],
    stats: { efficiency: 88, creativity: 70, leadership: 75 },
    personality: 'Стратегический мыслитель, прогнозист',
    background: 'Финансовый аналитик, точность прогнозов 92%'
  },
  
  // Операции
  {
    id: 13,
    name: 'Роман Кузнецов',
    role: 'operations',
    avatar: '👨‍🏭',
    experience: 7,
    salary: 6200,
    skills: ['Логистика', 'Процессы', 'Качество', 'Автоматизация'],
    stats: { efficiency: 92, creativity: 65, leadership: 85 },
    personality: 'Организованный, системный подход к работе',
    background: 'Операционный директор, сократил расходы на 25%'
  },
  {
    id: 14,
    name: 'Светлана Попова',
    role: 'operations',
    avatar: '👩‍🏭',
    experience: 5,
    salary: 5400,
    skills: ['Управление проектами', 'Agile', 'Координация'],
    stats: { efficiency: 85, creativity: 75, leadership: 80 },
    personality: 'Многозадачная, коммуникабельная',
    background: 'Project Manager, успешно запустила 12 проектов'
  },
  {
    id: 15,
    name: 'Павел Михайлов',
    role: 'operations',
    avatar: '👨‍🔧',
    experience: 8,
    salary: 6900,
    skills: ['Производство', 'Lean', 'Six Sigma', 'Оптимизация'],
    stats: { efficiency: 95, creativity: 70, leadership: 75 },
    personality: 'Перфекционист, любит улучшать процессы',
    background: 'Эксперт по производственным процессам'
  },
  
  // HR
  {
    id: 16,
    name: 'Наталья Федорова',
    role: 'hr',
    avatar: '👩‍💼',
    experience: 6,
    salary: 5200,
    skills: ['Рекрутинг', 'Мотивация', 'Обучение', 'Культура'],
    stats: { efficiency: 80, creativity: 85, leadership: 90 },
    personality: 'Эмпатичная, понимает людей, развивает команды',
    background: 'HR-директор, снизила текучку кадров до 8%'
  },
  {
    id: 17,
    name: 'Александр Соколов',
    role: 'hr',
    avatar: '👨‍💼',
    experience: 4,
    salary: 4200,
    skills: ['Подбор персонала', 'Интервью', 'Адаптация'],
    stats: { efficiency: 75, creativity: 70, leadership: 70 },
    personality: 'Внимательный к деталям, хороший психолог',
    background: 'Рекрутер, время закрытия вакансий 2 недели'
  },
  
  // Юристы
  {
    id: 18,
    name: 'Екатерина Власова',
    role: 'legal',
    avatar: '👩‍⚖️',
    experience: 10,
    salary: 9500,
    skills: ['Корпоративное право', 'Договоры', 'Интеллектуальная собственность'],
    stats: { efficiency: 90, creativity: 75, leadership: 80 },
    personality: 'Принципиальная, защищает интересы компании',
    background: 'Корпоративный юрист, выиграла 95% судебных дел'
  },
  {
    id: 19,
    name: 'Михаил Зайцев',
    role: 'legal',
    avatar: '👨‍⚖️',
    experience: 7,
    salary: 7800,
    skills: ['Трудовое право', 'Налоговое право', 'Лицензирование'],
    stats: { efficiency: 85, creativity: 65, leadership: 70 },
    personality: 'Скрупулезный, знает все тонкости законодательства',
    background: 'Юрист-консультант по налоговым вопросам'
  },
  
  // Креативные специалисты
  {
    id: 20,
    name: 'Дарья Романова',
    role: 'creative',
    avatar: '👩‍🎨',
    experience: 5,
    salary: 5800,
    skills: ['Графический дизайн', 'Брендинг', 'Иллюстрация', 'Фотография'],
    stats: { efficiency: 80, creativity: 95, leadership: 65 },
    personality: 'Творческая натура с коммерческой жилкой',
    background: 'Арт-директор, создала 3 успешных бренда'
  },
  {
    id: 21,
    name: 'Артем Волошин',
    role: 'creative',
    avatar: '👨‍🎨',
    experience: 4,
    salary: 5100,
    skills: ['Видеопродакшн', 'Монтаж', 'Motion design', '3D'],
    stats: { efficiency: 75, creativity: 90, leadership: 60 },
    personality: 'Визуальный перфекционист, следит за трендами',
    background: 'Видеопродюсер, ролики набирают 1M+ просмотров'
  },
  {
    id: 22,
    name: 'Кристина Белая',
    role: 'creative',
    avatar: '👩‍💻',
    experience: 3,
    salary: 4600,
    skills: ['UX/UI дизайн', 'Прототипирование', 'Исследования'],
    stats: { efficiency: 85, creativity: 85, leadership: 70 },
    personality: 'Пользовательский опыт - ее страсть',
    background: 'UX-дизайнер, повысила конверсию сайтов на 40%'
  },
  
  // Аналитики
  {
    id: 23,
    name: 'Владимир Петренко',
    role: 'analytics',
    avatar: '👨‍💻',
    experience: 6,
    salary: 7400,
    skills: ['Data Science', 'Python', 'SQL', 'Machine Learning'],
    stats: { efficiency: 90, creativity: 80, leadership: 70 },
    personality: 'Любит находить инсайты в данных',
    background: 'Data Scientist, создал модели с точностью 95%'
  },
  {
    id: 24,
    name: 'Юлия Краснова',
    role: 'analytics',
    avatar: '👩‍💻',
    experience: 4,
    salary: 6200,
    skills: ['Google Analytics', 'Tableau', 'A/B тестирование'],
    stats: { efficiency: 85, creativity: 75, leadership: 65 },
    personality: 'Превращает данные в понятные инсайты',
    background: 'Веб-аналитик, оптимизировала воронку продаж'
  },
  {
    id: 25,
    name: 'Денис Морозов',
    role: 'analytics',
    avatar: '👨‍📊',
    experience: 7,
    salary: 8100,
    skills: ['Бизнес-аналитика', 'Power BI', 'Forecasting'],
    stats: { efficiency: 92, creativity: 70, leadership: 80 },
    personality: 'Стратегический мыслитель, видит большую картину',
    background: 'Бизнес-аналитик, прогнозы сбываются в 88% случаев'
  },

  // Дополнительные кандидаты для разнообразия
  {
    id: 26,
    name: 'Алина Васильева',
    role: 'marketing',
    avatar: '👩‍💼',
    experience: 2,
    salary: 3800,
    skills: ['Instagram', 'TikTok', 'Контент', 'Тренды'],
    stats: { efficiency: 70, creativity: 88, leadership: 55 },
    personality: 'Молодая, энергичная, понимает Gen Z',
    background: 'SMM-специалист, аудитория выросла в 10 раз'
  },
  {
    id: 27,
    name: 'Константин Белов',
    role: 'sales',
    avatar: '👨‍💼',
    experience: 3,
    salary: 4100,
    skills: ['Холодные звонки', 'Скрипты', 'CRM', 'Воронки'],
    stats: { efficiency: 78, creativity: 60, leadership: 65 },
    personality: 'Настойчивый, не боится отказов',
    background: 'Sales Development Representative, конверсия 15%'
  },
  {
    id: 28,
    name: 'Ирина Золотова',
    role: 'tech',
    avatar: '👩‍💻',
    experience: 3,
    salary: 5800,
    skills: ['QA', 'Тестирование', 'Автоматизация', 'Selenium'],
    stats: { efficiency: 88, creativity: 65, leadership: 60 },
    personality: 'Внимательная к деталям, находит все баги',
    background: 'QA Engineer, сократила количество багов на 70%'
  },
  {
    id: 29,
    name: 'Олег Черных',
    role: 'finance',
    avatar: '👨‍💼',
    experience: 8,
    salary: 7200,
    skills: ['Управленческий учет', 'МСФО', 'Консолидация'],
    stats: { efficiency: 90, creativity: 65, leadership: 75 },
    personality: 'Системный подход, стратегическое мышление',
    background: 'Финансовый контролер международной компании'
  },
  {
    id: 30,
    name: 'Марина Синева',
    role: 'operations',
    avatar: '👩‍🏭',
    experience: 4,
    salary: 4900,
    skills: ['Складская логистика', 'WMS', 'Инвентаризация'],
    stats: { efficiency: 85, creativity: 60, leadership: 70 },
    personality: 'Организованная, любит порядок во всем',
    background: 'Менеджер по логистике, точность поставок 99.5%'
  },

  // Еще 20 кандидатов для достижения 50+
  {
    id: 31,
    name: 'Григорий Сухов',
    role: 'marketing',
    avatar: '👨‍💼',
    experience: 6,
    salary: 6800,
    skills: ['Performance маркетинг', 'Attribution', 'Cohorts'],
    stats: { efficiency: 88, creativity: 75, leadership: 70 },
    personality: 'Data-driven маркетолог, любит эксперименты',
    background: 'Growth-хакер, увеличил LTV клиентов на 200%'
  },
  {
    id: 32,
    name: 'Вера Зеленская',
    role: 'sales',
    avatar: '👩‍💼',
    experience: 5,
    salary: 5600,
    skills: ['Account management', 'Upselling', 'Customer Success'],
    stats: { efficiency: 85, creativity: 70, leadership: 80 },
    personality: 'Клиентоориентированная, умеет развивать отношения',
    background: 'Key Account Manager, retention rate 95%'
  },
  {
    id: 33,
    name: 'Станислав Рыжов',
    role: 'tech',
    avatar: '👨‍💻',
    experience: 9,
    salary: 10200,
    skills: ['System Architecture', 'Microservices', 'Kubernetes'],
    stats: { efficiency: 95, creativity: 80, leadership: 85 },
    personality: 'Технический лидер, может масштабировать команды',
    background: 'Solution Architect, создал архитектуру для 10M пользователей'
  },
  {
    id: 34,
    name: 'Лидия Фролова',
    role: 'finance',
    avatar: '👩‍💼',
    experience: 5,
    salary: 6100,
    skills: ['Корпоративные финансы', 'M&A', 'Due Diligence'],
    stats: { efficiency: 82, creativity: 75, leadership: 70 },
    personality: 'Аналитический склад ума, стратег',
    background: 'M&A аналитик, провела сделки на $50M'
  },
  {
    id: 35,
    name: 'Артур Песков',
    role: 'operations',
    avatar: '👨‍🔧',
    experience: 6,
    salary: 6400,
    skills: ['Supply Chain', 'Procurement', 'Vendor Management'],
    stats: { efficiency: 90, creativity: 65, leadership: 75 },
    personality: 'Умеет строить долгосрочные партнерства',
    background: 'Supply Chain Manager, сократил закупочную стоимость на 30%'
  },
  {
    id: 36,
    name: 'Анастасия Рудная',
    role: 'hr',
    avatar: '👩‍💼',
    experience: 7,
    salary: 5900,
    skills: ['Organizational Development', 'Change Management'],
    stats: { efficiency: 85, creativity: 80, leadership: 90 },
    personality: 'Эксперт по организационным изменениям',
    background: 'HR Business Partner, успешно провела реорганизацию'
  },
  {
    id: 37,
    name: 'Тимур Абдуллин',
    role: 'legal',
    avatar: '👨‍⚖️',
    experience: 5,
    salary: 6800,
    skills: ['IT право', 'GDPR', 'Персональные данные'],
    stats: { efficiency: 80, creativity: 70, leadership: 65 },
    personality: 'Специалист по IT-законодательству',
    background: 'IT-юрист, помог 20+ компаниям с GDPR compliance'
  },
  {
    id: 38,
    name: 'София Медведева',
    role: 'creative',
    avatar: '👩‍🎨',
    experience: 6,
    salary: 6200,
    skills: ['Creative Strategy', 'Campaign Development'],
    stats: { efficiency: 85, creativity: 92, leadership: 80 },
    personality: 'Креативный стратег с коммерческим мышлением',
    background: 'Creative Director, кампании получили 5 международных наград'
  },
  {
    id: 39,
    name: 'Роберт Исаев',
    role: 'analytics',
    avatar: '👨‍💻',
    experience: 8,
    salary: 8600,
    skills: ['Product Analytics', 'Behavioral Analysis', 'Retention'],
    stats: { efficiency: 92, creativity: 78, leadership: 75 },
    personality: 'Эксперт по продуктовой аналитике',
    background: 'Head of Analytics, повысил retention на 45%'
  },
  {
    id: 40,
    name: 'Елизавета Царева',
    role: 'marketing',
    avatar: '👩‍💼',
    experience: 4,
    salary: 5400,
    skills: ['Email маркетинг', 'Automation', 'Lifecycle'],
    stats: { efficiency: 82, creativity: 80, leadership: 65 },
    personality: 'Специалист по автоматизации маркетинга',
    background: 'Email Marketing Manager, open rate 35%+'
  },

  // Последние 10 кандидатов
  {
    id: 41,
    name: 'Никита Громов',
    role: 'sales',
    avatar: '👨‍💼',
    experience: 2,
    salary: 3600,
    skills: ['Inside Sales', 'Lead Qualification', 'Prospecting'],
    stats: { efficiency: 75, creativity: 65, leadership: 60 },
    personality: 'Молодой и амбициозный, быстро учится',
    background: 'Junior Sales Rep, показывает стабильный рост результатов'
  },
  {
    id: 42,
    name: 'Карина Белкина',
    role: 'tech',
    avatar: '👩‍💻',
    experience: 4,
    salary: 6800,
    skills: ['Mobile Development', 'React Native', 'iOS', 'Android'],
    stats: { efficiency: 85, creativity: 80, leadership: 65 },
    personality: 'Mobile-first мышление, следит за трендами',
    background: 'Mobile Developer, приложения скачали 500K+ раз'
  },
  {
    id: 43,
    name: 'Валерий Кротов',
    role: 'finance',
    avatar: '👨‍💼',
    experience: 3,
    salary: 4800,
    skills: ['Financial Planning', 'Budgeting', 'Cash Flow'],
    stats: { efficiency: 78, creativity: 60, leadership: 65 },
    personality: 'Консервативный подход к финансам, надежный',
    background: 'Financial Analyst, точность бюджетов 95%'
  },
  {
    id: 44,
    name: 'Полина Краса',
    role: 'operations',
    avatar: '👩‍🏭',
    experience: 3,
    salary: 4400,
    skills: ['Process Improvement', 'Documentation', 'Training'],
    stats: { efficiency: 80, creativity: 70, leadership: 75 },
    personality: 'Любит наводить порядок в процессах',
    background: 'Operations Specialist, сократила время процессов на 40%'
  },
  {
    id: 45,
    name: 'Евгений Лисин',
    role: 'hr',
    avatar: '👨‍💼',
    experience: 3,
    salary: 3900,
    skills: ['Employer Branding', 'Social Recruiting', 'Campus'],
    stats: { efficiency: 72, creativity: 85, leadership: 70 },
    personality: 'Эксперт по привлечению молодых талантов',
    background: 'Talent Acquisition, закрыл 50+ позиций за год'
  },
  {
    id: 46,
    name: 'Диана Орехова',
    role: 'legal',
    avatar: '👩‍⚖️',
    experience: 4,
    salary: 5800,
    skills: ['Commercial Law', 'Contracts', 'Compliance'],
    stats: { efficiency: 82, creativity: 65, leadership: 70 },
    personality: 'Внимательна к деталям, защищает интересы бизнеса',
    background: 'Commercial Lawyer, составила 200+ договоров без споров'
  },
  {
    id: 47,
    name: 'Илья Рогов',
    role: 'creative',
    avatar: '👨‍🎨',
    experience: 2,
    salary: 3800,
    skills: ['Social Media Design', 'Trends', 'Memes', 'Viral'],
    stats: { efficiency: 70, creativity: 90, leadership: 55 },
    personality: 'Чувствует пульс интернета, создает вирусный контент',
    background: 'Social Media Designer, посты набирают 100K+ лайков'
  },
  {
    id: 48,
    name: 'Ксения Белова',
    role: 'analytics',
    avatar: '👩‍💻',
    experience: 3,
    salary: 5200,
    skills: ['Marketing Analytics', 'Attribution Models', 'Cohort Analysis'],
    stats: { efficiency: 80, creativity: 75, leadership: 60 },
    personality: 'Помогает маркетологам принимать решения на основе данных',
    background: 'Marketing Analyst, оптимизировала CAC на 35%'
  },
  {
    id: 49,
    name: 'Федор Князев',
    role: 'tech',
    avatar: '👨‍💻',
    experience: 7,
    salary: 8800,
    skills: ['DevOps', 'AWS', 'Docker', 'CI/CD', 'Infrastructure'],
    stats: { efficiency: 92, creativity: 75, leadership: 80 },
    personality: 'Обеспечивает стабильность и масштабируемость',
    background: 'DevOps Engineer, uptime сервисов 99.9%'
  },
  {
    id: 50,
    name: 'Милана Золотая',
    role: 'marketing',
    avatar: '👩‍💼',
    experience: 8,
    salary: 7600,
    skills: ['Brand Management', 'Positioning', 'Communication Strategy'],
    stats: { efficiency: 90, creativity: 88, leadership: 85 },
    personality: 'Стратег бренда, умеет создавать эмоциональную связь',
    background: 'Brand Manager, увеличила brand equity на 150%'
  }
];

// Бизнес-события и сценарии
const BUSINESS_SCENARIOS = [
  {
    id: 'economic_downturn',
    name: 'Экономический спад',
    description: 'Экономика входит в рецессию, потребители сокращают расходы',
    impact: { revenue: -0.3, costs: 0.1 },
    duration: 3,
    probability: 0.15
  },
  {
    id: 'new_competitor',
    name: 'Новый конкурент',
    description: 'На рынок выходит крупный игрок с большим бюджетом',
    impact: { revenue: -0.2, costs: 0.05 },
    duration: 6,
    probability: 0.25
  },
  {
    id: 'viral_marketing',
    name: 'Вирусный контент',
    description: 'Ваша маркетинговая кампания стала вирусной',
    impact: { revenue: 0.5, costs: -0.1 },
    duration: 2,
    probability: 0.1
  },
  {
    id: 'key_partnership',
    name: 'Ключевое партнерство',
    description: 'Заключили выгодное партнерство с крупной компанией',
    impact: { revenue: 0.3, costs: 0 },
    duration: 12,
    probability: 0.2
  },
  {
    id: 'regulatory_changes',
    name: 'Изменения в законодательстве',
    description: 'Новые регуляторные требования увеличивают расходы',
    impact: { revenue: 0, costs: 0.15 },
    duration: 6,
    probability: 0.18
  }
];

// Функции для работы с данными
const BusinessDataService = {
  getNiches: () => BUSINESS_NICHES,
  
  getNicheById: (id) => BUSINESS_NICHES.find(niche => niche.id === id),
  
  getCandidatesByRole: (role) => {
    return CANDIDATES_DATABASE.filter(candidate => candidate.role === role);
  },
  
  getCandidateById: (id) => {
    return CANDIDATES_DATABASE.find(candidate => candidate.id === id);
  },
  
  getRandomCandidate: (role, excludeIds = []) => {
    const candidates = CANDIDATES_DATABASE.filter(
      candidate => candidate.role === role && !excludeIds.includes(candidate.id)
    );
    
    if (candidates.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * candidates.length);
    return candidates[randomIndex];
  },
  
  calculateMonthlyCosts: (employees) => {
    return employees.reduce((total, employee) => total + employee.salary, 0);
  },
  
  calculateMonthlyRevenue: (niche, employees, businessAge = 1) => {
    const baseRevenue = niche.metrics.monthlyRevenue;
    
    // Команда влияет на доходность
    const teamEfficiency = employees.reduce((avg, emp) => avg + emp.stats.efficiency, 0) / employees.length || 50;
    const teamBonus = (teamEfficiency - 50) / 100; // -50% до +50%
    
    // Время работы бизнеса
    const ageBonus = Math.min(businessAge * 0.1, 1); // до +100% за 10 месяцев
    
    // Случайность рынка
    const marketVariation = 0.8 + Math.random() * 0.4; // 80%-120%
    
    return Math.round(baseRevenue * niche.revenueMultiplier * (1 + teamBonus) * (1 + ageBonus) * marketVariation);
  },
  
  calculateROI: (revenue, costs, initialInvestment) => {
    const monthlyProfit = revenue - costs;
    if (monthlyProfit <= 0) return 0;
    
    const annualProfit = monthlyProfit * 12;
    return Math.round((annualProfit / initialInvestment) * 100);
  },
  
  getBusinessScenarios: () => BUSINESS_SCENARIOS,
  
  generateRandomEvent: () => {
    const scenarios = BUSINESS_SCENARIOS.filter(scenario => Math.random() < scenario.probability);
    return scenarios.length > 0 ? scenarios[Math.floor(Math.random() * scenarios.length)] : null;
  }
};
