#!/usr/bin/env python3
"""
Скрипт для мониторинга и автоматического восстановления webhook
"""

import requests
import time
import json
from datetime import datetime

def check_webhook_status():
    """Проверяет статус webhook"""
    try:
        response = requests.get("https://formulaprivate-productionpaymentuknow.up.railway.app/webhook-info")
        if response.status_code == 200:
            data = response.json()
            current_url = data.get('current_url', '')
            expected_url = data.get('expected_url', '')
            needs_fix = data.get('needs_fix', False)
            auto_fixed = data.get('auto_fixed', False)
            
            print(f"🔍 Проверка webhook: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
            print(f"   Текущий URL: {current_url}")
            print(f"   Ожидаемый URL: {expected_url}")
            print(f"   Требует исправления: {needs_fix}")
            print(f"   Автоматически исправлен: {auto_fixed}")
            
            return needs_fix, auto_fixed
        else:
            print(f"❌ Ошибка получения статуса webhook: {response.status_code}")
            return True, False
            
    except Exception as e:
        print(f"❌ Ошибка проверки webhook: {e}")
        return True, False

def force_webhook_reset():
    """Принудительно сбрасывает webhook"""
    try:
        print("🔄 Принудительный сброс webhook...")
        response = requests.get("https://formulaprivate-productionpaymentuknow.up.railway.app/reset-webhook")
        if response.status_code == 200:
            data = response.json()
            print("✅ Webhook сброшен успешно")
            return True
        else:
            print(f"❌ Ошибка сброса webhook: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Ошибка сброса webhook: {e}")
        return False

def monitor_webhook(interval=60):
    """Мониторит webhook с заданным интервалом"""
    print(f"🚀 Запуск мониторинга webhook с интервалом {interval} секунд")
    print("=" * 60)
    
    consecutive_failures = 0
    max_failures = 3
    
    while True:
        try:
            needs_fix, auto_fixed = check_webhook_status()
            
            if needs_fix:
                consecutive_failures += 1
                print(f"⚠️ Webhook требует исправления (попытка {consecutive_failures}/{max_failures})")
                
                if consecutive_failures >= max_failures:
                    print("🔄 Принудительный сброс webhook...")
                    if force_webhook_reset():
                        consecutive_failures = 0
                        print("✅ Webhook восстановлен")
                    else:
                        print("❌ Не удалось восстановить webhook")
            else:
                consecutive_failures = 0
                print("✅ Webhook работает правильно")
            
            print(f"⏰ Следующая проверка через {interval} секунд...")
            print("-" * 40)
            time.sleep(interval)
            
        except KeyboardInterrupt:
            print("\n🛑 Мониторинг остановлен пользователем")
            break
        except Exception as e:
            print(f"❌ Ошибка мониторинга: {e}")
            time.sleep(interval)

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        try:
            interval = int(sys.argv[1])
        except ValueError:
            print("❌ Неверный интервал. Используйте число секунд.")
            sys.exit(1)
    else:
        interval = 60  # По умолчанию 60 секунд
    
    monitor_webhook(interval)
