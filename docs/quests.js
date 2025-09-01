// quests.js

const ALL_QUESTS = {
  'world-government': {
    id: 'world-government',
    title: 'ТАЙНОЕ ПРАВИТЕЛЬСТВО',
    description: 'Управляй миром из тени. Плети интриги, контролируй ресурсы и решай судьбы наций. Власть ждет.',
    button: 'Начать операцию',
    archetypes: ['strategist'],
    category: 'Стратегия',
    tags: ['Сложный']
  },
  'bodylang': {
    id: 'bodylang',
    title: 'ДЕТЕКТОР ЛЖИ',
    description: 'Читай людей как открытую книгу. Распознавай ложь по жестам и мимике. Никто больше не сможет тебя обмануть.',
    button: 'Начать допрос',
    archetypes: ['psiholog'],
    category: 'Психология',
    tags: ['Средний']
  },
  'funnel': {
    id: 'funnel',
    title: 'ИМПЕРИЯ ВЛИЯНИЯ',
    description: 'Построй медиа-империю с нуля. Создавай вирусный контент, манипулируй мнением масс и стань королем информации.',
    button: 'Начать вещание',
    archetypes: ['biznesmen'],
    category: 'Бизнес',
    tags: ['Средний']
  },
  'copy': {
    id: 'copy',
    title: 'ПЕРВЫЙ МИЛЛИОН',
    description: 'От гаражного стартапа до IPO. Принимай решения, которые приведут твой бизнес к успеху или банкротству.',
    archetypes: ['biznesmen'],
    category: 'Бизнес',
    tags: ['Средний']
  },
  'psychology': {
    id: 'psychology',
    title: 'ПСИХОЛОГИЯ ЛЖИ',
    description: 'Вскрой код психологии переговоров. Заставь клиентов платить больше и наслаждайся своей властью.',
    archetypes: ['psiholog'],
    category: 'Психология',
    tags: ['Средний']
  },
  'competitors': {
    id: 'competitors',
    title: 'АНАЛИЗ КОНКУРЕНТОВ',
    description: 'Выйди на тропу войны. Изучи слабости врага, используй их и стань монополистом на рынке.',
    archetypes: ['biznesmen', 'strategist'],
    category: 'Стратегия',
    tags: ['Сложный']
  },
  'trends': {
    id: 'trends',
    title: 'АНАЛИЗ ТРЕНДОВ',
    description: 'Предсказывай будущее. Анализируй данные, находи тренды до того, как они станут мейнстримом, и зарабатывай.',
    archetypes: ['strategist'],
    category: 'Аналитика',
    tags: ['Сложный']
  }
};

const ARCHETYPE_QUESTS = {
  'strategist': ['world-government', 'trends', 'competitors'],
  'psiholog': ['bodylang', 'psychology', 'funnel'],
  'biznesmen': ['funnel', 'copy', 'competitors']
};

let swiperInstance = null;
const userResponses = [];
let userPurchases = [];
let currentUserId = null;
const ADMIN_ID = '708907063'; // ID администратора

const PRODUCTS = {
  'psychology-lie': {
    title: 'ПСИХОЛОГИЯ ЛЖИ',
    shortDescription: 'Маркеры, биология, распознавание.',
    modalTitle: 'Вся правда о лжи',
    modalDescription: 'Этот тренинг — ваш личный детектор лжи. Вы научитесь видеть то, что скрыто за словами. Мы разберем реальные кейсы, научим вас замечать микровыражения и неосознанные жесты, которые выдают обманщика с головой. После этого курса ни одна ложь не пройдет мимо вас.',
    priceStars: 28,
    priceRub: '50 руб.',
    pdfUrl: 'products/psychology-lie.pdf',
    specialOffer: 'Спец. предложение'
  },
  'profiling-pro': {
    title: 'ПРОФАЙЛИНГ PRO',
    shortDescription: 'Чтение людей от А до Я.',
    modalTitle: 'Читайте людей, как книгу',
    modalDescription: 'Станьте мастером профайлинга. Вы сможете за 5 минут составить полный психологический портрет человека, понять его мотивацию, страхи и желания. Этот навык даст вам невероятное преимущество в бизнесе, переговорах и личной жизни.',
    priceStars: 14,
    priceRub: '25 руб.',
    pdfUrl: 'products/profiling-pro.pdf'
  },
  'psychotypes-full': {
    title: 'ПСИХОТИПЫ: ПОЛНЫЙ КУРС',
    shortDescription: 'Запрещенные техники влияния.',
    modalTitle: 'Запрещенные техники влияния',
    modalDescription: 'Это — высшая лига. Знание психотипов дает вам ключи к управлению реальностью. Вы будете знать, как думает и что сделает человек еще до того, как он это осознает. Техники, которые вы изучите, настолько мощные, что их использование ограничено спецслужбами. Применяйте с умом.',
    priceStars: 1000,
    priceRub: '1790 руб.',
    pdfUrl: 'products/psychotypes-full.pdf',
    specialOffer: 'Уникальное предложение'
  },
  '100-female-manipulations': {
    title: '100 ЖЕНСКИХ МАНИПУЛЯЦИЙ',
    shortDescription: 'Сценарии давления и контрходы.',
    modalTitle: 'Щит от манипуляций',
    modalDescription: 'Больше никаких игр, в которых вы проигрываете. Мы собрали 100 самых частых женских манипуляций и дали на каждую из них четкий, быстрый и эффективный контрприем. Вы научитесь видеть игру наперед и всегда выходить победителем.',
    priceStars: 12,
    priceRub: '20 руб.',
    pdfUrl: 'products/100-female-manipulations.pdf'
  }
};


// Ждем загрузки всех скриптов
document.addEventListener('DOMContentLoaded', () => {
  // Даем время на инициализацию supabaseClient
  setTimeout(initializeApp, 100);
});

async function initializeApp() {
  try {
    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }
  } catch (e) {
    console.error('Telegram WebApp initialization failed', e);
  }

  // Проверяем доступность API
  const api = window.__QUEST_API__;
  if (!api) {
    console.warn("Supabase client API not initialized. Running in mock mode.");
    // В режиме мок-данных сразу показываем опрос
    initializeQuiz('mock_user_12345');
    return;
  }
  
  try {
    const tgUser = api.getTelegramInfo();
    
    // Улучшенная логика для тестирования в браузере
    currentUserId = tgUser ? tgUser.id.toString() : 'mock_user_12345';

    userPurchases = await api.getUserPurchases(currentUserId);
    
    const userProfile = await api.getUserProfile(currentUserId);

    if (userProfile && userProfile.quest_archetype) {
      await loadMainContent(userProfile.quest_archetype);
    } else {
      initializeQuiz(currentUserId);
    }
  } catch (error) {
    console.error("Error during app initialization:", error);
    // В случае ошибки показываем опрос
    initializeQuiz('error_user_12345');
  }
}

function initializeQuiz(userId) {
  const quizOverlay = document.getElementById('quizOverlay');
  if (!quizOverlay) {
    console.error("Quiz overlay not found!");
    return;
  }
  
  quizOverlay.classList.remove('hidden');

  const quizContainer = quizOverlay.querySelector('.quiz-container');
  if (!quizContainer) {
    console.error("Quiz container not found!");
    return;
  }
  
  quizContainer.addEventListener('click', async (e) => {
    const target = e.target;
    if (target.dataset.action === 'next-step') {
      showNextStep(0);
    } else if (target.classList.contains('quiz-option')) {
      const archetype = target.dataset.archetype;
      userResponses.push(archetype);
      
      const currentStep = target.closest('.quiz-step');
      const stepIndex = parseInt(currentStep.dataset.step, 10);

      if (stepIndex < 3) {
        showNextStep(stepIndex);
      } else {
        await finishQuiz(userId);
      }
    }
  });
}

function showNextStep(currentStepIndex) {
  const steps = document.querySelectorAll('.quiz-step');
  if (steps[currentStepIndex]) {
    steps[currentStepIndex].classList.remove('active');
  }
  if (steps[currentStepIndex + 1]) {
    steps[currentStepIndex + 1].classList.add('active');
  }
}

async function finishQuiz(userId) {
  showNextStep(3); // Show spinner
  const archetype = determineArchetype(userResponses);
  
  // Пытаемся сохранить в Supabase, но не блокируем работу приложения
  try {
    const api = window.__QUEST_API__;
    if (api && api.createUserProfile) {
      await api.createUserProfile({
        telegram_id: userId,
        quest_archetype: archetype
      });
    }
  } catch (error) {
    console.warn("Failed to save user profile:", error);
  }

  setTimeout(async () => {
    const quizOverlay = document.getElementById('quizOverlay');
    if (quizOverlay) {
      quizOverlay.classList.add('hidden');
    }
    await loadMainContent(archetype);
  }, 1500);
}

function determineArchetype(responses) {
  const counts = responses.reduce((acc, vote) => {
    acc[vote] = (acc[vote] || 0) + 1;
    return acc;
  }, {});
  return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
}

async function loadMainContent(archetype) {
  populateQuests(archetype);
  populateProducts(); // Новая функция для отображения продуктов
  const app = document.getElementById('app');
  if (app) {
    app.classList.remove('hidden');
  }
  
  // Defer swiper and animations until content is visible
  setTimeout(() => {
    initializeSwiper();
    initializeScrollAnimations();
    initializeNavigation();
    initializeProductInteraction(); // Новая функция для интерактивности продуктов
  }, 100);
}

function populateQuests(archetype) {
  const featuredIds = ARCHETYPE_QUESTS[archetype] || ARCHETYPE_QUESTS['strategist'];
  const featuredWrapper = document.getElementById('featuredQuestsWrapper');
  const otherWrapper = document.getElementById('otherQuestsGrid');
  
  if (!featuredWrapper || !otherWrapper) {
    console.error("Quest wrappers not found!");
    return;
  }
  
  featuredWrapper.innerHTML = '';
  otherWrapper.innerHTML = '';

  const featuredHtml = featuredIds.map(id => createFeaturedQuestCard(ALL_QUESTS[id])).join('');
  featuredWrapper.innerHTML = featuredHtml;

  const otherIds = Object.keys(ALL_QUESTS).filter(id => !featuredIds.includes(id));
  const otherHtml = otherIds.map(id => createOtherQuestCard(ALL_QUESTS[id])).join('');
  otherWrapper.innerHTML = otherHtml;
}

function createFeaturedQuestCard(quest) {
  return `
    <div class="swiper-slide" data-quest="${quest.id}">
      <div class="quest-card-overlay"></div>
      <div class="quest-card-content">
        <h3 class="quest-card-title">${quest.title}</h3>
        <p class="quest-card-description">${quest.description}</p>
        <button class="quest-card-button">${quest.button || 'Начать'}</button>
      </div>
    </div>`;
}

function createOtherQuestCard(quest) {
  return `
    <div class="quest-item" data-quest="${quest.id}" data-animate>
      <div class="quest-header">
        <span class="quest-category">${quest.category}</span>
        <h3 class="quest-title">${quest.title}</h3>
      </div>
      <p class="quest-description">${quest.description}</p>
      <div class="quest-footer">
        <div class="quest-tags">
          ${quest.tags.map(tag => `<span class="quest-tag">${tag}</span>`).join('')}
        </div>
        <button class="quest-button">Начать</button>
      </div>
    </div>`;
}

function initializeSwiper() {
  if (swiperInstance) {
    swiperInstance.destroy(true, true);
  }
  
  const swiperContainer = document.querySelector('.swiper-container');
  if (!swiperContainer) {
    console.error("Swiper container not found!");
    return;
  }
  
  swiperInstance = new Swiper('.swiper-container', {
    effect: 'coverflow',
    grabCursor: true,
    centeredSlides: true,
    slidesPerView: 'auto',
    loop: true,
    loopedSlides: 3, // Ensure there are enough cloned slides for smooth looping
    coverflowEffect: {
      rotate: 0,
      stretch: 80,
      depth: 200,
      modifier: 1,
      slideShadows: false,
    },
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
    },
  });
}

function initializeScrollAnimations() {
  const animatedElements = document.querySelectorAll('[data-animate]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  animatedElements.forEach(el => observer.observe(el));
}

function initializeNavigation() {
  const app = document.getElementById('app');
  if (!app) return;
  
  app.addEventListener('click', (e) => {
    const questCard = e.target.closest('[data-quest]');
    if (questCard) {
      const questId = questCard.dataset.quest;
      // Проверяем, был ли клик именно по кнопке
      if (e.target.matches('.quest-card-button, .quest-button')) {
        navigateTo(`quests/${questId}.html`);
      }
    }
  });
}

function navigateTo(url) {
  document.body.style.opacity = '0';
  setTimeout(() => {
    window.location.href = url;
  }, 300);
}

function populateProducts() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;
  
  let productsHtml = '';
  for (const id in PRODUCTS) {
    productsHtml += createProductCard(id, PRODUCTS[id]);
  }
  grid.innerHTML = productsHtml;
}

function createProductCard(id, product) {
  const isPurchased = userPurchases.includes(id);
  
  const buttonHtml = isPurchased
    ? `<button class="product-button read-button" data-pdf-url="${product.pdfUrl}" data-pdf-title="${product.title}">Читать</button>`
    : `<button class="product-button buy-button">Купить</button>`;

  const priceHtml = !isPurchased ? `<div class="product-price">${product.priceRub}</div>` : '';

  const specialOfferHtml = product.specialOffer 
    ? `<div class="special-offer-badge">${product.specialOffer}</div>` 
    : '';

  return `
    <div class="product-card" data-product-id="${id}" data-special="${product.specialOffer || ''}">
      ${specialOfferHtml}
      <div class="product-card-visible">
        <div class="product-card-header">
          <h3 class="product-title">${product.title}</h3>
          <p class="product-description-short">${product.shortDescription}</p>
        </div>
        ${priceHtml}
      </div>
      <div class="product-card-hidden">
        <p class="product-description-full">${product.modalDescription}</p>
        <div class="product-footer">
          ${buttonHtml}
        </div>
      </div>
    </div>
  `;
}

function initializeProductInteraction() {
  const productsGrid = document.getElementById('productsGrid');
  const modalContainer = document.getElementById('modalContainer');
  
  if (!productsGrid || !modalContainer) return;

  // Генерация модальных окон
  let modalsHtml = '';
  for (const id in PRODUCTS) {
    modalsHtml += createProductModal(id, PRODUCTS[id]);
  }
  modalContainer.innerHTML = modalsHtml;

  // Обработчики событий для карточек
  productsGrid.addEventListener('click', e => {
    const card = e.target.closest('.product-card');
    if (!card) return;

    // Логика "аккордеона"
    const isActive = card.classList.contains('active');
    
    // Сначала убираем active со всех карточек
    document.querySelectorAll('.product-card.active').forEach(activeCard => {
      if (activeCard !== card) {
        activeCard.classList.remove('active');
      }
    });

    // Затем переключаем класс на текущей карточке
    card.classList.toggle('active');

    // Открытие модального окна по кнопке "Купить"
    if (e.target.classList.contains('buy-button') && card.classList.contains('active')) {
      const productId = card.dataset.productId;
      showModal(productId);
    } else if (e.target.classList.contains('read-button')) {
      const pdfUrl = e.target.dataset.pdfUrl;
      const pdfTitle = e.target.dataset.pdfTitle;
      showPdfViewer(pdfUrl, pdfTitle);
    }
  });

  modalContainer.addEventListener('click', e => {
    if (e.target.classList.contains('product-modal-close')) {
      const modal = e.target.closest('.product-modal-overlay');
      hideModal(modal.dataset.productId);
    }
    if (e.target.classList.contains('payment-button-stars')) {
      const productId = e.target.dataset.productId;
      handlePurchase(productId);
    }
  });
  
  const pdfViewerClose = document.getElementById('pdfViewerClose');
  if (pdfViewerClose) {
    pdfViewerClose.addEventListener('click', hidePdfViewer);
  }
}

function createProductModal(id, product) {
  return `
    <div class="product-modal-overlay" data-product-id="${id}">
      <div class="product-modal">
        <button class="product-modal-close">&times;</button>
        <h2 class="modal-title">${product.modalTitle}</h2>
        <p class="modal-description">${product.modalDescription}</p>
        <div class="modal-payment-options">
          <button class="payment-button">Карта / СБП (в разработке)</button>
          <button class="payment-button payment-button-stars" data-product-id="${id}">
            Купить за ${product.priceStars} ⭐
          </button>
        </div>
      </div>
    </div>
  `;
}

function showModal(productId) {
  const modal = document.querySelector(`.product-modal-overlay[data-product-id="${productId}"]`);
  if (modal) {
    modal.classList.add('visible');
  }
}

function hideModal(productId) {
  const modal = document.querySelector(`.product-modal-overlay[data-product-id="${productId}"]`);
  if (modal) {
    modal.classList.remove('visible');
  }
}

async function handlePurchase(productId) {
  const product = PRODUCTS[productId];
  
  if (currentUserId === ADMIN_ID) {
    console.log("Админский доступ. Покупка без оплаты.");
    await onSuccessfulPurchase(productId);
    return;
  }
  
  // Новый флоу: отправляем команду боту для создания счета
  if (window.Telegram && window.Telegram.WebApp) {
    Telegram.WebApp.sendData(JSON.stringify({
      command: 'create_invoice',
      productId: productId,
      price: product.priceStars
    }));
    Telegram.WebApp.showAlert('Счет на оплату отправлен в ваш чат с ботом!');
    hideModal(productId);
  } else {
    // Fallback для теста в браузере
    console.log("WebApp недоступен. Симуляция успешной оплаты.");
    await onSuccessfulPurchase(productId);
  }
}

async function onSuccessfulPurchase(productId) {
  const api = window.__QUEST_API__;
  const product = PRODUCTS[productId];

  // 1. Сохраняем покупку в Supabase
  await api.addUserPurchase(currentUserId, productId);
  
  // 2. Обновляем локальный список покупок
  userPurchases.push(productId);
  
  // 3. Обновляем карточку продукта в UI
  populateProducts();

  // 4. Закрываем модальное окно
  hideModal(productId);
  
  // 5. Показываем PDF
  setTimeout(() => {
    showPdfViewer(product.pdfUrl, product.title);
  }, 500); // Небольшая задержка для плавности
}

function showPdfViewer(pdfUrl, pdfTitle) {
  const overlay = document.getElementById('pdfViewerOverlay');
  const titleEl = document.getElementById('pdfTitle');
  const frameEl = document.getElementById('pdfFrame');
  const downloadLink = document.getElementById('pdfDownloadLink');

  if (overlay && titleEl && frameEl && downloadLink) {
    titleEl.textContent = pdfTitle;
    frameEl.src = pdfUrl;
    downloadLink.href = pdfUrl;
    overlay.classList.remove('hidden');
  }
}

function hidePdfViewer() {
  const overlay = document.getElementById('pdfViewerOverlay');
  if (overlay) {
    overlay.classList.add('hidden');
    // Очищаем iframe, чтобы остановить загрузку/воспроизведение
    const frameEl = document.getElementById('pdfFrame');
    if (frameEl) frameEl.src = '';
  }
}
