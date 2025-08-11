#!/usr/bin/env python3
"""
Скрипт для настройки webhook в Telegram Bot API
"""

import os
import requests
import json

def setup_webhook():
    """Настраивает webhook для Telegram бота"""
    
    # Получаем переменные окружения
    bot_token = os.getenv('TELEGRAM_BOT_TOKEN', '7593794536:AAGSiEJolK1O1H5LMtHxnbygnuhTDoII6qc')
    webhook_url = os.getenv('WEBHOOK_URL', '')
    webhook_secret = os.getenv('WEBHOOK_SECRET', 'your_webhook_secret')
    
    if not webhook_url:
        print("❌ WEBHOOK_URL не установлен!")
        print("Установите переменную окружения WEBHOOK_URL")
        return False
    
    # Формируем полный URL webhook
    full_webhook_url = f"{webhook_url}/webhook"
    
    print(f"🤖 Настройка webhook для бота...")
    print(f"📡 URL: {full_webhook_url}")
    
    # Проверяем текущий статус webhook
    print("\n📋 Проверяем текущий статус webhook...")
    status_url = f"https://api.telegram.org/bot{bot_token}/getWebhookInfo"
    
    try:
        response = requests.get(status_url)
        if response.status_code == 200:
            webhook_info = response.json()
            if webhook_info['ok']:
                current_url = webhook_info['result'].get('url', '')
                if current_url:
                    print(f"📍 Текущий webhook: {current_url}")
                else:
                    print("📍 Webhook не установлен")
            else:
                print(f"❌ Ошибка получения информации: {webhook_info.get('description', 'Unknown error')}")
                return False
        else:
            print(f"❌ Ошибка HTTP: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Ошибка проверки статуса: {e}")
        return False
    
    # Устанавливаем новый webhook
    print(f"\n🔧 Устанавливаем webhook...")
    webhook_url_api = f"https://api.telegram.org/bot{bot_token}/setWebhook"
    
    webhook_data = {
        "url": full_webhook_url,
        "secret_token": webhook_secret
    }
    
    try:
        response = requests.post(webhook_url_api, json=webhook_data)
        if response.status_code == 200:
            result = response.json()
            if result['ok']:
                print("✅ Webhook успешно установлен!")
                return True
            else:
                print(f"❌ Ошибка установки webhook: {result.get('description', 'Unknown error')}")
                return False
        else:
            print(f"❌ Ошибка HTTP: {response.status_code}")
            print(f"Ответ: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Ошибка установки webhook: {e}")
        return False

def delete_webhook():
    """Удаляет webhook и переключает бота на polling"""
    
    bot_token = os.getenv('TELEGRAM_BOT_TOKEN', '7593794536:AAGSiEJolK1O1H5LMtHxnbygnuhTDoII6qc')
    
    print("🗑️ Удаляем webhook...")
    
    delete_url = f"https://api.telegram.org/bot{bot_token}/deleteWebhook"
    
    try:
        response = requests.post(delete_url)
        if response.status_code == 200:
            result = response.json()
            if result['ok']:
                print("✅ Webhook успешно удален!")
                print("🔄 Бот переключен на режим polling")
                return True
            else:
                print(f"❌ Ошибка удаления webhook: {result.get('description', 'Unknown error')}")
                return False
        else:
            print(f"❌ Ошибка HTTP: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Ошибка удаления webhook: {e}")
        return False

def check_webhook_status():
    """Проверяет статус webhook"""
    
    bot_token = os.getenv('TELEGRAM_BOT_TOKEN', '7593794536:AAGSiEJolK1O1H5LMtHxnbygnuhTDoII6qc')
    
    print("📋 Проверяем статус webhook...")
    
    status_url = f"https://api.telegram.org/bot{bot_token}/getWebhookInfo"
    
    try:
        response = requests.get(status_url)
        if response.status_code == 200:
            webhook_info = response.json()
            if webhook_info['ok']:
                result = webhook_info['result']
                
                print(f"🔗 URL: {result.get('url', 'Не установлен')}")
                print(f"✅ Установлен: {result.get('is_set', False)}")
                print(f"📊 Ожидающие обновления: {result.get('pending_update_count', 0)}")
                
                if result.get('last_error_date'):
                    print(f"❌ Последняя ошибка: {result.get('last_error_message', 'Unknown error')}")
                
                return True
            else:
                print(f"❌ Ошибка получения информации: {webhook_info.get('description', 'Unknown error')}")
                return False
        else:
            print(f"❌ Ошибка HTTP: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Ошибка проверки статуса: {e}")
        return False

def main():
    """Основная функция"""
    
    import sys
    
    if len(sys.argv) > 1:
        command = sys.argv[1].lower()
        
        if command == 'setup':
            setup_webhook()
        elif command == 'delete':
            delete_webhook()
        elif command == 'status':
            check_webhook_status()
        elif command == 'help':
            print("""
🤖 Скрипт управления webhook для Telegram бота

Использование:
  python setup_webhook.py setup    - Установить webhook
  python setup_webhook.py delete   - Удалить webhook
  python setup_webhook.py status   - Проверить статус webhook
  python setup_webhook.py help     - Показать эту справку

Переменные окружения:
  TELEGRAM_BOT_TOKEN - Токен вашего бота
  WEBHOOK_URL        - URL вашего приложения (например, https://your-app.railway.app)
  WEBHOOK_SECRET     - Секретный токен для webhook
            """)
        else:
            print(f"❌ Неизвестная команда: {command}")
            print("Используйте 'python setup_webhook.py help' для справки")
    else:
        print("❌ Не указана команда!")
        print("Используйте 'python setup_webhook.py help' для справки")

if __name__ == '__main__':
    main()
