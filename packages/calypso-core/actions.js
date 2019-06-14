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
  const pathAbs = resolve(path)
  const pathDir = dirname(pathAbs)
  mkdirp(pathDir)

  if (type === 'db') {
    const result = await dbInitOrExit(pathAbs)
    if (result.exists) {
      logger.error(`Fatal: could not initialize database; file exists: ${result.dbPath}`)
      return
    }
  }
  if (type === 'config') {
    const exists = existsSync(pathAbs)
    if (exists) {
      logger.error(`Fatal: could not initialize config file: file exists: ${pathAbs}`)
      return
    }
    const { allTasks } = findTasks()
    const configTemplates = getConfigTemplates(allTasks)
    const file = newConfig(configTemplates)
    writeFileSync(pathAbs, file, 'utf8')
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
