/**
 * Calypso - calypso-core <https://github.com/msikma/calypso>
 * © MIT license
 */

import { data, initResources } from 'calypso-misc/resources'
import logger, { configureLogger, printLogSize } from 'calypso-logging'
import { dbInitOrExit } from 'calypso-cache'

import { shutdown } from './shutdown'
import { discordInitOrExit } from './discord'
import { checkVersion, bindEmitHandlers, catchAllExceptions } from './logging'
import { startQueueLoop } from './queue'
import { findTasks, findAndRegisterTasks, loadSingleTask } from './task-manager'

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
