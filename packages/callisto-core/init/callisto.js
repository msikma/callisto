// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

const chalk = require('chalk')
const { getFormattedTimestamp } = require('../util/time')
const { getCacheSize } = require('../lib/cache')
const { system } = require('../lib/discord')
const { execShutdown } = require('../lib/shutdown')
const { initQueueLoop } = require('../lib/discord')
const runtime = require('../state')

const printStartupIndicator = () => {
  system.logDebug(['Starting up Callisto', null, { time: new Date() }])
}

const printCacheSize = () => {
  const cacheSize = getCacheSize()
  system.logDebug('Current cache file size:', cacheSize)
}

const printRuntimeInfo = () => {
  system.logDebug('Using config file:', runtime.configPath)
  system.logDebug('Using cache db:', runtime.cachePath)
}

const initCallisto$ = async () => {
  // Print startup messages.
  printStartupIndicator()
  printRuntimeInfo()
  printCacheSize()
  // Start message and request queues, which will send messages to Discord one by one.
  initQueueLoop()
  // Listen for SIGINT and perform a graceful shutdown.
  process.on('SIGINT', execShutdown)
}

module.exports = initCallisto$
