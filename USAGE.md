# Telegram Media Transfer Bot - Usage Guide

## Overview

This bot allows you to transfer media between Telegram channels in two modes:
1. **Manual Mode** - Forward media to the bot and manually trigger transfers
2. **Automatic Mode** - Automatically monitor channels and transfer new media in real-time

## Setup Instructions

### 1. Create a Bot
1. Open Telegram and search for [@BotFather](https://t.me/BotFather)
2. Send `/newbot` and follow the instructions to create a new bot
3. Copy the **Token** provided by BotFather

### 2. Configure the Bot
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Edit `.env` and add your bot token:
   ```
   BOT_TOKEN=your_actual_bot_token_here
   ```

### 3. Install Dependencies
Run the setup script:
- Windows: `setup.bat`
- Linux/Mac: `./setup.sh`

Or manually install:
```bash
npm install
```

## Running the Bot

### Manual Mode
```bash
npm start
```

### Automatic Mode
```bash
npm run start:advanced
```

Or:
```bash
node advanced_bot.js
```

## Using the Bot

### Manual Mode Commands
- `/start` - Display welcome message and commands
- `/help` - Show detailed help
- `/set_source @channel_username` - Set the source channel
- `/set_destination @channel_username` - Set the destination channel
- `/transfer` - Transfer the last received media

### Automatic Mode Commands
- `/start` - Display welcome message and commands
- `/help` - Show detailed help
- `/add_source @channel_username` - Add a source channel to monitor
- `/add_destination @channel_username` - Add a destination channel
- `/remove_source @channel_username` - Remove a source channel
- `/remove_destination @channel_username` - Remove a destination channel
- `/list_channels` - List all configured channels
- `/toggle_auto` - Toggle automatic transfer mode (ON/OFF)
- `/transfer` - Manually transfer recent media

## Setting Up Channels

### Adding the Bot to Channels
1. Open your Telegram channel
2. Tap on the channel name to open channel info
3. Tap "Add Members"
4. Search for your bot and add it
5. Grant administrator rights to the bot

### Configuring Source and Destination Channels

#### Manual Mode
1. Use `/set_source @your_source_channel` to set the source
2. Use `/set_destination @your_destination_channel` to set the destination

#### Automatic Mode
1. Use `/add_source @your_source_channel` to add source channels
2. Use `/add_destination @your_destination_channel` to add destination channels
3. Use `/toggle_auto` to enable automatic transfers

## Supported Media Types

The bot supports transferring:
- Photos
- Videos
- Documents
- Audio files
- Voice messages
- Stickers

## Configuration File

The `config.js` file contains default settings:
- Session storage options
- Media filtering preferences
- Channel lists (automatically updated)

Changes made through bot commands are automatically saved to this file.

## Troubleshooting

### Common Issues
1. **Bot not responding**: Ensure the bot has admin rights in both channels
2. **Transfer failures**: Check that channel usernames are correct
3. **Missing media**: Verify the bot supports the media type

### Checking Logs
View console output for error messages and transfer status:
```bash
# Manual mode
npm start

# Automatic mode
npm run start:advanced
```

## Best Practices

1. **Security**: Only add the bot to channels you trust
2. **Performance**: Limit the number of source channels for automatic mode
3. **Organization**: Use descriptive channel names for easier management
4. **Backup**: Regularly backup your `config.js` file

## Customization

### Media Filtering
Edit `config.js` to customize:
- Enable/disable specific media types
- Set file size limits
- Adjust session storage options

### Adding New Features
The modular structure makes it easy to extend:
- Add new command handlers in the bot files
- Extend configuration options in `config.js`
- Add utility functions in `utils.js`