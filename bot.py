from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Updater, CommandHandler, CallbackContext
from queue import Queue
from telegram.ext import ApplicationBuilder
import pytz
from telegram.ext import CallbackQueryHandler

MINIAPP_URL = "https://acqu1red.github.io/tourmalineGG/webapp/"

# ---------- Builders for messages & keyboards ----------

def build_start_content():
    text = (
        "Добро пожаловать в шлюз в закрытого канала <b>ФОРМУЛА</b>, где знания не просто ценные, жизненно необходимые.\n\n"
        "<b>💳 Подписка - ежемесячная 1500₽ или ~15$</b>, оплата принимается в любой валюте и крипте.\n"
        "<b>⬇️ Ниже — кнопка. Жмешь — и проходишь туда, где люди не ноют, а ебут этот мир в обе щеки.</b>"
    )
    keyboard = [
        [InlineKeyboardButton("💳 Оплатить доступ", callback_data='payment')],
        [InlineKeyboardButton("ℹ️ Подробнее о канале", callback_data='more_info')],
        [InlineKeyboardButton("❓ Задать вопрос", web_app=WebAppInfo(url=MINIAPP_URL))]
    ]
    return text, InlineKeyboardMarkup(keyboard)


def build_payment_content():
    text = (
        "💵 Стоимость подписки на Базу\n"
        "1 месяц 1500 рублей\n"
        "6 месяцев 8000 рублей\n"
        "12 месяцев 10 000 рублей\n\n"
        "*цена в долларах/евро - конвертируется по нынешнему курсу\n"
        "*оплачивай любой картой в долларах/евро/рублях, бот сконвертирует сам\n\n"
        "Оплатить и получить доступ\n👇👇👇"
    )
    keyboard = [
        [InlineKeyboardButton("1 месяц", callback_data='pay_1_month')],
        [InlineKeyboardButton("6 месяцев", callback_data='pay_6_months')],
        [InlineKeyboardButton("12 месяцев", callback_data='pay_12_months')],
        [InlineKeyboardButton("🔙 Назад", callback_data='back')]
    ]
    return text, InlineKeyboardMarkup(keyboard)


def build_more_info_content():
    text = (
        "ФОРМУЛА — это золотой рюкзак знаний, с которым ты можешь вылезти из любой жопы.\n"
        "Тут не просто \"мотивация\" и \"развитие\", а рабочие схемы, которые ты не найдёшь даже если будешь копать ебучий Даркнет.\n"
        "🧠 Подкасты с таймкодами — от ПРОФАЙЛИНГА до манипуляций баб, от ПСИХОТИПОВ до коммуникации на уровне спецслужб\n"
        "💉 Органический БИОХАКИНГ — почему тебе плохо и как через неделю почувствовать себя богом\n"
        "💸 Уроки по ФРОДУ, где из нуля делается $5000+ в месяц, если не еблан\n"
        "🧱 Как выстроить дисциплину, отшить самобичевание и наконец стать машиной, а не мямлей\n"
        "📈 Авторские стратегии по трейдингу — от $500/мес на автопилоте\n"
        "⚡ Скальпинг и биржи — как хитрить систему, не теряя бабки на комиссиях\n"
        "🎥 Стримы каждые 2 недели, где разбираю вопросы подписчиков: здоровье, деньги, психика, мышление\n\n"
        "И это лишь малая часть того, что тебя ожидает в Формуле.\n"
        "Это не просто канал. Это сила, которая перестраивает твое мышление под нового тебя.\n"
        "Вокруг тебя — миллион способов сделать бабки, использовать людей и не пахать, пока другие пашут.\n"
        "Ты будешь считывать людей с его профиля в мессенджере, зарабатывать из воздуха и нести себя как король, потому что знаешь больше, чем они когда-либо поймут.\n\n"
        "Кнопка внизу ⬇️. Там не просто инфа. Там выход из стада.\n"
        "Решай."
    )
    keyboard = [
        [InlineKeyboardButton("❓ Задать вопрос", web_app=WebAppInfo(url=MINIAPP_URL))],
        [InlineKeyboardButton("🔙 Назад", callback_data='back')]
    ]
    return text, InlineKeyboardMarkup(keyboard)


def build_checkout_content(duration_label: str):
    text = (
        f"🦍 ЗАКРЫТЫЙ КАНАЛ \"ОСНОВА\" на {duration_label}\n\n"
        "Выберите удобный вид оплаты:\n"
        "*если вы из Украины, включите vpn\n"
        "*при оплате картой — оформляется автосписание каждые 30 дней\n"
        "*далее — вы сможете управлять подпиской в Меню бота\n"
        "*оплата криптой доступна на тарифах 6/12 мес"
    )
    keyboard = [
        [InlineKeyboardButton("💳 Карта (любая валюта)", callback_data='noop')],
        [InlineKeyboardButton("❓ Задать вопрос", web_app=WebAppInfo(url=MINIAPP_URL))],
        [InlineKeyboardButton("📄 Договор оферты", callback_data='noop')],
        [InlineKeyboardButton("🔙 Назад", callback_data='payment')]
    ]
    return text, InlineKeyboardMarkup(keyboard)


# ---------- Command handlers (send new messages) ----------

# Define the start command handler
async def start(update: Update, context: CallbackContext) -> None:
    text, markup = build_start_content()
    await update.effective_message.reply_text(text, parse_mode='HTML', reply_markup=markup)


# Define the payment command handler
async def payment(update: Update, context: CallbackContext) -> None:
    text, markup = build_payment_content()
    await update.effective_message.reply_text(text, parse_mode='HTML', reply_markup=markup)


# Define the more_info command handler
async def more_info(update: Update, context: CallbackContext) -> None:
    text, markup = build_more_info_content()
    await update.effective_message.reply_text(text, parse_mode='HTML', reply_markup=markup)


# ---------- Callback query handler (edits existing message) ----------

async def button(update: Update, context: CallbackContext) -> None:
    query = update.callback_query
    await query.answer()
    data = query.data

    if data == 'payment':
        text, markup = build_payment_content()
        await query.edit_message_text(text=text, parse_mode='HTML', reply_markup=markup)
    elif data == 'more_info':
        text, markup = build_more_info_content()
        await query.edit_message_text(text=text, parse_mode='HTML', reply_markup=markup)
    elif data in ('pay_1_month', 'pay_6_months', 'pay_12_months'):
        duration_map = {
            'pay_1_month': '1 месяц',
            'pay_6_months': '6 месяцев',
            'pay_12_months': '12 месяцев',
        }
        text, markup = build_checkout_content(duration_map[data])
        await query.edit_message_text(text=text, parse_mode='HTML', reply_markup=markup)
    elif data == 'back':
        text, markup = build_start_content()
        await query.edit_message_text(text=text, parse_mode='HTML', reply_markup=markup)
    else:
        return


# ---------- App bootstrap ----------

# Main function to start the bot
def main() -> None:
    application = ApplicationBuilder().token("8354723250:AAEWcX6OojEi_fN-RAekppNMVTAsQDU0wvo").build()

    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("payment", payment))
    application.add_handler(CommandHandler("more_info", more_info))
    application.add_handler(CallbackQueryHandler(button))

    application.run_polling()


if __name__ == '__main__':
    main()
