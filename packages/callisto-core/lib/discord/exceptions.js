// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

/**
 * Catches all uncaught exceptions.
 *
 * All tasks run within a try/catch block, so they can safely crash.
 * This is for all other cases, and it's very rare for this catch to be triggered.
 */
const catchAllExceptions = () => {
  process.on('uncaughtException', err => handleClientEvent('error', 'Unhandled exception', err))
}

const bindEmitHandlers = () => {

}

/**
 * Handles error events from the client.
 */
const handleClientEvent = (type, desc, err) => {
  // Don't emit anything if it's a temporary error.
  //if (isTemporaryError(err)) return
  // Otherwise, send a message to the error log.
  //getSystemLogger()[type](desc, ...errorObject(err))
}

module.exports = {
  catchAllExceptions,
  bindEmitHandlers,
  handleClientEvent
}
