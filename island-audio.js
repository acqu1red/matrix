// Модуль аудио острова
class IslandAudio {
    constructor(utils) {
        this.utils = utils;
        this.config = ISLAND_CONFIG;
        this.audioContext = null;
        this.sounds = {};
        this.isEnabled = false;
        this.masterVolume = 0.5;
    }

    // Инициализация аудио
    init() {
        try {
            // Создание аудио контекста
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Создание звуков
            this.createSounds();
            
            // Настройка обработчиков событий
            this.setupEventHandlers();
            
            this.isEnabled = true;
            console.log('Аудио система инициализирована');
            
        } catch (error) {
            console.warn('Аудио не поддерживается:', error);
            this.isEnabled = false;
        }
    }

    // Создание звуков
    createSounds() {
        if (!this.isEnabled) return;
        
        // Создание звука волн
        this.createWaveSound();
        
        // Создание звука ветра
        this.createWindSound();
        
        // Создание звуков птиц
        this.createBirdSounds();
        
        // Создание звука дождя
        this.createRainSound();
        
        // Создание звука грома
        this.createThunderSound();
    }

    // Создание звука волн
    createWaveSound() {
        const waveConfig = this.config.AUDIO.WAVES;
        
        // Создание осциллятора для волн
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        // Настройка фильтра для имитации звука волн
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(200, this.audioContext.currentTime);
        filter.Q.setValueAtTime(0.5, this.audioContext.currentTime);
        
        // Настройка осциллятора
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(50, this.audioContext.currentTime);
        
        // Настройка громкости
        gainNode.gain.setValueAtTime(waveConfig.VOLUME * this.masterVolume, this.audioContext.currentTime);
        
        // Создание модуляции для реалистичности
        const lfo = this.audioContext.createOscillator();
        const lfoGain = this.audioContext.createGain();
        
        lfo.frequency.setValueAtTime(0.1, this.audioContext.currentTime);
        lfoGain.gain.setValueAtTime(10, this.audioContext.currentTime);
        
        // Подключение узлов
        lfo.connect(lfoGain);
        lfoGain.connect(oscillator.frequency);
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Запуск осцилляторов
        lfo.start();
        oscillator.start();
        
        this.sounds.waves = {
            oscillator: oscillator,
            gain: gainNode,
            filter: filter,
            lfo: lfo,
            lfoGain: lfoGain
        };
    }

    // Создание звука ветра
    createWindSound() {
        const windConfig = this.config.AUDIO.WIND;
        
        // Создание белого шума для ветра
        const bufferSize = this.audioContext.sampleRate * 2;
        const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        
        const noise = this.audioContext.createBufferSource();
        noise.buffer = noiseBuffer;
        noise.loop = true;
        
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        // Настройка фильтра для ветра
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(300, this.audioContext.currentTime);
        filter.Q.setValueAtTime(1, this.audioContext.currentTime);
        
        // Настройка громкости
        gainNode.gain.setValueAtTime(windConfig.VOLUME * this.masterVolume, this.audioContext.currentTime);
        
        // Подключение узлов
        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Запуск
        noise.start();
        
        this.sounds.wind = {
            noise: noise,
            gain: gainNode,
            filter: filter
        };
    }

    // Создание звуков птиц
    createBirdSounds() {
        const birdConfig = this.config.AUDIO.BIRDS;
        
        // Создание нескольких звуков птиц
        const birdSounds = [];
        
        for (let i = 0; i < 5; i++) {
            const birdSound = this.createBirdSound();
            birdSounds.push(birdSound);
        }
        
        this.sounds.birds = birdSounds;
        
        // Запуск случайных звуков птиц
        this.startBirdSounds();
    }

    // Создание одного звука птицы
    createBirdSound() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        // Настройка фильтра
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(2000 + Math.random() * 1000, this.audioContext.currentTime);
        filter.Q.setValueAtTime(10, this.audioContext.currentTime);
        
        // Настройка осциллятора
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(1500 + Math.random() * 500, this.audioContext.currentTime);
        
        // Настройка громкости
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        
        // Подключение узлов
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        return {
            oscillator: oscillator,
            gain: gainNode,
            filter: filter,
            isPlaying: false
        };
    }

    // Запуск случайных звуков птиц
    startBirdSounds() {
        if (!this.isEnabled || !this.sounds.birds) return;
        
        const birdConfig = this.config.AUDIO.BIRDS;
        
        setInterval(() => {
            if (Math.random() < 0.3) { // 30% вероятность звука
                this.playRandomBirdSound();
            }
        }, birdConfig.RANDOM_INTERVAL);
    }

    // Воспроизведение случайного звука птицы
    playRandomBirdSound() {
        if (!this.sounds.birds || this.sounds.birds.length === 0) return;
        
        const birdSound = this.sounds.birds[Math.floor(Math.random() * this.sounds.birds.length)];
        
        if (!birdSound.isPlaying) {
            this.playBirdSound(birdSound);
        }
    }

    // Воспроизведение звука птицы
    playBirdSound(birdSound) {
        if (!this.isEnabled) return;
        
        birdSound.isPlaying = true;
        
        const now = this.audioContext.currentTime;
        const duration = 0.5 + Math.random() * 1.0;
        
        // Плавное увеличение громкости
        birdSound.gain.gain.setValueAtTime(0, now);
        birdSound.gain.gain.linearRampToValueAtTime(
            this.config.AUDIO.BIRDS.VOLUME * this.masterVolume, 
            now + 0.1
        );
        
        // Плавное уменьшение громкости
        birdSound.gain.gain.linearRampToValueAtTime(0, now + duration);
        
        // Остановка через duration секунд
        setTimeout(() => {
            birdSound.isPlaying = false;
        }, duration * 1000);
    }

    // Создание звука дождя
    createRainSound() {
        // Создание белого шума для дождя
        const bufferSize = this.audioContext.sampleRate * 2;
        const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        
        const noise = this.audioContext.createBufferSource();
        noise.buffer = noiseBuffer;
        noise.loop = true;
        
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        // Настройка фильтра для дождя
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(800, this.audioContext.currentTime);
        filter.Q.setValueAtTime(0.5, this.audioContext.currentTime);
        
        // Настройка громкости (изначально 0)
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        
        // Подключение узлов
        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Запуск
        noise.start();
        
        this.sounds.rain = {
            noise: noise,
            gain: gainNode,
            filter: filter,
            isActive: false
        };
    }

    // Создание звука грома
    createThunderSound() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        // Настройка фильтра для грома
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(100, this.audioContext.currentTime);
        filter.Q.setValueAtTime(0.5, this.audioContext.currentTime);
        
        // Настройка осциллятора
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(80, this.audioContext.currentTime);
        
        // Настройка громкости (изначально 0)
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        
        // Подключение узлов
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Запуск
        oscillator.start();
        
        this.sounds.thunder = {
            oscillator: oscillator,
            gain: gainNode,
            filter: filter,
            isActive: false
        };
    }

    // Настройка обработчиков событий
    setupEventHandlers() {
        // Обработка клика для активации аудио
        document.addEventListener('click', () => {
            this.resumeAudioContext();
        }, { once: true });
        
        // Обработка изменения времени суток
        window.addEventListener('timeOfDayChanged', (event) => {
            this.onTimeOfDayChanged(event.detail.timeOfDay);
        });
        
        // Обработка изменения качества
        window.addEventListener('qualityChanged', (event) => {
            this.onQualityChanged(event.detail.quality);
        });
    }

    // Возобновление аудио контекста
    resumeAudioContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    // Обработка изменения времени суток
    onTimeOfDayChanged(timeOfDay) {
        if (!this.isEnabled) return;
        
        switch (timeOfDay) {
            case 'dawn':
                this.setVolume('waves', 0.4);
                this.setVolume('wind', 0.3);
                this.setVolume('birds', 0.6);
                break;
            case 'day':
                this.setVolume('waves', 0.5);
                this.setVolume('wind', 0.2);
                this.setVolume('birds', 0.4);
                break;
            case 'sunset':
                this.setVolume('waves', 0.3);
                this.setVolume('wind', 0.4);
                this.setVolume('birds', 0.2);
                break;
            case 'night':
                this.setVolume('waves', 0.2);
                this.setVolume('wind', 0.1);
                this.setVolume('birds', 0.1);
                break;
        }
    }

    // Обработка изменения качества
    onQualityChanged(quality) {
        if (!this.isEnabled) return;
        
        switch (quality) {
            case 'low':
                this.masterVolume = 0.3;
                break;
            case 'auto':
                this.masterVolume = 0.5;
                break;
            case 'high':
                this.masterVolume = 0.7;
                break;
        }
        
        // Обновление громкости всех звуков
        this.updateAllVolumes();
    }

    // Установка громкости для конкретного звука
    setVolume(soundName, volume) {
        if (!this.isEnabled || !this.sounds[soundName]) return;
        
        const sound = this.sounds[soundName];
        const targetVolume = volume * this.masterVolume;
        
        if (sound.gain) {
            sound.gain.gain.setValueAtTime(targetVolume, this.audioContext.currentTime);
        }
    }

    // Обновление громкости всех звуков
    updateAllVolumes() {
        if (!this.isEnabled) return;
        
        // Обновление громкости волн
        if (this.sounds.waves) {
            this.setVolume('waves', this.config.AUDIO.WAVES.VOLUME);
        }
        
        // Обновление громкости ветра
        if (this.sounds.wind) {
            this.setVolume('wind', this.config.AUDIO.WIND.VOLUME);
        }
    }

    // Запуск дождя
    startRain() {
        if (!this.isEnabled || !this.sounds.rain || this.sounds.rain.isActive) return;
        
        this.sounds.rain.isActive = true;
        const now = this.audioContext.currentTime;
        
        // Плавное увеличение громкости дождя
        this.sounds.rain.gain.gain.setValueAtTime(0, now);
        this.sounds.rain.gain.gain.linearRampToValueAtTime(0.3 * this.masterVolume, now + 2);
    }

    // Остановка дождя
    stopRain() {
        if (!this.isEnabled || !this.sounds.rain || !this.sounds.rain.isActive) return;
        
        this.sounds.rain.isActive = false;
        const now = this.audioContext.currentTime;
        
        // Плавное уменьшение громкости дождя
        this.sounds.rain.gain.gain.linearRampToValueAtTime(0, now + 2);
    }

    // Воспроизведение грома
    playThunder() {
        if (!this.isEnabled || !this.sounds.thunder) return;
        
        const now = this.audioContext.currentTime;
        const duration = 2 + Math.random() * 3;
        
        // Плавное увеличение громкости грома
        this.sounds.thunder.gain.gain.setValueAtTime(0, now);
        this.sounds.thunder.gain.gain.linearRampToValueAtTime(0.5 * this.masterVolume, now + 0.1);
        
        // Плавное уменьшение громкости грома
        this.sounds.thunder.gain.gain.linearRampToValueAtTime(0, now + duration);
    }

    // Создание звука шагов
    createFootstepSound() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        // Настройка фильтра для шагов
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(300, this.audioContext.currentTime);
        filter.Q.setValueAtTime(2, this.audioContext.currentTime);
        
        // Настройка осциллятора
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime);
        
        // Настройка громкости
        gainNode.gain.setValueAtTime(0.1 * this.masterVolume, this.audioContext.currentTime);
        
        // Подключение узлов
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        return {
            oscillator: oscillator,
            gain: gainNode,
            filter: filter
        };
    }

    // Воспроизведение шага
    playFootstep() {
        if (!this.isEnabled) return;
        
        const footstep = this.createFootstepSound();
        const now = this.audioContext.currentTime;
        const duration = 0.2;
        
        // Плавное увеличение и уменьшение громкости
        footstep.gain.gain.setValueAtTime(0, now);
        footstep.gain.gain.linearRampToValueAtTime(0.1 * this.masterVolume, now + 0.05);
        footstep.gain.gain.linearRampToValueAtTime(0, now + duration);
        
        // Запуск и остановка
        footstep.oscillator.start(now);
        footstep.oscillator.stop(now + duration);
    }

    // Получение статистики аудио
    getAudioStats() {
        if (!this.isEnabled) return null;
        
        return {
            contextState: this.audioContext.state,
            sampleRate: this.audioContext.sampleRate,
            currentTime: this.audioContext.currentTime,
            masterVolume: this.masterVolume,
            activeSounds: Object.keys(this.sounds).filter(key => {
                const sound = this.sounds[key];
                return sound && (sound.isPlaying || sound.isActive);
            })
        };
    }

    // Остановка всех звуков
    stopAllSounds() {
        if (!this.isEnabled) return;
        
        Object.values(this.sounds).forEach(sound => {
            if (sound && sound.gain) {
                sound.gain.gain.setValueAtTime(0, this.audioContext.currentTime);
            }
        });
    }

    // Очистка аудио системы
    dispose() {
        if (!this.isEnabled) return;
        
        // Остановка всех звуков
        this.stopAllSounds();
        
        // Закрытие аудио контекста
        if (this.audioContext) {
            this.audioContext.close();
        }
        
        this.isEnabled = false;
        this.sounds = {};
    }

    // Получение данных аудио для других модулей
    getAudioData() {
        return {
            isEnabled: this.isEnabled,
            masterVolume: this.masterVolume,
            sounds: this.sounds,
            stats: this.getAudioStats()
        };
    }
}

// Глобальный класс аудио
window.IslandAudio = IslandAudio;
