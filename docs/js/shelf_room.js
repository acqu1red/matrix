
import * as THREE from 'https://unpkg.com/three@0.152.2/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.152.2/examples/jsm/controls/OrbitControls.js';

try{Telegram?.WebApp?.ready();Telegram?.WebApp?.expand();}catch(e){}

const titleEl = document.getElementById('title');
const backBtn = document.getElementById('backBtn');
const vortex  = document.getElementById('vortex');
const bookOverlay = document.getElementById('book');
const readBtn = document.getElementById('readBtn');
const closeBook = document.getElementById('closeBook');
const bookTitle = document.getElementById('bookTitle');

const params = new URLSearchParams(location.search);
const theme = params.get('theme') || '1';

const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:false});
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio||1));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.setClearColor(0x0b1422, 1);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, innerWidth/innerHeight, 0.1, 2000);
camera.position.set(0, 6.0, 16);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enablePan = false; controls.minDistance = 8; controls.maxDistance = 28; controls.maxPolarAngle = Math.PI*0.47;
controls.target.set(0,3,-14); controls.update();

const sun = new THREE.DirectionalLight(0xffffff, 1.05); sun.position.set(-20, 35, 10);
sun.castShadow = true; sun.shadow.mapSize.set(2048,2048);
sun.shadow.camera.left=-30; sun.shadow.camera.right=30; sun.shadow.camera.top=30; sun.shadow.camera.bottom=-30;
scene.add(sun);
scene.add(new THREE.HemisphereLight(0xdfe9ff,0xb7c4d9,0.6));

const plaster = new THREE.TextureLoader().load('assets/plaster_4k.jpg'); plaster.wrapS=plaster.wrapT=THREE.RepeatWrapping; plaster.repeat.set(2,1);
const wood = new THREE.TextureLoader().load('assets/wood_4k.jpg'); wood.wrapS=wood.wrapT=THREE.RepeatWrapping; wood.repeat.set(2,2);

const floor = new THREE.Mesh(new THREE.PlaneGeometry(36, 24), new THREE.MeshStandardMaterial({ map: wood, roughness:.9 }));
floor.rotation.x = -Math.PI/2; floor.position.set(0,0,-12); floor.receiveShadow=true; scene.add(floor);
const back  = new THREE.Mesh(new THREE.PlaneGeometry(36, 16), new THREE.MeshStandardMaterial({ map: plaster, roughness:.98 }));
back.position.set(0,8,-24); back.receiveShadow=true; scene.add(back);
const left  = new THREE.Mesh(new THREE.PlaneGeometry(24, 16), new THREE.MeshStandardMaterial({ map: plaster, roughness:.98 }));
left.position.set(-18,8,-12); left.rotation.y = Math.PI/2; left.receiveShadow=true; scene.add(left);
const right = new THREE.Mesh(new THREE.PlaneGeometry(24, 16), new THREE.MeshStandardMaterial({ map: plaster, roughness:.98 }));
right.position.set( 18,8,-12); right.rotation.y = -Math.PI/2; right.receiveShadow=true; scene.add(right);

const shelf = new THREE.Group(); scene.add(shelf);
const plankMat = new THREE.MeshStandardMaterial({ map: wood, roughness:.85 });
for (let i=0;i<5;i++){
  const plank = new THREE.Mesh(new THREE.BoxGeometry(26, .5, 2.4), plankMat);
  plank.position.set(0, 12 - i*3, -22.8);
  plank.castShadow=true; plank.receiveShadow=true;
  shelf.add(plank);
}
for (let i=0;i<3;i++){
  const post = new THREE.Mesh(new THREE.BoxGeometry(.5, 14.5, 2.4), plankMat);
  post.position.set(-12 + i*12, 8, -22.8);
  post.castShadow=true; post.receiveShadow=true; shelf.add(post);
}

const bookMeshes = [];
const rows = 5, cols = 12;
const startY = 12; const spacingY = 3;
for (let r=0;r<rows;r++){
  let x = -12.0;
  for (let c=0;c<cols;c++){
    const w = 0.6 + Math.random()*0.5;
    const h = 2.2 + Math.random()*0.9;
    const d = 0.3 + Math.random()*0.25;
    const idx = (r*cols+c)%30 + 1;
    const tex = new THREE.TextureLoader().load(`assets/book_spine_${idx.toString().padStart(2,'0')}.jpg`);
    tex.wrapS=tex.wrapT=THREE.ClampToEdgeWrapping;
    const mat = new THREE.MeshStandardMaterial({ map: tex, roughness:.7 });
    const geo = new THREE.BoxGeometry(w, h, d);
    const m = new THREE.Mesh(geo, mat);
    m.castShadow = true; m.receiveShadow = true;
    m.position.set(x + w/2, startY - r*spacingY, -22.1);
    x += w + 0.25;
    m.userData = { kind:'book', title:`Пост ${(r*cols+c)+1}` };
    bookMeshes.push(m); shelf.add(m);
  }
}

let highlighted = new Set();
while (highlighted.size < 5) highlighted.add(Math.floor(Math.random()*bookMeshes.length));
bookMeshes.forEach((b,i)=>{
  if (highlighted.has(i)){
    b.userData.highlight = true;
    b.material.emissive = new THREE.Color(0xffffee);
    b.material.emissiveIntensity = 0.18;
  }
});

const raycaster = new THREE.Raycaster(); const pointer = new THREE.Vector2();
let selectedIndex = null;
function setPointer(e){
  const rect = canvas.getBoundingClientRect();
  const x = ((e.touches?e.touches[0].clientX:e.clientX)-rect.left)/rect.width;
  const y = ((e.touches?e.touches[0].clientY:e.clientY)-rect.top)/rect.height;
  pointer.set(x*2-1, -(y*2-1));
}
function pick(){
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(bookMeshes, true);
  return hits[0]||null;
}
function onClick(e){
  setPointer(e);
  const hit = pick(); if (!hit) return;
  const b = hit.object;
  const idx = bookMeshes.indexOf(b);
  if (selectedIndex === idx){
    openBook(b.userData.title);
  } else {
    if (selectedIndex!=null){ const prev = bookMeshes[selectedIndex]; if (prev && prev.material.emissiveIntensity) prev.material.emissiveIntensity = prev.userData.highlight?0.18:0.0; }
    selectedIndex = idx;
    titleEl.textContent = 'Нажми ещё раз для подтверждения выбора';
    if (!b.material.emissive){ b.material.emissive = new THREE.Color(0xffffff); }
    b.material.emissiveIntensity = 0.35;
  }
}
canvas.addEventListener('click', onClick);

function openBook(title){
  bookTitle.textContent = title || 'Пост';
  bookOverlay.style.display='flex';
  titleEl.textContent = 'Нажмите «Закрыть» или «Читать»';
}
closeBook.addEventListener('click', ()=>{
  bookOverlay.style.display='none';
  titleEl.textContent = 'Выберите книгу (подсвечено 5)';
});
readBtn.addEventListener('click', ()=>{
  const url='https://t.me/c/1928787715/128';
  try{Telegram?.WebApp?.openLink(url);}catch(e){window.open(url,'_blank');}
});

backBtn.addEventListener('click', ()=>{
  vortex.style.display='block'; vortex.style.setProperty('--cx','50%'); vortex.style.setProperty('--cy','80%');
  setTimeout(()=>{
    try{ Telegram?.WebApp?.openLink('island_nav.html'); }catch(e){ location.href='island_nav.html'; }
  }, 520);
});

const clock = new THREE.Clock();
function loop(){
  const t = clock.getElapsedTime();
  for (let i=0;i<bookMeshes.length;i++){
    if (bookMeshes[i].userData.highlight){
      bookMeshes[i].rotation.z = Math.sin(t*1.5 + i)*0.005;
    }
  }
  renderer.render(scene,camera);
  requestAnimationFrame(loop);
}
function onResize(){ renderer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth/innerHeight; camera.updateProjectionMatrix(); }
addEventListener('resize', onResize);
loop();
