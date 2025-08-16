// Модуль UI острова
class IslandUI {
    constructor(utils) {
        this.utils = utils;
        this.config = ISLAND_CONFIG;
        this.stats = {
            fps: 0,
            drawCalls: 0,
            triangles: 0,
            memory: 0
        };
        this.isVisible = true;
        this.hintTimeout = null;
    }

    // Инициализация UI
    init() {
        // Скрытие подсказки через 3 секунды
        this.hideHintAfterDelay();
        
        // Настройка обработчиков событий
        this.setupEventHandlers();
        
        // Установка начального качества
        this.setInitialQuality();
        
        console.log('UI система инициализирована');
    }

    // Скрытие подсказки через задержку
    hideHintAfterDelay() {
        this.hintTimeout = setTimeout(() => {
            this.hideHint();
        }, 3000);
    }

    // Скрытие подсказки
    hideHint() {
        const hint = document.getElementById('controls-hint');
        if (hint) {
            hint.classList.add('fade-out');
        }
    }

    // Настройка обработчиков событий
    setupEventHandlers() {
        // Обработка нажатия клавиш
        document.addEventListener('keydown', (event) => {
            this.handleKeyPress(event);
        });
        
        // Обработка изменения размера окна
        window.addEventListener('resize', () => {
            this.onWindowResize();
        });
        
        // Обработка изменения качества
        window.addEventListener('qualityChanged', (event) => {
            this.onQualityChanged(event.detail.quality);
        });
        
        // Обработка изменения времени суток
        window.addEventListener('timeOfDayChanged', (event) => {
            this.onTimeOfDayChanged(event.detail.timeOfDay);
        });
    }

    // Обработка нажатия клавиш
    handleKeyPress(event) {
        switch (event.key.toLowerCase()) {
            case 'h':
                this.toggleHint();
                break;
            case 'f':
                this.toggleFullscreen();
                break;
            case 's':
                this.takeScreenshot();
                break;
            case 'i':
                this.toggleInfo();
                break;
            case '1':
                this.setQuality('low');
                break;
            case '2':
                this.setQuality('auto');
                break;
            case '3':
                this.setQuality('high');
                break;
            case 'r':
                this.resetView();
                break;
            case 'escape':
                this.exitFullscreen();
                break;
        }
    }

    // Переключение подсказки
    toggleHint() {
        const hint = document.getElementById('controls-hint');
        if (hint) {
            if (hint.classList.contains('fade-out')) {
                hint.classList.remove('fade-out');
                this.hideHintAfterDelay();
            } else {
                this.hideHint();
            }
        }
    }

    // Переключение полноэкранного режима
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log('Ошибка перехода в полноэкранный режим:', err);
            });
        } else {
            document.exitFullscreen();
        }
    }

    // Выход из полноэкранного режима
    exitFullscreen() {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }
    }

    // Создание скриншота
    takeScreenshot() {
        const canvas = document.getElementById('canvas');
        const dataURL = canvas.toDataURL('image/png');
        
        // Создание ссылки для скачивания
        const link = document.createElement('a');
        link.download = `island-screenshot-${Date.now()}.png`;
        link.href = dataURL;
        link.click();
        
        // Показ уведомления
        this.showNotification('Скриншот сохранен!');
    }

    // Переключение информации
    toggleInfo() {
        const stats = document.getElementById('stats');
        if (stats) {
            this.isVisible = !this.isVisible;
            stats.style.display = this.isVisible ? 'block' : 'none';
        }
    }

    // Установка начального качества
    setInitialQuality() {
        const quality = getQualityLevel();
        this.setQuality(quality);
    }

    // Установка качества
    setQuality(quality) {
        // Обновление UI
        document.querySelectorAll('.ui-button').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(`quality-${quality}`).classList.add('active');
        
        // Отправка события
        const event = new CustomEvent('qualityChanged', { detail: { quality } });
        window.dispatchEvent(event);
    }

    // Сброс вида
    resetView() {
        const event = new CustomEvent('resetView');
        window.dispatchEvent(event);
    }

    // Обработка изменения размера окна
    onWindowResize() {
        // Обновление позиций UI элементов
        this.updateUIPositions();
    }

    // Обновление позиций UI элементов
    updateUIPositions() {
        // Здесь можно добавить логику для адаптивного позиционирования
        // UI элементов в зависимости от размера экрана
    }

    // Обработка изменения качества
    onQualityChanged(quality) {
        // Показ уведомления об изменении качества
        this.showNotification(`Качество: ${quality.toUpperCase()}`);
    }

    // Обработка изменения времени суток
    onTimeOfDayChanged(timeOfDay) {
        // Показ уведомления об изменении времени суток
        const timeNames = {
            'dawn': 'Рассвет',
            'day': 'День',
            'sunset': 'Закат',
            'night': 'Ночь'
        };
        
        this.showNotification(`Время суток: ${timeNames[timeOfDay]}`);
    }

    // Показ уведомления
    showNotification(message, duration = 2000) {
        // Создание элемента уведомления
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        // Стили для уведомления
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            font-size: 14px;
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Показ уведомления
        setTimeout(() => {
            notification.style.opacity = '1';
        }, 10);
        
        // Скрытие уведомления
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
    }

    // Обновление статистики
    updateStats(stats) {
        this.stats = stats;
        
        const statsElement = document.getElementById('stats');
        if (statsElement) {
            statsElement.innerHTML = `
                FPS: ${Math.round(stats.fps)} | 
                GPU: ${stats.drawCalls} draws | 
                Tris: ${stats.triangles.toLocaleString()} | 
                Mem: ${Math.round(stats.memory)}MB
            `;
        }
    }

    // Создание панели информации
    createInfoPanel() {
        const panel = document.createElement('div');
        panel.className = 'info-panel';
        panel.innerHTML = `
            <div class="info-header">
                <h3>Информация об острове</h3>
                <button class="close-btn" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
            <div class="info-content">
                <div class="info-section">
                    <h4>Технические характеристики</h4>
                    <p><strong>Размер острова:</strong> ${this.config.SCALE.ISLAND_SIZE}m</p>
                    <p><strong>Высота гор:</strong> ${this.config.SCALE.MOUNTAIN_HEIGHT}m</p>
                    <p><strong>Количество пальм:</strong> ${this.config.VEGETATION.PALM_TREES.COUNT}</p>
                    <p><strong>Количество вилл:</strong> ${this.config.ARCHITECTURE.VILLAS.COUNT}</p>
                </div>
                <div class="info-section">
                    <h4>Управление</h4>
                    <p><strong>Мышь:</strong> Перетаскивание - перемещение</p>
                    <p><strong>Колесо:</strong> Зум</p>
                    <p><strong>ПКМ:</strong> Поворот камеры</p>
                    <p><strong>R:</strong> Сброс вида</p>
                    <p><strong>S:</strong> Скриншот</p>
                    <p><strong>F:</strong> Полноэкранный режим</p>
                </div>
            </div>
        `;
        
        // Стили для панели
        panel.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 12px;
            padding: 20px;
            max-width: 400px;
            max-height: 80vh;
            overflow-y: auto;
            z-index: 1000;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        `;
        
        document.body.appendChild(panel);
    }

    // Создание панели настроек
    createSettingsPanel() {
        const panel = document.createElement('div');
        panel.className = 'settings-panel';
        panel.innerHTML = `
            <div class="settings-header">
                <h3>Настройки</h3>
                <button class="close-btn" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
            <div class="settings-content">
                <div class="setting-group">
                    <label>Качество графики:</label>
                    <select id="quality-select">
                        <option value="low">Низкое</option>
                        <option value="auto" selected>Авто</option>
                        <option value="high">Высокое</option>
                    </select>
                </div>
                <div class="setting-group">
                    <label>Громкость:</label>
                    <input type="range" id="volume-slider" min="0" max="100" value="50">
                </div>
                <div class="setting-group">
                    <label>Показывать FPS:</label>
                    <input type="checkbox" id="show-fps" checked>
                </div>
            </div>
        `;
        
        // Стили для панели
        panel.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 12px;
            padding: 20px;
            max-width: 300px;
            z-index: 1000;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        `;
        
        // Обработчики событий
        const qualitySelect = panel.querySelector('#quality-select');
        qualitySelect.addEventListener('change', (e) => {
            this.setQuality(e.target.value);
        });
        
        const volumeSlider = panel.querySelector('#volume-slider');
        volumeSlider.addEventListener('input', (e) => {
            const volume = e.target.value / 100;
            this.setVolume(volume);
        });
        
        const showFpsCheckbox = panel.querySelector('#show-fps');
        showFpsCheckbox.addEventListener('change', (e) => {
            this.toggleFPSDisplay(e.target.checked);
        });
        
        document.body.appendChild(panel);
    }

    // Установка громкости
    setVolume(volume) {
        const event = new CustomEvent('volumeChanged', { detail: { volume } });
        window.dispatchEvent(event);
    }

    // Переключение отображения FPS
    toggleFPSDisplay(show) {
        const stats = document.getElementById('stats');
        if (stats) {
            stats.style.display = show ? 'block' : 'none';
        }
    }

    // Создание панели помощи
    createHelpPanel() {
        const panel = document.createElement('div');
        panel.className = 'help-panel';
        panel.innerHTML = `
            <div class="help-header">
                <h3>Справка</h3>
                <button class="close-btn" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
            <div class="help-content">
                <h4>Управление камерой</h4>
                <ul>
                    <li><strong>ЛКМ + перетаскивание:</strong> Перемещение камеры</li>
                    <li><strong>Колесо мыши:</strong> Приближение/отдаление</li>
                    <li><strong>ПКМ + перетаскивание:</strong> Поворот камеры</li>
                </ul>
                
                <h4>Горячие клавиши</h4>
                <ul>
                    <li><strong>R:</strong> Сброс вида камеры</li>
                    <li><strong>S:</strong> Сделать скриншот</li>
                    <li><strong>F:</strong> Полноэкранный режим</li>
                    <li><strong>H:</strong> Показать/скрыть подсказки</li>
                    <li><strong>I:</strong> Показать/скрыть информацию</li>
                    <li><strong>1-3:</strong> Изменить качество (Низкое/Авто/Высокое)</li>
                </ul>
                
                <h4>Особенности острова</h4>
                <ul>
                    <li>Динамическое освещение в зависимости от времени суток</li>
                    <li>Реалистичные волны океана</li>
                    <li>Анимированная растительность</li>
                    <li>Система частиц (дым, пыльца)</li>
                    <li>3D звуковая среда</li>
                </ul>
            </div>
        `;
        
        // Стили для панели
        panel.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 12px;
            padding: 20px;
            max-width: 500px;
            max-height: 80vh;
            overflow-y: auto;
            z-index: 1000;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        `;
        
        document.body.appendChild(panel);
    }

    // Создание панели загрузки
    createLoadingPanel() {
        const panel = document.createElement('div');
        panel.className = 'loading-panel';
        panel.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <h3>Загрузка острова...</h3>
                <p>Пожалуйста, подождите</p>
            </div>
        `;
        
        // Стили для панели
        panel.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
        `;
        
        document.body.appendChild(panel);
        return panel;
    }

    // Скрытие панели загрузки
    hideLoadingPanel() {
        const panel = document.querySelector('.loading-panel');
        if (panel) {
            panel.style.opacity = '0';
            setTimeout(() => {
                if (panel.parentNode) {
                    panel.parentNode.removeChild(panel);
                }
            }, 300);
        }
    }

    // Получение данных UI для других модулей
    getUIData() {
        return {
            stats: this.stats,
            isVisible: this.isVisible,
            quality: document.querySelector('.ui-button.active')?.id?.replace('quality-', '') || 'auto'
        };
    }
}

// Глобальный класс UI
window.IslandUI = IslandUI;
