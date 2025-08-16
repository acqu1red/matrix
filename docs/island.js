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
  let animatedObjects = [];
  let currentHoveredHouse = null;
  let selectedBook = null;
  let isFullscreen = false;
  let animationId;

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

  function initThreeJS() {
    if (!checkWebGL()) return false;

    try {
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
      renderer.toneMappingExposure = 1.4;
      renderer.outputEncoding = THREE.sRGBEncoding;

      scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x87ceeb, 0.003);

      camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.set(0, 180, 120);

      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.screenSpacePanning = false;
      controls.minDistance = 100;
      controls.maxDistance = 400;
      controls.minPolarAngle = Math.PI / 3.5;
      controls.maxPolarAngle = Math.PI / 2.1;
      controls.target.set(0, 0, 0);
      controls.update();

      createLighting();
      createOcean();
      createColorfulIsland();
      createRoads();
      createAnimatedBuildings();
      createLushVegetation();
      createCoastalFeatures();
      createIslets();
      createAtmosphere();
      createParticleEffects();

      animate();
      window.addEventListener('resize', onWindowResize);
      setupInteraction();
      return true;
    } catch (error) {
      console.error('Three.js initialization failed:', error);
      webglFallback.classList.remove('hidden');
      return false;
    }
  }

  function createLighting() {
    const ambientLight = new THREE.AmbientLight(0x87ceeb, 0.6);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x2d5a27, 0.8);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.8);
    dirLight.position.set(50, 120, 50);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 4096;
    dirLight.shadow.mapSize.height = 4096;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 400;
    dirLight.shadow.camera.left = -200;
    dirLight.shadow.camera.right = 200;
    dirLight.shadow.camera.top = 200;
    dirLight.shadow.camera.bottom = -200;
    scene.add(dirLight);

    const pointLight1 = new THREE.PointLight(0xffd700, 1.2, 150);
    pointLight1.position.set(-30, 40, -30);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x87ceeb, 0.8, 120);
    pointLight2.position.set(40, 30, 40);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0xff6b6b, 0.6, 100);
    pointLight3.position.set(0, 25, 0);
    scene.add(pointLight3);
  }

  function createOcean() {
    const oceanGeometry = new THREE.PlaneGeometry(800, 800, 256, 256);
    
    const oceanMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uShallowColor: { value: new THREE.Color(0x00d4ff) },
        uDeepColor: { value: new THREE.Color(0x006994) },
        uWaveSpeed: { value: 0.6 },
        uWaveHeight: { value: 1.2 },
        uWaveFrequency: { value: 0.08 }
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
          
          float wave1 = sin((p.x + uTime * uWaveSpeed) * uWaveFrequency) * uWaveHeight;
          float wave2 = cos((p.y - uTime * uWaveSpeed * 0.7) * uWaveFrequency * 0.9) * uWaveHeight * 0.8;
          float wave3 = sin((p.x + p.y + uTime * uWaveSpeed * 1.3) * uWaveFrequency * 0.7) * uWaveHeight * 0.6;
          float wave4 = cos((p.x - p.y + uTime * uWaveSpeed * 0.5) * uWaveFrequency * 0.5) * uWaveHeight * 0.4;
          
          p.z += wave1 + wave2 + wave3 + wave4;
          
          float distFromCenter = length(p.xy);
          vDepth = smoothstep(0.0, 400.0, distFromCenter);
          
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
          
          float foam = sin(vUv.x * 120.0) * sin(vUv.y * 120.0) * 0.2;
          waterColor += foam;
          
          gl_FragColor = vec4(waterColor, 0.9);
        }
      `,
      side: THREE.DoubleSide,
      transparent: true
    });
    
    const ocean = new THREE.Mesh(oceanGeometry, oceanMaterial);
    ocean.rotation.x = -Math.PI / 2;
    ocean.position.y = -8;
    ocean.receiveShadow = true;
    scene.add(ocean);
    
    waterParticles.push({ mesh: ocean, material: oceanMaterial });
  }

  function createColorfulIsland() {
    const islandShape = new THREE.Shape();
    
    islandShape.moveTo(-40, -25);
    islandShape.bezierCurveTo(-50, -20, -55, 0, -50, 20);
    islandShape.bezierCurveTo(-45, 40, -35, 45, -25, 45);
    islandShape.bezierCurveTo(-15, 45, -5, 40, 5, 35);
    islandShape.bezierCurveTo(15, 30, 25, 25, 35, 15);
    islandShape.bezierCurveTo(45, 5, 50, -5, 50, -20);
    islandShape.bezierCurveTo(50, -35, 45, -45, 35, -50);
    islandShape.bezierCurveTo(25, -55, 15, -55, 5, -50);
    islandShape.bezierCurveTo(-5, -45, -15, -40, -25, -35);
    islandShape.bezierCurveTo(-35, -30, -40, -25, -40, -25);
    
    const extrudeSettings = {
      depth: 15,
      bevelEnabled: true,
      bevelSegments: 8,
      steps: 4,
      bevelSize: 3,
      bevelThickness: 3
    };
    
    const islandGeometry = new THREE.ExtrudeGeometry(islandShape, extrudeSettings);
    
    const islandMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x90EE90,
      roughness: 0.6,
      metalness: 0.1
    });
    
    const island = new THREE.Mesh(islandGeometry, islandMaterial);
    island.position.y = 6;
    island.castShadow = true;
    island.receiveShadow = true;
    scene.add(island);

    createElevation();
  }

  function createElevation() {
    const hillPositions = [
      { x: -20, z: 12, height: 15, radius: 18, color: 0x90EE90, type: 'grass' },
      { x: 12, z: 20, height: 18, radius: 22, color: 0x32CD32, type: 'forest' },
      { x: 25, z: -10, height: 10, radius: 12, color: 0x98FB98, type: 'meadow' },
      { x: -10, z: -20, height: 12, radius: 15, color: 0x7CFC00, type: 'hills' },
      { x: 0, z: 0, height: 8, radius: 10, color: 0xADFF2F, type: 'center' },
      { x: -30, z: -15, height: 6, radius: 8, color: 0x9ACD32, type: 'small' },
      { x: 35, z: 5, height: 7, radius: 9, color: 0x6B8E23, type: 'rocky' }
    ];

    hillPositions.forEach(hill => {
      const hillGeometry = new THREE.ConeGeometry(hill.radius, hill.height, 32);
      const hillMaterial = new THREE.MeshStandardMaterial({ 
        color: hill.color,
        roughness: 0.5,
        metalness: 0.0
      });
      const hillMesh = new THREE.Mesh(hillGeometry, hillMaterial);
      hillMesh.position.set(hill.x, hill.height/2 + 6, hill.z);
      hillMesh.castShadow = true;
      hillMesh.receiveShadow = true;
      scene.add(hillMesh);

      if (hill.type === 'forest') {
        createForestOnHill(hill.x, hill.z, hill.radius);
      } else if (hill.type === 'meadow') {
        createFlowersOnHill(hill.x, hill.z, hill.radius);
      }
    });
  }

  function createForestOnHill(centerX, centerZ, radius) {
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * radius * 0.8;
      const x = centerX + Math.cos(angle) * r;
      const z = centerZ + Math.sin(angle) * r;
      
      const treeGeometry = new THREE.ConeGeometry(2, 8, 8);
      const treeMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x228B22,
        roughness: 0.7
      });
      const tree = new THREE.Mesh(treeGeometry, treeMaterial);
      tree.position.set(x, 12, z);
      tree.castShadow = true;
      scene.add(tree);
    }
  }

  function createFlowersOnHill(centerX, centerZ, radius) {
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * radius * 0.7;
      const x = centerX + Math.cos(angle) * r;
      const z = centerZ + Math.sin(angle) * r;
      
      const flowerColors = [0xFF69B4, 0xFFB6C1, 0xFF1493, 0xFFC0CB, 0xFF69B4];
      const flowerGeometry = new THREE.SphereGeometry(0.3, 6, 6);
      const flowerMaterial = new THREE.MeshStandardMaterial({ 
        color: flowerColors[Math.floor(Math.random() * flowerColors.length)],
        roughness: 0.3
      });
      const flower = new THREE.Mesh(flowerGeometry, flowerMaterial);
      flower.position.set(x, 8, z);
      scene.add(flower);
    }
  }

  function createRoads() {
    const roadPaths = [
      [
        new THREE.Vector3(-35, 6.1, -20),
        new THREE.Vector3(-25, 6.1, -15),
        new THREE.Vector3(-15, 6.1, -10),
        new THREE.Vector3(-5, 6.1, -5),
        new THREE.Vector3(5, 6.1, 0),
        new THREE.Vector3(15, 6.1, 5),
        new THREE.Vector3(25, 6.1, 10),
        new THREE.Vector3(35, 6.1, 15),
        new THREE.Vector3(40, 6.1, 5),
        new THREE.Vector3(40, 6.1, -5),
        new THREE.Vector3(35, 6.1, -15),
        new THREE.Vector3(25, 6.1, -25),
        new THREE.Vector3(15, 6.1, -30),
        new THREE.Vector3(5, 6.1, -35),
        new THREE.Vector3(-5, 6.1, -30),
        new THREE.Vector3(-15, 6.1, -25),
        new THREE.Vector3(-25, 6.1, -20),
        new THREE.Vector3(-35, 6.1, -20)
      ],
      [
        new THREE.Vector3(-15, 6.1, -15),
        new THREE.Vector3(-5, 6.1, -10),
        new THREE.Vector3(0, 6.1, 0),
        new THREE.Vector3(5, 6.1, 10),
        new THREE.Vector3(15, 6.1, 15)
      ],
      [
        new THREE.Vector3(15, 6.1, -15),
        new THREE.Vector3(25, 6.1, -10),
        new THREE.Vector3(30, 6.1, 0),
        new THREE.Vector3(35, 6.1, 10)
      ]
    ];

    roadPaths.forEach((path, index) => {
      const roadGeometry = new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(path),
        128,
        2.5,
        12,
        false
      );
      const roadMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xF4A460,
        roughness: 0.8,
        metalness: 0.0
      });
      const road = new THREE.Mesh(roadGeometry, roadMaterial);
      road.receiveShadow = true;
      scene.add(road);
    });
  }

  function createAnimatedBuildings() {
    const buildingPositions = [
      { x: -25, z: -15, type: 'resort', scale: [12, 6, 10], color: 0xFFE4B5, name: 'Курортный комплекс', glowColor: 0xFFD700 },
      { x: -20, z: -10, type: 'resort', scale: [10, 5, 8], color: 0xFFF8DC, name: 'Главное здание', glowColor: 0xFFA500 },
      { x: -30, z: -8, type: 'resort', scale: [8, 4, 6], color: 0xFFE4E1, name: 'Ресторан', glowColor: 0xFF6347 },
      
      { x: -30, z: -30, type: 'pool', scale: [6, 4, 6], color: 0xE0FFFF, name: 'Вилла с бассейном', glowColor: 0x00CED1 },
      
      { x: 35, z: -10, type: 'eastern', scale: [5, 4, 5], color: 0xF0F8FF, name: 'Исследовательский центр', glowColor: 0x4169E1 },
      
      { x: 0, z: 0, type: 'central', scale: [4, 3, 4], color: 0xFFFACD, name: 'Библиотека', glowColor: 0xFFD700 },
      { x: 10, z: 10, type: 'central', scale: [4, 3, 4], color: 0xF0FFF0, name: 'Лаборатория', glowColor: 0x32CD32 }
    ];

    buildingPositions.forEach((building, index) => {
      const buildingGeometry = new THREE.BoxGeometry(...building.scale);
      const buildingMaterial = new THREE.MeshStandardMaterial({ 
        color: building.color,
        roughness: 0.2,
        metalness: 0.1
      });
      const buildingMesh = new THREE.Mesh(buildingGeometry, buildingMaterial);
      buildingMesh.position.set(building.x, building.scale[1]/2 + 6, building.z);
      buildingMesh.castShadow = true;
      buildingMesh.receiveShadow = true;
      scene.add(buildingMesh);

      const roofGeometry = new THREE.BoxGeometry(building.scale[0] + 1.5, 1, building.scale[2] + 1.5);
      const roofMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8B4513,
        roughness: 0.6
      });
      const roof = new THREE.Mesh(roofGeometry, roofMaterial);
      roof.position.set(building.x, building.scale[1] + 6.5, building.z);
      roof.castShadow = true;
      scene.add(roof);

      const windowGeometry = new THREE.BoxGeometry(2, 2, 0.1);
      const windowMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x87CEEB,
        transparent: true,
        opacity: 0.9
      });
      
      const windowPositions = [
        { x: building.x - building.scale[0]/3, y: building.scale[1]/2 + 6, z: building.z + building.scale[2]/2 + 0.1 },
        { x: building.x + building.scale[0]/3, y: building.scale[1]/2 + 6, z: building.z + building.scale[2]/2 + 0.1 },
        { x: building.x - building.scale[0]/3, y: building.scale[1]/2 + 6, z: building.z - building.scale[2]/2 - 0.1 },
        { x: building.x + building.scale[0]/3, y: building.scale[1]/2 + 6, z: building.z - building.scale[2]/2 - 0.1 }
      ];
      
      windowPositions.forEach(pos => {
        const window = new THREE.Mesh(windowGeometry, windowMaterial);
        window.position.set(pos.x, pos.y, pos.z);
        scene.add(window);
      });

      if (building.type === 'pool') {
        const poolGeometry = new THREE.BoxGeometry(10, 1, 8);
        const poolMaterial = new THREE.MeshStandardMaterial({ 
          color: 0x00CED1,
          transparent: true,
          opacity: 0.95
        });
        const pool = new THREE.Mesh(poolGeometry, poolMaterial);
        pool.position.set(building.x, 6.5, building.z + 5);
        scene.add(pool);
      }

      if (building.type === 'resort') {
        const pierGeometry = new THREE.BoxGeometry(2, 0.6, 15);
        const pierMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const pier = new THREE.Mesh(pierGeometry, pierMaterial);
        pier.position.set(building.x, 3.3, building.z - 10);
        pier.castShadow = true;
        scene.add(pier);
      }

      if (building.type === 'resort' || building.type === 'central') {
        houses.push({
          base: buildingMesh,
          roof,
          position: { x: building.x, z: building.z },
          type: building.type === 'central' ? 'psychotypes' : 'support',
          label: building.name,
          icon: building.type === 'central' ? '🧠' : '💬',
          isHovered: false,
          glowColor: building.glowColor,
          originalColor: building.color,
          animationOffset: index * 0.5
        });
      }
    });
  }

  function createLushVegetation() {
    const vegetationPositions = [];
    for (let i = 0; i < 150; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 35 + 10;
      vegetationPositions.push({
        x: Math.cos(angle) * radius,
        z: Math.sin(angle) * radius,
        type: Math.random() > 0.5 ? 'bush' : 'grass'
      });
    }

    vegetationPositions.forEach(pos => {
      if (pos.type === 'bush') {
        const bushGeometry = new THREE.SphereGeometry(Math.random() * 1.5 + 0.8, 12, 10);
        const bushColors = [0x228B22, 0x32CD32, 0x90EE90, 0x98FB98, 0x7CFC00, 0x00FF00, 0x00FA9A, 0x00CED1];
        const bushMaterial = new THREE.MeshStandardMaterial({ 
          color: bushColors[Math.floor(Math.random() * bushColors.length)],
          roughness: 0.5
        });
        const bush = new THREE.Mesh(bushGeometry, bushMaterial);
        bush.position.set(pos.x, Math.random() * 5 + 6, pos.z);
        bush.castShadow = true;
        scene.add(bush);
        
        // Add flowers on some bushes
        if (Math.random() > 0.7) {
          const flowerColors = [0xFF69B4, 0xFFB6C1, 0xFF1493, 0xFFC0CB, 0xFF69B4, 0xFFD700, 0xFFA500];
          const flowerGeometry = new THREE.SphereGeometry(0.2, 6, 6);
          const flowerMaterial = new THREE.MeshStandardMaterial({ 
            color: flowerColors[Math.floor(Math.random() * flowerColors.length)],
            roughness: 0.2
          });
          const flower = new THREE.Mesh(flowerGeometry, flowerMaterial);
          flower.position.set(pos.x, Math.random() * 3 + 8, pos.z);
          scene.add(flower);
        }
      } else {
        const grassGeometry = new THREE.CylinderGeometry(0.4, 0.4, Math.random() * 2 + 1, 10);
        const grassColors = [0x228B22, 0x32CD32, 0x90EE90, 0x98FB98];
        const grassMaterial = new THREE.MeshStandardMaterial({ 
          color: grassColors[Math.floor(Math.random() * grassColors.length)],
          roughness: 0.7
        });
        const grass = new THREE.Mesh(grassGeometry, grassMaterial);
        grass.position.set(pos.x, (Math.random() * 2 + 1) / 2 + 6, pos.z);
        grass.castShadow = true;
        scene.add(grass);
      }
    });

    const palmPositions = [
      { x: -25, z: -15 },
      { x: -20, z: -10 },
      { x: -30, z: -8 },
      { x: -30, z: -30 },
      { x: 35, z: -10 },
      { x: 0, z: 0 },
      { x: 10, z: 10 },
      { x: -15, z: 15 },
      { x: 20, z: 20 },
      { x: -35, z: 5 },
      { x: 25, z: 15 },
      { x: -10, z: 25 },
      { x: 15, z: -20 },
      { x: -40, z: 10 },
      { x: 30, z: 25 }
    ];

    palmPositions.forEach((pos, index) => {
      const trunkGeometry = new THREE.CylinderGeometry(0.4, 0.5, 10, 16);
      const trunkMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8B4513,
        roughness: 0.8
      });
      const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
      trunk.position.set(pos.x, 13, pos.z);
      trunk.castShadow = true;
      scene.add(trunk);
      
      const leavesGeometry = new THREE.SphereGeometry(4, 16, 12);
      const leavesMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x228B22,
        roughness: 0.5
      });
      const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
      leaves.position.set(pos.x, 18, pos.z);
      leaves.scale.set(1, 1.8, 1);
      leaves.castShadow = true;
      scene.add(leaves);
      
      palmTrees.push({ 
        trunk, 
        leaves, 
        position: pos,
        animationOffset: index * 0.3
      });
    });
  }

  function createCoastalFeatures() {
    const beachShape = new THREE.Shape();
    beachShape.moveTo(-40, -25);
    beachShape.bezierCurveTo(-35, -30, -30, -35, -25, -35);
    beachShape.bezierCurveTo(-20, -35, -15, -30, -10, -25);
    beachShape.bezierCurveTo(-5, -20, 0, -15, 5, -15);
    beachShape.bezierCurveTo(10, -15, 15, -20, 20, -25);
    beachShape.bezierCurveTo(25, -30, 30, -35, 35, -30);
    beachShape.bezierCurveTo(40, -25, 40, -20, 35, -15);
    
    const beachGeometry = new THREE.ShapeGeometry(beachShape);
    const beachMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xF4A460,
      roughness: 0.9
    });
    const beach = new THREE.Mesh(beachGeometry, beachMaterial);
    beach.rotation.x = -Math.PI/2;
    beach.position.y = 6.05;
    beach.receiveShadow = true;
    scene.add(beach);

    const cliffPositions = [
      { x: -50, z: 0, length: 25, height: 8 },
      { x: 50, z: -20, length: 22, height: 7 },
      { x: 0, z: 50, length: 20, height: 6 }
    ];

    cliffPositions.forEach(cliff => {
      const cliffGeometry = new THREE.BoxGeometry(cliff.length, cliff.height, 4);
      const cliffMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x696969,
        roughness: 0.9
      });
      const cliffMesh = new THREE.Mesh(cliffGeometry, cliffMaterial);
      cliffMesh.position.set(cliff.x, cliff.height/2 + 6, cliff.z);
      cliffMesh.castShadow = true;
      cliffMesh.receiveShadow = true;
      scene.add(cliffMesh);
    });
  }

  function createIslets() {
    const isletPositions = [
      { x: -55, z: -35, scale: 4, height: 5 },
      { x: -60, z: -30, scale: 3, height: 4 },
      { x: -50, z: -40, scale: 2, height: 3 },
      { x: 65, z: 0, scale: 5, height: 6 },
      { x: 60, z: 15, scale: 3, height: 4 }
    ];

    isletPositions.forEach(islet => {
      const isletGeometry = new THREE.CylinderGeometry(islet.scale, islet.scale, islet.height, 20);
      const isletMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x696969,
        roughness: 0.7
      });
      const isletMesh = new THREE.Mesh(isletGeometry, isletMaterial);
      isletMesh.position.set(islet.x, islet.height/2, islet.z);
      isletMesh.castShadow = true;
      isletMesh.receiveShadow = true;
      scene.add(isletMesh);
    });
  }

  function createAtmosphere() {
    for (let i = 0; i < 200; i++) {
      const particleGeometry = new THREE.SphereGeometry(0.15, 6, 6);
      const particleMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xd6c7b8,
        transparent: true,
        opacity: 0.4
      });
      const particle = new THREE.Mesh(particleGeometry, particleMaterial);
      particle.position.set(
        (Math.random() - 0.5) * 300,
        Math.random() * 60 + 30,
        (Math.random() - 0.5) * 300
      );
      scene.add(particle);
    }
  }

  function createParticleEffects() {
    for (let i = 0; i < 80; i++) {
      const sparkleGeometry = new THREE.SphereGeometry(0.15, 6, 6);
      const sparkleColors = [0xFFFF00, 0xFFD700, 0xFFA500, 0xFF69B4, 0x00CED1, 0x98FB98];
      const sparkleMaterial = new THREE.MeshBasicMaterial({ 
        color: sparkleColors[Math.floor(Math.random() * sparkleColors.length)],
        transparent: true,
        opacity: 0.9
      });
      const sparkle = new THREE.Mesh(sparkleGeometry, sparkleMaterial);
      sparkle.position.set(
        (Math.random() - 0.5) * 120,
        Math.random() * 25 + 15,
        (Math.random() - 0.5) * 120
      );
      animatedObjects.push({
        mesh: sparkle,
        type: 'sparkle',
        speed: Math.random() * 3 + 1.5,
        amplitude: Math.random() * 3 + 2,
        rotationSpeed: Math.random() * 0.1 + 0.05
      });
      scene.add(sparkle);
    }
    
    // Add floating leaves
    for (let i = 0; i < 30; i++) {
      const leafGeometry = new THREE.SphereGeometry(0.2, 4, 4);
      const leafMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x90EE90,
        transparent: true,
        opacity: 0.7
      });
      const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
      leaf.position.set(
        (Math.random() - 0.5) * 80,
        Math.random() * 15 + 8,
        (Math.random() - 0.5) * 80
      );
      animatedObjects.push({
        mesh: leaf,
        type: 'leaf',
        speed: Math.random() * 2 + 1,
        amplitude: Math.random() * 2 + 1,
        rotationSpeed: Math.random() * 0.05 + 0.02
      });
      scene.add(leaf);
    }
  }

  function animate() {
    animationId = requestAnimationFrame(animate);
    
    const time = Date.now() * 0.001;
    
    waterParticles.forEach(particle => {
      particle.material.uniforms.uTime.value = time;
    });
    
    palmTrees.forEach(palm => {
      const sway = Math.sin(time * 0.6 + palm.animationOffset) * 0.3;
      const swayX = Math.sin(time * 0.4 + palm.animationOffset) * 0.15;
      const swayY = Math.sin(time * 0.5 + palm.animationOffset) * 0.1;
      
      palm.leaves.rotation.z = sway;
      palm.leaves.rotation.x = swayX;
      palm.leaves.rotation.y = swayY;
      
      // Add subtle trunk movement
      palm.trunk.rotation.z = Math.sin(time * 0.2 + palm.animationOffset) * 0.05;
    });
    
    houses.forEach(house => {
      const hoverEffect = house.isHovered ? 1 : 0;
      const glowIntensity = hoverEffect * 0.5;
      const floatOffset = Math.sin(time * 1.5 + house.animationOffset) * 0.5;
      const rotationOffset = Math.sin(time * 0.8 + house.animationOffset) * 0.02;
      
      house.base.material.emissive.setHex(house.glowColor);
      house.base.material.emissiveIntensity = glowIntensity;
      house.base.position.y = house.base.position.y + floatOffset * 0.01;
      house.base.rotation.y = rotationOffset;
      
      if (house.isHovered) {
        house.base.scale.setScalar(1.1);
        house.base.material.color.setHex(house.glowColor);
        house.roof.scale.setScalar(1.1);
        house.roof.material.emissive.setHex(0xFFD700);
        house.roof.material.emissiveIntensity = 0.3;
      } else {
        house.base.scale.setScalar(1);
        house.base.material.color.setHex(house.originalColor);
        house.roof.scale.setScalar(1);
        house.roof.material.emissive.setHex(0x000000);
        house.roof.material.emissiveIntensity = 0;
      }
    });
    
    animatedObjects.forEach(obj => {
      if (obj.type === 'sparkle') {
        obj.mesh.position.y += Math.sin(time * obj.speed) * obj.amplitude * 0.01;
        obj.mesh.rotation.y += obj.rotationSpeed;
        obj.mesh.rotation.x += obj.rotationSpeed * 0.5;
        obj.mesh.material.opacity = 0.6 + Math.sin(time * 2) * 0.3;
        obj.mesh.scale.setScalar(0.8 + Math.sin(time * 3) * 0.2);
      } else if (obj.type === 'leaf') {
        obj.mesh.position.y += Math.sin(time * obj.speed) * obj.amplitude * 0.005;
        obj.mesh.position.x += Math.sin(time * obj.speed * 0.7) * 0.01;
        obj.mesh.rotation.y += obj.rotationSpeed;
        obj.mesh.rotation.z += obj.rotationSpeed * 0.3;
        obj.mesh.material.opacity = 0.5 + Math.sin(time * 1.5) * 0.2;
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
    selectedBook = null;
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
    camera.position.set(0, 180, 120);
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

  document.getElementById('closeInterior').addEventListener('click', () => {
    overlay.classList.add('hidden');
    bookPanel.classList.add('hidden');
  });

  document.getElementById('closeBook').addEventListener('click', closeBookReader);
  document.getElementById('readInChannelBtn').addEventListener('click', readInChannel);
  document.getElementById('bookmarkBtn').addEventListener('click', bookmarkBook);
  
  document.getElementById('infoBtn').addEventListener('click', showIslandInfo);
  document.getElementById('closeInfo').addEventListener('click', hideIslandInfo);
  document.getElementById('resetViewBtn').addEventListener('click', resetView);
  document.getElementById('fullscreenBtn').addEventListener('click', toggleFullscreen);

  if (!initThreeJS()) {
    console.log('Falling back to 2D mode');
  }
})();