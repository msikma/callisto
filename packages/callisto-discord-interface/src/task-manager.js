/**
 * Callisto - callisto-discord-interface <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import fs from 'fs'
import path from 'path'
import logger from 'callisto-util-logging'
import { getSimpleDuration, wait } from 'callisto-util-misc'
import { config } from 'callisto-util-misc/resources'

import { logCallistoBootup } from './logging'

const tasks = {}

/**
 * Iterates through our installed tasks and registers them so they can be used.
 * If 'singleTaskData' is set, we will ignore every task except that one.
 */
export const findAndRegisterTasks = (discordClient, user, taskConfig, singleTaskData) => {
  const tasks = findTasks()
  logCallistoBootup(tasks, singleTaskData)
  tasks.forEach(({ name, file, slug, version }) => {
    if (singleTaskData && slug !== singleTaskData.slug) {
      return
    }
    try {
      const taskInfo = require(file).getTaskInfo()
      registerTask(discordClient, user, taskInfo, slug, version)
    }
    catch (err) {
      logger.error(`Task ${name} could not be imported:\n${err.stack}`)
    }
  })
  startTimedTasks(discordClient, user, taskConfig)
}

/**
 * Calls a task, logging an error if something goes wrong.
 */
const safeCall = (fn) => (discordClient, user, taskConfig, taskID) => {
  try {
    logger.debug(`Running task ${taskID}`)
    return fn.call(this, discordClient, user, taskConfig)
  }
  catch (err) {
    logger.error(`Task ${taskID} has thrown an exception:\n\n${err.stack}`)
  }
}

/**
 * Awaits a promise's resolution and then schedules another one per the given delay.
 */
const loopPromise = async (fn, delay, args) => {
  await wait(delay)
  await fn(...args)
  loopPromise(fn, delay, args)
}

/**
 * Calls the argument if it is a function, or waits for it to complete if it's a promise.
 * This allows us to return plain functions from tasks and run them normally,
 * or return promises from tasks which run once and only get queued for re-running
 * after they have completely finished.
 *
 * New tasks should always be functions that return promises that resolve when all the work is finished.
 */
const scheduleTaskLoop = async (fn, type, delay, discordClient, args) => {
  if (['Promise', 'Function'].indexOf(type) === -1) {
    throw new TypeError(`Invalid task type: must be one of {Promise, Function} (received: ${type})`)
  }

  if (type === 'Promise') {
    // Set up a loop that awaits the Promise's resolution, then queues another one.
    loopPromise(safeCall(fn), delay, args)
  }
  if (type === 'Function') {
    // Call the function normally in a setInterval().
    // The interval should be long enough to cover the function's execution time and a fair delay.
    discordClient.setInterval(safeCall(fn), delay, ...args)
  }
}

/**
 * Starts all timed tasks.
 */
const startTimedTasks = (discordClient, user, taskConfig) => {
  logger.info('Starting timed actions.')
  Object.values(tasks).forEach(t => {
    if (!t.scheduledActions.length) return
    t.scheduledActions.forEach(a => {
      logger.verbose(`Task: ${t.id}: ${a.desc} (delay: ${getSimpleDuration(a.delay)}, type: ${a.type}${a.runOnBoot ? ', runs on boot' : ''})`)

      try {
        // Tasks can return either a function, or a promise. If it's a function,
        // we will queue it with a simple setInterval(). If it's a promise,
        // we'll run it, wait for it to finish, and then queue the next one.
        scheduleTaskLoop(a.fn, a.type, a.delay, discordClient, [discordClient, user, taskConfig[t.id], t.id])

        // If the fourth item is set to true, we'll run the code right away instead of waiting.
        // Useful for making sure tasks with long delays at least run once on bot bootup.
        if (a.runOnBoot) {
          logger.debug(`Calling task at startup: ${t.id}`)
          safeCall(a.fn).call(null, discordClient, user, taskConfig[t.id], t.id)
        }
      }
      catch (err) {
        logger.error(`Could not run ${t.name} task ("${a.desc}"):\n\n${err.stack}`)
      }
    })
  })
}

/**
 * Registers a task, making it possible to access its functionality.
 */
const registerTask = (discordClient, user, { id, formats, triggerActions, scheduledActions }, slug, version) => {
  tasks[id] = { id, formats, triggerActions, scheduledActions }
  logger.verbose(`Registered task: ${slug} (${version})`)
  triggerActions.forEach(a => discordClient.on(a[0], a[1]))
}

/**
 * Returns the slug of a task name, e.g. for 'callisto-task-asdf' this is 'asdf'.
 */
const taskSlug = (taskName) => (
  taskName.trim().substr('callisto-task-'.length)
)

/**
 * Finds all usable tasks.
 */
export const findTasks = () => {
  const base = `${config.CALLISTO_BASE_DIR}/packages/`
  return listTaskDirs(base).map(i => {
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
}

/**
 * Reads a list of directories inside of a given directory and returns the ones that contain tasks.
 * Basically, returns all directories that start with 'callisto-task'.
 */
const listTaskDirs = (base) => (
  fs.readdirSync(base).filter(i => fs.statSync(path.join(base, i)).isDirectory() && i.startsWith('callisto-task'))
)
