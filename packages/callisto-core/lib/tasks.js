// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

import { baseDir } from '../state'

/**
 * Generates a list of all available tasks so that they can be initialized.
 */
const scanTasks = () => {
  const tasksDir = `${baseDir}/tasks`
  return {
    success: true
  }
}

module.exports = {
  checkConfigProps
}
