// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

const { logFatal, logError, die } = require('dada-cli-tools/log')
const { progName, canAccess } = require('dada-cli-tools/util/fs')
const { readConfig } = require('../lib/config')
const runtime = require('../state')

/**
 * Reads and checks the config file.
 * 
 * If something is wrong, this exits the program. If all goes well, the runtime
 * state object will have 'config' set to the config file's data.
 */
const initConfig$ = async (pathConfig) => {
  if (!(await canAccess(pathConfig))) {
    return exitConfig('could not find the config file.', pathConfig)
  }

  try {
    // Retrieve config data and replace magic strings (like <%baseDir%>).
    runtime.config = readConfig(pathConfig)
  }
  catch (err) {
    return exitConfig('could not parse config file - run config check.', pathConfig)
  }
}

/** Exits the program if there's something wrong with the config file. */
const exitConfig = (error, path, valResults) => {
  const prog = progName()
  logFatal(`${prog}: error: ${error}`)
  if (valResults) {
    // Contains specific validation result errors.
    // valResults
  }
  logError('Ensure a valid config file is available at this location:', path)
  logError(`You can generate one: ${prog} --new-config`)
  die()
}

module.exports = initConfig$
