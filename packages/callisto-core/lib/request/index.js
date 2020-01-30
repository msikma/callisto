// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

const requestTools = require('dada-cli-tools/request')

/**
 * Requests a remote call. Logs to Discord.
 */
const request = async (url, opts = {}) => {
  // TODO: logging
  return requestTools.request(url, opts)
}

module.exports = {
  request
}
