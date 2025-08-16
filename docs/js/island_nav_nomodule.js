
(function(){
  try{Telegram && Telegram.WebApp && Telegram.WebApp.ready(); Telegram.WebApp.expand();}catch(e){}
  var canvas = document.getElementById('c');
  var renderer = new THREE.WebGLRenderer({canvas:canvas, antialias:true, alpha:false, powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio||1));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(0x0b1422, 1);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(55, window.innerWidth/window.innerHeight, 0.1, 2000);
  camera.position.set(0, 7, 22);

  var controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  controls.minDistance = 8; controls.maxDistance = 45; controls.maxPolarAngle = Math.PI * 0.47;
  controls.target.set(0,2,-10); controls.update();

  // Lights
  scene.add(new THREE.HemisphereLight(0xbcd9ff, 0x22334a, 0.8));
  var sun = new THREE.DirectionalLight(0xffffff, 1.2);
  sun.position.set(-30,60,20); sun.castShadow = true; sun.shadow.mapSize.set(1024,1024);
  sun.shadow.camera.left=-50; sun.shadow.camera.right=50; sun.shadow.camera.top=50; sun.shadow.camera.bottom=-50;
  scene.add(sun);

  // Ground (fallback colors if textures not available)
  var groundMat = new THREE.MeshStandardMaterial({color:0xdacaa8, roughness:.95, metalness:.02});
  var ground = new THREE.Mesh(new THREE.CylinderGeometry(60,60,0.6,64), groundMat);
  ground.receiveShadow = true; ground.position.set(0,0,-10); scene.add(ground);

  // Ocean ring
  var ocean = new THREE.Mesh(new THREE.RingGeometry(62, 90, 64, 1), new THREE.MeshBasicMaterial({ color:0x0d3b66, transparent:true, opacity:0.9 }));
  ocean.rotation.x = -Math.PI/2; ocean.position.set(0,0.31,-10); scene.add(ocean);

  // Palms
  var palms = new THREE.Group(); scene.add(palms);
  function makePalm(x,z,s){
    var g = new THREE.Group();
    var trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.35,4.2,8), new THREE.MeshStandardMaterial({color:0x7b5a39, roughness:.9}));
    trunk.position.y = 2.1; trunk.castShadow = true; trunk.receiveShadow = true; g.add(trunk);
    for (var i=0;i<6;i++){
      var leaf = new THREE.Mesh(new THREE.ConeGeometry(0.9, 1.8, 10), new THREE.MeshStandardMaterial({color:0x2c9c62, roughness:.7}));
      leaf.position.y = 3.9; leaf.rotation.set(-0.7 + Math.random()*0.25, i*Math.PI*2/6, 0);
      leaf.castShadow = true; g.add(leaf);
    }
    g.position.set(x, 0.35, z); g.scale.set(s,s,s);
    g.userData.sway = Math.random()*Math.PI*2;
    return g;
  }
  for (var i=0;i<28;i++){
    var a = Math.random()*Math.PI*2;
    var r = 12 + Math.random()*16;
    palms.add(makePalm(Math.cos(a)*r*0.75, -10 + Math.sin(a)*r*0.75, 0.9+Math.random()*0.5));
  }

  // Temples
  var temples = new THREE.Group(); scene.add(temples);
  var templesArr = [];
  function makeTemple(i){
    var color = new THREE.Color().setHSL(0.53 + i*0.05, 0.25, 0.65);
    var mat = new THREE.MeshStandardMaterial({ color: color, roughness:0.6, metalness:0.1 });
    var g = new THREE.Group();
    var base = new THREE.Mesh(new THREE.BoxGeometry(4, 1.2, 4), mat); base.position.y = 0.6; base.receiveShadow = true; base.castShadow = true; g.add(base);
    var body = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.6, 3.0 + i*0.2, 20), mat); body.position.y = 2.2; body.castShadow = true; g.add(body);
    var roof = new THREE.Mesh(new THREE.ConeGeometry(2.2 + i*0.08, 1.2 + i*0.12, 24), mat); roof.position.y = 3.8 + i*0.2; roof.castShadow = true; g.add(roof);
    var colMat = new THREE.MeshStandardMaterial({ color:0xffffff, roughness:0.5 });
    for (var k=0;k<8;k++){
      var col = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 1.8, 14), colMat);
      var ang = k*Math.PI/4;
      col.position.set(Math.cos(ang)*2.0, 1.3, Math.sin(ang)*2.0); col.castShadow = true; g.add(col);
    }
    var glowMat = new THREE.SpriteMaterial({ color:0x36c2b6, transparent:true, opacity:0.0, depthWrite:false });
    var glow = new THREE.Sprite(glowMat); glow.scale.set(3.8,3.8,1); glow.position.y = roof.position.y + 0.8; g.add(glow);
    g.position.set((i-2)*6.2, 0, -12 - Math.abs(i-2)*1.2);
    g.userData = { kind:'temple', index:i, label:'Тема ' + (i+1), glow:glow };
    templesArr.push(g);
    return g;
  }
  for (var t=0;t<5;t++) temples.add(makeTemple(t));

  // Label
  var labelEl = document.getElementById('label');
  function showLabelForTemple(g){
    var pos = g.position.clone(); pos.y += 5.2;
    var sp = pos.project(camera);
    var sx = (sp.x*0.5+0.5)*window.innerWidth;
    var sy = (-sp.y*0.5+0.5)*window.innerHeight;
    labelEl.style.left = sx+'px'; labelEl.style.top = sy+'px';
    labelEl.textContent = g.userData.label; labelEl.style.opacity = 1;
    labelEl.style.transform = 'translate(-50%,-120%) scale(1)';
  }

  // Interaction
  var titleEl = document.getElementById('title');
  var raycaster = new THREE.Raycaster(); var pointer = new THREE.Vector2();
  var CLICK = {x:0,y:0,time:0}; var selected = null;
  function setPointer(e){
    var rect = canvas.getBoundingClientRect();
    var clientX = (e.touches? e.touches[0].clientX:e.clientX);
    var clientY = (e.touches? e.touches[0].clientY:e.clientY);
    var x = (clientX - rect.left)/rect.width;
    var y = (clientY - rect.top)/rect.height;
    pointer.set(x*2-1, -(y*2-1));
  }
  function pick(){
    raycaster.setFromCamera(pointer, camera);
    var hits = raycaster.intersectObjects([temples], true);
    return hits[0]||null;
  }
  function onDown(e){ setPointer(e); CLICK.x=pointer.x; CLICK.y=pointer.y; CLICK.time=performance.now(); }
  function onUp(e){
    setPointer(e);
    var dt = performance.now() - CLICK.time;
    var dx = Math.abs(pointer.x-CLICK.x), dy = Math.abs(pointer.y-CLICK.y);
    if (dt<350 && dx<0.02 && dy<0.02){
      var hit = pick(); if (!hit) return;
      var g = hit.object; while (g && g.parent){ if (g.userData && g.userData.kind==='temple') break; g = g.parent; }
      if (!g) return;
      if (selected === g){
        var url = 'shelf_room.html?theme='+(g.userData.index+1);
        try{ Telegram && Telegram.WebApp && Telegram.WebApp.openLink(url, {try_instant_view:true}); }catch(err){ location.href=url; }
      } else {
        if (selected) selected.userData.glow.material.opacity = 0.0;
        selected = g; selected.userData.glow.material.opacity = 0.85;
        titleEl.textContent = 'Нажми ещё раз для подтверждения выбора';
        showLabelForTemple(selected);
      }
    }
  }
  canvas.addEventListener('mousedown', onDown); canvas.addEventListener('mouseup', onUp);
  canvas.addEventListener('touchstart', onDown, {passive:false}); canvas.addEventListener('touchend', onUp);

  // Loop
  var clock = new THREE.Clock();
  function loop(){
    var t = clock.getElapsedTime();
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  }
  loop();

  window.addEventListener('resize', function(){
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth/window.innerHeight; camera.updateProjectionMatrix();
  });
})();
