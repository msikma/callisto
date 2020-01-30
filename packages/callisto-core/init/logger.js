// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

const { makeSystemTask } = require('../lib/tasks')
const { initSystemLogger } = require('../lib/logger')
const runtime = require('../state')

/**
 * Initializes the logger.
 */
const initLogger$ = () => {
  runtime.systemTask = makeSystemTask()
  initSystemLogger()
}

module.exports = initLogger$
