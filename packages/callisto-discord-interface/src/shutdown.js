/**
 * Callisto - callisto-discord-interface <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import logger from 'callisto-util-logging'
import { logCallistoShutdown } from './logging'

/**
 * Graceful shutdown function. This is called on SIGINT.
 */
export const shutdown = async () => {
  logger.error('SIGINT received. Shutting down the bot...', false)
  await logCallistoShutdown()
  process.exit(0)
}
