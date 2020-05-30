// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

const { system } = require('./post')
const { getChannelFromPath, findChannelPath } = require('./channels')

/**
 * Sends an error to Discord in case a payload cannot be sent for some reason.
 */
const reportPayloadError = (err, { payload }, tries) => {
  const path = getPathFromError(err)
  system.logErrorObj({
    title: 'Error while sending payload to Discord',
    desc: 'Attempted to send a malformed payload to Discord.',
    debug: payload,
    error: err,
    details: {
      tries,
      ...(path ? { path } : {})
    },
    logOnError: false
  })
}

/**
 * Logs a temporary error at low priority.
 */
const reportPayloadTempError = (err, { payload }, tries) => {
  const path = getPathFromError(err)
  system.logNoticeObj({
    title: 'Temporary error while sending payload to Discord',
    desc: 'The message will be retried.',
    error: err,
    details: {
      tries,
      ...(path ? { path } : {})
    },
    logOnError: false
  })
}

/**
 * For a given payload send error, return the path in the config to the channel
 * that the payload was being sent to.
 */
const getPathFromError = (err) => {
  const channel = getChannelFromPath(err.path)
  return channel ? findChannelPath(channel) : null
}

module.exports = {
  reportPayloadError,
  reportPayloadTempError
}
