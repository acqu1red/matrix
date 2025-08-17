// Spider Web Animation for 6-month tariff
// Realistic spider web with 3D effects and dynamic behavior

class SpiderWebAnimation {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    
    this.width = 0;
    this.height = 0;
    
    // Web parameters
    this.webParams = {
      centerX: 0,
      centerY: 0,
      radius: 0,
      spiralCount: 8,        // Number of spiral threads
      radialCount: 12,       // Number of radial threads
      dewDrops: 15,          // Number of dew drops
      windStrength: 0.3,     // Wind effect strength
      gravity: 0.1,          // Gravity effect
      tension: 0.8           // Thread tension
    };
    
    // Animation state
    this.time = 0;
    this.windX = 0;
    this.windY = 0;
    this.dewDrops = [];
    this.spiderPosition = { x: 0, y: 0, z: 0 };
    
    this.init();
  }
  
  init() {
    this.resize();
    this.buildWeb();
    this.createDewDrops();
    this.animate();
    
    window.addEventListener('resize', () => this.resize());
  }
  
  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.width = this.canvas.width = Math.floor(rect.width * this.dpr);
    this.height = this.canvas.height = Math.floor(rect.height * this.dpr);
    
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';
    
    this.webParams.centerX = this.width / 2;
    this.webParams.centerY = this.height / 2;
    this.webParams.radius = Math.min(this.width, this.height) * 0.35;
    
    this.buildWeb();
  }
  
  buildWeb() {
    // Create radial threads (spokes)
    this.radialThreads = [];
    for (let i = 0; i < this.webParams.radialCount; i++) {
      const angle = (i / this.webParams.radialCount) * Math.PI * 2;
      this.radialThreads.push({
        angle: angle,
        points: this.generateRadialThread(angle),
        tension: 0.8 + Math.random() * 0.4
      });
    }
    
    // Create spiral threads
    this.spiralThreads = [];
    for (let i = 0; i < this.webParams.spiralCount; i++) {
      this.spiralThreads.push({
        points: this.generateSpiralThread(i),
        tension: 0.7 + Math.random() * 0.3
      });
    }
  }
  
  generateRadialThread(angle) {
    const points = [];
    const segments = 20;
    
    for (let i = 0; i <= segments; i++) {
      const radius = (i / segments) * this.webParams.radius;
      const x = this.webParams.centerX + Math.cos(angle) * radius;
      const y = this.webParams.centerY + Math.sin(angle) * radius;
      const z = Math.sin(i * 0.3) * 2; // 3D depth variation
      
      points.push({ x, y, z, originalX: x, originalY: y, originalZ: z });
    }
    
    return points;
  }
  
  generateSpiralThread(spiralIndex) {
    const points = [];
    const spiralSpacing = this.webParams.radius / this.webParams.spiralCount;
    const startRadius = spiralSpacing * (spiralIndex + 1);
    const segments = 50;
    
    for (let i = 0; i <= segments; i++) {
      const progress = i / segments;
      const radius = startRadius + (this.webParams.radius - startRadius) * progress;
      const angle = progress * Math.PI * 4 + spiralIndex * 0.5;
      
      const x = this.webParams.centerX + Math.cos(angle) * radius;
      const y = this.webParams.centerY + Math.sin(angle) * radius;
      const z = Math.sin(progress * Math.PI * 2) * 3; // 3D spiral effect
      
      points.push({ x, y, z, originalX: x, originalY: y, originalZ: z });
    }
    
    return points;
  }
  
  createDewDrops() {
    this.dewDrops = [];
    
    for (let i = 0; i < this.webParams.dewDrops; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * this.webParams.radius * 0.8;
      
      this.dewDrops.push({
        x: this.webParams.centerX + Math.cos(angle) * radius,
        y: this.webParams.centerY + Math.sin(angle) * radius,
        z: Math.random() * 5,
        size: 2 + Math.random() * 4,
        phase: Math.random() * Math.PI * 2,
        speed: 0.5 + Math.random() * 1.5
      });
    }
  }
  
  updateWind() {
    this.windX = Math.sin(this.time * 0.5) * this.webParams.windStrength;
    this.windY = Math.cos(this.time * 0.3) * this.webParams.windStrength * 0.7;
  }
  
  updateThreads() {
    // Update radial threads
    this.radialThreads.forEach(thread => {
      thread.points.forEach((point, index) => {
        const windEffect = index / thread.points.length;
        point.x = point.originalX + this.windX * windEffect * thread.tension;
        point.y = point.originalY + this.windY * windEffect * thread.tension;
        point.z = point.originalZ + Math.sin(this.time + index * 0.2) * 1;
      });
    });
    
    // Update spiral threads
    this.spiralThreads.forEach(thread => {
      thread.points.forEach((point, index) => {
        const windEffect = index / thread.points.length;
        point.x = point.originalX + this.windX * windEffect * thread.tension;
        point.y = point.originalY + this.windY * windEffect * thread.tension;
        point.z = point.originalZ + Math.sin(this.time * 0.8 + index * 0.1) * 2;
      });
    });
  }
  
  updateDewDrops() {
    this.dewDrops.forEach(drop => {
      drop.phase += drop.speed * 0.02;
      drop.z += Math.sin(drop.phase) * 0.1;
      drop.size = 2 + Math.sin(drop.phase) * 2;
    });
  }
  
  updateSpider() {
    const spiderRadius = this.webParams.radius * 0.3;
    this.spiderPosition.x = this.webParams.centerX + Math.cos(this.time * 0.3) * spiderRadius;
    this.spiderPosition.y = this.webParams.centerY + Math.sin(this.time * 0.2) * spiderRadius;
    this.spiderPosition.z = Math.sin(this.time * 0.5) * 3;
  }
  
  drawWeb() {
    this.ctx.save();
    
    // Clear with fade effect
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // Draw radial threads (spokes)
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    this.ctx.lineWidth = 1 * this.dpr;
    this.ctx.lineCap = 'round';
    
    this.radialThreads.forEach(thread => {
      this.ctx.beginPath();
      thread.points.forEach((point, index) => {
        const alpha = 0.3 + (index / thread.points.length) * 0.4;
        this.ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        
        if (index === 0) {
          this.ctx.moveTo(point.x, point.y);
        } else {
          this.ctx.lineTo(point.x, point.y);
        }
      });
      this.ctx.stroke();
    });
    
    // Draw spiral threads
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.lineWidth = 0.8 * this.dpr;
    
    this.spiralThreads.forEach(thread => {
      this.ctx.beginPath();
      thread.points.forEach((point, index) => {
        const alpha = 0.2 + (index / thread.points.length) * 0.3;
        this.ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        
        if (index === 0) {
          this.ctx.moveTo(point.x, point.y);
        } else {
          this.ctx.lineTo(point.x, point.y);
        }
      });
      this.ctx.stroke();
    });
    
    this.ctx.restore();
  }
  
  drawDewDrops() {
    this.ctx.save();
    
    this.dewDrops.forEach(drop => {
      const alpha = 0.6 + Math.sin(drop.phase) * 0.3;
      
      // Dew drop glow
      const gradient = this.ctx.createRadialGradient(
        drop.x, drop.y, 0,
        drop.x, drop.y, drop.size * 2
      );
      gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.8})`);
      gradient.addColorStop(0.5, `rgba(255, 255, 255, ${alpha * 0.4})`);
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(drop.x, drop.y, drop.size * 2, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Dew drop core
      this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      this.ctx.beginPath();
      this.ctx.arc(drop.x, drop.y, drop.size * 0.5, 0, Math.PI * 2);
      this.ctx.fill();
    });
    
    this.ctx.restore();
  }
  
  drawSpider() {
    this.ctx.save();
    
    const spiderSize = 3 * this.dpr;
    const alpha = 0.7 + Math.sin(this.time * 2) * 0.2;
    
    // Spider glow
    const gradient = this.ctx.createRadialGradient(
      this.spiderPosition.x, this.spiderPosition.y, 0,
      this.spiderPosition.x, this.spiderPosition.y, spiderSize * 3
    );
    gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.6})`);
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(this.spiderPosition.x, this.spiderPosition.y, spiderSize * 3, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Spider body
    this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    this.ctx.beginPath();
    this.ctx.arc(this.spiderPosition.x, this.spiderPosition.y, spiderSize, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.restore();
  }
  
  animate() {
    this.time += 0.016; // ~60fps
    
    this.updateWind();
    this.updateThreads();
    this.updateDewDrops();
    this.updateSpider();
    
    this.drawWeb();
    this.drawDewDrops();
    this.drawSpider();
    
    requestAnimationFrame(() => this.animate());
  }
}

// Initialize spider web animation
function initSpiderWebAnimation() {
  const canvas = document.getElementById('spiderWebCanvas');
  if (canvas) {
    new SpiderWebAnimation('spiderWebCanvas');
  }
}

// Export for use in HTML
window.initSpiderWebAnimation = initSpiderWebAnimation;
