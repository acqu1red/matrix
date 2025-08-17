import { SUPABASE_CONFIG, CONFIG, tg } from '../config.js';
import { SceneManager } from './components/SceneManager.js';
import { TempleManager } from './components/TempleManager.js';
import { EffectManager } from './effects/EffectManager.js';
import { UIManager } from './components/UIManager.js';
import { MobileManager } from './components/MobileManager.js';
import { PerformanceManager } from './utils/PerformanceManager.js';
import { AudioManager } from './utils/AudioManager.js';
import { templeData } from '../data/templeData.js';

// Инициализация Supabase
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.key);

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
        // Определение устройства
        isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // Инициализация Telegram Web App
        if (tg) {
            tg.expand();
            tg.enableClosingConfirmation();
            
            const user = tg.initDataUnsafe?.user;
            if (user) {
                currentUserId = user.id;
                await createOrGetUser(user);
                await checkAdminRights();
            }
        }

        // Инициализация менеджеров
        await initializeManagers();
        
        // Настройка обработчиков событий
        setupEventListeners();
        
        // Запуск загрузки
        await startLoading();
        
        // Запуск приложения
        await startApp();
        
    } catch (error) {
        console.error('Ошибка инициализации приложения:', error);
        showError('Ошибка загрузки приложения');
    }
}

// Инициализация менеджеров
async function initializeManagers() {
    // Менеджер производительности
    performanceManager = new PerformanceManager();
    
    // Менеджер аудио
    audioManager = new AudioManager();
    
    // Менеджер UI
    uiManager = new UIManager();
    
    // Менеджер сцены
    sceneManager = new SceneManager();
    
    // Менеджер эффектов
    effectManager = new EffectManager(sceneManager);
    
    // Менеджер храмов
    templeManager = new TempleManager(sceneManager, templeData);
    
    // Менеджер мобильных устройств
    if (isMobile) {
        mobileManager = new MobileManager(sceneManager);
    }
}

// Создание или получение пользователя
async function createOrGetUser(userData) {
    try {
        const { data, error } = await supabaseClient
            .from('users')
            .upsert({
                telegram_id: userData.id,
                username: userData.username,
                first_name: userData.first_name,
                last_name: userData.last_name
            })
            .select();

        if (error) {
            console.error('Ошибка создания пользователя:', error);
        }
    } catch (error) {
        console.error('Ошибка работы с пользователем:', error);
    }
}

// Проверка прав администратора
async function checkAdminRights() {
    try {
        const { data, error } = await supabaseClient
            .from('users')
            .select('is_admin')
            .eq('telegram_id', currentUserId)
            .single();

        if (data && data.is_admin) {
            isAdmin = true;
        }
    } catch (error) {
        console.error('Ошибка проверки прав администратора:', error);
    }
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Обработчики UI
    uiManager.on('templeSelected', handleTempleSelection);
    uiManager.on('templeConfirmed', handleTempleConfirmation);
    uiManager.on('backPressed', handleBackPress);
    uiManager.on('introClosed', handleIntroClose);
    
    // Обработчики сцены
    sceneManager.on('sceneLoaded', handleSceneLoaded);
    sceneManager.on('cameraMoved', handleCameraMove);
    
    // Обработчики храмов
    templeManager.on('templeHover', handleTempleHover);
    templeManager.on('templeClick', handleTempleClick);
    
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
            uiManager.updateFPS(fps);
        });
    }
}

// Запуск загрузки
async function startLoading() {
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
        await new Promise(resolve => setTimeout(resolve, 300));
        uiManager.updateLoadingProgress(step.progress, step.text, step.tip);
    }
}

// Запуск приложения
async function startApp() {
    // Скрытие прелоадера
    uiManager.hidePreloader();
    
    // Показ интро
    if (!appState.isIntroShown) {
        uiManager.showIntro();
        appState.isIntroShown = true;
    }
    
    // Запуск анимации
    sceneManager.startAnimation();
    
    // Запуск производительности
    if (performanceManager) {
        performanceManager.start();
    }
    
    // Запуск аудио
    if (audioManager) {
        audioManager.playAmbient();
    }
    
    isLoaded = true;
}

// Обработчики событий
function handleTempleSelection(templeId) {
    appState.selectedTemple = templeId;
    templeManager.selectTemple(templeId);
    uiManager.updateInstructions('Нажми еще раз для подтверждения выбора', 'confirm');
    uiManager.showBackButton();
    
    // Эффекты
    effectManager.playTempleSelectEffect(templeId);
    if (audioManager) audioManager.playTempleSelect();
}

function handleTempleConfirmation(templeId) {
    // Анимация перехода к храму
    const temple = templeManager.getTemple(templeId);
    if (temple) {
        sceneManager.flyToTemple(temple.position, () => {
            // Переход к библиотеке
            transitionToLibrary(templeId);
        });
    }
}

function handleTempleHover(templeId, isHovering) {
    if (isHovering) {
        templeManager.highlightTemple(templeId);
        effectManager.playTempleHoverEffect(templeId);
    } else {
        templeManager.unhighlightTemple(templeId);
    }
}

function handleTempleClick(templeId) {
    if (appState.selectedTemple === templeId) {
        handleTempleConfirmation(templeId);
    } else {
        handleTempleSelection(templeId);
    }
}

function handleBackPress() {
    if (appState.selectedTemple) {
        // Сброс выбора храма
        appState.selectedTemple = null;
        templeManager.deselectTemple();
        uiManager.updateInstructions('Нажми на храм для выбора темы');
        uiManager.hideBackButton();
        
        // Эффекты
        effectManager.playDeselectEffect();
        if (audioManager) audioManager.playDeselect();
    }
}

function handleIntroClose() {
    uiManager.hideIntro();
    sceneManager.enableControls();
}

function handleSceneLoaded() {
    console.log('Сцена загружена');
}

function handleCameraMove() {
    // Обновление эффектов при движении камеры
    effectManager.updateCameraEffects();
}

function handleWindowResize() {
    sceneManager.handleResize();
    uiManager.handleResize();
}

function handleBeforeUnload() {
    // Очистка ресурсов
    if (performanceManager) performanceManager.stop();
    if (audioManager) audioManager.stop();
}

// Переход к библиотеке
function transitionToLibrary(templeId) {
    appState.currentScene = 'library';
    
    // Анимация перехода
    sceneManager.transitionToLibrary(() => {
        // Создание библиотеки
        const temple = templeData[templeId];
        if (temple) {
            sceneManager.createLibrary(temple.books);
            uiManager.updateInstructions('Выберите книгу для изучения');
        }
    });
}

// Показать ошибку
function showError(message) {
    uiManager.showNotification(message, 'error');
}

// Показать уведомление
function showNotification(message, type = 'success') {
    uiManager.showNotification(message, type);
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

// Запуск приложения
document.addEventListener('DOMContentLoaded', initApp);
