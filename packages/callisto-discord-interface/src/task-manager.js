/**
 * Callisto - callisto-discord-interface <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import moment from 'moment'
import fs from 'fs'
import path from 'path'
import logger from 'callisto-util-logging'

import { config } from './resources'

const tasks = {}

/**
 * Iterates through our installed tasks and registers them so they can be used.
 */
export const findAndRegisterTasks = (discordClient, user, taskConfig) => {
  findTasks().forEach(({ name, file }) => {
    try {
      const taskInfo = require(file).getTaskInfo()
      registerTask(discordClient, user, taskInfo)
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
    fn.call(this, discordClient, user, taskConfig)
  }
  catch (err) {
    logger.error(`Task ${taskID} has thrown an exception:\n${err.stack}`)
  }
}

/**
 * Starts all timed tasks.
 */
const startTimedTasks = (discordClient, user, taskConfig) => {
  logger.info('Starting timed actions.')
  Object.values(tasks).forEach(t => {
    if (!t.scheduledActions.length) {
      return
    }
    t.scheduledActions.forEach(a => {
      logger.verbose(`Task: ${t.id}: ${a[1]} (delay: ${moment.duration(a[0]).humanize()}${a[3] ? ', runs on boot' : ''})`)
      discordClient.setInterval(safeCall(a[2]), a[0], discordClient, user, taskConfig[t.id], t.id)

      // If the fourth item is set to true, we'll run the code right away instead of waiting.
      // Useful for making sure tasks with long delays at least run once on bot bootup.
      if (a[3]) {
        logger.debug(`Calling task at startup: ${t.id}`)
        safeCall(a[2]).call(null, discordClient, user, taskConfig[t.id], t.id)
      }
    })
  })
}

/**
 * Registers a task, making it possible to access its functionality.
 */
const registerTask = (discordClient, user, { id, formats, triggerActions, scheduledActions }) => {
  tasks[id] = { id, formats, triggerActions, scheduledActions }
  logger.verbose(`Registered task: ${id}`)
  triggerActions.forEach(a => discordClient.on(a[0], a[1]))
}

/**
 * Finds all usable tasks.
 */
const findTasks = () => {
  const base = `${config.CALLISTO_BASE_DIR}/packages/`
  return listTaskDirs(base).map(i => ({ name: i, file: `${base}${i}/index.js` }))
}

/**
 * Reads a list of directories inside of a given directory and returns the ones that contain tasks.
 * Basically, returns all directories that start with 'callisto-task'.
 */
const listTaskDirs = (base) => (
  fs.readdirSync(base).filter(i => fs.statSync(path.join(base, i)).isDirectory() && i.startsWith('callisto-task'))
)
