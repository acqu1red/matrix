// Система воды для острова
import * as THREE from 'https://unpkg.com/three@0.152.2/build/three.module.js';

export class WaterSystem {
  constructor() {
    this.water = null;
    this.waterMaterial = null;
  }
  
  init(scene) {
    const waterGeometry = new THREE.PlaneGeometry(2000, 2000, 100, 100);
    waterGeometry.rotateX(-Math.PI / 2);
    
    this.waterMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        waterColor: { value: new THREE.Color(0x0d3b66) },
        foamColor: { value: new THREE.Color(0xffffff) },
        sunDirection: { value: new THREE.Vector3(0.3, 1, 0.2).normalize() }
      },
      vertexShader: `
        uniform float time;
        varying vec2 vUv;
        varying vec3 vPosition;
        
        void main() {
          vUv = uv;
          vPosition = position;
          
          vec3 pos = position;
          pos.y += sin((position.x + time * 2.0) * 0.02) * 2.0;
          pos.y += cos((position.z + time * 1.5) * 0.02) * 2.0;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 waterColor;
        uniform vec3 foamColor;
        uniform vec3 sunDirection;
        uniform float time;
        varying vec2 vUv;
        varying vec3 vPosition;
        
        void main() {
          vec2 uv = vUv * 20.0 + vec2(time * 0.01, time * 0.008);
          
          float wave1 = sin(uv.x + time * 0.5) * 0.5 + 0.5;
          float wave2 = sin(uv.y + time * 0.3) * 0.5 + 0.5;
          float wave = (wave1 + wave2) * 0.5;
          
          vec3 normal = normalize(vec3(
            sin(uv.x + time * 0.5) * 0.1,
            1.0,
            sin(uv.y + time * 0.3) * 0.1
          ));
          
          float fresnel = pow(1.0 - dot(normal, vec3(0.0, 1.0, 0.0)), 3.0);
          float sunReflection = pow(max(0.0, dot(normal, sunDirection)), 8.0);
          
          vec3 color = mix(waterColor, foamColor, wave * 0.3);
          color = mix(color, vec3(1.0), fresnel * 0.5);
          color = mix(color, vec3(1.0), sunReflection * 0.3);
          
          gl_FragColor = vec4(color, 0.8);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    });
    
    this.water = new THREE.Mesh(waterGeometry, this.waterMaterial);
    this.water.position.y = -5;
    scene.add(this.water);
  }
  
  update(time) {
    if (this.waterMaterial) {
      this.waterMaterial.uniforms.time.value = time;
    }
  }
}
