# Telegram Channel Copier Bot - Complete Documentation

## Table of Contents
1. [Overview](#overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Installation](#installation)
5. [Configuration](#configuration)
6. [Usage](#usage)
7. [Deployment](#deployment)
8. [API Reference](#api-reference)
9. [Troubleshooting](#troubleshooting)
10. [Contributing](#contributing)

## Overview

The Telegram Channel Copier Bot is a powerful solution for copying content between Telegram entities. It supports multiple users, various copy modes, and can be deployed to cloud platforms like Render.com.

## Features

### Core Functionality
- **Multi-Entity Support**: Copy between public/private channels, groups, personal chats, and bots
- **Selective Copying**: Choose to copy only media or both media and text messages
- **Message Range Selection**: Copy specific message ranges by ID
- **Progress Tracking**: Real-time progress updates during copying
- **Multi-User Support**: Concurrent usage by multiple Telegram users

### Advanced Features
- **Web Interface**: Browser-based configuration and monitoring
- **RESTful API**: Programmatic access to bot functionality
- **Rate Limiting**: Respects Telegram API limits
- **Error Recovery**: Continues operation after individual message failures
- **Graceful Shutdown**: Proper cleanup on termination

### Deployment
- **Render.com Ready**: Pre-configured deployment settings
- **Environment Variables**: Secure configuration management
- **Scalable Architecture**: Designed for cloud deployment

## Architecture

### Components
1. **Telegram Bot**: Core copying functionality using Telegraf framework
2. **Web Server**: Express.js server providing web interface and API
3. **Session Management**: In-memory user session storage
4. **Job Queue**: Copy job management system

### Data Flow
```
User → Telegram Bot Commands → Copy Job Queue → Message Processing → Destination Entity
User → Web Interface → API Endpoints → Copy Job Queue → Message Processing → Destination Entity
```

### File Structure
```
├── channel_copier_bot.js    # Main bot implementation
├── server.js               # Combined bot + web server
├── web_interface.js        # Web interface (Express)
├── public/
│   └── index.html          # Web frontend
├── package.json            # Dependencies and scripts
├── render.yaml             # Render.com deployment config
├── .env.example           # Environment variable template
├── README.md              # Main documentation
├── CHANNEL_COPIER_README.md # Bot-specific documentation
├── SUMMARY.md             # Implementation summary
└── FULL_DOCUMENTATION.md  # This file
```

## Installation

### Prerequisites
- Node.js v12 or higher
- npm package manager
- Telegram Bot Token

### Steps
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd telegram-channel-copier
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env to add your BOT_TOKEN
   ```

## Configuration

### Environment Variables
- `BOT_TOKEN` (required): Telegram bot token from [@BotFather](https://t.me/BotFather)
- `PORT` (optional): Web server port (default: 3000)

### Bot Setup
1. Create a bot with [@BotFather](https://t.me/BotFather)
2. Add the bot as administrator to source and destination entities
3. Note the bot token for configuration

## Usage

### Telegram Commands
- `/start` - Welcome message and web interface link
- `/help` - Detailed help information
- `/set_source <entity>` - Set source channel/chat
- `/set_destination <entity>` - Set destination channel/chat
- `/set_copy_mode <media|both>` - Choose what to copy
- `/set_message_range <start_id> <end_id>` - Set message range
- `/copy` - Start copying process
- `/status` - Check copying status
- `/cancel` - Cancel ongoing copy process

### Web Interface
1. Start the server: `npm run start:server`
2. Open browser to `http://localhost:3000`
3. Fill in copy parameters
4. Click "Start Copying"

### API Endpoints
- `GET /` - Web interface
- `GET /api/status` - System status
- `POST /api/copy` - Start copy job
- `GET /api/job/:jobId` - Get job status

## Deployment

### Render.com Deployment
1. Fork the repository to your GitHub account
2. Create a new Web Service on Render.com
3. Connect to your repository
4. Set environment variables:
   - `BOT_TOKEN` - Your Telegram bot token
   - `PORT` - Render will set this automatically
5. Set build command: `npm install`
6. Set start command: `npm run start:server`
7. Deploy!

### Environment Configuration
For Render.com, the environment variables are configured in the `render.yaml` file:
```yaml
envVars:
  - key: BOT_TOKEN
    sync: false
  - key: PORT
    sync: false
```

## API Reference

### Start Copy Job
```
POST /api/copy
Content-Type: application/json

{
  "source": "@source_channel",
  "destination": "@destination_channel",
  "mode": "media|both",          // Optional, default: both
  "startId": 100,                // Optional
  "endId": 200                   // Optional
}
```

Response:
```json
{
  "success": true,
  "jobId": "job_1234567890",
  "message": "Copy job started successfully"
}
```

### Get Job Status
```
GET /api/job/:jobId
```

Response:
```json
{
  "source": "@source_channel",
  "destination": "@destination_channel",
  "mode": "both",
  "startId": 100,
  "endId": 200,
  "status": "completed",
  "progress": 100,
  "copied": 50,
  "total": 50
}
```

### System Status
```
GET /api/status
```

Response:
```json
{
  "status": "running",
  "activeJobs": 0
}
```

## Troubleshooting

### Common Issues

1. **Bot not responding**
   - Check that BOT_TOKEN is correctly set
   - Verify the bot is added as admin to both entities
   - Ensure the bot has read/send permissions

2. **Copy failures**
   - Verify entity names/IDs are correct
   - Check that messages exist in the specified range
   - Ensure the bot has access to the messages

3. **Web interface not loading**
   - Check that the server is running
   - Verify the PORT environment variable
   - Check firewall settings

### Error Messages

- `Cannot access source` - Bot lacks permissions for source entity
- `Cannot access destination` - Bot lacks permissions for destination entity
- `Source and destination required` - Missing required parameters
- `Job not found` - Invalid job ID requested

### Logs
Check console output for detailed error information:
```bash
npm run start:server
```

## Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Structure
- Keep related functionality in the same file
- Use async/await for asynchronous operations
- Handle errors gracefully
- Add comments for complex logic

### Testing
Before submitting changes:
1. Test all bot commands
2. Test web interface functionality
3. Test API endpoints
4. Verify deployment configuration

## License

MIT License - see LICENSE file for details.

## Support

For issues and feature requests, please [open an issue](../../issues) on GitHub.