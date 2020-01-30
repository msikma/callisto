// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

const { logFatal, logWarn, logError, die } = require('dada-cli-tools/log')
const { wait } = require('dada-cli-tools/util/misc')
const { progName } = require('dada-cli-tools/util/fs')
const runtime = require('../state')

// Amount of time to wait when checking if we can shut down.
const queueEmptyWait = 1000

/** Returns whether we are shutting down. */
const isShuttingDown = () => (
  runtime.state.isShuttingDown
)

/** Stores whether the bot is currently in state of shutting down. */
const setShuttingDown = (value) => (
  runtime.state.isShuttingDown = value
)

/**
 * Graceful shutdown function. This is called on SIGINT.
 * 
 * Tasks will be allowed to finish running their current job.
 * No new task jobs will be added to the queue.
 */
const execShutdown = async () => {
  logWarn('\nSIGINT received. Shutting down the bot...')
  setShuttingDown(true)

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
    logFatal(`${progName()}: an error occurred while shutting down:\n`)
    if (err.stack) logFatal(err.stack)
    else logFatal(String(err))
    logFatal('\nExiting program.')
    die()
  }
}

module.exports = {
  execShutdown,
  isShuttingDown
}
