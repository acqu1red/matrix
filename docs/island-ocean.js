// Модуль океана
class IslandOcean {
    constructor(scene, utils) {
        this.scene = scene;
        this.utils = utils;
        this.ocean = null;
        this.material = null;
        this.config = ISLAND_CONFIG;
        this.time = 0;
    }

    // Создание океана
    create() {
        const size = this.config.OCEAN.SIZE;
        
        // Создание геометрии океана
        const geometry = new THREE.PlaneGeometry(size, size, 128, 128);
        geometry.rotateX(-Math.PI / 2);

        // Создание материала океана
        this.material = this.createOceanMaterial();

        // Создание меша океана
        this.ocean = new THREE.Mesh(geometry, this.material);
        this.ocean.receiveShadow = true;
        this.ocean.position.y = -2; // Немного ниже уровня острова

        // Добавление в сцену
        this.scene.add(this.ocean);

        // Создание подводного мира
        this.createUnderwaterWorld();

        return this.ocean;
    }

    // Создание материала океана
    createOceanMaterial() {
        const vertexShader = `
            uniform float time;
            uniform float waveHeight;
            uniform float waveSpeed;
            uniform float waveFrequency;
            
            varying vec3 vPosition;
            varying vec3 vNormal;
            varying vec2 vUv;
            varying float vDepth;
            
            void main() {
                vUv = uv;
                vPosition = position;
                
                // Генерация волн
                float wave1 = sin(position.x * waveFrequency + time * waveSpeed) * 
                             cos(position.z * waveFrequency + time * waveSpeed * 0.7) * waveHeight;
                float wave2 = sin(position.x * waveFrequency * 2.0 + time * waveSpeed * 1.3) * 
                             cos(position.z * waveFrequency * 1.5 + time * waveSpeed * 0.9) * waveHeight * 0.5;
                float wave3 = sin(position.x * waveFrequency * 0.5 + time * waveSpeed * 0.3) * 
                             cos(position.z * waveFrequency * 0.7 + time * waveSpeed * 1.1) * waveHeight * 0.3;
                
                vec3 newPosition = position;
                newPosition.y += wave1 + wave2 + wave3;
                
                // Вычисление нормалей для волн
                vec3 tangent = vec3(1.0, 
                    waveFrequency * cos(position.x * waveFrequency + time * waveSpeed) * 
                    cos(position.z * waveFrequency + time * waveSpeed * 0.7) * waveHeight, 0.0);
                vec3 bitangent = vec3(0.0, 
                    waveFrequency * sin(position.x * waveFrequency + time * waveSpeed) * 
                    sin(position.z * waveFrequency + time * waveSpeed * 0.7) * waveHeight, 1.0);
                
                vNormal = normalize(cross(tangent, bitangent));
                vDepth = newPosition.y;
                
                gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
            }
        `;

        const fragmentShader = `
            uniform float time;
            uniform vec3 deepColor;
            uniform vec3 shallowColor;
            uniform vec3 surfaceColor;
            uniform float foamWidth;
            uniform float shallowDepth;
            uniform sampler2D normalMap1;
            uniform sampler2D normalMap2;
            uniform vec3 lightDirection;
            uniform vec3 cameraPosition;
            
            varying vec3 vPosition;
            varying vec3 vNormal;
            varying vec2 vUv;
            varying float vDepth;
            
            vec3 fresnelSchlick(float cosTheta, vec3 F0) {
                return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
            }
            
            void main() {
                // Нормал-карты для детализации волн
                vec2 uv1 = vUv * 4.0 + vec2(time * 0.05, time * 0.03);
                vec2 uv2 = vUv * 8.0 + vec2(time * -0.03, time * 0.07);
                
                vec3 normal1 = texture2D(normalMap1, uv1).rgb * 2.0 - 1.0;
                vec3 normal2 = texture2D(normalMap2, uv2).rgb * 2.0 - 1.0;
                
                vec3 normal = normalize(vNormal + normal1 * 0.5 + normal2 * 0.3);
                
                // Цвет воды в зависимости от глубины
                float depth = abs(vDepth);
                vec3 waterColor;
                
                if (depth < shallowDepth) {
                    float t = depth / shallowDepth;
                    waterColor = mix(shallowColor, surfaceColor, t);
                } else {
                    float t = (depth - shallowDepth) / 10.0;
                    t = clamp(t, 0.0, 1.0);
                    waterColor = mix(surfaceColor, deepColor, t);
                }
                
                // Френель эффект
                vec3 viewDirection = normalize(cameraPosition - vPosition);
                float fresnel = fresnelSchlick(max(dot(viewDirection, normal), 0.0), vec3(0.02)).r;
                
                // Освещение
                float diffuse = max(0.0, dot(normal, lightDirection));
                float specular = pow(max(0.0, dot(reflect(-lightDirection, normal), viewDirection)), 32.0);
                
                // Береговая пена
                float distanceFromShore = length(vPosition.xz);
                float shoreDistance = 500.0; // Радиус острова
                float foamFactor = 1.0 - clamp(distanceFromShore / shoreDistance, 0.0, 1.0);
                foamFactor = pow(foamFactor, 2.0) * 0.8;
                
                // Финальный цвет
                vec3 finalColor = waterColor * (0.3 + 0.7 * diffuse) + 
                                 vec3(1.0) * specular * 0.5 +
                                 vec3(1.0) * fresnel * 0.3 +
                                 vec3(1.0) * foamFactor;
                
                gl_FragColor = vec4(finalColor, 0.8);
            }
        `;

        return new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                waveHeight: { value: this.config.OCEAN.WAVE_HEIGHT },
                waveSpeed: { value: this.config.OCEAN.WAVE_SPEED },
                waveFrequency: { value: 0.02 },
                deepColor: { value: new THREE.Color(this.config.COLORS.OCEAN.DEEP) },
                shallowColor: { value: new THREE.Color(this.config.COLORS.OCEAN.SHALLOW) },
                surfaceColor: { value: new THREE.Color(this.config.COLORS.OCEAN.SURFACE) },
                foamWidth: { value: this.config.OCEAN.FOAM_WIDTH },
                shallowDepth: { value: this.config.OCEAN.SHALLOW_DEPTH },
                normalMap1: { value: this.createNormalMap1() },
                normalMap2: { value: this.createNormalMap2() },
                lightDirection: { value: new THREE.Vector3(1, 1, 1).normalize() },
                cameraPosition: { value: new THREE.Vector3() }
            },
            vertexShader,
            fragmentShader,
            transparent: true,
            side: THREE.DoubleSide
        });
    }

    // Создание нормал-карт для волн
    createNormalMap1() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        // Создание шума для нормал-карты
        for (let x = 0; x < 256; x++) {
            for (let y = 0; y < 256; y++) {
                const noise = this.utils.noise(x * 0.02, y * 0.02) * 0.5 + 0.5;
                const r = Math.floor(noise * 255);
                const g = Math.floor(noise * 255);
                const b = 255;
                
                ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                ctx.fillRect(x, y, 1, 1);
            }
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }

    createNormalMap2() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        // Создание более мелкого шума
        for (let x = 0; x < 256; x++) {
            for (let y = 0; y < 256; y++) {
                const noise = this.utils.noise(x * 0.05, y * 0.05) * 0.5 + 0.5;
                const r = Math.floor(noise * 255);
                const g = Math.floor(noise * 255);
                const b = 255;
                
                ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                ctx.fillRect(x, y, 1, 1);
            }
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }

    // Создание подводного мира
    createUnderwaterWorld() {
        const underwaterGroup = new THREE.Group();

        // Коралловые рифы
        this.createCoralReefs(underwaterGroup);

        // Стаи рыб
        this.createFishSchools(underwaterGroup);

        this.scene.add(underwaterGroup);
        return underwaterGroup;
    }

    // Создание коралловых рифов
    createCoralReefs(group) {
        const reefCount = 15;
        const reefRadius = 100;

        for (let i = 0; i < reefCount; i++) {
            const angle = (i / reefCount) * Math.PI * 2;
            const distance = reefRadius + this.utils.random(0, 50);
            
            const x = Math.cos(angle) * distance;
            const z = Math.sin(angle) * distance;
            const y = -5 - this.utils.random(0, 10);

            const coralGeometry = new THREE.ConeGeometry(
                this.utils.random(2, 5),
                this.utils.random(8, 15),
                6
            );
            
            const coralMaterial = new THREE.MeshLambertMaterial({
                color: new THREE.Color().setHSL(
                    this.utils.random(0.0, 0.1), // Красные оттенки
                    0.8,
                    0.6
                ),
                roughness: 0.9,
                metalness: 0.0
            });

            const coral = new THREE.Mesh(coralGeometry, coralMaterial);
            coral.position.set(x, y, z);
            coral.rotation.set(
                this.utils.random(-0.3, 0.3),
                this.utils.random(0, Math.PI * 2),
                this.utils.random(-0.3, 0.3)
            );

            group.add(coral);
        }
    }

    // Создание стай рыб
    createFishSchools(group) {
        const schoolCount = 10;
        const fishPerSchool = 8;

        for (let i = 0; i < schoolCount; i++) {
            const school = new THREE.Group();
            
            // Центр стаи
            const centerX = this.utils.random(-200, 200);
            const centerZ = this.utils.random(-200, 200);
            const centerY = -10 - this.utils.random(0, 20);

            for (let j = 0; j < fishPerSchool; j++) {
                const fishGeometry = new THREE.ConeGeometry(0.5, 2, 4);
                const fishMaterial = new THREE.MeshLambertMaterial({
                    color: new THREE.Color().setHSL(
                        this.utils.random(0.5, 0.7), // Синие оттенки
                        0.8,
                        0.6
                    ),
                    roughness: 0.8,
                    metalness: 0.2
                });

                const fish = new THREE.Mesh(fishGeometry, fishMaterial);
                
                // Позиция рыбы в стае
                const offsetX = this.utils.random(-5, 5);
                const offsetY = this.utils.random(-2, 2);
                const offsetZ = this.utils.random(-5, 5);
                
                fish.position.set(
                    centerX + offsetX,
                    centerY + offsetY,
                    centerZ + offsetZ
                );
                
                fish.rotation.set(
                    this.utils.random(-0.2, 0.2),
                    this.utils.random(0, Math.PI * 2),
                    this.utils.random(-0.2, 0.2)
                );

                school.add(fish);
            }

            // Анимация стаи
            school.userData = {
                center: { x: centerX, y: centerY, z: centerZ },
                radius: this.utils.random(20, 40),
                speed: this.utils.random(0.5, 1.5),
                phase: this.utils.random(0, Math.PI * 2)
            };

            group.add(school);
        }
    }

    // Создание лодок
    createBoats() {
        const boats = new THREE.Group();
        const boatCount = this.config.ARCHITECTURE.PIER.BOATS;

        for (let i = 0; i < boatCount; i++) {
            const boat = this.createBoat();
            boat.position.set(
                this.utils.random(-10, 10),
                0,
                -200 + i * 15
            );
            boat.userData = {
                originalY: 0,
                driftSpeed: this.utils.random(0.5, 1.5),
                rockAmplitude: this.utils.random(0.1, 0.3),
                phase: this.utils.random(0, Math.PI * 2)
            };
            boats.add(boat);
        }

        this.scene.add(boats);
        return boats;
    }

    // Создание одной лодки
    createBoat() {
        const boatGroup = new THREE.Group();

        // Корпус лодки
        const hullGeometry = new THREE.CapsuleGeometry(2, 8, 4, 8);
        const hullMaterial = new THREE.MeshLambertMaterial({
            color: 0x8B4513, // Коричневый
            roughness: 0.8,
            metalness: 0.1
        });
        const hull = new THREE.Mesh(hullGeometry, hullMaterial);
        hull.rotation.z = Math.PI / 2;
        boatGroup.add(hull);

        // Мачта
        const mastGeometry = new THREE.CylinderGeometry(0.2, 0.2, 6);
        const mastMaterial = new THREE.MeshLambertMaterial({
            color: 0x654321,
            roughness: 0.9,
            metalness: 0.0
        });
        const mast = new THREE.Mesh(mastGeometry, mastMaterial);
        mast.position.y = 3;
        boatGroup.add(mast);

        // Парус
        const sailGeometry = new THREE.PlaneGeometry(4, 5);
        const sailMaterial = new THREE.MeshLambertMaterial({
            color: 0xFFFFFF,
            roughness: 0.9,
            metalness: 0.0
        });
        const sail = new THREE.Mesh(sailGeometry, sailMaterial);
        sail.position.set(0, 2, 0);
        sail.rotation.y = Math.PI / 2;
        boatGroup.add(sail);

        return boatGroup;
    }

    // Обновление океана
    update(time, camera) {
        this.time = time;
        
        if (this.material && this.material.uniforms && 
            this.material.uniforms.time && this.material.uniforms.cameraPosition) {
            this.material.uniforms.time.value = time;
            this.material.uniforms.cameraPosition.value.copy(camera.position);
        }

        // Обновление анимации рыб
        this.updateFishAnimation(time);
    }

    // Обновление анимации рыб
    updateFishAnimation(time) {
        this.scene.traverse((object) => {
            if (object.userData && object.userData.center) {
                const school = object;
                const center = school.userData.center;
                const radius = school.userData.radius;
                const speed = school.userData.speed;
                const phase = school.userData.phase;

                // Круговое движение стаи
                const angle = time * speed * 0.1 + phase;
                school.position.x = center.x + Math.cos(angle) * radius;
                school.position.z = center.z + Math.sin(angle) * radius;

                // Поворот стаи в направлении движения
                school.rotation.y = angle + Math.PI / 2;

                // Анимация отдельных рыб
                school.children.forEach((fish, index) => {
                    const fishTime = time + index * 0.5;
                    const fishAngle = fishTime * 2 + index;
                    
                    // Покачивание рыб
                    fish.rotation.z = Math.sin(fishTime * 3) * 0.1;
                    
                    // Легкое движение вверх-вниз
                    fish.position.y = center.y + Math.sin(fishTime * 2) * 0.5;
                });
            }
        });
    }

    // Получение высоты волны в точке
    getWaveHeight(x, z, time) {
        const waveHeight = this.config.OCEAN.WAVE_HEIGHT;
        const waveSpeed = this.config.OCEAN.WAVE_SPEED;
        const waveFrequency = 0.02;

        const wave1 = Math.sin(x * waveFrequency + time * waveSpeed) * 
                     Math.cos(z * waveFrequency + time * waveSpeed * 0.7) * waveHeight;
        const wave2 = Math.sin(x * waveFrequency * 2.0 + time * waveSpeed * 1.3) * 
                     Math.cos(z * waveFrequency * 1.5 + time * waveSpeed * 0.9) * waveHeight * 0.5;
        const wave3 = Math.sin(x * waveFrequency * 0.5 + time * waveSpeed * 0.3) * 
                     Math.cos(z * waveFrequency * 0.7 + time * waveSpeed * 1.1) * waveHeight * 0.3;

        return wave1 + wave2 + wave3;
    }

    // Получение данных океана для других модулей
    getOceanData() {
        return {
            ocean: this.ocean,
            material: this.material,
            getWaveHeight: (x, z, time) => this.getWaveHeight(x, z, time),
            createBoats: () => this.createBoats()
        };
    }
}

// Глобальный класс океана
window.IslandOcean = IslandOcean;
