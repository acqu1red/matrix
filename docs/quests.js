// quests.js

const ALL_QUESTS = {
  'world-government': {
    id: 'world-government',
    title: 'Тайное Правительство',
    description: 'Управляй миром из тени. Плети интриги, контролируй ресурсы и решай судьбы наций. Власть ждет.',
    button: 'Начать операцию',
    archetypes: ['strategist'],
    category: 'Стратегия',
    tags: ['Сложный']
  },
  'bodylang': {
    id: 'bodylang',
    title: 'Детектор Лжи',
    description: 'Читай людей как открытую книгу. Распознавай ложь по жестам и мимике. Никто больше не сможет тебя обмануть.',
    button: 'Начать допрос',
    archetypes: ['psiholog'],
    category: 'Психология',
    tags: ['Средний']
  },
  'funnel': {
    id: 'funnel',
    title: 'Империя Влияния',
    description: 'Построй медиа-империю с нуля. Создавай вирусный контент, манипулируй мнением масс и стань королем информации.',
    button: 'Начать вещание',
    archetypes: ['biznesmen'],
    category: 'Бизнес',
    tags: ['Средний']
  },
  'copy': {
    id: 'copy',
    title: 'Первый Миллион',
    description: 'От гаражного стартапа до IPO. Принимай решения, которые приведут твой бизнес к успеху или банкротству.',
    archetypes: ['biznesmen'],
    category: 'Бизнес',
    tags: ['Средний']
  },
  'psychology': {
    id: 'psychology',
    title: 'Психология Денег',
    description: 'Вскрой код психологии переговоров. Заставь клиентов платить больше и наслаждайся своей властью.',
    archetypes: ['psiholog'],
    category: 'Психология',
    tags: ['Средний']
  },
  'competitors': {
    id: 'competitors',
    title: 'Анализ Конкурентов',
    description: 'Выйди на тропу войны. Изучи слабости врага, используй их и стань монополистом на рынке.',
    archetypes: ['biznesmen', 'strategist'],
    category: 'Стратегия',
    tags: ['Сложный']
  },
  'trends': {
    id: 'trends',
    title: 'Анализ Трендов',
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

document.addEventListener('DOMContentLoaded', initializeApp);

async function initializeApp() {
  try {
    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }
  } catch (e) {
    console.error('Telegram WebApp initialization failed', e);
  }

  const api = window.__QUEST_API__;
  const tgUser = api.getTelegramInfo();
  
  // Mock user for testing in browser
  const userId = tgUser ? tgUser.id : '123456789';

  const userProfile = await api.getUserProfile(userId);

  if (userProfile && userProfile.quest_archetype) {
    await loadMainContent(userProfile.quest_archetype);
  } else {
    initializeQuiz(userId);
  }
}

function initializeQuiz(userId) {
  const quizOverlay = document.getElementById('quizOverlay');
  quizOverlay.classList.remove('hidden');

  const quizContainer = quizOverlay.querySelector('.quiz-container');
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
  steps[currentStepIndex].classList.remove('active');
  steps[currentStepIndex + 1].classList.add('active');
}

async function finishQuiz(userId) {
  showNextStep(3); // Show spinner
  const archetype = determineArchetype(userResponses);
  
  const api = window.__QUEST_API__;
  await api.createUserProfile({
    telegram_id: userId,
    quest_archetype: archetype
  });

  setTimeout(async () => {
    const quizOverlay = document.getElementById('quizOverlay');
    quizOverlay.classList.add('hidden');
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
  document.getElementById('app').classList.remove('hidden');
  
  // Defer swiper and animations until content is visible
  setTimeout(() => {
    initializeSwiper();
    initializeScrollAnimations();
    initializeNavigation();
  }, 100);
}

function populateQuests(archetype) {
  const featuredIds = ARCHETYPE_QUESTS[archetype] || ARCHETYPE_QUESTS['strategist'];
  const featuredWrapper = document.getElementById('featuredQuestsWrapper');
  const otherWrapper = document.getElementById('otherQuestsGrid');
  
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
      <img src="./quests/assets/bg/${quest.id}.jpg" class="quest-card-bg" alt="">
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
  document.getElementById('app').addEventListener('click', (e) => {
    const questCard = e.target.closest('[data-quest]');
    if (questCard) {
      const questId = questCard.dataset.quest;
      // Check if the click was on a button inside the card
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
