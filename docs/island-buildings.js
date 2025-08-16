// Система зданий для острова
import * as THREE from 'https://unpkg.com/three@0.152.2/build/three.module.js';

export class BuildingSystem {
  constructor() {
    this.objects = [];
  }
  
  createCastle() {
    const group = new THREE.Group();
    
    // Main building
    const mainGeometry = new THREE.BoxGeometry(20, 15, 20);
    const mainMaterial = new THREE.MeshStandardMaterial({ color: 0x8B7355, roughness: 0.8 });
    const main = new THREE.Mesh(mainGeometry, mainMaterial);
    main.position.y = 7.5;
    main.castShadow = true;
    main.receiveShadow = true;
    group.add(main);
    
    // Towers
    for (let i = 0; i < 4; i++) {
      const towerGeometry = new THREE.CylinderGeometry(3, 3, 20, 8);
      const towerMaterial = new THREE.MeshStandardMaterial({ color: 0x696969, roughness: 0.9 });
      const tower = new THREE.Mesh(towerGeometry, towerMaterial);
      
      const angle = (i / 4) * Math.PI * 2;
      tower.position.set(
        Math.cos(angle) * 15,
        10,
        Math.sin(angle) * 15
      );
      tower.castShadow = true;
      group.add(tower);
    }
    
    // Roof
    const roofGeometry = new THREE.ConeGeometry(15, 8, 8);
    const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x8B0000, roughness: 0.7 });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 19;
    roof.castShadow = true;
    group.add(roof);
    
    group.position.set(0, 0, 0);
    return group;
  }
  
  createVilla(x, z) {
    const group = new THREE.Group();
    
    // House
    const houseGeometry = new THREE.BoxGeometry(8, 6, 8);
    const houseMaterial = new THREE.MeshStandardMaterial({ color: 0xF5DEB3, roughness: 0.6 });
    const house = new THREE.Mesh(houseGeometry, houseMaterial);
    house.position.y = 3;
    house.castShadow = true;
    house.receiveShadow = true;
    group.add(house);
    
    // Roof
    const roofGeometry = new THREE.ConeGeometry(6, 4, 6);
    const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.8 });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 8;
    roof.castShadow = true;
    group.add(roof);
    
    group.position.set(x, 0, z);
    return group;
  }
  
  init(scene) {
    // Add castle
    const castle = this.createCastle();
    this.objects.push(castle);
    scene.add(castle);
    
    // Add villas around the island
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const distance = 150 + Math.random() * 50;
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;
      
      const villa = this.createVilla(x, z);
      this.objects.push(villa);
      scene.add(villa);
    }
  }
}
