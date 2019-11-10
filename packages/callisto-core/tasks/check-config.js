// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

const { logDebug, logError, log } = require('dada-cli-tools/log')
const { validateConfigFile } = require('../lib/config')

/**
 * Checks whether a given config file has valid syntax.
 * 
 * First, a general check is issued on the base structure of the data.
 * After that, the syntax of each individual task's config will be checked.
 * 
 * Returns a value to be used as exit code.
 */
const checkConfig$ = ({ pathConfig }) => {
  logDebug(`Checking config file: ${pathConfig}`)

  const result = validateConfigFile(pathConfig)
  if (result.success) {
    log(`Config file syntax OK: ${pathConfig}`)
  }
  else {
    logError(`Config file syntax invalid: ${pathConfig}`)
  }

  return result.success === true ? 0 : 1
}

module.exports = checkConfig$
