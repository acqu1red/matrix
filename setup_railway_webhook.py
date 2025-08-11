#!/usr/bin/env python3
"""
Скрипт для настройки webhook после деплоя на Railway
"""

import os
import requests
import json

def setup_railway_webhook():
    """Настраивает webhook для Railway приложения"""
    
    print("🚀 Настройка webhook для Railway приложения")
    print("=" * 50)
    
    # Получаем URL от пользователя
    railway_url = input("Введите URL вашего Railway приложения (например, https://your-app.railway.app): ").strip()
    
    if not railway_url:
        print("❌ URL не может быть пустым!")
        return False
    
    # Убираем слеш в конце, если есть
    if railway_url.endswith('/'):
        railway_url = railway_url[:-1]
    
    # Формируем полный URL webhook
    webhook_url = f"{railway_url}/webhook"
    
    print(f"\n📡 Webhook URL: {webhook_url}")
    
    # Проверяем доступность приложения
    print("\n🔍 Проверяем доступность приложения...")
    try:
        health_response = requests.get(f"{railway_url}/health", timeout=10)
        if health_response.status_code == 200:
            print("✅ Приложение доступно")
        else:
            print(f"⚠️ Приложение отвечает с кодом: {health_response.status_code}")
    except Exception as e:
        print(f"⚠️ Не удалось проверить приложение: {e}")
        print("Продолжаем настройку webhook...")
    
    # Настраиваем webhook в Telegram
    print(f"\n🤖 Настраиваем webhook в Telegram...")
    
    bot_token = "7593794536:AAGSiEJolK1O1H5LMtHxnbygnuhTDoII6qc"
    webhook_secret = "telegram_webhook_secret_2024"
    
    webhook_data = {
        "url": webhook_url,
        "secret_token": webhook_secret
    }
    
    try:
        response = requests.post(
            f"https://api.telegram.org/bot{bot_token}/setWebhook",
            json=webhook_data,
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            if result['ok']:
                print("✅ Webhook успешно установлен в Telegram!")
                
                # Проверяем статус
                print("\n📋 Проверяем статус webhook...")
                status_response = requests.get(f"https://api.telegram.org/bot{bot_token}/getWebhookInfo")
                if status_response.status_code == 200:
                    status_data = status_response.json()
                    if status_data['ok']:
                        webhook_info = status_data['result']
                        print(f"🔗 URL: {webhook_info.get('url', 'Не установлен')}")
                        print(f"✅ Установлен: {webhook_info.get('is_set', False)}")
                        print(f"📊 Ожидающие обновления: {webhook_info.get('pending_update_count', 0)}")
                
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

def setup_lava_webhook(railway_url):
    """Инструкции по настройке webhook в Lava Top"""
    
    print("\n" + "=" * 50)
    print("🔧 Настройка webhook в Lava Top")
    print("=" * 50)
    
    lava_webhook_url = f"{railway_url}/lava-webhook"
    
    print(f"📡 Lava Top webhook URL: {lava_webhook_url}")
    print(f"🔑 Secret: lava_webhook_secret_2024_secure_key")
    
    print("\n📝 Инструкции:")
    print("1. Войдите в [Lava Top Dashboard](https://app.lava.top)")
    print("2. Перейдите в настройки вашего проекта")
    print("3. Найдите раздел 'Webhooks' или 'Уведомления'")
    print("4. Добавьте новый webhook:")
    print(f"   - URL: {lava_webhook_url}")
    print("   - Метод: POST")
    print("   - События: payment.success")
    print("   - Secret: lava_webhook_secret_2024_secure_key")
    
    return True

def main():
    """Основная функция"""
    
    print("🎯 Настройка webhook для Railway приложения")
    print("=" * 50)
    
    # Настраиваем Telegram webhook
    if setup_railway_webhook():
        # Получаем URL для Lava Top
        railway_url = input("\nВведите URL вашего Railway приложения еще раз для Lava Top: ").strip()
        if railway_url.endswith('/'):
            railway_url = railway_url[:-1]
        
        # Настраиваем Lava Top webhook
        setup_lava_webhook(railway_url)
        
        print("\n" + "=" * 50)
        print("✅ Настройка завершена!")
        print("=" * 50)
        print("\n🎯 Что делать дальше:")
        print("1. Проверьте логи в Railway Dashboard")
        print("2. Отправьте команду /start боту")
        print("3. Сделайте тестовый платеж через Lava Top")
        print("4. Проверьте, что пользователь получил сообщение")
        
    else:
        print("\n❌ Настройка не завершена. Проверьте ошибки выше.")

if __name__ == '__main__':
    main()
