// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

const requestTools = require('dada-cli-tools/request')
const system = require('../discord')

const LOG_REQUESTS = true

/**
 * Requests a remote call. Logs to Discord.
 */
const request = async (url, opts, customOpts = {}) => {
  return requestTools.request(url, { ...opts, logFn: LOG_REQUESTS ? system.logDebug : null }, customOpts)
}

module.exports = {
  request
}
