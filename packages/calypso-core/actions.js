/**
 * Calypso - calypso-core <https://github.com/msikma/calypso>
 * © MIT license
 */

import logger from 'calypso-logging'
import mkdirp from 'mkdirp'
import { existsSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { dbInitOrExit } from 'calypso-cache'

import { newConfig } from './config'
import { findTasks, getConfigTemplates } from './task-manager'

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
