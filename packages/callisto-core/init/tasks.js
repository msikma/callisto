// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

const { getTasksData, loadTasks } = require('../lib/tasks')
const runtime = require('../state')

const initTasks$ = async (devTask) => {
  const { tasksDir } = runtime
  const tasksData = getTasksData(tasksDir)
  const tasks = loadTasks(tasksData.installedTasks, devTask)
  runtime.tasks = tasks;
  return
}

module.exports = initTasks$
