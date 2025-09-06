# Система рулетки

Система рулетки была перенесена в отдельный файл `roulette.js` для временного отключения и последующей переработки.

## Файлы

- `roulette.js` - основная система рулетки со всеми функциями
- `roulette-test.html` - тестовый файл для проверки работы системы
- `README-roulette.md` - этот файл с инструкциями

## Что было сделано

1. **Перенесена вся система рулетки** из `quests.js` в отдельный файл `roulette.js`
2. **Удален весь код рулетки** из основного файла `quests.js`
3. **Создан тестовый файл** для проверки работы системы
4. **Система временно отключена** в основном приложении

## Функции системы рулетки

### Основные функции
- `createRouletteWheel()` - создание рулетки
- `spinRoulette(isFree)` - прокрутка рулетки
- `canSpinFree()` - проверка возможности бесплатного спина
- `updateRouletteButton()` - обновление кнопки рулетки
- `updateRouletteButtonWithAnimation()` - обновление кнопки с анимацией

### Функции призов
- `selectPrizeByProbability()` - выбор приза по вероятности
- `determinePrizeByArrowPosition()` - определение приза по позиции стрелки
- `showPrizeModal(prize, isFree)` - показ модального окна с призом

### Функции промокодов
- `generatePromoCode(prize)` - генерация промокода
- `getPromoMessage(prize, code)` - создание сообщения промокода
- `copyPromoCode()` - копирование промокода
- `savePromocode(prize, promoCode)` - сохранение промокода в БД

### Функции истории
- `saveRouletteHistory(prizeType, prizeName, isFree, mulacoinSpent, promoCodeId)` - сохранение истории рулетки

### Обработчики
- `initializeRouletteHandlers()` - инициализация обработчиков событий
- `originalSpinHandler` - основной обработчик кнопки рулетки

## Константы

- `SPIN_COST = 13` - стоимость спина в mulacoin
- `ROULETTE_PRIZES` - массив призов с вероятностями
- `ROULETTE_PRIZES_DESIGNS` - дизайны призов для разных тем

## Переменные

- `rouletteCurrentPosition` - текущая позиция рулетки
- `currentRouletteDesign` - текущий дизайн рулетки

## Тестирование

Для тестирования системы рулетки откройте файл `roulette-test.html` в браузере. Этот файл содержит:

- Мок-данные пользователя
- Мок-функции для Supabase
- Кнопки для тестирования всех функций
- Отображение результатов тестов

## Интеграция обратно в основное приложение

Когда будете готовы вернуть систему рулетки:

1. Добавьте подключение `roulette.js` в `quests.html`:
```html
<script src="quests/roulette.js"></script>
```

2. Добавьте HTML структуру рулетки в `quests.html` (если её нет)

3. Добавьте CSS стили рулетки в `quests.css` (если их нет)

4. В `quests.js` добавьте вызовы инициализации:
```javascript
// В функции инициализации
if (window.rouletteSystem) {
    window.rouletteSystem.createRouletteWheel();
    window.rouletteSystem.initializeRouletteHandlers();
}
```

## Зависимости

Система рулетки зависит от следующих глобальных функций:
- `userData` - данные пользователя
- `supabase` - клиент Supabase
- `toast(message, type)` - функция уведомлений
- `$(selector)` - функция поиска элементов
- `isAdmin()` - проверка администратора
- `addRewards(mulacoin, exp, source, description, difficulty)` - добавление наград
- `updateCurrencyDisplay()` - обновление отображения валюты
- `saveUserData()` - сохранение данных пользователя

## Призы

Система поддерживает следующие типы призов:
- `subscription` - подписка
- `discount500`, `discount100` - скидки
- `mulacoin100`, `mulacoin50` - mulacoin
- `spin1` - дополнительные спины
- `quest24h` - дополнительные квесты
- `frodCourse` - курс фрода

## Безопасность

- Администраторы могут крутить рулетку бесплатно и без ограничений
- Обычные пользователи имеют ежедневный бесплатный спин
- Дополнительные спины можно получить как призы
- Все действия логируются в истории
