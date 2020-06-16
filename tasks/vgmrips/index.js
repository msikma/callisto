// Callisto - callisto-task-vgmrips <https://github.com/msikma/callisto>
// © MIT license

const { findLatestAdditions } = require('./task/actions')
const { template, validator } = require('./config')
const { info } = require('./info')

const taskLatestAdditions = async (taskConfig, taskServices) => {
  await findLatestAdditions(taskConfig, taskServices)
}

const actions = [
  { delay: 1800000, description: 'posts about the latest new soundtracks on VGMRips', fn: taskLatestAdditions }
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
