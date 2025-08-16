// Система генерации террейна острова
import * as THREE from 'https://unpkg.com/three@0.152.2/build/three.module.js';

export class TerrainSystem {
  constructor() {
    this.perlin = this.makePerlin(42);
  }
  
  makePerlin(seed) {
    const p = new Uint8Array(512);
    for (let i = 0; i < 256; i++) p[i] = i;
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(Math.random() * 256);
      const t = p[i];
      p[i] = p[j];
      p[j] = t;
    }
    for (let i = 0; i < 256; i++) p[256 + i] = p[i];
    
    return function(x, y) {
      const X = Math.floor(x) & 255;
      const Y = Math.floor(y) & 255;
      const xf = x - Math.floor(x);
      const yf = y - Math.floor(y);
      
      const tr = p[p[X + 1] + Y + 1];
      const tl = p[p[X] + Y + 1];
      const br = p[p[X + 1] + Y];
      const bl = p[p[X] + Y];
      
      const u = xf * xf * xf * (xf * (xf * 6 - 15) + 10);
      const v = yf * yf * yf * (yf * (yf * 6 - 15) + 10);
      
      const x1 = (tr - br) * u + br;
      const x2 = (tl - bl) * u + bl;
      
      return (x1 - x2) * v + x2;
    };
  }
  
  buildTerrain() {
    const geometry = new THREE.PlaneGeometry(1000, 1000, 200, 200);
    geometry.rotateX(-Math.PI / 2);
    
    const positions = geometry.attributes.position;
    const colors = [];
    
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const z = positions.getZ(i);
      
      // Multiple noise layers for realistic terrain
      const noise1 = this.perlin(x * 0.01, z * 0.01) * 100;
      const noise2 = this.perlin(x * 0.02, z * 0.02) * 50;
      const noise3 = this.perlin(x * 0.04, z * 0.04) * 25;
      
      let height = noise1 + noise2 + noise3;
      
      // Create island shape
      const distance = Math.sqrt(x * x + z * z);
      const islandRadius = 400;
      if (distance > islandRadius) {
        height *= Math.max(0, 1 - (distance - islandRadius) / 100);
      }
      
      // Beach transition
      const beachStart = 350;
      if (distance > beachStart) {
        const beachFactor = (distance - beachStart) / (islandRadius - beachStart);
        height = height * (1 - beachFactor) + 2 * beachFactor;
      }
      
      positions.setY(i, height);
      
      // Color based on height and position
      let color = new THREE.Color();
      if (distance > beachStart) {
        // Beach
        color.setHex(0xf5e3be);
      } else if (height > 80) {
        // Mountains
        color.setHex(0x5e6673);
      } else if (height > 40) {
        // Forest
        color.setHex(0x2a8a57);
      } else if (height > 20) {
        // Jungle
        color.setHex(0x71c47f);
      } else {
        // Plains
        color.setHex(0xb79b69);
      }
      
      colors.push(color.r, color.g, color.b);
    }
    
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.computeVertexNormals();
    
    const material = new THREE.MeshStandardMaterial({ 
      vertexColors: true, 
      roughness: 0.8,
      metalness: 0.1
    });
    
    const terrain = new THREE.Mesh(geometry, material);
    terrain.receiveShadow = true;
    terrain.castShadow = true;
    
    return terrain;
  }
  
  init(scene) {
    const terrain = this.buildTerrain();
    scene.add(terrain);
  }
}
