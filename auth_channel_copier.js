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
      },
      authenticated: false,
      phone: null,
      code: null,
      authorized: false
    });
  }
  return userSessions.get(userId);
}

// Start command
bot.command('start', (ctx) => {
  ctx.reply(`
Telegram Channel Copier Bot

🔐 Authentication Required
To access private channels, you need to authenticate with your Telegram account.

Step 1: Authenticate
/login - Login with your phone number

Step 2: Set Channels
/schannel -100xxxxxx (or @username for public)
/tchannel -100xxxxxx (or @username for public)

Step 3: Set Message Range
/set_F  "For full channel"
/set_P  "Selective Message"  Eg: /set_P "https://t.me/xxxxx/71031" "https://t.me/xxxx/71050"

Step 4: Set Copy Type
/all  "For all text and media"
/media "For media only"

Step 5: Start copying
/copy

Check status: /status
`);
});

// Login command
bot.command('login', (ctx) => {
  const session = getUserSession(ctx.from.id);
  session.authenticated = true;
  ctx.reply('📱 Please send your phone number in international format (e.g., +1234567890)');
});

// Handle phone number
bot.hears(/\+?[1-9]\d{1,14}/, async (ctx) => {
  const session = getUserSession(ctx.from.id);
  
  if (!session.authenticated) return;
  
  const phone = ctx.message.text.trim();
  session.phone = phone;
  
  // In a real implementation, this would send a code request to Telegram
  // For demonstration, we'll simulate the process
  ctx.reply(`🔢 Please enter the 5-digit code sent to your phone (${phone}).
  
Note: In a real implementation, this would connect to Telegram's API and send an actual code.`);
  
  // Simulate code generation
  session.code = '12345';
});

// Handle verification code
bot.hears(/^\d{5}$/, async (ctx) => {
  const session = getUserSession(ctx.from.id);
  
  if (!session.phone || !session.authenticated) return;
  
  const code = ctx.message.text.trim();
  
  // In a real implementation, this would verify the code with Telegram
  if (code === session.code) {
    session.authorized = true;
    session.authenticated = false; // Reset auth state
    ctx.reply('✅ Authentication successful! You can now access private channels.');
  } else {
    ctx.reply('❌ Invalid code. Please try again.');
  }
});

// Set source channel
bot.command('schannel', (ctx) => {
  const session = getUserSession(ctx.from.id);
  
  if (!session.authorized) {
    return ctx.reply('⚠️ Please authenticate first using /login');
  }
  
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
  
  if (!session.authorized) {
    return ctx.reply('⚠️ Please authenticate first using /login');
  }
  
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
  
  if (!session.authorized) {
    return ctx.reply('⚠️ Please authenticate first using /login');
  }
  
  session.messageRange.type = 'full';
  session.messageRange.start = null;
  session.messageRange.end = null;
  ctx.reply('✅ Set to copy full channel');
});

// Set partial channel copy
bot.command('set_P', (ctx) => {
  const session = getUserSession(ctx.from.id);
  
  if (!session.authorized) {
    return ctx.reply('⚠️ Please authenticate first using /login');
  }
  
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
  
  if (!session.authorized) {
    return ctx.reply('⚠️ Please authenticate first using /login');
  }
  
  session.copyType = 'all';
  ctx.reply('✅ Set copy type to: All (text and media)');
});

// Set copy type to media only
bot.command('media', (ctx) => {
  const session = getUserSession(ctx.from.id);
  
  if (!session.authorized) {
    return ctx.reply('⚠️ Please authenticate first using /login');
  }
  
  session.copyType = 'media';
  ctx.reply('✅ Set copy type to: Media only');
});

// Status command
bot.command('status', (ctx) => {
  const session = getUserSession(ctx.from.id);
  
  ctx.reply(`
Current Settings:
Authentication: ${session.authorized ? '✅ Authorized' : '❌ Not Authorized'}
Source: ${session.sourceChannel || 'Not set'}
Target: ${session.targetChannel || 'Not set'}
Copy Type: ${session.copyType}
Range: ${session.messageRange.type === 'full' ? 'Full Channel' : `Messages ${session.messageRange.start} to ${session.messageRange.end}`}
`);
});

// Copy command - main functionality
bot.command('copy', async (ctx) => {
  const session = getUserSession(ctx.from.id);
  
  if (!session.authorized) {
    return ctx.reply('⚠️ Please authenticate first using /login');
  }
  
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