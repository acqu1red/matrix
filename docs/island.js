(function(){
  const tg = window.Telegram?.WebApp;
  if (tg) { try { tg.ready(); tg.expand(); } catch(e){} }

  const $ = sel => document.querySelector(sel);
  const canvas = $("#scene");
  const overlay = $("#interiorOverlay");
  const interiorCanvas = $("#interior");
  const bookPanel = $("#bookPanel");
  const bookReader = $("#bookReader");
  const loadingScreen = $("#loadingScreen");
  const islandInfo = $("#islandInfo");
  const progressIndicator = $("#progressIndicator");
  const webglStatus = $("#webglStatus");
  const webglFallback = $("#webglFallback");

  // Enhanced books with more realistic data
  const BOOKS = [
    { 
      id: 'psychotypes-intro',
      title: "Введение в психотипы",
      author: "ФОРМУЛА",
      description: "Основы психотипирования и анализа личности",
      url: "https://t.me/c/1928787715/128",
      cover: "🧠",
      color: "#4a90e2"
    },
    { 
      id: 'epileptoid',
      title: "Психотип: Эпилептоид", 
      author: "ФОРМУЛА",
      description: "Глубокий анализ эпилептоидного типа личности",
      url: "https://t.me/c/1928787715/127",
      cover: "⚡",
      color: "#e74c3c"
    },
    { 
      id: 'hysteroid',
      title: "Психотип: Истероид", 
      author: "ФОРМУЛА",
      description: "Детальное изучение истероидного типа",
      url: "https://t.me/c/1928787715/126",
      cover: "🎭",
      color: "#9b59b6"
    },
    { 
      id: 'manipulation',
      title: "Искусство манипуляции", 
      author: "ФОРМУЛА",
      description: "Продвинутые техники влияния на людей",
      url: "https://t.me/c/1928787715/125",
      cover: "🎯",
      color: "#f39c12"
    },
    { 
      id: 'profiling',
      title: "Профайлинг в действии", 
      author: "ФОРМУЛА",
      description: "Практические методы анализа поведения",
      url: "https://t.me/c/1928787715/124",
      cover: "🔍",
      color: "#27ae60"
    }
  ];

  let scene, camera, renderer, controls;
  let houses = [];
  let palmTrees = [];
  let waterParticles = [];
  let currentHoveredHouse = null;
  let selectedBook = null;
  let isFullscreen = false;
  let animationId;

  // Check WebGL support
  function checkWebGL() {
    const statusText = webglStatus.querySelector('.status-text');
    
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      if (!gl) {
        statusText.textContent = 'WebGL не поддерживается';
        statusText.className = 'status-text error';
        webglFallback.classList.remove('hidden');
        return false;
      }
      
      statusText.textContent = 'WebGL поддерживается ✓';
      statusText.className = 'status-text success';
      return true;
    } catch (e) {
      statusText.textContent = 'Ошибка WebGL: ' + e.message;
      statusText.className = 'status-text error';
      webglFallback.classList.remove('hidden');
      return false;
    }
  }

  // Loading simulation with progress
  let loadingProgress = 0;
  const loadingInterval = setInterval(() => {
    loadingProgress += Math.random() * 15;
    if (loadingProgress >= 100) {
      loadingProgress = 100;
      clearInterval(loadingInterval);
      setTimeout(() => {
        loadingScreen.classList.add('hidden');
        setTimeout(() => loadingScreen.remove(), 500);
      }, 500);
    }
    const progressBar = document.querySelector('.loading-progress');
    if (progressBar) {
      progressBar.style.width = loadingProgress + '%';
    }
  }, 200);

  // Initialize 3D scene
  function initThreeJS() {
    if (!checkWebGL()) {
      return false;
    }

    try {
      // Create renderer with maximum quality
      renderer = new THREE.WebGLRenderer({ 
        canvas: canvas,
        antialias: true, 
        alpha: true,
        powerPreference: "high-performance",
        stencil: false,
        depth: true
      });
      
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
      renderer.outputEncoding = THREE.sRGBEncoding;

      // Create scene
      scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x87ceeb, 0.005);

      // Create camera
      camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.set(0, 150, 100);

      // Create controls
      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.screenSpacePanning = false;
      controls.minDistance = 80;
      controls.maxDistance = 300;
      controls.minPolarAngle = Math.PI / 3;
      controls.maxPolarAngle = Math.PI / 2.2;
      controls.target.set(0, 0, 0);
      controls.update();

      // Create lighting
      createLighting();
      
      // Create ocean
      createOcean();
      
      // Create detailed island
      createDetailedIsland();
      
      // Create roads
      createRoads();
      
      // Create buildings
      createBuildings();
      
      // Create vegetation
      createVegetation();
      
      // Create coastal features
      createCoastalFeatures();
      
      // Create islets
      createIslets();
      
      // Create atmospheric effects
      createAtmosphere();

      // Start animation loop
      animate();

      // Handle window resize
      window.addEventListener('resize', onWindowResize);

      // Setup interaction
      setupInteraction();

      return true;
    } catch (error) {
      console.error('Three.js initialization failed:', error);
      webglFallback.classList.remove('hidden');
      return false;
    }
  }

  function createLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x87ceeb, 0.4);
    scene.add(ambientLight);

    // Hemisphere light for sky/ground
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x1a1a2e, 0.6);
    scene.add(hemiLight);

    // Main directional light (sun)
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(50, 100, 50);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 4096;
    dirLight.shadow.mapSize.height = 4096;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 300;
    dirLight.shadow.camera.left = -150;
    dirLight.shadow.camera.right = 150;
    dirLight.shadow.camera.top = 150;
    dirLight.shadow.camera.bottom = -150;
    scene.add(dirLight);

    // Additional point lights for dramatic effect
    const pointLight1 = new THREE.PointLight(0xffd700, 0.8, 100);
    pointLight1.position.set(-20, 30, -20);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x87ceeb, 0.6, 80);
    pointLight2.position.set(30, 20, 30);
    scene.add(pointLight2);
  }

  function createOcean() {
    // Create large ocean plane with detailed geometry
    const oceanGeometry = new THREE.PlaneGeometry(600, 600, 256, 256);
    
    // Create custom shader material for realistic water
    const oceanMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uShallowColor: { value: new THREE.Color(0x40E0D0) },
        uDeepColor: { value: new THREE.Color(0x006994) },
        uWaveSpeed: { value: 0.5 },
        uWaveHeight: { value: 0.8 },
        uWaveFrequency: { value: 0.1 }
      },
      vertexShader: `
        varying vec2 vUv;
        varying float vDepth;
        uniform float uTime;
        uniform float uWaveSpeed;
        uniform float uWaveHeight;
        uniform float uWaveFrequency;
        
        void main() {
          vUv = uv;
          vec3 p = position;
          
          // Multiple wave layers for realistic water
          float wave1 = sin((p.x + uTime * uWaveSpeed) * uWaveFrequency) * uWaveHeight;
          float wave2 = cos((p.y - uTime * uWaveSpeed * 0.8) * uWaveFrequency * 0.8) * uWaveHeight * 0.7;
          float wave3 = sin((p.x + p.y + uTime * uWaveSpeed * 1.2) * uWaveFrequency * 0.6) * uWaveHeight * 0.5;
          float wave4 = cos((p.x - p.y + uTime * uWaveSpeed * 0.6) * uWaveFrequency * 0.4) * uWaveHeight * 0.3;
          
          p.z += wave1 + wave2 + wave3 + wave4;
          
          // Calculate depth for color variation
          float distFromCenter = length(p.xy);
          vDepth = smoothstep(0.0, 300.0, distFromCenter);
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        varying float vDepth;
        uniform vec3 uShallowColor;
        uniform vec3 uDeepColor;
        
        void main() {
          vec3 waterColor = mix(uShallowColor, uDeepColor, vDepth);
          
          // Add foam and transparency
          float foam = sin(vUv.x * 100.0) * sin(vUv.y * 100.0) * 0.15;
          waterColor += foam;
          
          // Add some transparency
          gl_FragColor = vec4(waterColor, 0.85);
        }
      `,
      side: THREE.DoubleSide,
      transparent: true
    });
    
    const ocean = new THREE.Mesh(oceanGeometry, oceanMaterial);
    ocean.rotation.x = -Math.PI / 2;
    ocean.position.y = -5;
    ocean.receiveShadow = true;
    scene.add(ocean);
    
    waterParticles.push({ mesh: ocean, material: oceanMaterial });
  }

  function createDetailedIsland() {
    // Create complex island shape using custom geometry
    const islandShape = new THREE.Shape();
    
    // Define the irregular island outline with more detail
    islandShape.moveTo(-30, -20);
    islandShape.bezierCurveTo(-40, -15, -45, 0, -40, 15);
    islandShape.bezierCurveTo(-35, 30, -25, 35, -15, 35);
    islandShape.bezierCurveTo(-5, 35, 5, 30, 15, 25);
    islandShape.bezierCurveTo(25, 20, 35, 15, 40, 5);
    islandShape.bezierCurveTo(45, -5, 45, -15, 40, -25);
    islandShape.bezierCurveTo(35, -35, 25, -40, 15, -40);
    islandShape.bezierCurveTo(5, -40, -5, -40, -15, -35);
    islandShape.bezierCurveTo(-25, -30, -30, -20, -30, -20);
    
    const extrudeSettings = {
      depth: 12,
      bevelEnabled: true,
      bevelSegments: 5,
      steps: 3,
      bevelSize: 2,
      bevelThickness: 2
    };
    
    const islandGeometry = new THREE.ExtrudeGeometry(islandShape, extrudeSettings);
    
    // Create detailed material with normal mapping
    const islandMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x8B7355,
      roughness: 0.8,
      metalness: 0.1,
      bumpScale: 0.5
    });
    
    const island = new THREE.Mesh(islandGeometry, islandMaterial);
    island.position.y = 4;
    island.castShadow = true;
    island.receiveShadow = true;
    scene.add(island);

    // Add elevation variations
    createElevation();
  }

  function createElevation() {
    // Create detailed hills and mountains
    const hillPositions = [
      { x: -15, z: 8, height: 10, radius: 12, color: 0x6B8E23 },
      { x: 8, z: 15, height: 12, radius: 15, color: 0x556B2F },
      { x: 20, z: -8, height: 6, radius: 8, color: 0x8FBC8F },
      { x: -8, z: -15, height: 8, radius: 10, color: 0x6B8E23 },
      { x: 0, z: 0, height: 4, radius: 6, color: 0x8FBC8F }
    ];

    hillPositions.forEach(hill => {
      const hillGeometry = new THREE.ConeGeometry(hill.radius, hill.height, 24);
      const hillMaterial = new THREE.MeshStandardMaterial({ 
        color: hill.color,
        roughness: 0.7,
        metalness: 0.0
      });
      const hillMesh = new THREE.Mesh(hillGeometry, hillMaterial);
      hillMesh.position.set(hill.x, hill.height/2 + 4, hill.z);
      hillMesh.castShadow = true;
      hillMesh.receiveShadow = true;
      scene.add(hillMesh);
    });
  }

  function createRoads() {
    // Create detailed road network
    const roadPaths = [
      // Main coastal road
      [
        new THREE.Vector3(-25, 4.1, -15),
        new THREE.Vector3(-20, 4.1, -10),
        new THREE.Vector3(-15, 4.1, -5),
        new THREE.Vector3(-10, 4.1, 0),
        new THREE.Vector3(-5, 4.1, 5),
        new THREE.Vector3(0, 4.1, 10),
        new THREE.Vector3(10, 4.1, 15),
        new THREE.Vector3(20, 4.1, 20),
        new THREE.Vector3(30, 4.1, 15),
        new THREE.Vector3(35, 4.1, 5),
        new THREE.Vector3(35, 4.1, -5),
        new THREE.Vector3(30, 4.1, -15),
        new THREE.Vector3(20, 4.1, -25),
        new THREE.Vector3(10, 4.1, -30),
        new THREE.Vector3(0, 4.1, -35),
        new THREE.Vector3(-10, 4.1, -30),
        new THREE.Vector3(-20, 4.1, -25),
        new THREE.Vector3(-25, 4.1, -15)
      ],
      // Secondary roads
      [
        new THREE.Vector3(-10, 4.1, -10),
        new THREE.Vector3(-5, 4.1, -5),
        new THREE.Vector3(0, 4.1, 0),
        new THREE.Vector3(5, 4.1, 5),
        new THREE.Vector3(10, 4.1, 10)
      ],
      [
        new THREE.Vector3(10, 4.1, -10),
        new THREE.Vector3(15, 4.1, -5),
        new THREE.Vector3(20, 4.1, 0),
        new THREE.Vector3(25, 4.1, 5)
      ]
    ];

    roadPaths.forEach((path, index) => {
      const roadGeometry = new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(path),
        128,
        2,
        12,
        false
      );
      const roadMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xD2B48C,
        roughness: 1.0,
        metalness: 0.0
      });
      const road = new THREE.Mesh(roadGeometry, roadMaterial);
      road.receiveShadow = true;
      scene.add(road);
    });
  }

  function createBuildings() {
    const buildingPositions = [
      // Main resort complex (west side)
      { x: -20, z: -12, type: 'resort', scale: [10, 5, 8], color: 0xF5F5DC, name: 'Курортный комплекс' },
      { x: -15, z: -8, type: 'resort', scale: [8, 4, 6], color: 0xF5F5DC, name: 'Главное здание' },
      { x: -25, z: -5, type: 'resort', scale: [6, 3, 5], color: 0xF5F5DC, name: 'Ресторан' },
      
      // Southwestern tip building with pool
      { x: -25, z: -25, type: 'pool', scale: [5, 3, 5], color: 0xFFFFFF, name: 'Вилла с бассейном' },
      
      // Eastern tip building
      { x: 30, z: -8, type: 'eastern', scale: [4, 3, 4], color: 0xFFFFFF, name: 'Исследовательский центр' },
      
      // Central structures
      { x: 0, z: 0, type: 'central', scale: [3, 2, 3], color: 0xFFFFFF, name: 'Библиотека' },
      { x: 8, z: 8, type: 'central', scale: [3, 2, 3], color: 0xFFFFFF, name: 'Лаборатория' }
    ];

    buildingPositions.forEach((building, index) => {
      // Main building
      const buildingGeometry = new THREE.BoxGeometry(...building.scale);
      const buildingMaterial = new THREE.MeshStandardMaterial({ 
        color: building.color,
        roughness: 0.3,
        metalness: 0.1
      });
      const buildingMesh = new THREE.Mesh(buildingGeometry, buildingMaterial);
      buildingMesh.position.set(building.x, building.scale[1]/2 + 4, building.z);
      buildingMesh.castShadow = true;
      buildingMesh.receiveShadow = true;
      scene.add(buildingMesh);

      // Roof
      const roofGeometry = new THREE.BoxGeometry(building.scale[0] + 1, 0.8, building.scale[2] + 1);
      const roofMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8B4513,
        roughness: 0.8
      });
      const roof = new THREE.Mesh(roofGeometry, roofMaterial);
      roof.position.set(building.x, building.scale[1] + 4.4, building.z);
      roof.castShadow = true;
      scene.add(roof);

      // Windows
      const windowGeometry = new THREE.BoxGeometry(1.5, 1.5, 0.1);
      const windowMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x87CEEB,
        transparent: true,
        opacity: 0.8
      });
      
      // Add multiple windows
      const windowPositions = [
        { x: building.x - building.scale[0]/3, y: building.scale[1]/2 + 4, z: building.z + building.scale[2]/2 + 0.1 },
        { x: building.x + building.scale[0]/3, y: building.scale[1]/2 + 4, z: building.z + building.scale[2]/2 + 0.1 },
        { x: building.x - building.scale[0]/3, y: building.scale[1]/2 + 4, z: building.z - building.scale[2]/2 - 0.1 },
        { x: building.x + building.scale[0]/3, y: building.scale[1]/2 + 4, z: building.z - building.scale[2]/2 - 0.1 }
      ];
      
      windowPositions.forEach(pos => {
        const window = new THREE.Mesh(windowGeometry, windowMaterial);
        window.position.set(pos.x, pos.y, pos.z);
        scene.add(window);
      });

      // Special features
      if (building.type === 'pool') {
        // Swimming pool
        const poolGeometry = new THREE.BoxGeometry(8, 0.8, 6);
        const poolMaterial = new THREE.MeshStandardMaterial({ 
          color: 0x00CED1,
          transparent: true,
          opacity: 0.9
        });
        const pool = new THREE.Mesh(poolGeometry, poolMaterial);
        pool.position.set(building.x, 4.4, building.z + 4);
        scene.add(pool);
      }

      if (building.type === 'resort') {
        // Pier/dock
        const pierGeometry = new THREE.BoxGeometry(1.5, 0.5, 12);
        const pierMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const pier = new THREE.Mesh(pierGeometry, pierMaterial);
        pier.position.set(building.x, 2.25, building.z - 8);
        pier.castShadow = true;
        scene.add(pier);
      }

      // Add to houses array for interaction
      if (building.type === 'resort' || building.type === 'central') {
        houses.push({
          base: buildingMesh,
          roof,
          position: { x: building.x, z: building.z },
          type: building.type === 'central' ? 'psychotypes' : 'support',
          label: building.name,
          icon: building.type === 'central' ? '🧠' : '💬',
          isHovered: false
        });
      }
    });
  }

  function createVegetation() {
    // Create detailed vegetation
    const vegetationPositions = [];
    for (let i = 0; i < 80; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 25 + 8;
      vegetationPositions.push({
        x: Math.cos(angle) * radius,
        z: Math.sin(angle) * radius,
        type: Math.random() > 0.7 ? 'bush' : 'grass'
      });
    }

    vegetationPositions.forEach(pos => {
      if (pos.type === 'bush') {
        // Scrubby bushes
        const bushGeometry = new THREE.SphereGeometry(Math.random() * 0.8 + 0.4, 8, 6);
        const bushMaterial = new THREE.MeshStandardMaterial({ 
          color: Math.random() > 0.5 ? 0x6B8E23 : 0x8FBC8F,
          roughness: 0.8
        });
        const bush = new THREE.Mesh(bushGeometry, bushMaterial);
        bush.position.set(pos.x, Math.random() * 3 + 4, pos.z);
        bush.castShadow = true;
        scene.add(bush);
      } else {
        // Grass patches
        const grassGeometry = new THREE.CylinderGeometry(0.2, 0.2, Math.random() * 1 + 0.5, 6);
        const grassMaterial = new THREE.MeshStandardMaterial({ 
          color: 0x228B22,
          roughness: 0.9
        });
        const grass = new THREE.Mesh(grassGeometry, grassMaterial);
        grass.position.set(pos.x, (Math.random() * 1 + 0.5) / 2 + 4, pos.z);
        grass.castShadow = true;
        scene.add(grass);
      }
    });

    // Add palm trees near buildings
    const palmPositions = [
      { x: -20, z: -12 },
      { x: -15, z: -8 },
      { x: -25, z: -5 },
      { x: -25, z: -25 },
      { x: 30, z: -8 },
      { x: 0, z: 0 },
      { x: 8, z: 8 }
    ];

    palmPositions.forEach(pos => {
      // Palm trunk
      const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, 8, 12);
      const trunkMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8B4513,
        roughness: 0.9
      });
      const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
      trunk.position.set(pos.x, 8, pos.z);
      trunk.castShadow = true;
      scene.add(trunk);
      
      // Palm leaves
      const leavesGeometry = new THREE.SphereGeometry(3, 12, 8);
      const leavesMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x228B22,
        roughness: 0.7
      });
      const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
      leaves.position.set(pos.x, 12, pos.z);
      leaves.scale.set(1, 1.5, 1);
      leaves.castShadow = true;
      scene.add(leaves);
      
      palmTrees.push({ trunk, leaves, position: pos });
    });
  }

  function createCoastalFeatures() {
    // Create detailed beach
    const beachShape = new THREE.Shape();
    beachShape.moveTo(-30, -20);
    beachShape.bezierCurveTo(-25, -25, -20, -30, -15, -30);
    beachShape.bezierCurveTo(-10, -30, -5, -25, 0, -20);
    beachShape.bezierCurveTo(5, -15, 10, -10, 15, -10);
    beachShape.bezierCurveTo(20, -10, 25, -15, 30, -20);
    
    const beachGeometry = new THREE.ShapeGeometry(beachShape);
    const beachMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xF4A460,
      roughness: 1.0
    });
    const beach = new THREE.Mesh(beachGeometry, beachMaterial);
    beach.rotation.x = -Math.PI/2;
    beach.position.y = 4.05;
    beach.receiveShadow = true;
    scene.add(beach);

    // Create rocky cliffs
    const cliffPositions = [
      { x: -40, z: 0, length: 20, height: 6 },
      { x: 40, z: -15, length: 18, height: 5 },
      { x: 0, z: 40, length: 15, height: 4 }
    ];

    cliffPositions.forEach(cliff => {
      const cliffGeometry = new THREE.BoxGeometry(cliff.length, cliff.height, 3);
      const cliffMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x696969,
        roughness: 0.9
      });
      const cliffMesh = new THREE.Mesh(cliffGeometry, cliffMaterial);
      cliffMesh.position.set(cliff.x, cliff.height/2 + 4, cliff.z);
      cliffMesh.castShadow = true;
      cliffMesh.receiveShadow = true;
      scene.add(cliffMesh);
    });
  }

  function createIslets() {
    // Create small islets
    const isletPositions = [
      { x: -45, z: -30, scale: 3, height: 4 },
      { x: -50, z: -25, scale: 2, height: 3 },
      { x: -40, z: -35, scale: 1.5, height: 2 },
      { x: 55, z: 0, scale: 4, height: 5 }
    ];

    isletPositions.forEach(islet => {
      const isletGeometry = new THREE.CylinderGeometry(islet.scale, islet.scale, islet.height, 16);
      const isletMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x696969,
        roughness: 0.8
      });
      const isletMesh = new THREE.Mesh(isletGeometry, isletMaterial);
      isletMesh.position.set(islet.x, islet.height/2, islet.z);
      isletMesh.castShadow = true;
      isletMesh.receiveShadow = true;
      scene.add(isletMesh);
    });
  }

  function createAtmosphere() {
    // Add atmospheric particles
    for (let i = 0; i < 150; i++) {
      const particleGeometry = new THREE.SphereGeometry(0.1, 4, 4);
      const particleMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xd6c7b8,
        transparent: true,
        opacity: 0.3
      });
      const particle = new THREE.Mesh(particleGeometry, particleMaterial);
      particle.position.set(
        (Math.random() - 0.5) * 200,
        Math.random() * 50 + 20,
        (Math.random() - 0.5) * 200
      );
      scene.add(particle);
    }
  }

  function animate() {
    animationId = requestAnimationFrame(animate);
    
    const time = Date.now() * 0.001;
    
    // Animate water
    waterParticles.forEach(particle => {
      particle.material.uniforms.uTime.value = time;
    });
    
    // Animate palm trees
    palmTrees.forEach(palm => {
      const sway = Math.sin(time * 0.5 + palm.position.x * 0.1) * 0.15;
      palm.leaves.rotation.z = sway;
    });
    
    // Animate buildings (subtle glow effect)
    houses.forEach(house => {
      if (house.isHovered) {
        house.base.material.emissive.setHex(0x3a4f4a);
        house.base.material.emissiveIntensity = 0.2;
      } else {
        house.base.material.emissive.setHex(0x000000);
        house.base.material.emissiveIntensity = 0;
      }
    });
    
    controls.update();
    renderer.render(scene, camera);
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function setupInteraction() {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    function onMouseMove(event) {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const houseMeshes = houses.map(h => h.base);
      const intersects = raycaster.intersectObjects(houseMeshes);

      houses.forEach(house => {
        house.isHovered = false;
      });

      if (intersects.length > 0) {
        const intersectedHouse = houses.find(h => h.base === intersects[0].object);
        if (intersectedHouse) {
          intersectedHouse.isHovered = true;
          showHouseLabel(intersectedHouse, event);
        }
      } else {
        hideAllLabels();
      }
    }

    function onClick(event) {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const houseMeshes = houses.map(h => h.base);
      const intersects = raycaster.intersectObjects(houseMeshes);

      if (intersects.length > 0) {
        const intersectedHouse = houses.find(h => h.base === intersects[0].object);
        if (intersectedHouse) {
          handleHouseClick(intersectedHouse);
        }
      }
    }

    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('click', onClick);
    renderer.domElement.addEventListener('touchend', (e) => {
      if (e.touches.length === 0) onClick(e);
    });
  }

  function showHouseLabel(house, event) {
    const label = document.getElementById(`${house.type}-label`);
    if (label) {
      label.style.left = event.clientX + 10 + 'px';
      label.style.top = event.clientY - 50 + 'px';
      label.classList.add('visible');
    }
  }

  function hideAllLabels() {
    document.querySelectorAll('.house-label').forEach(label => {
      label.classList.remove('visible');
    });
  }

  function handleHouseClick(house) {
    if (house.type === 'psychotypes') {
      openInteriorDOM();
    } else if (house.type === 'materials') {
      toast("Раздел «Материалы» скоро будет доступен");
    } else if (house.type === 'support') {
      toast("Откройте поддержку через главное меню");
    }
  }

  function openInteriorDOM() {
    overlay.classList.remove('hidden');
    buildBookCards();
  }

  function buildBookCards() {
    const booksGrid = document.getElementById('booksGrid');
    booksGrid.innerHTML = '';
    
    BOOKS.forEach(book => {
      const card = document.createElement('div');
      card.className = 'book-card';
      card.dataset.bookId = book.id;
      
      card.innerHTML = `
        <div class="book-cover" style="background: linear-gradient(135deg, ${book.color}, ${book.color}dd);">
          <div style="font-size: 2rem;">${book.cover}</div>
        </div>
        <div class="book-title">${book.title}</div>
        <div class="book-author">${book.author}</div>
      `;
      
      card.addEventListener('click', () => {
        document.querySelectorAll('.book-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedBook = book;
        
        setTimeout(() => {
          openBookReader(book);
        }, 300);
      });
      
      booksGrid.appendChild(card);
    });
    
    bookPanel.classList.remove('hidden');
  }

  function openBookReader(book) {
    document.getElementById('bookReaderTitle').textContent = book.title;
    document.getElementById('bookReaderAuthor').textContent = book.author;
    document.getElementById('coverTitle').textContent = book.title;
    document.getElementById('coverSubtitle').textContent = book.description;
    document.getElementById('coverAuthor').textContent = book.author;
    
    bookReader.classList.remove('hidden');
    overlay.classList.add('hidden');
  }

  function closeBookReader() {
    bookReader.classList.add('hidden');
    overlay.classList.remove('hidden');
    selectedBook = null;
  }

  function readInChannel() {
    if (selectedBook) {
      if (tg && tg.openTelegramLink) {
        tg.openTelegramLink(selectedBook.url);
      } else {
        window.open(selectedBook.url, '_blank');
      }
    }
  }

  function bookmarkBook() {
    if (selectedBook) {
      toast(`Книга "${selectedBook.title}" добавлена в закладки`);
    }
  }

  function showIslandInfo() {
    islandInfo.classList.remove('hidden');
  }

  function hideIslandInfo() {
    islandInfo.classList.add('hidden');
  }

  function resetView() {
    camera.position.set(0, 150, 100);
    controls.target.set(0, 0, 0);
    controls.update();
    toast("Вид сброшен");
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      isFullscreen = true;
    } else {
      document.exitFullscreen();
      isFullscreen = false;
    }
  }

  function showProgressIndicator() {
    progressIndicator.classList.remove('hidden');
  }

  function hideProgressIndicator() {
    progressIndicator.classList.add('hidden');
  }

  function toast(msg) {
    const el = document.createElement('div');
    el.textContent = msg;
    el.style.position = 'fixed';
    el.style.left = '50%';
    el.style.bottom = '70px';
    el.style.transform = 'translateX(-50%)';
    el.style.padding = '12px 18px';
    el.style.borderRadius = '12px';
    el.style.background = 'rgba(0,0,0,.85)';
    el.style.color = '#fff';
    el.style.fontWeight = '700';
    el.style.fontFamily = 'Inter,system-ui';
    el.style.border = '1px solid rgba(255,255,255,.2)';
    el.style.zIndex = '999';
    el.style.backdropFilter = 'blur(10px)';
    document.body.appendChild(el);
    
    setTimeout(() => {
      el.style.transition = 'opacity .25s';
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 250);
    }, 2000);
  }

  // Event listeners
  document.getElementById('closeInterior').addEventListener('click', () => {
    overlay.classList.add('hidden');
    bookPanel.classList.add('hidden');
  });

  document.getElementById('closeBook').addEventListener('click', closeBookReader);
  document.getElementById('readInChannelBtn').addEventListener('click', readInChannel);
  document.getElementById('bookmarkBtn').addEventListener('click', bookmarkBook);
  
  // Control panel
  document.getElementById('infoBtn').addEventListener('click', showIslandInfo);
  document.getElementById('closeInfo').addEventListener('click', hideIslandInfo);
  document.getElementById('resetViewBtn').addEventListener('click', resetView);
  document.getElementById('fullscreenBtn').addEventListener('click', toggleFullscreen);

  // Initialize 3D scene
  if (!initThreeJS()) {
    console.log('Falling back to 2D mode');
    // Could implement 2D fallback here
  }
})();