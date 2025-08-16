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

  const hasThree = !!window.THREE;
  let webglOk = false;

  function startThree(){
    try {
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
      renderer.setSize(innerWidth, innerHeight);

      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x0b0f16, 0.024);

      const camera = new THREE.PerspectiveCamera(55, innerWidth/innerHeight, 0.1, 1000);

      function makeSimpleControls(canvas, camera, opts){
        const state = {
          dragging: false,
          lastX: 0, lastY: 0,
          az: opts.az || 0, el: opts.el || 0.45,
          dist: opts.dist || 32,
          target: opts.target || new THREE.Vector3(0,2,0),
          minEl: opts.minEl ?? 0.18, maxEl: opts.maxEl ?? 1.2,
          minDist: opts.minDist ?? 12, maxDist: opts.maxDist ?? 80,
        };
        function updateCam(){
          const x = state.target.x + state.dist * Math.sin(state.az) * Math.cos(state.el);
          const y = state.target.y + state.dist * Math.sin(state.el);
          const z = state.target.z + state.dist * Math.cos(state.az) * Math.cos(state.el);
          camera.position.set(x,y,z);
          camera.lookAt(state.target);
        }
        updateCam();
        function onDown(e){ state.dragging = true; const t = e.touches ? e.touches[0] : e; state.lastX=t.clientX; state.lastY=t.clientY; }
        function onMove(e){
          if (!state.dragging) return;
          const t = e.touches ? e.touches[0] : e;
          const dx = (t.clientX - state.lastX);
          const dy = (t.clientY - state.lastY);
          state.lastX = t.clientX; state.lastY = t.clientY;
          state.az -= dx * 0.005;
          state.el -= dy * 0.004;
          state.el = Math.max(state.minEl, Math.min(state.maxEl, state.el));
          updateCam();
        }
        function onUp(){ state.dragging = false; }
        function onWheel(e){ e.preventDefault(); const d = Math.sign(e.deltaY); state.dist *= (1 + 0.12 * d); state.dist = Math.max(state.minDist, Math.min(state.maxDist, state.dist)); updateCam(); }
        canvas.addEventListener('mousedown', onDown);
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
        canvas.addEventListener('touchstart', onDown, {passive:true});
        window.addEventListener('touchmove', onMove, {passive:true});
        window.addEventListener('touchend', onUp, {passive:true});
        canvas.addEventListener('wheel', onWheel, {passive:false});
        return { update: updateCam };
      }
      const controls = makeSimpleControls(canvas, camera, { el: 0.42, dist: 34, minEl: 0.18, maxEl: 0.85, minDist: 18, maxDist: 70, target: new THREE.Vector3(0,2,0) });

      const hemi = new THREE.HemisphereLight(0xeae6de, 0x0b0f16, 0.8); scene.add(hemi);
      const dir = new THREE.DirectionalLight(0xffffff, 1.15); dir.position.set(10,20,10); dir.castShadow = true; scene.add(dir);

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
      const water = new THREE.Mesh(waterGeo, waterMat); water.rotation.x = -Math.PI/2; water.position.y = -0.2; scene.add(water);

      const islandGeo = new THREE.CylinderGeometry(16, 26, 4, 48, 3, false);
      const islandMat = new THREE.MeshStandardMaterial({ color: 0x394d2f, roughness: 0.9, metalness: 0.0 });
      const island = new THREE.Mesh(islandGeo, islandMat); island.position.y = 1.2; island.castShadow = true; island.receiveShadow = true; scene.add(island);

      const sandGeo = new THREE.CylinderGeometry(22, 22, 0.2, 64);
      const sandMat = new THREE.MeshStandardMaterial({ color: 0xb69d7d, roughness: 1.0 });
      const sand = new THREE.Mesh(sandGeo, sandMat); sand.position.y = 0.1; scene.add(sand);

      const ray = new THREE.Raycaster();
      const mouse = new THREE.Vector2();
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

      function onTap(ev){
        const rect = renderer.domElement.getBoundingClientRect();
        const clientX = ev.touches ? (ev.touches[0]?.clientX ?? ev.changedTouches?.[0]?.clientX) : (ev.clientX ?? 0);
        const clientY = ev.touches ? (ev.touches[0]?.clientY ?? ev.changedTouches?.[0]?.clientY) : (ev.clientY ?? 0);
        const x = (clientX - rect.left) / rect.width;
        const y = (clientY - rect.top)  / rect.height;
        mouse.set(x*2-1, -(y*2-1));
        ray.setFromCamera(mouse, camera);
        const bases = clickable.map(g=>g.children[0]);
        const inter = ray.intersectObjects(bases, true);
        if (inter.length){
          const group = inter[0].object.parent;
          const key = group.userData.key;
          if (key === "psychotypes"){ openInteriorDOM(); }
          else if (key === "materials"){ toast("Раздел «Материалы» скоро будет доступен"); }
          else if (key === "support"){ toast("Откройте поддержку через главное меню"); }
        }
      }
      renderer.domElement.addEventListener('click', onTap);
      renderer.domElement.addEventListener('touchend', e => { if(e.touches?.length===0) onTap(e); });

      let t = 0; function loop(){ requestAnimationFrame(loop); t += 0.016; waterMat.uniforms.uTime.value = t; renderer.render(scene, camera); }
      loop();
      function resize(){ renderer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth/innerHeight; camera.updateProjectionMatrix(); }
      window.addEventListener('resize', resize);

      function openInteriorDOM(){ overlay.classList.remove('hidden'); buildBookCards(); }

      webglOk = true;
    } catch (e){
      console.error("WebGL init failed, fallback to 2D", e);
      webglOk = false;
    }
  }

  function start2D(){
    const ctx = canvas.getContext('2d');
    function resize(){
      canvas.width = innerWidth * (window.devicePixelRatio||1);
      canvas.height = innerHeight * (window.devicePixelRatio||1);
    }
    resize(); window.addEventListener('resize', resize);

    const clickable = [];
    function addHouse2D(x,y,w,h,label,key){ clickable.push({x,y,w,h,key,label}); }
    function layout(){
      const W = canvas.width, H = canvas.height; const u = Math.min(W,H);
      addHouse2D(W*0.42, H*0.52, u*0.10, u*0.06, "Поддержка", "support");
      addHouse2D(W*0.55, H*0.42, u*0.10, u*0.06, "Материалы", "materials");
      addHouse2D(W*0.64, H*0.58, u*0.10, u*0.06, "Психотипы", "psychotypes");
    }
    layout();

    let t = 0;
    function draw(){
      t += 1/60; const W = canvas.width, H = canvas.height;
      const g = ctx.createLinearGradient(0,0,0,H); g.addColorStop(0, "#0a3d61"); g.addColorStop(1, "#0b2035");
      ctx.fillStyle = g; ctx.fillRect(0,0,W,H);
      ctx.globalAlpha = 0.08; ctx.fillStyle = "#ffffff";
      for (let i=0;i<8;i++){ const y = (H/8)*i + Math.sin(t*0.7 + i)*10*(window.devicePixelRatio||1); ctx.fillRect(0, y, W, 2*(window.devicePixelRatio||1)); }
      ctx.globalAlpha = 1;
      ctx.beginPath(); ctx.ellipse(W*0.55, H*0.55, W*0.28, H*0.18, 0, 0, Math.PI*2); ctx.fillStyle = "#b69d7d"; ctx.fill();
      ctx.beginPath(); ctx.ellipse(W*0.55, H*0.55, W*0.22, H*0.14, 0, 0, Math.PI*2); ctx.fillStyle = "#394d2f"; ctx.fill();
      function palm(cx,cy){ ctx.strokeStyle = "#6b4f2d"; ctx.lineWidth = 6*(window.devicePixelRatio||1); ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx+10,cy-40); ctx.stroke(); ctx.fillStyle = "#1f7a4b"; for(let i=0;i<5;i++){ ctx.beginPath(); ctx.ellipse(cx+10, cy-40, 30, 10, i*0.6, 0, Math.PI*2); ctx.fill(); } }
      palm(W*0.60, H*0.50); palm(W*0.48, H*0.60); palm(W*0.66, H*0.62);
      clickable.forEach(h => {
        ctx.fillStyle = "#2a2f3a"; ctx.fillRect(h.x, h.y, h.w, h.h);
        ctx.fillStyle = "#5b3a2f"; ctx.beginPath(); ctx.moveTo(h.x, h.y); ctx.lineTo(h.x + h.w/2, h.y - h.h*0.6); ctx.lineTo(h.x + h.w, h.y); ctx.closePath(); ctx.fill();
        const sx = h.x + h.w/2, sy = h.y + h.h + 10*(window.devicePixelRatio||1);
        ctx.fillStyle = "rgba(0,0,0,0.35)"; ctx.fillRect(sx - h.w*0.55/2, sy, h.w*0.55, 26*(window.devicePixelRatio||1));
        ctx.fillStyle = "#eae6de"; ctx.font = `bold ${Math.round(h.h*0.30)}px Inter, sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "top"; ctx.fillText(h.label, sx, sy+4);
      });
      requestAnimationFrame(draw);
    }
    draw();

    function hit(x,y){ const dpr = (window.devicePixelRatio||1); const px = x * dpr, py = y * dpr; return clickable.find(h => px>=h.x && px<=h.x+h.w && py>=h.y && py<=h.y+h.h); }
    function onTap(ev){ const rect = canvas.getBoundingClientRect(); const clientX = ev.touches ? (ev.touches[0]?.clientX ?? ev.changedTouches?.[0]?.clientX) : (ev.clientX ?? 0); const clientY = ev.touches ? (ev.touches[0]?.clientY ?? ev.changedTouches?.[0]?.clientY) : (ev.clientY ?? 0); const x = clientX - rect.left; const y = clientY - rect.top; const h = hit(x,y); if (!h) return; if (h.key === "psychotypes"){ overlay.classList.remove('hidden'); buildBookCards(); } else if (h.key === "materials"){ toast("Раздел «Материалы» скоро будет доступен"); } else if (h.key === "support"){ toast("Откройте поддержку через главное меню"); } }
    canvas.addEventListener('click', onTap); canvas.addEventListener('touchend', e => { if(e.touches?.length===0) onTap(e); });
  }

  function buildBookCards(){
    bookPanel.classList.add('bookGrid'); bookPanel.innerHTML = "";
    BOOKS.forEach(b => {
      const card = document.createElement('div'); card.className = 'bookCard';
      const title = document.createElement('div'); title.className = 'bookTitle'; title.textContent = b.title;
      const btn = document.createElement('button'); btn.className = 'btn primary'; btn.textContent = 'Читать в канал'; btn.onclick = () => { window.location.href = b.url; };
      card.appendChild(title); card.appendChild(btn); bookPanel.appendChild(card);
    });
    bookPanel.classList.remove('hidden');
  }

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

  if (hasThree){ startThree(); }
  if (!hasThree || !webglOk){ start2D(); }

  document.getElementById('closeInterior').addEventListener('click', ()=> overlay.classList.add('hidden'));
})();