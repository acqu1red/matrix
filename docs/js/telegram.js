// Telegram WebApp Integration
class TelegramApp {
  constructor() {
    this.tg = window.Telegram?.WebApp;
    this.isInitialized = false;
    this.init();
  }

  init() {
    if (this.tg) {
      this.isInitialized = true;
      this.setupTheme();
      this.setupMainButton();
      this.setupBackButton();
      this.setupHapticFeedback();
      this.setupViewport();
      this.setupClosing();
      console.log('Telegram WebApp initialized');
    } else {
      console.warn('Telegram WebApp not available');
      // Fallback для тестирования вне Telegram
      this.setupFallback();
    }
  }

  // Применение Telegram темы
  setupTheme() {
    try {
      const themeParams = this.tg.themeParams || {};
      const root = document.documentElement;
      
      // Применяем основные цвета
      if (themeParams.bg_color) {
        root.style.setProperty('--tg-bg-color', themeParams.bg_color);
        root.style.setProperty('--bg', themeParams.bg_color);
      }
      
      if (themeParams.button_color) {
        root.style.setProperty('--tg-button-color', themeParams.button_color);
        root.style.setProperty('--accent', themeParams.button_color);
      }
      
      if (themeParams.text_color) {
        root.style.setProperty('--tg-text-color', themeParams.text_color);
        root.style.setProperty('--text', themeParams.text_color);
      }
      
      if (themeParams.hint_color) {
        root.style.setProperty('--tg-hint-color', themeParams.hint_color);
        root.style.setProperty('--text-muted', themeParams.hint_color);
      }
      
      if (themeParams.link_color) {
        root.style.setProperty('--tg-link-color', themeParams.link_color);
        root.style.setProperty('--accent-2', themeParams.link_color);
      }
      
      if (themeParams.secondary_bg_color) {
        root.style.setProperty('--tg-secondary-bg-color', themeParams.secondary_bg_color);
        root.style.setProperty('--surface', themeParams.secondary_bg_color);
      }

      // Устанавливаем атрибут темы
      const isDark = this.tg.colorScheme === 'dark';
      root.setAttribute('data-tg-theme', isDark ? 'dark' : 'light');
      
      // Уведомляем Telegram о готовности
      this.tg.ready();
      
    } catch (error) {
      console.error('Error applying Telegram theme:', error);
    }
  }

  // Настройка главной кнопки
  setupMainButton() {
    if (!this.tg?.MainButton) return;
    
    const mainButton = this.tg.MainButton;
    
    // Методы для управления главной кнопкой
    this.showMainButton = (text = 'Продолжить', callback) => {
      mainButton.text = text;
      if (callback) {
        mainButton.onClick(callback);
      }
      mainButton.show();
    };
    
    this.hideMainButton = () => {
      mainButton.hide();
    };
    
    this.setMainButtonText = (text) => {
      mainButton.text = text;
    };
    
    this.setMainButtonProgress = (show) => {
      if (show) {
        mainButton.showProgress();
      } else {
        mainButton.hideProgress();
      }
    };
  }

  // Настройка кнопки назад
  setupBackButton() {
    if (!this.tg?.BackButton) return;
    
    const backButton = this.tg.BackButton;
    
    this.showBackButton = (callback) => {
      if (callback) {
        backButton.onClick(callback);
      }
      backButton.show();
    };
    
    this.hideBackButton = () => {
      backButton.hide();
    };
  }

  // Настройка haptic feedback
  setupHapticFeedback() {
    if (!this.tg?.HapticFeedback) return;
    
    const haptic = this.tg.HapticFeedback;
    
    this.haptic = {
      light: () => haptic.impactOccurred('light'),
      medium: () => haptic.impactOccurred('medium'),
      heavy: () => haptic.impactOccurred('heavy'),
      rigid: () => haptic.impactOccurred('rigid'),
      soft: () => haptic.impactOccurred('soft'),
      success: () => haptic.notificationOccurred('success'),
      warning: () => haptic.notificationOccurred('warning'),
      error: () => haptic.notificationOccurred('error')
    };
  }

  // Настройка viewport
  setupViewport() {
    if (!this.tg?.viewport) return;
    
    // Подписываемся на изменения viewport
    this.tg.onEvent('viewportChanged', () => {
      this.updateViewport();
    });
    
    this.updateViewport();
  }

  updateViewport() {
    if (!this.tg?.viewport) return;
    
    const { height, is_expanded } = this.tg.viewport;
    
    // Обновляем высоту контейнера
    document.documentElement.style.setProperty('--tg-viewport-height', `${height}px`);
    
    if (is_expanded) {
      document.body.classList.add('tg-expanded');
    } else {
      document.body.classList.remove('tg-expanded');
    }
  }

  // Настройка закрытия приложения
  setupClosing() {
    if (!this.tg?.close) return;
    
    this.close = () => {
      this.tg.close();
    };
  }

  // Fallback для тестирования вне Telegram
  setupFallback() {
    console.log('Setting up fallback mode');
    
    // Имитируем haptic feedback
    this.haptic = {
      light: () => console.log('Haptic: light'),
      medium: () => console.log('Haptic: medium'),
      heavy: () => console.log('Haptic: heavy'),
      rigid: () => console.log('Haptic: rigid'),
      soft: () => console.log('Haptic: soft'),
      success: () => console.log('Haptic: success'),
      warning: () => console.log('Haptic: warning'),
      error: () => console.log('Haptic: error')
    };
    
    // Имитируем главную кнопку
    this.showMainButton = (text, callback) => {
      console.log('Main button:', text);
      if (callback) callback();
    };
    
    this.hideMainButton = () => console.log('Hide main button');
    this.setMainButtonText = (text) => console.log('Set main button text:', text);
    this.setMainButtonProgress = (show) => console.log('Set main button progress:', show);
    
    // Имитируем кнопку назад
    this.showBackButton = (callback) => {
      console.log('Show back button');
      if (callback) callback();
    };
    
    this.hideBackButton = () => console.log('Hide back button');
    
    // Имитируем закрытие
    this.close = () => console.log('Close app');
  }

  // Получение данных пользователя
  getUserData() {
    if (!this.tg?.initDataUnsafe?.user) return null;
    
    return {
      id: this.tg.initDataUnsafe.user.id,
      firstName: this.tg.initDataUnsafe.user.first_name,
      lastName: this.tg.initDataUnsafe.user.last_name,
      username: this.tg.initDataUnsafe.user.username,
      languageCode: this.tg.initDataUnsafe.user.language_code,
      isPremium: this.tg.initDataUnsafe.user.is_premium,
      addedToAttachmentMenu: this.tg.initDataUnsafe.user.added_to_attachment_menu
    };
  }

  // Получение данных чата
  getChatData() {
    if (!this.tg?.initDataUnsafe?.chat) return null;
    
    return {
      id: this.tg.initDataUnsafe.chat.id,
      type: this.tg.initDataUnsafe.chat.type,
      title: this.tg.initDataUnsafe.chat.title,
      username: this.tg.initDataUnsafe.chat.username,
      photo: this.tg.initDataUnsafe.chat.photo
    };
  }

  // Получение init data
  getInitData() {
    return this.tg?.initData || '';
  }

  // Проверка валидности init data
  validateInitData() {
    // В реальном приложении здесь должна быть проверка подписи
    // Для демонстрации просто возвращаем true
    return true;
  }

  // Отправка данных на сервер
  sendData(data) {
    if (!this.tg?.sendData) return;
    
    this.tg.sendData(JSON.stringify(data));
  }

  // Показ popup
  showPopup(title, message, buttons = []) {
    if (!this.tg?.showPopup) return;
    
    this.tg.showPopup({
      title,
      message,
      buttons: buttons.map(btn => ({
        id: btn.id || 'default',
        type: btn.type || 'default',
        text: btn.text
      }))
    });
  }

  // Показ alert
  showAlert(message) {
    if (!this.tg?.showAlert) return;
    
    this.tg.showAlert(message);
  }

  // Показ confirm
  showConfirm(message) {
    if (!this.tg?.showConfirm) return;
    
    return this.tg.showConfirm(message);
  }

  // Показ scan QR
  showScanQrPopup() {
    if (!this.tg?.showScanQrPopup) return;
    
    this.tg.showScanQrPopup({
      text: 'Отсканируйте QR-код'
    });
  }

  // Показ invoice
  showInvoice(url) {
    if (!this.tg?.showInvoice) return;
    
    this.tg.showInvoice(url);
  }

  // Показ popup для выбора файла
  showPopupForFileSelection() {
    if (!this.tg?.showPopup) return;
    
    this.tg.showPopup({
      title: 'Выберите файл',
      message: 'Выберите файл для загрузки',
      buttons: [
        { id: 'photo', type: 'default', text: 'Фото' },
        { id: 'video', type: 'default', text: 'Видео' },
        { id: 'document', type: 'default', text: 'Документ' },
        { id: 'cancel', type: 'cancel', text: 'Отмена' }
      ]
    });
  }

  // Обработка событий
  onEvent(eventType, callback) {
    if (!this.tg?.onEvent) return;
    
    this.tg.onEvent(eventType, callback);
  }

  // Отписка от событий
  offEvent(eventType, callback) {
    if (!this.tg?.offEvent) return;
    
    this.tg.offEvent(eventType, callback);
  }

  // Получение информации о платформе
  getPlatform() {
    if (!this.tg?.platform) return 'unknown';
    
    return this.tg.platform;
  }

  // Получение версии
  getVersion() {
    if (!this.tg?.version) return 'unknown';
    
    return this.tg.version;
  }

  // Проверка поддержки функции
  isSupported(feature) {
    if (!this.tg) return false;
    
    switch (feature) {
      case 'haptic':
        return !!this.tg.HapticFeedback;
      case 'mainButton':
        return !!this.tg.MainButton;
      case 'backButton':
        return !!this.tg.BackButton;
      case 'popup':
        return !!this.tg.showPopup;
      case 'alert':
        return !!this.tg.showAlert;
      case 'confirm':
        return !!this.tg.showConfirm;
      case 'scanQr':
        return !!this.tg.showScanQrPopup;
      case 'invoice':
        return !!this.tg.showInvoice;
      case 'fileSelection':
        return !!this.tg.showPopup;
      default:
        return false;
    }
  }
}

// Создаем глобальный экземпляр
const telegramApp = new TelegramApp();

// Экспортируем для использования в других модулях
window.telegramApp = telegramApp;

// Автоматическое применение haptic feedback на кнопки
document.addEventListener('click', (e) => {
  const button = e.target.closest('.btn, button, [role="button"]');
  if (button && telegramApp.haptic) {
    telegramApp.haptic.light();
  }
});

// Автоматическое применение haptic feedback на ссылки
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href]');
  if (link && telegramApp.haptic) {
    telegramApp.haptic.light();
  }
});

// Экспорт для ES6 модулей
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TelegramApp;
}
