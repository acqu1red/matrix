# 🚀 Деплой на GitHub Pages

## Быстрый деплой

1. **Соберите проект:**
```bash
cd docs/miniapp
npm run build
```

2. **Загрузите на GitHub Pages:**
- Скопируйте содержимое папки `dist/` 
- Загрузите в репозиторий `acqu1red/formulaprivate` в папку `miniapp/`
- Или используйте GitHub Actions для автоматического деплоя

## Структура файлов для GitHub Pages

```
formulaprivate/
├── miniapp/
│   ├── index.html          # Главная страница
│   ├── assets/             # Собранные ассеты
│   │   ├── index-*.js      # JavaScript бандлы
│   │   ├── index-*.css     # CSS бандлы
│   │   └── ...
│   └── ...
├── payment.html            # Существующая страница оплаты
├── subscription.html       # Существующая страница подписки
└── ...
```

## Настройка GitHub Actions (опционально)

Создайте файл `.github/workflows/deploy-miniapp.yml`:

```yaml
name: Deploy Mini App

on:
  push:
    branches: [ main ]
    paths: [ 'docs/miniapp/**' ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: docs/miniapp/package-lock.json
    
    - name: Install dependencies
      run: |
        cd docs/miniapp
        npm ci
    
    - name: Build Mini App
      run: |
        cd docs/miniapp
        npm run build
    
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./docs/miniapp/dist
        destination_dir: ./miniapp
```

## Проверка деплоя

После деплоя Mini App будет доступен по адресу:
```
https://acqu1red.github.io/formulaprivate/miniapp/
```

## Обновление bot.py

Убедитесь, что в `bot.py` указан правильный URL:

```python
MINIAPP_URL = "https://acqu1red.github.io/formulaprivate/miniapp/index.html"
```

## Тестирование

1. Откройте бота в Telegram
2. Нажмите "Открыть остров 🌴"
3. Проверьте работу всех функций:
   - Параллакс эффекты
   - Сбор фрагментов
   - Мини-игры
   - Ежедневные награды
   - Смена скинов

## Устранение проблем

**Если Mini App не загружается:**
- Проверьте правильность URL в bot.py
- Убедитесь, что файлы загружены в правильную папку
- Проверьте консоль браузера на ошибки

**Если ассеты не загружаются:**
- Добавьте реальные изображения в папку `public/assets/`
- Или используйте заглушки с Picsum Photos

## Готово! 🎉

Ваш Mini App теперь работает на GitHub Pages и интегрирован с Telegram ботом!
