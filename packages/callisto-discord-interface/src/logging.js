/**
 * Callisto - callisto-discord-interface <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import { RichEmbed } from 'discord.js'

import logger, { severity } from 'callisto-util-logging'
import { embedTitle, embedDescription, embedDescriptionShort } from 'callisto-util-misc'
import { sendMessage } from './responder'
import { config } from './resources'

// The colors in which our log RichEmbeds are displayed.
const VERBOSE_COLOR = 0x424555
const INFO_COLOR = 0x17a1eb
const WARNING_COLOR = 0xffaa02
const ERROR_COLOR = 0xff034a

// Used to grab the task name. TODO: just pass it on explicitly.
const TASK_NAME_RE = new RegExp('([^:]+):', 'i')

/**
 * Logs a debugging message to Discord. We check if the severity is high enough
 * for it to be worth logging and grab the target channels from the config.
 * Logging is done using a simple colorized RichEmbed.
 * If 'force' is true, the message is logged regardless of severity.
 */
export const logToDiscord = (msgLevel, msgObject, force = false) => {
  const severityLimit = severity[config.CALLISTO_SETTINGS.errorLevel]
  // Don't log if the message is not as important as the minimum specified in the config.
  // If no error level is specified at all, don't log anything.
  if ((severity[msgLevel] < severityLimit || severityLimit == null) && force !== true) {
    return
  }
  const errorChannels = config.CALLISTO_SETTINGS.errorChannel
  const { title, desc } = prepareMessage(msgObject)

  // Log based on severity.
  if (msgLevel === 'verbose') {
    logVerboseToDiscord(title ? title : 'Verbose', desc, errorChannels)
  }
  if (msgLevel === 'info') {
    logInfoToDiscord(title ? title : 'Info', desc, errorChannels)
  }
  if (msgLevel === 'warn') {
    logWarnToDiscord(title ? title : 'Warning', desc, errorChannels)
  }
  if (msgLevel === 'error') {
    logErrorToDiscord(title ? title : 'Error', desc, errorChannels)
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
