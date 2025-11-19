require('dotenv').config();
const { Telegraf } = require('telegraf');
const express = require('express');
const path = require('path');

// Check if BOT_TOKEN environment variable is set
const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
  console.error('Please provide BOT_TOKEN environment variable');
  process.exit(1);
}

// Initialize the bot
const bot = new Telegraf(BOT_TOKEN);

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// In-memory storage for copy jobs
const copyJobs = new Map();

// Bot commands
bot.command('start', (ctx) => {
  ctx.reply('Welcome to the Telegram Channel Copier Bot! You can also use our web interface at https://your-app-name.onrender.com');
});

bot.command('help', (ctx) => {
  ctx.reply(`
Telegram Channel Copier Bot

Commands:
/start - Welcome message
/help - Show this help
/set_source <channel> - Set source channel
/set_destination <channel> - Set destination channel
/set_copy_mode <media|both> - Set copy mode
/copy - Start copying

You can also use our web interface for easier configuration!
  `);
});

// Web routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/status', (req, res) => {
  res.json({
    status: 'running',
    activeJobs: copyJobs.size
  });
});

app.post('/api/copy', async (req, res) => {
  const { source, destination, mode = 'both', startId, endId } = req.body;
  
  // Validate input
  if (!source || !destination) {
    return res.status(400).json({ error: 'Source and destination are required' });
  }
  
  // Create job ID
  const jobId = 'job_' + Date.now();
  
  // Store job info
  copyJobs.set(jobId, {
    source,
    destination,
    mode,
    startId,
    endId,
    status: 'queued',
    progress: 0,
    copied: 0,
    total: 0
  });
  
  // In a real implementation, you would start the actual copying process here
  // For now, we'll simulate it
  
  // Simulate async processing
  setTimeout(() => {
    const job = copyJobs.get(jobId);
    if (job) {
      job.status = 'completed';
      job.progress = 100;
      job.copied = 50; // Simulated
      job.total = 50;  // Simulated
      copyJobs.set(jobId, job);
    }
  }, 5000);
  
  res.json({
    success: true,
    jobId,
    message: 'Copy job started successfully'
  });
});

app.get('/api/job/:jobId', (req, res) => {
  const { jobId } = req.params;
  const job = copyJobs.get(jobId);
  
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  
  res.json(job);
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Web server running on http://localhost:${PORT}`);
});

// Enable graceful stop
process.once('SIGINT', () => {
  console.log('Stopping server...');
  server.close();
  bot.stop('SIGINT');
  process.exit(0);
});

process.once('SIGTERM', () => {
  console.log('Stopping server...');
  server.close();
  bot.stop('SIGTERM');
  process.exit(0);
});

// Launch bot
bot.launch();

console.log('Telegram Channel Copier Bot is running...');