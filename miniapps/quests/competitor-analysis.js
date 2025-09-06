document.addEventListener('DOMContentLoaded', () => {
    const screens = document.querySelectorAll('.screen');
    const startBtn = document.getElementById('start-quest-btn');
    const backBtn = document.getElementById('back-btn');
    const mainMenuBtn = document.getElementById('main-menu-btn');
    const toMainMenuBtn = document.getElementById('to-main-menu-btn');

    let currentScreenIndex = 0;
    const history = [0]; // Keep track of visited screens for back button

    function showScreen(index, isBack = false) {
        if (index < 0 || index >= screens.length) return;

        screens[currentScreenIndex].classList.remove('active');
        screens[index].classList.add('active');
        currentScreenIndex = index;

        if (!isBack) {
            history.push(index);
        }
    }

    startBtn.addEventListener('click', () => showScreen(1));
    
    backBtn.addEventListener('click', () => {
        if (history.length > 1) {
            history.pop();
            const prevScreenIndex = history[history.length - 1];
            showScreen(prevScreenIndex, true);
        }
    });

    const goToMainMenu = () => window.location.href = '../quests.html';
    mainMenuBtn.addEventListener('click', goToMainMenu);
    toMainMenuBtn.addEventListener('click', goToMainMenu);

    // --- Stage 1: Dossier Logic ---
    const factFragments = document.querySelectorAll('.fact-fragment');
    const dossierSlots = document.querySelectorAll('.dossier-slot');
    const stage1Feedback = document.getElementById('stage1-feedback');
    let correctDossierDrops = 0;
    
    factFragments.forEach(fragment => {
        fragment.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', fragment.dataset.fact);
            fragment.classList.add('dragging');
        });
        fragment.addEventListener('dragend', () => fragment.classList.remove('dragging'));
    });

    dossierSlots.forEach(slot => {
        slot.addEventListener('dragover', (e) => {
            e.preventDefault();
            slot.classList.add('over');
        });
        slot.addEventListener('dragleave', () => slot.classList.remove('over'));
        slot.addEventListener('drop', (e) => {
            e.preventDefault();
            slot.classList.remove('over');
            const droppedFact = e.dataTransfer.getData('text/plain');
            if (slot.dataset.fact === droppedFact) {
                const draggedEl = document.querySelector(`.fact-fragment[data-fact="${droppedFact}"]`);
                slot.textContent = draggedEl.textContent;
                slot.style.backgroundColor = 'rgba(0, 255, 157, 0.2)';
                slot.style.borderColor = '#00ff9d';
                draggedEl.style.display = 'none';
                correctDossierDrops++;
                if (correctDossierDrops === 3) {
                    stage1Feedback.textContent = 'Досье составлено верно. Доступ получен.';
                    setTimeout(() => showScreen(2), 1500);
                }
            } else {
                stage1Feedback.textContent = 'Неверные данные. Система защиты активна.';
                setTimeout(() => stage1Feedback.textContent = '', 2000);
            }
        });
    });

    // --- Stage 2: Chat Logic ---
    const chatMessages = document.querySelectorAll('.chat-message');
    const stage2Feedback = document.getElementById('stage2-feedback');
    let suspiciousMessagesFound = 0;
    const totalSuspicious = 3;

    chatMessages.forEach(message => {
        message.addEventListener('click', () => {
            if (message.classList.contains('selected')) return;

            message.classList.add('selected');
            if (message.dataset.suspicious === 'true') {
                suspiciousMessagesFound++;
                message.classList.add('correct');
                stage2Feedback.textContent = `Найдено улик: ${suspiciousMessagesFound} из ${totalSuspicious}`;
                if (suspiciousMessagesFound === totalSuspicious) {
                     setTimeout(() => showScreen(3), 1000);
                }
            } else {
                message.classList.add('incorrect');
                stage2Feedback.textContent = 'Ложный след...';
                setTimeout(() => {
                    message.classList.remove('selected', 'incorrect');
                    stage2Feedback.textContent = `Найдено улик: ${suspiciousMessagesFound} из ${totalSuspicious}`;
                }, 1000);
            }
        });
    });
    
    // --- Stage 3: Marketing Logic ---
    const draggableTags = document.querySelectorAll('#stage-3 .draggable-tag');
    const adDropzones = document.querySelectorAll('.ad-banner-dropzone');
    let correctAdDrops = 0;

    draggableTags.forEach(tag => {
        tag.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', tag.dataset.manipulation);
            tag.classList.add('dragging');
        });
        tag.addEventListener('dragend', () => tag.classList.remove('dragging'));
    });

    adDropzones.forEach(zone => {
        zone.addEventListener('dragover', e => {
            e.preventDefault();
            zone.classList.add('over');
        });
        zone.addEventListener('dragleave', () => zone.classList.remove('over'));
        zone.addEventListener('drop', e => {
            e.preventDefault();
            zone.classList.remove('over');
            const droppedManipulation = e.dataTransfer.getData('text/plain');
            if (zone.dataset.manipulation === droppedManipulation) {
                const draggedTag = document.querySelector(`#stage-3 .draggable-tag[data-manipulation="${droppedManipulation}"]`);
                draggedTag.style.position = 'absolute';
                zone.appendChild(draggedTag);
                correctAdDrops++;
                if (correctAdDrops === adDropzones.length) {
                    setTimeout(() => showScreen(4), 1000);
                }
            }
        });
    });

    // Show the first screen initially
    showScreen(0);
});
