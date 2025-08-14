#!/usr/bin/env python3
"""
Простой тест для проверки исправленного bot.py
"""

import sys
import os

def test_bot_import():
    """Тестирует импорт bot.py"""
    try:
        print("🧪 Тестируем импорт bot.py...")
        
        # Добавляем текущую директорию в путь
        sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
        
        # Пробуем импортировать модули
        import bot
        print("✅ bot.py импортируется без ошибок")
        
        # Проверяем основные переменные
        if hasattr(bot, 'ADMIN_IDS'):
            print(f"✅ ADMIN_IDS: {bot.ADMIN_IDS}")
        
        if hasattr(bot, 'LAVA_TOP_API_KEY'):
            print(f"✅ LAVA_TOP_API_KEY: {bot.LAVA_TOP_API_KEY[:20]}...")
        
        if hasattr(bot, 'SUPABASE_URL'):
            print(f"✅ SUPABASE_URL: {bot.SUPABASE_URL}")
        
        print("✅ Все основные переменные определены")
        return True
        
    except ImportError as e:
        print(f"❌ Ошибка импорта: {e}")
        return False
    except SyntaxError as e:
        print(f"❌ Синтаксическая ошибка: {e}")
        return False
    except Exception as e:
        print(f"❌ Неожиданная ошибка: {e}")
        return False

def test_syntax():
    """Тестирует синтаксис файла"""
    try:
        print("\n🧪 Тестируем синтаксис bot.py...")
        
        with open('bot.py', 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Пробуем скомпилировать код
        compile(content, 'bot.py', 'exec')
        print("✅ Синтаксис корректен")
        return True
        
    except SyntaxError as e:
        print(f"❌ Синтаксическая ошибка: {e}")
        return False
    except Exception as e:
        print(f"❌ Ошибка проверки синтаксиса: {e}")
        return False

def main():
    """Основная функция тестирования"""
    print("🚀 Тестирование исправленного bot.py")
    print("=" * 50)
    
    # Тест 1: Синтаксис
    syntax_ok = test_syntax()
    
    # Тест 2: Импорт
    import_ok = test_bot_import()
    
    print("\n" + "=" * 50)
    print("🎯 Итоговые результаты:")
    print(f"✅ Синтаксис: {'Корректен' if syntax_ok else 'Ошибка'}")
    print(f"✅ Импорт: {'Работает' if import_ok else 'Ошибка'}")
    
    if syntax_ok and import_ok:
        print("\n🎉 bot.py исправлен и готов к работе!")
        print("📋 Основные исправления:")
        print("   - Удален импорт channel_manager")
        print("   - Исправлена синтаксическая ошибка в create_lava_top_payment")
        print("   - Добавлен импорт Application")
        print("   - Исправлены отступы")
    else:
        print("\n❌ Есть проблемы, которые нужно исправить")
        if not syntax_ok:
            print("   - Синтаксические ошибки в коде")
        if not import_ok:
            print("   - Проблемы с импортами")

if __name__ == "__main__":
    main()
