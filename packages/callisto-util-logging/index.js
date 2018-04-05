/**
 * Callisto - callisto-util-logging <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

import winston, { createLogger, transports, format } from 'winston'
import chalk from 'chalk'
import mkdirp from 'mkdirp'

let configuredLogger = false

// Colors that correspond to logging levels.
const levelColors = {
  error: chalk.red,
  warn: chalk.yellow,
  info: chalk.blue,
  verbose: chalk.white,
  debug: chalk.gray,
  silly: chalk.gray
}

// Formats a message for the console. All it does is add a color depending on severity.
const consoleFormat = format.printf(info => (
  levelColors[info.level](info.message)
))

const fileLogger = createLogger({
  level: 'debug',
  format: format.combine(
    format.timestamp(),
    format.json(),
  ),
  transports: [],
  exitOnError: false
})
const consoleLogger = createLogger({
  level: 'verbose',
  format: consoleFormat,
  transports: [new transports.Console()],
  exitOnError: false
})

const log = (verbosity) => (arg) => {
  fileLogger[verbosity](arg)
  consoleLogger[verbosity](arg)
}

/**
 * Mimic the Winston logger interface.
 * TODO: surely there's a better way to do this?
 */
const logger = {
  error: log('error'),
  warn: log('warn'),
  info: log('info'),
  verbose: log('verbose'),
  debug: log('debug'),
  silly: log('silly')
}

/**
 * Sets up the logger by creating the log directory and then sending
 * errors to a specific error file, and everything else to a combined log file.
 */
export const configureLogger = (baseDir) => {
  // Only configure the logger once.
  if (configuredLogger) throw TypeError('Can\'t configure the logger a second time.')

  // Ensure that the logging directory exists.
  const errBase = `${baseDir}/logs`
  mkdirp(errBase)

  // Write errors to the specific error.log file, and all levels to combined.log.
  fileLogger
    .add(new winston.transports.File({ filename: `${errBase}/error.log`, level: 'error' }))
    .add(new winston.transports.File({ filename: `${errBase}/combined.log` }))

  configuredLogger = true
}

export default logger
