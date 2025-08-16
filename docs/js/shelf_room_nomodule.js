
(function(){
  try{Telegram && Telegram.WebApp && Telegram.WebApp.ready(); Telegram.WebApp.expand();}catch(e){}

  var titleEl = document.getElementById('title');
  var backBtn = document.getElementById('backBtn');
  var bookOverlay = document.getElementById('book');
  var readBtn = document.getElementById('readBtn');
  var closeBook = document.getElementById('closeBook');
  var bookTitle = document.getElementById('bookTitle');

  var canvas = document.getElementById('c');
  var renderer = new THREE.WebGLRenderer({canvas:canvas, antialias:true, alpha:false});
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio||1));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(0x0b1422, 1);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(55, window.innerWidth/window.innerHeight, 0.1, 2000);
  camera.position.set(0, 6.0, 16);
  var controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enablePan = false; controls.minDistance = 8; controls.maxDistance = 28; controls.maxPolarAngle = Math.PI*0.47;
  controls.target.set(0,3,-14); controls.update();

  var sun = new THREE.DirectionalLight(0xffffff, 1.05); sun.position.set(-20, 35, 10);
  sun.castShadow = true; sun.shadow.mapSize.set(1024,1024);
  sun.shadow.camera.left=-30; sun.shadow.camera.right=30; sun.shadow.camera.top=30; sun.shadow.camera.bottom=-30;
  scene.add(sun);
  scene.add(new THREE.HemisphereLight(0xdfe9ff,0xb7c4d9,0.6));

  // Room
  var floor = new THREE.Mesh(new THREE.PlaneGeometry(36, 24), new THREE.MeshStandardMaterial({ color:0x8a6a46, roughness:.9 }));
  floor.rotation.x = -Math.PI/2; floor.position.set(0,0,-12); floor.receiveShadow=true; scene.add(floor);
  var back  = new THREE.Mesh(new THREE.PlaneGeometry(36, 16), new THREE.MeshStandardMaterial({ color:0xf1f3f7, roughness:.98 }));
  back.position.set(0,8,-24); back.receiveShadow=true; scene.add(back);
  var left  = new THREE.Mesh(new THREE.PlaneGeometry(24, 16), new THREE.MeshStandardMaterial({ color:0xf1f3f7, roughness:.98 }));
  left.position.set(-18,8,-12); left.rotation.y = Math.PI/2; left.receiveShadow=true; scene.add(left);
  var right = new THREE.Mesh(new THREE.PlaneGeometry(24, 16), new THREE.MeshStandardMaterial({ color:0xf1f3f7, roughness:.98 }));
  right.position.set( 18,8,-12); right.rotation.y = -Math.PI/2; right.receiveShadow=true; scene.add(right);

  // Shelf
  var shelf = new THREE.Group(); scene.add(shelf);
  var plankMat = new THREE.MeshStandardMaterial({ color:0x9b734f, roughness:.85 });
  for (var i=0;i<5;i++){
    var plank = new THREE.Mesh(new THREE.BoxGeometry(26, .5, 2.4), plankMat);
    plank.position.set(0, 12 - i*3, -22.8);
    plank.castShadow=true; plank.receiveShadow=true;
    shelf.add(plank);
  }
  for (var j=0;j<3;j++){
    var post = new THREE.Mesh(new THREE.BoxGeometry(.5, 14.5, 2.4), plankMat);
    post.position.set(-12 + j*12, 8, -22.8);
    post.castShadow=true; post.receiveShadow=true; shelf.add(post);
  }

  // Books
  var bookMeshes = [];
  var rows = 5, cols = 12; var startY = 12; var spacingY = 3;
  for (var r=0;r<rows;r++){
    var x = -12.0;
    for (var c=0;c<cols;c++){
      var w = 0.6 + Math.random()*0.5;
      var h = 2.2 + Math.random()*0.9;
      var d = 0.3 + Math.random()*0.25;
      var col = new THREE.Color().setHSL((r*cols+c)/80, .5, .55);
      var m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), new THREE.MeshStandardMaterial({ color: col, roughness:.7 }));
      m.castShadow = true; m.receiveShadow = true;
      m.position.set(x + w/2, startY - r*spacingY, -22.1);
      x += w + 0.25;
      m.userData = { kind:'book', title:'Пост '+((r*cols+c)+1) };
      bookMeshes.push(m); shelf.add(m);
    }
  }
  var highlighted = new Set(); while (highlighted.size < 5) highlighted.add(Math.floor(Math.random()*bookMeshes.length));
  bookMeshes.forEach(function(b,i){
    if (highlighted.has(i)){
      b.userData.highlight = true;
      b.material.emissive = new THREE.Color(0xffffee);
      b.material.emissiveIntensity = 0.18;
    }
  });

  // Interactions
  var raycaster = new THREE.Raycaster(); var pointer = new THREE.Vector2();
  var selectedIndex = null;
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
    var hits = raycaster.intersectObjects(bookMeshes, true);
    return hits[0]||null;
  }
  canvas.addEventListener('click', function(e){
    setPointer(e);
    var hit = pick(); if (!hit) return;
    var b = hit.object;
    var idx = bookMeshes.indexOf(b);
    if (selectedIndex === idx){
      openBook(b.userData.title);
    } else {
      if (selectedIndex!=null){ var prev = bookMeshes[selectedIndex]; if (prev && prev.material.emissiveIntensity) prev.material.emissiveIntensity = prev.userData.highlight?0.18:0.0; }
      selectedIndex = idx;
      titleEl.textContent = 'Нажми ещё раз для подтверждения выбора';
      if (!b.material.emissive){ b.material.emissive = new THREE.Color(0xffffff); }
      b.material.emissiveIntensity = 0.35;
    }
  });

  function openBook(title){
    bookTitle.textContent = title || 'Пост';
    bookOverlay.style.display='flex';
    titleEl.textContent = 'Нажмите «Закрыть» или «Читать»';
  }
  closeBook.addEventListener('click', function(){
    bookOverlay.style.display='none';
    titleEl.textContent = 'Выберите книгу (подсвечено 5)';
  });
  readBtn.addEventListener('click', function(){
    var url='https://t.me/c/1928787715/128';
    try{ Telegram && Telegram.WebApp && Telegram.WebApp.openLink(url); }catch(e){ window.open(url,'_blank'); }
  });
  backBtn.addEventListener('click', function(){
    try{ Telegram && Telegram.WebApp && Telegram.WebApp.openLink('island_nav.html'); }catch(e){ location.href='island_nav.html'; }
  });

  var clock = new THREE.Clock();
  function loop(){
    renderer.render(scene,camera);
    requestAnimationFrame(loop);
  }
  loop();

  window.addEventListener('resize', function(){
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth/window.innerHeight; camera.updateProjectionMatrix();
  });
})();
