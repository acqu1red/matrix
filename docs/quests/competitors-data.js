const QUEST_DATA = {
    competitors: [
        { 
            id: 'innovatech',
            name: 'InnovaTech', 
            health: 100, 
            weakness: 'pr', // 'pr', 'finance', 'tech'
            portrait: '../assets/photovideo/prise.png',
            description: 'Лидер рынка с прорывной технологией, но их CEO недавно попал в скандал.'
        },
        { 
            id: 'globex',
            name: 'Globex Corp', 
            health: 120, 
            weakness: 'finance',
            portrait: '../assets/photovideo/ostrov.png',
            description: 'Финансовый гигант, скупающий стартапы. Их ахиллесова пята - огромные долги.'
        }
    ],
    stages: [
        {
            id: 'recon',
            title: 'Разведка',
            description: 'Найдите уязвимость конкурента, анализируя внутренние документы.'
        },
        {
            id: 'hire',
            title: 'Вербовка',
            description: 'Наймите специалиста, который поможет вам в борьбе. Каждый из них силен в своей области.'
        },
        {
            id: 'exploit',
            title: 'Эксплуатация',
            description: 'Используйте свои ресурсы и специалистов, чтобы нанести удар по слабой точке конкурента.'
        },
        {
            id: 'sabotage',
            title: 'Саботаж',
            description: 'Финальный удар. Проведите операцию, которая окончательно обанкротит соперника.'
        }
    ],
    actions: {
        'pr_campaign': { name: 'Черный PR', cost: 30, icon: '📢', type: 'pr', description: 'Запустить слухи в СМИ, чтобы подорвать репутацию.' },
        'tech_sabotage': { name: 'Тех. Саботаж', cost: 50, icon: '💥', type: 'tech', description: 'Тайно внедрить ошибку в их флагманский продукт.' },
        'price_war': { name: 'Ценовая Война', cost: 40, icon: '💸', type: 'finance', description: 'Резко снизить цены, чтобы переманить их клиентов.' },
        'insider_info': { name: 'Данные инсайдера', cost: 60, icon: '🤫', type: 'finance', description: 'Использовать информацию от переманенного сотрудника для атаки на их финансы.'}
    },
    specialists: [
        { id: 'hacker', name: 'Хакер', skill: 'tech', description: 'Может обойти любую защиту и устроить цифровой хаос.' },
        { id: 'journalist', name: 'Журналист', skill: 'pr', description: 'Мастер слова, способный создать или разрушить любую репутацию.' },
        { id: 'financier', name: 'Финансист', skill: 'finance', description: 'Знает все о финансовых махинациях и может обрушить акции.' }
    ]
};
