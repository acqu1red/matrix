
/* ====== CONFIG ====== */
const SUPABASE_URL = window.SUPABASE_URL || "https://uhhsrtmmuwoxsdquimaa.supabase.co";
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoaHNydG1tdXdveHNkcXVpbWFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2OTMwMzcsImV4cCI6MjA3MDI2OTAzN30.5xxo6g-GEYh4ufTibaAtbgrifPIU_ilzGzolAdmAnm8";
const SUBSCRIPTIONS_TABLE = "subscriptions";
const PROMOCODES_TABLE = "promocodes";
const ADMIN_USERNAME = "@acqu1red";
const ADMIN_IDS = ["acqu1red", "123456789", "708907063", "7365307696"]; // Добавьте сюда ID администраторов

const PAYMENT_URL = "https://acqu1red.github.io/formulaprivate/payment.html";
const ISLAND_MINIAPP_URL = "./island.html";

const MAX_DAILY_FREE = 5;
const TOTAL_QUESTS = 10; // Уменьшил до 10 квестов
const VARIATIONS_PER_QUEST = 10;

// Система уровней
const LEVEL_EXP = [
  100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500, 5500,
  6600, 7800, 9100, 10500, 12000, 13600, 15300, 17100, 19000, 21000
];

// Система наград за квесты
const QUEST_REWARDS = {
  easy: { mulacoin: 1, exp: 150 },
  medium: { mulacoin: 3, exp: 500 },
  hard: { mulacoin: 5, exp: 1000 }
};

/* ====== Telegram init ====== */
let tg = null;
function initTG(){
  try{
    tg = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;
    if(tg){
      tg.expand();
      tg.enableClosingConfirmation();
      document.body.classList.add("tg-ready");
      
      // Получаем Telegram ID пользователя
      if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
        userData.telegramId = tg.initDataUnsafe.user.id;
        console.log('Telegram ID получен:', userData.telegramId);
      }
    }
  }catch(e){ console.log("TG init fail", e); }
}

// Инициализация после загрузки страницы
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM загружен, инициализация...');
initTG();
  
  // Инициализируем Supabase и загружаем данные
  setTimeout(async () => {
    // Убеждаемся, что Supabase инициализирован
    if (!supabase && window.supabase) {
      await initSupabase();
    }
    
    if (supabase) {
      console.log('Supabase готов к использованию');
      
      // Тестируем подключение
      try {
        const { data, error } = await supabase.from('bot_user').select('count').limit(1);
        if (error) {
          console.error('Ошибка тестирования Supabase:', error);
          toast('Ошибка подключения к базе данных', 'error');
        } else {
          console.log('Тест подключения к Supabase успешен');
          toast('Подключение к базе данных установлено', 'success');
        }
      } catch (error) {
        console.error('Ошибка тестирования Supabase:', error);
      }
      
      // Загружаем данные пользователя если есть Telegram ID
      if (userData.telegramId) {
        console.log('Загружаем данные для Telegram ID:', userData.telegramId);
        await loadUserData(userData.telegramId);
      } else {
        console.log('Telegram ID не получен, данные не загружены');
      }
    } else {
      console.error('Supabase не инициализирован');
      toast('Ошибка инициализации базы данных', 'error');
    }
    // Инициализация логики кейса после первичной загрузки
    try { initMysteryCase(); } catch(e){ console.warn('initMysteryCase error', e); }
  }, 1000);
});

/* ====== Supabase ====== */
let supabase = null;

async function initSupabase() {
  try {
    if (window.supabase) {
      supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      console.log('Supabase клиент успешно инициализирован');
      
      // Проверяем подключение
      const { data, error } = await supabase.from('bot_user').select('count').limit(1);
      if (error) {
        console.error('Ошибка подключения к Supabase:', error);
      } else {
        console.log('Подключение к Supabase успешно');
      }
    } else {
      console.error('Supabase библиотека не загружена');
    }
  } catch (error) {
    console.error('Ошибка инициализации Supabase:', error);
  }
}

// Инициализируем Supabase
initSupabase();

/* ====== Utils ====== */
const $ = (sel, el=document)=>el.querySelector(sel);
const $$ = (sel, el=document)=>Array.from(el.querySelectorAll(sel));
const toast = (msg, type = 'info')=>{ 
  const t = $("#toast"); 
  t.textContent = msg; 
  t.className = `toast ${type}`;
  t.classList.add("show"); 
  setTimeout(()=>t.classList.remove("show"), 3000); 
};

// Система валют и уровней
let userData = {
  mulacoin: 0,
  exp: 0,
  level: 1,
  userId: null,
  
  telegramId: null
};

function calculateLevel(exp) {
  let level = 1;
  for (let i = 0; i < LEVEL_EXP.length; i++) {
    if (exp >= LEVEL_EXP[i]) {
      level = i + 2;
    } else {
      break;
    }
  }
  console.log(`calculateLevel: exp=${exp}, calculated level=${level}`);
  return level;
}

function getExpForNextLevel(level) {
  if (level <= LEVEL_EXP.length) {
    return LEVEL_EXP[level - 1];
  }
  return LEVEL_EXP[LEVEL_EXP.length - 1] + (level - LEVEL_EXP.length) * 1000;
}

function updateCurrencyDisplay() {
  console.log('Обновление отображения валюты:', userData);
  
  // Обновляем mulacoin во всех возможных местах
  const mulacoinElements = [
    $("#mulacoinAmount"),
    $("#userMulacoin"),
    $("#currentMulacoin"),
    document.querySelector('[data-mulacoin]')
  ];
  
  const levelEl = $("#currentLevel");
  const progressEl = $("#levelProgress");
  
  console.log('Найденные элементы mulacoin:', mulacoinElements.map(el => !!el));
  console.log('Level элемент:', !!levelEl);
  console.log('Progress элемент:', !!progressEl);
  
  // Обновляем все элементы с mulacoin
  mulacoinElements.forEach(el => {
    if (el) {
      el.textContent = userData.mulacoin || 0;
      console.log('Обновлен элемент mulacoin:', el.textContent);
    }
  });
  
  if (levelEl) {
    levelEl.textContent = userData.level || 1;
    console.log('Обновлен currentLevel:', userData.level);
  }
  
  // Исправляем расчет прогресса уровня
  const expForNext = getExpForNextLevel(userData.level);
  const currentLevelExp = userData.level > 1 ? LEVEL_EXP[userData.level - 2] : 0;
  const progress = Math.max(0, userData.exp - currentLevelExp);
  const total = expForNext - currentLevelExp;
  
  if (progressEl) {
    progressEl.textContent = `${progress}/${total}`;
    console.log('Обновлен levelProgress:', `${progress}/${total}`);
  }
  
  // Принудительно обновляем отображение один раз
  setTimeout(() => {
    const mulacoinElements = [
      $("#mulacoinAmount"),
      $("#userMulacoin"),
      $("#currentMulacoin"),
      document.querySelector('[data-mulacoin]')
    ];
    
    mulacoinElements.forEach(el => {
      if (el) {
        el.textContent = userData.mulacoin || 0;
      }
    });
  }, 100);
}

async function addRewards(mulacoin, exp, questId = null, questName = null, difficulty = null) {
  console.log('=== СТАРТ ADDREWARDS ===');
  console.log('addRewards вызвана с параметрами:', { mulacoin, exp, questId, questName, difficulty });
  console.log('Текущие данные пользователя:', userData);
  console.log('Supabase доступен:', !!supabase);
  console.log('Telegram ID:', userData.telegramId);
  
  const oldLevel = userData.level || 1;
  const oldExp = userData.exp || 0;
  const oldMulacoin = userData.mulacoin || 0;
  
  // Обновляем данные
  userData.mulacoin = oldMulacoin + mulacoin;
  userData.exp = oldExp + exp;
  userData.level = calculateLevel(userData.exp);
  
  console.log('Данные после обновления:', {
    oldLevel,
    newLevel: userData.level,
    oldExp,
    newExp: userData.exp,
    oldMulacoin,
    newMulacoin: userData.mulacoin
  });
  
  // Обновляем отображение
  updateCurrencyDisplay();
  
  // Проверяем повышение уровня
  if (userData.level > oldLevel) {
    toast(`🎉 Поздравляем! Вы достигли ${userData.level} уровня!`, 'success');
  }
  
  // Сохраняем данные немедленно
  console.log('Начинаем сохранение данных...');
  await saveUserData();
  
  // Сохраняем историю квеста если указаны параметры
  if (questId && questName && difficulty) {
    console.log('Сохраняем историю квеста...');
    await saveQuestHistory(questId, questName, difficulty, mulacoin, exp);
  }
  
  console.log('addRewards завершена');
}

// Рулетка временно отключена - перенесена в отдельный файл





async function saveUserData() {
  console.log('=== СТАРТ СОХРАНЕНИЯ ДАННЫХ ===');
  console.log('Сохранение данных пользователя:', userData);
  console.log('Supabase доступен:', !!supabase);
  console.log('Telegram ID:', userData.telegramId);
  console.log('Mulacoin для сохранения:', userData.mulacoin);
  console.log('Experience для сохранения:', userData.exp);
  console.log('Level для сохранения:', userData.level);
  
  // Всегда сохраняем в localStorage как fallback
  const dataToSave = {
    mulacoin: userData.mulacoin || 0,
    exp: userData.exp || 0,
    level: userData.level || 1,

    telegramId: userData.telegramId
  };
  
  localStorage.setItem('userData', JSON.stringify(dataToSave));
  console.log('Данные сохранены в localStorage:', dataToSave);
  
  // Сохраняем в Supabase если доступен
  if (supabase && userData.telegramId) {
    try {
      const userDataToSave = {
        telegram_id: userData.telegramId,
        mulacoin: userData.mulacoin || 0,
        experience: userData.exp || 0,
        level: userData.level || 1,
    
        updated_at: new Date().toISOString()
      };
      
      console.log('Данные для сохранения в Supabase:', userDataToSave);
      
      const { data, error } = await supabase
        .from('bot_user')
        .upsert(userDataToSave)
        .select();
      
      if (error) {
        console.error('Ошибка сохранения в Supabase:', error);
        toast('Ошибка сохранения данных в базу', 'error');
      } else {
        console.log('Данные пользователя сохранены в Supabase:', data);
        toast('Данные успешно сохранены в базу', 'success');
      }
    } catch (error) {
      console.error('Ошибка подключения к Supabase:', error);
      toast('Ошибка подключения к базе данных', 'error');
    }
  } else {
    console.log('Supabase недоступен или отсутствует Telegram ID');
    if (!supabase) console.log('Причина: Supabase клиент не инициализирован');
    if (!userData.telegramId) console.log('Причина: Отсутствует Telegram ID');
  }
}

async function loadUserData(userId) {
  console.log('Загрузка данных пользователя:', userId);
  console.log('Supabase доступен:', !!supabase);
  console.log('Telegram ID:', userData.telegramId);
  
  userData.userId = userId;
  
  // Получаем telegram_id из Telegram WebApp (как в subscription.html)
  const telegram_id = (tg && tg.initDataUnsafe && tg.initDataUnsafe.user && tg.initDataUnsafe.user.id) ? tg.initDataUnsafe.user.id : null;
  if (telegram_id) {
    userData.telegramId = telegram_id.toString();
    console.log('✅ Telegram ID получен из WebApp:', userData.telegramId);
  } else {
    console.log('❌ Не удалось получить Telegram ID из WebApp');
  }
  
  // Используем telegram_id для загрузки данных из Supabase
  const telegramIdForQuery = telegram_id ? telegram_id.toString() : userData.telegramId;
  
  // Сначала загружаем из localStorage как fallback
  const saved = localStorage.getItem('userData');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      userData.mulacoin = parsed.mulacoin || 0;
      userData.exp = parsed.exp || 0;
      // Пересчитываем уровень на основе опыта
      userData.level = calculateLevel(userData.exp);

      console.log('Данные загружены из localStorage:', parsed);
      console.log('Уровень пересчитан на основе опыта:', userData.level);
    } catch (error) {
      console.error('Ошибка парсинга localStorage:', error);
    }
  }
  
  // Пытаемся загрузить из Supabase
  if (supabase && telegramIdForQuery) {
    try {
      console.log('Попытка загрузки из Supabase для Telegram ID:', telegramIdForQuery);
      
      const { data, error } = await supabase
        .from('bot_user')
        .select('*')
        .eq('telegram_id', telegramIdForQuery)
        .single();
      
      if (data && !error) {
        console.log('Данные загружены из Supabase:', data);
        // Обновляем данные из Supabase (они имеют приоритет)
        userData.mulacoin = data.mulacoin || userData.mulacoin || 0;
        userData.exp = data.experience || userData.exp || 0;
        // Пересчитываем уровень на основе опыта
        userData.level = calculateLevel(userData.exp);

        console.log('Уровень пересчитан на основе опыта:', userData.level);
        toast('Данные загружены из базы данных', 'success');
      } else {
        console.log('Пользователь не найден в Supabase, используем данные из localStorage');
      }
    } catch (error) {
      console.error('Ошибка загрузки из Supabase:', error);
      toast('Ошибка загрузки из базы данных', 'error');
    }
  } else {
    console.log('Supabase недоступен, загружаем из localStorage');
    if (!supabase) console.log('Причина: Supabase клиент не инициализирован');
    if (!userData.telegramId) console.log('Причина: Отсутствует Telegram ID');
    
    // Fallback на localStorage
    const saved = localStorage.getItem(`userData_${userId}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      userData = { ...userData, ...parsed };
      // Пересчитываем уровень на основе опыта
      userData.level = calculateLevel(userData.exp || 0);
      console.log('Данные загружены из localStorage:', parsed);
      console.log('Уровень пересчитан на основе опыта:', userData.level);
    }
  }
  
  console.log('Итоговые данные пользователя:', userData);
  
  // Принудительно обновляем отображение несколько раз для надежности
  updateCurrencyDisplay();
  setTimeout(() => updateCurrencyDisplay(), 100);
  setTimeout(() => updateCurrencyDisplay(), 500);
}

// Функция для сохранения истории квеста
async function saveQuestHistory(questId, questName, difficulty, mulacoinEarned, experienceEarned) {
  console.log('Сохранение истории квеста:', { questId, questName, difficulty, mulacoinEarned, experienceEarned });
  console.log('Supabase доступен:', !!supabase);
  console.log('Telegram ID:', userData.telegramId);
  
  if (supabase && userData.telegramId) {
    try {
      const questData = {
        user_id: userData.telegramId,
        quest_id: questId,
        quest_name: questName,
        difficulty: difficulty,
        mulacoin_earned: mulacoinEarned,
        experience_earned: experienceEarned
        // completed_at автоматически устанавливается в now() по умолчанию
      };
      
      console.log('Данные квеста для сохранения:', questData);
      
      const { data, error } = await supabase
        .from('quest_history')
        .insert(questData)
        .select();
      
      if (error) {
        console.error('Ошибка сохранения истории квеста:', error);
        toast('Ошибка сохранения истории квеста', 'error');
      } else {
        console.log('История квеста сохранена в Supabase:', data);
        toast('История квеста сохранена', 'success');
      }
    } catch (error) {
      console.error('Ошибка подключения к Supabase для истории квеста:', error);
      toast('Ошибка подключения к базе данных для истории квеста', 'error');
    }
  } else {
    console.error('Supabase недоступен или отсутствует Telegram ID для истории квеста');
    if (!supabase) console.log('Причина: Supabase клиент не инициализирован');
    if (!userData.telegramId) console.log('Причина: Отсутствует Telegram ID');
  }
}



function dayIndex(){ return Math.floor(Date.now() / (24*60*60*1000)); }
function variationIndex(){ return dayIndex() % VARIATIONS_PER_QUEST; }
function groupIndex(){ return dayIndex() % 2; } // 2 группы по 5 квестов



/* ====== Quests model (10 квестов) ====== */
const QUESTS = [
    { 
     id: "psychology", 
     theme: "Психология", 
     style: "neo", 
     name: "Психология заработка", 
     intro: "Используй психологические техники для успешных переговоров.", 
     description: "Веди переговоры с разными типами клиентов, применяй психологические техники и зарабатывай деньги через манипуляции.",
     type: "interactive", 
     difficulty: "medium",
     rewards: { fragments: 3, experience: 500 },
     available: true,
     url: "quests/psychology.html"
   },
  { 
    id: "world-government", 
    theme: "Стратегия", 
    style: "conspiracy", 
    name: "Мировое тайное правительство", 
    intro: "Создай мировое тайное правительство, распределяя персонажей по секторам.", 
    description: "Распредели персонажей по пяти секторам: политический, военный, экономический, исследовательский и пропагандический. Каждый персонаж имеет определенные характеристики, которые должны соответствовать своему сектору.",
    type: "strategy", 
    difficulty: "hard",
    rewards: { fragments: 5, experience: 1000 },
    available: true,
    url: "quests/world-government.html"
  },
  { 
    id: "bodylang", 
    theme: "Психология", 
    style: "neo", 
    name: "Язык тела", 
    intro: "Распознай невербальные сигналы 2D‑персонажа.", 
    description: "Анализируй выражения лица и жесты, чтобы определить эмоциональное состояние персонажа.",
    type: "analysis", 
    difficulty: "medium",
    rewards: { fragments: 2, experience: 60 },
    available: true,
    url: "quests/bodylang.html"
  },
  { 
    id: "profiling", 
    theme: "Соцсети", 
    style: "neo", 
    name: "Профайлинг аккаунта", 
    intro: "Оцени профиль и выбери черты характера.", 
    description: "Изучи социальный профиль и определи основные черты характера пользователя.",
    type: "analysis", 
    difficulty: "hard",
    rewards: { fragments: 4, experience: 100 },
    available: false,
    url: "quests/profiling.html"
  },
  { 
    id: "roi", 
    theme: "Маркетинг", 
    style: "neo", 
    name: "ROI‑калькулятор", 
    intro: "Выбери кампанию с лучшей окупаемостью.", 
    description: "Проанализируй данные маркетинговых кампаний и выбери наиболее прибыльную.",
    type: "puzzle", 
    difficulty: "medium",
    rewards: { fragments: 3, experience: 80 },
    available: false,
    url: "quests/roi.html"
  },
  { 
    id: "funnel", 
    theme: "Продажи", 
    style: "neo", 
    name: "Воронка конверсий", 
    intro: "Найди самое узкое место.", 
    description: "Исследуй воронку продаж и определи, где происходят основные потери клиентов.",
    type: "puzzle", 
    difficulty: "easy",
    rewards: { fragments: 2, experience: 45 },
    available: false,
    url: "quests/funnel.html"
  },
  { 
    id: "copy", 
    theme: "Контент", 
    style: "neo", 
    name: "A/B заголовки", 
    intro: "Выбери выигравший заголовок по метрикам.", 
    description: "Сравни варианты заголовков и выбери тот, который показал лучшие результаты в A/B тесте.",
    type: "quiz", 
    difficulty: "easy",
    rewards: { fragments: 2, experience: 40 },
    available: false,
    url: "quests/copy.html"
  },
  { 
    id: "audience", 
    theme: "Демография", 
    style: "neo", 
    name: "Анализ аудитории", 
    intro: "Изучи демографические данные.", 
    description: "Изучи демографические данные аудитории и ответь на вопросы о целевой группе.",
    type: "analysis", 
    difficulty: "medium",
    rewards: { fragments: 3, experience: 70 },
    available: false,
    url: "quests/audience.html"
  },
  { 
    id: "competitors", 
    theme: "Стратегия", 
    style: "neo", 
    name: "Анализ конкурентов", 
    intro: "Изучи конкурентную среду.", 
    description: "Изучи конкурентную среду и выбери наиболее сильного конкурента в отрасли.",
    type: "analysis", 
    difficulty: "hard",
    rewards: { fragments: 5, experience: 120 },
    available: false,
    url: "quests/competitors.html"
  },
  { 
    id: "trends", 
    theme: "Рынок", 
    style: "neo", 
    name: "Анализ трендов", 
    intro: "Изучи рыночные тренды.", 
    description: "Изучи рыночные тренды и выбери наиболее перспективное направление для инвестиций.",
    type: "analysis", 
    difficulty: "hard",
    rewards: { fragments: 4, experience: 90 },
    available: false,
    url: "quests/trends.html"
  }
];

/* ====== Subscription + Admin check ====== */
async function loadState(){
  let userId = null;
  let username = null;
  
  try{ 
    if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
      userId = String(tg.initDataUnsafe.user.id);
      username = tg.initDataUnsafe.user.username;
      console.log('✅ Telegram данные получены:', { userId, username });
    } else {
      console.log('❌ Telegram данные недоступны');
    }
  } catch(e) { 
    console.warn("TG user data fail", e); 
  }
  
  // Получаем telegram_id точно как в subscription.html
  const telegram_id = (tg && tg.initDataUnsafe && tg.initDataUnsafe.user && tg.initDataUnsafe.user.id) ? tg.initDataUnsafe.user.id : null;
  console.log('🔍 Telegram ID для проверки подписки:', telegram_id);
  
  let isSubscribed = false;
  let isAdmin = false;
  
  console.log('=== НАЧАЛО ПРОВЕРКИ ДОСТУПА ===');
  console.log('Данные пользователя:', { userId, username });
  console.log('Список админов:', ADMIN_IDS);
  
  // Проверка на администратора (по username и telegramId)
  if ((username && ADMIN_IDS.includes(username)) || (userId && ADMIN_IDS.includes(userId))) {
    isAdmin = true;
    isSubscribed = true; // Администраторы имеют доступ ко всем квестам
    console.log('✅ Пользователь является админом!');
  } else {
    console.log('❌ Пользователь не является админом');
  }
  
  // Проверка подписки через Supabase (используем логику из subscription.html)
  if(supabase && telegram_id){
    try{
      console.log('🔍 Проверяем подписку для пользователя:', telegram_id);
      
      // Проверяем таблицу admins (упрощенная логика)
      console.log('📋 Проверяем таблицу admins...');
      const { data: adminsData, error: adminsError } = await supabase
        .from('admins')
        .select("*")
        .eq('telegram_id', telegram_id.toString())
        .maybeSingle();
      
      if(!adminsError && adminsData) {
        isAdmin = true;
        isSubscribed = true;
        console.log('✅ Пользователь найден в таблице admins:', adminsData);
      } else {
        console.log('❌ Пользователь не найден в таблице admins');
      }
      
      // Проверяем таблицу subscriptions (используем логику из subscription.html)
      console.log('📋 Проверяем таблицу subscriptions...');
      console.log('🔍 Параметры запроса:');
      console.log('- telegram_id:', telegram_id);
      console.log('- telegram_id.toString():', telegram_id.toString());
      console.log('- SUPABASE_TABLE:', SUBSCRIPTIONS_TABLE);
      
      let { data: subscriptions, error } = await supabase
        .from(SUBSCRIPTIONS_TABLE)
        .select('*')
        .eq('user_id', telegram_id.toString())
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1);
      
      console.log('📊 Результат запроса:');
      console.log('- error:', error);
      console.log('- subscriptions:', subscriptions);
      console.log('- subscriptions.length:', subscriptions ? subscriptions.length : 'null');
      
      if (error) {
        console.log('❌ Ошибка при проверке подписки:', error);
      } else if (!subscriptions || subscriptions.length === 0) {
        // Fallback: проверяем записи по telegram_id на случай несовпадения колонок
        console.log('ℹ️ По user_id активная подписка не найдена. Пробуем fallback по telegram_id...');
        const fb = await supabase
          .from(SUBSCRIPTIONS_TABLE)
          .select('*')
          .eq('telegram_id', telegram_id.toString())
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1);
        if (!fb.error) {
          subscriptions = fb.data;
        } else {
          console.log('❌ Ошибка fallback-запроса по telegram_id:', fb.error);
        }
      }

      if (subscriptions && subscriptions.length > 0) {
        const subscription = subscriptions[0];
        console.log('📋 Найдена подписка:', subscription);
        
        const endDate = new Date(subscription.end_date);
        const now = new Date();
        
        console.log('📅 Сравнение дат:');
        console.log('- endDate:', endDate);
        console.log('- now:', now);
        console.log('- endDate > now:', endDate > now);
        
        // Проверяем, что подписка не истекла
        if (endDate > now) {
          isSubscribed = true;
          console.log('✅ Активная подписка найдена:', subscription);
          console.log('📅 Дата окончания:', subscription.end_date);
          console.log('📅 Текущая дата:', now.toISOString());
        } else {
          console.log('❌ Подписка истекла:', subscription.end_date);
        }
      } else {
        console.log('❌ Активная подписка не найдена');
        console.log('🔍 Возможные причины:');
        console.log('- Пользователь не найден в таблице');
        console.log('- Статус подписки не "active"');
        console.log('- Неправильный user_id');
      }
      
    } catch(e){ 
      console.error("❌ Ошибка проверки Supabase:", e); 
    }
  } else {
    console.log('❌ Supabase недоступен или userId отсутствует');
  }
  
  console.log('📊 ИТОГОВОЕ СОСТОЯНИЕ:', { userId, username, isSubscribed, isAdmin });
  console.log('=== КОНЕЦ ПРОВЕРКИ ДОСТУПА ===');
  
  // Добавляем дополнительную диагностику
  if (isSubscribed) {
    console.log('🎉 Пользователь имеет подписку!');
  } else {
    console.log('❌ Пользователь НЕ имеет подписки');
  }
  
  if (isAdmin) {
    console.log('👑 Пользователь является админом!');
  } else {
    console.log('👤 Пользователь НЕ является админом');
  }
  
  return { userId, username, isSubscribed, isAdmin };
}

/* ====== Rotation + gating ====== */
function featuredQuests(state){
  console.log('=== FEATURED QUESTS ===');
  console.log('Состояние пользователя:', state);
  console.log('Всего квестов в системе:', QUESTS.length);
  console.log('Квесты:', QUESTS.map(q => ({ id: q.id, name: q.name, available: q.available })));
  
  console.log('🔍 Проверка доступа:');
  console.log('- isSubscribed:', state.isSubscribed);
  console.log('- isAdmin:', state.isAdmin);
  console.log('- Условие (isSubscribed || isAdmin):', state.isSubscribed || state.isAdmin);
  
  if(state.isSubscribed || state.isAdmin) {
    console.log('✅ Пользователь имеет подписку или админ, возвращаем ВСЕ квесты');
    console.log('📊 Статус:', { isSubscribed: state.isSubscribed, isAdmin: state.isAdmin });
    console.log('📋 Возвращаем квестов:', QUESTS.length);
    return QUESTS;
  }
  
  // Для бесплатных пользователей показываем только первые 4 квеста
  const freeQuests = QUESTS.slice(0, 4);
  console.log('❌ Бесплатный пользователь, доступных квестов:', freeQuests.length);
  console.log('📋 Доступные квесты:', freeQuests.map(q => q.name));
  console.log('🔒 Заблокированные квесты:', QUESTS.slice(4).map(q => q.name));
  return freeQuests;
}

/* ====== Cards ====== */
function buildCards(state){
  const container = $("#quests");
  container.innerHTML = "";
  
  console.log('=== BUILD CARDS ===');
  console.log('Состояние пользователя:', state);
  console.log('Статус доступа:', { isSubscribed: state.isSubscribed, isAdmin: state.isAdmin });
  
  const list = featuredQuests(state);
  console.log('📊 Квестов для отображения:', list.length);
  console.log('📋 Список квестов:', list.map(q => q.name));
  console.log('🔍 Детали списка:');
  console.log('- Тип list:', typeof list);
  console.log('- Длина list:', list.length);
  console.log('- Первые 3 квеста:', list.slice(0, 3).map(q => q.name));
  
  list.forEach((q, index) => {
    const card = document.createElement("div");
    card.className = "card fade-in";
    card.setAttribute("data-style", q.style);
    card.style.animationDelay = `${index * 0.1}s`;
    
    card.innerHTML = `
      ${state.isAdmin ? '<div class="premium-indicator">👑 Админ доступ</div>' : ''}
      <div class="label">${q.theme}</div>
      <h3>${q.name}</h3>
      <div class="description">${q.description}</div>
      <div class="meta">
        <div class="tag ${q.difficulty}">${getDifficultyText(q.difficulty)}</div>
      <div class="tag">Вариация #${variationIndex()+1}/10</div>
      </div>
      <div class="cta">
        <button class="btn primary start">Начать квест</button>
        <button class="btn ghost details">Подробнее</button>
      </div>
    `;
    
    card.querySelector(".start").addEventListener("click", ()=>startQuest(q, state));
    card.querySelector(".details").addEventListener("click", ()=>{
      showQuestDetails(q, state);
    });
    
    container.appendChild(card);
  });

  // Показываем заблокированные квесты для бесплатных пользователей (но не для админов)
  if(!state.isSubscribed && !state.isAdmin){
    const lockedQuests = QUESTS.slice(4); // Квесты с 5-го и далее
    lockedQuests.forEach((q, index) => {
      const card = document.createElement("div");
      card.className = "card locked fade-in";
      card.setAttribute("data-style", q.style);
      card.style.animationDelay = `${(list.length + index) * 0.1}s`;
      
      card.innerHTML = `
        <div class="lock">🔒 Требуется подписка</div>
        <div class="label">${q.theme}</div>
        <h3>${q.name}</h3>
        <div class="description">${q.description}</div>
        <div class="tag ${q.difficulty}">${getDifficultyText(q.difficulty)}</div>
        <div class="cta">
          <button class="btn ghost locked-access-btn">Получить подписку</button>
        </div>
      `;
      
      container.appendChild(card);
    });
    
    // Добавляем обработчики для заблокированных квестов
    document.querySelectorAll('.locked-access-btn').forEach(btn => {
      btn.addEventListener('click', showSubscriptionPrompt);
    });
  }
}

function getDifficultyText(difficulty) {
  const texts = {
    easy: "Легкий",
    medium: "Средний", 
    hard: "Сложный"
  };
  return texts[difficulty] || difficulty;
}

function showQuestDetails(q, state) {
  const modal = $("#modal");
  const modalBody = $("#modalBody");
  
  modalBody.innerHTML = `
    <div class="questIntro">
      <h3>${q.name}</h3>
      <p>${q.intro}</p>
    </div>
    <div class="questBody">
      <div class="banner">
        <strong>Описание:</strong> ${q.description}
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
        <div class="glass" style="padding: 12px; text-align: center;">
          <div style="font-size: 12px; color: var(--text-muted);">Сложность</div>
          <div style="font-weight: 600; color: var(--glow1);">${getDifficultyText(q.difficulty)}</div>
        </div>
        <div class="glass" style="padding: 12px; text-align: center;">
          <div style="font-size: 12px; color: var(--text-muted);">Фрагменты</div>
          <div style="font-weight: 600; color: var(--accent);">+${q.rewards.fragments}</div>
        </div>
        <div class="glass" style="padding: 12px; text-align: center;">
          <div style="font-size: 12px; color: var(--text-muted);">Опыт</div>
          <div style="font-weight: 600; color: var(--glow2);">+${q.rewards.experience}</div>
        </div>
      </div>
      ${!state.isSubscribed && !state.isAdmin ? `
        <div class="banner warning">
          <strong>💡 Подсказка:</strong> Подписчики получают доступ ко всем квестам и дополнительные награды!
        </div>
      ` : ''}
    </div>
    <div class="questActions">
      <button class="btn primary" id="startQuestBtn">Начать квест</button>
      <button class="btn ghost" id="closeModalBtn">Закрыть</button>
    </div>
  `;
  
  modal.classList.add("show");
  
  // Добавляем обработчики событий для кнопок в модальном окне
  const startQuestBtn = modal.querySelector("#startQuestBtn");
  const closeModalBtn = modal.querySelector("#closeModalBtn");
  
  if (startQuestBtn) {
    startQuestBtn.addEventListener("click", () => startQuest(q, state));
  }
  
  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", closeModal);
  }
}

function showSubscriptionPrompt() {
  const modal = $("#modal");
  const modalBody = $("#modalBody");
  
  modalBody.innerHTML = `
    <div class="questIntro">
      <h3>🔒 Доступ ограничен</h3>
      <p>Этот квест доступен только для подписчиков</p>
      </div>
    <div class="questBody">
      <div class="banner success">
        <strong>Преимущества подписки:</strong>
        <ul style="margin: 8px 0; padding-left: 20px;">
          <li>Доступ ко всем 10 квестам</li>
          <li>Дополнительные награды</li>
          <li>Новые вариации каждый день</li>
          <li>Приоритетная поддержка</li>
        </ul>
      </div>
    </div>
    <div class="questActions">
      <button class="btn primary" id="openSubscriptionBtn">Оформить подписку</button>
      <button class="btn ghost" id="closeSubscriptionBtn">Позже</button>
    </div>
  `;
  
  modal.classList.add("show");
  
  // Добавляем обработчики событий для кнопок подписки
  const openSubscriptionBtn = modal.querySelector("#openSubscriptionBtn");
  const closeSubscriptionBtn = modal.querySelector("#closeSubscriptionBtn");
  
  if (openSubscriptionBtn) {
    openSubscriptionBtn.addEventListener("click", openSubscription);
  }
  
  if (closeSubscriptionBtn) {
    closeSubscriptionBtn.addEventListener("click", closeModal);
  }
}

function openSubscription() {
  // Используем window.location.href вместо tg.openLink для открытия внутри Mini App
  window.location.href = PAYMENT_URL;
  closeModal();
}

/* ====== Start quest ====== */
function startQuest(q, state) {
  const questId = typeof q === 'string' ? q : q.id;
  const quest = QUESTS.find(q => q.id === questId);
  
  console.log('startQuest вызвана:', { questId, quest, state });
  
  if (!quest) {
    toast("Квест не найден", "error");
    return;
  }
  
  // Проверяем доступ к квесту
  const questIndex = QUESTS.findIndex(q => q.id === questId);
  console.log('Проверка доступа:', { 
    isSubscribed: state.isSubscribed, 
    isAdmin: state.isAdmin, 
    questIndex: questIndex,
    questAvailable: questIndex < 5 || state.isSubscribed || state.isAdmin
  });
  
  if (!state.isSubscribed && !state.isAdmin && questIndex >= 4) {
    console.log('Доступ запрещен, показываем промпт подписки');
    showSubscriptionPrompt();
    return;
  }
  
  console.log('Доступ разрешен, открываем квест');
  
  // Открываем квест внутри Mini App
  const questUrl = `./quests/${questId}.html`;
  
  // Используем window.location.href для навигации внутри Mini App
  // tg.openLink открывает в браузере, а нам нужно остаться в Mini App
  window.location.href = questUrl;
}

/* ====== Modal functions ====== */
function closeModal() {
  const modal = $("#modal");
  modal.classList.remove("show");
}

$("#modalClose").addEventListener("click", closeModal);

// Закрытие модала по клику вне его
$("#modal").addEventListener("click", (e) => {
  if (e.target.id === "modal") {
    closeModal();
  }
});

/* ====== Promo system ====== */
function recordDayVisit(){
  const key="qh_days";
  const d = String(dayIndex());
  let set=new Set((localStorage.getItem(key)||"").split(",").filter(Boolean));
  set.add(d);
  localStorage.setItem(key, Array.from(set).join(","));
  return set.size;
}

async function maybeOfferPromo(state){
  if(state.isSubscribed || state.isAdmin) return;
  const days = recordDayVisit();
  if(days>=10){
    const claim = document.createElement("div");
    claim.className="glass success-animation";
    claim.style.margin="16px";
    claim.style.padding="20px";
    claim.innerHTML = `
      <div style="text-align: center;">
        <div style="font-size: 24px; margin-bottom: 8px;">🎉</div>
        <h3 style="margin-bottom: 8px;">Поздравляем!</h3>
        <p>Ты открыл все квесты за 10 дней. Забери промокод на -50% (действует 60 дней).</p>
      </div>
    `;
    const btn = document.createElement("button"); 
    btn.className="btn primary"; 
    btn.textContent="Получить промокод";
    btn.style.marginTop = "12px";
    btn.onclick = async ()=>{
      const code = genCode(state.userId);
      await savePromo(code, state.userId);
      const box = document.createElement("div"); 
      box.className="banner success";
      box.innerHTML = `
        <strong>Промокод: ${code}</strong><br>
        Действует 60 дней. Напиши администратору 
        <a href="https://t.me/${ADMIN_USERNAME}" target="_blank" style="color: var(--accent);">@${ADMIN_USERNAME}</a>
      `;
      claim.appendChild(box);
    };
    claim.appendChild(btn);
    $(".app").insertAdjacentElement("afterbegin", claim);
  }
}

function genCode(uid){
  const rand = Math.random().toString(36).slice(2,8).toUpperCase();
  return ("QH-"+(uid||"GUEST").slice(-4)+"-"+rand).replace(/[^A-Z0-9\-]/g,"");
}

async function savePromo(code, uid){
  if(!supabase){ 
    toast("Промокод: "+code, "success"); 
    return true; 
  }
  const expires = new Date(Date.now()+60*24*60*60*1000).toISOString();
  const { data, error } = await supabase.from(PROMOCODES_TABLE).insert({ 
    code, 
    tg_id: uid, 
    status:"unused", 
    issued_at: new Date().toISOString(), 
    expires_at: expires 
  });
  if(error){ 
    console.warn(error); 
    toast("Сохранение промокода не удалось, но код: "+code, "warning"); 
    return false; 
  }
  toast("Промокод сохранён!", "success");
  return true;
}

// Функция для проверки, является ли пользователь админом
function isAdmin() {
  if (!userData.telegramId) return false;
  
  const userId = userData.telegramId.toString();
  const username = userData.username || '';
  
  const isAdminUser = ADMIN_IDS.includes(userId) || ADMIN_IDS.includes(username);
  
  console.log('🔍 Проверка админа:', { userId, username, isAdminUser, ADMIN_IDS });
  
  return isAdminUser;
}



/* ====== Header buttons ====== */
$("#btnSubscribe").addEventListener("click", ()=>{
  openSubscription();
});

$("#btnHistory").addEventListener("click", ()=>{ 
  showHistory();
});



// Обработчик клика по уровню
$("#levelDisplay").addEventListener("click", ()=>{
  showLevelInfo();
});

async function showHistory() {
  const modal = $("#modal");
  const modalBody = $("#modalBody");
  
  // Проверяем статус подписки
  let subscriptionStatus = 'Не проверена';
  let subscriptionDetails = null;
  
  if (supabase && userData.telegramId) {
    try {
      console.log('🔍 Проверяем подписку для истории...');
      const { data: subscriptions, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userData.telegramId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) {
        console.log('❌ Ошибка при проверке подписки:', error);
        subscriptionStatus = 'Ошибка проверки';
      } else if (subscriptions && subscriptions.length > 0) {
        const subscription = subscriptions[0];
        const endDate = new Date(subscription.end_date);
        const now = new Date();
        
        if (endDate > now) {
          subscriptionStatus = 'Активна';
          subscriptionDetails = subscription;
          console.log('✅ Активная подписка найдена:', subscription);
        } else {
          subscriptionStatus = 'Истекла';
          subscriptionDetails = subscription;
          console.log('❌ Подписка истекла:', subscription.end_date);
        }
      } else {
        subscriptionStatus = 'Не найдена';
        console.log('❌ Активная подписка не найдена');
      }
    } catch (error) {
      console.error('❌ Ошибка при проверке подписки:', error);
      subscriptionStatus = 'Ошибка';
    }
  } else {
    subscriptionStatus = 'Нет данных';
    console.log('❌ Supabase недоступен или нет Telegram ID');
  }
  
  // Загружаем промокоды пользователя
  let promocodes = [];
  if (supabase && userData.telegramId) {
    try {
      const { data, error } = await supabase
        .from('promocodes')
        .select('*')
        .eq('issued_to', userData.telegramId)
        .order('issued_at', { ascending: false });
      
      if (!error && data) {
        promocodes = data;
        console.log('Загружены промокоды:', promocodes);
      } else {
        console.error('Ошибка загрузки промокодов:', error);
      }
    } catch (error) {
      console.error('Ошибка при загрузке промокодов:', error);
    }
  }
  

  
  modalBody.innerHTML = `
    <div style="text-align: center; padding: 20px;">
      <div style="font-size: 48px; margin-bottom: 16px;">📊</div>
      <h3 style="margin-bottom: 16px;">История прохождения</h3>
      <p style="color: var(--text-muted); margin-bottom: 20px;">
        Ваша статистика и достижения
      </p>
      <div style="background: var(--glass); border-radius: var(--radius-sm); padding: 16px; margin: 16px 0;">
        <div style="font-size: 14px; color: var(--text-muted); margin-bottom: 8px;">Валюта и опыт</div>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
          <div style="text-align: center;">
            <div style="font-size: 24px; font-weight: 700; color: var(--glow1);">${userData.mulacoin}</div>
            <div style="font-size: 12px; color: var(--text-muted);">Mulacoin</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 24px; font-weight: 700; color: var(--glow2);">${userData.exp}</div>
            <div style="font-size: 12px; color: var(--text-muted);">Опыт</div>
          </div>
        </div>
      </div>
      <div style="background: var(--glass); border-radius: var(--radius-sm); padding: 16px; margin: 16px 0;">
        <div style="font-size: 14px; color: var(--text-muted); margin-bottom: 8px;">Уровень и прогресс</div>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
          <div style="text-align: center;">
            <div style="font-size: 24px; font-weight: 700; color: var(--accent);">${userData.level}</div>
            <div style="font-size: 12px; color: var(--text-muted);">Уровень</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 24px; font-weight: 700; color: var(--success);">${Math.min(userData.level, 5)}</div>
            <div style="font-size: 12px; color: var(--text-muted);">Бонус mulacoin</div>
          </div>
        </div>
      </div>
      <div style="background: var(--glass); border-radius: var(--radius-sm); padding: 16px; margin: 16px 0;">
        <div style="font-size: 14px; color: var(--text-muted); margin-bottom: 8px;">Промокоды (${promocodes.length})</div>
        ${promocodes.length > 0 ? `
          <div style="max-height: 200px; overflow-y: auto; margin: 8px 0;">
            ${promocodes.map(promo => `
              <div style="background: var(--bg1); border-radius: 4px; padding: 8px; margin: 4px 0; cursor: pointer;" 
                   onclick="showPromoDetails('${promo.code}', '${promo.type}', '${promo.value}', '${promo.expires_at}', '${promo.status}')">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-weight: 600; color: var(--accent);">${promo.code}</span>
                  <span style="font-size: 12px; color: ${promo.status === 'used' ? 'var(--error)' : 'var(--success)'};">
                    ${promo.status === 'used' ? 'Использован' : 'Активен'}
                  </span>
                </div>
                <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">
                  ${getPromoTypeText(promo.type)} - ${promo.value}${promo.type === 'discount' ? '₽' : ' дней'}
                </div>
              </div>
            `).join('')}
          </div>
        ` : `
          <p style="font-size: 12px; color: var(--text-muted);">
            У вас пока нет промокодов.
          </p>
        `}
      </div>

      <div style="background: var(--glass); border-radius: var(--radius-sm); padding: 16px; margin: 16px 0;">
        <div style="font-size: 14px; color: var(--text-muted); margin-bottom: 8px;">Статус подписки</div>
        <div style="display: grid; grid-template-columns: 1fr; gap: 8px; margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>Статус:</span>
            <span style="color: ${subscriptionStatus === 'Активна' ? 'var(--success)' : subscriptionStatus === 'Истекла' ? 'var(--warning)' : 'var(--error)'}; font-weight: 600;">
              ${subscriptionStatus === 'Активна' ? '✅ Активна' : subscriptionStatus === 'Истекла' ? '⚠️ Истекла' : subscriptionStatus === 'Не найдена' ? '❌ Не найдена' : subscriptionStatus === 'Ошибка проверки' ? '❌ Ошибка' : subscriptionStatus === 'Нет данных' ? '❌ Нет данных' : '❌ Не проверена'}
            </span>
          </div>
          ${subscriptionDetails ? `
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span>Тариф:</span>
              <span style="color: var(--text-muted); font-weight: 600;">
                ${subscriptionDetails.tariff || 'Не указан'}
              </span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span>Дата окончания:</span>
              <span style="color: var(--text-muted); font-weight: 600;">
                ${new Date(subscriptionDetails.end_date).toLocaleDateString()}
              </span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span>User ID в БД:</span>
              <span style="color: var(--text-muted); font-weight: 600;">
                ${subscriptionDetails.user_id || 'Не указан'}
              </span>
            </div>
          ` : ''}
        </div>
      </div>
      <div style="background: var(--glass); border-radius: var(--radius-sm); padding: 16px; margin: 16px 0;">
        <div style="font-size: 14px; color: var(--text-muted); margin-bottom: 8px;">Техническая информация</div>
        <div style="display: grid; grid-template-columns: 1fr; gap: 8px; margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>Supabase:</span>
            <span style="color: ${supabase ? 'var(--success)' : 'var(--error)'}; font-weight: 600;">
              ${supabase ? '✅ Подключен' : '❌ Не подключен'}
            </span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>Telegram ID:</span>
            <span style="color: var(--text-muted); font-weight: 600;">
              ${userData.telegramId || 'Не получен'}
            </span>
          </div>
        </div>
        <button class="btn ghost" onclick="testSupabaseConnection()" style="width: 100%; margin-top: 8px;">
          🔧 Тест подключения
        </button>
        <button class="btn ghost" onclick="forceSaveData()" style="width: 100%; margin-top: 8px;">
          💾 Принудительное сохранение
        </button>
      </div>
      <button class="btn primary" onclick="closeModal()">Закрыть</button>
    </div>
  `;
  
  modal.classList.add("show");
}

// Функция для получения текста типа промокода
function getPromoTypeText(type) {
  const types = {
    'subscription': 'Подписка',
    'discount': 'Скидка',
    'frod_course': 'Курс Фрода'
  };
  return types[type] || type;
}

// Функция для отображения деталей промокода
function showPromoDetails(code, type, value, expiresAt, status) {
  const modal = $("#modal");
  const modalBody = $("#modalBody");
  
  const expiresDate = new Date(expiresAt);
  const isExpired = expiresDate < new Date();
  const statusText = status === 'used' ? 'Использован' : (isExpired ? 'Истек' : 'Активен');
  const statusColor = status === 'used' ? 'var(--error)' : (isExpired ? 'var(--warning)' : 'var(--success)');
  
  modalBody.innerHTML = `
    <div style="text-align: center; padding: 20px;">
      <div style="font-size: 48px; margin-bottom: 16px;">🎫</div>
      <h3 style="margin-bottom: 16px;">Промокод: ${code}</h3>
      <div style="background: var(--glass); border-radius: var(--radius-sm); padding: 16px; margin: 16px 0;">
        <div style="font-size: 14px; color: var(--text-muted); margin-bottom: 8px;">Информация о промокоде</div>
        <div style="display: grid; grid-template-columns: 1fr; gap: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>Тип:</span>
            <span style="font-weight: 600; color: var(--accent);">${getPromoTypeText(type)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>Значение:</span>
            <span style="font-weight: 600; color: var(--glow1);">${value}${type === 'discount' ? '₽' : ' дней'}</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>Статус:</span>
            <span style="font-weight: 600; color: ${statusColor};">${statusText}</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>Действует до:</span>
            <span style="font-weight: 600; color: var(--text-muted);">${expiresDate.toLocaleDateString()}</span>
          </div>
        </div>
      </div>
      ${status === 'used' || isExpired ? `
        <div style="background: var(--glass); border-radius: var(--radius-sm); padding: 16px; margin: 16px 0;">
          <div style="font-size: 14px; color: var(--text-muted);">
            ${status === 'used' ? 'Этот промокод уже был использован.' : 'Этот промокод истек и больше не действителен.'}
          </div>
        </div>
      ` : `
        <div style="background: var(--glass); border-radius: var(--radius-sm); padding: 16px; margin: 16px 0;">
          <div style="font-size: 14px; color: var(--text-muted); margin-bottom: 8px;">Использование промокода</div>
          <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 12px;">
            Скопируйте промокод и отправьте администратору для активации
          </p>
          <button class="btn primary" onclick="copyToClipboard('${code}')" style="width: 100%;">
            📋 Скопировать промокод
          </button>
        </div>
      `}
      <button class="btn ghost" onclick="closeModal()">Закрыть</button>
    </div>
  `;
  
  modal.classList.add("show");
}

// Функция для копирования в буфер обмена
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    toast('Промокод скопирован в буфер обмена!', 'success');
  }).catch(() => {
    toast('Ошибка копирования', 'error');
  });
}

function showLevelInfo() {
  const modal = $("#modal");
  const modalBody = $("#modalBody");
  
  const expForNext = getExpForNextLevel(userData.level);
  const currentLevelExp = userData.level > 1 ? LEVEL_EXP[userData.level - 2] : 0;
  const progress = userData.exp - currentLevelExp;
  const total = expForNext - currentLevelExp;
  const percentage = Math.round((progress / total) * 100);
  
  modalBody.innerHTML = `
    <div style="text-align: center; padding: 20px;">
      <div style="font-size: 48px; margin-bottom: 16px;">⭐</div>
      <h3 style="margin-bottom: 16px;">Уровень ${userData.level}</h3>
      <div style="background: var(--glass); border-radius: var(--radius-sm); padding: 16px; margin: 16px 0;">
        <div style="font-size: 14px; color: var(--text-muted); margin-bottom: 8px;">Прогресс до следующего уровня</div>
        <div style="background: var(--bg1); border-radius: 4px; height: 8px; margin: 8px 0; overflow: hidden;">
          <div style="background: linear-gradient(90deg, var(--glow1), var(--glow2)); height: 100%; width: ${percentage}%; transition: width 0.5s ease;"></div>
        </div>
        <div style="font-size: 16px; font-weight: 700; color: var(--glow1);">${progress} / ${total} (${percentage}%)</div>
      </div>
      <div style="background: var(--glass); border-radius: var(--radius-sm); padding: 16px; margin: 16px 0;">
        <div style="font-size: 14px; color: var(--text-muted); margin-bottom: 8px;">Бонусы за уровень</div>
        <div style="display: grid; grid-template-columns: 1fr; gap: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>Дополнительные mulacoin:</span>
            <span style="color: var(--glow1); font-weight: 600;">+${Math.min(userData.level, 5)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>Шанс редких призов:</span>
            <span style="color: var(--glow2); font-weight: 600;">+${Math.min(userData.level * 2, 20)}%</span>
          </div>
        </div>
      </div>
      <button class="btn primary" onclick="closeModal()">Закрыть</button>
    </div>
  `;
  
  modal.classList.add("show");
}

// Функция для тестирования подключения к Supabase
async function testSupabaseConnection() {
  console.log('=== ТЕСТ ПОДКЛЮЧЕНИЯ К SUPABASE ===');
  console.log('Supabase доступен:', !!supabase);
  console.log('Telegram ID:', userData.telegramId);
  
  if (!supabase) {
    toast('Supabase не инициализирован', 'error');
    console.error('Supabase не инициализирован');
    return;
  }
  
  try {
    toast('Тестирование подключения...', 'info');
    
    // Тестируем подключение к таблице subscriptions (которая точно существует)
    console.log('Тестируем подключение к таблице subscriptions...');
    const { data: subData, error: subError } = await supabase.from('subscriptions').select('*').limit(1);
    
    if (subError) {
      console.error('Ошибка подключения к subscriptions:', subError);
      toast('Ошибка подключения к базе данных', 'error');
      return;
    }
    
    console.log('✅ Подключение к subscriptions успешно:', subData);
    
    // Тестируем подключение к таблице promocodes
    console.log('Тестируем подключение к таблице promocodes...');
    const { data: promoData, error: promoError } = await supabase.from('promocodes').select('*').limit(1);
    
    if (promoError) {
      console.error('Ошибка подключения к promocodes:', promoError);
      toast('Ошибка подключения к promocodes', 'error');
      return;
    }
    
    console.log('✅ Подключение к promocodes успешно:', promoData);
    
    // Тестируем подключение к таблице bot_user
    console.log('Тестируем подключение к таблице bot_user...');
    const { data: userData, error: userError } = await supabase.from('bot_user').select('*').limit(1);
    
    if (userError) {
      console.error('Ошибка подключения к bot_user:', userError);
      toast('Ошибка подключения к bot_user', 'error');
      return;
    }
    
    console.log('✅ Подключение к bot_user успешно:', userData);
    
    // Все тесты прошли успешно
    toast('✅ Подключение к базе данных работает', 'success');
    console.log('=== ВСЕ ТЕСТЫ ПОДКЛЮЧЕНИЯ ПРОШЛИ УСПЕШНО ===');
    
    // Пробуем сохранить тестовые данные
    if (userData.telegramId) {
      console.log('Пробуем сохранить тестовые данные...');
      await saveUserData();
    } else {
      console.log('Telegram ID не получен, пропускаем сохранение');
    }
  } catch (error) {
    console.error('Ошибка тестирования:', error);
    toast('Ошибка подключения к базе данных', 'error');
  }
}

// Функция для принудительного сохранения данных
async function forceSaveData() {
  console.log('=== ПРИНУДИТЕЛЬНОЕ СОХРАНЕНИЕ ===');
  console.log('Текущие данные:', userData);
  console.log('Supabase доступен:', !!supabase);
  console.log('Telegram ID:', userData.telegramId);
  
  if (!userData.telegramId) {
    toast('Telegram ID не получен', 'error');
    console.error('Telegram ID не получен');
    return;
  }
  
  if (!supabase) {
    toast('Supabase не инициализирован', 'error');
    console.error('Supabase не инициализирован');
    return;
  }
  
  try {
    // Добавляем тестовые награды
    userData.mulacoin += 10;
    userData.exp += 50;
    userData.level = calculateLevel(userData.exp);
    
    console.log('Данные после добавления наград:', userData);
    
    // Сохраняем данные
    await saveUserData();
    
    // Сохраняем тестовую историю квеста
    await saveQuestHistory('test', 'Тестовый квест', 'easy', 10, 50);
    

    
    toast('Тестовые данные сохранены', 'success');
    console.log('=== ПРИНУДИТЕЛЬНОЕ СОХРАНЕНИЕ ЗАВЕРШЕНО ===');
  } catch (error) {
    console.error('Ошибка принудительного сохранения:', error);
    toast('Ошибка сохранения тестовых данных', 'error');
  }
}

/* ====== Init ====== */
loadState().then(async state=>{
  console.log('=== ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ ===');
  console.log('Полученное состояние:', state);
  console.log('Проверка состояния:');
  console.log('- state.isSubscribed:', state.isSubscribed);
  console.log('- state.isAdmin:', state.isAdmin);
  console.log('- state.userId:', state.userId);
  console.log('- state.username:', state.username);
  
  buildCards(state);
  maybeOfferPromo(state);
  
  // Загружаем данные пользователя
  await loadUserData(state.userId);
  
  // Обновляем отображение валюты после загрузки данных
  updateCurrencyDisplay();
  

  
  console.log('=== ИНИЦИАЛИЗАЦИЯ ЗАВЕРШЕНА ===');
});

// Глобальные функции для доступа из других файлов
window.questSystem = {
  toast,
  closeModal,
  startQuest,
  loadState
};

// Делаем addRewards доступной глобально для квестов
window.addRewards = addRewards;

/* ====== Mystery Case (daily) ====== */
function getCaseStateKey(){
  const uid = (tg && tg.initDataUnsafe && tg.initDataUnsafe.user && tg.initDataUnsafe.user.id) ? tg.initDataUnsafe.user.id : 'guest';
  const day = Math.floor(Date.now() / (24*60*60*1000));
  return `mystery_case_${uid}_${day}`;
}

function isCaseAvailable(){
  return !localStorage.getItem(getCaseStateKey());
}

function markCaseUsed(){
  localStorage.setItem(getCaseStateKey(), '1');
}

function nextMidnightMs(){
  const now = new Date();
  const next = new Date(now);
  next.setHours(24,0,0,0);
  return next - now;
}

function formatCountdown(ms){
  const total = Math.max(0, Math.floor(ms/1000));
  const h = String(Math.floor(total/3600)).padStart(2,'0');
  const m = String(Math.floor((total%3600)/60)).padStart(2,'0');
  const s = String(total%60).padStart(2,'0');
  return `${h}:${m}:${s}`;
}

function initMysteryCase(){
  const btn = document.getElementById('mysteryCaseBtn');
  const imgOpen = document.getElementById('caseImageOpen');
  const imgClosed = document.getElementById('caseImageClosed');
  const caseModal = document.getElementById('caseModal');
  const caseModalClose = document.getElementById('caseModalClose');
  const countdown = document.getElementById('caseCountdown');

  if(!btn || !imgOpen || !imgClosed) return;

  const available = isCaseAvailable();
  imgOpen.style.display = available ? 'block' : 'none';
  imgClosed.style.display = available ? 'none' : 'block';

  btn.addEventListener('click', ()=>{
    if(isCaseAvailable()){
      // Переход на страницу рулетки/кейса
      window.location.href = './rulette.html';
    } else {
      // Показ модала с таймером
      if(caseModal){ caseModal.classList.add('show'); }
      const update = ()=>{ if(countdown){ countdown.textContent = formatCountdown(nextMidnightMs()); } };
      update();
      const interval = setInterval(update, 1000);
      const onClose = ()=>{ caseModal.classList.remove('show'); clearInterval(interval); };
      if(caseModalClose){ caseModalClose.onclick = onClose; }
    }
  });

  // Делаем функцию доступной глобально для страницы рулетки
  window.markCaseUsed = markCaseUsed;
}
