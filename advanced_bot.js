require('dotenv').config();
const { Telegraf, session } = require('telegraf');
const config = require('./config');
const { saveConfig } = require('./utils');

// Check if BOT_TOKEN environment variable is set
const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
  console.error('Please provide BOT_TOKEN environment variable');
  process.exit(1);
}

// Initialize the bot
const bot = new Telegraf(BOT_TOKEN);

// Enable session middleware
bot.use(session());

// Load channel settings from config
const channelSettings = {
  sourceChannels: new Set(config.channels.source),
  destinationChannels: new Set(config.channels.destination),
  autoTransfer: config.channels.autoTransfer
};

// Store channel information
bot.command('start', (ctx) => {
  ctx.reply('Welcome to the Advanced Media Transfer Bot!\n\n' +
    'Commands:\n' +
    '/add_source - Add a source channel to monitor\n' +
    '/add_destination - Add a destination channel\n' +
    '/remove_source - Remove a source channel\n' +
    '/remove_destination - Remove a destination channel\n' +
    '/list_channels - List all configured channels\n' +
    '/toggle_auto - Toggle automatic transfer mode\n' +
    '/transfer - Manually transfer recent media\n' +
    '/help - Show this help message');
});

// Help command
bot.command('help', (ctx) => {
  ctx.reply('Advanced Media Transfer Bot - Automatically transfer media between Telegram channels\n\n' +
    'How to use:\n' +
    '1. Add this bot as an admin to all channels you want to use\n' +
    '2. Use /add_source to add channels you want to monitor\n' +
    '3. Use /add_destination to add channels where media should be sent\n' +
    '4. Enable auto-transfer with /toggle_auto or manually transfer with /transfer\n\n' +
    'Commands:\n' +
    '/add_source <username> - Add source channel to monitor\n' +
    '/add_destination <username> - Add destination channel\n' +
    '/remove_source <username> - Remove a source channel\n' +
    '/remove_destination <username> - Remove a destination channel\n' +
    '/list_channels - List all configured channels\n' +
    '/toggle_auto - Toggle automatic transfer mode (ON/OFF)\n' +
    '/transfer - Manually transfer recent media\n' +
    '/help - Show this help message');
});

// Add source channel
bot.command('add_source', (ctx) => {
  const sourceChannel = ctx.message.text.split(' ')[1];
  if (!sourceChannel) {
    return ctx.reply('Please provide a channel username. Usage: /add_source @channel_username');
  }
  
  const channelUsername = sourceChannel.startsWith('@') ? sourceChannel : '@' + sourceChannel;
  channelSettings.sourceChannels.add(channelUsername);
  saveConfig(channelSettings);
  ctx.reply(`Source channel ${channelUsername} added to monitoring list.`);
});

// Add destination channel
bot.command('add_destination', (ctx) => {
  const destChannel = ctx.message.text.split(' ')[1];
  if (!destChannel) {
    return ctx.reply('Please provide a channel username. Usage: /add_destination @channel_username');
  }
  
  const channelUsername = destChannel.startsWith('@') ? destChannel : '@' + destChannel;
  channelSettings.destinationChannels.add(channelUsername);
  saveConfig(channelSettings);
  ctx.reply(`Destination channel ${channelUsername} added.`);
});

// Remove source channel
bot.command('remove_source', (ctx) => {
  const sourceChannel = ctx.message.text.split(' ')[1];
  if (!sourceChannel) {
    return ctx.reply('Please provide a channel username. Usage: /remove_source @channel_username');
  }
  
  const channelUsername = sourceChannel.startsWith('@') ? sourceChannel : '@' + sourceChannel;
  if (channelSettings.sourceChannels.delete(channelUsername)) {
    saveConfig(channelSettings);
    ctx.reply(`Source channel ${channelUsername} removed from monitoring list.`);
  } else {
    ctx.reply(`Source channel ${channelUsername} was not in the monitoring list.`);
  }
});

// Remove destination channel
bot.command('remove_destination', (ctx) => {
  const destChannel = ctx.message.text.split(' ')[1];
  if (!destChannel) {
    return ctx.reply('Please provide a channel username. Usage: /remove_destination @channel_username');
  }
  
  const channelUsername = destChannel.startsWith('@') ? destChannel : '@' + destChannel;
  if (channelSettings.destinationChannels.delete(channelUsername)) {
    saveConfig(channelSettings);
    ctx.reply(`Destination channel ${channelUsername} removed.`);
  } else {
    ctx.reply(`Destination channel ${channelUsername} was not in the list.`);
  }
});

// List all channels
bot.command('list_channels', (ctx) => {
  let message = 'Configured Channels:\n\n';
  
  message += 'Source Channels (Monitoring):\n';
  if (channelSettings.sourceChannels.size > 0) {
    channelSettings.sourceChannels.forEach(channel => {
      message += `- ${channel}\n`;
    });
  } else {
    message += '- None\n';
  }
  
  message += '\nDestination Channels:\n';
  if (channelSettings.destinationChannels.size > 0) {
    channelSettings.destinationChannels.forEach(channel => {
      message += `- ${channel}\n`;
    });
  } else {
    message += '- None\n';
  }
  
  message += `\nAuto-transfer: ${channelSettings.autoTransfer ? 'ON' : 'OFF'}`;
  
  ctx.reply(message);
});

// Toggle automatic transfer
bot.command('toggle_auto', (ctx) => {
  channelSettings.autoTransfer = !channelSettings.autoTransfer;
  saveConfig(channelSettings);
  ctx.reply(`Automatic transfer mode is now ${channelSettings.autoTransfer ? 'ON' : 'OFF'}.`);
});

// Manual transfer command
bot.command('transfer', async (ctx) => {
  if (channelSettings.sourceChannels.size === 0) {
    return ctx.reply('Please add at least one source channel using /add_source');
  }
  
  if (channelSettings.destinationChannels.size === 0) {
    return ctx.reply('Please add at least one destination channel using /add_destination');
  }
  
  ctx.reply('Manual transfer initiated. This would normally transfer recent media from source to destination channels.');
});

// Auto-monitor messages from source channels
bot.on('message', async (ctx) => {
  // Check if this message is from a source channel and auto-transfer is enabled
  const chatUsername = ctx.chat.username ? `@${ctx.chat.username}` : null;
  
  if (chatUsername && channelSettings.sourceChannels.has(chatUsername) && channelSettings.autoTransfer) {
    // This is a message from a source channel and auto-transfer is enabled
    console.log(`Detected message from source channel ${chatUsername}`);
    
    // Process different types of media
    const message = ctx.message;
    let mediaType = null;
    let fileId = null;
    let caption = message.caption || '';
    
    if (message.photo) {
      mediaType = 'photo';
      // Get the highest resolution photo
      fileId = message.photo[message.photo.length - 1].file_id;
    } else if (message.video) {
      mediaType = 'video';
      fileId = message.video.file_id;
    } else if (message.document) {
      mediaType = 'document';
      fileId = message.document.file_id;
    } else if (message.audio) {
      mediaType = 'audio';
      fileId = message.audio.file_id;
    } else if (message.voice) {
      mediaType = 'voice';
      fileId = message.voice.file_id;
    } else if (message.sticker) {
      mediaType = 'sticker';
      fileId = message.sticker.file_id;
    }
    
    // If we found media, transfer it to all destination channels
    if (mediaType && fileId) {
      try {
        // Send to all destination channels
        for (const destChannel of channelSettings.destinationChannels) {
          switch (mediaType) {
            case 'photo':
              await ctx.telegram.sendPhoto(destChannel, fileId, { caption });
              break;
            case 'video':
              await ctx.telegram.sendVideo(destChannel, fileId, { caption });
              break;
            case 'document':
              await ctx.telegram.sendDocument(destChannel, fileId, { caption });
              break;
            case 'audio':
              await ctx.telegram.sendAudio(destChannel, fileId, { caption });
              break;
            case 'voice':
              await ctx.telegram.sendVoice(destChannel, fileId, { caption });
              break;
            case 'sticker':
              await ctx.telegram.sendSticker(destChannel, fileId);
              break;
          }
          console.log(`Transferred ${mediaType} to ${destChannel}`);
        }
        
        console.log(`Auto-transferred ${mediaType} from ${chatUsername}`);
      } catch (error) {
        console.error('Auto-transfer error:', error);
      }
    }
  }
});

// Error handling
bot.catch((err, ctx) => {
  console.error(`Error for ${ctx.updateType}`, err);
  ctx.reply('An error occurred. Please try again.');
});

// Start the bot
bot.launch();

console.log('Advanced Media Transfer Bot is running...');
console.log('Add channels with /add_source and /add_destination');
console.log('Enable auto-transfer with /toggle_auto');