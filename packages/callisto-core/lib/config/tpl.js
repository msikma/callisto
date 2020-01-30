// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

const PropTypes = require('prop-types')

const configModel = {
  systemConfig: PropTypes.shape({
    botToken: PropTypes.string.isRequired,
    botClientID: PropTypes.string.isRequired,
    botName: PropTypes.string.isRequired,
    botAvatarURL: PropTypes.string.isRequired,
    logInfoChannels: PropTypes.arrayOf(PropTypes.array).isRequired,
    logErrorChannels: PropTypes.arrayOf(PropTypes.array).isRequired
  }),
  taskConfig: PropTypes.arrayOf(PropTypes.object).isRequired
}

// Default values: uses a picture of Callisto, Jupiter's second moon.
const botDefaults = {
  botName: 'Callisto',
  botColor: '#8d4e48',
  botAvatarURL: 'https://i.imgur.com/M8psEWT.png'
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
  systemConfig: {
    // App bot user token.
    botToken: '',
    // App bot user ID.
    botClientID: '',
    // The name the bot will listen to.
    botName: '${botDefaults.botName}',
    // The color used for system messages.
    botColor: '${botDefaults.botColor}',
    // An avatar used during bootup. This won't replace the bot's own user avatar.
    botAvatarURL: '${botDefaults.botAvatarURL}',
    // Send log messages to these channels:
    logInfoChannels: [[SERVER, CHANNEL]],
    // Log channels for important log messages:
    logErrorChannels: [[SERVER, CHANNEL]]
  },
  // Task settings.
  taskConfig: {
${configPadded}
  }
}`)

module.exports = {
  configTpl,
  configModel
}
