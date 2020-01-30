// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

const { getTasksData, loadTasks } = require('../lib/tasks')
const { system } = require('../lib/logger')
const runtime = require('../state')

const initTasks$ = async (devTask) => {
  const { tasksDir } = runtime
  const tasksData = getTasksData(tasksDir)
  const taskInfo = loadTasks(tasksData.installedTasks, devTask, true)
  const failedTasks = taskInfo.filter(taskItem => !taskItem.success)
  if (failedTasks.length > 0) {
    system.logWarn('Some tasks failed to initialize')
  }
  const succeededTasks = taskInfo.filter(taskItem => taskItem.success)
  if (succeededTasks.length === 0) {
    system.logFatal('No tasks could be loaded. The bot will not post any output.')
  }

  // Filter out the 'success' and 'error' data for the tasks.
  runtime.tasks = tasks;
  return
}

module.exports = initTasks$
