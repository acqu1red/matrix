#!/usr/bin/env python3
import os
import requests
import json

def check_env_vars():
    print("=== ПРОВЕРКА ПЕРЕМЕННЫХ ОКРУЖЕНИЯ ===")
    vars_to_check = [
        'TELEGRAM_BOT_TOKEN',
        'WEBHOOK_URL', 
        'WEBHOOK_SECRET',
        'LAVA_TOP_API_KEY',
        'LAVA_OFFER_ID_BASIC'
    ]
    
    for var in vars_to_check:
        value = os.getenv(var, '')
        if value:
            if 'TOKEN' in var or 'KEY' in var:
                print(f"✅ {var}: {value[:10]}...{value[-10:]}")
            else:
                print(f"✅ {var}: {value}")
        else:
            print(f"❌ {var}: НЕ ЗАДАН")

def check_telegram_bot():
    print("\n=== ПРОВЕРКА TELEGRAM БОТА ===")
    token = os.getenv('TELEGRAM_BOT_TOKEN', '').strip()
    if not token:
        print("❌ TELEGRAM_BOT_TOKEN не задан")
        return
    
    try:
        # Проверяем getMe
        r = requests.get(f"https://api.telegram.org/bot{token}/getMe", timeout=10)
        if r.ok:
            data = r.json()
            print(f"✅ Бот: {data.get('result', {}).get('username', 'unknown')}")
            print(f"✅ Имя: {data.get('result', {}).get('first_name', 'unknown')}")
        else:
            print(f"❌ getMe ошибка: {r.status_code} {r.text}")
    except Exception as e:
        print(f"❌ Ошибка getMe: {e}")

def check_webhook():
    print("\n=== ПРОВЕРКА WEBHOOK ===")
    token = os.getenv('TELEGRAM_BOT_TOKEN', '').strip()
    webhook_url = os.getenv('WEBHOOK_URL', '').strip()
    
    if not token:
        print("❌ TELEGRAM_BOT_TOKEN не задан")
        return
    
    if not webhook_url:
        print("❌ WEBHOOK_URL не задан")
        return
    
    try:
        # Проверяем текущий webhook
        r = requests.get(f"https://api.telegram.org/bot{token}/getWebhookInfo", timeout=10)
        if r.ok:
            data = r.json()
            current_url = data.get('result', {}).get('url', '')
            expected_url = f"{webhook_url.rstrip('/')}/webhook"
            
            print(f"📡 Текущий webhook: {current_url}")
            print(f"🎯 Ожидаемый webhook: {expected_url}")
            
            if current_url == expected_url:
                print("✅ Webhook настроен правильно")
            else:
                print("❌ Webhook настроен неправильно")
                
                # Пытаемся исправить
                print("🔄 Исправляем webhook...")
                fix_webhook(token, expected_url)
        else:
            print(f"❌ getWebhookInfo ошибка: {r.status_code} {r.text}")
    except Exception as e:
        print(f"❌ Ошибка проверки webhook: {e}")

def fix_webhook(token, target_url):
    webhook_secret = os.getenv('WEBHOOK_SECRET', 'FORMULA_TMP_SECRET')
    
    try:
        # Удаляем старый webhook
        r_del = requests.post(f"https://api.telegram.org/bot{token}/deleteWebhook",
                              json={"drop_pending_updates": False}, timeout=10)
        print(f"🗑️  Удаление webhook: {r_del.status_code}")
        
        # Устанавливаем новый webhook
        payload = {
            "url": target_url,
            "secret_token": webhook_secret,
            "max_connections": 40,
            "allowed_updates": ["message", "callback_query"]
        }
        r_set = requests.post(f"https://api.telegram.org/bot{token}/setWebhook",
                              json=payload, timeout=10)
        
        if r_set.ok:
            data = r_set.json()
            if data.get('ok'):
                print("✅ Webhook успешно установлен")
            else:
                print(f"❌ Ошибка установки webhook: {data}")
        else:
            print(f"❌ Ошибка setWebhook: {r_set.status_code} {r_set.text}")
    except Exception as e:
        print(f"❌ Ошибка исправления webhook: {e}")

def test_webhook_endpoint():
    print("\n=== ТЕСТ WEBHOOK ENDPOINT ===")
    webhook_url = os.getenv('WEBHOOK_URL', '').strip()
    
    if not webhook_url:
        print("❌ WEBHOOK_URL не задан")
        return
    
    test_url = f"{webhook_url.rstrip('/')}/webhook-info"
    print(f"🔗 Тестируем: {test_url}")
    
    try:
        r = requests.get(test_url, timeout=10)
        if r.ok:
            print("✅ Endpoint доступен")
            try:
                data = r.json()
                print(f"📊 Ответ: {json.dumps(data, indent=2, ensure_ascii=False)}")
            except:
                print(f"📄 Ответ: {r.text}")
        else:
            print(f"❌ Endpoint недоступен: {r.status_code}")
    except Exception as e:
        print(f"❌ Ошибка тестирования endpoint: {e}")

if __name__ == "__main__":
    print("🔍 ДИАГНОСТИКА TELEGRAM WEBHOOK")
    print("=" * 50)
    
    check_env_vars()
    check_telegram_bot()
    check_webhook()
    test_webhook_endpoint()
    
    print("\n" + "=" * 50)
    print("💡 РЕКОМЕНДАЦИИ:")
    print("1. Убедитесь, что все переменные окружения заданы в Railway")
    print("2. Проверьте, что WEBHOOK_URL указывает на правильный домен")
    print("3. Отправьте /start боту и нажмите 'Оплатить'")
    print("4. Проверьте логи Railway на наличие 'HTTP IN:' сообщений")
