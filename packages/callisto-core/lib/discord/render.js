// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

const { RichEmbed } = require('discord.js')
const stringWidth = require('string-width')
const chalk = require('chalk')
const util = require('util')
const { isString, isNumber, isBoolean, get, isPlainObject, isDate } = require('lodash')

const { extractErrorInfo } = require('../../util/errors')
const { embedTitle, embedDescription } = require('../../util/richembed')
const { getFormattedTime, getFormattedTimestamp } = require('../../util/time')
const { getConsoleInfo } = require('../../util/console')
const { wrapObject } = require('../../util/formatting')

// Regex used to decorate certain log patterns.
const HTTP_PROTOCOL = new RegExp('^\s?https?://')
const ABS_REL_PATH = new RegExp('^\s?\.?/')

// Whether we format string arguments sent to the Discord logger.
const FORMAT_LOG_PATTERNS = true

/**
 * Returns a RichEmbed object log message to send to Discord.
 */
const renderRichEmbed = (taskInfo, logArgs, logLevel, isSystemLogger = false) => {
  const embed = new RichEmbed()
  if (logArgs.title) embed.setTitle(embedTitle(logArgs.title))
  if (logArgs.desc) embed.setDescription(embedDescription(logArgs.desc))
  if (taskInfo.data.meta.id && isSystemLogger === false) {
    embed.setFooter(`Logged by callisto-task-${taskInfo.data.meta.id}${taskInfo.data.package.version ? ` (${taskInfo.data.package.version})` : ''}`)
  }
  if (logArgs.debug && isPlainObject(debug)) {
    // Print a whole debugging object.
    embed.addField('Debug information', wrapObject(debug), false)
  }
  if (logArgs.error) {
    // Unpack the error and log whatever relevant information we get.
    const fields = extractErrorInfo(logArgs.error)
    Object.values(fields).forEach(field => embed.addField(...field))
  }
  if (logArgs.details && isPlainObject(logArgs.details)) {
    for (const [key, value] of Object.entries(logArgs.details)) {
      // Values shorter than a certain threshold will be displayed inline.
      const isShort = value.length < 30
      embed.addField(`\`${key}\``, value, isShort)
    }
  }
  embed.setAuthor(taskInfo.data.meta.name, taskInfo.data.meta.icon)
  embed.setColor(logLevel[1])
  embed.setTimestamp()

  return embed
}

/**
 * Renders a plain text string log message for the console.
 */
const renderConsole = (taskInfo, logArgs, logLevel, logAsObject, useMultilineDetails = true) => {
  let mainMessage = ''

  if (_isEmptyLogArgs(logArgs)) {
    // If nothing was passed for some reason:
    mainMessage = [logColorizer('(empty)')]
  }
  else if (logArgs.length === 1 && Array.isArray(logArgs[0])) {
    // If this is a [title, description, details] array:
    const [title, description, details] = logArgs[0]
    mainMessage = _renderConsoleObject(taskInfo, title, description, details, null, logLevel, useMultilineDetails)
  }
  else if (logAsObject) {
    const obj = logArgs[0] // Theoretically there could be more but we're ignoring those.
    mainMessage = _renderConsoleObject(taskInfo, obj.title, obj.desc, { ...obj.details, ...obj.debug }, obj.error ? obj.error : null, logLevel, useMultilineDetails)
  }
  else {
    // In normal cases, just cast everything to string.
    mainMessage = logArgs
  }

  return [`${chalk.underline(taskInfo.data.meta.id)}:`, ...mainMessage]
}

/**
 * Does the bulk of the work for renderConsole().
 * 
 * Returns an array with one item.
 */
const _renderConsoleObject = (taskInfo, title, description, details, error, logLevel, useMultilineDetails) => {
  const consoleInfo = getConsoleInfo()
  const hasDetails = details && isPlainObject(details) && Object.keys(details).length > 0

  let message = [
    title ? chalk.bold(title) : '',
    title && description ? ' - ' : '',
    description ? chalk.dim(description) : '',
    (title || description) && hasDetails ? ' - ' : '',
    _renderDetailsConsole(details, true, null, consoleInfo)
  ]
  
  // If we have a details object and we can't fit everything on one line,
  // we'll create an alternate string that lists each detail item on its own line.
  if (useMultilineDetails && hasDetails && stringWidth(message.join('')) >= consoleInfo.width) {
    message = [
      title ? chalk.bold(title) : '',
      title && description ? ' - ' : '',
      description ? chalk.dim(description) : '',
      _renderDetailsConsole(details, false, taskInfo, consoleInfo)
    ]
  }

  // If an error is present, add it at the end in its own separate section.
  if (error) {
    message.push(`\n${error && error.stack ? error.stack : error}`)
  }

  return [message.join('')]
}

/**
 * Returns a string log message in Markdown format to send to Discord.
 */
const renderPlainText = (taskInfo, logArgs, logLevel) => {
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
    // Multiple arguments are separated by a space like console.log().
    mainMessage = logArgs.map(item => _castLogArg(item)).join(' ')
  }

  return `\`${getFormattedTime()}\`: \`${taskInfo.data.meta.id}\`: ${mainMessage}`
}

/**
 * Casts a log segment to Markdown string.
 * 
 * In most cases this just turns it into a string, but in some cases
 * we'll format the string.
 */
const _castLogArg = arg => {
  let s = String(arg)
  if (FORMAT_LOG_PATTERNS && (HTTP_PROTOCOL.test(s) || ABS_REL_PATH.test(s))) {
    s = `\`${s}\``
  }
  return s
}

/**
 * Prefixes lines with either string A (line 1) or string B (line 2 and up).
 */
const _prefixLines = (lines, prefixOne, prefixN) => {
  return lines.map((l, n) => `${n === 0 ? prefixOne : prefixN}${l}`)
}

/**
 * Renders a details key/value object to a single line of text with color escape codes.
 */
const _renderDetailsConsole = (details, singleLine = true, taskInfo = null, consoleInfo = null) => {
  // Get the task ID, e.g. 'callisto' for the system task, to know how much
  // indentation we need for rendering multiline details.
  const taskID = get(taskInfo, 'data.meta.id', '')
  const taskPrefix = ' '.repeat(taskID.length + 2)
  const multilinePrefixA = `${taskPrefix}╰ `
  const multilinePrefixB = `${taskPrefix}  `

  if (!details) return ''
  const buffer = []
  let valueStr
  for (let [key, value] of Object.entries(details)) {
    // This prefix is for strings produced by util.inspect(). It includes the usual prefix, plus the keyword length (plus ': ').
    const multilinePrefixC = `${multilinePrefixB}${' '.repeat(key.length + 2)}`

    if (isString(value))
      valueStr = chalk.green(value)
    else if (isDate(value))
      valueStr = chalk.cyan(getFormattedTimestamp(value))
    else if (isNumber(value))
      valueStr = chalk.magenta(value)
    else if (isBoolean(value))
      valueStr = chalk.red(value)
    else {
      // TODO: I don't know why we need to subtract 12 to make it work.
      // Subtracting 'multilinePrefixC' should be enough.
      valueStr = util.inspect(value, { colors: true, depth: 4, breakLength: singleLine ? Infinity : (consoleInfo.width - multilinePrefixC.length - 12) })
    }

    buffer.push(`${chalk.yellow(key)}: ${_prefixLines(valueStr.split('\n'), '', multilinePrefixC).join('\n')}`)
  }
  return singleLine
    ? chalk.italic(buffer.join(', '))
    : chalk.italic(`\n${_prefixLines(buffer, multilinePrefixA, multilinePrefixB).join('\n')}`)
}
/**
 * Renders a details key/value object to a single line of plain text.
 */
const _renderDetailsPlainText = (details) => {
  const buffer = []
  for (let [key, value] of Object.entries(details)) {
    const valueStr = isString(value) ? value : util.inspect(value, { colors: false, depth: 4, maxStringLength: 400, breakLength: Infinity })
    buffer.push(`${key}: ${valueStr}`)
  }
  return `*${buffer.join(', ')}*`
}

/** Returns whether the given log arguments are empty. */
const _isEmptyLogArgs = logArgs => logArgs.length === 0 || (logArgs.length === 1 && Array.isArray(logArgs[0]) && logArgs[0].length === 0)

module.exports = {
  renderRichEmbed,
  renderConsole,
  renderPlainText
}
