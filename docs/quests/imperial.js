document.addEventListener('DOMContentLoaded', async () => {
  const App = {
    gameData: null,
    dragged: null,
    
    async init() {
      this.initTelegram();
      
      await this.loadGameData();
      
      const appElement = document.getElementById('app');
      GameCore.init(this.gameData);
      UI.init(appElement, this.gameData, {
        // callbacks can be passed here
      });

      this.router();
      this.attachEventListeners();
    },

    async loadGameData() {
        try {
            const response = await fetch('data/imperial-game.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.gameData = await response.json();
        } catch (e) {
            console.error("Could not load game data:", e);
            // Handle error, maybe show a message to the user
        }
    },

    initTelegram() {
      try {
        const tg = window.Telegram.WebApp;
        tg.ready();
        tg.expand();
        // Theme adaptation
        const root = document.documentElement;
        const theme = tg.themeParams;
        if (theme) {
            root.style.setProperty('--bg', theme.bg_color || '#0B0F1A');
            root.style.setProperty('--text', theme.text_color || '#E8ECF1');
            root.style.setProperty('--card', theme.secondary_bg_color || 'rgba(30, 41, 59, 0.5)');
        }
        this.tg = tg;
      } catch (e) {
        console.warn("Telegram WebApp is not available.");
      }
    },
    
    router() {
        const stage = GameCore.state.currentStage;
        switch(stage) {
            case 0:
                this.showWelcome();
                break;
            case 1:
                this.showStage1();
                break;
            // ... add cases for other stages
            default:
                // For now, loop back to start
                GameCore.resetState();
                this.showWelcome();
        }
    },
    
    showWelcome() {
        UI.render('welcome');
        if (this.tg) {
            this.tg.MainButton.setText(this.gameData.ui_text.welcome_button);
            this.tg.MainButton.show();
            this.tg.MainButton.onClick(() => {
                GameCore.completeStage(0);
                this.showOnboarding(0);
                this.tg.MainButton.offClick();
            });
        }
    },
    
    showOnboarding(step) {
        const slides = this.gameData.ui_text.onboarding_slides;
        if (step >= slides.length) {
            this.router(); // onboarding finished, go to stage 1
            return;
        }
        UI.render('onboarding', { step });
        if (this.tg) {
            this.tg.MainButton.setText("Далее");
            this.tg.MainButton.show();
            this.tg.MainButton.onClick(() => {
                this.tg.MainButton.offClick();
                this.showOnboarding(step + 1);
            });
        }
    },
    
    showStage1() {
      UI.render('stage1', {
        ...this.gameData.stage1_data.columns,
        initialTrust: GameCore.state.metrics.trust
      });
       if (this.tg) {
            this.tg.MainButton.setText("Подтвердить заголовок");
            // MainButton is shown/hidden based on state
       }
    },
    
    attachEventListeners() {
      const app = document.getElementById('app');
      
      // Drag and Drop
      app.addEventListener('dragstart', e => {
        if (e.target.classList.contains('draggable')) {
          this.dragged = e.target;
          e.target.classList.add('dragging');
        }
      });
      
      app.addEventListener('dragend', e => {
        if (e.target.classList.contains('draggable')) {
          e.target.classList.remove('dragging');
          this.dragged = null;
        }
      });
      
      app.addEventListener('dragover', e => {
        e.preventDefault();
        const dropzone = e.target.closest('.hook-dropzone');
        if (dropzone) {
          dropzone.classList.add('over');
        }
      });
      
      app.addEventListener('dragleave', e => {
        const dropzone = e.target.closest('.hook-dropzone');
        if (dropzone) {
          dropzone.classList.remove('over');
        }
      });
      
      app.addEventListener('drop', e => {
        e.preventDefault();
        const dropzone = e.target.closest('.hook-dropzone');
        if (dropzone && this.dragged) {
          dropzone.appendChild(this.dragged.cloneNode(true));
          this.dragged.style.display = 'none'; // Mark as used
          dropzone.classList.remove('over');
        }
      });
      
      // Sliders
       app.addEventListener('input', e => {
           if(e.target.type === 'range') {
               this.updateLiveMetrics();
           }
       });
    },
    
    updateLiveMetrics() {
        const sliders = {
            value: parseFloat(document.getElementById('value-slider')?.value || 0),
            clarity: parseFloat(document.getElementById('clarity-slider')?.value || 0),
            ethics: parseFloat(document.getElementById('ethics-slider')?.value || 0),
        };
        const virality = GameCore.calculateHookVirality(sliders);
        
        document.querySelector('#virality-display .value').textContent = `${virality}%`;
        document.querySelector('#trust-display .value').textContent = `${GameCore.state.metrics.trust}%`;
    }
  };
  
  App.init();
});
