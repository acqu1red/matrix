/* ===== FIRST MILLION QUEST DATA ===== */

// Стартовые элементы для первого этапа (гараж)
const STARTUP_ELEMENTS = {
    team: [
        { id: 'tech_founder', name: '👨‍💻 IT-основатель', value: 100, correct: true },
        { id: 'marketing_guru', name: '📱 Маркетолог', value: 80, correct: true },
        { id: 'sales_expert', name: '💼 Продавец', value: 90, correct: true }
    ],
    ideas: [
        { id: 'ai_solution', name: '🤖 AI решение', value: 150, correct: true },
        { id: 'mobile_app', name: '📱 Мобильное приложение', value: 120, correct: true },
        { id: 'saas_platform', name: '☁️ SaaS платформа', value: 140, correct: true }
    ],
    resources: [
        { id: 'seed_funding', name: '💰 Стартовый капитал', value: 100, correct: true },
        { id: 'office_space', name: '🏢 Офисное место', value: 80, correct: true },
        { id: 'development_tools', name: '⚒️ Инструменты разработки', value: 90, correct: true }
    ]
};

// Потенциальные клиенты для второго этапа
const POTENTIAL_CLIENTS = [
    {
        id: 'tech_startup',
        name: 'ТехСтартап Inc.',
        avatar: '🚀',
        budget: '$50K',
        description: 'Молодая IT компания, ищет инновационные решения для автоматизации процессов.',
        value: 50000,
        correct: true,
        personality: 'Готов к экспериментам, быстро принимает решения'
    },
    {
        id: 'corporate_giant',
        name: 'МегаКорп',
        avatar: '🏢',
        budget: '$200K',
        description: 'Крупная корпорация с жесткими требованиями к безопасности и интеграции.',
        value: 200000,
        correct: false,
        personality: 'Консервативный, долго принимает решения, высокие требования'
    },
    {
        id: 'creative_agency',
        name: 'Креатив Студия',
        avatar: '🎨',
        budget: '$30K',
        description: 'Дизайн-агентство, специализируется на брендинге и веб-дизайне.',
        value: 30000,
        correct: true,
        personality: 'Ценит красоту и пользовательский опыт'
    },
    {
        id: 'restaurant_chain',
        name: 'Вкусная Сеть',
        avatar: '🍔',
        budget: '$15K',
        description: 'Сеть ресторанов быстрого питания, хочет оптимизировать заказы.',
        value: 15000,
        correct: false,
        personality: 'Ориентирован на скорость и простоту'
    },
    {
        id: 'ecommerce_store',
        name: 'ИнтернетМаг',
        avatar: '🛒',
        budget: '$80K',
        description: 'Онлайн магазин с миллионами пользователей, нужна персонализация.',
        value: 80000,
        correct: true,
        personality: 'Данные-ориентированный, ищет ROI'
    },
    {
        id: 'nonprofit_org',
        name: 'Добрые Дела',
        avatar: '❤️',
        budget: '$5K',
        description: 'Некоммерческая организация, ограниченный бюджет но важная миссия.',
        value: 5000,
        correct: false,
        personality: 'Социально-ответственный, но с малым бюджетом'
    },
    {
        id: 'fintech_company',
        name: 'ФинТех Решения',
        avatar: '💳',
        budget: '$150K',
        description: 'Финансовая технологическая компания, нужны решения для анализа данных.',
        value: 150000,
        correct: true,
        personality: 'Точный, требовательный к безопасности'
    },
    {
        id: 'gaming_studio',
        name: 'Геймдев Студия',
        avatar: '🎮',
        budget: '$25K',
        description: 'Инди-разработчик игр, ищет инструменты для аналитики игроков.',
        value: 25000,
        correct: false,
        personality: 'Креативный, но с нестабильным доходом'
    }
];

// Факторы рынка для третьего этапа
const MARKET_FACTORS = [
    {
        id: 'ai_boom',
        name: 'Бум искусственного интеллекта',
        impact: 'positive',
        value: '+40%',
        description: 'ИИ технологии на пике популярности'
    },
    {
        id: 'economic_recession',
        name: 'Экономический спад',
        impact: 'negative',
        value: '-25%',
        description: 'Компании сокращают IT-бюджеты'
    },
    {
        id: 'remote_work_trend',
        name: 'Тренд удаленной работы',
        impact: 'positive',
        value: '+30%',
        description: 'Рост спроса на инструменты для удаленки'
    },
    {
        id: 'privacy_regulations',
        name: 'Ужесточение приватности',
        impact: 'negative',
        value: '-15%',
        description: 'Новые требования к обработке данных'
    },
    {
        id: 'venture_capital_boom',
        name: 'Активность венчурного капитала',
        impact: 'positive',
        value: '+50%',
        description: 'Инвесторы активно ищут новые проекты'
    },
    {
        id: 'talent_shortage',
        name: 'Дефицит IT-специалистов',
        impact: 'negative',
        value: '-20%',
        description: 'Сложно найти и удержать талантливых разработчиков'
    }
];

// Кризисные сценарии для пятого этапа
const CRISIS_SCENARIOS = [
    {
        id: 'competitor_launch',
        title: '🏃‍♂️ Конкурент запустил похожий продукт',
        description: 'Крупная компания анонсировала решение, очень похожее на ваше. Что делать?',
        timeLimit: 30,
        options: [
            {
                text: 'Срочно добавить уникальные фишки',
                impact: { money: -20000, reputation: +10, time: -7 },
                correct: true
            },
            {
                text: 'Снизить цены для конкуренции',
                impact: { money: -10000, reputation: -5, time: 0 },
                correct: false
            },
            {
                text: 'Сфокусироваться на нише',
                impact: { money: 0, reputation: +5, time: -3 },
                correct: true
            },
            {
                text: 'Игнорировать и продолжать как есть',
                impact: { money: -30000, reputation: -15, time: 0 },
                correct: false
            }
        ]
    },
    {
        id: 'key_developer_leaves',
        title: '👨‍💻 Ключевой разработчик уходит',
        description: 'Ваш лучший программист получил оффер в Google. Как удержать или заменить?',
        timeLimit: 25,
        options: [
            {
                text: 'Предложить повышение и опционы',
                impact: { money: -15000, reputation: +5, time: 0 },
                correct: true
            },
            {
                text: 'Пожелать удачи и искать замену',
                impact: { money: -5000, reputation: -10, time: -14 },
                correct: false
            },
            {
                text: 'Аутсорсить разработку',
                impact: { money: -10000, reputation: -5, time: -7 },
                correct: false
            },
            {
                text: 'Переписать архитектуру проще',
                impact: { money: -25000, reputation: 0, time: -21 },
                correct: true
            }
        ]
    },
    {
        id: 'server_crash',
        title: '💥 Сервера упали в пиковое время',
        description: 'Ваши сервера не выдержали нагрузки во время важной презентации клиенту.',
        timeLimit: 20,
        options: [
            {
                text: 'Экстренно масштабировать инфраструктуру',
                impact: { money: -30000, reputation: +5, time: -1 },
                correct: true
            },
            {
                text: 'Извиниться и перенести презентацию',
                impact: { money: 0, reputation: -20, time: -7 },
                correct: false
            },
            {
                text: 'Провести демо на локальном сервере',
                impact: { money: -5000, reputation: -5, time: 0 },
                correct: true
            },
            {
                text: 'Обвинить провайдера',
                impact: { money: 0, reputation: -30, time: 0 },
                correct: false
            }
        ]
    },
    {
        id: 'funding_delay',
        title: '💰 Задержка инвестиций',
        description: 'Инвестор передумал, денег хватит только на 2 месяца. Срочно нужно решение.',
        timeLimit: 35,
        options: [
            {
                text: 'Искать новых инвесторов',
                impact: { money: +50000, reputation: 0, time: -30 },
                correct: true
            },
            {
                text: 'Взять кредит в банке',
                impact: { money: +20000, reputation: -10, time: -7 },
                correct: false
            },
            {
                text: 'Сократить команду',
                impact: { money: +15000, reputation: -20, time: 0 },
                correct: false
            },
            {
                text: 'Привлечь предзаказы',
                impact: { money: +30000, reputation: +10, time: -14 },
                correct: true
            }
        ]
    },
    {
        id: 'security_breach',
        title: '🔒 Утечка данных',
        description: 'Хакеры получили доступ к данным пользователей. Нужно действовать быстро.',
        timeLimit: 15,
        options: [
            {
                text: 'Немедленно уведомить пользователей',
                impact: { money: -10000, reputation: +15, time: -3 },
                correct: true
            },
            {
                text: 'Скрыть утечку и исправить втихую',
                impact: { money: 0, reputation: -50, time: 0 },
                correct: false
            },
            {
                text: 'Обратиться к экспертам по безопасности',
                impact: { money: -20000, reputation: +5, time: -7 },
                correct: true
            },
            {
                text: 'Обвинить стажера',
                impact: { money: 0, reputation: -25, time: 0 },
                correct: false
            }
        ]
    }
];

// Слайды для презентации инвесторам
const PITCH_SLIDES = [
    {
        id: 'problem',
        title: 'Проблема',
        icon: '❗',
        position: 1,
        description: 'Описание проблемы, которую решает продукт'
    },
    {
        id: 'solution',
        title: 'Решение',
        icon: '💡',
        position: 2,
        description: 'Как ваш продукт решает проблему'
    },
    {
        id: 'market',
        title: 'Рынок',
        icon: '📊',
        position: 3,
        description: 'Размер рынка и возможности'
    },
    {
        id: 'business_model',
        title: 'Бизнес-модель',
        icon: '💰',
        position: 4,
        description: 'Как компания будет зарабатывать деньги'
    },
    {
        id: 'team',
        title: 'Команда',
        icon: '👥',
        position: 5,
        description: 'Кто будет выполнять план'
    },
    {
        id: 'financials',
        title: 'Финансы',
        icon: '📈',
        position: 6,
        description: 'Прогнозы доходов и расходов'
    },
    {
        id: 'competition',
        title: 'Конкуренция',
        icon: '⚔️',
        position: 7,
        description: 'Анализ конкурентов и преимущества'
    },
    {
        id: 'traction',
        title: 'Трекшн',
        icon: '🚀',
        position: 8,
        description: 'Достигнутые результаты'
    }
];

// Чек-лист для IPO
const IPO_CHECKLIST = [
    {
        id: 'financial_audit',
        text: 'Провести независимый финансовый аудит',
        completed: false,
        impact: { valuation: 500000, credibility: 20 }
    },
    {
        id: 'legal_compliance',
        text: 'Обеспечить соответствие всем юридическим требованиям',
        completed: false,
        impact: { valuation: 300000, credibility: 15 }
    },
    {
        id: 'board_of_directors',
        text: 'Сформировать совет директоров',
        completed: false,
        impact: { valuation: 400000, credibility: 18 }
    },
    {
        id: 'growth_strategy',
        text: 'Разработать стратегию роста на 5 лет',
        completed: false,
        impact: { valuation: 600000, credibility: 25 }
    },
    {
        id: 'risk_management',
        text: 'Внедрить систему управления рисками',
        completed: false,
        impact: { valuation: 250000, credibility: 12 }
    },
    {
        id: 'market_position',
        text: 'Укрепить позицию на рынке',
        completed: false,
        impact: { valuation: 700000, credibility: 30 }
    },
    {
        id: 'team_scaling',
        text: 'Масштабировать команду управления',
        completed: false,
        impact: { valuation: 350000, credibility: 16 }
    },
    {
        id: 'investor_relations',
        text: 'Наладить отношения с инвесторами',
        completed: false,
        impact: { valuation: 450000, credibility: 22 }
    }
];

// Достижения
const ACHIEVEMENTS = {
    garage_guru: {
        id: 'garage_guru',
        name: '🏠 Гуру гаража',
        description: 'Идеально собрал стартовую команду',
        condition: (gameState) => gameState.stage1.correctSelections >= 3
    },
    client_whisperer: {
        id: 'client_whisperer',
        name: '🎯 Заклинатель клиентов',
        description: 'Привлек более 5 качественных клиентов',
        condition: (gameState) => gameState.stage2.goodClients >= 5
    },
    market_prophet: {
        id: 'market_prophet',
        name: '📊 Пророк рынка',
        description: 'Точно предсказал рыночные тренды',
        condition: (gameState) => gameState.stage3.predictionAccuracy >= 80
    },
    resource_master: {
        id: 'resource_master',
        name: '⚡ Мастер ресурсов',
        description: 'Оптимально распределил бюджет',
        condition: (gameState) => gameState.stage4.efficiency >= 90
    },
    crisis_manager: {
        id: 'crisis_manager',
        name: '🔥 Антикризисный менеджер',
        description: 'Успешно прошел все кризисы',
        condition: (gameState) => gameState.stage5.correctDecisions >= 4
    },
    pitch_perfect: {
        id: 'pitch_perfect',
        name: '💰 Идеальная презентация',
        description: 'Создал безупречную презентацию',
        condition: (gameState) => gameState.stage6.slideOrder === 'perfect'
    },
    ipo_champion: {
        id: 'ipo_champion',
        name: '🚀 Чемпион IPO',
        description: 'Успешно вывел компанию на биржу',
        condition: (gameState) => gameState.stage7.ipoSuccess === true
    },
    speed_demon: {
        id: 'speed_demon',
        name: '⚡ Демон скорости',
        description: 'Прошел квест менее чем за 15 минут',
        condition: (gameState) => gameState.totalTime < 900000 // 15 минут
    },
    perfectionist: {
        id: 'perfectionist',
        name: '💎 Перфекционист',
        description: 'Получил максимальный балл на всех этапах',
        condition: (gameState) => gameState.perfectStages >= 6
    },
    first_million: {
        id: 'first_million',
        name: '💰 Первый миллион',
        description: 'Достиг оценки компании в $1M+',
        condition: (gameState) => gameState.finalValuation >= 1000000
    }
};

// Конфигурация игры
const GAME_CONFIG = {
    stages: 7,
    baseValuation: 100000,
    maxValuation: 50000000,
    timeLimit: {
        total: 1200000, // 20 минут
        stage5: 30000   // 30 секунд на кризисное решение
    },
    scoring: {
        perfectStage: 100,
        goodChoice: 50,
        badChoice: -25,
        timeBonus: 10,
        efficiencyBonus: 25
    },
    multipliers: {
        easyMode: 0.8,
        normalMode: 1.0,
        hardMode: 1.3
    }
};

// Случайные события
const RANDOM_EVENTS = [
    {
        id: 'viral_post',
        title: '🔥 Вирусный пост',
        description: 'Ваш продукт стал популярным в соцсетях',
        impact: { money: +25000, reputation: +15 },
        probability: 0.1
    },
    {
        id: 'celebrity_endorsement',
        title: '⭐ Селебрити рекомендация',
        description: 'Известная личность упомянула ваш продукт',
        impact: { money: +50000, reputation: +25 },
        probability: 0.05
    },
    {
        id: 'tech_award',
        title: '🏆 Технологическая награда',
        description: 'Ваш продукт получил престижную награду',
        impact: { money: +30000, reputation: +20 },
        probability: 0.08
    },
    {
        id: 'partnership_offer',
        title: '🤝 Предложение партнерства',
        description: 'Крупная компания предлагает сотрудничество',
        impact: { money: +40000, reputation: +10 },
        probability: 0.12
    },
    {
        id: 'media_coverage',
        title: '📺 Освещение в СМИ',
        description: 'О вашей компании написали в крупном издании',
        impact: { money: +20000, reputation: +18 },
        probability: 0.15
    }
];

// Экспорт данных
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        STARTUP_ELEMENTS,
        POTENTIAL_CLIENTS,
        MARKET_FACTORS,
        CRISIS_SCENARIOS,
        PITCH_SLIDES,
        IPO_CHECKLIST,
        ACHIEVEMENTS,
        GAME_CONFIG,
        RANDOM_EVENTS
    };
}
