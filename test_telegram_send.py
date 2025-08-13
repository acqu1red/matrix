#!/usr/bin/env python3
"""
Тест отправки сообщений боту через Telegram API
"""

import requests
import json

def test_send_message():
    """Отправляет тестовое сообщение боту"""
    bot_token = "7593794536:AAGSiEJolK1O1H5LMtHxnbygnuhTDoII6qc"
    
    # Замените на ваш Telegram ID
    chat_id = "708907063"  # ID администратора
    
    print("🧪 Отправляем тестовое сообщение боту...")
    
    # Отправляем команду /start
    start_url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    start_data = {
        "chat_id": chat_id,
        "text": "/start"
    }
    
    try:
        response = requests.post(start_url, json=start_data)
        print(f"📡 Ответ отправки /start: {response.status_code}")
        print(f"📡 Ответ: {response.text}")
        
        if response.status_code == 200:
            result = response.json()
            if result.get('ok'):
                print("✅ Команда /start отправлена успешно")
                return True
            else:
                print(f"❌ Ошибка отправки: {result}")
                return False
        else:
            print(f"❌ HTTP ошибка: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Ошибка отправки: {e}")
        return False

def test_webhook_receive():
    """Тестирует получение данных webhook"""
    print("\n🧪 Тестируем получение данных webhook...")
    
    # Тестовые данные от Telegram
    test_data = {
        "update_id": 123456789,
        "message": {
            "message_id": 1,
            "from": {
                "id": 708907063,
                "first_name": "Test",
                "username": "testuser"
            },
            "chat": {
                "id": 708907063,
                "type": "private"
            },
            "date": 1234567890,
            "text": "/start"
        }
    }
    
    try:
        response = requests.post(
            "https://formulaprivate-productionpaymentuknow.up.railway.app/test-receive",
            json=test_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"📡 Ответ тестового endpoint: {response.status_code}")
        print(f"📡 Ответ: {response.text}")
        
        if response.status_code == 200:
            print("✅ Тестовый endpoint работает")
            return True
        else:
            print(f"❌ Ошибка тестового endpoint: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Ошибка тестирования: {e}")
        return False

def main():
    """Основная функция тестирования"""
    print("🚀 Тестирование отправки сообщений боту")
    print("=" * 60)
    
    # Тест 1: Отправка сообщения боту
    send_ok = test_send_message()
    
    # Тест 2: Тестирование webhook
    webhook_ok = test_webhook_receive()
    
    print("\n" + "=" * 60)
    print("🎯 Итоговые результаты:")
    print(f"✅ Отправка сообщения: {'Работает' if send_ok else 'Ошибка'}")
    print(f"✅ Webhook endpoint: {'Работает' if webhook_ok else 'Ошибка'}")
    
    if send_ok and webhook_ok:
        print("\n🎉 Все тесты прошли успешно!")
        print("📱 Бот должен получать сообщения!")
    else:
        print("\n❌ Есть проблемы, которые нужно исправить")

if __name__ == "__main__":
    main()
