// Система анимаций для острова
import * as THREE from 'https://unpkg.com/three@0.152.2/build/three.module.js';

export class AnimationSystem {
  constructor() {
    this.boats = [];
    this.fish = [];
    this.birds = [];
  }
  
  createBoat(x, z) {
    const group = new THREE.Group();
    
    // Hull
    const hullGeometry = new THREE.BoxGeometry(4, 1, 8);
    const hullMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.8 });
    const hull = new THREE.Mesh(hullGeometry, hullMaterial);
    hull.position.y = 0.5;
    group.add(hull);
    
    // Mast
    const mastGeometry = new THREE.CylinderGeometry(0.2, 0.2, 6);
    const mastMaterial = new THREE.MeshStandardMaterial({ color: 0x8B7355 });
    const mast = new THREE.Mesh(mastGeometry, mastMaterial);
    mast.position.y = 3;
    group.add(mast);
    
    // Sail
    const sailGeometry = new THREE.PlaneGeometry(3, 4);
    const sailMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.3 });
    const sail = new THREE.Mesh(sailGeometry, sailMaterial);
    sail.position.set(1.5, 2, 0);
    sail.rotation.y = Math.PI / 2;
    group.add(sail);
    
    group.position.set(x, 0, z);
    group.userData = { 
      baseY: 0,
      speed: 0.5 + Math.random() * 0.5,
      direction: Math.random() * Math.PI * 2
    };
    
    return group;
  }
  
  createFish() {
    const geometry = new THREE.ConeGeometry(0.3, 1.5, 6);
    const material = new THREE.MeshStandardMaterial({ 
      color: Math.random() > 0.5 ? 0xFF6B6B : 0x4ECDC4,
      roughness: 0.3
    });
    const fish = new THREE.Mesh(geometry, material);
    
    fish.userData = {
      speed: 0.02 + Math.random() * 0.03,
      direction: Math.random() * Math.PI * 2,
      amplitude: 0.5 + Math.random() * 1,
      frequency: 0.01 + Math.random() * 0.02
    };
    
    return fish;
  }
  
  createBird() {
    const geometry = new THREE.SphereGeometry(0.2, 6, 6);
    const material = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.5 });
    const bird = new THREE.Mesh(geometry, material);
    
    bird.userData = {
      speed: 0.01 + Math.random() * 0.02,
      direction: Math.random() * Math.PI * 2,
      height: 50 + Math.random() * 100,
      radius: 200 + Math.random() * 300
    };
    
    return bird;
  }
  
  init(scene) {
    // Create boats
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 450 + Math.random() * 100;
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;
      
      const boat = this.createBoat(x, z);
      this.boats.push(boat);
      scene.add(boat);
    }
    
    // Create fish
    for (let i = 0; i < 30; i++) {
      const f = this.createFish();
      f.position.set(
        (Math.random() - 0.5) * 800,
        -10 - Math.random() * 20,
        (Math.random() - 0.5) * 800
      );
      this.fish.push(f);
      scene.add(f);
    }
    
    // Create birds
    for (let i = 0; i < 20; i++) {
      const b = this.createBird();
      const angle = Math.random() * Math.PI * 2;
      const radius = 200 + Math.random() * 300;
      b.position.set(
        Math.cos(angle) * radius,
        50 + Math.random() * 100,
        Math.sin(angle) * radius
      );
      this.birds.push(b);
      scene.add(b);
    }
  }
  
  update(time, delta) {
    // Animate boats
    this.boats.forEach(boat => {
      const data = boat.userData;
      data.direction += data.speed * delta;
      
      const radius = 450 + Math.sin(time * 0.1 + boat.id) * 20;
      boat.position.x = Math.cos(data.direction) * radius;
      boat.position.z = Math.sin(data.direction) * radius;
      boat.position.y = data.baseY + Math.sin(time * 2 + boat.id) * 0.5;
      boat.rotation.y = data.direction + Math.PI / 2;
    });
    
    // Animate fish
    this.fish.forEach(f => {
      const data = f.userData;
      data.direction += data.speed;
      
      f.position.x += Math.cos(data.direction) * 2;
      f.position.z += Math.sin(data.direction) * 2;
      f.position.y = -10 + Math.sin(time * data.frequency + f.id) * data.amplitude;
      
      f.rotation.y = data.direction;
      
      // Wrap around
      if (f.position.x > 400) f.position.x = -400;
      if (f.position.x < -400) f.position.x = 400;
      if (f.position.z > 400) f.position.z = -400;
      if (f.position.z < -400) f.position.z = 400;
    });
    
    // Animate birds
    this.birds.forEach(bird => {
      const data = bird.userData;
      data.direction += data.speed;
      
      bird.position.x = Math.cos(data.direction) * data.radius;
      bird.position.z = Math.sin(data.direction) * data.radius;
      bird.position.y = data.height + Math.sin(time * 0.5 + bird.id) * 10;
    });
  }
}
