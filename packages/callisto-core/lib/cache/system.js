// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

const { get } = require('lodash')
const { saveSettings, loadSettings } = require('./sqlite')

/**
 * Stores the current time so we know when the system was last shut down.
 */
const saveShutdownTime = async () => {
  const systemSettings = await loadSettings('_callisto', 'system')
  await saveSettings('_callisto', 'system', { ...systemSettings, lastShutdown: (+new Date()) })
}

/**
 * Returns the time we last shut down the bot as integer.
 */
const loadShutdownTime = async () => {
  const systemSettings = await loadSettings('_callisto', 'system')
  return get(systemSettings, 'lastShutdown', 0)
}

module.exports = {
  saveShutdownTime,
  loadShutdownTime
}
