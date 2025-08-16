// Главный модуль острова навигации
class IslandApp {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.utils = null;
        this.terrain = null;
        this.ocean = null;
        this.vegetation = null;
        this.architecture = null;
        this.atmosphere = null;
        this.cameraController = null;
        this.postProcessing = null;
        this.audio = null;
        this.ui = null;
        
        this.clock = new THREE.Clock();
        this.isRunning = false;
        this.stats = {
            fps: 0,
            drawCalls: 0,
            triangles: 0,
            memory: 0
        };
    }

    // Проверка доступности Three.js
    checkThreeJS() {
        if (typeof THREE === 'undefined') {
            throw new Error('Three.js не загружен');
        }
        
        // Проверка необходимых компонентов
        const required = [
            'Scene', 'PerspectiveCamera', 'WebGLRenderer', 'Clock',
            'DirectionalLight', 'AmbientLight', 'FogExp2',
            'PlaneGeometry', 'SphereGeometry', 'RingGeometry',
            'ShaderMaterial', 'MeshBasicMaterial', 'MeshLambertMaterial',
            'Mesh', 'Group', 'Points', 'PointsMaterial',
            'Vector3', 'Vector2', 'Color', 'Math'
        ];
        
        for (const component of required) {
            if (!THREE[component]) {
                throw new Error(`Компонент Three.js ${component} не найден`);
            }
        }
        
        console.log('Three.js проверен успешно');
    }

    // Инициализация приложения
    async init() {
        try {
            console.log('Инициализация острова навигации...');
            
            // Проверка Three.js
            this.checkThreeJS();
            
            // Создание утилит
            this.utils = new IslandUtils();
            
            // Создание сцены
            this.scene = new THREE.Scene();
            
            // Создание камеры
            this.cameraController = new IslandCamera(this.scene, this.utils);
            this.camera = this.cameraController.create();
            
            // Создание рендерера и постобработки
            this.postProcessing = new IslandPostProcessing(this.scene, this.camera, this.utils);
            this.renderer = this.postProcessing.create();
            
            // Создание террейна
            this.terrain = new IslandTerrain(this.scene, this.utils);
            this.terrain.create();
            
            // Создание океана
            this.ocean = new IslandOcean(this.scene, this.utils);
            this.ocean.create();
            
            // Создание растительности
            this.vegetation = new IslandVegetation(this.scene, this.utils, this.terrain.getTerrainData());
            this.vegetation.create();
            
            // Создание архитектуры
            this.architecture = new IslandArchitecture(this.scene, this.utils, this.terrain.getTerrainData());
            this.architecture.create();
            
            // Создание атмосферы
            this.atmosphere = new IslandAtmosphere(this.scene, this.utils);
            this.atmosphere.create();
            
            // Инициализация аудио
            this.audio = new IslandAudio(this.utils);
            this.audio.init();
            
            // Инициализация UI
            this.ui = new IslandUI(this.utils);
            this.ui.init();
            
            // Скрытие экрана загрузки
            this.hideLoadingScreen();
            
            // Запуск анимации
            this.start();
            
            console.log('Остров навигации успешно инициализирован!');
            
        } catch (error) {
            console.error('Ошибка инициализации острова:', error);
            this.showError(error.message);
        }
    }

    // Скрытие экрана загрузки
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }
    }

    // Показ ошибки
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 0, 0, 0.9);
            color: white;
            padding: 20px;
            border-radius: 8px;
            z-index: 10000;
            text-align: center;
        `;
        errorDiv.innerHTML = `
            <h3>Ошибка загрузки</h3>
            <p>${message}</p>
            <button onclick="location.reload()" style="margin-top: 10px; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer;">
                Перезагрузить
            </button>
        `;
        document.body.appendChild(errorDiv);
    }

    // Запуск анимации
    start() {
        this.isRunning = true;
        this.animate();
    }

    // Остановка анимации
    stop() {
        this.isRunning = false;
    }

    // Основной цикл анимации
    animate() {
        if (!this.isRunning) return;
        
        requestAnimationFrame(() => this.animate());
        
        const deltaTime = this.clock.getDelta();
        const elapsedTime = this.clock.getElapsedTime();
        
        // Обновление всех систем
        this.update(elapsedTime, deltaTime);
        
        // Рендеринг
        this.render();
        
        // Обновление статистики
        this.updateStats();
    }

    // Обновление всех систем
    update(time, deltaTime) {
        // Обновление террейна
        if (this.terrain) {
            this.terrain.update(time);
        }
        
        // Обновление океана
        if (this.ocean) {
            this.ocean.update(time, this.camera);
        }
        
        // Обновление растительности
        if (this.vegetation) {
            this.vegetation.update(time);
        }
        
        // Обновление архитектуры
        if (this.architecture) {
            this.architecture.update(time);
        }
        
        // Обновление атмосферы
        if (this.atmosphere) {
            this.atmosphere.update(time);
        }
        
        // Обновление камеры
        if (this.cameraController) {
            this.cameraController.update();
        }
        
        // Обновление постобработки
        if (this.postProcessing) {
            // Обновление эффектов в зависимости от времени суток
            this.updatePostProcessingEffects(time);
        }
    }

    // Обновление эффектов постобработки
    updatePostProcessingEffects(time) {
        const atmosphereData = this.atmosphere.getAtmosphereData();
        const timeOfDay = atmosphereData.currentTimeOfDay;
        
        // Обновление bloom в зависимости от времени суток
        if (this.postProcessing.effects.bloom) {
            let intensity = 1.5; // значение по умолчанию
            
            switch (timeOfDay) {
                case 'dawn':
                case 'sunset':
                    intensity = 2.0;
                    break;
                case 'day':
                    intensity = 1.5;
                    break;
                case 'night':
                    intensity = 0.8;
                    break;
            }
            
            // Обновление для UnrealBloomPass
            if (this.postProcessing.effects.bloom.strength !== undefined) {
                this.postProcessing.effects.bloom.strength = intensity;
            }
            // Обновление для простого bloom
            else if (this.postProcessing.effects.bloom.material && 
                     this.postProcessing.effects.bloom.material.uniforms && 
                     this.postProcessing.effects.bloom.material.uniforms.intensity) {
                this.postProcessing.effects.bloom.material.uniforms.intensity.value = intensity;
            }
        }
        
        // Обновление vignette
        if (this.postProcessing.effects.vignette && this.postProcessing.effects.vignette.material && 
            this.postProcessing.effects.vignette.material.uniforms && 
            this.postProcessing.effects.vignette.material.uniforms['darkness']) {
            switch (timeOfDay) {
                case 'dawn':
                case 'sunset':
                    this.postProcessing.effects.vignette.material.uniforms['darkness'].value = 0.4;
                    break;
                case 'day':
                    this.postProcessing.effects.vignette.material.uniforms['darkness'].value = 0.2;
                    break;
                case 'night':
                    this.postProcessing.effects.vignette.material.uniforms['darkness'].value = 0.6;
                    break;
            }
        }
    }

    // Рендеринг сцены
    render() {
        if (this.postProcessing) {
            this.postProcessing.render();
        } else if (this.renderer) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    // Обновление статистики
    updateStats() {
        if (this.postProcessing) {
            const rendererStats = this.postProcessing.getRendererStats();
            this.stats = {
                fps: 1 / this.clock.getDelta(),
                drawCalls: rendererStats.calls,
                triangles: rendererStats.triangles,
                memory: Math.round(rendererStats.memory.geometries + rendererStats.memory.textures)
            };
            
            // Обновление UI
            if (this.ui) {
                this.ui.updateStats(this.stats);
            }
        }
    }

    // Обработка изменения качества
    onQualityChanged(quality) {
        console.log('Изменение качества на:', quality);
        
        // Обновление настроек рендерера
        if (this.postProcessing) {
            this.postProcessing.onQualityChanged(quality);
        }
        
        // Обновление настроек камеры
        if (this.cameraController) {
            this.cameraController.onQualityChanged(quality);
        }
        
        // Обновление настроек аудио
        if (this.audio) {
            this.audio.onQualityChanged(quality);
        }
    }

    // Обработка сброса вида
    onResetView() {
        if (this.cameraController) {
            this.cameraController.resetView();
        }
    }

    // Обработка изменения громкости
    onVolumeChanged(volume) {
        if (this.audio) {
            this.audio.masterVolume = volume;
            this.audio.updateAllVolumes();
        }
    }

    // Создание интерактивных элементов
    createInteractiveElements() {
        // Создание информационных панелей для объектов
        this.createInfoPanels();
        
        // Создание системы подсказок
        this.createTooltips();
    }

    // Создание информационных панелей
    createInfoPanels() {
        // Информация о замке
        if (this.architecture && this.architecture.castle) {
            this.createObjectInfo(this.architecture.castle, {
                title: 'Главный замок',
                description: 'Современный замок с 6 этажами и 8 башнями',
                details: [
                    'Высота: 26 метров',
                    'Площадь: 792 м²',
                    'Материал: Полированный бетон',
                    'Особенности: Стеклянные вставки, дымовые трубы'
                ]
            });
        }
        
        // Информация о виллах
        if (this.architecture && this.architecture.villas) {
            this.architecture.villas.forEach((villa, index) => {
                this.createObjectInfo(villa, {
                    title: `Вилла ${index + 1}`,
                    description: index < 5 ? 'Большая бетонная вилла' : 'Деревянное бунгало',
                    details: [
                        `Тип: ${index < 5 ? 'Люкс' : 'Стандарт'}`,
                        'Особенности: Современный дизайн',
                        'Удобства: Полный набор'
                    ]
                });
            });
        }
    }

    // Создание информации об объекте
    createObjectInfo(object, info) {
        object.userData.info = info;
        
        // Добавление обработчика клика
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        
        document.addEventListener('click', (event) => {
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            
            raycaster.setFromCamera(mouse, this.camera);
            const intersects = raycaster.intersectObject(object, true);
            
            if (intersects.length > 0) {
                this.showObjectInfo(info);
            }
        });
    }

    // Показ информации об объекте
    showObjectInfo(info) {
        const panel = document.createElement('div');
        panel.className = 'object-info-panel';
        panel.innerHTML = `
            <div class="info-header">
                <h3>${info.title}</h3>
                <button class="close-btn" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
            <div class="info-content">
                <p>${info.description}</p>
                <ul>
                    ${info.details.map(detail => `<li>${detail}</li>`).join('')}
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
            max-width: 400px;
            z-index: 1000;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        `;
        
        document.body.appendChild(panel);
    }

    // Создание системы подсказок
    createTooltips() {
        // Подсказки для UI элементов
        const tooltips = [
            { element: '#quality-auto', text: 'Автоматическое определение качества' },
            { element: '#quality-low', text: 'Низкое качество для лучшей производительности' },
            { element: '#quality-high', text: 'Высокое качество для лучшей графики' },
            { element: '#reset-view', text: 'Сбросить вид камеры' }
        ];
        
        tooltips.forEach(tooltip => {
            const element = document.querySelector(tooltip.element);
            if (element) {
                element.addEventListener('mouseenter', () => {
                    this.showTooltip(element, tooltip.text);
                });
                
                element.addEventListener('mouseleave', () => {
                    this.hideTooltip();
                });
            }
        });
    }

    // Показ подсказки
    showTooltip(element, text) {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = text;
        
        // Позиционирование подсказки
        const rect = element.getBoundingClientRect();
        tooltip.style.cssText = `
            position: fixed;
            top: ${rect.bottom + 5}px;
            left: ${rect.left + rect.width / 2}px;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
            z-index: 1000;
            white-space: nowrap;
        `;
        
        document.body.appendChild(tooltip);
        element.tooltip = tooltip;
    }

    // Скрытие подсказки
    hideTooltip() {
        const tooltip = document.querySelector('.tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    }

    // Обработка изменения размера окна
    onWindowResize() {
        if (this.camera) {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
        }
        
        if (this.renderer) {
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        }
        
        if (this.postProcessing) {
            this.postProcessing.onWindowResize();
        }
    }

    // Очистка ресурсов
    dispose() {
        console.log('Очистка ресурсов острова...');
        
        this.stop();
        
        // Очистка всех модулей
        if (this.terrain) this.terrain.dispose();
        if (this.ocean) this.ocean.dispose();
        if (this.vegetation) this.vegetation.dispose();
        if (this.architecture) this.architecture.dispose();
        if (this.atmosphere) this.atmosphere.dispose();
        if (this.postProcessing) this.postProcessing.dispose();
        if (this.audio) this.audio.dispose();
        
        // Очистка сцены
        if (this.scene) {
            this.scene.traverse((object) => {
                if (object.geometry) {
                    object.geometry.dispose();
                }
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach(material => material.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            });
        }
        
        console.log('Ресурсы острова очищены');
    }

    // Получение данных приложения
    getAppData() {
        return {
            scene: this.scene,
            camera: this.camera,
            renderer: this.renderer,
            terrain: this.terrain,
            ocean: this.ocean,
            vegetation: this.vegetation,
            architecture: this.architecture,
            atmosphere: this.atmosphere,
            cameraController: this.cameraController,
            postProcessing: this.postProcessing,
            audio: this.audio,
            ui: this.ui,
            stats: this.stats,
            isRunning: this.isRunning
        };
    }
}

// Глобальный экземпляр приложения
let islandApp = null;

console.log('Остров навигации загружен и готов к инициализации!');
