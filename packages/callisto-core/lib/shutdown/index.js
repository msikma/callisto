// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

const { logFatal, die } = require('dada-cli-tools/log')
const { wait } = require('dada-cli-tools/util/misc')
const { progName } = require('dada-cli-tools/util/fs')
const { system, printShutdownMessage } = require('../discord')
const { saveShutdownTime } = require('../cache/system')
const { queueIsEmpty } = require('../discord')
const runtime = require('../../state')

// Amount of time to wait when checking if we can shut down.
const queueEmptyWait = 1000

// When the user runs CTRL+C to shutdown, initially we run execShutdown().
// If the user presses CTRL+C again, execQuickShutdown() runs instead.
let hasRequestedShutdown = false

/** Returns whether we are shutting down. */
const isShuttingDown = () => (
  runtime.state.isShuttingDown
)

/** Stores whether the bot is currently in state of shutting down. */
const setShuttingDown = (value) => (
  runtime.state.isShuttingDown = value
)

/**
 * Quick shutdown function. Called if the user sends a second SIGINT.
 */
const execQuickShutdown = async () => {
  console.log('')
  system.logWarnLocal('SIGINT received. Skipping graceful exit.')
  process.exit(0)
}

/**
 * Graceful shutdown function. This is called on SIGINT.
 * 
 * Tasks will be allowed to finish running their current job.
 * No new task jobs will be added to the queue.
 */
const execShutdown = async () => {
  // Run immediate shutdown if this is the second SIGINT the user sent.
  if (hasRequestedShutdown) {
    return execQuickShutdown()
  }

  console.log('')
  system.logWarnLocal('SIGINT received. Shutting down the bot...')

  // Ensure we run execQuickShutdown() if the user sends another SIGINT.
  hasRequestedShutdown = true

  try {
    // Save the current time. Next time we start up we'll display how long the bot was offline.
    await saveShutdownTime()
    // Log shutdown message.
    await printShutdownMessage()

    // Set the bot to 'shutting down' state, which prevents new items from being queued.
    setShuttingDown(true)

    // Wait until the queue is empty, then exit.
    while (true) {
      if (queueIsEmpty()) {
        system.logDebugLocal('Queue is empty. Exiting.')
        process.exit(0)
      }
      await wait(queueEmptyWait)
    }
  }
  catch (err) {
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
