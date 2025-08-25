# PsyEarn Quests - Modern Neon Design System

Современная дизайн-система для Telegram miniapp с неоновым дизайном, поддержкой тем и полной интеграцией с Telegram WebApp.

## 🚀 Что реализовано

### ✅ Дизайн-система Modern Neon
- **Основная тема**: Лаймовый акцент `#A8FF61` + циан `#22E1FF`
- **Альтернативная тема**: Conspiracy с золотым акцентом `#DAA520`
- **Единые токены**: Цвета, радиусы, тени, анимации
- **Типографика**: Inter, Manrope, JetBrains Mono

### ✅ Компоненты
- **Кнопки**: Primary, Ghost, Danger с размерами S/M/L
- **Карточки**: С hover-эффектами и backdrop-filter
- **Чипы**: Статусы, теги, категории
- **Прогресс-бары**: С градиентами и glow-эффектами
- **Модалки**: Доступные, с фокус-ловушкой
- **Скелетоны**: Шиммер-эффекты для загрузки

### ✅ Layout система
- **Контейнеры**: Адаптивные с breakpoints
- **Stack**: Вертикальные отступы
- **Cluster**: Горизонтальные отступы
- **Grid**: Responsive сетки

### ✅ Telegram WebApp интеграция
- **themeParams**: Автоматическое применение цветов Telegram
- **Haptic Feedback**: На все интерактивные элементы
- **MainButton/BackButton**: Управление навигацией
- **Viewport**: Адаптация под размеры Telegram

### ✅ Доступность (A11y)
- **Focus management**: Заметные focus rings
- **Keyboard navigation**: Tab, Enter, Space, Escape
- **ARIA**: Правильные роли и атрибуты
- **Contrast**: Минимум AA (4.5:1)

### ✅ Производительность
- **CSS переменные**: Быстрая смена тем
- **will-change**: Только на интерактивных элементах
- **reduce-motion**: Уважение пользовательских настроек
- **Оптимизированные анимации**: CSS transforms + easing

## 📁 Структура проекта

```
docs/
├── styles/                    # CSS дизайн-система
│   ├── tokens.css            # Токены, темы, переменные
│   ├── typography.css        # Типографика и шрифты
│   ├── layout.css            # Layout утилиты
│   ├── components.css        # Компоненты UI
│   ├── skeleton.css          # Скелетоны и загрузка
│   ├── telegram.css          # Telegram WebApp стили
│   └── quests-specific.css   # Специфичные стили
├── js/                       # JavaScript модули
│   ├── telegram.js           # Telegram интеграция
│   └── theme-switcher.js     # Переключатель тем
├── quests.html               # Главная страница (обновлена)
├── design-system-demo.html   # Демо всех компонентов
├── README.md                 # Этот файл
└── README-DESIGN-DOCUMENTATION.md # Детальная документация
```

## 🎯 Основные страницы

### 1. `quests.html` - Главная страница
- ✅ Полностью обновлена под новую дизайн-систему
- ✅ Унифицированные карточки квестов
- ✅ Telegram интеграция + haptic feedback
- ✅ Переключатель тем в header
- ✅ Адаптивный дизайн

### 2. `design-system-demo.html` - Демо компонентов
- ✅ Все компоненты дизайн-системы
- ✅ Интерактивные примеры
- ✅ Переключение тем в реальном времени
- ✅ Модалки, тосты, скелетоны

## 🚀 Быстрый старт

### 1. Открыть главную страницу
```bash
# В браузере открыть
docs/quests.html
```

### 2. Посмотреть демо дизайн-системы
```bash
# В браузере открыть
docs/design-system-demo.html
```

### 3. Переключить темы
- 🎨 **Modern**: Неоновый дизайн (по умолчанию)
- 🔮 **Conspiracy**: Тема тайного правительства

## 🧩 Использование компонентов

### Кнопки
```html
<button class="btn btn--primary">Основная</button>
<button class="btn btn--ghost">Вторичная</button>
<button class="btn btn--danger">Опасная</button>
```

### Карточки
```html
<div class="card padding">
  <div class="stack">
    <h3 class="h3">Заголовок</h3>
    <p class="body">Описание</p>
  </div>
</div>
```

### Layout
```html
<div class="container">
  <div class="stack">
    <div class="cluster">
      <span class="chip">Тег</span>
      <button class="btn btn--primary">Кнопка</button>
    </div>
  </div>
</div>
```

## 🎨 Темы

### Modern Neon (default)
- **Фон**: `#0B0B0C` (темный)
- **Акцент**: `#A8FF61` (лаймовый)
- **Вторичный**: `#22E1FF` (циан)
- **Поверхности**: `#121214`, `#17181B`

### Conspiracy
- **Фон**: `#1B120D` (коричневый)
- **Акцент**: `#DAA520` (золотой)
- **Вторичный**: `#CD853F` (песочный)
- **Поверхности**: `#221710`, `#2B1D14`

## 🔧 Кастомизация

### Добавить новую тему
```css
[data-theme="custom"] {
  --accent: #FF6B6B;
  --accent-2: #4ECDC4;
  --bg: #2C3E50;
  --surface: #34495E;
  --text: #ECF0F1;
}
```

### Изменить цвета
```javascript
window.themeSwitcher.applyCustomTheme({
  accent: '#FF0000',
  accent2: '#00FF00'
});
```

## 📱 Адаптивность

- **Mobile**: до 480px
- **Tablet**: до 768px  
- **Desktop**: от 769px

Автоматическая адаптация всех компонентов под размер экрана.

## ♿ Доступность

- **Focus rings**: Заметные на всех интерактивных элементах
- **Keyboard**: Полная навигация по Tab, Enter, Space
- **Screen readers**: Правильные ARIA атрибуты
- **Contrast**: Минимум AA стандарт
- **Motion**: Уважение `prefers-reduced-motion`

## 🚀 Производительность

- **CSS переменные**: Мгновенная смена тем
- **Hardware acceleration**: `will-change: transform`
- **Minimal reflows**: Оптимизированные анимации
- **Lazy loading**: Компоненты загружаются по необходимости

## 🧪 Тестирование

### Браузеры
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Устройства
- ✅ iOS 14+
- ✅ Android 10+
- ✅ Desktop (Windows, macOS, Linux)

## 📚 Документация

- **[README-DESIGN-DOCUMENTATION.md](README-DESIGN-DOCUMENTATION.md)** - Детальная документация дизайн-системы
- **[design-system-demo.html](design-system-demo.html)** - Интерактивные примеры всех компонентов

## 🤝 Вклад в проект

### Добавить компонент
1. Создать CSS класс в соответствующем файле
2. Добавить в демо-страницу
3. Обновить документацию
4. Протестировать на разных устройствах

### Добавить тему
1. Добавить CSS переменные в `tokens.css`
2. Обновить `theme-switcher.js`
3. Добавить иконку в переключатель
4. Протестировать контраст

## 🐛 Известные проблемы

- **Telegram WebApp**: Требует запуск внутри Telegram
- **Fallback режим**: Автоматически активируется вне Telegram
- **Haptic feedback**: Работает только на поддерживаемых устройствах

## 📞 Поддержка

При проблемах:
1. Проверить консоль браузера
2. Убедиться в правильности подключения файлов
3. Проверить поддержку браузера
4. Создать issue с описанием

## 📄 Лицензия

MIT License - свободно используйте в своих проектах.

---

**🎉 Дизайн-система готова к использованию!**

Откройте `quests.html` для просмотра обновленной главной страницы или `design-system-demo.html` для изучения всех компонентов.
