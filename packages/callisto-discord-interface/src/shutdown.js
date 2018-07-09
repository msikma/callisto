/**
 * Callisto - callisto-discord-interface <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import logger from 'callisto-util-logging'
import { saveShutdownTime } from 'callisto-util-cache/system'
import { logCallistoShutdown } from './logging'

/**
 * Graceful shutdown function. This is called on SIGINT.
 */
export const shutdown = async () => {
  logger.error('\nSIGINT received. Shutting down the bot...', false)
  try {
    // Save the current time. Next time we start up we'll display how long the bot was offline.
    await saveShutdownTime()
    // Log shutdown message.
    await logCallistoShutdown()
    process.exit(0)
  }
  catch (err) {
    // Something went wrong while shutting down. Ensure the process exits.
    process.exit(0)
  }
}
