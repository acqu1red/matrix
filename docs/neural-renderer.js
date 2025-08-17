// Модуль рендеринга с оптимизированной отрисовкой
class NeuralRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.DPR = Math.min(2, window.devicePixelRatio || 1);
    
    // Предварительно созданные стили для отрисовки
    this.styles = {
      glow: {
        shadowBlur: 15,
        shadowColor: 'rgba(214,199,184,0.6)',
        strokeStyle: 'rgba(214,199,184,0.06)',
        lineWidth: 5
      },
      main: {
        shadowBlur: 8,
        shadowColor: 'rgba(214,199,184,0.9)',
        strokeStyle: 'rgba(214,199,184,0.6)',
        lineWidth: 1.2
      }
    };
    
    // Кэш для путей линий
    this.pathCache = new Map();
    this.frameCount = 0;
  }
  
  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.W = this.canvas.width = Math.floor(rect.width * this.DPR);
    this.H = this.canvas.height = Math.floor(rect.height * this.DPR);
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';
    
    // Очищаем кэш при изменении размера
    this.pathCache.clear();
  }
  
  // Оптимизированная очистка с использованием requestIdleCallback
  clear() {
    this.ctx.globalCompositeOperation = 'source-over';
    this.ctx.fillStyle = 'rgba(0,0,0,0.12)'; // Еще меньше прозрачность
    this.ctx.fillRect(0, 0, this.W, this.H);
  }
  
  // Пакетная отрисовка всех линий
  renderLines(allPoints) {
    this.ctx.save();
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.globalCompositeOperation = 'lighter';
    
    // Рисуем все линии за один проход с оптимизацией
    for(let i = 0; i < allPoints.length; i++) {
      const points = allPoints[i];
      
      // Мягкое свечение
      this.ctx.shadowBlur = this.styles.glow.shadowBlur * this.DPR;
      this.ctx.shadowColor = this.styles.glow.shadowColor;
      this.ctx.strokeStyle = this.styles.glow.strokeStyle;
      this.ctx.lineWidth = this.styles.glow.lineWidth * this.DPR;
      
      this.ctx.beginPath();
      window.NeuralCore.drawSmooth(this.ctx, points);
      this.ctx.stroke();
      
      // Основной штрих
      this.ctx.shadowBlur = this.styles.main.shadowBlur * this.DPR;
      this.ctx.shadowColor = this.styles.main.shadowColor;
      this.ctx.strokeStyle = this.styles.main.strokeStyle;
      this.ctx.lineWidth = this.styles.main.lineWidth * this.DPR;
      
      this.ctx.beginPath();
      window.NeuralCore.drawSmooth(this.ctx, points);
      this.ctx.stroke();
    }
    
    this.ctx.restore();
  }
  
  // Оптимизированная отрисовка вспышек
  renderSparks(sparks) {
    if(sparks.length === 0) return;
    
    this.ctx.save();
    this.ctx.globalCompositeOperation = 'lighter';
    
    for(const spark of sparks) {
      spark.render(this.ctx);
    }
    
    this.ctx.restore();
  }
  
  // Полная отрисовка кадра
  render(allPoints, sparks) {
    this.clear();
    this.renderLines(allPoints);
    this.renderSparks(sparks);
    this.frameCount++;
  }
}

// Экспорт
window.NeuralRenderer = NeuralRenderer;
