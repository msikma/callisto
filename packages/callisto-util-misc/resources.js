/**
 * Callisto - callisto-util-misc <https://bitbucket.org/msikma/callisto-bot>
 * Copyright © 2018, Michiel Sikma
 */

// Relative link to the base package.
import os from 'os'
import path from 'path'
import { isObject, isArray, isString } from 'lodash'

const baseRe = new RegExp('<%base%>', 'g')
const configRe = new RegExp('<%config%>', 'g')

/**
 * Replaces <%base%> and <%config%> from the configuration file
 * with their proper values. Iterates through the whole config file
 * and changes every string that applies.
 */
const replaceMagic = (obj, baseStr, configStr) => {
  // Note: isArray() must come first...because isObject() returns true for both arrays and objects.
  if (isArray(obj)) {
    return obj.map(o => replaceMagic(o, baseStr, configStr))
  }
  if (isObject(obj)) {
    return Object.keys(obj)
      .reduce((newObj, key) => ({ ...newObj, [key]: replaceMagic(obj[key], baseStr, configStr) }), {})
  }
  if (isString(obj)) {
    return replaceMagicString(obj, baseStr, configStr)
  }
  // Return anything else - probably a number.
  return obj
}

// Handles the actual string replacement.
const replaceMagicString = (str, baseStr, configStr) => (
  str
    .replace(baseRe, baseStr)
    .replace(configRe, configStr)
)

const configDir = path.join(os.homedir(), '.config', 'callisto')
const configFile = path.join(configDir, 'config.js')
const baseDir = process.env.CALLISTO_BASE_DIR
const pkgFile = path.join(baseDir, 'package.json')
const pkg = require(pkgFile)

// Attempt to load the config file.
let rawConfig
try {
  rawConfig = require(configFile)
}
catch (err) {
  // Throw original error if something else went wrong.
  if (err.code !== 'MODULE_NOT_FOUND') throw err
  console.log('callisto.js: error: Could not find the config file.')
  console.log(`Ensure a config file is available at this location: ${configFile}`)
  process.exit(0)
}
const config = {
  // Our config.js file.
  ...replaceMagic(rawConfig, baseDir, configDir),
  CALLISTO_BASE_DIR: process.env.CALLISTO_BASE_DIR
}

export { config, pkg }
