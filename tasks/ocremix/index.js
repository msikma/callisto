// Callisto - callisto-task-ocremix <https://github.com/msikma/callisto>
// © MIT license

const { findLatestTracks, findLatestAlbums } = require('./task/actions')
const { template, validator } = require('./config')
const { info } = require('./info')

const taskNewTracks = async (taskConfig, taskServices) => {
  await findLatestTracks(taskConfig, taskServices)
}
const taskNewAlbums = async (taskConfig, taskServices) => {
  await findLatestAlbums(taskConfig, taskServices)
}

const actions = [
  { delay: 240000, description: 'find new single tracks on OCReMix', fn: taskNewTracks },
  { delay: 400000, description: 'find new albums on OCReMix', fn: taskNewAlbums }
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
