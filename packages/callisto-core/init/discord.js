// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

const Discord = require('discord.js')
const chalk = require('chalk')
const { logError, logDebug, die } = require('dada-cli-tools/log')

const { getConfigKey } = require('../lib/config')
const { catchAllExceptions, bindEmitHandlers } = require('../lib/logger')
const runtime = require('../state')

/**
 * Logs in to Discord.
 * If something goes wrong, an error is logged and the program exits.
 */
const discordLogin$ = async () => {
  const botToken = getConfigKey('botToken')
  const botClientID = getConfigKey('botClientID')
  
  // Attempt to log in to the server.
  try {
    const client = new Discord.Client()
    await client.login(botToken)
    const bot = await client.fetchUser(botClientID)
    return { bot, client }
  }
  catch (err) {
    if (err.message === Discord.Constants.Errors.INVALID_TOKEN) {
      logError(`Fatal: could not log in to Discord: ${err.message}`)
    }
    else {
      logError(`Fatal: an error occurred while logging in to Discord:\n${String(err.stack)}`)
    }
    die()
  }
}

/**
 * Logs in to Discord and saves the bot's user and client reference to the runtime.
 */
const initDiscord$ = async () => {
  const { bot, client } = await discordLogin$()
  logDebug('Logged in as', chalk.blue(`${bot.username}#${bot.discriminator}`))
  runtime.discord.bot = bot
  runtime.discord.client = client
  runtime.state.isLoggedIn = true

  catchAllExceptions()
  bindEmitHandlers(runtime.discord.client)
}

module.exports = initDiscord$
