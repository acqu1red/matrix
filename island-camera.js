// Модуль камеры острова
class IslandCamera {
    constructor(scene, utils) {
        this.scene = scene;
        this.utils = utils;
        this.config = ISLAND_CONFIG;
        this.camera = null;
        this.controls = null;
        this.startPosition = null;
        this.startTarget = null;
        this.currentQuality = 'auto';
    }

    // Создание камеры
    create() {
        // Создание перспективной камеры
        this.camera = new THREE.PerspectiveCamera(
            75, // FOV
            window.innerWidth / window.innerHeight,
            0.1,
            2000
        );

        // Установка начальной позиции
        this.startPosition = new THREE.Vector3(
            this.config.CAMERA.START_POSITION.x,
            this.config.CAMERA.START_POSITION.y,
            this.config.CAMERA.START_POSITION.z
        );
        
        this.startTarget = new THREE.Vector3(
            this.config.CAMERA.START_TARGET.x,
            this.config.CAMERA.START_TARGET.y,
            this.config.CAMERA.START_TARGET.z
        );

        this.camera.position.copy(this.startPosition);
        this.camera.lookAt(this.startTarget);

        // Создание контролов
        this.createControls();

        return this.camera;
    }

    // Создание контролов камеры
    createControls() {
        this.controls = new THREE.OrbitControls(this.camera, document.getElementById('canvas'));
        
        // Настройка ограничений
        this.controls.minDistance = this.config.CAMERA.MIN_DISTANCE;
        this.controls.maxDistance = this.config.CAMERA.MAX_DISTANCE;
        this.controls.maxPolarAngle = THREE.MathUtils.degToRad(this.config.CAMERA.MAX_POLAR_ANGLE);
        
        // Фиксированный угол наклона
        this.controls.minPolarAngle = THREE.MathUtils.degToRad(this.config.CAMERA.FIXED_PHI);
        this.controls.maxPolarAngle = THREE.MathUtils.degToRad(this.config.CAMERA.FIXED_PHI);
        
        // Настройка чувствительности
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.rotateSpeed = 0.5;
        this.controls.zoomSpeed = 0.8;
        this.controls.panSpeed = 0.8;
        
        // Ограничение пана
        this.controls.enablePan = true;
        this.controls.panBoundary = this.createPanBoundary();
        
        // Настройка зума
        this.controls.enableZoom = true;
        this.controls.zoomBoundary = this.createZoomBoundary();
        
        // Настройка поворота
        this.controls.enableRotate = true;
        
        // Обработчики событий
        this.setupEventHandlers();
    }

    // Создание границ пана
    createPanBoundary() {
        const islandSize = this.config.SCALE.ISLAND_SIZE;
        const oceanSize = this.config.OCEAN.SIZE;
        
        return {
            minX: -oceanSize / 2,
            maxX: oceanSize / 2,
            minZ: -oceanSize / 2,
            maxZ: oceanSize / 2
        };
    }

    // Создание границ зума
    createZoomBoundary() {
        return {
            minDistance: this.config.CAMERA.MIN_DISTANCE,
            maxDistance: this.config.CAMERA.MAX_DISTANCE
        };
    }

    // Настройка обработчиков событий
    setupEventHandlers() {
        // Обработка изменения размера окна
        window.addEventListener('resize', () => {
            this.onWindowResize();
        });

        // Обработка изменения качества
        document.getElementById('quality-auto').addEventListener('click', () => {
            this.setQuality('auto');
        });
        
        document.getElementById('quality-low').addEventListener('click', () => {
            this.setQuality('low');
        });
        
        document.getElementById('quality-high').addEventListener('click', () => {
            this.setQuality('high');
        });

        // Обработка сброса вида
        document.getElementById('reset-view').addEventListener('click', () => {
            this.resetView();
        });

        // Обработка жестов для мобильных устройств
        this.setupMobileGestures();
    }

    // Настройка жестов для мобильных устройств
    setupMobileGestures() {
        const canvas = document.getElementById('canvas');
        let isTouching = false;
        let touchStartX = 0;
        let touchStartY = 0;
        let touchStartDistance = 0;

        // Обработка касаний
        canvas.addEventListener('touchstart', (event) => {
            isTouching = true;
            
            if (event.touches.length === 1) {
                // Один палец - пан
                touchStartX = event.touches[0].clientX;
                touchStartY = event.touches[0].clientY;
            } else if (event.touches.length === 2) {
                // Два пальца - зум
                touchStartDistance = this.getTouchDistance(event.touches[0], event.touches[1]);
            }
        });

        canvas.addEventListener('touchmove', (event) => {
            if (!isTouching) return;
            
            event.preventDefault();
            
            if (event.touches.length === 1) {
                // Пан
                const deltaX = event.touches[0].clientX - touchStartX;
                const deltaY = event.touches[0].clientY - touchStartY;
                
                this.controls.panLeft(-deltaX * 0.01);
                this.controls.panUp(deltaY * 0.01);
                
                touchStartX = event.touches[0].clientX;
                touchStartY = event.touches[0].clientY;
            } else if (event.touches.length === 2) {
                // Зум
                const currentDistance = this.getTouchDistance(event.touches[0], event.touches[1]);
                const deltaDistance = currentDistance - touchStartDistance;
                
                if (deltaDistance > 0) {
                    this.controls.zoomOut(deltaDistance * 0.01);
                } else {
                    this.controls.zoomIn(-deltaDistance * 0.01);
                }
                
                touchStartDistance = currentDistance;
            }
        });

        canvas.addEventListener('touchend', () => {
            isTouching = false;
        });
    }

    // Получение расстояния между двумя точками касания
    getTouchDistance(touch1, touch2) {
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // Обработка изменения размера окна
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        
        // Обновление контролов
        if (this.controls) {
            this.controls.update();
        }
    }

    // Установка качества рендеринга
    setQuality(quality) {
        this.currentQuality = quality;
        
        // Обновление UI
        document.querySelectorAll('.ui-button').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(`quality-${quality}`).classList.add('active');
        
        // Применение настроек качества
        this.applyQualitySettings(quality);
    }

    // Применение настроек качества
    applyQualitySettings(quality) {
        const settings = this.getQualitySettings(quality);
        
        // Обновление настроек камеры
        if (settings.camera) {
            this.camera.fov = settings.camera.fov;
            this.camera.updateProjectionMatrix();
        }
        
        // Обновление настроек контролов
        if (settings.controls) {
            this.controls.rotateSpeed = settings.controls.rotateSpeed;
            this.controls.zoomSpeed = settings.controls.zoomSpeed;
            this.controls.panSpeed = settings.controls.panSpeed;
        }
        
        // Уведомление других модулей об изменении качества
        this.notifyQualityChange(quality);
    }

    // Получение настроек качества
    getQualitySettings(quality) {
        const settings = {
            auto: {
                camera: { fov: 75 },
                controls: { rotateSpeed: 0.5, zoomSpeed: 0.8, panSpeed: 0.8 }
            },
            low: {
                camera: { fov: 60 },
                controls: { rotateSpeed: 0.3, zoomSpeed: 0.5, panSpeed: 0.5 }
            },
            high: {
                camera: { fov: 90 },
                controls: { rotateSpeed: 0.8, zoomSpeed: 1.2, panSpeed: 1.2 }
            }
        };
        
        return settings[quality] || settings.auto;
    }

    // Уведомление об изменении качества
    notifyQualityChange(quality) {
        // Создание события для других модулей
        const event = new CustomEvent('qualityChanged', { detail: { quality } });
        window.dispatchEvent(event);
    }

    // Сброс вида камеры
    resetView() {
        if (this.camera && this.startPosition && this.startTarget) {
            // Плавное возвращение к начальной позиции
            this.animateToPosition(this.startPosition, this.startTarget, 2000);
        }
    }

    // Анимация к позиции
    animateToPosition(targetPosition, targetTarget, duration) {
        const startPosition = this.camera.position.clone();
        const startTarget = this.controls.target.clone();
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Плавная интерполяция
            const easeProgress = this.easeInOutCubic(progress);
            
            this.camera.position.lerpVectors(startPosition, targetPosition, easeProgress);
            this.controls.target.lerpVectors(startTarget, targetTarget, easeProgress);
            
            this.controls.update();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }

    // Функция плавности
    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    // Получение позиции камеры
    getPosition() {
        return this.camera.position.clone();
    }

    // Получение направления камеры
    getDirection() {
        const direction = new THREE.Vector3();
        this.camera.getWorldDirection(direction);
        return direction;
    }

    // Получение матрицы вида
    getViewMatrix() {
        return this.camera.matrixWorldInverse.clone();
    }

    // Получение матрицы проекции
    getProjectionMatrix() {
        return this.camera.projectionMatrix.clone();
    }

    // Проверка видимости объекта
    isObjectVisible(object) {
        const frustum = new THREE.Frustum();
        const matrix = new THREE.Matrix4();
        
        matrix.multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse);
        frustum.setFromProjectionMatrix(matrix);
        
        const boundingBox = new THREE.Box3().setFromObject(object);
        return frustum.intersectsBox(boundingBox);
    }

    // Получение точки под курсором
    getPointUnderCursor(mouseX, mouseY) {
        const mouse = new THREE.Vector2();
        mouse.x = (mouseX / window.innerWidth) * 2 - 1;
        mouse.y = -(mouseY / window.innerHeight) * 2 + 1;
        
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, this.camera);
        
        // Поиск пересечений с террейном
        const intersects = raycaster.intersectObjects(this.scene.children, true);
        
        if (intersects.length > 0) {
            return intersects[0].point;
        }
        
        return null;
    }

    // Фокус на объекте
    focusOnObject(object, distance = 100) {
        const boundingBox = new THREE.Box3().setFromObject(object);
        const center = boundingBox.getCenter(new THREE.Vector3());
        const size = boundingBox.getSize(new THREE.Vector3());
        
        // Вычисление оптимальной позиции камеры
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = this.camera.fov * (Math.PI / 180);
        const cameraDistance = Math.abs(maxDim / 2 / Math.tan(fov / 2)) + distance;
        
        const targetPosition = center.clone();
        targetPosition.y += cameraDistance;
        
        this.animateToPosition(targetPosition, center, 1500);
    }

    // Создание скриншота
    takeScreenshot() {
        const canvas = document.getElementById('canvas');
        const dataURL = canvas.toDataURL('image/png');
        
        // Создание ссылки для скачивания
        const link = document.createElement('a');
        link.download = 'island-screenshot.png';
        link.href = dataURL;
        link.click();
    }

    // Обновление камеры
    update() {
        if (this.controls) {
            this.controls.update();
        }
        
        // Проверка границ
        this.enforceBoundaries();
    }

    // Принудительное соблюдение границ
    enforceBoundaries() {
        const position = this.camera.position;
        const boundary = this.createPanBoundary();
        
        // Ограничение позиции камеры
        position.x = Math.max(boundary.minX, Math.min(boundary.maxX, position.x));
        position.z = Math.max(boundary.minZ, Math.min(boundary.maxZ, position.z));
        
        // Ограничение высоты
        position.y = Math.max(10, Math.min(1000, position.y));
    }

    // Получение данных камеры для других модулей
    getCameraData() {
        return {
            camera: this.camera,
            controls: this.controls,
            position: this.getPosition(),
            direction: this.getDirection(),
            viewMatrix: this.getViewMatrix(),
            projectionMatrix: this.getProjectionMatrix(),
            quality: this.currentQuality
        };
    }
}

// Глобальный класс камеры
window.IslandCamera = IslandCamera;
