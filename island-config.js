// Конфигурация острова навигации
const ISLAND_CONFIG = {
    // Палитра цветов
    COLORS: {
        SAND: {
            PRIMARY: '#f5e3be',
            SECONDARY: '#e5d0a6',
            GRADIENT: ['#f5e3be', '#e5d0a6', '#d4c095']
        },
        TROPICAL: {
            PRIMARY: '#3ba35f',
            SECONDARY: '#2a8a57',
            ACCENT: '#b6f5b1'
        },
        PLAINS: {
            PRIMARY: '#b79b69',
            SECONDARY: '#9a7b52'
        },
        MOUNTAINS: {
            PRIMARY: '#5e6673',
            SECONDARY: '#464b54'
        },
        OCEAN: {
            DEEP: '#0d3b66',
            SHALLOW: '#38bdf8',
            SURFACE: '#7cd4ff'
        },
        UI: {
            GLASS: 'rgba(255, 255, 255, 0.1)',
            ACCENT: '#36c2b6'
        }
    },

    // Размеры и масштабы
    SCALE: {
        ISLAND_SIZE: 1000,
        TERRAIN_RESOLUTION: 256,
        MOUNTAIN_HEIGHT: 80,
        BEACH_WIDTH: 50,
        FOREST_DENSITY: 0.3,
        PLAINS_DENSITY: 0.35
    },

    // Архитектура
    ARCHITECTURE: {
        CASTLE: {
            SIZE: { x: 36, y: 26, z: 22 },
            POSITION: { x: 0, y: 0, z: 0 },
            TOWERS: 8,
            FLOORS: 6
        },
        VILLAS: {
            COUNT: 12,
            LARGE_VILLAS: 5,
            BUNGALOWS: 7,
            SPACING: 80
        },
        PIER: {
            LENGTH: 40,
            WIDTH: 6,
            BOATS: 3
        },
        HELIPAD: {
            RADIUS: 15,
            BEACONS: 4
        }
    },

    // Растительность
    VEGETATION: {
        PALM_TREES: {
            COUNT: 300,
            BEACH_RATIO: 0.7,
            INLAND_RATIO: 0.3,
            WIND_STRENGTH: 0.5
        },
        BANANA_TREES: {
            COUNT: 20,
            DISTRIBUTION: 'tropical'
        },
        FERNS: {
            COUNT: 100,
            DISTRIBUTION: 'forest'
        },
        GRASS: {
            DENSITY: 0.8,
            WIND_ANIMATION: true
        }
    },

    // Океан
    OCEAN: {
        SIZE: 2000,
        WAVE_HEIGHT: 1.5,
        WAVE_SPEED: 0.5,
        FOAM_WIDTH: 10,
        SHALLOW_DEPTH: 5
    },

    // Камера
    CAMERA: {
        START_POSITION: { x: 0, y: 500, z: 500 },
        START_TARGET: { x: 0, y: 0, z: 0 },
        MIN_DISTANCE: 100,
        MAX_DISTANCE: 2000,
        MAX_POLAR_ANGLE: 85,
        FIXED_PHI: 65
    },

    // Освещение
    LIGHTING: {
        SUN: {
            INTENSITY: 1.0,
            COLOR: '#ffffff'
        },
        AMBIENT: {
            INTENSITY: 0.3,
            COLOR: '#87ceeb'
        },
        FOG: {
            COLOR: '#87ceeb',
            DENSITY: 0.002
        }
    },

    // Постобработка
    POST_PROCESSING: {
        BLOOM: {
            INTENSITY: 1.5,
            THRESHOLD: 0.8,
            RADIUS: 0.8
        },
        FXAA: {
            ENABLED: true
        },
        TONE_MAPPING: {
            TYPE: 'ACES',
            EXPOSURE: 1.05
        }
    },

    // Производительность
    PERFORMANCE: {
        MOBILE: {
            MAX_TRIANGLES: 120000,
            MAX_DRAW_CALLS: 250,
            LOD_LEVELS: 2
        },
        DESKTOP: {
            MAX_TRIANGLES: 500000,
            MAX_DRAW_CALLS: 400,
            LOD_LEVELS: 3
        },
        TARGET_FPS: 60
    },

    // Анимация
    ANIMATION: {
        BIRDS: {
            GROUPS: 5,
            SPEED: 0.5,
            RADIUS: 200
        },
        BOATS: {
            DRIFT_SPEED: 0.3,
            ROCK_AMPLITUDE: 0.2
        },
        SMOKE: {
            PARTICLES: 50,
            SPEED: 0.5
        }
    },

    // Аудио
    AUDIO: {
        WAVES: {
            VOLUME: 0.3,
            LOOP: true
        },
        WIND: {
            VOLUME: 0.2,
            LOOP: true
        },
        BIRDS: {
            VOLUME: 0.1,
            RANDOM_INTERVAL: 5000
        }
    },

    // Время суток
    TIME_OF_DAY: {
        DAWN: { start: 6, end: 8, color: '#ffd700' },
        DAY: { start: 9, end: 16, color: '#ffffff' },
        SUNSET: { start: 17, end: 19, color: '#ff6b35' },
        NIGHT: { start: 20, end: 5, color: '#4a90e2' }
    }
};

// Определение качества на основе устройства
function getQualityLevel() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isLowEnd = navigator.hardwareConcurrency <= 4 || navigator.deviceMemory <= 4;
    
    if (isMobile || isLowEnd) {
        return 'low';
    }
    return 'high';
}

// Глобальные настройки
window.ISLAND_CONFIG = ISLAND_CONFIG;
window.getQualityLevel = getQualityLevel;
