// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

const { access } = require('fs').promises
const { logErrorFatal, logWarn, logError, die } = require('dada-cli-tools/log')
const { progName } = require('dada-cli-tools/util/fs')
const { readJSON } = require('dada-cli-tools/util/read')

const { checkConfigProps } = require('../lib/config')
const runtime = require('../state')

/** Exits the program if there's something wrong with the config file. */
const exitConfig = (prog, error, path, valResults) => {
  logErrorFatal(`${prog}: error: ${error}`)
  if (valResults) {
    // Contains specific validation result errors.
    // valResults
  }
  logError(`Ensure a valid config file is available at this location: ${path}`)
  logError(`You can generate one: ${prog} --new-config`)
  die()
}

/**
 * Reads and checks the config file.
 * 
 * If something is wrong, this exits the program. If all goes well, the runtime
 * state object will have 'config' set to the config file's data.
 */
const initConfig$ = async (pathConfig) => {
  const prog = progName()
  if (!(await access(pathConfig))) {
    return exitConfig(prog, 'could not find the config file.', pathConfig)
  }

  try {
    // Retrieve config data and replace magic strings (like <%baseDir%>).
    const data = await readJSON(pathConfig)
    runtime.config = replaceMagic(data, baseDir, configDir)
  }
  catch (err) {
    return exitConfig(prog, 'could not parse config file - run config check.', pathConfig)
  }
}

module.exports = initConfig$
