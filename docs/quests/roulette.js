/* ====== ROULETTE SYSTEM ====== */

// Константы рулетки
const SPIN_COST = 13;
const ROULETTE_PRIZES = [
  { id: "subscription", name: "1 месяц подписки", icon: "👑", count: 2, probability: 0.02, color: "#FFD700" },
  { id: "discount500", name: "Скидка 500₽", icon: "💰", count: 1, probability: 0.05, color: "#FF6B6B" },
  { id: "discount100", name: "Скидка 100₽", icon: "💵", count: 2, probability: 0.08, color: "#4ECDC4" },
  { id: "mulacoin100", name: "100 MULACOIN", icon: "🪙", count: 4, probability: 0.15, color: "#FFEAA7" },
  { id: "mulacoin50", name: "50 MULACOIN", icon: "🪙", count: 5, probability: 0.18, color: "#DDA0DD" },
  { id: "spin1", name: "+1 SPIN", icon: "🎰", count: 6, probability: 0.30, color: "#FFB6C1" },
  { id: "quest24h", name: "+1 квест 24ч", icon: "🎯", count: 3, probability: 0.15, color: "#F7DC6F" },
  { id: "frodCourse", name: "КУРС ФРОДА", icon: "📚", count: 1, probability: 0.0001, color: "#6C5CE7" }
];

// Иконки призов для стандартного дизайна
const ROULETTE_PRIZES_DESIGNS = {
  standard: [
    { id: 'subscription', name: 'Подписка', icon: '👑', count: 3, probability: 0.03 },
    { id: 'discount500', name: '500₽', icon: '💎', count: 1, probability: 0.10 },
    { id: 'discount100', name: '100₽', icon: '💵', count: 3, probability: 0.15 },
    { id: 'mulacoin100', name: '100 MULACOIN', icon: '🪙', count: 5, probability: 0.25 },
    { id: 'mulacoin50', name: '50 MULACOIN', icon: '🪙', count: 6, probability: 0.30 },
    { id: 'spin1', name: '+1 SPIN', icon: '🎰', count: 7, probability: 0.45 },
    { id: 'quest24h', name: 'Квест 24ч', icon: '🎯', count: 5, probability: 0.75 },
    { id: 'frodCourse', name: 'Курс', icon: '📚', count: 1, probability: 0.0005 }
  ]
};

// Глобальные переменные рулетки
let rouletteCurrentPosition = 0;
let currentRouletteDesign = 'standard';

// Основные функции рулетки
function createRouletteWheel() {
  // console.log('=== СОЗДАНИЕ РУЛЕТКИ ===');
  
  const items = $("#rouletteItems");
  const preview = $("#previewItems");
  const container = $(".roulette-container");
  
  if (!items || !preview || !container) {
    // console.error('❌ Контейнеры рулетки не найдены');
    return;
  }
  
  container.className = `roulette-container ${currentRouletteDesign}`;
  items.innerHTML = '';
  preview.innerHTML = '';
  rouletteCurrentPosition = 0;
  
  const currentPrizes = ROULETTE_PRIZES_DESIGNS[currentRouletteDesign] || ROULETTE_PRIZES_DESIGNS.standard;
  
  let allItems = [];
  currentPrizes.forEach(prize => {
    for (let i = 0; i < prize.count; i++) {
      allItems.push(prize);
    }
  });
  
  allItems.sort(() => Math.random() - 0.5);
  const totalItems = allItems.length * 20;
  
  for (let i = 0; i < totalItems; i++) {
    const prize = allItems[i % allItems.length];
    const item = document.createElement('div');
    item.className = 'roulette-item';
    item.dataset.prize = prize.id;
    
    if (currentRouletteDesign === 'author') {
      const randomRotation = (Math.random() - 0.5) * 20;
      item.style.setProperty('--random-rotation', `${randomRotation}deg`);
    }
    
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
  
  currentPrizes.forEach(prize => {
    const previewItem = document.createElement('div');
    previewItem.className = 'preview-item';
    
    const name = document.createElement('span');
    name.textContent = prize.name;
    
    previewItem.appendChild(name);
    preview.appendChild(previewItem);
  });
  
  // console.log('=== РУЛЕТКА СОЗДАНА УСПЕШНО ===');
}

function spinRoulette(isFree = false) {
  const items = $("#rouletteItems");
  const spinBtn = $("#spinRoulette");
  const buyBtn = $("#buySpin");
  
  if (!items || !spinBtn) return;
  
  if (isFree && !canSpinFree() && !isAdmin()) {
    toast("Бесплатный прокрут доступен раз в день!", "error");
    return;
  }
  
  if (!isFree && !isAdmin() && userData.mulacoin < SPIN_COST) {
    toast("Недостаточно mulacoin для прокрута рулетки!", "error");
    return;
  }
  
  if (!isFree && !isAdmin()) {
    userData.mulacoin -= SPIN_COST;
    updateCurrencyDisplay();
  } else if (isFree && !isAdmin()) {
    if (userData.freeSpins && userData.freeSpins > 0) {
      userData.freeSpins -= 1;
      toast(`🎰 Использован дополнительный спин! Осталось: ${userData.freeSpins}`, "success");
    } else {
      userData.lastFreeSpin = new Date().toISOString();
    }
    updateRouletteButton();
  } else if (isAdmin()) {
    toast("🎯 Администратор: бесплатный прокрут", "success");
  }
  
  saveUserData();
  
  spinBtn.disabled = true;
  buyBtn.disabled = true;
  
  document.querySelectorAll('.design-option').forEach(option => {
    option.disabled = true;
  });
  
  const baseDistance = 7500 + Math.random() * 3000;
  const extraDistance = Math.random() * 1500;
  const spinDistance = baseDistance + extraDistance;
  const newPosition = rouletteCurrentPosition + spinDistance;
  
  items.classList.add('spinning');
  
  const rouletteItems = document.querySelectorAll('.roulette-item');
  const iconSymbols = document.querySelectorAll('.icon-symbol');
  
  rouletteItems.forEach(item => {
    item.classList.add('spinning');
  });
  
  iconSymbols.forEach(icon => {
    icon.classList.add('spinning');
  });
  
  const animationDuration = '15s';
  
  items.style.transform = `translateX(-${newPosition}px)`;
  items.style.transition = `transform ${animationDuration} ease-out`;
  
  const music = isFree ? document.getElementById('rouletteMusic') : document.getElementById('rouletteMusicMulacoin');
  if (music) {
    music.currentTime = 0;
    music.play().catch(error => {
      // console.log('Не удалось воспроизвести музыку:', error);
    });
  }
  
  const waitTime = 15000;
  
  setTimeout(() => {
    spinBtn.disabled = false;
    buyBtn.disabled = false;
    
    document.querySelectorAll('.design-option').forEach(option => {
      option.disabled = false;
    });
    
    rouletteCurrentPosition = newPosition;
    const centerPrize = determinePrizeByArrowPosition();
    
    const music = isFree ? document.getElementById('rouletteMusic') : document.getElementById('rouletteMusicMulacoin');
    if (music) {
      music.pause();
      music.currentTime = 0;
    }
    
    showPrizeModal(centerPrize, isFree);
    updateRouletteButtonWithAnimation();
    
    setTimeout(() => {
      items.classList.remove('spinning');
      
      const rouletteItems = document.querySelectorAll('.roulette-item');
      const iconSymbols = document.querySelectorAll('.icon-symbol');
      
      rouletteItems.forEach(item => {
        item.classList.remove('spinning');
      });
      
      iconSymbols.forEach(icon => {
        icon.classList.remove('spinning');
      });
      
      items.style.transition = 'transform 8s ease-out';
    }, 1000);
  }, waitTime);
}

function canSpinFree() {
  if (isAdmin()) return true;
  
  if (userData.freeSpins && userData.freeSpins > 0) {
    return true;
  }
  
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
  
  spinBtn.innerHTML = '';
  buyBtn.innerHTML = '';
  
  if (isAdmin()) {
    const adminImg = document.createElement('img');
    adminImg.src = './assets/photovideo/ruletka.png';
    adminImg.alt = 'Крутить рулетку (∞)';
    adminImg.className = 'button-image';
    spinBtn.appendChild(adminImg);
    spinBtn.disabled = false;
    spinBtn.classList.remove("disabled");
    spinBtn.title = "Администратор: бесконечные попытки";
  } else if (canSpinFree()) {
    const spinImg = document.createElement('img');
    spinImg.src = './assets/photovideo/ruletka.png';
    spinImg.alt = 'Крутить рулетку';
    spinImg.className = 'button-image';
    spinBtn.appendChild(spinImg);
    spinBtn.disabled = false;
    spinBtn.classList.remove("disabled");
  } else {
    const limitImg = document.createElement('img');
    limitImg.src = './assets/photovideo/ruletka2.png';
    limitImg.alt = 'Лимит исчерпан';
    limitImg.className = 'button-image';
    spinBtn.appendChild(limitImg);
    spinBtn.disabled = true;
    spinBtn.classList.add("disabled");
  }
  
  const buyImg = document.createElement('img');
  buyImg.src = './assets/photovideo/mulacoin.png';
  buyImg.alt = `Крутить за ${SPIN_COST} MULACOIN`;
  buyImg.className = 'button-image';
  buyBtn.appendChild(buyImg);
}

function updateRouletteButtonWithAnimation() {
  const spinBtn = $("#spinRoulette");
  const buyBtn = $("#buySpin");
  
  if (!spinBtn || !buyBtn) return;
  
  spinBtn.classList.add("transitioning");
  
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
    
    setTimeout(() => {
      spinBtn.classList.remove("transitioning");
    }, 300);
  }, 200);
  
  buyBtn.innerHTML = '';
  const buyImg = document.createElement('img');
  buyImg.src = './assets/photovideo/mulacoin.png';
  buyImg.alt = `Крутить за ${SPIN_COST} MULACOIN`;
  buyImg.className = 'button-image';
  buyBtn.appendChild(buyImg);
}

function selectPrizeByProbability() {
  const rand = Math.random();
  let cumulative = 0;
  
  const currentPrizes = ROULETTE_PRIZES_DESIGNS[currentRouletteDesign] || ROULETTE_PRIZES_DESIGNS.standard;
  
  for (const prize of currentPrizes) {
    cumulative += prize.probability;
    if (rand <= cumulative) {
      return prize;
    }
  }
  
  return currentPrizes[4]; // quest24h
}

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
  
  const containerWidth = items.offsetWidth || 600;
  const centerX = containerWidth / 2;
  
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
  
  const isAdminSpin = isAdmin();
  await saveRouletteHistory(prize.id, prize.name, isFree || isAdminSpin, isFree || isAdminSpin ? 0 : SPIN_COST);
  
  let contentHTML = '';
  
  if (prize.id.startsWith('mulacoin')) {
    const mulacoinAmount = parseInt(prize.id.replace('mulacoin', ''));
    const expAmount = Math.round(mulacoinAmount / 10);
    
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
    
    await addRewards(0, 200, 'roulette', prize.name, 'easy');
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
    
    const expAmount = prize.id === 'subscription' ? 50 : 25;
    await addRewards(0, expAmount, 'roulette', prize.name, 'easy');
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
    
    await addRewards(0, 100, 'roulette', prize.name, 'easy');
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
  }).catch(err => {
    // console.error('Ошибка копирования:', err);
    toast('Ошибка копирования промокода', 'error');
  });
}

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
    let promoType = 'discount';
    let promoValue = 0;
    
    if (prize.id === 'subscription') {
      promoType = 'subscription';
      promoValue = 30;
    } else if (prize.id === 'frodCourse') {
      promoType = 'frod_course';
      promoValue = 60;
    } else if (prize.id === 'discount500') {
      promoValue = 500;
    } else if (prize.id === 'discount100') {
      promoValue = 100;
    } else if (prize.id === 'discount50') {
      promoValue = 50;
    }
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (prize.id === 'subscription' ? 30 : 7));
    
    const promoData = {
      code: promoCode,
      type: promoType,
      value: promoValue,
      issued_to: userData.telegramId,
      expires_at: expiresAt.toISOString()
    };
    
    // console.log('Данные промокода для сохранения:', promoData);
    // console.log('Telegram ID для привязки:', userData.telegramId);
    
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
    
    await saveRouletteHistory(prize.id, prize.name, false, SPIN_COST, promoCode);
    
    toast('✅ Промокод сохранен в истории!', 'success');
    // console.log('=== ПРОМОКОД УСПЕШНО СОХРАНЕН ===');
    
  } catch (error) {
    // console.error('Ошибка сохранения промокода:', error);
    toast('Ошибка подключения к базе данных', 'error');
  }
}

function initializeRouletteHandlers() {
  // console.log('Инициализация обработчиков рулетки...');
  
  const spinBtn = $("#spinRoulette");
  const buyBtn = $("#buySpin");
  const closePrizeBtn = $("#closePrize");
  const previewHeader = $("#previewHeader");
  
  if (spinBtn) {
    spinBtn.addEventListener("click", originalSpinHandler);
    // console.log('✅ Обработчик кнопки "Крутить рулетку" добавлен');
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
  }

  if (closePrizeBtn) {
    closePrizeBtn.addEventListener("click", ()=>{
      $("#prizeModal").classList.remove("show");
    });
    // console.log('✅ Обработчик закрытия модала приза добавлен');
  }

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
  }
}

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

// Экспортируем функции для использования в основном файле
window.rouletteSystem = {
  createRouletteWheel,
  spinRoulette,
  canSpinFree,
  updateRouletteButton,
  updateRouletteButtonWithAnimation,
  initializeRouletteHandlers,
  saveRouletteHistory,
  savePromocode,
  generatePromoCode,
  copyPromoCode,
  getPromoMessage,
  showPrizeModal,
  determinePrizeByArrowPosition,
  selectPrizeByProbability,
  originalSpinHandler,
  SPIN_COST,
  ROULETTE_PRIZES,
  ROULETTE_PRIZES_DESIGNS,
  rouletteCurrentPosition,
  currentRouletteDesign
};
