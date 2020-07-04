// Callisto - callisto-task-horriblesubs <https://github.com/msikma/callisto>
// © MIT license

const { wait } = require('callisto-core/util/promises')

const { runSearchTask } = require('./task/actions')
const { template, validator } = require('./config')
const { info } = require('./info')

/** Searches HorribleSubs for new torrents. */
const taskSearchTorrents = async (taskConfig, taskServices) => {
  for (const taskData of taskConfig.shows) {
    await runSearchTask(taskData, taskServices)
    await wait(1000)
  }
}

const actions = [
  { delay: 1200000, description: 'find new torrents on HorribleSubs', fn: taskSearchTorrents }
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
