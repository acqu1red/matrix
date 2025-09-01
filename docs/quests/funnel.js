document.addEventListener('DOMContentLoaded', () => {
    // Screens
    const loaderScreen = document.getElementById('loader');
    const startScreen = document.getElementById('start-screen');
    const gameScreen = document.getElementById('game-screen');
    const endScreen = document.getElementById('end-screen');

    // Buttons
    const startBtn = document.getElementById('start-btn');
    const ctaBtn = document.getElementById('cta-btn');

    // Game elements
    const scenarioContainer = document.getElementById('scenario-container');
    const finalScoreEl = document.getElementById('final-score');

    let currentScenarioIndex = 0;
    let score = 0;

    const scenarios = [
        {
            text: "Ваш коллега сомневается в успехе вашего нового проекта и отказывается помогать. Как вы его убедите?",
            options: [
                { text: "Привести логические доводы и статистику успеха подобных проектов.", correct: false, feedback: "Логика важна, но часто эмоции сильнее. Он не почувствовал себя частью идеи." },
                { text: "Сказать, что его вклад будет ключевым для успеха, и вы не справитесь без его уникального опыта.", correct: true, feedback: "Отлично! Вы использовали лесть и подчеркнули его значимость, это мощный приём." },
                { text: "Пригрозить, что пожалуетесь начальству на его отказ от сотрудничества.", correct: false, feedback: "Угрозы вызывают только сопротивление и враждебность. Это путь к провалу." }
            ]
        },
        {
            text: "Вам нужно продать клиенту дорогой продукт, в котором он не уверен. Что вы сделаете в первую очередь?",
            options: [
                { text: "Сразу предложить скидку, чтобы сделать предложение более привлекательным.", correct: false, feedback: "Скидка обесценивает продукт. Сначала нужно создать ценность." },
                { text: "Рассказать историю успеха другого клиента, который решил похожую проблему с помощью вашего продукта.", correct: true, feedback: "Блестяще! Социальное доказательство и истории — один из самых сильных инструментов влияния." },
                { text: "Начать перечислять все технические характеристики продукта.", correct: false, feedback: "Люди покупают не характеристики, а решение своих проблем и эмоции. Говорите на языке выгод." }
            ]
        }
        // ... more scenarios can be added here
    ];

    function switchScreen(screen) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        screen.classList.add('active');
    }

    function startGame() {
        currentScenarioIndex = 0;
        score = 0;
        switchScreen(gameScreen);
        showScenario(currentScenarioIndex);
    }

    function showScenario(index) {
        scenarioContainer.innerHTML = '';
        const scenario = scenarios[index];

        const scenarioEl = document.createElement('div');
        scenarioEl.classList.add('scenario');

        scenarioEl.innerHTML = `
            <p class="scenario-text">${scenario.text}</p>
            <div class="options-container">
                ${scenario.options.map((opt, i) => `<button class="option-btn" data-correct="${opt.correct}" data-feedback="${opt.feedback}">${opt.text}</button>`).join('')}
            </div>
            <p id="feedback-text"></p>
        `;

        scenarioContainer.appendChild(scenarioEl);

        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.addEventListener('click', handleOptionClick);
        });
    }

    function handleOptionClick(e) {
        const selectedBtn = e.target;
        const isCorrect = selectedBtn.dataset.correct === 'true';
        const feedback = selectedBtn.dataset.feedback;

        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.disabled = true; // Disable all buttons after choice
            if (btn.dataset.correct === 'true') {
                btn.classList.add('correct');
            } else {
                btn.classList.add('incorrect');
            }
        });

        const feedbackEl = document.getElementById('feedback-text');
        feedbackEl.textContent = feedback;

        if (isCorrect) {
            score++;
        }

        setTimeout(() => {
            currentScenarioIndex++;
            if (currentScenarioIndex < scenarios.length) {
                showScenario(currentScenarioIndex);
            } else {
                endGame();
            }
        }, 3000); // Wait 3 seconds before next scenario
    }

    function endGame() {
        finalScoreEl.textContent = `${score} из ${scenarios.length}`;
        switchScreen(endScreen);
    }

    // Event Listeners
    startBtn.addEventListener('click', startGame);
    ctaBtn.addEventListener('click', () => {
        // Redirect to the main product page or trigger a telegram event
        console.log("Redirecting to purchase...");
        // Example for redirecting if it's a web page
        // window.location.href = 'https://your-product-page.com';
        
        // Or if you need to close the mini app
        if (window.Telegram && window.Telegram.WebApp) {
            window.Telegram.WebApp.close();
        }
    });

    // Initial load
    setTimeout(() => {
        switchScreen(startScreen);
    }, 1500); // Simulate loading time
});
