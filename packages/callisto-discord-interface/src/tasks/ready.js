/**
 * Callisto - callisto-discord-interface <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import logger from 'callisto-util-logging'

// This task runs once when the bot is connected and initialized.
export default function () {
  logger.info(`Callisto bot connected.`)
}
