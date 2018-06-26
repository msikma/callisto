/**
 * Callisto - callisto-util-misc <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import TurndownService from 'turndown'
import rssParser from 'parse-rss'
import vm from 'vm'
import util from 'util'
import moment from 'moment'
import { isNil, omit, omitBy } from 'lodash'
import { exec } from 'child_process'
import humanizeDuration from 'humanize-duration'
import momentDurationFormatSetup from 'moment-duration-format'
import cheerio from 'cheerio'

import { config, pkg } from './resources'

let callistoName

// Used to match @mentions in numerical form.
const mentions = new RegExp('<@[0-9]+>', 'g')
// Splits up commands by whitespace.
const split = new RegExp('\\S+', 'g')

// Extend Moment to be able to format durations.
// See <https://github.com/jsmreese/moment-duration-format>.
momentDurationFormatSetup(moment)

/**
 * Returns Markdown from HTML.
 */
export const htmlToMarkdown = (html, removeEmpty = false, removeScript = true, removeStyle = true, removeHr = false, removeImages = true) => {
  // Set up the Turndown service for converting HTML to Markdown.
  const turndownService = new TurndownService()
  if (removeScript) turndownService.remove('style')
  if (removeStyle) turndownService.remove('script')
  const $ = cheerio.load(`<div id="callisto-wrapper">${html}</div>`)
  const $html = $('#callisto-wrapper')
  if (removeImages) {
    $html.find('img').remove()
  }
  if (removeHr) {
    $html.find('hr').remove()
  }
  const md = turndownService.turndown($html.html()).trim()
  return removeEmpty ? removeEmptyLines(md) : md
}

/**
 * Separate images from Markdown. We can't display them on Discord.
 * This returns the Markdown text with all image tags removed, and the image tags separately.
 */
export const separateMarkdownImages = (md, leavePlaceholder = false) => {
  // Matches images, e.g.: ![alt text](https://i.imgur.com/asdf.jpg title text)
  // Or: ![alt text](https://i.imgur.com/asdf.jpg)
  const imgRe = /!\[(.+?)\]\(([^ ]+)( (.+?))?\)/g
  const images = []
  let match
  while ((match = imgRe.exec(md)) !== null) {
    images.push({ alt: match[1], url: match[2], title: match[4] })
  }
  return {
    images,
    text: removeEmptyLines(md.replace(imgRe, leavePlaceholder ? '[image]' : ''), true)
  }
}

// Removes extra empty lines by trimming every line, then removing the empty strings.
// If 'leaveGap' is true, we will instead compress multiple empty lines down to a single empty line.
export const removeEmptyLines = (str, leaveGap = false) => {
  if (leaveGap) {
    const split = str.split('\n').map(l => l.trim())
    const lines = split.reduce((acc, curr) => [...acc, ...(curr === acc[acc.length - 1] ? [] : [curr])], [])
    return lines.join('\n')
  }
  else {
    return str.split('\n').map(l => l.trim()).filter(l => l !== '').join('\n')
  }
}

/**
 * Retrieves information about the system that the code is currently running on.
 */
export const getSystemInfo = async () => {
  const [branch, hash, hashFull, commits, server] = await Promise.all([
    callExternal('git describe --all | sed s@heads/@@'),
    callExternal('git rev-parse --short head'),
    callExternal('git rev-parse head'),
    callExternal('git rev-list head --count'),
    callExternal('uname -n')
  ])
  const commitLink = callistoCommitURL(hashFull)

  return {
    formatted: `${branch}-${commits}`,
    branch,
    hash,
    hashFull,
    commits,
    server,
    commitLink
  }
}

// Export slugify directly.
export { default as slugify } from 'slugify'

/**
 * Returns a formatted date.
 */
export const getFormattedDate = (dateObject) => (
  moment(dateObject).format('MMMM D, YYYY')
)

/**
 * Returns a timestamp for a date string.
 */
export const getIntegerTimestamp = (dateStr) => (
  moment(dateStr).format('x')
)

/**
 * Returns an exact duration.
 */
export const getExactDuration = (seconds) => (
  moment.duration({ seconds }).format()
)

/**
 * Returns a duration, e.g. '1 day, 43 minutes, 31 seconds'
 */
export const getDuration = (time) => (
  humanizeDuration(time, { round: true })
)

/**
 * Returns a simplified humanized duration, e.g. '1 hour'.
 */
export const getSimpleDuration = (time) => (
  moment.duration(time).humanize()
)

/**
 * Simply returns a timestamp in the format '2018-05-23 01:09:21 +0200'.
 */
export const getFormattedTime = () => (
  moment().format('Y-MM-DD HH:mm:ss ZZ')
)

/**
 * Returns a string representing an object (or array).
 * This is a better way to print objects than JSON.stringify().
 */
export const objectInspect = (obj, noNil = false) => (
  util.inspect(noNil ? removeNil(obj) : obj, { showHidden: false, depth: 6 })
)

/**
 * Removes null and undefined from objects.
 * Useful for cleaning up objects before printing/inspecting them.
 */
export const removeNil = (obj) => (
  omitBy(obj, isNil)
)

/**
 * Remove the values from an object that are the same in another object.
 * Useful for removing the default values from a configuration object that extended the defaults.
 */
export const removeDefaults = (details, defaults) => (
  omit(details, Object.keys(details).filter(n => details[n] === defaults[n]))
)

/**
 * Calls an external program and returns the result.
 */
const callExternal = (cmd) => (
  new Promise((resolve, reject) => {
    exec(cmd, (error, stdout = '', stderr = '') => {
      if (error) return reject(stdout.trim(), stderr.trim(), error)
      else resolve(stdout.trim(), stderr.trim())
    })
  })
)

// Links to a commit URL.
export const callistoCommitURL = hash => `${pkg._callisto_commit_url}${hash}`

/**
 * Promisified version of setInterval() for use with await.
 * Use like: await wait(1000) to halt execution 1 second.
 */
export const wait = (ms) => (
  new Promise((resolve) => (
    setInterval(() => resolve(), ms)
  ))
)

/**
 * Limits a string to a specific length. Adds ellipsis if it exceeds.
 */
const limitString = (value) => (str) => (
  str.length > value ? `${str.substr(0, value - 3)}...` : str
)

export const embedTitle = limitString(256)
export const embedDescription = limitString(2048)
// Like embedDescription, but with a bit of extra room for formatting.
export const embedDescriptionShort = limitString(2000)

/**
 * Runs a script inside of a sandboxed VM to extract its data.
 */
export const findScriptData = (scriptContent) => {
  try {
    const sandbox = { window: {} }
    const script = new vm.Script(scriptContent)
    const ctx = new vm.createContext(sandbox) // eslint-disable-line new-cap
    const value = script.runInContext(ctx)
    return {
      value,
      sandbox
    }
  }
  catch (e) {
    throw new Error(`Could not extract script data: ${e}`)
  }
}

/**
 * Returns a promise which, upon resolution, contains the contents of the RSS found at the given URL.
 */
export const rssParse = (url) => new Promise((resolve, reject) => {
  rssParser(url, (err, rss) => {
    if (err) return reject(err, rss)
    if (rss) return resolve(rss)
  })
})

/**
 * Sets the bot name. We will use this to respond to messages.
 */
export const registerBotName = (name) => {
  callistoName = name
}

/**
 * Renders a list of usage strings for all accepted command formats.
 */
export const showCommandHelp = (identifier, formats) => (
  `The following commands are accepted:\n\n${formats.map(
    f => `**${f[0]}** - ${formatUsage(identifier, f)}\n${f[3]}\n`
  ).join('\n')}`
)

/**
 * Displays command usage for a command format.
 */
export const showCommandUsage = (identifier, command, formats) => {
  const matchingFormat = getMatchingFormat(command)
  return `Usage: ${formatUsage(identifier, matchingFormat)}`
}

/**
 * Renders a usage string for a specific command.
 *
 * E.g. ['add', ['keyword'], ['category', 'maxPrice']] will show:
 * !Callisto mandarake add :keyword [:category [:maxPrice]]
 */
const formatUsage = (identifier, format) => {
  const reqArgs = format[1].map(name => `__:${name}__`).join(' ')
  const optArgs = `${format[2].map(name => `[__:${name}__`).join(' ')}${']'.repeat(format[2].length)}`
  return `@${callistoName} ${identifier} ${format[0]} ${[reqArgs, optArgs].join(' ').trim()}`
}

/**
 * Parses a message to see if there's an actionable command in there.
 *
 * The 'formats' parameter should be an array of accepted command formats.
 * A format itself is an array with 0: the command name, 1: required named arguments, 2: optional named arguments.
 * An example formats array:
 *
 *     const formats = [
 *       // Add a new item to the search query.
 *       ['add', ['name'], ['category', 'maxPrice']],
 *       // List all search queries.
 *       ['list'],
 *       // Remove a search query by ID (see 'list' for IDs).
 *       ['remove', ['id']]
 *     ]
 *
 * Returns { success: false } if no suitable command was found. If the command was found, but the format was invalid,
 * we will return { success: false, name: 'name_of_command' }. If the command was successfully parsed,
 * we will return { success: true, name: 'name_of_command', requiredArguments, optionalArguments, matchingFormat }.
 */
export const parseCommand = (identifier, formats, message) => {
  // Strip out all mentions. Assumed we have the regular content with mentions in numerical form.
  const msg = message.replace(mentions, '').trim()

  // Cut the remainder into an array of words so we can identify what command we need to run.
  const bits = msg.match(split)
  if (!bits) return false
  if (bits[0] !== identifier) return false

  // Find the matching command format.
  const matchingFormat = getMatchingFormat(bits[1], formats)
  if (!matchingFormat) return [false]

  // Check to ensure we have enough arguments. If not, return the name of the command the user was trying to run.
  // We can then display usage information for that command.
  if (bits.length < matchingFormat[1].length + 2) return [false, matchingFormat[0]]

  // Retrieve required arguments and optional arguments from the remainder of the command.
  const reqArgs = matchingFormat[1].reduce(reduceCommandArguments(bits, 2), {})
  const optArgs = matchingFormat[2].reduce(reduceCommandArguments(bits, 2 + matchingFormat[1].length), {})

  return { success: true, name: matchingFormat[0], reqArgs, optArgs, matchingFormat }
}

/**
 * Returns the matching format for a command name.
 */
const getMatchingFormat = (command, formats) => formats.filter(f => f[0].match(new RegExp(command), 'i'))[0]

/**
 * Matches a command with the list of required and optional arguments expected for the format.
 */
const reduceCommandArguments = (command, offset) => (acc, key, n) =>
  (command.length >= n + offset ? { ...acc, [key]: command[n + offset] } : acc)
