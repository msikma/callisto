// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

const { get, isString } = require('lodash')
const { logFatal, logError, logWarn, logNotice, logInfo, logDebug } = require('dada-cli-tools/log')
const { wait } = require('dada-cli-tools/util/misc')
const chalk = require('chalk')

const { shortenDescription, shortenTitle } = require('../../util/message')
const { isTempError } = require('../../util/errors')
const { getServerChannelsList } = require('../../util/posting')
const { renderRichEmbed, renderConsole, renderPlainText } = require('./render')
const { reportPayloadError, reportPayloadTempError } = require('./errors')
const runtime = require('../../state')

/**
 * This file contains the main Discord message sending logic, the queue, and the system logger.
 * 
 * After the bot has logged in, only this logger should be used and not the console only one.
 * 
 * The logger is an object containing several functions for various types of log operations;
 * there is a single one for general system logging, and each task receives its own copy
 * of this object. Tasks should always use their own logger, since it will attach their
 * task name and icon to the log objects.
 * 
 * The following logging functions are available:
 * 
 *   - logFatal     - logFatalObj    - logFatalLocal    - logException
 *   - logError     - logErrorObj    - logErrorLocal    - logTempException
 *   - logWarn      - logWarnObj     - logWarnLocal
 *   - logNotice    - logNoticeObj   - logNoticeLocal
 *   - logInfo      - logInfoObj     - logInfoLocal
 *   - logDebug     - logDebugObj    - logDebugLocal
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
 *     logOnError: true // Logs a system error if the payload refuses to be accepted
 *   }
 * 
 * For this object, only 'title' is required.
 * 
 * The "local" functions act as the "plain" functions, except that they don't send anything
 * to Discord. They only log to the console.
 * 
 * Finally, two special functions are available which all function like the "object" functions:
 * 
 *   - logException - a unique logging function that logs either at 'error' level,
 *       or at 'notice' level, depending on what type of error is passed. This can be used
 *       to easily log exceptions that occur that could potentially be just temporary network
 *       errors that can be safely ignored.
 *   - logTempException - operates like 'logException', except it always assumes the given
 *       error is a temporary network error.
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

/** List of available logging functions. */
const logFnsList = [
  ...Object.keys(logLevels),
  ...Object.keys(logLevels).map(n => `${n}Obj`),
  ...Object.keys(logLevels).map(n => `${n}Local`),
  'logException',
  'logTempException'
]

/** State variables for the queue. */
const queueState = {
  isRunning: false,     // Whether the queue has been started or not; it runs once per bot invocation
  isPaused: false,      // Whether the queue has been temporarily paused
  delay: 1000,          // The delay between heartbeats
  logHeartbeats: false, // Whether to log queue heartbeats
  ref: null,            // Reference to the queue loop Promise
  maxTries: 5,          // The maximum number of times we'll try sending a message
  items: []
}

// The following section constructs the system logger object.
// Since the logger is not immediately initialized, we first construct an object
// of noop functions, which can be imported by other files. As soon as the
// logger is initialized, these functions will begin to actually log messages.

// Container for system logging functions, which will appear when initSystemLogger() runs.
const systemLoggingFns = {}

// Logging placeholders; since the log functions are not initialized immediately,
// these functions absorb arguments and pass them on to the real functions
// when they're initialized. This avoids problems with importing the 'system' object.
const logArgsFn = level => (...args) => systemLoggingFns[level] ? systemLoggingFns[level](...args) : null

// System logger. Contains a function for every key in logLevels.
const system = Object.fromEntries(logFnsList.map(level => [level, logArgsFn(level)]))

/** Initializes the system logger, using data from the config file for its looks. */
const initSystemLogger = () => {
  Object.assign(systemLoggingFns, createTaskLogger(runtime.systemTask))
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
 * @param {Object} taskInfo.data.package Package information for the task
 * @param {Object} taskInfo.data.meta Object containing information of the caller
 * @param {String} taskInfo.data.meta.id Unique string identifier of the task or system
 * @param {String} taskInfo.data.meta.name Name of the task or system name
 * @param {String} taskInfo.data.meta.color Color to use when displaying RichEmbeds
 * @param {String} taskInfo.data.meta.version Version of the task, or of the system
 * @param {String} taskInfo.data.meta.icon Link to an icon to display
 * @param {Boolean} logAsObject Whether to log an object, or plain text
 * @param {Boolean} isSystemLogger Whether the logger is for the system (normally, for a task)
 * @param {Boolean} isLocalLogger If toggled, only logs to local console and not to Discord
 * @throws {Error} In case the logging level is not set properly
 */
const createDiscordLogger = (level, taskInfo, logAsObject = false, isSystemLogger = false, isLocalLogger = false) => async (...args) => {
  const logLevel = logLevels[level]
  if (!logLevel) throw new Error(`Attempted to make a logger with an invalid level: ${level} (${id})`)

  // Whether this is a regular or an error log. This decides which channel it's sent to.
  const isError = logLevel[0] >= logErrorThresholdGte

  // Log the string to the console. (Note: depends on the --log command line argument.)
  const consoleSegments = renderConsole(taskInfo, args, logLevel, logAsObject)
  const consoleLogger = logLevel[2]
  consoleLogger(...consoleSegments)

  if (isLocalLogger) {
    return
  }

  // List of channels to log to.
  const { logInfoChannels, logErrorChannels } = getLogChannels()

  // Now we'll log the message to Discord. We'll generate either a plain text string
  // or a RichEmbed (only one of the two, and the other will always be null).
  const msgPlain = !logAsObject ? renderPlainText(taskInfo, args, logLevel) : null
  const msgRichEmbed = logAsObject ? renderRichEmbed(taskInfo, args, logLevel, isSystemLogger) : null

  // To log this message, we're sending message posting commands to each channel that needs it.
  const logCommands = []
  const logAttrs = { msgPlain, msgRichEmbed, logOnError: args.logOnError ? args.logOnError : true }
  logCommands.push(...(isError ? logErrorChannels.map(c => sendMessage(c[0], c[1], logAttrs)) : []))
  logCommands.push(...logInfoChannels.map(c => sendMessage(c[0], c[1], logAttrs)))

  return Promise.all(logCommands)
}

/**
 * Low level interface for sending raw messages to the primary log channel.
 * 
 * Used for sending the startup and shutdown messages.
 */
const sendLogMessageRaw = ({ msgPlain = null, msgRichEmbed = null, logOnError = false } = {}) => {
  const { logInfoChannels } = getLogChannels()
  const logCommands = []
  const logAttrs = { msgPlain, msgRichEmbed, logOnError }
  logCommands.push(...logInfoChannels.map(c => sendMessage(c[0], c[1], logAttrs)))
  return Promise.all(logCommands)
}

/**
 * Returns an object of functions that can be used to post to Discord.
 */
const createTaskMessageSenders = (taskInfo, isSystem = false) => {
  return {
    postTextMessage: postTaskMessage(taskInfo, true),
    postMessage: postTaskMessage(taskInfo, false)
  }
}

/**
 * Returns a function that can be used to post messages.
 */
const postTaskMessage = (taskInfo, isPlainText) => (rawMessage, serverAndChannelItems) => {
  console.log('postTaskMessage', rawMessage)
  const msgPlain = isPlainText ? rawMessage : null
  const msgRichEmbed = !isPlainText ? extendRichEmbed(rawMessage, taskInfo) : null
  const targets = getServerChannelsList(serverAndChannelItems)
  targets.forEach(serverAndChannel =>
    sendMessage(serverAndChannel[0], serverAndChannel[1], { msgPlain, msgRichEmbed, logOnError: true, isImportant: false }))
}

/**
 * Modifies a RichEmbed to include a task's basic information.
 * 
 * Adds the task's icon, the task's color, and a timestamp.
 */
const extendRichEmbed = (embed, taskInfo) => {
  if (!embed) return embed
  if (!embed.timestamp) embed.setTimestamp(new Date())
  if (!embed.hexColor) embed.setColor(taskInfo.data.meta.color)
  if (embed.author && embed.author.name && !embed.author.iconURL) embed.setAuthor(embed.author.name, taskInfo.data.meta.icon, embed.author.url)
  if (!isString(embed.description)) {
    embed.setDescription(shortenDescription(embed.description))
  }
  if (!isString(embed.title)) {
    embed.setTitle(shortenTitle(embed.title))
  }
  return embed
}

/**
 * Creates a logger object to be used by one specific task.
 * 
 * This creates a logger object that will post to Discord using the task's name, color and icon.
 *
 * @param {Object} taskInfo Object containing information of the caller
 * @param {String} taskInfo.data.package Package information for the task
 * @param {String} taskInfo.data.meta Meta information identifying the task (name, id, icon, color)
 * @param {Boolean} isSystem Whether the logger is for the system (normally, for a task)
 */
const createTaskLogger = (taskInfo = {}, isSystem = false) => {
  // Generate logging functions for plain text logs and object logs.
  const levels = Object.keys(logLevels)
  const logFnsPlain = Object.fromEntries(levels.map(level => [level, createDiscordLogger(level, taskInfo, false, isSystem)]))
  const logFnsObject = Object.fromEntries(levels.map(level => [`${level}Obj`, createDiscordLogger(level, taskInfo, true, isSystem)]))
  const logFnsLocal = Object.fromEntries(levels.map(level => [`${level}Local`, createDiscordLogger(level, taskInfo, false, isSystem, true)]))
  
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
    ...logFnsLocal,
    ...logFnsObject,
    logException,
    logTempException
  }
}

/** Retrieves the log channels from the config object. */
const getLogChannels = () => {
  const logInfoChannels = runtime.config.systemConfig.logInfoChannels || []
  const logErrorChannels = runtime.config.systemConfig.logErrorChannels || []
  return {
    logInfoChannels,
    logErrorChannels
  }
}

/**
 * Main interface for sending messages to Discord.
 *
 * This requires a server ID and channel ID, and can send either a message
 * or an embed, or both.
 *
 * If 'logOnError' is true, we will send an error report in case sending the message fails.
 * If 'isImportant' is true, the message will be added to the front of the queue.
 */
const sendMessage = async (serverID, channelID, { msgPlain = null, msgRichEmbed = null, logOnError = true, isImportant = false } = {}) => {
  if (!msgPlain && !msgRichEmbed) {
    system.logWarn(['`sendMessage()`', 'called without message or embed'])
    return
  }

  // Quick sanity check. Channel ID should already be unique.
  const channel = runtime.discord.client.channels.get(channelID)
  const guildID = get(channel, 'guild.id')
  if (guildID !== serverID) {
    system.logWarn(['`sendMessage()`', 'sending to invalid channel', { guildID, serverID, channelID }])
    return
  }

  // Send either a [msgPlain, msgRichEmbed] or [msgRichEmbed] depending on whether we have a message.
  const payload = [msgPlain, msgRichEmbed ? msgRichEmbed : null].filter(s => s)
  
  if (isImportant) {
    pushToQueueFront({ channel, payload, logOnError })
  }
  else {
    pushToQueueBack({ channel, payload, logOnError })
  }
}

/**
 * Low level send interface that passes on a message to Discord.
 * 
 * All code should send their messages to Discord through this function,
 * not through any other means. That way we can ensure the --no-post
 * command line argument is honored.
 */
const sendPayload = async (sender, payload) => {
  // Don't send anything if --no-post is on.
  if (runtime.dev.noPost === true) {
    return true
  }
  await sender.send(...payload)
  return true
}

/**
 * Attempts to send a payload to Discord.
 * 
 * If no error is raised, we return true. If something went wrong, we log and return the error.
 */
const trySendingPayload = async ({ channel, payload }, tries = 0) => {
  try {
    const result = await sendPayload(channel, payload)
    return result
  }
  catch (err) {
    logWarn('Sending payload failed', `Channel: ${channel.name}, Error: ${err.code} - Attempt #${tries} (payload follows)`)
    logWarn(payload)
    return err
  }
}

/**
 * Moves on to the next task if available and runs it.
 */
const queueHeartbeat = async () => {
  if (queueState.isPaused) return
  if (queueIsEmpty()) return

  if (queueState.logHeartbeats) {
    system.logDebugLocal(['Queue heartbeat', null, { length: queueState.items.length }])
  }

  const [nextPayload, tries] = queueState.items.shift()

  // Only continue if this is a valid payload.
  if (!isValidPayload(nextPayload)) {
    system.logInfo(['Queue:', 'encountered an invalid payload:', payload])
    return true
  }

  try {
    const result = await trySendingPayload(nextPayload, tries)

    if (!result) {
      // If despite trying several times we can't send this message, give up on it.
      if (tries > maxTries) {
        logWarn(`Giving up on payload after ${tries} tries`)
        logWarn(payload)
        return true
      }
      // If sending the message was unsuccessful, but the error indicates a temporary problem, retry it.
      // If it's not a temporary error, log an error - unless this is already an error report.
      if (isTempError(result)) {
        pushToQueueBack(nextPayload, tries + 1)
        reportPayloadTempError(result, nextPayload)
      }
      else if (nextPayload.logOnError) {
        reportPayloadError(result, nextPayload)
      }
    }

    return true
  }
  catch (err) {
    // Something went wrong. If this occurs it indicates some problem beyond just a temporary network error.
    system.logWarn(`Error while attempting to send payload`, errorObject(err))
  }
}

const queueLoop = async () => {
  while (true) {
    await queueHeartbeat()
    await wait(queueState.delay)
    // When the queue has been stopped, continue until the queue is empty and then exit.
    if (!queueState.isRunning && queueIsEmpty()) return
  }
}


/** Initializes the queue. */
const initQueueLoop = () => {
  queueState.isRunning = true
  queueState.ref = queueLoop()
}

/** Pauses the queue loop temporarily. */
const pauseQueueLoop = () => {
  queueState.isPaused = true
}

/** Resumes the queue loop after it's been paused. */
const unpauseQueueLoop = () => {
  queueState.isPaused = false
}

/** Stops the queue permanently. */
const stopQueueLoop = () => {
  queueState.isRunning = false
}

/** Returns whether the queue is empty. This is used when shutting down. */
const queueIsEmpty = () => queueState.items.length === 0

/** Pushes a message to the back of the queue. */
const pushToQueueBack = (msgObj, tries = 0) => queueState.items.push([msgObj, tries])

/** Pushes a message to the front of the queue, for sending next. */
const pushToQueueFront = (msgObj, tries = 0) => queueState.items.unshift([msgObj, tries])

/** Quick sanity check to ensure this payload has content. */
const isValidPayload = payload => payload.channel && payload.payload

// TODO
module.exports = {
  // logger
  system,
  createTaskLogger,
  createTaskMessageSenders,
  initSystemLogger,

  // post
  sendMessage,
  sendLogMessageRaw,
  trySendingPayload,
  //queue
  initQueueLoop,
  pauseQueueLoop,
  unpauseQueueLoop,
  stopQueueLoop,
  pushToQueueBack,
  pushToQueueFront,
  isValidPayload,
  queueIsEmpty
}
