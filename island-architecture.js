// Модуль архитектуры острова
class IslandArchitecture {
    constructor(scene, utils, terrainData) {
        this.scene = scene;
        this.utils = utils;
        this.terrainData = terrainData;
        this.config = ISLAND_CONFIG;
        this.architecture = new THREE.Group();
        this.castle = null;
        this.villas = [];
        this.pier = null;
        this.helipad = null;
        this.roads = null;
    }

    // Создание всей архитектуры
    create() {
        // Создание замка
        this.createCastle();
        
        // Создание вилл
        this.createVillas();
        
        // Создание пирса
        this.createPier();
        
        // Создание вертолетной площадки
        this.createHelipad();
        
        // Создание дорожной сети
        this.createRoadNetwork();
        
        this.scene.add(this.architecture);
        return this.architecture;
    }

    // Создание замка
    createCastle() {
        const castleGroup = new THREE.Group();
        const castleConfig = this.config.ARCHITECTURE.CASTLE;
        
        // Основное здание замка
        const mainBuildingGeometry = new THREE.BoxGeometry(
            castleConfig.SIZE.x,
            castleConfig.SIZE.y,
            castleConfig.SIZE.z
        );
        
        const mainBuildingMaterial = new THREE.MeshLambertMaterial({
            color: 0xCCCCCC, // Полированный бетон
            roughness: 0.3,
            metalness: 0.1
        });
        
        const mainBuilding = new THREE.Mesh(mainBuildingGeometry, mainBuildingMaterial);
        mainBuilding.position.y = castleConfig.SIZE.y / 2;
        mainBuilding.castShadow = true;
        mainBuilding.receiveShadow = true;
        castleGroup.add(mainBuilding);
        
        // Башни замка
        this.createCastleTowers(castleGroup, castleConfig);
        
        // Стеклянные вставки
        this.createCastleWindows(castleGroup, castleConfig);
        
        // Дымовые трубы
        this.createCastleChimneys(castleGroup, castleConfig);
        
        // Позиционирование замка
        castleGroup.position.set(
            castleConfig.POSITION.x,
            this.terrainData.getHeightAt(castleConfig.POSITION.x, castleConfig.POSITION.z),
            castleConfig.POSITION.z
        );
        
        this.castle = castleGroup;
        this.architecture.add(castleGroup);
        
        return castleGroup;
    }

    // Создание башен замка
    createCastleTowers(castleGroup, castleConfig) {
        const towerCount = castleConfig.TOWERS;
        const towerRadius = 3;
        const towerHeight = castleConfig.SIZE.y + 5;
        
        for (let i = 0; i < towerCount; i++) {
            const angle = (i / towerCount) * Math.PI * 2;
            const distance = castleConfig.SIZE.x / 2 + 2;
            
            const x = Math.cos(angle) * distance;
            const z = Math.sin(angle) * distance;
            
            const towerGeometry = new THREE.CylinderGeometry(towerRadius, towerRadius, towerHeight, 8);
            const towerMaterial = new THREE.MeshLambertMaterial({
                color: 0xBBBBBB,
                roughness: 0.4,
                metalness: 0.2
            });
            
            const tower = new THREE.Mesh(towerGeometry, towerMaterial);
            tower.position.set(x, towerHeight / 2, z);
            tower.castShadow = true;
            tower.receiveShadow = true;
            
            castleGroup.add(tower);
        }
    }

    // Создание окон замка
    createCastleWindows(castleGroup, castleConfig) {
        const windowGeometry = new THREE.PlaneGeometry(2, 3);
        const windowMaterial = new THREE.MeshLambertMaterial({
            color: 0x87CEEB,
            roughness: 0.1,
            metalness: 0.9,
            transparent: true,
            opacity: 0.8
        });
        
        // Окна на фасадах
        const windowPositions = [
            { x: 0, y: castleConfig.SIZE.y / 2, z: castleConfig.SIZE.z / 2 + 0.1, rotation: 0 },
            { x: 0, y: castleConfig.SIZE.y / 2, z: -castleConfig.SIZE.z / 2 - 0.1, rotation: Math.PI },
            { x: castleConfig.SIZE.x / 2 + 0.1, y: castleConfig.SIZE.y / 2, z: 0, rotation: Math.PI / 2 },
            { x: -castleConfig.SIZE.x / 2 - 0.1, y: castleConfig.SIZE.y / 2, z: 0, rotation: -Math.PI / 2 }
        ];
        
        windowPositions.forEach((pos, index) => {
            const window = new THREE.Mesh(windowGeometry, windowMaterial);
            window.position.set(pos.x, pos.y, pos.z);
            window.rotation.y = pos.rotation;
            window.castShadow = true;
            
            castleGroup.add(window);
        });
    }

    // Создание дымовых труб
    createCastleChimneys(castleGroup, castleConfig) {
        const chimneyCount = 4;
        const chimneyRadius = 1;
        const chimneyHeight = 8;
        
        for (let i = 0; i < chimneyCount; i++) {
            const angle = (i / chimneyCount) * Math.PI * 2;
            const distance = castleConfig.SIZE.x / 3;
            
            const x = Math.cos(angle) * distance;
            const z = Math.sin(angle) * distance;
            
            const chimneyGeometry = new THREE.CylinderGeometry(chimneyRadius, chimneyRadius, chimneyHeight, 6);
            const chimneyMaterial = new THREE.MeshLambertMaterial({
                color: 0x666666,
                roughness: 0.8,
                metalness: 0.1
            });
            
            const chimney = new THREE.Mesh(chimneyGeometry, chimneyMaterial);
            chimney.position.set(x, castleConfig.SIZE.y + chimneyHeight / 2, z);
            chimney.castShadow = true;
            
            castleGroup.add(chimney);
            
            // Система дыма для трубы
            this.createSmokeSystem(chimney, x, castleConfig.SIZE.y + chimneyHeight, z);
        }
    }

    // Создание системы дыма
    createSmokeSystem(chimney, x, y, z) {
        const smokeCount = 20;
        const smokeGeometry = new THREE.SphereGeometry(0.5, 8, 6);
        const smokeMaterial = new THREE.MeshLambertMaterial({
            color: 0xCCCCCC,
            transparent: true,
            opacity: 0.6
        });
        
        const smokeGroup = new THREE.Group();
        
        for (let i = 0; i < smokeCount; i++) {
            const smoke = new THREE.Mesh(smokeGeometry, smokeMaterial);
            smoke.position.set(
                this.utils.random(-1, 1),
                this.utils.random(0, 5),
                this.utils.random(-1, 1)
            );
            smoke.scale.setScalar(this.utils.random(0.5, 1.5));
            
            smoke.userData = {
                originalY: smoke.position.y,
                speed: this.utils.random(0.5, 1.5),
                phase: this.utils.random(0, Math.PI * 2)
            };
            
            smokeGroup.add(smoke);
        }
        
        smokeGroup.position.set(x, y, z);
        this.architecture.add(smokeGroup);
        
        // Сохранение ссылки для анимации
        chimney.userData.smokeGroup = smokeGroup;
    }

    // Создание вилл
    createVillas() {
        const villaConfig = this.config.ARCHITECTURE.VILLAS;
        const villaPositions = this.terrainData.generateVillaPositions();
        
        for (let i = 0; i < villaPositions.length; i++) {
            const position = villaPositions[i];
            const isLargeVilla = i < villaConfig.LARGE_VILLAS;
            
            const villa = this.createVilla(isLargeVilla);
            villa.position.set(position.x, position.y, position.z);
            villa.rotation.y = this.utils.random(0, Math.PI * 2);
            villa.scale.setScalar(this.utils.random(0.8, 1.2));
            
            this.villas.push(villa);
            this.architecture.add(villa);
        }
    }

    // Создание одной виллы
    createVilla(isLarge) {
        const villaGroup = new THREE.Group();
        
        if (isLarge) {
            // Большая бетонная вилла
            const mainGeometry = new THREE.BoxGeometry(12, 8, 15);
            const mainMaterial = new THREE.MeshLambertMaterial({
                color: 0xDDDDDD,
                roughness: 0.4,
                metalness: 0.2
            });
            
            const mainBuilding = new THREE.Mesh(mainGeometry, mainMaterial);
            mainBuilding.position.y = 4;
            mainBuilding.castShadow = true;
            mainBuilding.receiveShadow = true;
            villaGroup.add(mainBuilding);
            
            // Крыша
            const roofGeometry = new THREE.ConeGeometry(10, 4, 4);
            const roofMaterial = new THREE.MeshLambertMaterial({
                color: 0x8B4513,
                roughness: 0.8,
                metalness: 0.0
            });
            
            const roof = new THREE.Mesh(roofGeometry, roofMaterial);
            roof.position.y = 10;
            roof.rotation.y = Math.PI / 4;
            roof.castShadow = true;
            villaGroup.add(roof);
            
        } else {
            // Деревянное бунгало
            const mainGeometry = new THREE.BoxGeometry(8, 6, 10);
            const mainMaterial = new THREE.MeshLambertMaterial({
                color: 0x8B4513,
                roughness: 0.9,
                metalness: 0.0
            });
            
            const mainBuilding = new THREE.Mesh(mainGeometry, mainMaterial);
            mainBuilding.position.y = 3;
            mainBuilding.castShadow = true;
            mainBuilding.receiveShadow = true;
            villaGroup.add(mainBuilding);
            
            // Соломенная крыша
            const roofGeometry = new THREE.ConeGeometry(7, 3, 8);
            const roofMaterial = new THREE.MeshLambertMaterial({
                color: 0xDAA520,
                roughness: 0.9,
                metalness: 0.0
            });
            
            const roof = new THREE.Mesh(roofGeometry, roofMaterial);
            roof.position.y = 7.5;
            roof.castShadow = true;
            villaGroup.add(roof);
        }
        
        // Окна
        this.createVillaWindows(villaGroup, isLarge);
        
        return villaGroup;
    }

    // Создание окон виллы
    createVillaWindows(villaGroup, isLarge) {
        const windowGeometry = new THREE.PlaneGeometry(1.5, 2);
        const windowMaterial = new THREE.MeshLambertMaterial({
            color: 0x87CEEB,
            roughness: 0.1,
            metalness: 0.9,
            transparent: true,
            opacity: 0.8
        });
        
        const windowCount = isLarge ? 6 : 4;
        const buildingSize = isLarge ? 12 : 8;
        
        for (let i = 0; i < windowCount; i++) {
            const window = new THREE.Mesh(windowGeometry, windowMaterial);
            
            if (i < windowCount / 2) {
                // Окна спереди
                window.position.set(
                    (i - windowCount / 4) * 3,
                    4,
                    buildingSize / 2 + 0.1
                );
            } else {
                // Окна сзади
                window.position.set(
                    (i - windowCount * 3 / 4) * 3,
                    4,
                    -buildingSize / 2 - 0.1
                );
                window.rotation.y = Math.PI;
            }
            
            window.castShadow = true;
            villaGroup.add(window);
        }
    }

    // Создание пирса
    createPier() {
        const pierConfig = this.config.ARCHITECTURE.PIER;
        const pierGroup = new THREE.Group();
        
        // Основная платформа пирса
        const pierGeometry = new THREE.BoxGeometry(pierConfig.WIDTH, 1, pierConfig.LENGTH);
        const pierMaterial = new THREE.MeshLambertMaterial({
            color: 0x8B4513,
            roughness: 0.8,
            metalness: 0.0
        });
        
        const pier = new THREE.Mesh(pierGeometry, pierMaterial);
        pier.position.set(0, -1, -pierConfig.LENGTH / 2);
        pier.castShadow = true;
        pier.receiveShadow = true;
        pierGroup.add(pier);
        
        // Опоры пирса
        const supportCount = 8;
        for (let i = 0; i < supportCount; i++) {
            const supportGeometry = new THREE.CylinderGeometry(0.5, 0.5, 3, 6);
            const supportMaterial = new THREE.MeshLambertMaterial({
                color: 0x654321,
                roughness: 0.9,
                metalness: 0.0
            });
            
            const support = new THREE.Mesh(supportGeometry, supportMaterial);
            support.position.set(
                this.utils.random(-pierConfig.WIDTH / 2, pierConfig.WIDTH / 2),
                -2.5,
                -i * (pierConfig.LENGTH / supportCount)
            );
            support.castShadow = true;
            pierGroup.add(support);
        }
        
        // Перила
        this.createPierRailings(pierGroup, pierConfig);
        
        this.pier = pierGroup;
        this.architecture.add(pierGroup);
        
        return pierGroup;
    }

    // Создание перил пирса
    createPierRailings(pierGroup, pierConfig) {
        const railingGeometry = new THREE.CylinderGeometry(0.1, 0.1, pierConfig.LENGTH, 8);
        const railingMaterial = new THREE.MeshLambertMaterial({
            color: 0x654321,
            roughness: 0.8,
            metalness: 0.1
        });
        
        // Левое перило
        const leftRailing = new THREE.Mesh(railingGeometry, railingMaterial);
        leftRailing.position.set(-pierConfig.WIDTH / 2 - 0.5, 0, -pierConfig.LENGTH / 2);
        leftRailing.castShadow = true;
        pierGroup.add(leftRailing);
        
        // Правое перило
        const rightRailing = new THREE.Mesh(railingGeometry, railingMaterial);
        rightRailing.position.set(pierConfig.WIDTH / 2 + 0.5, 0, -pierConfig.LENGTH / 2);
        rightRailing.castShadow = true;
        pierGroup.add(rightRailing);
    }

    // Создание вертолетной площадки
    createHelipad() {
        const helipadConfig = this.config.ARCHITECTURE.HELIPAD;
        const helipadGroup = new THREE.Group();
        
        // Основная площадка
        const helipadGeometry = new THREE.CylinderGeometry(helipadConfig.RADIUS, helipadConfig.RADIUS, 0.5, 32);
        const helipadMaterial = new THREE.MeshLambertMaterial({
            color: 0xFFFFFF,
            roughness: 0.6,
            metalness: 0.2
        });
        
        const helipad = new THREE.Mesh(helipadGeometry, helipadMaterial);
        helipad.position.y = 0.25;
        helipad.castShadow = true;
        helipad.receiveShadow = true;
        helipadGroup.add(helipad);
        
        // Буква "H" на площадке
        this.createHelipadMarking(helipadGroup, helipadConfig.RADIUS);
        
        // Маяки
        this.createHelipadBeacons(helipadGroup, helipadConfig);
        
        // Позиционирование вертолетной площадки
        helipadGroup.position.set(
            150,
            this.terrainData.getHeightAt(150, 0),
            0
        );
        
        this.helipad = helipadGroup;
        this.architecture.add(helipadGroup);
        
        return helipadGroup;
    }

    // Создание разметки вертолетной площадки
    createHelipadMarking(helipadGroup, radius) {
        const markingGeometry = new THREE.BoxGeometry(0.2, 0.1, 4);
        const markingMaterial = new THREE.MeshLambertMaterial({
            color: 0x000000,
            roughness: 0.8,
            metalness: 0.0
        });
        
        // Горизонтальная линия буквы "H"
        const horizontalMarking = new THREE.Mesh(markingGeometry, markingMaterial);
        horizontalMarking.position.set(0, 0.3, 0);
        helipadGroup.add(horizontalMarking);
        
        // Вертикальные линии буквы "H"
        const verticalGeometry = new THREE.BoxGeometry(0.2, 0.1, 2);
        
        const leftVertical = new THREE.Mesh(verticalGeometry, markingMaterial);
        leftVertical.position.set(-1.5, 0.3, 1);
        helipadGroup.add(leftVertical);
        
        const rightVertical = new THREE.Mesh(verticalGeometry, markingMaterial);
        rightVertical.position.set(1.5, 0.3, 1);
        helipadGroup.add(rightVertical);
    }

    // Создание маяков вертолетной площадки
    createHelipadBeacons(helipadGroup, helipadConfig) {
        const beaconCount = helipadConfig.BEACONS;
        const beaconRadius = 2;
        
        for (let i = 0; i < beaconCount; i++) {
            const angle = (i / beaconCount) * Math.PI * 2;
            const distance = helipadConfig.RADIUS + 1;
            
            const x = Math.cos(angle) * distance;
            const z = Math.sin(angle) * distance;
            
            // Основание маяка
            const baseGeometry = new THREE.CylinderGeometry(beaconRadius, beaconRadius, 1, 8);
            const baseMaterial = new THREE.MeshLambertMaterial({
                color: 0x333333,
                roughness: 0.8,
                metalness: 0.2
            });
            
            const base = new THREE.Mesh(baseGeometry, baseMaterial);
            base.position.set(x, 0.5, z);
            base.castShadow = true;
            helipadGroup.add(base);
            
            // Световой маяк
            const beaconGeometry = new THREE.SphereGeometry(0.5, 8, 6);
            const beaconMaterial = new THREE.MeshLambertMaterial({
                color: 0xFF0000,
                roughness: 0.2,
                metalness: 0.8,
                emissive: 0xFF0000,
                emissiveIntensity: 0.3
            });
            
            const beacon = new THREE.Mesh(beaconGeometry, beaconMaterial);
            beacon.position.set(x, 2, z);
            beacon.castShadow = true;
            helipadGroup.add(beacon);
            
            // Анимация маяка
            beacon.userData = {
                originalColor: 0xFF0000,
                phase: this.utils.random(0, Math.PI * 2)
            };
        }
    }

    // Создание дорожной сети
    createRoadNetwork() {
        this.roads = this.terrainData.createRoadNetwork();
        return this.roads;
    }

    // Обновление архитектуры
    update(time) {
        // Анимация дыма
        this.updateSmokeAnimation(time);
        
        // Анимация маяков
        this.updateBeaconAnimation(time);
    }

    // Обновление анимации дыма
    updateSmokeAnimation(time) {
        this.architecture.traverse((object) => {
            if (object.userData && object.userData.smokeGroup) {
                const smokeGroup = object.userData.smokeGroup;
                
                smokeGroup.children.forEach((smoke, index) => {
                    const userData = smoke.userData;
                    const newY = userData.originalY + Math.sin(time * userData.speed + userData.phase) * 3;
                    smoke.position.y = newY;
                    
                    // Затухание дыма с высотой
                    const fadeFactor = Math.max(0, 1 - (newY - userData.originalY) / 5);
                    smoke.material.opacity = 0.6 * fadeFactor;
                });
            }
        });
    }

    // Обновление анимации маяков
    updateBeaconAnimation(time) {
        this.architecture.traverse((object) => {
            if (object.userData && object.userData.originalColor) {
                const beacon = object;
                const userData = beacon.userData;
                
                // Мигание маяка
                const blink = Math.sin(time * 2 + userData.phase) * 0.5 + 0.5;
                beacon.material.emissiveIntensity = 0.3 * blink;
            }
        });
    }

    // Получение данных архитектуры для других модулей
    getArchitectureData() {
        return {
            architecture: this.architecture,
            castle: this.castle,
            villas: this.villas,
            pier: this.pier,
            helipad: this.helipad,
            roads: this.roads
        };
    }
}

// Глобальный класс архитектуры
window.IslandArchitecture = IslandArchitecture;
