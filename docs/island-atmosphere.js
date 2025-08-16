// Модуль атмосферы и освещения
class IslandAtmosphere {
    constructor(scene, utils) {
        this.scene = scene;
        this.utils = utils;
        this.config = ISLAND_CONFIG;
        this.sky = null;
        this.clouds = [];
        this.sun = null;
        this.ambient = null;
        this.fog = null;
        this.birds = [];
        this.currentTimeOfDay = 'day';
    }

    // Создание атмосферы
    create() {
        // Создание неба
        this.createSky();
        
        // Создание облаков
        this.createClouds();
        
        // Создание освещения
        this.createLighting();
        
        // Создание птиц
        this.createBirds();
        
        // Установка времени суток
        this.setTimeOfDay();
        
        return this;
    }

    // Создание неба
    createSky() {
        // Создание сферического неба
        const skyGeometry = new THREE.SphereGeometry(1000, 32, 32);
        
        // Материал неба с градиентом
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
        
        this.sky = new THREE.Mesh(skyGeometry, skyMaterial);
        this.scene.add(this.sky);
    }

    // Создание облаков
    createClouds() {
        const cloudCount = 50;
        
        for (let i = 0; i < cloudCount; i++) {
            const cloud = this.createCloud();
            
            // Случайное размещение облаков
            const angle = this.utils.random(0, Math.PI * 2);
            const distance = this.utils.random(200, 800);
            const height = this.utils.random(100, 300);
            
            cloud.position.set(
                Math.cos(angle) * distance,
                height,
                Math.sin(angle) * distance
            );
            
            cloud.scale.setScalar(this.utils.random(0.5, 2.0));
            cloud.rotation.y = this.utils.random(0, Math.PI * 2);
            
            // Данные для анимации
            cloud.userData = {
                originalPosition: cloud.position.clone(),
                speed: this.utils.random(0.1, 0.3),
                direction: this.utils.random(0, Math.PI * 2)
            };
            
            this.clouds.push(cloud);
            this.scene.add(cloud);
        }
    }

    // Создание одного облака
    createCloud() {
        const cloudGroup = new THREE.Group();
        
        // Создание нескольких сфер для формирования облака
        const sphereCount = this.utils.random(3, 8);
        
        for (let i = 0; i < sphereCount; i++) {
            const radius = this.utils.random(10, 20);
            const sphereGeometry = new THREE.SphereGeometry(radius, 8, 6);
            const sphereMaterial = new THREE.MeshLambertMaterial({
                color: 0xFFFFFF,
                transparent: true,
                opacity: 0.8
            });
            
            const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
            
            // Случайное смещение сфер
            sphere.position.set(
                this.utils.random(-15, 15),
                this.utils.random(-10, 10),
                this.utils.random(-15, 15)
            );
            
            cloudGroup.add(sphere);
        }
        
        return cloudGroup;
    }

    // Создание освещения
    createLighting() {
        // Основное направленное освещение (солнце)
        this.sun = new THREE.DirectionalLight(
            this.config.LIGHTING.SUN.COLOR,
            this.config.LIGHTING.SUN.INTENSITY
        );
        this.sun.position.set(100, 100, 100);
        this.sun.castShadow = true;
        
        // Настройка теней
        this.sun.shadow.mapSize.width = 2048;
        this.sun.shadow.mapSize.height = 2048;
        this.sun.shadow.camera.near = 0.5;
        this.sun.shadow.camera.far = 500;
        this.sun.shadow.camera.left = -200;
        this.sun.shadow.camera.right = 200;
        this.sun.shadow.camera.top = 200;
        this.sun.shadow.camera.bottom = -200;
        
        this.scene.add(this.sun);
        
        // Окружающее освещение
        this.ambient = new THREE.AmbientLight(
            this.config.LIGHTING.AMBIENT.COLOR,
            this.config.LIGHTING.AMBIENT.INTENSITY
        );
        this.scene.add(this.ambient);
        
        // Туман
        this.fog = new THREE.FogExp2(
            this.config.LIGHTING.FOG.COLOR,
            this.config.LIGHTING.FOG.DENSITY
        );
        this.scene.fog = this.fog;
    }

    // Создание птиц
    createBirds() {
        const birdConfig = this.config.ANIMATION.BIRDS;
        const birdCount = birdConfig.GROUPS * 8; // 8 птиц в группе
        
        for (let i = 0; i < birdCount; i++) {
            const bird = this.createBird();
            
            // Размещение птиц в группах
            const groupIndex = Math.floor(i / 8);
            const birdInGroup = i % 8;
            
            const groupAngle = (groupIndex / birdConfig.GROUPS) * Math.PI * 2;
            const groupDistance = birdConfig.RADIUS + this.utils.random(-20, 20);
            const groupHeight = this.utils.random(50, 150);
            
            bird.position.set(
                Math.cos(groupAngle) * groupDistance,
                groupHeight,
                Math.sin(groupAngle) * groupDistance
            );
            
            // Данные для анимации группы
            bird.userData = {
                groupIndex: groupIndex,
                birdInGroup: birdInGroup,
                groupCenter: {
                    x: Math.cos(groupAngle) * groupDistance,
                    y: groupHeight,
                    z: Math.sin(groupAngle) * groupDistance
                },
                groupRadius: this.utils.random(10, 20),
                groupSpeed: birdConfig.SPEED * this.utils.random(0.8, 1.2),
                phase: this.utils.random(0, Math.PI * 2)
            };
            
            this.birds.push(bird);
            this.scene.add(bird);
        }
    }

    // Создание одной птицы
    createBird() {
        const birdGroup = new THREE.Group();
        
        // Тело птицы
        const bodyGeometry = new THREE.CapsuleGeometry(0.5, 2, 4, 8);
        const bodyMaterial = new THREE.MeshLambertMaterial({
            color: 0x333333,
            roughness: 0.8,
            metalness: 0.1
        });
        
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.rotation.z = Math.PI / 2;
        birdGroup.add(body);
        
        // Крылья
        const wingGeometry = new THREE.PlaneGeometry(1.5, 0.8);
        const wingMaterial = new THREE.MeshLambertMaterial({
            color: 0x666666,
            roughness: 0.9,
            metalness: 0.0
        });
        
        const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
        leftWing.position.set(0, 0.5, 0);
        leftWing.rotation.z = Math.PI / 2;
        birdGroup.add(leftWing);
        
        const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
        rightWing.position.set(0, -0.5, 0);
        rightWing.rotation.z = -Math.PI / 2;
        birdGroup.add(rightWing);
        
        // Сохранение ссылок на крылья для анимации
        birdGroup.userData.wings = { left: leftWing, right: rightWing };
        
        return birdGroup;
    }

    // Установка времени суток
    setTimeOfDay() {
        const hour = new Date().getHours();
        let timeOfDay = 'day';
        
        if (hour >= 6 && hour < 9) {
            timeOfDay = 'dawn';
        } else if (hour >= 9 && hour < 17) {
            timeOfDay = 'day';
        } else if (hour >= 17 && hour < 20) {
            timeOfDay = 'sunset';
        } else {
            timeOfDay = 'night';
        }
        
        this.updateTimeOfDay(timeOfDay);
    }

    // Обновление времени суток
    updateTimeOfDay(timeOfDay) {
        this.currentTimeOfDay = timeOfDay;
        const timeConfig = this.config.TIME_OF_DAY[timeOfDay.toUpperCase()];
        
        if (timeConfig) {
            // Обновление цвета неба
            if (this.sky && this.sky.material.uniforms) {
                switch (timeOfDay) {
                    case 'dawn':
                        this.sky.material.uniforms.topColor.value.setHex(0xFF8C00);
                        this.sky.material.uniforms.bottomColor.value.setHex(0xFFD700);
                        break;
                    case 'day':
                        this.sky.material.uniforms.topColor.value.setHex(0x87CEEB);
                        this.sky.material.uniforms.bottomColor.value.setHex(0xFFFFFF);
                        break;
                    case 'sunset':
                        this.sky.material.uniforms.topColor.value.setHex(0xFF6B35);
                        this.sky.material.uniforms.bottomColor.value.setHex(0xFFD700);
                        break;
                    case 'night':
                        this.sky.material.uniforms.topColor.value.setHex(0x1a1a2e);
                        this.sky.material.uniforms.bottomColor.value.setHex(0x16213e);
                        break;
                }
            }
            
            // Обновление освещения
            if (this.sun) {
                this.sun.color.setHex(timeConfig.color);
                
                // Позиция солнца в зависимости от времени
                switch (timeOfDay) {
                    case 'dawn':
                        this.sun.position.set(50, 30, 50);
                        break;
                    case 'day':
                        this.sun.position.set(100, 100, 100);
                        break;
                    case 'sunset':
                        this.sun.position.set(-50, 30, -50);
                        break;
                    case 'night':
                        this.sun.position.set(-100, 50, -100);
                        this.sun.intensity = 0.1;
                        break;
                }
            }
            
            // Обновление тумана
            if (this.fog) {
                switch (timeOfDay) {
                    case 'dawn':
                        this.fog.color.setHex(0xFFD700);
                        break;
                    case 'day':
                        this.fog.color.setHex(0x87CEEB);
                        break;
                    case 'sunset':
                        this.fog.color.setHex(0xFF6B35);
                        break;
                    case 'night':
                        this.fog.color.setHex(0x1a1a2e);
                        break;
                }
            }
        }
    }

    // Создание звезд (для ночного времени)
    createStars() {
        const starCount = 1000;
        const starGeometry = new THREE.BufferGeometry();
        const starPositions = new Float32Array(starCount * 3);
        const starColors = new Float32Array(starCount * 3);
        
        for (let i = 0; i < starCount; i++) {
            const angle = this.utils.random(0, Math.PI * 2);
            const phi = this.utils.random(0, Math.PI);
            const radius = 900;
            
            starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(angle);
            starPositions[i * 3 + 1] = radius * Math.cos(phi);
            starPositions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(angle);
            
            // Разные цвета звезд
            const starType = Math.floor(this.utils.random(0, 3));
            switch (starType) {
                case 0: // Белые звезды
                    starColors[i * 3] = 1.0;
                    starColors[i * 3 + 1] = 1.0;
                    starColors[i * 3 + 2] = 1.0;
                    break;
                case 1: // Голубые звезды
                    starColors[i * 3] = 0.7;
                    starColors[i * 3 + 1] = 0.8;
                    starColors[i * 3 + 2] = 1.0;
                    break;
                case 2: // Желтые звезды
                    starColors[i * 3] = 1.0;
                    starColors[i * 3 + 1] = 1.0;
                    starColors[i * 3 + 2] = 0.7;
                    break;
            }
        }
        
        starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
        starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
        
        const starMaterial = new THREE.PointsMaterial({
            size: 2,
            vertexColors: true,
            transparent: true,
            opacity: 0.8
        });
        
        const stars = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(stars);
        
        return stars;
    }

    // Обновление атмосферы
    update(time) {
        // Анимация облаков
        this.updateCloudAnimation(time);
        
        // Анимация птиц
        this.updateBirdAnimation(time);
        
        // Плавное изменение времени суток
        this.updateTimeTransition(time);
    }

    // Обновление анимации облаков
    updateCloudAnimation(time) {
        this.clouds.forEach((cloud, index) => {
            const userData = cloud.userData;
            const speed = userData.speed;
            const direction = userData.direction;
            
            // Движение облаков
            cloud.position.x = userData.originalPosition.x + Math.cos(direction) * time * speed * 10;
            cloud.position.z = userData.originalPosition.z + Math.sin(direction) * time * speed * 10;
            
            // Возврат облаков на противоположную сторону при выходе за границы
            const distance = Math.sqrt(cloud.position.x * cloud.position.x + cloud.position.z * cloud.position.z);
            if (distance > 1000) {
                const oppositeAngle = direction + Math.PI;
                cloud.position.x = Math.cos(oppositeAngle) * 200;
                cloud.position.z = Math.sin(oppositeAngle) * 200;
                userData.originalPosition.copy(cloud.position);
            }
            
            // Легкое покачивание облаков
            cloud.rotation.y = Math.sin(time * 0.1 + index) * 0.1;
        });
    }

    // Обновление анимации птиц
    updateBirdAnimation(time) {
        this.birds.forEach((bird, index) => {
            const userData = bird.userData;
            const groupSpeed = userData.groupSpeed;
            const phase = userData.phase;
            
            // Круговое движение группы
            const groupAngle = time * groupSpeed + phase;
            const groupRadius = userData.groupRadius;
            
            bird.position.x = userData.groupCenter.x + Math.cos(groupAngle) * groupRadius;
            bird.position.z = userData.groupCenter.z + Math.sin(groupAngle) * groupRadius;
            bird.position.y = userData.groupCenter.y + Math.sin(time * 2 + phase) * 5;
            
            // Поворот птицы в направлении движения
            bird.rotation.y = groupAngle + Math.PI / 2;
            
            // Анимация крыльев
            if (bird.userData.wings) {
                const wingAngle = Math.sin(time * 10 + phase) * 0.5;
                bird.userData.wings.left.rotation.x = wingAngle;
                bird.userData.wings.right.rotation.x = -wingAngle;
            }
        });
    }

    // Плавное изменение времени суток
    updateTimeTransition(time) {
        // Автоматическое изменение времени каждые 30 секунд для демонстрации
        const timeChangeInterval = 30;
        const currentTime = Math.floor(time / timeChangeInterval) % 4;
        
        const timeOfDayMap = ['dawn', 'day', 'sunset', 'night'];
        const newTimeOfDay = timeOfDayMap[currentTime];
        
        if (newTimeOfDay !== this.currentTimeOfDay) {
            this.updateTimeOfDay(newTimeOfDay);
        }
    }

    // Получение данных атмосферы для других модулей
    getAtmosphereData() {
        return {
            sky: this.sky,
            clouds: this.clouds,
            sun: this.sun,
            ambient: this.ambient,
            fog: this.fog,
            birds: this.birds,
            currentTimeOfDay: this.currentTimeOfDay
        };
    }
}

// Глобальный класс атмосферы
window.IslandAtmosphere = IslandAtmosphere;
