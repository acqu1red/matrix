import { EventEmitter } from '../utils/EventEmitter.js';

export class SceneManager extends EventEmitter {
    constructor() {
        super();
        
        // Проверка наличия Three.js
        if (typeof THREE === 'undefined') {
            console.error('Three.js не загружен!');
            throw new Error('Three.js не загружен');
        }
        
        // Three.js объекты
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.composer = null;
        
        // Эффекты
        this.bloomPass = null;
        this.outputPass = null;
        
        // Объекты сцены
        this.island = null;
        this.skybox = null;
        this.water = null;
        this.clouds = [];
        this.palmTrees = [];
        this.particles = null;
        this.temples = [];
        
        // Анимации
        this.animationId = null;
        this.clock = new THREE.Clock();
        
        // Состояние
        this.isInitialized = false;
        this.isAnimating = false;
        this.currentScene = 'island';
        
        // Настройки
        this.settings = {
            bloomStrength: 1.5,
            bloomRadius: 0.4,
            bloomThreshold: 0.85,
            fogNear: 50,
            fogFar: 200,
            waterSpeed: 0.001,
            cloudSpeed: 0.02,
            palmSwaySpeed: 0.005
        };
        
        // Мобильные настройки
        this.mobileSettings = {
            bloomStrength: 1.0,
            bloomRadius: 0.3,
            bloomThreshold: 0.9,
            fogNear: 30,
            fogFar: 150,
            maxPolarAngle: Math.PI / 2.2,
            minDistance: 15,
            maxDistance: 80
        };
        
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        this.init();
    }
    
    async init() {
        try {
            console.log('Начало инициализации сцены...');
            
            this.createScene();
            console.log('Сцена создана');
            
            this.createCamera();
            console.log('Камера создана');
            
            this.createRenderer();
            console.log('Рендерер создан');
            
            this.createControls();
            console.log('Контролы созданы');
            
            this.createPostProcessing();
            console.log('Пост-процессинг создан');
            
            this.createLighting();
            console.log('Освещение создано');
            
            this.createSkybox();
            console.log('Небо создано');
            
            this.createIsland();
            console.log('Остров создан');
            
            this.createWater();
            console.log('Вода создана');
            
            this.createClouds();
            console.log('Облака созданы');
            
            this.createPalmTrees();
            console.log('Пальмы созданы');
            
            this.createParticles();
            console.log('Частицы созданы');
            
            this.isInitialized = true;
            console.log('Сцена полностью инициализирована');
            this.emit('sceneLoaded');
            
        } catch (error) {
            console.error('Ошибка инициализации сцены:', error);
            // Даже при ошибке эмитим событие загрузки
            this.isInitialized = true;
            this.emit('sceneLoaded');
            throw error;
        }
    }
    
    createScene() {
        this.scene = new THREE.Scene();
        
        // Настройка тумана
        const fogSettings = this.isMobile ? this.mobileSettings : this.settings;
        this.scene.fog = new THREE.Fog(0x87ceeb, fogSettings.fogNear, fogSettings.fogFar);
        
        // Настройка фона
        this.scene.background = new THREE.Color(0x87ceeb);
    }
    
    createCamera() {
        const aspect = window.innerWidth / window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        
        // Начальная позиция камеры
        this.camera.position.set(0, 30, 50);
        this.camera.lookAt(0, 0, 0);
    }
    
    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: "high-performance"
        });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        
        document.getElementById('scene-container').appendChild(this.renderer.domElement);
    }
    
    createControls() {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = false;
        
        if (this.isMobile) {
            this.controls.maxPolarAngle = this.mobileSettings.maxPolarAngle;
            this.controls.minDistance = this.mobileSettings.minDistance;
            this.controls.maxDistance = this.mobileSettings.maxDistance;
        } else {
            this.controls.maxPolarAngle = Math.PI / 2;
            this.controls.minDistance = 20;
            this.controls.maxDistance = 100;
        }
        
        this.controls.addEventListener('change', () => {
            this.emit('cameraMoved');
        });
        
        // Отключение контролов до закрытия интро
        this.controls.enabled = false;
    }
    
    createPostProcessing() {
        this.composer = new THREE.EffectComposer(this.renderer);
        
        // Основной рендер пасс
        const renderPass = new THREE.RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);
        
        // Bloom эффект
        const bloomSettings = this.isMobile ? this.mobileSettings : this.settings;
        this.bloomPass = new THREE.UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            bloomSettings.bloomStrength,
            bloomSettings.bloomRadius,
            bloomSettings.bloomThreshold
        );
        this.composer.addPass(this.bloomPass);
        
        // Output пасс для правильного отображения
        this.outputPass = new THREE.ShaderPass(THREE.CopyShader);
        this.outputPass.uniforms.tDiffuse.value = null;
        this.outputPass.renderToScreen = true;
        this.composer.addPass(this.outputPass);
    }
    
    createLighting() {
        // Ambient свет
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        
        // Основное направленное освещение (солнце)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
        directionalLight.position.set(50, 100, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.left = -100;
        directionalLight.shadow.camera.right = 100;
        directionalLight.shadow.camera.top = 100;
        directionalLight.shadow.camera.bottom = -100;
        this.scene.add(directionalLight);
        
        // Дополнительное освещение для храмов
        const templeLight = new THREE.PointLight(0xffd700, 0.8, 40);
        templeLight.position.set(0, 20, 0);
        this.scene.add(templeLight);
        
        // Заполняющий свет
        const fillLight = new THREE.DirectionalLight(0x87ceeb, 0.3);
        fillLight.position.set(-50, 50, -50);
        this.scene.add(fillLight);
    }
    
    createSkybox() {
        const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
        const skyMaterial = new THREE.ShaderMaterial({
            uniforms: {
                topColor: { value: new THREE.Color(0x0077ff) },
                bottomColor: { value: new THREE.Color(0xffffff) },
                offset: { value: 33 },
                exponent: { value: 0.6 }
            },
            vertexShader: `
                varying vec3 vWorldPosition;
                void main() {
                    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                    vWorldPosition = worldPosition.xyz;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 topColor;
                uniform vec3 bottomColor;
                uniform float offset;
                uniform float exponent;
                varying vec3 vWorldPosition;
                void main() {
                    float h = normalize(vWorldPosition + offset).y;
                    gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
                }
            `,
            side: THREE.BackSide
        });
        
        this.skybox = new THREE.Mesh(skyGeometry, skyMaterial);
        this.scene.add(this.skybox);
    }
    
    createIsland() {
        // Основная геометрия острова
        const islandGeometry = new THREE.CylinderGeometry(40, 50, 10, 32);
        const islandMaterial = new THREE.MeshLambertMaterial({
            color: 0x8fbc8f,
            transparent: true,
            opacity: 0.9
        });
        
        this.island = new THREE.Mesh(islandGeometry, islandMaterial);
        this.island.position.y = 5;
        this.island.castShadow = true;
        this.island.receiveShadow = true;
        this.scene.add(this.island);
        
        // Текстура травы
        const grassGeometry = new THREE.PlaneGeometry(100, 100);
        const grassMaterial = new THREE.MeshLambertMaterial({
            color: 0x556b2f,
            transparent: true,
            opacity: 0.8
        });
        
        const grass = new THREE.Mesh(grassGeometry, grassMaterial);
        grass.rotation.x = -Math.PI / 2;
        grass.position.y = 0.1;
        grass.receiveShadow = true;
        this.scene.add(grass);
        
        // Детали острова
        this.createIslandDetails();
    }
    
    createIslandDetails() {
        // Камни
        for (let i = 0; i < 20; i++) {
            const rockGeometry = new THREE.DodecahedronGeometry(0.5 + Math.random() * 1);
            const rockMaterial = new THREE.MeshLambertMaterial({
                color: 0x696969,
                transparent: true,
                opacity: 0.8
            });
            
            const rock = new THREE.Mesh(rockGeometry, rockMaterial);
            rock.position.set(
                (Math.random() - 0.5) * 80,
                0.5,
                (Math.random() - 0.5) * 80
            );
            rock.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            rock.castShadow = true;
            this.scene.add(rock);
        }
        
        // Цветы
        for (let i = 0; i < 30; i++) {
            const flowerGeometry = new THREE.SphereGeometry(0.2);
            const flowerMaterial = new THREE.MeshLambertMaterial({
                color: new THREE.Color().setHSL(Math.random(), 0.8, 0.6),
                transparent: true,
                opacity: 0.9
            });
            
            const flower = new THREE.Mesh(flowerGeometry, flowerMaterial);
            flower.position.set(
                (Math.random() - 0.5) * 70,
                0.3,
                (Math.random() - 0.5) * 70
            );
            this.scene.add(flower);
        }
    }
    
    createWater() {
        const waterGeometry = new THREE.PlaneGeometry(200, 200, 32, 32);
        const waterMaterial = new THREE.MeshLambertMaterial({
            color: 0x0077be,
            transparent: true,
            opacity: 0.6
        });
        
        this.water = new THREE.Mesh(waterGeometry, waterMaterial);
        this.water.rotation.x = -Math.PI / 2;
        this.water.position.y = -2;
        this.scene.add(this.water);
        
        // Анимация воды
        this.water.userData = {
            originalVertices: waterGeometry.attributes.position.array.slice(),
            time: 0
        };
    }
    
    createClouds() {
        for (let i = 0; i < 15; i++) {
            const cloud = this.createCloud();
            this.clouds.push(cloud);
            this.scene.add(cloud);
        }
    }
    
    createCloud() {
        const cloudGroup = new THREE.Group();
        
        // Случайная позиция
        cloudGroup.position.set(
            (Math.random() - 0.5) * 300,
            50 + Math.random() * 40,
            (Math.random() - 0.5) * 300
        );
        
        // Создание облака из нескольких сфер
        const sphereCount = 5 + Math.floor(Math.random() * 5);
        for (let i = 0; i < sphereCount; i++) {
            const sphereGeometry = new THREE.SphereGeometry(3 + Math.random() * 3);
            const sphereMaterial = new THREE.MeshLambertMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.7 + Math.random() * 0.2
            });
            
            const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
            sphere.position.set(
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 6,
                (Math.random() - 0.5) * 10
            );
            cloudGroup.add(sphere);
        }
        
        return cloudGroup;
    }
    
    createPalmTrees() {
        const palmPositions = [
            { x: -35, z: -25 },
            { x: 35, z: -25 },
            { x: -30, z: 25 },
            { x: 30, z: 25 },
            { x: -40, z: 0 },
            { x: 40, z: 0 }
        ];
        
        palmPositions.forEach(pos => {
            const palm = this.createPalmTree(pos.x, pos.z);
            this.palmTrees.push(palm);
            this.scene.add(palm);
        });
    }
    
    createPalmTree(x, z) {
        const palmGroup = new THREE.Group();
        palmGroup.position.set(x, 0, z);
        
        // Ствол
        const trunkGeometry = new THREE.CylinderGeometry(1, 1.5, 15);
        const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 7.5;
        trunk.castShadow = true;
        palmGroup.add(trunk);
        
        // Листья
        for (let i = 0; i < 8; i++) {
            const leafGeometry = new THREE.BoxGeometry(0.2, 8, 0.1);
            const leafMaterial = new THREE.MeshLambertMaterial({ color: 0x228b22 });
            const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
            
            const angle = (i / 8) * Math.PI * 2;
            leaf.position.set(
                Math.cos(angle) * 3,
                12,
                Math.sin(angle) * 3
            );
            leaf.rotation.z = angle;
            leaf.castShadow = true;
            palmGroup.add(leaf);
        }
        
        return palmGroup;
    }
    
    createParticles() {
        const particleCount = this.isMobile ? 500 : 1000;
        const particles = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 200;
            positions[i * 3 + 1] = Math.random() * 100;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 200;
            
            colors[i * 3] = Math.random();
            colors[i * 3 + 1] = Math.random();
            colors[i * 3 + 2] = Math.random();
            
            sizes[i] = Math.random() * 2 + 0.5;
        }
        
        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        particles.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const particleMaterial = new THREE.PointsMaterial({
            size: 0.5,
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            sizeAttenuation: true
        });
        
        this.particles = new THREE.Points(particles, particleMaterial);
        this.scene.add(this.particles);
    }
    
    // Методы управления
    enableControls() {
        if (this.controls) {
            this.controls.enabled = true;
        }
    }
    
    disableControls() {
        if (this.controls) {
            this.controls.enabled = false;
        }
    }
    
    startAnimation() {
        if (!this.isAnimating) {
            this.isAnimating = true;
            this.animate();
        }
    }
    
    stopAnimation() {
        this.isAnimating = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
    
    animate() {
        if (!this.isAnimating) return;
        
        this.animationId = requestAnimationFrame(() => this.animate());
        
        const delta = this.clock.getDelta();
        const time = this.clock.getElapsedTime();
        
        // Анимация облаков
        this.clouds.forEach(cloud => {
            cloud.position.x += this.settings.cloudSpeed;
            if (cloud.position.x > 150) {
                cloud.position.x = -150;
            }
        });
        
        // Анимация пальм
        this.palmTrees.forEach(palm => {
            palm.rotation.y += this.settings.palmSwaySpeed;
        });
        
        // Анимация воды
        if (this.water && this.water.userData.originalVertices) {
            const vertices = this.water.geometry.attributes.position.array;
            const originalVertices = this.water.userData.originalVertices;
            
            for (let i = 0; i < vertices.length; i += 3) {
                vertices[i + 1] = originalVertices[i + 1] + 
                    Math.sin(time * this.settings.waterSpeed + i * 0.1) * 0.5;
            }
            
            this.water.geometry.attributes.position.needsUpdate = true;
        }
        
        // Анимация частиц
        if (this.particles) {
            this.particles.rotation.y += 0.001;
        }
        
        // Обновление контролов
        if (this.controls) {
            this.controls.update();
        }
        
        // Рендеринг
        if (this.composer) {
            this.composer.render();
        } else {
            this.renderer.render(this.scene, this.camera);
        }
    }
    
    // Методы навигации
    flyToTemple(position, callback) {
        const targetPosition = new THREE.Vector3(
            position.x,
            position.y + 15,
            position.z + 10
        );
        
        const startPosition = this.camera.position.clone();
        const startLookAt = new THREE.Vector3(0, 0, 0);
        
        const duration = 2.0;
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = (Date.now() - startTime) / 1000;
            const progress = Math.min(elapsed / duration, 1);
            
            // Плавная интерполяция
            const easeProgress = this.easeInOutCubic(progress);
            
            this.camera.position.lerpVectors(startPosition, targetPosition, easeProgress);
            this.camera.lookAt(position.x, position.y + 5, position.z);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                if (callback) callback();
            }
        };
        
        animate();
    }
    
    zoomIn() {
        if (this.controls) {
            this.controls.dollyIn(1.2);
            this.controls.update();
        }
    }
    
    zoomOut() {
        if (this.controls) {
            this.controls.dollyOut(1.2);
            this.controls.update();
        }
    }
    
    resetCamera() {
        if (this.controls) {
            this.camera.position.set(0, 30, 50);
            this.camera.lookAt(0, 0, 0);
            this.controls.reset();
        }
    }
    
    // Обработка изменения размера окна
    handleResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(width, height);
        
        if (this.composer) {
            this.composer.setSize(width, height);
        }
    }
    
    // Утилиты
    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
    
    // Переход к библиотеке
    transitionToLibrary(callback) {
        // Анимация затемнения
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: black;
            opacity: 0;
            z-index: 999;
            transition: opacity 1s ease;
        `;
        document.body.appendChild(overlay);
        
        setTimeout(() => {
            overlay.style.opacity = '1';
            setTimeout(() => {
                if (callback) callback();
                setTimeout(() => {
                    overlay.style.opacity = '0';
                    setTimeout(() => {
                        document.body.removeChild(overlay);
                    }, 1000);
                }, 500);
            }, 1000);
        }, 100);
    }
    
    // Создание библиотеки
    createLibrary(books) {
        // Здесь будет логика создания библиотеки
        console.log('Создание библиотеки с книгами:', books);
    }
    
    // Очистка ресурсов
    dispose() {
        this.stopAnimation();
        
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        if (this.composer) {
            this.composer.dispose();
        }
        
        // Очистка геометрий и материалов
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
}
