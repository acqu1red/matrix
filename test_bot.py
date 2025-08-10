#!/usr/bin/env python3
"""
Тестовый скрипт для проверки работы бота
"""

import asyncio
from telegram import Bot
from supabase import create_client, Client

# Конфигурация
BOT_TOKEN = "8354723250:AAEWcX6OojEi_fN-RAekppNMVTAsQDU0wvo"
SUPABASE_URL = "https://uhhsrtmmuwoxsdquimaa.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoaHNydG1tdXdveHNkcXVpbWFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2OTMwMzcsImV4cCI6MjA3MDI2OTAzN30.5xxo6g-GEYh4ufTibaAtbgrifPIU_ilzGzolAdmAnm8"

ADMIN_IDS = [708907063, 7365307696]

async def test_bot():
    """Тестирует работу бота"""
    try:
        print("🤖 Тестирование бота...")
        
        # Создаем экземпляр бота
        bot = Bot(token=BOT_TOKEN)
        
        # Получаем информацию о боте
        bot_info = await bot.get_me()
        print(f"✅ Бот подключен: @{bot_info.username} ({bot_info.first_name})")
        
        # Тестируем отправку сообщения администраторам
        test_message = "🧪 Тестовое сообщение от бота\n\nЭто проверка работы системы уведомлений."
        
        for admin_id in ADMIN_IDS:
            try:
                print(f"📤 Отправляем тестовое сообщение администратору {admin_id}")
                await bot.send_message(
                    chat_id=admin_id,
                    text=test_message,
                    parse_mode='HTML'
                )
                print(f"✅ Сообщение отправлено администратору {admin_id}")
            except Exception as e:
                print(f"❌ Ошибка отправки администратору {admin_id}: {e}")
        
        # Тестируем базу данных
        print("\n🗄️ Тестирование базы данных...")
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        
        # Проверяем функцию get_admin_conversations
        try:
            result = supabase.rpc('get_admin_conversations').execute()
            print(f"✅ Функция get_admin_conversations работает: {len(result.data)} записей")
        except Exception as e:
            print(f"❌ Ошибка функции get_admin_conversations: {e}")
        
        # Тестируем вставку тестового сообщения
        try:
            # Создаем тестового пользователя
            test_user = {
                'telegram_id': 123456789,
                'username': 'test_user',
                'first_name': 'Test',
                'last_name': 'User'
            }
            
            # Вставляем пользователя
            supabase.table('users').upsert(test_user).execute()
            
            # Создаем диалог
            conversation_data = {
                'user_id': 123456789,
                'status': 'open'
            }
            conv_result = supabase.table('conversations').insert(conversation_data).execute()
            
            # Вставляем сообщение
            message_data = {
                'conversation_id': conv_result.data[0]['id'],
                'sender_id': 123456789,
                'content': 'Тестовое сообщение для проверки админ панели',
                'message_type': 'text'
            }
            supabase.table('messages').insert(message_data).execute()
            
            print("✅ Тестовое сообщение добавлено в БД")
            
            # Проверяем, что сообщение появилось в админ панели
            result = supabase.rpc('get_admin_conversations').execute()
            test_conversation = next((conv for conv in result.data if conv['user_id'] == 123456789), None)
            
            if test_conversation:
                print("✅ Тестовое сообщение найдено в админ панели")
            else:
                print("❌ Тестовое сообщение не найдено в админ панели")
            
            # Очищаем тестовые данные
            supabase.table('messages').delete().eq('sender_id', 123456789).execute()
            supabase.table('conversations').delete().eq('user_id', 123456789).execute()
            supabase.table('users').delete().eq('telegram_id', 123456789).execute()
            print("🧹 Тестовые данные очищены")
            
        except Exception as e:
            print(f"❌ Ошибка тестирования БД: {e}")
        
        await bot.close()
        print("\n✅ Тестирование завершено")
        
    except Exception as e:
        print(f"❌ Ошибка тестирования: {e}")

if __name__ == "__main__":
    asyncio.run(test_bot())
