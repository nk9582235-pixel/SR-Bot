# Telegram Media Transfer Bot

A Telegram bot that transfers media from one channel to another, with both manual and automatic transfer modes.

## New: Channel Copier Bot

We've also implemented a more advanced **[Channel Copier Bot](CHANNEL_COPIER_README.md)** with these features:

- Copy entire channels, groups, and chats
- Selective copying (media only or media + text)
- Copy specific message ranges by ID
- Multi-user support
- Deployable on Render.com

See [CHANNEL_COPIER_README.md](CHANNEL_COPIER_README.md) for details.

## Features

- Transfer photos, videos, documents, audio, voice messages, and stickers
- Manual transfer mode with command-based interface
- Automatic transfer mode for real-time media forwarding
- Support for multiple source and destination channels
- Persistent configuration storage
- Media filtering options
- Easy setup and configuration

## Prerequisites

1. Node.js v12 or higher
2. A Telegram Bot Token (get it from [@BotFather](https://t.me/BotFather))
3. Admin rights for both source and destination channels

## Installation

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```

## Configuration

1. Create a `.env` file in the project root with your bot token:
   ```
   BOT_TOKEN=your_bot_token_here
   ```

## Usage

### Basic Bot
1. Start the basic bot:
   ```
   npm start
   ```

2. Add the bot as an administrator to both source and destination channels

3. Use these commands to control the bot:
   - `/start` - Display welcome message and commands
   - `/help` - Show detailed help
   - `/set_source @channel_username` - Set the source channel
   - `/set_destination @channel_username` - Set the destination channel
   - `/transfer` - Transfer the last received media

### Advanced Bot
1. Start the advanced bot:
   ```
   node advanced_bot.js
   ```

2. Add the bot as an administrator to all channels you want to use

3. Use these commands to control the advanced bot:
   - `/start` - Display welcome message and commands
   - `/help` - Show detailed help
   - `/add_source @channel_username` - Add a source channel to monitor
   - `/add_destination @channel_username` - Add a destination channel
   - `/remove_source @channel_username` - Remove a source channel
   - `/remove_destination @channel_username` - Remove a destination channel
   - `/list_channels` - List all configured channels
   - `/toggle_auto` - Toggle automatic transfer mode (ON/OFF)
   - `/transfer` - Manually transfer recent media

## How It Works

### Basic Mode
1. Set up your source and destination channels using the appropriate commands
2. Forward any media to the bot (photos, videos, documents, etc.)
3. Use the `/transfer` command to send the media to the destination channel

### Advanced Mode
1. Configure your source channels (those you want to monitor) and destination channels
2. Enable automatic transfer mode with `/toggle_auto`
3. The bot will automatically detect new media in source channels and transfer them to all destination channels
4. You can also manually trigger transfers with the `/transfer` command

## Supported Media Types

- Photos
- Videos
- Documents
- Audio files
- Voice messages
- Stickers

## Troubleshooting

If you encounter issues:

1. Make sure the bot has admin rights in both channels
2. Verify that channel usernames are correct (include the @ symbol)
3. Check that the bot token is valid
4. Ensure Node.js is properly installed

For detailed troubleshooting and advanced configuration, see [USAGE.md](USAGE.md)

## License

MIT

## More Information

For detailed usage instructions, see [USAGE.md](USAGE.md)