/* ===== TRENDS QUEST DATA ===== */

const QUEST_CONFIG = {
  stages: 5,
  rewards: {
    base: {
      coins: 50,
      xp: 200
    },
    multipliers: {
      perfect: 2.0,
      excellent: 1.5,
      good: 1.2,
      normal: 1.0
    }
  }
};

// Данные для Этапа 1: Swipe тренды
const TRENDS_DATA = [
  {
    id: 1,
    title: "AI-психотерапевты",
    description: "Приложения с ИИ для ментального здоровья становятся популярнее живых психологов",
    image: "🤖",
    stats: {
      audience: "2.5M",
      growth: "+340%",
      heat: "🔥🔥🔥"
    },
    willSucceed: true,
    feedback: {
      correct: "Правильно! Пандемия изменила отношение к ментальному здоровью. AI-терапевты доступны 24/7 и дешевле.",
      incorrect: "Упс! Ты недооценил силу технологий. Молодежь уже предпочитает AI живым психологам."
    }
  },
  {
    id: 2,
    title: "Метавселенная для работы",
    description: "Компании массово переносят офисы в виртуальную реальность",
    image: "🥽",
    stats: {
      audience: "500K",
      growth: "+50%",
      heat: "🔥"
    },
    willSucceed: false,
    feedback: {
      correct: "Верно! Технология слишком сырая, а люди устали от удалёнки. Хотят живого общения.",
      incorrect: "Нет! Ты переоценил готовность людей. VR-очки всё ещё неудобные и дорогие."
    }
  },
  {
    id: 3,
    title: "Микро-инвестиции",
    description: "Приложения для инвестирования от $1 в акции и крипту",
    image: "💎",
    stats: {
      audience: "8M",
      growth: "+520%",
      heat: "🔥🔥🔥🔥"
    },
    willSucceed: true,
    feedback: {
      correct: "Точно! Gen Z хочет инвестировать, но у них мало денег. Микро-инвестиции - идеальное решение.",
      incorrect: "Промах! Ты недооценил желание молодёжи стать богатой. Они готовы вкладывать даже $1."
    }
  },
  {
    id: 4,
    title: "NFT-дипломы",
    description: "Университеты выдают дипломы в виде NFT токенов",
    image: "🎓",
    stats: {
      audience: "100K",
      growth: "+10%",
      heat: "❄️"
    },
    willSucceed: false,
    feedback: {
      correct: "Правильно! Образование слишком консервативно. NFT ассоциируются со скамом.",
      incorrect: "Неверно! Хайп вокруг NFT прошёл, а университеты очень медленно меняются."
    }
  },
  {
    id: 5,
    title: "Эко-трекеры",
    description: "Приложения для отслеживания личного углеродного следа",
    image: "🌱",
    stats: {
      audience: "3M",
      growth: "+180%",
      heat: "🔥🔥"
    },
    willSucceed: true,
    feedback: {
      correct: "Да! Молодёжь реально переживает за планету. Эко-сознательность - новый статус.",
      incorrect: "Нет! Экология - это новая религия Gen Z. Они готовы платить за 'зелёные' продукты."
    }
  },
  {
    id: 6,
    title: "Виртуальные инфлюенсеры",
    description: "AI-блогеры с миллионами подписчиков заменяют живых",
    image: "👤",
    stats: {
      audience: "15M",
      growth: "+900%",
      heat: "🔥🔥🔥🔥🔥"
    },
    willSucceed: true,
    feedback: {
      correct: "Бинго! Виртуальные инфлюенсеры не устают, не скандалят и работают 24/7. Бренды в восторге!",
      incorrect: "Мимо! Lil Miquela уже зарабатывает миллионы. Люди не различают реальность и AI."
    }
  },
  {
    id: 7,
    title: "Социальный рейтинг",
    description: "Приложения для оценки людей как в 'Чёрном зеркале'",
    image: "⭐",
    stats: {
      audience: "200K",
      growth: "-20%",
      heat: "❄️❄️"
    },
    willSucceed: false,
    feedback: {
      correct: "Верно! После скандалов с приватностью люди боятся тотального контроля.",
      incorrect: "Неа! 'Чёрное зеркало' напугало всех. Никто не хочет жить в антиутопии."
    }
  },
  {
    id: 8,
    title: "Sleep-tech",
    description: "Гаджеты и приложения для улучшения сна",
    image: "😴",
    stats: {
      audience: "5M",
      growth: "+280%",
      heat: "🔥🔥🔥"
    },
    willSucceed: true,
    feedback: {
      correct: "Точно! Выгорание и стресс на пике. Люди готовы платить любые деньги за хороший сон.",
      incorrect: "Ошибка! Сон - новый статус успешности. 'Я сплю 8 часов' - новое 'У меня есть Tesla'."
    }
  },
  {
    id: 9,
    title: "Метаболические трекеры",
    description: "Носимые устройства для анализа метаболизма в реальном времени",
    image: "⚡",
    stats: {
      audience: "1M",
      growth: "+150%",
      heat: "🔥🔥"
    },
    willSucceed: true,
    feedback: {
      correct: "Да! Биохакинг набирает обороты. Люди хотят оптимизировать каждый аспект здоровья.",
      incorrect: "Нет! Персонализированное здоровье - главный тренд. Все хотят знать свой организм."
    }
  },
  {
    id: 10,
    title: "Виртуальная недвижимость",
    description: "Покупка земли в метавселенных за реальные деньги",
    image: "🏠",
    stats: {
      audience: "300K",
      growth: "-60%",
      heat: "❄️❄️❄️"
    },
    willSucceed: false,
    feedback: {
      correct: "Правильно! Пузырь виртуальной недвижимости лопнул. Люди поняли, что это скам.",
      incorrect: "Мимо! После краха криптовалют люди боятся виртуальных активов."
    }
  }
];

// Данные для Этапа 2: Эмоциональный радар
const SOCIAL_POSTS_DATA = [
  {
    author: "@cryptobro",
    content: "Потерял 80% портфеля... Но я всё ещё верю! To the moon! 🚀",
    likes: "2.3K",
    comments: "567",
    emotion: "hope"
  },
  {
    author: "@anxious_trader",
    content: "Не могу спать третью ночь. Рынок рушится, что делать?! 😰",
    likes: "5.1K",
    comments: "1.2K",
    emotion: "fear"
  },
  {
    author: "@diamond_hands",
    content: "Купил ещё на падении! Слабаки продают, умные покупают 💎🙌",
    likes: "8.7K",
    comments: "2.3K",
    emotion: "greed"
  },
  {
    author: "@market_skeptic",
    content: "Все эти 'эксперты' говорили рост... Я же предупреждал 🤷‍♂️",
    likes: "3.4K",
    comments: "890",
    emotion: "doubt"
  },
  {
    author: "@panic_seller",
    content: "ВСЁ ПРОДАЛ! Лучше потерять 30% чем 100%!!!",
    likes: "1.2K",
    comments: "456",
    emotion: "fear"
  },
  {
    author: "@fomo_buyer",
    content: "Все покупают этот токен! Не хочу упустить х100! Залетаю! 🔥",
    likes: "6.8K",
    comments: "1.5K",
    emotion: "greed"
  },
  {
    author: "@wise_investor",
    content: "Странные объёмы... Киты что-то знают? 🐋👀",
    likes: "4.2K",
    comments: "678",
    emotion: "doubt"
  },
  {
    author: "@newbie2023",
    content: "Первый раз вижу такое падение... Это конец? 😱",
    likes: "2.8K",
    comments: "934",
    emotion: "fear"
  },
  {
    author: "@moon_believer",
    content: "История повторяется! После такого падения всегда взлёт! 📈",
    likes: "7.3K",
    comments: "1.8K",
    emotion: "hope"
  },
  {
    author: "@greedy_gordon",
    content: "Займу денег и куплю ещё! Это шанс стать миллионером! 🤑",
    likes: "1.9K",
    comments: "567",
    emotion: "greed"
  }
];

// Данные для Этапа 3: Паттерны
const PATTERN_SCENARIOS = [
  {
    id: 1,
    title: "Цикл хайпа технологий",
    events: [
      { id: "e1", icon: "💡", name: "Изобретение", order: 1 },
      { id: "e2", icon: "📰", name: "Медиа хайп", order: 2 },
      { id: "e3", icon: "🚀", name: "Пик ожиданий", order: 3 },
      { id: "e4", icon: "📉", name: "Разочарование", order: 4 },
      { id: "e5", icon: "🔧", name: "Доработка", order: 5 },
      { id: "e6", icon: "📈", name: "Массовое принятие", order: 6 }
    ],
    explanation: "Это классический цикл Gartner! Любая технология проходит через хайп, крах и реальное применение."
  },
  {
    id: 2,
    title: "Психология пузыря",
    events: [
      { id: "e1", icon: "🌱", name: "Скрытый рост", order: 1 },
      { id: "e2", icon: "👀", name: "Внимание медиа", order: 2 },
      { id: "e3", icon: "🏃", name: "FOMO покупки", order: 3 },
      { id: "e4", icon: "🎯", name: "Манипуляции", order: 4 },
      { id: "e5", icon: "💥", name: "Паника", order: 5 },
      { id: "e6", icon: "🩹", name: "Восстановление", order: 6 }
    ],
    explanation: "Каждый финансовый пузырь развивается по одной схеме. Зная её, можно заработать!"
  },
  {
    id: 3,
    title: "Вирусный контент",
    events: [
      { id: "e1", icon: "✨", name: "Триггер", order: 1 },
      { id: "e2", icon: "😲", name: "Эмоция", order: 2 },
      { id: "e3", icon: "📱", name: "Первые репосты", order: 3 },
      { id: "e4", icon: "💬", name: "Обсуждения", order: 4 },
      { id: "e5", icon: "🌍", name: "Массовость", order: 5 },
      { id: "e6", icon: "💀", name: "Смерть мема", order: 6 }
    ],
    explanation: "Вирусность предсказуема! Эмоция + простота + актуальность = миллионы просмотров."
  }
];

// Данные для Этапа 4: Факторы влияния
const TREND_FACTORS = [
  { name: "Экономический кризис", impact: "negative", value: "-30%" },
  { name: "Поддержка инфлюенсеров", impact: "positive", value: "+50%" },
  { name: "Новое поколение Z", impact: "positive", value: "+40%" },
  { name: "Регуляторные запреты", impact: "negative", value: "-60%" },
  { name: "Технологический прорыв", impact: "positive", value: "+80%" },
  { name: "Скандалы и разоблачения", impact: "negative", value: "-45%" }
];

// Данные для Этапа 5: Инвестиционные тренды
const INVESTMENT_TRENDS = [
  {
    id: "ai_therapy",
    name: "AI-терапия",
    price: 100,
    volatility: "medium",
    potential: "high",
    news: [
      "Google инвестировал $500M в AI-терапевтов",
      "Исследование: AI помогает лучше человека в 73% случаев",
      "Скандал: AI-терапевт довёл до суицида?"
    ]
  },
  {
    id: "micro_invest",
    name: "Микро-инвестиции",
    price: 50,
    volatility: "low",
    potential: "medium",
    news: [
      "Robinhood запускает инвестиции от $0.01",
      "Gen Z инвестирует 40% дохода",
      "Регуляторы обеспокоены gambling-эффектом"
    ]
  },
  {
    id: "sleep_tech",
    name: "Sleep Tech",
    price: 200,
    volatility: "high",
    potential: "very_high",
    news: [
      "Apple выпускает Sleep Pro за $999",
      "Учёные: плохой сон сокращает жизнь на 10 лет",
      "Илон Маск: 'Сон - это новая суперсила'"
    ]
  },
  {
    id: "eco_track",
    name: "Эко-трекеры",
    price: 75,
    volatility: "medium",
    potential: "medium",
    news: [
      "ЕС обязал компании раскрывать углеродный след",
      "Молодёжь бойкотирует не-эко бренды",
      "Гринвошинг: 60% эко-приложений врут"
    ]
  },
  {
    id: "virtual_influencer",
    name: "Виртуальные инфлюенсеры",
    price: 300,
    volatility: "very_high",
    potential: "extreme",
    news: [
      "Виртуальная модель заработала $10M за месяц",
      "Скандал: люди не отличают AI от человека",
      "Meta создаёт армию AI-инфлюенсеров"
    ]
  }
];

// Достижения
const ACHIEVEMENTS = [
  {
    id: "trend_hunter",
    name: "Охотник за трендами",
    description: "Правильно определил 8+ трендов",
    icon: "🎯"
  },
  {
    id: "emotion_reader",
    name: "Читатель эмоций",
    description: "Точно проанализировал настроение рынка",
    icon: "🧠"
  },
  {
    id: "pattern_master",
    name: "Мастер паттернов",
    description: "Нашёл все скрытые закономерности",
    icon: "🔍"
  },
  {
    id: "profit_prophet",
    name: "Пророк прибыли",
    description: "Заработал 300%+ на инвестициях",
    icon: "💰"
  },
  {
    id: "perfect_predictor",
    name: "Идеальный предсказатель",
    description: "Точность прогнозов выше 90%",
    icon: "🔮"
  }
];

// Вспомогательные функции
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Экспорт данных
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    QUEST_CONFIG,
    TRENDS_DATA,
    SOCIAL_POSTS_DATA,
    PATTERN_SCENARIOS,
    TREND_FACTORS,
    INVESTMENT_TRENDS,
    ACHIEVEMENTS,
    getRandomElement,
    shuffleArray
  };
}