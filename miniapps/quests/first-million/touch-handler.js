/* ===== MOBILE TOUCH HANDLER ===== */

class TouchHandler {
    constructor() {
        this.isDragging = false;
        this.currentElement = null;
        this.startPos = { x: 0, y: 0 };
        this.currentPos = { x: 0, y: 0 };
        this.offset = { x: 0, y: 0 };
        this.dragClone = null;
        this.dropZones = [];
        this.swipeThreshold = 100;
        this.swipeVelocityThreshold = 0.5;
        
        // Bind methods
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        
        this.init();
    }
    
    init() {
        // Добавляем обработчики для touch и mouse событий
        document.addEventListener('touchstart', this.handleTouchStart, { passive: false });
        document.addEventListener('touchmove', this.handleTouchMove, { passive: false });
        document.addEventListener('touchend', this.handleTouchEnd, { passive: false });
        
        // Для тестирования на десктопе
        document.addEventListener('mousedown', this.handleMouseDown);
        document.addEventListener('mousemove', this.handleMouseMove);
        document.addEventListener('mouseup', this.handleMouseUp);
        
        // Предотвращаем контекстное меню на мобильных
        document.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    // Touch Events
    handleTouchStart(e) {
        const touch = e.touches[0];
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        
        if (this.isDraggableElement(element)) {
            e.preventDefault();
            this.startDrag(element, touch.clientX, touch.clientY);
        } else if (this.isSwipeableElement(element)) {
            this.startSwipe(element, touch.clientX, touch.clientY);
        } else if (this.isDrawableArea(element)) {
            this.startDraw(touch.clientX, touch.clientY);
        }
    }
    
    handleTouchMove(e) {
        if (this.isDragging) {
            e.preventDefault();
            const touch = e.touches[0];
            this.updateDrag(touch.clientX, touch.clientY);
        } else if (this.isSwipping) {
            e.preventDefault();
            const touch = e.touches[0];
            this.updateSwipe(touch.clientX, touch.clientY);
        } else if (this.isDrawing) {
            e.preventDefault();
            const touch = e.touches[0];
            this.updateDraw(touch.clientX, touch.clientY);
        }
    }
    
    handleTouchEnd(e) {
        if (this.isDragging) {
            e.preventDefault();
            this.endDrag();
        } else if (this.isSwipping) {
            e.preventDefault();
            this.endSwipe();
        } else if (this.isDrawing) {
            this.endDraw();
        }
    }
    
    // Mouse Events (for desktop testing)
    handleMouseDown(e) {
        const element = e.target;
        
        if (this.isDraggableElement(element)) {
            e.preventDefault();
            this.startDrag(element, e.clientX, e.clientY);
        } else if (this.isSwipeableElement(element)) {
            this.startSwipe(element, e.clientX, e.clientY);
        } else if (this.isDrawableArea(element)) {
            this.startDraw(e.clientX, e.clientY);
        }
    }
    
    handleMouseMove(e) {
        if (this.isDragging) {
            e.preventDefault();
            this.updateDrag(e.clientX, e.clientY);
        } else if (this.isSwipping) {
            e.preventDefault();
            this.updateSwipe(e.clientX, e.clientY);
        } else if (this.isDrawing) {
            e.preventDefault();
            this.updateDraw(e.clientX, e.clientY);
        }
    }
    
    handleMouseUp(e) {
        if (this.isDragging) {
            e.preventDefault();
            this.endDrag();
        } else if (this.isSwipping) {
            e.preventDefault();
            this.endSwipe();
        } else if (this.isDrawing) {
            this.endDraw();
        }
    }
    
    // Drag & Drop Logic
    isDraggableElement(element) {
        return element && (
            element.classList.contains('draggable-item') ||
            element.classList.contains('money-item') ||
            element.classList.contains('slide-template') ||
            element.closest('.draggable-item') ||
            element.closest('.money-item') ||
            element.closest('.slide-template')
        );
    }
    
    startDrag(element, clientX, clientY) {
        // Находим корневой элемент для перетаскивания
        this.currentElement = element.closest('.draggable-item') || 
                             element.closest('.money-item') || 
                             element.closest('.slide-template') || 
                             element;
        
        if (!this.currentElement) return;
        
        this.isDragging = true;
        this.startPos = { x: clientX, y: clientY };
        this.currentPos = { x: clientX, y: clientY };
        
        // Получаем размеры и позицию элемента
        const rect = this.currentElement.getBoundingClientRect();
        this.offset = {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
        
        // Создаем клон для перетаскивания
        this.createDragClone(rect);
        
        // Добавляем визуальные эффекты
        this.currentElement.classList.add('dragging');
        document.body.style.userSelect = 'none';
        
        // Ищем возможные зоны drop
        this.updateDropZones();
        
        // Haptic feedback
        this.triggerHapticFeedback('light');
        
        // Уведомляем игровую логику
        this.dispatchDragEvent('dragstart', {
            element: this.currentElement,
            startPos: this.startPos
        });
    }
    
    updateDrag(clientX, clientY) {
        if (!this.isDragging || !this.dragClone) return;
        
        this.currentPos = { x: clientX, y: clientY };
        
        // Обновляем позицию клона
        this.dragClone.style.left = `${clientX - this.offset.x}px`;
        this.dragClone.style.top = `${clientY - this.offset.y}px`;
        
        // Проверяем пересечение с drop зонами
        const hoveredZone = this.getHoveredDropZone(clientX, clientY);
        this.updateDropZoneHighlight(hoveredZone);
        
        // Уведомляем игровую логику
        this.dispatchDragEvent('dragmove', {
            element: this.currentElement,
            currentPos: this.currentPos,
            hoveredZone: hoveredZone
        });
    }
    
    endDrag() {
        if (!this.isDragging) return;
        
        const dropZone = this.getHoveredDropZone(this.currentPos.x, this.currentPos.y);
        
        // Убираем визуальные эффекты
        this.currentElement.classList.remove('dragging');
        this.clearDropZoneHighlights();
        document.body.style.userSelect = '';
        
        // Удаляем клон
        if (this.dragClone) {
            this.dragClone.remove();
            this.dragClone = null;
        }
        
        // Обрабатываем drop
        if (dropZone && this.canDropHere(this.currentElement, dropZone)) {
            this.handleSuccessfulDrop(dropZone);
            this.triggerHapticFeedback('medium');
        } else {
            this.handleFailedDrop();
            this.triggerHapticFeedback('error');
        }
        
        // Уведомляем игровую логику
        this.dispatchDragEvent('dragend', {
            element: this.currentElement,
            dropZone: dropZone,
            success: dropZone && this.canDropHere(this.currentElement, dropZone)
        });
        
        // Сбрасываем состояние
        this.isDragging = false;
        this.currentElement = null;
        this.dropZones = [];
    }
    
    createDragClone(originalRect) {
        this.dragClone = this.currentElement.cloneNode(true);
        this.dragClone.classList.add('drag-clone');
        this.dragClone.style.position = 'fixed';
        this.dragClone.style.left = `${originalRect.left}px`;
        this.dragClone.style.top = `${originalRect.top}px`;
        this.dragClone.style.width = `${originalRect.width}px`;
        this.dragClone.style.height = `${originalRect.height}px`;
        this.dragClone.style.zIndex = '10000';
        this.dragClone.style.pointerEvents = 'none';
        this.dragClone.style.transform = 'scale(1.05) rotate(5deg)';
        this.dragClone.style.boxShadow = '0 8px 25px rgba(0,0,0,0.3)';
        this.dragClone.style.transition = 'none';
        
        document.body.appendChild(this.dragClone);
    }
    
    updateDropZones() {
        this.dropZones = Array.from(document.querySelectorAll('.drop-zone, .dept-drop-zone, .slide-slot'));
    }
    
    getHoveredDropZone(x, y) {
        const element = document.elementFromPoint(x, y);
        if (!element) return null;
        
        return this.dropZones.find(zone => zone.contains(element)) || 
               element.closest('.drop-zone') || 
               element.closest('.dept-drop-zone') || 
               element.closest('.slide-slot');
    }
    
    updateDropZoneHighlight(hoveredZone) {
        this.dropZones.forEach(zone => {
            zone.classList.remove('drag-over');
        });
        
        if (hoveredZone && this.canDropHere(this.currentElement, hoveredZone)) {
            hoveredZone.classList.add('drag-over');
        }
    }
    
    clearDropZoneHighlights() {
        this.dropZones.forEach(zone => {
            zone.classList.remove('drag-over');
        });
    }
    
    canDropHere(element, dropZone) {
        if (!element || !dropZone) return false;
        
        // Проверяем совместимость типов
        const elementType = element.dataset.type || this.getElementType(element);
        const zoneType = dropZone.dataset.type || this.getZoneType(dropZone);
        
        return elementType === zoneType || zoneType === 'any';
    }
    
    getElementType(element) {
        if (element.classList.contains('draggable-item')) {
            return element.closest('#stage1') ? 'startup' : 'general';
        }
        if (element.classList.contains('money-item')) return 'money';
        if (element.classList.contains('slide-template')) return 'slide';
        return 'general';
    }
    
    getZoneType(zone) {
        if (zone.classList.contains('drop-zone')) return zone.dataset.type || 'startup';
        if (zone.classList.contains('dept-drop-zone')) return 'money';
        if (zone.classList.contains('slide-slot')) return 'slide';
        return 'general';
    }
    
    handleSuccessfulDrop(dropZone) {
        // Анимация успешного размещения
        const rect = dropZone.getBoundingClientRect();
        
        this.currentElement.style.transition = 'all 0.3s ease';
        this.currentElement.style.transform = 'scale(0.9)';
        this.currentElement.style.position = 'absolute';
        this.currentElement.style.left = `${rect.left}px`;
        this.currentElement.style.top = `${rect.top}px`;
        
        setTimeout(() => {
            this.currentElement.style.transition = '';
            this.currentElement.style.transform = '';
            this.currentElement.style.position = '';
            this.currentElement.style.left = '';
            this.currentElement.style.top = '';
            this.currentElement.classList.add('placed');
        }, 300);
    }
    
    handleFailedDrop() {
        // Анимация возврата на место
        this.currentElement.style.transition = 'all 0.3s ease';
        this.currentElement.style.transform = 'scale(1)';
        
        setTimeout(() => {
            this.currentElement.style.transition = '';
            this.currentElement.style.transform = '';
        }, 300);
    }
    
    // Swipe Logic
    isSwipeableElement(element) {
        return element && (
            element.classList.contains('client-card') ||
            element.closest('.client-card')
        );
    }
    
    startSwipe(element, clientX, clientY) {
        this.currentElement = element.closest('.client-card') || element;
        if (!this.currentElement) return;
        
        this.isSwipping = true;
        this.swipeStartTime = Date.now();
        this.startPos = { x: clientX, y: clientY };
        this.currentPos = { x: clientX, y: clientY };
        
        this.currentElement.classList.add('swiping');
        this.triggerHapticFeedback('light');
    }
    
    updateSwipe(clientX, clientY) {
        if (!this.isSwipping) return;
        
        this.currentPos = { x: clientX, y: clientY };
        const deltaX = clientX - this.startPos.x;
        const deltaY = clientY - this.startPos.y;
        
        // Обновляем позицию карточки
        const rotation = deltaX * 0.1;
        this.currentElement.style.transform = `translateX(${deltaX}px) translateY(${deltaY * 0.3}px) rotate(${rotation}deg)`;
        
        // Обновляем индикаторы
        this.updateSwipeIndicators(deltaX);
    }
    
    updateSwipeIndicators(deltaX) {
        const indicators = document.querySelectorAll('.swipe-indicators .reject-indicator, .swipe-indicators .accept-indicator');
        const threshold = this.swipeThreshold;
        
        indicators.forEach(indicator => {
            if (indicator.classList.contains('reject-indicator') && deltaX < -threshold/2) {
                indicator.style.opacity = '1';
            } else if (indicator.classList.contains('accept-indicator') && deltaX > threshold/2) {
                indicator.style.opacity = '1';
            } else {
                indicator.style.opacity = '0.6';
            }
        });
    }
    
    endSwipe() {
        if (!this.isSwipping) return;
        
        const deltaX = this.currentPos.x - this.startPos.x;
        const deltaTime = Date.now() - this.swipeStartTime;
        const velocity = Math.abs(deltaX) / deltaTime;
        
        const isLeftSwipe = deltaX < -this.swipeThreshold || (deltaX < 0 && velocity > this.swipeVelocityThreshold);
        const isRightSwipe = deltaX > this.swipeThreshold || (deltaX > 0 && velocity > this.swipeVelocityThreshold);
        
        if (isLeftSwipe) {
            this.completeSwipe('left');
        } else if (isRightSwipe) {
            this.completeSwipe('right');
        } else {
            this.cancelSwipe();
        }
        
        this.isSwipping = false;
        this.currentElement.classList.remove('swiping');
        this.resetSwipeIndicators();
    }
    
    completeSwipe(direction) {
        const className = direction === 'left' ? 'swipe-left' : 'swipe-right';
        this.currentElement.classList.add(className);
        
        this.triggerHapticFeedback('medium');
        
        // Уведомляем игровую логику
        this.dispatchSwipeEvent('swipe', {
            element: this.currentElement,
            direction: direction
        });
        
        // Удаляем карточку после анимации
        setTimeout(() => {
            if (this.currentElement && this.currentElement.parentNode) {
                this.currentElement.remove();
            }
        }, 300);
    }
    
    cancelSwipe() {
        this.currentElement.style.transition = 'transform 0.3s ease';
        this.currentElement.style.transform = '';
        
        setTimeout(() => {
            this.currentElement.style.transition = '';
        }, 300);
    }
    
    resetSwipeIndicators() {
        const indicators = document.querySelectorAll('.swipe-indicators .reject-indicator, .swipe-indicators .accept-indicator');
        indicators.forEach(indicator => {
            indicator.style.opacity = '0.6';
        });
    }
    
    // Drawing Logic
    isDrawableArea(element) {
        return element && (
            element.id === 'marketChart' ||
            element.closest('#marketChart')
        );
    }
    
    startDraw(clientX, clientY) {
        this.isDrawing = true;
        this.drawingPath = [];
        this.drawingCanvas = document.getElementById('marketChart');
        
        if (this.drawingCanvas) {
            const rect = this.drawingCanvas.getBoundingClientRect();
            const x = clientX - rect.left;
            const y = clientY - rect.top;
            
            this.drawingPath.push({ x, y });
            this.triggerHapticFeedback('light');
        }
    }
    
    updateDraw(clientX, clientY) {
        if (!this.isDrawing || !this.drawingCanvas) return;
        
        const rect = this.drawingCanvas.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        
        this.drawingPath.push({ x, y });
        
        // Рисуем линию
        this.drawLineOnCanvas(x, y);
    }
    
    drawLineOnCanvas(x, y) {
        const ctx = this.drawingCanvas.getContext('2d');
        const path = this.drawingPath;
        
        if (path.length < 2) return;
        
        ctx.strokeStyle = '#667eea';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        const current = path[path.length - 1];
        const previous = path[path.length - 2];
        
        ctx.beginPath();
        ctx.moveTo(previous.x, previous.y);
        ctx.lineTo(current.x, current.y);
        ctx.stroke();
    }
    
    endDraw() {
        if (!this.isDrawing) return;
        
        this.isDrawing = false;
        
        if (this.drawingPath.length > 5) {
            this.triggerHapticFeedback('medium');
            
            // Уведомляем игровую логику
            this.dispatchDrawEvent('draw_complete', {
                path: this.drawingPath,
                canvas: this.drawingCanvas
            });
        }
        
        this.drawingPath = [];
    }
    
    // Event Dispatching
    dispatchDragEvent(type, data) {
        const event = new CustomEvent('mobileDrag', {
            detail: { type, ...data }
        });
        document.dispatchEvent(event);
    }
    
    dispatchSwipeEvent(type, data) {
        const event = new CustomEvent('mobileSwipe', {
            detail: { type, ...data }
        });
        document.dispatchEvent(event);
    }
    
    dispatchDrawEvent(type, data) {
        const event = new CustomEvent('mobileDraw', {
            detail: { type, ...data }
        });
        document.dispatchEvent(event);
    }
    
    // Haptic Feedback
    triggerHapticFeedback(type = 'light') {
        if (navigator.vibrate) {
            const patterns = {
                light: [10],
                medium: [20],
                heavy: [30],
                error: [50, 50, 50],
                success: [10, 30, 10]
            };
            
            navigator.vibrate(patterns[type] || patterns.light);
        }
        
        // Telegram Web App haptic feedback
        if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.HapticFeedback) {
            const haptic = window.Telegram.WebApp.HapticFeedback;
            
            switch (type) {
                case 'light':
                    haptic.impactOccurred('light');
                    break;
                case 'medium':
                    haptic.impactOccurred('medium');
                    break;
                case 'heavy':
                    haptic.impactOccurred('heavy');
                    break;
                case 'error':
                    haptic.notificationOccurred('error');
                    break;
                case 'success':
                    haptic.notificationOccurred('success');
                    break;
            }
        }
    }
    
    // Utility Methods
    destroy() {
        document.removeEventListener('touchstart', this.handleTouchStart);
        document.removeEventListener('touchmove', this.handleTouchMove);
        document.removeEventListener('touchend', this.handleTouchEnd);
        document.removeEventListener('mousedown', this.handleMouseDown);
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('mouseup', this.handleMouseUp);
        
        if (this.dragClone) {
            this.dragClone.remove();
        }
    }
}

// Экспорт класса
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TouchHandler;
}
