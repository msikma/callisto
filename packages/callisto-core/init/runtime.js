// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

const runtime = require('../state')

/**
 * Stores invocation and package data for later use.
 */
const initRuntime$ = async (cliArgs, runtimeData) => {
  // The package data must be retrieved beforehand (normally the CLI interface does this).
  runtime.pkgData = runtimeData.pkgData
  runtime.baseDir = runtimeData.baseDir
  runtime.cliArgs = cliArgs
}

module.exports = {
  initRuntime$
}
