/* eslint-disable no-unused-vars */
const Engine = ((data, ui) => {
    let gameState = {};

    const init = () => {
        gameState = {
            currentStageId: 'recon',
            history: [],
            playerCapital: 1000,
            competitor: { ...data.competitors[0] }, // Start with the first competitor
            knownWeakness: null,
            hiredSpecialist: null,
        };
        loadStage(gameState.currentStageId);
        ui.switchScreen('game');
    };

    const loadStage = (stageId) => {
        const stage = data.stages.find(s => s.id === stageId);
        if (!stage) {
            console.error(`Stage ${stageId} not found!`);
            return;
        }

        if (gameState.currentStageId !== stageId) {
            gameState.history.push(gameState.currentStageId);
        }
        gameState.currentStageId = stageId;
        
        // Call the appropriate UI render function based on stage ID
        switch(stageId) {
            case 'recon':
                ui.renderReconStage(stage, gameState.competitor, (weakness) => {
                    gameState.knownWeakness = weakness;
                    setTimeout(() => loadStage('hire'), 1500);
                });
                break;
            case 'hire':
                 ui.renderHireStage(stage, data.specialists, (specialistId) => {
                    gameState.hiredSpecialist = data.specialists.find(s => s.id === specialistId);
                    setTimeout(() => loadStage('exploit'), 1500);
                });
                break;
            case 'exploit':
                const specialist = gameState.hiredSpecialist;
                ui.renderExploitStage(stage, gameState.competitor, data.actions, specialist, (actionId) => {
                    handleExploitAction(actionId);
                });
                break;
             case 'sabotage':
                ui.renderSabotageStage(stage, () => {
                    // Final blow
                    setTimeout(() => updateHealth(0), 1500);
                });
                break;
        }
    };
    
    const goBack = () => {
        const lastStageId = gameState.history.pop();
        if (lastStageId && lastStageId !== gameState.currentStageId) {
            loadStage(lastStageId);
        }
    };

    const updateHealth = (newHealth) => {
        gameState.competitor.health = Math.max(0, newHealth);
        ui.updateHealthBar(gameState.competitor.health);
        if (gameState.competitor.health <= 0) {
            endGame(true);
        }
    };

    const handleExploitAction = (actionId) => {
        if (!actionId) return;
        const action = data.actions[actionId];
        const competitor = gameState.competitor;

        if (gameState.knownWeakness === action.type) {
            ui.showFeedback('Критический удар! Вы попали в уязвимость.', true);
            updateHealth(competitor.health - 50);
        } else {
            ui.showFeedback('Неэффективно. Удар пришелся по сильной стороне.', false);
            updateHealth(competitor.health - 10);
        }
        
        // For now, move to next stage after one action
        if (gameState.competitor.health > 0) {
             setTimeout(() => loadStage('sabotage'), 1500);
        }
    };

    const endGame = (isWin) => {
        if (isWin) {
            // Populate end screen data
        }
        ui.switchScreen('end');
    };

    return {
        init,
        goBack
    };

})(QUEST_DATA, UI);
