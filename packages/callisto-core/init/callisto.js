// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

const initCallisto$ = async () => {
  // Start message and request queues, which will send messages to Discord one by one.
  //startQueueLoop()
  //startRequestQueue()
  // Log the size of the log files, to remember not to let them get too big.
  //printLogSize(data.config.CALYPSO_BASE_DIR)
  // Listen for SIGINT and perform a graceful shutdown.
  process.on('SIGINT', shutdown)
}

module.exports = initCallisto$
