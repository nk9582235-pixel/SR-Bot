// Configuration file for Telegram Media Transfer Bot

module.exports = {
  // Bot settings
  bot: {
    // Session storage type: 'memory' or 'file'
    sessionStorage: 'memory',
    
    // Auto-transfer interval in milliseconds (0 = disabled)
    autoTransferInterval: 0,
    
    // Maximum number of recent media items to track
    maxRecentMedia: 50
  },
  
  // Channel settings
  channels: {
    // Source channels to monitor (array of usernames)
    source: [],
    
    // Destination channels to send media to (array of usernames)
    destination: [],
    
    // Auto-transfer enabled
    autoTransfer: false
  },
  
  // Media filtering options
  mediaFilter: {
    // Enabled media types
    types: {
      photo: true,
      video: true,
      document: true,
      audio: true,
      voice: true,
      sticker: true
    },
    
    // Minimum file size to transfer (in bytes, 0 = no limit)
    minFileSize: 0,
    
    // Maximum file size to transfer (in bytes, 0 = no limit)
    maxFileSize: 0
  }
};