// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

const { writeFileSync } = require('fs')
const { get } = require('lodash')
const { fileExists } = require('dada-cli-tools/util/fs')

const { validatePropsModel, reportValidationErrors } = require('./props')
const { replaceMagic } = require('./magic')
const { configTpl, configModel } = require('./tpl')
const runtime = require('../../state')

/**
 * Returns the complete user configuration for a specific task.
 */
const getTaskConfig = (task, config = runtime.config) => {
  return get(config, `taskConfig.${task}`, null)
}

/**
 * Returns the value of a config key.
 */
const getConfigKey = (key, ns = null, config = runtime.config) => {
  const path = `${!ns || ns == null ? 'systemConfig' : `taskConfig.${ns}`}`
  return get(config, `${path}.${key}`, null)
}

/**
 * Reads the contents of a config file.
 * 
 * If the config file cannot be read for some reason, null is returned;
 * otherwise, an object with the config content is returned.
 * 
 * TODO: run the JS file in a separate VM instance.
 */
const readConfigFile = configPath => {
  let success = true
  let exists = true
  let content = null
  let error = null

  try {
    content = require(configPath)
  }
  catch (err) {
    error = err
    success = false
    exists = err.code === 'MODULE_NOT_FOUND'
  }

  return {
    success,
    exists,
    error,
    data: content
  }
}

/**
 * Reads the config file and returns its data, with magic strings replaced.
 */
const readConfig = configPath => {
  const { baseDir, cacheDir, configDir } = runtime
  const result = readConfigFile(configPath)
  return {
    ...result,
    data: result.success ? replaceMagic(result.data, baseDir, configDir, cacheDir) : null
  }
}

/**
 * Loads a config file's data and validates its structure.
 */
const validateConfigFile = configPath => {
  const config = readConfig(configPath)
  return validateConfigData(config.data)
}

/**
 * Validates the data of a loaded config file.
 */
const validateConfigData = configData => {
  return validatePropsModel(configModel, configData)
}

/**
 * Generates a new config file and saves it to a given location.
 */
const writeNewConfig = async (configPath, tasks) => {
  let exists = await fileExists(configPath)
  let success = false
  let error = null

  if (!exists) {
    try {
      const tplFns = tasks.map(taskData => taskData.data.config.template)
      const configContent = generateNewConfig(tplFns)
      writeFileSync(configPath, configContent)
      success = await fileExists(configPath)
    }
    catch (err) {
      error = err
    }
  }
  return {
    success,
    error,
    exists
  }
}

/**
 * Generates a new config object based on all available tasks' config templates.
 */
const generateNewConfig = tplFns => {
  const padding = '    '
  const configContent = tplFns.map(tplFn => tplFn()).join(',\n')
  const configPadded = `${padding}${configContent.replace(/\n/g, `\n${padding}`)}`
  const mainTpl = configTpl(configPadded)
  return `${mainTpl.trim()}\n`
}

module.exports = {
  getConfigKey,
  getTaskConfig,
  readConfig,
  reportValidationErrors,
  validateConfigData,
  validateConfigFile,
  writeNewConfig,
  validatePropsModel
}
