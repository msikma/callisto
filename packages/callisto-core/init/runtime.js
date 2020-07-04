// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

const { dirname } = require('path')
const { cacheDbFilePath } = require('../lib/cache')
const runtime = require('../state')

// Note: polyfill for Object.fromEntries().
// <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/fromEntries>
require('polyfill-object.fromentries')

/**
 * Prepares the program state object.
 * 
 * This just does some basic housekeeping: storing the invocation arguments
 * and package data for later use.
 */
const initRuntime$ = async (cliArgs, runtimeData) => {
  // The package data must be retrieved beforehand (normally the CLI interface does this).
  runtime.pkgData = runtimeData.pkgData
  runtime.baseDir = runtimeData.baseDir
  runtime.tasksDir = `${runtimeData.baseDir}/tasks`
  runtime.cacheDir = cliArgs.pathCache
  runtime.cachePath = cacheDbFilePath(cliArgs.pathCache)
  runtime.configDir = dirname(cliArgs.pathConfig)
  runtime.configPath = cliArgs.pathConfig
  runtime.cliArgs = cliArgs
  runtime.dev.noPost = cliArgs.devNoop
  runtime.state.startTime = Number(new Date())
}

module.exports = initRuntime$
