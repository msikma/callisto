// Callisto - callisto-task-youtube <https://github.com/msikma/callisto>
// © MIT license

const { wait } = require('callisto-core/util/promises')

const { runSearchTask, runSubscriptionTask } = require('./task/actions')
const { template, validator } = require('./config')
const { info } = require('./info')

/** Searches for new videos from search results. */
const taskSearchVideos = async (taskConfig, taskServices) => {
  for (const taskData of taskConfig.searches) {
    await runSearchTask(taskData, taskServices)
    await wait(1000)
  }
}

/** Searches for new videos from subscriptions. */
const taskSubscriptionVideos = async (taskConfig, taskServices) => {
  for (const taskData of taskConfig.subscriptions) {
    await runSubscriptionTask(taskData, taskServices)
    await wait(1000)
  }
}

const actions = [
  { delay: 480000, description: 'find new videos from Youtube searches', fn: taskSearchVideos },
  { delay: 480000, description: 'find new videos from Youtube subscriptions', fn: taskSubscriptionVideos }
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
