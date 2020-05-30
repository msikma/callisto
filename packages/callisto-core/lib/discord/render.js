// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

const { RichEmbed } = require('discord.js')
const chalk = require('chalk')
const util = require('util')
const { isString } = require('lodash')
const { unpackError } = require('dada-cli-tools/util/error')

const { embedTitle, embedDescription } = require('../../util/text')
const { getFormattedTime } = require('../../util/time')
const { wrapStack, wrapObject } = require('../../util/formatting')

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
  if (taskInfo.meta.id && isSystemLogger === false) {
    embed.setFooter(`Logged by callisto-task-${taskInfo.meta.id}${taskInfo.package.version ? ` (${taskInfo.package.version})` : ''}`)
  }
  if (logArgs.debug && isPlainObject(debug)) {
    // Print a whole debugging object.
    embed.addField('Debug information', wrapObject(debug), false)
  }
  if (logArgs.error) {
    // Unpack the error and log whatever relevant information we get.
    const { name, code, stack, oneLiner } = unpackError(logArgs.error)
    if (name) embed.addField('Name', name, true)
    if (code) embed.addField('Code', `\`${code}\``, true)
    if (stack) embed.addField('Stack', wrapStack(stack.join('\n')), false)
    if (!name && !code && !stack && oneLiner) {
      embed.addField('Details', wrapStack(oneLiner), false)
    }
  }
  if (logArgs.details && isPlainObject(logArgs.details)) {
    for (const [key, value] of Object.entries(logArgs.details)) {
      // Values shorter than a certain threshold will be displayed inline.
      const isShort = value.length < 30
      embed.addField(key, value, isShort)
    }
  }
  embed.setAuthor(taskInfo.meta.name, taskInfo.meta.icon)
  embed.setColor(logLevel[1])
  embed.setTimestamp()

  return embed
}

/**
 * Renders a plain text string log message for the console.
 */
const renderConsole = (taskInfo, logArgs, logLevel) => {
  let mainMessage = ''

  if (_isEmptyLogArgs(logArgs)) {
    // If nothing was passed for some reason:
    mainMessage = [logColorizer('(empty)')]
  }
  else if (logArgs.length === 1 && Array.isArray(logArgs[0])) {
    // If this is a [title, description, details] array:
    const [title, description, details] = logArgs[0]
    mainMessage = [[
      title ? chalk.bold(title) : '',
      title && description ? ' - ' : '',
      description ? chalk.dim(description) : '',
      (title || description) && details ? ' - ' : '',
      details ? _renderDetailsConsole(details) : ''
    ].join('')]
  }
  else {
    // In normal cases, just cast everything to string.
    mainMessage = logArgs
  }

  return [`${chalk.underline(taskInfo.meta.id)}:`, ...mainMessage]
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

  return `\`${getFormattedTime()}\`: \`${taskInfo.meta.id}\`: ${mainMessage}`
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
  renderRichEmbed,
  renderConsole,
  renderPlainText
}
