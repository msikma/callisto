// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

const { logError, log } = require('dada-cli-tools/log')
const { validateConfigFile, reportValidationErrors } = require('../lib/config')

/**
 * Checks whether a given config file has valid syntax.
 * 
 * First, a general check is issued on the base structure of the data.
 * After that, the syntax of each individual task's config will be checked.
 * 
 * Returns a value to be used as exit code.
 */
const checkConfig$ = ({ pathConfig }) => {
  const result = validateConfigFile(pathConfig)
  if (result.success) {
    log('Config file syntax OK:', pathConfig)
  }
  else {
    reportValidationErrors(result, true)
    logError('Config file syntax invalid:', pathConfig)
  }

  return result.success === true ? 0 : 1
}

module.exports = checkConfig$
