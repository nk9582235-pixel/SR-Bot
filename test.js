// Simple test to verify bot code syntax
try {
  require('./index.js');
  console.log('Basic bot code syntax OK');
} catch (error) {
  console.error('Basic bot code syntax error:', error.message);
}

try {
  require('./advanced_bot.js');
  console.log('Advanced bot code syntax OK');
} catch (error) {
  console.error('Advanced bot code syntax error:', error.message);
}

try {
  require('./config.js');
  console.log('Config file syntax OK');
} catch (error) {
  console.error('Config file syntax error:', error.message);
}

try {
  require('./utils.js');
  console.log('Utils file syntax OK');
} catch (error) {
  console.error('Utils file syntax error:', error.message);
}

console.log('All syntax checks completed');