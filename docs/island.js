// Основной файл острова - импорты и инициализация
import * as THREE from 'https://unpkg.com/three@0.152.2/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.152.2/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'https://unpkg.com/three@0.152.2/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://unpkg.com/three@0.152.2/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'https://unpkg.com/three@0.152.2/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'https://unpkg.com/three@0.152.2/examples/jsm/postprocessing/UnrealBloomPass.js';
import { FXAAShader } from 'https://unpkg.com/three@0.152.2/examples/jsm/shaders/FXAAShader.js';

// Импорты наших модулей
import { AudioSystem } from './island-audio.js';
import { TerrainSystem } from './island-terrain.js';
import { WaterSystem } from './island-water.js';
import { VegetationSystem } from './island-vegetation.js';
import { BuildingSystem } from './island-buildings.js';
import { AnimationSystem } from './island-animations.js';

// Telegram WebApp
  const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
}

// Основной класс острова
class IslandApp {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.composer = null;
    this.controls = null;
    this.clock = new THREE.Clock();
    
    this.audioSystem = new AudioSystem();
    this.terrainSystem = new TerrainSystem();
    this.waterSystem = new WaterSystem();
    this.vegetationSystem = new VegetationSystem();
    this.buildingSystem = new BuildingSystem();
    this.animationSystem = new AnimationSystem();
    
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.fpsElement = document.getElementById('fps');
    
    this.init();
  }
  
  init() {
    this.setupScene();
    this.setupCamera();
    this.setupRenderer();
    this.setupPostProcessing();
    this.setupLighting();
    this.setupControls();
    this.setupSystems();
    this.setupEventListeners();
    this.startAnimation();
  }
  
  setupScene() {
    this.scene = new THREE.Scene();
  }
  
  setupCamera() {
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
    this.camera.position.set(0, 400, 400);
  }
  
  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({ 
      canvas: document.getElementById('c'), 
      antialias: true,
      alpha: false 
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
  }
  
  setupPostProcessing() {
    this.composer = new EffectComposer(this.renderer);
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);
    
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.5, 0.4, 0.85);
    this.composer.addPass(bloomPass);
    
    const fxaaPass = new ShaderPass(FXAAShader);
    fxaaPass.material.uniforms['resolution'].value.x = 1 / (window.innerWidth * this.renderer.getPixelRatio());
    fxaaPass.material.uniforms['resolution'].value.y = 1 / (window.innerHeight * this.renderer.getPixelRatio());
    this.composer.addPass(fxaaPass);
  }
  
  setupLighting() {
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    this.scene.add(ambientLight);
    
    const hemisphereLight = new THREE.HemisphereLight(0x87ceeb, 0x404040, 0.8);
    this.scene.add(hemisphereLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(1000, 1000, 500);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 2000;
    directionalLight.shadow.camera.left = -1000;
    directionalLight.shadow.camera.right = 1000;
    directionalLight.shadow.camera.top = 1000;
    directionalLight.shadow.camera.bottom = -1000;
    this.scene.add(directionalLight);
    
    const pointLight1 = new THREE.PointLight(0xff6b6b, 0.8, 300);
    pointLight1.position.set(-200, 50, -200);
    this.scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0x4ecdc4, 0.6, 250);
    pointLight2.position.set(200, 40, 200);
    this.scene.add(pointLight2);
  }
  
  setupControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.screenSpacePanning = false;
    this.controls.minDistance = 100;
    this.controls.maxDistance = 800;
    this.controls.maxPolarAngle = Math.PI / 2.2;
    this.controls.minPolarAngle = Math.PI / 3;
    this.controls.target.set(0, 0, 0);
    this.controls.update();
  }
  
  setupSystems() {
    // Инициализируем все системы
    this.terrainSystem.init(this.scene);
    this.waterSystem.init(this.scene);
    this.vegetationSystem.init(this.scene);
    this.buildingSystem.init(this.scene);
    this.animationSystem.init(this.scene);
  }
  
  setupEventListeners() {
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.composer.setSize(window.innerWidth, window.innerHeight);
    });
    
    // Аудио кнопка
    const audioBtn = document.getElementById('audioBtn');
    audioBtn.addEventListener('click', () => {
      this.audioSystem.toggleAudio();
    });
  }
  
  animate() {
    const delta = this.clock.getDelta();
    const time = this.clock.getElapsedTime();
    
    // Обновляем все системы
    this.waterSystem.update(time);
    this.animationSystem.update(time, delta);
    this.audioSystem.update(time);
    
    // Обновляем контролы
    this.controls.update();
    
    // Рендерим
    this.composer.render();
    
    // FPS счетчик
    this.frameCount++;
    const currentTime = performance.now();
    if (currentTime - this.lastTime >= 1000) {
      this.fpsElement.textContent = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
      this.frameCount = 0;
      this.lastTime = currentTime;
    }
    
    requestAnimationFrame(() => this.animate());
  }
  
  startAnimation() {
    // Убираем экран загрузки
    document.getElementById('loading').style.display = 'none';
    this.animate();
  }
}

// Запускаем приложение
new IslandApp();
