/**
 * Calypso - calypso-core <https://github.com/msikma/calypso>
 * © MIT license
 */

import logger, { configureLogger } from 'calypso-logging'
import mkdirp from 'mkdirp'
import { existsSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { dbInitOrExit } from 'calypso-cache'

import { newConfig } from './config'
import { findTasks, getConfigTemplates } from './task-manager'

// These config items must be set and must not be falsy.
const CONFIG_NECESSITIES = ['CALYPSO_BOT_TOKEN', 'CALYPSO_BOT_CLIENT_ID', 'CALYPSO_BOT_NAME', 'CALYPSO_SETTINGS', 'CALYPSO_TASK_SETTINGS']

/** Checks the config and exits if it isn't valid. */
export const checkConfigOrExit = (path) => {
  const configCorrect = checkConfig(path, true)
  if (!configCorrect) process.exit(1)
}

/**
 * Checks if the config file is correct.
 */
export const checkConfig = (path, quietSuccess = false) => {
  configureLogger()
  try {
    // Check whether this will throw due to a syntax error.
    const cfg = require(path);
    const errIsEmpty = Object.keys(cfg).length > 0

    // Check if any crucial config keys are not filled in.
    const missingItems = CONFIG_NECESSITIES.reduce((all, i) => [...all, !cfg[i] && i], []).filter(i => i)

    if (missingItems.length > 0) {
      logger.error(`Fatal: config file is missing prerequisites: ${missingItems.join(', ')}`)
      return false
    }
    else if (errIsEmpty) {
      logger.error('Fatal: config file exists but is empty')
      return false
    }
    else {
      if (!quietSuccess) logger.info(`Config file has valid syntax: ${path}`)
      return true
    }
  }
  catch (err) {
    const errNotFound = err.code === 'MODULE_NOT_FOUND'
    const errSyntaxError = err.stack.indexOf('ReferenceError') !== -1

    if (errNotFound) {
      logger.error(`Fatal: could not find file: ${path}`)
      return false
    }
    else if (errSyntaxError) {
      logger.error('Fatal: config file contains syntax errors - details follow:\n')
      logger.verbose(err)
      return false
    }
    else {
      logger.error('Fatal: an error occurred while checking the config file - details follow:\n')
      logger.verbose(err)
      return false
    }
  }
}

/**
 * Creates a new config file or database file at a specified path.
 */
export const newSystemFile = async (type, path) => {
  let pathAbs, pathDir

  // When using --new-config with a path, ensure we are able to write there.
  if (path != null) {
    pathAbs = resolve(path)
    pathDir = dirname(pathAbs)
    mkdirp(pathDir)
  }

  if (type === 'db') {
    const result = await dbInitOrExit(pathAbs)
    if (result.exists) {
      logger.error(`Fatal: could not initialize database - file exists: ${result.dbPath}`)
      return
    }
  }
  if (type === 'config') {
    if (pathAbs != null) {
      const exists = existsSync(pathAbs)
      if (exists) {
        logger.error(`Fatal: could not initialize config file - file exists: ${pathAbs}`)
        return
      }
    }
    const { allTasks } = findTasks()
    const configTemplates = getConfigTemplates(allTasks)
    const file = newConfig(configTemplates)
    if (pathAbs != null) {
      writeFileSync(pathAbs, file, 'utf8')
    }
    else {
      console.log(file)
    }
    return
  }
}

/**
 * Entry point used to list the packages we currently support along with a description.
 * The output format is Markdown.
 */
export const listPackages = () => {
  const { allTasks } = findTasks()
  const taskInfo = allTasks.map(task => `| ${task.slug} | ${task.description}${task.site ? ` | [${task.siteShort}](${task.site}) |` : ' | — |'}`)
  const md = [
    '| Name | Description | Site |',
    '|:-----|:------------|:-----|',
    ...taskInfo
  ]
  console.log(md.join('\n'))
  process.exit(0)
}
