/**
 * Calypso - calypso-core <https://github.com/msikma/calypso>
 * © MIT license
 */

/**
 * Generates a new config file based on all available tasks' config templates.
 */
export const newConfig = (configTemplates) => {
  const padding = '    '
  const config = configTemplates.map(tpl => tpl.configTemplate).join(',\n')
  const configPadded = `${padding}${config.replace(/\n/g, `\n${padding}`)}`
  const mainTpl = `
// Calypso bot config file

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
    respond: [[/* server, channel */]],
    // Calypso can log errors to Discord (aside from the standard log file).
    // Send log messages to these channels:
    logChannels: [[/* server, channel */]],
    // Log channels for important log messages:
    logChannelsImportant: [[/* server, channel */]],
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
}
`
  return `${mainTpl.trim()}\n`
}
