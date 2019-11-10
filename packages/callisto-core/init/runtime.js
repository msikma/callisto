// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

const { dirname } = require('path')
const runtime = require('../state')

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
  runtime.configDir = dirname(cliArgs.pathConfig)
  runtime.cliArgs = cliArgs
  runtime.dev.noPost = cliArgs.devNoop
}

module.exports = initRuntime$
