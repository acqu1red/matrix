// Мировое тайное правительство - Расширенные сюжетные линии
class WorldGovernmentStories {
  constructor() {
    this.storyIndex = 0;
    this.currentStory = null;
  }

  // Генерация сюжетов на основе состава штабов
  generateStories(sectors) {
    const stories = [];
    
    // Анализируем состав штабов
    const analysis = this.analyzeSectors(sectors);
    
    // Добавляем базовые сюжеты
    stories.push(...this.generateBaseStories(analysis));
    
    // Добавляем сюжеты для каждого сектора
    stories.push(...this.generateSectorStories(sectors, analysis));
    
    // Добавляем специальные сюжеты
    stories.push(...this.generateSpecialStories(analysis));
    
    // Добавляем сюжеты с видео
    stories.push(...this.generateVideoStories(analysis));
    
    // Перемешиваем сюжеты для разнообразия
    return this.shuffleArray(stories);
  }

  // Анализ штабов
  analyzeSectors(sectors) {
    const analysis = {
      totalMembers: 0,
      sectorCounts: {},
      averageStats: { leadership: 0, intelligence: 0, charisma: 0, loyalty: 0 },
      strengths: [],
      weaknesses: [],
      specialCombinations: []
    };

    let totalLeadership = 0, totalIntelligence = 0, totalCharisma = 0, totalLoyalty = 0;
    let totalMembers = 0;

    Object.entries(sectors).forEach(([sectorType, sector]) => {
      analysis.sectorCounts[sectorType] = sector.members.length;
      analysis.totalMembers += sector.members.length;

      sector.members.forEach(member => {
        totalLeadership += member.leadership;
        totalIntelligence += member.intelligence;
        totalCharisma += member.charisma;
        totalLoyalty += member.loyalty;
        totalMembers++;
      });
    });

    if (totalMembers > 0) {
      analysis.averageStats.leadership = Math.round(totalLeadership / totalMembers);
      analysis.averageStats.intelligence = Math.round(totalIntelligence / totalMembers);
      analysis.averageStats.charisma = Math.round(totalCharisma / totalMembers);
      analysis.averageStats.loyalty = Math.round(totalLoyalty / totalMembers);
    }

    // Определяем сильные и слабые стороны
    if (analysis.averageStats.leadership >= 8) analysis.strengths.push('leadership');
    if (analysis.averageStats.intelligence >= 8) analysis.strengths.push('intelligence');
    if (analysis.averageStats.charisma >= 8) analysis.strengths.push('charisma');
    if (analysis.averageStats.loyalty >= 8) analysis.strengths.push('loyalty');

    if (analysis.averageStats.leadership <= 5) analysis.weaknesses.push('leadership');
    if (analysis.averageStats.intelligence <= 5) analysis.weaknesses.push('intelligence');
    if (analysis.averageStats.charisma <= 5) analysis.weaknesses.push('charisma');
    if (analysis.averageStats.loyalty <= 5) analysis.weaknesses.push('loyalty');

    // Специальные комбинации
    if (sectors.research.members.length >= 2 && sectors.economic.members.length >= 1) {
      analysis.specialCombinations.push('tech_economy');
    }
    if (sectors.military.members.length >= 2 && sectors.political.members.length >= 2) {
      analysis.specialCombinations.push('military_politics');
    }
    if (sectors.propaganda.members.length >= 2 && sectors.political.members.length >= 1) {
      analysis.specialCombinations.push('media_control');
    }

    return analysis;
  }

  // Базовые сюжеты
  generateBaseStories(analysis) {
    const stories = [];

    // Сюжет о начале операции
    stories.push({
      title: "🌍 Начало глобальной операции",
      content: "Ваше тайное правительство инициировало операцию 'Мировая Тень'. Первые агенты проникли в ключевые институты власти по всему миру. Начинается эпоха тайного управления человечеством.",
      type: "intro"
    });

    // Сюжет о сильных сторонах
    if (analysis.strengths.length > 0) {
      const strengthText = analysis.strengths.map(s => this.getStrengthDescription(s)).join(', ');
      stories.push({
        title: "⭐ Сильные стороны команды",
        content: `Ваша команда демонстрирует выдающиеся способности в области: ${strengthText}. Это дает вам значительное преимущество перед конкурентами и увеличивает шансы на успех операций.`,
        type: "strength"
      });
    }

    // Сюжет о слабых сторонах
    if (analysis.weaknesses.length > 0) {
      const weaknessText = analysis.weaknesses.map(w => this.getWeaknessDescription(w)).join(', ');
      stories.push({
        title: "⚠️ Области для улучшения",
        content: `Анализ показывает, что ваша команда имеет недостатки в: ${weaknessText}. Рекомендуется обратить внимание на эти аспекты для повышения эффективности операций.`,
        type: "warning"
      });
    }

    return stories;
  }

  // Сюжеты для секторов
  generateSectorStories(sectors, analysis) {
    const stories = [];

    // Политический сектор
    if (sectors.political.members.length > 0) {
      const politicalStories = this.generatePoliticalStories(sectors.political, analysis);
      stories.push(...politicalStories);
    }

    // Военный сектор
    if (sectors.military.members.length > 0) {
      const militaryStories = this.generateMilitaryStories(sectors.military, analysis);
      stories.push(...militaryStories);
    }

    // Экономический сектор
    if (sectors.economic.members.length > 0) {
      const economicStories = this.generateEconomicStories(sectors.economic, analysis);
      stories.push(...economicStories);
    }

    // Исследовательский сектор
    if (sectors.research.members.length > 0) {
      const researchStories = this.generateResearchStories(sectors.research, analysis);
      stories.push(...researchStories);
    }

    // Пропагандистский сектор
    if (sectors.propaganda.members.length > 0) {
      const propagandaStories = this.generatePropagandaStories(sectors.propaganda, analysis);
      stories.push(...propagandaStories);
    }

    return stories;
  }

  // Сюжеты для политического сектора
  generatePoliticalStories(members, analysis) {
    const stories = [];
    const avgLeadership = members.reduce((sum, m) => sum + m.leadership, 0) / members.length;

    if (avgLeadership >= 8) {
      stories.push({
        title: "🏛️ Политический триумф в ЕС",
        content: "Ваши политические агенты провели революционные реформы в Европейском Союзе. Брюссель полностью под вашим контролем. Европейский парламент теперь голосует по вашим указаниям.",
        type: "success",
        sector: "political"
      });

      stories.push({
        title: "🤝 Дипломатическая победа в Азии",
        content: "Ваши дипломаты заключили тайные соглашения с Китаем, Японией и Южной Кореей. Азиатско-Тихоокеанский регион теперь ваша сфера влияния.",
        type: "success",
        sector: "political"
      });
    } else {
      stories.push({
        title: "⚔️ Политический переворот",
        content: "Неправильно назначенный агент в политическом секторе организовал тайный заговор против вашей власти. Используя свои лидерские качества, он подрывает авторитет правительства изнутри.",
        type: "error",
        sector: "political",
        canEliminate: true,
        eliminationRequirement: 2
      });
    }

    return stories;
  }

  // Сюжеты для военного сектора
  generateMilitaryStories(members, analysis) {
    const stories = [];
    const avgIntelligence = members.reduce((sum, m) => sum + m.intelligence, 0) / members.length;

    if (avgIntelligence >= 8) {
      stories.push({
        title: "⚔️ Военная экспансия в Европе",
        content: "Военный сектор установил контроль над штаб-квартирой НАТО в Брюсселе. Стратегические ядерные объекты и системы противоракетной обороны теперь под вашим командованием.",
        type: "success",
        sector: "military"
      });

      stories.push({
        title: "🛡️ Создание глобальной системы безопасности",
        content: "Ваши военные эксперты разработали единую систему безопасности, охватывающую все континенты. Теперь любая угроза может быть нейтрализована в течение нескольких минут.",
        type: "success",
        sector: "military"
      });
    } else {
      stories.push({
        title: "💥 Военный инцидент",
        content: "Недостаточная компетентность военного сектора привела к серьезному инциденту. Один из ваших агентов случайно раскрыл секретную операцию, что привело к международному скандалу.",
        type: "error",
        sector: "military"
      });
    }

    return stories;
  }

  // Сюжеты для экономического сектора
  generateEconomicStories(members, analysis) {
    const stories = [];
    const avgCharisma = members.reduce((sum, m) => sum + m.charisma, 0) / members.length;

    if (avgCharisma >= 8) {
      stories.push({
        title: "💰 Экономическое порабощение",
        content: "Экономический сектор проник в Федеральную резервную систему США и Европейский центральный банк. Все мировые финансовые потоки теперь проходят через ваши руки.",
        type: "success",
        sector: "economic"
      });

      stories.push({
        title: "🌐 Создание единой валюты",
        content: "Ваши экономисты разработали план внедрения единой мировой валюты 'Глобал'. Это позволит полностью контролировать мировую экономику и устранить конкурирующие валюты.",
        type: "success",
        sector: "economic"
      });
    } else {
      stories.push({
        title: "📉 Экономический кризис",
        content: "Неумелые действия экономического сектора привели к глобальному финансовому кризису. Мировые рынки рухнули, что вызвало массовые протесты и недоверие к финансовым институтам.",
        type: "error",
        sector: "economic"
      });
    }

    return stories;
  }

  // Сюжеты для исследовательского сектора
  generateResearchStories(members, analysis) {
    const stories = [];
    const avgIntelligence = members.reduce((sum, m) => sum + m.intelligence, 0) / members.length;

    if (avgIntelligence >= 9) {
      stories.push({
        title: "🔬 Научная революция",
        content: "Исследовательский сектор получил доступ к секретным лабораториям ЦРУ, МИ-6 и ФСБ. Технологии клонирования, искусственного интеллекта и биологического оружия теперь в вашем распоряжении.",
        type: "success",
        sector: "research"
      });

      stories.push({
        title: "🚀 Прорыв в космических технологиях",
        content: "Ваши ученые разработали революционные технологии для освоения космоса. Созданы миниатюрные WARP двигатели, позволяющие путешествовать в будущее.",
        type: "success",
        sector: "research",
        video: "puteshestvie"
      });

      stories.push({
        title: "🧬 Эксперименты над людьми",
        content: "Начались революционные исследования по внедрению ИИ в человеческий мозг. Создается новый вид людей с расширенными интеллектуальными возможностями.",
        type: "success",
        sector: "research",
        video: "experement"
      });
    } else {
      stories.push({
        title: "🧪 Научная катастрофа",
        content: "Недостаточная квалификация исследовательского сектора привела к серьезной научной катастрофе. Эксперимент вышел из-под контроля, что привело к экологическим последствиям.",
        type: "error",
        sector: "research"
      });
    }

    return stories;
  }

  // Сюжеты для пропагандистского сектора
  generatePropagandaStories(members, analysis) {
    const stories = [];
    const avgCharisma = members.reduce((sum, m) => sum + m.charisma, 0) / members.length;

    if (avgCharisma >= 8) {
      stories.push({
        title: "📺 Информационная диктатура",
        content: "Пропагандический сектор захватил контроль над CNN, BBC, RT и всеми крупными СМИ мира. Общественное мнение формируется по вашему сценарию.",
        type: "success",
        sector: "propaganda"
      });

      stories.push({
        title: "🎭 Манипуляция массовым сознанием",
        content: "Ваши эксперты по пропаганде разработали технологии массового влияния на сознание людей. Теперь любое событие может быть представлено в нужном свете.",
        type: "success",
        sector: "propaganda"
      });
    } else {
      stories.push({
        title: "📰 Информационная утечка",
        content: "Неумелые действия пропагандистского сектора привели к массовой утечке информации. Секретные планы мирового правительства стали достоянием общественности.",
        type: "error",
        sector: "propaganda",
        video: "razobla4enie"
      });
    }

    return stories;
  }

  // Специальные сюжеты
  generateSpecialStories(analysis) {
    const stories = [];

    // Технология + Экономика
    if (analysis.specialCombinations.includes('tech_economy')) {
      stories.push({
        title: "🔬💰 Технологическая экономика",
        content: "Синергия между исследовательским и экономическим секторами привела к созданию революционных финансовых технологий. Криптовалюты, блокчейн и ИИ-трейдинг теперь под вашим контролем.",
        type: "special",
        combination: "tech_economy"
      });
    }

    // Военный + Политика
    if (analysis.specialCombinations.includes('military_politics')) {
      stories.push({
        title: "⚔️🏛️ Военно-политический альянс",
        content: "Объединение военного и политического секторов создало мощный альянс. Теперь любое политическое решение может быть подкреплено военной силой, а военные операции - политической поддержкой.",
        type: "special",
        combination: "military_politics"
      });
    }

    // Медиа + Политика
    if (analysis.specialCombinations.includes('media_control')) {
      stories.push({
        title: "📺🏛️ Контроль над обществом",
        content: "Синергия пропагандистского и политического секторов создала систему тотального контроля над общественным мнением. Теперь любое политическое решение может быть представлено как единственно правильное.",
        type: "special",
        combination: "media_control"
      });
    }

    return stories;
  }

  // Сюжеты с видео
  generateVideoStories(analysis) {
    const stories = [];

    // Сюжет с митингами
    if (analysis.averageStats.loyalty <= 6) {
      stories.push({
        title: "🚨 Массовые протесты",
        content: "Низкая лояльность команды привела к массовым протестам против мирового правительства. Люди выходят на улицы, требуя свободы и демократии.",
        type: "video",
        video: "meting"
      });
    }

    // Сюжет с беспорядками
    if (analysis.averageStats.leadership <= 6) {
      stories.push({
        title: "🔥 Массовые беспорядки",
        content: "Слабое руководство привело к полному хаосу в мире. Массовые беспорядки охватили все крупные города, правительства падают один за другим.",
        type: "video",
        video: "besporyadki"
      });
    }

    // Сюжет с войной
    if (analysis.averageStats.intelligence <= 6) {
      stories.push({
        title: "⚔️ Мировая война",
        content: "Недостаток интеллекта в команде привел к катастрофическим ошибкам. Мировое правительство инициировало войну для отвлечения внимания от внутренних проблем.",
        type: "video",
        video: "war"
      });
    }

    return stories;
  }

  // Финальный сюжет
  generateFinalStory(sectors) {
    const analysis = this.analyzeSectors(sectors);
    let finalContent = "";

    if (analysis.totalMembers >= 12) {
      finalContent = "Поздравляем! Вы успешно создали мощное тайное мировое сообщество. Ваша команда из " + analysis.totalMembers + " высококвалифицированных специалистов контролирует все аспекты мировой политики, экономики и общества. Мировое правительство стало реальностью, и человечество вступило в новую эру тайного управления.";
    } else if (analysis.totalMembers >= 8) {
      finalContent = "Хорошая работа! Вы создали стабильное тайное сообщество из " + analysis.totalMembers + " членов. Хотя есть области для улучшения, ваша организация способна эффективно управлять ключевыми аспектами мирового порядка.";
    } else {
      finalContent = "Ваша команда из " + analysis.totalMembers + " членов требует доработки. Рекомендуется расширить штат и улучшить качество персонала для более эффективного управления мировыми процессами.";
    }

    return {
      title: "🎯 Итоги создания мирового правительства",
      content: finalContent,
      type: "final"
    };
  }

  // Вспомогательные методы
  getStrengthDescription(strength) {
    const descriptions = {
      leadership: "лидерства и управления",
      intelligence: "интеллекта и стратегического мышления",
      charisma: "харизмы и влияния",
      loyalty: "лояльности и надежности"
    };
    return descriptions[strength] || strength;
  }

  getWeaknessDescription(weakness) {
    const descriptions = {
      leadership: "лидерских качеств",
      intelligence: "интеллектуальных способностей",
      charisma: "харизмы и влияния",
      loyalty: "лояльности команды"
    };
    return descriptions[weakness] || weakness;
  }

  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
