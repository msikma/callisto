// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

const chalk = require('chalk')
const { system, getCacheSize } = require('../lib/logger')
const { execShutdown } = require('../lib/shutdown')
const { initQueueLoop } = require('../lib/queue')
const runtime = require('../state')

const printCacheSize = () => {
  const cacheSize = getCacheSize()
  system.logDebug('Current cache file size:', chalk.green(cacheSize))
}

const printRuntimeInfo = () => {
  system.logDebug('Using config file:', runtime.configPath)
  system.logDebug('Using cache db:', runtime.cachePath)
}

const initCallisto$ = async () => {
  // Log config and cache locations, and the size of the cache files.
  printRuntimeInfo()
  printCacheSize()
  // Start message and request queues, which will send messages to Discord one by one.
  initQueueLoop()
  // Listen for SIGINT and perform a graceful shutdown.
  process.on('SIGINT', execShutdown)
}

module.exports = initCallisto$
