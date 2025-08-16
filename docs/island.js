(function(){
  const tg = window.Telegram?.WebApp;
  if (tg) { try { tg.ready(); tg.expand(); } catch(e){} }

  const $ = sel => document.querySelector(sel);
  const canvas = $("#scene");
  const overlay = $("#interiorOverlay");
  const interiorCanvas = $("#interior");
  const bookPanel = $("#bookPanel");
  const bookTitleEl = $("#bookTitle");
  const bookLinkBtn = $("#bookLinkBtn");

  const BOOKS = [
    { title: "Введение в психотипы", url: "https://t.me/c/1928787715/128" },
    { title: "Психотип: Эпилептоид", url: "https://t.me/c/1928787715/127" },
    { title: "Психотип: Истероид", url: "https://t.me/c/1928787715/126" },
  ];

  // Island Scene
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.setSize(innerWidth, innerHeight);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0b0f16, 0.024);

  const camera = new THREE.PerspectiveCamera(55, innerWidth/innerHeight, 0.1, 1000);
  camera.position.set(0, 28, 32);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.enablePan = false;
  controls.minDistance = 18;
  controls.maxDistance = 70;
  controls.minPolarAngle = Math.PI * 0.22;
  controls.maxPolarAngle = Math.PI * 0.52;
  controls.target.set(0, 2, 0);

  const hemi = new THREE.HemisphereLight(0xeae6de, 0x0b0f16, 0.8);
  scene.add(hemi);
  const dir = new THREE.DirectionalLight(0xffffff, 1.15);
  dir.position.set(10,20,10);
  dir.castShadow = true;
  scene.add(dir);

  const waterGeo = new THREE.PlaneGeometry(120,120, 64,64);
  const waterMat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Color("#0a416d") } },
    vertexShader: `varying vec2 vUv; uniform float uTime;
      void main(){
        vUv = uv;
        vec3 p = position;
        p.z += (sin((p.x+uTime*0.6)*0.25) + cos((p.y-uTime*0.8)*0.22))*0.3;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p,1.0);
      }`,
    fragmentShader: `varying vec2 vUv; uniform vec3 uColor;
      void main(){ gl_FragColor = vec4(uColor * (0.7+0.3*(vUv.y)), 1.0); }`,
    side: THREE.DoubleSide
  });
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.rotation.x = -Math.PI/2;
  water.position.y = -0.2;
  scene.add(water);

  const islandGeo = new THREE.CylinderGeometry(16, 26, 4, 48, 3, false);
  const islandMat = new THREE.MeshStandardMaterial({ color: 0x394d2f, roughness: 0.9, metalness: 0.0 });
  const island = new THREE.Mesh(islandGeo, islandMat);
  island.position.y = 1.2;
  island.castShadow = true; island.receiveShadow = true;
  scene.add(island);

  const sandGeo = new THREE.CylinderGeometry(22, 22, 0.2, 64);
  const sandMat = new THREE.MeshStandardMaterial({ color: 0xb69d7d, roughness: 1.0 });
  const sand = new THREE.Mesh(sandGeo, sandMat);
  sand.position.y = 0.1;
  scene.add(sand);

  function addPalm(x,z){
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.25,0.25,4,8), new THREE.MeshStandardMaterial({color:0x6b4f2d}));
    trunk.position.set(x,3.2,z);
    const leafGeo = new THREE.ConeGeometry(1.8, 3, 8);
    const leafMat = new THREE.MeshStandardMaterial({color:0x1f7a4b});
    const leaves = new THREE.Group();
    for(let i=0;i<5;i++){
      const cone = new THREE.Mesh(leafGeo, leafMat);
      cone.position.y = 5.2;
      cone.rotation.z = Math.PI * (0.1 + 0.06*i);
      cone.rotation.y = i * (Math.PI*2/5);
      leaves.add(cone);
    }
    const g = new THREE.Group();
    g.add(trunk); g.add(leaves);
    scene.add(g);
    g.position.set(x,0,z);
  }
  addPalm(8,4); addPalm(-6,-2); addPalm(5,-7);

  const clickable = [];
  function textTexture(txt, bg="#1a1f2a", fg="#eae6de"){
    const c = document.createElement('canvas'); c.width=512; c.height=256;
    const ctx = c.getContext('2d');
    ctx.fillStyle = bg; ctx.fillRect(0,0,c.width,c.height);
    ctx.fillStyle = fg; ctx.font = "bold 52px Inter, sans-serif"; ctx.textAlign="center"; ctx.textBaseline="middle";
    ctx.shadowColor = "rgba(255,255,255,.25)"; ctx.shadowBlur = 8;
    ctx.fillText(txt, c.width/2, c.height/2);
    return new THREE.CanvasTexture(c);
  }

  function addHouse(x,z,label, key){
    const base = new THREE.Mesh(new THREE.BoxGeometry(4,2.2,4), new THREE.MeshStandardMaterial({color:0x2a2f3a}));
    base.position.set(x,2.5,z); base.castShadow=true; base.receiveShadow=true;
    const roof = new THREE.Mesh(new THREE.ConeGeometry(3.2, 1.6, 4), new THREE.MeshStandardMaterial({color:0x5b3a2f}));
    roof.position.set(x,4,z); roof.rotation.y = Math.PI/4;
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(3.8,1.4), new THREE.MeshBasicMaterial({map: textTexture(label)}));
    sign.position.set(x,3.3,z+2.2);
    const g = new THREE.Group(); g.add(base); g.add(roof); g.add(sign);
    g.userData = { type: "house", key };
    scene.add(g); clickable.push(g);
  }

  addHouse(-4, -1, "Поддержка", "support");
  addHouse(2,  4, "Материалы", "materials");
  addHouse(6, -2, "Психотипы", "psychotypes");

  const ray = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  function onTap(ev){
    const rect = renderer.domElement.getBoundingClientRect();
    const clientX = ev.touches ? ev.touches[0].clientX : (ev.clientX ?? ev.changedTouches?.[0]?.clientX ?? 0);
    const clientY = ev.touches ? ev.touches[0].clientY : (ev.clientY ?? ev.changedTouches?.[0]?.clientY ?? 0);
    const x = (clientX - rect.left) / rect.width;
    const y = (clientY - rect.top)  / rect.height;
    mouse.set(x*2-1, -(y*2-1));
    ray.setFromCamera(mouse, camera);
    const bases = clickable.map(g=>g.children[0]);
    const inter = ray.intersectObjects(bases, true);
    if (inter.length){
      const group = inter[0].object.parent;
      const key = group.userData.key;
      if (key === "psychotypes"){ openInterior(); }
      else if (key === "materials"){ toast("Раздел «Материалы» скоро будет доступен"); }
      else if (key === "support"){ toast("Откройте поддержку через главное меню"); }
    }
  }
  renderer.domElement.addEventListener('click', onTap);
  renderer.domElement.addEventListener('touchend', e => { if(e.touches?.length===0) onTap(e); });

  let t = 0;
  function loop(){
    requestAnimationFrame(loop);
    t += 0.016;
    waterMat.uniforms.uTime.value = t;
    controls.update();
    renderer.render(scene, camera);
  }
  loop();

  function resize(){
    renderer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth/innerHeight;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);

  function toast(msg){
    const el = document.createElement('div');
    el.textContent = msg;
    el.style.position='fixed'; el.style.left='50%'; el.style.bottom='70px';
    el.style.transform='translateX(-50%)'; el.style.padding='10px 14px';
    el.style.borderRadius='12px'; el.style.background='rgba(0,0,0,.55)';
    el.style.color='#fff'; el.style.fontWeight='700'; el.style.fontFamily='Inter,system-ui';
    el.style.border='1px solid rgba(255,255,255,.2)'; el.style.zIndex='9';
    document.body.appendChild(el);
    setTimeout(()=>{ el.style.transition='opacity .25s'; el.style.opacity='0'; setTimeout(()=>el.remove(),250); },1400);
  }

  // Interior
  const ir = new THREE.WebGLRenderer({ canvas: interiorCanvas, antialias:true, alpha:true });
  ir.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  ir.setSize(innerWidth, innerHeight);
  const iscene = new THREE.Scene();
  const icam = new THREE.PerspectiveCamera(55, innerWidth/innerHeight, 0.1, 1000);
  icam.position.set(0, 4, 10);
  const ictrl = new THREE.OrbitControls(icam, ir.domElement);
  ictrl.enablePan = false; ictrl.minDistance=6; ictrl.maxDistance=18; ictrl.target.set(0,2.5,0);

  const iHemi = new THREE.HemisphereLight(0xeae6de, 0x0a0c12, 0.9); iscene.add(iHemi);
  const iDir = new THREE.DirectionalLight(0xffffff, 1.2); iDir.position.set(5,8,6); iscene.add(iDir);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(18,12), new THREE.MeshStandardMaterial({color:0x15161b, roughness:1}));
  floor.rotation.x = -Math.PI/2; iscene.add(floor);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(18,8), new THREE.MeshStandardMaterial({color:0x111319, roughness:1}));
  wall.position.set(0,4,-5.9); iscene.add(wall);

  function shelf(y){
    const s = new THREE.Mesh(new THREE.BoxGeometry(12,0.2,1.5), new THREE.MeshStandardMaterial({color:0x252830}));
    s.position.set(0, y, -4.5);
    iscene.add(s); return s;
  }
  shelf(2.2); shelf(3.8); shelf(5.4);

  const books = [];
  function bookCoverTexture(title){
    const c = document.createElement('canvas'); c.width=512; c.height=768;
    const ctx = c.getContext('2d');
    const grad = ctx.createLinearGradient(0,0,512,768);
    grad.addColorStop(0, "#232733"); grad.addColorStop(1, "#161a24");
    ctx.fillStyle = grad; ctx.fillRect(0,0,512,768);
    ctx.strokeStyle = "rgba(255,255,255,.18)"; ctx.lineWidth = 6; ctx.strokeRect(18,18, 512-36, 768-36);
    ctx.fillStyle = "#efe9df";
    ctx.font = "bold 46px Inter, sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    wrapText(ctx, title, 256, 384, 420, 54);
    return new THREE.CanvasTexture(c);
  }
  function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '', yy = y - lineHeight;
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line, x, yy += lineHeight);
        line = words[n] + ' ';
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, yy + lineHeight);
  }

  function addBook(i, title, x, y){
    const cover = bookCoverTexture(title);
    const mat = new THREE.MeshStandardMaterial({map: cover, roughness: 0.9});
    const spine = new THREE.MeshStandardMaterial({ color: 0x20232b });
    const geo = new THREE.BoxGeometry(0.6, 1.8, 1.2);
    const m = new THREE.Mesh(geo, [spine, spine, spine, spine, mat, spine]);
    m.position.set(x, y, -4.5 + 0.8);
    m.userData = { idx: i, title };
    iscene.add(m); books.push(m);
  }
  addBook(0, BOOKS[0].title, -3.5, 5.8);
  addBook(1, BOOKS[1].title, -1.0, 3.95);
  addBook(2, BOOKS[2].title,  2.4, 2.35);

  const iray = new THREE.Raycaster();
  const imouse = new THREE.Vector2();
  function onInteriorTap(ev){
    const rect = ir.domElement.getBoundingClientRect();
    const clientX = ev.touches ? ev.touches[0].clientX : (ev.clientX ?? ev.changedTouches?.[0]?.clientX ?? 0);
    const clientY = ev.touches ? ev.touches[0].clientY : (ev.clientY ?? ev.changedTouches?.[0]?.clientY ?? 0);
    const cx = (clientX - rect.left) / rect.width;
    const cy = (clientY - rect.top)  / rect.height;
    imouse.set(cx*2-1, -(cy*2-1));
    iray.setFromCamera(imouse, icam);
    const it = iray.intersectObjects(books, true);
    if (it.length){
      const mesh = it[0].object;
      const { idx, title } = mesh.userData;
      showBook(idx, title);
    }
  }
  ir.domElement.addEventListener('click', onInteriorTap);
  ir.domElement.addEventListener('touchend', e => { if(e.touches?.length===0) onInteriorTap(e); });

  function showBook(idx, title){
    bookTitleEl.textContent = title;
    const link = BOOKS[idx]?.url;
    if (link){
      bookLinkBtn.onclick = () => { window.location.href = link; };
    } else {
      bookLinkBtn.onclick = () => {};
    }
    bookPanel.classList.remove('hidden');
  }

  function iresize(){
    ir.setSize(innerWidth, innerHeight);
    icam.aspect = innerWidth/innerHeight;
    icam.updateProjectionMatrix();
  }
  window.addEventListener('resize', iresize);

  function iloop(){
    requestAnimationFrame(iloop);
    ictrl.update();
    ir.render(iscene, icam);
  }
  iloop();

  function openInterior(){
    overlay.classList.remove('hidden');
    bookPanel.classList.add('hidden');
  }
  document.getElementById('closeInterior').addEventListener('click', ()=> overlay.classList.add('hidden'));
})();