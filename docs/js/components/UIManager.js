import { EventEmitter } from '../utils/EventEmitter.js';

export class UIManager extends EventEmitter {
    constructor() {
        super();
        
        // UI элементы
        this.elements = {
            preloader: document.getElementById('preloader'),
            progressFill: document.getElementById('progressFill'),
            progressText: document.getElementById('progressText'),
            loadingTip: document.getElementById('loadingTip'),
            introOverlay: document.getElementById('introOverlay'),
            introClose: document.getElementById('introClose'),
            instructions: document.getElementById('instructions'),
            instructionIcon: document.querySelector('.instruction-icon'),
            instructionText: document.querySelector('.instruction-text'),
            backButton: document.getElementById('backButton'),
            infoPanel: document.getElementById('infoPanel'),
            infoToggle: document.getElementById('infoToggle'),
            infoContent: document.getElementById('infoContent'),
            mobileControls: document.getElementById('mobileControls'),
            performancePanel: document.getElementById('performancePanel'),
            fpsCounter: document.getElementById('fpsCounter'),
            modalOverlay: document.getElementById('modalOverlay'),
            modalContent: document.getElementById('modalContent'),
            notifications: document.getElementById('notifications')
        };
        
        // Состояние
        this.state = {
            isIntroShown: false,
            isInfoPanelCollapsed: false,
            currentInstructions: '',
            notifications: []
        };
        
        // Настройка обработчиков событий
        this.setupEventListeners();
        
        // Определение устройства
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // Адаптация для мобильных устройств
        if (this.isMobile) {
            this.adaptForMobile();
        }
    }
    
    setupEventListeners() {
        // Закрытие интро
        if (this.elements.introClose) {
            this.elements.introClose.addEventListener('click', () => {
                this.hideIntro();
                this.emit('introClosed');
            });
        }
        
        // Кнопка назад
        if (this.elements.backButton) {
            this.elements.backButton.addEventListener('click', () => {
                this.emit('backPressed');
            });
        }
        
        // Переключение информационной панели
        if (this.elements.infoToggle) {
            this.elements.infoToggle.addEventListener('click', () => {
                this.toggleInfoPanel();
            });
        }
        
        // Мобильные контролы
        this.setupMobileControls();
        
        // Обработка изменения размера окна
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }
    
    setupMobileControls() {
        if (!this.elements.mobileControls) return;
        
        const zoomIn = document.getElementById('mobileZoomIn');
        const zoomOut = document.getElementById('mobileZoomOut');
        const reset = document.getElementById('mobileReset');
        
        if (zoomIn) {
            zoomIn.addEventListener('click', () => {
                this.emit('mobileZoomIn');
            });
        }
        
        if (zoomOut) {
            zoomOut.addEventListener('click', () => {
                this.emit('mobileZoomOut');
            });
        }
        
        if (reset) {
            reset.addEventListener('click', () => {
                this.emit('mobileReset');
            });
        }
    }
    
    adaptForMobile() {
        // Увеличение размера кнопок для мобильных
        const mobileButtons = document.querySelectorAll('.mobile-btn');
        mobileButtons.forEach(btn => {
            btn.style.width = '56px';
            btn.style.height = '56px';
        });
        
        // Увеличение размера кнопки назад
        if (this.elements.backButton) {
            this.elements.backButton.style.padding = '16px 24px';
            this.elements.backButton.style.fontSize = '16px';
        }
        
        // Адаптация инструкций
        if (this.elements.instructions) {
            this.elements.instructions.style.fontSize = '14px';
            this.elements.instructions.style.padding = '12px 20px';
        }
    }
    
    // Методы управления прелоадером
    updateLoadingProgress(progress, text, tip) {
        if (this.elements.progressFill) {
            this.elements.progressFill.style.width = `${progress}%`;
        }
        
        if (this.elements.progressText) {
            this.elements.progressText.textContent = text;
        }
        
        if (this.elements.loadingTip) {
            this.elements.loadingTip.textContent = tip;
        }
    }
    
    hidePreloader() {
        if (this.elements.preloader) {
            this.elements.preloader.style.opacity = '0';
            setTimeout(() => {
                this.elements.preloader.style.display = 'none';
            }, 500);
        }
    }
    
    // Методы управления интро
    showIntro() {
        if (this.elements.introOverlay) {
            this.elements.introOverlay.style.display = 'flex';
            this.state.isIntroShown = true;
        }
    }
    
    hideIntro() {
        if (this.elements.introOverlay) {
            this.elements.introOverlay.style.opacity = '0';
            setTimeout(() => {
                this.elements.introOverlay.style.display = 'none';
                this.state.isIntroShown = false;
            }, 300);
        }
    }
    
    // Методы управления инструкциями
    updateInstructions(text, type = 'normal') {
        if (!this.elements.instructions) return;
        
        this.state.currentInstructions = text;
        
        // Обновление текста
        if (this.elements.instructionText) {
            this.elements.instructionText.textContent = text;
        }
        
        // Обновление типа
        this.elements.instructions.className = 'instructions';
        if (type === 'confirm') {
            this.elements.instructions.classList.add('confirm');
        }
        
        // Анимация обновления
        this.elements.instructions.style.transform = 'translateX(-50%) scale(1.05)';
        setTimeout(() => {
            this.elements.instructions.style.transform = 'translateX(-50%) scale(1)';
        }, 150);
    }
    
    // Методы управления кнопкой назад
    showBackButton() {
        if (this.elements.backButton) {
            this.elements.backButton.classList.remove('hidden');
            this.elements.backButton.style.opacity = '0';
            this.elements.backButton.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                this.elements.backButton.style.opacity = '1';
                this.elements.backButton.style.transform = 'translateY(0)';
            }, 100);
        }
    }
    
    hideBackButton() {
        if (this.elements.backButton) {
            this.elements.backButton.style.opacity = '0';
            this.elements.backButton.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                this.elements.backButton.classList.add('hidden');
            }, 300);
        }
    }
    
    // Методы управления информационной панелью
    toggleInfoPanel() {
        if (!this.elements.infoContent || !this.elements.infoToggle) return;
        
        this.state.isInfoPanelCollapsed = !this.state.isInfoPanelCollapsed;
        
        if (this.state.isInfoPanelCollapsed) {
            this.elements.infoContent.classList.add('collapsed');
            this.elements.infoToggle.textContent = '+';
        } else {
            this.elements.infoContent.classList.remove('collapsed');
            this.elements.infoToggle.textContent = '−';
        }
    }
    
    // Методы управления производительностью
    updateFPS(fps) {
        if (this.elements.fpsCounter) {
            this.elements.fpsCounter.textContent = `${Math.round(fps)} FPS`;
            
            // Цветовая индикация
            if (fps >= 50) {
                this.elements.fpsCounter.style.color = '#50c878';
            } else if (fps >= 30) {
                this.elements.fpsCounter.style.color = '#ffa500';
            } else {
                this.elements.fpsCounter.style.color = '#e0115f';
            }
        }
    }
    
    // Методы управления уведомлениями
    showNotification(message, type = 'success', duration = 5000) {
        const notification = this.createNotification(message, type);
        this.elements.notifications.appendChild(notification);
        
        // Анимация появления
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
            notification.style.opacity = '1';
        }, 100);
        
        // Автоматическое скрытие
        setTimeout(() => {
            this.hideNotification(notification);
        }, duration);
        
        // Сохранение в состоянии
        this.state.notifications.push(notification);
    }
    
    createNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-message">${message}</div>
                <button class="notification-close">&times;</button>
            </div>
        `;
        
        // Стили для анимации
        notification.style.cssText = `
            transform: translateX(100%);
            opacity: 0;
            transition: all 0.3s ease;
        `;
        
        // Обработчик закрытия
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            this.hideNotification(notification);
        });
        
        return notification;
    }
    
    hideNotification(notification) {
        notification.style.transform = 'translateX(100%)';
        notification.style.opacity = '0';
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            
            // Удаление из состояния
            const index = this.state.notifications.indexOf(notification);
            if (index > -1) {
                this.state.notifications.splice(index, 1);
            }
        }, 300);
    }
    
    // Методы управления модальными окнами
    showModal(content, options = {}) {
        if (!this.elements.modalOverlay || !this.elements.modalContent) return;
        
        this.elements.modalContent.innerHTML = content;
        this.elements.modalOverlay.classList.remove('hidden');
        
        // Настройка обработчиков для модального окна
        if (options.onClose) {
            this.elements.modalOverlay.addEventListener('click', (e) => {
                if (e.target === this.elements.modalOverlay) {
                    this.hideModal();
                    options.onClose();
                }
            });
        }
    }
    
    hideModal() {
        if (this.elements.modalOverlay) {
            this.elements.modalOverlay.classList.add('hidden');
        }
    }
    
    // Методы управления мобильными контролами
    showMobileControls() {
        if (this.elements.mobileControls) {
            this.elements.mobileControls.style.display = 'flex';
        }
    }
    
    hideMobileControls() {
        if (this.elements.mobileControls) {
            this.elements.mobileControls.style.display = 'none';
        }
    }
    
    // Обработка изменения размера окна
    handleResize() {
        // Адаптация UI элементов при изменении размера
        if (window.innerWidth <= 768) {
            this.adaptForMobile();
        } else {
            this.adaptForDesktop();
        }
    }
    
    adaptForDesktop() {
        // Восстановление десктопных размеров
        const mobileButtons = document.querySelectorAll('.mobile-btn');
        mobileButtons.forEach(btn => {
            btn.style.width = '48px';
            btn.style.height = '48px';
        });
        
        if (this.elements.backButton) {
            this.elements.backButton.style.padding = '12px 20px';
            this.elements.backButton.style.fontSize = '14px';
        }
        
        if (this.elements.instructions) {
            this.elements.instructions.style.fontSize = '16px';
            this.elements.instructions.style.padding = '15px 25px';
        }
    }
    
    // Утилиты
    addClass(element, className) {
        if (element && element.classList) {
            element.classList.add(className);
        }
    }
    
    removeClass(element, className) {
        if (element && element.classList) {
            element.classList.remove(className);
        }
    }
    
    toggleClass(element, className) {
        if (element && element.classList) {
            element.classList.toggle(className);
        }
    }
    
    // Анимации
    animateElement(element, animation, duration = 300) {
        if (!element) return;
        
        element.style.transition = `all ${duration}ms ease`;
        element.style.animation = animation;
        
        setTimeout(() => {
            element.style.animation = '';
        }, duration);
    }
    
    // Получение состояния
    getState() {
        return { ...this.state };
    }
    
    // Очистка ресурсов
    dispose() {
        // Удаление всех уведомлений
        this.state.notifications.forEach(notification => {
            this.hideNotification(notification);
        });
        
        // Удаление обработчиков событий
        this.removeAllListeners();
    }
}
