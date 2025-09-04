/**
 * Core Game Engine
 * Manages game state, player metrics, and saving/loading.
 */
const Core = {
    state: {},
    
    init(gameData) {
        this.gameData = gameData;
        this.load();
        if (!this.state.metrics) {
            this.reset();
        }
        console.log("Core Engine Initialized", this.state);
    },

    getState() {
        return this.state;
    },

    updateMetric(metric, value) {
        if (this.state.metrics.hasOwnProperty(metric)) {
            this.state.metrics[metric] += value;
            this.state.metrics[metric] = Math.max(0, this.state.metrics[metric]); // Cannot be negative
        }
        this.save();
        document.dispatchEvent(new CustomEvent('core:stateUpdate', { detail: this.state }));
    },

    setStage(stage) {
        this.state.currentStage = stage;
        this.save();
        document.dispatchEvent(new CustomEvent('core:stateUpdate', { detail: this.state }));
    },
    
    calculateVirality(sliders) {
        // Simple formula based on sliders
        let score = 50;
        score += (sliders.hype - sliders.value) * this.gameData.balance.virality_hype_multiplier * 10;
        score += (sliders.mystery - sliders.clarity) * 5;
        score -= (sliders.ethics - sliders.clickbait) * 15;
        return Math.round(Math.max(10, Math.min(100, score)));
    },

    getFinalTitle() {
        const { trust, reach } = this.state.metrics;
        const titles = this.gameData.final_titles;

        if (trust >= titles[0].min_trust) return titles[0].title;
        if (reach >= titles[1].min_reach && trust >= titles[1].min_trust) return titles[1].title;
        if (trust <= titles[2].max_trust) return titles[2].title;
        
        return titles.find(t => t.default).default;
    },

    save() {
        try {
            localStorage.setItem('influenceEmpireSave', JSON.stringify(this.state));
        } catch (e) {
            console.error("Failed to save game state:", e);
        }
    },

    load() {
        try {
            const savedState = localStorage.getItem('influenceEmpireSave');
            if (savedState) {
                this.state = JSON.parse(savedState);
            } else {
                this.state = {};
            }
        } catch (e) {
            console.error("Failed to load game state:", e);
            this.state = {};
        }
    },
    
    reset() {
        this.state = {
            currentStage: 0, // 0 is onboarding
            metrics: { ...this.gameData.initialMetrics }
        };
        this.save();
        document.dispatchEvent(new CustomEvent('core:stateUpdate', { detail: this.state }));
    }
};

window.Core = Core;
