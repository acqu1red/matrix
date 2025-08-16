
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
  var camera = new THREE.PerspectiveCamera(58, window.innerWidth/window.innerHeight, 0.1, 4000);
  camera.position.set(0, 55, 110);
  var controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enablePan = false; controls.enableDamping = true;
  controls.minDistance = 40; controls.maxDistance = 180; controls.maxPolarAngle = Math.PI * 0.47;
  controls.target.set(0,10,0); controls.update();

  var hemi = new THREE.HemisphereLight(0xcfe8ff, 0x224155, 0.9); scene.add(hemi);
  var sun = new THREE.DirectionalLight(0xffffff, 1.15);
  sun.position.set(-150,200,80); sun.castShadow = true; sun.shadow.mapSize.set(2048,2048);
  sun.shadow.camera.left=-200; sun.shadow.camera.right=200; sun.shadow.camera.top=200; sun.shadow.camera.bottom=-200;
  scene.add(sun);

  var loader = new THREE.TextureLoader();
  function tex(url, repX, repY){
    var t = loader.load(url); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(repX||1, repY||1); return t;
  }
  var sandTex  = tex('assets/sand.jpg', 6,6);
  var grassTex = tex('assets/grass.jpg', 6,6);
  var rockTex  = tex('assets/rock.jpg', 4,4);
  var barkTex  = tex('assets/bark.jpg', 1,2);
  var leafTex  = loader.load('assets/palm_leaf.png'); leafTex.flipY=false; leafTex.premultiplyAlpha=true;

  function perlin(x,y){
    function rnd(ix,iy){ var s = Math.sin(ix*127.1 + iy*311.7)*43758.5453; return s - Math.floor(s); }
    function mix(a,b,t){ return a*(1-t)+b*t; }
    var ix = Math.floor(x), fx = x-ix;
    var iy = Math.floor(y), fy = y-iy;
    var v00 = rnd(ix,iy), v10=rnd(ix+1,iy), v01=rnd(ix,iy+1), v11=rnd(ix+1,iy+1);
    var i1 = mix(v00,v10,fx), i2 = mix(v01,v11,fx);
    return mix(i1,i2,fy);
  }
  function fractal(x,y){
    var a=0, amp=1, freq=1, sumAmp=0;
    for (var o=0;o<5;o++){ a += perlin(x*freq,y*freq)*amp; sumAmp+=amp; amp*=0.5; freq*=2.0; }
    return a/sumAmp;
  }

  var size=300, seg=240;
  var geo = new THREE.PlaneGeometry(size,size,seg,seg);
  geo.rotateX(-Math.PI/2);
  var pos = geo.attributes.position;
  var colors = [];
  for (var i=0;i<pos.count;i++){
    var x = pos.getX(i), z = pos.getZ(i);
    var nx = (x+size*0.5)/size*3.0, nz=(z+size*0.5)/size*3.0;
    var r = Math.sqrt((x*x+z*z))/ (size*0.5);
    var mask = Math.max(0.0, 1.0 - Math.pow(r, 2.5));
    var h = fractal(nx,nz)*35*mask;
    pos.setY(i, h*0.6);
    var c;
    if (mask<0.05){ c = new THREE.Color(0x0d3b66); }
    else if (h<3){ c = new THREE.Color(0xe6d6a8); }
    else if (h<12){ c = new THREE.Color(0x7fb36a); }
    else if (h<22){ c = new THREE.Color(0x2c7a4b); }
    else { c = new THREE.Color(0x84898f); }
    colors.push(c.r, c.g, c.b);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  var mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .95, metalness: .02 });
  var terrain = new THREE.Mesh(geo, mat); terrain.receiveShadow = true; scene.add(terrain);

  var waterGeo = new THREE.RingGeometry(size*0.5+2, size*0.5+80, 128,1);
  var waterMat = new THREE.MeshPhysicalMaterial({ color:0x0d3b66, transmission:0.4, transparent:true, opacity:0.9, roughness:0.2, metalness:0.0, clearcoat:0.6 });
  var water = new THREE.Mesh(waterGeo, waterMat); water.rotation.x=-Math.PI/2; water.position.y=0.1; scene.add(water);

  function makePalm(sx,sz,scale){
    var g = new THREE.Group();
    var segs = 7; var angle = (Math.random()*0.6 - 0.3);
    var y=0, tilt=0;
    for (var i=0;i<segs;i++){
      var trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.22,0.30,3.2,10,1,true), new THREE.MeshStandardMaterial({map:barkTex, roughness:.9}));
      trunk.position.set(0, y+1.6, 0);
      trunk.castShadow=true; trunk.receiveShadow=true;
      trunk.rotation.z = tilt;
      g.add(trunk);
      y += 3.2; tilt += angle/segs;
    }
    var leafMat = new THREE.MeshStandardMaterial({ map:leafTex, transparent:true, side:THREE.DoubleSide, roughness:.6, color:0xffffff });
    var leafGeo = new THREE.PlaneGeometry(5.2, 5.2);
    for (var k=0;k<10;k++){
      var leaf = new THREE.Mesh(leafGeo, leafMat);
      leaf.position.set(0, y, 0);
      leaf.rotation.set(-0.9 + Math.random()*0.25, k*(Math.PI*2/10), 0);
      leaf.castShadow=true; g.add(leaf);
    }
    g.position.set(sx, 0, sz); g.scale.setScalar(scale);
    return g;
  }
  var palms = new THREE.Group(); scene.add(palms);
  for (var i=0;i<80;i++){
    var a = Math.random()*Math.PI*2;
    var r = 100 + Math.random()*30;
    var x = Math.cos(a)*r;
    var z = Math.sin(a)*r;
    palms.add(makePalm(x,z, 0.9+Math.random()*0.5));
  }

  var glowTex = loader.load('assets/glow.png');
  function temple(index){
    var g = new THREE.Group();
    var stone = new THREE.MeshStandardMaterial({color: new THREE.Color().setHSL(0.12+index*0.04, 0.25, 0.70), roughness:0.7, metalness:0.08});
    var base = new THREE.Mesh(new THREE.BoxGeometry(14, 3, 14), stone); base.position.y = 1.5; base.castShadow=base.receiveShadow=true; g.add(base);
    var colMat = new THREE.MeshStandardMaterial({color:0xf3f0ea, roughness:0.55});
    for (var k=0;k<10;k++){
      var col = new THREE.Mesh(new THREE.CylinderGeometry(0.8,0.9,6,18), colMat);
      var ang = k*Math.PI*2/10; col.position.set(Math.cos(ang)*5.5, 5, Math.sin(ang)*5.5);
      col.castShadow=true; g.add(col);
    }
    var roof;
    if (index%5===0) roof = new THREE.Mesh(new THREE.ConeGeometry(7.5,4.5,24), stone);
    if (index%5===1) roof = new THREE.Mesh(new THREE.CylinderGeometry(0,7.5,4.5,24), stone);
    if (index%5===2) roof = new THREE.Mesh(new THREE.DodecahedronGeometry(4.5), stone);
    if (index%5===3){ roof = new THREE.Mesh(new THREE.TorusGeometry(6.5, 1.2, 12, 48), stone); roof.rotation.x=Math.PI/2; roof.position.y=9; }
    if (index%5===4) roof = new THREE.Mesh(new THREE.ConeGeometry(7.5,5.5,4), stone);
    roof.position.y = 8.5; roof.castShadow=true; g.add(roof);
    var spriteMat = new THREE.SpriteMaterial({ map:glowTex, color:0x36c2b6, transparent:true, opacity:0.0, depthWrite:false });
    var glow = new THREE.Sprite(spriteMat); glow.scale.set(16,16,1); glow.position.y = 12; g.add(glow);
    g.userData = { kind:'temple', index:index, label:'Тема '+(index+1), glow:glow };
    return g;
  }
  var temples = new THREE.Group(); scene.add(temples);
  for (var t=0;t<5;t++){
    var g = temple(t);
    g.position.set((t-2)*40, 0, -20 - Math.abs(t-2)*2);
    temples.add(g);
  }

  var labelEl = document.getElementById('label');
  var titleEl = document.getElementById('title');
  var ray = new THREE.Raycaster(); var pointer = new THREE.Vector2();
  var CLICK = {x:0,y:0,time:0}; var selected=null;
  function setPointer(e){
    var rect = canvas.getBoundingClientRect();
    var clientX = (e.touches? e.touches[0].clientX:e.clientX);
    var clientY = (e.touches? e.touches[0].clientY:e.clientY);
    var x = (clientX - rect.left)/rect.width;
    var y = (clientY - rect.top)/rect.height;
    pointer.set(x*2-1, -(y*2-1));
  }
  function pick(){
    ray.setFromCamera(pointer, camera);
    var hits = ray.intersectObjects(temples.children, true);
    return hits[0]||null;
  }
  function showLabelFor(g){
    var pos = g.position.clone(); pos.y += 18;
    var sp = pos.project(camera);
    var sx = (sp.x*0.5+0.5)*window.innerWidth;
    var sy = (-sp.y*0.5+0.5)*window.innerHeight;
    labelEl.style.left = sx+'px'; labelEl.style.top = sy+'px';
    labelEl.textContent = g.userData.label; labelEl.style.opacity = 1;
    labelEl.style.transform = 'translate(-50%,-120%) scale(1)';
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
        selected = g; selected.userData.glow.material.opacity = 0.9;
        titleEl.textContent = 'Нажми ещё раз для подтверждения выбора';
        showLabelFor(selected);
      }
    }
  }
  canvas.addEventListener('mousedown', onDown); canvas.addEventListener('mouseup', onUp);
  canvas.addEventListener('touchstart', onDown, {passive:false}); canvas.addEventListener('touchend', onUp);

  var clock = new THREE.Clock();
  function loop(){
    var t = clock.getElapsedTime();
    for (var i=0;i<palms.children.length;i++){
      var p = palms.children[i];
      p.rotation.z = Math.sin(t*0.6 + i)*0.03;
    }
    controls.update();
    renderer.render(scene,camera);
    requestAnimationFrame(loop);
  }
  loop();

  window.addEventListener('resize', function(){
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth/window.innerHeight; camera.updateProjectionMatrix();
  });
})();
