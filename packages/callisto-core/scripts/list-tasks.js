// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

const { die, log } = require('dada-cli-tools/log')
const { fileExists } = require('dada-cli-tools/util/fs')

const { getTasksData } = require('../lib/tasks')

/**
 * Creates a Markdown document string from an array of tasks.
 */
const makeTasksMarkdown = (tasks) => {
  const taskInfo = tasks.map(task => `| ${task.name} | ${task.description}${task.site ? ` | [${task.siteShort}](${task.site}) |` : ' | – |'}`)
  const md = [
    '| Name | Description | Site |',
    '|:-----|:------------|:-----|',
    ...taskInfo
  ]
  return md.join('\n')
}

/**
 * Lists existing tasks in Markdown format.
 * 
 * Returns a number to be used as exit code.
 */
const listTasks$ = async (_, { baseDir }) => {
  const tasksDir = `${baseDir}/tasks`
  const exists = await fileExists(tasksDir)
  if (!exists) {
    return die('could not find tasks directory.')
  }
  const data = await getTasksData(tasksDir)
  const md = makeTasksMarkdown(data.installedTasks)
  log(md)
  return 0
}

module.exports = listTasks$
