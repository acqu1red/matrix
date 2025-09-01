const QUEST_DATA = {
    totalStages: 8, // Updated total stages count
    stages: [
        // --- STAGE 0: Introduction ---
        {
            id: 'intro',
            type: 'dialogue',
            character: {
                name: 'Наставник, Гуру Рынка',
                portrait: '../assets/photovideo/kazik.mp3.png' // Placeholder
            },
            dialogue: "Добро пожаловать, будущий монополист. Рынок - это поле битвы, и сегодня мы научимся выявлять слабые точки врага. Твоя первая цель: аналитик, который владеет ценной информацией.",
            objective: "Проанализируйте конкурента 'TechCorp' и выявите его главную слабость.",
            interaction: {
                type: 'next-button',
                buttonText: 'Продолжить',
                nextStage: 'analysis_1'
            }
        },
        // --- STAGE 1: Competitor Analysis (Drag & Drop) ---
        {
            id: 'analysis_1',
            type: 'competitor-analysis',
            competitor: {
                name: 'TechCorp',
                logo: '../assets/photovideo/wtf.png', // Placeholder
                description: 'Крупная технологическая корпорация, лидер рынка, но медленная в инновациях.'
            },
            objective: "Определите главную уязвимость TechCorp, перетащив подходящую карту.",
            analysisCards: [
                { id: 'slow_innovation', name: 'Медленные инновации', icon: '🐌', cost: 50 },
                { id: 'high_prices', name: 'Высокие цены', icon: '💸', cost: 30 },
                { id: 'poor_support', name: 'Плохая поддержка', icon: '📞', cost: 20 }
            ],
            correctWeakness: 'slow_innovation',
            responses: {
                slow_innovation: { budgetChange: -50, influenceChange: 100, feedback: "Верно! Медлительность - их ахиллесова пята. +100 Влияния!", nextStage: 'hiring_1'},
                high_prices: { budgetChange: -30, influenceChange: -20, feedback: "Не совсем. Цены высоки, но их аудитория лояльна. -20 Влияния.", nextStage: 'hiring_1'},
                poor_support: { budgetChange: -20, influenceChange: -10, feedback: "Почти. Поддержка важна, но не критична для такого гиганта. -10 Влияния.", nextStage: 'hiring_1'}
            }
        },
        // --- STAGE 2: Hiring Allies (Button Choice) ---
        {
            id: 'hiring_1',
            type: 'dialogue',
            character: {
                name: 'Кадровик, Теневой Рекрутер',
                portrait: '../assets/photovideo/ruletka2.png' // Placeholder
            },
            dialogue: "Теперь, когда мы знаем их слабость, нужно найти того, кто сможет использовать эту информацию. У меня есть несколько кандидатов.",
            objective: "Выберите специалиста, который поможет подорвать позиции TechCorp.",
            interaction: {
                type: 'button-choice',
                options: [
                    { text: "Нанять Инженера-инноватора ($200)", cost: 200, influence: 150, correct: true, feedback: "Отличный выбор! Он ускорит наши инновации и сделает TechCorp устаревшей. +150 Влияния, -$200." },
                    { text: "Нанять Маркетолога-демагога ($100)", cost: 100, influence: 50, correct: false, feedback: "Он хорош, но для инновационного гиганта нужен более точечный удар. +50 Влияния, -$100." },
                    { text: "Нанять Юриста-переговорщика ($150)", cost: 150, influence: -50, correct: false, feedback: "Неподходящий момент для юридических баталий. -50 Влияния, -$150." }
                ],
                nextStage: 'native_ad_1'
            }
        },
        // --- STAGE 3: Native Advertising (Mini-Game) ---
        {
            id: 'native_ad_1',
            type: 'native-ad',
            objective: "Запустите нативную рекламную кампанию, чтобы переманить клиентов TechCorp.",
            interaction: {
                elements: {
                    headlines: [
                        { text: "Будущее здесь: зачем ждать завтра?", type: 'positive' },
                        { text: "Ваш текущий поставщик устарел?", type: 'negative' },
                        { text: "Инновации, которые вы заслужили.", type: 'positive' }
                    ],
                    bodies: [
                        { text: "Узнайте, как наши решения опережают рынок на годы. Без компромиссов.", type: 'positive' },
                        { text: "Если вы не меняетесь, вы отстаете. Сделайте выбор в пользу прогресса.", type: 'negative' }
                    ],
                    callsToAction: [
                        { text: "Попробовать первыми", type: 'positive' },
                        { text: "Узнать больше", type: 'neutral' }
                    ]
                },
                solution: {
                    headlineType: 'positive',
                    bodyType: 'positive',
                    callToActionType: 'positive'
                },
                feedback: {
                    success: "Ваша реклама сработала идеально! Клиенты TechCorp переходят к вам. +200 Влияния!",
                    failure: "Реклама не произвела впечатления. Конкурент не заметил удара. -100 Бюджета."
                },
                score: { success: 200, failure: -100 },
                nextStage: 'hiring_2' // New stage after this
            }
        },
        // --- STAGE 4: Hiring Specialist (New Stage - Complex decision) ---
        {
            id: 'hiring_2',
            type: 'dialogue',
            character: {
                name: 'Рекрутер, Искатель Талантов',
                portrait: '../assets/photovideo/strelka.png' // Placeholder
            },
            dialogue: "Мы добились успеха с TechCorp. Теперь нужно закрепиться и расширить влияние. У нас есть бюджет на нового специалиста, но выбор непрост.",
            objective: "Выберите, кого нанять для дальнейшего укрепления позиций.",
            interaction: {
                type: 'button-choice',
                options: [
                    { text: "'Сетевик' (открывает новые каналы, $300, +250 Влияния)", cost: 300, influence: 250, correct: true, feedback: "'Сетевик' - это ключ к новым возможностям! +250 Влияния, -$300."},
                    { text: "'Аналитик данных' (глубокий анализ рынка, $250, +100 Влияния)", cost: 250, influence: 100, correct: false, feedback: "Полезно, но сейчас нужна агрессивная экспансия, а не только анализ. +100 Влияния, -$250."},
                    { text: "'Креативщик' (вирусный контент, $200, +150 Влияния)", cost: 200, influence: 150, correct: false, feedback: "Хороший выбор, но 'Сетевик' откроет нам больше дверей. +150 Влияния, -$200."}
                ],
                nextStage: 'market_sabotage_1' // New stage after this
            }
        },
        // --- STAGE 5: Market Sabotage (New Stage) ---
        {
            id: 'market_sabotage_1',
            type: 'dialogue',
            character: {
                name: 'Теневой Агент',
                portrait: '../assets/photovideo/wtf2.png' // Placeholder
            },
            dialogue: "Наш новый конкурент, 'FastLaunch', слишком быстро набирает обороты. Мы не можем позволить им расти. Нужно действовать жестко.",
            objective: "Выберите стратегию саботажа, чтобы подорвать их репутацию.",
            interaction: {
                type: 'button-choice',
                options: [
                    { text: "Запустить волну негативных отзывов ($150, -100 Влияния у FastLaunch)", cost: 150, influence: 100, correct: true, feedback: "Идеально! Репутация FastLaunch пошатнулась. +100 Влияния для вас, -$150."},
                    { text: "'Переманить' их ключевых сотрудников ($400, -200 Влияния у FastLaunch)", cost: 400, influence: 50, correct: false, feedback: "Эффективно, но слишком дорого для текущей ситуации. +50 Влияния, -$400."},
                    { text: "Распространить слухи о финансовых проблемах ($100, -50 Влияния у FastLaunch)", cost: 100, influence: 70, correct: false, feedback: "Неплохо, но не так эффективно, как прямые отзывы. +70 Влияния, -$100."}
                ],
                nextStage: 'market_expansion_1' // New stage after this
            }
        },
        // --- STAGE 6: Market Expansion (New Stage) ---
        {
            id: 'market_expansion_1',
            type: 'dialogue',
            character: {
                name: 'Визионер, Стратег Будущего',
                portrait: '../assets/photovideo/ostrov.png' // Placeholder
            },
            dialogue: "Конкуренты ослаблены, но рынок не терпит пустоты. Пришло время захватить новые ниши. У нас есть несколько вариантов.",
            objective: "Выберите перспективную нишу для расширения вашей монополии.",
            interaction: {
                type: 'button-choice',
                options: [
                    { text: "Выйти на рынок Восточной Европы ($500, +300 Влияния)", cost: 500, influence: 300, correct: true, feedback: "Отлично! Восточная Европа открывает огромные возможности. +300 Влияния, -$500."},
                    { text: "Запустить стартап в новой отрасли ($700, +400 Влияния)", cost: 700, influence: 400, correct: false, feedback: "Слишком рискованно и дорого для текущего момента. +400 Влияния, -$700."},
                    { text: "Укрепить позиции на текущем рынке ($200, +100 Влияния)", cost: 200, influence: 100, correct: false, feedback: "Безопасно, но медленно. Сейчас время для более агрессивной экспансии. +100 Влияния, -$200."}
                ],
                nextStage: 'crisis_management_1' // New stage after this
            }
        },
        // --- STAGE 7: Crisis Management (New Stage) ---
        {
            id: 'crisis_management_1',
            type: 'dialogue',
            character: {
                name: 'Кризисный Менеджер',
                portrait: '../assets/photovideo/mulacoin.png' // Placeholder
            },
            dialogue: "Наш успех привлек внимание. В медиа появились слухи о нечестной игре. Репутация под угрозой!",
            objective: "Срочно отреагируйте на кризис, минимизируя потери влияния.",
            interaction: {
                type: 'button-choice',
                options: [
                    { text: "Опубликовать опровержение и предоставить доказательства ($200, +200 Влияния)", cost: 200, influence: 200, correct: true, feedback: "Репутация спасена! Честность - лучшая политика, даже в мире монополий. +200 Влияния, -$200."},
                    { text: "Игнорировать слухи, пусть утихнут сами ($0, -100 Влияния)", cost: 0, influence: -100, correct: false, feedback: "Пассивность - это проигрыш. Слухи разрастаются, теряем влияние. -100 Влияния, -$0."},
                    { text: "Найти и дискредитировать источник слухов ($300, +50 Влияния, риск)", cost: 300, influence: 50, correct: false, feedback: "Слишком рискованно. Выиграли немного, но могли потерять все. +50 Влияния, -$300."}
                ],
                nextStage: 'outro'
            }
        },
        // --- STAGE 8: Outro ---
        {
            id: 'outro',
            type: 'dialogue',
            character: {
                name: 'Наставник, Гуру Рынка',
                portrait: '../assets/photovideo/kazik.mp3.png' // Placeholder
            },
            dialogue: "Поздравляю! Вы не только выявили слабости конкурентов, но и успешно подорвали их позиции. Рынок теперь в ваших руках. Но истинное господство требует постоянного развития.",
            objective: "Вы завершили тренинг по конкурентному анализу. Готовы ли вы стать Абсолютным Монополистом?",
            interaction: {
                type: 'end-game',
                buttonText: 'Завершить Тренинг'
            }
        }
    ]
};

const CHARACTERS = {
    // Define characters and their portraits here if needed for broader use
    // Currently integrated directly into QUEST_DATA
};

export { QUEST_DATA, CHARACTERS };
