// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

const path = require('path')
const fs = require('fs')

const runtime = require('../state')

/**
 * Initializes tasks (loads the code) and returns task data.
 */
const loadTasks = async (tasksData, devTask = null) => {
  return []
}

/**
 * Generates a list of all available tasks so that they can be initialized.
 */
const getTasksData = async (tasksDir = runtime.tasksDir) => {
  const installedTasks = _listTaskDirs(tasksDir).map(taskName => {
    const taskDir = `${tasksDir}/${taskName}`
    const packageData = require(`${taskDir}/package.json`)
    return {
      name: taskName,
      site: packageData._site,
      siteShort: packageData._siteShort,
      description: packageData.description,
      version: packageData.version,
      main: path.resolve(`${taskDir}/${packageData.main}`)
    }
  })
  return {
    installedTasks
  }
}

/**
 * Reads a list of directories inside of a given directory and returns
 * the ones that contain tasks.
 * 
 * A valid task is a directory that contains a 'package.json' file.
 */
const _listTaskDirs = (baseDir) => (
  fs.readdirSync(baseDir)
    .filter(i =>
      fs.statSync(path.join(baseDir, i)).isDirectory() &&
      fs.statSync(path.join(baseDir, i, 'package.json')).isFile()
    )
)

module.exports = {
  getTasksData
}
