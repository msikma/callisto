// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

const { dirname } = require('path')
const { logFatal, logDebug, logError } = require('dada-cli-tools/log')
const { progName, ensureDirBool } = require('dada-cli-tools/util/fs')

const { getTasksData, loadTasks } = require('../lib/tasks')
const { writeNewConfig } = require('../lib/config')

/**
 * Creates a new cache database.
 * 
 * Returns a number to be used as exit code.
 */
const newConfig$ = async ({ pathConfig }, { baseDir }) => {
  const tasksDir = `${baseDir}/tasks`
  const pathConfigDir = dirname(pathConfig)
  
  logDebug(`Creating new config file: ${pathConfig}`)

  const pathExists = await ensureDirBool(pathConfigDir)
  if (!pathExists) {
    return exitError('could not find config base directory, and failed to create it.', null, null, pathConfigDir)
  }

  const tasksData = getTasksData(tasksDir)
  const tasks = loadTasks(tasksData.installedTasks)
  const result = await writeNewConfig(pathConfig, tasks)
  if (result.exists) {
    return exitError('could not create new config file - one already exists at the given path.', pathConfig)
  }
  if (result.success) {
    return 0
  }

  return exitError('an unknown error occurred while attempting to create a new config file.', pathConfig, result.error)
}

/** Exits the program if something went wrong. */
const exitError = (error, file, err, baseDir) => {
  const prog = progName()
  logFatal(`${prog}: error: ${error}`)
  if (err) logError(err)
  if (file) logError(`Used the following path:`, file)
  if (baseDir) logError(`Used the following base directory:`, baseDir)
  return 1
}

module.exports = newConfig$
