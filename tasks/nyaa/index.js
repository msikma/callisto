// Callisto - callisto-task-nyaa <https://github.com/msikma/callisto>
// © MIT license

const { wait } = require('callisto-core/util/promises')

const { runSearchTask } = require('./task/actions')
const { template, validator } = require('./config')
const { info } = require('./info')

/** Searches Nyaa.si for new torrents. */
const taskSearchTorrents = async (taskConfig, taskServices) => {
  for (const taskData of taskConfig.searches) {
    await runSearchTask(taskData, taskServices)
    await wait(1000)
  }
}

const actions = [
  { delay: 1200000, description: 'find new torrents on Nyaa.si', fn: taskSearchTorrents }
]

module.exports = {
  task: {
    info,
    actions
  },
  config: {
    template,
    validator
  }
}
