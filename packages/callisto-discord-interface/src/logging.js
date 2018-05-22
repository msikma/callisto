/**
 * Callisto - callisto-discord-interface <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import { RichEmbed } from 'discord.js'

import logger, { severity } from 'callisto-util-logging'
import { embedTitle, embedDescription, embedDescriptionShort, getSystemInfo, getFormattedTime } from 'callisto-util-misc'
import { config, pkg } from 'callisto-util-misc/resources'
import { sendMessage } from './responder'

// The colors in which our log RichEmbeds are displayed.
const SUCCESS_COLOR = 0x35ed36
const VERBOSE_COLOR = 0x424555
const INFO_COLOR = 0x17a1eb
const WARNING_COLOR = 0xffaa02
const ERROR_COLOR = 0xff034a

// Used to grab the task name. TODO: just pass it on explicitly.
const TASK_NAME_RE = new RegExp('([^:]+):', 'i')

// Thumbnail we display during boot up.
const bootupThumbnail = 'https://i.imgur.com/TugT1K5.jpg'

// Include our own package. We're checking the version number against the version of the main package.
// They should be the same, because the Discord interface is the 'main' code.
// If there's a discrepancy, this is logged to the user.
const interfacePkg = require('../package.json')

/**
 * Sends a message to Discord on bootup. This is done after we've retrieved a list
 * of tasks, so that full information on what's running is available to the user.
 */
export const logCallistoBootup = async (tasks, singleTaskData) => {
  // Channels we'll send the output to.
  const logChannels = config.CALLISTO_SETTINGS.logChannels
  const avatar = config.CALLISTO_BOT_AVATAR
  const url = pkg.homepage
  const tasksList = bulletizeTasks(tasks, singleTaskData)
  const systemInfo = await getSystemInfo()
  const time = getFormattedTime()

  // Create a RichEmbed to send directly to the channel.
  const embed = new RichEmbed()
  embed.setAuthor(`Callisto Bot v${pkg.version}`, avatar, url)
  embed.setTimestamp(new Date())
  embed.setThumbnail(bootupThumbnail)
  embed.addField('Commit', `[\`${systemInfo.formatted}\`](${systemInfo.commitLink})`, true)
  embed.addField('Server', systemInfo.server, true)
  embed.addField('Tasks', tasksList)
  embed.setDescription(`Callisto Bot is launching. Time: ${time}.`)
  embed.setColor(SUCCESS_COLOR)

  logChannels.forEach(c => sendMessage(c[0], c[1], null, embed))
}

/**
 * Verifies whether the callisto-discord-interface version is identical to the
 * main package version. Warns if they are not.
 */
export const checkVersion = () => {
  const localVersion = interfacePkg.version
  const globalVersion = pkg.version
  logger.warn(`Version discrepancy: callisto-bot is ${globalVersion}, callisto-discord-interface is ${localVersion}`, false)
}

/**
 * Creates a bulletized list of tasks.
 */
const bulletizeTasks = (tasks, singleTaskData) => (
  tasks.map(t => `• ${t.name} (${t.version})${singleTaskData && singleTaskData.slug === t.slug ? ' - testing with only this task' : ''}`)
)

/**
 * Logs a debugging message to Discord. We check if the severity is high enough
 * for it to be worth logging and grab the target channels from the config.
 * Logging is done using a simple colorized RichEmbed.
 * If 'force' is true, the message is logged regardless of severity.
 */
export const logToDiscord = (msgLevel, msgObject, force = false) => {
  const severityLimit = severity[config.CALLISTO_SETTINGS.logLevel]
  // Don't log if the message is not as important as the minimum specified in the config.
  // If no error level is specified at all, don't log anything.
  if ((severity[msgLevel] < severityLimit || severityLimit == null) && force !== true) {
    return
  }
  const logChannels = config.CALLISTO_SETTINGS.logChannels

  // Retrieve the title and description either from the msgObject directly
  // (if it comes pre-formatted) or determine it using code (if it comes from the logger).
  const { title, desc } = msgObject.title && msgObject.desc ? msgObject : prepareMessage(msgObject)

  // Log based on severity.
  if (msgLevel === 'verbose') {
    logVerboseToDiscord(title ? title : 'Verbose', desc, logChannels)
  }
  if (msgLevel === 'info') {
    logInfoToDiscord(title ? title : 'Info', desc, logChannels)
  }
  if (msgLevel === 'warn') {
    logWarnToDiscord(title ? title : 'Warning', desc, logChannels)
  }
  if (msgLevel === 'error') {
    logErrorToDiscord(title ? title : 'Error', desc, logChannels)
  }
}

/**
 * Capitalizes the first letter of a string.
 */
const capitalizeFirst = (str) => (
  `${str.charAt(0).toUpperCase()}${str.slice(1)}`
)

/**
 * Prepares the message for logging.
 *
 * This returns an object containing a title and description. The title may be null,
 * in which case we will use a standard title. The description is Markdown and is
 * limited to a valid string length.
 */
const prepareMessage = (msgObject) => {
  if (msgObject.type === 'string') {
    return separateMsg(msgObject.string)
  }
  if (msgObject.type === 'object') {
    return { title: null, desc: monospaceText(embedDescriptionShort(msgObject.string)) }
  }
}

// Wraps text in triple backticks to display it as a code block.
const monospaceText = str => ['```', str, '```'].join('')

/**
 * Separates a message into a title and description.
 * Most messages start with the task name, e.g. 'mandarake: error text'.
 * Send that task name as title, and the rest as description.
 */
const separateMsg = (msg) => {
  const matches = msg.match(TASK_NAME_RE)
  // If no task at the start, just use the warn level as title.
  if (!matches) return { title: null, desc: msg }
  const desc = msg.substr(matches[0].length).trim()
  return { title: capitalizeFirst(matches[0]), desc }
}

/**
 * Logs a message to Discord for debugging purposes.
 * This simply wraps the message in a colored RichEmbed so that it stands out.
 */
const logMsgToDiscord = (color) => (title, desc, channels) => {
  const embed = new RichEmbed()
  embed.setTitle(embedTitle(title))
  embed.setDescription(embedDescription(desc))
  embed.setColor(color)
  channels.forEach(c => sendMessage(c[0], c[1], null, embed))
}

// Helper functions that log with a specific color.
const logVerboseToDiscord = logMsgToDiscord(VERBOSE_COLOR)
const logInfoToDiscord = logMsgToDiscord(INFO_COLOR)
const logWarnToDiscord = logMsgToDiscord(WARNING_COLOR)
const logErrorToDiscord = logMsgToDiscord(ERROR_COLOR)
