/**
 * Callisto - callisto-util-cache <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import sqlite from 'sqlite'
import { get, isNumber } from 'lodash'
import logger from 'callisto-util-logging'

import { saveSettings, loadSettings } from './index'

/**
 * Helper task to retrieve information used by the system for a task.
 * This is only used by the system and should not be used by tasks.
 * If system task information cannot be found, it's initialized,
 * and the data we return is always in this format:
 *
 *   { lastRun: 1530813295884 }
 *
 * @param {String} $identifier Name of the task
 */
export const loadTaskStatus = async ($identifier) => {
  const status = await loadSettings($identifier, 'system')
  // If the data does not conform to our needs, reinitialize it.
  if (!taskStatusIsValid(status)) {
    logger.info(`loadTaskStatus: initializing task status data for ${$identifier}`)
    await saveSettings($identifier, 'system', { lastRun: 0 })
    return { lastRun: 0 }
  }
  return status
}

/**
 * Sets a task's 'last run' status to now.
 *
 * @param {String} $identifier Name of the task
 * @param {Number} lastRun Javascript time integer for last run time (defaults to now)
 */
export const setTaskLastRun = async ($identifier, lastRun = (+new Date())) => {
  const settings = await loadSettings($identifier, 'system')
  await saveSettings($identifier, 'system', { ...settings, lastRun })
}

/**
 * Returns true if a task's status information is invalid somehow.
 */
const taskStatusIsValid = status => (
  isNumber(status.lastRun)
)

/**
 * Stores the current time so we know when the system was last shut down.
 */
export const saveShutdownTime = async () => {
  const systemSettings = await loadSettings('_callisto', 'system')
  await saveSettings('_callisto', 'system', { ...systemSettings, lastShutdown: (+new Date()) })
}

/**
 * Returns the time we last shut down the bot.
 */
export const getShutdownTime = async () => {
  const systemSettings = await loadSettings('_callisto', 'system')
  return get(systemSettings, 'lastShutdown', 0)
}
