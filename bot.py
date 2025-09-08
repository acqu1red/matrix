from telegram import Update, WebAppInfo, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, ContextTypes, CallbackQueryHandler
from telegram.ext import ApplicationBuilder
import asyncio
import logging
import os

# Настройка логирования
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Конфигурация
BOT_TOKEN = "8435828779:AAFo5UccSatCkqmblr6AW6YrrJli89j6GyQ"
MINIAPP_URL = "https://acqu1red.github.io/matrix"
HELP_URL = "https://acqu1red.github.io/matrix/supports.html"

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Обработчик команды /start - отправляем видео и текст с кнопками"""
    # Настраиваем кнопку меню при первом запуске
    await setup_menu_button(context.application)
    
    if update.message:
        # Отправляем видео
        video_path = "start.MP4"
        if os.path.exists(video_path):
            with open(video_path, 'rb') as video_file:
                await update.message.reply_video(
                    video=video_file,
                    caption="👆 Быстрый обзор основных симуляций и других возможностей внутри Матрицы Симуляций.\n\n"
                            "<b>МАТРИЦА предоставляет доступ к более чем 7 уникальных тренинг-симуляций.</b>\n\n"
                            "👇 Все возможные элементы в системе Матрицы Симуляций.\n\n",
                    parse_mode='HTML',
                    reply_markup=create_start_keyboard()
                )
        else:
            # Если видео не найдено, отправляем только текст
            await update.message.reply_text(
                "👆 Быстрый обзор основных симуляций и других возможностей внутри Матрицы Симуляций.\n\n"
                "<b>МАТРИЦА предоставляет доступ к более чем 7 уникальных тренинг-симуляций.</b>\n\n"
                "👇 Все возможные элементы в системе Матрицы Симуляций.\n\n",
                parse_mode='HTML',
                reply_markup=create_start_keyboard()
            )

def create_start_keyboard():
    """Создает клавиатуру с инлайн-кнопками для команды /start"""
    keyboard = [
        [
            InlineKeyboardButton("💀 Симуляции", web_app=WebAppInfo(url=MINIAPP_URL))
        ],
        [
            InlineKeyboardButton("🆘 Служба поддержки", web_app=WebAppInfo(url=HELP_URL))
        ],
        [
            InlineKeyboardButton("🧠 Личный блог по психологии", url="https://t.me/+RbRPxCFEOe00ZThi")
        ],
        [
            InlineKeyboardButton("🎯 УНИКАЛЬНОЕ ПРЕДЛОЖЕНИЕ", callback_data="unique_offer")
        ],
        [
            InlineKeyboardButton("🎭 СКИДКА 90%: ПСИХОЛОГИЯ ЛЖИ", callback_data="psychology_lie")
        ],
        [
            InlineKeyboardButton("🔍 ПРОФАЙЛИНГ: ПОЛНЫЙ ГАЙД", callback_data="profiling_guide")
        ],
        [
            InlineKeyboardButton("👩‍💼 РАЗБОР 100 ЖЕНСКИХ МАНИПУЛЯЦИЙ", callback_data="female_manipulations")
        ]
    ]
    return InlineKeyboardMarkup(keyboard)

async def button_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Обработчик нажатий на инлайн-кнопки"""
    query = update.callback_query
    await query.answer()
    
    if query.data == "unique_offer":
        await query.edit_message_text("🎯 УНИКАЛЬНОЕ ПРЕДЛОЖЕНИЕ\n\nСкоро здесь будет доступно специальное предложение!")
    elif query.data == "psychology_lie":
        await query.edit_message_text("🎭 СКИДКА 90%: ПСИХОЛОГИЯ ЛЖИ\n\nСкоро здесь будет доступен курс по психологии лжи!")
    elif query.data == "profiling_guide":
        await query.edit_message_text("🔍 ПРОФАЙЛИНГ: ПОЛНЫЙ ГАЙД\n\nСкоро здесь будет доступен полный гайд по профайлингу!")
    elif query.data == "female_manipulations":
        await query.edit_message_text("👩‍💼 РАЗБОР 100 ЖЕНСКИХ МАНИПУЛЯЦИЙ\n\nСкоро здесь будет доступен разбор женских манипуляций!")

async def setup_menu_button(application: Application) -> None:
    """Настройка кнопки меню для открытия Mini App"""
    try:
        await application.bot.set_chat_menu_button(
            menu_button={
                "type": "web_app",
                "text": "💀 Симуляции",
                "web_app": {"url": MINIAPP_URL}
            }
        )
        logger.info("✅ Кнопка меню успешно настроена")
    except Exception as e:
        logger.error(f"❌ Ошибка настройки кнопки меню: {e}")

def main() -> None:
    """Основная функция запуска бота"""
    logger.info("🚀 Запуск Matrix бота...")
    
    # Создаем приложение
    application = ApplicationBuilder().token(BOT_TOKEN).build()
    
    # Регистрируем обработчики
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CallbackQueryHandler(button_callback))
    
    # Настраиваем кнопку меню при запуске
    # setup_menu_button будет вызван после запуска polling
    
    logger.info("📝 Обработчики зарегистрированы")
    logger.info("🔄 Запуск polling...")
    
    # Запускаем бота
    application.run_polling()

if __name__ == '__main__':
    main()
