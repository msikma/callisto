// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

const { logWarn } = require('dada-cli-tools/log')
const checkPropTypes = require('prop-types-checker')
const { system } = require('../discord')

/**
 * Validates a given props model for e.g. a configuration object.
 * 
 * Returns the following type of object:
 * 
 * { success: false,
 *   props: ...,
 *   propTypes: ...,
 *   errors:
 *    { config:
 *       { error: 'Invalid prop `config.validator` of type `object` supplied to `Object`, expected `function`.',
 *         isInvalidValidator: false,
 *         isException: false } } }
 * 
 * See 'prop-types-checker' for more information.
 */
const validatePropsModel = (configModel, configData) => {
  return checkPropTypes(configModel, configData)
}

/**
 * Reports the errors for a failed config validation.
 * 
 * If 'consoleOnly' is true, messages are logged to the console only instead of to Discord.
 * This is used for CLI scripts.
 */
const reportValidationErrors = (validationResult, consoleOnly = false) => {
  const logFn = consoleOnly ? logWarn : system.logWarn
  for (const [key, result] of Object.entries(validationResult.errors)) {
    // Note: result.isException is true in case an exception occurred during validation.
    logFn(`Error in prop "${key}": ${result.error}`)
  }
}

module.exports = {
  validatePropsModel,
  reportValidationErrors
}
