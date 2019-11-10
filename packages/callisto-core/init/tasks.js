// Callisto - callisto-core <https://github.com/msikma/callisto>
// © MIT license

const { getTasksData, loadTasks } = require('../lib/tasks')
const runtime = require('../state')

const initTasks$ = async (devTask) => {
  const { tasksDir } = runtime
  const tasksData = await getTasksData(tasksDir)
  const tasks = await loadTasks(tasksDara, devTask)
  // TODO
  return
}

module.exports = {
  initTasks$
}
