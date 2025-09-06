/* ===== BODY LANGUAGE QUEST DATA ===== */

// Данные для этапа "Психология лжи"
const PSYCHOLOGY_VIDEOS = [
  {
    id: 'rf_01_skepticism',
    file: '../assets/videos/rf_01_skepticism.mp4',
    correctAnswer: 'lie',
    explanation: 'Человек демонстрирует признаки лжи: избегание прямого взгляда, нервные движения, неопределенные формулировки.',
    difficulty: 'medium'
  },
  {
    id: 'rf_02_anger',
    file: '../assets/videos/rf_02_anger.mp4',
    correctAnswer: 'truth',
    explanation: 'Эмоции гнева выглядят искренними: естественная мимика, соответствующие жесты, последовательность в рассказе.',
    difficulty: 'easy'
  },
  {
    id: 'rf_03_anxiety',
    file: '../assets/videos/rf_03_anxiety.mp4',
    correctAnswer: 'lie',
    explanation: 'Признаки обмана: противоречия в рассказе, излишняя детализация, защитные жесты.',
    difficulty: 'hard'
  },
  {
    id: 'rf_04_determination',
    file: '../assets/videos/rf_04_determination.mp4',
    correctAnswer: 'truth',
    explanation: 'Решительность и уверенность проявляются естественно: прямой взгляд, твердый голос, открытая поза.',
    difficulty: 'medium'
  },
  {
    id: 'rf_05_dominance',
    file: '../assets/videos/rf_05_dominance.mp4',
    correctAnswer: 'lie',
    explanation: 'Попытка создать ложное впечатление доминирования: преувеличенная уверенность, несоответствие слов и мимики.',
    difficulty: 'hard'
  }
];

// Данные для этапа "Эмоции и чувства"
const EMOTION_FACES = [
  {
    id: 'face_001_dominance',
    file: '../assets/bodylang/faces/face_001_dominance.png',
    correctEmotion: 'dominance',
    description: 'Лицо выражает уверенность и доминирование: приподнятая голова, прямой взгляд, напряженная челюсть.',
    difficulty: 'medium'
  },
  {
    id: 'face_002_uncertainty',
    file: '../assets/bodylang/faces/face_002_uncertainty.png',
    correctEmotion: 'uncertainty',
    description: 'Признаки неуверенности: нахмуренные брови, сомневающийся взгляд, слегка приоткрытый рот.',
    difficulty: 'easy'
  },
  {
    id: 'face_003_happy',
    file: '../assets/bodylang/faces/face_003_happy.png',
    correctEmotion: 'happiness',
    description: 'Искренняя радость: приподнятые уголки рта, морщинки вокруг глаз, расслабленная мимика.',
    difficulty: 'easy'
  },
  {
    id: 'face_004_angry',
    file: '../assets/bodylang/faces/face_004_angry.png',
    correctEmotion: 'anger',
    description: 'Гнев: сведенные брови, напряженная челюсть, суженные глаза, сжатые губы.',
    difficulty: 'medium'
  },
  {
    id: 'face_005_skeptic',
    file: '../assets/bodylang/faces/face_005_skeptic.png',
    correctEmotion: 'skepticism',
    description: 'Скептицизм: приподнятая бровь, сомневающийся взгляд, слегка приоткрытый рот.',
    difficulty: 'hard'
  },
  {
    id: 'face_006_surprise',
    file: '../assets/bodylang/faces/face_006_surprise.png',
    correctEmotion: 'surprise',
    description: 'Удивление: приподнятые брови, широко открытые глаза, приоткрытый рот.',
    difficulty: 'medium'
  },
  {
    id: 'face_007_contempt',
    file: '../assets/bodylang/faces/face_007_contempt.png',
    correctEmotion: 'contempt',
    description: 'Презрение: приподнятый угол рта с одной стороны, холодный взгляд, напряженная мимика.',
    difficulty: 'hard'
  },
  {
    id: 'face_008_fear',
    file: '../assets/bodylang/faces/face_008_fear.png',
    correctEmotion: 'fear',
    description: 'Страх: широко открытые глаза, приподнятые брови, напряженная мимика, бледность.',
    difficulty: 'medium'
  },
  {
    id: 'face_009_interest',
    file: '../assets/bodylang/faces/face_009_interest.png',
    correctEmotion: 'interest',
    description: 'Интерес: приподнятые брови, внимательный взгляд, слегка приоткрытый рот.',
    difficulty: 'easy'
  },
  {
    id: 'face_010_determination',
    file: '../assets/bodylang/faces/face_010_determination.png',
    correctEmotion: 'determination',
    description: 'Решительность: сжатые губы, прямой взгляд, напряженная челюсть, твердое выражение.',
    difficulty: 'medium'
  }
];

// Все возможные эмоции для вариантов ответов
const ALL_EMOTIONS = [
  { id: 'dominance', name: 'Доминирование', icon: '👑', description: 'Уверенность и превосходство' },
  { id: 'uncertainty', name: 'Неуверенность', icon: '🤔', description: 'Сомнение и колебание' },
  { id: 'happiness', name: 'Счастье', icon: '😊', description: 'Радость и удовольствие' },
  { id: 'anger', name: 'Гнев', icon: '😠', description: 'Раздражение и злость' },
  { id: 'skepticism', name: 'Скептицизм', icon: '🤨', description: 'Недоверие и сомнение' },
  { id: 'surprise', name: 'Удивление', icon: '😲', description: 'Неожиданность и изумление' },
  { id: 'contempt', name: 'Презрение', icon: '😏', description: 'Пренебрежение и надменность' },
  { id: 'fear', name: 'Страх', icon: '😨', description: 'Боязнь и тревога' },
  { id: 'interest', name: 'Интерес', icon: '🤓', description: 'Любопытство и внимание' },
  { id: 'determination', name: 'Решительность', icon: '💪', description: 'Твердость и настойчивость' },
  { id: 'sadness', name: 'Грусть', icon: '😢', description: 'Печаль и тоска' },
  { id: 'disgust', name: 'Отвращение', icon: '🤢', description: 'Неприязнь и отторжение' }
];

// Настройки квеста
const QUEST_CONFIG = {
  name: 'Язык тела',
  description: 'Изучите психологию лжи и научитесь читать эмоции по мимике',
  stages: 2,
  rewards: {
    mulacoin: 2,
    experience: 150,
    achievement: 'Психолог'
  },
  difficulty: 'medium',
  timeLimit: null, // Без ограничения по времени
  maxAttempts: 3 // Максимум 3 попытки на этап
};

// Подсказки для пользователей
const HINTS = {
  psychology: [
    'Обратите внимание на глаза говорящего - избегание прямого взгляда может указывать на ложь',
    'Следите за жестами - нервные движения часто выдают обман',
    'Анализируйте последовательность рассказа - противоречия могут указывать на ложь',
    'Обратите внимание на голос - изменения в тоне могут быть признаком обмана'
  ],
  emotions: [
    'Изучите выражение глаз - они часто выдают истинные эмоции',
    'Обратите внимание на положение бровей - они многое говорят об эмоциональном состоянии',
    'Анализируйте форму рта - улыбка может быть как искренней, так и фальшивой',
    'Рассмотрите общее напряжение лица - оно указывает на эмоциональное состояние'
  ]
};

// Экспорт данных
window.BODYLANG_DATA = {
  PSYCHOLOGY_VIDEOS,
  EMOTION_FACES,
  ALL_EMOTIONS,
  QUEST_CONFIG,
  HINTS
};
