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
        
        // Основание храма
        const baseGeometry = new THREE.BoxGeometry(8, 6, 8);
        const baseMaterial = new THREE.MeshLambertMaterial({ 
            color: templeInfo.color.primary,
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
            color: templeInfo.color.secondary,
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
            color: templeInfo.color.accent,
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
