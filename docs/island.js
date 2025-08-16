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

  // Loading simulation
  setTimeout(() => {
    loadingScreen.classList.add('hidden');
    setTimeout(() => loadingScreen.remove(), 500);
  }, 2000);

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
      scene.fog = new THREE.FogExp2(0x0b0f16, 0.015);

      camera = new THREE.PerspectiveCamera(55, innerWidth/innerHeight, 0.1, 1000);

      // Enhanced controls with smooth damping
      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.screenSpacePanning = false;
      controls.minDistance = 20;
      controls.maxDistance = 100;
      controls.maxPolarAngle = Math.PI / 2.2;

      // Enhanced lighting
      const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
      scene.add(ambientLight);

      const hemi = new THREE.HemisphereLight(0xeae6de, 0x0b0f16, 0.8); 
      scene.add(hemi);

      const dir = new THREE.DirectionalLight(0xffffff, 1.5); 
      dir.position.set(20, 30, 20); 
      dir.castShadow = true;
      dir.shadow.mapSize.width = 2048;
      dir.shadow.mapSize.height = 2048;
      dir.shadow.camera.near = 0.5;
      dir.shadow.camera.far = 100;
      dir.shadow.camera.left = -50;
      dir.shadow.camera.right = 50;
      dir.shadow.camera.top = 50;
      dir.shadow.camera.bottom = -50;
      scene.add(dir);

      // Add point lights for dramatic effect
      const pointLight1 = new THREE.PointLight(0xd6c7b8, 0.8, 50);
      pointLight1.position.set(-10, 15, -10);
      scene.add(pointLight1);

      const pointLight2 = new THREE.PointLight(0xf0eadf, 0.6, 40);
      pointLight2.position.set(15, 12, 15);
      scene.add(pointLight2);

      // Create realistic water with waves
      createWater();
      
      // Create island with detailed terrain
      createIsland();
      
      // Create palm trees
      createPalmTrees();
      
      // Create houses with enhanced details
      createHouses();
      
      // Create river with flowing water
      createRiver();
      
      // Add atmospheric particles
      createAtmosphere();

      // Set initial camera position
      camera.position.set(0, 25, 45);
      controls.target.set(0, 5, 0);
      controls.update();

      // Animation loop
      let t = 0;
      function loop(){ 
        requestAnimationFrame(loop); 
        t += 0.016;
        
        // Animate water
        animateWater(t);
        
        // Animate palm trees
        animatePalmTrees(t);
        
        // Animate houses
        animateHouses(t);
        
        // Animate river
        animateRiver(t);
        
        // Animate atmosphere
        animateAtmosphere(t);
        
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

  function createWater() {
    const waterGeo = new THREE.PlaneGeometry(200, 200, 128, 128);
    const waterMat = new THREE.ShaderMaterial({
      uniforms: { 
        uTime: { value: 0 }, 
        uColor: { value: new THREE.Color("#0a416d") },
        uWaveSpeed: { value: 0.5 },
        uWaveHeight: { value: 0.3 }
      },
      vertexShader: `
        varying vec2 vUv;
        uniform float uTime;
        uniform float uWaveSpeed;
        uniform float uWaveHeight;
        
        void main() {
          vUv = uv;
          vec3 p = position;
          
          // Multiple wave layers for realistic water
          float wave1 = sin((p.x + uTime * uWaveSpeed) * 0.25) * uWaveHeight;
          float wave2 = cos((p.y - uTime * uWaveSpeed * 0.8) * 0.22) * uWaveHeight * 0.7;
          float wave3 = sin((p.x + p.y + uTime * uWaveSpeed * 1.2) * 0.15) * uWaveHeight * 0.5;
          
          p.z += wave1 + wave2 + wave3;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        uniform vec3 uColor;
        
        void main() {
          vec3 waterColor = uColor;
          float depth = 1.0 - vUv.y;
          waterColor *= (0.7 + 0.3 * depth);
          
          // Add some transparency for realistic water
          gl_FragColor = vec4(waterColor, 0.9);
        }
      `,
      side: THREE.DoubleSide,
      transparent: true
    });
    
    const water = new THREE.Mesh(waterGeo, waterMat); 
    water.rotation.x = -Math.PI/2; 
    water.position.y = -0.5; 
    water.receiveShadow = true;
    scene.add(water);
    
    waterParticles.push({ mesh: water, material: waterMat });
  }

  function createIsland() {
    // Main island with detailed geometry
    const islandGeo = new THREE.CylinderGeometry(18, 28, 6, 64, 4, false);
    const islandMat = new THREE.MeshStandardMaterial({ 
      color: 0x394d2f, 
      roughness: 0.9, 
      metalness: 0.0 
    });
    const island = new THREE.Mesh(islandGeo, islandMat); 
    island.position.y = 2; 
    island.castShadow = true; 
    island.receiveShadow = true; 
    scene.add(island);

    // Sand beach around island
    const sandGeo = new THREE.CylinderGeometry(25, 25, 0.3, 64);
    const sandMat = new THREE.MeshStandardMaterial({ 
      color: 0xb69d7d, 
      roughness: 1.0 
    });
    const sand = new THREE.Mesh(sandGeo, sandMat); 
    sand.position.y = 0.15; 
    sand.receiveShadow = true;
    scene.add(sand);

    // Add some rocks and terrain details
    for (let i = 0; i < 15; i++) {
      const rockGeo = new THREE.DodecahedronGeometry(Math.random() * 0.5 + 0.3);
      const rockMat = new THREE.MeshStandardMaterial({ 
        color: 0x2a2f3a, 
        roughness: 0.8 
      });
      const rock = new THREE.Mesh(rockGeo, rockMat);
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 20 + 8;
      rock.position.set(
        Math.cos(angle) * radius,
        Math.random() * 2,
        Math.sin(angle) * radius
      );
      rock.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      rock.castShadow = true;
      rock.receiveShadow = true;
      scene.add(rock);
    }
  }

  function createPalmTrees() {
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 15 + 12;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      
      // Palm trunk
      const trunkGeo = new THREE.CylinderGeometry(0.3, 0.5, 8, 8);
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x6b4f2d });
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.set(x, 6, z);
      trunk.castShadow = true;
      scene.add(trunk);
      
      // Palm leaves
      const leavesGeo = new THREE.SphereGeometry(3, 8, 6);
      const leavesMat = new THREE.MeshStandardMaterial({ color: 0x1f7a4b });
      const leaves = new THREE.Mesh(leavesGeo, leavesMat);
      leaves.position.set(x, 10, z);
      leaves.scale.set(1, 1.5, 1);
      leaves.castShadow = true;
      scene.add(leaves);
      
      palmTrees.push({ trunk, leaves, position: { x, z } });
    }
  }

  function createHouses() {
    const housePositions = [
      { x: -8, z: -2, type: 'support', label: 'Поддержка', icon: '💬' },
      { x: 4, z: 8, type: 'materials', label: 'Материалы', icon: '📚' },
      { x: 10, z: -4, type: 'psychotypes', label: 'Психотипы', icon: '🧠' }
    ];

    housePositions.forEach((pos, index) => {
      // House base
      const baseGeo = new THREE.BoxGeometry(5, 3, 5);
      const baseMat = new THREE.MeshStandardMaterial({ color: 0x2a2f3a });
      const base = new THREE.Mesh(baseGeo, baseMat);
      base.position.set(pos.x, 3.5, pos.z);
      base.castShadow = true;
      base.receiveShadow = true;
      scene.add(base);

      // Roof
      const roofGeo = new THREE.ConeGeometry(4, 2, 4);
      const roofMat = new THREE.MeshStandardMaterial({ color: 0x5b3a2f });
      const roof = new THREE.Mesh(roofGeo, roofMat);
      roof.position.set(pos.x, 6, pos.z);
      roof.rotation.y = Math.PI / 4;
      roof.castShadow = true;
      scene.add(roof);

      // Door
      const doorGeo = new THREE.BoxGeometry(1.5, 2.5, 0.1);
      const doorMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
      const door = new THREE.Mesh(doorGeo, doorMat);
      door.position.set(pos.x, 2.25, pos.z + 2.6);
      scene.add(door);

      // Windows
      const windowGeo = new THREE.BoxGeometry(1, 1, 0.1);
      const windowMat = new THREE.MeshStandardMaterial({ color: 0x87ceeb });
      const window1 = new THREE.Mesh(windowGeo, windowMat);
      window1.position.set(pos.x - 1.5, 4, pos.z + 2.6);
      scene.add(window1);

      const window2 = new THREE.Mesh(windowGeo, windowMat);
      window2.position.set(pos.x + 1.5, 4, pos.z + 2.6);
      scene.add(window2);

      // Glowing effect for interactive houses
      const glowGeo = new THREE.SphereGeometry(4, 16, 16);
      const glowMat = new THREE.MeshBasicMaterial({ 
        color: 0xd6c7b8, 
        transparent: true, 
        opacity: 0 
      });
      const glow = new THREE.Mesh(glowGeo, glowMat);
      glow.position.set(pos.x, 5, pos.z);
      scene.add(glow);

      houses.push({
        base,
        roof,
        door,
        windows: [window1, window2],
        glow,
        position: pos,
        type: pos.type,
        label: pos.label,
        icon: pos.icon,
        isHovered: false
      });
    });
  }

  function createRiver() {
    // Create a winding river around the island
    const riverPoints = [];
    for (let i = 0; i < 50; i++) {
      const t = i / 49;
      const angle = t * Math.PI * 2;
      const radius = 35 + Math.sin(t * Math.PI * 4) * 5;
      riverPoints.push(new THREE.Vector3(
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius
      ));
    }

    const riverGeo = new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(riverPoints),
      64, // tubular segments
      2,  // radius
      8,  // radial segments
      false // closed
    );
    const riverMat = new THREE.MeshStandardMaterial({ 
      color: 0x4a90e2, 
      transparent: true, 
      opacity: 0.8 
    });
    const river = new THREE.Mesh(riverGeo, riverMat);
    river.position.y = -0.2;
    scene.add(river);
  }

  function createAtmosphere() {
    // Add floating particles for atmosphere
    for (let i = 0; i < 100; i++) {
      const particleGeo = new THREE.SphereGeometry(0.1, 4, 4);
      const particleMat = new THREE.MeshBasicMaterial({ 
        color: 0xd6c7b8, 
        transparent: true, 
        opacity: 0.3 
      });
      const particle = new THREE.Mesh(particleGeo, particleMat);
      particle.position.set(
        (Math.random() - 0.5) * 100,
        Math.random() * 30 + 10,
        (Math.random() - 0.5) * 100
      );
      scene.add(particle);
    }
  }

  function animateWater(t) {
    waterParticles.forEach(particle => {
      particle.material.uniforms.uTime.value = t;
    });
  }

  function animatePalmTrees(t) {
    palmTrees.forEach(palm => {
      const sway = Math.sin(t * 0.5 + palm.position.x * 0.1) * 0.1;
      palm.leaves.rotation.z = sway;
    });
  }

  function animateHouses(t) {
    houses.forEach(house => {
      if (house.isHovered) {
        house.glow.material.opacity = 0.3 + Math.sin(t * 3) * 0.1;
        house.glow.scale.setScalar(1.2 + Math.sin(t * 4) * 0.1);
      } else {
        house.glow.material.opacity = 0;
        house.glow.scale.setScalar(1);
      }
    });
  }

  function animateRiver(t) {
    // River animation could be added here
  }

  function animateAtmosphere(t) {
    // Atmosphere particles animation
    scene.children.forEach(child => {
      if (child.geometry && child.geometry.type === 'SphereGeometry' && 
          child.material && child.material.opacity === 0.3) {
        child.position.y += Math.sin(t + child.position.x) * 0.01;
        child.rotation.y += 0.01;
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
        house.base.material.color.setHex(0x2a2f3a);
      });

      if (intersects.length > 0) {
        const intersectedHouse = houses.find(h => h.base === intersects[0].object);
        if (intersectedHouse) {
          intersectedHouse.isHovered = true;
          intersectedHouse.base.material.color.setHex(0x3a4f4a);
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
      g.addColorStop(0, "#0a3d61");
      g.addColorStop(1, "#0b2035");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      // Simple island representation
      ctx.beginPath();
      ctx.ellipse(W * 0.5, H * 0.5, W * 0.3, H * 0.2, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#394d2f";
      ctx.fill();

      // Simple houses
      const houses = [
        { x: W * 0.4, y: H * 0.5, label: "Поддержка" },
        { x: W * 0.6, y: H * 0.45, label: "Материалы" },
        { x: W * 0.7, y: H * 0.55, label: "Психотипы" }
      ];

      houses.forEach(house => {
        ctx.fillStyle = "#2a2f3a";
        ctx.fillRect(house.x - 20, house.y - 15, 40, 30);
        ctx.fillStyle = "#5b3a2f";
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