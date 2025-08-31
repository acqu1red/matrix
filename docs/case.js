// Case Roulette JavaScript - Psychology & Money Theme
(function() {
  'use strict';

  // Prize configuration with chances
  const PRIZES = [
    {
      id: 'discount_10',
      name: 'Скидка 10%',
      description: 'Скидка 10% на любую подписку',
      icon: '💸',
      type: 'discount',
      value: '10',
      chance: 40,
      category: 'use'
    },
    {
      id: 'discount_20_6m',
      name: 'Скидка 20%',
      description: 'Скидка 20% на подписку 6 мес.',
      icon: '🎯',
      type: 'discount',
      value: '20',
      chance: 25,
      category: 'use'
    },
    {
      id: 'discount_50_12m',
      name: 'Скидка 50%',
      description: 'Скидка 50% на подписку 12 мес.',
      icon: '💎',
      type: 'discount',
      value: '50',
      chance: 15,
      category: 'use'
    },
    {
      id: 'sub_1month',
      name: 'Подписка 1 мес.',
      description: 'Полная подписка 1 мес.',
      icon: '👑',
      type: 'subscription',
      value: '30',
      chance: 5,
      category: 'activate'
    },
    {
      id: 'mulacoin_50',
      name: '50 MULACOIN',
      description: '50 MULACOIN',
      icon: '🪙',
      type: 'currency',
      value: '50',
      chance: 40,
      category: 'activate'
    },
    {
      id: 'spin_bonus',
      name: '+1 SPIN',
      description: '+1 SPIN',
      icon: '🎰',
      type: 'spin',
      value: '1',
      chance: 80,
      category: 'activate'
    },
    {
      id: 'mulacoin_10',
      name: '10 MULACOIN',
      description: '10 MULACOIN',
      icon: '🥉',
      type: 'currency',
      value: '10',
      chance: 60,
      category: 'activate'
    },
    {
      id: 'consultation',
      name: 'Консультация',
      description: 'Личная консультация',
      icon: '🧠',
      type: 'service',
      value: 'consultation',
      chance: 3,
      category: 'use'
    },
    {
      id: 'frod_course',
      name: 'Обучение ФРОДУ',
      description: 'Полное обучение ФРОДУ',
      icon: '🎓',
      type: 'course',
      value: 'frod',
      chance: 1,
      category: 'use'
    }
  ];

  // Subscription prices for discount calculation
  const SUBSCRIPTION_PRICES = {
    '1month': 800,
    '6months': 4800,
    '12months': 9600
  };

  // App state
  let appState = {
    isInitialized: false,
    isSpinning: false,
    userData: {
      mulacoin: 0,
      spins: 0,
      level: 1,
      telegram_id: null
    },
    promocodes: [],
    currentUser: null
  };

  // DOM elements
  let elements = {};

  // Utility functions
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  // Initialize app
  async function initializeApp() {
    if (appState.isInitialized) return;

    try {
      // Get DOM elements
      elements = {
        spinButton: $('#spinButton'),
        spinButtonText: $('#spinButtonText'),
        buySpinBtn: $('#buySpinBtn'),
        prizesBtn: $('#prizesBtn'),
        mulacoinAmount: $('#mulacoinAmount'),
        spinsAmount: $('#spinsAmount'),
        rouletteTrack: $('#rouletteTrack'),
        resultModal: $('#resultModal'),
        resultIcon: $('#resultIcon'),
        resultTitle: $('#resultTitle'),
        resultDescription: $('#resultDescription'),
        claimPrizeBtn: $('#claimPrizeBtn'),
        closeResultBtn: $('#closeResultBtn'),
        promoList: $('#promoList'),
        spinSound: $('#spinSound'),
        tradingParticles: $('#tradingParticles')
      };

      // Initialize user data
      await initializeUser();
      
      // Generate roulette items
      generateRouletteItems();
      
      // Setup event listeners
      setupEventListeners();
      
      // Load user promocodes
      await loadPromocodes();
      
      // Initialize trading particles
      initializeTradingParticles();
      
      // Update display
      updateDisplay();
      
      appState.isInitialized = true;
      console.log('✅ Case roulette initialized successfully');
      
    } catch (error) {
      console.error('❌ Error initializing app:', error);
      showError('Ошибка загрузки приложения');
    }
  }

  // Initialize user data
  async function initializeUser() {
    try {
      if (!window.__CASE_API__) {
        throw new Error('Supabase API не загружен');
      }

      const user = await window.__CASE_API__.getOrCreateUser();
      appState.currentUser = user;
      appState.userData.telegram_id = user.telegram_id;
      
      const wallet = await window.__CASE_API__.computeWallet(user);
      appState.userData.mulacoin = wallet.mulacoin || 0;
      appState.userData.spins = wallet.spins || 0;
      
      console.log('👤 User initialized:', user);
      console.log('💰 Wallet:', wallet);
      
    } catch (error) {
      console.error('❌ Error initializing user:', error);
      // Fallback to local storage
      const localData = JSON.parse(localStorage.getItem('case_user') || '{}');
      appState.userData.mulacoin = localData.mulacoin || 0;
      appState.userData.spins = localData.spins || 1; // Give 1 free spin
      appState.userData.telegram_id = localData.telegram_id || 'local_user';
    }
  }

  // Generate roulette items with infinite scroll effect
  function generateRouletteItems() {
    const track = elements.rouletteTrack;
    if (!track) return;

    // Create weighted prize array based on chances
    const weightedPrizes = [];
    PRIZES.forEach(prize => {
      for (let i = 0; i < prize.chance; i++) {
        weightedPrizes.push(prize);
      }
    });

    // Generate 50 items for smooth infinite scroll
    const items = [];
    for (let i = 0; i < 50; i++) {
      const randomIndex = Math.floor(Math.random() * weightedPrizes.length);
      items.push(weightedPrizes[randomIndex]);
    }

    // Render items
    track.innerHTML = items.map(prize => `
      <div class="roulette-item" data-prize-id="${prize.id}">
        <div class="roulette-icon">${prize.icon}</div>
        <div class="roulette-text">${prize.name}</div>
      </div>
    `).join('');
  }

  // Setup event listeners
  function setupEventListeners() {
    // Spin button
    if (elements.spinButton) {
      elements.spinButton.addEventListener('click', handleSpin);
    }

    // Buy spin button
    if (elements.buySpinBtn) {
      elements.buySpinBtn.addEventListener('click', handleBuySpin);
    }

    // Prizes button
    if (elements.prizesBtn) {
      elements.prizesBtn.addEventListener('click', showPrizesModal);
    }

    // Result modal buttons
    if (elements.claimPrizeBtn) {
      elements.claimPrizeBtn.addEventListener('click', handleClaimPrize);
    }

    if (elements.closeResultBtn) {
      elements.closeResultBtn.addEventListener('click', closeResultModal);
    }

    // Close modal on outside click
    if (elements.resultModal) {
      elements.resultModal.addEventListener('click', (e) => {
        if (e.target === elements.resultModal) {
          closeResultModal();
        }
      });
    }
  }

  // Handle spin action
  async function handleSpin() {
    if (appState.isSpinning) return;
    
    if (appState.userData.spins <= 0) {
      showError('У вас нет спинов! Купите спин за 50 MULACOIN');
      return;
    }

    try {
      appState.isSpinning = true;
      
      // Update UI
      elements.spinButton.disabled = true;
      elements.spinButtonText.textContent = 'Крутим...';
      
      // Decrease spins
      appState.userData.spins--;
      updateDisplay();
      
      // Play sound
      if (elements.spinSound) {
        elements.spinSound.currentTime = 0;
        elements.spinSound.play().catch(e => console.log('Sound play failed:', e));
      }
      
      // Select winning prize based on chances
      const winningPrize = selectWinningPrize();
      
      // Animate roulette
      await animateRoulette(winningPrize);
      
      // Save spin to database
      await saveRouletteHistory('spin', winningPrize);
      
      // Show result
      showResult(winningPrize);
      
    } catch (error) {
      console.error('❌ Error during spin:', error);
      showError('Ошибка при кручении рулетки');
    } finally {
      appState.isSpinning = false;
      elements.spinButton.disabled = false;
      elements.spinButtonText.textContent = appState.userData.spins > 0 ? 'Крутить рулетку' : 'Нет спинов';
    }
  }

  // Select winning prize based on weighted chances
  function selectWinningPrize() {
    const totalChance = PRIZES.reduce((sum, prize) => sum + prize.chance, 0);
    let random = Math.random() * totalChance;
    
    for (const prize of PRIZES) {
      random -= prize.chance;
      if (random <= 0) {
        return prize;
      }
    }
    
    return PRIZES[0]; // Fallback
  }

  // Animate roulette spinning
  function animateRoulette(winningPrize) {
    return new Promise((resolve) => {
      const track = elements.rouletteTrack;
      if (!track) return resolve();

      // Find winning item position
      const items = track.querySelectorAll('.roulette-item');
      let winningIndex = -1;
      
      // Find a matching item in the middle section
      for (let i = Math.floor(items.length / 3); i < Math.floor(items.length * 2 / 3); i++) {
        if (items[i].dataset.prizeId === winningPrize.id) {
          winningIndex = i;
          break;
        }
      }
      
      if (winningIndex === -1) {
        // If not found, use middle item and update its content
        winningIndex = Math.floor(items.length / 2);
        const middleItem = items[winningIndex];
        middleItem.dataset.prizeId = winningPrize.id;
        middleItem.querySelector('.roulette-icon').textContent = winningPrize.icon;
        middleItem.querySelector('.roulette-text').textContent = winningPrize.name;
      }

      // Calculate position to center the winning item
      const itemWidth = 100; // min-width of roulette-item
      const containerWidth = track.parentElement.offsetWidth;
      const centerOffset = containerWidth / 2 - itemWidth / 2;
      const targetPosition = -(winningIndex * itemWidth - centerOffset);
      
      // Add multiple full rotations for effect
      const fullRotations = 5;
      const finalPosition = targetPosition - (fullRotations * items.length * itemWidth);
      
      // Apply animation
      track.style.transition = 'transform 15s cubic-bezier(0.15, 0, 0.25, 1)';
      track.style.transform = `translateX(${finalPosition}px)`;
      
      // Resolve after animation
      setTimeout(() => {
        resolve();
      }, 15000);
    });
  }

  // Handle buy spin
  async function handleBuySpin() {
    if (appState.userData.mulacoin < 50) {
      showError('Недостаточно MULACOIN! Нужно 50 MULACOIN');
      return;
    }

    try {
      // Deduct mulacoin and add spin
      appState.userData.mulacoin -= 50;
      appState.userData.spins += 1;
      
      // Save to database
      await saveRouletteHistory('buy_spin', null);
      
      // Update display
      updateDisplay();
      
      showSuccess('Спин куплен! Теперь у вас есть дополнительное кручение');
      
    } catch (error) {
      console.error('❌ Error buying spin:', error);
      showError('Ошибка при покупке спина');
    }
  }

  // Show result modal
  function showResult(prize) {
    if (!elements.resultModal) return;

    elements.resultIcon.textContent = prize.icon;
    elements.resultTitle.textContent = 'Поздравляем!';
    elements.resultDescription.textContent = `Вы выиграли: ${prize.description}`;
    
    // Store current prize for claiming
    elements.claimPrizeBtn.dataset.prizeId = prize.id;
    
    elements.resultModal.classList.add('show');
  }

  // Handle claim prize
  async function handleClaimPrize() {
    const prizeId = elements.claimPrizeBtn.dataset.prizeId;
    const prize = PRIZES.find(p => p.id === prizeId);
    
    if (!prize) return;

    try {
      // Generate promocode
      const promocode = await generatePromocode(prize);
      
      // Add to user's promocodes
      appState.promocodes.unshift(promocode);
      
      // Update display
      updatePromocodes();
      closeResultModal();
      
      showSuccess(`Промокод ${promocode.code} добавлен в вашу ленту!`);
      
    } catch (error) {
      console.error('❌ Error claiming prize:', error);
      showError('Ошибка при получении приза');
    }
  }

  // Generate promocode
  async function generatePromocode(prize) {
    const code = `${prize.type.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
    
    const promocode = {
      code: code,
      type: prize.type,
      value: prize.value,
      issued_to: appState.userData.telegram_id,
      status: 'issued',
      prize_name: prize.name,
      prize_description: prize.description,
      category: prize.category,
      issued_at: new Date().toISOString()
    };

    try {
      if (window.__CASE_API__) {
        await window.__CASE_API__.addPromocode(promocode);
      }
    } catch (error) {
      console.error('❌ Error saving promocode to DB:', error);
    }

    return promocode;
  }

  // Close result modal
  function closeResultModal() {
    if (elements.resultModal) {
      elements.resultModal.classList.remove('show');
    }
  }

  // Show prizes modal
  function showPrizesModal() {
    const prizesContent = PRIZES.map(prize => `
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 8px;">
        <span style="font-size: 24px;">${prize.icon}</span>
        <div style="flex: 1;">
          <div style="font-weight: 600; color: #ffffff;">${prize.name}</div>
          <div style="font-size: 12px; color: #cccccc;">${prize.description}</div>
        </div>
        <div style="font-size: 12px; color: #cccccc;">${prize.chance}%</div>
      </div>
    `).join('');

    elements.resultIcon.textContent = '🎁';
    elements.resultTitle.textContent = 'Возможные призы';
    elements.resultDescription.innerHTML = `
      <div style="max-height: 300px; overflow-y: auto; text-align: left;">
        ${prizesContent}
      </div>
    `;
    
    elements.claimPrizeBtn.style.display = 'none';
    elements.closeResultBtn.textContent = 'Закрыть';
    
    elements.resultModal.classList.add('show');
    
    // Reset claim button for next time
    setTimeout(() => {
      elements.claimPrizeBtn.style.display = '';
      elements.closeResultBtn.textContent = 'Закрыть';
    }, 100);
  }

  // Load user promocodes
  async function loadPromocodes() {
    try {
      if (window.__CASE_API__ && appState.userData.telegram_id) {
        const promocodes = await window.__CASE_API__.listPromocodes(appState.userData.telegram_id);
        appState.promocodes = promocodes || [];
      } else {
        // Load from localStorage as fallback
        appState.promocodes = JSON.parse(localStorage.getItem('user_promocodes') || '[]');
      }
      
      updatePromocodes();
      
    } catch (error) {
      console.error('❌ Error loading promocodes:', error);
      appState.promocodes = [];
    }
  }

  // Update promocodes display
  function updatePromocodes() {
    if (!elements.promoList) return;

    if (appState.promocodes.length === 0) {
      elements.promoList.innerHTML = `
        <div class="empty-promo">
          Промокоды появятся после выигрышей в рулетке
        </div>
      `;
      return;
    }

    elements.promoList.innerHTML = appState.promocodes.map(promo => `
      <div class="promo-item">
        <div class="promo-info">
          <div class="promo-name">${promo.prize_name || promo.type}</div>
          <div class="promo-code">${promo.code}</div>
        </div>
        <button class="promo-action ${promo.status === 'used' ? 'used' : ''}" 
                onclick="handlePromoAction('${promo.code}', '${promo.category}')"
                ${promo.status === 'used' ? 'disabled' : ''}>
          ${promo.status === 'used' ? 'Использован' : (promo.category === 'activate' ? 'Активировать' : 'Использовать')}
        </button>
      </div>
    `).join('');

    // Save to localStorage
    localStorage.setItem('user_promocodes', JSON.stringify(appState.promocodes));
  }

  // Handle promo action
  window.handlePromoAction = async function(code, category) {
    const promo = appState.promocodes.find(p => p.code === code);
    if (!promo || promo.status === 'used') return;

    try {
      if (category === 'activate') {
        await handleActivatePromo(promo);
      } else {
        await handleUsePromo(promo);
      }
    } catch (error) {
      console.error('❌ Error handling promo action:', error);
      showError('Ошибка при обработке промокода');
    }
  };

  // Handle activate promo (automatic rewards)
  async function handleActivatePromo(promo) {
    let message = '';
    
    switch (promo.type) {
      case 'currency':
        const amount = parseInt(promo.value);
        appState.userData.mulacoin += amount;
        message = `Получено ${amount} MULACOIN!`;
        break;
        
      case 'spin':
        const spins = parseInt(promo.value);
        appState.userData.spins += spins;
        message = `Получено ${spins} дополнительных спинов!`;
        break;
        
      case 'subscription':
        // Use BotIntegration to activate subscription
        const days = parseInt(promo.value);
        if (window.BotIntegration) {
          const success = window.BotIntegration.activateSubscription(days, promo.code);
          if (success) {
            message = `Подписка на ${days} дней активируется автоматически!`;
          } else {
            message = 'Подписка будет активирована администратором. Ожидайте!';
          }
        } else {
          message = 'Подписка будет активирована администратором. Ожидайте!';
        }
        break;
    }

    // Mark as used
    promo.status = 'activated';
    
    // Update database
    if (window.__CASE_API__) {
      await window.__CASE_API__.markPromocodeUsed(promo.id, {
        status: 'activated',
        used_at: new Date().toISOString()
      });
    }

    // Update display
    updateDisplay();
    updatePromocodes();
    showSuccess(message);
  }

  // Handle use promo (manual discounts/services)
  async function handleUsePromo(promo) {
    let message = '';
    let telegramMessage = '';

    switch (promo.type) {
      case 'discount':
        const discountPercent = parseInt(promo.value);
        if (promo.id === 'discount_10') {
          const price1m = SUBSCRIPTION_PRICES['1month'];
          const price6m = SUBSCRIPTION_PRICES['6months'];
          const price12m = SUBSCRIPTION_PRICES['12months'];
          const discount1m = Math.round(price1m * discountPercent / 100);
          const discount6m = Math.round(price6m * discountPercent / 100);
          const discount12m = Math.round(price12m * discountPercent / 100);
          
          telegramMessage = `🎫 ПРОМОКОД НА СКИДКУ ${discountPercent}%\n\n` +
            `Пользователь: ${appState.userData.telegram_id}\n` +
            `Промокод: ${promo.code}\n\n` +
            `💰 ЦЕНЫ СО СКИДКОЙ:\n` +
            `• 1 месяц: ${price1m - discount1m}₽ (было ${price1m}₽)\n` +
            `• 6 месяцев: ${price6m - discount6m}₽ (было ${price6m}₽)\n` +
            `• 12 месяцев: ${price12m - discount12m}₽ (было ${price12m}₽)\n\n` +
            `Скидка действует на любую подписку!`;
        } else if (promo.id === 'discount_20_6m') {
          const price = SUBSCRIPTION_PRICES['6months'];
          const discount = Math.round(price * discountPercent / 100);
          telegramMessage = `🎫 ПРОМОКОД НА СКИДКУ ${discountPercent}%\n\n` +
            `Пользователь: ${appState.userData.telegram_id}\n` +
            `Промокод: ${promo.code}\n\n` +
            `💰 ЦЕНА СО СКИДКОЙ:\n` +
            `• 6 месяцев: ${price - discount}₽ (было ${price}₽)\n\n` +
            `Скидка действует только на подписку 6 месяцев!`;
        } else if (promo.id === 'discount_50_12m') {
          const price = SUBSCRIPTION_PRICES['12months'];
          const discount = Math.round(price * discountPercent / 100);
          telegramMessage = `🎫 ПРОМОКОД НА СКИДКУ ${discountPercent}%\n\n` +
            `Пользователь: ${appState.userData.telegram_id}\n` +
            `Промокод: ${promo.code}\n\n` +
            `💰 ЦЕНА СО СКИДКОЙ:\n` +
            `• 12 месяцев: ${price - discount}₽ (было ${price}₽)\n\n` +
            `Скидка действует только на подписку 12 месяцев!`;
        }
        break;
        
      case 'service':
        if (promo.id === 'consultation') {
          telegramMessage = `🧠 ПРОМОКОД НА КОНСУЛЬТАЦИЮ\n\n` +
            `Пользователь: ${appState.userData.telegram_id}\n` +
            `Промокод: ${promo.code}\n\n` +
            `🎁 ПРИЗ: Личная консультация\n\n` +
            `Пользователь хочет получить личную консультацию по промокоду.`;
        }
        break;
        
      case 'course':
        if (promo.id === 'frod_course') {
          telegramMessage = `🎓 ПРОМОКОД НА ОБУЧЕНИЕ ФРОДУ\n\n` +
            `Пользователь: ${appState.userData.telegram_id}\n` +
            `Промокод: ${promo.code}\n\n` +
            `🎁 ПРИЗ: Полное обучение ФРОДУ\n\n` +
            `Пользователь хочет получить доступ к полному курсу по ФРОДУ.`;
        }
        break;
    }

    // Send message to admin via BotIntegration
    if (telegramMessage) {
      if (window.BotIntegration) {
        const success = window.BotIntegration.sendToAdmin(telegramMessage, promo.code);
        if (success) {
          message = 'Сообщение отправлено администратору @warpscythe';
        } else {
          // Fallback: open direct chat
          window.BotIntegration.openAdminChat(telegramMessage);
          message = 'Переход к диалогу с администратором @warpscythe';
        }
      } else {
        // Fallback: direct link
        const encodedMessage = encodeURIComponent(telegramMessage);
        window.open(`https://t.me/warpscythe?text=${encodedMessage}`, '_blank');
        message = 'Переход к диалогу с администратором @warpscythe';
      }
    } else {
      message = 'Свяжитесь с администратором @warpscythe для использования промокода';
    }

    // Mark as used
    promo.status = 'used';
    
    // Update database
    if (window.__CASE_API__) {
      await window.__CASE_API__.markPromocodeUsed(promo.id, {
        status: 'used',
        used_at: new Date().toISOString()
      });
    }

    // Update display
    updatePromocodes();
    showSuccess(message);
  }

  // Save roulette history
  async function saveRouletteHistory(type, prize) {
    try {
      if (!window.__CASE_API__ || !appState.currentUser) return;

      const entry = {
        user_id: appState.currentUser.id,
        prize_type: type,
        prize_name: prize ? prize.name : null,
        prize_value: prize ? prize.value : null,
        created_at: new Date().toISOString()
      };

      await window.__CASE_API__.addRouletteHistory(entry);
      
    } catch (error) {
      console.error('❌ Error saving roulette history:', error);
    }
  }

  // Update display
  function updateDisplay() {
    if (elements.mulacoinAmount) {
      elements.mulacoinAmount.textContent = appState.userData.mulacoin;
    }
    
    if (elements.spinsAmount) {
      elements.spinsAmount.textContent = appState.userData.spins;
    }
    
    if (elements.spinButton && elements.spinButtonText) {
      if (appState.userData.spins > 0) {
        elements.spinButton.disabled = false;
        elements.spinButtonText.textContent = 'Крутить рулетку';
      } else {
        elements.spinButton.disabled = true;
        elements.spinButtonText.textContent = 'Нет спинов';
      }
    }
  }

  // Show success message
  function showSuccess(message) {
    // Create toast notification
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #4CAF50, #45a049);
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-weight: 600;
      z-index: 10000;
      box-shadow: 0 4px 20px rgba(76, 175, 80, 0.3);
      animation: slideInDown 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideOutUp 0.3s ease';
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
  }

  // Show error message
  function showError(message) {
    // Create toast notification
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #F44336, #d32f2f);
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-weight: 600;
      z-index: 10000;
      box-shadow: 0 4px 20px rgba(244, 67, 54, 0.3);
      animation: slideInDown 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideOutUp 0.3s ease';
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
  }

  // Initialize trading particles
  function initializeTradingParticles() {
    if (!elements.tradingParticles) return;

    const tradingData = [
      // Profit data
      '+$127.50', '+€89.20', '+£156.80', '+¥2,340', '+₿0.0045',
      '↗ BUY', '↗ LONG', '📈 +12%', '💚 PROFIT', '🚀 MOON',
      
      // Loss data
      '-$45.20', '-€67.10', '-£23.90', '-¥890', '-₿0.0012',
      '↘ SELL', '↘ SHORT', '📉 -8%', '❌ LOSS', '🔻 DIP',
      
      // Neutral data
      'HODL', 'BTC', 'ETH', 'FOREX', 'GOLD',
      'NASDAQ', 'S&P500', 'EUR/USD', 'GBP/JPY', 'OIL'
    ];

    function createParticle() {
      const particle = document.createElement('div');
      particle.className = 'trading-particle';
      
      const randomData = tradingData[Math.floor(Math.random() * tradingData.length)];
      particle.textContent = randomData;
      
      // Determine particle type based on content
      if (randomData.includes('+') || randomData.includes('↗') || randomData.includes('📈') || randomData.includes('💚') || randomData.includes('🚀')) {
        particle.classList.add('profit');
      } else if (randomData.includes('-') || randomData.includes('↘') || randomData.includes('📉') || randomData.includes('❌') || randomData.includes('🔻')) {
        particle.classList.add('loss');
      } else {
        particle.classList.add('neutral');
      }
      
      // Random starting position
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDuration = (12 + Math.random() * 8) + 's';
      particle.style.animationDelay = Math.random() * 5 + 's';
      
      elements.tradingParticles.appendChild(particle);
      
      // Remove particle after animation
      setTimeout(() => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      }, 20000);
    }

    // Create initial particles
    for (let i = 0; i < 15; i++) {
      setTimeout(createParticle, i * 1000);
    }

    // Continue creating particles
    setInterval(createParticle, 2000);
  }

  // Add CSS animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideInDown {
      from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
      to { transform: translateX(-50%) translateY(0); opacity: 1; }
    }
    @keyframes slideOutUp {
      from { transform: translateX(-50%) translateY(0); opacity: 1; }
      to { transform: translateX(-50%) translateY(-100%); opacity: 0; }
    }
  `;
  document.head.appendChild(style);

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
  } else {
    initializeApp();
  }

  // Also try initialization after a short delay
  setTimeout(initializeApp, 100);

  // Global error handler
  window.addEventListener('error', (e) => {
    console.error('❌ Global error:', e.error);
  });

  console.log('🎰 Case roulette script loaded');
})();
