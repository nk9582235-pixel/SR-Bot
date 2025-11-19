// Simple health check script
console.log('Health check script running...');

// Check if required environment variables are set
const requiredVars = ['BOT_TOKEN']; // TELEGRAM_API_ID and TELEGRAM_API_HASH are optional for basic bot
const missingVars = [];

requiredVars.forEach(varName => {
  if (!process.env[varName]) {
    missingVars.push(varName);
  }
});

if (missingVars.length > 0) {
  console.log('❌ Missing environment variables:', missingVars.join(', '));
  process.exit(1);
} else {
  console.log('✅ All required environment variables are set');
  console.log('BOT_TOKEN:', process.env.BOT_TOKEN ? 'SET' : 'NOT SET');
  console.log('TELEGRAM_API_ID:', process.env.TELEGRAM_API_ID ? 'SET' : 'NOT SET');
  console.log('TELEGRAM_API_HASH:', process.env.TELEGRAM_API_HASH ? 'SET' : 'NOT SET');
}

console.log('✅ Health check passed');