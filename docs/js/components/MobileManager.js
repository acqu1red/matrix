import { EventEmitter } from '../utils/EventEmitter.js';

export class MobileManager extends EventEmitter {
    constructor(sceneManager) {
        super();
        
        this.sceneManager = sceneManager;
        this.isMobile = true;
        
        this.init();
    }
    
    init() {
        // Инициализация мобильных контролов
    }
}
