// Web Worker для вычисления точек линий
const TAU = Math.PI*2;
const lerp = (a,b,t)=>a+(b-a)*t;
const smoothstep=(t)=>t*t*(3-2*t);

function rndSeeded(seed){
  let s = seed>>>0;
  return ()=> (s = (s*1664525 + 1013904223) >>> 0) / 0xFFFFFFFF;
}

function makeValueNoise2D(seed=12345){
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
  return function noise(x,y){
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
  }
}

// Обработчик сообщений от основного потока
self.onmessage = function(e) {
  const { lines, time, width, height } = e.data;
  const noise = makeValueNoise2D(1234567);
  
  const results = lines.map(line => {
    const points = [];
    const cos = Math.cos(line.angle);
    const sin = Math.sin(line.angle);
    
    // Движение центра линии
    const moveX = Math.cos(line.moveDirection + time * line.moveSpeed) * line.moveRadius +
                 Math.cos(line.moveDirection * 2 + time * line.moveSpeed * 1.5) * (line.moveRadius * 0.3);
    const moveY = Math.sin(line.moveDirection + time * line.moveSpeed) * line.moveRadius +
                 Math.sin(line.moveDirection * 2 + time * line.moveSpeed * 1.5) * (line.moveRadius * 0.3);
    const currentX = line.x + moveX;
    const currentY = line.y + moveY;
    
    for(let i = 0; i < line.samples; i++){
      const progress = i / (line.samples - 1);
      const baseX = currentX + cos * line.length * progress;
      const baseY = currentY + sin * line.length * progress;
      
      const nx = baseX / width * line.frequency + line.phase;
      const ny = baseY / height * line.frequency + line.seed;
      
      const dx = noise(nx*0.75 + 17, ny*0.75 + 31 + time*line.speed*0.7) +
                 0.6*noise(nx*1.3 + 111, ny*1.1 + 9 + time*line.speed*1.3) +
                 0.3*noise(nx*2.1 + 23, ny*1.8 + 47 + time*line.speed*2.1);
      const dy = noise(nx + 5, ny + 13 + time*line.speed) +
                 0.5*noise(nx*1.7 + 89, ny*1.4 + 67 + time*line.speed*1.8);
      
      const depth = line.depth + Math.sin(time*line.depthSpeed + line.seed) * 30 +
                   Math.sin(time*line.depthSpeed*2 + line.seed*2) * 15;
      const depthScale = 1 + (depth / 150);
      
      const dynamicRotationX = line.rotationX + Math.sin(time*0.5 + line.seed) * 0.1;
      const dynamicRotationY = line.rotationY + Math.cos(time*0.7 + line.seed) * 0.1;
      
      const rotatedX = baseX * Math.cos(dynamicRotationX) + depth * Math.sin(dynamicRotationX);
      const rotatedY = baseY * Math.cos(dynamicRotationY) + depth * Math.sin(dynamicRotationY);
      
      points.push({
        x: rotatedX + dx * line.amplitude * depthScale,
        y: rotatedY + dy * line.amplitude * depthScale,
        z: depth
      });
    }
    
    return points;
  });
  
  self.postMessage({ results });
};
