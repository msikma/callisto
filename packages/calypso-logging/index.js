/**
 * Calypso - calypso-logging <https://github.com/msikma/calypso>
 * © MIT license
 */

import winston, { createLogger, transports, format } from 'winston'
import chalk from 'chalk'
import mkdirp from 'mkdirp'
import { basename } from 'path'
import filesize from 'file-size'
import { statSync } from 'fs'
import { isObject, isArray, isString, zipObject } from 'lodash'

import { getSystemLogger } from 'calypso-core/logging'
import { objectInspect } from 'calypso-misc'

import { logLevels } from './severity'
export { default as severity } from './severity'

let configuredLogger = false

// Colors that correspond to logging levels.
const levelConsoleColors = {
  error: chalk.red,
  warn: chalk.yellow,
  info: chalk.blue,
  verbose: chalk.white,
  debug: chalk.gray,
  silly: chalk.gray
}

// Formats a message for the console. All it does is add a color depending on severity.
const consoleFormat = format.printf(info => (
  levelConsoleColors[info.level](info.message)
))

// Logs to text files.
const fileLogger = createLogger({
  level: 'debug',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [],
  exitOnError: false
})

// Logs to console with the lines colorized according to verbosity.
const consoleLogger = createLogger({
  level: 'verbose',
  format: consoleFormat,
  transports: [new transports.Console()],
  exitOnError: false
})

/**
 * Returns a loggable string for any object. If what we want to log is an object or array,
 * we'll run the inspector on it to generate a string of its contents.
 *
 * We return the generated string and a 'type' string. This is 'string' if the given object
 * was a string, and 'object' otherwise. This tells the logger to display the object
 * as a monospaced code block later on.
 */
const logObjectToString = (object) => {
  if (isString(object)) {
    return { string: object, type: 'string' }
  }
  else if (isObject(object) || isArray(object)) {
    return { string: objectInspect(object), type: 'object' };
  }
}

/**
 * Helper function for logging messages.
 * This passes on whatever we want to log to both the fileLogger and consoleLogger.
 */
const log = (verbosity) => (object) => {
  const info = logObjectToString(object)
  if (configuredLogger) {
    fileLogger[verbosity](info.string)
    consoleLogger[verbosity](info.string)
  }
  else {
    // If the logger isn't initialized yet, log to console.
    console.log(info.string)
  }
}

/**
 * Mimic the Winston logger interface. This creates an object with a function for each log level.
 * E.g. logger.error('string'), logger.verbose('string'), etc.
 */
const logger = zipObject(logLevels, logLevels.map(l => log(l)))

// Logs the size of both logs.
export const printLogSize = (baseDir) => {
  const errBase = `${baseDir}/logs`
  const logs = [`error.log`, `combined.log`].sort()
  const logSizes = logs.map(f => `${basename(f)}: ${filesize(statSync(`${errBase}/${f}`).size).human()}`)
  getSystemLogger().verbose('Current log file sizes:', `${logSizes.join('; ')}`)
}

/**
 * Sets up the logger by creating the log directory and then sending
 * errors to a specific error file, and everything else to a combined log file.
 * 'consoleLevel' sets the logging level for the console only.
 */
export const configureLogger = (baseDir, consoleLevel = 'verbose', logToFile = true) => {
  // Only configure the logger once.
  if (configuredLogger) return

  if (logToFile) {
    // Ensure that the logging directory exists.
    const errBase = `${baseDir}/logs`
    mkdirp(errBase)

    // Write errors to the specific error.log file, and all levels to combined.log.
    fileLogger
      .add(new winston.transports.File({ filename: `${errBase}/error.log`, level: 'error' }))
      .add(new winston.transports.File({ filename: `${errBase}/combined.log` }))
  }

  // Set console logging level. 'verbose' by default.
  consoleLogger.transports[0].level = consoleLevel
  configuredLogger = true
}

export default logger
