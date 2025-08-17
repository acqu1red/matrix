import { EventEmitter } from './EventEmitter.js';

export class AudioManager extends EventEmitter {
    constructor() {
        super();
        
        this.sounds = new Map();
        this.isEnabled = true;
        this.volume = 0.5;
        
        this.init();
    }
    
    init() {
        // Инициализация аудио системы
    }
    
    playAmbient() {
        // Воспроизведение фоновой музыки
        console.log('Воспроизведение фоновой музыки');
    }
    
    playTempleSelect() {
        // Звук выбора храма
        console.log('Звук выбора храма');
    }
    
    playDeselect() {
        // Звук отмены выбора
        console.log('Звук отмены выбора');
    }
    
    stop() {
        // Остановка всех звуков
        console.log('Остановка всех звуков');
    }
}
