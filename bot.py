# Don't Remove Credit Tg - @VJ_Bots
# Subscribe YouTube Channel For Amazing Bot https://youtube.com/@Tech_VJ
# Ask Doubt on telegram @KingVJ01

from pyrogram import Client
from config import API_ID, API_HASH, BOT_TOKEN, STRING_SESSION, LOGIN_SYSTEM

if STRING_SESSION is not None and LOGIN_SYSTEM == False:
    TechVJUser = Client("TechVJ", api_id=API_ID, api_hash=API_HASH, session_string=STRING_SESSION)
    TechVJUser.start()
else:
    TechVJUser = None

class Bot(Client):

    def __init__(self):
        super().__init__(
            "techvj login",
            api_id=API_ID,
            api_hash=API_HASH,
            bot_token=BOT_TOKEN,
            plugins=dict(root="TechVJ"),
            workers=150,
            sleep_threshold=5
        )

      
    async def start(self):
        try:
            await super().start()
            print('Bot Started Powered By @VJ_Bots')
            # Send a message to the admin when bot starts
            try:
                await self.send_message(ADMINS[0], "**Bot Started Successfully!**")
            except:
                pass
        except Exception as e:
            print(f'Error starting bot: {e}')
            raise e

    async def stop(self, *args):
        await super().stop()
        print('Bot Stopped Bye')

# Add a simple health check function
def health_check():
    return "Bot is running"

if __name__ == "__main__":
    import asyncio
    bot = Bot()
    # Run the bot in a way that's compatible with Render
    try:
        bot.run()
    except KeyboardInterrupt:
        print("Bot stopped by user")
    except Exception as e:
        print(f"Bot stopped due to error: {e}")

# Don't Remove Credit Tg - @VJ_Bots
# Subscribe YouTube Channel For Amazing Bot https://youtube.com/@Tech_VJ
# Ask Doubt on telegram @KingVJ01
