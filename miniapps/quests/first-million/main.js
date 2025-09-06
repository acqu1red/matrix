/* ===== FIRST MILLION MAIN ===== */

// Глобальная переменная для игрового движка
window.gameEngine = null;

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Инициализация Telegram Web App
    initializeTelegramWebApp();
    
    // Проверка поддержки необходимых функций
    checkBrowserSupport();
    
    // Настройка viewport для мобильных устройств
    setupMobileViewport();
    
    // Предзагрузка ресурсов
    preloadResources();
    
    // Инициализация игрового движка
    initializeGameEngine();
    
    // Настройка обработчиков событий
    setupGlobalEventListeners();
    
    // Применение пользовательских настроек
    applyUserSettings();
}

function initializeTelegramWebApp() {
    if (window.Telegram && window.Telegram.WebApp) {
        const tg = window.Telegram.WebApp;
        
        // Расширяем приложение на весь экран
        tg.expand();
        
        // Настраиваем цвета темы
        tg.setHeaderColor('#667eea');
        tg.setBackgroundColor('#f5f5f5');
        
        // Отключаем кнопку "Назад" в заголовке
        tg.BackButton.hide();
        
        // Показываем главную кнопку если нужно
        tg.MainButton.hide();
        
        // Включаем закрытие по свайпу вниз
        tg.enableClosingConfirmation();
        
        console.log('Telegram Web App инициализирован');
    } else {
        console.log('Приложение запущено не в Telegram');
    }
}

function checkBrowserSupport() {
    const requiredFeatures = [
        'addEventListener',
        'querySelector',
        'localStorage',
        'JSON'
    ];
    
    const missingFeatures = requiredFeatures.filter(feature => {
        return !(feature in window) && !(feature in document);
    });
    
    if (missingFeatures.length > 0) {
        console.warn('Некоторые функции не поддерживаются:', missingFeatures);
        showBrowserNotSupportedMessage();
        return false;
    }
    
    // Проверка поддержки touch событий
    const supportsTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (supportsTouch) {
        document.body.classList.add('touch-device');
    }
    
    // Проверка поддержки canvas
    const canvas = document.createElement('canvas');
    const supportsCanvas = !!(canvas.getContext && canvas.getContext('2d'));
    if (!supportsCanvas) {
        console.warn('Canvas не поддерживается');
    }
    
    return true;
}

function showBrowserNotSupportedMessage() {
    const message = document.createElement('div');
    message.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; 
                    background: #f44336; color: white; display: flex; 
                    align-items: center; justify-content: center; 
                    flex-direction: column; z-index: 10000;">
            <h2>Браузер не поддерживается</h2>
            <p>Пожалуйста, обновите браузер или используйте современный браузер</p>
        </div>
    `;
    document.body.appendChild(message);
}

function setupMobileViewport() {
    // Предотвращаем масштабирование
    const viewport = document.querySelector('meta[name=viewport]');
    if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
    }
    
    // Предотвращаем bounce эффект на iOS
    document.body.addEventListener('touchmove', function(e) {
        if (e.target === document.body || e.target === document.documentElement) {
            e.preventDefault();
        }
    }, { passive: false });
    
    // Скрываем адресную строку на мобильных
    window.addEventListener('load', function() {
        setTimeout(function() {
            window.scrollTo(0, 1);
        }, 1000);
    });
    
    // Обработка ориентации экрана
    window.addEventListener('orientationchange', function() {
        setTimeout(function() {
            window.scrollTo(0, 1);
            if (window.gameEngine) {
                window.gameEngine.handleOrientationChange();
            }
        }, 500);
    });
}

function preloadResources() {
    const resourcesToPreload = [
        // Добавьте здесь пути к изображениям, если есть
    ];
    
    resourcesToPreload.forEach(src => {
        const img = new Image();
        img.src = src;
    });
    
    // Предзагрузка шрифтов
    const fontPreload = document.createElement('link');
    fontPreload.rel = 'preload';
    fontPreload.as = 'font';
    fontPreload.type = 'font/woff2';
    fontPreload.crossOrigin = 'anonymous';
    // fontPreload.href = 'path/to/font.woff2';
    // document.head.appendChild(fontPreload);
}

function initializeGameEngine() {
    try {
        window.gameEngine = new FirstMillionEngine();
        console.log('Игровой движок инициализирован');
    } catch (error) {
        console.error('Ошибка инициализации игрового движка:', error);
        showErrorMessage('Ошибка загрузки игры. Попробуйте обновить страницу.');
    }
}

function setupGlobalEventListeners() {
    // Обработка ошибок
    window.addEventListener('error', function(e) {
        console.error('Глобальная ошибка:', e.error);
        logError(e.error);
    });
    
    // Обработка необработанных промисов
    window.addEventListener('unhandledrejection', function(e) {
        console.error('Необработанный промис:', e.reason);
        logError(e.reason);
    });
    
    // Обработка изменения состояния приложения
    document.addEventListener('visibilitychange', function() {
        if (window.gameEngine) {
            if (document.hidden) {
                window.gameEngine.pauseGame?.();
            } else {
                window.gameEngine.resumeGame?.();
            }
        }
    });
    
    // Обработка изменения размера окна
    window.addEventListener('resize', debounce(function() {
        if (window.gameEngine) {
            window.gameEngine.handleResize?.();
        }
    }, 250));
    
    // Обработка keyboard событий
    document.addEventListener('keydown', function(e) {
        // ESC - возврат назад
        if (e.key === 'Escape') {
            e.preventDefault();
            goBack();
        }
        
        // F5 - перезагрузка (только в режиме разработки)
        if (e.key === 'F5' && isDevelopmentMode()) {
            e.preventDefault();
            playAgain();
        }
    });
    
    // Предотвращение контекстного меню на мобильных
    document.addEventListener('contextmenu', function(e) {
        if (isMobileDevice()) {
            e.preventDefault();
        }
    });
}

function applyUserSettings() {
    // Загружаем пользовательские настройки
    const settings = loadUserSettings();
    
    // Применяем настройки звука
    if (settings.soundEnabled !== undefined) {
        toggleSound(settings.soundEnabled);
    }
    
    // Применяем настройки темы
    if (settings.theme) {
        applyTheme(settings.theme);
    }
    
    // Применяем настройки языка
    if (settings.language) {
        setLanguage(settings.language);
    }
    
    // Применяем настройки сложности
    if (settings.difficulty) {
        setDifficulty(settings.difficulty);
    }
}

function loadUserSettings() {
    try {
        const settings = localStorage.getItem('firstMillionSettings');
        return settings ? JSON.parse(settings) : getDefaultSettings();
    } catch (error) {
        console.warn('Ошибка загрузки настроек:', error);
        return getDefaultSettings();
    }
}

function getDefaultSettings() {
    return {
        soundEnabled: true,
        theme: 'auto',
        language: 'ru',
        difficulty: 'normal',
        hapticFeedback: true,
        animations: true
    };
}

function saveUserSettings(settings) {
    try {
        localStorage.setItem('firstMillionSettings', JSON.stringify(settings));
    } catch (error) {
        console.warn('Ошибка сохранения настроек:', error);
    }
}

function toggleSound(enabled) {
    document.body.classList.toggle('sound-disabled', !enabled);
    
    const settings = loadUserSettings();
    settings.soundEnabled = enabled;
    saveUserSettings(settings);
}

function applyTheme(theme) {
    document.body.classList.remove('theme-light', 'theme-dark');
    
    if (theme === 'auto') {
        // Используем системные настройки
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        theme = prefersDark ? 'dark' : 'light';
    }
    
    document.body.classList.add(`theme-${theme}`);
    
    // Обновляем цвета Telegram Web App
    if (window.Telegram && window.Telegram.WebApp) {
        const colors = theme === 'dark' 
            ? { header: '#2c3e50', background: '#1a1a1a' }
            : { header: '#667eea', background: '#f5f5f5' };
        
        window.Telegram.WebApp.setHeaderColor(colors.header);
        window.Telegram.WebApp.setBackgroundColor(colors.background);
    }
}

function setLanguage(language) {
    document.documentElement.lang = language;
    // Здесь можно добавить логику локализации
}

function setDifficulty(difficulty) {
    document.body.classList.remove('difficulty-easy', 'difficulty-normal', 'difficulty-hard');
    document.body.classList.add(`difficulty-${difficulty}`);
}

// Утилиты
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function isDevelopmentMode() {
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1' ||
           window.location.search.includes('debug=true');
}

function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <div class="error-content">
            <h3>🚫 Ошибка</h3>
            <p>${message}</p>
            <button onclick="location.reload()" class="error-button">Перезагрузить</button>
        </div>
    `;
    errorDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        color: white;
        text-align: center;
        padding: 20px;
    `;
    
    document.body.appendChild(errorDiv);
}

function logError(error) {
    // В production можно отправлять ошибки на сервер
    const errorData = {
        message: error.message || error,
        stack: error.stack,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        url: window.location.href
    };
    
    console.error('Logged error:', errorData);
    
    // Здесь можно добавить отправку на сервер аналитики
    // sendErrorToAnalytics(errorData);
}

function showLoadingOverlay(message = 'Загрузка...') {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        const messageEl = overlay.querySelector('.loading-message');
        if (messageEl) {
            messageEl.textContent = message;
        }
        overlay.classList.remove('hidden');
    }
}

function hideLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.add('hidden');
    }
}

// Регистрация Service Worker для PWA (если нужно)
if ('serviceWorker' in navigator && !isDevelopmentMode()) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('./sw.js')
            .then(function(registration) {
                console.log('SW registered: ', registration);
            })
            .catch(function(registrationError) {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Аналитика и метрики
function trackEvent(eventName, properties = {}) {
    // Telegram Web App Analytics
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.sendData(JSON.stringify({
            event: eventName,
            properties: properties,
            timestamp: Date.now()
        }));
    }
    
    // Google Analytics 4 (если подключен)
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, properties);
    }
    
    console.log('Event tracked:', eventName, properties);
}

function trackGameProgress(stage, score, time) {
    trackEvent('game_progress', {
        stage: stage,
        score: score,
        time: time,
        session_id: getSessionId()
    });
}

function getSessionId() {
    let sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) {
        sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
}

// Глобальные функции для использования в HTML
window.showLoadingOverlay = showLoadingOverlay;
window.hideLoadingOverlay = hideLoadingOverlay;
window.trackEvent = trackEvent;
window.trackGameProgress = trackGameProgress;

// Экспорт основных функций
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeApp,
        loadUserSettings,
        saveUserSettings,
        trackEvent,
        trackGameProgress
    };
}

console.log('First Million Quest загружен и готов к запуску! 🚀');
