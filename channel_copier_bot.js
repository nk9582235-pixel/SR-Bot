require('dotenv').config();
const { Telegraf, session } = require('telegraf');
const fs = require('fs').promises;
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

// In-memory storage for user sessions
const userSessions = new Map();

// Helper function to get user session
function getUserSession(ctx) {
  const userId = ctx.from.id;
  if (!userSessions.has(userId)) {
    userSessions.set(userId, {
      source: null,
      destination: null,
      copyMode: 'both', // 'media', 'both'
      startMessageId: null,
      endMessageId: null,
      copying: false,
      copiedCount: 0,
      totalCount: 0
    });
  }
  return userSessions.get(userId);
}

// Helper function to validate entity access
async function validateEntityAccess(ctx, entity) {
  try {
    // Try to get chat information to verify access
    await ctx.telegram.getChat(entity);
    return true;
  } catch (error) {
    console.error(`Access validation error for ${entity}:`, error.description);
    return false;
  }
}

// Start command
bot.command('start', (ctx) => {
  const welcomeMessage = `
🤖 *Telegram Channel Copier Bot*

Welcome! This bot can copy entire channels including all types of messages.

🔹 *Features:*
• Copy from any Telegram entity (channels, groups, chats, bots)
• Selective copying (media only or media + text)
• Copy specific message ranges
• Multi-user support
• Deployable on Render.com

🛠 *Commands:*
/set_source - Set source channel/chat
/set_destination - Set destination channel/chat
/set_copy_mode - Choose what to copy (media/text)
/set_message_range - Set message range to copy
/copy - Start copying process
/status - Check copying status
/cancel - Cancel ongoing copy process
/help - Show this help message

Let's get started! Use /set_source to begin.
  `;
  ctx.replyWithMarkdown(welcomeMessage);
});

// Help command
bot.command('help', (ctx) => {
  const helpMessage = `
📘 *Telegram Channel Copier Bot - Help*

🔹 *Setup:*
1. Add this bot to both source and destination as admin
2. Use /set_source to specify what to copy from
3. Use /set_destination to specify where to copy to
4. Configure copy options with /set_copy_mode
5. Start copying with /copy

🔹 *Commands:*
/set_source <username/id> - Set source (public: @username, private: chat ID)
/set_destination <username/id> - Set destination
/set_copy_mode <media|both> - What to copy (default: both)
/set_message_range <start_id> <end_id> - Copy specific message range
/copy - Start copying process
/status - Check copying status
/cancel - Cancel ongoing copy process
/help - Show this help message

🔹 *Copy Modes:*
• \`media\` - Copy only media files (photos, videos, documents, etc.)
• \`both\` - Copy all messages (media + text)

🔹 *Supported Entities:*
• Public channels/groups (@username)
• Private channels/groups (use invite link or chat ID)
• Personal chats
• Bot conversations
  `;
  ctx.replyWithMarkdown(helpMessage);
});

// Set source command
bot.command('set_source', (ctx) => {
  const session = getUserSession(ctx);
  const source = ctx.message.text.split(' ').slice(1).join(' ').trim();
  
  if (!source) {
    return ctx.reply('Please provide a source. Usage: /set_source @channel_username or /set_source -1001234567890');
  }
  
  session.source = source.startsWith('@') || source.startsWith('-') ? source : '@' + source;
  ctx.reply(`✅ Source set to: \`${session.source}\``, { parse_mode: 'Markdown' });
});

// Set destination command
bot.command('set_destination', (ctx) => {
  const session = getUserSession(ctx);
  const destination = ctx.message.text.split(' ').slice(1).join(' ').trim();
  
  if (!destination) {
    return ctx.reply('Please provide a destination. Usage: /set_destination @channel_username or /set_destination -1001234567890');
  }
  
  session.destination = destination.startsWith('@') || destination.startsWith('-') ? destination : '@' + destination;
  ctx.reply(`✅ Destination set to: \`${session.destination}\``, { parse_mode: 'Markdown' });
});

// Set copy mode command
bot.command('set_copy_mode', (ctx) => {
  const session = getUserSession(ctx);
  const mode = ctx.message.text.split(' ')[1];
  
  if (!mode) {
    return ctx.reply('Please specify copy mode. Usage: /set_copy_mode media or /set_copy_mode both');
  }
  
  if (mode !== 'media' && mode !== 'both') {
    return ctx.reply('Invalid mode. Use either "media" or "both"');
  }
  
  session.copyMode = mode;
  ctx.reply(`✅ Copy mode set to: \`${mode}\``, { parse_mode: 'Markdown' });
});

// Set message range command
bot.command('set_message_range', (ctx) => {
  const session = getUserSession(ctx);
  const args = ctx.message.text.split(' ').slice(1);
  
  if (args.length < 2) {
    return ctx.reply('Please provide start and end message IDs. Usage: /set_message_range 100 200');
  }
  
  const startId = parseInt(args[0]);
  const endId = parseInt(args[1]);
  
  if (isNaN(startId) || isNaN(endId)) {
    return ctx.reply('Please provide valid numeric message IDs');
  }
  
  if (startId >= endId) {
    return ctx.reply('Start message ID must be less than end message ID');
  }
  
  session.startMessageId = startId;
  session.endMessageId = endId;
  ctx.reply(`✅ Message range set: \`${startId}\` to \`${endId}\``, { parse_mode: 'Markdown' });
});

// Status command
bot.command('status', (ctx) => {
  const session = getUserSession(ctx);
  
  if (session.copying) {
    const progress = session.totalCount > 0 ? Math.round((session.copiedCount / session.totalCount) * 100) : 0;
    ctx.reply(`🔄 *Copying in progress...*
Progress: ${session.copiedCount}/${session.totalCount} (${progress}%)
Source: \`${session.source}\`
Destination: \`${session.destination}\`
Mode: \`${session.copyMode}\``, { parse_mode: 'Markdown' });
  } else {
    ctx.reply(`⏸ *No copying in progress*
Source: \`${session.source || 'Not set'}\`
Destination: \`${session.destination || 'Not set'}\`
Mode: \`${session.copyMode}\`
Range: \`${session.startMessageId || 'Start'}\` - \`${session.endMessageId || 'End'}\``, { parse_mode: 'Markdown' });
  }
});

// Cancel command
bot.command('cancel', (ctx) => {
  const session = getUserSession(ctx);
  session.copying = false;
  session.copiedCount = 0;
  session.totalCount = 0;
  ctx.reply('❌ Copying process cancelled');
});

// Copy command - main functionality
bot.command('copy', async (ctx) => {
  const session = getUserSession(ctx);
  
  // Validate settings
  if (!session.source) {
    return ctx.reply('Please set a source first using /set_source');
  }
  
  if (!session.destination) {
    return ctx.reply('Please set a destination first using /set_destination');
  }
  
  if (session.copying) {
    return ctx.reply('A copying process is already in progress. Use /cancel to stop it first.');
  }
  
  // Start copying process
  session.copying = true;
  session.copiedCount = 0;
  session.totalCount = 0;
  
  try {
    ctx.reply('🔄 Starting copy process...');
    
    // Validate source and destination
    if (!await validateEntityAccess(ctx, session.source)) {
      session.copying = false;
      return ctx.reply(`❌ Cannot access source: ${session.source}. Please check permissions.`);
    }
    
    if (!await validateEntityAccess(ctx, session.destination)) {
      session.copying = false;
      return ctx.reply(`❌ Cannot access destination: ${session.destination}. Please check permissions.`);
    }
    
    // Determine message range
    const startId = session.startMessageId || 1;
    let endId = session.endMessageId;
    
    // If no end ID specified, use a default range
    if (!endId) {
      endId = startId + 99; // Default range of 100 messages
    }
    
    // Count messages in range
    session.totalCount = endId - startId + 1;
    ctx.reply(`📊 Found ${session.totalCount} messages to copy (IDs ${startId} to ${endId})`);
    
    // Copy messages
    for (let messageId = startId; messageId <= endId; messageId++) {
      if (!session.copying) break; // Check if cancelled
      
      try {
        // Instead of forwarding to check content, we'll try to copy directly
        // and handle errors appropriately
        try {
          // Forward message directly to destination
          const copiedMessage = await ctx.telegram.forwardMessage(
            session.destination, 
            session.source, 
            messageId
          );
          
          // If we're in media-only mode, check if message has media
          if (session.copyMode === 'media') {
            const hasMedia = copiedMessage.photo || copiedMessage.video || copiedMessage.document || 
                             copiedMessage.audio || copiedMessage.voice || copiedMessage.animation ||
                             copiedMessage.sticker;
            
            if (!hasMedia) {
              // Delete the copied message since it doesn't match our filter
              try {
                await ctx.telegram.deleteMessage(session.destination, copiedMessage.message_id);
              } catch (deleteError) {
                console.error('Error deleting non-media message:', deleteError.description);
              }
            } else {
              session.copiedCount++;
            }
          } else {
            // Copy mode is 'both', count all messages
            session.copiedCount++;
          }
          
          // Send progress updates every 10 messages
          if (session.copiedCount % 10 === 0 || session.copiedCount === session.totalCount) {
            const progress = Math.round((session.copiedCount / session.totalCount) * 100);
            ctx.reply(`🔄 Progress: ${session.copiedCount}/${session.totalCount} (${progress}%)`);
          }
        } catch (forwardError) {
          // If we can't forward the message, it might not exist or lack permissions
          console.error(`Cannot copy message ${messageId}:`, forwardError.description);
        }

        
        // Respect Telegram rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (forwardError) {
        console.error(`Error copying message ${messageId}:`, forwardError.description);
        // Continue with next message
      }
    }
    
    if (session.copying) {
      session.copying = false;
      ctx.reply(`✅ Copy process completed!
Successfully copied ${session.copiedCount} messages from \`${session.source}\` to \`${session.destination}\``, 
      { parse_mode: 'Markdown' });
    } else {
      ctx.reply('❌ Copy process was cancelled');
    }
  } catch (error) {
    session.copying = false;
    console.error('Copy error:', error);
    ctx.reply('❌ An error occurred during copying. Please check that the bot has proper permissions and try again.');
  }
});

// Handle inline buttons for settings
bot.action(/set_mode:(.+)/, (ctx) => {
  const session = getUserSession(ctx);
  const mode = ctx.match[1];
  
  session.copyMode = mode;
  ctx.answerCbQuery(`Copy mode set to: ${mode}`);
  ctx.editMessageText(`✅ Copy mode set to: \`${mode}\``, { 
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [{ text: '⬅️ Back to Settings', callback_data: 'settings' }]
      ]
    }
  });
});

bot.action('settings', (ctx) => {
  const session = getUserSession(ctx);
  ctx.editMessageText(`
⚙️ *Copy Settings*

Source: \`${session.source || 'Not set'}\`
Destination: \`${session.destination || 'Not set'}\`
Mode: \`${session.copyMode}\`
Range: \`${session.startMessageId || 'Start'}\` - \`${session.endMessageId || 'End'}\`

What would you like to change?
  `, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Copy Mode', callback_data: 'copy_mode' }],
        [{ text: 'Message Range', callback_data: 'message_range' }],
        [{ text: 'Start Copying', callback_data: 'start_copy' }]
      ]
    }
  });
});

bot.action('copy_mode', (ctx) => {
  ctx.editMessageText('📝 *Select Copy Mode*', {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Media Only', callback_data: 'set_mode:media' }],
        [{ text: 'Media + Text', callback_data: 'set_mode:both' }],
        [{ text: '⬅️ Back', callback_data: 'settings' }]
      ]
    }
  });
});

// Error handling
bot.catch((err, ctx) => {
  console.error(`Error for ${ctx.updateType}`, err);
  ctx.reply('❌ An error occurred. Please try again.');
});

// Start the bot
bot.launch();

console.log('Telegram Channel Copier Bot is running...');
console.log('Make sure to set your BOT_TOKEN in the .env file');