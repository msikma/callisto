// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

const Converter = require('hex2dec')
const runtime = require('../state')

/**
 * Creates a task to be used by the system, mostly for logging.
 */
const makeSystemTask = () => {
  const package = runtime.pkgData
  const meta = {
    id: 'callisto',
    name: runtime.config.systemConfig.botName,
    color: Converter.hexToDec(runtime.config.systemConfig.botColor),
    icon: runtime.config.systemConfig.botAvatarURL
  }
  // Dummy values. The system task never uses this functionality.
  const actions = []
  const config = {}

  return {
    package,
    meta,
    actions,
    config
  }
}

module.exports = {
  makeSystemTask
}
