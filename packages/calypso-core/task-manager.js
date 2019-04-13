/**
 * Calypso - calypso-core <https://github.com/msikma/calypso>
 * © MIT license
 */

import fs from 'fs'
import path from 'path'
import logger from 'calypso-logging'
import { getSimpleDuration, wait, capitalizeFirst } from 'calypso-misc'
import { data } from 'calypso-misc/resources'

import { getSystemLogger, logCalypsoBootup } from './logging'

const taskDatabase = {}

/** Prepares the bot to run a single task for testing, if specified on the command line. */
export const loadSingleTask = (task) => {
  if (!task) {
    return
  }
  const allTasks = findTasks(data.config.CALYPSO_TASK_SETTINGS)
  let taskData = allTasks.tasksWithConfig.filter(taskData => taskData.slug === task)[0]
  if (!taskData) {
    // Check whether the task exists, but simply doesn't have configuration yet.
    taskData = allTasks.tasksWithoutConfig.filter(taskData => taskData.slug === task)[0]
    logger.error(taskData ? `Task is not configured: ${task}` : `Could not find task: ${task}`)
    process.exit(1)
  }
  logger.warn(`Testing with only this task: ${taskData.slug}`, false)
  return taskData
}

/**
 * Iterates through our installed tasks and registers them so they can be used.
 * If 'singleTaskData' is set, we will ignore every task except that one.
 */
export const findAndRegisterTasks = async (discordClient, user, taskConfig, singleTaskData) => {
  const { tasksWithConfig, tasksWithoutConfig } = findTasks(taskConfig)
  await logCalypsoBootup(tasksWithConfig, tasksWithoutConfig, singleTaskData)
  tasksWithConfig.forEach(({ name, file, slug, version }) => {
    if (singleTaskData && slug !== singleTaskData.slug) {
      return
    }
    try {
      const taskInfo = require(file).getTaskInfo()
      registerTask(discordClient, user, taskInfo, slug, version)
    }
    catch (err) {
      getSystemLogger().error(`Error importing task ${name}`, `${err.stack}`)
    }
  })
  startTimedTasks(discordClient, user, taskConfig, singleTaskData)
}

/**
 * Runs a function and then optionally schedules the next one.
 * If a task returns a Promise, we will wait for its completion before scheduling
 * the next iteration. If it's a normal function, the delay must be long enough to
 * safely cover its full execution.
 */
const runTask = async (fn, delay, args, task, action, loop = false) => {
  await wait(delay)
  try {
    await fn(...args)
  }
  catch (err) {
    getSystemLogger().error(
      `Error executing timed task`,
      `${err.code ? `Code: \`${err.code}\`\n\n` : ''}\`\`\`${err.stack}\`\`\``,
      [
        ['Task', `${task.name} (${task.id})`, false],
        ['Function', `\`${action.fn.name}()\``, true],
        ['Delay', `${getSimpleDuration(action.delay)} (${action.delay} ms)`, true],
        ['Description', `${capitalizeFirst(action.desc)}`, false]
      ]
    )
  }
  if (loop) {
    runTask(fn, delay, args, task, action, loop)
  }
}

/**
 * Starts all timed tasks.
 */
const startTimedTasks = (discordClient, user, taskConfig, singleTaskData) => {
  const systemLogger = getSystemLogger()
  const tasksAmount = Object.keys(taskDatabase).length
  systemLogger.verbose('Starting timed actions', `Queueing ${tasksAmount} task${tasksAmount !== 1 ? 's' : ''}`)

  Object.values(taskDatabase).forEach(task => {
    if (!task.scheduledActions.length) return
    task.scheduledActions.forEach(action => {
      // These arguments will be passed to the function.
      const args = [discordClient, user, taskConfig[task.id], task.id]

      systemLogger.verbose(`Task: ${task.id}: ${action.desc}`, `Delay: ${getSimpleDuration(action.delay)} (${action.delay} ms)`)

      // Start the task loop that continuously calls the task.
      runTask(action.fn, action.delay, args, task, action, true)

      // If we're testing with a single task, we'll run the code right away instead of waiting.
      if (singleTaskData && taskSlug(singleTaskData.name) === task.id) {
        systemLogger.debug(`Calling task at startup: ${task.id}`)
        runTask(action.fn, 0, args, task, action, false)
      }
    })
  })
}

/**
 * Registers a task, making it possible to access its functionality.
 * 
 * Note: 'triggerActions' and 'formats' respond to actions, such as 'message'
 * to respond to user input. Currently they're not used.
 */
const registerTask = (discordClient, user, { id, name, icon, color, formats = [], triggerActions = [], scheduledActions = [] }, slug, version) => {
  taskDatabase[id] = { id, name, icon, color, formats, version, triggerActions, scheduledActions }
  logger.verbose(`Registered task: ${slug} (${version})`)
  //triggerActions.forEach(action => discordClient.on(action[0], action[1]))
}

/**
 * Returns a registered task's information.
 */
export const getTaskInfo = id => (
  taskDatabase[id]
)

/**
 * Returns the slug of a task name. (In the past this used to contain a prefix; not anymore.)
 */
const taskSlug = (taskName) => (
  taskName.trim()
)

/**
 * Finds all usable tasks.
 */
export const findTasks = taskConfig => {
  // Fetch tasks currently present in the /tasks/ directory.
  const base = `${data.config.CALYPSO_BASE_DIR}/tasks/`
  const existingTasks = listTaskDirs(base).map(i => {
    const packageData = require(`${base}${i}/package.json`)
    return {
      name: i,
      site: packageData._site,
      siteShort: packageData._siteShort,
      description: packageData.description,
      version: packageData.version,
      file: `${base}${i}/index.js`,
      slug: taskSlug(i)
    }
  })
  // Make a list of the tasks we have configuration for.
  const taskList = Object.keys(taskConfig)
  // Separate our tasks into two lists based on whether a task has configuration.
  const tasksWithConfig = existingTasks.filter(t => taskList.indexOf(t.slug) > -1)
  const tasksWithoutConfig = existingTasks.filter(t => taskList.indexOf(t.slug) === -1)

  return { tasksWithConfig, tasksWithoutConfig }
}

/**
 * Reads a list of directories inside of a given directory and returns the ones that contain tasks.
 */
const listTaskDirs = (base) => (
  fs.readdirSync(base).filter(i => fs.statSync(path.join(base, i)).isDirectory() && fs.statSync(path.join(base, i, 'package.json')).isFile())
)
