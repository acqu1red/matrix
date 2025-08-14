#!/bin/bash

# Активация виртуального окружения
if [ -d "venv" ]; then
    echo "Активирую виртуальное окружение..."
    source venv/bin/activate
else
    echo "Виртуальное окружение не найдено. Создаю..."
    python3 -m venv venv
    source venv/bin/activate
    echo "Устанавливаю зависимости..."
    pip install -r requirements.txt
fi

# Запуск приложения
echo "Запускаю bot_webhook_app.py (основной файл для Railway)..."
python bot_webhook_app.py
