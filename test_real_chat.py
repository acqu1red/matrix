#!/usr/bin/env python3
"""
Тест с реальным chat_id для проверки отправки сообщений
"""

import requests
import json
from datetime import datetime

def test_with_real_chat_id():
    """Тестирует с реальным chat_id"""
    print("🧪 Тестируем с реальным chat_id...")
    
    # Замените на реальный chat_id вашего бота
    # Чтобы получить chat_id, отправьте сообщение боту и проверьте логи
    real_chat_id = 7567695472  # Из логов видно, что это реальный пользователь
    
    # Тестовые данные с реальным chat_id
    webhook_data = {
        "update_id": 123456789,
        "message": {
            "message_id": 1,
            "from": {
                "id": real_chat_id,
                "is_bot": False,
                "first_name": "Konstantin",
                "last_name": "🧠🍴",
                "username": "warpscythe",
                "language_code": "ru"
            },
            "chat": {
                "id": real_chat_id,
                "first_name": "Konstantin",
                "last_name": "🧠🍴",
                "type": "private",
                "username": "warpscythe"
            },
            "date": int(datetime.now().timestamp()),
            "web_app_data": {
                "data": json.dumps({
                    "step": "final_data",
                    "email": "test@example.com",
                    "tariff": "1_month",
                    "price": 50.0,
                    "userId": str(real_chat_id)
                }),
                "button_text": "Оплатить"
            }
        }
    }
    
    print(f"📤 Отправляем данные с реальным chat_id: {real_chat_id}")
    
    # Отправляем запрос к webhook
    webhook_url = "https://formulaprivate-productionpaymentuknow.up.railway.app/webhook"
    
    try:
        response = requests.post(
            webhook_url,
            json=webhook_data,
            headers={
                "Content-Type": "application/json",
                "X-Telegram-Bot-Api-Secret-Token": "Telegram_Webhook_Secret_2024_Formula_Bot_7a6b5c"
            },
            timeout=30
        )
        
        print(f"📡 Webhook ответ: {response.status_code}")
        print(f"📡 Webhook текст: {response.text}")
        
        if response.status_code == 200:
            print("✅ Webhook обработан успешно!")
            print("📱 Проверьте, получили ли вы сообщение от бота в Telegram")
            return True
        else:
            print(f"❌ Webhook ошибка: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Ошибка webhook запроса: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Тест с реальным chat_id...")
    success = test_with_real_chat_id()
    
    if success:
        print("\n✅ Тест завершен успешно!")
        print("📱 Проверьте Telegram - бот должен отправить сообщение с кнопкой оплаты")
    else:
        print("\n❌ Тест не прошел")
