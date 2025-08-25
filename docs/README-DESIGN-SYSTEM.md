# Modern Neon Design System

Единая дизайн-система для miniapp с современным неоновым дизайном и поддержкой Telegram WebApp.

## 🎨 Темы

### Modern Neon (по умолчанию)
- **Основной акцент**: Лаймовый `#A8FF61`
- **Вторичный акцент**: Циан `#22E1FF`
- **Фон**: Темный `#0B0B0C`
- **Поверхности**: `#121214`, `#17181B`
- **Текст**: Белый `#FFFFFF`
- **Текст второстепенный**: `#A6A7AC`

### Conspiracy (альтернативная)
- **Основной акцент**: Золотой `#DAA520`
- **Вторичный акцент**: Песочный `#CD853F`
- **Фон**: Темно-коричневый `#1B120D`
- **Поверхности**: `#221710`, `#2B1D14`
- **Текст**: Светло-бежевый `#F7F2EE`
- **Текст второстепенный**: `#D1C3BA`

## 📁 Структура файлов

```
docs/
├── styles/
│   ├── tokens.css          # Дизайн-токены и темы
│   ├── typography.css      # Типографика
│   ├── layout.css          # Layout утилиты
│   ├── components.css      # Компоненты (кнопки, карточки, модалки)
│   ├── skeleton.css        # Скелетоны и шиммер
│   ├── telegram.css        # Telegram WebApp стили
│   └── quests-specific.css # Специфичные стили для квестов
├── js/
│   ├── telegram.js         # Telegram WebApp интеграция
│   └── theme-switcher.js   # Переключатель тем
└── quests.html             # Главная страница
```

## 🚀 Быстрый старт

### 1. Подключение стилей
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
</head>
```

### 2. Подключение скриптов
```html
<script src="./js/telegram.js"></script>
<script src="./js/theme-switcher.js"></script>
```

### 3. Установка темы
```html
<html lang="ru" data-theme="modern">
```

## 🧩 Компоненты

### Кнопки
```html
<!-- Основная кнопка -->
<button class="btn btn--primary">Начать квест</button>

<!-- Вторичная кнопка -->
<button class="btn btn--ghost">Подробнее</button>

<!-- Опасная кнопка -->
<button class="btn btn--danger">Удалить</button>

<!-- Размеры -->
<button class="btn btn--primary btn--sm">Маленькая</button>
<button class="btn btn--primary btn--lg">Большая</button>
```

### Карточки
```html
<div class="card padding">
  <div class="stack">
    <h3 class="h3">Заголовок</h3>
    <p class="body">Описание</p>
    <div class="cluster">
      <button class="btn btn--primary">Действие</button>
    </div>
  </div>
</div>
```

### Чипы
```html
<span class="chip">Обычный</span>
<span class="chip chip--success">Успех</span>
<span class="chip chip--warn">Предупреждение</span>
<span class="chip chip--error">Ошибка</span>
<span class="chip chip--accent">Акцент</span>
```

### Прогресс
```html
<div class="progress">
  <div class="progress__bar" style="width: 40%;"></div>
</div>

<!-- Размеры -->
<div class="progress progress--sm"></div>
<div class="progress progress--lg"></div>
```

### Модалки
```html
<div class="modal" data-open="true" role="dialog" aria-modal="true">
  <div class="modal__overlay" data-close></div>
  <div class="modal__dialog">
    <div class="modal__content">
      <div class="modal__header">
        <h2 class="modal__title">Заголовок</h2>
        <button class="modal__close" aria-label="Закрыть">×</button>
      </div>
      <div class="modal__body">
        Содержимое модалки
      </div>
    </div>
  </div>
</div>
```

### Скелетоны
```html
<!-- Базовый скелетон -->
<div class="skeleton"></div>

<!-- Скелетон текста -->
<div class="skeleton skeleton--text"></div>

<!-- Скелетон карточки -->
<div class="skeleton skeleton--card"></div>

<!-- Скелетон кнопки -->
<div class="skeleton skeleton--button"></div>
```

## 📐 Layout утилиты

### Контейнеры
```html
<div class="container">Обычный контейнер</div>
<div class="container--wide">Широкий контейнер</div>
<div class="container--narrow">Узкий контейнер</div>
```

### Stack (вертикальные отступы)
```html
<div class="stack">
  <div>Элемент 1</div>
  <div>Элемент 2</div> <!-- margin-top: 12px -->
</div>

<div class="stack--sm">Маленькие отступы</div>
<div class="stack--md">Средние отступы</div>
<div class="stack--lg">Большие отступы</div>
<div class="stack--xl">Очень большие отступы</div>
```

### Cluster (горизонтальные отступы)
```html
<div class="cluster">
  <div>Элемент 1</div>
  <div>Элемент 2</div> <!-- gap: 12px -->
</div>

<div class="cluster--sm">Маленькие отступы</div>
<div class="cluster--md">Средние отступы</div>
<div class="cluster--lg">Большие отступы</div>
<div class="cluster--xl">Очень большие отступы</div>
```

### Grid
```html
<div class="grid grid--2">2 колонки</div>
<div class="grid grid--3">3 колонки</div>
<div class="grid grid--4">4 колонки</div>
```

## 🔤 Типографика

### Заголовки
```html
<h1 class="h1">Заголовок 1</h1>
<h2 class="h2">Заголовок 2</h2>
<h3 class="h3">Заголовок 3</h3>
<h4 class="h4">Заголовок 4</h4>
```

### Текст
```html
<p class="body">Основной текст</p>
<p class="subtle">Второстепенный текст</p>
<p class="caption">Подпись</p>
<span class="num">Числа (моноширинный)</span>
```

## 🎯 Telegram WebApp интеграция

### Автоматические функции
- Применение `themeParams` из Telegram
- Haptic feedback на все интерактивные элементы
- Автоматическое определение системной темы
- Поддержка viewport изменений

### Ручное управление
```javascript
// Haptic feedback
window.telegramApp.haptic.light();
window.telegramApp.haptic.medium();
window.telegramApp.haptic.heavy();

// Главная кнопка
window.telegramApp.showMainButton('Продолжить', callback);
window.telegramApp.hideMainButton();

// Кнопка назад
window.telegramApp.showBackButton(callback);
window.telegramApp.hideBackButton();

// Закрытие приложения
window.telegramApp.close();
```

## 🎨 Переключение тем

### Автоматическое
- Переключатель тем автоматически добавляется в header
- Тема сохраняется в localStorage
- Поддержка системной темы для modern

### Ручное управление
```javascript
// Переключение темы
window.themeSwitcher.applyTheme('conspiracy');

// Получение текущей темы
const currentTheme = window.themeSwitcher.getCurrentTheme();

// Сброс к теме по умолчанию
window.themeSwitcher.resetToDefault();

// Применение кастомных цветов
window.themeSwitcher.applyCustomTheme({
  accent: '#FF0000',
  accent2: '#00FF00'
});
```

## ♿ Доступность (A11y)

### Фокус
- Заметное focus ring на всех интерактивных элементах
- Поддержка `:focus-visible`
- Цвета фокуса через CSS переменные

### Клавиатура
- Закрытие модалок по `Esc`
- Навигация по `Tab`
- Поддержка `Enter` и `Space` для кнопок

### Семантика
- Правильные `role` атрибуты
- `aria-label`, `aria-describedby`
- `aria-modal="true"` для модалок

### Контраст
- Минимальный контраст AA (4.5:1)
- Поддержка `prefers-contrast: high`
- Автоматическая адаптация для светлых тем

## 🚀 Производительность

### Оптимизации
- `will-change: transform` только на интерактивных элементах
- Минимальное использование `backdrop-filter`
- CSS переменные для быстрой смены тем
- Уважение `prefers-reduced-motion`

### Анимации
- Плавные переходы через CSS переменные
- Оптимизированные easing функции
- Анимации только при необходимости

## 📱 Адаптивность

### Breakpoints
- **Mobile**: до 480px
- **Tablet**: до 768px
- **Desktop**: от 769px

### Адаптивные классы
```css
@media (max-width: 768px) {
  .quests-grid {
    grid-template-columns: 1fr;
  }
  
  .container {
    padding: 0 16px;
  }
}
```

## 🔧 Кастомизация

### CSS переменные
```css
:root {
  --accent: #A8FF61;
  --accent-2: #22E1FF;
  --bg: #0B0B0C;
  --surface: #121214;
  --text: #FFFFFF;
}
```

### Создание новых тем
```css
[data-theme="custom"] {
  --accent: #FF6B6B;
  --accent-2: #4ECDC4;
  --bg: #2C3E50;
  --surface: #34495E;
  --text: #ECF0F1;
}
```

## 🧪 Тестирование

### Браузеры
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Устройства
- iOS 14+
- Android 10+
- Desktop (Windows, macOS, Linux)

### Проверки
- [ ] Все компоненты работают
- [ ] Темы переключаются корректно
- [ ] Haptic feedback работает
- [ ] Доступность соответствует стандартам
- [ ] Производительность удовлетворительная

## 📚 Примеры использования

### Полная страница квеста
```html
<!DOCTYPE html>
<html lang="ru" data-theme="modern">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Квест</title>
  
  <!-- Подключение дизайн-системы -->
  <link rel="stylesheet" href="./styles/tokens.css" />
  <link rel="stylesheet" href="./styles/typography.css" />
  <link rel="stylesheet" href="./styles/layout.css" />
  <link rel="stylesheet" href="./styles/components.css" />
</head>
<body>
  <header class="container cluster" style="justify-content:space-between; padding:12px 0;">
    <div class="cluster">
      <img src="./logo.png" alt="logo" width="28" height="28" />
      <h1 class="h3">Название</h1>
    </div>
    <button class="btn btn--primary">Действие</button>
  </header>
  
  <main class="container">
    <div class="card padding">
      <div class="stack">
        <h2 class="h2">Заголовок</h2>
        <p class="body">Описание</p>
        <div class="cluster">
          <span class="chip">Тег</span>
          <button class="btn btn--primary">Кнопка</button>
        </div>
      </div>
    </div>
  </main>
  
  <script src="./js/telegram.js"></script>
  <script src="./js/theme-switcher.js"></script>
</body>
</html>
```

## 🤝 Вклад в проект

### Добавление новых компонентов
1. Создать CSS класс в соответствующем файле
2. Добавить документацию в README
3. Создать примеры использования
4. Протестировать на разных устройствах

### Добавление новых тем
1. Добавить CSS переменные в `tokens.css`
2. Обновить `theme-switcher.js`
3. Добавить иконку в переключатель
4. Протестировать контраст и читаемость

## 📞 Поддержка

При возникновении проблем:
1. Проверить консоль браузера на ошибки
2. Убедиться в правильности подключения файлов
3. Проверить поддержку браузера
4. Создать issue с описанием проблемы

## 📄 Лицензия

MIT License - свободно используйте в своих проектах.
