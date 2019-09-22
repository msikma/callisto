// Callisto - callisto-task-youtube <https://github.com/msikma/callisto>
// © MIT license

const { taskSearchVideos, taskSubVideos } = require('./actions')

const taskInfo = {
  id: 'youtube',
  name: 'Youtube',
  color: 0xff0000,
  icon: 'https://i.imgur.com/rAFBjZ4.jpg'
}

const taskActions = [
  { delay: 480000, description: 'find new videos from Youtube searches', fn: taskSearchVideos },
  { delay: 480000, description: 'find new videos from Youtube subscriptions', fn: taskSubVideos }
]

module.exports = {
  taskInfo,
  taskActions
}
