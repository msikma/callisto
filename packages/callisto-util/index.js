// Callisto - callisto-util <https://github.com/msikma/callisto>
// © MIT license

const { promiseSerial } = require('./promises')
const { extractScriptResult } = require('./vm')

// TODO: these should be moved to an external library ultimately.

module.exports = {
  promiseSerial,
  extractScriptResult
}
