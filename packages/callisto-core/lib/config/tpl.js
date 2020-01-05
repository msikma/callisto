// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

const PropTypes = require('prop-types')

const configModel = {
  youtube: PropTypes.shape({
    defaults: PropTypes.shape({
      target: PropTypes.array
    }),
    subscriptions: PropTypes.arrayOf(PropTypes.shape({
      slug: PropTypes.string.isRequired,
      subscriptions: PropTypes.string.isRequired,
      target: PropTypes.array
    })).isRequired,
    searches: PropTypes.arrayOf(PropTypes.shape({
      slug: PropTypes.string.isRequired,
      searchParameters: PropTypes.string.isRequired,
      searchQuery: PropTypes.string.isRequired,
      target: PropTypes.array
    })).isRequired
  })
}

/**
 * Returns the content of a new config file.
 * The resulting string should be trimmed before saving to a file.
 */
const configTpl = configPadded => (`
// Calypso bot config file

// Example server and channel IDs. Get these by right-clicking a server/channel and using 'Copy ID'.
const SERVER = '415267835054690314'
const CHANNEL = '415478825623211282'

module.exports = {
  // App bot user token.
  CALYPSO_BOT_TOKEN: '',
  // App bot user ID.
  CALYPSO_BOT_CLIENT_ID: '',
  // The name the bot will listen to.
  CALYPSO_BOT_NAME: '',
  // An avatar used during bootup. This won't replace the bot's own user avatar.
  CALYPSO_BOT_AVATAR: '/* URL */',
  // General settings for the core functionality of the bot.
  CALYPSO_SETTINGS: {
    // On what channels do we listen and respond to user input?
    respond: [[SERVER, CHANNEL]],
    // Calypso can log errors to Discord (aside from the standard log file).
    // Send log messages to these channels:
    logChannels: [[SERVER, CHANNEL]],
    // Log channels for important log messages:
    logChannelsImportant: [[SERVER, CHANNEL]],
    // Log messages of this severity and above are logged as rich embeds:
    // (Can be: debug, verbose, info, warn, error.)
    logLevel: 'info',
    // Log messages of this severity and above (but below 'logLevel') are logged as plain text:
    logLevelText: 'debug',
    // Log messages of this severity and above are additionally posted to the 'important' log channels:
    logLevelImportant: 'warn'
  },
  // Task settings.
  CALYPSO_TASK_SETTINGS: {
${configPadded}
  }
}`)

module.exports = {
  configTpl,
  configModel
}
