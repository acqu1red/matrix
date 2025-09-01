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
    shortDescription: 'Запрещенные техники влияния.',
    modalTitle: 'Вся правда о лжи',
    modalDescription: `
      <p class="modal-intro"><strong>99% людей не умеют распознавать ложь.</strong> Этот тренинг поместит вас в 1% лучших.</p>
      <ul class="modal-features">
        <li><strong>Биологические маркеры:</strong> Как тело выдает лжеца против его воли.</li>
        <li><strong>Техники спецслужб:</strong> Методы, которые используют для допросов.</li>
        <li><strong>Практические кейсы:</strong> Разбор реальных ситуаций для оттачивания навыка.</li>
      </ul>
      <p class="modal-outro"><strong>После этого курса ни одна ложь не пройдет мимо вас.</strong></p>
    `,
    priceStars: 28,
    priceRub: '50 руб.',
    oldPriceRub: '499 руб.',
    discount: '90%',
    pdfUrl: 'products/psychology-lie.pdf'
  },
  'profiling-pro': {
    title: 'ПРОФАЙЛИНГ PRO',
    shortDescription: 'Чтение людей от А до Я.',
    modalTitle: 'Читайте людей, как книгу',
    modalDescription: `
      <p class="modal-intro"><strong>Знание — это власть.</strong> Этот курс даст вам власть над социальными взаимодействиями.</p>
      <ul class="modal-features">
        <li><strong>Психологический портрет за 5 минут:</strong> Понимайте мотивацию, страхи и желания.</li>
        <li><strong>Скрытые мотивы:</strong> Видьте то, что другие пытаются скрыть.</li>
        <li><strong>Предсказание поведения:</strong> Получите нечестное преимущество в любой коммуникации.</li>
      </ul>
      <p class="modal-outro"><strong>Ваш личный ключ к подсознанию людей.</strong></p>
    `,
    priceStars: 14,
    priceRub: '25 руб.',
    pdfUrl: 'products/profiling-pro.pdf'
  },
  'psychotypes-full': {
    title: 'ПСИХОТИПЫ: ПОЛНЫЙ КУРС',
    shortDescription: 'Запрещенные техники влияния.',
    modalTitle: 'Запрещенные техники влияния',
    modalDescription: `
      <p class="modal-intro"><strong>Это — высшая лига манипуляций.</strong> Знание психотипов — это ключ к подсознанию любого человека.</p>
      <ul class="modal-features">
        <li><strong>Полный контроль:</strong> Как заставить человека делать то, что вам нужно.</li>
        <li><strong>Запрещенные методы:</strong> Техники, которые ограничены для использования спецслужбами.</li>
        <li><strong>Мгновенное раскрытие:</strong> Узнайте о человеке все за считанные секунды.</li>
      </ul>
      <p class="modal-outro"><strong>Используйте эту силу с умом. Или без. Выбор за вами.</strong></p>
    `,
    priceStars: 500,
    priceRub: '829 руб.',
    oldPriceRub: '4999 руб.',
    discount: '83%',
    pdfUrl: 'products/psychotypes-full.pdf'
  },
  '100-female-manipulations': {
    title: '100 ЖЕНСКИХ МАНИПУЛЯЦИЙ',
    shortDescription: 'Сценарии давления и контрходы.',
    modalTitle: 'Щит от манипуляций',
    modalDescription: `
      <p class="modal-intro"><strong>Хватит быть жертвой.</strong> Больше никаких игр, в которых вы проигрываете.</p>
      <ul class="modal-features">
        <li><strong>100 реальных сценариев:</strong> От чувства вины до "ты не мужчина".</li>
        <li><strong>Четкие контрприемы:</strong> Что говорить и делать в каждой ситуации.</li>
        <li><strong>Мгновенное обезвреживание:</strong> Научитесь видеть игру наперед и всегда выходить победителем.</li>
      </ul>
      <p class="modal-outro"><strong>Верните себе контроль. Навсегда.</strong></p>
    `,
    priceStars: 12,
    priceRub: '20 руб.',
    pdfUrl: 'products/100-female-manipulations.pdf'
  }
};


// Ждем загрузки всех скриптов
document.addEventListener('DOMContentLoaded', () => {
  // Мгновенная инициализация для быстрого старта
  initializeApp();
});

async function initializeApp() {
  // --- Шаг 1: Немедленная отрисовка интерфейса ---
  // Показываем основной контент с архетипом по умолчанию, чтобы избежать задержек.
  // Это дает пользователю мгновенный отклик.
  const defaultArchetype = 'strategist'; 
  try {
    // Показываем основной контент сразу
    loadMainContent(defaultArchetype);
    
    // Инициализируем взаимодействие с продуктами
    initializeProductInteraction();
    
    // Инициализируем информационные модальные окна
    initializeInfoModals();
    
    // Фоновая загрузка данных пользователя
    const api = window.__QUEST_API__;
    if (api && api.getTelegramInfo) {
      const userInfo = await api.getTelegramInfo();
      if (userInfo && userInfo.id) {
        await loadUserDataInBackground(userInfo.id);
      }
    }
  } catch (error) {
    console.error('Ошибка инициализации:', error);
    // Fallback: показываем основной контент даже при ошибке
    loadMainContent(defaultArchetype);
    initializeProductInteraction();
    initializeInfoModals();
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

  let priceHtml = '';
  if (!isPurchased) {
    if (product.oldPriceRub) {
      priceHtml = `
        <div class="product-price">
          ${product.priceRub} <span class="old-price">${product.oldPriceRub}</span>
          <span class="discount">-${product.discount}</span>
        </div>`;
    } else {
      priceHtml = `<div class="product-price">${product.priceRub}</div>`;
    }
  }

  const buttonHtml = isPurchased
    ? `<div class="product-actions">
        <button class="product-button read-button" data-pdf-url="${product.pdfUrl}" data-pdf-title="${product.title}">Читать</button>
        <a href="${product.pdfUrl}" download class="product-button download-button">Скачать</a>
      </div>`
    : `<div class="modal-payment-options">
          <button class="payment-button primary">Карта / СБП (скоро)</button>
          <button class="payment-button payment-button-stars" data-product-id="${id}">
            Купить за ${product.priceStars} ⭐
          </button>
       </div>`;

  return `
    <div class="product-card" data-product-id="${id}">
      <div class="product-card-visible">
        <div class="product-card-header">
          <h3 class="product-title">${product.title}</h3>
          <p class="product-description-short">${product.shortDescription}</p>
        </div>
        <div class="product-price-container">
          ${priceHtml}
        </div>
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
  if (!productsGrid) return;

  productsGrid.addEventListener('click', e => {
    const card = e.target.closest('.product-card');
    if (!card) return;

    // Клик по кнопке оплаты
    if (e.target.classList.contains('payment-button-stars')) {
      e.stopPropagation(); // Предотвращаем схлопывание аккордеона
      const productId = e.target.dataset.productId;
      handlePurchase(productId);
      return;
    }

    // Клик по кнопке чтения
    if (e.target.classList.contains('read-button')) {
      e.stopPropagation();
      const pdfUrl = e.target.dataset.pdfUrl;
      const pdfTitle = e.target.dataset.pdfTitle;
      showPdfViewer(pdfUrl, pdfTitle);
      return;
    }
    
    // Логика "аккордеона"
    const isActive = card.classList.contains('active');
    document.querySelectorAll('.product-card.active').forEach(activeCard => {
      activeCard.classList.remove('active');
    });
    if (!isActive) {
      card.classList.add('active');
    }
  });

  const pdfViewerClose = document.getElementById('pdfViewerClose');
  if (pdfViewerClose) {
    pdfViewerClose.addEventListener('click', hidePdfViewer);
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
    // hideModal(productId); // Удалено, так как модальные окна больше не используются
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
  // hideModal(productId); // Удалено, так как модальные окна больше не используются
  
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

// Инициализация информационных модальных окон
function initializeInfoModals() {
  const infoLinks = document.querySelectorAll('.info-link');
  const infoModalOverlay = document.getElementById('infoModalOverlay');
  const closeButtons = document.querySelectorAll('.info-modal-close');

  // Открытие модальных окон
  infoLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const modalType = link.dataset.modal;
      openInfoModal(modalType);
    });
  });

  // Закрытие по клику на оверлей
  if (infoModalOverlay) {
    infoModalOverlay.addEventListener('click', (e) => {
      if (e.target === infoModalOverlay) {
        closeAllInfoModals();
      }
    });
  }

  // Закрытие по клику на кнопку закрытия
  closeButtons.forEach(button => {
    button.addEventListener('click', closeAllInfoModals);
  });

  // Закрытие по Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllInfoModals();
    }
  });
}

// Открытие информационного модального окна
function openInfoModal(modalType) {
  const modal = document.getElementById(`${modalType}Modal`);
  const overlay = document.getElementById('infoModalOverlay');
  
  if (modal && overlay) {
    // Скрываем все модальные окна
    closeAllInfoModals();
    
    // Показываем нужное
    modal.classList.remove('hidden');
    overlay.classList.remove('hidden');
    
    // Анимация появления
    modal.style.opacity = '0';
    modal.style.transform = 'translate(-50%, -50%) scale(0.9)';
    
    setTimeout(() => {
      modal.style.transition = 'all 0.3s ease';
      modal.style.opacity = '1';
      modal.style.transform = 'translate(-50%, -50%) scale(1)';
    }, 10);
  }
}

// Закрытие всех информационных модальных окон
function closeAllInfoModals() {
  const modals = document.querySelectorAll('.info-modal');
  const overlay = document.getElementById('infoModalOverlay');
  
  modals.forEach(modal => {
    modal.classList.add('hidden');
    modal.style.transition = 'none';
    modal.style.opacity = '';
    modal.style.transform = '';
  });
  
  if (overlay) {
    overlay.classList.add('hidden');
  }
}
