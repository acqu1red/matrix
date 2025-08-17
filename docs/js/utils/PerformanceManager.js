import { EventEmitter } from './EventEmitter.js';

export class PerformanceManager extends EventEmitter {
    constructor() {
        super();
        
        this.fps = 60;
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.isRunning = false;
        
        this.init();
    }
    
    init() {
        // Инициализация мониторинга производительности
    }
    
    start() {
        this.isRunning = true;
        this.monitor();
    }
    
    stop() {
        this.isRunning = false;
    }
    
    monitor() {
        if (!this.isRunning) return;
        
        this.frameCount++;
        const currentTime = performance.now();
        
        if (currentTime - this.lastTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastTime = currentTime;
            
            this.emit('fpsUpdate', this.fps);
        }
        
        requestAnimationFrame(() => this.monitor());
    }
}
