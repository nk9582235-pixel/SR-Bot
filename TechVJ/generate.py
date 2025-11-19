# Don't Remove Credit Tg - @VJ_Bots
# Subscribe YouTube Channel For Amazing Bot https://youtube.com/@Tech_VJ
# Ask Doubt on telegram @KingVJ01

import traceback
from pyrogram.types import Message
from pyrogram import Client, filters
from asyncio.exceptions import TimeoutError
from pyrogram.types import InlineKeyboardMarkup, InlineKeyboardButton
from pyrogram.errors import (
    ApiIdInvalid,
    PhoneNumberInvalid,
    PhoneCodeInvalid,
    PhoneCodeExpired,
    SessionPasswordNeeded,
    PasswordHashInvalid
)
from config import API_ID, API_HASH
from database.db import db

# Generate button for UI
gen_button = [[
    InlineKeyboardButton("Cancel", callback_data="cancel")
]]

SESSION_STRING_SIZE = 351

@Client.on_message(filters.private & ~filters.forwarded & ~filters.me & filters.command(["logout"]))
async def logout(client, message):
    # Handle case when database is not available
    if db is None:
        await message.reply("**Database not available. Logout not possible.**")
        return
    
    try:
        user_data = await db.get_session(message.from_user.id)  
        if user_data is None:
            await message.reply("**You are not logged in.**")
            return 
        await db.set_session(message.from_user.id, session=None)  
        await db.set_api_id(message.from_user.id, api_id=None)
        await db.set_api_hash(message.from_user.id, api_hash=None)
        await message.reply("**✅ Logout Successfully**")
    except Exception as e:
        await message.reply(f"**Error during logout: {str(e)}**")

@Client.on_message(filters.private & ~filters.forwarded & ~filters.me & filters.command(["login"]))
async def main(bot: Client, message: Message):
    # Handle case when database is not available
    if db is None:
        await message.reply("**Database not available. Login not possible.**")
        return
    
    user_data = await db.get_session(message.from_user.id)
    if user_data is not None:
        await message.reply("**You Are Already Logged In. First /logout Your Old Session. Then Do Login.**")
        return 
    user_id = int(message.from_user.id)
    
    # Use the bot's own API credentials instead of asking user for theirs
    api_id = API_ID
    api_hash = API_HASH
        
    # Ask for phone number
    try:
        phone_number_msg = await bot.ask(chat_id=user_id, text="<b>Please send your phone number which includes country code</b>\n<b>Example:</b> <code>+13124562345, +9171828181889</code>\n\n<i>Note: We'll send an OTP to this number to authenticate your account.</i>", timeout=120)
    except TimeoutError:
        return await message.reply('<b>Login process timed out. Please try again.</b>')
    
    # Check if user cancelled
    if phone_number_msg.text == '/cancel':
        return await phone_number_msg.reply('<b>Process cancelled!</b>')
        
    # Validate phone number
    phone_number = phone_number_msg.text.strip()
    if not phone_number.startswith('+') or not phone_number[1:].isdigit():
        return await phone_number_msg.reply('<b>Invalid phone number format. Please include country code with + sign.</b>')
    
    # Create client for authentication
    client = Client(":memory:", api_id=api_id, api_hash=api_hash)
    
    try:
        await client.connect()
        await phone_number_msg.reply("Sending OTP...")
        
        # Send code
        try:
            code = await client.send_code(phone_number)
        except PhoneNumberInvalid:
            await phone_number_msg.reply('**Phone number is invalid. Please check the number and try again.**')
            return
        except Exception as e:
            await phone_number_msg.reply(f'**Error sending OTP: {str(e)}**')
            return
        
        # Ask for OTP
        try:
            phone_code_msg = await bot.ask(user_id, "Please check for an OTP in your Telegram account. If you got it, send OTP here after reading the below format. \n\nIf OTP is `12345`, **please send it as** `1 2 3 4 5`.\n\n**Enter /cancel to cancel the process**", filters=filters.text, timeout=300)
        except TimeoutError:
            await phone_number_msg.reply('<b>OTP verification timed out. Please try again.</b>')
            return
            
        # Check if user cancelled
        if phone_code_msg.text == '/cancel':
            return await phone_code_msg.reply('<b>Process cancelled!</b>')
            
        # Validate and process OTP
        phone_code = phone_code_msg.text.replace(" ", "")
        
        try:
            await client.sign_in(phone_number, code.phone_code_hash, phone_code)
        except PhoneCodeInvalid:
            await phone_code_msg.reply('**OTP is invalid. Please check the code and try again.**')
            return
        except PhoneCodeExpired:
            await phone_code_msg.reply('**OTP is expired. Please restart the login process.**')
            return
        except SessionPasswordNeeded:
            # Ask for 2FA password
            try:
                two_step_msg = await bot.ask(user_id, '**Your account has enabled two-step verification. Please provide the password.\n\nEnter /cancel to cancel the process**', filters=filters.text, timeout=300)
            except TimeoutError:
                await phone_number_msg.reply('<b>2FA verification timed out. Please try again.</b>')
                return
                
            # Check if user cancelled
            if two_step_msg.text == '/cancel':
                return await two_step_msg.reply('<b>Process cancelled!</b>')
                
            # Validate and process 2FA
            try:
                password = two_step_msg.text
                await client.check_password(password=password)
            except PasswordHashInvalid:
                await two_step_msg.reply('**Invalid password provided. Please try again.**')
                return
            except Exception as e:
                await two_step_msg.reply(f'**Error verifying password: {str(e)}**')
                return
        
        # Get session string
        string_session = await client.export_session_string()
        
        if len(string_session) < SESSION_STRING_SIZE:
            return await message.reply('<b>Invalid session string. Please try again.</b>')
            
        # Save session to database
        try:
            await db.set_session(message.from_user.id, session=string_session)
            await db.set_api_id(message.from_user.id, api_id=api_id)
            await db.set_api_hash(message.from_user.id, api_hash=api_hash)
        except Exception as e:
            return await message.reply_text(f"<b>ERROR saving session to database:</b> `{e}`")
            
        await bot.send_message(message.from_user.id, "<b>✅ Account Login Successfully!\n\nYou can now use the bot to download restricted content.\n\nIf you get any error related to AUTH KEY, /logout first and /login again.</b>")
        
    except Exception as e:
        await message.reply_text(f"<b>ERROR during login process:</b> `{str(e)}`")
    finally:
        try:
            await client.disconnect()
        except:
            pass


# Don't Remove Credit Tg - @VJ_Botz
# Subscribe YouTube Channel For Amazing Bot https://youtube.com/@Tech_VJ
# Ask Doubt on telegram @KingVJ01
