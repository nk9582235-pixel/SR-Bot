# Don't Remove Credit Tg - @VJ_Bots
# Subscribe YouTube Channel For Amazing Bot https://youtube.com/@Tech_VJ
# Ask Doubt on telegram @KingVJ01

import os

# Login feature, if you want then True , if you don't want then False
LOGIN_SYSTEM = bool(os.environ.get('LOGIN_SYSTEM', True)) # True or False

if LOGIN_SYSTEM == False:
    # if login system is False then fill your tg account session below 
    STRING_SESSION = os.environ.get("STRING_SESSION", "")
else:
    STRING_SESSION = None

# Bot token @Botfather
BOT_TOKEN = os.environ.get("BOT_TOKEN", "")

# Your API ID from my.telegram.org
API_ID = int(os.environ.get("API_ID", "22984163"))

# Your API Hash from my.telegram.org
API_HASH = os.environ.get("API_HASH", "18c3760d602be96b599fa42f1c322956")

# Your Owner / Admin Id For Broadcast 
# Convert ADMINS to list of integers if they're numeric, otherwise keep as strings
ADMINS = []
admins_env = os.environ.get("ADMINS", "hackerbynt")
for admin in admins_env.split(','):
    admin = admin.strip()
    if admin.isdigit():
        ADMINS.append(int(admin))
    else:
        ADMINS.append(admin)

# Your Channel Id In Which Bot Upload Downloaded Video/File/Message etc.
# And Make Your Bot Admin In this channel with full rights.
# if you don't want to upload in channel then leave it blank don't fill anything.
CHANNEL_ID = os.environ.get("CHANNEL_ID", "")

# Your Mongodb Database Url
# Warning - Give Db uri in deploy server environment variable, don't give in repo.
DB_URI = os.environ.get("DB_URI", "mongodb+srv://nk9582235_db_user:GVoYju9ZT2vrWXJ2@cluster0.akuzmvw.mongodb.net/vjsavecontentbot?retryWrites=true&w=majority&ssl=true&ssl_cert_reqs=CERT_NONE") # Warning - Give Db uri in deploy server environment variable, don't give in repo.
DB_NAME = os.environ.get("DB_NAME", "vjsavecontentbot")

# Increase time as much as possible to avoid floodwait, spamming and tg account ban issues.
WAITING_TIME = int(os.environ.get("WAITING_TIME", "10")) # time in seconds

# If You Want Error Message In Your Personal Message Then Turn It True Else If You Don't Want Then Flase
ERROR_MESSAGE = bool(os.environ.get('ERROR_MESSAGE', True))
