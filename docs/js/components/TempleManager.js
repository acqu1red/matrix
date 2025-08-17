import { EventEmitter } from '../utils/EventEmitter.js';

export class TempleManager extends EventEmitter {
    constructor(sceneManager, templeData) {
        super();
        
        this.sceneManager = sceneManager;
        this.templeData = templeData;
        this.temples = [];
        this.selectedTemple = null;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        this.init();
    }
    
    init() {
        this.createTemples();
        this.setupEventListeners();
    }
    
    createTemples() {
        Object.values(this.templeData).forEach(templeInfo => {
            const temple = this.createTemple(templeInfo);
            this.temples.push(temple);
            this.sceneManager.scene.add(temple);
        });
    }
    
    createTemple(templeInfo) {
        const templeGroup = new THREE.Group();
        templeGroup.position.set(templeInfo.position.x, templeInfo.position.y, templeInfo.position.z);
        templeGroup.userData = { 
            templeId: templeInfo.id, 
            type: 'temple',
            templeInfo: templeInfo
        };
        
        // Создаем упрощенный храм для тестирования
        this.createSimpleTemple(templeGroup, templeInfo);
        
        console.log(`🏛️ Создан упрощенный храм: ${templeInfo.name}`);
        return templeGroup;
    }
    
    createSimpleTemple(templeGroup, templeInfo) {
        // Простое основание
        const baseGeometry = new THREE.BoxGeometry(8, 2, 8);
        const baseMaterial = new THREE.MeshLambertMaterial({ color: templeInfo.color.primary });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = 1;
        base.castShadow = true;
        base.receiveShadow = true;
        templeGroup.add(base);
        
        // Простые стены
        const wallGeometry = new THREE.BoxGeometry(6, 6, 6);
        const wallMaterial = new THREE.MeshLambertMaterial({ color: templeInfo.color.secondary });
        const walls = new THREE.Mesh(wallGeometry, wallMaterial);
        walls.position.y = 5;
        walls.castShadow = true;
        walls.receiveShadow = true;
        templeGroup.add(walls);
        
        // Простая крыша
        const roofGeometry = new THREE.ConeGeometry(4, 3, 8);
        const roofMaterial = new THREE.MeshLambertMaterial({ color: templeInfo.color.accent });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.y = 9.5;
        roof.castShadow = true;
        templeGroup.add(roof);
        
        // Свечение
        const glowGeometry = new THREE.SphereGeometry(10, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: templeInfo.color.accent,
            transparent: true,
            opacity: 0,
            side: THREE.BackSide
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.y = 7;
        glow.userData = { type: 'glow' };
        templeGroup.add(glow);
    }
    
    createTempleFoundation(templeGroup, templeInfo) {
        // Многоуровневое основание с деталями
        const foundationLevels = [
            { width: 12, height: 0.5, depth: 12, y: 0.25, color: 0x8B4513 },
            { width: 10, height: 0.5, depth: 10, y: 0.75, color: 0xA0522D },
            { width: 8, height: 0.5, depth: 8, y: 1.25, color: 0xCD853F }
        ];
        
        foundationLevels.forEach((level, index) => {
            const geometry = new THREE.BoxGeometry(level.width, level.height, level.depth);
            const material = new THREE.MeshLambertMaterial({ 
                color: level.color,
                roughness: 0.8,
                metalness: 0.1
            });
            const foundation = new THREE.Mesh(geometry, material);
            foundation.position.y = level.y;
            foundation.castShadow = true;
            foundation.receiveShadow = true;
            
            // Добавляем детали на основание
            this.addFoundationDetails(foundation, level, index);
            templeGroup.add(foundation);
        });
    }
    
    addFoundationDetails(foundation, level, index) {
        // Добавляем каменные блоки и трещины
        const detailGeometry = new THREE.BoxGeometry(0.5, 0.1, 0.5);
        const detailMaterial = new THREE.MeshLambertMaterial({ color: 0x696969 });
        
        for (let i = 0; i < 8; i++) {
            const detail = new THREE.Mesh(detailGeometry, detailMaterial);
            detail.position.set(
                (Math.random() - 0.5) * (level.width - 1),
                level.height / 2 + 0.05,
                (Math.random() - 0.5) * (level.depth - 1)
            );
            detail.rotation.y = Math.random() * Math.PI;
            foundation.add(detail);
        }
    }
    
    createTempleWalls(templeGroup, templeInfo) {
        // Основные стены с детализацией
        const wallGeometry = new THREE.BoxGeometry(8, 8, 8);
        const wallMaterial = new THREE.MeshLambertMaterial({ 
            color: templeInfo.color.primary,
            roughness: 0.7,
            metalness: 0.2
        });
        const walls = new THREE.Mesh(wallGeometry, wallMaterial);
        walls.position.y = 5;
        walls.castShadow = true;
        walls.receiveShadow = true;
        
        // Добавляем детали на стены
        this.addWallDetails(walls, templeInfo);
        templeGroup.add(walls);
    }
    
    addWallDetails(walls, templeInfo) {
        // Создаем каменные блоки на стенах
        const blockGeometry = new THREE.BoxGeometry(0.8, 0.4, 0.8);
        const blockMaterial = new THREE.MeshLambertMaterial({ 
            color: templeInfo.color.secondary,
            roughness: 0.6
        });
        
        // Добавляем блоки на каждую сторону стены
        const sides = [
            { x: 0, z: 4.1, rotY: 0 },
            { x: 0, z: -4.1, rotY: Math.PI },
            { x: 4.1, z: 0, rotY: Math.PI / 2 },
            { x: -4.1, z: 0, rotY: -Math.PI / 2 }
        ];
        
        sides.forEach(side => {
            for (let row = 0; row < 4; row++) {
                for (let col = 0; col < 3; col++) {
                    const block = new THREE.Mesh(blockGeometry, blockMaterial);
                    block.position.set(
                        side.x + (col - 1) * 1.2,
                        2 + row * 1.5,
                        side.z
                    );
                    block.rotation.y = side.rotY;
                    walls.add(block);
                }
            }
        });
    }
    
    createTempleRoof(templeGroup, templeInfo) {
        // Сложная крыша с несколькими уровнями
        const roofLevels = [
            { radius: 6, height: 2, segments: 8, y: 9, color: templeInfo.color.secondary },
            { radius: 4, height: 1.5, segments: 8, y: 11.5, color: templeInfo.color.accent },
            { radius: 2, height: 1, segments: 8, y: 13.5, color: 0xFFD700 }
        ];
        
        roofLevels.forEach((level, index) => {
            const geometry = new THREE.ConeGeometry(level.radius, level.height, level.segments);
            const material = new THREE.MeshLambertMaterial({ 
                color: level.color,
                roughness: 0.5,
                metalness: 0.3
            });
            const roof = new THREE.Mesh(geometry, material);
            roof.position.y = level.y;
            roof.castShadow = true;
            
            // Добавляем детали на крышу
            this.addRoofDetails(roof, level, index);
            templeGroup.add(roof);
        });
        
        // Шпиль на вершине
        const spireGeometry = new THREE.ConeGeometry(0.3, 2, 8);
        const spireMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xFFD700,
            metalness: 0.8,
            roughness: 0.2
        });
        const spire = new THREE.Mesh(spireGeometry, spireMaterial);
        spire.position.y = 15.5;
        templeGroup.add(spire);
    }
    
    addRoofDetails(roof, level, index) {
        // Добавляем декоративные элементы на крышу
        const detailGeometry = new THREE.BoxGeometry(0.2, 0.3, 0.2);
        const detailMaterial = new THREE.MeshLambertMaterial({ color: 0xFFD700 });
        
        for (let i = 0; i < level.segments; i++) {
            const angle = (i / level.segments) * Math.PI * 2;
            const detail = new THREE.Mesh(detailGeometry, detailMaterial);
            detail.position.set(
                Math.cos(angle) * (level.radius - 0.5),
                level.height / 2,
                Math.sin(angle) * (level.radius - 0.5)
            );
            detail.rotation.y = angle;
            roof.add(detail);
        }
    }
    
    createTempleColumns(templeGroup, templeInfo) {
        // Детализированные колонны с капителями
        const columnPositions = [
            { x: -3, z: -3 },
            { x: 3, z: -3 },
            { x: -3, z: 3 },
            { x: 3, z: 3 }
        ];
        
        columnPositions.forEach((pos, index) => {
            // Основание колонны
            const baseGeometry = new THREE.CylinderGeometry(0.4, 0.5, 0.3, 8);
            const baseMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
            const base = new THREE.Mesh(baseGeometry, baseMaterial);
            base.position.set(pos.x, 0.15, pos.z);
            templeGroup.add(base);
            
            // Основная часть колонны
            const columnGeometry = new THREE.CylinderGeometry(0.3, 0.3, 6, 12);
            const columnMaterial = new THREE.MeshLambertMaterial({ 
                color: 0xD2691E,
                roughness: 0.6
            });
            const column = new THREE.Mesh(columnGeometry, columnMaterial);
            column.position.set(pos.x, 3.3, pos.z);
            column.castShadow = true;
            
            // Добавляем канавки на колонну
            this.addColumnGrooves(column);
            templeGroup.add(column);
            
            // Капитель колонны
            const capitalGeometry = new THREE.CylinderGeometry(0.5, 0.3, 0.4, 8);
            const capitalMaterial = new THREE.MeshLambertMaterial({ color: 0xFFD700 });
            const capital = new THREE.Mesh(capitalGeometry, capitalMaterial);
            capital.position.set(pos.x, 6.7, pos.z);
            templeGroup.add(capital);
        });
    }
    
    addColumnGrooves(column) {
        // Добавляем вертикальные канавки на колонну
        const grooveGeometry = new THREE.BoxGeometry(0.05, 6, 0.05);
        const grooveMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const groove = new THREE.Mesh(grooveGeometry, grooveMaterial);
            groove.position.set(
                Math.cos(angle) * 0.35,
                0,
                Math.sin(angle) * 0.35
            );
            column.add(groove);
        }
    }
    
    createTempleEntrance(templeGroup, templeInfo) {
        // Детализированный вход с аркой
        // Арка
        const archGeometry = new THREE.TorusGeometry(1.5, 0.3, 8, 16, Math.PI);
        const archMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const arch = new THREE.Mesh(archGeometry, archMaterial);
        arch.position.set(0, 2.5, 4.1);
        arch.rotation.x = Math.PI / 2;
        templeGroup.add(arch);
        
        // Дверь
        const doorGeometry = new THREE.BoxGeometry(2, 3.5, 0.2);
        const doorMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x654321,
            roughness: 0.8
        });
        const door = new THREE.Mesh(doorGeometry, doorMaterial);
        door.position.set(0, 1.75, 4.2);
        templeGroup.add(door);
        
        // Дверная ручка
        const handleGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const handleMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xFFD700,
            metalness: 0.8
        });
        const handle = new THREE.Mesh(handleGeometry, handleMaterial);
        handle.position.set(0.7, 1.5, 4.3);
        templeGroup.add(handle);
        
        // Ступени
        for (let i = 0; i < 3; i++) {
            const stepGeometry = new THREE.BoxGeometry(3 - i * 0.3, 0.2, 0.5);
            const stepMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
            const step = new THREE.Mesh(stepGeometry, stepMaterial);
            step.position.set(0, 0.1 + i * 0.2, 4.5 + i * 0.3);
            templeGroup.add(step);
        }
    }
    
    createTempleDecorations(templeGroup, templeInfo) {
        // Декоративные элементы
        // Фриз с орнаментом
        const friezeGeometry = new THREE.BoxGeometry(8.2, 0.3, 0.2);
        const friezeMaterial = new THREE.MeshLambertMaterial({ color: 0xFFD700 });
        const frieze = new THREE.Mesh(friezeGeometry, friezeMaterial);
        frieze.position.set(0, 8.15, 0);
        templeGroup.add(frieze);
        
        // Статуи на углах
        const statuePositions = [
            { x: -4.1, z: -4.1 },
            { x: 4.1, z: -4.1 },
            { x: -4.1, z: 4.1 },
            { x: 4.1, z: 4.1 }
        ];
        
        statuePositions.forEach(pos => {
            this.createStatue(templeGroup, pos);
        });
        
        // Факелы
        const torchPositions = [
            { x: -2, z: 4.2 },
            { x: 2, z: 4.2 }
        ];
        
        torchPositions.forEach(pos => {
            this.createTorch(templeGroup, pos);
        });
    }
    
    createStatue(templeGroup, position) {
        // Простая статуя
        const baseGeometry = new THREE.CylinderGeometry(0.3, 0.4, 0.5, 8);
        const baseMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.set(position.x, 0.25, position.z);
        templeGroup.add(base);
        
        const bodyGeometry = new THREE.CylinderGeometry(0.2, 0.3, 1.5, 8);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0xD2691E });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.set(position.x, 1.25, position.z);
        templeGroup.add(body);
        
        const headGeometry = new THREE.SphereGeometry(0.25, 8, 8);
        const headMaterial = new THREE.MeshLambertMaterial({ color: 0xD2691E });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.set(position.x, 2.25, position.z);
        templeGroup.add(head);
    }
    
    createTorch(templeGroup, position) {
        // Факел
        const torchGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1, 8);
        const torchMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const torch = new THREE.Mesh(torchGeometry, torchMaterial);
        torch.position.set(position.x, 2, position.z);
        templeGroup.add(torch);
        
        // Огонь факела
        const fireGeometry = new THREE.SphereGeometry(0.15, 8, 8);
        const fireMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xFF4500,
            transparent: true,
            opacity: 0.8
        });
        const fire = new THREE.Mesh(fireGeometry, fireMaterial);
        fire.position.set(position.x, 2.6, position.z);
        templeGroup.add(fire);
        
        // Добавляем точечный свет от факела
        const torchLight = new THREE.PointLight(0xFF4500, 0.5, 8);
        torchLight.position.set(position.x, 2.6, position.z);
        templeGroup.add(torchLight);
    }
    
    createTempleGlow(templeGroup, templeInfo) {
        // Свечение для выбранного храма
        const glowGeometry = new THREE.SphereGeometry(12, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: templeInfo.color.accent,
            transparent: true,
            opacity: 0,
            side: THREE.BackSide
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.y = 7;
        glow.userData = { type: 'glow' };
        templeGroup.add(glow);
    }
    
    setupEventListeners() {
        // Обработчики мыши
        window.addEventListener('click', this.onMouseClick.bind(this));
        window.addEventListener('mousemove', this.onMouseMove.bind(this));
    }
    
    onMouseClick(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        this.raycaster.setFromCamera(this.mouse, this.sceneManager.camera);
        const intersects = this.raycaster.intersectObjects(this.temples, true);
        
        if (intersects.length > 0) {
            const object = intersects[0].object;
            let templeGroup = object;
            
            while (templeGroup && templeGroup.userData.type !== 'temple') {
                templeGroup = templeGroup.parent;
            }
            
            if (templeGroup && templeGroup.userData.type === 'temple') {
                this.emit('templeClick', templeGroup.userData.templeId);
            }
        }
    }
    
    onMouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        this.raycaster.setFromCamera(this.mouse, this.sceneManager.camera);
        const intersects = this.raycaster.intersectObjects(this.temples, true);
        
        // Сброс подсветки всех храмов
        this.temples.forEach(temple => {
            this.unhighlightTemple(temple.userData.templeId);
        });
        
        // Подсветка храма под курсором
        if (intersects.length > 0) {
            const object = intersects[0].object;
            let templeGroup = object;
            
            while (templeGroup && templeGroup.userData.type !== 'temple') {
                templeGroup = templeGroup.parent;
            }
            
            if (templeGroup && templeGroup.userData.type === 'temple') {
                this.highlightTemple(templeGroup.userData.templeId);
                this.emit('templeHover', templeGroup.userData.templeId, true);
            }
        } else {
            this.emit('templeHover', null, false);
        }
    }
    
    selectTemple(templeId) {
        if (this.selectedTemple) {
            this.deselectTemple();
        }
        
        this.selectedTemple = templeId;
        const temple = this.getTemple(templeId);
        if (temple) {
            temple.children.forEach(child => {
                if (child.userData.type === 'glow') {
                    child.material.opacity = 0.3;
                }
            });
        }
    }
    
    deselectTemple() {
        if (this.selectedTemple) {
            const temple = this.getTemple(this.selectedTemple);
            if (temple) {
                temple.children.forEach(child => {
                    if (child.userData.type === 'glow') {
                        child.material.opacity = 0;
                    }
                });
            }
            this.selectedTemple = null;
        }
    }
    
    highlightTemple(templeId) {
        const temple = this.getTemple(templeId);
        if (temple && templeId !== this.selectedTemple) {
            temple.children.forEach(child => {
                if (child.material && child.material.color) {
                    child.material.color.setHex(0xffd700);
                }
            });
        }
    }
    
    unhighlightTemple(templeId) {
        const temple = this.getTemple(templeId);
        if (temple && templeId !== this.selectedTemple) {
            const templeInfo = temple.userData.templeInfo;
            temple.children.forEach(child => {
                if (child.material && child.material.color) {
                    if (child.geometry.type === 'BoxGeometry' && child.position.y === 3) {
                        child.material.color.setHex(templeInfo.color.primary);
                    } else if (child.geometry.type === 'ConeGeometry') {
                        child.material.color.setHex(templeInfo.color.secondary);
                    }
                }
            });
        }
    }
    
    getTemple(templeId) {
        return this.temples.find(t => t.userData.templeId === templeId);
    }
    
    getTemplePosition(templeId) {
        const temple = this.getTemple(templeId);
        return temple ? temple.position : null;
    }
    
    getTempleData(templeId) {
        return this.templeData[templeId] || null;
    }
}
