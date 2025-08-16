// Утилиты для острова навигации
class IslandUtils {
    constructor() {
        this.noise = this.createPerlinNoise();
        this.random = this.createSeededRandom();
    }

    // Создание шума Перлина
    createPerlinNoise() {
        const permutation = new Array(512);
        const p = [151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];
        
        for (let i = 0; i < 256; i++) {
            permutation[i] = p[i];
            permutation[i + 256] = p[i];
        }

        const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
        const lerp = (t, a, b) => a + t * (b - a);
        const grad = (hash, x, y, z) => {
            const h = hash & 15;
            const u = h < 8 ? x : y;
            const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
            return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
        };

        return (x, y = 0, z = 0) => {
            const X = Math.floor(x) & 255;
            const Y = Math.floor(y) & 255;
            const Z = Math.floor(z) & 255;
            
            x -= Math.floor(x);
            y -= Math.floor(y);
            z -= Math.floor(z);
            
            const u = fade(x);
            const v = fade(y);
            const w = fade(z);
            
            const A = permutation[X] + Y;
            const AA = permutation[A] + Z;
            const AB = permutation[A + 1] + Z;
            const B = permutation[X + 1] + Y;
            const BA = permutation[B] + Z;
            const BB = permutation[B + 1] + Z;
            
            return lerp(w, lerp(v, lerp(u, grad(permutation[AA], x, y, z), grad(permutation[BA], x - 1, y, z)), lerp(u, grad(permutation[AB], x, y - 1, z), grad(permutation[BB], x - 1, y - 1, z))), lerp(v, lerp(u, grad(permutation[AA + 1], x, y, z - 1), grad(permutation[BA + 1], x - 1, y, z - 1)), lerp(u, grad(permutation[AB + 1], x, y - 1, z - 1), grad(permutation[BB + 1], x - 1, y - 1, z - 1))));
        };
    }

    // Создание генератора случайных чисел с семенем
    createSeededRandom(seed = Date.now()) {
        let state = seed;
        return (min = 0, max = 1) => {
            state = (state * 9301 + 49297) % 233280;
            const random = state / 233280;
            return min + random * (max - min);
        };
    }

    // Генерация высоты террейна
    generateTerrainHeight(x, z, config = ISLAND_CONFIG) {
        const scale = config.SCALE.ISLAND_SIZE;
        const mountainHeight = config.SCALE.MOUNTAIN_HEIGHT;
        
        // Нормализация координат
        const nx = x / scale;
        const nz = z / scale;
        
        // Базовый шум для общей формы острова
        const baseNoise = this.noise(nx * 2, nz * 2) * 0.5;
        
        // Детализация ландшафта
        const detailNoise = this.noise(nx * 8, nz * 8) * 0.25;
        const fineNoise = this.noise(nx * 16, nz * 16) * 0.125;
        
        // Комбинированный шум
        let height = baseNoise + detailNoise + fineNoise;
        
        // Создание центрального горного хребта
        const distanceFromCenter = Math.sqrt(nx * nx + nz * nz);
        const mountainMask = Math.max(0, 1 - distanceFromCenter * 2);
        const mountainNoise = this.noise(nx * 4, nz * 4) * mountainMask;
        
        height += mountainNoise * mountainHeight;
        
        // Плавное затухание к краям острова
        const islandMask = Math.max(0, 1 - distanceFromCenter * 1.5);
        height *= islandMask;
        
        return Math.max(0, height);
    }

    // Определение биома по координатам
    getBiome(x, z, height, config = ISLAND_CONFIG) {
        const distanceFromCenter = Math.sqrt(x * x + z * z);
        const normalizedDistance = distanceFromCenter / (config.SCALE.ISLAND_SIZE * 0.5);
        
        // Пляж по периметру
        if (normalizedDistance > 0.85) {
            return 'beach';
        }
        
        // Горы в центре
        if (height > config.SCALE.MOUNTAIN_HEIGHT * 0.6) {
            return 'mountain';
        }
        
        // Тропический лес
        if (height > config.SCALE.MOUNTAIN_HEIGHT * 0.3 && normalizedDistance < 0.6) {
            return 'forest';
        }
        
        // Равнины
        return 'plains';
    }

    // Создание материала для террейна
    createTerrainMaterial(config = ISLAND_CONFIG) {
        const vertexShader = `
            uniform float time;
            uniform float windStrength;
            varying vec2 vUv;
            varying vec3 vPosition;
            varying vec3 vNormal;
            varying float vHeight;
            varying float vSlope;
            
            void main() {
                vUv = uv;
                vPosition = position;
                vNormal = normal;
                vHeight = position.y;
                vSlope = 1.0 - dot(normal, vec3(0.0, 1.0, 0.0));
                
                // Анимация ветра для травы
                if (position.y > 0.1) {
                    vec3 windOffset = vec3(
                        sin(time * 0.5 + position.x * 0.1) * windStrength * 0.1,
                        0.0,
                        cos(time * 0.3 + position.z * 0.1) * windStrength * 0.1
                    );
                    position += windOffset;
                }
                
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;

        const fragmentShader = `
            uniform sampler2D sandTexture;
            uniform sampler2D plainsTexture;
            uniform sampler2D forestTexture;
            uniform sampler2D mountainTexture;
            uniform float time;
            
            varying vec2 vUv;
            varying vec3 vPosition;
            varying vec3 vNormal;
            varying float vHeight;
            varying float vSlope;
            
            vec3 getBiomeColor(vec2 uv, float height, float slope) {
                // Пляж
                if (height < 0.1) {
                    return texture2D(sandTexture, uv * 2.0).rgb;
                }
                
                // Горы
                if (height > 0.6) {
                    return texture2D(mountainTexture, uv * 1.5).rgb;
                }
                
                // Лес
                if (height > 0.3 && slope < 0.3) {
                    return texture2D(forestTexture, uv * 3.0).rgb;
                }
                
                // Равнины
                return texture2D(plainsTexture, uv * 2.5).rgb;
            }
            
            void main() {
                vec3 color = getBiomeColor(vUv, vHeight, vSlope);
                
                // Добавление вариативности
                float noise = sin(vUv.x * 100.0) * sin(vUv.y * 100.0) * 0.1;
                color += noise;
                
                // Освещение
                vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
                float diffuse = max(0.0, dot(vNormal, lightDir));
                color *= 0.3 + 0.7 * diffuse;
                
                gl_FragColor = vec4(color, 1.0);
            }
        `;

        return new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                windStrength: { value: config.VEGETATION.PALM_TREES.WIND_STRENGTH },
                sandTexture: { value: this.createSandTexture() },
                plainsTexture: { value: this.createPlainsTexture() },
                forestTexture: { value: this.createForestTexture() },
                mountainTexture: { value: this.createMountainTexture() }
            },
            vertexShader,
            fragmentShader
        });
    }

    // Создание текстур
    createSandTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        // Градиент песка
        const gradient = ctx.createLinearGradient(0, 0, 512, 512);
        gradient.addColorStop(0, ISLAND_CONFIG.COLORS.SAND.PRIMARY);
        gradient.addColorStop(0.5, ISLAND_CONFIG.COLORS.SAND.SECONDARY);
        gradient.addColorStop(1, ISLAND_CONFIG.COLORS.SAND.GRADIENT[2]);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 512);
        
        // Добавление шума
        for (let i = 0; i < 1000; i++) {
            const x = this.random(0, 512);
            const y = this.random(0, 512);
            const size = this.random(1, 3);
            const alpha = this.random(0.1, 0.3);
            
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }

    createPlainsTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        const gradient = ctx.createLinearGradient(0, 0, 512, 512);
        gradient.addColorStop(0, ISLAND_CONFIG.COLORS.PLAINS.PRIMARY);
        gradient.addColorStop(1, ISLAND_CONFIG.COLORS.PLAINS.SECONDARY);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 512);
        
        // Добавление травы
        for (let i = 0; i < 500; i++) {
            const x = this.random(0, 512);
            const y = this.random(0, 512);
            const length = this.random(5, 15);
            const angle = this.random(0, Math.PI * 2);
            
            ctx.strokeStyle = `rgba(139, 69, 19, ${this.random(0.3, 0.7)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
            ctx.stroke();
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }

    createForestTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
        gradient.addColorStop(0, ISLAND_CONFIG.COLORS.TROPICAL.ACCENT);
        gradient.addColorStop(0.5, ISLAND_CONFIG.COLORS.TROPICAL.PRIMARY);
        gradient.addColorStop(1, ISLAND_CONFIG.COLORS.TROPICAL.SECONDARY);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 512);
        
        // Добавление листьев
        for (let i = 0; i < 300; i++) {
            const x = this.random(0, 512);
            const y = this.random(0, 512);
            const size = this.random(3, 8);
            
            ctx.fillStyle = `rgba(34, 139, 34, ${this.random(0.4, 0.8)})`;
            ctx.beginPath();
            ctx.ellipse(x, y, size, size * 0.7, this.random(0, Math.PI), 0, Math.PI * 2);
            ctx.fill();
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }

    createMountainTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        const gradient = ctx.createLinearGradient(0, 0, 0, 512);
        gradient.addColorStop(0, ISLAND_CONFIG.COLORS.MOUNTAINS.PRIMARY);
        gradient.addColorStop(1, ISLAND_CONFIG.COLORS.MOUNTAINS.SECONDARY);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 512);
        
        // Добавление скальных образований
        for (let i = 0; i < 200; i++) {
            const x = this.random(0, 512);
            const y = this.random(0, 512);
            const size = this.random(2, 6);
            
            ctx.fillStyle = `rgba(105, 105, 105, ${this.random(0.5, 0.9)})`;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }

    // Создание геометрии пальмы
    createPalmTreeGeometry() {
        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        const indices = [];
        const uvs = [];
        
        // Ствол
        const trunkHeight = 8;
        const trunkRadius = 0.5;
        const trunkSegments = 8;
        
        for (let i = 0; i <= trunkSegments; i++) {
            const angle = (i / trunkSegments) * Math.PI * 2;
            const x = Math.cos(angle) * trunkRadius;
            const z = Math.sin(angle) * trunkRadius;
            
            vertices.push(x, 0, z);
            vertices.push(x, trunkHeight, z);
            
            uvs.push(i / trunkSegments, 0);
            uvs.push(i / trunkSegments, 1);
        }
        
        // Индексы для ствола
        for (let i = 0; i < trunkSegments; i++) {
            const base = i * 2;
            indices.push(base, base + 1, base + 2);
            indices.push(base + 1, base + 3, base + 2);
        }
        
        // Листья
        const leafCount = 8;
        const leafLength = 4;
        const leafWidth = 1;
        
        for (let i = 0; i < leafCount; i++) {
            const angle = (i / leafCount) * Math.PI * 2;
            const leafAngle = angle + this.random(-0.2, 0.2);
            
            // Центр листа
            const centerX = Math.cos(leafAngle) * 0.5;
            const centerZ = Math.sin(leafAngle) * 0.5;
            const centerY = trunkHeight + this.random(-0.5, 0.5);
            
            // Вершины листа
            const tipX = centerX + Math.cos(leafAngle) * leafLength;
            const tipZ = centerZ + Math.sin(leafAngle) * leafLength;
            const tipY = centerY + this.random(0, 1);
            
            const leftX = centerX + Math.cos(leafAngle + Math.PI/2) * leafWidth;
            const leftZ = centerZ + Math.sin(leafAngle + Math.PI/2) * leafWidth;
            
            const rightX = centerX + Math.cos(leafAngle - Math.PI/2) * leafWidth;
            const rightZ = centerZ + Math.sin(leafAngle - Math.PI/2) * leafWidth;
            
            const baseIndex = vertices.length / 3;
            
            vertices.push(centerX, centerY, centerZ);
            vertices.push(tipX, tipY, tipZ);
            vertices.push(leftX, centerY, leftZ);
            vertices.push(rightX, centerY, rightZ);
            
            uvs.push(0, 0);
            uvs.push(1, 0.5);
            uvs.push(0, 1);
            uvs.push(1, 1);
            
            indices.push(baseIndex, baseIndex + 1, baseIndex + 2);
            indices.push(baseIndex + 1, baseIndex + 3, baseIndex + 2);
        }
        
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        geometry.setIndex(indices);
        geometry.computeVertexNormals();
        
        return geometry;
    }

    // Обновление времени для шейдеров
    updateTime(material, time) {
        if (material && material.uniforms && material.uniforms.time) {
            material.uniforms.time.value = time;
        }
    }

    // Создание LOD системы
    createLODSystem(objects, distances) {
        const lod = new THREE.LOD();
        
        objects.forEach((object, index) => {
            const distance = distances[index] || (index + 1) * 100;
            lod.addLevel(object, distance);
        });
        
        return lod;
    }

    // Фрустум каллинг
    createFrustumCulling(camera) {
        const frustum = new THREE.Frustum();
        const matrix = new THREE.Matrix4();
        
        return (object) => {
            matrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
            frustum.setFromProjectionMatrix(matrix);
            
            const boundingBox = new THREE.Box3().setFromObject(object);
            return frustum.intersectsBox(boundingBox);
        };
    }

    // Создание инстансинга для повторяющихся объектов
    createInstancedMesh(geometry, material, count) {
        const mesh = new THREE.InstancedMesh(geometry, material, count);
        const matrix = new THREE.Matrix4();
        
        return {
            mesh,
            setTransform: (index, position, rotation, scale) => {
                matrix.compose(position, rotation, scale);
                mesh.setMatrixAt(index, matrix);
            },
            update: () => {
                mesh.instanceMatrix.needsUpdate = true;
            }
        };
    }
}

// Глобальный экземпляр утилит
window.IslandUtils = IslandUtils;
