#!/usr/bin/env python3
"""
Matrix Quest Bot - Telegram Game Bot
Bot Token: 8435828779:AAFo5UccSatCkqmblr6AW6YrrJli89j6GyQ
"""

import os
import json
import logging
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, ContextTypes

# Настройка логирования
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Конфигурация
BOT_TOKEN = "8435828779:AAFo5UccSatCkqmblr6AW6YrrJli89j6GyQ"
GAME_URL = "https://acqu1red.github.io/matrix/game.html"
SUPPORT_USERNAME = "@matrix_support"

class MatrixQuestBot:
    def __init__(self):
        self.application = Application.builder().token(BOT_TOKEN).build()
        self.setup_handlers()
    
    def setup_handlers(self):
        """Настройка обработчиков команд"""
        # Команды
        self.application.add_handler(CommandHandler("start", self.start_command))
        self.application.add_handler(CommandHandler("help", self.help_command))
        self.application.add_handler(CommandHandler("game", self.game_command))
        self.application.add_handler(CommandHandler("support", self.support_command))
        self.application.add_handler(CommandHandler("stats", self.stats_command))
        
        # Callback queries
        self.application.add_handler(CallbackQueryHandler(self.handle_callback))
    
    async def start_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Обработчик команды /start"""
        user = update.effective_user
        welcome_text = f"""
🎮 <b>Добро пожаловать в Matrix Quest!</b>

Привет, {user.first_name}! 👋

🧠 <b>Matrix Quest</b> - это интерактивная игра, где ты можешь:
• 📈 Анализировать тренды рынка
• 🎯 Читать эмоции трейдеров  
• 🔮 Предсказывать будущее
• 💰 Зарабатывать виртуальные деньги

<b>Доступные команды:</b>
/game - 🎮 Запустить игру
/support - 💬 Поддержка
/stats - 📊 Статистика
/help - ❓ Помощь

Готов стать успешным трейдером? 🚀
        """
        
        keyboard = [
            [InlineKeyboardButton("🎮 Играть", web_app=WebAppInfo(url=GAME_URL))],
            [InlineKeyboardButton("💬 Поддержка", callback_data="support"),
             InlineKeyboardButton("📊 Статистика", callback_data="stats")]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await update.message.reply_text(
            welcome_text, 
            parse_mode='HTML', 
            reply_markup=reply_markup
        )
    
    async def help_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Обработчик команды /help"""
        help_text = """
❓ <b>Помощь по Matrix Quest</b>

<b>🎮 Как играть:</b>
1. Нажми /game или кнопку "Играть"
2. Выбери квест "Анализ Трендов"
3. Проходи этапы:
   • Этап 1: Свайпай тренды (вправо = успех, влево = провал)
   • Этап 2: Анализируй эмоции в постах
   • Этап 3: Рисуй прогнозы на графике
   • Этап 4: Инвестируй и зарабатывай

<b>🎯 Управление:</b>
• 👆 Тап - выбор и взаимодействие
• 👈👉 Свайп - оценка трендов
• ✏️ Рисование - создание прогнозов

<b>🏆 Достижения:</b>
• Аналитик - правильно проанализируй 5 трендов
• Эмоциональный детектив - проанализируй все посты
• Пророк - создай точный прогноз (80%+)
• Инвестор - заработай $500+

<b>📞 Поддержка:</b>
Если есть вопросы, пиши: @matrix_support
        """
        
        keyboard = [
            [InlineKeyboardButton("🎮 Запустить игру", web_app=WebAppInfo(url=GAME_URL))],
            [InlineKeyboardButton("💬 Поддержка", url=f"https://t.me/{SUPPORT_USERNAME[1:]}")]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await update.message.reply_text(
            help_text, 
            parse_mode='HTML', 
            reply_markup=reply_markup
        )
    
    async def game_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Обработчик команды /game"""
        game_text = """
🎮 <b>Matrix Quest - Анализ Трендов</b>

Готов стать успешным трейдером? 

В игре тебя ждут:
• 📈 Анализ рыночных трендов
• 🧠 Чтение эмоций трейдеров
• 🔮 Предсказание будущего
• 💰 Виртуальные инвестиции

<b>Нажми кнопку ниже, чтобы начать!</b>
        """
        
        keyboard = [
            [InlineKeyboardButton("🚀 Начать игру", web_app=WebAppInfo(url=GAME_URL))],
            [InlineKeyboardButton("📖 Как играть", callback_data="help"),
             InlineKeyboardButton("💬 Поддержка", callback_data="support")]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await update.message.reply_text(
            game_text, 
            parse_mode='HTML', 
            reply_markup=reply_markup
        )
    
    async def support_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Обработчик команды /support"""
        support_text = """
💬 <b>Поддержка Matrix Quest</b>

<b>📞 Связь с нами:</b>
• Telegram: @matrix_support
• Email: support@matrix-quest.com

<b>❓ Частые вопросы:</b>
• <b>Как играть?</b> - Используй /help
• <b>Не работает игра?</b> - Попробуй обновить страницу
• <b>Проблемы с сохранением?</b> - Очисти кэш браузера

<b>🐛 Сообщить об ошибке:</b>
Опиши проблему и отправь @matrix_support

<b>💡 Предложения:</b>
Мы всегда рады новым идеям!
        """
        
        keyboard = [
            [InlineKeyboardButton("💬 Написать в поддержку", url=f"https://t.me/{SUPPORT_USERNAME[1:]}")],
            [InlineKeyboardButton("🎮 Вернуться к игре", web_app=WebAppInfo(url=GAME_URL))]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await update.message.reply_text(
            support_text, 
            parse_mode='HTML', 
            reply_markup=reply_markup
        )
    
    async def stats_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Обработчик команды /stats"""
        user_id = update.effective_user.id
        stats_text = f"""
📊 <b>Статистика игрока</b>

👤 <b>ID:</b> {user_id}
🎮 <b>Игр сыграно:</b> 0
⭐ <b>Лучший счет:</b> 0
🏆 <b>Достижений:</b> 0

<b>🎯 Прогресс по квестам:</b>
• Анализ Трендов: Не начат
• Психология Лжи: Скоро
• Профилирование: Скоро

<b>💡 Совет:</b>
Начни с квеста "Анализ Трендов" для получения первых очков!
        """
        
        keyboard = [
            [InlineKeyboardButton("🎮 Играть", web_app=WebAppInfo(url=GAME_URL))],
            [InlineKeyboardButton("📖 Помощь", callback_data="help")]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await update.message.reply_text(
            stats_text, 
            parse_mode='HTML', 
            reply_markup=reply_markup
        )
    
    async def handle_callback(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Обработчик callback queries"""
        query = update.callback_query
        await query.answer()
        
        if query.data == "support":
            await self.support_command(update, context)
        elif query.data == "stats":
            await self.stats_command(update, context)
        elif query.data == "help":
            await self.help_command(update, context)
    
    def run(self):
        """Запуск бота"""
        logger.info("Starting Matrix Quest Bot...")
        self.application.run_polling()

def main():
    """Главная функция"""
    bot = MatrixQuestBot()
    bot.run()

if __name__ == '__main__':
    main()
