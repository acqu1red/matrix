
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

// Система Колеса Миллионера - призы богатства и успеха
const ROULETTE_PRIZES = [
  { id: "subscription", name: "💰 Мастер-курс Миллионера", icon: "👑", count: 2, probability: 0.02, color: "#FFD700" },
  { id: "discount500", name: "💳 Бонус 500₽", icon: "💰", count: 1, probability: 0.05, color: "#FF6B6B" },
  { id: "discount100", name: "💵 Деньги 100₽", icon: "💵", count: 2, probability: 0.08, color: "#4ECDC4" },
  { id: "mulacoin100", name: "100 GOLDCOIN", icon: "🪙", count: 4, probability: 0.15, color: "#FFEAA7" },
  { id: "mulacoin50", name: "50 GOLDCOIN", icon: "🪙", count: 5, probability: 0.18, color: "#DDA0DD" },
  { id: "spin1", name: "🎯 Доп. Шанс", icon: "🎰", count: 6, probability: 0.30, color: "#FFB6C1" },
  { id: "quest24h", name: "🚀 Бонус мотивация", icon: "🎯", count: 3, probability: 0.15, color: "#F7DC6F" },
  { id: "frodCourse", name: "🎆 Суперприз!", icon: "📚", count: 1, probability: 0.0001, color: "#6C5CE7" }
];

// Система уровней богатства и успеха
const WEALTH_LEVELS = [
  { exp: 100, title: "Новичок в мире денег", icon: "💰" },
  { exp: 300, title: "Начинающий инвестор", icon: "📈" },
  { exp: 600, title: "Умный стратег", icon: "🧠" },
  { exp: 1000, title: "Опытный трейдер", icon: "💹" },
  { exp: 1500, title: "Бизнес-эксперт", icon: "🏢" },
  { exp: 2100, title: "Финансовый гений", icon: "🎯" },
  { exp: 2800, title: "Предприниматель", icon: "🚀" },
  { exp: 3600, title: "Мастер капитала", icon: "💎" },
  { exp: 4500, title: "Король инвестиций", icon: "👑" },
  { exp: 5500, title: "Магнат богатства", icon: "🏆" },
  { exp: 6600, title: "Мультимиллионер", icon: "💸" },
  { exp: 7800, title: "Финансовая империя", icon: "🏛️" },
  { exp: 9100, title: "Повелитель денег", icon: "🌟" },
  { exp: 10500, title: "Миллиардер", icon: "🔥" },
  { exp: 12000, title: "Легенда успеха", icon: "⚡" },
  { exp: 13600, title: "Гуру богатства", icon: "🧿" },
  { exp: 15300, title: "Мастер Вселенной", icon: "🌌" },
  { exp: 17100, title: "Бог финансов", icon: "🔱" },
  { exp: 19000, title: "Повелитель Фортуны", icon: "🎆" },
  { exp: 21000, title: "Абсолютный Миллиардер", icon: "💫" }
];

// Система накопления богатства за обучение
const WEALTH_REWARDS = {
  easy: { goldcoin: 2, exp: 200, wealthPoints: 1, motivation: "💰 Первые шаги к богатству!" },
  medium: { goldcoin: 5, exp: 600, wealthPoints: 3, motivation: "🚀 Ваш капитал растет!" },
  hard: { goldcoin: 10, exp: 1200, wealthPoints: 5, motivation: "💎 Мышление миллионера активировано!" }
};

const GOLDEN_SPIN_COST = 13; // Стоимость золотого спина для миллионеров

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
        // Telegram ID получен
      }
    }
  }catch(e){ /* TG init fail */ }
}

/* ====== Case Navigation ====== */
function setupCaseNavigation() {
  const caseButton = document.getElementById('mysteryCaseBtn');
  const caseImage = document.getElementById('caseImage');
  
  if (caseButton && caseImage) {
    // Preload and set initial image
    const img = new Image();
    img.onload = function() {
      caseImage.src = this.src;
      caseImage.style.opacity = '1';
    };
    img.src = './assets/rulette/case_open.png';
    
    // Set loading state
    caseImage.style.opacity = '0.5';
    caseImage.style.transition = 'opacity 0.3s ease';
    
    // Add click handler for case transition
    caseButton.addEventListener('click', () => {
      openCaseWithTransition();
    });
  }
}

function openCaseWithTransition() {
  // Create transition overlay
  const transition = document.createElement('div');
  transition.className = 'page-transition active';
  transition.innerHTML = `
    <div class="transition-content">
      <div class="transition-spinner"></div>
      <div class="transition-text">Открываем тайный кейс...</div>
    </div>
  `;
  
  document.body.appendChild(transition);
  
  // Navigate to case page after transition
  setTimeout(() => {
    window.location.href = './case.html';
  }, 1000);
}



// Инициализация после загрузки страницы
document.addEventListener('DOMContentLoaded', function() {
  // console.log('DOM загружен, инициализация системы богатства...');
  initTG();
  setupCaseNavigation();

  
  // Инициализируем Supabase и загружаем данные
  setTimeout(async () => {
    // Убеждаемся, что Supabase инициализирован
    if (!supabase && window.supabase) {
      await initSupabase();
    }
    
    if (supabase) {
      // Supabase готов к использованию
      
      // Тестируем подключение
      try {
        const { data, error } = await supabase.from('bot_user').select('count').limit(1);
        if (error) {
          // Ошибка тестирования Supabase
          toast('Ошибка подключения к базе данных', 'error');
        } else {
          // Тест подключения к Supabase успешен
          toast('Подключение к базе данных установлено', 'success');
        }
      } catch (error) {
        // Ошибка тестирования Supabase
      }
      
      // Загружаем данные пользователя если есть Telegram ID
      if (userData.telegramId) {
        // Загружаем данные для Telegram ID
        await loadUserData(userData.telegramId);
      } else {
        // Telegram ID не получен, данные не загружены
      }
    } else {
      // Supabase не инициализирован
      toast('Ошибка инициализации базы данных', 'error');
    }
  }, 1000);
});

/* ====== Supabase ====== */
let supabase = null;

async function initSupabase() {
  try {
    if (window.supabase) {
      supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      // Supabase клиент успешно инициализирован
      
      // Проверяем подключение
      const { data, error } = await supabase.from('bot_user').select('count').limit(1);
      if (error) {
        // Ошибка подключения к Supabase
      } else {
        // Подключение к Supabase успешно
      }
    } else {
      // Supabase библиотека не загружена
    }
  } catch (error) {
    // Ошибка инициализации Supabase
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
  lastFreeSpin: null, // Добавляем отслеживание последнего бесплатного прокрута
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
  // calculateLevel: exp calculated
  return level;
}

function getExpForNextLevel(level) {
  if (level <= LEVEL_EXP.length) {
    return LEVEL_EXP[level - 1];
  }
  return LEVEL_EXP[LEVEL_EXP.length - 1] + (level - LEVEL_EXP.length) * 1000;
}

function updateCurrencyDisplay() {
  // Обновление отображения валюты
  
  // Обновляем mulacoin во всех возможных местах
  const mulacoinElements = [
    $("#mulacoinAmount"),
    $("#userMulacoin"),
    $("#currentMulacoin"),
    document.querySelector('[data-mulacoin]')
  ];
  
  const levelEl = $("#currentLevel");
  const progressEl = $("#levelProgress");
  
  // Найденные элементы mulacoin
  // Level элемент
  // Progress элемент
  
  // Обновляем все элементы с mulacoin
  mulacoinElements.forEach(el => {
    if (el) {
      el.textContent = userData.mulacoin || 0;
      // Обновлен элемент mulacoin
    }
  });
  
  if (levelEl) {
    levelEl.textContent = userData.level || 1;
    // Обновлен currentLevel
  }
  
  // Исправляем расчет прогресса уровня
  const expForNext = getExpForNextLevel(userData.level);
  const currentLevelExp = userData.level > 1 ? LEVEL_EXP[userData.level - 2] : 0;
  const progress = Math.max(0, userData.exp - currentLevelExp);
  const total = expForNext - currentLevelExp;
  
  if (progressEl) {
    progressEl.textContent = `${progress}/${total}`;
    // Обновлен levelProgress
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
  // === СТАРТ ADDREWARDS ===
  // addRewards вызвана с параметрами
  // Текущие данные пользователя
  // Supabase доступен
  // Telegram ID
  
  const oldLevel = userData.level || 1;
  const oldExp = userData.exp || 0;
  const oldMulacoin = userData.mulacoin || 0;
  
  // Обновляем данные
  userData.mulacoin = oldMulacoin + mulacoin;
  userData.exp = oldExp + exp;
  userData.level = calculateLevel(userData.exp);
  
  // console.log('Данные после обновления:', {
  //   oldLevel,
  //   newLevel: userData.level,
  //   oldExp,
  //   newExp: userData.exp,
  //   oldMulacoin,
  //   newMulacoin: userData.mulacoin
  // });
  
  // Обновляем отображение
  updateCurrencyDisplay();
  
  // Проверяем повышение уровня
  if (userData.level > oldLevel) {
    toast(`🎉 Поздравляем! Вы достигли ${userData.level} уровня!`, 'success');
  }
  
  // Сохраняем данные немедленно
  // console.log('Начинаем сохранение данных...');
  await saveUserData();
  
  // Сохраняем историю квеста если указаны параметры
  if (questId && questName && difficulty) {
    // console.log('Сохраняем историю квеста...');
    await saveQuestHistory(questId, questName, difficulty, mulacoin, exp);
  }
  
  // console.log('addRewards завершена');
}

// Система рулетки - стиль открытия кейса
function createRouletteWheel() {
  // console.log('=== СОЗДАНИЕ РУЛЕТКИ ===');
  // console.log('Текущий дизайн:', currentRouletteDesign);
  
  const items = $("#rouletteItems");
  const preview = $("#previewItems");
  const container = $(".roulette-container");
  
  if (!items) {
    // console.error('❌ Контейнер rouletteItems не найден');
    return;
  }
  
  if (!preview) {
    // console.error('❌ Контейнер previewItems не найден');
    return;
  }
  
  if (!container) {
    // console.error('❌ Контейнер roulette-container не найден');
    return;
  }
  
  // console.log('✅ Контейнеры рулетки найдены');
  
  // Обновляем класс дизайна контейнера
  container.className = `roulette-container ${currentRouletteDesign}`;
  
  items.innerHTML = '';
  preview.innerHTML = '';
  
  // Сбрасываем позицию рулетки только при создании
  rouletteCurrentPosition = 0;
  
  // Получаем призы для текущего дизайна
  const currentPrizes = ROULETTE_PRIZES_DESIGNS[currentRouletteDesign] || ROULETTE_PRIZES_DESIGNS.standard;
  
  // Создаем иконки на основе призов
  let allItems = [];
  currentPrizes.forEach(prize => {
    for (let i = 0; i < prize.count; i++) {
      allItems.push(prize);
    }
  });
  
  // console.log('Создано элементов призов:', allItems.length);
  
  // Перемешиваем иконки для разнообразия
  allItems.sort(() => Math.random() - 0.5);
  
  // Создаем БЕСКОНЕЧНУЮ ленту иконок для зацикливания
  const totalItems = allItems.length * 20; // Повторяем 20 раз для бесконечной прокрутки
  
  // console.log('Создаем', totalItems, 'элементов рулетки для зацикливания...');
  
  for (let i = 0; i < totalItems; i++) {
    const prize = allItems[i % allItems.length];
    const item = document.createElement('div');
    item.className = 'roulette-item';
    item.dataset.prize = prize.id;
    
    // Для авторского дизайна добавляем случайный поворот
    if (currentRouletteDesign === 'author') {
      const randomRotation = (Math.random() - 0.5) * 20; // от -10 до +10 градусов
      item.style.setProperty('--random-rotation', `${randomRotation}deg`);
    }
    
    // Создаем содержимое иконки
    const symbol = document.createElement('div');
    symbol.className = 'icon-symbol';
    symbol.textContent = prize.icon;
    
    const label = document.createElement('div');
    label.className = 'icon-label';
    label.textContent = prize.name;
    
    item.appendChild(symbol);
    item.appendChild(label);
    items.appendChild(item);
  }
  
  // console.log('✅ Элементы рулетки созданы:', items.children.length);
  
  // Создаем превью призов
  // console.log('Создаем превью призов...');
  currentPrizes.forEach(prize => {
    const previewItem = document.createElement('div');
    previewItem.className = 'preview-item';
    
    const name = document.createElement('span');
    name.textContent = prize.name;
    
    previewItem.appendChild(name);
    preview.appendChild(previewItem);
  });
  
  // console.log('✅ Превью призов создано:', preview.children.length);
  // console.log('=== РУЛЕТКА СОЗДАНА УСПЕШНО ===');
}

function getSectorColor(prizeId) {
  const colors = {
    subscription: 'linear-gradient(45deg, #FFD700, #FFA500)',
    discount500: 'linear-gradient(45deg, #FF6B6B, #FF8E8E)',
    discount100: 'linear-gradient(45deg, #4ECDC4, #44A08D)',
    discount50: 'linear-gradient(45deg, #A8E6CF, #7FCDCD)',
    quest24h: 'linear-gradient(45deg, #FFEAA7, #DDA0DD)',
    frodCourse: 'linear-gradient(45deg, #6C5CE7, #A29BFE)'
  };
  return colors[prizeId] || 'linear-gradient(45deg, #74B9FF, #0984E3)';
}

// Глобальная переменная для хранения текущей позиции рулетки
let rouletteCurrentPosition = 0;

// Глобальная переменная для текущего дизайна рулетки
let currentRouletteDesign = 'standard';

// Иконки призов для стандартного дизайна
const ROULETTE_PRIZES_DESIGNS = {
  standard: [
    { id: 'subscription', name: '💰 Мастер-курс', icon: '👑', count: 3, probability: 0.03 },
    { id: 'discount500', name: '💳 500₽', icon: '💎', count: 1, probability: 0.10 },
    { id: 'discount100', name: '💵 100₽', icon: '💵', count: 3, probability: 0.15 },
    { id: 'mulacoin100', name: '100 GOLDCOIN', icon: '🪙', count: 5, probability: 0.25 },
    { id: 'mulacoin50', name: '50 GOLDCOIN', icon: '🪙', count: 6, probability: 0.30 },
    { id: 'spin1', name: '🎯 +1 Шанс', icon: '🎰', count: 7, probability: 0.45 },
    { id: 'quest24h', name: '🚀 Мотивация', icon: '🎯', count: 5, probability: 0.75 },
    { id: 'frodCourse', name: '🎆 Суперприз', icon: '📚', count: 1, probability: 0.0005 }
  ]
};

function spinRoulette(isFree = false) {
  const items = $("#rouletteItems");
  const spinBtn = $("#spinRoulette");
  const buyBtn = $("#buySpin");
  
  if (!items || !spinBtn) return;
  
  // Проверяем возможность бесплатного прокрута (кроме админов)
  if (isFree && !canSpinFree() && !isAdmin()) {
    toast("Бесплатный прокрут доступен раз в день!", "error");
    return;
  }
  
  // Списываем mulacoin только если это не бесплатный прокрут и не админ
  if (!isFree && !isAdmin() && userData.mulacoin < SPIN_COST) {
    toast("Недостаточно mulacoin для прокрута рулетки!", "error");
    return;
  }
  
  if (!isFree && !isAdmin()) {
    userData.mulacoin -= SPIN_COST;
    updateCurrencyDisplay();
  } else if (isFree && !isAdmin()) {
    // Проверяем, есть ли дополнительные спины
    if (userData.freeSpins && userData.freeSpins > 0) {
      userData.freeSpins -= 1;
      toast(`🎰 Использован дополнительный спин! Осталось: ${userData.freeSpins}`, "success");
    } else {
      userData.lastFreeSpin = new Date().toISOString();
    }
    updateRouletteButton();
  } else if (isAdmin()) {
    // Администраторы крутят бесплатно и без ограничений
    toast("🎯 Администратор: бесплатный прокрут", "success");
  }
  
  saveUserData();
  
  spinBtn.disabled = true;
  buyBtn.disabled = true;
  
  // Делаем кнопки недоступными
  spinBtn.disabled = true;
  buyBtn.disabled = true;
  
  // Делаем кнопки дизайна недоступными
  document.querySelectorAll('.design-option').forEach(option => {
    option.disabled = true;
  });
  
  // Генерируем случайное расстояние для равномерной прокрутки (15 секунд)
  const baseDistance = 7500 + Math.random() * 3000; // 7500-10500px базовое расстояние для 15 секунд
  const extraDistance = Math.random() * 1500; // Дополнительное случайное расстояние
  const spinDistance = baseDistance + extraDistance;
  
  // Вычисляем новую позицию (продолжаем с текущей позиции)
  const newPosition = rouletteCurrentPosition + spinDistance;
  
  // Добавляем плавную анимацию скольжения
  items.classList.add('spinning');
  
  // Добавляем анимацию к элементам рулетки
  const rouletteItems = document.querySelectorAll('.roulette-item');
  const iconSymbols = document.querySelectorAll('.icon-symbol');
  
  rouletteItems.forEach(item => {
    item.classList.add('spinning');
  });
  
  iconSymbols.forEach(icon => {
    icon.classList.add('spinning');
  });
  
  // Применяем CSS анимацию с новой позицией (15 секунд)
  const animationDuration = '15s';
  
  items.style.transform = `translateX(-${newPosition}px)`;
  items.style.transition = `transform ${animationDuration} ease-out`;
  
  // Запускаем аудио в начале прокрутки
  const music = isFree ? document.getElementById('rouletteMusic') : document.getElementById('rouletteMusicMulacoin');
  if (music) {
    music.currentTime = 0; // Сбрасываем время воспроизведения
    music.play().catch(error => {
      // console.log('Не удалось воспроизвести музыку:', error);
    });
  }
  
  // Показываем анимацию ожидания (15 секунд)
  const waitTime = 15000;
  
  setTimeout(() => {
    // Делаем кнопки доступными
    spinBtn.disabled = false;
    buyBtn.disabled = false;
    
    // Делаем кнопки дизайна доступными
    document.querySelectorAll('.design-option').forEach(option => {
      option.disabled = false;
    });
    
    // Обновляем текущую позицию рулетки
    rouletteCurrentPosition = newPosition;
    
    // Определяем приз по позиции стрелки (центральный элемент)
    const centerPrize = determinePrizeByArrowPosition();
    
    // Останавливаем аудио после завершения прокрутки
    const music = isFree ? document.getElementById('rouletteMusic') : document.getElementById('rouletteMusicMulacoin');
    if (music) {
      music.pause();
      music.currentTime = 0;
    }
    
    // Показываем модальное окно с призом, который указывает стрелка
    showPrizeModal(centerPrize, isFree);
    
    // Плавно обновляем кнопку с анимацией
    updateRouletteButtonWithAnimation();
    
    // Убираем класс spinning, но НЕ сбрасываем позицию
    setTimeout(() => {
      items.classList.remove('spinning');
      
      // Убираем анимацию с элементов рулетки
      const rouletteItems = document.querySelectorAll('.roulette-item');
      const iconSymbols = document.querySelectorAll('.icon-symbol');
      
      rouletteItems.forEach(item => {
        item.classList.remove('spinning');
      });
      
      iconSymbols.forEach(icon => {
        icon.classList.remove('spinning');
      });
      
      // Сохраняем текущую позицию для следующего спина
      items.style.transition = 'transform 8s ease-out';
    }, 1000);
  }, waitTime);
}

function selectPrizeByProbability() {
  const rand = Math.random();
  let cumulative = 0;
  
  // Получаем призы для текущего дизайна
  const currentPrizes = ROULETTE_PRIZES_DESIGNS[currentRouletteDesign] || ROULETTE_PRIZES_DESIGNS.standard;
  
  for (const prize of currentPrizes) {
    cumulative += prize.probability;
    if (rand <= cumulative) {
      return prize;
    }
  }
  
  // Если ничего не выбрано, возвращаем самый частый приз
  return currentPrizes[4]; // quest24h
}

// Функция для определения приза по позиции стрелки
function determinePrizeByArrowPosition() {
  // console.log('Определение приза по позиции стрелки...');
  // console.log('Текущий дизайн:', currentRouletteDesign);
  
  const items = $("#rouletteItems");
  if (!items) {
    const currentPrizes = ROULETTE_PRIZES_DESIGNS[currentRouletteDesign] || ROULETTE_PRIZES_DESIGNS.standard;
    return currentPrizes[0];
  }
  
  const allItems = items.querySelectorAll('.roulette-item');
  if (allItems.length === 0) {
    const currentPrizes = ROULETTE_PRIZES_DESIGNS[currentRouletteDesign] || ROULETTE_PRIZES_DESIGNS.standard;
    return currentPrizes[0];
  }
  
  // Вычисляем позицию стрелки (центр экрана)
  const containerWidth = items.offsetWidth || 600;
  const centerX = containerWidth / 2;
  
  // Находим элемент, который находится в центре
  let centerItem = null;
  let minDistance = Infinity;
  
  allItems.forEach((item, index) => {
    const itemRect = item.getBoundingClientRect();
    const itemCenterX = itemRect.left + itemRect.width / 2;
    const distance = Math.abs(itemCenterX - centerX);
    
    if (distance < minDistance) {
      minDistance = distance;
      centerItem = item;
    }
  });
  
  if (centerItem) {
    const prizeId = centerItem.dataset.prize;
    const currentPrizes = ROULETTE_PRIZES_DESIGNS[currentRouletteDesign] || ROULETTE_PRIZES_DESIGNS.standard;
    const prize = currentPrizes.find(p => p.id === prizeId);
    if (prize) {
      // console.log('Приз по позиции стрелки:', prize.name, 'ID:', prize.id, 'Позиция:', rouletteCurrentPosition);
      return prize;
    }
  }
  
  // Fallback на случайный приз
  // console.log('Fallback на случайный приз');
  return selectPrizeByProbability();
}

async function showPrizeModal(prize, isFree = false) {
  const modal = $("#prizeModal");
  const icon = $("#prizeIcon");
  const title = $("#prizeTitle");
  const description = $("#prizeDescription");
  const content = $("#prizeContent");
  
  icon.textContent = prize.icon;
  title.textContent = "Поздравляем!";
  description.textContent = `Вы выиграли: ${prize.name}`;
  
  // Сохраняем историю рулетки
  const isAdminSpin = isAdmin();
  await saveRouletteHistory(prize.id, prize.name, isFree || isAdminSpin, isFree || isAdminSpin ? 0 : SPIN_COST);
  
  let contentHTML = '';
  
  // Обрабатываем mulacoin призы через единую систему наград
  if (prize.id.startsWith('mulacoin')) {
    const mulacoinAmount = parseInt(prize.id.replace('mulacoin', ''));
    const expAmount = Math.round(mulacoinAmount / 10); // 1 опыт за каждые 10 mulacoin
    
    // Используем единую систему наград
    await addRewards(mulacoinAmount, expAmount, 'roulette', prize.name, 'easy');
    
    contentHTML = `
      <p style="font-size: 16px; color: var(--accent); font-weight: bold;">
        +${mulacoinAmount} MULACOIN добавлено к вашему балансу!
      </p>
      <p style="font-size: 14px; color: var(--text-muted);">
        +${expAmount} опыта получено!
      </p>
      <p style="font-size: 14px; color: var(--text-muted);">
        Текущий баланс: ${userData.mulacoin} MULACOIN
      </p>
    `;
  } else if (prize.id === 'infiniteSubscription') {
    const promoCode = generatePromoCode(prize);
    
    // Даем опыт за бесконечную подписку
    await addRewards(0, 200, 'roulette', prize.name, 'easy');
    
    // Сохраняем промокод в базу данных
    await savePromocode(prize, promoCode);
    
    contentHTML = `
      <div class="promo-code" id="promoCode" onclick="copyPromoCode()">${promoCode}</div>
      <p style="font-size: 14px; color: var(--text-muted); margin: 8px 0;">
        Нажмите на промокод, чтобы скопировать
      </p>
      <p style="font-size: 14px; color: var(--text-muted);">
        +200 опыта получено!
      </p>
      <a href="https://t.me/acqu1red?text=${encodeURIComponent(getPromoMessage(prize, promoCode))}" 
         class="use-button" id="useButton" style="display: none;">
        Использовать
      </a>
    `;
  } else if (prize.id === 'subscription' || prize.id.startsWith('discount')) {
    const promoCode = generatePromoCode(prize);
    
    // Даем небольшой опыт за промокоды
    const expAmount = prize.id === 'subscription' ? 50 : 25;
    await addRewards(0, expAmount, 'roulette', prize.name, 'easy');
    
    // Сохраняем промокод в базу данных
    await savePromocode(prize, promoCode);
    
    contentHTML = `
      <div class="promo-code" id="promoCode" onclick="copyPromoCode()">${promoCode}</div>
      <p style="font-size: 14px; color: var(--text-muted); margin: 8px 0;">
        Нажмите на промокод, чтобы скопировать
      </p>
      <p style="font-size: 14px; color: var(--text-muted);">
        +${expAmount} опыта получено!
      </p>
      <a href="https://t.me/acqu1red?text=${encodeURIComponent(getPromoMessage(prize, promoCode))}" 
         class="use-button" id="useButton" style="display: none;">
        Использовать
      </a>
    `;
  } else if (prize.id === 'spin1') {
    // Даем дополнительный спин
    userData.freeSpins = (userData.freeSpins || 0) + 1;
    await addRewards(0, 20, 'roulette', prize.name, 'easy');
    
    contentHTML = `
      <p style="font-size: 16px; color: var(--accent); font-weight: bold;">
        +1 дополнительный спин рулетки!
      </p>
      <p style="font-size: 14px; color: var(--text-muted);">
        +20 опыта получено!
      </p>
      <p style="font-size: 14px; color: var(--text-muted);">
        Доступно бесплатных спинов: ${userData.freeSpins}
      </p>
    `;
    updateRouletteButton();
  } else if (prize.id === 'quest24h') {
    // Даем опыт за дополнительный квест
    await addRewards(0, 30, 'roulette', prize.name, 'easy');
    
    contentHTML = `
      <p style="font-size: 14px; color: var(--text-muted);">
        Вам открыт дополнительный квест на 24 часа!
      </p>
      <p style="font-size: 14px; color: var(--text-muted);">
        +30 опыта получено!
      </p>
    `;
    activateQuest24h();
  } else if (prize.id === 'frodCourse') {
    const promoCode = generatePromoCode(prize);
    
    // Даем опыт за курс фрода
    await addRewards(0, 100, 'roulette', prize.name, 'easy');
    
    // Сохраняем промокод в базу данных
    await savePromocode(prize, promoCode);
    
    contentHTML = `
      <div class="promo-code" id="promoCode" onclick="copyPromoCode()">${promoCode}</div>
      <p style="font-size: 14px; color: var(--text-muted); margin: 8px 0;">
        Нажмите на промокод, чтобы скопировать
      </p>
      <p style="font-size: 14px; color: var(--text-muted);">
        +100 опыта получено!
      </p>
      <a href="https://t.me/acqu1red?text=${encodeURIComponent(getPromoMessage(prize, promoCode))}" 
         class="use-button" id="useButton" style="display: none;">
        Использовать
      </a>
    `;
  }
  
  content.innerHTML = contentHTML;
  modal.classList.add('show');
}

function generatePromoCode(prize) {
  const prefix = prize.id === 'infiniteSubscription' ? 'INF' :
                prize.id === 'subscription' ? 'SUB' : 
                prize.id === 'frodCourse' ? 'FROD' : 'DIS';
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}-${rand}`;
}

function getPromoMessage(prize, code) {
  const messages = {
    infiniteSubscription: `🎉 Выиграл БЕСКОНЕЧНУЮ ПОДПИСКУ!\n\nПромокод: ${code}\n\nДействует навсегда!`,
    subscription: `🎉 Выиграл 1 месяц подписки!\n\nПромокод: ${code}\n\nДействует 30 дней.`,
    discount500: `🎉 Выиграл скидку 500 рублей!\n\nПромокод: ${code}\n\nДействует 7 дней.`,
    discount100: `🎉 Выиграл скидку 100 рублей!\n\nПромокод: ${code}\n\nДействует 7 дней.`,
    discount50: `🎉 Выиграл скидку 50 рублей!\n\nПромокод: ${code}\n\nДействует 7 дней.`,
    frodCourse: `🎉 Выиграл ПОЛНЫЙ КУРС ПО ФРОДУ!\n\nПромокод: ${code}\n\nДействует 60 дней.`
  };
  return messages[prize.id] || `Промокод: ${code}`;
}

function copyPromoCode() {
  const promoCode = $("#promoCode");
  if (!promoCode) return;
  
  const text = promoCode.textContent;
  navigator.clipboard.writeText(text).then(() => {
    promoCode.classList.add('copied');
    promoCode.textContent = 'Скопировано!';
    
    setTimeout(() => {
      promoCode.style.display = 'none';
      const useButton = $("#useButton");
      if (useButton) {
        useButton.style.display = 'inline-block';
        useButton.style.animation = 'fadeIn 0.5s ease';
      }
    }, 1000);
    
    toast('Промокод скопирован! Сохранен в Истории.', 'success');
  });
}

function activateQuest24h() {
  // Логика активации дополнительного квеста
  toast('Дополнительный квест активирован на 24 часа!', 'success');
}

async function saveUserData() {
  // console.log('=== СТАРТ СОХРАНЕНИЯ ДАННЫХ ===');
  // console.log('Сохранение данных пользователя:', userData);
  // Supabase доступен
  // Telegram ID
  // console.log('Mulacoin для сохранения:', userData.mulacoin);
  // console.log('Experience для сохранения:', userData.exp);
  // console.log('Level для сохранения:', userData.level);
  
  // Всегда сохраняем в localStorage как fallback
  const dataToSave = {
    mulacoin: userData.mulacoin || 0,
    exp: userData.exp || 0,
    level: userData.level || 1,
    lastFreeSpin: userData.lastFreeSpin,
    telegramId: userData.telegramId
  };
  
  localStorage.setItem('userData', JSON.stringify(dataToSave));
  // console.log('Данные сохранены в localStorage:', dataToSave);
  
  // Сохраняем в Supabase если доступен
  if (supabase && userData.telegramId) {
    try {
      const userDataToSave = {
        telegram_id: userData.telegramId,
        mulacoin: userData.mulacoin || 0,
        experience: userData.exp || 0,
        level: userData.level || 1,
        last_free_spin: userData.lastFreeSpin,
        updated_at: new Date().toISOString()
      };
      
      // console.log('Данные для сохранения в Supabase:', userDataToSave);
      
      const { data, error } = await supabase
        .from('bot_user')
        .upsert(userDataToSave)
        .select();
      
      if (error) {
        // console.error('Ошибка сохранения в Supabase:', error);
        toast('Ошибка сохранения данных в базу', 'error');
      } else {
        // console.log('Данные пользователя сохранены в Supabase:', data);
        toast('Данные успешно сохранены в базу', 'success');
      }
    } catch (error) {
      // console.error('Ошибка подключения к Supabase:', error);
      toast('Ошибка подключения к базе данных', 'error');
    }
  } else {
    // console.log('Supabase недоступен или отсутствует Telegram ID');
    if (!supabase) { /* Причина: Supabase клиент не инициализирован */ }
    if (!userData.telegramId) { /* Причина: Отсутствует Telegram ID */ }
  }
}

async function loadUserData(userId) {
  // console.log('Загрузка данных пользователя:', userId);
  // Supabase доступен
  // Telegram ID
  
  userData.userId = userId;
  
  // Сначала загружаем из localStorage как fallback
  const saved = localStorage.getItem('userData');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      userData.mulacoin = parsed.mulacoin || 0;
      userData.exp = parsed.exp || 0;
      // Пересчитываем уровень на основе опыта
      userData.level = calculateLevel(userData.exp);
      userData.lastFreeSpin = parsed.lastFreeSpin;
      // console.log('Данные загружены из localStorage:', parsed);
      // console.log('Уровень пересчитан на основе опыта:', userData.level);
    } catch (error) {
      // console.error('Ошибка парсинга localStorage:', error);
    }
  }
  
  // Пытаемся загрузить из Supabase
  if (supabase && userData.telegramId) {
    try {
      // console.log('Попытка загрузки из Supabase для Telegram ID:', userData.telegramId);
      
      const { data, error } = await supabase
        .from('bot_user')
        .select('*')
        .eq('telegram_id', userData.telegramId)
        .single();
      
      if (data && !error) {
        // console.log('Данные загружены из Supabase:', data);
        // Обновляем данные из Supabase (они имеют приоритет)
        userData.mulacoin = data.mulacoin || userData.mulacoin || 0;
        userData.exp = data.experience || userData.exp || 0;
        // Пересчитываем уровень на основе опыта
        userData.level = calculateLevel(userData.exp);
        userData.lastFreeSpin = data.last_free_spin || userData.lastFreeSpin;
        // console.log('Уровень пересчитан на основе опыта:', userData.level);
        toast('Данные загружены из базы данных', 'success');
      } else {
        // console.log('Пользователь не найден в Supabase, используем данные из localStorage');
      }
    } catch (error) {
      // console.error('Ошибка загрузки из Supabase:', error);
      toast('Ошибка загрузки из базы данных', 'error');
    }
  } else {
    // console.log('Supabase недоступен, загружаем из localStorage');
    if (!supabase) { /* Причина: Supabase клиент не инициализирован */ }
    if (!userData.telegramId) { /* Причина: Отсутствует Telegram ID */ }
    
    // Fallback на localStorage
    const saved = localStorage.getItem(`userData_${userId}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      userData = { ...userData, ...parsed };
      // Пересчитываем уровень на основе опыта
      userData.level = calculateLevel(userData.exp || 0);
      // console.log('Данные загружены из localStorage:', parsed);
      // console.log('Уровень пересчитан на основе опыта:', userData.level);
    }
  }
  
  // console.log('Итоговые данные пользователя:', userData);
  
  // Принудительно обновляем отображение несколько раз для надежности
  updateCurrencyDisplay();
  setTimeout(() => updateCurrencyDisplay(), 100);
  setTimeout(() => updateCurrencyDisplay(), 500);
  
  updateRouletteButton();
}

// Функция для сохранения истории квеста
async function saveQuestHistory(questId, questName, difficulty, mulacoinEarned, experienceEarned) {
  // console.log('Сохранение истории квеста:', { questId, questName, difficulty, mulacoinEarned, experienceEarned });
  // Supabase доступен
  // Telegram ID
  
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
      
      // console.log('Данные квеста для сохранения:', questData);
      
      const { data, error } = await supabase
        .from('quest_history')
        .insert(questData)
        .select();
      
      if (error) {
        // console.error('Ошибка сохранения истории квеста:', error);
        toast('Ошибка сохранения истории квеста', 'error');
      } else {
        // console.log('История квеста сохранена в Supabase:', data);
        toast('История квеста сохранена', 'success');
      }
    } catch (error) {
      // console.error('Ошибка подключения к Supabase для истории квеста:', error);
      toast('Ошибка подключения к базе данных для истории квеста', 'error');
    }
  } else {
    // console.error('Supabase недоступен или отсутствует Telegram ID для истории квеста');
    if (!supabase) { /* Причина: Supabase клиент не инициализирован */ }
    if (!userData.telegramId) { /* Причина: Отсутствует Telegram ID */ }
  }
}

// Функция для сохранения истории рулетки
async function saveRouletteHistory(prizeType, prizeName, isFree, mulacoinSpent, promoCodeId = null) {
  const isAdminSpin = isAdmin();
  // console.log('Сохранение истории рулетки:', { prizeType, prizeName, isFree, mulacoinSpent, promoCodeId, isAdminSpin });
  
  if (supabase && userData.telegramId) {
    try {
      const rouletteData = {
        user_id: userData.telegramId,
        prize_type: prizeType,
        prize_name: isAdminSpin ? `${prizeName} (Админ)` : prizeName,
        is_free: isFree,
        mulacoin_spent: mulacoinSpent,
        promo_code_id: promoCodeId
        // won_at автоматически устанавливается в now() по умолчанию
      };
      
      // console.log('Данные рулетки для сохранения:', rouletteData);
      
      const { data, error } = await supabase
        .from('roulette_history')
        .insert(rouletteData)
        .select();
      
      if (error) {
        // console.error('Ошибка сохранения истории рулетки:', error);
        toast('Ошибка сохранения истории рулетки', 'error');
      } else {
        // console.log('История рулетки сохранена в Supabase:', data);
        toast('История рулетки сохранена', 'success');
      }
    } catch (error) {
      // console.error('Ошибка подключения к Supabase для истории рулетки:', error);
      toast('Ошибка подключения к базе данных для истории', 'error');
    }
  } else {
    // console.error('Supabase недоступен или отсутствует Telegram ID для истории рулетки');
    if (!supabase) { /* Причина: Supabase клиент не инициализирован */ }
    if (!userData.telegramId) { /* Причина: Отсутствует Telegram ID */ }
  }
}

// Функция для сохранения промокодов в базу данных
async function savePromocode(prize, promoCode) {
  // console.log('=== СОХРАНЕНИЕ ПРОМОКОДА ===');
  // console.log('Данные промокода:', { prize, promoCode, telegramId: userData.telegramId });
  
  if (!supabase) {
    // console.error('Supabase не инициализирован');
    toast('Ошибка: Supabase не инициализирован', 'error');
    return;
  }
  
  if (!userData.telegramId) {
    // console.error('Telegram ID отсутствует');
    toast('Ошибка: Telegram ID не получен', 'error');
    return;
  }
  
  try {
    // Определяем тип промокода
    let promoType = 'discount';
    let promoValue = 0;
    
    if (prize.id === 'subscription') {
      promoType = 'subscription';
      promoValue = 30; // 30 дней
    } else if (prize.id === 'frodCourse') {
      promoType = 'frod_course';
      promoValue = 60; // 60 дней
    } else if (prize.id === 'discount500') {
      promoValue = 500;
    } else if (prize.id === 'discount100') {
      promoValue = 100;
    } else if (prize.id === 'discount50') {
      promoValue = 50;
    }
    
    // Вычисляем дату истечения
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (prize.id === 'subscription' ? 30 : 7));
    
    const promoData = {
      code: promoCode,
      type: promoType,
      value: promoValue,
      issued_to: userData.telegramId,
      expires_at: expiresAt.toISOString()
      // status автоматически устанавливается в 'issued' по умолчанию
      // issued_at автоматически устанавливается в now() по умолчанию
    };
    
    // console.log('Данные промокода для сохранения:', promoData);
    // console.log('Telegram ID для привязки:', userData.telegramId);
    
    // Сохраняем промокод в таблицу promocodes
    const { data, error } = await supabase
      .from('promocodes')
      .insert(promoData)
      .select();
    
    if (error) {
      // console.error('Ошибка сохранения промокода в promocodes:', error);
      toast('Ошибка сохранения промокода в базу данных', 'error');
      return;
    }
    
    // console.log('✅ Промокод успешно сохранен в promocodes:', data);
    
    // Автоматически сохраняем в историю рулетки
    await saveRouletteHistory(prize.id, prize.name, false, SPIN_COST, promoCode);
    
    toast('✅ Промокод сохранен в истории!', 'success');
    // console.log('=== ПРОМОКОД УСПЕШНО СОХРАНЕН ===');
    
  } catch (error) {
    // console.error('Ошибка сохранения промокода:', error);
    toast('Ошибка подключения к базе данных', 'error');
  }
}

function dayIndex(){ return Math.floor(Date.now() / (24*60*60*1000)); }
function variationIndex(){ return dayIndex() % VARIATIONS_PER_QUEST; }
function groupIndex(){ return dayIndex() % 2; } // 2 группы по 5 квестов



/* ====== Quests model (10 квестов в стиле теорий заговора) ====== */
const QUESTS = [
  { 
    id: "funnel", 
    theme: "Финансовые Пирамиды", 
    style: "conspiracy", 
    name: "Финансовые Схемы", 
    intro: "Изучи основы финансового планирования и инвестирования.", 
    description: "Изучи как создавать пассивные источники дохода и масштабировать свой бизнес. Научись мыслить как миллионер!",
    type: "puzzle", 
    difficulty: "easy",
    rewards: { fragments: 2, experience: 400 },
    available: true,
    url: "quests/funnel.html"
  },
  { 
    id: "copy", 
    theme: "Пропаганда", 
    style: "conspiracy", 
    name: "Маркетинг и Продвижение", 
    intro: "Освой стратегии продвижения себя и своего бизнеса.", 
    description: "Научись создавать контент, который привлекает аудиторию и генерирует стабильный доход. Овладей современными тоолами продаж!",
    type: "quiz", 
    difficulty: "easy",
    rewards: { fragments: 2, experience: 350 },
    available: true,
    url: "quests/copy.html"
  },
  { 
    id: "audience", 
    theme: "Массовое Сознание", 
    style: "conspiracy", 
    name: "Целевая Аудитория", 
    intro: "Определи своего идеального клиента для максимальных продаж.", 
    description: "Научись создавать психологические портреты покупателей и находить точные слова для каждого. Омниканальность — ключ к успеху!",
    type: "analysis", 
    difficulty: "medium",
    rewards: { fragments: 3, experience: 600 },
    available: true,
    url: "quests/audience.html"
  },
  { 
    id: "competitors", 
    theme: "Война Кланов", 
    style: "conspiracy", 
    name: "Стратегии Бизнеса", 
    intro: "Освой принципы создания своей бизнес-империи.", 
    description: "Изучи как миллиардеры строят свои империи через стратегические партнёрства и поглощения. Научись мыслить глобально!",
    type: "analysis", 
    difficulty: "hard",
    rewards: { fragments: 5, experience: 900 },
    available: true,
    url: "quests/competitors.html"
  },
  { 
    id: "trends", 
    theme: "Предсказания", 
    style: "conspiracy", 
         name: "Планирование Успеха", 
     intro: "Создай план достижения финансовой независимости.", 
     description: "Освой методы постановки долгосрочных целей и создания пошагового плана их реализации. Научись превращать мечты в реальность!",
    type: "analysis", 
    difficulty: "hard",
    rewards: { fragments: 4, experience: 850 },
    available: true,
    url: "quests/trends.html"
  },
  { 
     id: "psychology", 
     theme: "Психоконтроль", 
     style: "conspiracy", 
     name: "Психология Переговоров", 
     intro: "Освой техники убеждения и влияния на людей.", 
     description: "Научись проводить переговоры так, чтобы все стороны оставались в выигрыше. Овладей методами эффективного общения и получай желаемое!",
     type: "interactive", 
     difficulty: "medium",
     rewards: { fragments: 3, experience: 500 },
     available: true,
     url: "quests/psychology.html"
   },
  { 
    id: "world-government", 
    theme: "Мировой Заговор", 
    style: "special", 
    name: "Международный Бизнес", 
    intro: "Освой стратегии выхода на международные рынки.", 
    description: "Научись создавать мультинациональные компании и управлять дистрибьюцией по всему миру. Освой принципы глобального лидерства!",
    type: "strategy", 
    difficulty: "hard",
    rewards: { fragments: 5, experience: 1000 },
    available: true,
    url: "quests/world-government.html"
  },
  { 
    id: "bodylang", 
    theme: "Психоманипуляции", 
    style: "special", 
    name: "Язык тела", 
    intro: "Читай людей как открытую книгу и управляй ими.", 
    description: "Научись считывать микроэкспрессии, жесты и позы для эффективного общения. Понимание людей — ключ к успеху в бизнесе!",
    type: "analysis", 
    difficulty: "medium",
    rewards: { fragments: 3, experience: 500 },
    available: true,
    url: "quests/bodylang.html"
  },
  { 
    id: "profiling", 
    theme: "Психоманипуляции", 
    style: "special", 
    name: "Профайлинг", 
    intro: "Создай психологический портрет и найди рычаги управления человеком.", 
    description: "Научись анализировать рынок и позиционировать себя как эксперта. Определи свои сильные стороны и создай мощный личный бренд!",
    type: "analysis", 
    difficulty: "hard",
    rewards: { fragments: 4, experience: 800 },
    available: false,
    url: "quests/profiling.html"
  },
  { 
    id: "control-archives", 
    theme: "Рассекреченные Файлы", 
    style: "conspiracy", 
    name: "Аналитика и Исследования", 
    intro: "Освой методы сбора и анализа данных для принятия верных решений.", 
    description: "Научись работать с большими объёмами информации, выявлять тренды и прогнозировать будущее. Данные — новая нефть!",
    type: "investigation", 
    difficulty: "medium",
    rewards: { fragments: 5, experience: 1000 },
    available: false,
    url: "quests/control-archives.html"
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
    }
  } catch(e) { 
    // console.warn("TG user data fail", e); 
  }
  
  let isSubscribed = false;
  let isAdmin = false;
  
  // console.log('=== НАЧАЛО ПРОВЕРКИ ДОСТУПА ===');
  // console.log('Данные пользователя:', { userId, username });
  // console.log('Список админов:', ADMIN_IDS);
  
  // Проверка на администратора (по username и telegramId)
  if ((username && ADMIN_IDS.includes(username)) || (userId && ADMIN_IDS.includes(userId))) {
    isAdmin = true;
    isSubscribed = true; // Администраторы имеют доступ ко всем квестам
    // console.log('✅ Пользователь является админом!');
  } else {
    // console.log('❌ Пользователь не является админом');
  }
  
  // Проверка подписки через Supabase
  if(supabase && userId && !isAdmin){
    try{
      // console.log('🔍 Проверяем подписку для пользователя:', userId);
      
      // Проверяем таблицу subscriptions - используем поле user_id как указано в схеме
      // console.log('📋 Проверяем таблицу subscriptions...');
      
      // Проверяем активную подписку в таблице subscriptions
      const { data: subData, error: subError } = await supabase
        .from(SUBSCRIPTIONS_TABLE)
        .select("*")
        .eq('user_id', userId)
        .eq('status', 'active')
        .gte('end_date', new Date().toISOString())
        .maybeSingle();
      
      if(!subError && subData) {
        isSubscribed = true;
        // console.log('✅ Активная подписка найдена в таблице subscriptions:', subData);
      } else {
        // console.log('❌ Активная подписка не найдена в таблице subscriptions:', subError);
        
        // Проверяем любую подписку (не только активную) для диагностики
        const { data: anySubData, error: anySubError } = await supabase
          .from(SUBSCRIPTIONS_TABLE)
          .select("*")
          .eq('user_id', userId)
          .maybeSingle();
        
        if(!anySubError && anySubData) {
          // console.log('ℹ️ Найдена подписка (возможно неактивная):', anySubData);
        } else {
          // console.log('❌ Подписка не найдена в таблице subscriptions');
        }
      }
      
    } catch(e){ 
      // console.error("❌ Ошибка проверки Supabase:", e); 
    }
  } else if (!supabase) {
    // console.log('❌ Supabase недоступен');
  } else if (!userId) {
    // console.log('❌ userId отсутствует');
  }
  
  // console.log('📊 ИТОГОВОЕ СОСТОЯНИЕ:', { userId, username, isSubscribed, isAdmin });
  // console.log('=== КОНЕЦ ПРОВЕРКИ ДОСТУПА ===');
  
  return { userId, username, isSubscribed, isAdmin };
}

/* ====== Rotation + gating ====== */
function featuredQuests(state){
  // === FEATURED QUESTS ===
  // Состояние пользователя
  // Всего квестов в системе
  // Квесты
  
  // Дать доступ ко всем квестам всем пользователям
  return QUESTS;
}

/* ====== Cards ====== */
function buildCards(state){
  const container = $("#quests");
  container.innerHTML = "";
  
  // console.log('=== BUILD CARDS ===');
  // console.log('Состояние пользователя:', state);
  // console.log('Статус доступа:', { isSubscribed: state.isSubscribed, isAdmin: state.isAdmin });
  
  const list = featuredQuests(state);
  // console.log('📊 Квестов для отображения:', list.length);
  // console.log('📋 Список квестов:', list.map(q => q.name));
  
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
    // Показываем квесты с индекса 5 (6-й квест и далее) как заблокированные
    const lockedQuests = QUESTS.slice(5);
    lockedQuests.forEach((q, index) => {
      const card = document.createElement("div");
      card.className = "card locked fade-in";
      card.setAttribute("data-style", q.style);
      card.style.animationDelay = `${(list.length + index) * 0.1}s`;
      
      card.innerHTML = `
        <div class="lock">🔒 Заблокировано</div>
        <div class="label">${q.theme}</div>
        <h3>${q.name}</h3>
        <div class="description">${q.description}</div>
        <div class="tag ${q.difficulty}">${getDifficultyText(q.difficulty)}</div>
        <div class="cta">
          <button class="btn ghost locked-access-btn">Получить доступ</button>
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
  
  // console.log('startQuest вызвана:', { questId, quest, state });
  
  if (!quest) {
    toast("Квест не найден", "error");
    return;
  }
  
  // Проверяем доступ к квесту
  const questIndex = QUESTS.findIndex(q => q.id === questId);
  // console.log('Проверка доступа:', { 
  //   isSubscribed: state.isSubscribed, 
  //   isAdmin: state.isAdmin, 
  //   questIndex,
  //   questAvailable: quest.available 
  // });
  
  // Для бесплатных пользователей доступны только первые 5 квестов (индексы 0-4)
  if (!state.isSubscribed && !state.isAdmin && questIndex >= 5) {
    // console.log('Доступ запрещен, показываем промпт подписки');
    showSubscriptionPrompt();
    return;
  }
  
  // console.log('Доступ разрешен, открываем квест');
  
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
    // console.warn(error); 
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
  
  // console.log('🔍 Проверка админа:', { userId, username, isAdminUser, ADMIN_IDS });
  
  return isAdminUser;
}

function canSpinFree() {
  if (isAdmin()) return true; // Админы могут крутить бесплатно всегда
  
  // Проверяем дополнительные спины
  if (userData.freeSpins && userData.freeSpins > 0) {
    return true;
  }
  
  // Проверяем ежедневный бесплатный спин
  if (!userData.lastFreeSpin) return true;
  const now = new Date();
  const lastSpin = new Date(userData.lastFreeSpin);
  const diffTime = now - lastSpin;
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  return diffDays >= 1;
}

function updateRouletteButton() {
  const spinBtn = $("#spinRoulette");
  const buyBtn = $("#buySpin");
  
  if (!spinBtn || !buyBtn) return;
  
  // Очищаем содержимое кнопок
  spinBtn.innerHTML = '';
  buyBtn.innerHTML = '';
  
  if (isAdmin()) {
    // Специальная картинка для администраторов
    const adminImg = document.createElement('img');
    adminImg.src = './assets/photovideo/ruletka.png';
    adminImg.alt = 'Крутить рулетку (∞)';
    adminImg.className = 'button-image';
    spinBtn.appendChild(adminImg);
    spinBtn.disabled = false;
    spinBtn.classList.remove("disabled");
    spinBtn.title = "Администратор: бесконечные попытки";
  } else if (canSpinFree()) {
    // Обычная картинка для кручения
    const spinImg = document.createElement('img');
    spinImg.src = './assets/photovideo/ruletka.png';
    spinImg.alt = 'Крутить рулетку';
    spinImg.className = 'button-image';
    spinBtn.appendChild(spinImg);
    spinBtn.disabled = false;
    spinBtn.classList.remove("disabled");
  } else {
    // Картинка для лимита
    const limitImg = document.createElement('img');
    limitImg.src = './assets/photovideo/ruletka2.png';
    limitImg.alt = 'Лимит исчерпан';
    limitImg.className = 'button-image';
    spinBtn.appendChild(limitImg);
    spinBtn.disabled = true;
    spinBtn.classList.add("disabled");
  }
  
  // Обновляем картинку кнопки покупки
  const buyImg = document.createElement('img');
  buyImg.src = './assets/photovideo/mulacoin.png';
  buyImg.alt = `Крутить за ${SPIN_COST} MULACOIN`;
  buyImg.className = 'button-image';
  buyBtn.appendChild(buyImg);
}

// Функция для плавного обновления кнопки с анимацией
function updateRouletteButtonWithAnimation() {
  const spinBtn = $("#spinRoulette");
  const buyBtn = $("#buySpin");
  
  if (!spinBtn || !buyBtn) return;
  
  // Добавляем класс для плавного перехода
  spinBtn.classList.add("transitioning");
  
  // Определяем новую картинку
  let newImageSrc = "";
  let isDisabled = false;
  
  if (isAdmin()) {
    newImageSrc = './assets/photovideo/ruletka.png';
    isDisabled = false;
    spinBtn.title = "Администратор: бесконечные попытки";
  } else if (canSpinFree()) {
    newImageSrc = './assets/photovideo/ruletka.png';
    isDisabled = false;
  } else {
    newImageSrc = './assets/photovideo/ruletka2.png';
    isDisabled = true;
  }
  
  // Плавно меняем картинку
  setTimeout(() => {
    spinBtn.innerHTML = '';
    const newImg = document.createElement('img');
    newImg.src = newImageSrc;
    newImg.alt = isDisabled ? 'Лимит исчерпан' : 'Крутить рулетку';
    newImg.className = 'button-image';
    spinBtn.appendChild(newImg);
    spinBtn.disabled = isDisabled;
    
    if (isDisabled) {
      spinBtn.classList.add("disabled");
    } else {
      spinBtn.classList.remove("disabled");
    }
    
    // Убираем класс перехода
    setTimeout(() => {
      spinBtn.classList.remove("transitioning");
    }, 300);
  }, 200);
  
  // Обновляем картинку кнопки покупки
  buyBtn.innerHTML = '';
  const buyImg = document.createElement('img');
  buyImg.src = './assets/photovideo/mulacoin.png';
  buyImg.alt = `Крутить за ${SPIN_COST} MULACOIN`;
  buyImg.className = 'button-image';
  buyBtn.appendChild(buyImg);
}

/* ====== Header buttons ====== */
$("#btnSubscribe").addEventListener("click", ()=>{
  openSubscription();
});

$("#btnHistory").addEventListener("click", ()=>{ 
  showHistory();
});

// Оригинальный обработчик для кнопки рулетки
const originalSpinHandler = () => {
  if (canSpinFree()) {
    spinRoulette(true);
  } else if (userData.mulacoin >= SPIN_COST) {
    spinRoulette(false);
  } else {
    toast("Недостаточно mulacoin для прокрута рулетки!", "error");
  }
};

// Функция инициализации обработчиков рулетки
function initializeRouletteHandlers() {
  // console.log('Инициализация обработчиков рулетки...');
  
  // Обработчики рулетки
  const spinBtn = $("#spinRoulette");
  const buyBtn = $("#buySpin");
  const closePrizeBtn = $("#closePrize");
  const previewHeader = $("#previewHeader");
  
  if (spinBtn) {
    spinBtn.addEventListener("click", originalSpinHandler);
    // console.log('✅ Обработчик кнопки "Крутить рулетку" добавлен');
  } else {
    // console.error('❌ Кнопка "Крутить рулетку" не найдена');
  }
  
  if (buyBtn) {
    buyBtn.addEventListener("click", ()=>{
      if (userData.mulacoin >= SPIN_COST) {
        spinRoulette(false);
      } else {
        toast("Недостаточно mulacoin для покупки прокрута!", "error");
      }
    });
    // console.log('✅ Обработчик кнопки "Купить прокрут" добавлен');
  } else {
    // console.error('❌ Кнопка "Купить прокрут" не найдена');
  }

  // Обработчик закрытия модала приза
  if (closePrizeBtn) {
    closePrizeBtn.addEventListener("click", ()=>{
      $("#prizeModal").classList.remove("show");
    });
    // console.log('✅ Обработчик закрытия модала приза добавлен');
  } else {
    // console.error('❌ Кнопка закрытия модала приза не найдена');
  }

  // Обработчик сворачивания/разворачивания превью призов
  if (previewHeader) {
    previewHeader.addEventListener("click", ()=>{
      const content = $("#previewContent");
      const toggle = $("#previewHeader .preview-toggle");
      
      if (content.classList.contains("expanded")) {
        content.classList.remove("expanded");
        toggle.classList.remove("expanded");
      } else {
        content.classList.add("expanded");
        toggle.classList.add("expanded");
      }
    });
    // console.log('✅ Обработчик превью призов добавлен');
  } else {
    // console.error('❌ Заголовок превью призов не найден');
  }
  
  // Убираем обработчики переключения дизайнов - оставляем только стандартный
  // console.log('Инициализация обработчиков рулетки завершена');
}

// Убираем функцию переключения дизайна - оставляем только стандартный

// Обработчик клика по уровню
$("#levelDisplay").addEventListener("click", ()=>{
  showLevelInfo();
});

async function showHistory() {
  const modal = $("#modal");
  const modalBody = $("#modalBody");
  
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
        // console.log('Загружены промокоды:', promocodes);
      } else {
        // console.error('Ошибка загрузки промокодов:', error);
      }
    } catch (error) {
      // console.error('Ошибка при загрузке промокодов:', error);
    }
  }
  
  // Загружаем историю рулетки
  let rouletteHistory = [];
  if (supabase && userData.telegramId) {
    try {
      const { data, error } = await supabase
        .from('roulette_history')
        .select('*')
        .eq('user_id', userData.telegramId)
        .order('won_at', { ascending: false })
        .limit(10);
      
      if (!error && data) {
        rouletteHistory = data;
        // console.log('Загружена история рулетки:', rouletteHistory);
      } else {
        // console.error('Ошибка загрузки истории рулетки:', error);
      }
    } catch (error) {
      // console.error('Ошибка при загрузке истории рулетки:', error);
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
            У вас пока нет промокодов. Крутите рулетку, чтобы получить!
          </p>
        `}
      </div>
      <div style="background: var(--glass); border-radius: var(--radius-sm); padding: 16px; margin: 16px 0;">
        <div style="font-size: 14px; color: var(--text-muted); margin-bottom: 8px;">История рулетки (${rouletteHistory.length})</div>
        ${rouletteHistory.length > 0 ? `
          <div style="max-height: 200px; overflow-y: auto; margin: 8px 0;">
            ${rouletteHistory.map(record => `
              <div style="background: var(--bg1); border-radius: 4px; padding: 8px; margin: 4px 0;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-weight: 600; color: var(--glow1);">${record.prize_name}</span>
                  <span style="font-size: 12px; color: var(--text-muted);">
                    ${new Date(record.won_at).toLocaleDateString()}
                  </span>
                </div>
                <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">
                  ${record.is_free ? 'Бесплатный спин' : `${record.mulacoin_spent} MULACOIN`}
                </div>
              </div>
            `).join('')}
          </div>
        ` : `
          <p style="font-size: 12px; color: var(--text-muted);">
            История рулетки пуста. Начните крутить рулетку!
          </p>
        `}
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
  // console.log('=== ТЕСТ ПОДКЛЮЧЕНИЯ К SUPABASE ===');
  // Supabase доступен
  // Telegram ID
  
  if (!supabase) {
    toast('Supabase не инициализирован', 'error');
    // console.error('Supabase не инициализирован');
    return;
  }
  
  try {
    toast('Тестирование подключения...', 'info');
    
    // Тестируем подключение к таблице subscriptions (которая точно существует)
    // console.log('Тестируем подключение к таблице subscriptions...');
    const { data: subData, error: subError } = await supabase.from('subscriptions').select('*').limit(1);
    
    if (subError) {
      // console.error('Ошибка подключения к subscriptions:', subError);
      toast('Ошибка подключения к базе данных', 'error');
      return;
    }
    
    // console.log('✅ Подключение к subscriptions успешно:', subData);
    
    // Тестируем подключение к таблице promocodes
    // console.log('Тестируем подключение к таблице promocodes...');
    const { data: promoData, error: promoError } = await supabase.from('promocodes').select('*').limit(1);
    
    if (promoError) {
      // console.error('Ошибка подключения к promocodes:', promoError);
      toast('Ошибка подключения к promocodes', 'error');
      return;
    }
    
    // console.log('✅ Подключение к promocodes успешно:', promoData);
    
    // Тестируем подключение к таблице bot_user
    // console.log('Тестируем подключение к таблице bot_user...');
    const { data: userData, error: userError } = await supabase.from('bot_user').select('*').limit(1);
    
    if (userError) {
      // console.error('Ошибка подключения к bot_user:', userError);
      toast('Ошибка подключения к bot_user', 'error');
      return;
    }
    
    // console.log('✅ Подключение к bot_user успешно:', userData);
    
    // Все тесты прошли успешно
    toast('✅ Подключение к базе данных работает', 'success');
    // console.log('=== ВСЕ ТЕСТЫ ПОДКЛЮЧЕНИЯ ПРОШЛИ УСПЕШНО ===');
    
    // Пробуем сохранить тестовые данные
    if (userData.telegramId) {
      // console.log('Пробуем сохранить тестовые данные...');
      await saveUserData();
    } else {
      // console.log('Telegram ID не получен, пропускаем сохранение');
    }
  } catch (error) {
    // console.error('Ошибка тестирования:', error);
    toast('Ошибка подключения к базе данных', 'error');
  }
}

// Функция для принудительного сохранения данных
async function forceSaveData() {
  // console.log('=== ПРИНУДИТЕЛЬНОЕ СОХРАНЕНИЕ ===');
  // console.log('Текущие данные:', userData);
  // Supabase доступен
  // Telegram ID
  
  if (!userData.telegramId) {
    toast('Telegram ID не получен', 'error');
    // console.error('Telegram ID не получен');
    return;
  }
  
  if (!supabase) {
    toast('Supabase не инициализирован', 'error');
    // console.error('Supabase не инициализирован');
    return;
  }
  
  try {
    // Добавляем тестовые награды
    userData.mulacoin += 10;
    userData.exp += 50;
    userData.level = calculateLevel(userData.exp);
    
    // console.log('Данные после добавления наград:', userData);
    
    // Сохраняем данные
    await saveUserData();
    
    // Сохраняем тестовую историю квеста
    await saveQuestHistory('test', 'Тестовый квест', 'easy', 10, 50);
    
    // Сохраняем тестовую историю рулетки
    await saveRouletteHistory('test', 'Тестовый приз', true, 0);
    
    toast('Тестовые данные сохранены', 'success');
    // console.log('=== ПРИНУДИТЕЛЬНОЕ СОХРАНЕНИЕ ЗАВЕРШЕНО ===');
  } catch (error) {
    // console.error('Ошибка принудительного сохранения:', error);
    toast('Ошибка сохранения тестовых данных', 'error');
  }
}

/* ====== Init ====== */
loadState().then(async state=>{
  buildCards(state);
  maybeOfferPromo(state);
  
  // Загружаем данные пользователя
  await loadUserData(state.userId);
  
  // Обновляем отображение валюты после загрузки данных
  updateCurrencyDisplay();
  
  // Всегда начинаем со стандартного дизайна рулетки
  currentRouletteDesign = 'standard';
  // console.log('Установлен стандартный дизайн рулетки');
  
  // Создаем рулетку
  createRouletteWheel();
  
  // Убираем все темы при инициализации (стандартный дизайн)
  const rouletteSection = document.querySelector('.roulette-section');
  if (rouletteSection) {
    rouletteSection.classList.remove('author-theme', 'casino-theme');
  }
  
  // Инициализируем обработчики событий после создания рулетки
  initializeRouletteHandlers();
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
