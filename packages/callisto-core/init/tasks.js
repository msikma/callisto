// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

const { getTasksData, loadTasks } = require('../lib/tasks')
const { system } = require('../lib/discord')
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
    system.logFatal('No tasks could be successfully loaded. The bot will not post any output.')
  }

  // Save the tasks to the runtime variables.
  runtime.tasks = Object.fromEntries(succeededTasks.map(item => [item.task.package.name, item.task]))
  runtime.tasksMeta.failedTasks = Object.fromEntries(failedTasks.map(item => [item.task.package.name, item.task]))
  runtime.tasksMeta.singleTask = devTask ? taskInfo.find(item => item.task.package.name === devTask).task : null
  system.logDebug(['Finished loading tasks', null, { succeededTasks: succeededTasks.length }])
  return
}

module.exports = initTasks$
