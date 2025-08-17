import { SUPABASE_CONFIG, CONFIG, tg } from '../config.js';
import { SceneManager } from './components/SceneManager.js';
import { TempleManager } from './components/TempleManager.js';
import { EffectManager } from './effects/EffectManager.js';
import { UIManager } from './components/UIManager.js';
import { MobileManager } from './components/MobileManager.js';
import { PerformanceManager } from './utils/PerformanceManager.js';
import { AudioManager } from './utils/AudioManager.js';
import { templeData } from '../data/templeData.js';

// Глобальные переменные
let currentUserId = null;
let isAdmin = false;
let isMobile = false;
let isLoaded = false;

// Менеджеры
let sceneManager;
let templeManager;
let effectManager;
let uiManager;
let mobileManager;
let performanceManager;
let audioManager;

// Состояние приложения
const appState = {
    currentScene: 'island',
    selectedTemple: null,
    selectedBook: null,
    isLoading: true,
    isIntroShown: false
};

// Инициализация приложения
async function initApp() {
    try {
        console.log('🚀 Начало инициализации приложения...');
        
        // Определение устройства
        isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        console.log('📱 Устройство:', isMobile ? 'мобильное' : 'десктоп');
        
        // Инициализация Telegram Web App
        if (tg) {
            console.log('📱 Telegram Web App найден');
            tg.expand();
            tg.enableClosingConfirmation();
            
            const user = tg.initDataUnsafe?.user;
            if (user) {
                currentUserId = user.id;
                console.log('👤 Пользователь:', user.id);
                // Временно отключаем Supabase для тестирования
                // await createOrGetUser(user);
                // await checkAdminRights();
            }
        } else {
            console.log('⚠️ Telegram Web App не найден, работаем в режиме браузера');
        }

        // Инициализация менеджеров
        console.log('🔧 Инициализация менеджеров...');
        await initializeManagers();
        
        // Настройка обработчиков событий
        console.log('🎯 Настройка обработчиков событий...');
        setupEventListeners();
        
        // Запуск загрузки
        console.log('📊 Запуск процесса загрузки...');
        await startLoading();
        
        // Запуск приложения
        console.log('🎮 Запуск приложения...');
        await startApp();
        
    } catch (error) {
        console.error('❌ Ошибка инициализации приложения:', error);
        showError('Ошибка загрузки приложения: ' + error.message);
    }
}

// Инициализация менеджеров
async function initializeManagers() {
    try {
        console.log('📈 Инициализация PerformanceManager...');
        performanceManager = new PerformanceManager();
        
        console.log('🎵 Инициализация AudioManager...');
        audioManager = new AudioManager();
        
        console.log('🖥️ Инициализация UIManager...');
        uiManager = new UIManager();
        
        console.log('🌍 Инициализация SceneManager...');
        sceneManager = new SceneManager();
        await new Promise((resolve) => {
            sceneManager.once('sceneLoaded', () => {
                console.log('✅ SceneManager загружен');
                resolve();
            });
            // Таймаут на случай, если событие не сработает
            setTimeout(() => {
                console.log('⏰ Таймаут SceneManager, продолжаем...');
                resolve();
            }, 5000);
        });
        
        console.log('✨ Инициализация EffectManager...');
        effectManager = new EffectManager(sceneManager);
        
        console.log('🏛️ Инициализация TempleManager...');
        templeManager = new TempleManager(sceneManager, templeData);
        
        // Менеджер мобильных устройств
        if (isMobile) {
            console.log('📱 Инициализация MobileManager...');
            mobileManager = new MobileManager(sceneManager);
        }
        
        console.log('✅ Все менеджеры инициализированы');
    } catch (error) {
        console.error('❌ Ошибка инициализации менеджеров:', error);
        throw error;
    }
}

// Создание или получение пользователя (временно отключено)
async function createOrGetUser(userData) {
    try {
        console.log('👤 Создание/получение пользователя:', userData.id);
        // Временно отключаем Supabase
        return;
        
        // const { data, error } = await supabaseClient
        //     .from('users')
        //     .upsert({
        //         telegram_id: userData.id,
        //         username: userData.username,
        //         first_name: userData.first_name,
        //         last_name: userData.last_name
        //     })
        //     .select();

        // if (error) {
        //     console.error('Ошибка создания пользователя:', error);
        // }
    } catch (error) {
        console.error('Ошибка работы с пользователем:', error);
    }
}

// Проверка прав администратора (временно отключено)
async function checkAdminRights() {
    try {
        console.log('🔐 Проверка прав администратора...');
        // Временно отключаем Supabase
        isAdmin = false;
        return;
        
        // const { data, error } = await supabaseClient
        //     .from('users')
        //     .select('is_admin')
        //     .eq('telegram_id', currentUserId)
        //     .single();

        // if (data && data.is_admin) {
        //     isAdmin = true;
        // }
    } catch (error) {
        console.error('Ошибка проверки прав администратора:', error);
    }
}

// Настройка обработчиков событий
function setupEventListeners() {
    try {
        // Обработчики UI
        if (uiManager) {
            uiManager.on('templeSelected', handleTempleSelection);
            uiManager.on('templeConfirmed', handleTempleConfirmation);
            uiManager.on('backPressed', handleBackPress);
            uiManager.on('introClosed', handleIntroClose);
        }
        
        // Обработчики сцены
        if (sceneManager) {
            sceneManager.on('sceneLoaded', handleSceneLoaded);
            sceneManager.on('cameraMoved', handleCameraMove);
        }
        
        // Обработчики храмов
        if (templeManager) {
            templeManager.on('templeHover', handleTempleHover);
            templeManager.on('templeClick', handleTempleClick);
        }
        
        // Обработчики мобильных устройств
        if (mobileManager) {
            mobileManager.on('zoomIn', () => sceneManager.zoomIn());
            mobileManager.on('zoomOut', () => sceneManager.zoomOut());
            mobileManager.on('resetCamera', () => sceneManager.resetCamera());
        }
        
        // Обработчики окна
        window.addEventListener('resize', handleWindowResize);
        window.addEventListener('beforeunload', handleBeforeUnload);
        
        // Обработчики производительности
        if (performanceManager) {
            performanceManager.on('fpsUpdate', (fps) => {
                if (uiManager && uiManager.updateFPS) {
                    uiManager.updateFPS(fps);
                }
            });
        }
        
        console.log('✅ Обработчики событий настроены');
    } catch (error) {
        console.error('❌ Ошибка настройки обработчиков событий:', error);
    }
}

// Запуск загрузки
async function startLoading() {
    try {
        console.log('📊 Начало процесса загрузки...');
        const loadingSteps = [
            { progress: 10, text: 'Инициализация 3D движка...', tip: 'Подготовка WebGL контекста' },
            { progress: 25, text: 'Загрузка текстур...', tip: 'Создание реалистичных материалов' },
            { progress: 40, text: 'Создание сцены...', tip: 'Построение 3D мира' },
            { progress: 60, text: 'Настройка освещения...', tip: 'Добавление атмосферных эффектов' },
            { progress: 75, text: 'Создание храмов...', tip: 'Построение архитектурных объектов' },
            { progress: 90, text: 'Настройка анимаций...', tip: 'Добавление динамических эффектов' },
            { progress: 100, text: 'Готово!', tip: 'Мир готов к исследованию' }
        ];

        for (const step of loadingSteps) {
            await new Promise(resolve => setTimeout(resolve, 200));
            if (uiManager && uiManager.updateLoadingProgress) {
                uiManager.updateLoadingProgress(step.progress, step.text, step.tip);
            }
            console.log(`📊 Загрузка: ${step.progress}% - ${step.text}`);
        }
        
        console.log('✅ Процесс загрузки завершен');
    } catch (error) {
        console.error('❌ Ошибка в процессе загрузки:', error);
        // Принудительно завершаем загрузку
        if (uiManager && uiManager.updateLoadingProgress) {
            uiManager.updateLoadingProgress(100, 'Готово!', 'Загрузка завершена');
        }
    }
}

// Запуск приложения
async function startApp() {
    try {
        console.log('🎮 Запуск приложения...');
        
        // Скрытие прелоадера
        if (uiManager && uiManager.hidePreloader) {
            uiManager.hidePreloader();
        }
        
        // Показ интро
        if (!appState.isIntroShown && uiManager && uiManager.showIntro) {
            uiManager.showIntro();
            appState.isIntroShown = true;
        }
        
        // Запуск анимации
        if (sceneManager && sceneManager.startAnimation) {
            sceneManager.startAnimation();
        }
        
        // Запуск производительности
        if (performanceManager && performanceManager.start) {
            performanceManager.start();
        }
        
        // Запуск аудио
        if (audioManager && audioManager.playAmbient) {
            audioManager.playAmbient();
        }
        
        isLoaded = true;
        appState.isLoading = false;
        
        console.log('🎉 Приложение успешно запущено!');
    } catch (error) {
        console.error('❌ Ошибка запуска приложения:', error);
        // Принудительно скрываем прелоадер
        if (uiManager && uiManager.hidePreloader) {
            uiManager.hidePreloader();
        }
    }
}

// Обработчики событий
function handleTempleSelection(templeId) {
    console.log('🏛️ Выбор храма:', templeId);
    appState.selectedTemple = templeId;
    if (templeManager) templeManager.selectTemple(templeId);
    if (uiManager) {
        uiManager.updateInstructions('Нажми еще раз для подтверждения выбора', 'confirm');
        uiManager.showBackButton();
    }
    
    // Эффекты
    if (effectManager) effectManager.playTempleSelectEffect(templeId);
    if (audioManager) audioManager.playTempleSelect();
}

function handleTempleConfirmation(templeId) {
    console.log('✅ Подтверждение храма:', templeId);
    // Анимация перехода к храму
    const temple = templeManager ? templeManager.getTemple(templeId) : null;
    if (temple && sceneManager) {
        sceneManager.flyToTemple(temple.position, () => {
            // Переход к библиотеке
            transitionToLibrary(templeId);
        });
    }
}

function handleTempleHover(templeId, isHovering) {
    if (isHovering) {
        if (templeManager) templeManager.highlightTemple(templeId);
        if (effectManager) effectManager.playTempleHoverEffect(templeId);
    } else {
        if (templeManager) templeManager.unhighlightTemple(templeId);
    }
}

function handleTempleClick(templeId) {
    console.log('🖱️ Клик по храму:', templeId);
    if (appState.selectedTemple === templeId) {
        handleTempleConfirmation(templeId);
    } else {
        handleTempleSelection(templeId);
    }
}

function handleBackPress() {
    console.log('⬅️ Нажата кнопка назад');
    if (appState.selectedTemple) {
        // Сброс выбора храма
        appState.selectedTemple = null;
        if (templeManager) templeManager.deselectTemple();
        if (uiManager) {
            uiManager.updateInstructions('Нажми на храм для выбора темы');
            uiManager.hideBackButton();
        }
        
        // Эффекты
        if (effectManager) effectManager.playDeselectEffect();
        if (audioManager) audioManager.playDeselect();
    }
}

function handleIntroClose() {
    console.log('❌ Закрытие интро');
    if (uiManager) uiManager.hideIntro();
    if (sceneManager) sceneManager.enableControls();
}

function handleSceneLoaded() {
    console.log('🌍 Сцена загружена');
}

function handleCameraMove() {
    // Обновление эффектов при движении камеры
    if (effectManager) effectManager.updateCameraEffects();
}

function handleWindowResize() {
    if (sceneManager) sceneManager.handleResize();
    if (uiManager) uiManager.handleResize();
}

function handleBeforeUnload() {
    // Очистка ресурсов
    if (performanceManager) performanceManager.stop();
    if (audioManager) audioManager.stop();
}

// Переход к библиотеке
function transitionToLibrary(templeId) {
    console.log('📚 Переход к библиотеке храма:', templeId);
    appState.currentScene = 'library';
    
    // Анимация перехода
    if (sceneManager) {
        sceneManager.transitionToLibrary(() => {
            // Создание библиотеки
            const temple = templeData[templeId];
            if (temple) {
                sceneManager.createLibrary(temple.books);
                if (uiManager) uiManager.updateInstructions('Выберите книгу для изучения');
            }
        });
    }
}

// Показать ошибку
function showError(message) {
    console.error('❌ Ошибка:', message);
    if (uiManager && uiManager.showNotification) {
        uiManager.showNotification(message, 'error');
    }
}

// Показать уведомление
function showNotification(message, type = 'success') {
    if (uiManager && uiManager.showNotification) {
        uiManager.showNotification(message, type);
    }
}

// Экспорт для отладки
window.app = {
    sceneManager,
    templeManager,
    effectManager,
    uiManager,
    performanceManager,
    audioManager,
    appState,
    showNotification,
    showError
};

// Экспорт функции инициализации для внешнего вызова
window.initApp = initApp;

// Флаг для предотвращения дублирования инициализации
let isAppInitialized = false;

// Запуск приложения (если библиотеки уже загружены)
console.log('🚀 Подготовка приложения...');
document.addEventListener('DOMContentLoaded', function() {
    // Проверяем, загружен ли Three.js
    if (typeof THREE !== 'undefined' && !isAppInitialized) {
        console.log('🚀 Three.js уже загружен, запускаем приложение...');
        isAppInitialized = true;
        initApp();
    } else {
        console.log('⏳ Ожидание загрузки Three.js...');
    }
});
