// Isla Viva • MiniApp Hardened • build 2025-08-16 17:15:27Z
window.__ISLA_VIVA_BUILD__ = 'Isla Viva • MiniApp Hardened • build 2025-08-16 17:15:27Z';
// Isla Viva — zero-config 3D island (Three.js r160 UMD).
// No OrbitControls/Water.js. Custom shaders + controls.
// Designed for Telegram WebView / GitHub Pages.

(() => {

// ---------------- CONFIG ----------------
const CONFIG = {
  seed: 42,
  island: {
    size: 280,          // world units, square extent per side
    oceanSize: 820,     // water plane size
    elevation: 28,      // max terrain height
    falloff: 0.0028,    // radial falloff (makes island)
  },
  camera: {
    phiDeg: 70,         // fixed polar angle
    startRadius: 420,
    minRadius: 220,
    maxRadius: 720,
    startTheta: Math.PI * 0.15,
    dollyToCursor: true,
  },
  perf: {
    pixelRatioMaxMobile: 1.5,
    pixelRatioMaxDesktop: 2.0,
    targetFPS: 60,
  },
  qualityPresets: {
    auto: { terrainNear: 150, terrainMid: 90, terrainFar: 48, vegetation: 1400, bloom: true, bloomRes: 0.5, fxaa: true },
    low:  { terrainNear: 120, terrainMid: 72, terrainFar: 36, vegetation: 900,  bloom: false, bloomRes: 0.5, fxaa: true },
    high: { terrainNear: 200, terrainMid: 120,terrainFar: 64, vegetation: 2200, bloom: true, bloomRes: 0.75, fxaa: true },
  },
  palette: {
    sandA: 0xf5e3be, sandB: 0xe5d0a6,
    plainsA: 0xb79b69, plainsB: 0x9a7b52,
    tropicA: 0x3ba35f, tropicB: 0x2a8a57, lime: 0xb6f5b1,
    rockA: 0x5e6673, rockB: 0x464b54,
    oceanDeep: 0x0d3b66, oceanShallowA: 0x38bdf8, oceanShallowB: 0x7cd4ff,
    uiMint: 0x36c2b6
  },
  sun: {
    dir: new THREE.Vector3(0.6, 1.0, -0.3).normalize(),
    color: 0xffffff,
    intensity: 1.2
  },
  fog: {
    density: 0.0022,
    color: 0xbfe9ff
  }
};

// ---------------- UTILITIES ----------------

// tiny merge for BufferGeometries with identical attributes layout (position, normal, uv optional)
function mergeGeometries(geos){
  const out = new THREE.BufferGeometry();
  let pos=[], nor=[], uv=[], idx=[], offset=0;
  for(const g of geos){
    g.computeVertexNormals();
    const pA = g.getAttribute('position'); const nA = g.getAttribute('normal'); const uvA = g.getAttribute('uv');
    for(let i=0;i<pA.count;i++){ pos.push(pA.getX(i), pA.getY(i), pA.getZ(i)); }
    if(nA) for(let i=0;i<nA.count;i++){ nor.push(nA.getX(i), nA.getY(i), nA.getZ(i)); }
    if(uvA) for(let i=0;i<uvA.count;i++){ uv.push(uvA.getX(i), uvA.getY(i)); }
    const iA = g.getIndex();
    if(iA){
      for(let i=0;i<iA.count;i++){ idx.push(iA.getX(i)+offset); }
      offset += pA.count;
    } else {
      for(let i=0;i<pA.count;i+=3){ idx.push(offset+i, offset+i+1, offset+i+2); }
      offset += pA.count;
    }
  }
  out.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(pos),3));
  out.setAttribute('normal', new THREE.Float32BufferAttribute(new Float32Array(nor),3));
  if(uv.length) out.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(uv),2));
  out.setIndex(idx);
  out.computeBoundingSphere();
  return out;
}

const rand = (s => {
  let m = 0x80000000, a = 1103515245, c = 12345;
  let state = (s >>> 0) || 1;
  return () => (state = (a*state + c) % m)/m;
})(CONFIG.seed);

const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);

function lerp(a,b,t){ return a*(1-t)+b*t; }
function mixColor(hexA, hexB, t){
  const a = new THREE.Color(hexA), b = new THREE.Color(hexB), c = a.clone().lerp(b, t); return c;
}

// Telegram WebView expand (safe no-op in browser)
try{ if(window.Telegram && window.Telegram.WebApp){ window.Telegram.WebApp.expand(); } }catch(e){}

// ---------------- RENDERER ----------------
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias:false, alpha:false, powerPreference:'high-performance' });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;

const dprCap = isMobile ? CONFIG.perf.pixelRatioMaxMobile : CONFIG.perf.pixelRatioMaxDesktop;
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1, dprCap));
renderer.setSize(window.innerWidth, window.innerHeight);

// ---------------- SCENE ----------------
const scene = new THREE.Scene();
scene.background = new THREE.Color(CONFIG.palette.oceanDeep);
scene.fog = new THREE.FogExp2(mixColor(0xffffff, CONFIG.palette.oceanShallowB, 0.35), CONFIG.fog.density);

const sun = new THREE.DirectionalLight(CONFIG.sun.color, CONFIG.sun.intensity);
sun.position.copy(CONFIG.sun.dir).multiplyScalar(500);
sun.castShadow = false;
scene.add(sun);
scene.add(new THREE.HemisphereLight(0xb0c8ff, 0x6fa07a, 0.55));

// ---------------- CAMERA ----------------
const camera = new THREE.PerspectiveCamera(55, window.innerWidth/window.innerHeight, 0.1, 2000);
let target = new THREE.Vector3(0,0,0);
let radius = CONFIG.camera.startRadius;
let theta = CONFIG.camera.startTheta;
const phi = THREE.MathUtils.degToRad(CONFIG.camera.phiDeg);

function updateCamera(){
  const sinPhi = Math.sin(phi), cosPhi = Math.cos(phi);
  const x = target.x + radius * sinPhi * Math.cos(theta);
  const y = target.y + radius * cosPhi;
  const z = target.z + radius * sinPhi * Math.sin(theta);
  camera.position.set(x,y,z);
  camera.lookAt(target);
}
updateCamera();

// Clamp target to keep ocean margins
function clampTarget(t){
  const half = CONFIG.island.oceanSize*0.5 - 40;
  t.x = THREE.MathUtils.clamp(t.x, -half, half);
  t.z = THREE.MathUtils.clamp(t.z, -half, half);
}

// ---------------- POST (FXAA + Bloom lightweight) ----------------
const rtScene = new THREE.WebGLRenderTarget(1,1,{ depthBuffer:true, stencilBuffer:false });
const rtPing = new THREE.WebGLRenderTarget(1,1);
const rtPong = new THREE.WebGLRenderTarget(1,1);
const quadScene = new THREE.Scene();
const quadCam = new THREE.OrthographicCamera(-1,1,1,-1,0,1);
quadScene.add(quadCam);

const fsQuadGeo = new THREE.PlaneGeometry(2,2);

// FXAA shader (compact)
const fxaaMat = new THREE.ShaderMaterial({
  uniforms: {
    tScene: { value: null },
    resolution: { value: new THREE.Vector2(1,1) },
  },
  vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position,1.0); }`,
  fragmentShader: `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D tScene;
  uniform vec2 resolution;
  // Based on FXAA 3.11 — simplified for WebGL (see refs in README)
  vec3 fxaa(sampler2D tex, vec2 uv){
    vec2 px = 1.0 / resolution;
    vec3 rgbNW = texture2D(tex, uv + vec2(-px.x, -px.y)).rgb;
    vec3 rgbNE = texture2D(tex, uv + vec2( px.x, -px.y)).rgb;
    vec3 rgbSW = texture2D(tex, uv + vec2(-px.x,  px.y)).rgb;
    vec3 rgbSE = texture2D(tex, uv + vec2( px.x,  px.y)).rgb;
    vec3 rgbM  = texture2D(tex, uv).rgb;
    vec3 luma = vec3(0.299, 0.587, 0.114);
    float lumaNW = dot(rgbNW, luma);
    float lumaNE = dot(rgbNE, luma);
    float lumaSW = dot(rgbSW, luma);
    float lumaSE = dot(rgbSE, luma);
    float lumaM  = dot(rgbM,  luma);
    float lumaMin = min(lumaM, min(min(lumaNW,lumaNE), min(lumaSW,lumaSE)));
    float lumaMax = max(lumaM, max(max(lumaNW,lumaNE), max(lumaSW,lumaSE)));
    vec2 dir;
    dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));
    dir.y =  ((lumaNW + lumaSW) - (lumaNE + lumaSE));
    float dirReduce = max((lumaNW + lumaNE + lumaSW + lumaSE) * 0.03125, 0.0078125);
    float rcpDirMin = 1.0 / (min(abs(dir.x), abs(dir.y)) + dirReduce);
    dir = clamp(dir * rcpDirMin, vec2(-8.0), vec2(8.0)) * px;
    vec3 rgbA = 0.5 * (texture2D(tex, uv + dir * (1.0/3.0 - 0.5)).rgb +
                       texture2D(tex, uv + dir * (2.0/3.0 - 0.5)).rgb);
    vec3 rgbB = rgbA * 0.5 + 0.25 * (texture2D(tex, uv + dir * -0.5).rgb +
                                     texture2D(tex, uv + dir * 0.5).rgb);
    float lumaB = dot(rgbB, luma);
    return (lumaB < lumaMin || lumaB > lumaMax) ? rgbA : rgbB;
  }
  void main(){
    gl_FragColor = vec4(fxaa(tScene, vUv), 1.0);
  }`
});
const fxaaQuad = new THREE.Mesh(fsQuadGeo, fxaaMat); fxaaQuad.frustumCulled = false;

// Simple bloom: threshold + separable blur + add
const bloomParams = { threshold: 1.0, knee: 0.6, intensity: 0.6, radius: 6.0 };
const extractMat = new THREE.ShaderMaterial({
  uniforms:{
    tScene:{value:null}, threshold:{value:bloomParams.threshold}, knee:{value:bloomParams.knee}
  },
  vertexShader:`varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position,1.0); }`,
  fragmentShader:`precision highp float; varying vec2 vUv; uniform sampler2D tScene; uniform float threshold; uniform float knee;
    void main(){
      vec3 c = texture2D(tScene,vUv).rgb;
      float l = max(max(c.r,c.g),c.b);
      float soft = l - threshold + knee; soft = clamp(soft, 0.0, 2.0*knee); soft = soft*soft/(4.0*knee+1e-4);
      float bright = max(l - threshold, soft); bright = max(bright, 0.0);
      gl_FragColor = vec4(c * (bright>0.0 ? bright/l : 0.0), 1.0);
    }`
});
const blurMat = new THREE.ShaderMaterial({
  uniforms:{ tInput:{value:null}, direction:{value:new THREE.Vector2(1,0)}, texelSize:{value:new THREE.Vector2(1,1)} },
  vertexShader:`varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position,1.0); }`,
  fragmentShader:`precision highp float; varying vec2 vUv; uniform sampler2D tInput; uniform vec2 direction; uniform vec2 texelSize;
    void main(){
      vec2 off = direction * texelSize;
      vec3 s = texture2D(tInput, vUv).rgb * 0.2270270270;
      s += texture2D(tInput, vUv + off*1.3846153846).rgb * 0.3162162162;
      s += texture2D(tInput, vUv - off*1.3846153846).rgb * 0.3162162162;
      s += texture2D(tInput, vUv + off*3.2307692308).rgb * 0.0702702703;
      s += texture2D(tInput, vUv - off*3.2307692308).rgb * 0.0702702703;
      gl_FragColor = vec4(s,1.0);
    }`
});
const addMat = new THREE.ShaderMaterial({
  uniforms:{ tBase:{value:null}, tBloom:{value:null}, intensity:{value:bloomParams.intensity} },
  vertexShader:`varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position,1.0); }`,
  fragmentShader:`precision highp float; varying vec2 vUv; uniform sampler2D tBase; uniform sampler2D tBloom; uniform float intensity;
    void main(){
      vec3 base = texture2D(tBase, vUv).rgb;
      vec3 bloom = texture2D(tBloom, vUv).rgb * intensity;
      gl_FragColor = vec4(base + bloom, 1.0);
    }`
});
const extractQuad = new THREE.Mesh(fsQuadGeo, extractMat); extractQuad.frustumCulled=false;
const blurQuad = new THREE.Mesh(fsQuadGeo, blurMat); blurQuad.frustumCulled=false;
const addQuad = new THREE.Mesh(fsQuadGeo, addMat); addQuad.frustumCulled=false;

// ---------------- TERRAIN + OCEAN SHADERS ----------------
// Shared noise (Perlin-ish + Worley-ish snippets). Credit: iq / The Book of Shaders.
const NOISE_GLSL = `
  // hash & noise helpers
  float hash11(float p){ p = fract(p*0.1031); p *= p+33.33; p*=p; return fract(p); }
  vec2 hash22(vec2 p){ p = vec2(dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3))); return fract(sin(p)*43758.5453); }
  float noise2(vec2 p){
    vec2 i = floor(p), f = fract(p);
    vec2 u = f*f*(3.0-2.0*f);
    float n = mix(mix( dot(hash22(i+vec2(0,0))-0.5,f-vec2(0,0)),
                      dot(hash22(i+vec2(1,0))-0.5,f-vec2(1,0)), u.x),
                  mix( dot(hash22(i+vec2(0,1))-0.5,f-vec2(0,1)),
                      dot(hash22(i+vec2(1,1))-0.5,f-vec2(1,1)), u.x), u.y);
    return n;
  }
  float fbm(vec2 p){
    float a=0.5, f=1.0, s=0.0;
    for(int i=0;i<5;i++){ s += a*noise2(p*f); f*=2.0; a*=0.5; }
    return s;
  }
  // simple worley-like
  float worley(vec2 p){
    vec2 i = floor(p);
    float d = 1.0;
    for(int y=-1;y<=1;y++) for(int x=-1;x<=1;x++){
      vec2 g = vec2(x,y);
      vec2 o = hash22(i+g);
      vec2 r = g + o - fract(p);
      float dist = dot(r,r);
      d = min(d, dist);
    }
    return sqrt(d);
  }
`;

// Terrain material with 4-way splat, triplanar procedural, shoreline SDF for parallax ripples.
function makeTerrainMaterial(params){
  const uniforms = {
    uTime: { value: 0 },
    uIslandSize: { value: params.islandSize },
    uElev: { value: CONFIG.island.elevation },
    uFalloff: { value: CONFIG.island.falloff },
    uSandA: { value: new THREE.Color(CONFIG.palette.sandA) },
    uSandB: { value: new THREE.Color(CONFIG.palette.sandB) },
    uPlainA: { value: new THREE.Color(CONFIG.palette.plainsA) },
    uPlainB: { value: new THREE.Color(CONFIG.palette.plainsB) },
    uTropA: { value: new THREE.Color(CONFIG.palette.tropicA) },
    uTropB: { value: new THREE.Color(CONFIG.palette.tropicB) },
    uRockA: { value: new THREE.Color(CONFIG.palette.rockA) },
    uRockB: { value: new THREE.Color(CONFIG.palette.rockB) },
  };
  const vertexShader = `
    uniform float uTime, uIslandSize, uElev, uFalloff;
    varying vec3 vPosW;
    varying vec3 vNormalW;
    varying float vHeight;
    ${NOISE_GLSL}
    float islandHeight(vec2 xz){
      float r = length(xz) * uFalloff;
      float base = (0.9 - r*r);
      float h = fbm(xz*0.012) * 0.7 + fbm(xz*0.05)*0.15;
      float ridge = 0.5*pow(max(0.0, fbm(xz*0.02) - 0.4), 2.0);
      return uElev * max(0.0, base + h*0.85 + ridge);
    }
    // finite difference normal after displacement
    vec3 heightNormal(vec2 xz){
      float e = 0.8;
      float hL = islandHeight(xz - vec2(e,0));
      float hR = islandHeight(xz + vec2(e,0));
      float hD = islandHeight(xz - vec2(0,e));
      float hU = islandHeight(xz + vec2(0,e));
      vec3 n = normalize(vec3(hL - hR, 2.0*e, hD - hU));
      return n;
    }
    void main(){
      vec3 pos = position;
      vec2 xz = pos.xz;
      float h = islandHeight(xz);
      pos.y += h;
      vHeight = h;
      vPosW = (modelMatrix * vec4(pos,1.0)).xyz;
      // Recalc normal in world space
      vec3 n = heightNormal(xz);
      vNormalW = normalize((modelMatrix * vec4(n,0.0)).xyz);
      gl_Position = projectionMatrix * viewMatrix * vec4(vPosW,1.0);
    }
  `;
  const fragmentShader = `
    precision highp float;
    uniform vec3 uSandA,uSandB,uPlainA,uPlainB,uTropA,uTropB,uRockA,uRockB;
    varying vec3 vPosW;
    varying vec3 vNormalW;
    varying float vHeight;
    ${NOISE_GLSL}
    vec3 triPlanarColor(vec3 p, vec3 n, vec3 ca, vec3 cb, float scale){
      n = abs(n); n = max(n, 0.0001); n /= (n.x+n.y+n.z);
      vec3 x = vec3(p.y, p.z, 0.0);
      vec3 y = vec3(p.x, p.z, 0.0);
      vec3 z = vec3(p.x, p.y, 0.0);
      float nx = fbm(x.xy*scale), ny=fbm(y.xy*scale), nz=fbm(z.xy*scale);
      vec3 c = mix(ca,cb, nx)*n.x + mix(ca,cb, ny)*n.y + mix(ca,cb, nz)*n.z;
      return c;
    }
    void main(){
      // Lighting
      vec3 N = normalize(vNormalW);
      vec3 L = normalize(vec3(0.6,1.0,-0.3));
      float diff = clamp(dot(N,L), 0.02, 1.0);
      // Biomes
      float slope = 1.0 - N.y; // 0 flat .. 1 steep
      float height01 = clamp(vHeight / ${CONFIG.island.elevation.toFixed(1)}, 0.0, 1.0);
      float moist = fbm(vPosW.xz*0.02 + fbm(vPosW.xz*0.004)); // pseudo moisture

      // Sand near sea + low slope
      float sandMask = smoothstep(0.0, 0.08, 1.0-height01) * (1.0 - smoothstep(0.2,0.6,slope));
      // Plains intermediate
      float plainMask = smoothstep(0.1,0.45,height01) * (1.0 - smoothstep(0.25,0.7,slope));
      // Tropic where moist high
      float tropMask = plainMask * smoothstep(0.45,0.75, moist);
      // Rock on high & steep
      float rockMask = smoothstep(0.55,0.95,height01) * smoothstep(0.35,0.8,slope);
      // Normalize
      float sum = sandMask + plainMask + tropMask + rockMask + 1e-5;
      sandMask/=sum; plainMask/=sum; tropMask/=sum; rockMask/=sum;

      vec3 sand = triPlanarColor(vPosW*0.6, N, uSandA, uSandB, 0.6);
      // add cheap "ripples" on beach
      float rip = sin(vPosW.x*0.12) * cos(vPosW.z*0.1);
      sand = mix(sand, sand*1.06, smoothstep(0.0,0.07, sandMask) * (0.5+0.5*sin(rip)));

      vec3 plains = triPlanarColor(vPosW*0.25, N, uPlainA, uPlainB, 1.2);
      vec3 trop = triPlanarColor(vPosW*0.35, N, uTropA, uTropB, 1.4);
      vec3 rock = triPlanarColor(vPosW*0.8, N, uRockA, uRockB, 1.8);

      vec3 albedo = sand*sandMask + plains*plainMask + trop*tropMask + rock*rockMask;
      // micro-variation
      albedo *= (0.95 + 0.1*fbm(vPosW.xz*0.5));

      // Shading
      vec3 base = albedo * (0.35 + 0.75 * diff);
      // simple AO-ish from slope
      base *= mix(1.0, 0.86, slope);
      gl_FragColor = vec4(base, 1.0);
    }
  `;
  return new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader, fog:true });
}

// Ocean shader; two scrolling normal maps generated procedurally; Fresnel; shallow color and foam
function makeOceanMaterial(params){
  const uniforms = {
    uTime:{value:0},
    uDir:{value:new THREE.Vector2(0.8,0.6)},
    uSunDir:{value:CONFIG.sun.dir},
    uDeep:{value:new THREE.Color(CONFIG.palette.oceanDeep)},
    uShallowA:{value:new THREE.Color(CONFIG.palette.oceanShallowA)},
    uShallowB:{value:new THREE.Color(CONFIG.palette.oceanShallowB)},
    uSand:{value:new THREE.Color(CONFIG.palette.sandA)},
    uIslandElev:{value:CONFIG.island.elevation},
    uFalloff:{value:CONFIG.island.falloff},
    uSize:{value:CONFIG.island.oceanSize},
  };
  const vertexShader = `
    uniform float uTime;
    varying vec3 vPosW; varying vec3 vNormalW;
    void main(){
      vec3 pos = position;
      // subtle Gerstner-ish displacement (cheap)
      float a1 = 0.6, a2 = 0.35;
      float w1 = 0.1, w2 = 0.07;
      float p1 = pos.x*0.08 + pos.z*0.06 + uTime*0.8;
      float p2 = pos.x*0.03 - pos.z*0.07 - uTime*0.6;
      pos.y += sin(p1)*a1 + sin(p2)*a2;
      vPosW = (modelMatrix*vec4(pos,1.0)).xyz;
      // fake normal from partial derivatives of sines
      vec3 dx = vec3(1.0, a1*0.08*cos(p1) + a2*0.03*cos(p2), 0.0);
      vec3 dz = vec3(0.0, a1*0.06*cos(p1) - a2*0.07*cos(p2), 1.0);
      vNormalW = normalize((modelMatrix*vec4(normalize(cross(dz,dx)),0.0)).xyz);
      gl_Position = projectionMatrix * viewMatrix * vec4(vPosW,1.0);
    }
  `;
  const fragmentShader = `
    precision highp float;
    uniform float uTime, uIslandElev, uFalloff, uSize;
    uniform vec3 uDeep,uShallowA,uShallowB,uSand;
    uniform vec2 uDir;
    uniform vec3 uSunDir;
    varying vec3 vPosW; varying vec3 vNormalW;
    ${NOISE_GLSL}

    float islandHeight(vec2 xz){
      float r = length(xz) * uFalloff;
      float base = (0.9 - r*r);
      float h = fbm(xz*0.012) * 0.7 + fbm(xz*0.05)*0.15;
      float ridge = 0.5*pow(max(0.0, fbm(xz*0.02) - 0.4), 2.0);
      return uIslandElev * max(0.0, base + h*0.85 + ridge);
    }
    void main(){
      vec3 N = normalize(vNormalW);
      vec3 V = normalize(cameraPosition - vPosW);
      // Fresnel
      float fres = pow(1.0 - max(dot(N,V),0.0), 3.0);
      // Depth-based color by sampling terrain height under water (fake SDF)
      float terrainY = islandHeight(vPosW.xz);
      float depth = clamp((vPosW.y - terrainY) / 10.0, 0.0, 1.0);
      vec3 shallow = mix(uShallowA, uShallowB, depth);
      vec3 color = mix(uDeep, shallow, 1.0 - depth);
      // Foam near coast
      float shore = smoothstep(0.0, 0.6, 1.0 - depth);
      float foam = smoothstep(0.65, 0.98, shore) * (0.6 + 0.4*sin(vPosW.x*0.2 + vPosW.z*0.15 + uTime*1.5));
      // Sun specular
      vec3 L = normalize(uSunDir);
      float spec = pow(max(dot(reflect(-L,N), V), 0.0), 64.0) * 0.7;
      vec3 finalC = color * (0.6 + 0.6*max(dot(N,L),0.0)) + vec3(spec);
      finalC = mix(finalC, vec3(1.0), foam*0.65);
      finalC = mix(finalC, vec3(1.0), fres*0.1);
      gl_FragColor = vec4(finalC, 0.98);
    }
  `;
  const mat = new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader, transparent:true, depthWrite:false, fog:true });
  return mat;
}

// ---------------- GEOMETRY (LOD rings) ----------------
function makePlane(res, size){
  const g = new THREE.PlaneGeometry(size, size, res, res);
  g.rotateX(-Math.PI/2);
  return g;
}

let quality = 'auto';
const state = {
  terrain: { near:null, mid:null, far:null, mat:null },
  water: null,
  instanced: [],
  birds: null,
  boats: null
};

function rebuildTerrain(){
  // dispose old
  ['near','mid','far'].forEach(k => {
    if(state.terrain[k]){ scene.remove(state.terrain[k]); state.terrain[k].geometry.dispose(); }
  });
  if(state.terrain.mat){ state.terrain.mat.dispose(); }

  const preset = CONFIG.qualityPresets[quality];
  const size = CONFIG.island.size;
  const near = makePlane(preset.terrainNear, size*0.9);
  const mid  = makePlane(preset.terrainMid,  size*1.6);
  const far  = makePlane(preset.terrainFar,  size*2.4);
  const mat = makeTerrainMaterial({ islandSize: size });
  state.terrain.mat = mat;
  state.terrain.near = new THREE.Mesh(near, mat);
  state.terrain.mid  = new THREE.Mesh(mid,  mat);
  state.terrain.far  = new THREE.Mesh(far,  mat);
  [state.terrain.near, state.terrain.mid, state.terrain.far].forEach(m => { m.receiveShadow=false; m.castShadow=false; scene.add(m); });
}

function rebuildOcean(){
  if(state.water){ scene.remove(state.water); state.water.geometry.dispose(); state.water.material.dispose(); }
  const g = makePlane(160, CONFIG.island.oceanSize);
  const mat = makeOceanMaterial({});
  state.water = new THREE.Mesh(g, mat);
  state.water.position.y = 1.6;
  scene.add(state.water);
}

// ---------------- OBJECTS ----------------
function makeCastle(){
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color:0xdedede, metalness:0.1, roughness:0.35 });
  const glass = new THREE.MeshPhysicalMaterial({ color:0xffffff, metalness:0.0, roughness:0.05, transmission:0.82, thickness:0.6 });
  const base = new THREE.Mesh(new THREE.BoxGeometry(36, 12, 26), mat);
  base.position.y = 6;
  group.add(base);
  const tower = new THREE.Mesh(new THREE.BoxGeometry(22, 22, 12), mat);
  tower.position.set(0, 17, -5);
  group.add(tower);
  const windowStrip = new THREE.Mesh(new THREE.BoxGeometry(24, 6, 2.2), glass);
  windowStrip.position.set(0, 15, 13.5);
  group.add(windowStrip);
  // chimneys
  for(let i=0;i<3;i++){
    const ch = new THREE.Mesh(new THREE.CylinderGeometry(0.8,0.8,4,12), mat);
    ch.position.set(-8 + i*8, 24, -3);
    group.add(ch);
  }
  group.position.set(0, 0, 0);
  group.userData.type = 'castle';
  return group;
}

function placeGroupOnTerrain(group, x, z){
  const h = sampleHeight(x,z);
  group.position.set(x, h+0.5, z);
}

function sampleHeight(x,z){
  // Mirror the shader height to align placements
  const r = Math.hypot(x,z) * CONFIG.island.falloff;
  const base = (0.9 - r*r);
  const fbm = (p)=>{
    let a=0.5, f=1.0, s=0.0;
    const noise2 = (x,y)=>{
      const n = Math.sin(x*127.1 + y*311.7)*43758.5453;
      return (n - mathFloor(n));
    };
    // JS approximation: use Math.sin hash
    return 0; // We'll approximate differently below
  };
  // Cheaper CPU height eval using simple noises
  const n1 = perlin2(x*0.012, z*0.012)*0.7;
  const n2 = perlin2(x*0.05, z*0.05)*0.15;
  const n3 = Math.max(0, perlin2(x*0.02, z*0.02)-0.4);
  const ridge = 0.5*n3*n3;
  const h = CONFIG.island.elevation * Math.max(0, base + n1 + n2 + ridge);
  return h;
}

// tiny Perlin2 for CPU sampling (for placements only)
const PERM = new Uint8Array(512);
(function initPerm(){
  const p = new Uint8Array(256);
  for(let i=0;i<256;i++) p[i]=i;
  // shuffle
  for(let i=255;i>0;i--){ const j = Math.floor(rand()* (i+1)); const t = p[i]; p[i]=p[j]; p[j]=t; }
  for(let i=0;i<512;i++) PERM[i]=p[i&255];
})();
function grad2(hash, x, y){
  const h = hash & 3; return ((h&1)? -x : x) + ((h&2)? -y : y);
}
function perlin2(x, y){
  const X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
  x -= Math.floor(x); y -= Math.floor(y);
  const u = x*x*(3-2*x), v = y*y*(3-2*y);
  const aa = PERM[X+PERM[Y]], ab = PERM[X+PERM[Y+1]], ba = PERM[X+1+PERM[Y]], bb = PERM[X+1+PERM[Y+1]];
  const res = THREE.MathUtils.lerp(
    THREE.MathUtils.lerp(grad2(aa, x, y), grad2(ba, x-1, y), u),
    THREE.MathUtils.lerp(grad2(ab, x, y-1), grad2(bb, x-1, y-1), u),
    v);
  return res*0.5+0.5;
}

function scatterVillas(count){
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color:0xd8d3c7, roughness:0.5, metalness:0.05 });
  for(let i=0;i<count;i++){
    const s = 6 + rand()*6;
    const g = new THREE.Mesh(new THREE.BoxGeometry(s, s*0.5, s*0.7), mat);
    const a = rand()*Math.PI*2;
    const r = 60 + rand()*70;
    const x = Math.cos(a)*r, z = Math.sin(a)*r;
    const h = sampleHeight(x,z);
    g.position.set(x, h+ s*0.25 + 0.2, z);
    g.rotation.y = rand()*Math.PI*2;
    group.add(g);
  }
  return group;
}

function makeHelipad(){
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(12,12,0.6,48), new THREE.MeshStandardMaterial({ color:0xdddddd, roughness:0.7, metalness:0.0 }));
  base.position.y = 0.3;
  const h = new THREE.Mesh(new THREE.RingGeometry(2,6,32), new THREE.MeshBasicMaterial({ color:0xffffff }));
  h.rotation.x = -Math.PI/2;
  const H = new THREE.Mesh(new THREE.PlaneGeometry(6,6), new THREE.MeshBasicMaterial({ color:0xffffff }));
  H.rotation.x = -Math.PI/2;
  g.add(base,h,H);
  return g;
}

function makeRoads(){
  const mat = new THREE.MeshBasicMaterial({ color:0x222222, transparent:true, opacity:0.22 });
  const roads = new THREE.Group();
  function ribbon(points, width){
    const g = new THREE.PlaneGeometry(width, 1, 1, points.length-1);
    g.rotateX(-Math.PI/2);
    // build strip by moving segments along points
    const pos = g.attributes.position;
    for(let i=0;i<points.length;i++){
      const p = points[i];
      const idxL = i*2, idxR = i*2+1;
      const dir = (i<points.length-1 ? points[i+1].clone().sub(p) : p.clone().sub(points[i-1])).normalize();
      const left = new THREE.Vector3(-dir.z, 0, dir.x).multiplyScalar(width*0.5);
      const leftP = p.clone().add(left);
      const rightP = p.clone().sub(left);
      pos.setXYZ(idxL, leftP.x, sampleHeight(leftP.x, leftP.z)+0.02, leftP.z);
      pos.setXYZ(idxR, rightP.x, sampleHeight(rightP.x, rightP.z)+0.02, rightP.z);
    }
    pos.needsUpdate = true;
    const m = new THREE.Mesh(g, mat);
    roads.add(m);
  }
  const ring = [];
  for(let i=0;i<100;i++){
    const a = i/100 * Math.PI*2;
    const r = 100 + 8*Math.sin(i*0.3);
    ring.push(new THREE.Vector3(Math.cos(a)*r,0,Math.sin(a)*r));
  }
  ribbon(ring, 3.0);
  return roads;
}

function makePierAndBoats(){
  const group = new THREE.Group();
  const pierMat = new THREE.MeshStandardMaterial({ color:0x8b7355, roughness:0.8, metalness:0.1 });
  const pier = new THREE.Mesh(new THREE.BoxGeometry(8,1,32), pierMat); pier.position.set(-90, 1.6+0.5, 110);
  group.add(pier);

  // Boats instanced
  const boatGeo = new THREE.ConeGeometry(1.2, 5, 6); boatGeo.rotateX(Math.PI/2);
  const boatMat = new THREE.MeshStandardMaterial({ color:0xffffff, roughness:0.6, metalness:0.0 });
  const count = 8;
  const boats = new THREE.InstancedMesh(boatGeo, boatMat, count);
  for(let i=0;i<count;i++){
    const m = new THREE.Matrix4();
    const x = -90 + (rand()*6 -3), z = 120 + i*5.5;
    const y = 1.6 + Math.sin(i)*0.2;
    m.setPosition(x,y,z);
    boats.setMatrixAt(i, m);
    boats.setColorAt(i, new THREE.Color().setHSL(0.55 + rand()*0.08, 0.4, 0.6));
  }
  boats.instanceMatrix.needsUpdate = true;
  group.add(boats);
  state.boats = boats;
  return group;
}

// Vegetation: palms & ferns & flowers (instanced)
function makeVegetation(total){
  // Palm geometry (simple): trunk cylinder + leaf planes (in shader wind)
  const group = new THREE.Group();
  const trunkGeo = new THREE.CylinderGeometry(0.25, 0.5, 6, 6);
  const leafGeo = new THREE.PlaneGeometry(5,1, 6,1); // will bend in vertex
  leafGeo.translate(2.5, 0, 0);


  // Build palm geometry by merging trunk + leaves without external utils
  const leafGeos = [];
  for(let i=0;i<6;i++){
    const leaf = leafGeo.clone();
    leaf.applyMatrix4(new THREE.Matrix4().makeRotationY(i*Math.PI/3));
    leafGeos.push(leaf);
  }
  const baseGeo = mergeGeometries([trunk].concat(leafGeos));


  
  const mat = new THREE.MeshStandardMaterial({ color:0x3ba35f, roughness:0.8, metalness:0.0, side:THREE.DoubleSide, vertexColors: true });
  // Wind sway in vertex shader; use instance color .b as phase
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = { value: 0 };
    shader.vertexShader = shader.vertexShader.replace(
      '#include <common>',
      `#include <common>
       uniform float uTime;`
    ).replace(
      '#include <begin_vertex>',
      `#include <begin_vertex>
        // leaves sway: move vertices with y>some threshold
        float phase = vColor.b * 10.0; // packed phase
        float sway = sin(uTime*1.4 + phase + position.y*0.35) * 0.18;
        transformed.xz += normalize(vec2(position.x, position.z)+0.0001) * sway * smoothstep(0.1, 0.9, position.y/6.0);`
    );
    mat.userData.shader = shader;
  };

  const inst = new THREE.InstancedMesh(baseGeo, mat, total);
  const dummy = new THREE.Object3D();

  let placed = 0, attempts = 0;
  while(placed < total && attempts < total*8){
    attempts++;
    // sample near beaches mostly
    const a = rand()*Math.PI*2;
    const r = 80 + rand()*110;
    const x = Math.cos(a)*r, z = Math.sin(a)*r;
    const y = sampleHeight(x,z);
    const slope = 1 - new THREE.Vector3(
      sampleHeight(x+1,z) - sampleHeight(x-1,z),
      2.0,
      sampleHeight(x,z+1) - sampleHeight(x,z-1)
    ).normalize().y;
    if(y < 6.5 || y > 28 || slope > 0.4) continue; // avoid too steep/high
    dummy.position.set(x, y+0.3, z);
    dummy.scale.setScalar(0.8 + rand()*0.8);
    dummy.rotation.y = rand()*Math.PI*2;
    dummy.updateMatrix();
    inst.setMatrixAt(placed, dummy.matrix);
    inst.setColorAt(placed, new THREE.Color().setHSL(0.35 + (rand()-0.5)*0.05, 0.6 + (rand()-0.5)*0.2, 0.4 + (rand()-0.5)*0.08).offsetHSL(0,0,(rand()-0.5)*0.05));
    // encode wind phase into .b via color.setRGB hack
    const c = new THREE.Color(); inst.getColorAt(placed, c); c.b = (rand()); inst.setColorAt(placed, c);
    placed++;
  }
  inst.instanceMatrix.needsUpdate = true;
  group.add(inst);

  // simple low flowers patches
  const flowerGeo = new THREE.PlaneGeometry(0.9,0.3);
  flowerGeo.rotateX(-Math.PI/2);
  const flowers = new THREE.InstancedMesh(flowerGeo, new THREE.MeshStandardMaterial({ color:0xb6f5b1, roughness:0.9, metalness:0.0 }), Math.floor(total*0.6));
  for(let i=0;i<flowers.count;i++){
    const a = rand()*Math.PI*2;
    const r = 60 + rand()*140;
    const x = Math.cos(a)*r, z = Math.sin(a)*r;
    const y = sampleHeight(x,z);
    if(y<4 || y>20) continue;
    const m = new THREE.Matrix4().makeTranslation(x, y+0.05, z);
    flowers.setMatrixAt(i,m);
  }
  flowers.instanceMatrix.needsUpdate = true;
  group.add(flowers);

  state.instanced.push(inst, flowers);
  return group;
}

// Birds: 5 flocks of triangles
function makeBirds(){
  const tri = new THREE.BufferGeometry();
  tri.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array([0,0,0, 0.5,0.1,0, 0,0.2,0]),3));
  const mat = new THREE.MeshBasicMaterial({ color:0x111111, side:THREE.DoubleSide });
  const count = 26;
  const inst = new THREE.InstancedMesh(tri, mat, count);
  state.birds = inst;
  scene.add(inst);
}

// ---------------- SETUP SCENE CONTENT ----------------
rebuildTerrain();
rebuildOcean();

const castle = makeCastle();
placeGroupOnTerrain(castle, 0, 0);
scene.add(castle);

const villas = scatterVillas(18); scene.add(villas);
const roads = makeRoads(); scene.add(roads);
const helipad = makeHelipad(); placeGroupOnTerrain(helipad, 52, -40); scene.add(helipad);
const pierBoats = makePierAndBoats(); scene.add(pierBoats);
const veg = makeVegetation(CONFIG.qualityPresets[quality].vegetation); scene.add(veg);
makeBirds();

// ---------------- CONTROLS ----------------
let isPanning=false, isRotating=false;
let lastX=0, lastY=0;
canvas.addEventListener('pointerdown', e=>{
  canvas.setPointerCapture(e.pointerId);
  lastX=e.clientX; lastY=e.clientY;
  if(e.button===2){ isRotating=true; } else { isPanning=true; }
});
window.addEventListener('contextmenu', e=>{ e.preventDefault(); });

canvas.addEventListener('pointermove', e=>{
  const dx=e.clientX-lastX, dy=e.clientY-lastY;
  lastX=e.clientX; lastY=e.clientY;
  if(isPanning){
    const panSpeed = 0.5 * (radius/CONFIG.camera.maxRadius);
    // pan in camera local XZ
    const right = new THREE.Vector3().subVectors(camera.position, target).cross(new THREE.Vector3(0,1,0)).normalize();
    const forward = new THREE.Vector3().crossVectors(new THREE.Vector3(0,1,0), right).normalize();
    target.addScaledVector(right, -dx*panSpeed);
    target.addScaledVector(forward,  dy*panSpeed);
    clampTarget(target);
    updateCamera();
  }else if(isRotating){
    theta -= dx*0.005;
    updateCamera();
  }
});
window.addEventListener('pointerup', ()=>{ isPanning=false; isRotating=false; });

// wheel / pinch zoom
let pinchDist=0;
function dolly(delta, cx, cy){
  // dolly to cursor (move target towards cursor world point)
  const factor = Math.exp(delta*0.0016);
  const newRadius = THREE.MathUtils.clamp(radius*factor, CONFIG.camera.minRadius, CONFIG.camera.maxRadius);
  if(CONFIG.camera.dollyToCursor){
    const mouse = new THREE.Vector2((cx/window.innerWidth)*2-1, -(cy/window.innerHeight)*2+1);
    const ray = new THREE.Raycaster();
    ray.setFromCamera(mouse, camera);
    const plane = new THREE.Plane(new THREE.Vector3(0,1,0), 0);
    const hit = new THREE.Vector3();
    if(ray.ray.intersectPlane(plane, hit)){
      const w = 1.0 - (newRadius - CONFIG.camera.minRadius)/(CONFIG.camera.maxRadius - CONFIG.camera.minRadius);
      target.lerp(hit, 0.12*w); clampTarget(target);
    }
  }
  radius = newRadius; updateCamera();
}
window.addEventListener('wheel', e=>{ e.preventDefault(); dolly(e.deltaY, e.clientX, e.clientY); }, {passive:false});

// touch
let touches = new Map();
canvas.addEventListener('touchstart', e=>{
  for(const t of e.changedTouches){ touches.set(t.identifier, {x:t.clientX, y:t.clientY}); }
  if(touches.size===1){ isPanning=true; }
  if(touches.size===2){ isRotating=true; pinchDist = touchDistance(); }
}, {passive:true});
canvas.addEventListener('touchmove', e=>{
  if(touches.size===1 && isPanning){
    const t = e.touches[0], prev = touches.get(t.identifier);
    const dx = t.clientX - prev.x, dy = t.clientY - prev.y;
    touches.set(t.identifier, {x:t.clientX, y:t.clientY});
    const panSpeed = 0.5 * (radius/CONFIG.camera.maxRadius);
    const right = new THREE.Vector3().subVectors(camera.position, target).cross(new THREE.Vector3(0,1,0)).normalize();
    const forward = new THREE.Vector3().crossVectors(new THREE.Vector3(0,1,0), right).normalize();
    target.addScaledVector(right, -dx*panSpeed);
    target.addScaledVector(forward,  dy*panSpeed);
    clampTarget(target); updateCamera();
  }else if(touches.size===2){
    const nd = touchDistance();
    const t0 = e.touches[0];
    dolly(pinchDist - nd, t0.clientX, t0.clientY);
    pinchDist = nd;
  }
}, {passive:false});
canvas.addEventListener('touchend', e=>{
  for(const t of e.changedTouches){ touches.delete(t.identifier); }
  if(touches.size===0){ isPanning=false; isRotating=false; }
}, {passive:true});
function touchDistance(){
  const ts = Array.from(touches.values()); if(ts.length<2) return 0;
  const dx = ts[0].x - ts[1].x, dy = ts[0].y - ts[1].y; return Math.hypot(dx,dy);
}

// ---------------- AUDIO (gesture-gated) ----------------
let audioCtx=null, ambienceGain=null;
const soundBtn = document.getElementById('soundBtn');
function setupAudio(){
  if(audioCtx) return;
  try{
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    ambienceGain = audioCtx.createGain(); ambienceGain.gain.value = 0.0; ambienceGain.connect(audioCtx.destination);
    // Wind noise via filtered noise
    const buf = audioCtx.createBuffer(1, audioCtx.sampleRate*2, audioCtx.sampleRate);
    const d = buf.getChannelData(0);
    for(let i=0;i<d.length;i++){ d[i] = (Math.random()*2-1) * 0.4; }
    const noise = audioCtx.createBufferSource(); noise.buffer = buf; noise.loop = true;
    const filter = audioCtx.createBiquadFilter(); filter.type='lowpass'; filter.frequency.value=600;
    noise.connect(filter); filter.connect(ambienceGain); noise.start(0);
    // gentle swell LFO
    const lfo = audioCtx.createOscillator(); lfo.frequency.value = 0.08;
    const lfoGain = audioCtx.createGain(); lfoGain.gain.value = 0.2;
    lfo.connect(lfoGain).connect(ambienceGain.gain); lfo.start();
    // fade in
    ambienceGain.gain.linearRampToValueAtTime(0.12, audioCtx.currentTime + 3.0);
  }catch(e){ console.warn('Audio init error', e); }
}
function showSoundButton(){ soundBtn.style.display='block'; }
soundBtn.addEventListener('click', ()=>{ setupAudio(); soundBtn.style.display='none'; });
window.addEventListener('pointerdown', ()=>{ if(!audioCtx){ setupAudio(); soundBtn.style.display='none'; } });

// ---------------- RESIZE ----------------
function resize(){
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  rtScene.setSize(window.innerWidth, window.innerHeight);
  const preset = CONFIG.qualityPresets[quality];
  const scale = preset.bloomRes;
  rtPing.setSize(Math.floor(window.innerWidth*scale), Math.floor(window.innerHeight*scale));
  rtPong.setSize(Math.floor(window.innerWidth*scale), Math.floor(window.innerHeight*scale));
  fxaaMat.uniforms.resolution.value.set(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', resize); resize();

// ---------------- UI ----------------
const fpsEl = document.getElementById('fps');
const gpuEl = document.getElementById('gpu');
const tip = document.getElementById('gestureTip');
setTimeout(()=> tip.classList.add('show'), 200);
setTimeout(()=> tip.classList.remove('show'), 3600);

document.getElementById('qualitySelect').addEventListener('change', (e)=>{
  quality = e.target.value;
  rebuildTerrain();
  rebuildOcean();
  // vegetation density change
  state.instanced.forEach(m=>{ scene.remove(m); m.geometry.dispose(); m.material.dispose(); });
  state.instanced = [];
  scene.add(makeVegetation(CONFIG.qualityPresets[quality].vegetation));
});
document.getElementById('resetBtn').addEventListener('click', ()=>{
  target.set(0,0,0); radius = CONFIG.camera.startRadius; theta = CONFIG.camera.startTheta; updateCamera();
});

// ---------------- RENDER LOOP ----------------
let last=performance.now(), frames=0, acc=0, perfFPS=60;
function render(){
  const now = performance.now();
  const dt = (now-last)/1000; last=now; acc+=dt; frames++;
  if(acc>=0.5){
    perfFPS = Math.round(frames/acc);
    fpsEl.textContent = String(perfFPS);
    const load = Math.min(100, Math.round((1.0/(60)) / (dt) * 100));
    gpuEl.textContent = (load>=100?'100':String(load)) + '%';
    acc=0; frames=0;
  }
  const t = now*0.001;
  // animate uniforms
  if(state.water) state.water.material.uniforms.uTime.value = t;
  if(state.terrain.mat) state.terrain.mat.uniforms.uTime.value = t;


  // Vegetation wind time
  state.instanced.forEach(m => {
    if(m.material && m.material.userData && m.material.userData.shader){
      m.material.userData.shader.uniforms.uTime.value = t;
    }
  });

  // Birds animate circular
  if(state.birds){
    const dummy = new THREE.Object3D();
    for(let i=0;i<state.birds.count;i++){
      const a = i*0.24 + t*0.4 + Math.sin(i*23.1)*0.3;
      const r = 140 + (i%5)*16;
      const h = 26 + (i%7)*4;
      dummy.position.set(Math.cos(a)*r, h + Math.sin(t*0.7 + i)*1.5, Math.sin(a)*r);
      dummy.rotation.y = -a + Math.PI/2;
      dummy.updateMatrix();
      state.birds.setMatrixAt(i, dummy.matrix);
    }
    state.birds.instanceMatrix.needsUpdate = true;
  }
  // Boats bobbing
  if(state.boats){
    const m = new THREE.Matrix4();
    for(let i=0;i<state.boats.count;i++){
      state.boats.getMatrixAt(i, m);
      const p = new THREE.Vector3().setFromMatrixPosition(m);
      p.y = 1.6 + Math.sin(t*1.2 + i*0.8)*0.2;
      m.setPosition(p);
      state.boats.setMatrixAt(i, m);
    }
    state.boats.instanceMatrix.needsUpdate = true;
  }

  // Post pipeline
  const preset = CONFIG.qualityPresets[quality];
  renderer.setRenderTarget(rtScene);
  renderer.render(scene, camera);
  renderer.setRenderTarget(null);

  if(preset.fxaa || preset.bloom){
    // base buffer
    const baseTex = rtScene.texture;

    if(preset.bloom){
      // extract
      extractMat.uniforms.tScene.value = baseTex;
      renderer.setRenderTarget(rtPing); renderer.render(new THREE.Scene().add(extractQuad) || extractQuad, quadCam);
      // blur H
      blurMat.uniforms.tInput.value = rtPing.texture;
      blurMat.uniforms.direction.value.set(1,0);
      blurMat.uniforms.texelSize.value.set(1/rtPing.width, 1/rtPing.height);
      renderer.setRenderTarget(rtPong); renderer.render(new THREE.Scene().add(blurQuad) || blurQuad, quadCam);
      // blur V
      blurMat.uniforms.tInput.value = rtPong.texture;
      blurMat.uniforms.direction.value.set(0,1);
      renderer.setRenderTarget(rtPing); renderer.render(new THREE.Scene().add(blurQuad) || blurQuad, quadCam);
      // compose
      addMat.uniforms.tBase.value = baseTex;
      addMat.uniforms.tBloom.value = rtPing.texture;
      renderer.setRenderTarget(null);
      const addScene = new THREE.Scene(); addScene.add(addQuad);
      renderer.render(addScene, quadCam);
    } else if(preset.fxaa){
      fxaaMat.uniforms.tScene.value = baseTex;
      const fxScene = new THREE.Scene(); fxScene.add(fxaaQuad);
      renderer.setRenderTarget(null); renderer.render(fxScene, quadCam);
    } else {
      renderer.setRenderTarget(null); renderer.render(scene, camera);
    }
  } else {
    renderer.setRenderTarget(null); renderer.render(scene, camera);
  }

  requestAnimationFrame(render);
}
render();

// ------------- MISC -------------
function mathFloor(x){ return x|0; }

// Show "sound" button if audio cannot start immediately
setTimeout(()=>{ if(!audioCtx) showSoundButton(); }, 1200);

// Safe viewport height for Telegram Mini App
function fixVH(){ document.documentElement.style.setProperty('--vh', (window.innerHeight*0.01)+'px'); }
fixVH(); window.addEventListener('resize', fixVH);

})(); // end IIFE