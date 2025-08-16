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

  const hasThree = !!window.THREE;
  let webglOk = false;
  let scene, camera, renderer, controls;
  let houses = [];
  let palmTrees = [];
  let waterParticles = [];
  let currentHoveredHouse = null;
  let selectedBook = null;
  let isFullscreen = false;

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

  function startThree(){
    try {
      // Enhanced renderer with better quality
      renderer = new THREE.WebGLRenderer({ 
        canvas, 
        antialias: true, 
        alpha: true,
        powerPreference: "high-performance"
      });
      renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
      renderer.setSize(innerWidth, innerHeight);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;

      scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x87ceeb, 0.008);

      camera = new THREE.PerspectiveCamera(55, innerWidth/innerHeight, 0.1, 1000);

      // Enhanced controls with aerial view angle
      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.screenSpacePanning = false;
      controls.minDistance = 80;
      controls.maxDistance = 200;
      controls.minPolarAngle = Math.PI / 3; // 60 degrees
      controls.maxPolarAngle = Math.PI / 2.2; // ~82 degrees

      // Realistic lighting based on photo
      const ambientLight = new THREE.AmbientLight(0x87ceeb, 0.6);
      scene.add(ambientLight);

      const hemi = new THREE.HemisphereLight(0xffffff, 0x1a1a2e, 0.8); 
      scene.add(hemi);

      const dir = new THREE.DirectionalLight(0xffffff, 1.2); 
      dir.position.set(50, 100, 50); 
      dir.castShadow = true;
      dir.shadow.mapSize.width = 4096;
      dir.shadow.mapSize.height = 4096;
      dir.shadow.camera.near = 0.5;
      dir.shadow.camera.far = 200;
      dir.shadow.camera.left = -100;
      dir.shadow.camera.right = 100;
      dir.shadow.camera.top = 100;
      dir.shadow.camera.bottom = -100;
      scene.add(dir);

      // Create realistic ocean with depth
      createOcean();
      
      // Create detailed island terrain
      createDetailedIsland();
      
      // Create road network
      createRoads();
      
      // Create buildings and structures
      createBuildings();
      
      // Create vegetation
      createVegetation();
      
      // Create beaches and coastal features
      createCoastalFeatures();
      
      // Create small islets
      createIslets();

      // Set initial camera position for aerial view
      camera.position.set(0, 120, 80);
      controls.target.set(0, 0, 0);
      controls.update();

      // Animation loop
      let t = 0;
      function loop(){ 
        requestAnimationFrame(loop); 
        t += 0.016;
        
        // Animate water
        animateWater(t);
        
        // Animate vegetation
        animateVegetation(t);
        
        // Animate buildings
        animateBuildings(t);
        
        controls.update();
        renderer.render(scene, camera); 
      }
      loop();

      // Handle window resize
      function resize(){ 
        renderer.setSize(innerWidth, innerHeight); 
        camera.aspect = innerWidth/innerHeight; 
        camera.updateProjectionMatrix(); 
      }
      window.addEventListener('resize', resize);

      // Enhanced click handling
      setupClickHandling();

      webglOk = true;
    } catch (e){
      console.error("WebGL init failed, fallback to 2D", e);
      webglOk = false;
    }
  }

  function createOcean() {
    // Create large ocean plane
    const oceanGeo = new THREE.PlaneGeometry(400, 400, 256, 256);
    const oceanMat = new THREE.ShaderMaterial({
      uniforms: { 
        uTime: { value: 0 }, 
        uColor: { value: new THREE.Color("#006994") },
        uShallowColor: { value: new THREE.Color("#40E0D0") },
        uDeepColor: { value: new THREE.Color("#003366") }
      },
      vertexShader: `
        varying vec2 vUv;
        varying float vDepth;
        uniform float uTime;
        
        void main() {
          vUv = uv;
          vec3 p = position;
          
          // Complex wave pattern
          float wave1 = sin((p.x + uTime * 0.3) * 0.1) * 0.5;
          float wave2 = cos((p.y - uTime * 0.4) * 0.08) * 0.3;
          float wave3 = sin((p.x + p.y + uTime * 0.2) * 0.05) * 0.2;
          
          p.z += wave1 + wave2 + wave3;
          
          // Calculate depth for color variation
          float distFromCenter = length(p.xy);
          vDepth = smoothstep(0.0, 200.0, distFromCenter);
          
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
          
          // Add some transparency and foam
          float foam = sin(vUv.x * 50.0) * sin(vUv.y * 50.0) * 0.1;
          waterColor += foam;
          
          gl_FragColor = vec4(waterColor, 0.9);
        }
      `,
      side: THREE.DoubleSide,
      transparent: true
    });
    
    const ocean = new THREE.Mesh(oceanGeo, oceanMat); 
    ocean.rotation.x = -Math.PI/2; 
    ocean.position.y = -2; 
    ocean.receiveShadow = true;
    scene.add(ocean);
    
    waterParticles.push({ mesh: ocean, material: oceanMat });
  }

  function createDetailedIsland() {
    // Create complex island shape using custom geometry
    const islandShape = new THREE.Shape();
    
    // Define the irregular island outline based on photo
    islandShape.moveTo(-25, -15);
    islandShape.bezierCurveTo(-30, -10, -35, 0, -30, 10);
    islandShape.bezierCurveTo(-25, 20, -15, 25, -5, 25);
    islandShape.bezierCurveTo(5, 25, 15, 20, 20, 15);
    islandShape.bezierCurveTo(25, 10, 30, 5, 30, -5);
    islandShape.bezierCurveTo(30, -15, 25, -20, 15, -25);
    islandShape.bezierCurveTo(5, -30, -5, -30, -15, -25);
    islandShape.bezierCurveTo(-20, -20, -25, -15, -25, -15);
    
    const extrudeSettings = {
      depth: 8,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 2,
      bevelSize: 1,
      bevelThickness: 1
    };
    
    const islandGeo = new THREE.ExtrudeGeometry(islandShape, extrudeSettings);
    const islandMat = new THREE.MeshStandardMaterial({ 
      color: 0x8B7355, 
      roughness: 0.9, 
      metalness: 0.0 
    });
    const island = new THREE.Mesh(islandGeo, islandMat); 
    island.position.y = 2; 
    island.castShadow = true; 
    island.receiveShadow = true; 
    scene.add(island);

    // Add elevation variations
    createElevation();
  }

  function createElevation() {
    // Create hills and elevated areas
    const hillPositions = [
      { x: -10, z: 5, height: 6, radius: 8 },
      { x: 5, z: 10, height: 8, radius: 10 },
      { x: 15, z: -5, height: 4, radius: 6 },
      { x: -5, z: -10, height: 5, radius: 7 }
    ];

    hillPositions.forEach(hill => {
      const hillGeo = new THREE.ConeGeometry(hill.radius, hill.height, 16);
      const hillMat = new THREE.MeshStandardMaterial({ 
        color: 0x6B8E23, 
        roughness: 0.8 
      });
      const hillMesh = new THREE.Mesh(hillGeo, hillMat);
      hillMesh.position.set(hill.x, hill.height/2 + 2, hill.z);
      hillMesh.castShadow = true;
      hillMesh.receiveShadow = true;
      scene.add(hillMesh);
    });
  }

  function createRoads() {
    // Create winding dirt roads
    const roadPaths = [
      // Main road around the island
      [
        new THREE.Vector3(-20, 2.1, -10),
        new THREE.Vector3(-15, 2.1, -5),
        new THREE.Vector3(-10, 2.1, 0),
        new THREE.Vector3(-5, 2.1, 5),
        new THREE.Vector3(0, 2.1, 10),
        new THREE.Vector3(10, 2.1, 15),
        new THREE.Vector3(20, 2.1, 10),
        new THREE.Vector3(25, 2.1, 0),
        new THREE.Vector3(20, 2.1, -10),
        new THREE.Vector3(10, 2.1, -15),
        new THREE.Vector3(0, 2.1, -20),
        new THREE.Vector3(-10, 2.1, -15),
        new THREE.Vector3(-20, 2.1, -10)
      ],
      // Secondary road to central area
      [
        new THREE.Vector3(-5, 2.1, -5),
        new THREE.Vector3(0, 2.1, 0),
        new THREE.Vector3(5, 2.1, 5),
        new THREE.Vector3(10, 2.1, 10)
      ]
    ];

    roadPaths.forEach(path => {
      const roadGeo = new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(path),
        64, // tubular segments
        1.5, // radius
        8, // radial segments
        false // closed
      );
      const roadMat = new THREE.MeshStandardMaterial({ 
        color: 0xD2B48C, 
        roughness: 1.0 
      });
      const road = new THREE.Mesh(roadGeo, roadMat);
      road.receiveShadow = true;
      scene.add(road);
    });
  }

  function createBuildings() {
    const buildingPositions = [
      // Main resort complex (west side)
      { x: -15, z: -8, type: 'resort', scale: [8, 4, 6], color: 0xF5F5DC },
      { x: -12, z: -5, type: 'resort', scale: [6, 3, 5], color: 0xF5F5DC },
      { x: -18, z: -3, type: 'resort', scale: [5, 2.5, 4], color: 0xF5F5DC },
      
      // Southwestern tip building with pool
      { x: -20, z: -20, type: 'pool', scale: [4, 2, 4], color: 0xFFFFFF },
      
      // Eastern tip building
      { x: 25, z: -5, type: 'eastern', scale: [3, 2, 3], color: 0xFFFFFF },
      
      // Central structures
      { x: 0, z: 0, type: 'central', scale: [2, 1, 2], color: 0xFFFFFF },
      { x: 5, z: 5, type: 'central', scale: [2, 1, 2], color: 0xFFFFFF }
    ];

    buildingPositions.forEach((building, index) => {
      // Main building
      const buildingGeo = new THREE.BoxGeometry(...building.scale);
      const buildingMat = new THREE.MeshStandardMaterial({ color: building.color });
      const buildingMesh = new THREE.Mesh(buildingGeo, buildingMat);
      buildingMesh.position.set(building.x, building.scale[1]/2 + 2, building.z);
      buildingMesh.castShadow = true;
      buildingMesh.receiveShadow = true;
      scene.add(buildingMesh);

      // Roof
      const roofGeo = new THREE.BoxGeometry(building.scale[0] + 0.5, 0.5, building.scale[2] + 0.5);
      const roofMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
      const roof = new THREE.Mesh(roofGeo, roofMat);
      roof.position.set(building.x, building.scale[1] + 2.25, building.z);
      roof.castShadow = true;
      scene.add(roof);

      // Special features
      if (building.type === 'pool') {
        // Swimming pool
        const poolGeo = new THREE.BoxGeometry(6, 0.5, 4);
        const poolMat = new THREE.MeshStandardMaterial({ 
          color: 0x00CED1, 
          transparent: true, 
          opacity: 0.8 
        });
        const pool = new THREE.Mesh(poolGeo, poolMat);
        pool.position.set(building.x, 2.25, building.z + 3);
        scene.add(pool);
      }

      if (building.type === 'resort') {
        // Pier/dock
        const pierGeo = new THREE.BoxGeometry(1, 0.3, 8);
        const pierMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const pier = new THREE.Mesh(pierGeo, pierMat);
        pier.position.set(building.x, 1.15, building.z - 6);
        pier.castShadow = true;
        scene.add(pier);
      }

      // Add to houses array for interaction
      if (building.type === 'resort') {
        houses.push({
          base: buildingMesh,
          roof,
          position: { x: building.x, z: building.z },
          type: 'support',
          label: 'Поддержка',
          icon: '💬',
          isHovered: false
        });
      }
    });
  }

  function createVegetation() {
    // Create sparse, scrubby vegetation
    const vegetationPositions = [];
    for (let i = 0; i < 50; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 20 + 5;
      vegetationPositions.push({
        x: Math.cos(angle) * radius,
        z: Math.sin(angle) * radius
      });
    }

    vegetationPositions.forEach(pos => {
      // Scrubby bushes
      const bushGeo = new THREE.SphereGeometry(Math.random() * 0.5 + 0.3, 6, 4);
      const bushMat = new THREE.MeshStandardMaterial({ 
        color: Math.random() > 0.5 ? 0x6B8E23 : 0x8FBC8F 
      });
      const bush = new THREE.Mesh(bushGeo, bushMat);
      bush.position.set(pos.x, Math.random() * 2 + 2, pos.z);
      bush.castShadow = true;
      scene.add(bush);
    });

    // Add some palm trees near buildings
    const palmPositions = [
      { x: -15, z: -8 },
      { x: -12, z: -5 },
      { x: -18, z: -3 },
      { x: -20, z: -20 },
      { x: 25, z: -5 }
    ];

    palmPositions.forEach(pos => {
      // Palm trunk
      const trunkGeo = new THREE.CylinderGeometry(0.2, 0.3, 6, 8);
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.set(pos.x, 5, pos.z);
      trunk.castShadow = true;
      scene.add(trunk);
      
      // Palm leaves
      const leavesGeo = new THREE.SphereGeometry(2, 8, 6);
      const leavesMat = new THREE.MeshStandardMaterial({ color: 0x228B22 });
      const leaves = new THREE.Mesh(leavesGeo, leavesMat);
      leaves.position.set(pos.x, 8, pos.z);
      leaves.scale.set(1, 1.2, 1);
      leaves.castShadow = true;
      scene.add(leaves);
      
      palmTrees.push({ trunk, leaves, position: pos });
    });
  }

  function createCoastalFeatures() {
    // Create crescent beach
    const beachShape = new THREE.Shape();
    beachShape.moveTo(-25, -15);
    beachShape.bezierCurveTo(-20, -20, -15, -25, -10, -25);
    beachShape.bezierCurveTo(-5, -25, 0, -20, 5, -15);
    beachShape.bezierCurveTo(10, -10, 15, -5, 20, -5);
    
    const beachGeo = new THREE.ShapeGeometry(beachShape);
    const beachMat = new THREE.MeshStandardMaterial({ 
      color: 0xF4A460, 
      roughness: 1.0 
    });
    const beach = new THREE.Mesh(beachGeo, beachMat);
    beach.rotation.x = -Math.PI/2;
    beach.position.y = 2.05;
    beach.receiveShadow = true;
    scene.add(beach);

    // Create rocky cliffs
    const cliffPositions = [
      { x: -30, z: 0, length: 15 },
      { x: 30, z: -10, length: 12 },
      { x: 0, z: 30, length: 10 }
    ];

    cliffPositions.forEach(cliff => {
      const cliffGeo = new THREE.BoxGeometry(cliff.length, 4, 2);
      const cliffMat = new THREE.MeshStandardMaterial({ 
        color: 0x696969, 
        roughness: 0.9 
      });
      const cliffMesh = new THREE.Mesh(cliffGeo, cliffMat);
      cliffMesh.position.set(cliff.x, 4, cliff.z);
      cliffMesh.castShadow = true;
      cliffMesh.receiveShadow = true;
      scene.add(cliffMesh);
    });
  }

  function createIslets() {
    // Create small islets to the northwest
    const isletPositions = [
      { x: -35, z: -25, scale: 2 },
      { x: -40, z: -20, scale: 1.5 },
      { x: -30, z: -30, scale: 1 }
    ];

    isletPositions.forEach(islet => {
      const isletGeo = new THREE.CylinderGeometry(islet.scale, islet.scale, 3, 8);
      const isletMat = new THREE.MeshStandardMaterial({ 
        color: 0x696969, 
        roughness: 0.8 
      });
      const isletMesh = new THREE.Mesh(isletGeo, isletMat);
      isletMesh.position.set(islet.x, 1.5, islet.z);
      isletMesh.castShadow = true;
      isletMesh.receiveShadow = true;
      scene.add(isletMesh);
    });

    // Create larger elongated island to the northeast
    const largeIsletGeo = new THREE.CylinderGeometry(8, 8, 4, 16);
    const largeIsletMat = new THREE.MeshStandardMaterial({ 
      color: 0x8B7355, 
      roughness: 0.9 
    });
    const largeIslet = new THREE.Mesh(largeIsletGeo, largeIsletMat);
    largeIslet.position.set(45, 2, 0);
    largeIslet.scale.set(1, 1, 2);
    largeIslet.castShadow = true;
    largeIslet.receiveShadow = true;
    scene.add(largeIslet);
  }

  function animateWater(t) {
    waterParticles.forEach(particle => {
      particle.material.uniforms.uTime.value = t;
    });
  }

  function animateVegetation(t) {
    // Animate palm trees
    palmTrees.forEach(palm => {
      const sway = Math.sin(t * 0.5 + palm.position.x * 0.1) * 0.1;
      palm.leaves.rotation.z = sway;
    });
  }

  function animateBuildings(t) {
    // Subtle building animations
    houses.forEach(house => {
      if (house.isHovered) {
        house.base.material.color.setHex(0x3a4f4a);
      } else {
        house.base.material.color.setHex(0xF5F5DC);
      }
    });
  }

  function setupClickHandling() {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    function onMouseMove(event) {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const houseMeshes = houses.map(h => h.base);
      const intersects = raycaster.intersectObjects(houseMeshes);

      // Reset all houses
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
      // Open the post directly in Telegram
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
    camera.position.set(0, 120, 80);
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

  // Initialize
  if (hasThree) {
    startThree();
  } else {
    start2D();
  }

  // Fallback 2D version (simplified)
  function start2D() {
    const ctx = canvas.getContext('2d');
    function resize() {
      canvas.width = innerWidth * (window.devicePixelRatio || 1);
      canvas.height = innerHeight * (window.devicePixelRatio || 1);
    }
    resize();
    window.addEventListener('resize', resize);

    function draw() {
      const W = canvas.width, H = canvas.height;
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "#87CEEB");
      g.addColorStop(1, "#1E90FF");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      // Simple island representation
      ctx.beginPath();
      ctx.ellipse(W * 0.5, H * 0.5, W * 0.3, H * 0.2, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#8B7355";
      ctx.fill();

      // Simple houses
      const houses = [
        { x: W * 0.4, y: H * 0.5, label: "Поддержка" },
        { x: W * 0.6, y: H * 0.45, label: "Материалы" },
        { x: W * 0.7, y: H * 0.55, label: "Психотипы" }
      ];

      houses.forEach(house => {
        ctx.fillStyle = "#F5F5DC";
        ctx.fillRect(house.x - 20, house.y - 15, 40, 30);
        ctx.fillStyle = "#8B4513";
        ctx.beginPath();
        ctx.moveTo(house.x - 20, house.y - 15);
        ctx.lineTo(house.x, house.y - 35);
        ctx.lineTo(house.x + 20, house.y - 15);
        ctx.closePath();
        ctx.fill();
      });
    }
    draw();
  }
})();