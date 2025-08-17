# Assets Directory

Здесь должны находиться все ассеты для Mini App.

## Структура папок

```
assets/
├── skins/
│   ├── neo-solarpunk/
│   │   ├── bg.webp      # Фоновый слой
│   │   ├── mid.webp     # Средний слой
│   │   ├── fg.webp      # Передний слой
│   │   └── fog.webp     # Туман (опционально)
│   ├── artdeco/
│   │   ├── bg.webp
│   │   ├── mid.webp
│   │   ├── fg.webp
│   │   └── fog.webp
│   └── synthwave/
│       ├── bg.webp
│       ├── mid.webp
│       ├── fg.webp
│       └── fog.webp
├── covers/
│   ├── book1.webp       # Обложка книги 1
│   ├── book2.webp       # Обложка книги 2
│   └── ...
├── teasers/
│   ├── book1.webp       # Тизер книги 1
│   ├── book2.webp       # Тизер книги 2
│   └── ...
└── icons/
    ├── hotspot-tap.svg
    ├── hotspot-hold.svg
    ├── hotspot-minigame.svg
    └── ...
```

## Требования к ассетам

### Изображения
- **Формат**: WebP (оптимально) или PNG
- **Размер**: Адаптивный (1x, 1.5x, 2x для разных экранов)
- **Оптимизация**: Сжатие без потери качества

### Слои острова
- **bg.webp**: 1920x1080px, глубокий фон
- **mid.webp**: 1920x1080px, строения и ландшафт
- **fg.webp**: 1920x1080px, передний план и детали
- **fog.webp**: 1920x1080px, полупрозрачный туман

### Обложки книг
- **Размер**: 300x400px
- **Стиль**: Соответствует общему дизайну
- **Формат**: WebP с прозрачностью

## Заглушки

Для разработки можно использовать:
- [Placeholder.com](https://placeholder.com)
- [Picsum Photos](https://picsum.photos)
- [Unsplash](https://unsplash.com)

Примеры команд для создания заглушек:

```bash
# Фоновый слой
curl "https://picsum.photos/1920/1080" -o "assets/skins/neo-solarpunk/bg.webp"

# Обложка книги
curl "https://picsum.photos/300/400" -o "assets/covers/book1.webp"
```

## Стили скинов

### Neo-Solarpunk
- Цвета: #66F7D5, #A6B4FF, #FFE27A
- Стиль: Природа + технологии
- Элементы: Стеклянные панели, неоновые контуры

### Art-Deco
- Цвета: #D4AF37, #1E3A8A, #7C3AED
- Стиль: Элегантность прошлого века
- Элементы: Геометрические орнаменты

### Synthwave
- Цвета: #FF0080, #00FFFF, #FFD700
- Стиль: Будущее 80-х
- Элементы: Неоновые градиенты, глитч
