/**
 * Callisto - callisto-discord-interface <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import { RichEmbed } from 'discord.js'

import logger, { severity } from 'callisto-util-logging'
import {
  embedDescription,
  embedDescriptionShort,
  embedTitle,
  getDuration,
  getFormattedTime,
  getSimpleDuration,
  getSystemInfo,
  errorObject
} from 'callisto-util-misc'
import { isTemporaryError } from 'callisto-util-request'
import { getShutdownTime } from 'callisto-util-cache/system'
import { config, pkg } from 'callisto-util-misc/resources'
import { createTaskLogger } from 'callisto-util-logging/discord'
import { getTaskInfo } from './task-manager'
import { sendMessage } from './responder'

// Colors used in the bootup and shutdown logs.
const ERROR_COLOR = 0xff034a     // #ff034a
const WARNING_COLOR = 0xffaa02   // #ffaa02
const SUCCESS_COLOR = 0x35ed36   // #35ed36

// Used to keep track of uptime.
let startTime

// Thumbnail we display during boot up.
const bootupThumbnail = 'https://i.imgur.com/TugT1K5.jpg'

// Include our own package. We're checking the version number against the version of the main package.
// They should be the same, because the Discord interface is the 'main' code.
// If there's a discrepancy, this is logged to the user.
const interfacePkg = require('../package.json')

/**
 * Returns an object containing log functions that post directly to the Discord log channels.
 * These functions will post log messages using the task's own name and icon.
 * This can only be used after tasks have been loaded and initialized.
 *
 * @param {String} id Task ID
 */
export const getTaskLogger = (id) => {
  const { version, name, color, icon } = getTaskInfo(id)
  return createTaskLogger(id, version, name, color, icon)
}

/**
 * Returns a logger for the Callisto system.
 */
export const getSystemLogger = () => (
  createTaskLogger(pkg.name, pkg.version, `Callisto Bot v${pkg.version}`, SUCCESS_COLOR, config.CALLISTO_BOT_AVATAR, true)
)

/**
 * Sends a message to Discord on bootup. This is done after we've retrieved a list
 * of tasks, so that full information on what's running is available to the user.
 */
export const logCallistoBootup = async (tasks, tasksWithoutConfig, singleTaskData) => {
  // Channels we'll send the output to.
  const logChannels = config.CALLISTO_SETTINGS.logChannels
  const avatar = config.CALLISTO_BOT_AVATAR
  const url = pkg.homepage
  const tasksList = bulletizeTasks(tasks, singleTaskData)
  const systemInfo = await getSystemInfo()

  // Current time and time since last run.
  const time = getFormattedTime()
  const shutdownMs = await getShutdownTime()
  const timeSinceLast = getSimpleDuration((+new Date()) - shutdownMs)

  // Determine whether we have ignored tasks (for lack of configuration) or not.
  const ignoredTasksMsg = tasksWithoutConfig.length > 0
    ? tasksWithoutConfig.length === 1
      ? `Ignored ${tasksWithoutConfig.length} task without configuration.`
      : `Ignored ${tasksWithoutConfig.length} tasks without configuration.`
    : ''

  startTime = +new Date()

  // Create a RichEmbed to send directly to the channel.
  const embed = new RichEmbed()
  embed.setAuthor(`Callisto Bot v${pkg.version}`, avatar, url)
  embed.setTimestamp()
  embed.setThumbnail(encodeURI(bootupThumbnail))
  embed.addField('Commit', `[\`${systemInfo.formatted} [${systemInfo.hash}]\`](${systemInfo.commitLink})`, true)
  embed.addField('Server', systemInfo.server, true)
  embed.addField('Time', `${time}${shutdownMs ? ` (${timeSinceLast} since last run)` : ''}`, false)
  embed.addField('Tasks', tasksList)
  embed.setDescription(`Callisto Bot is launching${singleTaskData ? ' in testing mode' : ''}.${ignoredTasksMsg}`)
  embed.setColor(singleTaskData ? WARNING_COLOR : SUCCESS_COLOR)

  return Promise.all(logChannels.map(async c => await sendMessage(c[0], c[1], null, embed)))
}

/**
 * Display a final shutdown message.
 */
export const logCallistoShutdown = async () => {
  const logChannels = config.CALLISTO_SETTINGS.logChannels

  const avatar = config.CALLISTO_BOT_AVATAR
  const url = pkg.homepage
  const time = getFormattedTime()
  const uptime = (+new Date()) - startTime
  const uptimeString = getDuration(uptime)

  // Create a RichEmbed to send directly to the channel.
  const embed = new RichEmbed()
  embed.setAuthor(`Callisto Bot v${pkg.version}`, avatar, url)
  embed.setDescription(`Callisto Bot is shutting down.`)
  embed.addField('Time', `${time}`, false)
  embed.addField('Uptime', `${uptimeString}`, false)
  embed.setTimestamp(new Date())
  embed.setColor(ERROR_COLOR)

  // Note: this avoid use of the queue since it's frozen during shutdown.
  return Promise.all(logChannels.map(async c => await sendMessage(c[0], c[1], null, embed, false, true)))
}

/**
 * Handles error events from the client.
 */
const handleClientEvent = (type, desc, err) => {
  // Don't emit anything if it's a temporary error.
  if (isTemporaryError(err)) return
  // Otherwise, send a message to the error log.
  getSystemLogger()[type](desc, ...errorObject(err))
}

/**
 * Logs warnings and errors when they are emitted by the client.
 */
export const bindEmitHandlers = (client) => {
  client.on('error', err => handleClientEvent('error', 'Client emitted an error', err))
  client.on('warn', err => handleClientEvent('warn', 'Client emitted a warning', err))
}

/**
 * Catches all uncaught exceptions.
 *
 * All tasks run within a try/catch block, so they can safely crash.
 * This is for all other cases, and it's very rare for this catch to be triggered.
 */
export const catchAllExceptions = async () => {
  process.on('uncaughtException', err => handleClientEvent('error', 'Unhandled exception', err))
}

/**
 * Verifies whether the callisto-discord-interface version is identical to the
 * main package version. Warns if they are not.
 */
export const checkVersion = () => {
  const localVersion = interfacePkg.version
  const globalVersion = pkg.version
  if (localVersion !== globalVersion) {
    logger.warn(`Version discrepancy: callisto-bot is ${globalVersion}, callisto-discord-interface is ${localVersion}`, false)
  }
}

// Returns a string depicting a task item. Used by bulletizeTasks().
const taskItemString = singleTask => task => `• ${task.slug} (${task.version})${singleTask ? ' - testing with only this task' : ''}`

// Creates a bulletized list of tasks.
const bulletizeTasks = (tasks, singleTaskData) => (
  singleTaskData
    ? tasks.filter(t => t.slug === singleTaskData.slug).map(taskItemString(true))
    : tasks.map(taskItemString(false))
)
