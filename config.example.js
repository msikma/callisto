const EXAMPLE_SERVER = '8342'
const EXAMPLE_GENERAL_CHANNEL = '1234'
const EXAMPLE_LOG_CHANNEL = '21334'

module.exports = {
  // App bot user token.
  CALLISTO_BOT_TOKEN: 'bot_token',
  // App bot user ID.
  CALLISTO_BOT_CLIENT_ID: 'client_id',
  // The name the bot will listen to.
  CALLISTO_BOT_NAME: 'Callisto',
  // An avatar used during bootup. This won't replace the bot's own user avatar.
  CALLISTO_BOT_AVATAR: 'http://site.com/image.jpg',
  // General settings for the core functionality of the bot.
  CALLISTO_SETTINGS: {
    // On what channels do we listen and respond to user input?
    respond: [[EXAMPLE_SERVER, EXAMPLE_GENERAL_CHANNEL]],
    // Callisto can log errors to Discord (aside from the standard log file).
    // Log errors to these channels:
    logChannels: [[EXAMPLE_SERVER, EXAMPLE_LOG_CHANNEL]],
    // Only errors of this severity and above are logged:
    // (Can be: debug, verbose, info, warn, error.)
    logLevel: 'warn'
  },
  // Task settings.
  CALLISTO_TASK_SETTINGS: {
    // Add task settings here.
  }
}
