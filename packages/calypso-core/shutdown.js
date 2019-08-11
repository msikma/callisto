/**
 * Calypso - calypso-core <https://github.com/msikma/calypso>
 * © MIT license
 */

import logger, { configureConsoleLogLevel } from 'calypso-logging'
import { saveShutdownTime } from 'calypso-cache/system'
import { wait } from 'calypso-misc'

import { queueIsEmpty } from './queue'
import { logCalypsoShutdown } from './logging'

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
 * After shutdown is initiated, the log level gets set to 'silly'.
 * This allows us to see exactly how many calls are made until exit.
 */
export const shutdown = async () => {
  logger.error('\nSIGINT received. Shutting down the bot...', false)
  logger.warning('Logging all events until shutdown.', false)
  configureConsoleLogLevel('silly')
  waitingShutdown = true
  try {
    // Save the current time. Next time we start up we'll display how long the bot was offline.
    await saveShutdownTime()
    // Log shutdown message.
    await logCalypsoShutdown()

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
