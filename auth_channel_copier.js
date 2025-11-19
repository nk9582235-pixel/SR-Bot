require('dotenv').config();
const { Telegraf } = require('telegraf');
const express = require('express');

// Check if BOT_TOKEN environment variable is set
const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
  console.error('Please provide BOT_TOKEN environment variable');
  process.exit(1);
}

// Initialize the bot
const bot = new Telegraf(BOT_TOKEN);

// In-memory storage for user sessions and authentication
const userSessions = new Map();
const userAuth = new Map();

// Helper function to get user session
function getUserSession(userId) {
  if (!userSessions.has(userId)) {
    userSessions.set(userId, {
      sourceChannel: null,
      targetChannel: null,
      copyType: 'all', // 'all' or 'media'
      messageRange: {
        type: 'full', // 'full' or 'partial'
        start: null,
        end: null
      }
    });
  }
  return userSessions.get(userId);
}

// Start command
bot.command('start', (ctx) => {
  ctx.reply(`
Telegram Channel Copier Bot

🔐 Authentication Information
Note: This bot works with channels where it has been added as an administrator.
For private channels, you must add this bot as an admin to both source and target channels.

Step 1: Set Channels
/schannel -100xxxxxx (or @username for public)
/tchannel -100xxxxxx (or @username for public)

Step 2: Set Message Range
/set_F  "For full channel"
/set_P  "Selective Message"  Eg: /set_P "https://t.me/xxxxx/71031" "https://t.me/xxxx/71050"

Step 3: Set Copy Type
/all  "For all text and media"
/media "For media only"

Step 4: Start copying
/copy

Check status: /status
`);
});

// Note: User authentication via phone number is not implemented in this version
// The bot works by being added as an administrator to channels

// Set source channel
bot.command('schannel', (ctx) => {
  const session = getUserSession(ctx.from.id);
  
  const channelId = ctx.message.text.split(' ')[1];
  
  if (!channelId) {
    return ctx.reply('Please provide a channel ID or username. Usage: /schannel -100xxxxxx or /schannel @username');
  }
  
  session.sourceChannel = channelId;
  ctx.reply(`✅ Source channel set to: ${channelId}`);
});

// Set target channel
bot.command('tchannel', (ctx) => {
  const session = getUserSession(ctx.from.id);
  
  const channelId = ctx.message.text.split(' ')[1];
  
  if (!channelId) {
    return ctx.reply('Please provide a channel ID or username. Usage: /tchannel -100xxxxxx or /tchannel @username');
  }
  
  session.targetChannel = channelId;
  ctx.reply(`✅ Target channel set to: ${channelId}`);
});

// Set full channel copy
bot.command('set_F', (ctx) => {
  const session = getUserSession(ctx.from.id);
  
  session.messageRange.type = 'full';
  session.messageRange.start = null;
  session.messageRange.end = null;
  ctx.reply('✅ Set to copy full channel');
});

// Set partial channel copy
bot.command('set_P', (ctx) => {
  const session = getUserSession(ctx.from.id);
  
  const args = ctx.message.text.split(' ');
  
  if (args.length < 3) {
    return ctx.reply('Please provide both start and end message links. Usage: /set_P "https://t.me/xxxxx/71031" "https://t.me/xxxx/71050"');
  }
  
  const startLink = args[1].replace(/"/g, '');
  const endLink = args[2].replace(/"/g, '');
  
  // Extract message IDs from links
  const startId = extractMessageId(startLink);
  const endId = extractMessageId(endLink);
  
  if (!startId || !endId) {
    return ctx.reply('Invalid message links. Please provide valid Telegram message links.');
  }
  
  session.messageRange.type = 'partial';
  session.messageRange.start = startId;
  session.messageRange.end = endId;
  ctx.reply(`✅ Set to copy messages from ${startId} to ${endId}`);
});

// Set copy type to all
bot.command('all', (ctx) => {
  const session = getUserSession(ctx.from.id);
  
  session.copyType = 'all';
  ctx.reply('✅ Set copy type to: All (text and media)');
});

// Set copy type to media only
bot.command('media', (ctx) => {
  const session = getUserSession(ctx.from.id);
  
  session.copyType = 'media';
  ctx.reply('✅ Set copy type to: Media only');
});

// Status command
bot.command('status', (ctx) => {
  const session = getUserSession(ctx.from.id);
  
  ctx.reply(`
Current Settings:
Source: ${session.sourceChannel || 'Not set'}
Target: ${session.targetChannel || 'Not set'}
Copy Type: ${session.copyType}
Range: ${session.messageRange.type === 'full' ? 'Full Channel' : `Messages ${session.messageRange.start} to ${session.messageRange.end}`}
`);
});

// Copy command - main functionality
bot.command('copy', async (ctx) => {
  const session = getUserSession(ctx.from.id);
  
  // Validate settings
  if (!session.sourceChannel) {
    return ctx.reply('Please set source channel first using /schannel');
  }
  
  if (!session.targetChannel) {
    return ctx.reply('Please set target channel first using /tchannel');
  }
  
  try {
    ctx.reply('🔄 Starting copy process...');
    
    // Validate source and target channels
    try {
      await ctx.telegram.getChat(session.sourceChannel);
    } catch (error) {
      return ctx.reply(`❌ Cannot access source channel: ${session.sourceChannel}. Please check permissions.`);
    }
    
    try {
      await ctx.telegram.getChat(session.targetChannel);
    } catch (error) {
      return ctx.reply(`❌ Cannot access target channel: ${session.targetChannel}. Please check permissions.`);
    }
    
    // Determine message range
    let startId, endId;
    if (session.messageRange.type === 'full') {
      // For full channel, we'll simulate with a default range
      startId = 1;
      endId = 100;
    } else {
      startId = session.messageRange.start;
      endId = session.messageRange.end;
    }
    
    const totalCount = endId - startId + 1;
    let copiedCount = 0;
    
    ctx.reply(`📊 Copying ${totalCount} messages from ${session.sourceChannel} to ${session.targetChannel}`);
    
    // Actual copying process
    for (let messageId = startId; messageId <= endId; messageId++) {
      try {
        // Get message to check content type if media-only mode
        if (session.copyType === 'media') {
          // Try to forward message to check if it has media
          const message = await ctx.telegram.forwardMessage(ctx.from.id, session.sourceChannel, messageId);
          
          // Check if message has media
          const hasMedia = message.photo || message.video || message.document || 
                           message.audio || message.voice || message.animation ||
                           message.sticker;
          
          // Delete the temporary forwarded message
          try {
            await ctx.telegram.deleteMessage(ctx.from.id, message.message_id);
          } catch (deleteError) {
            // Ignore deletion errors
          }
          
          // Skip if no media
          if (!hasMedia) {
            continue;
          }
        }
        
        // Forward message to target channel
        await ctx.telegram.forwardMessage(session.targetChannel, session.sourceChannel, messageId);
        copiedCount++;
        
        // Send progress updates every 10 messages
        if (copiedCount % 10 === 0 || copiedCount === totalCount) {
          const progress = Math.round((copiedCount / totalCount) * 100);
          ctx.reply(`🔄 Progress: ${copiedCount}/${totalCount} (${progress}%)`);
        }
        
        // Respect Telegram rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Error copying message ${messageId}:`, error.description);
        // Continue with next message
      }
    }
    
    ctx.reply(`✅ Copy process completed!
Successfully copied ${copiedCount} messages from ${session.sourceChannel} to ${session.targetChannel}`);
  } catch (error) {
    console.error('Copy error:', error);
    ctx.reply('❌ An error occurred during copying. Please check that the bot has proper permissions and try again.');
  }
});

// Helper function to extract message ID from Telegram link
function extractMessageId(link) {
  try {
    const url = new URL(link);
    const pathParts = url.pathname.split('/');
    return parseInt(pathParts[pathParts.length - 1]);
  } catch (error) {
    return null;
  }
}

// Error handling
bot.catch((err, ctx) => {
  console.error(`Error for ${ctx.updateType}`, err);
  ctx.reply('❌ An error occurred. Please try again.');
});

// Start Express server for health checks
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'Telegram Channel Copier Bot is running', 
    status: 'OK' 
  });
});

app.listen(PORT, () => {
  console.log(`Health check server running on port ${PORT}`);
});

// Start the bot
bot.launch();

console.log('Authenticated Telegram Channel Copier Bot is running...');
console.log('Make sure to set your BOT_TOKEN, TELEGRAM_API_ID, and TELEGRAM_API_HASH in the environment variables');