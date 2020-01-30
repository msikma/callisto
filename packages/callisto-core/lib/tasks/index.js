// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

const path = require('path')
const fs = require('fs')
const PropTypes = require('prop-types')

const { system } = require('../logger')
const runtime = require('../../state')
const systemFns = require('./system')

/**
 * Note: a task is an object containing both some meta information (from its package.json file)
 * as well as information exported from the main index file.
 * 
 * Each task conforms to the following structure:
 * 
 * {
 *   package: {
 *     name: 'callisto-task-youtube',
 *     site: 'https://youtube.com/',
 *     siteShort: 'youtube.com',
 *     description: 'Posts new videos released by specified Youtube channels and reports on new videos for search queries',
 *     version: '1.2.10',
 *     main: '/path/to/index.js'
 *   },
 *   meta: {
 *     id: 'youtube',
 *     name: 'Youtube',
 *     color: 0xff0000,
 *     icon: 'https://i.imgur.com/rAFBjZ4.jpg'
 *   },
 *   actions: [
 *     { delay: 480000, description: 'find new videos from Youtube searches', fn: taskSearchVideos }
 *   ],
 *   config: {
 *     template: () => {},
 *     validator: {}
 *   }
 * }
 * 
 */

/**
 * Validator to check if a task has all requirements.
 */
const taskValidator = {
  package: PropTypes.shape({
    name: PropTypes.string.isRequired,
    site: PropTypes.string.isRequired,
    siteShort: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    version: PropTypes.string.isRequired,
    main: PropTypes.string.isRequired
  }).isRequired,
  meta: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    color: PropTypes.number.isRequired,
    icon: PropTypes.string.isRequired
  }).isRequired,
  actions: PropTypes.arrayOf(PropTypes.shape({
    delay: PropTypes.number.isRequired,
    description: PropTypes.string.isRequired,
    fn: PropTypes.func.isRequired
  })).isRequired,
  config: PropTypes.shape({
    template: PropTypes.func.isRequired,
    validator: PropTypes.object.isRequired
  })
}

const isValidTask = taskData => {
  // TODO: validate task
  return true
}

/**
 * Initializes tasks (loads the code) and returns task data.
 * If a dev task is set, only that task will be loaded.
 */
const loadTasks = (tasksData, devTask = null, useLogging = false) => {
  return tasksData
    .map(task => (devTask && task.name !== devTask) ? null : loadTask(task, useLogging))
    .filter(task => task)
}

/**
 * Returns the data for a single task.
 */
const loadTask = (taskPkg, useLogging = false) => {
  let mainData = null
  let error = null

  try {
    useLogging && system.logDebug('Registering task:', `${taskPkg.name}@${taskPkg.version}`)
    mainData = require(taskPkg.main)
    error = !_isValidTaskMain(mainData) ? new Error('Invalid task main data') : null
  }
  catch (err) {
    error = err
    useLogging && system.logException('Failed to load register task main entry point', taskPkg, error)
  }

  // Put together the final task object.
  const taskData = {
    package: taskPkg,
    meta: mainData.task.info,
    actions: mainData.task.actions,
    config: mainData.config
  }

  // TODO: validate.
  if (!isValidTask(taskData)) {
    error = new Error('Invalid task')
  }

  if (error) {
    useLogging && system.logException('Failed to load register task', taskData, error)
  }

  return {
    success: error == null,
    error,
    task: taskData
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
      i === 'youtube' &&
      fs.statSync(path.join(baseDir, i, 'package.json')).isFile()
    )
)

/**
 * Checks whether a task contains all the required fields.
 */
const _isValidTaskMain = taskData => {
  if (taskData
    && taskData.task
    && taskData.task.info
    && taskData.task.actions
    && taskData.config
    && taskData.config.template
    && taskData.config.validator
  ) {
    return true
  }
  return false
}

module.exports = {
  loadTasks,
  getTasksData,
  ...systemFns
}
