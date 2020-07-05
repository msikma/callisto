// Callisto - callisto-task-feed <https://github.com/msikma/callisto>
// © MIT license

const { wait } = require('callisto-core/util/promises')

const { runFeedsTask } = require('./task/actions')
const { template, validator } = require('./config')
const { info } = require('./info')

const taskCheckFeeds = async (taskConfig, taskServices) => {
  for (const taskData of taskConfig.feeds) {
    await runFeedsTask(taskData, taskServices)
    await wait(1000)
  }
}

const actions = [
  { delay: 200000, description: 'retrieves syndicated feed updates', fn: taskCheckFeeds }
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
