// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

const { logDebug, logWarn, log } = require('dada-cli-tools/log')
const { checkCacheDb } = require('../lib/cache')

/**
 * Checks whether a given cache file is in proper order.
 * 
 * Returns a value to be used as exit code.
 */
const checkCache = ({ pathConfig }) => {
  logDebug(`Checking cache file: ${pathConfig}`)

  logWarn('Not implemented yet: checkCacheDb()')
  const result = checkCacheDb(pathConfig)
  if (result.success) {
    log(`Config file syntax OK: ${pathConfig}`)
  }
  else {
    log(`Config file syntax not OK: ${pathConfig}`)
  }

  return result.success === true ? 0 : 1
}

module.exports = checkCache
