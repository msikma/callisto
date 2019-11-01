// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

const checkPropTypes = require('prop-types-checker')
const { readJSON } = require('dada-cli-tools/util/read')

const { configTpl, configModel } = require('./config-tpl')

/**
 * Loads a config file's data and validates its structure.
 */
const validateConfigFile = async configPath => {
  const data = await readJSON(configPath)
  const main = checkMainConfig(data)
}

/**
 * Checks config data to see if it's base structure is valid.
 * This does NOT check the tasks' config.
 */
const checkMainConfig = (configData) => {
  logWarn('Not implemented yet: checkMainConfig()')
  const configSyntax = checkPropTypes()
  return {
    success: true
  }
}

/**
 * Checks the config data for whether it's correct for a specific task.
 * TODO
 */
const checkTaskConfig = async (taskName) => {
  logWarn('Not implemented yet: checkTaskConfig()')
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
  validateConfigFile,
  checkMainConfig,
  checkTaskConfig,
  writeNewConfig
}
