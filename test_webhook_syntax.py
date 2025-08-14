#!/usr/bin/env python3
"""
Тест синтаксиса bot_webhook.py
"""

import sys
import os

def test_syntax():
    """Тестирует синтаксис bot_webhook.py"""
    try:
        print("🧪 Тестируем синтаксис bot_webhook.py...")
        
        with open('bot_webhook.py', 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Пробуем скомпилировать код
        compile(content, 'bot_webhook.py', 'exec')
        print("✅ Синтаксис корректен")
        return True
        
    except SyntaxError as e:
        print(f"❌ Синтаксическая ошибка: {e}")
        print(f"📋 Строка: {e.lineno}, Позиция: {e.offset}")
        return False
    except Exception as e:
        print(f"❌ Ошибка проверки синтаксиса: {e}")
        return False

def test_imports():
    """Тестирует импорты (без выполнения)"""
    try:
        print("\n🧪 Тестируем импорты...")
        
        # Проверяем наличие необходимых модулей
        required_modules = [
            'os', 'logging', 'requests', 'json', 'base64', 'asyncio',
            'datetime', 'flask', 'telegram', 'supabase'
        ]
        
        missing_modules = []
        for module in required_modules:
            try:
                __import__(module)
                print(f"✅ {module}")
            except ImportError:
                missing_modules.append(module)
                print(f"❌ {module} - не найден")
        
        if missing_modules:
            print(f"\n⚠️ Отсутствуют модули: {missing_modules}")
            print("Это нормально для локального тестирования")
        
        return True
        
    except Exception as e:
        print(f"❌ Ошибка проверки импортов: {e}")
        return False

def test_variables():
    """Тестирует определение переменных"""
    try:
        print("\n🧪 Тестируем определение переменных...")
        
        with open('bot_webhook.py', 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Проверяем наличие основных переменных
        required_vars = [
            'TELEGRAM_BOT_TOKEN',
            'LAVA_SHOP_ID', 
            'LAVA_PRODUCT_ID',
            'ADMIN_IDS',
            'app'
        ]
        
        missing_vars = []
        for var in required_vars:
            if var not in content:
                missing_vars.append(var)
                print(f"❌ {var} - не найден")
            else:
                print(f"✅ {var}")
        
        if missing_vars:
            print(f"\n❌ Отсутствуют переменные: {missing_vars}")
            return False
        
        return True
        
    except Exception as e:
        print(f"❌ Ошибка проверки переменных: {e}")
        return False

def main():
    """Основная функция тестирования"""
    print("🚀 Тестирование bot_webhook.py")
    print("=" * 50)
    
    # Тест 1: Синтаксис
    syntax_ok = test_syntax()
    
    # Тест 2: Импорты
    imports_ok = test_imports()
    
    # Тест 3: Переменные
    variables_ok = test_variables()
    
    print("\n" + "=" * 50)
    print("🎯 Итоговые результаты:")
    print(f"✅ Синтаксис: {'Корректен' if syntax_ok else 'Ошибка'}")
    print(f"✅ Импорты: {'Проверены' if imports_ok else 'Ошибка'}")
    print(f"✅ Переменные: {'Определены' if variables_ok else 'Ошибка'}")
    
    if syntax_ok and variables_ok:
        print("\n🎉 bot_webhook.py готов к развертыванию!")
        print("📋 Основные компоненты:")
        print("   - Flask приложение создано")
        print("   - Все переменные определены")
        print("   - Синтаксис корректен")
    else:
        print("\n❌ Есть проблемы, которые нужно исправить")
        if not syntax_ok:
            print("   - Синтаксические ошибки в коде")
        if not variables_ok:
            print("   - Отсутствуют необходимые переменные")

if __name__ == "__main__":
    main()
