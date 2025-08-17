// Основной модуль с базовыми функциями
const TAU = Math.PI*2;
const lerp = (a,b,t)=>a+(b-a)*t;
const smoothstep=(t)=>t*t*(3-2*t);

// Оптимизированный генератор случайных чисел
function rndSeeded(seed){
  let s = seed>>>0;
  return ()=> (s = (s*1664525 + 1013904223) >>> 0) / 0xFFFFFFFF;
}

// Кэшированный шум для лучшей производительности
const noiseCache = new Map();
function makeValueNoise2D(seed=12345){
  const cacheKey = `noise_${seed}`;
  if(noiseCache.has(cacheKey)) {
    return noiseCache.get(cacheKey);
  }
  
  const rand = rndSeeded(seed);
  const perm = new Uint16Array(512);
  for (let i=0;i<256;i++) perm[i]=i;
  for (let i=255;i>0;i--){
    const j = (rand()* (i+1))|0;
    [perm[i],perm[j]]=[perm[j],perm[i]];
  }
  for(let i=0;i<256;i++) perm[256+i]=perm[i];

  const grad = new Float32Array(256*2);
  for (let i=0;i<256;i++){
    const a = rand()*TAU;
    grad[i*2]=Math.cos(a); grad[i*2+1]=Math.sin(a);
  }
  
  function dotGrid(ix,iy,x,y){
    const gi = perm[(ix+perm[iy&255])&255]&255;
    const gx=grad[gi*2], gy=grad[gi*2+1];
    const dx=x-ix, dy=y-iy;
    return gx*dx + gy*dy;
  }
  
  const noise = function(x,y){
    const x0=Math.floor(x), y0=Math.floor(y);
    const x1=x0+1, y1=y0+1;
    const sx=smoothstep(x-x0), sy=smoothstep(y-y0);
    const n0=dotGrid(x0,y0,x,y);
    const n1=dotGrid(x1,y0,x,y);
    const ix0=lerp(n0,n1,sx);
    const n2=dotGrid(x0,y1,x,y);
    const n3=dotGrid(x1,y1,x,y);
    const ix1=lerp(n2,n3,sx);
    return lerp(ix0,ix1,sy);
  };
  
  noiseCache.set(cacheKey, noise);
  return noise;
}

// Оптимизированная функция сглаживания
function drawSmooth(ctx, pts, closed=false){
  if(pts.length<2) return;
  const p = pts;
  ctx.moveTo(p[0].x,p[0].y);
  for(let i=0;i<p.length-1;i++){
    const p0 = p[i-1] || p[i];
    const p1 = p[i];
    const p2 = p[i+1];
    const p3 = p[i+2] || p[i+1];

    const t = 0.5;
    const cp1x = p1.x + (p2.x - p0.x)*t/6;
    const cp1y = p1.y + (p2.y - p0.y)*t/6;
    const cp2x = p2.x - (p3.x - p1.x)*t/6;
    const cp2y = p2.y - (p3.y - p1.y)*t/6;
    ctx.bezierCurveTo(cp1x,cp1y, cp2x,cp2y, p2.x,p2.y);
  }
  if(closed) ctx.closePath();
}

// Экспорт для использования в других модулях
window.NeuralCore = {
  TAU,
  lerp,
  smoothstep,
  rndSeeded,
  makeValueNoise2D,
  drawSmooth
};
