# Применение дизайн-системы к остальным страницам

Этот файл содержит инструкции по применению новой дизайн-системы Modern Neon к остальным страницам проекта.

## 🎯 Страницы для обновления

### Приоритет 1 (основные)
- ✅ `quests.html` - **ГОТОВО** (главная страница)
- 🔄 `rulette.html` - Рулетка (следующая в очереди)
- 🔄 `case.html` - Кейсы
- 🔄 `payment.html` - Платежи
- 🔄 `subscription.html` - Подписки

### Приоритет 2 (вспомогательные)
- 🔄 `index.html` - Главная страница сайта
- 🔄 `quests/*.html` - Страницы отдельных квестов

## 🚀 Быстрый старт для любой страницы

### 1. Обновить `<head>`
```html
<head>
  <!-- Шрифты -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Manrope:wght@600;700&family=JetBrains+Mono:wght@600&display=swap" rel="stylesheet">
  
  <!-- Дизайн-система -->
  <link rel="stylesheet" href="./styles/tokens.css" />
  <link rel="stylesheet" href="./styles/typography.css" />
  <link rel="stylesheet" href="./styles/layout.css" />
  <link rel="stylesheet" href="./styles/components.css" />
  <link rel="stylesheet" href="./styles/skeleton.css" />
  <link rel="stylesheet" href="./styles/telegram.css" />
  
  <!-- Оставить существующие стили -->
  <link rel="stylesheet" href="./existing-page.css" />
</head>
```

### 2. Установить тему
```html
<html lang="ru" data-theme="modern">
```

### 3. Подключить скрипты
```html
<script src="./js/telegram.js"></script>
<script src="./js/theme-switcher.js"></script>
```

## 🔄 Пошаговое обновление

### Шаг 1: Заголовки
Заменить существующие заголовки на новые классы:
```html
<!-- Было -->
<h1>Заголовок</h1>
<h2>Подзаголовок</h2>

<!-- Стало -->
<h1 class="h1">Заголовок</h1>
<h2 class="h2">Подзаголовок</h2>
```

### Шаг 2: Кнопки
```html
<!-- Было -->
<button class="btn primary">Кнопка</button>
<button class="btn ghost">Вторичная</button>

<!-- Стало -->
<button class="btn btn--primary">Кнопка</button>
<button class="btn btn--ghost">Вторичная</button>
```

### Шаг 3: Карточки
```html
<!-- Было -->
<div class="card old-style">
  <div class="content">...</div>
</div>

<!-- Стало -->
<div class="card padding">
  <div class="stack">
    <div class="content">...</div>
  </div>
</div>
```

### Шаг 4: Контейнеры
```html
<!-- Было -->
<div class="wrapper">
  <div class="content">...</div>
</div>

<!-- Стало -->
<div class="container">
  <div class="content">...</div>
</div>
```

### Шаг 5: Отступы
```html
<!-- Было -->
<div class="section">
  <div class="item">Item 1</div>
  <div class="item">Item 2</div>
</div>

<!-- Стало -->
<div class="section">
  <div class="stack">
    <div class="item">Item 1</div>
    <div class="item">Item 2</div>
  </div>
</div>
```

## 🎨 Специфичные обновления по страницам

### `rulette.html` - Рулетка
```html
<!-- Обновить фон -->
<body data-theme="modern">

<!-- Обновить кнопки рулетки -->
<button class="btn btn--primary" id="spinButton">
  <img src="assets/rulette/ruletka.png" alt="Крутить" />
</button>

<!-- Обновить модалки выигрыша -->
<div class="modal" id="winModal" role="dialog" aria-modal="true">
  <div class="modal__overlay" data-close></div>
  <div class="modal__dialog">
    <div class="modal__content">
      <h2 class="h2">Поздравляем!</h2>
      <p class="body">Вы выиграли приз!</p>
    </div>
  </div>
</div>
```

### `case.html` - Кейсы
```html
<!-- Обновить карточки кейсов -->
<div class="card padding">
  <div class="stack">
    <h3 class="h3">Название кейса</h3>
    <p class="body">Описание кейса</p>
    <div class="cluster">
      <span class="chip">Редкий</span>
      <button class="btn btn--primary">Открыть</button>
    </div>
  </div>
</div>
```

### `payment.html` - Платежи
```html
<!-- Обновить формы -->
<div class="card padding">
  <div class="stack">
    <h2 class="h2">Оплата</h2>
    <div class="stack">
      <input type="text" class="input--tg" placeholder="Номер карты" />
      <input type="text" class="input--tg" placeholder="Срок действия" />
      <button class="btn btn--primary">Оплатить</button>
    </div>
  </div>
</div>
```

### `subscription.html` - Подписки
```html
<!-- Обновить планы подписок -->
<div class="grid grid--3">
  <div class="card padding">
    <div class="stack">
      <h3 class="h3">Базовый</h3>
      <div class="num">$9.99/мес</div>
      <button class="btn btn--primary">Выбрать</button>
    </div>
  </div>
  <!-- Другие планы... -->
</div>
```

## 🧹 Очистка старых стилей

### Удалить устаревшие классы
```css
/* Удалить эти классы из старых CSS файлов */
.old-button { }
.old-card { }
.old-header { }
.old-wrapper { }
```

### Заменить на новые
```css
/* Использовать новые классы */
.btn { }
.card { }
.h1, .h2, .h3 { }
.container { }
.stack { }
.cluster { }
```

## 📱 Адаптивность

### Добавить медиа-запросы
```css
@media (max-width: 768px) {
  .grid--3 {
    grid-template-columns: 1fr;
  }
  
  .container {
    padding: 0 16px;
  }
}
```

### Мобильные оптимизации
```css
@media (max-width: 480px) {
  .btn {
    height: 40px;
    padding: 0 12px;
  }
  
  .card.padding {
    padding: 12px;
  }
}
```

## ♿ Доступность

### Добавить ARIA атрибуты
```html
<!-- Модалки -->
<div class="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
  <h2 id="modalTitle" class="modal__title">Заголовок</h2>
</div>

<!-- Формы -->
<label for="email">Email</label>
<input type="email" id="email" class="input--tg" aria-describedby="emailHelp" />
<div id="emailHelp" class="caption">Введите корректный email</div>
```

### Клавиатурная навигация
```javascript
// Закрытие по Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    // Закрыть модалку/меню
  }
});
```

## 🚀 Производительность

### Оптимизировать анимации
```css
/* Использовать transform вместо position */
.card:hover {
  transform: translateY(-2px);
}

/* Добавить will-change только где нужно */
.btn {
  will-change: transform;
}
```

### Убрать тяжелые эффекты
```css
/* Заменить на CSS переменные */
.card {
  box-shadow: var(--shadow-sm);
}

/* Убрать backdrop-filter с анимируемых элементов */
.card:hover {
  /* НЕ backdrop-filter: blur() */
}
```

## 🧪 Тестирование

### Проверить на разных устройствах
- [ ] Mobile (480px)
- [ ] Tablet (768px)
- [ ] Desktop (1200px+)

### Проверить доступность
- [ ] Tab navigation
- [ ] Screen reader
- [ ] High contrast
- [ ] Reduced motion

### Проверить темы
- [ ] Modern Neon
- [ ] Conspiracy
- [ ] Light mode (если поддерживается)

## 📋 Чек-лист обновления

### HTML структура
- [ ] Обновлен `<head>` с новыми стилями
- [ ] Установлен `data-theme="modern"`
- [ ] Подключены новые скрипты
- [ ] Заголовки используют `.h1`, `.h2`, `.h3`

### CSS классы
- [ ] Кнопки используют `.btn`, `.btn--primary`, `.btn--ghost`
- [ ] Карточки используют `.card`, `.padding`
- [ ] Layout использует `.container`, `.stack`, `.cluster`
- [ ] Убраны устаревшие классы

### JavaScript
- [ ] Подключен `telegram.js`
- [ ] Подключен `theme-switcher.js`
- [ ] Добавлен haptic feedback
- [ ] Обновлены обработчики событий

### Доступность
- [ ] Добавлены ARIA атрибуты
- [ ] Поддерживается клавиатурная навигация
- [ ] Модалки закрываются по Escape
- [ ] Фокус управляется корректно

## 🎯 Пример полного обновления

Смотрите `quests.html` как пример полностью обновленной страницы с новой дизайн-системой.

## 📞 Поддержка

При возникновении проблем:
1. Сравнить с `quests.html`
2. Проверить консоль браузера
3. Убедиться в правильности подключения файлов
4. Обратиться к документации дизайн-системы

---

**🎉 Удачи в обновлении страниц!**

Дизайн-система готова и ждет применения к остальным страницам проекта.
