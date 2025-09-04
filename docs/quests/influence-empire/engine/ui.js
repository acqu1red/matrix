/**
 * UI Engine
 * Handles rendering of components, animations, and interactions.
 */
const UI = {
    init(container, gameData, tgApp) {
        this.container = document.querySelector(container);
        this.gameData = gameData;
        this.loc = gameData.localization.ru;
        this.tg = tgApp;
        this.dragContext = {};
        this.setupTheme();
    },

    setupTheme() {
        if (this.tg && this.tg.themeParams) {
            const root = document.documentElement;
            root.style.setProperty('--bg', this.tg.themeParams.bg_color || '#0B0F1A');
            root.style.setProperty('--text', this.tg.themeParams.text_color || '#E8ECF1');
            // ... more theme mappings
        }
    },

    render(template) {
        this.container.innerHTML = template;
    },

    createToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        this.container.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    },

    createModal(title, content, buttons) {
      // ... modal creation logic
    },

    renderHUD(metrics) {
        let hud = document.getElementById('hud');
        if (!hud) {
            hud = document.createElement('div');
            hud.id = 'hud';
            hud.className = 'hud';
            this.container.prepend(hud);
        }
        hud.innerHTML = `
            <div class="hud-item">
                <span class="hud-label">${this.loc.hud.influence}</span>
                <span class="hud-value">${metrics.influence}</span>
            </div>
            <div class="hud-item">
                <span class="hud-label">${this.loc.hud.trust}</span>
                <span class="hud-value">${metrics.trust}%</span>
            </div>
            <div class="hud-item">
                <span class="hud-label">${this.loc.hud.reach}</span>
                <span class="hud-value">${metrics.reach}</span>
            </div>
             <div class="hud-item">
                <span class="hud-label">${this.loc.hud.revenue}</span>
                <span class="hud-value">$${metrics.revenue}</span>
            </div>
        `;
    },

    // Drag and Drop using Pointer Events
    makeDraggable(selector, options) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            el.addEventListener('pointerdown', e => this.onDragStart(e, options));
        });
    },

    onDragStart(e, options) {
        e.preventDefault();
        const el = e.target.closest(options.itemSelector);
        if (!el) return;

        this.dragContext = {
            el,
            options,
            startX: e.clientX,
            startY: e.clientY,
            originalPos: el.getBoundingClientRect(),
            clone: el.cloneNode(true)
        };
        
        // Style the clone
        const clone = this.dragContext.clone;
        clone.classList.add('dragging');
        clone.style.position = 'absolute';
        clone.style.left = `${this.dragContext.originalPos.left}px`;
        clone.style.top = `${this.dragContext.originalPos.top}px`;
        clone.style.width = `${this.dragContext.originalPos.width}px`;
        document.body.appendChild(clone);
        
        el.classList.add('drag-source');

        document.onpointermove = e => this.onDragMove(e);
        document.onpointerup = e => this.onDragEnd(e);
    },

    onDragMove(e) {
        e.preventDefault();
        const { clone, startX, startY, originalPos } = this.dragContext;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        clone.style.transform = `translate(${dx}px, ${dy}px) scale(1.05)`;

        // Highlight drop zone
        const dropZone = this.findDropZone(e.clientX, e.clientY);
        document.querySelectorAll('.drop-zone').forEach(z => z.classList.remove('active'));
        if (dropZone) {
            dropZone.classList.add('active');
        }
    },

    onDragEnd(e) {
        const { el, clone, options } = this.dragContext;
        const dropZone = this.findDropZone(e.clientX, e.clientY);

        if (dropZone) {
            // Successful drop
            if(options.onDrop) options.onDrop(el, dropZone);
            this.hapticFeedback('light');
        }
        
        clone.remove();
        el.classList.remove('drag-source');
        document.querySelectorAll('.drop-zone').forEach(z => z.classList.remove('active'));
        
        document.onpointermove = null;
        document.onpointerup = null;
    },

    findDropZone(x, y) {
        const dropZones = document.querySelectorAll('.drop-zone');
        for (const zone of dropZones) {
            const rect = zone.getBoundingClientRect();
            if (x > rect.left && x < rect.right && y > rect.top && y < rect.bottom) {
                return zone;
            }
        }
        return null;
    },

    hapticFeedback(type) {
        if (this.tg && this.tg.HapticFeedback) {
            switch(type) {
                case 'light': this.tg.HapticFeedback.impactOccurred('light'); break;
                case 'success': this.tg.HapticFeedback.notificationOccurred('success'); break;
                case 'error': this.tg.HapticFeedback.notificationOccurred('error'); break;
            }
        }
    }
};

window.UI = UI;
