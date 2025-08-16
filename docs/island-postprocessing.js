// Модуль постобработки острова
class IslandPostProcessing {
    constructor(scene, camera, utils) {
        this.scene = scene;
        this.camera = camera;
        this.utils = utils;
        this.config = ISLAND_CONFIG;
        this.renderer = null;
        this.composer = null;
        this.effects = {};
        this.currentQuality = 'auto';
    }

    // Создание рендерера и постобработки
    create() {
        // Создание WebGL рендерера
        this.createRenderer();
        
        // Создание композера эффектов
        this.createComposer();
        
        // Создание эффектов
        this.createEffects();
        
        // Настройка обработчиков событий
        this.setupEventHandlers();
        
        return this.renderer;
    }

    // Создание рендерера
    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('canvas'),
            antialias: true,
            alpha: false,
            powerPreference: "high-performance"
        });
        
        // Настройка рендерера
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = this.config.POST_PROCESSING.TONE_MAPPING.EXPOSURE;
        
        // Настройка цвета фона
        this.renderer.setClearColor(this.config.COLORS.OCEAN.DEEP);
    }

    // Создание композера эффектов
    createComposer() {
        this.composer = new THREE.EffectComposer(this.renderer);
        
        // Основной проход рендеринга
        const renderPass = new THREE.RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);
        
        // Сохранение ссылки на основной проход
        this.effects.renderPass = renderPass;
    }

    // Создание эффектов
    createEffects() {
        // Bloom эффект
        this.createBloomEffect();
        
        // FXAA антиалиасинг
        this.createFXAAEffect();
        
        // Lens flare эффект
        this.createLensFlareEffect();
        
        // Vignette эффект
        this.createVignetteEffect();
    }

    // Создание bloom эффекта
    createBloomEffect() {
        const bloomConfig = this.config.POST_PROCESSING.BLOOM;
        
        const bloomPass = new THREE.UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            bloomConfig.INTENSITY,
            bloomConfig.RADIUS,
            bloomConfig.THRESHOLD
        );
        
        this.composer.addPass(bloomPass);
        this.effects.bloom = bloomPass;
    }

    // Создание FXAA эффекта
    createFXAAEffect() {
        if (this.config.POST_PROCESSING.FXAA.ENABLED) {
            const fxaaPass = new THREE.ShaderPass(THREE.FXAAShader);
            fxaaPass.material.uniforms['resolution'].value.x = 1 / (window.innerWidth * this.renderer.getPixelRatio());
            fxaaPass.material.uniforms['resolution'].value.y = 1 / (window.innerHeight * this.renderer.getPixelRatio());
            
            this.composer.addPass(fxaaPass);
            this.effects.fxaa = fxaaPass;
        }
    }

    // Создание lens flare эффекта
    createLensFlareEffect() {
        // Создание lens flare системы
        const textureLoader = new THREE.TextureLoader();
        
        // Загрузка текстур для lens flare
        const flareTexture = this.createLensFlareTexture();
        
        const lensFlare = new THREE.Lensflare();
        lensFlare.addElement(new THREE.LensflareElement(flareTexture, 512, 0));
        
        // Добавление lens flare к солнцу
        this.scene.traverse((object) => {
            if (object.userData && object.userData.isSun) {
                object.add(lensFlare);
            }
        });
        
        this.effects.lensFlare = lensFlare;
    }

    // Создание текстуры для lens flare
    createLensFlareTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        // Создание градиентного круга
        const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 256, 256);
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
        
        return texture;
    }

    // Создание vignette эффекта
    createVignetteEffect() {
        const vignetteShader = {
            uniforms: {
                'tDiffuse': { value: null },
                'offset': { value: 1.0 },
                'darkness': { value: 0.5 }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D tDiffuse;
                uniform float offset;
                uniform float darkness;
                varying vec2 vUv;
                void main() {
                    vec4 texel = texture2D(tDiffuse, vUv);
                    vec2 uv = (vUv - vec2(0.5)) * vec2(offset);
                    gl_FragColor = vec4(mix(texel.rgb, vec3(1.0 - darkness), dot(uv, uv)), texel.a);
                }
            `
        };
        
        const vignettePass = new THREE.ShaderPass(vignetteShader);
        vignettePass.material.uniforms['offset'].value = 1.0;
        vignettePass.material.uniforms['darkness'].value = 0.3;
        
        this.composer.addPass(vignettePass);
        this.effects.vignette = vignettePass;
    }

    // Настройка обработчиков событий
    setupEventHandlers() {
        // Обработка изменения размера окна
        window.addEventListener('resize', () => {
            this.onWindowResize();
        });
        
        // Обработка изменения качества
        window.addEventListener('qualityChanged', (event) => {
            this.onQualityChanged(event.detail.quality);
        });
    }

    // Обработка изменения размера окна
    onWindowResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        // Обновление рендерера
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        // Обновление камеры
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        
        // Обновление композера
        this.composer.setSize(width, height);
        
        // Обновление эффектов
        this.updateEffects();
    }

    // Обновление эффектов
    updateEffects() {
        // Обновление FXAA
        if (this.effects.fxaa) {
            this.effects.fxaa.material.uniforms['resolution'].value.x = 1 / (window.innerWidth * this.renderer.getPixelRatio());
            this.effects.fxaa.material.uniforms['resolution'].value.y = 1 / (window.innerHeight * this.renderer.getPixelRatio());
        }
        
        // Обновление vignette
        if (this.effects.vignette) {
            this.effects.vignette.material.uniforms['offset'].value = 1.0;
        }
    }

    // Обработка изменения качества
    onQualityChanged(quality) {
        this.currentQuality = quality;
        
        // Применение настроек качества
        this.applyQualitySettings(quality);
    }

    // Применение настроек качества
    applyQualitySettings(quality) {
        const settings = this.getQualitySettings(quality);
        
        // Обновление настроек рендерера
        if (settings.renderer) {
            this.renderer.setPixelRatio(settings.renderer.pixelRatio);
            this.renderer.shadowMap.enabled = settings.renderer.shadows;
        }
        
        // Обновление настроек эффектов
        if (settings.effects) {
            this.updateEffectSettings(settings.effects);
        }
    }

    // Получение настроек качества
    getQualitySettings(quality) {
        const settings = {
            auto: {
                renderer: { pixelRatio: Math.min(window.devicePixelRatio, 2), shadows: true },
                effects: { bloom: true, fxaa: true, vignette: true }
            },
            low: {
                renderer: { pixelRatio: 1, shadows: false },
                effects: { bloom: false, fxaa: false, vignette: false }
            },
            high: {
                renderer: { pixelRatio: Math.min(window.devicePixelRatio, 3), shadows: true },
                effects: { bloom: true, fxaa: true, vignette: true }
            }
        };
        
        return settings[quality] || settings.auto;
    }

    // Обновление настроек эффектов
    updateEffectSettings(effectSettings) {
        // Bloom
        if (this.effects.bloom) {
            this.effects.bloom.enabled = effectSettings.bloom;
        }
        
        // FXAA
        if (this.effects.fxaa) {
            this.effects.fxaa.enabled = effectSettings.fxaa;
        }
        
        // Vignette
        if (this.effects.vignette) {
            this.effects.vignette.enabled = effectSettings.vignette;
        }
    }

    // Создание пользовательского шейдера для цветокоррекции
    createColorCorrectionShader() {
        return {
            uniforms: {
                'tDiffuse': { value: null },
                'brightness': { value: 0.0 },
                'contrast': { value: 1.0 },
                'saturation': { value: 1.0 },
                'hue': { value: 0.0 }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D tDiffuse;
                uniform float brightness;
                uniform float contrast;
                uniform float saturation;
                uniform float hue;
                varying vec2 vUv;
                
                vec3 adjustBrightness(vec3 color, float brightness) {
                    return color + brightness;
                }
                
                vec3 adjustContrast(vec3 color, float contrast) {
                    return 0.5 + (contrast * (color - 0.5));
                }
                
                vec3 adjustSaturation(vec3 color, float saturation) {
                    float luminance = dot(color, vec3(0.2126, 0.7152, 0.0722));
                    return mix(vec3(luminance), color, saturation);
                }
                
                vec3 adjustHue(vec3 color, float hue) {
                    float angle = hue * 3.14159265 / 180.0;
                    float s = sin(angle);
                    float c = cos(angle);
                    mat3 hueRotation = mat3(
                        vec3(c, -s, 0.0),
                        vec3(s, c, 0.0),
                        vec3(0.0, 0.0, 1.0)
                    );
                    return hueRotation * color;
                }
                
                void main() {
                    vec4 texel = texture2D(tDiffuse, vUv);
                    vec3 color = texel.rgb;
                    
                    color = adjustBrightness(color, brightness);
                    color = adjustContrast(color, contrast);
                    color = adjustSaturation(color, saturation);
                    color = adjustHue(color, hue);
                    
                    gl_FragColor = vec4(color, texel.a);
                }
            `
        };
    }

    // Добавление цветокоррекции
    addColorCorrection() {
        const colorCorrectionShader = this.createColorCorrectionShader();
        const colorCorrectionPass = new THREE.ShaderPass(colorCorrectionShader);
        
        // Настройка параметров цветокоррекции
        colorCorrectionPass.material.uniforms['brightness'].value = 0.05;
        colorCorrectionPass.material.uniforms['contrast'].value = 1.1;
        colorCorrectionPass.material.uniforms['saturation'].value = 1.2;
        colorCorrectionPass.material.uniforms['hue'].value = 0.0;
        
        this.composer.addPass(colorCorrectionPass);
        this.effects.colorCorrection = colorCorrectionPass;
    }

    // Создание эффекта глубины резкости
    createDepthOfFieldEffect() {
        const dofShader = {
            uniforms: {
                'tDiffuse': { value: null },
                'tDepth': { value: null },
                'cameraNear': { value: 0.1 },
                'cameraFar': { value: 2000 },
                'focalDepth': { value: 100 },
                'focalLength': { value: 50 },
                'fstop': { value: 2.8 },
                'maxblur': { value: 1.0 }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D tDiffuse;
                uniform sampler2D tDepth;
                uniform float cameraNear;
                uniform float cameraFar;
                uniform float focalDepth;
                uniform float focalLength;
                uniform float fstop;
                uniform float maxblur;
                varying vec2 vUv;
                
                float readDepth(sampler2D depthSampler, vec2 coord) {
                    float fragCoordZ = texture2D(depthSampler, coord).x;
                    float viewZ = perspectiveDepthToViewZ(fragCoordZ, cameraNear, cameraFar);
                    return viewZToOrthographicDepth(viewZ, cameraNear, cameraFar);
                }
                
                void main() {
                    float depth = readDepth(tDepth, vUv);
                    float factor = abs(depth - focalDepth);
                    float blur = factor * maxblur;
                    
                    vec4 color = texture2D(tDiffuse, vUv);
                    gl_FragColor = color;
                }
            `
        };
        
        const dofPass = new THREE.ShaderPass(dofShader);
        this.composer.addPass(dofPass);
        this.effects.depthOfField = dofPass;
    }

    // Рендеринг сцены
    render() {
        // Использование композера для рендеринга с эффектами
        this.composer.render();
    }

    // Рендеринг без эффектов (для производительности)
    renderBasic() {
        this.renderer.render(this.scene, this.camera);
    }

    // Получение статистики рендерера
    getRendererStats() {
        const info = this.renderer.info;
        return {
            triangles: info.render.triangles,
            points: info.render.points,
            lines: info.render.lines,
            calls: info.render.calls,
            memory: {
                geometries: info.memory.geometries,
                textures: info.memory.textures
            }
        };
    }

    // Очистка памяти
    dispose() {
        // Очистка рендерера
        this.renderer.dispose();
        
        // Очистка композера
        this.composer.dispose();
        
        // Очистка эффектов
        Object.values(this.effects).forEach(effect => {
            if (effect && effect.dispose) {
                effect.dispose();
            }
        });
    }

    // Получение данных постобработки для других модулей
    getPostProcessingData() {
        return {
            renderer: this.renderer,
            composer: this.composer,
            effects: this.effects,
            quality: this.currentQuality
        };
    }
}

// Глобальный класс постобработки
window.IslandPostProcessing = IslandPostProcessing;
