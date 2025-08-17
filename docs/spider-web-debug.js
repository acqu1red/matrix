// Упрощенная версия паутины для отладки
console.log('Spider web script loaded');

function initSpiderWebAnimation() {
  console.log('Initializing spider web animation');
  
  const canvas = document.getElementById('spiderWebCanvas');
  if (!canvas) {
    console.error('Canvas not found!');
    return;
  }
  
  console.log('Canvas found:', canvas);
  
  const ctx = canvas.getContext('2d');
  const rect = canvas.getBoundingClientRect();
  
  canvas.width = rect.width;
  canvas.height = rect.height;
  
  console.log('Canvas size:', canvas.width, 'x', canvas.height);
  
  // Простая анимация паутины
  let time = 0;
  
  function animate() {
    time += 0.02;
    
    // Очистка
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) * 0.3;
    
    // Рисуем радиальные нити
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 1;
    
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + time * 0.1;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
    
    // Рисуем спиральные нити
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 0.5;
    
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      for (let j = 0; j <= 50; j++) {
        const progress = j / 50;
        const currentRadius = radius * progress;
        const angle = progress * Math.PI * 4 + i * 0.5 + time * 0.2;
        
        const x = centerX + Math.cos(angle) * currentRadius;
        const y = centerY + Math.sin(angle) * currentRadius;
        
        if (j === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    }
    
    // Рисуем капли росы
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    for (let i = 0; i < 10; i++) {
      const angle = i * 0.6 + time * 0.3;
      const dropRadius = radius * 0.3 + Math.sin(time + i) * 20;
      const x = centerX + Math.cos(angle) * dropRadius;
      const y = centerY + Math.sin(angle) * dropRadius;
      const size = 2 + Math.sin(time * 2 + i) * 2;
      
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    requestAnimationFrame(animate);
  }
  
  animate();
  console.log('Animation started');
}

// Экспорт
window.initSpiderWebAnimation = initSpiderWebAnimation;
console.log('Spider web functions exported');
