# 🧠 Matrix Quest - Информация о проекте

## 📊 Статистика проекта

- **Тип**: Telegram Game Bot
- **Платформа**: Web (GitHub Pages)
- **Языки**: Python, JavaScript, HTML, CSS
- **Статус**: Готов к развертыванию

## 🎯 Основные компоненты

### 1. Telegram Bot (`bot.py`)
- **Токен**: 8435828779:AAFo5UccSatCkqmblr6AW6YrrJli89j6GyQ
- **URL игры**: https://acqu1red.github.io/matrix/
- **Поддержка**: @matrix_support

### 2. Игра (`game.html`, `game.css`, `game.js`)
- **Главная страница**: index.html
- **Стили**: game.css
- **Логика**: game.js
- **Интеграция**: Telegram Games API

### 3. Квесты (`docs/quests/`)
- **Анализ Трендов**: trends.html + trends-*.js
- **Стили**: trends-core.css
- **Статус**: Готов к использованию

## 🚀 Готовность к развертыванию

### ✅ Выполнено
- [x] Создан Telegram бот с новым токеном
- [x] Создана игра с главным меню
- [x] Интегрирован квест "Анализ Трендов"
- [x] Добавлена система поддержки
- [x] Создана документация
- [x] Настроена мобильная оптимизация
- [x] Удалены ненужные файлы

### 🔄 Следующие шаги
1. **Создать игру в BotFather** (`/newgame`)
2. **Загрузить код на GitHub** (acqu1red/matrix)
3. **Включить GitHub Pages**
4. **Запустить бота**

## 📁 Финальная структура

```
matrix/
├── index.html              # Главная страница (GitHub Pages)
├── game.html              # Игра (альтернативная точка входа)
├── game.css               # Стили игры
├── game.js                # Логика игры
├── bot.py                 # Telegram бот
├── requirements.txt       # Python зависимости
├── README.md              # Документация
├── DEPLOY.md              # Инструкция по развертыванию
├── PROJECT_INFO.md        # Этот файл
├── .gitignore             # Git исключения
├── .nojekyll              # Отключение Jekyll
└── docs/quests/           # Квесты
    ├── trends.html        # Квест "Анализ Трендов"
    ├── trends-core.css    # Стили квеста
    ├── trends-data.js     # Данные квеста
    ├── trends-engine.js   # Движок квеста
    ├── trends-ui.js       # UI квеста
    └── trends-main.js     # Главный файл квеста
```

## 🎮 Особенности игры

### Мобильная оптимизация
- Touch-friendly интерфейс
- Свайп-жесты для трендов
- Рисование пальцем для прогнозов
- Адаптивный дизайн

### Telegram интеграция
- WebApp для полноэкранного режима
- Отправка результатов в Telegram
- Система достижений
- Сохранение прогресса

### Квест "Анализ Трендов"
- **4 этапа**: Свайпы → Эмоции → Прогнозы → Инвестиции
- **15 минут** среднее время прохождения
- **Образовательный контент** по трейдингу
- **Геймификация** с очками и достижениями

## 🔧 Технические детали

### Frontend
- **Vanilla JavaScript** - без внешних зависимостей
- **CSS Grid/Flexbox** - современная верстка
- **Telegram Games API** - интеграция с Telegram
- **LocalStorage** - сохранение прогресса

### Backend
- **Python 3.8+** - основной язык
- **python-telegram-bot** - библиотека для Telegram
- **WebApp** - интеграция с веб-приложением

### Хостинг
- **GitHub Pages** - статические файлы
- **Любой VPS** - для бота (Heroku, Railway, DigitalOcean)

## 📞 Контакты

- **GitHub**: [acqu1red/matrix](https://github.com/acqu1red/matrix)
- **Telegram**: [@matrix_support](https://t.me/matrix_support)
- **Email**: support@matrix-quest.com

---

**Проект готов к развертыванию!** 🚀
