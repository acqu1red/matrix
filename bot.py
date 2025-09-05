from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, ContextTypes
import logging
import os

# --- CONFIGURATION ---
BOT_TOKEN = "8435828779:AAFo5UccSatCkqmblr6AW6YrrJli89j6GyQ"
MINIAPP_URL = "https://acqu1red.github.io/formulaprivate/index.html"

# Настройка логирования
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

class MatrixPsychoBot:
    def __init__(self):
        self.application = Application.builder().token(BOT_TOKEN).build()
        self.setup_handlers()
    
    def setup_handlers(self):
        """Настройка обработчиков команд"""
        self.application.add_handler(CommandHandler("start", self.start_command))
        self.application.add_handler(CommandHandler("help", self.help_command))
        self.application.add_handler(CallbackQueryHandler(self.button_callback))
    
    async def start_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Обработчик команды /start"""
        user = update.effective_user
        
        # Создаем клавиатуру с кнопкой запуска miniapps
        keyboard = [
            [InlineKeyboardButton(
                "🚀 Запустить Центр Симуляций", 
                web_app=WebAppInfo(url=MINIAPP_URL)
            )]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        welcome_text = f"""
👋 Добро пожаловать, {user.first_name}!

🎯 **Центр Симуляций** - это уникальная платформа для развития навыков через интерактивные квесты.

🧠 **Что вас ждет:**
• Психологические симуляции
• Анализ трендов и рынков
• Стратегические квесты
• Развитие навыков влияния

Нажмите кнопку ниже, чтобы начать!
        """
        
        await update.message.reply_text(
            welcome_text,
            reply_markup=reply_markup,
            parse_mode='Markdown'
        )
    
    async def help_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Обработчик команды /help"""
        help_text = """
🆘 **Помощь по боту**

**Основные команды:**
/start - Запустить Центр Симуляций
/help - Показать эту справку

**Как использовать:**
1. Нажмите /start
2. Нажмите "🚀 Запустить Центр Симуляций"
3. Выберите интересующий вас квест
4. Следуйте инструкциям в приложении

**Поддержка:**
Если у вас возникли вопросы, обратитесь к поддержке через приложение или напишите @matrix_psycho_bot
        """
        
        await update.message.reply_text(help_text)
    
    async def button_callback(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Обработчик нажатий на кнопки"""
        query = update.callback_query
        await query.answer()
        
        # Здесь можно добавить логику для обработки различных кнопок
        # Пока что просто подтверждаем нажатие
        await query.edit_message_text("✅ Переходим в приложение...")

def main():
    """Главная функция запуска бота"""
    bot = MatrixPsychoBot()
    
    logger.info("Запуск бота Matrix Psycho...")
    logger.info(f"Miniapp URL: {MINIAPP_URL}")
    
    # Запуск бота
    bot.application.run_polling(
        allowed_updates=Update.ALL_TYPES,
        drop_pending_updates=True
    )

if __name__ == '__main__':
    main()
