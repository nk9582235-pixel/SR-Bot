# VJ Save Restricted Bot

*A Telegram Bot, Which Can Send You Restricted Content By It's Post Link With <b>Login Feature.</b>*

*Added **TG Account Protection** Security To Prevent Account From Ban Issue, Not Totally But Now TG Account Ban Chance Is Low.*

---

<b>Watch Video Tutorial - [Click Here](https://youtu.be/BFEvSX5vIMg)</b>

---

## Variables

- `LOGIN_SYSTEM` : Set True or False As per your need.
- `STRING_SESSION` : Your Tg Account Session String, if login is False then this variable is compulsory to fill. ( ⚠️ Warning - Give string session on deploy website environment variable, don't give in repo )
- `API_HASH` : Your API Hash From [Telegram Website](https://my.telegram.org) Watch [Video Tutorial](https://youtu.be/LDtgwpI-N7M)
- `API_ID` : Your API ID From [Telegram Website](https://my.telegram.org) Watch [Video Tutorial](https://youtu.be/LDtgwpI-N7M)
- `BOT_TOKEN` : Your Bot Token From [BotFather](https://telegram.me/BotFather) ( ⚠️ Warning - Give Bot Token on deploy website environment variable, don't give in repo )
- `ADMINS` : Your Admin Id For Broadcasting Message
- `CHANNEL_ID` : Your Channel Id On Which Bot Upload Downloaded Content. ( And Make Your Bot Admin In This Channel With Full Rights )
- `DB_URI` : Your Mongodb Database Url From [Mongodb](https://mongodb.com) Watch [Video Tutorial](https://youtu.be/DAHRmFdw99o) ( ⚠️ Warning - Give Db Url on deploy website environment variable, don't give in repo )
- `WAITING_TIME` : Increase Time To Avoid Spamming, Floodwait and Tg Account Ban Issue.
- `ERROR_MESSAGE` : Set True Or False, If You Want Error Message Then True Else False.

---

## Commands

- `/start` : Check Bot Is Working Or Not
- `/help` : Check How To Use Bot
- `/login` : Login Your Telegram String Session 
- `/logout` : Logout Your Session 
- `/cancel` : Cancel Your Any Ongoing Task
- `/broadcast` : Broadcast Message To User (Admin Only)

---

## Usage

__FOR PUBLIC CHATS__

_just send post/s link_


__FOR PRIVATE CHATS__

_first send invite link of the chat (unnecessary if the account of string session already member of the chat)
then send post/s link_


__FOR BOT CHATS__

_send link with '/b/', bot's username and message id, you might want to install some unofficial client to get the id like below_

```
https://t.me/b/botusername/4321
```

__MULTI POSTS__

_send public/private posts link as explained above with formate "from - to" to send multiple messages like below_


```
https://t.me/xxxx/1001-1010

https://t.me/c/xxxx/101 - 120
```

_note that space in between doesn't matter_

---

## Credits

- <b>Thanks To [BipinKrish](https://github.com/bipinkrish) For Base Repo
- Thanks To [Tech VJ](https://github.com/VJBots) For Modification.</b>
