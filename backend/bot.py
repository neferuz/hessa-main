import asyncio
import logging
import os
from aiogram import Bot, Dispatcher, types, F
from aiogram.filters import Command
from aiogram.types import ReplyKeyboardMarkup, KeyboardButton, WebAppInfo, InlineKeyboardMarkup, InlineKeyboardButton
from dotenv import load_dotenv

load_dotenv()

TOKEN = os.getenv("BOT_TOKEN")
WEBAPP_URL = os.getenv("WEBAPP_URL", "https://hessa.uz")

if not TOKEN:
    TOKEN = "8045133629:AAGMUrr51SLiyJ37b74g71AqLVAV9HNBDd4"

logging.basicConfig(level=logging.INFO)

bot = Bot(token=TOKEN)
dp = Dispatcher()

@dp.message(Command("start"))
async def cmd_start(message: types.Message):
    """
    Handle /start command.
    """
    kb = [
        [
            KeyboardButton(text="📱 Отправить номер телефона", request_contact=True)
        ]
    ]
    keyboard = ReplyKeyboardMarkup(keyboard=kb, resize_keyboard=True, one_time_keyboard=True)
    
    await message.answer(
        "👋 Рады видеть вас в HESSA!\n\n"
        "Мы создаем персональные наборы витаминов, основанные на ваших биоритмах и образе жизни.\n\n"
        "Чтобы начать, пожалуйста, **поделитесь вашим номером телефона**, нажав на кнопку ниже. "
        "Это поможет нам сохранить ваш профиль и результаты тестов.",
        reply_markup=keyboard,
        parse_mode="Markdown"
    )

@dp.message(F.contact)
async def handle_contact(message: types.Message):
    """
    Handle shared contact and show WebApp button.
    """
    contact = message.contact
    
    inline_kb = [
        [
            InlineKeyboardButton(
                text="💊 Открыть Hessa Mini App", 
                web_app=WebAppInfo(url=WEBAPP_URL)
            )
        ]
    ]
    keyboard = InlineKeyboardMarkup(inline_keyboard=inline_kb)
    
    await message.answer(
        f"✅ Приятно познакомиться, {contact.first_name}!\n\n"
        "Теперь вы готовы к прохождению теста и заказу витаминов. "
        "Нажмите на кнопку ниже, чтобы войти в наше приложение.",
        reply_markup=keyboard,
        parse_mode="Markdown"
    )

async def main():
    await dp.start_polling(bot)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except (KeyboardInterrupt, SystemExit):
        logging.info("Bot stopped")
