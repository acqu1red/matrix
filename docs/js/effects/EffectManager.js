import { EventEmitter } from '../utils/EventEmitter.js';

export class EffectManager extends EventEmitter {
    constructor(sceneManager) {
        super();
        
        this.sceneManager = sceneManager;
        this.effects = new Map();
        
        this.init();
    }
    
    init() {
        // Инициализация эффектов
    }
    
    playTempleSelectEffect(templeId) {
        // Эффект выбора храма
        console.log(`Эффект выбора храма ${templeId}`);
    }
    
    playTempleHoverEffect(templeId) {
        // Эффект наведения на храм
        console.log(`Эффект наведения на храм ${templeId}`);
    }
    
    playDeselectEffect() {
        // Эффект отмены выбора
        console.log('Эффект отмены выбора');
    }
    
    updateCameraEffects() {
        // Обновление эффектов камеры
    }
}
