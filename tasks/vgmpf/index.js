// Callisto - callisto-task-vgmpf <https://github.com/msikma/callisto>
// © MIT license

const { findLatestSoundtracks } = require('./task/actions')
const { template, validator } = require('./config')
const { info } = require('./info')

const taskLatestSoundtracks = async (taskConfig, taskServices) => {
  await findLatestSoundtracks(taskConfig, taskServices)
}

const actions = [
  { delay: 1800000, description: 'posts new soundtrack releases from VGMPF', fn: taskLatestSoundtracks }
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
