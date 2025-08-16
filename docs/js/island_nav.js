
import * as THREE from 'https://unpkg.com/three@0.152.2/build/three.module.js';
import { EffectComposer } from 'https://unpkg.com/three@0.152.2/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://unpkg.com/three@0.152.2/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://unpkg.com/three@0.152.2/examples/jsm/postprocessing/UnrealBloomPass.js';
import { FXAAShader } from 'https://unpkg.com/three@0.152.2/examples/jsm/shaders/FXAAShader.js';
import { ShaderPass } from 'https://unpkg.com/three@0.152.2/examples/jsm/postprocessing/ShaderPass.js';

try { Telegram?.WebApp?.ready(); Telegram?.WebApp?.expand(); } catch(e) {}

const STATE = { TEMPLES:'temples', SHELF:'shelf', BOOK:'book' };
let state = STATE.TEMPLES;
const titleEl = document.getElementById('title');
const backBtn = document.getElementById('backBtn');
const intro = document.getElementById('intro');
const introClose = document.getElementById('introClose');
const introBar = document.getElementById('introBar');
const vortex = document.getElementById('vortex');
const bookOverlay = document.getElementById('book');
const readBtn = document.getElementById('readBtn');
const closeBook = document.getElementById('closeBook');
const bookTitle = document.getElementById('bookTitle');

/* Intro */
(function startIntroTimer(){
  const total = 15000; const started = performance.now();
  function tick(){
    const t = performance.now() - started; let k = t/total; if (k>1) k=1;
    introBar.style.width = (k*100).toFixed(1)+'%';
    if (k < 1) requestAnimationFrame(tick); else hideIntro();
  }
  requestAnimationFrame(tick);
})();
function hideIntro(){ intro.style.display='none'; }
introClose.addEventListener('click', hideIntro);

/* Renderer & Scene */
const canvas = document.getElementById('c');
let gl = canvas.getContext('webgl2', { antialias:true, alpha:false });
if (!gl) gl = canvas.getContext('webgl', { antialias:true, alpha:false });

const renderer = new THREE.WebGLRenderer({ canvas, context: gl, powerPreference:'high-performance' });
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio||1));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.06;
renderer.setClearColor(0x0b1422, 1);

const scene = new THREE.Scene();

/* Camera: first-person-ish */
const camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 2000);
const CAM = { baseY: 1.75, radius: 16, theta: 0 };
function updateCamera(){
  camera.position.set(0, CAM.baseY + Math.sin(clock.getElapsedTime()*1.2)*0.03, CAM.radius);
  camera.lookAt(0, 1.2, -8);
}

/* Lights */
const sun = new THREE.DirectionalLight(0xffffff, 1.25); sun.position.set(-30, 60, 20);
const hemi = new THREE.HemisphereLight(0xbcd9ff, 0xe9f2ff, 0.85);
scene.add(sun, hemi);

/* Ground */
const ground = new THREE.Mesh(
  new THREE.CylinderGeometry(60, 60, 0.5, 64),
  new THREE.MeshStandardMaterial({ color: 0x0f263d, roughness: .95, metalness: .02 })
);
ground.position.set(0, 0, -10);
scene.add(ground);

/* Particles: ambient motes */
const particleTex = new THREE.TextureLoader().load('assets/particle_soft.png');
const moteGeom = new THREE.BufferGeometry();
const moteCount = 120;
const positions = new Float32Array(moteCount*3);
const speeds = [];
for (let i=0;i<moteCount;i++){
  positions[i*3+0] = (Math.random()*2-1)*20;
  positions[i*3+1] = Math.random()*6 + 1;
  positions[i*3+2] = -10 + (Math.random()*2-1)*16;
  speeds.push(0.2+Math.random()*0.5);
}
moteGeom.setAttribute('position', new THREE.BufferAttribute(positions,3));
const moteMat = new THREE.PointsMaterial({ size: 0.25, color:0xffffff, map: particleTex, transparent:true, depthWrite:false, opacity:0.65 });
const motes = new THREE.Points(moteGeom, moteMat);
scene.add(motes);

/* Palms */
const palms = new THREE.Group();
function makePalm(x,z,scale=1){
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.28, 3.2, 6), new THREE.MeshStandardMaterial({ color: 0x7b5a39, roughness:.9 }));
  trunk.position.y = 1.6; g.add(trunk);
  for (let i=0;i<5;i++){
    const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.7, 1.4, 8), new THREE.MeshStandardMaterial({ color: 0x2a8a57, roughness:.7 }));
    leaf.position.y = 3.0; leaf.rotation.set(-0.7 + (Math.random()*0.3), i*Math.PI*2/5, 0);
    g.add(leaf);
  }
  g.position.set(x, 0.25, z);
  g.scale.setScalar(scale);
  g.userData.sway = Math.random()*Math.PI*2;
  return g;
}
for (let i=0;i<24;i++){
  const a = Math.random()*Math.PI*2;
  const r = 8 + Math.random()*10;
  palms.add(makePalm(Math.cos(a)*r*0.8, -10 + Math.sin(a)*r*0.8, 0.9+Math.random()*0.4));
}
scene.add(palms);

/* Temples (5) */
const temples = new THREE.Group(); scene.add(temples);
const templeData = [];
function makeTemple(i){
  const g = new THREE.Group();
  const baseColor = new THREE.Color().setHSL(0.55 + i*0.05, 0.15+0.04*i, 0.65 - 0.03*i);
  const mat = new THREE.MeshStandardMaterial({ color: baseColor, roughness:0.45, metalness:0.08, emissive:0x000000 });
  const base = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.2, 2.8), mat); base.position.y = 0.6; g.add(base);
  const body = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.3, 2.6 + i*0.2, 12), mat); body.position.y = 2.0; g.add(body);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(1.6 + i*0.05, 1.0 + i*0.1, 16), mat); roof.position.y = 3.4 + i*0.2; g.add(roof);
  const orb = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 16), new THREE.MeshStandardMaterial({ color: 0x36c2b6, emissive: 0x36c2b6, emissiveIntensity: 0.2 }));
  orb.position.y = roof.position.y + 0.6; g.add(orb);
  const colMat = new THREE.MeshStandardMaterial({ color: baseColor.clone().multiplyScalar(0.9), roughness:0.5 });
  for (let k=0;k<4;k++){
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 1.6, 10), colMat);
    const ang = k*Math.PI/2;
    col.position.set(Math.cos(ang)*1.8, 1.2, Math.sin(ang)*1.8);
    g.add(col);
  }
  g.position.set((i-2)*5.2, 0, -12 - Math.abs(i-2)*1.5);
  g.userData = { kind:'temple', index:i, label:`Тема ${i+1}`, mat, orb, baseColor };
  return g;
}
for (let i=0;i<5;i++){ const t = makeTemple(i); temples.add(t); templeData.push(t); }

/* Post-processing */
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);
const fxaaPass = new ShaderPass(FXAAShader);
function setFXAASize(){
  const dpr = Math.min(2, window.devicePixelRatio||1);
  fxaaPass.material.uniforms['resolution'].value.x = 1 / (window.innerWidth * dpr);
  fxaaPass.material.uniforms['resolution'].value.y = 1 / (window.innerHeight * dpr);
}
setFXAASize(); composer.addPass(fxaaPass);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.65, 0.9, 0.85);
composer.addPass(bloomPass);

/* Raycaster */
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const CLICK = { x:0, y:0, time:0 };
let selectedTemple = null;
let selectedBookIndex = null;

function setPointer(e){
  const rect = canvas.getBoundingClientRect();
  const x = ( (e.touches? e.touches[0].clientX : e.clientX) - rect.left ) / rect.width;
  const y = ( (e.touches? e.touches[0].clientY : e.clientY) - rect.top ) / rect.height;
  pointer.set(x*2-1, -(y*2-1));
}
function pick(group){
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects([group], true);
  return hits[0] || null;
}
function onCanvasDown(e){ setPointer(e); CLICK.x=pointer.x; CLICK.y=pointer.y; CLICK.time=performance.now(); }
function onCanvasUp(e){
  setPointer(e);
  const dt = performance.now() - CLICK.time;
  const dx = Math.abs(pointer.x - CLICK.x);
  const dy = Math.abs(pointer.y - CLICK.y);
  if (dt < 400 && dx < 0.02 && dy < 0.02) handleTap(e);
}
canvas.addEventListener('mousedown', onCanvasDown);
canvas.addEventListener('mouseup', onCanvasUp);
canvas.addEventListener('touchstart', onCanvasDown, {passive:false});
canvas.addEventListener('touchend', onCanvasUp);

/* Shelf */
const shelfGroup = new THREE.Group(); shelfGroup.visible = false; scene.add(shelfGroup);
let highlightedBooks = new Set();
function buildShelf(){
  shelfGroup.clear();
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xe7ebf0, roughness:.95, metalness:0 });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(24, 18), new THREE.MeshStandardMaterial({ color: 0xced8e2, roughness:.98 }));
  floor.rotation.x = -Math.PI/2; floor.position.set(0,0,-12); shelfGroup.add(floor);
  const back = new THREE.Mesh(new THREE.PlaneGeometry(24, 10), wallMat); back.position.set(0,5,-21); shelfGroup.add(back);
  const left = new THREE.Mesh(new THREE.PlaneGeometry(18, 10), wallMat); left.position.set(-12,5,-12); left.rotation.y = Math.PI/2; shelfGroup.add(left);
  const right= new THREE.Mesh(new THREE.PlaneGeometry(18, 10), wallMat); right.position.set( 12,5,-12); right.rotation.y = -Math.PI/2; shelfGroup.add(right);
  const rows = 4, cols = 10; const spacingX=2.0, spacingY=1.8; const startX = - (cols-1)*spacingX*0.5, startY = 7.5;
  const bookMeshes = [];
  for (let r=0;r<rows;r++){
    for (let c=0;c<cols;c++){
      const w = 0.6 + Math.random()*0.3;
      const h = 1.2 + Math.random()*0.6;
      const d = 0.25 + Math.random()*0.15;
      const color = new THREE.Color().setHSL(0.05 + Math.random()*0.95, 0.4+Math.random()*0.3, 0.55+Math.random()*0.2);
      const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), new THREE.MeshStandardMaterial({ color: color, roughness:.8 }));
      m.position.set(startX + c*spacingX, startY - r*spacingY, -20.4);
      m.userData = { kind:'book', title:`Пост ${r*cols+c+1}`, index:r*cols+c };
      bookMeshes.push(m); shelfGroup.add(m);
    }
  }
  highlightedBooks = new Set();
  while(highlightedBooks.size < 5) highlightedBooks.add(Math.floor(Math.random()*bookMeshes.length));
  bookMeshes.forEach((b,i)=>{
    if (highlightedBooks.has(i)){
      b.material.emissive = new THREE.Color(0xffffee);
      b.material.emissiveIntensity = 0.15;
      b.userData.highlight = true;
    }
  });
  shelfGroup.userData.bookMeshes = bookMeshes;
}

function showVortexAt(x,y){
  vortex.style.display='block';
  vortex.style.setProperty('--cx', (x*100).toFixed(1)+'%');
  vortex.style.setProperty('--cy', (y*100).toFixed(1)+'%');
  setTimeout(()=> vortex.style.display='none', 820);
}
function gotoShelf(screenX=0.5, screenY=0.5){
  showVortexAt(screenX, screenY);
  titleEl.textContent = 'Выберите книгу (подсвечено 5)';
  backBtn.style.display = 'inline-flex';
  temples.visible = false;
  shelfGroup.visible = true;
  selectedTemple = null;
  state = STATE.SHELF;
  if (!shelfGroup.userData.bookMeshes) buildShelf();
}
function gotoTemples(){
  titleEl.textContent = 'Нажми на постройку для выбора темы';
  backBtn.style.display = 'none';
  temples.visible = true;
  shelfGroup.visible = false;
  bookOverlay.style.display = 'none';
  selectedBookIndex = null;
  state = STATE.TEMPLES;
}
function openBook(title){
  bookTitle.textContent = title || 'Пост';
  bookOverlay.style.display = 'flex';
  state = STATE.BOOK;
  titleEl.textContent = 'Нажмите «Закрыть» или «Читать»';
  backBtn.style.display = 'inline-flex';
}
backBtn.addEventListener('click', ()=>{
  if (state === STATE.BOOK){
    bookOverlay.style.display='none'; state = STATE.SHELF; titleEl.textContent = 'Выберите книгу (подсвечено 5)';
  } else if (state === STATE.SHELF){
    gotoTemples();
  }
});
closeBook.addEventListener('click', ()=>{
  bookOverlay.style.display='none'; state = STATE.SHELF; titleEl.textContent = 'Выберите книгу (подсвечено 5)';
});
readBtn.addEventListener('click', ()=>{
  const url='https://t.me/c/1928787715/128';
  try { Telegram?.WebApp?.openLink(url); } catch(e){ window.open(url, '_blank'); }
});

function handleTap(e){
  if (state === STATE.TEMPLES){
    const hit = pick(temples); if (!hit) return;
    let g = hit.object;
    while (g && g.parent){ if (g.userData && g.userData.kind==='temple') break; g = g.parent; }
    if (!g || !g.userData) return;
    if (selectedTemple && selectedTemple !== g){
      selectedTemple.userData.mat.emissiveIntensity = 0.0;
      selectedTemple.children.forEach(ch => { if (ch.material && 'emissive' in ch.material) ch.material.emissiveIntensity = 0.0; });
    }
    if (selectedTemple === g){
      titleEl.textContent = 'Нажми ещё раз для подтверждения выбора';
      const rect = canvas.getBoundingClientRect();
      const x = ( (e.touches? e.changedTouches[0].clientX : e.clientX) - rect.left ) / rect.width;
      const y = ( (e.touches? e.changedTouches[0].clientY : e.clientY) - rect.top ) / rect.height;
      setTimeout(()=> gotoShelf(x,y), 120);
    } else {
      selectedTemple = g;
      titleEl.textContent = 'Нажми ещё раз для подтверждения выбора';
      selectedTemple.userData.mat.emissive = new THREE.Color(0x36c2b6);
      selectedTemple.userData.mat.emissiveIntensity = 0.25;
      selectedTemple.children.forEach(ch => { if (ch.material && 'emissive' in ch.material){ ch.material.emissive = new THREE.Color(0x36c2b6); ch.material.emissiveIntensity = 0.2; } });
    }
  } else if (state === STATE.SHELF){
    const hit = pick(shelfGroup); if (!hit || !hit.object || !hit.object.userData) return;
    const b = hit.object;
    if (b.userData.kind !== 'book') return;
    if (selectedBookIndex === b.userData.index){
      openBook(b.userData.title);
    } else {
      selectedBookIndex = b.userData.index;
      titleEl.textContent = 'Нажми ещё раз для подтверждения выбора';
      if (!b.material.emissive){ b.material.emissive = new THREE.Color(0xffffff); }
      b.material.emissiveIntensity = 0.35;
      setTimeout(()=> { if (state===STATE.SHELF && selectedBookIndex===b.userData.index) b.material.emissiveIntensity = 0.22; }, 320);
    }
  }
}
canvas.addEventListener('click', handleTap);

/* Audio */
const audOcean = document.getElementById('audOcean');
const audWind  = document.getElementById('audWind');
const audBirds = document.getElementById('audBirds');
function startAudio(){
  const vol = 0.2;
  [audOcean, audWind, audBirds].forEach((a)=>{ try{ a.volume = vol; a.play().catch(()=>{});}catch(e){} });
}
document.addEventListener('click', startAudio, { once:true });
document.addEventListener('touchstart', startAudio, { once:true });

/* Animation + Post-process render */
const clock = new THREE.Clock();
function loop(){
  const t = clock.getElapsedTime();
  // motes
  const arr = motes.geometry.attributes.position.array;
  for (let i=0;i<moteCount;i++){
    arr[i*3+1] += 0.015*speeds[i];
    if (arr[i*3+1] > 8) arr[i*3+1] = 1 + Math.random()*2;
  }
  motes.geometry.attributes.position.needsUpdate = true;

  palms.children.forEach(p => {
    const f = p.userData.sway;
    p.rotation.z = Math.sin(t*0.6 + f)*0.03;
    p.rotation.x = Math.cos(t*0.5 + f)*0.015;
  });

  templeData.forEach((g,i)=>{
    const k = 0.12 + Math.sin(t*1.2 + i)*0.08;
    if (g.userData.mat) g.userData.mat.emissiveIntensity = (selectedTemple===g ? 0.25 : 0.08 + k);
    if (g.userData.orb) g.userData.orb.material.emissiveIntensity = 0.2 + k*0.6;
  });

  updateCamera();
  composer.render();
  requestAnimationFrame(loop);
}
function onResize(){
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  composer.setSize(window.innerWidth, window.innerHeight);
  setFXAASize();
}
window.addEventListener('resize', onResize);

loop();
titleEl.textContent = 'Нажми на постройку для выбора темы';
