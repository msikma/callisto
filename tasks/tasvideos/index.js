// Callisto - callisto-task-tasvideos <https://github.com/msikma/callisto>
// © MIT license

const { findLatestPublications } = require('./task/actions')
const { template, validator } = require('./config')
const { info } = require('./info')

const taskLatestPublications = async (taskConfig, taskServices) => {
  await findLatestPublications(taskConfig, taskServices)
}

const actions = [
  { delay: 480000, description: 'posts new TAS publications on TASVideos', fn: taskLatestPublications }
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
