/* ====== Вспомогательные функции ====== */
const TAU = Math.PI*2;
const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));
const lerp = (a,b,t)=>a+(b-a)*t;
const smoothstep=(t)=>t*t*(3-2*t);
function rndSeeded(seed){
  let s = seed>>>0;
  return ()=> (s = (s*1664525 + 1013904223) >>> 0) / 0xFFFFFFFF;
}

/* --- 2D value noise для органичного движения --- */
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

/* ====== Геометрия: сглаживание кривой Catmull–Rom -> Bezier ====== */
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

/* ====== Независимая линия с 3D эффектом ====== */
class IndependentLine{
  constructor({x, y, length, angle, seed, noise, containerWidth, containerHeight}){
    this.x = x;
    this.y = y;
    this.length = length;
    this.angle = angle;
    this.seed = seed;
    this.noise = noise;
    this.containerWidth = containerWidth;
    this.containerHeight = containerHeight;
    
    // Уникальные параметры для каждой линии
    this.phase = Math.random()*1000 + seed*7.318;
    this.speed = 0.1 + Math.random()*0.2;
    this.amplitude = 8 + Math.random()*12;
    this.frequency = 0.8 + Math.random()*1.2;
    this.samples = 12;
    
    // 3D параметры
    this.depth = Math.random()*100;
    this.depthSpeed = 0.05 + Math.random()*0.1;
    this.rotationX = (Math.random() - 0.5) * 0.3;
    this.rotationY = (Math.random() - 0.5) * 0.3;
  }
  
  /* Возвращает точки линии с 3D деформацией */
  getPoints(t){
    const points = [];
    const cos = Math.cos(this.angle);
    const sin = Math.sin(this.angle);
    
    for(let i = 0; i < this.samples; i++){
      const progress = i / (this.samples - 1);
      const baseX = this.x + cos * this.length * progress;
      const baseY = this.y + sin * this.length * progress;
      
      // Шум для деформации
      const nx = baseX / this.containerWidth * this.frequency + this.phase;
      const ny = baseY / this.containerHeight * this.frequency + this.seed;
      
      const dx = this.noise(nx*0.75 + 17, ny*0.75 + 31 + t*this.speed*0.7) +
                 0.6*this.noise(nx*1.3 + 111, ny*1.1 + 9 + t*this.speed*1.3);
      const dy = this.noise(nx + 5, ny + 13 + t*this.speed);
      
      // 3D эффект через глубину
      const depth = this.depth + Math.sin(t*this.depthSpeed + this.seed) * 20;
      const depthScale = 1 + (depth / 200);
      
      // 3D поворот
      const rotatedX = baseX * Math.cos(this.rotationX) + depth * Math.sin(this.rotationX);
      const rotatedY = baseY * Math.cos(this.rotationY) + depth * Math.sin(this.rotationY);
      
      points.push({
        x: rotatedX + dx * this.amplitude * depthScale,
        y: rotatedY + dy * this.amplitude * depthScale,
        z: depth
      });
    }
    
    return points;
  }
}

/* ====== Частицы-вспышки для столкновений ====== */
class Spark{
  constructor(x,y){
    this.x=x; this.y=y;
    this.t=0; this.life=0.25 + Math.random()*0.25;
    this.r0=2+Math.random()*3;
    this.r1=18+Math.random()*16;
  }
  step(dt){ this.t+=dt; }
  get alive(){ return this.t<this.life; }
  render(ctx){
    const k = this.t/this.life;
    const a = 1 - smoothstep(k);
    ctx.save();
    ctx.globalCompositeOperation='lighter';
    
    const g = ctx.createRadialGradient(this.x,this.y, this.r0, this.x,this.y, this.r1);
    g.addColorStop(0, `rgba(214,199,184,${0.9*a})`);
    g.addColorStop(0.4, `rgba(214,199,184,${0.35*a})`);
    g.addColorStop(1, `rgba(214,199,184,0)`);
    ctx.fillStyle=g;
    ctx.beginPath(); ctx.arc(this.x,this.y,this.r1,0,TAU); ctx.fill();
    
    ctx.shadowBlur=18; ctx.shadowColor='rgba(214,199,184,1)';
    ctx.fillStyle=`rgba(214,199,184,${0.7*a})`;
    ctx.beginPath(); ctx.arc(this.x,this.y,this.r0*(1+1.5*k),0,TAU); ctx.fill();
    ctx.restore();
  }
}

/* ====== Основной класс для управления линиями ====== */
class NeuralLinesAnimation {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.DPR = Math.min(2, window.devicePixelRatio || 1);
    
    this.W = 0;
    this.H = 0;
    this.lines = [];
    this.sparks = [];
    this.noise = makeValueNoise2D(1234567);
    this.tPrev = performance.now()/1000;
    
    this.params = {
      lineCount: 8,        // Количество линий
      lineLength: 80,      // Длина линии
      proximity: 15,       // Дистанция для столкновения
      sparksRateCap: 50    // Максимум вспышек за кадр
    };
    
    this.resize();
    this.buildLines();
    this.animate();
  }
  
  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.W = this.canvas.width = Math.floor(rect.width * this.DPR);
    this.H = this.canvas.height = Math.floor(rect.height * this.DPR);
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';
  }
  
  buildLines() {
    this.lines = [];
    for(let i = 0; i < this.params.lineCount; i++) {
      const x = Math.random() * this.W;
      const y = Math.random() * this.H;
      const angle = Math.random() * TAU;
      
      this.lines.push(new IndependentLine({
        x: x,
        y: y,
        length: this.params.lineLength,
        angle: angle,
        seed: i * 13.7,
        noise: this.noise,
        containerWidth: this.W,
        containerHeight: this.H
      }));
    }
  }
  
  animate() {
    const now = performance.now()/1000;
    const dt = Math.min(0.033, now - this.tPrev);
    this.tPrev = now;
    
    // Полупрозрачная смазка для шлейфа
    this.ctx.globalCompositeOperation = 'source-over';
    this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
    this.ctx.fillRect(0, 0, this.W, this.H);
    
    // Получаем точки всех линий
    const allPoints = this.lines.map(line => line.getPoints(now));
    
    // Отрисовка мягкого свечения
    this.ctx.save();
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.globalCompositeOperation = 'lighter';
    this.ctx.shadowBlur = 12 * this.DPR;
    this.ctx.shadowColor = 'rgba(214,199,184,0.8)';
    this.ctx.strokeStyle = 'rgba(214,199,184,0.15)';
    this.ctx.lineWidth = 4 * this.DPR;
    
    for(const points of allPoints) {
      this.ctx.beginPath();
      drawSmooth(this.ctx, points);
      this.ctx.stroke();
    }
    this.ctx.restore();
    
    // Основной яркий штрих
    this.ctx.save();
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.strokeStyle = 'rgba(214,199,184,0.7)';
    this.ctx.lineWidth = 1.5 * this.DPR;
    this.ctx.shadowBlur = 6 * this.DPR;
    this.ctx.shadowColor = 'rgba(214,199,184,1)';
    
    for(const points of allPoints) {
      this.ctx.beginPath();
      drawSmooth(this.ctx, points);
      this.ctx.stroke();
    }
    this.ctx.restore();
    
    // Детекция столкновений
    this.detectCollisions(allPoints, now);
    
    // Обновление вспышек
    for(let i = this.sparks.length - 1; i >= 0; i--) {
      const spark = this.sparks[i];
      spark.step(dt);
      if(!spark.alive) {
        this.sparks.splice(i, 1);
        continue;
      }
      spark.render(this.ctx);
    }
    
    requestAnimationFrame(() => this.animate());
  }
  
  detectCollisions(allPoints, now) {
    const prox2 = this.params.proximity * this.params.proximity;
    let sparksThisFrame = 0;
    
    for(let i = 0; i < allPoints.length; i++) {
      for(let j = i + 1; j < allPoints.length; j++) {
        const points1 = allPoints[i];
        const points2 = allPoints[j];
        
        for(const p1 of points1) {
          if(sparksThisFrame >= this.params.sparksRateCap) break;
          
          for(const p2 of points2) {
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const d2 = dx*dx + dy*dy;
            
            if(d2 < prox2) {
              this.sparks.push(new Spark((p1.x + p2.x)/2, (p1.y + p2.y)/2));
              sparksThisFrame++;
              break;
            }
          }
        }
      }
    }
  }
}

// Экспорт для использования в основном файле
window.NeuralLinesAnimation = NeuralLinesAnimation;
