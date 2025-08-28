/* ===== WORLD GOVERNMENT MAIN ===== */

// Главный файл для квеста "Тайное мировое сообщество"
class WorldGovernmentMain {
  constructor() {
    this.engine = null;
    this.ui = null;
    this.isInitialized = false;
    
    this.initializeQuest();
  }
  
  // Инициализация квеста
  async initializeQuest() {
    try {
      console.log('🌍 Initializing World Government Quest...');
      
      // Ждем загрузки всех необходимых данных
      await this.waitForData();
      
      // Создаем движок
      this.engine = new WorldGovernmentEngine();
      
      // Инициализируем аудио и видео контроллеры
      this.engine.audioController.initialize();
      this.engine.videoController.initialize();
      
      // Создаем UI
      this.ui = new WorldGovernmentUI(this.engine);
      
      // Загружаем сохраненное состояние
      this.engine.loadGameState();
      
      // Запускаем фоновую музыку
      this.startBackgroundMusic();
      
      // Устанавливаем флаг инициализации
      this.isInitialized = true;
      
      console.log('🌍 World Government Quest initialized successfully');
      
      // Показываем приветственное сообщение
      this.showWelcomeMessage();
      
    } catch (error) {
      console.error('Error initializing World Government Quest:', error);
      this.showErrorMessage('Ошибка инициализации квеста. Пожалуйста, обновите страницу.');
    }
  }
  
  // Ожидание загрузки данных
  waitForData() {
    return new Promise((resolve) => {
      const checkData = () => {
        if (window.WORLD_GOVERNMENT_DATA && 
            window.WORLD_GOVERNMENT_CHARACTERS && 
            window.WORLD_GOVERNMENT_SECTORS) {
          resolve();
        } else {
          setTimeout(checkData, 100);
        }
      };
      checkData();
    });
  }
  
  // Запуск фоновой музыки
  startBackgroundMusic() {
    // Небольшая задержка для лучшего пользовательского опыта
    setTimeout(() => {
      if (this.engine && this.engine.audioController) {
        this.engine.audioController.play();
      }
    }, 2000);
  }
  
  // Показ приветственного сообщения
  showWelcomeMessage() {
    const modal = this.ui.createModal('welcome', {
      title: '🌍 Добро пожаловать в "Тайное мировое сообщество"',
      content: `
        <div class="welcome-content">
          <p>Вы - глава тайного мирового правительства, стремящегося установить контроль над человечеством.</p>
          <p>Ваша задача - назначить персонажей в различные секторы для достижения максимальной эффективности.</p>
          <div class="welcome-instructions">
            <h4>Как играть:</h4>
            <ul>
              <li>Перетаскивайте персонажей на карту острова в соответствующие секторы</li>
              <li>Каждый сектор имеет ограничение на количество персонажей</li>
              <li>Персонажи имеют разную совместимость с секторами</li>
              <li>После назначения всех персонажей нажмите "Завершить создание"</li>
              <li>Просмотрите сюжет и получите награды</li>
            </ul>
          </div>
          <div class="welcome-tip">
            <strong>Совет:</strong> Обратите внимание на совместимость персонажей с секторами для достижения лучших результатов.
          </div>
        </div>
      `,
      buttons: [
        { text: 'Начать игру', class: 'btn primary' }
      ]
    });
    
    this.ui.showModal(modal);
  }
  
  // Показ сообщения об ошибке
  showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
      <div class="error-content">
        <h3>⚠️ Ошибка</h3>
        <p>${message}</p>
        <button class="btn primary" onclick="this.parentElement.parentElement.remove()">
          Закрыть
        </button>
      </div>
    `;
    
    document.body.appendChild(errorDiv);
    
    // Автоматически убираем через 10 секунд
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.parentNode.removeChild(errorDiv);
      }
    }, 10000);
  }
  
  // Получение статистики игры
  getGameStats() {
    if (!this.engine) return null;
    return this.engine.getGameStats();
  }
  
  // Сброс игры
  resetGame() {
    if (this.engine) {
      this.engine.resetGame();
      if (this.ui) {
        this.ui.resetUI();
      }
    }
  }
  
  // Сохранение состояния игры
  saveGameState() {
    if (this.engine) {
      this.engine.saveGameState();
    }
  }
  
  // Загрузка состояния игры
  loadGameState() {
    if (this.engine) {
      return this.engine.loadGameState();
    }
    return false;
  }
  
  // Получение движка
  getEngine() {
    return this.engine;
  }
  
  // Получение UI
  getUI() {
    return this.ui;
  }
  
  // Проверка инициализации
  isReady() {
    return this.isInitialized && this.engine && this.ui;
  }
  
  // Обновление UI
  updateUI() {
    if (this.ui) {
      this.ui.updateUI();
    }
  }
  
  // Показ статистики
  showStats() {
    if (!this.isReady()) return;
    
    const stats = this.getGameStats();
    if (!stats) return;
    
    const modal = this.ui.createModal('game-stats', {
      title: '📊 Статистика игры',
      content: `
        <div class="game-stats-content">
          <div class="overall-stats">
            <h4>Общая эффективность: ${stats.overall}%</h4>
            <div class="stats-grid">
              ${Object.entries(stats.stats).map(([stat, value]) => `
                <div class="stat-item">
                  <span class="stat-label">${this.getStatLabel(stat)}:</span>
                  <span class="stat-value">${value}%</span>
                </div>
              `).join('')}
            </div>
          </div>
          <div class="sector-stats">
            <h4>Статистика по секторам:</h4>
            ${stats.sectors.map(sector => `
              <div class="sector-stat-item">
                <span class="sector-name">${sector.name}</span>
                <span class="sector-score">${sector.score}%</span>
                <span class="sector-members">${sector.members}/${sector.maxMembers}</span>
                <span class="sector-status ${sector.status}">${sector.status === 'active' ? 'Активен' : 'Неактивен'}</span>
              </div>
            `).join('')}
          </div>
          <div class="completion-status">
            <h4>Статус завершения:</h4>
            <p class="${stats.canFinish ? 'can-finish' : 'cannot-finish'}">
              ${stats.canFinish ? '✅ Квест можно завершить' : '❌ Недостаточно персонажей для завершения'}
            </p>
          </div>
        </div>
      `,
      buttons: [
        { text: 'Закрыть', class: 'btn secondary' }
      ]
    });
    
    this.ui.showModal(modal);
  }
  
  // Получение названия статистики
  getStatLabel(stat) {
    const labels = {
      stability: 'Стабильность',
      influence: 'Влияние',
      control: 'Контроль',
      power: 'Сила',
      security: 'Безопасность',
      intimidation: 'Запугивание',
      wealth: 'Богатство',
      innovation: 'Инновации'
    };
    
    return labels[stat] || stat;
  }
  
  // Показ справки
  showHelp() {
    const modal = this.ui.createModal('help', {
      title: '❓ Справка по игре',
      content: `
        <div class="help-content">
          <div class="help-section">
            <h4>🎯 Цель игры</h4>
            <p>Создать эффективное тайное мировое правительство, назначив персонажей в соответствующие секторы.</p>
          </div>
          
          <div class="help-section">
            <h4>🏛️ Секторы</h4>
            <ul>
              <li><strong>Политический штаб</strong> - управление политическими процессами (макс. 4 персонажа)</li>
              <li><strong>Военный штаб</strong> - контроль над вооруженными силами (макс. 3 персонажа)</li>
              <li><strong>Экономический штаб</strong> - управление финансами (макс. 2 персонажа)</li>
              <li><strong>Исследовательский штаб</strong> - разработка технологий (макс. 2 персонажа)</li>
              <li><strong>Пропагандистский штаб</strong> - контроль над СМИ (макс. 3 персонажа)</li>
            </ul>
          </div>
          
          <div class="help-section">
            <h4>👥 Персонажи</h4>
            <p>Каждый персонаж имеет уникальные характеристики, навыки и совместимость с секторами. Перетаскивайте их на карту для назначения.</p>
          </div>
          
          <div class="help-section">
            <h4>🎮 Управление</h4>
            <ul>
              <li>Перетаскивание персонажей мышью</li>
              <li>Клик по персонажу для просмотра деталей</li>
              <li>Клик по сектору для просмотра членов</li>
              <li>Кнопка звука для управления музыкой</li>
            </ul>
          </div>
          
          <div class="help-section">
            <h4>🏆 Завершение</h4>
            <p>Для завершения квеста необходимо назначить минимум 6 персонажей в 3 различных сектора. После завершения вы увидите сюжет и получите награды.</p>
          </div>
        </div>
      `,
      buttons: [
        { text: 'Понятно', class: 'btn primary' }
      ]
    });
    
    this.ui.showModal(modal);
  }
  
  // Показ настроек
  showSettings() {
    const audioStatus = this.engine?.audioController?.getStatus() || {};
    
    const modal = this.ui.createModal('settings', {
      title: '⚙️ Настройки',
      content: `
        <div class="settings-content">
          <div class="setting-item">
            <label for="sound-volume">Громкость звука:</label>
            <input type="range" id="sound-volume" min="0" max="100" value="${Math.round(audioStatus.volume * 100)}" 
                   onchange="worldGovernmentMain.changeVolume(this.value / 100)">
            <span class="volume-value">${Math.round(audioStatus.volume * 100)}%</span>
          </div>
          
          <div class="setting-item">
            <label for="sound-toggle">Звук:</label>
            <button id="sound-toggle" class="btn ${audioStatus.isMuted ? 'secondary' : 'primary'}" 
                    onclick="worldGovernmentMain.toggleSound()">
              ${audioStatus.isMuted ? '🔇 Включить' : '🔊 Отключить'}
            </button>
          </div>
          
          <div class="setting-item">
            <label>Автосохранение:</label>
            <span class="setting-value">Включено</span>
          </div>
          
          <div class="setting-item">
            <label>Последнее сохранение:</label>
            <span class="setting-value">${this.getLastSaveTime()}</span>
          </div>
        </div>
      `,
      buttons: [
        { text: 'Сохранить', class: 'btn primary', action: () => this.saveSettings() },
        { text: 'Отмена', class: 'btn secondary' }
      ]
    });
    
    this.ui.showModal(modal);
  }
  
  // Изменение громкости
  changeVolume(volume) {
    if (this.engine?.audioController) {
      this.engine.audioController.setVolume(volume);
      
      // Обновляем отображение
      const volumeValue = document.querySelector('.volume-value');
      if (volumeValue) {
        volumeValue.textContent = `${Math.round(volume * 100)}%`;
      }
    }
  }
  
  // Переключение звука
  toggleSound() {
    if (this.engine?.audioController) {
      const isMuted = this.engine.audioController.toggleMute();
      const soundToggle = document.getElementById('sound-toggle');
      
      if (soundToggle) {
        if (isMuted) {
          soundToggle.innerHTML = '🔇 Включить';
          soundToggle.className = 'btn secondary';
        } else {
          soundToggle.innerHTML = '🔊 Отключить';
          soundToggle.className = 'btn primary';
        }
      }
    }
  }
  
  // Сохранение настроек
  saveSettings() {
    // Здесь можно добавить логику сохранения настроек
    this.ui.closeCurrentModal();
    this.showSuccessMessage('Настройки сохранены');
  }
  
  // Получение времени последнего сохранения
  getLastSaveTime() {
    const savedState = localStorage.getItem('worldGovernmentGameState');
    if (savedState) {
      try {
        const gameState = JSON.parse(savedState);
        return new Date(gameState.timestamp).toLocaleString('ru-RU');
      } catch (error) {
        return 'Неизвестно';
      }
    }
    return 'Нет сохранений';
  }
  
  // Показ сообщения об успехе
  showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.innerHTML = `
      <div class="success-content">
        <p>✅ ${message}</p>
      </div>
    `;
    
    document.body.appendChild(successDiv);
    
    // Автоматически убираем через 3 секунды
    setTimeout(() => {
      if (successDiv.parentNode) {
        successDiv.parentNode.removeChild(successDiv);
      }
    }, 3000);
  }
  
  // Экспорт данных игры
  exportGameData() {
    if (!this.engine) return;
    
    const gameData = {
      sectors: this.engine.sectors,
      gameState: this.engine.gameState,
      timestamp: Date.now(),
      version: '1.0'
    };
    
    const dataStr = JSON.stringify(gameData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `world-government-quest-${Date.now()}.json`;
    link.click();
  }
  
  // Импорт данных игры
  importGameData(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const gameData = JSON.parse(e.target.result);
        
        if (gameData.sectors && gameData.gameState) {
          this.engine.sectors = gameData.sectors;
          this.engine.gameState = gameData.gameState;
          this.engine.updateGameStats();
          this.ui.updateUI();
          
          this.showSuccessMessage('Данные игры успешно импортированы');
        } else {
          throw new Error('Неверный формат файла');
        }
      } catch (error) {
        this.showErrorMessage('Ошибка импорта: ' + error.message);
      }
    };
    reader.readAsText(file);
  }
}

// Глобальный экземпляр
let worldGovernmentMain = null;

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  // Небольшая задержка для загрузки всех скриптов
  setTimeout(() => {
    worldGovernmentMain = new WorldGovernmentMain();
    
    // Добавляем глобальные функции для кнопок
    window.showGameStats = () => worldGovernmentMain?.showStats();
    window.showHelp = () => worldGovernmentMain?.showHelp();
    window.showSettings = () => worldGovernmentMain?.showSettings();
    window.resetGame = () => {
      if (confirm('Вы уверены, что хотите сбросить игру? Все прогресс будет потерян.')) {
        worldGovernmentMain?.resetGame();
      }
    };
    window.exportGame = () => worldGovernmentMain?.exportGameData();
    window.importGame = () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = (e) => {
        if (e.target.files[0]) {
          worldGovernmentMain?.importGameData(e.target.files[0]);
        }
      };
      input.click();
    };
    
    console.log('🌍 World Government Quest global functions initialized');
  }, 500);
});

// Обработка видимости страницы для управления звуком
document.addEventListener('visibilitychange', () => {
  if (worldGovernmentMain?.engine?.audioController) {
    if (document.hidden) {
      worldGovernmentMain.engine.audioController.pause();
    } else {
      worldGovernmentMain.engine.audioController.play();
    }
  }
});

// Обработка закрытия страницы для сохранения
window.addEventListener('beforeunload', () => {
  if (worldGovernmentMain) {
    worldGovernmentMain.saveGameState();
  }
});

// Экспорт класса
window.WorldGovernmentMain = WorldGovernmentMain;
