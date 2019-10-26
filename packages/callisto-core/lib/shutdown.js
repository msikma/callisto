// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

const { logErrorFatal, logWarn, logError, die } = require('dada-cli-tools/log')
const runtime = require('../state')

/** Returns whether we are shutting down. */
const isShuttingDown = () => (
  runtime.state.willTerminate
)

/** Stores whether the bot is currently in state of shutting down. */
const setWillTerminate = (value) => (
  runtime.state.willTerminate = value
)

/**
 * Graceful shutdown function. This is called on SIGINT.
 * 
 * Tasks will be allowed to finish running their current job.
 * No new task jobs will be added to the queue.
 */
const shutdown = async () => {
  logWarn('\nSIGINT received. Shutting down the bot...')
  setWillTerminate(true)

  try {
    // Save the current time. Next time we start up we'll display how long the bot was offline.
    //await saveShutdownTime()
    // Log shutdown message.
    //await logCalypsoShutdown()

    // Wait until the queue is empty, then exit.
    while (true) {
      //await wait(queueEmptyWait)
      if (queueIsEmpty()) {
        //
      }
      process.exit(0)
    }
  }
  catch (err) {
    // Something went wrong while shutting down. Ensure the process exits.
    logErrorFatal('todo: something went wrong while shutting down')
    console.log(err)
    die()
  }
}

module.exports = {
  shutdown,
  isShuttingDown
}
