// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

const path = require('path')
const fs = require('fs')

const runtime = require('../../state')

/**
 * Initializes tasks (loads the code) and returns task data.
 * If a dev task is set, only that task will be loaded.
 */
const loadTasks = (tasksData, devTask = null) => {
  return tasksData
    .map(task => (devTask && task.name !== devTask) ? null : loadTask(task))
    .filter(task => task)
}

/**
 * Returns the data for a single task.
 */
const loadTask = (taskData) => {
  let mainData = null
  let isValidTask = false
  let error = null

  try {
    mainData = require(taskData.main)
    isValidTask = Boolean(mainData && mainData.taskInfo && mainData.taskActions)
  }
  catch (err) {
    error = err
  }

  return {
    success: isValidTask,
    error,
    taskMeta: taskData,
    taskMain: mainData
  }
}

/**
 * Generates a list of all available tasks so that they can be initialized.
 */
const getTasksData = (tasksDir = runtime.tasksDir) => {
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
  loadTasks,
  getTasksData
}
