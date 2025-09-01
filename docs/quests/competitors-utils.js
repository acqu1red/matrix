import { QUEST_DATA, CHARACTERS } from './competitors-data.js';

// Screens & Containers
const loaderScreen = document.getElementById('loader');
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const endScreen = document.getElementById('end-screen');
const stageContainer = document.getElementById('stage-container');
const interactionFooter = document.getElementById('interaction-footer');

// Buttons
const startBtn = document.getElementById('start-btn');
const ctaBtn = document.getElementById('cta-btn');
const backBtn = document.getElementById('back-btn');
const mainMenuBtn = document.getElementById('main-menu-btn');

// Game UI Elements
const progressBar = document.getElementById('progress-bar');
const budgetValueEl = document.getElementById('budget-value');
const influenceValueEl = document.getElementById('influence-value');
const finalBudgetEl = document.getElementById('final-budget');
const finalInfluenceEl = document.getElementById('final-influence');

let currentStageIndex = 0;
let userBudget = 1000;
let userInfluence = 0;
let stageHistory = []; // To support the back button

function switchScreen(screen) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    screen.classList.add('active');
}

function updateProgress(currentStageIndex, totalStages, userBudget, userInfluence, progressBar, budgetValueEl, influenceValueEl) {
    const progress = (currentStageIndex / totalStages) * 100;
    progressBar.style.width = `${progress}%`;
    budgetValueEl.textContent = `$${userBudget}`;
    influenceValueEl.textContent = userInfluence;
}

function showFeedback(message, isSuccess, container) {
    const feedbackEl = document.createElement('div');
    feedbackEl.className = `feedback-popup ${isSuccess ? 'success' : 'failure'}`;
    feedbackEl.textContent = message;
    container.appendChild(feedbackEl);

    setTimeout(() => {
        feedbackEl.remove();
    }, 2000);
}

function getStageIndexById(id, stages) {
    return stages.findIndex(stage => stage.id === id);
}

function navigateToHome() {
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.close(); // Close mini app to return to main Telegram view
    } else {
        window.location.href = '../quests.html'; // Fallback for browser testing
    }
}

export { switchScreen, updateProgress, showFeedback, getStageIndexById, navigateToHome };
