// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

const checkPropTypes = require('prop-types-checker')
const { readJSON } = require('dada-cli-tools/util/read')

const { replaceMagic } = require('./magic')
const { configTpl, configModel } = require('./tpl')
const runtime = require('../../state')

/**
 * Reads the config file and returns its data, with magic strings replaced.
 */
const readConfig = configPath => {
  const { baseDir, cacheDir, configDir } = runtime
  // Note: config file is .js.
  const data = require(configPath)
  return replaceMagic(data, baseDir, configDir, cacheDir)
}

/**
 * Loads a config file's data and validates its structure.
 */
const validateConfigFile = configPath => {
  const data = readConfig(configPath)
  return _validateMainConfig(data)
}

/**
 * Checks config data to see if it's base structure is valid.
 * This does NOT check the tasks' config.
 */
const _validateMainConfig = (configData) => {
  logWarn('Not implemented yet: _validateMainConfig()')
  try {
    const configSyntax = checkPropTypes(configModel, configData.SYSTEM)
    return {
      success: true
    }
  }
  catch (err) {
    return {
      err,
      success: false
    }
  }
}

/**
 * Checks the config data for whether it's correct for a specific task.
 * TODO
 */
const _validateTaskConfig = async (taskName) => {
  logWarn('Not implemented yet: _validateTaskConfig()')
  const configSyntax = checkPropTypes()
  return {
    success: true
  }
}

/**
 * Generates a new config file based on all available tasks' config templates.
 */
const writeNewConfig = (configTemplates) => {
  const padding = '    '
  const config = configTemplates.map(tpl => tpl.configTemplate).join(',\n')
  const configPadded = `${padding}${config.replace(/\n/g, `\n${padding}`)}`
  const mainTpl = configTpl(configPadded)
  return `${mainTpl.trim()}\n`
}

module.exports = {
  readConfig,
  validateConfigFile,
  writeNewConfig
}
