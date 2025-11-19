const fs = require('fs');
const path = require('path');

/**
 * Save channel settings to config file
 * @param {Object} channelSettings - The channel settings to save
 */
function saveConfig(channelSettings) {
  // Read the current config file
  const configPath = path.join(__dirname, 'config.js');
  
  try {
    // Read the current config content
    let configContent = fs.readFileSync(configPath, 'utf8');
    
    // Convert Sets to arrays for saving
    const sourceArray = Array.from(channelSettings.sourceChannels);
    const destinationArray = Array.from(channelSettings.destinationChannels);
    
    // Update the channels section
    const updatedContent = configContent.replace(
      /channels:\s*{[^}]*}/s,
      `channels: {
    // Source channels to monitor (array of usernames)
    source: ${JSON.stringify(sourceArray)},
    
    // Destination channels to send media to (array of usernames)
    destination: ${JSON.stringify(destinationArray)},
    
    // Auto-transfer enabled
    autoTransfer: ${channelSettings.autoTransfer}
  }`
    );
    
    // Write the updated config back to file
    fs.writeFileSync(configPath, updatedContent, 'utf8');
    console.log('Configuration saved successfully');
  } catch (error) {
    console.error('Error saving configuration:', error);
  }
}

/**
 * Format bytes to human readable format
 * @param {number} bytes - Number of bytes
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted byte string
 */
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

module.exports = {
  saveConfig,
  formatBytes
};