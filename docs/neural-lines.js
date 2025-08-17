// Используем функции из основного модуля
const { TAU, lerp, smoothstep, rndSeeded, makeValueNoise2D, drawSmooth } = window.NeuralCore;

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
    this.speed = 0.25 + Math.random()*0.4; // Значительно увеличена скорость
    this.amplitude = 25 + Math.random()*35; // Значительно увеличена амплитуда
    this.frequency = 1.8 + Math.random()*2.5; // Увеличена частота
    this.samples = 20; // Оптимизировано количество точек
    
    // 3D параметры
    this.depth = Math.random()*100;
    this.depthSpeed = 0.12 + Math.random()*0.2; // Увеличена скорость глубины
    this.rotationX = (Math.random() - 0.5) * 0.6;
    this.rotationY = (Math.random() - 0.5) * 0.6;
    
    // Дополнительные параметры для движения
    this.moveSpeed = 0.04 + Math.random()*0.06; // Увеличена скорость движения
    this.moveDirection = Math.random() * TAU;
    this.moveRadius = 40 + Math.random() * 60; // Радиус движения
  }
  
  /* Возвращает точки линии с 3D деформацией */
  getPoints(t){
    const points = [];
    const cos = Math.cos(this.angle);
    const sin = Math.sin(this.angle);
    
    // Более сложное движение центра линии
    const moveX = Math.cos(this.moveDirection + t * this.moveSpeed) * this.moveRadius +
                 Math.cos(this.moveDirection * 2 + t * this.moveSpeed * 1.5) * (this.moveRadius * 0.3);
    const moveY = Math.sin(this.moveDirection + t * this.moveSpeed) * this.moveRadius +
                 Math.sin(this.moveDirection * 2 + t * this.moveSpeed * 1.5) * (this.moveRadius * 0.3);
    const currentX = this.x + moveX;
    const currentY = this.y + moveY;
    
    for(let i = 0; i < this.samples; i++){
      const progress = i / (this.samples - 1);
      const baseX = currentX + cos * this.length * progress;
      const baseY = currentY + sin * this.length * progress;
      
      // Многослойный шум для более сложной деформации
      const nx = baseX / this.containerWidth * this.frequency + this.phase;
      const ny = baseY / this.containerHeight * this.frequency + this.seed;
      
      const dx = this.noise(nx*0.75 + 17, ny*0.75 + 31 + t*this.speed*0.7) +
                 0.6*this.noise(nx*1.3 + 111, ny*1.1 + 9 + t*this.speed*1.3) +
                 0.3*this.noise(nx*2.1 + 23, ny*1.8 + 47 + t*this.speed*2.1);
      const dy = this.noise(nx + 5, ny + 13 + t*this.speed) +
                 0.5*this.noise(nx*1.7 + 89, ny*1.4 + 67 + t*this.speed*1.8);
      
      // 3D эффект через глубину с более сложным движением
      const depth = this.depth + Math.sin(t*this.depthSpeed + this.seed) * 30 +
                   Math.sin(t*this.depthSpeed*2 + this.seed*2) * 15;
      const depthScale = 1 + (depth / 150);
      
      // 3D поворот с динамическим изменением
      const dynamicRotationX = this.rotationX + Math.sin(t*0.5 + this.seed) * 0.1;
      const dynamicRotationY = this.rotationY + Math.cos(t*0.7 + this.seed) * 0.1;
      
      const rotatedX = baseX * Math.cos(dynamicRotationX) + depth * Math.sin(dynamicRotationX);
      const rotatedY = baseY * Math.cos(dynamicRotationY) + depth * Math.sin(dynamicRotationY);
      
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
    // Используем модульный рендерер
    this.renderer = new window.NeuralRenderer(canvas);
    this.W = 0;
    this.H = 0;
    this.lines = [];
    this.sparks = [];
    this.noise = makeValueNoise2D(1234567);
    this.tPrev = performance.now()/1000;
    
    this.params = {
      lineCount: 15,       // Количество линий
      lineLength: 200,     // Длина линии
      proximity: 25,       // Дистанция для столкновения
      sparksRateCap: 50    // Максимум вспышек за кадр
    };
    
    // Попытка использовать Web Worker для лучшей производительности
    this.useWorker = typeof Worker !== 'undefined';
    if(this.useWorker) {
      try {
        this.worker = new Worker('neural-worker.js');
        this.worker.onmessage = (e) => {
          this.workerResults = e.data.results;
        };
      } catch(e) {
        this.useWorker = false;
      }
    }
    
    this.resize();
    this.buildLines();
    this.animate();
  }
  
  resize() {
    this.renderer.resize();
    this.W = this.renderer.W;
    this.H = this.renderer.H;
  }
  
  buildLines() {
    this.lines = [];
    for(let i = 0; i < this.params.lineCount; i++) {
      // Распределяем линии по всей области более равномерно
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
    
    // Получаем точки всех линий
    let allPoints;
    if(this.useWorker && this.worker) {
      // Используем Web Worker для вычислений
      this.worker.postMessage({
        lines: this.lines.map(line => ({
          x: line.x, y: line.y, length: line.length, angle: line.angle,
          seed: line.seed, phase: line.phase, speed: line.speed,
          amplitude: line.amplitude, frequency: line.frequency,
          samples: line.samples, depth: line.depth, depthSpeed: line.depthSpeed,
          rotationX: line.rotationX, rotationY: line.rotationY,
          moveSpeed: line.moveSpeed, moveDirection: line.moveDirection,
          moveRadius: line.moveRadius
        })),
        time: now,
        width: this.W,
        height: this.H
      });
      allPoints = this.workerResults || this.lines.map(line => line.getPoints(now));
    } else {
      allPoints = this.lines.map(line => line.getPoints(now));
    }
    
    // Упрощенная детекция столкновений (каждый 3-й кадр)
    if(Math.floor(now * 30) % 3 === 0) {
      this.detectCollisions(allPoints, now);
    }
    
    // Обновление вспышек
    if(this.sparks.length > 0) {
      for(let i = this.sparks.length - 1; i >= 0; i--) {
        const spark = this.sparks[i];
        spark.step(dt);
        if(!spark.alive) {
          this.sparks.splice(i, 1);
          continue;
        }
      }
    }
    
    // Используем модульный рендерер
    this.renderer.render(allPoints, this.sparks);
    
    requestAnimationFrame(() => this.animate());
  }
  
  detectCollisions(allPoints, now) {
    const prox2 = this.params.proximity * this.params.proximity;
    let sparksThisFrame = 0;
    
    // Оптимизация: проверяем только каждую 3-ю точку
    const step = 3;
    
    for(let i = 0; i < allPoints.length; i++) {
      for(let j = i + 1; j < allPoints.length; j++) {
        const points1 = allPoints[i];
        const points2 = allPoints[j];
        
        for(let k = 0; k < points1.length; k += step) {
          if(sparksThisFrame >= this.params.sparksRateCap) break;
          
          const p1 = points1[k];
          for(let l = 0; l < points2.length; l += step) {
            const p2 = points2[l];
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
