// Модуль террейна острова
class IslandTerrain {
    constructor(scene, utils) {
        this.scene = scene;
        this.utils = utils;
        this.terrain = null;
        this.material = null;
        this.config = ISLAND_CONFIG;
    }

    // Создание террейна
    create() {
        const resolution = this.config.SCALE.TERRAIN_RESOLUTION;
        const size = this.config.SCALE.ISLAND_SIZE;
        const segmentSize = size / resolution;

        // Создание геометрии террейна
        const geometry = new THREE.PlaneGeometry(size, size, resolution - 1, resolution - 1);
        geometry.rotateX(-Math.PI / 2);

        // Генерация высот
        const positions = geometry.attributes.position.array;
        const heights = [];

        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const z = positions[i + 2];
            
            const height = this.utils.generateTerrainHeight(x, z, this.config);
            heights.push(height);
            
            positions[i + 1] = height;
        }

        // Пересчет нормалей
        geometry.computeVertexNormals();

        // Создание материала
        this.material = this.utils.createTerrainMaterial(this.config);

        // Создание меша
        this.terrain = new THREE.Mesh(geometry, this.material);
        this.terrain.receiveShadow = true;
        this.terrain.castShadow = true;

        // Добавление в сцену
        this.scene.add(this.terrain);

        // Создание LOD системы
        this.createLODSystem();

        return this.terrain;
    }

    // Создание LOD системы для террейна
    createLODSystem() {
        const lodLevels = this.config.PERFORMANCE.DESKTOP.LOD_LEVELS;
        const lodObjects = [];

        // Создание разных уровней детализации
        for (let i = 0; i < lodLevels; i++) {
            const resolution = Math.max(32, this.config.SCALE.TERRAIN_RESOLUTION / Math.pow(2, i));
            const size = this.config.SCALE.ISLAND_SIZE;
            const segmentSize = size / resolution;

            const geometry = new THREE.PlaneGeometry(size, size, resolution - 1, resolution - 1);
            geometry.rotateX(-Math.PI / 2);

            // Генерация высот для этого уровня
            const positions = geometry.attributes.position.array;
            for (let j = 0; j < positions.length; j += 3) {
                const x = positions[j];
                const z = positions[j + 2];
                const height = this.utils.generateTerrainHeight(x, z, this.config);
                positions[j + 1] = height;
            }

            geometry.computeVertexNormals();

            const material = this.utils.createTerrainMaterial(this.config);
            const mesh = new THREE.Mesh(geometry, material);
            mesh.receiveShadow = true;
            mesh.castShadow = true;

            lodObjects.push(mesh);
        }

        // Создание LOD системы
        const distances = [0, 300, 800];
        this.lodSystem = this.utils.createLODSystem(lodObjects, distances);
        this.scene.add(this.lodSystem);
    }

    // Получение высоты в точке
    getHeightAt(x, z) {
        return this.utils.generateTerrainHeight(x, z, this.config);
    }

    // Получение биома в точке
    getBiomeAt(x, z) {
        const height = this.getHeightAt(x, z);
        return this.utils.getBiome(x, z, height, this.config);
    }

    // Создание дорожной сети
    createRoadNetwork() {
        const roadGeometry = new THREE.BufferGeometry();
        const roadVertices = [];
        const roadIndices = [];
        const roadUvs = [];

        // Главная дорога от замка к пирсу
        this.createRoad(roadVertices, roadIndices, roadUvs, 
            { x: 0, y: 0, z: 0 }, 
            { x: 0, y: 0, z: -200 }, 
            8, 0.1);

        // Дороги к виллам
        const villaPositions = this.generateVillaPositions();
        villaPositions.forEach(villa => {
            this.createRoad(roadVertices, roadIndices, roadUvs,
                { x: 0, y: 0, z: 0 },
                villa,
                6, 0.05);
        });

        // Дорога к вертолетной площадке
        this.createRoad(roadVertices, roadIndices, roadUvs,
            { x: 0, y: 0, z: 0 },
            { x: 150, y: 0, z: 0 },
            6, 0.05);

        roadGeometry.setAttribute('position', new THREE.Float32BufferAttribute(roadVertices, 3));
        roadGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(roadUvs, 2));
        roadGeometry.setIndex(roadIndices);
        roadGeometry.computeVertexNormals();

        // Материал дороги
        const roadMaterial = new THREE.MeshLambertMaterial({
            color: 0x333333,
            roughness: 0.8,
            metalness: 0.1
        });

        const roadMesh = new THREE.Mesh(roadGeometry, roadMaterial);
        roadMesh.receiveShadow = true;
        this.scene.add(roadMesh);

        return roadMesh;
    }

    // Создание дороги между двумя точками
    createRoad(vertices, indices, uvs, start, end, width, height) {
        const direction = new THREE.Vector3(end.x - start.x, end.y - start.y, end.z - start.z);
        const length = direction.length();
        direction.normalize();

        const perpendicular = new THREE.Vector3(-direction.z, 0, direction.x);
        perpendicular.multiplyScalar(width / 2);

        // Получение высот в точках
        const startHeight = this.getHeightAt(start.x, start.z);
        const endHeight = this.getHeightAt(end.x, end.z);

        // Создание вершин дороги
        const segments = Math.ceil(length / 10);
        const baseIndex = vertices.length / 3;

        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const x = start.x + (end.x - start.x) * t;
            const z = start.z + (end.z - start.z) * t;
            const y = startHeight + (endHeight - startHeight) * t + height;

            // Левая сторона дороги
            const leftX = x + perpendicular.x;
            const leftZ = z + perpendicular.z;
            const leftY = this.getHeightAt(leftX, leftZ) + height;

            // Правая сторона дороги
            const rightX = x - perpendicular.x;
            const rightZ = z - perpendicular.z;
            const rightY = this.getHeightAt(rightX, rightZ) + height;

            vertices.push(leftX, leftY, leftZ);
            vertices.push(rightX, rightY, rightZ);

            uvs.push(t, 0);
            uvs.push(t, 1);

            // Создание индексов для соединения сегментов
            if (i > 0) {
                const currentBase = baseIndex + i * 2;
                const prevBase = baseIndex + (i - 1) * 2;

                indices.push(prevBase, currentBase, prevBase + 1);
                indices.push(currentBase, currentBase + 1, prevBase + 1);
            }
        }
    }

    // Генерация позиций вилл
    generateVillaPositions() {
        const positions = [];
        const count = this.config.ARCHITECTURE.VILLAS.COUNT;
        const spacing = this.config.ARCHITECTURE.VILLAS.SPACING;

        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const distance = spacing + this.utils.random(0, spacing * 0.5);
            
            const x = Math.cos(angle) * distance;
            const z = Math.sin(angle) * distance;
            const y = this.getHeightAt(x, z);

            positions.push({ x, y, z });
        }

        return positions;
    }

    // Создание пляжа
    createBeach() {
        const beachGeometry = new THREE.RingGeometry(
            this.config.SCALE.ISLAND_SIZE * 0.85,
            this.config.SCALE.ISLAND_SIZE * 0.95,
            64
        );
        beachGeometry.rotateX(-Math.PI / 2);

        // Создание волнообразной формы пляжа
        const positions = beachGeometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const z = positions[i + 2];
            
            // Добавление волн на пляже
            const wave = Math.sin(x * 0.01) * Math.cos(z * 0.01) * 2;
            positions[i + 1] = wave;
        }

        beachGeometry.computeVertexNormals();

        // Материал пляжа
        const beachMaterial = new THREE.MeshLambertMaterial({
            color: this.config.COLORS.SAND.PRIMARY,
            roughness: 0.9,
            metalness: 0.0
        });

        const beachMesh = new THREE.Mesh(beachGeometry, beachMaterial);
        beachMesh.receiveShadow = true;
        this.scene.add(beachMesh);

        return beachMesh;
    }

    // Создание камней и деталей
    createTerrainDetails() {
        const details = new THREE.Group();

        // Создание камней
        for (let i = 0; i < 50; i++) {
            const x = this.utils.random(-this.config.SCALE.ISLAND_SIZE * 0.4, this.config.SCALE.ISLAND_SIZE * 0.4);
            const z = this.utils.random(-this.config.SCALE.ISLAND_SIZE * 0.4, this.config.SCALE.ISLAND_SIZE * 0.4);
            const y = this.getHeightAt(x, z);

            const rockGeometry = new THREE.DodecahedronGeometry(this.utils.random(0.5, 2));
            const rockMaterial = new THREE.MeshLambertMaterial({
                color: this.config.COLORS.MOUNTAINS.SECONDARY,
                roughness: 0.8,
                metalness: 0.1
            });

            const rock = new THREE.Mesh(rockGeometry, rockMaterial);
            rock.position.set(x, y, z);
            rock.rotation.set(
                this.utils.random(0, Math.PI),
                this.utils.random(0, Math.PI * 2),
                this.utils.random(0, Math.PI)
            );
            rock.scale.setScalar(this.utils.random(0.5, 1.5));

            rock.castShadow = true;
            rock.receiveShadow = true;
            details.add(rock);
        }

        // Создание травяных кочек
        for (let i = 0; i < 200; i++) {
            const x = this.utils.random(-this.config.SCALE.ISLAND_SIZE * 0.4, this.config.SCALE.ISLAND_SIZE * 0.4);
            const z = this.utils.random(-this.config.SCALE.ISLAND_SIZE * 0.4, this.config.SCALE.ISLAND_SIZE * 0.4);
            const y = this.getHeightAt(x, z);

            const biome = this.getBiomeAt(x, z);
            if (biome === 'plains' || biome === 'forest') {
                const grassGeometry = new THREE.ConeGeometry(0.3, 1, 6);
                const grassMaterial = new THREE.MeshLambertMaterial({
                    color: this.config.COLORS.TROPICAL.ACCENT,
                    roughness: 0.9,
                    metalness: 0.0
                });

                const grass = new THREE.Mesh(grassGeometry, grassMaterial);
                grass.position.set(x, y, z);
                grass.rotation.set(
                    this.utils.random(-0.2, 0.2),
                    this.utils.random(0, Math.PI * 2),
                    this.utils.random(-0.2, 0.2)
                );

                grass.castShadow = true;
                details.add(grass);
            }
        }

        this.scene.add(details);
        return details;
    }

    // Обновление террейна
    update(time) {
        if (this.material) {
            this.utils.updateTime(this.material, time);
        }
    }

    // Получение данных террейна для других модулей
    getTerrainData() {
        return {
            terrain: this.terrain,
            material: this.material,
            getHeightAt: (x, z) => this.getHeightAt(x, z),
            getBiomeAt: (x, z) => this.getBiomeAt(x, z),
            generateVillaPositions: () => this.generateVillaPositions(),
            createRoadNetwork: () => this.createRoadNetwork()
        };
    }
}

// Глобальный класс террейна
window.IslandTerrain = IslandTerrain;
