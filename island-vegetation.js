// Модуль растительности острова
class IslandVegetation {
    constructor(scene, utils, terrainData) {
        this.scene = scene;
        this.utils = utils;
        this.terrainData = terrainData;
        this.config = ISLAND_CONFIG;
        this.vegetation = new THREE.Group();
        this.palmInstances = null;
        this.bananaInstances = null;
        this.fernInstances = null;
        this.grassInstances = null;
    }

    // Создание всей растительности
    create() {
        // Создание пальм
        this.createPalmTrees();
        
        // Создание банановых деревьев
        this.createBananaTrees();
        
        // Создание папоротников
        this.createFerns();
        
        // Создание травы
        this.createGrass();
        
        // Создание цветов
        this.createFlowers();
        
        this.scene.add(this.vegetation);
        return this.vegetation;
    }

    // Создание пальм
    createPalmTrees() {
        const palmCount = this.config.VEGETATION.PALM_TREES.COUNT;
        const beachRatio = this.config.VEGETATION.PALM_TREES.BEACH_RATIO;
        const inlandRatio = this.config.VEGETATION.PALM_TREES.INLAND_RATIO;

        // Создание геометрии пальмы
        const palmGeometry = this.utils.createPalmTreeGeometry();
        
        // Материал пальмы
        const palmMaterial = new THREE.MeshLambertMaterial({
            color: this.config.COLORS.TROPICAL.SECONDARY,
            roughness: 0.9,
            metalness: 0.0
        });

        // Создание инстансированного меша для пальм
        this.palmInstances = this.utils.createInstancedMesh(palmGeometry, palmMaterial, palmCount);

        let palmIndex = 0;

        // Размещение пальм на пляже
        const beachPalmCount = Math.floor(palmCount * beachRatio);
        for (let i = 0; i < beachPalmCount; i++) {
            const angle = (i / beachPalmCount) * Math.PI * 2;
            const distance = this.config.SCALE.ISLAND_SIZE * 0.85 + this.utils.random(0, 20);
            
            const x = Math.cos(angle) * distance;
            const z = Math.sin(angle) * distance;
            const y = this.terrainData && typeof this.terrainData.getHeightAt === 'function'
                ? this.terrainData.getHeightAt(x, z)
                : 0;

            const position = new THREE.Vector3(x, y, z);
            const rotation = new THREE.Quaternion().setFromAxisAngle(
                new THREE.Vector3(0, 1, 0),
                this.utils.random(0, Math.PI * 2)
            );
            const scale = new THREE.Vector3(
                this.utils.random(0.8, 1.2),
                this.utils.random(0.8, 1.2),
                this.utils.random(0.8, 1.2)
            );

            this.palmInstances.setTransform(palmIndex, position, rotation, scale);
            palmIndex++;
        }

        // Размещение пальм внутри острова
        const inlandPalmCount = palmCount - beachPalmCount;
        for (let i = 0; i < inlandPalmCount; i++) {
            let attempts = 0;
            let x, z, y;
            
            do {
                x = this.utils.random(-this.config.SCALE.ISLAND_SIZE * 0.4, this.config.SCALE.ISLAND_SIZE * 0.4);
                z = this.utils.random(-this.config.SCALE.ISLAND_SIZE * 0.4, this.config.SCALE.ISLAND_SIZE * 0.4);
                y = this.terrainData && typeof this.terrainData.getHeightAt === 'function'
                    ? this.terrainData.getHeightAt(x, z)
                    : 0;
                attempts++;
            } while (this.terrainData && typeof this.terrainData.getBiomeAt === 'function' && 
                     this.terrainData.getBiomeAt(x, z) !== 'forest' && attempts < 100);

            if (attempts < 100) {
                const position = new THREE.Vector3(x, y, z);
                const rotation = new THREE.Quaternion().setFromAxisAngle(
                    new THREE.Vector3(0, 1, 0),
                    this.utils.random(0, Math.PI * 2)
                );
                const scale = new THREE.Vector3(
                    this.utils.random(0.8, 1.2),
                    this.utils.random(0.8, 1.2),
                    this.utils.random(0.8, 1.2)
                );

                this.palmInstances.setTransform(palmIndex, position, rotation, scale);
                palmIndex++;
            }
        }

        this.palmInstances.update();
        this.vegetation.add(this.palmInstances.mesh);
    }

    // Создание банановых деревьев
    createBananaTrees() {
        const bananaCount = this.config.VEGETATION.BANANA_TREES.COUNT;
        
        // Геометрия бананового дерева
        const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.5, 6, 8);
        const leafGeometry = new THREE.PlaneGeometry(3, 2);
        
        // Материалы
        const trunkMaterial = new THREE.MeshLambertMaterial({
            color: 0x8B4513,
            roughness: 0.9,
            metalness: 0.0
        });
        
        const leafMaterial = new THREE.MeshLambertMaterial({
            color: this.config.COLORS.TROPICAL.ACCENT,
            roughness: 0.8,
            metalness: 0.0
        });

        for (let i = 0; i < bananaCount; i++) {
            const bananaTree = new THREE.Group();
            
            // Ствол
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            trunk.position.y = 3;
            bananaTree.add(trunk);
            
            // Листья
            const leafCount = 6;
            for (let j = 0; j < leafCount; j++) {
                const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
                const angle = (j / leafCount) * Math.PI * 2;
                const distance = 1.5;
                
                leaf.position.set(
                    Math.cos(angle) * distance,
                    4 + this.utils.random(-0.5, 0.5),
                    Math.sin(angle) * distance
                );
                leaf.rotation.set(
                    this.utils.random(-0.3, 0.3),
                    angle,
                    this.utils.random(-0.3, 0.3)
                );
                
                bananaTree.add(leaf);
            }
            
            // Размещение дерева
            let attempts = 0;
            let x, z, y;
            
            do {
                x = this.utils.random(-this.config.SCALE.ISLAND_SIZE * 0.3, this.config.SCALE.ISLAND_SIZE * 0.3);
                z = this.utils.random(-this.config.SCALE.ISLAND_SIZE * 0.3, this.config.SCALE.ISLAND_SIZE * 0.3);
                y = this.terrainData && typeof this.terrainData.getHeightAt === 'function'
                    ? this.terrainData.getHeightAt(x, z)
                    : 0;
                attempts++;
            } while (this.terrainData && typeof this.terrainData.getBiomeAt === 'function' && 
                     this.terrainData.getBiomeAt(x, z) !== 'tropical' && attempts < 50);
            
            if (attempts < 50) {
                bananaTree.position.set(x, y, z);
                bananaTree.rotation.y = this.utils.random(0, Math.PI * 2);
                bananaTree.scale.setScalar(this.utils.random(0.8, 1.2));
                
                bananaTree.castShadow = true;
                this.vegetation.add(bananaTree);
            }
        }
    }

    // Создание папоротников
    createFerns() {
        const fernCount = this.config.VEGETATION.FERNS.COUNT;
        
        // Геометрия папоротника
        const fernGeometry = new THREE.PlaneGeometry(1, 2);
        const fernMaterial = new THREE.MeshLambertMaterial({
            color: this.config.COLORS.TROPICAL.PRIMARY,
            roughness: 0.8,
            metalness: 0.0
        });

        // Создание инстансированного меша для папоротников
        this.fernInstances = this.utils.createInstancedMesh(fernGeometry, fernMaterial, fernCount);

        for (let i = 0; i < fernCount; i++) {
            let attempts = 0;
            let x, z, y;
            
            do {
                x = this.utils.random(-this.config.SCALE.ISLAND_SIZE * 0.4, this.config.SCALE.ISLAND_SIZE * 0.4);
                z = this.utils.random(-this.config.SCALE.ISLAND_SIZE * 0.4, this.config.SCALE.ISLAND_SIZE * 0.4);
                y = this.terrainData && typeof this.terrainData.getHeightAt === 'function'
                    ? this.terrainData.getHeightAt(x, z)
                    : 0;
                attempts++;
            } while (this.terrainData && typeof this.terrainData.getBiomeAt === 'function' && 
                     this.terrainData.getBiomeAt(x, z) !== 'forest' && attempts < 50);
            
            if (attempts < 50) {
                const position = new THREE.Vector3(x, y, z);
                const rotation = new THREE.Quaternion().setFromAxisAngle(
                    new THREE.Vector3(0, 1, 0),
                    this.utils.random(0, Math.PI * 2)
                );
                const scale = new THREE.Vector3(
                    this.utils.random(0.5, 1.0),
                    this.utils.random(0.8, 1.5),
                    this.utils.random(0.5, 1.0)
                );

                this.fernInstances.setTransform(i, position, rotation, scale);
            }
        }

        this.fernInstances.update();
        this.vegetation.add(this.fernInstances.mesh);
    }

    // Создание травы
    createGrass() {
        const grassCount = 1000;
        
        // Геометрия травинки
        const grassGeometry = new THREE.PlaneGeometry(0.1, 0.5);
        const grassMaterial = new THREE.MeshLambertMaterial({
            color: this.config.COLORS.TROPICAL.ACCENT,
            roughness: 0.9,
            metalness: 0.0
        });

        // Создание инстансированного меша для травы
        this.grassInstances = this.utils.createInstancedMesh(grassGeometry, grassMaterial, grassCount);

        for (let i = 0; i < grassCount; i++) {
            const x = this.utils.random(-this.config.SCALE.ISLAND_SIZE * 0.4, this.config.SCALE.ISLAND_SIZE * 0.4);
            const z = this.utils.random(-this.config.SCALE.ISLAND_SIZE * 0.4, this.config.SCALE.ISLAND_SIZE * 0.4);
            const y = this.terrainData && typeof this.terrainData.getHeightAt === 'function'
                ? this.terrainData.getHeightAt(x, z)
                : 0;

            const biome = this.terrainData && typeof this.terrainData.getBiomeAt === 'function'
                ? this.terrainData.getBiomeAt(x, z)
                : 'plains';
            if (biome === 'plains' || biome === 'forest') {
                const position = new THREE.Vector3(x, y, z);
                const rotation = new THREE.Quaternion().setFromAxisAngle(
                    new THREE.Vector3(0, 1, 0),
                    this.utils.random(0, Math.PI * 2)
                );
                const scale = new THREE.Vector3(
                    this.utils.random(0.5, 1.5),
                    this.utils.random(0.8, 1.2),
                    this.utils.random(0.5, 1.5)
                );

                this.grassInstances.setTransform(i, position, rotation, scale);
            }
        }

        this.grassInstances.update();
        this.vegetation.add(this.grassInstances.mesh);
    }

    // Создание цветов
    createFlowers() {
        const flowerCount = 200;
        
        // Геометрия цветка
        const flowerGeometry = new THREE.SphereGeometry(0.2, 8, 6);
        
        // Разные цвета цветов
        const flowerColors = [
            new THREE.Color(0xFF69B4), // Розовый
            new THREE.Color(0xFFD700), // Золотой
            new THREE.Color(0xFF6347), // Томатный
            new THREE.Color(0x9370DB), // Фиолетовый
            new THREE.Color(0x00CED1)  // Бирюзовый
        ];

        for (let i = 0; i < flowerCount; i++) {
            const x = this.utils.random(-this.config.SCALE.ISLAND_SIZE * 0.4, this.config.SCALE.ISLAND_SIZE * 0.4);
            const z = this.utils.random(-this.config.SCALE.ISLAND_SIZE * 0.4, this.config.SCALE.ISLAND_SIZE * 0.4);
            const y = this.terrainData && typeof this.terrainData.getHeightAt === 'function'
                ? this.terrainData.getHeightAt(x, z)
                : 0;

            const biome = this.terrainData && typeof this.terrainData.getBiomeAt === 'function'
                ? this.terrainData.getBiomeAt(x, z)
                : 'plains';
            if (biome === 'plains' || biome === 'forest') {
                const flowerMaterial = new THREE.MeshLambertMaterial({
                    color: flowerColors[Math.floor(this.utils.random(0, flowerColors.length))],
                    roughness: 0.8,
                    metalness: 0.0
                });

                const flower = new THREE.Mesh(flowerGeometry, flowerMaterial);
                flower.position.set(x, y + 0.2, z);
                flower.scale.setScalar(this.utils.random(0.5, 1.5));

                flower.castShadow = true;
                this.vegetation.add(flower);
            }
        }
    }

    // Создание системы частиц для пыльцы
    createPollenSystem() {
        const particleCount = 100;
        const particleGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            const x = this.utils.random(-this.config.SCALE.ISLAND_SIZE * 0.3, this.config.SCALE.ISLAND_SIZE * 0.3);
            const y = this.utils.random(5, 20);
            const z = this.utils.random(-this.config.SCALE.ISLAND_SIZE * 0.3, this.config.SCALE.ISLAND_SIZE * 0.3);

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;

            colors[i * 3] = 1.0;     // R
            colors[i * 3 + 1] = 1.0; // G
            colors[i * 3 + 2] = 0.8; // B
        }

        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const particleMaterial = new THREE.PointsMaterial({
            size: 0.5,
            vertexColors: true,
            transparent: true,
            opacity: 0.6
        });

        const particles = new THREE.Points(particleGeometry, particleMaterial);
        particles.userData = {
            originalPositions: positions.slice(),
            speeds: Array.from({ length: particleCount }, () => this.utils.random(0.1, 0.3))
        };

        this.vegetation.add(particles);
        return particles;
    }

    // Обновление растительности
    update(time) {
        // Анимация пальм от ветра
        if (this.palmInstances) {
            this.animatePalmTrees(time);
        }

        // Анимация травы от ветра
        if (this.grassInstances) {
            this.animateGrass(time);
        }

        // Анимация пыльцы
        this.animatePollen(time);
    }

    // Анимация пальм от ветра
    animatePalmTrees(time) {
        const windStrength = this.config.VEGETATION.PALM_TREES.WIND_STRENGTH;
        
        this.palmInstances.mesh.children.forEach((palm, index) => {
            const windOffset = Math.sin(time * 0.5 + index * 0.1) * windStrength * 0.1;
            palm.rotation.z = windOffset;
        });
    }

    // Анимация травы от ветра
    animateGrass(time) {
        const windStrength = this.config.VEGETATION.PALM_TREES.WIND_STRENGTH;
        
        this.grassInstances.mesh.children.forEach((grass, index) => {
            const windOffset = Math.sin(time * 1.0 + index * 0.05) * windStrength * 0.2;
            grass.rotation.z = windOffset;
        });
    }

    // Анимация пыльцы
    animatePollen(time) {
        this.vegetation.traverse((object) => {
            if (object instanceof THREE.Points && object.userData.originalPositions) {
                const positions = object.geometry.attributes.position.array;
                const originalPositions = object.userData.originalPositions;
                const speeds = object.userData.speeds;

                for (let i = 0; i < positions.length; i += 3) {
                    const index = i / 3;
                    const speed = speeds[index];
                    
                    // Движение вверх
                    positions[i + 1] = originalPositions[i + 1] + Math.sin(time * speed) * 2;
                    
                    // Легкое движение по горизонтали
                    positions[i] = originalPositions[i] + Math.sin(time * speed * 0.5) * 1;
                    positions[i + 2] = originalPositions[i + 2] + Math.cos(time * speed * 0.5) * 1;
                }

                object.geometry.attributes.position.needsUpdate = true;
            }
        });
    }

    // Получение данных растительности для других модулей
    getVegetationData() {
        return {
            vegetation: this.vegetation,
            palmInstances: this.palmInstances,
            bananaInstances: this.bananaInstances,
            fernInstances: this.fernInstances,
            grassInstances: this.grassInstances
        };
    }
}

// Глобальный класс растительности
window.IslandVegetation = IslandVegetation;
