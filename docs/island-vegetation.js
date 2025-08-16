// Система растительности для острова
import * as THREE from 'https://unpkg.com/three@0.152.2/build/three.module.js';

export class VegetationSystem {
  constructor() {
    this.objects = [];
  }
  
  createPalmTree(x, z, height) {
    const group = new THREE.Group();
    
    // Trunk
    const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.8, height, 8);
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.9 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = height / 2;
    trunk.castShadow = true;
    group.add(trunk);
    
    // Leaves
    for (let i = 0; i < 8; i++) {
      const leafGeometry = new THREE.ConeGeometry(0.3, 2, 6);
      const leafMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22, roughness: 0.7 });
      const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
      
      const angle = (i / 8) * Math.PI * 2;
      leaf.position.set(
        Math.cos(angle) * 0.5,
        height + 1,
        Math.sin(angle) * 0.5
      );
      leaf.rotation.x = -0.3;
      leaf.rotation.y = angle;
      leaf.castShadow = true;
      group.add(leaf);
    }
    
    group.position.set(x, 0, z);
    return group;
  }
  
  createBush(x, z) {
    const geometry = new THREE.SphereGeometry(1, 8, 6);
    const material = new THREE.MeshStandardMaterial({ color: 0x228B22, roughness: 0.8 });
    const bush = new THREE.Mesh(geometry, material);
    bush.position.set(x, 1, z);
    bush.castShadow = true;
    return bush;
  }
  
  createRock(x, z, size) {
    const geometry = new THREE.DodecahedronGeometry(size);
    const material = new THREE.MeshStandardMaterial({ color: 0x696969, roughness: 0.9 });
    const rock = new THREE.Mesh(geometry, material);
    rock.position.set(x, size, z);
    rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    rock.castShadow = true;
    return rock;
  }
  
  createFlower(x, z) {
    const group = new THREE.Group();
    
    // Stem
    const stemGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.5);
    const stemMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
    const stem = new THREE.Mesh(stemGeometry, stemMaterial);
    stem.position.y = 0.25;
    group.add(stem);
    
    // Flower
    const flowerGeometry = new THREE.SphereGeometry(0.2, 8, 6);
    const flowerMaterial = new THREE.MeshStandardMaterial({ 
      color: Math.random() > 0.5 ? 0xFF69B4 : 0xFFFF00,
      roughness: 0.3
    });
    const flower = new THREE.Mesh(flowerGeometry, flowerMaterial);
    flower.position.y = 0.6;
    group.add(flower);
    
    group.position.set(x, 0, z);
    return group;
  }
  
  init(scene) {
    // Add vegetation
    for (let i = 0; i < 50; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 300 + 50;
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;
      
      let obj;
      if (Math.random() > 0.7) {
        obj = this.createPalmTree(x, z, 8 + Math.random() * 4);
      } else if (Math.random() > 0.5) {
        obj = this.createBush(x, z);
      } else {
        obj = this.createRock(x, z, 0.5 + Math.random() * 1);
      }
      
      this.objects.push(obj);
      scene.add(obj);
    }
    
    // Add flowers
    for (let i = 0; i < 100; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 250 + 30;
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;
      
      const flower = this.createFlower(x, z);
      this.objects.push(flower);
      scene.add(flower);
    }
  }
}
