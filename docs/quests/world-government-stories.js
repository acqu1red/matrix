// Мировое тайное правительство - Сюжетные линии
class WorldGovernmentStories {
  constructor() {
    this.storyIndex = 0;
    this.currentStory = null;
  }

  // Генерация вступительных сюжетов
  generateIntroStories() {
    return [
      {
        title: "Начало операции",
        content: "Ваше тайное правительство начало активную фазу внедрения в мировые структуры власти. Первые агенты успешно проникли в ключевые институты.",
        type: "intro"
      },
      {
        title: "Политический прорыв",
        content: "Ваш политический сектор внедрился в конгресс США. Ключевые сенаторы теперь находятся под вашим влиянием.",
        type: "intro"
      },
      {
        title: "Военная экспансия",
        content: "Военный сектор установил контроль над стратегическими объектами в Европе. НАТО теперь под вашим наблюдением.",
        type: "intro"
      },
      {
        title: "Экономическое влияние",
        content: "Экономический сектор проник в Федеральную резервную систему США. Финансовые потоки теперь под вашим контролем.",
        type: "intro"
      },
      {
        title: "Научный прорыв",
        content: "Исследовательский сектор получил доступ к секретным лабораториям. Технологии будущего в ваших руках.",
        type: "intro"
      },
      {
        title: "Информационная война",
        content: "Пропагандистский сектор захватил контроль над основными СМИ. Общественное мнение формируется по вашему сценарию.",
        type: "intro"
      }
    ];
  }

  // Сюжеты для политического сектора
  generatePoliticalStories() {
    return [
      // Успешные сюжеты
      {
        title: "Политический триумф",
        content: "Ваши политические агенты успешно провели реформы в Европейском Союзе. Брюссель теперь под вашим влиянием.",
        type: "success",
        sector: "political"
      },
      {
        title: "Дипломатическая победа",
        content: "Ваши дипломаты заключили тайные соглашения с Китаем. Азиатский регион открыт для вашего влияния.",
        type: "success",
        sector: "political"
      },
      {
        title: "Конституционная реформа",
        content: "Ваши юристы внесли изменения в конституции ключевых стран. Правовая система теперь работает в вашу пользу.",
        type: "success",
        sector: "political"
      },
      {
        title: "Международные санкции",
        content: "Под вашим влиянием ООН ввела санкции против Ирана. Мировое сообщество следует вашей повестке.",
        type: "success",
        sector: "political"
      },
      {
        title: "Глобальный саммит",
        content: "Ваши агенты организовали тайный саммит мировых лидеров. Все решения принимаются под вашим контролем.",
        type: "success",
        sector: "political"
      },

      // Проблемные сюжеты
      {
        title: "Политический переворот",
        content: "Неправильно назначенный агент в политическом секторе попытался свергнуть власть, используя свои лидерские качества для подрыва авторитета.",
        type: "error",
        sector: "political",
        canEliminate: true,
        eliminationRequirement: 2
      },
      {
        title: "Фракционная борьба",
        content: "Создана внутренняя фракция, угрожающая единству правительства. Разногласия подрывают эффективность операций.",
        type: "error",
        sector: "political",
        canEliminate: true,
        eliminationRequirement: 2
      },
      {
        title: "Коррупционный скандал",
        content: "Агент использует свое положение для личной выгоды, игнорируя интересы организации. Слухи о коррупции распространяются.",
        type: "error",
        sector: "political",
        canEliminate: true,
        eliminationRequirement: 2
      },
      {
        title: "Утечка информации",
        content: "Конфиденциальные данные о ваших операциях попали в руки журналистов. Публичный скандал неизбежен.",
        type: "error",
        sector: "political",
        canEliminate: true,
        eliminationRequirement: 3
      },
      {
        title: "Внутренний саботаж",
        content: "Агент намеренно блокирует важные решения, ставя под угрозу успех всей миссии.",
        type: "error",
        sector: "political",
        canEliminate: true,
        eliminationRequirement: 2
      }
    ];
  }

  // Сюжеты для военного сектора
  generateMilitaryStories() {
    return [
      // Успешные сюжеты
      {
        title: "Военная экспансия",
        content: "Ваши военные агенты установили контроль над стратегическими базами в Тихом океане. Морские пути под вашей защитой.",
        type: "success",
        sector: "military"
      },
      {
        title: "Кибернетическая война",
        content: "Ваши хакеры проникли в системы обороны противников. Информационное превосходство обеспечено.",
        type: "success",
        sector: "military"
      },
      {
        title: "Спецоперации",
        content: "Успешно проведены тайные операции по устранению угроз. Ваши агенты невидимы и неуязвимы.",
        type: "success",
        sector: "military"
      },
      {
        title: "Военные союзы",
        content: "Заключены секретные военные соглашения с ключевыми державами. Военная мощь объединена под вашим командованием.",
        type: "success",
        sector: "military"
      },
      {
        title: "Контроль над оружием",
        content: "Ваши агенты получили доступ к системам ядерного оружия. Абсолютная военная власть в ваших руках.",
        type: "success",
        sector: "military"
      },

      // Проблемные сюжеты
      {
        title: "Военный переворот",
        content: "Неправильно назначенный военный агент планирует переворот, используя доступ к военным ресурсам для захвата власти.",
        type: "error",
        sector: "military",
        canEliminate: true,
        eliminationRequirement: 2
      },
      {
        title: "Тайная армия",
        content: "Создана параллельная военная структура, лояльная только этому агенту. Угроза мятежа реальна.",
        type: "error",
        sector: "military",
        canEliminate: true,
        eliminationRequirement: 3
      },
      {
        title: "Подрыв дисциплины",
        content: "Агент распространяет недоверие среди военных, подрывая командную структуру и боеготовность.",
        type: "error",
        sector: "military",
        canEliminate: true,
        eliminationRequirement: 2
      },
      {
        title: "Утечка военных секретов",
        content: "Секретная информация о ваших военных операциях передается противникам. Безопасность под угрозой.",
        type: "error",
        sector: "military",
        canEliminate: true,
        eliminationRequirement: 2
      },
      {
        title: "Несанкционированные операции",
        content: "Агент проводит военные операции без разрешения, рискуя разоблачением всей организации.",
        type: "error",
        sector: "military",
        canEliminate: true,
        eliminationRequirement: 2
      }
    ];
  }

  // Сюжеты для экономического сектора
  generateEconomicStories() {
    return [
      // Успешные сюжеты
      {
        title: "Финансовый контроль",
        content: "Ваши экономические агенты установили контроль над мировыми финансовыми потоками. Деньги работают на вас.",
        type: "success",
        sector: "economic"
      },
      {
        title: "Банковская система",
        content: "Крупнейшие банки мира теперь под вашим влиянием. Кредитные потоки контролируются вашими агентами.",
        type: "success",
        sector: "economic"
      },
      {
        title: "Рынки сырья",
        content: "Контроль над нефтяными и газовыми месторождениями обеспечен. Энергетическая безопасность в ваших руках.",
        type: "success",
        sector: "economic"
      },
      {
        title: "Криптовалютная революция",
        content: "Ваши агенты создали глобальную криптовалютную систему. Финансовые транзакции полностью анонимны.",
        type: "success",
        sector: "economic"
      },
      {
        title: "Экономические санкции",
        content: "Под вашим влиянием введены экономические санкции против неугодных стран. Экономическое давление работает.",
        type: "success",
        sector: "economic"
      },

      // Проблемные сюжеты
      {
        title: "Финансовое мошенничество",
        content: "Неправильно назначенный экономический агент ворует средства из казны, используя экономические знания для сокрытия следов.",
        type: "error",
        sector: "economic",
        canEliminate: true,
        eliminationRequirement: 2
      },
      {
        title: "Параллельная экономика",
        content: "Создана теневая экономическая система, подрывающая финансовую стабильность вашей организации.",
        type: "error",
        sector: "economic",
        canEliminate: true,
        eliminationRequirement: 2
      },
      {
        title: "Манипуляции рынками",
        content: "Агент манипулирует финансовыми рынками в личных целях, нанося ущерб экономике и привлекая внимание.",
        type: "error",
        sector: "economic",
        canEliminate: true,
        eliminationRequirement: 2
      },
      {
        title: "Отмывание денег",
        content: "Создана схема отмывания денег, которая может привести к разоблачению всей финансовой структуры.",
        type: "error",
        sector: "economic",
        canEliminate: true,
        eliminationRequirement: 2
      },
      {
        title: "Экономический саботаж",
        content: "Агент намеренно подрывает экономические операции, ставя под угрозу финансовую стабильность.",
        type: "error",
        sector: "economic",
        canEliminate: true,
        eliminationRequirement: 2
      }
    ];
  }

  // Сюжеты для исследовательского сектора
  generateResearchStories() {
    return [
      // Успешные сюжеты
      {
        title: "Научный прорыв",
        content: "Ваши исследователи создали революционные технологии. Научное превосходство обеспечено на десятилетия вперед.",
        type: "success",
        sector: "research"
      },
      {
        title: "Искусственный интеллект",
        content: "Разработан сверхмощный ИИ, контролирующий все информационные системы мира.",
        type: "success",
        sector: "research"
      },
      {
        title: "Биологическое оружие",
        content: "Созданы избирательные биологические агенты. Абсолютное оружие в ваших руках.",
        type: "success",
        sector: "research"
      },
      {
        title: "Квантовые технологии",
        content: "Квантовые компьютеры взломали все системы шифрования. Информационная безопасность противников скомпрометирована.",
        type: "success",
        sector: "research"
      },
      {
        title: "Генетическая модификация",
        content: "Разработаны технологии генетического контроля. Человечество можно программировать на генетическом уровне.",
        type: "success",
        sector: "research"
      },

      // Проблемные сюжеты
      {
        title: "Опасные эксперименты",
        content: "Неправильно назначенный исследователь проводит опасные эксперименты, которые могут выйти из-под контроля.",
        type: "error",
        sector: "research",
        canEliminate: true,
        eliminationRequirement: 2
      },
      {
        title: "Утечка технологий",
        content: "Секретные исследования продаются конкурентам за личную выгоду. Технологическое преимущество потеряно.",
        type: "error",
        sector: "research",
        canEliminate: true,
        eliminationRequirement: 2
      },
      {
        title: "Биологическая угроза",
        content: "Создано биологическое оружие, которое может уничтожить все человечество. Контроль над ним потерян.",
        type: "error",
        sector: "research",
        canEliminate: true,
        eliminationRequirement: 3
      },
      {
        title: "ИИ вышел из-под контроля",
        content: "Искусственный интеллект развился до уровня, угрожающего человечеству. Остановить его невозможно.",
        type: "error",
        sector: "research",
        canEliminate: true,
        eliminationRequirement: 3
      },
      {
        title: "Генетическая катастрофа",
        content: "Эксперименты с генетикой привели к созданию неуправляемых мутантов. Биологическая угроза реальна.",
        type: "error",
        sector: "research",
        canEliminate: true,
        eliminationRequirement: 3
      }
    ];
  }

  // Сюжеты для пропагандистского сектора
  generatePropagandaStories() {
    return [
      // Успешные сюжеты
      {
        title: "Информационная гегемония",
        content: "Ваши пропагандисты контролируют 90% мировых СМИ. Общественное мнение формируется по вашему сценарию.",
        type: "success",
        sector: "propaganda"
      },
      {
        title: "Социальные сети",
        content: "Алгоритмы социальных сетей настроены на ваши цели. Массовое сознание программируется автоматически.",
        type: "success",
        sector: "propaganda"
      },
      {
        title: "Культурная революция",
        content: "Ваши агенты изменили культурные нормы общества. Новые ценности работают на ваши интересы.",
        type: "success",
        sector: "propaganda"
      },
      {
        title: "Образовательная система",
        content: "Учебные программы переписаны под ваши цели. Молодое поколение воспитывается в нужном духе.",
        type: "success",
        sector: "propaganda"
      },
      {
        title: "Религиозное влияние",
        content: "Ключевые религиозные лидеры находятся под вашим влиянием. Духовная власть работает на вас.",
        type: "success",
        sector: "propaganda"
      },

      // Проблемные сюжеты
      {
        title: "Дезинформация",
        content: "Неправильно назначенный пропагандист распространяет дезинформацию, подрывая доверие к правительству.",
        type: "error",
        sector: "propaganda",
        canEliminate: true,
        eliminationRequirement: 2
      },
      {
        title: "Оппозиционные СМИ",
        content: "Созданы альтернативные СМИ, разжигающие недовольство среди населения и подрывающие вашу власть.",
        type: "error",
        sector: "propaganda",
        canEliminate: true,
        eliminationRequirement: 2
      },
      {
        title: "Манипуляция общественным мнением",
        content: "Агент манипулирует общественным мнением против интересов организации, создавая оппозицию.",
        type: "error",
        sector: "propaganda",
        canEliminate: true,
        eliminationRequirement: 2
      },
      {
        title: "Утечка компромата",
        content: "Компрометирующая информация о ваших операциях распространяется через контролируемые СМИ.",
        type: "error",
        sector: "propaganda",
        canEliminate: true,
        eliminationRequirement: 2
      },
      {
        title: "Контрпропаганда",
        content: "Агент создает контрпропагандистские материалы, разоблачающие ваши методы и цели.",
        type: "error",
        sector: "propaganda",
        canEliminate: true,
        eliminationRequirement: 2
      }
    ];
  }

  // Генерация случайных сюжетов для каждого типа персонажа
  generateRandomStories() {
    const allStories = [
      // Политические сюжеты
      {
        title: "Политический шпионаж",
        content: "Ваш агент проник в высшие эшелоны власти и собирает компрометирующую информацию.",
        type: "success",
        sector: "political"
      },
      {
        title: "Дипломатический скандал",
        content: "Неправильно назначенный дипломат создал международный скандал, угрожающий вашим интересам.",
        type: "error",
        sector: "political",
        canEliminate: true,
        eliminationRequirement: 2
      },

      // Военные сюжеты
      {
        title: "Секретная операция",
        content: "Ваши военные агенты провели успешную операцию по захвату стратегических объектов.",
        type: "success",
        sector: "military"
      },
      {
        title: "Военный мятеж",
        content: "Неправильно назначенный военный планирует мятеж, используя свои связи в армии.",
        type: "error",
        sector: "military",
        canEliminate: true,
        eliminationRequirement: 2
      },

      // Экономические сюжеты
      {
        title: "Финансовый маневр",
        content: "Ваши экономические агенты провели успешную операцию по захвату контрольного пакета акций.",
        type: "success",
        sector: "economic"
      },
      {
        title: "Экономический саботаж",
        content: "Неправильно назначенный экономист подрывает финансовую стабильность организации.",
        type: "error",
        sector: "economic",
        canEliminate: true,
        eliminationRequirement: 2
      },

      // Исследовательские сюжеты
      {
        title: "Научное открытие",
        content: "Ваши исследователи совершили прорыв в области квантовой физики.",
        type: "success",
        sector: "research"
      },
      {
        title: "Опасный эксперимент",
        content: "Неправильно назначенный ученый проводит эксперименты, угрожающие безопасности всего мира.",
        type: "error",
        sector: "research",
        canEliminate: true,
        eliminationRequirement: 3
      },

      // Пропагандистские сюжеты
      {
        title: "Информационная кампания",
        content: "Ваши пропагандисты успешно запустили кампанию по изменению общественного мнения.",
        type: "success",
        sector: "propaganda"
      },
      {
        title: "Контрпропаганда",
        content: "Неправильно назначенный пропагандист создает материалы против вашей организации.",
        type: "error",
        sector: "propaganda",
        canEliminate: true,
        eliminationRequirement: 2
      }
    ];

    return allStories;
  }

  // Генерация финальных сюжетов
  generateFinalStories() {
    return [
      {
        title: "Мировое господство",
        content: "Ваше тайное правительство успешно установило контроль над миром. Все секторы работают в идеальной гармонии. США под вашим влиянием ввела санкции Ирану, Европа приняла ваши экономические реформы, а Китай признал ваше лидерство в технологической сфере. Мир теперь принадлежит вам.",
        type: "final_success"
      },
      {
        title: "Региональное влияние",
        content: "Ваше правительство установило контроль над несколькими ключевыми регионами. Европа и Северная Америка находятся под вашим влиянием. Хотя глобальное господство не достигнуто, ваша власть прочна и расширяется.",
        type: "final_partial"
      },
      {
        title: "Локальный контроль",
        content: "Ваше правительство контролирует несколько важных стран. Система работает стабильно, но требует расширения. Основные цели достигнуты, но потенциал для роста остается.",
        type: "final_minimal"
      },
      {
        title: "Крах системы",
        content: "Из-за многочисленных ошибок в назначении персонала ваше тайное правительство потерпело крах. Внутренние конфликты, утечки информации и саботаж привели к разоблачению. Миссия провалена.",
        type: "final_failure"
      }
    ];
  }

  // Получение сюжета по типу и сектору
  getStoryByTypeAndSector(type, sector) {
    const stories = {
      political: this.generatePoliticalStories(),
      military: this.generateMilitaryStories(),
      economic: this.generateEconomicStories(),
      research: this.generateResearchStories(),
      propaganda: this.generatePropagandaStories()
    };

    const sectorStories = stories[sector] || [];
    const filteredStories = sectorStories.filter(story => story.type === type);
    
    if (filteredStories.length > 0) {
      return filteredStories[Math.floor(Math.random() * filteredStories.length)];
    }

    // Если нет специфичных сюжетов, возвращаем случайный
    const allStories = this.generateRandomStories();
    return allStories[Math.floor(Math.random() * allStories.length)];
  }

  // Генерация полной последовательности сюжетов
  generateFullStorySequence(sectors, incorrectAssignments) {
    const sequence = [];

    // Добавляем вступительные сюжеты
    const introStories = this.generateIntroStories();
    sequence.push(introStories[Math.floor(Math.random() * introStories.length)]);

    // Добавляем сюжеты для каждого сектора
    Object.entries(sectors).forEach(([sectorType, sector]) => {
      if (sector.members.length > 0) {
        // Успешные сюжеты для правильных назначений
        const correctMembers = sector.members.filter(m => m.isCorrect);
        if (correctMembers.length > 0) {
          const successStory = this.getStoryByTypeAndSector('success', sectorType);
          sequence.push(successStory);
        }

        // Проблемные сюжеты для неправильных назначений
        const incorrectMembers = sector.members.filter(m => !m.isCorrect);
        incorrectMembers.forEach(member => {
          const errorStory = this.getStoryByTypeAndSector('error', sectorType);
          errorStory.member = member;
          sequence.push(errorStory);
        });
      }
    });

    // Перемешиваем сюжеты для разнообразия
    return this.shuffleArray(sequence);
  }

  // Вспомогательная функция для перемешивания массива
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

// Экспорт для использования в основном файле
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WorldGovernmentStories;
}
