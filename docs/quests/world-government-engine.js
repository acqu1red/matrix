/* ===== WORLD GOVERNMENT ENGINE ===== */

// Основной движок квеста "Тайное мировое сообщество"
class WorldGovernmentEngine {
  constructor() {
    this.sectors = {};
    this.characters = [];
    this.currentStage = 'setup';
    this.gameState = {
      stability: 50,
      influence: 50,
      control: 50,
      power: 50,
      security: 50,
      intimidation: 50,
      wealth: 50,
      innovation: 50
    };
    this.stories = null;
    this.audioController = null;
    this.videoController = null;
    
    this.initializeEngine();
  }
  
  // Инициализация движка
  initializeEngine() {
    this.initializeSectors();
    this.initializeCharacters();
    this.stories = new WorldGovernmentStories();
    this.audioController = new AudioController();
    this.videoController = new VideoController();
    
    console.log('🌍 World Government Engine initialized');
  }
  
  // Инициализация секторов
  initializeSectors() {
    this.sectors = {
      political: {
        id: 'political',
        name: 'Политический штаб',
        maxMembers: 4,
        members: [],
        description: 'Управление политическими процессами и международными отношениями',
        icon: '🏛️',
        color: '#4ecdc4',
        effects: { stability: 25, influence: 30, control: 20 }
      },
      military: {
        id: 'military',
        name: 'Военный штаб',
        maxMembers: 3,
        members: [],
        description: 'Контроль над вооруженными силами и стратегическими объектами',
        icon: '⚔️',
        color: '#ff6b6b',
        effects: { power: 30, security: 25, intimidation: 20 }
      },
      economic: {
        id: 'economic',
        name: 'Экономический штаб',
        maxMembers: 2,
        members: [],
        description: 'Управление мировыми финансами и экономическими процессами',
        icon: '💰',
        color: '#feca57',
        effects: { wealth: 30, control: 25, influence: 20 }
      },
      research: {
        id: 'research',
        name: 'Исследовательский штаб',
        maxMembers: 2,
        members: [],
        description: 'Разработка передовых технологий и научных прорывов',
        icon: '🔬',
        color: '#48dbfb',
        effects: { innovation: 30, power: 20, control: 15 }
      },
      propaganda: {
        id: 'propaganda',
        name: 'Пропагандистский штаб',
        maxMembers: 3,
        members: [],
        description: 'Контроль над СМИ и формирование общественного мнения',
        icon: '📺',
        color: '#ff9ff3',
        effects: { influence: 25, control: 20, stability: 15 }
      }
    };
  }
  
  // Инициализация персонажей
  initializeCharacters() {
    this.characters = [...WORLD_GOVERNMENT_CHARACTERS];
  }
  
  // Получение доступных персонажей для сектора
  getAvailableCharactersForSector(sectorId) {
    return this.characters.filter(char => char.sector === sectorId);
  }
  
  // Получение персонажей в секторе
  getSectorMembers(sectorId) {
    return this.sectors[sectorId].members;
  }
  
  // Добавление персонажа в сектор
  addCharacterToSector(characterId, sectorId) {
    const character = this.characters.find(c => c.id === characterId);
    const sector = this.sectors[sectorId];
    
    if (!character || !sector) {
      console.error('Character or sector not found');
      return false;
    }
    
    if (sector.members.length >= sector.maxMembers) {
      console.error('Sector is full');
      return false;
    }
    
    // Проверяем, не находится ли персонаж уже в другом секторе
    this.removeCharacterFromAllSectors(characterId);
    
    // Добавляем персонажа в сектор
    sector.members.push({
      ...character,
      assignedAt: Date.now()
    });
    
    // Обновляем статистику
    this.updateGameStats();
    
    console.log(`Added ${character.name} to ${sector.name}`);
    return true;
  }
  
  // Удаление персонажа из сектора
  removeCharacterFromSector(characterId, sectorId) {
    const sector = this.sectors[sectorId];
    if (!sector) return false;
    
    const index = sector.members.findIndex(m => m.id === characterId);
    if (index !== -1) {
      sector.members.splice(index, 1);
      this.updateGameStats();
      return true;
    }
    
    return false;
  }
  
  // Удаление персонажа из всех секторов
  removeCharacterFromAllSectors(characterId) {
    Object.values(this.sectors).forEach(sector => {
      this.removeCharacterFromSector(characterId, sector.id);
    });
  }
  
  // Перемещение персонажа между секторами
  moveCharacter(characterId, fromSectorId, toSectorId) {
    if (fromSectorId === toSectorId) return false;
    
    const character = this.sectors[fromSectorId]?.members.find(m => m.id === characterId);
    if (!character) return false;
    
    if (this.addCharacterToSector(characterId, toSectorId)) {
      this.removeCharacterFromSector(characterId, fromSectorId);
      return true;
    }
    
    return false;
  }
  
  // Обновление игровой статистики
  updateGameStats() {
    // Сбрасываем базовые значения
    Object.keys(this.gameState).forEach(key => {
      this.gameState[key] = 50;
    });
    
    // Применяем эффекты от секторов
    Object.values(this.sectors).forEach(sector => {
      if (sector.members.length > 0) {
        Object.entries(sector.effects).forEach(([stat, value]) => {
          if (this.gameState.hasOwnProperty(stat)) {
            this.gameState[stat] += value;
          }
        });
      }
    });
    
    // Применяем эффекты от персонажей
    Object.values(this.sectors).forEach(sector => {
      sector.members.forEach(member => {
        if (member.compatibility) {
          Object.entries(member.compatibility).forEach(([sectorType, value]) => {
            const sectorEffect = this.sectors[sectorType]?.effects;
            if (sectorEffect) {
              Object.entries(sectorEffect).forEach(([stat, effectValue]) => {
                if (this.gameState.hasOwnProperty(stat)) {
                  this.gameState[stat] += (value / 100) * effectValue;
                }
              });
            }
          });
        }
      });
    });
    
    // Ограничиваем значения от 0 до 100
    Object.keys(this.gameState).forEach(key => {
      this.gameState[key] = Math.max(0, Math.min(100, Math.round(this.gameState[key])));
    });
  }
  
  // Получение общей оценки эффективности
  getOverallScore() {
    const values = Object.values(this.gameState);
    const average = values.reduce((sum, val) => sum + val, 0) / values.length;
    return Math.round(average);
  }
  
  // Получение оценки сектора
  getSectorScore(sectorId) {
    const sector = this.sectors[sectorId];
    if (!sector || sector.members.length === 0) return 0;
    
    let score = 0;
    sector.members.forEach(member => {
      if (member.compatibility && member.compatibility[sectorId]) {
        score += member.compatibility[sectorId];
      }
    });
    
    return Math.round(score / sector.members.length);
  }
  
  // Проверка возможности завершения квеста
  canFinishQuest() {
    let totalMembers = 0;
    let filledSectors = 0;
    
    Object.values(this.sectors).forEach(sector => {
      if (sector.members.length > 0) {
        filledSectors++;
        totalMembers += sector.members.length;
      }
    });
    
    // Требуется минимум 3 сектора с персонажами и минимум 6 персонажей
    return filledSectors >= 3 && totalMembers >= 6;
  }
  
  // Генерация результатов квеста
  generateQuestResults() {
    if (!this.canFinishQuest()) {
      return {
        success: false,
        message: 'Недостаточно персонажей для завершения квеста'
      };
    }
    
    const overallScore = this.getOverallScore();
    let result = {};
    
    if (overallScore >= 80) {
      result = {
        success: true,
        type: 'total_dominance',
        title: '🌍 Абсолютное мировое господство',
        description: 'Ваше тайное правительство установило полный контроль над миром. Все секторы работают в идеальной гармонии.',
        rewards: { mulacoin: 1000, exp: 500, level: 2 }
      };
    } else if (overallScore >= 65) {
      result = {
        success: true,
        type: 'major_influence',
        title: '🏛️ Крупное региональное влияние',
        description: 'Ваше правительство контролирует большинство ключевых регионов мира. Система работает стабильно.',
        rewards: { mulacoin: 750, exp: 400, level: 1 }
      };
    } else if (overallScore >= 50) {
      result = {
        success: true,
        type: 'moderate_control',
        title: '⚖️ Умеренный контроль',
        description: 'Ваше правительство установило контроль над несколькими важными странами. Есть потенциал для роста.',
        rewards: { mulacoin: 500, exp: 300, level: 1 }
      };
    } else if (overallScore >= 35) {
      result = {
        success: false,
        type: 'struggling',
        title: '⚠️ Борьба за выживание',
        description: 'Ваше правительство испытывает серьезные трудности. Требуется немедленное вмешательство.',
        rewards: { mulacoin: 250, exp: 150, level: 0 }
      };
    } else {
      result = {
        success: false,
        type: 'failure',
        title: '💥 Полный крах',
        description: 'Система мирового правительства потерпела крах. Миссия провалена.',
        rewards: { mulacoin: 100, exp: 50, level: 0 }
      };
    }
    
    // Добавляем детали по секторам
    result.sectorDetails = {};
    Object.entries(this.sectors).forEach(([sectorId, sector]) => {
      result.sectorDetails[sectorId] = {
        name: sector.name,
        score: this.getSectorScore(sectorId),
        members: sector.members.length,
        maxMembers: sector.maxMembers,
        status: sector.members.length > 0 ? 'active' : 'inactive'
      };
    });
    
    return result;
  }
  
  // Генерация сюжетной последовательности
  generateStorySequence() {
    const sequence = [];
    
    // Добавляем вступительную историю
    const introStory = this.stories.getRandomStory(null, 'intro');
    sequence.push(introStory);
    
    // Добавляем истории для каждого сектора
    Object.entries(this.sectors).forEach(([sectorId, sector]) => {
      if (sector.members.length > 0) {
        const sectorScore = this.getSectorScore(sectorId);
        
        if (sectorScore >= 70) {
          // Успешная история
          const successStory = this.stories.getSectorSuccess(sectorId);
          if (successStory) {
            sequence.push(successStory);
          }
        } else if (sectorScore <= 30) {
          // Проблемная история
          const problemStory = this.stories.getSectorProblem(sectorId);
          if (problemStory) {
            sequence.push(problemStory);
          }
        } else {
          // Смешанная история
          const randomStory = this.stories.getSectorStory(sectorId);
          sequence.push(randomStory);
        }
      }
    });
    
    // Добавляем смешанные истории
    const mixedStories = this.stories.mixedStories;
    if (mixedStories.length > 0) {
      const randomMixed = mixedStories[Math.floor(Math.random() * mixedStories.length)];
      sequence.push(randomMixed);
    }
    
    // Проверяем возможность видео-сюжетов
    const activeSectors = Object.keys(this.sectors).filter(sectorId => 
      this.sectors[sectorId].members.length > 0
    );
    
    if (activeSectors.length > 0) {
      const videoStory = this.stories.getVideoStory(activeSectors);
      if (videoStory && this.stories.canTriggerVideo(videoStory.triggers, this.sectors)) {
        sequence.push(videoStory);
      }
    }
    
    return sequence;
  }
  
  // Применение эффектов истории
  applyStoryEffects(story) {
    if (!story.effects) return;
    
    Object.entries(story.effects).forEach(([stat, value]) => {
      if (this.gameState.hasOwnProperty(stat)) {
        this.gameState[stat] = Math.max(0, Math.min(100, this.gameState[stat] + value));
      }
    });
  }
  
  // Получение статистики игры
  getGameStats() {
    return {
      overall: this.getOverallScore(),
      sectors: Object.entries(this.sectors).map(([id, sector]) => ({
        id,
        name: sector.name,
        score: this.getSectorScore(id),
        members: sector.members.length,
        maxMembers: sector.maxMembers,
        status: sector.members.length > 0 ? 'active' : 'inactive'
      })),
      stats: { ...this.gameState },
      canFinish: this.canFinishQuest()
    };
  }
  
  // Сброс игры
  resetGame() {
    this.initializeSectors();
    this.initializeCharacters();
    this.currentStage = 'setup';
    this.gameState = {
      stability: 50,
      influence: 50,
      control: 50,
      power: 50,
      security: 50,
      intimidation: 50,
      wealth: 50,
      innovation: 50
    };
  }
  
  // Сохранение состояния игры
  saveGameState() {
    const gameState = {
      sectors: this.sectors,
      currentStage: this.currentStage,
      gameState: this.gameState,
      timestamp: Date.now()
    };
    
    localStorage.setItem('worldGovernmentGameState', JSON.stringify(gameState));
  }
  
  // Загрузка состояния игры
  loadGameState() {
    const savedState = localStorage.getItem('worldGovernmentGameState');
    if (savedState) {
      try {
        const gameState = JSON.parse(savedState);
        this.sectors = gameState.sectors || this.sectors;
        this.currentStage = gameState.currentStage || 'setup';
        this.gameState = gameState.gameState || this.gameState;
        this.updateGameStats();
        return true;
      } catch (error) {
        console.error('Error loading game state:', error);
        return false;
      }
    }
    return false;
  }
}

// Контроллер аудио
class AudioController {
  constructor() {
    this.audio = null;
    this.isPlaying = false;
    this.volume = 0.5;
    this.isMuted = false;
  }
  
  // Инициализация аудио
  initialize() {
    this.audio = document.getElementById('horror-audio');
    if (this.audio) {
      this.audio.volume = this.volume;
      this.audio.loop = true;
    }
  }
  
  // Воспроизведение
  play() {
    if (this.audio && !this.isMuted) {
      this.audio.play().then(() => {
        this.isPlaying = true;
      }).catch(error => {
        console.error('Error playing audio:', error);
      });
    }
  }
  
  // Остановка
  stop() {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.isPlaying = false;
    }
  }
  
  // Пауза
  pause() {
    if (this.audio) {
      this.audio.pause();
      this.isPlaying = false;
    }
  }
  
  // Установка громкости
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.audio) {
      this.audio.volume = this.volume;
    }
  }
  
  // Переключение звука
  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.pause();
    } else if (this.isPlaying) {
      this.play();
    }
    return this.isMuted;
  }
  
  // Получение статуса
  getStatus() {
    return {
      isPlaying: this.isPlaying,
      isMuted: this.isMuted,
      volume: this.volume
    };
  }
}

// Контроллер видео
class VideoController {
  constructor() {
    this.videos = {};
    this.currentVideo = null;
    this.isPlaying = false;
  }
  
  // Инициализация видео
  initialize() {
    const videoElements = document.querySelectorAll('.background-video video');
    videoElements.forEach(video => {
      this.videos[video.id] = {
        element: video,
        isActive: false
      };
    });
  }
  
  // Воспроизведение видео
  playVideo(videoId) {
    this.stopAllVideos();
    
    const video = this.videos[videoId];
    if (video) {
      video.element.style.display = 'block';
      video.element.play().then(() => {
        video.isActive = true;
        this.currentVideo = videoId;
        this.isPlaying = true;
      }).catch(error => {
        console.error('Error playing video:', error);
      });
    }
  }
  
  // Остановка видео
  stopVideo(videoId) {
    const video = this.videos[videoId];
    if (video) {
      video.element.pause();
      video.element.currentTime = 0;
      video.element.style.display = 'none';
      video.isActive = false;
      
      if (this.currentVideo === videoId) {
        this.currentVideo = null;
        this.isPlaying = false;
      }
    }
  }
  
  // Остановка всех видео
  stopAllVideos() {
    Object.values(this.videos).forEach(video => {
      video.element.pause();
      video.element.currentTime = 0;
      video.element.style.display = 'none';
      video.isActive = false;
    });
    
    this.currentVideo = null;
    this.isPlaying = false;
  }
  
  // Получение статуса видео
  getVideoStatus(videoId) {
    const video = this.videos[videoId];
    return video ? video.isActive : false;
  }
  
  // Получение текущего видео
  getCurrentVideo() {
    return this.currentVideo;
  }
}

// Экспорт классов
window.WorldGovernmentEngine = WorldGovernmentEngine;
window.AudioController = AudioController;
window.VideoController = VideoController;
