// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

const { isTempError } = require('../../util/errors')
const { system } = require('./post')

/**
 * Catches all uncaught exceptions.
 *
 * All tasks run within a try/catch block, so they can safely crash.
 * This is for all other cases, and it's very rare for this catch to be triggered.
 */
const catchAllExceptions = () => {
  process.on('uncaughtException', err => handleClientEvent('Fatal', 'Unhandled exception', err))
}

/**
 * Binds error and warn events to the system logger.
 */
const bindEmitHandlers = (client) => {
  client.on('error', err => handleClientEvent('Error', 'Unhandled error', err))
  client.on('warn', err => handleClientEvent('Warn', 'Unhandled warning', err))
}

/**
 * Handles error and warn events from the client.
 */
const handleClientEvent = (type, desc, err) => {
  // Don't emit anything if it's a temporary error.
  if (isTempError(err)) return

  // Otherwise, send a message to the error log.
  const logFn = system[`log${type}Obj`] || system.logErrorObj
  const typeStr = type === 'warn' ? 'Warning' : 'Error'

  logFn({
    title: `${typeStr} emitted by client`,
    desc,
    error: err
  })
}

module.exports = {
  catchAllExceptions,
  bindEmitHandlers,
  handleClientEvent
}
