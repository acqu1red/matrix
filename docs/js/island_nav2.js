
import * as THREE from 'https://unpkg.com/three@0.152.2/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.152.2/examples/jsm/controls/OrbitControls.js';

const $ = (s)=>document.querySelector(s);
const log = (...a)=>{ try{ console.log(...a); const el=$("#debug"); el.style.opacity=".6"; el.textContent = a.map(String).join(" ")+"\n"+el.textContent.slice(0,1000);}catch(e){} };
window.addEventListener('error', (e)=>{ log('JS ERROR:', e.message); });
window.addEventListener('unhandledrejection',(e)=>{ log('PROMISE REJECTION:', e.reason); });

try{Telegram?.WebApp?.ready();Telegram?.WebApp?.expand();}catch(e){}

const titleEl = $('#title');
const vortex  = $('#vortex');
const labelEl = $('#label');

const canvas = $('#c');
const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:false, powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio||1));
renderer.setSize(innerWidth, innerHeight, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;
renderer.setClearColor(0x0b1422, 1);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, innerWidth/innerHeight, 0.1, 3000);
camera.position.set(0, 6.5, 22);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enablePan = false;
controls.minDistance = 8; controls.maxDistance = 45; controls.maxPolarAngle = Math.PI * 0.47;
controls.target.set(0,2,-10); controls.update();

const hemi = new THREE.HemisphereLight(0xbcd9ff, 0x22334a, 0.8); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffffff, 1.25);
sun.position.set(-30, 60, 20); sun.castShadow = true; sun.shadow.mapSize.set(1024,1024);
sun.shadow.camera.left=-50; sun.shadow.camera.right=50; sun.shadow.camera.top=50; sun.shadow.camera.bottom=-50;
scene.add(sun);

const loader = new THREE.TextureLoader();
function safeTex(url){
  return new Promise((res)=>{
    loader.load(url, (tx)=>{ tx.wrapS=tx.wrapT=THREE.RepeatWrapping; res(tx); }, undefined, ()=>{ res(null); });
  });
}

let sandTex = null, stoneTex = null, glowTex = null;
Promise.all([
  safeTex('assets/sand_4k.jpg'),
  safeTex('assets/temple_stone_4k.jpg'),
  safeTex('assets/glow.png')
]).then(([sand, stone, glow])=>{
  sandTex = sand; stoneTex = stone; glowTex = glow;
  build();
}).catch((e)=>{ log('Promise all error', e); build(); });

function build(){
  const groundMat = sandTex ? new THREE.MeshStandardMaterial({map:sandTex, roughness:.95, metalness:.02}) :
                              new THREE.MeshStandardMaterial({color:0xd7c8a4, roughness:.95});
  if (sandTex){ sandTex.repeat.set(6,6); }
  const ground = new THREE.Mesh(new THREE.CylinderGeometry(60,60,0.6,64), groundMat);
  ground.receiveShadow = true; ground.position.set(0,0,-10); scene.add(ground);

  const ocean = new THREE.Mesh(new THREE.RingGeometry(62, 90, 64, 1), new THREE.MeshBasicMaterial({ color:0x0d3b66, transparent:true, opacity:0.85 }));
  ocean.rotation.x = -Math.PI/2; ocean.position.set(0,0.31,-10); scene.add(ocean);

  const palms = new THREE.Group(); scene.add(palms);
  function makePalm(x,z,s=1){
    const g = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.35,4.2,8), new THREE.MeshStandardMaterial({color:0x7b5a39, roughness:.9}));
    trunk.position.y = 2.1; trunk.castShadow = true; trunk.receiveShadow = true; g.add(trunk);
    for (let i=0;i<6;i++){
      const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.9, 1.8, 10), new THREE.MeshStandardMaterial({color:0x2c9c62, roughness:.7}));
      leaf.position.y = 3.9; leaf.rotation.set(-0.7 + Math.random()*0.25, i*Math.PI*2/6, 0);
      leaf.castShadow = true; g.add(leaf);
    }
    g.position.set(x, 0.35, z); g.scale.setScalar(s);
    g.userData.sway = Math.random()*Math.PI*2;
    return g;
  }
  for (let i=0;i<28;i++){
    const a = Math.random()*Math.PI*2;
    const r = 12 + Math.random()*16;
    palms.add(makePalm(Math.cos(a)*r*0.75, -10 + Math.sin(a)*r*0.75, 0.9+Math.random()*0.5));
  }

  const temples = new THREE.Group(); scene.add(temples);
  const glowMatBase = new THREE.SpriteMaterial({ map:glowTex || null, color:0x36c2b6, transparent:true, opacity:0.0, depthWrite:false });
  const tArr = [];
  function makeTemple(i){
    const mat = stoneTex ? new THREE.MeshStandardMaterial({ map: stoneTex, roughness:0.6, metalness:0.1, color: new THREE.Color().setHSL(0.53 + i*0.05, 0.25, 0.65) })
                         : new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(0.53 + i*0.05, 0.25, 0.65), roughness:0.6 });
    const g = new THREE.Group();
    const base = new THREE.Mesh(new THREE.BoxGeometry(4, 1.2, 4), mat); base.position.y = 0.6; base.receiveShadow=true; base.castShadow=true; g.add(base);
    const body = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.6, 3.0 + i*0.2, 20), mat); body.position.y = 2.2; body.castShadow=true; g.add(body);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(2.2 + i*0.08, 1.2 + i*0.12, 24), mat); roof.position.y = 3.8 + i*0.2; roof.castShadow=true; g.add(roof);
    const colMat = stoneTex ? new THREE.MeshStandardMaterial({ map:stoneTex, roughness:0.5, color:0xffffff }) :
                              new THREE.MeshStandardMaterial({ color:0xffffff, roughness:0.5 });
    for (let k=0;k<8;k++){
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 1.8, 14), colMat);
      const ang = k*Math.PI/4;
      col.position.set(Math.cos(ang)*2.0, 1.3, Math.sin(ang)*2.0); col.castShadow=true; g.add(col);
    }
    const glow = new THREE.Sprite(glowMatBase.clone()); glow.scale.set(3.8,3.8,1); glow.position.y = roof.position.y + 0.8; g.add(glow);
    g.position.set((i-2)*6.2, 0, -12 - Math.abs(i-2)*1.2);
    g.userData = { kind:'temple', index:i, label:`Тема ${i+1}`, glow };
    tArr.push(g);
    return g;
  }
  for (let i=0;i<5;i++) temples.add(makeTemple(i));
  log('Temples count:', tArr.length);

  const raycaster = new THREE.Raycaster(); const pointer = new THREE.Vector2();
  const CLICK = {x:0,y:0,time:0}; let selected = null; let currentLabel=null;
  function setPointer(e){
    const rect = canvas.getBoundingClientRect();
    const x = ((e.touches? e.touches[0].clientX:e.clientX)-rect.left)/rect.width;
    const y = ((e.touches? e.touches[0].clientY:e.clientY)-rect.top)/rect.height;
    pointer.set(x*2-1, -(y*2-1));
  }
  function pick(){
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects([temples], true);
    return hits[0]||null;
  }
  function showLabelForTemple(g){
    const pos = g.position.clone(); pos.y += 5.2;
    const sp = pos.clone().project(camera);
    const sx = (sp.x*0.5+0.5)*innerWidth;
    const sy = (-sp.y*0.5+0.5)*innerHeight;
    labelEl.style.left = sx+'px'; labelEl.style.top = sy+'px';
    labelEl.textContent = g.userData.label; labelEl.style.opacity = 1;
    labelEl.style.transform = 'translate(-50%,-120%) scale(1)';
  }
  function onDown(e){ setPointer(e); CLICK.x=pointer.x; CLICK.y=pointer.y; CLICK.time=performance.now(); }
  function onUp(e){
    setPointer(e);
    const dt = performance.now() - CLICK.time;
    const dx = Math.abs(pointer.x-CLICK.x), dy = Math.abs(pointer.y-CLICK.y);
    if (dt<350 && dx<0.02 && dy<0.02){
      const hit = pick(); if (!hit) return;
      let g = hit.object; while (g && g.parent){ if (g.userData && g.userData.kind==='temple') break; g = g.parent; }
      if (!g) return;
      if (selected === g){
        const rect = canvas.getBoundingClientRect();
        const sx = ((e.touches?e.changedTouches[0].clientX:e.clientX)-rect.left)/rect.width;
        const sy = ((e.touches?e.touches[0].clientY:e.clientY)-rect.top)/rect.height;
        vortex.style.display='block';
        vortex.style.setProperty('--cx', (sx*100).toFixed(1)+'%'); vortex.style.setProperty('--cy',(sy*100).toFixed(1)+'%');
        setTimeout(()=>{
          const url = `shelf_room.html?theme=${g.userData.index+1}`;
          try{ Telegram?.WebApp?.openLink(url, { try_instant_view:true }); }catch(err){ location.href=url; }
        }, 520);
      }else{
        if (selected) selected.userData.glow.material.opacity = 0.0;
        selected = g; selected.userData.glow.material.opacity = 0.85;
        titleEl.textContent = 'Нажми ещё раз для подтверждения выбора';
        showLabelForTemple(selected); currentLabel = selected.userData.index;
      }
    }
  }
  canvas.addEventListener('mousedown', onDown); canvas.addEventListener('mouseup', onUp);
  canvas.addEventListener('touchstart', onDown, {passive:false}); canvas.addEventListener('touchend', onUp);

  const clock = new THREE.Clock();
  function loop(){
    renderer.setSize(innerWidth, innerHeight, false);
    camera.aspect = innerWidth/innerHeight; camera.updateProjectionMatrix();
    renderer.render(scene,camera);
    requestAnimationFrame(loop);
  }
  loop();
}

addEventListener('resize', ()=>{ renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth/innerHeight; camera.updateProjectionMatrix(); });
