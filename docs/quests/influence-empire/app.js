/**
 * Main Application Logic
 */
document.addEventListener('DOMContentLoaded', () => {
    
    const App = {
        init() {
            this.fetchGameData()
                .then(gameData => {
                    this.gameData = gameData;
                    this.loc = this.gameData.localization.ru;
                    
                    try {
                        this.tg = window.Telegram.WebApp;
                        this.tg.ready();
                    } catch (e) {
                        console.warn("Telegram WebApp is not available.");
                        this.tg = null;
                    }

                    Core.init(this.gameData);
                    UI.init('#app', this.gameData, this.tg);

                    document.addEventListener('core:stateUpdate', (e) => this.render(e.detail));
                    
                    this.render(Core.getState());
                })
                .catch(error => console.error("Failed to load game data:", error));
        },
        
        async fetchGameData() {
            // In a real scenario, we would fetch. For this setup, we assume it's loaded via script tag.
            // This is a workaround to get the JSON data loaded via a script tag.
            const response = await fetch('./data/game.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        },

        render(state) {
            UI.renderHUD(state.metrics);

            let stageHtml = '';
            switch(state.currentStage) {
                case 0: stageHtml = this.renderOnboarding(); break;
                case 1: stageHtml = this.renderStage1(); break;
                case 2: stageHtml = this.renderStage2(); break;
                case 3: stageHtml = this.renderStage3(); break;
                case 4: stageHtml = this.renderStage4(); break;
                case 5: stageHtml = this.renderFinalScreen(); break; // Final screen
                default: Core.reset();
            }
            
            const stageContainer = document.getElementById('stage-container');
            if(stageContainer) {
                stageContainer.innerHTML = stageHtml;
            } else {
                UI.render(`<div id="stage-container">${stageHtml}</div>`);
            }
            
            this.postRender(state);
        },
        
        postRender(state) {
            // Attach event listeners or run code after a stage is rendered
            switch(state.currentStage) {
                case 1: this.setupStage1(); break;
                // ... setup for other stages
            }
        },

        renderOnboarding() {
            return `
                <div class="onboarding">
                    <h1>${this.loc.onboarding_title}</h1>
                    <!-- Onboarding slides would go here -->
                    <button id="start-btn">${this.loc.start_button}</button>
                </div>
            `;
            // In a real app, you'd add listeners here.
        },

        renderStage1() {
            const { triggers, themes, promises } = this.gameData.stage1;
            return `
                <div class="stage-container">
                    <h2 class="stage-title">${this.loc.stage_1_title}</h2>
                    <p class="stage-goal">${this.loc.stage_1_goal}</p>
                    <div class="hook-assembly drop-zone" id="hook-assembly-zone">
                        Соберите заголовок здесь
                    </div>
                    <div class="hook-factory-grid">
                        <div class="hook-column">
                            <h3 class="column-title">Триггер</h3>
                            ${triggers.map(t => `<div class="card hook-card" data-type="trigger">${t}</div>`).join('')}
                        </div>
                        <div class="hook-column">
                             <h3 class="column-title">Тема</h3>
                            ${themes.map(t => `<div class="card hook-card" data-type="theme">${t}</div>`).join('')}
                        </div>
                        <div class="hook-column">
                             <h3 class="column-title">Обещание</h3>
                            ${promises.map(p => `<div class="card hook-card" data-type="promise">${p}</div>`).join('')}
                        </div>
                    </div>
                </div>
            `;
        },
        
        setupStage1() {
            UI.makeDraggable('.hook-card', {
                itemSelector: '.hook-card',
                onDrop: (draggedEl, dropZone) => {
                    const type = draggedEl.dataset.type;
                    const text = draggedEl.textContent;
                    // Logic to update the assembly zone
                    dropZone.textContent += ` ${text}`;
                    draggedEl.style.display = 'none'; // Hide after drop
                    UI.hapticFeedback('light');
                    
                    // Check if all parts are dropped to proceed
                }
            });
        },
        
        // Placeholder for other stages
        renderStage2() { return `<div><h2>${this.loc.stage_2_title}</h2><p>Work in Progress</p></div>`; },
        renderStage3() { return `<div><h2>${this.loc.stage_3_title}</h2><p>Work in Progress</p></div>`; },
        renderStage4() { return `<div><h2>${this.loc.stage_4_title}</h2><p>Work in Progress</p></div>`; },
        renderFinalScreen() {
             const title = Core.getFinalTitle();
             return `<div><h1>${title}</h1></div>`;
        },
    };

    App.init();

    // Temporary: Add listener for start button since full onboarding isn't built yet
    document.body.addEventListener('click', e => {
        if (e.target.id === 'start-btn') {
            Core.setStage(1);
        }
    });
});
