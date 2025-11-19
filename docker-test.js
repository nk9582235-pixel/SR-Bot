// Test Docker setup
console.log('Docker test running...');

// Check Node.js version
console.log('Node.js version:', process.version);

// Check if required modules can be imported
try {
  require('telegraf');
  console.log('✅ Telegraf module available');
} catch (error) {
  console.log('❌ Telegraf module not available:', error.message);
}

try {
  require('express');
  console.log('✅ Express module available');
} catch (error) {
  console.log('❌ Express module not available:', error.message);
}

try {
  require('dotenv');
  console.log('✅ Dotenv module available');
} catch (error) {
  console.log('❌ Dotenv module not available:', error.message);
}

console.log('✅ Docker test completed');