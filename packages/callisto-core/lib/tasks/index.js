// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

const path = require('path')
const fs = require('fs')
const PropTypes = require('prop-types')

const { wait } = require('../../util/promises')
const { isTempError } = require('../../util/errors')
const { createTaskLogger, createTaskMessageSenders } = require('../discord')
const { validatePropsModel, reportValidationErrors, getTaskConfig } = require('../config')
const { system } = require('../discord')
const runtime = require('../../state')
const systemFns = require('./system')

/**
 * Note: a task is an object containing both some meta information (from its package.json file)
 * as well as information exported from the main index file.
 * 
 * Each task conforms to the following structure:
 * 
 *   {
 *     package: {
 *       name: 'callisto-task-youtube',
 *       site: 'https://youtube.com/',
 *       siteShort: 'youtube.com',
 *       description: 'Posts new videos released by specified Youtube channels and reports on new videos for search queries',
 *       version: '1.2.10',
 *       main: '/path/to/index.js'
 *     },
 *     meta: {
 *       id: 'youtube',
 *       name: 'Youtube',
 *       color: 0xff0000,
 *       icon: 'https://i.imgur.com/rAFBjZ4.jpg'
 *     },
 *     actions: [
 *       { delay: 480000, description: 'find new videos from Youtube searches', fn: taskSearchVideos }
 *     ],
 *     config: { // note: not the user config; see below.
 *       template: () => {},
 *       validator: {}
 *     }
 *   }
 * 
 * When tasks are loaded and saved to the runtime variable, we also include a bit of metadata.
 * Each task object in state.tasks looks like this:
 * 
 *   {
 *     success: true,       // or false if it failed to load for some reason
 *     error: null,         // an Error object if one occurred while loading
 *     status: 'inactive',  // or 'active' if it has been activated and its actions queued
 *     data: {              // the above structure
 *       package,
 *       meta,
 *       actions,
 *       config
 *     },
 *     config: { ... }      // the user's configuration for this task
 *   }
 * 
 * A single system task with the same structure exists as well. See ./system.js.
 */

/**
 * Validator to check if a task has all requirements after parsing.
 */
const taskStructureValidator = {
  package: PropTypes.shape({
    name: PropTypes.string.isRequired,
    site: PropTypes.string,
    siteShort: PropTypes.string,
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

/**
 * Checks a task's structure after parsing and initializing.
 */
const validateTaskStructure = taskData => {
  return validatePropsModel(taskStructureValidator, taskData)
}

/**
 * Validator for the internal structure of a task.
 * 
 * This is what a task should export from its main entry point.
 * Included is the task's basic information (its name, icon, etc.)
 * and a template to generate config file, and a validator function to
 * validate the user's config settings.
 * 
 * If a task fails this validation, the code itself needs to be changed,
 * not the config.
 */
const taskExportValidator = {
  task: PropTypes.shape({
    info: PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      color: PropTypes.number.isRequired,
      icon: PropTypes.string.isRequired
    }).isRequired,
    actions: PropTypes.arrayOf(PropTypes.shape({
      delay: PropTypes.number.isRequired,
      description: PropTypes.string.isRequired,
      fn: PropTypes.func.isRequired
    })).isRequired
  }),
  config: PropTypes.shape({
    template: PropTypes.func.isRequired,
    validator: PropTypes.object.isRequired
  }).isRequired
}

/**
 * Checks whether an imported task contains a proper structure.
 * 
 * This checks the task's export from its main entry point (index.js).
 */
const validateTaskExport = taskData => {
  return validatePropsModel(taskExportValidator, taskData)
}

/**
 * Checks the user's configuration data against a task's validator function.
 */
const validateTaskConfig = (validator, configData) => {
  // If 'false', this task is deactivated.
  if (configData === false) {
    return { success: true }
  }
  return validatePropsModel(validator, configData)
}

/**
 * Starts all loaded tasks.
 * 
 * This runs through all parsed tasks and runs their actions.
 * 
 * Each action is an object containing a description, a waiting time,
 * and a function that returns a Promise. We wait for the indicated
 * number of ms, then run the action, and once it's done we queue
 * the next one.
 */
const activateTasks = async (tasksToRegister = runtime.tasks, singleTask = runtime.tasksMeta.singleTask) => {
  for (const [key, task] of Object.entries(tasksToRegister)) {
    // Skip all other tasks if we're using only a single task for testing.
    if (singleTask && singleTask.data.package.name !== key) {
      continue
    }

    // Attempt to start this task's action.
    try {
      activateTaskActions(task, runTasksImmediately = !!singleTask)
    }
    catch (err) {
      system.logErrorObj({ title: `Failed to initialize actions for task ${task.data.meta.name}`, error: err })
    }
  }
}

/**
 * Queues a task's actions.
 * 
 * When testing with a single task, the actions will all run immediately.
 */
const activateTaskActions = (task, runTasksImmediately = false) => {
  const taskConfig = task.config
  const taskLogger = createTaskLogger(task)
  const taskMessageSenders = createTaskMessageSenders(task)
  for (const action of task.data.actions) {
    loopTaskAction(action, taskConfig, { logger: taskLogger, ...taskMessageSenders }, runTasksImmediately)
  }
}

/**
 * Forever loops and calls a specific action from a task.
 * 
 * When testing with a single task, the first delay is skipped.
 */
const loopTaskAction = async (action, taskConfig, taskServices, runImmediately = false) => {
  // Log that we're starting this action using the task's own logger.
  taskServices.logger.logDebug(['Starting action', null, { [action.fn.name]: action.description, delay: action.delay }])
  
  if (!runImmediately) await wait(action.delay)
  while (true) {
    if (runtime.state.isShuttingDown) {
      system.logInfoLocal(['Skipped action', 'system is shutting down', { name: action.fn.name }])
    }
    else {
      try {
        await action.fn(taskConfig, { ...taskServices, taskConfig })
      }
      catch (err) {
        const isTemp = isTempError(err)
        const errorType = isTemp ? 'temporary error' : 'exception'
        const logFn = isTemp ? taskServices.logger.logNoticeObj : taskServices.logger.logErrorObj

        logFn({
          title: `Caught ${errorType} while running task`,
          desc: `An exception was thrown while running the action \`${action.fn.name}\`. The action will run again after its usual delay.`,
          details: { name: action.fn.name, description: action.description, delay: action.delay, ...(isTemp ? { isTempError: true } : {}) },
          error: err
        })
      }
    }
    await wait(action.delay)
  }
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
  let configData = null
  let exportTest = null
  let structureTest = null
  let configTest = null

  // The task structure test that's done here is a test to see if the task code
  // itself is well-formed. If it doesn't pass validation, the code needs to be
  // changed, not the config.
  try {
    useLogging && system.logDebug('Loading task:', `${taskPkg.name}@${taskPkg.version}`)
    mainData = require(taskPkg.main)
    exportTest = validateTaskExport(mainData)
    error = !exportTest.success ? new Error('Invalid task export') : null
  }
  catch (err) {
    error = err
    useLogging && system.logErrorObj({
      title: 'Failed to load task',
      desc: 'An error occurred while loading task main entry point',
      details: { taskPkg },
      error
    })
  }

  // Put together the final task object.
  // TODO: optional chaining
  const taskStructure = {
    package: taskPkg,
    meta: mainData && mainData.task && mainData.task.info,
    actions: mainData && mainData.task && mainData.task.actions,
    config: mainData && mainData.config
  }

  // Check the user's config for this task for structural errors.
  structureTest = validateTaskStructure(taskStructure)

  // Load the user's config and validates it against the task's expectations.
  configData = getTaskConfig(taskStructure.meta.id)
  configTest = validateTaskConfig(taskStructure.config.validator, configData)

  // Print any errors for either the task structure or the config that might've been detected.
  if (!structureTest.success) {
    useLogging && system.logWarn('Task structure errors were found for task', `${taskPkg.name}@${taskPkg.version}`)
    useLogging && reportValidationErrors(structureTest)
  }
  if (configData == null) {
    useLogging && system.logWarn('No user config was present for task', `${taskPkg.name}@${taskPkg.version}`)
    error = new Error('No user config')
  }
  if (!configTest.success) {
    useLogging && system.logWarn('Task config errors were found for task', `${taskPkg.name}@${taskPkg.version}`)
    useLogging && reportValidationErrors(configTest)
    error = new Error('Invalid task config')
  }
  if (!structureTest.success || !configTest.success || configData == null) {
    useLogging && system.logWarn('Task', `${taskPkg.name}@${taskPkg.version}`, 'will not run due to errors.')
  }

  if (error) {
    useLogging && system.logException('Failed to load or register task', taskStructure, error)
  }

  return {
    success: error == null,
    error,
    status: 'inactive',
    data: taskStructure,
    config: configData,
    isDeactivated: configData === false
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
  activateTasks,
  getTasksData,
  ...systemFns
}
