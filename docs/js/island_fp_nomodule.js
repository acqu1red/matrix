
(function(){
  try{Telegram && Telegram.WebApp && Telegram.WebApp.ready(); Telegram.WebApp.expand();}catch(e){}

  var titleEl = document.getElementById('title');
  var enterBtn = document.getElementById('enter');
  var exitBtn  = document.getElementById('exit');
  var labelEl  = document.getElementById('label');
  var canvas   = document.getElementById('c');

  var renderer = new THREE.WebGLRenderer({canvas:canvas, antialias:true, alpha:false, powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio||1));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.06;
  renderer.setClearColor(0x0b1422, 1);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  var scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0b1422, 0.0022);

  var camera = new THREE.PerspectiveCamera(62, window.innerWidth/window.innerHeight, 0.1, 4000);
  camera.position.set(0, 3, 80);
  var controls = new THREE.PointerLockControls(camera, document.body);
  var orbitFallback = new THREE.OrbitControls(camera, renderer.domElement);
  orbitFallback.enablePan = false; orbitFallback.enableDamping = true;
  orbitFallback.minDistance = 10; orbitFallback.maxDistance = 220; orbitFallback.maxPolarAngle = Math.PI*0.49;
  orbitFallback.target.set(0,6,0); orbitFallback.update();

  var hemi = new THREE.HemisphereLight(0xcfe8ff, 0x224155, 0.95); scene.add(hemi);
  var sun = new THREE.DirectionalLight(0xffffff, 1.2);
  sun.position.set(-180,230,110); sun.castShadow = true; sun.shadow.mapSize.set(2048,2048);
  sun.shadow.camera.left=-220; sun.shadow.camera.right=220; sun.shadow.camera.top=220; sun.shadow.camera.bottom=-220;
  scene.add(sun);

  var loader = new THREE.TextureLoader();
  function t(url, repX, repY){
    var tx = loader.load(url); tx.encoding = THREE.sRGBEncoding; tx.wrapS=tx.wrapT=THREE.RepeatWrapping; tx.repeat.set(repX||1, repY||1); return tx;
  }
  var sandTex  = t('assets/sand.jpg', 6, 6);
  var grassTex = t('assets/grass.jpg', 6, 6);
  var rockTex  = t('assets/rock.jpg', 4, 4);
  var barkTex  = t('assets/bark.jpg', 1, 2);
  var leafTex  = loader.load('assets/palm_leaf.png'); leafTex.flipY=false; leafTex.premultiplyAlpha=true;

  function perlin(x,y){ function rnd(ix,iy){ var s=Math.sin(ix*127.1+iy*311.7)*43758.5453; return s-Math.floor(s); }
    function mix(a,b,t){ return a*(1-t)+b*t; } var ix=Math.floor(x),fx=x-ix, iy=Math.floor(y),fy=y-iy;
    var v00=rnd(ix,iy), v10=rnd(ix+1,iy), v01=rnd(ix,iy+1), v11=rnd(ix+1,iy+1);
    var i1=mix(v00,v10,fx), i2=mix(v01,v11,fx); return mix(i1,i2,fy); }
  function fractal(x,y){ var a=0,amp=1,freq=1,sum=0; for(var o=0;o<5;o++){ a+=perlin(x*freq,y*freq)*amp; sum+=amp; amp*=0.5; freq*=2;} return a/sum; }

  var size=300, seg=240;
  var geo = new THREE.PlaneGeometry(size,size,seg,seg); geo.rotateX(-Math.PI/2);
  var pos = geo.attributes.position; var colors=[];
  for (var i=0;i<pos.count;i++){
    var x=pos.getX(i), z=pos.getZ(i);
    var nx=(x+size*0.5)/size*3.0, nz=(z+size*0.5)/size*3.0;
    var r=Math.sqrt(x*x+z*z)/(size*0.5);
    var mask=Math.max(0.0, 1.0-Math.pow(r,2.5));
    var h=fractal(nx,nz)*35*mask;
    pos.setY(i, h*0.6);
    var c; if(mask<0.05) c=new THREE.Color(0x0d3b66);
    else if(h<3) c=new THREE.Color(0xe6d6a8);
    else if(h<12) c=new THREE.Color(0x7fb36a);
    else if(h<22) c=new THREE.Color(0x2c7a4b);
    else c=new THREE.Color(0x84898f);
    colors.push(c.r,c.g,c.b);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors,3));
  geo.computeVertexNormals();
  var terrain = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors:true, roughness:.9, metalness:.02 }));
  terrain.receiveShadow = true; scene.add(terrain);

  var vertsW = seg+1, vertsH = seg+1;
  var heights = new Float32Array(vertsW*vertsH);
  for (var i=0;i<pos.count;i++){ heights[i]=pos.getY(i); }
  function heightAt(x,z){
    var lx = (x/size + 0.5) * seg;
    var lz = (z/size + 0.5) * seg;
    if (lx<0||lx>seg||lz<0||lz>seg) return 0;
    var x0=Math.floor(lx), z0=Math.floor(lz), x1=Math.min(seg,x0+1), z1=Math.min(seg,z0+1);
    var sx=lx-x0, sz=lz-z0;
    var h00 = heights[z0*vertsW + x0], h10 = heights[z0*vertsW + x1];
    var h01 = heights[z1*vertsW + x0], h11 = heights[z1*vertsW + x1];
    var h0 = h00*(1-sx)+h10*sx; var h1 = h01*(1-sx)+h11*sx;
    return (h0*(1-sz)+h1*sz)*0.6;
  }

  var waterGeo = new THREE.RingGeometry(size*0.5+2, size*0.5+120, 128,1);
  var waterMat = new THREE.MeshPhysicalMaterial({ color:0x0d3b66, transmission:0.35, transparent:true, opacity:0.95, roughness:0.28, metalness:0.0, clearcoat:0.5 });
  var water = new THREE.Mesh(waterGeo, waterMat); water.rotation.x=-Math.PI/2; water.position.y=0.1; scene.add(water);

  function makePalm(sx,sz,scale){
    var g=new THREE.Group(); var segs=7, angle=(Math.random()*0.6-0.3), y=0, tilt=0;
    for (var i=0;i<segs;i++){
      var trunk=new THREE.Mesh(new THREE.CylinderGeometry(0.22,0.30,3.2,10,1,true), new THREE.MeshStandardMaterial({map:barkTex, roughness:.9}));
      trunk.position.set(0, y+1.6, 0); trunk.castShadow=trunk.receiveShadow=true; trunk.rotation.z=tilt; g.add(trunk);
      y+=3.2; tilt+=angle/segs;
    }
    var leafMat=new THREE.MeshStandardMaterial({ map:leafTex, transparent:true, side:THREE.DoubleSide, roughness:.6, color:0xffffff });
    var leafGeo=new THREE.PlaneGeometry(5.2,5.2);
    for (var k=0;k<10;k++){ var leaf=new THREE.Mesh(leafGeo,leafMat); leaf.position.set(0,y,0); leaf.rotation.set(-0.9+Math.random()*0.25, k*(Math.PI*2/10), 0); leaf.castShadow=true; g.add(leaf); }
    g.position.set(sx, 0, sz); g.scale.setScalar(scale);
    return g;
  }
  var palms=new THREE.Group(); scene.add(palms);
  for (var i=0;i<120;i++){
    var a=Math.random()*Math.PI*2, r=85+Math.random()*40;
    var x=Math.cos(a)*r, z=Math.sin(a)*r;
    palms.add(makePalm(x,z,0.9+Math.random()*0.5));
  }

  var glowTex=loader.load('assets/glow.png');
  function temple(index){
    var g=new THREE.Group();
    var stone=new THREE.MeshStandardMaterial({ map:rockTex, color:0xffffff, roughness:0.7, metalness:0.08 });
    var base=new THREE.Mesh(new THREE.BoxGeometry(18,4,18), stone); base.position.y=2; base.castShadow=base.receiveShadow=true; g.add(base);
    var colMat=new THREE.MeshStandardMaterial({color:0xf3f0ea, roughness:0.55});
    for (var k=0;k<12;k++){ var col=new THREE.Mesh(new THREE.CylinderGeometry(0.9,1.0,8,18), colMat);
      var ang=k*Math.PI*2/12; col.position.set(Math.cos(ang)*7, 6, Math.sin(ang)*7); col.castShadow=true; g.add(col); }
    var roof; switch(index%5){
      case 0: roof = new THREE.Mesh(new THREE.ConeGeometry(9,6,28), stone); break;
      case 1: roof = new THREE.Mesh(new THREE.CylinderGeometry(0,9,6,28), stone); break;
      case 2: roof = new THREE.Mesh(new THREE.DodecahedronGeometry(6), stone); break;
      case 3: roof = new THREE.Mesh(new THREE.TorusGeometry(8.2, 1.4, 14, 48), stone); roof.rotation.x=Math.PI/2; roof.position.y=11; break;
      case 4: roof = new THREE.Mesh(new THREE.ConeGeometry(9,7.2,6), stone); break;
    }
    roof.position.y = 11; roof.castShadow=true; g.add(roof);
    var sprite=new THREE.Sprite(new THREE.SpriteMaterial({ map:glowTex, color:0x36c2b6, transparent:true, opacity:0.0, depthWrite:false }));
    sprite.scale.set(20,20,1); sprite.position.y=14; g.add(sprite);
    g.userData={ kind:'temple', index:index, label:'Тема '+(index+1), glow:sprite };
    return g;
  }
  var temples=new THREE.Group(); scene.add(temples);
  for (var t=0;t<5;t++){ var g=temple(t); g.position.set((t-2)*42, 0, -20 - t*22); temples.add(g); }

  function showLabelFor(g){
    var pos=g.position.clone(); pos.y+=20;
    var sp=pos.project(camera); var sx=(sp.x*0.5+0.5)*window.innerWidth; var sy=(-sp.y*0.5+0.5)*window.innerHeight;
    labelEl.style.left=sx+'px'; labelEl.style.top=sy+'px'; labelEl.textContent=g.userData.label; labelEl.style.opacity=1; labelEl.style.transform='translate(-50%,-120%) scale(1)';
  }
  function pickFromCenter(){
    var ray=new THREE.Raycaster();
    ray.setFromCamera(new THREE.Vector2(0,0), camera);
    var hits = ray.intersectObjects(temples.children, true);
    return hits[0]||null;
  }

  function activate(){
    function locked(){ titleEl.textContent='WASD — ходьба, мышь — обзор. Наведи прицел на храм и кликни 2 раза'; }
    function unlocked(){ titleEl.textContent='Нажмите «Войти в режим» и идите к храмам'; }
    controls.addEventListener('lock', locked); controls.addEventListener('unlock', unlocked);
    controls.lock();
  }
  enterBtn.addEventListener('click', function(){ activate(); });
  exitBtn.addEventListener('click', function(){ controls.unlock(); });

  var moveF=false, moveB=false, moveL=false, moveR=false;
  var velocity=new THREE.Vector3(); var dir=new THREE.Vector3();
  function onKey(e,down){
    switch(e.code){
      case 'KeyW': case 'ArrowUp': moveF=down; break;
      case 'KeyS': case 'ArrowDown': moveB=down; break;
      case 'KeyA': case 'ArrowLeft': moveL=down; break;
      case 'KeyD': case 'ArrowRight': moveR=down; break;
    }
  }
  document.addEventListener('keydown', (e)=>onKey(e,true));
  document.addEventListener('keyup',   (e)=>onKey(e,false));

  var clock=new THREE.Clock();
  function loop(){
    var dt=Math.min(0.05, clock.getDelta());
    if (controls.isLocked){
      dir.set(0,0,0);
      if (moveF) dir.z -= 1; if (moveB) dir.z += 1; if (moveL) dir.x -= 1; if (moveR) dir.x += 1;
      dir.normalize();
      var speed = 28; // units/sec
      var yaw = camera.rotation.y;
      var sin=Math.sin(yaw), cos=Math.cos(yaw);
      var dx = dir.x*cos - dir.z*sin; var dz = dir.x*sin + dir.z*cos;
      velocity.x = dx*speed*dt; velocity.z = dz*speed*dt;

      var obj = controls.getObject();
      obj.position.x += velocity.x; obj.position.z += velocity.z;

      var rad = Math.sqrt(obj.position.x*obj.position.x + obj.position.z*obj.position.z);
      var maxR = size*0.5 - 6; if (rad>maxR){ obj.position.x *= maxR/rad; obj.position.z *= maxR/rad; }

      var h = heightAt(obj.position.x, obj.position.z);
      var eye = h + 2.0; obj.position.y += (eye - obj.position.y) * Math.min(1, dt*6);
    } else {
      orbitFallback.update();
    }

    // sway palms
    for (var i=0;i<palms.children.length;i++){ var p=palms.children[i]; p.rotation.z = Math.sin((performance.now()*0.001)*0.9 + i)*0.03; }

    renderer.render(scene,camera);
    requestAnimationFrame(loop);
  }
  loop();

  document.addEventListener('click', function(){
    var hit = pickFromCenter(); if (!hit) return;
    var g=hit.object; while (g && g.parent){ if (g.userData && g.userData.kind==='temple') break; g=g.parent; }
    if (!g) return;
    if (window.__selected===g){
      var url='shelf_room.html?theme='+(g.userData.index+1);
      try{ Telegram && Telegram.WebApp && Telegram.WebApp.openLink(url,{try_instant_view:true}); }catch(e){ location.href=url; }
    } else {
      if (window.__selected) window.__selected.userData.glow.material.opacity=0.0;
      window.__selected=g; g.userData.glow.material.opacity=0.95; showLabelFor(g);
      titleEl.textContent='Нажми ещё раз по храму для входа';
    }
  });

  window.addEventListener('resize', function(){
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth/window.innerHeight; camera.updateProjectionMatrix();
  });
})();
