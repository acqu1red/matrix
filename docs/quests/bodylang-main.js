/* ===== BODY LANGUAGE QUEST - MAIN LOGIC ===== */

// Глобальные переменные
let currentStage = 1;
let currentVideo = null;
let currentFace = null;
let selectedAnswer = null;
let correctAnswers = 0;
let totalQuestions = 0;
let startTime = null;
let attempts = 0;
let maxAttempts = 3;

// Состояние квеста
let questState = {
  psychologyCompleted: false,
  emotionsCompleted: false,
  currentQuestion: 0,
  totalQuestions: 0
};

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
  console.log('🧠 Квест "Язык тела" загружается...');
  
  // Инициализируем квест
  initializeQuest();
  
  // Привязываем обработчики событий
  bindEventHandlers();
  
  console.log('🧠 Квест "Язык тела" готов к использованию');
});

// Инициализация квеста
function initializeQuest() {
  // Показываем интро модал
  showIntroModal();
  
  // Инициализируем прогресс
  updateProgress();
  
  // Засекаем время начала
  startTime = Date.now();
}

// Привязка обработчиков событий
function bindEventHandlers() {
  // Кнопка начала квеста
  const startQuestBtn = document.getElementById('startQuest');
  if (startQuestBtn) {
    startQuestBtn.addEventListener('click', startQuest);
  }
  
  // Кнопка возврата
  const btnBack = document.getElementById('btnBack');
  if (btnBack) {
    btnBack.addEventListener('click', goBackToQuests);
  }
  
  // Кнопка завершения квеста
  const finishQuestBtn = document.getElementById('finishQuest');
  if (finishQuestBtn) {
    finishQuestBtn.addEventListener('click', goBackToQuests);
  }
  
  // Обработчики для вариантов ответов психологии
  document.addEventListener('click', function(e) {
    if (e.target.closest('.answer-option') && e.target.closest('#psychologyPhase')) {
      handlePsychologyAnswerSelection(e.target.closest('.answer-option'));
    }
  });
  
  // Обработчики для вариантов ответов эмоций
  document.addEventListener('click', function(e) {
    if (e.target.closest('.answer-option') && e.target.closest('#emotionsPhase')) {
      handleEmotionAnswerSelection(e.target.closest('.answer-option'));
    }
  });
  
  // Кнопки проверки ответов
  const checkPsychologyBtn = document.getElementById('checkPsychologyAnswer');
  if (checkPsychologyBtn) {
    checkPsychologyBtn.addEventListener('click', checkPsychologyAnswer);
  }
  
  const checkEmotionBtn = document.getElementById('checkEmotionAnswer');
  if (checkEmotionBtn) {
    checkEmotionBtn.addEventListener('click', checkEmotionAnswer);
  }
}

// Показать интро модал
function showIntroModal() {
  const modal = document.getElementById('introModal');
  if (modal) {
    modal.classList.add('show');
  }
}

// Начать квест
function startQuest() {
  // Скрываем интро модал
  const modal = document.getElementById('introModal');
  if (modal) {
    modal.classList.remove('show');
  }
  
  // Показываем основной контент
  const questContent = document.querySelector('.quest-content');
  if (questContent) {
    questContent.style.display = 'block';
  }
  
  // Загружаем первый этап
  loadPsychologyStage();
  
  // Обновляем прогресс
  updateProgress();
}

// Загрузить этап психологии лжи
function loadPsychologyStage() {
  currentStage = 1;
  attempts = 0;
  
  // Выбираем случайное видео
  const randomIndex = Math.floor(Math.random() * BODYLANG_DATA.PSYCHOLOGY_VIDEOS.length);
  currentVideo = BODYLANG_DATA.PSYCHOLOGY_VIDEOS[randomIndex];
  
  // Обновляем видео
  const videoElement = document.getElementById('psychologyVideoElement');
  if (videoElement) {
    videoElement.src = currentVideo.file;
    videoElement.load();
  }
  
  // Сбрасываем выбранный ответ
  selectedAnswer = null;
  resetAnswerOptions();
  
  // Показываем этап
  showStage(1);
  
  // Обновляем прогресс
  updateProgress();
}

// Загрузить этап эмоций
function loadEmotionsStage() {
  currentStage = 2;
  attempts = 0;
  
  // Выбираем случайное лицо
  const randomIndex = Math.floor(Math.random() * BODYLANG_DATA.EMOTION_FACES.length);
  currentFace = BODYLANG_DATA.EMOTION_FACES[randomIndex];
  
  // Обновляем изображение
  const faceImage = document.getElementById('currentFace');
  if (faceImage) {
    faceImage.src = currentFace.file;
  }
  
  // Сбрасываем выбранный ответ
  selectedAnswer = null;
  resetAnswerOptions();
  
  // Создаем варианты ответов для эмоций
  createEmotionOptions();
  
  // Показываем этап
  showStage(2);
  
  // Обновляем прогресс
  updateProgress();
}

// Показать этап
function showStage(stageNumber) {
  // Скрываем все этапы
  const stages = document.querySelectorAll('.quest-stage');
  stages.forEach(stage => stage.classList.remove('active'));
  
  // Показываем нужный этап
  const targetStage = document.getElementById(
    stageNumber === 1 ? 'psychologyPhase' : 
    stageNumber === 2 ? 'emotionsPhase' : 'resultsPhase'
  );
  
  if (targetStage) {
    targetStage.classList.add('active');
  }
  
  // Обновляем прогресс
  updateProgress();
}

// Обработка выбора ответа для психологии
function handlePsychologyAnswerSelection(optionElement) {
  // Убираем предыдущий выбор
  const options = document.querySelectorAll('#psychologyPhase .answer-option');
  options.forEach(opt => opt.classList.remove('selected'));
  
  // Выбираем новый
  optionElement.classList.add('selected');
  selectedAnswer = optionElement.dataset.answer;
  
  // Активируем кнопку проверки
  const checkBtn = document.getElementById('checkPsychologyAnswer');
  if (checkBtn) {
    checkBtn.disabled = false;
  }
}

// Обработка выбора ответа для эмоций
function handleEmotionAnswerSelection(optionElement) {
  // Убираем предыдущий выбор
  const options = document.querySelectorAll('#emotionsPhase .answer-option');
  options.forEach(opt => opt.classList.remove('selected'));
  
  // Выбираем новый
  optionElement.classList.add('selected');
  selectedAnswer = optionElement.dataset.emotion;
  
  // Активируем кнопку проверки
  const checkBtn = document.getElementById('checkEmotionAnswer');
  if (checkBtn) {
    checkBtn.disabled = false;
  }
}

// Проверить ответ психологии
function checkPsychologyAnswer() {
  if (!selectedAnswer || !currentVideo) return;
  
  attempts++;
  const isCorrect = selectedAnswer === currentVideo.correctAnswer;
  
  if (isCorrect) {
    correctAnswers++;
    totalQuestions++;
    showToast('✅ Правильно! Вы отлично проанализировали мимику!', 'success');
    
    // Переходим к следующему этапу
    setTimeout(() => {
      loadEmotionsStage();
    }, 1500);
  } else {
    showToast('❌ Неправильно! Попробуйте еще раз.', 'error');
    
    if (attempts >= maxAttempts) {
      // Показываем правильный ответ
      showCorrectPsychologyAnswer();
      
      // Переходим к следующему этапу через 3 секунды
      setTimeout(() => {
        loadEmotionsStage();
      }, 3000);
    } else {
      // Меняем видео и варианты ответов
      setTimeout(() => {
        loadNewPsychologyQuestion();
      }, 2000);
    }
  }
}

// Проверить ответ эмоций
function checkEmotionAnswer() {
  if (!selectedAnswer || !currentFace) return;
  
  attempts++;
  const isCorrect = selectedAnswer === currentFace.correctEmotion;
  
  if (isCorrect) {
    correctAnswers++;
    totalQuestions++;
    showToast('✅ Правильно! Вы отлично определили эмоцию!', 'success');
    
    // Переходим к результатам
    setTimeout(() => {
      showResults();
    }, 1500);
  } else {
    showToast('❌ Неправильно! Попробуйте еще раз.', 'error');
    
    if (attempts >= maxAttempts) {
      // Показываем правильный ответ
      showCorrectEmotionAnswer();
      
      // Переходим к результатам через 3 секунды
      setTimeout(() => {
        showResults();
      }, 3000);
    } else {
      // Меняем лицо и варианты ответов
      setTimeout(() => {
        loadNewEmotionQuestion();
      }, 2000);
    }
  }
}

// Показать правильный ответ психологии
function showCorrectPsychologyAnswer() {
  const options = document.querySelectorAll('#psychologyPhase .answer-option');
  options.forEach(option => {
    if (option.dataset.answer === currentVideo.correctAnswer) {
      option.classList.add('correct');
    } else if (option.dataset.answer === selectedAnswer) {
      option.classList.add('incorrect');
    }
  });
  
  // Показываем объяснение
  showToast(`💡 Объяснение: ${currentVideo.explanation}`, 'info');
}

// Показать правильный ответ эмоций
function showCorrectEmotionAnswer() {
  const options = document.querySelectorAll('#emotionsPhase .answer-option');
  options.forEach(option => {
    if (option.dataset.emotion === currentFace.correctEmotion) {
      option.classList.add('correct');
    } else if (option.dataset.emotion === selectedAnswer) {
      option.classList.add('incorrect');
    }
  });
  
  // Показываем объяснение
  showToast(`💡 Описание: ${currentFace.description}`, 'info');
}

// Загрузить новый вопрос психологии
function loadNewPsychologyQuestion() {
  // Выбираем другое видео
  let newVideo;
  do {
    const randomIndex = Math.floor(Math.random() * BODYLANG_DATA.PSYCHOLOGY_VIDEOS.length);
    newVideo = BODYLANG_DATA.PSYCHOLOGY_VIDEOS[randomIndex];
  } while (newVideo.id === currentVideo.id);
  
  currentVideo = newVideo;
  
  // Обновляем видео
  const videoElement = document.getElementById('psychologyVideoElement');
  if (videoElement) {
    videoElement.src = currentVideo.file;
    videoElement.load();
  }
  
  // Сбрасываем состояние
  selectedAnswer = null;
  resetAnswerOptions();
  
  // Сбрасываем попытки
  attempts = 0;
}

// Загрузить новый вопрос эмоций
function loadNewEmotionQuestion() {
  // Выбираем другое лицо
  let newFace;
  do {
    const randomIndex = Math.floor(Math.random() * BODYLANG_DATA.EMOTION_FACES.length);
    newFace = BODYLANG_DATA.EMOTION_FACES[randomIndex];
  } while (newFace.id === currentFace.id);
  
  currentFace = newFace;
  
  // Обновляем изображение
  const faceImage = document.getElementById('currentFace');
  if (faceImage) {
    faceImage.src = currentFace.file;
  }
  
  // Создаем новые варианты ответов
  createEmotionOptions();
  
  // Сбрасываем состояние
  selectedAnswer = null;
  resetAnswerOptions();
  
  // Сбрасываем попытки
  attempts = 0;
}

// Создать варианты ответов для эмоций
function createEmotionOptions() {
  if (!currentFace) return;
  
  const container = document.querySelector('#emotionsPhase .answer-options');
  if (!container) return;
  
  // Очищаем контейнер
  container.innerHTML = '';
  
  // Создаем массив с правильным ответом и случайными
  const options = [currentFace.correctEmotion];
  
  // Добавляем случайные эмоции (не повторяющиеся)
  const availableEmotions = BODYLANG_DATA.ALL_EMOTIONS.filter(
    emotion => emotion.id !== currentFace.correctEmotion
  );
  
  // Перемешиваем и берем первые 5
  const shuffled = availableEmotions.sort(() => 0.5 - Math.random());
  options.push(...shuffled.slice(0, 5).map(emotion => emotion.id));
  
  // Перемешиваем все варианты
  options.sort(() => 0.5 - Math.random());
  
  // Создаем элементы
  options.forEach(emotionId => {
    const emotion = BODYLANG_DATA.ALL_EMOTIONS.find(e => e.id === emotionId);
    if (emotion) {
      const optionElement = document.createElement('div');
      optionElement.className = 'answer-option';
      optionElement.dataset.emotion = emotion.id;
      
      optionElement.innerHTML = `
        <span class="option-icon">${emotion.icon}</span>
        <span class="option-text">${emotion.name}</span>
      `;
      
      container.appendChild(optionElement);
    }
  });
}

// Сбросить варианты ответов
function resetAnswerOptions() {
  const options = document.querySelectorAll('.answer-option');
  options.forEach(option => {
    option.classList.remove('selected', 'correct', 'incorrect');
  });
  
  // Деактивируем кнопки проверки
  const checkPsychologyBtn = document.getElementById('checkPsychologyAnswer');
  if (checkPsychologyBtn) {
    checkPsychologyBtn.disabled = true;
  }
  
  const checkEmotionBtn = document.getElementById('checkEmotionAnswer');
  if (checkEmotionBtn) {
    checkEmotionBtn.disabled = true;
  }
}

// Показать результаты
function showResults() {
  // Вычисляем точность
  const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  
  // Вычисляем время прохождения
  const completionTime = startTime ? Math.round((Date.now() - startTime) / 1000) : 0;
  
  // Обновляем статистику
  const correctAnswersElement = document.getElementById('correctAnswers');
  if (correctAnswersElement) {
    correctAnswersElement.textContent = correctAnswers;
  }
  
  const accuracyElement = document.getElementById('accuracy');
  if (accuracyElement) {
    accuracyElement.textContent = `${accuracy}%`;
  }
  
  const completionTimeElement = document.getElementById('completionTime');
  if (completionTimeElement) {
    completionTimeElement.textContent = `${completionTime} сек`;
  }
  
  // Показываем этап результатов
  showStage(3);
  
  // Обновляем прогресс
  updateProgress();
  
  // Сохраняем результаты
  saveQuestResults();
}

// Сохранить результаты квеста
function saveQuestResults() {
  // Здесь можно добавить логику сохранения в localStorage или отправки на сервер
  const results = {
    questName: 'bodylang',
    completedAt: new Date().toISOString(),
    correctAnswers,
    totalQuestions,
    accuracy: totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0,
    completionTime: startTime ? Math.round((Date.now() - startTime) / 1000) : 0
  };
  
  localStorage.setItem('bodylang_results', JSON.stringify(results));
  console.log('Результаты квеста сохранены:', results);
}

// Обновить прогресс
function updateProgress() {
  const progressFill = document.getElementById('progressFill');
  const steps = document.querySelectorAll('.step');
  
  if (progressFill) {
    const progress = (currentStage / 3) * 100;
    progressFill.style.width = `${progress}%`;
  }
  
  if (steps.length > 0) {
    steps.forEach((step, index) => {
      const stepNumber = index + 1;
      step.classList.remove('active', 'completed');
      
      if (stepNumber === currentStage) {
        step.classList.add('active');
      } else if (stepNumber < currentStage) {
        step.classList.add('completed');
      }
    });
  }
}

// Показать toast уведомление
function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  
  // Убираем предыдущие классы
  toast.className = 'toast';
  
  // Добавляем новый тип
  toast.classList.add(type);
  
  // Устанавливаем текст
  toast.textContent = message;
  
  // Показываем
  toast.classList.add('show');
  
  // Скрываем через 3 секунды
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// Вернуться к квестам
function goBackToQuests() {
  // Здесь можно добавить логику сохранения прогресса
  window.location.href = '../quests.html';
}

// Утилиты
function $(selector) {
  return document.querySelector(selector);
}

function $$(selector) {
  return document.querySelectorAll(selector);
}
