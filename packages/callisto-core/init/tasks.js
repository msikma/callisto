// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

const { getTasksData, loadTasks, activateTasks } = require('../lib/tasks')
const { system } = require('../lib/discord')
const runtime = require('../state')

/**
 * Loads tasks.
 * 
 * The tasks are not started up yet. That happens after the bot is fully initialized.
 */
const initTasks$ = async (devTask) => {
  const { tasksDir } = runtime
  const tasksData = getTasksData(tasksDir)
  const taskInfo = loadTasks(tasksData.installedTasks, devTask, true)
  const failedTasks = taskInfo.filter(taskItem => !taskItem.success)
  if (failedTasks.length > 0) {
    system.logWarn('Some tasks failed to initialize')
  }
  const succeededTasks = taskInfo.filter(taskItem => taskItem.success && taskItem.isDeactivated === false)
  if (succeededTasks.length === 0) {
    system.logFatal('No tasks could be successfully loaded. The bot will not post any output.')
  }

  // Save tasks to the state variable.
  runtime.tasks = Object.fromEntries(succeededTasks.map(item => [item.data.package.name, item]))
  runtime.tasksMeta.failedTasks = Object.fromEntries(failedTasks.map(item => [item.data.package.name, item]))
  runtime.tasksMeta.singleTask = devTask ? taskInfo.find(item => item.data.package.name === devTask) : null
  system.logDebug(['Finished loading tasks', null, { succeededTasks: succeededTasks.length }])
}

module.exports = initTasks$
