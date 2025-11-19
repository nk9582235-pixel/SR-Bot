require('dotenv').config();
const { Telegraf, session } = require('telegraf');
const fs = require('fs');
const path = require('path');

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

// Store channel information in session
bot.command('start', (ctx) => {
  ctx.reply('Welcome to the Media Transfer Bot!\n\n' +
    'Commands:\n' +
    '/set_source - Set the source channel username\n' +
    '/set_destination - Set the destination channel username\n' +
    '/transfer - Transfer media from source to destination\n' +
    '/help - Show this help message');
});

// Help command
bot.command('help', (ctx) => {
  ctx.reply('This bot helps transfer media from one Telegram channel to another.\n\n' +
    'How to use:\n' +
    '1. Add this bot as an admin to both source and destination channels\n' +
    '2. Use /set_source to specify the source channel\n' +
    '3. Use /set_destination to specify the destination channel\n' +
    '4. Forward any media to this bot to transfer it\n\n' +
    'Commands:\n' +
    '/set_source <username> - Set source channel\n' +
    '/set_destination <username> - Set destination channel\n' +
    '/transfer - Transfer last received media\n' +
    '/help - Show this help message');
});

// Set source channel
bot.command('set_source', (ctx) => {
  const sourceChannel = ctx.message.text.split(' ')[1];
  if (!sourceChannel) {
    return ctx.reply('Please provide a channel username. Usage: /set_source @channel_username');
  }
  
  ctx.session.sourceChannel = sourceChannel.startsWith('@') ? sourceChannel : '@' + sourceChannel;
  ctx.reply(`Source channel set to: ${ctx.session.sourceChannel}`);
});

// Set destination channel
bot.command('set_destination', (ctx) => {
  const destChannel = ctx.message.text.split(' ')[1];
  if (!destChannel) {
    return ctx.reply('Please provide a channel username. Usage: /set_destination @channel_username');
  }
  
  ctx.session.destChannel = destChannel.startsWith('@') ? destChannel : '@' + destChannel;
  ctx.reply(`Destination channel set to: ${ctx.session.destChannel}`);
});

// Handle forwarded media
bot.on(['photo', 'video', 'document', 'audio', 'voice', 'sticker'], async (ctx) => {
  // Store the media for later transfer
  ctx.session.lastMedia = {
    type: Object.keys(ctx.update.message).find(key => 
      ['photo', 'video', 'document', 'audio', 'voice', 'sticker'].includes(key)
    ),
    file_id: getFileId(ctx.update.message),
    caption: ctx.update.message.caption
  };
  
  ctx.reply('Media saved! Use /transfer to move it to the destination channel.');
});

// Transfer command
bot.command('transfer', async (ctx) => {
  if (!ctx.session.sourceChannel) {
    return ctx.reply('Please set a source channel first using /set_source');
  }
  
  if (!ctx.session.destChannel) {
    return ctx.reply('Please set a destination channel first using /set_destination');
  }
  
  if (!ctx.session.lastMedia) {
    return ctx.reply('No media to transfer. Please forward some media to the bot first.');
  }
  
  try {
    const media = ctx.session.lastMedia;
    
    // Send media to destination channel
    switch (media.type) {
      case 'photo':
        await ctx.telegram.sendPhoto(ctx.session.destChannel, media.file_id, {
          caption: media.caption
        });
        break;
      case 'video':
        await ctx.telegram.sendVideo(ctx.session.destChannel, media.file_id, {
          caption: media.caption
        });
        break;
      case 'document':
        await ctx.telegram.sendDocument(ctx.session.destChannel, media.file_id, {
          caption: media.caption
        });
        break;
      case 'audio':
        await ctx.telegram.sendAudio(ctx.session.destChannel, media.file_id, {
          caption: media.caption
        });
        break;
      case 'voice':
        await ctx.telegram.sendVoice(ctx.session.destChannel, media.file_id, {
          caption: media.caption
        });
        break;
      case 'sticker':
        await ctx.telegram.sendSticker(ctx.session.destChannel, media.file_id);
        break;
    }
    
    ctx.reply('Media successfully transferred!');
  } catch (error) {
    console.error('Transfer error:', error);
    ctx.reply('Failed to transfer media. Please make sure the bot has admin rights in both channels.');
  }
});

// Helper function to get file ID
function getFileId(message) {
  const mediaType = Object.keys(message).find(key => 
    ['photo', 'video', 'document', 'audio', 'voice', 'sticker'].includes(key)
  );
  
  if (mediaType === 'photo') {
    // For photos, use the largest size
    const photoArray = message[mediaType];
    return photoArray[photoArray.length - 1].file_id;
  }
  
  return message[mediaType].file_id;
}

// Error handling
bot.catch((err, ctx) => {
  console.error(`Error for ${ctx.updateType}`, err);
  ctx.reply('An error occurred. Please try again.');
});

// Start the bot
bot.launch();

console.log('Bot is running...');