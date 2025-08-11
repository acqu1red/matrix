#!/usr/bin/env python3
"""
Channel management system for automatic approval and user removal
"""

import asyncio
from datetime import datetime, timedelta
from telegram import Update, ChatMemberUpdated, ChatMember
from telegram.ext import ContextTypes, ChatMemberHandler
from telegram.constants import ParseMode
from supabase import create_client, Client
import logging

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Supabase configuration
SUPABASE_URL = "https://uhhsrtmmuwoxsdquimaa.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoaHNydG1tdXdveHNkcXVpbWFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2OTMwMzcsImV4cCI6MjA3MDI2OTAzN30.5xxo6g-GEYh4ufTibaAtbgrifPIU_ilzGzolAdmAnm8"
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Channel configuration
CHANNEL_ID = -1001234567890  # Замените на ID вашего канала
CHANNEL_INVITE_LINK = "https://t.me/+6SQb4RwwAmZlMWQ6"

# Admin IDs
ADMIN_IDS = [708907063, 7365307696]

class ChannelManager:
    def __init__(self):
        self.channel_id = CHANNEL_ID
        
    async def handle_chat_member_update(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
        """Обрабатывает обновления участников канала"""
        try:
            # Проверяем, что это наш канал
            if update.chat_member.chat.id != self.channel_id:
                return
                
            # Получаем информацию о пользователе
            user = update.chat_member.new_chat_member.user
            old_status = update.chat_member.old_chat_member.status
            new_status = update.chat_member.new_chat_member.status
            
            logger.info(f"Channel member update: {user.id} ({user.username}) - {old_status} -> {new_status}")
            
            # Если пользователь подал заявку на вступление
            if (old_status == ChatMember.LEFT and 
                new_status == ChatMember.RESTRICTED and 
                update.chat_member.new_chat_member.is_member is False):
                
                await self.handle_join_request(user, context)
                
            # Если пользователь покинул канал
            elif (old_status in [ChatMember.MEMBER, ChatMember.ADMINISTRATOR] and 
                  new_status == ChatMember.LEFT):
                
                await self.handle_user_left(user, context)
                
        except Exception as e:
            logger.error(f"Error handling chat member update: {e}")
    
    async def handle_join_request(self, user, context: ContextTypes.DEFAULT_TYPE) -> None:
        """Обрабатывает заявку на вступление в канал"""
        try:
            logger.info(f"Processing join request from user {user.id} ({user.username})")
            
            # Проверяем, есть ли у пользователя активная подписка
            subscription = await self.get_active_subscription(user.id)
            
            if subscription:
                # Принимаем пользователя в канал
                await context.bot.approve_chat_join_request(
                    chat_id=self.channel_id,
                    user_id=user.id
                )
                
                # Обновляем статус в базе данных
                await self.update_subscription_channel_status(
                    subscription['id'], 
                    user.id, 
                    True
                )
                
                # Отправляем приветственное сообщение
                await self.send_welcome_message(user, context, subscription)
                
                # Уведомляем администраторов
                await self.notify_admins_about_new_member(user, context, subscription)
                
                logger.info(f"User {user.id} approved and added to channel")
                
            else:
                # Отклоняем заявку
                await context.bot.decline_chat_join_request(
                    chat_id=self.channel_id,
                    user_id=user.id
                )
                
                # Отправляем сообщение пользователю
                await self.send_no_subscription_message(user, context)
                
                logger.info(f"User {user.id} rejected - no active subscription")
                
        except Exception as e:
            logger.error(f"Error handling join request: {e}")
    
    async def handle_user_left(self, user, context: ContextTypes.DEFAULT_TYPE) -> None:
        """Обрабатывает выход пользователя из канала"""
        try:
            logger.info(f"User {user.id} left the channel")
            
            # Обновляем статус в базе данных
            await self.update_subscription_channel_status(
                None, 
                user.id, 
                False
            )
            
        except Exception as e:
            logger.error(f"Error handling user left: {e}")
    
    async def get_active_subscription(self, user_id: int):
        """Получает активную подписку пользователя"""
        try:
            result = supabase.table('subscriptions').select('*').eq('user_id', user_id).eq('subscription_status', 'active').gte('end_date', datetime.now().isoformat()).execute()
            
            if result.data:
                return result.data[0]
            return None
            
        except Exception as e:
            logger.error(f"Error getting active subscription: {e}")
            return None
    
    async def update_subscription_channel_status(self, subscription_id: int, user_id: int, joined: bool):
        """Обновляет статус участия в канале"""
        try:
            if subscription_id:
                supabase.table('subscriptions').update({
                    'channel_joined': joined,
                    'channel_member_id': user_id if joined else None,
                    'updated_at': datetime.now().isoformat()
                }).eq('id', subscription_id).execute()
            else:
                # Обновляем все подписки пользователя
                supabase.table('subscriptions').update({
                    'channel_joined': joined,
                    'channel_member_id': None,
                    'updated_at': datetime.now().isoformat()
                }).eq('user_id', user_id).execute()
                
        except Exception as e:
            logger.error(f"Error updating subscription channel status: {e}")
    
    async def send_welcome_message(self, user, context: ContextTypes.DEFAULT_TYPE, subscription):
        """Отправляет приветственное сообщение пользователю"""
        try:
            welcome_text = f"""
🎉 <b>Добро пожаловать в закрытый канал ФОРМУЛА!</b>

Привет, {user.first_name}! 

Ваша заявка одобрена, и теперь у вас есть доступ ко всем материалам канала.

📅 <b>Ваша подписка:</b>
• Тариф: {subscription.get('tariff', 'Не указан')}
• Доступ до: {subscription.get('end_date', 'Не указана')}

🚀 <b>Что вас ждет в канале:</b>
• Эксклюзивные материалы по психологии
• Стратегии заработка и инвестирования  
• Биохакинг и оптимизация здоровья
• Трейдинг и скальпинг
• Прямые эфиры и разборы вопросов

💬 <b>По всем вопросам:</b> @cashm3thod

Добро пожаловать в клуб! 🏆
            """
            
            await context.bot.send_message(
                chat_id=user.id,
                text=welcome_text,
                parse_mode=ParseMode.HTML
            )
            
        except Exception as e:
            logger.error(f"Error sending welcome message: {e}")
    
    async def send_no_subscription_message(self, user, context: ContextTypes.DEFAULT_TYPE):
        """Отправляет сообщение пользователю без подписки"""
        try:
            no_sub_text = f"""
❌ <b>Заявка отклонена</b>

Привет, {user.first_name}!

К сожалению, ваша заявка на вступление в закрытый канал ФОРМУЛА была отклонена.

<b>Возможные причины:</b>
• У вас нет активной подписки
• Подписка истекла
• Ошибка в данных

💳 <b>Для получения доступа:</b>
1. Оплатите подписку через бота @your_bot
2. Дождитесь подтверждения оплаты
3. Получите приглашение на email
4. Подайте заявку повторно

💬 <b>По всем вопросам:</b> @cashm3thod
            """
            
            await context.bot.send_message(
                chat_id=user.id,
                text=no_sub_text,
                parse_mode=ParseMode.HTML
            )
            
        except Exception as e:
            logger.error(f"Error sending no subscription message: {e}")
    
    async def notify_admins_about_new_member(self, user, context: ContextTypes.DEFAULT_TYPE, subscription):
        """Уведомляет администраторов о новом участнике"""
        try:
            admin_message = f"""
🎉 <b>Новый участник канала!</b>

👤 <b>Пользователь:</b> {user.first_name}
🆔 <b>ID:</b> {user.id}
📧 <b>Email:</b> {subscription.get('email', 'Не указан')}
💵 <b>Тариф:</b> {subscription.get('tariff', 'Не указан')}
💰 <b>Сумма:</b> {subscription.get('price_rub', 'Не указана')} RUB
📅 <b>Доступ до:</b> {subscription.get('end_date', 'Не указана')}

✅ Пользователь автоматически принят в канал
            """
            
            for admin_id in ADMIN_IDS:
                try:
                    await context.bot.send_message(
                        chat_id=admin_id,
                        text=admin_message,
                        parse_mode=ParseMode.HTML
                    )
                except Exception as e:
                    logger.error(f"Error notifying admin {admin_id}: {e}")
                    
        except Exception as e:
            logger.error(f"Error notifying admins: {e}")
    
    async def remove_expired_users(self, context: ContextTypes.DEFAULT_TYPE):
        """Удаляет пользователей с истекшей подпиской"""
        try:
            logger.info("Checking for expired subscriptions...")
            
            # Получаем истекшие подписки
            result = supabase.rpc('get_expired_subscriptions').execute()
            
            if not result.data:
                logger.info("No expired subscriptions found")
                return
            
            for subscription in result.data:
                user_id = subscription['user_id']
                
                try:
                    # Удаляем пользователя из канала
                    await context.bot.ban_chat_member(
                        chat_id=self.channel_id,
                        user_id=user_id,
                        until_date=datetime.now() + timedelta(seconds=30)  # Разбан через 30 секунд
                    )
                    
                    # Обновляем статус подписки
                    supabase.table('subscriptions').update({
                        'subscription_status': 'expired',
                        'channel_joined': False,
                        'channel_member_id': None,
                        'updated_at': datetime.now().isoformat()
                    }).eq('id', subscription['subscription_id']).execute()
                    
                    # Отправляем уведомление пользователю
                    await self.send_expired_notification(user_id, context, subscription)
                    
                    # Уведомляем администраторов
                    await self.notify_admins_about_expired_user(user_id, context, subscription)
                    
                    logger.info(f"User {user_id} removed due to expired subscription")
                    
                except Exception as e:
                    logger.error(f"Error removing user {user_id}: {e}")
                    
        except Exception as e:
            logger.error(f"Error removing expired users: {e}")
    
    async def send_expired_notification(self, user_id: int, context: ContextTypes.DEFAULT_TYPE, subscription):
        """Отправляет уведомление об истечении подписки"""
        try:
            expired_text = f"""
⚠️ <b>Подписка истекла</b>

Ваша подписка на закрытый канал ФОРМУЛА истекла.

<b>Что это значит:</b>
• Вы больше не можете видеть материалы канала
• Вам нужно продлить подписку для продолжения доступа

💳 <b>Для продления:</b>
1. Обратитесь к @cashm3thod
2. Выберите новый тариф
3. Оплатите подписку
4. Получите новый доступ

Спасибо за участие в нашем клубе! 🙏
            """
            
            await context.bot.send_message(
                chat_id=user_id,
                text=expired_text,
                parse_mode=ParseMode.HTML
            )
            
        except Exception as e:
            logger.error(f"Error sending expired notification: {e}")
    
    async def notify_admins_about_expired_user(self, user_id: int, context: ContextTypes.DEFAULT_TYPE, subscription):
        """Уведомляет администраторов об удалении пользователя"""
        try:
            admin_message = f"""
❌ <b>Пользователь удален из канала</b>

👤 <b>Пользователь ID:</b> {user_id}
📧 <b>Email:</b> {subscription.get('email', 'Не указан')}
💵 <b>Тариф:</b> {subscription.get('tariff', 'Не указан')}
📅 <b>Подписка истекла:</b> {subscription.get('end_date', 'Не указана')}

✅ Пользователь автоматически удален из канала
            """
            
            for admin_id in ADMIN_IDS:
                try:
                    await context.bot.send_message(
                        chat_id=admin_id,
                        text=admin_message,
                        parse_mode=ParseMode.HTML
                    )
                except Exception as e:
                    logger.error(f"Error notifying admin {admin_id}: {e}")
                    
        except Exception as e:
            logger.error(f"Error notifying admins about expired user: {e}")

# Создаем экземпляр менеджера канала
channel_manager = ChannelManager()
