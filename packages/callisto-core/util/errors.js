// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

const { get } = require('lodash')

/**
 * Returns true for errors that are temporary network errors that can safely be ignored.
 */
const isTempError = error => {
  if (!error) return false
  const code = get(error, 'code', '')
  const name = get(error, 'name', '')
  const message = get(error, 'message', '')
  const statusCode = Number(get(error, 'statusCode', 0))

  // Check for a status code if the error comes from a request.
  const okStatusCode = [
    // 500 Internal Server Error
    500,
    // 502 Bad Gateway
    502,
    // 503 Service Unavailable
    503,
    // 504 Gateway Timeout Error (usually ETIMEDOUT)
    504
  ].indexOf(statusCode) > -1

  // Check if the error code is in a list of acceptable errors.
  const okCodeValues = [
    // When the network is temporarily unreachable.
    'ENETUNREACH',
    // When the internet is down.
    'ENETDOWN',
    // Sometimes a not found is returned as temporary error.
    // This MIGHT be permanent, so the logs should be checked for consistency.
    'ENOTFOUND',
    // Temporary network resolution error.
    'ETIMEDOUT',
    // Connection was reset.
    'ECONNRESET'
  ]
  const okCode = okCodeValues.indexOf(code) > -1

  // If this is a RequestError, the same strings can be found in 'message'.
  // E.g. 'Error: connect ETIMEDOUT 151.101.1.28:443'.
  const okMessage = okCodeValues.map(val => message.indexOf(val) > -1).filter(val => val).length > 0

  const okName = [
    // Usually a 503 or something.
    'StatusCodeError'
  ].indexOf(name) > -1

  return okName || okCode || okMessage || okStatusCode
}

module.exports = {
  isTempError
}
