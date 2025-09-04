const GameCore = {
  state: {},

  init(gameData) {
    this.gameData = gameData;
    this.loadState();
    if (!this.state.metrics) {
      this.resetState();
    }
  },

  resetState() {
    this.state = {
      currentStage: 0,
      metrics: { ...this.gameData.game_config.initial_metrics },
      history: [],
    };
    this.saveState();
  },

  saveState() {
    try {
      localStorage.setItem('imperialGameState', JSON.stringify(this.state));
    } catch (e) {
      console.error("Failed to save state:", e);
    }
  },

  loadState() {
    try {
      const savedState = localStorage.getItem('imperialGameState');
      if (savedState) {
        this.state = JSON.parse(savedState);
      } else {
        this.state = {};
      }
    } catch (e) {
      console.error("Failed to load state:", e);
      this.state = {};
    }
  },

  updateMetric(metric, change) {
    if (this.state.metrics[metric] !== undefined) {
      this.state.metrics[metric] += change;
      // Clamp values
      if (metric === 'trust') {
        this.state.metrics.trust = Math.max(0, Math.min(100, this.state.metrics.trust));
      }
    }
    this.saveState();
  },
  
  completeStage(stageIndex, data) {
      if(this.state.currentStage === stageIndex) {
          this.state.currentStage++;
          this.state.history.push({ stage: stageIndex, data });
          this.saveState();
      }
  },

  getFinalTitle() {
      const { influence, trust, reach, revenue } = this.state.metrics;
      const titles = this.gameData.final_titles;

      if (trust < 30 && reach > 1000) return titles.clickbait_king;
      if (trust > 75 && influence > 50) return titles.value_magnet;
      if (revenue > 800 && trust > 40) return titles.monetization_diplomat;
      
      return titles.trend_opportunist;
  },

  // Stage-specific logic
  calculateHookVirality(sliders) {
    const { value, clarity, ethics } = sliders;
    let score = 50; // Base score
    
    // Value vs Hype
    score += value * 20;
    
    // Clarity vs Mystery
    score += clarity > 0 ? clarity * 10 : Math.abs(clarity) * 5;

    // Ethics vs Clickbait
    score += ethics * 15;
    if (ethics < -0.5) {
        score *= 1.5; // Clickbait boost
        this.updateMetric('trust', this.gameData.game_config.balance.trust_penalty_clickbait * -1);
    } else if (ethics > 0.5) {
        this.updateMetric('trust', this.gameData.game_config.balance.trust_reward_value);
    }

    return Math.round(Math.max(0, Math.min(100, score)));
  }
};

window.GameCore = GameCore;
