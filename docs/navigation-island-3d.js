import { SUPABASE_CONFIG, CONFIG, tg } from './config.js';

// Инициализация Supabase
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.key);

// Three.js переменные
let scene, camera, renderer, controls;
let raycaster, mouse;
let selectedTemple = null;
let currentScene = 'island'; // 'island', 'library', 'book'
let currentUserId = null;
let isAdmin = false;

// Объекты сцены
let temples = [];
let palmTrees = [];
let clouds = [];
let books = [];
let island;
let skybox;
let water;
let particles;

// UI элементы
const loading = document.getElementById('loading');
const introOverlay = document.getElementById('introOverlay');
const introClose = document.getElementById('introClose');
const instructions = document.getElementById('instructions');
const backButton = document.getElementById('backButton');
const infoPanel = document.getElementById('infoPanel');

// Данные для тем и постов
const templeData = {
    1: {
        name: 'Тема 1',
        description: 'Первая тематическая категория знаний',
        books: [
            { id: 1, title: 'Пост 1', description: 'Увлекательное исследование первой темы' },
            { id: 2, title: 'Пост 2', description: 'Глубокий анализ ключевых аспектов' },
            { id: 3, title: 'Пост 3', description: 'Практическое руководство по применению' },
            { id: 4, title: 'Пост 4', description: 'Продвинутые техники и методы' },
            { id: 5, title: 'Пост 5', description: 'Экспертные советы и рекомендации' }
        ]
    },
    2: {
        name: 'Тема 2',
        description: 'Вторая тематическая категория знаний',
        books: [
            { id: 6, title: 'Пост 6', description: 'Основы второй темы' },
            { id: 7, title: 'Пост 7', description: 'Продвинутые концепции' },
            { id: 8, title: 'Пост 8', description: 'Практические примеры' },
            { id: 9, title: 'Пост 9', description: 'Секретные техники' },
            { id: 10, title: 'Пост 10', description: 'Мастер-класс эксперта' }
        ]
    },
    3: {
        name: 'Тема 3',
        description: 'Третья тематическая категория знаний',
        books: [
            { id: 11, title: 'Пост 11', description: 'Введение в третью тему' },
            { id: 12, title: 'Пост 12', description: 'Детальный разбор концепций' },
            { id: 13, title: 'Пост 13', description: 'Практические упражнения' },
            { id: 14, title: 'Пост 14', description: 'Продвинутые стратегии' },
            { id: 15, title: 'Пост 15', description: 'Экспертные методики' }
        ]
    },
    4: {
        name: 'Тема 4',
        description: 'Четвертая тематическая категория знаний',
        books: [
            { id: 16, title: 'Пост 16', description: 'Основы четвертой темы' },
            { id: 17, title: 'Пост 17', description: 'Углубленное изучение' },
            { id: 18, title: 'Пост 18', description: 'Практические кейсы' },
            { id: 19, title: 'Пост 19', description: 'Инновационные подходы' },
            { id: 20, title: 'Пост 20', description: 'Мастерство в действии' }
        ]
    },
    5: {
        name: 'Тема 5',
        description: 'Пятая тематическая категория знаний',
        books: [
            { id: 21, title: 'Пост 21', description: 'Введение в пятую тему' },
            { id: 22, title: 'Пост 22', description: 'Ключевые принципы' },
            { id: 23, title: 'Пост 23', description: 'Практические техники' },
            { id: 24, title: 'Пост 24', description: 'Продвинутые методы' },
            { id: 25, title: 'Пост 25', description: 'Экспертное руководство' }
        ]
    }
};

// Инициализация приложения
async function initApp() {
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
    
    setupEventListeners();
    initThreeJS();
    setupIntroTimer();
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
    introClose.addEventListener('click', closeIntro);
    backButton.addEventListener('click', goBack);
    
    // Обработчики мыши для Three.js
    window.addEventListener('click', onMouseClick);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize', onWindowResize);
}

// Инициализация Three.js
function initThreeJS() {
    // Создание сцены
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x87ceeb, 50, 200);

    // Создание камеры
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 30, 50);

    // Создание рендерера
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    document.getElementById('scene-container').appendChild(renderer.domElement);

    // Настройка контролов
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2;
    controls.minDistance = 20;
    controls.maxDistance = 100;

    // Настройка освещения
    setupLighting();

    // Создание объектов сцены
    createSkybox();
    createIsland();
    createWater();
    createTemples();
    createPalmTrees();
    createClouds();
    createParticles();

    // Настройка raycaster для кликов
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Запуск анимации
    animate();

    // Скрытие загрузки
    setTimeout(() => {
        loading.style.display = 'none';
    }, 1000);
}

// Настройка освещения
function setupLighting() {
    // Основное освещение
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    // Направленное освещение (солнце)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
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
    scene.add(directionalLight);

    // Дополнительное освещение для храмов
    const templeLight = new THREE.PointLight(0xffd700, 0.5, 30);
    templeLight.position.set(0, 20, 0);
    scene.add(templeLight);
}

// Создание неба
function createSkybox() {
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
    
    skybox = new THREE.Mesh(skyGeometry, skyMaterial);
    scene.add(skybox);
}

// Создание острова
function createIsland() {
    // Геометрия острова
    const islandGeometry = new THREE.CylinderGeometry(40, 50, 10, 32);
    const islandMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x8fbc8f,
        transparent: true,
        opacity: 0.9
    });
    
    island = new THREE.Mesh(islandGeometry, islandMaterial);
    island.position.y = 5;
    island.castShadow = true;
    island.receiveShadow = true;
    scene.add(island);

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
    scene.add(grass);
}

// Создание воды
function createWater() {
    const waterGeometry = new THREE.PlaneGeometry(200, 200);
    const waterMaterial = new THREE.MeshLambertMaterial({
        color: 0x0077be,
        transparent: true,
        opacity: 0.6
    });
    
    water = new THREE.Mesh(waterGeometry, waterMaterial);
    water.rotation.x = -Math.PI / 2;
    water.position.y = -2;
    scene.add(water);
}

// Создание храмов
function createTemples() {
    const templePositions = [
        { x: -20, z: -10 },
        { x: 20, z: -10 },
        { x: 0, z: -20 },
        { x: -15, z: 10 },
        { x: 15, z: 10 }
    ];

    templePositions.forEach((pos, index) => {
        const temple = createTemple(pos.x, pos.z, index + 1);
        temples.push(temple);
        scene.add(temple);
    });
}

// Создание одного храма
function createTemple(x, z, templeId) {
    const templeGroup = new THREE.Group();
    templeGroup.position.set(x, 0, z);
    templeGroup.userData = { templeId, type: 'temple' };

    // Основание храма
    const baseGeometry = new THREE.BoxGeometry(8, 6, 8);
    const baseMaterial = new THREE.MeshLambertMaterial({ 
        color: getTempleColor(templeId, 'base'),
        transparent: true,
        opacity: 0.9
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = 3;
    base.castShadow = true;
    base.receiveShadow = true;
    templeGroup.add(base);

    // Крыша храма
    const roofGeometry = new THREE.ConeGeometry(6, 4, 8);
    const roofMaterial = new THREE.MeshLambertMaterial({ 
        color: getTempleColor(templeId, 'roof'),
        transparent: true,
        opacity: 0.9
    });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 8;
    roof.castShadow = true;
    templeGroup.add(roof);

    // Колонны
    for (let i = 0; i < 4; i++) {
        const columnGeometry = new THREE.CylinderGeometry(0.3, 0.3, 4);
        const columnMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
        const column = new THREE.Mesh(columnGeometry, columnMaterial);
        column.position.set(
            (i % 2 === 0 ? -2 : 2),
            2,
            (i < 2 ? -2 : 2)
        );
        column.castShadow = true;
        templeGroup.add(column);
    }

    // Дверь
    const doorGeometry = new THREE.BoxGeometry(1.5, 3, 0.2);
    const doorMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(0, 1.5, 4.1);
    templeGroup.add(door);

    // Свечение для выбранного храма
    const glowGeometry = new THREE.SphereGeometry(10, 16, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xffd700,
        transparent: true,
        opacity: 0,
        side: THREE.BackSide
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.position.y = 5;
    glow.userData = { type: 'glow' };
    templeGroup.add(glow);

    return templeGroup;
}

// Получение цвета храма
function getTempleColor(templeId, part) {
    const colors = {
        1: { base: 0xd4af37, roof: 0xcd853f },
        2: { base: 0xc0c0c0, roof: 0xa9a9a9 },
        3: { base: 0xcd7f32, roof: 0x8b4513 },
        4: { base: 0xb8860b, roof: 0xb8860b },
        5: { base: 0xffd700, roof: 0xffd700 }
    };
    return colors[templeId][part];
}

// Создание пальм
function createPalmTrees() {
    const palmPositions = [
        { x: -35, z: -25 },
        { x: 35, z: -25 },
        { x: -30, z: 25 },
        { x: 30, z: 25 }
    ];

    palmPositions.forEach(pos => {
        const palm = createPalmTree(pos.x, pos.z);
        palmTrees.push(palm);
        scene.add(palm);
    });
}

// Создание одной пальмы
function createPalmTree(x, z) {
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

// Создание облаков
function createClouds() {
    for (let i = 0; i < 10; i++) {
        const cloud = createCloud();
        clouds.push(cloud);
        scene.add(cloud);
    }
}

// Создание одного облака
function createCloud() {
    const cloudGroup = new THREE.Group();
    
    // Случайная позиция
    cloudGroup.position.set(
        (Math.random() - 0.5) * 200,
        50 + Math.random() * 30,
        (Math.random() - 0.5) * 200
    );

    // Создание облака из нескольких сфер
    for (let i = 0; i < 5; i++) {
        const sphereGeometry = new THREE.SphereGeometry(3 + Math.random() * 2);
        const sphereMaterial = new THREE.MeshLambertMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.8
        });
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphere.position.set(
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 4,
            (Math.random() - 0.5) * 8
        );
        cloudGroup.add(sphere);
    }

    return cloudGroup;
}

// Создание частиц
function createParticles() {
    const particleCount = 1000;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 200;
        positions[i * 3 + 1] = Math.random() * 100;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 200;

        colors[i * 3] = Math.random();
        colors[i * 3 + 1] = Math.random();
        colors[i * 3 + 2] = Math.random();
    }

    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
        size: 0.5,
        vertexColors: true,
        transparent: true,
        opacity: 0.6
    });

    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);
}

// Обработка клика мыши
function onMouseClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        const object = intersects[0].object;
        let templeGroup = object;

        // Найти родительскую группу храма
        while (templeGroup && templeGroup.userData.type !== 'temple') {
            templeGroup = templeGroup.parent;
        }

        if (templeGroup && templeGroup.userData.type === 'temple') {
            handleTempleClick(templeGroup.userData.templeId);
        }
    }
}

// Обработка движения мыши
function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    // Сброс цвета всех храмов
    temples.forEach(temple => {
        temple.children.forEach(child => {
            if (child.material && child.material.color) {
                const templeId = temple.userData.templeId;
                if (child.geometry.type === 'BoxGeometry' && child.position.y === 3) {
                    child.material.color.setHex(getTempleColor(templeId, 'base'));
                } else if (child.geometry.type === 'ConeGeometry') {
                    child.material.color.setHex(getTempleColor(templeId, 'roof'));
                }
            }
        });
    });

    // Подсветка храма под курсором
    if (intersects.length > 0) {
        const object = intersects[0].object;
        let templeGroup = object;

        while (templeGroup && templeGroup.userData.type !== 'temple') {
            templeGroup = templeGroup.parent;
        }

        if (templeGroup && templeGroup.userData.type === 'temple') {
            templeGroup.children.forEach(child => {
                if (child.material && child.material.color) {
                    child.material.color.setHex(0xffd700);
                }
            });
        }
    }
}

// Обработка клика по храму
function handleTempleClick(templeId) {
    if (selectedTemple === templeId) {
        // Второй клик - подтверждение
        confirmTempleSelection(templeId);
    } else {
        // Первый клик - выбор
        selectTemple(templeId);
    }
}

// Выбор храма
function selectTemple(templeId) {
    // Сброс предыдущего выбора
    if (selectedTemple) {
        const prevTemple = temples.find(t => t.userData.templeId === selectedTemple);
        if (prevTemple) {
            prevTemple.children.forEach(child => {
                if (child.userData.type === 'glow') {
                    child.material.opacity = 0;
                }
            });
        }
    }

    // Выбор нового храма
    selectedTemple = templeId;
    const temple = temples.find(t => t.userData.templeId === templeId);
    if (temple) {
        temple.children.forEach(child => {
            if (child.userData.type === 'glow') {
                child.material.opacity = 0.3;
            }
        });
    }

    // Обновление UI
    instructions.textContent = 'Нажми еще раз для подтверждения выбора';
    instructions.classList.add('confirm');
    backButton.classList.remove('hidden');
}

// Подтверждение выбора храма
function confirmTempleSelection(templeId) {
    // Анимация перехода
    const temple = temples.find(t => t.userData.templeId === templeId);
    if (temple) {
        // Анимация приближения к храму
        const targetPosition = temple.position.clone();
        targetPosition.y += 10;
        
        new TWEEN.Tween(camera.position)
            .to(targetPosition, 2000)
            .easing(TWEEN.Easing.Cubic.Out)
            .start();
    }

    // Переход к библиотеке (пока просто обновляем инструкции)
    setTimeout(() => {
        instructions.textContent = 'Переход к библиотеке...';
        // Здесь будет логика перехода к библиотеке
    }, 2000);
}

// Функция возврата
function goBack() {
    if (selectedTemple) {
        // Сброс выбора храма
        const temple = temples.find(t => t.userData.templeId === selectedTemple);
        if (temple) {
            temple.children.forEach(child => {
                if (child.userData.type === 'glow') {
                    child.material.opacity = 0;
                }
            });
        }
        selectedTemple = null;
        
        // Обновление UI
        instructions.textContent = 'Нажми на храм для выбора темы';
        instructions.classList.remove('confirm');
        backButton.classList.add('hidden');
    }
}

// Настройка таймера для интро
function setupIntroTimer() {
    setTimeout(() => {
        if (introOverlay.style.display !== 'none') {
            closeIntro();
        }
    }, 15000);
}

// Закрытие интро
function closeIntro() {
    introOverlay.style.display = 'none';
}

// Обработка изменения размера окна
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Анимация
function animate() {
    requestAnimationFrame(animate);
    
    // Обновление контролов
    controls.update();
    
    // Анимация облаков
    clouds.forEach(cloud => {
        cloud.position.x += 0.02;
        if (cloud.position.x > 100) {
            cloud.position.x = -100;
        }
    });
    
    // Анимация пальм
    palmTrees.forEach(palm => {
        palm.rotation.y += 0.005;
    });
    
    // Анимация воды
    if (water) {
        water.position.y = -2 + Math.sin(Date.now() * 0.001) * 0.5;
    }
    
    // Обновление TWEEN
    TWEEN.update();
    
    // Рендеринг
    renderer.render(scene, camera);
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', initApp);
