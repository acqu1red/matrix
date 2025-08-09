import os
import asyncio
from datetime import datetime
from supabase import create_client, Client
from telegram import Bot
from typing import Dict, List, Optional
import json

class SupabaseBackend:
    def __init__(self):
        self.url = "https://uhhsrtmmuwoxsdquimaa.supabase.co"
        self.key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoaHNydG1tdXdveHNkcXVpbWFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2OTMwMzcsImV4cCI6MjA3MDI2OTAzN30.5xxo6g-GEYh4ufTibaAtbgrifPIU_ilzGzolAdmAnm8"
        self.client: Client = create_client(self.url, self.key)
        self.bot_token = "8354723250:AAEWcX6OojEi_fN-RAekppNMVTAsQDU0wvo"
        self.bot = Bot(token=self.bot_token)

    async def create_or_get_user(self, telegram_id: int, username: str = None, 
                                first_name: str = None, last_name: str = None) -> Dict:
        """Создает или получает пользователя"""
        try:
            # Проверяем, существует ли пользователь
            result = self.client.table('users').select('*').eq('telegram_id', telegram_id).execute()
            
            if result.data:
                return result.data[0]
            
            # Создаем нового пользователя
            user_data = {
                'telegram_id': telegram_id,
                'username': username,
                'first_name': first_name,
                'last_name': last_name,
                'is_admin': False
            }
            
            result = self.client.table('users').insert(user_data).execute()
            return result.data[0]
            
        except Exception as e:
            print(f"Ошибка при создании/получении пользователя: {e}")
            return None

    async def create_conversation(self, user_id: int) -> Optional[str]:
        """Создает новый диалог или возвращает существующий"""
        try:
            # Проверяем существующий открытый диалог
            result = self.client.table('conversations').select('*')\
                .eq('user_id', user_id)\
                .eq('status', 'open')\
                .execute()
            
            if result.data:
                return result.data[0]['id']
            
            # Создаем новый диалог
            conversation_data = {
                'user_id': user_id,
                'status': 'open'
            }
            
            result = self.client.table('conversations').insert(conversation_data).execute()
            return result.data[0]['id']
            
        except Exception as e:
            print(f"Ошибка при создании диалога: {e}")
            return None

    async def add_message(self, conversation_id: str, sender_id: int, 
                         content: str, message_type: str = 'text',
                         file_url: str = None, file_name: str = None) -> Dict:
        """Добавляет сообщение в диалог"""
        try:
            message_data = {
                'conversation_id': conversation_id,
                'sender_id': sender_id,
                'content': content,
                'message_type': message_type,
                'file_url': file_url,
                'file_name': file_name
            }
            
            result = self.client.table('messages').insert(message_data).execute()
            return result.data[0]
            
        except Exception as e:
            print(f"Ошибка при добавлении сообщения: {e}")
            return None

    async def get_admin_conversations(self) -> List[Dict]:
        """Получает все диалоги для админ-панели"""
        try:
            result = self.client.table('admin_conversations_view').select('*').execute()
            return result.data
        except Exception as e:
            print(f"Ошибка при получении диалогов: {e}")
            return []

    async def get_conversation_messages(self, conversation_id: str) -> List[Dict]:
        """Получает сообщения диалога"""
        try:
            result = self.client.table('messages_with_users_view')\
                .select('*')\
                .eq('conversation_id', conversation_id)\
                .order('created_at', desc=False)\
                .execute()
            return result.data
        except Exception as e:
            print(f"Ошибка при получении сообщений: {e}")
            return []

    async def assign_admin_to_conversation(self, conversation_id: str, admin_id: int):
        """Назначает администратора на диалог"""
        try:
            result = self.client.table('conversations')\
                .update({'admin_id': admin_id, 'status': 'in_progress'})\
                .eq('id', conversation_id)\
                .execute()
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"Ошибка при назначении админа: {e}")
            return None

    async def mark_messages_as_read(self, conversation_id: str, reader_id: int):
        """Отмечает сообщения как прочитанные"""
        try:
            result = self.client.table('messages')\
                .update({'is_read': True})\
                .eq('conversation_id', conversation_id)\
                .neq('sender_id', reader_id)\
                .execute()
            return True
        except Exception as e:
            print(f"Ошибка при отметке сообщений: {e}")
            return False

    async def notify_user_about_response(self, user_id: int, conversation_id: str):
        """Отправляет уведомление пользователю о новом ответе"""
        try:
            message_text = (
                "💬 <b>У вас новый ответ от администратора!</b>\n\n"
                "Администратор ответил на ваш вопрос."
            )
            
            from telegram import InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
            
            keyboard = [[
                InlineKeyboardButton(
                    "👀 Посмотреть ответ", 
                    web_app=WebAppInfo(url=f"https://acqu1red.github.io/tourmalineGG/webapp/?conversation={conversation_id}")
                )
            ]]
            
            reply_markup = InlineKeyboardMarkup(keyboard)
            
            await self.bot.send_message(
                chat_id=user_id,
                text=message_text,
                parse_mode='HTML',
                reply_markup=reply_markup
            )
            
            return True
            
        except Exception as e:
            print(f"Ошибка при отправке уведомления: {e}")
            return False

    async def is_user_admin(self, telegram_id: int) -> bool:
        """Проверяет, является ли пользователь администратором"""
        try:
            result = self.client.table('users')\
                .select('is_admin')\
                .eq('telegram_id', telegram_id)\
                .execute()
            
            if result.data:
                return result.data[0].get('is_admin', False)
            return False
            
        except Exception as e:
            print(f"Ошибка при проверке админа: {e}")
            return False

    async def get_user_by_telegram_id(self, telegram_id: int) -> Optional[Dict]:
        """Получает пользователя по Telegram ID"""
        try:
            result = self.client.table('users')\
                .select('*')\
                .eq('telegram_id', telegram_id)\
                .execute()
            
            return result.data[0] if result.data else None
            
        except Exception as e:
            print(f"Ошибка при получении пользователя: {e}")
            return None

# Singleton instance
backend = SupabaseBackend()

# API функции для использования в Flask/FastAPI
async def handle_new_message(user_data: Dict, message_content: str, 
                           message_type: str = 'text', file_data: Dict = None):
    """Обрабатывает новое сообщение от пользователя"""
    
    # Создаем или получаем пользователя
    user = await backend.create_or_get_user(
        telegram_id=user_data['telegram_id'],
        username=user_data.get('username'),
        first_name=user_data.get('first_name'),
        last_name=user_data.get('last_name')
    )
    
    if not user:
        return {'error': 'Не удалось создать пользователя'}
    
    # Создаем или получаем диалог
    conversation_id = await backend.create_conversation(user_data['telegram_id'])
    
    if not conversation_id:
        return {'error': 'Не удалось создать диалог'}
    
    # Добавляем сообщение
    message = await backend.add_message(
        conversation_id=conversation_id,
        sender_id=user_data['telegram_id'],
        content=message_content,
        message_type=message_type,
        file_url=file_data.get('url') if file_data else None,
        file_name=file_data.get('name') if file_data else None
    )
    
    if not message:
        return {'error': 'Не удалось сохранить сообщение'}
    
    return {
        'success': True,
        'conversation_id': conversation_id,
        'message_id': message['id']
    }

async def handle_admin_response(admin_telegram_id: int, conversation_id: str, 
                              message_content: str, message_type: str = 'text'):
    """Обрабатывает ответ администратора"""
    
    # Проверяем, что пользователь - админ
    is_admin = await backend.is_user_admin(admin_telegram_id)
    if not is_admin:
        return {'error': 'Доступ запрещен'}
    
    # Назначаем админа на диалог
    await backend.assign_admin_to_conversation(conversation_id, admin_telegram_id)
    
    # Добавляем сообщение
    message = await backend.add_message(
        conversation_id=conversation_id,
        sender_id=admin_telegram_id,
        content=message_content,
        message_type=message_type
    )
    
    if not message:
        return {'error': 'Не удалось сохранить ответ'}
    
    # Получаем информацию о диалоге для уведомления
    conversations = await backend.get_admin_conversations()
    conversation = next((c for c in conversations if c['id'] == conversation_id), None)
    
    if conversation:
        # Отправляем уведомление пользователю
        await backend.notify_user_about_response(
            user_id=conversation['user_id'],
            conversation_id=conversation_id
        )
    
    return {
        'success': True,
        'message_id': message['id']
    }

async def get_admin_panel_data(admin_telegram_id: int):
    """Получает данные для админ-панели"""
    
    # Проверяем права админа
    is_admin = await backend.is_user_admin(admin_telegram_id)
    if not is_admin:
        return {'error': 'Доступ запрещен'}
    
    # Получаем список диалогов
    conversations = await backend.get_admin_conversations()
    
    return {
        'conversations': conversations,
        'admin_id': admin_telegram_id
    }
