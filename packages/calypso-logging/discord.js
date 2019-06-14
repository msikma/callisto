/**
 * Calypso - calypso-logging <https://github.com/msikma/calypso>
 * © MIT license
 */

import { RichEmbed } from 'discord.js'
import { zipObject } from 'lodash'
import { isTemporaryError } from 'calypso-request'
import { sendMessage } from 'calypso-core/responder'
import { embedTitle, embedDescription, getFormattedTimeOnly, objectInspect, wrapInJSCode } from 'calypso-misc'
import { data } from 'calypso-misc/resources'
import logger from './index'
import { logLevels } from './severity'
import severity from './severity'

// The colors used for our RichEmbed log messages.
const levelColors = {
  error: 0xff034a,     // #ff034a
  warn: 0xffaa02,      // #ffaa02
  info: 0x17a1eb,      // #17a1eb
  verbose: 0x424555,   // #424555
  debug: 0x363946,     // #363946
  silly: 0x2a2c37      // #2a2c37
}

/**
 * Logs a message to Discord. The log is sent as either a RichEmbed (if the severity is high enough,
 * 'info' by default) or as regular text ('verbose' by default). The values in the config that control
 * this are 'logLevel' and 'logLevelText'. Note that the command line --log parameter only controls
 * what is logged in the console, nothing more.
 *
 * The channels we log to are also taken from the config file, from 'logChannels'.
 */
const logMsgToDiscord = (level, id, version, name, icon, isSystem = false) => async (title, desc, fields = [], force = false, logOnError = true) => {
  // List of channels to log to.
  const logChannels = data.config.CALYPSO_SETTINGS.logChannels || []
  const logChannelsImportant = data.config.CALYPSO_SETTINGS.logChannelsImportant || []
  // Severity limit. If it meets 'type one', we post a RichEmbed. If 'type two', we post text.
  // If the message meets neither, we ignore it.
  const typeOneLimit = severity[data.config.CALYPSO_SETTINGS.logLevel]
  const typeTwoLimit = severity[data.config.CALYPSO_SETTINGS.logLevelText]
  const importantLimit = severity[data.config.CALYPSO_SETTINGS.logLevelImportant]
  const messageSeverity = severity[level]
  // Color to use for the embed, indicating the severity.
  const levelColor = levelColors[level]

  // Container for Promises that will be used to send the message.
  let promises = []

  // Send the message to our regular logger (file, console).
  logger[level](`${id}: ${title}${desc ? ` - ${desc}` : ''}${fields ? fields.map(f => ` [${f[0]}: ${f[1]}]`).join('') : ''}`)

  // Return if we don't meet the severity level, unless forced.
  // Also return if we lack both 'title' and 'desc'.
  if (((messageSeverity < typeTwoLimit) && force !== true) || (!title && !desc)) {
    return
  }

  if (messageSeverity >= typeOneLimit) {
    // Send a RichEmbed.
    const embed = new RichEmbed()
    if (title) embed.setTitle(embedTitle(title))
    if (desc) embed.setDescription(embedDescription(desc))
    if (id && isSystem === false) embed.setFooter(`Logged by calypso-task-${id}${version ? ` (${version})` : ''}`)
    // Add fields if we have any.
    fields.forEach(field => {
      const [header, content, inline = false] = field
      embed.addField(header, content, inline)
    })
    embed.setAuthor(name, icon)
    embed.setColor(levelColor)
    embed.setTimestamp()
    // Send to the important log channels if applicable.
    if (messageSeverity >= importantLimit) {
      promises = [...promises, logChannelsImportant.map(c => sendMessage(c[0], c[1], null, embed, logOnError))]
    }
    // Send to the regular log channels.
    promises = [...promises, logChannels.map(c => sendMessage(c[0], c[1], null, embed, logOnError))]
    return Promise.all(promises)
  }
  else {
    // Send regular text.
    const time = getFormattedTimeOnly()
    const msg = `\`${time}\`: \`${id}\`: ${title && desc ? `**${embedTitle(title)}** - ${embedDescription(desc)}` : embedTitle(title)}`
    // Send to the important log channels if applicable (probably not).
    if (messageSeverity >= importantLimit) {
      promises = [...promises, logChannelsImportant.map(c => sendMessage(c[0], c[1], msg, null, logOnError))]
    }
    // Send to the regular log channels.
    promises = [...promises, logChannels.map(c => sendMessage(c[0], c[1], msg, null, logOnError))]
    return Promise.all(promises)
  }
}

/**
 * Creates a logger object to be used by one specific task.
 * This works exactly the same as the generic 'logger',
 * but it will post logs to Discord using the task's name and icon.
 *
 * @param {String} id ID of the task (its slug)
 * @param {String} version Version of the task (semver from the package.json)
 * @param {String} name Name of the task (human readable)
 * @param {Number} color The task's main color
 * @param {String} icon URL to the task's icon image
 * @param {Boolean} isSystem Whether this is the system's logger rather than a task's
 */
export const createTaskLogger = (id, version, name, color, icon, isSystem = false) => {
  const logFunctions = logLevels.map(level => logMsgToDiscord(level, id, version, name, icon, isSystem))
  const logFunctionsObj = zipObject(logLevels, logFunctions)
  const logTaskError = (errorTitle, details = {}, err = {}) => (
    logFunctionsObj.error(
      errorTitle,
      `Details: ${wrapInJSCode(objectInspect(details))}`,
      unpackError(err),
      false,
      false
    )
  )
  const logTaskTempError = (errorTitle, details = {}, err = {}) => (
    logFunctionsObj.debug(
      errorTitle,
      `Ignored temporary error during search: ${wrapInJSCode(objectInspect(details))}`,
      unpackError(err, false),
      false,
      false
    )
  )
  return {
    logError: (errorTitle = null, details = {}, err = {}) => {
      if (isTemporaryError(err))
        return logTaskTempError(!errorTitle ? '' : errorTitle, details, err)
      else
        return logTaskError(errorTitle, details, err)
    },
    logTaskError,
    logTaskTempError,
    logTaskItem: (title, searchItem = {}, foundItems = [], a = 0, z = 0) => (
      logFunctionsObj.debug(
        title,
        `${unpackSearchItem(searchItem, foundItems, a, z)}`
      )
    ),
    ...logFunctionsObj
  }
}

/** Extracts information out of an object of search info. */
const unpackSearchItem = (searchItem, foundItems = [], a = null, z = null) => {
  let mainString = ''
  const secondaryString = []

  const mainKeys = ['query', 'q', 'slug', 'keyword', 'search']
  const secondaryKeys = ['category', 'subscriptions', 'link', 'res']
  for (let [key, value] of Object.entries(searchItem)) {
    if (mainKeys.indexOf(key) !== -1) {
      mainString = value
    }
    if (secondaryKeys.indexOf(key) !== -1) {
      secondaryString.push(`${key} '${value}'`)
    }
  }

  return `'${mainString}'${z !== 0 && a != null ? ` ${a}/${z}` : ''} - found ${foundItems.length} - ${secondaryString.join(' ')}`
}

/** Takes attributes out of an error object for logging. */
const unpackError = (err = {}, addStack = true) => ([
  ...(err.name ? [['Name', err.name, true]] : []),
  ...(err.code ? [['Code', err.code, true]] : []),
  ...(addStack && err.stack ? [['Stack', err.stack, true]] : [])
])
