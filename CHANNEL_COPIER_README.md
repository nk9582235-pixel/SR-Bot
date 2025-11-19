# Telegram Channel Copier Bot

A powerful Telegram bot that can copy entire channels, groups, and chats with advanced filtering options. Deployable on Render.com with multi-user support.

## Features

- 🔄 **Copy Entire Channels**: Copy all messages from any Telegram entity
- 🎯 **Selective Copying**: Choose to copy only media or both media and text
- 🔢 **Message Range**: Copy specific message ranges by ID
- 🌐 **Multi-Entity Support**: Works with public channels, private channels, groups, personal chats, and bots
- 👥 **Multi-User**: Supports simultaneous use by multiple users
- ☁️ **Render.com Deployment**: Easy deployment to Render.com
- ⚙️ **Configurable**: Flexible settings for different copying needs

## Commands

- `/start` - Welcome message and setup instructions
- `/help` - Detailed help information
- `/set_source <entity>` - Set source channel/chat
- `/set_destination <entity>` - Set destination channel/chat
- `/set_copy_mode <media|both>` - Choose what to copy
- `/set_message_range <start_id> <end_id>` - Set message range
- `/copy` - Start copying process
- `/status` - Check copying status
- `/cancel` - Cancel ongoing copy process

## Setup Instructions

### 1. Create a Bot
1. Open Telegram and search for [@BotFather](https://t.me/BotFather)
2. Send `/newbot` and follow instructions
3. Copy the **Token** provided

### 2. Configure Environment
1. Copy `.env.example` to `.env`:
   ```
   cp .env.example .env
   ```
2. Edit `.env` and add your bot token:
   ```
   BOT_TOKEN=your_actual_bot_token_here
   ```

### 3. Add Bot to Channels
1. Add your bot as an administrator to both source and destination entities
2. Ensure the bot has permission to read messages and send messages

## Deployment to Render.com

1. Fork this repository or upload the code to GitHub
2. Create a new Web Service on Render.com
3. Connect your repository
4. Set the following environment variables:
   - `BOT_TOKEN` - Your Telegram bot token
5. Set build command: `npm install`
6. Set start command: `npm run start:copier`
7. Deploy!

## Usage

### Basic Copying
1. Set source: `/set_source @source_channel`
2. Set destination: `/set_destination @destination_channel`
3. Start copying: `/copy`

### Advanced Options
1. Set copy mode: `/set_copy_mode media` (or `both`)
2. Set message range: `/set_message_range 100 200`
3. Start copying: `/copy`

### Supported Entities
- Public channels: `@channel_username`
- Private channels: `-1001234567890` (chat ID)
- Groups: `@group_username` or chat ID
- Personal chats: User ID
- Bots: `@bot_username`

## Copy Modes

- **Media Only**: Copies only messages with media (photos, videos, documents, etc.)
- **Both**: Copies all messages (media + text)

## Technical Details

### Architecture
- Built with Node.js and Telegraf framework
- Session-based user management
- In-memory storage for active sessions
- Modular design for easy extension

### Limitations
- Telegram API rate limits apply
- Large channels may take time to copy
- Some message metadata may not be preserved
- Media quality may vary based on Telegram compression

## Environment Variables

- `BOT_TOKEN` - Required. Your Telegram bot token from [@BotFather](https://t.me/BotFather)

## Dependencies

- `telegraf` - Modern Telegram bot framework
- `dotenv` - Environment variable management

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License

MIT License

## Support

For issues and feature requests, please [open an issue](../../issues) on GitHub.