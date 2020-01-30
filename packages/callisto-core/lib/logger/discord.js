// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

const chalk = require('chalk')
const util = require('util')
const { isString } = require('lodash')
const { unpackError } = require('dada-cli-tools/util/error')
const { logFatal, logError, logWarn, logNotice, logInfo, logDebug } = require('dada-cli-tools/log')

const { embedTitle, embedDescription } = require('../../util/text')
const { wrapObject, wrapStack } = require('../../util/formatting')
const { isTempError } = require('../../util/errors')
const { getFormattedTime } = require('../../util/time')
const { sendMessage } = require('../discord')
const runtime = require('../../state')

/**
 * This is the main logger that logs to the console and posts to the Discord log channels.
 * 
 * After the bot has logged in to Discord, only this logger should be used.
 * 
 * The logger is an object containing several functions for various types of log operations;
 * there is a single one for general system logging, and each task receives its own copy
 * of this object. Tasks should always use their own logger, since it will attach their
 * task name and icon to the log objects.
 * 
 * The following logging functions are available:
 * 
 *   - logFatal     - logFatalObj  - logException
 *   - logError     - logErrorObj  - logTempException
 *   - logWarn      - logWarnObj
 *   - logNotice    - logNoticeObj
 *   - logInfo      - logInfoObj
 *   - logDebug     - logDebugObj
 * 
 * The "plain" logging functions has two different interfaces, depending on what kind of message
 * needs to be logged. The following argument types may be passed:
 * 
 *   - String [, ...String]
 *       This simply logs plain text strings verbatim. Primary usage.
 *   - Array
 *       Assumes the array consists of [title, description, details].
 *       The title and description are strings (or will be string cast if not);
 *       the title is bold and is separated from the description by a dash.
 *       The 'details' object is a simple key/value object that will be cast to string.
 *
 * The "object" logging functions are for more prominent messages. Use this if your message has
 * a lot of meta-information, and especially for error messages. They take an object:
 * 
 *   {
 *     title: 'Main title describing the error/log purpose',
 *     desc: 'Longer description, e.g. containing information about what went wrong',
 *     details: {}, // Any arbitrary information to be shown in metadata fields
 *     debug: {}, // A plain object containing information useful for debugging (will be wrapped in a code block)
 *     error: new Error('Error object that will be unpacked'),
 *   }
 * 
 * For this object, only 'title' is required.
 * 
 * The 'logException' function is a unique logging function that logs either at 'error' level,
 * or at 'notice' level, depending on what type of error is passed. This can be used to easily log
 * exceptions that occur that could potentially be just temporary network errors that can be safely ignored.
 * The 'logTempException' function operates like 'logException', except that it always assumes the given
 * error is a temporary network error.
 * Both work the same as the other "object" functions despite not having 'obj' in the name.
 */

// Log levels and their shortcut labels.
//
// Includes the colors used for our RichEmbed log messages,
// and the logging function used to log to the console.
//
// The available levels are a subset of the RFC 5424 standard.
// <https://tools.ietf.org/html/rfc5424>
const logLevels = {
  logFatal: [8, 0xff034a, logFatal],     // #ff034a
  logError: [7, 0xff034a, logError],     // #ff034a
  logWarn: [6, 0xffaa02, logWarn],       // #ffaa02
  logNotice: [5, 0x17a1eb, logNotice],   // #17a1eb
  logInfo: [4, 0x424555, logInfo],       // #424555
  logDebug: [2, 0x363946, logDebug],     // #363946
}

// At or above this threshold, logs are sent to the errors channel instead.
const logErrorThresholdGte = 6

// System logger. Initially not available until after the config has been parsed.
let system = null

/** Initializes the system logger, using data from the config file for its looks. */
const initSystemLogger = () => {
  system = createTaskLogger(runtime.systemTask)
}

/** Retrieves the log channels from the config object. */
const getLogChannels = () => {
  const logInfoChannels = runtime.config.systemConfig.logInfoChannels || []
  const logErrorChannels = data.config.systemConfig.logErrorChannels || []
  return {
    logInfoChannels,
    logErrorChannels
  }
}

/**
 * Returns a RichEmbed object log message to send to Discord.
 */
const renderRichEmbed = (taskInfo, logArgs, logLevel, isSystemLogger = false) => {
  const embed = new RichEmbed()
  if (logArgs.title) embed.setTitle(embedTitle(logArgs.title))
  if (logArgs.desc) embed.setDescription(embedDescription(logArgs.desc))
  if (taskInfo.id && taskInfo.version && isSystemLogger === false) {
    embed.setFooter(`Logged by callisto-task-${id}${version ? ` (${version})` : ''}`)
  }
  if (taskInfo.debug && isPlainObject(debug)) {
    // Print a whole debugging object.
    embed.addField('Debug information', wrapObject(debug), false)
  }
  if (taskInfo.error) {
    // Unpack the error and log whatever relevant information we get.
    const { name, code, stack, oneLiner } = unpackError(taskInfo.error)
    if (name) embed.addField('Name', name, true)
    if (code) embed.addField('Code', `\`${code}\``, true)
    if (stack) embed.addField('Stack', wrapStack(stack.join('\n')), false)
    if (!name && !code && !stack && oneLiner) {
      embed.addField('Details', wrapStack(oneLiner), false)
    }
  }
  if (taskInfo.details && isPlainObject(taskInfo.details)) {
    for (const [key, value] of Object.entries(taskInfo.details)) {
      // Values shorter than a certain threshold will be displayed inline.
      const isShort = value.length < 30
      embed.addField(key, value, isShort)
    }
  }
  embed.setAuthor(taskInfo.name, taskInfo.icon)
  embed.setColor(logLevel[1])
  embed.setTimestamp()
}

/**
 * Renders a plain text string log message for the console.
 */
const renderConsole = (taskInfo, logArgs) => {
  let mainMessage = ''

  if (_isEmptyLogArgs(logArgs)) {
    // If nothing was passed for some reason:
    mainMessage = '(empty)'
  }
  else if (logArgs.length === 1 && Array.isArray(logArgs[0])) {
    // If this is a [title, description, details] array:
    const [title, description, details] = logArgs[0]
    mainMessage = [
      title ? chalk.bold(title) : '',
      title && description ? ' - ' : '',
      description ? chalk.dim(description) : '',
      (title || description) && details ? ' - ' : '',
      details ? _renderDetailsConsole(details) : ''
    ].join('')
  }
  else {
    // In normal cases, just cast everything to string.
    mainMessage = logArgs.map(item => String(item)).join(', ')
  }

  return `${chalk.underline(taskInfo.id)}: ${mainMessage}`
}

/**
 * Returns a string log message in Markdown format to send to Discord.
 */
const renderPlainText = (taskInfo, logArgs) => {
  let mainMessage = ''

  if (_isEmptyLogArgs(logArgs)) {
    // If nothing was passed for some reason:
    mainMessage = '(empty)'
  }
  else if (logArgs.length === 1 && Array.isArray(logArgs[0])) {
    // If this is a [title, description, details] array:
    const [title, description, details] = logArgs[0]
    mainMessage = [
      title ? `**${embedTitle(title)}**` : '',
      title && description ? ' - ' : '',
      description ? embedDescription(description) : '',
      (title || description) && details ? ' - ' : '',
      details ? _renderDetailsPlainText(details) : ''
    ].join('')
  }
  else {
    // In normal cases, just cast everything to string.
    mainMessage = logArgs.map(item => String(item)).join(', ')
  }

  return `\`${getFormattedTime()}\`: \`${taskInfo.id}\`: ${mainMessage}`
}

/**
 * Low level interface for logging messages to Discord: plain text version.
 * 
 * The log is either sent as a RichEmbed or as plain text, depending on the severity.
 * By default, the levels 'fatal', 'error', 'warn', 'notice', are RichEmbeds,
 * and 'info' and 'debug' are sent as plain text.
 *
 * The channels we log to are also taken from the config file, from 'logInfoChannels'
 * and 'logErrorChannels'.
 * 
 * Note: the --log command line argument only affects what's logged to the console.
 * This function logs to the console and to Discord. Depending on the logging level,
 * the message may only show up on Discord.
 * 
 * @param {Number} level Log level
 * @param {Object} taskInfo Object containing information of the caller
 * @param {String} taskInfo.id Unique string identifier of the task or system
 * @param {String} taskInfo.name Name of the task or system name
 * @param {String} taskInfo.color Color to use when displaying RichEmbeds
 * @param {String} taskInfo.version Version of the task, or of the system
 * @param {String} taskInfo.icon Link to an icon to display
 * @param {Boolean} logAsObject Whether to log an object, or plain text
 * @param {Boolean} isSystemLogger Whether the logger is for the system (normally, for a task)
 * @throws {Error} In case the logging level is not set properly
 */
const createDiscordLogger = (level, taskInfo, logAsObject = false, isSystemLogger = false) => async (...args) => {
  const logLevel = logLevels[level]
  if (!logLevel) throw new Error(`Attempted to make a logger with an invalid level: ${level} (${id})`)

  // List of channels to log to.
  const { logInfoChannels, logErrorChannels } = getLogChannels()

  // Whether this is a regular or an error log. This decides which channel it's sent to.
  const isError = level >= logErrorThresholdGte

  // Log the string to the console. (Note: depends on the --log command line argument.)
  const consoleString = renderConsole(taskInfo, args)
  const consoleLogger = logLevel[2]
  consoleLogger(consoleString)

  // Now we'll log the message to Discord. We'll generate either a plain text string
  // or a RichEmbed (only one of the two, and the other will always be null).
  const msgPlain = !logAsObject ? renderPlainText(taskInfo, args) : null
  const msgRichEmbed = logAsObject ? renderRichEmbed(taskInfo, args, logLevel, isSystemLogger) : null

  // To log this message, we're sending message posting commands to each channel that needs it.
  const logCommands = []
  const logAttrs = { message: msgPlain, embed: msgRichEmbed }
  logCommands.push(...(isError ? logErrorChannels.map(c => sendMessage(c[0], c[1], logAttrs)) : []))
  logCommands.push(...logInfoChannels.map(c => sendMessage(c[0], channel[1], logAttrs)))

  return Promise.all(logCommands)
}

/**
 * Creates a logger object to be used by one specific task.
 * 
 * This creates a logger object that will post to Discord using the task's name, color and icon.
 *
 * @param {Object} taskInfo Object containing information of the caller
 * @param {String} taskInfo.id Unique string identifier of the task or system
 * @param {String} taskInfo.name Name of the task or system name
 * @param {String} taskInfo.color Color to use when displaying RichEmbeds
 * @param {String} taskInfo.version Version of the task, or of the system
 * @param {String} taskInfo.icon Link to an icon to display
 * @param {Boolean} isSystemLogger Whether the logger is for the system (normally, for a task)
 */
const createTaskLogger = (taskInfo, isSystemLogger = false) => {
  // Generate logging functions for plain text logs and object logs.
  const levels = Object.keys(logLevels)
  const logFnsPlain = Object.fromEntries(levels.map(level => [level, createDiscordLogger(level, taskInfo, false, isSystemLogger)]))
  const logFnsObject = Object.fromEntries(levels.map(level => [`${level}Obj`, createDiscordLogger(level, taskInfo, true, isSystemLogger)]))
  
  // Special logger function for errors that might be low priority, logging either
  // an 'error' if it isn't, or 'notice' if it is.
  const logException = (...args) => {
    const { title } = args
    if (!args.error || isTempError(args.error)) {
      logFnsObject.logNoticeObj({ ...args, title: title ? title : 'Ignored temporary error' })
    }
    else {
      logFnsObject.logErrorObj({ ...args, title: title ? title : 'An error occurred' })
    }
  }

  // Special logger for known temporary errors.
  const logTempException = (...args) => {
    const { title } = args
    logFnsObject.logNoticeObj({ ...args, title: title ? title : 'Ignored temporary error' })
  }

  return {
    ...logFnsPlain,
    ...logFnsObject,
    logException,
    logTempException
  }
}

/**
 * Renders a details key/value object to a single line of text with color escape codes.
 */
const _renderDetailsConsole = (details) => {
  const buffer = []
  for (let [key, value] of Object.entries(details)) {
    const valueStr = isString(value) ? chalk.green(value) : util.inspect(value, { colors: true, depth: 4 })
    buffer.push(`${chalk.yellow(key)}: ${valueStr}`)
  }
  return chalk.italic(buffer.join(', '))
}
/**
 * Renders a details key/value object to a single line of plain text.
 */
const _renderDetailsPlainText = (details) => {
  const buffer = []
  for (let [key, value] of Object.entries(details)) {
    const valueStr = isString(value) ? value : util.inspect(value, { colors: false, depth: 4 })
    buffer.push(`${key}: ${valueStr}`)
  }
  return `*${buffer.join(', ')}*`
}

/** Returns whether the given log arguments are empty. */
const _isEmptyLogArgs = logArgs => logArgs.length === 0 || (logArgs.length === 1 && Array.isArray(logArgs[0]) && logArgs[0].length === 0)

module.exports = {
  system,
  createTaskLogger,
  initSystemLogger
}
