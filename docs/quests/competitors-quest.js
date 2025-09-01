document.addEventListener('DOMContentLoaded', () => {
    const questContent = document.getElementById('quest-content');
    const startQuestBtn = document.getElementById('start-quest-btn');
    const backButton = document.getElementById('back-button');
    const mainMenuButton = document.getElementById('main-menu-button');

    let currentStage = 0;
    const questStages = []; // Здесь будут храниться этапы квеста
    let gameData = {
        resources: 100, // Начальные ресурсы для найма/рекламы
        competitors: {
            monolith: { name: 'Монолит', weakness: [], strength: [], status: 'active', img: '../assets/photovideo/monolith.png' },
            phoenix: { name: 'Феникс', weakness: [], strength: [], status: 'active', img: '../assets/photovideo/phoenix.png' },
            chameleon: { name: 'Хамелеон', weakness: [], strength: [], status: 'active', img: '../assets/photovideo/chameleon.png' }
        },
        team: []
    };

    // Функция для загрузки контента этапа
    function loadStage(stageIndex) {
        if (stageIndex >= 0 && stageIndex < questStages.length) {
            currentStage = stageIndex;
            questContent.innerHTML = questStages[currentStage].content;
            updateNavigationButtons();
            if (questStages[currentStage].init) {
                questStages[currentStage].init();
            }
        } else if (stageIndex >= questStages.length) {
            // Это последний этап или завершение квеста
            endQuest();
        }
    }

    // Функция для обновления состояния кнопок навигации
    function updateNavigationButtons() {
        if (currentStage > 0) {
            backButton.style.display = 'block';
        } else {
            backButton.style.display = 'none';
        }
    }

    // Пример этапа (будет заменено реальными данными)
    questStages.push({
        content: `
            <h1>Добро пожаловать в квест "Бизнес-Детектив: Код Конкуренции"!</h1>
            <p>Вы — молодой амбициозный предприниматель, только что запустивший свой стартап.</p>
            <p>Ваша цель — не просто выжить, но и стать лидером рынка, обойдя коварных и опытных конкурентов.</p>
            <p>Я ваш ИИ-Наставник. Приготовьтесь к интерактивному расследованию, где каждое решение имеет значение.</p>
            <button class="next-button main-button">Начать миссию</button>
        `,
        init: () => {
            document.querySelector('.next-button').addEventListener('click', () => loadStage(currentStage + 1));
            backButton.style.display = 'none';
        }
    });

    questStages.push({
        content: `
            <h1>Этап 1: Разведка и Первые Конкуренты</h1>
            <p>ИИ-Наставник: "Начнем с базовой разведки. Вот информация о ваших основных противниках: 'Монолит', 'Феникс' и 'Хамелеон'."</p>
            <p>Ваша задача: перетащите инструмент "Сканер Новостей" на каждого конкурента, чтобы собрать о них первичные данные.</p>
            <div class="competitors-grid">
                <div class="competitor-card" data-competitor="monolith">
                    <img src="../assets/photovideo/monolith.png" alt="Монолит">
                    <h3>Монолит</h3>
                    <div class="drop-target" data-tool="news-scanner"></div>
                </div>
                <div class="competitor-card" data-competitor="phoenix">
                    <img src="../assets/photovideo/phoenix.png" alt="Феникс">
                    <h3>Феникс</h3>
                    <div class="drop-target" data-tool="news-scanner"></div>
                </div>
                <div class="competitor-card" data-competitor="chameleon">
                    <img src="../assets/photovideo/chameleon.png" alt="Хамелеон">
                    <h3>Хамелеон</h3>
                    <div class="drop-target" data-tool="news-scanner"></div>
                </div>
            </div>
            <div class="tools-palette">
                <div class="tool-item draggable" data-tool-type="news-scanner" draggable="true">
                    <img src="../assets/photovideo/strelka.png" alt="Сканер Новостей">
                    <span>Сканер Новостей</span>
                </div>
            </div>
            <button id="stage1-next-button" class="main-button" style="display: none;">Продолжить</button>
        `,
        init: () => {
            const newsScannerTool = document.querySelector('.tool-item[data-tool-type="news-scanner"]');
            const dropTargets = document.querySelectorAll('.drop-target[data-tool="news-scanner"]');
            let scannedCompetitors = new Set();

            function handleDragStart(e) {
                e.dataTransfer.setData('text/plain', e.target.dataset.toolType);
            }

            function handleDragOver(e) {
                e.preventDefault(); // Разрешить drop
            }

            function handleDrop(e) {
                e.preventDefault();
                const toolType = e.dataTransfer.getData('text/plain');
                const competitorCard = e.target.closest('.competitor-card');
                if (toolType === 'news-scanner' && competitorCard) {
                    const competitorId = competitorCard.dataset.competitor;
                    if (!scannedCompetitors.has(competitorId)) {
                        scannedCompetitors.add(competitorId);
                        competitorCard.style.border = '2px solid green'; // Визуальный эффект
                        // Здесь будет логика добавления слабостей на основе конкурента
                        if (competitorId === 'monolith') {
                            gameData.competitors.monolith.weakness.push('Устаревший сайт');
                        } else if (competitorId === 'phoenix') {
                            gameData.competitors.phoenix.weakness.push('Плохие отзывы о поддержке');
                        } else if (competitorId === 'chameleon') {
                            gameData.competitors.chameleon.weakness.push('Ограниченный бюджет на маркетинг');
                        }
                        console.log(`Просканирован ${competitorId}. Слабости:`, gameData.competitors[competitorId].weakness);
                    }
                    if (scannedCompetitors.size === 3) {
                        document.getElementById('stage1-next-button').style.display = 'block';
                    }
                }
            }

            newsScannerTool.addEventListener('dragstart', handleDragStart);
            dropTargets.forEach(target => {
                target.addEventListener('dragover', handleDragOver);
                target.addEventListener('drop', handleDrop);
            });
            document.getElementById('stage1-next-button').addEventListener('click', () => loadStage(currentStage + 1));
        }
    });

    questStages.push({
        content: `
            <h1>Этап 2: Найм Команды</h1>
            <p>ИИ-Наставник: "Чтобы копать глубже и использовать слабости конкурентов, вам нужна эффективная команда. У вас есть ${gameData.resources} ресурсов."</p>
            <p>Нанимайте специалистов, перетаскивая на них ресурсы. Каждый специалист обладает уникальными навыками.</p>
            <div class="team-recruitment-grid">
                <div class="employee-card" data-employee="smm-specialist" data-cost="30">
                    <img src="../assets/photovideo/kazik.mp3" alt="SMM-специалист">
                    <h3>Джулия (SMM-специалист)</h3>
                    <p>Стоимость: 30 ресурсов</p>
                    <div class="drop-target-resource" data-resource-target="smm-specialist"></div>
                </div>
                <div class="employee-card" data-employee="data-analyst" data-cost="40">
                    <img src="../assets/photovideo/music.mp3" alt="Дата-аналитик">
                    <h3>Макс (Дата-аналитик)</h3>
                    <p>Стоимость: 40 ресурсов</p>
                    <div class="drop-target-resource" data-resource-target="data-analyst"></div>
                </div>
                <div class="employee-card" data-employee="hacker" data-cost="50">
                    <img src="../assets/photovideo/wtf.png" alt="Хакер">
                    <h3>Лео (Хакер)</h3>
                    <p>Стоимость: 50 ресурсов</p>
                    <div class="drop-target-resource" data-resource-target="hacker"></div>
                </div>
            </div>
            <div class="resources-palette">
                <div class="resource-item draggable" data-resource-type="coins" draggable="true">
                    <img src="../assets/photovideo/mulacoin.png" alt="Ресурсы">
                    <span>Ресурсы: ${gameData.resources}</span>
                </div>
            </div>
            <button id="stage2-next-button" class="main-button" style="display: none;">Продолжить</button>
        `,
        init: () => {
            const resourceItem = document.querySelector('.resource-item[data-resource-type="coins"]');
            const dropTargets = document.querySelectorAll('.drop-target-resource');

            function handleDragStart(e) {
                e.dataTransfer.setData('text/plain', e.target.dataset.resourceType);
            }

            function handleDragOver(e) {
                e.preventDefault();
            }

            async function handleDrop(e) {
                e.preventDefault();
                const resourceType = e.dataTransfer.getData('text/plain');
                const employeeCard = e.target.closest('.employee-card');

                if (resourceType === 'coins' && employeeCard) {
                    const employeeId = employeeCard.dataset.employee;
                    const employeeCost = parseInt(employeeCard.dataset.cost, 10);

                    if (gameData.resources >= employeeCost && !gameData.team.includes(employeeId)) {
                        gameData.resources -= employeeCost;
                        gameData.team.push(employeeId);
                        employeeCard.style.border = '2px solid gold';
                        employeeCard.querySelector('h3').textContent += ' (Нанят)';
                        e.target.style.display = 'none'; // Скрыть зону сброса после найма

                        // Обновляем отображение ресурсов
                        document.querySelector('.resource-item span').textContent = `Ресурсы: ${gameData.resources}`;
                        console.log(`${employeeId} нанят. Осталось ресурсов: ${gameData.resources}. Команда:`, gameData.team);

                        if (gameData.team.length > 0) {
                            document.getElementById('stage2-next-button').style.display = 'block';
                        }
                    } else if (gameData.resources < employeeCost) {
                        alert('Недостаточно ресурсов для найма этого специалиста!');
                    } else if (gameData.team.includes(employeeId)) {
                        alert('Этот специалист уже в вашей команде!');
                    }
                }
            }

            if (resourceItem) {
                resourceItem.addEventListener('dragstart', handleDragStart);
            }
            dropTargets.forEach(target => {
                target.addEventListener('dragover', handleDragOver);
                target.addEventListener('drop', handleDrop);
            });
            document.getElementById('stage2-next-button').addEventListener('click', () => loadStage(currentStage + 1));
        }
    });

    questStages.push({
        content: `
            <h1>Этап 3: Глубокий Анализ и Взлом</h1>
            <p>ИИ-Наставник: "Теперь, когда у вас есть команда, пора использовать их уникальные навыки для глубокого анализа и даже взлома данных конкурентов."</p>
            <p>Перетащите ваших специалистов на карточки конкурентов, чтобы раскрыть их скрытые слабости.</p>
            <div class="competitors-grid">
                ${Object.keys(gameData.competitors).map(id => `
                    <div class="competitor-card" data-competitor="${id}">
                        <img src="${gameData.competitors[id].img}" alt="${gameData.competitors[id].name}">
                        <h3>${gameData.competitors[id].name}</h3>
                        <div class="weaknesses-list">
                            ${gameData.competitors[id].weakness.map(w => `<span class="weakness-tag">${w}</span>`).join('')}
                        </div>
                        <div class="drop-target-team" data-team-target="${id}"></div>
                    </div>
                `).join('')}
            </div>
            <div class="team-palette">
                ${gameData.team.map(member => `
                    <div class="team-item draggable" data-team-type="${member}" draggable="true">
                        <img src="../assets/photovideo/${member === 'smm-specialist' ? 'kazik.mp3' : member === 'data-analyst' ? 'music.mp3' : 'wtf.png'}" alt="${member}">
                        <span>${member === 'smm-specialist' ? 'Джулия (SMM)' : member === 'data-analyst' ? 'Макс (Аналитик)' : 'Лео (Хакер)'}</span>
                    </div>
                `).join('')}
            </div>
            <button id="stage3-next-button" class="main-button" style="display: none;">Продолжить</button>
        `,
        init: () => {
            const teamItems = document.querySelectorAll('.team-item.draggable');
            const dropTargets = document.querySelectorAll('.drop-target-team');
            let analyzedCompetitors = new Set();

            function handleDragStart(e) {
                e.dataTransfer.setData('text/plain', e.target.dataset.teamType);
            }

            function handleDragOver(e) {
                e.preventDefault();
                e.target.classList.add('drag-over');
            }

            function handleDragLeave(e) {
                e.target.classList.remove('drag-over');
            }

            function handleDrop(e) {
                e.preventDefault();
                e.target.classList.remove('drag-over');
                const teamType = e.dataTransfer.getData('text/plain');
                const competitorCard = e.target.closest('.competitor-card');

                if (teamType && competitorCard) {
                    const competitorId = competitorCard.dataset.competitor;
                    let newWeakness = '';
                    let alreadyAnalyzed = analyzedCompetitors.has(`${competitorId}-${teamType}`);

                    if (alreadyAnalyzed) {
                        alert(`Вы уже использовали ${teamType} для ${gameData.competitors[competitorId].name}. Попробуйте другую тактику.`);
                        return;
                    }

                    switch (teamType) {
                        case 'smm-specialist':
                            if (competitorId === 'monolith') newWeakness = 'Низкая вовлеченность аудитории';
                            else if (competitorId === 'phoenix') newWeakness = 'Негативный PR';
                            else if (competitorId === 'chameleon') newWeakness = 'Отсутствие онлайн-присутствия';
                            break;
                        case 'data-analyst':
                            if (competitorId === 'monolith') newWeakness = 'Неэффективное распределение бюджета';
                            else if (competitorId === 'phoenix') newWeakness = 'Высокая текучесть кадров';
                            else if (competitorId === 'chameleon') newWeakness = 'Медленный рост клиентской базы';
                            break;
                        case 'hacker':
                            if (competitorId === 'monolith') newWeakness = 'Уязвимости в безопасности данных';
                            else if (competitorId === 'phoenix') newWeakness = 'Скрытые финансовые проблемы';
                            else if (competitorId === 'chameleon') newWeakness = 'Кража интеллектуальной собственности';
                            break;
                    }

                    if (newWeakness && !gameData.competitors[competitorId].weakness.includes(newWeakness)) {
                        gameData.competitors[competitorId].weakness.push(newWeakness);
                        competitorCard.querySelector('.weaknesses-list').innerHTML += `<span class="weakness-tag">${newWeakness}</span>`;
                        alert(`${gameData.competitors[competitorId].name}: Обнаружена новая слабость - ${newWeakness}!`);
                        analyzedCompetitors.add(`${competitorId}-${teamType}`);
                    } else if (newWeakness) {
                        alert(`У ${gameData.competitors[competitorId].name} уже есть эта слабость.`);
                    } else {
                        alert(`Навык ${teamType} не применим к ${gameData.competitors[competitorId].name} или уже был использован.`);
                    }

                    // Проверяем, если все конкуренты были проанализированы хотя бы одним специалистом
                    // Этот этап может быть более гибким, можно требовать 1-2 анализа на конкурента
                    if (analyzedCompetitors.size >= Object.keys(gameData.competitors).length) { // Минимум по одному анализу на конкурента
                        document.getElementById('stage3-next-button').style.display = 'block';
                    }
                }
            }

            teamItems.forEach(item => {
                item.addEventListener('dragstart', handleDragStart);
            });

            dropTargets.forEach(target => {
                target.addEventListener('dragover', handleDragOver);
                target.addEventListener('dragleave', handleDragLeave);
                target.addEventListener('drop', handleDrop);
            });

            document.getElementById('stage3-next-button').addEventListener('click', () => loadStage(currentStage + 1));
        }
    });

    questStages.push({
        content: `
            <h1>Этап 4: Нативная Реклама и Дезинформация</h1>
            <p>ИИ-Наставник: "Отличная работа! Теперь, зная их уязвимости, мы можем нанести точечные удары. Запустите рекламные кампании, чтобы ослабить позиции конкурентов."</p>
            <p>Выберите конкурента, его слабую сторону для атаки и запустите кампанию. Каждая кампания стоит 25 ресурсов.</p>
            <div id="ad-campaign-interface">
                <div class="competitor-selection">
                    ${Object.keys(gameData.competitors).map(id => `
                        <div class="competitor-ad-card" data-competitor="${id}">
                            <img src="${gameData.competitors[id].img}" alt="${gameData.competitors[id].name}">
                            <span>${gameData.competitors[id].name}</span>
                        </div>
                    `).join('')}
                </div>
                <div id="weakness-selection-container" class="hidden">
                    <h3>Выберите уязвимость для атаки:</h3>
                    <div id="weakness-options"></div>
                    <button id="launch-ad-button" class="main-button">Запустить кампанию</button>
                </div>
            </div>
            <p class="resource-counter">Ваши ресурсы: <span id="resources-display">${gameData.resources}</span></p>
            <button id="stage4-next-button" class="main-button" style="display: none; margin-top: 20px;">Продолжить</button>
        `,
        init: () => {
            const competitorCards = document.querySelectorAll('.competitor-ad-card');
            const weaknessContainer = document.getElementById('weakness-selection-container');
            const weaknessOptions = document.getElementById('weakness-options');
            const launchAdButton = document.getElementById('launch-ad-button');
            const resourcesDisplay = document.getElementById('resources-display');
            
            let selectedCompetitorId = null;
            let selectedWeakness = null;
            let targetedCompetitors = new Set();

            competitorCards.forEach(card => {
                card.addEventListener('click', () => {
                    selectedCompetitorId = card.dataset.competitor;
                    competitorCards.forEach(c => c.classList.remove('selected'));
                    card.classList.add('selected');
                    
                    const competitor = gameData.competitors[selectedCompetitorId];
                    weaknessOptions.innerHTML = competitor.weakness.map(w => 
                        `<button class="weakness-option-btn" data-weakness="${w}">${w}</button>`
                    ).join('');
                    weaknessContainer.classList.remove('hidden');

                    document.querySelectorAll('.weakness-option-btn').forEach(btn => {
                        btn.addEventListener('click', () => {
                            selectedWeakness = btn.dataset.weakness;
                             document.querySelectorAll('.weakness-option-btn').forEach(b => b.classList.remove('selected'));
                             btn.classList.add('selected');
                        });
                    });
                });
            });

            launchAdButton.addEventListener('click', () => {
                if (!selectedCompetitorId || !selectedWeakness) {
                    alert('Пожалуйста, выберите конкурента и его уязвимость для атаки.');
                    return;
                }

                let campaignCost = 25;
                if (gameData.team.includes('smm-specialist')) {
                    campaignCost = 15; // Скидка за SMM-специалиста
                    alert('Джулия (SMM-специалист) снизила стоимость кампании до 15 ресурсов!');
                }

                if (gameData.resources >= campaignCost) {
                    gameData.resources -= campaignCost;
                    resourcesDisplay.textContent = gameData.resources;
                    
                    // Эффект от кампании
                    const competitorCard = document.querySelector(`.competitor-ad-card[data-competitor="${selectedCompetitorId}"]`);
                    competitorCard.classList.add('attacked');
                    targetedCompetitors.add(selectedCompetitorId);
                    
                    alert(`Кампания против "${gameData.competitors[selectedCompetitorId].name}" по уязвимости "${selectedWeakness}" успешно запущена!`);
                    
                    // Сбрасываем выбор
                    selectedCompetitorId = null;
                    selectedWeakness = null;
                    weaknessContainer.classList.add('hidden');
                    competitorCards.forEach(c => c.classList.remove('selected'));

                    if (targetedCompetitors.size === Object.keys(gameData.competitors).length) {
                        document.getElementById('stage4-next-button').style.display = 'block';
                    }
                } else {
                    alert('Недостаточно ресурсов для запуска кампании!');
                }
            });

            document.getElementById('stage4-next-button').addEventListener('click', () => loadStage(currentStage + 1));
        }
    });

    questStages.push({
        content: `
            <h1>Этап 5: Слияния и Поглощения</h1>
            <p>ИИ-Наставник: "Конкуренты ослаблены. Пришло время для финального шага. Решите судьбу каждой компании, чтобы закрепить свое доминирование на рынке."</p>
            <p>Выберите действие для каждого конкурента. У вас <span id="resources-display-final">${gameData.resources}</span> ресурсов.</p>
            <div class="final-actions-grid">
                ${Object.keys(gameData.competitors).map(id => `
                    <div class="competitor-final-card" data-competitor="${id}">
                        <img src="${gameData.competitors[id].img}" alt="${gameData.competitors[id].name}">
                        <h3>${gameData.competitors[id].name}</h3>
                        <div class="final-action-buttons">
                            <button class="action-btn absorb" data-action="absorb" data-cost="50">Поглотить (50 res)</button>
                            <button class="action-btn bankrupt" data-action="bankrupt" data-cost="30">Обанкротить (30 res)</button>
                        </div>
                    </div>
                `).join('')}
            </div>
            <button id="finish-quest-button" class="main-button" style="display: none; margin-top: 20px;">Завершить квест</button>
        `,
        init: () => {
            const actionButtons = document.querySelectorAll('.action-btn');
            const resourcesDisplay = document.getElementById('resources-display-final');
            let finalActionsCount = 0;

            actionButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const cost = parseInt(button.dataset.cost, 10);
                    const competitorCard = button.closest('.competitor-final-card');
                    
                    if (competitorCard.classList.contains('action-taken')) {
                        alert('Вы уже приняли решение по этой компании.');
                        return;
                    }

                    if (gameData.resources >= cost) {
                        gameData.resources -= cost;
                        resourcesDisplay.textContent = gameData.resources;

                        competitorCard.classList.add('action-taken');
                        competitorCard.querySelector('.final-action-buttons').innerHTML = `<p class="action-result">${button.dataset.action === 'absorb' ? 'Поглощен' : 'Обанкрочен'}</p>`;
                        
                        finalActionsCount++;

                        if (finalActionsCount === Object.keys(gameData.competitors).length) {
                            document.getElementById('finish-quest-button').style.display = 'block';
                        }
                    } else {
                        alert('Недостаточно ресурсов для этого действия!');
                    }
                });
            });

            document.getElementById('finish-quest-button').addEventListener('click', () => endQuest());
        }
    });

    // Функция завершения квеста
    function endQuest() {
        questContent.innerHTML = `
            <div class="quest-end-screen">
                <h1>Триумф!</h1>
                <p>Вы успешно нейтрализовали всех конкурентов и стали лидером рынка! Ваши стратегические решения и грамотное управление ресурсами привели вас к победе.</p>
                <p>Это было лишь введение в мир большой игры. Настоящие битвы требуют более глубоких знаний.</p>
                <h2>Готовы стать мастером конкурентной борьбы?</h2>
                <p>Наш полный курс "Мастер Конкурентной Борьбы" даст вам все инструменты для доминирования на любом рынке. Вы научитесь техникам, которые мы не могли показать даже в этой продвинутой симуляции.</p>
                <button id="buy-course-button" class="main-button">Получить доступ к арсеналу</button>
            </div>
        `;
        backButton.style.display = 'none';
        mainMenuButton.style.top = '10px'; // Поднять кнопку меню, так как кнопка "назад" скрыта

        document.getElementById('buy-course-button').addEventListener('click', () => {
            // Предполагается, что у вас есть функция для перехода к продуктам
            // в основном файле quests.js или вы можете просто перенаправить.
            // Например, можно сымитировать клик по продукту, чтобы открыть его.
            alert('Переход на страницу покупки курса! (симуляция)');
            // window.location.href = '../index.html#products-section'; // Пример перехода
        });
    }

    // Обработчики событий для кнопок навигации
    startQuestBtn.addEventListener('click', () => {
        startQuestBtn.style.display = 'none';
        loadStage(0);
    });

    backButton.addEventListener('click', () => {
        loadStage(currentStage - 1);
    });

    mainMenuButton.addEventListener('click', () => {
        window.location.href = '../quests.html'; // Или другой путь к главному меню
    });

    // Инициализация первого экрана
    updateNavigationButtons();
});
