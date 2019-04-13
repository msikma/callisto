/**
 * Calypso - calypso-core <https://github.com/msikma/calypso>
 * © MIT license
 */

import Discord, { Constants } from 'discord.js'

import { data } from 'calypso-misc/resources'
import logger from 'calypso-logging'

/** Attempts to log in to Discord. If something goes wrong, an error is logged and the program exits. */
export const discordInitOrExit = async () => {
  // Attempt to log in to the server.
  try {
    const client = new Discord.Client()
    await client.login(data.config.CALYPSO_BOT_TOKEN)
    const bot = await client.fetchUser(data.config.CALYPSO_BOT_CLIENT_ID)

    return { bot, client }
  }
  catch (err) {
    if (err.message === Constants.Errors.INVALID_TOKEN) {
      logger.error(`Fatal: could not log in to Discord: ${err.message}`)
    }
    else {
      logger.error(`Fatal: an error occurred while logging in to Discord:\n${String(err.stack)}`)
    }
    process.exit(1)
  }
}
