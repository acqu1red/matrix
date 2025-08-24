/* ===== TRENDS QUEST DATA ===== */

// Конфигурация квеста
const QUEST_CONFIG = {
  stages: 3,
  questionsPerStage: 3,
  timeLimit: 300000, // 5 минут
  rewards: {
    mulacoin: 50,
    experience: 200
  },
  difficulty: {
    easy: { multiplier: 0.8, timeBonus: 1.2 },
    medium: { multiplier: 1.0, timeBonus: 1.0 },
    hard: { multiplier: 1.5, timeBonus: 0.8 }
  }
};

// Рыночные данные
const MARKET_DATA = {
  indices: [
    { symbol: 'S&P 500', price: 4185.47, change: 0.85, changePercent: 2.1 },
    { symbol: 'NASDAQ', price: 12543.22, change: -1.24, changePercent: -1.8 },
    { symbol: 'DOW', price: 33875.40, change: 0.45, changePercent: 1.3 },
    { symbol: 'VIX', price: 18.25, change: -0.32, changePercent: -1.7 }
  ],
  
  sectors: [
    { name: 'Технологии', performance: 3.2, volume: 1.8, sentiment: 'positive' },
    { name: 'Финансы', performance: -1.1, volume: 1.2, sentiment: 'negative' },
    { name: 'Здравоохранение', performance: 2.4, volume: 0.9, sentiment: 'positive' },
    { name: 'Энергетика', performance: -2.8, volume: 1.5, sentiment: 'negative' },
    { name: 'Потребительские товары', performance: 0.8, volume: 1.1, sentiment: 'neutral' },
    { name: 'Промышленность', performance: 1.9, volume: 1.0, sentiment: 'positive' }
  ],

  trends: [
    {
      id: 'ai-revolution',
      name: 'ИИ-революция',
      category: 'Технологии',
      strength: 95,
      momentum: 'accelerating',
      timeframe: 'long-term',
      risk: 'medium',
      description: 'Массовое внедрение ИИ в бизнес-процессы',
      keyMetrics: {
        marketSize: 850,
        growthRate: 42,
        adoption: 78,
        investment: 125
      }
    },
    {
      id: 'remote-work',
      name: 'Удаленная работа',
      category: 'Социальные изменения',
      strength: 88,
      momentum: 'stable',
      timeframe: 'medium-term',
      risk: 'low',
      description: 'Постоянный переход к гибридным форматам работы',
      keyMetrics: {
        marketSize: 420,
        growthRate: 18,
        adoption: 85,
        investment: 65
      }
    },
    {
      id: 'green-energy',
      name: 'Зеленая энергетика',
      category: 'Экология',
      strength: 92,
      momentum: 'accelerating',
      timeframe: 'long-term',
      risk: 'medium',
      description: 'Переход к возобновляемым источникам энергии',
      keyMetrics: {
        marketSize: 1200,
        growthRate: 35,
        adoption: 45,
        investment: 280
      }
    },
    {
      id: 'digital-payments',
      name: 'Цифровые платежи',
      category: 'Финтех',
      strength: 85,
      momentum: 'stable',
      timeframe: 'short-term',
      risk: 'low',
      description: 'Рост безналичных и криптовалютных платежей',
      keyMetrics: {
        marketSize: 680,
        growthRate: 25,
        adoption: 72,
        investment: 95
      }
    },
    {
      id: 'aging-population',
      name: 'Стареющее население',
      category: 'Демография',
      strength: 90,
      momentum: 'steady',
      timeframe: 'long-term',
      risk: 'low',
      description: 'Рост спроса на медицинские и социальные услуги',
      keyMetrics: {
        marketSize: 950,
        growthRate: 12,
        adoption: 95,
        investment: 150
      }
    },
    {
      id: 'supply-chain',
      name: 'Реорганизация цепочек поставок',
      category: 'Логистика',
      strength: 75,
      momentum: 'declining',
      timeframe: 'medium-term',
      risk: 'high',
      description: 'Перестройка глобальных цепочек поставок',
      keyMetrics: {
        marketSize: 340,
        growthRate: 8,
        adoption: 55,
        investment: 45
      }
    }
  ]
};

// Новостные события
const NEWS_EVENTS = [
  {
    id: 1,
    time: '09:15',
    type: 'positive',
    title: 'OpenAI анонсировала прорыв в области ИИ',
    content: 'Новая модель показывает 40% улучшение в обработке данных',
    impact: { sectors: ['Технологии'], magnitude: 'high' },
    relevantTrends: ['ai-revolution']
  },
  {
    id: 2,
    time: '09:32',
    type: 'negative',
    title: 'Банки сообщают о снижении кредитной активности',
    content: 'Ужесточение кредитных стандартов влияет на рынок',
    impact: { sectors: ['Финансы'], magnitude: 'medium' },
    relevantTrends: []
  },
  {
    id: 3,
    time: '09:45',
    type: 'positive',
    title: 'Зеленая энергетика получила $50 млрд инвестиций',
    content: 'Крупнейшие фонды увеличивают вложения в возобновляемую энергию',
    impact: { sectors: ['Энергетика'], magnitude: 'high' },
    relevantTrends: ['green-energy']
  },
  {
    id: 4,
    time: '10:12',
    type: 'neutral',
    title: 'Потребительские расходы остаются стабильными',
    content: 'Данные розничных продаж соответствуют ожиданиям',
    impact: { sectors: ['Потребительские товары'], magnitude: 'low' },
    relevantTrends: []
  },
  {
    id: 5,
    time: '10:28',
    type: 'positive',
    title: 'Рост удаленной работы стимулирует IT-сектор',
    content: 'Компании увеличивают расходы на цифровую инфраструктуру',
    impact: { sectors: ['Технологии'], magnitude: 'medium' },
    relevantTrends: ['remote-work']
  },
  {
    id: 6,
    time: '10:55',
    type: 'negative',
    title: 'Проблемы с цепочками поставок усиливаются',
    content: 'Геополитические риски влияют на глобальную торговлю',
    impact: { sectors: ['Промышленность'], magnitude: 'medium' },
    relevantTrends: ['supply-chain']
  }
];

// Вопросы для квеста по этапам
const QUEST_QUESTIONS = {
  stage1: [ // Анализ данных
    {
      id: 'data-analysis-1',
      type: 'multiple-choice',
      title: 'Анализ рыночной ситуации',
      question: 'Изучив текущие данные рынка, какой сектор показывает наибольший потенциал роста в краткосрочной перспективе?',
      context: 'Учитывайте производительность секторов, объемы торгов и настроения рынка.',
      options: [
        {
          id: 'tech',
          title: 'Технологии',
          description: 'Высокая производительность (+3.2%) и позитивные настроения',
          impact: 'Высокий потенциал роста, но повышенная волатильность',
          correct: true,
          explanation: 'Технологический сектор показывает лучшую производительность и имеет высокие объемы торгов.'
        },
        {
          id: 'healthcare',
          title: 'Здравоохранение',
          description: 'Стабильный рост (+2.4%) с умеренными объемами',
          impact: 'Умеренный рост с низкими рисками',
          correct: false,
          explanation: 'Хороший выбор для консервативных инвесторов, но потенциал роста ниже технологий.'
        },
        {
          id: 'finance',
          title: 'Финансы',
          description: 'Отрицательная производительность (-1.1%)',
          impact: 'Высокие риски в текущих условиях',
          correct: false,
          explanation: 'Сектор показывает негативную динамику и низкие настроения.'
        },
        {
          id: 'consumer',
          title: 'Потребительские товары',
          description: 'Нейтральная производительность (+0.8%)',
          impact: 'Стабильность, но ограниченный рост',
          correct: false,
          explanation: 'Сектор стабилен, но не показывает высокого потенциала роста.'
        }
      ]
    },
    {
      id: 'data-analysis-2',
      type: 'trend-ranking',
      title: 'Ранжирование трендов',
      question: 'Расположите следующие тренды по степени их влияния на рынок в ближайшие 12 месяцев (от наибольшего к наименьшему):',
      context: 'Учитывайте силу тренда, импульс и временные рамки.',
      trends: ['ai-revolution', 'green-energy', 'digital-payments', 'remote-work'],
      correctOrder: ['ai-revolution', 'green-energy', 'digital-payments', 'remote-work'],
      explanation: 'ИИ-революция имеет наибольший импульс, за ней следует зеленая энергетика с крупными инвестициями.'
    },
    {
      id: 'data-analysis-3',
      type: 'scenario-analysis',
      title: 'Сценарный анализ',
      question: 'Если VIX (индекс волатильности) вырастет на 50% в течение недели, какая стратегия будет наиболее эффективной?',
      context: 'VIX в настоящее время на уровне 18.25, что считается низким уровнем.',
      options: [
        {
          id: 'defensive',
          title: 'Защитная стратегия',
          description: 'Переход в защитные активы и снижение рисков',
          impact: 'Сохранение капитала, но упущенные возможности',
          correct: true,
          explanation: 'Рост VIX на 50% сигнализирует о повышении волатильности и необходимости защиты.'
        },
        {
          id: 'aggressive',
          title: 'Агрессивная стратегия',
          description: 'Увеличение позиций в росте активах',
          impact: 'Высокий потенциал прибыли, но критические риски',
          correct: false,
          explanation: 'Агрессивная стратегия при росте волатильности крайне рискованна.'
        },
        {
          id: 'neutral',
          title: 'Нейтральная стратегия',
          description: 'Сохранение текущих позиций без изменений',
          impact: 'Средние риски и доходность',
          correct: false,
          explanation: 'Игнорирование сигналов волатильности может привести к потерям.'
        },
        {
          id: 'hedging',
          title: 'Хеджирование',
          description: 'Использование деривативов для защиты портфеля',
          impact: 'Снижение рисков с сохранением потенциала роста',
          correct: false,
          explanation: 'Хорошая стратегия, но защитная более подходящая при резком росте VIX.'
        }
      ]
    }
  ],

  stage2: [ // Выявление паттернов
    {
      id: 'pattern-1',
      type: 'pattern-recognition',
      title: 'Распознавание паттернов',
      question: 'Анализируя новостной поток и движения рынка, какой скрытый паттерн вы видите?',
      context: 'Обратите внимание на корреляции между новостями и движениями секторов.',
      patterns: [
        {
          id: 'ai-tech-correlation',
          title: 'ИИ стимулирует весь техсектор',
          description: 'Новости об ИИ положительно влияют на все технологические компании',
          strength: 0.85,
          correct: true,
          explanation: 'Прорывы в ИИ создают эффект домино в технологическом секторе.'
        },
        {
          id: 'energy-transition',
          title: 'Энергетический переход ускоряется',
          description: 'Инвестиции в зеленую энергетику растут экспоненциально',
          strength: 0.78,
          correct: false,
          explanation: 'Хотя тренд сильный, он более линейный, чем экспоненциальный.'
        },
        {
          id: 'supply-chain-crisis',
          title: 'Кризис цепочек поставок углубляется',
          description: 'Геополитические риски усиливают проблемы логистики',
          strength: 0.72,
          correct: false,
          explanation: 'Проблемы есть, но они стабилизируются, а не углубляются.'
        }
      ]
    },
    {
      id: 'pattern-2',
      type: 'correlation-analysis',
      title: 'Анализ корреляций',
      question: 'Какие два тренда показывают наибольшую положительную корреляцию?',
      context: 'Изучите, как тренды влияют друг на друга и развиваются синхронно.',
      correlationPairs: [
        {
          trend1: 'ai-revolution',
          trend2: 'remote-work',
          correlation: 0.76,
          correct: true,
          explanation: 'ИИ и удаленная работа взаимно усиливают друг друга через автоматизацию процессов.'
        },
        {
          trend1: 'green-energy',
          trend2: 'aging-population',
          correlation: 0.23,
          correct: false,
          explanation: 'Эти тренды развиваются независимо друг от друга.'
        },
        {
          trend1: 'digital-payments',
          trend2: 'supply-chain',
          correlation: -0.15,
          correct: false,
          explanation: 'Эти тренды показывают слабую отрицательную корреляцию.'
        }
      ]
    },
    {
      id: 'pattern-3',
      type: 'anomaly-detection',
      title: 'Обнаружение аномалий',
      question: 'В данных рынка есть аномалия. Что кажется необычным?',
      context: 'Ищите несоответствия между различными показателями.',
      anomalies: [
        {
          id: 'vix-disconnect',
          title: 'Разрыв между VIX и рыночными движениями',
          description: 'VIX остается низким несмотря на волатильность в секторах',
          severity: 'medium',
          correct: true,
          explanation: 'Низкий VIX при высокой секторальной волатильности указывает на скрытые риски.'
        },
        {
          id: 'volume-anomaly',
          title: 'Необычные объемы торгов',
          description: 'Объемы в энергетическом секторе аномально высокие',
          severity: 'low',
          correct: false,
          explanation: 'Высокие объемы объясняются крупными инвестициями в зеленую энергетику.'
        },
        {
          id: 'sentiment-mismatch',
          title: 'Несоответствие настроений и производительности',
          description: 'Позитивные настроения в убыточных секторах',
          severity: 'high',
          correct: false,
          explanation: 'Настроения соответствуют долгосрочным перспективам, а не текущей производительности.'
        }
      ]
    }
  ],

  stage3: [ // Принятие решений
    {
      id: 'decision-1',
      type: 'portfolio-allocation',
      title: 'Распределение портфеля',
      question: 'У вас есть $100,000 для инвестирования. Как вы распределите средства между секторами?',
      context: 'Учитывайте анализ трендов, риски и временные горизонты.',
      budget: 100000,
      sectors: [
        { id: 'technology', name: 'Технологии', risk: 'high', potential: 'very-high' },
        { id: 'healthcare', name: 'Здравоохранение', risk: 'medium', potential: 'high' },
        { id: 'energy', name: 'Зеленая энергетика', risk: 'medium', potential: 'very-high' },
        { id: 'finance', name: 'Финансы', risk: 'high', potential: 'medium' },
        { id: 'consumer', name: 'Потребительские товары', risk: 'low', potential: 'low' },
        { id: 'cash', name: 'Денежные средства', risk: 'very-low', potential: 'very-low' }
      ],
      optimalAllocation: {
        technology: 35000,
        healthcare: 20000,
        energy: 25000,
        finance: 5000,
        consumer: 10000,
        cash: 5000
      },
      toleranceRange: 0.15 // 15% отклонение считается приемлемым
    },
    {
      id: 'decision-2',
      type: 'risk-management',
      title: 'Управление рисками',
      question: 'Ваш портфель потерял 8% за неделю. Какие действия предпримете?',
      context: 'Рынок в целом упал на 5%, ваши потери выше среднего.',
      options: [
        {
          id: 'rebalance',
          title: 'Ребалансировка портфеля',
          description: 'Перераспределить активы согласно первоначальной стратегии',
          impact: 'Восстановление баланса рисков и доходности',
          correct: true,
          explanation: 'Ребалансировка помогает вернуться к оптимальному распределению рисков.'
        },
        {
          id: 'panic-sell',
          title: 'Продать убыточные позиции',
          description: 'Зафиксировать потери и перейти в денежные средства',
          impact: 'Кристаллизация потерь и упущенные возможности восстановления',
          correct: false,
          explanation: 'Паническая продажа часто приводит к фиксации потерь в худший момент.'
        },
        {
          id: 'double-down',
          title: 'Увеличить позиции',
          description: 'Докупить активы по сниженным ценам',
          impact: 'Потенциально высокая прибыль, но увеличенные риски',
          correct: false,
          explanation: 'Без дополнительного анализа это может усугубить потери.'
        },
        {
          id: 'wait-and-see',
          title: 'Ничего не предпринимать',
          description: 'Подождать восстановления рынка',
          impact: 'Сохранение текущих позиций без активного управления',
          correct: false,
          explanation: 'Пассивность может быть оправдана, но активное управление предпочтительнее.'
        }
      ]
    },
    {
      id: 'decision-3',
      type: 'strategic-planning',
      title: 'Стратегическое планирование',
      question: 'На основе проведенного анализа, какую долгосрочную стратегию вы выберете?',
      context: 'Планируйте на горизонт 3-5 лет с учетом выявленных трендов.',
      strategies: [
        {
          id: 'tech-growth',
          title: 'Фокус на технологический рост',
          description: 'Концентрация на ИИ, автоматизации и цифровизации',
          timeHorizon: '3-5 лет',
          riskLevel: 'high',
          expectedReturn: '12-18%',
          correct: true,
          explanation: 'Технологические тренды показывают наибольший потенциал роста.'
        },
        {
          id: 'esg-investing',
          title: 'ESG-инвестирование',
          description: 'Упор на экологические и социальные факторы',
          timeHorizon: '5-10 лет',
          riskLevel: 'medium',
          expectedReturn: '8-12%',
          correct: false,
          explanation: 'Хорошая стратегия, но технологии показывают больший потенциал.'
        },
        {
          id: 'diversified',
          title: 'Диверсифицированный подход',
          description: 'Равномерное распределение по всем секторам',
          timeHorizon: '5-7 лет',
          riskLevel: 'medium',
          expectedReturn: '6-10%',
          correct: false,
          explanation: 'Консервативный подход, но упускает возможности роста.'
        },
        {
          id: 'defensive',
          title: 'Защитная стратегия',
          description: 'Акцент на стабильность и сохранение капитала',
          timeHorizon: '3-5 лет',
          riskLevel: 'low',
          expectedReturn: '4-7%',
          correct: false,
          explanation: 'Слишком консервативно для текущих рыночных возможностей.'
        }
      ]
    }
  ]
};

// Функции для работы с данными
const DataService = {
  getMarketData: () => MARKET_DATA,
  
  getNewsEvents: (count = 6) => {
    return NEWS_EVENTS.slice(0, count);
  },
  
  getTrendData: (trendId) => {
    return MARKET_DATA.trends.find(trend => trend.id === trendId);
  },
  
  getQuestionsByStage: (stage) => {
    return QUEST_QUESTIONS[`stage${stage}`] || [];
  },
  
  generateChartData: (trend) => {
    const points = [];
    const baseValue = 100;
    let currentValue = baseValue;
    
    for (let i = 0; i < 30; i++) {
      const volatility = trend.risk === 'high' ? 0.05 : 
                        trend.risk === 'medium' ? 0.03 : 0.02;
      const growth = trend.momentum === 'accelerating' ? 0.002 :
                    trend.momentum === 'stable' ? 0.001 : 0;
      
      currentValue += (Math.random() - 0.5) * volatility * currentValue + growth * currentValue;
      points.push({
        x: i * 3.33, // 100% / 30 points
        y: ((currentValue - baseValue) / baseValue) * 100
      });
    }
    
    return points;
  }
};
