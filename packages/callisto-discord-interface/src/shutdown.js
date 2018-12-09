/**
 * Callisto - callisto-discord-interface <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import logger from 'callisto-util-logging'
import { saveShutdownTime } from 'callisto-util-cache/system'
import { wait } from 'callisto-util-misc'

import { queueIsEmpty } from './queue'
import { logCallistoShutdown } from './logging'

// How long to wait for each check if the queue is empty.
const queueEmptyWait = 1000

// Whether we are shutting down.
let waitingShutdown = false

/** Returns whether we are shutting down. */
export const isShuttingDown = () => (
  waitingShutdown
)

/**
 * Graceful shutdown function. This is called on SIGINT.
 */
export const shutdown = async () => {
  logger.error('\nSIGINT received. Shutting down the bot...', false)
  waitingShutdown = true
  try {
    // Save the current time. Next time we start up we'll display how long the bot was offline.
    await saveShutdownTime()
    // Log shutdown message.
    await logCallistoShutdown()

    // Wait until the queue is empty, then exit.
    while (true) {
      await wait(queueEmptyWait)
      if (queueIsEmpty()) {
        process.exit(0)
      }
    }
  }
  catch (err) {
    // Something went wrong while shutting down. Ensure the process exits.
    process.exit(0)
  }
}
